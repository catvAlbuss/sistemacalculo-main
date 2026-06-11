/**
 * @mixin modelQueriesMixin
 *
 * Consultas de tipo y estado sobre los objetos en edición o selección.
 *
 * No modifica el modelo; solo responde preguntas: "¿este objeto es un nodo?",
 * "¿cuántos frames están seleccionados?", etc. Sirve como capa de abstracción
 * para que los demás mixins no accedan directamente a los estados internos de
 * selección (SelectedBeamsState, SelectedNodesState, etc.).
 *
 * Responsabilidades:
 * - isEditNodeObject / isEditFrameObject / isEditAreaObject → comprueba tipo de objeto
 * - isEditObjectVisibleInActiveView                         → visibilidad en vista activa
 * - getEditSelectedObjects / getEditSelectedNodes/Frames/Areas → recupera selección actual
 * - getEditSelectedSummary                                  → resumen legible de la selección
 * - debugEditSelection                                      → volcado de consola para depuración
 */
export const modelQueriesMixin = {
  // =========================================
  // ======= EDIT: SELECCIÓN CENTRAL =========
  // =========================================

  isEditNodeObject(obj) {
    if (!obj) return false;

    const type = String(obj.objectType || obj.elementType || obj.type || obj.constructor?.name || "").toLowerCase();

    return (
      !!obj.position &&
      !obj.node1 &&
      !obj.node2 &&
      (Array.isArray(obj.beams) ||
        obj.isNode === true ||
        type === "node" ||
        type === "structuralnode" ||
        type === "joint" ||
        type === "point")
    );
  },

  isEditFrameObject(obj) {
    if (!obj) return false;

    const type = String(obj.objectType || obj.elementType || obj.type || obj.constructor?.name || "").toLowerCase();

    return (
      !!obj.node1 &&
      !!obj.node2 &&
      (obj.isBeam === true ||
        type === "beam" ||
        type === "column" ||
        type === "brace" ||
        type === "frame" ||
        type === "line" ||
        type === "secondary-beam" ||
        type === "secondarybeam")
    );
  },

  isEditAreaObject(obj) {
    if (!obj) return false;

    const type = String(
      obj.objectType || obj.elementType || obj.type || obj.areaType || obj.constructor?.name || "",
    ).toLowerCase();

    return (
      Array.isArray(obj.points) &&
      (type === "area" || type === "slab" || type === "wall" || type === "opening" || !!obj.areaType)
    );
  },

  isEditDimensionLineObject(obj) {
    if (!obj) return false;

    return obj.start && obj.end && (obj.label || typeof obj.value === "number");
  },

  isEditObjectVisibleInActiveView(obj) {
    if (!obj) return false;

    if (obj.visible === false) return false;

    if (typeof this.isObjectVisibleInActiveView === "function") {
      try {
        return this.isObjectVisibleInActiveView(obj);
      } catch (error) {
        // Algunas entidades auxiliares, como líneas de dimensión,
        // pueden no estar contempladas por el filtro principal.
        return true;
      }
    }

    return true;
  },

  addUniqueEditObject(list, seen, obj, options = {}) {
    if (!obj) return;

    if (seen.has(obj)) return;

    const respectActiveView = options.respectActiveView ?? true;

    if (respectActiveView && !this.isEditObjectVisibleInActiveView(obj)) {
      return;
    }

    seen.add(obj);
    list.push(obj);
  },

  getObjectsFromSelectionState(state) {
    if (!state) return [];

    const objects = [];

    const pushMany = (items) => {
      if (!Array.isArray(items)) return;
      items.forEach((item) => {
        if (item) objects.push(item);
      });
    };

    pushMany(state.selectedObjects);
    pushMany(state.objects);
    pushMany(state.selectedNodes);
    pushMany(state.selectedBeams);
    pushMany(state.selectedAreas);
    pushMany(state.selectedDimensionLines);
    pushMany(state.selectedParametric);

    if (state.selectedObject) objects.push(state.selectedObject);
    if (state.selectedNode) objects.push(state.selectedNode);
    if (state.selectedBeam) objects.push(state.selectedBeam);
    if (state.selectedArea) objects.push(state.selectedArea);

    return objects;
  },

  getEditSelectedObjects(options = {}) {
    let selected = [];
    const seen = new Set();

    const explicitObjects = [];
    const explicitSeen = new Set();

    const addExplicit = (obj) => {
      if (!obj || explicitSeen.has(obj)) return;
      explicitSeen.add(obj);
      explicitObjects.push(obj);
    };

    const addFinal = (obj) => {
      this.addUniqueEditObject(selected, seen, obj, options);
    };

    // =====================================================
    // 1. Objetos explícitos desde el estado actual
    // =====================================================
    this.getObjectsFromSelectionState(this.currentState).forEach(addExplicit);

    if (this.currentState === this.moveObjectState && this.moveObjectState?.selectedObject) {
      addExplicit(this.moveObjectState.selectedObject);
    }

    // =====================================================
    // 2. Objetos explícitos desde estados de selección múltiple
    // =====================================================
    [
      this.selectedNodesState,
      this.selectedBeamsState,
      this.selectedAreasState,
      this.selectedDimensionLinesState,
      this.selectedParametricState,
    ].forEach((state) => {
      this.getObjectsFromSelectionState(state).forEach(addExplicit);
    });

    // =====================================================
    // 3. Objetos marcados visualmente con selected / isSelected
    // =====================================================
    const selectableObjects =
      typeof this.getSelectableObjects === "function"
        ? this.getSelectableObjects()
        : [...(this.nodes || []), ...(this.shapes || []), ...(this.areas || []), ...(this.dimensionLines || [])];

    const flaggedObjects = selectableObjects.filter((obj) => {
      return obj?.selected === true || obj?.isSelected === true;
    });

    // =====================================================
    // 4. Unir explícitos + flagged
    // =====================================================
    const combined = [];

    explicitObjects.forEach((obj) => {
      if (obj && !combined.includes(obj)) {
        combined.push(obj);
      }
    });

    flaggedObjects.forEach((obj) => {
      if (obj && !combined.includes(obj)) {
        combined.push(obj);
      }
    });

    // =====================================================
    // 5. Evitar que los nodos extremos de una barra entren
    //    automáticamente como selección independiente.
    // =====================================================
    const selectedFrames = combined.filter((obj) => this.isEditFrameObject(obj));

    const explicitNodes = new Set(explicitObjects.filter((obj) => this.isEditNodeObject(obj)));

    const frameEndpointNodes = new Set();

    selectedFrames.forEach((frame) => {
      if (frame.node1) frameEndpointNodes.add(frame.node1);
      if (frame.node2) frameEndpointNodes.add(frame.node2);
    });

    combined.forEach((obj) => {
      if (
        selectedFrames.length > 0 &&
        this.isEditNodeObject(obj) &&
        frameEndpointNodes.has(obj) &&
        !explicitNodes.has(obj)
      ) {
        return;
      }

      addFinal(obj);
    });

    // Filtrar objetos que ya no existen en el modelo
    selected = selected.filter((obj) => {
      return this.isEditObjectStillInModel?.(obj);
    });

    return selected;
  },

  // =====================================================
  // EDIT CORE > VALIDAR SI UN OBJETO SIGUE EN EL MODELO
  // =====================================================
  isEditObjectStillInModel(obj) {
    if (!obj) return false;

    // Nodo
    if (this.isEditNodeObject?.(obj) || obj.position) {
      return this.nodes?.includes(obj) ?? false;
    }

    // Barra / Frame
    if (this.isEditFrameObject?.(obj) || obj.node1 || obj.node2) {
      return this.shapes?.includes(obj) ?? false;
    }

    // Área
    if (this.isEditAreaObject?.(obj) || Array.isArray(obj.points)) {
      return this.areas?.includes(obj) ?? false;
    }

    // Línea de dimensión
    if (this.isEditDimensionLineObject?.(obj) || (obj.start && obj.end && obj.value !== undefined)) {
      return this.dimensionLines?.includes(obj) ?? false;
    }

    return false;
  },

  getEditSelectedNodes(options = {}) {
    return this.getEditSelectedObjects(options).filter((obj) => this.isEditNodeObject(obj));
  },

  getEditSelectedFrames(options = {}) {
    return this.getEditSelectedObjects(options).filter((obj) => this.isEditFrameObject(obj));
  },

  getEditSelectedAreas(options = {}) {
    return this.getEditSelectedObjects(options).filter((obj) => this.isEditAreaObject(obj));
  },

  getEditSelectedDimensionLines(options = {}) {
    return this.getEditSelectedObjects(options).filter((obj) => this.isEditDimensionLineObject(obj));
  },

  getEditSelectedSummary(options = {}) {
    const nodes = this.getEditSelectedNodes(options);
    const frames = this.getEditSelectedFrames(options);
    const areas = this.getEditSelectedAreas(options);
    const dimensions = this.getEditSelectedDimensionLines(options);
    const total = this.getEditSelectedObjects(options).length;

    return {
      total,
      nodes: nodes.length,
      frames: frames.length,
      areas: areas.length,
      dimensions: dimensions.length,
      others: total - nodes.length - frames.length - areas.length - dimensions.length,
    };
  },

  debugEditSelection() {
    const objects = this.getEditSelectedObjects();
    const summary = this.getEditSelectedSummary();

    console.log("🧩 EDIT - Objetos seleccionados:", {
      summary,
      objects,
      currentState: this.currentState?.constructor?.name,
    });

    this.showMessage?.(
      `Edit selección: ${summary.total} objeto(s) | Nodos: ${summary.nodes}, Líneas: ${summary.frames}, Áreas: ${summary.areas}`,
    );

    return {
      summary,
      objects,
    };
  },

  // =========================================
  // ========== EDIT: DELETE =================
  // =========================================


};
