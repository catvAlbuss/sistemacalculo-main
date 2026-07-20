import { Beam, Node as StructuralNode } from "../../shapes.js";

/**
 * @mixin editClipboardMixin
 *
 * Operaciones de portapapeles: copiar, pegar y cortar objetos del modelo.
 *
 * El portapapeles interno (this.editClipboard) almacena una copia serializada
 * de los objetos seleccionados. Al pegar, los nodos se reindexan para no
 * colisionar con los existentes y se aplica un offset incremental para que
 * cada pegado quede visualmente separado del anterior.
 *
 * El paste es sensible a la vista activa: en vista de planta el offset es en
 * XY, en elevación en XZ o YZ según corresponda.
 *
 * Responsabilidades:
 * - copy()                              → copia los objetos seleccionados al portapapeles
 * - cut()                               → copia y luego elimina los originales
 * - paste()                             → pega el portapapeles con offset incremental
 * - createEditClipboardFromSelection()  → serializa la selección actual
 * - transformPointForPaste(point)       → aplica el offset según la vista activa
 * - getActiveViewSignature()            → identifica la vista para calcular offset
 * - getNextEditNodeId / getNextEditFrameId → generadores de IDs únicos
 */
export const editClipboardMixin = {

  getNextEditNodeId() {
    const maxId = Math.max(0, ...(this.nodes || []).map((node) => Number(node.id || 0)));

    const next = Math.max(Number(this.nextNodeId || 1), maxId + 1);
    this.nextNodeId = next + 1;

    return next;
  },

  getNextEditFrameId() {
    const maxId = Math.max(0, ...(this.shapes || []).map((frame) => Number(frame.id || 0)));

    const next = Math.max(Number(this.nextBeamId || 1), maxId + 1);
    this.nextBeamId = next + 1;

    return next;
  },

  getNextEditGenericId(list = []) {
    return Math.max(0, ...list.map((item) => Number(item?.id || 0))) + 1;
  },

  // Este metodo compara y devuelve offset cero si la vista cambió
  getEditPasteOffset() {
    const view = this.viewSet?.[this.activeViewIndex];
    const step = 1;
    const count = Math.max(1, Number(this.editPasteCount || 1));

    // Si no hay clipboard o la vista ha cambiado, offset cero
    if (this.editClipboard && this.editClipboard.sourceViewSignature) {
      const currentSig = this.getActiveViewSignature?.();
      if (currentSig && currentSig !== this.editClipboard.sourceViewSignature) {
        return { x: 0, y: 0, z: 0 };
      }
    }

    // Planta X-Y: desplazar en X e Y
    if (!view || view.type === "plan") {
      return {
        x: step * count,
        y: step * count,
        z: 0,
      };
    }

    // Elevación eje X: plano Y-Z, X queda fijo
    if (view.type === "elevation" && view.axis === "X") {
      return {
        x: 0,
        y: step * count,
        z: step * count,
      };
    }

    // Elevación eje Y: plano X-Z, Y queda fijo
    if (view.type === "elevation" && view.axis === "Y") {
      return {
        x: step * count,
        y: 0,
        z: step * count,
      };
    }

    return {
      x: step * count,
      y: step * count,
      z: 0,
    };
  },

  offsetEditPoint(point, offset) {
    return {
      ...(point || {}),
      x: Number(point?.x || 0) + Number(offset.x || 0),
      y: Number(point?.y || 0) + Number(offset.y || 0),
      z: Number(point?.z || 0) + Number(offset.z || 0),
    };
  },

  createEditClipboardFromSelection() {
    const selectedObjects =
      this.getEditSelectedObjects?.({
        respectActiveView: false, // reconoce tambien la seleccion hecha en el 3D
      }) || [];

    if (!selectedObjects.length) {
      return null;
    }

    const selectedNodes = selectedObjects.filter((obj) => this.isEditNodeObject(obj));

    const selectedFrames = selectedObjects.filter((obj) => this.isEditFrameObject(obj));

    const selectedAreas = selectedObjects.filter((obj) => this.isEditAreaObject(obj));

    const selectedDimensions = selectedObjects.filter((obj) => this.isEditDimensionLineObject(obj));

    const nodeSet = new Set(selectedNodes);

    // Si se copia una barra, también necesitamos copiar sus nodos extremos.
    selectedFrames.forEach((frame) => {
      if (frame.node1) nodeSet.add(frame.node1);
      if (frame.node2) nodeSet.add(frame.node2);
    });

    const nodeIds = new Set([...nodeSet].map((node) => Number(node.id)));

    const frameIds = new Set(selectedFrames.map((frame) => Number(frame.id)));

    // Si la selección es solo de nodos (arrastre izquierda→derecha), incluir automáticamente
    // las barras cuyos dos extremos estén en el conjunto de nodos seleccionados.
    if (selectedFrames.length === 0 && nodeSet.size > 0) {
      (this.shapes || []).forEach((frame) => {
        if (frame?.node1 && frame?.node2 && nodeSet.has(frame.node1) && nodeSet.has(frame.node2)) {
          frameIds.add(Number(frame.id));
        }
      });
    }

    const areaIds = new Set(selectedAreas.map((area) => Number(area.id)));

    const dimensionIds = new Set(selectedDimensions.map((dim) => Number(dim.id)));

    const snapshot = this.createModelSnapshot?.("Clipboard") || null;

    if (!snapshot) {
      this.showMessage?.("No se pudo crear el portapapeles de Edit.", "warning");
      return null;
    }

    const clipboard = {
      type: "edit-clipboard",
      createdAt: new Date().toISOString(),

      nodes: (snapshot.nodes || []).filter((node) => nodeIds.has(Number(node.id))),

      frames: (snapshot.frames || []).filter((frame) => frameIds.has(Number(frame.id))),

      areas: (snapshot.areas || []).filter((area) => areaIds.has(Number(area.id))),

      dimensionLines: (snapshot.dimensionLines || []).filter((dim) => dimensionIds.has(Number(dim.id))),
    };

    clipboard.summary = {
      nodes: clipboard.nodes.length,
      frames: clipboard.frames.length,
      areas: clipboard.areas.length,
      dimensions: clipboard.dimensionLines.length,
      total:
        clipboard.nodes.length + clipboard.frames.length + clipboard.areas.length + clipboard.dimensionLines.length,
    };

    return clipboard;
  },

  copy() {
    const clipboard = this.createEditClipboardFromSelection();

    if (!clipboard || clipboard.summary.total === 0) {
      this.showMessage?.("📋 Selecciona objetos para copiar.", "warning");
      console.warn("EDIT Copy: no hay selección.");
      return;
    }

    this.editClipboard = clipboard;
    this.editPasteCount = 0;
    this.editClipboard.sourceViewSignature = this.getActiveViewSignature?.(); // ← agregar

    console.log("📋 EDIT Copy:", clipboard);

    this.showMessage?.(
      `📋 Copiado: ${clipboard.summary.total} objeto(s). ` +
        `Nodos: ${clipboard.summary.nodes}, Líneas: ${clipboard.summary.frames}, Áreas: ${clipboard.summary.areas}`,
    );
  },

  paste() {
    if (!this.editClipboard || this.editClipboard.type !== "edit-clipboard") {
      this.showMessage?.("📌 No hay objetos copiados para pegar.", "warning");
      console.warn("EDIT Paste: portapapeles vacío.");
      return;
    }

    this.saveUndoState?.("Paste objects");

    this.editPasteCount = Number(this.editPasteCount || 0) + 1;

    const offset = this.getEditPasteOffset();

    const clipboard = this.cloneEditPlainData(this.editClipboard);
    if (clipboard.frames) {
    clipboard.frames.forEach(frame => {
        delete frame.selected;
        delete frame.isSelected;
        delete frame.highlighted3D;
        delete frame.is3DOnlyFrame;
        delete frame.isCrossViewFrame;
        delete frame.showIn2D;
    });
}
    const oldNodeIdToNewNode = new Map();

    this.clearEditSelectionFlags?.();

    const pastedNodes = [];
    const pastedFrames = [];
    const pastedAreas = [];
    const pastedDimensions = [];

    // ==========================
    // 1. Pegar nodos
    // ==========================
    (clipboard.nodes || []).forEach((nodeData) => {
      const oldId = Number(nodeData.id);
      const p = this.transformPointForPaste(nodeData.position, offset, this);

      const newNode = new StructuralNode(
        {
          x: Number(p.x || 0),
          y: Number(p.y || 0),
        },
        this.getNextEditNodeId(),
        Number(p.z || 0),
      );

      newNode.position.x = Number(p.x || 0);
      newNode.position.y = Number(p.y || 0);
      newNode.position.z = Number(p.z || 0);

      newNode.beams = [];
      newNode.selected = true;
      newNode.isSelected = true;

      newNode.soporte = nodeData.soporte || "";
      newNode.force = this.cloneEditPlainData(nodeData.force) || newNode.force;
      newNode.reaction = this.cloneEditPlainData(nodeData.reaction) || newNode.reaction;

      newNode.restraints = this.cloneEditPlainData(nodeData.restraints);
      newNode.constraints = this.cloneEditPlainData(nodeData.constraints);

      newNode.diaphragm = this.cloneEditPlainData(nodeData.diaphragm);
      newNode.diaphragmId = nodeData.diaphragmId ?? null;
      newNode.diaphragmName = nodeData.diaphragmName ?? null;

      newNode.pointSprings = this.cloneEditPlainData(nodeData.pointSprings);
      newNode.springs = this.cloneEditPlainData(nodeData.springs);

      newNode.pointLoads = this.cloneEditPlainData(nodeData.pointLoads) || [];
      newNode.jointLoads = this.cloneEditPlainData(nodeData.jointLoads) || [];

      newNode.groupIds = this.cloneEditPlainData(nodeData.groupIds) || [];
      newNode.groupNames = this.cloneEditPlainData(nodeData.groupNames) || [];
      newNode.groups = this.cloneEditPlainData(nodeData.groups) || [];

      newNode.assignment = this.cloneEditPlainData(nodeData.assignment) || {};
      newNode.visible = nodeData.visible !== false;

      this.nodes.push(newNode);
      oldNodeIdToNewNode.set(oldId, newNode);
      pastedNodes.push(newNode);
    });

    // ==========================
    // 2. Pegar barras / frames
    // ==========================
    (clipboard.frames || []).forEach((frameData) => {
      const node1 = oldNodeIdToNewNode.get(Number(frameData.node1Id));
      const node2 = oldNodeIdToNewNode.get(Number(frameData.node2Id));

      if (!node1 || !node2) return;

      const newFrame = new Beam(frameData.E ?? this.globalE, frameData._A ?? this.globalA);

      newFrame.id = this.getNextEditFrameId();

      newFrame.node1 = node1;
      newFrame.node2 = node2;

      newFrame.E = frameData.E ?? this.globalE;
      newFrame._A = frameData._A ?? this.globalA;

      newFrame.elementType = frameData.elementType || "beam";
      newFrame.type = frameData.type || newFrame.elementType;
      newFrame.objectType = frameData.objectType || "frame";
      newFrame.visible = frameData.visible !== false;

      newFrame.selected = true;
      newFrame.isSelected = true;
      newFrame.highlighted3D = false;   // ← importante: desactivar resaltado
      this.recalcFrame3DOnly(newFrame);

      newFrame.fAxial = Number(frameData.fAxial || 0);

      newFrame.sectionId = frameData.sectionId ?? null;
      newFrame.sectionName = frameData.sectionName ?? null;
      newFrame.frameSection = this.cloneEditPlainData(frameData.frameSection);
      newFrame.section = this.cloneEditPlainData(frameData.section);
      newFrame.hasAssignedSection = frameData.hasAssignedSection === true;

      newFrame.releases = this.cloneEditPlainData(frameData.releases);
      newFrame.frameReleases = this.cloneEditPlainData(frameData.frameReleases);
      newFrame.hasFrameReleases = frameData.hasFrameReleases === true;

      newFrame.endOffsets = this.cloneEditPlainData(frameData.endOffsets);
      newFrame.frameEndOffsets = this.cloneEditPlainData(frameData.frameEndOffsets);
      newFrame.hasEndOffsets = frameData.hasEndOffsets === true;

      newFrame.frameLoads = this.cloneEditPlainData(frameData.frameLoads) || [];
      newFrame.lineLoads = this.cloneEditPlainData(frameData.lineLoads) || [];
      newFrame.hasFrameLoads = frameData.hasFrameLoads === true;
      newFrame.hasLineLoads = frameData.hasLineLoads === true;

      newFrame.groupIds = this.cloneEditPlainData(frameData.groupIds) || [];
      newFrame.groupNames = this.cloneEditPlainData(frameData.groupNames) || [];
      newFrame.groups = this.cloneEditPlainData(frameData.groups) || [];
      newFrame.hasGroups = frameData.hasGroups === true;

      newFrame.assignment = this.cloneEditPlainData(frameData.assignment) || {};

      newFrame.designOverwrites = this.cloneEditPlainData(frameData.designOverwrites) || {};
      newFrame.designResults = this.cloneEditPlainData(frameData.designResults) || {};

      newFrame.steelFrameDesignResult = this.cloneEditPlainData(frameData.steelFrameDesignResult);
      newFrame.steelJoistDesignResult = this.cloneEditPlainData(frameData.steelJoistDesignResult);

      newFrame.steelFrameDesignOverwrites = this.cloneEditPlainData(frameData.steelFrameDesignOverwrites);
      newFrame.steelJoistDesignOverwrites = this.cloneEditPlainData(frameData.steelJoistDesignOverwrites);

      newFrame.designType = frameData.designType ?? null;
      newFrame.isSteelJoist = frameData.isSteelJoist === true;

      this.shapes.push(newFrame);

      if (!node1.beams) node1.beams = [];
      if (!node2.beams) node2.beams = [];

      node1.beams.push(newFrame);
      node2.beams.push(newFrame);

      pastedFrames.push(newFrame);
    });

    // ==========================
    // 3. Pegar áreas
    // ==========================
    (clipboard.areas || []).forEach((areaData) => {
      const newArea = this.cloneEditPlainData(areaData);

      newArea.id = this.getNextEditGenericId(this.areas || []);
      newArea.selected = true;
      newArea.isSelected = true;

      if (Array.isArray(newArea.points)) {
        newArea.points = newArea.points.map((point) => this.transformPointForPaste(point, offset, this));
      }

      if (typeof newArea.z === "number") {
        newArea.z = Number(newArea.z || 0) + Number(offset.z || 0);
      }

      this.areas.push(newArea);
      pastedAreas.push(newArea);
    });

    // ==========================
    // 4. Pegar líneas de dimensión
    // ==========================
    (clipboard.dimensionLines || []).forEach((dimData) => {
      const newDim = this.cloneEditPlainData(dimData);

      newDim.id = this.getNextEditGenericId(this.dimensionLines || []);
      newDim.selected = true;
      newDim.isSelected = true;

      if (newDim.start) {
        newDim.start = this.transformPointForPaste(newDim.start, offset, this);
      }

      if (newDim.end) {
        newDim.end = this.transformPointForPaste(newDim.end, offset, this);
      }

      this.dimensionLines.push(newDim);
      pastedDimensions.push(newDim);
    });

    // Evita que una barra vieja cortada/eliminada sigata como seleccionada después de pegar, lo que podría causar confusión.
    this.clearEditSelectionFlags?.();

    if (pastedFrames.length > 0) {
      this.setState?.(this.selectedBeamsState, {
        selectedBeams: pastedFrames,
      });
    } else if (pastedNodes.length > 0) {
      this.setState?.(this.selectedNodesState, {
        selectedNodes: pastedNodes,
      });
    } else if (pastedAreas.length > 0) {
      this.setState?.(this.selectedAreasState, {
        selectedAreas: pastedAreas,
      });
    } else if (pastedDimensions.length > 0) {
      this.setState?.(this.selectedDimensionLinesState, {
        selectedDimensionLines: pastedDimensions,
      });
    }

    this.markAnalysisResultsOutdated?.("Se modificó el modelo o sus asignaciones.");
    this.redraw?.();

    if (pastedNodes.length > 0 || pastedFrames.length > 0 || pastedAreas.length > 0) {
      this.sync3D?.();
    }

    const total = pastedNodes.length + pastedFrames.length + pastedAreas.length + pastedDimensions.length;

    console.log("📌 EDIT Paste:", {
      offset,
      pastedNodes,
      pastedFrames,
      pastedAreas,
      pastedDimensions,
      total,
    });

    this.showMessage?.(
      `📌 Pegado: ${total} objeto(s). ` +
        `Nodos: ${pastedNodes.length}, Líneas: ${pastedFrames.length}, Áreas: ${pastedAreas.length}`,
    );
  },

  cut() {
    const clipboard = this.createEditClipboardFromSelection();

    if (!clipboard || clipboard.summary.total === 0) {
      this.showMessage?.("✂️ Selecciona objetos para cortar.", "warning");
      console.warn("EDIT Cut: no hay selección.");
      return;
    }

    this.editClipboard = clipboard;
    this.editPasteCount = 0;

    this.deleteSelected();

    console.log("✂️ EDIT Cut:", clipboard);

    this.showMessage?.(`✂️ Cortado: ${clipboard.summary.total} objeto(s).`);
  },

  getActiveViewSignature() {
    const view = this.viewSet?.[this.activeViewIndex];
    if (!view) return "none";
    if (view.type === "plan") {
      return `plan:z=${Number(view.elevation ?? 0)}`;
    }
    return `elevation:${view.axis}=${Number(view.value ?? 0)}`;
  },

  transformPointForPaste(point, offset, context) {
    if (!point) return { x: 0, y: 0, z: 0 };
    // Aplicar offset primero
    let x = (point.x || 0) + (offset.x || 0);
    let y = (point.y || 0) + (offset.y || 0);
    let z = (point.z || 0) + (offset.z || 0);

    const view = context.viewSet?.[context.activeViewIndex];
    if (!view) return { x, y, z };

    if (view.type === "plan") {
      // En planta: la coordenada Z se fija al nivel del piso activo
      const targetZ = context.getActivePlanElevation?.() ?? 0;
      z = targetZ;
    } else if (view.type === "elevation") {
      if (view.axis === "Y") {
        // Elevación Y (plano X-Z): Y es fijo según la vista
        const fixedY = Number(view.value ?? 0);
        y = fixedY;
        // X y Z mantienen el offset y la transformación original
      } else if (view.axis === "X") {
        // Elevación X (plano Y-Z): X es fijo según la vista
        const fixedX = Number(view.value ?? 0);
        x = fixedX;
        // Y y Z mantienen el offset y la transformación original
      }
    }
    return { x, y, z };
  },

  recalcFrame3DOnly(frame) {
    if (!frame?.node1?.position || !frame?.node2?.position) return;
    const p1 = frame.node1.position;
    const p2 = frame.node2.position;
    const tol = 0.001;
    const dx = Math.abs(p2.x - p1.x);
    const dy = Math.abs(p2.y - p1.y);
    const dz = Math.abs(p2.z - p1.z);

    const view = this.viewSet?.[this.activeViewIndex];
    let is3D;

    if (view?.type === "elevation" && view.axis === "Y") {
      // Plano X-Z: solo es 3D-only si la barra sale del plano (variación en Y)
      is3D = dy > tol;
    } else if (view?.type === "elevation" && view.axis === "X") {
      // Plano Y-Z: solo es 3D-only si la barra sale del plano (variación en X)
      is3D = dx > tol;
    } else {
      // Planta u otras vistas: 3D-only si tiene altura Y variación horizontal
      is3D = dz > tol && (dx > tol || dy > tol);
    }

    frame.is3DOnlyFrame = is3D;
    frame.isCrossViewFrame = is3D;
    frame.showIn2D = !is3D;
  },
};
