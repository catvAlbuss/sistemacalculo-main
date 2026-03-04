import { Tool } from '../base/Tool.js';
import {
    calculateTributaryArea,
    calculateSquareColumnArea,
    calculateSquareSide,
    getPixelToCm
} from '../../utils/calculations.js';

/**
 * CuadradoTool - Tool for drawing square columns
 */
export class CuadradoTool extends Tool {
    constructor(ctx, fillColor) {
        super(ctx, fillColor);
        this.rectCount = 0;
    }

    draw(e, prevMouseX, prevMouseY, snapshot, isDrawing, valorScala, selectedColor, brushWidth) {
        if (!isDrawing) return;
        this.ctx.putImageData(snapshot, 0, 0);
        const width = e.offsetX - prevMouseX;
        const height = e.offsetY - prevMouseY;

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

            this.ctx.font = "12px Arial";
            this.ctx.fillStyle = "#000";
            this.ctx.fillText(`${Math.abs(baseCm).toFixed(2)} m`, prevMouseX + width / 2, prevMouseY - 5);
            this.ctx.fillText(`${Math.abs(alturaCm).toFixed(2)} m`, prevMouseX + width + 5, prevMouseY + height / 2);
        }
    }

    drawShape(square, valorScala, npisos, fc) {
        if (Math.abs(square.width) <= 1 || Math.abs(square.height) <= 1) {
            return;
        }

        this.ctx.beginPath();
        this.ctx.rect(square.x, square.y, square.width, square.height);
        this.ctx.lineWidth = square.brushWidth;
        this.ctx.strokeStyle = square.color;
        this.ctx.stroke();

        if (square.fill) {
            this.ctx.fillStyle = square.color;
            this.ctx.fill();
        }

        const areaCm2 = calculateTributaryArea(square, valorScala);
        const Ac = calculateSquareColumnArea(areaCm2, npisos, fc);
        const ladocua = calculateSquareSide(Ac);

        const areaText = `AT = ${areaCm2.toFixed(2)} m²`;
        const areaTextAC = `A = ${Ac.toFixed(2)} cm²`;
        const areaTextACuadrado = `Lado = ${ladocua.toFixed(2)} m`;
        const textY = square.y + square.height / 2;
        const textX = square.x + square.width / 2 - this.ctx.measureText(areaText).width / 2;

        this.drawText(square, areaText, areaTextAC, textY);
        this.ctx.fillText(areaTextACuadrado, textX, textY + 20);
    }

    drawingFinished() {
        this.rectCount++;
        const countElement = document.getElementById("cuadro-count");
        if (countElement) {
            countElement.textContent = this.rectCount;
        }
    }

    addToReport(shapes, valorScala) {
        const tableBody = document.getElementById("Columna_Cuadrado");
        if (!tableBody) return;

        tableBody.innerHTML = "";
        let count = 1;
        const npisos = document.getElementById("npisos").value;
        const fc = parseFloat(document.getElementById("fc").value);

        for (let j = 0; j < shapes.length; j++) {
            const shape = shapes[j];
            if (shape.tool === "cuadrado") {
                const areaCm2 = calculateTributaryArea(shape, valorScala);
                const Ac = calculateSquareColumnArea(areaCm2, npisos, fc);
                const ladocal = calculateSquareSide(Ac);

                const nombreAt = `${areaCm2.toFixed(2)}`;
                const nombreA = `${Ac.toFixed(2)}`;
                const nombreLado = `${ladocal.toFixed(2)}`;

                const ColumnaCuadrado = `
          <tr class="bg-white border-b dark:bg-gray-800 dark:border-gray-700">
            <td class='py-2 px-8'>${count++}</td>
            <td class='py-2 px-8'>(npiso * 1000 * Ac) / (0.45 * fc)</td>
            <td class='py-2 px-4 text-center'>${nombreAt} m²</td>
            <td class='py-2 px-4 text-center'>${nombreA} cm²</td>
            <td class='py-2 px-4 text-center'>${nombreLado} cm</td>
          </tr>
        `;

                tableBody.insertAdjacentHTML("beforeend", ColumnaCuadrado);
            }
        }
    }

    updateCount(shapes) {
        const countCuadrado = document.getElementById("cuadro-count");
        if (countCuadrado) {
            const count = shapes.filter((shape) => shape.tool === "cuadrado").length;
            countCuadrado.textContent = count;
            this.rectCount = count;
            if (count == 0) {
                const tableBody = document.getElementById("Columna_Cuadrado");
                if (tableBody) tableBody.innerHTML = "";
            }
        }
    }
}
