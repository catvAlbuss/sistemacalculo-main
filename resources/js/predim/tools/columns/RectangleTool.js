import { Tool } from '../base/Tool.js';
import {
    calculateTributaryArea,
    calculateRectangularColumnArea,
    calculateRectangularSide,
    getPixelToCm
} from '../../utils/calculations.js';

/**
 * RectangleTool - Tool for drawing rectangular columns
 */
export class RectangleTool extends Tool {
    constructor(ctx, fillColor) {
        super(ctx, fillColor);
        this.rectCount = 0; // Contador de rectángulos
    }

    draw(e, prevMouseX, prevMouseY, snapshot, isDrawing, valorScala, selectedColor, brushWidth) {
        if (!isDrawing) return;
        this.ctx.putImageData(snapshot, 0, 0);
        const width = e.offsetX - prevMouseX;
        const height = e.offsetY - prevMouseY;

        // Verificar si las dimensiones son significativas
        if (Math.abs(width) > 1 && Math.abs(height) > 1) {
            const shape = {
                x: prevMouseX,
                y: prevMouseY,
                width: width,
                height: height,
                color: selectedColor,
                brushWidth: brushWidth,
                fill: this.fillColor.checked,
            };
            this.drawShape(shape, valorScala, document.getElementById("npisos").value, parseFloat(document.getElementById("fc").value));

            const pixelToCm = getPixelToCm(valorScala);
            const baseCm = shape.width * pixelToCm;
            const alturaCm = shape.height * pixelToCm;

            // Agregar cotas mientras se dibuja  el rectángulo
            this.ctx.font = "12px Arial";
            this.ctx.fillStyle = "#000";
            this.ctx.fillText(`${Math.abs(baseCm).toFixed(2)} m`, prevMouseX + width / 2, prevMouseY - 5);
            this.ctx.fillText(`${Math.abs(alturaCm).toFixed(2)} m`, prevMouseX + width + 5, prevMouseY + height / 2);
        }
    }

    drawShape(rect, valorScala, npisos, fc) {
        if (Math.abs(rect.width) <= 1 || Math.abs(rect.height) <= 1) {
            return; // No dibujar si las dimensiones son muy pequeñas
        }

        this.ctx.beginPath();
        this.ctx.rect(rect.x, rect.y, rect.width, rect.height);
        this.ctx.lineWidth = rect.brushWidth;
        this.ctx.strokeStyle = rect.color;
        this.ctx.stroke();

        if (rect.fill) {
            this.ctx.fillStyle = rect.color;
            this.ctx.fill();
        }

        const areaCm2 = calculateTributaryArea(rect, valorScala);
        const Ar = calculateRectangularColumnArea(areaCm2, npisos, fc);
        const lado = calculateRectangularSide(Ar);

        const AreaTributaria = `AT: ${areaCm2.toFixed(2)} m²`;
        const areaRectangulo = `A: ${Ar.toFixed(2)} cm²`;
        const base = "b = 0.30 m";
        const LadoRec = `Lado = ${lado.toFixed(2)} m`;
        const textY = rect.y + rect.height / 2;
        const textX = rect.x + rect.width / 2 - this.ctx.measureText(AreaTributaria).width / 2;

        this.drawText(rect, AreaTributaria, areaRectangulo, textY);
        this.ctx.fillText(base, textX, textY + 20);
        this.ctx.fillText(LadoRec, textX, textY + 30);
    }

    drawingFinished(shapes) {
        const lastShape = shapes[shapes.length - 1];
        if (
            lastShape &&
            lastShape.tool === "rectangle" &&
            Math.abs(lastShape.width) > 1 &&
            Math.abs(lastShape.height) > 1
        ) {
            this.rectCount++;
            const countElement = document.getElementById("rectangulo-count");
            if (countElement) {
                countElement.textContent = this.rectCount;
            }
        }
    }

    addToReport(shapes, valorScala) {
        const tableBody = document.getElementById("Columna_rectangular");
        if (!tableBody) return;

        tableBody.innerHTML = "";
        let count = 1;
        const npisos = document.getElementById("npisos").value;
        const fc = parseFloat(document.getElementById("fc").value);

        for (let i = 0; i < shapes.length; i++) {
            const shape = shapes[i];
            if (shape.tool === "rectangle") {
                const at = calculateTributaryArea(shape, valorScala);
                const Ar = calculateRectangularColumnArea(at, npisos, fc);
                const base = "0.30 m";
                const LadoRec = calculateRectangularSide(Ar);

                const Columna = `
          <tr class="bg-white border-b dark:bg-gray-800 dark:border-gray-700">
            <td class='py-2 px-8'>${count++}</td>
            <td class='py-2 px-8'>(npiso * 1000 * Ac) / (0.45 * fc)</td>
            <td class='py-2 px-4 text-center'>${at.toFixed(2)} m²</td>
            <td class='py-2 px-4 text-center'>${Ar.toFixed(2)} cm²</td>
            <td class='py-2 px-4 text-center'>${base}</td>
            <td class='py-2 px-4 text-center'>${LadoRec.toFixed(2)} m</td>
          </tr>
        `;

                tableBody.insertAdjacentHTML("beforeend", Columna);
            }
        }
    }

    updateCount(shapes) {
        const countrectangulo = document.getElementById("rectangulo-count");
        if (countrectangulo) {
            const count = shapes.filter((shape) => shape.tool === "rectangle").length;
            countrectangulo.textContent = count;
            this.rectCount = count;
            if (count == 0) {
                const tableBody = document.getElementById("Columna_rectangular");
                if (tableBody) tableBody.innerHTML = "";
            }
        }
    }
}
