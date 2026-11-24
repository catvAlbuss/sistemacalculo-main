// Prueba del flujo de NovaCad con TODOS los planos disponibles, sin IA y sin navegador:
// arquitectura → plano_estructuras (láminas) → revisar_laminas (encimados) → metrar_estructura
// (+ Excel). Es el mismo camino que sigue el panel; lo que falle aquí fallaría frente al cliente.
//
//   node scripts/agente/probar-flujo-completo.mjs [filtro] [--salida=<carpeta para los .xlsx>]
//
// Planos: las arquitecturas del manifiesto (entrenamiento y hold-out) y las de casas3d/.
// Datos del proyecto: los típicos de un expediente (no abre formularios: sin panel).
import {readFileSync, writeFileSync, mkdirSync, existsSync, readdirSync} from 'node:fs';
import {join, basename} from 'node:path';
import * as dm from '@mlightcad/data-model';
import {createDrawingContext} from '../../resources/js/ingenieria/cad/drawingContext.js';
import {SKILLS} from '../../resources/js/ingenieria/agente/skills/index.js';
import {instalarRecorteXclip} from '../../resources/js/etabs/visor/recorteXclip.js';
import {PLANOS} from './planos.mjs';
import {paresDelManifiesto} from './pares-entrenamiento.mjs';
import {cargarPlantillaAdaptativa} from './plantilla.mjs';

const args = process.argv.slice(2);
const filtro = args.find((a) => !a.startsWith('--'));
const salida = args.find((a) => a.startsWith('--salida='))?.slice(9);
if (salida) mkdirSync(salida, {recursive: true});

const BASE = join(PLANOS, 'estructuras');
const pares = paresDelManifiesto(BASE, JSON.parse(readFileSync(join(BASE, 'pares.json'), 'utf8')), existsSync);
const planos = [
  ...pares.map((p) => ({nombre: `${p.grupo}/${p.id}`, ruta: p.rutaArquitectura})),
  ...(existsSync(join(PLANOS, 'casas3d')) ? readdirSync(join(PLANOS, 'casas3d')).filter((f) => /\.dwg$/i.test(f)).map((f) => ({nombre: `casa/${basename(f, '.dwg')}`, ruta: join(PLANOS, 'casas3d', f)})) : []),
].filter((p) => !filtro || p.nombre.includes(filtro));

const {AcDbLibreDwgMainThreadConverter} = await import('@mlightcad/libredwg-converter/node');
dm.AcDbDatabaseConverterManager.instance.register(dm.AcDbFileType.DWG, new AcDbLibreDwgMainThreadConverter());
instalarRecorteXclip({AcDbLibreDwgConverter: (await import('@mlightcad/libredwg-converter')).AcDbLibreDwgConverter, AcDbBlockReference: dm.AcDbBlockReference});
const leer = async (archivo) => { const db = new dm.AcDbDatabase(); const b = readFileSync(archivo); await db.read(b.buffer.slice(b.byteOffset, b.byteOffset + b.byteLength), {readOnly: true}, dm.AcDbFileType.DWG); return db; };
const plantilla = await cargarPlantillaAdaptativa();
const skill = (n) => SKILLS.find((s) => s.name === n);
const DATOS = {hz: '0.60', df: '2.00', zona: '3', suelo: 'S2', categoria: 'A2', normaE030: '2018'};

const filas = [];
for (const p of planos) {
  const t0 = Date.now();
  const fila = {plano: p.nombre, ok: false, laminas: 0, encimados: null, partidas: 0, raras: [], excel: false, error: null, avisos: 0};
  try {
    const db = await leer(p.ruta);
    const ctx = createDrawingContext({getDatabase: () => db, dm, loadTemplate: async () => plantilla, getProjectData: () => ({...DATOS}), setProjectData: () => {}, afterDraw: () => {}});
    ctx.memoria ??= {};
    const r = await skill('plano_estructuras').run({}, ctx);
    if (!r.ok) { fila.error = `láminas: ${r.error ?? 'sin detalle'}`; filas.push({...fila, s: (Date.now() - t0) / 1000}); console.log(linea(filas.at(-1))); continue; }
    fila.laminas = r.laminas?.length ?? 0;
    fila.avisos = r.avisos?.length ?? 0;
    const rev = await skill('revisar_laminas').run({}, ctx);
    fila.encimados = rev.encimados ?? null;
    // Lo que haría el cliente con "ordena la lámina": cuántos rótulos mueve y cuántos pares quedan.
    const ord = await skill('ordenar_lamina').run({}, ctx);
    fila.ordenar = {movidos: ord.movidos ?? 0, achicados: ord.achicados ?? 0, quedan: ord.encimados ?? 0};
    let archivo = null;
    ctx.descargarPlanilla = async (met, nombre, op) => { const {descargarPlanilla} = await import('../../resources/js/ingenieria/metrado/planillaExcel.js'); const buf = await descargarPlanilla(met, nombre, op); if (salida) { archivo = join(salida, `${p.nombre.replace(/[\\/]/g, '_')}.xlsx`); writeFileSync(archivo, Buffer.from(buf)); } fila.excel = buf?.byteLength > 1000; return buf; };
    const m = await skill('metrar_estructura').run({excel: true}, ctx);
    if (!m.ok) { fila.error = `metrado: ${m.error ?? 'sin detalle'}`; }
    else {
      const partidas = (ctx.memoria.metrado?.partidas ?? []).filter((x) => !x.titulo);
      fila.partidas = partidas.length;
      fila.raras = partidas.filter((x) => !Number.isFinite(x.total) || x.total < 0 || (x.total === 0 && !/opcional/i.test(x.descripcion ?? ''))).map((x) => `${x.item} ${String(x.descripcion).slice(0, 30)}=${x.total}`);
      fila.ok = fila.laminas > 0 && fila.partidas > 0 && fila.excel;
    }
  } catch (e) {
    fila.error = `excepción: ${e?.message ?? e}`.slice(0, 200);
  }
  filas.push({...fila, s: Math.round((Date.now() - t0) / 100) / 10});
  console.log(linea(filas.at(-1)));
}

function linea(f) {
  return `${f.ok ? 'OK ' : 'MAL'} ${f.plano.padEnd(24)} láminas ${String(f.laminas).padStart(2)} · encimados ${f.encimados ?? '—'}${f.ordenar ? ` (ordenar: mueve ${f.ordenar.movidos}, quedan ${f.ordenar.quedan})` : ''} · partidas ${String(f.partidas).padStart(3)}${f.raras.length ? ` (${f.raras.length} en cero/raras)` : ''} · excel ${f.excel ? 'sí' : 'no'} · ${f.s}s${f.error ? ` · ${f.error}` : ''}`;
}
const bien = filas.filter((f) => f.ok).length;
console.log(`\n${bien}/${filas.length} planos completaron arquitectura → láminas → metrado → Excel.`);
for (const f of filas.filter((x) => x.raras.length)) console.log(`  ${f.plano}: ${f.raras.slice(0, 6).join(' | ')}`);
if (salida) writeFileSync(join(salida, 'resumen.json'), JSON.stringify(filas, null, 1));
process.exit(0);
