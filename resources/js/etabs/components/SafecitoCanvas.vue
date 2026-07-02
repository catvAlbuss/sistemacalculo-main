<template>
    <section class="sc-wrapper">
        <div class="sc-toolbar">
            <button class="sc-tool" :class="{ active: currentTool === Tools.LINE }" @click="setTool(Tools.LINE)">
                ✏️ Dibujar
            </button>

            <button class="sc-tool" :class="{ active: currentTool === Tools.MOVE }" @click="setTool(Tools.MOVE)">
                ✥ Mover
            </button>

            <button class="sc-tool" :class="{ active: currentTool === Tools.CUT }" @click="setTool(Tools.CUT)">
                🧹 Borrar
            </button>

            <button class="sc-tool" :class="{ active: currentTool === Tools.EDIT }" @click="setTool(Tools.EDIT)">
                🎯 Editar punto
            </button>

            <button class="sc-tool" @click="toggleSnap">
                ⚓ Snap: {{ snapEnabled ? "ON" : "OFF" }}
            </button>

            <label class="sc-field">
                Snap
                <input v-model.number="gridSpacing" type="number" step="0.1" min="0.01" @change="applyGridSpacing" />
            </label>

            <label class="sc-field">
                X
                <input v-model.number="selectedX" type="number" step="0.001" :disabled="!selectedPoint"
                    @input="updateSelectedPoint" />
            </label>

            <label class="sc-field">
                Y
                <input v-model.number="selectedY" type="number" step="0.001" :disabled="!selectedPoint"
                    @input="updateSelectedPoint" />
            </label>

            <button class="sc-action" @click="centerColumns">
                Centrar columnas
            </button>

            <button class="sc-action danger" @click="clearShapes">
                Limpiar polígonos
            </button>
        </div>

        <div class="sc-body">
            <div class="sc-canvas-box">
                <canvas ref="canvasRef" class="sc-canvas" @mousedown="onMouseDown" @mouseup="onMouseUp"
                    @mouseleave="onMouseLeave" @mousemove="onMouseMove" @wheel.prevent="onWheel"></canvas>

                <input ref="distanceInputRef" v-show="distanceInputVisible" v-model="distanceInputValue"
                    class="sc-distance-input" type="number" step="0.001" :style="distanceInputStyle"
                    @keyup.enter="confirmDistanceInput" />
            </div>

            <aside class="sc-side">
                <h3>Propiedades</h3>

                <div v-if="!finishedShapes.length" class="sc-empty">
                    Dibuja un polígono para ver sus propiedades.
                </div>

                <div v-for="(shape, index) in finishedShapes" :key="index" class="sc-poly-card">
                    <h4>Polígono {{ index + 1 }}</h4>

                    <table class="sc-props-table">
                        <tbody>
                            <tr v-for="row in getShapePropertiesRows(shape)" :key="row.label">
                                <th>{{ row.label }}</th>
                                <td>{{ row.value }}</td>
                            </tr>
                        </tbody>
                    </table>

                    <table class="sc-points-table">
                        <thead>
                            <tr>
                                <th>#</th>
                                <th>X</th>
                                <th>Y</th>
                            </tr>
                        </thead>

                        <tbody>
                            <tr v-for="(point, pointIndex) in shape.points" :key="pointIndex">
                                <td>{{ pointIndex + 1 }}</td>
                                <td>{{ formatNumber(point.x, 3) }}</td>
                                <td>{{ formatNumber(point.y, 3) }}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </aside>
        </div>
    </section>
</template>

<script setup>
import { computed, nextTick, onBeforeUnmount, onMounted, reactive, ref, watch } from "vue";

import { Grid } from "../../safecito/grid.js";
import { Shape, Marker, Point } from "../../safecito/shapes.js";
import {
    pointDistance,
    distanceToSegment,
    formatCoordinate,
    getMousePos,
} from "../../safecito/utils.js";

const props = defineProps({
    columns: {
        type: Array,
        default: () => [],
    },
});

const emit = defineEmits(["polygons-change"]);

const Tools = {
    MOVE: 0,
    LINE: 1,
    CUT: 3,
    EDIT: 9,
    NONE: 99,
};

const canvasRef = ref(null);
const distanceInputRef = ref(null);

const grid = new Grid();

const finishedShapes = ref([]);
const currentShape = ref(new Shape(true));
const markers = ref([]);

const currentTool = ref(Tools.LINE);
const snapEnabled = ref(true);
const gridSpacing = ref(0.5);

