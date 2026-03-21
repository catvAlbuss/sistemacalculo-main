/**
 * Base Tool class for all drawing tools in the predim module
 * Provides common functionality for drawing, saving, and managing shapes
 */
export class Tool {
    constructor(ctx, fillColor) {
        this.ctx = ctx;
        this.fillColor = fillColor;
        this.drawing = false; // Control de estado de dibujo
    }

    startDrawing(e, prevMouseX, prevMouseY, snapshot, draw) {
        if (this.drawing) return;
        this.prevMouseX = prevMouseX;
        this.prevMouseY = prevMouseY;
        this.snapshot = snapshot;
        this.drawing = true;
        draw(e);
    }

    stopDrawing(e, isDrawing) {
        if (isDrawing) {
            this.saveShape(e);
            this.drawingFinished();
        }
        this.drawing = false;
    }

    draw(e) {
        // To be overridden by subclasses
    }

    saveShape(e, prevMouseX, prevMouseY, selectedColor, brushWidth, selectedTool, shapes) {
        const shape = {
            x: prevMouseX,
            y: prevMouseY,
            width: e.offsetX - prevMouseX,
            height: e.offsetY - prevMouseY,
            color: selectedColor,
            brushWidth: brushWidth,
            fill: this.fillColor.checked,
            tool: selectedTool,
        };
        shapes.push(shape);
        this.redrawCanvas();
        this.updateCount();
    }

    drawingFinished() {
        // Method to be overridden by specific tools
    }

    removeShape(e, shapes) {
        const shapeIndex = shapes.findIndex(
            (shape) =>
                e.offsetX >= shape.x &&
                e.offsetX <= shape.x + shape.width &&
                e.offsetY >= shape.y &&
                e.offsetY <= shape.y + shape.height
        );

        if (shapeIndex !== -1) {
            shapes.splice(shapeIndex, 1);
            this.redrawCanvas();
            this.updateCount();
        }
    }

    redrawCanvas(originalPdfSnapshot, currentBrightness, adjustPDFBrightness, shapes, tools) {
        // Aplicar el brillo actual al PDF
        if (originalPdfSnapshot) {
            const adjustedImageData = adjustPDFBrightness(currentBrightness);
            this.ctx.putImageData(adjustedImageData, 0, 0);
        }

        // Redibujar todas las formas
        shapes.forEach((shape) => {
            const tool = tools[shape.tool];
            if (tool && typeof tool.drawShape === "function") {
                tool.drawShape(shape);
            } else {
                console.warn(`No drawShape method found for tool: ${shape.tool}`);
            }
        });
    }

    moveShape(e, shapes, redrawAllShapes) {
        const shape = shapes.find(
            (shape) =>
                e.offsetX >= shape.x &&
                e.offsetX <= shape.x + shape.width &&
                e.offsetY >= shape.y &&
                e.offsetY <= shape.y + shape.height
        );
        if (shape) {
            const dx = e.offsetX - shape.x - shape.width / 2;
            const dy = e.offsetY - shape.y - shape.height / 2;
            shape.x += dx;
            shape.y += dy;
            redrawAllShapes();
        }
    }

    updateCount() {
        // To be overridden by subclasses
    }

    calculateArea(shape, valorScala) {
        // Función para calcular el área de la forma
        const scale = valorScala; // Escala configurada
        const dpi = 96; // Asumiendo 96 DPI
        const pixelToCm = 2.54 / dpi / (115 * scale);
        const baseCm = shape.width * pixelToCm;
        const alturaCm = shape.height * pixelToCm;
        const areaCm2 = baseCm * alturaCm;
        return areaCm2;
    }

    drawText(shape, areaText, areaTextAC, textY) {
        const textWidth = this.ctx.measureText(areaText).width;
        const textX = shape.x + shape.width / 2 - textWidth / 2;
        this.ctx.fillStyle = "black";
        this.ctx.font = "bold 12px Arial";
        this.ctx.textAlign = "left";
        this.ctx.textBaseline = "middle";
        this.ctx.fillText(areaText, textX, textY);
        this.ctx.fillText(areaTextAC, textX, textY + 10);
    }
}
