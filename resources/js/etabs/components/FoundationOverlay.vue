<template>
    <canvas ref="canvasRef" class="foundation-overlay" :class="{ active: enabled }" @mousedown="onMouseDown"
        @mouseup="onMouseUp" @mousemove="onMouseMove" @mouseleave="onMouseLeave" @wheel.prevent="onWheel"
        @contextmenu.prevent />
</template>

<script setup>
import { nextTick, onBeforeUnmount, onMounted, ref, watch } from "vue";

const props = defineProps({
    enabled: {
        type: Boolean,
        default: true,
    },
    tool: {
        type: String,
        default: "move",
    },
    columns: {
        type: Array,
        default: () => [],
    },
    clearSignal: {
        type: Number,
        default: 0,
    },
    fitSignal: {
        type: Number,
        default: 0,
    },
});

const emit = defineEmits(["polygons-change"]);

const canvasRef = ref(null);

const polygons = ref([]);
const currentPoints = ref([]);

const selectedPoint = ref(null);
const selectedPolygon = ref(null);

const isDragging = ref(false);
const dragStart = ref({ x: 0, y: 0 });

const mouseWorld = ref({ x: 0, y: 0 });

const view = ref({
    centerX: 0,
    centerY: 0,
    scale: 50,
});

const VIEWER_TOP_SAFE_AREA_PX = 96;
const VIEWER_BOTTOM_SAFE_AREA_PX = 34;

function getDrawableRect() {
    const canvas = getCanvas();
    const dpr = window.devicePixelRatio || 1;

    const top = VIEWER_TOP_SAFE_AREA_PX * dpr;
    const bottom = VIEWER_BOTTOM_SAFE_AREA_PX * dpr;

    return {
        x: 0,
        y: top,
        width: canvas?.width ?? 1,
        height: Math.max(1, (canvas?.height ?? 1) - top - bottom),
    };
}

function withDrawableClip(ctx, callback) {
    const rect = getDrawableRect();

    ctx.save();
    ctx.beginPath();
    ctx.rect(rect.x, rect.y, rect.width, rect.height);
    ctx.clip();

    callback(rect);

    ctx.restore();
}

function getCanvas() {
    return canvasRef.value;
}

function getContext() {
    return getCanvas()?.getContext("2d") ?? null;
}

function resizeCanvas() {
    const canvas = getCanvas();
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;

    canvas.width = Math.max(1, rect.width * dpr);
    canvas.height = Math.max(1, rect.height * dpr);

    redraw();
}

function worldToScreen(point) {
    const canvas = getCanvas();
    const width = canvas?.width ?? 1;
    const height = canvas?.height ?? 1;

    return {
        x: width / 2 + (Number(point.x) - view.value.centerX) * view.value.scale,
        y: height / 2 - (Number(point.y) - view.value.centerY) * view.value.scale,
    };
}

function screenToWorld(point) {
    const canvas = getCanvas();
    const width = canvas?.width ?? 1;
    const height = canvas?.height ?? 1;

    return {
        x: view.value.centerX + (point.x - width / 2) / view.value.scale,
        y: view.value.centerY - (point.y - height / 2) / view.value.scale,
    };
}

function getMouseScreen(event) {
    const canvas = getCanvas();
    const rect = canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;

    return {
        x: (event.clientX - rect.left) * dpr,
        y: (event.clientY - rect.top) * dpr,
    };
}

function fitColumns() {
    const validColumns = props.columns.filter((column) => {
        return Number.isFinite(Number(column.x)) && Number.isFinite(Number(column.y));
    });

    if (!validColumns.length) {
        redraw();
        return;
    }

    const canvas = getCanvas();
    if (!canvas) return;

    const xs = validColumns.map((column) => Number(column.x));
    const ys = validColumns.map((column) => Number(column.y));

    const minX = Math.min(...xs);
    const maxX = Math.max(...xs);
    const minY = Math.min(...ys);
    const maxY = Math.max(...ys);

    const rangeX = Math.max(maxX - minX, 1);
    const rangeY = Math.max(maxY - minY, 1);

    view.value.centerX = (minX + maxX) / 2;
    view.value.centerY = (minY + maxY) / 2;
    view.value.scale = Math.min(canvas.width / rangeX, canvas.height / rangeY) * 0.75;

    redraw();
}

