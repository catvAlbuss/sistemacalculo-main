import { Beam, Node as StructuralNode } from "../../model/shapes.js";

/**
 * @mixin undoRedoMixin
 *
 * Historial de deshacer/rehacer basado en snapshots del modelo.
 *
 * Cada vez que el usuario realiza una operación destructiva (dibujar,
 * borrar, mover, etc.) se llama a saveUndoState() que serializa una copia
 * profunda del modelo en this.undoStack. El redo stack se llena cuando
 * el usuario deshace.
 *
 * La serialización clona solo los datos planos (no funciones ni referencias
 * circulares) para que el snapshot sea pequeño y seguro de restaurar.
 *
 * Responsabilidades:
 * - saveUndoState()                     → guarda el estado actual en undoStack
 * - undo()                              → restaura el último estado guardado
 * - redo()                              → rehace el último undo
 * - createModelSnapshot()               → serializa nodes/shapes/areas a datos planos
 * - restoreModelSnapshot(snapshot)      → reconstruye instancias Beam/Node desde snapshot
 * - cloneEditPlainData(obj)             → clonación profunda segura de datos planos
 * - saveState() / restoreState(state)   → alias de snapshot para compatibilidad
 */
export const undoRedoMixin = {
  // =========================================
  // ========== EDIT: UNDO / REDO ============
  // =========================================

  cloneEditPlainData(data) {
    if (data === undefined || data === null) return data;

    try {
      return JSON.parse(JSON.stringify(data));
    } catch (error) {
      console.warn("No se pudo clonar data de Edit:", data, error);
      return null;
    }
  },

  createModelSnapshot(label = "") {
    const nodes = (this.nodes || []).map((node, index) => {
      const p = node.position || {};

      return {
        id: Number(node.id ?? index + 1),
        position: {
          x: Number(p.x || 0),
          y: Number(p.y || 0),
          z: Number(p.z || 0),
        },

        soporte: node.soporte || "",
        force: this.cloneEditPlainData(node.force),
        reaction: this.cloneEditPlainData(node.reaction),

        restraints: this.cloneEditPlainData(node.restraints),
        constraints: this.cloneEditPlainData(node.constraints),

        diaphragm: this.cloneEditPlainData(node.diaphragm),
        diaphragmId: node.diaphragmId ?? null,
        diaphragmName: node.diaphragmName ?? null,

        pointSprings: this.cloneEditPlainData(node.pointSprings),
        springs: this.cloneEditPlainData(node.springs),

        pointLoads: this.cloneEditPlainData(node.pointLoads),
        jointLoads: this.cloneEditPlainData(node.jointLoads),

        groupIds: this.cloneEditPlainData(node.groupIds),
        groupNames: this.cloneEditPlainData(node.groupNames),
        groups: this.cloneEditPlainData(node.groups),

        assignment: this.cloneEditPlainData(node.assignment),
        visible: node.visible !== false,
      };
    });

    const frames = (this.shapes || [])
      .filter((frame) => frame?.node1 && frame?.node2)
      .map((frame, index) => {
        return {
          id: Number(frame.id ?? index + 1),

          node1Id: Number(frame.node1?.id ?? 0),
          node2Id: Number(frame.node2?.id ?? 0),

          E: frame.E ?? this.globalE,
          _A: frame._A ?? this.globalA,

          elementType: frame.elementType || frame.type || "beam",
          type: frame.type || frame.elementType || "beam",
          objectType: frame.objectType || "frame",
          visible: frame.visible !== false,

          fAxial: Number(frame.fAxial || 0),

          sectionId: frame.sectionId ?? null,
          sectionName: frame.sectionName ?? null,
          frameSection: this.cloneEditPlainData(frame.frameSection),
          section: this.cloneEditPlainData(frame.section),
          hasAssignedSection: frame.hasAssignedSection === true,

          releases: this.cloneEditPlainData(frame.releases),
          frameReleases: this.cloneEditPlainData(frame.frameReleases),
          hasFrameReleases: frame.hasFrameReleases === true,

          endOffsets: this.cloneEditPlainData(frame.endOffsets),
          frameEndOffsets: this.cloneEditPlainData(frame.frameEndOffsets),
          hasEndOffsets: frame.hasEndOffsets === true,

          frameLoads: this.cloneEditPlainData(frame.frameLoads),
          lineLoads: this.cloneEditPlainData(frame.lineLoads),
          hasFrameLoads: frame.hasFrameLoads === true,
          hasLineLoads: frame.hasLineLoads === true,

          groupIds: this.cloneEditPlainData(frame.groupIds),
          groupNames: this.cloneEditPlainData(frame.groupNames),
          groups: this.cloneEditPlainData(frame.groups),
          hasGroups: frame.hasGroups === true,

          assignment: this.cloneEditPlainData(frame.assignment),

          designOverwrites: this.cloneEditPlainData(frame.designOverwrites),
          designResults: this.cloneEditPlainData(frame.designResults),

          steelFrameDesignResult: this.cloneEditPlainData(frame.steelFrameDesignResult),
          steelJoistDesignResult: this.cloneEditPlainData(frame.steelJoistDesignResult),

          steelFrameDesignOverwrites: this.cloneEditPlainData(frame.steelFrameDesignOverwrites),
          steelJoistDesignOverwrites: this.cloneEditPlainData(frame.steelJoistDesignOverwrites),

          designType: frame.designType ?? null,
          isSteelJoist: frame.isSteelJoist === true,
        };
      });

    const areas = this.cloneEditPlainData(this.areas || []);
    const dimensionLines = this.cloneEditPlainData(this.dimensionLines || []);
    const referencePoints = this.cloneEditPlainData(this.referencePoints || []);

    const referenceGrid = this.cloneEditPlainData(this.referenceGrid || null);
    const stories = this.cloneEditPlainData(this.stories || []);

    const referencePlanes = this.cloneEditPlainData(this.referencePlanes || []);

    return {
      label,
      createdAt: new Date().toISOString(),

      nodes,
      frames,
      areas,
      dimensionLines,
      referencePoints,

      // Datos del modelo / grillas / pisos
      referenceGrid,
      stories,
      referencePlanes,
      gridDisplayMode: this.gridDisplayMode || "ordinates",
      activeViewIndex: Number(this.activeViewIndex || 0),
      currentViewMode: this.currentViewMode || "plan",
      currentElevationX: this.currentElevationX || "none",
      currentElevationZ: this.currentElevationZ || "none",
      currentZ: Number(this.currentZ || 0),
      activeStory: Number(this.activeStory || 0),

      nextNodeId: this.nextNodeId ?? (this.nodes?.length || 0) + 1,
      nextBeamId: this.nextBeamId ?? (this.shapes?.length || 0) + 1,
    };
  },

  restoreModelSnapshot(snapshot, options = {}) {
    if (!snapshot) return;

    const nodeById = new Map();

    this.nodes = [];
    this.shapes = [];
    this.areas = [];
    this.dimensionLines = [];
    this.referencePoints = [];

    // ==========================
    // Restaurar nodos
    // ==========================
    (snapshot.nodes || []).forEach((nodeData, index) => {
      const p = nodeData.position || {};

      const node = new StructuralNode(
        {
          x: Number(p.x || 0),
          y: Number(p.y || 0),
        },
        Number(nodeData.id ?? index + 1),
        Number(p.z || 0),
      );

      node.position.x = Number(p.x || 0);
      node.position.y = Number(p.y || 0);
      node.position.z = Number(p.z || 0);

      node.beams = [];
      node.selected = false;
      node.isSelected = false;

      node.soporte = nodeData.soporte || "";
      node.force = this.cloneEditPlainData(nodeData.force) || node.force;
      node.reaction = this.cloneEditPlainData(nodeData.reaction) || node.reaction;

      node.restraints = this.cloneEditPlainData(nodeData.restraints);
      node.constraints = this.cloneEditPlainData(nodeData.constraints);

      node.diaphragm = this.cloneEditPlainData(nodeData.diaphragm);
      node.diaphragmId = nodeData.diaphragmId ?? null;
      node.diaphragmName = nodeData.diaphragmName ?? null;

      node.pointSprings = this.cloneEditPlainData(nodeData.pointSprings);
      node.springs = this.cloneEditPlainData(nodeData.springs);

      node.pointLoads = this.cloneEditPlainData(nodeData.pointLoads) || [];
      node.jointLoads = this.cloneEditPlainData(nodeData.jointLoads) || [];

      node.groupIds = this.cloneEditPlainData(nodeData.groupIds) || [];
      node.groupNames = this.cloneEditPlainData(nodeData.groupNames) || [];
      node.groups = this.cloneEditPlainData(nodeData.groups) || [];

      node.assignment = this.cloneEditPlainData(nodeData.assignment) || {};
      node.visible = nodeData.visible !== false;

      this.nodes.push(node);
      nodeById.set(Number(node.id), node);
    });

    // ==========================
    // Restaurar barras / frames
    // ==========================
    (snapshot.frames || []).forEach((frameData, index) => {
      const node1 = nodeById.get(Number(frameData.node1Id));
      const node2 = nodeById.get(Number(frameData.node2Id));

      if (!node1 || !node2) return;

      const frame = new Beam(frameData.E ?? this.globalE, frameData._A ?? this.globalA);

      frame.node1 = node1;
      frame.node2 = node2;

      frame.id = Number(frameData.id ?? index + 1);
      frame.E = frameData.E ?? this.globalE;
      frame._A = frameData._A ?? this.globalA;

      frame.elementType = frameData.elementType || "beam";
      frame.type = frameData.type || frame.elementType;
      frame.objectType = frameData.objectType || "frame";
      frame.visible = frameData.visible !== false;

      frame.selected = false;
      frame.isSelected = false;

      frame.fAxial = Number(frameData.fAxial || 0);

      frame.sectionId = frameData.sectionId ?? null;
      frame.sectionName = frameData.sectionName ?? null;
      frame.frameSection = this.cloneEditPlainData(frameData.frameSection);
      frame.section = this.cloneEditPlainData(frameData.section);
      frame.hasAssignedSection = frameData.hasAssignedSection === true;

      frame.releases = this.cloneEditPlainData(frameData.releases);
      frame.frameReleases = this.cloneEditPlainData(frameData.frameReleases);
      frame.hasFrameReleases = frameData.hasFrameReleases === true;

      frame.endOffsets = this.cloneEditPlainData(frameData.endOffsets);
      frame.frameEndOffsets = this.cloneEditPlainData(frameData.frameEndOffsets);
      frame.hasEndOffsets = frameData.hasEndOffsets === true;

      frame.frameLoads = this.cloneEditPlainData(frameData.frameLoads) || [];
      frame.lineLoads = this.cloneEditPlainData(frameData.lineLoads) || [];
      frame.hasFrameLoads = frameData.hasFrameLoads === true;
      frame.hasLineLoads = frameData.hasLineLoads === true;

      frame.groupIds = this.cloneEditPlainData(frameData.groupIds) || [];
      frame.groupNames = this.cloneEditPlainData(frameData.groupNames) || [];
      frame.groups = this.cloneEditPlainData(frameData.groups) || [];
      frame.hasGroups = frameData.hasGroups === true;

      frame.assignment = this.cloneEditPlainData(frameData.assignment) || {};

      frame.designOverwrites = this.cloneEditPlainData(frameData.designOverwrites) || {};
      frame.designResults = this.cloneEditPlainData(frameData.designResults) || {};

      frame.steelFrameDesignResult = this.cloneEditPlainData(frameData.steelFrameDesignResult);
      frame.steelJoistDesignResult = this.cloneEditPlainData(frameData.steelJoistDesignResult);

      frame.steelFrameDesignOverwrites = this.cloneEditPlainData(frameData.steelFrameDesignOverwrites);
      frame.steelJoistDesignOverwrites = this.cloneEditPlainData(frameData.steelJoistDesignOverwrites);

      frame.designType = frameData.designType ?? null;
      frame.isSteelJoist = frameData.isSteelJoist === true;

      this.shapes.push(frame);

      if (!node1.beams) node1.beams = [];
      if (!node2.beams) node2.beams = [];

      if (!node1.beams.includes(frame)) node1.beams.push(frame);
      if (!node2.beams.includes(frame)) node2.beams.push(frame);
    });

    this.areas = this.cloneEditPlainData(snapshot.areas || []) || [];
    this.dimensionLines = this.cloneEditPlainData(snapshot.dimensionLines || []) || [];
    this.referencePoints = this.cloneEditPlainData(snapshot.referencePoints || []) || [];
    this.referencePlanes = this.cloneEditPlainData(snapshot.referencePlanes || []) || [];

    // ==========================
    // Restaurar grillas / líneas de referencia / pisos
    // ==========================
    if (snapshot.referenceGrid) {
      this.referenceGrid = this.cloneEditPlainData(snapshot.referenceGrid);

      this.gridDisplayMode = snapshot.gridDisplayMode || this.gridDisplayMode || "ordinates";

      this.stories = this.cloneEditPlainData(snapshot.stories || this.stories || []);

      this.rebuildReferenceGridCaches?.();
      this.rebuildGeneralGrids?.();
      this.rebuildViewSetFromReferenceGrid?.();
      this.rebuildElevationListsFromReferenceGrid?.();

      if (Array.isArray(this.viewSet) && this.viewSet.length > 0) {
        this.activeViewIndex = Math.min(Number(snapshot.activeViewIndex || 0), this.viewSet.length - 1);
      } else {
        this.activeViewIndex = 0;
      }

      const activeView = this.viewSet?.[this.activeViewIndex];

      if (!activeView || activeView.type === "plan") {
        this.currentViewMode = "plan";
        this.currentZ = Number(activeView?.elevation ?? snapshot.currentZ ?? 0);
        this.activeStory = Number(snapshot.activeStory || 0);
      }

      if (activeView?.type === "elevation") {
        this.currentViewMode = "elevation";

        if (activeView.axis === "X") {
          this.currentElevationX = activeView.label || activeView.name || snapshot.currentElevationX || "none";
        }

        if (activeView.axis === "Y") {
          this.currentElevationZ = activeView.label || activeView.name || snapshot.currentElevationZ || "none";
        }
      }

      this.activeGridPoint = null;
    }

    this.reindexModelObjects?.();

    this.nextNodeId = snapshot.nextNodeId ?? Math.max(...this.nodes.map((node) => Number(node.id || 0)), 0) + 1;

    this.nextBeamId = snapshot.nextBeamId ?? Math.max(...this.shapes.map((frame) => Number(frame.id || 0)), 0) + 1;

    this.clearEditSelectionFlags?.();

    this.redraw?.();

    if (options.sync3D !== false) {
      this.sync3D?.();
    }

    this.rebuildGroupMemberships?.();

    // Deshacer/rehacer también cambian el modelo → autoguardar.
    this.scheduleAutosave?.();
  },

  saveUndoState(label = "Edit action") {
    if (!Array.isArray(this.undoStack)) this.undoStack = [];
    if (!Array.isArray(this.redoStack)) this.redoStack = [];

    const snapshot = this.createModelSnapshot(label);

    this.undoStack.push(snapshot);

    const max = Number(this.maxUndoSteps || 30);

    if (this.undoStack.length > max) {
      this.undoStack.shift();
    }

    // Si hago una acción nueva, ya no corresponde rehacer acciones antiguas.
    this.redoStack = [];

    console.log("💾 Undo guardado:", {
      label,
      undoCount: this.undoStack.length,
      redoCount: this.redoStack.length,
    });

    // Autoguardado local (IndexedDB): cada cambio marca el modelo como sucio y
    // agenda un guardado con debounce. Se pasa la ETIQUETA de la acción para el
    // historial de snapshots (así cada cambio queda identificado).
    this.scheduleAutosave?.(label);
  },

  undo() {
    if (!Array.isArray(this.undoStack) || this.undoStack.length === 0) {
      this.showMessage?.("↩️ No hay acciones para deshacer", "warning");
      return;
    }

    if (!Array.isArray(this.redoStack)) this.redoStack = [];

    const currentSnapshot = this.createModelSnapshot("Redo snapshot");
    this.redoStack.push(currentSnapshot);

    const previousSnapshot = this.undoStack.pop();

    this.restoreModelSnapshot(previousSnapshot);

    this.showMessage?.(`↩️ Undo: ${previousSnapshot.label || "acción anterior"}`);

    console.log("↩️ Undo ejecutado:", {
      restored: previousSnapshot.label,
      undoCount: this.undoStack.length,
      redoCount: this.redoStack.length,
    });
  },

  redo() {
    if (!Array.isArray(this.redoStack) || this.redoStack.length === 0) {
      this.showMessage?.("↪️ No hay acciones para rehacer", "warning");
      return;
    }

    if (!Array.isArray(this.undoStack)) this.undoStack = [];

    const currentSnapshot = this.createModelSnapshot("Undo snapshot");
    this.undoStack.push(currentSnapshot);

    const nextSnapshot = this.redoStack.pop();

    this.restoreModelSnapshot(nextSnapshot);

    this.showMessage?.(`↪️ Redo: ${nextSnapshot.label || "acción rehecha"}`);

    console.log("↪️ Redo ejecutado:", {
      restored: nextSnapshot.label,
      undoCount: this.undoStack.length,
      redoCount: this.redoStack.length,
    });
  },

  // Compatibilidad con funciones antiguas
  saveState() {
    return this.createModelSnapshot("Manual saveState");
  },

  restoreState(state) {
    this.restoreModelSnapshot(state);
  },

  // =========================================

};
