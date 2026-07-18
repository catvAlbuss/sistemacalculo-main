import Swal from "sweetalert2";

/**
 * @mixin elevationDrawingMixin
 *
 * Dibujo de vistas de elevación y utilidades de limpieza de selección.
 *
 * Gestiona la lógica específica de las vistas de elevación (ElevationX,
 * ElevationZ): qué barras se dibujan, cómo se proyectan los nodos y cómo
 * se construyen los ejes de referencia en esas vistas.
 *
 * También contiene la implementación canónica de clearAllSelections(),
 * que es más robusta que la versión en selection.js porque llama a
 * state.exit() de forma segura y limpia flags en todos los objetos del
 * modelo (nodes, shapes, areas, parametricModels, dimensionLines).
 *
 * El orden de spread en cad_sys.js coloca este mixin DESPUÉS de
 * selection.js para que clearAllSelections() de aquí prevalezca.
 *
 * Responsabilidades:
 * - clearAllSelections()           → limpieza completa y segura de toda selección
 * - drawElevationFrame(ctx, frame) → dibuja una barra en vista de elevación
 * - getElevationFrames()           → barras visibles en la elevación activa
 * - buildElevationAxisLabels()     → construye etiquetas de ejes para elevación
 * - getFrameUtilsForElevation()    → utilidades de frame específicas de elevación
 */
