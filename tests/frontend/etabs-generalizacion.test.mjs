// Generalización: el agente lee arquitecturas que no son las de su plantilla
// (módulos 3 y 09) y llega a lo que dibujó el ingeniero en esos expedientes.
import test from 'node:test';
import assert from 'node:assert/strict';
import {existsSync, readFileSync} from 'node:fs';
import * as dm from '@mlightcad/data-model';
import {aplanarModelo, detectarVistas, leerVista, claseDeSeccion, espesorDeSeccion} from '../../resources/js/ingenieria/lectura/lectorPlano.js';
import {diagnosticarLectura} from '../../resources/js/ingenieria/lectura/diagnostico.js';
import {refuerzoMinimo} from '../../resources/js/ingenieria/laminas/laminaEstructuras.js';
import {luzEntreEjes, espesorAligerado} from '../../resources/js/ingenieria/planos/aligeradoPlano.js';
import {plano} from '../../scripts/agente/planos.mjs';
import {CRITERIOS} from '../../resources/js/ingenieria/criterios/criteriosEstructurales.js';
import {medidasDeSeccion, tituloDelCuadro} from '../../resources/js/ingenieria/laminas/cuadroColumnas.js';

const m03 = plano('estructuras', 'Modulo 3 INICIAL arquitectura.dwg');
const m09 = plano('estructuras', 'Modulo 09 Vilcabamba arquitectura.dwg');

const ilo01 = plano('estructuras', 'ilo', '1. MODULO 01 Arquitectura.dwg');
const ilo11 = plano('estructuras', 'ilo', '11. MODULO 11 Arquitectura.dwg');

async function itemsDe(path) {
  const {AcDbLibreDwgMainThreadConverter} = await import('@mlightcad/libredwg-converter/node');
  dm.AcDbDatabaseConverterManager.instance.register(dm.AcDbFileType.DWG, new AcDbLibreDwgMainThreadConverter());
  const db = new dm.AcDbDatabase();
  const b = readFileSync(path);
  await db.read(b.buffer.slice(b.byteOffset, b.byteOffset + b.byteLength), {readOnly: true}, dm.AcDbFileType.DWG);
  return {db, items: aplanarModelo(db.tables.blockTable.modelSpace.newIterator().toArray()).items};
}

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

// Grilla sintética de otro arquitecto: burbujas en una capa sin "eje" y un eje (5) que solo se
// dibuja desde su burbuja derecha (ILO 1, primer nivel); en un cruce, una columneta 0.13x0.25.
function grillaIlo() {
  const capa = 'proyeccion', r = 0.25, items = [];
  const burbuja = (x, y, nombre) => {
    items.push({tipo: 'circulo', capa, centro: {x, y}, radio: r});
    items.push({tipo: 'texto', capa, centro: {x: x - 0.1, y: y - 0.1}, texto: nombre, alto: 0.25});
  };
  const linea = (a, b) => items.push({tipo: 'linea', capa: 'EJES GENERALES', puntos: [a, b]});
  for (const [n, x] of [['G', 0], ['M', 6]]) { burbuja(x, 10, n); burbuja(x, -2, n); linea({x, y: 9.75}, {x, y: -1.75}); }
  burbuja(-2, 8, '1'); burbuja(8, 8, '1'); linea({x: -1.75, y: 8}, {x: 7.75, y: 8});
  burbuja(-2, 0, '05'); burbuja(8, 0, '05'); linea({x: 7.75, y: 0}, {x: 3, y: 0});
  const rect = (x, y, b, h) => items.push({tipo: 'poli', capa: 'A-COLS', cerrada: true, puntos: [{x: x - b / 2, y: y - h / 2}, {x: x + b / 2, y: y - h / 2}, {x: x + b / 2, y: y + h / 2}, {x: x - b / 2, y: y + h / 2}]});
  rect(0, 8, 0.4, 0.4); rect(6, 8, 0.4, 0.4); rect(0, 0, 0.4, 0.4); rect(6, 0, 0.13, 0.25);
  items.push({tipo: 'texto', capa: 'textos', centro: {x: 2, y: -3.5}, texto: 'PRIMER NIVEL MODULO I', alto: 0.4});
  return items;
}

test('an axis drawn only from one bubble still reaches the other bubble with its label (no axis trace there)', () => {
  const items = grillaIlo();
  const [vista] = detectarVistas(items);
  assert.ok(vista, 'one view');
  assert.deepEqual(vista.ejes.map((e) => e.nombre).sort(), ['1', '5', 'G', 'M']);
  const cruces = vista.intersecciones.map((n) => n.ejes.slice().sort().join('/'));
  assert.ok(cruces.includes('5/G'), `crossings: ${cruces.join(' ')}`);
  // Un círculo con rótulo y sin pareja que le apunte (marca de corte) sigue sin ser eje.
  items.push({tipo: 'circulo', capa: 'proyeccion', centro: {x: 3, y: 4}, radio: 0.25}, {tipo: 'texto', capa: 'proyeccion', centro: {x: 2.9, y: 3.9}, texto: 'B', alto: 0.25});
  assert.ok(!detectarVistas(items)[0].ejes.some((e) => e.nombre === 'B'));
});

test('a 0.13x0.25 confinement column at a crossing is not a frame column; a 0.40x0.40 is', () => {
  const items = grillaIlo();
  const lectura = leerVista(items, detectarVistas(items)[0]);
  assert.deepEqual(lectura.columnas.map((c) => c.eje).sort(), ['1/G', '1/M', '5/G']);
  assert.equal(lectura.columnetas, 1, 'it is kept as a columneta');
});

