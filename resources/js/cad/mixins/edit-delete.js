import { removeBeamMeshById } from "../3d/viewer3d.js";

/**
 * @mixin editDeleteMixin
 *
 * Eliminación de objetos del modelo y reindexado posterior.
 *
 * Al borrar nodos, barras o áreas es necesario reindexar todos los IDs
 * para mantener la secuencia continua. También limpia el mesh 3D
 * correspondiente llamando a removeBeamMeshById de viewer3d.js.
 *
 * Responsabilidades:
 * - deleteSelected()              → elimina todos los objetos seleccionados
 * - removeFrameFromModel(frame)   → elimina una barra y su mesh 3D
 * - removeNodeFromModel(node)     → elimina un nodo (solo si no tiene barras conectadas)
 * - removeAreaFromModel(area)     → elimina un área
 * - removeDimensionLineFromModel(dim) → elimina una línea de dimensión
 * - reindexModelObjects()         → renumera nodos, barras y áreas desde 1
 * - clearEditSelectionFlags()     → limpia las flags selected/highlighted de todos los objetos
 */
export const editDeleteMixin = {
  reindexModelObjects() {
    if (Array.isArray(this.nodes)) {
      this.nodes.forEach((node, index) => {
        node.id = index + 1;
      });
    }

    if (Array.isArray(this.shapes)) {
      this.shapes.forEach((shape, index) => {
        shape.id = index + 1;
      });
    }

    if (Array.isArray(this.areas)) {
      this.areas.forEach((area, index) => {
        area.id = index + 1;
      });
    }

    if (Array.isArray(this.dimensionLines)) {
      this.dimensionLines.forEach((dim, index) => {
        dim.id = index + 1;
      });
    }
  },

  // removeFrameFromModel(frame) {
  //   if (!frame) return false;

  //   if (typeof removeBeamMeshById === "function") {
  //     removeBeamMeshById(frame.id);
  //   }

  //   // Eliminar frame original del modelo
  //   const removed = this.removeFrameFromModel(frame) ? 1 : 0;

  //   // Limpieza extra por si la función anterior falló (búsqueda por ID)
  //   const extraIndex = this.shapes.findIndex((f) => f.id === frame.id);
  //   if (extraIndex !== -1) {
  //     const extraFrame = this.shapes[extraIndex];
  //     if (extraFrame.node1?.beams) extraFrame.node1.beams = extraFrame.node1.beams.filter((b) => b.id !== frame.id);
  //     if (extraFrame.node2?.beams) extraFrame.node2.beams = extraFrame.node2.beams.filter((b) => b.id !== frame.id);
  //     this.shapes.splice(extraIndex, 1);
  //   }

  //   if (frame.node1?.beams) {
  //     frame.node1.beams = frame.node1.beams.filter((beam) => beam !== frame);
  //   }

  //   if (frame.node2?.beams) {
  //     frame.node2.beams = frame.node2.beams.filter((beam) => beam !== frame);
  //   }

  //   if (Array.isArray(this.shapes)) {
  //     const index = this.shapes.indexOf(frame);

  //     if (index >= 0) {
  //       this.shapes.splice(index, 1);
  //       return true;
  //     }
  //   }

  //   return false;
  // },

  removeFrameFromModel(frame) {
    if (!frame) return false;
    const frameId = frame.id;
    if (!frameId) return false;

    // 1. Limpiar referencias en los nodos extremos
    if (frame.node1?.beams) {
      frame.node1.beams = frame.node1.beams.filter((b) => b.id !== frameId);
    }
    if (frame.node2?.beams) {
      frame.node2.beams = frame.node2.beams.filter((b) => b.id !== frameId);
    }

    // 2. Limpiar referencias en estados de selección (globales y de estado)
    if (this.selectedBeams) {
      this.selectedBeams = this.selectedBeams.filter((b) => b.id !== frameId);
    }
    if (this.selectedObjects) {
      this.selectedObjects = this.selectedObjects.filter((obj) => obj.id !== frameId);
    }
    if (this.selectedBeamsState?.selectedObjects) {
      this.selectedBeamsState.selectedObjects = this.selectedBeamsState.selectedObjects.filter((b) => b.id !== frameId);
    }
    if (this.selectedBeamsState?.selectedBeams) {
      this.selectedBeamsState.selectedBeams = this.selectedBeamsState.selectedBeams.filter((b) => b.id !== frameId);
    }
    if (this.currentState?.selectedObjects) {
      this.currentState.selectedObjects = this.currentState.selectedObjects.filter((obj) => obj.id !== frameId);
    }
    if (this.currentState?.selectedBeams) {
      this.currentState.selectedBeams = this.currentState.selectedBeams.filter((b) => b.id !== frameId);
    }

    // 3. Eliminar la malla 3D (si la función está disponible)
    if (typeof removeBeamMeshById === "function") {
      removeBeamMeshById(frameId);
    }

    // 4. Buscar y eliminar el frame del array principal por ID (no por referencia)
    const index = this.shapes.findIndex((f) => f.id === frameId);
    if (index !== -1) {
      this.shapes.splice(index, 1);
      console.log(`✅ Frame ${frameId} eliminado del modelo de datos`);
      return true;
    }

    console.warn(`⚠️ No se encontró el frame ${frameId} en this.shapes`);
    return false;
  },

  removeNodeFromModel(node) {
    if (!node) return false;

    const connectedFrames = Array.isArray(node.beams) ? [...node.beams] : [];

    connectedFrames.forEach((frame) => {
      this.removeFrameFromModel(frame);
    });

    node.beams = [];

    if (Array.isArray(this.nodes)) {
      const index = this.nodes.indexOf(node);

      if (index >= 0) {
        this.nodes.splice(index, 1);
        return true;
      }
    }

    return false;
  },

  removeAreaFromModel(area) {
    if (!area || !Array.isArray(this.areas)) return false;

    const index = this.areas.indexOf(area);

    if (index >= 0) {
      this.areas.splice(index, 1);
      return true;
    }

    return false;
  },

  removeDimensionLineFromModel(dim) {
    if (!dim || !Array.isArray(this.dimensionLines)) return false;

    const index = this.dimensionLines.indexOf(dim);

    if (index >= 0) {
      this.dimensionLines.splice(index, 1);
      return true;
    }

    return false;
  },

  // =====================================================
  // EDIT CORE > LIMPIAR SELECCIÓN VISUAL E INTERNA
  // =====================================================
  clearEditSelectionFlags() {
    const clearOne = (obj) => {
      if (!obj) return;

      obj.selected = false;
      obj.isSelected = false;

      if (obj.style?.default) {
        obj.style?.default?.();
      }
    };

    // Limpiar banderas visuales del modelo actual
    this.nodes?.forEach(clearOne);
    this.shapes?.forEach(clearOne);
    this.areas?.forEach(clearOne);
    this.dimensionLines?.forEach(clearOne);

    // Limpiar arrays internos de estados seleccionados
    if (this.selectedNodesState) {
      this.selectedNodesState.selectedObjects = [];
    }

    if (this.selectedBeamsState) {
      this.selectedBeamsState.selectedObjects = [];
    }

    if (this.selectedAreasState) {
      this.selectedAreasState.selectedObjects = [];
    }

    if (this.selectedDimensionLinesState) {
      this.selectedDimensionLinesState.selectedObjects = [];
    }

    if (this.selectedParametricState) {
      this.selectedParametricState.selectedObjects = [];
    }

    // Limpiar selección por ventana
    if (this.selectionState) {
      this.selectionState.selectedNodes = [];
      this.selectionState.selectedBeams = [];
      this.selectionState.selectedAreas = [];
      this.selectionState.selectedDimensionLines = [];
    }

    // Limpiar estado de movimiento
    if (this.moveObjectState) {
      this.moveObjectState.selectedObject = null;
      this.moveObjectState.isMoving = false;
    }

    // Limpiar estado reshape
    if (this.reshapeObjectState) {
      this.reshapeObjectState.selectedBeam = null;
      this.reshapeObjectState.selectedNode = null;
      this.reshapeObjectState.selectedArea = null;
      this.reshapeObjectState.selectedVertexIndex = null;
      this.reshapeObjectState.isMoving = false;
    }
  },

  deleteSelected() {
    // =====================================================
    // DELETE > RESPETAR SELECCIÓN HECHA EN EL VISOR 3D
    // Con respectActiveView=true la selección se filtra al plano de la
    // vista 2D activa, y lo seleccionado en 3D en OTROS pisos (columnas
    // multi-piso, vigas/losas de otra planta) quedaba fuera → "no hay
    // selección". Si la última interacción fue en el 3D, se borra TODO
    // lo seleccionado sin filtrar por la planta activa (estilo ETABS).
    // El flujo 2D conserva el comportamiento original.
    // =====================================================
    const respectActiveView = this.activeViewport !== "3d";

    let selectedObjects =
      this.getEditSelectedObjects?.({
        respectActiveView,
      }) || [];

    // Respaldo: si el filtro de vista dejó la lista vacía pero SÍ hay
    // objetos marcados como seleccionados, usarlos (selección viva del 3D).
    if (!selectedObjects.length && respectActiveView) {
      const unfiltered =
        this.getEditSelectedObjects?.({
          respectActiveView: false,
        }) || [];

      if (unfiltered.length) {
        console.log("🗑️ EDIT Delete: usando selección sin filtro de vista (origen 3D):", unfiltered.length);
        selectedObjects = unfiltered;
      }
    }

    if (!selectedObjects.length) {
      this.showMessage?.("🗑️ Seleccione un elemento para eliminar", "warning");
      console.warn("EDIT Delete: no hay selección.");
      return;
    }

    this.saveUndoState?.("Delete selected objects");

    const selectedNodes = selectedObjects.filter((obj) => this.isEditNodeObject(obj));

    const selectedFrames = selectedObjects.filter((obj) => this.isEditFrameObject(obj));

    const selectedAreas = selectedObjects.filter((obj) => this.isEditAreaObject(obj));

    const selectedDimensions = selectedObjects.filter((obj) => this.isEditDimensionLineObject(obj));

    let deletedNodes = 0;
    let deletedFrames = 0;
    let deletedAreas = 0;
    let deletedDimensions = 0;

    selectedNodes.forEach((node) => {
      const connectedFrames = Array.isArray(node.beams) ? [...node.beams] : [];

      connectedFrames.forEach((frame) => {
        if (this.removeFrameFromModel(frame)) {
          deletedFrames++;
        }
      });

      if (this.removeNodeFromModel(node)) {
        deletedNodes++;
      }
    });

    selectedFrames.forEach((frame) => {
      if (this.removeFrameFromModel(frame)) {
        deletedFrames++;
      }
    });

    selectedAreas.forEach((area) => {
      if (this.removeAreaFromModel(area)) {
        deletedAreas++;
      }
    });

    selectedDimensions.forEach((dim) => {
      if (this.removeDimensionLineFromModel(dim)) {
        deletedDimensions++;
      }
    });

    this.reindexModelObjects();
    this.clearEditSelectionFlags();

    const totalDeleted = deletedNodes + deletedFrames + deletedAreas + deletedDimensions;

    console.log("🗑️ EDIT Delete ejecutado:", {
      deletedNodes,
      deletedFrames,
      deletedAreas,
      deletedDimensions,
      totalDeleted,
    });

    this.markAnalysisResultsOutdated?.("Se modificó el modelo o sus asignaciones.");
    this.redraw?.();

    if (deletedNodes > 0 || deletedFrames > 0 || deletedAreas > 0) {
      this.sync3D?.();
    }

    this.showMessage?.(
      `🗑️ Eliminado: ${totalDeleted} objeto(s). Nodos: ${deletedNodes}, Líneas: ${deletedFrames}, Áreas: ${deletedAreas}`,
    );
  },

  // =========================================
  // ======== EDIT: COPY / PASTE / CUT =======
  // =========================================

};
