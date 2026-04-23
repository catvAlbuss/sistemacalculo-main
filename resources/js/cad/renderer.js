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

    this.drawActiveGridPoint(CADSystem);

    CADSystem.nodes.forEach((n) => {
      if (!this.shouldDrawNode(n, CADSystem)) return;
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
          if (!this.shouldDrawBeam(s, CADSystem)) return;
          s.draw(this, CADSystem);
        });
        const currentZ = CADSystem.stories?.[CADSystem.activeStory]?.elevation ?? 0;

        CADSystem.shapes.forEach((s) => {
          if (!this.shouldDrawBeam(s, CADSystem)) return;
          s.draw(this, CADSystem);
        });

        CADSystem.parametricModels.forEach((parametric) => {
          parametric.shapes.forEach((s) => {
            s.draw(this, CADSystem);
          });
        });
      }
      CADSystem.nodes.forEach((n) => {
        if (!this.shouldDrawNode(n, CADSystem)) return;
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
        if (!this.shouldDrawBeam(s, CADSystem)) return;
        this.drawBeamID(s, CADSystem);
      });

      CADSystem.nodes.forEach((n) => {
        if (!this.shouldDrawNode(n, CADSystem)) return;
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
    // const p = context.grid.worldToScreen(node.position);
    const p = this.projectPoint(node, context);
    context.ctx.save();
    Object.assign(context.ctx, node.style.get().WIREFRAME);
    context.ctx.beginPath();
    context.ctx.arc(p.x, p.y, node.style.getModel().RADIUS / 2, 0, Math.PI * 2);
    context.ctx.fill();
    context.ctx.restore();
  }

  drawNode(node, context) {
    // const p = context.grid.worldToScreen(node.position);
    const p = this.projectPoint(node, context);
    context.ctx.save();
    const model = node.style.getModel();
    Object.assign(context.ctx, node.style.get().MODEL);
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
    // const p = context.grid.worldToScreen(node.position);
    const p = this.projectPoint(node, context);
    context.ctx.save();
    context.ctx.beginPath();
    Object.assign(context.ctx, node.style.get().ID);
    context.ctx.arc(p.x - 10, p.y - 10, context.grid.size * 2, 0, Math.PI * 2);
    context.ctx.stroke();
    context.ctx.fillText(node.id + "", p.x - 10, p.y - 10);
    context.ctx.restore();
  }

  drawSupport(node, context) {
    // const p = context.grid.worldToScreen(node.position);
    const p = this.projectPoint(node, context);
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

  drawForce(node, context) {
    //context.ctx.textAlign = "right";
    // const p = context.grid.worldToScreen(node.position);
    const p = this.projectPoint(node, context);
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
    // if (magX && magX !== 0) {
    //   this.drawHorizontalLine(context, magX, `${magX.toFixed(2)}kN`, p, colors[context.options.currentLoad]);
    // }
    // if (magY && magY !== 0) {
    //   this.drawVerticalLine(context, magY, `${magY.toFixed(2)}kN`, p, colors[context.options.currentLoad]);
    // }
    // if ((magX || magY) && (magX !== 0 || magY !== 0)) {
    // }
    /* }); */
  }

  drawReaction(node, context) {
    //context.ctx.textAlign = "right";
    // const p = context.grid.worldToScreen(node.position);
    const p = this.projectPoint(node, context);
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
    // const p1 = context.grid.worldToScreen(beam.node1.position);
    // const p2 = context.grid.worldToScreen(beam.node2.position);
    const p1 = this.projectPoint(beam.node1, context);
    const p2 = this.projectPoint(beam.node2, context);
    context.ctx.save();
    Object.assign(context.ctx, beam.style.get().WIREFRAME);
    context.ctx.beginPath();
    context.ctx.moveTo(p1.x, p1.y);
    context.ctx.lineTo(p2.x, p2.y);
    context.ctx.stroke();
    context.ctx.restore();
  }

  drawBeam(beam, context) {
    // const p1 = context.grid.worldToScreen(beam.node1.position);
    // const p2 = context.grid.worldToScreen(beam.node2.position);
    const p1 = this.projectPoint(beam.node1, context);
    const p2 = this.projectPoint(beam.node2, context);
    context.ctx.save();
    Object.assign(context.ctx, beam.style.get().MODEL);
    context.ctx.beginPath();
    context.ctx.moveTo(p1.x, p1.y);
    context.ctx.lineTo(p2.x, p2.y);
    context.ctx.stroke();
    /*     context.ctx.globalCompositeOperation = "destination-out";
    context.ctx.strokeStyle = "black";
    context.ctx.lineWidth = 11;
    context.ctx.stroke(); */
    context.ctx.restore();
  }

  drawBeamID(beam, context) {
    context.ctx.save();
    // const p1 = context.grid.worldToScreen(beam.node1.position);
    // const p2 = context.grid.worldToScreen(beam.node2.position);
    const p1 = this.projectPoint(beam.node1, context);
    const p2 = this.projectPoint(beam.node2, context);
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

    const refGrid = context.referenceGrid;

    const hasLegacyGrid =
      refGrid &&
      Array.isArray(refGrid.xPositions) &&
      refGrid.xPositions.length > 0;

    const hasNewGrid =
      refGrid &&
      (
        (Array.isArray(refGrid.generalGrids) && refGrid.generalGrids.length > 0) ||
        (Array.isArray(refGrid.xGrids) && refGrid.xGrids.length > 0) ||
        (Array.isArray(refGrid.yGrids) && refGrid.yGrids.length > 0)
      );

    if (hasLegacyGrid || hasNewGrid) {
      this.drawReferenceGridOnly(grid, context);
      ctx.restore();
      return;
    }

    this.drawStandardGrid(grid, context);
    ctx.restore();
  }

  getGeneralGridsFromReferenceGrid(refGrid) {
    if (!refGrid) return [];

    // Nuevo formato: generalGrids
    if (Array.isArray(refGrid.generalGrids) && refGrid.generalGrids.length > 0) {
      return refGrid.generalGrids;
    }

    // Compatibilidad con formato viejo: xPositions/yPositions
    const xPositions = Array.isArray(refGrid.xPositions) ? refGrid.xPositions : [];
    const yPositions = Array.isArray(refGrid.yPositions) ? refGrid.yPositions : [];
    const xLabels = Array.isArray(refGrid.xLabels) ? refGrid.xLabels : [];
    const yLabels = Array.isArray(refGrid.yLabels) ? refGrid.yLabels : [];

    if (!xPositions.length && !yPositions.length) return [];

    const minX = xPositions.length ? Math.min(...xPositions) : 0;
    const maxX = xPositions.length ? Math.max(...xPositions) : 10;
    const minY = yPositions.length ? Math.min(...yPositions) : 0;
    const maxY = yPositions.length ? Math.max(...yPositions) : 10;

    const xLines = xPositions.map((x, index) => ({
      id: xLabels[index] ?? String(index + 1),
      x1: x,
      y1: minY,
      x2: x,
      y2: maxY,
      visible: true,
      bubbleLoc: "End",
      source: "x",
    }));

    const yLines = yPositions.map((y, index) => ({
      id: yLabels[index] ?? String(index + 1),
      x1: minX,
      y1: y,
      x2: maxX,
      y2: y,
      visible: true,
      bubbleLoc: "Start",
      source: "y",
    }));

    return [...xLines, ...yLines];
  }

  drawGridBubble(ctx, point, label, strokeColor = "#3a6a9a", textColor = "#8aadcc") {
    ctx.save();
    ctx.beginPath();
    ctx.strokeStyle = strokeColor;
    ctx.lineWidth = 1;
    ctx.arc(point.x, point.y, 10, 0, Math.PI * 2);
    ctx.stroke();

    ctx.fillStyle = textColor;
    ctx.font = "10px 'Segoe UI', Arial";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(String(label), point.x, point.y);
    ctx.restore();
  }

  drawReferenceGridOnly(grid, context) {
    const refGrid = context.referenceGrid;
    const view = context.viewSet?.[context.activeViewIndex];

    if (!refGrid) return;

    const isElevationView = view?.type === "elevation";
    const isElevationX = isElevationView && view.axis === "X"; // letras
    const isElevationY = isElevationView && view.axis === "Y"; // números

    // axis X => letras => plano Y-Z
    if (isElevationX) {
      this.drawElevationZGridOnly(grid, context);
      return;
    }

    // axis Y => números => plano X-Z
    if (isElevationY) {
      this.drawElevationGridOnly(grid, context);
      return;
    }

    this.drawPlanGrid(grid, context);
  }

  // Vista elevación X (A, B, C...) - Plano X-Z
  drawElevationGridOnly(grid, context) {
    const ctx = context.ctx;
    const refGrid = context.referenceGrid;
    const currentElevationZ = context.currentElevationZ;

    let currentY = 0;
    const elev = context.zElevations?.find(
      (e) =>
        e.label === currentElevationZ ||
        e.name === currentElevationZ ||
        e.name === `Elevación ${currentElevationZ}`
    );

    if (elev) currentY = elev.value ?? elev.y ?? 0;

    if (!refGrid || !refGrid.xPositions || refGrid.xPositions.length === 0) {
      return;
    }

    const xPositions = refGrid.xPositions;
    const xLabels = refGrid.xLabels; // A, B, C, D
    const storyCount = refGrid.storyCount;
    const storyHeight = refGrid.storyHeight;

    const axisColor = "#ff6666";
    const lineColor = "#3a6a9a";
    const textColor = "#8aadcc";

    ctx.save();
    ctx.lineWidth = 0.8;
    ctx.font = "11px 'Segoe UI', Arial";
    ctx.setLineDash([]);

    // Líneas horizontales (niveles Z)
    for (let floor = 0; floor <= storyCount; floor++) {
      const z = floor * storyHeight;
      const screenY = grid.worldToScreen({ x: 0, y: z }).y;

      ctx.beginPath();
      ctx.strokeStyle = floor === 0 ? axisColor : lineColor;
      ctx.lineWidth = floor === 0 ? 1.5 : 0.5;
      ctx.setLineDash(floor === 0 ? [] : [5, 5]);
      ctx.moveTo(0, screenY);
      ctx.lineTo(context.canvas.width, screenY);
      ctx.stroke();

      ctx.fillStyle = floor === 0 ? axisColor : textColor;
      ctx.font = floor === 0 ? "bold 10px Arial" : "10px Arial";
      const label = floor === 0 ? "BASE" : `STORY${floor}`;
      ctx.fillText(label, 10, screenY - 5);

      ctx.fillStyle = "#666";
      ctx.font = "9px Arial";
      ctx.fillText(`${z}m`, 80, screenY - 5);
    }

    // Líneas verticales del plano X-Z (A, B, C, D...)
    xPositions.forEach((x, index) => {
      const screenX = grid.worldToScreen({ x, y: 0 }).x;

      ctx.beginPath();
      ctx.strokeStyle = lineColor;
      ctx.lineWidth = 0.8;
      ctx.setLineDash([8, 4]);
      ctx.moveTo(screenX, 0);
      ctx.lineTo(screenX, context.canvas.height);
      ctx.stroke();

      ctx.fillStyle = textColor;
      ctx.font = "11px Arial";
      ctx.fillText(xLabels[index], screenX - 6, context.canvas.height - 10);
    });

    ctx.setLineDash([]);

    const origin = grid.worldToScreen({ x: 0, y: 0 });
    ctx.beginPath();
    ctx.arc(origin.x, origin.y, 5, 0, 2 * Math.PI);
    ctx.fillStyle = "#ff8888";
    ctx.fill();

    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 10px Arial";
    ctx.fillText("0,0", origin.x + 8, origin.y - 5);

    ctx.font = "bold 12px 'Segoe UI', Arial";
    ctx.fillStyle = "#4a90d9";
    ctx.fillText(`📐 ELEVACIÓN Eje Y-${currentElevationZ} (Y = ${currentY}m) - Plano X-Z`, 15, 30);

    ctx.font = "10px Arial";
    ctx.fillStyle = "#888";
    ctx.fillText("Haz clic para dibujar | Esc para salir", 15, 50);

    ctx.restore();
  }

  // Vista elevación Y (1, 2, 3...) - Plano Y-Z
  drawElevationZGridOnly(grid, context) {
    const ctx = context.ctx;
    const refGrid = context.referenceGrid;
    const currentElevationX = context.currentElevationX;

    let currentX = 0;
    const elev = context.xElevations?.find(
      (e) =>
        e.label === currentElevationX ||
        e.name === currentElevationX ||
        e.name === `Elevación ${currentElevationX}`
    );

    if (elev) currentX = elev.value ?? elev.x ?? 0;

    if (!refGrid || !refGrid.yPositions || refGrid.yPositions.length === 0) {
      return;
    }

    const yPositions = refGrid.yPositions;
    const yLabels = refGrid.yLabels;
    const storyCount = refGrid.storyCount;
    const storyHeight = refGrid.storyHeight;

    const axisColor = "#ff6666";
    const lineColor = "#3a6a9a";
    const textColor = "#8aadcc";

    ctx.save();
    ctx.lineWidth = 0.8;
    ctx.font = "11px 'Segoe UI', Arial";
    ctx.setLineDash([]);

    for (let floor = 0; floor <= storyCount; floor++) {
      const z = floor * storyHeight;
      const screenY = grid.worldToScreen({ x: 0, y: z }).y;

      ctx.beginPath();
      ctx.strokeStyle = floor === 0 ? axisColor : lineColor;
      ctx.lineWidth = floor === 0 ? 1.5 : 0.5;
      ctx.setLineDash(floor === 0 ? [] : [5, 5]);
      ctx.moveTo(0, screenY);
      ctx.lineTo(context.canvas.width, screenY);
      ctx.stroke();

      ctx.fillStyle = floor === 0 ? axisColor : textColor;
      ctx.font = floor === 0 ? "bold 10px Arial" : "10px Arial";
      const label = floor === 0 ? "BASE" : `STORY${floor}`;
      ctx.fillText(label, 10, screenY - 5);

      ctx.fillStyle = "#666";
      ctx.font = "9px Arial";
      ctx.fillText(`${z}m`, 80, screenY - 5);
    }

    yPositions.forEach((y, index) => {
      const screenX = grid.worldToScreen({ x: y, y: 0 }).x;

      ctx.beginPath();
      ctx.strokeStyle = lineColor;
      ctx.lineWidth = 0.8;
      ctx.setLineDash([8, 4]);
      ctx.moveTo(screenX, 0);
      ctx.lineTo(screenX, context.canvas.height);
      ctx.stroke();

      ctx.fillStyle = textColor;
      ctx.font = "11px Arial";
      ctx.fillText(yLabels[index], screenX - 6, context.canvas.height - 10);
    });

    ctx.setLineDash([]);

    const origin = grid.worldToScreen({ x: 0, y: 0 });
    ctx.beginPath();
    ctx.arc(origin.x, origin.y, 5, 0, 2 * Math.PI);
    ctx.fillStyle = "#ff8888";
    ctx.fill();

    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 10px Arial";
    ctx.fillText("0,0", origin.x + 8, origin.y - 5);

    ctx.font = "bold 12px 'Segoe UI', Arial";
    ctx.fillStyle = "#4a90d9";
    ctx.fillText(`📐 ELEVACIÓN Eje X-${currentElevationX} (X = ${currentX}m) - Plano Y-Z`, 15, 30);

    ctx.font = "10px Arial";
    ctx.fillStyle = "#888";
    ctx.fillText("Haz clic para dibujar | Esc para salir", 15, 50);

    ctx.restore();
  }

  // Vista planta (X-Y)
  drawPlanGrid(grid, context) {
    const ctx = context.ctx;
    const refGrid = context.referenceGrid;
    const lines = this.getGeneralGridsFromReferenceGrid(refGrid);

    if (!lines.length) return;

    const lineColor = "#3a6a9a";
    const textColor = "#8aadcc";
    const axisColor = "#00ff00";

    ctx.save();
    ctx.lineWidth = 0.8;
    ctx.font = "11px 'Segoe UI', Arial";
    ctx.setLineDash([]);

    const xs = [];
    const ys = [];

    lines.forEach((line) => {
      xs.push(line.x1, line.x2);
      ys.push(line.y1, line.y2);
    });

    const minX = Math.min(...xs);
    const maxX = Math.max(...xs);
    const minY = Math.min(...ys);
    const maxY = Math.max(...ys);

    // Ejes globales
    const arrowSize = 6;

    const ejeXStart = grid.worldToScreen({ x: minX, y: 0 });
    const ejeXEnd = grid.worldToScreen({ x: maxX + 1, y: 0 });

    ctx.beginPath();
    ctx.strokeStyle = axisColor;
    ctx.fillStyle = axisColor;
    ctx.lineWidth = 1.5;
    ctx.moveTo(ejeXStart.x, ejeXStart.y);
    ctx.lineTo(ejeXEnd.x, ejeXEnd.y);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(ejeXEnd.x, ejeXEnd.y);
    ctx.lineTo(ejeXEnd.x - arrowSize, ejeXEnd.y - arrowSize / 2);
    ctx.lineTo(ejeXEnd.x - arrowSize, ejeXEnd.y + arrowSize / 2);
    ctx.fill();

    ctx.font = "bold 12px 'Segoe UI', Arial";
    ctx.fillText("X", ejeXEnd.x + 5, ejeXEnd.y - 4);

    const ejeYStart = grid.worldToScreen({ x: 0, y: minY });
    const ejeYEnd = grid.worldToScreen({ x: 0, y: maxY + 1 });

    ctx.beginPath();
    ctx.moveTo(ejeYStart.x, ejeYStart.y);
    ctx.lineTo(ejeYEnd.x, ejeYEnd.y);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(ejeYEnd.x, ejeYEnd.y);
    ctx.lineTo(ejeYEnd.x - arrowSize / 2, ejeYEnd.y + arrowSize);
    ctx.lineTo(ejeYEnd.x + arrowSize / 2, ejeYEnd.y + arrowSize);
    ctx.fill();

    ctx.fillText("Y", ejeYEnd.x + 5, ejeYEnd.y + 3);

    // Origen
    const origin = grid.worldToScreen({ x: 0, y: 0 });
    ctx.beginPath();
    ctx.arc(origin.x, origin.y, 5, 0, 2 * Math.PI);
    ctx.fillStyle = "#ff8888";
    ctx.fill();
    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 10px Arial";
    ctx.fillText("0,0", origin.x + 8, origin.y - 5);

    // Líneas de grilla generales
    ctx.strokeStyle = lineColor;
    ctx.lineWidth = 0.8;

    lines.forEach((line) => {
      if (line.visible === false) return;

      const p1 = grid.worldToScreen({ x: line.x1, y: line.y1 });
      const p2 = grid.worldToScreen({ x: line.x2, y: line.y2 });

      ctx.beginPath();
      ctx.setLineDash(line.source === "custom" ? [8, 4] : []);
      ctx.moveTo(p1.x, p1.y);
      ctx.lineTo(p2.x, p2.y);
      ctx.stroke();

      const bubblePoint = line.bubbleLoc === "Start" ? p1 : p2;
      this.drawGridBubble(ctx, bubblePoint, line.id, lineColor, textColor);
    });

    ctx.setLineDash([]);

    // Contorno general
    const topLeft = grid.worldToScreen({ x: minX, y: maxY });
    const topRight = grid.worldToScreen({ x: maxX, y: maxY });
    const bottomLeft = grid.worldToScreen({ x: minX, y: minY });
    const bottomRight = grid.worldToScreen({ x: maxX, y: minY });

    ctx.beginPath();
    ctx.strokeStyle = "#4a90d9";
    ctx.lineWidth = 1.2;
    ctx.setLineDash([8, 4]);
    ctx.moveTo(topLeft.x, topLeft.y);
    ctx.lineTo(topRight.x, topRight.y);
    ctx.lineTo(bottomRight.x, bottomRight.y);
    ctx.lineTo(bottomLeft.x, bottomLeft.y);
    ctx.closePath();
    ctx.stroke();

    ctx.restore();
  }

  drawActiveGridPoint(context) {
    const point = context.activeGridPoint;
    if (!point) return;

    const ctx = context.ctx;
    const view = context.viewSet?.[context.activeViewIndex];
    let p;

    if (!view || view.type === "plan") {
      p = context.grid.worldToScreen({ x: point.x, y: point.y });
    } else if (view.type === "elevation") {
      // usar la misma proyección correcta del renderer
      p = this.projectPoint({ position: point }, context);
    } else {
      return;
    }

    ctx.save();

    ctx.beginPath();
    ctx.fillStyle = "#ff3b30";
    ctx.arc(p.x, p.y, 4, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = "#ff3b30";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(p.x - 8, p.y);
    ctx.lineTo(p.x + 8, p.y);
    ctx.moveTo(p.x, p.y - 8);
    ctx.lineTo(p.x, p.y + 8);
    ctx.stroke();

    ctx.fillStyle = "#111";
    ctx.font = "12px Arial";
    ctx.fillText(point.label || "", p.x + 10, p.y - 10);

    ctx.restore();
  }

  drawState(state) { }

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
    const view = context.viewSet?.[context.activeViewIndex];
    const last_point = state.shape.getFirstPoint();

    let previewMouseScreen;

    // Cursor preview según la vista activa
    if (!view || view.type === "plan") {
      previewMouseScreen = context.grid.worldToScreen(context.mousePos);
    } else if (view.type === "elevation") {
      // En elevación, context.mousePos ya está en coordenadas del plano 2D activo
      previewMouseScreen = context.grid.worldToScreen({
        x: context.mousePos.x,
        y: context.mousePos.y,
      });
    } else {
      previewMouseScreen = context.grid.worldToScreen(context.mousePos);
    }

    context.ctx.save();

    // Punto rojo del cursor
    context.ctx.beginPath();
    context.ctx.fillStyle = "red";
    context.ctx.arc(previewMouseScreen.x, previewMouseScreen.y, context.grid.size, 0, Math.PI * 2);
    context.ctx.fill();

    // Línea preview desde el nodo inicial
    if (last_point) {
      let startScreen;

      if (!view || view.type === "plan") {
        startScreen = context.grid.worldToScreen(last_point.position);
      } else if (view.type === "elevation") {
        // Usar la misma proyección correcta del renderer
        startScreen = this.projectPoint(last_point, context);
      } else {
        startScreen = context.grid.worldToScreen(last_point.position);
      }

      context.ctx.strokeStyle = "gray";
      context.ctx.beginPath();
      context.ctx.moveTo(startScreen.x, startScreen.y);
      context.ctx.lineTo(previewMouseScreen.x, previewMouseScreen.y);
      context.ctx.stroke();
    }

    context.ctx.restore();
  }

  drawDeflections(context) {
    context.ctx.save();
    context.ctx.strokeStyle = "blue";
    context.ctx.fillStyle = "blue";
    context.ctx.textAlign = "center";
    context.ctx.textBaseline = "middle";
    context.deflecciones.forEach((def) => {
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
      const [x, y, _] = context.matrizDesplazamiento[index];
      const p = context.grid.worldToScreen(d);
      context.ctx.fillText(`dx: ${axisToFixed(x)}`, p.x, p.y);
      context.ctx.fillText(`dy: ${axisToFixed(y)}`, p.x, p.y + 10);
    });

    context.ctx.restore();
  }

  drawMaterials(context) {
    context.shapes.forEach((s) => {
      if (!this.shouldDrawBeam(s, context)) return;
      // const p1 = context.grid.worldToScreen(s.node1.position);
      // const p2 = context.grid.worldToScreen(s.node2.position);
      const p1 = this.projectPoint(s.node1, context);
      const p2 = this.projectPoint(s.node2, context);
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

  // DIBUJO DE NODOS EN WIRE FRAME SOLO SI ESTÁN EN EL PLANO DE LA VISTA ACTIVA
  shouldDrawNode(node, CADSystem) {
    const view = CADSystem.viewSet?.[CADSystem.activeViewIndex];
    if (!view) return true;

    const tol = 0.05;
    const x = node.position.x || 0;
    const y = node.position.y || 0;
    const z = node.position.z || 0;

    if (view.type === "plan") {
      return Math.abs(z - view.elevation) <= tol;
    }

    if (view.type === "elevation") {
      if (view.axis === "X") {
        // Letras A,B,C,D => X fija => plano Y-Z
        return Math.abs(x - view.value) <= tol;
      }

      if (view.axis === "Y") {
        // Números 1,2,3,4 => Y fija => plano X-Z
        return Math.abs(y - view.value) <= tol;
      }
    }

    return true;
  }

  shouldDrawBeam(beam, CADSystem) {
    return this.shouldDrawNode(beam.node1, CADSystem) && this.shouldDrawNode(beam.node2, CADSystem);
  }

  projectPoint(node, CADSystem) {
    const view = CADSystem.viewSet?.[CADSystem.activeViewIndex];
    const x = node.position.x || 0;
    const y = node.position.y || 0;
    const z = node.position.z || 0;

    if (!view || view.type === "plan") {
      return CADSystem.grid.worldToScreen({ x, y });
    }

    if (view.type === "elevation") {
      if (view.axis === "X") {
        // Letras A,B,C,D => X fija => plano Y-Z
        return CADSystem.grid.worldToScreen({ x: y, y: z });
      }

      if (view.axis === "Y") {
        // Números 1,2,3,4 => Y fija => plano X-Z
        return CADSystem.grid.worldToScreen({ x: x, y: z });
      }
    }

    return CADSystem.grid.worldToScreen({ x, y });
  }
}

export class DeflexionRenderer extends DiseñoRenderer {
  render(CADSystem) {
    this.clearBackground(CADSystem);

    if (CADSystem.options.showGrid) {
      CADSystem.grid.draw(this, CADSystem);
    }

    // Soportes solo de la vista activa
    CADSystem.nodes.forEach((n) => {
      if (!this.shouldDrawNode(n, CADSystem)) return;
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
          if (!this.shouldDrawBeam(s, CADSystem)) return;
          s.draw(this, CADSystem);
        });

        CADSystem.parametricModels.forEach((parametric) => {
          parametric.shapes.forEach((s) => {
            if (!this.shouldDrawBeam(s, CADSystem)) return;
            s.draw(this, CADSystem);
          });
        });
      }

      CADSystem.nodes.forEach((n) => {
        if (!this.shouldDrawNode(n, CADSystem)) return;
        n.draw(this, CADSystem);
      });

      CADSystem.parametricModels.forEach((parametric) => {
        parametric.nodes.forEach((n) => {
          if (!this.shouldDrawNode(n, CADSystem)) return;
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
          if (!this.shouldDrawBeam(s, CADSystem)) return;
          this.drawWireBeam(s, CADSystem);
        });

        CADSystem.nodes.forEach((n) => {
          if (!this.shouldDrawNode(n, CADSystem)) return;
          this.drawWireNode(n, CADSystem);
        });
      }
    }

    if (CADSystem.options.showIDs) {
      CADSystem.shapes.forEach((s) => {
        if (!this.shouldDrawBeam(s, CADSystem)) return;
        this.drawBeamID(s, CADSystem);
      });

      CADSystem.nodes.forEach((n) => {
        if (!this.shouldDrawNode(n, CADSystem)) return;
        this.drawNodeID(n, CADSystem);
      });
    }

    if (CADSystem.options.showForces) {
      CADSystem.ctx.save();
      CADSystem.nodes.forEach((n) => {
        if (!this.shouldDrawNode(n, CADSystem)) return;
        this.drawForce(n, CADSystem);
      });
      CADSystem.ctx.restore();
    }

    if (CADSystem.options.showReactions) {
      CADSystem.ctx.save();
      CADSystem.nodes.forEach((n) => {
        if (!this.shouldDrawNode(n, CADSystem)) return;
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
