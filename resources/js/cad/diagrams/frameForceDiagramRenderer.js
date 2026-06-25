import {
    validateFrameForceResults,
    getFrameForceComponent,
} from "../analysis/frameForceResultsContract.js";

import {
    getFrameDiagramDisplay,
    getComponentStyle,
    getAllFrames,
    shouldDrawFrameDiagram,
    getFrameForceRecord,
    getMaxAbsValue,
    getRecordExtrema,
    getFrameScreenGeometry,
    getScalePxPerUnit,
    buildDiagramPoints,
    formatFrameDiagramValue,
    getUnitLabel,
    almostSamePoint,
} from "./frameForceDiagramUtils.js";

function drawLabelBox(ctx, text, x, y, options = {}) {
    if (!text) return;

    const font = options.font || "10px Arial";
    const paddingX = options.paddingX ?? 4;
    const paddingY = options.paddingY ?? 3;

    ctx.save();

    ctx.font = font;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    const width = ctx.measureText(text).width + paddingX * 2;
    const height = 14 + paddingY;

    ctx.fillStyle = options.background || "rgba(15, 23, 42, 0.82)";
    ctx.fillRect(x - width / 2, y - height / 2, width, height);

    ctx.strokeStyle = options.border || "rgba(255, 255, 255, 0.35)";
    ctx.lineWidth = 1;
    ctx.strokeRect(x - width / 2, y - height / 2, width, height);

    ctx.fillStyle = options.color || "#ffffff";
    ctx.fillText(text, x, y);

    ctx.restore();
}

function drawDiagramLegend({ CADSystem, results, componentInfo, display }) {
    if (display.showLegend === false) return;

    const ctx = CADSystem.ctx;
    const unit = getUnitLabel(results, componentInfo);
    const component = display.component || "M3";
    const caseOrCombo = display.comboId || display.caseId || "CM";
    const source = results.source || display.source || "mock";

    const text = `Frame Forces: ${caseOrCombo} | ${component} ${unit ? `(${unit})` : ""} | ${source}`;

    ctx.save();

    ctx.font = "bold 11px Arial";
    ctx.textAlign = "left";
    ctx.textBaseline = "middle";

    const x = 16;
    const y = 58;
    const paddingX = 8;
    const width = ctx.measureText(text).width + paddingX * 2;
    const height = 22;

    ctx.fillStyle = "rgba(15, 23, 42, 0.88)";
    ctx.fillRect(x, y - height / 2, width, height);

    ctx.strokeStyle = "rgba(34, 211, 238, 0.65)";
    ctx.lineWidth = 1;
    ctx.strokeRect(x, y - height / 2, width, height);

    ctx.fillStyle = "#e0f2fe";
    ctx.fillText(text, x + paddingX, y);

    ctx.restore();
}

function getPointsForValueLabels(points, extrema, display) {
    const mode = display.valueLabelMode || "max-min";

    if (!display.showValues || mode === "none") return [];

    if (mode === "all") {
        if (points.length <= 7) return points;

        const step = Math.ceil(points.length / 7);
        return points.filter((_, index) => index % step === 0 || index === points.length - 1);
    }

    if (mode === "ends") {
        return points.filter((_, index) => index === 0 || index === points.length - 1);
    }

    const labels = [];

    if (extrema.maxAbs) {
        const p = points.find((point) => {
            return Math.abs(point.relativeStation - extrema.maxAbs.relativeStation) < 1e-6;
        });

        if (p) labels.push(p);
    }

    if (extrema.max && !labels.some((item) => almostSamePoint(item, extrema.max))) {
        const p = points.find((point) => {
            return Math.abs(point.relativeStation - extrema.max.relativeStation) < 1e-6;
        });

        if (p) labels.push(p);
    }

    if (extrema.min && !labels.some((item) => almostSamePoint(item, extrema.min))) {
        const p = points.find((point) => {
            return Math.abs(point.relativeStation - extrema.min.relativeStation) < 1e-6;
        });

        if (p) labels.push(p);
    }

    return labels;
}

function drawFrameDiagramFill(ctx, geometry, points, style) {
    if (!points.length) return;

    ctx.save();

    ctx.fillStyle = style.fill;

    ctx.beginPath();
    ctx.moveTo(geometry.p1.x, geometry.p1.y);

    points.forEach((point) => {
        ctx.lineTo(point.x, point.y);
    });

    ctx.lineTo(geometry.p2.x, geometry.p2.y);
    ctx.closePath();
    ctx.fill();

    ctx.restore();
}

