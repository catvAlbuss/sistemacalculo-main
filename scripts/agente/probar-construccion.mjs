// Prueba de la construcción guiada con un plano real, sin navegador ni IA: inicia, responde cada
// pregunta con la opción recomendada (o la primera) y muestra lo que el ingeniero vería.
//
//   node scripts/agente/probar-construccion.mjs <grupo> <modulo-NN>
import {readFileSync, existsSync} from 'node:fs';
import {join} from 'node:path';
import * as dm from '@mlightcad/data-model';
import {createDrawingContext} from '../../resources/js/ingenieria/cad/drawingContext.js';
import {SKILLS} from '../../resources/js/ingenieria/agente/skills/index.js';
import {instalarRecorteXclip} from '../../resources/js/etabs/visor/recorteXclip.js';
import {PLANOS} from './planos.mjs';
import {paresDelManifiesto} from './pares-entrenamiento.mjs';
import {cargarPlantillaAdaptativa} from './plantilla.mjs';

const [grupo = 'vinchos', id = 'modulo-08'] = process.argv.slice(2);
const BASE = join(PLANOS, 'estructuras');
const par = paresDelManifiesto(BASE, JSON.parse(readFileSync(join(BASE, 'pares.json'), 'utf8')), existsSync).find((p) => p.grupo === grupo && p.id === id);
if (!par) { console.error(`No está ${grupo}/${id} en pares.json`); process.exit(1); }

const {AcDbLibreDwgMainThreadConverter} = await import('@mlightcad/libredwg-converter/node');
dm.AcDbDatabaseConverterManager.instance.register(dm.AcDbFileType.DWG, new AcDbLibreDwgMainThreadConverter());
instalarRecorteXclip({AcDbLibreDwgConverter: (await import('@mlightcad/libredwg-converter')).AcDbLibreDwgConverter, AcDbBlockReference: dm.AcDbBlockReference});
const leer = async (archivo, tipo) => { const db = new dm.AcDbDatabase(); const b = readFileSync(archivo); await db.read(b.buffer.slice(b.byteOffset, b.byteOffset + b.byteLength), {readOnly: true}, tipo); return db; };
const plantilla = await cargarPlantillaAdaptativa();
const db = await leer(par.rutaArquitectura, dm.AcDbFileType.DWG);
let datos = {};
const ctx = createDrawingContext({getDatabase: () => db, dm, loadTemplate: async () => plantilla, getProjectData: () => datos, afterDraw: () => {}});
ctx.datosProyecto = () => datos;
ctx.guardarDatosProyecto = (d) => { datos = {...datos, ...d}; };
ctx.registrarAprendizaje = async () => ({ok: true});

const skill = SKILLS.find((s) => s.name === 'construir_estructura');
let r = await skill.run({accion: 'iniciar'}, ctx);
for (let paso = 0; paso < 12; paso++) {
  console.log(`\n${r.ok === false ? `ERROR: ${r.error}` : r.mensaje}`);
  if (!r.opciones?.length || r.opciones[0].herramienta !== 'construir_estructura') break;
  const o = r.opciones.find((x) => x.recomendada) ?? r.opciones[0];
  console.log(`  [botones: ${r.opciones.map((x) => x.texto).join(' | ')}] → clic en "${o.texto}"`);
  r = await skill.run(o.args, ctx);
}
console.log(`\nDatos del proyecto guardados: ${JSON.stringify(datos)}`);
process.exit(0);
