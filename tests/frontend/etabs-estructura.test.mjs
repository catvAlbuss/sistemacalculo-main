import test from 'node:test';
import assert from 'node:assert/strict';
import {existsSync, readFileSync} from 'node:fs';
import {plano} from '../../scripts/agente/planos.mjs';
import {createRequire} from 'node:module';
import * as dm from '@mlightcad/data-model';
import {detectarColumnas, deducirEjes, areasTributarias, predimensionarZapatas, capaEstructural} from '../../resources/js/etabs/agente/estructura.js';
import {createDrawingContext} from '../../resources/js/etabs/agente/drawingContext.js';
import {ESTRUCTURA_SKILLS} from '../../resources/js/etabs/agente/skills/estructuraPlano.js';

const seg = (layer, ax, ay, bx, by) => ({layer, a: {x: ax, y: ay}, b: {x: bx, y: by}});
// Rectangle drawn as four loose lines, with a small gap like real plans have.
const looseRect = (layer, x, y, b, h, gap = 0.01) => [
  seg(layer, x, y, x + b - gap, y), seg(layer, x + b, y, x + b, y + h), seg(layer, x + b, y + h, x, y + h), seg(layer, x, y + h, x, y + gap),
];
const grid = (k = 1) => [0, 4, 8].flatMap((x) => [0, 5].flatMap((y) => looseRect('COLUMNAS', (x - 0.15) * k, (y - 0.15) * k, 0.3 * k, 0.3 * k, 0.01 * k)));

test('detects columns drawn with gaps, ignores long axis lines and infers the drawing scale', () => {
  for (const k of [1, 1000]) {
    const axes = [seg('COLUMNAS', -2 * k, 0, 10 * k, 0), seg('COLUMNAS', 0, -2 * k, 0, 7 * k)];
    const {columnas, escala} = detectarColumnas([...grid(k), ...axes]);
    assert.equal(escala, k);
    assert.equal(columnas.length, 6);
    assert.deepEqual(columnas.map((c) => [c.x, c.y, c.b, c.h]), [[0, 0, 0.3, 0.3], [4, 0, 0.3, 0.3], [8, 0, 0.3, 0.3], [0, 5, 0.3, 0.3], [4, 5, 0.3, 0.3], [8, 5, 0.3, 0.3]]);
    assert.deepEqual(columnas.map((c) => c.id), ['C1', 'C2', 'C3', 'C4', 'C5', 'C6']);
  }
});

test('irregular columns keep their bounding box and stray lines are discarded', () => {
  const tee = [[0, 0], [0.6, 0], [0.6, 0.3], [0.45, 0.3], [0.45, 1], [0.15, 1], [0.15, 0.3], [0, 0.3]];
  const segments = tee.map((p, i) => seg('COL', p[0], p[1], tee[(i + 1) % tee.length][0], tee[(i + 1) % tee.length][1]));
  const {columnas, descartados} = detectarColumnas([...segments, seg('COL', 5, 5, 5.05, 5)]);
  assert.equal(columnas.length, 1);
  assert.equal(columnas[0].forma, 'irregular');
  assert.deepEqual([columnas[0].b, columnas[0].h], [0.6, 1]);
  assert.equal(descartados.pequenos + descartados.sueltos, 1);
  assert.equal(capaEstructural('66. COLUMNAS Y VIGAS EN ELEVACIÓN'), false);
  assert.equal(capaEstructural('SGE_ESTRUCTURAS'), true);
  assert.equal(capaEstructural('MUROS', ['muros']), true);
});

test('axes, tributary areas and footing sizes follow the column grid', () => {
  const columnas = areasTributarias(detectarColumnas(grid()).columnas);
  const ejes = deducirEjes(columnas);
  assert.deepEqual(ejes.x.map((e) => e.x), [0, 4, 8]);
  assert.deepEqual(ejes.y.map((e) => e.nombre), ['1', '2']);
  // Interior column C2: 4 m wide (2 + 2) x 2.5 m (only one neighbor in y).
  assert.equal(columnas[1].at, 10);
  const {zapatas, traslapes} = predimensionarZapatas(columnas, {pisos: 3, qadm: 15});
  const c2 = zapatas[1];
  assert.equal(c2.pd, Math.round((10 * 3 * 0.75 + 0.3 * 0.3 * 3 * 2.4 * 3) * 100) / 100);
  assert.ok(c2.B >= Math.sqrt(1.1 * (c2.pd + c2.pl) / 15) && c2.B === c2.L);
  assert.ok(zapatas.every((z) => z.B >= 0.8));
  assert.deepEqual(traslapes, []);
});

