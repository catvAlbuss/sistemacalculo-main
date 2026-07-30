import { Beam, Node as StructuralNode, Shape, Area } from "../model/shapes.js";
import { pointDistance, removeFromArray } from "../lib/utils.js";
import { MOUSE_BUTTONS, isMouseButton } from "../lib/utils.js";

export class StateBase {
  constructor() {}
  handleMouseWheel(event, context, mouse) {}
  handleMouseClick(event, context, mouse) {}
  handleMouseDown(event, context, mouse) {}
  handleMouseMove(event, context, mouse) {}
  handleMouseUp(event, context, mouse) {}
  handleMouseEnter(event, context, mouse) {}
  handleMouseLeave(event, context, mouse) {}
  handleKeyDown(event, context) {
    if (event.key === "Escape") {
      context.setState(context.idleState);
    }
  }
  enter(args) {}
  exit() {}
  draw(renderer, context) {
    renderer.drawState(this, context);
  }
  info() {
    return this.constructor.name;
  }
}

export class PanAndZoomState extends StateBase {
  constructor() {
    super();
    this.isDragging = false;
    this.dragStart = { x: 0, y: 0 };
  }
  handleMouseDown(event, context, mouse) {
    if (isMouseButton(event, MOUSE_BUTTONS.MIDDLE)) {
      this.isDragging = true;
      context.setCursor("grabbing");
      this.dragStart = { x: mouse.x, y: mouse.y };
    }
  }
  handleMouseWheel(event, context, mouse) {
    const { x, y } = mouse;
    if (event.deltaY < 0) {
      context.grid.zoomInToScreenPoint(mouse);
    } else {
      context.grid.zoomOutToScreenPoint(mouse);
    }
  }
  handleMouseMove(event, context, mouse) {
    const { x, y } = mouse;
    if (this.isDragging) {
      context.grid.offestX -= (x - this.dragStart.x) / context.grid.scaleX;
      context.grid.offestY += (y - this.dragStart.y) / context.grid.scaleY;
      this.dragStart = { x: x, y: y };
    } else {
      context.setCursor("crosshair");
    }
  }
  handleMouseUp(event, context, mouse) {
    if (event.button == 1 || 1 == (event.button & 2)) {
      this.isDragging = false;
      context.setCursor("crosshair");
    }
  }
  handleMouseLeave(event, context, mouse) {
    this.isDragging = false;
  }
  exit() {
    this.isDragging = false;
  }
  info() {
    return "Mantén presionado el botón central del ratón para mover la vista y usa la rueda del ratón para hacer zoom.";
  }
}

export class IdleState extends PanAndZoomState {
  handleMouseDown(event, context, mouse) {
    super.handleMouseDown(...arguments);

    if (isMouseButton(event, MOUSE_BUTTONS.MIDDLE)) {
      return;
    }

    if (!context.canSelectInCurrentView()) {
      context.clearAllSelections();
      return;
    }

    // =====================================================
    // IDLE > CTRL + CLIC PARA SELECCIÓN MÚLTIPLE DE BARRAS
    // Clic normal: limpia selección previa.
    // Ctrl + clic: conserva lo ya seleccionado.
    // =====================================================
    const isCtrlFrameSelect = event.ctrlKey === true;

    if (!isCtrlFrameSelect) {
      context.nodes?.forEach((node) => {
        node.selected = false;
        node.isSelected = false;
        node.is3DOnlyEndpointHover = false;

        node.style?.default?.();
      });

      context.shapes?.forEach((shape) => {
        shape.selected = false;
        shape.isSelected = false;
        shape.highlighted3D = false;

        shape.style?.default?.();
      });
    } else {
      // Con Ctrl NO limpiamos las barras seleccionadas.
      context.nodes?.forEach((node) => {
        node.is3DOnlyEndpointHover = false;

        if (!node.selected && !node.isSelected) {
          node.style?.default?.();
        }
      });

      context.shapes?.forEach((shape) => {
        if (!shape.selected && !shape.isSelected && !shape.highlighted3D) {
          shape.style?.default?.();
        }
      });
    }

    // =====================================================
    // IDLE > ALT + CLIC EN EXTREMO DE BARRA 3D-ONLY
    // Selecciona barras inclinadas ocultas en 2D desde sus nodos.
    // La confirmación visual se verá en el canvas 3D.
    // =====================================================
    if (event.altKey) {
      const hit3DOnlyFrame =
        context.closest3DOnlyFrameEndpointAtActiveView?.(mouse);

      console.log("🔎 Alt + clic sobre posible barra 3D-only:", hit3DOnlyFrame);

      if (hit3DOnlyFrame?.frames?.length) {
        const framesToSelect = hit3DOnlyFrame.frames;

        context.clearAllSelections?.();

        // Primero cambiamos al estado de barras seleccionadas
        context.setState(context.selectedBeamsState, {
          selectedBeams: framesToSelect,
          selectedBeam: framesToSelect[0],
        });

        // =====================================================
        // SELECTION 3D > MARCAR BARRAS SELECCIONADAS
        // Se marca después del setState para que no se borre.
        // =====================================================
        framesToSelect.forEach((frame) => {
          frame.selected = true;
          frame.isSelected = true;
          frame.highlighted3D = true;

          if (frame.style?.select) {
            frame.style.select();
          }
        });

        context.selectedBeams = framesToSelect;

        context.showMessage?.(
          framesToSelect.length === 1
            ? "Barra 3D/inclinada seleccionada. Revísala en la vista 3D."
            : `${framesToSelect.length} barras 3D/inclinadas seleccionadas. Revísalas en la vista 3D.`
        );

        console.log("✅ Barra(s) 3D-only marcadas como seleccionadas:", framesToSelect.map((frame) => ({
          id: frame.id,
          selected: frame.selected,
          isSelected: frame.isSelected,
          highlighted3D: frame.highlighted3D,
          is3DOnlyFrame: frame.is3DOnlyFrame,
          isCrossViewFrame: frame.isCrossViewFrame,
        })));

        context.redraw?.();

        // =====================================================
        // 3D > FORZAR ACTUALIZACIÓN VISUAL
        // Asegura que Babylon repinte la barra seleccionada.
        // =====================================================
        if (typeof context.sync3D === "function") {
          context.sync3D();
        }

        if (typeof context.requestSync3D === "function") {
          context.requestSync3D("select3DOnlyFrameFromEndpoint");
        }

        requestAnimationFrame(() => {
          context.sync3D?.();
        });

        return;
      }
    }

    let selectedObject = context.closestNodeAtActiveView(mouse);

    // =====================================================
    // IDLE > CTRL + CLIC EN BARRA
    // Tiene prioridad sobre nodos para poder seleccionar
    // exactamente las barras que el usuario quiere.
    // =====================================================
    if (isCtrlFrameSelect) {
      const ctrlSelectedBeam = context.closestBeamAtActiveView?.(mouse);

      if (ctrlSelectedBeam) {
        context.toggleFrameSelection?.(ctrlSelectedBeam);
        return;
      }
    }

    if (selectedObject) {
      context.setState(context.moveObjectState, {
        selectedObject,
        isMoving: true,
      });
    } else if ((selectedObject = context.closestBeamAtActiveView(mouse))) {
      // Clic normal: selecciona solo esa barra.
      if (typeof context.selectFramesForEdit === "function") {
        context.selectFramesForEdit([selectedObject], {
          reason: "2d single frame selection",
        });
      } else {
        context.setState(context.selectedBeamsState, {
          selectedBeams: [selectedObject],
        });
      }

      return;
    }
    else if ((selectedObject = context.closestParametric(mouse))) {
      context.setState(context.selectedParametricState, {
        selectedParametric: [selectedObject],
      });
    } else if ((selectedObject = context.closestAreaAtActiveView(mouse))) {
      context.setState(context.selectedAreasState, {
        selectedAreas: [selectedObject],
      });
    } else if ((selectedObject = context.closestDimensionLineAtActiveView(mouse))) {
      context.setState(context.selectedDimensionLinesState, {
        selectedDimensionLines: [selectedObject],
      });
    } else {
      context.setState(context.selectionState, {
        selectionStart: context.grid.screenToWorld(mouse),
      });
    }
  }

  handleMouseUp(event, context, mouse) {
    super.handleMouseUp(...arguments);
  }
  // =====================================================
  // Controla el cursor cuando el mouse pasa sobre nodos, barras visibles y objetos paramétricos. Ignora barras 3D-only ocultas en el canvas 2D.
  // =====================================================
  handleMouseMove(event, context, mouse) {
    super.handleMouseMove(...arguments);

    if (this.isDragging) {
      return;
    }

    // =====================================================
    // IDLE > LIMPIAR HOVER DE NODOS
    // Limpia estilos normales y marca especial de nodos 3D-only.
    // =====================================================
    context.nodes?.forEach((n) => {
      n.is3DOnlyEndpointHover = false;

      if (!n?.selected && !n?.isSelected) {
        n.style?.default?.();
      }
    });

    context.shapes?.forEach((s) => {
      if (!s?.selected && !s?.isSelected) {
        s.style?.default?.();
      }
    });

    let collidedParametric = false;

    // =====================================================
    // IDLE > DETECTAR NODO EN VISTA ACTIVA
    // Si el nodo tiene barras 3D-only conectadas,
    // muestra ayuda visual para usar Alt + clic.
    // =====================================================
    const hoveredNode = context.closestNodeAtActiveView?.(mouse);

    if (hoveredNode) {
      hoveredNode.style?.hover?.();

      const connected3DOnlyFrames =
        context.get3DOnlyFramesConnectedToNode?.(hoveredNode) || [];

      const has3DOnlyFrames = connected3DOnlyFrames.length > 0;

      // =====================================================
      // IDLE > AYUDA PARA NODO CON BARRA 3D-ONLY
      // Marca el nodo y muestra una guía sin repetir mensajes.
      // =====================================================
      if (has3DOnlyFrames) {
        hoveredNode.is3DOnlyEndpointHover = true;

        context.hovered3DOnlyEndpointNode = hoveredNode;
        context.hovered3DOnlyEndpointFrames = connected3DOnlyFrames;

        const helpKey = `${hoveredNode.id}:${connected3DOnlyFrames
          .map((frame) => frame.id)
          .join("-")}`;

        if (context.last3DOnlyEndpointHelpKey !== helpKey) {
          context.last3DOnlyEndpointHelpKey = helpKey;

          context.showMessage?.(
            "Nodo con barra 3D/inclinada conectada. Usa Alt + clic para seleccionar la barra."
          );
        }
      } else {
        hoveredNode.is3DOnlyEndpointHover = false;
        context.hovered3DOnlyEndpointNode = null;
        context.hovered3DOnlyEndpointFrames = [];
        context.last3DOnlyEndpointHelpKey = null;
      }

      context.setCursor("grab");
      context.redraw?.();
      return;
    }

    // =====================================================
    // IDLE > DETECTAR BARRA EN VISTA ACTIVA
    // Usa closestBeamAtActiveView(), que ya debe ignorar
    // barras 3D-only ocultas en 2D.
    // =====================================================
    const hoveredBeam = context.closestBeamAtActiveView?.(mouse);

    if (
      hoveredBeam &&
      typeof context.shouldSelectFrameIn2D === "function" &&
      !context.shouldSelectFrameIn2D(hoveredBeam)
    ) {
      context.setCursor("crosshair");
      return;
    }

    if (hoveredBeam) {
      hoveredBeam.style?.hover?.();
      context.setCursor("pointer");
      return;
    }

    // =====================================================
    // IDLE > OBJETOS PARAMÉTRICOS
    // =====================================================
    context.parametricModels?.find((p) => {
      let hit = false;

      p.nodes?.find((n) => {
        const sp = context._projectPosToActiveView?.(n.position);
        if (sp && pointDistance(mouse, sp) <= 10) hit = true;
        return hit;
      });

      if (!hit) {
        p.shapes?.find((s) => {
          if (!s?.node1?.position || !s?.node2?.position) return false;
          const sp1 = context._projectPosToActiveView?.(s.node1.position);
          const sp2 = context._projectPosToActiveView?.(s.node2.position);
          if (!sp1 || !sp2) return false;
          const lineLength = pointDistance(sp1, sp2);
          const d1 = pointDistance(sp1, mouse);
          const d2 = pointDistance(sp2, mouse);
          if (d1 + d2 >= lineLength - 5 && d1 + d2 <= lineLength + 5) hit = true;
          return hit;
        });
      }

      if (hit) {
        collidedParametric = true;
        p.hover?.();
      } else {
        p.default?.();
      }

      return hit;
    });

    if (collidedParametric) {
      context.setCursor("pointer");
    } else {
      context.setCursor("crosshair");
    }
  }

  // =====================================================
  // Dibuja un aro sobre el nodo extremo y un texto corto.
  // =====================================================
  draw(renderer, context) {
    const node = context.hovered3DOnlyEndpointNode;

    if (!node?.position || !context.ctx) return;

    const frames = context.hovered3DOnlyEndpointFrames || [];

    if (!frames.length) return;

    const screenPoint =
      context.projectNodeInActiveView?.(node) ||
      context.grid.worldToScreen({
        x: node.position.x || 0,
        y: node.position.y || 0,
      });

    if (!screenPoint) return;

    const ctx = context.ctx;

    ctx.save();

    // Aro sobre el nodo
    ctx.strokeStyle = "#facc15";
    ctx.lineWidth = 2;
    ctx.setLineDash([5, 4]);

    ctx.beginPath();
    ctx.arc(screenPoint.x, screenPoint.y, 13, 0, Math.PI * 2);
    ctx.stroke();

    ctx.setLineDash([]);

    // Punto central reforzado
    ctx.fillStyle = "#facc15";
    ctx.beginPath();
    ctx.arc(screenPoint.x, screenPoint.y, 4, 0, Math.PI * 2);
    ctx.fill();

    // Texto de ayuda
    ctx.font = "bold 12px monospace";
    ctx.fillStyle = "#facc15";
    ctx.fillText(
      "Alt + clic: seleccionar barra 3D",
      screenPoint.x + 16,
      screenPoint.y - 12
    );

    ctx.restore();
  }
}

export class SelectedObjectsState extends PanAndZoomState {
  constructor() {
    super();
    this.selectedObjects = [];
  }

  handleMouseDown(event, context, mouse) {
    if (!context.canSelectInCurrentView()) {
      context.clearAllSelections();
      context.setState(context.idleState);
      return;
    }

    super.handleMouseDown(...arguments);

    if (!isMouseButton(event, MOUSE_BUTTONS.MIDDLE)) {
      // =====================================================
      // Permite seleccionar barras inclinadas desde sus nodos extremos
      // sin mostrar la barra en el canvas 2D.
      // =====================================================
      if (event.altKey) {
        const hit3DOnlyFrame =
          context.closest3DOnlyFrameEndpointAtActiveView?.(mouse);

        if (hit3DOnlyFrame?.frames?.length) {
          // =====================================================
          // SELECTION 2D > SELECCIONAR BARRA 3D-ONLY DESDE EXTREMO
          // Marca las barras inclinadas conectadas al nodo extremo.
          // La barra sigue oculta en 2D, pero podrá resaltarse en 3D.
          // =====================================================
          context.clearAllSelections?.();

          hit3DOnlyFrame.frames.forEach((frame) => {
            frame.selected = true;
            frame.isSelected = true;
            frame.highlighted3D = true;
          });

          context.selectedBeams = hit3DOnlyFrame.frames;

          context.setState(context.selectedBeamsState, {
            selectedBeams: hit3DOnlyFrame.frames,
          });

          context.showMessage?.(
            hit3DOnlyFrame.frames.length === 1
              ? "Barra 3D/inclinada seleccionada. Revísala en la vista 3D."
              : `${hit3DOnlyFrame.frames.length} barras 3D/inclinadas seleccionadas. Revísalas en la vista 3D.`
          );

          context.redraw?.();

          if (typeof context.requestSync3D === "function") {
            context.requestSync3D("select3DOnlyFrameFromEndpoint");
          } else {
            context.sync3D?.();
          }

          return;

          context.showMessage?.(
            hit3DOnlyFrame.frames.length === 1
              ? "Barra 3D/inclinada seleccionada desde su nodo extremo."
              : `${hit3DOnlyFrame.frames.length} barras 3D/inclinadas seleccionadas desde el nodo extremo.`
          );

          return;
        }
      }

      let selectedObject = context.closestNodeAtActiveView(mouse);

      if (selectedObject) {
        // Si el nodo clickeado está marcado como seleccionado y hay más de uno, mover el grupo
        const clickedIsSelected = selectedObject.selected === true || selectedObject.isSelected === true;
        const selectedNodes = clickedIsSelected
          ? (context.nodes || []).filter((n) => n.selected === true || n.isSelected === true)
          : [];

        if (clickedIsSelected && selectedNodes.length > 1 && context.moveGroupState) {
          context.setState(context.moveGroupState, {
            nodes: selectedNodes,
            startWorld: { ...context.mousePos },
          });
          return;
        }

        context.setState(context.moveObjectState, {
          selectedObject: selectedObject,
          isMoving: true,
        });
      } else if ((selectedObject = context.closestBeamAtActiveView(mouse))) {
        context.setState(context.selectedBeamsState, {
          selectedBeams: [selectedObject],
        });
      } else if ((selectedObject = context.closestAreaAtActiveView(mouse))) {
        context.setState(context.selectedAreasState, {
          selectedAreas: [selectedObject],
        });
      } else if ((selectedObject = context.closestDimensionLineAtActiveView(mouse))) {
        context.setState(context.selectedDimensionLinesState, {
          selectedDimensionLines: [selectedObject],
        });
      } else {
        context.setState(context.selectionState, {
          selectionStart: context.grid.screenToWorld(mouse),
        });
      }
    }
  }

