// Recuperación del plano: si el navegador descarta la pestaña o el usuario vuelve de
// otra página, el visor ofrece reabrir la última copia (no queda vacío).
import test from 'node:test';
import assert from 'node:assert/strict';
import * as dm from '@mlightcad/data-model';
import {crearRecuperacion, describirCopia} from '../../resources/js/etabs/composables/useDrawingRecovery.js';

function almacenMemoria() {
  let valor;
  return {escrituras: 0, leer: async () => valor, escribir: async function (v) { this.escrituras++; valor = v; }, borrar: async () => { valor = undefined; }};
}

function dibujo() {
  const db = new dm.AcDbDatabase();
  db.createDefaultData();
  db.tables.blockTable.modelSpace.appendEntity(new dm.AcDbLine({x: 0, y: 0, z: 0}, {x: 5, y: 0, z: 0}));
  return db;
}

test('the open drawing is kept as a DXF copy only when it changed, and reopens as a file', async () => {
  const almacen = almacenMemoria();
  const db = dibujo();
  const r = crearRecuperacion({getDocument: () => ({database: db, nombre: 'MODULO 14.dwg'}), almacen, ahora: () => new Date('2026-11-11T10:32:00')});
  assert.equal(await r.guardar(), true);
  assert.equal(await r.guardar(), false, 'nothing changed: no new write');
  db.tables.blockTable.modelSpace.appendEntity(new dm.AcDbLine({x: 0, y: 0, z: 0}, {x: 0, y: 5, z: 0}));
  assert.equal(await r.guardar(), true, 'the agent drew something: new copy');
  assert.equal(almacen.escrituras, 2);
  const copia = await r.leer();
  assert.equal(copia.nombre, 'MODULO 14.dwg');
  assert.equal(copia.entidades, 2);
  assert.match(copia.dxf, /SECTION[\s\S]*ENTITIES[\s\S]*LINE/);
  const archivo = r.archivo(copia);
  assert.equal(archivo.name, 'MODULO 14 (recuperado).dxf');
  // Reabierto y guardado otra vez no acumula "(recuperado)".
  assert.equal(r.archivo({...copia, nombre: 'MODULO 14 (recuperado).dxf'}).name, 'MODULO 14 (recuperado).dxf');
  // The copy opens again as a drawing with the same entities.
  const otra = new dm.AcDbDatabase();
  await otra.read(copia.dxf, {readOnly: true}, dm.AcDbFileType.DXF);
  assert.equal(otra.tables.blockTable.modelSpace.newIterator().toArray().length, 2);
  assert.match(describirCopia(copia, new Date('2026-11-11T18:00:00')), /^MODULO 14\.dwg, guardado hoy a las/);
  await r.descartar();
  assert.equal(await r.leer(), null);
});

test('an empty viewer or a browser without storage never overwrites the last copy', async () => {
  const almacen = almacenMemoria();
  const vacio = new dm.AcDbDatabase();
  vacio.createDefaultData();
  const r = crearRecuperacion({getDocument: () => ({database: vacio, nombre: 'x'}), almacen});
  assert.equal(await r.guardar(), false);
  assert.equal(await crearRecuperacion({getDocument: () => null, almacen}).guardar(), false);
  const sin = crearRecuperacion({getDocument: () => ({database: dibujo()}), almacen: null});
  assert.equal(sin.disponible, false);
  assert.equal(await sin.guardar(), false);
  assert.equal(await sin.leer(), null);
});
