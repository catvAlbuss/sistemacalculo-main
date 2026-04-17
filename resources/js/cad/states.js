import { Beam, Node as StructuralNode, Shape } from "./shapes.js";
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
      this.selectedObjects.forEach((deleteShape) => {
        removeFromArray(deleteShape.node1.beams, deleteShape);
        removeFromArray(deleteShape.node2.beams, deleteShape);
        removeFromArray(context.shapes, deleteShape);
        context.shapes.forEach((beam, index) => {
          beam.id = index + 1;
        });
      });
      context.setState(context.idleState);
    }
  }
  enter(args) {
    super.enter({ selectedObjects: args.selectedBeams });
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
      this.selectedObjects.forEach((deleteShape) => {
        deleteShape.beams.forEach((beam) => {
          const updateBeamsNode = deleteShape === beam.node1 ? beam.node2 : beam.node1;
          removeFromArray(updateBeamsNode.beams, beam);
        });
        deleteShape.beams.forEach((beam) => {
          removeFromArray(context.shapes, beam);
        });
        removeFromArray(context.nodes, deleteShape);
        context.nodes.forEach((node, index) => {
          node.id = index + 1;
        });
      });
      context.setState(context.idleState);
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
    return this.selectedObject.force.loads[this.currentLoad].x;
  }

  set nodeX(x) {
    return (this.selectedObject.force.loads[this.currentLoad].x = x);
  }

  get nodeY() {
    return this.selectedObject.force.loads[this.currentLoad].y;
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
    } else {
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
    this.selectedObject.style.default();
    /* this.selectedObject = null; */
  }
  info() {
    return 'Edita sus propiedades desde el menú o presiona "Supr" para eliminar.';
  }
}

export class TrussDrawingState extends PanAndZoomState {
  constructor(context) {
    super();
    this.context = context;
    this.shape = new Beam(this.context.globalE, this.context.globalA);
  }

  handleMouseDown(event, context, mouse) {
    super.handleMouseDown(...arguments);
    if (isMouseButton(event, MOUSE_BUTTONS.MIDDLE)) {
      return;
    }

    const view = context.viewSet?.[context.activeViewIndex];
    if (view?.type === "elevation") {
      context.showMessage?.("Para dibujar nuevos elementos, cambia a una vista de planta.");
      return;
    }

    const { x, y } = mouse;
    const currentZ = context.getActivePlanElevation();

    const collided = context.closestNodeAtElevation(
      context.grid.worldToScreen(context.mousePos),
      currentZ,
    );

    let node;

    if (collided) {
      node = collided;
    } else {
      node = new StructuralNode(
        { x: context.mousePos.x, y: context.mousePos.y },
        context.nodes.length + 1,
        currentZ
      );

      context.nodes.push(node);

      // const beam = context.closestBeam({ x: x, y: y });
      let beam = null;
      // const beam = context.closestBeamAtElevation({ x: x, y: y }, currentZ);
      if (beam) {
        const vAB = {
          x: beam.node2.position.x - beam.node1.position.x,
          y: beam.node2.position.y - beam.node1.position.y,
        };
        const vAD = {
          x: context.mousePos.x - beam.node1.position.x,
          y: context.mousePos.y - beam.node1.position.y,
        };
        const scale = (vAB.x * vAD.x + vAB.y * vAD.y) / pointDistance({ x: 0, y: 0 }, vAB) ** 2;
        const projAD_AB = { x: vAB.x * scale, y: vAB.y * scale };

        node.position.x = beam.node1.position.x + projAD_AB.x;
        node.position.y = beam.node1.position.y + projAD_AB.y;
        node.position.z = currentZ;

        const startID = beam.id;
        const node2 = beam.node2;

        removeFromArray(node2.beams, beam);
        beam.node2 = node;
        node.beams.push(beam);

        const newBeam = new Beam(context.globalE, context.globalA);
        newBeam.addNode(node);
        node.beams.push(newBeam);
        newBeam.addNode(node2);
        node2.beams.push(newBeam);

        context.shapes.splice(startID, 0, newBeam);
        context.shapes.forEach((beam, index) => {
          beam.id = index + 1;
        });
      }
    }

    const isDone = this.shape.addNode(node);
    if (isDone) {
      context.shapes.push(this.shape);
      this.shape.node1.beams.push(this.shape);
      this.shape.node2.beams.push(this.shape);
      this.shape.id = context.shapes.length;
      this.shape = new Beam(this.context.globalE, this.context.globalA);
      this.shape.addNode(node);
    }

    if (context.show3DView) {
      context.sync3D();
    }
  }

  handleMouseMove(event, context, mouse) {
    super.handleMouseMove(...arguments);
    const { x, y } = context.grid.worldToScreen(context.mousePos);
    const last_point = this.shape.node1?.position;
    if (last_point) {
      const lp = context.grid.worldToScreen(last_point);
      const unitVec = {
        x: (x - lp.x) / pointDistance(lp, { x: x, y: y }),
        y: (y - lp.y) / pointDistance(lp, { x: x, y: y }),
      };
      const perpUnitVec = { x: -unitVec.y, y: unitVec.x };
      const midPoint = { x: (lp.x + x) * 0.5, y: (lp.y + y) * 0.5 };
      const mid = { x: midPoint.x + perpUnitVec.x * 100, y: midPoint.y + perpUnitVec.y * 100 };
      this.mid = mid;
      context.distanceInput.style.top = mid.y + "px";
      context.distanceInput.style.left = mid.x + "px";
      context.distanceInput.value = pointDistance(last_point, context.mousePos).toFixed(2);
      context.distanceInput.focus();
      context.distanceInput.select();
    }
  }

  createBeam(context) {
    const view = context.viewSet?.[context.activeViewIndex];
    if (view?.type === "elevation") {
      context.showMessage?.("Para dibujar nuevos elementos, cambia a una vista de planta.");
      return;
    }

    const currentZ = context.getActivePlanElevation();

    const last_point = this.shape.node1.position;
    const unitVec = {
      x: (context.mousePos.x - last_point.x) / pointDistance(last_point, context.mousePos),
      y: (context.mousePos.y - last_point.y) / pointDistance(last_point, context.mousePos),
    };

    const distance = parseFloat(context.distanceInput.value);
    const newPoint = {
      x: last_point.x + unitVec.x * distance,
      y: last_point.y + unitVec.y * distance,
    };

    const node = new StructuralNode(newPoint, context.nodes.length + 1, currentZ);
    context.nodes.push(node);

    const isDone = this.shape.addNode(node);
    if (isDone) {
      context.shapes.push(this.shape);
      this.shape.node1.beams.push(this.shape);
      this.shape.node2.beams.push(this.shape);
      this.shape.id = context.shapes.length;

      // reinicia el estado de dibujo limpio
      this.shape = new Beam(context.globalE, context.globalA);
    }

    if (context.show3DView) {
      context.sync3D();
    }
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