  // Marca los objetos como seleccionados visual e internamente.
  enter(args) {
    this.selectedObjects = args.selectedObjects || [];

    this.selectedObjects.forEach((obj) => {
      obj.selected = true;
      obj.isSelected = true;

      if (obj.style?.selected) {
        obj.style.selected();
      }
    });
  }

  // Limpia selección visual e interna.
  exit() {
    super.exit();

    this.selectedObjects.forEach((obj) => {
      obj.selected = false;
      obj.isSelected = false;

      if (obj.style?.default) {
        obj.style.default();
      }
    });

    this.selectedObjects = [];
  }

  info() {
    return 'Edita sus propiedades desde el menú o presiona "Supr" para eliminar.';
  }
}

export class SelectedBeamsState extends SelectedObjectsState {
  handleKeyDown(event, context) {
    // =====================================================
    // SELECTION > ESC PARA DESELECCIONAR BARRAS
    // Limpia barras seleccionadas, incluyendo barras 3D-only.
    // =====================================================
    if (event.key === "Escape") {
      context.clearAllSelections?.();
      context.setState(context.idleState);

      event.preventDefault();
      return;
    }

    super.handleKeyDown(...arguments);

    if (event.key === "Delete") {
      event.preventDefault();
      context.deleteSelected?.();
      return;
    }
  }

  enter(args) {
    super.enter({ selectedObjects: args.selectedBeams });
  }
}

export class SelectedAreasState extends PanAndZoomState {
  constructor() {
    super();
    this.selectedObjects = [];
  }

  enter(args = {}) {
    this.selectedObjects = args.selectedAreas || [];
    this.selectedObjects.forEach((area) => {
      area.selected = true;
    });
  }

  exit() {
    super.exit();
    this.selectedObjects.forEach((area) => {
      area.selected = false;
    });
  }

  handleMouseDown(event, context, mouse) {
    super.handleMouseDown(...arguments);

    if (isMouseButton(event, MOUSE_BUTTONS.MIDDLE)) {
      return;
    }

    const selectedArea = context.closestAreaAtActiveView(mouse);

    if (selectedArea) {
      context.setState(context.selectedAreasState, {
        selectedAreas: [selectedArea],
      });
    } else {
      context.setState(context.idleState);
    }
  }

  handleKeyDown(event, context) {
    super.handleKeyDown(...arguments);

    if (event.key === "Delete") {
      event.preventDefault();
      context.deleteSelected?.();
      return;
    }
  }

  info() {
    return 'Área seleccionada. Presiona "Supr" para eliminar.';
  }
}

export class SelectedDimensionLinesState extends PanAndZoomState {
  constructor() {
    super();
    this.selectedObjects = [];
  }

  enter(args) {
    this.selectedObjects = args.selectedDimensionLines || [];
    this.selectedObjects.forEach((dim) => {
      dim.selected = true;
    });
  }

  exit() {
    super.exit();
    this.selectedObjects.forEach((dim) => {
      dim.selected = false;
    });
  }

  handleMouseDown(event, context, mouse) {
    super.handleMouseDown(...arguments);

    if (isMouseButton(event, MOUSE_BUTTONS.MIDDLE)) {
      return;
    }

    let selectedObject = context.closestDimensionLineAtActiveView(mouse);

    if (selectedObject) {
      context.setState(context.selectedDimensionLinesState, {
        selectedDimensionLines: [selectedObject],
      });
    } else {
      context.setState(context.idleState);
    }
  }

  handleKeyDown(event, context) {
    super.handleKeyDown(...arguments);

    if (event.key === "Delete") {
      event.preventDefault();
      context.deleteSelected?.();
      return;
    }
  }

  info() {
    return 'Línea de dimensión seleccionada. Presiona "Supr" para eliminar.';
  }
}

export class ReshapeObjectState extends PanAndZoomState {
  constructor() {
    super();
    this.selectedBeam = null;
    this.selectedArea = null;

    this.selectedNode = null; // para barras
    this.selectedVertexIndex = null; // para áreas

    this.isMoving = false;
  }

  enter(args = {}) {
    this.selectedBeam = args.selectedBeam || null;
    this.selectedArea = args.selectedArea || null;

    this.selectedNode = null;
    this.selectedVertexIndex = null;
    this.isMoving = false;

    if (this.selectedBeam) {
      this.selectedBeam.selected = true;

      if (this.selectedBeam.style?.selected) {
        this.selectedBeam.style.selected();
      }
    }

    if (this.selectedArea) {
      this.selectedArea.selected = true;
    }
  }

  exit() {
    super.exit();

    if (this.selectedBeam) {
      this.selectedBeam.selected = false;

      if (this.selectedBeam.style?.default) {
        this.selectedBeam.style.default();
      }
    }

    if (this.selectedNode?.style) {
      this.selectedNode.style.default();
    }

    if (this.selectedArea) {
      this.selectedArea.selected = false;
    }

    this.selectedBeam = null;
    this.selectedArea = null;
    this.selectedNode = null;
    this.selectedVertexIndex = null;
    this.isMoving = false;
  }

  handleMouseDown(event, context, mouse) {
    if (isMouseButton(event, MOUSE_BUTTONS.MIDDLE)) {
      super.handleMouseDown(event, context, mouse);
      return;
    }

    super.handleMouseDown(...arguments);

    if (!context.canSelectInCurrentView()) {
      context.clearAllSelections();
      context.setState(context.idleState);
      return;
    }

    // =========================================
    // 1. Si no hay nada seleccionado, elegir objeto
    // =========================================
    if (!this.selectedBeam && !this.selectedArea) {
      const area = context.closestAreaAtActiveView(mouse);
      if (area) {
        context.setState(context.reshapeObjectState, { selectedArea: area });
        return;
      }

      const beam = context.closestBeamAtActiveView(mouse);
      if (beam) {
        context.setState(context.reshapeObjectState, { selectedBeam: beam });
        return;
      }

      context.setState(context.idleState);
      return;
    }

    // =========================================
    // 2. Si hay un área seleccionada, buscar vértice
    // =========================================
    if (this.selectedArea) {
      const handle = context.closestAreaVertexAtActiveView(mouse, this.selectedArea);

      if (handle) {
        this.selectedVertexIndex = handle.index;
        this.isMoving = true;
        context.setCursor("grabbing");
        return;
      }

      // Si no tocó vértice, intentar cambiar de área
      const anotherArea = context.closestAreaAtActiveView(mouse);
      if (anotherArea && anotherArea !== this.selectedArea) {
        context.setState(context.reshapeObjectState, { selectedArea: anotherArea });
        return;
      }

      // Si tocó una barra en vez de área, cambiar
      const beam = context.closestBeamAtActiveView(mouse);
      if (beam) {
        context.setState(context.reshapeObjectState, { selectedBeam: beam });
        return;
      }

      context.setState(context.idleState);
      return;
    }

    // =========================================
    // 3. Si hay una barra seleccionada, buscar extremo
    // =========================================
    if (this.selectedBeam) {
      const handle = context.closestBeamEndpointAtActiveView(mouse, this.selectedBeam);

      if (handle) {
        this.selectedNode = handle.node;
        this.isMoving = true;

        if (this.selectedNode?.style) {
          this.selectedNode.style.selected();
        }

        context.setCursor("grabbing");
        return;
      }

      // intentar cambiar de barra
      const anotherBeam = context.closestBeamAtActiveView(mouse);
      if (anotherBeam && anotherBeam !== this.selectedBeam) {
        context.setState(context.reshapeObjectState, { selectedBeam: anotherBeam });
        return;
      }

      // intentar cambiar a área
      const area = context.closestAreaAtActiveView(mouse);
      if (area) {
        context.setState(context.reshapeObjectState, { selectedArea: area });
        return;
      }

      context.setState(context.idleState);
    }
  }

  handleMouseMove(event, context, mouse) {
    PanAndZoomState.prototype.handleMouseMove.call(this, ...arguments);

    if (!this.isMoving) return;

    const worldPos = context.grid.screenToWorld(mouse);
    const snapPoint = context.getCurrentSnapPoint(worldPos);

    // =========================================
    // Mover extremo de barra
    // =========================================
    if (this.selectedNode) {
      this.selectedNode.position.x = snapPoint.x;
      this.selectedNode.position.y = snapPoint.y;
      this.selectedNode.position.z = snapPoint.z;

      context.redraw();
      return;
    }

    // =========================================
    // Mover vértice de área
    // =========================================
    if (
      this.selectedArea &&
      this.selectedVertexIndex !== null &&
      this.selectedArea.points?.[this.selectedVertexIndex]
    ) {
      const pt = this.selectedArea.points[this.selectedVertexIndex];
      pt.x = snapPoint.x;
      pt.y = snapPoint.y;
      pt.z = snapPoint.z;

      context.redraw();
    }
  }

  handleMouseUp(event, context, mouse) {
    super.handleMouseUp(...arguments);

    if (this.isMoving) {
      this.isMoving = false;

      if (this.selectedNode?.style) {
        this.selectedNode.style.default();
      }

      this.selectedNode = null;
      this.selectedVertexIndex = null;

      context.setCursor("default");
      context.sync3D?.();
    }
  }

  handleKeyDown(event, context) {
    if (event.key === "Escape") {
      context.setState(context.idleState);
      return;
    }

    if (event.key === "Delete") {
      event.preventDefault();
      context.deleteSelected?.();
      return;
    }
  }

  draw(renderer, context) {
    renderer.drawReshapeObjectState?.(this, context);
  }

  info() {
    if (!this.selectedBeam && !this.selectedArea) {
      return "Haz clic en una barra o área para modificarla.";
    }

    if (this.isMoving && this.selectedBeam) {
      return "Arrastra el extremo seleccionado de la barra. Usa Esc para salir.";
    }

    if (this.isMoving && this.selectedArea) {
      return "Arrastra el vértice seleccionado del área. Usa Esc para salir.";
    }

    if (this.selectedBeam) {
      return 'Haz clic en uno de los extremos de la barra para moverlo. "Supr" para eliminar.';
    }

    if (this.selectedArea) {
      return 'Haz clic en uno de los vértices del área para moverlo. "Supr" para eliminar.';
    }

    return "Modo modificar objeto.";
  }
}

export class SelectedParametricState extends SelectedObjectsState {
  constructor() {
    super();
    this.currentLoad = "CM";
  }
  handleKeyDown(event, context) {
    super.handleKeyDown(...arguments);
    if (event.key === "Delete") {
      this.selectedObjects.forEach((deleteShape) => {
        removeFromArray(context.parametricModels, deleteShape);
      });
      context.setState(context.idleState);
    }
  }
  enter(args) {
    super.enter({ selectedObjects: args.selectedParametric });
  }
}

export class EditParametricState extends PanAndZoomState {
  constructor() {
    super();
    this.editingParametric = null;
    this.editing = null;
  }
  handleKeyDown(event, context) {
    if (event.key === "Escape") {
      context.setState(context.selectedParametricState, { selectedParametric: [this.editingParametric] });
    }
  }
  handleMouseDown(event, context, mouse) {
    super.handleMouseDown(...arguments);
    if (isMouseButton(event, MOUSE_BUTTONS.MIDDLE)) {
      return;
    }
    if (this.editing) {
      this.editing.forEach((beam) => {
        beam.style.default();
      });
    }
    this.editing = this.editingParametric.connections.find((beams) => {
      return beams.find((s) => {
        const shortestDistance = 5;
        const lineLength = pointDistance(
          context.grid.worldToScreen(s.node1.position),
          context.grid.worldToScreen(s.node2.position),
        );
        const d1 = pointDistance(context.grid.worldToScreen(s.node1.position), mouse);
        const d2 = pointDistance(context.grid.worldToScreen(s.node2.position), mouse);
        return d1 + d2 >= lineLength - shortestDistance && d1 + d2 <= lineLength + shortestDistance;
      });
    });
    if (this.editing) {
      this.editing.forEach((beam) => {
        beam.style.selected();
      });
    }
  }
  handleMouseMove(event, context, mouse) {
    super.handleMouseMove(...arguments);
    if (!this.editing) {
      this.editingParametric.connections.forEach((beams) => {
        let collided = false;
        beams.find((s) => {
          const shortestDistance = 5;
          const lineLength = pointDistance(
            context.grid.worldToScreen(s.node1.position),
            context.grid.worldToScreen(s.node2.position),
          );
          const d1 = pointDistance(context.grid.worldToScreen(s.node1.position), mouse);
          const d2 = pointDistance(context.grid.worldToScreen(s.node2.position), mouse);
          if (d1 + d2 >= lineLength - shortestDistance && d1 + d2 <= lineLength + shortestDistance) {
            collided = true;
          }
          return collided;
        });
        if (collided) {
          beams.forEach((b) => {
            b.style.hover();
          });
        } else {
          beams.forEach((b) => {
            b.style.default();
          });
        }
      });
    }
  }
  enter(args) {
    super.enter(args);
    this.editingParametric = args.editingParametric;
  }
  exit() {
    this.editingParametric = null;
    this.editing = null;
  }
  info() {
    return "Edita los materiales de las secciones.";
  }
}

export class SelectedNodesState extends SelectedObjectsState {
  handleKeyDown(event, context) {
    super.handleKeyDown(...arguments);

    if (event.key === "Delete") {
      event.preventDefault();
      context.deleteSelected?.();
      return;
    }
  }

  enter(args) {
    super.enter({ selectedObjects: args.selectedNodes });
  }
}

export class SelectionState extends PanAndZoomState {

  constructor() {
    super();
    this.selectionStart = { x: 0, y: 0 };
    this.selectionEnd = { x: 0, y: 0 };
    this.selectedNodes = [];
    this.selectedBeams = [];
  }

  handleMouseUp(event, context, mouse) {
    super.handleMouseUp(...arguments);
    this.selectionEnd = mouse;
    if (this.selectedNodes.length === 1) {
      context.setState(context.moveObjectState, { selectedObject: this.selectedNodes[0], isMoving: false });
    } else if (this.selectedNodes.length > 1) {
      context.setState(context.selectedNodesState, { selectedNodes: this.selectedNodes });
    } else if (this.selectedBeams.length >= 1) {
      context.setState(context.selectedBeamsState, { selectedBeams: this.selectedBeams });
    } else {
      context.setState(context.idleState);
    }
  }

  handleMouseMove(event, context, mouse) {
    const pointRect = (point, startRect, endRect) => {
      return point.x >= startRect.x && point.x <= endRect.x && point.y >= startRect.y && point.y <= endRect.y;
    };
    super.handleMouseMove(...arguments);
    this.selectionEnd = context.grid.screenToWorld(mouse);
    let start = context.grid.worldToScreen(this.selectionStart);
    let end = mouse;
    const selectBeams = start.x > mouse.x || start.y > mouse.y;
    if (selectBeams) {
      [start, end] = [end, start];

      this.selectedBeams = context.shapes.filter((b) => {
        if (!context.currentRenderer.shouldDrawBeam(b, context)) return false;

        const p1 = context._projectPosToActiveView?.(b.node1.position);
        const p2 = context._projectPosToActiveView?.(b.node2.position);
        if (!p1 || !p2) return false;
        const collided = pointRect(p1, start, end) && pointRect(p2, start, end);

        if (collided) b.style.hover();
        else b.style.default();

        return collided;
      });
    } else {
      this.selectedNodes = context.nodes.filter((n) => {
        if (!context.currentRenderer.shouldDrawNode(n, context)) return false;

        const position = context._projectPosToActiveView?.(n.position);
        if (!position) return false;
        const collided = pointRect(position, start, end);

        if (collided) n.style.hover();
        else n.style.default();

        return collided;
      });
    }
  }

  enter(args) {
    this.selectionStart = this.selectionEnd = args.selectionStart;
  }

  exit() {
    super.exit();
    this.selectedNodes = [];
    this.selectedBeams = [];
  }

  draw(renderer, context) {
    renderer.drawSelectionState(this, context);
  }

  info() {
    return "Suelta el botón del ratón para completar la selección.";
  }
}

export class RubberBandZoomState extends PanAndZoomState {

  constructor() {
    super();

    this.isRubberDragging = false;
    this.startScreen = null;
    this.endScreen = null;
    this.dragThreshold = 10;
  }

  enter() {
    this.isRubberDragging = false;
    this.startScreen = null;
    this.endScreen = null;
  }

