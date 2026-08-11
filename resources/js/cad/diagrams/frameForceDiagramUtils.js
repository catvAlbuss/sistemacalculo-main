import { toDisplayUnits, unitLabelFor } from "./frameForceUnits.js";

const FRAME_FORCE_COMPONENTS = ["P", "V2", "V3", "T", "M2", "M3"];

// Por debajo de esta longitud en pantalla, una barra dibuja su diagrama pero
// NO sus etiquetas de valor: con el modelo alejado son miles de cajitas negras
// ilegibles, y cada una cuesta un measureText + save/restore del contexto.
export const MIN_PX_FOR_VALUE_LABELS = 48;

/**
 * De qué lado del eje de la barra se dibuja cada componente. **FUENTE ÚNICA**:
 * la importan el visor 2D, el 3D y el diálogo por barra.
 *
 * ETABS plotea los MOMENTOS del lado de la TRACCIÓN: el momento de vano
 * tracciona abajo, así que su diagrama CUELGA. Por eso M3 va invertido.
 * M2 NO se invierte, por la asimetría de los signos (dM3/ds = −V2 contra
 * dM2/ds = +V3). Los CORTANTES no tienen lado de tracción: se dejan como están.
 *
 * Vale también para los casos SIN SIGNO (espectro de respuesta): se probó
 * exceptuarlos —razonando que una magnitud no tiene lado de tracción— y quedó
 * espejado contra ETABS. Verificado con capturas; no volver a intentarlo.
 *
 * OJO: esta tabla vivía DUPLICADA en frameForceDiagram3d.js y en
 * frameForceMemberDialog.js, y el visor 2D directamente no la tenía → el M3 del
 * 2D salía del lado contrario al del 3D. De ahí que se unificara acá.
 */
export const DIAGRAM_SIDE = { P: 1, V2: 1, V3: 1, T: 1, M2: 1, M3: -1 };

export function getDiagramSide(component) {
    return DIAGRAM_SIDE[component] ?? 1;
}

