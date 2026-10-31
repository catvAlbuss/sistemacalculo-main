// Dibujos técnicos del muro a escala. Son hojas de plano: fondo blanco y tinta oscura en ambos temas.
const INK = '#1f2933';
const MUTED = '#52606d';
const FORCE = '#b42318';
const FONT = 'font-family="Figtree, Arial, Helvetica, sans-serif"';

const toNumber = (value, fallback = 0) => {
    const parsed = parseFloat(value);
    return Number.isFinite(parsed) ? parsed : fallback;
};
const fixed = (value, decimals = 2) => {
    const parsed = parseFloat(value);
    return Number.isFinite(parsed) ? parsed.toFixed(decimals) : '-';
};
let sheetCount = 0;
const points = list => list.map(p => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ');

const DEFS = `<defs>
    <pattern id="wall-concrete" width="28" height="28" patternUnits="userSpaceOnUse">
        <rect width="28" height="28" fill="#eef0f2"/>
        <path d="M5 7l4 1-3 3zM19 4l3 3-4 1zM12 18l4-1-1 4zM23 20l2 4-4-1z" fill="none" stroke="#7b8794" stroke-width=".8"/>
        <circle cx="13" cy="9" r=".8" fill="#7b8794"/><circle cx="4" cy="19" r=".8" fill="#7b8794"/><circle cx="22" cy="13" r=".8" fill="#7b8794"/>
    </pattern>
    <pattern id="wall-soil" width="16" height="16" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
        <rect width="16" height="16" fill="#f7efe0"/>
        <path d="M0 4h16" stroke="#b08d57" stroke-width=".8"/>
        <circle cx="8" cy="11" r=".9" fill="#b08d57"/>
    </pattern>
    <marker id="wall-force" markerWidth="9" markerHeight="9" refX="8" refY="4.5" orient="auto">
        <path d="M0 0L9 4.5L0 9z" fill="${FORCE}"/>
    </marker>
    <marker id="wall-load" markerWidth="7" markerHeight="7" refX="6" refY="3.5" orient="auto">
        <path d="M0 0L7 3.5L0 7z" fill="${INK}"/>
    </marker>
</defs>`;

function text(x, y, label, { size = 13, anchor = 'middle', weight = 'normal', fill = INK, rotate = null } = {}) {
    const transform = rotate === null ? '' : ` transform="rotate(${rotate} ${x.toFixed(1)} ${y.toFixed(1)})"`;
    return `<text x="${x.toFixed(1)}" y="${y.toFixed(1)}" ${FONT} font-size="${size}" font-weight="${weight}" text-anchor="${anchor}" fill="${fill}" paint-order="stroke" stroke="#fff" stroke-width="3"${transform}>${label}</text>`;
}

// Cota normalizada: líneas de extensión, trazos a 45° y el valor sobre la línea.
function dimension(a, b, label, offset) {
    const length = Math.hypot(b.x - a.x, b.y - a.y);
    if (!length) return '';
    const ux = (b.x - a.x) / length, uy = (b.y - a.y) / length;
    const nx = -uy, ny = ux, side = Math.sign(offset) || 1;
    const start = { x: a.x + nx * offset, y: a.y + ny * offset };
    const end = { x: b.x + nx * offset, y: b.y + ny * offset };
    const line = (p, q, width = .9) => `<line x1="${p.x.toFixed(1)}" y1="${p.y.toFixed(1)}" x2="${q.x.toFixed(1)}" y2="${q.y.toFixed(1)}" stroke="${MUTED}" stroke-width="${width}"/>`;
    const tick = p => line({ x: p.x - (ux + nx) * 4, y: p.y - (uy + ny) * 4 }, { x: p.x + (ux + nx) * 4, y: p.y + (uy + ny) * 4 }, 1.5);
    const shift = p => ({ x: p.x + nx * side * 5, y: p.y + ny * side * 5 });
    const vertical = Math.abs(uy) > .9;
    const middle = vertical
        ? { x: (start.x + end.x) / 2 - 5, y: (start.y + end.y) / 2 }
        : { x: (start.x + end.x) / 2, y: (start.y + end.y) / 2 - 5 };
    return line(a, shift(start)) + line(b, shift(end)) + line(start, end) + tick(start) + tick(end)
        + text(middle.x, middle.y, label, { size: 12, fill: INK, rotate: vertical ? -90 : null });
}

function groundLine(a, b) {
    const ticks = [];
    const length = Math.hypot(b.x - a.x, b.y - a.y);
    const ux = (b.x - a.x) / length, uy = (b.y - a.y) / length;
    for (let d = 8; d < length; d += 16) {
        const p = { x: a.x + ux * d, y: a.y + uy * d };
        ticks.push(`<line x1="${p.x.toFixed(1)}" y1="${p.y.toFixed(1)}" x2="${(p.x - 6).toFixed(1)}" y2="${(p.y + 7).toFixed(1)}" stroke="${INK}" stroke-width=".9"/>`);
    }
    return `<line x1="${a.x.toFixed(1)}" y1="${a.y.toFixed(1)}" x2="${b.x.toFixed(1)}" y2="${b.y.toFixed(1)}" stroke="${INK}" stroke-width="2"/>${ticks.join('')}`;
}

export function wallGeometry(dimensions = {}, predim = {}) {
    return {
        punta: toNumber(dimensions.A89),
        batter: toNumber(dimensions.A83),
        crown: toNumber(dimensions.C74),
        heel: toNumber(dimensions.D89),
        hz: toNumber(dimensions.F86),
        stem: toNumber(dimensions.E79),
        rise: toNumber(dimensions.E74),
        keyX: toNumber(dimensions.C92),
        keyTop: toNumber(dimensions.F91),
        keyBottom: toNumber(dimensions.F95),
        keyDepth: toNumber(dimensions.G94),
        front: toNumber(predim.B19),
        surcharge: toNumber(predim.B25),
    };
}

// Polígono en metros: origen en la punta, al nivel inferior de la zapata.
export function wallOutline(geo) {
    const back = geo.punta + geo.batter + geo.crown;
    const base = back + geo.heel;
    const outline = [{ x: 0, y: 0 }];
    if (geo.keyDepth > 0 && geo.keyTop > 0) {
        const left = Math.max(geo.keyX - geo.keyTop / 2, 0);
        const right = Math.min(geo.keyX + geo.keyTop / 2, base);
        const inset = Math.max((right - left - geo.keyBottom) / 2, 0);
        outline.push({ x: left, y: 0 }, { x: left + inset, y: -geo.keyDepth }, { x: right - inset, y: -geo.keyDepth }, { x: right, y: 0 });
    }
    const top = geo.hz + geo.stem;
    outline.push({ x: base, y: 0 }, { x: base, y: geo.hz }, { x: back, y: geo.hz }, { x: back, y: top },
        { x: back - geo.crown, y: top }, { x: geo.punta, y: geo.hz }, { x: 0, y: geo.hz });
    return outline;
}

function drawSection(geo, map) {
    const back = geo.punta + geo.batter + geo.crown;
    const base = back + geo.heel;
    const top = geo.hz + geo.stem;
    const end = base + .7;
    const surface = x => top + (geo.heel > 0 ? geo.rise * Math.min(x - back, geo.heel) / geo.heel : 0);
    const fill = [{ x: back, y: geo.hz }, { x: back, y: top }, { x: base, y: surface(base) }, { x: end, y: surface(base) }, { x: end, y: 0 }, { x: base, y: 0 }, { x: base, y: geo.hz }].map(map);
    const frontSoil = geo.front > 0 ? [{ x: -.7, y: 0 }, { x: -.7, y: geo.front }, { x: geo.punta + geo.batter * Math.max(geo.front - geo.hz, 0) / Math.max(geo.stem, .01), y: geo.front }, { x: geo.punta, y: geo.hz }, { x: 0, y: geo.hz }, { x: 0, y: 0 }].map(map) : null;
    return `<polygon points="${points(fill)}" fill="url(#wall-soil)"/>`
        + (frontSoil ? `<polygon points="${points(frontSoil)}" fill="url(#wall-soil)"/>` : '')
        + groundLine(map({ x: back, y: top }), map({ x: base, y: surface(base) })) + groundLine(map({ x: base, y: surface(base) }), map({ x: end, y: surface(base) }))
        + (geo.front > 0 ? groundLine(map({ x: -.7, y: geo.front }), map({ x: geo.punta + geo.batter * Math.max(geo.front - geo.hz, 0) / Math.max(geo.stem, .01), y: geo.front })) : '')
        + `<polygon points="${points(wallOutline(geo).map(map))}" fill="url(#wall-concrete)" stroke="${INK}" stroke-width="2.2" stroke-linejoin="miter"/>`;
}

function sectionDimensions(geo, map) {
    const back = geo.punta + geo.batter + geo.crown;
    const base = back + geo.heel;
    const top = geo.hz + geo.stem;
    const low = geo.keyDepth > 0 ? -geo.keyDepth : 0;
    const under = (a, b, label, offset) => dimension(map({ x: a, y: low }), map({ x: b, y: low }), label, offset);
    return under(0, geo.punta, fixed(geo.punta), 26) + under(geo.punta, back, fixed(back - geo.punta), 26) + under(back, base, fixed(geo.heel), 26) + under(0, base, `B = ${fixed(base)}`, 52)
        + dimension(map({ x: base + .7, y: top }), map({ x: base + .7, y: geo.hz }), fixed(geo.stem), -26)
        + dimension(map({ x: base + .7, y: geo.hz }), map({ x: base + .7, y: 0 }), fixed(geo.hz), -26)
        + dimension(map({ x: base + .7, y: top }), map({ x: base + .7, y: 0 }), `H = ${fixed(top)}`, -56)
        + dimension(map({ x: back - geo.crown, y: top }), map({ x: back, y: top }), fixed(geo.crown), -18);
}

// Cada hoja usa sus propios ids: un patrón definido en una pestaña oculta no se pinta en otra.
function sheet(width, height, title, description, body) {
    const id = `wall-sheet-${++sheetCount}`;
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" style="max-width:${width}px;margin-inline:auto" role="img" aria-label="${description}">${DEFS}
        <rect width="${width}" height="${height}" fill="#fff"/>
        ${text(20, 30, title, { size: 13, anchor: 'start', weight: 'bold' })}
        ${body}</svg>`.replace(/wall-(concrete|soil|force|load)/g, `${id}-$1`);
}

export function sectionSVG(geo) {
    const base = geo.punta + geo.batter + geo.crown + geo.heel;
    const top = geo.hz + geo.stem;
    const totalHeight = top + geo.rise + Math.max(geo.keyDepth, 0);
    const scale = Math.min(500 / Math.max(totalHeight, .1), 480 / Math.max(base + 1.4, .1));
    const width = (base + 1.4) * scale + 200, height = totalHeight * scale + 170;
    const originX = .7 * scale + 60, originY = 60 + (top + geo.rise) * scale;
    const map = p => ({ x: originX + p.x * scale, y: originY - p.y * scale });
    return sheet(Math.round(width), Math.round(height), 'SECCIÓN TÍPICA DEL MURO', 'Sección del muro de contención con sus cotas en metros',
        drawSection(geo, map) + sectionDimensions(geo, map)
        + text(20, height - 12, 'Cotas en metros. Dibujo a escala geométrica.', { size: 12, anchor: 'start', fill: MUTED }));
}

export function predimSectionSVG({ muro, suelo, sueloDelante }, input = {}) {
    const back = muro[3].x, crown = toNumber(input.D45), punta = muro[6].x, hz = muro[2].y;
    return sectionSVG({
        punta, batter: back - crown - punta, crown, heel: muro[1].x - back, hz, stem: muro[4].y - hz,
        rise: Math.max(suelo[1].y - suelo[0].y, 0), keyDepth: 0, keyTop: 0, keyBottom: 0, keyX: 0,
        front: toNumber(sueloDelante[0].y),
    });
}

function pressureStation(x, y, heightPx, shape, widthPx, { title, fill, stroke, force, arm, stress, scale }) {
    const shapes = {
        triangle: [{ x, y }, { x: x + widthPx, y: y + heightPx }, { x, y: y + heightPx }],
        rectangle: [{ x, y }, { x: x + widthPx, y }, { x: x + widthPx, y: y + heightPx }, { x, y: y + heightPx }],
    };
    const armY = y + heightPx - toNumber(arm) * scale;
    const tail = x + widthPx + 80;
    return text(x, y - 26, title, { size: 13, anchor: 'start', weight: 'bold' })
        + `<polygon points="${points(shapes[shape])}" fill="${fill}" stroke="${stroke}" stroke-width="1.6"/>`
        + `<line x1="${x}" y1="${y - 8}" x2="${x}" y2="${y + heightPx + 8}" stroke="${INK}" stroke-width="1.6"/>`
        + `<line x1="${tail.toFixed(1)}" y1="${armY.toFixed(1)}" x2="${x + 3}" y2="${armY.toFixed(1)}" stroke="${FORCE}" stroke-width="2.6" marker-end="url(#wall-force)"/>`
        + text(tail, armY - 8, `${fixed(force)} tn/m`, { size: 13, anchor: 'end', weight: 'bold', fill: FORCE })
        + text(tail, armY + 17, `y = ${fixed(arm)} m`, { size: 12, anchor: 'end', fill: MUTED })
        + text(x, y + heightPx + 24, `σ = ${fixed(stress)} tn/m²`, { size: 12, anchor: 'start' });
}

export function loadDiagramSVG(geo, loads = {}) {
    const back = geo.punta + geo.batter + geo.crown;
    const base = back + geo.heel;
    const top = geo.hz + geo.stem;
    const wallHeight = toNumber(loads.H, top + geo.rise);
    const totalHeight = top + geo.rise + Math.max(geo.keyDepth, 0);
    const scale = 440 / Math.max(totalHeight, .1);
    const originX = 210 + .7 * scale, originY = 108 + (top + geo.rise) * scale;
    const map = p => ({ x: originX + p.x * scale, y: originY - p.y * scale });
    const stationY = originY - wallHeight * scale, stationH = wallHeight * scale;
    const seismicStress = wallHeight > 0 ? 2 * toNumber(loads.seismicForce) / wallHeight : 0;
    const maxStress = Math.max(toNumber(loads.activeStress), toNumber(loads.surchargeStress), seismicStress, toNumber(loads.passiveStress), .01);
    const pressure = value => 34 + toNumber(value) * 60 / maxStress;
    const first = map({ x: base + .7, y: 0 }).x + 44;
    const span = 214;

    const passiveTop = map({ x: 0, y: geo.front }).y;
    const passiveBottom = map({ x: 0, y: -geo.keyDepth }).y;
    const passiveX = map({ x: -.7, y: 0 }).x - 12;
    const passiveW = pressure(loads.passiveStress);
    const passiveY = originY - toNumber(loads.passiveArm) * scale;
    const passive = geo.front > 0 || geo.keyDepth > 0 ? `<polygon points="${passiveX},${passiveTop} ${passiveX},${passiveBottom} ${(passiveX - passiveW).toFixed(1)},${passiveBottom}" fill="#d3e0f2" stroke="#1959b8" stroke-width="1.6"/>
        <line x1="${(passiveX - passiveW - 34).toFixed(1)}" y1="${passiveY.toFixed(1)}" x2="${passiveX - 3}" y2="${passiveY.toFixed(1)}" stroke="${FORCE}" stroke-width="2.6" marker-end="url(#wall-force)"/>
        ${text(passiveX - passiveW / 2, passiveTop - 42, 'PASIVO', { size: 12, weight: 'bold' })}
        ${text(passiveX - passiveW / 2, passiveTop - 26, `${fixed(loads.passiveForce)} tn/m`, { size: 12, weight: 'bold', fill: FORCE })}
        ${text(passiveX - passiveW / 2, passiveTop - 10, `y = ${fixed(loads.passiveArm)} m`, { size: 12, fill: MUTED })}
        ${text(passiveX - passiveW / 2, passiveBottom + 20, `σ = ${fixed(loads.passiveStress)} tn/m²`, { size: 12 })}` : '';

    const crest = map({ x: back, y: top });
    const crestEnd = map({ x: base + .7, y: top + geo.rise });
    const surchargeArrows = geo.surcharge > 0 ? Array.from({ length: 7 }, (_, i) => {
        const x = crest.x + (crestEnd.x - crest.x) * (i + .5) / 7;
        const ratio = (x - crest.x) / Math.max(geo.heel * scale, 1);
        const y = crest.y + (map({ x: base, y: top + geo.rise }).y - crest.y) * Math.min(ratio, 1) - 4;
        return `<line x1="${x.toFixed(1)}" y1="${(y - 30).toFixed(1)}" x2="${x.toFixed(1)}" y2="${y.toFixed(1)}" stroke="${INK}" stroke-width="1.3" marker-end="url(#wall-load)"/>`;
    }).join('') + text((crest.x + crestEnd.x) / 2, crest.y - 44 - (crest.y - crestEnd.y) / 2, `s/c = ${fixed(geo.surcharge)} tn/m²`, { size: 12 }) : '';

    const body = drawSection(geo, map) + passive + surchargeArrows
        + pressureStation(first, stationY, stationH, 'triangle', pressure(loads.activeStress), { title: 'EMPUJE ACTIVO', fill: '#d4e8da', stroke: '#2f6f4f', force: loads.activeForce, arm: loads.activeArm, stress: loads.activeStress, scale })
        + pressureStation(first + span, stationY, stationH, 'rectangle', pressure(loads.surchargeStress), { title: 'SOBRECARGA', fill: '#f4e3bd', stroke: '#a16b12', force: loads.surchargeForce, arm: loads.surchargeArm, stress: loads.surchargeStress, scale })
        + pressureStation(first + span * 2, stationY, stationH, 'triangle', pressure(seismicStress), { title: 'INCREMENTO SÍSMICO', fill: '#f6d2cb', stroke: FORCE, force: loads.seismicForce, arm: loads.seismicArm, stress: seismicStress, scale });
    const width = Math.round(first + span * 3 + 10), height = Math.round(originY + geo.keyDepth * scale + 74);
    return sheet(width, height, 'DIAGRAMA DE EMPUJES SOBRE EL MURO', 'Diagrama de presiones activa, de sobrecarga, sísmica y pasiva con sus resultantes',
        body + text(20, height - 12, 'Componentes horizontales por metro lineal de muro; y medida desde la base. Geometría a escala; diagramas de presión esquemáticos.', { size: 12, anchor: 'start', fill: MUTED }));
}

function forcePanel(series, key, x, y, width, height, color, unit) {
    if (!series.length) return text(x + width / 2, y + height / 2, 'Sin elemento', { size: 12, fill: MUTED });
    const peak = Math.max(...series.map(point => Math.abs(point[key])), .01);
    const span = series.at(-1).x || 1;
    const zero = y + height - 4;
    const map = point => ({ x: x + point.x / span * width, y: zero - point[key] / peak * (height - 26) });
    const curve = series.map(map);
    const root = series[0][key];
    return `<polygon points="${points([{ x, y: zero }, ...curve, { x: x + width, y: zero }])}" fill="${color}" fill-opacity=".28" stroke="${color}" stroke-width="1.8"/>
        <line x1="${x}" y1="${zero}" x2="${x + width}" y2="${zero}" stroke="${INK}" stroke-width="1.2"/>
        <line x1="${x}" y1="${y}" x2="${x}" y2="${y + height}" stroke="${INK}" stroke-width="2"/>
        ${text(x + width, y + 14, `${fixed(root)} ${unit}`, { size: 13, anchor: 'end', weight: 'bold', fill: INK })}
        ${text(x + width, y + height + 15, `x = ${fixed(span)} m`, { size: 12, anchor: 'end', fill: MUTED })}`;
}

export function forcesDiagramSVG(series, mode) {
    const titles = { pantalla: 'PANTALLA', punta: 'PUNTA', talon: 'TALÓN', key: 'DENTELLÓN' };
    const panelW = 236, panelH = 130, startX = 92, gap = 28;
    const width = startX + 4 * (panelW + gap) + 10, height = 426;
    const body = Object.entries(titles).map(([element, title], index) => {
        const x = startX + index * (panelW + gap);
        return text(x + panelW / 2, 66, title, { size: 13, weight: 'bold' })
            + forcePanel(series[element], 'Mu', x, 82, panelW, panelH, '#1959b8', 'Tn·m')
            + forcePanel(series[element], 'Vu', x, 238, panelW, panelH, '#b42318', 'Tn');
    }).join('');
    return sheet(width, height, `DIAGRAMAS DE MOMENTO Y CORTANTE ÚLTIMOS (${mode})`, 'Diagramas de momento y cortante últimos por elemento', body
        + text(30, 150, 'Mu', { size: 13, weight: 'bold', fill: '#1959b8' }) + text(30, 306, 'Vu', { size: 13, weight: 'bold', fill: '#b42318' })
        + text(20, height - 10, 'x desde la raíz de cada elemento hacia su extremo libre. El valor indicado es el de la raíz; el corte de diseño se toma a la distancia d.', { size: 12, anchor: 'start', fill: MUTED }));
}

export function reinforcementSVG(geo, labels = {}, cutoffs = null) {
    const base = geo.punta + geo.batter + geo.crown + geo.heel;
    const back = geo.punta + geo.batter + geo.crown;
    const top = geo.hz + geo.stem;
    const totalHeight = top + Math.max(geo.keyDepth, 0);
    const scale = Math.min(560 / Math.max(totalHeight, .1), 480 / Math.max(base, .1));
    const originX = 300, originY = 80 + top * scale, cover = .07;
    const map = p => ({ x: originX + p.x * scale, y: originY - p.y * scale });
    const width = Math.round(originX + base * scale + 300), height = Math.round(originY + Math.max(geo.keyDepth, 0) * scale + 90);
    const bar = (a, b, color = '#b42318', extra = '') => {
        const p = map(a), q = map(b);
        return `<line x1="${p.x.toFixed(1)}" y1="${p.y.toFixed(1)}" x2="${q.x.toFixed(1)}" y2="${q.y.toFixed(1)}" stroke="${color}" stroke-width="2.2" ${extra}/>`;
    };
    const dots = (a, b, count) => Array.from({ length: count }, (_, i) => {
        const t = (i + .5) / count, p = map({ x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t });
        return `<circle cx="${p.x.toFixed(1)}" cy="${p.y.toFixed(1)}" r="2.6" fill="#1959b8"/>`;
    }).join('');
    const callout = (point, x, y, label, anchor) => {
        const p = map(point);
        return `<polyline points="${p.x.toFixed(1)},${p.y.toFixed(1)} ${x},${y} ${x + (anchor === 'end' ? -8 : 8)},${y}" fill="none" stroke="${MUTED}" stroke-width="1"/>`
            + text(x + (anchor === 'end' ? -12 : 12), y + 4, label, { size: 13, anchor, weight: 'bold' });
    };
    const inner = back - cover, outerTop = { x: back - geo.crown + cover, y: top - cover };
    const outerBottom = { x: geo.punta + cover, y: geo.hz };
    const stemFaceTop = { x: inner, y: top - cover }, stemFaceBottom = { x: inner, y: cover };
    const footTop = geo.hz - cover;
    const rightX = originX + base * scale + 30, leftX = originX - 40;
    const lowY = map({ x: 0, y: 0 }).y;
    const cutoffH = cutoffs?.pantalla?.L || 0;
    const body = `<polygon points="${points(wallOutline(geo).map(map))}" fill="#f4f5f7" stroke="${INK}" stroke-width="2.2"/>`
        + bar(stemFaceBottom, stemFaceTop)
        + (cutoffH > 0 ? bar({ x: inner - .05, y: cover }, { x: inner - .05, y: geo.hz + cutoffH }, '#7a1f12') : '')
        + bar(outerBottom, outerTop)
        + bar({ x: cover, y: footTop }, { x: base - cover, y: footTop })
        + bar({ x: cover, y: cover }, { x: base - cover, y: cover })
        + dots({ x: inner - .03, y: geo.hz }, { x: inner - .03, y: top - .15 }, 12)
        + dots({ x: outerBottom.x + .03, y: geo.hz + .1 }, { x: outerTop.x + .03, y: top - .15 }, 10)
        + dots({ x: cover + .05, y: footTop - .04 }, { x: base - cover - .05, y: footTop - .04 }, 14)
        + dots({ x: cover + .05, y: cover + .04 }, { x: base - cover - .05, y: cover + .04 }, 14)
        + callout({ x: inner, y: geo.hz + geo.stem * .78 }, rightX, originY - geo.stem * .8 * scale, `${labels.pantalla?.principal || '-'}`, 'start')
        + callout({ x: inner - .03, y: geo.hz + geo.stem * .55 }, rightX, originY - geo.stem * .6 * scale, `Transv.: ${labels.pantalla?.transversal || '-'}`, 'start')
        + callout({ x: outerBottom.x + (outerTop.x - outerBottom.x) * .6, y: geo.hz + geo.stem * .6 }, leftX, originY - geo.stem * .72 * scale, labels.pantalla?.secundario || '-', 'end')
        + callout({ x: outerBottom.x + (outerTop.x - outerBottom.x) * .4, y: geo.hz + geo.stem * .4 }, leftX, originY - geo.stem * .55 * scale, `Transv.: ${labels.pantalla?.transversal2 || '-'}`, 'end')
        + callout({ x: geo.punta * .5, y: cover }, leftX, lowY + 26, labels.punta?.principal || '-', 'end')
        + callout({ x: geo.punta * .3, y: footTop }, leftX, lowY - 50, `Punta transv.: ${labels.punta?.transversal || '-'}`, 'end')
        + callout({ x: back + geo.heel * .5, y: footTop }, rightX, lowY - 50, labels.talon?.principal || '-', 'start')
        + callout({ x: back + geo.heel * .7, y: cover }, rightX, lowY + 26, `Talón transv.: ${labels.talon?.transversal || '-'}`, 'start')
        + (cutoffH > 0 ? text(map({ x: inner, y: geo.hz + cutoffH }).x - 8, map({ x: inner, y: geo.hz + cutoffH }).y - 6, `Recorte h = ${fixed(cutoffH)} m`, { size: 12, anchor: 'end', fill: '#7a1f12' }) : '')
        + (geo.keyDepth > 0 ? callout({ x: geo.keyX, y: -geo.keyDepth * .5 }, rightX, lowY + 58, `Dentellón: ${labels.key?.principal || '-'}`, 'start') : '');
    return sheet(width, height, 'DISTRIBUCIÓN DEL REFUERZO', 'Distribución del refuerzo del muro con sus disposiciones de acero',
        body + text(20, height - 10, 'Esquema de disposición; recubrimiento y longitudes de anclaje según planos.', { size: 12, anchor: 'start', fill: MUTED }));
}
