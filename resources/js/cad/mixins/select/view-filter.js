import { pointDistance, pointDistanceToSegment, removeFromArray } from "../../lib/utils.js";
import Swal from "sweetalert2";
import { Beam, Node as StructuralNode } from "../../model/shapes.js";

/**
 * @mixin viewFilterMixin
 *
 * Reglas de visibilidad 2D/3D y detección de objetos bajo el cursor.
 *
 * En el sistema CAD hay múltiples vistas (planta, elevación X, elevación Z)
 * y un visor 3D. Este mixin decide qué objetos son visibles en cada vista
 * y cuál es el objeto más cercano al punto donde el usuario hace clic o
 * mueve el cursor.
 *
 * También maneja la creación de nodos en el espacio 3D cuando el usuario
 * dibuja directamente en el visor Babylon.js (TrussDrawingState3D).
 *
 * Responsabilidades:
 *
 * Filtros de visibilidad:
 * - is3DOnlyFrame(frame)               → true si la barra solo existe en 3D
 * - shouldDrawFrameIn2D(frame)         → true si la barra debe dibujarse en el canvas 2D
 * - isNodeVisibleInActiveView(node)    → true si el nodo es visible en la vista activa
 * - isFrameVisibleInActiveView(frame)  → true si la barra es visible en la vista activa
 * - isAreaVisibleInActiveView(area)    → true si el área es visible en la vista activa
 * - getVisibleObjectsForActiveView()   → lista de todos los objetos visibles
 *
 * Hit-testing (objeto más cercano al cursor):
 * - closestPoint(screenPoint, tolerance)      → nodo más cercano
 * - closestNode(screenPoint, tolerance)       → alias de closestPoint
 * - closestBeam(screenPoint, tolerance)       → barra más cercana
 * - closestBeamAtActiveView(...)              → barra más cercana en vista activa
 * - closestParametric(screenPoint, tolerance) → modelo paramétrico más cercano
 * - closestAreaAtActiveView(...)              → área más cercana en vista activa
 * - closestDimensionLineAtActiveView(...)     → línea de dimensión más cercana
 *
 * Dibujo 3D:
 * - createNodeAt3DGridPoint(point)            → crea un nodo en coordenadas 3D del grid
 * - findOrCreateNodeAt3DModelPoint(point)     → busca o crea nodo en punto 3D del modelo
 * - projectNodeInActiveView(node)             → proyecta un nodo al espacio de pantalla 2D
 */