  handleMouseDown(event, context, mouse) {
    if (isMouseButton(event, MOUSE_BUTTONS.MIDDLE)) {
      super.handleMouseDown(event, context, mouse);
      return;
    }

    if (!isMouseButton(event, MOUSE_BUTTONS.LEFT)) {
      return;
    }

    this.isRubberDragging = true;

    this.startScreen = {
      x: mouse.x,
      y: mouse.y,
    };

    this.endScreen = {
      x: mouse.x,
      y: mouse.y,
    };

    context.setCursor?.("crosshair");
    context.redraw?.();
  }

  handleMouseMove(event, context, mouse) {
    if (this.isDragging) {
      super.handleMouseMove(event, context, mouse);
      return;
    }

    if (!this.isRubberDragging) {
      context.setCursor?.("crosshair");
      return;
    }

    this.endScreen = {
      x: mouse.x,
      y: mouse.y,
    };

    context.redraw?.();
  }

  handleMouseUp(event, context, mouse) {
    if (isMouseButton(event, MOUSE_BUTTONS.MIDDLE)) {
      super.handleMouseUp(event, context, mouse);
      return;
    }

    if (!this.isRubberDragging) {
      return;
    }

    this.endScreen = {
      x: mouse.x,
      y: mouse.y,
    };

    const dx = this.endScreen.x - this.startScreen.x;
    const dy = this.endScreen.y - this.startScreen.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance < this.dragThreshold) {
      this.cancel(context);
      context.showMessage?.("El recuadro de zoom es demasiado pequeño.", "warning");
      return;
    }

    if (!context.grid?.zoomToScreenRect) {
      this.cancel(context);
      context.showMessage?.("Falta zoomToScreenRect() en grid.js", "warning");
      return;
    }

    context.saveZoomState?.();

    context.grid.zoomToScreenRect(
      this.startScreen,
      this.endScreen,
      40
    );

    this.isRubberDragging = false;
    this.startScreen = null;
    this.endScreen = null;

    context.setState(context.idleState);
    context.redraw?.();

    context.showMessage?.("🔍 Zoom con recuadro aplicado");
  }

  handleKeyDown(event, context) {
    if (event.key === "Escape") {
      this.cancel(context);
      context.setState(context.idleState);
      context.showMessage?.("Rubber Band Zoom cancelado");
      return;
    }

    super.handleKeyDown(event, context);
  }

  handleMouseLeave(event, context, mouse) {
    super.handleMouseLeave(event, context, mouse);
    this.cancel(context);
  }

  cancel(context) {
    this.isRubberDragging = false;
    this.startScreen = null;
    this.endScreen = null;
    context.redraw?.();
  }

  getScreenRect() {
    if (!this.startScreen || !this.endScreen) return null;

    return {
      left: Math.min(this.startScreen.x, this.endScreen.x),
      top: Math.min(this.startScreen.y, this.endScreen.y),
      width: Math.abs(this.endScreen.x - this.startScreen.x),
      height: Math.abs(this.endScreen.y - this.startScreen.y),
    };
  }

  draw(renderer, context) {
    renderer.drawRubberBandZoomState?.(this, context);
  }

  info() {
    return "Rubber Band Zoom: arrastra un recuadro con clic izquierdo. Esc para cancelar.";
  }
}

export class MoveObjectState extends IdleState {
  constructor() {
    super();
    this.selectedObject = null;
    this.isMoving = false;
    this.currentLoad = "CM";
  }

  get nodeX() {
    return this.selectedObject?.force?.loads?.[this.currentLoad]?.x ?? 0;
  }

  set nodeX(x) {
    return (this.selectedObject.force.loads[this.currentLoad].x = x);
  }

  get nodeY() {
    return this.selectedObject?.force?.loads?.[this.currentLoad]?.y ?? 0;
  }

  set nodeY(y) {
    return (this.selectedObject.force.loads[this.currentLoad].y = y);
  }

  // ========== NUEVO: getter y setter para Fz ==========
  get nodeZ() {
    return this.selectedObject?.force?.loads?.[this.currentLoad]?.z ?? 0;
  }

  set nodeZ(z) {
    if (this.selectedObject?.force?.loads?.[this.currentLoad]) {
      this.selectedObject.force.loads[this.currentLoad].z = z;
    }
  }
  // ====================================================

  handleKeyDown(event, context) {
    super.handleKeyDown(...arguments);
    if (event.key === "Delete") {
      event.preventDefault();

      if (this.selectedObject) {
        this.selectedObject.selected = true;
        this.selectedObject.isSelected = true;
      }

      context.deleteSelected?.();
      return;
    }
  }

  handleMouseDown(event, context, mouse) {
    if (!context.canSelectInCurrentView()) {
      context.clearAllSelections();
      context.setState(context.idleState);
      return;
    }

    PanAndZoomState.prototype.handleMouseDown.call(this, ...arguments);

    if (isMouseButton(event, MOUSE_BUTTONS.MIDDLE)) {
      return;
    }

    this.isMoving = !this.isMoving;

    const selected = context.closestNodeAtActiveView(mouse);
    if ((selected && this.selectedObject !== selected) || !selected) {
      super.handleMouseDown(...arguments);
    }
  }

  handleMouseUp(event, context, mouse) {
    super.handleMouseUp(...arguments);
    this.isMoving = false;
  }

  handleMouseMove(event, context, mouse) {
    PanAndZoomState.prototype.handleMouseMove.call(this, ...arguments);
    if (!this.isMoving) {
      return;
    }

    context.setCursor("grabbing");

    if (context.selectedObject instanceof Shape) {
      context.selectedObject.calcularPropiedades();
      const { XC: xc, YC: yc } = context.selectedObject.propiedades();
      const dX = context.mousePos.x - xc;
      const dY = context.mousePos.y - yc;
      this.selectedObject.points.forEach((point) => {
        point.x += dX;
        point.y += dY;
      });
      return;
    }

    const view = context.viewSet?.[context.activeViewIndex];

    if (view?.type === "elevation" && view.axis === "X") {
      // LETRAS => X fija => plano Y-Z
      this.selectedObject.position.x = view.value ?? this.selectedObject.position.x;
      this.selectedObject.position.y = context.mousePos.x;
      this.selectedObject.position.z = context.mousePos.y;
    } else if (view?.type === "elevation" && view.axis === "Y") {
      // NÚMEROS => Y fija => plano X-Z
      this.selectedObject.position.x = context.mousePos.x;
      this.selectedObject.position.y = view.value ?? this.selectedObject.position.y;
      this.selectedObject.position.z = context.mousePos.y;
    } else {
      // PLANTA
      this.selectedObject.position.x = context.mousePos.x;
      this.selectedObject.position.y = context.mousePos.y;
    }
  }

  enter(args) {
    this.selectedObject = args.selectedObject;

    if (this.selectedObject) {
      this.selectedObject.selected = true;

      if (this.selectedObject.style?.selected) {
        this.selectedObject.style.selected();
      }
    }

    this.isMoving = args.isMoving ?? true;
  }

  exit() {
    super.exit();

    if (this.selectedObject) {
      this.selectedObject.selected = false;

      if (this.selectedObject.style?.default) {
        this.selectedObject.style.default();
      }
    }

    this.isMoving = false;
  }

  info() {
    return 'Edita sus propiedades desde el menú o presiona "Supr" para eliminar.';
  }
}

export class MoveGroupState extends PanAndZoomState {
  constructor() {
    super();
    this.nodes = [];
    this.nodeStartPositions = [];
    this.startWorld = null;
  }

  enter(args) {
    this.nodes = args.nodes || [];
    this.startWorld = { ...(args.startWorld || { x: 0, y: 0 }) };
    this.nodeStartPositions = this.nodes.map((n) => ({
      x: n.position.x || 0,
      y: n.position.y || 0,
      z: n.position.z || 0,
    }));
    this.nodes.forEach((n) => n.style?.selected?.());
  }

  handleMouseMove(event, context, mouse) {
    PanAndZoomState.prototype.handleMouseMove.call(this, ...arguments);

    const cur = context.mousePos;
    if (!cur || !this.startWorld) return;

    const view = context.viewSet?.[context.activeViewIndex];
    let dx = 0, dy = 0, dz = 0;

    if (!view || view.type === "plan") {
      dx = cur.x - this.startWorld.x;
      dy = cur.y - this.startWorld.y;
    } else if (view.type === "elevation" && view.axis === "X") {
      // Plano Y-Z: mousePos.x = world Y (horizontal), mousePos.y = world Z (vertical)
      dy = cur.x - this.startWorld.x;
      dz = cur.y - this.startWorld.y;
    } else if (view.type === "elevation" && view.axis === "Y") {
      // Plano X-Z: mousePos.x = world X (horizontal), mousePos.y = world Z (vertical)
      dx = cur.x - this.startWorld.x;
      dz = cur.y - this.startWorld.y;
    }

    this.nodes.forEach((node, i) => {
      const s = this.nodeStartPositions[i];
      node.position.x = s.x + dx;
      node.position.y = s.y + dy;
      node.position.z = s.z + dz;
    });

    context.setCursor("grabbing");
    context.redraw?.();
  }

  handleMouseUp(event, context, mouse) {
    super.handleMouseUp(...arguments);
    context.markAnalysisResultsOutdated?.("Mover grupo");
    context.sync3D?.();
    context.setState(context.selectedNodesState, { selectedNodes: this.nodes });
  }

  exit() {
    super.exit();
    this.nodes.forEach((n) => n.style?.selected?.());
  }

  info() {
    return `Moviendo ${this.nodes.length} nodo(s). Suelta el ratón para confirmar.`;
  }
}

export class TrussDrawingState extends PanAndZoomState {
  constructor(context, elementType = "beam") {
    super();
    this.context = context;
    this.elementType = elementType;
    this.shape = this.createEmptyShape(context);

    // ========== NUEVAS PROPIEDADES PARA DIBUJO POR LONGITUD ==========
    this.inputMode = false; // Modo de entrada de longitud
    this.inputBuffer = ""; // Buffer de texto para la longitud
    this.inputStartPoint = null; // Punto de inicio para modo entrada
    // ================================================================

    // Permite mantener el primer punto cuando se pasa de planta a otra planta o a una elevación.
    // =====================================================
    this.preserveOnViewChange = true;
    this.isFrameDrawingState = true;

    // Guarda desde qué planta/elevación empezó la barra. Sirve para detectar barras creadas entre diferentes vistas.
    // =====================================================
    this.startViewSignature = null;
  }

  createEmptyShape(context) {
    const shape = new Beam(context.globalE, context.globalA);
    shape.elementType = this.elementType;
    shape.type = this.elementType;
    shape.objectType = "frame";
    shape.visible = true;
    return shape;
  }

  getDrawingPoint(context, mouse) {
    const worldPos = context.grid.screenToWorld(mouse);
    const view = context.viewSet?.[context.activeViewIndex];

    // Recalcular snap con el mouse actual
    if (context.snap_enabled !== false) {
      if (!view || view.type === "plan" || context.currentViewMode === "plan") {
        context.updatePlanGridSnap?.(worldPos, mouse);
      } else if (view.type === "elevation") {
        context.updateElevationGridSnap?.(worldPos, mouse);
      }
    }

    // Primero usar activeGridPoint ya recalculado
    if (context.activeGridPoint) {
      return {
        x: Number(context.activeGridPoint.x || 0),
        y: Number(context.activeGridPoint.y || 0),
        z: Number(context.activeGridPoint.z || 0),
      };
    }

    // Elevación por letras: X fija, plano Y-Z
    if (view?.type === "elevation" && view.axis === "X") {
      return {
        x: Number(context.getFixedCoordinateForActiveElevation?.() ?? view.value ?? 0),
        y: Number(worldPos.x || 0),
        z: Number(worldPos.y || 0),
      };
    }

    // Elevación por números: Y fija, plano X-Z
    if (view?.type === "elevation" && view.axis === "Y") {
      return {
        x: Number(worldPos.x || 0),
        y: Number(context.getFixedCoordinateForActiveElevation?.() ?? view.value ?? 0),
        z: Number(worldPos.y || 0),
      };
    }

    // Planta
    return {
      x: Number(worldPos.x || 0),
      y: Number(worldPos.y || 0),
      z: Number(context.getActivePlanElevation?.() ?? context.currentZ ?? 0),
    };
  }

  getOrCreateNode(context, point) {
    const view = context.viewSet?.[context.activeViewIndex];

    // Tolerancias más estrictas para elevaciones
    let toleranceXY = 0.1;
    let toleranceZ = 0.1;

    // En vistas de elevación, usar tolerancias más estrictas
    if (view?.type === "elevation") {
      toleranceXY = 0.05;
      toleranceZ = 0.05;
    }

    let node = context.nodes.find((n) => {
      const p = n.position || n;

      // En vistas de elevación, verificar que el nodo pertenezca a la vista
      if (view?.type === "elevation" && view.axis === "X") {
        const fixedX = Number(view.value || 0);
        if (Math.abs((p.x || 0) - fixedX) > toleranceXY) return false;
      }

      if (view?.type === "elevation" && view.axis === "Y") {
        const fixedY = Number(view.value || 0);
        if (Math.abs((p.y || 0) - fixedY) > toleranceXY) return false;
      }

      return (
        Math.abs(Number(p.x || 0) - Number(point.x || 0)) <= toleranceXY &&
        Math.abs(Number(p.y || 0) - Number(point.y || 0)) <= toleranceXY &&
        Math.abs(Number(p.z || 0) - Number(point.z || 0)) <= toleranceZ
      );
    });

    if (node) {
      if (!node.beams) node.beams = [];
      return node;
    }

    node = new StructuralNode({ x: point.x, y: point.y }, context.nodes.length + 1, point.z);

    if (!node.position) {
      node.position = {
        x: point.x,
        y: point.y,
        z: point.z,
      };
    }

    node.position.x = point.x;
    node.position.y = point.y;
    node.position.z = point.z;

    if (!node.beams) {
      node.beams = [];
    }

    context.nodes.push(node);

    console.log(
      `✅ Nodo creado ID: ${node.id} en (${point.x.toFixed(2)}, ${point.y.toFixed(2)}, ${point.z.toFixed(2)})`,
    );

    return node;
  }

  // Identifica la planta o elevación donde se hizo clic.
  // =====================================================
  getActiveViewSignature(context) {
    const view = context.viewSet?.[context.activeViewIndex];

    if (!view) return "view:none";

    if (view.type === "plan") {
      const z = Number(view.elevation ?? context.getActivePlanElevation?.() ?? 0);
      return `plan:z=${z.toFixed(4)}`;
    }

    if (view.type === "elevation") {
      const axis = view.axis || "none";
      const value = Number(view.value ?? 0);
      return `elevation:${axis}=${value.toFixed(4)}`;
    }

    return `${view.type || "view"}:${view.name || context.activeViewIndex}`;
  }

  // Devuelve true si la barra no pertenece a un solo plano 2D.
  // =====================================================
  isSpatialFrameFor2D(frame) {
    const p1 = frame?.node1?.position;
    const p2 = frame?.node2?.position;

    if (!p1 || !p2) return false;

    const tol = 0.001;

    const dx = Math.abs(Number(p2.x || 0) - Number(p1.x || 0));
    const dy = Math.abs(Number(p2.y || 0) - Number(p1.y || 0));
    const dz = Math.abs(Number(p2.z || 0) - Number(p1.z || 0));

    // Barra inclinada entre pisos: cambia Z y también cambia X o Y.
    return dz > tol && (dx > tol || dy > tol);
  }

  // Oculta la barra en canvas 2D, pero la mantiene en 3D.
  // =====================================================
  markFrameAs3DOnlyIfNeeded(context, frame, endViewSignature) {
    const createdAcrossViews =
      this.startViewSignature &&
      this.startViewSignature !== endViewSignature;

    const isSpatialFrame = this.isSpatialFrameFor2D(frame);

    if (createdAcrossViews || isSpatialFrame) {
      frame.isCrossViewFrame = true;
      frame.is3DOnlyFrame = true;
      frame.showIn2D = false;

      console.log("🟨 Barra marcada como 3D-only:", {
        id: frame.id,
        startView: this.startViewSignature,
        endView: endViewSignature,
        node1: frame.node1?.position,
        node2: frame.node2?.position,
      });
    }
  }

  addNodeToCurrentShape(context, node) {
    const wasFirstNode = !this.shape?.node1;
    const currentViewSignature = this.getActiveViewSignature(context);

    const isDone = this.shape.addNode(node);

    // Cuando todavía no se completa la barra, se recuerda desde qué vista empezó el dibujo.
    // =====================================================================================
    if (!isDone) {
      if (wasFirstNode) {
        this.startViewSignature = currentViewSignature;
      }

      return;
    }

    this.shape.id = context.shapes.length + 1;
    this.shape.elementType = this.elementType;
    this.shape.type = this.elementType;
    this.shape.objectType = "frame";
    this.shape.visible = true;

    // Si empezó en una vista y terminó en otra, se verá solo en 3D.
    // =============================================================
    this.markFrameAs3DOnlyIfNeeded(
      context,
      this.shape,
      currentViewSignature
    );

    context.shapes.push(this.shape);

    if (!this.shape.node1.beams) this.shape.node1.beams = [];
    if (!this.shape.node2.beams) this.shape.node2.beams = [];

    if (!this.shape.node1.beams.includes(this.shape)) {
      this.shape.node1.beams.push(this.shape);
    }

    if (!this.shape.node2.beams.includes(this.shape)) {
      this.shape.node2.beams.push(this.shape);
    }

    console.log(`📐 Línea creada ID: ${this.shape.id} | tipo: ${this.elementType}`);

    const lastNode = this.shape.node2;

    this.shape = this.createEmptyShape(context);

    // Esto permite seguir dibujando otra línea desde el último punto
    this.shape.addNode(lastNode);

    // La siguiente barra continuará desde la vista actual.
    this.startViewSignature = currentViewSignature;

    context.redraw?.();
    context.sync3D?.();
  }