const plan = plano('casas3d', 'primer nivel.dwg');
test('real "primer nivel" plan yields its columns and axes', {skip: !existsSync(plan)}, async () => {
  const req = createRequire(import.meta.url);
  const lib = req('@mlightcad/libredwg-web');
  const dwg = lib.LibreDwg.createByWasmInstance(await lib.createModule.default());
  const buffer = readFileSync(plan);
  const {database} = dwg.convertEx(dwg.dwg_read_data(buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength), 0));
  const segments = [];
  for (const e of database.entities) {
    if (!capaEstructural(e.layer)) continue;
    if (e.type === 'LINE') segments.push({layer: e.layer, a: e.startPoint, b: e.endPoint});
    if (e.type === 'LWPOLYLINE') e.vertices.slice(1).forEach((v, i) => segments.push({layer: e.layer, a: e.vertices[i], b: v}));
  }
  const {columnas, escala} = detectarColumnas(segments);
  assert.equal(escala, 1);
  assert.ok(columnas.length >= 12, `columns found: ${columnas.length}`);
  assert.ok(columnas.every((c) => c.b <= 1 && c.h <= 1));
  assert.ok(deducirEjes(columnas).x.length >= 3);
});

test('zapatas_desde_plano reads a drawing that lies about its units, draws footings and sends them to Cimentación', async () => {
  const db = new dm.AcDbDatabase(); db.createDefaultData(); db.insunits = 4; // declares mm, drawn in meters
  for (const s of grid()) {
    const line = new dm.AcDbLine({x: s.a.x + 500, y: s.a.y + 300, z: 0}, {x: s.b.x + 500, y: s.b.y + 300, z: 0});
    line.layer = 'COLUMNAS';
    db.tables.blockTable.modelSpace.appendEntity(line);
  }
  const color = new dm.AcCmColor(); color.colorIndex = 1;
  db.tables.layerTable.add(new dm.AcDbLayerTableRecord({name: 'COLUMNAS', color}));
  const sent = [];
  const ctx = createDrawingContext({getDatabase: () => db, dm, onFoundation: (p) => sent.push(p)});
  const skill = ESTRUCTURA_SKILLS.find((s) => s.name === 'zapatas_desde_plano');
  const result = await skill.run({pisos: 2}, ctx);
  assert.equal(result.ok, true);
  assert.match(result.zapatas, /^6,/);
  assert.equal(sent.length, 1);
  assert.equal(sent[0].columnas.length, 6);
  assert.deepEqual(Object.keys(sent[0].columnas[0]).sort(), ['column', 'id', 'pd1', 'pd2', 'pd3', 'pl1', 'pl2', 'pl3', 'sismo1', 'sismo2', 'sismo3', 'x', 'y'].sort());
  assert.ok(sent[0].columnas.every((c) => c.x >= 0 && c.y >= 0 && c.x < 20), 'local coordinates for Cimentación');
  const footings = db.tables.blockTable.modelSpace.newIterator().toArray().filter((e) => e.layer === 'E-ZAPATAS' && e instanceof dm.AcDbPolyline);
  assert.equal(footings.length, 6);
  const labels = db.tables.blockTable.modelSpace.newIterator().toArray().filter((e) => e.layer === 'E-COLUMNAS-ID');
  assert.equal(labels.length, 6, 'columns are tagged even when footings are requested directly');
  const corner = footings[0].getPoint3dAt ? footings[0].getPoint3dAt(0) : footings[0].getPointAt(0);
  assert.ok(corner.x > 490 && corner.x < 510, 'drawn at real coordinates, not scaled by the declared mm');
  assert.ok(JSON.stringify(result).length < 900, 'compact tool result');
});
