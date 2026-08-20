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
    // AGREGADO (ver conversación): se mide el CONTENEDOR PADRE del canvas
    // (getBoundingClientRect) en vez del propio canvas via getComputedStyle
    // -- un <canvas> tiene tamaño intrínseco propio (sus atributos width/
    // height, ya escalados por devicePixelRatio en la llamada anterior a
    // esta), y en un reflow ambiguo (ej. al abrir/cerrar DevTools, que
    // dispara window.resize) ese tamaño intrínseco podía contaminar la
    // lectura de su propio getComputedStyle, multiplicándose de nuevo por
    // "scale" en cada resize -- el canvas (y con él toda la página) crecía
    // un poco más en cada evento. Medir el contenedor padre rompe el ciclo:
    // su tamaño no depende del tamaño intrínseco de su hijo canvas.
    // AGREGADO (ver conversación): se fija el tamaño del canvas en PÍXELES
    // EXPLÍCITOS (no en "100%" porcentual) -- confirmado con logs reales que
    // un <canvas> con height:100% dentro de esta cadena de grid/flex
    // anidada NO estaba resolviendo su alto contra el contenedor real: caía
    // de vuelta a preservar la proporción de su resolución interna ANTERIOR
    // (width/height como atributos), aplicada sobre el ancho ya resuelto --
    // por eso la altura renderizada crecía junto con el ancho disponible
    // (a más ancho de ventana, más alto "inventado" por esa proporción
    // vieja), causando el scroll vertical al cerrar DevTools. Fijar
    // style.width/height en px explícitos evita por completo esa
    // resolución porcentual/de proporción intrínseca.
    const scale = window.devicePixelRatio; // Change to 1 on retina screens to see blurry canvas.
    const rect = this.canvas.parentElement.getBoundingClientRect();
    this.canvas.style.width = `${rect.width}px`;
    this.canvas.style.height = `${rect.height}px`;
    this.canvas.width = rect.width * scale;
    this.canvas.height = rect.height * scale;
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