  getCurrentDirection(context) {
    if (!this.inputStartPoint) return null;

    const startWorld = this.inputStartPoint.position;
    const mouseWorld = context.mousePos;
    const view = context.viewSet?.[context.activeViewIndex];
    let dx = 0,
      dy = 0,
      dz = 0;
    let length = 0;

    if (view?.type === "elevation" && view.axis === "X") {
      // Plano Y-Z: coordenadas de pantalla X = Y mundo, Y = Z mundo
      // La dirección se calcula en el plano Y-Z
      dy = mouseWorld.x - startWorld.y;
      dz = mouseWorld.y - (startWorld.z || 0);
      length = Math.sqrt(dy * dy + dz * dz);
      if (length > 0.001) {
        return { dx: 0, dy: dy / length, dz: dz / length };
      }
      // Dirección por defecto hacia arriba en Y
      return { dx: 0, dy: 1, dz: 0 };
    } else if (view?.type === "elevation" && view.axis === "Y") {
      // Plano X-Z: coordenadas de pantalla X = X mundo, Y = Z mundo
      dx = mouseWorld.x - startWorld.x;
      dz = mouseWorld.y - (startWorld.z || 0);
      length = Math.sqrt(dx * dx + dz * dz);
      if (length > 0.001) {
        return { dx: dx / length, dy: 0, dz: dz / length };
      }
      // Dirección por defecto hacia la derecha en X
      return { dx: 1, dy: 0, dz: 0 };
    } else {
      // PLANTA: plano X-Y
      dx = mouseWorld.x - startWorld.x;
      dy = mouseWorld.y - startWorld.y;
      length = Math.sqrt(dx * dx + dy * dy);
      if (length > 0.001) {
        return { dx: dx / length, dy: dy / length, dz: 0 };
      }
      // Dirección por defecto hacia la derecha en X
      // Si no hay dirección válida, usar dirección por defecto (derecha)
      return { dx: 1, dy: 0, dz: 0 };
    }
  }

  startLengthInput(context, startPoint) {
    this.inputMode = true;
    this.inputBuffer = "";
    this.inputStartPoint = startPoint;

    const view = context.viewSet?.[context.activeViewIndex];

    // Mensaje específico según la vista
    if (view?.type === "elevation") {
      context.showMessage?.(
        "📏 Ingrese la longitud (en metros) y presione Enter. Esc para cancelar. Use el mouse para definir la dirección",
      );
    } else {
      context.showMessage?.("📏 Ingrese la longitud y presione Enter. Esc para cancelar");
    }

    context.redraw?.();
  }

  drawLengthPreview(context) {
    if (!this.inputMode || !this.inputStartPoint) return;

    const startPoint = this.inputStartPoint.position;
    const length = parseFloat(this.inputBuffer) || 1;

    // Obtener dirección actualizada dinámicamente
    const direction = this.getCurrentDirection(context);
    const view = context.viewSet?.[context.activeViewIndex];

    const endPoint = {
      x: startPoint.x + direction.dx * length,
      y: startPoint.y + direction.dy * length,
      z: (startPoint.z || 0) + direction.dz * length,
    };

    const p1 = context.currentRenderer?.projectPoint
      ? context.currentRenderer.projectPoint({ position: startPoint }, context)
      : context.grid.worldToScreen(startPoint);

    const p2 = context.currentRenderer?.projectPoint
      ? context.currentRenderer.projectPoint({ position: endPoint }, context)
      : context.grid.worldToScreen(endPoint);

    context.ctx.save();

    // Línea de preview naranja PUNTEADA
    context.ctx.strokeStyle = "#ffaa44";
    context.ctx.lineWidth = 2;
    context.ctx.setLineDash([8, 4]);
    context.ctx.beginPath();
    context.ctx.moveTo(p1.x, p1.y);
    context.ctx.lineTo(p2.x, p2.y);
    context.ctx.stroke();

    // Texto de longitud en el medio
    const midX = (p1.x + p2.x) / 2;
    const midY = (p1.y + p2.y) / 2;
    context.ctx.fillStyle = "#ffaa44";
    context.ctx.font = "bold 12px monospace";
    context.ctx.fillText(`${this.inputBuffer || "0"} m`, midX, midY - 10);

    // Mostrar buffer de entrada en la esquina
    context.ctx.fillStyle = "#ffffff";
    context.ctx.font = "14px monospace";
    context.ctx.shadowBlur = 0;
    context.ctx.fillText(`📏 Longitud: ${this.inputBuffer || "0"}_`, 20, 40);

    context.ctx.restore();
  }

  // ========== NUEVO: Crear viga con la longitud ingresada ==========
  createBeamWithLength(context) {
    if (!this.inputMode || !this.inputStartPoint) return;

    const length = parseFloat(this.inputBuffer);
    if (isNaN(length) || length <= 0) {
      context.showMessage?.("❌ Longitud inválida", "warning");
      this.inputMode = false;
      this.inputBuffer = "";
      this.inputStartPoint = null;
      context.redraw();
      return;
    }

    const startPoint = this.inputStartPoint.position;

    // 🔧 Usar dirección actualizada
    const direction = this.getCurrentDirection(context);

    const endPoint = {
      x: startPoint.x + direction.dx * length,
      y: startPoint.y + direction.dy * length,
      z: (startPoint.z || 0) + direction.dz * length,
    };

    // Crear o buscar nodo final
    let endNode = context.nodes.find((n) => {
      const p = n.position;
      return (
        Math.abs(p.x - endPoint.x) < 0.001 &&
        Math.abs(p.y - endPoint.y) < 0.001 &&
        Math.abs((p.z || 0) - (endPoint.z || 0)) < 0.001
      );
    });

    if (!endNode) {
      endNode = new StructuralNode({ x: endPoint.x, y: endPoint.y }, context.nodes.length + 1, endPoint.z);
      context.nodes.push(endNode);
    }

    // Crear la viga
    const beam = new Beam(context.globalE, context.globalA);
    beam.node1 = this.inputStartPoint;
    beam.node2 = endNode;
    beam.id = context.shapes.length + 1;
    beam.elementType = this.elementType;
    beam.type = this.elementType;
    beam.objectType = "frame";
    beam.visible = true;

    context.shapes.push(beam);

    // Conectar referencias
    if (!this.inputStartPoint.beams) this.inputStartPoint.beams = [];
    if (!endNode.beams) endNode.beams = [];
    this.inputStartPoint.beams.push(beam);
    endNode.beams.push(beam);

    console.log(`📐 Viga creada ID: ${beam.id} | longitud: ${length.toFixed(2)}m`);

    // Limpiar modo entrada
    this.inputMode = false;
    this.inputBuffer = "";
    this.inputStartPoint = null;

    // Continuar dibujando desde el nuevo nodo
    this.shape = this.createEmptyShape(context);
    this.shape.addNode(endNode);

    context.redraw();
    context.sync3D?.();
    context.showMessage?.(`✅ Viga de ${length.toFixed(2)}m creada. Continúe dibujando.`);
  }

  // ========== handleMouseDown ==========
  handleMouseDown(event, context, mouse) {
    if (isMouseButton(event, MOUSE_BUTTONS.MIDDLE)) {
      super.handleMouseDown(event, context, mouse);
      return;
    }

    super.handleMouseDown(...arguments);

    const point = this.getDrawingPoint(context, mouse);
    const node = this.getOrCreateNode(context, point);

    // Si es el primer punto, solo agregarlo
    if (!this.shape.node1) {
      this.addNodeToCurrentShape(context, node);
      context.redraw?.();
      context.sync3D?.();
      return;
    }

    // Si ya hay primer punto y NO estamos en modo entrada, permitir dibujo por clic normal
    if (!this.inputMode) {
      this.addNodeToCurrentShape(context, node);
      context.redraw?.();
      context.sync3D?.();
    }
  }

  handleMouseMove(event, context, mouse) {
    // Primero, el comportamiento de pan/zoom
    super.handleMouseMove(...arguments);
    // Actualizar mousePos del contexto (en coordenadas del mundo)
    context.mousePos = context.grid.screenToWorld(mouse);

    const view = context.viewSet?.[context.activeViewIndex];

    // ==== LÍNEA DE PREVIEW ORIGINAL (AZUL PUNTEADA) ====
    const firstPoint = this.shape?.node1?.position;

    if (firstPoint) {
      let currentPoint;

      if (this.inputMode && this.inputStartPoint) {
        // En modo entrada, usar el punto inicial fijo
        currentPoint = this.inputStartPoint.position;
      } else {
        // Obtener punto actual con snapping
        currentPoint = this.getDrawingPoint(context, mouse);
      }

      let dx, dy, dz;

      if (view?.type === "elevation" && view.axis === "X") {
        dx = currentPoint.x - firstPoint.x;
        dy = currentPoint.y - firstPoint.y;
        dz = (currentPoint.z || 0) - (firstPoint.z || 0);
      } else if (view?.type === "elevation" && view.axis === "Y") {
        dx = currentPoint.x - firstPoint.x;
        dy = currentPoint.y - firstPoint.y;
        dz = (currentPoint.z || 0) - (firstPoint.z || 0);
      } else {
        dx = currentPoint.x - firstPoint.x;
        dy = currentPoint.y - firstPoint.y;
        dz = 0;
      }

      const distance = Math.sqrt(dx * dx + dy * dy + dz * dz);

      if (context.distanceInput && distance > 0.001) {
        let p1, p2;

        // Proyectar puntos según vista
        if (view?.type === "elevation" && view.axis === "X") {
          p1 = context.currentRenderer.projectPoint
            ? context.currentRenderer.projectPoint({ position: { x: firstPoint.y, y: firstPoint.z || 0 } }, context)
            : context.grid.worldToScreen({ x: firstPoint.y, y: firstPoint.z || 0 });
          p2 = context.currentRenderer.projectPoint
            ? context.currentRenderer.projectPoint({ position: { x: currentPoint.y, y: currentPoint.z || 0 } }, context)
            : context.grid.worldToScreen({ x: currentPoint.y, y: currentPoint.z || 0 });
        } else if (view?.type === "elevation" && view.axis === "Y") {
          p1 = context.currentRenderer.projectPoint
            ? context.currentRenderer.projectPoint({ position: { x: firstPoint.x, y: firstPoint.z || 0 } }, context)
            : context.grid.worldToScreen({ x: firstPoint.x, y: firstPoint.z || 0 });
          p2 = context.currentRenderer.projectPoint
            ? context.currentRenderer.projectPoint({ position: { x: currentPoint.x, y: currentPoint.z || 0 } }, context)
            : context.grid.worldToScreen({ x: currentPoint.x, y: currentPoint.z || 0 });
        } else {
          p1 = context.currentRenderer.projectPoint
            ? context.currentRenderer.projectPoint({ position: firstPoint }, context)
            : context.grid.worldToScreen(firstPoint);
          p2 = context.currentRenderer.projectPoint
            ? context.currentRenderer.projectPoint({ position: currentPoint }, context)
            : context.grid.worldToScreen(currentPoint);
        }

        const mid = {
          x: (p1.x + p2.x) / 2,
          y: (p1.y + p2.y) / 2,
        };

        context.distanceInput.style.left = `${mid.x + 20}px`;
        context.distanceInput.style.top = `${mid.y - 20}px`;
        context.distanceInput.value = context.formatOutput
          ? context.formatOutput(distance, "lengths")
          : distance.toFixed(2);
      }
    }

    // Forzar redibujado para actualizar previews
    if (this.inputMode || firstPoint) {
      context.redraw();
    } else {
      context.redraw?.();
    }
  }

  createBeam(context) {
    const firstPoint = this.shape.node1?.position;

    if (!firstPoint) {
      return;
    }

    const distance = parseFloat(context.distanceInput?.value);

    if (isNaN(distance) || distance <= 0) {
      return;
    }

    const view = context.viewSet?.[context.activeViewIndex];
    const mouseWorld = context.mousePos;

    let direction = null;

    if (view?.type === "elevation" && view.axis === "X") {
      const dy = mouseWorld.x - firstPoint.y;
      const dz = mouseWorld.y - (firstPoint.z || 0);
      const len = Math.sqrt(dy * dy + dz * dz);

      if (len <= 0.001) return;

      direction = {
        x: 0,
        y: dy / len,
        z: dz / len,
      };
    } else if (view?.type === "elevation" && view.axis === "Y") {
      const dx = mouseWorld.x - firstPoint.x;
      const dz = mouseWorld.y - (firstPoint.z || 0);
      const len = Math.sqrt(dx * dx + dz * dz);

      if (len <= 0.001) return;

      direction = {
        x: dx / len,
        y: 0,
        z: dz / len,
      };
    } else {
      const dx = mouseWorld.x - firstPoint.x;
      const dy = mouseWorld.y - firstPoint.y;
      const len = Math.sqrt(dx * dx + dy * dy);

      if (len <= 0.001) return;

      direction = {
        x: dx / len,
        y: dy / len,
        z: 0,
      };
    }

    const newPoint = {
      x: firstPoint.x + direction.x * distance,
      y: firstPoint.y + direction.y * distance,
      z: (firstPoint.z || 0) + direction.z * distance,
    };

    const node = this.getOrCreateNode(context, newPoint);
    this.addNodeToCurrentShape(context, node);

    context.redraw?.();
    context.sync3D?.();
  }

  handleKeyDown(event, context) {
    // Manejo de entrada numérica en modo entrada
    if (this.inputMode) {
      if (event.key === "Enter") {
        this.createBeamWithLength(context);
        event.preventDefault();
        return;
      } else if (event.key === "Escape") {
        this.inputMode = false;
        this.inputBuffer = "";
        this.inputStartPoint = null;
        context.showMessage?.("📏 Modo de entrada cancelado");
        context.redraw();
        event.preventDefault();
        return;
      } else if (event.key === "Backspace") {
        this.inputBuffer = this.inputBuffer.slice(0, -1);
        context.redraw();
        event.preventDefault();
        return;
      } else if (event.key === "." || /[0-9]/.test(event.key)) {
        this.inputBuffer += event.key;
        context.redraw();
        event.preventDefault();
        return;
      }
    }

    // Tecla 'L' para activar modo entrada de longitud (después de tener primer punto)
    if (event.key === "l" || event.key === "L") {
      if (this.shape?.node1 && !this.shape.node2 && !this.inputMode) {
        const view = context.viewSet?.[context.activeViewIndex];
        const message =
          view?.type === "elevation"
            ? "📏 Modo longitud activado. Mueva el mouse para definir dirección, ingrese número y presione Enter"
            : "📏 Modo longitud activado. Ingrese la longitud y presione Enter";
        context.showMessage?.(message);
        this.startLengthInput(context, this.shape.node1);
        event.preventDefault();
        return;
      } else if (!this.shape?.node1) {
        context.showMessage?.("⚠️ Primero debe seleccionar el punto inicial", "warning");
      } else if (this.shape.node2) {
        context.showMessage?.("⚠️ Ya completó la viga actual. Comience una nueva", "warning");
      }
      return;
    }

    // Escape para salir del estado
    if (event.key === "Escape" && !this.inputMode) {
      this.shape = this.createEmptyShape(context);
      if (context.distanceInput) {
        context.distanceInput.value = "";
      }
      context.setState(context.idleState);
      context.redraw?.();
      return;
    }

    // Enter original (para dibujo por distancia con input numérico)
    if (event.key === "Enter" && !this.inputMode) {
      this.createBeam(context);
      return;
    }

    super.handleKeyDown(event, context);
  }

  // Mantiene el primer punto al cambiar de planta/elevación.
  // =====================================================
  onViewChanged(context, view) {
    if (!this.shape?.node1) return;

    context.showMessage?.(
      "Primer punto conservado. Selecciona el segundo punto en la nueva vista."
    );

    context.redraw?.();
  }

  exit() {
    super.exit();
    this.shape = this.createEmptyShape(this.context);
    this.inputMode = false;
    this.inputBuffer = "";
    this.inputStartPoint = null;
    this.startViewSignature = null;
  }

