import { BeamStyle, NodeStyle } from "../model/styles.js";
import { pointDistance, axisToFixed, midPoint } from "../lib/utils.js";
import { generateMockFrameForceResults } from "../engine/mockFrameForceResults.js";
import { drawFrameForceDiagrams2D } from "../diagrams/frameForceDiagramRenderer.js";
import { drawFrameLocalAxes2D } from "../diagrams/frameLocalAxesRenderer.js";
import { drawFrameSectionProperties2D } from "../diagrams/frameSectionPropertiesRenderer.js";
import {
  showFrameForceTable,
  hideFrameForceTable,
  getFrameForceTableRows,
} from "../diagrams/frameForceTable.js";

import {
  addDefaultCombosAndEnvelope,
  getAvailableFrameForceCases,
} from "../engine/frameForceCombinations.js";

import {
  showFrameForceDisplayPanel,
  hideFrameForceDisplayPanel,
} from "../diagrams/frameForceDisplayPanel.js";


function imgFromSVG(svg) {
  // Create an image from the SVG string
  const img = new Image();
  img.src = URL.createObjectURL(new Blob([svg], { type: "image/svg+xml" }));
  return img;
}

// Soportes 2D: misma GEOMETRÍA que los componentes Blade
// components/cad/svg/soporte{1,2,3}.blade.php (relleno translúcido + patas),
// con el trazo aclarado (#e2e8f0) porque el canvas del modelo es oscuro — el
// #2c3e50 original de las vistas está pensado para fondos claros.
const SOP_STROKE = "#e2e8f0";
const SOP_FILL = "rgba(148, 163, 184, 0.35)";

const soporteUno = `
  <svg viewBox="90 20 70 60" width="30" height="30" xmlns="http://www.w3.org/2000/svg">
    <polygon points="120,20 140,60 100,60" fill="${SOP_FILL}" stroke="${SOP_STROKE}" stroke-width="2"/>
    <line x1="90" y1="60" x2="150" y2="60" stroke="${SOP_STROKE}" stroke-width="2"/>
    <line x1="90" y1="60" x2="100" y2="70" stroke="${SOP_STROKE}" stroke-width="2"/>
    <line x1="100" y1="60" x2="110" y2="70" stroke="${SOP_STROKE}" stroke-width="2"/>
    <line x1="110" y1="60" x2="120" y2="70" stroke="${SOP_STROKE}" stroke-width="2"/>
    <line x1="120" y1="60" x2="130" y2="70" stroke="${SOP_STROKE}" stroke-width="2"/>
    <line x1="130" y1="60" x2="140" y2="70" stroke="${SOP_STROKE}" stroke-width="2"/>
    <line x1="140" y1="60" x2="150" y2="70" stroke="${SOP_STROKE}" stroke-width="2"/>
    <line x1="150" y1="60" x2="160" y2="70" stroke="${SOP_STROKE}" stroke-width="2"/>
  </svg>`;

const soporteDos = `
  <svg viewBox="90 20 70 60" width="30" height="30" xmlns="http://www.w3.org/2000/svg">
    <circle cx="120" cy="40" r="20" fill="${SOP_FILL}" stroke="${SOP_STROKE}" stroke-width="2"/>
    <line x1="90" y1="60" x2="150" y2="60" stroke="${SOP_STROKE}" stroke-width="2"/>
    <line x1="90" y1="60" x2="100" y2="70" stroke="${SOP_STROKE}" stroke-width="2"/>
    <line x1="100" y1="60" x2="110" y2="70" stroke="${SOP_STROKE}" stroke-width="2"/>
    <line x1="110" y1="60" x2="120" y2="70" stroke="${SOP_STROKE}" stroke-width="2"/>
    <line x1="120" y1="60" x2="130" y2="70" stroke="${SOP_STROKE}" stroke-width="2"/>
    <line x1="130" y1="60" x2="140" y2="70" stroke="${SOP_STROKE}" stroke-width="2"/>
    <line x1="140" y1="60" x2="150" y2="70" stroke="${SOP_STROKE}" stroke-width="2"/>
    <line x1="150" y1="60" x2="160" y2="70" stroke="${SOP_STROKE}" stroke-width="2"/>
  </svg>`;

