/**
 * @mixin actionsMixin
 *
 * Despachadores centrales de las acciones del menú del CAD.
 *
 * Cada método `activate*MenuAction(action)` recibe el identificador de la
 * acción (un string como `"draw-lines"` o `"frame-section"`) y lo enruta
 * hacia el método concreto que la implementa. De esta forma el menú solo
 * conoce strings; la lógica real vive en los otros mixins.
 *
 * Responsabilidades:
 * - activateSelectMenuAction  → selección / deselección de objetos
 * - activateDrawMenuAction    → herramientas de dibujo (puntos, barras, áreas)
 * - deselectAllFromMenu       → limpia todos los estados de selección
 * - activateEditMenuAction    → edición (undo, redo, copiar, pegar, geometría)
 * - activateAssignMenuAction  → asignación de propiedades (secciones, cargas, vínculos)
 * - ensureDisplayOptions      → garantiza que displayOptions esté inicializado
 * - activateDisplayMenuAction → visualización de resultados (formas deformadas, fuerzas)
 * - activateDesignMenuAction  → diseño estructural (Steel Frame, Steel Joist)
 * - ensureDesignOptions       → garantiza que designOptions esté inicializado
 */

import {
  showFrameForceDisplayPanel,
} from "../../diagrams/frameForceDisplayPanel.js";

import {
  loadRealFrameForceResults,
} from "../../engine/frameForceBackend.js";

