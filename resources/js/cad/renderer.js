import { BeamStyle, NodeStyle } from "./styles.js";
import { pointDistance, axisToFixed, midPoint } from "./utils.js";

function imgFromSVG(svg) {
  // Create an image from the SVG string
  const img = new Image();
  img.src = URL.createObjectURL(new Blob([svg], { type: "image/svg+xml" }));
  return img;
}

const soporteUno = `
<svg viewBox="90 20 70 60" width="30" height="30" xmlns="http://www.w3.org/2000/svg">
  <polygon points="120,20 140,60 100,60" fill="none" stroke="white" stroke-width="2"/>
  <line x1="90" y1="60" x2="150" y2="60" stroke="white" stroke-width="2"/>
  <line x1="90" y1="60" x2="100" y2="70" stroke="white" stroke-width="2"/>
  <line x1="100" y1="60" x2="110" y2="70" stroke="white" stroke-width="2"/>
  <line x1="110" y1="60" x2="120" y2="70" stroke="white" stroke-width="2"/>
  <line x1="120" y1="60" x2="130" y2="70" stroke="white" stroke-width="2"/>
  <line x1="130" y1="60" x2="140" y2="70" stroke="white" stroke-width="2"/>
  <line x1="140" y1="60" x2="150" y2="70" stroke="white" stroke-width="2"/>
  <line x1="150" y1="60" x2="160" y2="70" stroke="white" stroke-width="2"/>
</svg>`;

const soporteDos = `
<svg viewBox="90 20 70 60" width="30" height="30" xmlns="http://www.w3.org/2000/svg">
  <circle cx="120" cy="40" r="20" fill="none" stroke="white" stroke-width="2"/>
  <line x1="90" y1="60" x2="150" y2="60" stroke="white" stroke-width="2"/>
  <line x1="90" y1="60" x2="100" y2="70" stroke="white" stroke-width="2"/>
  <line x1="100" y1="60" x2="110" y2="70" stroke="white" stroke-width="2"/>
  <line x1="110" y1="60" x2="120" y2="70" stroke="white" stroke-width="2"/>
  <line x1="120" y1="60" x2="130" y2="70" stroke="white" stroke-width="2"/>
  <line x1="130" y1="60" x2="140" y2="70" stroke="white" stroke-width="2"/>
  <line x1="140" y1="60" x2="150" y2="70" stroke="white" stroke-width="2"/>
  <line x1="150" y1="60" x2="160" y2="70" stroke="white" stroke-width="2"/>
</svg>`;

const soporteTres = `
<svg viewBox="20 90 60 70" width="30" height="30" xmlns="http://www.w3.org/2000/svg">
  <circle cx="40" cy="120" r="20" fill="none" stroke="white" stroke-width="2"/>
  <line x1="25" y1="150" x2="25" y2="90" stroke="white" stroke-width="2"/>
  <line x1="10" y1="150" x2="25" y2="140" stroke="white" stroke-width="2"/>
  <line x1="10" y1="140" x2="25" y2="130" stroke="white" stroke-width="2"/>
  <line x1="10" y1="130" x2="25" y2="120" stroke="white" stroke-width="2"/>
  <line x1="10" y1="120" x2="25" y2="110" stroke="white" stroke-width="2"/>
  <line x1="10" y1="110" x2="25" y2="100" stroke="white" stroke-width="2"/>
  <line x1="10" y1="100" x2="25" y2="90" stroke="white" stroke-width="2"/>
</svg>`;

export const soportes = {
  soporteUno: imgFromSVG(soporteUno),
  soporteDos: imgFromSVG(soporteDos),
  soporteTres: imgFromSVG(soporteTres),
};

export class DiseñoRenderer {
  render(CADSystem) {
    this.clearBackground(CADSystem);
    if (CADSystem.options.showGrid) {
      CADSystem.grid.draw(this, CADSystem);
    }
    CADSystem.nodes.forEach((n) => {
      this.drawSupport(n, CADSystem);
    });
    if (!CADSystem.options.showWireframe) {
      if (CADSystem.options.showFAxiales) {
        this.drawAxiales(CADSystem);
        if (CADSystem.options.showFAxialesValues) {
          this.drawAxialesValues(CADSystem);
        }
      } else {
        CADSystem.shapes.forEach((s) => {
          s.draw(this, CADSystem);
        });
        CADSystem.parametricModels.forEach((parametric) => {
          parametric.shapes.forEach((s) => {
            s.draw(this, CADSystem);
          });
        });
      }
      CADSystem.nodes.forEach((n) => {
        n.draw(this, CADSystem);
      });
      CADSystem.parametricModels.forEach((parametric) => {
        parametric.nodes.forEach((n) => {
          n.draw(this, CADSystem);
          this.drawForce(n, CADSystem);
        });
      });
    } else {
      if (CADSystem.options.showFAxiales) {
        this.drawWireframeAxiales(CADSystem);
        if (CADSystem.options.showFAxialesValues) {
          this.drawAxialesValues(CADSystem);
        }
      } else {
        CADSystem.shapes.forEach((s) => {
          this.drawWireBeam(s, CADSystem);
        });
        CADSystem.nodes.forEach((n) => {
          this.drawWireNode(n, CADSystem);
        });
      }
    }
    if (CADSystem.options.showIDs) {
      CADSystem.shapes.forEach((s) => {
        this.drawBeamID(s, CADSystem);
      });
      CADSystem.nodes.forEach((n) => {
        this.drawNodeID(n, CADSystem);
      });
    }
    if (CADSystem.options.showForces) {
      CADSystem.ctx.save();
      CADSystem.nodes.forEach((n) => {
        this.drawForce(n, CADSystem);
      });
      CADSystem.ctx.restore();
    }
    if (CADSystem.options.showReactions) {
      CADSystem.ctx.save();
      CADSystem.nodes.forEach((n) => {
        this.drawReaction(n, CADSystem);
      });
      CADSystem.ctx.restore();
    }
    if (CADSystem.options.showDeflection) {
      this.drawDeflections(CADSystem);
    }
    if (CADSystem.options.showMaterials) {
      this.drawMaterials(CADSystem);
    }

    CADSystem.currentState.draw(this, CADSystem);
  }

  drawAxiales(context) {
    context.shapes.forEach((s) => {
      const p1 = context.grid.worldToScreen(s.node1.position);
      const p2 = context.grid.worldToScreen(s.node2.position);
      context.ctx.save();
      Object.assign(context.ctx, s.style.axialStyle.MODEL);
      context.ctx.beginPath();
      context.ctx.moveTo(p1.x, p1.y);
      context.ctx.lineTo(p2.x, p2.y);
      context.ctx.stroke();
      context.ctx.restore();
    });
  }

  drawWireframeAxiales(context) {
    context.shapes.forEach((s) => {
      const p1 = context.grid.worldToScreen(s.node1.position);
      const p2 = context.grid.worldToScreen(s.node2.position);
      context.ctx.save();
      Object.assign(context.ctx, s.style.axialStyle.WIREFRAME);
      context.ctx.beginPath();
      context.ctx.moveTo(p1.x, p1.y);
      context.ctx.lineTo(p2.x, p2.y);
      context.ctx.stroke();
      context.ctx.restore();
    });
  }

