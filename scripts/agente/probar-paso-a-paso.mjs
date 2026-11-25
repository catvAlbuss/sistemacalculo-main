// Recorre "construye la estructura paso a paso" como en el panel: responde cada pregunta del chat
// con la opción recomendada y cuenta si, al dibujar, el formulario vuelve a preguntar lo mismo.
//   node scripts/agente/probar-paso-a-paso.mjs [filtro]   (p. ej. "vinchos/modulo-08")
import {readFileSync, existsSync} from 'node:fs';
import {join} from 'node:path';
import * as dm from '@mlightcad/data-model';
import {createDrawingContext} from '../../resources/js/ingenieria/cad/drawingContext.js';
import {SKILLS} from '../../resources/js/ingenieria/agente/skills/index.js';
import {instalarRecorteXclip} from '../../resources/js/etabs/visor/recorteXclip.js';
import {PLANOS} from './planos.mjs';
import {paresDelManifiesto} from './pares-entrenamiento.mjs';
import {cargarPlantillaAdaptativa, cargarDetallesEstandar, cargarCortesDespacho} from './plantilla.mjs';

const filtro = process.argv[2] ?? 'vinchos/modulo-08';
const BASE = join(PLANOS, 'estructuras');
const par = paresDelManifiesto(BASE, JSON.parse(readFileSync(join(BASE, 'pares.json'), 'utf8')), existsSync).find((p) => `${p.grupo}/${p.id}`.includes(filtro));
if (!par) { console.error(`No hay plano para "${filtro}"`); process.exit(1); }
const {AcDbLibreDwgMainThreadConverter} = await import('@mlightcad/libredwg-converter/node');
dm.AcDbDatabaseConverterManager.instance.register(dm.AcDbFileType.DWG, new AcDbLibreDwgMainThreadConverter());
instalarRecorteXclip({AcDbLibreDwgConverter: (await import('@mlightcad/libredwg-converter')).AcDbLibreDwgConverter, AcDbBlockReference: dm.AcDbBlockReference});
const db = new dm.AcDbDatabase();
const b = readFileSync(par.rutaArquitectura);
await db.read(b.buffer.slice(b.byteOffset, b.byteOffset + b.byteLength), {readOnly: true}, dm.AcDbFileType.DWG);
const plantilla = await cargarPlantillaAdaptativa();
// Datos del proyecto completos salvo lo que pregunta el paso a paso (categoría, suelo, niveles).
let datos = {hz: '0.60', df: '2.00', zona: '3', proyecto: 'P', entidad: 'E', especialista: 'X', cip: '1'};
const formularios = [];
const ctx = createDrawingContext({getDatabase: () => db, dm, loadTemplate: async () => plantilla, getProjectData: () => ({...datos}), setProjectData: (d) => { datos = {...datos, ...d}; }, afterDraw: () => {}});
ctx.memoria ??= {};
ctx.detallesEstandar = cargarDetallesEstandar(); ctx.bibliotecaDetalles = cargarCortesDespacho();
ctx.pedirDatos = async (pedido) => { formularios.push(pedido); return {decisiones: Object.fromEntries(pedido.consultas.map((c) => [c.clave, String(c.recomendado)]))}; };
const skill = SKILLS.find((s) => s.name === 'construir_estructura');
let r = await skill.run({accion: 'iniciar'}, ctx);
const preguntas = [];
for (let i = 0; i < 15 && r.opciones?.some((o) => o.herramienta === 'construir_estructura'); i++) {
  const o = r.opciones.find((x) => x.recomendada) ?? r.opciones[0];
  preguntas.push(`${r.mensaje.split('\n').at(-2)} → ${o.texto}`);
  r = await skill.run(o.args, ctx);
}
console.log('Preguntas en el chat:'); for (const p of preguntas) console.log('  ·', p);
console.log(`Formularios abiertos al dibujar: ${formularios.length}`);
for (const f of formularios) console.log('  consultas repetidas:', f.consultas.map((c) => c.clave).join(', ') || '(ninguna)', '· faltan:', f.faltan.join(', ') || '(nada)');
console.log(`Resultado: ok=${r.ok} láminas=${r.laminas?.length ?? 0}`);
const repetidas = formularios.flatMap((f) => f.consultas);
process.exit(r.ok && !repetidas.length ? 0 : 1);
