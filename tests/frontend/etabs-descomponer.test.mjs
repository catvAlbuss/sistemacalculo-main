// DESCOMPONER: un bloque pasa a sus entidades en su posición real; los recortados no se tocan.
import test from 'node:test';
import assert from 'node:assert/strict';
import * as dm from '@mlightcad/data-model';
import {descomponerBloques} from '../../resources/js/etabs/product/descomponer.js';

function dibujo() {
  const db = new dm.AcDbDatabase();
  db.createDefaultData();
  const reg = new dm.AcDbBlockTableRecord();
  reg.name = 'COLUMNA';
  db.tables.blockTable.add(reg);
  reg.appendEntity([new dm.AcDbLine({x: 0, y: 0, z: 0}, {x: 1, y: 0, z: 0}), new dm.AcDbCircle({x: 0, y: 0, z: 0}, 0.5)]);
  const ins = (x) => { const r = new dm.AcDbBlockReference('COLUMNA'); r.position = {x, y: 5, z: 0}; r.rotation = Math.PI / 2; r.scaleFactors = {x: 2, y: 2, z: 2}; return r; };
  const a = ins(10), b = ins(20), linea = new dm.AcDbLine({x: 0, y: 0, z: 0}, {x: 3, y: 0, z: 0});
  db.tables.blockTable.modelSpace.appendEntity([a, b, linea]);
  return {db, a, b, linea};
}

test('el bloque se reemplaza por sus entidades, rotadas y escaladas en su lugar', () => {
  const {db, a, linea} = dibujo();
  const r = descomponerBloques(db, [a.objectId, linea.objectId], {dm});
  assert.deepEqual(r, {bloques: 1, entidades: 2, omitidos: 1, recortados: 0});
  const ms = db.tables.blockTable.modelSpace.newIterator().toArray();
  assert.equal(ms.filter((e) => e instanceof dm.AcDbBlockReference).length, 1, 'el otro bloque sigue');
  const nueva = ms.find((e) => e instanceof dm.AcDbLine && Math.abs(e.startPoint.x - 10) < 1e-9);
  assert.deepEqual([nueva.endPoint.x, nueva.endPoint.y].map((v) => Math.round(v * 1e6) / 1e6), [10, 7]);
  assert.equal(ms.find((e) => e instanceof dm.AcDbCircle).radius, 1);
});

test('un bloque recortado (plano de ubicación) no se descompone', () => {
  const {db, a, b} = dibujo();
  const r = descomponerBloques(db, [a.objectId, b.objectId], {dm, recortado: (e) => e === b});
  assert.equal(r.bloques, 1);
  assert.equal(r.recortados, 1);
});
