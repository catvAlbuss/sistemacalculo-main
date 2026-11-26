// Aprender con el cliente, de punta a punta con un plano real (sin servidor): el agente genera las
// láminas, se simula la corrección del ingeniero en el CAD (borra N muros del agente y dibuja M que
// faltaban, como líneas propias) y «aprende de mis correcciones» debe leer exactamente eso.
//
//   node scripts/agente/probar-aprendizaje-cliente.mjs [modulo-12] [--grupo=vinchos]
import {readFileSync, existsSync} from 'node:fs';
import {join} from 'node:path';
import * as dm from '@mlightcad/data-model';
import {createDrawingContext} from '../../resources/js/ingenieria/cad/drawingContext.js';
import {SKILLS} from '../../resources/js/ingenieria/agente/skills/index.js';
import {piezaDe} from '../../resources/js/ingenieria/cad/cadExecutor.js';
import {instalarRecorteXclip} from '../../resources/js/etabs/visor/recorteXclip.js';
import {PLANOS} from './planos.mjs';
import {paresDelManifiesto} from './pares-entrenamiento.mjs';
import {cargarPlantillaAdaptativa} from './plantilla.mjs';

const args = process.argv.slice(2);
const id = args.find((a) => /^modulo-/.test(a)) ?? 'modulo-12';
const grupo = args.find((a) => a.startsWith('--grupo='))?.slice(8) ?? 'vinchos';
const BASE = join(PLANOS, 'estructuras');
const par = paresDelManifiesto(BASE, JSON.parse(readFileSync(join(BASE, 'pares.json'), 'utf8')), existsSync).find((p) => p.id === id && p.grupo === grupo);
const {AcDbLibreDwgMainThreadConverter} = await import('@mlightcad/libredwg-converter/node');
dm.AcDbDatabaseConverterManager.instance.register(dm.AcDbFileType.DWG, new AcDbLibreDwgMainThreadConverter());
instalarRecorteXclip({AcDbLibreDwgConverter: (await import('@mlightcad/libredwg-converter')).AcDbLibreDwgConverter, AcDbBlockReference: dm.AcDbBlockReference});
const plantilla = await cargarPlantillaAdaptativa();
const db = new dm.AcDbDatabase(); const b = readFileSync(par.rutaArquitectura);
await db.read(b.buffer.slice(b.byteOffset, b.byteOffset + b.byteLength), {readOnly: true}, dm.AcDbFileType.DWG);
const ctx = createDrawingContext({getDatabase: () => db, dm, loadTemplate: async () => plantilla, getProjectData: () => ({cimentacion: 'zapatas'}), setProjectData: () => {}, afterDraw: () => {}});
ctx.memoria ??= {};
const skill = (n) => SKILLS.find((s) => s.name === n);
const r = await skill('plano_estructuras').run({cimentacion: 'zapatas'}, ctx);
if (!r.ok) { console.error('Sin láminas:', r.error); process.exit(1); }
const candidatos = ctx.memoria.candidatosMuro;
const muros = ctx.entidadesDelAgente().filter((e) => piezaDe(e)?.startsWith('muro-cim:'));
console.log(`${grupo}/${id}: ${candidatos.length} candidatos · ${candidatos.filter((c) => c.dibujado).length} dibujados · ${muros.length} líneas marcadas en la lámina`);

// Corrección simulada: borra 4 muros del agente y dibuja 2 que no dibujó (con la escala de la lámina).
const borrar = muros.slice(0, 4);
db.tables.blockTable.modelSpace.removeEntity(borrar.map((e) => e.objectId));
const pares = muros.slice(4, 12).flatMap((e) => { const i = Number(piezaDe(e).split(':')[1]); const c = candidatos[i]; return [[c.a, e.startPoint], [c.b, e.endPoint]]; });
const n = pares.length, mx = pares.reduce((t, [p]) => t + p.x, 0) / n, my = pares.reduce((t, [p]) => t + p.y, 0) / n, nx = pares.reduce((t, [, q]) => t + q.x, 0) / n, ny = pares.reduce((t, [, q]) => t + q.y, 0) / n;
const s = pares.reduce((t, [p, q]) => t + (p.x - mx) * (q.x - nx) + (p.y - my) * (q.y - ny), 0) / pares.reduce((t, [p]) => t + (p.x - mx) ** 2 + (p.y - my) ** 2, 0);
const L = (p) => ({x: s * p.x + nx - s * mx, y: s * p.y + ny - s * my, z: 0});
const agregar = candidatos.filter((c) => !c.dibujado && Math.hypot(c.b.x - c.a.x, c.b.y - c.a.y) > 1).slice(0, 2);
for (const c of agregar) db.tables.blockTable.modelSpace.appendEntity(new dm.AcDbLine(L(c.a), L(c.b)));

const a = await skill('aprender_correcciones').run({}, ctx);
console.log(a.ok ? a.mensaje : `MAL: ${a.error}`);
// Agregados esperados: los candidatos no dibujados que quedan cubiertos (≥ 50 %, a ≤ 10 cm) por las
// líneas agregadas (los tramos repetidos o colineales en el mismo lugar también cuentan).
const dSeg = (p, a, b) => { const dx = b.x - a.x, dy = b.y - a.y, l2 = dx * dx + dy * dy || 1, t = Math.max(0, Math.min(1, ((p.x - a.x) * dx + (p.y - a.y) * dy) / l2)); return Math.hypot(p.x - a.x - t * dx, p.y - a.y - t * dy); };
const cubierto = (c) => { let k = 0; const n = Math.max(2, Math.ceil(Math.hypot(c.b.x - c.a.x, c.b.y - c.a.y) / 0.1)); for (let j = 0; j <= n; j++) { const p = {x: c.a.x + ((c.b.x - c.a.x) * j) / n, y: c.a.y + ((c.b.y - c.a.y) * j) / n}; if (agregar.some((g) => dSeg(p, g.a, g.b) <= 0.1)) k++; } return k / (n + 1) >= 0.5; };
const nAgregados = candidatos.filter((c) => !c.dibujado && cubierto(c)).length;
const esperado = `${muros.length - 4} muros conservados, 4 borrados y ${nAgregados} agregados`;
const ok = a.ok && a.mensaje.includes(esperado);
console.log(ok ? `OK: leyó la corrección exacta (${esperado}).` : `MAL: esperaba «${esperado}».`);
process.exitCode = ok ? 0 : 1;