const mousePos = ref({ x: 0, y: 0 });
const isDragging = ref(false);
const dragStart = ref({ x: 0, y: 0 });

const selectedPoint = ref(null);
const selectedShape = ref(null);
const selectedX = ref("");
const selectedY = ref("");

const distanceInputVisible = ref(false);
const distanceInputValue = ref("");
const distanceInputStyle = reactive({
    top: "0px",
    left: "0px",
});

const allShapes = computed(() => {
    return [...finishedShapes.value, currentShape.value].filter((shape) => {
        return shape && Array.isArray(shape.points) && shape.points.length > 0;
    });
});

function setIdleTool() {
    setTool(Tools.MOVE);
}

function cancelCurrentPolygonDrawing() {
    const hadTemporaryPoints = currentShape.value?.points?.length > 0;

    currentShape.value = new Shape(true);

    selectedPoint.value = null;
    selectedShape.value = null;
    selectedX.value = "";
    selectedY.value = "";

    isDragging.value = false;
    hideDistanceInput();

    setIdleTool();
    redraw();

    console.log(
        hadTemporaryPoints
            ? "⎋ Polígono temporal cancelado. Herramienta: Mover."
            : "⎋ Herramienta Dibujar desactivada. Herramienta: Mover."
    );
}

function onKeyDown(event) {
    if (event.key !== "Escape") return;

    const target = event.target;
    const tagName = target?.tagName?.toLowerCase();
    const isDistanceInput = target === distanceInputRef.value;

    if (["input", "textarea", "select"].includes(tagName) && !isDistanceInput) {
        return;
    }

    event.preventDefault();
    event.stopPropagation();

    if (currentTool.value === Tools.LINE) {
        cancelCurrentPolygonDrawing();
        return;
    }

    selectedPoint.value = null;
    selectedShape.value = null;
    selectedX.value = "";
    selectedY.value = "";
    isDragging.value = false;
    hideDistanceInput();

    setIdleTool();
    redraw();

    console.log("⎋ Herramienta actual desactivada. Herramienta: Mover.");
}

function formatNumber(value, digits = 2) {
    const number = Number(value);
    return Number.isFinite(number) ? number.toFixed(digits) : "-";
}

function getCanvasContext() {
    const canvas = canvasRef.value;
    return canvas ? canvas.getContext("2d") : null;
}

function resizeCanvas() {
    const canvas = canvasRef.value;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const scale = window.devicePixelRatio || 1;

    canvas.width = Math.max(1, rect.width * scale);
    canvas.height = Math.max(1, rect.height * scale);

    grid.set(1, canvas);

    if (props.columns.length) {
        centerColumns();
    } else {
        redraw();
    }
}

function buildMarkersFromColumns(columns) {
    return (columns || [])
        .filter((row) => Number.isFinite(Number(row.x)) && Number.isFinite(Number(row.y)))
        .map((row) => {
            return new Marker({ x: Number(row.x), y: Number(row.y) }, row.column);
        });
}

function setTool(tool) {
    currentTool.value = tool;

    const canvas = canvasRef.value;
    if (!canvas) return;

    if (tool === Tools.LINE) {
        canvas.style.cursor = "crosshair";
    } else if (tool === Tools.MOVE) {
        canvas.style.cursor = "move";
    } else if (tool === Tools.CUT) {
        canvas.style.cursor = "not-allowed";
    } else if (tool === Tools.EDIT) {
        canvas.style.cursor = "cell";
    } else {
        canvas.style.cursor = "default";
    }

    redraw();
}

function toggleSnap() {
    snapEnabled.value = !snapEnabled.value;
    redraw();
}

function applyGridSpacing() {
    const spacing = Number(gridSpacing.value);

    if (Number.isFinite(spacing) && spacing > 0) {
        grid.gridSpacing = spacing;
    }

    redraw();
}

function snapPoint(point) {
    if (!snapEnabled.value) return point;

    const spacing = Number(grid.gridSpacing) || 0.5;

    return {
        x: Math.round(point.x / spacing) * spacing,
        y: Math.round(point.y / spacing) * spacing,
    };
}

