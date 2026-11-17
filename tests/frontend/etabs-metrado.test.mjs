// Metrado de estructuras desde lo que dibujó el agente, comparado con el del ingeniero.
import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync, existsSync} from 'node:fs';
import ExcelJS from 'exceljs';
import * as dm from '@mlightcad/data-model';
import {metradoEstructuras, dimensionesRectangulo, barrasDeRefuerzo} from '../../resources/js/ingenieria/metrado/metrado.js';
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
  assert.equal(p('02.02.04.01').filas[0].largo, 4 - 0.9, 'no sobrecimiento under the door');
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

test('the Excel sheet has the office layout: planilla with rows per element and a summary', async () => {
  const libro = await planillaExcel(metradoEstructuras(modelo), {ExcelJS});
  assert.deepEqual(libro.worksheets.map((w) => w.name), ['Planilla', 'Resumen']);
  const ws = libro.getWorksheet('Planilla');
  assert.equal(ws.getRow(7).getCell(2).value, 'DESCRIPCIÓN');
  const filas = [];
  ws.eachRow((r) => filas.push(r.values));
  assert.ok(filas.some((v) => v[1] === '02.03.06.01.01' && v[14] > 0), 'partida row with its total');
  assert.ok(filas.some((v) => /C1: longitudinal 4Ø5\/8"/.test(v[2] ?? '') && v[12] > 0), 'steel row with its kg');
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
});
