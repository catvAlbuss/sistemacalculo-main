// Prueba de capacidad del agente (sin modelo de lenguaje: las herramientas son las que
// dibujan y metran). Por cada plano de arquitectura corre el flujo completo del chat:
// proponer_estructura → plano_estructuras → revisar_laminas → metrar_estructura, y resume
// qué salió bien y qué falló. Úsalo antes de una demo y después de cada cambio.
//
//   node scripts/agente/probar-flujo.mjs [plano.dwg …]
//   (sin argumentos: todos los "* arquitectura.dwg" y casas3d de storage/app/private/entrenamiento)

import {readFileSync, readdirSync, existsSync} from 'node:fs';
import {join} from 'node:path';
import * as dm from '@mlightcad/data-model';
import {AcDbLibreDwgConverter} from '@mlightcad/libredwg-converter';
import {AcDbLibreDwgMainThreadConverter} from '@mlightcad/libredwg-converter/node';
import {instalarRecorteXclip} from '../../resources/js/etabs/visor/recorteXclip.js';
import {createDrawingContext} from '../../resources/js/ingenieria/cad/drawingContext.js';
import {SKILLS} from '../../resources/js/ingenieria/agente/skills/index.js';
import {PLANOS} from './planos.mjs';

dm.AcDbDatabaseConverterManager.instance.register(dm.AcDbFileType.DWG, new AcDbLibreDwgMainThreadConverter());
instalarRecorteXclip({AcDbLibreDwgConverter, AcDbBlockReference: dm.AcDbBlockReference});

const listar = (dir, re) => (existsSync(dir) ? readdirSync(dir).filter((f) => re.test(f)).map((f) => join(dir, f)) : []);
const planos = process.argv.slice(2).length ? process.argv.slice(2)
  : [...listar(join(PLANOS, 'estructuras'), / arquitectura\.dwg$/i), ...listar(join(PLANOS, 'casas3d'), /\.dwg$/i)];

const plantilla = new URL('../../public/assets/plantillas/estructuras-laminas', import.meta.url).href;
const cargarPlantilla = async () => {
  const db = new dm.AcDbDatabase(); const d = readFileSync(new URL(plantilla + '.dxf'));
  await db.read(d.buffer.slice(d.byteOffset, d.byteOffset + d.byteLength), {readOnly: true}, dm.AcDbFileType.DXF);
  return {db, config: JSON.parse(readFileSync(new URL(plantilla + '.json'), 'utf8'))};
};

const filas = [];
for (const ruta of planos) {
  const nombre = ruta.split(/[\\/]/).pop().replace(/\.dwg$/i, '');
  const f = {plano: nombre, pasos: [], problemas: []};
  const t0 = Date.now();
  try {
    const db = new dm.AcDbDatabase(); const b = readFileSync(ruta);
    await db.read(b.buffer.slice(b.byteOffset, b.byteOffset + b.byteLength), {readOnly: true}, dm.AcDbFileType.DWG);
    const ctx = createDrawingContext({getDatabase: () => db, dm, loadTemplate: cargarPlantilla, getProjectData: () => ({})});
    ctx.eventosDeUso = async () => []; ctx.registrarAprendizaje = async () => {}; ctx.descargarPlanilla = async () => {};
    const correr = async (n, args = {}) => {
      try { const r = await SKILLS.find((s) => s.name === n).run(args, ctx); f.pasos.push(`${n}:${r.ok === false ? 'FALLA' : 'ok'}`); if (r.ok === false) f.problemas.push(`${n}: ${r.error}`); return r; }
      catch (e) { f.pasos.push(`${n}:ERROR`); f.problemas.push(`${n}: ${e.message}`); return null; }
    };
    const p = await correr('proponer_estructura');
    f.lectura = p?.mensaje?.split('\n')[0]?.replace(/^Leí /, '').replace(/\. Casos más parecidos.*$/, '') ?? '—';
    const g = await correr('plano_estructuras');
    f.laminas = (g?.laminas ?? []).join(',') || '—';
    for (const a of g?.avisos ?? []) if (/No encontré|no tiene espacio|supuse|capas apagadas/i.test(a)) f.problemas.push(`aviso: ${a.slice(0, 110)}`);
    const rev = await correr('revisar_laminas');
    f.encimados = rev?.encimados ?? '—';
    const m = await correr('metrar_estructura');
    const met = ctx.memoria.metrado;
    f.partidas = met ? met.partidas.filter((x) => !x.titulo).length : 0;
    f.concreto = met?.resumen.concreto ?? 0;
    f.acero = met?.resumen.acero ?? 0;
    if (met && !(f.concreto > 0)) f.problemas.push('metrado sin concreto');
  } catch (e) {
    f.problemas.push(`no abrió: ${e.message}`);
  }
  f.seg = Math.round((Date.now() - t0) / 1000);
  filas.push(f);
  console.log(`\n■ ${f.plano} (${f.seg} s)\n  lectura: ${f.lectura ?? '—'}\n  láminas: ${f.laminas ?? '—'} · encimados: ${f.encimados ?? '—'} · metrado: ${f.partidas ?? 0} partidas, ${(f.concreto ?? 0).toFixed(2)} m³ de concreto, ${(f.acero ?? 0).toFixed(0)} kg de acero\n  pasos: ${f.pasos.join(' → ')}${f.problemas.length ? `\n  problemas:\n    - ${f.problemas.join('\n    - ')}` : ''}`);
}
const sanos = filas.filter((f) => !f.problemas.length && f.encimados === 0).length;
console.log(`\n${sanos}/${filas.length} planos con el flujo completo sin problemas.`);
process.exit(0);
