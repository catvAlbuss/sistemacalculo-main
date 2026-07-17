import { mousePositionFrom } from "../utils.js";

/**
 * @mixin eventsMixin
 *
 * Manejo de eventos del ratón y teclado, delegados al estado activo.
 *
 * El sistema CAD usa el patrón State Machine: hay un estado activo
 * (this.currentState) que implementa handleMouseClick, handleMouseDown,
 * handleMouseMove, etc. Este mixin es el punto de entrada desde los
 * listeners del canvas y simplemente delega al estado actual.
 *
 * También gestiona los cambios de estado (setState) y cursor (setCursor),
 * y procesa atajos de teclado globales (Escape, Delete, Ctrl+Z/Y/C/V/X).
 *
 * Responsabilidades:
 * - handleKeyDown(event)     → atajos de teclado globales del CAD
 * - handleMouseWheel(event)  → zoom con rueda del ratón
 * - handleMouseClick(event)  → click simple (delegado al estado)
 * - handleMouseDown(event)   → botón presionado (delegado al estado)
 * - handleMouseUp(event)     → botón liberado (delegado al estado)
 * - handleMouseMove(event)   → movimiento del ratón (delegado al estado)
 * - handleMouseLeave(event)  → el cursor salió del canvas
 * - setState(state, args)    → cambia el estado activo y llama a enter/exit
 * - setCursor(cursor)        → cambia el cursor CSS del canvas
 */
export const eventsMixin = {
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
      const hasSelectedFrames = this.shapes?.some(
        (frame) => frame.selected === true || frame.isSelected === true || frame.highlighted3D === true,
      );

      const hasSelectedNodes = this.nodes?.some((node) => node.selected === true || node.isSelected === true);

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

    // Ctrl+A: seleccionar TODO el modelo (nodos + barras + áreas), estilo ETABS.
    // No interceptar cuando el foco está en un input/textarea (ahí Ctrl+A debe
    // seguir seleccionando el texto).
    if (event.ctrlKey && key === "a") {
      const tag = String(event.target?.tagName || "").toLowerCase();
      const typing = tag === "input" || tag === "textarea" || tag === "select" || event.target?.isContentEditable;
      if (!typing) {
        event.preventDefault();
        this.selectAllEverything?.();
        return;
      }
    }

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

      const frame2DState = this.trussDrawingState || this.beamDrawingState || this.lineDrawingState;

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
      } else if (this.currentViewMode === "elevationX" || this.currentViewMode === "elevationY") {
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
      this.currentState?.preserveOnViewChange === true && this.currentState?.startPoint;

    if (crossViewDrawingInProgress && toState === "TrussDrawingState") {
      console.warn(
        "⛔ Cambio bloqueado: CrossViewFrameDrawingState no debe volver a TrussDrawingState durante el dibujo.",
        {
          fromState,
          toState,
          startPoint: this.currentState.startPoint,
        },
      );

      return;
    }

    // Depurar cada cambio de estado para entender mejor el flujo de herramientas.
    // console.log("🔁 Cambio de estado:", {
    //   fromState,
    //   toState,
    //   args,
    // });

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


};
