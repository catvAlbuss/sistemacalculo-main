export const DEFAULT_FRAME_DIAGRAM_DISPLAY = {
    enabled: false,
    caseId: "CM",
    comboId: null,
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

    // "all", "max-min", "ends", "none"
    valueLabelMode: "max-min",

    diagramHeightPx: 42,
    decimals: 2,
};

export const FRAME_COMPONENT_STYLES = {
    P: {
        stroke: "#22c55e",
        fill: "rgba(34, 197, 94, 0.22)",
        station: "rgba(34, 197, 94, 0.55)",
        text: "#dcfce7",
        label: "P",

        // P positivo = tracción
        positiveStroke: "#22c55e",
        positiveFill: "rgba(34, 197, 94, 0.24)",

        // P negativo = compresión
        negativeStroke: "#ef4444",
        negativeFill: "rgba(239, 68, 68, 0.22)",

        maxColor: "#22c55e",
        minColor: "#ef4444",
    },
    V2: {
        stroke: "#eab308",
        fill: "rgba(234, 179, 8, 0.22)",
        station: "rgba(234, 179, 8, 0.55)",
        text: "#fef9c3",
        label: "V2",

        positiveStroke: "#eab308",
        positiveFill: "rgba(234, 179, 8, 0.25)",

        negativeStroke: "#06b6d4",
        negativeFill: "rgba(6, 182, 212, 0.22)",

        maxColor: "#fde047",
        minColor: "#06b6d4",
    },
    V3: {
        stroke: "#fb923c",
        fill: "rgba(251, 146, 60, 0.22)",
        station: "rgba(251, 146, 60, 0.55)",
        text: "#fed7aa",
        label: "V3",

        positiveStroke: "#fb923c",
        positiveFill: "rgba(251, 146, 60, 0.25)",

        negativeStroke: "#38bdf8",
        negativeFill: "rgba(56, 189, 248, 0.22)",

        maxColor: "#facc15",
        minColor: "#38bdf8",
    },
    T: {
        stroke: "#a855f7",
        fill: "rgba(168, 85, 247, 0.22)",
        station: "rgba(168, 85, 247, 0.55)",
        text: "#f3e8ff",
        label: "T",

        positiveStroke: "#a855f7",
        positiveFill: "rgba(168, 85, 247, 0.25)",

        negativeStroke: "#ec4899",
        negativeFill: "rgba(236, 72, 153, 0.22)",

        maxColor: "#d8b4fe",
        minColor: "#f472b6",
    },
    M2: {
        stroke: "#818cf8",
        fill: "rgba(129, 140, 248, 0.22)",
        station: "rgba(129, 140, 248, 0.55)",
        text: "#e0e7ff",
        label: "M2",

        positiveStroke: "#818cf8",
        positiveFill: "rgba(129, 140, 248, 0.26)",

        negativeStroke: "#f59e0b",
        negativeFill: "rgba(245, 158, 11, 0.23)",

        maxColor: "#c4b5fd",
        minColor: "#f59e0b",
    },
    M3: {
        stroke: "#22d3ee",
        fill: "rgba(34, 211, 238, 0.22)",
        station: "rgba(34, 211, 238, 0.55)",
        text: "#cffafe",
        label: "M3",

        positiveStroke: "#22d3ee",
        positiveFill: "rgba(34, 211, 238, 0.26)",

        negativeStroke: "#f97316",
        negativeFill: "rgba(249, 115, 22, 0.24)",

        maxColor: "#facc15",
        minColor: "#fb923c",
    },
};

export function getFrameDiagramDisplay(CADSystem) {
    return {
        ...DEFAULT_FRAME_DIAGRAM_DISPLAY,
        ...(CADSystem.frameDiagramDisplay || {}),
    };
}

export function getComponentStyle(component) {
    return FRAME_COMPONENT_STYLES[component] || FRAME_COMPONENT_STYLES.M3;
}

