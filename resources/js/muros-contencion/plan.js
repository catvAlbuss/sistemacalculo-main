// Lámina A1 del muro. El modelo está en metros a tamaño real: la lámina se escala con la escala elegida,
// y textos y cotas se definen en milímetros de papel para que impriman siempre al mismo tamaño.
import { wallOutline } from './drawings.js';

const PAPER = { width: 841, height: 594, left: 25, margin: 10, block: 180 };
const SCALES = [25, 30, 40, 50, 75, 100, 125, 150];
const TEXT = { title: 5, subtitle: 4, body: 3 };

export const LAYERS = {
    MARCO: { color: 7, ink: '#1f2933' },
    MEMBRETE: { color: 7, ink: '#1f2933' },
    CONCRETO: { color: 7, ink: '#1f2933' },
    TERRENO: { color: 8, ink: '#7b6a4f' },
    ACERO_PRINCIPAL: { color: 1, ink: '#b42318' },
    ACERO_SECUNDARIO: { color: 5, ink: '#1959b8' },
    COTAS: { color: 3, ink: '#2f6f4f' },
    TEXTO: { color: 7, ink: '#1f2933' },
};

const fixed = (value, decimals = 2) => Number(value).toFixed(decimals);

class Sheet {
    constructor(scale) {
        this.scale = scale;
        this.unit = scale / 1000;
        this.entities = [];
    }

    line(layer, a, b) { this.entities.push({ type: 'line', layer, a, b }); }
    poly(layer, points, closed = false) { this.entities.push({ type: 'poly', layer, points, closed }); }
    circle(layer, center, radius) { this.entities.push({ type: 'circle', layer, center, radius }); }
    text(layer, position, height, value, { align = 'left', rotate = 0 } = {}) {
        this.entities.push({ type: 'text', layer, position, height: height * this.unit, value, align, rotate });
    }

    // Cota normalizada: extensiones, trazos a 45° y valor sobre la línea.
    dimension(a, b, offset, label = fixed(Math.hypot(b.x - a.x, b.y - a.y))) {
        const length = Math.hypot(b.x - a.x, b.y - a.y);
        if (length < 1e-6) return;
        const u = { x: (b.x - a.x) / length, y: (b.y - a.y) / length };
        const n = { x: -u.y, y: u.x };
        const distance = offset * this.unit, side = Math.sign(offset) || 1;
        const at = (p, d) => ({ x: p.x + n.x * d, y: p.y + n.y * d });
        const start = at(a, distance), end = at(b, distance);
        const gap = 1.5 * this.unit * side, tail = 1.5 * this.unit * side;
        this.line('COTAS', at(a, gap), at(start, tail));
        this.line('COTAS', at(b, gap), at(end, tail));
        this.line('COTAS', start, end);
        const tick = 1.2 * this.unit;
        for (const p of [start, end]) {
            this.line('COTAS', { x: p.x - (u.x + n.x) * tick, y: p.y - (u.y + n.y) * tick }, { x: p.x + (u.x + n.x) * tick, y: p.y + (u.y + n.y) * tick });
        }
        const vertical = Math.abs(u.y) > .9;
        const middle = { x: (start.x + end.x) / 2, y: (start.y + end.y) / 2 };
        const lift = 1 * this.unit;
        this.text('COTAS', vertical ? { x: middle.x - lift, y: middle.y } : { x: middle.x, y: middle.y + lift }, TEXT.body, label, { align: 'center', rotate: vertical ? 90 : 0 });
    }

    leader(target, elbow, label, align = 'left', layer = 'TEXTO') {
        const run = (align === 'left' ? 1 : -1) * 4 * this.unit;
        const end = { x: elbow.x + run, y: elbow.y };
        this.poly('COTAS', [target, elbow, end]);
        this.text(layer, { x: end.x + run / 2, y: end.y - TEXT.body * this.unit / 2 }, TEXT.body, label, { align });
    }

    ground(a, b, layer = 'TERRENO') {
        this.line(layer, a, b);
        const length = Math.hypot(b.x - a.x, b.y - a.y);
        const step = 4 * this.unit, size = 2 * this.unit;
        for (let d = step / 2; d < length; d += step) {
            const p = { x: a.x + (b.x - a.x) * d / length, y: a.y + (b.y - a.y) * d / length };
            this.line(layer, p, { x: p.x - size, y: p.y - size });
        }
    }
}

