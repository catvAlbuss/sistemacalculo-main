/**
 * @mixin fileIOMixin
 *
 * Operaciones de entrada/salida de archivos y creación de modelos.
 *
 * Gestiona todo el ciclo de vida de un archivo de modelo CAD:
 * nuevo, abrir, guardar, importar desde formatos externos y exportar.
 * También maneja la compatibilidad con el legacy de cálculo anterior.
 *
 * Los archivos de modelo se serializan a JSON con la estructura:
 *   { nodes, shapes, areas, parametricModels, referenceGrid, stories,
 *     loadCases, loadCombinations, analysisResults, ... }
 *
 * Responsabilidades:
 * - openNewModelDialog()       → diálogo para crear un modelo nuevo (borra el actual)
 * - createModelFromDialog(p)   → crea el grid de referencia y stories iniciales
 * - save()                     → serializa y descarga el modelo como archivo .json
 * - openFileDialog()           → abre un selector de archivo para cargar un .json
 * - loadModelFromJSON(data)    → deserializa y restaura un modelo desde JSON
 * - importFromDXF()            → importación desde archivo DXF
 * - exportToJSON()             → exporta el modelo a JSON (alias de save)
 * - openLegacyCalcDialog()     → compatibilidad con el sistema de cálculo anterior
 * - importFromMatFile()        → importa resultados desde archivo .mat (Octave/MATLAB)
 */
import Swal from "sweetalert2";
import { Beam, Node as StructuralNode } from "../shapes.js";
import { read as readmat } from "mat-for-js";
import { axisToFixed, removeFromArray } from "../utils.js";
import { Triangle, Puente, Arco } from "../parametricModels.js";
import { elevateSelectedNodes, extrudeToNewFloor, lowerSelectedNodes, selectAllNodes, activate3DDrawingMode } from "../3d/modeling3d.js";
import { toggleView3D } from "../3d/viewer3d.js";
import {
  serializeFrameForceModule,
  restoreFrameForceModule,
} from "../analysis/frameForcePersistence.js";

