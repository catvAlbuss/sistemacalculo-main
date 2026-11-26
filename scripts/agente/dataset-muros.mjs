// Conjunto de datos para aprender qué muros dibuja el ingeniero en su planta de cimentación.
// Para cada par (arquitectura + estructuras del ingeniero): el agente arma sus láminas, se toman los
// tramos de muro candidatos con sus rasgos (cimentacionPlano.js → candidatosMuro) y cada uno se
// etiqueta con lo que dibujó el ingeniero encima (alineado por los ejes del mismo nombre, como
// evaluar-dibujo.mjs): etiqueta = al menos la mitad del tramo a ≤ 10 cm de su dibujo estructural.
//
//   node scripts/agente/dataset-muros.mjs [modulo-01 …] [--grupo=vinchos]
// Salida (privada): storage/app/private/entrenamiento/modelos/muros-cimentacion.json
import {readFileSync, writeFileSync, mkdirSync, existsSync} from 'node:fs';
import {join} from 'node:path';
import * as dm from '@mlightcad/data-model';
import {createDrawingContext} from '../../resources/js/ingenieria/cad/drawingContext.js';
import {SKILLS} from '../../resources/js/ingenieria/agente/skills/index.js';
import {instalarRecorteXclip} from '../../resources/js/etabs/visor/recorteXclip.js';
import {detectarVistas} from '../../resources/js/ingenieria/lectura/lectorPlano.js';
import {clasificarVista, indicesDeRejilla} from '../../resources/js/ingenieria/lectura/clasificador.js';
import {PLANOS} from './planos.mjs';
import {leerCache} from './volcar-planos.mjs';
import {paresDelManifiesto} from './pares-entrenamiento.mjs';
import {cargarPlantillaAdaptativa} from './plantilla.mjs';

const args = process.argv.slice(2);
const filtro = args.filter((a) => /^modulo-/.test(a));
const grupo = args.find((a) => a.startsWith('--grupo='))?.slice(8);
const BASE = join(PLANOS, 'estructuras');
const SALIDA = join(PLANOS, 'modelos');
const pares = paresDelManifiesto(BASE, JSON.parse(readFileSync(join(BASE, 'pares.json'), 'utf8')), existsSync)
  .filter((p) => !p.holdout && (!filtro.length || filtro.includes(p.id)) && (!grupo || p.grupo === grupo));
const TOL = 0.10, PASO = 0.05;
const CLASES_MURO = ['muro', 'viga', 'cimiento', 'columneta'];
const CIMENTACION = /PLATEA|CIMENTACI[OÓ]N(?!.*CORRIDO)|ZAPATA/i;
const SIN_DIBUJO = /texto|text|cota|acot|dim|eje|axis|achur|hatch|titul|rotulo|lamina|cuadro|niveles?$/i;

const {AcDbLibreDwgMainThreadConverter} = await import('@mlightcad/libredwg-converter/node');
dm.AcDbDatabaseConverterManager.instance.register(dm.AcDbFileType.DWG, new AcDbLibreDwgMainThreadConverter());
instalarRecorteXclip({AcDbLibreDwgConverter: (await import('@mlightcad/libredwg-converter')).AcDbLibreDwgConverter, AcDbBlockReference: dm.AcDbBlockReference});
const plantilla = await cargarPlantillaAdaptativa();

