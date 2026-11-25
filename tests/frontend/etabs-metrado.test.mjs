// Metrado de estructuras desde lo que dibujó el agente, comparado con el del ingeniero.
import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync, existsSync} from 'node:fs';
import ExcelJS from 'exceljs';
import * as dm from '@mlightcad/data-model';
import {metradoEstructuras, dimensionesRectangulo, barrasDeRefuerzo, filasPlanilla, corregirFila, aplicarCorrecciones, renombrarFila, COLUMNAS_PLANILLA, criteriosMetrado} from '../../resources/js/ingenieria/metrado/metrado.js';
import {plantillaDesdeEdicion, terminosAprendidos} from '../../resources/js/ingenieria/metrado/terminologia.js';
import {contrasteDespacho} from '../../resources/js/ingenieria/metrado/metrado.js';
import {aprender} from '../../scripts/agente/aprender-metrados.mjs';
import {planillaExcel} from '../../resources/js/ingenieria/metrado/planillaExcel.js';
import {createDrawingContext} from '../../resources/js/ingenieria/cad/drawingContext.js';
import {SKILLS} from '../../resources/js/ingenieria/agente/skills/index.js';
import {plano} from '../../scripts/agente/planos.mjs';

const rect = (x0, y0, x1, y1) => [{x: x0, y: y0}, {x: x1, y: y0}, {x: x1, y: y1}, {x: x0, y: y1}];
const modelo = {
  proyecto: 'PRUEBA', niveles: 1, entrepisos: [], techo: 3, losaTecho: true,
  cimentacion: {tipo: 'platea', hz: 0.6, df: 2, huella: rect(0, 0, 5, 4), area: 20},
  cimientoCorrido: {ancho: 0.6, tramos: [{largo: 4, espesor: 0.15, conPuerta: true}, {largo: 3, espesor: 0.15, conPuerta: false}]},
  columnas: [0, 1, 2, 3].map(() => ({tipo: 'C1', b: 0.3, h: 0.3, area: 0.09, forma: 'rectangular', clase: 'columna', perimetro: 1.2})),
  refuerzoColumnas: [{tipo: 'C1', refuerzo: '4Ø5/8"'}],
  columnetas: [{codigo: 'pa', b: 0.13, h: 0.2}],
  vigas: [{tipo: 'V-101', eje: 'A', b: 0.25, h: 0.4, largo: 4.4, alero: 0}],
  losa: {espesor: 0.2, areaPanos: 16, areaBruta: 20, panos: [{luz: 4, viguetas: 10, area: 16, ancho: 4}]},
  vigaPeralte: 0.4,
};

test('quantities follow the office sheet: earthworks, plain and reinforced concrete, steel by bar', () => {
  const m = metradoEstructuras(modelo);
  const p = (item) => m.partidas.find((x) => x.item === item);
  assert.equal(p('02.01.02.01.03').total, 20 * 2.1, 'excavation = raft area x (Df + solado)');
  // Sobrecimiento en la fracción del cimiento que el despacho le da (columnas, placas y puertas
  // descontadas: 0.78 en el módulo 1, 0.80 en el 2, 0.68 en el 14 → mediana aprendida).
  assert.equal(p('02.02.04.01').filas[0].largo, Math.round(4 * criteriosMetrado('platea').sobrecimiento.largoSobreCimiento * 10000) / 10000, 'sobrecimiento = fracción del cimiento');
  assert.equal(p('02.02.04.01').filas[0].ancho, 0.13, 'sobrecimiento as wide as the brick (soga)');
  assert.equal(p('02.03.06.01.01').total, 4 * 0.09 * (2 - 0.6 + 3), 'columns from the top of the raft to the roof');
  const acero = p('02.03.06.01.03').filas[0];
  assert.equal(acero.varillas, 4);
  assert.equal(acero.kgm, 1.55);
  // Losa neta: paños menos vigas y columnas; 8.4 ladrillos por m².
  const neta = 16 - 4.4 * 0.25 - 4 * 0.09;
  assert.ok(Math.abs(p('02.03.11.02').total - neta) < 1e-6);
  assert.equal(p('02.03.11.04').total, Math.ceil(neta * 8.4));
  const exc = p('02.01.02.01.03').total, rell = p('02.01.03.02').total;
  assert.ok(Math.abs(p('02.01.05.02').total - (exc - rell) * 1.2) < 1e-6, 'disposal = (excavation − fill) x 1.2');
  assert.deepEqual(barrasDeRefuerzo('8Ø5/8" + 4Ø1/2"'), [{n: 8, d: '5/8"'}, {n: 4, d: '1/2"'}]);
  const d = dimensionesRectangulo([{x: 0, y: 0}, {x: 4, y: 3}, {x: 1, y: 7}, {x: -3, y: 4}]);
  assert.ok(Math.abs(d.largo - 5) < 1e-6 && Math.abs(d.ancho - 5) < 1e-6, 'rotated rectangle measured along its sides');
});

