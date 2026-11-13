// Bloques recortados con XCLIP: el visor y la lectura del agente ven solo lo que AutoCAD muestra.
import test from 'node:test';
import assert from 'node:assert/strict';
import * as dm from '@mlightcad/data-model';
import {AcDbLibreDwgConverter} from '@mlightcad/libredwg-converter';
import {recortarPolilinea, clasificarCaja, recortesDelModelo, registrarRecortes, instalarRecorteXclip, poligonoDeFiltro} from '../../resources/js/etabs/visor/recorteXclip.js';
import {aplanarModelo} from '../../resources/js/ingenieria/lectura/lectorPlano.js';

const rect = [{x: 0, y: 0}, {x: 10, y: 0}, {x: 10, y: 5}, {x: 0, y: 5}];

test('lines crossing the clip boundary are cut at the boundary, outside parts dropped', () => {
  assert.deepEqual(recortarPolilinea([{x: -5, y: 2}, {x: 15, y: 2}], rect).map((t) => t.map((p) => [p.x, p.y])), [[[0, 2], [10, 2]]]);
  assert.equal(recortarPolilinea([{x: -5, y: 9}, {x: 15, y: 9}], rect).length, 0);
  const dentro = recortarPolilinea([{x: 1, y: 1}, {x: 2, y: 1}, {x: 2, y: 2}], rect);
  assert.equal(dentro.length, 1);
  assert.equal(dentro[0].length, 3, 'a polyline fully inside stays one piece');
  // Polígono cóncavo (U): una línea que lo atraviesa sale en dos tramos.
  const u = [{x: 0, y: 0}, {x: 9, y: 0}, {x: 9, y: 9}, {x: 6, y: 9}, {x: 6, y: 3}, {x: 3, y: 3}, {x: 3, y: 9}, {x: 0, y: 9}];
  assert.equal(recortarPolilinea([{x: -1, y: 6}, {x: 10, y: 6}], u).length, 2);
  assert.equal(clasificarCaja({min: {x: 1, y: 1}, max: {x: 2, y: 2}}, rect), 'dentro');
  assert.equal(clasificarCaja({min: {x: 20, y: 1}, max: {x: 22, y: 2}}, rect), 'fuera');
  assert.equal(clasificarCaja({min: {x: -1, y: -1}, max: {x: 11, y: 6}}, rect), 'borde', 'box enclosing the clip');
});

test('SPATIAL_FILTER chain from the DWG: extension dictionary → ACAD_FILTER → SPATIAL', () => {
  const model = {objects: {
    SPATIAL_FILTER: [{handle: '1C5', ownerHandle: '1C4', vertices: [{x: 0, y: 0}, {x: 10, y: 5}], matrix: [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0]}],
    DICTIONARY: [{handle: '1C4', ownerHandle: '1C3', entries: {SPATIAL: '1C5'}}, {handle: '1C3', ownerHandle: 'A0', entries: {ACAD_FILTER: '1C4'}}],
  }};
  const recortes = recortesDelModelo(model);
  assert.deepEqual([...recortes.keys()], ['1C3']);
  assert.deepEqual(recortes.get('1C3'), rect);
  // Matriz del recorte con traslado: el polígono vuelve a coordenadas del bloque.
  assert.deepEqual(poligonoDeFiltro({vertices: [{x: 0, y: 0}, {x: 1, y: 1}], matrix: [1, 0, 0, 5, 0, 1, 0, 7, 0, 0, 1, 0]})[0], {x: -5, y: -7});
});

test('a clipped insert draws and reads only what is inside the clip; the database is untouched', () => {
  instalarRecorteXclip({AcDbLibreDwgConverter, AcDbBlockReference: dm.AcDbBlockReference});
  const db = new dm.AcDbDatabase();
  db.createDefaultData();
  const bloque = new dm.AcDbBlockTableRecord();
  bloque.name = 'TERRENO';
  db.tables.blockTable.add(bloque);
  const linea = (a, b) => new dm.AcDbLine(new dm.AcGePoint3d(a[0], a[1], 0), new dm.AcGePoint3d(b[0], b[1], 0));
  bloque.appendEntity(linea([1, 1], [2, 2]));         // dentro
  bloque.appendEntity(linea([50, 50], [60, 60]));     // fuera (árboles lejanos)
  bloque.appendEntity(linea([-5, 2], [15, 2]));       // cruza el borde
  const insercion = new dm.AcDbBlockReference('TERRENO');
  insercion.position = new dm.AcGePoint3d(100, 0, 0);
  db.tables.blockTable.modelSpace.appendEntity(insercion);
  insercion.extensionDictionary = '1C3';
  const sinRecorte = aplanarModelo([insercion]).items.length;
  assert.equal(sinRecorte, 3);
  registrarRecortes(db, new Map([['1C3', rect]]));
  const dibujo = insercion.drawableBlockTableRecord;
  assert.equal(dibujo.newIterator().toArray().length, 2, 'outside entity dropped');
  assert.notEqual(dibujo.name, 'TERRENO', 'own render-cache key: other inserts of the block stay whole');
  assert.equal(aplanarModelo([insercion]).items.length, 2, 'the agent reads the clipped block');
  const caja = insercion.geometricExtents;
  assert.ok(caja.max.x <= 100 + 15 + 1e-6 && caja.max.y <= 5, 'extents (zoom to fit) ignore what is clipped away');
  assert.equal(bloque.newIterator().toArray().length, 3, 'block definition unchanged');
});