// ---- Alineación por ejes y muestras del ingeniero (mismo criterio que evaluar-dibujo.mjs) ----
const nombre = (n) => String(n).replace(/[´'`’]/g, '').toUpperCase();
function posEjes(ejes) {
  const o = {x: {}, y: {}};
  for (const e of ejes) {
    const v = Math.abs(e.q.y - e.p.y) >= Math.abs(e.q.x - e.p.x);
    o[v ? 'x' : 'y'][nombre(e.nombre)] = v ? (e.p.x + e.q.x) / 2 : (e.p.y + e.q.y) / 2;
  }
  return o;
}
function alinear(A, B) {
  const t = {};
  for (const d of ['x', 'y']) {
    const comunes = Object.keys(A[d]).filter((k) => k in B[d]);
    if (comunes.length < 2) return null;
    const xs = comunes.map((k) => B[d][k]), ys = comunes.map((k) => A[d][k]);
    const mx = xs.reduce((s, v) => s + v, 0) / xs.length, my = ys.reduce((s, v) => s + v, 0) / ys.length;
    const sxx = xs.reduce((s, v) => s + (v - mx) ** 2, 0), sxy = xs.reduce((s, v, i) => s + (v - mx) * (ys[i] - my), 0);
    const a = sxx ? sxy / sxx : 1;
    t[d] = {a, b: my - a * mx, n: comunes.length};
  }
  return t;
}
const escalaDe = (radio) => (radio >= 40 ? 1000 : radio >= 4 ? 100 : 1);
const ampliar = (c, m) => ({x0: c.x0 - m, y0: c.y0 - m, x1: c.x1 + m, y1: c.y1 + m});
function muestrasIngeniero(items, vista, k) {
  const caja = ampliar(vista.caja, 1.5 * k);
  const dentro = (p) => p && p.x >= caja.x0 && p.x <= caja.x1 && p.y >= caja.y0 && p.y <= caja.y1;
  const sub = items.filter((it) => (it.puntos ?? [it.centro]).some(dentro));
  const ejes = vista.ejes.map((e) => { const v = Math.abs(e.q.y - e.p.y) >= Math.abs(e.q.x - e.p.x); return {orientacion: v ? 'x' : 'y', posicion: v ? (e.p.x + e.q.x) / 2 / k : (e.p.y + e.q.y) / 2 / k}; });
  const M = (p) => (p ? {x: p.x / k, y: p.y / k} : p);
  const ents = sub.map((it) => ({...it, puntos: it.puntos?.map(M), centro: M(it.centro), radio: it.radio ? it.radio / k : it.radio}));
  const cl = clasificarVista({ejes, tipoPlano: 'cimentacion', entidades: ents});
  // Sin la malla de la platea (trazos cada 0.20 m: cubriría cualquier muro) ni losas o acero: solo
  // lo que el ingeniero dibuja como muro, viga o cimiento.
  const malla = indicesDeRejilla(ents);
  if (process.env.DEPURAR_CLASES) { const c = {}; sub.forEach((it, i) => { if (it.tipo === 'linea' || it.tipo === 'poli') { const k2 = `${cl[i].clase}${malla.has(i) ? '(malla)' : ''} · ${it.capa}`; c[k2] = (c[k2] ?? 0) + 1; } }); console.log('CLASES', JSON.stringify(Object.entries(c).sort((x, y) => y[1] - x[1]).slice(0, 14))); }
  const largoMax = 1.15 * Math.max(vista.caja.x1 - vista.caja.x0, vista.caja.y1 - vista.caja.y0);
  const out = [];
  sub.forEach((it, i) => {
    if ((it.tipo !== 'linea' && it.tipo !== 'poli') || SIN_DIBUJO.test(it.capa ?? '') || malla.has(i) || !CLASES_MURO.includes(cl[i].clase)) return;
    const segs = it.puntos.slice(1).map((q, j) => [it.puntos[j], q]);
    if (it.cerrada && it.puntos.length > 2) segs.push([it.puntos.at(-1), it.puntos[0]]);
    for (const [a, b] of segs) {
      const l = Math.hypot(b.x - a.x, b.y - a.y);
      if (l > largoMax) continue;
      const n = Math.max(1, Math.ceil(l / k / PASO));
      for (let j = 0; j <= n; j++) { const q = {x: a.x + ((b.x - a.x) * j) / n, y: a.y + ((b.y - a.y) * j) / n}; if (dentro(q)) out.push({x: q.x / k, y: q.y / k}); }
    }
  });
  return out;
}
function rejilla(puntos) {
  const g = new Map(), key = (x, y) => `${Math.floor(x / TOL)},${Math.floor(y / TOL)}`;
  for (const p of puntos) { const c = key(p.x, p.y); (g.get(c) ?? g.set(c, []).get(c)).push(p); }
  return (p) => {
    const cx = Math.floor(p.x / TOL), cy = Math.floor(p.y / TOL);
    for (let dx = -1; dx <= 1; dx++) for (let dy = -1; dy <= 1; dy++) if ((g.get(`${cx + dx},${cy + dy}`) ?? []).some((q) => Math.hypot(q.x - p.x, q.y - p.y) <= TOL)) return true;
    return false;
  };
}

const muestras = [];
const resumen = [];
for (const par of pares) {
  const t0 = Date.now();
  const ce = leerCache(par.rutaEstructura);
  if (!ce) { console.log(`${par.grupo}/${par.id}: sin caché del plano de estructuras`); continue; }
  const candidatasIng = detectarVistas(ce.items).filter((v) => CIMENTACION.test(v.titulo ?? ''));
  if (!candidatasIng.length) { console.log(`${par.grupo}/${par.id}: el ingeniero no tiene planta de cimentación`); continue; }
  const db = new dm.AcDbDatabase(); const b = readFileSync(par.rutaArquitectura);
  await db.read(b.buffer.slice(b.byteOffset, b.byteOffset + b.byteLength), {readOnly: true}, dm.AcDbFileType.DWG);
  const ctx = createDrawingContext({getDatabase: () => db, dm, loadTemplate: async () => plantilla, getProjectData: () => ({}), afterDraw: () => {}});
  globalThis.__capturaMurosCimentacion = [];
  const r = await SKILLS.find((s) => s.name === 'plano_estructuras').run({}, ctx).catch((e) => ({ok: false, error: e.message}));
  const captura = globalThis.__capturaMurosCimentacion[0];
  globalThis.__capturaMurosCimentacion = null;
  if (!r.ok || !captura) { console.log(`${par.grupo}/${par.id}: sin cimentación del agente (${r.error ?? 'sin muros'})`); continue; }
  const {lectura, tipo, candidatos} = captura;
  const conTr = candidatasIng.map((v) => ({v, tr: alinear(posEjes(v.ejes), posEjes(lectura.ejes ?? []))})).filter((x) => x.tr)
    .sort((a, b) => (b.tr.x.n + b.tr.y.n) - (a.tr.x.n + a.tr.y.n));
  if (!conTr.length) { console.log(`${par.grupo}/${par.id}: sin ejes comunes con el ingeniero`); continue; }
  const {v: vi, tr} = conTr[0];
  const ki = escalaDe(vi.radio);
  const cerca = rejilla(muestrasIngeniero(ce.items, vi, ki));
  const P = (p) => ({x: (tr.x.a * p.x + tr.x.b) / ki, y: (tr.y.a * p.y + tr.y.b) / ki});
  let si = 0, reglaBien = 0;
  for (const c of candidatos) {
    const l = Math.hypot(c.b.x - c.a.x, c.b.y - c.a.y), n = Math.max(1, Math.ceil(l / PASO));
    let cubiertos = 0;
    for (let j = 0; j <= n; j++) if (cerca(P({x: c.a.x + ((c.b.x - c.a.x) * j) / n, y: c.a.y + ((c.b.y - c.a.y) * j) / n}))) cubiertos++;
    const cobertura = cubiertos / (n + 1), etiqueta = cobertura >= 0.5;
    if (etiqueta) si++;
    if (etiqueta === c.regla) reglaBien++;
    muestras.push({proyecto: par.grupo, modulo: par.id, rasgos: c.rasgos, regla: c.regla, cobertura: Math.round(cobertura * 100) / 100, etiqueta, largo: Math.round(l * 100) / 100});
  }
  resumen.push({proyecto: par.grupo, modulo: par.id, tipo, muros: candidatos.length, si, regla: candidatos.length ? reglaBien / candidatos.length : null});
  console.log(`${par.grupo}/${par.id}: ${candidatos.length} tramos (${si} los dibuja el ingeniero) · ${tipo} · regla acierta ${Math.round((100 * reglaBien) / (candidatos.length || 1))} % · ejes comunes ${tr.x.n}+${tr.y.n} · ${Math.round((Date.now() - t0) / 1000)} s`);
}
mkdirSync(SALIDA, {recursive: true});
writeFileSync(join(SALIDA, 'muros-cimentacion.json'), JSON.stringify({generado: new Date().toISOString(), muestras, resumen}));
console.log(`\n${muestras.length} tramos de ${resumen.length} módulos → ${join(SALIDA, 'muros-cimentacion.json')}`);
