import { Beam, Node as StructuralNode } from "../../shapes.js";
import { pointDistance, pointDistanceToSegment } from "../../utils.js";

/**
 * @mixin modelFactoryMixin
 *
 * Creación de nodos y snapping al modelo estructural.
 *
 * Centraliza la lógica de "buscar o crear nodo en una posición dada",
 * aplicando la tolerancia del modelo para reusar nodos existentes en lugar
 * de crear duplicados. Es el factory que todos los estados de dibujo
 * (TrussDrawingState, ColumnDrawingState, etc.) usan para obtener nodos.
 *
 * También calcula los puntos de snap (intersecciones de la grilla,
 * puntos medios de barras, nodos existentes) para el cursor del canvas.
 *
 * Responsabilidades:
 * - getOrCreateStructuralNode(point, tolerance) → reutiliza o crea un nodo en 'point'
 * - snapToNearestPoint(screenPoint)             → devuelve el punto de snap más cercano
 * - getSnapCandidates()                         → lista de todos los candidatos de snap
 * - snapToGrid(worldPoint)                      → ajusta un punto al grid configurado
 * - rebuild3DGridSnapPoints(reason)             → reconstruye el índice de snap 3D
 * - rebuild3DGridSnapPointsSoon(reason)         → versión diferida (debounced) del anterior
 */