export function getAllFrames(CADSystem) {
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

export function isSelectedFrame(frame, CADSystem) {
    return (
        frame?.selected === true ||
        frame?.isSelected === true ||
        CADSystem.selectedBeams?.some?.((item) => item?.id === frame?.id) ||
        CADSystem.currentState?.selectedBeams?.some?.((item) => item?.id === frame?.id) ||
        CADSystem.selectedBeamsState?.selectedObjects?.some?.((item) => item?.id === frame?.id)
    );
}

export function shouldDrawFrameDiagram(frame, CADSystem, renderer, display) {
    if (!frame?.node1 || !frame?.node2) return false;

    if (display.selectedOnly && !isSelectedFrame(frame, CADSystem)) {
        return false;
    }

    if (typeof renderer.shouldDrawBeam === "function") {
        return renderer.shouldDrawBeam(frame, CADSystem);
    }

    return true;
}

export function getFrameForceRecord(results, frameId, caseId, comboId = null) {
    if (!results?.frameForces?.length) return null;

    return results.frameForces.find((item) => {
        const sameFrame = String(item.frameId) === String(frameId);

        if (!sameFrame) return false;

        if (comboId) {
            return String(item.comboId) === String(comboId);
        }

        return String(item.caseId) === String(caseId);
    });
}

export function getMaxAbsValue(results, caseId, comboId, component) {
    let maxAbs = 0;

    if (!results?.frameForces?.length) return 1;

    results.frameForces.forEach((record) => {
        if (comboId) {
            if (String(record.comboId) !== String(comboId)) return;
        } else {
            if (String(record.caseId) !== String(caseId)) return;
        }

        record.stations?.forEach((station) => {
            const value = Math.abs(Number(station[component] ?? 0));
            if (value > maxAbs) maxAbs = value;
        });
    });

    return maxAbs || 1;
}

export function getRecordExtrema(record, component) {
    const stations = Array.isArray(record?.stations) ? record.stations : [];

    if (!stations.length) {
        return {
            max: null,
            min: null,
            maxAbs: null,
        };
    }

    let max = null;
    let min = null;
    let maxAbs = null;

    stations.forEach((station) => {
        const value = Number(station[component] ?? 0);
        const item = {
            value,
            station: Number(station.station ?? 0),
            relativeStation: Number(station.relativeStation ?? 0),
        };

        if (!max || value > max.value) max = item;
        if (!min || value < min.value) min = item;
        if (!maxAbs || Math.abs(value) > Math.abs(maxAbs.value)) maxAbs = item;
    });

    return { max, min, maxAbs };
}

export function getFrameScreenGeometry(CADSystem, renderer, frame) {
    const p1 = renderer.projectPoint(frame.node1, CADSystem);
    const p2 = renderer.projectPoint(frame.node2, CADSystem);

    const dx = p2.x - p1.x;
    const dy = p2.y - p1.y;
    const lengthPx = Math.sqrt(dx * dx + dy * dy);

    if (lengthPx < 1e-6) return null;

    const ux = dx / lengthPx;
    const uy = dy / lengthPx;

    return {
        p1,
        p2,
        dx,
        dy,
        lengthPx,
        ux,
        uy,
        nx: -uy,
        ny: ux,
    };
}

export function getScalePxPerUnit(display, maxAbs) {
    const safeMaxAbs = Math.max(Math.abs(Number(maxAbs || 1)), 1e-9);
    const baseHeight = Number(display.diagramHeightPx || 42);

    if (display.autoScale === false) {
        return (baseHeight / safeMaxAbs) * Number(display.scaleFactor || 1);
    }

    return baseHeight / safeMaxAbs;
}

export function buildDiagramPoints(record, component, geometry, scalePxPerUnit) {
    const stations = Array.isArray(record?.stations) ? record.stations : [];

    return stations.map((station) => {
        const t = Number(station.relativeStation ?? 0);
        const value = Number(station[component] ?? 0);
        const offset = value * scalePxPerUnit;

        const baseX = geometry.p1.x + geometry.dx * t;
        const baseY = geometry.p1.y + geometry.dy * t;

        return {
            baseX,
            baseY,
            x: baseX + geometry.nx * offset,
            y: baseY + geometry.ny * offset,
            value,
            station: Number(station.station ?? 0),
            relativeStation: t,
        };
    });
}

export function formatFrameDiagramValue(CADSystem, value, componentInfo, decimals = 2) {
    const number = Number(value);

    if (!Number.isFinite(number)) return "0";

    const unitType = componentInfo?.unitType;

    if (typeof CADSystem.formatOutput === "function") {
        if (unitType === "moment") {
            return CADSystem.formatOutput(number, "moments");
        }

        return CADSystem.formatOutput(number, "forces");
    }

    return number.toFixed(decimals);
}

export function getUnitLabel(results, componentInfo) {
    if (!results?.units || !componentInfo?.unitType) return "";

    return results.units[componentInfo.unitType] || "";
}

export function almostSamePoint(a, b) {
    if (!a || !b) return false;

    return (
        Math.abs(Number(a.relativeStation) - Number(b.relativeStation)) < 1e-6 &&
        Math.abs(Number(a.value) - Number(b.value)) < 1e-6
    );
}