  drawAxialesValues(context) {
    context.shapes.forEach((s) => {
      const p1 = context.grid.worldToScreen(s.node1.position);
      const p2 = context.grid.worldToScreen(s.node2.position);
      const mid = midPoint(p1, p2);
      context.ctx.save();
      Object.assign(context.ctx, s.style.axialStyle.MODEL);
      context.ctx.translate(mid.x, mid.y);
      context.ctx.rotate(s.angle);
      context.ctx.fillText(s.fAxial.toFixed(3), 0, 30);
      context.ctx.restore();
    });
  }

  clearBackground(context) {
    context.ctx.fillStyle = "#36454F";
    context.ctx.fillRect(0, 0, context.grid.width, context.grid.height);
  }

  drawWireNode(node, context) {
    const p = context.grid.worldToScreen(node.position);
    context.ctx.save();
    Object.assign(context.ctx, node.style.get().WIREFRAME);
    context.ctx.beginPath();
    context.ctx.arc(p.x, p.y, node.style.getModel().RADIUS / 2, 0, Math.PI * 2);
    context.ctx.fill();
    context.ctx.restore();
  }

  // Funcion auxiliar
  getNodePosition(node, context) {
    if (!node || !node.position) {
      return null;
    }

    if (context.elevationManager) {
      const view = context.elevationManager.current2DView;
      const currentElevation = context.elevationManager.currentElevation;
      const currentType = context.elevationManager.currentElevationType;
      const grid = context.referenceGrid;

      const x = node.position.x;
      const y = node.position.y;
      const z = node.position.z || 0;

      if (view === "plan") {
        // Vista PLANTA: solo mostrar nodos en Z=0
        if (Math.abs(z) > 0.01) return null;
        return { x: x, y: y };
      } else if (view === "elevation-xz") {
        // Vista X-Z: solo nodos en Y=0
        if (Math.abs(y) > 0.01) return null;

        // Si hay grid y es una elevación numérica (Eje 1, 2, 3)
        if (grid && currentType === "number") {
          const idx = parseInt(currentElevation) - 1;
          if (idx >= 0 && idx < grid.xPositions.length) {
            const targetX = grid.xPositions[idx];
            // Solo mostrar nodos que están en este eje X
            if (Math.abs(x - targetX) > 0.1) return null;
          }
        }
        return { x: x, y: z };
      } else if (view === "elevation-yz") {
        // Vista Y-Z: solo nodos en X=0
        if (Math.abs(x) > 0.01) return null;

        // Si hay grid y es una elevación por letra (A, B, C)
        if (grid && currentType === "letter") {
          const idx = grid.xLabels.indexOf(currentElevation);
          if (idx >= 0 && idx < grid.yPositions.length) {
            const targetZ = grid.yPositions[idx];
            // Solo mostrar nodos que están en este eje Z
            if (Math.abs(z - targetZ) > 0.1) return null;
          }
        }
        return { x: y, y: z };
      }
    }
    // Fallback
    return { x: node.position.x, y: node.position.y };
  }

  drawNode(node, context) {
    // if (!node || !node.position) {
    //   return;
    // }

    // const pos = this.getNodePosition(node, context); //se agregio esta linea para obtener la posicion del nodo dependiendo de la vista
    // // SI LA POSICIÓN ES NULL (nodo no pertenece a la vista actual), NO DIBUJAR
    // if (!pos) {
    //   return;
    // }

    // const p = context.grid.worldToScreen({ x: pos.x, y: pos.y });
    // context.ctx.save();
    // const model = node.style.getModel();
    // Object.assign(context.ctx, node.style.get().MODEL);
    // context.ctx.beginPath();
    // context.ctx.arc(p.x, p.y, model.RADIUS, 0, Math.PI * 2);
    // context.ctx.fill();
    // context.ctx.fillStyle = model.JOINT_FILL;
    // context.ctx.beginPath();
    // context.ctx.arc(p.x, p.y, model.RADIUS / 2, 0, Math.PI * 2);
    // context.ctx.fill();
    // context.ctx.restore();
    if (!node || !node.position) return;

    // Obtener la altura Z del nivel actual
    let currentZ = 0;
    if (context.currentStory && context.stories) {
      const story = context.stories.find((s) => s.name === context.currentStory);
      if (story) currentZ = story.z;
    }

    // SOLO dibujar nodos que están en el nivel actual
    const nodeZ = node.position.z || 0;
    if (Math.abs(nodeZ - currentZ) > 0.01) {
      return; // Nodo de otro nivel, no dibujar
    }

    // Proyectar coordenadas 3D a 2D (X, Y)
    const p = context.grid.worldToScreen({ x: node.position.x, y: node.position.y });

    context.ctx.save();
    const model = node.style.getModel();

    // Si está en modo wireframe, usar estilo wireframe
    if (context.options.showWireframe) {
      Object.assign(context.ctx, node.style.get().WIREFRAME);
    } else {
      Object.assign(context.ctx, node.style.get().MODEL);
    }

    // Object.assign(context.ctx, node.style.get().MODEL);
    context.ctx.beginPath();
    context.ctx.arc(p.x, p.y, model.RADIUS, 0, Math.PI * 2);
    context.ctx.fill();
    context.ctx.fillStyle = model.JOINT_FILL;
    context.ctx.beginPath();
    context.ctx.arc(p.x, p.y, model.RADIUS / 2, 0, Math.PI * 2);
    context.ctx.fill();
    context.ctx.restore();
  }

  drawNodeID(node, context) {
    if (!node || !node.position) return;

    // 🔑 FILTRAR POR NIVEL ACTUAL
    let currentZ = 0;
    if (context.currentStory && context.stories) {
      const story = context.stories.find((s) => s.name === context.currentStory);
      if (story) currentZ = story.z;
    }

    const nodeZ = node.position.z || 0;
    if (Math.abs(nodeZ - currentZ) > 0.01) {
      return; // Nodo de otro nivel, NO mostrar ID
    }
    const p = context.grid.worldToScreen(node.position);
    context.ctx.save();
    context.ctx.beginPath();
    Object.assign(context.ctx, node.style.get().ID);
    context.ctx.arc(p.x - 10, p.y - 10, context.grid.size * 2, 0, Math.PI * 2);
    context.ctx.stroke();
    context.ctx.fillText(node.id + "", p.x - 10, p.y - 10);
    context.ctx.restore();
  }

  drawSupport(node, context) {
    const p = context.grid.worldToScreen(node.position);
    if (node.soporte) {
      if (node.soporte !== "soporteTres") {
        context.ctx.drawImage(soportes[node.soporte], p.x - 15, p.y);
      } else {
        context.ctx.drawImage(soportes[node.soporte], p.x - 20, p.y - 10);
      }
    }
  }

