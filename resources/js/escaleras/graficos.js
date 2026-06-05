
function niceTicks(min, max, count = 5) {
    const range = max - min || 1;
    const raw = range / count;
    const magnitude = Math.pow(10, Math.floor(Math.log10(raw)));
    const residual = raw / magnitude;
    let tick;
    if (residual <= 1.5) tick = magnitude;
    else if (residual <= 3) tick = 2 * magnitude;
    else if (residual <= 7) tick = 5 * magnitude;
    else tick = 10 * magnitude;

    const low = Math.ceil(min / tick) * tick;
    const high = Math.floor(max / tick) * tick;
    const ticks = [];
    for (let v = low; v <= high + tick * 0.5; v += tick) {
        ticks.push(Math.round(v * 1e10) / 1e10);
    }
    return ticks;
}

export function drawDiagrams(containerId, data) {
    const container = document.getElementById(containerId);
    if (!container) return;

    const { points, L } = data;
    const totalWidth = container.clientWidth || 700;
    const margin = { top: 20, right: 30, bottom: 45, left: 65 };
    const fullW = totalWidth - 20;
    const fullH = 250;

    const plotW = fullW - margin.left - margin.right;
    const plotH = fullH - margin.top - margin.bottom;

    const xTicks = niceTicks(0, L, 6);
    const allM = points.map(p => p.m);
    const mMin = Math.min(...allM);
    const mMax = Math.max(...allM);
    const mTicks = niceTicks(mMin, mMax, 6);

    const originY = margin.top + plotH;

    let svg = `<svg width="${fullW}" height="${fullH}" viewBox="0 0 ${fullW} ${fullH}" xmlns="http://www.w3.org/2000/svg">`;
    svg += `<rect width="${fullW}" height="${fullH}" fill="#151922" rx="8" />`;

    // Y axis label
    svg += `<text x="12" y="${margin.top + plotH / 2}" fill="#a0aabf" font-size="10" text-anchor="middle" transform="rotate(-90, 12, ${margin.top + plotH / 2})">M (tonf-m)</text>`;

    // Grid & Y ticks
    mTicks.forEach(t => {
        const py = originY - ((t - mMin) / (mMax - mMin || 1)) * plotH;
        svg += `<line x1="${margin.left}" y1="${py}" x2="${margin.left + plotW}" y2="${py}" stroke="#282e3f" stroke-width="0.5" />`;
        svg += `<text x="${margin.left - 8}" y="${py + 4}" fill="#a0aabf" font-size="9" text-anchor="end">${t.toFixed(2)}</text>`;
    });

    // M curve
    let mPath = '';
    points.forEach((p, i) => {
        const px = margin.left + (p.x / L) * plotW;
        const py = originY - ((p.m - mMin) / (mMax - mMin || 1)) * plotH;
        mPath += (i === 0 ? 'M' : 'L') + ` ${px} ${py}`;
    });
    svg += `<path d="${mPath}" fill="none" stroke="#ef4444" stroke-width="2" />`;
    svg += `<path d="${mPath} L ${margin.left + plotW} ${originY} L ${margin.left} ${originY} Z" fill="#ef4444" fill-opacity="0.08" />`;

    // Zero line
    const zeroY = originY - ((0 - mMin) / (mMax - mMin || 1)) * plotH;
    svg += `<line x1="${margin.left}" y1="${zeroY}" x2="${margin.left + plotW}" y2="${zeroY}" stroke="#4a5568" stroke-width="1" />`;

    // X axis line
    svg += `<line x1="${margin.left}" y1="${originY}" x2="${margin.left + plotW}" y2="${originY}" stroke="#4a5568" stroke-width="1" />`;

    // X ticks
    xTicks.forEach(t => {
        const px = margin.left + (t / L) * plotW;
        svg += `<line x1="${px}" y1="${margin.top}" x2="${px}" y2="${originY}" stroke="#282e3f" stroke-width="0.5" />`;
        svg += `<line x1="${px}" y1="${originY}" x2="${px}" y2="${originY + 5}" stroke="#a0aabf" stroke-width="1" />`;
        svg += `<text x="${px}" y="${originY + 18}" fill="#a0aabf" font-size="9" text-anchor="middle">${t.toFixed(2)}</text>`;
    });

    // X axis label
    svg += `<text x="${margin.left + plotW / 2}" y="${originY + 35}" fill="#a0aabf" font-size="10" text-anchor="middle">x (m)</text>`;

    // Y axis line
    svg += `<line x1="${margin.left}" y1="${margin.top}" x2="${margin.left}" y2="${originY}" stroke="#4a5568" stroke-width="1" />`;

    svg += `</svg>`;
    container.innerHTML = svg;
    container.style.height = (fullH + 10) + 'px';
}

export function drawReinforcement(containerId, data) {
    const container = document.getElementById(containerId);
    if (!container) return;

    const { diameter, spacing } = data;
    const width = container.clientWidth;
    const height = 180;

    let svg = `<svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">`;
    svg += `<rect width="${width}" height="${height}" fill="#151922" rx="8" />`;

    const label = `${diameter}@${spacing}cm`;
    const textW = 130;
    const bx = textW + 10;
    const bw = width - bx - 30;
    const ty = 60;
    const by = 110;
    const hook = 15;

    // Text on the left
    svg += `<text x="10" y="${ty + 10}" fill="#a0aabf" font-size="11" font-weight="bold">ESQUEMA DE</text>`;
    svg += `<text x="10" y="${ty + 25}" fill="#a0aabf" font-size="11" font-weight="bold">REFUERZO</text>`;
    svg += `<text x="10" y="${ty + 40}" fill="#a0aabf" font-size="11" font-weight="bold">LONGITUDINAL</text>`;

    // Top bar - corchete hacia abajo (inverted U)
    svg += `<path d="M ${bx} ${ty + hook} L ${bx} ${ty} L ${bx + bw} ${ty} L ${bx + bw} ${ty + hook}" fill="none" stroke="white" stroke-width="2" />`;
    svg += `<text x="${bx + 5}" y="${ty - 10}" fill="white" font-size="11" text-anchor="start">${label}</text>`;
    svg += `<text x="${bx + bw - 5}" y="${ty - 10}" fill="white" font-size="11" text-anchor="end">${label}</text>`;

    // Bottom bar - corchete hacia arriba (U shape)
    svg += `<path d="M ${bx} ${by - hook} L ${bx} ${by} L ${bx + bw} ${by} L ${bx + bw} ${by - hook}" fill="none" stroke="white" stroke-width="2" />`;
    svg += `<text x="${bx + bw / 2}" y="${by + 20}" fill="white" font-size="11" text-anchor="middle">${label}</text>`;

    svg += `</svg>`;
    container.innerHTML = svg;
    container.style.height = '200px';
}