function distance(a, b) {
    return Math.hypot(Number(a.x) - Number(b.x), Number(a.y) - Number(b.y));
}

function closeToFirstPoint(screenPoint) {
    if (currentPoints.value.length < 3) return false;

    const first = worldToScreen(currentPoints.value[0]);
    return distance(first, screenPoint) <= 12;
}

function addPoint(worldPoint, screenPoint) {
    if (closeToFirstPoint(screenPoint)) {
        finishPolygon();
        return;
    }

    currentPoints.value.push({
        id: currentPoints.value.length + 1,
        x: Number(worldPoint.x),
        y: Number(worldPoint.y),
    });

    redraw();
}

function finishPolygon() {
    if (currentPoints.value.length < 3) return;

    polygons.value.push({
        index: polygons.value.length + 1,
        closed: true,
        source: "etabs-foundation-overlay",
        nodes: currentPoints.value.map((point, index) => ({
            id: index + 1,
            x: Number(point.x),
            y: Number(point.y),
        })),
    });

    currentPoints.value = [];
    emitPolygons();
    redraw();
}

function cancelCurrentDrawing() {
    const hadPoints = currentPoints.value.length > 0;
    currentPoints.value = [];
    selectedPoint.value = null;
    selectedPolygon.value = null;
    isDragging.value = false;

    redraw();

    // console.log(
    //     hadPoints
    //         ? "⎋ Polígono temporal cancelado en visor ETABS2."
    //         : "⎋ Herramienta de cimentación cancelada."
    // );
}

function clearPolygons() {
    polygons.value = [];
    currentPoints.value = [];
    selectedPoint.value = null;
    selectedPolygon.value = null;
    emitPolygons();
    redraw();
}

function emitPolygons() {
    emit("polygons-change", polygons.value.map((polygon, index) => ({
        ...polygon,
        index: index + 1,
    })));
}

function findClosestPoint(screenPoint) {
    let best = null;
    let bestDistance = 10;

    polygons.value.forEach((polygon) => {
        polygon.nodes.forEach((point) => {
            const pointScreen = worldToScreen(point);
            const d = distance(screenPoint, pointScreen);

            if (d < bestDistance) {
                bestDistance = d;
                best = { polygon, point };
            }
        });
    });

    return best;
}

function distanceToSegment(p, a, b) {
    const ax = a.x;
    const ay = a.y;
    const bx = b.x;
    const by = b.y;

    const dx = bx - ax;
    const dy = by - ay;

    if (dx === 0 && dy === 0) return distance(p, a);

    const t = Math.max(0, Math.min(1, ((p.x - ax) * dx + (p.y - ay) * dy) / (dx * dx + dy * dy)));

    return distance(p, {
        x: ax + t * dx,
        y: ay + t * dy,
    });
}

function findClosestPolygon(screenPoint) {
    let bestPolygon = null;
    let bestDistance = 12;

    polygons.value.forEach((polygon) => {
        for (let i = 0; i < polygon.nodes.length; i++) {
            const a = worldToScreen(polygon.nodes[i]);
            const b = worldToScreen(polygon.nodes[(i + 1) % polygon.nodes.length]);
            const d = distanceToSegment(screenPoint, a, b);

            if (d < bestDistance) {
                bestDistance = d;
                bestPolygon = polygon;
            }
        }
    });

    return bestPolygon;
}

function erasePolygon(screenPoint) {
    const polygon = findClosestPolygon(screenPoint);
    if (!polygon) return;

    polygons.value = polygons.value.filter((item) => item !== polygon);
    emitPolygons();
    redraw();
}