  drawHorizontalLine(context, magX, text, p, color) {
    context.ctx.save();
    context.ctx.strokeStyle = color;
    context.ctx.fillStyle = color;
    let angle;
    if (Math.sign(magX) === -1) {
      context.ctx.textAlign = "left";
      angle = Math.PI;
    } else {
      context.ctx.textAlign = "right";
      angle = 0;
    }
    context.ctx.textBaseline = "middle";
    context.ctx.beginPath();
    context.ctx.moveTo(p.x, p.y);
    context.ctx.lineTo(p.x - 50 * Math.sign(magX), p.y);
    context.ctx.stroke();
    context.ctx.fillText(text, p.x - 50 * Math.sign(magX), p.y);
    const headLength = 8;
    context.ctx.beginPath();
    context.ctx.moveTo(p.x, p.y);
    context.ctx.lineTo(
      p.x - headLength * Math.cos(angle - Math.PI / 6),
      p.y - headLength * Math.sin(angle - Math.PI / 6),
    );
    context.ctx.lineTo(
      p.x - headLength * Math.cos(angle + Math.PI / 6),
      p.y - headLength * Math.sin(angle + Math.PI / 6),
    );
    context.ctx.lineTo(p.x, p.y);
    context.ctx.closePath();
    context.ctx.fill();
    context.ctx.restore();
  }

  drawVerticalLine(context, magY, text, p, color) {
    context.ctx.save();
    context.ctx.strokeStyle = color;
    context.ctx.fillStyle = color;
    let angle;
    if (Math.sign(magY) === -1) {
      context.ctx.textBaseline = "bottom";
      angle = Math.PI / 2;
    } else {
      context.ctx.textBaseline = "top";
      angle = (3 * Math.PI) / 2;
    }
    context.ctx.textAlign = "center";
    context.ctx.beginPath();
    context.ctx.moveTo(p.x, p.y);
    context.ctx.lineTo(p.x, p.y + 50 * Math.sign(magY));
    context.ctx.stroke();
    context.ctx.fillText(text, p.x, p.y + 50 * Math.sign(magY));
    const headLength = 8;
    context.ctx.beginPath();
    context.ctx.moveTo(p.x, p.y);
    context.ctx.lineTo(
      p.x - headLength * Math.cos(angle - Math.PI / 6),
      p.y - headLength * Math.sin(angle - Math.PI / 6),
    );
    context.ctx.lineTo(
      p.x - headLength * Math.cos(angle + Math.PI / 6),
      p.y - headLength * Math.sin(angle + Math.PI / 6),
    );
    context.ctx.lineTo(p.x, p.y);
    context.ctx.closePath();
    context.ctx.fill();
    context.ctx.restore();
  }

  drawArrow(magX, magY, p) {
    const mag = pointDistance({ x: 0, y: 0 }, { x: magX, y: magY });
    const uMag = { x: magX / mag, y: magY / mag };
    context.ctx.beginPath();
    context.ctx.moveTo(p.x, p.y);
    context.ctx.strokeStyle = "red";
    context.ctx.fillStyle = "red";
    const end = { x: p.x - uMag.x * 5 * mag, y: p.y + uMag.y * 5 * mag };
    context.ctx.lineTo(end.x, end.y);
    context.ctx.font = "12px arial";
    context.ctx.textAlign = "right";
    context.ctx.fillText(mag.toFixed(2) + "kN", end.x, end.y);
    context.ctx.stroke();
    // Draw arrowhead
    const headLength = 10;
    const angle = Math.atan2(-magY, magX);
    context.ctx.beginPath();
    context.ctx.moveTo(p.x, p.y);
    context.ctx.lineTo(
      p.x - headLength * Math.cos(angle - Math.PI / 6),
      p.y - headLength * Math.sin(angle - Math.PI / 6),
    );
    context.ctx.lineTo(
      p.x - headLength * Math.cos(angle + Math.PI / 6),
      p.y - headLength * Math.sin(angle + Math.PI / 6),
    );
    context.ctx.lineTo(p.x, p.y);
    context.ctx.closePath();
    context.ctx.fill();
  }

  // Función para dibujar fuerzas en nodos, filtrando por nivel actual
  drawForce(node, context) {
    if (!node || !node.position) return;

    // 🔑 FILTRAR POR NIVEL ACTUAL
    let currentZ = 0;
    if (context.currentStory && context.stories) {
      const story = context.stories.find((s) => s.name === context.currentStory);
      if (story) currentZ = story.z;
    }

    const nodeZ = node.position.z || 0;
    if (Math.abs(nodeZ - currentZ) > 0.01) {
      return; // Nodo de otro nivel, NO mostrar fuerza
    }

    //context.ctx.textAlign = "right";
    const p = context.grid.worldToScreen(node.position);
    const colors = {
      CM: "brown",
      CV: "orange",
      CVVM: "white",
      CVVP: "black",
      CN: "whitesmoke",
      CLL: "lightblue",
    };
    /* Object.entries(node.force.loads).forEach(([load, { x, y }]) => { */
    const { x, y } = node.force.loads[context.options.currentLoad];
    const magX = x;
    const magY = y;
    const mag = pointDistance({ x: 0, y: 0 }, { x: magX, y: magY });
    const uMag = { x: magX / mag, y: magY / mag };
    const end = { x: p.x - uMag.x * 5 * mag, y: p.y + uMag.y * 5 * mag };
    Object.assign(context.ctx, node.style.getModel().FORCE);
    if (magX && magX !== 0) {
      this.drawHorizontalLine(context, magX, `${magX.toFixed(2)}kN`, p, colors[context.options.currentLoad]);
    }
    if (magY && magY !== 0) {
      this.drawVerticalLine(context, magY, `${magY.toFixed(2)}kN`, p, colors[context.options.currentLoad]);
    }
    if ((magX || magY) && (magX !== 0 || magY !== 0)) {
    }
    /* }); */
  }

  drawReaction(node, context) {
    //context.ctx.textAlign = "right";
    const p = context.grid.worldToScreen(node.position);
    const magX = node.reaction.x;
    const magY = node.reaction.y;
    const mag = pointDistance({ x: 0, y: 0 }, { x: magX, y: magY });
    const uMag = { x: magX / mag, y: magY / mag };
    const end = { x: p.x - uMag.x * 5 * mag, y: p.y + uMag.y * 5 * mag };
    Object.assign(context.ctx, node.style.getModel().FORCE);
    if (magX && Math.abs(magX) > 0.0000000001) {
      this.drawHorizontalLine(context, magX, `${magX.toFixed(2)}kN`, p, "aquamarine");
    }
    if (magY && Math.abs(magY) > 0.0000000001) {
      this.drawVerticalLine(context, magY, `${magY.toFixed(2)}kN`, p, "aquamarine");
    }
  }

  drawWireBeam(beam, context) {
    const p1 = context.grid.worldToScreen(beam.node1.position);
    const p2 = context.grid.worldToScreen(beam.node2.position);
    context.ctx.save();
    Object.assign(context.ctx, beam.style.get().WIREFRAME);
    context.ctx.beginPath();
    context.ctx.moveTo(p1.x, p1.y);
    context.ctx.lineTo(p2.x, p2.y);
    context.ctx.stroke();
    context.ctx.restore();
  }

