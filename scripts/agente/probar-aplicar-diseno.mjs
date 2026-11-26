// Fase 3 de punta a punta con un plano real (sin IA): arquitectura → láminas → diseño de Análisis
// Estructural (el paquete que deja «Enviar diseño al agente») → «aplica el diseño». Comprueba que
// el cuadro de columnas DIBUJADO, el mensaje del agente, el metrado y el .e2k digan el mismo acero.
//
//   node scripts/agente/probar-aplicar-diseno.mjs [filtro] [--paquete=<json de Análisis Estructural>]
// Sin --paquete arma uno de prueba: el primer tipo cumple y el segundo necesita 4 varillas más.
import {readFileSync, existsSync} from 'node:fs';
import {join} from 'node:path';
import * as dm from '@mlightcad/data-model';
import {createDrawingContext} from '../../resources/js/ingenieria/cad/drawingContext.js';
import {SKILLS} from '../../resources/js/ingenieria/agente/skills/index.js';
import {DISENO_DEL_AGENTE} from '../../resources/js/ingenieria/agente/skills/analisisEstructural.js';
import {instalarRecorteXclip} from '../../resources/js/etabs/visor/recorteXclip.js';
import {modeloE2k} from '../../resources/js/ingenieria/analisis/modeloE2k.js';
import {PLANOS} from './planos.mjs';
import {paresDelManifiesto} from './pares-entrenamiento.mjs';
import {cargarPlantillaAdaptativa} from './plantilla.mjs';

const args = process.argv.slice(2);
const filtro = args.find((a) => !a.startsWith('--')) ?? 'modulo-08';
const archivoPaquete = args.find((a) => a.startsWith('--paquete='))?.slice(10);
const BASE = join(PLANOS, 'estructuras');
const plano = paresDelManifiesto(BASE, JSON.parse(readFileSync(join(BASE, 'pares.json'), 'utf8')), existsSync)
  .map((p) => ({nombre: `${p.grupo}/${p.id}`, ruta: p.rutaArquitectura})).find((p) => p.nombre.includes(filtro));
if (!plano) { console.error(`No hay un plano que contenga "${filtro}".`); process.exit(1); }

const {AcDbLibreDwgMainThreadConverter} = await import('@mlightcad/libredwg-converter/node');
dm.AcDbDatabaseConverterManager.instance.register(dm.AcDbFileType.DWG, new AcDbLibreDwgMainThreadConverter());
instalarRecorteXclip({AcDbLibreDwgConverter: (await import('@mlightcad/libredwg-converter')).AcDbLibreDwgConverter, AcDbBlockReference: dm.AcDbBlockReference});
const plantilla = await cargarPlantillaAdaptativa();
const DATOS = {hz: '0.60', df: '2.00', zona: '3', suelo: 'S2', categoria: 'A2', normaE030: '2018'};
const almacen = new Map();
globalThis.localStorage = {getItem: (k) => almacen.get(k) ?? null, setItem: (k, v) => almacen.set(k, String(v)), removeItem: (k) => almacen.delete(k)};

const db = new dm.AcDbDatabase(); const b = readFileSync(plano.ruta);
await db.read(b.buffer.slice(b.byteOffset, b.byteOffset + b.byteLength), {readOnly: true}, dm.AcDbFileType.DWG);
const ctx = createDrawingContext({getDatabase: () => db, dm, loadTemplate: async () => plantilla, getProjectData: () => ({...DATOS}), setProjectData: () => {}, afterDraw: () => {}});
ctx.memoria ??= {};
const skill = (n) => SKILLS.find((s) => s.name === n);
const textosDibujados = () => ctx.readPlan().items.filter((i) => i.tipo === 'texto').map((i) => i.texto);

const r1 = await skill('plano_estructuras').run({}, ctx);
if (!r1.ok) { console.error('Sin láminas:', r1.error); process.exit(1); }
const antes = ctx.memoria.modeloEstructural.refuerzoColumnas;
console.log(`${plano.nombre}: cuadro antes → ${antes.map((f) => `${f.tipo} ${f.refuerzo}`).join(', ')}`);

const paquete = archivoPaquete ? JSON.parse(readFileSync(archivoPaquete, 'utf8')) : {
  version: 1, modelo: 'prueba', revision: {texto: 'Lo revisado cumple.', noCumple: 0},
  columnas: Object.fromEntries(antes.map((f, i) => {
    const n = Number(/^(\d+)/.exec(f.refuerzo)[1]);
    return [f.tipo, i === 1
      ? {tipo: f.tipo, n: n + 4, nOriginal: n, ratio: 0.94, ratioOriginal: 1.08, aumentado: true, cumple: true, barra: '5/8"', columnas: 2, sinDiseno: 0, sinSolucion: []}
      : {tipo: f.tipo, n, nOriginal: n, ratio: 0.46, ratioOriginal: 0.46, aumentado: false, cumple: true, barra: '5/8"', columnas: 2, sinDiseno: 0, sinSolucion: []}];
  })),
};
localStorage.setItem(DISENO_DEL_AGENTE, JSON.stringify(paquete));

const r2 = await skill('aplicar_diseno').run({}, ctx);
console.log(`\n«aplica el diseño» → ${r2.ok ? 'ok' : 'MAL'}\n${String(r2.mensaje ?? r2.error).split('\n').slice(0, 6).join('\n')}`);
const despues = ctx.memoria.modeloEstructural.refuerzoColumnas;
const textos = textosDibujados();
let mal = 0;
for (const t of Object.values(paquete.columnas)) {
  const fila = despues.find((f) => f.tipo === t.tipo);
  const esperado = t.aumentado ? `${t.n}Ø${t.barra}` : antes.find((f) => f.tipo === t.tipo)?.refuerzo;
  const dibujado = textos.includes(fila?.refuerzo);
  const ok = fila?.refuerzo === esperado && dibujado && r2.mensaje?.includes(`${t.tipo}:`);
  if (!ok) mal++;
  console.log(`${ok ? 'OK ' : 'MAL'} ${t.tipo}: cuadro ${fila?.refuerzo ?? '—'} (esperado ${esperado})${dibujado ? ', dibujado en la lámina' : ', NO aparece en la lámina'}${fila?.verificado ? ` · D/C ${fila.verificado.ratio}` : ''}`);
}
const g = modeloE2k({estructura: ctx.memoria.estructura, modelo: ctx.memoria.modeloEstructural, datos: DATOS, nombre: 'prueba'});
for (const [sec, a] of Object.entries(g.resumen.armadoColumnas)) {
  const t = paquete.columnas[sec.split('-')[0]];
  if (t?.aumentado && a.nCuadro !== t.n) { mal++; console.log(`MAL .e2k ${sec}: ${a.nCuadro} varillas, el diseño dice ${t.n}`); }
}
const m = await skill('metrar_estructura').run({}, ctx).catch((e) => ({ok: false, error: e.message}));
console.log(`Metrado: ${m.ok ? 'ok' : `MAL ${m.error}`}${m.resumen ? ` · ${String(m.resumen).slice(0, 140)}` : ''}`);
console.log(`\n${mal ? `${mal} diferencia(s)` : 'El mensaje, el cuadro dibujado y el .e2k dicen el mismo acero.'}`);
process.exitCode = mal || !r2.ok || !m.ok ? 1 : 0;
