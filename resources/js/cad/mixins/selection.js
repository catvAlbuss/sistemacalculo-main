/**
 * @mixin selectionMixin
 *
 * Gestión de la selección de objetos en el canvas 2D.
 *
 * Centraliza la lógica de qué objetos son seleccionables, cómo se marcan
 * como seleccionados/deseleccionados y cómo se filtran por tipo o plano.
 * Los estados (SelectedBeamsState, etc.) delegan en este mixin para actualizar
 * el modelo de selección.
 *
 * Nota: clearAllSelections() tiene dos implementaciones. La versión completa
 * y robusta vive en elevation-drawing.js; esta versión es la base simple.
 * El orden de spread en cad_sys.js hace que la de elevation-drawing prevalezca.
 *
 * Responsabilidades:
 * - getSelectableObjects(options)      → lista de objetos que pueden seleccionarse
 * - getSelectedObjects()               → lista de objetos actualmente seleccionados
 * - setObjectSelected(obj, selected)   → marca/desmarca un objeto
 * - selectObjects / deselectObjects    → operaciones en lote
 * - clearAllSelections()               → resetea toda la selección
 * - invertSelection()                  → invierte la selección actual
 * - isObjectOnPlane(obj, plane, value) → filtra objetos por plano de vista
 */
export const selectionMixin = {
  // ------------------------------------------------------------------
  // 5. MÉTODOS DE SELECCIÓN Y MANIPULACIÓN DE OBJETOS
  // ------------------------------------------------------------------

  getSelectableObjects(options = {}) {
    const objects = [];
    const seen = new Set();

    const include3DOnlyFrames = options.include3DOnlyFrames === true;

    const addObject = (obj) => {
      if (!obj) return;
      if (seen.has(obj)) return;

      // Si el objeto está oculto, no lo consideramos seleccionable.
      if (obj.visible === false) return;

      // =====================================================
      // SELECTION 2D > IGNORAR BARRAS 3D-ONLY
      // Los nodos sí se mantienen seleccionables.
      // Solo se bloquean las barras ocultas en 2D.
      // =====================================================
      if (obj.node1 && obj.node2 && !include3DOnlyFrames) {
        if (typeof this.shouldSelectFrameIn2D === "function" && !this.shouldSelectFrameIn2D(obj)) {
          return;
        }
      }

      seen.add(obj);
      objects.push(obj);
    };

    // Nodos
    if (Array.isArray(this.nodes)) {
      this.nodes.forEach(addObject);
    }

    // Barras, columnas, vigas secundarias, arriostres, etc.
    if (Array.isArray(this.shapes)) {
      this.shapes.forEach(addObject);
    }

    // Áreas
    if (Array.isArray(this.areas)) {
      this.areas.forEach(addObject);
    }

    if (Array.isArray(this.slabs)) {
      this.slabs.forEach(addObject);
    }

    if (Array.isArray(this.walls)) {
      this.walls.forEach(addObject);
    }

    if (Array.isArray(this.openings)) {
      this.openings.forEach(addObject);
    }

    return objects;
  },

  getSelectedObjects() {
    if (typeof this.getEditSelectedObjects === "function") {
      return this.getEditSelectedObjects({
        respectActiveView: true,
      });
    }

    return this.getSelectableObjects().filter((obj) => obj.selected === true);
  },

  setObjectSelected(obj, selected = true) {
    if (!obj) return;

    obj.selected = selected;
    obj.isSelected = selected;

    if (selected) {
      obj.style?.selected?.();
      return;
    }

    obj.highlighted3D = false;
    obj.is3DOnlyEndpointHover = false;

    obj.style?.default?.();
  },

  // =====================================================
  // SELECTION > RESOLVER BARRA REAL DEL MODELO
  // En 3D a veces llega una copia/proxy del frame.
  // Por eso se busca la barra real dentro de this.shapes usando el id.
  // =====================================================
  resolveFrameFromModel(frameOrId) {
    if (!frameOrId) return null;

    const id = typeof frameOrId === "object" ? (frameOrId.id ?? frameOrId.frameId) : frameOrId;

    if (id == null) return null;

    return this.shapes?.find((frame) => String(frame.id) === String(id)) || null;
  },

  // =====================================================
  // SELECTION > OBTENER BARRAS SELECCIONADAS ACTUALMENTE
  // Soporta selección 2D, 3D y estados internos.
  // =====================================================
  // =====================================================
  // SELECTION > OBTENER BARRAS SELECCIONADAS ACTUALMENTE
  // Usa una lista propia para permitir seleccionar 1, 2, 3, 4 o más barras.
  // =====================================================
  getCurrentlySelectedFrames() {
    if (!Array.isArray(this.multiSelectedFrames)) {
      this.multiSelectedFrames = [];
    }

    // Convertir cualquier copia/proxy en la barra real del modelo
    this.multiSelectedFrames = this.multiSelectedFrames
      .map((frame) => this.resolveFrameFromModel?.(frame) || frame)
      .filter((frame) => {
        return frame && this.shapes?.some((item) => String(item.id) === String(frame.id));
      });

    // Quitar repetidos por id
    const seen = new Set();

    this.multiSelectedFrames = this.multiSelectedFrames.filter((frame) => {
      const key = String(frame.id);

      if (seen.has(key)) return false;

      seen.add(key);
      return true;
    });

    return this.multiSelectedFrames;
  },

  // =====================================================
  // SELECTION > SELECCIONAR LISTA DE BARRAS
  // Clic normal: reemplaza selección.
  // Ctrl + clic: toggleFrameSelection manda una lista acumulada.
  // =====================================================
  selectFramesForEdit(frames = [], options = {}) {
    if (!Array.isArray(this.multiSelectedFrames)) {
      this.multiSelectedFrames = [];
    }

    const cleanFrames = [];
    const seen = new Set();

    frames.forEach((frame) => {
      // CLAVE: resolver la barra real dentro del modelo
      const realFrame = this.resolveFrameFromModel?.(frame) || frame;

      if (!realFrame || !realFrame.node1 || !realFrame.node2) return;

      const existsInModel = this.shapes?.some((item) => {
        return String(item.id) === String(realFrame.id);
      });

      if (!existsInModel) return;

      const key = String(realFrame.id);

      if (seen.has(key)) return;

      seen.add(key);
      cleanFrames.push(realFrame);
    });

    // Limpiar selección visual anterior
    this.shapes?.forEach((shape) => {
      shape.selected = false;
      shape.isSelected = false;
      shape.highlighted3D = false;
      shape.style?.default?.();
    });

    this.nodes?.forEach((node) => {
      node.selected = false;
      node.isSelected = false;
      node.is3DOnlyEndpointHover = false;
      node.style?.default?.();
    });

    this.areas?.forEach((area) => {
      area.selected = false;
      area.isSelected = false;
    });

    // Guardar selección múltiple real
    this.multiSelectedFrames = cleanFrames;

    cleanFrames.forEach((frame) => {
      frame.selected = true;
      frame.isSelected = true;
      frame.highlighted3D = true;

      frame.style?.select?.();
      frame.style?.selected?.();
    });

    // Sincronizar con Edit
    this.selectedBeams = cleanFrames;
    this.selectedObjects = cleanFrames;

    if (this.selectedBeamsState) {
      this.selectedBeamsState.selectedBeams = cleanFrames;
      this.selectedBeamsState.selectedObjects = cleanFrames;
      this.selectedBeamsState.selectedBeam = cleanFrames[0] || null;
    }

    if (cleanFrames.length > 0) {
      this.setState?.(this.selectedBeamsState, {
        selectedBeams: cleanFrames,
        selectedBeam: cleanFrames[0],
        selectedObjects: cleanFrames,
      });
    } else {
      this.setState?.(this.idleState);
    }

    this.redraw?.();
    this.sync3D?.();

    this.showMessage?.(
      cleanFrames.length === 1 ? "1 barra seleccionada" : `${cleanFrames.length} barras seleccionadas`,
    );

    console.log(
      "✅ Selección múltiple de barras:",
      cleanFrames.map((frame) => frame.id),
    );
  },

  // =====================================================
  // SELECTION > CTRL + CLIC PARA AGREGAR O QUITAR BARRAS
  // Permite seleccionar tantas barras como quieras.
  // =====================================================
  toggleFrameSelection(frame) {
    const realFrame = this.resolveFrameFromModel?.(frame) || frame;

    if (!realFrame || !realFrame.node1 || !realFrame.node2) {
      console.warn("⚠️ toggleFrameSelection: frame inválido", frame);
      return;
    }

    if (!Array.isArray(this.multiSelectedFrames)) {
      this.multiSelectedFrames = [];
    }

    const currentFrames = this.getCurrentlySelectedFrames?.() || [];

    const alreadySelected = currentFrames.some((item) => {
      return String(item.id) === String(realFrame.id);
    });

    const nextFrames = alreadySelected
      ? currentFrames.filter((item) => String(item.id) !== String(realFrame.id))
      : [...currentFrames, realFrame];

    this.selectFramesForEdit?.(nextFrames, {
      reason: "ctrl click multiple frame selection",
    });
  },

  selectObjects(objects = []) {
    objects.forEach((obj) => {
      this.setObjectSelected(obj, true);
    });

    this.redraw?.();
    this.sync3D?.();

    const selected = this.getSelectedObjects();
    this.showMessage?.(`Objetos seleccionados: ${selected.length}`);
  },

  deselectObjects(objects = []) {
    objects.forEach((obj) => {
      this.setObjectSelected(obj, false);
    });

    this.redraw?.();
    this.sync3D?.();

    this.showMessage?.(`Objetos deseleccionados: ${objects.length}`);
  },

  clearAllSelections() {
    const states = [
      this.selectedNodesState,
      this.selectedBeamsState,
      this.selectedParametricState,
      this.selectedAreasState,
      this.selectedDimensionLinesState,
    ];

    states.forEach((state) => {
      if (state?.selectedObjects?.length) {
        state.exit?.();
        state.selectedObjects = [];
      }
    });

    if (this.moveObjectState) {
      // Limpiar el selectedObject antes de salir
      if (this.moveObjectState.selectedObject) {
        this.moveObjectState.selectedObject.style.default();
      }
      this.moveObjectState.selectedObject = null;
      this.moveObjectState.isMoving = false;
    }

    if (this.dimensionLines?.length) {
      this.dimensionLines.forEach((dim) => {
        dim.selected = false;
      });
    }

    if (this.areas?.length) {
      this.areas.forEach((area) => {
        area.selected = false;
      });
    }

    this.selectedNode = null;
    this.selectedBeam = null;
    this.selectedObject = null;
  },

  invertSelection() {
    const objects = this.getSelectableObjects();

    objects.forEach((obj) => {
      const isSelected = obj.selected === true;
      this.setObjectSelected(obj, !isSelected);
    });

    const selectedCount = this.getSelectedObjects().length;

    this.redraw?.();
    this.sync3D?.();

    this.showMessage?.(`Selección invertida: ${selectedCount} objetos seleccionados`);
  },

  getPointPosition(point) {
    if (!point) return null;

    const p = point.position || point;

    return {
      x: Number(p.x ?? 0),
      y: Number(p.y ?? 0),
      z: Number(p.z ?? 0),
    };
  },

  getObjectPoints(obj) {
    if (!obj) return [];

    // Caso nodo
    if (obj.position || obj.objectType === "node") {
      const p = this.getPointPosition(obj);
      return p ? [p] : [];
    }

    // Caso barra / viga / columna
    if (obj.node1 && obj.node2) {
      const p1 = this.getPointPosition(obj.node1);
      const p2 = this.getPointPosition(obj.node2);

      return [p1, p2].filter(Boolean);
    }

    // Caso objeto con nodes[]
    if (Array.isArray(obj.nodes)) {
      return obj.nodes.map((node) => this.getPointPosition(node)).filter(Boolean);
    }

    // Caso objeto con points[]
    if (Array.isArray(obj.points)) {
      return obj.points.map((point) => this.getPointPosition(point)).filter(Boolean);
    }

    return [];
  },

  isObjectOnPlane(obj, plane = "XY", planeValue = 0, tolerance = null) {
    const points = this.getObjectPoints(obj);

    if (!points.length) return false;

    const tol = tolerance ?? this.getModelTolerance?.() ?? 0.001;
    const value = Number(planeValue);

    if (plane === "XY") {
      return points.every((p) => Math.abs(p.z - value) <= tol);
    }

    if (plane === "XZ") {
      return points.every((p) => Math.abs(p.y - value) <= tol);
    }

    if (plane === "YZ") {
      return points.every((p) => Math.abs(p.x - value) <= tol);
    }

    return false;
  },

  getDefaultPlaneValue(plane = "XY") {
    if (plane === "XY") {
      return Number(this.currentZ ?? this.stories?.[this.activeStory]?.elevation ?? 0);
    }

    if (plane === "XZ") {
      return Number(this.activeElevationY ?? this.currentY ?? 0);
    }

    if (plane === "YZ") {
      return Number(this.activeElevationX ?? this.currentX ?? 0);
    }

    return 0;
  },


};