function drawFinishedShape(ctx, shape, shapeIndex) {
    if (!shape || !Array.isArray(shape.points) || shape.points.length < 1) return;

    ctx.save();

    if (shape.points.length >= 2) {
        ctx.strokeStyle = "#e5e7eb";
        ctx.lineWidth = 1.5;
        ctx.setLineDash([]);

        ctx.beginPath();

        shape.points.forEach((point, index) => {
            const screenPoint = grid.worldToScreen(point);

            if (index === 0) {
                ctx.moveTo(screenPoint.x, screenPoint.y);
            } else {
                ctx.lineTo(screenPoint.x, screenPoint.y);
            }
        });

        if (shape.points.length >= 3) {
            const first = grid.worldToScreen(shape.points[0]);
            ctx.lineTo(first.x, first.y);
        }

        ctx.stroke();
    }

    shape.points.forEach((point, pointIndex) => {
        const screenPoint = grid.worldToScreen(point);

        let color = "#ef4444";

        if (pointIndex === 0) color = "#22d3ee";
        if (pointIndex === shape.points.length - 1) color = "#3b82f6";
        if (selectedPoint.value === point) color = "#facc15";

        ctx.fillStyle = color;
        ctx.strokeStyle = color;

        ctx.beginPath();
        ctx.arc(screenPoint.x, screenPoint.y, grid.size + 1, 0, 2 * Math.PI);
        ctx.fill();
        ctx.stroke();
    });

    if (shape.points.length >= 3) {
        const props = safeShapeProperties(shape);
        if (props && Number.isFinite(Number(props.XC)) && Number.isFinite(Number(props.YC))) {
            const center = grid.worldToScreen({ x: Number(props.XC), y: Number(props.YC) });

            ctx.fillStyle = "#f8fafc";
            ctx.font = "12px Arial";
            ctx.fillText(`P${shapeIndex + 1}`, center.x + 5, center.y - 5);
        }
    }

    ctx.restore();
}

function drawCurrentShape(ctx) {
    const shape = currentShape.value;
    if (!shape || !shape.points?.length) return;

    ctx.save();

    if (shape.points.length >= 1) {
        ctx.strokeStyle = "#60a5fa";
        ctx.lineWidth = 1.2;
        ctx.setLineDash([5, 5]);

        ctx.beginPath();

        shape.points.forEach((point, index) => {
            const screenPoint = grid.worldToScreen(point);

            if (index === 0) {
                ctx.moveTo(screenPoint.x, screenPoint.y);
            } else {
                ctx.lineTo(screenPoint.x, screenPoint.y);
            }
        });

        const lastPoint = shape.getLastPoint?.();
        if (lastPoint) {
            const lastScreen = grid.worldToScreen(lastPoint);
            const mouseScreen = grid.worldToScreen(mousePos.value);

            ctx.moveTo(lastScreen.x, lastScreen.y);
            ctx.lineTo(mouseScreen.x, mouseScreen.y);
        }

        ctx.stroke();
    }

    shape.points.forEach((point) => {
        const screenPoint = grid.worldToScreen(point);

        ctx.fillStyle = "#38bdf8";
        ctx.beginPath();
        ctx.arc(screenPoint.x, screenPoint.y, grid.size, 0, 2 * Math.PI);
        ctx.fill();
    });

    ctx.restore();
}

function redraw() {
    const ctx = getCanvasContext();
    if (!ctx) return;

    grid.draw(ctx);

    markers.value.forEach((marker) => {
        marker.draw(grid, ctx);
    });

    finishedShapes.value.forEach((shape, index) => {
        drawFinishedShape(ctx, shape, index);
    });

    drawCurrentShape(ctx);

    ctx.save();
    ctx.font = "12px Arial";
    ctx.fillStyle = snapEnabled.value ? "#e5e7eb" : "#f87171";
    ctx.fillText(snapEnabled.value ? "Snap Enabled" : "Snap Disabled", 10, 15);

    ctx.fillStyle = "#e5e7eb";
    ctx.fillText(`(${formatCoordinate(mousePos.value.x)}, ${formatCoordinate(mousePos.value.y)})`, 10, 32);

    ctx.fillText(getToolName(), 10, 49);
    ctx.restore();
}

function getToolName() {
    if (currentTool.value === Tools.LINE) return "Line";
    if (currentTool.value === Tools.MOVE) return "Move";
    if (currentTool.value === Tools.CUT) return "Erase";
    if (currentTool.value === Tools.EDIT) return "Edit";
    return "";
}