  draw(renderer, context) {
// <<<<<<< HEAD
    // Dibujar preview normal del estado (línea azul PUNTEADA original)
    if (this.shape && this.shape.node1 && context.ctx) {
      let p1, p2;
      const view = context.viewSet?.[context.activeViewIndex];
      const firstPoint = this.shape.node1.position;

      // Obtener la posición del mouse en coordenadas consistentes
      const mouseWorld = context.mousePos;

      if (view?.type === "elevation" && view.axis === "X") {
        // Vista elevación X (LETRAS): X fijo, plano Y-Z
        p1 = context.grid.worldToScreen({ x: firstPoint.y, y: firstPoint.z || 0 });
        p2 = context.grid.worldToScreen({ x: mouseWorld.x, y: mouseWorld.y });
      } else if (view?.type === "elevation" && view.axis === "Y") {
        // Vista elevación Y (NÚMEROS): Y fijo, plano X-Z
        p1 = context.grid.worldToScreen({ x: firstPoint.x, y: firstPoint.z || 0 });
        p2 = context.grid.worldToScreen({ x: mouseWorld.x, y: mouseWorld.y });
      } else {
        // Vista PLANTA normal
        p1 = context.grid.worldToScreen({ x: firstPoint.x, y: firstPoint.y });
        p2 = context.grid.worldToScreen({ x: mouseWorld.x, y: mouseWorld.y });
      }

      context.ctx.save();
      context.ctx.strokeStyle = "#88aaff";
      context.ctx.setLineDash([5, 5]);
      context.ctx.lineWidth = 2;
      context.ctx.beginPath();
      context.ctx.moveTo(p1.x, p1.y);
      context.ctx.lineTo(p2.x, p2.y);
      context.ctx.stroke();
      context.ctx.restore();
    }

    if (renderer?.drawTrussDrawingState) {
      renderer.drawTrussDrawingState(this, context);
    }

    if (this.inputMode) {
      this.drawLengthPreview(context);
    }
  }

  info() {
    if (this.inputMode) {
      return `📏 Ingrese longitud: ${this.inputBuffer || "0"} | Enter = dibujar | Esc = cancelar`;
    }
    return "Dibujo de vigas: Clic para primer punto, luego L + longitud + Enter para dibujar. O simplemente clic para segundo punto. Esc para salir.";
  }
}

// =====================================================
// DRAW > FRAME 3D ENTRE PLANTAS Y ELEVACIONES
// =====================================================
export class CrossViewFrameDrawingState extends TrussDrawingState {
  constructor(context, elementType = "beam") {
    super(context, elementType);

    // Punto inicial guardado en coordenadas reales X, Y, Z
    this.startPoint = null;

    // Punto temporal usado para mostrar vista previa
    this.previewPoint = null;

    // Bandera para que cad_sys.js no cancele este modo al cambiar de vista
    this.preserveOnViewChange = true;
  }

  // =====================================================
  // CROSS VIEW > COPIAR PUNTO 3D
  // Evita modificar el punto original por referencia.
  // =====================================================
  clone3DPoint(point) {
    return {
      x: Number(point?.x || 0),
      y: Number(point?.y || 0),
      z: Number(point?.z || 0),
    };
  }

  // =====================================================
  // CROSS VIEW > CALCULAR DISTANCIA 3D
  // Calcula la longitud real entre dos puntos X,Y,Z.
  // =====================================================
  get3DDistance(p1, p2) {
    const dx = Number(p2.x || 0) - Number(p1.x || 0);
    const dy = Number(p2.y || 0) - Number(p1.y || 0);
    const dz = Number(p2.z || 0) - Number(p1.z || 0);

    return Math.sqrt(dx * dx + dy * dy + dz * dz);
  }

  // =====================================================
  // CROSS VIEW > CREAR BARRA 3D
  // Usa la función central de cad_sys.js para crear nodos y barra.
  // =====================================================
  createCrossViewFrame(context, startPoint, endPoint) {
    if (!context.createFrameLineFromPoints) {
      context.showMessage?.(
        "Falta createFrameLineFromPoints en cad_sys.js",
        "warning"
      );
      return null;
    }

    const frame = context.createFrameLineFromPoints(
      startPoint,
      endPoint,
      this.elementType || "beam"
    );

    if (!frame) return null;

    frame.elementType = this.elementType || "beam";
    frame.type = this.elementType || "beam";
    frame.objectType = "frame";
    frame.visible = true;
    frame.isCrossViewFrame = true;

    return frame;
  }

  // =====================================================
  // CROSS VIEW > CLIC DE DIBUJO
  // Primer clic guarda el punto inicial.
  // Segundo clic crea la barra entre vistas.
  // =====================================================
  handleMouseDown(event, context, mouse) {
    if (isMouseButton(event, MOUSE_BUTTONS.MIDDLE)) {
      PanAndZoomState.prototype.handleMouseDown.call(this, event, context, mouse);
      return;
    }

    PanAndZoomState.prototype.handleMouseDown.call(this, event, context, mouse);

    const currentPoint = this.clone3DPoint(
      this.getDrawingPoint(context, mouse)
    );

    // Primer clic: guardar punto inicial
    if (!this.startPoint) {
      this.startPoint = currentPoint;
      this.previewPoint = currentPoint;

      context.showMessage?.(
        `Punto inicial 3D guardado: X=${currentPoint.x.toFixed(2)}, Y=${currentPoint.y.toFixed(2)}, Z=${currentPoint.z.toFixed(2)}`
      );

      context.redraw?.();
      return;
    }

    // Segundo clic: crear barra entre punto inicial y punto final
    const distance = this.get3DDistance(this.startPoint, currentPoint);

    if (distance <= 0.001) {
      context.showMessage?.(
        "No se puede crear una barra con el mismo punto inicial y final",
        "warning"
      );
      return;
    }

    const frame = this.createCrossViewFrame(
      context,
      this.startPoint,
      currentPoint
    );

    if (!frame) return;

    context.showMessage?.(
      `Barra 3D creada | Longitud: ${context.formatOutput
        ? context.formatOutput(distance, "lengths")
        : distance.toFixed(2)
      } m`
    );

    // Continuar dibujando desde el último punto, como ETABS
    this.startPoint = currentPoint;
    this.previewPoint = currentPoint;

    context.markAnalysisResultsOutdated?.(
      "Se agregó una barra 3D entre vistas."
    );

    context.redraw?.();
    context.sync3D?.();
  }

  // =====================================================
  // CROSS VIEW > VISTA PREVIA CON EL MOUSE
  // Muestra la distancia entre el punto inicial y el punto actual.
  // =====================================================
  handleMouseMove(event, context, mouse) {
    PanAndZoomState.prototype.handleMouseMove.call(this, event, context, mouse);

    if (!this.startPoint) return;

    this.previewPoint = this.clone3DPoint(
      this.getDrawingPoint(context, mouse)
    );

    const distance = this.get3DDistance(this.startPoint, this.previewPoint);

    if (context.distanceInput && distance > 0.001) {
      const p1 = context.currentRenderer?.projectPoint
        ? context.currentRenderer.projectPoint({ position: this.startPoint }, context)
        : context.grid.worldToScreen(this.startPoint);

      const p2 = context.currentRenderer?.projectPoint
        ? context.currentRenderer.projectPoint({ position: this.previewPoint }, context)
        : context.grid.worldToScreen(this.previewPoint);

      const mid = {
        x: (p1.x + p2.x) / 2,
        y: (p1.y + p2.y) / 2,
      };

      context.distanceInput.style.left = `${mid.x + 20}px`;
      context.distanceInput.style.top = `${mid.y - 20}px`;
      context.distanceInput.value = context.formatOutput
        ? context.formatOutput(distance, "lengths")
        : distance.toFixed(2);
    }

    context.redraw?.();
  }

  // =====================================================
  // CROSS VIEW > CAMBIO DE VISTA
  // Mantiene guardado el punto inicial cuando el usuario cambia de vista.
  // =====================================================
  onViewChanged(context, view) {
    if (!this.startPoint) return;

    context.showMessage?.(
      "Modo Frame 3D activo: selecciona el segundo punto en la nueva vista."
    );

    context.redraw?.();
  }

  // =====================================================
  // CROSS VIEW > TECLAS DEL MODO
  // Esc cancela el punto inicial o sale del modo.
  // =====================================================
  handleKeyDown(event, context) {
    if (event.key === "Escape") {
      if (this.startPoint) {
        this.startPoint = null;
        this.previewPoint = null;

        if (context.distanceInput) {
          context.distanceInput.value = "";
        }

        context.showMessage?.("Punto inicial 3D cancelado.");
        context.redraw?.();
        event.preventDefault();
        return;
      }

      context.setState(context.idleState);
      event.preventDefault();
      return;
    }

    super.handleKeyDown(event, context);
  }

  // =====================================================
  // CROSS VIEW > DIBUJAR PREVIEW
  // Dibuja una línea punteada temporal entre el punto inicial y el mouse.
  // =====================================================
  draw(renderer, context) {
    if (!this.startPoint || !this.previewPoint || !context.ctx) return;

    const p1 = context.currentRenderer?.projectPoint
      ? context.currentRenderer.projectPoint({ position: this.startPoint }, context)
      : context.grid.worldToScreen(this.startPoint);

    const p2 = context.currentRenderer?.projectPoint
      ? context.currentRenderer.projectPoint({ position: this.previewPoint }, context)
      : context.grid.worldToScreen(this.previewPoint);

    context.ctx.save();

    context.ctx.strokeStyle = "#facc15";
    context.ctx.lineWidth = 2;
    context.ctx.setLineDash([8, 5]);

    context.ctx.beginPath();
    context.ctx.moveTo(p1.x, p1.y);
    context.ctx.lineTo(p2.x, p2.y);
    context.ctx.stroke();

    context.ctx.setLineDash([]);
    context.ctx.fillStyle = "#facc15";
    context.ctx.font = "bold 12px monospace";
    context.ctx.fillText("Frame 3D", p2.x + 8, p2.y - 8);

    context.ctx.restore();
  }

  // =====================================================
  // CROSS VIEW > LIMPIEZA AL SALIR
  // Reinicia el modo cuando el usuario cambia a otra herramienta.
  // =====================================================
  exit() {
    super.exit();

    this.startPoint = null;
    this.previewPoint = null;

    if (this.context?.distanceInput) {
      this.context.distanceInput.value = "";
    }
  }

  info() {
    if (this.startPoint) {
      return "Frame 3D entre vistas: cambia de planta/elevación y selecciona el segundo punto. Esc cancela.";
    }

    return "Frame 3D entre vistas: haz clic en el primer punto. Luego puedes cambiar de vista y hacer clic en el segundo punto.";
  }
}

export class PointDrawingState extends PanAndZoomState {
  constructor(context) {
    super();
    this.context = context;
  }

  handleMouseDown(event, context, mouse) {
    if (isMouseButton(event, MOUSE_BUTTONS.MIDDLE)) {
      super.handleMouseDown(event, context, mouse);
      return;
    }

    super.handleMouseDown(...arguments);

    const view = context.viewSet?.[context.activeViewIndex];
    const worldPos = context.grid.screenToWorld(mouse);
    const snapPoint = context.activeGridPoint ?? null;

    let x, y, z;

    if (snapPoint) {
      x = snapPoint.x;
      y = snapPoint.y;
      z = snapPoint.z;
    } else if (view?.type === "elevation" && view.axis === "X") {
      const fixedX = view.value ?? 0;
      x = fixedX;
      y = worldPos.x;
      z = worldPos.y;
    } else if (view?.type === "elevation" && view.axis === "Y") {
      const fixedY = view.value ?? 0;
      x = worldPos.x;
      y = fixedY;
      z = worldPos.y;
    } else {
      const currentZ = context.getActivePlanElevation?.() ?? context.getCurrentZ?.() ?? 0;
      x = worldPos.x;
      y = worldPos.y;
      z = currentZ;
    }

    let node = context.nodes.find((n) => {
      const dx = Math.abs(n.position.x - x);
      const dy = Math.abs(n.position.y - y);
      const dz = Math.abs((n.position.z || 0) - z);
      return dx < 0.3 && dy < 0.3 && dz < 0.1;
    });

    if (!node) {
      node = new StructuralNode({ x, y }, context.nodes.length + 1, z);
      context.nodes.push(node);
      console.log(`📍 Nodo creado ID: ${node.id} en (${x.toFixed(2)}, ${y.toFixed(2)}, ${z.toFixed(2)})`);
    } else {
      console.log(`🔗 Nodo existente ID: ${node.id}`);
    }

    context.redraw();
    context.sync3D();
  }

  info() {
    return "Haz clic para crear nodos. Usa Esc para salir.";
  }
}

// Herramienta de dibujo manual de EJES DE GRID reales (no líneas de
// referencia libres): cada clic agrega un eje X (vertical) o Y (horizontal)
// que pasa por el punto clickeado — pensado para trazar la grilla a mano
// sobre un plano DXF/DWG importado (snapea a sus vértices vía
// context.activeGridPoint, igual que PointDrawingState/ColumnDrawingState).
// La lógica de inserción/relabeling vive en addGridAxisAtOrdinate
// (mixins/grids/reference-grid.js) para que sea reusable y testeable aparte.
export class GridAxisDrawingState extends PanAndZoomState {
  constructor(context, axis) {
    super();
    this.context = context;
    this.axis = axis; // "X" | "Y"
  }

  handleMouseDown(event, context, mouse) {
    if (isMouseButton(event, MOUSE_BUTTONS.MIDDLE)) {
      super.handleMouseDown(event, context, mouse);
      return;
    }

    super.handleMouseDown(...arguments);

    const view = context.viewSet?.[context.activeViewIndex];
    if (view && view.type !== "plan") {
      context.showMessage?.("Dibujar ejes de grid solo está disponible en vista de planta", "warning");
      return;
    }

    const worldPos = context.grid.screenToWorld(mouse);
    const snapPoint = context.activeGridPoint ?? null;
    const x = snapPoint ? Number(snapPoint.x) : Number(worldPos.x);
    const y = snapPoint ? Number(snapPoint.y) : Number(worldPos.y);
    const ordinate = this.axis === "X" ? x : y;

    context.addGridAxisAtOrdinate?.(this.axis, ordinate);
  }

  info() {
    return this.axis === "X"
      ? "Clic para agregar un eje vertical (X) en ese punto. Esc para salir."
      : "Clic para agregar un eje horizontal (Y) en ese punto. Esc para salir.";
  }
}

export class ColumnDrawingState extends PanAndZoomState {
  constructor(context) {
    super();
    this.context = context;
  }

  getColumnPoint(context, mouse) {
    const view = context.viewSet?.[context.activeViewIndex];

    if (!view || view.type !== "plan") {
      return null;
    }

    if (context.activeGridPoint) {
      return {
        x: Number(context.activeGridPoint.x || 0),
        y: Number(context.activeGridPoint.y || 0),
      };
    }

    const worldPos = context.grid.screenToWorld(mouse);

    return {
      x: Number(worldPos.x || 0),
      y: Number(worldPos.y || 0),
    };
  }

  getNextStoryElevation(context, currentZ) {
    const stories = Array.isArray(context.stories) ? context.stories : [];

    const upperStory = stories
      .filter((story) => Number(story.elevation) > Number(currentZ))
      .sort((a, b) => Number(a.elevation) - Number(b.elevation))[0];

    if (upperStory) {
      return Number(upperStory.elevation);
    }

    const storyHeight = Number(context.referenceGrid?.storyHeight ?? 0);

    if (storyHeight > 0) {
      return Number(currentZ) + storyHeight;
    }

    return null;
  }

  getOrCreateNodeAt(context, x, y, z) {
    const toleranceXY = 0.001;
    const toleranceZ = 0.001;

    let node = context.nodes.find((n) => {
      const p = n.position || n;

      return (
        Math.abs(Number(p.x || 0) - Number(x || 0)) <= toleranceXY &&
        Math.abs(Number(p.y || 0) - Number(y || 0)) <= toleranceXY &&
        Math.abs(Number(p.z || 0) - Number(z || 0)) <= toleranceZ
      );
    });

    if (node) {
      if (!node.beams) node.beams = [];
      return node;
    }

    node = new StructuralNode({ x: Number(x || 0), y: Number(y || 0) }, context.nodes.length + 1, Number(z || 0));

    if (!node.position) {
      node.position = {
        x: Number(x || 0),
        y: Number(y || 0),
        z: Number(z || 0),
      };
    }

    node.position.x = Number(x || 0);
    node.position.y = Number(y || 0);
    node.position.z = Number(z || 0);

    if (!node.beams) {
      node.beams = [];
    }

    context.nodes.push(node);

    return node;
  }

  columnAlreadyExists(context, node1, node2) {
    return context.shapes.some((shape) => {
      if (!shape?.node1 || !shape?.node2) return false;

      const sameDirection = shape.node1 === node1 && shape.node2 === node2;

      const reverseDirection = shape.node1 === node2 && shape.node2 === node1;

      const isColumn = shape.elementType === "column" || shape.type === "column";

      return isColumn && (sameDirection || reverseDirection);
    });
  }

