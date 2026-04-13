import { Beam, Node, Shape } from "./shapes.js";
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
    context.nodes.forEach((n) => {
      n.style.default();
    });
    context.shapes.find((s) => {
      s.style.default();
    });
    let selectedObject = context.closestNode(mouse);
    if (selectedObject) {
      context.setState(context.moveObjectState, { selectedObject: selectedObject, isMoving: true });
    } else if ((selectedObject = context.closestBeam(mouse))) {
      context.setState(context.selectedBeamsState, { selectedBeams: [selectedObject] });
    } else if ((selectedObject = context.closestParametric(mouse))) {
      context.setState(context.selectedParametricState, { selectedParametric: [selectedObject] });
    } else {
      context.setState(context.selectionState, { selectionStart: context.grid.screenToWorld(mouse) });
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
            context.grid.worldToScreen(s.node2.position)
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
              context.grid.worldToScreen(s.node2.position)
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
    super.handleMouseDown(...arguments);
    if (!isMouseButton(event, MOUSE_BUTTONS.MIDDLE)) {
      let selectedObject = context.closestNode(mouse);
      if (selectedObject) {
        context.setState(context.moveObjectState, { selectedObject: selectedObject, isMoving: true });
      } else if ((selectedObject = context.closestBeam(mouse))) {
        context.setState(context.selectedBeamsState, { selectedBeams: [selectedObject] });
      } else {
        context.setState(context.selectionState, { selectionStart: context.grid.screenToWorld(mouse) });
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
    /* this.selectedObjects.splice(0, this.selectedObjects.length); */
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
          context.grid.worldToScreen(s.node2.position)
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
            context.grid.worldToScreen(s.node2.position)
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
        const p1 = context.grid.worldToScreen(b.node1.position);
        const p2 = context.grid.worldToScreen(b.node2.position);
        const collided = pointRect(p1, start, end) && pointRect(p2, start, end);
        if (collided) {
          b.style.hover();
        } else {
          b.style.default();
        }
        return collided;
      });
    } else {
      this.selectedNodes = context.nodes.filter((n) => {
        const position = context.grid.worldToScreen(n.position);
        const collided = pointRect(position, start, end);
        if (collided) {
          n.style.hover();
        } else {
          n.style.default();
        }
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
    PanAndZoomState.prototype.handleMouseDown.call(this, ...arguments);
    if (isMouseButton(event, MOUSE_BUTTONS.MIDDLE)) {
      return;
    }
    this.isMoving = !this.isMoving;
    const selected = context.closestNode(mouse);
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
    const { x, y } = mouse;
    const collided = context.closestNode(context.grid.worldToScreen(context.mousePos));
    let node;
    if (collided) {
      node = collided;
    } else {
      // MODIFICAR
      // node = new Node(context.mousePos, context.nodes.length + 1);
      node = new Node(
        {
          x: context.mousePos.x,
          y: context.mousePos.y,
          z: 0,
        },
        context.nodes.length + 1
      );
      context.nodes.push(node);
      const beam = context.closestBeam({ x: x, y: y });
      if (beam) {
        const vAB = {
          x: beam.node2.position.x - beam.node1.position.x,
          y: beam.node2.position.y - beam.node1.position.y,
        };
        const vAD = { x: context.mousePos.x - beam.node1.position.x, y: context.mousePos.y - beam.node1.position.y };
        const scale = (vAB.x * vAD.x + vAB.y * vAD.y) / pointDistance({ x: 0, y: 0 }, vAB) ** 2;
        const projAD_AB = { x: vAB.x * scale, y: vAB.y * scale };
        node.position.x = beam.node1.position.x + projAD_AB.x;
        node.position.y = beam.node1.position.y + projAD_AB.y;
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
    const last_point = this.shape.node1.position;
    const unitVec = {
      x: (context.mousePos.x - last_point.x) / pointDistance(last_point, context.mousePos),
      y: (context.mousePos.y - last_point.y) / pointDistance(last_point, context.mousePos),
    };
    const distance = parseFloat(context.distanceInput.value);
    const newPoint = { x: last_point.x + unitVec.x * distance, y: last_point.y + unitVec.y * distance };
    // MODIFICAR
    // const node = new Node(newPoint, context.nodes.length + 1);
    const node = new Node(
      {
        x: newPoint.x,
        y: newPoint.y,
        z: 0,
      },
      context.nodes.length + 1
    );
    context.nodes.push(node);
    const isDone = this.shape.addNode(node);
    if (isDone) {
      context.shapes.push(this.shape);
      this.shape.node1.beams.push(this.shape);
      this.shape.node2.beams.push(this.shape);
      this.shape.id = context.shapes.length;
      this.shape = new Beam(context.globalE, context.globalA);
      this.shape.addNode(node);
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
    selectedPoint = closestNode({ x: x, y: y });
    if (selectedPoint) {
      nodoID.value = selectedPoint.id;
      posX.value = selectedPoint.position.x;
      posY.value = selectedPoint.position.y;
      magnitudX.value = selectedPoint.xMag ?? 0;
      magnitudY.value = selectedPoint.yMag ?? 0;
    } else if ((selectedBeam = closestBeam({ x: x, y: y }))) {
      barraID.value = selectedBeam.id;
      modElasticoBarra.value = selectedBeam.E;
      aSeccionBarra.value = selectedBeam.A;
    }
  }
}

export class ChangeSupport extends StateBase {
  handleMouseDown(event, context, mouse) {
    selectedPoint = closestNode({ x: x, y: y });
    if (selectedPoint) {
      selectedPoint.soporte = selectedSoporte;
    }
  }
}