export const viewFilterMixin = {
  // =====================================================
  // Identifica barras inclinadas o creadas entre diferentes vistas. 
  // Estas barras se mostrarán en 3D, pero no en el canvas 2D.
  // =====================================================
  is3DOnlyFrame(frame) {
    if (!frame) return false;

    if (frame.is3DOnlyFrame === true || frame.isCrossViewFrame === true || frame.showIn2D === false) {
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
      const activeZ = Number(view?.elevation ?? this.currentZ ?? this.stories?.[this.activeStory]?.elevation ?? 0);

      const z1 = Number(p1.z || 0);
      const z2 = Number(p2.z || 0);

      return Math.abs(z1 - activeZ) <= tol && Math.abs(z2 - activeZ) <= tol;
    }

    // =====================================================
    // DISPLAY 2D > ELEVACIÓN Y
    // Plano X-Z con Y fijo.
    // Aquí sí deben mostrarse barras verticales, inclinadas
    // o cruzadas siempre que estén sobre esa elevación.
    // =====================================================
    if (view.type === "elevation" && view.axis === "Y") {
      const fixedY = Number(view.elevation ?? view.ordinate ?? view.value ?? view.coord ?? 0);

      const y1 = Number(p1.y || 0);
      const y2 = Number(p2.y || 0);

      return Math.abs(y1 - fixedY) <= tol && Math.abs(y2 - fixedY) <= tol;
    }

    // =====================================================
    // DISPLAY 2D > ELEVACIÓN X
    // Plano Y-Z con X fijo.
    // Aquí sí deben mostrarse barras verticales, inclinadas
    // o cruzadas siempre que estén sobre esa elevación.
    // =====================================================
    if (view.type === "elevation" && view.axis === "X") {
      const fixedX = Number(view.elevation ?? view.ordinate ?? view.value ?? view.coord ?? 0);

      const x1 = Number(p1.x || 0);
      const x2 = Number(p2.x || 0);

      return Math.abs(x1 - fixedX) <= tol && Math.abs(x2 - fixedX) <= tol;
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
      if (typeof this.shouldSelectFrameIn2D === "function" && !this.shouldSelectFrameIn2D(beam)) {
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

        belongs = Math.abs(z1 - viewZ) <= tolerance && Math.abs(z2 - viewZ) <= tolerance;

        p1 = this.grid.worldToScreen({ x: x1, y: y1 });
        p2 = this.grid.worldToScreen({ x: x2, y: y2 });
      } else if (view?.type === "elevation") {
        if (view.axis === "X") {
          // Plano Y-Z con X fijo
          const viewX = Number(view.value ?? 0);

          belongs = Math.abs(x1 - viewX) <= tolerance && Math.abs(x2 - viewX) <= tolerance;

          p1 = this.grid.worldToScreen({ x: y1, y: z1 });
          p2 = this.grid.worldToScreen({ x: y2, y: z2 });
        } else if (view.axis === "Y") {
          // Plano X-Z con Y fijo
          const viewY = Number(view.value ?? 0);

          belongs = Math.abs(y1 - viewY) <= tolerance && Math.abs(y2 - viewY) <= tolerance;

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

    if (frame.is3DOnlyFrame === true || frame.isCrossViewFrame === true || frame.showIn2D === false) {
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
      const connected = String(frame.node1?.id) === String(node.id) || String(frame.node2?.id) === String(node.id);

      if (!connected) return false;

      const is3DOnly =
        frame.is3DOnlyFrame === true ||
        frame.isCrossViewFrame === true ||
        frame.showIn2D === false ||
        this.isFrame3DOnlyForSelection?.(frame) === true;

      if (!is3DOnly) return false;

      // Clave: si la barra se ve en la vista activa, no necesita Alt + clic.
      const visibleInCurrent2DView = this.shouldDrawFrameIn2D?.(frame) === true;

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
      if (typeof this.isNodeVisibleInActiveView === "function" && !this.isNodeVisibleInActiveView(node)) {
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
        : "Dibujo 3D activado: seleccione el nodo inicial en la vista 3D.",
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
        "Nodo inicial seleccionado. Puede elegir otro punto, cambiar de piso/elevación y seleccionar el nodo final.",
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

    const createdFrame = this.createFrameBetween3DNodes?.(startNode, endNode, {
      startWorkPlane: this.frame3DStartWorkPlane,
      endWorkPlane: this.frame3DEndWorkPlane,
      createdAcrossWorkPlanes: true,
    });

    if (!createdFrame) return;

    // =====================================================
    // DRAW 3D > POLILÍNEA CONTINUA (ESTILO ETABS)
    // El nodo final se convierte en el nuevo nodo inicial para
    // encadenar la siguiente barra sin volver a hacer clic en él.
    // El clic derecho termina la polilínea (endFrame3DPolyline).
    // =====================================================
    startNode.selected = false;
    startNode.isSelected = false;

    endNode.selected = true;
    endNode.isSelected = true;

    this.frame3DStartNode = endNode;
    this.frame3DStartWorkPlane = {
      ...this.frame3DEndWorkPlane,
    };

    this.frame3DEndNode = null;
    this.frame3DEndWorkPlane = null;

    // La herramienta sigue activa: el próximo clic cierra el siguiente tramo.
    this.isDrawingFrame3D = true;

    this.showMessage?.(
      "Barra creada. Continúe la polilínea con otro nodo o haga clic derecho para terminar.",
    );

    console.log("✅ Tramo 3D creado (polilínea continua):", {
      frameId: createdFrame.id,
      nuevoNodoInicial: endNode.id,
    });

    this.redraw?.();
    this.sync3D?.();
  },

  // =====================================================
  // DRAW 3D > TERMINAR POLILÍNEA (CLIC DERECHO)
  // Cierra la cadena actual pero MANTIENE la herramienta de barra
  // activa, para poder empezar una polilínea nueva en otro nodo.
  // =====================================================
  endFrame3DPolyline() {
    const hadChain = Boolean(this.frame3DStartNode);

    if (this.frame3DStartNode) {
      this.frame3DStartNode.selected = false;
      this.frame3DStartNode.isSelected = false;
    }

    this.frame3DStartNode = null;
    this.frame3DEndNode = null;
    this.frame3DStartWorkPlane = null;
    this.frame3DEndWorkPlane = null;

    // La herramienta sigue activa: se puede iniciar otra polilínea.
    this.isDrawingFrame3D = false;

    if (hadChain) {
      this.showMessage?.(
        "Polilínea terminada. Seleccione otro nodo para empezar una nueva.",
      );
      console.log("🟦 Polilínea 3D terminada (clic derecho).");
    }

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
        activeView.elevation ?? activeView.ordinate ?? activeView.value ?? activeView.coord ?? 0,
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
    const source = axis === "x" ? this.referenceGrid?.xGrids : this.referenceGrid?.yGrids;

    if (!Array.isArray(source)) return [];

    return source
      .map((grid) => {
        return Number(grid.ordinate ?? grid.position ?? grid.value ?? grid.coord ?? 0);
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
    const source = axis === "x" ? this.referenceGrid?.xGrids : this.referenceGrid?.yGrids;

    if (!Array.isArray(source) || !source.length) return null;

    let nearestGrid = source[0];
    let minDistance = Math.abs(
      Number(value || 0) - Number(nearestGrid.ordinate ?? nearestGrid.position ?? nearestGrid.value ?? 0),
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

    return (
      this.nodes.find((node) => {
        const p = node.position || {};

        return (
          Math.abs(Number(p.x || 0) - Number(point.x || 0)) <= tolerance &&
          Math.abs(Number(p.y || 0) - Number(point.y || 0)) <= tolerance &&
          Math.abs(Number(p.z || 0) - Number(point.z || 0)) <= tolerance
        );
      }) || null
    );
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

    const nextId = Math.max(maxNodeId + 1, nextNodeCandidate || 1);

    this.nextNodeId = nextId + 1;

    return nextId;
  },

  // =====================================================
  // DRAW 3D > CREAR NODO EN GRID POINT EXACTO
  // Crea un nodo nuevo en una coordenada exacta de grilla 3D.
  // =====================================================

  createNodeAt3DGridPoint(point) {
    if (!point) return null;
    if (!Array.isArray(this.nodes)) this.nodes = [];

    const nodeId = this.getNextNodeIdSafe?.();

    // Crear instancia real de StructuralNode
    const node = new StructuralNode({ x: Number(point.x || 0), y: Number(point.y || 0) }, nodeId, Number(point.z || 0));

    // Asegurar coordenadas (por si el constructor no las fija bien)
    node.position.x = Number(point.x || 0);
    node.position.y = Number(point.y || 0);
    node.position.z = Number(point.z || 0);

    // Inicializar arrays y flags
    node.beams = [];
    node.selected = false;
    node.isSelected = false;
    node.visible = true;

    // Propiedades adicionales para identificar el origen 3D
    node.createdFrom3D = true;
    node.xGridId = point.xGridId ?? null;
    node.yGridId = point.yGridId ?? null;

    // Inicializar force y reaction para evitar errores en el renderizado
    node.force = node.force || {
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
    };
    node.reaction = node.reaction || {
      x: 0,
      y: 0,
      z: 0,
      rx: 0,
      ry: 0,
      rz: 0,
      getModel() {
        return this;
      },
    };
    node.soporte = "";

    this.nodes.push(node);
    console.log("📍 Nodo 3D creado en grid point:", {
      id: node.id,
      position: node.position,
      xGridId: node.xGridId,
      yGridId: node.yGridId,
    });

    return node;
  },

  // createNodeAt3DGridPoint(point) {
  //   if (!point) return null;

  //   if (!Array.isArray(this.nodes)) {
  //     this.nodes = [];
  //   }

  //   const nodeId = this.getNextNodeIdSafe?.();

  //   const node = {
  //     id: nodeId,
  //     position: {
  //       x: Number(point.x || 0),
  //       y: Number(point.y || 0),
  //       z: Number(point.z || 0),
  //     },
  //     // =====================================================
  //     // DRAW 3D > CARGAS INICIALES DEL NODO
  //     // Evita errores en renderer.drawForce() cuando el nodo
  //     // recién fue creado desde el visor 3D.
  //     // =====================================================
  //     force: {
  //       loads: {
  //         [this.options?.currentLoad || this.currentLoad || "default"]: {
  //           x: 0,
  //           y: 0,
  //           z: 0,
  //           fx: 0,
  //           fy: 0,
  //           fz: 0,
  //           mx: 0,
  //           my: 0,
  //           mz: 0,
  //         },
  //       },
  //     },
  //     // =====================================================
  //     // DRAW 3D > REACCIÓN INICIAL DEL NODO
  //     // Evita errores en renderer.drawReaction().
  //     // =====================================================
  //     reaction: {
  //       x: 0,
  //       y: 0,
  //       z: 0,
  //       rx: 0,
  //       ry: 0,
  //       rz: 0,
  //       getModel() {
  //         return this;
  //       },
  //     },
  //     beams: [],
  //     soporte: "",
  //     selected: false,
  //     isSelected: false,
  //     visible: true,

  //     // Metadata útil para saber que fue creado desde el visor 3D.
  //     createdFrom3D: true,
  //     xGridId: point.xGridId ?? null,
  //     yGridId: point.yGridId ?? null,
  //   };

  //   this.nodes.push(node);

  //   console.log("📍 Nodo 3D creado en grid point:", {
  //     id: node.id,
  //     position: node.position,
  //     xGridId: node.xGridId,
  //     yGridId: node.yGridId,
  //   });

  //   return node;
  // },

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
    if (!node1 || !node2) {
      this.showMessage?.("No se pudo crear la barra 3D: nodos inválidos.");
      return null;
    }
    if (String(node1.id) === String(node2.id)) {
      this.showMessage?.("Seleccione dos nodos diferentes para crear la barra 3D.");
      return null;
    }
    if (!Array.isArray(this.shapes)) this.shapes = [];

    // Evitar duplicados
    const existingFrame = this.shapes.find((frame) => {
      const fn1 = String(frame.node1?.id ?? frame.node1);
      const fn2 = String(frame.node2?.id ?? frame.node2);
      const pn1 = String(node1.id);
      const pn2 = String(node2.id);
      return (fn1 === pn1 && fn2 === pn2) || (fn1 === pn2 && fn2 === pn1);
    });
    if (existingFrame) {
      this.showMessage?.(`Ya existe una barra entre los nodos ${node1.id} y ${node2.id}.`);
      return null;
    }

    // Generar ID único
    const maxId = this.shapes.reduce((max, s) => Math.max(max, Number(s.id || 0)), 0);
    const nextId = Math.max(maxId + 1, Number(this.nextBeamId || 1));
    this.nextBeamId = nextId + 1;

    // Crear instancia real de Beam (importada desde shapes.js)
    const frame = new Beam(this.globalE, this.globalA);
    frame.id = nextId;
    frame.node1 = node1;
    frame.node2 = node2;
    frame.E = this.globalE;
    frame._A = this.globalA;
    frame.A = this.globalA; // por si se usa A en lugar de _A
    frame.elementType = "beam";
    frame.type = "beam";
    frame.objectType = "frame";
    frame.visible = true;

    // Propiedades 3D especiales (opcionales)
    const p1 = node1.position || {};
    const p2 = node2.position || {};
    const dx = Math.abs(Number(p2.x) - Number(p1.x));
    const dy = Math.abs(Number(p2.y) - Number(p1.y));
    const dz = Math.abs(Number(p2.z) - Number(p1.z));
    const tol = 0.001;
    const isDifferentZFrame = dz > tol;
    frame.createdFrom3D = true;
    frame.is3DOnlyFrame = isDifferentZFrame;
    frame.isCrossViewFrame = isDifferentZFrame;
    frame.showIn2D = !isDifferentZFrame;

    this.shapes.push(frame);

    // Vincular a nodos
    const addToNode = (node, f) => {
      if (!node) return;
      if (!Array.isArray(node.beams)) node.beams = [];
      if (!node.beams.includes(f)) node.beams.push(f);
    };
    addToNode(node1, frame);
    addToNode(node2, frame);

    this.redraw?.();
    this.sync3D?.();
    this.showMessage?.(`Barra 3D creada entre nodo ${node1.id} y ${node2.id}.`);
    return frame;
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
    return Number(this.preferences?.modelTolerance ?? this.modelTolerance ?? 0.001);
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

      const crossesStory = activeZ >= minZ - tol && activeZ <= maxZ + tol;

      return crossesStory && Math.abs(z1 - z2) > tol;
    }

    // ==========================
    // ELEVACIÓN
    // ==========================
    if (view.type === "elevation") {
      return this.isNodeVisibleInActiveView(frame.node1) && this.isNodeVisibleInActiveView(frame.node2);
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

      const crossesPlan = activeZ >= minZ - tol && activeZ <= maxZ + tol;

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
      if (typeof this.shouldDrawFrameIn2D === "function" && !this.shouldDrawFrameIn2D(obj)) {
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

    const axisLabel = plane === "XY" ? "Z" : plane === "XZ" ? "Y" : "X";

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
      this.isObjectOnPlane(obj, plane, planeValue, tolerance),
    );

    this.selectObjects(objects);

    this.showMessage?.(`Plano ${plane}: ${objects.length} objetos seleccionados`);
  },

  async deselectByPlane(plane = "XY") {
    const defaultValue = this.getDefaultPlaneValue(plane);

    const axisLabel = plane === "XY" ? "Z" : plane === "XZ" ? "Y" : "X";

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

    const objects = this.getSelectedObjects().filter((obj) => this.isObjectOnPlane(obj, plane, planeValue, tolerance));

    this.deselectObjects(objects);

    this.showMessage?.(`Plano ${plane}: ${objects.length} objetos deseleccionados`);
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

  // Proyecta una posición 3D al espacio de pantalla respetando la vista activa.
  // Devuelve null si el nodo no pertenece al plano visible (elevación con eje fijo).
  _projectPosToActiveView(pos) {
    const view = this.viewSet?.[this.activeViewIndex];
    const tol = 0.05;
    if (view?.type === "elevation") {
      if (view.axis === "X") {
        if (Math.abs((pos.x || 0) - (Number(view.value) || 0)) > tol) return null;
        return this.grid.worldToScreen({ x: pos.y || 0, y: pos.z || 0 });
      }
      if (view.axis === "Y") {
        if (Math.abs((pos.y || 0) - (Number(view.value) || 0)) > tol) return null;
        return this.grid.worldToScreen({ x: pos.x || 0, y: pos.z || 0 });
      }
    }
    return this.grid.worldToScreen({ x: pos.x || 0, y: pos.y || 0 });
  },

  closestParametric(searchPoint) {
    return this.parametricModels.find((p) => {
      let hit = false;

      p.nodes.find((n) => {
        const sp = this._projectPosToActiveView(n.position);
        if (sp && pointDistance(searchPoint, sp) <= 10) hit = true;
        return hit;
      });

      if (!hit) {
        p.shapes.find((s) => {
          if (!s?.node1?.position || !s?.node2?.position) return false;
          const sp1 = this._projectPosToActiveView(s.node1.position);
          const sp2 = this._projectPosToActiveView(s.node2.position);
          if (!sp1 || !sp2) return false;
          const lineLength = pointDistance(sp1, sp2);
          const d1 = pointDistance(sp1, searchPoint);
          const d2 = pointDistance(sp2, searchPoint);
          if (d1 + d2 >= lineLength - 5 && d1 + d2 <= lineLength + 5) hit = true;
          return hit;
        });
      }

      return hit;
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

  pointInPolygon(screenPoint, polygonPoints) {
    let inside = false;

    for (let i = 0, j = polygonPoints.length - 1; i < polygonPoints.length; j = i++) {
      const xi = polygonPoints[i].x,
        yi = polygonPoints[i].y;
      const xj = polygonPoints[j].x,
        yj = polygonPoints[j].y;

      const intersect =
        yi > screenPoint.y !== yj > screenPoint.y &&
        screenPoint.x < ((xj - xi) * (screenPoint.y - yi)) / (yj - yi || 1e-9) + xi;

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

      const pts = area.points.map((p) => this.currentRenderer.projectPoint({ position: p }, this));

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

  // // =========================================
  // // ========== MÉTODOS PARA DEFINE ==========
  // // =========================================

  // creaArco() {
  //   const arco = new Arco();
  //   this._ajustarModeloElevacion(arco);
  //   this.parametricModels.push(arco);
  //   this.sync3D(); // ← AÑADIR
  // },

  // creaElipse() {
  //   const puente = new Puente();
  //   this._ajustarModeloElevacion(puente);
  //   this.parametricModels.push(puente);
  //   this.sync3D(); // ← AÑADIR
  // },

  // creaTriangulo() {
  //   const triangle = new Triangle();
  //   this._ajustarModeloElevacion(triangle);
  //   this.parametricModels.push(triangle);
  //   this.sync3D(); // ← AÑADIR
  // },

  // addToScene(parametricModel) {
  //   // NO llamar _ajustarModeloElevacion aquí: ya fue llamado en creaArco/creaElipse/creaTriangulo
  //   // y también en el handleInput de cada parámetro (build() + _ajustarModeloElevacion).
  //   // Llamarlo de nuevo causaría una doble transformación que corrompe las coordenadas.
  //   this.nodes = this.nodes.concat(parametricModel.nodes);
  //   this.shapes = this.shapes.concat(parametricModel.shapes);
  //   removeFromArray(this.parametricModels, parametricModel);
  //   this.nodes.forEach((node, index) => {
  //     node.id = index + 1;
  //   });
  //   this.shapes.forEach((beam, index) => {
  //     beam.id = index + 1;
  //   });
  //   this.setState(this.idleState);
  //   this.sync3D();
  // },

  // // ===============================================
  // // ========== MÉTODOS PARA EL MENÚ FILE ==========
  // // ===============================================


};