  drawBeam(beam, context) {
    // // VERIFICAR QUE LA VIGA TENGA AMBOS NODOS
    // if (!beam || !beam.node1 || !beam.node2) {
    //   return;
    // }

    // const pos1 = this.getNodePosition(beam.node1, context); //se agregio esta linea para obtener la posicion del nodo dependiendo de la vista
    // const pos2 = this.getNodePosition(beam.node2, context); //se agregio esta linea para obtener la posicion del nodo dependiendo de la vista

    // const p1 = context.grid.worldToScreen({ x: pos1.x, y: pos1.y });
    // const p2 = context.grid.worldToScreen({ x: pos2.x, y: pos2.y });
    // context.ctx.save();
    // Object.assign(context.ctx, beam.style.get().MODEL);
    // context.ctx.beginPath();
    // context.ctx.moveTo(p1.x, p1.y);
    // context.ctx.lineTo(p2.x, p2.y);
    // context.ctx.stroke();
    // /*     context.ctx.globalCompositeOperation = "destination-out";
    // context.ctx.strokeStyle = "black";
    // context.ctx.lineWidth = 11;
    // context.ctx.stroke(); */
    // context.ctx.restore();

    if (!beam || !beam.node1 || !beam.node2) return;

    // Obtener la altura Z del nivel actual
    let currentZ = 0;
    if (context.currentStory && context.stories) {
      const story = context.stories.find((s) => s.name === context.currentStory);
      if (story) currentZ = story.z;
    }

    // SOLO dibujar vigas cuyos dos nodos están en el nivel actual
    const z1 = beam.node1.position.z || 0;
    const z2 = beam.node2.position.z || 0;
    if (Math.abs(z1 - currentZ) > 0.01 || Math.abs(z2 - currentZ) > 0.01) {
      return; // Viga de otro nivel, no dibujar
    }

    const p1 = context.grid.worldToScreen({ x: beam.node1.position.x, y: beam.node1.position.y });
    const p2 = context.grid.worldToScreen({ x: beam.node2.position.x, y: beam.node2.position.y });

    context.ctx.save();

    // Si está en modo wireframe, usar estilo wireframe
    if (context.options.showWireframe) {
      Object.assign(context.ctx, beam.style.get().WIREFRAME);
    } else {
      Object.assign(context.ctx, beam.style.get().MODEL);
    }

    Object.assign(context.ctx, beam.style.get().MODEL);
    context.ctx.beginPath();
    context.ctx.moveTo(p1.x, p1.y);
    context.ctx.lineTo(p2.x, p2.y);
    context.ctx.stroke();
    context.ctx.restore();
  }

  // FUNCION PARA DIBUJAR EL ID DE LA VIGA EN EL CENTRO DE LA MISMA, ORIENTADO SEGUN SU ANGULO, Y SOLO SI AMBOS NODOS PERTENECEN AL NIVEL ACTUAL
  drawBeamID(beam, context) {
    if (!beam || !beam.node1 || !beam.node2) return;

    // 🔑 FILTRAR POR NIVEL ACTUAL
    let currentZ = 0;
    if (context.currentStory && context.stories) {
      const story = context.stories.find((s) => s.name === context.currentStory);
      if (story) currentZ = story.z;
    }

    const z1 = beam.node1.position.z || 0;
    const z2 = beam.node2.position.z || 0;
    if (Math.abs(z1 - currentZ) > 0.01 || Math.abs(z2 - currentZ) > 0.01) {
      return; // Viga de otro nivel, NO mostrar ID
    }
    context.ctx.save();
    const p1 = context.grid.worldToScreen(beam.node1.position);
    const p2 = context.grid.worldToScreen(beam.node2.position);
    const mid = { x: (p1.x + p2.x) * 0.5, y: (p1.y + p2.y) * 0.5 };
    Object.assign(context.ctx, beam.style.get().ID);
    context.ctx.translate(mid.x, mid.y);
    context.ctx.rotate(beam.angle);
    context.ctx.fillText(`${beam.id}`, 0, 10);
    context.ctx.restore();
  }

  // DRAW GRID ORIGINAL
  drawStandardGrid(grid, context) {
    const ctx = context.ctx; // Assuming you're using a canvas context
    ctx.save();

    const topLeft = grid.screenToWorld({ x: 0, y: 0 });
    const bottomRigth = grid.screenToWorld({ x: grid.width, y: grid.height });

    const spacing = 1; /* grid.gridSpacing */

    /* const startX = Math.floor(topLeft.x) - (topLeft.x - spacing); */
    const startX = spacing - (topLeft.x % spacing);

    ctx.lineWidth = 0.1;
    ctx.strokeStyle = "white";
    ctx.fillStyle = "gray";
    const textAlign = ctx.textAlign;
    ctx.textAlign = "center";
    for (let x = topLeft.x + startX; x <= bottomRigth.x; x += spacing) {
      const start = grid.worldToScreen({ x: x, y: topLeft.y });
      const end = grid.worldToScreen({ x: x, y: bottomRigth.y });
      ctx.beginPath();
      ctx.moveTo(start.x, start.y);
      ctx.lineTo(end.x, end.y);
      ctx.stroke();
      ctx.fillText(`${x.toFixed(0)}`, end.x, grid.height);
    }

    ctx.textAlign = textAlign;
    ctx.textBaseline = "middle";
    /* const startY = Math.floor(topLeft.y) - (topLeft.y - spacing); */
    const startY = spacing - (topLeft.y % spacing);
    for (let y = topLeft.y + startY; y >= bottomRigth.y; y -= spacing) {
      const start = grid.worldToScreen({ x: topLeft.x, y: y });
      const end = grid.worldToScreen({ x: bottomRigth.x, y: y });
      ctx.beginPath();
      ctx.moveTo(start.x, start.y);
      ctx.lineTo(end.x, end.y);
      ctx.stroke();
      ctx.fillText(`${y.toFixed(0)}`, 0, start.y);
    }
    ctx.restore();
  }

  // --------------- ESTILO DE DRAW GRID INSPIRADO EN ETABS ----------------

  drawGrid(grid, context) {
    const ctx = context.ctx;
    ctx.save();
    ctx.shadowBlur = 0;

    // Si hay un grid de referencia definido, dibujar SOLO ese
    if (context.referenceGrid && context.referenceGrid.xPositions && context.referenceGrid.xPositions.length > 0) {
      this.drawReferenceGridOnly(grid, context);
      ctx.restore();
      return;
    }

    // Si no hay grid de referencia, dibujar grid estándar (opcional)
    this.drawStandardGrid(grid, context);
    ctx.restore();
  }