  createColumn(context, x, y, z1, z2) {
    const node1 = this.getOrCreateNodeAt(context, x, y, z1);
    const node2 = this.getOrCreateNodeAt(context, x, y, z2);

    if (this.columnAlreadyExists(context, node1, node2)) {
      context.showMessage?.("Ya existe una columna en este punto", "warning");
      return null;
    }

    const column = new Beam(context.globalE, context.globalA);

    column.elementType = "column";
    column.type = "column";
    column.objectType = "frame";
    column.visible = true;

    column.addNode(node1);
    column.addNode(node2);

    column.id = context.shapes.length + 1;
    context.shapes.push(column);

    if (!node1.beams) node1.beams = [];
    if (!node2.beams) node2.beams = [];

    if (!node1.beams.includes(column)) {
      node1.beams.push(column);
    }

    if (!node2.beams.includes(column)) {
      node2.beams.push(column);
    }

    console.log(`│ Columna creada ID: ${column.id} desde Z=${z1.toFixed(2)} hasta Z=${z2.toFixed(2)}`);

    return column;
  }

  handleMouseDown(event, context, mouse) {
    if (isMouseButton(event, MOUSE_BUTTONS.MIDDLE)) {
      super.handleMouseDown(event, context, mouse);
      return;
    }

    super.handleMouseDown(...arguments);

    const view = context.viewSet?.[context.activeViewIndex];

    if (!view || view.type !== "plan") {
      context.showMessage?.("Create Columns solo funciona en planta", "warning");
      return;
    }

    const point = this.getColumnPoint(context, mouse);

    if (!point) {
      context.showMessage?.("No se pudo obtener el punto para crear la columna", "warning");
      return;
    }

    const currentZ = Number(context.getActivePlanElevation?.() ?? context.getCurrentZ?.() ?? 0);

    const nextZ = this.getNextStoryElevation(context, currentZ);

    if (nextZ === null || nextZ <= currentZ) {
      context.showMessage?.("No existe un piso superior para crear la columna", "warning");
      return;
    }

    this.createColumn(context, point.x, point.y, currentZ, nextZ);

    context.redraw?.();
    context.sync3D?.();
  }

  info() {
    return "Create Columns: haz clic en planta para crear una columna vertical hasta el piso superior. Usa Esc para salir.";
  }
}

export class CreateLinesRegionClicksState extends PanAndZoomState {
  constructor(context) {
    super();
    this.context = context;

    this.isDraggingRegion = false;
    this.regionStart = null;
    this.regionEnd = null;
    this.dragThreshold = 8;
  }

  getActiveView(context) {
    return context.viewSet?.[context.activeViewIndex] || null;
  }

  getGridSegmentsForActiveView(context) {
    const view = this.getActiveView(context);
    const ref = context.referenceGrid;

    if (!view || !ref) return [];

    const segments = [];

    const xPositions = ref.xPositions || [];
    const yPositions = ref.yPositions || [];
    const storyCount = Number(ref.storyCount || 0);
    const storyHeight = Number(ref.storyHeight || 0);

    if (view.type === "plan") {
      const z = Number(view.elevation || 0);

      yPositions.forEach((y) => {
        for (let i = 0; i < xPositions.length - 1; i++) {
          segments.push({
            p1: { x: xPositions[i], y, z },
            p2: { x: xPositions[i + 1], y, z },
            type: "beam",
          });
        }
      });

      xPositions.forEach((x) => {
        for (let j = 0; j < yPositions.length - 1; j++) {
          segments.push({
            p1: { x, y: yPositions[j], z },
            p2: { x, y: yPositions[j + 1], z },
            type: "beam",
          });
        }
      });

      return segments;
    }

    if (view.type === "elevation" && view.axis === "X") {
      const fixedX = Number(view.value || 0);

      const zLevels = [];
      for (let k = 0; k <= storyCount; k++) {
        zLevels.push(k * storyHeight);
      }

      zLevels.forEach((z) => {
        for (let j = 0; j < yPositions.length - 1; j++) {
          segments.push({
            p1: { x: fixedX, y: yPositions[j], z },
            p2: { x: fixedX, y: yPositions[j + 1], z },
            type: "beam",
          });
        }
      });

      yPositions.forEach((y) => {
        for (let k = 0; k < zLevels.length - 1; k++) {
          segments.push({
            p1: { x: fixedX, y, z: zLevels[k] },
            p2: { x: fixedX, y, z: zLevels[k + 1] },
            type: "column",
          });
        }
      });

      return segments;
    }

    if (view.type === "elevation" && view.axis === "Y") {
      const fixedY = Number(view.value || 0);

      const zLevels = [];
      for (let k = 0; k <= storyCount; k++) {
        zLevels.push(k * storyHeight);
      }

      zLevels.forEach((z) => {
        for (let i = 0; i < xPositions.length - 1; i++) {
          segments.push({
            p1: { x: xPositions[i], y: fixedY, z },
            p2: { x: xPositions[i + 1], y: fixedY, z },
            type: "beam",
          });
        }
      });

      xPositions.forEach((x) => {
        for (let k = 0; k < zLevels.length - 1; k++) {
          segments.push({
            p1: { x, y: fixedY, z: zLevels[k] },
            p2: { x, y: fixedY, z: zLevels[k + 1] },
            type: "column",
          });
        }
      });

      return segments;
    }

    return [];
  }

  projectPointToActiveView(context, point) {
    const view = this.getActiveView(context);

    if (!view || view.type === "plan") {
      return context.grid.worldToScreen({
        x: point.x,
        y: point.y,
      });
    }

    if (view.type === "elevation" && view.axis === "X") {
      return context.grid.worldToScreen({
        x: point.y,
        y: point.z,
      });
    }

    if (view.type === "elevation" && view.axis === "Y") {
      return context.grid.worldToScreen({
        x: point.x,
        y: point.z,
      });
    }

    return null;
  }

  distanceToSegment(mouse, a, b) {
    const dx = b.x - a.x;
    const dy = b.y - a.y;

    if (Math.abs(dx) < 1e-9 && Math.abs(dy) < 1e-9) {
      return Math.hypot(mouse.x - a.x, mouse.y - a.y);
    }

    let t = ((mouse.x - a.x) * dx + (mouse.y - a.y) * dy) / (dx * dx + dy * dy);

    t = Math.max(0, Math.min(1, t));

    const px = a.x + t * dx;
    const py = a.y + t * dy;

    return Math.hypot(mouse.x - px, mouse.y - py);
  }

  findClosestSegment(context, mouse) {
    const segments = this.getGridSegmentsForActiveView(context);

    let best = null;
    let bestDistance = 12;

    segments.forEach((segment) => {
      const s1 = this.projectPointToActiveView(context, segment.p1);
      const s2 = this.projectPointToActiveView(context, segment.p2);

      if (!s1 || !s2) return;

      const d = this.distanceToSegment(mouse, s1, s2);

      if (d < bestDistance) {
        bestDistance = d;
        best = segment;
      }
    });

    return best;
  }

  lineAlreadyExists(context, p1, p2, tolerance = 0.001) {
    return context.shapes.some((shape) => {
      if (!shape?.node1?.position || !shape?.node2?.position) return false;

      const a = shape.node1.position;
      const b = shape.node2.position;

      const sameDirection =
        Math.abs(a.x - p1.x) <= tolerance &&
        Math.abs(a.y - p1.y) <= tolerance &&
        Math.abs((a.z || 0) - (p1.z || 0)) <= tolerance &&
        Math.abs(b.x - p2.x) <= tolerance &&
        Math.abs(b.y - p2.y) <= tolerance &&
        Math.abs((b.z || 0) - (p2.z || 0)) <= tolerance;

      const reverseDirection =
        Math.abs(a.x - p2.x) <= tolerance &&
        Math.abs(a.y - p2.y) <= tolerance &&
        Math.abs((a.z || 0) - (p2.z || 0)) <= tolerance &&
        Math.abs(b.x - p1.x) <= tolerance &&
        Math.abs(b.y - p1.y) <= tolerance &&
        Math.abs((b.z || 0) - (p1.z || 0)) <= tolerance;

      return sameDirection || reverseDirection;
    });
  }

  createLine(context, segment, silent = false) {
    if (!segment) return false;

    if (this.lineAlreadyExists(context, segment.p1, segment.p2)) {
      if (!silent) {
        context.showMessage?.("Ya existe una línea en ese tramo", "warning");
      }
      return false;
    }

    if (!context.createFrameLineFromPoints) {
      context.showMessage?.("Falta createFrameLineFromPoints en cad_sys.js", "warning");
      return false;
    }

    const line = context.createFrameLineFromPoints(segment.p1, segment.p2, segment.type || "beam");

    if (line) {
      line.elementType = segment.type || "beam";
      line.type = segment.type || "beam";
      return true;
    }

    return false;
  }

  getRegionRect() {
    if (!this.regionStart || !this.regionEnd) return null;

    return {
      left: Math.min(this.regionStart.x, this.regionEnd.x),
      right: Math.max(this.regionStart.x, this.regionEnd.x),
      top: Math.min(this.regionStart.y, this.regionEnd.y),
      bottom: Math.max(this.regionStart.y, this.regionEnd.y),
    };
  }

  pointInsideRect(point, rect) {
    return point.x >= rect.left && point.x <= rect.right && point.y >= rect.top && point.y <= rect.bottom;
  }

  // CREATE LINES IN REGION: para cada tramo de grilla, FIGURA ABIERTA (intersección con la región)
  // segmentIntersectsRect(a, b, rect) {
  //   if (this.pointInsideRect(a, rect) || this.pointInsideRect(b, rect)) {
  //     return true;
  //   }

  //   const mid = {
  //     x: (a.x + b.x) / 2,
  //     y: (a.y + b.y) / 2,
  //   };

  //   if (this.pointInsideRect(mid, rect)) {
  //     return true;
  //   }

  //   return false;
  // }

  // CREATE LINES IN REGION: para cada tramo de grilla, FIGURA CERRADA (ambos puntos dentro de la región)
  segmentIntersectsRect(a, b, rect) {
    return this.pointInsideRect(a, rect) && this.pointInsideRect(b, rect);
  }

  getSegmentsInsideRegion(context) {
    const rect = this.getRegionRect();
    if (!rect) return [];

    const segments = this.getGridSegmentsForActiveView(context);

    return segments.filter((segment) => {
      const s1 = this.projectPointToActiveView(context, segment.p1);
      const s2 = this.projectPointToActiveView(context, segment.p2);

      if (!s1 || !s2) return false;

      return this.segmentIntersectsRect(s1, s2, rect);
    });
  }

  createLinesInRegion(context) {
    const segments = this.getSegmentsInsideRegion(context);

    if (!segments.length) {
      context.showMessage?.("No hay tramos de grilla dentro de la región", "warning");
      return;
    }

    let created = 0;

    segments.forEach((segment) => {
      const ok = this.createLine(context, segment, true);
      if (ok) created++;
    });

    if (created > 0) {
      context.showMessage?.(`Se crearon ${created} líneas en la región`);
    } else {
      context.showMessage?.("No se crearon líneas nuevas; ya existían", "warning");
    }

    context.redraw?.();
    context.sync3D?.();
  }

  handleMouseDown(event, context, mouse) {
    if (isMouseButton(event, MOUSE_BUTTONS.MIDDLE)) {
      super.handleMouseDown(event, context, mouse);
      return;
    }

    super.handleMouseDown(...arguments);

    this.isDraggingRegion = true;
    this.regionStart = { x: mouse.x, y: mouse.y };
    this.regionEnd = { x: mouse.x, y: mouse.y };
  }

  handleMouseMove(event, context, mouse) {
    super.handleMouseMove(...arguments);

    if (!this.isDraggingRegion) return;

    this.regionEnd = { x: mouse.x, y: mouse.y };
    context.redraw?.();
  }

  handleMouseUp(event, context, mouse) {
    if (isMouseButton(event, MOUSE_BUTTONS.MIDDLE)) {
      super.handleMouseUp(event, context, mouse);
      return;
    }

    if (!this.isDraggingRegion) return;

    this.regionEnd = { x: mouse.x, y: mouse.y };

    const dx = this.regionEnd.x - this.regionStart.x;
    const dy = this.regionEnd.y - this.regionStart.y;
    const dragDistance = Math.sqrt(dx * dx + dy * dy);

    if (dragDistance <= this.dragThreshold) {
      const segment = this.findClosestSegment(context, mouse);

      if (!segment) {
        context.showMessage?.("Haz clic cerca de un tramo de grilla", "warning");
      } else {
        this.createLine(context, segment);
      }
    } else {
      this.createLinesInRegion(context);
    }

    this.isDraggingRegion = false;
    this.regionStart = null;
    this.regionEnd = null;

    context.redraw?.();
    context.sync3D?.();
  }

  handleKeyDown(event, context) {
    if (event.key === "Escape") {
      this.isDraggingRegion = false;
      this.regionStart = null;
      this.regionEnd = null;

      context.setState(context.idleState);
      context.redraw?.();
      return;
    }

    super.handleKeyDown(event, context);
  }

  draw(renderer, context) {
    if (!this.isDraggingRegion || !this.regionStart || !this.regionEnd) {
      return;
    }

    const ctx = context.ctx;
    const rect = this.getRegionRect();

    if (!ctx || !rect) return;

    ctx.save();

    ctx.setLineDash([6, 4]);
    ctx.strokeStyle = "#facc15";
    ctx.lineWidth = 1.5;

    ctx.strokeRect(rect.left, rect.top, rect.right - rect.left, rect.bottom - rect.top);

    ctx.fillStyle = "rgba(250, 204, 21, 0.12)";
    ctx.fillRect(rect.left, rect.top, rect.right - rect.left, rect.bottom - rect.top);

    ctx.restore();
  }

  info() {
    return "Create Lines: clic cerca de una grilla para crear un tramo, o arrastra una región para crear varios. Esc para salir.";
  }
}

export class CreateSecondaryBeamsRegionClicksState extends PanAndZoomState {
  constructor(context) {
    super();
    this.context = context;

    this.isDraggingRegion = false;
    this.regionStart = null;
    this.regionEnd = null;

    this.dragThreshold = 8;

    // Dirección por defecto:
    // "X" crea vigas horizontales entre ejes X.
    // "Y" crea vigas verticales entre ejes Y.
    this.direction = "X";

    // Cantidad de vigas secundarias por paño cuando se usa región.
    this.beamCount = 1;
  }

  getActiveView(context) {
    return context.viewSet?.[context.activeViewIndex] || null;
  }

  isPlanView(context) {
    const view = this.getActiveView(context);
    return view && view.type === "plan";
  }

  getPlanZ(context) {
    const view = this.getActiveView(context);
    return Number(view?.elevation ?? context.getActivePlanElevation?.() ?? 0);
  }

  getRawPlanPoint(context, mouse) {
    const world = context.grid.screenToWorld(mouse);

    return {
      x: Number(world.x || 0),
      y: Number(world.y || 0),
      z: this.getPlanZ(context),
    };
  }

  getSortedValues(values = []) {
    return [...values].map((v) => Number(v || 0)).sort((a, b) => a - b);
  }

  findBayForPoint(context, point) {
    const ref = context.referenceGrid;
    if (!ref) return null;

    const xValues = this.getSortedValues(ref.xPositions || []);
    const yValues = this.getSortedValues(ref.yPositions || []);

    if (xValues.length < 2 || yValues.length < 2) return null;

    let xIndex = -1;
    let yIndex = -1;

    for (let i = 0; i < xValues.length - 1; i++) {
      if (point.x >= xValues[i] && point.x <= xValues[i + 1]) {
        xIndex = i;
        break;
      }
    }

    for (let j = 0; j < yValues.length - 1; j++) {
      if (point.y >= yValues[j] && point.y <= yValues[j + 1]) {
        yIndex = j;
        break;
      }
    }

    if (xIndex < 0 || yIndex < 0) return null;

    return {
      x0: xValues[xIndex],
      x1: xValues[xIndex + 1],
      y0: yValues[yIndex],
      y1: yValues[yIndex + 1],
      xIndex,
      yIndex,
    };
  }

  getAllBays(context) {
    const ref = context.referenceGrid;
    if (!ref) return [];

    const xValues = this.getSortedValues(ref.xPositions || []);
    const yValues = this.getSortedValues(ref.yPositions || []);

    const bays = [];

    for (let i = 0; i < xValues.length - 1; i++) {
      for (let j = 0; j < yValues.length - 1; j++) {
        bays.push({
          x0: xValues[i],
          x1: xValues[i + 1],
          y0: yValues[j],
          y1: yValues[j + 1],
          xIndex: i,
          yIndex: j,
        });
      }
    }

    return bays;
  }

  projectPlanPoint(context, point) {
    return context.grid.worldToScreen({
      x: point.x,
      y: point.y,
    });
  }

  getRegionRect() {
    if (!this.regionStart || !this.regionEnd) return null;

    return {
      left: Math.min(this.regionStart.x, this.regionEnd.x),
      right: Math.max(this.regionStart.x, this.regionEnd.x),
      top: Math.min(this.regionStart.y, this.regionEnd.y),
      bottom: Math.max(this.regionStart.y, this.regionEnd.y),
    };
  }

  pointInsideRect(point, rect) {
    return point.x >= rect.left && point.x <= rect.right && point.y >= rect.top && point.y <= rect.bottom;
  }

