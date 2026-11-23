// Semejanza de los DETALLES del agente con los del ingeniero (biblioteca de detalles), sin IA:
// cortes de cimiento corrido, escalera y cuadros de columnas y columnetas.
//
//   NODE_OPTIONS=--max-old-space-size=12000 node scripts/agente/evaluar-detalles.mjs
//        [--grupo=<g>] [modulo-NN ...] [--tipo=corte_cimiento|escalera|cuadro_columnas|cuadro_columnetas]
//        [--biblioteca [--excluir=proyecto|modulo]] [--json=<ruta>] [--png=<carpeta>] [--volcar=<carpeta>]
//
// Para cada módulo corre el agente (plano_estructuras) y toma sus detalles en coordenadas locales
// (laminasPlantilla.js → detallesLocales): la escalera y los cuadros del generador; los cortes de
// cimiento son los de la plantilla del despacho (se extraen de la plantilla con el mismo extractor
// que la biblioteca). Cada detalle del ingeniero del mismo módulo se compara con el detalle del
// agente del mismo tipo que mejor se le parece, a 10 cm (precisión, exhaustividad, F1), con un
// ajuste de origen (y espejo en la escalera, que el ingeniero dibuja subiendo a un lado u otro).
// Cortes y escalera en metros reales; cuadros en unidades de lámina (1 = 1 m a 1/50).
//
// --biblioteca: el agente adapta sus detalles desde la biblioteca (laminas/detalleBiblioteca.js) y
// se mide con y sin ella en la misma corrida. --excluir=proyecto (por defecto) no deja usar
// piezas del proyecto evaluado (generalización honesta); --excluir=modulo, solo las del módulo.
import {readFileSync, writeFileSync, existsSync, readdirSync, mkdirSync} from 'node:fs';
import {join} from 'node:path';
import * as dm from '@mlightcad/data-model';
import {createDrawingContext} from '../../resources/js/ingenieria/cad/drawingContext.js';
import {SKILLS} from '../../resources/js/ingenieria/agente/skills/index.js';
import {instalarRecorteXclip} from '../../resources/js/etabs/visor/recorteXclip.js';
import {aplanarModelo} from '../../resources/js/ingenieria/lectura/lectorPlano.js';
import {entidadesDe} from '../../resources/js/ingenieria/laminas/detalleBiblioteca.js';
import {PLANOS} from './planos.mjs';
import {paresDelManifiesto} from './pares-entrenamiento.mjs';
import {extraerPiezas, codigoDeProyecto} from './extraer-biblioteca.mjs';
import {cargarPlantillaAdaptativa} from './plantilla.mjs';

export const TIPOS_DETALLE = ['corte_cimiento', 'escalera', 'cuadro_columnas', 'cuadro_columnetas'];
const TOL = 0.10, PASO = 0.05;
const SIN_DIBUJO = /texto|text|cota|acot|dim|eje|axis|titul|rotulo|lamina|cuadro|niveles?$/i;

// ---------------------------------------------------------------- medición (exportada para las pruebas)

// Puntos cada 5 cm de líneas, polilíneas y círculos (sin textos). En cortes y escaleras se dejan
// fuera las capas de textos, cotas y niveles; en los cuadros cuenta todo (la rejilla es el cuadro).
export function muestrear(ents, tipo) {
  const filtrar = !/^cuadro/.test(tipo);
  const out = [];
  const tramo = (a, b) => {
    const l = Math.hypot(b.x - a.x, b.y - a.y), n = Math.max(1, Math.ceil(l / PASO));
    if (l > 60) return;
    for (let i = 0; i <= n; i++) out.push({x: a.x + ((b.x - a.x) * i) / n, y: a.y + ((b.y - a.y) * i) / n});
  };
  for (const e of ents) {
    if (e.tipo === 'texto' || (filtrar && SIN_DIBUJO.test(e.capa ?? ''))) continue;
    if (e.tipo === 'circulo') {
      const n = Math.max(8, Math.ceil((2 * Math.PI * e.radio) / PASO));
      for (let i = 0; i < n; i++) out.push({x: e.centro.x + e.radio * Math.cos((2 * Math.PI * i) / n), y: e.centro.y + e.radio * Math.sin((2 * Math.PI * i) / n)});
      continue;
    }
    const ps = e.puntos ?? [];
    for (let i = 1; i < ps.length; i++) tramo(ps[i - 1], ps[i]);
    if (e.cerrada && ps.length > 2) tramo(ps.at(-1), ps[0]);
  }
  return out;
}