  // DIBUJAR SOLO EL GRID DE REFERENCIA CON ESTILO ETABS
  drawReferenceGridOnly(grid, context) {
    const ctx = context.ctx;
    const refGrid = context.referenceGrid;

    if (!refGrid || !refGrid.xPositions || refGrid.xPositions.length === 0) return;

    const xPositions = refGrid.xPositions;
    const yPositions = refGrid.yPositions;
    const xLabels = refGrid.xLabels;
    const yLabels = refGrid.yLabels;

    // Colores estilo ETABS
    const lineColor = "#3a6a9a";
    const textColor = "#8aadcc";
    const axisColor = "#00ff00";
    // const coordColor = "#aaccee";

    ctx.lineWidth = 0.8;
    ctx.font = "11px 'Segoe UI', Arial";
    ctx.setLineDash([]);

    const minX = Math.min(...xPositions);
    const maxX = Math.max(...xPositions);
    const minY = Math.min(...yPositions);
    const maxY = Math.max(...yPositions);

    // ========== DIBUJAR EJES X e Y CON FLECHAS ==========
    const arrowSize = 6; // Tamaño de la flecha

    // Eje X (horizontal) - línea roja en Y=0
    const ejeXStart = grid.worldToScreen({ x: minX, y: 0 });
    const ejeXEnd = grid.worldToScreen({ x: 2, y: 0 });

    ctx.beginPath();
    ctx.strokeStyle = axisColor;
    ctx.fillStyle = axisColor;
    ctx.lineWidth = 1.5;
    ctx.moveTo(ejeXStart.x, ejeXStart.y);
    ctx.lineTo(ejeXEnd.x, ejeXEnd.y);
    ctx.stroke();

    // Flecha del eje X (punta en dirección positiva)
    const arrowXTip = grid.worldToScreen({ x: 2, y: 0 });
    ctx.beginPath();
    ctx.moveTo(arrowXTip.x, arrowXTip.y);
    ctx.lineTo(arrowXTip.x - arrowSize, arrowXTip.y - arrowSize / 2);
    ctx.lineTo(arrowXTip.x - arrowSize, arrowXTip.y + arrowSize / 2);
    ctx.fill();

    // Etiqueta del eje X
    ctx.fillStyle = axisColor;
    ctx.font = "bold 12px 'Segoe UI', Arial";
    const ejeXLabelPos = grid.worldToScreen({ x: maxX + 1.2, y: 0 });
    ctx.fillText("X", ejeXLabelPos.x + 3, ejeXLabelPos.y - 3);

    // Eje Y (vertical) - línea roja en X=0
    const ejeYStart = grid.worldToScreen({ x: 0, y: minY });
    const ejeYEnd = grid.worldToScreen({ x: 0, y: 2 });

    ctx.beginPath();
    ctx.moveTo(ejeYStart.x, ejeYStart.y);
    ctx.lineTo(ejeYEnd.x, ejeYEnd.y);
    ctx.stroke();

    // Flecha del eje Y (punta en dirección positiva)
    const arrowYTip = grid.worldToScreen({ x: 0, y: 2 });
    ctx.beginPath();
    ctx.moveTo(arrowYTip.x, arrowYTip.y);
    ctx.lineTo(arrowYTip.x - arrowSize / 2, arrowYTip.y + arrowSize); // ← Cambiado: + arrowSize
    ctx.lineTo(arrowYTip.x + arrowSize / 2, arrowYTip.y + arrowSize); // ← Cambiado: + arrowSize
    ctx.fill();

    // Etiqueta del eje Y
    const ejeYLabelPos = grid.worldToScreen({ x: 0, y: maxY + 1.2 });
    ctx.fillText("Y", ejeYLabelPos.x + 5, ejeYLabelPos.y + 3);

    // ========== DIBUJAR NÚMEROS DE COORDENADAS EN LOS EJES ==========
    // ctx.font = "10px 'Segoe UI', Arial";
    // ctx.fillStyle = textColor;
    // ctx.lineWidth = 0.5;

    // // Coordenadas en el eje X
    // xPositions.forEach((x) => {
    //   const screenPos = grid.worldToScreen({ x: x, y: 0 });
    //   // Pequeña marca en el eje
    //   ctx.beginPath();
    //   ctx.moveTo(screenPos.x, screenPos.y - 3);
    //   ctx.lineTo(screenPos.x, screenPos.y + 3);
    //   ctx.stroke();
    //   // Número
    //   ctx.fillText(x.toString(), screenPos.x - 5, screenPos.y - 5);
    // });

    // // Coordenadas en el eje Y
    // yPositions.forEach((y) => {
    //   const screenPos = grid.worldToScreen({ x: 0, y: y });
    //   // Pequeña marca en el eje
    //   ctx.beginPath();
    //   ctx.moveTo(screenPos.x - 3, screenPos.y);
    //   ctx.lineTo(screenPos.x + 3, screenPos.y);
    //   ctx.stroke();
    //   // Número
    //   ctx.fillText(y.toString(), screenPos.x + 5, screenPos.y + 3);
    // });

    // ========== DIBUJAR EL ORIGEN (0,0) ==========
    const origin = grid.worldToScreen({ x: 0, y: 0 });
    ctx.beginPath();
    ctx.arc(origin.x, origin.y, 5, 0, 2 * Math.PI);
    ctx.fillStyle = "#ff8888";
    ctx.fill();
    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 10px Arial";
    ctx.fillText("0,0", origin.x + 8, origin.y - 5);

    // ========== DIBUJAR LÍNEAS DEL GRID (solo dentro del área) ==========
    ctx.lineWidth = 0.5;
    ctx.strokeStyle = lineColor;
    ctx.fillStyle = textColor;
    ctx.font = "10px 'Segoe UI', Arial";

    // Líneas verticales (en X)
    xPositions.forEach((x, index) => {
      const start = grid.worldToScreen({ x: x, y: minY });
      const end = grid.worldToScreen({ x: x, y: maxY });

      if (start.x >= -100 && start.x <= grid.width + 100) {
        ctx.beginPath();
        ctx.moveTo(start.x, start.y);
        ctx.lineTo(end.x, end.y);
        ctx.stroke();

        // Etiqueta A, B, C... en la parte inferior
        const labelPos = grid.worldToScreen({ x: x, y: minY - 0.5 });
        ctx.fillStyle = textColor;
        ctx.fillText(xLabels[index], labelPos.x - 4, labelPos.y + 5);
      }
    });

    // Líneas horizontales (en Y)
    yPositions.forEach((y, index) => {
      const start = grid.worldToScreen({ x: minX, y: y });
      const end = grid.worldToScreen({ x: maxX, y: y });

      if (start.y >= -100 && start.y <= grid.height + 100) {
        ctx.beginPath();
        ctx.moveTo(start.x, start.y);
        ctx.lineTo(end.x, end.y);
        ctx.stroke();

        // Etiqueta 1, 2, 3... en el borde izquierdo
        const labelPos = grid.worldToScreen({ x: minX - 0.5, y: y });
        ctx.fillStyle = textColor;
        ctx.fillText(yLabels[index].toString(), labelPos.x - 15, labelPos.y + 4);
      }
    });

    // ========== COORDENADAS ENTRE EJES (en cada celda) ==========
    // ctx.font = "9px 'Segoe UI', Arial";
    // ctx.fillStyle = coordColor;
    // ctx.setLineDash([2, 2]);
    // ctx.lineWidth = 0.3;

    // for (let i = 0; i < xPositions.length - 1; i++) {
    //   for (let j = 0; j < yPositions.length - 1; j++) {
    //     const x = (xPositions[i] + xPositions[i + 1]) / 2;
    //     const y = (yPositions[j] + yPositions[j + 1]) / 2;
    //     const screenPos = grid.worldToScreen({ x: x, y: y });

    //     // Mostrar coordenadas en el centro de cada celda
    //     ctx.fillStyle = coordColor;
    //     ctx.fillText(`(${x.toFixed(1)}, ${y.toFixed(1)})`, screenPos.x - 22, screenPos.y + 3);
    //   }
    // }

    // ========== CONTORNO DEL ÁREA (punteado) ==========
    const topLeft = grid.worldToScreen({ x: minX, y: maxY });
    const topRight = grid.worldToScreen({ x: maxX, y: maxY });
    const bottomLeft = grid.worldToScreen({ x: minX, y: minY });
    const bottomRight = grid.worldToScreen({ x: maxX, y: minY });

    ctx.beginPath();
    ctx.strokeStyle = "#4a90d9";
    ctx.lineWidth = 1.5;
    ctx.setLineDash([8, 4]);
    ctx.moveTo(topLeft.x, topLeft.y);
    ctx.lineTo(topRight.x, topRight.y);
    ctx.lineTo(bottomRight.x, bottomRight.y);
    ctx.lineTo(bottomLeft.x, bottomLeft.y);
    ctx.closePath();
    ctx.stroke();
    ctx.setLineDash([]);

    // Restaurar configuración
    ctx.font = "11px 'Segoe UI', Arial";
    ctx.fillStyle = "#ffffff";

    // Al final, mostrar el nivel actual
    if (context.currentStory && context.stories) {
      const story = context.stories.find((s) => s.name === context.currentStory);
      if (story) {
        context.ctx.font = "bold 14px 'Segoe UI', Arial";
        context.ctx.fillStyle = "#4a90d9";
        context.ctx.setLineDash([]);
        context.ctx.fillText(`📍 Nivel: ${context.currentStory} (Z = ${story.z.toFixed(2)} m)`, 15, 50);
      }
    }
  }

