import test from 'node:test';
import assert from 'node:assert/strict';
import { buildPlan, dxfBytes, planToDxf, planToSvg } from '../../resources/js/muros-contencion/plan.js';

const bar = (label, spacing) => ({ label, spacing });
const row = () => ({ principal: bar('2 Ø 3/4 @ 20 cm', 20), secundario: bar('2 Ø 5/8 @ 20 cm', 20), transversal: bar('1 Ø 1/2 @ 20 cm', 20), transversal2: bar('1 Ø 1/2 @ 10 cm', 10) });
const data = {
    geo: { punta: 1.8, batter: .7, crown: .2, heel: 3, hz: .75, stem: 6.65, rise: .64, keyX: 2.18, keyTop: .9, keyBottom: .2, keyDepth: 1, front: 1, surcharge: .4 },
    steel: { pantalla: row(), punta: row(), talon: row(), key: row() },
    cutoffs: { pantalla: { L: 4 } },
    materials: { fc: 210, fy: 4200, qadm: 20 },
    project: { proyecto: 'MEJORAMIENTO DE LOS SERVICIOS EDUCATIVOS', codigo: '32478', cliente: 'MUNICIPALIDAD', ubicacion: 'HUÁNUCO', ingeniero: '-', fecha: '2026-10-31' },
};

test('sheet scale is a standard value and text keeps its paper size', () => {
    const plan = buildPlan(data);
    assert.ok([25, 30, 40, 50, 75, 100, 125, 150].includes(plan.scale));
    const heights = new Set(plan.entities.filter(e => e.type === 'text').map(e => +(e.height * 1000 / plan.scale).toFixed(3)));
    assert.deepEqual([...heights].sort((a, b) => a - b), [3, 4, 10]);
    assert.ok(Math.abs(plan.width - 841 * plan.scale / 1000) < 1e-9);
});

test('every drawn point stays inside the A1 frame', () => {
    const plan = buildPlan(data);
    const points = plan.entities.flatMap(e => e.type === 'line' ? [e.a, e.b] : e.type === 'poly' ? e.points : e.type === 'circle' ? [e.center] : [e.position]);
    for (const p of points) {
        assert.ok(p.x >= 0 && p.x <= plan.width + 1e-6 && p.y >= 0 && p.y <= plan.height + 1e-6, JSON.stringify(p));
    }
});

test('a taller wall drops to a smaller standard scale', () => {
    const tall = buildPlan({ ...data, geo: { ...data.geo, stem: 16, heel: 7, punta: 4 } });
    assert.ok(tall.scale > buildPlan(data).scale);
});

test('dxf output is well formed and encodes the Spanish text', () => {
    const dxf = planToDxf(buildPlan(data));
    assert.match(dxf, /AC1009/);
    assert.match(dxf, /%%c 3\/4/);
    assert.ok(dxf.trimEnd().endsWith('EOF'));
    assert.equal(dxf.trimEnd().split('\r\n').length % 2, 0);
    assert.equal(dxfBytes('HUÁNUCO')[2], 0xC1);
    assert.doesNotMatch(dxf, /NaN|undefined/);
    assert.doesNotMatch(planToSvg(buildPlan(data)), /NaN|undefined/);
});