const soporteTres = `
  <svg viewBox="20 90 60 70" width="30" height="30" xmlns="http://www.w3.org/2000/svg">
    <circle cx="40" cy="120" r="20" fill="${SOP_FILL}" stroke="${SOP_STROKE}" stroke-width="2"/>
    <line x1="25" y1="150" x2="25" y2="90" stroke="${SOP_STROKE}" stroke-width="2"/>
    <line x1="10" y1="150" x2="25" y2="140" stroke="${SOP_STROKE}" stroke-width="2"/>
    <line x1="10" y1="140" x2="25" y2="130" stroke="${SOP_STROKE}" stroke-width="2"/>
    <line x1="10" y1="130" x2="25" y2="120" stroke="${SOP_STROKE}" stroke-width="2"/>
    <line x1="10" y1="120" x2="25" y2="110" stroke="${SOP_STROKE}" stroke-width="2"/>
    <line x1="10" y1="110" x2="25" y2="100" stroke="${SOP_STROKE}" stroke-width="2"/>
    <line x1="10" y1="100" x2="25" y2="90" stroke="${SOP_STROKE}" stroke-width="2"/>
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

    this.drawImportedPlanBackground(CADSystem);
    this.drawAxisIndicator(CADSystem);
    this.drawGridAxisPreview(CADSystem);

    this.drawReferencePlanes(CADSystem);
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
      // 1. Dibujar primero el modelo normal visible en la vista activa
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

      // 2. NUEVO B-DIAG-00: diagramas de fuerzas internas tipo ETABS
      // Se dibuja encima de las barras, pero debajo de los nodos.
      if (CADSystem.frameDiagramDisplay?.enabled) {
        this.drawFrameForceDiagrams?.(CADSystem);
      }

      if (CADSystem.frameDiagramDisplay?.showLocalAxes) {
        this.drawFrameLocalAxes?.(CADSystem);
      }

      if (CADSystem.sectionPropertyDisplay?.enabled) {
        this.drawFrameSectionProperties?.(CADSystem);
      }

      // 3. Legacy: Display > Member Forces axial antiguo
      if (CADSystem.options.showFAxiales) {
        this.drawAxiales(CADSystem);

        if (CADSystem.options.showFAxialesValues) {
          this.drawAxialesValues(CADSystem);
        }
      }

      // 4. Dibujar nodos visibles encima de barras y diagramas
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
      // 1. Wireframe normal
      CADSystem.shapes.forEach((s) => {
        if (!this.shouldDrawBeam(s, CADSystem)) return;
        this.drawWireBeam(s, CADSystem);
      });

      CADSystem.parametricModels.forEach((parametric) => {
        parametric.shapes.forEach((s) => {
          if (!this.shouldDrawBeam(s, CADSystem)) return;
          this.drawWireBeam(s, CADSystem);
        });
      });

      // 2. NUEVO B-DIAG-00: diagramas también sobre wireframe
      // Importante: solo una vez.
      if (CADSystem.frameDiagramDisplay?.enabled) {
        this.drawFrameForceDiagrams?.(CADSystem);
      }

      if (CADSystem.frameDiagramDisplay?.showLocalAxes) {
        this.drawFrameLocalAxes?.(CADSystem);
      }

      if (CADSystem.sectionPropertyDisplay?.enabled) {
        this.drawFrameSectionProperties?.(CADSystem);
      }

      // 3. Axiales legacy encima del wireframe
      if (CADSystem.options.showFAxiales) {
        this.drawWireframeAxiales(CADSystem);

        if (CADSystem.options.showFAxialesValues) {
          this.drawAxialesValues(CADSystem);
        }
      }

      // 4. Nodos wireframe encima
      CADSystem.nodes.forEach((n) => {
        if (!this.shouldDrawNode(n, CADSystem)) return;
        this.drawWireNode(n, CADSystem);
      });

      CADSystem.parametricModels.forEach((parametric) => {
        parametric.nodes.forEach((n) => {
          if (!this.shouldDrawNode(n, CADSystem)) return;
          this.drawWireNode(n, CADSystem);
        });
      });
    }

    // Huella de columnas en planta: se dibuja ENCIMA de los nodos para que el
    // nodo no la tape al alejar el zoom (rectángulo b×h orientado por rotación).
    this.drawColumnFootprints?.(CADSystem);

    // Diafragmas asignados (araña punteada al CM + etiqueta, estilo ETABS).
    this.drawPlanDiaphragms?.(CADSystem);

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

  drawFrameForceDiagrams(CADSystem) {
    drawFrameForceDiagrams2D({
      CADSystem,
      renderer: this,
      ctx: CADSystem.ctx,
    });
  }

  drawFrameLocalAxes(CADSystem) {
    drawFrameLocalAxes2D({
      CADSystem,
      renderer: this,
      ctx: CADSystem.ctx,
    });
  }

  drawFrameSectionProperties(CADSystem) {
    drawFrameSectionProperties2D({
      CADSystem,
      renderer: this,
      ctx: CADSystem.ctx,
    });
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
      Object.assign(context.ctx, s.style.axialStyle.MODEL);
      context.ctx.translate(mid.x, mid.y);
      context.ctx.rotate(s.angle);
      // context.ctx.fillText(s.fAxial.toFixed(3), 0, 30);
      context.ctx.fillText(this.formatValue(context, s.fAxial, "forces", 3), 0, 30);

      // context.ctx.fillStyle = "#16a34a";
      // context.ctx.font = "11px Arial";
      // context.ctx.textAlign = "center";
      // context.ctx.textBaseline = "middle";

      // context.ctx.fillText(
      //   this.formatValue
      //     ? this.formatValue(context, s.fAxial ?? 0, "forces", 3)
      //     : Number(s.fAxial ?? 0).toFixed(1),
      //   mid.x,
      //   mid.y - 14
      // );

      context.ctx.restore();
    });
  }

  clearBackground(context) {
    const bgColor = this.getDisplayColor(context, "background2d", context.canvas2dBackground || "#36454F");

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

    // Radio del nodo escalado con el zoom (grid.scaleX = px/m): al alejar se
    // reduce para no tapar la huella de la columna; se limita a un máximo al
    // acercar. ~0.07 m de radio físico.
    const scale = Number(context.grid?.scaleX) || 50;
    const maxR = node.selected ? 6 : 4;
    const r = Math.max(1.5, Math.min(maxR, 0.07 * scale));

    ctx.beginPath();
    ctx.arc(p.x, p.y, r, 0, Math.PI * 2);
    ctx.fillStyle = node.selected
      ? (context.displayColors?.selected || "#facc15")
      : (context.displayColors?.node || "#afa59c");
    ctx.fill();

    ctx.strokeStyle = "#111827";
    ctx.lineWidth = 1;
    ctx.stroke();

    // if (context.options?.showIDs) {
    //   ctx.fillStyle = context.displayColors?.text || "#ffffff";
    //   ctx.font = "10px Arial";
    //   ctx.fillText(node.id, p.x + 7, p.y - 7);
    // }

    ctx.restore();

    // Soporte: lo dibuja drawSupport() con los SVG del proyecto (soporte1/2/3);
    // el badge paralelo (caja roja F, etc.) se eliminó para no superponer diseños.

    // Símbolo visual de diafragma
    if (this.jointHasDiaphragm(node)) {
      this.drawJointDiaphragmSymbol(node, context, p);
    }

    // Símbolo visual de Point Springs
    if (this.jointHasPointSprings(node)) {
      this.drawJointPointSpringSymbol(node, context, p);
    }

    if (context.displayOptions?.showJointLoads) {
      if (
        this.shouldDrawJointLoadDisplayType(context, "force") &&
        this.jointHasForceLoads(node, context)
      ) {
        this.drawJointPointForceSymbol(node, context, p);
      }

      if (
        this.shouldDrawJointLoadDisplayType(context, "ground-displacement") &&
        this.jointHasGroundDisplacementLoads(node, context)
      ) {
        this.drawJointGroundDisplacementSymbol(node, context, p);
      }

      if (
        this.shouldDrawJointLoadDisplayType(context, "temperature") &&
        this.jointHasTemperatureLoads(node, context)
      ) {
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

  // =====================================================
  // DISPLAY 2D > DIBUJAR ID DE NODO
  // Dibuja el número del nodo en el canvas 2D.
  // Versión segura para nodos creados desde 2D o desde 3D.
  // =====================================================
  drawNodeID(node, context, screenPoint = null) {
    if (!node || !context?.ctx) return;

    const ctx = context.ctx;

    // =====================================================
    // DISPLAY 2D > OBTENER POSICIÓN DEL NODO
    // Evita error cuando nodeScreenPositions no existe.
    // =====================================================
    let point = screenPoint;

    if (!point) {
      point =
        this.nodeScreenPositions?.get?.(node.id) ||
        context.nodeScreenPositions?.get?.(node.id) ||
        context.nodeScreenPositionMap?.get?.(node.id) ||
        null;
    }

    // Si no hay mapa previo, proyectamos el nodo directamente.
    if (!point && typeof this.projectPoint === "function") {
      point = this.projectPoint(node, context);
    }

    if (
      !point ||
      !Number.isFinite(Number(point.x)) ||
      !Number.isFinite(Number(point.y))
    ) {
      return;
    }

    const label = String(node.id ?? "");

    if (!label) return;

    const displayColor = context
      ? this.getDisplayColor?.(context, "text", "#ffffff") || "#ffffff"
      : "#ffffff";

    ctx.save();

    ctx.font = "11px Arial";
    ctx.textAlign = "left";
    ctx.textBaseline = "middle";
    ctx.fillStyle = displayColor;

    // Pequeño desplazamiento para que el ID no tape el nodo.
    ctx.fillText(label, Number(point.x) + 8, Number(point.y) - 8);

    ctx.restore();
  }

  // Clave del ícono de soporte para el nodo. Prioriza `node.soporte` (legacy /
  // import) y si no existe INFIERE de los restraints (los asignados con el
  // modal Assign ▸ Joint ▸ Restraints solo setean restraints/constraints):
  // todo restringido → empotrado; traslaciones → articulado; solo UZ → rodillo;
  // cualquier otra combinación con algo restringido → articulado genérico.
  getSupportKey(node) {
    if (node.soporte) return node.soporte;

    const r = node.restraints || node.constraints || node.assignment?.restraints;
    if (!r) return null;

    const t = (r.ux ? 1 : 0) + (r.uy ? 1 : 0) + (r.uz ? 1 : 0);
    const rot = (r.rx ? 1 : 0) + (r.ry ? 1 : 0) + (r.rz ? 1 : 0);

    if (!t && !rot) return null;
    if (t === 3 && rot === 3) return "soporteUno";
    if (t === 3) return "soporteDos";
    if (r.uz && t === 1 && !rot) return "soporteTres";
    return "soporteDos";
  }

  // Fondo del plano DXF importado (mixins/grids/plan-import.js): solo en la
  // vista de planta BASE (storyId 0) — en pisos superiores ya no aplica, ahí
  // se usa la grilla de referencia derivada. Se dibuja ANTES que la geometría
  // del modelo para que quede debajo; opacidad configurable desde el modal.
  drawImportedPlanBackground(context) {
    const plan = context.importedPlan;
    if (!plan || !plan.visible || !plan.segments?.length) return;
    if (typeof context.isBasePlanViewActive === "function" && !context.isBasePlanViewActive()) return;

    const ctx = context.ctx;
    const grid = context.grid;
    // Un DWG/DXF real (tras expandir bloques + teselar arcos) puede tener
    // miles de segmentos. Antes se hacía un beginPath+stroke() POR SEGMENTO,
    // en cada frame (60/seg) — eso congelaba el navegador con planos grandes.
    // Ahora: 1 solo path + 1 solo stroke() para TODO el plano, y se descartan
    // (sin transformar) los segmentos fuera del área visible.
    const bounds = typeof grid.getVisibleWorldBounds === "function" ? grid.getVisibleWorldBounds() : null;

    ctx.save();
    ctx.globalAlpha = Number(plan.opacity ?? 0.5);
    ctx.strokeStyle = "#94a3b8";
    ctx.lineWidth = 1;
    ctx.beginPath();

    plan.segments.forEach((s) => {
      if (bounds) {
        const segMinX = Math.min(s.x1, s.x2), segMaxX = Math.max(s.x1, s.x2);
        const segMinY = Math.min(s.y1, s.y2), segMaxY = Math.max(s.y1, s.y2);
        if (segMaxX < bounds.minX || segMinX > bounds.maxX) return;
        if (segMaxY < bounds.minY || segMinY > bounds.maxY) return;
      }
      const p1 = grid.worldToScreen({ x: s.x1, y: s.y1 });
      const p2 = grid.worldToScreen({ x: s.x2, y: s.y2 });
      ctx.moveTo(p1.x, p1.y);
      ctx.lineTo(p2.x, p2.y);
    });

    ctx.stroke();
    ctx.restore();
  }

  // Indicador de ejes X/Y SIEMPRE visible en planta (independiente de si hay
  // grilla de referencia dibujada) — para que el usuario nunca pierda la
  // orientación del origen mientras arma su grilla a mano sobre un plano
  // importado. Tamaño fijo en pantalla (no en mundo) para que no crezca/
  // encoja con el zoom. Colores alineados con el gizmo del visor 3D
  // (grid3d.js: X rojo, Y verde, Z celeste).
  drawAxisIndicator(context) {
    if (context.currentViewMode && context.currentViewMode !== "plan") return;
    const ctx = context.ctx;
    const origin = context.grid.worldToScreen({ x: 0, y: 0 });
    const len = 34;

    ctx.save();
    ctx.lineWidth = 2;
    ctx.font = "bold 11px Arial";

    // Eje X (rojo)
    ctx.strokeStyle = "#ef4444";
    ctx.fillStyle = "#ef4444";
    ctx.beginPath();
    ctx.moveTo(origin.x, origin.y);
    ctx.lineTo(origin.x + len, origin.y);
    ctx.stroke();
    ctx.fillText("X", origin.x + len + 4, origin.y + 4);

    // Eje Y (verde) — screen Y crece hacia abajo, mundo Y crece hacia arriba
    ctx.strokeStyle = "#22c55e";
    ctx.fillStyle = "#22c55e";
    ctx.beginPath();
    ctx.moveTo(origin.x, origin.y);
    ctx.lineTo(origin.x, origin.y - len);
    ctx.stroke();
    ctx.fillText("Y", origin.x - 4, origin.y - len - 6);

    // Eje Z (celeste) — sale de la pantalla en planta: solo un punto marcado
    ctx.fillStyle = "#38bdf8";
    ctx.beginPath();
    ctx.arc(origin.x, origin.y, 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "#0b1220";
    ctx.lineWidth = 1;
    ctx.stroke();
    ctx.fillText("Z", origin.x + 8, origin.y - 8);

    ctx.restore();
  }

  // Línea "fantasma" que sigue al mouse mientras la herramienta de dibujo de
  // ejes (GridAxisDrawingState) está activa — da feedback visual de dónde
  // quedaría el eje ANTES de hacer clic, sin necesidad de una interacción de
  // arrastre real (más simple/liviano, mismo resultado práctico).
  drawGridAxisPreview(context) {
    const state = context.currentState;
    const isX = state && state === context.gridAxisXDrawingState;
    const isY = state && state === context.gridAxisYDrawingState;
    if (!isX && !isY) return;

    const mouseScreen = context.lastMouseScreen;
    if (!mouseScreen) return;

    const grid = context.grid;
    const snap = context.activeGridPoint;
    const mouseWorld = snap || grid.screenToWorld(mouseScreen);

    const ctx = context.ctx;
    ctx.save();
    ctx.setLineDash([6, 4]);
    ctx.strokeStyle = isX ? "#ef4444" : "#22c55e";
    ctx.lineWidth = 1.5;
    ctx.globalAlpha = 0.85;
    ctx.beginPath();

    if (isX) {
      const sx = grid.worldToScreen({ x: mouseWorld.x, y: 0 }).x;
      ctx.moveTo(sx, 0);
      ctx.lineTo(sx, context.canvas.height);
    } else {
      const sy = grid.worldToScreen({ x: 0, y: mouseWorld.y }).y;
      ctx.moveTo(0, sy);
      ctx.lineTo(context.canvas.width, sy);
    }

    ctx.stroke();
    ctx.setLineDash([]);
    ctx.restore();
  }

  drawSupport(node, context) {
    const p = this.projectPoint(node, context);
    const key = this.getSupportKey(node);
    if (!key || !soportes[key]) return;

    // Antes se dibujaba SIEMPRE a 30px nativos, sin importar el zoom — en un
    // modelo chico (un cuarto de unos pocos metros) hay que acercar mucho la
    // vista para verlo bien, y ese ícono de tamaño fijo terminaba viéndose
    // gigante/tipo "maqueta" en proporción a la estructura. Ahora escala con
    // el zoom igual que drawNode (tamaño físico ~0.5m × px/m), acotado para
    // que nunca desaparezca ni se vuelva absurdo.
    const px = Math.max(14, Math.min(40, 0.5 * (Number(context.grid?.scaleX) || 50)));
    const half = px / 2;

    if (key !== "soporteTres") {
      context.ctx.drawImage(soportes[key], p.x - half, p.y, px, px);
    } else {
      context.ctx.drawImage(soportes[key], p.x - (px * 2 / 3), p.y - px / 3, px, px);
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
    context.ctx.fillText(`${this.formatValue(context, mag, "forces", 2)}kN`, end.x, end.y);
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

  // agregamos la funcion auxiliar
  // Esta función dibuja una flecha vertical desde el punto p, con la magnitud y dirección indicadas.
  // Es similar a drawVerticalLine pero sin asumir que se trata de Fy

  drawVerticalForce(context, mag, text, p, color) {
    context.ctx.save();
    context.ctx.strokeStyle = color;
    context.ctx.fillStyle = color;
    let angle;
    if (Math.sign(mag) === -1) {
      context.ctx.textBaseline = "bottom";
      angle = Math.PI / 2;
    } else {
      context.ctx.textBaseline = "top";
      angle = (3 * Math.PI) / 2;
    }
    context.ctx.textAlign = "center";
    context.ctx.beginPath();
    context.ctx.moveTo(p.x, p.y);
    const endY = p.y + 50 * Math.sign(mag);
    context.ctx.lineTo(p.x, endY);
    context.ctx.stroke();
    context.ctx.fillText(text, p.x, endY);
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

  drawForce(node, context) {
    // Asegurar que el nodo es visible en la vista actual
    if (!this.shouldDrawNode(node, context)) return;
    const p = this.projectPoint(node, context);
    const colors = {
      CM: "brown",
      CV: "orange",
      CVVM: "white",
      CVVP: "black",
      CN: "whitesmoke",
      CLL: "lightblue",
    };
    const currentLoad = context.options.currentLoad;
    const load = node.force.loads[currentLoad];
    if (!load) return;

    const fx = load.x || 0;
    const fy = load.y || 0;
    const fz = load.z || 0;

    const view = context.viewSet?.[context.activeViewIndex];

    // Vista planta: dibujar Fx y Fy como antes, y opcionalmente un marcador para Fz
    if (!view || view.type === "plan") {
      if (fx !== 0) {
        this.drawHorizontalLine(context, fx, `${this.formatValue(context, fx, "forces", 2)}kN`, p, colors[currentLoad]);
      }
      if (fy !== 0) {
        this.drawVerticalLine(context, fy, `${this.formatValue(context, fy, "forces", 2)}kN`, p, colors[currentLoad]);
      }
      if (fz !== 0) {
        // En planta, la fuerza vertical no se ve como flecha; dibujamos un pequeño círculo con "Z"
        context.ctx.save();
        context.ctx.fillStyle = colors[currentLoad];
        context.ctx.beginPath();
        context.ctx.arc(p.x, p.y + 15, 8, 0, 2 * Math.PI);
        context.ctx.fill();
        context.ctx.fillStyle = "white";
        context.ctx.font = "10px Arial";
        context.ctx.textAlign = "center";
        context.ctx.textBaseline = "middle";
        context.ctx.fillText("Z", p.x, p.y + 15);
        // Mostrar magnitud al lado
        context.ctx.fillStyle = colors[currentLoad];
        context.ctx.font = "10px Arial";
        context.ctx.fillText(`${this.formatValue(context, fz, "forces", 2)}kN`, p.x + 12, p.y + 15);
        context.ctx.restore();
      }
    }
    // Vista elevación X (LETRAS) → plano Y-Z: Fy horizontal, Fz vertical
    else if (view.type === "elevation" && view.axis === "X") {
      if (fy !== 0) {
        this.drawHorizontalLine(context, fy, `${this.formatValue(context, fy, "forces", 2)}kN`, p, colors[currentLoad]);
      }
      if (fz !== 0) {
        this.drawVerticalForce(context, fz, `${this.formatValue(context, fz, "forces", 2)}kN`, p, colors[currentLoad]);
      }
      // fx no se dibuja (sale del plano)
    }
    // Vista elevación Y (NÚMEROS) → plano X-Z: Fx horizontal, Fz vertical
    else if (view.type === "elevation" && view.axis === "Y") {
      if (fx !== 0) {
        this.drawHorizontalLine(context, fx, `${this.formatValue(context, fx, "forces", 2)}kN`, p, colors[currentLoad]);
      }
      if (fz !== 0) {
        this.drawVerticalForce(context, fz, `${this.formatValue(context, fz, "forces", 2)}kN`, p, colors[currentLoad]);
      }
      // fy no se dibuja
    }
  }

  // =====================================================
  // DISPLAY 2D > DIBUJAR REACCIONES EN NODO
  // Versión segura para nodos creados desde 2D o desde 3D.
  // Evita romper si reaction/style/getModel no existen.
  // =====================================================
  drawReaction(node, context) {
    //context.ctx.textAlign = "right";
    // const p = context.grid.worldToScreen(node.position);

    if (!context?.ctx) return;
    // Verificar que el nodo tenga style y getModel
    if (!node.style || typeof node.style.getModel !== 'function') return;
    const p = this.projectPoint(node, context);
    const magX = node.reaction.x;
    const magY = node.reaction.y;

    const mag = pointDistance({ x: 0, y: 0 }, { x: magX, y: magY });
    const uMag = { x: magX / mag, y: magY / mag };
    const end = { x: p.x - uMag.x * 5 * mag, y: p.y + uMag.y * 5 * mag };
    Object.assign(context.ctx, node.style.getModel().FORCE);
    if (magX && Math.abs(magX) > 0.0000000001) {
      // this.drawHorizontalLine(context, magX, `${magX.toFixed(2)}kN`, p, "aquamarine");
      this.drawHorizontalLine(context, magX, `${this.formatValue(context, magX, "reactions", 2)}kN`, p, "aquamarine");
    }
    if (magY && Math.abs(magY) > 0.0000000001) {
      // this.drawVerticalLine(context, magY, `${magY.toFixed(2)}kN`, p, "aquamarine");
      this.drawVerticalLine(context, magY, `${this.formatValue(context, magY, "reactions", 2)}kN`, p, "aquamarine");
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

  // =====================================================
  // DISPLAY 2D > RECTÁNGULO DE COLUMNA EN PLANTA (tipo ETABS)
  // Dibuja la huella (b×h) de cada columna en los nodos donde está,
  // orientada según su rotación de eje local (localAxisAngle).
  // =====================================================
  // Dibuja los diafragmas ASIGNADOS del piso activo, estilo ETABS: líneas
  // punteadas desde el centro del diafragma a cada nudo miembro, punto rojo
  // en el centro y etiqueta con el nombre (D1...). Solo asignaciones explícitas
  // (joint directo o losa con diafragma) — el agrupado automático del análisis
  // no se dibuja, igual que ETABS no dibuja nada si no asignaste.
  // El centro es el centroide geométrico de los nudos miembros (aproximación
  // visual del CM; el CM real con masas lo calcula el motor).
  drawPlanDiaphragms(CADSystem) {
    const view = CADSystem.viewSet?.[CADSystem.activeViewIndex];
    if (view && view.type !== "plan") return;
    if (typeof CADSystem.getExplicitDiaphragmGroups !== "function") return;

    const groups = CADSystem.getExplicitDiaphragmGroups(CADSystem.nodes || []);
    if (!groups.length) return;

    const planZ = view ? Number(view.elevation ?? view.z ?? 0) : 0;
    const nodesById = new Map(
      (CADSystem.nodes || []).map((n) => [Number(n.id), n]),
    );
    const ctx = CADSystem.ctx;

    groups.forEach((group) => {
      if (Math.abs((group.z || 0) - planZ) > 0.05) return;

      const pts = group.nodeIds
        .map((id) => nodesById.get(Number(id)))
        .filter(Boolean)
        .map((n) => ({
          x: Number(n.position?.x ?? n.x) || 0,
          y: Number(n.position?.y ?? n.y) || 0,
        }));
      if (pts.length < 2) return;

      // Centro: CM REAL con masas del último análisis (como ETABS tras correr);
      // si no hay resultados frescos, centroide geométrico provisional.
      const realCM = CADSystem.getDiaphragmCMForDraw?.(group.name, group.z);
      const cx = realCM?.x ?? pts.reduce((s, p) => s + p.x, 0) / pts.length;
      const cy = realCM?.y ?? pts.reduce((s, p) => s + p.y, 0) / pts.length;
      const center = CADSystem.grid.worldToScreen({ x: cx, y: cy });

      ctx.save();

      // Araña punteada centro → nudos.
      ctx.setLineDash([4, 4]);
      ctx.strokeStyle = "rgba(148, 163, 184, 0.85)";
      ctx.lineWidth = 1;
      pts.forEach((p) => {
        const s = CADSystem.grid.worldToScreen(p);
        ctx.beginPath();
        ctx.moveTo(center.x, center.y);
        ctx.lineTo(s.x, s.y);
        ctx.stroke();
      });

      // Punto central (CM) rojo con anillo.
      ctx.setLineDash([]);
      ctx.beginPath();
      ctx.arc(center.x, center.y, 6, 0, Math.PI * 2);
      ctx.fillStyle = "#ef4444";
      ctx.fill();
      ctx.lineWidth = 2;
      ctx.strokeStyle = "#7f1d1d";
      ctx.stroke();

      // Etiqueta con el nombre del diafragma.
      ctx.font = "bold 11px monospace";
      ctx.fillStyle = "#fca5a5";
      ctx.textAlign = "left";
      ctx.textBaseline = "bottom";
      ctx.fillText(group.name || group.id, center.x + 9, center.y - 6);

      ctx.restore();
    });
  }

  drawColumnFootprints(CADSystem) {
    const view = CADSystem.viewSet?.[CADSystem.activeViewIndex];

    // Solo tiene sentido en vista de planta (o sin vista definida → planta).
    if (view && view.type !== "plan") return;

    const EPS = 1e-3;
    const planZ = view ? Number(view.elevation ?? view.z ?? 0) : null;

    (CADSystem.shapes || []).forEach((beam) => {
      const a = beam?.node1?.position;
      const b = beam?.node2?.position;
      if (!a || !b) return;

      const dz = Math.abs((a.z || 0) - (b.z || 0));
      const dxy = Math.hypot((a.x || 0) - (b.x || 0), (a.y || 0) - (b.y || 0));

      // Columna = vertical (misma X,Y, distinta Z).
      if (!(dz > EPS && dxy < EPS)) return;

      // Se muestra en el plano cuyo Z cae dentro del tramo de la columna.
      if (planZ != null) {
        const zt = Math.max(a.z || 0, b.z || 0);
        const zb = Math.min(a.z || 0, b.z || 0);
        if (!(planZ >= zb - EPS && planZ <= zt + EPS)) return;
      }

      this.drawColumnPlanFootprint(beam, CADSystem);
    });
  }

  // Dimensiones de la huella de columna en METROS (b = ancho, h = peralte).
  // Las secciones guardan b/h (o width/height) de forma inconsistente: unas en
  // metros (0.25, defaults) y otras en cm (25, del diálogo) o mm (perfiles I).
  // Se normaliza por magnitud + tipo: ≤3 → ya en m; si no, perfil metálico → mm,
  // rectangular → cm.
  getColumnPlanDims(beam) {
    const sec = beam.frameSection || beam.section || {};
    const shape = String(sec.shape || sec.type || "").toLowerCase();
    const metallic = ["i", "wf", "w", "channel", "c", "tube", "hss", "angle", "l"].includes(shape);

    const toMeters = (v) => {
      v = Number(v);
      if (!(v > 0)) return 0;
      if (v <= 3) return v;                 // ya en metros
      return metallic ? v / 1000 : v / 100; // perfil: mm ; rectangular: cm
    };

    const b = toMeters(sec.b ?? sec.width ?? sec.base);
    const h = toMeters(sec.h ?? sec.height ?? sec.peralte);

    if (!(b > 0) || !(h > 0)) {
      // Sin dimensiones → marcador cuadrado por defecto.
      return { b: 0.3, h: 0.3, fallback: true };
    }

    return { b, h, fallback: false };
  }

  drawColumnPlanFootprint(beam, context) {
    const center = beam.node1?.position || beam.node2?.position;
    if (!center) return;

    const { b, h, fallback } = this.getColumnPlanDims(beam);

    const cx = center.x || 0;
    const cy = center.y || 0;

    // Rotación de eje local (grados, + antihorario).
    const t = (Number(beam.localAxisAngle || 0) * Math.PI) / 180;
    const cos = Math.cos(t);
    const sin = Math.sin(t);

    // Coherencia con el motor: a θ=0 (vecxz=[0,1,0]) el eje local y = +X y el
    // peralte (h, eje fuerte Iz) queda a lo largo de X. Por eso h va en el eje
    // pre-rotación X y b en Y; al girar por θ el rectángulo sigue al vecxz
    // [-sinθ, cosθ, 0] (peralte en dirección (cosθ, sinθ)).
    const halfPeralte = h / 2; // h → X a 0° (coincide con Iz del motor)
    const halfWidth = b / 2;   // b → Y a 0°

    // Esquinas en modelo (rotadas) → pantalla, así respeta zoom/pan.
    const localCorners = [
      [-halfPeralte, -halfWidth],
      [halfPeralte, -halfWidth],
      [halfPeralte, halfWidth],
      [-halfPeralte, halfWidth],
    ];

    const screen = localCorners.map(([lx, ly]) => {
      const mx = cx + (lx * cos - ly * sin);
      const my = cy + (lx * sin + ly * cos);
      return context.grid.worldToScreen({ x: mx, y: my });
    });

    const style = this.getElementRenderStyle(beam, "model", context);
    const stroke = style?.strokeStyle || "#2563eb";
    const selected = beam.selected === true || beam.isSelected === true;

    const ctx = context.ctx;
    ctx.save();

    ctx.beginPath();
    ctx.moveTo(screen[0].x, screen[0].y);
    for (let i = 1; i < screen.length; i++) {
      ctx.lineTo(screen[i].x, screen[i].y);
    }
    ctx.closePath();

    ctx.fillStyle = selected
      ? "rgba(249, 158, 26, 0.75)"
      : (fallback ? "rgba(37, 99, 235, 0.20)" : "rgba(37, 99, 235, 0.65)");
    ctx.fill();

    ctx.strokeStyle = selected ? "#f59e0b" : (fallback ? stroke : "#1d4ed8");
    ctx.lineWidth = 1.5;
    ctx.setLineDash(fallback ? [3, 3] : []);
    ctx.stroke();
    ctx.setLineDash([]);

    ctx.restore();
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

    const pts = area.points.map((p) =>
      this.projectPoint({ position: p }, context)
    );

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

    if (pts.length >= 3) {
      ctx.closePath();

      const projectedArea = this.getProjectedPolygonArea(pts);

      // Si el área se proyecta como línea, por ejemplo un muro visto en planta,
      // no intentamos rellenar porque visualmente se aplasta.
      if (projectedArea > 0.5) {
        ctx.fill();
      }
    }

    ctx.stroke();
    ctx.setLineDash([]);

    // Vértices
    pts.forEach((p) => {
      ctx.beginPath();
      ctx.fillStyle = style.strokeStyle;
      ctx.arc(p.x, p.y, 3, 0, Math.PI * 2);
      ctx.fill();
    });

    // Etiqueta del área: si tiene sección asignada, muestra su NOMBRE
    // (p.ej. "Aligerado e=0.20"); si no, cae al tipo de área ("slab").
    if (!isPreview && pts.length >= 3) {
      const center = this.getProjectedPolygonCenter(pts);
      const label =
        area.slabSection ||
        area.section?.name ||
        area.areaType ||
        area.type ||
        "area";

      ctx.font = "10px Arial";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";

      const textWidth = ctx.measureText(label).width;

      ctx.fillStyle = "rgba(0, 0, 0, 0.55)";
      ctx.fillRect(center.x - textWidth / 2 - 4, center.y - 8, textWidth + 8, 16);

      ctx.fillStyle = "#ffffff";
      ctx.fillText(label, center.x, center.y);
    }

    ctx.restore();
  }

  getProjectedPolygonArea(points = []) {
    if (!Array.isArray(points) || points.length < 3) return 0;

    let area = 0;

    for (let i = 0; i < points.length; i++) {
      const p1 = points[i];
      const p2 = points[(i + 1) % points.length];

      area += Number(p1.x || 0) * Number(p2.y || 0);
      area -= Number(p2.x || 0) * Number(p1.y || 0);
    }

    return Math.abs(area / 2);
  }

  getProjectedPolygonCenter(points = []) {
    if (!Array.isArray(points) || !points.length) {
      return { x: 0, y: 0 };
    }

    const sum = points.reduce(
      (acc, p) => {
        acc.x += Number(p.x || 0);
        acc.y += Number(p.y || 0);
        return acc;
      },
      { x: 0, y: 0 }
    );

    return {
      x: sum.x / points.length,
      y: sum.y / points.length,
    };
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
      const pts = state.selectedArea.points.map((p) => this.projectPoint({ position: p }, context));

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

  // =====================================================
  // EDIT > REFERENCE PLANES
  // =====================================================

  getReferencePlaneBounds(context) {
    const ref = context.referenceGrid || {};

    const xs = Array.isArray(ref.xPositions) && ref.xPositions.length
      ? ref.xPositions.map(Number)
      : [0, 10];

    const ys = Array.isArray(ref.yPositions) && ref.yPositions.length
      ? ref.yPositions.map(Number)
      : [0, 10];

    const storyCount = Number(ref.storyCount ?? 3);
    const storyHeight = Number(ref.storyHeight ?? 3);
    const maxZ = Math.max(storyCount * storyHeight, storyHeight || 3);

    return {
      minX: Math.min(...xs),
      maxX: Math.max(...xs),
      minY: Math.min(...ys),
      maxY: Math.max(...ys),
      minZ: 0,
      maxZ,
    };
  }

  getReferencePlaneShape(plane, context) {
    if (!plane || plane.visible === false) return null;

    const view = context.viewSet?.[context.activeViewIndex];
    const bounds = this.getReferencePlaneBounds(context);
    const tol = context.getActiveViewTolerance?.() ?? 0.001;

    const type = plane.planeType || "XY";
    const c = Number(plane.coordinate || 0);

    if (!view || view.type === "plan") {
      const activeZ = Number(
        view?.elevation ??
        view?.z ??
        context.getActivePlanElevation?.() ??
        0
      );

      if (type === "XY") {
        if (Math.abs(activeZ - c) > tol) return null;

        return {
          kind: "polygon",
          points: [
            { x: bounds.minX, y: bounds.minY, z: c },
            { x: bounds.maxX, y: bounds.minY, z: c },
            { x: bounds.maxX, y: bounds.maxY, z: c },
            { x: bounds.minX, y: bounds.maxY, z: c },
          ],
        };
      }

      if (type === "YZ") {
        return {
          kind: "line",
          points: [
            { x: c, y: bounds.minY, z: activeZ },
            { x: c, y: bounds.maxY, z: activeZ },
          ],
        };
      }

      if (type === "XZ") {
        return {
          kind: "line",
          points: [
            { x: bounds.minX, y: c, z: activeZ },
            { x: bounds.maxX, y: c, z: activeZ },
          ],
        };
      }
    }

    if (view.type === "elevation") {
      const viewValue = Number(view.value || 0);

      // Elevación por letras: X fijo, se mira Y-Z
      if (view.axis === "X") {
        if (type === "YZ") {
          if (Math.abs(viewValue - c) > tol) return null;

          return {
            kind: "polygon",
            points: [
              { x: c, y: bounds.minY, z: bounds.minZ },
              { x: c, y: bounds.maxY, z: bounds.minZ },
              { x: c, y: bounds.maxY, z: bounds.maxZ },
              { x: c, y: bounds.minY, z: bounds.maxZ },
            ],
          };
        }

        if (type === "XY") {
          return {
            kind: "line",
            points: [
              { x: viewValue, y: bounds.minY, z: c },
              { x: viewValue, y: bounds.maxY, z: c },
            ],
          };
        }

        if (type === "XZ") {
          return {
            kind: "line",
            points: [
              { x: viewValue, y: c, z: bounds.minZ },
              { x: viewValue, y: c, z: bounds.maxZ },
            ],
          };
        }
      }

      // Elevación por números: Y fijo, se mira X-Z
      if (view.axis === "Y") {
        if (type === "XZ") {
          if (Math.abs(viewValue - c) > tol) return null;

          return {
            kind: "polygon",
            points: [
              { x: bounds.minX, y: c, z: bounds.minZ },
              { x: bounds.maxX, y: c, z: bounds.minZ },
              { x: bounds.maxX, y: c, z: bounds.maxZ },
              { x: bounds.minX, y: c, z: bounds.maxZ },
            ],
          };
        }

        if (type === "XY") {
          return {
            kind: "line",
            points: [
              { x: bounds.minX, y: viewValue, z: c },
              { x: bounds.maxX, y: viewValue, z: c },
            ],
          };
        }

        if (type === "YZ") {
          return {
            kind: "line",
            points: [
              { x: c, y: viewValue, z: bounds.minZ },
              { x: c, y: viewValue, z: bounds.maxZ },
            ],
          };
        }
      }
    }

    return null;
  }

  drawReferencePlane(plane, context) {
    if (context.displayOptions?.showReferencePlanes === false) return;

    const shape = this.getReferencePlaneShape(plane, context);

    if (!shape || !shape.points?.length) return;

    const ctx = context.ctx;
    const pts = shape.points.map((p) =>
      this.projectPoint({ position: p }, context)
    );

    const isPolygon = shape.kind === "polygon";

    ctx.save();

    // Estilo más sutil tipo guía auxiliar ETABS
    ctx.strokeStyle = "rgba(251, 191, 36, 0.95)";
    ctx.fillStyle = "rgba(251, 191, 36, 0.055)";
    ctx.lineWidth = 1;
    ctx.setLineDash([7, 5]);

    ctx.beginPath();
    ctx.moveTo(pts[0].x, pts[0].y);

    for (let i = 1; i < pts.length; i++) {
      ctx.lineTo(pts[i].x, pts[i].y);
    }

    if (isPolygon) {
      ctx.closePath();

      if (plane.showFill === true) {
        ctx.fill();
      }
    }

    ctx.stroke();
    ctx.setLineDash([]);

    // Etiqueta compacta
    const labelPoint = pts[0];
    const coordinate = this.formatValue
      ? this.formatValue(context, plane.coordinate || 0, "coordinates", 2)
      : Number(plane.coordinate || 0).toFixed(2);

    const label = `${plane.id || "RP"}  ${plane.planeType || ""}=${coordinate}`;

    ctx.font = "10px 'Segoe UI', Arial";
    ctx.textAlign = "left";
    ctx.textBaseline = "middle";

    const textWidth = ctx.measureText(label).width;
    const labelX = labelPoint.x + 8;
    const labelY = labelPoint.y - 12;

    ctx.fillStyle = "rgba(30, 41, 59, 0.88)";
    ctx.fillRect(labelX - 4, labelY - 8, textWidth + 8, 16);

    ctx.strokeStyle = "rgba(251, 191, 36, 0.8)";
    ctx.lineWidth = 1;
    ctx.strokeRect(labelX - 4, labelY - 8, textWidth + 8, 16);

    ctx.fillStyle = "#fde68a";
    ctx.fillText(label, labelX, labelY);

    ctx.restore();
  }

  drawReferencePlanes(context) {
    if (context.displayOptions?.showReferencePlanes === false) return;
    if (!Array.isArray(context.referencePlanes)) return;

    context.referencePlanes.forEach((plane) => {
      this.drawReferencePlane(plane, context);
    });
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
      if (!this.shouldDrawReferencePoint(point, context)) return;
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

    const strokeColor = isPreview ? "#fbbf24" : dim.selected ? "#ef4444" : "#38bdf8";

    const fillColor = isPreview ? "#fbbf24" : dim.selected ? "#f87171" : "#7dd3fc";

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
      if (!this.shouldDrawDimensionLine(dim, context)) return;
      this.drawDimensionLine(dim, context, false);
    });
  }

  shouldDrawDimensionLine(dim, CADSystem) {
    if (!dim || dim.visible === false) return false;
    if (!dim.start || !dim.end) return false;

    const view = CADSystem.viewSet?.[CADSystem.activeViewIndex];
    if (!view) return true;

    const tol = CADSystem.getActiveViewTolerance?.() ?? 0.001;

    const points = [dim.start, dim.end];

    if (view.type === "plan") {
      const activeZ = Number(
        view.elevation ??
        view.z ??
        CADSystem.getActivePlanElevation?.() ??
        0
      );

      return points.every((p) => {
        return Math.abs(Number(p.z ?? 0) - activeZ) <= tol;
      });
    }

    if (view.type === "elevation") {
      const value = Number(view.value ?? 0);

      if (view.axis === "X") {
        return points.every((p) => {
          return Math.abs(Number(p.x ?? 0) - value) <= tol;
        });
      }

      if (view.axis === "Y") {
        return points.every((p) => {
          return Math.abs(Number(p.y ?? 0) - value) <= tol;
        });
      }
    }

    return true;
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

        return `${this.formatValue(context, d, "lengths", 2)} m`;
      })(),
      visible: true,
    };

    if (!this.shouldDrawDimensionLine(preview, context)) return;

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

    const rawLoads = [
      ...(Array.isArray(node.pointLoads) ? node.pointLoads : []),
      ...(Array.isArray(node.jointLoads) ? node.jointLoads : []),
      ...(Array.isArray(node.assignment?.pointLoads) ? node.assignment.pointLoads : []),
      ...(Array.isArray(node.assignment?.jointLoads) ? node.assignment.jointLoads : []),
    ];

    const seen = new Set();
    const result = [];

    rawLoads.forEach((load) => {
      if (!load || typeof load !== "object") return;

      const key =
        load.id ||
        [
          load.type,
          load.loadPattern || load.loadCase,
          JSON.stringify(load.forces || {}),
          JSON.stringify(load.displacements || {}),
          JSON.stringify(load.temperature || {}),
        ].join("|");

      if (seen.has(key)) return;

      seen.add(key);
      result.push(load);
    });

    return result;
  }

  getActiveJointLoadPattern(context) {
    return String(
      context.displayOptions?.jointLoadPattern ||
      context.displayOptions?.jointPointLoadPattern ||
      context.options?.currentLoad ||
      "CM"
    ).trim();
  }

  getActiveJointLoadDisplayType(context) {
    return String(
      context.displayOptions?.jointLoadDisplayType ||
      context.displayOptions?.jointLoadType ||
      "force"
    ).trim();
  }

  shouldDrawJointLoadDisplayType(context, type) {
    const activeType = this.getActiveJointLoadDisplayType(context);

    return activeType === "all" || activeType === type;
  }

  jointLoadMatchesPattern(load, context) {
    const activePattern = this.getActiveJointLoadPattern(context);

    if (!activePattern || activePattern === "ALL" || activePattern === "Todos") {
      return true;
    }

    const loadPattern = String(load?.loadPattern || load?.loadCase || "CM").trim();

    return loadPattern === activePattern;
  }

  getJointForceLoads(node, context = null) {
    return this.getJointPointLoads(node).filter((load) => {
      const hasForceData =
        load?.forces ||
        Number(load?.fx || 0) !== 0 ||
        Number(load?.fy || 0) !== 0 ||
        Number(load?.fz || 0) !== 0 ||
        Number(load?.mxx || load?.mx || 0) !== 0 ||
        Number(load?.myy || load?.my || 0) !== 0 ||
        Number(load?.mzz || load?.mz || 0) !== 0;

      return (
        load?.type === "force" &&
        hasForceData &&
        (!context || this.jointLoadMatchesPattern(load, context))
      );
    });
  }

  jointHasForceLoads(node, context = null) {
    return this.getJointForceLoads(node, context).length > 0;
  }

  getJointForceLoadLabel(node, context = null) {
    const loads = this.getJointForceLoads(node, context);

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

    const label = this.getJointForceLoadLabel(node, context);

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

  getJointGroundDisplacementLoads(node, context = null) {
    return this.getJointPointLoads(node).filter((load) => {
      return (
        load?.type === "ground-displacement" &&
        load?.displacements &&
        (!context || this.jointLoadMatchesPattern(load, context))
      );
    });
  }

  jointHasGroundDisplacementLoads(node, context = null) {
    return this.getJointGroundDisplacementLoads(node, context).length > 0;
  }

  getJointGroundDisplacementLabel(node, context = null) {
    const loads = this.getJointGroundDisplacementLoads(node, context);

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

    if (!parts.length) return "";

    const loadCase = load.loadPattern || load.loadCase || "LOAD";

    return `${loadCase}: ${parts.join(", ")}`;
  }

  drawJointGroundDisplacementSymbol(node, context, screenPoint) {
    if (!this.jointHasGroundDisplacementLoads(node, context)) return;

    const ctx = context.ctx;

    const x = screenPoint.x + 34;
    const y = screenPoint.y + 4;

    const label = this.getJointGroundDisplacementLabel(node, context);

    if (!label) return;

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

  getJointTemperatureLoads(node, context = null) {
    return this.getJointPointLoads(node).filter((load) => {
      return (
        load?.type === "temperature" &&
        load?.temperature &&
        (!context || this.jointLoadMatchesPattern(load, context))
      );
    });
  }

  jointHasTemperatureLoads(node, context = null) {
    return this.getJointTemperatureLoads(node, context).length > 0;
  }

  getJointTemperatureLabel(node, context = null) {
    const loads = this.getJointTemperatureLoads(node, context);

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

    const label = this.getJointTemperatureLabel(node, context);

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

  // =====================================================
  // DISPLAY 2D > ESTILO VISUAL DE BARRAS
  // Define color, grosor y tipo de línea según el estado.
  // Barra normal: amarillo.
  // Barra seleccionada: amarillo más fuerte y más gruesa.
  // =====================================================
  getElementRenderStyle(beam, mode = "model", context = null) {
    const type = beam.elementType || beam.type || "beam";

    // <<<<<<< HEAD
    //     const beamColor = context ? this.getDisplayColor(context, "beam", "#d1d5db") : "#d1d5db";
    // =======
    // =====================================================
    // DISPLAY 2D > COLORES BASE
    // Forzamos amarillo para barras normales en 2D.
    // =====================================================
    const beamColor = "#facc15"; // amarillo normal

    const secondaryBeamColor = context ? this.getDisplayColor(context, "secondaryBeam", "#38bdf8") : "#38bdf8";

    const columnColor = context ? this.getDisplayColor(context, "column", "#22c55e") : "#22c55e";

    // <<<<<<< HEAD
    //     const selectedColor = context ? this.getDisplayColor(context, "selected", "#facc15") : "#facc15";
    // =======
    const selectedColor = "#fde047"; // amarillo más fuerte

    const textColor = context ? this.getDisplayColor(context, "text", "#ffffff") : "#ffffff";

    // =====================================================
    // DISPLAY 2D > DETECTAR SI LA BARRA ESTÁ SELECCIONADA
    // Reconoce selección normal y selección guardada en selectedBeams.
    // =====================================================
    const isSelectedBeam =
      beam.selected === true ||
      beam.isSelected === true ||
      context?.selectedBeams?.some?.((b) => b?.id === beam?.id) ||
      context?.currentState?.selectedBeams?.some?.((b) => b?.id === beam?.id) ||
      context?.selectedBeamsState?.selectedObjects?.some?.((b) => b?.id === beam?.id);

    if (isSelectedBeam) {
      return {
        strokeStyle: selectedColor,
        lineWidth: 3.5,
        lineDash: [],
        textColor: selectedColor,
      };
    }

    // =====================================================
    // DISPLAY 2D > BARRAS CON SECCIÓN ASIGNADA
    // Mantiene la barra amarilla aunque tenga sección.
    // El texto puede seguir mostrándose normal.
    // =====================================================
    if (this.hasAssignedFrameSection(beam)) {
      return {
        strokeStyle: beamColor,
        lineWidth: mode === "wireframe" ? 2.2 : 3,
        lineDash: [],
        textColor: "#ffffff",
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

  shouldDrawReferencePoint(point, CADSystem) {
    if (!point || point.visible === false) return false;

    const view = CADSystem.viewSet?.[CADSystem.activeViewIndex];
    if (!view) return true;

    const tol = CADSystem.getActiveViewTolerance?.() ?? 0.001;

    const x = Number(point.x ?? point.position?.x ?? 0);
    const y = Number(point.y ?? point.position?.y ?? 0);
    const z = Number(point.z ?? point.position?.z ?? 0);

    if (view.type === "plan") {
      const activeZ = Number(
        view.elevation ??
        view.z ??
        CADSystem.getActivePlanElevation?.() ??
        0
      );

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

  // DRAW GRID ORIGINAL
  // Grid "hoja de cuaderno" que se dibuja cuando NO hay grilla de referencia
  // (modelo en blanco). Estilo ETABS: cuadrícula fina adaptativa al zoom, con
  // líneas mayores cada 5 divisiones, SIN etiquetas ni burbujas de grid — es
  // solo un fondo visual para tener referencia mientras dibujas / importas un
  // plano. El espaciado se elige para que las líneas nunca queden ni saturadas
  // ni demasiado separadas, sin importar el zoom.
  drawStandardGrid(grid, context) {
    const ctx = context.ctx;
    ctx.save();

    const topLeft = grid.screenToWorld({ x: 0, y: 0 });
    const bottomRight = grid.screenToWorld({ x: grid.width, y: grid.height });

    const scale = Math.abs(grid.scaleX) || 1;
    // Espaciado "bonito" (1·10ᵏ, 2·10ᵏ, 5·10ᵏ) que en pantalla mida ~24px.
    const targetPx = 24;
    const raw = targetPx / scale;
    const pow = Math.pow(10, Math.floor(Math.log10(raw)));
    const mant = raw / pow;
    const niceMant = mant <= 1 ? 1 : mant <= 2 ? 2 : mant <= 5 ? 5 : 10;
    const spacing = niceMant * pow;
    if (!(spacing > 0) || !Number.isFinite(spacing)) { ctx.restore(); return; }

    const minX = Math.min(topLeft.x, bottomRight.x);
    const maxX = Math.max(topLeft.x, bottomRight.x);
    const minY = Math.min(topLeft.y, bottomRight.y);
    const maxY = Math.max(topLeft.y, bottomRight.y);

    const minorColor = this.getDisplayColor(context, "gridLine", "rgba(148,163,184,0.14)");
    const majorColor = this.getDisplayColor(context, "gridLineMajor", "rgba(148,163,184,0.30)");
    const majorEvery = 5; // línea mayor cada 5 divisiones

    // Verticales
    const firstX = Math.ceil(minX / spacing);
    for (let i = firstX; i * spacing <= maxX; i++) {
      const wx = i * spacing;
      const isMajor = i % majorEvery === 0;
      const a = grid.worldToScreen({ x: wx, y: minY });
      const b = grid.worldToScreen({ x: wx, y: maxY });
      ctx.beginPath();
      ctx.moveTo(a.x, a.y);
      ctx.lineTo(b.x, b.y);
      ctx.lineWidth = isMajor ? 1 : 0.5;
      ctx.strokeStyle = isMajor ? majorColor : minorColor;
      ctx.stroke();
    }

    // Horizontales
    const firstY = Math.ceil(minY / spacing);
    for (let j = firstY; j * spacing <= maxY; j++) {
      const wy = j * spacing;
      const isMajor = j % majorEvery === 0;
      const a = grid.worldToScreen({ x: minX, y: wy });
      const b = grid.worldToScreen({ x: maxX, y: wy });
      ctx.beginPath();
      ctx.moveTo(a.x, a.y);
      ctx.lineTo(b.x, b.y);
      ctx.lineWidth = isMajor ? 1 : 0.5;
      ctx.strokeStyle = isMajor ? majorColor : minorColor;
      ctx.stroke();
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
      // <<<<<<< HEAD
      //       this.drawGridBubble(ctx, bubblePoint, line.id, line.source === "custom" ? "#bfc7d5" : lineColor, textColor);
      // =======
      this.drawGridBubble(
        ctx,
        bubblePoint,
        line.id,
        context,
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

    const customLines = ref.generalGrids.filter((g) => g.source === "custom" && g.visible !== false);

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

    // Cota estilo ETABS: se dibuja DESPLAZADA al lado de la viga/grid (con
    // líneas de extensión) para que no se solape y las flechas se vean.
    if (point.dimension && (!view || view.type === "plan")) {
      const A = context.grid.worldToScreen({ x: point.dimension.fromX, y: point.dimension.fromY });
      const B = context.grid.worldToScreen({ x: point.dimension.toX, y: point.dimension.toY });

      // Texto con pocos decimales (redondea a 3 y quita ceros sobrantes).
      const u = window.cadUnits;
      const disp = u?.lenMToDisp ? u.lenMToDisp(point.dimension.value) : point.dimension.value;
      const num = String(Number(Number(disp).toFixed(3)));
      const unit = u?.labels?.().length || "m";
      const txt = `${num} ${unit}`;

      // Eje de la cota y perpendicular (en pantalla); se desplaza hacia el lado
      // que quede "hacia abajo" para consistencia.
      const dx = B.x - A.x, dy = B.y - A.y;
      const len = Math.hypot(dx, dy) || 1;
      const ux = dx / len, uy = dy / len;
      let px = -uy, py = ux;
      if (py < 0) { px = -px; py = -py; }
      const OFF = 22;

      const A2 = { x: A.x + px * OFF, y: A.y + py * OFF };
      const B2 = { x: B.x + px * OFF, y: B.y + py * OFF };

      const lineColor = "#6b7280";
      ctx.strokeStyle = lineColor;
      ctx.fillStyle = lineColor;
      ctx.lineWidth = 1;
      ctx.setLineDash([]);

      // líneas de extensión (witness) desde la viga/grid hasta la línea de cota
      ctx.beginPath();
      ctx.moveTo(A.x, A.y); ctx.lineTo(A2.x + px * 4, A2.y + py * 4);
      ctx.moveTo(B.x, B.y); ctx.lineTo(B2.x + px * 4, B2.y + py * 4);
      ctx.stroke();

      // línea de cota
      ctx.beginPath();
      ctx.moveTo(A2.x, A2.y); ctx.lineTo(B2.x, B2.y);
      ctx.stroke();

      // flechas visibles apuntando hacia afuera en cada extremo
      const arrowAt = (tip, ax, ay) => {
        const s = 8, w = 3.5;
        const bx = tip.x - ax * s, by = tip.y - ay * s;
        ctx.beginPath();
        ctx.moveTo(tip.x, tip.y);
        ctx.lineTo(bx + (-ay) * w, by + ax * w);
        ctx.lineTo(bx - (-ay) * w, by - ax * w);
        ctx.closePath();
        ctx.fill();
      };
      arrowAt(A2, -ux, -uy);
      arrowAt(B2, ux, uy);

      // etiqueta de distancia (fondo claro), un poco más afuera de la línea de cota
      const mx = (A2.x + B2.x) / 2 + px * 10;
      const my = (A2.y + B2.y) / 2 + py * 10;
      ctx.font = "12px Arial";
      const tw = ctx.measureText(txt).width;
      ctx.fillStyle = "rgba(255,255,255,0.92)";
      ctx.fillRect(mx - tw / 2 - 4, my - 9, tw + 8, 16);
      ctx.fillStyle = "#374151";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(txt, mx, my);
      ctx.textAlign = "left";
      ctx.textBaseline = "alphabetic";
    }

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
    const lastPoint = state.shape.getFirstPoint();

    // Punto estructural real que usará la barra:
    // - si hay activeGridPoint, usa el snap
    // - si no hay snap, usa el punto coherente según planta/elevación
    let previewPoint = null;

    if (context.activeGridPoint) {
      previewPoint = {
        x: Number(context.activeGridPoint.x || 0),
        y: Number(context.activeGridPoint.y || 0),
        z: Number(context.activeGridPoint.z || 0),
      };
    } else if (typeof context.getCurrentSnapPoint === "function") {
      previewPoint = context.getCurrentSnapPoint(context.mousePos || { x: 0, y: 0 });
    } else {
      previewPoint = {
        x: Number(context.mousePos?.x || 0),
        y: Number(context.mousePos?.y || 0),
        z: Number(context.currentZ || 0),
      };
    }

    const previewMouseScreen = this.projectPoint(
      { position: previewPoint },
      context
    );

    context.ctx.save();

    // Cursor del punto final real
    context.ctx.beginPath();
    context.ctx.fillStyle = context.activeGridPoint ? "#f97316" : "red";
    context.ctx.arc(
      previewMouseScreen.x,
      previewMouseScreen.y,
      context.grid.size,
      0,
      Math.PI * 2
    );
    context.ctx.fill();

    // Etiqueta del snap
    if (context.activeGridPoint?.label || context.activeGridPoint?.displayLabel) {
      context.ctx.fillStyle = "#ffffff";
      context.ctx.font = "11px Arial";
      context.ctx.fillText(
        context.activeGridPoint.displayLabel || context.activeGridPoint.label,
        previewMouseScreen.x + 10,
        previewMouseScreen.y - 10
      );
    }

    // Línea preview desde el primer punto hasta el punto con snap
    if (lastPoint) {
      const startScreen = this.projectPoint(lastPoint, context);

      context.ctx.strokeStyle = context.activeGridPoint ? "#facc15" : "gray";
      context.ctx.lineWidth = context.activeGridPoint ? 2 : 1;
      context.ctx.setLineDash(context.activeGridPoint ? [] : [5, 4]);

      context.ctx.beginPath();
      context.ctx.moveTo(startScreen.x, startScreen.y);
      context.ctx.lineTo(previewMouseScreen.x, previewMouseScreen.y);
      context.ctx.stroke();

      context.ctx.setLineDash([]);
    }

    context.ctx.restore();
  }

  // ======================================================================================================
  // METODO PARA DIBUJAR LAS DEFORMADAS SOLO EN LOS NODOS Y BARRAS VISIBLES SEGÚN LA VISTA ACTIVA
  // PROYECTANDO CORRECTAMENTE LOS PUNTOS DE LAS DEFORMADAS PARA QUE SEAN COHERENTES CON PLANTA Y ELEVACIÓN
  // ======================================================================================================
  drawDeflections(context) {
    const ctx = context.ctx;
    ctx.save();
    ctx.strokeStyle = "blue";
    ctx.fillStyle = "blue";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    // Dibujar barras deformadas proyectando correctamente según la vista activa
    context.shapes.forEach((beam, idx) => {
      const node1 = beam.node1;
      const node2 = beam.node2;
      if (!node1 || !node2) return;
      if (!this.shouldDrawNode(node1, context) || !this.shouldDrawNode(node2, context)) return;

      const def = context.deflecciones[idx];
      if (!def || !def.x || !def.y || !def.z) return;

      // Puntos 3D deformados
      const p1_3d = { x: def.x[0], y: def.y[0], z: def.z[0] };
      const p2_3d = { x: def.x[1], y: def.y[1], z: def.z[1] };

      // Proyectar a pantalla usando el método que ya maneja plantas y elevaciones
      const screen1 = this.projectPoint({ position: p1_3d }, context);
      const screen2 = this.projectPoint({ position: p2_3d }, context);

      ctx.beginPath();
      ctx.setLineDash([5, 3]);
      ctx.moveTo(screen1.x, screen1.y);
      ctx.lineTo(screen2.x, screen2.y);
      ctx.stroke();
    });

    // Dibujar etiquetas de desplazamiento proyectadas
    context.nodes.forEach((node, index) => {
      if (!this.shouldDrawNode(node, context)) return;
      const dispPos = context.desplazamientosPosition?.[index];
      if (!dispPos) return;
      const [dx, dy, dz] = context.matrizDesplazamiento[index] || [0, 0, 0];

      const screen = this.projectPoint({ position: dispPos }, context);
      const view = context.viewSet?.[context.activeViewIndex];

      if (view?.type === "plan") {
        ctx.fillText(`dx: ${this.formatValue(context, dx, "displacements", 6)}`, screen.x, screen.y);
        ctx.fillText(`dy: ${this.formatValue(context, dy, "displacements", 6)}`, screen.x, screen.y + 12);
      } else if (view?.type === "elevation") {
        if (view.axis === "X") {
          // Plano Y-Z: dy horizontal, dz vertical
          ctx.fillText(`dy: ${this.formatValue(context, dy, "displacements", 6)}`, screen.x, screen.y);
          ctx.fillText(`dz: ${this.formatValue(context, dz, "displacements", 6)}`, screen.x, screen.y + 12);
        } else if (view.axis === "Y") {
          // Plano X-Z: dx horizontal, dz vertical
          ctx.fillText(`dx: ${this.formatValue(context, dx, "displacements", 6)}`, screen.x, screen.y);
          ctx.fillText(`dz: ${this.formatValue(context, dz, "displacements", 6)}`, screen.x, screen.y + 12);
        }
      } else {
        // fallback
        ctx.fillText(`dx: ${this.formatValue(context, dx, "displacements", 6)}`, screen.x, screen.y);
        ctx.fillText(`dy: ${this.formatValue(context, dy, "displacements", 6)}`, screen.x, screen.y + 12);
      }
    });

    ctx.restore();
  }

  drawMaterials(context) {
    context.shapes.forEach((s) => {
      if (!this.shouldDrawBeam(s, context)) return;

      const p1 = this.projectPoint(s.node1, context);
      const p2 = this.projectPoint(s.node2, context);
      const mid = midPoint(p1, p2);

      const section =
        s.frameSection ||
        s.section ||
        s.assignment?.frameSection ||
        null;

      const E = Number(
        s.E ??
        section?.E ??
        section?.elasticModulus ??
        context.globalE ??
        210000
      );

      const AValue =
        s.A ??
        s._A ??
        section?.A ??
        section?.area ??
        section?.Area ??
        null;

      const ALabel = AValue !== null && AValue !== undefined
        ? this.formatValue(context, AValue, "areas", 3)
        : "-";

      context.ctx.save();

      context.ctx.fillStyle = "white";
      context.ctx.textAlign = "center";
      context.ctx.font = "10px arial";
      context.ctx.translate(mid.x, mid.y);
      context.ctx.rotate(s.angle || 0);

      context.ctx.fillText(`E: ${this.formatValue(context, E, "materials", 0)}`, 0, -30);
      context.ctx.fillText(`A: ${ALabel}`, 0, -20);

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

  // =====================================================
  // Aplica filtros de vista activa y oculta barras 3D-only.
  // =====================================================
  shouldDrawBeam(beam, CADSystem = null) {
    if (!beam) return false;

    // =====================================================
    // DISPLAY 2D > OBTENER SISTEMA CAD REAL
    // Usa primero el CADSystem que llega desde render().
    // =====================================================
    const cad =
      CADSystem ||
      this.CADSystem ||
      this.cadSystem ||
      this.context ||
      window.cadSystem;

    // =====================================================
    // DISPLAY 2D > OCULTAR BARRAS 3D-ONLY
    // Si la barra es inclinada/espacial, no se dibuja en 2D.
    // =====================================================
    if (
      cad?.shouldDrawFrameIn2D &&
      !cad.shouldDrawFrameIn2D(beam)
    ) {
      return false;
    }

    // =====================================================
    // DISPLAY 2D > FILTRO NORMAL DE VISTA ACTIVA
    // Mantiene tu lógica original para planta/elevación.
    // =====================================================
    if (typeof cad?.isObjectVisibleInActiveView === "function") {
      return cad.isObjectVisibleInActiveView(beam);
    }

    return (
      this.shouldDrawNode(beam.node1, cad) &&
      this.shouldDrawNode(beam.node2, cad)
    );
  }

  shouldDrawArea(area, CADSystem) {
    if (!area || area.visible === false) return false;
    if (!area?.points?.length) return false;

    const view = CADSystem.viewSet?.[CADSystem.activeViewIndex];
    if (!view) return true;

    // <<<<<<< HEAD
    //     // cota del área
    //     const areaZ = typeof area.z === "number" ? area.z : typeof area.points[0]?.z === "number" ? area.points[0].z : 0;
    // =======
    const tol = CADSystem.getActiveViewTolerance?.() ?? 0.001;

    const points = area.points || [];

    if (!points.length) return false;

    // ==========================
    // PLANTA: plano X-Y con Z fijo
    // ==========================
    if (view.type === "plan") {
      const activeZ = Number(
        view.elevation ??
        view.z ??
        CADSystem.getActivePlanElevation?.() ??
        0
      );

      const zs = points.map((p) => Number(p.z ?? 0));
      const minZ = Math.min(...zs);
      const maxZ = Math.max(...zs);

      const allOnPlan = zs.every((z) => Math.abs(z - activeZ) <= tol);

      const crossesPlan =
        activeZ >= minZ - tol &&
        activeZ <= maxZ + tol;

      return allOnPlan || crossesPlan;
    }

    // ==========================
    // ELEVACIÓN:
    // axis X => plano Y-Z con X fijo
    // axis Y => plano X-Z con Y fijo
    // ==========================
    if (view.type === "elevation") {
      const value = Number(view.value ?? 0);

      if (view.axis === "X") {
        return points.every((p) => {
          const x = Number(p.x ?? 0);
          return Math.abs(x - value) <= tol;
        });
      }

      if (view.axis === "Y") {
        return points.every((p) => {
          const y = Number(p.y ?? 0);
          return Math.abs(y - value) <= tol;
        });
      }
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

    this.drawReferencePlanes(CADSystem);
    this.drawReferencePoints(CADSystem);

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
    const nodes = Array.isArray(context.nodes) ? context.nodes : [];
    const shapes = Array.isArray(context.shapes) ? context.shapes : [];

    if (!nodes.length && !shapes.length) return;

    shapes.forEach((shape) => {
      if (!shape?.node1 || !shape?.node2) return;
      if (!this.shouldDrawBeam(shape, context)) return;

      this.drawBeamID(shape, context);
    });

    nodes.forEach((node) => {
      if (!this.shouldDrawNode(node, context)) return;

      this.drawNodeID(node, context);
    });
  }
}

export class AxialRenderer extends DiseñoRenderer {
  render(CADSystem) {
    this.clearBackground(CADSystem);

    if (CADSystem.options.showGrid) {
      CADSystem.grid.draw(this, CADSystem);
    }

    this.drawReferencePlanes(CADSystem);
    this.drawReferencePoints(CADSystem);

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

// HELPER FUNCTIONS FOR BROWSER ENVIRONMENT

if (typeof window !== "undefined") {
  window.generateMockFrameForceResults = generateMockFrameForceResults;
}

if (typeof window !== "undefined") {
  window.DisenoRenderer = DiseñoRenderer;
  window.DiseñoRenderer = DiseñoRenderer;

  window.jhackRedraw2D = function (cad = window.cadSystem) {
    if (!cad) {
      console.warn("No existe window.cadSystem.");
      return false;
    }

    if (!cad.ctx || !cad.grid) {
      console.warn("El CADSystem no tiene ctx o grid. No puedo redibujar 2D.");
      return false;
    }

    const renderer = new DiseñoRenderer();
    renderer.render(cad);

    return true;
  };
}

if (typeof window !== "undefined") {
  window.jhackShowMockFrameDiagram = function (
    component = "M3",
    caseId = "CM"
  ) {
    const cad = window.cadSystem;

    if (!cad) {
      console.warn("No existe window.cadSystem.");
      return false;
    }

    cad.frameForceResults = window.generateMockFrameForceResults(
      cad.shapes || [],
      ["CM", "CVE", "SDX", "SDY"]
    );

    cad.frameDiagramDisplay = {
      enabled: true,
      caseId,
      component,
      source: "mock",
      showValues: true,
      showMaxMin: true,
      filled: true,
      autoScale: true,
      scaleFactor: 1,
      selectedOnly: false,
      showLocalAxes: false,
      showTable: false
    };

    cad.options.showMaterials = false;
    cad.options.showFAxiales = false;
    cad.options.showFAxialesValues = false;

    cad.redraw();

    console.log(`✅ Diagrama mock ${component} / ${caseId} activado.`);
    return true;
  };

  window.jhackClearFrameDiagram = function () {
    const cad = window.cadSystem;

    if (!cad) return false;

    cad.frameDiagramDisplay = {
      ...(cad.frameDiagramDisplay || {}),
      enabled: false
    };

    cad.redraw();

    console.log("🧹 Diagrama de frame limpiado.");
    return true;
  };
}

if (typeof window !== "undefined") {
  window.jhackShowLocalAxes = function () {
    const cad = window.cadSystem;

    if (!cad) {
      console.warn("No existe window.cadSystem.");
      return false;
    }

    cad.frameDiagramDisplay = {
      ...(cad.frameDiagramDisplay || {}),
      enabled: cad.frameDiagramDisplay?.enabled || false,
      showLocalAxes: true,
      selectedOnly: false,
    };

    cad.options.showMaterials = false;
    cad.options.showIDs = false;
    cad.options.showFAxiales = false;
    cad.options.showFAxialesValues = false;

    cad.redraw();

    console.log("✅ Local Axes 1-2-3 activados.");
    return true;
  };

  window.jhackHideLocalAxes = function () {
    const cad = window.cadSystem;

    if (!cad) return false;

    cad.frameDiagramDisplay = {
      ...(cad.frameDiagramDisplay || {}),
      showLocalAxes: false,
    };

    cad.redraw();

    console.log("🧹 Local Axes 1-2-3 ocultados.");
    return true;
  };
}

if (typeof window !== "undefined") {
  window.jhackShowM3 = function (caseId = "CM") {
    const cad = window.cadSystem;

    if (!cad) {
      console.warn("No existe window.cadSystem.");
      return false;
    }

    window.cad = cad;

    cad.frameForceResults = window.generateMockFrameForceResults(
      cad.shapes || [],
      ["CM", "CVE", "SDX", "SDY"]
    );

    cad.frameDiagramDisplay = {
      enabled: true,
      caseId,
      component: "M3",
      source: "mock",

      showValues: true,
      showMaxMin: true,
      filled: true,
      autoScale: true,
      scaleFactor: 1,

      selectedOnly: false,
      showLocalAxes: false,
      showTable: false,

      showLegend: true,
      showZeroLine: true,
      showStationLines: true,
      valueLabelMode: "max-min",
      diagramHeightPx: 42,
      decimals: 2,
    };

    cad.options.showMaterials = false;
    cad.options.showIDs = false;
    cad.options.showFAxiales = false;
    cad.options.showFAxialesValues = false;

    cad.redraw();

    console.log(`✅ Diagrama Moment M3 activado para ${caseId}.`);
    return true;
  };
}

if (typeof window !== "undefined") {
  window.jhackShowV3 = function (caseId = "CM") {
    const cad = window.cadSystem;

    if (!cad) {
      console.warn("No existe window.cadSystem.");
      return false;
    }

    window.cad = cad;

    cad.frameForceResults = window.generateMockFrameForceResults(
      cad.shapes || [],
      ["CM", "CVE", "SDX", "SDY"]
    );

    cad.frameDiagramDisplay = {
      enabled: true,
      caseId,
      component: "V3",
      source: "mock",

      showValues: true,
      showMaxMin: true,
      filled: true,
      autoScale: true,
      scaleFactor: 1,

      selectedOnly: false,
      showLocalAxes: false,
      showTable: false,

      showLegend: true,
      showZeroLine: true,
      showStationLines: true,
      valueLabelMode: "max-min",
      diagramHeightPx: 42,
      decimals: 2,
    };

    cad.options.showMaterials = false;
    cad.options.showIDs = false;
    cad.options.showFAxiales = false;
    cad.options.showFAxialesValues = false;

    cad.redraw();

    console.log(`✅ Diagrama Shear V3 activado para ${caseId}.`);
    return true;
  };
}

if (typeof window !== "undefined") {
  window.jhackShowP = function (caseId = "CM") {
    const cad = window.cadSystem;

    if (!cad) {
      console.warn("No existe window.cadSystem.");
      return false;
    }

    window.cad = cad;

    cad.frameForceResults = window.generateMockFrameForceResults(
      cad.shapes || [],
      ["CM", "CVE", "SDX", "SDY"]
    );

    cad.frameDiagramDisplay = {
      enabled: true,
      caseId,
      component: "P",
      source: "mock",

      showValues: true,
      showMaxMin: true,
      filled: true,
      autoScale: true,
      scaleFactor: 1,

      selectedOnly: false,
      showLocalAxes: false,
      showTable: false,

      showLegend: true,
      showZeroLine: true,
      showStationLines: true,
      valueLabelMode: "max-min",
      diagramHeightPx: 42,
      decimals: 2,
    };

    cad.options.showMaterials = false;
    cad.options.showIDs = false;
    cad.options.showFAxiales = false;
    cad.options.showFAxialesValues = false;

    cad.redraw();

    console.log(`✅ Diagrama Axial P activado para ${caseId}.`);
    return true;
  };
}

if (typeof window !== "undefined") {
  window.jhackShowM2 = function (caseId = "CM") {
    const cad = window.cadSystem;

    if (!cad) {
      console.warn("No existe window.cadSystem.");
      return false;
    }

    window.cad = cad;

    cad.frameForceResults = window.generateMockFrameForceResults(
      cad.shapes || [],
      ["CM", "CVE", "SDX", "SDY"]
    );

    cad.frameDiagramDisplay = {
      enabled: true,
      caseId,
      component: "M2",
      source: "mock",

      showValues: true,
      showMaxMin: true,
      filled: true,
      autoScale: true,
      scaleFactor: 1,

      selectedOnly: false,
      showLocalAxes: false,
      showTable: false,

      showLegend: true,
      showZeroLine: true,
      showStationLines: true,
      valueLabelMode: "max-min",
      diagramHeightPx: 42,
      decimals: 2,
    };

    cad.options.showMaterials = false;
    cad.options.showIDs = false;
    cad.options.showFAxiales = false;
    cad.options.showFAxialesValues = false;

    cad.redraw();

    console.log(`✅ Diagrama Moment M2 activado para ${caseId}.`);
    return true;
  };
}

if (typeof window !== "undefined") {
  window.jhackShowV2 = function (caseId = "CM") {
    const cad = window.cadSystem;

    if (!cad) {
      console.warn("No existe window.cadSystem.");
      return false;
    }

    window.cad = cad;

    cad.frameForceResults = window.generateMockFrameForceResults(
      cad.shapes || [],
      ["CM", "CVE", "SDX", "SDY"]
    );

    cad.frameDiagramDisplay = {
      enabled: true,
      caseId,
      component: "V2",
      source: "mock",

      showValues: true,
      showMaxMin: true,
      filled: true,
      autoScale: true,
      scaleFactor: 1,

      selectedOnly: false,
      showLocalAxes: false,
      showTable: false,

      showLegend: true,
      showZeroLine: true,
      showStationLines: true,
      valueLabelMode: "max-min",
      diagramHeightPx: 42,
      decimals: 2,
    };

    cad.options.showMaterials = false;
    cad.options.showIDs = false;
    cad.options.showFAxiales = false;
    cad.options.showFAxialesValues = false;

    cad.redraw();

    console.log(`✅ Diagrama Shear V2 activado para ${caseId}.`);
    return true;
  };
}

if (typeof window !== "undefined") {
  window.jhackShowT = function (caseId = "CM") {
    const cad = window.cadSystem;

    if (!cad) {
      console.warn("No existe window.cadSystem.");
      return false;
    }

    window.cad = cad;

    cad.frameForceResults = window.generateMockFrameForceResults(
      cad.shapes || [],
      ["CM", "CVE", "SDX", "SDY"]
    );

    cad.frameDiagramDisplay = {
      enabled: true,
      caseId,
      component: "T",
      source: "mock",

      showValues: true,
      showMaxMin: true,
      filled: true,
      autoScale: true,
      scaleFactor: 1,

      selectedOnly: false,
      showLocalAxes: false,
      showTable: false,

      showLegend: true,
      showZeroLine: true,
      showStationLines: true,
      showTorsionSymbols: true,

      valueLabelMode: "max-min",
      diagramHeightPx: 42,
      decimals: 2,
    };

    cad.options.showMaterials = false;
    cad.options.showIDs = false;
    cad.options.showFAxiales = false;
    cad.options.showFAxialesValues = false;

    cad.redraw();

    console.log(`✅ Diagrama Torsion T activado para ${caseId}.`);
    return true;
  };
}

if (typeof window !== "undefined") {
  window.jhackShowSectionProperties = function (mode = "labels") {
    const cad = window.cadSystem;

    if (!cad) {
      console.warn("No existe window.cadSystem.");
      return false;
    }

    window.cad = cad;

    cad.frameDiagramDisplay = {
      ...(cad.frameDiagramDisplay || {}),
      enabled: false,
      showLocalAxes: false,
    };

    cad.sectionPropertyDisplay = {
      enabled: true,
      mode,
      selectedOnly: false,

      showMaterial: true,
      showA: true,
      showI22: true,
      showI33: true,
      showJ: true,

      colorBy: null,
      decimals: 4,
    };

    cad.options.showMaterials = false;
    cad.options.showIDs = false;
    cad.options.showFAxiales = false;
    cad.options.showFAxialesValues = false;

    cad.redraw();

    console.log("✅ Section / Inertia Display activado.");
    return true;
  };

  window.jhackColorBySectionProperty = function (property = "A") {
    const cad = window.cadSystem;

    if (!cad) {
      console.warn("No existe window.cadSystem.");
      return false;
    }

    window.cad = cad;

    cad.sectionPropertyDisplay = {
      ...(cad.sectionPropertyDisplay || {}),
      enabled: true,
      mode: "compact",
      colorBy: property,
      selectedOnly: false,
    };

    cad.frameDiagramDisplay = {
      ...(cad.frameDiagramDisplay || {}),
      enabled: false,
    };

    cad.redraw();

    console.log(`✅ Color by ${property} activado.`);
    return true;
  };

  window.jhackHideSectionProperties = function () {
    const cad = window.cadSystem;

    if (!cad) return false;

    cad.sectionPropertyDisplay = {
      ...(cad.sectionPropertyDisplay || {}),
      enabled: false,
    };

    cad.redraw();

    console.log("🧹 Section / Inertia Display ocultado.");
    return true;
  };
}

if (typeof window !== "undefined") {
  window.jhackShowFrameForceTable = function (caseId = "CM") {
    const cad = window.cadSystem;

    if (!cad) {
      console.warn("No existe window.cadSystem.");
      return false;
    }

    window.cad = cad;

    if (!cad.frameForceResults?.frameForces?.length) {
      cad.frameForceResults = window.generateMockFrameForceResults(
        cad.shapes || [],
        ["CM", "CVE", "SDX", "SDY"]
      );
    }

    cad.frameDiagramDisplay = {
      ...(cad.frameDiagramDisplay || {}),
      caseId,
      showTable: true,
    };

    return showFrameForceTable(cad, {
      caseId,
      selectedOnly: cad.frameDiagramDisplay?.selectedOnly || false,
    });
  };

  window.jhackHideFrameForceTable = function () {
    const cad = window.cadSystem;

    if (cad) {
      cad.frameDiagramDisplay = {
        ...(cad.frameDiagramDisplay || {}),
        showTable: false,
      };
    }

    return hideFrameForceTable();
  };

  window.jhackGetFrameForceTableRows = function (caseId = "CM") {
    const cad = window.cadSystem;

    if (!cad) {
      console.warn("No existe window.cadSystem.");
      return [];
    }

    return getFrameForceTableRows(cad, {
      caseId,
      selectedOnly: cad.frameDiagramDisplay?.selectedOnly || false,
    });
  };
}

if (typeof window !== "undefined") {
  window.jhackGenerateMockFrameResultsWithCombos = function () {
    const cad = window.cadSystem;

    if (!cad) {
      console.warn("No existe window.cadSystem.");
      return false;
    }

    window.cad = cad;

    const baseResults = window.generateMockFrameForceResults(
      cad.shapes || [],
      ["CM", "CVE", "SDX", "SDY"]
    );

    cad.frameForceResults = addDefaultCombosAndEnvelope(baseResults);

    console.log("✅ Mock frame force results con combos y envelope generados.");
    console.log(getAvailableFrameForceCases(cad.frameForceResults));

    return true;
  };

  window.jhackListFrameForceCases = function () {
    const cad = window.cadSystem;

    if (!cad?.frameForceResults) {
      console.warn("No hay frameForceResults cargados.");
      return null;
    }

    const available = getAvailableFrameForceCases(cad.frameForceResults);

    console.table(
      available.all.map((item) => ({
        id: item.id,
        name: item.name,
        type: item.type,
        selectorType: item.selectorType,
      }))
    );

    return available;
  };

  window.jhackShowFrameCombo = function (
    selectorId = "COMBO1",
    component = "M3"
  ) {
    const cad = window.cadSystem;

    if (!cad) {
      console.warn("No existe window.cadSystem.");
      return false;
    }

    window.cad = cad;

    if (!cad.frameForceResults?.combinations?.length) {
      window.jhackGenerateMockFrameResultsWithCombos();
    }

    cad.frameDiagramDisplay = {
      enabled: true,
      caseId: null,
      comboId: selectorId,
      component,
      source: "mock",

      showValues: true,
      showMaxMin: true,
      filled: true,
      autoScale: true,
      scaleFactor: 1,

      selectedOnly: false,
      showLocalAxes: false,
      showTable: false,

      showLegend: true,
      showZeroLine: true,
      showStationLines: true,
      valueLabelMode: "max-min",
      diagramHeightPx: 42,
      decimals: 2,
    };

    cad.options.showMaterials = false;
    cad.options.showIDs = false;
    cad.options.showFAxiales = false;
    cad.options.showFAxialesValues = false;

    cad.redraw();

    console.log(`✅ Diagrama ${component} para combo/envelope ${selectorId} activado.`);
    return true;
  };

  window.jhackShowEnvelope = function (component = "M3") {
    return window.jhackShowFrameCombo("ENV_MAX", component);
  };
}

if (typeof window !== "undefined") {
  window.jhackShowFrameComboTable = function (comboId = "COMBO1") {
    const cad = window.cadSystem;

    if (!cad) {
      console.warn("No existe window.cadSystem.");
      return false;
    }

    window.cad = cad;

    if (!cad.frameForceResults?.combinations?.length) {
      window.jhackGenerateMockFrameResultsWithCombos();
    }

    return showFrameForceTable(cad, {
      comboId,
      selectedOnly: cad.frameDiagramDisplay?.selectedOnly || false,
    });
  };
}

if (typeof window !== "undefined") {
  window.jhackShowFrameForcePanel = function () {
    const cad = window.cadSystem;

    if (!cad) {
      console.warn("No existe window.cadSystem.");
      return false;
    }

    window.cad = cad;

    return showFrameForceDisplayPanel(cad);
  };

  window.jhackHideFrameForcePanel = function () {
    return hideFrameForceDisplayPanel();
  };
}