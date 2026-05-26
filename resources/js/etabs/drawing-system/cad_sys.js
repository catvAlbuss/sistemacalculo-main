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
import {cadEngine} from '../cadEngine.js';

export default () => ({
  init() {},

  async initSys(canvas, distanceInput) {


    // Al inicio de initSys(), junto a las otras propiedades
    this.statusCoordinates = null;
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
    // NO usar el canvas que viene por parámetro (es el superpuesto)
    // En su lugar, buscar el canvas del visor CAD
    let cadCanvas = document.querySelector(".ml-cad-container canvas");

    if (!cadCanvas) {
      console.log("Esperando canvas del CAD...");
      const observer = new MutationObserver(() => {
        cadCanvas = document.querySelector(".ml-cad-container canvas");
        if (cadCanvas) {
          observer.disconnect();
          this._initWithCadCanvas(cadCanvas, distanceInput);
        }
      });
      observer.observe(document.body, { childList: true, subtree: true });
      return;
    }

    this._initWithCadCanvas(cadCanvas, distanceInput);
  },

  _initWithCadCanvas(cadCanvas, distanceInput) {
    console.log("🎨 Inicializando cadSys con overlay independiente");

    // 1. PRIMERO: Inicializar arrays vacíos
    this.shapes = [];
    this.nodes = [];
    this.parametricModels = [];
    this.K_Global_Reducido = [];
    this.Fuerzas_Globales_Reducidas = [];
    this.D_Global_Reducido = [];
    this.deflecciones = [];
    this.desplazamientosPosition = [];
    this.matrizDesplazamiento = [];
    this.mousePos = { x: 0, y: 0 };
    this.currentTab = "diseño";
    this.snap_enabled = true;
    this.globalE = 210;
    this.globalA = "25x25-1.5";
    this.selectedObject = null;
    this.sections = sections;
    this.materiales = [
      { id: 1, E: 210, A: 4000 },
      { id: 1, E: 2e1, A: 0.0012 },
      { id: 1, E: 300, A: 40 },
    ];

    // 2. Opciones del sistema
    this.options = {
      showGrid: false,
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
    this.oldOptions = { ...this.options };

    // 3. Crear overlay canvas
    // 3. Crear overlay canvas
    this.canvas = cadCanvas;
    this.ctx = cadCanvas.getContext("2d");

    // ⚠️ CREAR el overlay antes de usarlo
    this.overlayCanvas = document.createElement("canvas");

    // Copiar tamaño del canvas CAD
    this.overlayCanvas.width = cadCanvas.width;
    this.overlayCanvas.height = cadCanvas.height;

    this.overlayCanvas.id = "drawing-overlay-canvas";
    this.overlayCanvas.style.position = "absolute";
    this.overlayCanvas.style.top = "0";
    this.overlayCanvas.style.left = "0";
    this.overlayCanvas.style.width = "100%";
    this.overlayCanvas.style.height = "100%";
    this.overlayCanvas.style.pointerEvents = "none";
    this.overlayCanvas.style.zIndex = "20";
    this.overlayCanvas.style.backgroundColor = "transparent";

    // this.cadEngine = cadEngine;
  // this.startSyncLoop();

    // Después de crear this.overlayCanvas, agregar:
    this.cadDocManager = null;
    this.cadView = null;
    this.cadWorldToScreen = null;
    this.cadScreenToWorld = null;

    // Insertar sobre el canvas del CAD
    const container = cadCanvas.parentElement;
    container.style.position = "relative";
    container.appendChild(this.overlayCanvas);

    this.canvas = this.overlayCanvas;
    this.ctx = this.overlayCanvas.getContext("2d");
    this.distanceInput = distanceInput;

    // 4. Crear grid
    this.grid = new Grid(this.canvas);

    // 5. Renderers
    this.diseñoRenderer = new DiseñoRenderer();
    this.deflexionRenderer = new DeflexionRenderer();
    this.axialRenderer = new AxialRenderer();
    this.currentRenderer = this.diseñoRenderer;
    this.oldRenderer = this.diseñoRenderer;

    // 6. Estados
    this.panAndZoomState = new PanAndZoomState();
    this.idleState = new IdleState();
    this.moveState = new MoveObjectState();
    this.trussDrawingState = new TrussDrawingState(this);
    this.moveObjectState = new MoveObjectState();
    this.selectedNodesState = new SelectedNodesState();
    this.selectedBeamsState = new SelectedBeamsState();
    this.editParametricState = new EditParametricState();
    this.selectedParametricState = new SelectedParametricState();
    this.selectionState = new SelectionState();
    this.currentState = this.idleState;
    this.prevState = null;

    // 7. Configurar eventos en el canvas del CAD
    this.setupCanvasEventsOnCAD(cadCanvas);

    // 8. Redimensionar overlay
    this.resizeOverlay();

    // 9. INICIALIZAR cadEngine Y startSyncLoop DESPUÉS de tener el grid
    this.cadEngine = cadEngine;
    // Inicializar el motor CAD con el contenedor
    const cadContainer = document.querySelector('.ml-cad-viewer-container');
    if (cadContainer) {
        this.cadEngine.init(cadContainer);
    }
    
    // Iniciar loop de sincronización
    this.startSyncLoop();

    console.log("✅ cadSys inicializado con overlay independiente");
  },

  startSyncLoop() {
    let lastRedraw = 0;
    const sync = () => {
        const now = performance.now();
        // Redibujar máximo a 30fps (cada 33ms)
        if (now - lastRedraw > 33) {
            this.redraw();
            lastRedraw = now;
        }
        requestAnimationFrame(sync);
    };
    sync();
},

hasActiveCadDocument() {
    return this.cadEngine && 
           this.cadEngine.docManager && 
           this.cadEngine.docManager.curDocument;
},

  setupCanvasEvents() {
    this.canvas.oncontextmenu = () => false;

    this.canvas.addEventListener(
      "wheel",
      (event) => {
        event.preventDefault();
        this.handleMouseWheel(event);
      },
      { passive: false },
    );

    this.canvas.onclick = (event) => this.handleMouseClick(event);
    this.canvas.onmousedown = (event) => this.handleMouseDown(event);
    this.canvas.onmouseup = (event) => this.handleMouseUp(event);
    this.canvas.onmouseleave = (event) => this.handleMouseLeave(event);
    this.canvas.onmousemove = (event) => this.handleMouseMove(event);

    document.onkeydown = (event) => this.handleKeyDown(event);
    window.onresize = () => this.windowResize();
  },

  resizeOverlay() {
    if (!this.overlayCanvas) return;
    const cadCanvas = document.querySelector(".ml-cad-container canvas");
    if (cadCanvas) {
      const rect = cadCanvas.getBoundingClientRect();
      if (this.overlayCanvas.width !== rect.width || this.overlayCanvas.height !== rect.height) {
        this.overlayCanvas.width = rect.width;
        this.overlayCanvas.height = rect.height;
        this.overlayCanvas.style.width = `${rect.width}px`;
        this.overlayCanvas.style.height = `${rect.height}px`;

        if (this.grid) {
          this.grid.resize(this.canvas);
        }
        this.redraw();
      }
    }
  },

  setupCanvasEventsOnCAD(cadCanvas) {
    cadCanvas.style.cursor = "crosshair";
    cadCanvas.style.pointerEvents = "auto";
    cadCanvas.oncontextmenu = () => false;

    // NO agregar evento wheel aquí - dejar que el CAD nativo lo maneje
    
    // Solo eventos para dibujo
    cadCanvas.addEventListener("mousedown", (event) => {
        if (this.handleMouseDown) this.handleMouseDown(event);
    });

    cadCanvas.addEventListener("mouseup", (event) => {
        if (this.handleMouseUp) this.handleMouseUp(event);
    });

    cadCanvas.addEventListener("mousemove", (event) => {
        if (this.handleMouseMove) this.handleMouseMove(event);
        this.redraw();
    });

    cadCanvas.addEventListener("mouseleave", (event) => {
      if (this.handleMouseLeave) {
        this.handleMouseLeave(event);
      }
    });

    cadCanvas.addEventListener("click", (event) => {
      if (this.handleMouseClick) {
        this.handleMouseClick(event);
      }
    });

    document.addEventListener("keydown", (event) => {
      if (this.handleKeyDown) {
        this.handleKeyDown(event);
      }
    });

    window.addEventListener("resize", () => {
      this.resizeOverlay();
    });

    console.log("✅ Eventos sincronizados con canvas CAD");
  },

  // Agregar después de setupCanvasEventsOnCAD
connectToCadEngine() {
    // Buscar el AcApDocManager que se crea en main.js
    const checkManager = () => {
        // El docManager se crea globalmente cuando se inicializa el visor
        if (window.AcApDocManager && window.AcApDocManager.curView) {
            this.cadDocManager = window.AcApDocManager;
            this.cadView = this.cadDocManager.curView;
            
            // Guardar funciones de conversión
            if (this.cadView.worldToScreen) {
                this.cadWorldToScreen = (point) => {
                    const result = this.cadView.worldToScreen(point);
                    return result ? { x: result.x, y: result.y } : null;
                };
            }
            if (this.cadView.screenToWorld) {
                this.cadScreenToWorld = (point) => {
                    const result = this.cadView.screenToWorld(point);
                    return result ? { x: result.x, y: result.y } : null;
                };
            }
            
            console.log("✅ Conectado al motor CAD nativo");
            this.startCadSyncLoop();
            return;
        }
        setTimeout(() => checkManager(), 500);
    };
    checkManager();
},

// Loop de sincronización continua
startCadSyncLoop() {
    const sync = () => {
        if (this.cadEngine && this.cadEngine.getView) {
            const view = this.cadEngine.getView();
            if (view) {
                // Actualizar zoom
                if (view.zoom && Math.abs(this.grid.scaleX - view.zoom) > 0.001) {
                    this.grid.scaleX = view.zoom;
                    this.grid.scaleY = view.zoom;
                }
                
                // Actualizar offset desde la vista del CAD
                // La vista del CAD tiene un center o una posición
                if (view.center) {
                    this.grid.offestX = view.center.x;
                    this.grid.offestY = view.center.y;
                }
                
                this.redraw();
            }
        }
        requestAnimationFrame(sync);
    };
    sync();
},

// NUEVO: Conversión de coordenadas usando el CAD nativo
worldToScreen(point) {
    // Usar el motor CAD
    if (this.cadEngine && this.cadEngine.worldToScreen) {
        const result = this.cadEngine.worldToScreen({ x: point.x, y: point.y });
        if (result && typeof result.x === 'number') {
            return { x: result.x, y: result.y };
        }
    }
    // Fallback
    return this.grid.worldToScreen(point);
},

screenToWorld(point) {
    if (this.cadScreenToWorld) {
        const result = this.cadScreenToWorld({ x: point.x, y: point.y });
        if (result && typeof result.x === 'number') {
            return { x: result.x, y: result.y };
        }
    }
    return this.grid.screenToWorld(point);
},

connectEngine(engine) {
    this.cadEngine = engine;
    console.log("✅ Motor CAD conectado a cadSys");
    
    // Iniciar loop de sincronización
    this.startSyncLoop();
},

  // syncOverlayWithCAD() {
  //   const cadCanvas = document.querySelector(".ml-cad-container canvas");

  //   if (!cadCanvas || !this.overlayCanvas) return;

  //   // Obtener transform actual del CAD
  //   const transform = window.getComputedStyle(cadCanvas).transform;

  //   // Aplicar EXACTAMENTE el mismo transform al overlay
  //   this.overlayCanvas.style.transform = transform;
  //   this.overlayCanvas.style.transformOrigin = "0 0";
  // },

  // Función para centrar y restablecer vista
  fitContentToScreen() {
    // Restablecer zoom y offset de nuestro grid
    this.grid.scaleX = 1;
    this.grid.scaleY = 1;
    this.grid.offestX = 0;
    this.grid.offestY = 0;

    // Restablecer transformación del canvas del CAD
    const cadCanvas = document.querySelector(".ml-cad-container canvas");
    if (cadCanvas) {
      cadCanvas.style.transform = "";
    }

    this.redraw();

    // También centrar los nodos existentes
    if (this.nodes.length > 0) {
      const minx = Math.min(...this.nodes.map((n) => n.position.x));
      const maxx = Math.max(...this.nodes.map((n) => n.position.x));
      const miny = Math.min(...this.nodes.map((n) => n.position.y));
      const maxy = Math.max(...this.nodes.map((n) => n.position.y));

      const centerX = (minx + maxx) / 2;
      const centerY = (miny + maxy) / 2;

      const canvasCenterX = this.canvas.width / 2;
      const canvasCenterY = this.canvas.height / 2;

      this.grid.offestX = centerX - canvasCenterX / this.grid.scaleX;
      this.grid.offestY = centerY - canvasCenterY / this.grid.scaleY;
      this.redraw();
    }
  },

  cadToScreen(point) {
    const cadCanvas = document.querySelector(".ml-cad-container canvas");

    if (!cadCanvas) return point;

    return {
      x: point.x,
      y: point.y,
    };
  },

  // Nueva función para inicializar con el canvas del CAD

  resizeCanvas() {
    if (!this.canvas) return;
    const container = this.canvas.parentElement;
    if (container) {
      const rect = container.getBoundingClientRect();
      this.canvas.width = rect.width;
      this.canvas.height = rect.height;
      if (this.grid) {
        this.grid.resize(this.canvas);
      }
      this.redraw();
    }
  },

  setupEventListeners() {
    // Mantener tus event listeners existentes
    // this.canvas.oncontextmenu = () => false;
    // this.canvas.addEventListener('wheel', (event) => {
    //   event.preventDefault();
    //   this.handleMouseWheel(event);
    // }, { passive: false });
    // this.canvas.onclick = (event) => this.handleMouseClick(event);
    // this.canvas.onmousedown = (event) => this.handleMouseDown(event);
    // this.canvas.onmouseup = (event) => this.handleMouseUp(event);
    // this.canvas.onmouseleave = (event) => this.handleMouseLeave(event);
    // this.canvas.onmousemove = (event) => this.handleMouseMove(event);

    console.log("setupEventListeners llamado (puede ser redundante)");
  },

  // En cad_sys.js
  startLineDrawing() {
    if (window.drawingSystem) {
      window.drawingSystem.setMode("line");
    }
  },

  startCircleDrawing() {
    if (window.drawingSystem) {
      window.drawingSystem.setMode("circle");
    }
  },

  startRectangleDrawing() {
    if (window.drawingSystem) {
      window.drawingSystem.setMode("rectangle");
    }
  },

  clearDrawings() {
    if (window.drawingSystem) {
      window.drawingSystem.clear();
    }
  },

  // En cad_sys.js, dentro del objeto retornado
  toggleCadVisibility(visible) {
    // Ocultar/mostrar el grid de dibujo
    this.options.showGrid = !visible;

    // Si estás en modo CAD, desactivar el snap también (opcional)
    if (!visible) {
      this.snap_enabled = false;
    } else {
      this.snap_enabled = true;
    }

    // Redibujar
    this.redraw();
  },

  // Método para calibrar/ajustar el grid al plano importado
  calibrateGridToCad(cadBounds) {
    if (!cadBounds) return;

    // Ajustar el grid para que coincida con las dimensiones del CAD
    const width = cadBounds.maxX - cadBounds.minX;
    const height = cadBounds.maxY - cadBounds.minY;

    // Calcular un espaciado de grid apropiado (p.ej., 1/10 del ancho)
    const suggestedSpacing = Math.max(width, height) / 20;
    this.grid.gridSpacing = Math.max(1, suggestedSpacing);

    // Centrar la vista en el plano CAD
    this.grid.centerToView({
      cminx: cadBounds.minX,
      cminy: cadBounds.minY,
      cmaxx: cadBounds.maxX,
      cmaxy: cadBounds.maxY,
    });

    this.redraw();
  },

  // En cad_sys.js, dentro del objeto retornado
  toggleCadMode(enabled) {
    if (enabled) {
      // Modo CAD: ocultar grid de dibujo
      this.options.showGrid = false;
      this.snap_enabled = false;
      // Limpiar el canvas para que se vea el CAD
      this.redraw();
    } else {
      // Modo dibujo: restaurar grid
      this.options.showGrid = true;
      this.snap_enabled = true;
      this.redraw();
    }
  },

  // Limpiar todo el canvas (para que no tape el CAD)
  clearCanvas() {
    if (this.ctx) {
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }
  },

  // Modificar redraw para dibujar en el overlay
  redraw() {
    if (!this.ctx || !this.canvas) return;
    if (!this.nodes || !this.shapes) return;

    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    if (this.options.showGrid && this.grid) {
        this.grid.draw(this.ctx, this);
    }

    // Dibujar nodos - USANDO worldToScreen sincronizado
    if (this.nodes && this.nodes.length > 0) {
        this.nodes.forEach((node) => {
            if (node && node.position) {
                const p = this.worldToScreen(node.position); // ← CAMBIADO
                if (p) {
                    this.ctx.beginPath();
                    this.ctx.fillStyle = "#ff0000";
                    this.ctx.arc(p.x, p.y, 6, 0, 2 * Math.PI);
                    this.ctx.fill();
                    this.ctx.fillStyle = "white";
                    this.ctx.font = "bold 12px Arial";
                    this.ctx.fillText(node.id, p.x + 8, p.y - 5);
                }
            }
        });
    }

    // Dibujar vigas - USANDO worldToScreen sincronizado
    if (this.shapes && this.shapes.length > 0) {
        this.shapes.forEach((beam) => {
            if (beam && beam.node1 && beam.node2) {
                const p1 = this.worldToScreen(beam.node1.position); // ← CAMBIADO
                const p2 = this.worldToScreen(beam.node2.position); // ← CAMBIADO
                if (p1 && p2) {
                    this.ctx.beginPath();
                    this.ctx.strokeStyle = "#00ff00";
                    this.ctx.lineWidth = 3;
                    this.ctx.moveTo(p1.x, p1.y);
                    this.ctx.lineTo(p2.x, p2.y);
                    this.ctx.stroke();

                    const midX = (p1.x + p2.x) / 2;
                    const midY = (p1.y + p2.y) / 2;
                    this.ctx.fillStyle = "yellow";
                    this.ctx.font = "10px Arial";
                    this.ctx.fillText(beam.id, midX, midY - 5);
                }
            }
        });
    }
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
    // No hacer zoom manual
    // Solo redibujar después para asegurar que los dibujos se actualicen
    setTimeout(() => this.redraw(), 50);
    event.preventDefault();
},

  handleMouseClick(event) {
    this.currentState.handleMouseClick(event, this, mousePositionFrom(this.canvas, event));
  },

  handleMouseDown(event) {
    if (this.currentState && this.currentState.handleMouseDown) {
      this.currentState.handleMouseDown(event, this, mousePositionFrom(this.canvas, event));
    }
  },

  handleMouseUp(event) {
    if (this.currentState && this.currentState.handleMouseUp) {
      this.currentState.handleMouseUp(event, this, mousePositionFrom(this.canvas, event));
    }
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
    if (this.currentState && this.currentState.handleMouseMove) {
      this.currentState.handleMouseMove(event, this, mousePositionFrom(this.canvas, event));
    }
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
});
