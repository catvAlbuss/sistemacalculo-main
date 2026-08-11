// resources/js/safecito/zapatas2Core.js
// Núcleo reutilizable para llamar el cálculo existente de Safecito (/zapatas2)
// No depende del DOM, no usa Tabulator, no usa el canvas viejo de Safecito.

import { read as readmat } from "mat-for-js";

export const DEFAULT_ZAPATAS2_ENDPOINT = "/zapatas2";

export const DEFAULT_LOAD_COMBINATIONS = [
    {
        id: 1,
        column1: "Pm + Pv",
        column2: "MXm + MXv",
        column3: "MYm + MYv",
    },
    {
        id: 2,
        column1: "Pm + 0.7 * PS",
        column2: "MXm + 0.7 * MXS",
        column3: "MYm",
    },
    {
        id: 3,
        column1: "Pm + 0.7 * PS",
        column2: "MXm - 0.7 * MXS",
        column3: "MYm",
    },
    {
        id: 4,
        column1: "Pm + 0.7 * PS",
        column2: "MXm",
        column3: "MYm + 0.7 * MYS",
    },
    {
        id: 5,
        column1: "Pm + 0.7 * PS",
        column2: "MXm",
        column3: "MYm - 0.7 * MYS",
    },
    {
        id: 6,
        column1: "Pm + 0.75 * Pv + 0.7 * 0.75 * PS",
        column2: "MXm + 0.75 * MXv + 0.7 * 0.75 * MXS",
        column3: "MYm + 0.75 * MYv",
    },
    {
        id: 7,
        column1: "Pm + 0.75 * Pv + 0.7 * 0.75 * PS",
        column2: "MXm + 0.75 * MXv - 0.7 * 0.75 * MXS",
        column3: "MYm + 0.75 * MYv",
    },
    {
        id: 8,
        column1: "Pm + 0.75 * Pv + 0.7 * 0.75 * PS",
        column2: "MXm + 0.75 * MXv",
        column3: "MYm + 0.75 * MYv + 0.7 * 0.75 * MYS",
    },
    {
        id: 9,
        column1: "Pm + 0.75 * Pv + 0.7 * 0.75 * PS",
        column2: "MXm + 0.75 * MXv",
        column3: "MYm + 0.75 * MYv - 0.7 * 0.75 * MYS",
    },
    {
        id: 10,
        column1: "0.6 * Pm + 0.7 * PS",
        column2: "0.6 * MXm",
        column3: "0.6 * MYm + 0.7 * MYS",
    },
    {
        id: 11,
        column1: "0.6 * Pm + 0.7 * PS",
        column2: "0.6 * MXm",
        column3: "0.6 * MYm - 0.7 * MYS",
    },
];

function isFiniteNumber(value) {
    return Number.isFinite(Number(value));
}

function toNumber(value, label) {
    const number = Number(value);
    if (!Number.isFinite(number)) {
        throw new Error(`${label} debe ser un número válido.`);
    }
    return number;
}

function formatOctaveNumber(value, label = "valor") {
    const number = toNumber(value, label);
    return Number.isInteger(number) ? String(number) : String(Number(number.toFixed(10)));
}

function normalizeExpression(expression) {
    return String(expression ?? "")
        .trim()
        .replaceAll(",", ".")
        .toLowerCase();
}

function ensureNonEmptyArray(value, label) {
    if (!Array.isArray(value) || value.length === 0) {
        throw new Error(`${label} no puede estar vacío.`);
    }
}

function areSamePoint(a, b, tolerance = 1e-6) {
    return Math.abs(Number(a.x) - Number(b.x)) <= tolerance && Math.abs(Number(a.y) - Number(b.y)) <= tolerance;
}

