// Achurados sin tramos de largo cero: el visor no los puede rellenar y llena la consola
// de "PolyBool: Zero-length segment detected" (cada vez que se inserta el bloque).
import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import * as dm from '@mlightcad/data-model';
import {contornoLimpio, drawPrimitives} from '../../resources/js/ingenieria/cad/cadExecutor.js';

const P = (x, y) => ({x, y});

test('hatch outlines lose repeated vertices (also the closing one) and collinear points', () => {
  assert.deepEqual(contornoLimpio([P(0, 0), P(1, 0), P(1, 0), P(1, 1), P(0, 1), P(0, 0)]), [P(0, 0), P(1, 0), P(1, 1), P(0, 1)]);
  assert.deepEqual(contornoLimpio([P(0, 0), P(0.5, 0), P(1, 0), P(1, 1), P(0, 1)]), [P(0, 0), P(1, 0), P(1, 1), P(0, 1)], 'point on a side');
  assert.equal(contornoLimpio([P(0, 0), P(1, 0), P(2, 0)]), null, 'no area: no hatch');
  assert.equal(contornoLimpio([P(0, 0), P(0, 0), P(0, 0)]), null);
  assert.equal(contornoLimpio([P(0, 0), P(1, 0)]), null);
});

test('the agent never creates a hatch with a zero-length boundary segment', () => {
  const db = new dm.AcDbDatabase();
  db.createDefaultData();
  const r = drawPrimitives(db, [
    {type: 'hatch', layer: 'E-X', points: [[0, 0], [1, 0], [1, 0], [1, 1], [0, 1], [0, 0]], solido: true},
    {type: 'hatch', layer: 'E-X', points: [[0, 0], [1, 0], [2, 0]], solido: true},
  ], {dm, unitsPerMeter: 1});
  assert.equal(r.entidades, 1, 'the degenerate hatch is skipped');
  const h = db.tables.blockTable.modelSpace.newIterator().toArray().find((e) => e.dxfTypeName === 'HATCH');
  const v = h._geo._loops[0].vertices;
  assert.equal(v.length, 4);
  for (let i = 0; i < v.length; i++) assert.ok(Math.hypot(v[i].x - v[(i + 1) % 4].x, v[i].y - v[(i + 1) % 4].y) > 1e-6);
});

test('the sheet template has no hatch with a zero-length boundary segment', async () => {
  const db = new dm.AcDbDatabase();
  const d = readFileSync('public/assets/plantillas/estructuras-laminas.dxf');
  await db.read(d.buffer.slice(d.byteOffset, d.byteOffset + d.byteLength), {readOnly: true}, dm.AcDbFileType.DXF);
  const nulos = [];
  for (const b of [db.tables.blockTable.modelSpace, ...db.tables.blockTable.newIterator()]) {
    for (const e of b.newIterator()) {
      if (e.dxfTypeName !== 'HATCH') continue;
      for (const lazo of e._geo?._loops ?? []) {
        for (const c of lazo.curves ?? []) {
          if (c.startPoint && c.endPoint && /Line/.test(c.constructor.name) && Math.hypot(c.startPoint.x - c.endPoint.x, c.startPoint.y - c.endPoint.y) < 1e-6) nulos.push(`${b.name} ${e.layer}`);
        }
      }
    }
  }
  assert.deepEqual(nulos, [], 'regenerate with: node scripts/agente/generar-plantilla-estructuras.mjs');
});