function drawFrameDiagramCurve(ctx, points, style) {
    if (!points.length) return;

    ctx.save();

    ctx.strokeStyle = style.stroke;
    ctx.lineWidth = 2;

    ctx.beginPath();

    points.forEach((point, index) => {
        if (index === 0) {
            ctx.moveTo(point.x, point.y);
        } else {
            ctx.lineTo(point.x, point.y);
        }
    });

    ctx.stroke();

    ctx.restore();
}

function drawFrameDiagramStationLines(ctx, points, style) {
    ctx.save();

    ctx.strokeStyle = style.station;
    ctx.lineWidth = 1;

    points.forEach((point) => {
        ctx.beginPath();
        ctx.moveTo(point.baseX, point.baseY);
        ctx.lineTo(point.x, point.y);
        ctx.stroke();
    });

    ctx.restore();
}

function drawFrameZeroLine(ctx, geometry, style) {
    ctx.save();

    ctx.strokeStyle = "rgba(255, 255, 255, 0.28)";
    ctx.lineWidth = 1;
    ctx.setLineDash([4, 3]);

    ctx.beginPath();
    ctx.moveTo(geometry.p1.x, geometry.p1.y);
    ctx.lineTo(geometry.p2.x, geometry.p2.y);
    ctx.stroke();

    ctx.setLineDash([]);

    ctx.restore();
}

function drawValueLabels({
    CADSystem,
    ctx,
    points,
    extrema,
    display,
    componentInfo,
    geometry,
    style,
}) {
    const labelPoints = getPointsForValueLabels(points, extrema, display);

    labelPoints.forEach((point) => {
        const valueText = formatFrameDiagramValue(
            CADSystem,
            point.value,
            componentInfo,
            display.decimals
        );

        drawLabelBox(
            ctx,
            valueText,
            point.x + geometry.nx * 14,
            point.y + geometry.ny * 14,
            {
                color: style.text,
                border: style.stroke,
                background: "rgba(15, 23, 42, 0.86)",
            }
        );
    });
}

function drawMaxMinMarkers({
    CADSystem,
    ctx,
    points,
    extrema,
    display,
    componentInfo,
    geometry,
}) {
    if (!display.showMaxMin) return;

    const drawMarker = (extreme, label, color) => {
        if (!extreme) return;

        const point = points.find((item) => {
            return Math.abs(item.relativeStation - extreme.relativeStation) < 1e-6;
        });

        if (!point) return;

        const valueText = formatFrameDiagramValue(
            CADSystem,
            extreme.value,
            componentInfo,
            display.decimals
        );

        ctx.save();

        ctx.beginPath();
        ctx.arc(point.x, point.y, 4, 0, Math.PI * 2);
        ctx.fillStyle = color;
        ctx.fill();

        ctx.strokeStyle = "#111827";
        ctx.lineWidth = 1;
        ctx.stroke();

        ctx.restore();

        drawLabelBox(
            ctx,
            `${label} ${valueText}`,
            point.x + geometry.nx * 28,
            point.y + geometry.ny * 28,
            {
                font: "bold 10px Arial",
                color,
                border: color,
                background: "rgba(15, 23, 42, 0.90)",
            }
        );
    };

    drawMarker(extrema.max, "max", "#facc15");

    if (
        extrema.min &&
        extrema.max &&
        Math.abs(extrema.min.relativeStation - extrema.max.relativeStation) > 1e-6
    ) {
        drawMarker(extrema.min, "min", "#f97316");
    }
}

function getMomentSign(value) {
    return Number(value || 0) >= 0 ? "positive" : "negative";
}

function interpolateZeroPoint(a, b) {
    const v1 = Number(a.value || 0);
    const v2 = Number(b.value || 0);

    const denominator = Math.abs(v1) + Math.abs(v2);

    if (denominator < 1e-9) {
        return null;
    }

    const ratio = Math.abs(v1) / denominator;

    return {
        baseX: a.baseX + (b.baseX - a.baseX) * ratio,
        baseY: a.baseY + (b.baseY - a.baseY) * ratio,
        x: a.baseX + (b.baseX - a.baseX) * ratio,
        y: a.baseY + (b.baseY - a.baseY) * ratio,
        value: 0,
        station: a.station + (b.station - a.station) * ratio,
        relativeStation:
            a.relativeStation + (b.relativeStation - a.relativeStation) * ratio,
        isZeroCrossing: true,
    };
}

// Moment M3 diagram functions

