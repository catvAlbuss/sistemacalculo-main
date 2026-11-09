// resources/js/etabs/charts/zapatas2Plot.js
// Render de gráficos Plotly para resultados de zapatas usando el formato de /zapatas2.

import {pressureMapTrace} from '../../matlab/pressureMap.js';
import {LIGHT_PLOT_PALETTE,themedPlotLayout,plotColorbar} from '../../sheets/plotTheme.js';
import { matlabColorScale } from "../../matlab/color_scale.js";

// Exportadas para reutilizarlas tal cual en canvas2d/zapataPressureLayer.js
// (pintar σ directamente sobre la zapata en el 2D) — mismo point cloud,
// mismo criterio de aplanado/combinación, sin duplicar la lógica.
export function flattenNumeric(value) {
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

export function limitPlotPoints(points, limit = 4000) {
    if (points.length <= limit) {
        return points;
    }

    const step = points.length / limit;

    return Array.from({ length: limit }, (_, index) => {
        return points[Math.floor(index * step)];
    });
}

export function getZValuesForCombo(ZZ, comboIndex) {
    if (Array.isArray(ZZ?.[comboIndex]) && ZZ[comboIndex].length) {
        return flattenNumeric(ZZ[comboIndex]);
    }

    return flattenNumeric(ZZ);
}

function formatNumber(value, digits = 3) {
    const number = Number(value);
    return Number.isFinite(number) ? number.toFixed(digits) : "-";
}

function buildPolygonTrace(polygon, comboIndex) {
    const raw = value => (Array.isArray(value) ? value.flat(Infinity) : [value]).map(v => v == null ? NaN : Number(v));
    const xs=raw(polygon.XX), ys=raw(polygon.YY);
    const values=raw(Array.isArray(polygon.ZZ?.[comboIndex]) ? polygon.ZZ[comboIndex] : polygon.ZZ);
    const x=[],y=[],z=[];
    xs.forEach((value,index)=>{if(Number.isFinite(value)&&Number.isFinite(ys[index])){x.push(value);y.push(ys[index]);z.push(values[index]);}});
    const trace=pressureMapTrace(x,y,z);
    delete trace.colorbar;
    delete trace.colorscale;
    return {...trace,coloraxis:'coloraxis',showlegend:false,name:polygon.name,
        hovertemplate:`<b>${polygon.name}</b><br>X = %{x:.2f} m<br>Y = %{y:.2f} m<br>σ = %{z:.3f} tn/m²<extra></extra>`};
}

function buildColumnMarkers(columns = [], palette) {
    const valid=columns.filter(row=>Number.isFinite(Number(row.x))&&Number.isFinite(Number(row.y)));
    if(!valid.length)return [];
    return [{x:valid.map(row=>Number(row.x)),y:valid.map(row=>Number(row.y)),text:valid.map(row=>String(row.column)),
        mode:'markers+text',type:'scatter',textposition:'top right',textfont:{family:'Arial',size:10,color:palette.text},
        marker:{size:6,color:palette.panel,line:{width:1,color:palette.text}},
        name:valid.length===1?`Col. ${valid[0].column}`:'Columnas',showlegend:false,hoverinfo:'text'}];
}

// The footing name goes just below its mesh so it never covers the column label.
function buildPolygonAnnotations(polygons = [], palette) {
    return polygons
        .filter((polygon) => Number.isFinite(Number(polygon.XC)) && Number.isFinite(Number(polygon.YC)))
        .map((polygon, index) => {
            const ys = flattenNumeric(polygon.YY);
            return {
                x: Number(polygon.XC),
                y: ys.length ? Math.min(...ys) : Number(polygon.YC),
                xref: "x",
                yref: "y",
                yanchor: "top",
                yshift: -2,
                text: polygon.name || `Z${index + 1}`,
                font: {
                    color: palette.text,
                    size: 10,
                },
                showarrow: false,
            };
        });
}

function getComboTitle(combo, comboIndex) {
    if (!combo) {
        return `Combinación ${comboIndex + 1}`;
    }

    return `C${comboIndex + 1}: P = ${combo.column1}`;
}

export function buildZapatas2PlotData(calculationResults, comboIndex, options = {}) {
    const palette=options.palette || LIGHT_PLOT_PALETTE;
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

    // Rango de color explícito (cmin/cmax), en vez de dejar que Plotly lo
    // auto-calcule: el contenedor se reutiliza entre pestañas de combinación
    // (Plotly.react() sobre el MISMO div, ver renderZapataPlot), y el
    // autorango de un coloraxis compartido puede arrastrar estado de la
    // combinación anterior o no eecalcularse igual en cada combo — eso hacía
    // que un mismo color no representara la misma presión entre polígonos.
    // Fijarlo a mano con el mínimo/máximo real de ESTA combinación garantiza
    // que los colores sean comparables entre todos los polígonos mostrados.
    let cmin=Infinity,cmax=-Infinity;
    for(const trace of traces)for(const row of trace.z)for(const value of row)if(Number.isFinite(value)){cmin=Math.min(cmin,value);cmax=Math.max(cmax,value);}
    if(!Number.isFinite(cmin))throw new Error('No hay presiones finitas para esta combinacion.');

    // Rango plano (todos los polígonos con el mismo valor, p.ej. sin
    // excentricidad de momento): cmin === cmax deja a Plotly normalizando
    // (v-cmin)/(cmax-cmin) = 0/0, que cada traza resuelve distinto — incluso
    // con el MISMO valor exacto, salían en colores distintos. Se ensancha un
    // poco el rango para que todas las trazas caigan en el mismo color.
    if (cmin !== undefined && cmax !== undefined && cmin === cmax) {
        const pad = Math.max(Math.abs(cmin) * 1e-3, 1e-6);
        cmin -= pad;
        cmax += pad;
    }

    const markers = buildColumnMarkers(columns, palette);

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
            title: "X (m)",
            scaleanchor: "y",
            scaleratio: 1,
            gridcolor: "#334155",
            zerolinecolor: "#475569",
        },
        yaxis: {
            title: "Y (m)",
            constrain: "domain",
            gridcolor: "#334155",
            zerolinecolor: "#475569",
        },
        coloraxis: {
            colorscale: matlabColorScale,
            cmin,
            cmax,
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
        showlegend: false,
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
        hovermode: "closest",
        annotations: buildPolygonAnnotations(polygons, palette),
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
        layout: {...themedPlotLayout(layout,palette),annotations:layout.annotations,
            coloraxis:{...layout.coloraxis,colorbar:plotColorbar({...layout.coloraxis.colorbar,title:{text:'Presión (tn/m²)',side:'right'}},palette)}},
        config,
    };
}


export function formatZapatas2Value(value,digits=3){return formatNumber(value,digits);}