const escalar = (ents, k) => (k === 1 ? ents : ents.map((e) => ({...e, ...(e.puntos ? {puntos: e.puntos.map((q) => ({x: q.x * k, y: q.y * k}))} : {}), ...(e.centro ? {centro: {x: e.centro.x * k, y: e.centro.y * k}} : {}), ...(e.radio ? {radio: e.radio * k} : {})})));
export const puntosDePieza = (pieza) => muestrear(escalar(pieza.entidades ?? [], /^cuadro/.test(pieza.tipo) ? pieza.dibujo?.factor ?? 1 : 1), pieza.tipo);
export const puntosDePrimitivas = (prims, tipo) => muestrear(entidadesDe(prims ?? []), tipo);

function rejilla(puntos) {
  const g = new Map();
  for (const p of puntos) { const k = `${Math.floor(p.x / TOL)},${Math.floor(p.y / TOL)}`; if (!g.has(k)) g.set(k, []); g.get(k).push(p); }
  return g;
}
function cubiertos(desde, g, dx = 0, dy = 0) {
  if (!desde.length) return 0;
  let n = 0;
  for (const p0 of desde) {
    const x = p0.x + dx, y = p0.y + dy, cx = Math.floor(x / TOL), cy = Math.floor(y / TOL);
    let ok = false;
    for (let a = -1; a <= 1 && !ok; a++) for (let b = -1; b <= 1 && !ok; b++) ok = (g.get(`${cx + a},${cy + b}`) ?? []).some((q) => Math.hypot(q.x - x, q.y - y) <= TOL);
    if (ok) n++;
  }
  return n / desde.length;
}
const caja = (ps) => ps.reduce((c, p) => ({x0: Math.min(c.x0, p.x), y0: Math.min(c.y0, p.y), x1: Math.max(c.x1, p.x), y1: Math.max(c.y1, p.y)}), {x0: Infinity, y0: Infinity, x1: -Infinity, y1: -Infinity});
const f1 = (p, e) => (p + e ? (2 * p * e) / (p + e) : 0);

// Mejor coincidencia del agente (ag) con el ingeniero (ing): se prueban tres alineaciones de
// partida (esquina inferior izquierda, superior derecha y centro de las cajas), con espejo si se
// pide, y alrededor de cada una un ajuste de ±0.5 m en x y ±0.3 m en y cada 5 cm.
export function comparar(ag, ing, {espejo = false} = {}) {
  if (!ag.length || !ing.length) return {prec: 0, exh: 0, f1: 0, alineado: []};
  const ci = caja(ing);
  const gIng = rejilla(ing);
  const sub = (xs) => xs.filter((_, i) => i % 5 === 0);
  const ingSub = sub(ing);
  let mejor = null;
  for (const esp of espejo ? [false, true] : [false]) {
    const ca0 = caja(ag);
    const a = esp ? ag.map((p) => ({x: ca0.x0 + ca0.x1 - p.x, y: p.y})) : ag;
    const ca = caja(a), gAg = rejilla(a), aSub = sub(a);
    const partidas = [[ci.x0 - ca.x0, ci.y0 - ca.y0], [ci.x1 - ca.x1, ci.y1 - ca.y1], [(ci.x0 + ci.x1 - ca.x0 - ca.x1) / 2, (ci.y0 + ci.y1 - ca.y0 - ca.y1) / 2]];
    for (const [bx, by] of partidas) for (let dx = -0.5; dx <= 0.5001; dx += 0.05) for (let dy = -0.3; dy <= 0.3001; dy += 0.05) {
      const p = cubiertos(aSub, gIng, bx + dx, by + dy), e = cubiertos(ingSub, gAg, -(bx + dx), -(by + dy));
      const s = f1(p, e);
      if (!mejor || s > mejor.s) mejor = {s, esp, x: bx + dx, y: by + dy};
    }
  }
  const ca0 = caja(ag);
  const a = (mejor.esp ? ag.map((p) => ({x: ca0.x0 + ca0.x1 - p.x, y: p.y})) : ag).map((p) => ({x: p.x + mejor.x, y: p.y + mejor.y}));
  const prec = cubiertos(a, gIng), exh = cubiertos(ing, rejilla(a));
  return {prec, exh, f1: f1(prec, exh), espejo: mejor.esp, alineado: a};
}