function appendMomentSegment(segments, sign, segmentPoints) {
    if (!segmentPoints || segmentPoints.length < 2) return;

    const last = segments[segments.length - 1];

    if (last && last.sign === sign) {
        const lastPoint = last.points[last.points.length - 1];
        const firstNewPoint = segmentPoints[0];

        const sameJoint =
            Math.abs(lastPoint.relativeStation - firstNewPoint.relativeStation) <
            1e-6;

        if (sameJoint) {
            last.points.push(...segmentPoints.slice(1));
            return;
        }
    }

    segments.push({
        sign,
        points: [...segmentPoints],
    });
}

function buildMomentM3Segments(points) {
    const segments = [];

    if (!Array.isArray(points) || points.length < 2) {
        return segments;
    }

    const eps = 1e-9;

    for (let i = 0; i < points.length - 1; i++) {
        const a = points[i];
        const b = points[i + 1];

        const av = Number(a.value || 0);
        const bv = Number(b.value || 0);

        if (Math.abs(av) < eps && Math.abs(bv) < eps) {
            continue;
        }

        const changesSign = av * bv < 0;

        if (changesSign) {
            const zero = interpolateZeroPoint(a, b);

            if (!zero) continue;

            appendMomentSegment(segments, getMomentSign(av), [a, zero]);
            appendMomentSegment(segments, getMomentSign(bv), [zero, b]);

            continue;
        }

        const sign = Math.abs(av) >= eps ? getMomentSign(av) : getMomentSign(bv);

        appendMomentSegment(segments, sign, [a, b]);
    }

    return segments;
}

function drawMomentArea(ctx, points, fillStyle) {
    if (!points || points.length < 2) return;

    ctx.save();

    ctx.fillStyle = fillStyle;

    ctx.beginPath();

    ctx.moveTo(points[0].baseX, points[0].baseY);

    points.forEach((point) => {
        ctx.lineTo(point.x, point.y);
    });

    for (let i = points.length - 1; i >= 0; i--) {
        ctx.lineTo(points[i].baseX, points[i].baseY);
    }

    ctx.closePath();
    ctx.fill();

    ctx.restore();
}

function drawMomentCurveBySign(ctx, segments, style) {
    if (!segments || !segments.length) return;

    ctx.save();

    segments.forEach((segment) => {
        const points = segment.points || [];

        if (points.length < 2) return;

        ctx.strokeStyle =
            segment.sign === "positive"
                ? style.positiveStroke || style.stroke
                : style.negativeStroke || style.stroke;

        ctx.lineWidth = 2.2;

        ctx.beginPath();

        points.forEach((point, index) => {
            if (index === 0) {
                ctx.moveTo(point.x, point.y);
            } else {
                ctx.lineTo(point.x, point.y);
            }
        });

        ctx.stroke();
    });

    ctx.restore();
}

function drawMomentM3Diagram({
    CADSystem,
    ctx,
    geometry,
    points,
    extrema,
    display,
    componentInfo,
    style,
}) {
    if (!points.length) return;

    const segments = buildMomentM3Segments(points);

    if (display.showZeroLine) {
        drawFrameZeroLine(ctx, geometry, style);
    }

    if (display.filled) {
        segments.forEach((segment) => {
            const fillStyle =
                segment.sign === "positive"
                    ? style.positiveFill || style.fill
                    : style.negativeFill || style.fill;

            drawMomentArea(ctx, segment.points, fillStyle);
        });
    }

    drawMomentCurveBySign(ctx, segments, style);

    if (display.showStationLines) {
        drawFrameDiagramStationLines(ctx, points, style);
    }

    drawValueLabels({
        CADSystem,
        ctx,
        points,
        extrema,
        display,
        componentInfo,
        geometry,
        style,
    });

    drawMomentM3MaxMinMarkers({
        CADSystem,
        ctx,
        points,
        extrema,
        display,
        componentInfo,
        geometry,
        style,
    });
}

function drawMomentM3MaxMinMarkers({
    CADSystem,
    ctx,
    points,
    extrema,
    display,
    componentInfo,
    geometry,
    style,
}) {
    if (!display.showMaxMin) return;

    const drawMarker = (extreme, label, color) => {
        if (!extreme) return;

        const point = points.find((item) => {
            return Math.abs(item.relativeStation - extreme.relativeStation) < 1e-6;
        });

        if (!point) return;

        const valueText = formatFrameDiagramValue(
            CADSystem,
            extreme.value,
            componentInfo,
            display.decimals
        );

        ctx.save();

        ctx.beginPath();
        ctx.arc(point.x, point.y, 4.5, 0, Math.PI * 2);
        ctx.fillStyle = color;
        ctx.fill();

        ctx.strokeStyle = "#111827";
        ctx.lineWidth = 1.2;
        ctx.stroke();

        ctx.restore();

        drawLabelBox(
            ctx,
            `M3 ${label} ${valueText}`,
            point.x + geometry.nx * 34,
            point.y + geometry.ny * 34,
            {
                font: "bold 10px Arial",
                color,
                border: color,
                background: "rgba(15, 23, 42, 0.92)",
            }
        );
    };

    drawMarker(extrema.max, "max", style.maxColor || "#facc15");

    if (
        extrema.min &&
        extrema.max &&
        Math.abs(extrema.min.relativeStation - extrema.max.relativeStation) > 1e-6
    ) {
        drawMarker(extrema.min, "min", style.minColor || "#fb923c");
    }
}