export const fileIOMixin = {
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

  // Import methods
  openTextFileForImport(accept = ".txt,.e2k") {
    return new Promise((resolve, reject) => {
      const input = document.createElement("input");

      input.type = "file";
      input.accept = accept;

      input.onchange = async (event) => {
        try {
          const file = event.target.files?.[0];

          if (!file) {
            resolve(null);
            return;
          }

          const text = await file.text();

          resolve({
            file,
            text,
          });
        } catch (error) {
          reject(error);
        }
      };

      input.click();
    });
  },

  getQuotedValue(line, key) {
    const regex = new RegExp(`${key}\\s+"([^"]*)"`, "i");
    const match = String(line || "").match(regex);

    return match ? match[1] : null;
  },

  getNumericValue(line, key, fallback = 0) {
    const regex = new RegExp(`${key}\\s+(-?\\d+(?:\\.\\d+)?)`, "i");
    const match = String(line || "").match(regex);

    if (!match) return fallback;

    const value = Number(match[1]);

    return Number.isFinite(value) ? value : fallback;
  },

  getWordValue(line, key, fallback = "") {
    const regex = new RegExp(`${key}\\s+([^\\s]+)`, "i");
    const match = String(line || "").match(regex);

    return match ? match[1] : fallback;
  },

  parseJSONAfterData(line) {
    const marker = " DATA ";
    const index = String(line || "").indexOf(marker);

    if (index < 0) return null;

    try {
      return JSON.parse(line.slice(index + marker.length));
    } catch (error) {
      console.warn("No se pudo leer DATA JSON en línea E2K:", line, error);
      return null;
    }
  },

  // FUNCION AUXILIAR PARA IMPORTAR: DEVUELVE UNA ESTRUCTURA DE CARGAS POR NODO CON VALORES POR DEFECTO (0) PARA LOS DISTINTOS TIPOS DE CARGA
  getDefaultNodeForceForImport() {
    return {
      loads: {
        CM: {
          x: 0,
          y: 0,
          z: 0,
          multiplier: 1,
        },
        CV: {
          x: 0,
          y: 0,
          z: 0,
          multiplier: 1,
        },
        CVVM: {
          x: 0,
          y: 0,
          z: 0,
          multiplier: 1,
        },
        CVVP: {
          x: 0,
          y: 0,
          z: 0,
          multiplier: 1,
        },
        CN: {
          x: 0,
          y: 0,
          z: 0,
          multiplier: 1,
        },
        CLL: {
          x: 0,
          y: 0,
          z: 0,
          multiplier: 1,
        },
      },
    };
  },

  parseInitialE2KText(text) {
    const lines = String(text || "")
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter((line) => line && !line.startsWith("$"));

    const stories = [];
    const xGrids = [];
    const yGrids = [];
    const generalGrids = [];
    const materials = [];
    const frameSections = [];
    const nodes = [];
    const frames = [];
    const areas = [];

    const nodeMap = new Map();
    const frameMap = new Map();

    const frameSectionAssignments = new Map();

    lines.forEach((line) => {
      // ===============================
      // STORIES
      // STORY "Piso 1" ID 1 ELEV 3
      // ===============================
      if (line.startsWith("STORY ")) {
        const name = this.getQuotedValue(line, "STORY") || "Story";
        const id = this.getNumericValue(line, "ID", stories.length);
        const elevation = this.getNumericValue(line, "ELEV", 0);

        stories.push({
          id,
          name,
          elevation,
        });

        return;
      }

      // ===============================
      // GRIDLINE
      // GRIDLINE DIR X ID "A" ORD 0 VISIBLE YES BUBBLE "End"
      // ===============================
      if (line.startsWith("GRIDLINE ")) {
        const dir = this.getWordValue(line, "DIR", "").toUpperCase();
        const id = this.getQuotedValue(line, "ID") || "";
        const ordinate = this.getNumericValue(line, "ORD", 0);
        const visible = !/VISIBLE\s+NO/i.test(line);
        const bubbleLoc = this.getQuotedValue(line, "BUBBLE") || (dir === "X" ? "End" : "Start");

        const gridData = {
          id,
          ordinate,
          visible,
          bubbleLoc,
        };

        if (dir === "X") {
          xGrids.push(gridData);
        }

        if (dir === "Y") {
          yGrids.push(gridData);
        }

        return;
      }

      // ===============================
      // GENERAL GRID
      // GENERALGRID "A" X1 0 Y1 0 X2 0 Y2 10 SOURCE "x" VISIBLE YES
      // ===============================
      if (line.startsWith("GENERALGRID ")) {
        const id = this.getQuotedValue(line, "GENERALGRID") || `G${generalGrids.length + 1}`;

        generalGrids.push({
          id,
          label: id,
          x1: this.getNumericValue(line, "X1", 0),
          y1: this.getNumericValue(line, "Y1", 0),
          x2: this.getNumericValue(line, "X2", 0),
          y2: this.getNumericValue(line, "Y2", 0),
          source: this.getQuotedValue(line, "SOURCE") || "custom",
          visible: !/VISIBLE\s+NO/i.test(line),
          bubbleLoc: "End",
        });

        return;
      }

      // ===============================
      // MATERIAL
      // MATERIAL "STEEL" NAME "STEEL" TYPE "Isotropic" E 210000
      // ===============================
      if (line.startsWith("MATERIAL ")) {
        const id = this.getQuotedValue(line, "MATERIAL") || `MAT_${materials.length + 1}`;
        const name = this.getQuotedValue(line, "NAME") || id;
        const type = this.getQuotedValue(line, "TYPE") || "Other";
        const E = this.getNumericValue(line, "E", 0);

        materials.push({
          id,
          name,
          type,
          E,
        });

        return;
      }

      // ===============================
      // FRAME SECTION
      // FRAMESECTION "W10X12" NAME "W10X12" TYPE "wf" A 3.54
      // ===============================
      if (line.startsWith("FRAMESECTION ")) {
        const id = this.getQuotedValue(line, "FRAMESECTION") || `SEC_${frameSections.length + 1}`;
        const name = this.getQuotedValue(line, "NAME") || id;
        const type = this.getQuotedValue(line, "TYPE") || "General";
        const A = this.getNumericValue(line, "A", 0);

        frameSections.push({
          id,
          name,
          type,
          A,
          area: A,
        });

        return;
      }

      // ===============================
      // POINT
      // POINT "1" X 0 Y 0 Z 0
      // ===============================
      if (line.startsWith("POINT ")) {
        const id = Number(this.getQuotedValue(line, "POINT") || nodes.length + 1);

        const nodeData = {
          id,
          x: this.getNumericValue(line, "X", 0),
          y: this.getNumericValue(line, "Y", 0),
          z: this.getNumericValue(line, "Z", 0),

          visible: true,

          constraints: null,
          restraints: null,
          hasRestraints: false,

          pointLoads: [],
          jointLoads: [],
          hasPointLoads: false,
          hasJointLoads: false,

          groupIds: [],
          groupNames: [],
          groups: [],
          hasGroups: false,

          assignment: {},

          // Importante para que renderer.drawForce() no reviente
          force: this.getDefaultNodeForceForImport(),
          reaction: {
            x: 0,
            y: 0,
            z: 0,
          },
        };

        nodes.push(nodeData);
        nodeMap.set(String(id), nodeData);

        return;
      }

      // ===============================
      // FRAME
      // FRAME "1" I "1" J "2" TYPE "beam" SECTION "W10X12"
      // ===============================
      if (line.startsWith("FRAME ")) {
        const id = Number(this.getQuotedValue(line, "FRAME") || frames.length + 1);
        const node1Id = this.getQuotedValue(line, "I");
        const node2Id = this.getQuotedValue(line, "J");
        const type = this.getQuotedValue(line, "TYPE") || "beam";
        const sectionName = this.getQuotedValue(line, "SECTION");

        const section =
          frameSections.find(
            (item) => String(item.id) === String(sectionName) || String(item.name) === String(sectionName),
          ) || null;

        const frameData = {
          id,
          node1: Number(node1Id),
          node2: Number(node2Id),
          node1Id: Number(node1Id),
          node2Id: Number(node2Id),
          type,
          elementType: type,
          objectType: "frame",
          sectionId: section && sectionName !== "NONE" ? section.id : null,
          sectionName: section && sectionName !== "NONE" ? section.name : null,
          section: section && sectionName !== "NONE" ? { ...section } : null,
          frameSection: section && sectionName !== "NONE" ? { ...section } : null,
          hasAssignedSection: Boolean(section && sectionName !== "NONE"),
          A: section?.A ?? null,
          _A: section?.A ?? null,
          frameLoads: [],
          lineLoads: [],
          assignment: {},
        };

        frames.push(frameData);
        frameMap.set(String(id), frameData);

        return;
      }

      // ===============================
      // AREA
      // AREA "1" TYPE "area" P1(0,0,0) P2(...)
      // Versión básica: por ahora guarda línea como metadata.
      // ===============================
      if (line.startsWith("AREA ")) {
        const id = Number(this.getQuotedValue(line, "AREA") || areas.length + 1);
        const type = this.getQuotedValue(line, "TYPE") || "area";

        areas.push({
          id,
          type,
          areaType: type,
          points: [],
          raw: line,
          assignment: {},
        });

        return;
      }

      // ===============================
      // ASSIGN FRAME
      // ASSIGN FRAME "2" SECTION "W10X12"
      // ===============================
      if (line.startsWith("ASSIGN FRAME ")) {
        const frameId = this.getQuotedValue(line, "FRAME");
        const sectionName = this.getQuotedValue(line, "SECTION");

        if (frameId && sectionName) {
          frameSectionAssignments.set(String(frameId), sectionName);
        }

        return;
      }

      // ===============================
      // JOINT LOAD
      // JOINTLOAD POINT "1" CASE "DEAD" TYPE "force" DATA {...}
      // ===============================
      if (line.startsWith("JOINTLOAD ")) {
        const nodeId = this.getQuotedValue(line, "POINT");
        const loadData = this.parseJSONAfterData(line);

        if (nodeId && loadData && nodeMap.has(String(nodeId))) {
          const node = nodeMap.get(String(nodeId));

          node.pointLoads.push(loadData);
          node.jointLoads.push(loadData);
          node.hasPointLoads = true;
          node.hasJointLoads = true;
          node.assignment.pointLoads = node.pointLoads;
          node.assignment.jointLoads = node.jointLoads;
        }

        return;
      }

      // ===============================
      // FRAME LOAD
      // FRAMELOAD FRAME "2" CASE "DEAD" TYPE "distributed" DATA {...}
      // ===============================
      if (line.startsWith("FRAMELOAD ")) {
        const frameId = this.getQuotedValue(line, "FRAME");
        const loadData = this.parseJSONAfterData(line);

        if (frameId && loadData && frameMap.has(String(frameId))) {
          const frame = frameMap.get(String(frameId));

          frame.frameLoads.push(loadData);
          frame.lineLoads.push(loadData);
          frame.hasFrameLoads = true;
          frame.hasLineLoads = true;
          frame.assignment.frameLoads = frame.frameLoads;
          frame.assignment.lineLoads = frame.lineLoads;
        }

        return;
      }
    });

    // Reaplicar asignaciones de sección explícitas.
    frameSectionAssignments.forEach((sectionName, frameId) => {
      const frame = frameMap.get(String(frameId));

      if (!frame) return;

      const section =
        frameSections.find(
          (item) => String(item.id) === String(sectionName) || String(item.name) === String(sectionName),
        ) || null;

      if (!section || sectionName === "NONE") return;

      frame.sectionId = section.id;
      frame.sectionName = section.name;
      frame.section = { ...section };
      frame.frameSection = { ...section };
      frame.A = section.A ?? section.area ?? null;
      frame._A = section.A ?? section.area ?? null;
      frame.hasAssignedSection = true;

      frame.assignment = {
        ...(frame.assignment || {}),
        frameSection: {
          id: section.id,
          name: section.name,
        },
      };
    });

    // Si el archivo no trae stories, crear Base por defecto.
    if (!stories.length) {
      stories.push({
        id: 0,
        name: "Base",
        elevation: 0,
      });
    }

    // Calcular storyCount y storyHeight.
    const sortedStories = [...stories].sort((a, b) => Number(a.elevation || 0) - Number(b.elevation || 0));

    const storyCount = Math.max(0, sortedStories.length - 1);

    const storyHeight =
      sortedStories.length > 1 ? Number(sortedStories[1].elevation || 0) - Number(sortedStories[0].elevation || 0) : 3;

    // Si no hay grillas, crear una grilla mínima a partir de nodos.
    if (!xGrids.length) {
      const xs = [...new Set(nodes.map((node) => Number(node.x || 0)))].sort((a, b) => a - b);

      xs.forEach((x, index) => {
        xGrids.push({
          id: String.fromCharCode(65 + index),
          ordinate: x,
          visible: true,
          bubbleLoc: "End",
        });
      });
    }

    if (!yGrids.length) {
      const ys = [...new Set(nodes.map((node) => Number(node.y || 0)))].sort((a, b) => a - b);

      ys.forEach((y, index) => {
        yGrids.push({
          id: String(index + 1),
          ordinate: y,
          visible: true,
          bubbleLoc: "Start",
        });
      });
    }

    return {
      app: "JHACK-ETABS-WEB",
      fileType: "internal-model-json-imported-from-e2k-initial",
      schemaVersion: "1.0.0",
      importedAt: new Date().toISOString(),

      model: {
        referenceGrid: {
          xGrids,
          yGrids,
          generalGrids,
          xPositions: [],
          yPositions: [],
          xLabels: [],
          yLabels: [],
          storyCount,
          storyHeight,
        },

        stories: sortedStories,
        nodes,
        frames,
        beams: frames,
        shapes: frames,
        areas,

        // B10.11 — Store global de cargas Frame / Line Loads
        frameLoadAssignmentsById: clean(frameLoadStore.frameLoadAssignmentsById, {}),
        frameLoadAssignments: clean(frameLoadStore.frameLoadAssignments, []),

        activeViewIndex: 0,
        activeStory: 0,
        currentViewMode: "plan",
        currentStory: "BASE",
        currentElevationX: "none",
        currentElevationZ: "none",

        referencePlanes: [],
        referencePoints: [],
        dimensionLines: [],
      },

      definitions: {
        materials,
        frameSections,
        loadCases: this.loadCases?.cases || [],
        loadCombinations: this.loadCombinations?.combinations || this.loadCombinations?.items || [],
        diaphragms: this.diaphragms?.items || [],
        groups: this.groups?.items || [],
        massSource: this.massSource || null,
      },

      options: {
        displayOptions: this.displayOptions || {},
        designOptions: this.designOptions || {},
        preferences: this.preferences || {},
        outputDecimals: this.outputDecimals || {},
        steelFrameDesign: this.steelFrameDesign || {},
        reinforcementBarSizes: this.reinforcementBarSizes || [],
        dynamicParams: this.dynamicParams || {},
        analysisOptions: this.analysisOptions || null,
        canvasTheme: this.activeCanvasTheme || "dark",
      },

      results: {},
    };
  },

  async importETABS_E2K() {
    try {
      const selected = await this.openTextFileForImport(".e2k,.txt");

      if (!selected) return;

      const data = this.parseInitialE2KText(selected.text);

      const loaded = this.loadFromJSON(data);

      if (!loaded) {
        this.showMessage?.("❌ No se pudo importar el .e2k inicial.", "error");
        return;
      }

      this.currentFileName = selected.file.name.replace(/\.[^/.]+$/, "") + "_importado_desde_e2k.json";

      this.showMessage?.(`📥 Importación .e2k inicial/no oficial completada: ${selected.file.name}`);

      console.log("📥 Import E2K inicial/no oficial:", {
        fileName: selected.file.name,
        nodes: this.nodes?.length || 0,
        frames: this.shapes?.length || 0,
        areas: this.areas?.length || 0,
        stories: this.stories?.length || 0,
        referenceGrid: this.referenceGrid,
      });
    } catch (error) {
      console.error("❌ Error importando E2K inicial:", error);

      this.showMessage?.("❌ Error al importar .e2k inicial/no oficial.", "error");
    }
  },

  showImportPending(formatName) {
    this.showMessage?.(
      `📥 Importar ${formatName} - pendiente. Por ahora está estable JSON interno y .e2k inicial/no oficial.`,
    );
    console.warn(`Import pendiente: ${formatName}`);
  },

  importETABS6() {
    this.showImportPending("ETABS6 Text File");
  },

  importETABS_EDB() {
    this.showImportPending("ETABS .edb. Formato propietario/binario");
  },

  importDXFGrid() {
    this.showImportPending("DXF Architectural Grid");
  },

  importDXFFloorPlan() {
    this.showImportPending("DXF Floor Plan");
  },

  importDXF3D() {
    this.showImportPending("DXF 3D Model");
  },

  importIFC() {
    this.showImportPending("IFC .ifc");
  },

  importIGES() {
    this.showImportPending("IGES .igs");
  },

  importCIS2() {
    this.showImportPending("CIS/2 .stp");
  },

  importRevit() {
    this.showImportPending("Revit Structure .exr");
  },

  importProSteel() {
    this.showImportPending("ProSteel .mdb");
  },

  importFrameworks() {
    this.showImportPending("Frameworks Plus .sfc");
  },

  importSTRUDL() {
    this.showImportPending("STRUDL/STAAD .gti/.std");
  },

  // Export methods
  downloadTextFile(content, filename, mimeType = "text/plain") {
    const blob = new Blob([content], {
      type: `${mimeType};charset=utf-8`,
    });

    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");

    a.href = url;
    a.download = filename;
    a.click();

    URL.revokeObjectURL(url);
  },

  getExportBaseName(defaultName = "modelo_estructura") {
    const rawName = this.currentFileName || defaultName;

    return (
      String(rawName)
        .replace(/\.[^/.]+$/, "")
        .replace(/[^\w\-]+/g, "_")
        .replace(/^_+|_+$/g, "") || defaultName
    );
  },

  formatE2KNumber(value, decimals = 6) {
    const number = Number(value || 0);

    if (!Number.isFinite(number)) {
      return "0";
    }

    return Number(number.toFixed(decimals));
  },

  buildETABS_E2KText() {
    const data = this.exportToJSON?.() || {};
    const model = data.model || data;

    const referenceGrid = model.referenceGrid || this.referenceGrid || {};
    const stories = model.stories || this.stories || [];
    const nodes = model.nodes || data.nodes || [];
    const frames = model.frames || model.beams || data.beams || [];
    const areas = model.areas || data.areas || [];

    const definitions = data.definitions || {};
    const frameSections = definitions.frameSections || data.frameSections || this.frameSections?.sections || [];

    const materials = definitions.materials || data.materials || this.materialProperties?.materials || [];

    const lines = [];

    lines.push("$ ------------------------------------------------------------");
    lines.push("$ JHACK ETABS WEB - E2K TEXT EXPORT");
    lines.push("$ ESTADO: AVANCE INICIAL / NO OFICIAL");
    lines.push("$ Export inicial tipo texto para intercambio/documentación");
    lines.push("$ Este archivo NO es todavía un .e2k oficial completo de ETABS");
    lines.push("$ Sirve como avance de exportación para revisión del cliente");
    lines.push("$ ------------------------------------------------------------");
    lines.push(`$ DATE "${new Date().toISOString()}"`);
    lines.push(`$ UNITS "${this.preferences?.forceUnit || "kN"}" "${this.preferences?.lengthUnit || "m"}"`);
    lines.push("");

    lines.push("$ STORIES");
    stories.forEach((story) => {
      lines.push(
        `STORY "${story.name || `Story_${story.id}`}" ` +
        `ID ${story.id ?? 0} ` +
        `ELEV ${this.formatE2KNumber(story.elevation)}`,
      );
    });
    lines.push("");

    lines.push("$ GRID LINES X");
    (referenceGrid.xGrids || []).forEach((grid) => {
      lines.push(
        `GRIDLINE DIR X ` +
        `ID "${grid.id}" ` +
        `ORD ${this.formatE2KNumber(grid.ordinate)} ` +
        `VISIBLE ${grid.visible !== false ? "YES" : "NO"} ` +
        `BUBBLE "${grid.bubbleLoc || "End"}"`,
      );
    });
    lines.push("");

    lines.push("$ GRID LINES Y");
    (referenceGrid.yGrids || []).forEach((grid) => {
      lines.push(
        `GRIDLINE DIR Y ` +
        `ID "${grid.id}" ` +
        `ORD ${this.formatE2KNumber(grid.ordinate)} ` +
        `VISIBLE ${grid.visible !== false ? "YES" : "NO"} ` +
        `BUBBLE "${grid.bubbleLoc || "Start"}"`,
      );
    });
    lines.push("");

    lines.push("$ GENERAL GRID LINES");
    (referenceGrid.generalGrids || []).forEach((grid) => {
      lines.push(
        `GENERALGRID "${grid.id || grid.label || "GRID"}" ` +
        `X1 ${this.formatE2KNumber(grid.x1)} ` +
        `Y1 ${this.formatE2KNumber(grid.y1)} ` +
        `X2 ${this.formatE2KNumber(grid.x2)} ` +
        `Y2 ${this.formatE2KNumber(grid.y2)} ` +
        `SOURCE "${grid.source || "custom"}" ` +
        `VISIBLE ${grid.visible !== false ? "YES" : "NO"}`,
      );
    });
    lines.push("");

    lines.push("$ MATERIALS");
    materials.forEach((material, index) => {
      const id = material.id || material.name || `MAT_${index + 1}`;
      const name = material.name || material.nombre || id;

      lines.push(
        `MATERIAL "${id}" ` +
        `NAME "${name}" ` +
        `TYPE "${material.type || material.materialType || "Other"}" ` +
        `E ${this.formatE2KNumber(material.E || material.modulusElasticity || 0)}`,
      );
    });
    lines.push("");

    lines.push("$ FRAME SECTIONS");
    frameSections.forEach((section, index) => {
      const id = section.id || section.name || `SEC_${index + 1}`;
      const name = section.name || section.nombre || id;

      lines.push(
        `FRAMESECTION "${id}" ` +
        `NAME "${name}" ` +
        `TYPE "${section.type || "General"}" ` +
        `A ${this.formatE2KNumber(section.A || section.area || 0)}`,
      );
    });
    lines.push("");

    lines.push("$ POINT COORDINATES");
    nodes.forEach((node) => {
      lines.push(
        `POINT "${node.id}" ` +
        `X ${this.formatE2KNumber(node.x ?? node.position?.x)} ` +
        `Y ${this.formatE2KNumber(node.y ?? node.position?.y)} ` +
        `Z ${this.formatE2KNumber(node.z ?? node.position?.z)}`,
      );
    });
    lines.push("");

    lines.push("$ FRAME CONNECTIVITY");
    frames.forEach((frame) => {
      const sectionName =
        frame.sectionName || frame.sectionId || frame.frameSection?.name || frame.section?.name || "NONE";

      lines.push(
        `FRAME "${frame.id}" ` +
        `I "${frame.node1Id ?? frame.node1}" ` +
        `J "${frame.node2Id ?? frame.node2}" ` +
        `TYPE "${frame.elementType || frame.type || "beam"}" ` +
        `SECTION "${sectionName}"`,
      );
    });
    lines.push("");

    lines.push("$ AREA OBJECTS");
    areas.forEach((area) => {
      const points = Array.isArray(area.points)
        ? area.points
          .map(
            (point, index) =>
              `P${index + 1}(${this.formatE2KNumber(point.x)},${this.formatE2KNumber(point.y)},${this.formatE2KNumber(point.z)})`,
          )
          .join(" ")
        : "";

      lines.push(`AREA "${area.id}" ` + `TYPE "${area.areaType || area.type || "area"}" ` + points);
    });
    lines.push("");

    lines.push("$ ASSIGNMENTS - FRAME SECTIONS");
    frames.forEach((frame) => {
      if (!frame.sectionId && !frame.sectionName) return;

      lines.push(`ASSIGN FRAME "${frame.id}" ` + `SECTION "${frame.sectionName || frame.sectionId}"`);
    });
    lines.push("");

    lines.push("$ LOADS - JOINT");
    nodes.forEach((node) => {
      const loads = node.pointLoads || node.jointLoads || [];

      loads.forEach((load) => {
        lines.push(
          `JOINTLOAD POINT "${node.id}" ` +
          `CASE "${load.loadCase || "DEAD"}" ` +
          `TYPE "${load.type || "force"}" ` +
          `DATA ${JSON.stringify(load)}`,
        );
      });
    });
    lines.push("");

    lines.push("$ LOADS - FRAME");
    frames.forEach((frame) => {
      const loads = frame.frameLoads || frame.lineLoads || [];

      loads.forEach((load) => {
        lines.push(
          `FRAMELOAD FRAME "${frame.id}" ` +
          `CASE "${load.loadCase || "DEAD"}" ` +
          `TYPE "${load.type || "distributed"}" ` +
          `DATA ${JSON.stringify(load)}`,
        );
      });
    });
    lines.push("");

    lines.push("$ END OF JHACK ETABS WEB EXPORT");

    return lines.join("\n");
  },

  exportETABS_E2K() {
    try {
      const content = this.buildETABS_E2KText();
      const filename = `${this.getExportBaseName()}_AVANCE_INICIAL_E2K_NO_OFICIAL.e2k`;

      this.downloadTextFile(content, filename, "text/plain");

      this.showMessage?.(`📤 Exportación .e2k inicial/no oficial generada: ${filename}`);
      console.log("📤 Export ETABS E2K:", {
        filename,
        nodes: this.nodes?.length || 0,
        frames: this.shapes?.length || 0,
        areas: this.areas?.length || 0,
      });
    } catch (error) {
      console.error("❌ Error exportando E2K:", error);
      this.showMessage?.("❌ Error al exportar E2K.", "error");
    }
  },

  exportSAFE_V8() {
    this.showMessage?.("📤 Exportar SAFE V8 .f2k - pendiente. Primero dejamos estable E2K.");
    console.warn("Export SAFE V8 pendiente.");
  },

  exportSAFE_V12() {
    this.showMessage?.("📤 Exportar SAFE V12 .f2k - pendiente. Primero dejamos estable E2K.");
    console.warn("Export SAFE V12 pendiente.");
  },

  exportETABS_EDB() {
    this.showMessage?.("📤 Exportar ETABS .edb - no disponible en navegador. Requiere formato binario propietario.");
    console.warn("Export ETABS EDB no implementado: formato binario propietario.");
  },

  exportProSteelMDB() {
    this.showMessage?.("📤 Exportar ProSteel .mdb - pendiente. Requiere estructura de base Access/MDB.");
    console.warn("Export ProSteel MDB pendiente.");
  },

  // Print methods
  createVideo() {
    this.showMessage?.("🎥 Crear Video - pendiente. Primero se completó impresión gráfica.");
  },

  printSetup() {
    this.showMessage?.("🖨️ Configurar Impresión - pendiente. Usando impresión gráfica preliminar.");
  },

  waitForNextFrames(count = 2) {
    return new Promise((resolve) => {
      const step = () => {
        count -= 1;

        if (count <= 0) {
          resolve();
          return;
        }

        requestAnimationFrame(step);
      };

      requestAnimationFrame(step);
    });
  },

  async getCanvasImageForPrint(canvas, options = {}) {
    try {
      if (!canvas) return null;

      if (canvas.width <= 0 || canvas.height <= 0) {
        return null;
      }

      if (options.render3D) {
        const viewer = getViewer3DState?.();

        if (viewer?.scene) {
          viewer.scene.render();
          await this.waitForNextFrames(2);
          viewer.scene.render();
        }
      }

      const image = canvas.toDataURL("image/png");

      if (!image || image === "data:,") {
        return null;
      }

      return image;
    } catch (error) {
      console.warn("No se pudo capturar canvas para impresión:", error);
      return null;
    }
  },

  getPrintModelName() {
    return this.currentFileName || "Modelo sin nombre";
  },

  getPrintActiveViewName() {
    try {
      if (typeof this.getActiveViewLabel === "function") {
        return this.getActiveViewLabel();
      }

      const view = this.viewSet?.[this.activeViewIndex];

      if (view?.name) return view.name;

      return this.currentViewMode || "Vista actual";
    } catch (error) {
      return "Vista actual";
    }
  },

  async buildPrintGraphicsHTML() {
    const canvas2D = this.canvas || document.querySelector("#cad-panel-2d canvas") || document.querySelector("canvas");

    const canvas3D = document.querySelector("#viewer3d-container canvas");

    const image2D = await this.getCanvasImageForPrint(canvas2D);

    const image3D = await this.getCanvasImageForPrint(canvas3D, {
      render3D: true,
    });

    const modelName = this.getPrintModelName();
    const activeViewName = this.getPrintActiveViewName();
    const date = new Date().toLocaleString();

    const nodesCount = this.nodes?.length || 0;
    const framesCount = this.shapes?.length || 0;
    const areasCount = this.areas?.length || 0;
    const storiesCount = this.stories?.length || 0;

    return `
      <!DOCTYPE html>
      <html lang="es">
      <head>
        <meta charset="UTF-8">
        <title>Impresión Gráfica - ${modelName}</title>
        <style>
          * {
            box-sizing: border-box;
          }

          body {
            margin: 0;
            padding: 24px;
            font-family: Arial, Helvetica, sans-serif;
            color: #111827;
            background: #ffffff;
          }

          .print-header {
            border-bottom: 2px solid #1f2937;
            padding-bottom: 12px;
            margin-bottom: 18px;
          }

          .title {
            font-size: 20px;
            font-weight: 700;
            margin: 0;
          }

          .subtitle {
            font-size: 12px;
            color: #4b5563;
            margin-top: 4px;
          }

          .summary {
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: 8px;
            margin: 14px 0 18px;
          }

          .summary-card {
            border: 1px solid #d1d5db;
            border-radius: 6px;
            padding: 8px;
            font-size: 12px;
          }

          .summary-card strong {
            display: block;
            font-size: 14px;
            margin-bottom: 2px;
          }

          .views {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 16px;
          }

          .view-card {
            border: 1px solid #d1d5db;
            border-radius: 8px;
            padding: 10px;
            break-inside: avoid;
          }

          .view-title {
            font-size: 14px;
            font-weight: 700;
            margin-bottom: 8px;
            color: #111827;
          }

          .view-card img {
            width: 100%;
            max-height: 520px;
            object-fit: contain;
            border: 1px solid #e5e7eb;
            background: #f9fafb;
          }

          .empty-capture {
            height: 240px;
            display: flex;
            align-items: center;
            justify-content: center;
            border: 1px dashed #9ca3af;
            color: #6b7280;
            font-size: 12px;
            text-align: center;
            padding: 20px;
          }

          .note {
            margin-top: 18px;
            padding: 10px;
            border-left: 4px solid #f59e0b;
            background: #fffbeb;
            font-size: 12px;
            color: #92400e;
          }

          .footer {
            margin-top: 18px;
            padding-top: 10px;
            border-top: 1px solid #d1d5db;
            font-size: 11px;
            color: #6b7280;
          }

          @media print {
            body {
              padding: 12mm;
            }

            .views {
              grid-template-columns: 1fr 1fr;
            }

            .no-print {
              display: none !important;
            }
          }

          @media (max-width: 900px) {
            .views {
              grid-template-columns: 1fr;
            }

            .summary {
              grid-template-columns: repeat(2, 1fr);
            }
          }
        </style>
      </head>
      <body>
        <div class="print-header">
          <h1 class="title">Impresión Gráfica del Modelo</h1>
          <div class="subtitle">
            Modelo: <strong>${modelName}</strong> |
            Vista activa: <strong>${activeViewName}</strong> |
            Fecha: ${date}
          </div>
        </div>

        <div class="summary">
          <div class="summary-card">
            <strong>${nodesCount}</strong>
            Nodos
          </div>
          <div class="summary-card">
            <strong>${framesCount}</strong>
            Barras / Frames
          </div>
          <div class="summary-card">
            <strong>${areasCount}</strong>
            Áreas
          </div>
          <div class="summary-card">
            <strong>${storiesCount}</strong>
            Niveles
          </div>
        </div>

        <div class="views">
          <div class="view-card">
            <div class="view-title">Vista 2D</div>
            ${image2D
        ? `<img src="${image2D}" alt="Vista 2D">`
        : `<div class="empty-capture">No se pudo capturar la vista 2D.</div>`
      }
          </div>

          <div class="view-card">
            <div class="view-title">Vista 3D</div>
            ${image3D
        ? `<img src="${image3D}" alt="Vista 3D">`
        : `<div class="empty-capture">No se pudo capturar la vista 3D. Si aparece vacío, sincroniza la vista 3D e intenta nuevamente.</div>`
      }
          </div>
        </div>

        <div class="note">
          Estado: impresión gráfica preliminar del sistema web tipo ETABS.
          Esta salida sirve para revisión visual del modelo y no reemplaza todavía un reporte técnico final.
        </div>

        <div class="footer">
          Generado desde JHACK ETABS WEB - File / Print Graphics.
        </div>
      </body>
      </html>
    `;
  },

  async printPreviewGraphics() {
    try {
      this.redraw?.();

      const printWindow = window.open("", "_blank", "width=1200,height=800");

      if (!printWindow) {
        this.showMessage?.("❌ El navegador bloqueó la ventana de impresión.", "error");
        return;
      }

      printWindow.document.open();
      const html = await this.buildPrintGraphicsHTML();
      printWindow.document.write(html);
      printWindow.document.close();

      this.showMessage?.("👁️ Vista previa de impresión generada.");
    } catch (error) {
      console.error("❌ Error generando vista previa de impresión:", error);
      this.showMessage?.("❌ Error generando vista previa de impresión.", "error");
    }
  },

  async printGraphics() {
    try {
      this.redraw?.();

      const printWindow = window.open("", "_blank", "width=1200,height=800");

      if (!printWindow) {
        this.showMessage?.("❌ El navegador bloqueó la ventana de impresión.", "error");
        return;
      }

      const html = await this.buildPrintGraphicsHTML();

      printWindow.document.open();
      printWindow.document.write(html);
      printWindow.document.close();

      printWindow.onload = () => {
        setTimeout(() => {
          printWindow.focus();
          printWindow.print();
        }, 400);
      };

      this.showMessage?.("🖨️ Preparando impresión gráfica...");
    } catch (error) {
      console.error("❌ Error en Print Graphics:", error);
      this.showMessage?.("❌ Error al imprimir gráficos.", "error");
    }
  },

  // ========== MÉTODOS PARA EXPORTAR/IMPORTAR MODELO formato JSON ==========

  _buildFrameLoadStoreForJSON(clean = null) {
    const clone = clean || ((value, fallback = null) => {
      try {
        return JSON.parse(JSON.stringify(value ?? fallback));
      } catch (error) {
        console.warn("No se pudo clonar Frame Load:", value, error);
        return fallback;
      }
    });

    const storeById = {};
    const seen = new Set();

    const pushLoad = (frameId, load) => {
      const id = Number(frameId);

      if (!Number.isFinite(id)) return;
      if (!load || typeof load !== "object") return;

      const cleanLoad = clone(load, {});

      cleanLoad.frameId = id;
      cleanLoad.frame_id = id;

      const key = [
        id,
        cleanLoad.id,
        cleanLoad.type,
        cleanLoad.loadCase,
        cleanLoad.coordinateSystem,
        cleanLoad.loadType,
        cleanLoad.direction,
        cleanLoad.distributionType,
        cleanLoad.distanceType,
        cleanLoad.startRelativeDistance,
        cleanLoad.endRelativeDistance,
        cleanLoad.startAbsoluteDistance,
        cleanLoad.endAbsoluteDistance,
        cleanLoad.startValue,
        cleanLoad.endValue,
        cleanLoad.value,
        cleanLoad.relativeDistance,
      ].join("|");

      if (seen.has(key)) return;

      seen.add(key);

      if (!storeById[String(id)]) {
        storeById[String(id)] = [];
      }

      storeById[String(id)].push(cleanLoad);
    };

    // 1) Fuente principal: store global creado por Assign Frame Loads
    Object.entries(this.frameLoadAssignmentsById || {}).forEach(([frameId, loads]) => {
      (Array.isArray(loads) ? loads : []).forEach((load) => {
        pushLoad(frameId, load);
      });
    });

    // 2) Compatibilidad: lista plana global
    (Array.isArray(this.frameLoadAssignments) ? this.frameLoadAssignments : []).forEach((load) => {
      const frameId = load?.frameId ?? load?.frame_id;
      pushLoad(frameId, load);
    });

    // 3) Compatibilidad: cargas pegadas al objeto frame/beam
    (this.shapes || []).forEach((frame) => {
      const frameId = Number(frame.id);

      const rawLoads = [
        ...(Array.isArray(frame?.frameLoads) ? frame.frameLoads : []),
        ...(Array.isArray(frame?.lineLoads) ? frame.lineLoads : []),
        ...(Array.isArray(frame?.loads) ? frame.loads : []),
        ...(Array.isArray(frame?.distributedLoads) ? frame.distributedLoads : []),
        ...(Array.isArray(frame?.pointLoads) ? frame.pointLoads : []),

        ...(Array.isArray(frame?.assignment?.loads) ? frame.assignment.loads : []),
        ...(Array.isArray(frame?.assignment?.frameLoads) ? frame.assignment.frameLoads : []),
        ...(Array.isArray(frame?.assignment?.lineLoads) ? frame.assignment.lineLoads : []),

        ...(Array.isArray(frame?.assignments?.loads) ? frame.assignments.loads : []),
        ...(Array.isArray(frame?.assignments?.frameLoads) ? frame.assignments.frameLoads : []),
        ...(Array.isArray(frame?.assignments?.lineLoads) ? frame.assignments.lineLoads : []),
      ];

      rawLoads.forEach((load) => {
        pushLoad(frameId, load);
      });
    });

    const flat = Object.entries(storeById).flatMap(([frameId, loads]) => {
      return (loads || []).map((load) => ({
        ...clone(load, {}),
        frameId: Number(frameId),
        frame_id: Number(frameId),
      }));
    });

    return {
      frameLoadAssignmentsById: storeById,
      frameLoadAssignments: flat,
    };
  },

  exportToJSON() {
    const clean = (data, fallback = null) => {
      try {
        return JSON.parse(JSON.stringify(data ?? fallback));
      } catch (error) {
        console.warn("No se pudo serializar dato:", data, error);
        return fallback;
      }
    };

    const nodes = (this.nodes || []).map((node) => ({
      id: node.id,
      x: Number(node.position?.x || 0),
      y: Number(node.position?.y || 0),
      z: Number(node.position?.z || 0),

      visible: node.visible !== false,

      constraints: clean(node.constraints || node.restraints),
      restraints: clean(node.restraints || node.constraints),
      hasRestraints: node.hasRestraints === true,
      soporte: node.soporte || null,

      mass_x: Number(node.mass_x) || 0,
      mass_y: Number(node.mass_y) || 0,
      mass_z: Number(node.mass_z) || 0,
      mass: Number(node.mass_x) || 0,
      massAssignment: clean(node.massAssignment),
      hasMass: node.hasMass === true || (Number(node.mass_x) || 0) > 0 || (Number(node.mass_y) || 0) > 0,

      // B10.12 — Apoyos legacy / tipo soporte
      soporte: node.soporte || null,
      supportType: node.supportType || node.soporte || null,

      diaphragmId: node.diaphragmId || node.diaphragm?.id || null,
      diaphragmName: node.diaphragmName || node.diaphragm?.name || null,
      diaphragm: clean(node.diaphragm),
      hasDiaphragm: node.hasDiaphragm === true,

      pointSprings: clean(node.pointSprings),
      springs: clean(node.springs),
      hasPointSprings: node.hasPointSprings === true,

      // JLF-08 — Joint / Point Loads tipo ETABS
      pointLoads: clean(
        Array.isArray(node.pointLoads) && node.pointLoads.length
          ? node.pointLoads
          : Array.isArray(node.jointLoads) && node.jointLoads.length
            ? node.jointLoads
            : Array.isArray(node.assignment?.pointLoads) && node.assignment.pointLoads.length
              ? node.assignment.pointLoads
              : Array.isArray(node.assignment?.jointLoads)
                ? node.assignment.jointLoads
                : [],
        []
      ),

      jointLoads: clean(
        Array.isArray(node.jointLoads) && node.jointLoads.length
          ? node.jointLoads
          : Array.isArray(node.pointLoads) && node.pointLoads.length
            ? node.pointLoads
            : Array.isArray(node.assignment?.jointLoads) && node.assignment.jointLoads.length
              ? node.assignment.jointLoads
              : Array.isArray(node.assignment?.pointLoads)
                ? node.assignment.pointLoads
                : [],
        []
      ),

      hasPointLoads:
        node.hasPointLoads === true ||
        (Array.isArray(node.pointLoads) && node.pointLoads.length > 0) ||
        (Array.isArray(node.jointLoads) && node.jointLoads.length > 0) ||
        (Array.isArray(node.assignment?.pointLoads) && node.assignment.pointLoads.length > 0) ||
        (Array.isArray(node.assignment?.jointLoads) && node.assignment.jointLoads.length > 0),

      hasJointLoads:
        node.hasJointLoads === true ||
        node.hasPointLoads === true ||
        (Array.isArray(node.pointLoads) && node.pointLoads.length > 0) ||
        (Array.isArray(node.jointLoads) && node.jointLoads.length > 0) ||
        (Array.isArray(node.assignment?.pointLoads) && node.assignment.pointLoads.length > 0) ||
        (Array.isArray(node.assignment?.jointLoads) && node.assignment.jointLoads.length > 0),

      // B3 — Mass / Mass Source
      mass_x: Number(node.mass_x ?? node.massAssignment?.mx ?? node.assignment?.mass?.mx ?? node.mass ?? 0),
      mass_y: Number(node.mass_y ?? node.massAssignment?.my ?? node.assignment?.mass?.my ?? node.mass ?? 0),
      mass_z: Number(node.mass_z ?? node.massAssignment?.mz ?? node.assignment?.mass?.mz ?? 0),

      mass: Number(node.mass ?? node.mass_x ?? node.massAssignment?.mx ?? node.assignment?.mass?.mx ?? 0),

      massAssignment: clean(
        node.massAssignment ||
        node.jointMass ||
        node.assignment?.mass ||
        {
          mx: Number(node.mass_x ?? node.mass ?? 0),
          my: Number(node.mass_y ?? node.mass ?? 0),
          mz: Number(node.mass_z ?? 0),
          rx: Number(node.massAssignment?.rx ?? node.assignment?.mass?.rx ?? 0),
          ry: Number(node.massAssignment?.ry ?? node.assignment?.mass?.ry ?? 0),
          rz: Number(node.massAssignment?.rz ?? node.assignment?.mass?.rz ?? 0),
        },
        null
      ),

      jointMass: clean(node.jointMass || node.massAssignment || node.assignment?.mass, null),
      hasMass: node.hasMass === true || Number(node.mass_x ?? node.mass ?? 0) > 0 || Number(node.mass_y ?? 0) > 0 || Number(node.mass_z ?? 0) > 0,

      groupNames: clean(node.groupNames, []),
      groups: clean(node.groups, []),
      hasGroups: node.hasGroups === true,

      assignment: clean(node.assignment, {}),
      force: clean(node.force),
      reaction: clean(node.reaction),
    }));

    const frames = (this.shapes || []).map((frame) => ({
      id: frame.id,

      node1: frame.node1?.id ?? null,
      node2: frame.node2?.id ?? null,
      node1Id: frame.node1?.id ?? null,
      node2Id: frame.node2?.id ?? null,

      type: frame.type || frame.elementType || "beam",
      elementType: frame.elementType || frame.type || "beam",
      objectType: frame.objectType || "frame",

      visible: frame.visible !== false,

      E: frame.E ?? null,
      A: frame.A ?? null,
      _A: frame._A ?? null,
      material: clean(frame.material),

      section: clean(frame.section || frame.frameSection),
      frameSection: clean(frame.frameSection || frame.section),
      sectionId: frame.sectionId || frame.section?.id || frame.frameSection?.id || null,
      sectionName: frame.sectionName || frame.section?.name || frame.frameSection?.name || null,
      hasAssignedSection: frame.hasAssignedSection === true,

      releases: clean(frame.releases),
      frameReleases: clean(frame.frameReleases),
      hasFrameReleases: frame.hasFrameReleases === true,

      endOffsets: clean(frame.endOffsets),
      frameEndOffsets: clean(frame.frameEndOffsets),
      hasEndOffsets: frame.hasEndOffsets === true,

      frameLoads: clean(frame.frameLoads, []),
      lineLoads: clean(frame.lineLoads, []),
      hasFrameLoads: frame.hasFrameLoads === true,
      hasLineLoads: frame.hasLineLoads === true,

      groupIds: clean(frame.groupIds, []),
      groupNames: clean(frame.groupNames, []),
      groups: clean(frame.groups, []),
      hasGroups: frame.hasGroups === true,

      assignment: clean(frame.assignment, {}),

      fAxial: Number(frame.fAxial || 0),
      axialForce: Number(frame.axialForce || 0),

      designType: frame.designType || null,
      isSteelJoist: frame.isSteelJoist === true,

      designOverwrites: clean(frame.designOverwrites, {}),
      designResults: clean(frame.designResults, {}),

      steelFrameDesignOverwrites: clean(frame.steelFrameDesignOverwrites),
      steelFrameDesignResult: clean(frame.steelFrameDesignResult),

      steelJoistDesignOverwrites: clean(frame.steelJoistDesignOverwrites),
      steelJoistDesignResult: clean(frame.steelJoistDesignResult),
    }));

    const frameLoadStore = this._buildFrameLoadStoreForJSON?.(clean) || {
      frameLoadAssignmentsById: {},
      frameLoadAssignments: [],
    };

    const areas = (this.areas || []).map((area) => ({
      id: area.id ?? null,
      type: area.type || area.areaType || "area",
      areaType: area.areaType || area.type || "area",
      visible: area.visible !== false,

      points: clean(area.points, []),
      z: Number(area.z || 0),

      section: clean(area.section),
      material: clean(area.material),

      loads: clean(area.loads, []),
      areaLoads: clean(area.areaLoads, []),

      groupIds: clean(area.groupIds, []),
      groupNames: clean(area.groupNames, []),
      groups: clean(area.groups, []),

      assignment: clean(area.assignment, {}),
    }));

    const modelData = {
      app: "JHACK-ETABS-WEB",
      fileType: "internal-model-json",
      schemaVersion: "1.0.0",
      version: "1.0",
      savedAt: new Date().toISOString(),
      date: new Date().toISOString(),

      model: {
        referenceGrid: clean(this.referenceGrid, {
          xGrids: [],
          yGrids: [],
          generalGrids: [],
          xPositions: [],
          yPositions: [],
          xLabels: [],
          yLabels: [],
          storyCount: 0,
          storyHeight: 0,
        }),

        stories: clean(this.stories, []),
        viewSet: clean(this.viewSet, []),
        activeViewIndex: Number(this.activeViewIndex || 0),
        activeStory: Number(this.activeStory || 0),
        currentViewMode: this.currentViewMode || "plan",
        currentStory: this.currentStory || "BASE",
        currentElevationX: this.currentElevationX || "none",
        currentElevationZ: this.currentElevationZ || "none",

        referencePlanes: clean(this.referencePlanes, []),
        referencePoints: clean(this.referencePoints, []),
        dimensionLines: clean(this.dimensionLines, []),

        nodes,
        frames,
        beams: frames,
        shapes: frames,
        areas,

        // B10.11 — Compatibilidad raíz
        frameLoadAssignmentsById: clean(frameLoadStore.frameLoadAssignmentsById, {}),
        frameLoadAssignments: clean(frameLoadStore.frameLoadAssignments, []),
      },

      definitions: {
        materials: clean(this.materialProperties?.materials, []),
        materiales: clean(this.materiales, []),

        frameSections: clean(this.frameSections?.sections || this.frameSections?.items || [], []),

        sections: clean(this.sections, {}),

        loadCases: clean(this.loadCases?.cases || this.staticLoadCases?.items || [], []),

        loadCombinations: clean(this.loadCombinations?.combinations || this.loadCombinations?.items || [], []),

        diaphragms: clean(this.diaphragms?.items, []),
        groups: clean(this.groups?.items, []),
        sectionCuts: clean(this.sectionCuts?.items, []),

        // responseSpectrumFunctions: clean(this.responseSpectrumFunctions?.items, []),
        responseSpectrumFunctions: clean(this.responseSpectrumFunctions?.items, []),
        responseSpectrumFunctionsState: clean(this.responseSpectrumFunctions, {
          items: [],
          selectedFunction: null,
        }),
        responseSpectrumCases: clean(this.responseSpectrumCases?.items, []),
        responseSpectrumCasesState: clean(this.responseSpectrumCases, {
          items: [],
          selectedCase: null,
        }),
        timeHistoryFunctions: clean(this.timeHistoryFunctions?.items, []),

        staticLoadCases: clean(this.staticLoadCases?.items, []),
        staticNonlinearCases: clean(this.staticNonlinearCases?.items, []),
        sequentialConstruction: clean(this.sequentialConstruction?.items, []),

        massSource: clean(this.massSource),
        specialSeismicData: clean(this.specialSeismicData),
      },

      options: {
        displayOptions: clean(this.displayOptions, {}),
        designOptions: clean(this.designOptions, {}),
        preferences: clean(this.preferences, {}),
        outputDecimals: clean(this.outputDecimals, {}),
        steelFrameDesign: clean(this.steelFrameDesign, {}),
        reinforcementBarSizes: clean(this.reinforcementBarSizes, []),
        dynamicParams: clean(this.dynamicParams, {}),
        availableLoads: clean(this.availableLoads, []),
        analysisOptions: clean(this.analysisOptions || null),
        // BLOQUE 7T-A
        modalSpectralOptions: clean(this.modalSpectralOptions, this.getDefaultModalSpectralOptions?.() || {}),

        modalSpectralModelCalibration: clean(
          this.modalSpectralModelCalibration,
          this.getDefaultModalSpectralModelCalibration?.() || {},
        ),
        canvasTheme: this.activeCanvasTheme || "dark",
      },

      results: {
        K_Global_Reducido: clean(this.K_Global_Reducido, []),
        Fuerzas_Globales_Reducidas: clean(this.Fuerzas_Globales_Reducidas, []),
        D_Global_Reducido: clean(this.D_Global_Reducido, []),
        deflecciones: clean(this.deflecciones, []),
        desplazamientosPosition: clean(this.desplazamientosPosition, []),
        matrizDesplazamiento: clean(this.matrizDesplazamiento, []),

        analysisResults: clean(this.analysisResults, null),
        modelCheck: clean(this.modelCheck, null),

        modalSpectralAnalysis: clean(this.buildModalSpectralSaveData?.(), null),
      },

      // B-DIAG-20 — Persistencia de diagramas Frame Forces
      frameForceModule: serializeFrameForceModule(this),

      // Compatibilidad con el formato anterior
      nodes,
      beams: frames,
      shapes: frames,
      areas,

      materials: clean(this.materialProperties?.materials, []),
      frameSections: clean(this.frameSections?.sections || this.frameSections?.items || [], []),
      loadCases: clean(this.loadCases?.cases || this.staticLoadCases?.items || [], []),
      loadCombinations: clean(this.loadCombinations?.combinations || this.loadCombinations?.items || [], []),
      diaphragms: clean(this.diaphragms?.items, []),
      groups: clean(this.groups?.items, []),
      massSource: clean(this.massSource),
      dynamicParams: clean(this.dynamicParams),

      responseSpectrumFunctions: clean(this.responseSpectrumFunctions?.items, []),
      responseSpectrumFunctionsState: clean(this.responseSpectrumFunctions, {
        items: [],
        selectedFunction: null,
      }),

      responseSpectrumCases: clean(this.responseSpectrumCases?.items, []),
      responseSpectrumCasesState: clean(this.responseSpectrumCases, {
        items: [],
        selectedCase: null,
      }),

      // BLOQUE 7J
      modalSpectralAnalysis: clean(this.buildModalSpectralSaveData?.(), null),
    };

    console.log("💾 Export JSON completo:", {
      nodes: modelData.model.nodes.length,
      frames: modelData.model.frames.length,
      areas: modelData.model.areas.length,
      stories: modelData.model.stories.length,
      xGrids: modelData.model.referenceGrid?.xGrids?.length || 0,
      yGrids: modelData.model.referenceGrid?.yGrids?.length || 0,
      frameForceModule: Boolean(modelData.frameForceModule?.hasResults),
    });

    return modelData;
  },

  importFromJSON(jsonData) {
    try {
      const data = typeof jsonData === "string" ? JSON.parse(jsonData) : jsonData;

      if (!data || typeof data !== "object") {
        throw new Error("JSON inválido o vacío.");
      }

      const cleanClone = (value, fallback = null) => {
        try {
          return JSON.parse(JSON.stringify(value ?? fallback));
        } catch (error) {
          console.warn("No se pudo clonar dato importado:", value, error);
          return fallback;
        }
      };

      const model = data.model || data;
      const definitions = data.definitions || data;
      const options = data.options || {};
      const results = data.results || {};

      const importedNodes = model.nodes || data.nodes || [];

      const importedFrames =
        model.frames || model.beams || model.shapes || data.frames || data.beams || data.shapes || [];

      const importedAreas = model.areas || data.areas || [];

      console.log("📂 Importando JSON interno:", {
        app: data.app,
        fileType: data.fileType,
        schemaVersion: data.schemaVersion,
        nodes: importedNodes.length,
        frames: importedFrames.length,
        areas: importedAreas.length,
      });

      // ===============================
      // 1. Limpiar modelo actual
      // ===============================
      this.clearAllSelections?.();
      this.clearEditSelectionFlags?.();

      if (this.idleState && typeof this.setState === "function") {
        this.setState(this.idleState);
      }

      this.nodes = [];
      this.shapes = [];
      this.areas = [];

      this.referencePoints = [];
      this.referencePlanes = [];
      this.dimensionLines = [];

      this.parametricModels = [];

      this.selectedObject = null;
      this.activeGridPoint = null;

      this.undoStack = [];
      this.redoStack = [];

      this.editClipboard = null;
      this.editPasteCount = 0;

      // ===============================
      // 2. Restaurar referenceGrid
      // ===============================
      const importedReferenceGrid = model.referenceGrid || data.referenceGrid || null;

      if (importedReferenceGrid) {
        const importedCustomGeneralGrids = Array.isArray(importedReferenceGrid.generalGrids)
          ? importedReferenceGrid.generalGrids.filter((grid) => {
            const source = String(grid.source || "").toLowerCase();
            return source === "custom" || (source !== "x" && source !== "y");
          })
          : [];

        this.referenceGrid = {
          xGrids: cleanClone(importedReferenceGrid.xGrids, []),
          yGrids: cleanClone(importedReferenceGrid.yGrids, []),

          // Primero cargamos solo custom. Luego rebuildGeneralGrids reconstruye X/Y.
          generalGrids: cleanClone(importedCustomGeneralGrids, []),

          xPositions: [],
          yPositions: [],
          xLabels: [],
          yLabels: [],

          storyCount: Number(importedReferenceGrid.storyCount || 0),
          storyHeight: Number(importedReferenceGrid.storyHeight || 0),
        };

        this.rebuildReferenceGridCaches?.();
        this.rebuildGeneralGrids?.();

        // Reasegurar grillas custom si rebuildGeneralGrids no las preservó.
        importedCustomGeneralGrids.forEach((customGrid) => {
          const exists = (this.referenceGrid.generalGrids || []).some((grid) => {
            return (
              String(grid.id || grid.label) === String(customGrid.id || customGrid.label) &&
              Number(grid.x1 || 0) === Number(customGrid.x1 || 0) &&
              Number(grid.y1 || 0) === Number(customGrid.y1 || 0) &&
              Number(grid.x2 || 0) === Number(customGrid.x2 || 0) &&
              Number(grid.y2 || 0) === Number(customGrid.y2 || 0)
            );
          });

          if (!exists) {
            this.referenceGrid.generalGrids.push(cleanClone(customGrid, {}));
          }
        });
      }

      // ===============================
      // 3. Restaurar stories
      // ===============================
      if (Array.isArray(model.stories) && model.stories.length > 0) {
        this.stories = cleanClone(model.stories, []);
      } else {
        const storyCount = Number(this.referenceGrid?.storyCount || 0);
        const storyHeight = Number(this.referenceGrid?.storyHeight || 3);

        this.stories = [
          {
            id: 0,
            name: "Base",
            elevation: 0,
          },
        ];

        for (let i = 1; i <= storyCount; i++) {
          this.stories.push({
            id: i,
            name: `Piso ${i}`,
            elevation: i * storyHeight,
          });
        }
      }

      // ===============================
      // 4. Reconstruir vistas
      // ===============================
      this.rebuildReferenceGridCaches?.();
      this.rebuildViewSetFromReferenceGrid?.();
      this.rebuildElevationListsFromReferenceGrid?.();

      this.activeViewIndex = Number(model.activeViewIndex || 0);
      this.activeStory = Number(model.activeStory || 0);

      this.currentViewMode = model.currentViewMode || "plan";
      this.currentStory = model.currentStory || "BASE";
      this.currentElevationX = model.currentElevationX || "none";
      this.currentElevationZ = model.currentElevationZ || "none";

      // ===============================
      // 5. Restaurar nodos
      // ===============================
      const nodeMap = new Map();

      this.nodes = importedNodes.map((nodeData, index) => {
        const id = Number(nodeData.id || index + 1);

        const x = Number(nodeData.x ?? nodeData.position?.x ?? 0);
        const y = Number(nodeData.y ?? nodeData.position?.y ?? 0);
        const z = Number(nodeData.z ?? nodeData.position?.z ?? 0);

        const newNode = new StructuralNode(
          {
            x,
            y,
          },
          id,
          z,
        );

        newNode.id = id;
        newNode.position.x = x;
        newNode.position.y = y;
        newNode.position.z = z;

        newNode.beams = [];
        newNode.visible = nodeData.visible !== false;

        const importedRestraints = nodeData.restraints || nodeData.constraints || null;

        if (importedRestraints) {
          newNode.restraints = cleanClone(importedRestraints);
          newNode.constraints = cleanClone(importedRestraints);
          newNode.hasRestraints = nodeData.hasRestraints ?? this.jointHasAnyRestraint?.(importedRestraints) ?? true;
        }

        // B10.12 — Restaurar apoyo legacy tipo soporte (soporteUno/Dos/...).
        newNode.soporte = nodeData.soporte || nodeData.supportType || "";

        if (newNode.soporte && !newNode.restraints && !newNode.constraints) {
          const soporteToRestraints = (soporte) => {
            if (soporte === "soporteUno") {
              return { ux: 1, uy: 1, uz: 1, rx: 1, ry: 1, rz: 1 };
            }

            if (soporte === "soporteDos") {
              return { ux: 1, uy: 1, uz: 1, rx: 0, ry: 0, rz: 0 };
            }

            if (soporte === "soporteTres") {
              return { ux: 0, uy: 0, uz: 1, rx: 0, ry: 0, rz: 0 };
            }

            if (soporte === "soporteCuatro") {
              return { ux: 0, uy: 0, uz: 1, rx: 0, ry: 0, rz: 0 };
            }

            return null;
          };

          const restoredRestraints = soporteToRestraints(newNode.soporte);

          if (restoredRestraints) {
            newNode.restraints = restoredRestraints;
            newNode.constraints = cleanClone(restoredRestraints);
            newNode.hasRestraints = true;
          }
        }

        // Masas nodales (sísmicas) — restaurar para que persistan al reabrir.
        newNode.mass_x = Number(nodeData.mass_x ?? nodeData.mass ?? 0) || 0;
        newNode.mass_y = Number(nodeData.mass_y ?? nodeData.mass ?? 0) || 0;
        newNode.mass_z = Number(nodeData.mass_z ?? 0) || 0;
        if (nodeData.massAssignment) {
          newNode.massAssignment = cleanClone(nodeData.massAssignment);
        }
        newNode.hasMass = newNode.mass_x > 0 || newNode.mass_y > 0 || newNode.mass_z > 0;
        const importedDiaphragm =
          nodeData.diaphragm ||
          (nodeData.diaphragmId
            ? {
              id: nodeData.diaphragmId,
              name: nodeData.diaphragmName || nodeData.diaphragmId,
              type: "rigid",
            }
            : null);

        if (importedDiaphragm) {
          newNode.diaphragm = cleanClone(importedDiaphragm);
          newNode.diaphragmId = importedDiaphragm.id || nodeData.diaphragmId || null;
          newNode.diaphragmName = importedDiaphragm.name || nodeData.diaphragmName || null;
          newNode.hasDiaphragm = nodeData.hasDiaphragm ?? true;
        }

        const importedPointSprings = nodeData.pointSprings || nodeData.springs || null;

        if (importedPointSprings) {
          newNode.pointSprings = cleanClone(importedPointSprings);
          newNode.springs = cleanClone(importedPointSprings);
          newNode.hasPointSprings =
            nodeData.hasPointSprings ?? this.jointHasPointSprings?.(importedPointSprings) ?? true;
        }

        // Restaurar Joint / Point Loads tipo ETABS
        const importedPointLoads =
          Array.isArray(nodeData.pointLoads) && nodeData.pointLoads.length
            ? nodeData.pointLoads
            : Array.isArray(nodeData.jointLoads) && nodeData.jointLoads.length
              ? nodeData.jointLoads
              : Array.isArray(nodeData.assignment?.pointLoads) && nodeData.assignment.pointLoads.length
                ? nodeData.assignment.pointLoads
                : Array.isArray(nodeData.assignment?.jointLoads)
                  ? nodeData.assignment.jointLoads
                  : [];

        newNode.pointLoads = cleanClone(importedPointLoads, []);
        newNode.jointLoads = cleanClone(importedPointLoads, []);

        newNode.hasPointLoads =
          nodeData.hasPointLoads === true ||
          nodeData.hasJointLoads === true ||
          newNode.pointLoads.length > 0;

        newNode.hasJointLoads = newNode.hasPointLoads;

        newNode.groupIds = cleanClone(nodeData.groupIds, []);
        newNode.groupNames = cleanClone(nodeData.groupNames, []);
        newNode.groups = cleanClone(nodeData.groups, []);

        if (!newNode.groupIds.length && newNode.groups.length) {
          newNode.groupIds = newNode.groups.map((group) => group.id || group.name);
        }

        if (!newNode.groupNames.length && newNode.groups.length) {
          newNode.groupNames = newNode.groups.map((group) => group.name || group.id);
        }

        newNode.hasGroups = nodeData.hasGroups ?? newNode.groupIds.length > 0;

        newNode.assignment = {
          ...(cleanClone(nodeData.assignment, {}) || {}),
          pointLoads: cleanClone(newNode.pointLoads, []),
          jointLoads: cleanClone(newNode.jointLoads, []),
        };

        // B3 — Restaurar masa nodal
        const importedMass =
          nodeData.massAssignment ||
          nodeData.jointMass ||
          nodeData.assignment?.mass ||
          null;

        const mx = Number(nodeData.mass_x ?? importedMass?.mx ?? nodeData.mass ?? 0);
        const my = Number(nodeData.mass_y ?? importedMass?.my ?? nodeData.mass ?? mx);
        const mz = Number(nodeData.mass_z ?? importedMass?.mz ?? 0);

        const rx = Number(importedMass?.rx ?? 0);
        const ry = Number(importedMass?.ry ?? 0);
        const rz = Number(importedMass?.rz ?? 0);

        newNode.mass_x = Number.isFinite(mx) ? mx : 0;
        newNode.mass_y = Number.isFinite(my) ? my : 0;
        newNode.mass_z = Number.isFinite(mz) ? mz : 0;

        newNode.mass = newNode.mass_x;

        newNode.massAssignment = {
          mx: newNode.mass_x,
          my: newNode.mass_y,
          mz: newNode.mass_z,
          rx: Number.isFinite(rx) ? rx : 0,
          ry: Number.isFinite(ry) ? ry : 0,
          rz: Number.isFinite(rz) ? rz : 0,
        };

        newNode.jointMass = cleanClone(newNode.massAssignment);

        newNode.hasMass =
          nodeData.hasMass === true ||
          newNode.mass_x > 0 ||
          newNode.mass_y > 0 ||
          newNode.mass_z > 0;

        newNode.assignment = {
          ...(newNode.assignment || {}),
          mass: cleanClone(newNode.massAssignment),
        };

        newNode.force = cleanClone(nodeData.force, this.getDefaultNodeForceForImport());

        if (!newNode.force || !newNode.force.loads) {
          newNode.force = this.getDefaultNodeForceForImport();
        }

        newNode.reaction = cleanClone(nodeData.reaction, {
          x: 0,
          y: 0,
          z: 0,
        });

        nodeMap.set(String(id), newNode);

        return newNode;
      });

      this.nextNodeId = Math.max(0, ...this.nodes.map((node) => Number(node.id || 0))) + 1;

      // ===============================
      // 6. Restaurar frames / beams
      // ===============================
      this.shapes = importedFrames
        .map((frameData, index) => {
          const node1Id = frameData.node1Id ?? frameData.node1 ?? frameData.iNode ?? frameData.startNode;

          const node2Id = frameData.node2Id ?? frameData.node2 ?? frameData.jNode ?? frameData.endNode;

          const node1 = nodeMap.get(String(node1Id));
          const node2 = nodeMap.get(String(node2Id));

          if (!node1 || !node2) {
            console.warn("Frame ignorado por nodos no encontrados:", frameData);
            return null;
          }

          const newFrame = new Beam(frameData.E ?? this.globalE, frameData._A ?? frameData.A ?? this.globalA);

          newFrame.id = Number(frameData.id || index + 1);

          newFrame.node1 = node1;
          newFrame.node2 = node2;

          newFrame.E = frameData.E ?? this.globalE;
          newFrame.A = frameData.A ?? null;
          newFrame._A = frameData._A ?? frameData.A ?? this.globalA;

          newFrame.type = frameData.type || frameData.elementType || "beam";
          newFrame.elementType = frameData.elementType || frameData.type || "beam";
          newFrame.objectType = frameData.objectType || "frame";

          newFrame.visible = frameData.visible !== false;

          newFrame.material = cleanClone(frameData.material);

          const importedSection = frameData.frameSection || frameData.section || null;

          if (importedSection) {
            newFrame.section = cleanClone(importedSection);
            newFrame.frameSection = cleanClone(importedSection);

            newFrame.sectionId = frameData.sectionId || importedSection.id || importedSection.name || null;

            newFrame.sectionName = frameData.sectionName || importedSection.name || importedSection.id || null;

            newFrame.A = frameData.A ?? importedSection.A ?? importedSection.area ?? newFrame.A ?? null;

            newFrame._A = frameData._A ?? importedSection.A ?? importedSection.area ?? newFrame._A ?? null;

            newFrame.hasAssignedSection = frameData.hasAssignedSection ?? true;
          } else {
            newFrame.sectionId = frameData.sectionId || null;
            newFrame.sectionName = frameData.sectionName || null;
            newFrame.hasAssignedSection = frameData.hasAssignedSection === true;
          }

          const importedReleases = frameData.releases || frameData.frameReleases || null;

          if (importedReleases) {
            newFrame.releases = cleanClone(importedReleases);
            newFrame.frameReleases = cleanClone(importedReleases);
            newFrame.hasFrameReleases =
              frameData.hasFrameReleases ?? this.frameHasAnyRelease?.(importedReleases) ?? true;
          }

          const importedEndOffsets = frameData.endOffsets || frameData.frameEndOffsets || null;

          if (importedEndOffsets) {
            newFrame.endOffsets = cleanClone(importedEndOffsets);
            newFrame.frameEndOffsets = cleanClone(importedEndOffsets);
            newFrame.hasEndOffsets = frameData.hasEndOffsets ?? this.frameHasEndOffsets?.(importedEndOffsets) ?? true;
          }

          const importedFrameLoads = frameData.frameLoads || frameData.lineLoads || [];

          newFrame.frameLoads = cleanClone(importedFrameLoads, []);
          newFrame.lineLoads = cleanClone(importedFrameLoads, []);
          newFrame.hasFrameLoads = frameData.hasFrameLoads ?? newFrame.frameLoads.length > 0;
          newFrame.hasLineLoads = frameData.hasLineLoads ?? newFrame.lineLoads.length > 0;

          newFrame.groupIds = cleanClone(frameData.groupIds, []);
          newFrame.groupNames = cleanClone(frameData.groupNames, []);
          newFrame.groups = cleanClone(frameData.groups, []);

          if (!newFrame.groupIds.length && newFrame.groups.length) {
            newFrame.groupIds = newFrame.groups.map((group) => group.id || group.name);
          }

          if (!newFrame.groupNames.length && newFrame.groups.length) {
            newFrame.groupNames = newFrame.groups.map((group) => group.name || group.id);
          }

          newFrame.hasGroups = frameData.hasGroups ?? newFrame.groupIds.length > 0;

          newFrame.assignment = cleanClone(frameData.assignment, {});

          newFrame.fAxial = Number(frameData.fAxial || 0);
          newFrame.axialForce = Number(frameData.axialForce || 0);

          newFrame.designType = frameData.designType || null;
          newFrame.isSteelJoist = frameData.isSteelJoist === true;

          newFrame.designOverwrites = cleanClone(frameData.designOverwrites, {});
          newFrame.designResults = cleanClone(frameData.designResults, {});

          newFrame.steelFrameDesignOverwrites = cleanClone(frameData.steelFrameDesignOverwrites);

          newFrame.steelFrameDesignResult = cleanClone(frameData.steelFrameDesignResult);

          newFrame.steelJoistDesignOverwrites = cleanClone(frameData.steelJoistDesignOverwrites);

          newFrame.steelJoistDesignResult = cleanClone(frameData.steelJoistDesignResult);

          if (!node1.beams) node1.beams = [];
          if (!node2.beams) node2.beams = [];

          node1.beams.push(newFrame);
          node2.beams.push(newFrame);

          return newFrame;
        })
        .filter(Boolean);

      this.nextBeamId = Math.max(0, ...this.shapes.map((frame) => Number(frame.id || 0))) + 1;

      // ============================================================
      // B10.11 — Restaurar Frame / Line Loads global store desde JSON
      // ============================================================
      const importedFrameLoadAssignmentsById =
        model.frameLoadAssignmentsById ||
        definitions.frameLoadAssignmentsById ||
        data.frameLoadAssignmentsById ||
        {};

      const importedFrameLoadAssignments =
        model.frameLoadAssignments ||
        definitions.frameLoadAssignments ||
        data.frameLoadAssignments ||
        [];

      this.frameLoadAssignmentsById = {};
      this.frameLoadAssignments = [];

      const pushRestoredFrameLoad = (frameId, load) => {
        const id = Number(frameId);

        if (!Number.isFinite(id)) return;
        if (!load || typeof load !== "object") return;

        const cleanLoad = cleanClone(load, {});

        cleanLoad.frameId = id;
        cleanLoad.frame_id = id;

        const key = [
          id,
          cleanLoad.id,
          cleanLoad.type,
          cleanLoad.loadCase,
          cleanLoad.coordinateSystem,
          cleanLoad.loadType,
          cleanLoad.direction,
          cleanLoad.distributionType,
          cleanLoad.distanceType,
          cleanLoad.startRelativeDistance,
          cleanLoad.endRelativeDistance,
          cleanLoad.startAbsoluteDistance,
          cleanLoad.endAbsoluteDistance,
          cleanLoad.startValue,
          cleanLoad.endValue,
          cleanLoad.value,
          cleanLoad.relativeDistance,
        ].join("|");

        if (!pushRestoredFrameLoad.seen) {
          pushRestoredFrameLoad.seen = new Set();
        }

        if (pushRestoredFrameLoad.seen.has(key)) return;

        pushRestoredFrameLoad.seen.add(key);

        if (!this.frameLoadAssignmentsById[String(id)]) {
          this.frameLoadAssignmentsById[String(id)] = [];
        }

        this.frameLoadAssignmentsById[String(id)].push(cleanLoad);
      };

      // 1) Restaurar desde store por ID
      Object.entries(importedFrameLoadAssignmentsById || {}).forEach(([frameId, loads]) => {
        (Array.isArray(loads) ? loads : []).forEach((load) => {
          pushRestoredFrameLoad(frameId, load);
        });
      });

      // 2) Restaurar desde lista plana
      (Array.isArray(importedFrameLoadAssignments) ? importedFrameLoadAssignments : []).forEach((load) => {
        pushRestoredFrameLoad(load?.frameId ?? load?.frame_id, load);
      });

      // 3) Restaurar desde cargas guardadas dentro de cada frame
      this.shapes.forEach((frame) => {
        const frameId = Number(frame.id);

        const rawLoads = [
          ...(Array.isArray(frame?.frameLoads) ? frame.frameLoads : []),
          ...(Array.isArray(frame?.lineLoads) ? frame.lineLoads : []),
          ...(Array.isArray(frame?.loads) ? frame.loads : []),
          ...(Array.isArray(frame?.distributedLoads) ? frame.distributedLoads : []),
          ...(Array.isArray(frame?.pointLoads) ? frame.pointLoads : []),

          ...(Array.isArray(frame?.assignment?.loads) ? frame.assignment.loads : []),
          ...(Array.isArray(frame?.assignment?.frameLoads) ? frame.assignment.frameLoads : []),
          ...(Array.isArray(frame?.assignment?.lineLoads) ? frame.assignment.lineLoads : []),
        ];

        rawLoads.forEach((load) => {
          pushRestoredFrameLoad(frameId, load);
        });
      });

      // 4) Sincronizar store restaurado de vuelta a cada frame
      const frameMapForLoads = new Map(
        this.shapes.map((frame) => [String(frame.id), frame])
      );

      Object.entries(this.frameLoadAssignmentsById || {}).forEach(([frameId, loads]) => {
        const frame = frameMapForLoads.get(String(frameId));

        if (!frame) return;

        frame.frameLoads = cleanClone(loads, []);
        frame.lineLoads = cleanClone(loads, []);
        frame.hasFrameLoads = frame.frameLoads.length > 0;
        frame.hasLineLoads = frame.lineLoads.length > 0;

        frame.assignment = {
          ...(frame.assignment || {}),
          frameLoads: frame.frameLoads,
          lineLoads: frame.lineLoads,
        };
      });

      this.frameLoadAssignments = Object.entries(this.frameLoadAssignmentsById || {})
        .flatMap(([frameId, loads]) => {
          return (loads || []).map((load) => ({
            ...cleanClone(load, {}),
            frameId: Number(frameId),
            frame_id: Number(frameId),
          }));
        });

      console.log("✅ Frame Loads restaurados desde JSON:", {
        frameLoadAssignmentsById: this.frameLoadAssignmentsById,
        frameLoadAssignments: this.frameLoadAssignments,
      });

      // ===============================
      // 7. Restaurar áreas
      // ===============================
      this.areas = importedAreas.map((areaData, index) => ({
        ...cleanClone(areaData, {}),
        id: areaData.id ?? index + 1,
        type: areaData.type || areaData.areaType || "area",
        areaType: areaData.areaType || areaData.type || "area",
        visible: areaData.visible !== false,
        points: cleanClone(areaData.points, []),
        z: Number(areaData.z || 0),
        assignment: cleanClone(areaData.assignment, {}),
      }));

      // ===============================
      // 8. Restaurar objetos auxiliares
      // ===============================
      this.referencePlanes = cleanClone(model.referencePlanes, []);
      this.referencePoints = cleanClone(model.referencePoints, []);
      this.dimensionLines = cleanClone(model.dimensionLines, []);

      // ===============================
      // 9. Restaurar definiciones
      // ===============================
      if (!this.materialProperties) {
        this.materialProperties = {
          open: false,
          materials: [],
          selectedMaterial: null,
        };
      }

      this.materialProperties.materials = cleanClone(definitions.materials || data.materials, []);

      if (definitions.materiales || data.materiales) {
        this.materiales = cleanClone(definitions.materiales || data.materiales, []);
      }

      if (!this.frameSections) {
        this.frameSections = {
          open: false,
          sections: [],
          selectedSection: null,
        };
      }

      this.frameSections.sections = cleanClone(definitions.frameSections || data.frameSections, []);

      if (definitions.sections || data.sections) {
        this.sections = cleanClone(definitions.sections || data.sections, this.sections || {});
      }

      if (!this.loadCases) {
        this.loadCases = {
          open: false,
          cases: [],
        };
      }

      this.loadCases.cases = cleanClone(definitions.loadCases || data.loadCases, []);

      if (!this.loadCombinations) {
        this.loadCombinations = {};
      }

      const importedLoadCombinations = definitions.loadCombinations || data.loadCombinations || [];

      this.loadCombinations.combinations = cleanClone(importedLoadCombinations, []);

      this.loadCombinations.items = cleanClone(importedLoadCombinations, []);

      if (!this.diaphragms) {
        this.diaphragms = {
          items: [],
          selectedDiaphragm: null,
        };
      }

      this.diaphragms.items = cleanClone(definitions.diaphragms || data.diaphragms, []);

      if (!this.groups) {
        this.groups = {
          items: [],
          selectedGroup: null,
        };
      }

      this.groups.items = cleanClone(definitions.groups || data.groups, []);

      if (!this.sectionCuts) {
        this.sectionCuts = {
          items: [],
          selectedSectionCut: null,
        };
      }

      this.sectionCuts.items = cleanClone(definitions.sectionCuts || data.sectionCuts, []);

      // ===============================
      // RESPONSE SPECTRUM FUNCTIONS
      // ===============================
      if (!this.responseSpectrumFunctions) {
        this.responseSpectrumFunctions = {
          items: [],
          selectedFunction: null,
        };
      }

      const importedResponseSpectrumFunctionsState =
        definitions.responseSpectrumFunctionsState || data.responseSpectrumFunctionsState || null;

      if (importedResponseSpectrumFunctionsState) {
        this.responseSpectrumFunctions = {
          items: cleanClone(importedResponseSpectrumFunctionsState.items, []),
          selectedFunction: importedResponseSpectrumFunctionsState.selectedFunction ?? null,
        };
      } else {
        this.responseSpectrumFunctions.items = cleanClone(
          definitions.responseSpectrumFunctions || data.responseSpectrumFunctions,
          [],
        );

        this.responseSpectrumFunctions.selectedFunction = this.responseSpectrumFunctions.items[0]?.id || null;
      }

      // ===============================
      // RESPONSE SPECTRUM CASES
      // ===============================
      if (!this.responseSpectrumCases) {
        this.responseSpectrumCases = {
          items: [],
          selectedCase: null,
        };
      }

      const importedResponseSpectrumCasesState =
        definitions.responseSpectrumCasesState || data.responseSpectrumCasesState || null;

      if (importedResponseSpectrumCasesState) {
        this.responseSpectrumCases = {
          items: cleanClone(importedResponseSpectrumCasesState.items, []),
          selectedCase: importedResponseSpectrumCasesState.selectedCase ?? null,
        };
      } else {
        this.responseSpectrumCases.items = cleanClone(
          definitions.responseSpectrumCases || data.responseSpectrumCases,
          [],
        );

        this.responseSpectrumCases.selectedCase = this.responseSpectrumCases.items[0]?.id || null;
      }

      this.ensureResponseSpectrumDefinitions?.();

      if (this.timeHistoryFunctions) {
        this.timeHistoryFunctions.items = cleanClone(definitions.timeHistoryFunctions, []);
      }

      if (this.staticLoadCases) {
        this.staticLoadCases.items = cleanClone(definitions.staticLoadCases, []);
      }

      if (this.staticNonlinearCases) {
        this.staticNonlinearCases.items = cleanClone(definitions.staticNonlinearCases, []);
      }

      if (this.sequentialConstruction) {
        this.sequentialConstruction.items = cleanClone(definitions.sequentialConstruction, []);
      }

      if (definitions.massSource || data.massSource) {
        this.massSource = cleanClone(definitions.massSource || data.massSource);
      }

      if (definitions.specialSeismicData) {
        this.specialSeismicData = cleanClone(definitions.specialSeismicData);
      }

      // ===============================
      // 10. Restaurar opciones
      // ===============================
      if (options.displayOptions) {
        this.displayOptions = {
          ...(this.displayOptions || {}),
          ...cleanClone(options.displayOptions, {}),
        };
      }

      this.ensureDisplayOptions?.();

      if (options.designOptions) {
        this.designOptions = {
          ...(this.designOptions || {}),
          ...cleanClone(options.designOptions, {}),
        };
      }

      this.ensureDesignOptions?.();

      if (options.preferences) {
        this.preferences = {
          ...(this.preferences || {}),
          ...cleanClone(options.preferences, {}),
        };

        this.applyDimensionsTolerances?.();
      }

      if (options.outputDecimals) {
        this.outputDecimals = {
          ...(this.outputDecimals || {}),
          ...cleanClone(options.outputDecimals, {}),
        };
      }

      if (options.steelFrameDesign) {
        this.steelFrameDesign = {
          ...(this.steelFrameDesign || {}),
          ...cleanClone(options.steelFrameDesign, {}),
        };
      }

      if (options.reinforcementBarSizes) {
        this.reinforcementBarSizes = cleanClone(options.reinforcementBarSizes, []);
      }

      if (options.dynamicParams || data.dynamicParams) {
        this.dynamicParams = cleanClone(options.dynamicParams || data.dynamicParams, {});
      }

      if (options.analysisOptions || data.analysisOptions) {
        this.analysisOptions = cleanClone(options.analysisOptions || data.analysisOptions);
      }

      // ============================================================
      // BLOQUE 7T-A - Restaurar opciones Modal Spectral desde options
      // ============================================================
      if (
        options.modalSpectralOptions ||
        options.modalSpectralModelCalibration ||
        data.modalSpectralOptions ||
        data.modalSpectralModelCalibration
      ) {
        this.ensureModalSpectralOptions?.({
          modalSpectralOptions:
            options.modalSpectralOptions ||
            data.modalSpectralOptions ||
            {},

          modalSpectralModelCalibration:
            options.modalSpectralModelCalibration ||
            data.modalSpectralModelCalibration ||
            {},
        });
      }

      if (options.availableLoads) {
        this.availableLoads = cleanClone(options.availableLoads, []);
      }

      if (options.canvasTheme && typeof this.setCanvasTheme === "function") {
        this.setCanvasTheme(options.canvasTheme);
      }

      // ===============================
      // 11. Restaurar resultados
      // ===============================
      this.K_Global_Reducido = cleanClone(results.K_Global_Reducido, []);

      this.Fuerzas_Globales_Reducidas = cleanClone(results.Fuerzas_Globales_Reducidas, []);

      this.D_Global_Reducido = cleanClone(results.D_Global_Reducido, []);

      this.deflecciones = cleanClone(results.deflecciones, []);

      this.desplazamientosPosition = cleanClone(results.desplazamientosPosition, []);

      this.matrizDesplazamiento = cleanClone(results.matrizDesplazamiento, []);

      this.analysisResults = cleanClone(results.analysisResults, null);

      // ── Descartar resultados SÍSMICOS guardados que sean PRE-FIX ──────────
      // Un JSON guardado antes del fix de deriva trae `analysisResults.seismic`
      // con derivas viejas (X/Y invertidas) y SIN el marcador `engine_build`.
      // El visor los tomaría por el fallback de `_getEtabsResultsPackage` y
      // mostraría datos viejos aunque el backend recalcule bien. Si faltan los
      // marcadores del fix, se limpian para forzar un re-cálculo fresco; la
      // geometría/definiciones del modelo se conservan intactas.
      const _savedSeismic = this.analysisResults?.seismic?.etabs_results;
      const _seismicIsStale =
        _savedSeismic && !_savedSeismic.summary?.engine_build;
      if (_seismicIsStale) {
        delete this.analysisResults.seismic;
        this.seismicResults = null;
        this.seismicResultsByCase = {};
        this.seismicCaseOrder = [];
        this.seismicActiveCase = null;
        console.warn(
          "⚠️ Resultados sísmicos del JSON son de una versión previa (sin engine_build) → descartados. Re-ejecuta el análisis sísmico para verlos actualizados."
        );
      }

      this.modelCheck = cleanClone(results.modelCheck, null);

      // ============================================================
      // BLOQUE 7J - Restaurar Modal Spectral desde JSON
      // ============================================================
      const importedModalSpectralData =
        data.modalSpectralAnalysis ||
        results.modalSpectralAnalysis ||
        null;

      if (importedModalSpectralData) {
        this.restoreModalSpectralSaveData(importedModalSpectralData);
      } else if (this.analysisResults?.modalSpectral?.raw) {
        this.restoreModalSpectralSaveData({
          version: "7J-legacy-analysisResults",
          status: "loaded_from_analysisResults",
          lastPayload: null,
          lastResult: this.analysisResults.modalSpectral.raw,
          lastTable: this.analysisResults.modalSpectral.table || [],
        });
      }

      // B-DIAG-20 — Restaurar diagramas Frame Forces desde JSON
      restoreFrameForceModule(this, data);

      if (this.analysisOptions && this.modelCheck) {
        this.analysisOptions.lastModelCheck = {
          checkedAt: this.modelCheck.checkedAt || null,
          errors: this.modelCheck.errors || 0,
          warnings: this.modelCheck.warnings || 0,
          info: this.modelCheck.info || 0,
          canRunAnalysis: this.modelCheck.canRunAnalysis === true,
        };
      }

      if (this.analysisResults && this.analysisOptions?.analysisStatus === "completed") {
        if (!this.displayOptions) {
          this.displayOptions = {};
        }

        this.displayOptions.analysisResultsAvailable = true;

        this.displayOptions.lastAnalysisRun = {
          ranAt: this.analysisResults.ranAt || null,
          status: this.analysisResults.status || "completed",
          maxDisplacement: this.analysisResults.summary?.maxDisplacement || 0,
          maxAxial: this.analysisResults.summary?.maxAxial || 0,
        };

        // Al abrir JSON, dejamos los resultados disponibles,
        // pero no activamos deformada ni diagramas automáticamente.
        this.displayOptions.showDeformedShape = false;
        this.displayOptions.showModeShape = false;
        this.displayOptions.showMemberForces = false;

        if (!this.options) {
          this.options = {};
        }

        this.options.showDeflection = false;
        this.options.showFAxiales = false;
        this.options.showFAxialesValues = true;
      }

      // ===============================
      // 12. Ajustar vista 2D
      // ===============================
      if (this.grid?.centerToView && this.referenceGrid?.xPositions?.length && this.referenceGrid?.yPositions?.length) {
        const minX = Math.min(...this.referenceGrid.xPositions);
        const maxX = Math.max(...this.referenceGrid.xPositions);
        const minY = Math.min(...this.referenceGrid.yPositions);
        const maxY = Math.max(...this.referenceGrid.yPositions);

        this.grid.centerToView({
          cminx: minX - 2,
          cminy: minY - 2,
          cmaxx: maxX + 2,
          cmaxy: maxY + 2,
        });
      }

      this.rebuildGroupMemberships?.();

      this.grid3DDrawn = false;
      this.pendingGrid3D = false;

      this.redraw?.();

      // Evita warning WebGL por redibujar mientras Babylon compila/renderiza.
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          this.sync3D?.();
        });
      });

      console.log("✅ JSON importado correctamente:", {
        nodes: this.nodes.length,
        frames: this.shapes.length,
        areas: this.areas.length,
        stories: this.stories.length,
        xGrids: this.referenceGrid?.xGrids?.length || 0,
        yGrids: this.referenceGrid?.yGrids?.length || 0,
        viewSet: this.viewSet?.length || 0,
      });

      return true;
    } catch (error) {
      console.error("❌ Error al importar JSON:", error);
      return false;
    }
  },

  loadFromJSON(jsonData) {
    return this.importFromJSON(jsonData);
  },

  save() {
    this.oldRenderer = this.currentRenderer;
    this.oldOptions = { ...this.options };
    this.oldGrid = {
      ...this.grid,
    };
  },

  restore() {
    this.currentRenderer = this.oldRenderer;
    this.options = { ...this.oldOptions };
    Object.assign(this.grid, this.oldGrid);
  },

  // ------------------------------------------------------------------
  // 8. MÉTODOS DE ANÁLISIS ESTRUCTURAL (Octave y OpenSees)
  // ------------------------------------------------------------------

  /**
   * Envía los datos del modelo actual a Octave para resolver la armadura 3D.
   * @param {Event} event - Evento del formulario.
   */
  calcularFuerzas(event) {
    event.preventDefault();

    this.nodes.forEach((node) => {
      if (!node.force) node.force = { loads: {} };
      if (!node.reaction) node.reaction = { x: 0, y: 0, z: 0 };
    });

    // Si no hay event.target válido, crear un formulario temporal
    let targetForm = event.target;
    if (!targetForm || !(targetForm instanceof HTMLFormElement)) {
      console.warn("⚠️ Evento sin formulario válido, creando formulario temporal...");
      targetForm = document.createElement("form");
    }

    const formData = new FormData(targetForm);

    // ============================================================
    // 1. NODOS: [id, x, y, z] - TODAS las coordenadas 3D
    // ============================================================
    const nodosStr = this.nodes
      .map((node, index) => {
        // IMPORTANTE: Babylon.js usa Y como altura, pero MATLAB usa Z como altura
        // En tu sistema, position.z es la altura (porque en 2D se usaba XY)
        const x = node.position.x;
        const y = node.position.y; // Coordenada Y del plano 2D
        const z = node.position.z || 0; // Altura (elevación)

        return [index + 1, x, y, z].join(",");
      })
      .join(";");

    formData.append("nodos", "[" + nodosStr + "]");

    // ============================================================
    // 2. BARRAS: [id, node_i, node_j]
    // ============================================================
    const barrasStr = this.shapes
      .map((beam, index) => {
        const node1Id = this.nodes.indexOf(beam.node1) + 1;
        const node2Id = this.nodes.indexOf(beam.node2) + 1;
        return [index + 1, node1Id, node2Id].join(",");
      })
      .join(";");

    formData.append("barras", "[" + barrasStr + "]");

    // ============================================================
    // 3. CARGAS: [node_id, fx, fy, fz]
    // ============================================================
    const cargasList = this.nodes
      .map((node, index) => ({ id: index + 1, node: node }))
      .filter(({ node }) => node.tieneCarga())
      .map(({ id, node }) => {
        const fx = node.cargaX ? (typeof node.cargaX === "function" ? node.cargaX() : node.cargaX) : 0;
        const fy = node.cargaY ? (typeof node.cargaY === "function" ? node.cargaY() : node.cargaY) : 0;
        const fz = node.cargaZ ? (typeof node.cargaZ === "function" ? node.cargaZ() : node.cargaZ) : 0;
        return [id, fx, fy, fz].join(",");
      })
      .join(";");

    formData.append("cargas", cargasList.length ? "[" + cargasList + "]" : "[]");

    // ============================================================
    // 4. RESTRICCIONES: [node_id, rx, ry, rz]
    // rx=1: fijo en X, ry=1: fijo en Y, rz=1: fijo en Z
    // ============================================================
    const restringidosStr = this.nodes
      .map((node, index) => {
        let rx = 0,
          ry = 0,
          rz = 0;

        if (node.soporte === "soporteUno") {
          // Completamente fijo
          rx = 1;
          ry = 1;
          rz = 1;
        } else if (node.soporte === "soporteDos") {
          // Fijo solo en Y (deslizador horizontal) + Z
          rx = 0;
          ry = 1;
          rz = 1;
        } else if (node.soporte === "soporteTres") {
          // Fijo solo en X + Z
          rx = 1;
          ry = 0;
          rz = 1;
        } else if (node.soporte === "soporteCuatro") {
          // Solo fijo en Z (rodillo)
          rx = 0;
          ry = 0;
          rz = 1;
        } else {
          // Libre
          rx = 0;
          ry = 0;
          rz = 0;
        }

        return [index + 1, rx, ry, rz].join(",");
      })
      .join(";");

    formData.append("restringidos", "[" + restringidosStr + "]");

    // ============================================================
    // 5. PROPIEDADES: [area, E_modulo] para cada barra
    // ============================================================
    const propiedadesStr = this.shapes
      .map((beam) => {
        const area = beam.A || beam.area || 0.01;
        const E = beam.E || beam.modulusElasticity || 210e9;
        return [area, E].join(",");
      })
      .join(";");

    formData.append("propiedades", "[" + propiedadesStr + "]");

    console.log("📤 DATOS ENVIADOS (3D):");
    console.log("  Nodos:", nodosStr);
    console.log("  Barras:", barrasStr);
    console.log("  Cargas:", cargasList);
    console.log("  Restringidos:", restringidosStr);
    console.log("  Propiedades:", propiedadesStr);

    const swalTailwind = Swal.mixin({
      customClass: {
        confirmButton:
          "bg-blue-500 hover:bg-blue-400 text-white font-bold py-2 px-4 border-b-4 border-blue-700 hover:border-blue-500 rounded",
      },
      buttonsStyling: false,
    });

    const waitingPopup = swalTailwind.fire({
      title: "Calculando en 3D!",
      html: "Por favor espere...<br>",
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      },
    });

    fetch("/calcularFuerzasArmaduras", {
      method: "POST",
      body: formData,
    })
      .then(async (response) => {
        const contentType = response.headers.get("Content-Type");
        if (contentType && contentType.includes("application/octet-stream")) {
          return response.arrayBuffer();
        } else {
          const error = await response.text();
          return Promise.reject(error);
        }
      })
      .then((matData) => {
        waitingPopup.hideLoading();
        const fuerzas = readmat(matData);
        console.log("📊 RESULTADOS RECIBIDOS:", fuerzas);

        const dataObject = fuerzas.data;

        // ============================================================
        // PROCESAR DESPLAZAMIENTOS (3D)
        // ============================================================
        if (dataObject.MatrizDesplazamiento) {
          this.matrizDesplazamiento = dataObject.MatrizDesplazamiento;
          console.log("📏 Desplazamientos 3D:", this.matrizDesplazamiento);

          // === VALIDACIÓN DE ESTABILIDAD ===
          let maxDisp = 0;
          let invalid = false;
          for (let i = 0; i < this.matrizDesplazamiento.length; i++) {
            const d = this.matrizDesplazamiento[i];
            for (let j = 0; j < 3; j++) {
              const val = d[j];
              if (isNaN(val) || !isFinite(val)) {
                invalid = true;
                break;
              }
              if (Math.abs(val) > maxDisp) maxDisp = Math.abs(val);
            }
            if (invalid) break;
          }

          // Umbral: si el desplazamiento máximo > 1e6 metros (1000 km), asumimos inestabilidad
          if (invalid || maxDisp > 1e6) {
            console.error("Estructura inestable: desplazamiento máximo =", maxDisp);
            Swal.fire({
              icon: "error",
              title: "Estructura inestable",
              html: `Los desplazamientos calculados son anormalmente grandes (${maxDisp.toExponential(2)} m).<br>
                   Esto indica que la estructura es un <strong>mecanismo</strong> (no es rígida).<br><br>
                   <b>Sugerencias:</b><br>
                   • Añada diagonales para rigidizar la estructura.<br>
                   • Verifique que todos los nodos tengan conexiones suficientes.<br>
                   • Revise los apoyos (debe haber al menos 6 restricciones independientes en 3D).`,
              confirmButtonText: "OK",
            });
            return; // Detener el procesamiento
          }
          // Fin validación

          // ✅ Siempre actualizar las posiciones originales con los nodos actuales
          this._originalPositions3D = this.nodes.map((node) => ({
            x: node.position.x,
            y: node.position.y,
            z: node.position.z || 0,
          }));

          this.calcularDeflecciones3D();
        }

        // ============================================================
        // PROCESAR FUERZAS AXIALES
        // ============================================================
        if (dataObject.resultados && dataObject.resultados.lines) {
          Object.values(dataObject.resultados.lines).forEach((line, idx) => {
            const fuerza = Array.isArray(line.fuerza) ? line.fuerza[0] : line.fuerza;
            const beam = this.shapes[idx];
            if (beam) {
              beam.fAxial = fuerza;

              // Asegurar que beam.style exista
              if (!beam.style) {
                beam.style = {
                  normal: () => { },
                  compresion: () => { },
                  traccion: () => { },
                  default: () => { },
                };
              }

              if (Math.abs(fuerza) < 0.001) {
                beam.style.normal();
              } else if (fuerza < 0) {
                beam.style.compresion();
              } else {
                beam.style.traccion();
              }
            }
          });
        }

        // ============================================================
        // PROCESAR REACCIONES
        // ============================================================
        if (dataObject.Reacciones) {
          this.nodes.forEach((n, idx) => {
            n.reaction = {
              x: dataObject.Reacciones[3 * idx] || 0,
              y: dataObject.Reacciones[3 * idx + 1] || 0,
              z: dataObject.Reacciones[3 * idx + 2] || 0,
            };
          });
        }

        this.K_Global_Reducido = dataObject.K_Global_Reducido;
        this.Fuerzas_Globales_Reducidas = dataObject.Fuerzas_Globales_Reducidas;
        this.D_Global_Reducido = dataObject.D_Global_Reducido;

        // ============================================================
        // AJUSTAR ESCALA DE DEFORMACIÓN
        // ============================================================
        if (this.matrizDesplazamiento && this.matrizDesplazamiento.length > 0) {
          let maxDisp = 0;
          for (let i = 0; i < this.matrizDesplazamiento.length; i++) {
            const dx = Math.abs(this.matrizDesplazamiento[i][0] || 0);
            const dy = Math.abs(this.matrizDesplazamiento[i][1] || 0);
            const dz = Math.abs(this.matrizDesplazamiento[i][2] || 0);
            maxDisp = Math.max(maxDisp, dx, dy, dz);
          }

          if (maxDisp > 0 && maxDisp < 0.1) {
            this.options.deflectionScale = Math.min(500, Math.max(50, 0.05 / maxDisp));
            console.log(`🎨 Escala de deformación ajustada a: ${this.options.deflectionScale}x`);
          }
        }

        this.options.showDeflection = true;

        // Forzar redibujado completo de la deformada
        if (this.options.showDeflection && this.desplazamientosPosition) {
          console.log("🎨 Actualizando vista 3D con deformada (escala " + this.options.deflectionScale + "x)");
          this.sync3D(); // esto llamará a drawIn3D nuevamente
        }

        // Sincronizar con vista 3D
        this.sync3D();
        this.redraw();

        // Después de todo el procesamiento, actualizar el estado global del análisis
        this.analysisOptions.analysisStatus = "completed";
        this.analysisOptions.completedAt = new Date().toISOString();

        // Crear un objeto de resultados resumido
        this.analysisResults = {
          status: "completed",
          ranAt: this.analysisOptions.completedAt,
          summary: {
            nodes: this.nodes.length,
            frames: this.shapes.length,
            loads: this.nodes.filter((n) => n.tieneCarga?.()).length,
            maxDisplacement: this.getMaxDisplacement ? this.getMaxDisplacement() : 0,
            maxAxial: Math.max(...this.shapes.map((s) => Math.abs(s.fAxial || 0))),
          },
        };

        if (!this.displayOptions) this.displayOptions = {};
        this.displayOptions.analysisResultsAvailable = true;
        this.displayOptions.lastAnalysisRun = {
          ranAt: this.analysisOptions.completedAt,
          status: "completed",
          maxDisplacement: this.analysisResults.summary.maxDisplacement,
          maxAxial: this.analysisResults.summary.maxAxial,
        };

        swalTailwind.fire({
          icon: "success",
          title: "¡Cálculo 3D completado!",
          html: `Desplazamiento máximo: ${this.getMaxDisplacement().toFixed(4)} m`,
          timer: 3000,
          showConfirmButton: false,
        });
      })
      .catch((error) => {
        console.error("❌ Error en cálculo 3D:", error);
        waitingPopup.hideLoading();
        swalTailwind.fire({
          icon: "error",
          title: "Error en el cálculo 3D",
          html: error,
          showConfirmButton: true,
        });
      });
  },

  // Metodo que calcula la deflexion en 2D
  // calcularFuerzas(event) {
  //   event.preventDefault();
  //   const formData = new FormData(event.target);
  //   formData.append(
  //     "nodos",
  //     "[" +
  //       this.nodes
  //         .map((node, index) => {
  //           const z = node.position.z || 0; // Si no hay coordenada z, se asume 0
  //           return [index + 1, node.position.x, node.position.y, z].join(",");
  //         })
  //         .join(";") +
  //       "]",
  //   );
  //   formData.append(
  //     "barras",
  //     "[" +
  //       this.shapes
  //         .map((beam, index) => {
  //           return [index + 1, this.nodes.indexOf(beam.node1) + 1, this.nodes.indexOf(beam.node2) + 1].join(",");
  //         })
  //         .join(";") +
  //       "]",
  //   );
  //   formData.append(
  //     "cargas",
  //     "[" +
  //       this.nodes
  //         .map((node, index) => {
  //           return { id: index + 1, node: node };
  //         })
  //         .filter(({ node: node }) => {
  //           return node.tieneCarga();
  //         })
  //         .map((value) => {
  //           return [value.id, value.node.cargaX(), value.node.cargaY(), 0].join(",");
  //         })
  //         .join(";") +
  //       "]",
  //   );
  //   formData.append(
  //     "restringidos",
  //     "[" +
  //       this.nodes
  //         .map((node, index) => {
  //           return { id: index + 1, node: node };
  //         })
  //         .map((value) => {
  //           let restriccion = [0, 0, 1];
  //           if (value.node.soporte === "soporteUno") {
  //             restriccion = [1, 1, 1];
  //           } else if (value.node.soporte === "soporteDos") {
  //             restriccion = [0, 1, 1];
  //           } else if (value.node.soporte === "soporteTres") {
  //             restriccion = [1, 0, 1];
  //           }
  //           return [value.id, ...restriccion];
  //         })
  //         .join(";") +
  //       "]",
  //   );
  //   formData.append(
  //     "propiedades",
  //     "[" +
  //       this.shapes
  //         .map((beam) => {
  //           return [beam.A, beam.E].join(",");
  //         })
  //         .join(";") +
  //       "]",
  //   );
  //   console.log(Object.fromEntries(formData));

  //   const swalTailwind = Swal.mixin({
  //     customClass: {
  //       confirmButton:
  //         "bg-blue-500 hover:bg-blue-400 text-white font-bold py-2 px-4 border-b-4 border-blue-700 hover:border-blue-500 rounded",
  //     },
  //     buttonsStyling: false,
  //   });
  //   const waitingPopup = swalTailwind.fire({
  //     title: "Calculando!",
  //     html: "Por favor espere!<br>",
  //     allowOutsideClick: false,
  //     didOpen: () => {
  //       Swal.showLoading();
  //     },
  //   });
  //   fetch("/calcularFuerzasArmaduras3d", {
  //     method: "POST",
  //     body: formData,
  //   })
  //     .then(async (response) => {
  //       const contentType = response.headers.get("Content-Type");
  //       if (contentType && contentType.includes("application/octet-stream")) {
  //         return response.arrayBuffer();
  //       } else {
  //         const error = await response.text();
  //         return Promise.reject(error);
  //       }
  //     })
  //     .then((matData) => {
  //       waitingPopup.hideLoading();
  //       const fuerzas = readmat(matData);
  //       console.log(fuerzas);
  //       const dataObject = fuerzas.data;
  //       this.matrizDesplazamiento = dataObject.MatrizDesplazamiento;
  //       this.calcularDeflecciones();
  //       Object.values(dataObject.resultados.lines).forEach(({ coords: _, fuerza: [f] }, index) => {
  //         this.shapes[index].fAxial = f;
  //         if (Math.abs(f) < 0.001) {
  //           this.shapes[index].style.normal();
  //         } else if (f < 0) {
  //           this.shapes[index].style.compresion();
  //         } else {
  //           this.shapes[index].style.traccion();
  //         }
  //       });
  //       this.nodes.forEach((n, index) => {
  //         const rX = dataObject.Reacciones[3 * index];
  //         const rY = dataObject.Reacciones[3 * index + 1];
  //         dataObject.Reacciones[3 * index + 2];
  //         n.reaction.x = Math.abs(rX) < 1.0e-8 ? 0 : rX;
  //         n.reaction.y = Math.abs(rY) < 1.0e-8 ? 0 : rY;
  //       });
  //       this.K_Global_Reducido = fuerzas.data.K_Global_Reducido;
  //       this.Fuerzas_Globales_Reducidas = fuerzas.data.Fuerzas_Globales_Reducidas;
  //       this.D_Global_Reducido = fuerzas.data.D_Global_Reducido;
  //       this.sync3D(); // ← AGREGAR
  //     })
  //     .catch((error) => {
  //       console.log(error);
  //       waitingPopup.hideLoading();
  //       swalTailwind.fire({
  //         icon: "error",
  //         html: `
  //           ${error}
  //         `,
  //         showConfirmButton: true,
  //       });
  //     });
  // },

  /**
   * Calcula las posiciones deformadas para la vista 3D (X, Y, Z) usando la escala actual.
   * Almacena en this.desplazamientosPosition y también actualiza this.deflecciones.
   */
  calcularDeflecciones3D() {
    if (!this.matrizDesplazamiento || !this.nodes) return;

    // Inicializar posiciones originales si no existen
    if (!this._originalPositions3D) {
      this._originalPositions3D = this.nodes.map((node) => ({
        x: node.position.x,
        y: node.position.y,
        z: node.position.z || 0,
      }));
    }

    const scale = this.options.deflectionScale || 1;
    this.desplazamientosPosition = this.matrizDesplazamiento
      .map((disp, index) => {
        const orig = this._originalPositions3D[index];
        if (!orig) return null;
        const dx = disp[0] || 0;
        const dy = disp[1] || 0;
        const dz = disp[2] || 0;
        // Evitar NaN
        if (isNaN(dx) || isNaN(dy) || isNaN(dz)) return null;
        return {
          x: orig.x + dx * scale,
          y: orig.y + dy * scale,
          z: orig.z + dz * scale,
        };
      })
      .filter((p) => p !== null);

    // Calcular deflecciones para cada barra usando las posiciones deformadas
    // Si alguna posición deformada no es válida, se usará la posición original del nodo
    this.deflecciones = this.shapes.map((b) => {
      const idx1 = this.nodes.indexOf(b.node1);
      const idx2 = this.nodes.indexOf(b.node2);
      if (idx1 >= 0 && idx2 >= 0 && this.desplazamientosPosition) {
        const p1 = this.desplazamientosPosition[idx1];
        const p2 = this.desplazamientosPosition[idx2];
        return {
          x: [p1.x, p2.x],
          y: [p1.y, p2.y],
          z: [p1.z, p2.z],
        };
      }
      return { x: [0, 0], y: [0, 0], z: [0, 0] };
    });
    // Si algún nodo no tiene desplazamiento válido, usar posición original
    if (this.desplazamientosPosition.length !== this.nodes.length) {
      console.warn("Algunos nodos no tienen desplazamiento válido, usando originales");
      this.desplazamientosPosition = this.nodes.map((node, i) => {
        return (
          this.desplazamientosPosition[i] || {
            x: node.position.x,
            y: node.position.y,
            z: node.position.z || 0,
          }
        );
      });
    }
  },

  /**
   * Calcula las posiciones deformadas para la vista 2D (solo X e Y).
   * Actualiza this.desplazamientosPosition y this.deflecciones.
   */
  calcularDeflecciones() {
    this.desplazamientosPosition = this.matrizDesplazamiento.map(([x, y, _], index) => {
      return {
        x: x * this.options.deflectionScale + this.nodes[index].position.x,
        y: y * this.options.deflectionScale + this.nodes[index].position.y,
      };
    });
    this.deflecciones = this.shapes.map((b) => {
      return {
        x: [this.desplazamientosPosition[b.node1.id - 1].x, this.desplazamientosPosition[b.node2.id - 1].x],
        y: [this.desplazamientosPosition[b.node1.id - 1].y, this.desplazamientosPosition[b.node2.id - 1].y],
      };
    });
  },

  /**
   * Actualiza la escala de deformación cuando el usuario mueve el slider.
   * Recalcula posiciones deformadas y refresca ambas vistas.
   */
  updateDeflectionScale() {
    if (this.isBabylonAnimating()) return; // No interferir con animación
    if (this.matrizDesplazamiento) {
      // console.log("Escala:", this.options.deflectionScale);
      // this.calcularDeflecciones(); // actualiza this.desplazamientosPosition
      // console.log("desplazamientosPosition (2D):", this.desplazamientosPosition);
      this.calcularDeflecciones3D(); // actualiza this.desplazamientosPosition
      // console.log("desplazamientosPosition (3D):", this.desplazamientosPosition);

      // && viewer.elements.length > 0
      const viewer = getViewer3DState();
      if (viewer?.initialized && viewer?.scene) {
        // drawIn3D(this, true); // true = solo actualizar posiciones
        this.updateNodePositionsOnly();
      } else {
        this.sync3D(); // modo completo
      }

      this.redraw(); // (opcional) refresca la vista 2D
    }
  },

  // Alterna la visualización de la deformada en ambas vistas
  showDeflections() {
    this.options.showDeflection = !this.options.showDeflection;
    this.sync3D();
    this.redraw();
  },

  /**
   * Obtiene el desplazamiento máximo (norma) de todos los nodos.
   * @returns {number} Desplazamiento máximo en metros.
   */
  getMaxDisplacement() {
    if (!this.matrizDesplazamiento) return 0;

    let maxDisp = 0;
    for (let i = 0; i < this.matrizDesplazamiento.length; i++) {
      const dx = Math.abs(this.matrizDesplazamiento[i][0] || 0);
      const dy = Math.abs(this.matrizDesplazamiento[i][1] || 0);
      const dz = Math.abs(this.matrizDesplazamiento[i][2] || 0);
      const total = Math.sqrt(dx * dx + dy * dy + dz * dz);
      maxDisp = Math.max(maxDisp, total);
    }
    return maxDisp;
  },

  // ========== NUEVAS FUNCIONES PARA OPENSEES ==========

  // Función principal que reemplazará a calcularFuerzas cuando esté listo
  async calcularFuerzasOpenSees(event) {
    if (event) event.preventDefault();

    const swalTailwind = Swal.mixin({
      customClass: {
        confirmButton: "bg-blue-500 hover:bg-blue-400 text-white font-bold py-2 px-4 rounded",
      },
      buttonsStyling: false,
    });

    const waitingPopup = swalTailwind.fire({
      title: "Calculando con OpenSees!",
      html: "Por favor espere!<br>",
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      },
    });

    try {
      // Primero, verificar si OpenSeesPy está disponible
      const statusResponse = await fetch("/api/opensees/status");
      const status = await statusResponse.json();

      let results;

      if (status.status === "online") {
        // Usar OpenSeesPy
        results = await this.analyzeWithOpenSees();
      } else {
        // Fallback a Octave
        console.log("OpenSees no disponible, usando Octave...");
        waitingPopup.hideLoading();
        return this.calcularFuerzas(event);
      }

      waitingPopup.hideLoading();

      if (results.success) {
        this.processOpenSeesResults(results);
        swalTailwind.fire({
          icon: "success",
          title: "¡Cálculo completado!",
          html: "Los resultados se han actualizado correctamente.",
          timer: 2000,
          showConfirmButton: false,
        });
      } else {
        throw new Error(results.error || "Error en el cálculo");
      }
    } catch (error) {
      waitingPopup.hideLoading();
      console.error("Error:", error);
      swalTailwind
        .fire({
          icon: "error",
          title: "Error",
          html: error.message || "Hubo un problema al calcular las fuerzas. Usando Octave...",
          showConfirmButton: true,
        })
        .then(() => {
          // Fallback a Octave
          this.calcularFuerzas(event);
        });
    }
  },

  // Versión híbrida que intenta OpenSees primero y fallback a Octave
  async calcularFuerzasHybrid(event) {
    if (event) event.preventDefault();

    const swalTailwind = Swal.mixin({
      customClass: {
        confirmButton: "bg-blue-500 hover:bg-blue-400 text-white font-bold py-2 px-4 rounded",
      },
      buttonsStyling: false,
    });

    const waitingPopup = swalTailwind.fire({
      title: "Calculando!",
      html: "Por favor espere!<br>",
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      },
    });

    try {
      // Intentar llamar a OpenSees directamente
      const results = await this.analyzeWithOpenSees();
      waitingPopup.hideLoading();

      if (results && results.success) {
        this.processOpenSeesResults(results);
        swalTailwind.fire({
          icon: "success",
          title: "¡Cálculo completado!",
          html: "Resultados de OpenSeesPy",
          timer: 2000,
          showConfirmButton: false,
        });
        return;
      } else if (results && results.error) {
        throw new Error(results.error);
      } else {
        throw new Error("Respuesta inválida del servidor");
      }
    } catch (error) {
      waitingPopup.hideLoading();
      console.error("Error en OpenSees:", error);

      // Fallback a Octave
      console.log("Usando Octave como fallback...");
      this.calcularFuerzas(event);
    }
  },

  async analyzeWithOpenSees() {
    // ============================================================
    // 1. CAPTURAR DATOS DE TU INTERFAZ
    // ============================================================

    // Nodos: posición (x, y) de cada nodo
    const nodes = this.nodes.map((node, index) => ({
      id: index + 1,
      x: node.position.x,
      y: node.position.y,
    }));

    // Elementos: conexiones entre nodos
    const elements = this.shapes.map((beam, index) => ({
      id: index + 1,
      node_i: beam.node1.id,
      node_j: beam.node2.id,
      area: beam.A || 0.01, // Área de la sección
      E: beam.E || 200e9, // Módulo de elasticidad
    }));

    // Apoyos: restricciones (1=fijo, 0=libre)
    const supports = this.nodes.map((node, index) => ({
      node: index + 1,
      ux: node.soporte === "soporteUno" || node.soporte === "soporteTres" ? 1 : 0,
      uy: node.soporte !== "" ? 1 : 0,
    }));

    // Cargas: fuerzas aplicadas
    const loads = this.nodes.map((node, index) => ({
      node: index + 1,
      fx: node.cargaX(),
      fy: node.cargaY(),
    }));

    // ============================================================
    // 2. MOSTRAR EN CONSOLA PARA DEPURAR
    // ============================================================
    console.log("📤 DATOS ENVIADOS A OPENSEES:");
    console.log("   Nodos:", nodes);
    console.log("   Elementos:", elements);
    console.log("   Apoyos:", supports);
    console.log("   Cargas:", loads);

    // ============================================================
    // 3. ENVIAR AL SERVIDOR PYTHON
    // ============================================================
    const response = await fetch("http://localhost:5001/api/analyze", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        nodes: nodes,
        elements: elements,
        supports: supports,
        loads: loads,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Error HTTP ${response.status}: ${errorText}`);
    }

    const results = await response.json();
    console.log("📥 RESULTADOS RECIBIDOS:", results);

    return results;
  },

  // Procesar resultados de OpenSees
  processOpenSeesResults(results) {
    // Procesar fuerzas axiales
    Object.entries(results.forces).forEach(([id, axialForce]) => {
      const beamIndex = parseInt(id) - 1;
      if (this.shapes[beamIndex]) {
        this.shapes[beamIndex].fAxial = axialForce;
        if (Math.abs(axialForce) < 0.001) {
          this.shapes[beamIndex].style.normal();
        } else if (axialForce < 0) {
          this.shapes[beamIndex].style.compresion();
        } else {
          this.shapes[beamIndex].style.traccion();
        }
      }
    });

    // Procesar desplazamientos
    this.matrizDesplazamiento = Object.values(results.displacements).map((d) => [d.dx, d.dy, 0]);
    this.calcularDeflecciones();

    // Procesar reacciones
    Object.entries(results.reactions).forEach(([id, reaction]) => {
      const nodeIndex = parseInt(id) - 1;
      if (this.nodes[nodeIndex]) {
        this.nodes[nodeIndex].reaction.x = reaction.rx;
        this.nodes[nodeIndex].reaction.y = reaction.ry;
      }
    });

    // Sincronizar vista 3D
    this.sync3D();

    if (results.displacements) {
      // Aplicar desplazamientos a la visualización 3D
      this.applyDeformationsTo3D(results.displacements);
    }

    console.log("✅ Resultados de OpenSees procesados:", results);
  },

  // Después de runOpenSeesAnalysis(), agrega:
  applyDeformationsTo3D(displacements, scale = 100) {
    if (!window.babylonScene || !this.nodes) return;

    console.log("🎨 Aplicando deformaciones a vista 3D...");

    // Guardar posiciones originales si no existen
    if (!this._originalPositions) {
      this._originalPositions = this.nodes.map((node) => ({
        x: node.position.x,
        y: node.position.y,
        z: node.position.z || 0,
      }));
    }

    // Aplicar desplazamientos escalados
    this.nodes.forEach((node, i) => {
      const nodeId = node.id;
      const disp = displacements[nodeId];

      if (disp) {
        // Posición original
        const orig = this._originalPositions[i];

        // Nueva posición = original + desplazamiento * escala
        node.position.x = orig.x + (disp.dx || 0) * scale;
        node.position.y = orig.y + (disp.dy || 0) * scale;
        node.position.z = (orig.z || 0) + (disp.dz || 0) * scale;
      }
    });

    // Redibujar la escena 3D
    this.drawIn3D();

    console.log("✅ Deformaciones aplicadas (escala: " + scale + "x)");
  },

  async analyze3DWithOpenSees() {
    // ============================================================
    // 1. CAPTURAR DATOS 3D DE TU INTERFAZ
    // ============================================================

    const nodes = this.nodes.map((node, index) => ({
      id: index + 1,
      x: node.position.x,
      y: node.position.y,
      z: node.position.z || 0, // ← Coordenada Z (altura)
    }));

    const elements = this.shapes.map((beam, index) => ({
      id: index + 1,
      node_i: beam.node1.id,
      node_j: beam.node2.id,
      area: beam.A || 0.01,
      E: beam.E || 200e9,
      Iz: 0.0001, // Momento de inercia Z
      Iy: 0.0001, // Momento de inercia Y
      J: 1e-6, // Constante de torsión
    }));

    const supports = this.nodes.map((node, index) => ({
      node: index + 1,
      ux: node.soporte === "soporteUno" ? 1 : 0,
      uy: node.soporte === "soporteUno" || node.soporte === "soporteTres" ? 1 : 0,
      uz: node.soporte === "soporteUno" ? 1 : 0,
      rx: node.soporte === "soporteUno" ? 1 : 0,
      ry: node.soporte === "soporteUno" ? 1 : 0,
      rz: 1,
    }));

    const loads = this.nodes.map((node, index) => ({
      node: index + 1,
      fx: node.cargaX(),
      fy: node.cargaY(),
      fz: node.cargaZ() || 0,
      mx: 0,
      my: 0,
      mz: 0,
    }));

    console.log("📤 DATOS 3D ENVIADOS:", { nodes, elements, supports, loads });

    const response = await fetch("http://localhost:5001/api/analyze-3d", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nodes, elements, supports, loads }),
    });

    return response.json();
  },

  // ------------------------------------------------------------------
  // 9. MODELADO 3D (creación de nodos y barras, extrusión, etc.)
  // ------------------------------------------------------------------

  /**
   * Crea un nodo estructural con carga y restricción.
   * @param {number} x - Coordenada X.
   * @param {number} y - Coordenada Y (profundidad).
   * @param {number} z - Coordenada Z (altura).
   * @param {number} cargaX - Fuerza en X (kN).
   * @param {number} cargaY - Fuerza en Y (kN).
   * @param {number} cargaZ - Fuerza en Z (kN).
   * @param {string} restriccion - Tipo de apoyo (soporteUno, soporteDos, etc.).
   * @returns {Node} Nodo creado.
   */
  crearNodo3D(x, y, z, cargaX = 0, cargaY = 0, cargaZ = 0, restriccion = "") {
    const node = this.getOrCreateStructuralNode({ x, y, z });

    if (cargaX !== 0) node.cargaX = () => cargaX;
    if (cargaY !== 0) node.cargaY = () => cargaY;
    if (cargaZ !== 0) node.cargaZ = () => cargaZ;

    node.soporte = restriccion;

    return node;
  },

  /**
   * Crea una barra 3D entre dos nodos.
   * @param {Node} node1 - Nodo inicial.
   * @param {Node} node2 - Nodo final.
   * @param {string|number} area - Identificador de sección o área en m².
   * @param {number} E - Módulo de elasticidad (Pa).
   * @returns {Beam} Barra creada.
   */
  crearBarra3D(node1, node2, area = "25x25-1.5", E = 210e9) {
    const beam = new Beam(this.globalE, this.globalA);
    beam.addNode(node1);
    beam.addNode(node2);
    beam._A = area;
    beam.E = E;
    beam.id = this.shapes.length + 1;
    this.shapes.push(beam);
    return beam;
  },

  testEdificioSismico() {
    this.nodes = [];
    this.shapes = [];

    // Edificio 2 pisos, planta 5x5m, altura 3m/piso, acero W150x22
    // Valores de sección: A=2840mm²=0.00284m², Iz=12.1e-6m⁴, Iy=1.83e-6m⁴, J=0.11e-6m⁴
    const sec = { A: 0.00284, E: 200e9, G: 77e9, Iz: 12.1e-6, Iy: 1.83e-6, J: 0.11e-6 };

    const corners = [
      [0, 0],
      [5, 0],
      [5, 5],
      [0, 5],
    ];
    const base = corners.map(([x, y]) => cadSystem.crearNodo3D(x, y, 0, 0, 0, 0, "soporteUno"));
    const piso1 = corners.map(([x, y]) => cadSystem.crearNodo3D(x, y, 3, 0, 0, 0, ""));
    const piso2 = corners.map(([x, y]) => cadSystem.crearNodo3D(x, y, 6, 0, 0, 0, ""));

    // Masa 10 t/nodo en cada piso = 40 t/nivel (típico losa residencial)
    [...piso1, ...piso2].forEach((n) => {
      n.mass_x = 10000;
      n.mass_y = 10000;
      n.mass = 10000;
    });

    const addBeam = (ni, nj) => {
      const b = cadSystem.crearBarra3D(ni, nj);
      b.frameSection = { ...sec };
      return b;
    };

    // Columnas piso 1 y 2
    for (let i = 0; i < 4; i++) {
      addBeam(base[i], piso1[i]);
      addBeam(piso1[i], piso2[i]);
    }
    // Vigas perimetrales piso 1 y 2
    for (let i = 0; i < 4; i++) {
      addBeam(piso1[i], piso1[(i + 1) % 4]);
      addBeam(piso2[i], piso2[(i + 1) % 4]);
    }

    this.sync3D();
    this.redraw();
    this.showMessage(
      "Edificio sísmico de 2 pisos cargado. Asigna el espectro en Analyze → Seismic Spectral Analysis y verifica periodos T₁≈0.4–0.7s.",
    );
  },

  activate3DDrawingMode() {
    return activate3DDrawingMode(this);
  },

  elevateSelectedNodes() {
    return elevateSelectedNodes(this);
  },

  lowerSelectedNodes() {
    return lowerSelectedNodes(this);
  },

  extrudeToNewFloor() {
    return extrudeToNewFloor(this);
  },

  extrudeTo3D(floorHeight = 3, numFloors = 1) {
    return extrudeTo3D(this, floorHeight, numFloors);
  },

  selectAllNodes() {
    return selectAllNodes(this);
  },

  selectNodesByHeight(minZ, maxZ) {
    return selectNodesByHeight(this, minZ, maxZ);
  },

  showTestFrame() {
    return showTestFrame(this);
  },

  // ------------------------------------------------------------------
  // 10. MÉTODOS DE VISUALIZACIÓN 3D (Babylon.js)
  // ------------------------------------------------------------------

  toggleView3D() {
    return toggleView3D(this);
  },
};