function closestPoint(screenPoint) {
    let bestPoint = null;
    let bestShape = null;
    let bestDistance = 7;

    finishedShapes.value.forEach((shape) => {
        shape.points.forEach((point) => {
            const distance = pointDistance(screenPoint, grid.worldToScreen(point));

            if (distance <= bestDistance) {
                bestDistance = distance;
                bestPoint = point;
                bestShape = shape;
            }
        });
    });

    return bestPoint ? { point: bestPoint, shape: bestShape } : null;
}

function closestShapeByLine(screenPoint) {
    let bestShape = null;
    let bestDistance = 10;

    finishedShapes.value.forEach((shape) => {
        for (let i = 0; i < shape.points.length; i++) {
            const a = grid.worldToScreen(shape.points[i]);
            const b = grid.worldToScreen(shape.points[(i + 1) % shape.points.length]);
            const distance = distanceToSegment(screenPoint, a, b);

            if (distance <= bestDistance) {
                bestDistance = distance;
                bestShape = shape;
            }
        }
    });

    return bestShape;
}

function onMouseDown(event) {
    event.preventDefault();

    const canvas = canvasRef.value;
    if (!canvas) return;

    const screenPoint = getMousePos(canvas, event);
    const worldPoint = snapPoint(grid.screenToWorld(screenPoint));

    if (event.button === 1 || event.button === 2) {
        isDragging.value = true;
        dragStart.value = screenPoint;
        return;
    }

    if (currentTool.value === Tools.LINE) {
        addPointToCurrentShape(worldPoint);
        redraw();
        return;
    }

    if (currentTool.value === Tools.MOVE) {
        const found = closestPoint(screenPoint);

        if (found) {
            selectedPoint.value = found.point;
            selectedShape.value = found.shape;
            selectedX.value = found.point.x;
            selectedY.value = found.point.y;
        } else {
            selectedPoint.value = null;
            selectedShape.value = null;
            isDragging.value = true;
            dragStart.value = screenPoint;
        }

        redraw();
        return;
    }

    if (currentTool.value === Tools.EDIT) {
        const found = closestPoint(screenPoint);

        selectedPoint.value = found?.point ?? null;
        selectedShape.value = found?.shape ?? null;

        if (selectedPoint.value) {
            selectedX.value = selectedPoint.value.x;
            selectedY.value = selectedPoint.value.y;
        }

        redraw();
        return;
    }

    if (currentTool.value === Tools.CUT) {
        const shape = closestShapeByLine(screenPoint);

        if (shape) {
            const index = finishedShapes.value.indexOf(shape);
            if (index !== -1) {
                finishedShapes.value.splice(index, 1);
                emitPolygons();
            }
        }

        redraw();
    }
}

function addPointToCurrentShape(worldPoint) {
    const shape = currentShape.value;

    if (!shape.points.length) {
        shape.points.push(new Point(worldPoint.x, worldPoint.y, true, null));
        showDistanceInput();
        return;
    }

    const firstPoint = shape.points[0];

    if (shape.points.length >= 3 && pointDistance(grid.worldToScreen(firstPoint), grid.worldToScreen(worldPoint)) <= 8) {
        finishCurrentShape();
        return;
    }

    shape.points.push(new Point(worldPoint.x, worldPoint.y, true, null));
    showDistanceInput();
}

function finishCurrentShape() {
    const shape = currentShape.value;

    if (!shape || shape.points.length < 3) return;

    shape.calcularPropiedades?.();

    finishedShapes.value.push(shape);
    currentShape.value = new Shape(true);

    hideDistanceInput();
    emitPolygons();
    redraw();
}

function onMouseUp(event) {
    if (event.button === 1 || event.button === 2) {
        isDragging.value = false;
    }
}

function onMouseLeave() {
    isDragging.value = false;
}

function onMouseMove(event) {
    const canvas = canvasRef.value;
    if (!canvas) return;

    const screenPoint = getMousePos(canvas, event);
    const worldPoint = snapPoint(grid.screenToWorld(screenPoint));

    mousePos.value = worldPoint;

    if (currentTool.value === Tools.LINE) {
        updateDistanceInputPosition(screenPoint);
    }

    if (currentTool.value === Tools.MOVE && isDragging.value && !selectedPoint.value) {
        grid.offestX -= (screenPoint.x - dragStart.value.x) / grid.scaleX;
        grid.offestY += (screenPoint.y - dragStart.value.y) / grid.scaleY;
        dragStart.value = screenPoint;
    }

    if ((currentTool.value === Tools.MOVE || currentTool.value === Tools.EDIT) && selectedPoint.value && event.buttons === 1) {
        selectedPoint.value.x = worldPoint.x;
        selectedPoint.value.y = worldPoint.y;
        selectedX.value = worldPoint.x;
        selectedY.value = worldPoint.y;

        selectedShape.value?.calcularPropiedades?.();
        emitPolygons();
    }

    redraw();
}

