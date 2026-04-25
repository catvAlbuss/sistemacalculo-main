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

  activeStory: 0,

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
  lastMouseScreen: { x: 0, y: 0 },

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
    this.moveObjectState = new MoveObjectState();
    this.selectedNodesState = new SelectedNodesState();
    this.selectedBeamsState = new SelectedBeamsState();
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

    window.cadSystem = this;
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
    // Siempre usar el renderer principal para planta y elevaciones
    this.currentRenderer.render(this);

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
      this.statusCoordinates = `X ${mouseWorld.x.toFixed(2)}  Y ${mouseWorld.y.toFixed(2)}  Z ${z.toFixed(2)}`;
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
    this.statusCoordinates = `X ${point.x.toFixed(2)}  Y ${point.y.toFixed(2)}  Z ${point.z.toFixed(2)}`;
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

      this.statusCoordinates = `X ${snapX.value.toFixed(2)}  Y ${fixedY.toFixed(2)}  Z ${snapZ.z.toFixed(2)}`;
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

      this.statusCoordinates = `X ${fixedX.toFixed(2)}  Y ${snapY.value.toFixed(2)}  Z ${snapZ.z.toFixed(2)}`;
      return;
    }

    this.activeGridPoint = null;
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
    const states = [this.selectedNodesState, this.selectedBeamsState, this.selectedParametricState];

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

});
