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
import { pointDistance, mousePositionFrom, removeFromArray, axisToFixed } from "./utils.js";
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
  viewer3DInitialized: false, // ← NUEVA

  // NUEVAS PROPIEDADES
  calcEngine: "hybrid", // 'hybrid', 'opensees', 'octave'
  syncPending: false,

  // // Almacenamiento NO reactive para Three.js
  // threeScene: null, // ← NUEVA
  // threeCamera: null, // ← NUEVA
  // threeRenderer: null, // ← NUEVA
  // threeControls: null, // ← NUEVA
  // threeElements: null, // ← NUEVA

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
      if (container && !window.babylonInitialized) {
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
    this.currentRenderer.render(this);
    // Sincronizar vista 3D después de cada redibujado
    // if (window.babylonInitialized && window.babylonScene) {
    //   // Limpiar timeout anterior si existe
    //   if (this._syncTimeout) clearTimeout(this._syncTimeout);
    //   this._syncTimeout = setTimeout(() => {
    //     this.drawIn3D();
    //   }, 10);
    // }
  },

  windowResize() {
    // Set actual size in memory (scaled to account for extra pixel density).
    const scale = window.devicePixelRatio; // Change to 1 on retina screens to see blurry canvas.
    this.canvas.width = parseFloat(getComputedStyle(this.canvas).width) * scale;
    this.canvas.height = parseFloat(getComputedStyle(this.canvas).height) * scale;
    this.grid.resize(this.canvas);
    this.fitContentToScreen();
  },

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

  calcularFuerzas(event) {
    event.preventDefault();
    const formData = new FormData(event.target);
    formData.append(
      "nodos",
      "[" +
        this.nodes
          .map((node, index) => {
            return [index + 1, node.position.x, node.position.y, 0].join(",");
          })
          .join(";") +
        "]",
    );
    formData.append(
      "barras",
      "[" +
        this.shapes
          .map((beam, index) => {
            return [index + 1, this.nodes.indexOf(beam.node1) + 1, this.nodes.indexOf(beam.node2) + 1].join(",");
          })
          .join(";") +
        "]",
    );
    formData.append(
      "cargas",
      "[" +
        this.nodes
          .map((node, index) => {
            return { id: index + 1, node: node };
          })
          .filter(({ node: node }) => {
            return node.tieneCarga();
          })
          .map((value) => {
            return [value.id, value.node.cargaX(), value.node.cargaY(), 0].join(",");
          })
          .join(";") +
        "]",
    );
    formData.append(
      "restringidos",
      "[" +
        this.nodes
          .map((node, index) => {
            return { id: index + 1, node: node };
          })
          .map((value) => {
            let restriccion = [0, 0, 1];
            if (value.node.soporte === "soporteUno") {
              restriccion = [1, 1, 1];
            } else if (value.node.soporte === "soporteDos") {
              restriccion = [0, 1, 1];
            } else if (value.node.soporte === "soporteTres") {
              restriccion = [1, 0, 1];
            }
            return [value.id, ...restriccion];
          })
          .join(";") +
        "]",
    );
    formData.append(
      "propiedades",
      "[" +
        this.shapes
          .map((beam) => {
            return [beam.A, beam.E].join(",");
          })
          .join(";") +
        "]",
    );
    console.log(Object.fromEntries(formData));

    const swalTailwind = Swal.mixin({
      customClass: {
        confirmButton:
          "bg-blue-500 hover:bg-blue-400 text-white font-bold py-2 px-4 border-b-4 border-blue-700 hover:border-blue-500 rounded",
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
        console.log(fuerzas);
        const dataObject = fuerzas.data;
        this.matrizDesplazamiento = dataObject.MatrizDesplazamiento;
        this.calcularDeflecciones();
        Object.values(dataObject.resultados.lines).forEach(({ coords: _, fuerza: [f] }, index) => {
          this.shapes[index].fAxial = f;
          if (Math.abs(f) < 0.001) {
            this.shapes[index].style.normal();
          } else if (f < 0) {
            this.shapes[index].style.compresion();
          } else {
            this.shapes[index].style.traccion();
          }
        });
        this.nodes.forEach((n, index) => {
          const rX = dataObject.Reacciones[3 * index];
          const rY = dataObject.Reacciones[3 * index + 1];
          dataObject.Reacciones[3 * index + 2];
          n.reaction.x = Math.abs(rX) < 1.0e-8 ? 0 : rX;
          n.reaction.y = Math.abs(rY) < 1.0e-8 ? 0 : rY;
        });
        this.K_Global_Reducido = fuerzas.data.K_Global_Reducido;
        this.Fuerzas_Globales_Reducidas = fuerzas.data.Fuerzas_Globales_Reducidas;
        this.D_Global_Reducido = fuerzas.data.D_Global_Reducido;
        this.sync3D(); // ← AGREGAR
      })
      .catch((error) => {
        console.log(error);
        waitingPopup.hideLoading();
        swalTailwind.fire({
          icon: "error",
          html: `
            ${error}
          `,
          showConfirmButton: true,
        });
      });
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

  generarReporte() {
    this.save();
    this.fitContentToScreen();
    this.redraw();
    const diseño = this.canvas.toDataURL("image/png").replace("image/png", "image/octet-stream");
    this.currentRenderer = this.deflexionRenderer;
    this.redraw();
    const deflexion = this.canvas.toDataURL("image/png").replace("image/png", "image/octet-stream");
    this.currentRenderer = this.axialRenderer;
    this.redraw();
    const axial = this.canvas.toDataURL("image/png").replace("image/png", "image/octet-stream");
    this.restore();
    const colSpan = (this.K_Global_Reducido[0] ?? []).length - 1;
    const minmax = this.nodes.length !== 0 ? [Number.POSITIVE_INFINITY, Number.NEGATIVE_INFINITY] : [-0, 0];
    const [minx, maxx] = this.matrizDesplazamiento.reduce(
      ([min, max], [x, y, z]) => [Math.min(min, x), Math.max(max, x)],
      minmax,
    );
    const [miny, maxy] = this.matrizDesplazamiento.reduce(
      ([min, max], [x, y, z]) => [Math.min(min, y), Math.max(max, y)],
      minmax,
    );
    /* const maxDefx = ;
    const minDefy = ;
    const minDefy = ; */
    const docDefinition = {
      pageOrientation: "landscape",
      content: [
        { text: "1.- Nodos", style: "header", pageOrientation: "landscape" },
        {
          style: "tableExample",
          table: {
            headerRows: 2,
            widths: ["*", "*", "*", "*", "*", "*", "*"],
            body: [
              [{ text: "Nodos", style: "tableHeader", colSpan: 7, alignment: "center" }, {}, {}, {}, {}, {}, {}],
              [
                { text: "ID", style: "tableHeader", alignment: "center" },
                { text: "Dx", style: "tableHeader", alignment: "center" },
                { text: "Dy", style: "tableHeader", alignment: "center" },
                { text: "X", style: "tableHeader", alignment: "center" },
                { text: "Y", style: "tableHeader", alignment: "center" },
                { text: "Fx", style: "tableHeader", alignment: "center" },
                { text: "Fy", style: "tableHeader", alignment: "center" },
              ],
              ...this.nodes.map((n, index) => {
                return [
                  {
                    text: n.id,
                    alignment: "center",
                  },
                  {
                    text: axisToFixed(this.matrizDesplazamiento[index][0]),
                    alignment: "center",
                  },
                  {
                    text: axisToFixed(this.matrizDesplazamiento[index][1]),
                    alignment: "center",
                  },
                  {
                    text: n.position.x.toFixed(2),
                    alignment: "center",
                  },
                  {
                    text: n.position.y.toFixed(2),
                    alignment: "center",
                  },
                  {
                    text: n.cargaX().toFixed(2),
                    alignment: "center",
                  },
                  {
                    text: n.cargaX().toFixed(2),
                    alignment: "center",
                  },
                ];
              }),
            ],
          },
          layout: "lightHorizontalLines",
        },
        { text: "2.- Barras", style: "header" },
        {
          style: "tableExample",
          table: {
            headerRows: 2,
            widths: ["*", "*", "*", "*", "*", "*", "*", "*", "*", "*", "*"],
            body: [
              [
                { text: "Barras", style: "tableHeader", colSpan: 11, alignment: "center" },
                {},
                {},
                {},
                {},
                {},
                {},
                {},
                {},
                {},
                {},
              ],
              [
                { text: "ID", style: "tableHeader", alignment: "center" },
                { text: "Axial", style: "tableHeader", alignment: "center" },
                { text: "Cercano", style: "tableHeader", alignment: "center" },
                { text: "Lejano", style: "tableHeader", alignment: "center" },
                { text: "X1", style: "tableHeader", alignment: "center" },
                { text: "Y1", style: "tableHeader", alignment: "center" },
                { text: "X2", style: "tableHeader", alignment: "center" },
                { text: "Y2", style: "tableHeader", alignment: "center" },
                { text: "L", style: "tableHeader", alignment: "center" },
                { text: "E", style: "tableHeader", alignment: "center" },
                { text: "A", style: "tableHeader", alignment: "center" },
              ],
              ...this.shapes.map((s) => {
                return [
                  {
                    text: s.id,
                    alignment: "center",
                  },
                  {
                    text: s.fAxial.toFixed(3),
                    alignment: "center",
                  },
                  {
                    text: s.node1.id,
                    alignment: "center",
                  },
                  {
                    text: s.node2.id,
                    alignment: "center",
                  },
                  {
                    text: s.node1.position.x.toFixed(2),
                    alignment: "center",
                  },
                  {
                    text: s.node1.position.y.toFixed(2),
                    alignment: "center",
                  },
                  {
                    text: s.node2.position.x.toFixed(2),
                    alignment: "center",
                  },
                  {
                    text: s.node2.position.y.toFixed(2),
                    alignment: "center",
                  },
                  {
                    text: pointDistance(s.node1.position, s.node2.position).toFixed(2),
                    alignment: "center",
                  },
                  {
                    text: s.E.toFixed(2),
                    alignment: "center",
                  },
                  {
                    text: s.A.toFixed(2),
                    alignment: "center",
                  },
                ];
              }),
            ],
          },
          layout: "lightHorizontalLines",
        },
        { text: "3.- Diseño", style: "header", pageBreak: "before", pageOrientation: "portrait" },
        {
          image: diseño,
          width: 500,
        },
        { text: "4.- Deflexion", style: "header" },
        {
          image: deflexion,
          width: 500,
        },
        { text: "5.- Axial", style: "header", pageBreak: "before" },
        {
          image: axial,
          width: 500,
        },
        { text: "6.- Resultados", style: "header", pageBreak: "before", pageOrientation: "landscape" },
        {
          style: "tableExample",
          table: {
            headerRows: 1,
            widths: [
              ...(this.K_Global_Reducido[0] ?? [1]).map(() => {
                return "*";
              }),
              "*",
              "*",
            ],
            body: [
              /* [{ text: "", alignment: "center" }], */
              [
                {
                  text: "K Global Reducido",
                  style: "tableHeader",
                  colSpan: this.K_Global_Reducido[0]?.length ?? 1,
                  alignment: "center",
                },
                ...Array.from(Array(colSpan < 0 ? 0 : colSpan), () => {
                  return {};
                }),
                { text: "Fuerzas Globales Reducidas", style: "tableHeader", alignment: "center" },
                { text: "D Global Reducido", style: "tableHeader", alignment: "center" },
              ],
              ...this.K_Global_Reducido.map((valores, index) => {
                return [
                  ...valores.map((val) => {
                    return {
                      text: val.toFixed(2),
                      alignment: "center",
                      style: "resultados",
                    };
                  }),
                  {
                    text: this.Fuerzas_Globales_Reducidas[index].toFixed(2),
                    alignment: "center",
                    style: "resultados",
                  },
                  {
                    text: this.D_Global_Reducido[index].toFixed(2),
                    alignment: "center",
                    style: "resultados",
                  },
                ];
              }),
            ],
          },
          layout: "lightHorizontalLines",
        },
        {
          text: `La maxima deflexion en x es: ${axisToFixed(maxx)}`,
          style: "tableExample",
          pageBreak: "before",
          pageOrientation: "landscape",
        },
        {
          text: `La minima deflexion en x es: ${axisToFixed(minx)}`,
          style: "tableExample",
        },
        {
          text: `La maxima deflexion en y es: ${axisToFixed(maxy)}`,
          style: "tableExample",
        },
        {
          text: `La minima deflexion en y es: ${axisToFixed(miny)}`,
          style: "tableExample",
        },
      ],
      styles: {
        header: {
          fontSize: 16,
          bold: true,
          margin: [0, 0, 0, 10],
        },
        subheader: {
          fontSize: 16,
          bold: true,
          margin: [0, 10, 0, 5],
        },
        tableExample: {
          margin: [0, 5, 0, 15],
        },
        tableHeader: {
          bold: true,
          fontSize: 13,
          color: "black",
        },
        resultados: {
          fontSize: 8,
          color: "black",
        },
      },
    };
    pdfMake.createPdf(docDefinition).download("aligerados.pdf");
  },
  // // Reemplaza todas las funciones 3D con estas versiones:

  // // NUEVO MÉTODO: Alternar vista 3D
  // toggleView3D() {
  //   this.show3DView = !this.show3DView;

  //   if (this.show3DView) {
  //     this.$nextTick(() => {
  //       const container = document.getElementById("viewer3d-container");
  //       if (container && !window.threeInitialized) {
  //         this.initViewer3D(container);
  //       } else if (window.threeScene) {
  //         this.drawIn3D();
  //       }
  //     });
  //   }
  // },

  // // NUEVO MÉTODO: Inicializar visor 3D (usando window)
  // initViewer3D(container) {
  //   if (window.threeInitialized) return;

  //   const width = container.clientWidth;
  //   const height = container.clientHeight;

  //   // Crear objetos y guardarlos en window (evita el proxy de Alpine)
  //   window.threeScene = new THREE.Scene();
  //   window.threeScene.background = new THREE.Color(0x1a1a2e);

  //   window.threeCamera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
  //   window.threeCamera.position.set(10, 8, 12);
  //   window.threeCamera.lookAt(0, 0, 0);

  //   window.threeRenderer = new THREE.WebGLRenderer({ antialias: true });
  //   window.threeRenderer.setSize(width, height);
  //   container.innerHTML = "";
  //   container.appendChild(window.threeRenderer.domElement);

  //   window.threeControls = new OrbitControls(window.threeCamera, window.threeRenderer.domElement);
  //   window.threeControls.enableDamping = true;
  //   window.threeControls.dampingFactor = 0.05;

  //   const ambientLight = new THREE.AmbientLight(0x404060);
  //   window.threeScene.add(ambientLight);

  //   const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
  //   directionalLight.position.set(5, 10, 7);
  //   window.threeScene.add(directionalLight);

  //   const gridHelper = new THREE.GridHelper(20, 20, 0x88aaff, 0x335588);
  //   gridHelper.position.y = -0.01;
  //   window.threeScene.add(gridHelper);

  //   const axesHelper = new THREE.AxesHelper(5);
  //   window.threeScene.add(axesHelper);

  //   window.threeElements = [];
  //   window.threeInitialized = true;

  //   this.start3DAnimation();
  //   window.addEventListener("resize", () => this.onResize3D());
  //   this.drawIn3D();
  // },

  // // NUEVO MÉTODO: Limpiar escena 3D
  // clear3D() {
  //   if (!window.threeScene || !window.threeElements) return;

  //   window.threeElements.forEach((element) => {
  //     if (element && element.parent) window.threeScene.remove(element);
  //     if (element && element.geometry) element.geometry.dispose();
  //     if (element && element.material) element.material.dispose();
  //   });

  //   window.threeElements = [];
  // },

  // // NUEVO MÉTODO: Iniciar animación 3D
  // start3DAnimation() {
  //   const animate = () => {
  //     if (!window.threeRenderer || !window.threeScene || !window.threeCamera) return;

  //     if (window.threeControls) window.threeControls.update();
  //     window.threeRenderer.render(window.threeScene, window.threeCamera);
  //     requestAnimationFrame(animate);
  //   };
  //   requestAnimationFrame(animate);
  // },

  // // NUEVO MÉTODO: Dibujar todo en 3D
  // drawIn3D() {
  //   if (!window.threeScene || !this.nodes) return;

  //   this.clear3D();

  //   // Dibujar nodos (esferas)
  //   this.nodes.forEach((node) => {
  //     if (!node || !node.position) return;

  //     const geometry = new THREE.SphereGeometry(0.15, 32, 32);
  //     const material = new THREE.MeshStandardMaterial({ color: 0x88aaff, emissive: 0x112233 });
  //     const sphere = new THREE.Mesh(geometry, material);
  //     sphere.position.set(node.position.x, node.position.y, 0);
  //     sphere.userData = { type: "node", id: node.id };

  //     window.threeScene.add(sphere);
  //     window.threeElements.push(sphere);
  //   });

  //   // Dibujar vigas (líneas)
  //   if (this.shapes) {
  //     this.shapes.forEach((beam) => {
  //       if (!beam || !beam.node1 || !beam.node2) return;

  //       const start = new THREE.Vector3(beam.node1.position.x, beam.node1.position.y, 0);
  //       const end = new THREE.Vector3(beam.node2.position.x, beam.node2.position.y, 0);
  //       const points = [start, end];
  //       const geometry = new THREE.BufferGeometry().setFromPoints(points);

  //       let color = 0x6d7b8d;
  //       if (beam.fAxial > 0.001) color = 0x3b82f6;
  //       if (beam.fAxial < -0.001) color = 0xef4444;

  //       const material = new THREE.LineBasicMaterial({ color });
  //       const line = new THREE.Line(geometry, material);
  //       line.userData = { type: "beam", id: beam.id };

  //       window.threeScene.add(line);
  //       window.threeElements.push(line);
  //     });
  //   }
  // },

  // // NUEVO MÉTODO: Manejar cambio de tamaño
  // onResize3D() {
  //   if (!window.threeRenderer || !window.threeCamera) return;

  //   const container = document.getElementById("viewer3d-container");
  //   if (!container) return;

  //   const width = container.clientWidth;
  //   const height = container.clientHeight;

  //   if (width > 0 && height > 0) {
  //     window.threeCamera.aspect = width / height;
  //     window.threeCamera.updateProjectionMatrix();
  //     window.threeRenderer.setSize(width, height);
  //   }
  // },

  // // NUEVO MÉTODO: Sincronizar después de cambios
  // sync3D() {
  //   if (this.show3DView && window.threeInitialized) {
  //     this.drawIn3D();
  //   }
  // },

  // NUEVO MÉTODO: Alternar vista 3D
  toggleView3D() {
    this.show3DView = !this.show3DView;

    if (this.show3DView) {
      // Múltiples retrasos para asegurar que el DOM está listo
      setTimeout(() => {
        const container = document.getElementById("viewer3d-container");
        if (container) {
          // Limpiar si ya existe
          if (window.babylonEngine) {
            try {
              window.babylonEngine.dispose();
            } catch (e) {}
            window.babylonEngine = null;
            window.babylonScene = null;
            window.babylonInitialized = false;
          }
          // Limpiar el contenedor
          container.innerHTML = "";
          this.initViewer3D(container);
        }
      }, 200);
    }
  },

  // NUEVO MÉTODO: Inicializar visor 3D con Babylon (ESTILO HOJA DE CUADERNO)
  initViewer3D(container) {
    if (window.babylonInitialized) return;

    try {
      // Crear canvas manualmente con atributos específicos
      const canvas = document.createElement("canvas");
      canvas.setAttribute("id", "babylon-canvas");
      canvas.style.width = "100%";
      canvas.style.height = "100%";
      canvas.style.display = "block";

      // Obtener dimensiones del contenedor
      const rect = container.getBoundingClientRect();
      canvas.width = rect.width || container.clientWidth || 800;
      canvas.height = rect.height || container.clientHeight || 600;

      // Limpiar y agregar canvas
      container.innerHTML = "";
      container.appendChild(canvas);

      // Asegurar que el canvas está visible
      canvas.getContext("webgl") || canvas.getContext("experimental-webgl");

      // Crear el motor de Babylon con opciones
      window.babylonEngine = new BABYLON.Engine(canvas, true, {
        preserveDrawingBuffer: true,
        stencil: true,
        antialias: true,
        adaptToDeviceRatio: true,
      });

      if (!window.babylonEngine) {
        throw new Error("No se pudo crear el motor Babylon.js");
      }

      // Crear la escena
      window.babylonScene = new BABYLON.Scene(window.babylonEngine);
      window.babylonScene.clearColor = new BABYLON.Color4(0.05, 0.05, 0.1, 1);

      // ========== CÁMARA ESTILO ETABS ==========
      window.babylonCamera = new BABYLON.ArcRotateCamera(
        "camera",
        Math.PI / 4,
        Math.PI / 5,
        20,
        BABYLON.Vector3.Zero(),
        window.babylonScene,
      );

      window.babylonCamera.attachControl(canvas, true);
      window.babylonCamera.panningSensibility = 50;
      window.babylonCamera.zoomSensibility = 50;
      window.babylonCamera.wheelPrecision = 30;
      window.babylonCamera.lowerRadiusLimit = 5;
      window.babylonCamera.upperRadiusLimit = 50;
      window.babylonCamera.pinchPrecision = 50;
      window.babylonCamera.useBouncingBehavior = true;
      window.babylonCamera.useFramingBehavior = true;
      window.babylonCamera.framingBehavior.elevationReturnTime = 500;
      window.babylonCamera.framingBehavior.zoomOnBoundingInfo = true;

      // ========== ILUMINACIÓN PROFESIONAL ==========
      const light = new BABYLON.HemisphericLight("light", new BABYLON.Vector3(0, 1, 0), window.babylonScene);
      light.intensity = 0.6;
      light.groundColor = new BABYLON.Color3(0.2, 0.2, 0.3);

      const directionalLight = new BABYLON.DirectionalLight(
        "dirLight",
        new BABYLON.Vector3(1, -2, 1),
        window.babylonScene,
      );
      directionalLight.intensity = 0.8;
      directionalLight.position = new BABYLON.Vector3(5, 10, 5);

      const backLight = new BABYLON.DirectionalLight("backLight", new BABYLON.Vector3(-1, 0, -1), window.babylonScene);
      backLight.intensity = 0.3;

      // ========== GRID 3D COMPLETO ESTILO HOJA DE CUADERNO ==========
      this.createFull3DGrid(window.babylonScene);
      if (this.referenceGrid) {
        this.drawReferenceGrid3D();
      }

      // ========== CONTADOR DE FPS ==========
      this.fpsCounter = 0;
      let frameCount = 0;
      let lastTime = performance.now();

      window.babylonElements = [];
      window.babylonInitialized = true;

      // ========== RENDER LOOP ==========
      window.babylonEngine.runRenderLoop(() => {
        if (window.babylonScene) {
          window.babylonScene.render();
          frameCount++;
          const now = performance.now();
          if (now - lastTime >= 1000) {
            this.fps = frameCount;
            frameCount = 0;
            lastTime = now;
          }
        }
      });

      // Manejar resize
      const resizeHandler = () => {
        if (window.babylonEngine && container) {
          setTimeout(() => {
            try {
              window.babylonEngine.resize();
            } catch (e) {}
          }, 100);
        }
      };
      window.addEventListener("resize", resizeHandler);

      // Dibujar contenido existente
      setTimeout(() => {
        this.drawIn3D();
        console.log("🎨 Escena 3D inicializada con contenido existente");
      }, 100);

      window.babylonInitialized = true;
      console.log("✅ Babylon.js inicializado (grid 3D completo)");
    } catch (error) {
      console.error("Error inicializando Babylon.js:", error);
      window.babylonInitialized = false;
    }
  },

  // CREATE FULL 3D GRID: Suelo (XZ), Pared lateral (XY), Pared frontal (YZ) - Estilo hoja de cuaderno

  createFull3DGrid(scene) {
    console.log("📏 Creando grid 3D - Plano XZ (suelo), Y = altura");

    const gridSize = 20; // Tamaño total del grid (metros)
    const divisions = 20; // Número de divisiones (20 = 1m entre líneas)
    const spacing = gridSize / divisions;

    // Colores estilo hoja de cuaderno
    const mainLineColor = new BABYLON.Color3(0.35, 0.55, 0.85); // Azul principal
    const minorLineColor = new BABYLON.Color3(0.25, 0.4, 0.6); // Azul secundario
    const gridAlpha = 0.4;

    // ============================================================
    // SUELO: PLANO XZ (Y = 0) - HOJA DE CUADERNO
    // Aquí se dibuja la estructura en 2D (X = horizontal, Z = profundidad)
    // ============================================================
    console.log("   - Suelo XZ (Y=0) - hoja de cuaderno");

    for (let i = 0; i <= divisions; i++) {
      const pos = -gridSize / 2 + i * spacing;
      const isMajor = i % 2 === 0;
      const lineColor = isMajor ? mainLineColor : minorLineColor;
      const alpha = isMajor ? gridAlpha : gridAlpha * 0.6;

      // Líneas en dirección X (horizontales)
      const xLinePoints = [new BABYLON.Vector3(-gridSize / 2, 0, pos), new BABYLON.Vector3(gridSize / 2, 0, pos)];
      const xLine = BABYLON.MeshBuilder.CreateLines(`gridXZ_X_${i}`, { points: xLinePoints }, scene);
      const xMat = new BABYLON.StandardMaterial(`gridXZ_X_Mat_${i}`, scene);
      xMat.diffuseColor = lineColor;
      xMat.alpha = alpha;
      xLine.material = xMat;

      // Líneas en dirección Z (profundidad)
      const zLinePoints = [new BABYLON.Vector3(pos, 0, -gridSize / 2), new BABYLON.Vector3(pos, 0, gridSize / 2)];
      const zLine = BABYLON.MeshBuilder.CreateLines(`gridXZ_Z_${i}`, { points: zLinePoints }, scene);
      const zMat = new BABYLON.StandardMaterial(`gridXZ_Z_Mat_${i}`, scene);
      zMat.diffuseColor = lineColor;
      zMat.alpha = alpha;
      zLine.material = zMat;
    }

    // ============================================================
    // PARED OPCIONAL: PLANO XY (Z = 0) - pared lateral
    // ============================================================
    console.log("   - Pared XY (Z=0) - referencia lateral");

    for (let i = 0; i <= divisions; i++) {
      const pos = -gridSize / 2 + i * spacing;
      const isMajor = i % 2 === 0;
      const lineColor = isMajor ? mainLineColor : minorLineColor;
      const alpha = gridAlpha * 0.3;

      // Líneas en dirección X
      const xLinePoints = [new BABYLON.Vector3(-gridSize / 2, pos, 0), new BABYLON.Vector3(gridSize / 2, pos, 0)];
      const xLine = BABYLON.MeshBuilder.CreateLines(`gridXY_X_${i}`, { points: xLinePoints }, scene);
      const xMat = new BABYLON.StandardMaterial(`gridXY_X_Mat_${i}`, scene);
      xMat.diffuseColor = lineColor;
      xMat.alpha = alpha;
      xLine.material = xMat;

      // Líneas en dirección Y (altura)
      const yLinePoints = [new BABYLON.Vector3(pos, -gridSize / 2, 0), new BABYLON.Vector3(pos, gridSize / 2, 0)];
      const yLine = BABYLON.MeshBuilder.CreateLines(`gridXY_Y_${i}`, { points: yLinePoints }, scene);
      const yMat = new BABYLON.StandardMaterial(`gridXY_Y_Mat_${i}`, scene);
      yMat.diffuseColor = lineColor;
      yMat.alpha = alpha;
      yLine.material = yMat;
    }

    // ============================================================
    // PARED OPCIONAL: PLANO YZ (X = 0) - pared frontal
    // ============================================================
    console.log("   - Pared YZ (X=0) - referencia frontal");

    for (let i = 0; i <= divisions; i++) {
      const pos = -gridSize / 2 + i * spacing;
      const isMajor = i % 2 === 0;
      const lineColor = isMajor ? mainLineColor : minorLineColor;
      const alpha = gridAlpha * 0.3;

      // Líneas en dirección Y (altura)
      const yLinePoints = [new BABYLON.Vector3(0, pos, -gridSize / 2), new BABYLON.Vector3(0, pos, gridSize / 2)];
      const yLine = BABYLON.MeshBuilder.CreateLines(`gridYZ_Y_${i}`, { points: yLinePoints }, scene);
      const yMat = new BABYLON.StandardMaterial(`gridYZ_Y_Mat_${i}`, scene);
      yMat.diffuseColor = lineColor;
      yMat.alpha = alpha;
      yLine.material = yMat;

      // Líneas en dirección Z (profundidad)
      const zLinePoints = [new BABYLON.Vector3(0, -gridSize / 2, pos), new BABYLON.Vector3(0, gridSize / 2, pos)];
      const zLine = BABYLON.MeshBuilder.CreateLines(`gridYZ_Z_${i}`, { points: zLinePoints }, scene);
      const zMat = new BABYLON.StandardMaterial(`gridYZ_Z_Mat_${i}`, scene);
      zMat.diffuseColor = lineColor;
      zMat.alpha = alpha;
      zLine.material = zMat;
    }

    // ============================================================
    // EJES PRINCIPALES
    // ============================================================
    console.log("   - Ejes principales");

    // Eje X (Rojo) - horizontal derecha
    const xAxisPoints = [new BABYLON.Vector3(-gridSize / 2, 0, 0), new BABYLON.Vector3(gridSize / 2, 0, 0)];
    const xAxisLine = BABYLON.MeshBuilder.CreateLines("xAxisMain", { points: xAxisPoints }, scene);
    const xAxisMat = new BABYLON.StandardMaterial("xAxisMat", scene);
    xAxisMat.diffuseColor = new BABYLON.Color3(1, 0.2, 0.2);
    xAxisMat.alpha = 0.9;
    xAxisLine.material = xAxisMat;

    // Eje Z (Verde) - ALTURA (hacia arriba) ← ¡IMPORTANTE!
    const zAxisPoints = [new BABYLON.Vector3(0, -gridSize / 2, 0), new BABYLON.Vector3(0, gridSize / 2, 0)];
    const zAxisLine = BABYLON.MeshBuilder.CreateLines("zAxisMain", { points: zAxisPoints }, scene);
    const zAxisMat = new BABYLON.StandardMaterial("zAxisMat", scene);
    zAxisMat.diffuseColor = new BABYLON.Color3(0.2, 1, 0.2);
    zAxisMat.alpha = 0.9;
    zAxisLine.material = zAxisMat;

    // Eje Y (Azul) - PROFUNDIDAD (sale del plano)
    const yAxisPoints = [new BABYLON.Vector3(0, 0, -gridSize / 2), new BABYLON.Vector3(0, 0, gridSize / 2)];
    const yAxisLine = BABYLON.MeshBuilder.CreateLines("yAxisMain", { points: yAxisPoints }, scene);
    const yAxisMat = new BABYLON.StandardMaterial("yAxisMat", scene);
    yAxisMat.diffuseColor = new BABYLON.Color3(0.2, 0.2, 1);
    yAxisMat.alpha = 0.9;
    yAxisLine.material = yAxisMat;

    // ============================================================
    // ETIQUETAS DE LOS EJES
    // ============================================================
    console.log("   - Etiquetas de ejes");

    // Etiqueta X
    const xLabel = this.createSimpleAxisLabel("X", new BABYLON.Color3(1, 0.3, 0.3), scene);
    if (xLabel) xLabel.position = new BABYLON.Vector3(gridSize / 2 + 0.6, -0.3, 0);

    // Etiqueta Z (ALTURA)
    const zLabel = this.createSimpleAxisLabel("Z", new BABYLON.Color3(0.3, 1, 0.3), scene);
    if (zLabel) zLabel.position = new BABYLON.Vector3(-0.3, gridSize / 2 + 0.6, 0);

    // Etiqueta Y (PROFUNDIDAD)
    const yLabel = this.createSimpleAxisLabel("Y", new BABYLON.Color3(0.3, 0.3, 1), scene);
    if (yLabel) yLabel.position = new BABYLON.Vector3(0, -0.3, gridSize / 2 + 0.6);

    console.log("✅ Grid 3D: X (rojo/horizontal), Z (verde/altura), Y (azul/profundidad)");
  },

  // Función auxiliar para crear etiquetas simples
  createSimpleAxisLabel(text, color, scene) {
    try {
      const canvas = document.createElement("canvas");
      canvas.width = 128;
      canvas.height = 128;
      const ctx = canvas.getContext("2d");
      ctx.fillStyle = "rgba(0,0,0,0)";
      ctx.fillRect(0, 0, 128, 128);
      ctx.fillStyle = `rgb(${color.r * 255}, ${color.g * 255}, ${color.b * 255})`;
      ctx.font = "Bold 40px Arial";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(text, 64, 64);

      const texture = new BABYLON.DynamicTexture(`label_${text}`, { width: 128, height: 128 }, scene);
      texture.update(canvas);

      const material = new BABYLON.StandardMaterial(`labelMat_${text}`, scene);
      material.diffuseTexture = texture;
      material.emissiveColor = color;
      material.specularColor = new BABYLON.Color3(0, 0, 0);

      const plane = BABYLON.MeshBuilder.CreatePlane(`labelPlane_${text}`, { width: 0.7, height: 0.7 }, scene);
      plane.material = material;
      plane.billboardMode = BABYLON.Mesh.BILLBOARDMODE_ALL;

      return plane;
    } catch (e) {
      console.warn(`Error creando etiqueta ${text}:`, e);
      return null;
    }
  },

  // resources/js/cad/cad_sys.js - Añadir después de initViewer3D

  createETABSAxes(scene) {
    if (!scene) return;

    try {
      // Eje X (Rojo) - más delgado
      const xPoints = [BABYLON.Vector3.Zero(), new BABYLON.Vector3(12, 0, 0)];
      const xAxis = BABYLON.MeshBuilder.CreateLines("xAxis", { points: xPoints }, scene);
      const xMat = new BABYLON.StandardMaterial("xMat", scene);
      xMat.diffuseColor = new BABYLON.Color3(0.9, 0.3, 0.3);
      xMat.emissiveColor = new BABYLON.Color3(0.2, 0, 0);
      xAxis.material = xMat;

      // Eje Z (Verde) - Altura
      const zPoints = [BABYLON.Vector3.Zero(), new BABYLON.Vector3(0, 0, 12)];
      const zAxis = BABYLON.MeshBuilder.CreateLines("zAxis", { points: zPoints }, scene);
      const zMat = new BABYLON.StandardMaterial("zMat", scene);
      zMat.diffuseColor = new BABYLON.Color3(0.3, 0.9, 0.3);
      zMat.emissiveColor = new BABYLON.Color3(0, 0.2, 0);
      zAxis.material = zMat;

      // Eje Y (Azul) - Profundidad
      const yPoints = [BABYLON.Vector3.Zero(), new BABYLON.Vector3(0, 12, 0)];
      const yAxis = BABYLON.MeshBuilder.CreateLines("yAxis", { points: yPoints }, scene);
      const yMat = new BABYLON.StandardMaterial("yMat", scene);
      yMat.diffuseColor = new BABYLON.Color3(0.3, 0.3, 0.9);
      yMat.emissiveColor = new BABYLON.Color3(0, 0, 0.2);
      yAxis.material = yMat;

      console.log("✅ Ejes ETABS creados (versión sutil)");
    } catch (e) {
      console.warn("Error creando ejes:", e);
    }
  },

  createAxisWithNumbers(scene, name, color, x, y, z) {
    const start = new BABYLON.Vector3(x, y, z);
    const end = new BABYLON.Vector3(x + (name === "X" ? 8 : 0), y + (name === "Y" ? 8 : 0), z + (name === "Z" ? 8 : 0));

    // Línea del eje
    const points = [start, end];
    const axis = BABYLON.MeshBuilder.CreateLines(`${name}Axis`, { points }, scene);
    const mat = new BABYLON.StandardMaterial(`${name}Mat`, scene);
    mat.diffuseColor = color;
    mat.emissiveColor = color.scale(0.3);
    axis.material = mat;

    // Flecha en el extremo
    const arrow = BABYLON.MeshBuilder.CreateCylinder(
      `${name}Arrow`,
      { height: 0.35, diameterTop: 0, diameterBottom: 0.15, tessellation: 8 },
      scene,
    );

    if (name === "X") {
      arrow.position = new BABYLON.Vector3(7.85, 0, 0);
      arrow.rotation.z = Math.PI / 2;
    } else if (name === "Y") {
      arrow.position = new BABYLON.Vector3(0, 7.85, 0);
    } else {
      arrow.position = new BABYLON.Vector3(0, 0, 7.85);
      arrow.rotation.x = Math.PI / 2;
    }
    arrow.material = mat;

    // Etiqueta de texto
    const textPlane = this.createAxisLabel3D(name, color, scene);
    if (textPlane) {
      if (name === "X") textPlane.position = new BABYLON.Vector3(9, -0.5, 0);
      else if (name === "Y") textPlane.position = new BABYLON.Vector3(0, 9, -0.5);
      else textPlane.position = new BABYLON.Vector3(0, -0.5, 9);
    }

    // Números en el eje (1,2,3...)
    for (let i = 1; i <= 7; i++) {
      let posX = 0,
        posY = 0,
        posZ = 0;
      if (name === "X") {
        posX = i;
        posY = -0.4;
      } else if (name === "Y") {
        posX = -0.4;
        posY = i;
      } else {
        posZ = i;
        posY = -0.4;
      }

      // Crear número - NO hacer scene.add porque ya se añade automáticamente
      this.createNumberLabel(`${i}`, posX, posY, posZ, scene);
    }
  },
  // resources/js/cad/cad_sys.js - Modificar createAxisLabel3D

  createAxisLabel3D(text, color, scene) {
    try {
      // Usar texto 3D en lugar de plano con textura (más limpio)
      const text3D = new BABYLON.MeshBuilder.CreatePlane(`label_${text}`, { width: 0.6, height: 0.6 }, scene);
      const texture = new BABYLON.DynamicTexture(`labelTex_${text}`, { width: 256, height: 256 }, scene);
      const ctx = texture.getContext();
      ctx.fillStyle = "rgba(0,0,0,0)"; // Fondo transparente
      ctx.font = "Bold 48px Arial";
      ctx.fillStyle = `rgb(${color.r * 255}, ${color.g * 255}, ${color.b * 255})`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(text, 128, 128);
      texture.update();

      const material = new BABYLON.StandardMaterial(`labelMat_${text}`, scene);
      material.diffuseTexture = texture;
      material.emissiveColor = color;
      material.specularColor = new BABYLON.Color3(0, 0, 0);
      text3D.material = material;
      text3D.billboardMode = BABYLON.Mesh.BILLBOARDMODE_ALL;

      return text3D;
    } catch (e) {
      console.warn(`Error creando etiqueta ${text}:`, e);
      return null;
    }
  },

  createNumberLabel(text, x, y, z, scene) {
    try {
      const plane = BABYLON.MeshBuilder.CreatePlane(`num_${text}`, { width: 0.35, height: 0.35 }, scene);
      const texture = new BABYLON.DynamicTexture(`numTex_${text}`, { width: 128, height: 128 }, scene);
      const ctx = texture.getContext();
      ctx.fillStyle = "rgba(0,0,0,0)"; // Fondo transparente
      ctx.font = "bold 32px Arial";
      ctx.fillStyle = "#cccccc";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(text, 64, 64);
      texture.update();

      const material = new BABYLON.StandardMaterial(`numMat_${text}`, scene);
      material.diffuseTexture = texture;
      material.specularColor = new BABYLON.Color3(0, 0, 0);
      plane.material = material;
      plane.billboardMode = BABYLON.Mesh.BILLBOARDMODE_ALL;
      plane.position = new BABYLON.Vector3(x, y, z);

      return plane;
    } catch (e) {
      return null;
    }
  },

  // NUEVO MÉTODO: Limpiar escena 3D
  clear3D() {
    if (!window.babylonScene || !window.babylonElements) return;

    try {
      window.babylonElements.forEach((element) => {
        if (element && element.dispose) {
          element.dispose();
        }
      });
    } catch (e) {}

    window.babylonElements = [];
  },

  // NUEVO MÉTODO: Sincronizar cambios
  sync3D() {
    if (this.syncPending) return;
    if (!window.babylonInitialized || !window.babylonScene) return;

    this.syncPending = true;

    setTimeout(() => {
      // Primero dibujar el grid 3D de referencia
      if (this.referenceGrid) {
        this.drawReferenceGrid3D();
      }
      // Luego dibujar los elementos estructurales
      this.drawIn3D();
      this.syncPending = false;
    }, 50);
  },

  // En cad_sys.js, añade esta función simple

  activate3DDrawingMode() {
    this.setState(this.trussDrawingState3D);
    // Guardar el estado actual
    const previousState = this.currentState;

    // Crear un objeto simple para el estado 3D
    const simple3DState = {
      currentPlane: "XY",

      handleMouseDown: (event, context, mouse) => {
        event.preventDefault();

        const worldPos = context.grid.screenToWorld(mouse);
        let x = worldPos.x;
        let y = worldPos.y;
        let z = 0;

        if (this.simple3DPlane === "XZ") {
          x = worldPos.x;
          z = worldPos.y;
          y = 0;
        } else if (this.simple3DPlane === "YZ") {
          y = worldPos.x;
          z = worldPos.y;
          x = 0;
        }

        // Buscar o crear nodo
        let node = context.closestNode(mouse);
        if (!node) {
          node = new Node({ x: x, y: y }, context.nodes.length + 1, z);
          context.nodes.push(node);
        }

        // Crear viga
        if (!this.tempBeam) {
          this.tempBeam = new Beam(context.globalE, context.globalA);
        }

        const done = this.tempBeam.addNode(node);
        if (done) {
          context.shapes.push(this.tempBeam);
          this.tempBeam.id = context.shapes.length;
          this.tempBeam = new Beam(context.globalE, context.globalA);
          this.tempBeam.addNode(node);
        }

        context.sync3D();
      },

      handleKeyDown: (event, context) => {
        if (event.key === "1") {
          this.simple3DPlane = "XY";
          console.log("Plano XY");
        } else if (event.key === "2") {
          this.simple3DPlane = "XZ";
          console.log("Plano XZ");
        } else if (event.key === "3") {
          this.simple3DPlane = "YZ";
          console.log("Plano YZ");
        }
      },

      handleMouseMove: () => {},
      handleMouseUp: () => {},
      handleMouseWheel: () => {},
      draw: () => {},
    };

    this.simple3DPlane = "XY";
    this.tempBeam = null;
    this.currentState = simple3DState;

    // Activar vista 3D
    if (!this.show3DView) {
      this.toggleView3D();
    }
  },

  // resources/js/cad/cad_sys.js - Reemplaza drawIn3D

  drawIn3D() {
    if (!window.babylonScene || !this.nodes) return;

    this.clear3D();

    // ========== NODOS ==========
    // En ETABS, los nodos son puntos pequeños, casi invisibles
    this.nodes.forEach((node) => {
      if (!node || !node.position) return;

      // Usar puntos muy pequeños (casi imperceptibles)
      const sphere = BABYLON.MeshBuilder.CreateSphere(
        `node_${node.id}`,
        { diameter: 0.08, segments: 8 },
        window.babylonScene,
      );

      sphere.position = new BABYLON.Vector3(
        node.position.x, // X: horizontal
        node.position.z || 0, // Z: ALTURA (hacia arriba)
        node.position.y, // Y: profundidad
      );

      const material = new BABYLON.StandardMaterial(`nodeMat_${node.id}`, window.babylonScene);
      material.diffuseColor = new BABYLON.Color3(0.8, 0.8, 0.9);
      material.emissiveColor = new BABYLON.Color3(0.1, 0.1, 0.2);
      sphere.material = material;

      sphere.userData = { type: "node", id: node.id };
      window.babylonElements.push(sphere);
    });

    // ========== VIGAS ==========
    // En ETABS, las vigas se ven como líneas delgadas
    this.shapes.forEach((beam) => {
      if (!beam || !beam.node1 || !beam.node2) return;

      // IMPORTANTE: Usar la misma orientación que los nodos (X, Z, Y)
      const start = new BABYLON.Vector3(
        beam.node1.position.x, // X: horizontal
        beam.node1.position.z || 0, // Z: ALTURA (hacia arriba)
        beam.node1.position.y, // Y: profundidad
      );

      const end = new BABYLON.Vector3(beam.node2.position.x, beam.node2.position.z || 0, beam.node2.position.y);

      // Usar líneas en lugar de cilindros (más estilo ETABS)
      const points = [start, end];
      const lines = BABYLON.MeshBuilder.CreateLines(`beam_${beam.id}`, { points: points }, window.babylonScene);

      // Color según esfuerzo axial
      let color = new BABYLON.Color3(0.7, 0.7, 0.8); // Gris claro
      if (beam.fAxial > 0.001) color = new BABYLON.Color3(0.2, 0.5, 0.9); // Azul - Tracción
      if (beam.fAxial < -0.001) color = new BABYLON.Color3(0.9, 0.3, 0.3); // Rojo - Compresión

      const material = new BABYLON.StandardMaterial(`beamMat_${beam.id}`, window.babylonScene);
      material.diffuseColor = color;
      material.emissiveColor = color.scale(0.3);
      lines.material = material;

      lines.userData = { type: "beam", id: beam.id };
      window.babylonElements.push(lines);
    });
    // console.log(`🔄 3D actualizado: ${this.nodes.length} nodos, ${this.shapes.length} vigas`);
  },

  // ================FUNCION DE ELEVACION=======================

  // Elevar nodos seleccionados
  elevateSelectedNodes() {
    // Si hay nodos seleccionados
    if (this.selectedNodesState.selectedObjects?.length > 0) {
      this.selectedNodesState.selectedObjects.forEach((node) => {
        node.position.z = (node.position.z || 0) + 1;
      });
      this.showMessage(`⬆️ ${this.selectedNodesState.selectedObjects.length} nodos elevados +1m`);
    }
    // Si no hay selección, elevar todos los nodos
    else if (this.nodes.length > 0) {
      this.nodes.forEach((node) => {
        node.position.z = (node.position.z || 0) + 1;
      });
      this.showMessage(`⬆️ Todos los nodos elevados +1m`);
    } else {
      this.showMessage("⚠️ No hay nodos para elevar", "warning");
      return;
    }

    this.sync3D();
  },

  // Bajar nodos seleccionados
  lowerSelectedNodes() {
    if (this.selectedNodesState.selectedObjects?.length > 0) {
      this.selectedNodesState.selectedObjects.forEach((node) => {
        node.position.z = Math.max(0, (node.position.z || 0) - 1);
      });
      this.showMessage(`⬇️ ${this.selectedNodesState.selectedObjects.length} nodos bajados -1m`);
    } else if (this.nodes.length > 0) {
      this.nodes.forEach((node) => {
        node.position.z = Math.max(0, (node.position.z || 0) - 1);
      });
      this.showMessage(`⬇️ Todos los nodos bajados -1m`);
    } else {
      this.showMessage("⚠️ No hay nodos para bajar", "warning");
      return;
    }

    this.sync3D();
  },

  // Extruir a nuevo piso (crear copia elevada + columnas)
  extrudeToNewFloor() {
    console.log("🏗️ Extruyendo a nuevo piso...");

    if (this.nodes.length === 0) {
      this.showMessage("⚠️ No hay estructura para extruir", "warning");
      return;
    }

    // Altura del nuevo piso (3 metros por defecto)
    const floorHeight = 3;

    // Obtener altura máxima actual
    const currentMaxZ = Math.max(...this.nodes.map((n) => n.position.z || 0));
    const newZ = currentMaxZ + floorHeight;

    // Crear mapa de nodos originales a nuevos nodos
    const nodeMap = new Map();

    // Crear copia de los nodos en el nuevo nivel
    const newNodes = [];
    this.nodes.forEach((node) => {
      const newNode = new StructuralNode(
        { x: node.position.x, y: node.position.y },
        this.nodes.length + newNodes.length + 1,
        newZ,
      );
      this.nodes.push(newNode);
      newNodes.push(newNode);
      nodeMap.set(node.id, newNode);
    });

    // Crear columnas verticales conectando nodos originales con nuevos
    this.nodes.forEach((originalNode, idx) => {
      const newNode = newNodes.find(
        (n) => n.position.x === originalNode.position.x && n.position.y === originalNode.position.y,
      );

      if (newNode) {
        const column = new Beam(this.globalE, this.globalA);
        column.addNode(originalNode);
        column.addNode(newNode);
        this.shapes.push(column);
      }
    });

    // Crear vigas entre nuevos nodos (para formar el nuevo piso)
    // Buscar vigas existentes en el nivel inferior
    const existingBeams = this.shapes.filter(
      (beam) =>
        beam.node1 &&
        beam.node2 &&
        (beam.node1.position.z || 0) === currentMaxZ &&
        (beam.node2.position.z || 0) === currentMaxZ,
    );

    existingBeams.forEach((beam) => {
      const newNode1 = nodeMap.get(beam.node1.id);
      const newNode2 = nodeMap.get(beam.node2.id);

      if (newNode1 && newNode2) {
        const newBeam = new Beam(this.globalE, this.globalA);
        newBeam.addNode(newNode1);
        newBeam.addNode(newNode2);
        this.shapes.push(newBeam);
      }
    });

    this.sync3D();
    this.showMessage(`🏗️ Nuevo piso creado a ${newZ}m de altura`);
  },

  // Seleccionar todos los nodos
  selectAllNodes() {
    this.setState(this.selectedNodesState, { selectedNodes: [...this.nodes] });
    this.showMessage(`✅ ${this.nodes.length} nodos seleccionados`);
  },

  // Seleccionar nodos por altura
  selectNodesByHeight(minZ, maxZ) {
    const selected = this.nodes.filter((n) => {
      const z = n.position.z || 0;
      return z >= minZ && z <= maxZ;
    });
    this.setState(this.selectedNodesState, { selectedNodes: selected });
    this.showMessage(`✅ ${selected.length} nodos seleccionados (altura ${minZ}-${maxZ}m)`);
  },

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

  // createFloorPlane(nodes, zLevel) {
  //   // Crear un plano/piso para cada nivel
  //   const minX = Math.min(...nodes.map((n) => n.position.x));
  //   const maxX = Math.max(...nodes.map((n) => n.position.x));
  //   const minY = Math.min(...nodes.map((n) => n.position.y));
  //   const maxY = Math.max(...nodes.map((n) => n.position.y));

  //   const width = maxX - minX;
  //   const height = maxY - minY;

  //   if (width < 0.1 || height < 0.1) return null;

  //   const plane = BABYLON.MeshBuilder.CreateGround(
  //     `floor_${zLevel}`,
  //     { width, height, subdivisions: 2 },
  //     window.babylonScene,
  //   );
  //   plane.position = new BABYLON.Vector3((minX + maxX) / 2, (minY + maxY) / 2, zLevel);

  //   const material = new BABYLON.StandardMaterial(`floorMat_${zLevel}`, window.babylonScene);
  //   material.alpha = 0.3;
  //   material.diffuseColor = new BABYLON.Color3(0.4, 0.6, 0.8);
  //   material.backFaceCulling = false;
  //   plane.material = material;

  //   return plane;
  // },

  // NUEVO MÉTODO: Crear texto 3D para mostrar coordenadas
  createTextPlane(text, position) {
    try {
      const dynamicTexture = new BABYLON.DynamicTexture("textTexture", { width: 64, height: 32 }, window.babylonScene);
      dynamicTexture.drawText(text, 5, 20, "bold 12px Arial", "white", "transparent");
      const material = new BABYLON.StandardMaterial("textMat", window.babylonScene);
      material.diffuseTexture = dynamicTexture;
      material.backFaceCulling = false;

      const plane = BABYLON.MeshBuilder.CreatePlane("textPlane", { width: 0.8, height: 0.4 }, window.babylonScene);
      plane.material = material;
      plane.position = new BABYLON.Vector3(position.x, position.y + 0.3, (position.z || 0) + 0.2);
      plane.billboardMode = BABYLON.Mesh.BILLBOARDMODE_ALL; // Siempre mirando a la cámara

      return plane;
    } catch (e) {
      return null;
    }
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

  // resources/js/cad/cad_sys.js

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

  // async runOpenSeesAnalysis() {
  //   const swalTailwind = Swal.mixin({
  //     customClass: {
  //       confirmButton: "bg-blue-500 hover:bg-blue-400 text-white font-bold py-2 px-4 rounded",
  //     },
  //     buttonsStyling: false,
  //   });

  //   const waitingPopup = swalTailwind.fire({
  //     title: "Calculando con OpenSees!",
  //     html: "Por favor espere...<br>",
  //     allowOutsideClick: false,
  //     didOpen: () => {
  //       Swal.showLoading();
  //     },
  //   });

  //   try {
  //     // Verificar que OpenSees está disponible
  //     const statusRes = await fetch("http://localhost:5001/api/opensees/status");
  //     const status = await statusRes.json();

  //     if (!status.opensees_available) {
  //       throw new Error("OpenSees no está disponible en el servidor");
  //     }

  //     // Ejecutar análisis
  //     const results = await this.analyzeWithOpenSees();

  //     waitingPopup.hideLoading();

  //     if (results.success) {
  //       // Actualizar fuerzas axiales en las vigas
  //       Object.entries(results.forces).forEach(([id, axialForce]) => {
  //         const beamIndex = parseInt(id) - 1;
  //         if (this.shapes[beamIndex]) {
  //           this.shapes[beamIndex].fAxial = axialForce;

  //           // Cambiar color según el esfuerzo
  //           if (Math.abs(axialForce) < 0.001) {
  //             this.shapes[beamIndex].style.normal();
  //           } else if (axialForce < 0) {
  //             this.shapes[beamIndex].style.compresion(); // Rojo para compresión
  //           } else {
  //             this.shapes[beamIndex].style.traccion(); // Azul para tracción
  //           }
  //         }
  //       });

  //       // Actualizar desplazamientos
  //       this.matrizDesplazamiento = Object.values(results.displacements).map((d) => [d.dx, d.dy, 0]);
  //       this.calcularDeflecciones();

  //       // Actualizar reacciones
  //       Object.entries(results.reactions).forEach(([id, reaction]) => {
  //         const nodeIndex = parseInt(id) - 1;
  //         if (this.nodes[nodeIndex]) {
  //           this.nodes[nodeIndex].reaction.x = reaction.rx;
  //           this.nodes[nodeIndex].reaction.y = reaction.ry;
  //         }
  //       });

  //       // Sincronizar vista 3D
  //       this.sync3D();

  //       swalTailwind.fire({
  //         icon: "success",
  //         title: "¡Análisis completado!",
  //         html: `Se calcularon ${Object.keys(results.forces).length} elementos correctamente.`,
  //         timer: 2000,
  //         showConfirmButton: false,
  //       });
  //     } else {
  //       throw new Error(results.error || "Error en el cálculo");
  //     }
  //   } catch (error) {
  //     waitingPopup.hideLoading();
  //     console.error("Error:", error);
  //     swalTailwind.fire({
  //       icon: "error",
  //       title: "Error",
  //       html: error.message,
  //       showConfirmButton: true,
  //     });
  //   }
  // },

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
      swalTailwind
        .fire({
          icon: "info",
          title: "Usando motor alternativo",
          html: "OpenSees no está disponible. Usando Octave...",
          timer: 1500,
          showConfirmButton: false,
        })
        .then(() => {
          this.calcularFuerzas(event);
        });
    }
  },

  // =====================FUNCION PARA ANALISIS 3D =======================================

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

  // ============================================================
  // 3. FUNCIÓN PARA ANIMAR DEFORMACIONES 3D
  // ============================================================

  // async animateDeformation3D(results, scale = 50, duration = 2000) {
  //   if (!window.babylonScene || !results.displacements) return;

  //   // Guardar posiciones originales
  //   const originalPositions = new Map();
  //   this.nodes.forEach((node) => {
  //     originalPositions.set(node.id, {
  //       x: node.position.x,
  //       y: node.position.y,
  //       z: node.position.z || 0,
  //     });
  //   });

  //   const startTime = performance.now();
  //   const displacements = results.displacements;

  //   const animate = (currentTime) => {
  //     const elapsed = currentTime - startTime;
  //     const factor = Math.min(1, elapsed / duration);
  //     const easeFactor = 1 - Math.pow(1 - factor, 3); // Easing cúbico

  //     // Actualizar posiciones de nodos en 3D
  //     this.nodes.forEach((node) => {
  //       const original = originalPositions.get(node.id);
  //       const disp = displacements[node.id];

  //       if (original && disp) {
  //         const newX = original.x + disp.dx * scale * easeFactor;
  //         const newY = original.y + disp.dy * scale * easeFactor;
  //         const newZ = original.z + disp.dz * scale * easeFactor;

  //         // Actualizar posición en Babylon.js
  //         const sphere = window.babylonElements.find(
  //           (el) => el.userData?.type === "node" && el.userData?.id === node.id,
  //         );
  //         if (sphere) {
  //           sphere.position = new BABYLON.Vector3(newX, newY, newZ);
  //         }
  //       }
  //     });

  //     // Actualizar vigas
  //     this.updateBeams3DPositions();

  //     if (factor < 1) {
  //       requestAnimationFrame(animate);
  //     }
  //   };

  //   requestAnimationFrame(animate);
  // },

  // Actualizar posiciones de vigas después de mover nodos
  // updateBeams3DPositions() {
  //   if (!window.babylonScene) return;

  //   // Encontrar todas las vigas en la escena
  //   const beams = window.babylonElements.filter((el) => el.userData?.type === "beam");

  //   beams.forEach((beam) => {
  //     const beamId = beam.userData?.id;
  //     const beamData = this.shapes.find((b) => b.id === beamId);
  //     if (!beamData || !beamData.node1 || !beamData.node2) return;

  //     // Obtener posiciones actuales de los nodos
  //     const startNode = this.nodes.find((n) => n.id === beamData.node1.id);
  //     const endNode = this.nodes.find((n) => n.id === beamData.node2.id);
  //     if (!startNode || !endNode) return;

  //     const start = new BABYLON.Vector3(startNode.position.x, startNode.position.y, startNode.position.z || 0);
  //     const end = new BABYLON.Vector3(endNode.position.x, endNode.position.y, endNode.position.z || 0);

  //     const direction = end.subtract(start);
  //     const length = direction.length();

  //     if (length < 0.001) return;

  //     const midPoint = start.add(end).scale(0.5);
  //     beam.position = midPoint;

  //     const quat = BABYLON.Quaternion.FromUnitVectorsToRef(
  //       BABYLON.Vector3.Up(),
  //       direction.normalize(),
  //       new BABYLON.Quaternion(),
  //     );
  //     beam.rotationQuaternion = quat;

  //     // Actualizar altura del cilindro
  //     const cylinder = beam;
  //     cylinder.scaling = new BABYLON.Vector3(
  //       1,
  //       length / (cylinder._geometry?._boundingInfo?.boundingBox?.extents?.y * 2 || 1),
  //       1,
  //     );
  //   });
  // },

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

  // ===================== Controles de cámara estilo ETABS =================================
  setViewPlan() {
    if (!window.babylonCamera) return;
    // Vista desde arriba (planta)
    window.babylonCamera.alpha = 0;
    window.babylonCamera.beta = 0.01;
    window.babylonCamera.radius = 15;
    window.babylonCamera.target = BABYLON.Vector3.Zero();
  },

  setViewIso() {
    if (!window.babylonCamera) return;
    // Vista isométrica (ángulo clásico)
    window.babylonCamera.alpha = Math.PI / 4;
    window.babylonCamera.beta = Math.PI / 4;
    window.babylonCamera.radius = 18;
    window.babylonCamera.target = BABYLON.Vector3.Zero();
  },

  setViewFront() {
    if (!window.babylonCamera) return;
    // Vista frontal (elevación)
    window.babylonCamera.alpha = Math.PI / 2;
    window.babylonCamera.beta = 0.01;
    window.babylonCamera.radius = 15;
    window.babylonCamera.target = BABYLON.Vector3.Zero();
  },

  setViewSide() {
    if (!window.babylonCamera) return;
    // Vista lateral
    window.babylonCamera.alpha = 0;
    window.babylonCamera.beta = Math.PI / 2;
    window.babylonCamera.radius = 15;
    window.babylonCamera.target = BABYLON.Vector3.Zero();
  },

  zoomExtents() {
    if (!window.babylonCamera || !this.nodes.length) return;

    // Calcular bounding box de la estructura
    let minX = Infinity,
      maxX = -Infinity;
    let minY = Infinity,
      maxY = -Infinity;
    let minZ = Infinity,
      maxZ = -Infinity;

    this.nodes.forEach((node) => {
      minX = Math.min(minX, node.position.x);
      maxX = Math.max(maxX, node.position.x);
      minY = Math.min(minY, node.position.y);
      maxY = Math.max(maxY, node.position.y);
      minZ = Math.min(minZ, node.position.z || 0);
      maxZ = Math.max(maxZ, node.position.z || 0);
    });

    const center = new BABYLON.Vector3((minX + maxX) / 2, (minY + maxY) / 2, (minZ + maxZ) / 2);

    const maxDim = Math.max(maxX - minX, maxY - minY, maxZ - minZ);
    const radius = maxDim * 1.5;

    window.babylonCamera.target = center;
    window.babylonCamera.radius = Math.max(radius, 10);
  },

  // ==================== funcion para extrudir la estructura 2d a 3d =================================
  extrudeTo3D(floorHeight = 3, numFloors = 1) {
    console.log("Extruyendo estructura a 3D...", floorHeight, numFloors);

    if (!this.nodes || this.nodes.length === 0) {
      console.warn("No hay nodos para extruir");
      return;
    }

    // Obtener nodos que están en la planta baja (z = 0)
    const groundNodes = this.nodes.filter((node) => (node.position.z || 0) === 0);

    if (groundNodes.length === 0) {
      console.warn("No hay nodos en planta baja");
      return;
    }

    for (let floor = 1; floor <= numFloors; floor++) {
      const z = floor * floorHeight;

      // Crear copia de los nodos en el nuevo nivel
      const floorNodes = groundNodes.map((node) => {
        const newNode = new StructuralNode({ x: node.position.x, y: node.position.y }, this.nodes.length + 1, z);
        this.nodes.push(newNode);
        return newNode;
      });

      // Crear columnas verticales
      groundNodes.forEach((node, idx) => {
        const column = new Beam(this.globalE, this.globalA);
        column.addNode(node);
        column.addNode(floorNodes[idx]);
        this.shapes.push(column);
      });
    }

    this.sync3D();
    console.log(`✅ ${numFloors} piso(s) agregados correctamente`);
  },

  // ==================FUNCION PARA CREAR UN PORTICO DE PRUEBA EN 3D =========================

  createTestFrame(scene) {
    console.log("🏗️ Creando pórtico de prueba en 3D...");

    if (!scene) scene = window.babylonScene;
    if (!scene) {
      console.error("No hay escena Babylon.js disponible");
      return;
    }

    // Colores
    const columnColor = new BABYLON.Color3(0.4, 0.6, 0.9); // Azul
    const beamColor = new BABYLON.Color3(0.9, 0.6, 0.2); // Naranja
    const nodeColor = new BABYLON.Color3(1, 0.3, 0.3); // Rojo

    // Nodos (coordenadas: X, Y, Z)
    const nodes = [
      { id: 1, x: 0, y: 0, z: 0 }, // Base izquierda
      { id: 2, x: 5, y: 0, z: 0 }, // Base derecha
      { id: 3, x: 0, y: 0, z: 3 }, // Superior izquierda
      { id: 4, x: 5, y: 0, z: 3 }, // Superior derecha
    ];

    // Crear nodos (esferas)
    nodes.forEach((node) => {
      const sphere = BABYLON.MeshBuilder.CreateSphere(`test_node_${node.id}`, { diameter: 0.2, segments: 16 }, scene);
      // Babylon.js: (X, Z, Y) porque Z es altura
      sphere.position = new BABYLON.Vector3(node.x, node.z, node.y);

      const material = new BABYLON.StandardMaterial(`test_nodeMat_${node.id}`, scene);
      material.diffuseColor = nodeColor;
      material.emissiveColor = new BABYLON.Color3(0.3, 0.1, 0.1);
      sphere.material = material;
    });

    // Crear columnas (cilindros verticales)
    const columns = [
      { start: { x: 0, y: 0, z: 0 }, end: { x: 0, y: 0, z: 3 } },
      { start: { x: 5, y: 0, z: 0 }, end: { x: 5, y: 0, z: 3 } },
    ];

    columns.forEach((col, idx) => {
      const start = new BABYLON.Vector3(col.start.x, col.start.z, col.start.y);
      const end = new BABYLON.Vector3(col.end.x, col.end.z, col.end.y);
      const direction = end.subtract(start);
      const length = direction.length();

      const cylinder = BABYLON.MeshBuilder.CreateCylinder(
        `test_column_${idx}`,
        { height: length, diameter: 0.15, tessellation: 8 },
        scene,
      );

      const midPoint = start.add(end).scale(0.5);
      cylinder.position = midPoint;

      const quat = BABYLON.Quaternion.FromUnitVectorsToRef(
        BABYLON.Vector3.Up(),
        direction.normalize(),
        new BABYLON.Quaternion(),
      );
      cylinder.rotationQuaternion = quat;

      const material = new BABYLON.StandardMaterial(`test_columnMat_${idx}`, scene);
      material.diffuseColor = columnColor;
      cylinder.material = material;

      // Guardar para poder limpiar después
      window.babylonElements = window.babylonElements || [];
      window.babylonElements.push(cylinder);
    });

    // Crear viga (cilindro horizontal)
    const beamStart = new BABYLON.Vector3(0, 3, 0);
    const beamEnd = new BABYLON.Vector3(5, 3, 0);
    const direction = beamEnd.subtract(beamStart);
    const length = direction.length();

    const beam = BABYLON.MeshBuilder.CreateCylinder(
      "test_beam",
      { height: length, diameter: 0.12, tessellation: 8 },
      scene,
    );

    const midPoint = beamStart.add(beamEnd).scale(0.5);
    beam.position = midPoint;

    const quat = BABYLON.Quaternion.FromUnitVectorsToRef(
      BABYLON.Vector3.Up(),
      direction.normalize(),
      new BABYLON.Quaternion(),
    );
    beam.rotationQuaternion = quat;

    const beamMat = new BABYLON.StandardMaterial("test_beamMat", scene);
    beamMat.diffuseColor = beamColor;
    beam.material = beamMat;

    // Guardar viga
    window.babylonElements.push(beam);

    // Flecha de carga (indicando fuerza de 50kN en dirección X)
    const arrowPos = new BABYLON.Vector3(0, 3.5, 0);
    const arrowDir = new BABYLON.Vector3(1, 0, 0);

    // Crear flecha con cono y cilindro
    const arrowCyl = BABYLON.MeshBuilder.CreateCylinder("arrow_cyl", { height: 1.2, diameter: 0.05 }, scene);
    arrowCyl.position = new BABYLON.Vector3(0.6, 3.5, 0);
    arrowCyl.rotation.z = Math.PI / 2;

    const arrowCone = BABYLON.MeshBuilder.CreateCylinder(
      "arrow_cone",
      { height: 0.3, diameterTop: 0, diameterBottom: 0.15 },
      scene,
    );
    arrowCone.position = new BABYLON.Vector3(1.3, 3.5, 0);
    arrowCone.rotation.z = Math.PI / 2;

    const arrowMat = new BABYLON.StandardMaterial("arrowMat", scene);
    arrowMat.diffuseColor = new BABYLON.Color3(1, 0.2, 0.2);
    arrowCyl.material = arrowMat;
    arrowCone.material = arrowMat;

    window.babylonElements.push(arrowCyl, arrowCone);

    // Etiqueta de carga
    const loadText = this.createSimpleAxisLabel("50 kN", new BABYLON.Color3(1, 0.3, 0.3), scene);
    if (loadText) loadText.position = new BABYLON.Vector3(1.8, 3.8, 0);

    console.log("✅ Pórtico de prueba creado correctamente");
  },

  // Función para mostrar el pórtico de prueba (puede ser llamada desde un botón)
  showTestFrame() {
    // Asegurar que la vista 3D está activa
    if (!this.show3DView) {
      this.toggleView3D();
      // Esperar a que Babylon.js se inicialice
      setTimeout(() => {
        this.createTestFrame(window.babylonScene);
      }, 500);
    } else if (window.babylonScene) {
      // Limpiar elementos anteriores (opcional)
      if (window.babylonElements) {
        window.babylonElements.forEach((el) => {
          if (el && el.dispose) el.dispose();
        });
        window.babylonElements = [];
      }
      this.createTestFrame(window.babylonScene);
    }

    console.log("🎯 Mostrando pórtico de prueba");
  },

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
    if (modalEl && modalEl.__x) {
      modalEl.__x.$data.openModal();
    } else {
      console.warn("Modal no encontrado, intentando con evento...");
      window.dispatchEvent(new CustomEvent("open-new-model-modal"));
    }
  },

  createModelFromDialog(params) {
    console.log("🏗️ Configurando grid de referencia con parámetros:", params);

    // Guardar parámetros del grid
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

    // Calcular posiciones de los ejes
    for (let i = 0; i < params.gridXCount; i++) {
      this.referenceGrid.xPositions.push(i * params.gridXSpacing);
    }
    for (let i = 0; i < params.gridYCount; i++) {
      this.referenceGrid.yPositions.push(i * params.gridYSpacing);
    }

    // Opcional: centrar la vista en el grid creado
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

    // Redibujar 2D con el nuevo grid
    this.redraw();

    // Dibujar grid 3D si la vista 3D está activa
    if (this.show3DView && window.babylonInitialized) {
      // Limpiar elementos anteriores del grid 3D
      if (window.babylonElements) {
        window.babylonElements = window.babylonElements.filter((el) => {
          if (el.name && el.name.startsWith("ref_")) {
            if (el.dispose) el.dispose();
            return false;
          }
          return true;
        });
      }
      this.drawReferenceGrid3D();
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

  // ===================== GRID DE REFERENCIA PARA EL MODELO 3D ========================

  drawReferenceGrid3D() {
    if (!window.babylonScene || !this.referenceGrid) return;

    const grid = this.referenceGrid;
    const xPositions = grid.xPositions;
    const yPositions = grid.yPositions;

    if (xPositions.length === 0 || yPositions.length === 0) return;

    // Colores para el grid de referencia
    const lineColor = new BABYLON.Color3(0.3, 0.6, 0.9);
    const axisColor = new BABYLON.Color3(1, 0.4, 0.4);
    const textColor = new BABYLON.Color3(0.7, 0.8, 1);

    // Altura del suelo
    const groundLevel = -0.05;

    // ========== LÍNEAS DEL SUELO (Y = 0) ==========
    // Líneas en dirección X
    yPositions.forEach((z, idx) => {
      const points = [];
      xPositions.forEach((x) => {
        points.push(new BABYLON.Vector3(x, groundLevel, z));
      });
      const lines = BABYLON.MeshBuilder.CreateLines(`ref_ground_x_${idx}`, { points }, window.babylonScene);
      const mat = new BABYLON.StandardMaterial(`ref_ground_x_mat_${idx}`, window.babylonScene);
      mat.diffuseColor = lineColor;
      mat.alpha = 0.5;
      lines.material = mat;
      window.babylonElements.push(lines);
    });

    // Líneas en dirección Z
    xPositions.forEach((x, idx) => {
      const points = [];
      yPositions.forEach((z) => {
        points.push(new BABYLON.Vector3(x, groundLevel, z));
      });
      const lines = BABYLON.MeshBuilder.CreateLines(`ref_ground_z_${idx}`, { points }, window.babylonScene);
      const mat = new BABYLON.StandardMaterial(`ref_ground_z_mat_${idx}`, window.babylonScene);
      mat.diffuseColor = lineColor;
      mat.alpha = 0.5;
      lines.material = mat;
      window.babylonElements.push(lines);
    });

    // ========== LÍNEAS DE PISOS (altura Y) ==========
    for (let floor = 1; floor <= grid.storyCount; floor++) {
      const y = floor * grid.storyHeight;
      const alpha = 0.35;

      // Líneas en dirección X
      yPositions.forEach((z, idx) => {
        const points = [];
        xPositions.forEach((x) => {
          points.push(new BABYLON.Vector3(x, y, z));
        });
        const lines = BABYLON.MeshBuilder.CreateLines(`ref_floor_${floor}_x_${idx}`, { points }, window.babylonScene);
        const mat = new BABYLON.StandardMaterial(`ref_floor_${floor}_x_mat_${idx}`, window.babylonScene);
        mat.diffuseColor = lineColor;
        mat.alpha = alpha;
        lines.material = mat;
        window.babylonElements.push(lines);
      });

      // Líneas en dirección Z
      xPositions.forEach((x, idx) => {
        const points = [];
        yPositions.forEach((z) => {
          points.push(new BABYLON.Vector3(x, y, z));
        });
        const lines = BABYLON.MeshBuilder.CreateLines(`ref_floor_${floor}_z_${idx}`, { points }, window.babylonScene);
        const mat = new BABYLON.StandardMaterial(`ref_floor_${floor}_z_mat_${idx}`, window.babylonScene);
        mat.diffuseColor = lineColor;
        mat.alpha = alpha;
        lines.material = mat;
        window.babylonElements.push(lines);
      });
    }

    // ========== EJES PRINCIPALES 3D ==========
    // Eje X (Rojo) - línea en X positiva
    const maxX = Math.max(...xPositions);
    const minX = Math.min(...xPositions);
    const maxY = Math.max(...yPositions);

    // Línea del eje X
    const xAxisPoints = [new BABYLON.Vector3(minX - 1, 0, 0), new BABYLON.Vector3(maxX + 1, 0, 0)];
    const xAxisLine = BABYLON.MeshBuilder.CreateLines("ref_x_axis", { points: xAxisPoints }, window.babylonScene);
    const xAxisMat = new BABYLON.StandardMaterial("ref_x_axis_mat", window.babylonScene);
    xAxisMat.diffuseColor = axisColor;
    xAxisLine.material = xAxisMat;
    window.babylonElements.push(xAxisLine);

    // Eje Z (Azul) - línea en Z positiva
    const zAxisPoints = [new BABYLON.Vector3(0, 0, -1), new BABYLON.Vector3(0, 0, maxY + 1)];
    const zAxisLine = BABYLON.MeshBuilder.CreateLines("ref_z_axis", { points: zAxisPoints }, window.babylonScene);
    const zAxisMat = new BABYLON.StandardMaterial("ref_z_axis_mat", window.babylonScene);
    zAxisMat.diffuseColor = new BABYLON.Color3(0.3, 0.3, 1);
    zAxisLine.material = zAxisMat;
    window.babylonElements.push(zAxisLine);

    // Eje Y (Verde) - altura
    const yAxisPoints = [
      new BABYLON.Vector3(0, -0.5, 0),
      new BABYLON.Vector3(0, grid.storyCount * grid.storyHeight + 1, 0),
    ];
    const yAxisLine = BABYLON.MeshBuilder.CreateLines("ref_y_axis", { points: yAxisPoints }, window.babylonScene);
    const yAxisMat = new BABYLON.StandardMaterial("ref_y_axis_mat", window.babylonScene);
    yAxisMat.diffuseColor = new BABYLON.Color3(0.3, 1, 0.3);
    yAxisLine.material = yAxisMat;
    window.babylonElements.push(yAxisLine);

    // ========== ETIQUETAS DE LOS EJES ==========
    // Etiqueta X
    const xLabel = this.createSimpleAxisLabel("X", new BABYLON.Color3(1, 0.4, 0.4), window.babylonScene);
    if (xLabel) {
      xLabel.position = new BABYLON.Vector3(maxX + 1.2, -0.3, 0);
      window.babylonElements.push(xLabel);
    }

    // Etiqueta Z
    const zLabel = this.createSimpleAxisLabel("Z", new BABYLON.Color3(0.3, 0.3, 1), window.babylonScene);
    if (zLabel) {
      zLabel.position = new BABYLON.Vector3(0, -0.3, maxY + 1.2);
      window.babylonElements.push(zLabel);
    }

    // Etiqueta Y (altura)
    const yLabel = this.createSimpleAxisLabel("Y", new BABYLON.Color3(0.3, 1, 0.3), window.babylonScene);
    if (yLabel) {
      yLabel.position = new BABYLON.Vector3(-0.5, grid.storyCount * grid.storyHeight + 1, -0.5);
      window.babylonElements.push(yLabel);
    }

    // ========== ETIQUETAS DE LOS EJES X y Z (A,B,C y 1,2,3) ==========
    const xLabels = grid.xLabels;
    const zLabels = grid.yLabels;

    // Etiquetas en el eje X
    xPositions.forEach((x, idx) => {
      const text = this.createSimpleAxisLabel(xLabels[idx], new BABYLON.Color3(0.5, 0.8, 1), window.babylonScene);
      if (text) {
        text.position = new BABYLON.Vector3(x, -0.4, -0.8);
        window.babylonElements.push(text);
      }
    });

    // Etiquetas en el eje Z
    yPositions.forEach((z, idx) => {
      const text = this.createSimpleAxisLabel(
        zLabels[idx].toString(),
        new BABYLON.Color3(0.5, 0.8, 1),
        window.babylonScene,
      );
      if (text) {
        text.position = new BABYLON.Vector3(-0.8, -0.4, z);
        window.babylonElements.push(text);
      }
    });

    // ========== ETIQUETAS DE PISOS (Story 1, Story 2...) ==========
    for (let floor = 1; floor <= grid.storyCount; floor++) {
      const y = floor * grid.storyHeight;
      const text = this.createSimpleAxisLabel(`P${floor}`, new BABYLON.Color3(0.7, 0.9, 0.5), window.babylonScene);
      if (text) {
        text.position = new BABYLON.Vector3(maxX + 0.8, y, -0.5);
        window.babylonElements.push(text);
      }
    }

    console.log(`✅ Grid 3D de referencia: ${xPositions.length}x${yPositions.length}, ${grid.storyCount} pisos`);
  },
});