function onWheel(event) {
    const canvas = canvasRef.value;
    if (!canvas) return;

    const screenPoint = getMousePos(canvas, event);
    const prevMouse = grid.screenToWorld(screenPoint);

    if (event.deltaY < 0) {
        grid.scaleX *= 1.1;
        grid.scaleY *= 1.1;
    } else {
        grid.scaleX *= 0.9;
        grid.scaleY *= 0.9;
    }

    const translatedMouse = grid.screenToWorld(screenPoint);

    grid.offestX += prevMouse.x - translatedMouse.x;
    grid.offestY += prevMouse.y - translatedMouse.y;

    redraw();
}

function showDistanceInput() {
    distanceInputVisible.value = true;
    nextTick(() => {
        distanceInputRef.value?.focus();
        distanceInputRef.value?.select();
    });
}

function hideDistanceInput() {
    distanceInputVisible.value = false;
    distanceInputValue.value = "";
}

function updateDistanceInputPosition(screenPoint) {
    const shape = currentShape.value;
    const lastPoint = shape?.getLastPoint?.();

    if (!lastPoint || !distanceInputVisible.value) return;

    const lastScreen = grid.worldToScreen(lastPoint);

    const mid = {
        x: (lastScreen.x + screenPoint.x) * 0.5,
        y: (lastScreen.y + screenPoint.y) * 0.5,
    };

    distanceInputStyle.left = `${mid.x}px`;
    distanceInputStyle.top = `${mid.y}px`;

    distanceInputValue.value = pointDistance(lastPoint, mousePos.value).toFixed(3);
}

function confirmDistanceInput() {
    const shape = currentShape.value;
    const lastPoint = shape?.getLastPoint?.();

    if (!lastPoint) return;

    const distance = Number(distanceInputValue.value);
    if (!Number.isFinite(distance) || distance <= 0) return;

    const vectorLength = pointDistance(lastPoint, mousePos.value);
    if (!vectorLength) return;

    const unitVector = {
        x: (mousePos.value.x - lastPoint.x) / vectorLength,
        y: (mousePos.value.y - lastPoint.y) / vectorLength,
    };

    const newPoint = {
        x: lastPoint.x + unitVector.x * distance,
        y: lastPoint.y + unitVector.y * distance,
    };

    addPointToCurrentShape(snapPoint(newPoint));
    redraw();
}

function updateSelectedPoint() {
    if (!selectedPoint.value) return;

    const x = Number(selectedX.value);
    const y = Number(selectedY.value);

    if (!Number.isFinite(x) || !Number.isFinite(y)) return;

    selectedPoint.value.x = x;
    selectedPoint.value.y = y;

    selectedShape.value?.calcularPropiedades?.();
    emitPolygons();
    redraw();
}

function safeShapeProperties(shape) {
    try {
        shape.calcularPropiedades?.();
        return shape.propiedades?.() ?? null;
    } catch (error) {
        return null;
    }
}

function getShapePropertiesRows(shape) {
    const props = safeShapeProperties(shape);

    if (!props) return [];

    return ["P", "A", "IX", "IY", "XC", "YC", "MX", "MY", "IXY"].map((key) => ({
        label: key,
        value: formatNumber(props[key], 2),
    }));
}

function centerColumns() {
    const canvas = canvasRef.value;
    if (!canvas || !markers.value.length) {
        redraw();
        return;
    }

    const xs = markers.value.map((marker) => marker.point.x);
    const ys = markers.value.map((marker) => marker.point.y);

    const minX = Math.min(...xs);
    const maxX = Math.max(...xs);
    const minY = Math.min(...ys);
    const maxY = Math.max(...ys);

    const rangeX = Math.max(Math.abs(maxX - minX), 1);
    const rangeY = Math.max(Math.abs(maxY - minY), 1);

    const scaleX = canvas.width / rangeX;
    const scaleY = canvas.height / rangeY;
    const scale = Math.min(scaleX, scaleY) * 0.75;

    grid.scaleX = scale;
    grid.scaleY = scale;

    grid.offestX = 0;
    grid.offestY = 0;

    const centerScreenRange = grid.screenToWorld({
        x: canvas.width * 0.5,
        y: canvas.height * 0.5,
    });

    grid.offestX = (minX + maxX) * 0.5 - centerScreenRange.x;
    grid.offestY = (minY + maxY) * 0.5 - centerScreenRange.y;

    redraw();
}

