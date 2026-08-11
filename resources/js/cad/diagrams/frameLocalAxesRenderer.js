function getAllFrames(CADSystem) {
    const frames = [];

    if (Array.isArray(CADSystem.shapes)) {
        frames.push(...CADSystem.shapes);
    }

    if (Array.isArray(CADSystem.parametricModels)) {
        CADSystem.parametricModels.forEach((parametric) => {
            if (Array.isArray(parametric.shapes)) {
                frames.push(...parametric.shapes);
            }
        });
    }

    return frames;
}

function getNodePosition(node) {
    return {
        x: Number(node?.position?.x ?? 0),
        y: Number(node?.position?.y ?? 0),
        z: Number(node?.position?.z ?? 0),
    };
}

function subtract(a, b) {
    return {
        x: a.x - b.x,
        y: a.y - b.y,
        z: a.z - b.z,
    };
}

function add(a, b) {
    return {
        x: a.x + b.x,
        y: a.y + b.y,
        z: a.z + b.z,
    };
}

function scale(v, factor) {
    return {
        x: v.x * factor,
        y: v.y * factor,
        z: v.z * factor,
    };
}

function dot(a, b) {
    return a.x * b.x + a.y * b.y + a.z * b.z;
}

function cross(a, b) {
    return {
        x: a.y * b.z - a.z * b.y,
        y: a.z * b.x - a.x * b.z,
        z: a.x * b.y - a.y * b.x,
    };
}

function length(v) {
    return Math.sqrt(dot(v, v));
}

function normalize(v) {
    const len = length(v);

    if (len < 1e-9) {
        return { x: 0, y: 0, z: 0 };
    }

    return {
        x: v.x / len,
        y: v.y / len,
        z: v.z / len,
    };
}

function getFrameLength(frame) {
    const p1 = getNodePosition(frame.node1);
    const p2 = getNodePosition(frame.node2);

    return length(subtract(p2, p1)) || 1;
}

function getFrameMidPoint(frame) {
    const p1 = getNodePosition(frame.node1);
    const p2 = getNodePosition(frame.node2);

    return {
        x: (p1.x + p2.x) / 2,
        y: (p1.y + p2.y) / 2,
        z: (p1.z + p2.z) / 2,
    };
}

function getFrameLocalAxes(frame) {
    const p1 = getNodePosition(frame.node1);
    const p2 = getNodePosition(frame.node2);

    const axis1 = normalize(subtract(p2, p1));

    // Referencia global Z para generar ejes locales aproximados.
    // Más adelante se puede reemplazar por el ángulo local real tipo ETABS.
    const globalZ = { x: 0, y: 0, z: 1 };
    const globalY = { x: 0, y: 1, z: 0 };
    const globalX = { x: 1, y: 0, z: 0 };

    let axis2 = cross(globalZ, axis1);

    // Si el frame es vertical o casi paralelo a Z, usamos otra referencia.
    if (length(axis2) < 1e-6) {
        axis2 = cross(globalY, axis1);
    }

    if (length(axis2) < 1e-6) {
        axis2 = cross(globalX, axis1);
    }

    axis2 = normalize(axis2);

    const axis3 = normalize(cross(axis1, axis2));

    return {
        axis1,
        axis2,
        axis3,
    };
}

function isSelectedFrame(frame, CADSystem) {
    return (
        frame?.selected === true ||
        frame?.isSelected === true ||
        CADSystem.selectedBeams?.some?.((item) => item?.id === frame?.id) ||
        CADSystem.currentState?.selectedBeams?.some?.((item) => item?.id === frame?.id)
    );
}

function projectWorldPoint(renderer, CADSystem, point) {
    return renderer.projectPoint(
        {
            position: point,
        },
        CADSystem
    );
}

function drawArrowHead(ctx, from, to, color) {
    const dx = to.x - from.x;
    const dy = to.y - from.y;
    const angle = Math.atan2(dy, dx);
    const size = 6;

    ctx.save();

    ctx.fillStyle = color;

    ctx.beginPath();
    ctx.moveTo(to.x, to.y);
    ctx.lineTo(
        to.x - size * Math.cos(angle - Math.PI / 6),
        to.y - size * Math.sin(angle - Math.PI / 6)
    );
    ctx.lineTo(
        to.x - size * Math.cos(angle + Math.PI / 6),
        to.y - size * Math.sin(angle + Math.PI / 6)
    );
    ctx.closePath();
    ctx.fill();

    ctx.restore();
}