export const DEFAULT_FRAME_DIAGRAM_DISPLAY = {
    enabled: false,
    caseId: "CM",
    comboId: null,
    component: "M3",
    source: "mock",

    // Etiquetas de valor SOBRE el modelo: apagadas por defecto. Rotular todas
    // las barras a la vez es ilegible y costoso; para leer valores se hace clic
    // derecho sobre la barra y se abre su diálogo de diagramas, como en ETABS
    // (ver frameForceMemberDialog.js). Se pueden reactivar desde el panel.
    showValues: false,
    showMaxMin: false,
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

/**
 * Índice {frameId → registro} + máximos por componente, para una selección
 * (caso o combo) dada.
 *
 * Antes cada barra hacía `frameForces.find(...)` con `String(...)` en la
 * comparación: O(barras × registros) por REDIBUJADO. En un modelo de ~1000
 * barras con ~1300 registros son más de un millón de comparaciones de string
 * cada vez que se mueve el mouse — de ahí el congelamiento.
 *
 * El caché vive en el propio objeto de resultados y no es enumerable, así que
 * un `frameForceResults` nuevo (otro análisis) trae índice nuevo y el
 * JSON.stringify de guardado no lo arrastra.
 */
const RECORD_INDEX_KEY = "__ffIndex";

export function getFrameForceIndex(results, caseId, comboId) {
    if (!results?.frameForces?.length) return null;

    if (!Object.prototype.hasOwnProperty.call(results, RECORD_INDEX_KEY)) {
        Object.defineProperty(results, RECORD_INDEX_KEY, {
            value: new Map(),
            enumerable: false,
            writable: true,
            configurable: true,
        });
    }

    const cache = results[RECORD_INDEX_KEY];
    const key = comboId ? `combo:${comboId}` : `case:${caseId}`;

    if (cache.has(key)) return cache.get(key);

    const byFrame = new Map();
    const maxAbs = {};

    results.frameForces.forEach((record) => {
        if (comboId) {
            if (String(record.comboId) !== String(comboId)) return;
        } else {
            if (String(record.caseId) !== String(caseId)) return;
        }

        byFrame.set(String(record.frameId), record);

        record.stations?.forEach((station) => {
            FRAME_FORCE_COMPONENTS.forEach((comp) => {
                const value = Math.abs(Number(station[comp] ?? 0));
                if (value > (maxAbs[comp] || 0)) maxAbs[comp] = value;
            });
        });
    });

    const index = { byFrame, maxAbs };
    cache.set(key, index);

    return index;
}

export function getFrameForceRecord(results, frameId, caseId, comboId = null) {
    const index = getFrameForceIndex(results, caseId, comboId);
    return index ? index.byFrame.get(String(frameId)) || null : null;
}

export function getMaxAbsValue(results, caseId, comboId, component) {
    const index = getFrameForceIndex(results, caseId, comboId);
    return (index?.maxAbs?.[component] || 0) || 1;
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

    // Normal del diagrama, ORIENTADA para que signifique lo mismo que en 3D.
    //
    // La perpendicular cruda (-uy, ux) tiene dos problemas:
    //   1. Apunta HACIA ABAJO en pantalla para una viga dibujada de izquierda a
    //      derecha, mientras que el `local2` del 3D apunta HACIA ARRIBA. Como
    //      las dos vistas aplican después el mismo `getDiagramSide`, el M3
    //      salía ESPEJADO entre 2D y 3D (visto en MODELO (2)1 con el combo
    //      1.4CM+1.7CV: el 3D dibujaba la panza de tramo abajo —tracción abajo,
    //      que es lo correcto— y el 2D la dibujaba arriba).
    //   2. Depende del ORDEN de los nudos: invertir i y j daba vuelta el
    //      diagrama. El `local2` del 3D es invariante (ver
    //      calculateFrameLocalAxes3D), así que el 2D tenía una fuente de
    //      inconsistencia que el 3D no.
    //
    // Regla: se elige la perpendicular que apunta hacia ARRIBA en pantalla
    // (ny < 0, porque el canvas crece hacia abajo). Para barras verticales,
    // donde "arriba" no desempata, se usa la que apunta a la derecha (nx > 0),
    // que es exactamente lo que ya hacían las columnas dibujadas de abajo hacia
    // arriba — por eso las columnas se veían bien y las vigas no.
    let nx = -uy;
    let ny = ux;

    const flip = Math.abs(ny) > 1e-9 ? ny > 0 : nx < 0;

    if (flip) {
        nx = -nx;
        ny = -ny;
    }

    return {
        p1,
        p2,
        dx,
        dy,
        lengthPx,
        ux,
        uy,
        nx,
        ny,
    };
}

/**
 * Píxeles por unidad de fuerza para dibujar el diagrama.
 *
 * `targetHeightPx` es la altura que debe tener el diagrama del valor MÁXIMO.
 * La calcula `frameForceDiagramScale.js` a partir del tamaño del modelo, igual
 * que el 3D — antes acá se usaban 42 px fijos, que no eran proporcionales al
 * edificio ni estables al zoom, y el 2D salía mucho más grande que el 3D y que
 * la elevación de ETABS.
 *
 * Sin `targetHeightPx` se cae al comportamiento viejo, para no romper a ningún
 * llamador que todavía no lo pase.
 */
export function getScalePxPerUnit(display, maxAbs, targetHeightPx = null) {
    const safeMaxAbs = Math.max(Math.abs(Number(maxAbs || 1)), 1e-9);

    if (Number(targetHeightPx) > 0) {
        return Number(targetHeightPx) / safeMaxAbs;
    }

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

    // El motor manda kN/kN-m; se convierte SOLO acá, al mostrar (ver
    // frameForceUnits.js). `CADSystem.formatOutput` se dejó de usar para estos
    // valores porque aplica su propio sistema de unidades y volvía a convertir
    // encima, con lo que el número quedaba escalado dos veces.
    return toDisplayUnits(number).toFixed(decimals);
}

export function getUnitLabel(results, componentInfo) {
    return unitLabelFor(componentInfo?.unitType || componentInfo?.id || "");
}

export function almostSamePoint(a, b) {
    if (!a || !b) return false;

    return (
        Math.abs(Number(a.relativeStation) - Number(b.relativeStation)) < 1e-6 &&
        Math.abs(Number(a.value) - Number(b.value)) < 1e-6
    );
}