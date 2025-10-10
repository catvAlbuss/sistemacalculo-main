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

export default () => ({
  init() {},

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
    this.prevState = null;

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
      { passive: false }
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
  },

  creaArco() {
    this.parametricModels.push(new Arco());
  },

  creaElipse() {
    this.parametricModels.push(new Puente());
  },

  creaTriangulo() {
    this.parametricModels.push(new Triangle());
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
          this.grid.worldToScreen(s.node2.position)
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
          this.grid.worldToScreen(s.points[(index + 1) % s.points.length])
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
        this.grid.worldToScreen(s.node2.position)
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
        "]"
    );
    formData.append(
      "barras",
      "[" +
        this.shapes
          .map((beam, index) => {
            return [index + 1, this.nodes.indexOf(beam.node1) + 1, this.nodes.indexOf(beam.node2) + 1].join(",");
          })
          .join(";") +
        "]"
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
        "]"
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
        "]"
    );
    formData.append(
      "propiedades",
      "[" +
        this.shapes
          .map((beam) => {
            return [beam.A, beam.E].join(",");
          })
          .join(";") +
        "]"
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
      minmax
    );
    const [miny, maxy] = this.nodes.reduce(
      ([min, max], node) => [Math.min(min, node.position.y), Math.max(max, node.position.y)],
      minmax
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
      minmax
    );
    const [miny, maxy] = this.matrizDesplazamiento.reduce(
      ([min, max], [x, y, z]) => [Math.min(min, y), Math.max(max, y)],
      minmax
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
});
