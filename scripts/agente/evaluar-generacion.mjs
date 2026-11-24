// Benchmark de generación con los 15 pares: corre plano_estructuras (la misma herramienta del
// chat) sobre cada arquitectura y compara lo generado con el plano del ingeniero:
//   - columnas leídas (F1 por cruce), pórticos (ejes con pórtico), cimentación, losa maciza,
//     vacío de escalera, niveles; y que la herramienta no falle.
//
//   node scripts/agente/volcar-planos.mjs        # caché (una vez)
//   node scripts/agente/evaluar-generacion.mjs [modulo-01 …] [--svg carpeta]
//
// Escribe un informe JSON en storage/app/private/entrenamiento/evaluaciones/ (privado).
import {readFileSync, writeFileSync, mkdirSync} from 'node:fs';
import {join} from 'node:path';
import * as dm from '@mlightcad/data-model';
import {createDrawingContext} from '../../resources/js/ingenieria/cad/drawingContext.js';
import {SKILLS} from '../../resources/js/ingenieria/agente/skills/index.js';
import {instalarRecorteXclip} from '../../resources/js/etabs/visor/recorteXclip.js';
import {decisionesDeEstructura, nivelesDePlantasDeLosa} from '../../resources/js/ingenieria/aprendizaje/casos.js';
import {textoPlano} from '../../resources/js/ingenieria/lectura/lectorPlano.js';
import {PLANOS} from './planos.mjs';
import {leerCache} from './volcar-planos.mjs';
import {paresDelManifiesto} from './pares-entrenamiento.mjs';
import {existsSync} from 'node:fs';
import {CASOS} from '../../resources/js/ingenieria/aprendizaje/casosAprendidos.js';
import {compararPar} from './evaluar-lectura.mjs';
import {cargarPlantillaAdaptativa} from './plantilla.mjs';

const args = process.argv.slice(2);
const filtro = args.filter((a) => /^modulo-/.test(a));
const grupoFiltro = args.find((a) => a.startsWith('--grupo='))?.slice(8);
// Honesto: el módulo evaluado no está entre los casos que el agente consulta (--con-propio para
// medir como antes). Con --fuera-proyecto queda fuera todo su proyecto (generalización real).
const conPropio = args.includes('--con-propio'), fueraProyecto = args.includes('--fuera-proyecto');
const TODOS_LOS_CASOS = [...CASOS];
const casosSin = (par) => TODOS_LOS_CASOS.filter((c) => (fueraProyecto ? c.grupo !== par.grupo : !(c.grupo === par.grupo && c.id === par.id)));
const BASE = join(PLANOS, 'estructuras');
const pares = paresDelManifiesto(BASE, JSON.parse(readFileSync(join(BASE, 'pares.json'), 'utf8')), existsSync)
  .filter((p) => !grupoFiltro || p.grupo === grupoFiltro)
  .filter((p) => !filtro.length || filtro.includes(p.id));

const {AcDbLibreDwgMainThreadConverter} = await import('@mlightcad/libredwg-converter/node');
dm.AcDbDatabaseConverterManager.instance.register(dm.AcDbFileType.DWG, new AcDbLibreDwgMainThreadConverter());
instalarRecorteXclip({AcDbLibreDwgConverter: (await import('@mlightcad/libredwg-converter')).AcDbLibreDwgConverter, AcDbBlockReference: dm.AcDbBlockReference});
const leer = async (archivo, tipo) => {
  const db = new dm.AcDbDatabase();
  const b = readFileSync(archivo);
  await db.read(b.buffer.slice(b.byteOffset, b.byteOffset + b.byteLength), {readOnly: true}, tipo);
  return db;
};
const plantilla = await cargarPlantillaAdaptativa();