function drawOutOfPlaneAxis(ctx, origin, label, color, index = 0) {
    const offsetMap = {
        1: { x: 0, y: -18 },
        2: { x: 18, y: 0 },
        3: { x: 0, y: 18 },
    };

    const offset = offsetMap[index] || { x: 0, y: 0 };

    const x = origin.x + offset.x;
    const y = origin.y + offset.y;

    ctx.save();

    ctx.strokeStyle = color;
    ctx.fillStyle = color;
    ctx.lineWidth = 1.5;

    ctx.beginPath();
    ctx.arc(x, y, 6, 0, Math.PI * 2);
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(x, y, 2, 0, Math.PI * 2);
    ctx.fill();

    ctx.font = "bold 10px Arial";
    ctx.textAlign = "left";
    ctx.textBaseline = "middle";
    ctx.fillText(label, x + 8, y);

    ctx.restore();
}

function drawProjectedAxis({
    CADSystem,
    renderer,
    ctx,
    origin3D,
    axis,
    axisLength,
    label,
    color,
    index,
}) {
    const end3D = add(origin3D, scale(axis, axisLength));

    const p0 = projectWorldPoint(renderer, CADSystem, origin3D);
    const p1 = projectWorldPoint(renderer, CADSystem, end3D);

    const dx = p1.x - p0.x;
    const dy = p1.y - p0.y;
    const projectedLength = Math.sqrt(dx * dx + dy * dy);

    // Si el eje sale del plano de vista, se verá casi como punto.
    if (projectedLength < 5) {
        drawOutOfPlaneAxis(ctx, p0, label, color, index);
        return;
    }

    ctx.save();

    ctx.strokeStyle = color;
    ctx.fillStyle = color;
    ctx.lineWidth = 2;

    ctx.beginPath();
    ctx.moveTo(p0.x, p0.y);
    ctx.lineTo(p1.x, p1.y);
    ctx.stroke();

    drawArrowHead(ctx, p0, p1, color);

    ctx.font = "bold 10px Arial";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(label, p1.x + 8, p1.y - 8);

    ctx.restore();
}

function drawFrameLocalAxes({ CADSystem, renderer, frame }) {
    if (!frame?.node1 || !frame?.node2) return;

    const display = CADSystem.frameDiagramDisplay || {};

    if (display.selectedOnly && !isSelectedFrame(frame, CADSystem)) {
        return;
    }

    if (typeof renderer.shouldDrawBeam === "function") {
        if (!renderer.shouldDrawBeam(frame, CADSystem)) return;
    }

    const ctx = CADSystem.ctx;
    const origin3D = getFrameMidPoint(frame);
    const frameLength = getFrameLength(frame);

    const axisLength = Math.min(Math.max(frameLength * 0.18, 0.35), 0.85);

    const axes = getFrameLocalAxes(frame);

    drawProjectedAxis({
        CADSystem,
        renderer,
        ctx,
        origin3D,
        axis: axes.axis1,
        axisLength,
        label: "1",
        color: "#ef4444",
        index: 1,
    });

    drawProjectedAxis({
        CADSystem,
        renderer,
        ctx,
        origin3D,
        axis: axes.axis2,
        axisLength,
        label: "2",
        color: "#22c55e",
        index: 2,
    });

    drawProjectedAxis({
        CADSystem,
        renderer,
        ctx,
        origin3D,
        axis: axes.axis3,
        axisLength,
        label: "3",
        color: "#3b82f6",
        index: 3,
    });
}

export function drawFrameLocalAxes2D({ CADSystem, renderer, ctx }) {
    const display = CADSystem.frameDiagramDisplay || {};

    if (!display.showLocalAxes) return;

    const frames = getAllFrames(CADSystem);

    if (!frames.length) return;

    ctx.save();

    frames.forEach((frame) => {
        drawFrameLocalAxes({
            CADSystem,
            renderer,
            frame,
        });
    });

    ctx.restore();
}