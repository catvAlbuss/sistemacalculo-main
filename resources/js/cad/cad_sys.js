import { GridEditor } from "./grid_editor.js";

import {
  activate3DDrawingMode,
  elevateSelectedNodes,
  lowerSelectedNodes,
  extrudeToNewFloor,
  extrudeTo3D,
  selectAllNodes,
  selectNodesByHeight,
  createTestFrame,
  showTestFrame,
} from "./3d/modeling3d.js";

import { setViewPlan, setViewIso, setViewFront, setViewSide, zoomExtents } from "./3d/camera3d.js";

import { initViewer3D, toggleView3D, clear3D, sync3D, drawIn3D, getViewer3DState, removeBeamMeshById } from "./3d/viewer3d.js";

import { createFull3DGrid, drawReferenceGrid3D, clearReferenceGrid3D } from "./3d/grid3d.js";

import { Grid } from "./grid.js";
import { DiseñoRenderer, DeflexionRenderer, AxialRenderer } from "./renderer.js";
import {
  IdleState,
  PanAndZoomState,
  RubberBandZoomState,
  TrussDrawingState,
  CrossViewFrameDrawingState,
  PointDrawingState,
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
  SelectedBeamsState,
  EditParametricState,
  SelectedParametricState,
  SelectedNodesState,
  SelectionState,
} from "./states.js";
import { pointDistance, mousePositionFrom, removeFromArray, axisToFixed, pointDistanceToSegment } from "./utils.js";
import { read as readmat } from "mat-for-js";
import { Triangle, Puente, Arco } from "./parametricModels.js";
import Swal from "sweetalert2";
import sections from "./sections.js";

// import * as THREE from "three";
// import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import * as BABYLON from "@babylonjs/core";
import { TrussDrawingState3D } from "./states.js";
import { Beam, Node as StructuralNode } from "./shapes.js";

// IMPORTAR LOS DIÁLOGOS
import { openMaterialDialog } from "./dialogs/material-dialog.js";
import { openSectionDialog } from "./dialogs/section-dialog.js";
import { openLoadCaseDialog } from "./dialogs/loadcase-dialog.js";
import { openCombinationDialog } from "./dialogs/combination-dialog.js";
import { openMassSourceDialog } from "./dialogs/mass-source-dialog.js";

// Importar menús
import { menus, getMenuContent } from "./menus/index.js";

export default () => ({
  init() { },

  // NUEVAS PROPIEDADES PARA 3D
  show3DView: false,
  // viewer3DInitialized: false, // ← NUEVA

  pendingGrid3D: false,
  grid3DDrawn: false,

  // NUEVAS PROPIEDADES
  calcEngine: "hybrid", // 'hybrid', 'opensees', 'octave'
  syncPending: false,
  view3DUpdateTimer: null,
  view3DUpdateToken: 0,

  // 3 OPTIONS
  activeStory: 0,
  windowLayout: "two-vertical",
  singleWindowView: "2d", // "2d" | "3d"

  // 2 OPTIONS
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

  // 1 OPTIONS
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

    phiBending: 0.90,
    phiCompression: 0.90,
    phiShear: 0.90,

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

  // Selection de vistas 3D
  viewSet: [],
  activeViewIndex: 0,
  // viewMode: "plan", // plan | elevation

  //Se agrego estas propiedades para hacer la funcionalidad de graficar en vistas 123, abc
  // Propiedades de pisos (stories)
  currentStory: "BASE",
  stories: [],

  // Propiedades de elevaciones en X (vistas 1,2,3...)
  currentViewMode: "plan",
  currentElevationX: "none",
  xElevations: [], // ← AGREGA ESTA LÍNEA

  // Propiedades de elevaciones en Y (vistas A,B,C...)
  currentElevationZ: "none",
  zElevations: [], // ← AGREGA ESTA LÍNEA

  // También agrega referenceGrid si no está
  // referenceGrid: null,
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

  gridDisplayMode: "ordinates", // "ordinates" o "spacing"

  // Guardar estado para restaurar después de cerrar el editor de grid
  gridEditor: null,

  // NUEVAS FUNCIONES
  activeGridPoint: null,
  statusCoordinates: "X 0.00  Y 0.00  Z 0.00",
  planGridSnapTolerance: 1.0,
  planGridSnapScreenTolerance: 14,
  lastMouseScreen: { x: 0, y: 0 },

  // ===========================================================
  // ========== PROPIEDADES PARA LA SECION DEFINE ==============
  // ===========================================================
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
      { name: "CV", type: "Live", value: 1.0 },
      { name: "CVV+", type: "Live", value: 0.5 },
      { name: "CVV-", type: "Live", value: 0.5 },
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
    loadMultipliers: [{ load: "DEAD", multiplier: 1 }],
    includeLateralMassOnly: false,
    lumpLateralMassAtStoryLevels: false,
  },

  menus: Object.values(menus),
  getMenuContent,

  materialModalOpen: false, // propiedad para usar el modal de materiales

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

  // ===========================================================
  // ========== PROPIEDADES PARA ANALYZE / ANÁLISIS ============
  // ===========================================================
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
      loads: [
        {
          name: "DEAD",
          scale: 1,
        },
      ],
    },

    dbAccess: {
      enabled: false,
      filename: "analysis_output",
    },

  },

  analysisResults: null,
  modelCheck: null,

  //Propiedades para la seccion de analisis
  dynamicParams: {
    numModes: 12,
    analysisType: "eigenvectors", // 'eigenvectors' o 'ritz'
    freqShift: 0,
    cutoffFrequency: 0,
    tolerance: "1.000E-07",
    includeResidualModes: false,
    ritzLoads: [],
  },

  // Lista de cargas disponibles (obtener de cadSystem)
  availableLoads: [
    { name: "DEAD", type: "Static" },
    { name: "LIVE", type: "Static" },
    { name: "WIND_X", type: "Wind" },
    { name: "WIND_Y", type: "Wind" },
    { name: "EQ_X", type: "Seismic" },
    { name: "EQ_Y", type: "Seismic" },
  ],

  // Selecciones para Ritz
  selectedAvailableLoad: null,
  selectedRitzLoad: null,

  // Propiedad para guardar el modelo
  // Agrega esto en la sección de propiedades
  currentFileName: null,

  // ===========================================================
  // ========== PROPIEDADES PARA DESIGN / DISEÑO ===============
  // ===========================================================
  designOptions: {
    steelFrame: {
      selectedCombos: ["COMB1"],
    },

    steelJoist: {
      selectedCombos: ["COMB1"],
    },
  },

  // ===========================================================
  // ========== PROPIEDADES PARA DISPLAY / MOSTRAR =============
  // ===========================================================
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

  // =====================================================
  // DRAW 3D > CONFIGURACIÓN DE BARRAS DIAGONALES
  // Permite conectar nodos entre planos distintos.
  // =====================================================
  allow3DCrossPlaneFrames: true,
  frame3DStartWorkPlane: null,
  frame3DEndWorkPlane: null,



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
      showMaterials: true,
    };
    this.oldOptions = {
      ...this.options,
    };

    this.ensureDisplayOptions?.();

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
      {
        id: 1,
        E: 210,
        A: 4000,
      },
      {
        id: 1,
        E: 2e1,
        A: 0.0012,
      },
      {
        id: 1,
        E: 300,
        A: 40,
      },
    ];
    this.mousePos = { x: 0, y: 0 };
    this.currentTab = "diseño";
    this.snap_enabled = true;
    this.globalE = 210;
    this.globalA = "25x25-1.5";
    this.selectedObject = null;
    this.grid = new Grid(canvas);
    // this.grid.gridSpacing = 5; // Ajusta el espaciado del grid a 5 unidades
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
    this.braceDrawingState = new TrussDrawingState(this, "brace");
    this.beamDrawingState = new TrussDrawingState(this, "beam");
    // Estado especial para dibujar barras entre diferentes vistas.
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
    this.selectedNodesState = new SelectedNodesState();
    this.selectedBeamsState = new SelectedBeamsState();
    this.selectedAreasState = new SelectedAreasState();
    this.selectedDimensionLinesState = new SelectedDimensionLinesState();
    this.reshapeObjectState = new ReshapeObjectState();
    this.editParametricState = new EditParametricState();
    this.selectedParametricState = new SelectedParametricState();
    this.selectionState = new SelectionState();
    this.currentState = this.idleState;
    // Estado 3D antiguo desactivado.
    // Se deja como null para que Alpine no rompa el x-show del Blade.
    // this.trussDrawingState3D = null;

    this.nextNodeId = 1;
    this.nextBeamId = 1;
    // Selección múltiple de barras con Ctrl + clic
    multiSelectedFrames: [],
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

        // =====================================================
        // 3D SNAP > RECONSTRUIR SNAP POINTS AL INICIAR BABYLON
        // Por si el modelo ya existe cuando recién aparece el 3D.
        // =====================================================
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

  loadOptionsPreferences() {
    const preferenceData = localStorage.getItem("cad-preferences");
    const outputDecimalsData = localStorage.getItem("cad-output-decimals");
    const steelDesignData = localStorage.getItem("cad-steel-frame-design");
    const barSizesData = localStorage.getItem("cad-reinforcement-bar-sizes");

    if (preferenceData) {
      try {
        this.preferences = {
          ...this.preferences,
          ...JSON.parse(preferenceData),
        };

        this.planGridSnapScreenTolerance = this.preferences.snapScreenTolerance;
        this.planGridSnapTolerance = this.preferences.snapWorldTolerance;
      } catch (error) {
        console.warn("No se pudieron cargar Preferences:", error);
      }
    }

    if (outputDecimalsData) {
      try {
        this.outputDecimals = {
          ...this.outputDecimals,
          ...JSON.parse(outputDecimalsData),
        };
      } catch (error) {
        console.warn("No se pudieron cargar Output Decimals:", error);
      }
    }

    if (steelDesignData) {
      try {
        this.steelFrameDesign = {
          ...this.steelFrameDesign,
          ...JSON.parse(steelDesignData),
        };
      } catch (error) {
        console.warn("No se pudo cargar Steel Frame Design:", error);
      }
    }

    if (barSizesData) {
      try {
        this.reinforcementBarSizes = JSON.parse(barSizesData);
      } catch (error) {
        console.warn("No se pudieron cargar Reinforcement Bar Sizes:", error);
      }
    }
  },

  // ========================================= 
  // ========== MÉTODOS PARA DEFINE ==========
  // =========================================

  // openMaterialProperties() {
  //   openMaterialDialog(this);
  // },

  // openFrameSections() {
  //   openSectionDialog(this);
  // },

  // openLoadCases() {
  //   openLoadCaseDialog(this);
  // },

  // openLoadCombinations() {
  //   openCombinationDialog(this);
  // },

  // openMassSource() {
  //   openMassSourceDialog(this);
  // },

  creaArco() {
    this.parametricModels.push(new Arco());
    this.sync3D(); // ← AÑADIR
  },

  creaElipse() {
    this.parametricModels.push(new Puente());
    this.sync3D(); // ← AÑADIR
  },

  creaTriangulo() {
    this.parametricModels.push(new Triangle());
    this.sync3D(); // ← AÑADIR
  },

  pointInPolygon(screenPoint, polygonPoints) {
    let inside = false;

    for (let i = 0, j = polygonPoints.length - 1; i < polygonPoints.length; j = i++) {
      const xi = polygonPoints[i].x, yi = polygonPoints[i].y;
      const xj = polygonPoints[j].x, yj = polygonPoints[j].y;

      const intersect =
        ((yi > screenPoint.y) !== (yj > screenPoint.y)) &&
        (screenPoint.x < ((xj - xi) * (screenPoint.y - yi)) / ((yj - yi) || 1e-9) + xi);

      if (intersect) inside = !inside;
    }

    return inside;
  },

  closestAreaAtActiveView(searchPoint) {
    if (!this.areas?.length) return null;

    const view = this.viewSet?.[this.activeViewIndex];

    // Primera versión: solo planta
    if (view?.type !== "plan") return null;

    let closest = null;
    let bestDistance = 8;

    this.areas.forEach((area) => {
      if (!area.visible || !area.points || area.points.length < 3) return;

      const pts = area.points.map((p) =>
        this.currentRenderer.projectPoint({ position: p }, this)
      );

      // Si el clic cae dentro del polígono, seleccionar directo
      if (this.pointInPolygon(searchPoint, pts)) {
        closest = area;
        bestDistance = 0;
        return;
      }

      // Si no está dentro, probar cercanía al borde
      for (let i = 0; i < pts.length; i++) {
        const p1 = pts[i];
        const p2 = pts[(i + 1) % pts.length];
        const d = pointDistanceToSegment(searchPoint, p1, p2);

        if (d < bestDistance) {
          bestDistance = d;
          closest = area;
        }
      }
    });

    return closest;
  },

  // OPCIONES DE LA BARRA DE OPCIONES

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
          this.showMessage(
            "Create Columns solo está disponible en vistas de planta",
            "warning"
          );
          break;
        }

        this.clearAllSelections?.();
        this.setState(this.columnDrawingState);
        this.showMessage("Create Columns in Region or at Clicks activado");
        break;
      }

      case "create-secondary-beams-region-clicks": {
        const view = this.viewSet?.[this.activeViewIndex];

        if (!view || view.type !== "plan") {
          this.showMessage(
            "Create Secondary Beams solo está disponible en vistas de planta",
            "warning"
          );
          break;
        }

        this.clearAllSelections?.();
        this.setState(this.createSecondaryBeamsRegionClicksState);
        this.showMessage(
          "Create Secondary Beams activado | R cambia dirección | + / - cambia cantidad"
        );
        break;
      }

      case "draw-area-slab":
        this.clearAllSelections?.();
        this.setState(this.slabDrawingState);
        this.showMessage("Modo dibujar losa / área activado");
        break;

      case "draw-area-wall":
        this.clearAllSelections?.();
        this.setState(this.wallDrawingState);
        this.showMessage("Modo dibujar muro / panel activado");
        break;

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
  // ======= EDIT: SELECCIÓN CENTRAL =========
  // =========================================

  isEditNodeObject(obj) {
    if (!obj) return false;

    const type = String(
      obj.objectType ||
      obj.elementType ||
      obj.type ||
      obj.constructor?.name ||
      ""
    ).toLowerCase();

    return (
      !!obj.position &&
      !obj.node1 &&
      !obj.node2 &&
      (
        Array.isArray(obj.beams) ||
        obj.isNode === true ||
        type === "node" ||
        type === "structuralnode" ||
        type === "joint" ||
        type === "point"
      )
    );
  },

  isEditFrameObject(obj) {
    if (!obj) return false;

    const type = String(
      obj.objectType ||
      obj.elementType ||
      obj.type ||
      obj.constructor?.name ||
      ""
    ).toLowerCase();

    return (
      !!obj.node1 &&
      !!obj.node2 &&
      (
        obj.isBeam === true ||
        type === "beam" ||
        type === "column" ||
        type === "brace" ||
        type === "frame" ||
        type === "line" ||
        type === "secondary-beam" ||
        type === "secondarybeam"
      )
    );
  },

  isEditAreaObject(obj) {
    if (!obj) return false;

    const type = String(
      obj.objectType ||
      obj.elementType ||
      obj.type ||
      obj.areaType ||
      obj.constructor?.name ||
      ""
    ).toLowerCase();

    return (
      Array.isArray(obj.points) &&
      (
        type === "area" ||
        type === "slab" ||
        type === "wall" ||
        type === "opening" ||
        !!obj.areaType
      )
    );
  },

  isEditDimensionLineObject(obj) {
    if (!obj) return false;

    return (
      obj.start &&
      obj.end &&
      (
        obj.label ||
        typeof obj.value === "number"
      )
    );
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

    if (
      this.currentState === this.moveObjectState &&
      this.moveObjectState?.selectedObject
    ) {
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
        : [
          ...(this.nodes || []),
          ...(this.shapes || []),
          ...(this.areas || []),
          ...(this.dimensionLines || []),
        ];

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
    const selectedFrames = combined.filter((obj) =>
      this.isEditFrameObject(obj)
    );

    const explicitNodes = new Set(
      explicitObjects.filter((obj) => this.isEditNodeObject(obj))
    );

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
    if (
      this.isEditDimensionLineObject?.(obj) ||
      (obj.start && obj.end && obj.value !== undefined)
    ) {
      return this.dimensionLines?.includes(obj) ?? false;
    }

    return false;
  },

  getEditSelectedNodes(options = {}) {
    return this.getEditSelectedObjects(options).filter((obj) =>
      this.isEditNodeObject(obj)
    );
  },

  getEditSelectedFrames(options = {}) {
    return this.getEditSelectedObjects(options).filter((obj) =>
      this.isEditFrameObject(obj)
    );
  },

  getEditSelectedAreas(options = {}) {
    return this.getEditSelectedObjects(options).filter((obj) =>
      this.isEditAreaObject(obj)
    );
  },

  getEditSelectedDimensionLines(options = {}) {
    return this.getEditSelectedObjects(options).filter((obj) =>
      this.isEditDimensionLineObject(obj)
    );
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
      `Edit selección: ${summary.total} objeto(s) | Nodos: ${summary.nodes}, Líneas: ${summary.frames}, Áreas: ${summary.areas}`
    );

    return {
      summary,
      objects,
    };
  },

  // =========================================
  // ========== EDIT: DELETE =================
  // =========================================

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

  removeFrameFromModel(frame) {
    if (!frame) return false;

    if (frame.node1?.beams) {
      frame.node1.beams = frame.node1.beams.filter((beam) => beam !== frame);
    }

    if (frame.node2?.beams) {
      frame.node2.beams = frame.node2.beams.filter((beam) => beam !== frame);
    }

    if (Array.isArray(this.shapes)) {
      const index = this.shapes.indexOf(frame);

      if (index >= 0) {
        this.shapes.splice(index, 1);
        return true;
      }
    }

    return false;
  },

  removeNodeFromModel(node) {
    if (!node) return false;

    const connectedFrames = Array.isArray(node.beams)
      ? [...node.beams]
      : [];

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
    const selectedObjects = this.getEditSelectedObjects?.({
      respectActiveView: true,
    }) || [];

    if (!selectedObjects.length) {
      this.showMessage?.("🗑️ Seleccione un elemento para eliminar", "warning");
      console.warn("EDIT Delete: no hay selección.");
      return;
    }

    this.saveUndoState?.("Delete selected objects");

    const selectedNodes = selectedObjects.filter((obj) =>
      this.isEditNodeObject(obj)
    );

    const selectedFrames = selectedObjects.filter((obj) =>
      this.isEditFrameObject(obj)
    );

    const selectedAreas = selectedObjects.filter((obj) =>
      this.isEditAreaObject(obj)
    );

    const selectedDimensions = selectedObjects.filter((obj) =>
      this.isEditDimensionLineObject(obj)
    );

    let deletedNodes = 0;
    let deletedFrames = 0;
    let deletedAreas = 0;
    let deletedDimensions = 0;

    selectedNodes.forEach((node) => {
      const connectedFrames = Array.isArray(node.beams)
        ? [...node.beams]
        : [];

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

    const totalDeleted =
      deletedNodes +
      deletedFrames +
      deletedAreas +
      deletedDimensions;

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
      `🗑️ Eliminado: ${totalDeleted} objeto(s). Nodos: ${deletedNodes}, Líneas: ${deletedFrames}, Áreas: ${deletedAreas}`
    );
  },

  // =========================================
  // ======== EDIT: COPY / PASTE / CUT =======
  // =========================================

  getNextEditNodeId() {
    const maxId = Math.max(
      0,
      ...(this.nodes || []).map((node) => Number(node.id || 0))
    );

    const next = Math.max(Number(this.nextNodeId || 1), maxId + 1);
    this.nextNodeId = next + 1;

    return next;
  },

  getNextEditFrameId() {
    const maxId = Math.max(
      0,
      ...(this.shapes || []).map((frame) => Number(frame.id || 0))
    );

    const next = Math.max(Number(this.nextBeamId || 1), maxId + 1);
    this.nextBeamId = next + 1;

    return next;
  },

  getNextEditGenericId(list = []) {
    return Math.max(
      0,
      ...list.map((item) => Number(item?.id || 0))
    ) + 1;
  },

  getEditPasteOffset() {
    const view = this.viewSet?.[this.activeViewIndex];
    const step = 1;
    const count = Math.max(1, Number(this.editPasteCount || 1));

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
    const selectedObjects = this.getEditSelectedObjects?.({
      respectActiveView: true,
    }) || [];

    if (!selectedObjects.length) {
      return null;
    }

    const selectedNodes = selectedObjects.filter((obj) =>
      this.isEditNodeObject(obj)
    );

    const selectedFrames = selectedObjects.filter((obj) =>
      this.isEditFrameObject(obj)
    );

    const selectedAreas = selectedObjects.filter((obj) =>
      this.isEditAreaObject(obj)
    );

    const selectedDimensions = selectedObjects.filter((obj) =>
      this.isEditDimensionLineObject(obj)
    );

    const nodeSet = new Set(selectedNodes);

    // Si se copia una barra, también necesitamos copiar sus nodos extremos.
    selectedFrames.forEach((frame) => {
      if (frame.node1) nodeSet.add(frame.node1);
      if (frame.node2) nodeSet.add(frame.node2);
    });

    const nodeIds = new Set(
      [...nodeSet].map((node) => Number(node.id))
    );

    const frameIds = new Set(
      selectedFrames.map((frame) => Number(frame.id))
    );

    const areaIds = new Set(
      selectedAreas.map((area) => Number(area.id))
    );

    const dimensionIds = new Set(
      selectedDimensions.map((dim) => Number(dim.id))
    );

    const snapshot = this.createModelSnapshot?.("Clipboard") || null;

    if (!snapshot) {
      this.showMessage?.("No se pudo crear el portapapeles de Edit.", "warning");
      return null;
    }

    const clipboard = {
      type: "edit-clipboard",
      createdAt: new Date().toISOString(),

      nodes: (snapshot.nodes || []).filter((node) =>
        nodeIds.has(Number(node.id))
      ),

      frames: (snapshot.frames || []).filter((frame) =>
        frameIds.has(Number(frame.id))
      ),

      areas: (snapshot.areas || []).filter((area) =>
        areaIds.has(Number(area.id))
      ),

      dimensionLines: (snapshot.dimensionLines || []).filter((dim) =>
        dimensionIds.has(Number(dim.id))
      ),
    };

    clipboard.summary = {
      nodes: clipboard.nodes.length,
      frames: clipboard.frames.length,
      areas: clipboard.areas.length,
      dimensions: clipboard.dimensionLines.length,
      total:
        clipboard.nodes.length +
        clipboard.frames.length +
        clipboard.areas.length +
        clipboard.dimensionLines.length,
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

    console.log("📋 EDIT Copy:", clipboard);

    this.showMessage?.(
      `📋 Copiado: ${clipboard.summary.total} objeto(s). ` +
      `Nodos: ${clipboard.summary.nodes}, Líneas: ${clipboard.summary.frames}, Áreas: ${clipboard.summary.areas}`
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
      const p = this.offsetEditPoint(nodeData.position, offset);

      const newNode = new StructuralNode(
        {
          x: Number(p.x || 0),
          y: Number(p.y || 0),
        },
        this.getNextEditNodeId(),
        Number(p.z || 0)
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

      const newFrame = new Beam(
        frameData.E ?? this.globalE,
        frameData._A ?? this.globalA
      );

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
        newArea.points = newArea.points.map((point) =>
          this.offsetEditPoint(point, offset)
        );
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
        newDim.start = this.offsetEditPoint(newDim.start, offset);
      }

      if (newDim.end) {
        newDim.end = this.offsetEditPoint(newDim.end, offset);
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

    if (
      pastedNodes.length > 0 ||
      pastedFrames.length > 0 ||
      pastedAreas.length > 0
    ) {
      this.sync3D?.();
    }

    const total =
      pastedNodes.length +
      pastedFrames.length +
      pastedAreas.length +
      pastedDimensions.length;

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
      `Nodos: ${pastedNodes.length}, Líneas: ${pastedFrames.length}, Áreas: ${pastedAreas.length}`
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

    this.showMessage?.(
      `✂️ Cortado: ${clipboard.summary.total} objeto(s).`
    );
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

      case "joint-springs":
        this.openAssignPointSpringsDialog();
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

      analysisResultsAvailable:
        this.displayOptions.analysisResultsAvailable ?? false,

      lastAnalysisRun:
        this.displayOptions.lastAnalysisRun ?? null,
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

      case "show-member-forces":
        this.openShowMemberForcesDialog();
        break;

      default:
        this.showMessage?.(`Acción Display no reconocida: ${action}`, "warning");
        console.warn("Acción Display no reconocida:", action);
        break;
    }
  },

  // Identifica barras inclinadas o creadas entre diferentes vistas. Estas barras se mostrarán en 3D, pero no en el canvas 2D.
  // =====================================================
  is3DOnlyFrame(frame) {
    if (!frame) return false;

    if (
      frame.is3DOnlyFrame === true ||
      frame.isCrossViewFrame === true ||
      frame.showIn2D === false
    ) {
      return true;
    }

    const p1 = frame.node1?.position;
    const p2 = frame.node2?.position;

    if (!p1 || !p2) return false;

    const tol = 0.001;

    const dx = Math.abs(Number(p2.x || 0) - Number(p1.x || 0));
    const dy = Math.abs(Number(p2.y || 0) - Number(p1.y || 0));
    const dz = Math.abs(Number(p2.z || 0) - Number(p1.z || 0));

    // Barra inclinada espacial: cambia altura y también cambia X/Y.
    return dz > tol && (dx > tol || dy > tol);
  },

  // =====================================================
  // DISPLAY 2D > VALIDAR SI UNA BARRA SE DIBUJA
  // Planta: solo muestra barras del piso activo.
  // Elevación Y: muestra barras ubicadas en ese plano Y.
  // Elevación X: muestra barras ubicadas en ese plano X.
  // =====================================================
  shouldDrawFrameIn2D(frame) {
    if (!frame) return false;

    const p1 = frame.node1?.position;
    const p2 = frame.node2?.position;

    if (!p1 || !p2) return false;

    const tol = 0.001;
    const view = this.viewSet?.[this.activeViewIndex];

    // =====================================================
    // DISPLAY 2D > PLANTA
    // En planta solo se dibujan barras cuyos dos nodos están
    // en el Z del piso activo. Las barras entre pisos se ocultan.
    // =====================================================
    if (!view || view.type === "plan" || this.currentViewMode === "plan") {
      const activeZ = Number(
        view?.elevation ??
        this.currentZ ??
        this.stories?.[this.activeStory]?.elevation ??
        0
      );

      const z1 = Number(p1.z || 0);
      const z2 = Number(p2.z || 0);

      return (
        Math.abs(z1 - activeZ) <= tol &&
        Math.abs(z2 - activeZ) <= tol
      );
    }

    // =====================================================
    // DISPLAY 2D > ELEVACIÓN Y
    // Plano X-Z con Y fijo.
    // Aquí sí deben mostrarse barras verticales, inclinadas
    // o cruzadas siempre que estén sobre esa elevación.
    // =====================================================
    if (view.type === "elevation" && view.axis === "Y") {
      const fixedY = Number(
        view.elevation ??
        view.ordinate ??
        view.value ??
        view.coord ??
        0
      );

      const y1 = Number(p1.y || 0);
      const y2 = Number(p2.y || 0);

      return (
        Math.abs(y1 - fixedY) <= tol &&
        Math.abs(y2 - fixedY) <= tol
      );
    }

    // =====================================================
    // DISPLAY 2D > ELEVACIÓN X
    // Plano Y-Z con X fijo.
    // Aquí sí deben mostrarse barras verticales, inclinadas
    // o cruzadas siempre que estén sobre esa elevación.
    // =====================================================
    if (view.type === "elevation" && view.axis === "X") {
      const fixedX = Number(
        view.elevation ??
        view.ordinate ??
        view.value ??
        view.coord ??
        0
      );

      const x1 = Number(p1.x || 0);
      const x2 = Number(p2.x || 0);

      return (
        Math.abs(x1 - fixedX) <= tol &&
        Math.abs(x2 - fixedX) <= tol
      );
    }

    return true;
  },

  // Detecta barras visibles en la planta/elevación actual. Ignora barras 3D-only ocultas en 2D.
  // =====================================================
  closestBeamAtActiveView(searchPoint) {
    const view = this.viewSet?.[this.activeViewIndex];
    const tolerance = 0.05;
    let closest = null;
    let shortestDistance = 10;

    for (let i = 0; i < this.shapes.length; i++) {
      const beam = this.shapes[i];

      if (!beam?.node1 || !beam?.node2) continue;

      // =====================================================
      // SELECTION 2D > IGNORAR BARRAS 3D-ONLY
      // Si no se ve en 2D, tampoco debe activar cursor/hover.
      // =====================================================
      if (
        typeof this.shouldSelectFrameIn2D === "function" &&
        !this.shouldSelectFrameIn2D(beam)
      ) {
        continue;
      }

      const x1 = Number(beam.node1.position.x || 0);
      const y1 = Number(beam.node1.position.y || 0);
      const z1 = Number(beam.node1.position.z || 0);

      const x2 = Number(beam.node2.position.x || 0);
      const y2 = Number(beam.node2.position.y || 0);
      const z2 = Number(beam.node2.position.z || 0);

      let belongs = true;
      let p1 = null;
      let p2 = null;

      if (view?.type === "plan") {
        const viewZ = Number(view.elevation ?? 0);

        belongs =
          Math.abs(z1 - viewZ) <= tolerance &&
          Math.abs(z2 - viewZ) <= tolerance;

        p1 = this.grid.worldToScreen({ x: x1, y: y1 });
        p2 = this.grid.worldToScreen({ x: x2, y: y2 });
      }

      else if (view?.type === "elevation") {
        if (view.axis === "X") {
          // Plano Y-Z con X fijo
          const viewX = Number(view.value ?? 0);

          belongs =
            Math.abs(x1 - viewX) <= tolerance &&
            Math.abs(x2 - viewX) <= tolerance;

          p1 = this.grid.worldToScreen({ x: y1, y: z1 });
          p2 = this.grid.worldToScreen({ x: y2, y: z2 });
        }

        else if (view.axis === "Y") {
          // Plano X-Z con Y fijo
          const viewY = Number(view.value ?? 0);

          belongs =
            Math.abs(y1 - viewY) <= tolerance &&
            Math.abs(y2 - viewY) <= tolerance;

          p1 = this.grid.worldToScreen({ x: x1, y: z1 });
          p2 = this.grid.worldToScreen({ x: x2, y: z2 });
        }
      }

      if (!belongs || !p1 || !p2) continue;

      const dist = pointDistanceToSegment(searchPoint, p1, p2);

      if (dist < shortestDistance) {
        shortestDistance = dist;
        closest = beam;
      }
    }

    return closest;
  },

  // Versión general usada por cursor/hover. Ignora barras 3D-only ocultas en 2D.
  // =====================================================
  closestBeam(searchPoint) {
    const shortestDistance = 5;

    return this.shapes.find((s) => {
      if (!s?.node1?.position || !s?.node2?.position) return false;

      // =====================================================
      // SELECTION 2D > IGNORAR BARRAS 3D-ONLY
      // Evita que el cursor cambie sobre una barra que no se ve.
      // =====================================================
      if (
        typeof this.shouldSelectFrameIn2D === "function" &&
        !this.shouldSelectFrameIn2D(s)
      ) {
        return false;
      }

      // Si existe filtro de vista activa, también se respeta.
      if (
        typeof this.isObjectVisibleInActiveView === "function" &&
        !this.isObjectVisibleInActiveView(s)
      ) {
        return false;
      }

      const lineLength = pointDistance(
        this.grid.worldToScreen(s.node1.position),
        this.grid.worldToScreen(s.node2.position)
      );

      const d1 = pointDistance(
        this.grid.worldToScreen(s.node1.position),
        searchPoint
      );

      const d2 = pointDistance(
        this.grid.worldToScreen(s.node2.position),
        searchPoint
      );

      return (
        d1 + d2 >= lineLength - shortestDistance &&
        d1 + d2 <= lineLength + shortestDistance
      );
    });
  },

  // =====================================================
  // SELECTION 2D > VALIDAR SI UNA BARRA PUEDE SELECCIONARSE
  // Usa el mismo criterio visual del canvas 2D.
  // Si se ve en la vista activa, se puede seleccionar.
  // =====================================================
  shouldSelectFrameIn2D(frame) {
    if (!frame) return false;

    if (typeof this.shouldDrawFrameIn2D === "function") {
      return this.shouldDrawFrameIn2D(frame);
    }

    return true;
  },

  // =====================================================
  // SELECTION 2D > DETECTAR SI UNA BARRA ES 3D-ONLY. Identifica barras inclinadas/espaciales ocultas en canvas 2D.
  // =====================================================
  isFrame3DOnlyForSelection(frame) {
    if (!frame?.node1 || !frame?.node2) return false;

    if (
      frame.is3DOnlyFrame === true ||
      frame.isCrossViewFrame === true ||
      frame.showIn2D === false
    ) {
      return true;
    }

    if (typeof this.is3DOnlyFrame === "function") {
      return this.is3DOnlyFrame(frame);
    }

    const p1 = frame.node1.position;
    const p2 = frame.node2.position;

    if (!p1 || !p2) return false;

    const tol = 0.001;

    const dx = Math.abs(Number(p2.x || 0) - Number(p1.x || 0));
    const dy = Math.abs(Number(p2.y || 0) - Number(p1.y || 0));
    const dz = Math.abs(Number(p2.z || 0) - Number(p1.z || 0));

    return dz > tol && (dx > tol || dy > tol);
  },

  // =====================================================
  // SELECTION 2D > PROYECTAR NODO EN VISTA ACTIVA. Convierte un nodo 3D a coordenadas de pantalla según planta/elevación.
  // =====================================================
  projectNodeInActiveView(node) {
    if (!node?.position) return null;

    const view = this.viewSet?.[this.activeViewIndex];
    const p = node.position;

    const x = Number(p.x || 0);
    const y = Number(p.y || 0);
    const z = Number(p.z || 0);

    if (view?.type === "plan") {
      return this.grid.worldToScreen({ x, y });
    }

    if (view?.type === "elevation") {
      if (view.axis === "X") {
        // Elevación X: plano Y-Z
        return this.grid.worldToScreen({ x: y, y: z });
      }

      if (view.axis === "Y") {
        // Elevación Y: plano X-Z
        return this.grid.worldToScreen({ x, y: z });
      }
    }

    return this.grid.worldToScreen({ x, y });
  },

  // =====================================================
  // SELECTION 2D > BARRAS 3D-ONLY OCULTAS CONECTADAS A NODO
  // Solo devuelve barras que realmente NO se ven en la vista 2D activa.
  // Si la barra se ve en elevación, no debe pedir Alt + clic.
  // =====================================================
  get3DOnlyFramesConnectedToNode(node) {
    if (!node || !Array.isArray(this.shapes)) return [];

    return this.shapes.filter((frame) => {
      const connected =
        String(frame.node1?.id) === String(node.id) ||
        String(frame.node2?.id) === String(node.id);

      if (!connected) return false;

      const is3DOnly =
        frame.is3DOnlyFrame === true ||
        frame.isCrossViewFrame === true ||
        frame.showIn2D === false ||
        this.isFrame3DOnlyForSelection?.(frame) === true;

      if (!is3DOnly) return false;

      // Clave: si la barra se ve en la vista activa, no necesita Alt + clic.
      const visibleInCurrent2DView =
        this.shouldDrawFrameIn2D?.(frame) === true;

      return !visibleInCurrent2DView;
    });
  },

  // =====================================================
  // SELECTION 2D > BUSCAR EXTREMO DE BARRA 3D-ONLY
  // Permite seleccionar barras inclinadas desde sus nodos extremos. Se usa con Alt + clic para no bloquear la selección normal del nodo.
  // =====================================================
  closest3DOnlyFrameEndpointAtActiveView(searchPoint, radius = 12) {
    let closestHit = null;
    let shortestDistance = radius;

    if (!Array.isArray(this.nodes)) return null;

    for (const node of this.nodes) {
      if (!node?.position) continue;

      // El nodo debe pertenecer a la vista activa.
      if (
        typeof this.isNodeVisibleInActiveView === "function" &&
        !this.isNodeVisibleInActiveView(node)
      ) {
        continue;
      }

      const connected3DFrames = this.get3DOnlyFramesConnectedToNode(node);

      if (!connected3DFrames.length) continue;

      const screenPoint = this.projectNodeInActiveView(node);

      if (!screenPoint) continue;

      const distance = pointDistance(searchPoint, screenPoint);

      if (distance <= shortestDistance) {
        shortestDistance = distance;

        closestHit = {
          node,
          frames: connected3DFrames,
          screenPoint,
          distance,
        };
      }
    }

    return closestHit;
  },

  // =========================================
  // ========== MÉTODOS PARA DESIGN ==========
  // =========================================

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

      selectedCombos:
        steelFramePrevious.selectedCombos ||
        ["COMB1"],

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

      selectedCombos:
        steelJoistPrevious.selectedCombos ||
        ["COMB1"],

      defaultOverwrites: {
        designEnabled: true,
        markAsJoist: true,
        joistType: "K-Series",
        joistDepth: 0.45,
        joistSpacing: 1.20,
        useSimilarity: true,
        similarityTolerance: 0.05,
        deflectionCheck: true,
        ...(steelJoistPrevious.defaultOverwrites || {}),
      },
    };
  },

  getSelectedFramesForDesign() {
    if (typeof this.getSelectedFramesForAssign === "function") {
      return this.getSelectedFramesForAssign();
    }

    const selectedObjects = this.getSelectedObjects?.() || [];

    return selectedObjects.filter((obj) => {
      if (!obj) return false;

      const hasFrameGeometry = obj.node1 && obj.node2;

      const type = String(
        obj.elementType ||
        obj.type ||
        obj.objectType ||
        obj.constructor?.name ||
        ""
      ).toLowerCase();

      return (
        hasFrameGeometry ||
        type === "beam" ||
        type === "column" ||
        type === "brace" ||
        type === "frame" ||
        type === "line" ||
        type === "secondary-beam" ||
        type === "secondarybeam"
      );
    });
  },

  getSelectedJoistsForDesign() {
    const selectedFrames = this.getSelectedFramesForDesign();

    return selectedFrames.filter((frame) => {
      const type = String(
        frame.elementType ||
        frame.type ||
        frame.objectType ||
        ""
      ).toLowerCase();

      return (
        type.includes("joist") ||
        type.includes("secondary") ||
        frame.isSteelJoist === true ||
        frame.designType === "steel-joist" ||
        true
      );
    });
  },

  cloneDesignData(data) {
    return JSON.parse(JSON.stringify(data || {}));
  },

  sanitizeDesignResult(result) {
    if (!result) return null;

    const {
      allCombos,
      ...baseResult
    } = result;

    return {
      ...baseResult,

      allCombos: Array.isArray(allCombos)
        ? allCombos.map((combo) => {
          const {
            allCombos: _ignoredAllCombos,
            ...cleanCombo
          } = combo;

          return { ...cleanCombo };
        })
        : [],
    };
  },

  getDefaultDesignCombos() {
    return [
      { id: "COMB1", name: "COMB1", expression: "1.4CM + 1.7CV" },
      { id: "COMB2", name: "COMB2", expression: "1.25CM + 1.25CV + 1.0CVV+" },
      { id: "COMB3", name: "COMB3", expression: "0.9CM + 1.0CVV-" },
    ];
  },

  normalizeDesignCombo(combo, index = 0) {
    const id =
      combo.id ||
      combo.name ||
      combo.comboName ||
      combo.nombre ||
      `COMBO_${index + 1}`;

    const name =
      combo.name ||
      combo.comboName ||
      combo.nombre ||
      String(id);

    const expression =
      combo.expression ||
      combo.formula ||
      combo.descripcion ||
      combo.description ||
      "";

    return {
      ...combo,
      id,
      name,
      expression,
    };
  },

  getAvailableDesignCombos() {
    let combos = [];

    if (Array.isArray(this.loadCombinations?.combinations)) {
      combos = this.loadCombinations.combinations;
    } else if (Array.isArray(this.loadCombinations?.items)) {
      combos = this.loadCombinations.items;
    }

    if (!combos.length) {
      combos = this.getDefaultDesignCombos();
    }

    return combos.map((combo, index) =>
      this.normalizeDesignCombo(combo, index)
    );
  },

  buildDesignComboRows(combos, selectedCombos = []) {
    return combos.map((combo) => {
      const checked = selectedCombos.includes(String(combo.id)) ? "checked" : "";

      return `
      <label style="display:grid; grid-template-columns: 34px 110px 1fr; gap:8px; align-items:center; padding:7px; border-bottom:1px solid #444;">
        <input 
          type="checkbox" 
          class="design-combo-checkbox" 
          value="${combo.id}" 
          ${checked}
        >

        <span style="font-weight:bold;">${combo.name}</span>

        <span style="font-size:12px; color:#aaa;">
          ${combo.expression || "Sin expresión"}
        </span>
      </label>
    `;
    }).join("");
  },

  readSelectedDesignCombosFromDialog() {
    const selectedCombos = Array.from(
      document.querySelectorAll(".design-combo-checkbox:checked")
    ).map((item) => item.value);

    if (!selectedCombos.length) {
      Swal.showValidationMessage("Selecciona al menos una combinación de diseño.");
      return false;
    }

    return selectedCombos;
  },

  async openSteelFrameSelectComboDialog() {
    this.ensureDesignOptions();

    const combos = this.getAvailableDesignCombos();
    const selectedCombos = this.designOptions.steelFrame.selectedCombos || [];

    const result = await Swal.fire({
      title: "Steel Frame Design - Select Design Combo",
      width: 720,
      html: `
      <div style="text-align:left; font-size:13px;">
        <p style="margin-bottom:12px;">
          Selecciona las combinaciones de carga que se usarán para el diseño/verificación de elementos Steel Frame.
        </p>

        <div style="border:1px solid #555; border-radius:6px; max-height:320px; overflow:auto;">
          <div style="display:grid; grid-template-columns: 34px 110px 1fr; gap:8px; padding:7px; background:#1f2937; color:white; font-weight:bold;">
            <span></span>
            <span>Combo</span>
            <span>Expresión</span>
          </div>

          ${this.buildDesignComboRows(combos, selectedCombos)}
        </div>

        <div style="margin-top:12px; padding:10px; border:1px solid #555; border-radius:6px; color:#777; font-size:12px;">
          Esta selección no ejecuta el diseño todavía. Solo define qué combinaciones usará 
          Start Design/Check of Structure.
        </div>
      </div>
    `,
      showCancelButton: true,
      confirmButtonText: "Aceptar",
      cancelButtonText: "Cancelar",
      preConfirm: () => {
        return this.readSelectedDesignCombosFromDialog();
      },
    });

    if (!result.isConfirmed || !result.value) return;

    this.designOptions.steelFrame.selectedCombos = result.value;

    this.showMessage?.(
      `Steel Frame Design: ${result.value.length} combinación(es) seleccionada(s).`
    );

    console.log("✅ Steel Frame Design Combos:", this.designOptions.steelFrame.selectedCombos);
  },

  async openSteelFrameOverwritesDialog() {
    this.ensureDesignOptions();

    const selectedFrames = this.getSelectedFramesForDesign();

    if (!selectedFrames.length) {
      this.showMessage?.(
        "Selecciona primero uno o más elementos Frame / Line.",
        "warning"
      );
      return;
    }

    const current =
      selectedFrames[0]?.steelFrameDesignOverwrites ||
      selectedFrames[0]?.designOverwrites?.steelFrame ||
      this.designOptions.steelFrame.defaultOverwrites;

    const result = await Swal.fire({
      title: "Steel Frame Design - View/Revise Overwrites",
      width: 720,
      html: `
      <div style="text-align:left; font-size:13px;">

        <p style="margin-bottom:12px;">
          Define parámetros especiales de diseño para los elementos Steel Frame seleccionados.
        </p>

        <label style="display:flex; align-items:center; gap:8px; margin-bottom:12px;">
          <input id="sf-design-enabled" type="checkbox" ${current.designEnabled !== false ? "checked" : ""}>
          Design this frame object
        </label>

        <table style="width:100%; border-collapse:collapse; font-size:12px;">
          <tbody>
            <tr>
              <td style="border:1px solid #555; padding:6px;">K Factor Major</td>
              <td style="border:1px solid #555; padding:6px;">
                <input id="sf-k-major" type="number" step="0.01" value="${current.kFactorMajor ?? 1}" style="width:100%; padding:5px;">
              </td>
            </tr>

            <tr>
              <td style="border:1px solid #555; padding:6px;">K Factor Minor</td>
              <td style="border:1px solid #555; padding:6px;">
                <input id="sf-k-minor" type="number" step="0.01" value="${current.kFactorMinor ?? 1}" style="width:100%; padding:5px;">
              </td>
            </tr>

            <tr>
              <td style="border:1px solid #555; padding:6px;">Unbraced Length Major</td>
              <td style="border:1px solid #555; padding:6px;">
                <input id="sf-lb-major" type="number" step="0.001" value="${current.unbracedLengthMajor ?? 0}" style="width:100%; padding:5px;">
              </td>
            </tr>

            <tr>
              <td style="border:1px solid #555; padding:6px;">Unbraced Length Minor</td>
              <td style="border:1px solid #555; padding:6px;">
                <input id="sf-lb-minor" type="number" step="0.001" value="${current.unbracedLengthMinor ?? 0}" style="width:100%; padding:5px;">
              </td>
            </tr>

            <tr>
              <td style="border:1px solid #555; padding:6px;">Cb Factor</td>
              <td style="border:1px solid #555; padding:6px;">
                <input id="sf-cb" type="number" step="0.01" value="${current.cbFactor ?? 1}" style="width:100%; padding:5px;">
              </td>
            </tr>

            <tr>
              <td style="border:1px solid #555; padding:6px;">Effective Length Factor</td>
              <td style="border:1px solid #555; padding:6px;">
                <input id="sf-effective-length" type="number" step="0.01" value="${current.effectiveLengthFactor ?? 1}" style="width:100%; padding:5px;">
              </td>
            </tr>
          </tbody>
        </table>

        <label style="display:flex; align-items:center; gap:8px; margin-top:12px;">
          <input id="sf-deflection-check" type="checkbox" ${current.deflectionCheck !== false ? "checked" : ""}>
          Check Deflection
        </label>

        <div style="margin-top:12px; padding:10px; border:1px solid #555; border-radius:6px; color:#777; font-size:12px;">
          Elementos seleccionados: <b>${selectedFrames.length}</b><br>
          Estos valores se guardan en cada Frame seleccionado y serán usados luego por Start Design/Check.
        </div>
      </div>
    `,
      showCancelButton: true,
      confirmButtonText: "Aplicar",
      cancelButtonText: "Cancelar",
      preConfirm: () => {
        return this.readSteelFrameOverwritesFromDialog();
      },
    });

    if (!result.isConfirmed || !result.value) return;

    this.assignSteelFrameOverwritesToSelected(result.value);
  },

  readSteelFrameOverwritesFromDialog() {
    const readNumber = (id, fallback = 0) => {
      const value = Number(document.getElementById(id)?.value ?? fallback);
      return Number.isFinite(value) ? value : fallback;
    };

    return {
      designEnabled:
        document.getElementById("sf-design-enabled")?.checked === true,

      kFactorMajor: readNumber("sf-k-major", 1),
      kFactorMinor: readNumber("sf-k-minor", 1),

      unbracedLengthMajor: readNumber("sf-lb-major", 0),
      unbracedLengthMinor: readNumber("sf-lb-minor", 0),

      cbFactor: readNumber("sf-cb", 1),
      effectiveLengthFactor: readNumber("sf-effective-length", 1),

      deflectionCheck:
        document.getElementById("sf-deflection-check")?.checked === true,
    };
  },

  assignSteelFrameOverwritesToSelected(overwrites) {
    const selectedFrames = this.getSelectedFramesForDesign();

    if (!selectedFrames.length) {
      this.showMessage?.("No hay elementos Steel Frame seleccionados.", "warning");
      return;
    }

    selectedFrames.forEach((frame) => {
      if (!frame.designOverwrites) {
        frame.designOverwrites = {};
      }

      frame.designOverwrites.steelFrame = this.cloneDesignData(overwrites);
      frame.steelFrameDesignOverwrites = this.cloneDesignData(overwrites);

      frame.designType = "steel-frame";
      frame.hasSteelFrameDesignOverwrites = true;

      frame.assignment = {
        ...(frame.assignment || {}),
        design: {
          ...(frame.assignment?.design || {}),
          steelFrameOverwrites: this.cloneDesignData(overwrites),
        },
      };
    });

    this.redraw?.();

    this.showMessage?.(
      `Steel Frame Overwrites asignados a ${selectedFrames.length} elemento(s).`
    );

    console.log("✅ Steel Frame Overwrites:", {
      overwrites,
      selectedFrames,
    });
  },

  async startSteelFrameDesignCheck() {
    this.ensureDesignOptions();

    const frames = this.getFramesForSteelFrameDesign();
    const combos = this.designOptions.steelFrame.selectedCombos || ["COMB1"];

    if (!frames.length) {
      this.showMessage?.(
        "No hay elementos Steel Frame disponibles para diseñar/verificar.",
        "warning"
      );
      return;
    }

    const result = await Swal.fire({
      title: "Start Design/Check of Structure",
      width: 560,
      html: `
      <div style="text-align:left; font-size:13px;">
        <p>
          Se verificará el diseño de los elementos Steel Frame disponibles.
        </p>

        <div style="margin-top:12px; padding:10px; border:1px solid #555; border-radius:6px;">
          Elementos a verificar: <b>${frames.length}</b><br>
          Combinaciones: <b>${combos.join(", ")}</b>
        </div>

        <p style="margin-top:12px; color:#777; font-size:12px;">
          Versión inicial: se calcula un ratio simplificado usando fuerza axial existente o cargas asignadas.
        </p>
      </div>
    `,
      showCancelButton: true,
      confirmButtonText: "Iniciar",
      cancelButtonText: "Cancelar",
    });

    if (!result.isConfirmed) return;

    let okCount = 0;
    let ngCount = 0;

    frames.forEach((frame) => {
      const resultsByCombo = combos.map((comboName) =>
        this.calculateSteelFrameDesignResult(frame, comboName)
      );

      const controllingResult = resultsByCombo.reduce((max, item) => {
        return item.ratio > max.ratio ? item : max;
      }, resultsByCombo[0]);

      controllingResult.allCombos = resultsByCombo;

      this.saveSteelFrameDesignResult(frame, controllingResult);

      if (controllingResult.status === "OK") {
        okCount++;
      } else {
        ngCount++;
      }
    });

    this.designOptions.steelFrame.lastRun = {
      checkedAt: new Date().toISOString(),
      total: frames.length,
      ok: okCount,
      ng: ngCount,
      combos,
    };

    this.redraw?.();
    // No es necesario sync3D aquí porque no se modifican nodos, barras ni geometría 3D.

    this.showMessage?.(
      `Steel Frame Design completado: ${okCount} OK / ${ngCount} NG.`
    );

    console.log("✅ Steel Frame Design Results:", {
      frames,
      summary: this.designOptions.steelFrame.lastRun,
    });
  },

  calculateSteelJoistDesignResult(joist, comboName = "COMB1", similarityGroup = null) {
    const overwrites =
      joist.steelJoistDesignOverwrites ||
      joist.designOverwrites?.steelJoist ||
      this.designOptions?.steelJoist?.defaultOverwrites ||
      {};

    const length = this.getFrameLengthForDesign(joist);
    const demand = this.getFrameAxialDemandForDesign(joist);

    const depth = Number(overwrites.joistDepth || 0.45);
    const spacing = Number(overwrites.joistSpacing || 1.2);

    // Capacidad simplificada referencial para joist.
    const capacity = Math.max(depth * spacing * 120, 0.001);

    const ratio = demand / capacity;

    return {
      type: "steel-joist",
      combo: comboName,
      joistType: overwrites.joistType || "K-Series",
      length,
      depth,
      spacing,
      demand,
      capacity,
      ratio,
      status: ratio <= 1 ? "OK" : "NG",
      similarityGroup,
      checkedAt: new Date().toISOString(),
    };
  },

  saveSteelJoistDesignResult(joist, result) {
    if (!joist.designResults) {
      joist.designResults = {};
    }

    const cleanResult = this.sanitizeDesignResult(result);

    joist.designResults.steelJoist = this.cloneDesignData(cleanResult);
    joist.steelJoistDesignResult = this.cloneDesignData(cleanResult);

    joist.designType = "steel-joist";
    joist.isSteelJoist = true;

    joist.assignment = {
      ...(joist.assignment || {}),
      design: {
        ...(joist.assignment?.design || {}),
        steelJoistResult: this.cloneDesignData(cleanResult),
      },
    };
  },

  getJoistSimilarityKey(joist) {
    const length = this.getFrameLengthForDesign(joist);
    const roundedLength = Math.round(length * 10) / 10;

    const overwrites =
      joist.steelJoistDesignOverwrites ||
      joist.designOverwrites?.steelJoist ||
      this.designOptions?.steelJoist?.defaultOverwrites ||
      {};

    const type = overwrites.joistType || "K-Series";
    const depth = Number(overwrites.joistDepth || 0.45).toFixed(2);

    return `${type}_L${roundedLength}_D${depth}`;
  },

  groupJoistsBySimilarity(joists = []) {
    const groups = {};

    joists.forEach((joist) => {
      const key = this.getJoistSimilarityKey(joist);

      if (!groups[key]) {
        groups[key] = [];
      }

      groups[key].push(joist);
    });

    return groups;
  },

  async openSteelFrameDisplayDesignInfoDialog() {
    this.ensureDesignOptions();

    const current = this.designOptions.steelFrame.displayInfo;

    const designedFrames = this.getAllFramesForDesign()
      .filter((frame) => frame.steelFrameDesignResult);

    const result = await Swal.fire({
      title: "Steel Frame Design - Display Design Info",
      width: 560,
      html: `
      <div style="text-align:left; font-size:13px;">
        <p style="margin-bottom:12px;">
          Controla la visualización de resultados de diseño Steel Frame.
        </p>

        <label style="display:flex; align-items:center; gap:8px; margin-bottom:12px;">
          <input id="sf-display-show" type="checkbox" ${current.show ? "checked" : ""}>
          Show Steel Frame Design Info
        </label>

        <label style="display:block; margin-bottom:5px;">Design Info Type</label>
        <select id="sf-display-info-type" style="width:100%; padding:7px; margin-bottom:12px;">
          <option value="ratio">Ratio</option>
          <option value="status">Status OK / NG</option>
          <option value="combo">Controlling Combo</option>
          <option value="section">Section</option>
          <option value="demand-capacity">Demand / Capacity</option>
        </select>

        <label style="display:flex; align-items:center; gap:8px; margin-bottom:12px;">
          <input id="sf-display-values" type="checkbox" ${current.showValues !== false ? "checked" : ""}>
          Show Values
        </label>

        <div style="margin-top:12px; padding:10px; border:1px solid #555; border-radius:6px; color:#777; font-size:12px;">
          Elementos con resultado Steel Frame: <b>${designedFrames.length}</b><br>
          Si no hay resultados, primero ejecuta Start Design/Check of Structure.
        </div>
      </div>
    `,
      showCancelButton: true,
      confirmButtonText: "Aplicar",
      cancelButtonText: "Cancelar",

      didOpen: () => {
        const select = document.getElementById("sf-display-info-type");
        if (select) select.value = current.infoType || "ratio";
      },

      preConfirm: () => {
        return {
          show: document.getElementById("sf-display-show")?.checked === true,
          infoType: document.getElementById("sf-display-info-type")?.value || "ratio",
          showValues: document.getElementById("sf-display-values")?.checked === true,
        };
      },
    });

    if (!result.isConfirmed || !result.value) return;

    this.designOptions.steelFrame.displayInfo = result.value;

    if (result.value.show) {
      this.designOptions.steelJoist.displayInfo.show = false;
    }

    this.redraw?.();
    // No llamamos sync3D aquí porque Display Design Info solo dibuja etiquetas en el canvas 2D.

    this.showMessage?.(
      result.value.show
        ? `Mostrando Steel Frame Design Info: ${result.value.infoType}`
        : "Steel Frame Design Info oculto."
    );
  },

  async openSteelJoistSelectComboDialog() {
    this.ensureDesignOptions();

    const combos = this.getAvailableDesignCombos();
    const selectedCombos = this.designOptions.steelJoist.selectedCombos || [];

    const result = await Swal.fire({
      title: "Steel Joist Design - Select Design Combo",
      width: 720,
      html: `
      <div style="text-align:left; font-size:13px;">
        <p style="margin-bottom:12px;">
          Selecciona las combinaciones de carga que se usarán para el diseño/verificación de joists metálicos.
        </p>

        <div style="border:1px solid #555; border-radius:6px; max-height:320px; overflow:auto;">
          <div style="display:grid; grid-template-columns: 34px 110px 1fr; gap:8px; padding:7px; background:#1f2937; color:white; font-weight:bold;">
            <span></span>
            <span>Combo</span>
            <span>Expresión</span>
          </div>

          ${this.buildDesignComboRows(combos, selectedCombos)}
        </div>

        <div style="margin-top:12px; padding:10px; border:1px solid #555; border-radius:6px; color:#777; font-size:12px;">
          Esta selección será usada por Start Design Using Similarity y Start Design Without Similarity.
        </div>
      </div>
    `,
      showCancelButton: true,
      confirmButtonText: "Aceptar",
      cancelButtonText: "Cancelar",
      preConfirm: () => {
        return this.readSelectedDesignCombosFromDialog();
      },
    });

    if (!result.isConfirmed || !result.value) return;

    this.designOptions.steelJoist.selectedCombos = result.value;

    this.showMessage?.(
      `Steel Joist Design: ${result.value.length} combinación(es) seleccionada(s).`
    );

    console.log("✅ Steel Joist Design Combos:", this.designOptions.steelJoist.selectedCombos);
  },

  async openSteelJoistOverwritesDialog() {
    this.ensureDesignOptions();

    const selectedJoists = this.getSelectedJoistsForDesign();

    if (!selectedJoists.length) {
      this.showMessage?.(
        "Selecciona primero uno o más elementos Frame / Line para tratarlos como Steel Joist.",
        "warning"
      );
      return;
    }

    const current =
      selectedJoists[0]?.steelJoistDesignOverwrites ||
      selectedJoists[0]?.designOverwrites?.steelJoist ||
      this.designOptions.steelJoist.defaultOverwrites;

    const result = await Swal.fire({
      title: "Steel Joist Design - View/Revise Overwrites",
      width: 720,
      html: `
      <div style="text-align:left; font-size:13px;">

        <p style="margin-bottom:12px;">
          Define parámetros especiales de diseño para los elementos Steel Joist seleccionados.
        </p>

        <label style="display:flex; align-items:center; gap:8px; margin-bottom:12px;">
          <input id="sj-design-enabled" type="checkbox" ${current.designEnabled !== false ? "checked" : ""}>
          Design this joist object
        </label>

        <label style="display:flex; align-items:center; gap:8px; margin-bottom:12px;">
          <input id="sj-mark-as-joist" type="checkbox" ${current.markAsJoist !== false ? "checked" : ""}>
          Mark selected frames as Steel Joist
        </label>

        <div style="display:grid; grid-template-columns: 1fr 1fr; gap:12px; margin-bottom:12px;">
          <div>
            <label style="display:block; margin-bottom:5px;">Joist Type</label>
            <select id="sj-type" style="width:100%; padding:7px;">
              <option value="K-Series">K-Series</option>
              <option value="LH-Series">LH-Series</option>
              <option value="DLH-Series">DLH-Series</option>
              <option value="Custom">Custom</option>
            </select>
          </div>

          <div>
            <label style="display:block; margin-bottom:5px;">Joist Depth</label>
            <input id="sj-depth" type="number" step="0.001" value="${current.joistDepth ?? 0.45}" style="width:100%; padding:7px;">
          </div>
        </div>

        <table style="width:100%; border-collapse:collapse; font-size:12px;">
          <tbody>
            <tr>
              <td style="border:1px solid #555; padding:6px;">Joist Spacing</td>
              <td style="border:1px solid #555; padding:6px;">
                <input id="sj-spacing" type="number" step="0.001" value="${current.joistSpacing ?? 1.2}" style="width:100%; padding:5px;">
              </td>
            </tr>

            <tr>
              <td style="border:1px solid #555; padding:6px;">Similarity Tolerance</td>
              <td style="border:1px solid #555; padding:6px;">
                <input id="sj-similarity-tolerance" type="number" step="0.01" value="${current.similarityTolerance ?? 0.05}" style="width:100%; padding:5px;">
              </td>
            </tr>
          </tbody>
        </table>

        <label style="display:flex; align-items:center; gap:8px; margin-top:12px;">
          <input id="sj-use-similarity" type="checkbox" ${current.useSimilarity !== false ? "checked" : ""}>
          Allow Similarity Design
        </label>

        <label style="display:flex; align-items:center; gap:8px; margin-top:8px;">
          <input id="sj-deflection-check" type="checkbox" ${current.deflectionCheck !== false ? "checked" : ""}>
          Check Deflection
        </label>

        <div style="margin-top:12px; padding:10px; border:1px solid #555; border-radius:6px; color:#777; font-size:12px;">
          Elementos seleccionados: <b>${selectedJoists.length}</b><br>
          En esta versión inicial, estos datos permiten diferenciar los joists de las vigas normales.
        </div>
      </div>
    `,
      showCancelButton: true,
      confirmButtonText: "Aplicar",
      cancelButtonText: "Cancelar",

      didOpen: () => {
        const typeSelect = document.getElementById("sj-type");
        if (typeSelect) {
          typeSelect.value = current.joistType || "K-Series";
        }
      },

      preConfirm: () => {
        return this.readSteelJoistOverwritesFromDialog();
      },
    });

    if (!result.isConfirmed || !result.value) return;

    this.assignSteelJoistOverwritesToSelected(result.value);
  },

  readSteelJoistOverwritesFromDialog() {
    const readNumber = (id, fallback = 0) => {
      const value = Number(document.getElementById(id)?.value ?? fallback);
      return Number.isFinite(value) ? value : fallback;
    };

    return {
      designEnabled:
        document.getElementById("sj-design-enabled")?.checked === true,

      markAsJoist:
        document.getElementById("sj-mark-as-joist")?.checked === true,

      joistType:
        document.getElementById("sj-type")?.value || "K-Series",

      joistDepth:
        readNumber("sj-depth", 0.45),

      joistSpacing:
        readNumber("sj-spacing", 1.2),

      useSimilarity:
        document.getElementById("sj-use-similarity")?.checked === true,

      similarityTolerance:
        readNumber("sj-similarity-tolerance", 0.05),

      deflectionCheck:
        document.getElementById("sj-deflection-check")?.checked === true,
    };
  },

  assignSteelJoistOverwritesToSelected(overwrites) {
    const selectedJoists = this.getSelectedJoistsForDesign();

    if (!selectedJoists.length) {
      this.showMessage?.("No hay elementos Steel Joist seleccionados.", "warning");
      return;
    }

    selectedJoists.forEach((joist) => {
      if (!joist.designOverwrites) {
        joist.designOverwrites = {};
      }

      joist.designOverwrites.steelJoist = this.cloneDesignData(overwrites);
      joist.steelJoistDesignOverwrites = this.cloneDesignData(overwrites);

      joist.designType = "steel-joist";

      if (overwrites.markAsJoist) {
        joist.isSteelJoist = true;
        joist.elementType = joist.elementType || "steel-joist";
      }

      joist.hasSteelJoistDesignOverwrites = true;

      joist.assignment = {
        ...(joist.assignment || {}),
        design: {
          ...(joist.assignment?.design || {}),
          steelJoistOverwrites: this.cloneDesignData(overwrites),
        },
      };
    });

    this.redraw?.();

    this.showMessage?.(
      `Steel Joist Overwrites asignados a ${selectedJoists.length} elemento(s).`
    );

    console.log("✅ Steel Joist Overwrites:", {
      overwrites,
      selectedJoists,
    });
  },

  async startSteelJoistDesignUsingSimilarity() {
    this.ensureDesignOptions();

    const joists = this.getFramesForSteelJoistDesign();
    const combos = this.designOptions.steelJoist.selectedCombos || ["COMB1"];

    if (!joists.length) {
      this.showMessage?.(
        "No hay elementos Steel Joist disponibles. Selecciona frames y usa View/Revise Overwrites para marcarlos como joists.",
        "warning"
      );
      return;
    }

    const groups = this.groupJoistsBySimilarity(joists);
    const groupCount = Object.keys(groups).length;

    const result = await Swal.fire({
      title: "Start Design Using Similarity",
      width: 560,
      html: `
      <div style="text-align:left; font-size:13px;">
        <p>
          Se diseñarán joists agrupados por similitud.
        </p>

        <div style="margin-top:12px; padding:10px; border:1px solid #555; border-radius:6px;">
          Joists: <b>${joists.length}</b><br>
          Grupos similares: <b>${groupCount}</b><br>
          Combinaciones: <b>${combos.join(", ")}</b>
        </div>
      </div>
    `,
      showCancelButton: true,
      confirmButtonText: "Iniciar",
      cancelButtonText: "Cancelar",
    });

    if (!result.isConfirmed) return;

    let okCount = 0;
    let ngCount = 0;

    Object.entries(groups).forEach(([groupKey, groupJoists]) => {
      groupJoists.forEach((joist) => {
        const resultsByCombo = combos.map((comboName) =>
          this.calculateSteelJoistDesignResult(joist, comboName, groupKey)
        );

        const controllingResult = resultsByCombo.reduce((max, item) => {
          return item.ratio > max.ratio ? item : max;
        }, resultsByCombo[0]);

        controllingResult.allCombos = resultsByCombo;
        controllingResult.designMode = "using-similarity";

        this.saveSteelJoistDesignResult(joist, controllingResult);

        if (controllingResult.status === "OK") {
          okCount++;
        } else {
          ngCount++;
        }
      });
    });

    this.designOptions.steelJoist.lastRun = {
      checkedAt: new Date().toISOString(),
      mode: "using-similarity",
      total: joists.length,
      groups: groupCount,
      ok: okCount,
      ng: ngCount,
      combos,
    };

    this.redraw?.();
    // No es necesario sync3D aquí porque no se modifican nodos, barras ni geometría 3D.

    this.showMessage?.(
      `Steel Joist Design con similitud completado: ${okCount} OK / ${ngCount} NG.`
    );

    console.log("✅ Steel Joist Design Using Similarity:", {
      joists,
      groups,
      summary: this.designOptions.steelJoist.lastRun,
    });
  },

  async startSteelJoistDesignWithoutSimilarity() {
    this.ensureDesignOptions();

    const joists = this.getFramesForSteelJoistDesign();
    const combos = this.designOptions.steelJoist.selectedCombos || ["COMB1"];

    if (!joists.length) {
      this.showMessage?.(
        "No hay elementos Steel Joist disponibles. Selecciona frames y usa View/Revise Overwrites para marcarlos como joists.",
        "warning"
      );
      return;
    }

    const result = await Swal.fire({
      title: "Start Design Without Similarity",
      width: 560,
      html: `
      <div style="text-align:left; font-size:13px;">
        <p>
          Se diseñará cada joist individualmente, sin agrupar por similitud.
        </p>

        <div style="margin-top:12px; padding:10px; border:1px solid #555; border-radius:6px;">
          Joists a verificar: <b>${joists.length}</b><br>
          Combinaciones: <b>${combos.join(", ")}</b>
        </div>
      </div>
    `,
      showCancelButton: true,
      confirmButtonText: "Iniciar",
      cancelButtonText: "Cancelar",
    });

    if (!result.isConfirmed) return;

    let okCount = 0;
    let ngCount = 0;

    joists.forEach((joist) => {
      const resultsByCombo = combos.map((comboName) =>
        this.calculateSteelJoistDesignResult(joist, comboName, null)
      );

      const controllingResult = resultsByCombo.reduce((max, item) => {
        return item.ratio > max.ratio ? item : max;
      }, resultsByCombo[0]);

      controllingResult.allCombos = resultsByCombo;
      controllingResult.designMode = "without-similarity";

      this.saveSteelJoistDesignResult(joist, controllingResult);

      if (controllingResult.status === "OK") {
        okCount++;
      } else {
        ngCount++;
      }
    });

    this.designOptions.steelJoist.lastRun = {
      checkedAt: new Date().toISOString(),
      mode: "without-similarity",
      total: joists.length,
      ok: okCount,
      ng: ngCount,
      combos,
    };

    this.redraw?.();
    // No es necesario sync3D aquí porque no se modifican nodos, barras ni geometría 3D.

    this.showMessage?.(
      `Steel Joist Design sin similitud completado: ${okCount} OK / ${ngCount} NG.`
    );

    console.log("✅ Steel Joist Design Without Similarity:", {
      joists,
      summary: this.designOptions.steelJoist.lastRun,
    });
  },

  async openSteelJoistDisplayDesignInfoDialog() {
    this.ensureDesignOptions();

    const current = this.designOptions.steelJoist.displayInfo;

    const designedJoists = this.getAllFramesForDesign()
      .filter((frame) => frame.steelJoistDesignResult);

    const result = await Swal.fire({
      title: "Steel Joist Design - Display Design Info",
      width: 560,
      html: `
      <div style="text-align:left; font-size:13px;">
        <p style="margin-bottom:12px;">
          Controla la visualización de resultados de diseño Steel Joist.
        </p>

        <label style="display:flex; align-items:center; gap:8px; margin-bottom:12px;">
          <input id="sj-display-show" type="checkbox" ${current.show ? "checked" : ""}>
          Show Steel Joist Design Info
        </label>

        <label style="display:block; margin-bottom:5px;">Design Info Type</label>
        <select id="sj-display-info-type" style="width:100%; padding:7px; margin-bottom:12px;">
          <option value="ratio">Ratio</option>
          <option value="status">Status OK / NG</option>
          <option value="combo">Controlling Combo</option>
          <option value="joist-type">Joist Type</option>
          <option value="similarity-group">Similarity Group</option>
          <option value="demand-capacity">Demand / Capacity</option>
        </select>

        <label style="display:flex; align-items:center; gap:8px; margin-bottom:12px;">
          <input id="sj-display-values" type="checkbox" ${current.showValues !== false ? "checked" : ""}>
          Show Values
        </label>

        <div style="margin-top:12px; padding:10px; border:1px solid #555; border-radius:6px; color:#777; font-size:12px;">
          Elementos con resultado Steel Joist: <b>${designedJoists.length}</b><br>
          Si no hay resultados, primero ejecuta Start Design Using Similarity o Without Similarity.
        </div>
      </div>
    `,
      showCancelButton: true,
      confirmButtonText: "Aplicar",
      cancelButtonText: "Cancelar",

      didOpen: () => {
        const select = document.getElementById("sj-display-info-type");
        if (select) select.value = current.infoType || "ratio";
      },

      preConfirm: () => {
        return {
          show: document.getElementById("sj-display-show")?.checked === true,
          infoType: document.getElementById("sj-display-info-type")?.value || "ratio",
          showValues: document.getElementById("sj-display-values")?.checked === true,
        };
      },
    });

    if (!result.isConfirmed || !result.value) return;

    this.designOptions.steelJoist.displayInfo = result.value;

    if (result.value.show) {
      this.designOptions.steelFrame.displayInfo.show = false;
    }

    this.redraw?.();
    // No llamamos sync3D aquí porque Display Design Info solo dibuja etiquetas en el canvas 2D.

    this.showMessage?.(
      result.value.show
        ? `Mostrando Steel Joist Design Info: ${result.value.infoType}`
        : "Steel Joist Design Info oculto."
    );
  },

  getAllFramesForDesign() {
    return (this.shapes || []).filter((frame) => {
      return frame?.node1 && frame?.node2;
    });
  },

  getFramesForSteelFrameDesign() {
    const selectedFrames = this.getSelectedFramesForDesign?.() || [];

    const sourceFrames = selectedFrames.length
      ? selectedFrames
      : this.getAllFramesForDesign();

    return sourceFrames.filter((frame) => {
      const overwrites =
        frame.steelFrameDesignOverwrites ||
        frame.designOverwrites?.steelFrame ||
        this.designOptions?.steelFrame?.defaultOverwrites ||
        {};

      return overwrites.designEnabled !== false;
    });
  },

  getFramesForSteelJoistDesign() {
    const selectedFrames = this.getSelectedFramesForDesign?.() || [];
    const allFrames = this.getAllFramesForDesign();

    let joists = allFrames.filter((frame) => {
      const type = String(
        frame.elementType ||
        frame.type ||
        frame.designType ||
        ""
      ).toLowerCase();

      return (
        frame.isSteelJoist === true ||
        frame.designType === "steel-joist" ||
        type.includes("joist") ||
        type.includes("secondary")
      );
    });

    // Si no hay joists marcados, usamos los seleccionados como joists temporales.
    if (!joists.length && selectedFrames.length) {
      joists = selectedFrames;
    }

    return joists.filter((frame) => {
      const overwrites =
        frame.steelJoistDesignOverwrites ||
        frame.designOverwrites?.steelJoist ||
        this.designOptions?.steelJoist?.defaultOverwrites ||
        {};

      return overwrites.designEnabled !== false;
    });
  },

  getFrameLengthForDesign(frame) {
    if (!frame?.node1?.position || !frame?.node2?.position) return 0;

    const p1 = frame.node1.position;
    const p2 = frame.node2.position;

    const dx = Number(p2.x || 0) - Number(p1.x || 0);
    const dy = Number(p2.y || 0) - Number(p1.y || 0);
    const dz = Number(p2.z || 0) - Number(p1.z || 0);

    return Math.sqrt(dx * dx + dy * dy + dz * dz);
  },

  getFrameAreaForDesign(frame) {
    const section =
      frame.frameSection ||
      frame.section ||
      frame.assignment?.frameSection ||
      null;

    const areaFromSection = Number(
      section?.A ??
      section?.area ??
      section?.Area ??
      0
    );

    if (areaFromSection > 0) return areaFromSection;

    const areaFromFrame = Number(frame.A ?? frame._A ?? 0);

    if (areaFromFrame > 0) return areaFromFrame;

    const sectionId =
      frame.sectionId ||
      frame.sectionName ||
      section?.id ||
      section?.name;

    const areaFromSectionsList = Number(this.sections?.[sectionId] ?? 0);

    if (areaFromSectionsList > 0) return areaFromSectionsList;

    // Área mínima de respaldo para evitar división entre cero.
    return 0.01;
  },

  getFrameSectionNameForDesign(frame) {
    return (
      frame.sectionName ||
      frame.frameSection?.name ||
      frame.section?.name ||
      frame.sectionId ||
      frame.globalA ||
      "Sin sección"
    );
  },

  getFrameAxialDemandForDesign(frame) {
    const axial = Number(frame.fAxial ?? frame.axialForce ?? 0);

    if (Number.isFinite(axial) && Math.abs(axial) > 0) {
      return Math.abs(axial);
    }

    const loads = frame.frameLoads || frame.lineLoads || [];
    let estimatedDemand = 0;

    loads.forEach((load) => {
      if (load.type === "point") {
        estimatedDemand += Math.abs(Number(load.value || 0));
      }

      if (load.type === "distributed") {
        const length = this.getFrameLengthForDesign(frame) || 1;
        const w1 = Math.abs(Number(load.startValue || 0));
        const w2 = Math.abs(Number(load.endValue || 0));

        estimatedDemand += ((w1 + w2) / 2) * length;
      }

      if (load.type === "temperature") {
        estimatedDemand += 1;
      }
    });

    // Demanda mínima simbólica si todavía no hay análisis ni cargas.
    return estimatedDemand > 0 ? estimatedDemand : 1;
  },

  getSteelFrameCapacityForDesign(frame) {
    const area = this.getFrameAreaForDesign(frame);

    const phi =
      Number(this.steelFrameDesign?.phiCompression ?? 0.9) || 0.9;

    // Capacidad simplificada referencial.
    // No es cálculo normativo real.
    const fy = 250; // kN/m2 referencial simplificado para versión inicial

    return Math.max(area * fy * phi, 0.001);
  },

  calculateSteelFrameDesignResult(frame, comboName = "COMB1") {
    const demand = this.getFrameAxialDemandForDesign(frame);
    const capacity = this.getSteelFrameCapacityForDesign(frame);
    const ratio = demand / capacity;

    return {
      type: "steel-frame",
      combo: comboName,
      section: this.getFrameSectionNameForDesign(frame),
      length: this.getFrameLengthForDesign(frame),
      area: this.getFrameAreaForDesign(frame),
      demand,
      capacity,
      ratio,
      status: ratio <= 1 ? "OK" : "NG",
      checkedAt: new Date().toISOString(),
    };
  },

  saveSteelFrameDesignResult(frame, result) {
    if (!frame.designResults) {
      frame.designResults = {};
    }

    const cleanResult = this.sanitizeDesignResult(result);

    frame.designResults.steelFrame = this.cloneDesignData(cleanResult);
    frame.steelFrameDesignResult = this.cloneDesignData(cleanResult);

    frame.assignment = {
      ...(frame.assignment || {}),
      design: {
        ...(frame.assignment?.design || {}),
        steelFrameResult: this.cloneDesignData(cleanResult),
      },
    };
  },

  getActiveDesignDisplayMode() {
    this.ensureDesignOptions();

    if (this.designOptions.steelFrame.displayInfo?.show) {
      return {
        type: "steel-frame",
        options: this.designOptions.steelFrame.displayInfo,
      };
    }

    if (this.designOptions.steelJoist.displayInfo?.show) {
      return {
        type: "steel-joist",
        options: this.designOptions.steelJoist.displayInfo,
      };
    }

    return null;
  },

  getDesignResultForDisplay(frame) {
    const mode = this.getActiveDesignDisplayMode();

    if (!mode) return null;

    if (mode.type === "steel-frame") {
      return frame.steelFrameDesignResult || frame.designResults?.steelFrame || null;
    }

    if (mode.type === "steel-joist") {
      return frame.steelJoistDesignResult || frame.designResults?.steelJoist || null;
    }

    return null;
  },

  formatDesignInfoText(result, infoType = "ratio") {
    if (!result) return "";

    const dec = this.outputDecimals?.forces ?? 2;

    if (infoType === "ratio") {
      return `${result.status}  Ratio=${Number(result.ratio || 0).toFixed(2)}`;
    }

    if (infoType === "status") {
      return `${result.status}`;
    }

    if (infoType === "combo") {
      return `${result.combo || "COMBO"}`;
    }

    if (infoType === "section") {
      return `${result.section || "Sin sección"}`;
    }

    if (infoType === "joist-type") {
      return `${result.joistType || "Joist"}`;
    }

    if (infoType === "similarity-group") {
      return `${result.similarityGroup || "Sin grupo"}`;
    }

    if (infoType === "demand-capacity") {
      const demand = Number(result.demand || 0).toFixed(dec);
      const capacity = Number(result.capacity || 0).toFixed(dec);
      return `D/C ${demand}/${capacity}`;
    }

    return `${result.status}  Ratio=${Number(result.ratio || 0).toFixed(2)}`;
  },

  openShowJointLoadsDialog() {
    this.ensureDisplayOptions?.();

    Swal.fire({
      title: "Display Joint / Point Loads",
      width: 520,
      html: `
      <div style="text-align:left; font-size:13px;">
        <p style="margin-bottom:12px;">
          Controla la visualización de cargas asignadas a nodos.
        </p>

        <label style="display:flex; align-items:center; gap:8px; margin-bottom:10px;">
          <input 
            id="display-joint-loads" 
            type="checkbox" 
            ${this.displayOptions?.showJointLoads ? "checked" : ""}>
          Show Joint / Point Loads
        </label>

        <div style="padding:10px; border:1px solid #555; border-radius:6px; font-size:12px; color:#777;">
          Muestra cargas tipo Force, Ground Displacement y Temperature asignadas desde Assign.
        </div>
      </div>
    `,
      showCancelButton: true,
      confirmButtonText: "Aplicar",
      cancelButtonText: "Cancelar",
      preConfirm: () => {
        return {
          showJointLoads:
            document.getElementById("display-joint-loads")?.checked === true,
        };
      },
    }).then((result) => {
      if (!result.isConfirmed) return;

      this.displayOptions.showJointLoads = result.value.showJointLoads;

      this.redraw?.();

      this.showMessage?.(
        this.displayOptions.showJointLoads
          ? "Cargas de nodos visibles."
          : "Cargas de nodos ocultas."
      );
    });
  },

  openShowFrameLoadsDialog() {
    this.ensureDisplayOptions();

    Swal.fire({
      title: "Display Frame / Line Loads",
      width: 560,
      html: `
      <div style="text-align:left; font-size:13px;">
        <p style="margin-bottom:12px;">
          Controla la visualización de las cargas asignadas a elementos Frame / Line.
        </p>

        <label style="display:flex; align-items:center; gap:8px; margin-bottom:10px;">
          <input 
            id="display-frame-loads" 
            type="checkbox" 
            ${this.displayOptions.showFrameLoads ? "checked" : ""}>
          Show Frame / Line Loads
        </label>

        <div style="padding:10px; border:1px solid #555; border-radius:6px; font-size:12px; color:#777;">
          Esta opción muestra u oculta cargas puntuales, distribuidas y de temperatura asignadas desde Assign.
        </div>
      </div>
    `,
      showCancelButton: true,
      confirmButtonText: "Aplicar",
      cancelButtonText: "Cancelar",
      preConfirm: () => {
        return {
          showFrameLoads:
            document.getElementById("display-frame-loads")?.checked === true,
        };
      },
    }).then((result) => {
      if (!result.isConfirmed) return;

      this.displayOptions.showFrameLoads = result.value.showFrameLoads;

      this.redraw?.();

      this.showMessage?.(
        this.displayOptions.showFrameLoads
          ? "Display: cargas de Frame / Line visibles."
          : "Display: cargas de Frame / Line ocultas."
      );

      console.log("✅ Display > Show Loads > Frame / Line", {
        showFrameLoads: this.displayOptions.showFrameLoads,
      });
    });
  },

  openShowDeformedShapeDialog() {
    this.ensureDisplayOptions();

    if (!this.hasCompletedAnalysisResults()) {
      this.showRunAnalysisRequiredMessage("Display > Show Deformed Shape");
      return;
    }

    Swal.fire({
      title: "Display Deformed Shape",
      width: 560,
      html: `
      <div style="text-align:left; font-size:13px;">
        <p style="margin-bottom:12px;">
          Controla la visualización de la forma deformada del modelo.
        </p>

        <label style="display:flex; align-items:center; gap:8px; margin-bottom:12px;">
          <input 
            id="display-deformed-shape" 
            type="checkbox" 
            ${this.displayOptions.showDeformedShape ? "checked" : ""}>
          Show Deformed Shape
        </label>

        <label style="display:block; margin-bottom:5px;">Scale Factor</label>
        <input 
          id="display-deformed-scale" 
          type="number" 
          step="0.1" 
          value="${this.displayOptions.deformedScale ?? 1}"
          style="width:100%; padding:7px;">

        <div style="margin-top:12px; padding:10px; border:1px solid #555; border-radius:6px; font-size:12px; color:#777;">
          Esta opción activa la visualización de deflexiones. Para que se note visualmente, el modelo debe tener resultados de desplazamiento o deflexión calculados.
        </div>
      </div>
    `,
      showCancelButton: true,
      confirmButtonText: "Aplicar",
      cancelButtonText: "Cancelar",
      preConfirm: () => {
        return {
          showDeformedShape:
            document.getElementById("display-deformed-shape")?.checked === true,

          deformedScale:
            Number(document.getElementById("display-deformed-scale")?.value || 1),
        };
      },
    }).then((result) => {
      if (!result.isConfirmed) return;

      this.displayOptions.showDeformedShape = result.value.showDeformedShape;
      this.displayOptions.deformedScale = result.value.deformedScale;

      // Si activo deformada, apago otras vistas de resultados incompatibles
      if (result.value.showDeformedShape) {
        this.displayOptions.showUndeformedShape = false;
        this.displayOptions.showModeShape = false;
        this.displayOptions.showMemberForces = false;

        this.options.showDeflection = true;
        this.options.deflectionScale = result.value.deformedScale;

        this.options.showFAxiales = false;
        this.options.showFAxialesValues = false;
      } else {
        this.displayOptions.showUndeformedShape = true;
        this.options.showDeflection = false;
      }

      this.redraw?.();
      this.sync3D?.();

      this.showMessage?.(
        result.value.showDeformedShape
          ? "Display: forma deformada visible."
          : "Display: forma deformada oculta."
      );

      console.log("✅ Display > Show Deformed Shape", {
        showDeformedShape: this.displayOptions.showDeformedShape,
        deformedScale: this.displayOptions.deformedScale,
        showDeflection: this.options.showDeflection,
        deflectionScale: this.options.deflectionScale,
      });
    });
  },

  openShowModeShapeDialog() {
    this.ensureDisplayOptions();

    if (!this.hasCompletedAnalysisResults()) {
      this.showRunAnalysisRequiredMessage("Display > Show Mode Shape");
      return;
    }

    Swal.fire({
      title: "Display Mode Shape",
      width: 560,
      html: `
      <div style="text-align:left; font-size:13px;">
        <p style="margin-bottom:12px;">
          Controla la visualización de una forma modal del modelo.
        </p>

        <label style="display:flex; align-items:center; gap:8px; margin-bottom:12px;">
          <input 
            id="display-mode-shape" 
            type="checkbox" 
            ${this.displayOptions.showModeShape ? "checked" : ""}>
          Show Mode Shape
        </label>

        <label style="display:block; margin-bottom:5px;">Mode Number</label>
        <input 
          id="display-mode-number" 
          type="number" 
          min="1" 
          step="1" 
          value="${this.displayOptions.modeNumber ?? 1}"
          style="width:100%; padding:7px; margin-bottom:10px;">

        <label style="display:block; margin-bottom:5px;">Scale Factor</label>
        <input 
          id="display-mode-scale" 
          type="number" 
          step="0.1" 
          value="${this.displayOptions.modeScale ?? 1}"
          style="width:100%; padding:7px;">

        <div style="margin-top:12px; padding:10px; border:1px solid #555; border-radius:6px; font-size:12px; color:#777;">
          Versión inicial: se mostrará una forma modal visual simulada. Luego se conectará con resultados reales del análisis modal.
        </div>
      </div>
    `,
      showCancelButton: true,
      confirmButtonText: "Aplicar",
      cancelButtonText: "Cancelar",
      preConfirm: () => {
        return {
          showModeShape:
            document.getElementById("display-mode-shape")?.checked === true,

          modeNumber:
            Number(document.getElementById("display-mode-number")?.value || 1),

          modeScale:
            Number(document.getElementById("display-mode-scale")?.value || 1),
        };
      },
    }).then((result) => {
      if (!result.isConfirmed) return;

      this.displayOptions.showModeShape = result.value.showModeShape;
      this.displayOptions.modeNumber = result.value.modeNumber;
      this.displayOptions.modeScale = result.value.modeScale;

      if (result.value.showModeShape) {
        this.displayOptions.showUndeformedShape = true;
        this.displayOptions.showDeformedShape = false;
        this.displayOptions.showMemberForces = false;

        this.options.showDeflection = false;
        this.options.showFAxiales = false;
        this.options.showFAxialesValues = false;
      } else {
        this.displayOptions.showModeShape = false;
      }

      this.redraw?.();
      this.sync3D?.();

      this.showMessage?.(
        result.value.showModeShape
          ? `Display: forma modal ${result.value.modeNumber} visible.`
          : "Display: forma modal oculta."
      );

      console.log("✅ Display > Show Mode Shape", {
        showModeShape: this.displayOptions.showModeShape,
        modeNumber: this.displayOptions.modeNumber,
        modeScale: this.displayOptions.modeScale,
      });
    });
  },

  openShowMemberForcesDialog() {
    this.ensureDisplayOptions();

    if (!this.hasCompletedAnalysisResults()) {
      this.showRunAnalysisRequiredMessage("Display > Show Member Forces / Stress Diagram");
      return;
    }

    Swal.fire({
      title: "Display Member Forces / Stress Diagram",
      width: 580,
      html: `
      <div style="text-align:left; font-size:13px;">
        <p style="margin-bottom:12px;">
          Controla la visualización de diagramas de fuerzas internas en elementos Frame / Line.
        </p>

        <label style="display:flex; align-items:center; gap:8px; margin-bottom:10px;">
          <input 
            id="display-member-forces" 
            type="checkbox" 
            ${this.displayOptions.showMemberForces ? "checked" : ""}>
          Show Member Forces / Stress Diagram
        </label>

        <label style="display:flex; align-items:center; gap:8px; margin-bottom:12px;">
          <input 
            id="display-member-force-values" 
            type="checkbox" 
            ${this.displayOptions.showMemberForceValues ? "checked" : ""}>
          Show Values
        </label>

        <label style="display:block; margin-bottom:5px;">Diagram Type</label>
        <select id="display-member-force-type" style="width:100%; padding:7px;">
          <option value="axial">Axial Force</option>
          <option value="shear2">Shear 2</option>
          <option value="shear3">Shear 3</option>
          <option value="moment2">Moment 2</option>
          <option value="moment3">Moment 3</option>
          <option value="torsion">Torsion</option>
        </select>

        <div style="margin-top:12px; padding:10px; border:1px solid #555; border-radius:6px; font-size:12px; color:#777;">
          Versión inicial: se conecta con el diagrama axial existente. Luego se ampliará para cortantes, momentos y torsión.
        </div>
      </div>
    `,
      showCancelButton: true,
      confirmButtonText: "Aplicar",
      cancelButtonText: "Cancelar",

      didOpen: () => {
        const select = document.getElementById("display-member-force-type");
        if (select) {
          select.value = this.displayOptions.memberForceType || "axial";
        }
      },

      preConfirm: () => {
        return {
          showMemberForces:
            document.getElementById("display-member-forces")?.checked === true,

          showMemberForceValues:
            document.getElementById("display-member-force-values")?.checked === true,

          memberForceType:
            document.getElementById("display-member-force-type")?.value || "axial",
        };
      },
    }).then((result) => {
      if (!result.isConfirmed) return;

      this.displayOptions.showMemberForces = result.value.showMemberForces;
      this.displayOptions.showMemberForceValues = result.value.showMemberForceValues;
      this.displayOptions.memberForceType = result.value.memberForceType;

      if (result.value.showMemberForces) {
        this.displayOptions.showUndeformedShape = true;
        this.displayOptions.showDeformedShape = false;
        this.displayOptions.showModeShape = false;

        this.options.showDeflection = false;

        // Por ahora solo axial está conectado al renderer existente
        this.options.showFAxiales =
          result.value.memberForceType === "axial";

        this.options.showFAxialesValues =
          result.value.memberForceType === "axial" &&
          result.value.showMemberForceValues;
      } else {
        this.options.showFAxiales = false;
        this.options.showFAxialesValues = false;
      }

      this.redraw?.();
      this.sync3D?.();

      this.showMessage?.(
        result.value.showMemberForces
          ? `Display: diagrama ${result.value.memberForceType} visible.`
          : "Display: diagramas de fuerzas ocultos."
      );

      console.log("✅ Display > Show Member Forces / Stress Diagram", {
        showMemberForces: this.displayOptions.showMemberForces,
        showMemberForceValues: this.displayOptions.showMemberForceValues,
        memberForceType: this.displayOptions.memberForceType,
        showFAxiales: this.options.showFAxiales,
        showFAxialesValues: this.options.showFAxialesValues,
      });
    });
  },

  openShowReferencePlanesDialog() {
    this.ensureDisplayOptions?.();

    Swal.fire({
      title: "Display Reference Planes",
      width: 520,
      html: `
      <div style="text-align:left; font-size:13px;">
        <p style="margin-bottom:12px;">
          Controla la visualización de los planos auxiliares de referencia creados desde Edit Reference Planes.
        </p>

        <label style="display:flex; align-items:center; gap:8px; margin-bottom:12px;">
          <input 
            id="display-reference-planes" 
            type="checkbox" 
            ${this.displayOptions?.showReferencePlanes !== false ? "checked" : ""}>
          Show Reference Planes
        </label>

        <div style="padding:10px; border:1px solid #555; border-radius:6px; font-size:12px; color:#777;">
          Los Reference Planes son guías visuales. No son losas, muros ni elementos estructurales de análisis.
        </div>
      </div>
    `,
      showCancelButton: true,
      confirmButtonText: "Aplicar",
      cancelButtonText: "Cancelar",
      preConfirm: () => {
        return {
          showReferencePlanes:
            document.getElementById("display-reference-planes")?.checked === true,
        };
      },
    }).then((result) => {
      if (!result.isConfirmed) return;

      this.displayOptions.showReferencePlanes = result.value.showReferencePlanes;

      this.redraw?.();

      this.showMessage?.(
        this.displayOptions.showReferencePlanes
          ? "Display: Reference Planes visibles."
          : "Display: Reference Planes ocultos."
      );

      console.log("✅ Display > Show Reference Planes", {
        showReferencePlanes: this.displayOptions.showReferencePlanes,
      });
    });
  },

  showUndeformedShape() {
    this.ensureDisplayOptions();

    // Estado principal Display
    this.displayOptions.showUndeformedShape = true;
    this.displayOptions.showDeformedShape = false;
    this.displayOptions.showModeShape = false;
    this.displayOptions.showMemberForces = false;

    // Apagar resultados/diagramas
    this.options.showDeflection = false;
    this.options.showFAxiales = false;
    this.options.showFAxialesValues = false;

    // También apagamos visualmente valores de diagramas
    this.displayOptions.showMemberForces = false;
    this.displayOptions.showMemberForceValues = false;

    this.redraw?.();
    this.sync3D?.();

    this.showMessage?.("Display: mostrando forma no deformada.");

    console.log("✅ Display > Show Undeformed Shape", {
      showDeflection: this.options.showDeflection,
      showFAxiales: this.options.showFAxiales,
      showFAxialesValues: this.options.showFAxialesValues,
      displayOptions: this.displayOptions,
    });
  },

  getDefaultFrameSectionsForAssign() {
    return [
      {
        id: "VIGA_25X50",
        name: "VIGA 25x50",
        type: "concrete-rectangular",
        b: 0.25,
        h: 0.50,
        A: 0.125,
      },
      {
        id: "COLUMNA_30X30",
        name: "COLUMNA 30x30",
        type: "concrete-rectangular",
        b: 0.30,
        h: 0.30,
        A: 0.09,
      },
      {
        id: "VIGA_30X60",
        name: "VIGA 30x60",
        type: "concrete-rectangular",
        b: 0.30,
        h: 0.60,
        A: 0.18,
      },
    ];
  },

  getAvailableFrameSectionsForAssign() {
    const definedSections = this.frameSections?.sections;

    if (Array.isArray(definedSections) && definedSections.length > 0) {
      return definedSections.map((section, index) => {
        const id =
          section.id ||
          section.sectionId ||
          section.name ||
          section.nombre ||
          `SECTION_${index + 1}`;

        const name =
          section.name ||
          section.nombre ||
          section.sectionName ||
          String(id);

        const b = Number(section.b ?? section.width ?? section.base ?? 0);
        const h = Number(section.h ?? section.height ?? section.peralte ?? 0);
        const A = Number(section.A ?? section.area ?? (b && h ? b * h : 0));

        return {
          ...section,
          id,
          name,
          b,
          h,
          A,
        };
      });
    }

    return this.getDefaultFrameSectionsForAssign();
  },

  getFrameSectionForAssignById(sectionId) {
    return this.getAvailableFrameSectionsForAssign().find((section) => {
      return (
        String(section.id) === String(sectionId) ||
        String(section.name) === String(sectionId) ||
        String(section.sectionName) === String(sectionId)
      );
    }) || null;
  },

  getSelectedFramesForAssign() {
    const selectedObjects = this.getSelectedObjects?.() || [];

    return selectedObjects.filter((obj) => {
      if (!obj) return false;

      const type = String(
        obj.elementType ||
        obj.type ||
        obj.objectType ||
        obj.constructor?.name ||
        ""
      ).toLowerCase();

      const hasFrameGeometry = obj.node1 && obj.node2;

      return (
        hasFrameGeometry ||
        type === "beam" ||
        type === "column" ||
        type === "brace" ||
        type === "secondary-beam" ||
        type === "secondarybeam" ||
        type === "frame" ||
        type === "line"
      );
    });
  },

  async openAssignFrameSectionDialog() {
    const selectedFrames = this.getSelectedFramesForAssign();

    if (!selectedFrames.length) {
      this.showMessage?.("Selecciona primero uno o más elementos Frame / Line.", "warning");
      return;
    }

    const sections = this.getAvailableFrameSectionsForAssign();

    if (!sections.length) {
      this.showMessage?.("No hay secciones disponibles. Primero crea una sección en Define.", "warning");
      return;
    }

    const inputOptions = {};

    sections.forEach((section) => {
      inputOptions[section.id] = `${section.name}${section.A ? ` | A=${section.A}` : ""}`;
    });

    const result = await Swal.fire({
      title: "Assign Frame Section",
      input: "select",
      inputOptions,
      inputPlaceholder: "Selecciona una sección",
      showCancelButton: true,
      confirmButtonText: "Asignar",
      cancelButtonText: "Cancelar",
    });

    if (!result.isConfirmed || !result.value) return;

    this.assignFrameSectionToSelected(result.value);
  },

  assignFrameSectionToSelected(sectionId) {
    const section = this.getFrameSectionForAssignById(sectionId);

    if (!section) {
      this.showMessage?.("La sección seleccionada no existe.", "warning");
      console.warn("Frame Section no encontrada:", sectionId);
      return;
    }

    const selectedFrames = this.getSelectedFramesForAssign();

    if (!selectedFrames.length) {
      this.showMessage?.("No hay elementos Frame / Line seleccionados.", "warning");
      return;
    }

    selectedFrames.forEach((frame) => {
      frame.sectionId = section.id;
      frame.sectionName = section.name;
      frame.frameSection = { ...section };

      // Compatibilidad con exportación, selección y cálculo
      frame.section = { ...section };

      frame.A = section.A ?? section.area ?? frame.A ?? null;
      frame._A = section.A ?? section.area ?? frame._A ?? null;

      frame.hasAssignedSection = true;

      // Para que sea fácil verificar en tablas o depuración
      frame.assignment = {
        ...(frame.assignment || {}),
        frameSection: {
          id: section.id,
          name: section.name,
        },
      };
    });

    this.markAnalysisResultsOutdated?.("Se modificó el modelo o sus asignaciones.");
    this.redraw?.();

    // Evitamos sync3D directo si te genera parpadeo o zoom automático.
    // Pero si tu 3D ya está estable, puedes descomentar:
    // this.sync3D?.();

    this.showMessage?.(
      `Se asignó ${section.name} a ${selectedFrames.length} elemento(s) Frame / Line.`
    );

    console.log("✅ Frame Section asignada:", {
      section,
      selectedFrames,
    });
  },

  // =====================================================
  // ASSIGN > FRAME / LINE > FRAME RELEASES / PARTIAL FIXITY
  // =====================================================

  getDefaultFrameReleases() {
    return {
      iEnd: {
        axial: false,
        shear2: false,
        shear3: false,
        torsion: false,
        moment22: false,
        moment33: false,
      },
      jEnd: {
        axial: false,
        shear2: false,
        shear3: false,
        torsion: false,
        moment22: false,
        moment33: false,
      },
      partialFixity: {
        enabled: false,
        iEnd: {
          axial: null,
          shear2: null,
          shear3: null,
          torsion: null,
          moment22: null,
          moment33: null,
        },
        jEnd: {
          axial: null,
          shear2: null,
          shear3: null,
          torsion: null,
          moment22: null,
          moment33: null,
        },
      },
    };
  },

  async openAssignFrameReleasesDialog() {
    const selectedFrames = this.getSelectedFramesForAssign();

    if (!selectedFrames.length) {
      this.showMessage?.("Selecciona primero uno o más elementos Frame / Line.", "warning");
      return;
    }

    const result = await Swal.fire({
      title: "Assign Frame Releases / Partial Fixity",
      width: 760,
      html: `
      <div style="text-align:left; font-size:13px;">
        <p style="margin-bottom:10px;">
          Selecciona los grados de libertad liberados en el extremo I y/o J del elemento Frame / Line.
        </p>

        <table style="width:100%; border-collapse:collapse; font-size:12px;">
          <thead>
            <tr style="background:#1f2937; color:white;">
              <th style="border:1px solid #555; padding:6px;">Grado de libertad</th>
              <th style="border:1px solid #555; padding:6px;">Extremo I</th>
              <th style="border:1px solid #555; padding:6px;">Extremo J</th>
            </tr>
          </thead>

          <tbody>
            ${this.buildFrameReleaseRow("Axial / P", "axial")}
            ${this.buildFrameReleaseRow("Shear 2 / V2", "shear2")}
            ${this.buildFrameReleaseRow("Shear 3 / V3", "shear3")}
            ${this.buildFrameReleaseRow("Torsion / T", "torsion")}
            ${this.buildFrameReleaseRow("Moment 22 / M2", "moment22")}
            ${this.buildFrameReleaseRow("Moment 33 / M3", "moment33")}
          </tbody>
        </table>

        <div style="margin-top:14px; padding:10px; border:1px solid #555; border-radius:6px;">
          <label style="display:flex; align-items:center; gap:8px;">
            <input id="partial-fixity-enabled" type="checkbox">
            Activar Partial Fixity / Resortes rotacionales iniciales
          </label>

          <p style="font-size:12px; color:#777; margin-top:6px;">
            En esta primera versión se guardará la configuración, pero el cálculo estructural lo usará después cuando conectemos el motor de análisis.
          </p>
        </div>

        <div style="margin-top:10px; color:#666; font-size:12px;">
          Elementos seleccionados: <b>${selectedFrames.length}</b>
        </div>
      </div>
    `,
      showCancelButton: true,
      confirmButtonText: "Asignar",
      cancelButtonText: "Cancelar",
      preConfirm: () => {
        return this.readFrameReleasesFromDialog();
      },
    });

    if (!result.isConfirmed || !result.value) return;

    this.assignFrameReleasesToSelected(result.value);
  },

  buildFrameReleaseRow(label, key) {
    return `
    <tr>
      <td style="border:1px solid #555; padding:6px;">${label}</td>
      <td style="border:1px solid #555; padding:6px; text-align:center;">
        <input type="checkbox" id="release-i-${key}">
      </td>
      <td style="border:1px solid #555; padding:6px; text-align:center;">
        <input type="checkbox" id="release-j-${key}">
      </td>
    </tr>
  `;
  },

  readFrameReleasesFromDialog() {
    const keys = [
      "axial",
      "shear2",
      "shear3",
      "torsion",
      "moment22",
      "moment33",
    ];

    const releases = this.getDefaultFrameReleases();

    keys.forEach((key) => {
      releases.iEnd[key] = document.getElementById(`release-i-${key}`)?.checked === true;
      releases.jEnd[key] = document.getElementById(`release-j-${key}`)?.checked === true;
    });

    releases.partialFixity.enabled =
      document.getElementById("partial-fixity-enabled")?.checked === true;

    return releases;
  },

  assignFrameReleasesToSelected(releases) {
    const selectedFrames = this.getSelectedFramesForAssign();

    if (!selectedFrames.length) {
      this.showMessage?.("No hay elementos Frame / Line seleccionados.", "warning");
      return;
    }

    selectedFrames.forEach((frame) => {
      frame.releases = JSON.parse(JSON.stringify(releases));

      // Nombre compatible con ETABS / depuración
      frame.frameReleases = JSON.parse(JSON.stringify(releases));

      frame.assignment = {
        ...(frame.assignment || {}),
        frameReleases: JSON.parse(JSON.stringify(releases)),
      };

      frame.hasFrameReleases = this.frameHasAnyRelease(releases);
    });

    this.redraw?.();

    this.showMessage?.(
      `Frame Releases asignado a ${selectedFrames.length} elemento(s) Frame / Line.`
    );

    console.log("✅ Frame Releases asignados:", {
      releases,
      selectedFrames,
    });
  },

  frameHasAnyRelease(releases) {
    if (!releases) return false;

    const keys = [
      "axial",
      "shear2",
      "shear3",
      "torsion",
      "moment22",
      "moment33",
    ];

    const hasIRelease = keys.some((key) => releases.iEnd?.[key] === true);
    const hasJRelease = keys.some((key) => releases.jEnd?.[key] === true);

    return hasIRelease || hasJRelease || releases.partialFixity?.enabled === true;
  },

  // =====================================================
  // ASSIGN > FRAME / LINE > END (LENGTH) OFFSETS
  // =====================================================

  getDefaultFrameEndOffsets() {
    return {
      autoOffset: false,

      iEnd: {
        offsetLength: 0,
        rigidZoneFactor: 0,
      },

      jEnd: {
        offsetLength: 0,
        rigidZoneFactor: 0,
      },

      useRigidZoneFactor: false,
    };
  },

  async openAssignFrameEndOffsetsDialog() {
    const selectedFrames = this.getSelectedFramesForAssign();

    if (!selectedFrames.length) {
      this.showMessage?.("Selecciona primero uno o más elementos Frame / Line.", "warning");
      return;
    }

    const current = selectedFrames[0]?.endOffsets ||
      selectedFrames[0]?.frameEndOffsets ||
      this.getDefaultFrameEndOffsets();

    const result = await Swal.fire({
      title: "Assign End (Length) Offsets",
      width: 620,
      html: `
      <div style="text-align:left; font-size:13px;">

        <p style="margin-bottom:12px;">
          Asigna offsets de longitud en los extremos I y J del elemento Frame / Line.
        </p>

        <div style="border:1px solid #555; border-radius:6px; padding:10px; margin-bottom:12px;">
          <label style="display:flex; align-items:center; gap:8px;">
            <input id="offset-auto" type="checkbox" ${current.autoOffset ? "checked" : ""}>
            Automatic from Connectivity
          </label>

          <p style="font-size:12px; color:#777; margin-top:6px;">
            En esta versión inicial, esta opción solo queda guardada como propiedad del elemento.
          </p>
        </div>

        <table style="width:100%; border-collapse:collapse; font-size:12px;">
          <thead>
            <tr style="background:#1f2937; color:white;">
              <th style="border:1px solid #555; padding:6px;">Extremo</th>
              <th style="border:1px solid #555; padding:6px;">Offset Length</th>
              <th style="border:1px solid #555; padding:6px;">Rigid Zone Factor</th>
            </tr>
          </thead>

          <tbody>
            <tr>
              <td style="border:1px solid #555; padding:6px;">I-End</td>
              <td style="border:1px solid #555; padding:6px;">
                <input id="offset-i-length" type="number" step="0.001"
                  value="${current.iEnd?.offsetLength ?? 0}"
                  style="width:100%; padding:5px;">
              </td>
              <td style="border:1px solid #555; padding:6px;">
                <input id="offset-i-rigid" type="number" step="0.01" min="0" max="1"
                  value="${current.iEnd?.rigidZoneFactor ?? 0}"
                  style="width:100%; padding:5px;">
              </td>
            </tr>

            <tr>
              <td style="border:1px solid #555; padding:6px;">J-End</td>
              <td style="border:1px solid #555; padding:6px;">
                <input id="offset-j-length" type="number" step="0.001"
                  value="${current.jEnd?.offsetLength ?? 0}"
                  style="width:100%; padding:5px;">
              </td>
              <td style="border:1px solid #555; padding:6px;">
                <input id="offset-j-rigid" type="number" step="0.01" min="0" max="1"
                  value="${current.jEnd?.rigidZoneFactor ?? 0}"
                  style="width:100%; padding:5px;">
              </td>
            </tr>
          </tbody>
        </table>

        <div style="margin-top:12px;">
          <label style="display:flex; align-items:center; gap:8px;">
            <input id="offset-use-rigid-zone" type="checkbox" ${current.useRigidZoneFactor ? "checked" : ""}>
            Use Rigid Zone Factor
          </label>
        </div>

        <div style="margin-top:10px; color:#666; font-size:12px;">
          Elementos seleccionados: <b>${selectedFrames.length}</b>
        </div>

      </div>
    `,
      showCancelButton: true,
      confirmButtonText: "Asignar",
      cancelButtonText: "Cancelar",
      preConfirm: () => {
        return this.readFrameEndOffsetsFromDialog();
      },
    });

    if (!result.isConfirmed || !result.value) return;

    this.assignFrameEndOffsetsToSelected(result.value);
  },

  readFrameEndOffsetsFromDialog() {
    return {
      autoOffset: document.getElementById("offset-auto")?.checked === true,

      iEnd: {
        offsetLength: Number(document.getElementById("offset-i-length")?.value || 0),
        rigidZoneFactor: Number(document.getElementById("offset-i-rigid")?.value || 0),
      },

      jEnd: {
        offsetLength: Number(document.getElementById("offset-j-length")?.value || 0),
        rigidZoneFactor: Number(document.getElementById("offset-j-rigid")?.value || 0),
      },

      useRigidZoneFactor:
        document.getElementById("offset-use-rigid-zone")?.checked === true,
    };
  },

  assignFrameEndOffsetsToSelected(endOffsets) {
    const selectedFrames = this.getSelectedFramesForAssign();

    if (!selectedFrames.length) {
      this.showMessage?.("No hay elementos Frame / Line seleccionados.", "warning");
      return;
    }

    selectedFrames.forEach((frame) => {
      frame.endOffsets = JSON.parse(JSON.stringify(endOffsets));
      frame.frameEndOffsets = JSON.parse(JSON.stringify(endOffsets));

      frame.assignment = {
        ...(frame.assignment || {}),
        frameEndOffsets: JSON.parse(JSON.stringify(endOffsets)),
      };

      frame.hasEndOffsets = this.frameHasEndOffsets(endOffsets);
    });

    this.redraw?.();

    this.showMessage?.(
      `End Offsets asignado a ${selectedFrames.length} elemento(s) Frame / Line.`
    );

    console.log("✅ End Offsets asignados:", {
      endOffsets,
      selectedFrames,
    });
  },

  frameHasEndOffsets(endOffsets) {
    if (!endOffsets) return false;

    const iLength = Number(endOffsets.iEnd?.offsetLength || 0);
    const jLength = Number(endOffsets.jEnd?.offsetLength || 0);

    const iRigid = Number(endOffsets.iEnd?.rigidZoneFactor || 0);
    const jRigid = Number(endOffsets.jEnd?.rigidZoneFactor || 0);

    return (
      endOffsets.autoOffset === true ||
      endOffsets.useRigidZoneFactor === true ||
      iLength > 0 ||
      jLength > 0 ||
      iRigid > 0 ||
      jRigid > 0
    );
  },

  // =====================================================
  // ASSIGN > JOINT / POINT > RESTRAINTS (SUPPORTS)
  // =====================================================

  getSelectedJointsForAssign() {
    const selectedObjects = this.getSelectedObjects?.() || [];

    return selectedObjects.filter((obj) => {
      if (!obj) return false;

      const type = String(
        obj.objectType ||
        obj.type ||
        obj.elementType ||
        obj.constructor?.name ||
        ""
      ).toLowerCase();

      const hasPosition = !!obj.position;
      const isFrame = obj.node1 && obj.node2;

      return (
        !isFrame &&
        (
          hasPosition ||
          obj.isNode === true ||
          type === "node" ||
          type === "structuralnode" ||
          type === "joint" ||
          type === "point"
        )
      );
    });
  },

  getJointRestraintPreset(preset = "fixed") {
    const presets = {
      fixed: {
        name: "Fixed",
        ux: true,
        uy: true,
        uz: true,
        rx: true,
        ry: true,
        rz: true,
      },

      pinned: {
        name: "Pinned",
        ux: true,
        uy: true,
        uz: true,
        rx: false,
        ry: false,
        rz: false,
      },

      rollerX: {
        name: "Roller X",
        ux: false,
        uy: true,
        uz: true,
        rx: false,
        ry: false,
        rz: false,
      },

      rollerY: {
        name: "Roller Y",
        ux: true,
        uy: false,
        uz: true,
        rx: false,
        ry: false,
        rz: false,
      },

      free: {
        name: "Free",
        ux: false,
        uy: false,
        uz: false,
        rx: false,
        ry: false,
        rz: false,
      },
    };

    return presets[preset] || presets.fixed;
  },

  getJointRestraintTypeFromValues(restraints) {
    if (!restraints) return "custom";

    const keys = ["ux", "uy", "uz", "rx", "ry", "rz"];
    const presets = ["fixed", "pinned", "rollerX", "rollerY", "free"];

    for (const preset of presets) {
      const presetValues = this.getJointRestraintPreset(preset);
      const isSame = keys.every((key) => {
        return Boolean(restraints[key]) === Boolean(presetValues[key]);
      });

      if (isSame) return preset;
    }

    return "custom";
  },

  async openAssignJointRestraintsDialog() {
    const selectedJoints = this.getSelectedJointsForAssign();

    if (!selectedJoints.length) {
      this.showMessage?.("Selecciona primero uno o más nodos / puntos.", "warning");
      return;
    }

    const current =
      selectedJoints[0]?.restraints ||
      selectedJoints[0]?.constraints ||
      this.getJointRestraintPreset("fixed");

    const currentType = this.getJointRestraintTypeFromValues(current);

    const result = await Swal.fire({
      title: "Assign Restraints / Supports",
      width: 620,
      html: `
      <div style="text-align:left; font-size:13px;">

        <p style="margin-bottom:12px;">
          Asigna restricciones de apoyo a los nodos seleccionados.
        </p>

        <div style="margin-bottom:12px;">
          <label style="display:block; margin-bottom:5px;">Tipo de apoyo</label>

          <select id="joint-restraint-preset" style="width:100%; padding:7px;">
            <option value="fixed">Fixed</option>
            <option value="pinned">Pinned</option>
            <option value="rollerX">Roller X</option>
            <option value="rollerY">Roller Y</option>
            <option value="free">Free</option>
            <option value="custom">Custom</option>
          </select>
        </div>

        <table style="width:100%; border-collapse:collapse; font-size:12px;">
          <thead>
            <tr style="background:#1f2937; color:white;">
              <th style="border:1px solid #555; padding:6px;">Grado de libertad</th>
              <th style="border:1px solid #555; padding:6px;">Restringido</th>
            </tr>
          </thead>

          <tbody>
            <tr>
              <td style="border:1px solid #555; padding:6px;">U1 / UX - Traslación X</td>
              <td style="border:1px solid #555; padding:6px; text-align:center;">
                <input id="restraint-ux" type="checkbox" ${current.ux ? "checked" : ""}>
              </td>
            </tr>

            <tr>
              <td style="border:1px solid #555; padding:6px;">U2 / UY - Traslación Y</td>
              <td style="border:1px solid #555; padding:6px; text-align:center;">
                <input id="restraint-uy" type="checkbox" ${current.uy ? "checked" : ""}>
              </td>
            </tr>

            <tr>
              <td style="border:1px solid #555; padding:6px;">U3 / UZ - Traslación Z</td>
              <td style="border:1px solid #555; padding:6px; text-align:center;">
                <input id="restraint-uz" type="checkbox" ${current.uz ? "checked" : ""}>
              </td>
            </tr>

            <tr>
              <td style="border:1px solid #555; padding:6px;">R1 / RX - Rotación X</td>
              <td style="border:1px solid #555; padding:6px; text-align:center;">
                <input id="restraint-rx" type="checkbox" ${current.rx ? "checked" : ""}>
              </td>
            </tr>

            <tr>
              <td style="border:1px solid #555; padding:6px;">R2 / RY - Rotación Y</td>
              <td style="border:1px solid #555; padding:6px; text-align:center;">
                <input id="restraint-ry" type="checkbox" ${current.ry ? "checked" : ""}>
              </td>
            </tr>

            <tr>
              <td style="border:1px solid #555; padding:6px;">R3 / RZ - Rotación Z</td>
              <td style="border:1px solid #555; padding:6px; text-align:center;">
                <input id="restraint-rz" type="checkbox" ${current.rz ? "checked" : ""}>
              </td>
            </tr>
          </tbody>
        </table>

        <div style="margin-top:10px; color:#666; font-size:12px;">
          Nodos seleccionados: <b>${selectedJoints.length}</b>
        </div>

      </div>
    `,
      showCancelButton: true,
      confirmButtonText: "Asignar",
      cancelButtonText: "Cancelar",

      didOpen: () => {
        const presetSelect = document.getElementById("joint-restraint-preset");
        presetSelect.value = currentType;

        const applyPreset = (preset) => {
          if (preset === "custom") return;

          const values = this.getJointRestraintPreset(preset);

          document.getElementById("restraint-ux").checked = values.ux;
          document.getElementById("restraint-uy").checked = values.uy;
          document.getElementById("restraint-uz").checked = values.uz;
          document.getElementById("restraint-rx").checked = values.rx;
          document.getElementById("restraint-ry").checked = values.ry;
          document.getElementById("restraint-rz").checked = values.rz;
        };

        presetSelect.addEventListener("change", (event) => {
          applyPreset(event.target.value);
        });

        const checkboxes = [
          "restraint-ux",
          "restraint-uy",
          "restraint-uz",
          "restraint-rx",
          "restraint-ry",
          "restraint-rz",
        ];

        checkboxes.forEach((id) => {
          document.getElementById(id)?.addEventListener("change", () => {
            presetSelect.value = "custom";
          });
        });
      },

      preConfirm: () => {
        return this.readJointRestraintsFromDialog();
      },
    });

    if (!result.isConfirmed || !result.value) return;

    this.assignJointRestraintsToSelected(result.value);
  },

  readJointRestraintsFromDialog() {
    const restraints = {
      ux: document.getElementById("restraint-ux")?.checked === true,
      uy: document.getElementById("restraint-uy")?.checked === true,
      uz: document.getElementById("restraint-uz")?.checked === true,
      rx: document.getElementById("restraint-rx")?.checked === true,
      ry: document.getElementById("restraint-ry")?.checked === true,
      rz: document.getElementById("restraint-rz")?.checked === true,
    };

    const preset = document.getElementById("joint-restraint-preset")?.value || "custom";

    return {
      ...restraints,
      type: preset,
      name: preset === "custom"
        ? "Custom"
        : this.getJointRestraintPreset(preset).name,
    };
  },

  assignJointRestraintsToSelected(restraints) {
    const selectedJoints = this.getSelectedJointsForAssign();

    if (!selectedJoints.length) {
      this.showMessage?.("No hay nodos seleccionados.", "warning");
      return;
    }

    selectedJoints.forEach((joint) => {
      joint.restraints = JSON.parse(JSON.stringify(restraints));

      // Compatibilidad con tu exportación actual
      joint.constraints = JSON.parse(JSON.stringify(restraints));

      joint.assignment = {
        ...(joint.assignment || {}),
        restraints: JSON.parse(JSON.stringify(restraints)),
      };

      joint.hasRestraints = this.jointHasAnyRestraint(restraints);
    });

    this.markAnalysisResultsOutdated?.("Se modificó el modelo o sus asignaciones.");
    this.redraw?.();

    this.showMessage?.(
      `Restraints asignados a ${selectedJoints.length} nodo(s).`
    );

    console.log("✅ Joint Restraints asignados:", {
      restraints,
      selectedJoints,
    });
  },

  jointHasAnyRestraint(restraints) {
    if (!restraints) return false;

    return (
      restraints.ux === true ||
      restraints.uy === true ||
      restraints.uz === true ||
      restraints.rx === true ||
      restraints.ry === true ||
      restraints.rz === true
    );
  },

  // =====================================================
  // ASSIGN > JOINT / POINT > DIAPHRAGMS
  // =====================================================

  getDefaultDiaphragmsForAssign() {
    return [
      {
        id: "D1",
        name: "D1",
        type: "rigid",
        description: "Diafragma rígido por defecto",
      },
    ];
  },

  getAvailableDiaphragmsForAssign() {
    const definedDiaphragms = this.diaphragms?.items;

    if (Array.isArray(definedDiaphragms) && definedDiaphragms.length > 0) {
      return definedDiaphragms.map((diaphragm, index) => {
        const id =
          diaphragm.id ||
          diaphragm.name ||
          diaphragm.diaphragmId ||
          `D${index + 1}`;

        const name =
          diaphragm.name ||
          diaphragm.diaphragmName ||
          String(id);

        return {
          ...diaphragm,
          id,
          name,
          type: diaphragm.type || "rigid",
        };
      });
    }

    return this.getDefaultDiaphragmsForAssign();
  },

  getDiaphragmForAssignById(diaphragmId) {
    return this.getAvailableDiaphragmsForAssign().find((diaphragm) => {
      return (
        String(diaphragm.id) === String(diaphragmId) ||
        String(diaphragm.name) === String(diaphragmId)
      );
    }) || null;
  },

  ensureDefaultDiaphragmExists() {
    if (!this.diaphragms) {
      this.diaphragms = {
        items: [],
        selectedDiaphragm: null,
      };
    }

    if (!Array.isArray(this.diaphragms.items)) {
      this.diaphragms.items = [];
    }

    const exists = this.diaphragms.items.some((d) => {
      return String(d.id || d.name) === "D1";
    });

    if (!exists) {
      this.diaphragms.items.push({
        id: "D1",
        name: "D1",
        type: "rigid",
        description: "Diafragma rígido por defecto",
      });
    }
  },

  async openAssignJointDiaphragmsDialog() {
    const selectedJoints = this.getSelectedJointsForAssign();

    if (!selectedJoints.length) {
      this.showMessage?.("Selecciona primero uno o más nodos / puntos.", "warning");
      return;
    }

    this.ensureDefaultDiaphragmExists();

    const diaphragms = this.getAvailableDiaphragmsForAssign();

    const inputOptions = {
      NONE: "None / Sin diafragma",
    };

    diaphragms.forEach((diaphragm) => {
      inputOptions[diaphragm.id] = `${diaphragm.name} (${diaphragm.type || "rigid"})`;
    });

    const currentId =
      selectedJoints[0]?.diaphragmId ||
      selectedJoints[0]?.diaphragm?.id ||
      "D1";

    const result = await Swal.fire({
      title: "Assign Diaphragm",
      width: 520,
      html: `
      <div style="text-align:left; font-size:13px;">
        <p style="margin-bottom:12px;">
          Asigna un diafragma a los nodos seleccionados.
        </p>

        <label style="display:block; margin-bottom:6px;">Diaphragm</label>

        <select id="assign-diaphragm-id" style="width:100%; padding:7px;">
          ${Object.entries(inputOptions)
          .map(([value, label]) => {
            const selected = String(value) === String(currentId) ? "selected" : "";
            return `<option value="${value}" ${selected}>${label}</option>`;
          })
          .join("")}
        </select>

        <div style="margin-top:14px; padding:10px; border:1px solid #555; border-radius:6px;">
          <b>Tipo:</b> Rigid Diaphragm<br>
          <span style="font-size:12px; color:#777;">
            En esta versión inicial se guarda la asignación. Luego el motor de análisis podrá usarla para restricciones de piso.
          </span>
        </div>

        <div style="margin-top:10px; color:#666; font-size:12px;">
          Nodos seleccionados: <b>${selectedJoints.length}</b>
        </div>
      </div>
    `,
      showCancelButton: true,
      confirmButtonText: "Asignar",
      cancelButtonText: "Cancelar",
      preConfirm: () => {
        return document.getElementById("assign-diaphragm-id")?.value || "NONE";
      },
    });

    if (!result.isConfirmed) return;

    this.assignJointDiaphragmToSelected(result.value);
  },

  assignJointDiaphragmToSelected(diaphragmId) {
    const selectedJoints = this.getSelectedJointsForAssign();

    if (!selectedJoints.length) {
      this.showMessage?.("No hay nodos seleccionados.", "warning");
      return;
    }

    if (String(diaphragmId) === "NONE") {
      selectedJoints.forEach((joint) => {
        joint.diaphragmId = null;
        joint.diaphragmName = null;
        joint.diaphragm = null;
        joint.hasDiaphragm = false;

        joint.assignment = {
          ...(joint.assignment || {}),
          diaphragm: null,
        };
      });

      this.redraw?.();

      this.showMessage?.(
        `Diafragma removido de ${selectedJoints.length} nodo(s).`
      );

      return;
    }

    const diaphragm = this.getDiaphragmForAssignById(diaphragmId);

    if (!diaphragm) {
      this.showMessage?.("El diafragma seleccionado no existe.", "warning");
      console.warn("Diaphragm no encontrado:", diaphragmId);
      return;
    }

    selectedJoints.forEach((joint) => {
      joint.diaphragmId = diaphragm.id;
      joint.diaphragmName = diaphragm.name;
      joint.diaphragm = JSON.parse(JSON.stringify(diaphragm));
      joint.hasDiaphragm = true;

      joint.assignment = {
        ...(joint.assignment || {}),
        diaphragm: {
          id: diaphragm.id,
          name: diaphragm.name,
          type: diaphragm.type || "rigid",
        },
      };
    });

    this.redraw?.();

    this.showMessage?.(
      `Diafragma ${diaphragm.name} asignado a ${selectedJoints.length} nodo(s).`
    );

    console.log("✅ Joint Diaphragm asignado:", {
      diaphragm,
      selectedJoints,
    });
  },

  // =====================================================
  // ASSIGN > JOINT / POINT > POINT SPRINGS
  // =====================================================

  getDefaultPointSprings() {
    return {
      name: "Point Spring",
      coordinateSystem: "Global",

      stiffness: {
        ux: 0,
        uy: 0,
        uz: 0,
        rx: 0,
        ry: 0,
        rz: 0,
      },
    };
  },

  getPointSpringPreset(preset = "custom") {
    const presets = {
      custom: this.getDefaultPointSprings(),

      vertical: {
        name: "Vertical Spring",
        coordinateSystem: "Global",
        stiffness: {
          ux: 0,
          uy: 0,
          uz: 10000,
          rx: 0,
          ry: 0,
          rz: 0,
        },
      },

      horizontal: {
        name: "Horizontal Springs",
        coordinateSystem: "Global",
        stiffness: {
          ux: 10000,
          uy: 10000,
          uz: 0,
          rx: 0,
          ry: 0,
          rz: 0,
        },
      },

      soil: {
        name: "Soil Springs XYZ",
        coordinateSystem: "Global",
        stiffness: {
          ux: 10000,
          uy: 10000,
          uz: 10000,
          rx: 0,
          ry: 0,
          rz: 0,
        },
      },

      rotational: {
        name: "Rotational Springs",
        coordinateSystem: "Global",
        stiffness: {
          ux: 0,
          uy: 0,
          uz: 0,
          rx: 1000,
          ry: 1000,
          rz: 1000,
        },
      },
    };

    return JSON.parse(JSON.stringify(presets[preset] || presets.custom));
  },

  async openAssignPointSpringsDialog() {
    const selectedJoints = this.getSelectedJointsForAssign();

    if (!selectedJoints.length) {
      this.showMessage?.("Selecciona primero uno o más nodos / puntos.", "warning");
      return;
    }

    const current =
      selectedJoints[0]?.pointSprings ||
      selectedJoints[0]?.springs ||
      this.getDefaultPointSprings();

    const k = current.stiffness || {};

    const result = await Swal.fire({
      title: "Assign Point Springs",
      width: 700,
      html: `
      <div style="text-align:left; font-size:13px;">

        <p style="margin-bottom:12px;">
          Asigna rigideces de resorte a los nodos seleccionados.
        </p>

        <div style="display:grid; grid-template-columns: 1fr 1fr; gap:12px; margin-bottom:12px;">
          <div>
            <label style="display:block; margin-bottom:5px;">Preset</label>
            <select id="point-spring-preset" style="width:100%; padding:7px;">
              <option value="custom">Custom</option>
              <option value="vertical">Vertical Spring</option>
              <option value="horizontal">Horizontal Springs</option>
              <option value="soil">Soil Springs XYZ</option>
              <option value="rotational">Rotational Springs</option>
            </select>
          </div>

          <div>
            <label style="display:block; margin-bottom:5px;">Coordinate System</label>
            <select id="point-spring-csys" style="width:100%; padding:7px;">
              <option value="Global">Global</option>
              <option value="Local">Local</option>
            </select>
          </div>
        </div>

        <table style="width:100%; border-collapse:collapse; font-size:12px;">
          <thead>
            <tr style="background:#1f2937; color:white;">
              <th style="border:1px solid #555; padding:6px;">DOF</th>
              <th style="border:1px solid #555; padding:6px;">Stiffness</th>
              <th style="border:1px solid #555; padding:6px;">Unidad referencial</th>
            </tr>
          </thead>

          <tbody>
            <tr>
              <td style="border:1px solid #555; padding:6px;">U1 / UX</td>
              <td style="border:1px solid #555; padding:6px;">
                <input id="spring-ux" type="number" step="0.001" value="${Number(k.ux || 0)}" style="width:100%; padding:5px;">
              </td>
              <td style="border:1px solid #555; padding:6px;">kN/m</td>
            </tr>

            <tr>
              <td style="border:1px solid #555; padding:6px;">U2 / UY</td>
              <td style="border:1px solid #555; padding:6px;">
                <input id="spring-uy" type="number" step="0.001" value="${Number(k.uy || 0)}" style="width:100%; padding:5px;">
              </td>
              <td style="border:1px solid #555; padding:6px;">kN/m</td>
            </tr>

            <tr>
              <td style="border:1px solid #555; padding:6px;">U3 / UZ</td>
              <td style="border:1px solid #555; padding:6px;">
                <input id="spring-uz" type="number" step="0.001" value="${Number(k.uz || 0)}" style="width:100%; padding:5px;">
              </td>
              <td style="border:1px solid #555; padding:6px;">kN/m</td>
            </tr>

            <tr>
              <td style="border:1px solid #555; padding:6px;">R1 / RX</td>
              <td style="border:1px solid #555; padding:6px;">
                <input id="spring-rx" type="number" step="0.001" value="${Number(k.rx || 0)}" style="width:100%; padding:5px;">
              </td>
              <td style="border:1px solid #555; padding:6px;">kN·m/rad</td>
            </tr>

            <tr>
              <td style="border:1px solid #555; padding:6px;">R2 / RY</td>
              <td style="border:1px solid #555; padding:6px;">
                <input id="spring-ry" type="number" step="0.001" value="${Number(k.ry || 0)}" style="width:100%; padding:5px;">
              </td>
              <td style="border:1px solid #555; padding:6px;">kN·m/rad</td>
            </tr>

            <tr>
              <td style="border:1px solid #555; padding:6px;">R3 / RZ</td>
              <td style="border:1px solid #555; padding:6px;">
                <input id="spring-rz" type="number" step="0.001" value="${Number(k.rz || 0)}" style="width:100%; padding:5px;">
              </td>
              <td style="border:1px solid #555; padding:6px;">kN·m/rad</td>
            </tr>
          </tbody>
        </table>

        <div style="margin-top:10px; color:#666; font-size:12px;">
          Nodos seleccionados: <b>${selectedJoints.length}</b>
        </div>

      </div>
    `,
      showCancelButton: true,
      showDenyButton: true,
      confirmButtonText: "Asignar",
      denyButtonText: "Remover",
      cancelButtonText: "Cancelar",

      didOpen: () => {
        document.getElementById("point-spring-csys").value =
          current.coordinateSystem || "Global";

        const applyPreset = (preset) => {
          if (preset === "custom") return;

          const values = this.getPointSpringPreset(preset);
          const stiffness = values.stiffness;

          document.getElementById("spring-ux").value = stiffness.ux;
          document.getElementById("spring-uy").value = stiffness.uy;
          document.getElementById("spring-uz").value = stiffness.uz;
          document.getElementById("spring-rx").value = stiffness.rx;
          document.getElementById("spring-ry").value = stiffness.ry;
          document.getElementById("spring-rz").value = stiffness.rz;
        };

        document
          .getElementById("point-spring-preset")
          ?.addEventListener("change", (event) => {
            applyPreset(event.target.value);
          });
      },

      preConfirm: () => {
        return this.readPointSpringsFromDialog();
      },
    });

    if (result.isDenied) {
      this.removePointSpringsFromSelected();
      return;
    }

    if (!result.isConfirmed || !result.value) return;

    this.assignPointSpringsToSelected(result.value);
  },

  readPointSpringsFromDialog() {
    const readNumber = (id) => {
      const value = Number(document.getElementById(id)?.value || 0);
      return Number.isFinite(value) ? value : 0;
    };

    const preset = document.getElementById("point-spring-preset")?.value || "custom";

    return {
      name:
        preset === "custom"
          ? "Point Spring"
          : this.getPointSpringPreset(preset).name,

      preset,

      coordinateSystem:
        document.getElementById("point-spring-csys")?.value || "Global",

      stiffness: {
        ux: readNumber("spring-ux"),
        uy: readNumber("spring-uy"),
        uz: readNumber("spring-uz"),
        rx: readNumber("spring-rx"),
        ry: readNumber("spring-ry"),
        rz: readNumber("spring-rz"),
      },
    };
  },

  assignPointSpringsToSelected(pointSprings) {
    const selectedJoints = this.getSelectedJointsForAssign();

    if (!selectedJoints.length) {
      this.showMessage?.("No hay nodos seleccionados.", "warning");
      return;
    }

    selectedJoints.forEach((joint) => {
      joint.pointSprings = JSON.parse(JSON.stringify(pointSprings));

      // Alias para compatibilidad futura
      joint.springs = JSON.parse(JSON.stringify(pointSprings));

      joint.assignment = {
        ...(joint.assignment || {}),
        pointSprings: JSON.parse(JSON.stringify(pointSprings)),
      };

      joint.hasPointSprings = this.jointHasPointSprings(pointSprings);
    });

    this.markAnalysisResultsOutdated?.("Se modificó el modelo o sus asignaciones.");
    this.redraw?.();

    this.showMessage?.(
      `Point Springs asignado a ${selectedJoints.length} nodo(s).`
    );

    console.log("✅ Point Springs asignados:", {
      pointSprings,
      selectedJoints,
    });
  },

  removePointSpringsFromSelected() {
    const selectedJoints = this.getSelectedJointsForAssign();

    if (!selectedJoints.length) {
      this.showMessage?.("No hay nodos seleccionados.", "warning");
      return;
    }

    selectedJoints.forEach((joint) => {
      joint.pointSprings = null;
      joint.springs = null;
      joint.hasPointSprings = false;

      joint.assignment = {
        ...(joint.assignment || {}),
        pointSprings: null,
      };
    });

    this.redraw?.();

    this.showMessage?.(
      `Point Springs removido de ${selectedJoints.length} nodo(s).`
    );
  },

  jointHasPointSprings(pointSprings) {
    if (!pointSprings?.stiffness) return false;

    const k = pointSprings.stiffness;

    return (
      Number(k.ux || 0) !== 0 ||
      Number(k.uy || 0) !== 0 ||
      Number(k.uz || 0) !== 0 ||
      Number(k.rx || 0) !== 0 ||
      Number(k.ry || 0) !== 0 ||
      Number(k.rz || 0) !== 0
    );
  },

  // =====================================================
  // ASSIGN > JOINT / POINT LOADS > FORCE
  // =====================================================

  getAvailableLoadCasesForAssign() {
    if (Array.isArray(this.loadCases?.cases) && this.loadCases.cases.length > 0) {
      return this.loadCases.cases.map((loadCase) => ({
        name: loadCase.name,
        type: loadCase.type || "Static",
      }));
    }

    if (Array.isArray(this.staticLoadCases?.items) && this.staticLoadCases.items.length > 0) {
      return this.staticLoadCases.items.map((loadCase) => ({
        name: loadCase.name,
        type: loadCase.type || "Static",
      }));
    }

    if (Array.isArray(this.availableLoads) && this.availableLoads.length > 0) {
      return this.availableLoads.map((loadCase) => ({
        name: loadCase.name,
        type: loadCase.type || "Static",
      }));
    }

    return [
      { name: "DEAD", type: "Dead" },
      { name: "LIVE", type: "Live" },
      { name: "EQ_X", type: "Seismic" },
      { name: "EQ_Y", type: "Seismic" },
    ];
  },

  getDefaultJointPointForceLoad() {
    return {
      id: `JLOAD_${Date.now()}`,
      type: "force",
      loadCase: "DEAD",
      coordinateSystem: "Global",

      forces: {
        fx: 0,
        fy: 0,
        fz: 0,
        mx: 0,
        my: 0,
        mz: 0,
      },
    };
  },

  async openAssignJointPointForceDialog() {
    const selectedJoints = this.getSelectedJointsForAssign();

    if (!selectedJoints.length) {
      this.showMessage?.("Selecciona primero uno o más nodos / puntos.", "warning");
      return;
    }

    const loadCases = this.getAvailableLoadCasesForAssign();
    const current = this.getDefaultJointPointForceLoad();

    if (loadCases.length > 0) {
      current.loadCase = loadCases[0].name;
    }

    const result = await Swal.fire({
      title: "Assign Joint / Point Loads - Force",
      width: 720,
      html: `
      <div style="text-align:left; font-size:13px;">

        <p style="margin-bottom:12px;">
          Asigna fuerzas y momentos concentrados a los nodos seleccionados.
        </p>

        <div style="display:grid; grid-template-columns: 1fr 1fr 1fr; gap:12px; margin-bottom:12px;">
          <div>
            <label style="display:block; margin-bottom:5px;">Load Case</label>
            <select id="joint-force-loadcase" style="width:100%; padding:7px;">
              ${loadCases.map((lc) => `
                <option value="${lc.name}">${lc.name} (${lc.type})</option>
              `).join("")}
            </select>
          </div>

          <div>
            <label style="display:block; margin-bottom:5px;">Coordinate System</label>
            <select id="joint-force-csys" style="width:100%; padding:7px;">
              <option value="Global">Global</option>
              <option value="Local">Local</option>
            </select>
          </div>

          <div>
            <label style="display:block; margin-bottom:5px;">Operation</label>
            <select id="joint-force-operation" style="width:100%; padding:7px;">
              <option value="replace">Replace Existing Loads</option>
              <option value="add">Add to Existing Loads</option>
              <option value="delete">Delete Existing Loads</option>
            </select>
          </div>
        </div>

        <table style="width:100%; border-collapse:collapse; font-size:12px;">
          <thead>
            <tr style="background:#1f2937; color:white;">
              <th style="border:1px solid #555; padding:6px;">Componente</th>
              <th style="border:1px solid #555; padding:6px;">Valor</th>
              <th style="border:1px solid #555; padding:6px;">Unidad referencial</th>
            </tr>
          </thead>

          <tbody>
            <tr>
              <td style="border:1px solid #555; padding:6px;">FX</td>
              <td style="border:1px solid #555; padding:6px;">
                <input id="joint-force-fx" type="number" step="0.001" value="0" style="width:100%; padding:5px;">
              </td>
              <td style="border:1px solid #555; padding:6px;">kN</td>
            </tr>

            <tr>
              <td style="border:1px solid #555; padding:6px;">FY</td>
              <td style="border:1px solid #555; padding:6px;">
                <input id="joint-force-fy" type="number" step="0.001" value="0" style="width:100%; padding:5px;">
              </td>
              <td style="border:1px solid #555; padding:6px;">kN</td>
            </tr>

            <tr>
              <td style="border:1px solid #555; padding:6px;">FZ</td>
              <td style="border:1px solid #555; padding:6px;">
                <input id="joint-force-fz" type="number" step="0.001" value="-10" style="width:100%; padding:5px;">
              </td>
              <td style="border:1px solid #555; padding:6px;">kN</td>
            </tr>

            <tr>
              <td style="border:1px solid #555; padding:6px;">MX</td>
              <td style="border:1px solid #555; padding:6px;">
                <input id="joint-force-mx" type="number" step="0.001" value="0" style="width:100%; padding:5px;">
              </td>
              <td style="border:1px solid #555; padding:6px;">kN·m</td>
            </tr>

            <tr>
              <td style="border:1px solid #555; padding:6px;">MY</td>
              <td style="border:1px solid #555; padding:6px;">
                <input id="joint-force-my" type="number" step="0.001" value="0" style="width:100%; padding:5px;">
              </td>
              <td style="border:1px solid #555; padding:6px;">kN·m</td>
            </tr>

            <tr>
              <td style="border:1px solid #555; padding:6px;">MZ</td>
              <td style="border:1px solid #555; padding:6px;">
                <input id="joint-force-mz" type="number" step="0.001" value="0" style="width:100%; padding:5px;">
              </td>
              <td style="border:1px solid #555; padding:6px;">kN·m</td>
            </tr>
          </tbody>
        </table>

        <div style="margin-top:10px; color:#666; font-size:12px;">
          Nodos seleccionados: <b>${selectedJoints.length}</b>
        </div>

      </div>
    `,
      showCancelButton: true,
      confirmButtonText: "Asignar",
      cancelButtonText: "Cancelar",
      preConfirm: () => {
        return this.readJointPointForceFromDialog();
      },
    });

    if (!result.isConfirmed || !result.value) return;

    this.assignJointPointForceToSelected(result.value);
  },

  readJointPointForceFromDialog() {
    const readNumber = (id) => {
      const value = Number(document.getElementById(id)?.value || 0);
      return Number.isFinite(value) ? value : 0;
    };

    return {
      id: `JLOAD_${Date.now()}`,
      type: "force",

      loadCase:
        document.getElementById("joint-force-loadcase")?.value || "DEAD",

      coordinateSystem:
        document.getElementById("joint-force-csys")?.value || "Global",

      operation:
        document.getElementById("joint-force-operation")?.value || "replace",

      forces: {
        fx: readNumber("joint-force-fx"),
        fy: readNumber("joint-force-fy"),
        fz: readNumber("joint-force-fz"),
        mx: readNumber("joint-force-mx"),
        my: readNumber("joint-force-my"),
        mz: readNumber("joint-force-mz"),
      },
    };
  },

  jointPointForceHasValues(load) {
    if (!load?.forces) return false;

    const f = load.forces;

    return (
      Number(f.fx || 0) !== 0 ||
      Number(f.fy || 0) !== 0 ||
      Number(f.fz || 0) !== 0 ||
      Number(f.mx || 0) !== 0 ||
      Number(f.my || 0) !== 0 ||
      Number(f.mz || 0) !== 0
    );
  },

  assignJointPointForceToSelected(load) {
    const selectedJoints = this.getSelectedJointsForAssign();

    if (!selectedJoints.length) {
      this.showMessage?.("No hay nodos seleccionados.", "warning");
      return;
    }

    const operation = load.operation || "replace";
    const loadCase = load.loadCase || "DEAD";

    selectedJoints.forEach((joint) => {
      if (!Array.isArray(joint.pointLoads)) {
        joint.pointLoads = [];
      }

      if (!Array.isArray(joint.jointLoads)) {
        joint.jointLoads = [];
      }

      if (operation === "delete") {
        joint.pointLoads = joint.pointLoads.filter((item) => {
          return !(item.type === "force" && item.loadCase === loadCase);
        });

        joint.jointLoads = joint.jointLoads.filter((item) => {
          return !(item.type === "force" && item.loadCase === loadCase);
        });
      }

      if (operation === "replace") {
        joint.pointLoads = joint.pointLoads.filter((item) => {
          return !(item.type === "force" && item.loadCase === loadCase);
        });

        joint.jointLoads = joint.jointLoads.filter((item) => {
          return !(item.type === "force" && item.loadCase === loadCase);
        });

        if (this.jointPointForceHasValues(load)) {
          const cleanLoad = {
            ...JSON.parse(JSON.stringify(load)),
            operation: undefined,
          };

          joint.pointLoads.push(cleanLoad);
          joint.jointLoads.push(cleanLoad);
        }
      }

      if (operation === "add") {
        if (this.jointPointForceHasValues(load)) {
          const cleanLoad = {
            ...JSON.parse(JSON.stringify(load)),
            operation: undefined,
          };

          joint.pointLoads.push(cleanLoad);
          joint.jointLoads.push(cleanLoad);
        }
      }

      joint.hasPointLoads = Array.isArray(joint.pointLoads) && joint.pointLoads.length > 0;
      joint.hasJointLoads = joint.hasPointLoads;

      joint.assignment = {
        ...(joint.assignment || {}),
        pointLoads: joint.pointLoads,
        jointLoads: joint.jointLoads,
      };
    });

    this.markAnalysisResultsOutdated?.("Se modificó el modelo o sus asignaciones.");
    this.redraw?.();

    const actionText =
      operation === "delete"
        ? "removidas"
        : "asignadas";

    this.showMessage?.(
      `Cargas puntuales ${actionText} en ${selectedJoints.length} nodo(s).`
    );

    console.log("✅ Joint / Point Force asignado:", {
      load,
      selectedJoints,
    });
  },

  // =====================================================
  // ASSIGN > JOINT / POINT LOADS > GROUND DISPLACEMENT
  // =====================================================

  getDefaultJointGroundDisplacementLoad() {
    return {
      id: `JDISP_${Date.now()}`,
      type: "ground-displacement",
      loadCase: "DEAD",
      coordinateSystem: "Global",

      displacements: {
        ux: 0,
        uy: 0,
        uz: 0,
        rx: 0,
        ry: 0,
        rz: 0,
      },
    };
  },

  async openAssignJointGroundDisplacementDialog() {
    const selectedJoints = this.getSelectedJointsForAssign();

    if (!selectedJoints.length) {
      this.showMessage?.("Selecciona primero uno o más nodos / puntos.", "warning");
      return;
    }

    const loadCases = this.getAvailableLoadCasesForAssign();
    const current = this.getDefaultJointGroundDisplacementLoad();

    if (loadCases.length > 0) {
      current.loadCase = loadCases[0].name;
    }

    const result = await Swal.fire({
      title: "Assign Joint / Point Loads - Ground Displacement",
      width: 740,
      html: `
      <div style="text-align:left; font-size:13px;">

        <p style="margin-bottom:12px;">
          Asigna desplazamientos impuestos a los nodos seleccionados.
        </p>

        <div style="display:grid; grid-template-columns: 1fr 1fr 1fr; gap:12px; margin-bottom:12px;">
          <div>
            <label style="display:block; margin-bottom:5px;">Load Case</label>
            <select id="joint-disp-loadcase" style="width:100%; padding:7px;">
              ${loadCases.map((lc) => `
                <option value="${lc.name}">${lc.name} (${lc.type})</option>
              `).join("")}
            </select>
          </div>

          <div>
            <label style="display:block; margin-bottom:5px;">Coordinate System</label>
            <select id="joint-disp-csys" style="width:100%; padding:7px;">
              <option value="Global">Global</option>
              <option value="Local">Local</option>
            </select>
          </div>

          <div>
            <label style="display:block; margin-bottom:5px;">Operation</label>
            <select id="joint-disp-operation" style="width:100%; padding:7px;">
              <option value="replace">Replace Existing Loads</option>
              <option value="add">Add to Existing Loads</option>
              <option value="delete">Delete Existing Loads</option>
            </select>
          </div>
        </div>

        <table style="width:100%; border-collapse:collapse; font-size:12px;">
          <thead>
            <tr style="background:#1f2937; color:white;">
              <th style="border:1px solid #555; padding:6px;">Componente</th>
              <th style="border:1px solid #555; padding:6px;">Valor</th>
              <th style="border:1px solid #555; padding:6px;">Unidad referencial</th>
            </tr>
          </thead>

          <tbody>
            <tr>
              <td style="border:1px solid #555; padding:6px;">U1 / UX</td>
              <td style="border:1px solid #555; padding:6px;">
                <input id="joint-disp-ux" type="number" step="0.000001" value="0" style="width:100%; padding:5px;">
              </td>
              <td style="border:1px solid #555; padding:6px;">m</td>
            </tr>

            <tr>
              <td style="border:1px solid #555; padding:6px;">U2 / UY</td>
              <td style="border:1px solid #555; padding:6px;">
                <input id="joint-disp-uy" type="number" step="0.000001" value="0" style="width:100%; padding:5px;">
              </td>
              <td style="border:1px solid #555; padding:6px;">m</td>
            </tr>

            <tr>
              <td style="border:1px solid #555; padding:6px;">U3 / UZ</td>
              <td style="border:1px solid #555; padding:6px;">
                <input id="joint-disp-uz" type="number" step="0.000001" value="0.01" style="width:100%; padding:5px;">
              </td>
              <td style="border:1px solid #555; padding:6px;">m</td>
            </tr>

            <tr>
              <td style="border:1px solid #555; padding:6px;">R1 / RX</td>
              <td style="border:1px solid #555; padding:6px;">
                <input id="joint-disp-rx" type="number" step="0.000001" value="0" style="width:100%; padding:5px;">
              </td>
              <td style="border:1px solid #555; padding:6px;">rad</td>
            </tr>

            <tr>
              <td style="border:1px solid #555; padding:6px;">R2 / RY</td>
              <td style="border:1px solid #555; padding:6px;">
                <input id="joint-disp-ry" type="number" step="0.000001" value="0" style="width:100%; padding:5px;">
              </td>
              <td style="border:1px solid #555; padding:6px;">rad</td>
            </tr>

            <tr>
              <td style="border:1px solid #555; padding:6px;">R3 / RZ</td>
              <td style="border:1px solid #555; padding:6px;">
                <input id="joint-disp-rz" type="number" step="0.000001" value="0" style="width:100%; padding:5px;">
              </td>
              <td style="border:1px solid #555; padding:6px;">rad</td>
            </tr>
          </tbody>
        </table>

        <div style="margin-top:10px; color:#666; font-size:12px;">
          Nodos seleccionados: <b>${selectedJoints.length}</b>
        </div>

      </div>
    `,
      showCancelButton: true,
      confirmButtonText: "Asignar",
      cancelButtonText: "Cancelar",
      preConfirm: () => {
        return this.readJointGroundDisplacementFromDialog();
      },
    });

    if (!result.isConfirmed || !result.value) return;

    this.assignJointGroundDisplacementToSelected(result.value);
  },

  readJointGroundDisplacementFromDialog() {
    const readNumber = (id) => {
      const value = Number(document.getElementById(id)?.value || 0);
      return Number.isFinite(value) ? value : 0;
    };

    return {
      id: `JDISP_${Date.now()}`,
      type: "ground-displacement",

      loadCase:
        document.getElementById("joint-disp-loadcase")?.value || "DEAD",

      coordinateSystem:
        document.getElementById("joint-disp-csys")?.value || "Global",

      operation:
        document.getElementById("joint-disp-operation")?.value || "replace",

      displacements: {
        ux: readNumber("joint-disp-ux"),
        uy: readNumber("joint-disp-uy"),
        uz: readNumber("joint-disp-uz"),
        rx: readNumber("joint-disp-rx"),
        ry: readNumber("joint-disp-ry"),
        rz: readNumber("joint-disp-rz"),
      },
    };
  },

  jointGroundDisplacementHasValues(load) {
    if (!load?.displacements) return false;

    const d = load.displacements;

    return (
      Number(d.ux || 0) !== 0 ||
      Number(d.uy || 0) !== 0 ||
      Number(d.uz || 0) !== 0 ||
      Number(d.rx || 0) !== 0 ||
      Number(d.ry || 0) !== 0 ||
      Number(d.rz || 0) !== 0
    );
  },

  assignJointGroundDisplacementToSelected(load) {
    const selectedJoints = this.getSelectedJointsForAssign();

    if (!selectedJoints.length) {
      this.showMessage?.("No hay nodos seleccionados.", "warning");
      return;
    }

    const operation = load.operation || "replace";
    const loadCase = load.loadCase || "DEAD";

    selectedJoints.forEach((joint) => {
      if (!Array.isArray(joint.pointLoads)) {
        joint.pointLoads = [];
      }

      if (!Array.isArray(joint.jointLoads)) {
        joint.jointLoads = [];
      }

      if (operation === "delete") {
        joint.pointLoads = joint.pointLoads.filter((item) => {
          return !(item.type === "ground-displacement" && item.loadCase === loadCase);
        });

        joint.jointLoads = joint.jointLoads.filter((item) => {
          return !(item.type === "ground-displacement" && item.loadCase === loadCase);
        });
      }

      if (operation === "replace") {
        joint.pointLoads = joint.pointLoads.filter((item) => {
          return !(item.type === "ground-displacement" && item.loadCase === loadCase);
        });

        joint.jointLoads = joint.jointLoads.filter((item) => {
          return !(item.type === "ground-displacement" && item.loadCase === loadCase);
        });

        if (this.jointGroundDisplacementHasValues(load)) {
          const cleanLoad = {
            ...JSON.parse(JSON.stringify(load)),
            operation: undefined,
          };

          joint.pointLoads.push(cleanLoad);
          joint.jointLoads.push(cleanLoad);
        }
      }

      if (operation === "add") {
        if (this.jointGroundDisplacementHasValues(load)) {
          const cleanLoad = {
            ...JSON.parse(JSON.stringify(load)),
            operation: undefined,
          };

          joint.pointLoads.push(cleanLoad);
          joint.jointLoads.push(cleanLoad);
        }
      }

      joint.hasPointLoads = Array.isArray(joint.pointLoads) && joint.pointLoads.length > 0;
      joint.hasJointLoads = joint.hasPointLoads;

      joint.assignment = {
        ...(joint.assignment || {}),
        pointLoads: joint.pointLoads,
        jointLoads: joint.jointLoads,
      };
    });

    this.markAnalysisResultsOutdated?.("Se modificó el modelo o sus asignaciones.");
    this.redraw?.();

    const actionText =
      operation === "delete"
        ? "removidos"
        : "asignados";

    this.showMessage?.(
      `Ground Displacements ${actionText} en ${selectedJoints.length} nodo(s).`
    );

    console.log("✅ Joint / Point Ground Displacement asignado:", {
      load,
      selectedJoints,
    });
  },

  // =====================================================
  // ASSIGN > JOINT / POINT LOADS > TEMPERATURE
  // =====================================================

  getDefaultJointTemperatureLoad() {
    return {
      id: `JTEMP_${Date.now()}`,
      type: "temperature",
      loadCase: "DEAD",
      coordinateSystem: "Global",

      temperature: {
        deltaT: 0,
        initialTemperature: 20,
        finalTemperature: 20,
      },
    };
  },

  async openAssignJointTemperatureDialog() {
    const selectedJoints = this.getSelectedJointsForAssign();

    if (!selectedJoints.length) {
      this.showMessage?.("Selecciona primero uno o más nodos / puntos.", "warning");
      return;
    }

    const loadCases = this.getAvailableLoadCasesForAssign();
    const current = this.getDefaultJointTemperatureLoad();

    if (loadCases.length > 0) {
      current.loadCase = loadCases[0].name;
    }

    const result = await Swal.fire({
      title: "Assign Joint / Point Loads - Temperature",
      width: 650,
      html: `
      <div style="text-align:left; font-size:13px;">

        <p style="margin-bottom:12px;">
          Asigna carga de temperatura a los nodos seleccionados.
        </p>

        <div style="display:grid; grid-template-columns: 1fr 1fr; gap:12px; margin-bottom:12px;">
          <div>
            <label style="display:block; margin-bottom:5px;">Load Case</label>
            <select id="joint-temp-loadcase" style="width:100%; padding:7px;">
              ${loadCases.map((lc) => `
                <option value="${lc.name}">${lc.name} (${lc.type})</option>
              `).join("")}
            </select>
          </div>

          <div>
            <label style="display:block; margin-bottom:5px;">Operation</label>
            <select id="joint-temp-operation" style="width:100%; padding:7px;">
              <option value="replace">Replace Existing Loads</option>
              <option value="add">Add to Existing Loads</option>
              <option value="delete">Delete Existing Loads</option>
            </select>
          </div>
        </div>

        <table style="width:100%; border-collapse:collapse; font-size:12px;">
          <thead>
            <tr style="background:#1f2937; color:white;">
              <th style="border:1px solid #555; padding:6px;">Dato</th>
              <th style="border:1px solid #555; padding:6px;">Valor</th>
              <th style="border:1px solid #555; padding:6px;">Unidad</th>
            </tr>
          </thead>

          <tbody>
            <tr>
              <td style="border:1px solid #555; padding:6px;">Initial Temperature</td>
              <td style="border:1px solid #555; padding:6px;">
                <input id="joint-temp-initial" type="number" step="0.001" value="20" style="width:100%; padding:5px;">
              </td>
              <td style="border:1px solid #555; padding:6px;">°C</td>
            </tr>

            <tr>
              <td style="border:1px solid #555; padding:6px;">Final Temperature</td>
              <td style="border:1px solid #555; padding:6px;">
                <input id="joint-temp-final" type="number" step="0.001" value="30" style="width:100%; padding:5px;">
              </td>
              <td style="border:1px solid #555; padding:6px;">°C</td>
            </tr>

            <tr>
              <td style="border:1px solid #555; padding:6px;">Temperature Change ΔT</td>
              <td style="border:1px solid #555; padding:6px;">
                <input id="joint-temp-delta" type="number" step="0.001" value="10" style="width:100%; padding:5px;">
              </td>
              <td style="border:1px solid #555; padding:6px;">°C</td>
            </tr>
          </tbody>
        </table>

        <div style="margin-top:12px; padding:10px; border:1px solid #555; border-radius:6px;">
          <span style="font-size:12px; color:#777;">
            En esta versión inicial se guarda la carga de temperatura en el nodo. Luego podrá conectarse al motor de análisis.
          </span>
        </div>

        <div style="margin-top:10px; color:#666; font-size:12px;">
          Nodos seleccionados: <b>${selectedJoints.length}</b>
        </div>

      </div>
    `,
      showCancelButton: true,
      confirmButtonText: "Asignar",
      cancelButtonText: "Cancelar",

      didOpen: () => {
        const initialInput = document.getElementById("joint-temp-initial");
        const finalInput = document.getElementById("joint-temp-final");
        const deltaInput = document.getElementById("joint-temp-delta");

        const updateDelta = () => {
          const ti = Number(initialInput?.value || 0);
          const tf = Number(finalInput?.value || 0);
          deltaInput.value = tf - ti;
        };

        initialInput?.addEventListener("input", updateDelta);
        finalInput?.addEventListener("input", updateDelta);
      },

      preConfirm: () => {
        return this.readJointTemperatureFromDialog();
      },
    });

    if (!result.isConfirmed || !result.value) return;

    this.assignJointTemperatureToSelected(result.value);
  },

  readJointTemperatureFromDialog() {
    const readNumber = (id) => {
      const value = Number(document.getElementById(id)?.value || 0);
      return Number.isFinite(value) ? value : 0;
    };

    const initialTemperature = readNumber("joint-temp-initial");
    const finalTemperature = readNumber("joint-temp-final");

    return {
      id: `JTEMP_${Date.now()}`,
      type: "temperature",

      loadCase:
        document.getElementById("joint-temp-loadcase")?.value || "DEAD",

      operation:
        document.getElementById("joint-temp-operation")?.value || "replace",

      temperature: {
        initialTemperature,
        finalTemperature,
        deltaT: readNumber("joint-temp-delta"),
      },
    };
  },

  jointTemperatureHasValues(load) {
    if (!load?.temperature) return false;

    const t = load.temperature;

    return (
      Number(t.deltaT || 0) !== 0 ||
      Number(t.initialTemperature || 0) !== Number(t.finalTemperature || 0)
    );
  },

  assignJointTemperatureToSelected(load) {
    const selectedJoints = this.getSelectedJointsForAssign();

    if (!selectedJoints.length) {
      this.showMessage?.("No hay nodos seleccionados.", "warning");
      return;
    }

    const operation = load.operation || "replace";
    const loadCase = load.loadCase || "DEAD";

    selectedJoints.forEach((joint) => {
      if (!Array.isArray(joint.pointLoads)) {
        joint.pointLoads = [];
      }

      if (!Array.isArray(joint.jointLoads)) {
        joint.jointLoads = [];
      }

      if (operation === "delete") {
        joint.pointLoads = joint.pointLoads.filter((item) => {
          return !(item.type === "temperature" && item.loadCase === loadCase);
        });

        joint.jointLoads = joint.jointLoads.filter((item) => {
          return !(item.type === "temperature" && item.loadCase === loadCase);
        });
      }

      if (operation === "replace") {
        joint.pointLoads = joint.pointLoads.filter((item) => {
          return !(item.type === "temperature" && item.loadCase === loadCase);
        });

        joint.jointLoads = joint.jointLoads.filter((item) => {
          return !(item.type === "temperature" && item.loadCase === loadCase);
        });

        if (this.jointTemperatureHasValues(load)) {
          const cleanLoad = JSON.parse(JSON.stringify(load));
          delete cleanLoad.operation;

          joint.pointLoads.push(cleanLoad);
          joint.jointLoads.push(cleanLoad);
        }
      }

      if (operation === "add") {
        if (this.jointTemperatureHasValues(load)) {
          const cleanLoad = JSON.parse(JSON.stringify(load));
          delete cleanLoad.operation;

          joint.pointLoads.push(cleanLoad);
          joint.jointLoads.push(cleanLoad);
        }
      }

      joint.hasPointLoads = Array.isArray(joint.pointLoads) && joint.pointLoads.length > 0;
      joint.hasJointLoads = joint.hasPointLoads;

      joint.assignment = {
        ...(joint.assignment || {}),
        pointLoads: joint.pointLoads,
        jointLoads: joint.jointLoads,
      };
    });

    this.markAnalysisResultsOutdated?.("Se modificó el modelo o sus asignaciones.");
    this.redraw?.();

    const actionText =
      operation === "delete"
        ? "removidas"
        : "asignadas";

    this.showMessage?.(
      `Cargas de temperatura ${actionText} en ${selectedJoints.length} nodo(s).`
    );

    console.log("✅ Joint / Point Temperature asignado:", {
      load,
      selectedJoints,
    });
  },

  // =====================================================
  // ASSIGN > FRAME / LINE LOADS > POINT
  // =====================================================

  getDefaultFramePointLoad() {
    return {
      id: `FPOINT_${Date.now()}`,
      type: "point",
      loadCase: "DEAD",
      coordinateSystem: "Global",

      loadType: "force", // force | moment
      direction: "FZ",

      distanceType: "relative", // relative | absolute
      relativeDistance: 0.5,
      absoluteDistance: 0,

      value: -10,
    };
  },

  async openAssignFramePointLoadDialog() {
    const selectedFrames = this.getSelectedFramesForAssign();

    if (!selectedFrames.length) {
      this.showMessage?.("Selecciona primero uno o más elementos Frame / Line.", "warning");
      return;
    }

    const loadCases = this.getAvailableLoadCasesForAssign();
    const current = this.getDefaultFramePointLoad();

    if (loadCases.length > 0) {
      current.loadCase = loadCases[0].name;
    }

    const result = await Swal.fire({
      title: "Assign Frame / Line Loads - Point",
      width: 760,
      html: `
      <div style="text-align:left; font-size:13px;">

        <p style="margin-bottom:12px;">
          Asigna una carga puntual sobre los elementos Frame / Line seleccionados.
        </p>

        <div style="display:grid; grid-template-columns: 1fr 1fr 1fr; gap:12px; margin-bottom:12px;">
          <div>
            <label style="display:block; margin-bottom:5px;">Load Case</label>
            <select id="frame-point-loadcase" style="width:100%; padding:7px;">
              ${loadCases.map((lc) => `
                <option value="${lc.name}">${lc.name} (${lc.type})</option>
              `).join("")}
            </select>
          </div>

          <div>
            <label style="display:block; margin-bottom:5px;">Coordinate System</label>
            <select id="frame-point-csys" style="width:100%; padding:7px;">
              <option value="Global">Global</option>
              <option value="Local">Local</option>
            </select>
          </div>

          <div>
            <label style="display:block; margin-bottom:5px;">Operation</label>
            <select id="frame-point-operation" style="width:100%; padding:7px;">
              <option value="replace">Replace Existing Loads</option>
              <option value="add">Add to Existing Loads</option>
              <option value="delete">Delete Existing Loads</option>
            </select>
          </div>
        </div>

        <div style="display:grid; grid-template-columns: 1fr 1fr 1fr; gap:12px; margin-bottom:12px;">
          <div>
            <label style="display:block; margin-bottom:5px;">Load Type</label>
            <select id="frame-point-loadtype" style="width:100%; padding:7px;">
              <option value="force">Force</option>
              <option value="moment">Moment</option>
            </select>
          </div>

          <div>
            <label style="display:block; margin-bottom:5px;">Direction</label>
            <select id="frame-point-direction" style="width:100%; padding:7px;">
              <option value="FX">FX</option>
              <option value="FY">FY</option>
              <option value="FZ" selected>FZ</option>
              <option value="MX">MX</option>
              <option value="MY">MY</option>
              <option value="MZ">MZ</option>
            </select>
          </div>

          <div>
            <label style="display:block; margin-bottom:5px;">Value</label>
            <input id="frame-point-value" type="number" step="0.001" value="-10"
              style="width:100%; padding:7px;">
          </div>
        </div>

        <div style="border:1px solid #555; border-radius:6px; padding:10px; margin-bottom:12px;">
          <div style="font-weight:bold; margin-bottom:8px;">
            Load Location
          </div>

          <div style="display:grid; grid-template-columns: 1fr 1fr 1fr; gap:12px;">
            <div>
              <label style="display:block; margin-bottom:5px;">Distance Type</label>
              <select id="frame-point-distance-type" style="width:100%; padding:7px;">
                <option value="relative">Relative Distance</option>
                <option value="absolute">Absolute Distance from I-End</option>
              </select>
            </div>

            <div>
              <label style="display:block; margin-bottom:5px;">Relative Distance</label>
              <input id="frame-point-relative-distance" type="number" step="0.01" min="0" max="1" value="0.5"
                style="width:100%; padding:7px;">
            </div>

            <div>
              <label style="display:block; margin-bottom:5px;">Absolute Distance</label>
              <input id="frame-point-absolute-distance" type="number" step="0.001" min="0" value="0"
                style="width:100%; padding:7px;">
            </div>
          </div>

          <p style="font-size:12px; color:#777; margin-top:8px;">
            Relative Distance: 0 = extremo I, 1 = extremo J.
          </p>
        </div>

        <div style="margin-top:10px; color:#666; font-size:12px;">
          Elementos Frame / Line seleccionados: <b>${selectedFrames.length}</b>
        </div>

      </div>
    `,
      showCancelButton: true,
      confirmButtonText: "Asignar",
      cancelButtonText: "Cancelar",
      preConfirm: () => {
        return this.readFramePointLoadFromDialog();
      },
    });

    if (!result.isConfirmed || !result.value) return;

    this.assignFramePointLoadToSelected(result.value);
  },

  readFramePointLoadFromDialog() {
    const readNumber = (id) => {
      const value = Number(document.getElementById(id)?.value || 0);
      return Number.isFinite(value) ? value : 0;
    };

    let relativeDistance = readNumber("frame-point-relative-distance");

    if (relativeDistance < 0) relativeDistance = 0;
    if (relativeDistance > 1) relativeDistance = 1;

    return {
      id: `FPOINT_${Date.now()}`,
      type: "point",

      loadCase:
        document.getElementById("frame-point-loadcase")?.value || "DEAD",

      coordinateSystem:
        document.getElementById("frame-point-csys")?.value || "Global",

      operation:
        document.getElementById("frame-point-operation")?.value || "replace",

      loadType:
        document.getElementById("frame-point-loadtype")?.value || "force",

      direction:
        document.getElementById("frame-point-direction")?.value || "FZ",

      distanceType:
        document.getElementById("frame-point-distance-type")?.value || "relative",

      relativeDistance,

      absoluteDistance:
        readNumber("frame-point-absolute-distance"),

      value:
        readNumber("frame-point-value"),
    };
  },

  framePointLoadHasValue(load) {
    return Number(load?.value || 0) !== 0;
  },

  assignFramePointLoadToSelected(load) {
    const selectedFrames = this.getSelectedFramesForAssign();

    if (!selectedFrames.length) {
      this.showMessage?.("No hay elementos Frame / Line seleccionados.", "warning");
      return;
    }

    const operation = load.operation || "replace";
    const loadCase = load.loadCase || "DEAD";

    selectedFrames.forEach((frame) => {
      if (!Array.isArray(frame.frameLoads)) {
        frame.frameLoads = [];
      }

      if (!Array.isArray(frame.lineLoads)) {
        frame.lineLoads = [];
      }

      if (operation === "delete") {
        frame.frameLoads = frame.frameLoads.filter((item) => {
          return !(item.type === "point" && item.loadCase === loadCase);
        });

        frame.lineLoads = frame.lineLoads.filter((item) => {
          return !(item.type === "point" && item.loadCase === loadCase);
        });
      }

      if (operation === "replace") {
        frame.frameLoads = frame.frameLoads.filter((item) => {
          return !(item.type === "point" && item.loadCase === loadCase);
        });

        frame.lineLoads = frame.lineLoads.filter((item) => {
          return !(item.type === "point" && item.loadCase === loadCase);
        });

        if (this.framePointLoadHasValue(load)) {
          const cleanLoad = JSON.parse(JSON.stringify(load));
          delete cleanLoad.operation;

          frame.frameLoads.push(cleanLoad);
          frame.lineLoads.push(cleanLoad);
        }
      }

      if (operation === "add") {
        if (this.framePointLoadHasValue(load)) {
          const cleanLoad = JSON.parse(JSON.stringify(load));
          delete cleanLoad.operation;

          frame.frameLoads.push(cleanLoad);
          frame.lineLoads.push(cleanLoad);
        }
      }

      frame.hasFrameLoads =
        Array.isArray(frame.frameLoads) && frame.frameLoads.length > 0;

      frame.hasLineLoads = frame.hasFrameLoads;

      frame.assignment = {
        ...(frame.assignment || {}),
        frameLoads: frame.frameLoads,
        lineLoads: frame.lineLoads,
      };
    });

    this.markAnalysisResultsOutdated?.("Se modificó el modelo o sus asignaciones.");
    this.redraw?.();

    const actionText =
      operation === "delete"
        ? "removidas"
        : "asignadas";

    this.showMessage?.(
      `Cargas puntuales ${actionText} en ${selectedFrames.length} elemento(s) Frame / Line.`
    );

    console.log("✅ Frame / Line Point Load asignado:", {
      load,
      selectedFrames,
    });
  },

  // =====================================================
  // ASSIGN > FRAME / LINE LOADS > DISTRIBUTED
  // =====================================================

  getDefaultFrameDistributedLoad() {
    return {
      id: `FDIST_${Date.now()}`,
      type: "distributed",
      loadCase: "DEAD",
      coordinateSystem: "Global",

      loadType: "force", // force | moment
      direction: "FZ",

      distributionType: "uniform", // uniform | trapezoidal

      distanceType: "relative", // relative | absolute

      startRelativeDistance: 0,
      endRelativeDistance: 1,

      startAbsoluteDistance: 0,
      endAbsoluteDistance: 0,

      startValue: -5,
      endValue: -5,
    };
  },

  async openAssignFrameDistributedLoadDialog() {
    const selectedFrames = this.getSelectedFramesForAssign();

    if (!selectedFrames.length) {
      this.showMessage?.("Selecciona primero uno o más elementos Frame / Line.", "warning");
      return;
    }

    const loadCases = this.getAvailableLoadCasesForAssign();
    const current = this.getDefaultFrameDistributedLoad();

    if (loadCases.length > 0) {
      current.loadCase = loadCases[0].name;
    }

    const result = await Swal.fire({
      title: "Assign Frame / Line Loads - Distributed",
      width: 820,
      html: `
      <div style="text-align:left; font-size:13px;">

        <p style="margin-bottom:12px;">
          Asigna una carga distribuida uniforme o trapezoidal sobre los elementos Frame / Line seleccionados.
        </p>

        <div style="display:grid; grid-template-columns: 1fr 1fr 1fr; gap:12px; margin-bottom:12px;">
          <div>
            <label style="display:block; margin-bottom:5px;">Load Case</label>
            <select id="frame-dist-loadcase" style="width:100%; padding:7px;">
              ${loadCases.map((lc) => `
                <option value="${lc.name}">${lc.name} (${lc.type})</option>
              `).join("")}
            </select>
          </div>

          <div>
            <label style="display:block; margin-bottom:5px;">Coordinate System</label>
            <select id="frame-dist-csys" style="width:100%; padding:7px;">
              <option value="Global">Global</option>
              <option value="Local">Local</option>
            </select>
          </div>

          <div>
            <label style="display:block; margin-bottom:5px;">Operation</label>
            <select id="frame-dist-operation" style="width:100%; padding:7px;">
              <option value="replace">Replace Existing Loads</option>
              <option value="add">Add to Existing Loads</option>
              <option value="delete">Delete Existing Loads</option>
            </select>
          </div>
        </div>

        <div style="display:grid; grid-template-columns: 1fr 1fr 1fr; gap:12px; margin-bottom:12px;">
          <div>
            <label style="display:block; margin-bottom:5px;">Load Type</label>
            <select id="frame-dist-loadtype" style="width:100%; padding:7px;">
              <option value="force">Force</option>
              <option value="moment">Moment</option>
            </select>
          </div>

          <div>
            <label style="display:block; margin-bottom:5px;">Direction</label>
            <select id="frame-dist-direction" style="width:100%; padding:7px;">
              <option value="FX">FX</option>
              <option value="FY">FY</option>
              <option value="FZ" selected>FZ</option>
              <option value="MX">MX</option>
              <option value="MY">MY</option>
              <option value="MZ">MZ</option>
            </select>
          </div>

          <div>
            <label style="display:block; margin-bottom:5px;">Distribution</label>
            <select id="frame-dist-distribution" style="width:100%; padding:7px;">
              <option value="uniform">Uniform</option>
              <option value="trapezoidal">Trapezoidal</option>
            </select>
          </div>
        </div>

        <div style="border:1px solid #555; border-radius:6px; padding:10px; margin-bottom:12px;">
          <div style="font-weight:bold; margin-bottom:8px;">
            Load Location
          </div>

          <div style="display:grid; grid-template-columns: 1fr 1fr 1fr; gap:12px;">
            <div>
              <label style="display:block; margin-bottom:5px;">Distance Type</label>
              <select id="frame-dist-distance-type" style="width:100%; padding:7px;">
                <option value="relative">Relative Distance</option>
                <option value="absolute">Absolute Distance from I-End</option>
              </select>
            </div>

            <div>
              <label style="display:block; margin-bottom:5px;">Start Relative</label>
              <input id="frame-dist-start-relative" type="number" step="0.01" min="0" max="1" value="0"
                style="width:100%; padding:7px;">
            </div>

            <div>
              <label style="display:block; margin-bottom:5px;">End Relative</label>
              <input id="frame-dist-end-relative" type="number" step="0.01" min="0" max="1" value="1"
                style="width:100%; padding:7px;">
            </div>

            <div></div>

            <div>
              <label style="display:block; margin-bottom:5px;">Start Absolute</label>
              <input id="frame-dist-start-absolute" type="number" step="0.001" min="0" value="0"
                style="width:100%; padding:7px;">
            </div>

            <div>
              <label style="display:block; margin-bottom:5px;">End Absolute</label>
              <input id="frame-dist-end-absolute" type="number" step="0.001" min="0" value="0"
                style="width:100%; padding:7px;">
            </div>
          </div>

          <p style="font-size:12px; color:#777; margin-top:8px;">
            Relative Distance: 0 = extremo I, 1 = extremo J.
          </p>
        </div>

        <div style="border:1px solid #555; border-radius:6px; padding:10px;">
          <div style="font-weight:bold; margin-bottom:8px;">
            Load Values
          </div>

          <div style="display:grid; grid-template-columns: 1fr 1fr; gap:12px;">
            <div>
              <label style="display:block; margin-bottom:5px;">Value at Start</label>
              <input id="frame-dist-start-value" type="number" step="0.001" value="-5"
                style="width:100%; padding:7px;">
            </div>

            <div>
              <label style="display:block; margin-bottom:5px;">Value at End</label>
              <input id="frame-dist-end-value" type="number" step="0.001" value="-5"
                style="width:100%; padding:7px;">
            </div>
          </div>

          <p style="font-size:12px; color:#777; margin-top:8px;">
            Para carga uniforme usa el mismo valor al inicio y al final.
          </p>
        </div>

        <div style="margin-top:10px; color:#666; font-size:12px;">
          Elementos Frame / Line seleccionados: <b>${selectedFrames.length}</b>
        </div>

      </div>
    `,
      showCancelButton: true,
      confirmButtonText: "Asignar",
      cancelButtonText: "Cancelar",

      didOpen: () => {
        const distributionSelect = document.getElementById("frame-dist-distribution");
        const startValue = document.getElementById("frame-dist-start-value");
        const endValue = document.getElementById("frame-dist-end-value");

        distributionSelect?.addEventListener("change", () => {
          if (distributionSelect.value === "uniform") {
            endValue.value = startValue.value;
          }
        });

        startValue?.addEventListener("input", () => {
          if (distributionSelect?.value === "uniform") {
            endValue.value = startValue.value;
          }
        });
      },

      preConfirm: () => {
        return this.readFrameDistributedLoadFromDialog();
      },
    });

    if (!result.isConfirmed || !result.value) return;

    this.assignFrameDistributedLoadToSelected(result.value);
  },

  readFrameDistributedLoadFromDialog() {
    const readNumber = (id) => {
      const value = Number(document.getElementById(id)?.value || 0);
      return Number.isFinite(value) ? value : 0;
    };

    let startRelativeDistance = readNumber("frame-dist-start-relative");
    let endRelativeDistance = readNumber("frame-dist-end-relative");

    startRelativeDistance = Math.max(0, Math.min(1, startRelativeDistance));
    endRelativeDistance = Math.max(0, Math.min(1, endRelativeDistance));

    if (endRelativeDistance < startRelativeDistance) {
      const temp = startRelativeDistance;
      startRelativeDistance = endRelativeDistance;
      endRelativeDistance = temp;
    }

    return {
      id: `FDIST_${Date.now()}`,
      type: "distributed",

      loadCase:
        document.getElementById("frame-dist-loadcase")?.value || "DEAD",

      coordinateSystem:
        document.getElementById("frame-dist-csys")?.value || "Global",

      operation:
        document.getElementById("frame-dist-operation")?.value || "replace",

      loadType:
        document.getElementById("frame-dist-loadtype")?.value || "force",

      direction:
        document.getElementById("frame-dist-direction")?.value || "FZ",

      distributionType:
        document.getElementById("frame-dist-distribution")?.value || "uniform",

      distanceType:
        document.getElementById("frame-dist-distance-type")?.value || "relative",

      startRelativeDistance,
      endRelativeDistance,

      startAbsoluteDistance:
        readNumber("frame-dist-start-absolute"),

      endAbsoluteDistance:
        readNumber("frame-dist-end-absolute"),

      startValue:
        readNumber("frame-dist-start-value"),

      endValue:
        readNumber("frame-dist-end-value"),
    };
  },

  frameDistributedLoadHasValue(load) {
    return (
      Number(load?.startValue || 0) !== 0 ||
      Number(load?.endValue || 0) !== 0
    );
  },

  assignFrameDistributedLoadToSelected(load) {
    const selectedFrames = this.getSelectedFramesForAssign();

    if (!selectedFrames.length) {
      this.showMessage?.("No hay elementos Frame / Line seleccionados.", "warning");
      return;
    }

    const operation = load.operation || "replace";
    const loadCase = load.loadCase || "DEAD";

    selectedFrames.forEach((frame) => {
      if (!Array.isArray(frame.frameLoads)) {
        frame.frameLoads = [];
      }

      if (!Array.isArray(frame.lineLoads)) {
        frame.lineLoads = [];
      }

      if (operation === "delete") {
        frame.frameLoads = frame.frameLoads.filter((item) => {
          return !(item.type === "distributed" && item.loadCase === loadCase);
        });

        frame.lineLoads = frame.lineLoads.filter((item) => {
          return !(item.type === "distributed" && item.loadCase === loadCase);
        });
      }

      if (operation === "replace") {
        frame.frameLoads = frame.frameLoads.filter((item) => {
          return !(item.type === "distributed" && item.loadCase === loadCase);
        });

        frame.lineLoads = frame.lineLoads.filter((item) => {
          return !(item.type === "distributed" && item.loadCase === loadCase);
        });

        if (this.frameDistributedLoadHasValue(load)) {
          const cleanLoad = JSON.parse(JSON.stringify(load));
          delete cleanLoad.operation;

          frame.frameLoads.push(cleanLoad);
          frame.lineLoads.push(cleanLoad);
        }
      }

      if (operation === "add") {
        if (this.frameDistributedLoadHasValue(load)) {
          const cleanLoad = JSON.parse(JSON.stringify(load));
          delete cleanLoad.operation;

          frame.frameLoads.push(cleanLoad);
          frame.lineLoads.push(cleanLoad);
        }
      }

      frame.hasFrameLoads =
        Array.isArray(frame.frameLoads) && frame.frameLoads.length > 0;

      frame.hasLineLoads = frame.hasFrameLoads;

      frame.assignment = {
        ...(frame.assignment || {}),
        frameLoads: frame.frameLoads,
        lineLoads: frame.lineLoads,
      };
    });

    this.markAnalysisResultsOutdated?.("Se modificó el modelo o sus asignaciones.");
    this.redraw?.();

    const actionText =
      operation === "delete"
        ? "removidas"
        : "asignadas";

    this.showMessage?.(
      `Cargas distribuidas ${actionText} en ${selectedFrames.length} elemento(s) Frame / Line.`
    );

    console.log("✅ Frame / Line Distributed Load asignado:", {
      load,
      selectedFrames,
    });
  },

  // =====================================================
  // ASSIGN > FRAME / LINE LOADS > TEMPERATURE
  // =====================================================

  getDefaultFrameTemperatureLoad() {
    return {
      id: `FTEMP_${Date.now()}`,
      type: "temperature",
      loadCase: "DEAD",
      operation: "replace",

      temperatureType: "uniform", // uniform | gradient2 | gradient3 | combined

      temperature: {
        initialTemperature: 20,
        finalTemperature: 30,
        deltaT: 10,

        gradient2: 0,
        gradient3: 0,
      },
    };
  },

  async openAssignFrameTemperatureLoadDialog() {
    const selectedFrames = this.getSelectedFramesForAssign();

    if (!selectedFrames.length) {
      this.showMessage?.("Selecciona primero uno o más elementos Frame / Line.", "warning");
      return;
    }

    const loadCases = this.getAvailableLoadCasesForAssign();
    const current = this.getDefaultFrameTemperatureLoad();

    if (loadCases.length > 0) {
      current.loadCase = loadCases[0].name;
    }

    const result = await Swal.fire({
      title: "Assign Frame / Line Loads - Temperature",
      width: 720,
      html: `
      <div style="text-align:left; font-size:13px;">

        <p style="margin-bottom:12px;">
          Asigna carga de temperatura a los elementos Frame / Line seleccionados.
        </p>

        <div style="display:grid; grid-template-columns: 1fr 1fr 1fr; gap:12px; margin-bottom:12px;">
          <div>
            <label style="display:block; margin-bottom:5px;">Load Case</label>
            <select id="frame-temp-loadcase" style="width:100%; padding:7px;">
              ${loadCases.map((lc) => `
                <option value="${lc.name}">${lc.name} (${lc.type})</option>
              `).join("")}
            </select>
          </div>

          <div>
            <label style="display:block; margin-bottom:5px;">Temperature Type</label>
            <select id="frame-temp-type" style="width:100%; padding:7px;">
              <option value="uniform">Uniform Temperature Change</option>
              <option value="gradient2">Temperature Gradient 2</option>
              <option value="gradient3">Temperature Gradient 3</option>
              <option value="combined">Combined</option>
            </select>
          </div>

          <div>
            <label style="display:block; margin-bottom:5px;">Operation</label>
            <select id="frame-temp-operation" style="width:100%; padding:7px;">
              <option value="replace">Replace Existing Loads</option>
              <option value="add">Add to Existing Loads</option>
              <option value="delete">Delete Existing Loads</option>
            </select>
          </div>
        </div>

        <table style="width:100%; border-collapse:collapse; font-size:12px;">
          <thead>
            <tr style="background:#1f2937; color:white;">
              <th style="border:1px solid #555; padding:6px;">Dato</th>
              <th style="border:1px solid #555; padding:6px;">Valor</th>
              <th style="border:1px solid #555; padding:6px;">Unidad</th>
            </tr>
          </thead>

          <tbody>
            <tr>
              <td style="border:1px solid #555; padding:6px;">Initial Temperature</td>
              <td style="border:1px solid #555; padding:6px;">
                <input id="frame-temp-initial" type="number" step="0.001" value="20" style="width:100%; padding:5px;">
              </td>
              <td style="border:1px solid #555; padding:6px;">°C</td>
            </tr>

            <tr>
              <td style="border:1px solid #555; padding:6px;">Final Temperature</td>
              <td style="border:1px solid #555; padding:6px;">
                <input id="frame-temp-final" type="number" step="0.001" value="30" style="width:100%; padding:5px;">
              </td>
              <td style="border:1px solid #555; padding:6px;">°C</td>
            </tr>

            <tr>
              <td style="border:1px solid #555; padding:6px;">Temperature Change ΔT</td>
              <td style="border:1px solid #555; padding:6px;">
                <input id="frame-temp-delta" type="number" step="0.001" value="10" style="width:100%; padding:5px;">
              </td>
              <td style="border:1px solid #555; padding:6px;">°C</td>
            </tr>

            <tr>
              <td style="border:1px solid #555; padding:6px;">Gradient 2</td>
              <td style="border:1px solid #555; padding:6px;">
                <input id="frame-temp-gradient2" type="number" step="0.001" value="0" style="width:100%; padding:5px;">
              </td>
              <td style="border:1px solid #555; padding:6px;">°C/m</td>
            </tr>

            <tr>
              <td style="border:1px solid #555; padding:6px;">Gradient 3</td>
              <td style="border:1px solid #555; padding:6px;">
                <input id="frame-temp-gradient3" type="number" step="0.001" value="0" style="width:100%; padding:5px;">
              </td>
              <td style="border:1px solid #555; padding:6px;">°C/m</td>
            </tr>
          </tbody>
        </table>

        <div style="margin-top:12px; padding:10px; border:1px solid #555; border-radius:6px;">
          <span style="font-size:12px; color:#777;">
            En esta versión inicial se guarda la temperatura uniforme y gradientes. Luego el motor de análisis podrá usar estos datos.
          </span>
        </div>

        <div style="margin-top:10px; color:#666; font-size:12px;">
          Elementos Frame / Line seleccionados: <b>${selectedFrames.length}</b>
        </div>

      </div>
    `,
      showCancelButton: true,
      confirmButtonText: "Asignar",
      cancelButtonText: "Cancelar",

      didOpen: () => {
        const initialInput = document.getElementById("frame-temp-initial");
        const finalInput = document.getElementById("frame-temp-final");
        const deltaInput = document.getElementById("frame-temp-delta");
        const typeSelect = document.getElementById("frame-temp-type");
        const gradient2Input = document.getElementById("frame-temp-gradient2");
        const gradient3Input = document.getElementById("frame-temp-gradient3");

        const updateDelta = () => {
          const ti = Number(initialInput?.value || 0);
          const tf = Number(finalInput?.value || 0);
          deltaInput.value = tf - ti;
        };

        const updateByType = () => {
          const type = typeSelect?.value || "uniform";

          if (type === "uniform") {
            gradient2Input.value = 0;
            gradient3Input.value = 0;
          }

          if (type === "gradient2") {
            deltaInput.value = 0;
            gradient3Input.value = 0;
          }

          if (type === "gradient3") {
            deltaInput.value = 0;
            gradient2Input.value = 0;
          }
        };

        initialInput?.addEventListener("input", updateDelta);
        finalInput?.addEventListener("input", updateDelta);
        typeSelect?.addEventListener("change", updateByType);
      },

      preConfirm: () => {
        return this.readFrameTemperatureLoadFromDialog();
      },
    });

    if (!result.isConfirmed || !result.value) return;

    this.assignFrameTemperatureLoadToSelected(result.value);
  },

  readFrameTemperatureLoadFromDialog() {
    const readNumber = (id) => {
      const value = Number(document.getElementById(id)?.value || 0);
      return Number.isFinite(value) ? value : 0;
    };

    const initialTemperature = readNumber("frame-temp-initial");
    const finalTemperature = readNumber("frame-temp-final");

    return {
      id: `FTEMP_${Date.now()}`,
      type: "temperature",

      loadCase:
        document.getElementById("frame-temp-loadcase")?.value || "DEAD",

      operation:
        document.getElementById("frame-temp-operation")?.value || "replace",

      temperatureType:
        document.getElementById("frame-temp-type")?.value || "uniform",

      temperature: {
        initialTemperature,
        finalTemperature,
        deltaT: readNumber("frame-temp-delta"),
        gradient2: readNumber("frame-temp-gradient2"),
        gradient3: readNumber("frame-temp-gradient3"),
      },
    };
  },

  frameTemperatureLoadHasValue(load) {
    if (!load?.temperature) return false;

    const t = load.temperature;

    return (
      Number(t.deltaT || 0) !== 0 ||
      Number(t.gradient2 || 0) !== 0 ||
      Number(t.gradient3 || 0) !== 0 ||
      Number(t.initialTemperature || 0) !== Number(t.finalTemperature || 0)
    );
  },

  assignFrameTemperatureLoadToSelected(load) {
    const selectedFrames = this.getSelectedFramesForAssign();

    if (!selectedFrames.length) {
      this.showMessage?.("No hay elementos Frame / Line seleccionados.", "warning");
      return;
    }

    const operation = load.operation || "replace";
    const loadCase = load.loadCase || "DEAD";

    selectedFrames.forEach((frame) => {
      if (!Array.isArray(frame.frameLoads)) {
        frame.frameLoads = [];
      }

      if (!Array.isArray(frame.lineLoads)) {
        frame.lineLoads = [];
      }

      if (operation === "delete") {
        frame.frameLoads = frame.frameLoads.filter((item) => {
          return !(item.type === "temperature" && item.loadCase === loadCase);
        });

        frame.lineLoads = frame.lineLoads.filter((item) => {
          return !(item.type === "temperature" && item.loadCase === loadCase);
        });
      }

      if (operation === "replace") {
        frame.frameLoads = frame.frameLoads.filter((item) => {
          return !(item.type === "temperature" && item.loadCase === loadCase);
        });

        frame.lineLoads = frame.lineLoads.filter((item) => {
          return !(item.type === "temperature" && item.loadCase === loadCase);
        });

        if (this.frameTemperatureLoadHasValue(load)) {
          const cleanLoad = JSON.parse(JSON.stringify(load));
          delete cleanLoad.operation;

          frame.frameLoads.push(cleanLoad);
          frame.lineLoads.push(cleanLoad);
        }
      }

      if (operation === "add") {
        if (this.frameTemperatureLoadHasValue(load)) {
          const cleanLoad = JSON.parse(JSON.stringify(load));
          delete cleanLoad.operation;

          frame.frameLoads.push(cleanLoad);
          frame.lineLoads.push(cleanLoad);
        }
      }

      frame.hasFrameLoads =
        Array.isArray(frame.frameLoads) && frame.frameLoads.length > 0;

      frame.hasLineLoads = frame.hasFrameLoads;

      frame.assignment = {
        ...(frame.assignment || {}),
        frameLoads: frame.frameLoads,
        lineLoads: frame.lineLoads,
      };
    });

    this.markAnalysisResultsOutdated?.("Se modificó una carga de temperatura en Frame / Line.");
    this.redraw?.();

    const actionText =
      operation === "delete"
        ? "removidas"
        : "asignadas";

    this.showMessage?.(
      `Cargas de temperatura ${actionText} en ${selectedFrames.length} elemento(s) Frame / Line.`
    );

    console.log("✅ Frame / Line Temperature Load asignado:", {
      load,
      selectedFrames,
    });
  },

  // =====================================================
  // ASSIGN > GROUP NAMES
  // =====================================================

  ensureGroupsContainer() {
    if (!this.groups) {
      this.groups = {
        items: [],
        selectedGroup: null,
      };
    }

    if (!Array.isArray(this.groups.items)) {
      this.groups.items = [];
    }
  },

  getDefaultGroupsForAssign() {
    return [
      {
        id: "G1",
        name: "G1",
        description: "Grupo general",
        members: [],
      },
    ];
  },

  getAvailableGroupsForAssign() {
    this.ensureGroupsContainer();

    if (this.groups.items.length === 0) {
      this.groups.items.push(...this.getDefaultGroupsForAssign());
    }

    return this.groups.items.map((group, index) => {
      const id =
        group.id ||
        group.name ||
        `G${index + 1}`;

      const name =
        group.name ||
        group.groupName ||
        String(id);

      return {
        ...group,
        id,
        name,
        members: Array.isArray(group.members) ? group.members : [],
      };
    });
  },

  getSelectedObjectsForGroupAssign() {
    return this.getSelectedObjects?.() || [];
  },

  getAssignableObjectType(obj) {
    if (!obj) return "unknown";

    const type = String(
      obj.objectType ||
      obj.elementType ||
      obj.type ||
      obj.constructor?.name ||
      ""
    ).toLowerCase();

    if (obj.node1 && obj.node2) {
      return "frame";
    }

    if (
      obj.position ||
      obj.isNode === true ||
      type === "node" ||
      type === "structuralnode" ||
      type === "joint" ||
      type === "point"
    ) {
      return "joint";
    }

    if (
      Array.isArray(obj.points) ||
      type === "area" ||
      type === "slab" ||
      type === "wall" ||
      type === "opening"
    ) {
      return "area";
    }

    return type || "object";
  },

  getAssignableObjectId(obj) {
    if (!obj) return null;

    return obj.id || obj._id || obj.name || null;
  },

  getAssignableObjectDescriptor(obj) {
    return {
      objectType: this.getAssignableObjectType(obj),
      id: this.getAssignableObjectId(obj),
    };
  },

  createGroupForAssign(name = "G1") {
    this.ensureGroupsContainer();

    const cleanName = String(name || "").trim();

    if (!cleanName) {
      this.showMessage?.("El nombre del grupo no puede estar vacío.", "warning");
      return null;
    }

    const exists = this.groups.items.find((group) => {
      return String(group.id || group.name) === cleanName;
    });

    if (exists) {
      return exists;
    }

    const newGroup = {
      id: cleanName,
      name: cleanName,
      description: "",
      members: [],
    };

    this.groups.items.push(newGroup);

    return newGroup;
  },

  async openAssignGroupNamesDialog() {
    const selectedObjects = this.getSelectedObjectsForGroupAssign();

    if (!selectedObjects.length) {
      this.showMessage?.("Selecciona primero uno o más objetos.", "warning");
      return;
    }

    const groups = this.getAvailableGroupsForAssign();

    const groupRows = groups.map((group, index) => {
      return `
      <label style="display:flex; align-items:center; gap:8px; padding:6px; border-bottom:1px solid #444;">
        <input type="checkbox" class="assign-group-checkbox" value="${group.id}">
        <span>${group.name}</span>
      </label>
    `;
    }).join("");

    const result = await Swal.fire({
      title: "Assign Group Names",
      width: 620,
      html: `
      <div style="text-align:left; font-size:13px;">

        <p style="margin-bottom:12px;">
          Asigna los objetos seleccionados a uno o más grupos.
        </p>

        <div style="display:grid; grid-template-columns: 1fr 1fr; gap:12px; margin-bottom:12px;">
          <div>
            <label style="display:block; margin-bottom:5px;">Operation</label>
            <select id="assign-group-operation" style="width:100%; padding:7px;">
              <option value="add">Add to Groups</option>
              <option value="replace">Replace Groups</option>
              <option value="remove">Remove from Groups</option>
            </select>
          </div>

          <div>
            <label style="display:block; margin-bottom:5px;">New Group Name</label>
            <input id="assign-group-new-name" type="text" placeholder="Ej: Vigas_Piso_1"
              style="width:100%; padding:7px;">
          </div>
        </div>

        <button id="assign-group-create-btn"
          style="padding:7px 12px; background:#2563eb; color:white; border:none; border-radius:5px; margin-bottom:12px;">
          Crear grupo
        </button>

        <div style="border:1px solid #555; border-radius:6px; max-height:220px; overflow:auto;">
          <div id="assign-group-list">
            ${groupRows}
          </div>
        </div>

        <div style="margin-top:12px; padding:10px; border:1px solid #555; border-radius:6px;">
          Objetos seleccionados: <b>${selectedObjects.length}</b>
        </div>

      </div>
    `,
      showCancelButton: true,
      confirmButtonText: "Asignar",
      cancelButtonText: "Cancelar",

      didOpen: () => {
        const createBtn = document.getElementById("assign-group-create-btn");
        const input = document.getElementById("assign-group-new-name");
        const list = document.getElementById("assign-group-list");

        createBtn?.addEventListener("click", () => {
          const name = input?.value?.trim();

          if (!name) {
            this.showMessage?.("Escribe un nombre de grupo.", "warning");
            return;
          }

          const group = this.createGroupForAssign(name);

          if (!group) return;

          const alreadyRendered = list.querySelector(`input[value="${group.id}"]`);

          if (!alreadyRendered) {
            const wrapper = document.createElement("label");
            wrapper.style.cssText =
              "display:flex; align-items:center; gap:8px; padding:6px; border-bottom:1px solid #444;";

            wrapper.innerHTML = `
            <input type="checkbox" class="assign-group-checkbox" value="${group.id}" checked>
            <span>${group.name}</span>
          `;

            list.appendChild(wrapper);
          }

          input.value = "";
        });
      },

      preConfirm: () => {
        const checked = Array.from(
          document.querySelectorAll(".assign-group-checkbox:checked")
        ).map((item) => item.value);

        const operation =
          document.getElementById("assign-group-operation")?.value || "add";

        if (!checked.length) {
          Swal.showValidationMessage("Selecciona al menos un grupo.");
          return false;
        }

        return {
          operation,
          groupIds: checked,
        };
      },
    });

    if (!result.isConfirmed || !result.value) return;

    this.assignGroupNamesToSelected(result.value);
  },

  assignGroupNamesToSelected(config) {
    const selectedObjects = this.getSelectedObjectsForGroupAssign();

    if (!selectedObjects.length) {
      this.showMessage?.("No hay objetos seleccionados.", "warning");
      return;
    }

    this.ensureGroupsContainer();

    const operation = config.operation || "add";
    const groupIds = config.groupIds || [];

    const groups = this.getAvailableGroupsForAssign().filter((group) => {
      return groupIds.includes(String(group.id));
    });

    if (!groups.length) {
      this.showMessage?.("No se encontraron grupos válidos.", "warning");
      return;
    }

    selectedObjects.forEach((obj) => {
      if (!Array.isArray(obj.groupIds)) {
        obj.groupIds = [];
      }

      if (!Array.isArray(obj.groupNames)) {
        obj.groupNames = [];
      }

      if (operation === "replace") {
        obj.groupIds = [];
        obj.groupNames = [];
      }

      if (operation === "remove") {
        obj.groupIds = obj.groupIds.filter((id) => !groupIds.includes(String(id)));
        obj.groupNames = obj.groupNames.filter((name) => !groupIds.includes(String(name)));
      }

      if (operation === "add" || operation === "replace") {
        groups.forEach((group) => {
          if (!obj.groupIds.includes(group.id)) {
            obj.groupIds.push(group.id);
          }

          if (!obj.groupNames.includes(group.name)) {
            obj.groupNames.push(group.name);
          }
        });
      }

      obj.groups = obj.groupIds.map((id) => {
        const group = this.getAvailableGroupsForAssign().find((g) => String(g.id) === String(id));
        return group
          ? { id: group.id, name: group.name }
          : { id, name: id };
      });

      obj.hasGroups = obj.groupIds.length > 0;

      obj.assignment = {
        ...(obj.assignment || {}),
        groups: obj.groups,
      };
    });

    this.rebuildGroupMemberships();

    this.redraw?.();

    const actionText =
      operation === "remove"
        ? "removidos"
        : "asignados";

    this.showMessage?.(
      `Group Names ${actionText} en ${selectedObjects.length} objeto(s).`
    );

    console.log("✅ Group Names asignados:", {
      operation,
      groups,
      selectedObjects,
      allGroups: this.groups.items,
    });
  },

  rebuildGroupMemberships() {
    this.ensureGroupsContainer();

    this.groups.items.forEach((group) => {
      group.members = [];
    });

    const objects = this.getSelectableObjects?.() || [];

    objects.forEach((obj) => {
      const groupIds = obj.groupIds || [];

      groupIds.forEach((groupId) => {
        let group = this.groups.items.find((g) => {
          return String(g.id || g.name) === String(groupId);
        });

        if (!group) {
          group = {
            id: groupId,
            name: groupId,
            description: "",
            members: [],
          };

          this.groups.items.push(group);
        }

        if (!Array.isArray(group.members)) {
          group.members = [];
        }

        const descriptor = this.getAssignableObjectDescriptor(obj);

        const exists = group.members.some((member) => {
          return (
            String(member.objectType) === String(descriptor.objectType) &&
            String(member.id) === String(descriptor.id)
          );
        });

        if (!exists) {
          group.members.push(descriptor);
        }
      });
    });
  },

  // =====================================================
  // ASSIGNMENTS SUMMARY / RESUMEN DE ASIGNACIONES
  // =====================================================

  getAssignmentObjectType(obj) {
    if (!obj) return "unknown";

    if (typeof this.getAssignableObjectType === "function") {
      return this.getAssignableObjectType(obj);
    }

    if (obj.node1 && obj.node2) return "frame";
    if (obj.position || obj.isNode) return "joint";

    return (
      obj.objectType ||
      obj.elementType ||
      obj.type ||
      obj.constructor?.name ||
      "object"
    );
  },

  getAssignmentObjectId(obj) {
    if (!obj) return null;
    return obj.id || obj._id || obj.name || "sin-id";
  },

  getFrameLoadsSummary(frame) {
    const loads =
      frame?.frameLoads ||
      frame?.lineLoads ||
      frame?.assignment?.frameLoads ||
      [];

    return {
      total: loads.length,
      point: loads.filter((l) => l.type === "point").length,
      distributed: loads.filter((l) => l.type === "distributed").length,
      temperature: loads.filter((l) => l.type === "temperature").length,
    };
  },

  getJointLoadsSummary(joint) {
    const loads =
      joint?.pointLoads ||
      joint?.jointLoads ||
      joint?.assignment?.pointLoads ||
      [];

    return {
      total: loads.length,
      force: loads.filter((l) => l.type === "force").length,
      groundDisplacement: loads.filter((l) => l.type === "ground-displacement").length,
      temperature: loads.filter((l) => l.type === "temperature").length,
    };
  },

  getObjectAssignmentsSummary(obj) {
    if (!obj) return null;

    const type = this.getAssignmentObjectType(obj);
    const id = this.getAssignmentObjectId(obj);

    const base = {
      id,
      type,
      selected: obj.selected === true,
      groups: obj.groupNames || obj.groupIds || obj.groups?.map((g) => g.name || g.id) || [],
    };

    // ===============================
    // FRAME / LINE
    // ===============================
    if (type === "frame" || obj.node1 && obj.node2) {
      const section =
        obj.sectionName ||
        obj.frameSection?.name ||
        obj.section?.name ||
        obj.sectionId ||
        "Sin sección";

      const material =
        obj.materialName ||
        obj.material?.name ||
        obj.materialId ||
        "Sin material";

      return {
        ...base,

        section,
        material,

        hasFrameSection: !!(
          obj.sectionId ||
          obj.sectionName ||
          obj.frameSection ||
          obj.section
        ),

        hasReleases: !!(
          obj.hasFrameReleases ||
          obj.frameReleases ||
          obj.releases
        ),

        hasEndOffsets: !!(
          obj.hasEndOffsets ||
          obj.frameEndOffsets ||
          obj.endOffsets
        ),

        frameLoads: this.getFrameLoadsSummary(obj),

        raw: {
          section: obj.frameSection || obj.section || null,
          releases: obj.frameReleases || obj.releases || null,
          endOffsets: obj.frameEndOffsets || obj.endOffsets || null,
          loads: obj.frameLoads || obj.lineLoads || [],
        },
      };
    }

    // ===============================
    // JOINT / POINT
    // ===============================
    if (
      type === "joint" ||
      type === "point" ||
      type === "node" ||
      type === "structuralnode" ||
      obj.position
    ) {
      const restraints =
        obj.restraints?.name ||
        obj.constraints?.name ||
        obj.restraints?.type ||
        obj.constraints?.type ||
        "Sin apoyo";

      const diaphragm =
        obj.diaphragmName ||
        obj.diaphragm?.name ||
        obj.diaphragmId ||
        "Sin diafragma";

      return {
        ...base,

        restraints,
        diaphragm,

        hasRestraints: !!(
          obj.hasRestraints ||
          obj.restraints ||
          obj.constraints
        ),

        hasDiaphragm: !!(
          obj.hasDiaphragm ||
          obj.diaphragm ||
          obj.diaphragmId
        ),

        hasPointSprings: !!(
          obj.hasPointSprings ||
          obj.pointSprings ||
          obj.springs
        ),

        jointLoads: this.getJointLoadsSummary(obj),

        raw: {
          restraints: obj.restraints || obj.constraints || null,
          diaphragm: obj.diaphragm || null,
          springs: obj.pointSprings || obj.springs || null,
          loads: obj.pointLoads || obj.jointLoads || [],
        },
      };
    }

    // ===============================
    // OTROS OBJETOS
    // ===============================
    return {
      ...base,
      assignment: obj.assignment || null,
    };
  },

  getSelectedAssignmentsSummary() {
    const selectedObjects = this.getSelectedObjects?.() || [];

    return selectedObjects.map((obj) => {
      return this.getObjectAssignmentsSummary(obj);
    });
  },

  logSelectedAssignmentsSummary() {
    const summary = this.getSelectedAssignmentsSummary();

    console.table(summary.map((item) => ({
      id: item.id,
      type: item.type,
      section: item.section || "",
      material: item.material || "",
      restraints: item.restraints || "",
      diaphragm: item.diaphragm || "",
      releases: item.hasReleases || false,
      offsets: item.hasEndOffsets || false,
      frameLoads: item.frameLoads?.total || 0,
      jointLoads: item.jointLoads?.total || 0,
      springs: item.hasPointSprings || false,
      groups: Array.isArray(item.groups) ? item.groups.join(", ") : "",
    })));

    console.log("Resumen completo de asignaciones:", summary);

    this.showMessage?.(
      `Resumen generado para ${summary.length} objeto(s) seleccionado(s).`
    );

    return summary;
  },

  showSelectedAssignmentsSummary() {
    const summary = this.getSelectedAssignmentsSummary();

    if (!summary.length) {
      this.showMessage?.("Selecciona uno o más objetos para ver sus asignaciones.", "warning");
      return;
    }

    const rows = summary.map((item) => {
      const isFrame = item.type === "frame";

      return `
      <tr>
        <td style="border:1px solid #555; padding:6px;">${item.id}</td>
        <td style="border:1px solid #555; padding:6px;">${item.type}</td>
        <td style="border:1px solid #555; padding:6px;">
          ${isFrame
          ? `Sección: ${item.section}<br>Material: ${item.material}<br>Releases: ${item.hasReleases ? "Sí" : "No"}<br>Offsets: ${item.hasEndOffsets ? "Sí" : "No"}`
          : `Apoyo: ${item.restraints}<br>Diafragma: ${item.diaphragm}<br>Springs: ${item.hasPointSprings ? "Sí" : "No"}`
        }
        </td>
        <td style="border:1px solid #555; padding:6px;">
          ${isFrame
          ? `Point: ${item.frameLoads?.point || 0}<br>Distributed: ${item.frameLoads?.distributed || 0}<br>Temp: ${item.frameLoads?.temperature || 0}`
          : `Force: ${item.jointLoads?.force || 0}<br>Ground Disp: ${item.jointLoads?.groundDisplacement || 0}<br>Temp: ${item.jointLoads?.temperature || 0}`
        }
        </td>
        <td style="border:1px solid #555; padding:6px;">
          ${Array.isArray(item.groups) && item.groups.length ? item.groups.join(", ") : "Sin grupos"}
        </td>
      </tr>
    `;
    }).join("");

    Swal.fire({
      title: "Selected Object Assignments",
      width: 900,
      html: `
      <div style="text-align:left; font-size:12px; max-height:480px; overflow:auto;">
        <table style="width:100%; border-collapse:collapse;">
          <thead>
            <tr style="background:#1f2937; color:white;">
              <th style="border:1px solid #555; padding:6px;">ID</th>
              <th style="border:1px solid #555; padding:6px;">Tipo</th>
              <th style="border:1px solid #555; padding:6px;">Asignaciones</th>
              <th style="border:1px solid #555; padding:6px;">Cargas</th>
              <th style="border:1px solid #555; padding:6px;">Grupos</th>
            </tr>
          </thead>
          <tbody>
            ${rows}
          </tbody>
        </table>
      </div>
    `,
      confirmButtonText: "Cerrar",
    });

    return summary;
  },

  activateOptionsMenuAction(action) {
    switch (action) {
      // OPCIONES DE PREFERENCIAS
      case "dimensions-tolerances":
        this.openDimensionsTolerancesDialog();
        break;

      case "output-decimals":
        this.openOutputDecimalsDialog();
        break;

      case "steel-frame-design":
        this.openSteelFrameDesignDialog();
        break;

      case "reinforcement-bar-sizes":
        this.openReinforcementBarSizesDialog();
        break;

      // OPCIONES DE COLORES
      case "theme-dark":
        this.setCanvasTheme("dark");
        break;

      case "theme-light":
        this.setCanvasTheme("light");
        break;

      // case "display-colors":
      //   this.openDisplayColorsDialog();
      //   break;

      // OPCIÓN DE LAYOUT DE VENTANAS
      case "window-one":
        this.setWindowLayout("one");
        break;

      case "window-two-vertical":
        this.setWindowLayout("two-vertical");
        break;

      case "window-two-horizontal":
        this.setWindowLayout("two-horizontal");
        break;

      // case "window-three":
      //   this.setWindowLayout("three");
      //   break;

      // case "window-four":
      //   this.setWindowLayout("four");
      //   break;
    }

    this.redraw?.();
  },

  // Devuelve nodos, barras y áreas visibles/seleccionables. Ignora barras 3D-only en selección 2D.
  // =====================================================
  getSelectableObjects(options = {}) {
    const objects = [];
    const seen = new Set();

    const include3DOnlyFrames =
      options.include3DOnlyFrames === true;

    const addObject = (obj) => {
      if (!obj) return;
      if (seen.has(obj)) return;

      // Si el objeto está oculto, no lo consideramos seleccionable.
      if (obj.visible === false) return;

      // =====================================================
      // SELECTION 2D > IGNORAR BARRAS 3D-ONLY
      // Los nodos sí se mantienen seleccionables.
      // Solo se bloquean las barras ocultas en 2D.
      // =====================================================
      if (obj.node1 && obj.node2 && !include3DOnlyFrames) {
        if (
          typeof this.shouldSelectFrameIn2D === "function" &&
          !this.shouldSelectFrameIn2D(obj)
        ) {
          return;
        }
      }

      seen.add(obj);
      objects.push(obj);
    };

    // Nodos
    if (Array.isArray(this.nodes)) {
      this.nodes.forEach(addObject);
    }

    // Barras, columnas, vigas secundarias, arriostres, etc.
    if (Array.isArray(this.shapes)) {
      this.shapes.forEach(addObject);
    }

    // Áreas
    if (Array.isArray(this.areas)) {
      this.areas.forEach(addObject);
    }

    if (Array.isArray(this.slabs)) {
      this.slabs.forEach(addObject);
    }

    if (Array.isArray(this.walls)) {
      this.walls.forEach(addObject);
    }

    if (Array.isArray(this.openings)) {
      this.openings.forEach(addObject);
    }

    return objects;
  },

  getSelectedObjects() {
    if (typeof this.getEditSelectedObjects === "function") {
      return this.getEditSelectedObjects({
        respectActiveView: true,
      });
    }

    return this.getSelectableObjects().filter((obj) => obj.selected === true);
  },

  // =====================================================
  // SELECTION > DEFINIR ESTADO DE SELECCIÓN DE OBJETO
  // Versión segura para nodos, barras y objetos creados desde 3D.
  // Evita errores cuando no existe style.default() o style.selected().
  // =====================================================
  setObjectSelected(obj, selected = true) {
    if (!obj) return;

    obj.selected = selected;
    obj.isSelected = selected;

    if (selected) {
      obj.style?.selected?.();
      return;
    }

    obj.highlighted3D = false;
    obj.is3DOnlyEndpointHover = false;

    obj.style?.default?.();
  },

  // =====================================================
  // SELECTION > RESOLVER BARRA REAL DEL MODELO
  // En 3D a veces llega una copia/proxy del frame.
  // Por eso se busca la barra real dentro de this.shapes usando el id.
  // =====================================================
  resolveFrameFromModel(frameOrId) {
    if (!frameOrId) return null;

    const id =
      typeof frameOrId === "object"
        ? frameOrId.id ?? frameOrId.frameId
        : frameOrId;

    if (id == null) return null;

    return (
      this.shapes?.find((frame) => String(frame.id) === String(id)) ||
      null
    );
  },

  // =====================================================
  // SELECTION > OBTENER BARRAS SELECCIONADAS ACTUALMENTE
  // Soporta selección 2D, 3D y estados internos.
  // =====================================================
  // =====================================================
  // SELECTION > OBTENER BARRAS SELECCIONADAS ACTUALMENTE
  // Usa una lista propia para permitir seleccionar 1, 2, 3, 4 o más barras.
  // =====================================================
  getCurrentlySelectedFrames() {
    if (!Array.isArray(this.multiSelectedFrames)) {
      this.multiSelectedFrames = [];
    }

    // Convertir cualquier copia/proxy en la barra real del modelo
    this.multiSelectedFrames = this.multiSelectedFrames
      .map((frame) => this.resolveFrameFromModel?.(frame) || frame)
      .filter((frame) => {
        return frame && this.shapes?.some((item) => String(item.id) === String(frame.id));
      });

    // Quitar repetidos por id
    const seen = new Set();

    this.multiSelectedFrames = this.multiSelectedFrames.filter((frame) => {
      const key = String(frame.id);

      if (seen.has(key)) return false;

      seen.add(key);
      return true;
    });

    return this.multiSelectedFrames;
  },

  // =====================================================
  // SELECTION > SELECCIONAR LISTA DE BARRAS
  // Clic normal: reemplaza selección.
  // Ctrl + clic: toggleFrameSelection manda una lista acumulada.
  // =====================================================
  selectFramesForEdit(frames = [], options = {}) {
    if (!Array.isArray(this.multiSelectedFrames)) {
      this.multiSelectedFrames = [];
    }

    const cleanFrames = [];
    const seen = new Set();

    frames.forEach((frame) => {
      // CLAVE: resolver la barra real dentro del modelo
      const realFrame = this.resolveFrameFromModel?.(frame) || frame;

      if (!realFrame || !realFrame.node1 || !realFrame.node2) return;

      const existsInModel = this.shapes?.some((item) => {
        return String(item.id) === String(realFrame.id);
      });

      if (!existsInModel) return;

      const key = String(realFrame.id);

      if (seen.has(key)) return;

      seen.add(key);
      cleanFrames.push(realFrame);
    });

    // Limpiar selección visual anterior
    this.shapes?.forEach((shape) => {
      shape.selected = false;
      shape.isSelected = false;
      shape.highlighted3D = false;
      shape.style?.default?.();
    });

    this.nodes?.forEach((node) => {
      node.selected = false;
      node.isSelected = false;
      node.is3DOnlyEndpointHover = false;
      node.style?.default?.();
    });

    this.areas?.forEach((area) => {
      area.selected = false;
      area.isSelected = false;
    });

    // Guardar selección múltiple real
    this.multiSelectedFrames = cleanFrames;

    cleanFrames.forEach((frame) => {
      frame.selected = true;
      frame.isSelected = true;
      frame.highlighted3D = true;

      frame.style?.select?.();
      frame.style?.selected?.();
    });

    // Sincronizar con Edit
    this.selectedBeams = cleanFrames;
    this.selectedObjects = cleanFrames;

    if (this.selectedBeamsState) {
      this.selectedBeamsState.selectedBeams = cleanFrames;
      this.selectedBeamsState.selectedObjects = cleanFrames;
      this.selectedBeamsState.selectedBeam = cleanFrames[0] || null;
    }

    if (cleanFrames.length > 0) {
      this.setState?.(this.selectedBeamsState, {
        selectedBeams: cleanFrames,
        selectedBeam: cleanFrames[0],
        selectedObjects: cleanFrames,
      });
    } else {
      this.setState?.(this.idleState);
    }

    this.redraw?.();
    this.sync3D?.();

    this.showMessage?.(
      cleanFrames.length === 1
        ? "1 barra seleccionada"
        : `${cleanFrames.length} barras seleccionadas`
    );

    console.log(
      "✅ Selección múltiple de barras:",
      cleanFrames.map((frame) => frame.id)
    );
  },

  // =====================================================
  // SELECTION > CTRL + CLIC PARA AGREGAR O QUITAR BARRAS
  // Permite seleccionar tantas barras como quieras.
  // =====================================================
  toggleFrameSelection(frame) {
    const realFrame = this.resolveFrameFromModel?.(frame) || frame;

    if (!realFrame || !realFrame.node1 || !realFrame.node2) {
      console.warn("⚠️ toggleFrameSelection: frame inválido", frame);
      return;
    }

    if (!Array.isArray(this.multiSelectedFrames)) {
      this.multiSelectedFrames = [];
    }

    const currentFrames = this.getCurrentlySelectedFrames?.() || [];

    const alreadySelected = currentFrames.some((item) => {
      return String(item.id) === String(realFrame.id);
    });

    const nextFrames = alreadySelected
      ? currentFrames.filter((item) => String(item.id) !== String(realFrame.id))
      : [...currentFrames, realFrame];

    this.selectFramesForEdit?.(nextFrames, {
      reason: "ctrl click multiple frame selection",
    });
  },

  selectObjects(objects = []) {
    objects.forEach((obj) => {
      this.setObjectSelected(obj, true);
    });

    this.redraw?.();
    this.sync3D?.();

    this.showMessage?.(`Objetos seleccionados: ${objects.length}`);
  },

  deselectObjects(objects = []) {
    objects.forEach((obj) => {
      this.setObjectSelected(obj, false);
    });

    this.redraw?.();
    this.sync3D?.();

    this.showMessage?.(`Objetos deseleccionados: ${objects.length}`);
  },

  // =====================================================
  // DRAW FRAME > ACTIVAR HERRAMIENTA GENERAL DE BARRAS
  // Activa una herramienta única para dibujar barras.
  // Luego el sistema decidirá si se dibuja en 2D o en 3D.
  // =====================================================
  startFrameDrawingMode() {
    this.activeDrawTool = "frame";

    this.isDrawingFrame3D = false;
    this.frame3DStartNode = null;
    this.frame3DEndNode = null;

    this.clearAllSelections?.();

    if (this.idleState) {
      this.setState?.(this.idleState);
    }

    this.showMessage?.(
      "Herramienta de barra activada. Dibuje en 2D o seleccione nodos en 3D."
    );

    console.log("🟢 Draw Frame general activado:", {
      activeDrawTool: this.activeDrawTool,
      activeViewport: this.activeViewport,
      isDrawingFrame3D: this.isDrawingFrame3D,
    });
  },

  // =====================================================
  // DRAW FRAME > ACTIVAR DESDE MENÚ
  // Función puente para que los botones/menús llamen
  // a la herramienta general de dibujo de barras.
  // =====================================================
  activateDrawFrameTool() {
    this.startFrameDrawingMode?.();
  },

  // =====================================================
  // DRAW FRAME > CANCELAR HERRAMIENTA GENERAL DE BARRAS
  // Cancela dibujo de barras tanto en 2D como en 3D.
  // =====================================================
  cancelFrameDrawingMode() {
    this.activeDrawTool = null;

    this.isDrawingFrame3D = false;
    this.frame3DStartNode = null;
    this.frame3DEndNode = null;

    this.nodes?.forEach((node) => {
      node.selected = false;
      node.isSelected = false;
      node.is3DOnlyEndpointHover = false;
    });

    if (this.idleState) {
      this.setState?.(this.idleState);
    }

    // =====================================================
    // 3D DRAW > DESBLOQUEAR CÁMARA AL CANCELAR
    // Evita que el visor 3D quede bloqueado después de Esc.
    // =====================================================
    window.__jhSet3DDrawCameraLock?.(false);

    // =====================================================
    // 3D DRAW > LIMPIAR MALLA INVISIBLE DE DIBUJO
    // Si queda activa, bloquea la selección de barras 3D.
    // =====================================================
    window.__jhClear3DGridPointHoverReference?.();
    window.__jhDisable3DWorkPlanePickMesh?.();

    this.redraw?.();
    this.sync3D?.();

    this.showMessage?.("Herramienta de barra cancelada.");

    console.log("🟡 Draw Frame general cancelado");
  },

  // =====================================================
  // DRAW FRAME > VALIDAR SI LA HERRAMIENTA ESTÁ ACTIVA
  // Sirve para que 2D y 3D sepan si pueden dibujar barras.
  // =====================================================
  isFrameDrawingToolActive() {
    return this.activeDrawTool === "frame";
  },

  // =====================================================
  // VIEWPORT > DEFINIR VISTA ACTIVA
  // Guarda si el usuario está trabajando en canvas 2D o 3D.
  // No activa herramientas, solo registra el área activa.
  // =====================================================
  setActiveViewport(viewport, reason = "") {
    if (viewport !== "2d" && viewport !== "3d") return;

    if (this.activeViewport === viewport) return;

    this.activeViewport = viewport;

    console.log("🧭 Viewport activo:", {
      activeViewport: this.activeViewport,
      activeDrawTool: this.activeDrawTool,
      isDrawingFrame3D: this.isDrawingFrame3D,
      reason,
    });
  },

  // =====================================================
  // VIEWPORT > MARCAR CANVAS 2D ACTIVO
  // Se llama cuando el mouse/clic ocurre sobre el canvas 2D.
  // =====================================================
  mark2DViewportActive(reason = "2d interaction") {
    this.setActiveViewport?.("2d", reason);
  },

  // =====================================================
  // VIEWPORT > MARCAR CANVAS 3D ACTIVO
  // Se llama cuando el mouse/clic ocurre sobre el visor 3D.
  // =====================================================
  mark3DViewportActive(reason = "3d interaction") {
    this.setActiveViewport?.("3d", reason);
  },

  // =====================================================
  // DRAW 3D > ACTIVAR DIBUJO DE BARRAS EN 3D
  // Permite iniciar dibujo 3D sin borrar el nodo inicial
  // si ya se está dibujando una barra diagonal entre planos.
  // =====================================================
  startFrame3DDrawingMode() {
    if (this.activeDrawTool !== "frame") {
      this.startFrameDrawingMode?.();
    }

    this.activeViewport = "3d";
    this.isDrawingFrame3D = true;

    // No borrar el nodo inicial si ya existe.
    // Esto permite cambiar de planta/elevación entre el primer y segundo clic.
    if (!this.frame3DStartNode) {
      this.frame3DStartNode = null;
      this.frame3DEndNode = null;
      this.frame3DStartWorkPlane = null;
      this.frame3DEndWorkPlane = null;
    }

    if (this.idleState) {
      this.setState?.(this.idleState);
    }

    this.showMessage?.(
      this.frame3DStartNode
        ? "Seleccione el nodo final en otro punto, piso o elevación."
        : "Dibujo 3D activado: seleccione el nodo inicial en la vista 3D."
    );

    console.log("🟢 Draw Frame 3D activado:", {
      activeDrawTool: this.activeDrawTool,
      activeViewport: this.activeViewport,
      isDrawingFrame3D: this.isDrawingFrame3D,
      startNode: this.frame3DStartNode?.id ?? null,
      startWorkPlane: this.frame3DStartWorkPlane,
    });
  },

  // =====================================================
  // DRAW 3D > CANCELAR DIBUJO DE BARRAS EN 3D
  // Cancela solo la parte 3D, pero conserva o limpia
  // correctamente la herramienta general de barras.
  // =====================================================
  cancelFrame3DDrawingMode() {
    this.isDrawingFrame3D = false;
    this.frame3DStartNode = null;
    this.frame3DEndNode = null;

    this.nodes?.forEach((node) => {
      node.selected = false;
      node.isSelected = false;
    });

    // =====================================================
    // 3D DRAW > DESBLOQUEAR CÁMARA AL CANCELAR
    // Evita que el visor 3D quede bloqueado después de Esc.
    // =====================================================
    window.__jhSet3DDrawCameraLock?.(false);

    // =====================================================
    // 3D DRAW > LIMPIAR MALLA INVISIBLE DE DIBUJO
    // Si queda activa, bloquea la selección de barras 3D.
    // =====================================================
    window.__jhClear3DGridPointHoverReference?.();
    window.__jhDisable3DWorkPlanePickMesh?.();

    this.redraw?.();
    this.sync3D?.();

    this.showMessage?.("Dibujo 3D cancelado.");

    console.log("🟡 Draw Frame 3D cancelado");
  },

  // =====================================================
  // DRAW 3D > RECIBIR NODO SELECCIONADO EN 3D
  // Primer clic: guarda nodo inicial.
  // Segundo clic: crea barra 3D, incluso entre planos distintos.
  // =====================================================
  handle3DFrameNodePicked(node) {
    if (!node) return;

    if (this.activeDrawTool !== "frame") {
      this.startFrameDrawingMode?.();
    }

    if (this.isDrawingFrame3D !== true) {
      this.isDrawingFrame3D = true;
    }

    const currentWorkPlane = this.getActive3DWorkPlane?.() || {
      type: "unknown",
      fixedAxis: null,
      value: null,
    };

    // =====================================================
    // PRIMER CLIC > GUARDAR NODO INICIAL
    // =====================================================
    if (!this.frame3DStartNode) {
      this.frame3DStartNode = node;
      this.frame3DStartWorkPlane = {
        ...currentWorkPlane,
      };

      node.selected = true;
      node.isSelected = true;

      this.showMessage?.(
        "Nodo inicial seleccionado. Puede elegir otro punto, cambiar de piso/elevación y seleccionar el nodo final."
      );

      console.log("📍 Nodo inicial 3D:", {
        id: node.id,
        position: node.position,
        workPlane: this.frame3DStartWorkPlane,
      });

      this.redraw?.();
      this.sync3D?.();

      return;
    }

    // =====================================================
    // SEGUNDO CLIC > CREAR BARRA DIAGONAL / ESPACIAL
    // =====================================================
    const startNode = this.frame3DStartNode;
    const endNode = node;

    if (String(startNode.id) === String(endNode.id)) {
      this.showMessage?.("Seleccione un nodo final diferente al nodo inicial.");

      console.warn("⚠️ Nodo final igual al inicial, se mantiene el nodo inicial:", {
        nodeId: node.id,
      });

      return;
    }

    this.frame3DEndNode = endNode;
    this.frame3DEndWorkPlane = {
      ...currentWorkPlane,
    };

    console.log("📍 Nodo final 3D:", {
      id: endNode.id,
      position: endNode.position,
      startWorkPlane: this.frame3DStartWorkPlane,
      endWorkPlane: this.frame3DEndWorkPlane,
    });

    const createdFrame = this.createFrameBetween3DNodes?.(
      startNode,
      endNode,
      {
        startWorkPlane: this.frame3DStartWorkPlane,
        endWorkPlane: this.frame3DEndWorkPlane,
        createdAcrossWorkPlanes: true,
      }
    );

    if (!createdFrame) return;

    startNode.selected = false;
    startNode.isSelected = false;

    endNode.selected = false;
    endNode.isSelected = false;

    this.frame3DStartNode = null;
    this.frame3DEndNode = null;
    this.frame3DStartWorkPlane = null;
    this.frame3DEndWorkPlane = null;

    // La herramienta sigue activa para dibujar otra barra.
    this.isDrawingFrame3D = false;

    this.showMessage?.("Barra diagonal 3D creada correctamente.");

    console.log("✅ Draw Frame 3D diagonal finalizado:", {
      frameId: createdFrame.id,
    });

    this.redraw?.();
    this.sync3D?.();
  },

  // =====================================================
  // DRAW 3D > OBTENER Z ACTIVA PARA PLANTA
  // Devuelve la elevación Z del piso/planta activa.
  // =====================================================
  getActive3DWorkPlaneZ() {
    const activeView = this.viewSet?.[this.activeViewIndex];

    if (activeView?.type === "plan" && Number.isFinite(Number(activeView.elevation))) {
      return Number(activeView.elevation);
    }

    if (Number.isFinite(Number(this.currentZ))) {
      return Number(this.currentZ);
    }

    const story = this.stories?.[this.activeStory];

    if (story && Number.isFinite(Number(story.elevation))) {
      return Number(story.elevation);
    }

    return 0;
  },

  // =====================================================
  // DRAW 3D > OBTENER PLANO DE TRABAJO ACTIVO
  // Define si el dibujo 3D se hará en planta o elevación.
  // Planta:      X-Y con Z fijo.
  // Elevación Y: X-Z con Y fijo.
  // Elevación X: Y-Z con X fijo.
  // =====================================================
  getActive3DWorkPlane() {
    const activeView = this.viewSet?.[this.activeViewIndex];

    // =====================================================
    // PLANO DE ELEVACIÓN
    // axis === "Y" => plano X-Z con Y fijo.
    // axis === "X" => plano Y-Z con X fijo.
    // =====================================================
    if (activeView?.type === "elevation") {
      const fixedValue = Number(
        activeView.elevation ??
        activeView.ordinate ??
        activeView.value ??
        activeView.coord ??
        0
      );

      if (activeView.axis === "Y") {
        return {
          type: "elevationY",
          fixedAxis: "y",
          value: fixedValue,
          label: activeView.label || `Elevación Y=${fixedValue}`,
        };
      }

      if (activeView.axis === "X") {
        return {
          type: "elevationX",
          fixedAxis: "x",
          value: fixedValue,
          label: activeView.label || `Elevación X=${fixedValue}`,
        };
      }
    }

    // =====================================================
    // PLANO DE PLANTA
    // Por defecto trabaja en X-Y con Z fijo.
    // =====================================================
    return {
      type: "plan",
      fixedAxis: "z",
      value: this.getActive3DWorkPlaneZ?.() ?? 0,
      label: activeView?.label || activeView?.name || "Planta",
    };
  },

  // =====================================================
  // DRAW 3D > EXTRAER POSICIONES DE GRILLA
  // Obtiene valores exactos de grillas X o Y desde referenceGrid.
  // =====================================================
  getReferenceGridOrdinateList(axis = "x") {
    const source =
      axis === "x"
        ? this.referenceGrid?.xGrids
        : this.referenceGrid?.yGrids;

    if (!Array.isArray(source)) return [];

    return source
      .map((grid) => {
        return Number(
          grid.ordinate ??
          grid.position ??
          grid.value ??
          grid.coord ??
          0
        );
      })
      .filter((value) => Number.isFinite(value))
      .sort((a, b) => a - b);
  },

  // =====================================================
  // DRAW 3D > AJUSTAR VALOR A GRILLA MÁS CERCANA
  // Recibe un valor aproximado y lo lleva al punto exacto.
  // =====================================================
  snapValueToNearestGrid(value, gridValues = []) {
    const numericValue = Number(value || 0);

    if (!gridValues.length) return numericValue;

    let nearest = gridValues[0];
    let minDistance = Math.abs(numericValue - nearest);

    for (const candidate of gridValues) {
      const distance = Math.abs(numericValue - candidate);

      if (distance < minDistance) {
        nearest = candidate;
        minDistance = distance;
      }
    }

    return nearest;
  },

  // =====================================================
  // DRAW 3D > OBTENER ID DE GRILLA MÁS CERCANA
  // Devuelve la etiqueta de grilla, por ejemplo A, B, C o 1, 2, 3.
  // =====================================================
  getNearestGridId(axis = "x", value = 0) {
    const source =
      axis === "x"
        ? this.referenceGrid?.xGrids
        : this.referenceGrid?.yGrids;

    if (!Array.isArray(source) || !source.length) return null;

    let nearestGrid = source[0];
    let minDistance = Math.abs(
      Number(value || 0) -
      Number(nearestGrid.ordinate ?? nearestGrid.position ?? nearestGrid.value ?? 0)
    );

    for (const grid of source) {
      const ordinate = Number(grid.ordinate ?? grid.position ?? grid.value ?? 0);
      const distance = Math.abs(Number(value || 0) - ordinate);

      if (distance < minDistance) {
        nearestGrid = grid;
        minDistance = distance;
      }
    }

    return nearestGrid.id ?? nearestGrid.label ?? nearestGrid.name ?? null;
  },

  // =====================================================
  // DRAW 3D > SNAP A GRID POINT EXACTO SEGÚN VISTA ACTIVA
  // Planta: ajusta X/Y y fija Z.
  // Elevación Y: ajusta X/Z y fija Y.
  // Elevación X: ajusta Y/Z y fija X.
  // =====================================================
  snap3DModelPointToGridPoint(approxPoint = {}) {
    const xValues = this.getReferenceGridOrdinateList?.("x") || [];
    const yValues = this.getReferenceGridOrdinateList?.("y") || [];

    const workPlane = this.getActive3DWorkPlane?.() || {
      type: "plan",
      fixedAxis: "z",
      value: 0,
    };

    let snappedX = Number(approxPoint.x || 0);
    let snappedY = Number(approxPoint.y || 0);
    let snappedZ = Number(approxPoint.z || 0);

    // =====================================================
    // PLANTA > X/Y CON Z FIJO
    // Ejemplo: Base, Piso 1, Piso 2.
    // =====================================================
    if (workPlane.type === "plan") {
      snappedX = this.snapValueToNearestGrid?.(approxPoint.x, xValues);
      snappedY = this.snapValueToNearestGrid?.(approxPoint.y, yValues);
      snappedZ = Number(workPlane.value || 0);
    }

    // =====================================================
    // ELEVACIÓN Y > X/Z CON Y FIJO
    // Ejemplo: elevación sobre una línea de grilla Y.
    // =====================================================
    if (workPlane.type === "elevationY") {
      snappedX = this.snapValueToNearestGrid?.(approxPoint.x, xValues);
      snappedY = Number(workPlane.value || 0);
      snappedZ = this.snapValueToNearestStory?.(approxPoint.z);
    }

    // =====================================================
    // ELEVACIÓN X > Y/Z CON X FIJO
    // Ejemplo: elevación sobre una línea de grilla X.
    // =====================================================
    if (workPlane.type === "elevationX") {
      snappedX = Number(workPlane.value || 0);
      snappedY = this.snapValueToNearestGrid?.(approxPoint.y, yValues);
      snappedZ = this.snapValueToNearestStory?.(approxPoint.z);
    }

    const xGridId = this.getNearestGridId?.("x", snappedX);
    const yGridId = this.getNearestGridId?.("y", snappedY);

    return {
      x: Number(snappedX || 0),
      y: Number(snappedY || 0),
      z: Number(snappedZ || 0),

      xGridId,
      yGridId,

      workPlaneType: workPlane.type,
      workPlaneAxis: workPlane.fixedAxis,
      workPlaneValue: workPlane.value,
      workPlaneLabel: workPlane.label,
    };
  },

  // =====================================================
  // DRAW 3D > OBTENER ELEVACIONES DE PISOS
  // Devuelve las alturas Z disponibles: Base, Piso 1, Piso 2...
  // =====================================================
  getStoryElevationList() {
    if (!Array.isArray(this.stories) || !this.stories.length) {
      return [0];
    }

    return this.stories
      .map((story) => Number(story.elevation ?? 0))
      .filter((value) => Number.isFinite(value))
      .sort((a, b) => a - b);
  },

  // =====================================================
  // DRAW 3D > AJUSTAR Z A PISO MÁS CERCANO
  // Para elevaciones, permite hacer snap exacto a los niveles.
  // =====================================================
  snapValueToNearestStory(value) {
    const storyValues = this.getStoryElevationList?.() || [0];

    return this.snapValueToNearestGrid?.(value, storyValues);
  },

  // =====================================================
  // DRAW 3D > BUSCAR NODO EN PUNTO EXACTO
  // Revisa si ya existe un nodo en la coordenada X/Y/Z.
  // =====================================================
  findNodeAt3DPoint(point, tolerance = 0.001) {
    if (!point || !Array.isArray(this.nodes)) return null;

    return this.nodes.find((node) => {
      const p = node.position || {};

      return (
        Math.abs(Number(p.x || 0) - Number(point.x || 0)) <= tolerance &&
        Math.abs(Number(p.y || 0) - Number(point.y || 0)) <= tolerance &&
        Math.abs(Number(p.z || 0) - Number(point.z || 0)) <= tolerance
      );
    }) || null;
  },

  // =====================================================
  // DRAW 3D > GENERAR ID ÚNICO DE NODO
  // Evita repetir IDs al crear nodos desde el visor 3D.
  // =====================================================
  getNextNodeIdSafe() {
    if (!Array.isArray(this.nodes)) {
      this.nodes = [];
    }

    const maxNodeId = this.nodes.reduce((max, node) => {
      return Math.max(max, Number(node.id || 0));
    }, 0);

    const nextNodeCandidate = Number(this.nextNodeId || 0);

    const nextId = Math.max(
      maxNodeId + 1,
      nextNodeCandidate || 1
    );

    this.nextNodeId = nextId + 1;

    return nextId;
  },

  // =====================================================
  // DRAW 3D > CREAR NODO EN GRID POINT EXACTO
  // Crea un nodo nuevo en una coordenada exacta de grilla 3D.
  // =====================================================
  createNodeAt3DGridPoint(point) {
    if (!point) return null;

    if (!Array.isArray(this.nodes)) {
      this.nodes = [];
    }

    const nodeId = this.getNextNodeIdSafe?.();

    const node = {
      id: nodeId,
      position: {
        x: Number(point.x || 0),
        y: Number(point.y || 0),
        z: Number(point.z || 0),
      },
      // =====================================================
      // DRAW 3D > CARGAS INICIALES DEL NODO
      // Evita errores en renderer.drawForce() cuando el nodo
      // recién fue creado desde el visor 3D.
      // =====================================================
      force: {
        loads: {
          [this.options?.currentLoad || this.currentLoad || "default"]: {
            x: 0,
            y: 0,
            z: 0,
            fx: 0,
            fy: 0,
            fz: 0,
            mx: 0,
            my: 0,
            mz: 0,
          },
        },
      },
      // =====================================================
      // DRAW 3D > REACCIÓN INICIAL DEL NODO
      // Evita errores en renderer.drawReaction().
      // =====================================================
      reaction: {
        x: 0,
        y: 0,
        z: 0,
        rx: 0,
        ry: 0,
        rz: 0,
        getModel() {
          return this;
        },
      },
      beams: [],
      soporte: "",
      selected: false,
      isSelected: false,
      visible: true,

      // Metadata útil para saber que fue creado desde el visor 3D.
      createdFrom3D: true,
      xGridId: point.xGridId ?? null,
      yGridId: point.yGridId ?? null,
    };

    this.nodes.push(node);

    console.log("📍 Nodo 3D creado en grid point:", {
      id: node.id,
      position: node.position,
      xGridId: node.xGridId,
      yGridId: node.yGridId,
    });

    return node;
  },

  // =====================================================
  // DRAW 3D > BUSCAR O CREAR NODO EN PUNTO 3D
  // Recibe un punto aproximado del visor 3D, lo ajusta a grilla,
  // busca nodo existente y, si no existe, crea uno nuevo.
  // =====================================================
  findOrCreateNodeAt3DModelPoint(approxPoint) {
    if (!approxPoint) return null;

    const snappedPoint = this.snap3DModelPointToGridPoint?.(approxPoint);

    if (!snappedPoint) return null;

    const existingNode = this.findNodeAt3DPoint?.(snappedPoint);

    if (existingNode) {
      console.log("📍 Nodo 3D existente usado:", {
        id: existingNode.id,
        position: existingNode.position,
        xGridId: snappedPoint.xGridId,
        yGridId: snappedPoint.yGridId,
      });

      return existingNode;
    }

    const newNode = this.createNodeAt3DGridPoint?.(snappedPoint);

    this.redraw?.();
    this.sync3D?.();

    return newNode;
  },

  // =====================================================
  // DRAW 3D > CREAR BARRA ENTRE NODOS 3D
  // Crea una barra real usando dos nodos seleccionados
  // directamente desde el visor 3D.
  // =====================================================
  createFrameBetween3DNodes(node1, node2, options = {}) {
    // =====================================================
    // DRAW 3D > VALIDAR NODOS
    // Evita crear barras con datos incompletos.
    // =====================================================
    if (!node1 || !node2) {
      this.showMessage?.("No se pudo crear la barra 3D: nodos inválidos.");
      return null;
    }

    if (String(node1.id) === String(node2.id)) {
      this.showMessage?.("Seleccione dos nodos diferentes para crear la barra 3D.");
      return null;
    }

    if (!Array.isArray(this.shapes)) {
      this.shapes = [];
    }

    // =====================================================
    // DRAW 3D > EVITAR BARRAS DUPLICADAS
    // No permite crear otra barra entre los mismos dos nodos.
    // Sirve aunque el orden sea nodo 1 -> nodo 2 o nodo 2 -> nodo 1.
    // =====================================================
    const existingFrame = this.shapes.find((frame) => {
      const frameNode1Id = String(frame.node1?.id ?? frame.node1);
      const frameNode2Id = String(frame.node2?.id ?? frame.node2);

      const pickedNode1Id = String(node1.id);
      const pickedNode2Id = String(node2.id);

      return (
        (frameNode1Id === pickedNode1Id && frameNode2Id === pickedNode2Id) ||
        (frameNode1Id === pickedNode2Id && frameNode2Id === pickedNode1Id)
      );
    });

    if (existingFrame) {
      this.showMessage?.(
        `Ya existe una barra entre los nodos ${node1.id} y ${node2.id}.`
      );

      console.warn("⚠️ Barra duplicada evitada:", {
        existingFrameId: existingFrame.id,
        node1: node1.id,
        node2: node2.id,
      });

      return null;
    }

    // =====================================================
    // DRAW 3D > GENERAR ID ÚNICO DE BARRA
    // Evita repetir IDs aunque nextShapeId o nextBeamId estén desactualizados.
    // =====================================================
    const maxShapeId = this.shapes.reduce((max, shape) => {
      return Math.max(max, Number(shape.id || 0));
    }, 0);

    const nextShapeCandidate = Number(this.nextShapeId || 0);
    const nextBeamCandidate = Number(this.nextBeamId || 0);

    const nextId = Math.max(
      maxShapeId + 1,
      nextShapeCandidate || 1,
      nextBeamCandidate || 1
    );

    this.nextShapeId = nextId + 1;
    this.nextBeamId = nextId + 1;

    // =====================================================
    // DRAW 3D > CALCULAR TIPO DE BARRA
    // Si cambia de altura Z, será una barra 3D-only.
    // Si además cambia X/Y, será inclinada espacial.
    // =====================================================
    const p1 = node1.position || {};
    const p2 = node2.position || {};

    const tol = 0.001;

    const dx = Math.abs(Number(p2.x || 0) - Number(p1.x || 0));
    const dy = Math.abs(Number(p2.y || 0) - Number(p1.y || 0));
    const dz = Math.abs(Number(p2.z || 0) - Number(p1.z || 0));

    const isDifferentZFrame = dz > tol;
    const isSpatialInclinedFrame =
      dz > tol && (dx > tol || dy > tol);

    const isVertical3DFrame =
      dz > tol && dx <= tol && dy <= tol;

    // =====================================================
    // DRAW 3D > CREAR OBJETO FRAME
    // Frame real que será renderizado en 2D/3D.
    // =====================================================
    const frame = {
      id: nextId,

      type: "beam",
      elementType: "beam",

      node1,
      node2,

      selected: false,
      isSelected: false,
      highlighted3D: false,
      visible: true,

      // Propiedades especiales para barras creadas desde 3D
      createdFrom3D: true,
      is3DOnlyFrame: isDifferentZFrame,
      isCrossViewFrame: isDifferentZFrame,
      isSpatialInclinedFrame,
      isVertical3DFrame,

      // =====================================================
      // DRAW 3D > BARRAS DIAGONALES ENTRE PLANOS
      // =====================================================
      createdAcrossWorkPlanes: options.createdAcrossWorkPlanes === true,
      startWorkPlane: options.startWorkPlane || null,
      endWorkPlane: options.endWorkPlane || null,

      is3DDiagonalFrame: isSpatialInclinedFrame,
      isCrossPlaneFrame:
        options.createdAcrossWorkPlanes === true ||
        isSpatialInclinedFrame ||
        isVertical3DFrame,

      // Si cambia de altura, no se dibuja como línea normal en 2D.
      showIn2D: !isDifferentZFrame,
    };

    // =====================================================
    // DRAW 3D > AGREGAR BARRA AL MODELO
    // Inserta el frame dentro del arreglo principal de barras.
    // =====================================================
    this.shapes.push(frame);

    // =====================================================
    // DRAW 3D > VINCULAR BARRA A LOS NODOS
    // Evita duplicar la misma barra dentro de node.beams.
    // =====================================================
    const addFrameToNode = (node, frameToAdd) => {
      if (!node) return;

      if (!Array.isArray(node.beams)) {
        node.beams = [];
      }

      const alreadyLinked = node.beams.some((beam) => {
        return String(beam?.id) === String(frameToAdd.id);
      });

      if (!alreadyLinked) {
        node.beams.push(frameToAdd);
      }
    };

    addFrameToNode(node1, frame);
    addFrameToNode(node2, frame);

    // =====================================================
    // DRAW 3D > LOG DE VALIDACIÓN
    // Muestra en consola qué tipo de barra se creó.
    // =====================================================
    console.log("📐 Barra 3D creada:", {
      id: frame.id,
      node1: node1.id,
      node2: node2.id,
      dx,
      dy,
      dz,
      is3DOnlyFrame: frame.is3DOnlyFrame,
      isCrossViewFrame: frame.isCrossViewFrame,
      isSpatialInclinedFrame: frame.isSpatialInclinedFrame,
      isVertical3DFrame: frame.isVertical3DFrame,
      showIn2D: frame.showIn2D,
    });

    this.showMessage?.(
      `Barra 3D creada entre nodo ${node1.id} y nodo ${node2.id}.`
    );

    // =====================================================
    // DRAW 3D > ACTUALIZAR VISTAS
    // Redibuja canvas 2D y visor 3D.
    // =====================================================
    this.redraw?.();
    this.sync3D?.();

    requestAnimationFrame(() => {
      this.sync3D?.();
    });

    return frame;
  },

  // =====================================================
  // SELECTION > LIMPIAR TODA LA SELECCIÓN
  // Limpia nodos, barras, estados internos y highlights 3D.
  // Versión segura para objetos creados desde 2D o desde 3D.
  // =====================================================
  // clearAllSelections() {
  //   const objects = this.getSelectableObjects
  //     ? this.getSelectableObjects({ include3DOnlyFrames: true })
  //     : [];

  //   // =====================================================
  //   // =====================================================
  //   // SELECTION > FUNCIÓN SEGURA PARA DESELECCIONAR
  //   // Evita que reviente si un objeto no tiene style.default().
  //   // =====================================================
  //   const safeUnselectObject = (obj) => {
  //     if (!obj) return;

  //     obj.selected = false;
  //     obj.isSelected = false;
  //     obj.highlighted3D = false;
  //     obj.is3DOnlyEndpointHover = false;

  //     // No llamamos setObjectSelected aquí para evitar que una versión antigua
  //     // de esa función use obj.style.default() sin validar.
  //     obj.style?.default?.();
  //   };

  //   // =====================================================
  //   // SELECTION > LIMPIAR OBJETOS SELECCIONABLES
  //   // Incluye barras normales, nodos, áreas y barras 3D-only.
  //   // =====================================================
  //   objects.forEach((obj) => {
  //     safeUnselectObject(obj);
  //   });

  //   // =====================================================
  //   // SELECTION > LIMPIAR BARRAS DIRECTAMENTE
  //   // Necesario para barras 3D-only ocultas en 2D.
  //   // =====================================================
  //   this.shapes?.forEach((frame) => {
  //     frame.selected = false;
  //     frame.isSelected = false;
  //     frame.highlighted3D = false;
  //     frame.is3DOnlyEndpointHover = false;

  //     frame.style?.default?.();
  //   });

  //   // =====================================================
  //   // SELECTION > LIMPIAR NODOS DIRECTAMENTE
  //   // Necesario para nodos creados desde el visor 3D.
  //   // =====================================================
  //   this.nodes?.forEach((node) => {
  //     node.selected = false;
  //     node.isSelected = false;
  //     node.is3DOnlyEndpointHover = false;

  //     node.style?.default?.();
  //   });

  //   // =====================================================
  //   // SELECTION > LIMPIAR ÁREAS SI EXISTEN
  //   // Evita que queden áreas seleccionadas al cambiar de vista.
  //   // =====================================================
  //   this.areas?.forEach((area) => {
  //     area.selected = false;
  //     area.isSelected = false;
  //     area.highlighted3D = false;

  //     area.style?.default?.();
  //   });

  //   // =====================================================
  //   // SELECTION > LIMPIAR ESTADOS INTERNOS
  //   // Limpia arreglos de estados de selección.
  //   // =====================================================
  //   if (this.selectedNodesState?.selectedObjects) {
  //     this.selectedNodesState.selectedObjects = [];
  //   }

  //   if (this.selectedBeamsState?.selectedObjects) {
  //     this.selectedBeamsState.selectedObjects = [];
  //   }

  //   if (this.selectedBeamsState?.selectedBeams) {
  //     this.selectedBeamsState.selectedBeams = [];
  //   }

  //   if (this.selectedParametricState?.selectedObjects) {
  //     this.selectedParametricState.selectedObjects = [];
  //   }

  //   this.selectedBeams = [];
  //   this.selectedObjects = [];
  //   this.hovered3DOnlyEndpointNode = null;
  //   this.hovered3DOnlyEndpointFrames = [];
  //   this.last3DOnlyEndpointHelpKey = null;

  //   // =====================================================
  //   // 3D DRAW > DESBLOQUEAR CÁMARA SI ESTABA EN MODO DIBUJO
  //   // Evita que el visor 3D quede bloqueado al limpiar selección.
  //   // =====================================================
  //   window.__jhSet3DDrawCameraLock?.(false);

  //   // =====================================================
  //   // 3D > FORZAR LIMPIEZA DE HIGHLIGHTS
  //   // renderModel3d.js leerá esta bandera y eliminará
  //   // cualquier highlight 3D que haya quedado en escena.
  //   // =====================================================
  //   this.forceClear3DFrameHighlights = true;

  //   console.log("🧹 clearAllSelections ejecutado:", {
  //     selectedFrames: this.shapes?.filter((frame) =>
  //       frame.selected || frame.isSelected || frame.highlighted3D
  //     ).length,
  //     selectedNodes: this.nodes?.filter((node) =>
  //       node.selected || node.isSelected
  //     ).length,
  //   });

  //   // =====================================================
  //   // RENDER > REDIBUJAR 2D Y 3D
  //   // Protegido para evitar que un error de render bloquee cambio de vista.
  //   // =====================================================
  //   try {
  //     this.redraw?.();
  //   } catch (error) {
  //     console.warn("⚠️ redraw falló después de clearAllSelections:", error?.message);
  //   }

  //   try {
  //     this.sync3D?.();

  //     requestAnimationFrame(() => {
  //       this.sync3D?.();
  //     });
  //   } catch (error) {
  //     console.warn("⚠️ sync3D falló después de clearAllSelections:", error?.message);
  //   }

  //   this.showMessage?.("Selección limpiada");
  // },

  invertSelection() {
    const objects = this.getSelectableObjects();

    objects.forEach((obj) => {
      const isSelected = obj.selected === true;
      this.setObjectSelected(obj, !isSelected);
    });

    const selectedCount = this.getSelectedObjects().length;

    this.redraw?.();
    this.sync3D?.();

    this.showMessage?.(`Selección invertida: ${selectedCount} objetos seleccionados`);
  },

  getPointPosition(point) {
    if (!point) return null;

    const p = point.position || point;

    return {
      x: Number(p.x ?? 0),
      y: Number(p.y ?? 0),
      z: Number(p.z ?? 0),
    };
  },

  getObjectPoints(obj) {
    if (!obj) return [];

    // Caso nodo
    if (obj.position || obj.objectType === "node") {
      const p = this.getPointPosition(obj);
      return p ? [p] : [];
    }

    // Caso barra / viga / columna
    if (obj.node1 && obj.node2) {
      const p1 = this.getPointPosition(obj.node1);
      const p2 = this.getPointPosition(obj.node2);

      return [p1, p2].filter(Boolean);
    }

    // Caso objeto con nodes[]
    if (Array.isArray(obj.nodes)) {
      return obj.nodes
        .map((node) => this.getPointPosition(node))
        .filter(Boolean);
    }

    // Caso objeto con points[]
    if (Array.isArray(obj.points)) {
      return obj.points
        .map((point) => this.getPointPosition(point))
        .filter(Boolean);
    }

    return [];
  },

  isObjectOnPlane(obj, plane = "XY", planeValue = 0, tolerance = null) {
    const points = this.getObjectPoints(obj);

    if (!points.length) return false;

    const tol = tolerance ?? this.getModelTolerance?.() ?? 0.001;
    const value = Number(planeValue);

    if (plane === "XY") {
      return points.every((p) => Math.abs(p.z - value) <= tol);
    }

    if (plane === "XZ") {
      return points.every((p) => Math.abs(p.y - value) <= tol);
    }

    if (plane === "YZ") {
      return points.every((p) => Math.abs(p.x - value) <= tol);
    }

    return false;
  },

  getDefaultPlaneValue(plane = "XY") {
    if (plane === "XY") {
      return Number(
        this.currentZ ??
        this.stories?.[this.activeStory]?.elevation ??
        0
      );
    }

    if (plane === "XZ") {
      return Number(this.activeElevationY ?? this.currentY ?? 0);
    }

    if (plane === "YZ") {
      return Number(this.activeElevationX ?? this.currentX ?? 0);
    }

    return 0;
  },

  // =====================================================
  // FILTRO DE OBJETOS POR VISTA ACTIVA
  // Planta: filtra por Z del piso activo
  // Elevación: filtra por eje X o Y activo
  // =====================================================

  getActiveView() {
    return this.viewSet?.[this.activeViewIndex] || null;
  },

  getActivePlanElevation() {
    const view = this.getActiveView?.();

    if (view?.type === "plan") {
      return Number(view.elevation ?? view.z ?? 0);
    }

    const storyByIndex = this.stories?.[this.activeStory];

    if (storyByIndex) {
      return Number(storyByIndex.elevation ?? 0);
    }

    const storyByName = this.stories?.find((story) => {
      return story.name === this.currentStory;
    });

    if (storyByName) {
      return Number(storyByName.elevation ?? 0);
    }

    return Number(this.currentZ ?? 0);
  },

  getActiveViewTolerance() {
    return Number(
      this.preferences?.modelTolerance ??
      this.modelTolerance ??
      0.001
    );
  },

  isNodeVisibleInActiveView(node) {
    if (!node?.position) return false;

    const view = this.getActiveView?.();
    const tol = this.getActiveViewTolerance();

    const x = Number(node.position.x ?? 0);
    const y = Number(node.position.y ?? 0);
    const z = Number(node.position.z ?? 0);

    // Si no hay vista definida, dejamos visible para no romper el sistema
    if (!view) return true;

    // ==========================
    // PLANTA: filtra por Z
    // ==========================
    if (view.type === "plan" || this.currentViewMode === "plan") {
      const activeZ = this.getActivePlanElevation();
      return Math.abs(z - activeZ) <= tol;
    }

    // ==========================
    // ELEVACIÓN
    // axis X: plano Y-Z con X fijo
    // axis Y: plano X-Z con Y fijo
    // ==========================
    if (view.type === "elevation") {
      const value = Number(view.value ?? 0);

      if (view.axis === "X") {
        return Math.abs(x - value) <= tol;
      }

      if (view.axis === "Y") {
        return Math.abs(y - value) <= tol;
      }
    }

    return true;
  },

  isFrameVisibleInActiveView(frame) {
    if (!frame?.node1 || !frame?.node2) return false;

    const view = this.getActiveView?.();
    const tol = this.getActiveViewTolerance();

    const z1 = Number(frame.node1.position?.z ?? 0);
    const z2 = Number(frame.node2.position?.z ?? 0);

    // ==========================
    // PLANTA
    // ==========================
    if (!view || view.type === "plan" || this.currentViewMode === "plan") {
      const activeZ = this.getActivePlanElevation();

      const node1OnStory = Math.abs(z1 - activeZ) <= tol;
      const node2OnStory = Math.abs(z2 - activeZ) <= tol;

      // Vigas horizontales del piso activo
      if (node1OnStory && node2OnStory) {
        return true;
      }

      // Columnas o elementos verticales que cruzan el piso activo
      const minZ = Math.min(z1, z2);
      const maxZ = Math.max(z1, z2);

      const crossesStory =
        activeZ >= minZ - tol &&
        activeZ <= maxZ + tol;

      return crossesStory && Math.abs(z1 - z2) > tol;
    }

    // ==========================
    // ELEVACIÓN
    // ==========================
    if (view.type === "elevation") {
      return (
        this.isNodeVisibleInActiveView(frame.node1) &&
        this.isNodeVisibleInActiveView(frame.node2)
      );
    }

    return true;
  },

  isAreaVisibleInActiveView(area) {
    if (!area || area.visible === false) return false;
    if (!Array.isArray(area.points) || area.points.length < 3) return false;

    const view = this.getActiveView?.();
    const tol = this.getActiveViewTolerance?.() ?? 0.001;
    const points = area.points;

    if (!view) return true;

    // ==========================
    // PLANTA: X-Y con Z fijo
    // ==========================
    if (view.type === "plan" || this.currentViewMode === "plan") {
      const activeZ = this.getActivePlanElevation?.() ?? 0;

      const zs = points.map((p) => Number(p.z ?? 0));
      const minZ = Math.min(...zs);
      const maxZ = Math.max(...zs);

      const allOnPlan = zs.every((z) => Math.abs(z - activeZ) <= tol);

      const crossesPlan =
        activeZ >= minZ - tol &&
        activeZ <= maxZ + tol;

      return allOnPlan || crossesPlan;
    }

    // ==========================
    // ELEVACIÓN:
    // axis X => plano Y-Z con X fijo
    // axis Y => plano X-Z con Y fijo
    // ==========================
    if (view.type === "elevation") {
      const value = Number(view.value ?? 0);

      if (view.axis === "X") {
        return points.every((p) => {
          const x = Number(p.x ?? 0);
          return Math.abs(x - value) <= tol;
        });
      }

      if (view.axis === "Y") {
        return points.every((p) => {
          const y = Number(p.y ?? 0);
          return Math.abs(y - value) <= tol;
        });
      }
    }

    return true;
  },

  // Controla si un objeto pertenece a la planta/elevación actual. También oculta barras 3D-only del canvas 2D.
  // =====================================================
  isObjectVisibleInActiveView(obj) {
    if (!obj) return false;

    // Barras / frames
    if (obj.node1 && obj.node2) {
      // =====================================================
      // VIEW 2D > OCULTAR BARRAS 3D-ONLY
      // Si la barra no debe verse en 2D, no debe contarse
      // como visible ni seleccionable en la vista activa.
      // =====================================================
      if (
        typeof this.shouldDrawFrameIn2D === "function" &&
        !this.shouldDrawFrameIn2D(obj)
      ) {
        return false;
      }

      return this.isFrameVisibleInActiveView(obj);
    }

    // Nodos
    if (obj.position) {
      return this.isNodeVisibleInActiveView(obj);
    }

    // Áreas
    if (Array.isArray(obj.points)) {
      return this.isAreaVisibleInActiveView(obj);
    }

    return true;
  },

  getVisibleObjectsForActiveView(objects = []) {
    return objects.filter((obj) => this.isObjectVisibleInActiveView(obj));
  },

  async selectByPlane(plane = "XY") {
    const defaultValue = this.getDefaultPlaneValue(plane);

    const axisLabel = plane === "XY"
      ? "Z"
      : plane === "XZ"
        ? "Y"
        : "X";

    const result = await Swal.fire({
      title: `Seleccionar en Plano ${plane}`,
      html: `
      <div style="text-align:left; font-size:13px;">
        <label>Coordenada ${axisLabel} del plano:</label>
        <input id="select-plane-value" type="number" step="0.001"
          class="swal2-input" value="${defaultValue}">
      </div>
    `,
      showCancelButton: true,
      confirmButtonText: "Seleccionar",
      cancelButtonText: "Cancelar",
      preConfirm: () => {
        return Number(document.getElementById("select-plane-value").value);
      },
    });

    if (!result.isConfirmed) return;

    const planeValue = result.value;
    const tolerance = this.getModelTolerance?.() ?? 0.001;

    const objects = this.getSelectableObjects().filter((obj) =>
      this.isObjectOnPlane(obj, plane, planeValue, tolerance)
    );

    this.selectObjects(objects);

    this.showMessage?.(
      `Plano ${plane}: ${objects.length} objetos seleccionados`
    );
  },

  async deselectByPlane(plane = "XY") {
    const defaultValue = this.getDefaultPlaneValue(plane);

    const axisLabel = plane === "XY"
      ? "Z"
      : plane === "XZ"
        ? "Y"
        : "X";

    const result = await Swal.fire({
      title: `Deseleccionar en Plano ${plane}`,
      html: `
      <div style="text-align:left; font-size:13px;">
        <label>Coordenada ${axisLabel} del plano:</label>
        <input id="deselect-plane-value" type="number" step="0.001"
          class="swal2-input" value="${defaultValue}">
      </div>
    `,
      showCancelButton: true,
      confirmButtonText: "Deseleccionar",
      cancelButtonText: "Cancelar",
      preConfirm: () => {
        return Number(document.getElementById("deselect-plane-value").value);
      },
    });

    if (!result.isConfirmed) return;

    const planeValue = result.value;
    const tolerance = this.getModelTolerance?.() ?? 0.001;

    const objects = this.getSelectedObjects().filter((obj) =>
      this.isObjectOnPlane(obj, plane, planeValue, tolerance)
    );

    this.deselectObjects(objects);

    this.showMessage?.(
      `Plano ${plane}: ${objects.length} objetos deseleccionados`
    );
  },

  setWindowLayout(layout) {
    this.windowLayout = layout;

    const workspace = document.getElementById("cad-workspace");
    const panel2D = document.getElementById("cad-panel-2d");
    const panel3D = document.getElementById("cad-panel-3d");

    if (!workspace || !panel2D || !panel3D) {
      this.showMessage?.("No se encontró el contenedor de vistas", "warning");
      return;
    }

    workspace.dataset.layout = layout;

    // Limpiar clases del workspace
    workspace.classList.remove(
      "grid-cols-1",
      "grid-cols-2",
      "grid-rows-1",
      "grid-rows-2"
    );

    // Limpiar clases de paneles
    panel2D.classList.remove(
      "hidden",
      "border-r",
      "border-b"
    );

    panel3D.classList.remove(
      "hidden",
      "border-r",
      "border-b"
    );

    // ==========================
    // One: solo vista 2D
    // ==========================
    if (layout === "one") {
      workspace.classList.add("grid-cols-1", "grid-rows-1");

      if (this.singleWindowView === "2d") {
        panel2D.classList.remove("hidden");
        panel3D.classList.add("hidden");
      }

      if (this.singleWindowView === "3d") {
        panel2D.classList.add("hidden");
        panel3D.classList.remove("hidden");
      }

      this.showMessage?.(`Windows: One - ${this.singleWindowView.toUpperCase()}`);
    }

    // ==========================
    // Two Tiled Vertically: 2D | 3D
    // ==========================
    else if (layout === "two-vertical") {
      workspace.classList.add("grid-cols-2", "grid-rows-1");

      panel2D.classList.add("border-r");

      this.showMessage?.("Windows: Two Tiled Vertically");
    }

    // ==========================
    // Two Tiled Horizontally:
    // 2D
    // 3D
    // ==========================
    else if (layout === "two-horizontal") {
      workspace.classList.add("grid-cols-1", "grid-rows-2");

      panel2D.classList.add("border-b");

      this.showMessage?.("Windows: Two Tiled Horizontally");
    }

    // ==========================
    // Pendientes
    // ==========================
    else if (layout === "three") {
      workspace.classList.add("grid-cols-2", "grid-rows-1");

      panel2D.classList.add("border-r");

      this.showMessage?.(
        "Windows: Three requiere crear una tercera vista",
        "warning"
      );
    }

    else if (layout === "four") {
      workspace.classList.add("grid-cols-2", "grid-rows-1");

      panel2D.classList.add("border-r");

      this.showMessage?.(
        "Windows: Four requiere crear vistas adicionales",
        "warning"
      );
    }

    setTimeout(() => {
      this.windowResize?.();

      const viewer = getViewer3DState?.();

      if (viewer?.engine) {
        viewer.engine.resize();
      }

      this.redraw?.();
      this.sync3D?.();
    }, 100);
  },

  setSingleWindowView(view) {
    if (view !== "2d" && view !== "3d") return;

    this.singleWindowView = view;

    if (this.windowLayout === "one") {
      this.setWindowLayout("one");
    }

    this.showMessage?.(`Vista activa: ${view.toUpperCase()}`);

    setTimeout(() => {
      this.windowResize?.();

      const viewer = getViewer3DState?.();
      if (viewer?.engine) {
        viewer.engine.resize();
      }

      this.redraw?.();
      this.sync3D?.();
    }, 100);
  },

  setCanvasTheme(themeKey) {
    const theme = this.canvasThemes?.[themeKey];

    if (!theme) {
      this.showMessage?.("Tema de canvas no válido", "warning");
      return;
    }

    this.activeCanvasTheme = themeKey;

    this.displayColors = {
      ...this.displayColors,
      ...theme.displayColors,
    };

    this.canvas2dBackground = theme.canvas2d;

    const panel2D = document.getElementById("cad-panel-2d");

    if (panel2D) {
      panel2D.style.backgroundColor = theme.canvas2d;
    }

    if (this.canvas) {
      this.canvas.style.backgroundColor = theme.canvas2d;
    }

    this.applyThemeToViewer3DCanvas(theme.canvas3d);

    // localStorage.setItem("cad-canvas-theme", themeKey);

    this.showMessage?.(
      themeKey === "dark"
        ? "Canvas oscuro activado"
        : "Canvas claro activado"
    );

    this.redraw?.();
    this.sync3D?.();
  },

  applyThemeToViewer3DCanvas(hexColor) {
    const viewer = getViewer3DState?.();

    if (!viewer?.scene) return;

    const rgb = this.hexToRgb(hexColor);

    if (!rgb) return;

    viewer.scene.clearColor = new BABYLON.Color4(
      rgb.r / 255,
      rgb.g / 255,
      rgb.b / 255,
      1
    );
  },

  hexToRgb(hex) {
    const clean = String(hex || "").replace("#", "");

    if (clean.length !== 6) return null;

    const value = parseInt(clean, 16);

    return {
      r: (value >> 16) & 255,
      g: (value >> 8) & 255,
      b: value & 255,
    };
  },

  async openDisplayColorsDialog() {
    const c = this.displayColors;

    const { value } = await Swal.fire({
      title: "Display Colors",
      width: 520,
      html: `
      <div style="display:grid; grid-template-columns: 1fr 90px; gap:10px; align-items:center; text-align:left; font-size:13px;">

        <label>Fondo 2D</label>
        <input id="color-background2d" type="color" value="${c.background2d}">

        <label>Grilla secundaria</label>
        <input id="color-gridLine" type="color" value="${c.gridLine}">

        <label>Grilla principal / ejes</label>
        <input id="color-gridMainLine" type="color" value="${c.gridMainLine}">

        <label>Barras / vigas</label>
        <input id="color-beam" type="color" value="${c.beam}">

        <label>Vigas secundarias</label>
        <input id="color-secondaryBeam" type="color" value="${c.secondaryBeam}">

        <label>Columnas</label>
        <input id="color-column" type="color" value="${c.column}">

        <label>Nodos</label>
        <input id="color-node" type="color" value="${c.node}">

        <label>Textos</label>
        <input id="color-text" type="color" value="${c.text}">

        <label>Elemento seleccionado</label>
        <input id="color-selected" type="color" value="${c.selected}">

        <label>Snap</label>
        <input id="color-snap" type="color" value="${c.snap}">
      </div>
    `,
      showCancelButton: true,
      showDenyButton: true,
      confirmButtonText: "Aplicar",
      denyButtonText: "Restaurar",
      cancelButtonText: "Cancelar",
      preConfirm: () => {
        return {
          background2d: document.getElementById("color-background2d").value,
          gridLine: document.getElementById("color-gridLine").value,
          gridMainLine: document.getElementById("color-gridMainLine").value,
          beam: document.getElementById("color-beam").value,
          secondaryBeam: document.getElementById("color-secondaryBeam").value,
          column: document.getElementById("color-column").value,
          node: document.getElementById("color-node").value,
          text: document.getElementById("color-text").value,
          selected: document.getElementById("color-selected").value,
          snap: document.getElementById("color-snap").value,
        };
      },
    });

    if (value) {
      this.setDisplayColors(value);
      return;
    }

    if (value === false) {
      this.resetDisplayColors();
    }
  },

  async openDimensionsTolerancesDialog() {
    const p = this.preferences;

    const { value } = await Swal.fire({
      title: "Dimensions / Tolerances",
      width: 520,
      html: `
      <div style="display:grid; grid-template-columns: 1fr 160px; gap:10px; align-items:center; text-align:left; font-size:13px;">
        <label>Unidad de longitud</label>
        <select id="pref-length-unit" class="swal2-input" style="width:140px;">
          <option value="m">m</option>
          <option value="cm">cm</option>
          <option value="mm">mm</option>
        </select>

        <label>Unidad de fuerza</label>
        <select id="pref-force-unit" class="swal2-input" style="width:140px;">
          <option value="kN">kN</option>
          <option value="N">N</option>
          <option value="tonf">tonf</option>
          <option value="kgf">kgf</option>
        </select>

        <label>Tolerancia del modelo</label>
        <input id="pref-model-tolerance" type="number" step="0.0001" class="swal2-input" value="${p.modelTolerance}">

        <label>Tolerancia Snap en pantalla</label>
        <input id="pref-snap-screen" type="number" step="1" class="swal2-input" value="${p.snapScreenTolerance}">

        <label>Tolerancia Snap en mundo</label>
        <input id="pref-snap-world" type="number" step="0.1" class="swal2-input" value="${p.snapWorldTolerance}">
      </div>
    `,
      showCancelButton: true,
      confirmButtonText: "Aplicar",
      cancelButtonText: "Cancelar",
      didOpen: () => {
        document.getElementById("pref-length-unit").value = p.lengthUnit;
        document.getElementById("pref-force-unit").value = p.forceUnit;
      },
      preConfirm: () => {
        return {
          lengthUnit: document.getElementById("pref-length-unit").value,
          forceUnit: document.getElementById("pref-force-unit").value,
          modelTolerance: Number(document.getElementById("pref-model-tolerance").value),
          snapScreenTolerance: Number(document.getElementById("pref-snap-screen").value),
          snapWorldTolerance: Number(document.getElementById("pref-snap-world").value),
        };
      },
    });

    if (!value) return;

    this.preferences = {
      ...this.preferences,
      ...value,
    };

    this.planGridSnapScreenTolerance = value.snapScreenTolerance;
    this.planGridSnapTolerance = value.snapWorldTolerance;

    localStorage.setItem("cad-preferences", JSON.stringify(this.preferences));

    this.showMessage?.("Dimensions / Tolerances actualizado");
    this.redraw?.();
  },

  applyDimensionsTolerances() {
    this.planGridSnapScreenTolerance =
      Number(this.preferences?.snapScreenTolerance ?? 14);

    this.planGridSnapTolerance =
      Number(this.preferences?.snapWorldTolerance ?? 1.0);
  },

  getModelTolerance() {
    return Number(this.preferences?.modelTolerance ?? 0.001);
  },

  async openOutputDecimalsDialog() {
    const d = this.outputDecimals;

    const { value } = await Swal.fire({
      title: "Output Decimals",
      width: 480,
      html: `
      <div style="display:grid; grid-template-columns: 1fr 120px; gap:10px; align-items:center; text-align:left; font-size:13px;">
        <label>Coordenadas</label>
        <input id="dec-coordinates" type="number" min="0" max="8" class="swal2-input" value="${d.coordinates}">

        <label>Longitudes</label>
        <input id="dec-lengths" type="number" min="0" max="8" class="swal2-input" value="${d.lengths}">

        <label>Fuerzas</label>
        <input id="dec-forces" type="number" min="0" max="8" class="swal2-input" value="${d.forces}">

        <label>Desplazamientos</label>
        <input id="dec-displacements" type="number" min="0" max="8" class="swal2-input" value="${d.displacements}">

        <label>Reacciones</label>
        <input id="dec-reactions" type="number" min="0" max="8" class="swal2-input" value="${d.reactions}">
      </div>
    `,
      showCancelButton: true,
      confirmButtonText: "Aplicar",
      cancelButtonText: "Cancelar",
      preConfirm: () => {
        return {
          coordinates: Number(document.getElementById("dec-coordinates").value),
          lengths: Number(document.getElementById("dec-lengths").value),
          forces: Number(document.getElementById("dec-forces").value),
          displacements: Number(document.getElementById("dec-displacements").value),
          reactions: Number(document.getElementById("dec-reactions").value),
        };
      },
    });

    if (!value) return;

    this.outputDecimals = {
      ...this.outputDecimals,
      ...value,
    };

    localStorage.setItem("cad-output-decimals", JSON.stringify(this.outputDecimals));

    this.showMessage?.("Output Decimals actualizado");
    this.redraw?.();
  },

  async openSteelFrameDesignDialog() {
    const s = this.steelFrameDesign;

    const result = await Swal.fire({
      title: "Steel Frame Design",
      width: 620,
      html: `
      <div style="display:grid; grid-template-columns: 1fr 180px; gap:10px; align-items:center; text-align:left; font-size:13px;">

        <label>Norma de diseño</label>
        <select id="steel-code" class="swal2-input" style="width:170px;">
          <option value="AISC 360-16">AISC 360-16</option>
          <option value="AISC 360-10">AISC 360-10</option>
          <option value="RNE E.090">RNE E.090</option>
        </select>

        <label>Método de diseño</label>
        <select id="steel-method" class="swal2-input" style="width:170px;">
          <option value="LRFD">LRFD</option>
          <option value="ASD">ASD</option>
        </select>

        <label>ϕ Flexión</label>
        <input id="steel-phi-bending" type="number" step="0.01" min="0" max="1"
          class="swal2-input" value="${s.phiBending}">

        <label>ϕ Compresión</label>
        <input id="steel-phi-compression" type="number" step="0.01" min="0" max="1"
          class="swal2-input" value="${s.phiCompression}">

        <label>ϕ Corte</label>
        <input id="steel-phi-shear" type="number" step="0.01" min="0" max="1"
          class="swal2-input" value="${s.phiShear}">

        <label>Límite deflexión carga viva L/</label>
        <input id="steel-deflection-live" type="number" step="1" min="1"
          class="swal2-input" value="${s.deflectionLimitLive}">

        <label>Límite deflexión total L/</label>
        <input id="steel-deflection-total" type="number" step="1" min="1"
          class="swal2-input" value="${s.deflectionLimitTotal}">

        <label>Verificar deflexión</label>
        <input id="steel-check-deflection" type="checkbox" ${s.checkDeflection ? "checked" : ""}>

        <label>Verificar esbeltez</label>
        <input id="steel-check-slenderness" type="checkbox" ${s.checkSlenderness ? "checked" : ""}>

        <label>Verificar compacidad</label>
        <input id="steel-check-compactness" type="checkbox" ${s.checkCompactness ? "checked" : ""}>
      </div>

      <p style="margin-top:12px; font-size:12px; color:#666; text-align:left;">
        Nota: esta configuración guarda los criterios base. El diseño automático de acero se conectará después al motor de análisis.
      </p>
    `,
      showCancelButton: true,
      showDenyButton: true,
      confirmButtonText: "Guardar",
      denyButtonText: "Restaurar",
      cancelButtonText: "Cancelar",
      didOpen: () => {
        document.getElementById("steel-code").value = s.code;
        document.getElementById("steel-method").value = s.designMethod;
      },
      preConfirm: () => {
        return {
          code: document.getElementById("steel-code").value,
          designMethod: document.getElementById("steel-method").value,

          phiBending: Number(document.getElementById("steel-phi-bending").value),
          phiCompression: Number(document.getElementById("steel-phi-compression").value),
          phiShear: Number(document.getElementById("steel-phi-shear").value),

          deflectionLimitLive: Number(document.getElementById("steel-deflection-live").value),
          deflectionLimitTotal: Number(document.getElementById("steel-deflection-total").value),

          checkDeflection: document.getElementById("steel-check-deflection").checked,
          checkSlenderness: document.getElementById("steel-check-slenderness").checked,
          checkCompactness: document.getElementById("steel-check-compactness").checked,
        };
      },
    });

    if (result.isConfirmed && result.value) {
      this.steelFrameDesign = {
        ...this.steelFrameDesign,
        ...result.value,
      };

      localStorage.setItem(
        "cad-steel-frame-design",
        JSON.stringify(this.steelFrameDesign)
      );

      this.showMessage?.(
        `Steel Frame Design: ${this.steelFrameDesign.code} - ${this.steelFrameDesign.designMethod}`
      );

      return;
    }

    if (result.isDenied) {
      this.resetSteelFrameDesign();
    }
  },

  resetSteelFrameDesign() {
    this.steelFrameDesign = {
      code: "AISC 360-16",
      designMethod: "LRFD",

      checkDeflection: true,
      checkSlenderness: true,
      checkCompactness: true,

      phiBending: 0.90,
      phiCompression: 0.90,
      phiShear: 0.90,

      deflectionLimitLive: 360,
      deflectionLimitTotal: 240,
    };

    localStorage.setItem(
      "cad-steel-frame-design",
      JSON.stringify(this.steelFrameDesign)
    );

    this.showMessage?.("Steel Frame Design restaurado");
  },

  async openReinforcementBarSizesDialog() {
    const rows = this.reinforcementBarSizes
      .map((bar, index) => {
        return `
        <tr>
          <td style="border:1px solid #666; padding:6px; text-align:center;">
            <input id="bar-enabled-${index}" type="checkbox" ${bar.enabled ? "checked" : ""}>
          </td>

          <td style="border:1px solid #666; padding:6px;">
            <input id="bar-name-${index}" value="${bar.name}" style="width:70px; padding:4px;">
          </td>

          <td style="border:1px solid #666; padding:6px;">
            <input id="bar-diameter-${index}" type="number" step="0.1" value="${bar.diameterMm}" style="width:90px; padding:4px;">
          </td>

          <td style="border:1px solid #666; padding:6px;">
            <input id="bar-area-${index}" type="number" step="1" value="${bar.areaMm2}" style="width:90px; padding:4px;">
          </td>
        </tr>
      `;
      })
      .join("");

    const result = await Swal.fire({
      title: "Reinforcement Bar Sizes",
      width: 650,
      html: `
      <div style="text-align:left; font-size:13px;">
        <p style="margin-bottom:10px;">
          Configura las barras de refuerzo disponibles para futuros diseños de concreto armado.
        </p>

        <table style="width:100%; border-collapse:collapse; font-size:12px;">
          <thead>
            <tr style="background:#1f2937; color:white;">
              <th style="border:1px solid #666; padding:6px;">Usar</th>
              <th style="border:1px solid #666; padding:6px;">Barra</th>
              <th style="border:1px solid #666; padding:6px;">Diámetro (mm)</th>
              <th style="border:1px solid #666; padding:6px;">Área (mm²)</th>
            </tr>
          </thead>

          <tbody>
            ${rows}
          </tbody>
        </table>

        <p style="margin-top:10px; font-size:12px; color:#666;">
          Nota: esta configuración solo guarda el catálogo. El diseño automático de concreto se conectará después.
        </p>
      </div>
    `,
      showCancelButton: true,
      showDenyButton: true,
      confirmButtonText: "Guardar",
      denyButtonText: "Restaurar",
      cancelButtonText: "Cancelar",
      preConfirm: () => {
        return this.reinforcementBarSizes.map((bar, index) => ({
          name: document.getElementById(`bar-name-${index}`).value,
          diameterMm: Number(document.getElementById(`bar-diameter-${index}`).value),
          areaMm2: Number(document.getElementById(`bar-area-${index}`).value),
          enabled: document.getElementById(`bar-enabled-${index}`).checked,
        }));
      },
    });

    if (result.isConfirmed && result.value) {
      this.reinforcementBarSizes = result.value;

      localStorage.setItem(
        "cad-reinforcement-bar-sizes",
        JSON.stringify(this.reinforcementBarSizes)
      );

      const enabledCount = this.reinforcementBarSizes.filter((bar) => bar.enabled).length;

      this.showMessage?.(`Barras de refuerzo activas: ${enabledCount}`);
      return;
    }

    if (result.isDenied) {
      this.resetReinforcementBarSizes();
    }
  },

  resetReinforcementBarSizes() {
    this.reinforcementBarSizes = [
      { name: "#3", diameterMm: 9.5, areaMm2: 71, enabled: true },
      { name: "#4", diameterMm: 12.7, areaMm2: 129, enabled: true },
      { name: "#5", diameterMm: 15.9, areaMm2: 199, enabled: true },
      { name: "#6", diameterMm: 19.1, areaMm2: 284, enabled: true },
      { name: "#8", diameterMm: 25.4, areaMm2: 510, enabled: true },
    ];

    localStorage.setItem(
      "cad-reinforcement-bar-sizes",
      JSON.stringify(this.reinforcementBarSizes)
    );

    this.showMessage?.("Reinforcement Bar Sizes restaurado");
  },

  setDisplayColors(colors) {
    this.displayColors = {
      ...this.displayColors,
      ...colors,
    };

    this.canvas2dBackground = this.displayColors.background2d;

    const panel2D = document.getElementById("cad-panel-2d");

    if (panel2D) {
      panel2D.style.backgroundColor = this.displayColors.background2d;
    }

    if (this.canvas) {
      this.canvas.style.backgroundColor = this.displayColors.background2d;
    }

    localStorage.setItem(
      "cad-display-colors",
      JSON.stringify(this.displayColors)
    );

    this.showMessage?.("Colores de visualización actualizados");

    this.redraw?.();
    this.sync3D?.();
  },

  resetDisplayColors() {
    const defaults =
      this.activeCanvasTheme === "light"
        ? {
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
        }
        : {
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
        };

    this.setDisplayColors(defaults);
  },

  formatOutput(value, type = "coordinates") {
    const decimals = this.outputDecimals?.[type] ?? 2;
    const number = Number(value);

    if (Number.isNaN(number)) {
      return "0";
    }

    return number.toFixed(decimals);
  },

  formatCoordinates(x = 0, y = 0, z = 0) {
    return `X ${this.formatOutput(x, "coordinates")}  Y ${this.formatOutput(y, "coordinates")}  Z ${this.formatOutput(z, "coordinates")}`;
  },

  // =====================================================
  // SYSTEM > TECLAS GENERALES DEL CAD
  // Maneja atajos globales y limpia selección con Escape.
  // =====================================================
  handleKeyDown(event) {

    // =====================================================
    // DRAW 3D > ESC CANCELA DIBUJO DE BARRA 3D
    // Si el usuario está dibujando una barra en 3D,
    // Escape cancela el modo y limpia el punto inicial.
    // =====================================================
    if (event.key === "Escape" && this.isDrawingFrame3D === true) {
      this.cancelFrame3DDrawingMode?.();

      this.redraw?.();
      this.sync3D?.();

      event.preventDefault();
      event.stopPropagation();
      return;
    }

    // =====================================================
    // DRAW FRAME > ESC CANCELA HERRAMIENTA DE BARRA
    // Si está activa la herramienta de dibujo de barras,
    // Escape la cancela antes de limpiar selecciones.
    // =====================================================
    if (event.key === "Escape" && this.activeDrawTool === "frame") {
      this.cancelFrameDrawingMode?.();

      event.preventDefault();
      event.stopPropagation();
      return;
    }

    // =====================================================
    // SELECTION > ESC GLOBAL PARA LIMPIAR SELECCIÓN
    // Limpia nodos, barras normales, barras 3D-only y estados internos.
    // =====================================================
    if (event.key === "Escape") {
      const hasSelectedFrames = this.shapes?.some((frame) =>
        frame.selected === true ||
        frame.isSelected === true ||
        frame.highlighted3D === true
      );

      const hasSelectedNodes = this.nodes?.some((node) =>
        node.selected === true ||
        node.isSelected === true
      );

      const hasSelectedObjects =
        hasSelectedFrames ||
        hasSelectedNodes ||
        this.selectedBeams?.length > 0 ||
        this.selectedObjects?.length > 0 ||
        this.selectedBeamsState?.selectedObjects?.length > 0 ||
        this.selectedBeamsState?.selectedBeams?.length > 0 ||
        this.currentState?.selectedObjects?.length > 0 ||
        this.currentState?.selectedBeams?.length > 0 ||
        this.selectedNodesState?.selectedObjects?.length > 0;

      if (hasSelectedObjects) {
        console.log("🧹 Escape detectado: limpiando selección global");

        this.clearAllSelections?.();

        // Limpieza extra por seguridad
        this.shapes?.forEach((frame) => {
          frame.selected = false;
          frame.isSelected = false;
          frame.highlighted3D = false;
        });

        this.selectedBeams = [];
        this.selectedObjects = [];

        if (this.selectedBeamsState) {
          this.selectedBeamsState.selectedObjects = [];
          this.selectedBeamsState.selectedBeams = [];
        }

        if (this.currentState) {
          this.currentState.selectedObjects = [];
          this.currentState.selectedBeams = [];
        }

        this.setState?.(this.idleState);

        this.redraw?.();
        this.sync3D?.();

        requestAnimationFrame(() => {
          this.sync3D?.();
        });

        event.preventDefault();
        event.stopPropagation();
        return;
      }
    }

    const key = String(event.key || "").toLowerCase();

    if (event.ctrlKey && key === "z") {
      event.preventDefault();
      this.undo?.();
      return;
    }

    if (event.ctrlKey && key === "y") {
      event.preventDefault();
      this.redo?.();
      return;
    }

    if (event.ctrlKey && key === "x") {
      event.preventDefault();
      this.cut?.();
      return;
    }

    if (event.ctrlKey && key === "c") {
      event.preventDefault();
      this.copy?.();
      return;
    }

    if (event.ctrlKey && key === "v") {
      event.preventDefault();
      this.paste?.();
      return;
    }

    if (event.key === "Delete") {
      event.preventDefault();
      this.deleteSelected?.();
      return;
    }

    this.currentState?.handleKeyDown?.(event, this);
  },

  handleMouseWheel(event) {
    this.currentState.handleMouseWheel(event, this, mousePositionFrom(this.canvas, event));
  },

  handleMouseClick(event) {
    this.currentState.handleMouseClick(event, this, mousePositionFrom(this.canvas, event));
  },

  handleMouseDown(event) {
    // =====================================================
    // VIEWPORT > CLIC EN CANVAS 2D
    // Marca el canvas 2D como área activa.
    // =====================================================
    this.mark2DViewportActive?.("2d mouse down");

    // =====================================================
    // DRAW FRAME > DIBUJAR EN 2D SI LA HERRAMIENTA ESTÁ ACTIVA
    // Cuando el usuario hace clic en el canvas 2D con Draw Frame activo,
    // se usa el estado normal de dibujo 2D.
    // =====================================================
    if (this.activeDrawTool === "frame") {
      this.activeViewport = "2d";

      // Si el usuario venía del modo 3D, limpiamos ese proceso temporal.
      this.isDrawingFrame3D = false;
      this.frame3DStartNode = null;
      this.frame3DEndNode = null;

      const frame2DState =
        this.trussDrawingState ||
        this.beamDrawingState ||
        this.lineDrawingState;

      if (
        frame2DState &&
        this.currentState !== frame2DState &&
        this.currentState?.constructor?.name !== frame2DState?.constructor?.name
      ) {
        this.setState?.(frame2DState);

        console.log("✏️ Draw Frame usando canvas 2D:", {
          activeDrawTool: this.activeDrawTool,
          activeViewport: this.activeViewport,
          state: frame2DState?.constructor?.name,
        });
      }
    }

    const mouse = mousePositionFrom(this.canvas, event);

    // =====================================================
    // SELECTION GLOBAL > CTRL + CLIC PARA BARRAS
    // Funciona aunque el estado actual ya no sea IdleState.
    // Permite seleccionar 1, 2, 3, 4 o más barras.
    // =====================================================
    if (event.ctrlKey === true && this.activeDrawTool !== "frame") {
      const beam = this.closestBeamAtActiveView?.(mouse);

      if (beam) {
        event.preventDefault();
        event.stopPropagation();

        this.toggleFrameSelection?.(beam);

        console.log("🟨 Ctrl + clic global sobre barra:", {
          id: beam.id,
          seleccionadas: this.getCurrentlySelectedFrames?.().map((f) => f.id),
        });

        return;
      }
    }

    this.currentState?.handleMouseDown?.(event, this, mouse);
  },

  handleMouseUp(event) {
    this.currentState.handleMouseUp(event, this, mousePositionFrom(this.canvas, event));
  },

  handleMouseMove(event) {
    // =====================================================
    // VIEWPORT > CANVAS 2D ACTIVO
    // Cada movimiento sobre el canvas 2D marca la vista activa.
    // =====================================================
    this.mark2DViewportActive?.("2d mouse move");

    const screen = mousePositionFrom(this.canvas, event);
    const rawWorld = this.grid.screenToWorld(screen);

    const view = this.viewSet?.[this.activeViewIndex];

    // Guardamos primero el punto crudo del mouse en coordenadas del plano 2D activo
    this.mousePos = {
      x: Number(rawWorld.x || 0),
      y: Number(rawWorld.y || 0),
    };

    if (this.snap_enabled) {
      if (this.currentViewMode === "plan") {
        this.updatePlanGridSnap(this.mousePos, screen);
      } else if (
        this.currentViewMode === "elevationX" ||
        this.currentViewMode === "elevationY"
      ) {
        this.updateElevationGridSnap(this.mousePos, screen);
      } else {
        this.activeGridPoint = null;
      }

      // Si hay snap activo, actualizamos mousePos para que el preview visual
      // también caiga exactamente sobre el punto de grilla.
      if (this.activeGridPoint) {
        if (!view || view.type === "plan") {
          this.mousePos = {
            x: Number(this.activeGridPoint.x || 0),
            y: Number(this.activeGridPoint.y || 0),
          };
        } else if (view.type === "elevation" && view.axis === "Y") {
          // Elevación Y: plano X-Z
          this.mousePos = {
            x: Number(this.activeGridPoint.x || 0),
            y: Number(this.activeGridPoint.z || 0),
          };
        } else if (view.type === "elevation" && view.axis === "X") {
          // Elevación X: plano Y-Z
          this.mousePos = {
            x: Number(this.activeGridPoint.y || 0),
            y: Number(this.activeGridPoint.z || 0),
          };
        }
      }
    } else {
      this.activeGridPoint = null;
    }

    this.currentState.handleMouseMove(event, this, screen);
  },

  handleMouseLeave(event) {
    this.currentState.handleMouseLeave(event, this, mousePositionFrom(this.canvas, event));
  },

  // =====================================================
  // SYSTEM > CAMBIAR ESTADO DE HERRAMIENTA
  // Controla el cambio entre selección, dibujo, edición, etc.
  // También protege modos especiales como Frame 3D entre vistas.
  // =====================================================
  setState(state, args) {
    // Sirve para encontrar qué función rompe CrossViewFrameDrawingState.
    if (
      this.currentState?.constructor?.name === "CrossViewFrameDrawingState" &&
      state?.constructor?.name === "TrussDrawingState"
    ) {
      console.trace("⚠️ CrossViewFrameDrawingState está siendo cambiado a TrussDrawingState");
    }
    if (!state) {
      console.warn("setState cancelado: estado inválido", state);
      return;
    }

    const fromState = this.currentState?.constructor?.name || "none";
    const toState = state?.constructor?.name || "none";

    // =====================================================
    // DRAW > PROTEGER FRAME 3D ENTRE VISTAS
    // Si ya se guardó el primer punto, no permitimos que
    // el sistema vuelva accidentalmente a TrussDrawingState.
    // =====================================================
    const crossViewDrawingInProgress =
      this.currentState?.preserveOnViewChange === true &&
      this.currentState?.startPoint;

    if (
      crossViewDrawingInProgress &&
      toState === "TrussDrawingState"
    ) {
      console.warn("⛔ Cambio bloqueado: CrossViewFrameDrawingState no debe volver a TrussDrawingState durante el dibujo.", {
        fromState,
        toState,
        startPoint: this.currentState.startPoint,
      });

      return;
    }

    console.log("🔁 Cambio de estado:", {
      fromState,
      toState,
      args,
    });

    if (this.currentState?.exit) {
      this.currentState.exit();
    }

    this.prevState = this.currentState;
    this.currentState = state;

    if (this.currentState?.enter) {
      this.currentState.enter(args);
    }

    this.setCursor("default");

    if (this.show3DView) {
      this.sync3D();
    }
  },

  setCursor(cursor) {
    this.canvas.style.cursor = cursor;
  },

  closestPoint(searchPoint) {
    // Returns null if there are 0 points in the shape
    var shortestDistance = 5;
    for (let index = 0; index < this.shapes.length; index++) {
      const collided = this.shapes[index].points.find((p, index, points) => {
        const distance = pointDistance(searchPoint, this.grid.worldToScreen(p));
        return distance <= shortestDistance;
      });
      if (collided) {
        return collided;
      }
    }
  },

  closestNode(searchPoint) {
    // Returns null if there are 0 points in the shape
    const shortestDistance = 10;
    for (let index = 0; index < this.nodes.length; index++) {
      const distance = pointDistance(searchPoint, this.grid.worldToScreen(this.nodes[index].position));
      if (distance <= shortestDistance) {
        return this.nodes[index];
      }
    }
  },

  closestParametric(searchPoint) {
    let collidedParametric = false;
    return this.parametricModels.find((p) => {
      p.nodes.find((n) => {
        const shortestDistance = 10;
        const distance = pointDistance(searchPoint, this.grid.worldToScreen(n.position));
        if (distance <= shortestDistance) {
          collidedParametric = true;
        }
        return collidedParametric;
      });
      p.shapes.find((s) => {
        const shortestDistance = 5;
        const lineLength = pointDistance(
          this.grid.worldToScreen(s.node1.position),
          this.grid.worldToScreen(s.node2.position),
        );
        const d1 = pointDistance(this.grid.worldToScreen(s.node1.position), searchPoint);
        const d2 = pointDistance(this.grid.worldToScreen(s.node2.position), searchPoint);
        if (d1 + d2 >= lineLength - shortestDistance && d1 + d2 <= lineLength + shortestDistance) {
          collidedParametric = true;
        }
        return collidedParametric;
      });
      return collidedParametric;
    });
  },

  closestLine(searchPoint) {
    var shortestDistance = 9;
    return this.shapes.find((s) => {
      for (let index = 0; index < s.points.length; index++) {
        const lineLength = pointDistance(
          this.grid.worldToScreen(s.points[index % s.points.length]),
          this.grid.worldToScreen(s.points[(index + 1) % s.points.length]),
        );
        const d1 = pointDistance(this.grid.worldToScreen(s.points[index % s.points.length]), searchPoint);
        const d2 = pointDistance(this.grid.worldToScreen(s.points[(index + 1) % s.points.length]), searchPoint);
        if (d1 + d2 >= lineLength - shortestDistance && d1 + d2 <= lineLength + shortestDistance) {
          return true;
        }
      }
    });
  },

  redraw() {
    this.currentRenderer.render(this);

    if (this.currentState?.draw) {
      this.currentState.draw(this.currentRenderer, this);
    }

    if (window.babylonInitialized && window.babylonScene) {
      if (this._syncTimeout) clearTimeout(this._syncTimeout);
      this._syncTimeout = setTimeout(() => {
        this.drawIn3D();
      }, 50);
    }
  },

  windowResize() {
    // Set actual size in memory (scaled to account for extra pixel density).
    const scale = window.devicePixelRatio; // Change to 1 on retina screens to see blurry canvas.
    this.canvas.width = parseFloat(getComputedStyle(this.canvas).width) * scale;
    this.canvas.height = parseFloat(getComputedStyle(this.canvas).height) * scale;
    this.grid.resize(this.canvas);
    this.fitContentToScreen();
  },

  addToScene(parametricModel) {
    this.nodes = this.nodes.concat(parametricModel.nodes);
    this.shapes = this.shapes.concat(parametricModel.shapes);
    removeFromArray(this.parametricModels, parametricModel);
    this.nodes.forEach((node, index) => {
      node.id = index + 1;
    });
    this.shapes.forEach((beam, index) => {
      beam.id = index + 1;
    });
    this.setState(this.idleState);
    this.sync3D(); // ← AÑADIR
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

        this.showMessage?.(
          "❌ Error al cargar el archivo. Verifica que sea un JSON válido.",
          "error"
        );
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
          frameSections.find((item) =>
            String(item.id) === String(sectionName) ||
            String(item.name) === String(sectionName)
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
        frameSections.find((item) =>
          String(item.id) === String(sectionName) ||
          String(item.name) === String(sectionName)
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
      sortedStories.length > 1
        ? Number(sortedStories[1].elevation || 0) - Number(sortedStories[0].elevation || 0)
        : 3;

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

      this.showMessage?.(
        `📥 Importación .e2k inicial/no oficial completada: ${selected.file.name}`
      );

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

      this.showMessage?.(
        "❌ Error al importar .e2k inicial/no oficial.",
        "error"
      );
    }
  },

  showImportPending(formatName) {
    this.showMessage?.(`📥 Importar ${formatName} - pendiente. Por ahora está estable JSON interno y .e2k inicial/no oficial.`);
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

    return String(rawName)
      .replace(/\.[^/.]+$/, "")
      .replace(/[^\w\-]+/g, "_")
      .replace(/^_+|_+$/g, "") || defaultName;
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
    const frameSections =
      definitions.frameSections ||
      data.frameSections ||
      this.frameSections?.sections ||
      [];

    const materials =
      definitions.materials ||
      data.materials ||
      this.materialProperties?.materials ||
      [];

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
        `ELEV ${this.formatE2KNumber(story.elevation)}`
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
        `BUBBLE "${grid.bubbleLoc || "End"}"`
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
        `BUBBLE "${grid.bubbleLoc || "Start"}"`
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
        `VISIBLE ${grid.visible !== false ? "YES" : "NO"}`
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
        `E ${this.formatE2KNumber(material.E || material.modulusElasticity || 0)}`
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
        `A ${this.formatE2KNumber(section.A || section.area || 0)}`
      );
    });
    lines.push("");

    lines.push("$ POINT COORDINATES");
    nodes.forEach((node) => {
      lines.push(
        `POINT "${node.id}" ` +
        `X ${this.formatE2KNumber(node.x ?? node.position?.x)} ` +
        `Y ${this.formatE2KNumber(node.y ?? node.position?.y)} ` +
        `Z ${this.formatE2KNumber(node.z ?? node.position?.z)}`
      );
    });
    lines.push("");

    lines.push("$ FRAME CONNECTIVITY");
    frames.forEach((frame) => {
      const sectionName =
        frame.sectionName ||
        frame.sectionId ||
        frame.frameSection?.name ||
        frame.section?.name ||
        "NONE";

      lines.push(
        `FRAME "${frame.id}" ` +
        `I "${frame.node1Id ?? frame.node1}" ` +
        `J "${frame.node2Id ?? frame.node2}" ` +
        `TYPE "${frame.elementType || frame.type || "beam"}" ` +
        `SECTION "${sectionName}"`
      );
    });
    lines.push("");

    lines.push("$ AREA OBJECTS");
    areas.forEach((area) => {
      const points = Array.isArray(area.points)
        ? area.points
          .map((point, index) =>
            `P${index + 1}(${this.formatE2KNumber(point.x)},${this.formatE2KNumber(point.y)},${this.formatE2KNumber(point.z)})`
          )
          .join(" ")
        : "";

      lines.push(
        `AREA "${area.id}" ` +
        `TYPE "${area.areaType || area.type || "area"}" ` +
        points
      );
    });
    lines.push("");

    lines.push("$ ASSIGNMENTS - FRAME SECTIONS");
    frames.forEach((frame) => {
      if (!frame.sectionId && !frame.sectionName) return;

      lines.push(
        `ASSIGN FRAME "${frame.id}" ` +
        `SECTION "${frame.sectionName || frame.sectionId}"`
      );
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
          `DATA ${JSON.stringify(load)}`
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
          `DATA ${JSON.stringify(load)}`
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
    const canvas2D =
      this.canvas ||
      document.querySelector("#cad-panel-2d canvas") ||
      document.querySelector("canvas");

    const canvas3D =
      document.querySelector("#viewer3d-container canvas");

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

      diaphragmId: node.diaphragmId || node.diaphragm?.id || null,
      diaphragmName: node.diaphragmName || node.diaphragm?.name || null,
      diaphragm: clean(node.diaphragm),
      hasDiaphragm: node.hasDiaphragm === true,

      pointSprings: clean(node.pointSprings),
      springs: clean(node.springs),
      hasPointSprings: node.hasPointSprings === true,

      pointLoads: clean(node.pointLoads, []),
      jointLoads: clean(node.jointLoads, []),
      hasPointLoads: node.hasPointLoads === true,
      hasJointLoads: node.hasJointLoads === true,

      groupIds: clean(node.groupIds, []),
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
      },

      definitions: {
        materials: clean(this.materialProperties?.materials, []),
        materiales: clean(this.materiales, []),

        frameSections: clean(
          this.frameSections?.sections ||
          this.frameSections?.items ||
          [],
          []
        ),

        sections: clean(this.sections, {}),

        loadCases: clean(
          this.loadCases?.cases ||
          this.staticLoadCases?.items ||
          [],
          []
        ),

        loadCombinations: clean(
          this.loadCombinations?.combinations ||
          this.loadCombinations?.items ||
          [],
          []
        ),

        diaphragms: clean(this.diaphragms?.items, []),
        groups: clean(this.groups?.items, []),
        sectionCuts: clean(this.sectionCuts?.items, []),

        responseSpectrumFunctions: clean(this.responseSpectrumFunctions?.items, []),
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
      },

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
    };

    console.log("💾 Export JSON completo:", {
      nodes: modelData.model.nodes.length,
      frames: modelData.model.frames.length,
      areas: modelData.model.areas.length,
      stories: modelData.model.stories.length,
      xGrids: modelData.model.referenceGrid?.xGrids?.length || 0,
      yGrids: modelData.model.referenceGrid?.yGrids?.length || 0,
    });

    return modelData;
  },

  importFromJSON(jsonData) {
    try {
      const data =
        typeof jsonData === "string"
          ? JSON.parse(jsonData)
          : jsonData;

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

      const importedNodes =
        model.nodes ||
        data.nodes ||
        [];

      const importedFrames =
        model.frames ||
        model.beams ||
        model.shapes ||
        data.frames ||
        data.beams ||
        data.shapes ||
        [];

      const importedAreas =
        model.areas ||
        data.areas ||
        [];

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
      const importedReferenceGrid =
        model.referenceGrid ||
        data.referenceGrid ||
        null;

      if (importedReferenceGrid) {
        const importedCustomGeneralGrids =
          Array.isArray(importedReferenceGrid.generalGrids)
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
          z
        );

        newNode.id = id;
        newNode.position.x = x;
        newNode.position.y = y;
        newNode.position.z = z;

        newNode.beams = [];
        newNode.visible = nodeData.visible !== false;

        const importedRestraints =
          nodeData.restraints ||
          nodeData.constraints ||
          null;

        if (importedRestraints) {
          newNode.restraints = cleanClone(importedRestraints);
          newNode.constraints = cleanClone(importedRestraints);
          newNode.hasRestraints =
            nodeData.hasRestraints ?? this.jointHasAnyRestraint?.(importedRestraints) ?? true;
        }

        const importedDiaphragm =
          nodeData.diaphragm ||
          (
            nodeData.diaphragmId
              ? {
                id: nodeData.diaphragmId,
                name: nodeData.diaphragmName || nodeData.diaphragmId,
                type: "rigid",
              }
              : null
          );

        if (importedDiaphragm) {
          newNode.diaphragm = cleanClone(importedDiaphragm);
          newNode.diaphragmId = importedDiaphragm.id || nodeData.diaphragmId || null;
          newNode.diaphragmName = importedDiaphragm.name || nodeData.diaphragmName || null;
          newNode.hasDiaphragm = nodeData.hasDiaphragm ?? true;
        }

        const importedPointSprings =
          nodeData.pointSprings ||
          nodeData.springs ||
          null;

        if (importedPointSprings) {
          newNode.pointSprings = cleanClone(importedPointSprings);
          newNode.springs = cleanClone(importedPointSprings);
          newNode.hasPointSprings =
            nodeData.hasPointSprings ?? this.jointHasPointSprings?.(importedPointSprings) ?? true;
        }

        const importedPointLoads =
          nodeData.pointLoads ||
          nodeData.jointLoads ||
          [];

        newNode.pointLoads = cleanClone(importedPointLoads, []);
        newNode.jointLoads = cleanClone(importedPointLoads, []);
        newNode.hasPointLoads =
          nodeData.hasPointLoads ?? newNode.pointLoads.length > 0;
        newNode.hasJointLoads =
          nodeData.hasJointLoads ?? newNode.jointLoads.length > 0;

        newNode.groupIds = cleanClone(nodeData.groupIds, []);
        newNode.groupNames = cleanClone(nodeData.groupNames, []);
        newNode.groups = cleanClone(nodeData.groups, []);

        if (!newNode.groupIds.length && newNode.groups.length) {
          newNode.groupIds = newNode.groups.map((group) => group.id || group.name);
        }

        if (!newNode.groupNames.length && newNode.groups.length) {
          newNode.groupNames = newNode.groups.map((group) => group.name || group.id);
        }

        newNode.hasGroups =
          nodeData.hasGroups ?? newNode.groupIds.length > 0;

        newNode.assignment = cleanClone(nodeData.assignment, {});

        newNode.force = cleanClone(
          nodeData.force,
          this.getDefaultNodeForceForImport()
        );

        if (!newNode.force || !newNode.force.loads) {
          newNode.force = this.getDefaultNodeForceForImport();
        }

        newNode.reaction = cleanClone(
          nodeData.reaction,
          {
            x: 0,
            y: 0,
            z: 0,
          }
        );

        nodeMap.set(String(id), newNode);

        return newNode;
      });

      this.nextNodeId =
        Math.max(0, ...this.nodes.map((node) => Number(node.id || 0))) + 1;

      // ===============================
      // 6. Restaurar frames / beams
      // ===============================
      this.shapes = importedFrames
        .map((frameData, index) => {
          const node1Id =
            frameData.node1Id ??
            frameData.node1 ??
            frameData.iNode ??
            frameData.startNode;

          const node2Id =
            frameData.node2Id ??
            frameData.node2 ??
            frameData.jNode ??
            frameData.endNode;

          const node1 = nodeMap.get(String(node1Id));
          const node2 = nodeMap.get(String(node2Id));

          if (!node1 || !node2) {
            console.warn("Frame ignorado por nodos no encontrados:", frameData);
            return null;
          }

          const newFrame = new Beam(
            frameData.E ?? this.globalE,
            frameData._A ?? frameData.A ?? this.globalA
          );

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

          const importedSection =
            frameData.frameSection ||
            frameData.section ||
            null;

          if (importedSection) {
            newFrame.section = cleanClone(importedSection);
            newFrame.frameSection = cleanClone(importedSection);

            newFrame.sectionId =
              frameData.sectionId ||
              importedSection.id ||
              importedSection.name ||
              null;

            newFrame.sectionName =
              frameData.sectionName ||
              importedSection.name ||
              importedSection.id ||
              null;

            newFrame.A =
              frameData.A ??
              importedSection.A ??
              importedSection.area ??
              newFrame.A ??
              null;

            newFrame._A =
              frameData._A ??
              importedSection.A ??
              importedSection.area ??
              newFrame._A ??
              null;

            newFrame.hasAssignedSection =
              frameData.hasAssignedSection ?? true;
          } else {
            newFrame.sectionId = frameData.sectionId || null;
            newFrame.sectionName = frameData.sectionName || null;
            newFrame.hasAssignedSection =
              frameData.hasAssignedSection === true;
          }

          const importedReleases =
            frameData.releases ||
            frameData.frameReleases ||
            null;

          if (importedReleases) {
            newFrame.releases = cleanClone(importedReleases);
            newFrame.frameReleases = cleanClone(importedReleases);
            newFrame.hasFrameReleases =
              frameData.hasFrameReleases ?? this.frameHasAnyRelease?.(importedReleases) ?? true;
          }

          const importedEndOffsets =
            frameData.endOffsets ||
            frameData.frameEndOffsets ||
            null;

          if (importedEndOffsets) {
            newFrame.endOffsets = cleanClone(importedEndOffsets);
            newFrame.frameEndOffsets = cleanClone(importedEndOffsets);
            newFrame.hasEndOffsets =
              frameData.hasEndOffsets ?? this.frameHasEndOffsets?.(importedEndOffsets) ?? true;
          }

          const importedFrameLoads =
            frameData.frameLoads ||
            frameData.lineLoads ||
            [];

          newFrame.frameLoads = cleanClone(importedFrameLoads, []);
          newFrame.lineLoads = cleanClone(importedFrameLoads, []);
          newFrame.hasFrameLoads =
            frameData.hasFrameLoads ?? newFrame.frameLoads.length > 0;
          newFrame.hasLineLoads =
            frameData.hasLineLoads ?? newFrame.lineLoads.length > 0;

          newFrame.groupIds = cleanClone(frameData.groupIds, []);
          newFrame.groupNames = cleanClone(frameData.groupNames, []);
          newFrame.groups = cleanClone(frameData.groups, []);

          if (!newFrame.groupIds.length && newFrame.groups.length) {
            newFrame.groupIds = newFrame.groups.map((group) => group.id || group.name);
          }

          if (!newFrame.groupNames.length && newFrame.groups.length) {
            newFrame.groupNames = newFrame.groups.map((group) => group.name || group.id);
          }

          newFrame.hasGroups =
            frameData.hasGroups ?? newFrame.groupIds.length > 0;

          newFrame.assignment = cleanClone(frameData.assignment, {});

          newFrame.fAxial = Number(frameData.fAxial || 0);
          newFrame.axialForce = Number(frameData.axialForce || 0);

          newFrame.designType = frameData.designType || null;
          newFrame.isSteelJoist = frameData.isSteelJoist === true;

          newFrame.designOverwrites = cleanClone(frameData.designOverwrites, {});
          newFrame.designResults = cleanClone(frameData.designResults, {});

          newFrame.steelFrameDesignOverwrites =
            cleanClone(frameData.steelFrameDesignOverwrites);

          newFrame.steelFrameDesignResult =
            cleanClone(frameData.steelFrameDesignResult);

          newFrame.steelJoistDesignOverwrites =
            cleanClone(frameData.steelJoistDesignOverwrites);

          newFrame.steelJoistDesignResult =
            cleanClone(frameData.steelJoistDesignResult);

          if (!node1.beams) node1.beams = [];
          if (!node2.beams) node2.beams = [];

          node1.beams.push(newFrame);
          node2.beams.push(newFrame);

          return newFrame;
        })
        .filter(Boolean);

      this.nextBeamId =
        Math.max(0, ...this.shapes.map((frame) => Number(frame.id || 0))) + 1;

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

      this.materialProperties.materials =
        cleanClone(definitions.materials || data.materials, []);

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

      this.frameSections.sections =
        cleanClone(definitions.frameSections || data.frameSections, []);

      if (definitions.sections || data.sections) {
        this.sections = cleanClone(definitions.sections || data.sections, this.sections || {});
      }

      if (!this.loadCases) {
        this.loadCases = {
          open: false,
          cases: [],
        };
      }

      this.loadCases.cases =
        cleanClone(definitions.loadCases || data.loadCases, []);

      if (!this.loadCombinations) {
        this.loadCombinations = {};
      }

      const importedLoadCombinations =
        definitions.loadCombinations ||
        data.loadCombinations ||
        [];

      this.loadCombinations.combinations =
        cleanClone(importedLoadCombinations, []);

      this.loadCombinations.items =
        cleanClone(importedLoadCombinations, []);

      if (!this.diaphragms) {
        this.diaphragms = {
          items: [],
          selectedDiaphragm: null,
        };
      }

      this.diaphragms.items =
        cleanClone(definitions.diaphragms || data.diaphragms, []);

      if (!this.groups) {
        this.groups = {
          items: [],
          selectedGroup: null,
        };
      }

      this.groups.items =
        cleanClone(definitions.groups || data.groups, []);

      if (!this.sectionCuts) {
        this.sectionCuts = {
          items: [],
          selectedSectionCut: null,
        };
      }

      this.sectionCuts.items =
        cleanClone(definitions.sectionCuts || data.sectionCuts, []);

      if (this.responseSpectrumFunctions) {
        this.responseSpectrumFunctions.items =
          cleanClone(definitions.responseSpectrumFunctions, []);
      }

      if (this.timeHistoryFunctions) {
        this.timeHistoryFunctions.items =
          cleanClone(definitions.timeHistoryFunctions, []);
      }

      if (this.staticLoadCases) {
        this.staticLoadCases.items =
          cleanClone(definitions.staticLoadCases, []);
      }

      if (this.staticNonlinearCases) {
        this.staticNonlinearCases.items =
          cleanClone(definitions.staticNonlinearCases, []);
      }

      if (this.sequentialConstruction) {
        this.sequentialConstruction.items =
          cleanClone(definitions.sequentialConstruction, []);
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
        this.reinforcementBarSizes =
          cleanClone(options.reinforcementBarSizes, []);
      }

      if (options.dynamicParams || data.dynamicParams) {
        this.dynamicParams =
          cleanClone(options.dynamicParams || data.dynamicParams, {});
      }

      if (options.analysisOptions || data.analysisOptions) {
        this.analysisOptions =
          cleanClone(options.analysisOptions || data.analysisOptions);
      }

      if (options.availableLoads) {
        this.availableLoads =
          cleanClone(options.availableLoads, []);
      }

      if (options.canvasTheme && typeof this.setCanvasTheme === "function") {
        this.setCanvasTheme(options.canvasTheme);
      }

      // ===============================
      // 11. Restaurar resultados
      // ===============================
      this.K_Global_Reducido =
        cleanClone(results.K_Global_Reducido, []);

      this.Fuerzas_Globales_Reducidas =
        cleanClone(results.Fuerzas_Globales_Reducidas, []);

      this.D_Global_Reducido =
        cleanClone(results.D_Global_Reducido, []);

      this.deflecciones =
        cleanClone(results.deflecciones, []);

      this.desplazamientosPosition =
        cleanClone(results.desplazamientosPosition, []);

      this.matrizDesplazamiento =
        cleanClone(results.matrizDesplazamiento, []);

      this.analysisResults =
        cleanClone(results.analysisResults, null);

      this.modelCheck =
        cleanClone(results.modelCheck, null);

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
      if (
        this.grid?.centerToView &&
        this.referenceGrid?.xPositions?.length &&
        this.referenceGrid?.yPositions?.length
      ) {
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

  // ===============================================
  // ========== MÉTODOS PARA EL MENÚ EDIT ==========
  // ===============================================

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

      nextNodeId: this.nextNodeId ?? ((this.nodes?.length || 0) + 1),
      nextBeamId: this.nextBeamId ?? ((this.shapes?.length || 0) + 1),
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
        Number(p.z || 0)
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

      const frame = new Beam(
        frameData.E ?? this.globalE,
        frameData._A ?? this.globalA
      );

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
        this.activeViewIndex = Math.min(
          Number(snapshot.activeViewIndex || 0),
          this.viewSet.length - 1
        );
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
          this.currentElevationX =
            activeView.label ||
            activeView.name ||
            snapshot.currentElevationX ||
            "none";
        }

        if (activeView.axis === "Y") {
          this.currentElevationZ =
            activeView.label ||
            activeView.name ||
            snapshot.currentElevationZ ||
            "none";
        }
      }

      this.activeGridPoint = null;
    }

    this.reindexModelObjects?.();

    this.nextNodeId =
      snapshot.nextNodeId ??
      Math.max(...this.nodes.map((node) => Number(node.id || 0)), 0) + 1;

    this.nextBeamId =
      snapshot.nextBeamId ??
      Math.max(...this.shapes.map((frame) => Number(frame.id || 0)), 0) + 1;

    this.clearEditSelectionFlags?.();

    this.redraw?.();

    if (options.sync3D !== false) {
      this.sync3D?.();
    }

    this.rebuildGroupMemberships?.();
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
        const selectNew =
          document.getElementById("replicate-select-new")?.checked === true;

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
      `Nodos: ${summary.nodes}, Líneas: ${summary.frames}, Áreas: ${summary.areas}`
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
        Number(p.z || 0)
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

      const newFrame = new Beam(
        frameData.E ?? this.globalE,
        frameData._A ?? this.globalA
      );

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

      newFrame.steelFrameDesignResult =
        this.cloneEditPlainData(frameData.steelFrameDesignResult);

      newFrame.steelJoistDesignResult =
        this.cloneEditPlainData(frameData.steelJoistDesignResult);

      newFrame.steelFrameDesignOverwrites =
        this.cloneEditPlainData(frameData.steelFrameDesignOverwrites);

      newFrame.steelJoistDesignOverwrites =
        this.cloneEditPlainData(frameData.steelJoistDesignOverwrites);

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
        newArea.points = newArea.points.map((point) =>
          this.offsetEditPoint(point, offset)
        );
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
      total:
        pastedNodes.length +
        pastedFrames.length +
        pastedAreas.length +
        pastedDimensions.length,
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
    const selectedObjects = this.getEditSelectedObjects?.({
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

    if (
      moveSummary.nodes > 0 ||
      moveSummary.frames > 0 ||
      moveSummary.areas > 0
    ) {
      this.sync3D?.();
    }

    console.log("↔️ EDIT Move ejecutado:", {
      offset: result.value,
      summary: moveSummary,
    });

    this.showMessage?.(
      `↔️ Movido: ${moveSummary.total} objeto(s). ` +
      `Nodos: ${moveSummary.nodes}, Líneas: ${moveSummary.frames}, Áreas: ${moveSummary.areas}`
    );
  },

  moveSelectedObjectsByOffset(offset = {}) {
    const selectedObjects = this.getEditSelectedObjects?.({
      respectActiveView: true,
    }) || [];

    const selectedNodes = selectedObjects.filter((obj) =>
      this.isEditNodeObject(obj)
    );

    const selectedFrames = selectedObjects.filter((obj) =>
      this.isEditFrameObject(obj)
    );

    const selectedAreas = selectedObjects.filter((obj) =>
      this.isEditAreaObject(obj)
    );

    const selectedDimensions = selectedObjects.filter((obj) =>
      this.isEditDimensionLineObject(obj)
    );

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
          })
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
      total:
        nodesToMove.size +
        selectedFrames.length +
        selectedAreas.length +
        selectedDimensions.length,
      objects: movedObjects,
    };
  },

  // =========================================
  // ========== EDIT: MERGE POINTS ===========
  // =========================================

  async openMergePointsDialog() {
    const selectedNodes = this.getEditSelectedNodes?.({
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
        const removeDuplicates =
          document.getElementById("merge-remove-duplicates")?.checked === true;
        const selectResult =
          document.getElementById("merge-select-result")?.checked === true;

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
      this.showMessage?.(
        "🔗 Merge Points: no se encontraron puntos para unir con esa tolerancia.",
        "warning"
      );
      return;
    }

    this.showMessage?.(
      `🔗 Merge Points: ${summary.mergedNodes} nodo(s) unido(s), ` +
      `${summary.finalNodes} nodo(s) resultante(s), ` +
      `${summary.removedFrames} línea(s) duplicada(s) removida(s).`
    );
  },

  getMergeCandidateNodes(scope = "selected") {
    if (scope === "selected") {
      return this.getEditSelectedNodes?.({
        respectActiveView: true,
      }) || [];
    }

    if (scope === "active-view") {
      return (this.nodes || []).filter((node) => {
        return this.isEditNodeObject(node) &&
          this.isEditObjectVisibleInActiveView(node);
      });
    }

    if (scope === "all") {
      return (this.nodes || []).filter((node) =>
        this.isEditNodeObject(node)
      );
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
      const connectedFrames = Array.isArray(oldNode.beams)
        ? [...oldNode.beams]
        : [];

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
    const selectedObjects = this.getEditSelectedObjects?.({
      respectActiveView: true,
    }) || [];

    const selectedNodes = selectedObjects.filter((obj) =>
      this.isEditNodeObject(obj)
    );

    const selectedFrames = selectedObjects.filter((obj) =>
      this.isEditFrameObject(obj)
    );

    const selectedAreas = selectedObjects.filter((obj) =>
      this.isEditAreaObject(obj)
    );

    const selectedDimensions = selectedObjects.filter((obj) =>
      this.isEditDimensionLineObject(obj)
    );

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
      totalPoints:
        nodesToAlign.size +
        areaPoints.length +
        dimensionPoints.length,
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
        const customValue = Number(
          document.getElementById("align-custom-value")?.value || 0
        );

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
      `${summary.targetValue.toFixed(3)}.`
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
    const selectedFrames = this.getEditSelectedFrames?.({
      respectActiveView: true,
    }) || [];

    if (selectedFrames.length < 2) {
      this.showMessage?.(
        "⛓️ Selecciona al menos dos líneas / frames para unir.",
        "warning"
      );
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
        const removeUnusedNodes =
          document.getElementById("join-remove-unused-nodes")?.checked === true;
        const selectResult =
          document.getElementById("join-select-result")?.checked === true;

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
      this.showMessage?.(
        "⛓️ Join Lines: no se encontraron líneas conectadas y colineales para unir.",
        "warning"
      );
      return;
    }

    this.showMessage?.(
      `⛓️ Join Lines: ${summary.removedFrames} línea(s) reemplazada(s) por ` +
      `${summary.createdFrames} línea(s) nueva(s).`
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
      Number(a.x || 0) * Number(b.x || 0) +
      Number(a.y || 0) * Number(b.y || 0) +
      Number(a.z || 0) * Number(b.z || 0)
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
      Number(v.x || 0) * Number(v.x || 0) +
      Number(v.y || 0) * Number(v.y || 0) +
      Number(v.z || 0) * Number(v.z || 0)
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

    const b1Distance = this.getDistancePointToLine3D(
      frameB.node1.position,
      a1,
      dirA
    );

    const b2Distance = this.getDistancePointToLine3D(
      frameB.node2.position,
      a1,
      dirA
    );

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
              this.framesShareNode(groupFrame, candidate) &&
              this.areFramesCollinear(groupFrame, candidate, tolerance)
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

    targetFrame.steelFrameDesignResult =
      this.cloneEditPlainData(sourceFrame.steelFrameDesignResult);

    targetFrame.steelJoistDesignResult =
      this.cloneEditPlainData(sourceFrame.steelJoistDesignResult);

    targetFrame.steelFrameDesignOverwrites =
      this.cloneEditPlainData(sourceFrame.steelFrameDesignOverwrites);

    targetFrame.steelJoistDesignOverwrites =
      this.cloneEditPlainData(sourceFrame.steelJoistDesignOverwrites);

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

    const newFrame = new Beam(
      baseFrame.E ?? this.globalE,
      baseFrame._A ?? this.globalA
    );

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

    const selectedFrames = this.getEditSelectedFrames?.({
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
    const selectedFrames = this.getEditSelectedFrames?.({
      respectActiveView: true,
    }) || [];

    if (!selectedFrames.length) {
      this.showMessage?.(
        "✂️ Selecciona una o más líneas / frames para dividir.",
        "warning"
      );
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

        const segments = Number(
          document.getElementById("divide-segments")?.value || 2
        );

        const maxLength = Number(
          document.getElementById("divide-max-length")?.value || 0
        );

        const selectResult =
          document.getElementById("divide-select-result")?.checked === true;

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
      `${summary.createdFrames} tramo(s). Nodos nuevos: ${summary.createdNodes}.`
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
    const selectedFrames = this.getEditSelectedFrames?.({
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
        Number(p.z || 0)
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

      const newFrame = new Beam(
        frame.E ?? this.globalE,
        frame._A ?? this.globalA
      );

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
    const selectedNodes = this.getEditSelectedNodes?.({
      respectActiveView: true,
    }) || [];

    const activeViewNodes = (this.nodes || []).filter((node) => {
      return this.isEditNodeObject(node) &&
        this.isEditObjectVisibleInActiveView(node);
    });

    if (!selectedNodes.length && !activeViewNodes.length) {
      this.showMessage?.(
        "📍 No hay puntos disponibles para extruir.",
        "warning"
      );
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
        const scope =
          document.getElementById("extrude-points-scope")?.value || "selected";

        const dx = Number(
          document.getElementById("extrude-points-dx")?.value || 0
        );

        const dy = Number(
          document.getElementById("extrude-points-dy")?.value || 0
        );

        const dz = Number(
          document.getElementById("extrude-points-dz")?.value || 0
        );

        const count = Number(
          document.getElementById("extrude-points-count")?.value || 1
        );

        const lineType =
          document.getElementById("extrude-points-line-type")?.value || "beam";

        const selectResult =
          document.getElementById("extrude-points-select-result")?.checked === true;

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
      `${summary.createdNodes} nodo(s) nuevo(s).`
    );
  },

  getExtrudePointCandidates(scope = "selected") {
    if (scope === "selected") {
      return this.getEditSelectedNodes?.({
        respectActiveView: true,
      }) || [];
    }

    if (scope === "active-view") {
      return (this.nodes || []).filter((node) => {
        return this.isEditNodeObject(node) &&
          this.isEditObjectVisibleInActiveView(node);
      });
    }

    return [];
  },

  createExtrudedFrame(nodeA, nodeB, lineType = "beam", selectResult = true) {
    const frame = new Beam(
      this.globalE,
      this.globalA
    );

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
          Number(nextPosition.z || 0)
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

        this.createExtrudedFrame(
          previousNode,
          newNode,
          lineType,
          selectResult
        );

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
    const selectedFrames = this.getEditSelectedFrames?.({
      respectActiveView: true,
    }) || [];

    const activeViewFrames = (this.shapes || []).filter((frame) => {
      return this.isEditFrameObject(frame) &&
        this.isEditObjectVisibleInActiveView(frame);
    });

    if (!selectedFrames.length && !activeViewFrames.length) {
      this.showMessage?.(
        "▭ No hay líneas disponibles para extruir a áreas.",
        "warning"
      );
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
        const scope =
          document.getElementById("extrude-lines-scope")?.value || "selected";

        const dx = Number(
          document.getElementById("extrude-lines-dx")?.value || 0
        );

        const dy = Number(
          document.getElementById("extrude-lines-dy")?.value || 0
        );

        const dz = Number(
          document.getElementById("extrude-lines-dz")?.value || 0
        );

        const count = Number(
          document.getElementById("extrude-lines-count")?.value || 1
        );

        const areaType =
          document.getElementById("extrude-lines-area-type")?.value || "wall";

        const selectResult =
          document.getElementById("extrude-lines-select-result")?.checked === true;

        const keepOriginalLines =
          document.getElementById("extrude-lines-keep-original")?.checked === true;

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

    this.showMessage?.(
      `━━➡️▭ Extrude Lines to Areas: ${summary.createdAreas} área(s) creada(s).`
    );
  },

  getExtrudeLineCandidates(scope = "selected") {
    if (scope === "selected") {
      return this.getEditSelectedFrames?.({
        respectActiveView: true,
      }) || [];
    }

    if (scope === "active-view") {
      return (this.shapes || []).filter((frame) => {
        return this.isEditFrameObject(frame) &&
          this.isEditObjectVisibleInActiveView(frame);
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
          selectResult
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
          (original.position.z || 0) + offsetZ
        );
        this.nodes.push(newNode);
        newElements.push(newNode);
      } else if (original.isBeam) {
        const newNode1 = new StructuralNode(
          original.node1.position.x + offsetX,
          original.node1.position.y + offsetY,
          (original.node1.position.z || 0) + offsetZ
        );
        const newNode2 = new StructuralNode(
          original.node2.position.x + offsetX,
          original.node2.position.y + offsetY,
          (original.node2.position.z || 0) + offsetZ
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

  editGridData() {
    if (this.gridEditor) {
      this.gridEditor.open();
    } else {
      this.showMessage("📏 Editar datos de grilla");
    }
  },

  editStoryData() {
    const currentStoryCount = Number(this.referenceGrid?.storyCount ?? this.stories?.length - 1 ?? 0);
    const currentStoryHeight = Number(this.referenceGrid?.storyHeight ?? 3);

    Swal.fire({
      title: "Edit Story Data",
      width: 620,
      html: `
      <div style="text-align:left; font-size:13px;">
        <p style="margin-bottom:12px;">
          Edita la cantidad de pisos y la altura típica entre niveles.
        </p>

        <div style="display:grid; grid-template-columns: 1fr 1fr; gap:12px; margin-bottom:12px;">
          <div>
            <label style="display:block; margin-bottom:5px;">Number of Stories</label>
            <input 
              id="edit-story-count" 
              type="number" 
              min="0" 
              step="1" 
              value="${currentStoryCount}"
              style="width:100%; padding:7px;"
            >
          </div>

          <div>
            <label style="display:block; margin-bottom:5px;">Typical Story Height (m)</label>
            <input 
              id="edit-story-height" 
              type="number" 
              min="0.01" 
              step="0.01" 
              value="${currentStoryHeight}"
              style="width:100%; padding:7px;"
            >
          </div>
        </div>

        <div id="edit-story-preview" style="border:1px solid #555; border-radius:6px; max-height:260px; overflow:auto;">
        </div>

        <div style="margin-top:12px; padding:10px; border:1px solid #555; border-radius:6px; color:#777; font-size:12px;">
          Esta versión trabaja con pisos uniformes porque las vistas, grillas de elevación y columnas usan 
          <b>storyCount</b> y <b>storyHeight</b>.
        </div>
      </div>
    `,
      showCancelButton: true,
      confirmButtonText: "Aplicar",
      cancelButtonText: "Cancelar",

      didOpen: () => {
        const countInput = document.getElementById("edit-story-count");
        const heightInput = document.getElementById("edit-story-height");
        const preview = document.getElementById("edit-story-preview");

        const renderPreview = () => {
          const storyCount = Math.max(0, Number(countInput?.value || 0));
          const storyHeight = Math.max(0.01, Number(heightInput?.value || 0));

          const rows = [];

          rows.push({
            id: 0,
            name: "Base",
            elevation: 0,
          });

          for (let i = 1; i <= storyCount; i++) {
            rows.push({
              id: i,
              name: `Piso ${i}`,
              elevation: i * storyHeight,
            });
          }

          preview.innerHTML = `
          <div style="display:grid; grid-template-columns: 80px 1fr 120px; gap:8px; padding:7px; background:#1f2937; color:white; font-weight:bold;">
            <span>ID</span>
            <span>Story Name</span>
            <span>Elevation</span>
          </div>

          ${rows.map((story) => `
            <div style="display:grid; grid-template-columns: 80px 1fr 120px; gap:8px; padding:7px; border-bottom:1px solid #444;">
              <span>${story.id}</span>
              <span>${story.name}</span>
              <span>${story.elevation.toFixed(2)} m</span>
            </div>
          `).join("")}
        `;
        };

        countInput?.addEventListener("input", renderPreview);
        heightInput?.addEventListener("input", renderPreview);

        renderPreview();
      },

      preConfirm: () => {
        const storyCount = Number(document.getElementById("edit-story-count")?.value || 0);
        const storyHeight = Number(document.getElementById("edit-story-height")?.value || 0);

        if (!Number.isFinite(storyCount) || storyCount < 0) {
          Swal.showValidationMessage("La cantidad de pisos no es válida.");
          return false;
        }

        if (!Number.isInteger(storyCount)) {
          Swal.showValidationMessage("La cantidad de pisos debe ser un número entero.");
          return false;
        }

        if (!Number.isFinite(storyHeight) || storyHeight <= 0) {
          Swal.showValidationMessage("La altura de piso debe ser mayor que cero.");
          return false;
        }

        return {
          storyCount,
          storyHeight,
        };
      },
    }).then((result) => {
      if (!result.isConfirmed || !result.value) return;

      this.applyStoryData(
        result.value.storyCount,
        result.value.storyHeight
      );
    });
  },

  applyStoryData(storyCount, storyHeight) {
    if (!this.referenceGrid) {
      this.referenceGrid = {
        xGrids: [],
        yGrids: [],
        generalGrids: [],
        xPositions: [],
        yPositions: [],
        xLabels: [],
        yLabels: [],
        storyCount: 0,
        storyHeight: 0,
      };
    }

    this.saveUndoState?.("Edit Story Data");

    this.referenceGrid.storyCount = Number(storyCount || 0);
    this.referenceGrid.storyHeight = Number(storyHeight || 0);

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

    if (Number(this.activeStory || 0) > storyCount) {
      this.activeStory = 0;
    }

    this.rebuildReferenceGridCaches?.();
    this.rebuildGeneralGrids?.();
    this.rebuildViewSetFromReferenceGrid?.();
    this.rebuildElevationListsFromReferenceGrid?.();

    if (this.activeViewIndex >= this.viewSet.length) {
      this.activeViewIndex = 0;
    }

    this.activeGridPoint = null;

    const activeView = this.viewSet?.[this.activeViewIndex];

    if (activeView?.type === "plan") {
      this.currentViewMode = "plan";
      this.currentZ = Number(activeView.elevation || 0);
    }

    this.redraw?.();
    this.sync3D?.();

    this.showMessage?.(
      `Edit Story Data aplicado: ${storyCount} piso(s), altura ${storyHeight} m.`
    );

    console.log("✅ EDIT STORY DATA aplicado:", {
      storyCount,
      storyHeight,
      stories: this.stories,
      viewSet: this.viewSet,
    });
  },

  // =========================================
  // ===== EDIT: REFERENCE LINES =============
  // =========================================

  editReferenceLines() {
    if (!this.referenceGrid) {
      this.referenceGrid = {
        xGrids: [],
        yGrids: [],
        generalGrids: [],
        xPositions: [],
        yPositions: [],
        xLabels: [],
        yLabels: [],
        storyCount: 0,
        storyHeight: 0,
      };
    }

    const currentCustomLines = (this.referenceGrid.generalGrids || [])
      .filter((line) => line.source === "custom")
      .map((line, index) => ({
        id: String(line.id ?? `RL${index + 1}`),
        x1: Number(line.x1 ?? 0),
        y1: Number(line.y1 ?? 0),
        x2: Number(line.x2 ?? 0),
        y2: Number(line.y2 ?? 0),
        visible: line.visible !== false,
        bubbleLoc: line.bubbleLoc ?? "End",
        source: "custom",
      }));

    Swal.fire({
      title: "Edit Reference Lines",
      width: 900,
      html: `
      <div style="text-align:left; font-size:13px;">
        <p style="margin-bottom:12px;">
          Edita líneas de referencia auxiliares en planta. Estas líneas sirven como guías y puntos de snap.
        </p>

        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:10px;">
          <b>Reference Lines</b>
          <button 
            type="button" 
            id="btn-add-reference-line"
            style="padding:6px 10px; border-radius:5px; border:1px solid #2563eb; background:#2563eb; color:white; cursor:pointer;"
          >
            + Add Line
          </button>
        </div>

        <div style="border:1px solid #555; border-radius:6px; max-height:340px; overflow:auto;">
          <table style="width:100%; border-collapse:collapse; font-size:12px;">
            <thead>
              <tr style="background:#1f2937; color:white;">
                <th style="border:1px solid #555; padding:6px;">ID</th>
                <th style="border:1px solid #555; padding:6px;">X1</th>
                <th style="border:1px solid #555; padding:6px;">Y1</th>
                <th style="border:1px solid #555; padding:6px;">X2</th>
                <th style="border:1px solid #555; padding:6px;">Y2</th>
                <th style="border:1px solid #555; padding:6px;">Visible</th>
                <th style="border:1px solid #555; padding:6px;">Bubble</th>
                <th style="border:1px solid #555; padding:6px;">Remove</th>
              </tr>
            </thead>

            <tbody id="edit-reference-lines-body"></tbody>
          </table>
        </div>

        <div style="margin-top:12px; padding:10px; border:1px solid #555; border-radius:6px; color:#777; font-size:12px;">
          Ejemplo: una línea diagonal desde X1=0, Y1=0 hasta X2=10, Y2=8.
          Se mostrará en planta como línea auxiliar personalizada.
        </div>
      </div>
    `,
      showCancelButton: true,
      confirmButtonText: "Aplicar",
      cancelButtonText: "Cancelar",

      didOpen: () => {
        const body = document.getElementById("edit-reference-lines-body");
        const addButton = document.getElementById("btn-add-reference-line");

        let rows = JSON.parse(JSON.stringify(currentCustomLines));

        const inputStyle = "width:100%; padding:5px; box-sizing:border-box;";
        const selectStyle = "width:100%; padding:5px; box-sizing:border-box;";

        const renderRows = () => {
          if (!body) return;

          body.innerHTML = rows.map((line, index) => `
          <tr>
            <td style="border:1px solid #555; padding:5px;">
              <input 
                data-ref-line-index="${index}" 
                data-ref-line-field="id"
                value="${line.id}"
                style="${inputStyle}"
              >
            </td>

            <td style="border:1px solid #555; padding:5px;">
              <input 
                type="number" 
                step="any"
                data-ref-line-index="${index}" 
                data-ref-line-field="x1"
                value="${line.x1}"
                style="${inputStyle}"
              >
            </td>

            <td style="border:1px solid #555; padding:5px;">
              <input 
                type="number" 
                step="any"
                data-ref-line-index="${index}" 
                data-ref-line-field="y1"
                value="${line.y1}"
                style="${inputStyle}"
              >
            </td>

            <td style="border:1px solid #555; padding:5px;">
              <input 
                type="number" 
                step="any"
                data-ref-line-index="${index}" 
                data-ref-line-field="x2"
                value="${line.x2}"
                style="${inputStyle}"
              >
            </td>

            <td style="border:1px solid #555; padding:5px;">
              <input 
                type="number" 
                step="any"
                data-ref-line-index="${index}" 
                data-ref-line-field="y2"
                value="${line.y2}"
                style="${inputStyle}"
              >
            </td>

            <td style="border:1px solid #555; padding:5px; text-align:center;">
              <input 
                type="checkbox"
                data-ref-line-index="${index}" 
                data-ref-line-field="visible"
                ${line.visible !== false ? "checked" : ""}
              >
            </td>

            <td style="border:1px solid #555; padding:5px;">
              <select 
                data-ref-line-index="${index}" 
                data-ref-line-field="bubbleLoc"
                style="${selectStyle}"
              >
                <option value="Start" ${line.bubbleLoc === "Start" ? "selected" : ""}>Start</option>
                <option value="End" ${line.bubbleLoc === "End" ? "selected" : ""}>End</option>
              </select>
            </td>

            <td style="border:1px solid #555; padding:5px; text-align:center;">
              <button 
                type="button" 
                data-remove-reference-line="${index}"
                style="padding:5px 8px; border-radius:5px; border:1px solid #dc2626; background:#dc2626; color:white; cursor:pointer;"
              >
                X
              </button>
            </td>
          </tr>
        `).join("");

          body.querySelectorAll("[data-ref-line-field]").forEach((input) => {
            input.addEventListener("input", (event) => {
              const index = Number(event.target.dataset.refLineIndex);
              const field = event.target.dataset.refLineField;

              if (!rows[index]) return;

              if (field === "visible") {
                rows[index][field] = event.target.checked;
              } else if (["x1", "y1", "x2", "y2"].includes(field)) {
                rows[index][field] = Number(event.target.value);
              } else {
                rows[index][field] = event.target.value;
              }
            });

            input.addEventListener("change", (event) => {
              const index = Number(event.target.dataset.refLineIndex);
              const field = event.target.dataset.refLineField;

              if (!rows[index]) return;

              if (field === "visible") {
                rows[index][field] = event.target.checked;
              } else if (["x1", "y1", "x2", "y2"].includes(field)) {
                rows[index][field] = Number(event.target.value);
              } else {
                rows[index][field] = event.target.value;
              }
            });
          });

          body.querySelectorAll("[data-remove-reference-line]").forEach((button) => {
            button.addEventListener("click", (event) => {
              const index = Number(event.target.dataset.removeReferenceLine);
              rows.splice(index, 1);
              renderRows();
            });
          });
        };

        addButton?.addEventListener("click", () => {
          rows.push({
            id: `RL${rows.length + 1}`,
            x1: 0,
            y1: 0,
            x2: 5,
            y2: 5,
            visible: true,
            bubbleLoc: "End",
            source: "custom",
          });

          renderRows();
        });

        window.__editReferenceLinesRows = rows;
        renderRows();
      },

      preConfirm: () => {
        const rows = window.__editReferenceLinesRows || [];

        const cleaned = rows.map((line, index) => ({
          id: String(line.id || `RL${index + 1}`),
          x1: Number(line.x1 || 0),
          y1: Number(line.y1 || 0),
          x2: Number(line.x2 || 0),
          y2: Number(line.y2 || 0),
          visible: line.visible !== false,
          bubbleLoc: line.bubbleLoc || "End",
          source: "custom",
        }));

        for (const line of cleaned) {
          if (
            !Number.isFinite(line.x1) ||
            !Number.isFinite(line.y1) ||
            !Number.isFinite(line.x2) ||
            !Number.isFinite(line.y2)
          ) {
            Swal.showValidationMessage("Hay coordenadas inválidas en una línea de referencia.");
            return false;
          }

          const samePoint =
            Math.abs(line.x1 - line.x2) < 1e-9 &&
            Math.abs(line.y1 - line.y2) < 1e-9;

          if (samePoint) {
            Swal.showValidationMessage(`La línea ${line.id} tiene el punto inicial y final iguales.`);
            return false;
          }
        }

        return cleaned;
      },

      willClose: () => {
        delete window.__editReferenceLinesRows;
      },
    }).then((result) => {
      if (!result.isConfirmed || !result.value) return;

      this.applyReferenceLinesData(result.value);
    });
  },

  applyReferenceLinesData(lines = []) {
    if (!this.referenceGrid) return;

    this.saveUndoState?.("Edit Reference Lines");

    const existingBaseLines = (this.referenceGrid.generalGrids || [])
      .filter((line) => line.source !== "custom");

    const customLines = lines.map((line, index) => ({
      id: String(line.id || `RL${index + 1}`),
      x1: Number(line.x1 || 0),
      y1: Number(line.y1 || 0),
      x2: Number(line.x2 || 0),
      y2: Number(line.y2 || 0),
      visible: line.visible !== false,
      bubbleLoc: line.bubbleLoc || "End",
      source: "custom",
    }));

    this.referenceGrid.generalGrids = [
      ...existingBaseLines,
      ...customLines,
    ];

    this.rebuildReferenceGridCaches?.();
    this.rebuildGeneralGrids?.();

    this.activeGridPoint = null;

    this.redraw?.();
    this.sync3D?.();

    this.showMessage?.(
      `Edit Reference Lines aplicado: ${customLines.length} línea(s) de referencia.`
    );

    console.log("✅ EDIT REFERENCE LINES aplicado:", {
      customLines,
      generalGrids: this.referenceGrid.generalGrids,
    });
  },

  // =========================================
  // ===== EDIT: REFERENCE PLANES ============
  // =========================================

  editReferencePlanes() {
    if (!Array.isArray(this.referencePlanes)) {
      this.referencePlanes = [];
    }

    const currentPlanes = this.referencePlanes.map((plane, index) => ({
      id: String(plane.id ?? `RP${index + 1}`),
      name: String(plane.name ?? plane.id ?? `RP${index + 1}`),
      planeType: plane.planeType || "XY",
      coordinate: Number(plane.coordinate ?? 0),
      visible: plane.visible !== false,
      showFill: plane.showFill === true,
    }));

    Swal.fire({
      title: "Edit Reference Planes",
      width: 900,
      html: `
      <div style="text-align:left; font-size:13px;">
        <p style="margin-bottom:12px;">
          Edita planos auxiliares de referencia. Estos planos sirven como guías visuales para modelar en planta, elevación y 3D.
        </p>

        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:10px;">
          <b>Reference Planes</b>
          <button 
            type="button" 
            id="btn-add-reference-plane"
            style="padding:6px 10px; border-radius:5px; border:1px solid #2563eb; background:#2563eb; color:white; cursor:pointer;"
          >
            + Add Plane
          </button>
        </div>

        <div style="border:1px solid #555; border-radius:6px; max-height:340px; overflow:auto;">
          <table style="width:100%; border-collapse:collapse; font-size:12px;">
            <thead>
              <tr style="background:#1f2937; color:white;">
                <th style="border:1px solid #555; padding:6px;">ID</th>
                <th style="border:1px solid #555; padding:6px;">Name</th>
                <th style="border:1px solid #555; padding:6px;">Plane</th>
                <th style="border:1px solid #555; padding:6px;">Coordinate</th>
                <th style="border:1px solid #555; padding:6px;">Visible</th>
                <th style="border:1px solid #555; padding:6px;">Fill</th>
                <th style="border:1px solid #555; padding:6px;">Remove</th>
              </tr>
            </thead>

            <tbody id="edit-reference-planes-body"></tbody>
          </table>
        </div>

        <div style="margin-top:12px; padding:10px; border:1px solid #555; border-radius:6px; color:#777; font-size:12px;">
          <b>XY</b>: plano horizontal, coordenada Z.<br>
          <b>YZ</b>: plano vertical, coordenada X.<br>
          <b>XZ</b>: plano vertical, coordenada Y.
        </div>
      </div>
    `,
      showCancelButton: true,
      confirmButtonText: "Aplicar",
      cancelButtonText: "Cancelar",

      didOpen: () => {
        const body = document.getElementById("edit-reference-planes-body");
        const addButton = document.getElementById("btn-add-reference-plane");

        let rows = JSON.parse(JSON.stringify(currentPlanes));

        const inputStyle = "width:100%; padding:5px; box-sizing:border-box;";
        const selectStyle = "width:100%; padding:5px; box-sizing:border-box;";

        const renderRows = () => {
          if (!body) return;

          body.innerHTML = rows.map((plane, index) => `
          <tr>
            <td style="border:1px solid #555; padding:5px;">
              <input 
                data-ref-plane-index="${index}" 
                data-ref-plane-field="id"
                value="${plane.id}"
                style="${inputStyle}"
              >
            </td>

            <td style="border:1px solid #555; padding:5px;">
              <input 
                data-ref-plane-index="${index}" 
                data-ref-plane-field="name"
                value="${plane.name}"
                style="${inputStyle}"
              >
            </td>

            <td style="border:1px solid #555; padding:5px;">
              <select 
                data-ref-plane-index="${index}" 
                data-ref-plane-field="planeType"
                style="${selectStyle}"
              >
                <option value="XY" ${plane.planeType === "XY" ? "selected" : ""}>XY - Z constant</option>
                <option value="YZ" ${plane.planeType === "YZ" ? "selected" : ""}>YZ - X constant</option>
                <option value="XZ" ${plane.planeType === "XZ" ? "selected" : ""}>XZ - Y constant</option>
              </select>
            </td>

            <td style="border:1px solid #555; padding:5px;">
              <input 
                type="number" 
                step="any"
                data-ref-plane-index="${index}" 
                data-ref-plane-field="coordinate"
                value="${plane.coordinate}"
                style="${inputStyle}"
              >
            </td>

            <td style="border:1px solid #555; padding:5px; text-align:center;">
              <input 
                type="checkbox"
                data-ref-plane-index="${index}" 
                data-ref-plane-field="visible"
                ${plane.visible !== false ? "checked" : ""}
              >
            </td>

            <td style="border:1px solid #555; padding:5px; text-align:center;">
              <input 
                type="checkbox"
                data-ref-plane-index="${index}" 
                data-ref-plane-field="showFill"
                ${plane.showFill === true ? "checked" : ""}
              >
            </td>

            <td style="border:1px solid #555; padding:5px; text-align:center;">
              <button 
                type="button" 
                data-remove-reference-plane="${index}"
                style="padding:5px 8px; border-radius:5px; border:1px solid #dc2626; background:#dc2626; color:white; cursor:pointer;"
              >
                X
              </button>
            </td>
          </tr>
        `).join("");

          body.querySelectorAll("[data-ref-plane-field]").forEach((input) => {
            const updateValue = (event) => {
              const index = Number(event.target.dataset.refPlaneIndex);
              const field = event.target.dataset.refPlaneField;

              if (!rows[index]) return;

              if (field === "visible" || field === "showFill") {
                rows[index][field] = event.target.checked;
              } else if (field === "coordinate") {
                rows[index][field] = Number(event.target.value);
              } else {
                rows[index][field] = event.target.value;
              }
            };

            input.addEventListener("input", updateValue);
            input.addEventListener("change", updateValue);
          });

          body.querySelectorAll("[data-remove-reference-plane]").forEach((button) => {
            button.addEventListener("click", (event) => {
              const index = Number(event.target.dataset.removeReferencePlane);
              rows.splice(index, 1);
              renderRows();
            });
          });
        };

        addButton?.addEventListener("click", () => {
          rows.push({
            id: `RP${rows.length + 1}`,
            name: `Reference Plane ${rows.length + 1}`,
            planeType: "XY",
            coordinate: 0,
            visible: true,
            showFill: false,
          });

          renderRows();
        });

        window.__editReferencePlanesRows = rows;
        renderRows();
      },

      preConfirm: () => {
        const rows = window.__editReferencePlanesRows || [];

        const cleaned = rows.map((plane, index) => ({
          id: String(plane.id || `RP${index + 1}`),
          name: String(plane.name || plane.id || `Reference Plane ${index + 1}`),
          planeType: ["XY", "YZ", "XZ"].includes(plane.planeType)
            ? plane.planeType
            : "XY",
          coordinate: Number(plane.coordinate || 0),
          visible: plane.visible !== false,
          showFill: plane.showFill === true,
        }));

        for (const plane of cleaned) {
          if (!Number.isFinite(plane.coordinate)) {
            Swal.showValidationMessage(`El plano ${plane.id} tiene una coordenada inválida.`);
            return false;
          }
        }

        return cleaned;
      },

      willClose: () => {
        delete window.__editReferencePlanesRows;
      },
    }).then((result) => {
      if (!result.isConfirmed || !result.value) return;

      this.applyReferencePlanesData(result.value);
    });
  },

  applyReferencePlanesData(planes = []) {
    this.saveUndoState?.("Edit Reference Planes");

    this.referencePlanes = planes.map((plane, index) => ({
      id: String(plane.id || `RP${index + 1}`),
      name: String(plane.name || plane.id || `Reference Plane ${index + 1}`),
      planeType: ["XY", "YZ", "XZ"].includes(plane.planeType)
        ? plane.planeType
        : "XY",
      coordinate: Number(plane.coordinate || 0),
      visible: plane.visible !== false,
      showFill: plane.showFill === true,
    }));

    this.activeGridPoint = null;

    this.redraw?.();
    // this.sync3D?.();

    this.showMessage?.(
      `Edit Reference Planes aplicado: ${this.referencePlanes.length} plano(s) de referencia.`
    );

    console.log("✅ EDIT REFERENCE PLANES aplicado:", {
      referencePlanes: this.referencePlanes,
    });
  },


  // Métodos auxiliares para clipboard
  copyToClipboard() {
    if (this.moveObjectState && this.moveObjectState.selectedObject) {
      const obj = this.moveObjectState.selectedObject;
      this.clipboardElements = {
        type: obj.isBeam ? "beam" : "node",
        data: obj.isBeam
          ? {
            id: obj.id,
            node1: { x: obj.node1.position.x, y: obj.node1.position.y, z: obj.node1.position.z },
            node2: { x: obj.node2.position.x, y: obj.node2.position.y, z: obj.node2.position.z },
          }
          : {
            id: obj.id,
            x: obj.position.x,
            y: obj.position.y,
            z: obj.position.z,
          },
      };
    }
  },

  pasteFromClipboard() {
    if (this.clipboardElements) {
      if (this.clipboardElements.type === "node") {
        const newNode = new StructuralNode(
          this.clipboardElements.data.x + 1,
          this.clipboardElements.data.y + 1,
          this.clipboardElements.data.z,
        );
        this.nodes.push(newNode);
      } else if (this.clipboardElements.type === "beam") {
        // Buscar nodos existentes o crear nuevos
        const node1 = new StructuralNode(
          this.clipboardElements.data.node1.x + 1,
          this.clipboardElements.data.node1.y + 1,
          this.clipboardElements.data.node1.z,
        );
        const node2 = new StructuralNode(
          this.clipboardElements.data.node2.x + 1,
          this.clipboardElements.data.node2.y + 1,
          this.clipboardElements.data.node2.z,
        );
        this.nodes.push(node1, node2);
        const newBeam = new Beam(node1, node2);
        this.shapes.push(newBeam);
      }
      this.redraw();
      this.sync3D();
    }
  },

  // ===============================================
  // ========== MÉTODOS PARA EL MENÚ VIEW ==========
  // ===============================================

  async set3DView() {
    const result = await Swal.fire({
      title: "Set 3D View",
      width: 520,
      html: `
      <div style="text-align:left; font-size:13px;">
        <p style="margin-bottom:12px;">
          Selecciona una orientación para la vista 3D.
        </p>

        <label style="display:block; margin-bottom:6px;">Vista 3D</label>

        <select id="view-3d-type" style="width:100%; padding:7px;">
          <option value="iso">Isometric View</option>
          <option value="plan">Plan View / Top</option>
          <option value="front">Front Elevation</option>
          <option value="side">Side Elevation</option>
          <option value="extents">Zoom Extents 3D</option>
        </select>

        <div style="margin-top:12px; padding:10px; border:1px solid #555; border-radius:6px; color:#777; font-size:12px;">
          Esta opción cambia solo la cámara 3D. No modifica nodos, barras, grillas ni asignaciones.
        </div>
      </div>
    `,
      showCancelButton: true,
      confirmButtonText: "Aplicar",
      cancelButtonText: "Cancelar",
      preConfirm: () => {
        return document.getElementById("view-3d-type")?.value || "iso";
      },
    });

    if (!result.isConfirmed) return;

    const viewType = result.value;

    if (this.windowLayout === "one") {
      this.singleWindowView = "3d";
      this.setWindowLayout?.("one");
    }

    if (viewType === "iso") {
      this.setViewIso?.();
    }

    if (viewType === "plan") {
      this.setViewPlan?.();
    }

    if (viewType === "front") {
      this.setViewFront?.();
    }

    if (viewType === "side") {
      this.setViewSide?.();
    }

    if (viewType === "extents") {
      this.zoomExtents?.();
    }

    this.redraw?.();

    this.showMessage?.(`🎥 Set 3D View: ${viewType}`);
  },

  async setPlanView() {
    this.ensureViewSetForViewMenu?.();

    const planViews = (this.viewSet || [])
      .map((view, index) => ({ ...view, index }))
      .filter((view) => view.type === "plan");

    if (!planViews.length) {
      this.showMessage?.("No hay vistas de planta disponibles.", "warning");
      return;
    }

    const options = {};

    planViews.forEach((view) => {
      const z = Number(view.elevation ?? 0);
      options[view.index] = `${view.name || "Planta"} | Z = ${z.toFixed(2)} m`;
    });

    const currentPlan = planViews.find((view) => view.index === this.activeViewIndex);
    const defaultValue = currentPlan ? String(currentPlan.index) : String(planViews[0].index);

    const result = await Swal.fire({
      title: "Set Plan View",
      width: 560,
      html: `
      <div style="text-align:left; font-size:13px;">
        <p style="margin-bottom:12px;">
          Selecciona el nivel o planta que deseas visualizar.
        </p>

        <label style="display:block; margin-bottom:6px;">Plan View</label>

        <select id="view-plan-index" style="width:100%; padding:7px;">
          ${planViews.map((view) => {
        const z = Number(view.elevation ?? 0);
        const selected = String(view.index) === defaultValue ? "selected" : "";

        return `
              <option value="${view.index}" ${selected}>
                ${view.name || "Planta"} | Z = ${z.toFixed(2)} m
              </option>
            `;
      }).join("")}
        </select>

        <label style="display:flex; align-items:center; gap:8px; margin-top:12px;">
          <input id="view-plan-fit" type="checkbox" checked>
          Restore Full View después de cambiar
        </label>

        <div style="margin-top:12px; padding:10px; border:1px solid #555; border-radius:6px; color:#777; font-size:12px;">
          Esta opción cambia la vista activa 2D a una planta. Los objetos seguirán filtrándose por el nivel seleccionado.
        </div>
      </div>
    `,
      showCancelButton: true,
      confirmButtonText: "Aplicar",
      cancelButtonText: "Cancelar",
      preConfirm: () => {
        return {
          index: Number(document.getElementById("view-plan-index")?.value),
          fit: document.getElementById("view-plan-fit")?.checked === true,
        };
      },
    });

    if (!result.isConfirmed) return;

    const selectedIndex = result.value.index;

    this.saveZoomState?.();
    this.setViewFromSet(selectedIndex);

    const selectedView = this.viewSet?.[selectedIndex];

    if (result.value.fit) {
      this.fitContentToScreen?.();
    }

    this.redraw?.();

    this.showMessage?.(`🗺️ Vista en planta: ${selectedView?.name || selectedIndex}`);
  },

  async setElevationView() {
    this.ensureViewSetForViewMenu?.();

    const elevationViews = (this.viewSet || [])
      .map((view, index) => ({ ...view, index }))
      .filter((view) => view.type === "elevation");

    if (!elevationViews.length) {
      this.showMessage?.("No hay vistas de elevación disponibles.", "warning");
      return;
    }

    const defaultView =
      elevationViews.find((view) => view.index === this.activeViewIndex) ||
      elevationViews[0];

    const result = await Swal.fire({
      title: "Set Elevation View",
      width: 620,
      html: `
      <div style="text-align:left; font-size:13px;">
        <p style="margin-bottom:12px;">
          Selecciona la elevación que deseas visualizar.
        </p>

        <label style="display:block; margin-bottom:6px;">Elevation View</label>

        <select id="view-elevation-index" style="width:100%; padding:7px;">
          ${elevationViews.map((view) => {
        const fixedAxis = view.axis === "X" ? "X fijo" : "Y fijo";
        const plane = view.axis === "X" ? "Plano Y-Z" : "Plano X-Z";
        const value = Number(view.value ?? 0).toFixed(2);
        const selected = view.index === defaultView.index ? "selected" : "";

        return `
              <option value="${view.index}" ${selected}>
                ${view.name || `Elevación ${view.label}`} | ${fixedAxis} = ${value} m | ${plane}
              </option>
            `;
      }).join("")}
        </select>

        <label style="display:flex; align-items:center; gap:8px; margin-top:12px;">
          <input id="view-elevation-fit" type="checkbox" checked>
          Restore Full View después de cambiar
        </label>

        <div style="margin-top:12px; padding:10px; border:1px solid #555; border-radius:6px; color:#777; font-size:12px;">
          En esta versión:
          <br>• Elevaciones A, B, C... trabajan con X fijo y muestran el plano Y-Z.
          <br>• Elevaciones 1, 2, 3... trabajan con Y fijo y muestran el plano X-Z.
        </div>
      </div>
    `,
      showCancelButton: true,
      confirmButtonText: "Aplicar",
      cancelButtonText: "Cancelar",
      preConfirm: () => {
        return {
          index: Number(document.getElementById("view-elevation-index")?.value),
          fit: document.getElementById("view-elevation-fit")?.checked === true,
        };
      },
    });

    if (!result.isConfirmed) return;

    const selectedIndex = result.value.index;

    this.saveZoomState?.();
    this.setViewFromSet(selectedIndex);

    const selectedView = this.viewSet?.[selectedIndex];

    if (result.value.fit) {
      this.fitContentToScreen?.();
    }

    this.redraw?.();

    this.showMessage?.(`📐 Vista en elevación: ${selectedView?.name || selectedIndex}`);
  },

  ensureViewSetForViewMenu() {
    if (!Array.isArray(this.viewSet)) {
      this.viewSet = [];
    }

    if (this.viewSet.length > 0) {
      return;
    }

    this.rebuildReferenceGridCaches?.();
    this.rebuildViewSetFromReferenceGrid?.();
    this.rebuildElevationListsFromReferenceGrid?.();

    if (!Array.isArray(this.viewSet)) {
      this.viewSet = [];
    }
  },

  rubberBandZoom() {
    if (!this.rubberBandZoomState) {
      this.showMessage?.("No existe RubberBandZoomState", "warning");
      return;
    }

    this.clearAllSelections?.();
    this.setState(this.rubberBandZoomState);

    this.showMessage?.(
      "🔍 Rubber Band Zoom activado. Arrastra un recuadro con clic izquierdo."
    );
  },

  restoreFullView() {
    this.saveZoomState?.();

    this.fitContentToScreen();

    this.redraw?.();
    this.showMessage?.("🖼️ Vista completa restaurada");
  },

  previousZoom() {
    if (!this.zoomHistory || this.zoomHistory.length === 0) {
      this.showMessage?.("⏪ No hay zoom anterior disponible", "warning");
      return;
    }

    const previousState = this.zoomHistory.pop();

    if (!this.grid?.restoreState) {
      this.showMessage?.("Falta restoreState() en grid.js", "warning");
      return;
    }

    this.grid.restoreState(previousState);

    this.redraw?.();
    this.showMessage?.("⏪ Zoom anterior restaurado");
  },

  zoomInOneStep() {
    if (!this.canvas || !this.grid) return;

    this.saveZoomState?.();

    this.grid.zoomInToScreenPoint({
      x: this.canvas.width / 2,
      y: this.canvas.height / 2,
    });

    this.redraw?.();
    this.showMessage?.("🔍+ Zoom +1");
  },

  zoomOutOneStep() {
    if (!this.canvas || !this.grid) return;

    this.saveZoomState?.();

    this.grid.zoomOutToScreenPoint({
      x: this.canvas.width / 2,
      y: this.canvas.height / 2,
    });

    this.redraw?.();
    this.showMessage?.("🔍- Zoom -1");
  },

  panView() {
    if (!this.panAndZoomState) {
      this.showMessage?.("No existe PanAndZoomState", "warning");
      return;
    }

    this.setState(this.panAndZoomState);

    this.showMessage?.("✋ Pan activado: usa el botón central del mouse para mover la vista y la rueda para zoom.");
  },

  saveZoomState() {
    if (!this.grid?.getState) {
      console.warn("Falta getState() en grid.js");
      return;
    }

    if (!Array.isArray(this.zoomHistory)) {
      this.zoomHistory = [];
    }

    this.zoomHistory.push(this.grid.getState());

    if (this.zoomHistory.length > 20) {
      this.zoomHistory.shift();
    }
  },

  // // Método auxiliar para guardar estado de zoom
  // saveZoomState() {
  //   if (!this.zoomHistory) this.zoomHistory = [];
  //   this.zoomHistory.push(this.grid.getState());
  //   if (this.zoomHistory.length > 20) this.zoomHistory.shift();
  // },

  // =========================================
  // ========== MÉTODOS PARA DEFINE ==========
  // =========================================

  // openMaterialProperties() {
  //   openDefineMaterialsDialog(this);
  // },

  openMaterialProperties() {
    // Disparar evento para abrir el modal
    window.dispatchEvent(new CustomEvent("open-material-properties-modal"));

    // También puedes mantener un timeout por si el modal no está listo
    setTimeout(() => {
      // Verificar si el modal está abierto (opcional)
      const modal = document.querySelector('[x-data="materialPropertiesModal()"]');
      if (modal && modal.__x && !modal.__x.$data.open) {
        console.log("Modal encontrado pero no abierto, reintentando...");
        window.dispatchEvent(new CustomEvent("open-material-properties-modal"));
      }
    }, 100);
  },

  openFrameSections() {
    window.dispatchEvent(new CustomEvent("open-frame-sections-modal"));
  },

  openLoadCases() {
    window.dispatchEvent(new CustomEvent("open-static-load-cases-modal"));
  },

  openLoadCombinations() {
    window.dispatchEvent(new CustomEvent("open-load-combinations-modal"));
  },

  openMassSource() {
    window.dispatchEvent(new CustomEvent("open-mass-source-modal"));
  },

  // nuevos metodos:
  // ========== MÉTODOS FALTANTES PARA EL MENÚ DEFINE ==========

  openDiaphragms() {
    window.dispatchEvent(new CustomEvent("open-diaphragms-modal"));
  },

  openGroups() {
    this.showMessage("👥 Groups - Próximamente");
  },

  openSectionCuts() {
    window.dispatchEvent(new CustomEvent("open-section-cuts-modal"));
  },

  openResponseSpectrumFunctions() {
    window.dispatchEvent(new CustomEvent("open-response-spectrum-functions-modal"));
  },

  openResponseSpectrumCases() {
    Swal.fire({
      title: "Response Spectrum Cases",
      html: `
            <div class="text-left">
                <div class="mb-3">
                    <label class="block text-xs font-bold">Case Name</label>
                    <input type="text" class="w-full px-2 py-1 border rounded text-sm" value="SPEC1">
                </div>
                <div class="grid grid-cols-2 gap-3">
                    <div>
                        <label class="text-xs">Function</label>
                        <select class="w-full px-2 py-1 border rounded text-sm">
                            <option>ACCEL_X</option>
                            <option>ACCEL_Y</option>
                            <option>ACCEL_Z</option>
                        </select>
                    </div>
                    <div>
                        <label class="text-xs">Scale Factor</label>
                        <input type="number" step="0.1" class="w-full px-2 py-1 border rounded text-sm" value="1.0">
                    </div>
                    <div>
                        <label class="text-xs">Damping Ratio</label>
                        <input type="number" step="0.01" class="w-full px-2 py-1 border rounded text-sm" value="0.05">
                    </div>
                    <div>
                        <label class="text-xs">Modal Combination</label>
                        <select class="w-full px-2 py-1 border rounded text-sm">
                            <option>CQC</option>
                            <option>SRSS</option>
                            <option>ABS</option>
                        </select>
                    </div>
                </div>
            </div>
        `,
      confirmButtonText: "OK",
    });
  },

  // openPushoverCases() {
  //   window.dispatchEvent(new CustomEvent("open-static-nonlinear-cases-modal"));
  // },

  // openSequentialConstruction() {
  //   window.dispatchEvent(new CustomEvent("open-sequential-construction-modal"));
  // },

  convertCombosToNonlinear() {
    Swal.fire({
      title: "Convert Combos to Nonlinear Cases",
      html: `
            <div class="text-left">
                <p class="text-sm text-gray-400 mb-3">Seleccione las combinaciones a convertir:</p>
                <div class="max-h-40 overflow-y-auto border rounded p-2">
                    ${this.loadCombinations.combinations
          .map(
            (combo) => `
                        <label class="flex items-center gap-2 py-1">
                            <input type="checkbox" value="${combo.name}" class="combo-checkbox">
                            <span class="text-sm">${combo.name}: ${combo.expression}</span>
                        </label>
                    `,
          )
          .join("")}
                </div>
                <div class="mt-3">
                    <label class="text-xs">Prefix for Nonlinear Cases</label>
                    <input type="text" id="nl-prefix" class="w-full px-2 py-1 border rounded text-sm" value="NL_">
                </div>
            </div>
        `,
      confirmButtonText: "Convert",
      preConfirm: () => {
        const selected = [];
        document.querySelectorAll(".combo-checkbox:checked").forEach((cb) => {
          selected.push(cb.value);
        });
        const prefix = document.getElementById("nl-prefix").value;
        return { selected, prefix };
      },
    }).then((result) => {
      if (result.isConfirmed && result.value) {
        this.showMessage(
          `🔄 Convertidas ${result.value.selected.length} combinaciones con prefijo "${result.value.prefix}"`,
        );
      }
    });
  },

  // También agrega estos si no existen:
  // showDeformedShape() {
  //   this.options.showDeflection = !this.options.showDeflection;
  //   this.redraw();
  //   this.sync3D();
  //   this.showMessage(this.options.showDeflection ? "📈 Forma deformada activada" : "📈 Forma deformada desactivada");
  // },

  showForces() {
    this.options.showForces = !this.options.showForces;
    this.redraw();
    this.sync3D();
    this.showMessage(
      this.options.showForces ? "📊 Diagramas de fuerzas activados" : "📊 Diagramas de fuerzas desactivados",
    );
  },

  showStresses() {
    this.options.showFAxiales = !this.options.showFAxiales;
    this.redraw();
    this.sync3D();
    this.showMessage(this.options.showFAxiales ? "🎨 Esfuerzos activados" : "🎨 Esfuerzos desactivados");
  },

  showTable(tableType) {
    if (tableType === "nodes") {
      Swal.fire({
        title: "Tabla de Nodos",
        html: `
                <div class="overflow-x-auto max-h-96">
                    <table class="w-full text-xs">
                        <thead class="bg-gray-700 sticky top-0">
                            <tr><th class="p-2">ID</th><th class="p-2">X (m)</th><th class="p-2">Y (m)</th><th class="p-2">Z (m)</th></tr>
                        </thead>
                        <tbody>
                            ${this.nodes
            .map(
              (n) => `
                                <tr class="border-t">
                                    <td class="p-2">${n.id}</td>
                                    <td class="p-2">${n.position.x.toFixed(3)}</td>
                                    <td class="p-2">${n.position.y.toFixed(3)}</td>
                                    <td class="p-2">${(n.position.z || 0).toFixed(3)}</td>
                                </tr>
                            `,
            )
            .join("")}
                            ${this.nodes.length === 0 ? '<tr><td colspan="4" class="p-4 text-center text-gray-400">No hay nodos</td></tr>' : ""}
                        </tbody>
                    </table>
                </div>
            `,
        width: "600px",
      });
    } else if (tableType === "elements") {
      Swal.fire({
        title: "Tabla de Elementos",
        html: `
                <div class="overflow-x-auto max-h-96">
                    <table class="w-full text-xs">
                        <thead class="bg-gray-700 sticky top-0">
                            <tr><th class="p-2">ID</th><th class="p-2">Nodo I</th><th class="p-2">Nodo J</th><th class="p-2">Longitud (m)</th><th class="p-2">Material</th></tr>
                        </thead>
                        <tbody>
                            ${this.shapes
            .map((b) => {
              const dx = b.node1.position.x - b.node2.position.x;
              const dy = b.node1.position.y - b.node2.position.y;
              const length = Math.sqrt(dx * dx + dy * dy).toFixed(3);
              return `
                                    <tr class="border-t">
                                        <td class="p-2">${b.id}</td>
                                        <td class="p-2">${b.node1.id}</td>
                                        <td class="p-2">${b.node2.id}</td>
                                        <td class="p-2">${length}</td>
                                        <td class="p-2">${b.material?.name || "MAT1"}</td>
                                    </tr>
                                `;
            })
            .join("")}
                            ${this.shapes.length === 0 ? '<tr><td colspan="5" class="p-4 text-center text-gray-400">No hay elementos</td></tr>' : ""}
                        </tbody>
                    </table>
                </div>
            `,
        width: "700px",
      });
    } else if (tableType === "reactions") {
      Swal.fire({
        title: "Tabla de Reacciones",
        html: `
                <div class="overflow-x-auto max-h-96">
                    <table class="w-full text-xs">
                        <thead class="bg-gray-700 sticky top-0">
                            <tr><th class="p-2">Nodo</th><th class="p-2">FX (kN)</th><th class="p-2">FY (kN)</th><th class="p-2">MZ (kN-m)</th></tr>
                        </thead>
                        <tbody>
                            <tr><td colspan="4" class="p-4 text-center text-gray-400">Ejecute un análisis para ver reacciones</td></tr>
                        </tbody>
                    </table>
                </div>
            `,
        width: "600px",
      });
    }
  },

  // =================================================
  // ========== MÉTODOS PARA EL MENÚ SELECT ==========
  // ================================================

  selectByPointer() {
    this.showMessage("🖱️ Selección por puntero/ventana");
    // Cambiar al modo de selección por puntero
    // if (this.selectionState) {
    //   this.setState(this.selectionState);
    // }
  },

  // selectByIntersectingLine() {
  //   this.showMessage("📏 Selección por línea de intersección - Próximamente");
  // },

  // selectByXYPlane() {
  //   this.showMessage("📐 Selección en plano XY - Próximamente");
  // },

  // selectByXZPlane() {
  //   this.showMessage("📐 Selección en plano XZ - Próximamente");
  // },

  // selectByYZPlane() {
  //   this.showMessage("📐 Selección en plano YZ - Próximamente");
  // },

  selectByGroups() {
    this.showMessage("👥 Selección por grupos - Próximamente");
  },

  selectByFrameSections() {
    this.showMessage("📐 Selección por secciones de pórtico - Próximamente");
  },

  // selectByWallSlabSections() {
  //   this.showMessage("🧱 Selección por secciones de losa/muro/deck - Próximamente");
  // },

  selectByLinkProperties() {
    this.showMessage("🔗 Selección por propiedades de enlace - Próximamente");
  },

  selectByLineObjectType() {
    this.showMessage("━━ Selección por tipo de objeto lineal - Próximamente");
  },

  selectByAreaObjectType() {
    this.showMessage("◻️ Selección por tipo de objeto de área - Próximamente");
  },

  selectByPierID() {
    this.showMessage("🏢 Selección por Pier ID - Próximamente");
  },

  selectBySpandrelID() {
    this.showMessage("📊 Selección por Spandrel ID - Próximamente");
  },

  selectByStoryLevel() {
    // Mostrar diálogo para seleccionar nivel de piso
    if (this.stories && this.stories.length > 0) {
      let storyNames = this.stories.map((s) => s.name);
      Swal.fire({
        title: "Seleccionar por Nivel de Piso",
        input: "select",
        inputOptions: storyNames.reduce((acc, story) => {
          acc[story] = story;
          return acc;
        }, {}),
        inputPlaceholder: "Seleccione un nivel",
        showCancelButton: true,
        confirmButtonText: "Seleccionar",
        cancelButtonText: "Cancelar",
      }).then((result) => {
        if (result.isConfirmed && result.value) {
          let selectedStory = this.stories.find((s) => s.name === result.value);
          if (selectedStory) {
            this.selectNodesByHeight(selectedStory.elevation - 0.1, selectedStory.elevation + 0.1);
            this.showMessage(`📐 Seleccionados elementos en nivel ${selectedStory.name}`);
          }
        }
      });
    } else {
      this.showMessage("📐 Selección por nivel de piso - No hay niveles definidos");
    }
  },

  deselect() {
    this.clearAllSelections();
    this.redraw();
    this.sync3D();
    this.showMessage("❌ Elementos deseleccionados");
  },

  getPreviousSelection() {
    this.showMessage("⏪ Obtener selección anterior - Próximamente");
  },

  // ========== MÉTODOS PARA DESELECCIONAR (SUBMENÚ DE SELECT) ==========

  deselectByPointer() {
    if (this.selectionState) {
      // Cambiar al modo de deselección por puntero
      this.showMessage("🖱️ Deseleccionar por puntero/ventana");
    }
  },

  deselectByIntersectingLine() {
    this.showMessage("📏 Deseleccionar usando línea de intersección - Próximamente");
  },

  // deselectByXYPlane() {
  //   this.showMessage("📐 Deseleccionar en plano XY - Próximamente");
  // },

  // deselectByXZPlane() {
  //   this.showMessage("📐 Deseleccionar en plano XZ - Próximamente");
  // },

  // deselectByYZPlane() {
  //   this.showMessage("📐 Deseleccionar en plano YZ - Próximamente");
  // },

  deselectByGroups() {
    this.showMessage("👥 Deseleccionar por grupos - Próximamente");
  },

  deselectByFrameSections() {
    this.showMessage("📐 Deseleccionar por secciones de pórtico - Próximamente");
  },

  deselectAll() {
    this.clearAllSelections();
    this.redraw();
    this.sync3D();
    this.showMessage("❌ Todos los elementos deseleccionados");
  },

  // =================================================
  // ========== MÉTODOS PARA EL MENÚ ANALYZE ==========
  // =================================================

  checkModel() {
    window.dispatchEvent(new CustomEvent("open-check-model-modal"));
  },

  setAnalysisOptions() {
    window.dispatchEvent(new CustomEvent("open-analysis-options-modal"));
  },

  // =================================================
  // ========== ANALYZE > RUN ANALYSIS ===============
  // =================================================

  ensureRunAnalysisOptions() {
    if (!this.analysisOptions) {
      this.analysisOptions = {};
    }

    this.analysisOptions = {
      enabled: this.analysisOptions.enabled ?? true,
      analysisType: this.analysisOptions.analysisType || "full3d",
      solverType: this.analysisOptions.solverType || "linear_static",
      runStaticAnalysis: this.analysisOptions.runStaticAnalysis ?? true,
      considerSelfWeight: this.analysisOptions.considerSelfWeight ?? true,
      analysisStatus: this.analysisOptions.analysisStatus || "not_run",

      dof: {
        ux: this.analysisOptions.dof?.ux ?? true,
        uy: this.analysisOptions.dof?.uy ?? true,
        uz: this.analysisOptions.dof?.uz ?? true,
        rx: this.analysisOptions.dof?.rx ?? true,
        ry: this.analysisOptions.dof?.ry ?? true,
        rz: this.analysisOptions.dof?.rz ?? true,
      },

      dynamicAnalysis: {
        enabled: this.analysisOptions.dynamicAnalysis?.enabled ?? true,
      },

      dynamicParams: {
        ...(this.dynamicParams || {}),
        ...(this.analysisOptions.dynamicParams || {}),
      },

      pDelta: {
        enabled: this.analysisOptions.pDelta?.enabled ?? false,
      },

      pDeltaParams: {
        method: this.analysisOptions.pDeltaParams?.method || "iterative",
        maxIterations: Number(this.analysisOptions.pDeltaParams?.maxIterations || 1),
        tolerance: this.analysisOptions.pDeltaParams?.tolerance || "1.000E-03",
        loads: Array.isArray(this.analysisOptions.pDeltaParams?.loads)
          ? this.analysisOptions.pDeltaParams.loads
          : [{ name: "DEAD", scale: 1 }],
      },

      dbAccess: {
        enabled: this.analysisOptions.dbAccess?.enabled ?? false,
        filename: this.analysisOptions.dbAccess?.filename || "analysis_output",
      },

      lastModelCheck: this.analysisOptions.lastModelCheck || null,
      updatedAt: this.analysisOptions.updatedAt || null,
    };

    return this.analysisOptions;
  },

  getRunAnalysisNodes() {
    return Array.isArray(this.nodes) ? this.nodes : [];
  },

  getRunAnalysisFrames() {
    return (this.shapes || []).filter((frame) => {
      return frame?.node1 && frame?.node2;
    });
  },

  getRunAnalysisPoint(obj) {
    const p = obj?.position || obj || {};

    return {
      x: Number(p.x || 0),
      y: Number(p.y || 0),
      z: Number(p.z || 0),
    };
  },

  getRunAnalysisDistance(p1, p2) {
    const dx = Number(p2.x || 0) - Number(p1.x || 0);
    const dy = Number(p2.y || 0) - Number(p1.y || 0);
    const dz = Number(p2.z || 0) - Number(p1.z || 0);

    return Math.sqrt(dx * dx + dy * dy + dz * dz);
  },

  getRunAnalysisFrameLength(frame) {
    if (!frame?.node1?.position || !frame?.node2?.position) return 0;

    return this.getRunAnalysisDistance(
      this.getRunAnalysisPoint(frame.node1),
      this.getRunAnalysisPoint(frame.node2)
    );
  },

  nodeHasRunAnalysisRestraint(node) {
    const r = node?.restraints || node?.constraints;

    if (!r) return false;

    return (
      r.ux === true ||
      r.uy === true ||
      r.uz === true ||
      r.rx === true ||
      r.ry === true ||
      r.rz === true
    );
  },

  nodeHasRunAnalysisSpring(node) {
    const springs = node?.pointSprings || node?.springs;
    const k = springs?.stiffness;

    if (!k) return false;

    return (
      Number(k.ux || 0) !== 0 ||
      Number(k.uy || 0) !== 0 ||
      Number(k.uz || 0) !== 0 ||
      Number(k.rx || 0) !== 0 ||
      Number(k.ry || 0) !== 0 ||
      Number(k.rz || 0) !== 0
    );
  },

  getRunAnalysisLoadSummary() {
    const nodes = this.getRunAnalysisNodes();
    const frames = this.getRunAnalysisFrames();

    let jointLoads = 0;
    let frameLoads = 0;
    let legacyForces = 0;

    const countUniqueLoads = (object, fields) => {
      const seen = new Set();

      fields.forEach((field) => {
        const loads = object?.[field];

        if (!Array.isArray(loads)) return;

        loads.forEach((load) => {
          seen.add(JSON.stringify({
            id: load?.id || null,
            type: load?.type || null,
            loadCase: load?.loadCase || null,
            forces: load?.forces || null,
            value: load?.value ?? null,
            startValue: load?.startValue ?? null,
            endValue: load?.endValue ?? null,
            direction: load?.direction || null,
          }));
        });
      });

      return seen.size;
    };

    nodes.forEach((node) => {
      jointLoads += countUniqueLoads(node, ["pointLoads", "jointLoads", "loads"]);

      const f = node.force || {};
      const hasLegacyForce =
        Number(f.fx || f.Fx || 0) !== 0 ||
        Number(f.fy || f.Fy || 0) !== 0 ||
        Number(f.fz || f.Fz || 0) !== 0 ||
        Number(f.mx || f.Mx || 0) !== 0 ||
        Number(f.my || f.My || 0) !== 0 ||
        Number(f.mz || f.Mz || 0) !== 0;

      if (hasLegacyForce) legacyForces++;
    });

    frames.forEach((frame) => {
      frameLoads += countUniqueLoads(frame, ["frameLoads", "lineLoads", "loads"]);
    });

    return {
      jointLoads,
      frameLoads,
      legacyForces,
      totalLoads: jointLoads + frameLoads + legacyForces,
    };
  },

  getRunAnalysisReadiness() {
    const nodes = this.getRunAnalysisNodes();
    const frames = this.getRunAnalysisFrames();
    const areas = Array.isArray(this.areas) ? this.areas : [];

    const errors = [];
    const warnings = [];

    if (this.modelCheck && this.modelCheck.canRunAnalysis === false) {
      errors.push("Check Model tiene errores. Corrige el modelo antes de ejecutar Run Analysis.");
    }

    if (nodes.length === 0 && frames.length === 0 && areas.length === 0) {
      errors.push("El modelo está vacío. No hay nodos, barras ni áreas para analizar.");
    }

    const invalidFrames = (this.shapes || []).filter((frame) => {
      return !frame?.node1 || !frame?.node2;
    });

    if (invalidFrames.length > 0) {
      errors.push(`Existen ${invalidFrames.length} elemento(s) Frame / Line sin nodos válidos.`);
    }

    const zeroLengthFrames = frames.filter((frame) => {
      return this.getRunAnalysisFrameLength(frame) <= 0.000001;
    });

    if (zeroLengthFrames.length > 0) {
      errors.push(`Existen ${zeroLengthFrames.length} elemento(s) Frame / Line con longitud cero.`);
    }

    const supports = nodes.filter((node) => {
      return this.nodeHasRunAnalysisRestraint(node) || this.nodeHasRunAnalysisSpring(node);
    });

    if (frames.length > 0 && supports.length === 0) {
      errors.push("No se encontraron apoyos, restricciones o resortes. El modelo puede ser inestable.");
    }

    const loadSummary = this.getRunAnalysisLoadSummary();

    if (frames.length > 0 && loadSummary.totalLoads === 0) {
      warnings.push("No se encontraron cargas asignadas. El análisis se ejecutará con resultados mínimos.");
    }

    return {
      canRun: errors.length === 0,
      errors,
      warnings,
      nodes,
      frames,
      areas,
      supports,
      loadSummary,
    };
  },

  async runAnalysis() {
    this.ensureRunAnalysisOptions();

    const readiness = this.getRunAnalysisReadiness();

    if (!readiness.canRun) {
      this.analysisOptions.analysisStatus = "failed";

      const html = `
      <div style="text-align:left; font-size:13px;">
        <p>Run Analysis no puede continuar por los siguientes errores:</p>
        <ul style="margin-top:10px; padding-left:18px;">
          ${readiness.errors.map((error) => `<li>${error}</li>`).join("")}
        </ul>
        <p style="margin-top:12px; color:#777;">
          Recomendación: ejecute Analyze &gt; Check Model y corrija los errores del modelo.
        </p>
      </div>
    `;

      if (typeof Swal !== "undefined") {
        await Swal.fire({
          icon: "error",
          title: "Run Analysis bloqueado",
          html,
          confirmButtonText: "Entendido",
        });
      } else {
        this.showMessage?.("Run Analysis bloqueado. Revise Check Model.", "warning");
      }

      console.warn("❌ Analyze > Run Analysis bloqueado:", readiness);
      return false;
    }

    this.analysisOptions.analysisStatus = "running";
    this.analysisOptions.startedAt = new Date().toISOString();

    if (typeof Swal !== "undefined") {
      Swal.fire({
        title: "Run Analysis",
        html: "Ejecutando análisis inicial del modelo...",
        allowOutsideClick: false,
        didOpen: () => Swal.showLoading(),
      });
    }

    await new Promise((resolve) => setTimeout(resolve, 350));

    const results = this.performInitialRunAnalysis(readiness);

    this.applyInitialRunAnalysisResults(results);

    this.analysisOptions.analysisStatus = "completed";
    this.analysisOptions.completedAt = new Date().toISOString();

    this.redraw?.();

    requestAnimationFrame(() => {
      this.sync3D?.();
    });

    if (typeof Swal !== "undefined") {
      await Swal.fire({
        icon: "success",
        title: "Analysis Complete",
        html: `
        <div style="text-align:left; font-size:13px;">
          <p><b>Estado:</b> Completed</p>
          <p><b>Nodos analizados:</b> ${results.summary.nodes}</p>
          <p><b>Frames analizados:</b> ${results.summary.frames}</p>
          <p><b>Cargas detectadas:</b> ${results.summary.loads}</p>
          <p><b>Desplazamiento máximo estimado:</b> ${Number(results.summary.maxDisplacement || 0).toExponential(3)} m</p>
          <p><b>Fuerza axial máxima estimada:</b> ${Number(results.summary.maxAxial || 0).toFixed(3)}</p>
          <div style="margin-top:10px; color:#777; font-size:12px;">
            Versión inicial: resultados simplificados para conectar Analyze con Display.
          </div>
        </div>
      `,
        confirmButtonText: "OK",
      });
    }

    this.showMessage?.("Analyze: Run Analysis completado.");

    console.log("✅ Analyze > Run Analysis:", results);

    return true;
  },

  performInitialRunAnalysis(readiness) {
    const options = this.ensureRunAnalysisOptions();

    const nodes = readiness.nodes;
    const frames = readiness.frames;

    const nodeResults = {};
    const frameResults = {};
    const reactions = {};

    const nodeConnectivity = new Map();

    nodes.forEach((node) => {
      nodeConnectivity.set(String(node.id), []);
    });

    frames.forEach((frame) => {
      if (frame.node1?.id !== undefined) {
        nodeConnectivity.get(String(frame.node1.id))?.push(frame);
      }

      if (frame.node2?.id !== undefined) {
        nodeConnectivity.get(String(frame.node2.id))?.push(frame);
      }
    });

    let maxDisplacement = 0;
    let maxAxial = 0;

    nodes.forEach((node, index) => {
      const nodeId = node.id || index + 1;

      const isSupported =
        this.nodeHasRunAnalysisRestraint(node) ||
        this.nodeHasRunAnalysisSpring(node);

      const loadVector = this.getNodeResultantLoadForRunAnalysis(node);
      const connectedFrames = nodeConnectivity.get(String(node.id)) || [];

      const stiffnessBase = Math.max(connectedFrames.length, 1) * 10000;

      const loadMagnitude = Math.sqrt(
        loadVector.fx * loadVector.fx +
        loadVector.fy * loadVector.fy +
        loadVector.fz * loadVector.fz
      );

      const factor = isSupported ? 0 : loadMagnitude / stiffnessBase;

      const displacement = {
        ux: options.dof.ux ? factor * Math.sign(loadVector.fx || 0) : 0,
        uy: options.dof.uy ? factor * Math.sign(loadVector.fy || 0) : 0,
        uz: options.dof.uz ? factor * Math.sign(loadVector.fz || 0) : 0,
        rx: options.dof.rx ? factor * 0.001 : 0,
        ry: options.dof.ry ? factor * 0.001 : 0,
        rz: options.dof.rz ? factor * 0.001 : 0,
      };

      const displacementMagnitude = Math.sqrt(
        displacement.ux * displacement.ux +
        displacement.uy * displacement.uy +
        displacement.uz * displacement.uz
      );

      maxDisplacement = Math.max(maxDisplacement, displacementMagnitude);

      nodeResults[nodeId] = {
        nodeId,
        position: this.getRunAnalysisPoint(node),
        displacement,
        displacementMagnitude,
        loadVector,
        supported: isSupported,
      };

      node.analysisDisplacement = { ...displacement };
      node.displacement = { ...displacement };
      node.deflection = displacementMagnitude;

      if (isSupported) {
        reactions[nodeId] = {
          nodeId,
          rxnFx: -loadVector.fx,
          rxnFy: -loadVector.fy,
          rxnFz: -loadVector.fz,
          rxnMx: -loadVector.mx,
          rxnMy: -loadVector.my,
          rxnMz: -loadVector.mz,
        };

        node.reaction = reactions[nodeId];
      }
    });

    frames.forEach((frame, index) => {
      const frameId = frame.id || index + 1;
      const length = Math.max(this.getRunAnalysisFrameLength(frame), 0.000001);

      const frameLoad = this.getFrameResultantLoadForRunAnalysis(frame);

      const n1 = nodeResults[frame.node1?.id];
      const n2 = nodeResults[frame.node2?.id];

      const area = this.getFrameAreaForRunAnalysis(frame);
      const elasticModulus = this.getFrameElasticModulusForRunAnalysis(frame);

      const relativeDisp =
        (n2?.displacementMagnitude || 0) -
        (n1?.displacementMagnitude || 0);

      const axialFromDeformation =
        elasticModulus * area * (relativeDisp / length);

      const axialFromLoads = frameLoad.total / Math.max(length, 1);

      const axial = axialFromDeformation + axialFromLoads;
      const shear2 = frameLoad.vertical * 0.5;
      const shear3 = frameLoad.horizontal * 0.5;
      const moment2 = shear2 * length / 4;
      const moment3 = shear3 * length / 4;
      const torsion = frameLoad.torsion || 0;

      maxAxial = Math.max(maxAxial, Math.abs(axial));

      const result = {
        frameId,
        length,
        axial,
        shear2,
        shear3,
        moment2,
        moment3,
        torsion,
        load: frameLoad,
        section: frame.sectionName || frame.sectionId || frame.frameSection?.name || "Sin sección",
      };

      frameResults[frameId] = result;

      frame.fAxial = axial;
      frame.analysisForces = { ...result };
      frame.internalForces = { ...result };
    });

    const modalResults = this.calculateInitialModalRunResults(nodes, frames, options);

    return {
      type: "initial-analysis-results",
      status: "completed",
      solverType: options.solverType,
      analysisType: options.analysisType,
      runStaticAnalysis: options.runStaticAnalysis,
      dynamicAnalysis: options.dynamicAnalysis,
      pDelta: options.pDelta,
      ranAt: new Date().toISOString(),

      summary: {
        nodes: nodes.length,
        frames: frames.length,
        areas: readiness.areas.length,
        stories: (this.stories || []).length,
        loads: readiness.loadSummary.totalLoads,
        supports: readiness.supports.length,
        maxDisplacement,
        maxAxial,
        warnings: readiness.warnings,
      },

      nodes: nodeResults,
      frames: frameResults,
      reactions,
      modalResults,
    };
  },

  getNodeResultantLoadForRunAnalysis(node) {
    const result = {
      fx: 0,
      fy: 0,
      fz: 0,
      mx: 0,
      my: 0,
      mz: 0,
    };

    const addForceObject = (forces = {}) => {
      result.fx += Number(forces.fx ?? forces.Fx ?? 0);
      result.fy += Number(forces.fy ?? forces.Fy ?? 0);
      result.fz += Number(forces.fz ?? forces.Fz ?? 0);
      result.mx += Number(forces.mx ?? forces.Mx ?? 0);
      result.my += Number(forces.my ?? forces.My ?? 0);
      result.mz += Number(forces.mz ?? forces.Mz ?? 0);
    };

    if (node?.force) {
      addForceObject(node.force);
    }

    const loads = [
      ...(Array.isArray(node?.pointLoads) ? node.pointLoads : []),
      ...(Array.isArray(node?.jointLoads) ? node.jointLoads : []),
      ...(Array.isArray(node?.loads) ? node.loads : []),
    ];

    const seen = new Set();

    loads.forEach((load) => {
      const key = JSON.stringify(load);
      if (seen.has(key)) return;
      seen.add(key);

      if (load.type === "force" && load.forces) {
        addForceObject(load.forces);
      }

      if (load.type === "ground-displacement" && load.displacements) {
        result.fx += Number(load.displacements.ux || 0) * 1000;
        result.fy += Number(load.displacements.uy || 0) * 1000;
        result.fz += Number(load.displacements.uz || 0) * 1000;
      }

      if (load.type === "temperature" && load.temperature) {
        result.fz += Number(load.temperature.deltaT || 0) * 0.1;
      }
    });

    return result;
  },

  getFrameResultantLoadForRunAnalysis(frame) {
    const result = {
      total: 0,
      vertical: 0,
      horizontal: 0,
      torsion: 0,
    };

    const length = Math.max(this.getRunAnalysisFrameLength(frame), 1);

    const loads = [
      ...(Array.isArray(frame?.frameLoads) ? frame.frameLoads : []),
      ...(Array.isArray(frame?.lineLoads) ? frame.lineLoads : []),
      ...(Array.isArray(frame?.loads) ? frame.loads : []),
    ];

    const seen = new Set();

    loads.forEach((load) => {
      const key = JSON.stringify(load);
      if (seen.has(key)) return;
      seen.add(key);

      if (load.type === "point") {
        const value = Number(load.value || 0);
        result.total += Math.abs(value);

        if (String(load.direction || "").toUpperCase().includes("Z")) {
          result.vertical += value;
        } else {
          result.horizontal += value;
        }
      }

      if (load.type === "distributed") {
        const w1 = Number(load.startValue ?? load.value ?? 0);
        const w2 = Number(load.endValue ?? load.value ?? 0);
        const total = ((w1 + w2) / 2) * length;

        result.total += Math.abs(total);

        if (String(load.direction || "").toUpperCase().includes("Z")) {
          result.vertical += total;
        } else {
          result.horizontal += total;
        }
      }

      if (load.type === "temperature") {
        result.total += Math.abs(Number(load.temperature?.deltaT || 0)) * 0.1;
      }
    });

    return result;
  },

  getFrameAreaForRunAnalysis(frame) {
    const section =
      frame?.frameSection ||
      frame?.section ||
      frame?.assignment?.frameSection ||
      null;

    const sectionArea = Number(
      section?.A ??
      section?.area ??
      section?.Area ??
      0
    );

    if (sectionArea > 0) return sectionArea;

    const frameArea = Number(frame?.A ?? frame?._A ?? 0);

    if (frameArea > 0) return frameArea;

    return 0.01;
  },

  getFrameElasticModulusForRunAnalysis(frame) {
    const section =
      frame?.frameSection ||
      frame?.section ||
      null;

    const eValue = Number(
      frame?.E ??
      section?.E ??
      section?.elasticModulus ??
      this.globalE ??
      210000
    );

    return Number.isFinite(eValue) && eValue > 0 ? eValue : 210000;
  },

  calculateInitialModalRunResults(nodes, frames, options) {
    if (!options.dynamicAnalysis?.enabled) {
      return {
        enabled: false,
        modes: [],
      };
    }

    const numModes = Math.max(
      1,
      Number(options.dynamicParams?.numModes || this.dynamicParams?.numModes || 3)
    );

    const totalMass = Math.max(nodes.length, 1);
    const totalStiffness = Math.max(frames.length, 1) * 10000;

    const baseFrequency = Math.sqrt(totalStiffness / totalMass) / (2 * Math.PI);

    const modes = [];

    for (let i = 1; i <= numModes; i++) {
      const frequency = baseFrequency * i;
      const period = frequency > 0 ? 1 / frequency : 0;

      modes.push({
        mode: i,
        frequency,
        period,
        massParticipationX: Math.min(100, (100 / numModes) * i),
        massParticipationY: Math.min(100, (95 / numModes) * i),
        massParticipationZ: Math.min(100, (80 / numModes) * i),
      });
    }

    return {
      enabled: true,
      analysisType: options.dynamicParams?.analysisType || "eigenvectors",
      numModes,
      modes,
    };
  },

  applyInitialRunAnalysisResults(results) {
    this.analysisResults = JSON.parse(JSON.stringify(results));

    this.K_Global_Reducido = [
      {
        type: "initial-global-stiffness-summary",
        frames: results.summary.frames,
        estimatedStiffness: Math.max(results.summary.frames, 1) * 10000,
      },
    ];

    this.Fuerzas_Globales_Reducidas = [
      {
        type: "initial-global-force-summary",
        totalLoads: results.summary.loads,
        maxAxial: results.summary.maxAxial,
      },
    ];

    this.D_Global_Reducido = Object.values(results.nodes || {}).map((nodeResult) => {
      return {
        nodeId: nodeResult.nodeId,
        ...nodeResult.displacement,
      };
    });

    const nodeResultsList = Object.values(results.nodes || {});

    this.deflecciones = nodeResultsList.map((nodeResult) => {
      const d = nodeResult.displacement || {};

      return {
        nodeId: nodeResult.nodeId,
        id: nodeResult.nodeId,

        value: Number(nodeResult.displacementMagnitude || 0),

        displacement: {
          ux: Number(d.ux || 0),
          uy: Number(d.uy || 0),
          uz: Number(d.uz || 0),
          rx: Number(d.rx || 0),
          ry: Number(d.ry || 0),
          rz: Number(d.rz || 0),
        },

        // Compatibilidad con renderers que esperan arrays
        displacements: [
          Number(d.ux || 0),
          Number(d.uy || 0),
          Number(d.uz || 0),
        ],

        desplazamiento: [
          Number(d.ux || 0),
          Number(d.uy || 0),
          Number(d.uz || 0),
        ],

        dx: Number(d.ux || 0),
        dy: Number(d.uy || 0),
        dz: Number(d.uz || 0),

        ux: Number(d.ux || 0),
        uy: Number(d.uy || 0),
        uz: Number(d.uz || 0),
      };
    });

    this.desplazamientosPosition = Object.values(results.nodes || {}).map((nodeResult) => {
      const p = nodeResult.position || {};
      const d = nodeResult.displacement || {};

      return {
        nodeId: nodeResult.nodeId,
        x: Number(p.x || 0) + Number(d.ux || 0),
        y: Number(p.y || 0) + Number(d.uy || 0),
        z: Number(p.z || 0) + Number(d.uz || 0),
      };
    });

    this.matrizDesplazamiento = this.D_Global_Reducido.map((item) => {
      return [
        item.nodeId,
        item.ux || 0,
        item.uy || 0,
        item.uz || 0,
        item.rx || 0,
        item.ry || 0,
        item.rz || 0,
      ];
    });

    this.displayOptions = {
      ...(this.displayOptions || {}),
      analysisResultsAvailable: true,
      lastAnalysisRun: {
        ranAt: results.ranAt,
        status: results.status,
        maxDisplacement: results.summary.maxDisplacement,
        maxAxial: results.summary.maxAxial,
      },
    };

    if (!this.options) {
      this.options = {};
    }

    this.displayOptions.showDeformedShape = false;
    this.displayOptions.showModeShape = false;

    this.options.showDeflection = false;
    this.options.showFAxiales = false;
    this.options.showFAxialesValues = true;
  },

  // =================================================
  // ========== ANALYZE > RESULT STATUS ==============
  // =================================================

  hasCompletedAnalysisResults() {
    return (
      this.analysisOptions?.analysisStatus === "completed" &&
      this.analysisResults &&
      this.displayOptions?.analysisResultsAvailable === true
    );
  },

  showRunAnalysisRequiredMessage(actionLabel = "Display Results") {
    if (typeof Swal !== "undefined") {
      Swal.fire({
        icon: "warning",
        title: "Run Analysis required",
        html: `
        <div style="text-align:left; font-size:13px;">
          <p>Para usar <b>${actionLabel}</b>, primero debes ejecutar:</p>
          <ol style="margin-top:10px; padding-left:18px;">
            <li>Analyze &gt; Check Model...</li>
            <li>Analyze &gt; Run Analysis</li>
          </ol>
          <p style="margin-top:12px; color:#777;">
            Esto evita mostrar resultados inexistentes o desactualizados.
          </p>
        </div>
      `,
        confirmButtonText: "Entendido",
      });
    } else {
      this.showMessage?.("Primero ejecuta Analyze > Run Analysis.", "warning");
    }
  },

  markAnalysisResultsOutdated(reason = "Model changed") {
    if (!this.analysisOptions) {
      this.analysisOptions = {};
    }

    const hadResults =
      this.analysisResults ||
      this.analysisOptions.analysisStatus === "completed";

    if (!hadResults) return;

    this.analysisOptions.analysisStatus = "outdated";
    this.analysisOptions.outdatedReason = reason;
    this.analysisOptions.outdatedAt = new Date().toISOString();

    if (!this.displayOptions) {
      this.displayOptions = {};
    }

    this.displayOptions.analysisResultsAvailable = false;
    this.displayOptions.showDeformedShape = false;
    this.displayOptions.showModeShape = false;
    this.displayOptions.showMemberForces = false;

    if (!this.options) {
      this.options = {};
    }

    this.options.showDeflection = false;
    this.options.showFAxiales = false;
    this.options.showFAxialesValues = false;

    this.redraw?.();

    console.warn("⚠️ Analyze results marked as outdated:", {
      reason,
      analysisStatus: this.analysisOptions.analysisStatus,
    });
  },

  runConstructionSequenceAnalysis() {
    this.showMessage("🏗️ Ejecutando análisis de secuencia de construcción...");
    // Verificar si hay casos de construcción secuencial definidos
    if (
      window.cadSystem &&
      window.cadSystem.sequentialConstruction &&
      window.cadSystem.sequentialConstruction.items &&
      window.cadSystem.sequentialConstruction.items.length > 0
    ) {
      this.showMessage("🏗️ Análisis de secuencia de construcción iniciado");
    } else {
      this.showMessage(
        "⚠️ No hay casos de construcción secuencial definidos. Vaya a Define → Añadir Caso de Construcción Secuencial",
        "warning",
      );
    }
  },

  // Métodos para Ritz
  selectAvailableLoad(idx) {
    this.selectedAvailableLoad = idx;
  },

  selectRitzLoad(idx) {
    this.selectedRitzLoad = idx;
  },

  addToRitzVectors() {
    if (this.selectedAvailableLoad !== null) {
      var loadToAdd = this.availableLoads[this.selectedAvailableLoad];
      // Verificar si ya existe
      var exists = false;
      for (var i = 0; i < this.ritzLoads.length; i++) {
        if (this.ritzLoads[i].name === loadToAdd.name) {
          exists = true;
          break;
        }
      }
      if (!exists) {
        this.ritzLoads.push({ ...loadToAdd });
      }
      this.selectedAvailableLoad = null;
    }
  },

  removeFromRitzVectors() {
    if (this.selectedRitzLoad !== null) {
      this.ritzLoads.splice(this.selectedRitzLoad, 1);
      this.selectedRitzLoad = null;
    }
  },

  // Cargar opciones dinámicas desde cadSystem
  loadDynamicOptions() {
    if (window.cadSystem && window.cadSystem.dynamicParams) {
      this.dynamicParams = window.cadSystem.dynamicParams;
    }
    // Cargar cargas disponibles desde cadSystem
    if (window.cadSystem && window.cadSystem.loadCases && window.cadSystem.loadCases.cases) {
      this.availableLoads = window.cadSystem.loadCases.cases.map((c) => ({ name: c.name, type: c.type }));
    }
  },

  // Guardar parámetros dinámicos
  saveDynamicParams() {
    // Guardar en cadSystem
    if (window.cadSystem) {
      window.cadSystem.dynamicParams = {
        numModes: this.dynamicParams.numModes,
        analysisType: this.dynamicParams.analysisType,
        freqShift: this.dynamicParams.freqShift,
        cutoffFrequency: this.dynamicParams.cutoffFrequency,
        tolerance: this.dynamicParams.tolerance,
        includeResidualModes: this.dynamicParams.includeResidualModes,
        ritzLoads: this.dynamicParams.ritzLoads,
      };
    }
    this.showDynamicParamsDialog = false;
    this.showToastMessage("Parámetros dinámicos guardados", "success");
  },

  loadOptions() {
    if (window.cadSystem && window.cadSystem.analysisOptions) {
      var opts = window.cadSystem.analysisOptions;
      this.analysisType = opts.analysisType || "full3d";
      this.dof = opts.dof || { ux: true, uy: true, uz: true, rx: true, ry: true, rz: true };
      this.dynamicAnalysis = opts.dynamicAnalysis || { enabled: true };
      // Cargar parámetros dinámicos
      if (opts.dynamicParams) {
        this.dynamicParams = opts.dynamicParams;
      }
      this.pDelta = opts.pDelta || { enabled: false };
      this.pDeltaParams = opts.pDeltaParams || {
        iterations: 10,
        tolerance: "1.000E-04",
        includeLargeDisplacements: false,
      };
      this.dbAccess = opts.dbAccess || { enabled: false, filename: "analysis_output" };
    }

    // Cargar cargas disponibles
    if (window.cadSystem && window.cadSystem.loadCases && window.cadSystem.loadCases.cases) {
      this.availableLoads = window.cadSystem.loadCases.cases.map((c) => ({ name: c.name, type: c.type }));
    }
  },

  openDynamicParamsDialog() {
    if (this.dynamicAnalysis.enabled) {
      // Cargar los vectores Ritz existentes
      if (window.cadSystem && window.cadSystem.dynamicParams && window.cadSystem.dynamicParams.ritzLoads) {
        this.dynamicParams.ritzLoads = [...window.cadSystem.dynamicParams.ritzLoads];
      } else {
        this.dynamicParams.ritzLoads = [];
      }
      this.selectedAvailableLoad = null;
      this.selectedRitzLoad = null;
      this.showDynamicParamsDialog = true;
    }
  },

  // ==================================================
  // ========== MÉTODOS PARA EL MENÚ DISPLAY ==========
  // ==================================================

  // showUndeformedShape() {
  //   // Desactivar deformación si estaba activada
  //   this.options.showDeflection = false;
  //   this.redraw();
  //   this.sync3D();
  //   this.showMessage("📐 Mostrando forma no deformada");
  // },

  selectDesignCombos() {
    window.dispatchEvent(new CustomEvent("open-select-design-combinations-modal"));
  },

  displayDesignInfo() {
    window.dispatchEvent(new CustomEvent("open-display-design-info-modal"));
  },

  openDesignOverwrites() {
    window.dispatchEvent(new CustomEvent("open-design-overwrites-modal"));
  },

  showLoadsOnJoints() {
    Swal.fire({
      title: "",
      html: `
            <div class="text-left" style="background-color: #1e1e1e; color: #e5e7eb;">
                <div class="border border-gray-700 rounded p-4 mb-4 flex items-center justify-between gap-4" style="background-color: #1e1e1e;">
                    <label class="text-sm font-bold whitespace-nowrap" style="color: #e5e7eb;">Caso de Carga</label>
                    <div class="relative w-full">
                        <select id="loadCaseSelect" class="w-full bg-[#0c0c0c] border border-gray-600 rounded px-2 py-1 text-sm text-white focus:border-blue-500 outline-none appearance-none cursor-pointer">
                            <option value="DEAD">DEAD</option>
                            <option value="LIVE">LIVE</option>
                            <option value="WIND">WIND</option>
                            <option value="SNOW">SNOW</option>
                            <option value="EARTHQUAKE">EARTHQUAKE</option>
                        </select>
                        <div class="absolute inset-y-0 right-2 flex items-center pointer-events-none text-gray-500">
                            ▼
                        </div>
                    </div>
                </div>

                <fieldset class="border border-gray-700 rounded p-3 flex flex-col gap-2 mb-4" style="background-color: #1e1e1e;">
                    <legend class="text-[11px] text-gray-500 px-2 ml-2 italic">Tipo de Carga</legend>
                    
                    <label class="flex items-center gap-2 text-sm text-gray-600 cursor-not-allowed">
                        <input type="radio" name="loadType" disabled class="accent-gray-700"> Fuerzas
                    </label>
                    <label class="flex items-center gap-2 text-sm text-gray-600 cursor-not-allowed">
                        <input type="radio" name="loadType" disabled class="accent-gray-700"> Desplazamientos
                    </label>
                    <label class="flex items-center gap-2 text-sm text-gray-600 cursor-not-allowed">
                        <input type="radio" name="loadType" disabled class="accent-gray-700"> Valores de Temperatura
                    </label>
                </fieldset>

                <div class="px-1 mb-4">
                    <label class="flex items-center gap-2 text-sm cursor-pointer hover:text-white transition-colors" style="color: #e5e7eb;">
                        <input type="checkbox" id="showLoadValues" checked class="w-4 h-4 accent-blue-600 bg-gray-800 border-gray-600 rounded">
                        Mostrar Valores de Carga
                    </label>
                </div>

                <div class="flex justify-center gap-4 pt-2">
                    <button id="okButton" class="px-8 py-1 text-sm bg-gray-800/50 text-gray-500 border border-gray-700 rounded cursor-not-allowed" disabled>
                        OK
                    </button>
                    <button id="cancelButton" class="px-8 py-1 text-sm bg-gray-800 hover:bg-gray-700 text-gray-200 border border-gray-600 rounded transition-colors shadow-md">
                        Cancelar
                    </button>
                </div>
            </div>
        `,
      width: "380px",
      showConfirmButton: false,
      showCancelButton: false,
      background: "#1e1e1e",
      didOpen: (popup) => {
        // Estilos adicionales para el modal
        popup.style.backgroundColor = "#1e1e1e";
        popup.style.border = "1px solid #374151";
        popup.style.borderRadius = "0.5rem";

        // Botón Cancelar
        const cancelBtn = popup.querySelector("#cancelButton");
        cancelBtn.addEventListener("click", () => {
          Swal.close();
        });

        // Select de caso de carga
        const loadCaseSelect = popup.querySelector("#loadCaseSelect");
        const showValuesCheckbox = popup.querySelector("#showLoadValues");

        loadCaseSelect.addEventListener("change", (e) => {
          this.showMessage(`📊 Mostrando cargas en nudos/puntos para caso: ${e.target.value}`);
        });

        showValuesCheckbox.addEventListener("change", (e) => {
          this.options.showFAxialesValues = e.target.checked;
        });
      },
    }).then(() => {
      // Al cerrar el modal, aplicar la visualización
      this.options.showForces = true;
      this.redraw();
      this.sync3D();
      this.showMessage(`📊 Mostrando cargas en nudos/puntos`);
    });
  },

  showLoadsOnFrames() {
    Swal.fire({
      title: "",
      html: `
            <div class="text-left" style="background-color: #1e1e1e; color: #e5e7eb;">
                <div class="border border-gray-700 rounded p-4 mb-4 flex items-center justify-between gap-4" style="background-color: #1e1e1e;">
                    <label class="text-sm font-bold whitespace-nowrap" style="color: #e5e7eb;">Caso de Carga</label>
                    <div class="relative w-full">
                        <select id="loadCaseSelect" class="w-full bg-[#0c0c0c] border border-gray-600 rounded px-2 py-1 text-sm text-white focus:border-blue-500 outline-none appearance-none cursor-pointer">
                            <option value="DEAD">DEAD</option>
                            <option value="LIVE">LIVE</option>
                            <option value="WIND">WIND</option>
                            <option value="SNOW">SNOW</option>
                            <option value="EARTHQUAKE">EARTHQUAKE</option>
                        </select>
                        <div class="absolute inset-y-0 right-2 flex items-center pointer-events-none text-gray-500">
                            ▼
                        </div>
                    </div>
                </div>

                <fieldset class="border border-gray-700 rounded p-3 flex flex-col gap-2 mb-4" style="background-color: #1e1e1e;">
                    <legend class="text-[11px] text-gray-500 px-2 ml-2 italic">Tipo de Carga</legend>
                    
                    <label class="flex items-center gap-2 text-sm text-gray-600 cursor-not-allowed">
                        <input type="radio" name="loadType" disabled class="accent-gray-700"> Carga en tramo aplicada directamente al objeto (Fuerzas)
                    </label>
                    <label class="flex items-center gap-2 text-sm text-gray-600 cursor-not-allowed">
                        <input type="radio" name="loadType" disabled class="accent-gray-700"> Carga en tramo aplicada directamente al objeto (Momentos)
                    </label>
                    <label class="flex items-center gap-2 text-sm text-gray-600 cursor-not-allowed">
                        <input type="radio" name="loadType" disabled class="accent-gray-700"> Carga total tributaria al objeto de línea (Fuerzas)
                    </label>
                    <label class="flex items-center gap-2 text-sm text-gray-600 cursor-not-allowed">
                        <input type="radio" name="loadType" disabled class="accent-gray-700"> Carga total tributaria al objeto de línea (Momentos)
                    </label>
                    <label class="flex items-center gap-2 text-sm text-gray-600 cursor-not-allowed">
                        <input type="radio" name="loadType" disabled class="accent-gray-700"> Valores de Temperatura
                    </label>
                    <label class="flex items-center gap-2 text-sm text-gray-600 cursor-not-allowed">
                        <input type="radio" name="loadType" disabled class="accent-gray-700"> Cargas de viento en estructura abierta
                    </label>
                </fieldset>

                <div class="px-1 mb-4">
                    <label class="flex items-center gap-2 text-sm cursor-pointer hover:text-white transition-colors" style="color: #e5e7eb;">
                        <input type="checkbox" id="showLoadValues" checked class="w-4 h-4 accent-blue-600 bg-gray-800 border-gray-600 rounded">
                        Incluir Cargas Puntuales
                    </label>
                    <label class="flex items-center gap-2 text-sm cursor-pointer hover:text-white transition-colors" style="color: #e5e7eb;">
                        <input type="checkbox" id="showLoadValues" checked class="w-4 h-4 accent-blue-600 bg-gray-800 border-gray-600 rounded">
                        Mostrar Valores de Carga
                    </label>
                </div>

                <div class="flex justify-center gap-4 pt-2">
                    <button id="okButton" class="px-8 py-1 text-sm bg-gray-800/50 text-gray-500 border border-gray-700 rounded cursor-not-allowed" disabled>
                        OK
                    </button>
                    <button id="cancelButton" class="px-8 py-1 text-sm bg-gray-800 hover:bg-gray-700 text-gray-200 border border-gray-600 rounded transition-colors shadow-md">
                        Cancelar
                    </button>
                </div>
            </div>
        `,
      width: "380px",
      showConfirmButton: false,
      showCancelButton: false,
      background: "#1e1e1e",
      didOpen: (popup) => {
        popup.style.backgroundColor = "#1e1e1e";
        popup.style.border = "1px solid #374151";
        popup.style.borderRadius = "0.5rem";

        const cancelBtn = popup.querySelector("#cancelButton");
        cancelBtn.addEventListener("click", () => {
          Swal.close();
        });

        const loadCaseSelect = popup.querySelector("#loadCaseSelect");
        loadCaseSelect.addEventListener("change", (e) => {
          this.showMessage(`📊 Mostrando cargas en elementos frame/línea para caso: ${e.target.value}`);
        });
      },
    }).then(() => {
      this.options.showForces = true;
      this.redraw();
      this.sync3D();
      this.showMessage(`📊 Mostrando cargas en elementos frame/línea`);
    });
  },

  // showDeformedShape() {
  //   // Diálogo para configurar la forma deformada
  //   Swal.fire({
  //     title: "Mostrar Forma Deformada",
  //     html: `
  //           <div class="text-left">
  //               <div class="mb-3">
  //                   <label class="block text-xs font-semibold text-gray-400 mb-2">Factor de Escala</label>
  //                   <input type="range" id="deflectionScale" min="1" max="1000" value="100" class="w-full">
  //                   <div class="flex justify-between text-xs text-gray-500 mt-1">
  //                       <span>1</span><span>100</span><span>200</span><span>500</span><span>1000</span>
  //                   </div>
  //               </div>
  //               <div class="mb-3">
  //                   <label class="flex items-center gap-2">
  //                       <input type="checkbox" id="showUndefShape" checked>
  //                       <span class="text-sm text-gray-300">Mostrar forma no deformada como referencia</span>
  //                   </label>
  //               </div>
  //               <div class="mb-3">
  //                   <label class="flex items-center gap-2">
  //                       <input type="checkbox" id="animateDeformation">
  //                       <span class="text-sm text-gray-300">Animar deformación</span>
  //                   </label>
  //               </div>
  //           </div>
  //       `,
  //     confirmButtonText: "Aplicar",
  //     cancelButtonText: "Cancelar",
  //     showCancelButton: true,
  //     preConfirm: () => {
  //       return {
  //         scale: parseInt(document.getElementById("deflectionScale").value),
  //         showUndefShape: document.getElementById("showUndefShape").checked,
  //         animate: document.getElementById("animateDeformation").checked,
  //       };
  //     },
  //   }).then((result) => {
  //     if (result.isConfirmed) {
  //       this.options.showDeflection = true;
  //       this.options.deflectionScale = result.value.scale;
  //       this.redraw();
  //       this.sync3D();
  //       this.showMessage(`📈 Mostrando forma deformada (escala: ${result.value.scale})`);
  //     }
  //   });
  // },

  showModeShape() {
    Swal.fire({
      title: "Mostrar Forma Modal",
      html: `
            <div class="text-left">
                <div class="mb-3">
                    <label class="block text-xs font-semibold text-gray-400 mb-2">Número de Modo</label>
                    <select id="modeNumber" class="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white text-sm">
                        <option value="1">Modo 1 - Frecuencia: 2.35 Hz</option>
                        <option value="2">Modo 2 - Frecuencia: 3.12 Hz</option>
                        <option value="3">Modo 3 - Frecuencia: 4.87 Hz</option>
                        <option value="4">Modo 4 - Frecuencia: 5.23 Hz</option>
                        <option value="5">Modo 5 - Frecuencia: 6.78 Hz</option>
                    </select>
                </div>
                <div class="mb-3">
                    <label class="block text-xs font-semibold text-gray-400 mb-2">Factor de Escala</label>
                    <input type="range" id="modeScale" min="1" max="500" value="100" class="w-full">
                </div>
                <div class="mb-3">
                    <label class="flex items-center gap-2">
                        <input type="checkbox" id="animateMode" checked>
                        <span class="text-sm text-gray-300">Animar vibración</span>
                    </label>
                </div>
            </div>
        `,
      confirmButtonText: "Mostrar",
      cancelButtonText: "Cancelar",
      showCancelButton: true,
    }).then((result) => {
      if (result.isConfirmed) {
        this.showMessage("🎵 Mostrando forma modal - Próximamente");
      }
    });
  },

  showMemberForces() {
    Swal.fire({
      title: "Diagramas de Fuerzas/Esfuerzos de Elementos",
      html: `
            <div class="text-left">
                <div class="mb-3">
                    <label class="block text-xs font-semibold text-gray-400 mb-2">Tipo de Diagrama</label>
                    <select id="forceType" class="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white text-sm">
                        <option value="axial">Axial (P)</option>
                        <option value="shear">Corte (V)</option>
                        <option value="moment">Momento (M)</option>
                        <option value="all">Todos</option>
                    </select>
                </div>
                <div class="mb-3">
                    <label class="flex items-center gap-2">
                        <input type="checkbox" id="showValues">
                        <span class="text-sm text-gray-300">Mostrar valores numéricos</span>
                    </label>
                </div>
                <div class="mb-3">
                    <label class="block text-xs font-semibold text-gray-400 mb-2">Combinación de Carga</label>
                    <select id="loadCombo" class="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white text-sm">
                        <option value="DEAD">DEAD</option>
                        <option value="LIVE">LIVE</option>
                        <option value="COMB1">COMB1</option>
                        <option value="COMB2">COMB2</option>
                    </select>
                </div>
            </div>
        `,
      confirmButtonText: "Mostrar",
      cancelButtonText: "Cancelar",
      showCancelButton: true,
    }).then((result) => {
      if (result.isConfirmed) {
        var forceType = document.getElementById("forceType").value;
        var showValues = document.getElementById("showValues").checked;

        this.options.showFAxiales = true;
        this.options.showFAxialesValues = showValues;

        this.redraw();
        this.sync3D();
        this.showMessage(`📉 Mostrando diagramas de fuerza ${forceType}`);
      }
    });
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

  fitContentToScreen() {
    const minmax = this.nodes.length !== 0 ? [Number.POSITIVE_INFINITY, Number.NEGATIVE_INFINITY] : [-5, 5];
    const [minx, maxx] = this.nodes.reduce(
      ([min, max], node) => [Math.min(min, node.position.x), Math.max(max, node.position.x)],
      minmax,
    );
    const [miny, maxy] = this.nodes.reduce(
      ([min, max], node) => [Math.min(min, node.position.y), Math.max(max, node.position.y)],
      minmax,
    );
    this.grid.centerToView({
      cminx: minx,
      cminy: miny,
      cmaxx: maxx,
      cmaxy: maxy,
    });
    if (this.nodes.length !== 0) {
      this.grid.zoomOutToScreenPoint({
        x: this.canvas.width * 0.5,
        y: this.canvas.height * 0.5,
      });
      this.grid.zoomOutToScreenPoint({
        x: this.canvas.width * 0.5,
        y: this.canvas.height * 0.5,
      });
    }
  },

  closestAreaVertexAtActiveView(searchPoint, area = null) {
    const areas = area ? [area] : this.areas;
    let best = null;
    let bestDistance = 10;

    areas.forEach((a) => {
      if (!a?.points?.length) return;

      a.points.forEach((pt, index) => {
        const screenPt = this.currentRenderer.projectPoint({ position: pt }, this);
        const d = pointDistance(searchPoint, screenPt);

        if (d < bestDistance) {
          bestDistance = d;
          best = {
            area: a,
            index,
            point: pt,
          };
        }
      });
    });

    return best;
  },

  closestBeamEndpointAtActiveView(searchPoint, beam = null) {
    const beams = beam ? [beam] : this.shapes;
    let best = null;
    let bestDistance = 10;

    beams.forEach((b) => {
      if (!b?.node1 || !b?.node2) return;
      if (!this.currentRenderer.shouldDrawBeam(b, this)) return;

      const p1 = this.currentRenderer.projectPoint(b.node1, this);
      const p2 = this.currentRenderer.projectPoint(b.node2, this);

      const d1 = pointDistance(searchPoint, p1);
      const d2 = pointDistance(searchPoint, p2);

      if (d1 < bestDistance) {
        bestDistance = d1;
        best = { beam: b, node: b.node1, endpoint: "node1" };
      }

      if (d2 < bestDistance) {
        bestDistance = d2;
        best = { beam: b, node: b.node2, endpoint: "node2" };
      }
    });

    return best;
  },

  getDimensionScreenGeometry(dim) {
    const p1 = this.currentRenderer.projectPoint({ position: dim.start }, this);
    const p2 = this.currentRenderer.projectPoint({ position: dim.end }, this);

    const dx = p2.x - p1.x;
    const dy = p2.y - p1.y;
    const len = Math.sqrt(dx * dx + dy * dy);

    if (len < 1e-6) return null;

    const ux = dx / len;
    const uy = dy / len;

    const nx = -uy;
    const ny = ux;

    const offset = 18;

    const a1 = { x: p1.x + nx * offset, y: p1.y + ny * offset };
    const a2 = { x: p2.x + nx * offset, y: p2.y + ny * offset };

    return { p1, p2, a1, a2 };
  },

  closestDimensionLineAtActiveView(searchPoint) {
    if (!this.dimensionLines?.length) return null;

    let closest = null;
    let bestDistance = 8;

    this.dimensionLines.forEach((dim) => {
      if (!dim.visible) return;

      const geom = this.getDimensionScreenGeometry(dim);
      if (!geom) return;

      const dMain = pointDistanceToSegment(searchPoint, geom.a1, geom.a2);
      const dExt1 = pointDistanceToSegment(searchPoint, geom.p1, geom.a1);
      const dExt2 = pointDistanceToSegment(searchPoint, geom.p2, geom.a2);

      const d = Math.min(dMain, dExt1, dExt2);

      if (d < bestDistance) {
        bestDistance = d;
        closest = dim;
      }
    });

    return closest;
  },

  // EDICION 3D

  // ================FUNCION DE ELEVACION=======================

  // Mostrar mensaje temporal
  showMessage(message, type = "info") {
    const toast = document.createElement("div");
    toast.textContent = message;
    const bgColor = type === "warning" ? "#ef4444" : "#3b82f6";
    toast.style.cssText = `
    position: fixed;
    bottom: 100px;
    right: 20px;
    background: ${bgColor};
    color: white;
    padding: 10px 16px;
    border-radius: 8px;
    font-size: 13px;
    font-family: monospace;
    z-index: 1001;
    animation: fadeOut 2s ease forwards;
  `;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 2000);
  },

  // ========== NUEVAS FUNCIONES PARA OPENSEES ==========

  // resources/js/cad/cad_sys.js

  // ============================================================
  // 4. FUNCIÓN PRINCIPAL PARA EJECUTAR ANÁLISIS 3D Y ANIMAR
  // ============================================================

  async run3DAnalysisWithDeformation() {
    const swalTailwind = Swal.mixin({
      customClass: {
        confirmButton: "bg-blue-500 hover:bg-blue-400 text-white font-bold py-2 px-4 rounded",
      },
      buttonsStyling: false,
    });

    const waitingPopup = swalTailwind.fire({
      title: "Analizando en 3D!",
      html: "Calculando deformaciones...<br>",
      allowOutsideClick: false,
      didOpen: () => Swal.showLoading(),
    });

    try {
      const results = await this.analyze3DWithOpenSees();
      waitingPopup.hideLoading();

      if (results.success) {
        // Mostrar resumen de resultados
        const maxDisp = Math.max(
          ...Object.values(results.displacements).map((d) => Math.sqrt(d.dx * d.dx + d.dy * d.dy + d.dz * d.dz)),
        );

        const { value: showAnimation } = await swalTailwind.fire({
          title: "✅ Análisis completado",
          html: `
          <div class="text-left">
            <p><strong>Desplazamiento máximo:</strong> ${(maxDisp * 1000).toFixed(2)} mm</p>
            <p><strong>Nodos analizados:</strong> ${Object.keys(results.displacements).length}</p>
            <p><strong>Elementos analizados:</strong> ${Object.keys(results.forces).length}</p>
          </div>
          <div class="mt-4">¿Deseas ver la animación de deformación?</div>
        `,
          icon: "success",
          showCancelButton: true,
          confirmButtonText: "Sí, animar",
          cancelButtonText: "No",
        });

        if (showAnimation) {
          await this.animateDeformation3D(results, 50, 2000);
          swalTailwind.fire({
            icon: "info",
            title: "Animación completada",
            html: "La deformación se ha visualizado en 3D",
            timer: 2000,
          });
        }

        // Actualizar colores según esfuerzos
        Object.entries(results.forces).forEach(([id, force]) => {
          const beam = this.shapes.find((b) => b.id == id);
          if (beam) {
            beam.fAxial = force.axial;
            if (Math.abs(force.axial) < 0.001) beam.style.normal();
            else if (force.axial < 0) beam.style.compresion();
            else beam.style.traccion();
          }
        });

        this.sync3D();
      } else {
        throw new Error(results.error || "Error en el cálculo 3D");
      }
    } catch (error) {
      waitingPopup.hideLoading();
      console.error("Error:", error);
      swalTailwind.fire({
        icon: "error",
        title: "Error",
        html: error.message,
      });
    }
  },

  // ==================FUNCION PARA CREAR UN PORTICO DE PRUEBA EN 3D =========================

  // ----------MODAL PARA DEFINIR EL GRID DE REFERENCIA--------------

  // Propiedades para el diálogo de nuevo modelo
  newModelDialog: {
    open: false,
    gridXCount: 3,
    gridYCount: 3,
    gridXSpacing: 5.0,
    gridYSpacing: 5.0,
    storyCount: 3,
    storyHeight: 3.0,
    selectedTemplate: "grid-only",
  },

  openNewModelDialog() {
    window.dispatchEvent(new CustomEvent("open-new-model-modal"));
  },

  buildXGrids(count, spacing) {
    const labels = this.getXLabels(count);
    const grids = [];

    for (let i = 0; i < count; i++) {
      grids.push({
        id: labels[i],
        ordinate: i * Number(spacing),
        visible: true,
        bubbleLoc: "End",
      });
    }

    return grids;
  },

  buildYGrids(count, spacing) {
    const labels = this.getYLabels(count);
    const grids = [];

    for (let i = 0; i < count; i++) {
      grids.push({
        id: String(labels[i]),
        ordinate: i * Number(spacing),
        visible: true,
        bubbleLoc: "Start",
      });
    }

    return grids;
  },

  rebuildGeneralGrids(targetGrid = this.referenceGrid) {
    if (!targetGrid) return;

    const ref = targetGrid;

    const customLines = Array.isArray(ref.generalGrids)
      ? ref.generalGrids.filter((g) => g.source === "custom")
      : [];

    const xValues = Array.isArray(ref.xGrids)
      ? ref.xGrids.map((g) => Number(g.ordinate) || 0)
      : [];

    const yValues = Array.isArray(ref.yGrids)
      ? ref.yGrids.map((g) => Number(g.ordinate) || 0)
      : [];

    const minX = xValues.length ? Math.min(...xValues) : 0;
    const maxX = xValues.length ? Math.max(...xValues) : 10;
    const minY = yValues.length ? Math.min(...yValues) : 0;
    const maxY = yValues.length ? Math.max(...yValues) : 10;

    const xLines = (ref.xGrids || []).map((g) => ({
      id: g.id,
      x1: Number(g.ordinate) || 0,
      y1: minY,
      x2: Number(g.ordinate) || 0,
      y2: maxY,
      visible: g.visible !== false,
      bubbleLoc: g.bubbleLoc || "End",
      source: "x",
    }));

    const yLines = (ref.yGrids || []).map((g) => ({
      id: g.id,
      x1: minX,
      y1: Number(g.ordinate) || 0,
      x2: maxX,
      y2: Number(g.ordinate) || 0,
      visible: g.visible !== false,
      bubbleLoc: g.bubbleLoc || "Start",
      source: "y",
    }));

    ref.generalGrids = [...xLines, ...yLines, ...customLines];

    // Compatibilidad con tu sistema actual
    ref.xPositions = (ref.xGrids || []).map((g) => Number(g.ordinate) || 0);
    ref.yPositions = (ref.yGrids || []).map((g) => Number(g.ordinate) || 0);
    ref.xLabels = (ref.xGrids || []).map((g) => g.id);
    ref.yLabels = (ref.yGrids || []).map((g) => g.id);
  },

  getReferenceGrid() {
    return this.referenceGrid;
  },

  normalizeGridLine(line = {}, fallbackId = "") {
    return {
      id: String(line.id ?? fallbackId),
      ordinate: Number(line.ordinate ?? 0),
      visible: line.visible !== false,
      bubbleLoc: line.bubbleLoc ?? "End",
    };
  },

  normalizeGeneralGridLine(line = {}, fallbackId = "") {
    return {
      id: String(line.id ?? fallbackId),
      x1: Number(line.x1 ?? 0),
      y1: Number(line.y1 ?? 0),
      x2: Number(line.x2 ?? 0),
      y2: Number(line.y2 ?? 0),
      visible: line.visible !== false,
      bubbleLoc: line.bubbleLoc ?? "End",
      source: line.source ?? "custom",
    };
  },

  sortGridsByOrdinate(lines = []) {
    return [...lines].sort((a, b) => Number(a.ordinate) - Number(b.ordinate));
  },

  rebuildReferenceGridCaches() {
    if (!this.referenceGrid) return;

    const ref = this.referenceGrid;

    ref.xGrids = this.sortGridsByOrdinate(
      (ref.xGrids || []).map((g, i) => this.normalizeGridLine(g, `X${i + 1}`))
    );

    ref.yGrids = this.sortGridsByOrdinate(
      (ref.yGrids || []).map((g, i) => this.normalizeGridLine(g, `Y${i + 1}`))
    );

    ref.generalGrids = (ref.generalGrids || []).map((g, i) =>
      this.normalizeGeneralGridLine(g, `G${i + 1}`)
    );

    ref.xPositions = ref.xGrids.map((g) => Number(g.ordinate));
    ref.yPositions = ref.yGrids.map((g) => Number(g.ordinate));
    ref.xLabels = ref.xGrids.map((g) => g.id);
    ref.yLabels = ref.yGrids.map((g) => g.id);
  },

  buildSpacingRowsFromOrdinates(lines = []) {
    const sorted = this.sortGridsByOrdinate(lines);

    return sorted.map((line, index) => {
      const prev = sorted[index - 1];
      const spacing = index === 0 ? Number(line.ordinate) : Number(line.ordinate) - Number(prev.ordinate);

      return {
        id: line.id,
        spacing,
        visible: line.visible !== false,
        bubbleLoc: line.bubbleLoc ?? "End",
      };
    });
  },

  buildOrdinatesFromSpacingRows(rows = []) {
    let cumulative = 0;

    return rows.map((row, index) => {
      cumulative += Number(row.spacing ?? 0);

      return {
        id: String(row.id ?? index + 1),
        ordinate: cumulative,
        visible: row.visible !== false,
        bubbleLoc: row.bubbleLoc ?? "End",
      };
    });
  },

  setGridDisplayMode(mode) {
    if (mode !== "ordinates" && mode !== "spacing") return;
    this.gridDisplayMode = mode;
  },

  rebuildViewSetFromReferenceGrid() {
    if (!this.referenceGrid) return;

    const ref = this.referenceGrid;
    this.viewSet = [];

    this.viewSet.push({
      type: "plan",
      storyId: 0,
      name: "Planta - Base",
      elevation: 0,
    });

    for (let i = 1; i <= (ref.storyCount || 0); i++) {
      this.viewSet.push({
        type: "plan",
        storyId: i,
        name: `Planta - Piso ${i}`,
        elevation: i * (ref.storyHeight || 0),
      });
    }

    // LETRAS => eje X
    (ref.xPositions || []).forEach((x, i) => {
      this.viewSet.push({
        type: "elevation",
        axis: "X",
        label: ref.xLabels?.[i],   // A, B, C, D
        value: x,
        name: `Elevación ${ref.xLabels?.[i]}`,
      });
    });

    // NÚMEROS => eje Y
    (ref.yPositions || []).forEach((y, i) => {
      this.viewSet.push({
        type: "elevation",
        axis: "Y",
        label: ref.yLabels?.[i],   // 1, 2, 3, 4
        value: y,
        name: `Elevación ${ref.yLabels?.[i]}`,
      });
    });

    if (this.activeViewIndex >= this.viewSet.length) {
      this.activeViewIndex = 0;
    }
  },

  rebuildElevationListsFromReferenceGrid() {
    if (!this.referenceGrid) return;

    const ref = this.referenceGrid;

    // LETRAS => X
    this.xElevations = (ref.xPositions || []).map((x, i) => ({
      label: ref.xLabels?.[i],   // A, B, C, D
      value: x,
      name: `Elevación ${ref.xLabels?.[i]}`,
    }));

    // NÚMEROS => Y
    this.zElevations = (ref.yPositions || []).map((y, i) => ({
      label: ref.yLabels?.[i],   // 1, 2, 3, 4
      value: y,
      name: `Elevación ${ref.yLabels?.[i]}`,
    }));
  },

  createModelFromDialog(params) {
    console.log("🏗️ Configurando grid de referencia con parámetros:", params);

    // ===============================
    // LIMPIEZA GENERAL DEL MODELO ANTERIOR
    // ===============================
    this.clearAllSelections?.();
    this.clearEditSelectionFlags?.();

    if (this.idleState && typeof this.setState === "function") {
      this.setState(this.idleState);
    }

    this.currentFileName = null;

    this.nodes = [];
    this.shapes = [];
    this.areas = [];

    this.referencePoints = [];
    this.referencePlanes = [];
    this.dimensionLines = [];
    this.parametricModels = [];

    this.selectedObject = null;
    this.activeGridPoint = null;

    this.nextNodeId = 1;
    this.nextBeamId = 1;

    this.undoStack = [];
    this.redoStack = [];

    this.editClipboard = null;
    this.editPasteCount = 0;

    this.K_Global_Reducido = [];
    this.Fuerzas_Globales_Reducidas = [];
    this.D_Global_Reducido = [];
    this.deflecciones = [];
    this.desplazamientosPosition = [];
    this.matrizDesplazamiento = [];

    this.referenceGrid = {
      xGrids: this.buildXGrids(params.gridXCount, params.gridXSpacing),
      yGrids: this.buildYGrids(params.gridYCount, params.gridYSpacing),
      generalGrids: [],

      xPositions: [],
      yPositions: [],
      xLabels: [],
      yLabels: [],

      storyCount: Number(params.storyCount || 0),
      storyHeight: Number(params.storyHeight || 0),
    };

    this.rebuildReferenceGridCaches();
    this.rebuildGeneralGrids();

    this.stories = [
      { id: 0, name: "Base", elevation: 0 },
    ];

    for (let i = 1; i <= params.storyCount; i++) {
      this.stories.push({
        id: i,
        name: `Piso ${i}`,
        elevation: i * params.storyHeight,
      });
    }

    this.activeStory = 0;

    this.rebuildViewSetFromReferenceGrid();
    this.rebuildElevationListsFromReferenceGrid();

    this.activeViewIndex = 0;
    this.currentViewMode = "plan";
    this.currentElevationX = "none";
    this.currentElevationZ = "none";

    if (this.referenceGrid.xPositions.length > 0 && this.referenceGrid.yPositions.length > 0) {
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

    this.redraw();

    const viewer = getViewer3DState();

    this.grid3DDrawn = false;

    if (viewer?.initialized && viewer?.scene) {
      this.pendingGrid3D = false;

      // Esperar 2 frames para evitar borrar/redibujar objetos 3D
      // mientras Babylon todavía está renderizando o compilando shaders.
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          this.sync3D?.();

          // =====================================================
          // 3D SNAP > RECONSTRUIR SNAP POINTS DESPUÉS DEL MODELO
          // Necesario para dibujar diagonales 3D sin cambiar de piso.
          // =====================================================
          this.rebuild3DGridSnapPointsSoon?.("createModelFromDialog");
        });
      });
    } else {
      this.pendingGrid3D = true;

      // Si el visor 3D todavía no inició, intentamos reconstruir
      // cuando Babylon ya esté disponible.
      this.rebuild3DGridSnapPointsSoon?.("createModelFromDialog pending viewer");
    }

    this.showMessage(`✅ Grid de referencia: ${params.gridXCount}x${params.gridYCount}, ${params.storyCount} pisos`);
  },

  // Función auxiliar para obtener etiquetas X (A, B, C...)
  getXLabels(count) {
    const letters = [
      "A",
      "B",
      "C",
      "D",
      "E",
      "F",
      "G",
      "H",
      "I",
      "J",
      "K",
      "L",
      "M",
      "N",
      "O",
      "P",
      "Q",
      "R",
      "S",
      "T",
    ];
    return letters.slice(0, count);
  },

  // Función auxiliar para obtener etiquetas Y (1, 2, 3...)
  getYLabels(count) {
    return Array.from({ length: count }, (_, i) => i + 1);
  },

  closestBeamAtElevation(searchPoint, targetZ, tolerance = 0.05) {
    let closest = null;
    let shortestDistance = 10;

    for (let i = 0; i < this.shapes.length; i++) {
      const beam = this.shapes[i];
      if (!beam?.node1 || !beam?.node2) continue;

      const z1 = beam.node1.position.z || 0;
      const z2 = beam.node2.position.z || 0;

      // solo barras del mismo piso
      if (Math.abs(z1 - targetZ) > tolerance || Math.abs(z2 - targetZ) > tolerance) {
        continue;
      }

      const p1 = this.grid.worldToScreen(beam.node1.position);
      const p2 = this.grid.worldToScreen(beam.node2.position);

      const dist = pointDistanceToSegment(searchPoint, p1, p2); // helper abajo
      if (dist < shortestDistance) {
        shortestDistance = dist;
        closest = beam;
      }
    }

    return closest;
  },

  // getActivePlanElevation() {
  //   const view = this.viewSet?.[this.activeViewIndex];

  //   if (view?.type === "plan") {
  //     return view.elevation ?? 0;
  //   }

  //   return this.stories?.[this.activeStory]?.elevation ?? 0;
  // },

  closestNodeAtElevation(searchPoint, targetZ, tolerance = 0.05) {
    const shortestDistance = 10;

    for (let index = 0; index < this.nodes.length; index++) {
      const node = this.nodes[index];
      const distance = pointDistance(searchPoint, this.grid.worldToScreen(node.position));
      const nodeZ = node.position.z || 0;

      if (distance <= shortestDistance && Math.abs(nodeZ - targetZ) <= tolerance) {
        return node;
      }
    }
  },

  // nueva función para cambiar de vista según el índice del set
  getNearestValueWithIndex(values, target) {
    if (!Array.isArray(values) || values.length === 0) return null;

    let nearestIndex = 0;
    let nearestValue = values[0];
    let minDist = Math.abs(values[0] - target);

    for (let i = 1; i < values.length; i++) {
      const dist = Math.abs(values[i] - target);
      if (dist < minDist) {
        minDist = dist;
        nearestIndex = i;
        nearestValue = values[i];
      }
    }

    return {
      index: nearestIndex,
      value: nearestValue,
      distance: minDist,
    };
  },

  getActivePlanElevation() {
    const view = this.viewSet?.[this.activeViewIndex];
    if (view?.type === "plan") {
      return view.elevation ?? 0;
    }

    const story = this.stories?.find((s) => s.name === this.currentStory);
    return story?.elevation ?? 0;
  },

  getNearestPlanGridPoint(mouseWorld, mouseScreen) {
    const ref = this.referenceGrid;
    if (!ref) return null;

    const xValues = Array.isArray(ref.xPositions) ? ref.xPositions : [];
    const yValues = Array.isArray(ref.yPositions) ? ref.yPositions : [];
    const xLabels = Array.isArray(ref.xLabels) ? ref.xLabels : [];
    const yLabels = Array.isArray(ref.yLabels) ? ref.yLabels : [];

    if (!xValues.length || !yValues.length) return null;

    const nearestX = this.getNearestValueWithIndex(xValues, mouseWorld.x);
    const nearestY = this.getNearestValueWithIndex(yValues, mouseWorld.y);

    if (!nearestX || !nearestY) return null;

    const worldPoint = {
      x: nearestX.value,
      y: nearestY.value,
      z: this.getActivePlanElevation(),
    };

    const screenPoint = this.grid.worldToScreen({
      x: worldPoint.x,
      y: worldPoint.y,
    });

    const dxScreen = mouseScreen.x - screenPoint.x;
    const dyScreen = mouseScreen.y - screenPoint.y;
    const screenDistance = Math.sqrt(dxScreen * dxScreen + dyScreen * dyScreen);

    if (screenDistance > this.planGridSnapScreenTolerance) {
      return null;
    }

    return {
      x: worldPoint.x,
      y: worldPoint.y,
      z: worldPoint.z,
      xGridId: xLabels[nearestX.index] ?? String(nearestX.index + 1),
      yGridId: yLabels[nearestY.index] ?? String(nearestY.index + 1),
      label: `Grid Point ${xLabels[nearestX.index] ?? nearestX.index + 1} ${yLabels[nearestY.index] ?? nearestY.index + 1}`,
      source: "grid-xy",
      screenDistance,
    };
  },

  getGeneralGridIntersections() {
    const ref = this.referenceGrid;
    if (!ref?.generalGrids?.length) return [];

    const customLines = ref.generalGrids.filter(
      (g) => g.source === "custom" && g.visible !== false
    );

    const intersections = [];

    customLines.forEach((line) => {
      const x1 = Number(line.x1 ?? 0);
      const y1 = Number(line.y1 ?? 0);
      const x2 = Number(line.x2 ?? 0);
      const y2 = Number(line.y2 ?? 0);

      const dx = x2 - x1;
      const dy = y2 - y1;

      // Intersección con líneas X (verticales)
      (ref.xPositions || []).forEach((xVal, ix) => {
        if (Math.abs(dx) < 1e-9) return;

        const t = (xVal - x1) / dx;
        if (t >= 0 && t <= 1) {
          const yVal = y1 + t * dy;

          intersections.push({
            x: xVal,
            y: yVal,
            z: this.getActivePlanElevation(),
            label: `Intersection ${line.id} × ${ref.xLabels[ix]}`,
            gridId: line.id,
            baseGridId: ref.xLabels[ix],
            source: "general-grid-intersection",
          });
        }
      });

      // Intersección con líneas Y (horizontales)
      (ref.yPositions || []).forEach((yVal, iy) => {
        if (Math.abs(dy) < 1e-9) return;

        const t = (yVal - y1) / dy;
        if (t >= 0 && t <= 1) {
          const xVal = x1 + t * dx;

          intersections.push({
            x: xVal,
            y: yVal,
            z: this.getActivePlanElevation(),
            label: `Intersection ${line.id} × ${ref.yLabels[iy]}`,
            gridId: line.id,
            baseGridId: ref.yLabels[iy],
            source: "general-grid-intersection",
          });
        }
      });
    });

    return intersections;
  },

  buildSnapDisplayLabel(point) {
    if (!point) return "";

    switch (point.source) {
      case "general-grid-intersection":
        return `Intersection ${point.gridId} × ${point.baseGridId}`;

      case "general-grid-endpoint":
        return `Endpoint ${point.gridId}`;

      case "general-grid":
        return `Grid ${point.gridId}`;

      case "grid-xy":
      default:
        if (point.xGridId && point.yGridId) {
          return `Grid Point ${point.xGridId} ${point.yGridId}`;
        }
        return point.label || "";
    }
  },

  getNearestPlanGeneralGridIntersectionSnap(mouseScreen) {
    const points = this.getGeneralGridIntersections();
    if (!points.length) return null;

    let best = null;

    points.forEach((point) => {
      const sp = this.grid.worldToScreen({ x: point.x, y: point.y });
      const dx = mouseScreen.x - sp.x;
      const dy = mouseScreen.y - sp.y;
      const screenDistance = Math.sqrt(dx * dx + dy * dy);

      if (
        best === null ||
        screenDistance < best.screenDistance
      ) {
        best = {
          ...point,
          screenDistance,
        };
      }
    });

    if (!best) return null;
    if (best.screenDistance > this.planGridSnapScreenTolerance) return null;

    return best;
  },

  closestPointOnSegment(px, py, x1, y1, x2, y2) {
    const dx = x2 - x1;
    const dy = y2 - y1;

    if (Math.abs(dx) < 1e-9 && Math.abs(dy) < 1e-9) {
      return { x: x1, y: y1, t: 0 };
    }

    let t = ((px - x1) * dx + (py - y1) * dy) / (dx * dx + dy * dy);
    t = Math.max(0, Math.min(1, t));

    return {
      x: x1 + t * dx,
      y: y1 + t * dy,
      t,
    };
  },

  getNearestPlanGeneralGridSnap(mouseWorld, mouseScreen) {
    const ref = this.referenceGrid;
    if (!ref?.generalGrids?.length) return null;

    const customLines = ref.generalGrids.filter(
      (g) => g.source === "custom" && g.visible !== false
    );

    if (!customLines.length) return null;

    let best = null;

    customLines.forEach((line) => {
      const cp = this.closestPointOnSegment(
        mouseWorld.x,
        mouseWorld.y,
        Number(line.x1 ?? 0),
        Number(line.y1 ?? 0),
        Number(line.x2 ?? 0),
        Number(line.y2 ?? 0)
      );

      const sp = this.grid.worldToScreen({ x: cp.x, y: cp.y });
      const dx = mouseScreen.x - sp.x;
      const dy = mouseScreen.y - sp.y;
      const screenDistance = Math.sqrt(dx * dx + dy * dy);

      if (
        best === null ||
        screenDistance < best.screenDistance
      ) {
        best = {
          x: cp.x,
          y: cp.y,
          z: this.getActivePlanElevation(),
          label: `Grid ${line.id}`,
          gridId: line.id,
          source: "general-grid",
          screenDistance,
        };
      }
    });

    if (!best) return null;
    if (best.screenDistance > this.planGridSnapScreenTolerance) return null;

    return best;
  },

  updatePlanGridSnap(mouseWorld, mouseScreen) {
    const view = this.viewSet?.[this.activeViewIndex];
    this.lastMouseScreen = mouseScreen;

    if (!view || view.type !== "plan") {
      this.activeGridPoint = null;
      return;
    }

    const pointIntersection = this.getNearestPlanGeneralGridIntersectionSnap(mouseScreen);
    const pointEndpoint = this.getNearestPlanGeneralGridEndpointSnap(mouseScreen);
    const pointGeneral = this.getNearestPlanGeneralGridSnap(mouseWorld, mouseScreen);
    const pointXY = this.getNearestPlanGridPoint(mouseWorld, mouseScreen);

    const candidates = [];

    if (pointIntersection) {
      candidates.push({
        ...pointIntersection,
        priorityWeight: 0
      });
    }

    if (pointEndpoint) {
      candidates.push({
        ...pointEndpoint,
        priorityWeight: 2
      });
    }

    if (pointGeneral) {
      candidates.push({
        ...pointGeneral,
        priorityWeight: 4
      });
    }

    if (pointXY) {
      candidates.push({
        ...pointXY,
        priorityWeight: 6
      });
    }

    if (!candidates.length) {
      this.activeGridPoint = null;
      const z = this.getActivePlanElevation();
      this.statusCoordinates = this.formatCoordinates(mouseWorld.x, mouseWorld.y, z);
      return;
    }

    // Elegir el mejor punto por cercanía real + pequeña prioridad
    candidates.forEach((c) => {
      c.score = (c.screenDistance ?? 9999) + (c.priorityWeight ?? 0);
    });

    candidates.sort((a, b) => a.score - b.score);

    const point = candidates[0];

    point.displayLabel = this.buildSnapDisplayLabel(point);
    this.activeGridPoint = point;
    this.statusCoordinates = this.formatCoordinates(point.x, point.y, point.z);
  },

  getGeneralGridEndpoints() {
    const ref = this.referenceGrid;
    if (!ref?.generalGrids?.length) return [];

    const customLines = ref.generalGrids.filter(
      (g) => g.source === "custom" && g.visible !== false
    );

    const z = this.getActivePlanElevation();
    const points = [];

    customLines.forEach((line) => {
      points.push({
        x: Number(line.x1 ?? 0),
        y: Number(line.y1 ?? 0),
        z,
        label: `Endpoint ${line.id}`,
        gridId: line.id,
        source: "general-grid-endpoint",
        bubbleLoc: "Start",
      });

      points.push({
        x: Number(line.x2 ?? 0),
        y: Number(line.y2 ?? 0),
        z,
        label: `Endpoint ${line.id}`,
        gridId: line.id,
        source: "general-grid-endpoint",
        bubbleLoc: "End",
      });
    });

    return points;
  },

  getNearestPlanGeneralGridEndpointSnap(mouseScreen) {
    const points = this.getGeneralGridEndpoints();
    if (!points.length) return null;

    let best = null;

    points.forEach((point) => {
      const sp = this.grid.worldToScreen({ x: point.x, y: point.y });
      const dx = mouseScreen.x - sp.x;
      const dy = mouseScreen.y - sp.y;
      const screenDistance = Math.sqrt(dx * dx + dy * dy);

      if (!best || screenDistance < best.screenDistance) {
        best = {
          ...point,
          screenDistance,
        };
      }
    });

    if (!best) return null;
    if (best.screenDistance > this.planGridSnapScreenTolerance) return null;

    return best;
  },

  // buildSnapDisplayLabel(point) {
  //   if (!point) return "";

  //   switch (point.source) {
  //     case "general-grid-intersection":
  //       return `Intersection ${point.gridId} × ${point.baseGridId}`;

  //     case "general-grid-endpoint":
  //       return `Endpoint ${point.gridId}`;

  //     case "general-grid":
  //       return `Grid ${point.gridId}`;

  //     default:
  //       if (point.xGridId && point.yGridId) {
  //         return `Grid Point ${point.xGridId} ${point.yGridId}`;
  //       }
  //       return point.label || "";
  //   }
  // },

  isPlanView() {
    return this.currentViewMode === "plan";
  },

  isNumberElevationView() {
    // Elevaciones 1,2,3,4 -> plano X-Z (Y fijo)
    return (
      this.currentViewMode === "elevation" ||
      this.currentViewMode === "elevationY"
    );
  },

  isLetterElevationView() {
    // Elevaciones A,B,C,D -> plano Y-Z (X fijo)
    return (
      this.currentViewMode === "elevationZ" ||
      this.currentViewMode === "elevationX"
    );
  },

  isAnyElevationView() {
    return this.isNumberElevationView() || this.isLetterElevationView();
  },

  // =====================================================
  // VIEW > CAMBIAR ENTRE PLANTA Y ELEVACIONES
  // Cambia la vista activa sin romper modos especiales,
  // como Frame 3D entre plantas/elevaciones.
  // =====================================================
  setViewFromSet(index) {
    this.activeViewIndex = Number(index);
    const view = this.viewSet?.[this.activeViewIndex];

    if (!view) return;

    // Si hay una barra en proceso con primer punto,
    // no se cancela al cambiar de piso o elevación.
    // =====================================================
    const isFrameDrawingInProgress =
      this.currentState?.isFrameDrawingState === true &&
      this.currentState?.shape?.node1 &&
      !this.currentState?.shape?.node2;

    const shouldPreserveCurrentState =
      this.currentState?.preserveOnViewChange === true &&
      isFrameDrawingInProgress;

    const preservedState = shouldPreserveCurrentState
      ? this.currentState
      : null;

    if (!shouldPreserveCurrentState && this.currentState?.exit) {
      this.currentState.exit();
    }

    if (!shouldPreserveCurrentState) {
      this.clearAllSelections?.();
    }

    this.activeGridPoint = null;

    // =====================================================
    // VIEW > VISTA EN PLANTA
    // Activa una planta y actualiza el piso / nivel actual.
    // =====================================================
    if (view.type === "plan") {
      this.currentViewMode = "plan";
      this.currentElevationX = "none";
      this.currentElevationZ = "none";

      const viewElevation = Number(view.elevation ?? view.z ?? 0);
      const tol = this.getActiveViewTolerance?.() ?? 0.001;

      const storyIndex = this.stories?.findIndex((story) => {
        const storyElevation = Number(story.elevation ?? 0);

        return (
          Math.abs(storyElevation - viewElevation) <= tol ||
          story.name === view.storyName ||
          story.id === view.storyId
        );
      });

      if (storyIndex >= 0) {
        const story = this.stories[storyIndex];

        this.activeStory = storyIndex;
        this.currentStory = story.name;
        this.currentZ = Number(story.elevation ?? viewElevation);
      } else {
        this.currentZ = viewElevation;
      }
    }

    // =====================================================
    // VIEW > ELEVACIÓN X
    // Letras A, B, C... plano Y-Z con X fijo.
    // =====================================================
    else if (view.type === "elevation" && view.axis === "X") {
      this.currentViewMode = "elevationX";
      this.currentElevationZ = view.label;
      this.currentElevationX = "none";
    }

    // =====================================================
    // VIEW > ELEVACIÓN Y
    // Números 1, 2, 3... plano X-Z con Y fijo.
    // =====================================================
    else if (view.type === "elevation" && view.axis === "Y") {
      this.currentViewMode = "elevationY";
      this.currentElevationX = view.label;
      this.currentElevationZ = "none";
    }

    // Si es Frame 3D entre vistas, mantiene el punto inicial.
    // Si es un estado normal, vuelve a selección.
    // =====================================================
    if (shouldPreserveCurrentState && preservedState) {
      this.currentState = preservedState;

      if (typeof this.currentState.onViewChanged === "function") {
        this.currentState.onViewChanged(this, view);
      }
    } else {
      this.currentState = this.idleState;

      if (this.currentState?.enter) {
        this.currentState.enter();
      }
    }

    console.log("👁️ Vista activa cambiada:", {
      activeViewIndex: this.activeViewIndex,
      view,
      currentViewMode: this.currentViewMode,
      activeStory: this.activeStory,
      currentStory: this.currentStory,
      currentZ: this.currentZ,
      currentElevationX: this.currentElevationX,
      currentElevationZ: this.currentElevationZ,
      preservedState: shouldPreserveCurrentState,
      currentState: this.currentState?.constructor?.name,
    });

    this.redraw?.();
    this.refresh3DActiveView?.("setViewFromSet");

    if (typeof this.requestSync3D === "function") {
      this.requestSync3D("setViewFromSet");
    } else {
      this.sync3D?.();
    }
  },

  // =====================================================
  // DRAW > ACTIVAR FRAME 3D ENTRE PLANTAS Y ELEVACIONES
  // Activa el modo especial para dibujar barras entre vistas distintas.
  // =====================================================
  activateCrossViewFrameDrawing() {
    if (!this.crossViewFrameDrawingState) {
      this.showMessage?.(
        "No existe crossViewFrameDrawingState. Revisa el import y la instancia.",
        "warning"
      );
      return;
    }

    this.clearAllSelections?.();
    this.setState(this.crossViewFrameDrawingState);

    this.showMessage?.(
      "Frame 3D entre vistas activado: haz clic en el primer punto."
    );

    console.log("✅ Modo CrossViewFrameDrawingState activado:", {
      currentState: this.currentState?.constructor?.name,
      preserveOnViewChange: this.currentState?.preserveOnViewChange,
    });
  },

  findClosestGridValue(values = [], labels = [], target = 0, tolerance = 0.3) {
    if (!values || values.length === 0) return null;

    let bestIndex = -1;
    let bestDistance = Infinity;

    values.forEach((value, index) => {
      const d = Math.abs(Number(value) - Number(target));
      if (d < bestDistance) {
        bestDistance = d;
        bestIndex = index;
      }
    });

    if (bestIndex === -1 || bestDistance > tolerance) return null;

    return {
      index: bestIndex,
      value: Number(values[bestIndex]),
      label: labels?.[bestIndex] ?? String(bestIndex + 1),
      distance: bestDistance
    };
  },

  findClosestStoryLevel(targetZ = 0, tolerance = 0.3) {
    const ref = this.referenceGrid;
    if (!ref) return null;

    const storyCount = Number(ref.storyCount || 0);
    const storyHeight = Number(ref.storyHeight || 0);

    let levels = [{ label: "BASE", z: 0 }];

    for (let i = 1; i <= storyCount; i++) {
      levels.push({
        label: `STORY${i}`,
        z: i * storyHeight
      });
    }

    let best = null;
    let bestDistance = Infinity;

    levels.forEach(level => {
      const d = Math.abs(level.z - Number(targetZ));
      if (d < bestDistance) {
        bestDistance = d;
        best = { ...level, distance: d };
      }
    });

    if (!best || best.distance > tolerance) return null;

    return best;
  },

  getFixedCoordinateForActiveElevation() {
    const view = this.viewSet?.[this.activeViewIndex];
    const ref = this.referenceGrid;
    if (!ref || !view) return 0;

    // NÚMEROS => eje Y fijo
    if (view.axis === "Y") {
      const idx = (ref.yLabels || []).findIndex(
        label => String(label) === String(view.label)
      );
      if (idx >= 0) return Number(ref.yPositions[idx] || 0);
    }

    // LETRAS => eje X fijo
    if (view.axis === "X") {
      const idx = (ref.xLabels || []).findIndex(
        label => String(label) === String(view.label)
      );
      if (idx >= 0) return Number(ref.xPositions[idx] || 0);
    }

    return 0;
  },

  updateElevationGridSnap(mouseWorld, mouseScreen) {
    const view = this.viewSet?.[this.activeViewIndex];
    const ref = this.referenceGrid;

    if (!view || !ref) {
      this.activeGridPoint = null;
      return;
    }

    const toleranceX = 12 / (this.grid.scaleX || 1);
    const toleranceY = 12 / (this.grid.scaleY || 1);

    const snapZ = this.findClosestStoryLevel(mouseWorld.y, toleranceY);

    if (!snapZ) {
      this.activeGridPoint = null;
      return;
    }

    // ELEVACIÓN NUMÉRICA => plano X-Z => Y fijo
    if (this.currentViewMode === "elevationY") {
      const fixedY = this.getFixedCoordinateForActiveElevation();

      const snapX = this.findClosestGridValue(
        ref.xPositions || [],
        ref.xLabels || [],
        mouseWorld.x,
        toleranceX
      );

      if (!snapX) {
        this.activeGridPoint = null;
        return;
      }

      this.activeGridPoint = {
        x: snapX.value,
        y: fixedY,
        z: snapZ.z,
        xGridId: snapX.label,
        yGridId: String(view.label),
        storyLabel: snapZ.label,
        label: `Grid Point ${snapX.label} ${view.label}`,
        source: "elevation-xz"
      };

      this.statusCoordinates = this.formatCoordinates(snapX.value, fixedY, snapZ.z);
      return;
    }

    // ELEVACIÓN POR LETRAS => plano Y-Z => X fijo
    if (this.currentViewMode === "elevationX") {
      const fixedX = this.getFixedCoordinateForActiveElevation();

      const snapY = this.findClosestGridValue(
        ref.yPositions || [],
        ref.yLabels || [],
        mouseWorld.x,
        toleranceX
      );

      if (!snapY) {
        this.activeGridPoint = null;
        return;
      }

      this.activeGridPoint = {
        x: fixedX,
        y: snapY.value,
        z: snapZ.z,
        xGridId: String(view.label),
        yGridId: snapY.label,
        storyLabel: snapZ.label,
        label: `Grid Point ${view.label} ${snapY.label}`,
        source: "elevation-yz"
      };

      this.statusCoordinates = this.formatCoordinates(fixedX, snapY.value, snapZ.z);
      return;
    }

    this.activeGridPoint = null;
  },

  getOrCreateStructuralNode(point, tolerance = null) {

    tolerance = tolerance ?? this.getModelTolerance();

    const existing = this.nodes.find((node) => {
      const p = node.position || node;

      return (
        Math.abs(Number(p.x || 0) - Number(point.x || 0)) <= tolerance &&
        Math.abs(Number(p.y || 0) - Number(point.y || 0)) <= tolerance &&
        Math.abs(Number(p.z || 0) - Number(point.z || 0)) <= tolerance
      );
    });

    if (existing) {
      if (!existing.beams) existing.beams = [];
      return existing;
    }

    const node = new StructuralNode(
      {
        x: Number(point.x || 0),
        y: Number(point.y || 0),
      },
      this.nodes.length + 1,
      Number(point.z || 0)
    );

    if (!node.position) {
      node.position = {
        x: Number(point.x || 0),
        y: Number(point.y || 0),
        z: Number(point.z || 0),
      };
    }

    node.position.x = Number(point.x || 0);
    node.position.y = Number(point.y || 0);
    node.position.z = Number(point.z || 0);

    if (!node.beams) {
      node.beams = [];
    }

    this.nodes.push(node);

    return node;
  },

  createFrameLineFromPoints(startPoint, endPoint, frameType = "beam") {

    // const tolerance = this.preferences?.modelTolerance ?? 0.001;

    if (!startPoint || !endPoint) {
      return null;
    }

    const tolerance = this.getModelTolerance();

    const samePoint =
      Math.abs(Number(startPoint.x || 0) - Number(endPoint.x || 0)) < tolerance &&
      Math.abs(Number(startPoint.y || 0) - Number(endPoint.y || 0)) < tolerance &&
      Math.abs(Number(startPoint.z || 0) - Number(endPoint.z || 0)) < tolerance;

    if (samePoint) {
      this.showMessage?.(
        "No se puede crear una línea con el mismo punto inicial y final",
        "warning"
      );
      return null;
    }

    const node1 = this.getOrCreateStructuralNode(startPoint);
    const node2 = this.getOrCreateStructuralNode(endPoint);

    const frame = new Beam(this.globalE, this.globalA);

    frame.elementType = frameType;
    frame.type = frameType;
    frame.objectType = "frame";
    frame.visible = true;

    frame.addNode(node1);
    frame.addNode(node2);

    frame.id = this.shapes.length + 1;

    this.shapes.push(frame);

    if (!node1.beams) node1.beams = [];
    if (!node2.beams) node2.beams = [];

    if (!node1.beams.includes(frame)) {
      node1.beams.push(frame);
    }

    if (!node2.beams.includes(frame)) {
      node2.beams.push(frame);
    }

    this.redraw?.();
    this.sync3D?.();

    console.log(
      `✅ Línea creada ID: ${frame.id} | tipo: ${frameType}`,
      frame.node1.position,
      frame.node2.position
    );

    return frame;
  },

  getCurrentSnapPoint(worldPos) {
    if (this.activeGridPoint) {
      return {
        x: this.activeGridPoint.x,
        y: this.activeGridPoint.y,
        z: this.activeGridPoint.z
      };
    }

    const view = this.viewSet?.[this.activeViewIndex];

    // Si no hay snap, igual devuelve un punto coherente según la vista
    if (!view || view.type === "plan") {
      return {
        x: worldPos.x,
        y: worldPos.y,
        z: this.currentZ || 0
      };
    }

    if (view.type === "elevation") {
      const fixedCoord = this.getFixedCoordinateForActiveElevation(view);

      // Elevación numérica: plano X-Z con Y fijo
      if (view.axis === "Y") {
        return {
          x: worldPos.x,
          y: fixedCoord,
          z: worldPos.y
        };
      }

      // Elevación por letras: plano Y-Z con X fijo
      if (view.axis === "X") {
        return {
          x: fixedCoord,
          y: worldPos.x,
          z: worldPos.y
        };
      }
    }

    return {
      x: worldPos.x,
      y: worldPos.y,
      z: 0
    };
  },

  setStory(id) {
    const storyIndex = Number(id);
    const story = this.stories?.[storyIndex];

    this.activeStory = storyIndex;

    if (story) {
      this.currentStory = story.name;
      this.currentZ = Number(story.elevation ?? 0);
    }

    // Buscar la vista de planta que corresponde a ese piso
    const activeZ = Number(this.currentZ ?? 0);
    const tol = this.getActiveViewTolerance?.() ?? 0.001;

    const planViewIndex = this.viewSet?.findIndex((view) => {
      if (view.type !== "plan") return false;

      const viewElevation = Number(view.elevation ?? view.z ?? 0);

      return (
        Math.abs(viewElevation - activeZ) <= tol ||
        view.storyIndex === storyIndex ||
        view.storyName === story?.name ||
        view.name === story?.name
      );
    });

    if (planViewIndex >= 0) {
      this.activeViewIndex = planViewIndex;
    }

    this.clearAllSelections?.();

    console.log("Nivel activo:", {
      activeStory: this.activeStory,
      currentStory: this.currentStory,
      currentZ: this.currentZ,
      activeViewIndex: this.activeViewIndex,
      activeView: this.viewSet?.[this.activeViewIndex],
    });

    this.redraw?.();
    this.sync3D?.();
  },

  // viewer3d.js
  toggleView3D() {
    return toggleView3D(this);
  },

  initViewer3D(container) {
    return initViewer3D(this, container);
  },

  clear3D() {
    return clear3D();
  },

  sync3D() {
    return sync3D(this);
  },

  requestSync3D(reason = "sync3D") {
    if (this.syncPending) return;

    this.syncPending = true;

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        try {
          const viewer = getViewer3DState?.();

          if (viewer?.initialized && viewer?.scene) {
            this.sync3D?.();
          }
        } catch (error) {
          console.warn("⚠️ No se pudo sincronizar 3D:", reason, error);
        } finally {
          this.syncPending = false;
        }
      });
    });
  },

  refresh3DActiveView(reason = "refresh3DActiveView") {
    // Cada cambio de vista genera un token nuevo.
    // Si el usuario cambia vistas rápido, los tokens anteriores quedan cancelados.
    this.view3DUpdateToken = Number(this.view3DUpdateToken || 0) + 1;
    const token = this.view3DUpdateToken;

    // Cancelar actualización pendiente anterior
    if (this.view3DUpdateTimer) {
      clearTimeout(this.view3DUpdateTimer);
      this.view3DUpdateTimer = null;
    }

    // Esperar un poco para no reconstruir 3D en cada clic rápido
    this.view3DUpdateTimer = setTimeout(() => {
      requestAnimationFrame(() => {
        try {
          // Si ya hubo otro cambio de vista después, este update queda anulado
          if (token !== this.view3DUpdateToken) return;

          const viewer = getViewer3DState?.();

          if (!viewer?.initialized || !viewer?.scene) {
            return;
          }

          // IMPORTANTE:
          // No llamamos drawReferenceGrid3D aquí directamente.
          // sync3D ya debe encargarse de actualizar lo necesario.
          this.sync3D?.();

          console.log("✅ 3D actualizado por cambio de vista:", {
            reason,
            activeViewIndex: this.activeViewIndex,
            currentViewMode: this.currentViewMode,
            activeStory: this.activeStory,
            currentStory: this.currentStory,
            currentZ: this.currentZ,
            currentElevationX: this.currentElevationX,
            currentElevationZ: this.currentElevationZ,
          });
        } catch (error) {
          console.warn("⚠️ No se pudo actualizar vista 3D:", reason, error);
        } finally {
          this.view3DUpdateTimer = null;
        }
      });
    }, 350);
  },

  // =====================================================
  // 3D SNAP > RECONSTRUIR SNAP POINTS 3D DESDE cad_sys
  // Llama a la función global creada en viewer3d.js.
  // Tiene reintentos por si Babylon todavía no terminó de iniciar.
  // =====================================================
  rebuild3DGridSnapPointsSoon(reason = "manual", attempts = 8) {
    const run = () => {
      const viewer = getViewer3DState?.();

      if (!viewer?.initialized || !viewer?.scene) {
        if (attempts > 0) {
          setTimeout(() => {
            this.rebuild3DGridSnapPointsSoon?.(reason, attempts - 1);
          }, 300);
        }

        return;
      }

      if (typeof window.__jhRebuild3DGridSnapPoints !== "function") {
        console.warn(
          "⚠️ window.__jhRebuild3DGridSnapPoints no está disponible. Revisa viewer3d.js"
        );
        return;
      }

      window.__jhRebuild3DGridSnapPoints(this);

      console.log("✅ Snap Points 3D reconstruidos desde cad_sys:", {
        reason,
        xGrids: this.referenceGrid?.xGrids?.length || 0,
        yGrids: this.referenceGrid?.yGrids?.length || 0,
        stories: this.stories?.length || 0,
      });
    };

    setTimeout(run, 250);
  },

  drawIn3D() {
    return drawIn3D(this);
  },

  // grid3D.js
  createFull3DGrid(scene) {
    return createFull3DGrid(scene);
  },

  drawReferenceGrid3D() {
    return drawReferenceGrid3D(this);
  },

  clearReferenceGrid3D() {
    return clearReferenceGrid3D();
  },

  // camera3D.js
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

  // modeling3d.js
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

  closestNodeAtActiveView(searchPoint) {
    const view = this.viewSet?.[this.activeViewIndex];
    const tolerance = 0.05;
    const shortestDistance = 10;

    let closest = null;
    let best = shortestDistance;

    for (let i = 0; i < this.nodes.length; i++) {
      const node = this.nodes[i];

      const x = node.position.x || 0;
      const y = node.position.y || 0;
      const z = node.position.z || 0;

      let belongs = true;
      let screenPos = null;

      if (view?.type === "plan") {
        belongs = Math.abs(z - (view.elevation ?? 0)) <= tolerance;

        screenPos = this.grid.worldToScreen({
          x: x,
          y: y,
        });
      } else if (view?.type === "elevation") {
        if (view.axis === "X") {
          // 🔥 Plano Y-Z
          belongs = Math.abs(x - view.value) <= tolerance;

          screenPos = this.grid.worldToScreen({
            x: y,
            y: z,
          });
        } else if (view.axis === "Y") {
          // 🔥 Plano X-Z
          belongs = Math.abs(y - view.value) <= tolerance;

          screenPos = this.grid.worldToScreen({
            x: x,
            y: z,
          });
        }
      }

      if (!belongs || !screenPos) continue;

      const distance = pointDistance(searchPoint, screenPos);
      if (distance > best) continue;

      closest = node;
      best = distance;
    }

    return closest;
  },



  canSelectInCurrentView() {
    // const view = this.viewSet?.[this.activeViewIndex];
    // return !!(view && view.type === "plan");
    return true;
  },

  // =====================================================
  // SELECTION > LIMPIAR TODA LA SELECCIÓN
  // Versión única y activa.
  // Limpia nodos, barras, áreas, dimensiones, estados internos,
  // MoveObjectState, ReshapeObjectState y highlights 3D.
  // =====================================================
  clearAllSelections() {
    // =====================================================
    // SELECTION > FUNCIÓN SEGURA PARA LIMPIAR UN OBJETO
    // No usa setObjectSelected para evitar llamadas internas
    // a style.default() sin validar.
    // =====================================================
    const safeUnselectObject = (obj) => {
      if (!obj) return;

      obj.selected = false;
      obj.isSelected = false;
      obj.highlighted3D = false;
      obj.is3DOnlyEndpointHover = false;

      if (obj.style && typeof obj.style.default === "function") {
        obj.style.default();
      }
    };

    // =====================================================
    // SELECTION > LIMPIAR OBJETOS DEL MODELO
    // =====================================================
    this.nodes?.forEach((node) => {
      safeUnselectObject(node);
    });

    this.shapes?.forEach((frame) => {
      safeUnselectObject(frame);
    });

    this.areas?.forEach((area) => {
      safeUnselectObject(area);
    });

    this.dimensionLines?.forEach((dim) => {
      safeUnselectObject(dim);
    });

    this.parametricModels?.forEach((parametric) => {
      safeUnselectObject(parametric);
    });

    // =====================================================
    // SELECTION > LIMPIAR ESTADOS DE SELECCIÓN
    // Protegemos state.exit() porque algunos estados antiguos
    // pueden usar style.default() directamente.
    // =====================================================
    const states = [
      this.selectedNodesState,
      this.selectedBeamsState,
      this.selectedParametricState,
      this.selectedAreasState,
      this.selectedDimensionLinesState,
      this.selectionState,
    ];

    states.forEach((state) => {
      if (!state) return;

      try {
        state.exit?.();
      } catch (error) {
        console.warn("⚠️ state.exit falló durante clearAllSelections:", {
          state: state.constructor?.name,
          error: error?.message,
        });
      }

      if (Array.isArray(state.selectedObjects)) {
        state.selectedObjects = [];
      }

      if (Array.isArray(state.selectedNodes)) {
        state.selectedNodes = [];
      }

      if (Array.isArray(state.selectedBeams)) {
        state.selectedBeams = [];
      }

      if (Array.isArray(state.selectedAreas)) {
        state.selectedAreas = [];
      }

      if (Array.isArray(state.selectedDimensionLines)) {
        state.selectedDimensionLines = [];
      }

      if (Array.isArray(state.objects)) {
        state.objects = [];
      }

      state.selectedObject = null;
      state.selectedNode = null;
      state.selectedBeam = null;
      state.selectedArea = null;
    });

    // =====================================================
    // SELECTION > LIMPIAR MOVE OBJECT
    // =====================================================
    if (this.moveObjectState) {
      safeUnselectObject(this.moveObjectState.selectedObject);

      this.moveObjectState.selectedObject = null;
      this.moveObjectState.selectedNode = null;
      this.moveObjectState.selectedBeam = null;
      this.moveObjectState.selectedArea = null;
      this.moveObjectState.isMoving = false;
      this.moveObjectState.startPoint = null;
      this.moveObjectState.lastPoint = null;
    }

    // =====================================================
    // SELECTION > LIMPIAR RESHAPE OBJECT
    // =====================================================
    if (this.reshapeObjectState) {
      safeUnselectObject(this.reshapeObjectState.selectedObject);
      safeUnselectObject(this.reshapeObjectState.selectedNode);
      safeUnselectObject(this.reshapeObjectState.selectedBeam);
      safeUnselectObject(this.reshapeObjectState.selectedArea);

      this.reshapeObjectState.selectedObject = null;
      this.reshapeObjectState.selectedNode = null;
      this.reshapeObjectState.selectedBeam = null;
      this.reshapeObjectState.selectedArea = null;
      this.reshapeObjectState.selectedVertexIndex = null;
      this.reshapeObjectState.isMoving = false;
    }

    // =====================================================
    // SELECTION > LIMPIAR VARIABLES GLOBALES
    // =====================================================
    this.selectedNode = null;
    this.selectedBeam = null;
    this.selectedArea = null;
    this.selectedObject = null;

    this.selectedBeams = [];
    this.selectedObjects = [];

    this.hovered3DOnlyEndpointNode = null;
    this.hovered3DOnlyEndpointFrames = [];
    this.last3DOnlyEndpointHelpKey = null;

    // =====================================================
    // 3D DRAW > DESBLOQUEAR CÁMARA
    // =====================================================
    window.__jhSet3DDrawCameraLock?.(false);

    // =====================================================
    // 3D > FORZAR LIMPIEZA DE HIGHLIGHTS
    // =====================================================
    this.forceClear3DFrameHighlights = true;

    // =====================================================
    // DRAW 3D > CONSERVAR NODO INICIAL SI ESTOY DIBUJANDO
    // Permite cambiar de planta/elevación entre primer y segundo clic.
    // =====================================================
    if (
      this.activeDrawTool === "frame" &&
      this.isDrawingFrame3D === true &&
      this.frame3DStartNode
    ) {
      this.frame3DStartNode.selected = true;
      this.frame3DStartNode.isSelected = true;
    }

    console.log("🧹 clearAllSelections ejecutado:", {
      selectedFrames: this.shapes?.filter((frame) =>
        frame.selected || frame.isSelected || frame.highlighted3D
      ).length,
      selectedNodes: this.nodes?.filter((node) =>
        node.selected || node.isSelected
      ).length,
    });

    // =====================================================
    // RENDER > ACTUALIZAR VISTAS
    // =====================================================
    try {
      this.redraw?.();
    } catch (error) {
      console.warn("⚠️ redraw falló después de clearAllSelections:", error?.message);
    }

    try {
      this.sync3D?.();

      requestAnimationFrame(() => {
        this.sync3D?.();
      });
    } catch (error) {
      console.warn("⚠️ sync3D falló después de clearAllSelections:", error?.message);
    }

    this.showMessage?.("Selección limpiada");
  },

  // MOSTRAR indicador visual de vista activa
  getActiveViewLabel() {
    const view = this.viewSet?.[this.activeViewIndex];

    if (!view) {
      return "Vista 2D";
    }

    return `Vista 2D (${view.name})`;
  },

  getActiveViewBadgeClass() {
    const view = this.viewSet?.[this.activeViewIndex];

    if (!view) {
      return "bg-gray-900 text-white";
    }

    if (view.type === "plan") {
      return "bg-gray-900 text-white";
    }

    if (view.type === "elevation") {
      return "bg-blue-900 text-blue-100";
    }

    return "bg-gray-900 text-white";
  },

  getActive3DViewLabel() {
    const view = this.viewSet?.[this.activeViewIndex];

    if (!view) {
      return "Vista 3D";
    }

    return `Vista 3D (${view.name})`;
  },

  // ========== MÉTODOS DE DIBUJO PARA ELEVACIONES ==========

  drawElevationView() {
    const ctx = this.ctx;
    ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    let currentY = 0;
    const elev = this.xElevations.find((e) => e.name == this.currentElevationX);
    // console.log("elev encontrado:", elev);

    if (elev) currentY = elev.y;
    // console.log("currentY:", currentY);

    const nodesToDraw = this.nodes.filter((node) => Math.abs(node.position.y - currentY) < 0.1);
    const beamsToDraw = this.shapes.filter((beam) => {
      if (this.shouldDrawFrameIn2D && !this.shouldDrawFrameIn2D(beam)) {
        return false;
      }

      return nodesToDraw.includes(beam.node1) && nodesToDraw.includes(beam.node2);
    });

    this.drawElevationGridOnly(currentY);

    beamsToDraw.forEach((beam) => {
      const p1 = this.grid.worldToScreen({ x: beam.node1.position.x, y: beam.node1.position.z || 0 });
      const p2 = this.grid.worldToScreen({ x: beam.node2.position.x, y: beam.node2.position.z || 0 });
      ctx.beginPath();
      ctx.moveTo(p1.x, p1.y);
      ctx.lineTo(p2.x, p2.y);
      ctx.strokeStyle = "#aaaaaa";
      ctx.lineWidth = 3;
      ctx.stroke();
    });

    nodesToDraw.forEach((node) => {
      const p = this.grid.worldToScreen({ x: node.position.x, y: node.position.z || 0 });
      ctx.beginPath();
      ctx.arc(p.x, p.y, 5, 0, 2 * Math.PI);
      ctx.fillStyle = "#ff8888";
      ctx.fill();
      ctx.fillStyle = "white";
      ctx.font = "10px Arial";
      ctx.fillText(node.id, p.x + 8, p.y - 5);
    });

    ctx.font = "bold 14px Arial";
    ctx.fillStyle = "#4a90d9";
    ctx.fillText(`📐 ELEVACIÓN Eje X-${this.currentElevationX} (Y = ${currentY}m) - Plano X-Z`, 15, 50);
  },

  drawElevationGridOnly(currentY) {
    const tempGrid = this.grid;
    const ctx = this.ctx;

    ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);


    ctx.save();
    ctx.strokeStyle = "#3a6a9a";
    ctx.fillStyle = "#8aadcc";
    ctx.lineWidth = 0.8;
    ctx.font = "11px 'Segoe UI', Arial";
    ctx.setLineDash([]);

    const refGrid = this.referenceGrid;
    if (!refGrid || !refGrid.xPositions || refGrid.xPositions.length === 0) {
      ctx.restore();
      return;
    }

    const xPositions = refGrid.xPositions;
    const xLabels = refGrid.xLabels; // A, B, C, D...
    const storyCount = refGrid.storyCount;
    const storyHeight = refGrid.storyHeight;

    const axisColor = "#ff6666";
    const lineColor = "#3a6a9a";
    const textColor = "#8aadcc";

    // Líneas horizontales (niveles Z)
    for (let floor = 0; floor <= storyCount; floor++) {
      const z = floor * storyHeight;
      const screenY = tempGrid.worldToScreen({ x: 0, y: z }).y;

      ctx.beginPath();
      ctx.strokeStyle = floor === 0 ? axisColor : lineColor;
      ctx.lineWidth = floor === 0 ? 1.5 : 0.5;
      ctx.setLineDash(floor === 0 ? [] : [5, 5]);
      ctx.moveTo(0, screenY);
      ctx.lineTo(this.canvas.width, screenY);
      ctx.stroke();

      ctx.fillStyle = floor === 0 ? axisColor : textColor;
      ctx.font = floor === 0 ? "bold 10px Arial" : "10px Arial";
      const label = floor === 0 ? "BASE" : `STORY${floor}`;
      ctx.fillText(label, 10, screenY - 5);

      ctx.fillStyle = "#666";
      ctx.font = "9px Arial";
      ctx.fillText(`${z}m`, 80, screenY - 5);
    }

    // Líneas verticales del plano X-Z (ejes A, B, C, D...)
    xPositions.forEach((x, index) => {
      const screenX = tempGrid.worldToScreen({ x, y: 0 }).x;

      ctx.beginPath();
      ctx.strokeStyle = lineColor;
      ctx.lineWidth = 0.8;
      ctx.setLineDash([8, 4]);
      ctx.moveTo(screenX, 0);
      ctx.lineTo(screenX, this.canvas.height);
      ctx.stroke();

      ctx.fillStyle = textColor;
      ctx.font = "11px Arial";
      ctx.fillText(xLabels[index], screenX - 6, this.canvas.height - 10);
    });

    ctx.setLineDash([]);

    const origin = tempGrid.worldToScreen({ x: 0, y: 0 });
    ctx.beginPath();
    ctx.arc(origin.x, origin.y, 5, 0, 2 * Math.PI);
    ctx.fillStyle = "#ff8888";
    ctx.fill();

    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 10px Arial";
    ctx.fillText("0,0", origin.x + 8, origin.y - 5);

    // Título correcto para elevaciones numéricas
    ctx.font = "bold 12px 'Segoe UI', Arial";
    ctx.fillStyle = "#4a90d9";
    ctx.fillText(`📐 ELEVACIÓN Eje Y-${this.currentElevationZ} (Y = ${currentY}m) - Plano X-Z`, 15, 30);

    ctx.font = "10px Arial";
    ctx.fillStyle = "#888";
    ctx.fillText("Haz clic para dibujar | Esc para salir", 15, 50);

    ctx.restore();
  },

  drawReferenceGridOnly(grid, context) {

    if (isElevationX) {
      this.drawElevationGridOnly(grid, context);
    } else if (isElevationY) {
      this.drawElevationZGridOnly(grid, context, view);
    } else {
      this.drawPlanGrid(grid, context, refGrid);
    }

    const ctx = context.ctx;
    const refGrid = context.referenceGrid;
    const view = context.viewSet?.[context.activeViewIndex];

    console.log("=== drawReferenceGridOnly ===");
    console.log("view:", view);
    console.log("view?.type:", view?.type);
    console.log("view?.axis:", view?.axis);
    console.log("currentElevationX:", context.currentElevationX);
    console.log("currentElevationZ:", context.currentElevationZ);

    if (!refGrid || !refGrid.xPositions || refGrid.xPositions.length === 0) return;

    const isElevationView = view?.type === "elevation";
    const isElevationX = isElevationView && view.axis === "X";
    const isElevationY = isElevationView && view.axis === "Y";

    console.log("isElevationX:", isElevationX);
    console.log("isElevationY:", isElevationY);

    if (isElevationX) {
      console.log("🔴 DIBUJANDO drawElevationGridOnly (debería mostrar letras A,B,C)");
      this.drawElevationGridOnly(grid, context);
    } else if (isElevationY) {
      console.log("🔵 DIBUJANDO drawElevationZGridOnly (debería mostrar números 1,2,3)");
      this.drawElevationZGridOnly(grid, context);
    } else {
      console.log("🟢 DIBUJANDO drawPlanGrid");
      this.drawPlanGrid(grid, context, refGrid);
    }
  },

  drawElevationZView(currentX) {
    const ctx = this.ctx;
    ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    const nodesToDraw = this.nodes.filter((node) => Math.abs(node.position.x - currentX) < 0.1);
    const beamsToDraw = this.shapes.filter(
      (beam) => nodesToDraw.includes(beam.node1) && nodesToDraw.includes(beam.node2),
    );

    this.drawElevationZGrid(currentX);

    beamsToDraw.forEach((beam) => {
      const p1 = this.grid.worldToScreen({ x: beam.node1.position.y || 0, y: beam.node1.position.z || 0 });
      const p2 = this.grid.worldToScreen({ x: beam.node2.position.y || 0, y: beam.node2.position.z || 0 });
      ctx.beginPath();
      ctx.moveTo(p1.x, p1.y);
      ctx.lineTo(p2.x, p2.y);
      ctx.strokeStyle = "#aaaaaa";
      ctx.lineWidth = 3;
      ctx.stroke();
    });

    nodesToDraw.forEach((node) => {
      const p = this.grid.worldToScreen({ x: node.position.y || 0, y: node.position.z || 0 });
      ctx.beginPath();
      ctx.arc(p.x, p.y, 5, 0, 2 * Math.PI);
      ctx.fillStyle = "#ff8888";
      ctx.fill();
      ctx.fillStyle = "white";
      ctx.font = "10px Arial";
      ctx.fillText(node.id, p.x + 8, p.y - 5);
    });

    ctx.font = "bold 14px Arial";
    ctx.fillStyle = "#4a90d9";
    ctx.fillText(`📐 ELEVACIÓN Eje Z-${this.currentElevationZ} (X = ${currentX}m) - Plano Y-Z`, 15, 50);
  },

  drawElevationZGrid(currentX) {
    const tempGrid = this.grid;
    const ctx = this.ctx;
    ctx.save();
    ctx.strokeStyle = "#3a6a9a";
    ctx.fillStyle = "#8aadcc";
    ctx.lineWidth = 0.8;
    ctx.font = "11px 'Segoe UI', Arial";
    ctx.setLineDash([]);

    const refGrid = this.referenceGrid;
    if (!refGrid || !refGrid.yPositions || refGrid.yPositions.length === 0) {
      ctx.restore();
      return;
    }

    const yPositions = refGrid.yPositions;
    const yLabels = refGrid.yLabels; // 1, 2, 3...
    const storyCount = refGrid.storyCount;
    const storyHeight = refGrid.storyHeight;
    const axisColor = "#ff6666";
    const lineColor = "#3a6a9a";
    const textColor = "#8aadcc";

    // Líneas horizontales (pisos)
    for (let floor = 0; floor <= storyCount; floor++) {
      const z = floor * storyHeight;
      const screenY = tempGrid.worldToScreen({ x: 0, y: z }).y;

      ctx.beginPath();
      ctx.strokeStyle = floor === 0 ? axisColor : lineColor;
      ctx.lineWidth = floor === 0 ? 1.5 : 0.5;
      ctx.setLineDash(floor === 0 ? [] : [5, 5]);
      ctx.moveTo(0, screenY);
      ctx.lineTo(this.canvas.width, screenY);
      ctx.stroke();

      ctx.fillStyle = floor === 0 ? axisColor : textColor;
      ctx.font = floor === 0 ? "bold 10px Arial" : "10px Arial";
      const label = floor === 0 ? "BASE" : `STORY${floor}`;
      ctx.fillText(label, 10, screenY - 5);
      ctx.fillStyle = "#666";
      ctx.font = "9px Arial";
      ctx.fillText(`${z}m`, 80, screenY - 5);
    }

    // Líneas verticales (ejes Y - 1, 2, 3...)
    yPositions.forEach((y, index) => {
      const screenX = tempGrid.worldToScreen({ x: y, y: 0 }).x;
      const isActive = this.currentElevationZ === String(yLabels[index]);

      ctx.beginPath();
      ctx.strokeStyle = isActive ? axisColor : lineColor;
      ctx.lineWidth = isActive ? 2 : 0.8;
      ctx.setLineDash(isActive ? [] : [8, 4]);
      ctx.moveTo(screenX, 0);
      ctx.lineTo(screenX, this.canvas.height);
      ctx.stroke();

      ctx.fillStyle = isActive ? axisColor : textColor;
      ctx.font = isActive ? "bold 12px Arial" : "11px Arial";
      ctx.fillText(yLabels[index], screenX - 6, this.canvas.height - 10);
    });

    ctx.setLineDash([]);
    const origin = tempGrid.worldToScreen({ x: 0, y: 0 });
    ctx.beginPath();
    ctx.arc(origin.x, origin.y, 5, 0, 2 * Math.PI);
    ctx.fillStyle = "#ff8888";
    ctx.fill();
    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 10px Arial";
    ctx.fillText("0,0", origin.x + 8, origin.y - 5);

    ctx.font = "bold 12px 'Segoe UI', Arial";
    ctx.fillStyle = "#4a90d9";
    ctx.fillText(`📐 Vista Y-Z (Eje ${this.currentElevationZ}) - X = ${currentX}m`, 15, 30);
    ctx.font = "10px Arial";
    ctx.fillStyle = "#888";
    ctx.fillText("Haz clic para dibujar | Esc para salir", 15, 50);

    ctx.restore();
  },

  getCurrentZ() {
    if (this.currentStory && this.stories) {
      const story = this.stories.find((s) => s.name === this.currentStory);
      if (story) return story.elevation;
    }
    return 0;
  },

  getCurrentElevationY() {
    if (this.currentElevationX !== "none") {
      const elev = this.xElevations.find((e) => String(e.name) === String(this.currentElevationX));
      if (elev) return elev.y;
    }
    return 0;
  },

  // HELPER
  getClosestObjectAtView(searchPoint) {
    const node = this.closestNodeAtActiveView(searchPoint);
    if (node) return { type: "node", object: node };

    const beam = this.closestBeamAtActiveView(searchPoint);
    if (beam) return { type: "beam", object: beam };

    return null;
  },

  getEnabledReinforcementBars() {
    return this.reinforcementBarSizes.filter((bar) => bar.enabled);
  },

  getSteelFrameDesignConfig() {
    return {
      ...this.steelFrameDesign,
    };
  },

  selectByXYPlane() {
    return this.selectByPlane("XY");
  },

  selectByXZPlane() {
    return this.selectByPlane("XZ");
  },

  selectByYZPlane() {
    return this.selectByPlane("YZ");
  },

  deselectByXYPlane() {
    return this.deselectByPlane("XY");
  },

  deselectByXZPlane() {
    return this.deselectByPlane("XZ");
  },

  deselectByYZPlane() {
    return this.deselectByPlane("YZ");
  },

  // AGREGADO
  getFrameObjects() {
    return this.getSelectableObjects().filter((obj) => {
      const type = obj.elementType || obj.type || obj.objectType;

      return (
        obj.node1 && obj.node2 ||
        type === "beam" ||
        type === "column" ||
        type === "brace" ||
        type === "secondary-beam" ||
        type === "frame"
      );
    });
  },

  getFrameSectionKey(frame) {
    if (!frame) return null;

    const section =
      frame.sectionId ||
      frame.sectionName ||
      frame.frameSection ||
      frame.frameSectionId ||
      frame.section?.id ||
      frame.section?.name ||
      frame.seccion ||
      frame.sección ||
      frame.section ||
      frame._section ||
      frame._A ||
      frame.A ||
      null;

    if (section && typeof section === "object") {
      return section.name || section.id || "Sin sección";
    }

    return section ? String(section) : "Sin sección";
  },

  getUsedFrameSections() {
    const sections = new Set();

    this.getFrameObjects().forEach((frame) => {
      const sectionKey = this.getFrameSectionKey(frame);

      if (sectionKey && sectionKey !== "Sin sección") {
        sections.add(sectionKey);
      }
    });

    return Array.from(sections);
  },

  async selectByFrameSections() {
    const sections = this.getUsedFrameSections();

    if (!sections.length) {
      this.showMessage?.("No hay secciones de marco disponibles", "warning");
      return;
    }

    const inputOptions = {};

    sections.forEach((section) => {
      inputOptions[section] = section;
    });

    const result = await Swal.fire({
      title: "Seleccionar por Secciones de Marco",
      input: "select",
      inputOptions,
      inputPlaceholder: "Selecciona una sección",
      showCancelButton: true,
      confirmButtonText: "Seleccionar",
      cancelButtonText: "Cancelar",
    });

    if (!result.isConfirmed || !result.value) return;

    const selectedSection = result.value;

    const objects = this.getFrameObjects().filter((frame) => {
      return this.getFrameSectionKey(frame) === selectedSection;
    });

    this.deselectAllFromMenu?.();

    this.selectObjects(objects);

    this.showMessage?.(
      `Sección ${selectedSection}: ${objects.length} elementos seleccionados`
    );
  },

  async deselectByFrameSections() {
    const sections = this.getUsedFrameSections();

    if (!sections.length) {
      this.showMessage?.("No hay secciones de marco disponibles", "warning");
      return;
    }

    const inputOptions = {};

    sections.forEach((section) => {
      inputOptions[section] = section;
    });

    const result = await Swal.fire({
      title: "Deseleccionar por Secciones de Marco",
      input: "select",
      inputOptions,
      inputPlaceholder: "Selecciona una sección",
      showCancelButton: true,
      confirmButtonText: "Deseleccionar",
      cancelButtonText: "Cancelar",
    });

    if (!result.isConfirmed || !result.value) return;

    const selectedSection = result.value;

    const objects = this.getSelectedObjects().filter((frame) => {
      return this.getFrameSectionKey(frame) === selectedSection;
    });

    this.deselectObjects(objects);

    this.showMessage?.(
      `Sección ${selectedSection}: ${objects.length} elementos deseleccionados`
    );
  },
});