export const actionsMixin = {
  // ------------------------------------------------------------------
  // 6. ACCIONES DE LA BARRA DE HERRAMIENTAS (Diseñar, Tareas, Estructura, Resultados)
  // ------------------------------------------------------------------

  activateSelectMenuAction(action) {
    switch (action) {
      case "select-invert":
        this.invertSelection();
        break;

      case "select-none":
      case "deselect-all":
        this.deselectAllFromMenu();
        break;

      case "select-pointer-window":
        this.clearAllSelections?.();
        this.setState(this.idleState);
        this.showMessage?.("Modo selección por puntero / ventana activado");
        break;

      // Select by Property (estilo ETABS)
      case "select-prop-frame-sections":
        this.openSelectByPropertyDialog("frame");
        break;

      case "select-prop-slab-sections":
        this.openSelectByPropertyDialog("slab");
        break;

      case "select-prop-deck-sections":
        this.openSelectByPropertyDialog("deck");
        break;

      case "select-prop-wall-sections":
        this.openSelectByPropertyDialog("wall");
        break;

      default:
        this.showMessage?.(`Acción de selección no reconocida: ${action}`, "warning");
        break;
    }

    this.redraw?.();
    this.sync3D?.();
  },

  activateDrawMenuAction(action) {
    switch (action) {
      case "select-object":
        this.clearAllSelections?.();
        this.setState(this.idleState);
        this.showMessage("Modo selección activado");
        break;

      case "reshape-object":
        this.clearAllSelections?.();
        this.setState(this.reshapeObjectState);
        this.showMessage("Modo modificar objeto activado");
        break;

      case "draw-point":
        this.clearAllSelections?.();
        this.setState(this.pointDrawingState);
        this.showMessage("Modo dibujar puntos activado");
        break;

      case "draw-grid-axis-x":
        this.clearAllSelections?.();
        this.setState(this.gridAxisXDrawingState);
        this.showMessage("Dibujar eje X: clic en el punto por donde pasa. Esc para salir.");
        break;

      case "draw-grid-axis-y":
        this.clearAllSelections?.();
        this.setState(this.gridAxisYDrawingState);
        this.showMessage("Dibujar eje Y: clic en el punto por donde pasa. Esc para salir.");
        break;

      case "draw-lines":
        this.clearAllSelections?.();
        this.setState(this.beamDrawingState || this.trussDrawingState);
        this.showMessage("Draw Lines activado");
        break;

      case "create-lines-region-clicks":
        this.clearAllSelections?.();
        this.setState(this.createLinesRegionClicksState);
        this.showMessage("Create Lines in Region or at Clicks activado");
        break;

      case "create-columns-region-clicks": {
        const view = this.viewSet?.[this.activeViewIndex];

        if (!view || view.type !== "plan") {
          this.showMessage("Create Columns solo está disponible en vistas de planta", "warning");
          break;
        }

        this.clearAllSelections?.();
        this.setState(this.columnsRegionState);
        this.showMessage("Create Columns in Region or at Clicks: clic en un vértice, o arrastra un rectángulo.");
        break;
      }

      case "create-secondary-beams-region-clicks": {
        const view = this.viewSet?.[this.activeViewIndex];

        if (!view || view.type !== "plan") {
          this.showMessage("Create Secondary Beams solo está disponible en vistas de planta", "warning");
          break;
        }

        this.clearAllSelections?.();
        this.setState(this.createSecondaryBeamsRegionClicksState);
        this.showMessage("Create Secondary Beams activado | R cambia dirección | + / - cambia cantidad");
        break;
      }

      case "draw-area-slab":
        this.clearAllSelections?.();
        this.setState(this.slabDrawingState);
        this.showMessage("Modo dibujar losa / área activado");
        break;

      case "draw-area-slab-rectangle": {
        const view = this.viewSet?.[this.activeViewIndex];

        if (!view || view.type !== "plan") {
          this.showMessage("Las losas se dibujan en planta.", "warning");
          break;
        }

        this.clearAllSelections?.();
        this.setState(this.slabRegionState);
        this.showMessage("Losa rectangular: clic en una esquina, luego en la opuesta.");
        break;
      }

      case "draw-area-zapata":
        this.clearAllSelections?.();
        this.setState(this.zapataDrawingState);
        this.showMessage("Modo dibujar zapata activado");
        break;

      case "draw-area-wall":
        this.clearAllSelections?.();
        this.setState(this.wallDrawingState);
        this.showMessage("Modo dibujar muro / panel activado");
        break;

      case "draw-wall-segment": {
        if (this.isBasePlanViewActive?.()) {
          this.showMessage(
            "Dibuja muros desde un piso (no desde la Base): el panel se arma entre el piso de abajo y el actual.",
            "warning"
          );
          break;
        }

        this.clearAllSelections?.();
        this.setState(this.wallSegmentDrawingState);
        this.showMessage("Muro (2 clics): elegí el punto inicial y el final sobre una línea de grid/viga o un vértice/nodo.");
        break;
      }

      case "draw-area-opening":
        this.clearAllSelections?.();
        this.setState(this.openingDrawingState);
        this.showMessage("Modo dibujar abertura activado");
        break;

      case "draw-developed-elevation":
        this.showMessage("Definición de elevación desarrollada - Próximamente");
        break;

      case "draw-dimension-line":
        this.clearAllSelections?.();
        this.setState(this.dimensionLineDrawingState);
        this.showMessage("Modo dibujar línea de dimensión activado");
        break;

      case "draw-reference-point":
        this.clearAllSelections?.();
        this.setState(this.referencePointDrawingState);
        this.showMessage("Modo dibujar punto de referencia activado");
        break;

      case "snap-on":
        this.snap_enabled = true;
        this.showMessage("Ajuste a la cuadrícula activado");
        break;

      case "snap-off":
        this.snap_enabled = false;
        this.showMessage("Ajuste a la cuadrícula desactivado");
        break;

      default:
        this.showMessage(`Acción no reconocida: ${action}`);
        break;
    }

    this.redraw?.();
  },

  deselectAllFromMenu() {
    const objects = this.getSelectableObjects();

    objects.forEach((obj) => {
      this.setObjectSelected(obj, false);
    });

    // Limpiar estados internos de selección
    const selectionStates = [
      this.selectedNodesState,
      this.selectedBeamsState,
      this.selectedParametricState,
      this.selectedObjectsState,
      this.moveObjectState,
      this.reshapeObjectState,
    ];

    selectionStates.forEach((state) => {
      if (!state) return;

      if (Array.isArray(state.selectedObjects)) {
        state.selectedObjects = [];
      }

      if (Array.isArray(state.objects)) {
        state.objects = [];
      }

      if ("selectedObject" in state) {
        state.selectedObject = null;
      }

      if ("selectedNode" in state) {
        state.selectedNode = null;
      }

      if ("selectedBeam" in state) {
        state.selectedBeam = null;
      }
    });

    // MUY IMPORTANTE:
    // volver al modo selección normal para que deje de pintar amarillo
    if (this.idleState) {
      this.setState(this.idleState);
    }

    this.redraw?.();
    this.sync3D?.();

    this.showMessage?.("Todos los objetos fueron deseleccionados");
  },

  // =========================================
  // ========== MÉTODOS PARA EDIT ============
  // =========================================

  activateEditMenuAction(action) {
    console.log("Edit action:", action);

    switch (action) {
      // ===============================
      // HISTORIAL
      // ===============================
      case "undo":
        if (typeof this.undo === "function") {
          this.undo();
        } else {
          this.showEditNotImplemented("Undo");
        }
        break;

      case "redo":
        if (typeof this.redo === "function") {
          this.redo();
        } else {
          this.showEditNotImplemented("Redo");
        }
        break;

      // ===============================
      // PORTAPAPELES
      // ===============================
      case "cut":
        if (typeof this.cut === "function") {
          this.cut();
        } else {
          this.showEditNotImplemented("Cut");
        }
        break;

      case "copy":
        if (typeof this.copy === "function") {
          this.copy();
        } else {
          this.showEditNotImplemented("Copy");
        }
        break;

      case "paste":
        if (typeof this.paste === "function") {
          this.paste();
        } else {
          this.showEditNotImplemented("Paste");
        }
        break;

      case "delete":
        if (typeof this.deleteSelected === "function") {
          this.deleteSelected();
        } else {
          this.showEditNotImplemented("Delete");
        }
        break;

      // ===============================
      // EDICIÓN DEL MODELO
      // ===============================
      case "replicate":
        if (typeof this.replicate === "function") {
          this.replicate();
        } else {
          this.showEditNotImplemented("Replicate");
        }
        break;

      // ===============================
      // DATOS DEL MODELO
      // ===============================
      case "edit-grid-data":
        if (typeof this.editGridData === "function") {
          this.editGridData();
        } else if (this.gridEditor && typeof this.gridEditor.open === "function") {
          this.gridEditor.open();
        } else {
          this.showEditNotImplemented("Edit Grid Data");
        }
        break;

      case "edit-story-data":
        if (typeof this.editStoryData === "function") {
          this.editStoryData();
        } else {
          this.showEditNotImplemented("Edit Story Data");
        }
        break;

      case "edit-reference-planes":
        if (typeof this.editReferencePlanes === "function") {
          this.editReferencePlanes();
        } else {
          this.showEditNotImplemented("Edit Reference Planes");
        }
        break;

      case "edit-reference-lines":
        if (typeof this.editReferenceLines === "function") {
          this.editReferenceLines();
        } else {
          this.showEditNotImplemented("Edit Reference Lines");
        }
        break;

      // ===============================
      // HERRAMIENTAS GEOMÉTRICAS
      // ===============================
      case "merge-points":
        if (typeof this.openMergePointsDialog === "function") {
          this.openMergePointsDialog();
        } else {
          this.showEditNotImplemented("Merge Points");
        }
        break;

      case "align-points-lines-edges":
      case "align-objects":
        if (typeof this.openAlignPointsLinesEdgesDialog === "function") {
          this.openAlignPointsLinesEdgesDialog();
        } else {
          this.showEditNotImplemented("Align Points/Lines/Edges");
        }
        break;

      case "move-points-lines-areas":
      case "move-objects":
        if (typeof this.openMovePointsLinesAreasDialog === "function") {
          this.openMovePointsLinesAreasDialog();
        } else {
          this.showEditNotImplemented("Move Points/Lines/Areas");
        }
        break;

      case "join-lines":
        if (typeof this.joinLines === "function") {
          this.joinLines();
        } else {
          this.showEditNotImplemented("Join Lines");
        }
        break;

      case "divide-lines":
        if (typeof this.openDivideLinesDialog === "function") {
          this.openDivideLinesDialog();
        } else {
          this.showEditNotImplemented("Divide Lines");
        }
        break;

      case "divide-areas":
        if (typeof this.openDivideAreasDialog === "function") {
          this.openDivideAreasDialog();
        } else {
          this.showEditNotImplemented("Divide Areas");
        }
        break;

      // ===============================
      // EXTRUSIÓN
      // ===============================
      case "extrude-points-to-lines":
        if (typeof this.openExtrudePointsToLinesDialog === "function") {
          this.openExtrudePointsToLinesDialog();
        } else {
          this.showEditNotImplemented("Extrude Points to Lines");
        }
        break;

      case "extrude-lines-to-areas":
        if (typeof this.openExtrudeLinesToAreasDialog === "function") {
          this.openExtrudeLinesToAreasDialog();
        } else {
          this.showEditNotImplemented("Extrude Lines to Areas");
        }
        break;

      default:
        this.showMessage?.(`Acción Edit no reconocida: ${action}`, "warning");
        console.warn("Acción Edit no reconocida:", action);
        break;
    }

    this.redraw?.();
  },

  showEditNotImplemented(label) {
    this.showMessage?.(`${label}: funcionalidad pendiente de implementar.`, "warning");
    console.warn(`EDIT pendiente: ${label}`);
  },

  // =========================================
  // ========== MÉTODOS PARA ASSIGN ==========
  // =========================================

  activateAssignMenuAction(action) {
    console.log("Assign action:", action);

    switch (action) {
      // ===============================
      // JOINT / POINT
      // ===============================
      case "joint-diaphragms":
        this.openAssignJointDiaphragmsDialog();
        break;

      case "joint-restraints":
        this.openAssignJointRestraintsDialog();
        break;

      case "auto-base-restraints":
        this.autoFixBaseRestraints();
        break;

      case "joint-springs":
        this.openAssignPointSpringsDialog();
        break;

      case "joint-mass":
        this.openAssignJointMassDialog();
        break;

      // Carga de área uniforme en losas (como ETABS: Shell Loads > Uniform).
      // La masa se deriva de estas cargas vía la Fuente de Masa.
      case "area-load-uniform":
        this.openAssignAreaUniformLoadDialog();
        break;

      // Asignar sección de losa (espesor/material) → peso propio automático.
      case "area-slab-section":
        this.openAssignSlabSectionDialog();
        break;

      case "area-wall-section":
        this.openAssignWallSectionDialog();
        break;

      // Asignar diafragma a losas (los nudos lo heredan "From Area", como ETABS).
      case "area-diaphragms":
        this.openAssignShellDiaphragmsDialog();
        break;

      // ===============================
      // FRAME / LINE
      // ===============================
      case "frame-section":
        this.openAssignFrameSectionDialog();
        break;

      case "frame-releases":
        this.openAssignFrameReleasesDialog();
        break;

      case "frame-local-axes":
        this.openAssignFrameLocalAxesDialog();
        break;

      case "frame-end-offsets":
        this.openAssignFrameEndOffsetsDialog();
        break;

      // ===============================
      // JOINT / POINT LOADS
      // ===============================
      case "joint-load-force":
        this.openAssignJointPointForceDialog();
        break;

      case "joint-load-ground-displacement":
        this.openAssignJointGroundDisplacementDialog();
        break;

      case "joint-load-temperature":
        this.openAssignJointTemperatureDialog();
        break;

      // ===============================
      // FRAME / LINE LOADS
      // ===============================
      case "frame-load-point":
        this.openAssignFramePointLoadDialog();
        break;

      case "frame-load-distributed":
        this.openAssignFrameDistributedLoadDialog();
        break;

      case "frame-load-temperature":
        this.openAssignFrameTemperatureLoadDialog();
        break;

      // ===============================
      // GROUP NAMES
      // ===============================
      case "group-names":
        this.openAssignGroupNamesDialog();
        break;

      case "show-selected-assignments":
        this.showSelectedAssignmentsSummary();
        break;

      default:
        this.showMessage?.(`Acción Assign no reconocida: ${action}`, "warning");
        console.warn("Acción Assign no reconocida:", action);
        break;
    }
  },

  // =====================================================
  // DISPLAY MENU
  // =====================================================
  ensureDisplayOptions() {
    if (!this.displayOptions) {
      this.displayOptions = {};
    }

    this.displayOptions = {
      showUndeformedShape: this.displayOptions.showUndeformedShape ?? true,

      showReferencePlanes: this.displayOptions.showReferencePlanes ?? true,

      showJointLoads: this.displayOptions.showJointLoads ?? false,
      showFrameLoads: this.displayOptions.showFrameLoads ?? false,

      showDeformedShape: this.displayOptions.showDeformedShape ?? false,
      showModeShape: this.displayOptions.showModeShape ?? false,

      showMemberForces: this.displayOptions.showMemberForces ?? false,
      showMemberForceValues: this.displayOptions.showMemberForceValues ?? false,

      deformedScale: this.displayOptions.deformedScale ?? 1,
      modeNumber: this.displayOptions.modeNumber ?? 1,
      modeScale: this.displayOptions.modeScale ?? 1,
      memberForceType: this.displayOptions.memberForceType ?? "axial",

      analysisResultsAvailable: this.displayOptions.analysisResultsAvailable ?? false,

      lastAnalysisRun: this.displayOptions.lastAnalysisRun ?? null,
    };

    if (!this.options) {
      this.options = {};
    }
  },

  activateDisplayMenuAction(action) {
    this.ensureDisplayOptions();

    switch (action) {
      case "show-undeformed-shape":
        this.showUndeformedShape();
        break;

      case "show-reference-planes":
        this.openShowReferencePlanesDialog();
        break;

      case "show-joint-loads":
        this.openShowJointLoadsDialog();
        break;

      case "show-frame-loads":
        this.openShowFrameLoadsDialog();
        break;

      case "show-deformed-shape":
        this.openShowDeformedShapeDialog();
        break;

      case "show-mode-shape":
        this.openShowModeShapeDialog();
        break;

      case "show-frame-force-diagrams":
        // Carga las fuerzas REALES del motor (gravedad + sísmico) y luego abre
        // el panel. Si el motor no responde, el panel cae a datos mock.
        loadRealFrameForceResults(this)
          .catch((err) => console.warn("Frame forces: motor no disponible, usando mock:", err))
          .finally(() => showFrameForceDisplayPanel(this));
        break;

      case "show-member-forces":
        this.openShowMemberForcesDialog();
        break;
      case "show-modal-spectral-results":
        this.openModalSpectralResultsDialog();
        break;

      case "show-story-drifts":
        this.showStoryDriftDiagram();
        break;

      case "show-story-shears":
        this.showStoryShearDiagram();
        break;

      case "seismic-animation":
        this.startSeismicAnimation();
        break;

      case "seismic-displacement-labels":
        this.toggleSeismicDisplacementLabels();
        break;

      case "seismic-drift-labels":
        this.toggleSeismicDriftLabels();
        break;

      default:
        this.showMessage?.(`Acción Display no reconocida: ${action}`, "warning");
        console.warn("Acción Display no reconocida:", action);
        break;

      case "show-tables":
        this.openShowTablesDialog?.();
        break;
    }
  },

  activateDesignMenuAction(action) {
    console.log("Design action:", action);

    switch (action) {
      // ===============================
      // STEEL FRAME DESIGN
      // ===============================
      case "steel-frame-select-combo":
        this.openSteelFrameSelectComboDialog();
        break;

      case "steel-frame-overwrites":
        this.openSteelFrameOverwritesDialog();
        break;

      case "steel-frame-start-check":
        this.startSteelFrameDesignCheck();
        break;

      case "steel-frame-display-info":
        this.openSteelFrameDisplayDesignInfoDialog();
        break;

      // ===============================
      // STEEL JOIST DESIGN
      // ===============================
      case "steel-joist-select-combo":
        this.openSteelJoistSelectComboDialog();
        break;

      case "steel-joist-overwrites":
        this.openSteelJoistOverwritesDialog();
        break;

      case "steel-joist-start-using-similarity":
        this.startSteelJoistDesignUsingSimilarity();
        break;

      case "steel-joist-start-without-similarity":
        this.startSteelJoistDesignWithoutSimilarity();
        break;

      case "steel-joist-display-info":
        this.openSteelJoistDisplayDesignInfoDialog();
        break;

      default:
        this.showMessage?.(`Acción Design no reconocida: ${action}`, "warning");
        console.warn("Acción Design no reconocida:", action);
        break;
    }

    this.redraw?.();
  },

  ensureDesignOptions() {
    if (!this.designOptions) {
      this.designOptions = {};
    }

    const steelFramePrevious = this.designOptions.steelFrame || {};
    const steelJoistPrevious = this.designOptions.steelJoist || {};

    this.designOptions.steelFrame = {
      ...steelFramePrevious,

      displayInfo: {
        show: steelFramePrevious.displayInfo?.show ?? false,
        infoType: steelFramePrevious.displayInfo?.infoType ?? "ratio",
        showValues: steelFramePrevious.displayInfo?.showValues ?? true,
      },

      selectedCombos: steelFramePrevious.selectedCombos || ["COMB1"],

      defaultOverwrites: {
        designEnabled: true,
        kFactorMajor: 1.0,
        kFactorMinor: 1.0,
        unbracedLengthMajor: 0,
        unbracedLengthMinor: 0,
        cbFactor: 1.0,
        effectiveLengthFactor: 1.0,
        deflectionCheck: true,
        ...(steelFramePrevious.defaultOverwrites || {}),
      },
    };

    this.designOptions.steelJoist = {
      ...steelJoistPrevious,

      displayInfo: {
        show: steelJoistPrevious.displayInfo?.show ?? false,
        infoType: steelJoistPrevious.displayInfo?.infoType ?? "ratio",
        showValues: steelJoistPrevious.displayInfo?.showValues ?? true,
      },

      selectedCombos: steelJoistPrevious.selectedCombos || ["COMB1"],

      defaultOverwrites: {
        designEnabled: true,
        markAsJoist: true,
        joistType: "K-Series",
        joistDepth: 0.45,
        joistSpacing: 1.2,
        useSimilarity: true,
        similarityTolerance: 0.05,
        deflectionCheck: true,
        ...(steelJoistPrevious.defaultOverwrites || {}),
      },
    };
  },
};