const shift = (origin, p) => ({ x: origin.x + p.x, y: origin.y + p.y });

function viewTitle(sheet, center, number, title) {
    const radius = 5 * sheet.unit;
    const circle = { x: center.x - (title.length * 1.6 + 8) * sheet.unit, y: center.y };
    sheet.circle('TEXTO', circle, radius);
    sheet.text('TEXTO', { x: circle.x, y: circle.y - TEXT.subtitle * sheet.unit / 2 }, TEXT.subtitle, String(number), { align: 'center' });
    sheet.text('TEXTO', { x: circle.x + 8 * sheet.unit, y: center.y + .3 * sheet.unit }, TEXT.subtitle, title);
    sheet.line('TEXTO', { x: circle.x + 8 * sheet.unit, y: center.y - sheet.unit }, { x: circle.x + (8 + title.length * 3.1) * sheet.unit, y: center.y - sheet.unit });
    sheet.text('TEXTO', { x: circle.x + 8 * sheet.unit, y: center.y - 5 * sheet.unit }, TEXT.body, `ESC. 1:${sheet.scale}`);
}

function drawWall(sheet, origin, geo) {
    const at = p => shift(origin, p);
    const back = geo.punta + geo.batter + geo.crown, base = back + geo.heel, top = geo.hz + geo.stem;
    const end = base + .7, heelTop = top + geo.rise;
    sheet.poly('CONCRETO', wallOutline(geo).map(at), true);
    sheet.ground(at({ x: back, y: top }), at({ x: base, y: heelTop }));
    sheet.ground(at({ x: base, y: heelTop }), at({ x: end, y: heelTop }));
    if (geo.front > 0) sheet.ground(at({ x: -.7, y: geo.front }), at({ x: geo.punta + geo.batter * Math.max(geo.front - geo.hz, 0) / Math.max(geo.stem, .01), y: geo.front }));
}

function geometryView(sheet, origin, geo) {
    const at = p => shift(origin, p);
    const back = geo.punta + geo.batter + geo.crown, base = back + geo.heel, top = geo.hz + geo.stem;
    const low = geo.keyDepth > 0 ? -geo.keyDepth : 0;
    drawWall(sheet, origin, geo);
    const under = (a, b, offset, label) => sheet.dimension(at({ x: a, y: low }), at({ x: b, y: low }), offset, label);
    under(0, geo.punta, -10); under(geo.punta, back, -10); under(back, base, -10);
    under(0, base, -20, `B = ${fixed(base)}`);
    const right = base + .7;
    sheet.dimension(at({ x: right, y: top }), at({ x: right, y: geo.hz }), 8);
    sheet.dimension(at({ x: right, y: geo.hz }), at({ x: right, y: 0 }), 8);
    sheet.dimension(at({ x: right, y: top }), at({ x: right, y: 0 }), 18, `H = ${fixed(top)}`);
    sheet.dimension(at({ x: back - geo.crown, y: top }), at({ x: back, y: top }), 8);
    if (geo.front > 0) sheet.dimension(at({ x: -.7, y: 0 }), at({ x: -.7, y: geo.front }), 8);
    if (geo.keyDepth > 0) {
        const key = wallOutline(geo).filter(p => p.y === -geo.keyDepth);
        sheet.dimension(at({ x: -.7, y: -geo.keyDepth }), at({ x: -.7, y: 0 }), 8);
        sheet.dimension(at(key[0]), at(key[1]), -30);
    }
    sheet.text('TEXTO', at({ x: back + geo.heel * .5, y: geo.hz + geo.stem * .5 }), TEXT.body, 'RELLENO', { align: 'center' });
    sheet.text('TEXTO', at({ x: geo.punta * .5, y: geo.hz * .4 }), TEXT.body, 'ZAPATA', { align: 'center' });
}

