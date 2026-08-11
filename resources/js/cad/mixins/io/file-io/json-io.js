// mixins/io/file-io/json-io.js — parte "json-io" de file-io
// (file-io.js se partió en sub-mixins por responsabilidad; barril en file-io.js).
import Swal from "sweetalert2";
import { Beam, Node as StructuralNode } from "../../../model/shapes.js";
import { read as readmat } from "mat-for-js";
import { axisToFixed, removeFromArray } from "../../../lib/utils.js";
import { Triangle, Puente, Arco } from "../../../model/parametricModels.js";
import { extrudeToNewFloor, selectAllNodes, activate3DDrawingMode } from "../../../3d/modeling3d.js";
import { toggleView3D } from "../../../3d/viewer3d.js";
import {
  serializeFrameForceModule,
  restoreFrameForceModule,
} from "../../../engine/frameForcePersistence.js";

export const jsonIoMixin = {

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

      diaphragmMode:
        node.diaphragmMode ||
        node.assignment?.diaphragmMode ||
        (
          node.diaphragmId ||
            node.diaphragm?.id
            ? "direct"
            : "fromArea"
        ),
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

      // Identidad ORIGINAL de ETABS. La pone el import del .e2k y es lo ÚNICO
      // que permite cruzar nuestras tablas contra las de ETABS (que van por
      // Story + Label; el id de la app es un correlativo que no significa nada
      // afuera). No estaba en esta lista blanca, así que se perdía en silencio
      // al guardar y reabrir: el CSV salía con Story/Label vacíos y el cruce
      // dejaba de funcionar sin ningún aviso.
      e2kName: frame.e2kName ?? null,
      e2kStory: frame.e2kStory ?? null,

      // Rotación del eje local (ETABS ANG). El LOADER ya la leía, pero acá
      // nunca se escribía: una columna T/L rotada perdía su orientación al
      // guardar y reabrir, y volvía con la rigidez X↔Y intercambiada.
      localAxisAngle: Number(frame.localAxisAngle) || 0,

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

      // Dirección de reparto de la carga en losas de UNA dirección (ETABS ANG
      // del AREAASSIGN; es la flecha que se dibuja sobre la losa y decide a qué
      // vigas va la carga). El loader de áreas propaga todo con spread, así que
      // solo faltaba ESCRIBIRLA: se perdía en cada guardado y la losa volvía con
      // el reparto en la dirección por defecto.
      loadDistAngle: Number(area.loadDistAngle) || 0,

      groupIds: clean(area.groupIds, []),
      groupNames: clean(area.groupNames, []),
      groups: clean(area.groups, []),

      // Diafragma asignado (Assign ▸ Shell ▸ Diaphragms, assignShellDiaphragmToTargets
      // en assign-dialogs.js escribe estos 3 campos) — faltaban acá, así que se
      // perdían en CUALQUIER guardado del modelo (JSON local, autosave, Y el
      // export .e2k, que lee este mismo exportToJSON()). Por eso el diafragma
      // nunca llegaba al .e2k pese a que buildETABS_E2KText() sí sabe escribirlo.
      diaphragmId: area.diaphragmId ?? null,
      diaphragmName: area.diaphragmName ?? null,
      diaphragm: clean(area.diaphragm, null),

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

        // Plano DXF importado (fondo + snap en Planta - Base). Ver mixins/grids/plan-import.js.
        importedPlan: clean(this.importedPlan, null),

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
          nodeData.assignment?.diaphragm ||
          (nodeData.diaphragmId
            ? {
              id: nodeData.diaphragmId,
              name:
                nodeData.diaphragmName ||
                nodeData.diaphragmId,
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

        // ============================================================
        // JAS-02F.3 — Restaurar modo de diafragma nodal
        // Estados: fromArea | direct | none
        // ============================================================

        const hasImportedDirectDiaphragm = Boolean(
          newNode.diaphragmId ||
          newNode.diaphragm?.id ||
          nodeData.diaphragmId ||
          nodeData.diaphragm?.id ||
          nodeData.assignment?.diaphragm?.id
        );

        const rawImportedDiaphragmMode = String(
          nodeData.diaphragmMode ||
          nodeData.assignment?.diaphragmMode ||
          (
            hasImportedDirectDiaphragm
              ? "direct"
              : "fromArea"
          )
        )
          .trim()
          .toLowerCase()
          .replace(/[\s_-]+/g, "");

        let importedDiaphragmMode = "fromArea";

        if (
          rawImportedDiaphragmMode === "none" ||
          rawImportedDiaphragmMode === "disconnect" ||
          rawImportedDiaphragmMode === "disconnected"
        ) {
          importedDiaphragmMode = "none";
        } else if (
          rawImportedDiaphragmMode === "direct" &&
          hasImportedDirectDiaphragm
        ) {
          importedDiaphragmMode = "direct";
        } else if (
          rawImportedDiaphragmMode === "fromarea" ||
          rawImportedDiaphragmMode === "fromshell" ||
          rawImportedDiaphragmMode === "fromshellobject"
        ) {
          importedDiaphragmMode = "fromArea";
        } else if (hasImportedDirectDiaphragm) {
          // Compatibilidad con archivos antiguos que tenían D1,
          // pero todavía no guardaban diaphragmMode.
          importedDiaphragmMode = "direct";
        }

        newNode.diaphragmMode = importedDiaphragmMode;

        newNode.assignment = {
          ...(newNode.assignment || {}),
          diaphragmMode: importedDiaphragmMode,
        };

        // ------------------------------------------------------------
        // DIRECT: conservar y sincronizar el diafragma asignado.
        // ------------------------------------------------------------
        if (importedDiaphragmMode === "direct") {
          const restoredDirectDiaphragm =
            newNode.diaphragm ||
            importedDiaphragm ||
            nodeData.assignment?.diaphragm ||
            null;

          if (restoredDirectDiaphragm) {
            newNode.diaphragm =
              cleanClone(restoredDirectDiaphragm);

            newNode.diaphragmId =
              restoredDirectDiaphragm.id ||
              nodeData.diaphragmId ||
              null;

            newNode.diaphragmName =
              restoredDirectDiaphragm.name ||
              nodeData.diaphragmName ||
              newNode.diaphragmId ||
              null;

            newNode.hasDiaphragm = Boolean(
              newNode.diaphragmId
            );

            newNode.assignment.diaphragm =
              cleanClone(newNode.diaphragm);
          } else {
            // Si el archivo declara direct pero no contiene un
            // diafragma válido, no inventamos uno.
            newNode.diaphragmId = null;
            newNode.diaphragmName = null;
            newNode.diaphragm = null;
            newNode.hasDiaphragm = false;
            newNode.assignment.diaphragm = null;
          }
        } else {
          // ----------------------------------------------------------
          // FROM AREA y NONE no conservan asignaciones directas.
          // ----------------------------------------------------------
          newNode.diaphragmId = null;
          newNode.diaphragmName = null;
          newNode.diaphragm = null;
          newNode.hasDiaphragm = false;

          newNode.assignment.diaphragm = null;
        }

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

          // Rotación del eje local (ETABS ANG / Assign ▸ Local Axes). Sin
          // copiarla, una columna T/L rotada perdía su orientación al
          // importar/restaurar y quedaba con rigidez X↔Y intercambiada.
          if (Number(frameData.localAxisAngle)) {
            newFrame.localAxisAngle = Number(frameData.localAxisAngle);
          }

          // Identidad de ETABS (Story + Label) — ver el comentario en el
          // serializador. Sin esto el CSV de fuerzas sale sin esas columnas y
          // no se puede cruzar contra ETABS.
          if (frameData.e2kName) newFrame.e2kName = frameData.e2kName;
          if (frameData.e2kStory) newFrame.e2kStory = frameData.e2kStory;

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
      this.importedPlan = cleanClone(model.importedPlan, null);

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

      // Combinaciones de carga del .e2k. `items` guarda la forma ESTRUCTURADA
      // ({id, type, terms:[{case, factor}]}) que consume el motor; `combinations`
      // queda con el texto que muestra el modal Define ▸ Combinaciones. Ver
      // e2k-load-combos.js — los combos anidados ya vienen aplanados de ahí.
      const importedCombos = definitions.loadCombinations || data.loadCombinations;
      if (Array.isArray(importedCombos) && importedCombos.length) {
        if (!this.loadCombinations) this.loadCombinations = {};
        this.loadCombinations.items = cleanClone(importedCombos, []);

        const exprs = definitions.loadCombinationExpressions;
        if (Array.isArray(exprs) && exprs.length) {
          this.loadCombinations.combinations = cleanClone(exprs, []);
        }
        this.loadCombinations.selectedCombination =
          this.loadCombinations.items[0]?.id || null;
      }

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
          // El modelo abierto/restaurado trae su propia grilla+pisos — centrar
          // el pivote de órbita 3D ahí (createModelFromDialog ya lo hacía para
          // "Nuevo Modelo"; acá faltaba para abrir/restaurar uno guardado).
          this.recenterCameraOnGrid?.();
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
};