// Shear V3 diagram functions

function getShearSign(value) {
    return Number(value || 0) >= 0 ? "positive" : "negative";
}

function appendShearSegment(segments, sign, segmentPoints) {
    if (!segmentPoints || segmentPoints.length < 2) return;

    const last = segments[segments.length - 1];

    if (last && last.sign === sign) {
        const lastPoint = last.points[last.points.length - 1];
        const firstNewPoint = segmentPoints[0];

        const sameJoint =
            Math.abs(lastPoint.relativeStation - firstNewPoint.relativeStation) < 1e-6;

        if (sameJoint) {
            last.points.push(...segmentPoints.slice(1));
            return;
        }
    }

    segments.push({
        sign,
        points: [...segmentPoints],
    });
}

function buildShearSegments(points) {
    const segments = [];

    if (!Array.isArray(points) || points.length < 2) {
        return segments;
    }

    const eps = 1e-9;

    for (let i = 0; i < points.length - 1; i++) {
        const a = points[i];
        const b = points[i + 1];

        const av = Number(a.value || 0);
        const bv = Number(b.value || 0);

        if (Math.abs(av) < eps && Math.abs(bv) < eps) {
            continue;
        }

        const changesSign = av * bv < 0;

        if (changesSign) {
            const zero = interpolateZeroPoint(a, b);

            if (!zero) continue;

            appendShearSegment(segments, getShearSign(av), [a, zero]);
            appendShearSegment(segments, getShearSign(bv), [zero, b]);

            continue;
        }

        const sign = Math.abs(av) >= eps ? getShearSign(av) : getShearSign(bv);

        appendShearSegment(segments, sign, [a, b]);
    }

    return segments;
}

function drawShearArea(ctx, points, fillStyle) {
    if (!points || points.length < 2) return;

    ctx.save();

    ctx.fillStyle = fillStyle;

    ctx.beginPath();
    ctx.moveTo(points[0].baseX, points[0].baseY);

    points.forEach((point) => {
        ctx.lineTo(point.x, point.y);
    });

    for (let i = points.length - 1; i >= 0; i--) {
        ctx.lineTo(points[i].baseX, points[i].baseY);
    }

    ctx.closePath();
    ctx.fill();

    ctx.restore();
}

function drawShearCurveBySign(ctx, segments, style) {
    if (!segments || !segments.length) return;

    ctx.save();

    segments.forEach((segment) => {
        const points = segment.points || [];

        if (points.length < 2) return;

        ctx.strokeStyle =
            segment.sign === "positive"
                ? style.positiveStroke || style.stroke
                : style.negativeStroke || style.stroke;

        ctx.lineWidth = 2.1;

        ctx.beginPath();

        points.forEach((point, index) => {
            if (index === 0) {
                ctx.moveTo(point.x, point.y);
            } else {
                ctx.lineTo(point.x, point.y);
            }
        });

        ctx.stroke();
    });

    ctx.restore();
}

function drawShearV3MaxMinMarkers({
    CADSystem,
    ctx,
    points,
    extrema,
    display,
    componentInfo,
    geometry,
    style,
}) {
    if (!display.showMaxMin) return;

    const drawMarker = (extreme, label, color) => {
        if (!extreme) return;

        const point = points.find((item) => {
            return Math.abs(item.relativeStation - extreme.relativeStation) < 1e-6;
        });

        if (!point) return;

        const valueText = formatFrameDiagramValue(
            CADSystem,
            extreme.value,
            componentInfo,
            display.decimals
        );

        ctx.save();

        ctx.beginPath();
        ctx.arc(point.x, point.y, 4.3, 0, Math.PI * 2);
        ctx.fillStyle = color;
        ctx.fill();

        ctx.strokeStyle = "#111827";
        ctx.lineWidth = 1.2;
        ctx.stroke();

        ctx.restore();

        drawLabelBox(
            ctx,
            `V3 ${label} ${valueText}`,
            point.x + geometry.nx * 30,
            point.y + geometry.ny * 30,
            {
                font: "bold 10px Arial",
                color,
                border: color,
                background: "rgba(15, 23, 42, 0.92)",
            }
        );
    };

    drawMarker(extrema.max, "max", style.maxColor || "#facc15");

    if (
        extrema.min &&
        extrema.max &&
        Math.abs(extrema.min.relativeStation - extrema.max.relativeStation) > 1e-6
    ) {
        drawMarker(extrema.min, "min", style.minColor || "#38bdf8");
    }
}

