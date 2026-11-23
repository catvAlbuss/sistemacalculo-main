// Semejanza de los PÓRTICOS del agente con los del ingeniero (biblioteca de detalles), sin IA.
//
//   node scripts/agente/evaluar-porticos.mjs [--grupo=<g>] [modulo-NN ...] [--json=<ruta>] [--png=<carpeta>]
//        [--biblioteca [--excluir=proyecto|modulo]] [--volcar=<carpeta>]
//
// Para cada módulo: corre el agente (plano_estructuras) y toma sus pórticos en coordenadas locales
// (x desde la primera columna, y desde ±0.00); los empareja por nombre de eje con los pórticos del
// ingeniero extraídos por extraer-biblioteca.mjs (también en metros locales) y mide la superposición
// a 10 cm (precisión, exhaustividad, F1), como evaluar-dibujo.mjs. Se prueba el pórtico tal cual y
// espejado (el ingeniero puede mirarlo desde el otro lado) con un pequeño ajuste de origen.
// El pórtico del ingeniero se baja a su ±0.00 (NPN): en algunos módulos rotula el NPN con la
// cota del proyecto (+3.20) y el agente siempre dibuja el NPN en 0.
//
// --biblioteca: el agente adapta sus pórticos desde la biblioteca de detalles
// (planos/porticoBiblioteca.js) y se mide con y sin ella (el dibujo del generador sigue en
// porticosLocales). --excluir=proyecto (por defecto) no deja usar piezas del mismo proyecto que
// se evalúa (la medida honesta de generalización); --excluir=modulo solo las del mismo módulo.
import {readFileSync, writeFileSync, existsSync, readdirSync} from 'node:fs';
import {join} from 'node:path';
import * as dm from '@mlightcad/data-model';
import {createDrawingContext} from '../../resources/js/ingenieria/cad/drawingContext.js';
import {SKILLS} from '../../resources/js/ingenieria/agente/skills/index.js';
import {instalarRecorteXclip} from '../../resources/js/etabs/visor/recorteXclip.js';
import {PLANOS} from './planos.mjs';
import {paresDelManifiesto} from './pares-entrenamiento.mjs';
import {cargarPlantillaAdaptativa} from './plantilla.mjs';

const args = process.argv.slice(2);
const filtro = args.filter((a) => /^modulo-/.test(a));
const grupo = args.find((a) => a.startsWith('--grupo='))?.slice(8);
const salidaJson = args.find((a) => a.startsWith('--json='))?.slice(7);
const conBiblioteca = args.includes('--biblioteca');
const excluirModo = args.find((a) => a.startsWith('--excluir='))?.slice(10) ?? 'proyecto';
if (!['proyecto', 'modulo'].includes(excluirModo)) { console.error('--excluir=proyecto|modulo'); process.exit(1); }
const BASE = join(PLANOS, 'estructuras');
const BIB = join(PLANOS, 'biblioteca', 'portico');
const TOL = 0.10, PASO = 0.05;
const SIN_DIBUJO = /texto|text|cota|acot|dim|eje|axis|titul|rotulo|lamina|cuadro|niveles?$/i;

const pares = paresDelManifiesto(BASE, JSON.parse(readFileSync(join(BASE, 'pares.json'), 'utf8')), existsSync)
  .filter((p) => (!filtro.length || filtro.includes(p.id)) && (!grupo || p.grupo === grupo));
if (!existsSync(BIB)) { console.error('Falta la biblioteca: node scripts/agente/extraer-biblioteca.mjs'); process.exit(1); }
const archivosBib = readdirSync(BIB).filter((f) => f.endsWith('.json'));
const leerPieza = (f) => ({...JSON.parse(readFileSync(join(BIB, f), 'utf8')), archivo: f});
// Con --biblioteca, todas las piezas en memoria (el agente elige entre ellas).
const todas = conBiblioteca ? archivosBib.map(leerPieza) : null;

const {AcDbLibreDwgMainThreadConverter} = await import('@mlightcad/libredwg-converter/node');
dm.AcDbDatabaseConverterManager.instance.register(dm.AcDbFileType.DWG, new AcDbLibreDwgMainThreadConverter());
instalarRecorteXclip({AcDbLibreDwgConverter: (await import('@mlightcad/libredwg-converter')).AcDbLibreDwgConverter, AcDbBlockReference: dm.AcDbBlockReference});
const leer = async (archivo, tipo) => { const db = new dm.AcDbDatabase(); const b = readFileSync(archivo); await db.read(b.buffer.slice(b.byteOffset, b.byteOffset + b.byteLength), {readOnly: true}, tipo); return db; };
const plantilla = await cargarPlantillaAdaptativa();