test('the Excel sheet has the office layout (same as the retaining wall metrado): header block, two-row header from column C, colored levels', async () => {
  const libro = await planillaExcel(metradoEstructuras(modelo), {ExcelJS, datos: {proyecto: 'PROYECTO DE PRUEBA', entidad: 'MUNICIPALIDAD X', especialista: 'Ing. Y', distrito: 'SAN SEBASTIAN'}});
  assert.deepEqual(libro.worksheets.map((w) => w.name), ['Metrado', 'Resumen']);
  const ws = libro.getWorksheet('Metrado');
  assert.equal(ws.getCell('C3').value, 'METRADO DE ESTRUCTURAS');
  assert.deepEqual([ws.getCell('D5').value, ws.getCell('D7').value, ws.getCell('M7').value, ws.getCell('D9').value], ['PROYECTO DE PRUEBA', 'MUNICIPALIDAD X', 'Ing. Y', 'ESTRUCTURAS']);
  assert.deepEqual(['C14', 'D14', 'G14', 'G15', 'J14', 'K14', 'M15', 'P14', 'Q14'].map((c) => ws.getCell(c).value), ['ITEM', 'DESCRIPCIÓN', 'DIMENSIONES', 'Largo', 'Nº de Veces', 'METRADO', 'Vol.', 'Total', 'Observación']);
  assert.equal(ws.getCell('C17').value, '02');
  assert.equal(ws.getCell('C17').font.color.argb, 'FF800080', 'level 1 in purple like the office sheet');
  const filas = [];
  ws.eachRow((r) => filas.push(r.values));
  assert.ok(filas.some((v) => v[3] === '02.03.06.01.01' && v[16] > 0), 'partida row with its total (column P)');
  assert.ok(filas.some((v) => /C1: longitudinal 4Ø5\/8"/.test(v[4] ?? '') && v[14] > 0), 'steel row with its kg (column N)');
});

test('the preview is the Excel sheet: same 14 columns and rows; a corrected measure recalculates and is reused on a similar plan', async () => {
  const m = metradoEstructuras({...modelo, columnetas: [{codigo: 'pa', b: 0.13, h: 0.2, eje: 'A', alto: 2.6}, {codigo: 'pa', b: 0.13, h: 0.2, eje: 'A', alto: 2.6, juntoVentana: true}, {codigo: 'pb', b: 0.13, h: 0.2}]});
  assert.equal(COLUMNAS_PLANILLA.length, 15);
  const filas = filasPlanilla(m);
  assert.ok(filas.every((f) => f.celdas.length === 15));
  // Excel = vista previa: las mismas filas, celda por celda.
  const libro = await planillaExcel(m, {ExcelJS});
  const excel = [];
  libro.getWorksheet('Metrado').eachRow((r, i) => { if (i >= 17 && r.getCell(3).value !== null || i >= 17 && r.getCell(4).value !== null) excel.push(r.values.slice(3, 18).map((v) => (typeof v === 'string' ? v.trim() : v ?? null))); });
  const vista = filas.filter((f) => f.celdas[0] !== null || f.celdas[1] !== null).map((f) => f.celdas.map((v) => (typeof v === 'string' ? v.trim() : typeof v === 'number' ? Math.round(v * 10000) / 10000 : v)));
  const a14 = (r) => Array.from({length: 15}, (_, i) => r[i] ?? null);
  assert.deepEqual(excel.slice(0, vista.length).map(a14), vista.map(a14));
  // Columnetas: alto del pórtico, del parapeto junto a una ventana, o del muro (propuesto).
  const ctas = m.partidas.find((p) => p.item === '02.03.08.01').filas;
  assert.deepEqual(ctas.map((f) => [f.descripcion, f.alto]), [['Eje A C-pa (0.20x0.13)', 2.6], ['Eje A C-pa (0.20x0.13) · junto a ventana', 1.3], ['C-pb (0.20x0.13) · alto del muro', 2.6]]);
  assert.match(ctas[2].propuesto, /alto del muro/);

  // El especialista corrige el alto de una columneta: parcial, total y resumen se recalculan.
  const antesTotal = m.partidas.find((p) => p.item === '02.03.08.01').total;
  const antesConcreto = m.resumen.concreto;
  assert.equal(corregirFila(m, {partida: '02.03.08.01', fila: 'C-pb (0.20x0.13) · alto del muro', campo: 'alto', valor: '3,10'}), 2.6);
  const p = m.partidas.find((x) => x.item === '02.03.08.01');
  assert.ok(Math.abs(p.total - (antesTotal + 0.13 * 0.2 * 0.5)) < 1e-6);
  assert.ok(Math.abs(m.resumen.concreto - (antesConcreto + 0.13 * 0.2 * 0.5)) < 1e-6);
  assert.equal(p.filas[2].propuesto, null, 'a corrected row is no longer a proposal');
  assert.equal(corregirFila(m, {partida: '02.03.08.01', fila: 'C-pb (0.20x0.13) · alto del muro', campo: 'descripcion', valor: 1}), undefined, 'only measures can be corrected');
  assert.equal(corregirFila(m, {partida: '02.03.08.01', fila: 'C-pb (0.20x0.13) · alto del muro', campo: 'alto', valor: 'mucho'}), undefined);

  // Otro metrado del mismo tipo de módulo parte de esa corrección; uno distinto, no.
  const evento = {clave: 'metrado', partida: '02.03.08.01', fila: 'C-pb (0.20x0.13) · alto del muro', campo: 'alto', valor: 3.1, rasgos: {largo: 5, ancho: 4, columnas: 4}};
  const otro = metradoEstructuras({...modelo, columnetas: [{codigo: 'pb', b: 0.13, h: 0.2}]});
  assert.equal(aplicarCorrecciones(otro, [evento], {largo: 5.1, ancho: 4, columnas: 4}), 1);
  assert.equal(otro.partidas.find((x) => x.item === '02.03.08.01').filas[0].alto, 3.1);
  const distinto = metradoEstructuras({...modelo, columnetas: [{codigo: 'pb', b: 0.13, h: 0.2}]});
  assert.equal(aplicarCorrecciones(distinto, [evento], {largo: 12, ancho: 8, columnas: 9}), 0);
});

test('office terminology and the reason of each value: names learned from the specialist, observation with the source of Hz/Df', () => {
  const conEjes = {...modelo, cimentacion: {...modelo.cimentacion, fuentes: {hz: 'dato del proyecto', df: 'propuesto por el agente con proyectos parecidos'}},
    cimientoCorrido: {ancho: 0.4, tramos: [{largo: 4, espesor: 0.15, eje: 'Y´'}, {largo: 3, espesor: 0.15}]}};
  const m = metradoEstructuras(conEjes);
  const rel = m.partidas.find((p) => p.item === '02.01.03.02');
  assert.deepEqual(rel.filas.slice(0, 3).map((f) => f.descripcion), ['Zapata corrida', 'Eje Y´', 'Cimiento corrido 2']);
  // Por qué vale lo que vale: Df y Hz con su origen.
  assert.match(rel.filas[0].obs, /Df − Hz = 2\.00 − 0\.60 \(Df: propuesto por el agente con proyectos parecidos; Hz: dato del proyecto\)/);
  assert.match(m.partidas.find((p) => p.item === '02.01.02.01.03').obs, /Alto = Df 2\.00 \(propuesto por el agente con proyectos parecidos\) \+ solado 0\.10/);
  const sinPorque = m.partidas.filter((p) => !p.titulo && !p.obs && !p.filas.every((f) => f.obs || f.propuesto)).map((p) => p.item);
  assert.deepEqual(sinPorque, [], 'every partida says where its values come from');

  // El especialista renombra "Cimiento corrido 2" como "Muro interior 2": cambia en todas las partidas.
  const r = renombrarFila(m, {partida: '02.01.03.02', fila: 'Cimiento corrido 2', nuevo: 'Muro interior 2'});
  assert.equal(r.termino, 'cimiento');
  assert.ok(m.partidas.find((p) => p.item === '02.02.03.01').filas.some((f) => f.descripcion === 'Muro interior 2'));
  // Se aprende como plantilla y el próximo metrado ya sale con ese nombre.
  const plantilla = plantillaDesdeEdicion('Muro interior 2', r.vars);
  assert.equal(plantilla, 'Muro interior {n}');
  const otro = metradoEstructuras(conEjes, {terminos: terminosAprendidos([{clave: 'termino', termino: 'cimiento', valor: plantilla}, {clave: 'termino', termino: 'platea', valor: 'Platea de cimentación'}])});
  assert.deepEqual(otro.partidas.find((p) => p.item === '02.01.03.02').filas.slice(0, 3).map((f) => f.descripcion), ['Platea de cimentación', 'Eje Y´', 'Muro interior 2']);
});

// Metrado del ingeniero del módulo 14 (planilla del despacho), solo los totales de referencia.
const INGENIERO_M14 = {'02.01.02.01': 18.72, '02.02.01': 8.91, '02.03.0X.01': 6.24, '02.03.06.01.01': 2.53, '02.03.06.01.02': 29.49, '02.03.06.01.03': 458.89, '02.03.11.01': 0.49, '02.03.11.04': 47, '02.02.04.01': 0.43};
const m14 = plano('estructuras', '14.VINCHOS MODULO 14 arquitectura.dwg');
test('module 14 from architecture: the agent metrado matches the engineer where the criteria agree', {skip: !existsSync(m14)}, async () => {
  const {AcDbLibreDwgMainThreadConverter} = await import('@mlightcad/libredwg-converter/node');
  dm.AcDbDatabaseConverterManager.instance.register(dm.AcDbFileType.DWG, new AcDbLibreDwgMainThreadConverter());
  const db = new dm.AcDbDatabase();
  const b = readFileSync(m14);
  await db.read(b.buffer.slice(b.byteOffset, b.byteOffset + b.byteLength), {readOnly: true}, dm.AcDbFileType.DWG);
  const base = new URL('../../public/assets/plantillas/estructuras-laminas', import.meta.url).href;
  const cargarPlantilla = async () => {
    if (!existsSync('public/assets/plantillas/estructuras-laminas.dxf')) return {db: null, config: {modo: 'adaptativa', escalaPlanos: 1}};
    const t = new dm.AcDbDatabase(); const d = readFileSync(new URL(base + '.dxf'));
    await t.read(d.buffer.slice(d.byteOffset, d.byteOffset + d.byteLength), {readOnly: true}, dm.AcDbFileType.DXF);
    return {db: t, config: JSON.parse(readFileSync(new URL(base + '.json'), 'utf8'))};
  };
  const ctx = createDrawingContext({getDatabase: () => db, dm, loadTemplate: cargarPlantilla, getProjectData: () => ({hz: '0.70', df: '2.00'})});
  ctx.eventosDeUso = async () => []; ctx.registrarAprendizaje = async () => {};
  let descargada = null;
  ctx.descargarPlanilla = async (met, nombre) => { descargada = nombre; };
  const r = await SKILLS.find((s) => s.name === 'metrar_estructura').run({excel: true}, ctx);
  assert.match(r.mensaje, /^Generé primero las láminas E-01, E-02\. Metrado de estructuras/);
  assert.match(descargada, /^METRADOS_ESTRUCTURAS_.+\.xlsx$/);
  const total = (re) => ctx.memoria.metrado.partidas.filter((p) => !p.titulo && re.test(p.item)).reduce((s, p) => s + p.total, 0);
  const cerca = (re, ref, tol) => { const v = total(re); assert.ok(Math.abs(v - ref) / ref <= tol, `${re}: agente ${v.toFixed(2)} vs ingeniero ${ref} (±${tol * 100} %)`); };
  cerca(/^02\.01\.02\.01\.0[13]$/, INGENIERO_M14['02.01.02.01'], 0.05);
  cerca(/^02\.02\.01\.0[12]$/, INGENIERO_M14['02.02.01'], 0.05);
  cerca(/^02\.03\.0[12]\.01$/, INGENIERO_M14['02.03.0X.01'], 0.05);
  cerca(/^02\.03\.06\.01\.01$/, INGENIERO_M14['02.03.06.01.01'], 0.05);
  cerca(/^02\.03\.06\.01\.02$/, INGENIERO_M14['02.03.06.01.02'], 0.05);
  cerca(/^02\.03\.06\.01\.03$/, INGENIERO_M14['02.03.06.01.03'], 0.05);
  cerca(/^02\.03\.11\.01$/, INGENIERO_M14['02.03.11.01'], 0.1);
  cerca(/^02\.03\.11\.04$/, INGENIERO_M14['02.03.11.04'], 0.1);
  cerca(/^02\.02\.04\.01$/, INGENIERO_M14['02.02.04.01'], 0.1);
  // Lo que antes quedaba pendiente: columnetas con su alto por pórtico, canaleta y correas.
  cerca(/^02\.03\.08\.01$/, 0.908, 0.1);
  cerca(/^02\.03\.10\.01$/, 0.341, 0.05);
  cerca(/^02\.03\.10\.03$/, 37.52, 0.1);
  cerca(/^02\.04\.01\.01$/, 37.84, 0.05);
  // Lo calculado con criterios del despacho queda marcado para que el especialista lo confirme.
  const marcadas = ctx.memoria.metrado.partidas.filter((p) => !p.titulo && p.filas.some((f) => f.propuesto)).map((p) => p.item);
  for (const item of ['02.03.09.01', '02.03.10.01', '02.04.01.01', '02.04.02.02', '02.05.01.03']) assert.ok(marcadas.includes(item), `${item} marked as a proposal`);
});

test('learning from the office sheets: size-independent ranges per element, and the metrado says when it falls outside', () => {
  // Tres módulos del despacho (solo las partidas que hacen falta) y una hoja que no es un edificio.
  const mod = (acero, concreto) => [{item: '02.03.06.01.01', total: concreto, filas: []}, {item: '02.03.06.01.03', total: acero, filas: []}, {item: '02.01.04.01', total: concreto * 10, filas: []}];
  const ref = aprender([{'Modulo 1': mod(160, 1), 'Modulo 2': mod(340, 2), 'Modulo 3': mod(540, 3), 'Obras Exteriores': mod(9000, 1)}]);
  assert.equal(ref.modulos, 3);
  assert.equal(ref.relaciones.columnaAcero.mediana, 170);
  assert.equal(ref.catalogo['02.03.06.01.01'].modulos, 3);
  // Un metrado con 100 kg/m³ de acero en columnas: fuera del rango → nota y observación.
  const m = metradoEstructuras(modelo);
  const col = m.partidas.find((p) => p.item === '02.03.06.01.03');
  const conc = m.partidas.find((p) => p.item === '02.03.06.01.01');
  col.total = conc.total * 100;
  const lista = contrasteDespacho(m, ref);
  const c = lista.find((x) => x.clave === 'columnaAcero');
  assert.equal(c.dentro, false);
  assert.match(col.contraste, /100 kg\/m³ .*va de 16\d a 1[78]\d.*fuera del rango/);
  assert.ok(m.notas.some((n) => /^Fuera del rango del despacho: acero de columnas 100 kg\/m³/.test(n)));
  // Dentro del rango: sin nota.
  col.total = conc.total * 170;
  contrasteDespacho(m, ref);
  assert.ok(!m.notas.some((n) => n.startsWith('Fuera del rango')));
});