function drawShearV3Diagram({
    CADSystem,
    ctx,
    geometry,
    points,
    extrema,
    display,
    componentInfo,
    style,
}) {
    if (!points.length) return;

    const segments = buildShearSegments(points);

    if (display.showZeroLine) {
        drawFrameZeroLine(ctx, geometry, style);
    }

    if (display.filled) {
        segments.forEach((segment) => {
            const fillStyle =
                segment.sign === "positive"
                    ? style.positiveFill || style.fill
                    : style.negativeFill || style.fill;

            drawShearArea(ctx, segment.points, fillStyle);
        });
    }

    drawShearCurveBySign(ctx, segments, style);

    if (display.showStationLines) {
        drawFrameDiagramStationLines(ctx, points, style);
    }

    drawValueLabels({
        CADSystem,
        ctx,
        points,
        extrema,
        display,
        componentInfo,
        geometry,
        style,
    });

    drawShearV3MaxMinMarkers({
        CADSystem,
        ctx,
        points,
        extrema,
        display,
        componentInfo,
        geometry,
        style,
    });
}

// Axial force (P) diagram functions

function drawAxialPMaxMinMarkers({
    CADSystem,
    ctx,
    points,
    extrema,
    display,
    componentInfo,
    geometry,
    style,
}) {
    if (!display.showMaxMin) return;

    const drawMarker = (extreme, label, color) => {
        if (!extreme) return;

        const point = points.find((item) => {
            return Math.abs(item.relativeStation - extreme.relativeStation) < 1e-6;
        });

        if (!point) return;

        const valueText = formatFrameDiagramValue(
            CADSystem,
            extreme.value,
            componentInfo,
            display.decimals
        );

        const axialType = Number(extreme.value) >= 0 ? "T" : "C";

        ctx.save();

        ctx.beginPath();
        ctx.arc(point.x, point.y, 4.3, 0, Math.PI * 2);
        ctx.fillStyle = color;
        ctx.fill();

        ctx.strokeStyle = "#111827";
        ctx.lineWidth = 1.2;
        ctx.stroke();

        ctx.restore();

        drawLabelBox(
            ctx,
            `P ${label} ${valueText} ${axialType}`,
            point.x + geometry.nx * 30,
            point.y + geometry.ny * 30,
            {
                font: "bold 10px Arial",
                color,
                border: color,
                background: "rgba(15, 23, 42, 0.92)",
            }
        );
    };

    drawMarker(extrema.max, "max", style.maxColor || "#22c55e");

    if (
        extrema.min &&
        extrema.max &&
        Math.abs(extrema.min.relativeStation - extrema.max.relativeStation) > 1e-6
    ) {
        drawMarker(extrema.min, "min", style.minColor || "#ef4444");
    }
}

function drawAxialPDiagram({
    CADSystem,
    ctx,
    geometry,
    points,
    extrema,
    display,
    componentInfo,
    style,
}) {
    if (!points.length) return;

    // Reutilizamos la segmentación por signo del V3.
    // Para P: positivo = tracción, negativo = compresión.
    const segments = buildShearSegments(points);

    if (display.showZeroLine) {
        drawFrameZeroLine(ctx, geometry, style);
    }

    if (display.filled) {
        segments.forEach((segment) => {
            const fillStyle =
                segment.sign === "positive"
                    ? style.positiveFill || style.fill
                    : style.negativeFill || style.fill;

            drawShearArea(ctx, segment.points, fillStyle);
        });
    }

    drawShearCurveBySign(ctx, segments, style);

    if (display.showStationLines) {
        drawFrameDiagramStationLines(ctx, points, style);
    }

    drawValueLabels({
        CADSystem,
        ctx,
        points,
        extrema,
        display,
        componentInfo,
        geometry,
        style,
    });

    drawAxialPMaxMinMarkers({
        CADSystem,
        ctx,
        points,
        extrema,
        display,
        componentInfo,
        geometry,
        style,
    });
}

// Moment M2 diagram functions

