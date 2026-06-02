import { flectorDataState } from './config.js';

function parseNum(val) {
    if (val === null || val === undefined || val === '') return null;
    const num = parseFloat(String(val).replace(',', '.'));
    return isNaN(num) ? null : num;
}

function buildCutCurve(tipo, thetaDeg) {
    const curvas = flectorDataState[tipo];
    if (!curvas || curvas.length < 24) return null;

    const hasData = curvas.some(curva =>
        curva.some(p => parseNum(p.p) !== null || parseNum(p.m2) !== null || parseNum(p.m3) !== null)
    );
    if (!hasData) return null;

    const theta = ((thetaDeg || 0) % 360 + 360) % 360;
    const cosT = Math.cos(theta * Math.PI / 180);
    const sinT = Math.sin(theta * Math.PI / 180);

    const curveAngles = [];
    for (let c = 0; c < 24; c++) curveAngles.push(c * 15);

    function getInterp(angle) {
        const ca = ((angle % 360) + 360) % 360;
        let idx = 0;
        for (let i = 0; i < 24; i++) {
            if (curveAngles[i] <= ca) idx = i;
        }
        let nextIdx = (idx + 1) % 24;
        let a0 = curveAngles[idx], a1 = curveAngles[nextIdx];
        let range = a1 - a0;
        if (range <= 0) range += 360;
        let t = range > 0 ? (ca - a0) / range : 0;
        return { idx0: idx, idx1: nextIdx, t };
    }

    function getPt(cIdx, pIdx) {
        const pt = curvas[cIdx][pIdx];
        const m2 = parseNum(pt.m2), m3 = parseNum(pt.m3), p = parseNum(pt.p);
        if (m2 === null || m3 === null || p === null) return null;
        return { m2, m3, p };
    }

    const interpFwd = getInterp(theta);
    const mFwd = [], pFwd = [];
    for (let i = 0; i < 11; i++) {
        const pt0 = getPt(interpFwd.idx0, i);
        const pt1 = getPt(interpFwd.idx1, i);
        if (!pt0 || !pt1) continue;
        const m2 = pt0.m2 * (1 - interpFwd.t) + pt1.m2 * interpFwd.t;
        const m3 = pt0.m3 * (1 - interpFwd.t) + pt1.m3 * interpFwd.t;
        const p = pt0.p * (1 - interpFwd.t) + pt1.p * interpFwd.t;
        mFwd.push(m2 * sinT + m3 * cosT);
        pFwd.push(p);
    }

    return {
        m: mFwd,
        p: pFwd
    };
}

function buildCutCurve3D(tipo, thetaDeg) {
    const curvas = flectorDataState[tipo];
    if (!curvas || curvas.length < 24) return null;

    const theta = ((thetaDeg || 0) % 360 + 360) % 360;
    const curveAngles = [];
    for (let c = 0; c < 24; c++) curveAngles.push(c * 15);

    function getInterp(angle) {
        const ca = ((angle % 360) + 360) % 360;
        let idx = 0;
        for (let i = 0; i < 24; i++) {
            if (curveAngles[i] <= ca) idx = i;
        }
        let nextIdx = (idx + 1) % 24;
        let a0 = curveAngles[idx], a1 = curveAngles[nextIdx];
        let range = a1 - a0;
        if (range <= 0) range += 360;
        let t = range > 0 ? (ca - a0) / range : 0;
        return { idx0: idx, idx1: nextIdx, t };
    }

    function getPt(cIdx, pIdx) {
        const pt = curvas[cIdx][pIdx];
        const m2 = parseNum(pt.m2), m3 = parseNum(pt.m3), p = parseNum(pt.p);
        if (m2 === null || m3 === null || p === null) return null;
        return { m2, m3, p };
    }

    const interpFwd = getInterp(theta);
    const xS = [], yS = [], zS = [];
    for (let i = 0; i < 11; i++) {
        const pt0 = getPt(interpFwd.idx0, i);
        const pt1 = getPt(interpFwd.idx1, i);
        if (!pt0 || !pt1) continue;
        xS.push(pt0.m2 * (1 - interpFwd.t) + pt1.m2 * interpFwd.t);
        yS.push(pt0.m3 * (1 - interpFwd.t) + pt1.m3 * interpFwd.t);
        zS.push(pt0.p * (1 - interpFwd.t) + pt1.p * interpFwd.t);
    }

    if (xS.length > 0) {
        xS.push(xS[0]); yS.push(yS[0]); zS.push(zS[0]);
    }
    return { x: xS, y: yS, z: zS };
}

