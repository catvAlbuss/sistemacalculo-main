// Acceso del agente al dibujo abierto: dibujar primitivas y leer resúmenes
// compactos. Recibe el documento y el módulo de datos para poder probarse en Node.

import {drawPrimitives, unitsPerMeter} from "./cadExecutor.js";
import {segmentosDesdeEntidades} from "../diseno/estructura.js";
import {aplanarModelo, detectarVistas} from "../lectura/lectorPlano.js";
import {copiarDesdePlantilla} from "./copiarPlantilla.js";
import {polylineToNodes} from "../../etabs/composables/polygonGeometry.js";

const UNIT_NAMES = {0: "sin unidades", 1: "pulgadas", 2: "pies", 4: "milímetros", 5: "centímetros", 6: "metros", 14: "decímetros"};

const entityText = (entity) => entity.contents ?? entity.textString ?? entity.text ?? "";
// Quita códigos de formato de MTEXT (\P, \f...; {...}) para mostrar texto limpio.
const plainText = (value) => String(value).replace(/\\P/g, " ").replace(/\\[A-Za-z][^;\\]*;/g, "").replace(/[{}]/g, "").replace(/\s+/g, " ").trim();

// onFoundation recibe columnas y zapatas detectadas para Cimentación 2.0.
// loadTemplate(): {db, config} de la plantilla de láminas (fetch en el navegador,
// lectura de disco en las pruebas); sin ella el agente usa la lámina simple.
// getProjectData(): datos del rótulo que el ingeniero llenó en el panel (proyecto, entidad,
// especialista, ubicación, códigos).
// Un punto representativo de una entidad (inserción, inicio, centro o primer vértice).
function puntoDeReferencia(e) {
  const p = e.position ?? e.location ?? e.startPoint ?? e.center ?? (Number.isInteger(e.numberOfVertices) && e.numberOfVertices > 0 ? (e.getPoint3dAt ?? e.getPointAt)?.call(e, 0) : null);
  if (p && Number.isFinite(p.x) && Number.isFinite(p.y)) return p;
  const ext = e.geometricExtents;
  return ext?.min && Number.isFinite(ext.min.x) ? {x: (ext.min.x + ext.max.x) / 2, y: (ext.min.y + ext.max.y) / 2} : null;
}

export function createDrawingContext({getDatabase, dm, edit, afterDraw, onFoundation, loadTemplate, getProjectData}) {
  let plantilla = null;
  const entities = () => getDatabase().tables.blockTable.modelSpace.newIterator().toArray();
  return {
    // Resultados de lecturas previas (p. ej. la estructura detectada) entre pedidos.
    memoria: {},
    draw(primitivas, label, opciones = {}) {
      const database = getDatabase();
      if (!database) throw new Error("No hay un dibujo abierto.");
      const result = drawPrimitives(database, primitivas, {dm, edit, label, ...opciones});
      delete this.memoria.lectura;
      // zoom: caja {x0, y0, x1, y1} en unidades del dibujo para encuadrar lo nuevo.
      afterDraw?.(opciones.zoom ?? null);
      return result;
    },
    summarize() {
      const database = getDatabase();
      const porCapa = new Map(), porTipo = new Map(), bloques = new Map();
      for (const entity of entities()) {
        porCapa.set(entity.layer, (porCapa.get(entity.layer) || 0) + 1);
        // dxfTypeName sobrevive a la minificación del bundle; el nombre de clase no.
        const tipo = entity.dxfTypeName || entity.constructor?.name?.replace(/^AcDb|\d+$/g, "") || "?";
        porTipo.set(tipo, (porTipo.get(tipo) || 0) + 1);
        if (entity.blockName) bloques.set(entity.blockName, (bloques.get(entity.blockName) || 0) + 1);
      }
      const top = (map, n) => [...map].sort((a, b) => b[1] - a[1]).slice(0, n).map(([k, v]) => `${k}:${v}`).join(", ");
      return {
        unidades: UNIT_NAMES[database.insunits] ?? `INSUNITS ${database.insunits}`,
        unidadesPorMetro: unitsPerMeter(database),
        objetos: [...porCapa.values()].reduce((a, b) => a + b, 0),
        capas: `${porCapa.size} con objetos: ${top(porCapa, 15)}`,
        tipos: top(porTipo, 10),
        bloques: top(bloques, 8) || "ninguno",
      };
    },
    // Plano con bloques explotados y sus vistas (grillas de ejes con nombre).
    // Se guarda hasta el próximo dibujo para no recorrer el modelo en cada skill.
    readPlan() {
      const database = getDatabase();
      if (!database) throw new Error("No hay un dibujo abierto.");
      if (this.memoria.lectura?.database === database) return this.memoria.lectura;
      const capasApagadas = new Set();
      for (const capa of database.tables.layerTable.newIterator?.().toArray?.() ?? []) {
        if (capa.isOff || capa.isFrozen) capasApagadas.add(capa.name);
      }
      const {items, bloques} = aplanarModelo(entities(), {capasApagadas});
      this.memoria.lectura = {database, items, bloques, vistas: detectarVistas(items)};
      return this.memoria.lectura;
    },
    datosProyecto() {
      try { return getProjectData?.() ?? {}; } catch { return {}; }
    },
    async loadTemplate() {
      if (!loadTemplate) return null;
      plantilla ??= loadTemplate().catch((error) => { plantilla = null; throw error; });
      return plantilla;
    },
    // Copia el espacio modelo de la plantilla al dibujo abierto (un solo paso de deshacer).
    // Con `marco` (coordenadas de la plantilla) copia solo esa lámina: hojas extra de pórticos.
    // `textos`: función texto → texto para los datos del proyecto (parámetros sísmicos).
    insertTemplate(origen, desplazamiento, escala = 1, marco = null, textos = null) {
      const database = getDatabase();
      if (!database) throw new Error("No hay un dibujo abierto.");
      let entidades = origen.tables.blockTable.modelSpace.newIterator().toArray();
      if (marco) entidades = entidades.filter((e) => {
        const p = puntoDeReferencia(e);
        return p && p.x >= marco.x && p.x <= marco.x1 && p.y >= marco.y && p.y <= marco.y1;
      });
      const copiar = () => copiarDesdePlantilla({origen, destino: database, entidades, desplazamiento, escala, dm, textos});
      const resultado = edit ? edit(database, "Agente: plantilla de láminas de estructuras", copiar) ?? null : copiar();
      delete this.memoria.lectura;
      return resultado;
    },
    structuralSegments(capas) {
      if (!getDatabase()) throw new Error("No hay un dibujo abierto.");
      return segmentosDesdeEntidades(entities(), capas, polylineToNodes);
    },
    sendToFoundation(payload) {
      if (!onFoundation) return false;
      onFoundation(payload);
      return true;
    },
    findTexts(query, limit) {
      const needle = query.trim().toLowerCase();
      const k = unitsPerMeter(getDatabase());
      const matches = entities().filter((entity) => {
        const value = entityText(entity);
        return value && plainText(value).toLowerCase().includes(needle);
      });
      return {
        total: matches.length,
        items: matches.slice(0, limit).map((entity) => {
          const at = entity.location ?? entity.position ?? {x: 0, y: 0};
          return {texto: plainText(entityText(entity)).slice(0, 40), x: Math.round((at.x / k) * 100) / 100, y: Math.round((at.y / k) * 100) / 100, capa: entity.layer};
        }),
      };
    },
  };
}