// Cortes de cimiento de la plantilla del despacho (lo que el agente copia sin biblioteca), con su
// número, origen local y escala dentro de la plantilla (para poner los adaptados en su lugar).
export function cortesDeLaPlantilla(dbPlantilla) {
  const {items} = aplanarModelo(dbPlantilla.tables.blockTable.modelSpace.newIterator().toArray());
  const {piezas} = extraerPiezas(items);
  return piezas.filter((p) => p.tipo === 'corte_cimiento').map((p) => {
    const esc = p.dibujo.unidadesPorMetro, c = p._cajaDibujo;
    const numero = Number(/(\d+)\s*-\s*\d+/.exec(p.titulo)?.[1]);
    return {numero, titulo: p.titulo, pieza: {...p, archivo: `plantilla-${p.titulo}`}, origen: {x: c.x0, y: c.y0 - p.caja.y0 * esc}, escala: esc, zona: {x: c.x0, y: c.y0, x1: c.x1, y1: c.y1}};
  });
}

// ---------------------------------------------------------------- programa

async function main() {
  const args = process.argv.slice(2);
  const filtro = args.filter((a) => /^modulo-/.test(a));
  const grupo = args.find((a) => a.startsWith('--grupo='))?.slice(8);
  const soloTipo = args.find((a) => a.startsWith('--tipo='))?.slice(7);
  const salidaJson = args.find((a) => a.startsWith('--json='))?.slice(7);
  const png = args.find((a) => a.startsWith('--png='))?.slice(6);
  const volcar = args.find((a) => a.startsWith('--volcar='))?.slice(9);
  const conBiblioteca = args.includes('--biblioteca');
  const excluirModo = args.find((a) => a.startsWith('--excluir='))?.slice(10) ?? 'proyecto';
  if (!['proyecto', 'modulo'].includes(excluirModo)) { console.error('--excluir=proyecto|modulo'); process.exit(1); }
  const tipos = soloTipo ? [soloTipo] : TIPOS_DETALLE;
  const BASE = join(PLANOS, 'estructuras'), BIB = join(PLANOS, 'biblioteca');
  if (!existsSync(join(BIB, 'indice.json'))) { console.error('Falta la biblioteca: node scripts/agente/extraer-biblioteca.mjs'); process.exit(1); }
  for (const d of [png, volcar]) if (d) mkdirSync(d, {recursive: true});
  const piezas = TIPOS_DETALLE.flatMap((t) => (existsSync(join(BIB, t)) ? readdirSync(join(BIB, t)).filter((f) => f.endsWith('.json')).map((f) => ({...JSON.parse(readFileSync(join(BIB, t, f), 'utf8')), archivo: f})) : []));
  const pares = paresDelManifiesto(BASE, JSON.parse(readFileSync(join(BASE, 'pares.json'), 'utf8')), existsSync)
    .filter((p) => (!filtro.length || filtro.includes(p.id)) && (!grupo || p.grupo === grupo));

  const {AcDbLibreDwgMainThreadConverter} = await import('@mlightcad/libredwg-converter/node');
  dm.AcDbDatabaseConverterManager.instance.register(dm.AcDbFileType.DWG, new AcDbLibreDwgMainThreadConverter());
  instalarRecorteXclip({AcDbLibreDwgConverter: (await import('@mlightcad/libredwg-converter')).AcDbLibreDwgConverter, AcDbBlockReference: dm.AcDbBlockReference});
  const leer = async (archivo, tipo) => { const db = new dm.AcDbDatabase(); const b = readFileSync(archivo); await db.read(b.buffer.slice(b.byteOffset, b.byteOffset + b.byteLength), {readOnly: true}, tipo); return db; };
  const plantilla = await cargarPlantillaAdaptativa();
  const cortesPlantilla = cortesDeLaPlantilla(plantilla.db);
  const puntosPlantilla = cortesPlantilla.map((c) => ({titulo: c.titulo, numero: c.numero, puntos: puntosDePieza(c.pieza)}));

  const filas = [];
  for (const par of pares) {
    const delIngeniero = piezas.filter((p) => tipos.includes(p.tipo) && p.archivo.startsWith(`${par.grupo}-${par.id}-`));
    if (!delIngeniero.length) { console.log(`${par.grupo}/${par.id}: el ingeniero no tiene esos detalles en la biblioteca`); continue; }
    const db = await leer(par.rutaArquitectura, dm.AcDbFileType.DWG);
    const ctx = createDrawingContext({getDatabase: () => db, dm, loadTemplate: async () => plantilla, getProjectData: () => ({}), afterDraw: () => {}});
    if (conBiblioteca) {
      const excluir = {proyecto: codigoDeProyecto(par.grupo), ...(excluirModo === 'modulo' ? {modulo: par.id} : {})};
      ctx.bibliotecaDetalles = {piezas, excluir, cortesPlantilla: cortesPlantilla.map(({numero, origen, escala, zona}) => ({numero, origen, escala, zona}))};
    }
    const r = await SKILLS.find((s) => s.name === 'plano_estructuras').run({}, ctx).catch((e) => ({ok: false, error: e.message}));
    if (!r.ok) { console.log(`${par.grupo}/${par.id}: el agente falló (${r.error})`); continue; }
    const det = ctx.memoria.detallesLocales ?? [];
    if (volcar) writeFileSync(join(volcar, `detalles-${par.grupo}-${par.id}.json`), JSON.stringify(det));
    // Detalles del agente por tipo, con y sin biblioteca.
    const agente = {};
    for (const t of tipos) {
      if (t === 'corte_cimiento') {
        const adaptados = det.filter((d) => d.tipo === t && d.origen === 'biblioteca');
        agente[t] = {
          sin: puntosPlantilla.map((c) => ({titulo: c.titulo, puntos: c.puntos})),
          con: puntosPlantilla.map((c) => { const a = adaptados.find((d) => d.numero === c.numero); return a ? {titulo: a.titulo, puntos: puntosDePrimitivas(a.primitivas, t), biblioteca: a.biblioteca} : {titulo: c.titulo, puntos: c.puntos}; }),
        };
      } else {
        const ds = det.filter((d) => d.tipo === t);
        agente[t] = {
          sin: ds.map((d) => ({titulo: d.titulo, puntos: puntosDePrimitivas(d.generador ?? d.primitivas, t)})),
          con: ds.map((d) => ({titulo: d.titulo, puntos: puntosDePrimitivas(d.primitivas, t), biblioteca: d.biblioteca})),
        };
      }
    }
    const resultados = [];
    for (const pieza of delIngeniero) {
      const ing = puntosDePieza(pieza);
      const a = agente[pieza.tipo];
      if (!a?.con.length || !ing.length) { resultados.push({tipo: pieza.tipo, pieza: pieza.archivo, titulo: pieza.titulo, estado: 'el agente no dibujó ese detalle'}); continue; }
      const espejo = pieza.tipo === 'escalera';
      const mejorDe = (lista) => lista.map((d) => ({d, ...comparar(d.puntos, ing, {espejo})})).sort((x, y) => y.f1 - x.f1)[0];
      const con = mejorDe(a.con), sin = conBiblioteca ? mejorDe(a.sin) : con;
      resultados.push({tipo: pieza.tipo, pieza: pieza.archivo, titulo: pieza.titulo, f1: con.f1, prec: con.prec, exh: con.exh, con: con.d.titulo, adaptado: con.d.biblioteca?.pieza ?? null,
        sin: {f1: sin.f1, prec: sin.prec, exh: sin.exh, con: sin.d.titulo}});
      if (png) {
        let x0 = Infinity, x1 = -Infinity, y0 = Infinity, y1 = -Infinity;
        for (const q of [...ing, ...con.alineado]) { x0 = Math.min(x0, q.x); x1 = Math.max(x1, q.x); y0 = Math.min(y0, q.y); y1 = Math.max(y1, q.y); }
        const W = 1000, f = W / (x1 - x0 + 0.4), H = Math.ceil((y1 - y0 + 0.4) * f);
        const pt = (q, col) => `<circle cx="${((q.x - x0 + 0.2) * f).toFixed(1)}" cy="${((y1 - q.y + 0.2) * f).toFixed(1)}" r="1" fill="${col}"/>`;
        writeFileSync(join(png, `${pieza.tipo}-${pieza.archivo.replace(/\.json$/, '')}${conBiblioteca ? '-bib' : ''}.svg`), `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}"><rect width="100%" height="100%" fill="#fff"/>${ing.map((q) => pt(q, '#1f6feb')).join('')}${con.alineado.map((q) => pt(q, '#e5534b')).join('')}</svg>`);
      }
    }
    filas.push({grupo: par.grupo, id: par.id, resultados});
    const pc = (v) => `${Math.round(v * 100)}%`;
    console.log(`${par.grupo}/${par.id}: ${resultados.map((x) => `${x.tipo} ${x.titulo}: ${x.f1 === undefined ? x.estado : `${pc(x.f1)}${conBiblioteca ? ` (sin ${pc(x.sin.f1)}${x.adaptado ? ` ← ${x.adaptado.replace(/\.json$/, '')}` : ''})` : ''}`}`).join(' · ')}`);
  }
  const prom = (xs) => (xs.length ? Math.round((xs.reduce((s, x) => s + x, 0) / xs.length) * 100) : null);
  const resumen = {};
  console.log(`\nSEMEJANZA DE DETALLES${conBiblioteca ? ` con biblioteca (excluye el ${excluirModo === 'modulo' ? 'módulo' : 'proyecto'} evaluado)` : ''}:`);
  for (const t of tipos) {
    const todos = filas.flatMap((f) => f.resultados.filter((x) => x.tipo === t).map((x) => ({...x, grupo: f.grupo})));
    const med = todos.filter((x) => x.f1 !== undefined);
    resumen[t] = {f1: prom(med.map((x) => x.f1)), f1Sin: prom(med.map((x) => x.sin.f1)), precision: prom(med.map((x) => x.prec)), exhaustividad: prom(med.map((x) => x.exh)), emparejados: med.length, delIngeniero: todos.length, adaptados: med.filter((x) => x.adaptado).length, porProyecto: {}};
    for (const g of [...new Set(todos.map((x) => x.grupo))]) {
      const xs = med.filter((x) => x.grupo === g);
      resumen[t].porProyecto[g] = {f1: prom(xs.map((x) => x.f1)), f1Sin: prom(xs.map((x) => x.sin.f1)), precision: prom(xs.map((x) => x.prec)), exhaustividad: prom(xs.map((x) => x.exh)), emparejados: xs.length, delIngeniero: todos.filter((x) => x.grupo === g).length, adaptados: xs.filter((x) => x.adaptado).length};
    }
    const v = resumen[t];
    console.log(`  ${t}: ${v.f1 ?? '—'} %${conBiblioteca ? ` (sin biblioteca ${v.f1Sin ?? '—'} %; ${v.adaptados} adaptados)` : ''} · precisión ${v.precision ?? '—'} %, exhaustividad ${v.exhaustividad ?? '—'} % (${v.emparejados}/${v.delIngeniero} con par)`);
    for (const [g, w] of Object.entries(v.porProyecto)) console.log(`      ${g}: ${w.f1 ?? '—'} %${conBiblioteca ? ` (sin ${w.f1Sin ?? '—'} %; ${w.adaptados} adaptados)` : ''} (${w.emparejados}/${w.delIngeniero})`);
  }
  if (salidaJson) writeFileSync(salidaJson, JSON.stringify({fecha: new Date().toISOString(), biblioteca: conBiblioteca ? {excluir: excluirModo} : null, resumen, filas}, null, 1));
}

if (process.argv[1] && /evaluar-detalles\.mjs$/.test(process.argv[1])) main().then(() => process.exit(0), (e) => { console.error(e); process.exit(1); });
