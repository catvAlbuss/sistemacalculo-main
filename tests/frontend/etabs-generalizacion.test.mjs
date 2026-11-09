// Generalización: el agente lee arquitecturas que no son las de su plantilla
// (módulos 3 y 09) y llega a lo que dibujó el ingeniero en esos expedientes.
import test from 'node:test';
import assert from 'node:assert/strict';
import {existsSync, readFileSync} from 'node:fs';
import * as dm from '@mlightcad/data-model';
import {aplanarModelo, detectarVistas, leerVista, claseDeSeccion, espesorDeSeccion} from '../../resources/js/etabs/agente/lectorPlano.js';
import {refuerzoMinimo} from '../../resources/js/etabs/agente/laminaEstructuras.js';
import {luzEntreEjes, espesorAligerado} from '../../resources/js/etabs/agente/aligeradoPlano.js';
import {plano} from '../../scripts/agente/planos.mjs';
import {CRITERIOS} from '../../resources/js/etabs/agente/criteriosEstructurales.js';
import {medidasDeSeccion, tituloDelCuadro} from '../../resources/js/etabs/agente/cuadroColumnas.js';

const m03 = plano('estructuras', 'Modulo 3 INICIAL arquitectura.dwg');
const m09 = plano('estructuras', 'Modulo 09 Vilcabamba arquitectura.dwg');

async function primerNivel(path) {
  const {AcDbLibreDwgMainThreadConverter} = await import('@mlightcad/libredwg-converter/node');
  dm.AcDbDatabaseConverterManager.instance.register(dm.AcDbFileType.DWG, new AcDbLibreDwgMainThreadConverter());
  const db = new dm.AcDbDatabase();
  const b = readFileSync(path);
  await db.read(b.buffer.slice(b.byteOffset, b.byteOffset + b.byteLength), {readOnly: true}, dm.AcDbFileType.DWG);
  const {items} = aplanarModelo(db.tables.blockTable.modelSpace.newIterator().toArray());
  const vistas = detectarVistas(items);
  const vista = vistas.find((v) => /1ER NIVEL/i.test(v.titulo));
  assert.ok(vista, `views: ${vistas.map((v) => v.titulo).join(' | ')}`);
  return {vistas, lectura: leerVista(items, vista)};
}

test('placa or column, named like the engineer from the section alone', () => {
  // A = t(b + h - t): espesor de las L y T de los cuadros.
  assert.equal(espesorDeSeccion({forma: 'L', b: 1.5, h: 1.0, area: 0.66}), 0.3);
  assert.equal(espesorDeSeccion({forma: 'L', b: 0.4, h: 0.4, area: 0.1375}), 0.25);
  assert.equal(claseDeSeccion({forma: 'L', b: 1.5, h: 1.0, area: 0.66}).prefijo, 'PL');
  assert.equal(claseDeSeccion({forma: 'L', b: 0.9, h: 0.9, area: 0.45}).prefijo, 'PL');
  assert.equal(claseDeSeccion({forma: 'T', b: 1.0, h: 0.6, area: 0.39}).prefijo, 'CT');
  assert.equal(claseDeSeccion({forma: 'L', b: 0.5, h: 0.6, area: 0.24}).prefijo, 'C');
  assert.equal(claseDeSeccion({forma: 'L', b: 0.4, h: 0.4, area: 0.1375}).prefijo, 'C');
  // Cuantía ~1 % como redondea el ingeniero.
  assert.equal(refuerzoMinimo(0.39).texto, '20Ø5/8"');
  assert.equal(refuerzoMinimo(0.24).texto, '12Ø5/8"');
  assert.equal(refuerzoMinimo(0.1375).texto, '8Ø5/8"');
  // Estribos de confinamiento según la sección (cuadros de los tres módulos).
  const d = CRITERIOS.columnas.distribucionPorSeccion;
  assert.match(d({prefijo: 'CT', clase: 'columna', b: 1, h: 0.6}), /12@0\.10/);
  assert.match(d({prefijo: 'PL', clase: 'placa', b: 1.5, h: 1}), /10@0\.10/);
  assert.match(d({prefijo: 'C', clase: 'columna', b: 0.4, h: 0.4}), /9@0\.10/);
  assert.equal(medidasDeSeccion({forma: 'T', b: 0.6, h: 1, espesor: 0.3}), '1.00x0.60x0.30m');
  assert.equal(tituloDelCuadro([{clase: 'placa'}, {clase: 'columna'}]), 'CUADRO DE PLACA Y COLUMNA');
  assert.equal(CRITERIOS.platea.preferida, true, 'the three expedientes use a mat foundation');
});

test('module 3 (unseen plan): first floor read like the engineer: 4 corner placas PL1 L 1.50x1.00 and 8 CT1 T 1.00x0.60', {skip: !existsSync(m03)}, async () => {
  const {lectura} = await primerNivel(m03);
  assert.deepEqual(lectura.ejes.map((e) => e.nombre).sort(), ['6´', '8', 'C', 'D', 'E', 'F', 'G', 'H']);
  const tipos = Object.fromEntries(lectura.tipos.map((t) => [t.tipo, t]));
  assert.equal(tipos.PL1?.cantidad, 4);
  assert.equal(tipos.CT1?.cantidad, 8);
  assert.equal(lectura.columnas.length, 12, 'no 0.20 squares taken as columns');
  assert.ok(espesorAligerado(luzEntreEjes(lectura.ejes)) === 0.2, 'slab 20 cm, like the engineer');
});

test('module 09 (unseen plan): two floors and sections on one sheet are kept apart; slab 25 cm from 5.8-6.1 m spans', {skip: !existsSync(m09)}, async () => {
  const {vistas, lectura} = await primerNivel(m09);
  assert.ok(!vistas.some((v) => /PORCELANATO/i.test(v.titulo)), 'a finish legend is not a view title');
  assert.ok(vistas.some((v) => /2DO NIVEL/i.test(v.titulo)));
  assert.deepEqual(lectura.ejes.map((e) => e.nombre).sort(), ['1', '15', '9', 'W´', 'X']);
  assert.ok(lectura.ejes.every((e) => !e.inclinado), 'a barely skewed axis is not inclined');
  assert.deepEqual(lectura.tipos.map((t) => `${t.tipo}:${t.cantidad}`).sort(), ['C1:2', 'CT1:2', 'PL1:2']);
  assert.equal(espesorAligerado(luzEntreEjes(lectura.ejes)), 0.25);
});