function drawMomentM2MaxMinMarkers({
    CADSystem,
    ctx,
    points,
    extrema,
    display,
    componentInfo,
    geometry,
    style,
}) {
    if (!display.showMaxMin) return;

    const drawMarker = (extreme, label, color) => {
        if (!extreme) return;

        const point = points.find((item) => {
            return Math.abs(item.relativeStation - extreme.relativeStation) < 1e-6;
        });

        if (!point) return;

        const valueText = formatFrameDiagramValue(
            CADSystem,
            extreme.value,
            componentInfo,
            display.decimals
        );

        ctx.save();

        ctx.beginPath();
        ctx.arc(point.x, point.y, 4.5, 0, Math.PI * 2);
        ctx.fillStyle = color;
        ctx.fill();

        ctx.strokeStyle = "#111827";
        ctx.lineWidth = 1.2;
        ctx.stroke();

        ctx.restore();

        drawLabelBox(
            ctx,
            `M2 ${label} ${valueText}`,
            point.x + geometry.nx * 34,
            point.y + geometry.ny * 34,
            {
                font: "bold 10px Arial",
                color,
                border: color,
                background: "rgba(15, 23, 42, 0.92)",
            }
        );
    };

    drawMarker(extrema.max, "max", style.maxColor || "#c4b5fd");

    if (
        extrema.min &&
        extrema.max &&
        Math.abs(extrema.min.relativeStation - extrema.max.relativeStation) > 1e-6
    ) {
        drawMarker(extrema.min, "min", style.minColor || "#f59e0b");
    }
}

function drawMomentM2Diagram({
    CADSystem,
    ctx,
    geometry,
    points,
    extrema,
    display,
    componentInfo,
    style,
}) {
    if (!points.length) return;

    // Reutilizamos la segmentación por signo ya corregida en M3.
    const segments = buildMomentM3Segments(points);

    if (display.showZeroLine) {
        drawFrameZeroLine(ctx, geometry, style);
    }

    if (display.filled) {
        segments.forEach((segment) => {
            const fillStyle =
                segment.sign === "positive"
                    ? style.positiveFill || style.fill
                    : style.negativeFill || style.fill;

            drawMomentArea(ctx, segment.points, fillStyle);
        });
    }

    drawMomentCurveBySign(ctx, segments, style);

    if (display.showStationLines) {
        drawFrameDiagramStationLines(ctx, points, style);
    }

    drawValueLabels({
        CADSystem,
        ctx,
        points,
        extrema,
        display,
        componentInfo,
        geometry,
        style,
    });

    drawMomentM2MaxMinMarkers({
        CADSystem,
        ctx,
        points,
        extrema,
        display,
        componentInfo,
        geometry,
        style,
    });
}

// Shear V2 diagram functions

function drawShearV2MaxMinMarkers({
    CADSystem,
    ctx,
    points,
    extrema,
    display,
    componentInfo,
    geometry,
    style,
}) {
    if (!display.showMaxMin) return;

    const drawMarker = (extreme, label, color) => {
        if (!extreme) return;

        const point = points.find((item) => {
            return Math.abs(item.relativeStation - extreme.relativeStation) < 1e-6;
        });

        if (!point) return;

        const valueText = formatFrameDiagramValue(
            CADSystem,
            extreme.value,
            componentInfo,
            display.decimals
        );

        ctx.save();

        ctx.beginPath();
        ctx.arc(point.x, point.y, 4.3, 0, Math.PI * 2);
        ctx.fillStyle = color;
        ctx.fill();

        ctx.strokeStyle = "#111827";
        ctx.lineWidth = 1.2;
        ctx.stroke();

        ctx.restore();

        drawLabelBox(
            ctx,
            `V2 ${label} ${valueText}`,
            point.x + geometry.nx * 30,
            point.y + geometry.ny * 30,
            {
                font: "bold 10px Arial",
                color,
                border: color,
                background: "rgba(15, 23, 42, 0.92)",
            }
        );
    };

    drawMarker(extrema.max, "max", style.maxColor || "#fde047");

    if (
        extrema.min &&
        extrema.max &&
        Math.abs(extrema.min.relativeStation - extrema.max.relativeStation) > 1e-6
    ) {
        drawMarker(extrema.min, "min", style.minColor || "#06b6d4");
    }
}

function drawShearV2Diagram({
    CADSystem,
    ctx,
    geometry,
    points,
    extrema,
    display,
    componentInfo,
    style,
}) {
    if (!points.length) return;

    // Reutilizamos la segmentación por signo ya creada para cortantes.
    const segments = buildShearSegments(points);

    if (display.showZeroLine) {
        drawFrameZeroLine(ctx, geometry, style);
    }

    if (display.filled) {
        segments.forEach((segment) => {
            const fillStyle =
                segment.sign === "positive"
                    ? style.positiveFill || style.fill
                    : style.negativeFill || style.fill;

            drawShearArea(ctx, segment.points, fillStyle);
        });
    }

    drawShearCurveBySign(ctx, segments, style);

    if (display.showStationLines) {
        drawFrameDiagramStationLines(ctx, points, style);
    }

    drawValueLabels({
        CADSystem,
        ctx,
        points,
        extrema,
        display,
        componentInfo,
        geometry,
        style,
    });

    drawShearV2MaxMinMarkers({
        CADSystem,
        ctx,
        points,
        extrema,
        display,
        componentInfo,
        geometry,
        style,
    });
}