function reinforcementView(sheet, origin, geo, steel, cutoffs) {
    const at = p => shift(origin, p);
    const back = geo.punta + geo.batter + geo.crown, base = back + geo.heel, top = geo.hz + geo.stem;
    const wallCover = .05, footCover = .075;
    const inner = back - wallCover, topY = top - wallCover, footTop = geo.hz - footCover;
    const outerBottom = { x: geo.punta + wallCover, y: footTop };
    const outerTop = { x: back - geo.crown + wallCover, y: topY };
    const main = 'ACERO_PRINCIPAL', secondary = 'ACERO_SECUNDARIO';
    drawWall(sheet, origin, geo);

    sheet.poly(main, [{ x: inner + .4, y: footCover }, { x: inner, y: footCover }, { x: inner, y: topY }].map(at));
    const cutoffL = cutoffs?.pantalla?.L || 0;
    if (cutoffL > 0) sheet.poly(main, [{ x: inner - .05, y: footCover }, { x: inner - .05, y: geo.hz + cutoffL }].map(at));
    sheet.poly(main, [{ x: outerBottom.x - .3, y: footCover }, { x: outerBottom.x, y: footCover }, outerTop].map(at));
    sheet.poly(main, [{ x: footCover, y: footTop }, { x: footCover, y: footCover }, { x: base - footCover, y: footCover }, { x: base - footCover, y: footTop }, { x: footCover, y: footTop }].map(at));

    const dots = (a, b, spacing) => {
        const length = Math.hypot(b.x - a.x, b.y - a.y);
        const count = Math.max(Math.floor(length / Math.max(spacing, .05)), 1);
        for (let i = 0; i <= count; i++) {
            const t = i / count;
            sheet.circle(secondary, at({ x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t }), .6 * sheet.unit);
        }
    };
    const offset = .03;
    dots({ x: inner - offset, y: geo.hz + .1 }, { x: inner - offset, y: topY - .05 }, (steel.pantalla?.transversal?.spacing || 25) / 100);
    dots({ x: outerBottom.x + offset + .02, y: geo.hz + .1 }, { x: outerTop.x + offset, y: topY - .05 }, (steel.pantalla?.transversal2?.spacing || 25) / 100);
    dots({ x: footCover + .05, y: footTop - offset }, { x: base - footCover - .05, y: footTop - offset }, (steel.talon?.transversal?.spacing || 25) / 100);
    dots({ x: footCover + .05, y: footCover + offset }, { x: base - footCover - .05, y: footCover + offset }, (steel.punta?.transversal?.spacing || 25) / 100);

    if (geo.keyDepth > 0) {
        const key = wallOutline(geo).filter(p => p.y === -geo.keyDepth);
        const inset = .07;
        sheet.poly(main, [{ x: key[0].x - .15, y: geo.hz * .5 }, { x: key[0].x + inset, y: -geo.keyDepth + inset }, { x: key[1].x - inset, y: -geo.keyDepth + inset }, { x: key[1].x + .15, y: geo.hz * .5 }].map(at));
    }

    const label = (element, row) => steel[element]?.[row]?.label || '-';
    const rightX = base + 1.2 * sheet.scale / 50, leftX = -1.2 * sheet.scale / 50;
    const point = (x, y) => at({ x, y });
    sheet.leader(point(inner, geo.hz + geo.stem * .8), point(rightX, geo.hz + geo.stem * .86), label('pantalla', 'principal'));
    sheet.leader(point(inner - offset, geo.hz + geo.stem * .6), point(rightX, geo.hz + geo.stem * .66), `${label('pantalla', 'transversal')} (transv.)`);
    const outerAt = t => ({ x: outerBottom.x + (outerTop.x - outerBottom.x) * t, y: footTop + (outerTop.y - footTop) * t });
    sheet.leader(at(outerAt(.72)), point(leftX, geo.hz + geo.stem * .8), label('pantalla', 'secundario'), 'right');
    sheet.leader(at({ ...outerAt(.5), x: outerAt(.5).x + offset }), point(leftX, geo.hz + geo.stem * .6), `${label('pantalla', 'transversal2')} (transv.)`, 'right');
    sheet.leader(point(base * .8, footTop), point(rightX, geo.hz + geo.stem * .22), `${label('talon', 'principal')} (talón)`);
    sheet.leader(point(base * .9, footTop - offset), point(rightX, geo.hz + geo.stem * .06), `${label('talon', 'transversal')} (transv.)`);
    sheet.leader(point(geo.punta * .4, footCover), point(leftX, geo.front + .9), `${label('punta', 'principal')} (punta)`, 'right');
    sheet.leader(point(geo.punta * .2, footCover + offset), point(leftX, geo.front + .35), `${label('punta', 'transversal')} (transv.)`, 'right');
    if (geo.keyDepth > 0) sheet.leader(point(geo.keyX, -geo.keyDepth * .6), point(rightX, -geo.keyDepth * .6), `${label('key', 'principal')} (dentellón)`);
    if (cutoffL > 0) {
        sheet.dimension(point(inner + .35, geo.hz), point(inner + .35, geo.hz + cutoffL), -6, `Recorte ${fixed(cutoffL)}`);
    }
}

