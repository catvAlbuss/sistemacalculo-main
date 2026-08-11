// resources/js/cad/mixins/grids/plan-import.js
//
// Importar un plano DXF como FONDO + puntos de snap en la vista de planta
// (pensado para la Base: ahí defines las líneas de referencia una sola vez
// y luego dibujas vigas/columnas/losas encima). El parseo real vive en
// engine/dxfImport.js (función pura); este mixin solo orquesta: abre el
// modal, guarda el resultado en this.importedPlan, y expone
// mostrar/ocultar/quitar. El renderer (canvas2d/renderer.js) dibuja los
// segmentos; el snap de planta (reference-grid.js updatePlanGridSnap) lee
// this.importedPlan.vertices.
import { parseDxfPlan, dwgToDxfText } from "../../engine/dxfImport.js";

// Índice espacial (grilla de celdas) de los vértices del plano importado.
// Un DWG/DXF arquitectónico real, tras expandir bloques y teselar arcos,
// puede tener miles de vértices — escanearlos TODOS en cada mousemove (como
// hacía antes getNearestImportedPlanVertexSnap) freezaba el navegador. Con
// este índice solo se revisan los vértices de la celda del mouse y sus
// vecinas. cellSize se elige a partir del tamaño del plano (~100 celdas de
// ancho) para que se adapte a cualquier escala/unidad.
export function buildVertexSpatialIndex(vertices, bounds) {
  const width = bounds ? Math.max(bounds.maxX - bounds.minX, 0.001) : 100;
  const cellSize = Math.max(width / 100, 0.05);
  const index = new Map();

  vertices.forEach((v, i) => {
    const key = `${Math.floor(v.x / cellSize)}:${Math.floor(v.y / cellSize)}`;
    let bucket = index.get(key);
    if (!bucket) {
      bucket = [];
      index.set(key, bucket);
    }
    bucket.push(i);
  });

  return { index, cellSize };
}

export const planImportMixin = {
  openImportPlanDialog() {
    window.dispatchEvent(new CustomEvent("open-import-plan-modal", {
      detail: { current: this.importedPlan ? { fileName: this.importedPlan.fileName } : null },
    }));
  },

  /**
   * Aplica el plano leído por el modal. Para .dxf el modal manda `text`; para
   * .dwg (binario) manda `buffer` (ArrayBuffer) y aquí lo convertimos a DXF con
   * LibreDWG (WASM, carga diferida) antes de parsear. Async por eso.
   * @param {{kind?:string, text?:string, buffer?:ArrayBuffer, unitToMeters:number, fileName:string, opacity:number}} v
   */
  async applyImportedPlanFromModal(v) {
    const isDwg = v.kind === "dwg" || /\.dwg$/i.test(v.fileName || "");

    let dxfText = v.text;
    if (isDwg) {
      try {
        this.showMessage?.("Convirtiendo DWG a DXF (LibreDWG)… puede tardar unos segundos.", "info");
        dxfText = await dwgToDxfText(v.buffer);
      } catch (error) {
        console.warn("No se pudo convertir el DWG:", error);
        this.showMessage?.("No se pudo convertir el DWG. Prueba exportarlo a DXF desde tu CAD (Guardar como → DXF).", "warning");
        return;
      }
    }

    if (!dxfText) {
      this.showMessage?.("No se recibió contenido del archivo.", "warning");
      return;
    }

    let parsed;
    try {
      parsed = parseDxfPlan(dxfText, v.unitToMeters);
    } catch (error) {
      console.warn("No se pudo parsear el DXF:", error);
      this.showMessage?.("No se pudo leer el archivo. Verifica que sea un DXF/DWG válido.", "warning");
      return;
    }

    if (!parsed.segments.length) {
      this.showMessage?.("El archivo no tiene líneas ni polilíneas reconocibles (LINE / LWPOLYLINE / POLYLINE).", "warning");
      return;
    }

    this.saveUndoState?.("Importar plano");
    const { index: vertexIndex, cellSize: vertexIndexCellSize } = buildVertexSpatialIndex(parsed.vertices, parsed.bounds);
    this.importedPlan = {
      fileName: v.fileName || "plano.dxf",
      unitToMeters: Number(v.unitToMeters) || 1,
      opacity: Number(v.opacity ?? 0.5),
      visible: true,
      segments: parsed.segments,
      vertices: parsed.vertices,
      vertexIndex,
      vertexIndexCellSize,
      bounds: parsed.bounds,
    };

    // Encuadrar la vista sobre el plano recién importado: sus coordenadas
    // pueden venir en cualquier escala/origen, así que sin esto "no se ve nada"
    // (queda microscópico o fuera de cuadro). El fondo solo se dibuja en la
    // planta Base, así que solo tiene sentido encuadrar ahí.
    if (this.isBasePlanViewActive() && this.grid && parsed.bounds) {
      this.grid.zoomToWorldBounds(parsed.bounds);
    }

    this.redraw?.();

    const scopeHint = this.isBasePlanViewActive()
      ? ""
      : " Cambia a la vista Planta - Base para verlo de fondo.";
    const c = parsed.counts;
    this.showMessage?.(
      `Plano "${this.importedPlan.fileName}" importado: ${parsed.segments.length} segmento(s) ` +
      `(${c.line} líneas, ${c.polyline} polilíneas, ${c.arc} arcos, ${c.circle} círculos, ` +
      `${c.insert} bloques), ${parsed.vertices.length} vértice(s) de snap.` + scopeHint,
    );
  },

  toggleImportedPlanVisibility() {
    if (!this.importedPlan) return;
    this.importedPlan.visible = !this.importedPlan.visible;
    this.redraw?.();
  },

  setImportedPlanOpacity(opacity) {
    if (!this.importedPlan) return;
    this.importedPlan.opacity = Math.max(0.1, Math.min(1, Number(opacity) || 0.5));
    this.redraw?.();
  },

  clearImportedPlan() {
    if (!this.importedPlan) return;
    this.saveUndoState?.("Quitar plano importado");
    this.importedPlan = null;
    this.redraw?.();
    this.showMessage?.("Plano importado eliminado.");
  },

  // El plano importado SIEMPRE representa la Base para el usuario — no debe
  // depender de que ya exista una grilla/piso armado (viewSet puede estar
  // vacío, a medio construir, o con activeViewIndex desincronizado de
  // activeStory). Por eso, en vez de exigir positivamente "estoy en la
  // planta Base", excluimos solo los casos donde con certeza NO corresponde
  // (piso superior ya generado, o vista de elevación) y todo lo demás cuenta
  // como Base — incluido el modelo recién importado sin grilla todavía.
  isBasePlanViewActive() {
    const view = this.viewSet?.[this.activeViewIndex];

    if (view?.type === "elevation") return false;
    if (view?.type === "plan" && Number(view.storyId) > 0) return false;

    return true;
  },
};