function clearShapes() {
    finishedShapes.value = [];
    currentShape.value = new Shape(true);
    selectedPoint.value = null;
    selectedShape.value = null;
    hideDistanceInput();
    emitPolygons();
    redraw();
}

function emitPolygons() {
    const polygons = finishedShapes.value.map((shape, index) => ({
        index: index + 1,
        closed: true,
        source: "safecito-canvas",
        nodes: shape.points.map((point, pointIndex) => ({
            id: pointIndex + 1,
            x: Number(point.x),
            y: Number(point.y),
        })),
    }));

    emit("polygons-change", polygons);
}

watch(
    () => props.columns,
    (columns) => {
        markers.value = buildMarkersFromColumns(columns);
        nextTick(() => {
            centerColumns();
        });
    },
    { deep: true, immediate: true }
);

onMounted(() => {
    nextTick(() => {
        resizeCanvas();
        setTool(Tools.LINE);
    });

    window.addEventListener("resize", resizeCanvas);
    window.addEventListener("keydown", onKeyDown);
});

onBeforeUnmount(() => {
    window.removeEventListener("resize", resizeCanvas);
    window.removeEventListener("keydown", onKeyDown);
});
</script>

<style scoped>
.sc-wrapper {
    width: 100%;
    background: #475569;
    color: #f8fafc;
    border: 1px solid #334155;
}

.sc-toolbar {
    display: flex;
    align-items: center;
    gap: 8px;
    flex-wrap: wrap;
    background: #475569;
    padding: 8px 10px;
}

.sc-tool,
.sc-action {
    cursor: pointer;
    border: none;
    border-radius: 5px;
    background: #334155;
    color: #fff;
    padding: 7px 10px;
    font-size: 12px;
    font-weight: 700;
}

.sc-tool:hover,
.sc-action:hover {
    background: #1f2937;
}

.sc-tool.active {
    background: #2563eb;
}

.sc-action {
    background: #2563eb;
}

.sc-action.danger {
    background: #dc2626;
}

.sc-field {
    display: flex;
    align-items: center;
    gap: 5px;
    color: #f8fafc;
    font-size: 12px;
}

.sc-field input {
    width: 80px;
    background: #334155;
    border: 1px solid #64748b;
    border-radius: 5px;
    color: #fff;
    padding: 6px;
}

.sc-field input:disabled {
    opacity: 0.45;
}

.sc-body {
    display: grid;
    grid-template-columns: minmax(0, 1fr) 360px;
    gap: 0;
}

.sc-canvas-box {
    position: relative;
    background: #000;
    min-height: 520px;
}

.sc-canvas {
    display: block;
    width: 100%;
    height: 520px;
    background: #000;
}

.sc-distance-input {
    position: absolute;
    transform: translate(-50%, -50%);
    width: 95px;
    background: #111827;
    border: 1px solid #3b82f6;
    border-radius: 4px;
    color: #fff;
    padding: 5px;
    font-size: 12px;
    z-index: 5;
}

.sc-side {
    background: #475569;
    border-left: 1px solid #64748b;
    padding: 12px;
    max-height: 520px;
    overflow-y: auto;
}

.sc-side h3 {
    margin: 0 0 10px;
    font-size: 18px;
    font-weight: 800;
}

.sc-empty {
    color: #cbd5e1;
    font-size: 13px;
}

.sc-poly-card {
    margin-bottom: 14px;
}

.sc-poly-card h4 {
    margin: 0;
    background: #111827;
    padding: 8px 10px;
    font-size: 15px;
}

.sc-props-table,
.sc-points-table {
    width: 100%;
    border-collapse: collapse;
    font-size: 12px;
}

.sc-props-table th,
.sc-props-table td,
.sc-points-table th,
.sc-points-table td {
    padding: 7px 9px;
    border-bottom: 1px solid #64748b;
    text-align: right;
}

.sc-props-table th,
.sc-points-table th {
    color: #dbeafe;
    text-align: left;
    background: #334155;
}

.sc-points-table {
    margin-top: 8px;
}

@media (max-width: 1000px) {
    .sc-body {
        grid-template-columns: 1fr;
    }

    .sc-side {
        border-left: none;
        border-top: 1px solid #64748b;
    }
}
</style>