// Textos de las láminas que genera el agente para un plano (para calibrar el revisor de láminas).
//   node scripts/agente/textos-laminas.mjs [modulo-08] [--grupo=vinchos] [--buscar=regex]
import {readFileSync, existsSync} from 'node:fs';
import {join} from 'node:path';
import * as dm from '@mlightcad/data-model';
import {createDrawingContext} from '../../resources/js/ingenieria/cad/drawingContext.js';
import {SKILLS} from '../../resources/js/ingenieria/agente/skills/index.js';
import {instalarRecorteXclip} from '../../resources/js/etabs/visor/recorteXclip.js';
import {aplanarModelo} from '../../resources/js/ingenieria/lectura/lectorPlano.js';
import {PLANOS} from './planos.mjs';
import {paresDelManifiesto} from './pares-entrenamiento.mjs';
import {cargarPlantillaAdaptativa} from './plantilla.mjs';

const args = process.argv.slice(2);
const id = args.find((a) => /^modulo-/.test(a)) ?? 'modulo-08';
const grupo = args.find((a) => a.startsWith('--grupo='))?.slice(8) ?? 'vinchos';
const buscar = args.find((a) => a.startsWith('--buscar='))?.slice(9);
const BASE = join(PLANOS, 'estructuras');
const par = paresDelManifiesto(BASE, JSON.parse(readFileSync(join(BASE, 'pares.json'), 'utf8')), existsSync).find((p) => p.id === id && p.grupo === grupo);
const {AcDbLibreDwgMainThreadConverter} = await import('@mlightcad/libredwg-converter/node');
dm.AcDbDatabaseConverterManager.instance.register(dm.AcDbFileType.DWG, new AcDbLibreDwgMainThreadConverter());
instalarRecorteXclip({AcDbLibreDwgConverter: (await import('@mlightcad/libredwg-converter')).AcDbLibreDwgConverter, AcDbBlockReference: dm.AcDbBlockReference});
const plantilla = await cargarPlantillaAdaptativa();
const db = new dm.AcDbDatabase(); const b = readFileSync(par.rutaArquitectura);
await db.read(b.buffer.slice(b.byteOffset, b.byteOffset + b.byteLength), {readOnly: true}, dm.AcDbFileType.DWG);
const ctx = createDrawingContext({getDatabase: () => db, dm, loadTemplate: async () => plantilla, getProjectData: () => ({hz: '0.60', df: '2.00', zona: '3', suelo: 'S2', categoria: 'A2', qadm: '1.20'}), setProjectData: () => {}, afterDraw: () => {}});
ctx.memoria ??= {};
const r = await SKILLS.find((s) => s.name === 'plano_estructuras').run({}, ctx);
if (!r.ok) { console.error(r.error); process.exit(1); }
const {items} = aplanarModelo(ctx.entidadesDelAgente());
const textos = [...new Set(items.filter((i) => i.tipo === 'texto').map((i) => i.texto.trim()).filter(Boolean))];
const lista = buscar ? textos.filter((t) => new RegExp(buscar, 'i').test(t)) : textos;
console.log(`${lista.length} textos distintos${buscar ? ` con /${buscar}/` : ''}:`);
console.log(lista.slice(0, 400).join('\n'));
