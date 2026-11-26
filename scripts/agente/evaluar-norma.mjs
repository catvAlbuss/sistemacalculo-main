// Revisor contra la norma (revisorNorma.js, 15 puntos) en TODOS los planos: el agente genera las
// láminas con los datos que el cliente llena en el formulario (sin qadm ni análisis, como hoy) y se
// puntúa cada una. Da el promedio y los puntos que más faltan.
//
//   node scripts/agente/evaluar-norma.mjs [--json=salida.json]
import {readFileSync, writeFileSync, existsSync} from 'node:fs';
import {join} from 'node:path';
import * as dm from '@mlightcad/data-model';
import {createDrawingContext} from '../../resources/js/ingenieria/cad/drawingContext.js';
import {SKILLS} from '../../resources/js/ingenieria/agente/skills/index.js';
import {instalarRecorteXclip} from '../../resources/js/etabs/visor/recorteXclip.js';
import {PUNTOS_REVISOR} from '../../resources/js/ingenieria/laminas/revisorNorma.js';
import {PLANOS} from './planos.mjs';
import {paresDelManifiesto} from './pares-entrenamiento.mjs';
import {cargarPlantillaAdaptativa} from './plantilla.mjs';

const salida = process.argv.find((a) => a.startsWith('--json='))?.slice(7);
const BASE = join(PLANOS, 'estructuras');
const pares = paresDelManifiesto(BASE, JSON.parse(readFileSync(join(BASE, 'pares.json'), 'utf8')), existsSync);
const {AcDbLibreDwgMainThreadConverter} = await import('@mlightcad/libredwg-converter/node');
dm.AcDbDatabaseConverterManager.instance.register(dm.AcDbFileType.DWG, new AcDbLibreDwgMainThreadConverter());
instalarRecorteXclip({AcDbLibreDwgConverter: (await import('@mlightcad/libredwg-converter')).AcDbLibreDwgConverter, AcDbBlockReference: dm.AcDbBlockReference});
const plantilla = await cargarPlantillaAdaptativa();
// Lo que llena el cliente en el formulario (sin qadm: hoy casi nunca lo dan).
const DATOS = {hz: '0.60', df: '2.00', zona: '3', suelo: 'S2', categoria: 'A2', proyecto: 'PROYECTO DE PRUEBA', entidad: 'ENTIDAD', especialista: 'ING. RESPONSABLE', cip: '000000'};

const filas = [];
for (const par of pares) {
  try {
    const db = new dm.AcDbDatabase(); const b = readFileSync(par.rutaArquitectura);
    await db.read(b.buffer.slice(b.byteOffset, b.byteOffset + b.byteLength), {readOnly: true}, dm.AcDbFileType.DWG);
    const ctx = createDrawingContext({getDatabase: () => db, dm, loadTemplate: async () => plantilla, getProjectData: () => ({...DATOS}), setProjectData: () => {}, afterDraw: () => {}});
    ctx.memoria ??= {};
    const r = await SKILLS.find((s) => s.name === 'plano_estructuras').run({}, ctx);
    if (!r.ok || !r.revisionNorma) { console.log(`MAL ${par.grupo}/${par.id}: ${r.error ?? 'sin revisión'}`); continue; }
    filas.push({plano: `${par.grupo}/${par.id}`, externo: Boolean(par.holdout), puntaje: r.revisionNorma.puntaje, puntos: r.revisionNorma.puntos.map((p) => p.valor)});
    console.log(`${String(r.revisionNorma.puntaje).padStart(3)} %  ${par.grupo}/${par.id}${par.holdout ? ' (externo)' : ''}  falta: ${r.revisionNorma.faltan.map((x) => x.id).join(', ') || '—'}`);
  } catch (e) {
    console.log(`MAL ${par.grupo}/${par.id}: ${String(e?.message ?? e).slice(0, 120)}`);
  }
}
const prom = (xs) => (xs.length ? Math.round(xs.reduce((a, b) => a + b, 0) / xs.length) : null);
const porPunto = PUNTOS_REVISOR.map((p, i) => ({id: p.id, titulo: p.titulo, norma: p.norma, cumple: prom(filas.map((f) => f.puntos[i] * 100))}));
const resultado = {fecha: new Date().toISOString(), planos: filas.length, promedio: prom(filas.map((f) => f.puntaje)), externos: prom(filas.filter((f) => f.externo).map((f) => f.puntaje)), porPunto, filas};
console.log(`\nPromedio: ${resultado.promedio} % en ${filas.length} planos${resultado.externos !== null ? ` (externos ${resultado.externos} %)` : ''}`);
for (const p of [...porPunto].sort((a, b) => a.cumple - b.cumple)) console.log(`  ${String(p.cumple).padStart(3)} %  ${p.id}. ${p.titulo}`);
if (salida) writeFileSync(salida, JSON.stringify(resultado, null, 1));
