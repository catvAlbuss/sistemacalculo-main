// Sistema de unidades de visualización (registra window.cadUnits).
import "./lib/units.js";

import {
  ensureResponseSpectrumDefinitions,
  openResponseSpectrumFunctionsDialog,
  openResponseSpectrumCasesDialog
} from "./engine/7_responseSpectrumDefinitions.js";

import { GridEditor } from "./canvas2d/grid_editor.js";

import {
  activate3DDrawingMode,
  extrudeToNewFloor,
  extrudeTo3D,
  selectAllNodes,
  selectNodesByHeight,
  createTestFrame,
  showTestFrame,
} from "./3d/modeling3d.js";

import { setViewPlan, setViewIso, setViewFront, setViewSide, zoomExtents } from "./3d/camera3d.js";

import {
  initViewer3D,
  toggleView3D,
  clear3D,
  sync3D,
  drawIn3D,
  getViewer3DState,
  removeBeamMeshById,
  startBabylonDeflectionAnimation,
  stopBabylonDeflectionAnimation,
  isBabylonDeflectionAnimating,
} from "./3d/viewer3d.js";

import { createFull3DGrid, drawReferenceGrid3D, clearReferenceGrid3D } from "./3d/grid3d.js";

import { Grid } from "./canvas2d/grid.js";
import { DiseñoRenderer, DeflexionRenderer, AxialRenderer } from "./canvas2d/renderer.js";
import {
  IdleState,
  PanAndZoomState,
  RubberBandZoomState,
  TrussDrawingState,
  CrossViewFrameDrawingState,
  PointDrawingState,
  GridAxisDrawingState,
  ColumnDrawingState,
  CreateLinesRegionClicksState,
  CreateSecondaryBeamsRegionClicksState,
  ReferencePointDrawingState,
  DimensionLineDrawingState,
  SelectedDimensionLinesState,
  ReshapeObjectState,
  AreaDrawingState,
  SelectedAreasState,
  MoveObjectState,
  MoveGroupState,
  SelectedBeamsState,
  EditParametricState,
  SelectedParametricState,
  SelectedNodesState,
  SelectionState,
} from "./canvas2d/states.js";
import { pointDistance, mousePositionFrom, removeFromArray, axisToFixed, pointDistanceToSegment } from "./lib/utils.js";
import { read as readmat } from "mat-for-js";
import { Triangle, Puente, Arco } from "./model/parametricModels.js";
import Swal from "sweetalert2";
import sections from "./model/sections.js";

import * as BABYLON from "@babylonjs/core";
import { TrussDrawingState3D } from "./canvas2d/states.js";
import { Beam, Node as StructuralNode } from "./model/shapes.js";


// Mixin imports
import { optionsMixin } from "./mixins/core/options.js";
import { eventsMixin } from "./mixins/core/events.js";
import { selectionMixin } from "./mixins/select/selection.js";
import { actionsMixin } from "./mixins/core/actions.js";
import { modelQueriesMixin } from "./mixins/edit/model-queries.js";
import { editDeleteMixin } from "./mixins/edit/edit-delete.js";
import { editClipboardMixin } from "./mixins/edit/edit-clipboard.js";
import { undoRedoMixin } from "./mixins/edit/undo-redo.js";
import { editGeometryMixin } from "./mixins/edit/edit-geometry.js";
import { viewFilterMixin } from "./mixins/select/view-filter.js";
import { designMixin } from "./mixins/analysis/design.js";
import { displayDialogsMixin } from "./mixins/dialogs/display-dialogs.js";
import { assignDialogsMixin } from "./mixins/dialogs/assign-dialogs.js";
import { coreUiMixin } from "./mixins/core/core-ui.js";
import { fileIOMixin } from "./mixins/io/file-io.js";
import { modelFactoryMixin } from "./mixins/edit/model-factory.js";
import { storyGridMixin } from "./mixins/grids/story-grid.js";
import { viewportMixin } from "./mixins/select/viewport.js";
import { analysisMixin } from "./mixins/analysis/analysis.js";
import { referenceGridMixin } from "./mixins/grids/reference-grid.js";
import { elevationDrawingMixin } from "./mixins/grids/elevation-drawing.js";
import { planImportMixin } from "./mixins/grids/plan-import.js";
import { reportMixin } from "./mixins/analysis/report.js";
import { animationMixin } from "./mixins/analysis/animation.js";
import { seismicMixin } from "./mixins/analysis/seismic.js";
import { autosaveMixin } from "./mixins/io/autosave.js";