// Malla a la separación real de las barras: paño representativo, no todo el muro.
function meshView(sheet, origin, width, height, verticalBar, horizontalBar) {
    const at = (x, y) => shift(origin, { x, y });
    sheet.poly('CONCRETO', [at(0, 0), at(width, 0), at(width, height), at(0, height)], true);
    const verticalStep = Math.max((verticalBar?.spacing || 20) / 100, .05), horizontalStep = Math.max((horizontalBar?.spacing || 25) / 100, .05);
    for (let x = verticalStep / 2; x < width; x += verticalStep) sheet.line('ACERO_PRINCIPAL', at(x, .05), at(x, height - .05));
    for (let y = horizontalStep / 2; y < height; y += horizontalStep) sheet.line('ACERO_SECUNDARIO', at(.05, y), at(width - .05, y));
    sheet.dimension(at(0, 0), at(width, 0), -7);
    sheet.dimension(at(width, height), at(width, 0), 7);
    sheet.leader(at(verticalStep * 1.5, height), { x: origin.x + width * .25, y: origin.y + height + 9 * sheet.unit }, verticalBar?.label || '-');
    sheet.leader(at(width, horizontalStep * 1.5), { x: origin.x + width + 12 * sheet.unit, y: origin.y + horizontalStep * 1.5 + 8 * sheet.unit }, horizontalBar?.label || '-');
}

function table(sheet, origin, widths, rows, title) {
    const rowH = 8 * sheet.unit, unit = sheet.unit;
    const total = widths.reduce((a, b) => a + b, 0) * unit;
    let y = origin.y;
    sheet.text('TEXTO', { x: origin.x, y: y + 2 * unit }, TEXT.subtitle, title);
    rows.forEach((row, rowIndex) => {
        sheet.line('TEXTO', { x: origin.x, y }, { x: origin.x + total, y });
        let x = origin.x;
        row.forEach((cell, col) => {
            sheet.text('TEXTO', { x: x + 1.5 * unit, y: y - 5.5 * unit }, TEXT.body, String(cell));
            x += widths[col] * unit;
        });
        y -= rowH;
        if (rowIndex === rows.length - 1) sheet.line('TEXTO', { x: origin.x, y }, { x: origin.x + total, y });
    });
    let x = origin.x;
    for (const width of [...widths, 0]) {
        sheet.line('TEXTO', { x, y: origin.y }, { x, y });
        x += width * unit;
    }
    return y;
}

function wrap(value, length) {
    const lines = [];
    let current = '';
    for (const word of String(value || '-').split(/\s+/)) {
        if ((current + ' ' + word).trim().length > length) { lines.push(current); current = word; }
        else current = (current + ' ' + word).trim();
    }
    if (current) lines.push(current);
    return lines;
}