const nombreEje = (n) => String(n).replace(/[´'`’]/g, '´').toUpperCase().replace(/´/g, '');
const f1 = (a, b) => {
  const A = new Set(a.map(nombreEje)), B = new Set(b.map(nombreEje));
  const tp = [...A].filter((x) => B.has(x)).length;
  const p = A.size ? tp / A.size : (B.size ? 0 : 1), r = B.size ? tp / B.size : 1;
  return p + r ? (2 * p * r) / (p + r) : 0;
};

// Lo que dibujó el ingeniero, de los textos de su plano.
function referencia(items) {
  const textos = items.filter((it) => it.tipo === 'texto' && it.texto).map((it) => textoPlano(it.texto).toUpperCase());
  const d = decisionesDeEstructura(textos);
  const porticos = new Set();
  for (const t of textos) {
    const m = t.match(/P[OÓ]RTICO\s+(?:EJE\s+)?([A-Z0-9]{1,3}\s*[´'`’]*)\s*-\s*\1/);
    if (m) porticos.add(m[1].replace(/\s+/g, ''));
  }
  // Niveles con plano de tabiquería ("TABIQUERIA 2° Y 3° PISO" → 2, 3).
  const titulos = [...new Set(textos.filter((t) => /PLANO/.test(t) && t.length < 90))];
  const tabiqueria = new Set();
  for (const t of titulos.filter((x) => /TABIQUER/.test(x))) {
    const nums = [...t.matchAll(/(\d)\s*[°º]/g)].map((m) => Number(m[1]));
    if (/(\d)\s*[°º]\s*-\s*(\d)\s*[°º]/.test(t)) for (let n = nums[0]; n <= nums[1]; n++) tabiqueria.add(n); else nums.forEach((n) => tabiqueria.add(n));
  }
  return {
    plantasLosa: nivelesDePlantasDeLosa(titulos), tabiqueria: [...tabiqueria].sort(),
    cimentacion: d.cimentacion, maciza: /LOSA\s+MACIZA/.test(textos.join('|')) && /maciza/.test(d.losa ?? ''),
    escalera: textos.some((t) => /^ESCALERA$|ESCALERA\s+TRAMO|DETALLE\s+ESCALERA/.test(t)),
    porticos: [...porticos],
  };
}

const filas = [];
for (const par of pares) {
  CASOS.length = 0;
  CASOS.push(...(conPropio ? TODOS_LOS_CASOS : casosSin(par)));
  const ca = leerCache(par.rutaArquitectura), ce = leerCache(par.rutaEstructura);
  if (!ca || !ce) { console.log(`${par.id}: sin caché`); continue; }
  const lect = compararPar(ca.items, ce.items) ?? {f1: 0, arq: 0, est: 0, tp: 0, misma: 0, faltan: [], sobran: [], distintas: [], nombresMal: []};
  const ref = referencia(ce.items);
  let r, error = null;
  const t0 = Date.now();
  try {
    const db = await leer(par.rutaArquitectura, dm.AcDbFileType.DWG);
    let laminas = null;
    const ctx = createDrawingContext({getDatabase: () => db, dm, loadTemplate: async () => plantilla, getProjectData: () => ({}), afterDraw: () => {}});
    // El resumen de lo dibujado (laminasConPlantilla) se toma del modelo que queda en memoria.
    r = await SKILLS.find((s) => s.name === 'plano_estructuras').run({}, ctx);
    laminas = ctx.memoria?.modeloEstructural ?? null;
    r.modelo = laminas;
  } catch (e) { error = e.message; }
  const ms = Date.now() - t0;
  const m = r?.modelo;
  const gen = m ? {
    porticos: [...new Set([...(m.vsa ?? []), ...(m.dinteles ?? [])].map((x) => x.eje))],
    maciza: (m.losa?.maciza ?? 0) > 0, escalera: (m.losa?.vacios ?? 0) > 0, cimentacion: m.cimentacion?.tipo, niveles: m.niveles, losaTecho: m.losaTecho,
    tabiqueria: [...new Set((m.planos ?? []).filter((t) => /TABIQUER/.test(t)).flatMap((t) => { const nums = [...t.matchAll(/(\d)\s*°/g)].map((x) => Number(x[1])); return /(\d)°-(\d)°/.test(t) ? Array.from({length: nums[1] - nums[0] + 1}, (_, i) => nums[0] + i) : nums; }))].sort(),
  } : null;
  const porticosAgente = (r?.mensaje?.match(/pórticos de los ejes ([^(]+)\(/)?.[1] ?? '').split(/,| y /).map((s) => s.trim()).filter(Boolean);
  const fila = {
    id: par.id, ok: Boolean(r?.ok), error, ms,
    columnasF1: lect.f1, seccion: lect.est ? lect.misma / lect.est : 0,
    porticosF1: ref.porticos.length ? f1(porticosAgente, ref.porticos) : null,
    cimentacion: gen ? gen.cimentacion === ref.cimentacion : false,
    maciza: gen ? gen.maciza === ref.maciza : false,
    escalera: gen ? gen.escalera === ref.escalera : false,
    // Losa en el último nivel: el ingeniero la dibuja si sus plantas de losa cubren todos los niveles.
    losaTecho: gen ? gen.losaTecho === (ref.plantasLosa >= (gen.niveles ?? 1)) : false,
    tabiqueria: ref.tabiqueria.filter((n) => n >= 2).length ? (gen ? f1(gen.tabiqueria.map(String), ref.tabiqueria.filter((n) => n >= 2).map(String)) : 0) : null,
    detalle: {ref, agente: {...gen, porticos: porticosAgente}},
  };
  filas.push(fila);
  const p = (v) => (v === null ? '—' : `${Math.round(v * 100)} %`);
  console.log(`${par.id}: ${fila.ok ? 'OK' : `FALLA (${error ?? r?.mensaje})`} ${ms} ms · columnas ${p(fila.columnasF1)} · sección ${p(fila.seccion)} · pórticos ${p(fila.porticosF1)} [ing ${ref.porticos.join(',') || '—'} / agente ${porticosAgente.join(',') || '—'}] · cimentación ${fila.cimentacion ? '✓' : `✗ (ing ${ref.cimentacion}, agente ${gen?.cimentacion})`} · maciza ${fila.maciza ? '✓' : `✗ (ing ${ref.maciza})`} · escalera ${fila.escalera ? '✓' : `✗ (ing ${ref.escalera})`} · losa techo ${fila.losaTecho ? '✓' : `✗ (ing ${ref.plantasLosa} plantas)`} · tabiquería ${p(fila.tabiqueria)} [ing ${ref.tabiqueria.join(',') || '—'} / agente ${gen?.tabiqueria?.join(',') || '—'}]`);
}

// Puntaje por módulo: promedio de los criterios medibles (cada uno 0–1).
const puntaje = (f) => {
  const xs = [f.ok ? 1 : 0, f.columnasF1, f.seccion, f.porticosF1, f.cimentacion ? 1 : 0, f.maciza ? 1 : 0, f.escalera ? 1 : 0, f.losaTecho ? 1 : 0, f.tabiqueria].filter((x) => x !== null);
  return xs.reduce((s, x) => s + x, 0) / xs.length;
};
const total = filas.reduce((s, f) => s + puntaje(f), 0) / (filas.length || 1);
console.log(`
Alcance: ${conPropio ? 'con el propio módulo entre los casos (optimista)' : fueraProyecto ? 'dejando fuera todo el proyecto evaluado' : 'dejando fuera el módulo evaluado'}`);
console.log(`\nPuntaje de semejanza promedio (hasta 9 criterios por módulo): ${(total * 100).toFixed(1)} %`);
for (const f of filas) console.log(`  ${f.id}: ${(puntaje(f) * 100).toFixed(0)} %`);
const carpeta = join(PLANOS, 'evaluaciones');
mkdirSync(carpeta, {recursive: true});
const archivo = join(carpeta, `generacion-${new Date().toISOString().slice(0, 10)}.json`);
writeFileSync(archivo, JSON.stringify({fecha: new Date().toISOString(), alcance: 'Transferencia entre módulos de un mismo proyecto (no prueba generalización a proyectos nuevos).', total, filas}, null, 1));
console.log(`Informe: ${archivo}`);
process.exit(0);