// Nombre del eje de un título: "PLANO DE PÓRTICO EJE 5 - 5" → "5"; "EJE C-C" → "C"; "05" = "5".
const ejeDeTitulo = (t) => {
  const m = /EJE\s+([A-Z0-9]{1,3}\s*[´'`’"]{0,2})\s*-/i.exec(String(t ?? '').normalize('NFD').replace(/[̀-ͯ]/g, ''));
  return m ? m[1].replace(/\s+/g, '').replace(/["]/g, '´´').replace(/[`’']/g, '´').replace(/^0+(?=\d)/, '').toUpperCase() : null;
};

// Todos los ejes de un título: "PORTICO EJE S-S y U'-U'" → ["S", "U´"].
const ejesDeTitulo = (t) => {
  const limpio = String(t ?? '').normalize('NFD').replace(/[̀-ͯ]/g, '').toUpperCase();
  const tras = limpio.split(/\bEJES?\b/)[1] ?? '';
  return [...tras.matchAll(/([A-Z0-9]{1,3}\s*[´'`’"]{0,2})\s*-\s*\1?/g)]
    .map((m) => m[1].replace(/\s+/g, '').replace(/["]/g, '´´').replace(/[`’']/g, '´').replace(/^0+(?=\d)/, ''));
};

// Muestras cada 5 cm de líneas y polilíneas (sin textos, cotas ni ejes).
function muestrear(segmentos) {
  const out = [];
  for (const [a, b] of segmentos) {
    const l = Math.hypot(b.x - a.x, b.y - a.y), n = Math.max(1, Math.ceil(l / PASO));
    if (l > 80) continue;
    for (let i = 0; i <= n; i++) out.push({x: a.x + ((b.x - a.x) * i) / n, y: a.y + ((b.y - a.y) * i) / n});
  }
  return out;
}
const P = (p) => (Array.isArray(p) ? {x: p[0], y: p[1]} : p);
function segmentosAgente(primitivas) {
  const s = [];
  for (const pr of primitivas) {
    if (SIN_DIBUJO.test(pr.layer ?? '')) continue;
    if (pr.type === 'line') s.push([P(pr.a), P(pr.b)]);
    else if (pr.type === 'pline' && pr.points?.length >= 2) {
      const pts = pr.points.map(P);
      for (let i = 1; i < pts.length; i++) s.push([pts[i - 1], pts[i]]);
      if (pr.closed && pts.length > 2) s.push([pts.at(-1), pts[0]]);
    }
  }
  return s;
}
function segmentosIngeniero(pieza) {
  const s = [];
  const npn = (pieza.niveles ?? []).find((n) => n.sigla === 'NPN')?.y ?? 0;
  const B = (q) => ({x: q.x, y: q.y - npn});
  for (const e of pieza.entidades ?? []) {
    if ((e.tipo !== 'linea' && e.tipo !== 'poli') || SIN_DIBUJO.test(e.capa ?? '') || (e.puntos?.length ?? 0) < 2) continue;
    for (let i = 1; i < e.puntos.length; i++) s.push([B(e.puntos[i - 1]), B(e.puntos[i])]);
    if (e.cerrada && e.puntos.length > 2) s.push([B(e.puntos.at(-1)), B(e.puntos[0])]);
  }
  return s;
}
function rejilla(puntos) {
  const g = new Map();
  for (const p of puntos) { const k = `${Math.floor(p.x / TOL)},${Math.floor(p.y / TOL)}`; if (!g.has(k)) g.set(k, []); g.get(k).push(p); }
  return g;
}
function cubiertos(desde, g, dx = 0, dy = 0) {
  if (!desde.length) return 0;
  let n = 0;
  for (const p0 of desde) {
    const p = {x: p0.x + dx, y: p0.y + dy};
    const cx = Math.floor(p.x / TOL), cy = Math.floor(p.y / TOL);
    let ok = false;
    for (let a = -1; a <= 1 && !ok; a++) for (let b = -1; b <= 1 && !ok; b++) ok = (g.get(`${cx + a},${cy + b}`) ?? []).some((q) => Math.hypot(q.x - p.x, q.y - p.y) <= TOL);
    if (ok) n++;
  }
  return n / desde.length;
}
// Mejor coincidencia: tal cual o espejado (x → L − x), con ajuste de origen de ±0.5 m en x y
// ±0.3 m en y (las convenciones de origen difieren: columna vs. burbuja; NPN vs. NPT).
function comparar(ag, ing, luzIng) {
  const gIng = rejilla(ing);
  const muestra = (xs) => xs.filter((_, i) => i % 7 === 0);
  let mejor = null;
  for (const espejo of [false, true]) {
    const a = espejo ? ag.map((p) => ({x: luzIng - p.x, y: p.y})) : ag;
    const aSub = muestra(a);
    for (let dx = -0.5; dx <= 0.5001; dx += 0.05) for (let dy = -0.3; dy <= 0.3001; dy += 0.05) {
      const prec = cubiertos(aSub, gIng, dx, dy);
      if (!mejor || prec > mejor.prec) mejor = {espejo, dx, dy, prec};
    }
  }
  const a = (mejor.espejo ? ag.map((p) => ({x: luzIng - p.x, y: p.y})) : ag).map((p) => ({x: p.x + mejor.dx, y: p.y + mejor.dy}));
  const prec = cubiertos(a, gIng), exh = cubiertos(ing, rejilla(a));
  return {prec, exh, f1: prec + exh ? (2 * prec * exh) / (prec + exh) : 0, espejo: mejor.espejo, alineado: a};
}

const filas = [];
for (const par of pares) {
  const piezas = conBiblioteca ? todas.filter((p) => p.archivo.startsWith(`${par.grupo}-${par.id}-`)) : archivosBib.filter((f) => f.startsWith(`${par.grupo}-${par.id}-`)).map(leerPieza);
  if (!piezas.length) { console.log(`${par.grupo}/${par.id}: el ingeniero no tiene pórticos en la biblioteca`); continue; }
  const db = await leer(par.rutaArquitectura, dm.AcDbFileType.DWG);
  const ctx = createDrawingContext({getDatabase: () => db, dm, loadTemplate: async () => plantilla, getProjectData: () => ({}), afterDraw: () => {}});
  if (conBiblioteca) {
    const excluir = {proyecto: piezas[0].proyecto, ...(excluirModo === 'modulo' ? {modulo: piezas[0].modulo} : {})};
    ctx.bibliotecaPorticos = {piezas: todas, excluir};
  }
  const r = await SKILLS.find((s) => s.name === 'plano_estructuras').run({}, ctx).catch((e) => ({ok: false, error: e.message}));
  if (!r.ok) { console.log(`${par.grupo}/${par.id}: el agente falló (${r.error})`); continue; }
  const delAgente = (ctx.memoria.porticosLocales ?? []).map((p) => ({...p, nombre: ejeDeTitulo(p.titulo) ?? String(p.eje ?? '').toUpperCase()}));
  // --volcar=<carpeta>: los pórticos del agente (primitivas locales) para verlos aparte.
  const volcar = args.find((x) => x.startsWith('--volcar='))?.slice(9);
  if (volcar) writeFileSync(join(volcar, `porticos-${par.grupo}-${par.id}.json`), JSON.stringify(delAgente));
  const resultados = [];
  for (const pieza of piezas) {
    // Todos los ejes del título; primero exacto, luego sin primas (el ingeniero escribe "31"
    // donde la arquitectura dice "31´").
    const nombres = ejesDeTitulo(pieza.titulo);
    const nombre = nombres.join('/') || null;
    const sinPrima = (n) => String(n ?? '').replace(/´/g, '');
    const ag = delAgente.find((p) => nombres.includes(p.nombre)) ?? delAgente.find((p) => nombres.map(sinPrima).includes(sinPrima(p.nombre)));
    if (!ag) { resultados.push({eje: nombre, estado: 'el agente no dibujó ese pórtico'}); continue; }
    const ing = muestrear(segmentosIngeniero(pieza)), agm = muestrear(segmentosAgente(ag.primitivas));
    const {alineado, ...c} = comparar(agm, ing, pieza.parametros?.luzTotal ?? 0);
    // Sin biblioteca: el dibujo del generador (si el pórtico salió de la biblioteca) o el mismo.
    const sin = ag.generador ? (({alineado: _, ...x}) => x)(comparar(muestrear(segmentosAgente(ag.generador)), ing, pieza.parametros?.luzTotal ?? 0)) : c;
    resultados.push({eje: nombre, ...c, sin: {f1: sin.f1, prec: sin.prec, exh: sin.exh}, pieza: ag.biblioteca?.pieza ?? null, puntaje: ag.biblioteca?.puntaje ?? null, dudas: (pieza.dudas ?? []).length});
    // --png=<carpeta>: superposición (azul ingeniero, rojo agente) para verla a ojo.
    const png = args.find((x) => x.startsWith('--png='))?.slice(6);
    if (png) {
      let x0 = Infinity, x1 = -Infinity, y0 = Infinity, y1 = -Infinity;
      for (const q of [...ing, ...alineado]) { x0 = Math.min(x0, q.x); x1 = Math.max(x1, q.x); y0 = Math.min(y0, q.y); y1 = Math.max(y1, q.y); }
      const W = 1200, f = W / (x1 - x0 + 1), H = Math.ceil((y1 - y0 + 1) * f);
      const pt = (q, col) => `<circle cx="${((q.x - x0 + 0.5) * f).toFixed(1)}" cy="${((y1 - q.y + 0.5) * f).toFixed(1)}" r="0.8" fill="${col}"/>`;
      writeFileSync(join(png, `portico-${par.grupo}-${par.id}-${String(nombre).replace(/[^A-Z0-9]/gi, '_')}.svg`), `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}"><rect width="100%" height="100%" fill="#fff"/>${ing.map((q) => pt(q, '#1f6feb')).join('')}${alineado.map((q) => pt(q, '#e5534b')).join('')}</svg>`);
    }
  }
  const medidos = resultados.filter((x) => x.f1 !== undefined);
  const prom = (xs) => (xs.length ? Math.round((xs.reduce((s, x) => s + x, 0) / xs.length) * 100) : null);
  filas.push({grupo: par.grupo, id: par.id, porticos: resultados, f1: prom(medidos.map((x) => x.f1)), f1Sin: prom(medidos.map((x) => x.sin.f1)), cobertura: `${medidos.length}/${resultados.length}`});
  const deBib = delAgente.filter((p) => p.biblioteca);
  const conSin = conBiblioteca ? ` (sin biblioteca ${prom(medidos.map((x) => x.sin.f1)) ?? '—'} %; ${deBib.length} de ${delAgente.length} adaptados: ${deBib.map((p) => `${p.nombre}←${p.biblioteca.pieza.replace(/\.json$/, '')}`).join(', ') || 'ninguno'})` : '';
  console.log(`${par.grupo}/${par.id}: pórticos ${prom(medidos.map((x) => x.f1)) ?? '—'} %${conSin} (${medidos.length} de ${resultados.length} del ingeniero con par del agente; ${delAgente.length} dibujados por el agente) · ${medidos.map((x) => `${x.eje} ${Math.round(x.f1 * 100)}%${conBiblioteca && x.pieza ? ` (antes ${Math.round(x.sin.f1 * 100)}%)` : ''}`).join(', ')}`);
}
const todos = filas.flatMap((f) => f.porticos.filter((x) => x.f1 !== undefined));
const prom = (xs) => (xs.length ? Math.round((xs.reduce((s, x) => s + x, 0) / xs.length) * 100) : null);
const porProyecto = Object.fromEntries([...new Set(filas.map((f) => f.grupo))].map((g) => {
  const xs = filas.filter((f) => f.grupo === g).flatMap((f) => f.porticos.filter((x) => x.f1 !== undefined));
  const total = filas.filter((f) => f.grupo === g).flatMap((f) => f.porticos).length;
  return [g, {f1: prom(xs.map((x) => x.f1)), f1Sin: prom(xs.map((x) => x.sin.f1)), precision: prom(xs.map((x) => x.prec)), exhaustividad: prom(xs.map((x) => x.exh)), emparejados: xs.length, adaptados: xs.filter((x) => x.pieza).length, delIngeniero: total}];
}));
const modo = conBiblioteca ? ` con biblioteca (excluye el ${excluirModo === 'modulo' ? 'módulo' : 'proyecto'} evaluado; sin biblioteca ${prom(todos.map((x) => x.sin.f1))} %)` : '';
console.log(`\nSEMEJANZA DE PÓRTICOS: ${prom(todos.map((x) => x.f1))} %${modo} (precisión ${prom(todos.map((x) => x.prec))} %, exhaustividad ${prom(todos.map((x) => x.exh))} %; ${todos.length} pórticos emparejados de ${filas.flatMap((f) => f.porticos).length} del ingeniero${conBiblioteca ? `; ${todos.filter((x) => x.pieza).length} adaptados de la biblioteca` : ''})`);
for (const [g, v] of Object.entries(porProyecto)) console.log(`  ${g}: ${v.f1} %${conBiblioteca ? ` (sin biblioteca ${v.f1Sin} %; ${v.adaptados} adaptados)` : ''} (${v.emparejados}/${v.delIngeniero} emparejados)`);
if (salidaJson) writeFileSync(salidaJson, JSON.stringify({fecha: new Date().toISOString(), biblioteca: conBiblioteca ? {excluir: excluirModo} : null, f1: prom(todos.map((x) => x.f1)), f1Sin: prom(todos.map((x) => x.sin.f1)), porProyecto, filas}, null, 1));
process.exit(0);