function frameAndBlock(sheet, data) {
    const u = sheet.unit;
    const { width, height, left, margin, block } = PAPER;
    const P = (x, y) => ({ x: x * u, y: y * u });
    sheet.poly('MARCO', [P(0, 0), P(width, 0), P(width, height), P(0, height)], true);
    sheet.poly('MARCO', [P(left, margin), P(width - margin, margin), P(width - margin, height - margin), P(left, height - margin)], true);
    const x0 = width - margin - block, x1 = width - margin;
    sheet.line('MEMBRETE', P(x0, margin), P(x0, height - margin));
    let y = height - margin;
    const row = (label, value, lines = 1, size = TEXT.body) => {
        const wrapped = wrap(value, 50).slice(0, lines);
        const rowH = 8 + wrapped.length * 6;
        sheet.text('MEMBRETE', P(x0 + 3, y - 5), TEXT.body, label);
        wrapped.forEach((text, i) => sheet.text('MEMBRETE', P(x0 + 3, y - 11 - i * 6), size, text));
        y -= rowH;
        sheet.line('MEMBRETE', P(x0, y), P(x1, y));
    };
    const { project, height: wallHeight } = data;
    row('PROYECTO:', project.proyecto, 6, TEXT.subtitle);
    row('CODIGO:', project.codigo);
    row('ENTIDAD / CLIENTE:', project.cliente, 2);
    row('UBICACION:', project.ubicacion, 4);
    row('ESPECIALIDAD:', 'ESTRUCTURAS', 1, TEXT.subtitle);
    row('PLANO:', `MURO DE CONTENCION H = ${fixed(wallHeight)} m - DIMENSIONES Y REFUERZO`, 2, TEXT.subtitle);
    row('INGENIERO RESPONSABLE:', project.ingeniero, 1);
    sheet.text('MEMBRETE', P(x0 + 3, y - 5), TEXT.body, 'SELLO Y FIRMA:');
    sheet.line('MEMBRETE', P(x0, margin + 30), P(x1, margin + 30));
    sheet.line('MEMBRETE', P(x0 + 110, margin), P(x0 + 110, margin + 30));
    sheet.text('MEMBRETE', P(x0 + 3, margin + 22), TEXT.body, `ESCALA: 1:${sheet.scale}`);
    sheet.text('MEMBRETE', P(x0 + 3, margin + 14), TEXT.body, `FECHA: ${project.fecha || '-'}`);
    sheet.text('MEMBRETE', P(x0 + 3, margin + 6), TEXT.body, 'UNIDADES: METROS');
    sheet.text('MEMBRETE', P(x0 + 113, margin + 22), TEXT.body, 'LAMINA:');
    sheet.text('MEMBRETE', P(x0 + 140, margin + 8), 10, 'E-1', { align: 'center' });
}

function chooseScale(geo) {
    const base = geo.punta + geo.batter + geo.crown + geo.heel;
    const tall = geo.hz + geo.stem + geo.rise + Math.max(geo.keyDepth, 0);
    const usableW = PAPER.width - PAPER.left - PAPER.margin - PAPER.block - 20;
    const usableH = PAPER.height - 2 * PAPER.margin - 20;
    return SCALES.find(scale => {
        const mm = meters => meters * 1000 / scale;
        const sectionW = mm(base + 1.4) + 95;
        const rowsH = mm(tall) + mm(geo.stem) + 140;
        return 2 * sectionW + 130 <= usableW && rowsH <= usableH;
    }) || SCALES.at(-1);
}

