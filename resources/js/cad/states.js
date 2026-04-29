import { Beam, Node as StructuralNode, Shape, Area } from "./shapes.js";
import { pointDistance, removeFromArray } from "./utils.js";
import { MOUSE_BUTTONS, isMouseButton } from "./utils.js";

export class StateBase {
  constructor() { }
  handleMouseWheel(event, context, mouse) { }
  handleMouseClick(event, context, mouse) { }
  handleMouseDown(event, context, mouse) { }
  handleMouseMove(event, context, mouse) { }
  handleMouseUp(event, context, mouse) { }
  handleMouseEnter(event, context, mouse) { }
  handleMouseLeave(event, context, mouse) { }
  handleKeyDown(event, context) {
    if (event.key === "Escape") {
      context.setState(context.idleState);
    }
  }
  enter(args) { }
  exit() { }
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

    context.nodes.forEach((n) => n.style.default());
    context.shapes.forEach((s) => s.style.default());

    let selectedObject = context.closestNodeAtActiveView(mouse);

    if (selectedObject) {
      context.setState(context.moveObjectState, {
        selectedObject,
        isMoving: true,
      });
    } else if ((selectedObject = context.closestBeamAtActiveView(mouse))) {
      context.setState(context.selectedBeamsState, {
        selectedBeams: [selectedObject],
      });
    } else if ((selectedObject = context.closestParametric(mouse))) {
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
  handleMouseMove(event, context, mouse) {
    super.handleMouseMove(...arguments);
    let collidedNode = false;
    let collidedBeam = false;
    let collidedParametric = false;
    if (!this.isDragging) {
      context.nodes.forEach((n) => {
        const shortestDistance = 10;
        const distance = pointDistance(mouse, context.grid.worldToScreen(n.position));
        if (distance <= shortestDistance) {
          n.style.hover();
          collidedNode = true;
        } else {
          n.style.default();
        }
      });
      if (collidedNode) {
        context.setCursor("grab");
      } else {
        context.setCursor("crosshair");
      }
      if (!collidedNode) {
        context.shapes.forEach((s) => {
          const shortestDistance = 5;
          const lineLength = pointDistance(
            context.grid.worldToScreen(s.node1.position),
            context.grid.worldToScreen(s.node2.position),
          );
          const d1 = pointDistance(context.grid.worldToScreen(s.node1.position), mouse);
          const d2 = pointDistance(context.grid.worldToScreen(s.node2.position), mouse);
          if (d1 + d2 >= lineLength - shortestDistance && d1 + d2 <= lineLength + shortestDistance) {
            collidedBeam = true;
            s.style.hover();
          } else {
            s.style.default();
          }
        });
        if (collidedBeam) {
          context.setCursor("pointer");
        } else {
          context.setCursor("crosshair");
        }
      }
      if (!collidedBeam && !collidedNode) {
        context.parametricModels.find((p) => {
          p.nodes.find((n) => {
            const shortestDistance = 10;
            const distance = pointDistance(mouse, context.grid.worldToScreen(n.position));
            if (distance <= shortestDistance) {
              collidedParametric = true;
            }
            return collidedParametric;
          });
          p.shapes.find((s) => {
            const shortestDistance = 5;
            const lineLength = pointDistance(
              context.grid.worldToScreen(s.node1.position),
              context.grid.worldToScreen(s.node2.position),
            );
            const d1 = pointDistance(context.grid.worldToScreen(s.node1.position), mouse);
            const d2 = pointDistance(context.grid.worldToScreen(s.node2.position), mouse);
            if (d1 + d2 >= lineLength - shortestDistance && d1 + d2 <= lineLength + shortestDistance) {
              collidedParametric = true;
            }
            return collidedParametric;
          });
          if (collidedParametric) {
            p.hover();
          } else {
            p.default();
          }
          return collidedParametric;
        });
        if (collidedParametric) {
          context.setCursor("pointer");
        } else {
          context.setCursor("crosshair");
        }
      }
    }
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
      let selectedObject = context.closestNodeAtActiveView(mouse);

      if (selectedObject) {
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

  enter(args) {
    this.selectedObjects = args.selectedObjects;
    this.selectedObjects.forEach((n) => {
      n.style.selected();
    });
  }

  exit() {
    super.exit();
    this.selectedObjects.forEach((n) => {
      n.style.default();
    });
  }

  info() {
    return 'Edita sus propiedades desde el menú o presiona "Supr" para eliminar.';
  }
}

export class SelectedBeamsState extends SelectedObjectsState {
  handleKeyDown(event, context) {
    super.handleKeyDown(...arguments);

    if (event.key === "Delete") {
      console.log(`🗑️ Eliminando ${this.selectedObjects.length} vigas`);

      // 🔥 Eliminar directamente lo seleccionado (SIN FILTRO)
      const beamsToDelete = [...this.selectedObjects];

      beamsToDelete.forEach((beam) => {
        if (!beam.node1 || !beam.node2) return;

        removeFromArray(beam.node1.beams, beam);
        removeFromArray(beam.node2.beams, beam);
        removeFromArray(context.shapes, beam);
      });

      // 🔄 Reindexar IDs
      context.shapes.forEach((beam, index) => {
        beam.id = index + 1;
      });

      context.setState(context.idleState);
      context.sync3D();
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
      const areasToDelete = [...this.selectedObjects];

      areasToDelete.forEach((area) => {
        removeFromArray(context.areas, area);
      });

      context.areas.forEach((area, index) => {
        area.id = index + 1;
      });

      context.setState(context.idleState);
      context.redraw();
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
      const dimsToDelete = [...this.selectedObjects];

      dimsToDelete.forEach((dim) => {
        removeFromArray(context.dimensionLines, dim);
      });

      context.dimensionLines.forEach((dim, index) => {
        dim.id = index + 1;
        if (!dim.label || dim.label.startsWith("DIM")) {
          dim.label = `${dim.value.toFixed(2)} m`;
        }
      });

      context.setState(context.idleState);
      context.redraw();
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

    this.selectedNode = null;          // para barras
    this.selectedVertexIndex = null;   // para áreas

    this.isMoving = false;
  }

  enter(args = {}) {
    this.selectedBeam = args.selectedBeam || null;
    this.selectedArea = args.selectedArea || null;

    this.selectedNode = null;
    this.selectedVertexIndex = null;
    this.isMoving = false;

    if (this.selectedBeam?.style) {
      this.selectedBeam.style.selected();
    }

    if (this.selectedArea) {
      this.selectedArea.selected = true;
    }
  }

  exit() {
    super.exit();

    if (this.selectedBeam?.style) {
      this.selectedBeam.style.default();
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
      // borrar barra
      if (this.selectedBeam) {
        removeFromArray(this.selectedBeam.node1.beams, this.selectedBeam);
        removeFromArray(this.selectedBeam.node2.beams, this.selectedBeam);
        removeFromArray(context.shapes, this.selectedBeam);

        context.shapes.forEach((beam, index) => {
          beam.id = index + 1;
        });

        context.setState(context.idleState);
        context.sync3D?.();
        return;
      }

      // borrar área
      if (this.selectedArea) {
        removeFromArray(context.areas, this.selectedArea);

        context.areas.forEach((area, index) => {
          area.id = index + 1;
        });

        context.setState(context.idleState);
        context.redraw();
        return;
      }
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
      console.log(`🗑️ Eliminando ${this.selectedObjects.length} nodos`);

      this.selectedObjects.forEach((node) => {
        if (!node) return;

        // 🔥 COPIA SEGURA
        const beamsToDelete = [...node.beams];

        beamsToDelete.forEach((beam) => {
          const otherNode = node === beam.node1 ? beam.node2 : beam.node1;
          removeFromArray(otherNode.beams, beam);
          removeFromArray(context.shapes, beam);
        });

        // limpiar beams del nodo
        node.beams = [];

        removeFromArray(context.nodes, node);
      });

      // 🔄 Reindexar nodos
      context.nodes.forEach((node, index) => {
        node.id = index + 1;
      });

      // 🔄 Reindexar vigas también (importante)
      context.shapes.forEach((beam, index) => {
        beam.id = index + 1;
      });

      context.setState(context.idleState);
      context.sync3D();
      context.redraw();
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

        const p1 = context.grid.worldToScreen(b.node1.position);
        const p2 = context.grid.worldToScreen(b.node2.position);
        const collided = pointRect(p1, start, end) && pointRect(p2, start, end);

        if (collided) b.style.hover();
        else b.style.default();

        return collided;
      });
    } else {
      this.selectedNodes = context.nodes.filter((n) => {
        if (!context.currentRenderer.shouldDrawNode(n, context)) return false;

        const position = context.grid.worldToScreen(n.position);
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

  handleKeyDown(event, context) {
    super.handleKeyDown(...arguments);
    if (event.key === "Delete") {
      this.selectedObject.beams.forEach((beam) => {
        const updateBeamsNode = this.selectedObject === beam.node1 ? beam.node2 : beam.node1;
        removeFromArray(updateBeamsNode.beams, beam);
      });
      this.selectedObject.beams.forEach((beam) => {
        removeFromArray(context.shapes, beam);
      });
      removeFromArray(context.nodes, this.selectedObject);
      context.nodes.forEach((node, index) => {
        node.id = index + 1;
      });
      context.setState(context.idleState);
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
    this.selectedObject.style.selected();
    this.isMoving = args.isMoving ?? true;
  }
  exit() {
    super.exit();
    if (this.selectedObject) {
      this.selectedObject.style.default();
    }
    // this.selectedObject = null;
    this.isMoving = false;
  }
  info() {
    return 'Edita sus propiedades desde el menú o presiona "Supr" para eliminar.';
  }
}

export class TrussDrawingState extends PanAndZoomState {
  constructor(context, elementType = "beam") {
    super();
    this.context = context;
    this.elementType = elementType;
    this.shape = new Beam(this.context.globalE, this.context.globalA);
    this.shape.elementType = this.elementType;
  }

  handleMouseDown(event, context, mouse) {
    if (isMouseButton(event, MOUSE_BUTTONS.MIDDLE)) {
      super.handleMouseDown(event, context, mouse);
      return;
    }

    super.handleMouseDown(...arguments);
    if (isMouseButton(event, MOUSE_BUTTONS.MIDDLE)) {
      return;
    }

    const view = context.viewSet?.[context.activeViewIndex];
    const worldPos = context.grid.screenToWorld(mouse);

    // AHORA el snap aplica en cualquier vista si existe activeGridPoint
    const snapPoint = context.activeGridPoint ?? null;

    let x, y, z;

    if (snapPoint) {
      x = snapPoint.x;
      y = snapPoint.y;
      z = snapPoint.z;

      console.log(
        `🎯 SNAP ${view?.type === "elevation" ? "ELEVACIÓN" : "PLANTA"}: ${snapPoint.label ?? ""} -> (${x.toFixed(2)}, ${y.toFixed(2)}, ${z.toFixed(2)})`
      );
    } else if (view?.type === "elevation" && view.axis === "X") {
      // LETRAS => X fija => plano Y-Z
      const fixedX = view.value ?? 0;
      x = fixedX;
      y = worldPos.x;
      z = worldPos.y;

      console.log(`🖱️ ELEVACIÓN X-${view.label}: (${x.toFixed(2)}, ${y.toFixed(2)}, ${z.toFixed(2)})`);
    } else if (view?.type === "elevation" && view.axis === "Y") {
      // NÚMEROS => Y fija => plano X-Z
      const fixedY = view.value ?? 0;
      x = worldPos.x;
      y = fixedY;
      z = worldPos.y;

      console.log(`🖱️ ELEVACIÓN Y-${view.label}: (${x.toFixed(2)}, ${y.toFixed(2)}, ${z.toFixed(2)})`);
    } else {
      // PLANTA libre, si no hubo snap
      const currentZ = context.getActivePlanElevation?.() ?? context.getCurrentZ?.() ?? 0;
      x = worldPos.x;
      y = worldPos.y;
      z = currentZ;

      console.log(`🖱️ PLANTA LIBRE: (${x.toFixed(2)}, ${y.toFixed(2)}, ${z.toFixed(2)})`);
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
      console.log(`✅ Nodo creado ID: ${node.id} en (${x.toFixed(2)}, ${y.toFixed(2)}, ${z.toFixed(2)})`);
    } else {
      console.log(`🔗 Nodo existente ID: ${node.id}`);
    }

    const isDone = this.shape.addNode(node);
    if (isDone) {
      context.shapes.push(this.shape);
      this.shape.id = context.shapes.length;

      if (this.shape.node1 && this.shape.node1.beams) {
        this.shape.node1.beams.push(this.shape);
      }
      if (this.shape.node2 && this.shape.node2.beams) {
        this.shape.node2.beams.push(this.shape);
      }

      console.log(`📐 Viga creada ID: ${this.shape.id}`);
      this.shape = new Beam(this.context.globalE, this.context.globalA);
      this.shape.elementType = this.elementType;
      this.shape.addNode(node);
    }

    context.redraw();
    context.sync3D();
  }

  handleMouseMove(event, context, mouse) {
    super.handleMouseMove(...arguments);

    const view = context.viewSet?.[context.activeViewIndex];
    const snapPoint = context.activeGridPoint ?? null;
    const last_point = this.shape.node1?.position;

    // Punto actual del preview en coordenadas del MODELO
    let currentPoint;

    if (snapPoint) {
      currentPoint = {
        x: snapPoint.x,
        y: snapPoint.y,
        z: snapPoint.z,
      };
    } else if (view?.type === "elevation" && view.axis === "X") {
      currentPoint = {
        x: view.value ?? 0,
        y: context.mousePos.x,
        z: context.mousePos.y,
      };
    } else if (view?.type === "elevation" && view.axis === "Y") {
      currentPoint = {
        x: context.mousePos.x,
        y: view.value ?? 0,
        z: context.mousePos.y,
      };
    } else {
      currentPoint = {
        x: context.mousePos.x,
        y: context.mousePos.y,
        z: context.getActivePlanElevation?.() ?? context.getCurrentZ?.() ?? 0,
      };
    }

    if (last_point) {
      let distance;

      if (view?.type === "elevation" && view.axis === "X") {
        // plano Y-Z
        const dy = currentPoint.y - last_point.y;
        const dz = currentPoint.z - (last_point.z || 0);
        distance = Math.sqrt(dy * dy + dz * dz);
      } else if (view?.type === "elevation" && view.axis === "Y") {
        // plano X-Z
        const dx = currentPoint.x - last_point.x;
        const dz = currentPoint.z - (last_point.z || 0);
        distance = Math.sqrt(dx * dx + dz * dz);
      } else {
        const dx = currentPoint.x - last_point.x;
        const dy = currentPoint.y - last_point.y;
        distance = Math.sqrt(dx * dx + dy * dy);
      }

      // const mouseScreen =
      //   view?.type === "elevation"
      //     ? context.grid.worldToScreen({
      //       x: context.mousePos.x,
      //       y: context.mousePos.y,
      //     })
      //     : context.grid.worldToScreen(context.mousePos);
      let mouseScreen;

      if (snapPoint) {
        // si existe snap, el preview debe ir al punto snap real
        mouseScreen = context.currentRenderer.projectPoint
          ? context.currentRenderer.projectPoint({ position: currentPoint }, context)
          : context.grid.worldToScreen({ x: context.mousePos.x, y: context.mousePos.y });
      } else if (view?.type === "elevation") {
        mouseScreen = context.grid.worldToScreen({
          x: context.mousePos.x,
          y: context.mousePos.y,
        });
      } else {
        mouseScreen = context.grid.worldToScreen(context.mousePos);
      }

      const lp = context.currentRenderer.projectPoint
        ? context.currentRenderer.projectPoint({ position: last_point }, context)
        : context.grid.worldToScreen(last_point);

      // const unitVec = {
      //   x: (mouseScreen.x - lp.x) / pointDistance(lp, mouseScreen),
      //   y: (mouseScreen.y - lp.y) / pointDistance(lp, mouseScreen),
      // };
      const previewDistance = pointDistance(lp, mouseScreen);
      if (previewDistance < 0.001) return;

      const unitVec = {
        x: (mouseScreen.x - lp.x) / previewDistance,
        y: (mouseScreen.y - lp.y) / previewDistance,
      };

      const perpUnitVec = { x: -unitVec.y, y: unitVec.x };
      const midPoint = { x: (lp.x + mouseScreen.x) * 0.5, y: (lp.y + mouseScreen.y) * 0.5 };
      const mid = {
        x: midPoint.x + perpUnitVec.x * 100,
        y: midPoint.y + perpUnitVec.y * 100,
      };

      context.distanceInput.style.top = mid.y + "px";
      context.distanceInput.style.left = mid.x + "px";
      context.distanceInput.value = distance.toFixed(2);
      context.distanceInput.focus();
      context.distanceInput.select();
    }
  }

  createBeam(context) {
    const view = context.viewSet?.[context.activeViewIndex];
    const last_point = this.shape.node1.position;
    const distance = parseFloat(context.distanceInput.value);

    if (isNaN(distance) || distance <= 0) {
      return;
    }

    let unitVec;
    let newPoint;

    // Si existe snap activo, usarlo directamente
    if (context.activeGridPoint) {
      newPoint = {
        x: context.activeGridPoint.x,
        y: context.activeGridPoint.y,
        z: context.activeGridPoint.z,
      };
    } else if (view?.type === "elevation" && view.axis === "X") {
      // Letras => plano Y-Z
      const dy = context.mousePos.x - last_point.y;
      const dz = context.mousePos.y - (last_point.z || 0);
      const len = Math.sqrt(dy * dy + dz * dz);

      if (len < 0.001) return;

      unitVec = {
        y: dy / len,
        z: dz / len,
      };

      newPoint = {
        x: view.value ?? last_point.x,
        y: last_point.y + unitVec.y * distance,
        z: (last_point.z || 0) + unitVec.z * distance,
      };
    } else if (view?.type === "elevation" && view.axis === "Y") {
      // Números => plano X-Z
      const dx = context.mousePos.x - last_point.x;
      const dz = context.mousePos.y - (last_point.z || 0);
      const len = Math.sqrt(dx * dx + dz * dz);

      if (len < 0.001) return;

      unitVec = {
        x: dx / len,
        z: dz / len,
      };

      newPoint = {
        x: last_point.x + unitVec.x * distance,
        y: view.value ?? last_point.y,
        z: (last_point.z || 0) + unitVec.z * distance,
      };
    } else {
      // Planta
      const currentZ = context.getActivePlanElevation?.() ?? context.getCurrentZ?.() ?? 0;
      const dx = context.mousePos.x - last_point.x;
      const dy = context.mousePos.y - last_point.y;
      const len = Math.sqrt(dx * dx + dy * dy);

      if (len < 0.001) return;

      unitVec = {
        x: dx / len,
        y: dy / len,
      };

      newPoint = {
        x: last_point.x + unitVec.x * distance,
        y: last_point.y + unitVec.y * distance,
        z: currentZ,
      };
    }

    const node = new StructuralNode(
      { x: newPoint.x, y: newPoint.y },
      context.nodes.length + 1,
      newPoint.z
    );

    context.nodes.push(node);

    const isDone = this.shape.addNode(node);
    if (isDone) {
      context.shapes.push(this.shape);
      this.shape.node1.beams.push(this.shape);
      this.shape.node2.beams.push(this.shape);
      this.shape.id = context.shapes.length;

      this.shape = new Beam(context.globalE, context.globalA);
    }

    context.redraw();
    context.sync3D?.();
  }

  exit() {
    super.exit();
    this.shape = new Beam(this.context.globalE, this.context.globalA);
  }
  draw(renderer, context) {
    renderer.drawTrussDrawingState(this, context);
  }
  info() {
    return 'Haz clic para definir el siguiente nodo y presiona "Esc" para finalizarla.';
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

export class ColumnDrawingState extends PanAndZoomState {
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

    const snapPoint = context.activeGridPoint ?? null;
    const currentZ = context.getActivePlanElevation?.() ?? context.getCurrentZ?.() ?? 0;
    const storyHeight = Number(context.referenceGrid?.storyHeight ?? 3);
    const nextZ = currentZ + storyHeight;

    let x, y;

    if (snapPoint) {
      x = snapPoint.x;
      y = snapPoint.y;
    } else {
      const worldPos = context.grid.screenToWorld(mouse);
      x = worldPos.x;
      y = worldPos.y;
    }

    let node1 = context.nodes.find((n) =>
      Math.abs(n.position.x - x) < 0.3 &&
      Math.abs(n.position.y - y) < 0.3 &&
      Math.abs((n.position.z || 0) - currentZ) < 0.1
    );

    if (!node1) {
      node1 = new StructuralNode({ x, y }, context.nodes.length + 1, currentZ);
      context.nodes.push(node1);
    }

    let node2 = context.nodes.find((n) =>
      Math.abs(n.position.x - x) < 0.3 &&
      Math.abs(n.position.y - y) < 0.3 &&
      Math.abs((n.position.z || 0) - nextZ) < 0.1
    );

    if (!node2) {
      node2 = new StructuralNode({ x, y }, context.nodes.length + 1, nextZ);
      context.nodes.push(node2);
    }

    const beam = new Beam(context.globalE, context.globalA);
    beam.elementType = "column";
    beam.addNode(node1);
    beam.addNode(node2);

    context.shapes.push(beam);
    beam.id = context.shapes.length;

    node1.beams.push(beam);
    node2.beams.push(beam);

    console.log(`│ Columna creada ID: ${beam.id}`);

    context.redraw();
    context.sync3D();
  }

  info() {
    return "Haz clic para crear columnas verticales entre niveles.";
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

    console.log(
      `📌 Punto de referencia creado: ${point.label} en (${x.toFixed(2)}, ${y.toFixed(2)}, ${z.toFixed(2)})`
    );

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
    return context.getCurrentSnapPoint(worldPos);
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
    context.redraw();
  }

  handleKeyDown(event, context) {
    if (event.key === "Escape") {
      this.resetPreview();
      context.redraw();
      context.setState(context.idleState);
      return;
    }

    if (event.key === "Backspace") {
      event.preventDefault();
      if (this.points.length > 0) {
        this.points.pop();
        this.buildPreviewArea(context);
        context.redraw();
      }
      return;
    }

    if (event.key === "Enter") {
      if (this.points.length < 3) {
        context.showMessage?.("Se necesitan al menos 3 puntos para crear un área.", "warning");
        return;
      }

      const currentZ = context.getActivePlanElevation?.() ?? context.getCurrentZ?.() ?? 0;
      const area = new Area(this.areaType, currentZ);

      this.points.forEach((p) => area.addPoint(p));
      area.id = context.areas.length + 1;

      context.areas.push(area);

      console.log(
        `▭ Área creada ID: ${area.id}, tipo: ${this.areaType}, puntos: ${area.points.length}`
      );

      this.resetPreview();
      context.redraw();
      return;
    }
  }

  draw(renderer, context) {
    // El preview ya se dibuja desde renderer.drawAreaPreview(context)
  }

  info() {
    if (this.points.length === 0) {
      return "Haz clic para empezar a dibujar el área.";
    }

    return 'Haz clic para seguir marcando vértices. Enter = cerrar área, Backspace = borrar último punto, Esc = cancelar.';
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
      label: `${distance.toFixed(2)} m`,
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

export class CopyState extends StateBase {
  handleMouseDown(event, context, mouse) {
    const cloneShape = closestLine({ x: x, y: y });
    if (cloneShape) {
      handleIsSelected = true;
      shape = structuredClone(cloneShape);
      shape = Object.assign(Object.create(Object.getPrototypeOf(cloneShape)), shape);
      shapes.push(shape);
      selectedObject = shape;
      shape = new Shape(true);
      switchTool(Tools.MOVE);
      canvas.style.cursor = "move";
    }
  }
}

export class EditState extends StateBase {
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
}

export class ChangeSupport extends StateBase {
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

    if (!selectedNode) {
      context.clearAllSelections();
      context.setState(context.idleState);
      return;
    }

    context.setState(context.selectedNodesState, {
      selectedNodes: [selectedNode],
    });
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