export function renderInteractionSurface(tipo) {
    const curvas = flectorDataState[tipo];
    if (!curvas || curvas.length < 24) return;

    const hasData = curvas.some(curva =>
        curva.some(p => parseNum(p.p) !== null || parseNum(p.m2) !== null || parseNum(p.m3) !== null)
    );
    if (!hasData) return;

    const x = [], y = [], z = [];
    const numPoints = 11;
    const numCurves = 24;

    let xMin = Infinity, xMax = -Infinity;
    let yMin = Infinity, yMax = -Infinity;
    let zMin = Infinity, zMax = -Infinity;

    for (let i = 0; i < numPoints; i++) {
        const xRow = [], yRow = [], zRow = [];
        for (let c = 0; c < numCurves; c++) {
            const punto = curvas[c][i];
            const mx = parseNum(punto.m2);
            const my = parseNum(punto.m3);
            const mz = parseNum(punto.p);
            xRow.push(mx); yRow.push(my); zRow.push(mz);
            if (mx !== null) { if (mx < xMin) xMin = mx; if (mx > xMax) xMax = mx; }
            if (my !== null) { if (my < yMin) yMin = my; if (my > yMax) yMax = my; }
            if (mz !== null) { if (mz < zMin) zMin = mz; if (mz > zMax) zMax = mz; }
        }
        xRow.push(parseNum(curvas[0][i].m2));
        yRow.push(parseNum(curvas[0][i].m3));
        zRow.push(parseNum(curvas[0][i].p));
        x.push(xRow); y.push(yRow); z.push(zRow);
    }

    if (xMin === Infinity) { xMin = -1; xMax = 1; }
    if (yMin === Infinity) { yMin = -1; yMax = 1; }
    if (zMin === Infinity) { zMin = -1; zMax = 1; }

    const xRange = xMax - xMin || 1;
    const yRange = yMax - yMin || 1;
    const zRange = zMax - zMin || 1;
    const xPad = xRange * 0.08;
    const yPad = yRange * 0.08;
    const zPad = zRange * 0.08;

    const initialPlan = 45;
    const initialElev = 25;

    const cut3d = buildCutCurve3D(tipo, initialPlan);
    const traces = [];

    traces.push({
        type: 'surface', x, y, z,
        opacity: 0.65, showscale: false,
        colorscale: [[0, 'rgba(37,99,235,0.85)'], [1, 'rgba(37,99,235,0.85)']],
        contours: {
            x: { show: true, color: 'rgba(200,200,220,0.35)', width: 1, highlight: false, usecolormap: false },
            y: { show: true, color: 'rgba(200,200,220,0.35)', width: 1, highlight: false, usecolormap: false },
            z: { show: true, color: 'rgba(200,200,220,0.35)', width: 1, highlight: false, usecolormap: false }
        },
        lighting: { ambient: 0.9, diffuse: 0.3, specular: 0.1, roughness: 0.8, fresnel: 0.1 },
        hoverinfo: 'x+y+z'
    });

    const PURPLE = 'rgba(168,85,247,0.95)';
    if (cut3d && cut3d.x.length > 0) {
        traces.push({
            type: 'scatter3d', mode: 'lines',
            x: cut3d.x, y: cut3d.y, z: cut3d.z,
            line: { color: PURPLE, width: 5 },
            showlegend: false, hoverinfo: 'skip'
        });
    }

    const RED = 'rgba(239,68,68,0.9)';
    const LW = 3;
    traces.push({ type: 'scatter3d', mode: 'lines', x: [0, 0], y: [0, 0], z: [zMin - zPad, zMax + zPad], line: { color: RED, width: LW }, showlegend: false, hoverinfo: 'skip' });
    traces.push({ type: 'scatter3d', mode: 'lines', x: [xMin - xPad, xMax + xPad], y: [0, 0], z: [0, 0], line: { color: RED, width: LW }, showlegend: false, hoverinfo: 'skip' });
    traces.push({ type: 'scatter3d', mode: 'lines', x: [0, 0], y: [yMin - yPad, yMax + yPad], z: [0, 0], line: { color: RED, width: LW }, showlegend: false, hoverinfo: 'skip' });
    traces.push({ type: 'scatter3d', mode: 'text', x: [0], y: [0], z: [zMax + zPad * 2], text: ['P'], textfont: { color: RED, size: 13 }, showlegend: false, hoverinfo: 'skip' });
    traces.push({ type: 'scatter3d', mode: 'text', x: [xMax + xPad * 2], y: [0], z: [0], text: ['M2'], textfont: { color: RED, size: 13 }, showlegend: false, hoverinfo: 'skip' });
    traces.push({ type: 'scatter3d', mode: 'text', x: [0], y: [yMax + yPad * 2], z: [0], text: ['M3'], textfont: { color: RED, size: 13 }, showlegend: false, hoverinfo: 'skip' });

    const pRad = initialPlan * Math.PI / 180;
    const eRad = initialElev * Math.PI / 180;
    const camR = 2.0;

    const layout = {
        scene: {
            xaxis: { showgrid: false, showticklabels: false, title: { text: '' }, showbackground: false, zeroline: false, showline: false, ticks: '' },
            yaxis: { showgrid: false, showticklabels: false, title: { text: '' }, showbackground: false, zeroline: false, showline: false, ticks: '' },
            zaxis: { showgrid: false, showticklabels: false, title: { text: '' }, showbackground: false, zeroline: false, showline: false, ticks: '' },
            bgcolor: 'rgba(0,0,0,0)', aspectmode: 'cube',
            camera: { up: { x: 0, y: 0, z: 1 }, eye: { x: camR * Math.cos(eRad) * Math.cos(pRad), y: camR * Math.cos(eRad) * Math.sin(pRad), z: camR * Math.sin(eRad) } }
        },
        paper_bgcolor: 'rgba(0,0,0,0)', plot_bgcolor: 'rgba(0,0,0,0)',
        margin: { t: 10, r: 10, b: 10, l: 10 }, autosize: true
    };

    const config = { displayModeBar: false, responsive: true };
    const chartId = tipo === 'Nominal' ? 'chart-nom-1' : 'chart-red-1';
    const el = document.getElementById(chartId);
    if (!el) return;
    el.style.width = '100%'; el.style.height = '100%'; el.innerHTML = '';

    const wrapper = document.createElement('div');
    wrapper.className = 'relative h-full w-full';
    const plotDiv = document.createElement('div');
    plotDiv.id = chartId + '-plot';
    plotDiv.className = 'h-full w-full';
    wrapper.appendChild(plotDiv);

    const overlay = document.createElement('div');
    overlay.className = 'pointer-events-auto absolute left-2 top-2 z-10 flex flex-col gap-1';
    overlay.innerHTML = `
        <div class="flex items-center gap-1">
            <span class="font-mono text-[10px] font-semibold uppercase tracking-widest text-red-500">Plan:</span>
            <input id="angle-plan-${chartId}" type="number" value="${initialPlan}" step="1" class="w-12 rounded border border-red-300 bg-white px-1 py-0.5 text-right font-mono text-[11px] text-red-600 dark:border-red-500/30 dark:bg-gray-900 dark:text-red-400">
            <span class="font-mono text-[9px] text-red-500">deg</span>
        </div>
        <div class="flex items-center gap-1">
            <span class="font-mono text-[10px] font-semibold uppercase tracking-widest text-red-500">Elevation:</span>
            <input id="angle-elev-${chartId}" type="number" value="${initialElev}" step="1" class="w-12 rounded border border-red-300 bg-white px-1 py-0.5 text-right font-mono text-[11px] text-red-600 dark:border-red-500/30 dark:bg-gray-900 dark:text-red-400">
            <span class="font-mono text-[9px] text-red-500">deg</span>
        </div>
    `;
    wrapper.appendChild(overlay);
    el.appendChild(wrapper);

    Plotly.newPlot(plotDiv.id, traces, layout, config);
    Plotly.Plots.resize(document.getElementById(plotDiv.id));

    let syncing = false;
    const plotEl = document.getElementById(plotDiv.id);
    plotEl.on('plotly_relayout', function(eventData) {
        if (syncing) return;
        if (eventData['scene.camera'] && eventData['scene.camera'].eye) {
            const eye = eventData['scene.camera'].eye;
            const ex = eye.x || 1, ey = eye.y || 1, ez = eye.z || 0.5;
            const r = Math.sqrt(ex * ex + ey * ey + ez * ez);
            const e = Math.asin(Math.min(1, Math.max(-1, ez / r))) * (180 / Math.PI);
            const p = ((Math.atan2(ey, ex) * 180 / Math.PI) % 360 + 360) % 360;
            syncing = true;
            const pi = document.getElementById('angle-plan-' + chartId);
            const ei = document.getElementById('angle-elev-' + chartId);
            if (pi) pi.value = p.toFixed(1);
            if (ei) ei.value = e.toFixed(1);
            syncing = false;
            updateCutCurve(tipo, p);
            render2DChart(tipo, p);
        }
    });

    const planInput = document.getElementById('angle-plan-' + chartId);
    const elevInput = document.getElementById('angle-elev-' + chartId);

    function updateCamera() {
        const p = parseFloat(planInput.value) || 0;
        const e = parseFloat(elevInput.value) || 0;
        const pR = p * Math.PI / 180;
        const eR = e * Math.PI / 180;
        const r = 2.0;
        syncing = true;
        Plotly.relayout(plotDiv.id, {
            'scene.camera.eye': { x: r * Math.cos(eR) * Math.cos(pR), y: r * Math.cos(eR) * Math.sin(pR), z: r * Math.sin(eR) }
        });
        syncing = false;
    }

    planInput.addEventListener('change', function() {
        updateCamera();
        const planVal = parseFloat(planInput.value) || 0;
        updateCutCurve(tipo, planVal);
        render2DChart(tipo, planVal);
    });
    elevInput.addEventListener('change', updateCamera);
}