  getBaysInsideRegion(context) {
    const rect = this.getRegionRect();
    if (!rect) return [];

    const z = this.getPlanZ(context);
    const bays = this.getAllBays(context);

    return bays.filter((bay) => {
      const center = {
        x: (bay.x0 + bay.x1) / 2,
        y: (bay.y0 + bay.y1) / 2,
        z,
      };

      const screenCenter = this.projectPlanPoint(context, center);

      return this.pointInsideRect(screenCenter, rect);
    });
  }

  lineAlreadyExists(context, p1, p2, tolerance = 0.001) {
    return context.shapes.some((shape) => {
      if (!shape?.node1?.position || !shape?.node2?.position) return false;

      const a = shape.node1.position;
      const b = shape.node2.position;

      const sameDirection =
        Math.abs(a.x - p1.x) <= tolerance &&
        Math.abs(a.y - p1.y) <= tolerance &&
        Math.abs((a.z || 0) - (p1.z || 0)) <= tolerance &&
        Math.abs(b.x - p2.x) <= tolerance &&
        Math.abs(b.y - p2.y) <= tolerance &&
        Math.abs((b.z || 0) - (p2.z || 0)) <= tolerance;

      const reverseDirection =
        Math.abs(a.x - p2.x) <= tolerance &&
        Math.abs(a.y - p2.y) <= tolerance &&
        Math.abs((a.z || 0) - (p2.z || 0)) <= tolerance &&
        Math.abs(b.x - p1.x) <= tolerance &&
        Math.abs(b.y - p1.y) <= tolerance &&
        Math.abs((b.z || 0) - (p1.z || 0)) <= tolerance;

      return sameDirection || reverseDirection;
    });
  }

  createSecondaryBeam(context, p1, p2, silent = false) {
    if (!context.createFrameLineFromPoints) {
      context.showMessage?.("Falta createFrameLineFromPoints en cad_sys.js", "warning");
      return false;
    }

    if (this.lineAlreadyExists(context, p1, p2)) {
      if (!silent) {
        context.showMessage?.("Ya existe una viga en ese tramo", "warning");
      }
      return false;
    }

    const line = context.createFrameLineFromPoints(p1, p2, "beam");

    if (!line) return false;

    // Importante:
    // dejamos type = "beam" para que el renderer lo siga dibujando normal.
    // marcamos elementType como secondary-beam para diferenciarlo.
    line.type = "beam";
    line.elementType = "secondary-beam";
    line.objectType = "frame";
    line.isSecondaryBeam = true;
    line.visible = true;

    return true;
  }

  createSecondaryBeamAtClick(context, mouse) {
    if (!this.isPlanView(context)) {
      context.showMessage?.("Create Secondary Beams solo funciona en planta", "warning");
      return;
    }

    const point = this.getRawPlanPoint(context, mouse);
    const bay = this.findBayForPoint(context, point);

    if (!bay) {
      context.showMessage?.("Haz clic dentro de un paño de grilla", "warning");
      return;
    }

    const segments = this.getSecondaryBeamSegmentsForBay(context, bay);

    let created = 0;

    segments.forEach((segment) => {
      const ok = this.createSecondaryBeam(context, segment.p1, segment.p2, true);

      if (ok) created++;
    });

    if (created > 0) {
      context.showMessage?.(`Se crearon ${created} vigas secundarias en el paño | Dir: ${this.direction}`);
    } else {
      context.showMessage?.("No se crearon vigas nuevas; ya existían", "warning");
    }

    context.redraw?.();
    context.sync3D?.();
  }

  getSecondaryBeamSegmentsForBay(context, bay) {
    const z = this.getPlanZ(context);
    const segments = [];

    const count = Math.max(1, Number(this.beamCount || 1));

    for (let i = 1; i <= count; i++) {
      const ratio = i / (count + 1);

      if (this.direction === "X") {
        const y = bay.y0 + (bay.y1 - bay.y0) * ratio;

        segments.push({
          p1: { x: bay.x0, y, z },
          p2: { x: bay.x1, y, z },
        });
      } else {
        const x = bay.x0 + (bay.x1 - bay.x0) * ratio;

        segments.push({
          p1: { x, y: bay.y0, z },
          p2: { x, y: bay.y1, z },
        });
      }
    }

    return segments;
  }

  createSecondaryBeamsInRegion(context) {
    if (!this.isPlanView(context)) {
      context.showMessage?.("Create Secondary Beams solo funciona en planta", "warning");
      return;
    }

    const bays = this.getBaysInsideRegion(context);

    if (!bays.length) {
      context.showMessage?.("No hay paños de grilla dentro de la región", "warning");
      return;
    }

    let created = 0;

    bays.forEach((bay) => {
      const segments = this.getSecondaryBeamSegmentsForBay(context, bay);

      segments.forEach((segment) => {
        const ok = this.createSecondaryBeam(context, segment.p1, segment.p2, true);

        if (ok) created++;
      });
    });

    if (created > 0) {
      context.showMessage?.(
        `Se crearon ${created} vigas secundarias | Dir: ${this.direction} | Cantidad por paño: ${this.beamCount}`,
      );
    } else {
      context.showMessage?.("No se crearon vigas nuevas; ya existían", "warning");
    }

    context.redraw?.();
    context.sync3D?.();
  }

  handleMouseDown(event, context, mouse) {
    if (isMouseButton(event, MOUSE_BUTTONS.MIDDLE)) {
      super.handleMouseDown(event, context, mouse);
      return;
    }

    super.handleMouseDown(...arguments);

    if (!this.isPlanView(context)) {
      context.showMessage?.("Create Secondary Beams solo funciona en planta", "warning");
      return;
    }

    this.isDraggingRegion = true;
    this.regionStart = { x: mouse.x, y: mouse.y };
    this.regionEnd = { x: mouse.x, y: mouse.y };
  }

  handleMouseMove(event, context, mouse) {
    super.handleMouseMove(...arguments);

    if (!this.isDraggingRegion) return;

    this.regionEnd = { x: mouse.x, y: mouse.y };
    context.redraw?.();
  }

  handleMouseUp(event, context, mouse) {
    if (isMouseButton(event, MOUSE_BUTTONS.MIDDLE)) {
      super.handleMouseUp(event, context, mouse);
      return;
    }

    if (!this.isDraggingRegion) return;

    this.regionEnd = { x: mouse.x, y: mouse.y };

    const dx = this.regionEnd.x - this.regionStart.x;
    const dy = this.regionEnd.y - this.regionStart.y;
    const dragDistance = Math.sqrt(dx * dx + dy * dy);

    if (dragDistance <= this.dragThreshold) {
      this.createSecondaryBeamAtClick(context, mouse);
    } else {
      this.createSecondaryBeamsInRegion(context);
    }

    this.isDraggingRegion = false;
    this.regionStart = null;
    this.regionEnd = null;

    context.redraw?.();
    context.sync3D?.();
  }

  handleKeyDown(event, context) {
    if (event.key === "Escape") {
      this.isDraggingRegion = false;
      this.regionStart = null;
      this.regionEnd = null;

      context.setState(context.idleState);
      context.redraw?.();
      return;
    }

    if (event.key.toLowerCase() === "r") {
      this.direction = this.direction === "X" ? "Y" : "X";
      context.showMessage?.(`Dirección de vigas secundarias: ${this.direction}`);
      context.redraw?.();
      return;
    }

    if (event.key === "+" || event.key === "=") {
      this.beamCount++;
      context.showMessage?.(`Cantidad de vigas secundarias por paño: ${this.beamCount}`);
      return;
    }

    if (event.key === "-") {
      this.beamCount = Math.max(1, this.beamCount - 1);
      context.showMessage?.(`Cantidad de vigas secundarias por paño: ${this.beamCount}`);
      return;
    }

    super.handleKeyDown(event, context);
  }

  draw(renderer, context) {
    if (!this.isDraggingRegion || !this.regionStart || !this.regionEnd) {
      return;
    }

    const ctx = context.ctx;
    const rect = this.getRegionRect();

    if (!ctx || !rect) return;

    ctx.save();

    ctx.setLineDash([6, 4]);
    ctx.strokeStyle = "#38bdf8";
    ctx.lineWidth = 1.5;

    ctx.strokeRect(rect.left, rect.top, rect.right - rect.left, rect.bottom - rect.top);

    ctx.fillStyle = "rgba(56, 189, 248, 0.12)";
    ctx.fillRect(rect.left, rect.top, rect.right - rect.left, rect.bottom - rect.top);

    ctx.restore();
  }

  info() {
    return `Create Secondary Beams: clic dentro de un paño o arrastra una región. Dirección: ${this.direction}. Cantidad por paño: ${this.beamCount}. R cambia dirección. + / - cambia cantidad.`;
  }
}

export class ReferencePointDrawingState extends PanAndZoomState {
  constructor(context) {
    super();
    this.context = context;
  }

  handleMouseDown(event, context, mouse) {
    if (isMouseButton(event, MOUSE_BUTTONS.MIDDLE)) {
      super.handleMouseDown(event, context, mouse);
      return;
    }

    super.handleMouseDown(...arguments);

    const view = context.viewSet?.[context.activeViewIndex];
    const worldPos = context.grid.screenToWorld(mouse);
    const snapPoint = context.activeGridPoint ?? null;

    let x, y, z;

    if (snapPoint) {
      x = snapPoint.x;
      y = snapPoint.y;
      z = snapPoint.z;
    } else if (view?.type === "elevation" && view.axis === "X") {
      // plano Y-Z con X fijo
      x = view.value ?? 0;
      y = worldPos.x;
      z = worldPos.y;
    } else if (view?.type === "elevation" && view.axis === "Y") {
      // plano X-Z con Y fijo
      x = worldPos.x;
      y = view.value ?? 0;
      z = worldPos.y;
    } else {
      // planta
      const currentZ = context.getActivePlanElevation?.() ?? context.getCurrentZ?.() ?? 0;
      x = worldPos.x;
      y = worldPos.y;
      z = currentZ;
    }

    const point = {
      id: context.referencePoints.length + 1,
      x,
      y,
      z,
      label: `RP${context.referencePoints.length + 1}`,
      visible: true,
    };

    context.referencePoints.push(point);

    console.log(`📌 Punto de referencia creado: ${point.label} en (${x.toFixed(2)}, ${y.toFixed(2)}, ${z.toFixed(2)})`);

    context.redraw();
    context.sync3D?.();
  }

  info() {
    return "Haz clic para crear puntos de referencia. Usa Esc para salir.";
  }
}

export class AreaDrawingState extends PanAndZoomState {
  constructor(context, areaType = "slab") {
    super();
    this.context = context;
    this.areaType = areaType; // slab | wall | opening
    this.points = [];
    this.previewPoint = null;
    this.previewArea = null;
  }

  resetPreview() {
    this.points = [];
    this.previewPoint = null;
    this.previewArea = null;
  }

  buildPreviewArea(context) {
    if (!this.points.length) {
      this.previewArea = null;
      return;
    }

    const currentZ = context.getActivePlanElevation?.() ?? context.getCurrentZ?.() ?? 0;
    const area = new Area(this.areaType, currentZ);

    this.points.forEach((p) => area.addPoint(p));

    if (this.previewPoint) {
      area.addPoint(this.previewPoint);
    }

    this.previewArea = area;
  }

  getSnapPoint(context, mouse) {
    const worldPos = context.grid.screenToWorld(mouse);
    const snapped = context.getCurrentSnapPoint(worldPos);

    // Modo Ortho (F8, como AutoCAD) con tracking de esquina: bloquea el
    // punto a 0°/90°/180°/270°, evaluando TODAS las combinaciones posibles
    // entre el último punto y el de inicio — no solo "horizontal o
    // vertical desde UN ancla", sino también la ESQUINA que mezcla el eje X
    // de un ancla con el eje Y de la otra. Esa combinación es justo lo que
    // hace falta para que el lado de CIERRE de una zapata rectangular salga
    // recto: su X debe coincidir con el inicio (cierre vertical) mientras
    // su Y sigue al último punto (continuación horizontal del lado
    // anterior) — un solo ancla nunca puede dar eso a la vez. Se usa el
    // candidato más cercano a hacia dónde realmente apunta el mouse (sin
    // desviación diagonal). Por ahora solo para zapatas (pedido del cliente
    // para dibujarlas simétricas a mano); el resto de áreas (losa, muro)
    // sigue con ángulo libre.
    if (this.areaType === "zapata" && context.options?.orthoMode && this.points.length > 0) {
      const last = this.points[this.points.length - 1];
      const first = this.points[0];

      const candidates = [
        { ...snapped, y: last.y },             // horizontal desde el último punto
        { ...snapped, x: last.x },             // vertical desde el último punto
        { ...snapped, y: first.y },            // horizontal desde el inicio
        { ...snapped, x: first.x },            // vertical desde el inicio
        { ...snapped, x: first.x, y: last.y }, // esquina de cierre: X inicio + Y último
        { ...snapped, x: last.x, y: first.y }, // esquina de cierre: X último + Y inicio
      ];

      candidates.sort((a, b) => pointDistance(snapped, a) - pointDistance(snapped, b));

      return candidates[0];
    }

    return snapped;
  }

  handleMouseDown(event, context, mouse) {
    if (isMouseButton(event, MOUSE_BUTTONS.MIDDLE)) {
      super.handleMouseDown(event, context, mouse);
      return;
    }

    super.handleMouseDown(...arguments);

    const view = context.viewSet?.[context.activeViewIndex];

    // Primera versión: solo planta
    if (view?.type !== "plan") {
      context.showMessage?.("Por ahora las áreas solo se dibujan en planta.", "warning");
      return;
    }

    // Clic cerca del punto de inicio: mismo criterio que "encontrar un nodo
    // existente" al dibujar barras (closestNodeAtActiveView en
    // mixins/edit/model-factory.js, tolerancia de 10px en pantalla) — en
    // vez de agregar un vértice casi duplicado, unifica ahí mismo y cierra
    // el polígono. Por ahora solo para zapatas (mismo alcance que Ortho).
    if (this.areaType === "zapata" && this.points.length >= 3) {
      const startScreen = context.grid.worldToScreen(this.points[0]);

      if (pointDistance(mouse, startScreen) <= 10) {
        this._commitArea(context);
        context.showMessage?.("Zapata cerrada en el punto de inicio.", "success");
        return;
      }
    }

    const snapPoint = this.getSnapPoint(context, mouse);

    // Evitar repetir exactamente el mismo punto
    const last = this.points[this.points.length - 1];
    if (
      last &&
      Math.abs(last.x - snapPoint.x) < 1e-6 &&
      Math.abs(last.y - snapPoint.y) < 1e-6 &&
      Math.abs(last.z - snapPoint.z) < 1e-6
    ) {
      return;
    }

    this.points.push({ ...snapPoint });
    this.previewPoint = { ...snapPoint };
    this.buildPreviewArea(context);
    context.redraw();
  }

  handleMouseMove(event, context, mouse) {
    super.handleMouseMove(...arguments);

    if (!this.points.length) return;

    const view = context.viewSet?.[context.activeViewIndex];
    if (view?.type !== "plan") return;

    this.previewPoint = this.getSnapPoint(context, mouse);
    this.buildPreviewArea(context);

    if (this.areaType === "zapata") {
      this._updateZapataDistanceInput(context);
    }

    context.redraw();
  }

  // Mismo mecanismo que ya usan las barras (context.distanceInput, input
  // real flotante — ver #distance en cad-area.blade.php): se mantiene
  // siempre visible con la distancia en vivo desde el último punto,
  // pudiendo escribirse encima para un lado exacto (Enter la confirma vía
  // commitZapataLengthInput). Nada de teclas para activarlo — igual que en
  // Safecito/Cimentación 2.0 y en el dibujo de barras de este mismo CAD.
  // Solo para zapata — el resto de áreas (Losa/Muro/Opening) es de otro
  // desarrollador del equipo, no se toca.
  _updateZapataDistanceInput(context) {
    if (!context.distanceInput) return;

    const last = this.points[this.points.length - 1];
    const current = this.previewPoint || last;

    const dx = current.x - last.x;
    const dy = current.y - last.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (!(distance > 0.001)) return;

    const p1 = context.currentRenderer?.projectPoint
      ? context.currentRenderer.projectPoint({ position: last }, context)
      : context.grid.worldToScreen(last);
    const p2 = context.currentRenderer?.projectPoint
      ? context.currentRenderer.projectPoint({ position: current }, context)
      : context.grid.worldToScreen(current);

    const mid = { x: (p1.x + p2.x) / 2, y: (p1.y + p2.y) / 2 };

    context.distanceInput.style.left = `${mid.x + 20}px`;
    context.distanceInput.style.top = `${mid.y - 20}px`;
    context.distanceInput.value = context.formatOutput
      ? context.formatOutput(distance, "lengths")
      : distance.toFixed(2);
  }

  // Finaliza el área en progreso: la guarda en context.areas y refresca 2D + 3D.
  _commitArea(context) {
    if (this.points.length < 3) return false;

    const currentZ = context.getActivePlanElevation?.() ?? context.getCurrentZ?.() ?? 0;
    const area = new Area(this.areaType, currentZ);

    this.points.forEach((p) => area.addPoint(p));
    area.id = context.areas.length + 1;

    context.areas.push(area);
    console.log(`▭ Área creada ID: ${area.id}, tipo: ${this.areaType}, puntos: ${area.points.length}, z: ${currentZ}`);

    this.resetPreview();
    context.redraw();
    context.sync3D?.(); // mostrar el área en el modelo 3D
    return true;
  }