export const elevationDrawingMixin = {
  clearAllSelections() {
    // =====================================================
    // SELECTION > FUNCIÓN SEGURA PARA LIMPIAR UN OBJETO
    // No usa setObjectSelected para evitar llamadas internas
    // a style.default() sin validar.
    // =====================================================
    const safeUnselectObject = (obj) => {
      if (!obj) return;

      obj.selected = false;
      obj.isSelected = false;
      obj.highlighted3D = false;
      obj.is3DOnlyEndpointHover = false;

      if (obj.style && typeof obj.style.default === "function") {
        obj.style.default();
      }
    };

    // =====================================================
    // SELECTION > LIMPIAR OBJETOS DEL MODELO
    // =====================================================
    this.nodes?.forEach((node) => {
      safeUnselectObject(node);
    });

    this.shapes?.forEach((frame) => {
      safeUnselectObject(frame);
    });

    this.areas?.forEach((area) => {
      safeUnselectObject(area);
    });

    this.dimensionLines?.forEach((dim) => {
      safeUnselectObject(dim);
    });

    this.parametricModels?.forEach((parametric) => {
      safeUnselectObject(parametric);
    });

    // =====================================================
    // SELECTION > LIMPIAR ESTADOS DE SELECCIÓN
    // Protegemos state.exit() porque algunos estados antiguos
    // pueden usar style.default() directamente.
    // =====================================================
    const states = [
      this.selectedNodesState,
      this.selectedBeamsState,
      this.selectedParametricState,
      this.selectedAreasState,
      this.selectedDimensionLinesState,
      this.selectionState,
    ];

    states.forEach((state) => {
      if (!state) return;

      try {
        state.exit?.();
      } catch (error) {
        console.warn("⚠️ state.exit falló durante clearAllSelections:", {
          state: state.constructor?.name,
          error: error?.message,
        });
      }

      if (Array.isArray(state.selectedObjects)) {
        state.selectedObjects = [];
      }

      if (Array.isArray(state.selectedNodes)) {
        state.selectedNodes = [];
      }

      if (Array.isArray(state.selectedBeams)) {
        state.selectedBeams = [];
      }

      if (Array.isArray(state.selectedAreas)) {
        state.selectedAreas = [];
      }

      if (Array.isArray(state.selectedDimensionLines)) {
        state.selectedDimensionLines = [];
      }

      if (Array.isArray(state.objects)) {
        state.objects = [];
      }

      state.selectedObject = null;
      state.selectedNode = null;
      state.selectedBeam = null;
      state.selectedArea = null;
    });

    // =====================================================
    // SELECTION > LIMPIAR MOVE OBJECT
    // =====================================================
    if (this.moveObjectState) {
      safeUnselectObject(this.moveObjectState.selectedObject);

      this.moveObjectState.selectedObject = null;
      this.moveObjectState.selectedNode = null;
      this.moveObjectState.selectedBeam = null;
      this.moveObjectState.selectedArea = null;
      this.moveObjectState.isMoving = false;
      this.moveObjectState.startPoint = null;
      this.moveObjectState.lastPoint = null;
    }

    // =====================================================
    // SELECTION > LIMPIAR RESHAPE OBJECT
    // =====================================================
    if (this.reshapeObjectState) {
      safeUnselectObject(this.reshapeObjectState.selectedObject);
      safeUnselectObject(this.reshapeObjectState.selectedNode);
      safeUnselectObject(this.reshapeObjectState.selectedBeam);
      safeUnselectObject(this.reshapeObjectState.selectedArea);

      this.reshapeObjectState.selectedObject = null;
      this.reshapeObjectState.selectedNode = null;
      this.reshapeObjectState.selectedBeam = null;
      this.reshapeObjectState.selectedArea = null;
      this.reshapeObjectState.selectedVertexIndex = null;
      this.reshapeObjectState.isMoving = false;
    }

    // =====================================================
    // SELECTION > LIMPIAR VARIABLES GLOBALES
    // =====================================================
    this.selectedNode = null;
    this.selectedBeam = null;
    this.selectedArea = null;
    this.selectedObject = null;

    this.selectedBeams = [];
    this.selectedObjects = [];

    this.hovered3DOnlyEndpointNode = null;
    this.hovered3DOnlyEndpointFrames = [];
    this.last3DOnlyEndpointHelpKey = null;

    // =====================================================
    // 3D DRAW > DESBLOQUEAR CÁMARA
    // =====================================================
    window.__jhSet3DDrawCameraLock?.(false);

    // =====================================================
    // 3D > FORZAR LIMPIEZA DE HIGHLIGHTS
    // =====================================================
    this.forceClear3DFrameHighlights = true;

    // =====================================================
    // DRAW 3D > CONSERVAR NODO INICIAL SI ESTOY DIBUJANDO
    // Permite cambiar de planta/elevación entre primer y segundo clic.
    // =====================================================
    if (this.activeDrawTool === "frame" && this.isDrawingFrame3D === true && this.frame3DStartNode) {
      this.frame3DStartNode.selected = true;
      this.frame3DStartNode.isSelected = true;
    }

    console.log("🧹 clearAllSelections ejecutado:", {
      selectedFrames: this.shapes?.filter((frame) => frame.selected || frame.isSelected || frame.highlighted3D).length,
      selectedNodes: this.nodes?.filter((node) => node.selected || node.isSelected).length,
    });

    // =====================================================
    // RENDER > ACTUALIZAR VISTAS
    // =====================================================
    try {
      this.redraw?.();
    } catch (error) {
      console.warn("⚠️ redraw falló después de clearAllSelections:", error?.message);
    }

    try {
      this.sync3D?.();

      requestAnimationFrame(() => {
        this.sync3D?.();
      });
    } catch (error) {
      console.warn("⚠️ sync3D falló después de clearAllSelections:", error?.message);
    }

    this.showMessage?.("Selección limpiada");
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
    const beamsToDraw = this.shapes.filter((beam) => {
      if (this.shouldDrawFrameIn2D && !this.shouldDrawFrameIn2D(beam)) {
        return false;
      }

      return nodesToDraw.includes(beam.node1) && nodesToDraw.includes(beam.node2);
    });

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

  // ------------------------------------------------------------------
  // 21. MÉTODOS AUXILIARES PARA SECCIONES Y MATERIALES
  // ------------------------------------------------------------------

  getEnabledReinforcementBars() {
    return this.reinforcementBarSizes.filter((bar) => bar.enabled);
  },

  getSteelFrameDesignConfig() {
    return {
      ...this.steelFrameDesign,
    };
  },

  getFrameObjects() {
    return this.getSelectableObjects().filter((obj) => {
      const type = obj.elementType || obj.type || obj.objectType;

      return (
        (obj.node1 && obj.node2) ||
        type === "beam" ||
        type === "column" ||
        type === "brace" ||
        type === "secondary-beam" ||
        type === "frame"
      );
    });
  },

  getFrameSectionKey(frame) {
    if (!frame) return null;

    const section =
      frame.sectionId ||
      frame.sectionName ||
      frame.frameSection ||
      frame.frameSectionId ||
      frame.section?.id ||
      frame.section?.name ||
      frame.seccion ||
      frame.sección ||
      frame.section ||
      frame._section ||
      frame._A ||
      frame.A ||
      null;

    if (section && typeof section === "object") {
      return section.name || section.id || "Sin sección";
    }

    return section ? String(section) : "Sin sección";
  },

  getUsedFrameSections() {
    const sections = new Set();

    this.getFrameObjects().forEach((frame) => {
      const sectionKey = this.getFrameSectionKey(frame);

      if (sectionKey && sectionKey !== "Sin sección") {
        sections.add(sectionKey);
      }
    });

    return Array.from(sections);
  },

  // NOTA: selectByFrameSections() vive en viewport.js (delega al modal Select
  // by Property estilo ETABS). La versión vieja con Swal que había AQUÍ pisaba
  // a la de viewport por el orden de spread (elevationDrawingMixin va después
  // en cad_sys.js) y dejaba muerto el modal nuevo → eliminada 2026-07-16.

  async deselectByFrameSections() {
    const sections = this.getUsedFrameSections();

    if (!sections.length) {
      this.showMessage?.("No hay secciones de marco disponibles", "warning");
      return;
    }

    const inputOptions = {};

    sections.forEach((section) => {
      inputOptions[section] = section;
    });

    const result = await Swal.fire({
      title: "Deseleccionar por Secciones de Marco",
      input: "select",
      inputOptions,
      inputPlaceholder: "Selecciona una sección",
      showCancelButton: true,
      confirmButtonText: "Deseleccionar",
      cancelButtonText: "Cancelar",
    });

    if (!result.isConfirmed || !result.value) return;

    const selectedSection = result.value;

    const objects = this.getSelectedObjects().filter((frame) => {
      return this.getFrameSectionKey(frame) === selectedSection;
    });

    this.deselectObjects(objects);

    this.showMessage?.(`Sección ${selectedSection}: ${objects.length} elementos deseleccionados`);
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

  deselectByGroups() {
    this.showMessage("👥 Deseleccionar por grupos - Próximamente");
  },

  // deselectByFrameSections() {
  //   this.showMessage("📐 Deseleccionar por secciones de pórtico - Próximamente");
  // },

  deselectAll() {
    this.clearAllSelections();
    this.redraw();
    this.sync3D();
    this.showMessage("❌ Todos los elementos deseleccionados");
  },

  // ======================== FUNCION DE REPORTE ========================

};