function onMouseDown(event) {
    if (!props.enabled) return;

    const screenPoint = getMouseScreen(event);
    const worldPoint = screenToWorld(screenPoint);
    mouseWorld.value = worldPoint;

    if (props.tool === "draw") {
        addPoint(worldPoint, screenPoint);
        return;
    }

    if (props.tool === "erase") {
        erasePolygon(screenPoint);
        return;
    }

    if (props.tool === "edit") {
        const found = findClosestPoint(screenPoint);

        selectedPoint.value = found?.point ?? null;
        selectedPolygon.value = found?.polygon ?? null;

        redraw();
        return;
    }

    isDragging.value = true;
    dragStart.value = screenPoint;
}

function onMouseUp() {
    isDragging.value = false;

    if (props.tool === "edit" && selectedPolygon.value) {
        emitPolygons();
    }
}

function onMouseLeave() {
    isDragging.value = false;
}

function onMouseMove(event) {
    if (!props.enabled) return;

    const screenPoint = getMouseScreen(event);
    const worldPoint = screenToWorld(screenPoint);
    mouseWorld.value = worldPoint;

    if (props.tool === "move" && isDragging.value) {
        const dx = (screenPoint.x - dragStart.value.x) / view.value.scale;
        const dy = (screenPoint.y - dragStart.value.y) / view.value.scale;

        view.value.centerX -= dx;
        view.value.centerY += dy;
        dragStart.value = screenPoint;

        redraw();
        return;
    }

    if (props.tool === "edit" && selectedPoint.value && event.buttons === 1) {
        selectedPoint.value.x = Number(worldPoint.x);
        selectedPoint.value.y = Number(worldPoint.y);
        redraw();
        return;
    }

    redraw();
}

function onWheel(event) {
    if (!props.enabled) return;

    const screenPoint = getMouseScreen(event);
    const before = screenToWorld(screenPoint);

    const zoomFactor = event.deltaY < 0 ? 1.1 : 0.9;
    view.value.scale *= zoomFactor;

    const after = screenToWorld(screenPoint);

    view.value.centerX += before.x - after.x;
    view.value.centerY += before.y - after.y;

    redraw();
}

function drawGrid(ctx) {
    const canvas = getCanvas();
    if (!canvas) return;

    ctx.save();
    // ctx.clearRect(0, 0, canvas.width, canvas.height);

    const spacing = 1;
    const startWorld = screenToWorld({ x: 0, y: canvas.height });
    const endWorld = screenToWorld({ x: canvas.width, y: 0 });

    ctx.strokeStyle = "rgba(148, 163, 184, 0.18)";
    ctx.lineWidth = 1;

    for (let x = Math.floor(startWorld.x); x <= Math.ceil(endWorld.x); x += spacing) {
        const a = worldToScreen({ x, y: startWorld.y });
        const b = worldToScreen({ x, y: endWorld.y });

        ctx.beginPath();
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(b.x, b.y);
        ctx.stroke();
    }

    for (let y = Math.floor(startWorld.y); y <= Math.ceil(endWorld.y); y += spacing) {
        const a = worldToScreen({ x: startWorld.x, y });
        const b = worldToScreen({ x: endWorld.x, y });

        ctx.beginPath();
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(b.x, b.y);
        ctx.stroke();
    }

    ctx.restore();
}

