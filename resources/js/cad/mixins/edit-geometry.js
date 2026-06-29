import Swal from "sweetalert2";
import { Beam, Node as StructuralNode } from "../shapes.js";

/**
 * @mixin editGeometryMixin
 *
 * Operaciones geométricas sobre objetos del modelo estructural.
 *
 * Contiene todas las herramientas de edición que modifican la geometría:
 * replicar, mover, fusionar puntos, alinear, unir líneas, dividirlas y
 * extruir. Cada operación abre un diálogo Swal para que el usuario ingrese
 * parámetros, luego modifica this.nodes / this.shapes / this.areas y
 * llama a saveUndoState() antes de aplicar cambios.
 *
 * Responsabilidades:
 *
 * Replicar:
 * - replicate()                      → diálogo principal: lineal, radial o espejo
 * - replicateClipboardLinear(params) → replica en dirección XYZ N veces
 * - replicateClipboardOnce(params)   → replica una sola vez con offsets dados
 * - replicateElements(params)        → punto de entrada general de replicación
 *
 * Mover:
 * - openMovePointsLinesAreasDialog() → diálogo para mover por offset XYZ
 * - moveSelectedObjectsByOffset(dx, dy, dz) → aplica el desplazamiento
 *
 * Fusionar:
 * - openMergePointsDialog()          → diálogo con tolerancia de fusión
 * - mergePointsByTolerance(tol)      → fusiona nodos coincidentes dentro de tolerancia
 * - getMergeCandidateNodes()         → detecta pares de nodos candidatos
 * - buildMergeNodeClusters(pairs)    → agrupa nodos en clusters a fusionar
 * - mergeNodeCluster(cluster)        → fusiona un cluster en un único nodo
 * - removeZeroLengthAndDuplicateFrames() → limpia barras degeneradas tras fusión
 *
 * Alinear:
 * - openAlignPointsLinesEdgesDialog() → diálogo con eje y valor de alineación
 * - alignSelectedObjects(axis, value) → mueve objetos al valor dado en el eje
 *
 * Unir / Dividir:
 * - joinLines() / joinSelectedLines() → une dos barras colineales en una
 * - openDivideLinesDialog()           → diálogo para dividir barras en N partes
 * - divideSelectedLines(n)            → divide las barras seleccionadas
 *
 * Extruir:
 * - openExtrudePointsToLinesDialog()  → extruye nodos seleccionados en barras
 * - openExtrudeLinesToAreasDialog()   → extruye barras seleccionadas en áreas
 * - extrudePointsToLines(params)      → aplica la extrusión de puntos
 * - extrudeLinesToAreas(params)       → aplica la extrusión de líneas
 */
