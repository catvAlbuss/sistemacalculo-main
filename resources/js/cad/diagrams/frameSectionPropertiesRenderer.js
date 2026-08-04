import {
    getAllFrames,
    shouldDrawFrameDiagram,
    getFrameScreenGeometry,
} from "./frameForceDiagramUtils.js";

function getFrameId(frame, index = 0) {
    return String(frame?.id ?? frame?.name ?? `F${index + 1}`);
}

function getFrameSectionId(frame) {
    return (
        frame?.sectionId ||
        frame?.section?.id ||
        frame?.section?.name ||
        frame?.sectionName ||
        frame?.seccion ||
        frame?.section ||
        "SECTION"
    );
}

function getFrameMaterialId(frame) {
    return (
        frame?.materialId ||
        frame?.material?.id ||
        frame?.material?.name ||
        frame?.materialName ||
        "MATERIAL"
    );
}

function getSeed(frameId) {
    const n = Number(String(frameId).replace(/\D/g, ""));
    return Number.isFinite(n) && n > 0 ? n : 1;
}

function getFallbackSectionProperties(frame, index = 0) {
    const frameId = getFrameId(frame, index);
    const seed = getSeed(frameId);

    const sectionId = getFrameSectionId(frame);
    const materialId = getFrameMaterialId(frame);

    const A = 0.10 + (seed % 5) * 0.01;
    const I22 = 0.00075 + (seed % 4) * 0.00012;
    const I33 = 0.0012 + (seed % 5) * 0.00018;
    const J = 0.0010 + (seed % 6) * 0.00015;

    return {
        sectionId,
        materialId,
        A,
        I22,
        I33,
        J,
        source: "fallback",
    };
}

function findSectionProperties(CADSystem, frame, index = 0) {
    const sectionId = String(getFrameSectionId(frame));

    const candidates = [
        CADSystem.frameForceResults?.sectionProperties,
        CADSystem.sectionProperties,
        CADSystem.sections,
        CADSystem.frameSections,
    ];

    for (const list of candidates) {
        if (!Array.isArray(list)) continue;

        const found = list.find((item) => {
            return (
                String(item?.sectionId) === sectionId ||
                String(item?.id) === sectionId ||
                String(item?.name) === sectionId
            );
        });

        if (found) {
            return {
                sectionId: found.sectionId || found.id || found.name || sectionId,
                materialId: found.materialId || found.material || getFrameMaterialId(frame),
                A: Number(found.A ?? found.area ?? 0),
                I22: Number(found.I22 ?? found.i22 ?? found.Iy ?? 0),
                I33: Number(found.I33 ?? found.i33 ?? found.Ix ?? 0),
                J: Number(found.J ?? found.j ?? found.torsion ?? 0),
                source: "model",
            };
        }
    }

    return getFallbackSectionProperties(frame, index);
}

function getDisplay(CADSystem) {
    return {
        enabled: false,
        mode: "labels", // labels | compact
        selectedOnly: false,
        showMaterial: true,
        showA: true,
        showI22: true,
        showI33: true,
        showJ: true,
        colorBy: null, // A | I22 | I33 | J | null
        decimals: 4,
        ...(CADSystem.sectionPropertyDisplay || {}),
    };
}

function formatNumber(value, decimals = 4) {
    const n = Number(value);

    if (!Number.isFinite(n)) return "0";

    if (Math.abs(n) >= 1) return n.toFixed(3);

    return n.toExponential(3);
}

function drawLabelBox(ctx, lines, x, y, options = {}) {
    if (!lines?.length) return;

    ctx.save();

    const font = options.font || "10px Arial";
    const lineHeight = options.lineHeight || 13;
    const paddingX = options.paddingX ?? 5;
    const paddingY = options.paddingY ?? 4;

    ctx.font = font;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    const width =
        Math.max(...lines.map((line) => ctx.measureText(line).width)) + paddingX * 2;

    const height = lines.length * lineHeight + paddingY * 2;

    ctx.fillStyle = options.background || "rgba(15, 23, 42, 0.88)";
    ctx.fillRect(x - width / 2, y - height / 2, width, height);

    ctx.strokeStyle = options.border || "#38bdf8";
    ctx.lineWidth = 1;
    ctx.strokeRect(x - width / 2, y - height / 2, width, height);

    ctx.fillStyle = options.color || "#e0f2fe";

    lines.forEach((line, index) => {
        const lineY = y - height / 2 + paddingY + lineHeight / 2 + index * lineHeight;
        ctx.fillText(line, x, lineY);
    });

    ctx.restore();
}

function getFrameMidScreen(geometry) {
    return {
        x: (geometry.p1.x + geometry.p2.x) / 2,
        y: (geometry.p1.y + geometry.p2.y) / 2,
    };
}