test('two bubbles with the same label but very different sizes (another sheet at another scale) are not one axis', () => {
  const items = grillaIlo();
  // Eje "3" de esta planta sin su burbuja derecha, y otro "3" de r 0.40 en una lámina a 60 m.
  items.push({tipo: 'circulo', capa: 'proyeccion', centro: {x: -2, y: 4}, radio: 0.25}, {tipo: 'texto', capa: 'proyeccion', centro: {x: -2.1, y: 3.9}, texto: '3', alto: 0.25});
  items.push({tipo: 'linea', capa: 'EJES GENERALES', puntos: [{x: -1.75, y: 4}, {x: 1, y: 4}]});
  items.push({tipo: 'circulo', capa: 'proyeccion', centro: {x: 60, y: 4.5}, radio: 0.4}, {tipo: 'texto', capa: 'proyeccion', centro: {x: 59.9, y: 4.4}, texto: '3', alto: 0.35});
  items.push({tipo: 'linea', capa: 'EJES GENERALES', puntos: [{x: 59.6, y: 4.5}, {x: 57, y: 4.5}]});
  const [vista] = detectarVistas(items);
  assert.ok(vista.caja.x1 < 20, `the plan does not reach the other sheet (x1 = ${vista.caja.x1})`);
});

test('a long placa touching two close crossings keeps one column and notes the other crossing', () => {
  const items = grillaIlo();
  // Eje "1´" a 0.8 m del 1 y una placa 0.30x1.20 que toca los cruces 1/M y 1´/M.
  items.push({tipo: 'circulo', capa: 'proyeccion', centro: {x: -2, y: 7.2}, radio: 0.25}, {tipo: 'texto', capa: 'proyeccion', centro: {x: -2.1, y: 7.1}, texto: "1'", alto: 0.25});
  items.push({tipo: 'circulo', capa: 'proyeccion', centro: {x: 8, y: 7.2}, radio: 0.25}, {tipo: 'texto', capa: 'proyeccion', centro: {x: 7.9, y: 7.1}, texto: "1'", alto: 0.25});
  items.push({tipo: 'linea', capa: 'EJES GENERALES', puntos: [{x: -1.75, y: 7.2}, {x: 7.75, y: 7.2}]});
  const i = items.findIndex((it) => it.tipo === 'poli' && it.puntos[0].x === 5.8 && it.puntos[0].y === 7.8);
  items[i] = {tipo: 'poli', capa: 'A-COLS', cerrada: true, puntos: [{x: 5.85, y: 7.0}, {x: 6.15, y: 7.0}, {x: 6.15, y: 8.2}, {x: 5.85, y: 8.2}]};
  const lectura = leerVista(items, detectarVistas(items)[0]);
  const placa = lectura.columnas.filter((c) => c.x > 5 && c.y > 6.5);
  assert.equal(placa.length, 1, 'one element, not two');
  assert.deepEqual([placa[0].eje, ...(placa[0].tambienEn ?? [])].sort(), ['1/M', '1´/M']);
});

test('no concrete columns but small posts on every crossing: reported as a light structure to confirm, nothing invented', () => {
  const items = grillaIlo().filter((it) => it.capa !== 'A-COLS');
  const poste = (x, y) => items.push({tipo: 'poli', capa: '.', cerrada: true, puntos: [{x: x - 0.075, y: y - 0.075}, {x: x + 0.075, y: y - 0.075}, {x: x + 0.075, y: y + 0.075}, {x: x - 0.075, y: y + 0.075}]});
  for (const [x, y] of [[0, 8], [6, 8], [0, 0], [6, 0]]) poste(x, y);
  const vistas = detectarVistas(items);
  const lectura = leerVista(items, vistas[0]);
  assert.equal(lectura.columnas.length, 0);
  assert.equal(lectura.postes.length, 4);
  const d = diagnosticarLectura({database: null, items, vistas});
  const p = d.problemas.find((x) => x.codigo === 'columnas');
  assert.ok(p?.dudoso && /estructura liviana/.test(p.texto), p?.texto);
});

test('ILO module 01 (another architect): axis 5 drawn only from its right bubble still crosses G, with its L placa', {skip: !existsSync(ilo01)}, async () => {
  const {items} = await itemsDe(ilo01);
  const vista = detectarVistas(items).find((v) => /PRIMER NIVEL/i.test(v.titulo));
  const lectura = leerVista(items, vista);
  assert.ok(lectura.columnas.some((c) => c.eje === '5/G' && c.forma === 'L'), lectura.columnas.map((c) => c.eje).join(' '));
  assert.equal(lectura.columnas.length, 17);
});

test('ILO module 11: a light structure (0.15 posts on its 24 crossings) is flagged, not structured with invented columns', {skip: !existsSync(ilo11)}, async () => {
  const {db, items} = await itemsDe(ilo11);
  const vistas = detectarVistas(items);
  const lectura = leerVista(items, vistas.find((v) => /PRIMER NIVEL/i.test(v.titulo)));
  assert.equal(lectura.columnas.length, 0);
  assert.equal(lectura.postes.length, 24);
  assert.ok(diagnosticarLectura({database: db, items, vistas}).problemas.some((p) => p.dudoso && /0\.15x0\.15/.test(p.texto)));
});