export function buildPlan(data) {
    const { geo, steel = {}, cutoffs = null, materials = {} } = data;
    const scale = chooseScale(geo);
    const sheet = new Sheet(scale);
    const u = sheet.unit;
    const base = geo.punta + geo.batter + geo.crown + geo.heel;
    const tall = geo.hz + geo.stem + geo.rise;
    const mm = meters => meters * 1000 / scale;
    const left = PAPER.left + 15, top = PAPER.height - PAPER.margin - 25;
    frameAndBlock(sheet, { ...data, height: geo.hz + geo.stem });

    // Fila superior: secciones
    const sectionW = mm(base + 1.4) + 95;
    const baseY = top - mm(tall);
    const section1 = { x: (left + 45 + mm(.7)) * u, y: baseY * u };
    const section2 = { x: (left + sectionW + 45 + mm(.7)) * u, y: baseY * u };
    geometryView(sheet, section1, geo);
    reinforcementView(sheet, section2, geo, steel, cutoffs);
    const titleY = (baseY - mm(Math.max(geo.keyDepth, 0)) - 42) * u;
    viewTitle(sheet, { x: section1.x + mm(base / 2) * u, y: titleY }, 1, 'SECCION TIPICA - DIMENSIONES');
    viewTitle(sheet, { x: section2.x + mm(base / 2) * u, y: titleY }, 2, 'SECCION TIPICA - REFUERZO');

    // Columna de cuadros
    const tableX = (left + 2 * sectionW + 8) * u;
    const fila = (nombre, element, key) => [nombre, steel[element]?.[key]?.label || '-'];
    const afterSteel = table(sheet, { x: tableX, y: (top + 5) * u }, [62, 58], [
        ['ELEMENTO', 'ACERO'],
        fila('Pantalla, cara terreno', 'pantalla', 'principal'),
        fila('Pantalla, cara libre', 'pantalla', 'secundario'),
        fila('Pantalla, transv. terreno', 'pantalla', 'transversal'),
        fila('Pantalla, transv. libre', 'pantalla', 'transversal2'),
        fila('Punta, principal', 'punta', 'principal'),
        fila('Punta, transversal', 'punta', 'transversal'),
        fila('Talon, principal', 'talon', 'principal'),
        fila('Talon, transversal', 'talon', 'transversal'),
        fila('Dentellon, principal', 'key', 'principal'),
    ], 'CUADRO DE ACERO');
    const afterSpecs = table(sheet, { x: tableX, y: afterSteel - 16 * u }, [62, 58], [
        ['ESPECIFICACION', 'VALOR'],
        ["Concreto f'c", `${fixed(materials.fc, 0)} kg/cm2`],
        ['Acero fy', `${fixed(materials.fy, 0)} kg/cm2`],
        ['Capacidad portante', `${fixed(materials.qadm)} Tn/m2`],
        ['Recubrimiento pantalla', '5.0 cm'],
        ['Recubrimiento zapata', '7.5 cm'],
    ], 'ESPECIFICACIONES TECNICAS');
    ['NOTAS:', '1. Cotas en metros, salvo indicacion.', '2. Traslapes y anclajes segun E.060.', '3. Verificar medidas en obra.'].forEach((note, index) => {
        sheet.text('TEXTO', { x: tableX, y: afterSpecs - (10 + index * 6) * u }, TEXT.body, note);
    });

    // Fila inferior: mallas
    const panelWidth = Math.min(3, base);
    const stemHeight = geo.stem;
    const rowBottom = PAPER.margin + 28;
    const rowTop = baseY - mm(Math.max(geo.keyDepth, 0)) - 44;
    const meshY = rowBottom + Math.max((rowTop - rowBottom - mm(stemHeight) - 16) / 2, 0);
    const panels = [
        [3, 'PANTALLA - CARA DEL TERRENO', panelWidth, stemHeight, steel.pantalla?.principal, steel.pantalla?.transversal],
        [4, 'PANTALLA - CARA LIBRE', panelWidth, stemHeight, steel.pantalla?.secundario, steel.pantalla?.transversal2],
        [5, 'ZAPATA - MALLA SUPERIOR', base, panelWidth, steel.talon?.principal, steel.talon?.transversal],
        [6, 'ZAPATA - MALLA INFERIOR', base, panelWidth, steel.punta?.principal, steel.punta?.transversal],
    ];
    let cursor = left + 10;
    panels.forEach(([number, title, width, height, vertical, horizontal]) => {
        const origin = { x: cursor * u, y: meshY * u };
        meshView(sheet, origin, width, height, vertical, horizontal);
        viewTitle(sheet, { x: origin.x + mm(width / 2) * u, y: (meshY - 16) * u }, number, title);
        cursor += mm(width) + 58;
    });
    return { scale, entities: sheet.entities, width: PAPER.width * u, height: PAPER.height * u };
}

const dxfText = value => String(value).replace(/Ø/g, '%%c').replace(/°/g, '%%d');