  // drawReferenceGridOnly(grid, context) {
  //   const ctx = context.ctx;
  //   const refGrid = context.referenceGrid;
  //   const elevationManager = context.elevationManager;

  //   if (!refGrid || !refGrid.xPositions || refGrid.xPositions.length === 0) return;

  //   const xPositions = refGrid.xPositions;
  //   const yPositions = refGrid.yPositions;
  //   const xLabels = refGrid.xLabels;
  //   const yLabels = refGrid.yLabels;
  //   const storyCount = refGrid.storyCount;
  //   const storyHeight = refGrid.storyHeight;

  //   // Colores estilo ETABS
  //   const lineColor = "#3a6a9a";
  //   const textColor = "#8aadcc";
  //   const axisColor = "#ff6666";

  //   ctx.lineWidth = 0.8;
  //   ctx.font = "11px 'Segoe UI', Arial";
  //   ctx.setLineDash([]);

  //   // Verificar si estamos en vista de elevación
  //   const isElevationView = elevationManager && elevationManager.current2DView !== "plan";
  //   const isXZView = elevationManager && elevationManager.current2DView === "elevation-xz";
  //   const isYZView = elevationManager && elevationManager.current2DView === "elevation-yz";

  //   if (isElevationView) {
  //     // ========== VISTA DE ELEVACIÓN (X-Z o Y-Z) ==========

  //     // Determinar el rango de coordenadas
  //     let positions, labels;
  //     if (isXZView) {
  //       positions = xPositions;
  //       labels = xLabels;
  //     } else {
  //       positions = yPositions;
  //       labels = yLabels;
  //     }

  //     const minPos = Math.min(...positions);
  //     const maxPos = Math.max(...positions);
  //     const totalHeight = storyCount * storyHeight;

  //     // Dibujar líneas horizontales (pisos)
  //     for (let floor = 0; floor <= storyCount; floor++) {
  //       const y = floor * storyHeight;
  //       const screenY = grid.worldToScreen({ x: 0, y: y }).y;

  //       ctx.beginPath();
  //       ctx.strokeStyle = floor === 0 ? axisColor : lineColor;
  //       ctx.lineWidth = floor === 0 ? 1.5 : 0.5;
  //       ctx.setLineDash(floor === 0 ? [] : [5, 5]);
  //       ctx.moveTo(0, screenY);
  //       ctx.lineTo(grid.width, screenY);
  //       ctx.stroke();

  //       // Etiqueta del piso
  //       ctx.fillStyle = floor === 0 ? axisColor : textColor;
  //       ctx.font = floor === 0 ? "bold 10px Arial" : "10px Arial";
  //       const label = floor === 0 ? "BASE" : `STORY${floor}`;
  //       ctx.fillText(label, 10, screenY - 3);
  //     }

  //     // Dibujar líneas verticales (ejes X o Y)
  //     positions.forEach((pos, index) => {
  //       const screenX = grid.worldToScreen({ x: pos, y: 0 }).x;

  //       ctx.beginPath();
  //       ctx.strokeStyle = lineColor;
  //       ctx.lineWidth = 0.5;
  //       ctx.moveTo(screenX, 0);
  //       ctx.lineTo(screenX, grid.height);
  //       ctx.stroke();

  //       // Etiqueta del eje (A, B, C o 1, 2, 3)
  //       ctx.fillStyle = textColor;
  //       ctx.fillText(labels[index], screenX - 4, grid.height - 8);
  //     });

  //     // Dibujar origen
  //     const origin = grid.worldToScreen({ x: 0, y: 0 });
  //     ctx.beginPath();
  //     ctx.arc(origin.x, origin.y, 4, 0, 2 * Math.PI);
  //     ctx.fillStyle = "#ff8888";
  //     ctx.fill();

  //     ctx.setLineDash([]);
  //     ctx.restore();
  //     return;
  //   }

  //   // ========== VISTA EN PLANTA (original) ==========
  //   // ... resto del código original para vista en planta ...

  //   const minX = Math.min(...xPositions);
  //   const maxX = Math.max(...xPositions);
  //   const minY = Math.min(...yPositions);
  //   const maxY = Math.max(...yPositions);

  //   // Dibujar líneas verticales
  //   xPositions.forEach((x, index) => {
  //     const start = grid.worldToScreen({ x: x, y: minY });
  //     const end = grid.worldToScreen({ x: x, y: maxY });
  //     if (start.x >= -100 && start.x <= grid.width + 100) {
  //       ctx.beginPath();
  //       ctx.moveTo(start.x, start.y);
  //       ctx.lineTo(end.x, end.y);
  //       ctx.stroke();
  //       const labelPos = grid.worldToScreen({ x: x, y: minY - 0.5 });
  //       ctx.fillStyle = textColor;
  //       ctx.fillText(xLabels[index], labelPos.x - 4, labelPos.y + 5);
  //     }
  //   });

  //   // Dibujar líneas horizontales
  //   yPositions.forEach((y, index) => {
  //     const start = grid.worldToScreen({ x: minX, y: y });
  //     const end = grid.worldToScreen({ x: maxX, y: y });
  //     if (start.y >= -100 && start.y <= grid.height + 100) {
  //       ctx.beginPath();
  //       ctx.moveTo(start.x, start.y);
  //       ctx.lineTo(end.x, end.y);
  //       ctx.stroke();
  //       const labelPos = grid.worldToScreen({ x: minX - 0.5, y: y });
  //       ctx.fillStyle = textColor;
  //       ctx.fillText(yLabels[index].toString(), labelPos.x - 15, labelPos.y + 4);
  //     }
  //   });

