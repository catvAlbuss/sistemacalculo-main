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
  init() {},

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
  referenceGrid: null,

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
    this.mousePos = this.grid.screenToWorld({ x: x, y: y });
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
    this.currentState.handleMouseMove(event, this, mousePositionFrom(this.canvas, event));
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

  /* closestMarker(searchPoint) {
    // Returns null if there are 0 points in the shape
    var shortestDistance = 5;
    for (let index = 0; index < markers.length; index++) {
      const p = markers[index].point;
      const distance = pointDistance(searchPoint, this.grid.worldToScreen(p));
      if (distance <= shortestDistance) {
        return markers[index];
      }
    }
  } */

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

  // redraw() {
  //   this.currentRenderer.render(this);
  // },

  redraw() {
    // Usar tus métodos de dibujo originales
    if (this.currentViewMode === "elevation" && this.currentElevationX !== "none") {
      // Vista de NÚMEROS (1,2,3...) - Plano X-Z con letras A,B,C
      this.drawElevationView();
    } else if (this.currentViewMode === "elevationZ" && this.currentElevationZ !== "none") {
      // Vista de LETRAS (A,B,C...) - Plano Y-Z con números 1,2,3
      const elev = this.zElevations.find((e) => e.name === this.currentElevationZ);
      if (elev) {
        this.drawElevationZView(elev.x);
      } else {
        this.currentRenderer.render(this);
      }
    } else {
      // Vista PLANTA
      this.currentRenderer.render(this);
    }

    // Sincronizar 3D
    if (window.babylonInitialized && window.babylonScene) {
      if (this._syncTimeout) clearTimeout(this._syncTimeout);
      this._syncTimeout = setTimeout(() => {
        this.drawIn3D();
      }, 50);
    }
  },

  // redraw() {
  //   console.log("=== REDRAW ===");
  //   console.log("currentViewMode:", this.currentViewMode);
  //   console.log("currentElevationX:", this.currentElevationX);
  //   console.log("currentElevationZ:", this.currentElevationZ);

  //   if (this.currentViewMode === "elevation" && this.currentElevationX !== "none") {
  //     console.log("📐 Llamando a drawElevationView para vista:", this.currentElevationX);
  //     this.drawElevationView(); // ← TU método
  //   } else if (this.currentViewMode === "elevationZ" && this.currentElevationZ !== "none") {
  //     console.log("📐 Llamando a drawElevationZView para vista:", this.currentElevationZ);
  //     const elev = this.zElevations.find((e) => e.name === this.currentElevationZ);
  //     if (elev) {
  //       this.drawElevationZView(elev.x);
  //     } else {
  //       this.currentRenderer.render(this);
  //     }
  //   } else {
  //     console.log("📐 Vista PLANTA");
  //     this.currentRenderer.render(this);
  //   }

  //   if (window.babylonInitialized && window.babylonScene) {
  //     if (this._syncTimeout) clearTimeout(this._syncTimeout);
  //     this._syncTimeout = setTimeout(() => {
  //       this.drawIn3D();
  //     }, 50);
  //   }
  // },

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

  createModelFromDialog(params) {
    console.log("🏗️ Configurando grid de referencia con parámetros:", params);

    this.referenceGrid = {
      xCount: params.gridXCount,
      yCount: params.gridYCount,
      xSpacing: params.gridXSpacing,
      ySpacing: params.gridYSpacing,
      storyCount: params.storyCount,
      storyHeight: params.storyHeight,
      xPositions: [],
      yPositions: [],
      xLabels: this.getXLabels(params.gridXCount),
      yLabels: this.getYLabels(params.gridYCount),
    };

    // 1. Primero llenar posiciones del grid
    for (let i = 0; i < params.gridXCount; i++) {
      this.referenceGrid.xPositions.push(i * params.gridXSpacing);
    }

    for (let i = 0; i < params.gridYCount; i++) {
      this.referenceGrid.yPositions.push(i * params.gridYSpacing);
    }

    // 2. Stories
    this.stories = [
      {
        id: 0,
        name: "Base",
        elevation: 0,
      },
    ];

    for (let i = 1; i <= params.storyCount; i++) {
      this.stories.push({
        id: i,
        name: `Piso ${i}`,
        elevation: i * params.storyHeight,
      });
    }

    this.activeStory = 0;

    // 3. ViewSet
    this.viewSet = [];

    // Planta base
    this.viewSet.push({
      type: "plan",
      storyId: 0,
      name: "Planta - Base",
      elevation: 0,
    });

    // Plantas por piso
    for (let i = 1; i <= params.storyCount; i++) {
      this.viewSet.push({
        type: "plan",
        storyId: i,
        name: `Planta - Piso ${i}`,
        elevation: i * params.storyHeight,
      });
    }

    // Elevaciones por ejes X => A, B, C...
    this.referenceGrid.xPositions.forEach((x, i) => {
      this.viewSet.push({
        type: "elevation",
        axis: "X",
        label: this.referenceGrid.xLabels[i],
        value: x,
        name: `Elevación ${this.referenceGrid.xLabels[i]}`,
      });
    });

    // Elevaciones por ejes Y => 1, 2, 3...
    this.referenceGrid.yPositions.forEach((y, i) => {
      this.viewSet.push({
        type: "elevation",
        axis: "Y",
        label: this.referenceGrid.yLabels[i],
        value: y,
        name: `Elevación ${this.referenceGrid.yLabels[i]}`,
      });
    });

    // Después de crear this.referenceGrid, agrega:
    this.xElevations = [];
    for (let i = 0; i < params.gridXCount; i++) {
      this.xElevations.push({
        name: (i + 1).toString(), // "1", "2", "3"... (NÚMEROS)
        y: i * params.gridXSpacing,
      });
    }

    this.zElevations = [];
    const letters = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J"];
    for (let i = 0; i < params.gridYCount; i++) {
      this.zElevations.push({
        name: letters[i % letters.length], // "A", "B", "C"... (LETRAS)
        x: i * params.gridYSpacing,
      });
    }

    this.activeViewIndex = 0;
    this.viewMode = "plan";

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

  setViewFromSet(index) {
    this.activeViewIndex = Number(index);
    const view = this.viewSet[this.activeViewIndex];
    if (!view) return;

    // Salir del estado actual limpiamente
    if (this.currentState && this.currentState.exit) {
      this.currentState.exit();
    }

    // Limpiar selecciones
    this.clearAllSelections();

    // Actualizar propiedades según la vista
    if (view.type === "plan") {
      this.currentViewMode = "plan";
      this.currentElevationX = "none";
      this.currentElevationZ = "none";
      const story = this.stories.find((s) => s.elevation === view.elevation);
      if (story) this.currentStory = story.name;
    } else if (view.type === "elevation" && view.axis === "X") {
      this.currentViewMode = "elevationZ";
      this.currentElevationZ = view.label;
      this.currentElevationX = "none";
    } else if (view.type === "elevation" && view.axis === "Y") {
      this.currentViewMode = "elevation";
      this.currentElevationX = view.label;
      this.currentElevationZ = "none";
    }

    // Establecer el nuevo estado
    this.currentState = this.idleState;
    if (this.currentState.enter) {
      this.currentState.enter();
    }

    this.redraw();
    this.sync3D();
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

  // closestBeamAtActiveView(searchPoint) {
  //   const view = this.viewSet?.[this.activeViewIndex];
  //   const tolerance = 0.05;
  //   let closest = null;
  //   let shortestDistance = 10;

  //   for (let i = 0; i < this.shapes.length; i++) {
  //     const beam = this.shapes[i];
  //     if (!beam?.node1 || !beam?.node2) continue;

  //     const x1 = beam.node1.position.x || 0;
  //     const y1 = beam.node1.position.y || 0;
  //     const z1 = beam.node1.position.z || 0;

  //     const x2 = beam.node2.position.x || 0;
  //     const y2 = beam.node2.position.y || 0;
  //     const z2 = beam.node2.position.z || 0;

  //     let belongs = true;

  //     if (view?.type === "plan") {
  //       belongs =
  //         Math.abs(z1 - (view.elevation ?? 0)) <= tolerance && Math.abs(z2 - (view.elevation ?? 0)) <= tolerance;
  //     } else if (view?.type === "elevation") {
  //       if (view.axis === "X") {
  //         belongs = Math.abs(x1 - view.value) <= tolerance && Math.abs(x2 - view.value) <= tolerance;
  //       }
  //       if (view.axis === "Y") {
  //         belongs = Math.abs(y1 - view.value) <= tolerance && Math.abs(y2 - view.value) <= tolerance;
  //       }
  //     }

  //     if (!belongs) continue;

  //     const p1 = this.grid.worldToScreen(beam.node1.position);
  //     const p2 = this.grid.worldToScreen(beam.node2.position);
  //     const dist = pointDistanceToSegment(searchPoint, p1, p2);

  //     if (dist < shortestDistance) {
  //       shortestDistance = dist;
  //       closest = beam;
  //     }
  //   }

  //   return closest;
  // },

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
    const xLabels = refGrid.xLabels; // A, B, C...
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

    // Líneas verticales (ejes X - A, B, C...)
    xPositions.forEach((x, index) => {
      const screenX = tempGrid.worldToScreen({ x: x, y: 0 }).x;
      const isActive = this.currentElevationX === (index + 1).toString();

      ctx.beginPath();
      ctx.strokeStyle = isActive ? axisColor : lineColor;
      ctx.lineWidth = isActive ? 2 : 0.8;
      ctx.setLineDash(isActive ? [] : [8, 4]);
      ctx.moveTo(screenX, 0);
      ctx.lineTo(screenX, this.canvas.height);
      ctx.stroke();

      ctx.fillStyle = isActive ? axisColor : textColor;
      ctx.font = isActive ? "bold 12px Arial" : "11px Arial";
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

    ctx.font = "bold 12px 'Segoe UI', Arial";
    ctx.fillStyle = "#4a90d9";
    ctx.fillText(`📐 Vista X-Z (Eje ${this.currentElevationX}) - Y = ${currentY}m`, 15, 30);
    ctx.font = "10px Arial";
    ctx.fillStyle = "#888";
    ctx.fillText("Haz clic para dibujar | Esc para salir", 15, 50);

    ctx.restore();
  },

  drawReferenceGridOnly(grid, context) {
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
