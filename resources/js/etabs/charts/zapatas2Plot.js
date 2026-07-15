// resources/js/etabs/charts/zapatas2Plot.js
// Render de gráficos Plotly para resultados de zapatas usando el formato de /zapatas2.

import Plotly from "plotly.js-dist-min";
import { matlabColorScale } from "../../matlab/color_scale.js";

function flattenNumeric(value) {
    if (value === null || value === undefined) {
        return [];
    }

    const flat = Array.isArray(value?.[0])
        ? value.flat(Infinity)
        : Array.isArray(value)
            ? value.flat(Infinity)
            : [value];

    return flat.map(Number).filter((number) => Number.isFinite(number));
}

function limitPlotPoints(points, limit = 4000) {
    if (points.length <= limit) {
        return points;
    }

    const step = points.length / limit;

    return Array.from({ length: limit }, (_, index) => {
        return points[Math.floor(index * step)];
    });
}

function getZValuesForCombo(ZZ, comboIndex) {
    if (Array.isArray(ZZ?.[comboIndex]) && ZZ[comboIndex].length) {
        return flattenNumeric(ZZ[comboIndex]);
    }

    return flattenNumeric(ZZ);
}

function formatNumber(value, digits = 3) {
    const number = Number(value);
    return Number.isFinite(number) ? number.toFixed(digits) : "-";
}

function buildPolygonTrace(polygon, comboIndex, options = {}) {
    const xValues = flattenNumeric(polygon.XX);
    const yValues = flattenNumeric(polygon.YY);
    const zValues = getZValuesForCombo(polygon.ZZ, comboIndex);

    const points = xValues
        .map((x, pointIndex) => ({
            x,
            y: yValues[pointIndex],
            z: zValues[pointIndex],
        }))
        .filter(({ x, y, z }) => {
            return Number.isFinite(x) && Number.isFinite(y) && Number.isFinite(z);
        });

    if (!points.length) {
        throw new Error(`No hay puntos válidos para graficar ${polygon.name}.`);
    }

    const plotPoints = limitPlotPoints(points, options.pointLimit ?? 4000);

    return {
        x: plotPoints.map((point) => point.x),
        y: plotPoints.map((point) => point.y),
        mode: "markers",
        marker: {
            size: 3,
            color: plotPoints.map((point) => point.z),
            opacity: 0.9,
            line: {
                width: 0,
            },
            coloraxis: "coloraxis",
        },
        name: `<b>${polygon.name}<br>σmin = ${formatNumber(polygon.min[comboIndex])}<br>σmax = ${formatNumber(
            polygon.max[comboIndex]
        )}</b>`,
        hoverinfo: "skip",
        type: "scatter",
    };
}

function buildColumnMarkers(columns = []) {
    return columns
        .filter((row) => Number.isFinite(Number(row.x)) && Number.isFinite(Number(row.y)))
        .map((row) => ({
            x: [Number(row.x)],
            y: [Number(row.y)],
            text: [`${row.column}`],
            mode: "markers+text",
            type: "scatter",
            textposition: "top right",
            textfont: {
                family: "Arial",
                size: 10,
                color: "lightgrey",
            },
            marker: {
                size: 6,
                color: "white",
                line: {
                    width: 1,
                    color: "black",
                },
            },
            name: `Col. ${row.column}`,
            showlegend: false,
            hoverinfo: "text",
        }));
}

function buildPolygonAnnotations(polygons = []) {
    return polygons
        .filter((polygon) => Number.isFinite(Number(polygon.XC)) && Number.isFinite(Number(polygon.YC)))
        .map((polygon, index) => ({
            x: Number(polygon.XC),
            y: Number(polygon.YC),
            xref: "x",
            yref: "y",
            text: `P${index + 1}`,
            font: {
                color: "lightgrey",
                size: 11,
            },
            align: "left",
            showarrow: false,
        }));
}

function getComboTitle(combo, comboIndex) {
    if (!combo) {
        return `Combinación ${comboIndex + 1}`;
    }

    return `Comb ${comboIndex + 1}: [${combo.column1}, ${combo.column2}, ${combo.column3}]`;
}

export function buildZapatas2PlotData(calculationResults, comboIndex, options = {}) {
    const polygons = calculationResults?.normalizedPolygons ?? [];
    const columns = calculationResults?.columns ?? [];
    const loadCombinations = calculationResults?.loadCombinations ?? [];
    const combo = loadCombinations[comboIndex];

    if (!polygons.length) {
        throw new Error("No hay resultados de polígonos para graficar.");
    }

    const traces = polygons.map((polygon) => {
        return buildPolygonTrace(polygon, comboIndex, options);
    });

    const markers = buildColumnMarkers(columns);

    const layout = {
        autosize: true,
        margin: {
            l: 45,
            r: 20,
            t: 55,
            b: 45,
        },
        paper_bgcolor: "#0f172a",
        plot_bgcolor: "#0f172a",
        font: {
            family: "Arial",
            color: "#e2e8f0",
            size: 11,
        },
        xaxis: {
            title: "X",
            scaleanchor: "y",
            scaleratio: 1,
            gridcolor: "#334155",
            zerolinecolor: "#475569",
        },
        yaxis: {
            title: "Y",
            constrain: "domain",
            gridcolor: "#334155",
            zerolinecolor: "#475569",
        },
        coloraxis: {
            colorscale: matlabColorScale,
            colorbar: {
                title: {
                    text: "Presión admisible",
                    side: "right",
                },
                tickfont: {
                    color: "#e2e8f0",
                },
            },
        },
        showlegend: true,
        legend: {
            x: 0,
            y: 0.5,
            bgcolor: "rgba(15, 23, 42, 0.75)",
            bordercolor: "#334155",
            borderwidth: 1,
            font: {
                size: 10,
            },
        },
        hovermode: false,
        annotations: buildPolygonAnnotations(polygons),
        title: {
            text: `<b>${getComboTitle(combo, comboIndex)}</b>`,
            font: {
                family: "Arial",
                size: 12,
                color: "#e2e8f0",
            },
        },
    };

    const config = {
        responsive: true,
        displaylogo: false,
        scrollZoom: true,
    };

    return {
        data: [...traces, ...markers],
        layout,
        config,
    };
}

export async function renderZapatas2Plot(targetElement, calculationResults, comboIndex, options = {}) {
    if (!targetElement) {
        throw new Error("No se encontró el contenedor del gráfico.");
    }

    const { data, layout, config } = buildZapatas2PlotData(calculationResults, comboIndex, options);

    await Plotly.react(targetElement, data, layout, config);
}

export function purgeZapatas2Plot(targetElement) {
    if (!targetElement) return;

    try {
        Plotly.purge(targetElement);
    } catch (error) {
        console.warn("No se pudo limpiar el gráfico Plotly:", error);
    }
}

export function resizeZapatas2Plot(targetElement) {
    if (!targetElement) return;

    try {
        Plotly.Plots.resize(targetElement);
    } catch (error) {
        console.warn("No se pudo redimensionar el gráfico Plotly:", error);
    }
}

export function formatZapatas2Value(value, digits = 3) {
    return formatNumber(value, digits);
}