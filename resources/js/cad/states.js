import { Beam, Node as StructuralNode, Shape } from "./shapes.js";
import { pointDistance, removeFromArray } from "./utils.js";
import { MOUSE_BUTTONS, isMouseButton } from "./utils.js";

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
  getCurrentPlane(context) {
    const isElevationView = context.currentElevationX && context.currentElevationX !== "none";

    if (isElevationView) {
      // En vista elevación, obtener la Y del eje
      const elev = context.xElevations?.find((e) => e.name === context.currentElevationX);
      return { type: "elevation", value: elev?.y || 0 };
    } else {
      // En vista planta, obtener la Z del nivel
      let currentZ = 0;
      if (context.currentStory && context.stories) {
        const story = context.stories.find((s) => s.name === context.currentStory);
        if (story) currentZ = story.z;
      }
      return { type: "plan", value: currentZ };
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
        if (!n) return; // ← AÑADE ESTA LÍNEA AL INICIO
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
    // ORIGINAL
    // if (event.key === "Delete") {
    //   this.selectedObjects.forEach((deleteShape) => {
    //     removeFromArray(deleteShape.node1.beams, deleteShape);
    //     removeFromArray(deleteShape.node2.beams, deleteShape);
    //     removeFromArray(context.shapes, deleteShape);
    //     context.shapes.forEach((beam, index) => {
    //       beam.id = index + 1;
    //     });
    //   });
    //   context.setState(context.idleState);

    //   context.sync3D();
    // }

    if (event.key === "Delete") {
      // Obtener el plano actual
      const isElevationView = context.currentElevationX && context.currentElevationX !== "none";
      let targetValue = 0;

      if (isElevationView) {
        // Vista ELEVACIÓN: obtener la Y del eje seleccionado
        const elev = context.xElevations?.find((e) => e.name === context.currentElevationX);
        targetValue = elev?.y || 0;
      } else {
        // Vista PLANTA: obtener la Z del nivel actual
        const story = context.stories?.find((s) => s.name === context.currentStory);
        targetValue = story?.z || 0;
      }

      // Filtrar solo las vigas que están en el plano actual
      const beamsToDelete = this.selectedObjects.filter((beam) => {
        if (!beam.node1 || !beam.node2) return false;

        if (isElevationView) {
          // Vista ELEVACIÓN: filtrar por Y
          const y1 = beam.node1.position.y;
          const y2 = beam.node2.position.y;
          return Math.abs(y1 - targetValue) < 0.01 && Math.abs(y2 - targetValue) < 0.01;
        } else {
          // Vista PLANTA: filtrar por Z
          const z1 = beam.node1.position.z || 0;
          const z2 = beam.node2.position.z || 0;
          return Math.abs(z1 - targetValue) < 0.01 && Math.abs(z2 - targetValue) < 0.01;
        }
      });

      console.log(`🗑️ Eliminando ${beamsToDelete.length} vigas del plano actual`);

      beamsToDelete.forEach((deleteShape) => {
        removeFromArray(deleteShape.node1.beams, deleteShape);
        removeFromArray(deleteShape.node2.beams, deleteShape);
        removeFromArray(context.shapes, deleteShape);
        context.shapes.forEach((beam, index) => {
          beam.id = index + 1;
        });
      });

      context.setState(context.idleState);
      context.sync3D();
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
  // ORIGINAL
  // handleKeyDown(event, context) {
  //   super.handleKeyDown(...arguments);
  //   if (event.key === "Delete") {
  //     this.selectedObjects.forEach((deleteShape) => {
  //       deleteShape.beams.forEach((beam) => {
  //         const updateBeamsNode = deleteShape === beam.node1 ? beam.node2 : beam.node1;
  //         removeFromArray(updateBeamsNode.beams, beam);
  //       });
  //       deleteShape.beams.forEach((beam) => {
  //         removeFromArray(context.shapes, beam);
  //       });
  //       removeFromArray(context.nodes, deleteShape);
  //       context.nodes.forEach((node, index) => {
  //         node.id = index + 1;
  //       });
  //     });
  //     context.setState(context.idleState);

  //     context.sync3D();
  //   }
  // }

  handleKeyDown(event, context) {
    super.handleKeyDown(...arguments);
    // ORIGINAL
    // if (event.key === "Delete") {
    //   // Obtener el plano actual
    //   const isElevationView = context.currentElevationX && context.currentElevationX !== "none";
    //   let targetValue = 0;

    //   if (isElevationView) {
    //     const elev = context.xElevations?.find((e) => e.name === context.currentElevationX);
    //     targetValue = elev?.y || 0;
    //   } else {
    //     const story = context.stories?.find((s) => s.name === context.currentStory);
    //     targetValue = story?.z || 0;
    //   }

    //   // Filtrar solo los nodos que están en el plano actual
    //   const nodesToDelete = this.selectedObjects.filter((node) => {
    //     if (isElevationView) {
    //       return Math.abs(node.position.y - targetValue) < 0.01;
    //     } else {
    //       return Math.abs((node.position.z || 0) - targetValue) < 0.01;
    //     }
    //   });

    //   nodesToDelete.forEach((deleteShape) => {
    //     deleteShape.beams.forEach((beam) => {
    //       const updateBeamsNode = deleteShape === beam.node1 ? beam.node2 : beam.node1;
    //       removeFromArray(updateBeamsNode.beams, beam);
    //     });
    //     deleteShape.beams.forEach((beam) => {
    //       removeFromArray(context.shapes, beam);
    //     });
    //     removeFromArray(context.nodes, deleteShape);
    //     context.nodes.forEach((node, index) => {
    //       node.id = index + 1;
    //     });
    //   });
    //   context.setState(context.idleState);
    //   context.sync3D();
    // }

    if (event.key === "Delete") {
      // Obtener el plano actual
      const isElevationView = context.currentElevationX && context.currentElevationX !== "none";
      let targetValue = 0;

      if (isElevationView) {
        // Vista ELEVACIÓN: obtener la Y del eje seleccionado
        const elev = context.xElevations?.find((e) => e.name === context.currentElevationX);
        targetValue = elev?.y || 0;
      } else {
        // Vista PLANTA: obtener la Z del nivel actual
        const story = context.stories?.find((s) => s.name === context.currentStory);
        targetValue = story?.z || 0;
      }

      // Filtrar solo los nodos que están en el plano actual
      const nodesToDelete = this.selectedObjects.filter((node) => {
        if (isElevationView) {
          return Math.abs(node.position.y - targetValue) < 0.01;
        } else {
          return Math.abs((node.position.z || 0) - targetValue) < 0.01;
        }
      });

      console.log(`🗑️ Eliminando ${nodesToDelete.length} nodos del plano actual`);

      nodesToDelete.forEach((deleteShape) => {
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

  getCurrentPlane(context) {
    const isElevationView = context.currentElevationX && context.currentElevationX !== "none";

    if (isElevationView) {
      // En vista elevación, obtener la Y del eje
      const elev = context.xElevations?.find((e) => e.name === context.currentElevationX);
      return { type: "elevation", value: elev?.y || 0 };
    } else {
      // En vista planta, obtener la Z del nivel
      let currentZ = 0;
      if (context.currentStory && context.stories) {
        const story = context.stories.find((s) => s.name === context.currentStory);
        if (story) currentZ = story.z;
      }
      return { type: "plan", value: currentZ };
    }
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
  // ORIGINAL
  // handleMouseMove(event, context, mouse) {
  //   const pointRect = (point, startRect, endRect) => {
  //     return point.x >= startRect.x && point.x <= endRect.x && point.y >= startRect.y && point.y <= endRect.y;
  //   };

  //   super.handleMouseMove(...arguments);
  //   this.selectionEnd = context.grid.screenToWorld(mouse);
  //   let start = context.grid.worldToScreen(this.selectionStart);
  //   let end = mouse;
  //   const selectBeams = start.x > mouse.x || start.y > mouse.y;

  //   // Obtener el plano actual (Y para elevación, Z para planta)
  //   const plane = this.getCurrentPlane(context);
  //   const isElevationView = plane.type === "elevation";
  //   const targetValue = plane.value;

  //   if (selectBeams) {
  //     [start, end] = [end, start];
  //     this.selectedBeams = context.shapes.filter((b) => {
  //       if (!b.node1 || !b.node2) return false;

  //       // Verificar que la viga esté en el plano actual
  //       if (isElevationView) {
  //         // Vista ELEVACIÓN: filtrar por Y
  //         const y1 = b.node1.position.y;
  //         const y2 = b.node2.position.y;
  //         if (Math.abs(y1 - targetValue) > 0.01 || Math.abs(y2 - targetValue) > 0.01) return false;
  //       } else {
  //         // Vista PLANTA: filtrar por Z
  //         const z1 = b.node1.position.z || 0;
  //         const z2 = b.node2.position.z || 0;
  //         if (Math.abs(z1 - targetValue) > 0.01 || Math.abs(z2 - targetValue) > 0.01) return false;
  //       }

  //       const p1 = context.grid.worldToScreen(b.node1.position);
  //       const p2 = context.grid.worldToScreen(b.node2.position);
  //       const collided = pointRect(p1, start, end) && pointRect(p2, start, end);

  //       if (collided) {
  //         b.style.hover();
  //       } else {
  //         b.style.default();
  //       }
  //       return collided;
  //     });
  //   } else {
  //     this.selectedNodes = context.nodes.filter((n) => {
  //       if (!n || !n.position) return false;

  //       // Verificar que el nodo esté en el plano actual
  //       if (isElevationView) {
  //         // Vista ELEVACIÓN: filtrar por Y
  //         if (Math.abs(n.position.y - targetValue) > 0.01) return false;
  //       } else {
  //         // Vista PLANTA: filtrar por Z
  //         const nodeZ = n.position.z || 0;
  //         if (Math.abs(nodeZ - targetValue) > 0.01) return false;
  //       }

  //       const position = context.grid.worldToScreen(n.position);
  //       const collided = pointRect(position, start, end);

  //       if (collided) {
  //         n.style.hover();
  //       } else {
  //         n.style.default();
  //       }
  //       return collided;
  //     });
  //   }
  // }

  handleMouseMove(event, context, mouse) {
    const pointRect = (point, startRect, endRect) => {
      return point.x >= startRect.x && point.x <= endRect.x && point.y >= startRect.y && point.y <= endRect.y;
    };

    super.handleMouseMove(...arguments);
    this.selectionEnd = context.grid.screenToWorld(mouse);
    let start = context.grid.worldToScreen(this.selectionStart);
    let end = mouse;
    const selectBeams = start.x > mouse.x || start.y > mouse.y;

    // Obtener el plano actual
    const isElevationView = context.currentElevationX && context.currentElevationX !== "none";
    let targetY = null;
    let targetZ = null;

    if (isElevationView) {
      const elev = context.xElevations?.find((e) => e.name === context.currentElevationX);
      targetY = elev?.y || 0;
    } else {
      const story = context.stories?.find((s) => s.name === context.currentStory);
      targetZ = story?.z || 0;
    }

    if (selectBeams) {
      [start, end] = [end, start];
      this.selectedBeams = context.shapes.filter((b) => {
        if (!b.node1 || !b.node2) return false;

        // Filtrar por plano actual
        if (isElevationView) {
          const y1 = b.node1.position.y;
          const y2 = b.node2.position.y;
          if (Math.abs(y1 - targetY) > 0.01 || Math.abs(y2 - targetY) > 0.01) return false;
        } else {
          const z1 = b.node1.position.z || 0;
          const z2 = b.node2.position.z || 0;
          if (Math.abs(z1 - targetZ) > 0.01 || Math.abs(z2 - targetZ) > 0.01) return false;
        }

        // Proyectar a 2D
        let p1, p2;
        if (isElevationView) {
          p1 = context.grid.worldToScreen({ x: b.node1.position.x, y: b.node1.position.z || 0 });
          p2 = context.grid.worldToScreen({ x: b.node2.position.x, y: b.node2.position.z || 0 });
        } else {
          p1 = context.grid.worldToScreen(b.node1.position);
          p2 = context.grid.worldToScreen(b.node2.position);
        }

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
        if (!n || !n.position) return false;

        // Filtrar por plano actual
        if (isElevationView) {
          if (Math.abs(n.position.y - targetY) > 0.01) return false;
        } else {
          if (Math.abs((n.position.z || 0) - targetZ) > 0.01) return false;
        }

        // Proyectar a 2D
        let position;
        if (isElevationView) {
          position = context.grid.worldToScreen({ x: n.position.x, y: n.position.z || 0 });
        } else {
          position = context.grid.worldToScreen(n.position);
        }

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

    // Verificar que el objeto seleccionado esté en el nivel actual
    if (this.selectedObject) {
      let currentZ = 0;
      if (context.currentStory && context.stories) {
        const story = context.stories.find((s) => s.name === context.currentStory);
        if (story) currentZ = story.z;
      }
      const nodeZ = this.selectedObject.position.z || 0;
      if (Math.abs(nodeZ - currentZ) > 0.01) {
        // No permitir mover nodos de otro nivel
        context.setState(context.idleState);
        return;
      }
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

    // Sincronizar mientras se mueve
    context.sync3D();
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
    if (isMouseButton(event, MOUSE_BUTTONS.MIDDLE)) {
      super.handleMouseDown(event, context, mouse);
      return;
    }

    super.handleMouseDown(...arguments);
    if (isMouseButton(event, MOUSE_BUTTONS.MIDDLE)) {
      return;
    }

    const worldPos = context.grid.screenToWorld(mouse);
    const isElevationView = context.currentElevationX !== "none";

    let x, y, z;

    if (isElevationView) {
      // VISTA ELEVACIÓN: dibujar en el plano Y = constante
      const currentY = context.getCurrentElevationY();
      x = worldPos.x;
      y = currentY;
      z = worldPos.y; // ← El eje Y del mouse se convierte en Z (altura)
      console.log(
        `🖱️ Dibujando en ELEVACIÓN X-${context.currentElevationX} - Y = ${y}m, Posición 2D: (${worldPos.x.toFixed(2)}, ${worldPos.y.toFixed(2)}) -> 3D: (${x.toFixed(2)}, ${y.toFixed(2)}, ${z.toFixed(2)})`,
      );
    } else {
      // VISTA PLANTA: dibujar en el nivel Z = constante
      let currentZ = 0;
      if (context.currentStory && context.stories) {
        const story = context.stories.find((s) => s.name === context.currentStory);
        if (story) currentZ = story.z;
      }
      x = worldPos.x;
      y = worldPos.y;
      z = currentZ;
      console.log(
        `🖱️ Dibujando en PLANTA - Z = ${z}m, Posición 2D: (${worldPos.x.toFixed(2)}, ${worldPos.y.toFixed(2)}) -> 3D: (${x.toFixed(2)}, ${y.toFixed(2)}, ${z.toFixed(2)})`,
      );
    }

    // Buscar nodo cercano
    let node = context.nodes.find((n) => {
      const dx = Math.abs(n.position.x - x);
      const dy = Math.abs(n.position.y - y);
      const dz = Math.abs((n.position.z || 0) - z);
      return dx < 0.3 && dy < 0.3 && dz < 0.1;
    });

    if (!node) {
      node = new StructuralNode({ x: x, y: y }, context.nodes.length + 1, z);
      context.nodes.push(node);
      console.log(`✅ Nodo creado ID: ${node.id} en (${x.toFixed(2)}, ${y.toFixed(2)}, ${z.toFixed(2)})`);
    } else {
      console.log(`🔗 Nodo existente ID: ${node.id} en Z=${node.position.z}`);
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
      this.shape.addNode(node);
    }

    context.redraw();
    context.sync3D();
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
    const node = new StructuralNode(newPoint, context.nodes.length + 1, 0);
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

    context.redraw();
    context.sync3D();
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
    if (isMouseButton(event, MOUSE_BUTTONS.MIDDLE)) {
      super.handleMouseDown(event, context, mouse);
      return;
    }

    const worldPos = context.grid.screenToWorld(mouse);
    const view = context.elevationManager?.current2DView || "plan";

    let x, y, z;

    if (view === "plan") {
      x = worldPos.x;
      y = 0;
      z = worldPos.y;
    } else if (view === "elevation-xy") {
      x = worldPos.x;
      y = worldPos.y;
      z = 0;
    } else if (view === "elevation-zy") {
      x = 0;
      y = worldPos.y;
      z = worldPos.x;
    } else {
      x = worldPos.x;
      y = worldPos.y;
      z = 0;
    }

    console.log(`🖱️ CREANDO NODO - Vista: ${view}, 3D: (${x.toFixed(2)}, ${y.toFixed(2)}, ${z.toFixed(2)})`);

    // Siempre crear nuevo nodo para pruebas
    const node = new StructuralNode({ x: x, y: y }, context.nodes.length + 1, z);
    context.nodes.push(node);
    console.log(`✅ NODO CREADO ${node.id}: (${node.position.x}, ${node.position.y}, ${node.position.z})`);

    if (!this.shape) {
      this.shape = new Beam(context.globalE, context.globalA);
    }

    const isDone = this.shape.addNode(node);
    if (isDone) {
      context.shapes.push(this.shape);
      this.shape.id = context.shapes.length;
      console.log(`📐 VIGA CREADA ${this.shape.id}: Nodo${this.shape.node1.id} -> Nodo${this.shape.node2.id}`);
      this.shape = new Beam(context.globalE, context.globalA);
      this.shape.addNode(node);
    }

    // Forzar un solo redibujado
    context.redraw();
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
    const view = this.context?.elevationManager?.current2DView || "plan";
    const mouseX = worldPos.x;
    const mouseY = worldPos.y;

    switch (view) {
      case "plan":
        // Vista PLANTA: dibujar en Y=0 (suelo), X y Z varían
        return { x: mouseX, y: 0, z: mouseY };

      case "elevation-xy":
        // Vista ELEVACIÓN X-Y: dibujar en Z=0, X y Y varían
        return { x: mouseX, y: mouseY, z: 0 };

      case "elevation-zy":
        // Vista ELEVACIÓN Z-Y: dibujar en X=0, Z y Y varían
        return { x: 0, y: mouseY, z: mouseX };

      default:
        return { x: mouseX, y: mouseY, z: 0 };
    }
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
