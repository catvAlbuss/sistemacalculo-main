// Entrenamiento del metrado: el agente lee la arquitectura, genera la estructura (como
// plano_estructuras) y la metra; se compara partida por partida con el metrado del
// ingeniero (planilla Excel del despacho). Las diferencias dicen qué criterio ajustar.
//
//   node scripts/agente/comparar-metrado.mjs <arquitectura.dwg> <metrado.xlsx> [hoja]
//
// La planilla del ingeniero: columnas C (ítem), D (descripción), E (und), P (total).

import {readFileSync} from 'node:fs';
import ExcelJS from 'exceljs';
import * as dm from '@mlightcad/data-model';
import {AcDbLibreDwgConverter} from '@mlightcad/libredwg-converter';
import {AcDbLibreDwgMainThreadConverter} from '@mlightcad/libredwg-converter/node';
import {instalarRecorteXclip} from '../../resources/js/etabs/visor/recorteXclip.js';
import {createDrawingContext} from '../../resources/js/ingenieria/cad/drawingContext.js';
import {SKILLS} from '../../resources/js/ingenieria/agente/skills/index.js';
import {metradoEstructuras} from '../../resources/js/ingenieria/metrado/metrado.js';

const [arq, xlsx, hoja] = process.argv.slice(2);
if (!arq || !xlsx) { console.error('Uso: node scripts/agente/comparar-metrado.mjs <arquitectura.dwg> <metrado.xlsx> [hoja]'); process.exit(1); }

// Categorías comparables: el mismo trabajo aunque el código cambie (platea = "zapata corrida"
// en la planilla del módulo 14; losa de cimentación en el resumen del despacho).
export const CATEGORIAS = [
  ['Excavación de la cimentación', /^02\.01\.02\.01\.0[13]$/],
  ['Relleno con material propio', /^02\.01\.03\.0[1-4]$/],
  ['Relleno con material de préstamo', /^02\.01\.03\.0[56]$/],
  ['Nivelación interior', /^02\.01\.04\.01$/],
  ['Eliminación de excedente', /^02\.01\.05\.02$/],
  ['Solado', /^02\.02\.01\.0[12]$/],
  ['Falso piso', /^02\.02\.02\.01$/],
  ['Cimiento corrido: concreto', /^02\.02\.03\.01$/],
  ['Cimiento corrido: encofrado', /^02\.02\.03\.02$/],
  ['Sobrecimiento: concreto', /^02\.02\.04\.01$/],
  ['Sobrecimiento: encofrado', /^02\.02\.04\.02$/],
  ['Cimentación: concreto', /^02\.03\.0[12]\.01$/],
  ['Cimentación: acero', /^02\.03\.0[12]\.02$/],
  ['Columnas: concreto', /^02\.03\.06\.01\.01$/],
  ['Columnas: encofrado', /^02\.03\.06\.01\.02$/],
  ['Columnas: acero', /^02\.03\.06\.01\.03$/],
  ['Vigas: concreto', /^02\.03\.07\.01\.01$/],
  ['Vigas: encofrado', /^02\.03\.07\.01\.02$/],
  ['Vigas: acero', /^02\.03\.07\.01\.03$/],
  ['Columnetas: concreto', /^02\.03\.08\.01$/],
  ['Columnetas: encofrado', /^02\.03\.08\.02$/],
  ['Columnetas: acero', /^02\.03\.08\.03$/],
  ['Losa aligerada: concreto', /^02\.03\.11\.01$/],
  ['Losa aligerada: encofrado', /^02\.03\.11\.02$/],
  ['Losa aligerada: acero', /^02\.03\.11\.03$/],
  ['Ladrillo de techo', /^02\.03\.11\.04$/],
  ['VSa: concreto', /^02\.03\.09\.01$/],
  ['VSa: encofrado', /^02\.03\.09\.02$/],
  ['VSa: acero', /^02\.03\.09\.03$/],
  ['Canaleta: concreto', /^02\.03\.10\.01$/],
  ['Canaleta: encofrado', /^02\.03\.10\.02$/],
  ['Canaleta: acero', /^02\.03\.10\.03$/],
  ['Correas metálicas', /^02\.04\.01\.01$/],
  ['Placas: concreto', /^02\.03\.05\.01\.01$/],
  ['Placas: encofrado', /^02\.03\.05\.01\.02$/],
  ['Placas: acero', /^02\.03\.05\.01\.03$/],
];

// 1) Metrado del ingeniero.
const libro = new ExcelJS.Workbook();
await libro.xlsx.readFile(xlsx);
const ws = hoja ? libro.getWorksheet(hoja) : libro.worksheets.find((w) => /modulo/i.test(w.name) && !/resumen/i.test(w.name)) ?? libro.worksheets[0];
const valor = (c) => { const v = c?.value; return v && typeof v === 'object' ? (v.result ?? v.text ?? null) : v; };
const ingeniero = new Map();
ws.eachRow((fila) => {
  const item = String(valor(fila.getCell('C')) ?? '').trim(), total = Number(valor(fila.getCell('P')));
  if (/^02(\.\d\d)+$/.test(item) && Number.isFinite(total)) ingeniero.set(item, total);
});

