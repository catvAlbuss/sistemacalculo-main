// resources/js/etabs/composables/useZapatas2.js
// Conector final entre ETABS2 y el cálculo existente de Safecito (/zapatas2).

import { computed, ref } from "vue";
import {
    requestZapatas2,
    createZapatas2DebugPayload,
    DEFAULT_LOAD_COMBINATIONS,
} from "../../safecito/zapatas2Core.js";

function isFiniteNumber(value) {
    return Number.isFinite(Number(value));
}

function flattenNumeric(value) {
    if (value === null || value === undefined) {
        return [];
    }

    const flat = Array.isArray(value?.[0]) ? value.flat(Infinity) : Array.isArray(value) ? value.flat(Infinity) : [value];

    return flat.map(Number).filter((number) => Number.isFinite(number));
}

function normalizeCenter(value) {
    const numbers = flattenNumeric(value);
    return numbers.length ? numbers[0] : null;
}

function normalizeMinMax(value) {
    return flattenNumeric(value);
}

function getPolygonDisplayName(key, index) {
    const match = String(key).match(/\d+/);
    const number = match ? Number(match[0]) : index + 1;
    return `Polígono ${number}`;
}

function normalizeResultados(resultados) {
    if (!resultados || typeof resultados !== "object") {
        throw new Error("La respuesta no contiene resultados de zapatas.");
    }

    return Object.entries(resultados).map(([key, value], index) => {
        return {
            key,
            index: index + 1,
            name: getPolygonDisplayName(key, index),

            XX: value.XX,
            YY: value.YY,
            ZZ: value.ZZ,

            min: normalizeMinMax(value.min),
            max: normalizeMinMax(value.max),

            XC: normalizeCenter(value.XC),
            YC: normalizeCenter(value.YC),

            raw: value,
        };
    });
}

function pointInPolygon(point, polygonNodes) {
    const x = Number(point.x);
    const y = Number(point.y);

    let inside = false;

    for (let i = 0, j = polygonNodes.length - 1; i < polygonNodes.length; j = i++) {
        const xi = Number(polygonNodes[i].x);
        const yi = Number(polygonNodes[i].y);
        const xj = Number(polygonNodes[j].x);
        const yj = Number(polygonNodes[j].y);

        const intersects =
            yi > y !== yj > y &&
            x < ((xj - xi) * (y - yi)) / ((yj - yi) || 1e-12) + xi;

        if (intersects) inside = !inside;
    }

    return inside;
}

function buildPolygonColumnSummary(columns, polygons) {
    return polygons.map((polygon, index) => {
        const insideColumns = columns.filter((column) => {
            return pointInPolygon(column, polygon.nodes);
        });

        return {
            polygonIndex: index + 1,
            polygonName: `Polígono ${index + 1}`,
            nodes: polygon.nodes.length,
            columnsInside: insideColumns.length,
            columns: insideColumns.map((column) => column.column),
        };
    });
}

function validateColumnsInsidePolygons(payload) {
    const summary = buildPolygonColumnSummary(payload.columns, payload.polygons);
    const emptyPolygon = summary.find((row) => row.columnsInside === 0);

    console.table(summary);

    if (emptyPolygon) {
        throw new Error(
            `${emptyPolygon.polygonName} no contiene columnas. Dibuja la zapata alrededor de al menos una columna.`
        );
    }

    return summary;
}

function validatePayloadBeforeRequest(payload) {
    if (!payload || typeof payload !== "object") {
        throw new Error("No se recibieron datos para calcular zapatas.");
    }

    if (!isFiniteNumber(payload.df)) {
        throw new Error("Df debe ser un número válido.");
    }

    if (!isFiniteNumber(payload.gammaE)) {
        throw new Error("El peso específico γe debe ser un número válido.");
    }

    if (!Array.isArray(payload.columns) || !payload.columns.length) {
        throw new Error("No hay columnas importadas para calcular.");
    }

    if (!Array.isArray(payload.polygons) || !payload.polygons.length) {
        throw new Error("No hay polígonos cerrados capturados desde el CAD.");
    }

    const invalidPolygon = payload.polygons.find((polygon) => {
        return !polygon.closed || !Array.isArray(polygon.nodes) || polygon.nodes.length < 3;
    });

    if (invalidPolygon) {
        throw new Error(`El polígono ${invalidPolygon.index ?? ""} no es válido o está abierto.`);
    }

    if (!Array.isArray(payload.loadCombinations) || !payload.loadCombinations.length) {
        throw new Error("No hay combinaciones de carga Co para calcular.");
    }

    return true;
}

