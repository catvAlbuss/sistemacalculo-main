// Entrenamiento del metrado: el agente lee la arquitectura, genera la estructura (como
// plano_estructuras) y la metra; se compara partida por partida con el metrado del
// ingeniero (planilla Excel del despacho). Las diferencias dicen qué criterio ajustar.
//
//   node scripts/agente/comparar-metrado.mjs <arquitectura.dwg> <metrado.xlsx> [hoja] [--modulo=N]
//
// La planilla del ingeniero se lee con planilla-metrado.mjs (columnas por sus encabezados; una
// hoja por módulo o varios módulos en una hoja). El módulo sale de --modulo, de la hoja o del
// nombre de los archivos.

import {readFileSync} from 'node:fs';
import {basename} from 'node:path';
import * as dm from '@mlightcad/data-model';
import {AcDbLibreDwgConverter} from '@mlightcad/libredwg-converter';
import {AcDbLibreDwgMainThreadConverter} from '@mlightcad/libredwg-converter/node';
import {instalarRecorteXclip} from '../../resources/js/etabs/visor/recorteXclip.js';
import {createDrawingContext} from '../../resources/js/ingenieria/cad/drawingContext.js';
import {SKILLS} from '../../resources/js/ingenieria/agente/skills/index.js';
import {metradoEstructuras} from '../../resources/js/ingenieria/metrado/metrado.js';
import {CATEGORIAS, abrirPlanilla, categoriasDelIngeniero} from './planilla-metrado.mjs';
import {numeroDeModulo, modulosDeMetrado} from './pares-entrenamiento.mjs';
import {cargarPlantillaAdaptativa} from './plantilla.mjs';

const argumentos = process.argv.slice(2);
const moduloArg = argumentos.find((a) => a.startsWith('--modulo='))?.slice(9);
const [arq, xlsx, hoja] = argumentos.filter((a) => !a.startsWith('--'));
if (!arq || !xlsx) { console.error('Uso: node scripts/agente/comparar-metrado.mjs <arquitectura.dwg> <metrado.xlsx> [hoja] [--modulo=N]'); process.exit(1); }

// Categorías comparables: ahora viven con el lector de planillas (se reexportan aquí).
export {CATEGORIAS};

// 1) Metrado del ingeniero: lector genérico (hoja y columnas por sus encabezados; una hoja por
// módulo, una hoja de un módulo o una hoja con varios módulos separados por título).
const modulo = Number(moduloArg ?? '') || numeroDeModulo(hoja ?? '') || (modulosDeMetrado(basename(xlsx)).length === 1 ? modulosDeMetrado(basename(xlsx))[0] : null) || numeroDeModulo(basename(arq));
const lectura = await abrirPlanilla(xlsx, {modulo, hoja});
if (lectura.error) { console.error(`Planilla no reconocida: ${lectura.error}`); process.exit(1); }
const ws = {name: lectura.hoja};
const delIngeniero = categoriasDelIngeniero(lectura);

// 2) Estructura y metrado del agente desde la arquitectura.
dm.AcDbDatabaseConverterManager.instance.register(dm.AcDbFileType.DWG, new AcDbLibreDwgMainThreadConverter());
instalarRecorteXclip({AcDbLibreDwgConverter, AcDbBlockReference: dm.AcDbBlockReference});
const cargarPlantilla = cargarPlantillaAdaptativa;
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
  const ing = delIngeniero.totales.get(nombre) ?? null, ag = suma(agente, re);
  const dif = ing && ag !== null ? (ag - ing) / ing : null;
  return {nombre, ing, ag, dif};
}).filter((f) => f.ing !== null || f.ag !== null);
const fmt = (v) => (v === null ? '—' : v.toFixed(2).padStart(9));
console.log(`Metrado del agente vs del ingeniero (${ws.name}, módulo ${modulo ?? '?'}, ${lectura.formato}, categorías por ${delIngeniero.criterio}):`);
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
if (lectura.avisos.length) console.log(`Avisos de la planilla: ${lectura.avisos.join('; ')}.`);
if (delIngeniero.sinCategoria.length) console.log(`Partidas del ingeniero sin categoría comparable: ${delIngeniero.sinCategoria.length}.`);
console.log(`Modelo: ${JSON.stringify({niveles: ctx.memoria.modeloEstructural.niveles, techo: ctx.memoria.modeloEstructural.techo, cimentacion: {tipo: ctx.memoria.modeloEstructural.cimentacion.tipo, hz: ctx.memoria.modeloEstructural.cimentacion.hz, df: ctx.memoria.modeloEstructural.cimentacion.df}, columnas: ctx.memoria.modeloEstructural.columnas.length, tramos: ctx.memoria.modeloEstructural.cimientoCorrido.tramos?.length, vigas: ctx.memoria.modeloEstructural.vigas.length, columnetas: ctx.memoria.modeloEstructural.columnetas.length, losa: ctx.memoria.modeloEstructural.losa && {e: ctx.memoria.modeloEstructural.losa.espesor, area: +ctx.memoria.modeloEstructural.losa.areaPanos.toFixed(2)}})}`);
process.exit(0);
