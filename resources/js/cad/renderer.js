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

  getDisplayColor(context, key, fallback) {
    return context.displayColors?.[key] || fallback;
  }

  formatValue(context, value, type = "coordinates", fallbackDecimals = 2) {
    if (context.formatOutput) {
      return context.formatOutput(value, type);
    }

    const number = Number(value);

    if (Number.isNaN(number)) {
      return "0";
    }

    return number.toFixed(fallbackDecimals);
  }

  render(CADSystem) {
    this.clearBackground(CADSystem);
    if (CADSystem.options.showGrid) {
      CADSystem.grid.draw(this, CADSystem);
    }

    this.drawReferencePoints(CADSystem);
    this.drawActiveGridPoint(CADSystem);
    this.drawDimensionLines(CADSystem);
    this.drawDimensionPreview(CADSystem);
    this.drawAreas(CADSystem);
    this.drawAreaPreview(CADSystem);

    CADSystem.nodes.forEach((n) => {
      if (!this.shouldDrawNode(n, CADSystem)) return;
      this.drawSupport(n, CADSystem);
    });
    if (!CADSystem.options.showWireframe) {
      // 1. Siempre dibujar primero el modelo normal visible en la vista activa
      CADSystem.shapes.forEach((s) => {
        if (!this.shouldDrawBeam(s, CADSystem)) return;
        this.drawBeam(s, CADSystem);
      });

      CADSystem.parametricModels.forEach((parametric) => {
        parametric.shapes.forEach((s) => {
          if (!this.shouldDrawBeam(s, CADSystem)) return;
          this.drawBeam(s, CADSystem);
        });
      });

      // 2. Si Display > Member Forces está activo, dibujar encima el diagrama axial
      if (CADSystem.options.showFAxiales) {
        this.drawAxiales(CADSystem);

        if (CADSystem.options.showFAxialesValues) {
          this.drawAxialesValues(CADSystem);
        }
      }

      // 3. Dibujar nodos visibles en la vista activa
      CADSystem.nodes.forEach((n) => {
        if (!this.shouldDrawNode(n, CADSystem)) return;
        this.drawNode(n, CADSystem);
      });

      CADSystem.parametricModels.forEach((parametric) => {
        parametric.nodes.forEach((n) => {
          if (!this.shouldDrawNode(n, CADSystem)) return;
          this.drawNode(n, CADSystem);
        });
      });
    } else {
      // Wireframe normal
      CADSystem.shapes.forEach((s) => {
        if (!this.shouldDrawBeam(s, CADSystem)) return;
        this.drawWireBeam(s, CADSystem);
      });

      CADSystem.nodes.forEach((n) => {
        if (!this.shouldDrawNode(n, CADSystem)) return;
        this.drawWireNode(n, CADSystem);
      });

      // Axiales encima del wireframe
      if (CADSystem.options.showFAxiales) {
        this.drawWireframeAxiales(CADSystem);

        if (CADSystem.options.showFAxialesValues) {
          this.drawAxialesValues(CADSystem);
        }
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

    this.drawDesignInfo?.(CADSystem);

    CADSystem.currentState.draw(this, CADSystem);
  }

  drawDesignInfo(CADSystem) {
    const mode = CADSystem.getActiveDesignDisplayMode?.();

    if (!mode) return;

    const ctx = CADSystem.ctx;
    const frames = CADSystem.shapes || [];

    ctx.save();

    frames.forEach((frame) => {
      if (!frame?.node1 || !frame?.node2) return;
      
      // Respetar vista activa: planta, elevación o vista filtrada
      if (
        typeof CADSystem.isObjectVisibleInActiveView === "function" &&
        !CADSystem.isObjectVisibleInActiveView(frame)
      ) {
        return;
      }

      // Compatibilidad si también tienes shouldDrawBeam en cadSystem
      if (
        typeof CADSystem.shouldDrawBeam === "function" &&
        !CADSystem.shouldDrawBeam(frame)
      ) {
        return;
      }

      const result = CADSystem.getDesignResultForDisplay?.(frame);

      if (!result) return;

      const p1 = this.projectPoint(frame.node1, CADSystem);
      const p2 = this.projectPoint(frame.node2, CADSystem);

      const mx = (p1.x + p2.x) / 2;
      const my = (p1.y + p2.y) / 2;

      const text = CADSystem.formatDesignInfoText?.(
        result,
        mode.options?.infoType || "ratio"
      );

      if (!text) return;

      const isOk = String(result.status).toUpperCase() === "OK";

      ctx.font = "bold 11px Arial";
      const paddingX = 5;
      const paddingY = 3;
      const textWidth = ctx.measureText(text).width;
      const boxWidth = textWidth + paddingX * 2;
      const boxHeight = 18;

      const x = mx - boxWidth / 2;
      const y = my - 28;

      ctx.fillStyle = isOk
        ? "rgba(22, 163, 74, 0.90)"
        : "rgba(220, 38, 38, 0.90)";

      ctx.fillRect(x, y, boxWidth, boxHeight);

      ctx.strokeStyle = "rgba(255, 255, 255, 0.85)";
      ctx.lineWidth = 1;
      ctx.strokeRect(x, y, boxWidth, boxHeight);

      ctx.fillStyle = "#ffffff";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(text, mx, y + boxHeight / 2);
    });

    ctx.restore();
  }

  drawAxiales(context) {
    context.shapes.forEach((s) => {
      if (!this.shouldDrawBeam(s, context)) return;

      const p1 = this.projectPoint(s.node1, context);
      const p2 = this.projectPoint(s.node2, context);

      context.ctx.save();

      Object.assign(context.ctx, s.style?.axialStyle?.MODEL || {});

      context.ctx.strokeStyle = "#16a34a";
      context.ctx.lineWidth = 2;

      context.ctx.beginPath();
      context.ctx.moveTo(p1.x, p1.y);
      context.ctx.lineTo(p2.x, p2.y);
      context.ctx.stroke();

      context.ctx.restore();
    });
  }

  drawWireframeAxiales(context) {
    context.shapes.forEach((s) => {
      if (!this.shouldDrawBeam(s, context)) return;

      const p1 = this.projectPoint(s.node1, context);
      const p2 = this.projectPoint(s.node2, context);

      context.ctx.save();

      Object.assign(context.ctx, s.style?.axialStyle?.WIREFRAME || {});

      context.ctx.strokeStyle = "#16a34a";
      context.ctx.lineWidth = 1.5;
      context.ctx.setLineDash([4, 4]);

      context.ctx.beginPath();
      context.ctx.moveTo(p1.x, p1.y);
      context.ctx.lineTo(p2.x, p2.y);
      context.ctx.stroke();

      context.ctx.setLineDash([]);
      context.ctx.restore();
    });
  }

  drawAxialesValues(context) {
    context.shapes.forEach((s) => {
      if (!this.shouldDrawBeam(s, context)) return;

      const p1 = this.projectPoint(s.node1, context);
      const p2 = this.projectPoint(s.node2, context);

      const mid = {
        x: (p1.x + p2.x) / 2,
        y: (p1.y + p2.y) / 2,
      };

      context.ctx.save();

      context.ctx.fillStyle = "#16a34a";
      context.ctx.font = "11px Arial";
      context.ctx.textAlign = "center";
      context.ctx.textBaseline = "middle";

      context.ctx.fillText(
        this.formatValue
          ? this.formatValue(context, s.fAxial ?? 0, "forces", 3)
          : Number(s.fAxial ?? 0).toFixed(1),
        mid.x,
        mid.y - 14
      );

      context.ctx.restore();
    });
  }

  clearBackground(context) {
    const bgColor = this.getDisplayColor(
      context,
      "background2d",
      context.canvas2dBackground || "#36454F"
    );

    context.ctx.fillStyle = bgColor;
    context.ctx.fillRect(0, 0, context.grid.width, context.grid.height);
  }

  drawWireNode(node, context) {
    const p = this.projectPoint(node, context);

    context.ctx.save();

    Object.assign(context.ctx, node.style.get().WIREFRAME);

    context.ctx.fillStyle = this.getDisplayColor(context, "node", "#9ca3af");
    context.ctx.strokeStyle = this.getDisplayColor(context, "node", "#9ca3af");

    context.ctx.beginPath();
    context.ctx.arc(p.x, p.y, node.style.getModel().RADIUS / 2, 0, Math.PI * 2);
    context.ctx.fill();

    context.ctx.restore();
  }

  drawNode(node, context) {
    const p = this.projectPoint(node, context);
    const ctx = context.ctx;

    ctx.save();

    ctx.beginPath();
    ctx.arc(p.x, p.y, node.selected ? 6 : 4, 0, Math.PI * 2);
    ctx.fillStyle = node.selected
      ? (context.displayColors?.selected || "#facc15")
      : (context.displayColors?.node || "#9ca3af");
    ctx.fill();

    ctx.strokeStyle = "#111827";
    ctx.lineWidth = 1;
    ctx.stroke();

    if (context.options?.showIDs) {
      ctx.fillStyle = context.displayColors?.text || "#ffffff";
      ctx.font = "10px Arial";
      ctx.fillText(node.id, p.x + 7, p.y - 7);
    }

    ctx.restore();

    // Símbolo visual de apoyo / restricción
    if (this.jointHasAnyRestraint(node)) {
      this.drawJointSupportSymbol(node, context, p);
    }

    // Símbolo visual de diafragma
    if (this.jointHasDiaphragm(node)) {
      this.drawJointDiaphragmSymbol(node, context, p);
    }

    // Símbolo visual de Point Springs
    if (this.jointHasPointSprings(node)) {
      this.drawJointPointSpringSymbol(node, context, p);
    }

    if (context.displayOptions?.showJointLoads) {
      if (this.jointHasForceLoads(node)) {
        this.drawJointPointForceSymbol(node, context, p);
      }

      if (this.jointHasGroundDisplacementLoads(node)) {
        this.drawJointGroundDisplacementSymbol(node, context, p);
      }

      if (this.jointHasTemperatureLoads(node)) {
        this.drawJointTemperatureSymbol(node, context, p);
      }
    }

    if (this.objectHasGroups(node)) {
      const groupLabel = this.getObjectGroupLabel(node);
      this.drawObjectGroupLabel(context, p.x + 12, p.y + 28, groupLabel);
    }

    if (context.displayOptions?.showModeShape) {
      this.drawModeShapeNodeOverlay(node, context, p);
    }
  }

  drawNodeID(node, context) {
    // const p = context.grid.worldToScreen(node.position);
    const p = this.projectPoint(node, context);
    context.ctx.save();
    context.ctx.beginPath();

    Object.assign(context.ctx, node.style.get().ID);

    context.ctx.fillStyle = this.getDisplayColor(context, "text", "#ffffff");
    context.ctx.strokeStyle = this.getDisplayColor(context, "node", "#9ca3af");

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

  drawArrow(context, magX, magY, p) {
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
    // context.ctx.fillText(mag.toFixed(2) + "kN", end.x, end.y);
    context.ctx.fillText(
      `${this.formatValue(context, mag, "forces", 2)}kN`,
      end.x,
      end.y
    );
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
      // this.drawHorizontalLine(context, magX, `${magX.toFixed(2)}kN`, p, colors[context.options.currentLoad]);
      this.drawHorizontalLine(
        context,
        magX,
        `${this.formatValue(context, magX, "forces", 2)}kN`,
        p,
        colors[context.options.currentLoad]
      );
    }
    if (magY && magY !== 0) {
      // this.drawVerticalLine(context, magY, `${magY.toFixed(2)}kN`, p, colors[context.options.currentLoad]);
      this.drawVerticalLine(
        context,
        magY,
        `${this.formatValue(context, magY, "forces", 2)}kN`,
        p,
        colors[context.options.currentLoad]
      );
    }
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
      // this.drawHorizontalLine(context, magX, `${magX.toFixed(2)}kN`, p, "aquamarine");
      this.drawHorizontalLine(
        context,
        magX,
        `${this.formatValue(context, magX, "reactions", 2)}kN`,
        p,
        "aquamarine"
      );
    }
    if (magY && Math.abs(magY) > 0.0000000001) {
      // this.drawVerticalLine(context, magY, `${magY.toFixed(2)}kN`, p, "aquamarine");
      this.drawVerticalLine(
        context,
        magY,
        `${this.formatValue(context, magY, "reactions", 2)}kN`,
        p,
        "aquamarine"
      );
    }
  }

  drawWireBeam(beam, context) {
    const p1 = this.projectPoint(beam.node1, context);
    const p2 = this.projectPoint(beam.node2, context);
    const style = this.getElementRenderStyle(beam, "wireframe", context);

    context.ctx.save();
    context.ctx.strokeStyle = style.strokeStyle;
    context.ctx.lineWidth = style.lineWidth;
    context.ctx.setLineDash(style.lineDash || []);
    context.ctx.beginPath();
    context.ctx.moveTo(p1.x, p1.y);
    context.ctx.lineTo(p2.x, p2.y);
    context.ctx.stroke();
    context.ctx.setLineDash([]);
    context.ctx.restore();
  }

  drawBeam(beam, context) {
    const p1 = this.projectPoint(beam.node1, context);
    const p2 = this.projectPoint(beam.node2, context);
    const style = this.getElementRenderStyle(beam, "model", context);

    context.ctx.save();

    context.ctx.strokeStyle = style.strokeStyle;
    context.ctx.lineWidth = style.lineWidth;
    context.ctx.setLineDash(style.lineDash || []);

    context.ctx.beginPath();
    context.ctx.moveTo(p1.x, p1.y);
    context.ctx.lineTo(p2.x, p2.y);
    context.ctx.stroke();

    context.ctx.setLineDash([]);
    context.ctx.restore();

    // Etiqueta de sección asignada
    if (this.hasAssignedFrameSection(beam)) {
      this.drawFrameSectionLabel(beam, context, p1, p2);
    }

    // Símbolos de Frame Releases / Partial Fixity
    if (this.hasFrameReleases(beam)) {
      this.drawFrameReleaseSymbols(beam, context, p1, p2);
    }

    // Símbolos de End Length Offsets
    if (this.hasFrameEndOffsets(beam)) {
      this.drawFrameEndOffsetSymbols(beam, context, p1, p2);
    }

    if (context.displayOptions?.showFrameLoads) {
      if (this.frameHasPointLoads(beam)) {
        this.drawFramePointLoadSymbols(beam, context, p1, p2);
      }

      if (this.frameHasDistributedLoads(beam)) {
        this.drawFrameDistributedLoadSymbols(beam, context, p1, p2);
      }

      if (this.frameHasTemperatureLoads(beam)) {
        this.drawFrameTemperatureLoadSymbols(beam, context, p1, p2);
      }
    }

    if (context.displayOptions?.showModeShape) {
      this.drawModeShapeBeamOverlay(beam, context, p1, p2);
    }

    if (this.objectHasGroups(beam)) {
      const groupLabel = this.getObjectGroupLabel(beam);
      const midX = (p1.x + p2.x) / 2;
      const midY = (p1.y + p2.y) / 2;

      this.drawObjectGroupLabel(context, midX + 8, midY + 16, groupLabel);
    }
  }

  getAreaRenderStyle(area, isPreview = false) {
    const type = area.areaType || "slab";

    if (isPreview) {
      return {
        strokeStyle: "#fbbf24",
        fillStyle: "rgba(251, 191, 36, 0.18)",
        lineWidth: 1.5,
        lineDash: [6, 4],
      };
    }

    if (area.selected) {
      return {
        strokeStyle: "#ef4444",
        fillStyle: "rgba(239, 68, 68, 0.16)",
        lineWidth: 2,
        lineDash: [],
      };
    }

    switch (type) {
      case "wall":
        return {
          strokeStyle: "#22c55e",
          fillStyle: "rgba(34, 197, 94, 0.18)",
          lineWidth: 1.5,
          lineDash: [],
        };

      case "opening":
        return {
          strokeStyle: "#ef4444",
          fillStyle: "rgba(239, 68, 68, 0.12)",
          lineWidth: 1.5,
          lineDash: [4, 4],
        };

      case "slab":
      default:
        return {
          strokeStyle: "#38bdf8",
          fillStyle: "rgba(56, 189, 248, 0.18)",
          lineWidth: 1.5,
          lineDash: [],
        };
    }
  }

  drawArea(area, context, isPreview = false) {
    if (!area || area.visible === false) return;
    if (!area.points || area.points.length < 2) return;

    // primera versión: solo se muestra en planta
    const view = context.viewSet?.[context.activeViewIndex];
    if (view?.type !== "plan") return;

    const pts = area.points.map((p) => this.projectPoint({ position: p }, context));
    if (!pts.length) return;

    const style = this.getAreaRenderStyle(area, isPreview);
    const ctx = context.ctx;

    ctx.save();

    ctx.strokeStyle = style.strokeStyle;
    ctx.fillStyle = style.fillStyle;
    ctx.lineWidth = style.lineWidth;
    ctx.setLineDash(style.lineDash || []);

    ctx.beginPath();
    ctx.moveTo(pts[0].x, pts[0].y);

    for (let i = 1; i < pts.length; i++) {
      ctx.lineTo(pts[i].x, pts[i].y);
    }

    // si el polígono ya está cerrado (3 o más puntos), lo cerramos visualmente
    if (pts.length >= 3) {
      ctx.closePath();
      ctx.fill();
    }

    ctx.stroke();
    ctx.setLineDash([]);

    // vértices
    pts.forEach((p) => {
      ctx.beginPath();
      ctx.fillStyle = style.strokeStyle;
      ctx.arc(p.x, p.y, 3, 0, Math.PI * 2);
      ctx.fill();
    });

    ctx.restore();
  }

  drawAreas(context) {
    if (!context.areas?.length) return;

    context.areas.forEach((area) => {
      if (!this.shouldDrawArea(area, context)) return;
      this.drawArea(area, context, false);
    });
  }

  drawAreaPreview(context) {
    const state = context.currentState;
    if (!state || !state.previewArea) return;
    if (!this.shouldDrawArea(state.previewArea, context)) return;

    this.drawArea(state.previewArea, context, true);
  }

  drawReshapeObjectState(state, context) {
    const ctx = context.ctx;

    ctx.save();

    // =========================
    // BARRA
    // =========================
    if (state.selectedBeam) {
      const p1 = this.projectPoint(state.selectedBeam.node1, context);
      const p2 = this.projectPoint(state.selectedBeam.node2, context);

      // resaltar barra
      ctx.strokeStyle = "#60a5fa";
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(p1.x, p1.y);
      ctx.lineTo(p2.x, p2.y);
      ctx.stroke();

      // handle nodo 1
      ctx.beginPath();
      ctx.fillStyle = state.selectedNode === state.selectedBeam.node1 ? "#f59e0b" : "#38bdf8";
      ctx.strokeStyle = "#ffffff";
      ctx.lineWidth = 1.2;
      ctx.arc(p1.x, p1.y, 6, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // handle nodo 2
      ctx.beginPath();
      ctx.fillStyle = state.selectedNode === state.selectedBeam.node2 ? "#f59e0b" : "#38bdf8";
      ctx.strokeStyle = "#ffffff";
      ctx.lineWidth = 1.2;
      ctx.arc(p2.x, p2.y, 6, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    }

    // =========================
    // ÁREA
    // =========================
    if (state.selectedArea && state.selectedArea.points?.length) {
      const pts = state.selectedArea.points.map((p) =>
        this.projectPoint({ position: p }, context)
      );

      // borde resaltado
      ctx.strokeStyle = "#60a5fa";
      ctx.lineWidth = 2.5;
      ctx.setLineDash([]);
      ctx.beginPath();
      ctx.moveTo(pts[0].x, pts[0].y);

      for (let i = 1; i < pts.length; i++) {
        ctx.lineTo(pts[i].x, pts[i].y);
      }

      if (pts.length >= 3) {
        ctx.closePath();
      }

      ctx.stroke();

      // handles de vértices
      pts.forEach((p, index) => {
        ctx.beginPath();
        ctx.fillStyle = state.selectedVertexIndex === index ? "#f59e0b" : "#38bdf8";
        ctx.strokeStyle = "#ffffff";
        ctx.lineWidth = 1.2;
        ctx.arc(p.x, p.y, 6, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
      });
    }

    ctx.restore();
  }

  drawReferencePoint(point, context) {
    if (!point || point.visible === false) return;

    const p = this.projectPoint({ position: point }, context);
    const ctx = context.ctx;

    ctx.save();

    // círculo exterior
    ctx.beginPath();
    ctx.strokeStyle = "#38bdf8";
    ctx.lineWidth = 1.5;
    ctx.arc(p.x, p.y, 6, 0, Math.PI * 2);
    ctx.stroke();

    // cruz interior
    ctx.beginPath();
    ctx.strokeStyle = "#38bdf8";
    ctx.lineWidth = 1;
    ctx.moveTo(p.x - 8, p.y);
    ctx.lineTo(p.x + 8, p.y);
    ctx.moveTo(p.x, p.y - 8);
    ctx.lineTo(p.x, p.y + 8);
    ctx.stroke();

    // punto central
    ctx.beginPath();
    ctx.fillStyle = "#7dd3fc";
    ctx.arc(p.x, p.y, 2.5, 0, Math.PI * 2);
    ctx.fill();

    // etiqueta
    ctx.fillStyle = "#7dd3fc";
    ctx.font = "11px Arial";
    ctx.fillText(point.label || `RP${point.id}`, p.x + 10, p.y - 8);

    ctx.restore();
  }

  drawReferencePoints(context) {
    if (!context.referencePoints?.length) return;

    context.referencePoints.forEach((point) => {
      this.drawReferencePoint(point, context);
    });
  }

  drawDimensionLine(dim, context, isPreview = false) {
    if (!dim || dim.visible === false) return;

    const ctx = context.ctx;

    const p1 = this.projectPoint({ position: dim.start }, context);
    const p2 = this.projectPoint({ position: dim.end }, context);

    const dx = p2.x - p1.x;
    const dy = p2.y - p1.y;
    const len = Math.sqrt(dx * dx + dy * dy);
    if (len < 1e-6) return;

    const ux = dx / len;
    const uy = dy / len;

    const nx = -uy;
    const ny = ux;

    const offset = 18;

    const a1 = { x: p1.x + nx * offset, y: p1.y + ny * offset };
    const a2 = { x: p2.x + nx * offset, y: p2.y + ny * offset };

    ctx.save();

    const strokeColor = isPreview
      ? "#fbbf24"
      : dim.selected
        ? "#ef4444"
        : "#38bdf8";

    const fillColor = isPreview
      ? "#fbbf24"
      : dim.selected
        ? "#f87171"
        : "#7dd3fc";

    ctx.strokeStyle = strokeColor;
    ctx.fillStyle = fillColor;
    ctx.lineWidth = 1.2;

    if (isPreview) {
      ctx.setLineDash([6, 4]);
    } else {
      ctx.setLineDash([]);
    }

    // líneas de extensión
    ctx.beginPath();
    ctx.moveTo(p1.x, p1.y);
    ctx.lineTo(a1.x, a1.y);
    ctx.moveTo(p2.x, p2.y);
    ctx.lineTo(a2.x, a2.y);
    ctx.stroke();

    // línea de dimensión
    ctx.beginPath();
    ctx.moveTo(a1.x, a1.y);
    ctx.lineTo(a2.x, a2.y);
    ctx.stroke();

    ctx.setLineDash([]);

    // marcas finales
    const tick = 5;
    ctx.beginPath();
    ctx.moveTo(a1.x - ux * tick, a1.y - uy * tick);
    ctx.lineTo(a1.x + ux * tick, a1.y + uy * tick);

    ctx.moveTo(a2.x - ux * tick, a2.y - uy * tick);
    ctx.lineTo(a2.x + ux * tick, a2.y + uy * tick);
    ctx.stroke();

    // texto
    const mid = {
      x: (a1.x + a2.x) * 0.5,
      y: (a1.y + a2.y) * 0.5,
    };

    ctx.font = "11px Arial";
    ctx.textAlign = "center";
    ctx.textBaseline = "bottom";
    ctx.fillText(dim.label, mid.x, mid.y - 4);

    ctx.restore();
  }

  drawDimensionLines(context) {
    if (!context.dimensionLines?.length) return;

    context.dimensionLines.forEach((dim) => {
      this.drawDimensionLine(dim, context, false);
    });
  }

  drawDimensionPreview(context) {
    const state = context.currentState;
    if (!state || !state.startPoint || !state.previewPoint) return;

    const preview = {
      start: state.startPoint,
      end: state.previewPoint,
      label: (() => {
        const dx = state.previewPoint.x - state.startPoint.x;
        const dy = state.previewPoint.y - state.startPoint.y;
        const dz = state.previewPoint.z - state.startPoint.z;
        const d = Math.sqrt(dx * dx + dy * dy + dz * dz);
        // return `${d.toFixed(2)} m`;
        return `${this.formatValue(context, d, "lengths", 2)} m`;
      })(),
      visible: true,
    };

    this.drawDimensionLine(preview, context, true);
  }

  getFrameSectionLabel(beam) {
    if (!beam) return "";

    return (
      beam.sectionName ||
      beam.frameSection?.name ||
      beam.frameSection?.id ||
      beam.section?.name ||
      beam.section?.id ||
      beam.sectionId ||
      ""
    );
  }

  hasAssignedFrameSection(beam) {
    return !!this.getFrameSectionLabel(beam);
  }

  drawFrameSectionLabel(beam, context, p1, p2) {
    const label = this.getFrameSectionLabel(beam);

    if (!label) return;

    const ctx = context.ctx;

    const midX = (p1.x + p2.x) / 2;
    const midY = (p1.y + p2.y) / 2;

    ctx.save();

    ctx.translate(midX, midY);
    ctx.rotate(beam.angle || 0);

    ctx.font = "11px Arial";
    ctx.textAlign = "center";
    ctx.textBaseline = "bottom";

    // Fondo pequeño para que se lea mejor
    const textWidth = ctx.measureText(label).width;
    ctx.fillStyle = "rgba(0, 0, 0, 0.55)";
    ctx.fillRect(-textWidth / 2 - 4, -20, textWidth + 8, 14);

    ctx.fillStyle = "#60a5fa";
    ctx.fillText(label, 0, -8);

    ctx.restore();
  }

  getFrameReleases(beam) {
    if (!beam) return null;

    return (
      beam.frameReleases ||
      beam.releases ||
      beam.assignment?.frameReleases ||
      null
    );
  }

  frameEndHasRelease(releases, endKey = "iEnd") {
    if (!releases || !releases[endKey]) return false;

    const keys = [
      "axial",
      "shear2",
      "shear3",
      "torsion",
      "moment22",
      "moment33",
    ];

    return keys.some((key) => releases[endKey]?.[key] === true);
  }

  frameHasPartialFixity(releases) {
    return releases?.partialFixity?.enabled === true;
  }

  hasFrameReleases(beam) {
    const releases = this.getFrameReleases(beam);

    if (!releases) return false;

    return (
      this.frameEndHasRelease(releases, "iEnd") ||
      this.frameEndHasRelease(releases, "jEnd") ||
      this.frameHasPartialFixity(releases)
    );
  }

  getReleaseLabel(releases, endKey = "iEnd") {
    if (!releases || !releases[endKey]) return "";

    const map = {
      axial: "P",
      shear2: "V2",
      shear3: "V3",
      torsion: "T",
      moment22: "M2",
      moment33: "M3",
    };

    return Object.keys(map)
      .filter((key) => releases[endKey]?.[key] === true)
      .map((key) => map[key])
      .join(",");
  }

  drawFrameReleaseCircle(context, x, y, label = "") {
    const ctx = context.ctx;

    ctx.save();

    ctx.beginPath();
    ctx.arc(x, y, 7, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(249, 115, 22, 0.95)";
    ctx.fill();
    ctx.lineWidth = 1.5;
    ctx.strokeStyle = "#ffffff";
    ctx.stroke();

    if (label) {
      ctx.font = "9px Arial";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillStyle = "#111827";
      ctx.fillText("R", x, y);
    }

    ctx.restore();
  }

  drawPartialFixityDiamond(context, x, y) {
    const ctx = context.ctx;
    const size = 7;

    ctx.save();

    ctx.beginPath();
    ctx.moveTo(x, y - size);
    ctx.lineTo(x + size, y);
    ctx.lineTo(x, y + size);
    ctx.lineTo(x - size, y);
    ctx.closePath();

    ctx.fillStyle = "rgba(168, 85, 247, 0.95)";
    ctx.fill();
    ctx.lineWidth = 1.5;
    ctx.strokeStyle = "#ffffff";
    ctx.stroke();

    ctx.font = "9px Arial";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillStyle = "#ffffff";
    ctx.fillText("F", x, y);

    ctx.restore();
  }

  drawFrameReleaseSymbols(beam, context, p1, p2) {
    const releases = this.getFrameReleases(beam);

    if (!releases) return;

    const hasI = this.frameEndHasRelease(releases, "iEnd");
    const hasJ = this.frameEndHasRelease(releases, "jEnd");
    const hasPartial = this.frameHasPartialFixity(releases);

    if (!hasI && !hasJ && !hasPartial) return;

    const dx = p2.x - p1.x;
    const dy = p2.y - p1.y;
    const length = Math.sqrt(dx * dx + dy * dy);

    if (length < 1e-6) return;

    const ux = dx / length;
    const uy = dy / length;

    // Separar un poco del nodo para que no tape el punto
    const offset = 14;

    const iX = p1.x + ux * offset;
    const iY = p1.y + uy * offset;

    const jX = p2.x - ux * offset;
    const jY = p2.y - uy * offset;

    if (hasI) {
      this.drawFrameReleaseCircle(
        context,
        iX,
        iY,
        this.getReleaseLabel(releases, "iEnd")
      );
    }

    if (hasJ) {
      this.drawFrameReleaseCircle(
        context,
        jX,
        jY,
        this.getReleaseLabel(releases, "jEnd")
      );
    }

    if (hasPartial) {
      const midX = (p1.x + p2.x) / 2;
      const midY = (p1.y + p2.y) / 2;

      this.drawPartialFixityDiamond(context, midX, midY);
    }
  }

  getFrameEndOffsets(beam) {
    if (!beam) return null;

    return (
      beam.frameEndOffsets ||
      beam.endOffsets ||
      beam.assignment?.frameEndOffsets ||
      null
    );
  }

  hasFrameEndOffsets(beam) {
    const offsets = this.getFrameEndOffsets(beam);

    if (!offsets) return false;

    const iLength = Number(offsets.iEnd?.offsetLength || 0);
    const jLength = Number(offsets.jEnd?.offsetLength || 0);

    const iRigid = Number(offsets.iEnd?.rigidZoneFactor || 0);
    const jRigid = Number(offsets.jEnd?.rigidZoneFactor || 0);

    return (
      offsets.autoOffset === true ||
      offsets.useRigidZoneFactor === true ||
      iLength > 0 ||
      jLength > 0 ||
      iRigid > 0 ||
      jRigid > 0
    );
  }

  drawFrameEndOffsetSymbols(beam, context, p1, p2) {
    const offsets = this.getFrameEndOffsets(beam);

    if (!offsets || !this.hasFrameEndOffsets(beam)) return;

    const ctx = context.ctx;

    const dx = p2.x - p1.x;
    const dy = p2.y - p1.y;
    const length = Math.sqrt(dx * dx + dy * dy);

    if (length < 1e-6) return;

    const ux = dx / length;
    const uy = dy / length;

    const markerLength = 18;

    const iLength = Number(offsets.iEnd?.offsetLength || 0);
    const jLength = Number(offsets.jEnd?.offsetLength || 0);

    ctx.save();

    ctx.strokeStyle = "#22c55e";
    ctx.lineWidth = 3;
    ctx.setLineDash([4, 3]);

    if (iLength > 0 || offsets.autoOffset) {
      ctx.beginPath();
      ctx.moveTo(p1.x, p1.y);
      ctx.lineTo(p1.x + ux * markerLength, p1.y + uy * markerLength);
      ctx.stroke();
    }

    if (jLength > 0 || offsets.autoOffset) {
      ctx.beginPath();
      ctx.moveTo(p2.x, p2.y);
      ctx.lineTo(p2.x - ux * markerLength, p2.y - uy * markerLength);
      ctx.stroke();
    }

    ctx.setLineDash([]);

    ctx.font = "10px Arial";
    ctx.fillStyle = "#22c55e";
    ctx.textAlign = "center";

    if (iLength > 0) {
      ctx.fillText(
        `OI ${iLength}`,
        p1.x + ux * (markerLength + 12),
        p1.y + uy * (markerLength + 12)
      );
    }

    if (jLength > 0) {
      ctx.fillText(
        `OJ ${jLength}`,
        p2.x - ux * (markerLength + 12),
        p2.y - uy * (markerLength + 12)
      );
    }

    ctx.restore();
  }

  // =====================================================
  // VISUAL ASSIGN > JOINT / POINT > RESTRAINTS
  // =====================================================

  getJointRestraints(node) {
    if (!node) return null;

    return (
      node.restraints ||
      node.constraints ||
      node.assignment?.restraints ||
      null
    );
  }

  jointHasAnyRestraint(node) {
    const r = this.getJointRestraints(node);

    if (!r) return false;

    return (
      r.ux === true ||
      r.uy === true ||
      r.uz === true ||
      r.rx === true ||
      r.ry === true ||
      r.rz === true
    );
  }

  getJointSupportType(node) {
    const r = this.getJointRestraints(node);

    if (!r) return "free";

    if (r.type) return r.type;

    const ux = r.ux === true;
    const uy = r.uy === true;
    const uz = r.uz === true;
    const rx = r.rx === true;
    const ry = r.ry === true;
    const rz = r.rz === true;

    if (ux && uy && uz && rx && ry && rz) return "fixed";
    if (ux && uy && uz && !rx && !ry && !rz) return "pinned";
    if (!ux && uy && uz && !rx && !ry && !rz) return "rollerX";
    if (ux && !uy && uz && !rx && !ry && !rz) return "rollerY";
    if (!ux && !uy && !uz && !rx && !ry && !rz) return "free";

    return "custom";
  }

  drawJointSupportSymbol(node, context, screenPoint) {
    if (!this.jointHasAnyRestraint(node)) return;

    const type = this.getJointSupportType(node);
    const x = screenPoint.x;
    const y = screenPoint.y;

    switch (type) {
      case "fixed":
        this.drawFixedSupport(context, x, y);
        break;

      case "pinned":
        this.drawPinnedSupport(context, x, y);
        break;

      case "rollerX":
        this.drawRollerXSupport(context, x, y);
        break;

      case "rollerY":
        this.drawRollerYSupport(context, x, y);
        break;

      case "free":
        break;

      default:
        this.drawCustomSupport(context, x, y);
        break;
    }
  }

  drawFixedSupport(context, x, y) {
    const ctx = context.ctx;

    ctx.save();

    // Cuadrado de apoyo fijo
    ctx.fillStyle = "#ef4444";
    ctx.strokeStyle = "#ffffff";
    ctx.lineWidth = 1.5;

    ctx.beginPath();
    ctx.rect(x - 8, y + 7, 16, 10);
    ctx.fill();
    ctx.stroke();

    // Hachurado
    ctx.strokeStyle = "#ffffff";
    ctx.lineWidth = 1;

    for (let i = -8; i <= 8; i += 4) {
      ctx.beginPath();
      ctx.moveTo(x + i, y + 17);
      ctx.lineTo(x + i - 5, y + 23);
      ctx.stroke();
    }

    // Letra
    ctx.fillStyle = "#ffffff";
    ctx.font = "9px Arial";
    ctx.textAlign = "center";
    ctx.fillText("F", x, y + 15);

    ctx.restore();
  }

  drawPinnedSupport(context, x, y) {
    const ctx = context.ctx;

    ctx.save();

    ctx.fillStyle = "#facc15";
    ctx.strokeStyle = "#111827";
    ctx.lineWidth = 1.5;

    // Triángulo
    ctx.beginPath();
    ctx.moveTo(x, y + 7);
    ctx.lineTo(x - 10, y + 22);
    ctx.lineTo(x + 10, y + 22);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Base
    ctx.beginPath();
    ctx.moveTo(x - 13, y + 23);
    ctx.lineTo(x + 13, y + 23);
    ctx.stroke();

    ctx.fillStyle = "#111827";
    ctx.font = "9px Arial";
    ctx.textAlign = "center";
    ctx.fillText("P", x, y + 20);

    ctx.restore();
  }

  drawRollerXSupport(context, x, y) {
    const ctx = context.ctx;

    ctx.save();

    // Triángulo principal
    ctx.fillStyle = "#38bdf8";
    ctx.strokeStyle = "#111827";
    ctx.lineWidth = 1.5;

    ctx.beginPath();
    ctx.moveTo(x, y + 7);
    ctx.lineTo(x - 10, y + 20);
    ctx.lineTo(x + 10, y + 20);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Rueditas horizontales
    ctx.fillStyle = "#ffffff";
    ctx.strokeStyle = "#111827";

    ctx.beginPath();
    ctx.arc(x - 6, y + 25, 3, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(x + 6, y + 25, 3, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Base
    ctx.beginPath();
    ctx.moveTo(x - 14, y + 30);
    ctx.lineTo(x + 14, y + 30);
    ctx.stroke();

    ctx.fillStyle = "#111827";
    ctx.font = "8px Arial";
    ctx.textAlign = "center";
    ctx.fillText("RX", x, y + 18);

    ctx.restore();
  }

  drawRollerYSupport(context, x, y) {
    const ctx = context.ctx;

    ctx.save();

    // Triángulo lateral para diferenciarlo
    ctx.fillStyle = "#34d399";
    ctx.strokeStyle = "#111827";
    ctx.lineWidth = 1.5;

    ctx.beginPath();
    ctx.moveTo(x + 8, y);
    ctx.lineTo(x + 22, y - 10);
    ctx.lineTo(x + 22, y + 10);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Rueditas verticales
    ctx.fillStyle = "#ffffff";
    ctx.strokeStyle = "#111827";

    ctx.beginPath();
    ctx.arc(x + 27, y - 6, 3, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(x + 27, y + 6, 3, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Base vertical
    ctx.beginPath();
    ctx.moveTo(x + 32, y - 14);
    ctx.lineTo(x + 32, y + 14);
    ctx.stroke();

    ctx.fillStyle = "#111827";
    ctx.font = "8px Arial";
    ctx.textAlign = "center";
    ctx.fillText("RY", x + 18, y + 3);

    ctx.restore();
  }

  drawCustomSupport(context, x, y) {
    const ctx = context.ctx;

    ctx.save();

    ctx.beginPath();
    ctx.arc(x, y + 15, 9, 0, Math.PI * 2);
    ctx.fillStyle = "#a855f7";
    ctx.fill();
    ctx.strokeStyle = "#ffffff";
    ctx.lineWidth = 1.5;
    ctx.stroke();

    ctx.fillStyle = "#ffffff";
    ctx.font = "9px Arial";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("C", x, y + 15);

    ctx.restore();
  }

  // =====================================================
  // VISUAL ASSIGN > JOINT / POINT > DIAPHRAGMS
  // =====================================================

  getJointDiaphragm(node) {
    if (!node) return null;

    return (
      node.diaphragm ||
      node.assignment?.diaphragm ||
      (
        node.diaphragmId
          ? {
            id: node.diaphragmId,
            name: node.diaphragmName || node.diaphragmId,
            type: "rigid",
          }
          : null
      )
    );
  }

  jointHasDiaphragm(node) {
    return !!this.getJointDiaphragm(node);
  }

  drawJointDiaphragmSymbol(node, context, screenPoint) {
    const diaphragm = this.getJointDiaphragm(node);

    if (!diaphragm) return;

    const ctx = context.ctx;
    const label = diaphragm.name || diaphragm.id || "D";

    const x = screenPoint.x;
    const y = screenPoint.y;

    ctx.save();

    // Anillo alrededor del nodo
    ctx.beginPath();
    ctx.arc(x, y, 10, 0, Math.PI * 2);
    ctx.strokeStyle = "#22d3ee";
    ctx.lineWidth = 2;
    ctx.stroke();

    // Etiqueta pequeña
    ctx.font = "10px Arial";
    ctx.textAlign = "left";
    ctx.textBaseline = "middle";

    const textWidth = ctx.measureText(label).width;
    const labelX = x + 12;
    const labelY = y + 12;

    ctx.fillStyle = "rgba(8, 47, 73, 0.85)";
    ctx.fillRect(labelX - 3, labelY - 8, textWidth + 6, 16);

    ctx.fillStyle = "#67e8f9";
    ctx.fillText(label, labelX, labelY);

    ctx.restore();
  }

  // =====================================================
  // VISUAL ASSIGN > JOINT / POINT > POINT SPRINGS
  // =====================================================

  getJointPointSprings(node) {
    if (!node) return null;

    return (
      node.pointSprings ||
      node.springs ||
      node.assignment?.pointSprings ||
      null
    );
  }

  jointHasPointSprings(node) {
    const springs = this.getJointPointSprings(node);

    if (!springs?.stiffness) return false;

    const k = springs.stiffness;

    return (
      Number(k.ux || 0) !== 0 ||
      Number(k.uy || 0) !== 0 ||
      Number(k.uz || 0) !== 0 ||
      Number(k.rx || 0) !== 0 ||
      Number(k.ry || 0) !== 0 ||
      Number(k.rz || 0) !== 0
    );
  }

  getPointSpringLabel(node) {
    const springs = this.getJointPointSprings(node);

    if (!springs?.stiffness) return "K";

    const k = springs.stiffness;
    const labels = [];

    if (Number(k.ux || 0) !== 0) labels.push("UX");
    if (Number(k.uy || 0) !== 0) labels.push("UY");
    if (Number(k.uz || 0) !== 0) labels.push("UZ");
    if (Number(k.rx || 0) !== 0) labels.push("RX");
    if (Number(k.ry || 0) !== 0) labels.push("RY");
    if (Number(k.rz || 0) !== 0) labels.push("RZ");

    return labels.length ? `K:${labels.join(",")}` : "K";
  }

  drawPointSpringZigzag(context, x, y) {
    const ctx = context.ctx;

    const startY = y + 6;
    const endY = y + 34;
    const width = 7;
    const segments = 6;
    const step = (endY - startY) / segments;

    ctx.save();

    ctx.strokeStyle = "#22c55e";
    ctx.lineWidth = 2;

    ctx.beginPath();
    ctx.moveTo(x, startY);

    for (let i = 1; i <= segments; i++) {
      const px = i % 2 === 0 ? x - width : x + width;
      const py = startY + step * i;
      ctx.lineTo(px, py);
    }

    ctx.lineTo(x, endY + 6);
    ctx.stroke();

    // Base del resorte
    ctx.beginPath();
    ctx.moveTo(x - 12, endY + 8);
    ctx.lineTo(x + 12, endY + 8);
    ctx.stroke();

    ctx.restore();
  }

  drawJointPointSpringSymbol(node, context, screenPoint) {
    if (!this.jointHasPointSprings(node)) return;

    const ctx = context.ctx;

    // Lo movemos a la izquierda para no chocar con apoyos ni diafragmas
    const x = screenPoint.x - 26;
    const y = screenPoint.y;

    const label = this.getPointSpringLabel(node);

    ctx.save();

    this.drawPointSpringZigzag(context, x, y);

    ctx.font = "10px Arial";
    ctx.textAlign = "left";
    ctx.textBaseline = "middle";

    const textX = x + 12;
    const textY = y + 22;
    const textWidth = ctx.measureText(label).width;

    ctx.fillStyle = "rgba(20, 83, 45, 0.85)";
    ctx.fillRect(textX - 3, textY - 8, textWidth + 6, 16);

    ctx.fillStyle = "#86efac";
    ctx.fillText(label, textX, textY);

    ctx.restore();
  }

  // =====================================================
  // VISUAL ASSIGN > JOINT / POINT LOADS > FORCE
  // =====================================================

  getJointPointLoads(node) {
    if (!node) return [];

    return (
      node.pointLoads ||
      node.jointLoads ||
      node.assignment?.pointLoads ||
      []
    );
  }

  getJointForceLoads(node) {
    return this.getJointPointLoads(node).filter((load) => {
      return load?.type === "force" && load?.forces;
    });
  }

  jointHasForceLoads(node) {
    return this.getJointForceLoads(node).length > 0;
  }

  getJointForceLoadLabel(node) {
    const loads = this.getJointForceLoads(node);

    if (!loads.length) return "";

    const load = loads[loads.length - 1];
    const f = load.forces || {};

    const parts = [];

    if (Number(f.fx || 0) !== 0) parts.push(`FX=${f.fx}`);
    if (Number(f.fy || 0) !== 0) parts.push(`FY=${f.fy}`);
    if (Number(f.fz || 0) !== 0) parts.push(`FZ=${f.fz}`);
    if (Number(f.mx || 0) !== 0) parts.push(`MX=${f.mx}`);
    if (Number(f.my || 0) !== 0) parts.push(`MY=${f.my}`);
    if (Number(f.mz || 0) !== 0) parts.push(`MZ=${f.mz}`);

    const loadCase = load.loadCase || "LOAD";

    return `${loadCase}: ${parts.join(", ")}`;
  }

  drawJointForceArrow(context, x, y) {
    const ctx = context.ctx;

    ctx.save();

    ctx.strokeStyle = "#ef4444";
    ctx.fillStyle = "#ef4444";
    ctx.lineWidth = 2;

    // Flecha vertical hacia abajo
    ctx.beginPath();
    ctx.moveTo(x, y - 38);
    ctx.lineTo(x, y - 10);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(x, y - 10);
    ctx.lineTo(x - 5, y - 19);
    ctx.lineTo(x + 5, y - 19);
    ctx.closePath();
    ctx.fill();

    ctx.restore();
  }

  drawJointPointForceSymbol(node, context, screenPoint) {
    if (!this.jointHasForceLoads(node)) return;

    const ctx = context.ctx;
    const x = screenPoint.x;
    const y = screenPoint.y;

    const label = this.getJointForceLoadLabel(node);

    ctx.save();

    this.drawJointForceArrow(context, x, y);

    ctx.font = "10px Arial";
    ctx.textAlign = "left";
    ctx.textBaseline = "middle";

    const labelX = x + 10;
    const labelY = y - 30;
    const textWidth = ctx.measureText(label).width;

    ctx.fillStyle = "rgba(127, 29, 29, 0.85)";
    ctx.fillRect(labelX - 3, labelY - 8, textWidth + 6, 16);

    ctx.fillStyle = "#fecaca";
    ctx.fillText(label, labelX, labelY);

    ctx.restore();
  }

  // =====================================================
  // VISUAL ASSIGN > JOINT / POINT LOADS > GROUND DISPLACEMENT
  // =====================================================

  getJointGroundDisplacementLoads(node) {
    return this.getJointPointLoads(node).filter((load) => {
      return load?.type === "ground-displacement" && load?.displacements;
    });
  }

  jointHasGroundDisplacementLoads(node) {
    return this.getJointGroundDisplacementLoads(node).length > 0;
  }

  getJointGroundDisplacementLabel(node) {
    const loads = this.getJointGroundDisplacementLoads(node);

    if (!loads.length) return "";

    const load = loads[loads.length - 1];
    const d = load.displacements || {};

    const parts = [];

    if (Number(d.ux || 0) !== 0) parts.push(`UX=${d.ux}`);
    if (Number(d.uy || 0) !== 0) parts.push(`UY=${d.uy}`);
    if (Number(d.uz || 0) !== 0) parts.push(`UZ=${d.uz}`);
    if (Number(d.rx || 0) !== 0) parts.push(`RX=${d.rx}`);
    if (Number(d.ry || 0) !== 0) parts.push(`RY=${d.ry}`);
    if (Number(d.rz || 0) !== 0) parts.push(`RZ=${d.rz}`);

    const loadCase = load.loadCase || "LOAD";

    return `${loadCase}: ${parts.join(", ")}`;
  }

  drawJointGroundDisplacementSymbol(node, context, screenPoint) {
    if (!this.jointHasGroundDisplacementLoads(node)) return;

    const ctx = context.ctx;

    const x = screenPoint.x + 34;
    const y = screenPoint.y + 4;

    const label = this.getJointGroundDisplacementLabel(node);

    ctx.save();

    // Símbolo tipo desplazamiento impuesto: flecha doble morada
    ctx.strokeStyle = "#a855f7";
    ctx.fillStyle = "#a855f7";
    ctx.lineWidth = 2;

    ctx.beginPath();
    ctx.moveTo(x - 16, y);
    ctx.lineTo(x + 16, y);
    ctx.stroke();

    // Punta izquierda
    ctx.beginPath();
    ctx.moveTo(x - 16, y);
    ctx.lineTo(x - 8, y - 5);
    ctx.lineTo(x - 8, y + 5);
    ctx.closePath();
    ctx.fill();

    // Punta derecha
    ctx.beginPath();
    ctx.moveTo(x + 16, y);
    ctx.lineTo(x + 8, y - 5);
    ctx.lineTo(x + 8, y + 5);
    ctx.closePath();
    ctx.fill();

    // Letra D
    ctx.beginPath();
    ctx.arc(x, y, 9, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(88, 28, 135, 0.95)";
    ctx.fill();
    ctx.strokeStyle = "#ffffff";
    ctx.lineWidth = 1.2;
    ctx.stroke();

    ctx.fillStyle = "#ffffff";
    ctx.font = "10px Arial";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("D", x, y);

    // Etiqueta
    ctx.font = "10px Arial";
    ctx.textAlign = "left";
    ctx.textBaseline = "middle";

    const labelX = x + 18;
    const labelY = y;
    const textWidth = ctx.measureText(label).width;

    ctx.fillStyle = "rgba(88, 28, 135, 0.85)";
    ctx.fillRect(labelX - 3, labelY - 8, textWidth + 6, 16);

    ctx.fillStyle = "#e9d5ff";
    ctx.fillText(label, labelX, labelY);

    ctx.restore();
  }

  // =====================================================
  // VISUAL ASSIGN > JOINT / POINT LOADS > TEMPERATURE
  // =====================================================

  getJointTemperatureLoads(node) {
    return this.getJointPointLoads(node).filter((load) => {
      return load?.type === "temperature" && load?.temperature;
    });
  }

  jointHasTemperatureLoads(node) {
    return this.getJointTemperatureLoads(node).length > 0;
  }

  getJointTemperatureLabel(node) {
    const loads = this.getJointTemperatureLoads(node);

    if (!loads.length) return "";

    const load = loads[loads.length - 1];
    const t = load.temperature || {};

    const loadCase = load.loadCase || "LOAD";
    const deltaT = Number(t.deltaT || 0);

    return `${loadCase}: ΔT=${deltaT}°C`;
  }

  drawJointTemperatureSymbol(node, context, screenPoint) {
    if (!this.jointHasTemperatureLoads(node)) return;

    const ctx = context.ctx;

    const x = screenPoint.x + 34;
    const y = screenPoint.y - 28;

    const label = this.getJointTemperatureLabel(node);

    ctx.save();

    // Termómetro simple
    ctx.strokeStyle = "#fb923c";
    ctx.fillStyle = "#fb923c";
    ctx.lineWidth = 2;

    // Tubo
    ctx.beginPath();
    ctx.roundRect(x - 3, y - 18, 6, 24, 3);
    ctx.stroke();

    // Bulbo
    ctx.beginPath();
    ctx.arc(x, y + 10, 7, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "#ffffff";
    ctx.lineWidth = 1.2;
    ctx.stroke();

    // Línea interna
    ctx.beginPath();
    ctx.moveTo(x, y + 6);
    ctx.lineTo(x, y - 12);
    ctx.strokeStyle = "#fb923c";
    ctx.lineWidth = 3;
    ctx.stroke();

    // Letra T
    ctx.fillStyle = "#ffffff";
    ctx.font = "9px Arial";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("T", x, y + 10);

    // Etiqueta
    ctx.font = "10px Arial";
    ctx.textAlign = "left";
    ctx.textBaseline = "middle";

    const labelX = x + 13;
    const labelY = y;
    const textWidth = ctx.measureText(label).width;

    ctx.fillStyle = "rgba(124, 45, 18, 0.85)";
    ctx.fillRect(labelX - 3, labelY - 8, textWidth + 6, 16);

    ctx.fillStyle = "#fed7aa";
    ctx.fillText(label, labelX, labelY);

    ctx.restore();
  }

  // =====================================================
  // VISUAL ASSIGN > FRAME / LINE LOADS > POINT
  // =====================================================

  getFrameLoads(beam) {
    if (!beam) return [];

    return (
      beam.frameLoads ||
      beam.lineLoads ||
      beam.assignment?.frameLoads ||
      []
    );
  }

  getFramePointLoads(beam) {
    return this.getFrameLoads(beam).filter((load) => {
      return load?.type === "point";
    });
  }

  frameHasPointLoads(beam) {
    return this.getFramePointLoads(beam).length > 0;
  }

  getFramePointLoadLabel(load) {
    if (!load) return "";

    const loadCase = load.loadCase || "LOAD";
    const direction = load.direction || "";
    const value = Number(load.value || 0);

    return `${loadCase}: ${direction}=${value}`;
  }

  getFramePointLoadScreenPosition(beam, context, p1, p2, load) {
    const t = Number(load.relativeDistance ?? 0.5);

    return {
      x: p1.x + (p2.x - p1.x) * t,
      y: p1.y + (p2.y - p1.y) * t,
    };
  }

  drawFramePointLoadArrow(context, x, y, angle = 0) {
    const ctx = context.ctx;

    ctx.save();

    ctx.translate(x, y);
    ctx.rotate(angle);

    ctx.strokeStyle = "#ef4444";
    ctx.fillStyle = "#ef4444";
    ctx.lineWidth = 2;

    // Flecha hacia abajo local en pantalla
    ctx.beginPath();
    ctx.moveTo(0, -34);
    ctx.lineTo(0, -8);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(0, -8);
    ctx.lineTo(-5, -17);
    ctx.lineTo(5, -17);
    ctx.closePath();
    ctx.fill();

    ctx.restore();
  }

  drawFramePointLoadSymbols(beam, context, p1, p2) {
    const loads = this.getFramePointLoads(beam);

    if (!loads.length) return;

    const ctx = context.ctx;

    loads.forEach((load, index) => {
      const pos = this.getFramePointLoadScreenPosition(beam, context, p1, p2, load);
      const label = this.getFramePointLoadLabel(load);

      const offsetY = index * 16;

      this.drawFramePointLoadArrow(context, pos.x, pos.y - offsetY);

      ctx.save();

      ctx.font = "10px Arial";
      ctx.textAlign = "left";
      ctx.textBaseline = "middle";

      const labelX = pos.x + 8;
      const labelY = pos.y - 30 - offsetY;
      const textWidth = ctx.measureText(label).width;

      ctx.fillStyle = "rgba(127, 29, 29, 0.85)";
      ctx.fillRect(labelX - 3, labelY - 8, textWidth + 6, 16);

      ctx.fillStyle = "#fecaca";
      ctx.fillText(label, labelX, labelY);

      ctx.restore();
    });
  }

  // =====================================================
  // VISUAL ASSIGN > FRAME / LINE LOADS > DISTRIBUTED
  // =====================================================

  getFrameDistributedLoads(beam) {
    return this.getFrameLoads(beam).filter((load) => {
      return load?.type === "distributed";
    });
  }

  frameHasDistributedLoads(beam) {
    return this.getFrameDistributedLoads(beam).length > 0;
  }

  getFrameDistributedLoadLabel(load) {
    if (!load) return "";

    const loadCase = load.loadCase || "LOAD";
    const direction = load.direction || "";
    const w1 = Number(load.startValue || 0);
    const w2 = Number(load.endValue || 0);

    if (w1 === w2) {
      return `${loadCase}: ${direction}=${w1}`;
    }

    return `${loadCase}: ${direction}=${w1}→${w2}`;
  }

  getFrameDistributedRange(load) {
    let t1 = Number(load.startRelativeDistance ?? 0);
    let t2 = Number(load.endRelativeDistance ?? 1);

    t1 = Math.max(0, Math.min(1, t1));
    t2 = Math.max(0, Math.min(1, t2));

    if (t2 < t1) {
      const temp = t1;
      t1 = t2;
      t2 = temp;
    }

    return { t1, t2 };
  }

  drawFrameDistributedLoadArrow(context, x, y, arrowLength = 28) {
    const ctx = context.ctx;

    ctx.save();

    ctx.strokeStyle = "#f97316";
    ctx.fillStyle = "#f97316";
    ctx.lineWidth = 1.8;

    ctx.beginPath();
    ctx.moveTo(x, y - arrowLength);
    ctx.lineTo(x, y - 6);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(x, y - 6);
    ctx.lineTo(x - 4, y - 14);
    ctx.lineTo(x + 4, y - 14);
    ctx.closePath();
    ctx.fill();

    ctx.restore();
  }

  drawFrameDistributedLoadSymbols(beam, context, p1, p2) {
    const loads = this.getFrameDistributedLoads(beam);

    if (!loads.length) return;

    const ctx = context.ctx;

    loads.forEach((load, loadIndex) => {
      const { t1, t2 } = this.getFrameDistributedRange(load);

      const x1 = p1.x + (p2.x - p1.x) * t1;
      const y1 = p1.y + (p2.y - p1.y) * t1;

      const x2 = p1.x + (p2.x - p1.x) * t2;
      const y2 = p1.y + (p2.y - p1.y) * t2;

      const dx = x2 - x1;
      const dy = y2 - y1;
      const length = Math.sqrt(dx * dx + dy * dy);

      if (length < 1e-6) return;

      const ux = dx / length;
      const uy = dy / length;

      // Normal para separar las flechas de la barra
      const nx = -uy;
      const ny = ux;

      const baseOffset = 24 + loadIndex * 22;

      const arrowCount = Math.max(3, Math.min(9, Math.floor(length / 45)));

      const startValue = Math.abs(Number(load.startValue || 0));
      const endValue = Math.abs(Number(load.endValue || 0));
      const maxValue = Math.max(startValue, endValue, 1);

      const topPoints = [];

      for (let i = 0; i < arrowCount; i++) {
        const ratio = arrowCount === 1 ? 0 : i / (arrowCount - 1);
        const t = t1 + (t2 - t1) * ratio;

        const x = p1.x + (p2.x - p1.x) * t;
        const y = p1.y + (p2.y - p1.y) * t;

        const valueAtPoint =
          Number(load.startValue || 0) +
          (Number(load.endValue || 0) - Number(load.startValue || 0)) * ratio;

        const normalized = Math.abs(valueAtPoint) / maxValue;
        const arrowLength = 18 + normalized * 18;

        const baseX = x + nx * baseOffset;
        const baseY = y + ny * baseOffset;

        const topX = baseX + nx * arrowLength;
        const topY = baseY + ny * arrowLength;

        topPoints.push({ x: topX, y: topY });

        this.drawFrameDistributedLoadArrow(context, baseX, baseY, arrowLength);
      }

      // Línea superior para que parezca carga distribuida/trapezoidal
      if (topPoints.length >= 2) {
        ctx.save();

        ctx.strokeStyle = "#f97316";
        ctx.lineWidth = 1.5;
        ctx.setLineDash([4, 3]);

        ctx.beginPath();
        ctx.moveTo(topPoints[0].x, topPoints[0].y);

        for (let i = 1; i < topPoints.length; i++) {
          ctx.lineTo(topPoints[i].x, topPoints[i].y);
        }

        ctx.stroke();
        ctx.setLineDash([]);

        ctx.restore();
      }

      // Etiqueta
      const label = this.getFrameDistributedLoadLabel(load);
      const midT = (t1 + t2) / 2;
      const midX = p1.x + (p2.x - p1.x) * midT + nx * (baseOffset + 38);
      const midY = p1.y + (p2.y - p1.y) * midT + ny * (baseOffset + 38);

      ctx.save();

      ctx.font = "10px Arial";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";

      const textWidth = ctx.measureText(label).width;

      ctx.fillStyle = "rgba(124, 45, 18, 0.85)";
      ctx.fillRect(midX - textWidth / 2 - 4, midY - 8, textWidth + 8, 16);

      ctx.fillStyle = "#fed7aa";
      ctx.fillText(label, midX, midY);

      ctx.restore();
    });
  }

  // =====================================================
  // VISUAL ASSIGN > FRAME / LINE LOADS > TEMPERATURE
  // =====================================================

  getFrameTemperatureLoads(beam) {
    return this.getFrameLoads(beam).filter((load) => {
      return load?.type === "temperature" && load?.temperature;
    });
  }

  frameHasTemperatureLoads(beam) {
    return this.getFrameTemperatureLoads(beam).length > 0;
  }

  getFrameTemperatureLoadLabel(load) {
    if (!load) return "";

    const loadCase = load.loadCase || "LOAD";
    const type = load.temperatureType || "uniform";
    const t = load.temperature || {};

    if (type === "gradient2") {
      return `${loadCase}: G2=${Number(t.gradient2 || 0)}°C/m`;
    }

    if (type === "gradient3") {
      return `${loadCase}: G3=${Number(t.gradient3 || 0)}°C/m`;
    }

    if (type === "combined") {
      return `${loadCase}: ΔT=${Number(t.deltaT || 0)} G2=${Number(t.gradient2 || 0)} G3=${Number(t.gradient3 || 0)}`;
    }

    return `${loadCase}: ΔT=${Number(t.deltaT || 0)}°C`;
  }

  drawFrameTemperatureSymbol(context, x, y) {
    const ctx = context.ctx;

    ctx.save();

    ctx.strokeStyle = "#fb923c";
    ctx.fillStyle = "#fb923c";
    ctx.lineWidth = 2;

    // Tubo del termómetro
    ctx.beginPath();
    ctx.rect(x - 3, y - 18, 6, 24);
    ctx.stroke();

    // Bulbo
    ctx.beginPath();
    ctx.arc(x, y + 10, 7, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = "#ffffff";
    ctx.lineWidth = 1.2;
    ctx.stroke();

    // Línea interna
    ctx.beginPath();
    ctx.moveTo(x, y + 6);
    ctx.lineTo(x, y - 12);
    ctx.strokeStyle = "#fb923c";
    ctx.lineWidth = 3;
    ctx.stroke();

    ctx.fillStyle = "#ffffff";
    ctx.font = "9px Arial";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("T", x, y + 10);

    ctx.restore();
  }

  drawFrameTemperatureLoadSymbols(beam, context, p1, p2) {
    const loads = this.getFrameTemperatureLoads(beam);

    if (!loads.length) return;

    const ctx = context.ctx;

    const dx = p2.x - p1.x;
    const dy = p2.y - p1.y;
    const length = Math.sqrt(dx * dx + dy * dy);

    if (length < 1e-6) return;

    const ux = dx / length;
    const uy = dy / length;

    const nx = -uy;
    const ny = ux;

    loads.forEach((load, index) => {
      const midX = (p1.x + p2.x) / 2 + nx * (54 + index * 24);
      const midY = (p1.y + p2.y) / 2 + ny * (54 + index * 24);

      const label = this.getFrameTemperatureLoadLabel(load);

      this.drawFrameTemperatureSymbol(context, midX, midY);

      ctx.save();

      ctx.font = "10px Arial";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";

      const labelX = midX + 34;
      const labelY = midY;
      const textWidth = ctx.measureText(label).width;

      ctx.fillStyle = "rgba(124, 45, 18, 0.85)";
      ctx.fillRect(labelX - textWidth / 2 - 4, labelY - 8, textWidth + 8, 16);

      ctx.fillStyle = "#fed7aa";
      ctx.fillText(label, labelX, labelY);

      ctx.restore();
    });
  }

  // =====================================================
  // VISUAL ASSIGN > GROUP NAMES
  // =====================================================

  getObjectGroupLabel(obj) {
    if (!obj) return "";

    const groups =
      obj.groupNames ||
      obj.groupIds ||
      obj.groups?.map((group) => group.name || group.id) ||
      obj.assignment?.groups?.map((group) => group.name || group.id) ||
      [];

    if (!groups.length) return "";

    if (groups.length === 1) {
      return `G:${groups[0]}`;
    }

    return `G:${groups[0]}+${groups.length - 1}`;
  }

  objectHasGroups(obj) {
    return !!this.getObjectGroupLabel(obj);
  }

  drawObjectGroupLabel(context, x, y, label) {
    if (!label) return;

    const ctx = context.ctx;

    ctx.save();

    ctx.font = "10px Arial";
    ctx.textAlign = "left";
    ctx.textBaseline = "middle";

    const textWidth = ctx.measureText(label).width;

    ctx.fillStyle = "rgba(30, 64, 175, 0.85)";
    ctx.fillRect(x - 3, y - 8, textWidth + 6, 16);

    ctx.fillStyle = "#bfdbfe";
    ctx.fillText(label, x, y);

    ctx.restore();
  }

  getElementRenderStyle(beam, mode = "model", context = null) {
    const type = beam.elementType || beam.type || "beam";

    const beamColor = context
      ? this.getDisplayColor(context, "beam", "#d1d5db")
      : "#d1d5db";

    const secondaryBeamColor = context
      ? this.getDisplayColor(context, "secondaryBeam", "#38bdf8")
      : "#38bdf8";

    const columnColor = context
      ? this.getDisplayColor(context, "column", "#22c55e")
      : "#22c55e";

    const selectedColor = context
      ? this.getDisplayColor(context, "selected", "#facc15")
      : "#facc15";

    const textColor = context
      ? this.getDisplayColor(context, "text", "#ffffff")
      : "#ffffff";

    if (beam.selected) {
      return {
        strokeStyle: selectedColor,
        lineWidth: 3,
        lineDash: [],
        textColor: selectedColor,
      };
    }

    if (this.hasAssignedFrameSection(beam)) {
      return {
        strokeStyle: "#60a5fa",
        lineWidth: mode === "wireframe" ? 2.2 : 3,
        lineDash: [],
        textColor: "#60a5fa",
      };
    }

    if (type === "column") {
      return {
        strokeStyle: columnColor,
        lineWidth: 3,
        lineDash: [],
        textColor,
      };
    }

    if (type === "secondary-beam") {
      return {
        strokeStyle: secondaryBeamColor,
        lineWidth: 2.2,
        lineDash: [6, 4],
        textColor,
      };
    }

    if (type === "brace") {
      return {
        strokeStyle: "#f59e0b",
        lineWidth: 2,
        lineDash: [6, 4],
        textColor,
      };
    }

    return {
      strokeStyle: beamColor,
      lineWidth: mode === "wireframe" ? 2 : 2.5,
      lineDash: [],
      textColor,
    };
  }

  drawBeamID(beam, context) {
    const p1 = this.projectPoint(beam.node1, context);
    const p2 = this.projectPoint(beam.node2, context);
    const mid = { x: (p1.x + p2.x) * 0.5, y: (p1.y + p2.y) * 0.5 };
    const style = this.getElementRenderStyle(beam, "model", context);

    context.ctx.save();
    context.ctx.translate(mid.x, mid.y);
    context.ctx.rotate(beam.angle || 0);
    context.ctx.fillStyle = style.textColor || "#ffffff";
    context.ctx.font = "10px Arial";
    context.ctx.textAlign = "center";
    context.ctx.fillText(`${beam.id}`, 0, 10);
    context.ctx.restore();
  }

  // =====================================================
  // VISUAL DISPLAY > SHOW MODE SHAPE
  // =====================================================

  getModeShapeScreenOffset(obj, context) {
    const modeNumber = Number(context.displayOptions?.modeNumber ?? 1);
    const modeScale = Number(context.displayOptions?.modeScale ?? 1);

    const p =
      obj?.position ||
      obj?.node1?.position ||
      { x: 0, y: 0, z: 0 };

    const x = Number(p.x ?? 0);
    const y = Number(p.y ?? 0);
    const z = Number(p.z ?? 0);

    // Forma modal visual temporal, no resultado real de análisis.
    const phase = (x * 0.37 + y * 0.23 + z * 0.19 + modeNumber) * Math.PI;

    return {
      dx: Math.sin(phase) * 14 * modeScale,
      dy: Math.cos(phase) * 10 * modeScale,
    };
  }

  drawModeShapeBeamOverlay(beam, context, p1, p2) {
    if (!context.displayOptions?.showModeShape) return;

    const ctx = context.ctx;

    const o1 = this.getModeShapeScreenOffset(beam.node1, context);
    const o2 = this.getModeShapeScreenOffset(beam.node2, context);

    const q1 = {
      x: p1.x + o1.dx,
      y: p1.y + o1.dy,
    };

    const q2 = {
      x: p2.x + o2.dx,
      y: p2.y + o2.dy,
    };

    ctx.save();

    ctx.strokeStyle = "#c084fc";
    ctx.lineWidth = 2;
    ctx.setLineDash([6, 4]);

    ctx.beginPath();
    ctx.moveTo(q1.x, q1.y);
    ctx.lineTo(q2.x, q2.y);
    ctx.stroke();

    ctx.setLineDash([]);

    const label = `Mode ${context.displayOptions?.modeNumber ?? 1}`;
    const midX = (q1.x + q2.x) / 2;
    const midY = (q1.y + q2.y) / 2;

    ctx.font = "10px Arial";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    const textWidth = ctx.measureText(label).width;

    ctx.fillStyle = "rgba(88, 28, 135, 0.85)";
    ctx.fillRect(midX - textWidth / 2 - 4, midY - 8, textWidth + 8, 16);

    ctx.fillStyle = "#e9d5ff";
    ctx.fillText(label, midX, midY);

    ctx.restore();
  }

  drawModeShapeNodeOverlay(node, context, p) {
    if (!context.displayOptions?.showModeShape) return;

    const ctx = context.ctx;
    const offset = this.getModeShapeScreenOffset(node, context);

    const x = p.x + offset.dx;
    const y = p.y + offset.dy;

    ctx.save();

    ctx.beginPath();
    ctx.arc(x, y, 4, 0, Math.PI * 2);
    ctx.fillStyle = "#c084fc";
    ctx.fill();

    ctx.strokeStyle = "#ffffff";
    ctx.lineWidth = 1;
    ctx.stroke();

    ctx.restore();
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
    ctx.strokeStyle = this.getDisplayColor(context, "gridLine", "#2f5f7f");
    ctx.fillStyle = this.getDisplayColor(context, "text", "#ffffff");
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

  drawGridBubble(ctx, point, label, context, strokeColor = null, textColor = null) {
    const bubbleStroke = strokeColor || this.getDisplayColor(context, "gridMainLine", "#3b82f6");
    const bubbleText = textColor || this.getDisplayColor(context, "text", "#ffffff");

    ctx.save();
    ctx.beginPath();
    ctx.strokeStyle = bubbleStroke;
    ctx.lineWidth = 1;
    ctx.arc(point.x, point.y, 10, 0, Math.PI * 2);
    ctx.stroke();

    ctx.fillStyle = bubbleText;
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

    const axisColor = this.getDisplayColor(context, "gridMainLine", "#3b82f6");
    const lineColor = this.getDisplayColor(context, "gridLine", "#2f5f7f");
    const textColor = this.getDisplayColor(context, "text", "#ffffff");

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

      ctx.fillStyle = textColor;
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
    ctx.fillStyle = this.getDisplayColor(context, "node", "#9ca3af");
    ctx.fill();

    ctx.fillStyle = textColor;
    ctx.font = "bold 10px Arial";
    ctx.fillText("0,0", origin.x + 8, origin.y - 5);

    ctx.font = "bold 12px 'Segoe UI', Arial";
    ctx.fillStyle = axisColor;
    ctx.fillText(`📐 ELEVACIÓN Eje Y-${currentElevationZ} (Y = ${currentY}m) - Plano X-Z`, 15, 30);

    ctx.font = "10px Arial";
    ctx.fillStyle = textColor;
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

    const axisColor = this.getDisplayColor(context, "gridMainLine", "#3b82f6");
    const lineColor = this.getDisplayColor(context, "gridLine", "#2f5f7f");
    const textColor = this.getDisplayColor(context, "text", "#ffffff");

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

      ctx.fillStyle = textColor;
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
    ctx.fillStyle = this.getDisplayColor(context, "node", "#9ca3af");
    ctx.fill();

    ctx.fillStyle = textColor;
    ctx.font = "bold 10px Arial";
    ctx.fillText("0,0", origin.x + 8, origin.y - 5);

    ctx.font = "bold 12px 'Segoe UI', Arial";
    ctx.fillStyle = axisColor;
    ctx.fillText(`📐 ELEVACIÓN Eje X-${currentElevationX} (X = ${currentX}m) - Plano Y-Z`, 15, 30);

    ctx.font = "10px Arial";
    ctx.fillStyle = textColor;
    ctx.fillText("Haz clic para dibujar | Esc para salir", 15, 50);

    ctx.restore();
  }

  // Vista planta (X-Y)
  drawPlanGrid(grid, context) {
    const ctx = context.ctx;
    const refGrid = context.referenceGrid;
    const lines = this.getGeneralGridsFromReferenceGrid(refGrid);

    if (!lines.length) return;

    const lineColor = this.getDisplayColor(context, "gridLine", "#2f5f7f");
    const textColor = this.getDisplayColor(context, "text", "#ffffff");
    const axisColor = this.getDisplayColor(context, "gridMainLine", "#3b82f6");

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

    // lines.forEach((line) => {
    //   if (line.visible === false) return;

    //   const p1 = grid.worldToScreen({ x: line.x1, y: line.y1 });
    //   const p2 = grid.worldToScreen({ x: line.x2, y: line.y2 });

    //   ctx.beginPath();
    //   ctx.setLineDash(line.source === "custom" ? [8, 4] : []);
    //   ctx.moveTo(p1.x, p1.y);
    //   ctx.lineTo(p2.x, p2.y);
    //   ctx.stroke();

    //   const bubblePoint = line.bubbleLoc === "Start" ? p1 : p2;
    //   this.drawGridBubble(ctx, point, label, context, lineColor, textColor);
    // });
    // Líneas de grilla generales
    lines.forEach((line) => {
      if (line.visible === false) return;

      const p1 = grid.worldToScreen({ x: line.x1, y: line.y1 });
      const p2 = grid.worldToScreen({ x: line.x2, y: line.y2 });

      if (line.source === "custom") {
        ctx.strokeStyle = "#bfc7d5";
        ctx.lineWidth = 1.2;
        ctx.setLineDash([6, 4]);
      } else {
        ctx.strokeStyle = lineColor;
        ctx.lineWidth = 0.8;
        ctx.setLineDash([]);
      }

      ctx.beginPath();
      ctx.moveTo(p1.x, p1.y);
      ctx.lineTo(p2.x, p2.y);
      ctx.stroke();

      ctx.setLineDash([]);

      const bubblePoint = line.bubbleLoc === "Start" ? p1 : p2;
      this.drawGridBubble(
        ctx,
        bubblePoint,
        line.id,
        line.source === "custom" ? "#bfc7d5" : lineColor,
        textColor
      );
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

    this.drawGeneralGridIntersectionMarkers(grid, context);
    this.drawGeneralGridEndpointMarkers(grid, context);
    this.drawCustomGeneralGridBubbles(grid, context);

    ctx.restore();
  }

  getGeneralGridBubbleWorldPoint(line) {
    if (!line) return null;

    if ((line.bubbleLoc ?? "End") === "Start") {
      return { x: Number(line.x1 ?? 0), y: Number(line.y1 ?? 0) };
    }

    return { x: Number(line.x2 ?? 0), y: Number(line.y2 ?? 0) };
  }

  drawGeneralGridBubble(grid, ctx, line) {
    if (!line || line.visible === false) return;

    const worldPoint = this.getGeneralGridBubbleWorldPoint(line);
    if (!worldPoint) return;

    const p = grid.worldToScreen(worldPoint);
    const radius = 13;

    ctx.save();

    // línea guía pequeña hacia la burbuja
    const midX = (Number(line.x1 ?? 0) + Number(line.x2 ?? 0)) / 2;
    const midY = (Number(line.y1 ?? 0) + Number(line.y2 ?? 0)) / 2;
    const midP = grid.worldToScreen({ x: midX, y: midY });

    ctx.beginPath();
    ctx.strokeStyle = "#cdd7e3";
    ctx.lineWidth = 1;
    ctx.moveTo(midP.x, midP.y);
    ctx.lineTo(p.x, p.y);
    ctx.stroke();

    // burbuja
    ctx.beginPath();
    ctx.fillStyle = "#f4f6f8";
    ctx.strokeStyle = "#aeb7c2";
    ctx.lineWidth = 1.2;
    ctx.arc(p.x, p.y, radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // texto
    ctx.fillStyle = "#4b5563";
    ctx.font = "12px Arial";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(String(line.id ?? ""), p.x, p.y);

    ctx.restore();
  }

  drawCustomGeneralGridBubbles(grid, context) {
    const ref = context.referenceGrid;
    if (!ref?.generalGrids?.length) return;

    const customLines = ref.generalGrids.filter(
      (g) => g.source === "custom" && g.visible !== false
    );

    customLines.forEach((line) => {
      this.drawGeneralGridBubble(grid, context.ctx, line);
    });
  }

  drawGeneralGridIntersectionMarkers(grid, context) {
    if (!context.getGeneralGridIntersections) return;

    const points = context.getGeneralGridIntersections();
    if (!points?.length) return;

    const ctx = context.ctx;

    ctx.save();
    ctx.strokeStyle = "#9fb3c8";
    ctx.lineWidth = 1;

    points.forEach((point) => {
      const p = grid.worldToScreen({ x: point.x, y: point.y });

      ctx.beginPath();
      ctx.moveTo(p.x - 4, p.y - 4);
      ctx.lineTo(p.x + 4, p.y + 4);
      ctx.moveTo(p.x - 4, p.y + 4);
      ctx.lineTo(p.x + 4, p.y - 4);
      ctx.stroke();
    });

    ctx.restore();
  }

  drawGeneralGridEndpointMarkers(grid, context) {
    if (!context.getGeneralGridEndpoints) return;

    const points = context.getGeneralGridEndpoints();
    if (!points?.length) return;

    const ctx = context.ctx;

    ctx.save();
    ctx.fillStyle = "#d6dde6";
    ctx.strokeStyle = "#aeb7c2";
    ctx.lineWidth = 1;

    points.forEach((point) => {
      const p = grid.worldToScreen({ x: point.x, y: point.y });

      ctx.beginPath();
      ctx.arc(p.x, p.y, 3, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    });

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
      p = this.projectPoint({ position: point }, context);
    } else {
      return;
    }

    let markerColor = "#ff3b30";

    if (point.source === "general-grid-intersection") {
      markerColor = "#ffd166";
    } else if (point.source === "general-grid-endpoint") {
      markerColor = "#06d6a0";
    } else if (point.source === "general-grid") {
      markerColor = "#a78bfa";
    }

    ctx.save();

    // punto
    ctx.beginPath();
    ctx.fillStyle = markerColor;
    ctx.arc(p.x, p.y, 4, 0, Math.PI * 2);
    ctx.fill();

    // cruz
    ctx.strokeStyle = markerColor;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(p.x - 8, p.y);
    ctx.lineTo(p.x + 8, p.y);
    ctx.moveTo(p.x, p.y - 8);
    ctx.lineTo(p.x, p.y + 8);
    ctx.stroke();

    // etiqueta
    ctx.fillStyle = "#111";
    ctx.font = "12px Arial";
    ctx.fillText(point.displayLabel || point.label || "", p.x + 10, p.y - 10);

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

  drawRubberBandZoomState(state, context) {
    const rect = state.getScreenRect?.();

    if (!rect || rect.width <= 0 || rect.height <= 0) {
      return;
    }

    const ctx = context.ctx;

    ctx.save();

    ctx.fillStyle = "rgba(250, 204, 21, 0.12)";
    ctx.fillRect(rect.left, rect.top, rect.width, rect.height);

    ctx.strokeStyle = "rgba(250, 204, 21, 1)";
    ctx.lineWidth = 2;
    ctx.setLineDash([8, 4]);

    ctx.shadowColor = "rgba(250, 204, 21, 0.8)";
    ctx.shadowBlur = 4;

    ctx.strokeRect(rect.left, rect.top, rect.width, rect.height);

    ctx.setLineDash([]);

    ctx.font = "11px Arial";
    ctx.fillStyle = "#facc15";
    ctx.textAlign = "left";
    ctx.textBaseline = "bottom";
    ctx.fillText(
      "Rubber Band Zoom",
      rect.left + 6,
      rect.top - 4
    );

    ctx.restore();
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

  // DIBUJO SOLO DE OBJETOS VISIBLES EN LA VISTA ACTIVA
  shouldDrawNode(node, CADSystem) {
    if (!node) return false;

    if (typeof CADSystem.isObjectVisibleInActiveView === "function") {
      return CADSystem.isObjectVisibleInActiveView(node);
    }

    const view = CADSystem.viewSet?.[CADSystem.activeViewIndex];
    if (!view) return true;

    const tol = CADSystem.getActiveViewTolerance?.() ?? 0.05;

    const x = Number(node.position?.x || 0);
    const y = Number(node.position?.y || 0);
    const z = Number(node.position?.z || 0);

    if (view.type === "plan") {
      const activeZ = Number(view.elevation ?? view.z ?? 0);
      return Math.abs(z - activeZ) <= tol;
    }

    if (view.type === "elevation") {
      if (view.axis === "X") {
        return Math.abs(x - Number(view.value ?? 0)) <= tol;
      }

      if (view.axis === "Y") {
        return Math.abs(y - Number(view.value ?? 0)) <= tol;
      }
    }

    return true;
  }

  shouldDrawBeam(beam, CADSystem) {
    if (!beam) return false;

    if (typeof CADSystem.isObjectVisibleInActiveView === "function") {
      return CADSystem.isObjectVisibleInActiveView(beam);
    }

    return (
      this.shouldDrawNode(beam.node1, CADSystem) &&
      this.shouldDrawNode(beam.node2, CADSystem)
    );
  }

  shouldDrawArea(area, CADSystem) {
    if (!area || area.visible === false) return false;
    if (!area?.points?.length) return false;

    if (typeof CADSystem.isObjectVisibleInActiveView === "function") {
      return CADSystem.isObjectVisibleInActiveView(area);
    }

    const view = CADSystem.viewSet?.[CADSystem.activeViewIndex];
    if (!view) return true;

    const tol = CADSystem.getActiveViewTolerance?.() ?? 0.05;

    const areaZ =
      typeof area.z === "number"
        ? area.z
        : typeof area.points[0]?.z === "number"
          ? area.points[0].z
          : 0;

    if (view.type === "plan") {
      return Math.abs(areaZ - Number(view.elevation ?? 0)) <= tol;
    }

    if (view.type === "elevation") {
      return false;
    }

    return true;
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
          this.drawBeam(s, CADSystem);
        });

        CADSystem.parametricModels.forEach((parametric) => {
          parametric.shapes.forEach((s) => {
            if (!this.shouldDrawBeam(s, CADSystem)) return;
            this.drawBeam(s, CADSystem);
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
      if (!this.shouldDrawNode(n, CADSystem)) return;
      this.drawSupport(n, CADSystem);
    });

    if (!CADSystem.options.showWireframe) {
      CADSystem.shapes.forEach((s) => {
        if (!this.shouldDrawBeam(s, CADSystem)) return;
        this.drawBeam(s, CADSystem);
      });

      this.drawAxiales(CADSystem);

      CADSystem.nodes.forEach((n) => {
        if (!this.shouldDrawNode(n, CADSystem)) return;
        this.drawNode(n, CADSystem);
      });
    } else {
      CADSystem.shapes.forEach((s) => {
        if (!this.shouldDrawBeam(s, CADSystem)) return;
        this.drawWireBeam(s, CADSystem);
      });

      this.drawWireframeAxiales(CADSystem);

      CADSystem.nodes.forEach((n) => {
        if (!this.shouldDrawNode(n, CADSystem)) return;
        this.drawWireNode(n, CADSystem);
      });
    }

    if (CADSystem.options.showFAxialesValues) {
      this.drawAxialesValues(CADSystem);
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

    CADSystem.currentState.draw(this, CADSystem);
  }
}