function updateCutCurve(tipo, thetaDeg) {
    const cut3d = buildCutCurve3D(tipo, thetaDeg);
    if (!cut3d || cut3d.x.length === 0) return;

    const chartId = tipo === 'Nominal' ? 'chart-nom-1' : 'chart-red-1';
    const plotDivId = chartId + '-plot';
    const plotEl = document.getElementById(plotDivId);
    if (!plotEl) return;

    const PURPLE = 'rgba(168,85,247,0.95)';
    const traceCount = plotEl.data ? plotEl.data.length : 0;

    if (traceCount > 1) {
        Plotly.restyle(plotDivId, {
            x: [cut3d.x], y: [cut3d.y], z: [cut3d.z],
            'line.color': [PURPLE], 'line.width': [5], mode: ['lines']
        }, 1);
    } else {
        Plotly.addTraces(plotDivId, [{
            type: 'scatter3d', mode: 'lines',
            x: cut3d.x, y: cut3d.y, z: cut3d.z,
            line: { color: PURPLE, width: 5 },
            showlegend: false, hoverinfo: 'skip'
        }], 1);
    }
}

export function clearInteractionSurface(tipo) {
    const chartId = tipo === 'Nominal' ? 'chart-nom-1' : 'chart-red-1';
    const plotDivId = chartId + '-plot';
    const plotEl = document.getElementById(plotDivId);
    if (plotEl) Plotly.purge(plotDivId);
    const el = document.getElementById(chartId);
    if (el) el.innerHTML = '';
}