export function planToDxf(plan) {
    const out = [];
    const put = (...pairs) => { for (let i = 0; i < pairs.length; i += 2) out.push(String(pairs[i]), String(pairs[i + 1])); };
    const n = value => Number(value).toFixed(4);
    put(0, 'SECTION', 2, 'HEADER', 9, '$ACADVER', 1, 'AC1009', 9, '$DWGCODEPAGE', 3, 'ANSI_1252', 9, '$LTSCALE', 40, plan.scale / 1000, 0, 'ENDSEC');
    put(0, 'SECTION', 2, 'TABLES');
    put(0, 'TABLE', 2, 'LTYPE', 70, 1, 0, 'LTYPE', 2, 'CONTINUOUS', 70, 0, 3, 'Solid line', 72, 65, 73, 0, 40, 0, 0, 'ENDTAB');
    const names = Object.keys(LAYERS);
    put(0, 'TABLE', 2, 'LAYER', 70, names.length);
    names.forEach(name => put(0, 'LAYER', 2, name, 70, 0, 62, LAYERS[name].color, 6, 'CONTINUOUS'));
    put(0, 'ENDTAB');
    put(0, 'TABLE', 2, 'STYLE', 70, 1, 0, 'STYLE', 2, 'ARIAL', 70, 0, 40, 0, 41, 1, 50, 0, 71, 0, 42, .25, 3, 'arial.ttf', 4, '', 0, 'ENDTAB');
    put(0, 'ENDSEC', 0, 'SECTION', 2, 'ENTITIES');
    for (const e of plan.entities) {
        if (e.type === 'line') put(0, 'LINE', 8, e.layer, 10, n(e.a.x), 20, n(e.a.y), 30, 0, 11, n(e.b.x), 21, n(e.b.y), 31, 0);
        if (e.type === 'circle') put(0, 'CIRCLE', 8, e.layer, 10, n(e.center.x), 20, n(e.center.y), 30, 0, 40, n(e.radius));
        if (e.type === 'poly') {
            put(0, 'POLYLINE', 8, e.layer, 66, 1, 70, e.closed ? 1 : 0);
            e.points.forEach(p => put(0, 'VERTEX', 8, e.layer, 10, n(p.x), 20, n(p.y), 30, 0));
            put(0, 'SEQEND', 8, e.layer);
        }
        if (e.type === 'text') {
            const justify = { left: 0, center: 1, right: 2 }[e.align];
            put(0, 'TEXT', 8, e.layer, 10, n(e.position.x), 20, n(e.position.y), 30, 0, 40, n(e.height), 1, dxfText(e.value), 50, e.rotate, 7, 'ARIAL');
            if (justify) put(72, justify, 11, n(e.position.x), 21, n(e.position.y), 31, 0);
        }
    }
    put(0, 'ENDSEC', 0, 'EOF');
    return out.join('\r\n') + '\r\n';
}

// DXF ASCII con la página de códigos declarada en el encabezado (ANSI_1252).
export function dxfBytes(content) {
    return Uint8Array.from(content, char => char.charCodeAt(0) < 256 ? char.charCodeAt(0) : 63);
}

export function planToSvg(plan) {
    const y = value => plan.height - value;
    const stroke = layer => LAYERS[layer].ink;
    const anchors = { left: 'start', center: 'middle', right: 'end' };
    const thin = plan.width / 1400;
    const body = plan.entities.map(e => {
        if (e.type === 'line') return `<line x1="${e.a.x.toFixed(3)}" y1="${y(e.a.y).toFixed(3)}" x2="${e.b.x.toFixed(3)}" y2="${y(e.b.y).toFixed(3)}" stroke="${stroke(e.layer)}"/>`;
        if (e.type === 'circle') return `<circle cx="${e.center.x.toFixed(3)}" cy="${y(e.center.y).toFixed(3)}" r="${e.radius.toFixed(3)}" fill="none" stroke="${stroke(e.layer)}"/>`;
        if (e.type === 'poly') return `<${e.closed ? 'polygon' : 'polyline'} points="${e.points.map(p => `${p.x.toFixed(3)},${y(p.y).toFixed(3)}`).join(' ')}" fill="none" stroke="${stroke(e.layer)}"/>`;
        const rotate = e.rotate ? ` transform="rotate(${-e.rotate} ${e.position.x.toFixed(3)} ${y(e.position.y).toFixed(3)})"` : '';
        return `<text x="${e.position.x.toFixed(3)}" y="${y(e.position.y).toFixed(3)}" font-size="${e.height.toFixed(3)}" text-anchor="${anchors[e.align]}" fill="${stroke(e.layer)}"${rotate}>${String(e.value).replace(/&/g, '&amp;').replace(/</g, '&lt;')}</text>`;
    }).join('');
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${plan.width.toFixed(3)} ${plan.height.toFixed(3)}" role="img" aria-label="Vista previa del plano del muro" font-family="Arial, Helvetica, sans-serif" stroke-width="${thin.toFixed(4)}"><rect width="${plan.width.toFixed(3)}" height="${plan.height.toFixed(3)}" fill="#fff"/>${body}</svg>`;
}
