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

      // CADSystem.parametricModels.forEach((parametric) => {
      //   parametric.nodes.forEach((n) => {
      //     if ((n.position.z || 0) !== currentZ) return;

      //     n.draw(this, CADSystem);
      //   });
      // });
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
      // CADSystem.shapes.forEach((s) => {
      //   this.drawBeamID(s, CADSystem);
      // });
      // CADSystem.nodes.forEach((n) => {
      //   this.drawNodeID(n, CADSystem);
      // });
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

    const hasLegacyGrid = refGrid && Array.isArray(refGrid.xPositions) && refGrid.xPositions.length > 0;

    const hasNewGrid =
      refGrid &&
      ((Array.isArray(refGrid.generalGrids) && refGrid.generalGrids.length > 0) ||
        (Array.isArray(refGrid.xGrids) && refGrid.xGrids.length > 0) ||
        (Array.isArray(refGrid.yGrids) && refGrid.yGrids.length > 0));

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
    // const refGrid = context.referenceGrid;
    // const view = context.viewSet?.[context.activeViewIndex];

    // if (!refGrid) return;

    // const isElevationView = view?.type === "elevation";
    // const isElevationX = isElevationView && view.axis === "X"; // letras
    // const isElevationY = isElevationView && view.axis === "Y"; // números

    // // axis X => letras => plano Y-Z
    // if (isElevationX) {
    //   this.drawElevationZGridOnly(grid, context);
    //   return;
    // }

    // // axis Y => números => plano X-Z
    // if (isElevationY) {
    //   this.drawElevationGridOnly(grid, context);
    //   return;
    // }

    // this.drawPlanGrid(grid, context);

    const ctx = context.ctx;
    const refGrid = context.referenceGrid;
    const view = context.viewSet?.[context.activeViewIndex];

    if (!refGrid || !refGrid.xPositions || refGrid.xPositions.length === 0) return;

    // ========== DETECTAR TIPO DE VISTA ==========
    const isElevationView = view?.type === "elevation";
    const isElevationX = isElevationView && view.axis === "X";
    const isElevationY = isElevationView && view.axis === "Y";
    const isDiagonalView = view?.type === "diagonal";

    if (isDiagonalView) {
      this.drawDiagonalGrid(grid, context, view);
    } else if (isElevationX) {
      this.drawElevationXGrid(grid, context, view);
    } else if (isElevationY) {
      this.drawElevationZGridOnly(grid, context, view);
    } else {
      this.drawPlanGrid(grid, context, refGrid);
      // También dibujar grillas diagonales en planta
      this.drawDiagonalGridsOnPlan(grid, context);
    }
  }

  // Vista elevación X (A, B, C...) - Plano X-Z
  drawElevationGridOnly(grid, context) {
    const ctx = context.ctx;
    const refGrid = context.referenceGrid;
    const currentElevationZ = context.currentElevationZ;

    let currentY = 0;
    const elev = context.zElevations?.find(
      (e) =>
        e.label === currentElevationZ || e.name === currentElevationZ || e.name === `Elevación ${currentElevationZ}`,
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
        e.label === currentElevationX || e.name === currentElevationX || e.name === `Elevación ${currentElevationX}`,
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

      // =======
      //
      // >>>>>>> Stashed changes
    }

    context.ctx.restore();
  }

  // Nuevo método para dibujar vista diagonal específica
  // drawDiagonalGrid(grid, context, view) {
  //   const ctx = context.ctx;
  //   const refGrid = context.referenceGrid;

  //   ctx.clearRect(0, 0, context.canvas.width, context.canvas.height);
  //   ctx.save();

  //   // Determinar el plano de proyección para la vista diagonal
  //   const direction = view.direction; // "X" o "Y"
  //   const gridLine = view;

  //   // Para vista diagonal, proyectamos los nodos sobre la línea del eje diagonal
  //   // y mostramos en función de la distancia a lo largo del eje

  //   const storyCount = refGrid.storyCount;
  //   const storyHeight = refGrid.storyHeight;
  //   const axisColor = "#ff6666";
  //   const lineColor = "#3a6a9a";
  //   const textColor = "#8aadcc";

  //   ctx.lineWidth = 0.8;
  //   ctx.font = "11px 'Segoe UI', Arial";
  //   ctx.setLineDash([]);

  //   // Calcular vector director del eje diagonal
  //   const dx = gridLine.endX - gridLine.startX;
  //   const dy = gridLine.endY - gridLine.startY;
  //   const length = Math.sqrt(dx * dx + dy * dy);
  //   const dirX = dx / length;
  //   const dirY = dy / length;

  //   // Vector perpendicular para el offset
  //   const perpX = -dirY;
  //   const perpY = dirX;

  //   // Líneas horizontales (pisos - altura Z)
  //   for (let floor = 0; floor <= storyCount; floor++) {
  //     const z = floor * storyHeight;
  //     const screenY = grid.worldToScreen({ x: 0, y: z }).y;

  //     ctx.beginPath();
  //     ctx.strokeStyle = floor === 0 ? axisColor : lineColor;
  //     ctx.lineWidth = floor === 0 ? 1.5 : 0.5;
  //     ctx.setLineDash(floor === 0 ? [] : [5, 5]);
  //     ctx.moveTo(0, screenY);
  //     ctx.lineTo(context.canvas.width, screenY);
  //     ctx.stroke();

  //     ctx.fillStyle = floor === 0 ? axisColor : textColor;
  //     ctx.font = floor === 0 ? "bold 10px Arial" : "10px Arial";
  //     const label = floor === 0 ? "BASE" : `STORY${floor}`;
  //     ctx.fillText(label, 10, screenY - 5);
  //     ctx.fillStyle = "#666";
  //     ctx.font = "9px Arial";
  //     ctx.fillText(`${z}m`, 80, screenY - 5);
  //   }

  //   // Dibujar la línea del eje diagonal
  //   const p1 = grid.worldToScreen({ x: gridLine.startX, y: gridLine.startY });
  //   const p2 = grid.worldToScreen({ x: gridLine.endX, y: gridLine.endY });

  //   ctx.beginPath();
  //   ctx.strokeStyle = axisColor;
  //   ctx.lineWidth = 2;
  //   ctx.setLineDash([]);
  //   ctx.moveTo(p1.x, p1.y);
  //   ctx.lineTo(p2.x, p2.y);
  //   ctx.stroke();

  //   // Etiqueta del eje diagonal
  //   ctx.fillStyle = axisColor;
  //   ctx.font = "bold 12px Arial";
  //   ctx.fillText(gridLine.name, (p1.x + p2.x) / 2, (p1.y + p2.y) / 2 - 10);

  //   // Dibujar puntos de referencia a lo largo del eje (cada metro)
  //   const numPoints = Math.ceil(length) + 1;
  //   for (let i = 0; i <= numPoints; i++) {
  //     const t = i / numPoints;
  //     const x = gridLine.startX + dx * t;
  //     const y = gridLine.startY + dy * t;
  //     const screenPos = grid.worldToScreen({ x: x, y: y });

  //     ctx.beginPath();
  //     ctx.fillStyle = "#888888";
  //     ctx.arc(screenPos.x, screenPos.y, 3, 0, 2 * Math.PI);
  //     ctx.fill();

  //     ctx.fillStyle = "#aaaaaa";
  //     ctx.font = "8px Arial";
  //     ctx.fillText(`${i}m`, screenPos.x + 5, screenPos.y);
  //   }

  //   ctx.restore();

  //   // Título
  //   ctx.font = "bold 12px 'Segoe UI', Arial";
  //   ctx.fillStyle = "#4a90d9";
  //   ctx.fillText(`📐 VISTA DIAGONAL - Eje ${gridLine.name} (${direction})`, 15, 30);
  //   ctx.font = "10px Arial";
  //   ctx.fillStyle = "#888";
  //   ctx.fillText("Vista a lo largo del eje diagonal", 15, 50);
  // }

  drawDiagonalGrid(grid, context, view) {
    const ctx = context.ctx;
    const refGrid = context.referenceGrid;
    const diagonalGrids = context.diagonalGrids;

    ctx.clearRect(0, 0, context.canvas.width, context.canvas.height);
    ctx.save();

    const storyCount = refGrid.storyCount;
    const storyHeight = refGrid.storyHeight;
    const textColor = "#8aadcc";

    ctx.lineWidth = 0.8;
    ctx.font = "11px 'Segoe UI', Arial";
    ctx.setLineDash([]);

    // Usar context.grid
    const cadGrid = context.grid;

    // Buscar la diagonal correspondiente para obtener su color
    let diagonalColor = "#ff6666"; // Color por defecto
    const allDiagonals = [...(diagonalGrids?.x || []), ...(diagonalGrids?.y || [])];
    const foundDiag = allDiagonals.find((d) => d.name === view.name);
    if (foundDiag && foundDiag.color) {
      diagonalColor = foundDiag.color;
    }

    // Líneas horizontales (pisos - altura Z)
    for (let floor = 0; floor <= storyCount; floor++) {
      const z = floor * storyHeight;
      const screenY = cadGrid.worldToScreen({ x: 0, y: z }).y;

      ctx.beginPath();
      ctx.strokeStyle = floor === 0 ? diagonalColor : "#3a6a9a";
      ctx.lineWidth = floor === 0 ? 1.5 : 0.5;
      ctx.setLineDash(floor === 0 ? [] : [5, 5]);
      ctx.moveTo(0, screenY);
      ctx.lineTo(context.canvas.width, screenY);
      ctx.stroke();

      ctx.fillStyle = floor === 0 ? diagonalColor : textColor;
      ctx.font = floor === 0 ? "bold 10px Arial" : "10px Arial";
      const label = floor === 0 ? "BASE" : `STORY${floor}`;
      ctx.fillText(label, 10, screenY - 5);
      ctx.fillStyle = "#666";
      ctx.font = "9px Arial";
      ctx.fillText(`${z}m`, 80, screenY - 5);
    }

    // Dibujar la línea del eje diagonal con su color personalizado
    const p1 = cadGrid.worldToScreen({ x: view.startX, y: view.startY });
    const p2 = cadGrid.worldToScreen({ x: view.endX, y: view.endY });

    ctx.beginPath();
    ctx.strokeStyle = diagonalColor;
    ctx.lineWidth = 2;
    ctx.setLineDash([]);
    ctx.moveTo(p1.x, p1.y);
    ctx.lineTo(p2.x, p2.y);
    ctx.stroke();

    // Etiqueta del eje diagonal
    ctx.fillStyle = diagonalColor;
    ctx.font = "bold 12px Arial";
    ctx.fillText(view.name, (p1.x + p2.x) / 2, (p1.y + p2.y) / 2 - 10);

    ctx.restore();

    // Título
    ctx.font = "bold 12px 'Segoe UI', Arial";
    ctx.fillStyle = "#4a90d9";
    ctx.fillText(`📐 VISTA DIAGONAL - Eje ${view.name}`, 15, 30);
    ctx.font = "10px Arial";
    ctx.fillStyle = "#888";
    ctx.fillText("Vista a lo largo del eje diagonal", 15, 50);
  }

  // drawDiagonalGridsOnPlan(tempGrid, context) {
  //   const ctx = context.ctx;
  //   const diagonalGrids = context.diagonalGrids;

  //   if (!diagonalGrids) return;

  //   ctx.save();
  //   ctx.setLineDash([8, 4]);
  //   ctx.lineWidth = 1;

  //   // IMPORTANTE: Usar context.grid
  //   const cadGrid = context.grid;

  //   // Dibujar ejes diagonales X (rojo)
  //   ctx.strokeStyle = "#ff6666";
  //   ctx.fillStyle = "#ff8888";
  //   ctx.font = "10px 'Segoe UI', Arial";

  //   if (diagonalGrids.x) {
  //     diagonalGrids.x.forEach((gridItem) => {
  //       const p1 = cadGrid.worldToScreen({ x: gridItem.startX, y: gridItem.startY });
  //       const p2 = cadGrid.worldToScreen({ x: gridItem.endX, y: gridItem.endY });

  //       ctx.beginPath();
  //       ctx.moveTo(p1.x, p1.y);
  //       ctx.lineTo(p2.x, p2.y);
  //       ctx.stroke();

  //       const midX = (p1.x + p2.x) / 2;
  //       const midY = (p1.y + p2.y) / 2;
  //       ctx.fillStyle = "#ff8888";
  //       ctx.fillText(gridItem.name, midX, midY - 5);
  //     });
  //   }

  //   // Dibujar ejes diagonales Y (verde)
  //   ctx.strokeStyle = "#66ff66";
  //   ctx.fillStyle = "#88ff88";

  //   if (diagonalGrids.y) {
  //     diagonalGrids.y.forEach((gridItem) => {
  //       const p1 = cadGrid.worldToScreen({ x: gridItem.startX, y: gridItem.startY });
  //       const p2 = cadGrid.worldToScreen({ x: gridItem.endX, y: gridItem.endY });

  //       ctx.beginPath();
  //       ctx.moveTo(p1.x, p1.y);
  //       ctx.lineTo(p2.x, p2.y);
  //       ctx.stroke();

  //       const midX = (p1.x + p2.x) / 2;
  //       const midY = (p1.y + p2.y) / 2;
  //       ctx.fillStyle = "#88ff88";
  //       ctx.fillText(gridItem.name, midX, midY - 5);
  //     });
  //   }

  //   ctx.restore();
  // }

  drawDiagonalGridsOnPlan(tempGrid, context) {
    const ctx = context.ctx;
    const diagonalGrids = context.diagonalGrids;
    if (!diagonalGrids) return;

    ctx.save();
    ctx.setLineDash([8, 4]);
    ctx.lineWidth = 2;

    const cadGrid = context.grid;

    const drawDiagonals = (diagonals) => {
      diagonals.forEach((gridItem) => {
        // Verificar si la diagonal es visible
        if (gridItem.visible === false) return;

        const lineColor = gridItem.color || (gridItem.direction === "X" ? "#ff0000" : "#00ff00");
        const p1 = cadGrid.worldToScreen({ x: gridItem.startX, y: gridItem.startY });
        const p2 = cadGrid.worldToScreen({ x: gridItem.endX, y: gridItem.endY });
        ctx.beginPath();
        ctx.strokeStyle = lineColor;
        ctx.fillStyle = lineColor;
        ctx.moveTo(p1.x, p1.y);
        ctx.lineTo(p2.x, p2.y);
        ctx.stroke();
        const midX = (p1.x + p2.x) / 2;
        const midY = (p1.y + p2.y) / 2;
        ctx.fillText(gridItem.name, midX, midY - 5);
      });
    };

    if (diagonalGrids.x) drawDiagonals(diagonalGrids.x);
    if (diagonalGrids.y) drawDiagonals(diagonalGrids.y);

    ctx.restore();
  }

  // METODO PARA DIBUJAR LOS GRIDS DIAGONALES EN TODODS LOS PISOS
  // drawDiagonalGrid(grid, context, view) {
  //   const ctx = context.ctx;
  //   const refGrid = context.referenceGrid;

  //   ctx.clearRect(0, 0, context.canvas.width, context.canvas.height);
  //   ctx.save();

  //   const storyCount = refGrid.storyCount;
  //   const storyHeight = refGrid.storyHeight;
  //   const axisColor = "#ff6666";
  //   const lineColor = "#3a6a9a";
  //   const textColor = "#8aadcc";

  //   ctx.lineWidth = 0.8;
  //   ctx.font = "11px 'Segoe UI', Arial";
  //   ctx.setLineDash([]);

  //   // Calcular vector director del eje diagonal
  //   const dx = view.endX - view.startX;
  //   const dy = view.endY - view.startY;
  //   const length = Math.sqrt(dx * dx + dy * dy);
  //   const dirX = dx / length;
  //   const dirY = dy / length;

  //   // Usar context.grid
  //   const cadGrid = context.grid;

  //   // Líneas horizontales (pisos - altura Z)
  //   for (let floor = 0; floor <= storyCount; floor++) {
  //     const z = floor * storyHeight;
  //     const screenY = cadGrid.worldToScreen({ x: 0, y: z }).y;

  //     ctx.beginPath();
  //     ctx.strokeStyle = floor === 0 ? axisColor : lineColor;
  //     ctx.lineWidth = floor === 0 ? 1.5 : 0.5;
  //     ctx.setLineDash(floor === 0 ? [] : [5, 5]);
  //     ctx.moveTo(0, screenY);
  //     ctx.lineTo(context.canvas.width, screenY);
  //     ctx.stroke();

  //     ctx.fillStyle = floor === 0 ? axisColor : textColor;
  //     ctx.font = floor === 0 ? "bold 10px Arial" : "10px Arial";
  //     const label = floor === 0 ? "BASE" : `STORY${floor}`;
  //     ctx.fillText(label, 10, screenY - 5);
  //     ctx.fillStyle = "#666";
  //     ctx.font = "9px Arial";
  //     ctx.fillText(`${z}m`, 80, screenY - 5);
  //   }

  //   // Dibujar la línea del eje diagonal
  //   const p1 = cadGrid.worldToScreen({ x: view.startX, y: view.startY });
  //   const p2 = cadGrid.worldToScreen({ x: view.endX, y: view.endY });

  //   ctx.beginPath();
  //   ctx.strokeStyle = axisColor;
  //   ctx.lineWidth = 2;
  //   ctx.setLineDash([]);
  //   ctx.moveTo(p1.x, p1.y);
  //   ctx.lineTo(p2.x, p2.y);
  //   ctx.stroke();

  //   // Etiqueta del eje diagonal
  //   ctx.fillStyle = axisColor;
  //   ctx.font = "bold 12px Arial";
  //   ctx.fillText(view.name, (p1.x + p2.x) / 2, (p1.y + p2.y) / 2 - 10);

  //   ctx.restore();

  //   // Título
  //   ctx.font = "bold 12px 'Segoe UI', Arial";
  //   ctx.fillStyle = "#4a90d9";
  //   ctx.fillText(`📐 VISTA DIAGONAL - Eje ${view.name}`, 15, 30);
  //   ctx.font = "10px Arial";
  //   ctx.fillStyle = "#888";
  //   ctx.fillText("Vista a lo largo del eje diagonal", 15, 50);
  // }

  // nuevo metodo
  drawElevationXGrid(grid, context, view) {
    // Este método es similar a drawElevationGridOnly pero usando el view correcto
    const ctx = context.ctx;
    const refGrid = context.referenceGrid;
    const cadGrid = context.grid;

    if (!refGrid || !refGrid.xPositions || refGrid.xPositions.length === 0) return;

    const xPositions = refGrid.xPositions;
    const xLabels = refGrid.xLabels;
    const storyCount = refGrid.storyCount;
    const storyHeight = refGrid.storyHeight;
    const axisColor = "#ff6666";
    const lineColor = "#3a6a9a";
    const textColor = "#8aadcc";

    ctx.save();
    ctx.lineWidth = 0.8;
    ctx.font = "11px 'Segoe UI', Arial";
    ctx.setLineDash([]);

    // Líneas horizontales (pisos)
    for (let floor = 0; floor <= storyCount; floor++) {
      const z = floor * storyHeight;
      const screenY = cadGrid.worldToScreen({ x: 0, y: z }).y;

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

    // Líneas verticales (ejes X)
    xPositions.forEach((x, index) => {
      const screenX = cadGrid.worldToScreen({ x: x, y: 0 }).x;
      const isActive = view.value === x;

      ctx.beginPath();
      ctx.strokeStyle = isActive ? axisColor : lineColor;
      ctx.lineWidth = isActive ? 2 : 0.8;
      ctx.setLineDash(isActive ? [] : [8, 4]);
      ctx.moveTo(screenX, 0);
      ctx.lineTo(screenX, context.canvas.height);
      ctx.stroke();

      ctx.fillStyle = isActive ? axisColor : textColor;
      ctx.font = isActive ? "bold 12px Arial" : "11px Arial";
      ctx.fillText(xLabels[index], screenX - 6, context.canvas.height - 10);
    });

    ctx.restore();
  }

  // Vista elevación X (A, B, C...) - Plano X-Z
  drawElevationGridOnly(grid, context) {
    const ctx = context.ctx;
    const refGrid = context.referenceGrid;
    const currentElevationX = context.currentElevationX;
    const currentY = context.getCurrentElevationY ? context.getCurrentElevationY() : 0;

    if (!refGrid || !refGrid.xPositions || refGrid.xPositions.length === 0) {
      ctx.restore();
      return;
    }

    // ========== PARA VISTA ELEVACIÓN NUMÉRICA (1,2,3...) ==========
    // Mostrar grid X-Z: Eje X = posiciones X (A,B,C...), Eje Y = altura Z (BASE, STORY1...)
    const xPositions = refGrid.xPositions;
    const xLabels = refGrid.yLabels;
    const storyCount = refGrid.storyCount;
    const storyHeight = refGrid.storyHeight;
    const axisColor = "#ff6666";
    const lineColor = "#3a6a9a";
    const textColor = "#8aadcc";

    ctx.lineWidth = 0.8;
    ctx.font = "11px 'Segoe UI', Arial";
    ctx.setLineDash([]);

    // Líneas HORIZONTALES (pisos - altura Z)
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

    // Líneas VERTICALES (ejes X - A, B, C...)
    xPositions.forEach((x, index) => {
      const screenX = grid.worldToScreen({ x: x, y: 0 }).x;
      const isActive = currentElevationX === xLabels[index];

      ctx.beginPath();
      ctx.strokeStyle = isActive ? axisColor : lineColor;
      ctx.lineWidth = isActive ? 2 : 0.8;
      ctx.setLineDash(isActive ? [] : [8, 4]);
      ctx.moveTo(screenX, 0);
      ctx.lineTo(screenX, context.canvas.height);
      ctx.stroke();

      ctx.fillStyle = isActive ? axisColor : textColor;
      ctx.font = isActive ? "bold 12px Arial" : "11px Arial";
      ctx.fillText(xLabels[index], screenX - 6, context.canvas.height - 10);
    });

    ctx.setLineDash([]);

    // Origen
    const origin = grid.worldToScreen({ x: 0, y: 0 });
    ctx.beginPath();
    ctx.arc(origin.x, origin.y, 5, 0, 2 * Math.PI);
    ctx.fillStyle = "#ff8888";
    ctx.fill();
    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 10px Arial";
    ctx.fillText("0,0", origin.x + 8, origin.y - 5);

    // Título
    ctx.font = "bold 12px 'Segoe UI', Arial";
    ctx.fillStyle = "#4a90d9";
    ctx.fillText(`📐 Vista X-Z (Eje ${currentElevationX}) - Y = ${currentY}m`, 15, 30);
    ctx.font = "10px Arial";
    ctx.fillStyle = "#888";
    ctx.fillText("Haz clic para dibujar | Esc para salir", 15, 50);
  }

  // Vista elevación Y (1, 2, 3...) - Plano Y-Z
  drawElevationZGridOnly(grid, context) {
    const ctx = context.ctx;
    const refGrid = context.referenceGrid;
    const currentElevationZ = context.currentElevationZ;

    // Obtener la posición X del eje seleccionado
    let currentX = 0;
    const elev = context.zElevations?.find((e) => e.name === currentElevationZ);
    if (elev) currentX = elev.x;

    if (!refGrid || !refGrid.yPositions || refGrid.yPositions.length === 0) {
      ctx.restore();
      return;
    }

    // ========== PARA VISTA ELEVACIÓN LETRAS (A,B,C...) ==========
    // Mostrar grid Y-Z: Eje X = posiciones Y (1,2,3...), Eje Y = altura Z (BASE, STORY1...)
    const yPositions = refGrid.yPositions;
    const yLabels = refGrid.yLabels;
    const storyCount = refGrid.storyCount;
    const storyHeight = refGrid.storyHeight;
    const axisColor = "#ff6666";
    const lineColor = "#3a6a9a";
    const textColor = "#8aadcc";

    ctx.lineWidth = 0.8;
    ctx.font = "11px 'Segoe UI', Arial";
    ctx.setLineDash([]);

    // Líneas HORIZONTALES (pisos - altura Z)
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

    // Líneas VERTICALES (ejes Y - 1,2,3...)
    yPositions.forEach((y, index) => {
      const screenX = grid.worldToScreen({ x: y, y: 0 }).x;
      const isActive = currentElevationZ === String(yLabels[index]);

      ctx.beginPath();
      ctx.strokeStyle = isActive ? axisColor : lineColor;
      ctx.lineWidth = isActive ? 2 : 0.8;
      ctx.setLineDash(isActive ? [] : [8, 4]);
      ctx.moveTo(screenX, 0);
      ctx.lineTo(screenX, context.canvas.height);
      ctx.stroke();

      ctx.fillStyle = isActive ? axisColor : textColor;
      ctx.font = isActive ? "bold 12px Arial" : "11px Arial";
      ctx.fillText(yLabels[index], screenX - 6, context.canvas.height - 10);
    });

    ctx.setLineDash([]);

    // Origen
    const origin = grid.worldToScreen({ x: 0, y: 0 });
    ctx.beginPath();
    ctx.arc(origin.x, origin.y, 5, 0, 2 * Math.PI);
    ctx.fillStyle = "#ff8888";
    ctx.fill();
    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 10px Arial";
    ctx.fillText("0,0", origin.x + 8, origin.y - 5);

    // Título
    ctx.font = "bold 12px 'Segoe UI', Arial";
    ctx.fillStyle = "#4a90d9";
    ctx.fillText(`📐 Vista Y-Z (Eje ${currentElevationZ}) - X = ${currentX}m`, 15, 30);
    ctx.font = "10px Arial";
    ctx.fillStyle = "#888";
    ctx.fillText("Haz clic para dibujar | Esc para salir", 15, 50);
  }

  // Vista planta (X-Y)
  // drawPlanGrid(grid, context) {
  //   const ctx = context.ctx;
  //   const refGrid = context.referenceGrid;

  //   if (!refGrid || !refGrid.xPositions || refGrid.xPositions.length === 0) return;

  //   const xPositions = refGrid.xPositions;
  //   const yPositions = refGrid.yPositions;
  //   const xLabels = refGrid.xLabels;
  //   const yLabels = refGrid.yLabels;

  //   // Colores estilo ETABS
  //   const lineColor = "#3a6a9a";
  //   const textColor = "#8aadcc";
  //   const axisColor = "#00ff00";
  //   // const coordColor = "#aaccee";

  //   ctx.lineWidth = 0.8;
  //   ctx.font = "11px 'Segoe UI', Arial";
  //   ctx.setLineDash([]);

  //   const minX = Math.min(...xPositions);
  //   const maxX = Math.max(...xPositions);
  //   const minY = Math.min(...yPositions);
  //   const maxY = Math.max(...yPositions);

  //   // ========== DIBUJAR EJES X e Y CON FLECHAS ==========
  //   const arrowSize = 6; // Tamaño de la flecha

  //   // Eje X (horizontal) - línea roja en Y=0
  //   const ejeXStart = grid.worldToScreen({ x: minX, y: 0 });
  //   const ejeXEnd = grid.worldToScreen({ x: 2, y: 0 });

  //   ctx.beginPath();
  //   ctx.strokeStyle = axisColor;
  //   ctx.fillStyle = axisColor;
  //   ctx.lineWidth = 1.5;
  //   ctx.moveTo(ejeXStart.x, ejeXStart.y);
  //   ctx.lineTo(ejeXEnd.x, ejeXEnd.y);
  //   ctx.stroke();

  //   // Flecha del eje X (punta en dirección positiva)
  //   const arrowXTip = grid.worldToScreen({ x: 2, y: 0 });
  //   ctx.beginPath();
  //   ctx.moveTo(arrowXTip.x, arrowXTip.y);
  //   ctx.lineTo(arrowXTip.x - arrowSize, arrowXTip.y - arrowSize / 2);
  //   ctx.lineTo(arrowXTip.x - arrowSize, arrowXTip.y + arrowSize / 2);
  //   ctx.fill();

  //   // Etiqueta del eje X
  //   ctx.fillStyle = axisColor;
  //   ctx.font = "bold 12px 'Segoe UI', Arial";
  //   const ejeXLabelPos = grid.worldToScreen({ x: maxX + 1.2, y: 0 });
  //   ctx.fillText("X", ejeXLabelPos.x + 3, ejeXLabelPos.y - 3);

  //   // Eje Y (vertical) - línea roja en X=0
  //   const ejeYStart = grid.worldToScreen({ x: 0, y: minY });
  //   const ejeYEnd = grid.worldToScreen({ x: 0, y: 2 });

  //   ctx.beginPath();
  //   ctx.moveTo(ejeYStart.x, ejeYStart.y);
  //   ctx.lineTo(ejeYEnd.x, ejeYEnd.y);
  //   ctx.stroke();

  //   // Flecha del eje Y (punta en dirección positiva)
  //   const arrowYTip = grid.worldToScreen({ x: 0, y: 2 });
  //   ctx.beginPath();
  //   ctx.moveTo(arrowYTip.x, arrowYTip.y);
  //   ctx.lineTo(arrowYTip.x - arrowSize / 2, arrowYTip.y + arrowSize); // ← Cambiado: + arrowSize
  //   ctx.lineTo(arrowYTip.x + arrowSize / 2, arrowYTip.y + arrowSize); // ← Cambiado: + arrowSize
  //   ctx.fill();

  //   // Etiqueta del eje Y
  //   const ejeYLabelPos = grid.worldToScreen({ x: 0, y: maxY + 1.2 });
  //   ctx.fillText("Y", ejeYLabelPos.x + 5, ejeYLabelPos.y + 3);

  //   // ========== DIBUJAR EL ORIGEN (0,0) ==========
  //   const origin = grid.worldToScreen({ x: 0, y: 0 });
  //   ctx.beginPath();
  //   ctx.arc(origin.x, origin.y, 5, 0, 2 * Math.PI);
  //   ctx.fillStyle = "#ff8888";
  //   ctx.fill();
  //   ctx.fillStyle = "#ffffff";
  //   ctx.font = "bold 10px Arial";
  //   ctx.fillText("0,0", origin.x + 8, origin.y - 5);

  //   // ========== DIBUJAR LÍNEAS DEL GRID (solo dentro del área) ==========
  //   ctx.lineWidth = 0.5;
  //   ctx.strokeStyle = lineColor;
  //   ctx.fillStyle = textColor;
  //   ctx.font = "10px 'Segoe UI', Arial";

  //   // Líneas verticales (en X)
  //   xPositions.forEach((x, index) => {
  //     const start = grid.worldToScreen({ x: x, y: minY });
  //     const end = grid.worldToScreen({ x: x, y: maxY });

  //     if (start.x >= -100 && start.x <= grid.width + 100) {
  //       ctx.beginPath();
  //       ctx.moveTo(start.x, start.y);
  //       ctx.lineTo(end.x, end.y);
  //       ctx.stroke();

  //       // Etiqueta A, B, C... en la parte inferior
  //       const labelPos = grid.worldToScreen({ x: x, y: minY - 0.5 });
  //       ctx.fillStyle = textColor;
  //       ctx.fillText(xLabels[index], labelPos.x - 4, labelPos.y + 5);
  //     }
  //   });

  //   // Líneas horizontales (en Y)
  //   yPositions.forEach((y, index) => {
  //     const start = grid.worldToScreen({ x: minX, y: y });
  //     const end = grid.worldToScreen({ x: maxX, y: y });

  //     if (start.y >= -100 && start.y <= grid.height + 100) {
  //       ctx.beginPath();
  //       ctx.moveTo(start.x, start.y);
  //       ctx.lineTo(end.x, end.y);
  //       ctx.stroke();

  //       // Etiqueta 1, 2, 3... en el borde izquierdo
  //       const labelPos = grid.worldToScreen({ x: minX - 0.5, y: y });
  //       ctx.fillStyle = textColor;
  //       ctx.fillText(yLabels[index].toString(), labelPos.x - 15, labelPos.y + 4);
  //     }
  //   });

  //   // ========== COORDENADAS ENTRE EJES (en cada celda) ==========
  //   // ctx.font = "9px 'Segoe UI', Arial";
  //   // ctx.fillStyle = coordColor;
  //   // ctx.setLineDash([2, 2]);
  //   // ctx.lineWidth = 0.3;

  //   // for (let i = 0; i < xPositions.length - 1; i++) {
  //   //   for (let j = 0; j < yPositions.length - 1; j++) {
  //   //     const x = (xPositions[i] + xPositions[i + 1]) / 2;
  //   //     const y = (yPositions[j] + yPositions[j + 1]) / 2;
  //   //     const screenPos = grid.worldToScreen({ x: x, y: y });

  //   //     // Mostrar coordenadas en el centro de cada celda
  //   //     ctx.fillStyle = coordColor;
  //   //     ctx.fillText(`(${x.toFixed(1)}, ${y.toFixed(1)})`, screenPos.x - 22, screenPos.y + 3);
  //   //   }
  //   // }

  //   // ========== CONTORNO DEL ÁREA (punteado) ==========
  //   const topLeft = grid.worldToScreen({ x: minX, y: maxY });
  //   const topRight = grid.worldToScreen({ x: maxX, y: maxY });
  //   const bottomLeft = grid.worldToScreen({ x: minX, y: minY });
  //   const bottomRight = grid.worldToScreen({ x: maxX, y: minY });

  //   ctx.beginPath();
  //   ctx.strokeStyle = "#4a90d9";
  //   ctx.lineWidth = 1.5;
  //   ctx.setLineDash([8, 4]);
  //   ctx.moveTo(topLeft.x, topLeft.y);
  //   ctx.lineTo(topRight.x, topRight.y);
  //   ctx.lineTo(bottomRight.x, bottomRight.y);
  //   ctx.lineTo(bottomLeft.x, bottomLeft.y);
  //   ctx.closePath();
  //   ctx.stroke();
  //   ctx.setLineDash([]);

  //   // Restaurar configuración
  //   ctx.font = "11px 'Segoe UI', Arial";
  //   ctx.fillStyle = "#ffffff";
  // }

  drawPlanGrid(tempGrid, context) {
    const ctx = context.ctx;
    const refGrid = context.referenceGrid;

    if (!refGrid || !refGrid.xPositions || refGrid.xPositions.length === 0) return;

    // IMPORTANTE: Usar context.grid (el grid del contexto)
    const cadGrid = context.grid;

    const xPositions = refGrid.xPositions;
    const yPositions = refGrid.yPositions;
    const xLabels = refGrid.xLabels;
    const yLabels = refGrid.yLabels;

    // Colores estilo ETABS
    const lineColor = "#3a6a9a";
    const textColor = "#8aadcc";
    const axisColor = "#00ff00";

    ctx.lineWidth = 0.8;
    ctx.font = "11px 'Segoe UI', Arial";
    ctx.setLineDash([]);

    const minX = Math.min(...xPositions);
    const maxX = Math.max(...xPositions);
    const minY = Math.min(...yPositions);
    const maxY = Math.max(...yPositions);

    // ========== DIBUJAR EJES X e Y CON FLECHAS ==========
    const arrowSize = 6;

    // Eje X (horizontal) - línea roja en Y=0
    const ejeXStart = cadGrid.worldToScreen({ x: minX, y: 0 });
    const ejeXEnd = cadGrid.worldToScreen({ x: 2, y: 0 });

    ctx.beginPath();
    ctx.strokeStyle = axisColor;
    ctx.fillStyle = axisColor;
    ctx.lineWidth = 1.5;
    ctx.moveTo(ejeXStart.x, ejeXStart.y);
    ctx.lineTo(ejeXEnd.x, ejeXEnd.y);
    ctx.stroke();

    // Flecha del eje X
    const arrowXTip = cadGrid.worldToScreen({ x: 2, y: 0 });
    ctx.beginPath();
    ctx.moveTo(arrowXTip.x, arrowXTip.y);
    ctx.lineTo(arrowXTip.x - arrowSize, arrowXTip.y - arrowSize / 2);
    ctx.lineTo(arrowXTip.x - arrowSize, arrowXTip.y + arrowSize / 2);
    ctx.fill();

    // Etiqueta del eje X
    ctx.fillStyle = axisColor;
    ctx.font = "bold 12px 'Segoe UI', Arial";
    const ejeXLabelPos = cadGrid.worldToScreen({ x: maxX + 1.2, y: 0 });
    ctx.fillText("X", ejeXLabelPos.x + 3, ejeXLabelPos.y - 3);

    // Eje Y (vertical)
    const ejeYStart = cadGrid.worldToScreen({ x: 0, y: minY });
    const ejeYEnd = cadGrid.worldToScreen({ x: 0, y: 2 });

    ctx.beginPath();
    ctx.moveTo(ejeYStart.x, ejeYStart.y);
    ctx.lineTo(ejeYEnd.x, ejeYEnd.y);
    ctx.stroke();

    // Flecha del eje Y
    const arrowYTip = cadGrid.worldToScreen({ x: 0, y: 2 });
    ctx.beginPath();
    ctx.moveTo(arrowYTip.x, arrowYTip.y);
    ctx.lineTo(arrowYTip.x - arrowSize / 2, arrowYTip.y + arrowSize);
    ctx.lineTo(arrowYTip.x + arrowSize / 2, arrowYTip.y + arrowSize);
    ctx.fill();

    // Etiqueta del eje Y
    const ejeYLabelPos = cadGrid.worldToScreen({ x: 0, y: maxY + 1.2 });
    ctx.fillText("Y", ejeYLabelPos.x + 5, ejeYLabelPos.y + 3);

    // ========== DIBUJAR EL ORIGEN (0,0) ==========
    const origin = cadGrid.worldToScreen({ x: 0, y: 0 });
    ctx.beginPath();
    ctx.arc(origin.x, origin.y, 5, 0, 2 * Math.PI);
    ctx.fillStyle = "#ff8888";
    ctx.fill();
    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 10px Arial";
    ctx.fillText("0,0", origin.x + 8, origin.y - 5);

    // ========== DIBUJAR LÍNEAS DEL GRID ==========
    ctx.lineWidth = 0.5;
    ctx.strokeStyle = lineColor;
    ctx.fillStyle = textColor;
    ctx.font = "10px 'Segoe UI', Arial";

    // Líneas verticales (en X)
    xPositions.forEach((x, index) => {
      const start = cadGrid.worldToScreen({ x: x, y: minY });
      const end = cadGrid.worldToScreen({ x: x, y: maxY });

      if (start.x >= -100 && start.x <= cadGrid.width + 100) {
        ctx.beginPath();
        ctx.moveTo(start.x, start.y);
        ctx.lineTo(end.x, end.y);
        ctx.stroke();

        const labelPos = cadGrid.worldToScreen({ x: x, y: minY - 0.5 });
        ctx.fillStyle = textColor;
        ctx.fillText(xLabels[index], labelPos.x - 4, labelPos.y + 5);
      }
    });

    // Líneas horizontales (en Y)
    yPositions.forEach((y, index) => {
      const start = cadGrid.worldToScreen({ x: minX, y: y });
      const end = cadGrid.worldToScreen({ x: maxX, y: y });

      if (start.y >= -100 && start.y <= cadGrid.height + 100) {
        ctx.beginPath();
        ctx.moveTo(start.x, start.y);
        ctx.lineTo(end.x, end.y);
        ctx.stroke();

        const labelPos = cadGrid.worldToScreen({ x: minX - 0.5, y: y });
        ctx.fillStyle = textColor;
        ctx.fillText(yLabels[index].toString(), labelPos.x - 15, labelPos.y + 4);
      }
    });

    // ========== CONTORNO DEL ÁREA ==========
    const topLeft = cadGrid.worldToScreen({ x: minX, y: maxY });
    const topRight = cadGrid.worldToScreen({ x: maxX, y: maxY });
    const bottomLeft = cadGrid.worldToScreen({ x: minX, y: minY });
    const bottomRight = cadGrid.worldToScreen({ x: maxX, y: minY });

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

    ctx.font = "11px 'Segoe UI', Arial";
    ctx.fillStyle = "#ffffff";
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
    const last_point = state.shape.getFirstPoint();
    const p = context.grid.worldToScreen(context.mousePos);
    context.ctx.save();
    context.ctx.beginPath();
    context.ctx.fillStyle = "red";
    context.ctx.arc(p.x, p.y, context.grid.size, 0, Math.PI * 2);
    context.ctx.fill();
    if (last_point) {
      var c = context.grid.worldToScreen(last_point.position);
      const mouse = context.grid.worldToScreen(context.mousePos);
      context.ctx.strokeStyle = "gray";
      context.ctx.beginPath();
      context.ctx.moveTo(c.x, c.y);
      context.ctx.lineTo(mouse.x, mouse.y);
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
        // <<<<<<< Updated upstream
        // Letras A,B,C,D => X fija => plano Y-Z
        return Math.abs(x - view.value) <= tol;
      }

      if (view.axis === "Y") {
        // Números 1,2,3,4 => Y fija => plano X-Z
        return Math.abs(y - view.value) <= tol;
        // =======
        //         return Math.abs(y - view.value) <= tol;
        //       }

        //       if (view.axis === "Y") {
        //         return Math.abs(x - view.value) <= tol;
        // >>>>>>> Stashed changes
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
        // <<<<<<< Updated upstream
        // Letras A,B,C,D => X fija => plano Y-Z
        return CADSystem.grid.worldToScreen({ x: y, y: z });
      }

      if (view.axis === "Y") {
        // Números 1,2,3,4 => Y fija => plano X-Z
        return CADSystem.grid.worldToScreen({ x: x, y: z });
        // =======
        //         // horizontal = Y, vertical = Z
        //         return CADSystem.grid.worldToScreen({ x: x, y: z });
        //       }

        //       if (view.axis === "Y") {
        //         // horizontal = X, vertical = Z
        //         return CADSystem.grid.worldToScreen({ x: y, y: z });
        // >>>>>>> Stashed changes
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
