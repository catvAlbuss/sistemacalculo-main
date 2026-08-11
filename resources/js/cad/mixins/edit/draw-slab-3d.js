import { Area } from "../../model/shapes.js";

/**
 * @mixin drawSlab3DMixin
 *
 * DIBUJO DE LOSAS (ÁREAS) DIRECTAMENTE EN EL VISOR 3D.
 *
 * Espejo de lo que ya existía para barras (`startFrame3DDrawingMode` /
 * `handle3DFrameNodePicked`, en `mixins/select/view-filter.js`): el observable
 * de Babylon (`3d/viewer3d.js`) resuelve el punto bajo el cursor — nudo real
 * del modelo, vértice de grilla 3D o punto del plano de trabajo — y lo entrega
 * acá con `handle3DSlabPointPicked()`. Este mixin solo acumula vértices y arma
 * el `Area` al cerrar.
 *
 * Por qué existe (además del flujo 2D de `AreaDrawingState`): en planta cada
 * vértice hereda la cota del nudo bajo el cursor, lo que funciona pero es poco
 * intuitivo para un TECHO INCLINADO. En 3D se ve la pendiente mientras se
 * marca. `Area.addPoint` respeta `point.z` (shapes.js), así que con vértices a
 * distinta cota la losa sale inclinada sin tocar nada más — y `area3d.js` ya
 * sabe renderizar polígonos no horizontales (`createGeneric3DPolygon`).
 *
 * Flujo de usuario (estilo ETABS):
 *   - Botón "Losa" → herramienta activa en 2D **y** en 3D.
 *   - Clic sobre nudos / vértices de grilla → agrega vértices.
 *   - Clic sobre el PRIMER vértice, Enter o clic derecho → cierra la losa.
 *   - Backspace → borra el último vértice. Esc → cancela.
 */

// Tolerancia (m) para considerar que un clic cayó sobre un vértice ya marcado.
// Al snapear a un nudo/vértice de grilla las coordenadas son idénticas, así que
// alcanza con un margen chico para absorber el punto libre del plano de trabajo.
const SLAB_3D_VERTEX_TOLERANCE = 0.02;

function samePoint3D(a, b, tolerance = SLAB_3D_VERTEX_TOLERANCE) {
  if (!a || !b) return false;

  return (
    Math.abs(Number(a.x || 0) - Number(b.x || 0)) <= tolerance &&
    Math.abs(Number(a.y || 0) - Number(b.y || 0)) <= tolerance &&
    Math.abs(Number(a.z || 0) - Number(b.z || 0)) <= tolerance
  );
}