// 2) Estructura y metrado del agente desde la arquitectura.
dm.AcDbDatabaseConverterManager.instance.register(dm.AcDbFileType.DWG, new AcDbLibreDwgMainThreadConverter());
instalarRecorteXclip({AcDbLibreDwgConverter, AcDbBlockReference: dm.AcDbBlockReference});
const plantilla = new URL('../../public/assets/plantillas/estructuras-laminas', import.meta.url);
const cargarPlantilla = async () => {
  const db = new dm.AcDbDatabase(); const d = readFileSync(new URL(plantilla.href + '.dxf'));
  await db.read(d.buffer.slice(d.byteOffset, d.byteOffset + d.byteLength), {readOnly: true}, dm.AcDbFileType.DXF);
  return {db, config: JSON.parse(readFileSync(new URL(plantilla.href + '.json'), 'utf8'))};
};
const db = new dm.AcDbDatabase(); const b = readFileSync(arq);
await db.read(b.buffer.slice(b.byteOffset, b.byteOffset + b.byteLength), {readOnly: true}, dm.AcDbFileType.DWG);
const ctx = createDrawingContext({getDatabase: () => db, dm, loadTemplate: cargarPlantilla, getProjectData: () => ({})});
ctx.eventosDeUso = async () => [];
ctx.registrarAprendizaje = async () => {};
const r = await SKILLS.find((s) => s.name === 'plano_estructuras').run({}, ctx);
if (!ctx.memoria.modeloEstructural) { console.error(r.error ?? r.mensaje); process.exit(1); }
const met = metradoEstructuras(ctx.memoria.modeloEstructural);
const agente = new Map(met.partidas.filter((p) => !p.titulo).map((p) => [p.item, p.total]));

// 3) Comparación por categoría.
const suma = (mapa, re) => { let s = 0, hay = false; for (const [k, v] of mapa) if (re.test(k)) { s += v; hay = true; } return hay ? s : null; };
const filas = CATEGORIAS.map(([nombre, re]) => {
  const ing = suma(ingeniero, re), ag = suma(agente, re);
  const dif = ing && ag !== null ? (ag - ing) / ing : null;
  return {nombre, ing, ag, dif};
}).filter((f) => f.ing !== null || f.ag !== null);
const fmt = (v) => (v === null ? '—' : v.toFixed(2).padStart(9));
console.log(`Metrado del agente vs del ingeniero (${ws.name}):`);
console.log(`${'Partida'.padEnd(34)} ${'Ingeniero'.padStart(9)} ${'Agente'.padStart(9)}   Dif.`);
for (const f of filas) console.log(`${f.nombre.padEnd(34)} ${fmt(f.ing)} ${fmt(f.ag)}   ${f.dif === null ? (f.ing === null ? 'solo agente' : 'falta') : `${f.dif >= 0 ? '+' : ''}${Math.round(f.dif * 100)} %`}`);
const comparables = filas.filter((f) => f.dif !== null);
const cerca = comparables.filter((f) => Math.abs(f.dif) <= 0.15).length;
const exactas = comparables.filter((f) => Math.abs(f.dif) <= 0.05).length;
const pct = (n) => `${Math.round((100 * n) / (comparables.length || 1))} %`;
// Nivel ingeniero: ±5 % (lo que el cliente acepta al comparar con su Excel); ±15 %: misma partida
// con otro criterio. Lo que queda afuera es lo que hay que entrenar.
console.log(`\nNivel ingeniero (±5 %): ${exactas}/${comparables.length} partidas (${pct(exactas)}).`);
console.log(`${cerca}/${comparables.length} partidas dentro de ±15 % (${pct(cerca)}); faltan ${filas.filter((f) => f.ag === null).length}.`);
const entrenar = comparables.filter((f) => Math.abs(f.dif) > 0.05).sort((a, b) => Math.abs(b.dif) - Math.abs(a.dif));
if (entrenar.length) console.log(`Por entrenar: ${entrenar.map((f) => `${f.nombre} (${f.dif >= 0 ? '+' : ''}${Math.round(f.dif * 100)} %)`).join('; ')}.`);
console.log(`Modelo: ${JSON.stringify({niveles: ctx.memoria.modeloEstructural.niveles, techo: ctx.memoria.modeloEstructural.techo, cimentacion: {tipo: ctx.memoria.modeloEstructural.cimentacion.tipo, hz: ctx.memoria.modeloEstructural.cimentacion.hz, df: ctx.memoria.modeloEstructural.cimentacion.df}, columnas: ctx.memoria.modeloEstructural.columnas.length, tramos: ctx.memoria.modeloEstructural.cimientoCorrido.tramos?.length, vigas: ctx.memoria.modeloEstructural.vigas.length, columnetas: ctx.memoria.modeloEstructural.columnetas.length, losa: ctx.memoria.modeloEstructural.losa && {e: ctx.memoria.modeloEstructural.losa.espesor, area: +ctx.memoria.modeloEstructural.losa.areaPanos.toFixed(2)}})}`);
process.exit(0);