function drawColumns(ctx) {
    ctx.save();

    props.columns.forEach((column) => {
        if (!Number.isFinite(Number(column.x)) || !Number.isFinite(Number(column.y))) return;

        const point = worldToScreen({
            x: Number(column.x),
            y: Number(column.y),
        });

        ctx.fillStyle = "#f97316";
        ctx.strokeStyle = "#fed7aa";
        ctx.lineWidth = 1.5;

        ctx.beginPath();
        ctx.arc(point.x, point.y, 5, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = "#ffffff";
        ctx.font = "12px Arial";
        ctx.fillText(String(column.column), point.x + 7, point.y - 7);
    });

    ctx.restore();
}

function drawPolygon(ctx, polygon, index) {
    if (!polygon.nodes?.length) return;

    ctx.save();

    ctx.strokeStyle = "#38bdf8";
    ctx.fillStyle = "rgba(14, 165, 233, 0.18)";
    ctx.lineWidth = 2;

    ctx.beginPath();

    polygon.nodes.forEach((node, nodeIndex) => {
        const point = worldToScreen(node);

        if (nodeIndex === 0) {
            ctx.moveTo(point.x, point.y);
        } else {
            ctx.lineTo(point.x, point.y);
        }
    });

    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    polygon.nodes.forEach((node) => {
        const point = worldToScreen(node);

        ctx.fillStyle = selectedPoint.value === node ? "#facc15" : "#22d3ee";
        ctx.beginPath();
        ctx.arc(point.x, point.y, 4, 0, Math.PI * 2);
        ctx.fill();
    });

    const first = worldToScreen(polygon.nodes[0]);
    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 13px Arial";
    ctx.fillText(`Z${index + 1}`, first.x + 8, first.y + 8);

    ctx.restore();
}

function drawCurrentPolygon(ctx) {
    if (!currentPoints.value.length) return;

    ctx.save();

    ctx.strokeStyle = "#a78bfa";
    ctx.lineWidth = 2;
    ctx.setLineDash([6, 4]);

    ctx.beginPath();

    currentPoints.value.forEach((node, index) => {
        const point = worldToScreen(node);

        if (index === 0) {
            ctx.moveTo(point.x, point.y);
        } else {
            ctx.lineTo(point.x, point.y);
        }
    });

    const last = currentPoints.value[currentPoints.value.length - 1];
    const lastScreen = worldToScreen(last);
    const mouseScreen = worldToScreen(mouseWorld.value);

    ctx.lineTo(mouseScreen.x, mouseScreen.y);
    ctx.stroke();

    currentPoints.value.forEach((node) => {
        const point = worldToScreen(node);

        ctx.fillStyle = "#a78bfa";
        ctx.beginPath();
        ctx.arc(point.x, point.y, 4, 0, Math.PI * 2);
        ctx.fill();
    });

    ctx.restore();
}

function drawHud(ctx) {
    const canvas = getCanvas();
    if (!canvas) return;

    ctx.save();

    ctx.fillStyle = "rgba(15, 23, 42, 0.78)";
    ctx.fillRect(12, 12, 280, 78);

    ctx.fillStyle = "#e5e7eb";
    ctx.font = "12px Arial";
    ctx.fillText(`Herramienta: ${props.tool}`, 22, 34);
    ctx.fillText(`Columnas: ${props.columns.length}`, 22, 52);
    ctx.fillText(`Polígonos: ${polygons.value.length}`, 22, 70);

    if (props.tool === "draw") {
        ctx.fillStyle = "#bfdbfe";
        ctx.fillText("Click para puntos. Click cerca del primero para cerrar. Esc cancela.", 22, 88);
    }

    ctx.restore();
}

function redraw() {
    const ctx = getContext();
    const canvas = getCanvas();

    if (!ctx || !canvas) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    withDrawableClip(ctx, () => {
        drawGrid(ctx);
        drawColumns(ctx);

        polygons.value.forEach((polygon, index) => {
            drawPolygon(ctx, polygon, index);
        });

        drawCurrentPolygon(ctx);
    });

    // drawHud(ctx);
}

function onKeyDown(event) {
    if (!props.enabled) return;
    if (event.key !== "Escape") return;

    const tagName = event.target?.tagName?.toLowerCase();

    if (["input", "textarea", "select"].includes(tagName)) return;

    event.preventDefault();
    event.stopPropagation();

    cancelCurrentDrawing();
}

watch(
    () => props.columns,
    () => {
        nextTick(() => {
            fitColumns();
        });
    },
    { deep: true, immediate: true }
);

watch(
    () => props.clearSignal,
    () => {
        clearPolygons();
    }
);

watch(
    () => props.fitSignal,
    () => {
        fitColumns();
    }
);

watch(
    () => props.tool,
    () => {
        redraw();
    }
);

onMounted(() => {
    nextTick(() => {
        resizeCanvas();
        fitColumns();
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
.foundation-overlay {
    position: absolute;
    inset: 0;
    z-index: 50;
    width: 100%;
    height: 100%;
    pointer-events: none;
    background: transparent;
}

.foundation-overlay.active {
    pointer-events: auto;
}
</style>