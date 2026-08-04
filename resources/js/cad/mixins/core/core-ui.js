/**
 * @mixin coreUiMixin
 *
 * Métodos fundamentales de interfaz de usuario del CAD.
 *
 * Son los más llamados por todos los demás mixins. Cualquier operación que
 * necesite notificar al usuario, redibujar el canvas o ajustar el layout
 * pasa por aquí.
 *
 * Responsabilidades:
 * - showMessage(message, type)  → muestra un toast de notificación temporal
 * - redraw()                    → redibuja el canvas 2D con el renderer activo
 * - windowResize()              → ajusta canvas y vista al tamaño actual de ventana
 * - fitContentToScreen()        → hace zoom para que todo el modelo quepa en pantalla
 */
export const coreUiMixin = {
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

  // ------------------------------------------------------------------
  // 7. MÉTODOS DE DIBUJO Y RENDERIZADO (2D y 3D)
  // ------------------------------------------------------------------

  redraw() {
    this.currentRenderer.render(this);

    if (this.currentState?.draw) {
      this.currentState.draw(this.currentRenderer, this);
    }

    // Refresca la barra de estado de selección (estilo ETABS) — redraw() se
    // dispara tras cambios de selección, así que bumpear el tick mantiene el
    // label actualizado sin depender de la reactividad profunda del modelo.
    this._selectionTick = (this._selectionTick || 0) + 1;

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

    // Solo puede haber UNA herramienta activa: si venía dibujando una losa en
    // 3D, su polígono a medio marcar se descarta (si no, quedaría fantasma en
    // el preview y el próximo Esc cancelaría la losa en vez de la barra).
    this.slab3DPoints = [];
    this.isDrawingSlab3D = false;
    window.__jhRefresh3DSlabPreview?.();

    this.clearAllSelections?.();

    if (this.idleState) {
      this.setState?.(this.idleState);
    }

    this.showMessage?.("Herramienta de barra activada. Dibuje en 2D o seleccione nodos en 3D.");

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
  // DRAW SLAB > ACTIVAR HERRAMIENTA GENERAL DE LOSAS
  // Espejo de startFrameDrawingMode: una sola herramienta que sirve para el
  // canvas 2D (AreaDrawingState, vista en planta) y para el visor 3D
  // (observable de Babylon → handle3DSlabPointPicked). El estado 2D lo
  // asigna el despachador del menú; acá solo se marca la herramienta.
  // =====================================================
  startSlabDrawingMode() {
    this.activeDrawTool = "slab";

    this.isDrawingSlab3D = false;
    this.slab3DPoints = [];

    window.__jhRefresh3DSlabPreview?.();

    console.log("🟢 Draw Slab general activado:", {
      activeDrawTool: this.activeDrawTool,
      activeViewport: this.activeViewport,
    });
  },

  // =====================================================
  // DRAW SLAB > CANCELAR HERRAMIENTA GENERAL DE LOSAS
  // Limpia también el polígono 3D a medio marcar y libera la cámara/plano
  // invisible del visor (si no, el 3D queda con el clic izquierdo tomado).
  // =====================================================
  // `silent` = se está cambiando a otra herramienta de dibujo; el mensaje lo
  // pone esa otra herramienta y no hace falta reasignar el estado 2D.
  cancelSlabDrawingMode({ silent = false } = {}) {
    this.activeDrawTool = null;

    this.isDrawingSlab3D = false;
    this.slab3DPoints = [];

    if (!silent && this.idleState) {
      this.setState?.(this.idleState);
    }

    window.__jhSet3DDrawCameraLock?.(false);
    window.__jhClear3DGridPointHoverReference?.();
    window.__jhDisable3DWorkPlanePickMesh?.();
    window.__jhRefresh3DSlabPreview?.();

    this.redraw?.();
    this.sync3D?.();

    if (!silent) {
      this.showMessage?.("Herramienta de losa cancelada.");
    }

    console.log("🟡 Draw Slab general cancelado");
  },

  // =====================================================
  // DRAW SLAB > VALIDAR SI LA HERRAMIENTA ESTÁ ACTIVA
  // La usa el visor 3D para decidir si el clic dibuja o selecciona.
  // =====================================================
  isSlabDrawingToolActive() {
    return this.activeDrawTool === "slab";
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

    // Si el usuario cambia a 3D mientras dibuja una barra, mantenemos la herramienta activa para permitir dibujo entre planos.
    // console.log("🧭 Viewport activo:", {
    //   activeViewport: this.activeViewport,
    //   activeDrawTool: this.activeDrawTool,
    //   isDrawingFrame3D: this.isDrawingFrame3D,
    //   reason,
    // });
  },

  // =====================================================
  // VIEWPORT > MARCAR CANVAS 2D ACTIVO
  // Se llama cuando el mouse/clic ocurre sobre el canvas 2D.
  // =====================================================

};