export const editGeometryMixin = {
  // ========== EDIT: REPLICATE ==============
  // =========================================

  async replicate() {
    const clipboard = this.createEditClipboardFromSelection?.();

    if (!clipboard || clipboard.summary?.total === 0) {
      this.showMessage?.("🔄 Selecciona objetos para replicar.", "warning");
      console.warn("EDIT Replicate: no hay selección.");
      return;
    }

    const result = await Swal.fire({
      title: "Replicate",
      width: 620,
      html: `
      <div style="text-align:left; font-size:13px;">
        <p style="margin-bottom:12px;">
          Crea copias lineales de los objetos seleccionados, similar a ETABS.
        </p>

        <div style="border:1px solid #555; border-radius:6px; padding:10px; margin-bottom:12px;">
          <div style="font-weight:bold; margin-bottom:8px;">
            Linear Replication
          </div>

          <div style="display:grid; grid-template-columns: 1fr 1fr 1fr; gap:10px; margin-bottom:10px;">
            <div>
              <label style="display:block; margin-bottom:5px;">DX</label>
              <input id="replicate-dx" type="number" step="0.001" value="1"
                style="width:100%; padding:7px;">
            </div>

            <div>
              <label style="display:block; margin-bottom:5px;">DY</label>
              <input id="replicate-dy" type="number" step="0.001" value="0"
                style="width:100%; padding:7px;">
            </div>

            <div>
              <label style="display:block; margin-bottom:5px;">DZ</label>
              <input id="replicate-dz" type="number" step="0.001" value="0"
                style="width:100%; padding:7px;">
            </div>
          </div>

          <div style="display:grid; grid-template-columns: 1fr 1fr; gap:10px;">
            <div>
              <label style="display:block; margin-bottom:5px;">Number of Copies</label>
              <input id="replicate-count" type="number" min="1" step="1" value="1"
                style="width:100%; padding:7px;">
            </div>

            <div style="display:flex; align-items:end;">
              <label style="display:flex; align-items:center; gap:8px; padding-bottom:8px;">
                <input id="replicate-select-new" type="checkbox" checked>
                Select replicated objects
              </label>
            </div>
          </div>
        </div>

        <div style="padding:10px; border:1px solid #555; border-radius:6px; color:#777; font-size:12px;">
          Objetos seleccionados para replicar:<br>
          Nodos: <b>${clipboard.summary.nodes}</b> |
          Líneas: <b>${clipboard.summary.frames}</b> |
          Áreas: <b>${clipboard.summary.areas}</b> |
          Dimensiones: <b>${clipboard.summary.dimensions}</b>
        </div>
      </div>
    `,
      showCancelButton: true,
      confirmButtonText: "Replicate",
      cancelButtonText: "Cancelar",
      preConfirm: () => {
        const dx = Number(document.getElementById("replicate-dx")?.value || 0);
        const dy = Number(document.getElementById("replicate-dy")?.value || 0);
        const dz = Number(document.getElementById("replicate-dz")?.value || 0);
        const count = Number(document.getElementById("replicate-count")?.value || 1);
        const selectNew = document.getElementById("replicate-select-new")?.checked === true;

        if (!Number.isFinite(dx) || !Number.isFinite(dy) || !Number.isFinite(dz)) {
          Swal.showValidationMessage("DX, DY y DZ deben ser valores numéricos.");
          return false;
        }

        if (!Number.isInteger(count) || count < 1) {
          Swal.showValidationMessage("Number of Copies debe ser un entero mayor o igual a 1.");
          return false;
        }

        if (dx === 0 && dy === 0 && dz === 0) {
          Swal.showValidationMessage("Define al menos un desplazamiento diferente de cero.");
          return false;
        }

        return {
          dx,
          dy,
          dz,
          count,
          selectNew,
        };
      },
    });

    if (!result.isConfirmed || !result.value) return;

    this.saveUndoState?.("Replicate objects");

    const summary = this.replicateClipboardLinear(clipboard, result.value);

    this.redraw?.();

    if (summary.nodes > 0 || summary.frames > 0 || summary.areas > 0) {
      this.sync3D?.();
    }

    console.log("🔄 EDIT Replicate ejecutado:", {
      options: result.value,
      summary,
    });

    this.showMessage?.(
      `🔄 Replicado: ${summary.total} objeto(s). ` +
        `Nodos: ${summary.nodes}, Líneas: ${summary.frames}, Áreas: ${summary.areas}`,
    );
  },

  replicateClipboardLinear(clipboard, options = {}) {
    const count = Number(options.count || 1);
    const dx = Number(options.dx || 0);
    const dy = Number(options.dy || 0);
    const dz = Number(options.dz || 0);
    const selectNew = options.selectNew !== false;

    const totalSummary = {
      nodes: 0,
      frames: 0,
      areas: 0,
      dimensions: 0,
      total: 0,
    };

    this.clearEditSelectionFlags?.();

    for (let i = 1; i <= count; i++) {
      const offset = {
        x: dx * i,
        y: dy * i,
        z: dz * i,
      };

      const partial = this.replicateClipboardOnce(clipboard, offset, {
        selectNew,
      });

      totalSummary.nodes += partial.nodes;
      totalSummary.frames += partial.frames;
      totalSummary.areas += partial.areas;
      totalSummary.dimensions += partial.dimensions;
      totalSummary.total += partial.total;
    }

    return totalSummary;
  },

  replicateClipboardOnce(clipboard, offset, options = {}) {
    const selectNew = options.selectNew !== false;

    const oldNodeIdToNewNode = new Map();

    const pastedNodes = [];
    const pastedFrames = [];
    const pastedAreas = [];
    const pastedDimensions = [];

    // ==========================
    // 1. Replicar nodos
    // ==========================
    (clipboard.nodes || []).forEach((nodeData) => {
      const oldId = Number(nodeData.id);
      const p = this.offsetEditPoint(nodeData.position, offset);

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

      newNode.selected = selectNew;
      newNode.isSelected = selectNew;

      if (selectNew && newNode.style?.selected) {
        newNode.style.selected();
      }

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
    // 2. Replicar barras / frames
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

      newFrame.selected = selectNew;
      newFrame.isSelected = selectNew;

      if (selectNew && newFrame.style?.selected) {
        newFrame.style.selected();
      }

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
    // 3. Replicar áreas
    // ==========================
    (clipboard.areas || []).forEach((areaData) => {
      const newArea = this.cloneEditPlainData(areaData);

      newArea.id = this.getNextEditGenericId(this.areas || []);
      newArea.selected = selectNew;
      newArea.isSelected = selectNew;

      if (Array.isArray(newArea.points)) {
        newArea.points = newArea.points.map((point) => this.offsetEditPoint(point, offset));
      }

      if (typeof newArea.z === "number") {
        newArea.z = Number(newArea.z || 0) + Number(offset.z || 0);
      }

      this.areas.push(newArea);
      pastedAreas.push(newArea);
    });

    // ==========================
    // 4. Replicar líneas de dimensión
    // ==========================
    (clipboard.dimensionLines || []).forEach((dimData) => {
      const newDim = this.cloneEditPlainData(dimData);

      newDim.id = this.getNextEditGenericId(this.dimensionLines || []);
      newDim.selected = selectNew;
      newDim.isSelected = selectNew;

      if (newDim.start) {
        newDim.start = this.offsetEditPoint(newDim.start, offset);
      }

      if (newDim.end) {
        newDim.end = this.offsetEditPoint(newDim.end, offset);
      }

      this.dimensionLines.push(newDim);
      pastedDimensions.push(newDim);
    });

    return {
      nodes: pastedNodes.length,
      frames: pastedFrames.length,
      areas: pastedAreas.length,
      dimensions: pastedDimensions.length,
      total: pastedNodes.length + pastedFrames.length + pastedAreas.length + pastedDimensions.length,
    };
  },

  // =========================================
  // ===== EDIT: MOVE POINTS/LINES/AREAS =====
  // =========================================

  getMoveDialogDefaultValues() {
    const view = this.viewSet?.[this.activeViewIndex];

    if (!view || view.type === "plan") {
      return {
        dx: 1,
        dy: 0,
        dz: 0,
        note: "Vista de planta: DX y DY mueven en el plano X-Y. DZ mueve en altura.",
      };
    }

    if (view.type === "elevation" && view.axis === "X") {
      return {
        dx: 0,
        dy: 1,
        dz: 0,
        note: "Elevación eje X: DY mueve horizontalmente en la elevación y DZ mueve verticalmente.",
      };
    }

    if (view.type === "elevation" && view.axis === "Y") {
      return {
        dx: 1,
        dy: 0,
        dz: 0,
        note: "Elevación eje Y: DX mueve horizontalmente en la elevación y DZ mueve verticalmente.",
      };
    }

    return {
      dx: 1,
      dy: 0,
      dz: 0,
      note: "Define el desplazamiento global del objeto seleccionado.",
    };
  },

  async openMovePointsLinesAreasDialog() {
    const selectedObjects =
      this.getEditSelectedObjects?.({
        respectActiveView: true,
      }) || [];

    if (!selectedObjects.length) {
      this.showMessage?.("↔️ Selecciona objetos para mover.", "warning");
      console.warn("EDIT Move: no hay selección.");
      return;
    }

    const summary = this.getEditSelectedSummary?.({
      respectActiveView: true,
    }) || {
      nodes: 0,
      frames: 0,
      areas: 0,
      dimensions: 0,
      total: selectedObjects.length,
    };

    const defaults = this.getMoveDialogDefaultValues();

    const result = await Swal.fire({
      title: "Move Points/Lines/Areas",
      width: 620,
      html: `
      <div style="text-align:left; font-size:13px;">
        <p style="margin-bottom:12px;">
          Mueve los objetos seleccionados mediante un desplazamiento global.
        </p>

        <div style="border:1px solid #555; border-radius:6px; padding:10px; margin-bottom:12px;">
          <div style="font-weight:bold; margin-bottom:8px;">
            Move Offset
          </div>

          <div style="display:grid; grid-template-columns: 1fr 1fr 1fr; gap:10px;">
            <div>
              <label style="display:block; margin-bottom:5px;">DX</label>
              <input id="move-dx" type="number" step="0.001" value="${defaults.dx}"
                style="width:100%; padding:7px;">
            </div>

            <div>
              <label style="display:block; margin-bottom:5px;">DY</label>
              <input id="move-dy" type="number" step="0.001" value="${defaults.dy}"
                style="width:100%; padding:7px;">
            </div>

            <div>
              <label style="display:block; margin-bottom:5px;">DZ</label>
              <input id="move-dz" type="number" step="0.001" value="${defaults.dz}"
                style="width:100%; padding:7px;">
            </div>
          </div>
        </div>

        <div style="padding:10px; border:1px solid #555; border-radius:6px; margin-bottom:12px; color:#777; font-size:12px;">
          ${defaults.note}
        </div>

        <div style="padding:10px; border:1px solid #555; border-radius:6px; color:#777; font-size:12px;">
          Objetos seleccionados:<br>
          Nodos: <b>${summary.nodes}</b> |
          Líneas: <b>${summary.frames}</b> |
          Áreas: <b>${summary.areas}</b> |
          Dimensiones: <b>${summary.dimensions}</b>
        </div>
      </div>
    `,
      showCancelButton: true,
      confirmButtonText: "Move",
      cancelButtonText: "Cancelar",
      preConfirm: () => {
        const dx = Number(document.getElementById("move-dx")?.value || 0);
        const dy = Number(document.getElementById("move-dy")?.value || 0);
        const dz = Number(document.getElementById("move-dz")?.value || 0);

        if (!Number.isFinite(dx) || !Number.isFinite(dy) || !Number.isFinite(dz)) {
          Swal.showValidationMessage("DX, DY y DZ deben ser valores numéricos.");
          return false;
        }

        if (dx === 0 && dy === 0 && dz === 0) {
          Swal.showValidationMessage("Define al menos un desplazamiento diferente de cero.");
          return false;
        }

        return {
          dx,
          dy,
          dz,
        };
      },
    });

    if (!result.isConfirmed || !result.value) return;

    this.saveUndoState?.("Move Points/Lines/Areas");

    const moveSummary = this.moveSelectedObjectsByOffset(result.value);

    this.redraw?.();

    if (moveSummary.nodes > 0 || moveSummary.frames > 0 || moveSummary.areas > 0) {
      this.sync3D?.();
    }

    console.log("↔️ EDIT Move ejecutado:", {
      offset: result.value,
      summary: moveSummary,
    });

    this.showMessage?.(
      `↔️ Movido: ${moveSummary.total} objeto(s). ` +
        `Nodos: ${moveSummary.nodes}, Líneas: ${moveSummary.frames}, Áreas: ${moveSummary.areas}`,
    );
  },

  moveSelectedObjectsByOffset(offset = {}) {
    const selectedObjects =
      this.getEditSelectedObjects?.({
        respectActiveView: true,
      }) || [];

    const selectedNodes = selectedObjects.filter((obj) => this.isEditNodeObject(obj));

    const selectedFrames = selectedObjects.filter((obj) => this.isEditFrameObject(obj));

    const selectedAreas = selectedObjects.filter((obj) => this.isEditAreaObject(obj));

    const selectedDimensions = selectedObjects.filter((obj) => this.isEditDimensionLineObject(obj));

    const nodesToMove = new Set();

    // 1. Nodos seleccionados directamente.
    selectedNodes.forEach((node) => {
      nodesToMove.add(node);
    });

    // 2. Si se selecciona una barra/frame, mover sus nodos extremos.
    selectedFrames.forEach((frame) => {
      if (frame.node1) nodesToMove.add(frame.node1);
      if (frame.node2) nodesToMove.add(frame.node2);
    });

    const movedObjects = [];

    // 3. Mover nodos una sola vez, aunque estén compartidos por varias barras.
    nodesToMove.forEach((node) => {
      if (!node.position) return;

      node.position.x = Number(node.position.x || 0) + Number(offset.dx || 0);
      node.position.y = Number(node.position.y || 0) + Number(offset.dy || 0);
      node.position.z = Number(node.position.z || 0) + Number(offset.dz || 0);

      node.selected = true;
      node.isSelected = true;

      if (node.style?.selected) {
        node.style.selected();
      }

      movedObjects.push(node);
    });

    // 4. Mantener marcadas las barras seleccionadas.
    selectedFrames.forEach((frame) => {
      frame.selected = true;
      frame.isSelected = true;

      if (frame.style?.selected) {
        frame.style.selected();
      }

      movedObjects.push(frame);
    });

    // 5. Mover áreas.
    selectedAreas.forEach((area) => {
      if (Array.isArray(area.points)) {
        area.points = area.points.map((point) =>
          this.offsetEditPoint(point, {
            x: Number(offset.dx || 0),
            y: Number(offset.dy || 0),
            z: Number(offset.dz || 0),
          }),
        );
      }

      if (typeof area.z === "number") {
        area.z = Number(area.z || 0) + Number(offset.dz || 0);
      }

      area.selected = true;
      area.isSelected = true;

      movedObjects.push(area);
    });

    // 6. Mover líneas de dimensión.
    selectedDimensions.forEach((dim) => {
      if (dim.start) {
        dim.start = this.offsetEditPoint(dim.start, {
          x: Number(offset.dx || 0),
          y: Number(offset.dy || 0),
          z: Number(offset.dz || 0),
        });
      }

      if (dim.end) {
        dim.end = this.offsetEditPoint(dim.end, {
          x: Number(offset.dx || 0),
          y: Number(offset.dy || 0),
          z: Number(offset.dz || 0),
        });
      }

      dim.selected = true;
      dim.isSelected = true;

      movedObjects.push(dim);
    });

    return {
      nodes: nodesToMove.size,
      frames: selectedFrames.length,
      areas: selectedAreas.length,
      dimensions: selectedDimensions.length,
      total: nodesToMove.size + selectedFrames.length + selectedAreas.length + selectedDimensions.length,
      objects: movedObjects,
    };
  },

  // =========================================
  // ========== EDIT: MERGE POINTS ===========
  // =========================================

  async openMergePointsDialog() {
    const selectedNodes =
      this.getEditSelectedNodes?.({
        respectActiveView: true,
      }) || [];

    const defaultTolerance = Number(this.preferences?.modelTolerance || 0.001);

    const result = await Swal.fire({
      title: "Merge Points",
      width: 620,
      html: `
      <div style="text-align:left; font-size:13px;">
        <p style="margin-bottom:12px;">
          Une nodos duplicados o muy cercanos, actualizando las barras conectadas.
        </p>

        <div style="border:1px solid #555; border-radius:6px; padding:10px; margin-bottom:12px;">
          <div style="font-weight:bold; margin-bottom:8px;">
            Merge Options
          </div>

          <label style="display:block; margin-bottom:5px;">Scope</label>
          <select id="merge-scope" style="width:100%; padding:7px; margin-bottom:12px;">
            <option value="selected">Selected Points Only</option>
            <option value="active-view">All Points in Active View</option>
            <option value="all">All Points in Model</option>
          </select>

          <label style="display:block; margin-bottom:5px;">Merge Tolerance</label>
          <input id="merge-tolerance" type="number" step="0.0001" min="0"
            value="${defaultTolerance}"
            style="width:100%; padding:7px; margin-bottom:12px;">

          <label style="display:flex; align-items:center; gap:8px; margin-bottom:8px;">
            <input id="merge-remove-duplicates" type="checkbox" checked>
            Remove zero-length and duplicate lines after merge
          </label>

          <label style="display:flex; align-items:center; gap:8px;">
            <input id="merge-select-result" type="checkbox" checked>
            Select merged points after operation
          </label>
        </div>

        <div style="padding:10px; border:1px solid #555; border-radius:6px; color:#777; font-size:12px;">
          Puntos seleccionados actualmente: <b>${selectedNodes.length}</b><br>
          Recomendación: usa esta opción cuando existan nodos encima de otros o casi coincidentes.
        </div>
      </div>
    `,
      showCancelButton: true,
      confirmButtonText: "Merge",
      cancelButtonText: "Cancelar",
      didOpen: () => {
        const scope = document.getElementById("merge-scope");

        if (scope) {
          scope.value = selectedNodes.length >= 2 ? "selected" : "active-view";
        }
      },
      preConfirm: () => {
        const scope = document.getElementById("merge-scope")?.value || "selected";
        const tolerance = Number(document.getElementById("merge-tolerance")?.value || 0);
        const removeDuplicates = document.getElementById("merge-remove-duplicates")?.checked === true;
        const selectResult = document.getElementById("merge-select-result")?.checked === true;

        if (!Number.isFinite(tolerance) || tolerance < 0) {
          Swal.showValidationMessage("La tolerancia debe ser un número mayor o igual a 0.");
          return false;
        }

        return {
          scope,
          tolerance,
          removeDuplicates,
          selectResult,
        };
      },
    });

    if (!result.isConfirmed || !result.value) return;

    this.saveUndoState?.("Merge Points");

    const summary = this.mergePointsByTolerance(result.value);

    this.redraw?.();

    if (summary.mergedNodes > 0 || summary.removedFrames > 0) {
      this.sync3D?.();
    }

    console.log("🔗 EDIT Merge Points ejecutado:", {
      options: result.value,
      summary,
    });

    if (summary.mergedNodes === 0) {
      this.showMessage?.("🔗 Merge Points: no se encontraron puntos para unir con esa tolerancia.", "warning");
      return;
    }

    this.showMessage?.(
      `🔗 Merge Points: ${summary.mergedNodes} nodo(s) unido(s), ` +
        `${summary.finalNodes} nodo(s) resultante(s), ` +
        `${summary.removedFrames} línea(s) duplicada(s) removida(s).`,
    );
  },

  getMergeCandidateNodes(scope = "selected") {
    if (scope === "selected") {
      return (
        this.getEditSelectedNodes?.({
          respectActiveView: true,
        }) || []
      );
    }

    if (scope === "active-view") {
      return (this.nodes || []).filter((node) => {
        return this.isEditNodeObject(node) && this.isEditObjectVisibleInActiveView(node);
      });
    }

    if (scope === "all") {
      return (this.nodes || []).filter((node) => this.isEditNodeObject(node));
    }

    return [];
  },

  getNodeDistance3D(nodeA, nodeB) {
    const a = nodeA?.position || {};
    const b = nodeB?.position || {};

    const dx = Number(a.x || 0) - Number(b.x || 0);
    const dy = Number(a.y || 0) - Number(b.y || 0);
    const dz = Number(a.z || 0) - Number(b.z || 0);

    return Math.sqrt(dx * dx + dy * dy + dz * dz);
  },

  buildMergeNodeClusters(nodes = [], tolerance = 0.001) {
    const clusters = [];
    const used = new Set();

    const orderedNodes = [...nodes].sort((a, b) => {
      return Number(a.id || 0) - Number(b.id || 0);
    });

    orderedNodes.forEach((node) => {
      if (used.has(node)) return;

      const cluster = [node];
      used.add(node);

      let changed = true;

      while (changed) {
        changed = false;

        orderedNodes.forEach((candidate) => {
          if (used.has(candidate)) return;

          const belongs = cluster.some((clusterNode) => {
            return this.getNodeDistance3D(clusterNode, candidate) <= tolerance;
          });

          if (belongs) {
            cluster.push(candidate);
            used.add(candidate);
            changed = true;
          }
        });
      }

      if (cluster.length >= 2) {
        clusters.push(cluster);
      }
    });

    return clusters;
  },

  mergeNodeCluster(cluster = [], options = {}) {
    if (!Array.isArray(cluster) || cluster.length < 2) {
      return {
        targetNode: null,
        mergedCount: 0,
      };
    }

    const ordered = [...cluster].sort((a, b) => {
      return Number(a.id || 0) - Number(b.id || 0);
    });

    const targetNode = ordered[0];
    const nodesToMerge = ordered.slice(1);

    nodesToMerge.forEach((oldNode) => {
      // Redirigir barras conectadas al nodo objetivo.
      const connectedFrames = Array.isArray(oldNode.beams) ? [...oldNode.beams] : [];

      connectedFrames.forEach((frame) => {
        if (frame.node1 === oldNode) {
          frame.node1 = targetNode;
        }

        if (frame.node2 === oldNode) {
          frame.node2 = targetNode;
        }

        if (!Array.isArray(targetNode.beams)) {
          targetNode.beams = [];
        }

        if (!targetNode.beams.includes(frame)) {
          targetNode.beams.push(frame);
        }
      });

      oldNode.beams = [];

      const index = this.nodes.indexOf(oldNode);

      if (index >= 0) {
        this.nodes.splice(index, 1);
      }
    });

    targetNode.selected = options.selectResult !== false;
    targetNode.isSelected = options.selectResult !== false;

    if (targetNode.selected && targetNode.style?.selected) {
      targetNode.style.selected();
    }

    return {
      targetNode,
      mergedCount: nodesToMerge.length,
    };
  },

  removeZeroLengthAndDuplicateFrames() {
    const seen = new Set();
    let removed = 0;

    const frames = Array.isArray(this.shapes) ? [...this.shapes] : [];

    frames.forEach((frame) => {
      if (!this.isEditFrameObject(frame)) return;

      const id1 = Number(frame.node1?.id || 0);
      const id2 = Number(frame.node2?.id || 0);

      // Si la barra quedó conectada al mismo nodo, se elimina.
      if (!id1 || !id2 || frame.node1 === frame.node2 || id1 === id2) {
        if (this.removeFrameFromModel(frame)) {
          removed++;
        }
        return;
      }

      const key = [id1, id2].sort((a, b) => a - b).join("-");

      if (seen.has(key)) {
        if (this.removeFrameFromModel(frame)) {
          removed++;
        }
        return;
      }

      seen.add(key);
    });

    return removed;
  },

  mergePointsByTolerance(options = {}) {
    const scope = options.scope || "selected";
    const tolerance = Number(options.tolerance ?? 0.001);
    const removeDuplicates = options.removeDuplicates !== false;
    const selectResult = options.selectResult !== false;

    const candidateNodes = this.getMergeCandidateNodes(scope);

    if (candidateNodes.length < 2) {
      return {
        candidateNodes: candidateNodes.length,
        clusters: 0,
        mergedNodes: 0,
        finalNodes: 0,
        removedFrames: 0,
      };
    }

    this.clearEditSelectionFlags?.();

    const clusters = this.buildMergeNodeClusters(candidateNodes, tolerance);

    let mergedNodes = 0;
    let finalNodes = 0;

    clusters.forEach((cluster) => {
      const result = this.mergeNodeCluster(cluster, {
        selectResult,
      });

      if (result.targetNode) {
        mergedNodes += result.mergedCount;
        finalNodes++;
      }
    });

    let removedFrames = 0;

    if (removeDuplicates) {
      removedFrames = this.removeZeroLengthAndDuplicateFrames();
    }

    this.reindexModelObjects?.();

    return {
      candidateNodes: candidateNodes.length,
      clusters: clusters.length,
      mergedNodes,
      finalNodes,
      removedFrames,
    };
  },

  // =========================================
  // ===== EDIT: ALIGN POINTS/LINES/EDGES ====
  // =========================================

  getDefaultAlignAxis() {
    const view = this.viewSet?.[this.activeViewIndex];

    if (!view || view.type === "plan") {
      return "x";
    }

    if (view.type === "elevation" && view.axis === "X") {
      return "y";
    }

    if (view.type === "elevation" && view.axis === "Y") {
      return "x";
    }

    return "x";
  },

  getAxisLabel(axis = "x") {
    const key = String(axis || "x").toLowerCase();

    if (key === "x") return "X";
    if (key === "y") return "Y";
    if (key === "z") return "Z";

    return "X";
  },

  getAxisValue(point, axis = "x") {
    if (!point) return 0;

    const key = String(axis || "x").toLowerCase();

    if (key === "x") return Number(point.x || 0);
    if (key === "y") return Number(point.y || 0);
    if (key === "z") return Number(point.z || 0);

    return Number(point.x || 0);
  },

  setAxisValue(point, axis = "x", value = 0) {
    if (!point) return;

    const key = String(axis || "x").toLowerCase();
    const numericValue = Number(value || 0);

    if (key === "x") point.x = numericValue;
    if (key === "y") point.y = numericValue;
    if (key === "z") point.z = numericValue;
  },

  getAlignCandidateData() {
    const selectedObjects =
      this.getEditSelectedObjects?.({
        respectActiveView: true,
      }) || [];

    const selectedNodes = selectedObjects.filter((obj) => this.isEditNodeObject(obj));

    const selectedFrames = selectedObjects.filter((obj) => this.isEditFrameObject(obj));

    const selectedAreas = selectedObjects.filter((obj) => this.isEditAreaObject(obj));

    const selectedDimensions = selectedObjects.filter((obj) => this.isEditDimensionLineObject(obj));

    const nodesToAlign = new Set();

    selectedNodes.forEach((node) => {
      nodesToAlign.add(node);
    });

    selectedFrames.forEach((frame) => {
      if (frame.node1) nodesToAlign.add(frame.node1);
      if (frame.node2) nodesToAlign.add(frame.node2);
    });

    const areaPoints = [];

    selectedAreas.forEach((area) => {
      if (Array.isArray(area.points)) {
        area.points.forEach((point) => {
          if (point) areaPoints.push(point);
        });
      }
    });

    const dimensionPoints = [];

    selectedDimensions.forEach((dim) => {
      if (dim.start) dimensionPoints.push(dim.start);
      if (dim.end) dimensionPoints.push(dim.end);
    });

    return {
      selectedObjects,
      selectedNodes,
      selectedFrames,
      selectedAreas,
      selectedDimensions,
      nodesToAlign: [...nodesToAlign],
      areaPoints,
      dimensionPoints,
      totalPoints: nodesToAlign.size + areaPoints.length + dimensionPoints.length,
    };
  },

  getAlignValuesForAxis(axis = "x") {
    const data = this.getAlignCandidateData();

    const values = [];

    data.nodesToAlign.forEach((node) => {
      values.push(this.getAxisValue(node.position, axis));
    });

    data.areaPoints.forEach((point) => {
      values.push(this.getAxisValue(point, axis));
    });

    data.dimensionPoints.forEach((point) => {
      values.push(this.getAxisValue(point, axis));
    });

    return values.filter((value) => Number.isFinite(value));
  },

  calculateAlignTargetValue(axis = "x", mode = "average", customValue = 0) {
    const values = this.getAlignValuesForAxis(axis);

    if (mode === "custom") {
      return Number(customValue || 0);
    }

    if (!values.length) {
      return 0;
    }

    if (mode === "first") {
      return values[0];
    }

    if (mode === "min") {
      return Math.min(...values);
    }

    if (mode === "max") {
      return Math.max(...values);
    }

    if (mode === "average") {
      return values.reduce((sum, value) => sum + value, 0) / values.length;
    }

    return values[0];
  },

  async openAlignPointsLinesEdgesDialog() {
    const data = this.getAlignCandidateData();

    if (!data.totalPoints) {
      this.showMessage?.("📍 Selecciona puntos, líneas o áreas para alinear.", "warning");
      console.warn("EDIT Align: no hay selección.");
      return;
    }

    const defaultAxis = this.getDefaultAlignAxis();
    const defaultValues = this.getAlignValuesForAxis(defaultAxis);
    const defaultCustomValue = defaultValues.length ? defaultValues[0] : 0;

    const result = await Swal.fire({
      title: "Align Points/Lines/Edges",
      width: 640,
      html: `
      <div style="text-align:left; font-size:13px;">
        <p style="margin-bottom:12px;">
          Alinea los puntos, líneas o bordes seleccionados en una coordenada común.
        </p>

        <div style="border:1px solid #555; border-radius:6px; padding:10px; margin-bottom:12px;">
          <div style="font-weight:bold; margin-bottom:8px;">
            Align Direction
          </div>

          <div style="display:grid; grid-template-columns: 1fr 1fr; gap:10px; margin-bottom:12px;">
            <div>
              <label style="display:block; margin-bottom:5px;">Axis</label>
              <select id="align-axis" style="width:100%; padding:7px;">
                <option value="x">X Coordinate</option>
                <option value="y">Y Coordinate</option>
                <option value="z">Z Coordinate</option>
              </select>
            </div>

            <div>
              <label style="display:block; margin-bottom:5px;">Target</label>
              <select id="align-mode" style="width:100%; padding:7px;">
                <option value="first">First selected point</option>
                <option value="average">Average coordinate</option>
                <option value="min">Minimum coordinate</option>
                <option value="max">Maximum coordinate</option>
                <option value="custom">Custom coordinate</option>
              </select>
            </div>
          </div>

          <label style="display:block; margin-bottom:5px;">Custom Coordinate</label>
          <input id="align-custom-value" type="number" step="0.001"
            value="${Number(defaultCustomValue || 0)}"
            style="width:100%; padding:7px;">
        </div>

        <div style="padding:10px; border:1px solid #555; border-radius:6px; color:#777; font-size:12px;">
          Objetos afectados:<br>
          Nodos: <b>${data.nodesToAlign.length}</b> |
          Líneas: <b>${data.selectedFrames.length}</b> |
          Áreas: <b>${data.selectedAreas.length}</b> |
          Dimensiones: <b>${data.selectedDimensions.length}</b><br>
          Puntos totales a alinear: <b>${data.totalPoints}</b>
        </div>
      </div>
    `,
      showCancelButton: true,
      confirmButtonText: "Align",
      cancelButtonText: "Cancelar",

      didOpen: () => {
        const axisSelect = document.getElementById("align-axis");
        const modeSelect = document.getElementById("align-mode");
        const customInput = document.getElementById("align-custom-value");

        if (axisSelect) {
          axisSelect.value = defaultAxis;
        }

        if (modeSelect) {
          modeSelect.value = "average";
        }

        const updateCustomValue = () => {
          const axis = axisSelect?.value || "x";
          const mode = modeSelect?.value || "average";
          const values = this.getAlignValuesForAxis(axis);

          if (!values.length || mode === "custom") return;

          let value = values[0];

          if (mode === "average") {
            value = values.reduce((sum, item) => sum + item, 0) / values.length;
          }

          if (mode === "min") {
            value = Math.min(...values);
          }

          if (mode === "max") {
            value = Math.max(...values);
          }

          if (mode === "first") {
            value = values[0];
          }

          if (customInput) {
            customInput.value = Number(value || 0).toFixed(3);
          }
        };

        axisSelect?.addEventListener("change", updateCustomValue);
        modeSelect?.addEventListener("change", updateCustomValue);

        updateCustomValue();
      },

      preConfirm: () => {
        const axis = document.getElementById("align-axis")?.value || "x";
        const mode = document.getElementById("align-mode")?.value || "average";
        const customValue = Number(document.getElementById("align-custom-value")?.value || 0);

        if (!["x", "y", "z"].includes(axis)) {
          Swal.showValidationMessage("Selecciona un eje válido.");
          return false;
        }

        if (!["first", "average", "min", "max", "custom"].includes(mode)) {
          Swal.showValidationMessage("Selecciona un modo de alineación válido.");
          return false;
        }

        if (!Number.isFinite(customValue)) {
          Swal.showValidationMessage("La coordenada personalizada debe ser numérica.");
          return false;
        }

        return {
          axis,
          mode,
          customValue,
        };
      },
    });

    if (!result.isConfirmed || !result.value) return;

    this.saveUndoState?.("Align Points/Lines/Edges");

    const summary = this.alignSelectedObjects(result.value);

    this.redraw?.();

    if (summary.nodes > 0 || summary.frames > 0 || summary.areas > 0) {
      this.sync3D?.();
    }

    console.log("📍 EDIT Align ejecutado:", {
      options: result.value,
      summary,
    });

    this.showMessage?.(
      `📍 Align ${this.getAxisLabel(result.value.axis)}: ` +
        `${summary.totalPoints} punto(s) alineado(s) en ` +
        `${summary.targetValue.toFixed(3)}.`,
    );
  },

  alignSelectedObjects(options = {}) {
    const axis = options.axis || "x";
    const mode = options.mode || "average";
    const customValue = Number(options.customValue || 0);

    const targetValue = this.calculateAlignTargetValue(axis, mode, customValue);
    const data = this.getAlignCandidateData();

    data.nodesToAlign.forEach((node) => {
      if (!node.position) return;

      this.setAxisValue(node.position, axis, targetValue);

      node.selected = true;
      node.isSelected = true;

      if (node.style?.selected) {
        node.style.selected();
      }
    });

    data.selectedFrames.forEach((frame) => {
      frame.selected = true;
      frame.isSelected = true;

      if (frame.style?.selected) {
        frame.style.selected();
      }
    });

    data.areaPoints.forEach((point) => {
      this.setAxisValue(point, axis, targetValue);
    });

    data.selectedAreas.forEach((area) => {
      if (typeof area.z === "number" && axis === "z") {
        area.z = targetValue;
      }

      area.selected = true;
      area.isSelected = true;
    });

    data.dimensionPoints.forEach((point) => {
      this.setAxisValue(point, axis, targetValue);
    });

    data.selectedDimensions.forEach((dim) => {
      dim.selected = true;
      dim.isSelected = true;
    });

    this.reindexModelObjects?.();

    return {
      axis,
      targetValue,
      nodes: data.nodesToAlign.length,
      frames: data.selectedFrames.length,
      areas: data.selectedAreas.length,
      dimensions: data.selectedDimensions.length,
      totalPoints: data.totalPoints,
    };
  },

  // =========================================
  // ========== EDIT: JOIN LINES =============
  // =========================================

  async joinLines() {
    const selectedFrames =
      this.getEditSelectedFrames?.({
        respectActiveView: true,
      }) || [];

    if (selectedFrames.length < 2) {
      this.showMessage?.("⛓️ Selecciona al menos dos líneas / frames para unir.", "warning");
      console.warn("EDIT Join Lines: selección insuficiente.");
      return;
    }

    const result = await Swal.fire({
      title: "Join Lines",
      width: 600,
      html: `
      <div style="text-align:left; font-size:13px;">
        <p style="margin-bottom:12px;">
          Une líneas colineales seleccionadas en un solo objeto Frame / Line.
        </p>

        <div style="border:1px solid #555; border-radius:6px; padding:10px; margin-bottom:12px;">
          <div style="font-weight:bold; margin-bottom:8px;">
            Join Options
          </div>

          <label style="display:block; margin-bottom:5px;">Collinearity Tolerance</label>
          <input id="join-tolerance" type="number" step="0.0001" min="0"
            value="0.001"
            style="width:100%; padding:7px; margin-bottom:12px;">

          <label style="display:flex; align-items:center; gap:8px; margin-bottom:8px;">
            <input id="join-remove-unused-nodes" type="checkbox" checked>
            Remove unused intermediate points
          </label>

          <label style="display:flex; align-items:center; gap:8px;">
            <input id="join-select-result" type="checkbox" checked>
            Select joined lines after operation
          </label>
        </div>

        <div style="padding:10px; border:1px solid #555; border-radius:6px; color:#777; font-size:12px;">
          Líneas seleccionadas: <b>${selectedFrames.length}</b><br>
          Solo se unirán líneas conectadas y aproximadamente colineales.
        </div>
      </div>
    `,
      showCancelButton: true,
      confirmButtonText: "Join",
      cancelButtonText: "Cancelar",
      preConfirm: () => {
        const tolerance = Number(document.getElementById("join-tolerance")?.value || 0);
        const removeUnusedNodes = document.getElementById("join-remove-unused-nodes")?.checked === true;
        const selectResult = document.getElementById("join-select-result")?.checked === true;

        if (!Number.isFinite(tolerance) || tolerance < 0) {
          Swal.showValidationMessage("La tolerancia debe ser un número mayor o igual a 0.");
          return false;
        }

        return {
          tolerance,
          removeUnusedNodes,
          selectResult,
        };
      },
    });

    if (!result.isConfirmed || !result.value) return;

    this.saveUndoState?.("Join Lines");

    const summary = this.joinSelectedLines(result.value);

    this.redraw?.();

    if (summary.joinedGroups > 0) {
      this.sync3D?.();
    }

    console.log("⛓️ EDIT Join Lines ejecutado:", {
      options: result.value,
      summary,
    });

    if (summary.joinedGroups === 0) {
      this.showMessage?.("⛓️ Join Lines: no se encontraron líneas conectadas y colineales para unir.", "warning");
      return;
    }

    this.showMessage?.(
      `⛓️ Join Lines: ${summary.removedFrames} línea(s) reemplazada(s) por ` +
        `${summary.createdFrames} línea(s) nueva(s).`,
    );
  },

  getPointVector3D(point = {}) {
    return {
      x: Number(point.x || 0),
      y: Number(point.y || 0),
      z: Number(point.z || 0),
    };
  },

  subtractVector3D(a, b) {
    return {
      x: Number(a.x || 0) - Number(b.x || 0),
      y: Number(a.y || 0) - Number(b.y || 0),
      z: Number(a.z || 0) - Number(b.z || 0),
    };
  },

  dotVector3D(a, b) {
    return (
      Number(a.x || 0) * Number(b.x || 0) + Number(a.y || 0) * Number(b.y || 0) + Number(a.z || 0) * Number(b.z || 0)
    );
  },

  crossVector3D(a, b) {
    return {
      x: Number(a.y || 0) * Number(b.z || 0) - Number(a.z || 0) * Number(b.y || 0),
      y: Number(a.z || 0) * Number(b.x || 0) - Number(a.x || 0) * Number(b.z || 0),
      z: Number(a.x || 0) * Number(b.y || 0) - Number(a.y || 0) * Number(b.x || 0),
    };
  },

  lengthVector3D(v) {
    return Math.sqrt(
      Number(v.x || 0) * Number(v.x || 0) + Number(v.y || 0) * Number(v.y || 0) + Number(v.z || 0) * Number(v.z || 0),
    );
  },

  normalizeVector3D(v) {
    const len = this.lengthVector3D(v);

    if (len <= 1e-9) {
      return { x: 0, y: 0, z: 0 };
    }

    return {
      x: Number(v.x || 0) / len,
      y: Number(v.y || 0) / len,
      z: Number(v.z || 0) / len,
    };
  },

  getFrameDirection3D(frame) {
    const p1 = this.getPointVector3D(frame?.node1?.position || {});
    const p2 = this.getPointVector3D(frame?.node2?.position || {});

    return this.normalizeVector3D(this.subtractVector3D(p2, p1));
  },

  getDistancePointToLine3D(point, linePoint, lineDirection) {
    const p = this.getPointVector3D(point);
    const a = this.getPointVector3D(linePoint);
    const d = this.normalizeVector3D(lineDirection);

    const ap = this.subtractVector3D(p, a);
    const cross = this.crossVector3D(ap, d);

    return this.lengthVector3D(cross);
  },

  framesShareNode(frameA, frameB) {
    if (!frameA || !frameB) return false;

    return (
      frameA.node1 === frameB.node1 ||
      frameA.node1 === frameB.node2 ||
      frameA.node2 === frameB.node1 ||
      frameA.node2 === frameB.node2
    );
  },

  areFramesCollinear(frameA, frameB, tolerance = 0.001) {
    if (!frameA?.node1 || !frameA?.node2 || !frameB?.node1 || !frameB?.node2) {
      return false;
    }

    const a1 = this.getPointVector3D(frameA.node1.position);
    const dirA = this.getFrameDirection3D(frameA);
    const dirB = this.getFrameDirection3D(frameB);

    const cross = this.crossVector3D(dirA, dirB);
    const crossLen = this.lengthVector3D(cross);

    // Si las direcciones no son paralelas, no se pueden unir.
    if (crossLen > Math.max(tolerance, 1e-6)) {
      return false;
    }

    const b1Distance = this.getDistancePointToLine3D(frameB.node1.position, a1, dirA);

    const b2Distance = this.getDistancePointToLine3D(frameB.node2.position, a1, dirA);

    return b1Distance <= tolerance && b2Distance <= tolerance;
  },

  buildJoinLineGroups(frames = [], tolerance = 0.001) {
    const groups = [];
    const used = new Set();

    frames.forEach((frame) => {
      if (used.has(frame)) return;

      const group = [frame];
      used.add(frame);

      let changed = true;

      while (changed) {
        changed = false;

        frames.forEach((candidate) => {
          if (used.has(candidate)) return;

          const canJoin = group.some((groupFrame) => {
            return (
              this.framesShareNode(groupFrame, candidate) && this.areFramesCollinear(groupFrame, candidate, tolerance)
            );
          });

          if (canJoin) {
            group.push(candidate);
            used.add(candidate);
            changed = true;
          }
        });
      }

      if (group.length >= 2) {
        groups.push(group);
      }
    });

    return groups;
  },

  copyBasicFrameProperties(sourceFrame, targetFrame) {
    if (!sourceFrame || !targetFrame) return;

    targetFrame.E = sourceFrame.E ?? this.globalE;
    targetFrame._A = sourceFrame._A ?? this.globalA;

    targetFrame.elementType = sourceFrame.elementType || sourceFrame.type || "beam";
    targetFrame.type = sourceFrame.type || sourceFrame.elementType || "beam";
    targetFrame.objectType = sourceFrame.objectType || "frame";
    targetFrame.visible = sourceFrame.visible !== false;

    targetFrame.sectionId = sourceFrame.sectionId ?? null;
    targetFrame.sectionName = sourceFrame.sectionName ?? null;
    targetFrame.frameSection = this.cloneEditPlainData(sourceFrame.frameSection);
    targetFrame.section = this.cloneEditPlainData(sourceFrame.section);
    targetFrame.hasAssignedSection = sourceFrame.hasAssignedSection === true;

    targetFrame.releases = this.cloneEditPlainData(sourceFrame.releases);
    targetFrame.frameReleases = this.cloneEditPlainData(sourceFrame.frameReleases);
    targetFrame.hasFrameReleases = sourceFrame.hasFrameReleases === true;

    targetFrame.endOffsets = this.cloneEditPlainData(sourceFrame.endOffsets);
    targetFrame.frameEndOffsets = this.cloneEditPlainData(sourceFrame.frameEndOffsets);
    targetFrame.hasEndOffsets = sourceFrame.hasEndOffsets === true;

    // Para versión inicial, se conservan cargas/asignaciones del primer tramo.
    targetFrame.frameLoads = this.cloneEditPlainData(sourceFrame.frameLoads) || [];
    targetFrame.lineLoads = this.cloneEditPlainData(sourceFrame.lineLoads) || [];
    targetFrame.hasFrameLoads = sourceFrame.hasFrameLoads === true;
    targetFrame.hasLineLoads = sourceFrame.hasLineLoads === true;

    targetFrame.assignment = this.cloneEditPlainData(sourceFrame.assignment) || {};

    targetFrame.groupIds = this.cloneEditPlainData(sourceFrame.groupIds) || [];
    targetFrame.groupNames = this.cloneEditPlainData(sourceFrame.groupNames) || [];
    targetFrame.groups = this.cloneEditPlainData(sourceFrame.groups) || [];
    targetFrame.hasGroups = sourceFrame.hasGroups === true;

    targetFrame.designOverwrites = this.cloneEditPlainData(sourceFrame.designOverwrites) || {};
    targetFrame.designResults = this.cloneEditPlainData(sourceFrame.designResults) || {};

    targetFrame.steelFrameDesignResult = this.cloneEditPlainData(sourceFrame.steelFrameDesignResult);

    targetFrame.steelJoistDesignResult = this.cloneEditPlainData(sourceFrame.steelJoistDesignResult);

    targetFrame.steelFrameDesignOverwrites = this.cloneEditPlainData(sourceFrame.steelFrameDesignOverwrites);

    targetFrame.steelJoistDesignOverwrites = this.cloneEditPlainData(sourceFrame.steelJoistDesignOverwrites);

    targetFrame.designType = sourceFrame.designType ?? null;
    targetFrame.isSteelJoist = sourceFrame.isSteelJoist === true;
  },

  joinFrameGroup(group = [], options = {}) {
    if (!Array.isArray(group) || group.length < 2) {
      return {
        createdFrame: null,
        removedFrames: 0,
        removedNodes: 0,
      };
    }

    const selectResult = options.selectResult !== false;
    const removeUnusedNodes = options.removeUnusedNodes !== false;

    const baseFrame = group[0];
    const baseDirection = this.getFrameDirection3D(baseFrame);
    const basePoint = this.getPointVector3D(baseFrame.node1.position);

    const allNodes = [];

    group.forEach((frame) => {
      if (frame.node1 && !allNodes.includes(frame.node1)) allNodes.push(frame.node1);
      if (frame.node2 && !allNodes.includes(frame.node2)) allNodes.push(frame.node2);
    });

    if (allNodes.length < 2) {
      return {
        createdFrame: null,
        removedFrames: 0,
        removedNodes: 0,
      };
    }

    const projectedNodes = allNodes.map((node) => {
      const p = this.getPointVector3D(node.position);
      const ap = this.subtractVector3D(p, basePoint);

      return {
        node,
        projection: this.dotVector3D(ap, baseDirection),
      };
    });

    projectedNodes.sort((a, b) => a.projection - b.projection);

    const startNode = projectedNodes[0].node;
    const endNode = projectedNodes[projectedNodes.length - 1].node;

    if (!startNode || !endNode || startNode === endNode) {
      return {
        createdFrame: null,
        removedFrames: 0,
        removedNodes: 0,
      };
    }

    const newFrame = new Beam(baseFrame.E ?? this.globalE, baseFrame._A ?? this.globalA);

    newFrame.id = this.getNextEditFrameId();
    newFrame.node1 = startNode;
    newFrame.node2 = endNode;

    this.copyBasicFrameProperties(baseFrame, newFrame);

    newFrame.selected = selectResult;
    newFrame.isSelected = selectResult;

    if (selectResult && newFrame.style?.selected) {
      newFrame.style.selected();
    }

    let removedFrames = 0;

    group.forEach((frame) => {
      if (this.removeFrameFromModel(frame)) {
        removedFrames++;
      }
    });

    this.shapes.push(newFrame);

    if (!startNode.beams) startNode.beams = [];
    if (!endNode.beams) endNode.beams = [];

    if (!startNode.beams.includes(newFrame)) startNode.beams.push(newFrame);
    if (!endNode.beams.includes(newFrame)) endNode.beams.push(newFrame);

    let removedNodes = 0;

    if (removeUnusedNodes) {
      const intermediateNodes = allNodes.filter((node) => {
        return node !== startNode && node !== endNode;
      });

      intermediateNodes.forEach((node) => {
        const hasConnections = Array.isArray(node.beams) && node.beams.length > 0;

        if (!hasConnections) {
          const index = this.nodes.indexOf(node);

          if (index >= 0) {
            this.nodes.splice(index, 1);
            removedNodes++;
          }
        }
      });
    }

    return {
      createdFrame: newFrame,
      removedFrames,
      removedNodes,
    };
  },

  joinSelectedLines(options = {}) {
    const tolerance = Number(options.tolerance ?? 0.001);

    const selectedFrames =
      this.getEditSelectedFrames?.({
        respectActiveView: true,
      }) || [];

    if (selectedFrames.length < 2) {
      return {
        selectedFrames: selectedFrames.length,
        joinedGroups: 0,
        createdFrames: 0,
        removedFrames: 0,
        removedNodes: 0,
      };
    }

    this.clearEditSelectionFlags?.();

    const groups = this.buildJoinLineGroups(selectedFrames, tolerance);

    let createdFrames = 0;
    let removedFrames = 0;
    let removedNodes = 0;

    groups.forEach((group) => {
      const result = this.joinFrameGroup(group, options);

      if (result.createdFrame) {
        createdFrames++;
        removedFrames += result.removedFrames;
        removedNodes += result.removedNodes;
      }
    });

    this.reindexModelObjects?.();

    return {
      selectedFrames: selectedFrames.length,
      joinedGroups: groups.length,
      createdFrames,
      removedFrames,
      removedNodes,
    };
  },

  // =========================================
  // ========== EDIT: DIVIDE LINES ===========
  // =========================================

  async openDivideLinesDialog() {
    const selectedFrames =
      this.getEditSelectedFrames?.({
        respectActiveView: true,
      }) || [];

    if (!selectedFrames.length) {
      this.showMessage?.("✂️ Selecciona una o más líneas / frames para dividir.", "warning");
      console.warn("EDIT Divide Lines: no hay selección.");
      return;
    }

    const result = await Swal.fire({
      title: "Divide Lines",
      width: 640,
      html: `
      <div style="text-align:left; font-size:13px;">
        <p style="margin-bottom:12px;">
          Divide los elementos Frame / Line seleccionados en segmentos.
        </p>

        <div style="border:1px solid #555; border-radius:6px; padding:10px; margin-bottom:12px;">
          <div style="font-weight:bold; margin-bottom:8px;">
            Divide Options
          </div>

          <label style="display:block; margin-bottom:5px;">Divide Method</label>
          <select id="divide-method" style="width:100%; padding:7px; margin-bottom:12px;">
            <option value="equal">Divide into equal segments</option>
            <option value="max-length">Divide by maximum segment length</option>
          </select>

          <div style="display:grid; grid-template-columns: 1fr 1fr; gap:10px; margin-bottom:12px;">
            <div>
              <label style="display:block; margin-bottom:5px;">Number of Segments</label>
              <input id="divide-segments" type="number" min="2" step="1" value="2"
                style="width:100%; padding:7px;">
            </div>

            <div>
              <label style="display:block; margin-bottom:5px;">Maximum Segment Length</label>
              <input id="divide-max-length" type="number" min="0.001" step="0.001" value="2.5"
                style="width:100%; padding:7px;">
            </div>
          </div>

          <label style="display:flex; align-items:center; gap:8px;">
            <input id="divide-select-result" type="checkbox" checked>
            Select divided lines after operation
          </label>
        </div>

        <div style="padding:10px; border:1px solid #555; border-radius:6px; color:#777; font-size:12px;">
          Líneas seleccionadas: <b>${selectedFrames.length}</b><br>
          La línea original será reemplazada por nuevos tramos conectados.
        </div>
      </div>
    `,
      showCancelButton: true,
      confirmButtonText: "Divide",
      cancelButtonText: "Cancelar",

      didOpen: () => {
        const methodSelect = document.getElementById("divide-method");
        const segmentsInput = document.getElementById("divide-segments");
        const maxLengthInput = document.getElementById("divide-max-length");

        const updateInputs = () => {
          const method = methodSelect?.value || "equal";

          if (segmentsInput) {
            segmentsInput.disabled = method !== "equal";
          }

          if (maxLengthInput) {
            maxLengthInput.disabled = method !== "max-length";
          }
        };

        methodSelect?.addEventListener("change", updateInputs);
        updateInputs();
      },

      preConfirm: () => {
        const method = document.getElementById("divide-method")?.value || "equal";

        const segments = Number(document.getElementById("divide-segments")?.value || 2);

        const maxLength = Number(document.getElementById("divide-max-length")?.value || 0);

        const selectResult = document.getElementById("divide-select-result")?.checked === true;

        if (!["equal", "max-length"].includes(method)) {
          Swal.showValidationMessage("Selecciona un método válido.");
          return false;
        }

        if (method === "equal") {
          if (!Number.isInteger(segments) || segments < 2) {
            Swal.showValidationMessage("Number of Segments debe ser un entero mayor o igual a 2.");
            return false;
          }
        }

        if (method === "max-length") {
          if (!Number.isFinite(maxLength) || maxLength <= 0) {
            Swal.showValidationMessage("Maximum Segment Length debe ser mayor que 0.");
            return false;
          }
        }

        return {
          method,
          segments,
          maxLength,
          selectResult,
        };
      },
    });

    if (!result.isConfirmed || !result.value) return;

    this.saveUndoState?.("Divide Lines");

    const summary = this.divideSelectedLines(result.value);

    this.redraw?.();

    if (summary.createdFrames > 0) {
      this.sync3D?.();
    }

    console.log("✂️ EDIT Divide Lines ejecutado:", {
      options: result.value,
      summary,
    });

    this.showMessage?.(
      `✂️ Divide Lines: ${summary.removedFrames} línea(s) reemplazada(s) por ` +
        `${summary.createdFrames} tramo(s). Nodos nuevos: ${summary.createdNodes}.`,
    );
  },

  getEditFrameLength3D(frame) {
    if (!frame?.node1?.position || !frame?.node2?.position) return 0;

    const p1 = frame.node1.position;
    const p2 = frame.node2.position;

    const dx = Number(p2.x || 0) - Number(p1.x || 0);
    const dy = Number(p2.y || 0) - Number(p1.y || 0);
    const dz = Number(p2.z || 0) - Number(p1.z || 0);

    return Math.sqrt(dx * dx + dy * dy + dz * dz);
  },

  interpolateEditPoint3D(p1, p2, t) {
    return {
      x: Number(p1.x || 0) + (Number(p2.x || 0) - Number(p1.x || 0)) * t,
      y: Number(p1.y || 0) + (Number(p2.y || 0) - Number(p1.y || 0)) * t,
      z: Number(p1.z || 0) + (Number(p2.z || 0) - Number(p1.z || 0)) * t,
    };
  },

  getDivideSegmentCount(frame, options = {}) {
    const method = options.method || "equal";

    if (method === "equal") {
      return Math.max(2, Number(options.segments || 2));
    }

    if (method === "max-length") {
      const length = this.getEditFrameLength3D(frame);
      const maxLength = Number(options.maxLength || 0);

      if (length <= 0 || maxLength <= 0) {
        return 2;
      }

      return Math.max(2, Math.ceil(length / maxLength));
    }

    return 2;
  },

  divideSelectedLines(options = {}) {
    const selectedFrames =
      this.getEditSelectedFrames?.({
        respectActiveView: true,
      }) || [];

    const summary = {
      selectedFrames: selectedFrames.length,
      removedFrames: 0,
      createdFrames: 0,
      createdNodes: 0,
    };

    if (!selectedFrames.length) {
      return summary;
    }

    this.clearEditSelectionFlags?.();

    selectedFrames.forEach((frame) => {
      const result = this.divideFrameIntoSegments(frame, options);

      summary.removedFrames += result.removedFrames;
      summary.createdFrames += result.createdFrames;
      summary.createdNodes += result.createdNodes;
    });

    this.redraw?.();
    // Forzar una limpieza de la selección y una sincronización 3D completa
    this.clearAllSelections?.();
    setTimeout(() => this.sync3D?.(), 50);

    this.reindexModelObjects?.();

    return summary;
  },

  divideFrameIntoSegments(frame, options = {}) {
    const selectResult = options.selectResult !== false;
    const segmentCount = this.getDivideSegmentCount(frame, options);

    if (!frame?.node1 || !frame?.node2 || segmentCount < 2) {
      return {
        removedFrames: 0,
        createdFrames: 0,
        createdNodes: 0,
      };
    }

    const startNode = frame.node1;
    const endNode = frame.node2;

    const p1 = startNode.position;
    const p2 = endNode.position;

    const chainNodes = [startNode];
    const createdNodes = [];

    // Crear nodos intermedios
    for (let i = 1; i < segmentCount; i++) {
      const t = i / segmentCount;
      const p = this.interpolateEditPoint3D(p1, p2, t);

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

      newNode.selected = selectResult;
      newNode.isSelected = selectResult;

      if (selectResult && newNode.style?.selected) {
        newNode.style.selected();
      }

      // Copias mínimas de propiedades compatibles con nodos
      newNode.visible = true;
      newNode.assignment = {};
      newNode.pointLoads = [];
      newNode.jointLoads = [];

      this.nodes.push(newNode);
      chainNodes.push(newNode);
      createdNodes.push(newNode);
    }

    chainNodes.push(endNode);

    const newFrames = [];
    frame.selected = false;
    frame.isSelected = false;
    frame.highlighted3D = false;

    // Eliminar frame original antes de crear nuevos tramos
    const removed = this.removeFrameFromModel(frame) ? 1 : 0;

    for (let i = 0; i < chainNodes.length - 1; i++) {
      const nodeA = chainNodes[i];
      const nodeB = chainNodes[i + 1];

      const newFrame = new Beam(frame.E ?? this.globalE, frame._A ?? this.globalA);

      newFrame.id = this.getNextEditFrameId();

      newFrame.node1 = nodeA;
      newFrame.node2 = nodeB;

      this.copyBasicFrameProperties?.(frame, newFrame);

      newFrame.selected = selectResult;
      newFrame.isSelected = selectResult;

      if (selectResult && newFrame.style?.selected) {
        newFrame.style.selected();
      }

      this.shapes.push(newFrame);

      if (!nodeA.beams) nodeA.beams = [];
      if (!nodeB.beams) nodeB.beams = [];

      if (!nodeA.beams.includes(newFrame)) nodeA.beams.push(newFrame);
      if (!nodeB.beams.includes(newFrame)) nodeB.beams.push(newFrame);

      newFrames.push(newFrame);
    }

    return {
      removedFrames: removed,
      createdFrames: newFrames.length,
      createdNodes: createdNodes.length,
    };
  },

  // =========================================
  // ==== EDIT: EXTRUDE POINTS TO LINES ======
  // =========================================

  async openExtrudePointsToLinesDialog() {
    const selectedNodes =
      this.getEditSelectedNodes?.({
        respectActiveView: true,
      }) || [];

    const activeViewNodes = (this.nodes || []).filter((node) => {
      return this.isEditNodeObject(node) && this.isEditObjectVisibleInActiveView(node);
    });

    if (!selectedNodes.length && !activeViewNodes.length) {
      this.showMessage?.("📍 No hay puntos disponibles para extruir.", "warning");
      console.warn("EDIT Extrude Points to Lines: no hay puntos.");
      return;
    }

    const result = await Swal.fire({
      title: "Extrude Points to Lines",
      width: 680,
      html: `
      <div style="text-align:left; font-size:13px;">
        <p style="margin-bottom:12px;">
          Crea líneas a partir de puntos seleccionados mediante un desplazamiento.
        </p>

        <div style="border:1px solid #555; border-radius:6px; padding:10px; margin-bottom:12px;">
          <div style="font-weight:bold; margin-bottom:8px;">
            Extrude Options
          </div>

          <label style="display:block; margin-bottom:5px;">Scope</label>
          <select id="extrude-points-scope" style="width:100%; padding:7px; margin-bottom:12px;">
            <option value="selected">Selected Points Only</option>
            <option value="active-view">All Points in Active View</option>
          </select>

          <div style="display:grid; grid-template-columns: 1fr 1fr 1fr; gap:10px; margin-bottom:12px;">
            <div>
              <label style="display:block; margin-bottom:5px;">DX</label>
              <input id="extrude-points-dx" type="number" step="0.001" value="0"
                style="width:100%; padding:7px;">
            </div>

            <div>
              <label style="display:block; margin-bottom:5px;">DY</label>
              <input id="extrude-points-dy" type="number" step="0.001" value="0"
                style="width:100%; padding:7px;">
            </div>

            <div>
              <label style="display:block; margin-bottom:5px;">DZ</label>
              <input id="extrude-points-dz" type="number" step="0.001" value="3"
                style="width:100%; padding:7px;">
            </div>
          </div>

          <div style="display:grid; grid-template-columns: 1fr 1fr; gap:10px; margin-bottom:12px;">
            <div>
              <label style="display:block; margin-bottom:5px;">Number of Copies</label>
              <input id="extrude-points-count" type="number" min="1" step="1" value="1"
                style="width:100%; padding:7px;">
            </div>

            <div>
              <label style="display:block; margin-bottom:5px;">Line Type</label>
              <select id="extrude-points-line-type" style="width:100%; padding:7px;">
                <option value="beam">Beam / Line</option>
                <option value="column">Column</option>
                <option value="brace">Brace</option>
              </select>
            </div>
          </div>

          <label style="display:flex; align-items:center; gap:8px;">
            <input id="extrude-points-select-result" type="checkbox" checked>
            Select created lines after operation
          </label>
        </div>

        <div style="padding:10px; border:1px solid #555; border-radius:6px; color:#777; font-size:12px;">
          Puntos seleccionados: <b>${selectedNodes.length}</b><br>
          Puntos en vista activa: <b>${activeViewNodes.length}</b><br>
          Recomendación: usa DZ para crear líneas verticales entre pisos.
        </div>
      </div>
    `,
      showCancelButton: true,
      confirmButtonText: "Extrude",
      cancelButtonText: "Cancelar",

      didOpen: () => {
        const scopeSelect = document.getElementById("extrude-points-scope");

        if (scopeSelect) {
          scopeSelect.value = selectedNodes.length ? "selected" : "active-view";
        }
      },

      preConfirm: () => {
        const scope = document.getElementById("extrude-points-scope")?.value || "selected";

        const dx = Number(document.getElementById("extrude-points-dx")?.value || 0);

        const dy = Number(document.getElementById("extrude-points-dy")?.value || 0);

        const dz = Number(document.getElementById("extrude-points-dz")?.value || 0);

        const count = Number(document.getElementById("extrude-points-count")?.value || 1);

        const lineType = document.getElementById("extrude-points-line-type")?.value || "beam";

        const selectResult = document.getElementById("extrude-points-select-result")?.checked === true;

        if (!["selected", "active-view"].includes(scope)) {
          Swal.showValidationMessage("Selecciona un alcance válido.");
          return false;
        }

        if (!Number.isFinite(dx) || !Number.isFinite(dy) || !Number.isFinite(dz)) {
          Swal.showValidationMessage("DX, DY y DZ deben ser valores numéricos.");
          return false;
        }

        if (dx === 0 && dy === 0 && dz === 0) {
          Swal.showValidationMessage("Define al menos un desplazamiento diferente de cero.");
          return false;
        }

        if (!Number.isInteger(count) || count < 1) {
          Swal.showValidationMessage("Number of Copies debe ser un entero mayor o igual a 1.");
          return false;
        }

        return {
          scope,
          dx,
          dy,
          dz,
          count,
          lineType,
          selectResult,
        };
      },
    });

    if (!result.isConfirmed || !result.value) return;

    this.saveUndoState?.("Extrude Points to Lines");

    const summary = this.extrudePointsToLines(result.value);

    this.redraw?.();

    if (summary.createdFrames > 0) {
      this.sync3D?.();
    }

    console.log("📍➡️━━ EDIT Extrude Points to Lines ejecutado:", {
      options: result.value,
      summary,
    });

    this.showMessage?.(
      `📍➡️━━ Extrude Points to Lines: ${summary.createdFrames} línea(s) creada(s), ` +
        `${summary.createdNodes} nodo(s) nuevo(s).`,
    );
  },

  getExtrudePointCandidates(scope = "selected") {
    if (scope === "selected") {
      return (
        this.getEditSelectedNodes?.({
          respectActiveView: true,
        }) || []
      );
    }

    if (scope === "active-view") {
      return (this.nodes || []).filter((node) => {
        return this.isEditNodeObject(node) && this.isEditObjectVisibleInActiveView(node);
      });
    }

    return [];
  },

  createExtrudedFrame(nodeA, nodeB, lineType = "beam", selectResult = true) {
    const frame = new Beam(this.globalE, this.globalA);

    frame.id = this.getNextEditFrameId();

    frame.node1 = nodeA;
    frame.node2 = nodeB;

    frame.E = this.globalE;
    frame._A = this.globalA;

    frame.elementType = lineType;
    frame.type = lineType;
    frame.objectType = "frame";
    frame.visible = true;

    frame.selected = selectResult;
    frame.isSelected = selectResult;

    if (selectResult && frame.style?.selected) {
      frame.style.selected();
    }

    frame.assignment = {};
    frame.frameLoads = [];
    frame.lineLoads = [];

    this.shapes.push(frame);

    if (!nodeA.beams) nodeA.beams = [];
    if (!nodeB.beams) nodeB.beams = [];

    if (!nodeA.beams.includes(frame)) nodeA.beams.push(frame);
    if (!nodeB.beams.includes(frame)) nodeB.beams.push(frame);

    return frame;
  },

  extrudePointsToLines(options = {}) {
    const scope = options.scope || "selected";
    const dx = Number(options.dx || 0);
    const dy = Number(options.dy || 0);
    const dz = Number(options.dz || 0);
    const count = Math.max(1, Number(options.count || 1));
    const lineType = options.lineType || "beam";
    const selectResult = options.selectResult !== false;

    const baseNodes = this.getExtrudePointCandidates(scope);

    const summary = {
      baseNodes: baseNodes.length,
      createdNodes: 0,
      createdFrames: 0,
    };

    if (!baseNodes.length) {
      return summary;
    }

    this.clearEditSelectionFlags?.();

    baseNodes.forEach((baseNode) => {
      let previousNode = baseNode;

      for (let i = 1; i <= count; i++) {
        const offset = {
          x: dx,
          y: dy,
          z: dz,
        };

        const nextPosition = this.offsetEditPoint(previousNode.position, offset);

        const newNode = new StructuralNode(
          {
            x: Number(nextPosition.x || 0),
            y: Number(nextPosition.y || 0),
          },
          this.getNextEditNodeId(),
          Number(nextPosition.z || 0),
        );

        newNode.position.x = Number(nextPosition.x || 0);
        newNode.position.y = Number(nextPosition.y || 0);
        newNode.position.z = Number(nextPosition.z || 0);

        newNode.beams = [];
        newNode.visible = true;

        newNode.selected = selectResult;
        newNode.isSelected = selectResult;

        if (selectResult && newNode.style?.selected) {
          newNode.style.selected();
        }

        newNode.assignment = {};
        newNode.pointLoads = [];
        newNode.jointLoads = [];

        this.nodes.push(newNode);

        this.createExtrudedFrame(previousNode, newNode, lineType, selectResult);

        summary.createdNodes++;
        summary.createdFrames++;

        previousNode = newNode;
      }
    });

    this.reindexModelObjects?.();

    return summary;
  },

  // =========================================
  // ==== EDIT: EXTRUDE LINES TO AREAS =======
  // =========================================

  async openExtrudeLinesToAreasDialog() {
    const selectedFrames =
      this.getEditSelectedFrames?.({
        respectActiveView: true,
      }) || [];

    const activeViewFrames = (this.shapes || []).filter((frame) => {
      return this.isEditFrameObject(frame) && this.isEditObjectVisibleInActiveView(frame);
    });

    if (!selectedFrames.length && !activeViewFrames.length) {
      this.showMessage?.("▭ No hay líneas disponibles para extruir a áreas.", "warning");
      console.warn("EDIT Extrude Lines to Areas: no hay líneas.");
      return;
    }

    const result = await Swal.fire({
      title: "Extrude Lines to Areas",
      width: 700,
      html: `
      <div style="text-align:left; font-size:13px;">
        <p style="margin-bottom:12px;">
          Crea áreas a partir de líneas seleccionadas mediante un desplazamiento.
        </p>

        <div style="border:1px solid #555; border-radius:6px; padding:10px; margin-bottom:12px;">
          <div style="font-weight:bold; margin-bottom:8px;">
            Extrude Options
          </div>

          <label style="display:block; margin-bottom:5px;">Scope</label>
          <select id="extrude-lines-scope" style="width:100%; padding:7px; margin-bottom:12px;">
            <option value="selected">Selected Lines Only</option>
            <option value="active-view">All Lines in Active View</option>
          </select>

          <div style="display:grid; grid-template-columns: 1fr 1fr 1fr; gap:10px; margin-bottom:12px;">
            <div>
              <label style="display:block; margin-bottom:5px;">DX</label>
              <input id="extrude-lines-dx" type="number" step="0.001" value="0"
                style="width:100%; padding:7px;">
            </div>

            <div>
              <label style="display:block; margin-bottom:5px;">DY</label>
              <input id="extrude-lines-dy" type="number" step="0.001" value="0"
                style="width:100%; padding:7px;">
            </div>

            <div>
              <label style="display:block; margin-bottom:5px;">DZ</label>
              <input id="extrude-lines-dz" type="number" step="0.001" value="3"
                style="width:100%; padding:7px;">
            </div>
          </div>

          <div style="display:grid; grid-template-columns: 1fr 1fr; gap:10px; margin-bottom:12px;">
            <div>
              <label style="display:block; margin-bottom:5px;">Number of Copies</label>
              <input id="extrude-lines-count" type="number" min="1" step="1" value="1"
                style="width:100%; padding:7px;">
            </div>

            <div>
              <label style="display:block; margin-bottom:5px;">Area Type</label>
              <select id="extrude-lines-area-type" style="width:100%; padding:7px;">
                <option value="wall">Wall</option>
                <option value="slab">Slab</option>
                <option value="opening">Opening</option>
                <option value="area">Generic Area</option>
              </select>
            </div>
          </div>

          <label style="display:flex; align-items:center; gap:8px; margin-bottom:8px;">
            <input id="extrude-lines-select-result" type="checkbox" checked>
            Select created areas after operation
          </label>

          <label style="display:flex; align-items:center; gap:8px;">
            <input id="extrude-lines-keep-original" type="checkbox" checked>
            Keep original lines
          </label>
        </div>

        <div style="padding:10px; border:1px solid #555; border-radius:6px; color:#777; font-size:12px;">
          Líneas seleccionadas: <b>${selectedFrames.length}</b><br>
          Líneas en vista activa: <b>${activeViewFrames.length}</b><br>
          Recomendación: usa DZ para crear muros verticales desde vigas/líneas.
        </div>
      </div>
    `,
      showCancelButton: true,
      confirmButtonText: "Extrude",
      cancelButtonText: "Cancelar",

      didOpen: () => {
        const scopeSelect = document.getElementById("extrude-lines-scope");

        if (scopeSelect) {
          scopeSelect.value = selectedFrames.length ? "selected" : "active-view";
        }
      },

      preConfirm: () => {
        const scope = document.getElementById("extrude-lines-scope")?.value || "selected";

        const dx = Number(document.getElementById("extrude-lines-dx")?.value || 0);

        const dy = Number(document.getElementById("extrude-lines-dy")?.value || 0);

        const dz = Number(document.getElementById("extrude-lines-dz")?.value || 0);

        const count = Number(document.getElementById("extrude-lines-count")?.value || 1);

        const areaType = document.getElementById("extrude-lines-area-type")?.value || "wall";

        const selectResult = document.getElementById("extrude-lines-select-result")?.checked === true;

        const keepOriginalLines = document.getElementById("extrude-lines-keep-original")?.checked === true;

        if (!["selected", "active-view"].includes(scope)) {
          Swal.showValidationMessage("Selecciona un alcance válido.");
          return false;
        }

        if (!Number.isFinite(dx) || !Number.isFinite(dy) || !Number.isFinite(dz)) {
          Swal.showValidationMessage("DX, DY y DZ deben ser valores numéricos.");
          return false;
        }

        if (dx === 0 && dy === 0 && dz === 0) {
          Swal.showValidationMessage("Define al menos un desplazamiento diferente de cero.");
          return false;
        }

        if (!Number.isInteger(count) || count < 1) {
          Swal.showValidationMessage("Number of Copies debe ser un entero mayor o igual a 1.");
          return false;
        }

        return {
          scope,
          dx,
          dy,
          dz,
          count,
          areaType,
          selectResult,
          keepOriginalLines,
        };
      },
    });

    if (!result.isConfirmed || !result.value) return;

    this.saveUndoState?.("Extrude Lines to Areas");

    const summary = this.extrudeLinesToAreas(result.value);

    this.redraw?.();

    if (summary.createdAreas > 0) {
      this.sync3D?.();
    }

    console.log("━━➡️▭ EDIT Extrude Lines to Areas ejecutado:", {
      options: result.value,
      summary,
    });

    this.showMessage?.(`━━➡️▭ Extrude Lines to Areas: ${summary.createdAreas} área(s) creada(s).`);
  },

  getExtrudeLineCandidates(scope = "selected") {
    if (scope === "selected") {
      return (
        this.getEditSelectedFrames?.({
          respectActiveView: true,
        }) || []
      );
    }

    if (scope === "active-view") {
      return (this.shapes || []).filter((frame) => {
        return this.isEditFrameObject(frame) && this.isEditObjectVisibleInActiveView(frame);
      });
    }

    return [];
  },

  createExtrudedAreaFromLinePoints(p1, p2, p3, p4, areaType = "wall", selectResult = true) {
    const area = {
      id: this.getNextEditGenericId(this.areas || []),

      objectType: "area",
      type: areaType,
      elementType: areaType,
      areaType,

      points: [
        {
          x: Number(p1.x || 0),
          y: Number(p1.y || 0),
          z: Number(p1.z || 0),
        },
        {
          x: Number(p2.x || 0),
          y: Number(p2.y || 0),
          z: Number(p2.z || 0),
        },
        {
          x: Number(p3.x || 0),
          y: Number(p3.y || 0),
          z: Number(p3.z || 0),
        },
        {
          x: Number(p4.x || 0),
          y: Number(p4.y || 0),
          z: Number(p4.z || 0),
        },
      ],

      z: Number(p1.z || 0),
      visible: true,

      selected: selectResult,
      isSelected: selectResult,

      assignment: {},
      areaLoads: [],
      shellLoads: [],
    };

    return area;
  },

  extrudeLinesToAreas(options = {}) {
    const scope = options.scope || "selected";

    const dx = Number(options.dx || 0);
    const dy = Number(options.dy || 0);
    const dz = Number(options.dz || 0);

    const count = Math.max(1, Number(options.count || 1));
    const areaType = options.areaType || "wall";
    const selectResult = options.selectResult !== false;
    const keepOriginalLines = options.keepOriginalLines !== false;

    const baseFrames = this.getExtrudeLineCandidates(scope);

    const summary = {
      baseFrames: baseFrames.length,
      createdAreas: 0,
      removedFrames: 0,
    };

    if (!baseFrames.length) {
      return summary;
    }

    this.clearEditSelectionFlags?.();

    baseFrames.forEach((frame) => {
      if (!frame?.node1?.position || !frame?.node2?.position) return;

      let currentP1 = {
        x: Number(frame.node1.position.x || 0),
        y: Number(frame.node1.position.y || 0),
        z: Number(frame.node1.position.z || 0),
      };

      let currentP2 = {
        x: Number(frame.node2.position.x || 0),
        y: Number(frame.node2.position.y || 0),
        z: Number(frame.node2.position.z || 0),
      };

      for (let i = 1; i <= count; i++) {
        const offset = {
          x: dx,
          y: dy,
          z: dz,
        };

        const nextP1 = this.offsetEditPoint(currentP1, offset);
        const nextP2 = this.offsetEditPoint(currentP2, offset);

        const area = this.createExtrudedAreaFromLinePoints(
          currentP1,
          currentP2,
          nextP2,
          nextP1,
          areaType,
          selectResult,
        );

        this.areas.push(area);
        summary.createdAreas++;

        currentP1 = nextP1;
        currentP2 = nextP2;
      }

      if (!keepOriginalLines) {
        if (this.removeFrameFromModel(frame)) {
          summary.removedFrames++;
        }
      }
    });

    this.reindexModelObjects?.();

    return summary;
  },

  replicateElements(copies, dx, dy, dz) {
    if (!this.moveObjectState?.selectedObject) {
      this.showMessage("Seleccione un elemento para replicar", "warning");
      return;
    }

    const original = this.moveObjectState.selectedObject;
    const newElements = [];

    for (let i = 1; i <= copies; i++) {
      const offsetX = dx * i;
      const offsetY = dy * i;
      const offsetZ = dz * i;

      if (original.isNode) {
        const newNode = new StructuralNode(
          original.position.x + offsetX,
          original.position.y + offsetY,
          (original.position.z || 0) + offsetZ,
        );
        this.nodes.push(newNode);
        newElements.push(newNode);
      } else if (original.isBeam) {
        const newNode1 = new StructuralNode(
          original.node1.position.x + offsetX,
          original.node1.position.y + offsetY,
          (original.node1.position.z || 0) + offsetZ,
        );
        const newNode2 = new StructuralNode(
          original.node2.position.x + offsetX,
          original.node2.position.y + offsetY,
          (original.node2.position.z || 0) + offsetZ,
        );
        this.nodes.push(newNode1, newNode2);
        const newBeam = new Beam(newNode1, newNode2);
        this.shapes.push(newBeam);
        newElements.push(newBeam);
      }
    }

    this.redraw();
    this.sync3D();
    this.showMessage(`🔄 Se replicaron ${copies} elemento(s)`);
  },


};