export const modelFactoryMixin = {
  getOrCreateStructuralNode(point, tolerance = null) {
    tolerance = tolerance ?? this.getModelTolerance();

    const existing = this.nodes.find((node) => {
      const p = node.position || node;

      return (
        Math.abs(Number(p.x || 0) - Number(point.x || 0)) <= tolerance &&
        Math.abs(Number(p.y || 0) - Number(point.y || 0)) <= tolerance &&
        Math.abs(Number(p.z || 0) - Number(point.z || 0)) <= tolerance
      );
    });

    if (existing) {
      if (!existing.beams) existing.beams = [];
      return existing;
    }

    const node = new StructuralNode(
      {
        x: Number(point.x || 0),
        y: Number(point.y || 0),
      },
      this.nodes.length + 1,
      Number(point.z || 0),
    );

    if (!node.position) {
      node.position = {
        x: Number(point.x || 0),
        y: Number(point.y || 0),
        z: Number(point.z || 0),
      };
    }

    node.position.x = Number(point.x || 0);
    node.position.y = Number(point.y || 0);
    node.position.z = Number(point.z || 0);

    if (!node.beams) {
      node.beams = [];
    }

    this.nodes.push(node);

    return node;
  },

  createFrameLineFromPoints(startPoint, endPoint, frameType = "beam") {
    // const tolerance = this.preferences?.modelTolerance ?? 0.001;

    if (!startPoint || !endPoint) {
      return null;
    }

    const tolerance = this.getModelTolerance();

    const samePoint =
      Math.abs(Number(startPoint.x || 0) - Number(endPoint.x || 0)) < tolerance &&
      Math.abs(Number(startPoint.y || 0) - Number(endPoint.y || 0)) < tolerance &&
      Math.abs(Number(startPoint.z || 0) - Number(endPoint.z || 0)) < tolerance;

    if (samePoint) {
      this.showMessage?.("No se puede crear una línea con el mismo punto inicial y final", "warning");
      return null;
    }

    const node1 = this.getOrCreateStructuralNode(startPoint);
    const node2 = this.getOrCreateStructuralNode(endPoint);

    const frame = new Beam(this.globalE, this.globalA);

    frame.elementType = frameType;
    frame.type = frameType;
    frame.objectType = "frame";
    frame.visible = true;

    frame.addNode(node1);
    frame.addNode(node2);

    frame.id = this.shapes.length + 1;

    this.shapes.push(frame);

    if (!node1.beams) node1.beams = [];
    if (!node2.beams) node2.beams = [];

    if (!node1.beams.includes(frame)) {
      node1.beams.push(frame);
    }

    if (!node2.beams.includes(frame)) {
      node2.beams.push(frame);
    }

    this.redraw?.();
    this.sync3D?.();

    console.log(`✅ Línea creada ID: ${frame.id} | tipo: ${frameType}`, frame.node1.position, frame.node2.position);

    return frame;
  },

  getCurrentSnapPoint(worldPos) {
    if (this.activeGridPoint) {
      return {
        x: this.activeGridPoint.x,
        y: this.activeGridPoint.y,
        z: this.activeGridPoint.z,
      };
    }

    const view = this.viewSet?.[this.activeViewIndex];

    // Si no hay snap, igual devuelve un punto coherente según la vista
    if (!view || view.type === "plan") {
      return {
        x: worldPos.x,
        y: worldPos.y,
        z: this.currentZ || 0,
      };
    }

    if (view.type === "elevation") {
      const fixedCoord = this.getFixedCoordinateForActiveElevation(view);

      // Elevación numérica: plano X-Z con Y fijo
      if (view.axis === "Y") {
        return {
          x: worldPos.x,
          y: fixedCoord,
          z: worldPos.y,
        };
      }

      // Elevación por letras: plano Y-Z con X fijo
      if (view.axis === "X") {
        return {
          x: fixedCoord,
          y: worldPos.x,
          z: worldPos.y,
        };
      }
    }

    return {
      x: worldPos.x,
      y: worldPos.y,
      z: 0,
    };
  },

  closestNodeAtActiveView(searchPoint) {
    const view = this.viewSet?.[this.activeViewIndex];
    const tolerance = 0.05;
    const shortestDistance = 10;

    let closest = null;
    let best = shortestDistance;
    for (let i = 0; i < this.nodes.length; i++) {
      const node = this.nodes[i];

      const x = node.position.x || 0;
      const y = node.position.y || 0;
      const z = node.position.z || 0;

      let belongs = true;
      let screenPos = null;

      if (view?.type === "plan") {
        belongs = Math.abs(z - (view.elevation ?? 0)) <= tolerance;

        screenPos = this.grid.worldToScreen({
          x: x,
          y: y,
        });
      } else if (view?.type === "elevation") {
        if (view.axis === "X") {
          belongs = Math.abs(x - (Number(view.value) || 0)) <= tolerance;

          screenPos = this.grid.worldToScreen({
            x: y,
            y: z,
          });
        } else if (view.axis === "Y") {
          belongs = Math.abs(y - (Number(view.value) || 0)) <= tolerance;

          screenPos = this.grid.worldToScreen({
            x: x,
            y: z,
          });
        }
      }

      if (!belongs || !screenPos) continue;

      const distance = pointDistance(searchPoint, screenPos);
      if (distance > best) continue;

      closest = node;
      best = distance;
    }

    return closest;
  },

  // closestBeamAtActiveView(searchPoint) {
  //   const view = this.viewSet?.[this.activeViewIndex];
  //   const tolerance = 0.05;
  //   let closest = null;
  //   let shortestDistance = 10;

  //   for (let i = 0; i < this.shapes.length; i++) {
  //     const beam = this.shapes[i];
  //     if (!beam?.node1 || !beam?.node2) continue;

  //     const x1 = beam.node1.position.x || 0;
  //     const y1 = beam.node1.position.y || 0;
  //     const z1 = beam.node1.position.z || 0;

  //     const x2 = beam.node2.position.x || 0;
  //     const y2 = beam.node2.position.y || 0;
  //     const z2 = beam.node2.position.z || 0;

  //     let belongs = true;
  //     let p1, p2;

  //     if (view?.type === "plan") {
  //       belongs =
  //         Math.abs(z1 - (view.elevation ?? 0)) <= tolerance && Math.abs(z2 - (view.elevation ?? 0)) <= tolerance;

  //       p1 = this.grid.worldToScreen({ x: x1, y: y1 });
  //       p2 = this.grid.worldToScreen({ x: x2, y: y2 });
  //     } else if (view?.type === "elevation") {
  //       if (view.axis === "X") {
  //         // 🔥 Plano Y-Z
  //         belongs = Math.abs(x1 - view.value) <= tolerance && Math.abs(x2 - view.value) <= tolerance;

  //         p1 = this.grid.worldToScreen({ x: y1, y: z1 });
  //         p2 = this.grid.worldToScreen({ x: y2, y: z2 });
  //       } else if (view.axis === "Y") {
  //         // 🔥 Plano X-Z
  //         belongs = Math.abs(y1 - view.value) <= tolerance && Math.abs(y2 - view.value) <= tolerance;

  //         p1 = this.grid.worldToScreen({ x: x1, y: z1 });
  //         p2 = this.grid.worldToScreen({ x: x2, y: z2 });
  //       }
  //     }

  //     if (!belongs || !p1 || !p2) continue;

  //     const dist = pointDistanceToSegment(searchPoint, p1, p2);

  //     if (dist < shortestDistance) {
  //       shortestDistance = dist;
  //       closest = beam;
  //     }
  //   }

  //   return closest;
  // },

  canSelectInCurrentView() {
    // const view = this.viewSet?.[this.activeViewIndex];
    // return !!(view && view.type === "plan");
    return true;
  },

  // MOSTRAR indicador visual de vista activa
  getActiveViewLabel() {
    const view = this.viewSet?.[this.activeViewIndex];

    if (!view) {
      return "Vista 2D";
    }

    return `Vista 2D (${view.name})`;
  },

  getActiveViewBadgeClass() {
    const view = this.viewSet?.[this.activeViewIndex];

    if (!view) {
      return "bg-gray-900 text-white";
    }

    if (view.type === "plan") {
      return "bg-gray-900 text-white";
    }

    if (view.type === "elevation") {
      return "bg-blue-900 text-blue-100";
    }

    return "bg-gray-900 text-white";
  },

  getActive3DViewLabel() {
    const view = this.viewSet?.[this.activeViewIndex];

    if (!view) {
      return "Vista 3D";
    }

    return `Vista 3D (${view.name})`;
  },


};
