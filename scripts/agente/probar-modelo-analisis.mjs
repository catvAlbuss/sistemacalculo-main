// Arquitectura → modelo de análisis (.e2k) para TODOS los planos: el agente lee la arquitectura,
// arma el .e2k (analisis/modeloE2k.js) y el MISMO lector de Análisis Estructural lo interpreta.
// Reporta por plano: pisos, nudos, columnas, vigas, losas, apoyos, espectro, combinaciones y avisos.
//
//   node scripts/agente/probar-modelo-analisis.mjs [filtro] [--salida=<carpeta para los .e2k>]
import {readFileSync, writeFileSync, mkdirSync, existsSync, readdirSync} from 'node:fs';
import {join, basename} from 'node:path';
import * as dm from '@mlightcad/data-model';
import {createDrawingContext} from '../../resources/js/ingenieria/cad/drawingContext.js';
import {SKILLS} from '../../resources/js/ingenieria/agente/skills/index.js';
import {instalarRecorteXclip} from '../../resources/js/etabs/visor/recorteXclip.js';
import {modeloE2k} from '../../resources/js/ingenieria/analisis/modeloE2k.js';
import {PLANOS} from './planos.mjs';
import {paresDelManifiesto} from './pares-entrenamiento.mjs';
import {cargarPlantillaAdaptativa} from './plantilla.mjs';
import {leerE2k} from './lectorE2k.mjs';

const args = process.argv.slice(2);
const filtro = args.find((a) => !a.startsWith('--'));
const salida = args.find((a) => a.startsWith('--salida='))?.slice(9);
if (salida) mkdirSync(salida, {recursive: true});
const BASE = join(PLANOS, 'estructuras');
const planos = [
  ...paresDelManifiesto(BASE, JSON.parse(readFileSync(join(BASE, 'pares.json'), 'utf8')), existsSync).map((p) => ({nombre: `${p.grupo}/${p.id}`, ruta: p.rutaArquitectura})),
  ...(existsSync(join(PLANOS, 'casas3d')) ? readdirSync(join(PLANOS, 'casas3d')).filter((f) => /\.dwg$/i.test(f)).map((f) => ({nombre: `casa/${basename(f, '.dwg')}`, ruta: join(PLANOS, 'casas3d', f)})) : []),
].filter((p) => !filtro || p.nombre.includes(filtro));

const {AcDbLibreDwgMainThreadConverter} = await import('@mlightcad/libredwg-converter/node');
dm.AcDbDatabaseConverterManager.instance.register(dm.AcDbFileType.DWG, new AcDbLibreDwgMainThreadConverter());
instalarRecorteXclip({AcDbLibreDwgConverter: (await import('@mlightcad/libredwg-converter')).AcDbLibreDwgConverter, AcDbBlockReference: dm.AcDbBlockReference});
const plantilla = await cargarPlantillaAdaptativa();
const DATOS = {hz: '0.60', df: '2.00', zona: '3', suelo: 'S2', categoria: 'A2', normaE030: '2018'};

let bien = 0;
for (const p of planos) {
  try {
    const db = new dm.AcDbDatabase(); const b = readFileSync(p.ruta);
    await db.read(b.buffer.slice(b.byteOffset, b.byteOffset + b.byteLength), {readOnly: true}, dm.AcDbFileType.DWG);
    const ctx = createDrawingContext({getDatabase: () => db, dm, loadTemplate: async () => plantilla, getProjectData: () => ({...DATOS}), setProjectData: () => {}, afterDraw: () => {}});
    ctx.memoria ??= {};
    const r = await SKILLS.find((s) => s.name === 'plano_estructuras').run({}, ctx);
    if (!r.ok) { console.log(`MAL ${p.nombre.padEnd(22)} sin láminas: ${String(r.error).slice(0, 120)}`); continue; }
    const g = modeloE2k({estructura: ctx.memoria.estructura, modelo: ctx.memoria.modeloEstructural, datos: DATOS, nombre: p.nombre});
    if (salida) writeFileSync(join(salida, `${p.nombre.replace(/[\\/ ]/g, '_')}.e2k`), g.texto);
    const m = await leerE2k(g.texto), md = m.model, def = m.definitions ?? {};
    const barras = md.frames ?? md.beams ?? [];
    const col = barras.filter((f) => f.type === 'column').length, vig = barras.filter((f) => f.type === 'beam').length;
    const apoyos = md.nodes.filter((n) => n.restraints?.ux || n.hasRestraints || n.soporte).length;
    const ok = col === g.resumen.columnas && vig === g.resumen.vigas && md.areas.length === g.resumen.losas && apoyos === g.resumen.apoyos;
    if (ok) bien++;
    console.log(`${ok ? 'OK ' : 'MAL'} ${p.nombre.padEnd(22)} pisos ${g.resumen.pisos} · nudos ${g.resumen.nudos} · columnas ${col}/${g.resumen.columnas} · vigas ${vig}/${g.resumen.vigas} · losas ${md.areas.length}/${g.resumen.losas} · apoyos ${apoyos} · espectro ${(def.responseSpectrumCases ?? []).length} · combos ${(def.loadCombinations ?? []).length}${g.avisos.length ? ` · AVISO: ${g.avisos.join(' ')}` : ''}`);
  } catch (e) {
    console.log(`MAL ${p.nombre.padEnd(22)} excepción: ${String(e?.message ?? e).slice(0, 160)}`);
  }
}
console.log(`\n${bien}/${planos.length} planos: arquitectura → modelo de análisis que Análisis Estructural lee completo.`);