  //   // Origen
  //   const origin = grid.worldToScreen({ x: 0, y: 0 });
  //   ctx.beginPath();
  //   ctx.arc(origin.x, origin.y, 5, 0, 2 * Math.PI);
  //   ctx.fillStyle = "#ff8888";
  //   ctx.fill();

  //   ctx.setLineDash([]);
  //   ctx.restore();
  // }

  
  // DIBUJAR SOLO EL GRID DE REFERENCIA CON ESTILO ETABS, PERO ADAPTADO A VISTA DE ELEVACIÓN (X-Z O Y-Z)
  drawElevationGridOnly(grid, context) {
    const ctx = context.ctx;
    const refGrid = context.referenceGrid;
    const currentElevationX = context.currentElevationX;
    const currentY = context.getCurrentElevationY ? context.getCurrentElevationY() : 0;

    if (!refGrid || !refGrid.xPositions || refGrid.xPositions.length === 0) return;

    const xPositions = refGrid.xPositions; // Posiciones en X (A, B, C...)
    const xLabels = refGrid.xLabels; // ['A', 'B', 'C', ...]
    const storyCount = refGrid.storyCount;
    const storyHeight = refGrid.storyHeight;

    // Colores estilo ETABS
    const lineColor = "#3a6a9a";
    const textColor = "#8aadcc";
    const axisColor = "#ff6666";

    ctx.lineWidth = 0.8;
    ctx.font = "11px 'Segoe UI', Arial";
    ctx.setLineDash([]);

    // ========== DIBUJAR LÍNEAS HORIZONTALES (pisos/niveles de altura) ==========
    for (let floor = 0; floor <= storyCount; floor++) {
      const z = floor * storyHeight;
      const screenY = grid.worldToScreen({ x: 0, y: z }).y;

      ctx.beginPath();
      ctx.strokeStyle = floor === 0 ? axisColor : lineColor;
      ctx.lineWidth = floor === 0 ? 1.5 : 0.5;
      ctx.setLineDash(floor === 0 ? [] : [5, 5]);
      ctx.moveTo(0, screenY);
      ctx.lineTo(grid.width, screenY);
      ctx.stroke();

      // Etiqueta del piso (BASE, STORY1, STORY2...)
      ctx.fillStyle = floor === 0 ? axisColor : textColor;
      ctx.font = floor === 0 ? "bold 10px Arial" : "10px Arial";
      const label = floor === 0 ? "BASE" : `STORY${floor}`;
      ctx.fillText(label, 10, screenY - 5);

      // Altura en metros
      ctx.fillStyle = "#666";
      ctx.font = "9px Arial";
      ctx.fillText(`${z}m`, 80, screenY - 5);
    }

    // ========== DIBUJAR LÍNEAS VERTICALES (ejes X: A, B, C...) ==========
    xPositions.forEach((x, index) => {
      const screenX = grid.worldToScreen({ x: x, y: 0 }).x;

      // Resaltar el eje actual
      const isActive = currentElevationX === xLabels[index];

      ctx.beginPath();
      ctx.strokeStyle = isActive ? axisColor : lineColor;
      ctx.lineWidth = isActive ? 2 : 0.8;
      ctx.setLineDash(isActive ? [] : [8, 4]);
      ctx.moveTo(screenX, 0);
      ctx.lineTo(screenX, grid.height);
      ctx.stroke();

      // Etiqueta del eje (A, B, C...)
      ctx.fillStyle = isActive ? axisColor : textColor;
      ctx.font = isActive ? "bold 12px Arial" : "11px Arial";
      ctx.fillText(xLabels[index], screenX - 6, grid.height - 10);
    });

    ctx.setLineDash([]);

    // ========== DIBUJAR ORIGEN (0,0) ==========
    const origin = grid.worldToScreen({ x: 0, y: 0 });
    ctx.beginPath();
    ctx.arc(origin.x, origin.y, 5, 0, 2 * Math.PI);
    ctx.fillStyle = "#ff8888";
    ctx.fill();
    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 10px Arial";
    ctx.fillText("0,0", origin.x + 8, origin.y - 5);

    // ========== TÍTULO DE LA VISTA ==========
    ctx.font = "bold 12px 'Segoe UI', Arial";
    ctx.fillStyle = "#4a90d9";
    ctx.fillText(`📐 Vista X-Z (Eje ${currentElevationX}) - Y = ${currentY}m`, 15, 30);

    // Instrucción
    ctx.font = "10px Arial";
    ctx.fillStyle = "#888";
    ctx.fillText("Haz clic para dibujar | Esc para salir", 15, 50);
  }

  drawState(state) {}

  drawSelectionState(state, context) {
    context.ctx.save();
    const start = context.grid.worldToScreen(state.selectionStart);
    const end = context.grid.worldToScreen(state.selectionEnd);
    const width = end.x - start.x;
    const height = end.y - start.y;
    // Semi-transparent fill
    context.ctx.fillStyle = "rgba(0, 150, 255, 0.2)"; // Light blue with transparency
    context.ctx.fillRect(start.x, start.y, width, height);
    // Glowing border
    context.ctx.strokeStyle = "rgba(0, 150, 255, 1)"; // Solid blue border
    context.ctx.lineWidth = 2;
    // Glow effect
    context.ctx.shadowColor = "rgba(0, 150, 255, 0.7)";
    context.ctx.shadowBlur = 3;
    context.ctx.strokeRect(start.x, start.y, width, height);
    context.ctx.restore();
  }

  drawTrussDrawingState(state, context) {
    // const last_point = state.shape.getFirstPoint();
    // const p = context.grid.worldToScreen(context.mousePos);
    // context.ctx.save();
    // context.ctx.beginPath();
    // context.ctx.fillStyle = "red";
    // context.ctx.arc(p.x, p.y, context.grid.size, 0, Math.PI * 2);
    // context.ctx.fill();
    // if (last_point) {
    //   var c = context.grid.worldToScreen(last_point.position);
    //   const mouse = context.grid.worldToScreen(context.mousePos);
    //   context.ctx.strokeStyle = "gray";
    //   context.ctx.beginPath();
    //   context.ctx.moveTo(c.x, c.y);
    //   context.ctx.lineTo(mouse.x, mouse.y);
    //   context.ctx.stroke();
    // }
    // context.ctx.restore();
    const last_point = state.shape.getFirstPoint();
    const p = context.grid.worldToScreen(context.mousePos);
    context.ctx.save();

    // Dibujar el punto del mouse
    context.ctx.beginPath();
    context.ctx.fillStyle = "red";
    context.ctx.arc(p.x, p.y, context.grid.size, 0, Math.PI * 2);
    context.ctx.fill();

    if (last_point) {
      var c = context.grid.worldToScreen(last_point.position);
      const mouse = context.grid.worldToScreen(context.mousePos);

      // Dibujar línea de preview
      context.ctx.strokeStyle = "#88aaff";
      context.ctx.setLineDash([5, 5]);
      context.ctx.lineWidth = 2;
      context.ctx.beginPath();
      context.ctx.moveTo(c.x, c.y);
      context.ctx.lineTo(mouse.x, mouse.y);
      context.ctx.stroke();

      // Mostrar distancia
      const distance = pointDistance(last_point.position, context.mousePos);
      const midX = (c.x + mouse.x) / 2;
      const midY = (c.y + mouse.y) / 2;
      context.ctx.fillStyle = "#ffffff";
      context.ctx.font = "10px Arial";
      context.ctx.setLineDash([]);
      context.ctx.fillText(`${distance.toFixed(2)}m`, midX, midY - 10);
    }
    context.ctx.restore();
  }