  // Dirección del próximo lado bloqueada al eje 0°/90°/180°/270° más cercano
  // a hacia dónde apunta el mouse ahora mismo, respecto al último punto —
  // igual criterio que el Ortho normal, pero como VECTOR unitario (no un
  // punto) para poder multiplicarlo por la distancia del input flotante.
  // Solo para zapata.
  _getZapataLengthDirection(context) {
    const last = this.points[this.points.length - 1];
    const mouseWorld = context.mousePos || last;
    const dx = mouseWorld.x - last.x;
    const dy = mouseWorld.y - last.y;

    if (Math.abs(dx) >= Math.abs(dy)) {
      return { dx: dx >= 0 ? 1 : -1, dy: 0 };
    }

    return { dx: 0, dy: dy >= 0 ? 1 : -1 };
  }

  // Imán de cierre: la longitud tecleada solo fija UN punto respecto al
  // ÚLTIMO punto (dirección horizontal o vertical) — a diferencia del clic
  // normal (getSnapPoint), no sabe nada del punto de INICIO. Si el punto
  // resultante queda cerca (en píxeles de pantalla, mismo margen que el
  // cierre por clic) de la esquina que lo alinearía en 90° también con el
  // inicio, se ajusta exacto ahí — así el lado de cierre sale recto con el
  // 1er punto, no solo con el anterior, tecleando o no.
  _magnetToStartCorner(context, point, direction) {
    if (this.areaType !== "zapata" || this.points.length < 2) return point;

    const first = this.points[0];
    const corner = direction.dy === 0
      ? { ...point, x: first.x } // veníamos horizontal desde el último punto → probar X del inicio
      : { ...point, y: first.y }; // veníamos vertical desde el último punto → probar Y del inicio

    const pointScreen = context.grid.worldToScreen(point);
    const cornerScreen = context.grid.worldToScreen(corner);

    return pointDistance(pointScreen, cornerScreen) <= 10 ? corner : point;
  }

  // Confirmado desde el input real #distance (cad-area.blade.php,
  // @keyup.enter) — mismo mecanismo que trussDrawingState.createBeam: toma
  // lo que haya en context.distanceInput.value (la distancia en vivo, o lo
  // que el usuario haya escrito encima) y agrega el punto en esa dirección.
  commitZapataLengthInput(context) {
    const length = parseFloat(context.distanceInput?.value);

    if (!Number.isFinite(length) || length <= 0) {
      return;
    }

    const last = this.points[this.points.length - 1];
    const direction = this._getZapataLengthDirection(context);

    const newPoint = this._magnetToStartCorner(
      context,
      {
        x: last.x + direction.dx * length,
        y: last.y + direction.dy * length,
        z: last.z || 0,
      },
      direction
    );

    this.points.push(newPoint);
    this.previewPoint = { ...newPoint };
    this.buildPreviewArea(context);

    // Limpiar y quitar el foco del recuadro: si quedara el número viejo y
    // el foco puesto, el próximo dígito se pegaría al anterior en vez de
    // reemplazarlo — así el "dynamic input" queda listo para el siguiente
    // lado con solo teclear, sin arrastrar el valor anterior.
    if (context.distanceInput) {
      context.distanceInput.value = "";
      context.distanceInput.blur();
    }

    context.redraw();
    context.showMessage?.(
      `Lado de ${length.toFixed(2)} m agregado. Sigue marcando, o cierra cerca del punto de inicio.`,
      "success"
    );
  }

  handleKeyDown(event, context) {
    // "Dynamic input" estilo AutoCAD: apenas empiezas a teclear un número
    // (sin haber hecho clic dentro del recuadro), se activa el input de
    // distancia solo, con ese primer dígito ya puesto — para escribir la
    // distancia exacta sin frenar a apuntar-y-clicar en el recuadro cada
    // vez. Dirección = hacia donde apunte el mouse en ese momento (igual
    // que siempre, ver _getZapataLengthDirection). Solo para zapata — el
    // resto de áreas (Losa/Muro/Opening) es de otro desarrollador del
    // equipo, no se toca.
    if (
      this.areaType === "zapata" &&
      this.points.length > 0 &&
      context.distanceInput &&
      document.activeElement !== context.distanceInput &&
      /^[0-9.]$/.test(event.key)
    ) {
      event.preventDefault();
      context.distanceInput.value = event.key;
      context.distanceInput.focus();
      return;
    }

    if (event.key === "F8" && this.areaType === "zapata") {
      event.preventDefault();
      context.options.orthoMode = !context.options.orthoMode;
      context.showMessage?.(
        context.options.orthoMode ? "Ortho activado (F8)." : "Ortho desactivado (F8).",
        "info"
      );
      this.buildPreviewArea(context);
      context.redraw();
      return;
    }

    if (event.key === "Escape") {
      // No perder el trabajo: si hay un área válida (≥3 puntos), finalizarla
      // antes de salir; si no, cancelar.
      if (this.points.length >= 3) {
        this._commitArea(context);
        context.showMessage?.("Área creada.", "success");
      } else {
        this.resetPreview();
        context.redraw();
      }
      context.setState(context.idleState);
      return;
    }

    if (event.key === "Backspace") {
      // Si el foco está en el input de distancia, que edite el número —
      // no borrar el último vértice del polígono.
      if (context.distanceInput && document.activeElement === context.distanceInput) return;

      event.preventDefault();
      if (this.points.length > 0) {
        this.points.pop();
        this.buildPreviewArea(context);
        context.redraw();
      }
      return;
    }

    if (event.key === "Enter") {
      // Si el input de distancia flotante tiene el foco, su propio
      // @keyup.enter ya agregó el punto (commitZapataLengthInput) — no
      // cerrar el polígono además.
      if (context.distanceInput && document.activeElement === context.distanceInput) return;

      if (this.points.length < 3) {
        context.showMessage?.("Se necesitan al menos 3 puntos para crear un área.", "warning");
        return;
      }
      this._commitArea(context);
      context.showMessage?.("Área creada. Sigue marcando vértices para otra, o Esc para salir.", "success");
      return;
    }
  }

  draw(renderer, context) {
    // El preview del polígono (incluida la medida del lado en curso) ya se
    // dibuja desde renderer.drawAreaPreview(context) — nada más que hacer
    // acá; la distancia editable vive en el input real #distance.
  }

  info() {
    if (this.points.length === 0) {
      return "Haz clic para empezar a dibujar el área.";
    }

    if (this.areaType === "zapata") {
      return "Clic para marcar vértices, o escribe la distancia exacta y Enter. Enter/Esc = cerrar, Backspace = borrar último punto, F8 = Ortho.";
    }

    return "Haz clic para seguir marcando vértices. Enter o Esc = cerrar área, Backspace = borrar último punto.";
  }
}

export class DimensionLineDrawingState extends PanAndZoomState {
  constructor(context) {
    super();
    this.context = context;
    this.startPoint = null;
    this.previewPoint = null;
  }

  handleMouseDown(event, context, mouse) {
    if (isMouseButton(event, MOUSE_BUTTONS.MIDDLE)) {
      super.handleMouseDown(event, context, mouse);
      return;
    }

    super.handleMouseDown(...arguments);

    const worldPos = context.grid.screenToWorld(mouse);
    const snapPoint = context.getCurrentSnapPoint(worldPos);

    if (!this.startPoint) {
      this.startPoint = { ...snapPoint };
      this.previewPoint = { ...snapPoint };
      context.redraw();
      return;
    }

    const endPoint = { ...snapPoint };

    const samePoint =
      Math.abs(this.startPoint.x - endPoint.x) < 1e-6 &&
      Math.abs(this.startPoint.y - endPoint.y) < 1e-6 &&
      Math.abs(this.startPoint.z - endPoint.z) < 1e-6;

    if (samePoint) return;

    const dx = endPoint.x - this.startPoint.x;
    const dy = endPoint.y - this.startPoint.y;
    const dz = endPoint.z - this.startPoint.z;
    const distance = Math.sqrt(dx * dx + dy * dy + dz * dz);

    context.dimensionLines.push({
      id: context.dimensionLines.length + 1,
      start: { ...this.startPoint },
      end: { ...endPoint },
      value: distance,
      // label: `${distance.toFixed(2)} m`,
      label: `${context.formatOutput ? context.formatOutput(distance, "lengths") : distance.toFixed(2)} m`,
      visible: true,
    });

    this.startPoint = null;
    this.previewPoint = null;

    context.redraw();
  }

  handleMouseMove(event, context, mouse) {
    super.handleMouseMove(...arguments);

    if (!this.startPoint) return;

    const worldPos = context.grid.screenToWorld(mouse);
    this.previewPoint = context.getCurrentSnapPoint(worldPos);
    context.redraw();
  }

  handleKeyDown(event, context) {
    if (event.key === "Escape") {
      if (this.startPoint) {
        this.startPoint = null;
        this.previewPoint = null;
        context.redraw();
        return;
      }
      context.setState(context.idleState);
    }
  }

  info() {
    if (this.startPoint) {
      return "Selecciona el segundo punto de la dimensión. Usa Esc para cancelar.";
    }
    return "Haz clic en el primer punto de la dimensión.";
  }
}

export class TrussDrawingState3D extends PanAndZoomState {
  constructor(context) {
    super();
    this.context = context;
    this.shape = null;
    this.currentPlane = "XZ"; // XZ = plano horizontal (como 2D)
    this.showCoordinates = true;
    this.snapToGrid3D = true;
    this.gridSize3D = 1;
  }

  enter(args) {
    super.enter(args);
    this.shape = new Beam(this.context.globalE, this.context.globalA);
    // Mostrar panel de coordenadas 3D
    this.show3DCoordinatesPanel();
  }

  exit() {
    super.exit();
    this.shape = null;
    this.hide3DCoordinatesPanel();
  }

  show3DCoordinatesPanel() {
    if (!this.coordsPanel) {
      this.coordsPanel = document.createElement("div");
      this.coordsPanel.id = "coords3d-panel";
      this.coordsPanel.style.cssText = `
        position: fixed;
        bottom: 20px;
        right: 20px;
        background: rgba(0,0,0,0.8);
        color: #0f0;
        font-family: monospace;
        font-size: 12px;
        padding: 8px 12px;
        border-radius: 6px;
        border-left: 3px solid #00ff00;
        z-index: 1000;
        pointer-events: none;
      `;
      document.body.appendChild(this.coordsPanel);
    }
    this.coordsPanel.style.display = "block";
  }

  hide3DCoordinatesPanel() {
    if (this.coordsPanel) {
      this.coordsPanel.style.display = "none";
    }
  }

  updateCoordinatesPanel(x, y, z, plane) {
    if (this.coordsPanel) {
      this.coordsPanel.innerHTML = `
        📍 Posición 3D:<br>
        X: ${x.toFixed(2)} | Y: ${y.toFixed(2)} | Z: ${z.toFixed(2)}<br>
        🎯 Plano: ${plane} | 🟢 Snap: ${this.snapToGrid3D ? "ON" : "OFF"}<br>
        🔧 Grid: ${this.gridSize3D}m
      `;
    }
  }

  handleMouseDown(event, context, mouse) {
    if (!context.canSelectInCurrentView()) {
      context.clearAllSelections();
      context.setState(context.idleState);
      return;
    }

    super.handleMouseDown(...arguments);

    if (isMouseButton(event, MOUSE_BUTTONS.MIDDLE)) {
      return;
    }

    const selectedNode = context.closestNodeAtActiveView(mouse);
    if (selectedNode) {
      context.setState(context.selectedNodesState, {
        selectedNodes: [selectedNode],
      });
      return;
    }

    const selectedBeam = context.closestBeamAtActiveView(mouse);
    if (selectedBeam) {
      context.setState(context.selectedBeamsState, {
        selectedBeams: [selectedBeam],
      });
      return;
    }

    context.clearAllSelections();
    context.setState(context.idleState);
  }

  findNearbyNode(context, x, y, z, radius = 0.5) {
    return context.nodes.find((node) => {
      const dx = Math.abs(node.position.x - x);
      const dy = Math.abs((node.position.y || 0) - y);
      const dz = Math.abs((node.position.z || 0) - z);
      return dx <= radius && dy <= radius && dz <= radius;
    });
  }

  get3DPosition(worldPos) {
    let x = worldPos.x;
    let y = 0;
    let z = 0;

    switch (this.currentPlane) {
      case "XZ": // Plano horizontal (como 2D) - Y=0
        x = worldPos.x;
        z = worldPos.y;
        y = 0;
        break;
      case "XY": // Plano frontal - Z=0
        x = worldPos.x;
        y = worldPos.y;
        z = 0;
        break;
      case "YZ": // Plano lateral - X=0
        y = worldPos.x;
        z = worldPos.y;
        x = 0;
        break;
    }

    return { x, y, z };
  }

  handleMouseMove(event, context, mouse) {
    // Pan mode
    if (this.isDragging) {
      super.handleMouseMove(event, context, mouse);
      return;
    }

    // Obtener posición 3D actual
    const worldPos = context.grid.screenToWorld(mouse);
    let { x, y, z } = this.get3DPosition(worldPos);

    // Aplicar snap al grid
    if (this.snapToGrid3D) {
      x = Math.round(x / this.gridSize3D) * this.gridSize3D;
      y = Math.round(y / this.gridSize3D) * this.gridSize3D;
      z = Math.round(z / this.gridSize3D) * this.gridSize3D;
    }

    // Actualizar panel de coordenadas
    this.updateCoordinatesPanel(x, y, z, this.currentPlane);

    // Mostrar distancia de preview
    const last_point = this.shape?.node1?.position;
    if (last_point && context.distanceInput) {
      const dx = x - last_point.x;
      const dy = y - (last_point.y || 0);
      const dz = z - (last_point.z || 0);
      const distance = Math.sqrt(dx * dx + dy * dy + dz * dz);

      const screenPos = { x: mouse.x, y: mouse.y };
      context.distanceInput.style.top = screenPos.y + "px";
      context.distanceInput.style.left = screenPos.x + "px";
      context.distanceInput.value = distance.toFixed(2);
    }

    // Actualizar cursor
    context.setCursor("crosshair");
  }

  handleKeyDown(event, context) {
    super.handleKeyDown(event, context);

    // Cambiar plano de dibujo
    if (event.key === "1") {
      this.currentPlane = "XZ";
      this.showMessage("📐 Plano XZ (Horizontal) - X→, Z↗, Y=0");
    } else if (event.key === "2") {
      this.currentPlane = "XY";
      this.showMessage("📐 Plano XY (Frontal) - X→, Y↑, Z=0");
    } else if (event.key === "3") {
      this.currentPlane = "YZ";
      this.showMessage("📐 Plano YZ (Lateral) - Y↑, Z↗, X=0");
    }

    // Toggle snap al grid
    if (event.key === "s") {
      this.snapToGrid3D = !this.snapToGrid3D;
      this.showMessage(`🟢 Snap al grid: ${this.snapToGrid3D ? "ON" : "OFF"}`);
    }

    // Cambiar tamaño del grid
    if (event.key === "g") {
      this.gridSize3D = this.gridSize3D === 1 ? 0.5 : this.gridSize3D === 0.5 ? 0.25 : 1;
      this.showMessage(`📏 Tamaño del grid: ${this.gridSize3D}m`);
    }
  }

  showMessage(message) {
    const toast = document.createElement("div");
    toast.textContent = message;
    toast.style.cssText = `
      position: fixed;
      bottom: 100px;
      right: 20px;
      background: #3b82f6;
      color: white;
      padding: 8px 16px;
      border-radius: 8px;
      font-size: 12px;
      font-family: monospace;
      z-index: 1001;
      animation: fadeOut 2s ease forwards;
    `;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 2000);
  }

  draw(renderer, context) {
    // Dibujar línea de preview en 2D
    if (this.shape && this.shape.node1 && context.ctx) {
      const p1 = context.grid.worldToScreen(this.shape.node1.position);
      const p2 = context.grid.worldToScreen(context.mousePos);
      context.ctx.save();
      context.ctx.strokeStyle = "#88aaff";
      context.ctx.setLineDash([5, 5]);
      context.ctx.lineWidth = 2;
      context.ctx.beginPath();
      context.ctx.moveTo(p1.x, p1.y);
      context.ctx.lineTo(p2.x, p2.y);
      context.ctx.stroke();
      context.ctx.restore();
    }
  }

  info() {
    const planeNames = {
      XZ: "XZ (Horizontal - como 2D)",
      XY: "XY (Frontal)",
      YZ: "YZ (Lateral)",
    };
    return `✏️ DIBUJO 3D | Plano: ${planeNames[this.currentPlane]} | Snap: ${this.snapToGrid3D ? "ON" : "OFF"} | Grid: ${this.gridSize3D}m | Teclas: 1,2,3 (planos) | S (snap) | G (grid)`;
  }
}