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

import { initViewer3D, toggleView3D, clear3D, sync3D, drawIn3D, getViewer3DState } from "./3d/viewer3d.js";

import { createFull3DGrid, drawReferenceGrid3D, clearReferenceGrid3D } from "./3d/grid3d.js";

import { Grid } from "./grid.js";
import { DiseñoRenderer, DeflexionRenderer, AxialRenderer } from "./renderer.js";
import {
  IdleState,
  PanAndZoomState,
  TrussDrawingState,
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

  preferences: {
    lengthUnit: "m",
    forceUnit: "kN",

    // Para considerar dos puntos como iguales
    modelTolerance: 0.001,

    // Distancia en píxeles para que el mouse capture una intersección
    snapScreenTolerance: 14,

    // Tolerancia en coordenadas reales
    snapWorldTolerance: 1.0,
  },

  steelFrameDesign: {
    code: "AISC 360-16",
    designMethod: "LRFD",
    checkDeflection: true,
    checkSlenderness: true,
    phiBending: 0.90,
    phiCompression: 0.90,
  },

  reinforcementBarSizes: [
    { name: "#3", diameterMm: 9.5, areaMm2: 71, enabled: true },
    { name: "#4", diameterMm: 12.7, areaMm2: 129, enabled: true },
    { name: "#5", diameterMm: 15.9, areaMm2: 199, enabled: true },
    { name: "#6", diameterMm: 19.1, areaMm2: 284, enabled: true },
    { name: "#8", diameterMm: 25.4, areaMm2: 510, enabled: true },
  ],

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
  },

  massSource: {
    open: false,
    sources: {
      fromLoads: true,
      fromElements: false,
      multiplier: 1.0,
    },
  },

  menus: Object.values(menus),
  getMenuContent,


  // ===========================================================
  // ========== PROPIEDADES PARA LA SECION MATERIALES ==============
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
  },

  massSource: {
    open: false,
    sources: {
      fromLoads: true,
      fromElements: false,
      multiplier: 1.0,
    },
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

  loadCombinations: {
    items: [],
    selectedCombination: null,
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

  massSource: {
    massDefinition: "self",
    loadMultipliers: [{ load: "DEAD", multiplier: 1 }],
    includeLateralMassOnly: false,
    lumpLateralMassAtStoryLevels: false,
  },

  groups: {
    items: [],
    selectedGroup: null,
  },

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

  initSys(canvas, distanceInput) {
    this.Arco = Arco;
    this.Triangle = Triangle;
    this.Puente = Puente;
    this.options = {
      showGrid: true,
      showDeflection: true,
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
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d");
    this.distanceInput = distanceInput;
    this.shapes = [];
    this.nodes = [];
    this.areas = [];
    this.referencePoints = [];
    this.dimensionLines = [];
    this.parametricModels = [];
    this.K_Global_Reducido = [];
    this.Fuerzas_Globales_Reducidas = [];
    this.D_Global_Reducido = [];
    this.deflecciones = [];
    this.desplazamientosPosition = [];
    this.matrizDesplazamiento = [];
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
    this.idleState = new IdleState();
    this.moveState = new PanAndZoomState();
    this.trussDrawingState = new TrussDrawingState(this);
    this.pointDrawingState = new PointDrawingState(this);
    this.braceDrawingState = new TrussDrawingState(this, "brace");
    this.beamDrawingState = new TrussDrawingState(this, "beam");
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

    this.nextNodeId = 1;
    this.nextBeamId = 1;
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

  openMaterialProperties() {
    openMaterialDialog(this);
  },

  openFrameSections() {
    openSectionDialog(this);
  },

  openLoadCases() {
    openLoadCaseDialog(this);
  },

  openLoadCombinations() {
    openCombinationDialog(this);
  },

  openMassSource() {
    openMassSourceDialog(this);
  },

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

  handleKeyDown(event) {
    this.currentState.handleKeyDown(event, this);
  },

  handleMouseWheel(event) {
    this.currentState.handleMouseWheel(event, this, mousePositionFrom(this.canvas, event));
  },

  handleMouseClick(event) {
    this.currentState.handleMouseClick(event, this, mousePositionFrom(this.canvas, event));
  },

  handleMouseDown(event) {
    this.currentState.handleMouseDown(event, this, mousePositionFrom(this.canvas, event));
  },

  handleMouseUp(event) {
    this.currentState.handleMouseUp(event, this, mousePositionFrom(this.canvas, event));
  },

  handleMouseMove(event) {
    const { x, y } = mousePositionFrom(this.canvas, event);
    this.mousePos = this.grid.screenToWorld({ x, y });

    if (this.snap_enabled) {
      this.mousePos.x =
        Math.floor((this.mousePos.x + 0.5) * this.grid.gridSpacing) +
        this.grid.gridSpacing -
        Math.floor(this.grid.gridSpacing);

      this.mousePos.y =
        Math.floor((this.mousePos.y + 0.5) * this.grid.gridSpacing) +
        this.grid.gridSpacing -
        Math.floor(this.grid.gridSpacing);
    }

    if (this.currentViewMode === "plan") {
      this.updatePlanGridSnap(this.mousePos, { x, y });
    } else if (
      this.currentViewMode === "elevationX" ||
      this.currentViewMode === "elevationY"
    ) {
      this.updateElevationGridSnap(this.mousePos, { x, y });
    } else {
      this.activeGridPoint = null;
    }

    this.currentState.handleMouseMove(event, this, { x, y });
  },

  handleMouseLeave(event) {
    this.currentState.handleMouseLeave(event, this, mousePositionFrom(this.canvas, event));
  },

  setState(state, args) {
    this.currentState.exit();
    this.prevState = this.currentState;
    this.currentState = state;
    this.currentState.enter(args);
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

  closestBeam(searchPoint) {
    var shortestDistance = 5;
    return this.shapes.find((s) => {
      const lineLength = pointDistance(
        this.grid.worldToScreen(s.node1.position),
        this.grid.worldToScreen(s.node2.position),
      );
      const d1 = pointDistance(this.grid.worldToScreen(s.node1.position), searchPoint);
      const d2 = pointDistance(this.grid.worldToScreen(s.node2.position), searchPoint);
      if (d1 + d2 >= lineLength - shortestDistance && d1 + d2 <= lineLength + shortestDistance) {
        return true;
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

  // Open / Save
  openModel() {
    // Crear input file para abrir modelo JSON
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".json,.e2k";
    input.onchange = async (e) => {
      const file = e.target.files[0];
      const text = await file.text();
      try {
        const data = JSON.parse(text);
        this.loadFromJSON(data);
        this.showMessage("✅ Modelo cargado correctamente");
      } catch (err) {
        this.showMessage("❌ Error al cargar el archivo", "error");
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
  importETABS_E2K() { this.showMessage('📥 Importar ETABS .e2k - Próximamente'); },
  importETABS6() { this.showMessage('📥 Importar ETABS6 - Próximamente'); },
  importETABS_EDB() { this.showMessage('📥 Importar ETABS .edb - Próximamente'); },
  importDXFGrid() { this.showMessage('📥 Importar DXF de Grilla - Próximamente'); },
  importDXFFloorPlan() { this.showMessage('📥 Importar Plano DXF - Próximamente'); },
  importDXF3D() { this.showMessage('📥 Importar Modelo 3D DXF - Próximamente'); },
  importIFC() { this.showMessage('📥 Importar IFC - Próximamente'); },
  importIGES() { this.showMessage('📥 Importar IGES - Próximamente'); },
  importCIS2() { this.showMessage('📥 Importar CIS/2 - Próximamente'); },
  importRevit() { this.showMessage('📥 Importar Revit - Próximamente'); },
  importProSteel() { this.showMessage('📥 Importar ProSteel - Próximamente'); },
  importFrameworks() { this.showMessage('📥 Importar Frameworks - Próximamente'); },
  importSTRUDL() { this.showMessage('📥 Importar STRUDL/STAAD - Próximamente'); },

  // Export methods
  exportETABS_E2K() { this.showMessage('📤 Exportar a ETABS .e2k - Próximamente'); },
  exportSAFE_V8() { this.showMessage('📤 Exportar a SAFE V8 - Próximamente'); },
  exportSAFE_V12() { this.showMessage('📤 Exportar a SAFE V12 - Próximamente'); },
  exportETABS_EDB() { this.showMessage('📤 Exportar a ETABS .edb - Próximamente'); },
  exportProSteelMDB() { this.showMessage('📤 Exportar a ProSteel - Próximamente'); },

  // Print methods
  createVideo() {
    this.showMessage("🎥 Crear Video - Próximamente");
  },

  printSetup() {
    this.showMessage("🖨️ Configurar Impresión - Próximamente");
  },

  printGraphics() {
    window.print();
    this.showMessage("🖨️ Enviando a impresora...");
  },

  // ========== MÉTODOS PARA EXPORTAR/IMPORTAR MODELO formato JSON ==========

  exportToJSON() {
    // Exportar el modelo completo a JSON
    const modelData = {
      // Información del modelo
      version: "1.0",
      date: new Date().toISOString(),

      // Nodos
      nodes: this.nodes.map((node) => ({
        id: node.id,
        x: node.position.x,
        y: node.position.y,
        z: node.position.z || 0,
        constraints: node.constraints || null,
      })),

      // Elementos (barras)
      beams: this.shapes.map((beam) => ({
        id: beam.id,
        node1: beam.node1.id,
        node2: beam.node2.id,
        material: beam.material || null,
        section: beam.section || null,
      })),

      // Materiales
      materials: this.materialProperties?.materials || [],

      // Secciones de Frame
      frameSections: this.frameSections?.sections || [],

      // Casos de carga
      loadCases: this.loadCases?.cases || [],

      // Combinaciones de carga
      loadCombinations: this.loadCombinations?.combinations || [],

      // Diafragmas
      diaphragms: this.diaphragms?.items || [],

      // Cortes de sección
      sectionCuts: this.sectionCuts?.items || [],

      // Grupos
      groups: this.groups?.items || [],

      // Opciones de análisis
      analysisOptions: this.analysisOptions || null,

      // Fuente de masa
      massSource: this.massSource || null,

      // Parámetros dinámicos
      dynamicParams: this.dynamicParams || null,
    };

    return modelData;
  },

  importFromJSON(jsonData) {
    try {
      const data = typeof jsonData === "string" ? JSON.parse(jsonData) : jsonData;

      // Importar nodos
      if (data.nodes && Array.isArray(data.nodes)) {
        this.nodes = data.nodes.map((node) => {
          const newNode = new StructuralNode(node.x, node.y, node.z, node.id);
          if (node.constraints) newNode.constraints = node.constraints;
          return newNode;
        });
        this.nextNodeId = Math.max(...this.nodes.map((n) => n.id), 0) + 1;
      }

      // Importar elementos
      if (data.beams && Array.isArray(data.beams)) {
        this.shapes = data.beams
          .map((beam) => {
            const node1 = this.nodes.find((n) => n.id === beam.node1);
            const node2 = this.nodes.find((n) => n.id === beam.node2);
            if (node1 && node2) {
              const newBeam = new Beam(node1, node2, beam.id);
              if (beam.material) newBeam.material = beam.material;
              if (beam.section) newBeam.section = beam.section;
              return newBeam;
            }
            return null;
          })
          .filter((beam) => beam !== null);
        this.nextBeamId = Math.max(...this.shapes.map((b) => b.id), 0) + 1;
      }

      // Importar materiales
      if (data.materials) {
        this.materialProperties.materials = data.materials;
      }

      // Importar secciones de frame
      if (data.frameSections) {
        this.frameSections.sections = data.frameSections;
      }

      // Importar casos de carga
      if (data.loadCases) {
        this.loadCases.cases = data.loadCases;
      }

      // Importar combinaciones de carga
      if (data.loadCombinations) {
        this.loadCombinations.combinations = data.loadCombinations;
      }

      // Importar diafragmas
      if (data.diaphragms) {
        this.diaphragms.items = data.diaphragms;
      }

      // Importar cortes de sección
      if (data.sectionCuts) {
        this.sectionCuts.items = data.sectionCuts;
      }

      // Importar grupos
      if (data.groups) {
        this.groups.items = data.groups;
      }

      // Importar opciones de análisis
      if (data.analysisOptions) {
        this.analysisOptions = data.analysisOptions;
      }

      // Importar fuente de masa
      if (data.massSource) {
        this.massSource = data.massSource;
      }

      // Importar parámetros dinámicos
      if (data.dynamicParams) {
        this.dynamicParams = data.dynamicParams;
      }

      // Redibujar y sincronizar
      this.redraw();
      this.sync3D();

      return true;
    } catch (error) {
      console.error("Error al importar JSON:", error);
      return false;
    }
  },

  loadFromJSON(jsonData) {
    return this.importFromJSON(jsonData);
  },

  // ===============================================
  // ========== MÉTODOS PARA EL MENÚ EDIT ==========
  // ===============================================

  undo() {
    if (this.undoStack && this.undoStack.length > 0) {
      const lastState = this.undoStack.pop();
      this.restoreState(lastState);
      this.showMessage("↩️ Deshacer realizado");
    } else {
      this.showMessage("↩️ No hay acciones para deshacer", "warning");
    }
  },

  redo() {
    if (this.redoStack && this.redoStack.length > 0) {
      const nextState = this.redoStack.pop();
      this.restoreState(nextState);
      this.showMessage("↪️ Rehacer realizado");
    } else {
      this.showMessage("↪️ No hay acciones para rehacer", "warning");
    }
  },

  cut() {
    if (this.moveObjectState && this.moveObjectState.selectedObject) {
      this.copyToClipboard();
      this.deleteSelected();
      this.showMessage("✂️ Elemento(s) cortado(s)");
    } else {
      this.showMessage("✂️ Seleccione un elemento para cortar", "warning");
    }
  },

  copy() {
    this.copyToClipboard();
    this.showMessage("📋 Elemento(s) copiado(s)");
  },

  paste() {
    if (this.clipboardElements) {
      this.pasteFromClipboard();
      this.showMessage("📌 Elemento(s) pegado(s)");
    } else {
      this.showMessage("📌 No hay elementos para pegar", "warning");
    }
  },

  deleteSelected() {
    if (this.moveObjectState && this.moveObjectState.selectedObject) {
      const obj = this.moveObjectState.selectedObject;
      if (obj.isBeam) {
        const index = this.shapes.findIndex((b) => b === obj);
        if (index !== -1) this.shapes.splice(index, 1);
      } else if (obj.isNode) {
        const index = this.nodes.findIndex((n) => n === obj);
        if (index !== -1) this.nodes.splice(index, 1);
      }
      this.moveObjectState.selectedObject = null;
      this.redraw();
      this.sync3D();
      this.showMessage("🗑️ Elemento(s) eliminado(s)");
    } else {
      this.showMessage("🗑️ Seleccione un elemento para eliminar", "warning");
    }
  },

  replicate() {
    Swal.fire({
      title: "Replicar",
      html: `
            <div class="text-left">
                <div class="mb-3">
                    <label class="block text-xs font-semibold text-gray-400 mb-2">Número de copias</label>
                    <input type="number" id="copies" value="1" min="1" class="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white text-sm">
                </div>
                <div class="mb-3">
                    <label class="block text-xs font-semibold text-gray-400 mb-2">Desplazamiento X</label>
                    <input type="number" step="any" id="dx" value="0" class="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white text-sm">
                </div>
                <div class="mb-3">
                    <label class="block text-xs font-semibold text-gray-400 mb-2">Desplazamiento Y</label>
                    <input type="number" step="any" id="dy" value="0" class="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white text-sm">
                </div>
                <div class="mb-3">
                    <label class="block text-xs font-semibold text-gray-400 mb-2">Desplazamiento Z</label>
                    <input type="number" step="any" id="dz" value="0" class="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white text-sm">
                </div>
            </div>
        `,
      confirmButtonText: "Replicar",
      cancelButtonText: "Cancelar",
      showCancelButton: true
    }).then((result) => {
      if (result.isConfirmed) {
        const copies = parseInt(document.getElementById('copies').value);
        const dx = parseFloat(document.getElementById('dx').value);
        const dy = parseFloat(document.getElementById('dy').value);
        const dz = parseFloat(document.getElementById('dz').value);
        this.replicateElements(copies, dx, dy, dz);
      }
    });
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
    Swal.fire({
      title: "Editar Datos de Pisos",
      html: `
            <div class="text-left">
                <div class="mb-3">
                    <label class="block text-xs font-semibold text-gray-400 mb-2">Lista de Pisos</label>
                    <div id="storyList" class="border border-gray-700 rounded bg-gray-900 max-h-40 overflow-y-auto">
                        ${this.stories.map((story, idx) => `
                            <div class="flex justify-between items-center px-3 py-2 border-b border-gray-700">
                                <input type="text" value="${story.name}" data-idx="${idx}" data-field="name" class="story-input w-24 bg-gray-800 text-white text-sm px-2 py-1 rounded">
                                <input type="number" step="0.5" value="${story.elevation}" data-idx="${idx}" data-field="elevation" class="story-input w-20 bg-gray-800 text-white text-sm px-2 py-1 rounded">
                                <button class="delete-story text-red-400 hover:text-red-300" data-idx="${idx}">✕</button>
                            </div>
                        `).join('')}
                    </div>
                </div>
                <div class="grid grid-cols-2 gap-3">
                    <input type="text" id="newStoryName" placeholder="Nombre del piso" class="w-full px-2 py-1 bg-gray-700 border border-gray-600 rounded text-white text-sm">
                    <input type="number" id="newStoryElevation" step="0.5" placeholder="Elevación" class="w-full px-2 py-1 bg-gray-700 border border-gray-600 rounded text-white text-sm">
                    <button id="addStoryBtn" class="col-span-2 px-3 py-1 bg-green-600 hover:bg-green-500 rounded text-white text-sm">+ Agregar Piso</button>
                </div>
            </div>
        `,
      confirmButtonText: "Guardar",
      cancelButtonText: "Cancelar",
      showCancelButton: true,
      didOpen: (popup) => {
        popup.querySelector('#addStoryBtn').onclick = () => {
          const name = popup.querySelector('#newStoryName').value;
          const elevation = parseFloat(popup.querySelector('#newStoryElevation').value);
          if (name) {
            this.stories.push({ id: this.stories.length, name, elevation });
            this.updateStoryList(popup);
          }
        };
        popup.querySelectorAll('.delete-story').forEach(btn => {
          btn.onclick = (e) => {
            const idx = parseInt(btn.getAttribute('data-idx'));
            this.stories.splice(idx, 1);
            this.updateStoryList(popup);
          };
        });
      }
    }).then((result) => {
      if (result.isConfirmed) {
        this.redraw();
        this.sync3D();
        this.showMessage("🏢 Datos de pisos actualizados");
      }
    });
  },

  updateStoryList(popup) {
    const container = popup.querySelector('#storyList');
    container.innerHTML = this.stories.map((story, idx) => `
        <div class="flex justify-between items-center px-3 py-2 border-b border-gray-700">
            <input type="text" value="${story.name}" data-idx="${idx}" data-field="name" class="story-input w-24 bg-gray-800 text-white text-sm px-2 py-1 rounded">
            <input type="number" step="0.5" value="${story.elevation}" data-idx="${idx}" data-field="elevation" class="story-input w-20 bg-gray-800 text-white text-sm px-2 py-1 rounded">
            <button class="delete-story text-red-400 hover:text-red-300" data-idx="${idx}">✕</button>
        </div>
    `).join('');

    popup.querySelectorAll('.story-input').forEach(input => {
      input.onchange = (e) => {
        const idx = parseInt(input.getAttribute('data-idx'));
        const field = input.getAttribute('data-field');
        this.stories[idx][field] = input.value;
      };
    });

    popup.querySelectorAll('.delete-story').forEach(btn => {
      btn.onclick = (e) => {
        const idx = parseInt(btn.getAttribute('data-idx'));
        this.stories.splice(idx, 1);
        this.updateStoryList(popup);
      };
    });
  },

  editReferencePlanes() {
    this.showMessage("📐 Editar planos de referencia - Próximamente");
  },

  editReferenceLines() {
    this.showMessage("━━ Editar líneas de referencia - Próximamente");
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

  restoreState(state) {
    if (state.nodes) this.nodes = state.nodes;
    if (state.shapes) this.shapes = state.shapes;
    this.redraw();
    this.sync3D();
  },

  // Guardar estado para undo/redo
  saveState() {
    return {
      nodes: JSON.parse(JSON.stringify(this.nodes)),
      shapes: JSON.parse(JSON.stringify(this.shapes)),
    };
  },

  // ===============================================
  // ========== MÉTODOS PARA EL MENÚ VIEW ==========
  // ===============================================

  set3DView() {
    // this.setViewIso();
    // this.showMessage("🎥 Vista 3D configurada");

    window.dispatchEvent(new CustomEvent('open-view-modal', { detail: { view: '3d' } }));
  },

  setPlanView() {
    // this.setViewPlan();
    // this.showMessage("🗺️ Vista en planta configurada");

    window.dispatchEvent(new CustomEvent('open-view-modal', { detail: { view: 'plan' } }));
  },

  setElevationView() {
    // Mostrar diálogo para seleccionar elevación
    // if (this.stories && this.stories.length > 0) {
    //   let storyNames = this.stories.map((s) => s.name);
    //   Swal.fire({
    //     title: "Configurar Vista en Elevación",
    //     input: "select",
    //     inputOptions: storyNames.reduce((acc, story) => {
    //       acc[story] = story;
    //       return acc;
    //     }, {}),
    //     inputPlaceholder: "Seleccione un nivel",
    //     showCancelButton: true,
    //     confirmButtonText: "Configurar",
    //     cancelButtonText: "Cancelar",
    //   }).then((result) => {
    //     if (result.isConfirmed && result.value) {
    //       let selectedStory = this.stories.find((s) => s.name === result.value);
    //       if (selectedStory) {
    //         // Configurar vista de elevación
    //         this.setViewFront();
    //         this.showMessage(`📐 Vista en elevación - Nivel: ${selectedStory.name}`);
    //       }
    //     }
    //   });
    // } else {
    //   this.showMessage("📐 Configurar Vista en Elevación");
    // }

    // Primero preguntar qué tipo de elevación (X o Y)
    window.dispatchEvent(new CustomEvent('open-view-modal', { detail: { view: 'elevation' } }));
  },

  rubberBandZoom() {
    this.showMessage("🔍 Zoom con recuadro - Arrastre para seleccionar área");
    // Cambiar al modo de zoom con recuadro
    if (this.panAndZoomState) {
      // Activar modo de zoom con recuadro
    }
  },

  restoreFullView() {
    this.fitContentToScreen();
    this.showMessage("🖼️ Vista completa restaurada");
  },

  previousZoom() {
    if (this.zoomHistory && this.zoomHistory.length > 0) {
      const previousState = this.zoomHistory.pop();
      this.grid.restoreState(previousState);
      this.redraw();
      this.showMessage("⏪ Zoom anterior restaurado");
    } else {
      this.showMessage("⏪ No hay zoom anterior disponible", "warning");
    }
  },

  zoomInOneStep() {
    this.grid.zoomInToScreenPoint({ x: this.canvas.width / 2, y: this.canvas.height / 2 });
    this.redraw();
    this.showMessage("🔍+ Zoom +1");
  },

  zoomOutOneStep() {
    this.grid.zoomOutToScreenPoint({ x: this.canvas.width / 2, y: this.canvas.height / 2 });
    this.redraw();
    this.showMessage("🔍- Zoom -1");
  },

  panView() {
    this.showMessage("✋ Modo panorámica - Arrastre para mover la vista");
    // Cambiar al modo de panorámica
    if (this.panAndZoomState) {
      this.setState(this.panAndZoomState);
    }
  },

  // Método auxiliar para guardar estado de zoom
  saveZoomState() {
    if (!this.zoomHistory) this.zoomHistory = [];
    this.zoomHistory.push(this.grid.getState());
    if (this.zoomHistory.length > 20) this.zoomHistory.shift();
  },

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
  showDeformedShape() {
    this.options.showDeflection = !this.options.showDeflection;
    this.redraw();
    this.sync3D();
    this.showMessage(this.options.showDeflection ? "📈 Forma deformada activada" : "📈 Forma deformada desactivada");
  },

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

  selectByXYPlane() {
    this.showMessage("📐 Selección en plano XY - Próximamente");
  },

  selectByXZPlane() {
    this.showMessage("📐 Selección en plano XZ - Próximamente");
  },

  selectByYZPlane() {
    this.showMessage("📐 Selección en plano YZ - Próximamente");
  },

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

  invertSelection() {
    // Invertir selección de nodos
    if (this.selectedNodesState && this.selectedNodesState.selectedObjects) {
      let allNodes = this.nodes;
      let currentlySelected = this.selectedNodesState.selectedObjects;
      let newSelection = allNodes.filter((node) => !currentlySelected.includes(node));
      this.selectedNodesState.selectedObjects = newSelection;
      this.redraw();
      this.sync3D();
      this.showMessage(`🔄 Selección invertida: ${newSelection.length} nodos seleccionados`);
    } else {
      this.showMessage("🔄 Invertir selección - Próximamente");
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

  deselectByXYPlane() {
    this.showMessage("📐 Deseleccionar en plano XY - Próximamente");
  },

  deselectByXZPlane() {
    this.showMessage("📐 Deseleccionar en plano XZ - Próximamente");
  },

  deselectByYZPlane() {
    this.showMessage("📐 Deseleccionar en plano YZ - Próximamente");
  },

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

  showUndeformedShape() {
    // Desactivar deformación si estaba activada
    this.options.showDeflection = false;
    this.redraw();
    this.sync3D();
    this.showMessage("📐 Mostrando forma no deformada");
  },

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
  showDeformedShape() {
    // Diálogo para configurar la forma deformada
    Swal.fire({
      title: "Mostrar Forma Deformada",
      html: `
            <div class="text-left">
                <div class="mb-3">
                    <label class="block text-xs font-semibold text-gray-400 mb-2">Factor de Escala</label>
                    <input type="range" id="deflectionScale" min="1" max="1000" value="100" class="w-full">
                    <div class="flex justify-between text-xs text-gray-500 mt-1">
                        <span>1</span><span>100</span><span>200</span><span>500</span><span>1000</span>
                    </div>
                </div>
                <div class="mb-3">
                    <label class="flex items-center gap-2">
                        <input type="checkbox" id="showUndefShape" checked>
                        <span class="text-sm text-gray-300">Mostrar forma no deformada como referencia</span>
                    </label>
                </div>
                <div class="mb-3">
                    <label class="flex items-center gap-2">
                        <input type="checkbox" id="animateDeformation">
                        <span class="text-sm text-gray-300">Animar deformación</span>
                    </label>
                </div>
            </div>
        `,
      confirmButtonText: "Aplicar",
      cancelButtonText: "Cancelar",
      showCancelButton: true,
      preConfirm: () => {
        return {
          scale: parseInt(document.getElementById("deflectionScale").value),
          showUndefShape: document.getElementById("showUndefShape").checked,
          animate: document.getElementById("animateDeformation").checked,
        };
      },
    }).then((result) => {
      if (result.isConfirmed) {
        this.options.showDeflection = true;
        this.options.deflectionScale = result.value.scale;
        this.redraw();
        this.sync3D();
        this.showMessage(`📈 Mostrando forma deformada (escala: ${result.value.scale})`);
      }
    });
  },

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
    // Buscar el modal por clase o ID
    const modalEl = document.querySelector('[x-data="newModelModal()"]');
    console.log("modalEl:", modalEl);
    if (modalEl && modalEl.__x) {
      modalEl.__x.$data.openModal();
    } else {
      console.warn("Modal no encontrado, intentando con evento...");
      window.dispatchEvent(new CustomEvent("open-new-model-modal"));
    }
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

    // this.referenceGrid = {
    //   xCount: params.gridXCount,
    //   yCount: params.gridYCount,
    //   xSpacing: params.gridXSpacing,
    //   ySpacing: params.gridYSpacing,
    //   storyCount: params.storyCount,
    //   storyHeight: params.storyHeight,

    //   xPositions: [],
    //   yPositions: [],
    //   xLabels: [],
    //   yLabels: [],

    //   xGrids: this.buildXGrids(params.gridXCount, params.gridXSpacing),
    //   yGrids: this.buildYGrids(params.gridYCount, params.gridYSpacing),
    //   generalGrids: [],
    // };

    // this.rebuildGeneralGrids();

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
    this.rebuildViewSetFromReferenceGrid();
    this.rebuildElevationListsFromReferenceGrid();

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

    if (viewer.initialized && viewer.scene) {
      this.grid3DDrawn = false;
      this.clearReferenceGrid3D();
      this.drawReferenceGrid3D();
      this.sync3D();
    } else {
      this.pendingGrid3D = true;
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

  getActivePlanElevation() {
    const view = this.viewSet?.[this.activeViewIndex];

    if (view?.type === "plan") {
      return view.elevation ?? 0;
    }

    return this.stories?.[this.activeStory]?.elevation ?? 0;
  },

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

  buildSnapDisplayLabel(point) {
    if (!point) return "";

    switch (point.source) {
      case "general-grid-intersection":
        return `Intersection ${point.gridId} × ${point.baseGridId}`;

      case "general-grid-endpoint":
        return `Endpoint ${point.gridId}`;

      case "general-grid":
        return `Grid ${point.gridId}`;

      default:
        if (point.xGridId && point.yGridId) {
          return `Grid Point ${point.xGridId} ${point.yGridId}`;
        }
        return point.label || "";
    }
  },

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

  setViewFromSet(index) {
    this.activeViewIndex = Number(index);
    const view = this.viewSet[this.activeViewIndex];
    if (!view) return;

    if (this.currentState && this.currentState.exit) {
      this.currentState.exit();
    }

    this.clearAllSelections();
    this.activeGridPoint = null;

    if (view.type === "plan") {
      this.currentViewMode = "plan";
      this.currentElevationX = "none";
      this.currentElevationZ = "none";

      const story = this.stories.find((s) => s.elevation === view.elevation);
      if (story) this.currentStory = story.name;

    } else if (view.type === "elevation" && view.axis === "X") {
      // Letras A,B,C... => plano Y-Z
      this.currentViewMode = "elevationX";
      this.currentElevationZ = view.label;
      this.currentElevationX = "none";

    } else if (view.type === "elevation" && view.axis === "Y") {
      // Números 1,2,3... => plano X-Z
      this.currentViewMode = "elevationY";
      this.currentElevationX = view.label;
      this.currentElevationZ = "none";
    }

    this.currentState = this.idleState;
    if (this.currentState.enter) {
      this.currentState.enter();
    }

    this.redraw();
    this.sync3D();
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
    this.activeStory = Number(id);

    console.log("Nivel activo:", this.stories[this.activeStory]);

    this.redraw(); // 2D
    this.sync3D(); // 3D
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

  // closestNodeAtActiveView(searchPoint) {
  //   const view = this.viewSet?.[this.activeViewIndex];
  //   const tolerance = 0.05;
  //   const shortestDistance = 10;

  //   let closest = null;
  //   let best = shortestDistance;

  //   for (let i = 0; i < this.nodes.length; i++) {
  //     const node = this.nodes[i];
  //     const distance = pointDistance(searchPoint, this.grid.worldToScreen(node.position));
  //     if (distance > best) continue;

  //     const x = node.position.x || 0;
  //     const y = node.position.y || 0;
  //     const z = node.position.z || 0;

  //     let belongs = true;

  //     if (view?.type === "plan") {
  //       belongs = Math.abs(z - (view.elevation ?? 0)) <= tolerance;
  //     } else if (view?.type === "elevation") {
  //       if (view.axis === "X") belongs = Math.abs(x - view.value) <= tolerance;
  //       if (view.axis === "Y") belongs = Math.abs(y - view.value) <= tolerance;
  //     }

  //     if (!belongs) continue;

  //     closest = node;
  //     best = distance;
  //   }

  //   return closest;
  // },

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

  closestBeamAtActiveView(searchPoint) {
    const view = this.viewSet?.[this.activeViewIndex];
    const tolerance = 0.05;
    let closest = null;
    let shortestDistance = 10;

    for (let i = 0; i < this.shapes.length; i++) {
      const beam = this.shapes[i];
      if (!beam?.node1 || !beam?.node2) continue;

      const x1 = beam.node1.position.x || 0;
      const y1 = beam.node1.position.y || 0;
      const z1 = beam.node1.position.z || 0;

      const x2 = beam.node2.position.x || 0;
      const y2 = beam.node2.position.y || 0;
      const z2 = beam.node2.position.z || 0;

      let belongs = true;
      let p1, p2;

      if (view?.type === "plan") {
        belongs =
          Math.abs(z1 - (view.elevation ?? 0)) <= tolerance && Math.abs(z2 - (view.elevation ?? 0)) <= tolerance;

        p1 = this.grid.worldToScreen({ x: x1, y: y1 });
        p2 = this.grid.worldToScreen({ x: x2, y: y2 });
      } else if (view?.type === "elevation") {
        if (view.axis === "X") {
          // 🔥 Plano Y-Z
          belongs = Math.abs(x1 - view.value) <= tolerance && Math.abs(x2 - view.value) <= tolerance;

          p1 = this.grid.worldToScreen({ x: y1, y: z1 });
          p2 = this.grid.worldToScreen({ x: y2, y: z2 });
        } else if (view.axis === "Y") {
          // 🔥 Plano X-Z
          belongs = Math.abs(y1 - view.value) <= tolerance && Math.abs(y2 - view.value) <= tolerance;

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

  canSelectInCurrentView() {
    // const view = this.viewSet?.[this.activeViewIndex];
    // return !!(view && view.type === "plan");
    return true;
  },

  clearAllSelections() {
    const states = [
      this.selectedNodesState,
      this.selectedBeamsState,
      this.selectedParametricState,
      this.selectedAreasState,
      this.selectedDimensionLinesState,
    ];

    states.forEach((state) => {
      if (state?.selectedObjects?.length) {
        state.exit?.();
        state.selectedObjects = [];
      }
    });

    if (this.moveObjectState) {
      // Limpiar el selectedObject antes de salir
      if (this.moveObjectState.selectedObject) {
        this.moveObjectState.selectedObject.style.default();
      }
      this.moveObjectState.selectedObject = null;
      this.moveObjectState.isMoving = false;
    }

    if (this.dimensionLines?.length) {
      this.dimensionLines.forEach((dim) => {
        dim.selected = false;
      });
    }

    if (this.areas?.length) {
      this.areas.forEach((area) => {
        area.selected = false;
      });
    }

    this.selectedNode = null;
    this.selectedBeam = null;
    this.selectedObject = null;
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
    const beamsToDraw = this.shapes.filter(
      (beam) => nodesToDraw.includes(beam.node1) && nodesToDraw.includes(beam.node2),
    );

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
});