  drawDeflections(context) {
    // 🔑 Obtener nivel actual
    let currentZ = 0;
    if (context.currentStory && context.stories) {
      const story = context.stories.find((s) => s.name === context.currentStory);
      if (story) currentZ = story.z;
    }

    context.ctx.save();
    context.ctx.strokeStyle = "blue";
    context.ctx.fillStyle = "blue";
    context.ctx.textAlign = "center";
    context.ctx.textBaseline = "middle";
    context.deflecciones.forEach((def) => {
      const beam = context.shapes[idx];
      if (!beam || !beam.node1 || !beam.node2) return;

      // Filtrar por nivel
      const z1 = beam.node1.position.z || 0;
      const z2 = beam.node2.position.z || 0;
      if (Math.abs(z1 - currentZ) > 0.01 || Math.abs(z2 - currentZ) > 0.01) {
        return;
      }

      const [x1, x2] = def.x;
      const [y1, y2] = def.y;
      const p1 = context.grid.worldToScreen({ x: x1, y: y1 });
      const p2 = context.grid.worldToScreen({ x: x2, y: y2 });
      context.ctx.beginPath();
      context.ctx.setLineDash([5, 3]);
      context.ctx.moveTo(p1.x, p1.y);
      context.ctx.lineTo(p2.x, p2.y);
      context.ctx.stroke();
    });
    context.desplazamientosPosition.forEach((d, index) => {
      const node = context.nodes[index];
      if (!node) return;

      // Filtrar por nivel
      const nodeZ = node.position.z || 0;
      if (Math.abs(nodeZ - currentZ) > 0.01) return;

      const [x, y, _] = context.matrizDesplazamiento[index];
      const p = context.grid.worldToScreen(d);
      context.ctx.fillText(`dx: ${axisToFixed(x)}`, p.x, p.y);
      context.ctx.fillText(`dy: ${axisToFixed(y)}`, p.x, p.y + 10);
    });

    context.ctx.restore();
  }

  drawMaterials(context) {
    // 🔑 Obtener nivel actual
    let currentZ = 0;
    if (context.currentStory && context.stories) {
      const story = context.stories.find((s) => s.name === context.currentStory);
      if (story) currentZ = story.z;
    }
    context.shapes.forEach((s) => {
      if (!s.node1 || !s.node2) return;

      // Filtrar por nivel
      const z1 = s.node1.position.z || 0;
      const z2 = s.node2.position.z || 0;
      if (Math.abs(z1 - currentZ) > 0.01 || Math.abs(z2 - currentZ) > 0.01) {
        return; // Viga de otro nivel, NO mostrar materiales
      }

      const p1 = context.grid.worldToScreen(s.node1.position);
      const p2 = context.grid.worldToScreen(s.node2.position);
      const mid = midPoint(p1, p2);
      context.ctx.save();
      context.ctx.fillStyle = "white";
      context.ctx.textAlign = "center";
      context.ctx.font = "10px arial";
      context.ctx.translate(mid.x, mid.y);
      context.ctx.rotate(s.angle);
      context.ctx.fillText(`E: ${s.E}`, 0, -30);
      context.ctx.fillText(`A: ${s.A}`, 0, -20);
      context.ctx.restore();
    });
  }
}

export class DeflexionRenderer extends DiseñoRenderer {
  render(CADSystem) {
    this.clearBackground(CADSystem);
    if (CADSystem.options.showGrid) {
      CADSystem.grid.draw(this, CADSystem);
    }
    if (CADSystem.options.showIDs) {
      this.drawDeflectionsIDs(CADSystem);
    }
    CADSystem.nodes.forEach((n) => {
      this.drawSupport(n, CADSystem);
    });

    this.drawDeflections(CADSystem);
    CADSystem.currentState.draw(this, CADSystem);
  }

  drawDeflectionsIDs(context) {
    context.deflecciones.forEach((def, index) => {
      const [x1, x2] = def.x;
      const [y1, y2] = def.y;
      const p1 = { x: x1, y: y1 };
      const p2 = { x: x2, y: y2 };
      const pScreen1 = context.grid.worldToScreen(p1);
      const pScreen2 = context.grid.worldToScreen(p2);
      this.drawBeamID(
        {
          node1: { position: p1 },
          node2: { position: p2 },
          id: context.shapes[index].id,
          angle: Math.atan2(pScreen2.y - pScreen1.y, pScreen2.x - pScreen1.x),
          style: {
            get() {
              return BeamStyle.DEFAULT;
            },
          },
        },
        context,
      );
    });
    context.desplazamientosPosition.forEach((d, index) => {
      this.drawNodeID(
        {
          position: d,
          id: context.nodes[index].id,
          style: {
            get() {
              return NodeStyle.DEFAULT;
            },
          },
        },
        context,
      );
    });
  }
}

export class AxialRenderer extends DiseñoRenderer {
  render(CADSystem) {
    this.clearBackground(CADSystem);
    if (CADSystem.options.showGrid) {
      CADSystem.grid.draw(this, CADSystem);
    }
    CADSystem.nodes.forEach((n) => {
      this.drawSupport(n, CADSystem);
    });
    if (!CADSystem.options.showWireframe) {
      this.drawAxiales(CADSystem);
      CADSystem.nodes.forEach((n) => {
        n.draw(this, CADSystem);
      });
    } else {
      this.drawWireframeAxiales(CADSystem);
    }
    if (CADSystem.options.showFAxialesValues) {
      this.drawAxialesValues(CADSystem);
    }
    if (CADSystem.options.showIDs) {
      CADSystem.shapes.forEach((s) => {
        this.drawBeamID(s, CADSystem);
      });
      CADSystem.nodes.forEach((n) => {
        this.drawNodeID(n, CADSystem);
      });
    }
    if (CADSystem.options.showForces) {
      CADSystem.ctx.save();
      CADSystem.nodes.forEach((n) => {
        this.drawForce(n, CADSystem);
      });
      CADSystem.ctx.restore();
    }
    if (CADSystem.options.showReactions) {
      CADSystem.ctx.save();
      CADSystem.nodes.forEach((n) => {
        this.drawReaction(n, CADSystem);
      });
      CADSystem.ctx.restore();
    }
    CADSystem.currentState.draw(this, CADSystem);
  }
}