function buildCalculationSummary({ normalizedPolygons, loadCombinations }) {
    return loadCombinations.map((combo, comboIndex) => {
        const polygonRows = normalizedPolygons.map((polygon) => {
            return {
                polygon: polygon.name,
                min: polygon.min[comboIndex] ?? null,
                max: polygon.max[comboIndex] ?? null,
                XC: polygon.XC,
                YC: polygon.YC,
            };
        });

        const globalMinValues = polygonRows
            .map((row) => row.min)
            .filter((value) => Number.isFinite(Number(value)))
            .map(Number);

        const globalMaxValues = polygonRows
            .map((row) => row.max)
            .filter((value) => Number.isFinite(Number(value)))
            .map(Number);

        return {
            index: comboIndex + 1,
            title: `Comb ${comboIndex + 1}`,
            expressions: {
                p: combo.column1,
                mx: combo.column2,
                my: combo.column3,
            },
            polygonRows,
            globalMin: globalMinValues.length ? Math.min(...globalMinValues) : null,
            globalMax: globalMaxValues.length ? Math.max(...globalMaxValues) : null,
        };
    });
}

export function useZapatas2() {
    const loading = ref(false);
    const error = ref("");
    const results = ref(null);
    const debugPayload = ref(null);

    const hasResults = computed(() => !!results.value);
    const normalizedPolygons = computed(() => results.value?.normalizedPolygons ?? []);
    const summary = computed(() => results.value?.summary ?? []);

    async function calculateZapatas2(payload) {
        loading.value = true;
        error.value = "";
        results.value = null;
        debugPayload.value = null;

        try {
            const finalPayload = {
                ...payload,
                loadCombinations: payload.loadCombinations?.length
                    ? payload.loadCombinations
                    : DEFAULT_LOAD_COMBINATIONS,
            };

            validatePayloadBeforeRequest(finalPayload);

            const polygonColumnSummary = validateColumnsInsidePolygons(finalPayload);

            debugPayload.value = createZapatas2DebugPayload(finalPayload);
            console.log("📦 Payload /zapatas2:", debugPayload.value);

            const response = await requestZapatas2(finalPayload);
            console.log("✅ Respuesta cruda de /zapatas2:", response);
            const normalized = normalizeResultados(response.resultados);

            const calculationResults = {
                createdAt: new Date().toISOString(),

                df: finalPayload.df,
                gammaE: finalPayload.gammaE,

                columns: finalPayload.columns,
                polygons: finalPayload.polygons,
                selectedCombos: finalPayload.selectedCombos ?? [],
                loadCombinations: finalPayload.loadCombinations,

                polygonColumnSummary,

                raw: response.raw,
                resultados: response.resultados,
                normalizedPolygons: normalized,

                summary: buildCalculationSummary({
                    normalizedPolygons: normalized,
                    loadCombinations: finalPayload.loadCombinations,
                }),
            };

            window.jhackZapatas2Debug = {
                payload: finalPayload,
                formData: debugPayload.value,
                polygonColumnSummary,
                response,
                calculationResults,
            };

            console.log("🧪 Debug de cálculo disponible en consola: jhackZapatas2Debug");

            results.value = calculationResults;
            return calculationResults;
        } catch (calculationError) {
            const message =
                calculationError?.message ||
                "No se pudo calcular la cimentación. Revisa los datos importados y los polígonos.";

            error.value = message;
            console.error("❌ Error en cálculo /zapatas2:", calculationError);
            throw calculationError;
        } finally {
            loading.value = false;
        }
    }

    function clearResults() {
        results.value = null;
        error.value = "";
        debugPayload.value = null;
    }

    return {
        loading,
        error,
        results,
        debugPayload,

        hasResults,
        normalizedPolygons,
        summary,

        calculateZapatas2,
        clearResults,
    };
}