// Torsion diagram functions

function drawTorsionMaxMinMarkers({
    CADSystem,
    ctx,
    points,
    extrema,
    display,
    componentInfo,
    geometry,
    style,
}) {
    if (!display.showMaxMin) return;

    const drawMarker = (extreme, label, color) => {
        if (!extreme) return;

        const point = points.find((item) => {
            return Math.abs(item.relativeStation - extreme.relativeStation) < 1e-6;
        });

        if (!point) return;

        const valueText = formatFrameDiagramValue(
            CADSystem,
            extreme.value,
            componentInfo,
            display.decimals
        );

        ctx.save();

        ctx.beginPath();
        ctx.arc(point.x, point.y, 4.4, 0, Math.PI * 2);
        ctx.fillStyle = color;
        ctx.fill();

        ctx.strokeStyle = "#111827";
        ctx.lineWidth = 1.2;
        ctx.stroke();

        ctx.restore();

        drawLabelBox(
            ctx,
            `T ${label} ${valueText}`,
            point.x + geometry.nx * 30,
            point.y + geometry.ny * 30,
            {
                font: "bold 10px Arial",
                color,
                border: color,
                background: "rgba(15, 23, 42, 0.92)",
            }
        );
    };

    drawMarker(extrema.max, "max", style.maxColor || "#d8b4fe");

    if (
        extrema.min &&
        extrema.max &&
        Math.abs(extrema.min.relativeStation - extrema.max.relativeStation) > 1e-6
    ) {
        drawMarker(extrema.min, "min", style.minColor || "#f472b6");
    }
}

function drawTorsionSymbol(ctx, point, geometry, sign, color) {
    const centerX = point.baseX + geometry.nx * 14;
    const centerY = point.baseY + geometry.ny * 14;
    const radius = 7;

    const clockwise = sign === "positive";

    const startAngle = clockwise ? -Math.PI * 0.7 : Math.PI * 0.3;
    const endAngle = clockwise ? Math.PI * 1.1 : -Math.PI * 1.5;

    ctx.save();

    ctx.strokeStyle = color;
    ctx.fillStyle = color;
    ctx.lineWidth = 1.5;

    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, startAngle, endAngle, !clockwise);
    ctx.stroke();

    const arrowAngle = endAngle;
    const arrowX = centerX + radius * Math.cos(arrowAngle);
    const arrowY = centerY + radius * Math.sin(arrowAngle);

    const tangent = clockwise ? arrowAngle + Math.PI / 2 : arrowAngle - Math.PI / 2;
    const size = 4;

    ctx.beginPath();
    ctx.moveTo(arrowX, arrowY);
    ctx.lineTo(
        arrowX - size * Math.cos(tangent - Math.PI / 5),
        arrowY - size * Math.sin(tangent - Math.PI / 5)
    );
    ctx.lineTo(
        arrowX - size * Math.cos(tangent + Math.PI / 5),
        arrowY - size * Math.sin(tangent + Math.PI / 5)
    );
    ctx.closePath();
    ctx.fill();

    ctx.restore();
}

function drawTorsionSymbols(ctx, points, geometry, style) {
    if (!points || !points.length) return;

    const candidates = [];

    if (points[0]) candidates.push(points[0]);

    if (points.length >= 3) {
        candidates.push(points[Math.floor(points.length / 2)]);
    }

    if (points.length >= 2) {
        candidates.push(points[points.length - 1]);
    }

    candidates.forEach((point) => {
        const value = Number(point.value || 0);
        const sign = value >= 0 ? "positive" : "negative";

        const color =
            sign === "positive"
                ? style.positiveStroke || style.stroke
                : style.negativeStroke || style.stroke;

        drawTorsionSymbol(ctx, point, geometry, sign, color);
    });
}