export const drawSlab3DMixin = {
  // =====================================================
  // DRAW SLAB 3D > ARRANCAR EL POLÍGONO EN EL VISOR 3D
  // Se llama solo desde el observable de Babylon, en el primer clic.
  // =====================================================
  startSlab3DDrawingMode() {
    if (this.activeDrawTool !== "slab") {
      this.startSlabDrawingMode?.();
    }

    this.activeViewport = "3d";
    this.isDrawingSlab3D = true;

    if (!Array.isArray(this.slab3DPoints)) {
      this.slab3DPoints = [];
    }

    console.log("🟢 Draw Slab 3D activado:", {
      activeDrawTool: this.activeDrawTool,
      puntos: this.slab3DPoints.length,
    });
  },

  // =====================================================
  // DRAW SLAB 3D > RECIBIR PUNTO CLICKEADO EN 3D
  // `point` ya viene resuelto por viewer3d.js: nudo del modelo, vértice de
  // grilla 3D o punto sobre el plano de trabajo. Trae x, y, z REALES.
  // =====================================================
  handle3DSlabPointPicked(point) {
    if (!point) return;

    if (this.isDrawingSlab3D !== true) {
      this.startSlab3DDrawingMode();
    }

    const vertex = {
      x: Number(point.x || 0),
      y: Number(point.y || 0),
      z: Number(point.z || 0),
    };

    const points = this.slab3DPoints;

    // Clic sobre el primer vértice = cerrar el polígono (mismo criterio que
    // el cierre por clic de la zapata en 2D, pero en coordenadas de modelo
    // porque acá el snap ya devuelve el punto exacto).
    if (points.length >= 3 && samePoint3D(points[0], vertex)) {
      this.finishSlab3DArea();
      return;
    }

    // No repetir el vértice anterior (doble clic accidental sobre el mismo nudo).
    if (points.length && samePoint3D(points[points.length - 1], vertex)) {
      return;
    }

    points.push(vertex);

    this.showMessage?.(
      points.length < 3
        ? `Vértice ${points.length} marcado. Sigue marcando nudos (mínimo 3).`
        : "Cierra la losa: clic en el primer vértice, clic derecho o Enter.",
    );

    window.__jhRefresh3DSlabPreview?.();
  },

  // =====================================================
  // DRAW SLAB 3D > CERRAR Y CREAR LA LOSA
  // La cota `z` del área es la del vértice más bajo; cada vértice conserva
  // su propia z (Area.addPoint), así que un techo a dos aguas sale inclinado.
  // =====================================================
  finishSlab3DArea() {
    const points = Array.isArray(this.slab3DPoints) ? this.slab3DPoints : [];

    if (points.length < 3) {
      this.showMessage?.("Se necesitan al menos 3 vértices para crear una losa.", "warning");
      return null;
    }

    this.saveUndoState?.("Dibujar losa en 3D");

    const baseZ = points.reduce((min, p) => Math.min(min, Number(p.z || 0)), Number.POSITIVE_INFINITY);
    const area = new Area("slab", Number.isFinite(baseZ) ? baseZ : 0);

    points.forEach((p) => area.addPoint(p));
    area.id = this.areas.length + 1;

    this.areas.push(area);

    const zs = points.map((p) => Number(p.z || 0));
    const sloped = Math.max(...zs) - Math.min(...zs) > 1e-6;

    console.log("▭ Losa 3D creada:", {
      id: area.id,
      puntos: area.points.length,
      z: area.z,
      inclinada: sloped,
    });

    this.slab3DPoints = [];
    this.isDrawingSlab3D = false;

    window.__jhRefresh3DSlabPreview?.();

    this.markAnalysisResultsOutdated?.("Losa dibujada en 3D");
    this.redraw?.();
    this.sync3D?.();

    this.showMessage?.(
      sloped
        ? "Losa inclinada creada. Sigue marcando vértices para otra, o Esc para salir."
        : "Losa creada. Sigue marcando vértices para otra, o Esc para salir.",
      "success",
    );

    return area;
  },

  // =====================================================
  // DRAW SLAB 3D > BORRAR EL ÚLTIMO VÉRTICE (BACKSPACE)
  // =====================================================
  undoLastSlab3DPoint() {
    if (!Array.isArray(this.slab3DPoints) || !this.slab3DPoints.length) return;

    this.slab3DPoints.pop();

    if (!this.slab3DPoints.length) {
      this.isDrawingSlab3D = false;
    }

    window.__jhRefresh3DSlabPreview?.();
    this.showMessage?.("Último vértice borrado.");
  },

  // =====================================================
  // DRAW SLAB 3D > CANCELAR EL POLÍGONO EN CURSO
  // Cancela SOLO la parte 3D; la herramienta de losa sigue activa.
  // =====================================================
  cancelSlab3DDrawing() {
    const hadPoints = Array.isArray(this.slab3DPoints) && this.slab3DPoints.length > 0;

    this.slab3DPoints = [];
    this.isDrawingSlab3D = false;

    window.__jhRefresh3DSlabPreview?.();

    if (hadPoints) {
      this.showMessage?.("Losa en curso cancelada.");
      console.log("🟡 Draw Slab 3D cancelado");
    }
  },

  // =====================================================
  // DRAW SLAB 3D > PUNTOS PARA EL PREVIEW
  // Lo consume viewer3d.js para dibujar la polilínea + relleno translúcido.
  // =====================================================
  getSlab3DPreviewPoints() {
    return Array.isArray(this.slab3DPoints) ? this.slab3DPoints : [];
  },
};
