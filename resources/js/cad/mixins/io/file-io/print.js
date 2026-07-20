// mixins/io/file-io/print.js — parte "print" de file-io
// (file-io.js se partió en sub-mixins por responsabilidad; barril en file-io.js).
import Swal from "sweetalert2";
import { Beam, Node as StructuralNode } from "../../../model/shapes.js";
import { read as readmat } from "mat-for-js";
import { axisToFixed, removeFromArray } from "../../../lib/utils.js";
import { Triangle, Puente, Arco } from "../../../model/parametricModels.js";
import { elevateSelectedNodes, extrudeToNewFloor, lowerSelectedNodes, selectAllNodes, activate3DDrawingMode } from "../../../3d/modeling3d.js";
import { toggleView3D } from "../../../3d/viewer3d.js";
import {
  serializeFrameForceModule,
  restoreFrameForceModule,
} from "../../../engine/frameForcePersistence.js";

export const printMixin = {

  // Print methods
  createVideo() {
    this.showMessage?.("🎥 Crear Video - pendiente. Primero se completó impresión gráfica.");
  },

  printSetup() {
    this.showMessage?.("🖨️ Configurar Impresión - pendiente. Usando impresión gráfica preliminar.");
  },

  waitForNextFrames(count = 2) {
    return new Promise((resolve) => {
      const step = () => {
        count -= 1;

        if (count <= 0) {
          resolve();
          return;
        }

        requestAnimationFrame(step);
      };

      requestAnimationFrame(step);
    });
  },

  async getCanvasImageForPrint(canvas, options = {}) {
    try {
      if (!canvas) return null;

      if (canvas.width <= 0 || canvas.height <= 0) {
        return null;
      }

      if (options.render3D) {
        const viewer = getViewer3DState?.();

        if (viewer?.scene) {
          viewer.scene.render();
          await this.waitForNextFrames(2);
          viewer.scene.render();
        }
      }

      const image = canvas.toDataURL("image/png");

      if (!image || image === "data:,") {
        return null;
      }

      return image;
    } catch (error) {
      console.warn("No se pudo capturar canvas para impresión:", error);
      return null;
    }
  },

  getPrintModelName() {
    return this.currentFileName || "Modelo sin nombre";
  },

  getPrintActiveViewName() {
    try {
      if (typeof this.getActiveViewLabel === "function") {
        return this.getActiveViewLabel();
      }

      const view = this.viewSet?.[this.activeViewIndex];

      if (view?.name) return view.name;

      return this.currentViewMode || "Vista actual";
    } catch (error) {
      return "Vista actual";
    }
  },

  async buildPrintGraphicsHTML() {
    const canvas2D = this.canvas || document.querySelector("#cad-panel-2d canvas") || document.querySelector("canvas");

    const canvas3D = document.querySelector("#viewer3d-container canvas");

    const image2D = await this.getCanvasImageForPrint(canvas2D);

    const image3D = await this.getCanvasImageForPrint(canvas3D, {
      render3D: true,
    });

    const modelName = this.getPrintModelName();
    const activeViewName = this.getPrintActiveViewName();
    const date = new Date().toLocaleString();

    const nodesCount = this.nodes?.length || 0;
    const framesCount = this.shapes?.length || 0;
    const areasCount = this.areas?.length || 0;
    const storiesCount = this.stories?.length || 0;

    return `
      <!DOCTYPE html>
      <html lang="es">
      <head>
        <meta charset="UTF-8">
        <title>Impresión Gráfica - ${modelName}</title>
        <style>
          * {
            box-sizing: border-box;
          }

          body {
            margin: 0;
            padding: 24px;
            font-family: Arial, Helvetica, sans-serif;
            color: #111827;
            background: #ffffff;
          }

          .print-header {
            border-bottom: 2px solid #1f2937;
            padding-bottom: 12px;
            margin-bottom: 18px;
          }

          .title {
            font-size: 20px;
            font-weight: 700;
            margin: 0;
          }

          .subtitle {
            font-size: 12px;
            color: #4b5563;
            margin-top: 4px;
          }

          .summary {
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: 8px;
            margin: 14px 0 18px;
          }

          .summary-card {
            border: 1px solid #d1d5db;
            border-radius: 6px;
            padding: 8px;
            font-size: 12px;
          }

          .summary-card strong {
            display: block;
            font-size: 14px;
            margin-bottom: 2px;
          }

          .views {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 16px;
          }

          .view-card {
            border: 1px solid #d1d5db;
            border-radius: 8px;
            padding: 10px;
            break-inside: avoid;
          }

          .view-title {
            font-size: 14px;
            font-weight: 700;
            margin-bottom: 8px;
            color: #111827;
          }

          .view-card img {
            width: 100%;
            max-height: 520px;
            object-fit: contain;
            border: 1px solid #e5e7eb;
            background: #f9fafb;
          }

          .empty-capture {
            height: 240px;
            display: flex;
            align-items: center;
            justify-content: center;
            border: 1px dashed #9ca3af;
            color: #6b7280;
            font-size: 12px;
            text-align: center;
            padding: 20px;
          }

          .note {
            margin-top: 18px;
            padding: 10px;
            border-left: 4px solid #f59e0b;
            background: #fffbeb;
            font-size: 12px;
            color: #92400e;
          }

          .footer {
            margin-top: 18px;
            padding-top: 10px;
            border-top: 1px solid #d1d5db;
            font-size: 11px;
            color: #6b7280;
          }

          @media print {
            body {
              padding: 12mm;
            }

            .views {
              grid-template-columns: 1fr 1fr;
            }

            .no-print {
              display: none !important;
            }
          }

          @media (max-width: 900px) {
            .views {
              grid-template-columns: 1fr;
            }

            .summary {
              grid-template-columns: repeat(2, 1fr);
            }
          }
        </style>
      </head>
      <body>
        <div class="print-header">
          <h1 class="title">Impresión Gráfica del Modelo</h1>
          <div class="subtitle">
            Modelo: <strong>${modelName}</strong> |
            Vista activa: <strong>${activeViewName}</strong> |
            Fecha: ${date}
          </div>
        </div>

        <div class="summary">
          <div class="summary-card">
            <strong>${nodesCount}</strong>
            Nodos
          </div>
          <div class="summary-card">
            <strong>${framesCount}</strong>
            Barras / Frames
          </div>
          <div class="summary-card">
            <strong>${areasCount}</strong>
            Áreas
          </div>
          <div class="summary-card">
            <strong>${storiesCount}</strong>
            Niveles
          </div>
        </div>

        <div class="views">
          <div class="view-card">
            <div class="view-title">Vista 2D</div>
            ${image2D
        ? `<img src="${image2D}" alt="Vista 2D">`
        : `<div class="empty-capture">No se pudo capturar la vista 2D.</div>`
      }
          </div>

          <div class="view-card">
            <div class="view-title">Vista 3D</div>
            ${image3D
        ? `<img src="${image3D}" alt="Vista 3D">`
        : `<div class="empty-capture">No se pudo capturar la vista 3D. Si aparece vacío, sincroniza la vista 3D e intenta nuevamente.</div>`
      }
          </div>
        </div>

        <div class="note">
          Estado: impresión gráfica preliminar del sistema web tipo ETABS.
          Esta salida sirve para revisión visual del modelo y no reemplaza todavía un reporte técnico final.
        </div>

        <div class="footer">
          Generado desde JHACK ETABS WEB - File / Print Graphics.
        </div>
      </body>
      </html>
    `;
  },

  async printPreviewGraphics() {
    try {
      this.redraw?.();

      const printWindow = window.open("", "_blank", "width=1200,height=800");

      if (!printWindow) {
        this.showMessage?.("❌ El navegador bloqueó la ventana de impresión.", "error");
        return;
      }

      printWindow.document.open();
      const html = await this.buildPrintGraphicsHTML();
      printWindow.document.write(html);
      printWindow.document.close();

      this.showMessage?.("👁️ Vista previa de impresión generada.");
    } catch (error) {
      console.error("❌ Error generando vista previa de impresión:", error);
      this.showMessage?.("❌ Error generando vista previa de impresión.", "error");
    }
  },

  async printGraphics() {
    try {
      this.redraw?.();

      const printWindow = window.open("", "_blank", "width=1200,height=800");

      if (!printWindow) {
        this.showMessage?.("❌ El navegador bloqueó la ventana de impresión.", "error");
        return;
      }

      const html = await this.buildPrintGraphicsHTML();

      printWindow.document.open();
      printWindow.document.write(html);
      printWindow.document.close();

      printWindow.onload = () => {
        setTimeout(() => {
          printWindow.focus();
          printWindow.print();
        }, 400);
      };

      this.showMessage?.("🖨️ Preparando impresión gráfica...");
    } catch (error) {
      console.error("❌ Error en Print Graphics:", error);
      this.showMessage?.("❌ Error al imprimir gráficos.", "error");
    }
  },
};