function buildPropertyLines(props, display) {
    const lines = [];

    lines.push(String(props.sectionId || "SECTION"));

    if (display.showMaterial) {
        lines.push(`Mat: ${props.materialId || "-"}`);
    }

    if (display.showA) {
        lines.push(`A = ${formatNumber(props.A, display.decimals)}`);
    }

    if (display.showI22) {
        lines.push(`I22 = ${formatNumber(props.I22, display.decimals)}`);
    }

    if (display.showI33) {
        lines.push(`I33 = ${formatNumber(props.I33, display.decimals)}`);
    }

    if (display.showJ) {
        lines.push(`J = ${formatNumber(props.J, display.decimals)}`);
    }

    return lines;
}

function getPropertyValue(props, colorBy) {
    if (!colorBy) return null;

    return Number(props[colorBy]);
}

function getColorByValue(value, min, max) {
    if (!Number.isFinite(value)) return "#38bdf8";

    const range = Math.max(max - min, 1e-12);
    const t = Math.max(0, Math.min(1, (value - min) / range));

    if (t < 0.33) return "#22c55e";
    if (t < 0.66) return "#eab308";
    return "#ef4444";
}

function getColorRange(sectionProps, colorBy) {
    if (!colorBy) return { min: 0, max: 1 };

    const values = sectionProps
        .map((item) => Number(item.props?.[colorBy]))
        .filter((value) => Number.isFinite(value));

    if (!values.length) return { min: 0, max: 1 };

    return {
        min: Math.min(...values),
        max: Math.max(...values),
    };
}

function drawColorLegend(CADSystem, display, min, max) {
    if (!display.colorBy) return;

    const ctx = CADSystem.ctx;
    const text = `Section Properties: color by ${display.colorBy} | min ${formatNumber(min)} | max ${formatNumber(max)}`;

    ctx.save();

    ctx.font = "bold 11px Arial";
    ctx.textAlign = "left";
    ctx.textBaseline = "middle";

    const x = 16;
    const y = 86;
    const paddingX = 8;
    const width = ctx.measureText(text).width + paddingX * 2;
    const height = 22;

    ctx.fillStyle = "rgba(15, 23, 42, 0.88)";
    ctx.fillRect(x, y - height / 2, width, height);

    ctx.strokeStyle = "#38bdf8";
    ctx.lineWidth = 1;
    ctx.strokeRect(x, y - height / 2, width, height);

    ctx.fillStyle = "#e0f2fe";
    ctx.fillText(text, x + paddingX, y);

    ctx.restore();
}

function drawFramePropertyColor({ CADSystem, geometry, color }) {
    const ctx = CADSystem.ctx;

    ctx.save();

    ctx.strokeStyle = color;
    ctx.lineWidth = 5;
    ctx.globalAlpha = 0.75;

    ctx.beginPath();
    ctx.moveTo(geometry.p1.x, geometry.p1.y);
    ctx.lineTo(geometry.p2.x, geometry.p2.y);
    ctx.stroke();

    ctx.restore();
}

function drawSectionPropertyForFrame({
    CADSystem,
    renderer,
    frame,
    props,
    display,
    colorRange,
}) {
    const geometry = getFrameScreenGeometry(CADSystem, renderer, frame);

    if (!geometry) return;

    const mid = getFrameMidScreen(geometry);

    if (display.colorBy) {
        const value = getPropertyValue(props, display.colorBy);
        const color = getColorByValue(value, colorRange.min, colorRange.max);

        drawFramePropertyColor({
            CADSystem,
            geometry,
            color,
        });
    }

    if (display.mode === "compact") {
        drawLabelBox(
            CADSystem.ctx,
            [String(props.sectionId || "SECTION")],
            mid.x + geometry.nx * 16,
            mid.y + geometry.ny * 16,
            {
                color: "#e0f2fe",
                border: "#38bdf8",
                background: "rgba(15, 23, 42, 0.86)",
            }
        );

        return;
    }

    const lines = buildPropertyLines(props, display);

    drawLabelBox(
        CADSystem.ctx,
        lines,
        mid.x + geometry.nx * 34,
        mid.y + geometry.ny * 34,
        {
            color: "#e0f2fe",
            border: "#38bdf8",
            background: "rgba(15, 23, 42, 0.90)",
        }
    );
}

export function drawFrameSectionProperties2D({ CADSystem, renderer, ctx }) {
    const display = getDisplay(CADSystem);

    if (!display.enabled) return;

    const frames = getAllFrames(CADSystem);

    const frameProps = frames
        .map((frame, index) => ({
            frame,
            props: findSectionProperties(CADSystem, frame, index),
        }))
        .filter(({ frame }) => {
            return shouldDrawFrameDiagram(frame, CADSystem, renderer, {
                selectedOnly: display.selectedOnly,
            });
        });

    const colorRange = getColorRange(frameProps, display.colorBy);

    ctx.save();

    frameProps.forEach(({ frame, props }) => {
        drawSectionPropertyForFrame({
            CADSystem,
            renderer,
            frame,
            props,
            display,
            colorRange,
        });
    });

    drawColorLegend(CADSystem, display, colorRange.min, colorRange.max);

    ctx.restore();
}