export default () => ({
  // ------------------------------------------------------------------
  // 1. PROPIEDADES REACTIVAS (Alpine)
  // ------------------------------------------------------------------
  init() {
    this.initAutosave?.();
  },

  // Contador reactivo para refrescar la barra de estado de selección (estilo
  // ETABS). Lo bumpea redraw() → Alpine re-evalúa getSelectionStatusLabel().
  _selectionTick: 0,

  show3DView: false,
  pendingGrid3D: false,
  grid3DDrawn: false,
  calcEngine: "hybrid",
  syncPending: false,
  view3DUpdateTimer: null,
  view3DUpdateToken: 0,

  activeStory: 0,
  windowLayout: "two-vertical",
  singleWindowView: "2d",
  activeCanvasTheme: "dark",
  canvasThemes: {
    dark: {
      canvas2d: "#36454F",
      canvas3d: "#050511",
      displayColors: {
        background2d: "#36454F",
        gridLine: "#2f5f7f",
        gridMainLine: "#3b82f6",
        beam: "#d1d5db",
        secondaryBeam: "#38bdf8",
        column: "#22c55e",
        node: "#9ca3af",
        text: "#ffffff",
        selected: "#facc15",
        snap: "#f97316",
      },
    },
    light: {
      canvas2d: "#e5e7eb",
      canvas3d: "#f1f5f9",
      displayColors: {
        background2d: "#e5e7eb",
        gridLine: "#cbd5e1",
        gridMainLine: "#2563eb",
        beam: "#374151",
        secondaryBeam: "#0284c7",
        column: "#16a34a",
        node: "#475569",
        text: "#111827",
        selected: "#ca8a04",
        snap: "#ea580c",
      },
    },
  },
  displayColors: {
    background2d: "#36454F",
    gridLine: "#2f5f7f",
    gridMainLine: "#3b82f6",
    beam: "#d1d5db",
    secondaryBeam: "#38bdf8",
    column: "#22c55e",
    node: "#9ca3af",
    text: "#ffffff",
    selected: "#facc15",
    snap: "#f97316",
  },
  canvas2dBackground: "#36454F",

  preferences: {
    lengthUnit: "m",
    forceUnit: "kN",
    modelTolerance: 0.001,
    snapScreenTolerance: 14,
    snapWorldTolerance: 1.0,
  },
  steelFrameDesign: {
    code: "AISC 360-16",
    designMethod: "LRFD",
    checkDeflection: true,
    checkSlenderness: true,
    checkCompactness: true,
    phiBending: 0.9,
    phiCompression: 0.9,
    phiShear: 0.9,
    deflectionLimitLive: 360,
    deflectionLimitTotal: 240,
  },
  reinforcementBarSizes: [
    { name: "#3", diameterMm: 9.5, areaMm2: 71, enabled: true },
    { name: "#4", diameterMm: 12.7, areaMm2: 129, enabled: true },
    { name: "#5", diameterMm: 15.9, areaMm2: 199, enabled: true },
    { name: "#6", diameterMm: 19.1, areaMm2: 284, enabled: true },
    { name: "#8", diameterMm: 25.4, areaMm2: 510, enabled: true },
  ],
  outputDecimals: {
    coordinates: 2,
    lengths: 2,
    forces: 2,
    displacements: 3,
    reactions: 2,
  },

  nextNodeId: 1,
  nextBeamId: 1,
  viewSet: [],
  activeViewIndex: 0,
  currentStory: "BASE",
  stories: [],
  currentViewMode: "plan",
  currentElevationX: "none",
  xElevations: [],
  currentElevationZ: "none",
  zElevations: [],
  referenceGrid: {
    xGrids: [],
    yGrids: [],
    generalGrids: [],
    xPositions: [],
    yPositions: [],
    xLabels: [],
    yLabels: [],
    storyCount: 0,
    storyHeight: 0,
  },
  referencePlanes: [],
  gridDisplayMode: "ordinates",
  gridEditor: null,
  activeGridPoint: null,
  statusCoordinates: "X 0.00  Y 0.00  Z 0.00",
  planGridSnapTolerance: 1.0,
  planGridSnapScreenTolerance: 14,
  lastMouseScreen: { x: 0, y: 0 },

  materialProperties: {
    open: false,
    materials: [],
    selectedMaterial: null,
  },
  frameSections: {
    open: false,
    sections: [],
    selectedSection: null,
  },
  loadCases: {
    open: false,
    cases: [
      { name: "CM", type: "Dead", selfWeight: true, value: 1.0 },
      { name: "CV", type: "Live", value: 0.25 },
      { name: "CVE", type: "Live", value: 0.5 },
      { name: "CVT", type: "Live", value: 0.5 },
      { name: "CN", type: "Live", value: 0.3 },
      { name: "CLL", type: "Live", value: 0.4 },
    ],
  },
  loadCombinations: {
    open: false,
    combinations: [
      { name: "COMB1", expression: "1.4CM + 1.7CV" },
      { name: "COMB2", expression: "1.25CM + 1.25CV + 1.0CVV+" },
      { name: "COMB3", expression: "0.9CM + 1.0CVV-" },
    ],
    items: [],
    selectedCombination: null,
  },
  massSource: {
    open: false,
    sources: {
      fromLoads: true,
      fromElements: false,
      multiplier: 1.0,
    },
    massDefinition: "self",
    loadMultipliers: [{ load: "CM", multiplier: 1 }],
    includeLateralMassOnly: false,
    lumpLateralMassAtStoryLevels: false,
  },

  materialModalOpen: false,
  linkProperties: {
    links: [],
    selectedLink: null,
  },
  hingeProperties: {
    hinges: [],
    selectedHinge: null,
  },
  diaphragms: {
    items: [],
    selectedDiaphragm: null,
  },
  sectionCuts: {
    items: [],
    selectedSectionCut: null,
  },

  responseSpectrumFunctions: {
    items: [],
    selectedFunction: null,
  },

  responseSpectrumCases: {
    items: [],
    selectedCase: null,
  },

  timeHistoryFunctions: {
    items: [],
    selectedFunction: null,
  },
  staticLoadCases: {
    items: [],
    selectedLoadCase: null,
  },
  staticNonlinearCases: {
    items: [],
    selectedNonlinearCase: null,
  },
  sequentialConstruction: {
    items: [],
    selectedSequentialCase: null,
  },
  specialSeismicData: {
    useForDesign: "include",
    rhoFactor: "program",
    rhoValue: 1.0,
    seismicCategory: "A_B_C",
    lateralSystem: "dual",
    omegaFactor: "program",
    omegaValue: 3.0,
    dlMultiplier: "program",
    dlMultiplierValue: 0.2,
  },
  groups: {
    items: [],
    selectedGroup: null,
  },

  analysisOptions: {
    enabled: true,
    analysisType: "full3d",
    solverType: "linear_static",
    runStaticAnalysis: true,
    considerSelfWeight: true,
    analysisStatus: "not_run",
    dof: {
      ux: true,
      uy: true,
      uz: true,
      rx: true,
      ry: true,
      rz: true,
    },
    dynamicAnalysis: {
      enabled: true,
    },
    dynamicParams: {
      numModes: 12,
      analysisType: "eigenvectors",
      freqShift: 0,
      cutoffFrequency: 0,
      tolerance: "1.000E-07",
      includeResidualModes: false,
      ritzLoads: [],
    },
    pDelta: {
      enabled: false,
    },
    pDeltaParams: {
      method: "iterative",
      maxIterations: 1,
      tolerance: "1.000E-03",
      loads: [{ name: "DEAD", scale: 1 }],
    },
    dbAccess: {
      enabled: false,
      filename: "analysis_output",
    },
  },
  analysisResults: null,
  modelCheck: null,

  // ===========================================================
  // ========== MODAL SPECTRAL / ANÁLISIS ESPECTRAL ============
  // ===========================================================
  modalSpectralLastPayload: null,
  modalSpectralLastResult: null,
  modalSpectralLastTable: [],
  modalSpectralStatus: "not_run", // not_run | running | completed | failed
  modalSpectralLastRunAt: null,
  modalSpectralLastError: null,

  // BLOQUE 7Q-C
  modalSpectralReportHistory: [],

  // BLOQUE 7T-A
  // Opciones persistentes Modal Spectral tipo ETABS
  modalSpectralOptions: {
    useRigidDiaphragms: true,
    diaphragmMode: "rigid_by_story",
    massSourceMode: "story_mass",
    storyMassDistribution: "by_level",

    modalCombination: "CQC", // CQC | SRSS | ABS
    dampingRatio: 0.05,

    numberOfModes: 12,
    useRealModalPeriods: true,
    useModalParticipatingMass: true,
    useCombinedModalResults: true,
  },

  modalSpectralModelCalibration: {
    enabled: false,
    globalStiffnessScale: 1.0,
    globalMassScale: 1.0,
    axialStiffnessScale: 1.0,
    bendingStiffnessScale: 1.0,
    torsionStiffnessScale: 1.0,
  },

  //Propiedades para la seccion de analisis
  dynamicParams: {
    numModes: 12,
    analysisType: "eigenvectors",
    freqShift: 0,
    cutoffFrequency: 0,
    tolerance: "1.000E-07",
    includeResidualModes: false,
    ritzLoads: [],
  },
  availableLoads: [
    { name: "DEAD", type: "Static" },
    { name: "LIVE", type: "Static" },
    { name: "WIND_X", type: "Wind" },
    { name: "WIND_Y", type: "Wind" },
    { name: "EQ_X", type: "Seismic" },
    { name: "EQ_Y", type: "Seismic" },
  ],
  selectedAvailableLoad: null,
  selectedRitzLoad: null,
  currentFileName: null,

  designOptions: {
    steelFrame: {
      selectedCombos: ["COMB1"],
    },
    steelJoist: {
      selectedCombos: ["COMB1"],
    },
  },

  displayOptions: {
    showUndeformedShape: true,
    showReferencePlanes: true,
    showJointLoads: false,
    showFrameLoads: false,
    showDeformedShape: false,
    showModeShape: false,
    showMemberForces: false,
    showMemberForceValues: false,
    deformedScale: 1,
    modeNumber: 1,
    modeScale: 1,
    memberForceType: "axial",
  },

  allow3DCrossPlaneFrames: true,
  frame3DStartWorkPlane: null,
  frame3DEndWorkPlane: null,

  deflectionAnimationActive: false,
  deflectionAnimationSpeed: 0.5,
  deflectionAnimationTimer: null,
  deflectionAnimationMinScale: 1,
  deflectionAnimationMaxScale: 500,
  deflectionAnimationDirection: 1,
  deflectionAnimationMode: "scale",
  deflectionBabylonLoop: true,
  deflectionBabylonEasing: "cubicOut",
  deflectionBabylonDuration: 2000,

  // ------------------------------------------------------------------
  // 2. INICIALIZACIÓN DEL SISTEMA
  // ------------------------------------------------------------------
  initSys(canvas, distanceInput) {
    this.Arco = Arco;
    this.Triangle = Triangle;
    this.Puente = Puente;
    this.options = {
      showGrid: true,
      showDeflection: false,
      deflectionScale: 1,
      showWireframe: false,
      showForces: true,
      currentLoad: "CM",
      renderScale: 1,
      showIDs: true,
      showReactions: true,
      showFAxiales: false,
      showFAxialesValues: true,
      showMaterials: false,
      // Vista extruida 3D tipo ETABS (Extrude View): dibuja frames como sólidos
      // b×h y losas/shells con espesor. Default OFF (vista de líneas/tubos).
      extrudeFrames3D: false,
      extrudeShells3D: false,
    };
    this.oldOptions = {
      ...this.options,
    };

    this.ensureDisplayOptions?.();
    this.ensureResponseSpectrumDefinitions?.();
    this.ensureModalSpectralOptions?.();
    // this.buildModalSpectralFinalReadinessReport?.();

    this.canvas = canvas;
    this.ctx = canvas.getContext("2d");
    this.distanceInput = distanceInput;
    this.shapes = [];
    this.nodes = [];
    this.areas = [];
    this.referencePoints = [];
    this.referencePlanes = this.referencePlanes || [];
    this.dimensionLines = [];
    this.undoStack = [];
    this.redoStack = [];
    this.maxUndoSteps = 30;

    this.editClipboard = null;
    this.editPasteCount = 0;
    this.parametricModels = [];
    this.K_Global_Reducido = [];
    this.Fuerzas_Globales_Reducidas = [];
    this.D_Global_Reducido = [];
    this.deflecciones = [];
    this.desplazamientosPosition = [];
    this.matrizDesplazamiento = [];

    this.analysisResults = null;
    this.modelCheck = null;
    this.sections = sections;
    this.materiales = [
      { id: 1, E: 210, A: 4000 },
      { id: 1, E: 2e1, A: 0.0012 },
      { id: 1, E: 300, A: 40 },
    ];
    this.mousePos = { x: 0, y: 0 };
    this.currentTab = "diseño";
    this.snap_enabled = true;
    this.globalE = 2.132e10; // concreto f'c=210 kg/cm² (2.132e10 Pa); antes 210e9 (acero)
    this.globalA = "25x25-1.5";
    this.selectedObject = null;
    this.grid = new Grid(canvas);
    this.diseñoRenderer = new DiseñoRenderer();
    this.deflexionRenderer = new DeflexionRenderer();
    this.axialRenderer = new AxialRenderer();
    this.currentRenderer = this.diseñoRenderer;
    this.oldRenderer = this.diseñoRenderer;
    this.panAndZoomState = new PanAndZoomState();
    this.rubberBandZoomState = new RubberBandZoomState();
    this.idleState = new IdleState();
    this.moveState = new PanAndZoomState();
    this.trussDrawingState = new TrussDrawingState(this);
    this.pointDrawingState = new PointDrawingState(this);
    this.gridAxisXDrawingState = new GridAxisDrawingState(this, "X");
    this.gridAxisYDrawingState = new GridAxisDrawingState(this, "Y");
    this.braceDrawingState = new TrussDrawingState(this, "brace");
    this.beamDrawingState = new TrussDrawingState(this, "beam");
    this.crossViewFrameDrawingState = new CrossViewFrameDrawingState(this, "beam");
    this.columnDrawingState = new ColumnDrawingState(this);
    this.createLinesRegionClicksState = new CreateLinesRegionClicksState(this);
    this.createSecondaryBeamsRegionClicksState = new CreateSecondaryBeamsRegionClicksState(this);
    this.referencePointDrawingState = new ReferencePointDrawingState(this);
    this.dimensionLineDrawingState = new DimensionLineDrawingState(this);
    this.slabDrawingState = new AreaDrawingState(this, "slab");
    this.wallDrawingState = new AreaDrawingState(this, "wall");
    this.openingDrawingState = new AreaDrawingState(this, "opening");
    this.moveObjectState = new MoveObjectState();
    this.moveGroupState = new MoveGroupState();
    this.selectedNodesState = new SelectedNodesState();
    this.selectedBeamsState = new SelectedBeamsState();
    this.selectedAreasState = new SelectedAreasState();
    this.selectedDimensionLinesState = new SelectedDimensionLinesState();
    this.reshapeObjectState = new ReshapeObjectState();
    this.editParametricState = new EditParametricState();
    this.selectedParametricState = new SelectedParametricState();
    this.selectionState = new SelectionState();
    this.currentState = this.idleState;
    this.nextNodeId = 1;
    this.nextBeamId = 1;
    // Selección múltiple de barras con Ctrl + clic
    this.multiSelectedFrames = [];
    // this.threeElements = []; // ← NUEVA
    this.prevState = null;
    this.trussDrawingState3D = new TrussDrawingState3D(this);

    this.gridEditor = new GridEditor(this);

    document.onkeydown = (event) => {
      this.handleKeyDown(event);
    };

    window.onresize = () => this.windowResize();

    this.windowResize();

    canvas.oncontextmenu = () => {
      return false;
    };

    canvas.addEventListener(
      "wheel",
      (event) => {
        event.preventDefault();
        this.handleMouseWheel(event);
      },
      { passive: false },
    );

    canvas.onclick = (event) => {
      this.handleMouseClick(event);
    };

    canvas.onmousedown = (event) => {
      event.preventDefault();
      this.handleMouseDown(event);
    };

    canvas.onmouseup = (event) => {
      this.handleMouseUp(event);
    };

    canvas.onmouseleave = (event) => {
      this.handleMouseLeave(event);
    };

    canvas.onmousemove = (event) => {
      this.handleMouseMove(event);
    };

    const renderLoop = () => {
      this.shapes.forEach((s) => {
        const p1 = this.grid.worldToScreen(s.node1.position);
        const p2 = this.grid.worldToScreen(s.node2.position);
        s.angle = Math.atan2(p2.y - p1.y, p2.x - p1.x);
      });
      this.redraw();
      window.requestAnimationFrame(renderLoop);
    };
    window.requestAnimationFrame(renderLoop);

    setTimeout(() => {
      const container = document.getElementById("viewer3d-container");
      const viewer = getViewer3DState();

      if (container && !viewer.initialized) {
        console.log("🚀 Inicializando vista 3D automáticamente...");
        this.initViewer3D(container);
        this.rebuild3DGridSnapPointsSoon?.("initSys viewer initialized");
      }
    }, 1000);

    const btnOpenGridEditor = document.getElementById("btn-open-grid-editor");
    if (btnOpenGridEditor) {
      btnOpenGridEditor.addEventListener("click", () => {
        this.gridEditor.open();
      });
    }

    localStorage.removeItem("cad-canvas-theme");
    localStorage.removeItem("cad-display-colors");

    this.activeCanvasTheme = "dark";
    this.setCanvasTheme("dark");

    this.loadOptionsPreferences();

    const savedOutputDecimals = localStorage.getItem("cad-output-decimals");
    if (savedOutputDecimals) {
      try {
        this.outputDecimals = {
          ...this.outputDecimals,
          ...JSON.parse(savedOutputDecimals),
        };
      } catch (error) {
        console.warn("No se pudieron cargar Output Decimals:", error);
      }
    }

    const savedPreferences = localStorage.getItem("cad-preferences");
    if (savedPreferences) {
      try {
        this.preferences = {
          ...this.preferences,
          ...JSON.parse(savedPreferences),
        };
        this.applyDimensionsTolerances();
      } catch (error) {
        console.warn("No se pudieron cargar Dimensions / Tolerances:", error);
      }
    } else {
      this.applyDimensionsTolerances();
    }

    const savedReinforcementBars = localStorage.getItem("cad-reinforcement-bar-sizes");
    if (savedReinforcementBars) {
      try {
        this.reinforcementBarSizes = JSON.parse(savedReinforcementBars);
      } catch (error) {
        console.warn("No se pudieron cargar Reinforcement Bar Sizes:", error);
      }
    }

    const savedSteelFrameDesign = localStorage.getItem("cad-steel-frame-design");
    if (savedSteelFrameDesign) {
      try {
        this.steelFrameDesign = {
          ...this.steelFrameDesign,
          ...JSON.parse(savedSteelFrameDesign),
        };
      } catch (error) {
        console.warn("No se pudo cargar Steel Frame Design:", error);
      }
    }

    window.cadSystem = this;
    window.getViewer3DState = getViewer3DState;
  },

  // ------------------------------------------------------------------
  // 3. PUENTES 3D (wrappers inline que necesitan acceso a this)
  // ------------------------------------------------------------------
  initViewer3D(container) {
    return initViewer3D(this, container);
  },

  clear3D() {
    return clear3D();
  },

  sync3D() {
    return sync3D(this);
  },

  drawIn3D() {
    return drawIn3D(this);
  },

  createFull3DGrid(scene) {
    return createFull3DGrid(scene);
  },

  drawReferenceGrid3D() {
    if (window._grid3DLabels) {
      window._grid3DLabels.forEach((label) => {
        if (label && !label.isDisposed()) {
          label.dispose();
        }
      });
      window._grid3DLabels = [];
    }
    return drawReferenceGrid3D(this);
  },

  clearReferenceGrid3D() {
    return clearReferenceGrid3D();
  },

  setViewPlan() {
    return setViewPlan();
  },

  setViewIso() {
    return setViewIso();
  },

  setViewFront() {
    return setViewFront();
  },

  setViewSide() {
    return setViewSide();
  },

  zoomExtents() {
    return zoomExtents(this);
  },

  // ------------------------------------------------------------------
  // 4. MIXINS
  // Orden de propagación: selectionMixin antes que elevationDrawingMixin para que
  // el método clearAllSelections más robusto en elevationDrawingMixin tenga prioridad.
  // ------------------------------------------------------------------
  ...optionsMixin,
  ...eventsMixin,
  ...selectionMixin,
  ...actionsMixin,
  ...modelQueriesMixin,
  ...editDeleteMixin,
  ...editClipboardMixin,
  ...undoRedoMixin,
  ...editGeometryMixin,
  ...viewFilterMixin,
  ...designMixin,
  ...displayDialogsMixin,
  ...assignDialogsMixin,
  ...coreUiMixin,
  ...fileIOMixin,
  ...modelFactoryMixin,
  ...storyGridMixin,
  ...viewportMixin,
  ...analysisMixin,
  ...referenceGridMixin,
  ...elevationDrawingMixin,
  ...planImportMixin,
  ...reportMixin,
  ...animationMixin,
  ...seismicMixin,
  ...autosaveMixin,
});