function normalizePolygonNodes(polygon, polygonIndex) {
    const sourceNodes = polygon?.nodes ?? polygon?.points ?? [];

    if (!Array.isArray(sourceNodes) || sourceNodes.length < 3) {
        throw new Error(`El polígono ${polygonIndex} debe tener al menos 3 nodos.`);
    }

    const nodes = sourceNodes.map((node, nodeIndex) => {
        const x = toNumber(node.x, `X del nodo ${nodeIndex + 1} del polígono ${polygonIndex}`);
        const y = toNumber(node.y, `Y del nodo ${nodeIndex + 1} del polígono ${polygonIndex}`);

        return { x, y };
    });

    const geometryClosed = nodes.length >= 4 && areSamePoint(nodes[0], nodes[nodes.length - 1]);
    const apiClosed = polygon?.closed === true;

    if (polygon?.closed === false && !geometryClosed) {
        throw new Error(
            `El polígono ${polygonIndex} está abierto. Ciérralo en el CAD antes de calcular zapatas.`
        );
    }

    if (apiClosed || geometryClosed) {
        return geometryClosed ? nodes : [...nodes, nodes[0]];
    }

    // Para datos que no traen propiedad "closed", se cierra igual que hacía Safecito.
    return [...nodes, nodes[0]];
}

export function octaveMatrix(table, ...fields) {
    ensureNonEmptyArray(table, "La tabla para matriz Octave");

    return (
        "[" +
        table
            .map((row, rowIndex) => {
                return fields
                    .map((field) => {
                        const value = row[field];

                        if (value === null || value === undefined || value === "") {
                            throw new Error(`Falta el campo "${field}" en la fila ${rowIndex + 1}.`);
                        }

                        return String(value);
                    })
                    .join(",");
            })
            .join(";") +
        "]"
    );
}

export function buildColumnMatrix(columns) {
    ensureNonEmptyArray(columns, "La lista de columnas");

    const rows = columns.map((row, index) => ({
        column: formatOctaveNumber(row.column, `ID de columna en fila ${index + 1}`),
        x: formatOctaveNumber(row.x, `X de columna ${row.column}`),
        y: formatOctaveNumber(row.y, `Y de columna ${row.column}`),
    }));

    return octaveMatrix(rows, "column", "x", "y");
}

export function buildLoadMatrix(columns, fields, label) {
    ensureNonEmptyArray(columns, `La matriz ${label}`);

    const rows = columns.map((row, index) => ({
        column: formatOctaveNumber(row.column, `ID de columna en fila ${index + 1}`),
        f2: formatOctaveNumber(row[fields[0]], `${label} F2 de columna ${row.column}`),
        mx: formatOctaveNumber(row[fields[1]], `${label} MX de columna ${row.column}`),
        my: formatOctaveNumber(row[fields[2]], `${label} MY de columna ${row.column}`),
    }));

    return octaveMatrix(rows, "column", "f2", "mx", "my");
}

export function buildCoMatrix(loadCombinations = DEFAULT_LOAD_COMBINATIONS) {
    ensureNonEmptyArray(loadCombinations, "La tabla de combinaciones Co");

    const rows = loadCombinations.map((row, index) => {
        const column1 = normalizeExpression(row.column1);
        const column2 = normalizeExpression(row.column2);
        const column3 = normalizeExpression(row.column3);

        if (!column1 || !column2 || !column3) {
            throw new Error(`La combinación de carga ${index + 1} tiene expresiones incompletas.`);
        }

        return { column1, column2, column3 };
    });

    return octaveMatrix(rows, "column1", "column2", "column3");
}

export function buildPoligonosStruct(polygons) {
    ensureNonEmptyArray(polygons, "La lista de polígonos");

    const entries = polygons.map((polygon, index) => {
        const polygonNumber = index + 1;
        const nodes = normalizePolygonNodes(polygon, polygonNumber);

        const points = nodes
            .map((point) => {
                return `${formatOctaveNumber(point.x, `X del polígono ${polygonNumber}`)},${formatOctaveNumber(
                    point.y,
                    `Y del polígono ${polygonNumber}`
                )}`;
            })
            .join(";");

        return `'poligono${polygonNumber}', [${points}]`;
    });

    return `struct(${entries.join(",")})`;
}