export function render2DChart(tipo, planDeg) {
    const data = buildCutCurve(tipo, planDeg);
    const curvas = flectorDataState[tipo];
    const hasData = curvas && curvas.length >= 24 && curvas.some(c => c.some(p => parseNum(p.p) !== null));
    if (!data || !hasData || data.m.length === 0) return;

    const trace = {
        type: 'scatter', mode: 'lines',
        x: data.m, y: data.p,
        line: { color: 'rgba(37,99,235,0.9)', width: 2 },
        showlegend: false, hoverinfo: 'x+y'
    };

    const RED = 'rgba(239,68,68,0.9)';
    let mMin = Math.min(...data.m), mMax = Math.max(...data.m);
    let pMin = Math.min(...data.p), pMax = Math.max(...data.p);
    if (mMin === mMax) { mMin -= 1; mMax += 1; }
    if (pMin === pMax) { pMin -= 1; pMax += 1; }
    const mPad = (mMax - mMin) * 0.1 || 0.1;
    const pPad = (pMax - pMin) * 0.1 || 0.1;

    const axP = { type: 'scatter', mode: 'lines', x: [0, 0], y: [pMin - pPad, pMax + pPad], line: { color: RED, width: 1.5 }, showlegend: false, hoverinfo: 'skip' };
    const axM = { type: 'scatter', mode: 'lines', x: [mMin - mPad, mMax + mPad], y: [0, 0], line: { color: RED, width: 1.5 }, showlegend: false, hoverinfo: 'skip' };

    const layout = {
        xaxis: {
            title: { text: 'M (tonf-m)', font: { color: RED, size: 11 } },
            color: '#71717a', gridcolor: '#27272a', zeroline: false,
            showline: true, linecolor: '#3f3f46', ticks: 'outside', tickfont: { color: '#71717a', size: 9 }
        },
        yaxis: {
            title: { text: 'P (tonf)', font: { color: RED, size: 11 } },
            color: '#71717a', gridcolor: '#27272a', zeroline: false,
            showline: true, linecolor: '#3f3f46', ticks: 'outside', tickfont: { color: '#71717a', size: 9 }
        },
        paper_bgcolor: 'rgba(0,0,0,0)', plot_bgcolor: 'rgba(0,0,0,0)',
        margin: { t: 15, r: 15, b: 40, l: 45 },
        autosize: true, showlegend: false, dragmode: 'pan'
    };

    const config = { displayModeBar: false, responsive: true, scrollZoom: true };
    const chart2dId = tipo === 'Nominal' ? 'chart-nom-2' : 'chart-red-2';
    const el = document.getElementById(chart2dId);
    if (!el) return;
    el.style.width = '100%'; el.style.height = '100%'; el.innerHTML = '';

    const wrapper = document.createElement('div');
    wrapper.style.cssText = 'position:relative;width:100%;height:100%;';
    const plotDiv = document.createElement('div');
    plotDiv.id = chart2dId + '-plot';
    plotDiv.style.cssText = 'width:100%;height:100%;';
    wrapper.appendChild(plotDiv);
    el.appendChild(wrapper);

    Plotly.newPlot(plotDiv.id, [trace, axP, axM], layout, config);
    Plotly.Plots.resize(document.getElementById(plotDiv.id));
}

export function clear2DChart(tipo) {
    const chart2dId = tipo === 'Nominal' ? 'chart-nom-2' : 'chart-red-2';
    const plotDivId = chart2dId + '-plot';
    const plotEl = document.getElementById(plotDivId);
    if (plotEl) Plotly.purge(plotDivId);
    const el = document.getElementById(chart2dId);
    if (el) el.innerHTML = ''; 
}