function drawTorsionTDiagram({
    CADSystem,
    ctx,
    geometry,
    points,
    extrema,
    display,
    componentInfo,
    style,
}) {
    if (!points.length) return;

    // Reutilizamos segmentación por signo.
    const segments = buildShearSegments(points);

    if (display.showZeroLine) {
        drawFrameZeroLine(ctx, geometry, style);
    }

    if (display.filled) {
        segments.forEach((segment) => {
            const fillStyle =
                segment.sign === "positive"
                    ? style.positiveFill || style.fill
                    : style.negativeFill || style.fill;

            drawShearArea(ctx, segment.points, fillStyle);
        });
    }

    drawShearCurveBySign(ctx, segments, style);

    if (display.showStationLines) {
        drawFrameDiagramStationLines(ctx, points, style);
    }

    if (display.showTorsionSymbols !== false) {
        drawTorsionSymbols(ctx, points, geometry, style);
    }

    drawValueLabels({
        CADSystem,
        ctx,
        points,
        extrema,
        display,
        componentInfo,
        geometry,
        style,
    });

    drawTorsionMaxMinMarkers({
        CADSystem,
        ctx,
        points,
        extrema,
        display,
        componentInfo,
        geometry,
        style,
    });
}

function drawSingleFrameForceDiagram({
    CADSystem,
    renderer,
    frame,
    record,
    component,
    componentInfo,
    display,
    maxAbs,
}) {
    const ctx = CADSystem.ctx;
    const geometry = getFrameScreenGeometry(CADSystem, renderer, frame);

    if (!geometry) return;

    const style = getComponentStyle(component);
    const scalePxPerUnit = getScalePxPerUnit(display, maxAbs);
    const points = buildDiagramPoints(record, component, geometry, scalePxPerUnit);

    if (!points.length) return;

    const extrema = getRecordExtrema(record, component);

    if (component === "M3") {
        drawMomentM3Diagram({
            CADSystem,
            ctx,
            geometry,
            points,
            extrema,
            display,
            componentInfo,
            style,
        });

        return;
    }

    if (component === "V3") {
        drawShearV3Diagram({
            CADSystem,
            ctx,
            geometry,
            points,
            extrema,
            display,
            componentInfo,
            style,
        });

        return;
    }

    if (component === "P") {
        drawAxialPDiagram({
            CADSystem,
            ctx,
            geometry,
            points,
            extrema,
            display,
            componentInfo,
            style,
        });

        return;
    }

    if (component === "M2") {
        drawMomentM2Diagram({
            CADSystem,
            ctx,
            geometry,
            points,
            extrema,
            display,
            componentInfo,
            style,
        });

        return;
    }

    if (component === "V2") {
        drawShearV2Diagram({
            CADSystem,
            ctx,
            geometry,
            points,
            extrema,
            display,
            componentInfo,
            style,
        });

        return;
    }

    if (component === "T") {
        drawTorsionTDiagram({
            CADSystem,
            ctx,
            geometry,
            points,
            extrema,
            display,
            componentInfo,
            style,
        });

        return;
    }

    if (display.showZeroLine) {
        drawFrameZeroLine(ctx, geometry, style);
    }

    if (display.filled) {
        drawFrameDiagramFill(ctx, geometry, points, style);
    }

    drawFrameDiagramCurve(ctx, points, style);

    if (display.showStationLines) {
        drawFrameDiagramStationLines(ctx, points, style);
    }

    drawValueLabels({
        CADSystem,
        ctx,
        points,
        extrema,
        display,
        componentInfo,
        geometry,
        style,
    });

    drawMaxMinMarkers({
        CADSystem,
        ctx,
        points,
        extrema,
        display,
        componentInfo,
        geometry,
    });
}

export function drawFrameForceDiagrams2D({ CADSystem, renderer, ctx }) {
    const display = getFrameDiagramDisplay(CADSystem);

    if (!display.enabled) return;

    const results = CADSystem.frameForceResults;
    const validation = validateFrameForceResults(results);

    if (!validation.ok) {
        console.warn("Frame force results inválidos:", validation.reason);
        return;
    }

    const component = display.component || "M3";
    const componentInfo = getFrameForceComponent(component);

    if (!componentInfo) {
        console.warn("Componente de frame force no válida:", component);
        return;
    }

    const frames = getAllFrames(CADSystem);
    const maxAbs = getMaxAbsValue(
        results,
        display.caseId,
        display.comboId,
        component
    );

    ctx.save();

    frames.forEach((frame) => {
        if (!shouldDrawFrameDiagram(frame, CADSystem, renderer, display)) return;

        const record = getFrameForceRecord(
            results,
            frame.id,
            display.caseId,
            display.comboId
        );

        if (!record) return;

        drawSingleFrameForceDiagram({
            CADSystem,
            renderer,
            frame,
            record,
            component,
            componentInfo,
            display,
            maxAbs,
        });
    });

    drawDiagramLegend({
        CADSystem,
        results,
        componentInfo,
        display,
    });

    ctx.restore();
}