export function validateZapatas2Columns(columns) {
    ensureNonEmptyArray(columns, "La lista de columnas");

    columns.forEach((row, index) => {
        const label = row.column ?? index + 1;

        const requiredFields = [
            "column",
            "x",
            "y",
            "pd1",
            "pd2",
            "pd3",
            "pl1",
            "pl2",
            "pl3",
            "sismo1",
            "sismo2",
            "sismo3",
        ];

        requiredFields.forEach((field) => {
            if (!isFiniteNumber(row[field])) {
                throw new Error(`Revisa el campo "${field}" de la columna ${label}.`);
            }
        });
    });
}

export function buildZapatas2FormData({
    columns,
    polygons,
    loadCombinations = DEFAULT_LOAD_COMBINATIONS,
    df,
    gammaE,
}) {
    validateZapatas2Columns(columns);

    const dF = formatOctaveNumber(df, "Df");
    const pesoEspecifico = formatOctaveNumber(gammaE, "Peso específico");

    const formData = new FormData();

    formData.append("column", buildColumnMatrix(columns));
    formData.append("PD", buildLoadMatrix(columns, ["pd1", "pd2", "pd3"], "PD"));
    formData.append("PL", buildLoadMatrix(columns, ["pl1", "pl2", "pl3"], "PL"));
    formData.append("SISMO", buildLoadMatrix(columns, ["sismo1", "sismo2", "sismo3"], "SISMO"));
    formData.append("Co", buildCoMatrix(loadCombinations));
    formData.append("poligonos", buildPoligonosStruct(polygons));
    formData.append("dF", dF);
    formData.append("pesoEspecifico", pesoEspecifico);

    const csrfToken = getCsrfToken();
    if (csrfToken) {
        formData.append("_token", csrfToken);
    }

    return formData;
}

export function getCsrfToken() {
    return (
        document.querySelector('meta[name="csrf-token"]')?.getAttribute("content") ||
        document.querySelector('input[name="_token"]')?.value ||
        ""
    );
}

export async function parseZapatas2Response(response) {
    const contentType = response.headers.get("Content-Type") || "";

    if (contentType.includes("application/octet-stream")) {
        return {
            type: "mat",
            data: await response.arrayBuffer(),
        };
    }

    if (contentType.includes("application/json")) {
        const data = await response.json();

        if (!response.ok) {
            throw new Error(data?.message || "No se pudo calcular la cimentación.");
        }

        return {
            type: "json",
            data,
        };
    }

    const text = await response.text();

    if (!response.ok) {
        throw new Error(text || "No se pudo calcular la cimentación.");
    }

    throw new Error(`Respuesta no reconocida desde /zapatas2: ${contentType || "sin Content-Type"}`);
}

export function normalizeZapatas2Response(calculationResponse) {
    const zapatas2 =
        calculationResponse.type === "json"
            ? { data: calculationResponse.data }
            : readmat(calculationResponse.data);

    const resultados = zapatas2?.data?.resultados;

    if (!resultados || typeof resultados !== "object") {
        throw new Error("La respuesta de /zapatas2 no contiene resultados válidos.");
    }

    return {
        raw: zapatas2,
        resultados,
    };
}

export async function requestZapatas2(payload, options = {}) {
    const endpoint = options.endpoint || DEFAULT_ZAPATAS2_ENDPOINT;
    const csrfToken = getCsrfToken();

    const formData = payload instanceof FormData ? payload : buildZapatas2FormData(payload);

    const response = await fetch(endpoint, {
        method: "POST",
        body: formData,
        credentials: "same-origin",
        headers: {
            Accept: "application/json, application/octet-stream",
            ...(csrfToken ? { "X-CSRF-TOKEN": csrfToken } : {}),
            ...(options.headers || {}),
        },
    });

    const parsed = await parseZapatas2Response(response);
    return normalizeZapatas2Response(parsed);
}

export function createZapatas2DebugPayload(payload) {
    const formData = payload instanceof FormData ? payload : buildZapatas2FormData(payload);

    return Object.fromEntries(formData.entries());
}