// mixins/io/file-io/model-file.js — parte "model-file" de file-io
// (file-io.js se partió en sub-mixins por responsabilidad; barril en file-io.js).
import Swal from "sweetalert2";
import { Beam, Node as StructuralNode } from "../../../model/shapes.js";
import { read as readmat } from "mat-for-js";
import { axisToFixed, removeFromArray } from "../../../lib/utils.js";
import { Triangle, Puente, Arco } from "../../../model/parametricModels.js";
import { elevateSelectedNodes, extrudeToNewFloor, lowerSelectedNodes, selectAllNodes, activate3DDrawingMode } from "../../../3d/modeling3d.js";
import { toggleView3D } from "../../../3d/viewer3d.js";
import {
  serializeFrameForceModule,
  restoreFrameForceModule,
} from "../../../engine/frameForcePersistence.js";

export const modelFileMixin = {
  creaArco() {
    const arco = new Arco();
    this._ajustarModeloElevacion(arco);
    this.parametricModels.push(arco);
    this.sync3D();
    this.setState(this.selectedParametricState, { selectedParametric: [arco] });
  },

  creaElipse() {
    const puente = new Puente();
    this._ajustarModeloElevacion(puente);
    this.parametricModels.push(puente);
    this.sync3D();
    this.setState(this.selectedParametricState, { selectedParametric: [puente] });
  },

  creaTriangulo() {
    const triangle = new Triangle();
    this._ajustarModeloElevacion(triangle);
    this.parametricModels.push(triangle);
    this.sync3D();
    this.setState(this.selectedParametricState, { selectedParametric: [triangle] });
  },

  addToScene(parametricModel) {
    this.nodes.push(...parametricModel.nodes);
    this.shapes.push(...parametricModel.shapes);
    removeFromArray(this.parametricModels, parametricModel);
    this.nodes.forEach((node, index) => {
      node.id = index + 1;
    });
    this.shapes.forEach((beam, index) => {
      beam.id = index + 1;
    });
    this.setState(this.idleState);
    this.sync3D();
  },

  // ===============================================
  // ========== MÉTODOS PARA EL MENÚ FILE ==========
  // ===============================================

  activateViewMenuAction(action) {
    console.log("View action:", action);

    switch (action) {
      // ===============================
      // CONFIGURAR VISTA
      // ===============================
      case "set-3d-view":
        this.set3DView();
        break;

      case "set-plan-view":
        this.setPlanView();
        break;

      case "set-elevation-view":
        this.setElevationView();
        break;

      // ===============================
      // ZOOM
      // ===============================
      case "rubber-band-zoom":
        this.rubberBandZoom();
        break;

      case "restore-full-view":
        this.restoreFullView();
        break;

      case "previous-zoom":
        this.previousZoom();
        break;

      case "zoom-in-one-step":
        this.zoomInOneStep();
        break;

      case "zoom-out-one-step":
        this.zoomOutOneStep();
        break;

      // ===============================
      // PAN
      // ===============================
      case "pan":
        this.panView();
        break;

      // ===============================
      // VISTA EXTRUIDA 3D (Extrude View tipo ETABS)
      // ===============================
      case "toggle-extrude-frames":
        this.options.extrudeFrames3D = !this.options.extrudeFrames3D;
        this.showMessage?.(
          `Frames extruidos (3D): ${this.options.extrudeFrames3D ? "ON" : "OFF"}`,
          "info",
        );
        this.sync3D?.();
        break;

      case "toggle-extrude-shells":
        this.options.extrudeShells3D = !this.options.extrudeShells3D;
        this.showMessage?.(
          `Shells extruidos (3D): ${this.options.extrudeShells3D ? "ON" : "OFF"}`,
          "info",
        );
        this.sync3D?.();
        break;

      default:
        this.showMessage?.(`Acción View no reconocida: ${action}`, "warning");
        console.warn("Acción View no reconocida:", action);
        break;
    }

    this.redraw?.();
  },

  // ============================================================
  // BLOQUE 7T-A - Opciones persistentes Modal Spectral tipo ETABS
  // ============================================================

  getDefaultModalSpectralOptions() {
    return {
      useRigidDiaphragms: true,
      diaphragmMode: "rigid_by_story",
      massSourceMode: "story_mass",
      storyMassDistribution: "by_level",

      modalCombination: "CQC",
      dampingRatio: 0.05,

      numberOfModes: 12,
      useRealModalPeriods: true,
      useModalParticipatingMass: true,
      useCombinedModalResults: true,
    };
  },

  getDefaultModalSpectralModelCalibration() {
    return {
      enabled: false,
      globalStiffnessScale: 1.0,
      globalMassScale: 1.0,
      axialStiffnessScale: 1.0,
      bendingStiffnessScale: 1.0,
      torsionStiffnessScale: 1.0,
    };
  },

  toBooleanModalSpectralOption(value, fallback = false) {
    if (typeof value === "boolean") return value;
    if (value === "true") return true;
    if (value === "false") return false;
    return fallback;
  },

  toNumberModalSpectralOption(value, fallback = 0) {
    const number = Number(value);
    return Number.isFinite(number) ? number : fallback;
  },

  normalizeModalSpectralCombination(value) {
    const combination = String(value || "CQC")
      .trim()
      .toUpperCase();

    if (["CQC", "SRSS", "ABS"].includes(combination)) {
      return combination;
    }

    return "CQC";
  },

  ensureModalSpectralOptions(source = {}) {
    const defaultOptions = this.getDefaultModalSpectralOptions();
    const defaultCalibration = this.getDefaultModalSpectralModelCalibration();

    const importedOptions = source.modalSpectralOptions || source.analysisOptions || {};

    const importedCalibration = source.modalSpectralModelCalibration || source.modelCalibration || {};

    const mergedOptions = {
      ...defaultOptions,
      ...(this.modalSpectralOptions || {}),
      ...importedOptions,
    };

    const mergedCalibration = {
      ...defaultCalibration,
      ...(this.modalSpectralModelCalibration || {}),
      ...importedCalibration,
    };

    this.modalSpectralOptions = {
      useRigidDiaphragms: this.toBooleanModalSpectralOption(mergedOptions.useRigidDiaphragms, true),

      diaphragmMode: mergedOptions.diaphragmMode || "rigid_by_story",

      massSourceMode: mergedOptions.massSourceMode || "story_mass",

      storyMassDistribution: mergedOptions.storyMassDistribution || "by_level",

      modalCombination: this.normalizeModalSpectralCombination(mergedOptions.modalCombination),

      dampingRatio: this.toNumberModalSpectralOption(mergedOptions.dampingRatio, 0.05),

      numberOfModes: Math.max(1, Math.round(this.toNumberModalSpectralOption(mergedOptions.numberOfModes, 12))),

      useRealModalPeriods: this.toBooleanModalSpectralOption(mergedOptions.useRealModalPeriods, true),

      useModalParticipatingMass: this.toBooleanModalSpectralOption(mergedOptions.useModalParticipatingMass, true),

      useCombinedModalResults: this.toBooleanModalSpectralOption(mergedOptions.useCombinedModalResults, true),
    };

    this.modalSpectralModelCalibration = {
      enabled: this.toBooleanModalSpectralOption(mergedCalibration.enabled, false),

      globalStiffnessScale: this.toNumberModalSpectralOption(mergedCalibration.globalStiffnessScale, 1.0),

      globalMassScale: this.toNumberModalSpectralOption(mergedCalibration.globalMassScale, 1.0),

      axialStiffnessScale: this.toNumberModalSpectralOption(mergedCalibration.axialStiffnessScale, 1.0),

      bendingStiffnessScale: this.toNumberModalSpectralOption(mergedCalibration.bendingStiffnessScale, 1.0),

      torsionStiffnessScale: this.toNumberModalSpectralOption(mergedCalibration.torsionStiffnessScale, 1.0),
    };

    return {
      modalSpectralOptions: this.modalSpectralOptions,
      modalSpectralModelCalibration: this.modalSpectralModelCalibration,
    };
  },

  // ============================================================
  // BLOQUE 7J - Guardar / restaurar resultados Modal Spectral
  // ============================================================

  buildModalSpectralSaveData() {
    const clean = (value, fallback = null) => {
      try {
        return JSON.parse(JSON.stringify(value ?? fallback));
      } catch (error) {
        console.warn("No se pudo clonar Modal Spectral:", value, error);
        return fallback;
      }
    };

    this.ensureModalSpectralOptions?.();

    return {
      version: "7J",
      savedAt: new Date().toISOString(),

      status: this.modalSpectralStatus || "not_run",
      lastRunAt: this.modalSpectralLastRunAt || null,
      lastError: this.modalSpectralLastError || null,
      lastPayload: clean(this.modalSpectralLastPayload, null),
      lastResult: clean(this.modalSpectralLastResult, null),
      lastTable: clean(this.modalSpectralLastTable, []),

      // BLOQUE 7Q-C
      reportHistory: clean(this.modalSpectralReportHistory, []),

      // BLOQUE 7T-A
      modalSpectralOptions: clean(this.modalSpectralOptions, this.getDefaultModalSpectralOptions?.() || {}),

      modalSpectralModelCalibration: clean(
        this.modalSpectralModelCalibration,
        this.getDefaultModalSpectralModelCalibration?.() || {},
      ),

      // Alias útil para compatibilidad con el payload 7S-B
      modelCalibration: clean(
        this.modalSpectralModelCalibration,
        this.getDefaultModalSpectralModelCalibration?.() || {},
      ),

      responseSpectrumFunctions: clean(this.responseSpectrumFunctions, {
        items: [],
        selectedFunction: null,
      }),

      responseSpectrumCases: clean(this.responseSpectrumCases, {
        items: [],
        selectedCase: null,
      }),
    };
  },

  restoreModalSpectralSaveData(modalSpectralData = null) {
    if (!modalSpectralData || typeof modalSpectralData !== "object") {
      console.warn("⚠️ No hay datos Modal Spectral para restaurar.");
      return false;
    }

    this.modalSpectralStatus = modalSpectralData.status || "loaded_from_json";
    this.modalSpectralLastRunAt = modalSpectralData.lastRunAt || null;
    this.modalSpectralLastError = modalSpectralData.lastError || null;

    this.modalSpectralLastPayload = modalSpectralData.lastPayload || null;
    this.modalSpectralLastResult = modalSpectralData.lastResult || null;
    this.modalSpectralLastTable = Array.isArray(modalSpectralData.lastTable) ? modalSpectralData.lastTable : [];

    // BLOQUE 7Q-C
    this.modalSpectralReportHistory = Array.isArray(modalSpectralData.reportHistory)
      ? modalSpectralData.reportHistory
      : [];

    // ============================================================
    // BLOQUE 7T-A - Restaurar opciones Modal Spectral desde JSON
    // ============================================================

    this.ensureModalSpectralOptions?.({
      modalSpectralOptions: modalSpectralData.modalSpectralOptions || modalSpectralData.analysisOptions || {},

      modalSpectralModelCalibration:
        modalSpectralData.modalSpectralModelCalibration || modalSpectralData.modelCalibration || {},
    });

    if (!this.responseSpectrumFunctions) {
      this.responseSpectrumFunctions = {
        items: [],
        selectedFunction: null,
      };
    }

    if (modalSpectralData.responseSpectrumFunctions?.items) {
      this.responseSpectrumFunctions = {
        items: modalSpectralData.responseSpectrumFunctions.items || [],
        selectedFunction: modalSpectralData.responseSpectrumFunctions.selectedFunction ?? null,
      };
    }

    if (!this.responseSpectrumCases) {
      this.responseSpectrumCases = {
        items: [],
        selectedCase: null,
      };
    }

    if (modalSpectralData.responseSpectrumCases?.items) {
      this.responseSpectrumCases = {
        items: modalSpectralData.responseSpectrumCases.items || [],
        selectedCase: modalSpectralData.responseSpectrumCases.selectedCase ?? null,
      };
    }

    if (!this.analysisResults) {
      this.analysisResults = {};
    }

    this.analysisResults.modalSpectral = {
      type: "modal-spectral-results-package",
      restoredFromJson: true,
      restoredAt: new Date().toISOString(),
      raw: this.modalSpectralLastResult,
      table: this.modalSpectralLastTable,
      summary: this.modalSpectralLastResult?.analysis_summary || null,

      // BLOQUE 7T-A
      options: this.modalSpectralOptions || null,
      modelCalibration: this.modalSpectralModelCalibration || null,
    };

    window.jhackModalSpectralLastResult = this.modalSpectralLastResult;
    window.jhackModalSpectralLastTable = this.modalSpectralLastTable;

    console.log("✅ Modal Spectral restaurado desde JSON:", {
      status: this.modalSpectralStatus,
      cases: this.modalSpectralLastTable.length,
      hasResult: !!this.modalSpectralLastResult,

      // BLOQUE 7T-A
      options: this.modalSpectralOptions,
      modelCalibration: this.modalSpectralModelCalibration,
    });

    return true;
  },

  // Open / Save
  openModel() {
    const input = document.createElement("input");

    input.type = "file";
    input.accept = ".json";

    input.onchange = async (event) => {
      const file = event.target.files?.[0];

      if (!file) return;

      try {
        const text = await file.text();
        const data = JSON.parse(text);

        const loaded = this.loadFromJSON(data);

        if (!loaded) {
          this.showMessage?.("❌ No se pudo cargar el modelo JSON.", "error");
          return;
        }

        this.currentFileName = file.name;

        this.showMessage?.(`✅ Modelo cargado correctamente: ${file.name}`);

        console.log("📂 Modelo abierto:", {
          fileName: file.name,
          data,
        });
      } catch (error) {
        console.error("❌ Error al abrir modelo:", error);

        this.showMessage?.("❌ Error al cargar el archivo. Verifica que sea un JSON válido.", "error");
      }
    };

    input.click();
  },

  saveModel() {
    // Si ya hay un nombre de archivo guardado, usarlo, si no, usar Save As
    if (this.currentFileName) {
      const data = this.exportToJSON();
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = this.currentFileName;
      a.click();
      URL.revokeObjectURL(url);
      this.showMessage("💾 Modelo guardado");
    } else {
      this.saveAsModel();
    }
  },

  saveAsModel() {
    const data = this.exportToJSON();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "modelo_estructura.json";
    a.click();
    URL.revokeObjectURL(url);
    this.showMessage("💾 Modelo guardado como JSON");
  },
};
