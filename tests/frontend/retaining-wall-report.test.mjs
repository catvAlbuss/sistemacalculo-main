import test from 'node:test';
import assert from 'node:assert/strict';
import { loadDiagramSVG, predimSectionSVG, sectionSVG, wallGeometry, wallOutline } from '../../resources/js/muros-contencion/drawings.js';
import { concreteDesignTables } from '../../resources/js/muros-contencion/word/concrete-report.js';
import { CONTENT_GENERATORS } from '../../resources/js/muros-contencion/word/content-structure.js';

const dimensions = { A89: 1.8, A83: .7, C74: .2, D89: 3, F86: .75, E79: 6.65, E74: .64, C92: '2.18', F91: .9, F95: .2, G94: 1 };

test('wall outline closes on the calculated base width and reaches the key depth', () => {
    const outline = wallOutline(wallGeometry(dimensions));
    assert.equal(Math.max(...outline.map(p => p.x)), 5.7);
    assert.equal(Math.min(...outline.map(p => p.y)), -1);
});

test('drawings stay finite with real data, missing data and predimensioning points', () => {
    const geo = wallGeometry(dimensions, { B19: 1, B25: .4 });
    const loads = { H: 8.02, activeForce: 23.51, activeStress: 5.9, activeArm: 2.67, surchargeForce: 1.28, surchargeStress: .16, surchargeArm: 4.01, seismicForce: 2.48, seismicArm: 2.45, passiveForce: 8.57, passiveStress: 8.5, passiveArm: .1 };
    const predim = predimSectionSVG({ muro: [{ x: 0, y: 0 }, { x: 5.2, y: 0 }, { x: 5.2, y: .74 }, { x: 2.5, y: .74 }, { x: 2.5, y: 7.4 }, { x: 2.3, y: 7.4 }, { x: 1.7, y: .74 }, { x: 0, y: .74 }, { x: 0, y: 0 }], suelo: [{ x: 2.5, y: 7.4 }, { x: 5.2, y: 7.8 }], sueloDelante: [{ x: 1.7, y: 1 }, { x: 0, y: 1 }] }, { D45: .2 });
    for (const svg of [sectionSVG(geo), loadDiagramSVG(geo, loads), loadDiagramSVG(wallGeometry({}), {}), predim]) assert.doesNotMatch(svg, /NaN|Infinity|undefined/);
    assert.match(loadDiagramSVG(geo, loads), /2\.48 tn\/m/);
});

test('load table keeps each component on its own row and column', () => {
    const verificaciones = {};
    for (let row = 171; row <= 185; row++) for (const column of 'BCDEFGH') verificaciones[`${column}${row}`] = Number(`${row}.${'BCDEFGH'.indexOf(column) + 1}`);
    const table = CONTENT_GENERATORS.generateVerificationTable({}, { verificaciones });
    assert.equal(table.rows.length, 15);
    assert.deepEqual(table.rows[0], [2, '171.10', '171.20', '171.30', '171.40', '171.50', '171.60', '171.70', 'Empuje sismico']);
    assert.equal(table.rows[1][8], 'Empuje ACTIVO');
    assert.equal(table.rows[1][3], '172.30');
    assert.equal(table.rows[14][0], '');
    assert.equal(table.columns.reduce((sum, column) => sum + column.width, 0), 100);
});

test('concrete design tables report every stage with the adopted steel', () => {
    const steel = { cantidad: 2, diametro: '3/4', area: 5.7, calculado: 17, adoptado: 15 };
    const tables = concreteDesignTables({
        titulo: 'PANTALLA', datos: { Mu: 101.73, Vu: 35.9, b: 100, t: 74, d: 70, Fy: 4200, Fc: 210 },
        corte: { d: 70, Vu: 35.66, Vc: 66.05, phi_Vc: 56.14, ratio: 63.52, verificacion: 'OK' },
        flexion: { rmincuan: .002, rmincuans: 17.2, rminarea: .0018, rminareas: 15.48, a: 7.71, as: 32.76, As: 32.76 },
        aceros: { principal: steel, secundario: steel, transversal: steel, transversal2: steel },
    });
    assert.equal(tables.length, 4);
    assert.ok(tables.every(table => table.columns.reduce((sum, column) => sum + column.width, 0) === 100));
    assert.deepEqual(tables[1].rows[5], ['Verificación', 'ΦVc ≥ Vu', 'OK', '-']);
    assert.equal(tables[3].rows[0][3], '2 Ø 3/4 @ 15 cm');
});
