// Semejanza REAL del dibujo: superpone cada planta que dibuja el agente sobre la del ingeniero
// (alineadas por los ejes del mismo nombre) y mide qué parte de las líneas coincide.
//   precisión  = de lo que dibuja el agente, cuánto está donde el ingeniero dibujó algo;
//   exhaustividad = de lo que dibujó el ingeniero, cuánto dibujó también el agente;
//   semejanza = F1 de ambas (tolerancia 10 cm). Textos, cotas y achurados no cuentan.
//
//   node scripts/agente/evaluar-dibujo.mjs [modulo-01 …] [--png carpeta]
import {readFileSync, writeFileSync, mkdirSync, existsSync} from 'node:fs';
import {join} from 'node:path';
import * as dm from '@mlightcad/data-model';
import {createDrawingContext} from '../../resources/js/ingenieria/cad/drawingContext.js';
import {SKILLS} from '../../resources/js/ingenieria/agente/skills/index.js';
import {instalarRecorteXclip} from '../../resources/js/etabs/visor/recorteXclip.js';
import {aplanarModelo, detectarVistas} from '../../resources/js/ingenieria/lectura/lectorPlano.js';
import {clasificarVista, CLASES_DIBUJO, indicesDeRejilla} from '../../resources/js/ingenieria/lectura/clasificador.js';
import {PLANOS} from './planos.mjs';
import {leerCache} from './volcar-planos.mjs';
import {paresDelManifiesto} from './pares-entrenamiento.mjs';
import {nivelDeTitulo} from '../../resources/js/ingenieria/aprendizaje/casos.js';
import {cargarPlantillaAdaptativa} from './plantilla.mjs';
import {medirEstiloDePlano, reglasDeEstilo} from '../../resources/js/ingenieria/aprendizaje/estiloDespacho.js';

const args = process.argv.slice(2);
const filtro = args.filter((a) => /^modulo-/.test(a));
const png = args.includes('--png') ? args[args.indexOf('--png') + 1] : null;
const salidaJson = args.find((a) => a.startsWith('--json='))?.slice(7);
const grupo = args.find((a) => a.startsWith('--grupo='))?.slice(8);
// --estilo[=N]: el agente dibuja con el estilo aprendido de N planos del ingeniero de OTROS módulos del
// mismo proyecto (nunca del que se evalúa), como si el cliente le hubiera dado esos planos.
const argEstilo = args.find((a) => a === '--estilo' || a.startsWith('--estilo='));
const planosEstilo = argEstilo ? Number(argEstilo.split('=')[1] ?? 5) || 5 : 0;
// --diag: qué capas del agente dejan dibujo sobrante y qué capas del ingeniero quedan sin cubrir.
const diag = args.includes('--diag') ? {sobra: {}, falta: {}} : null;
const BASE = join(PLANOS, 'estructuras');
const pares = paresDelManifiesto(BASE, JSON.parse(readFileSync(join(BASE, 'pares.json'), 'utf8')), existsSync)
  .filter((p) => (!filtro.length || filtro.includes(p.id)) && (!grupo || p.grupo === grupo));
const TOL = 0.10, PASO = 0.05;
// Tipos de planta comparables (título del ingeniero / del agente).
const TIPOS = [
  {id: 'cimentacion', re: /PLATEA|CIMENTACI[OÓ]N(?!.*CORRIDO)|ZAPATA/i},
  {id: 'cimiento', re: /CIMIENTO\s+CORRIDO/i},
  {id: 'losa', re: /LOSA|ALIGERADO|TECHO\s+\d|TECHO$/i, no: /TABIQUER/i},
  {id: 'tabiqueria', re: /TABIQUER/i},
];
const SIN_DIBUJO = /texto|text|cota|acot|dim|eje|axis|achur|hatch|titul|rotulo|lamina|cuadro|niveles?$/i;

const {AcDbLibreDwgMainThreadConverter} = await import('@mlightcad/libredwg-converter/node');
dm.AcDbDatabaseConverterManager.instance.register(dm.AcDbFileType.DWG, new AcDbLibreDwgMainThreadConverter());
instalarRecorteXclip({AcDbLibreDwgConverter: (await import('@mlightcad/libredwg-converter')).AcDbLibreDwgConverter, AcDbBlockReference: dm.AcDbBlockReference});
const leer = async (archivo, tipo) => { const db = new dm.AcDbDatabase(); const b = readFileSync(archivo); await db.read(b.buffer.slice(b.byteOffset, b.byteOffset + b.byteLength), {readOnly: true}, tipo); return db; };
const plantilla = await cargarPlantillaAdaptativa();

const nombre = (n) => String(n).replace(/[´'`’]/g, '').toUpperCase();
// Posición de cada eje por nombre en una vista: {x: {A: 12.3}, y: {...}} (vertical → x).
function posEjes(vista) {
  const o = {x: {}, y: {}};
  for (const e of vista.ejes) {
    const v = Math.abs(e.q.y - e.p.y) >= Math.abs(e.q.x - e.p.x);
    o[v ? 'x' : 'y'][nombre(e.nombre)] = v ? (e.p.x + e.q.x) / 2 : (e.p.y + e.q.y) / 2;
  }
  return o;
}
// Transformación de la vista B a la de A (escala y traslado por dirección, por mínimos cuadrados).
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
// Muestras cada 5 cm de las líneas dentro de la caja (ampliada), en el marco común y en metros.
// Las líneas que salen de la caja se recortan (la platea con su alero sobresale de los ejes).
// Clase de cada entidad (paso 3), en metros y con los ejes de su vista.
function clasesDe(items, vista, k, tipoPlano) {
  const ejes = vista.ejes.map((e) => { const v = Math.abs(e.q.y - e.p.y) >= Math.abs(e.q.x - e.p.x); return {orientacion: v ? 'x' : 'y', posicion: v ? (e.p.x + e.q.x) / 2 / k : (e.p.y + e.q.y) / 2 / k}; });
  const M = (p) => (p ? {x: p.x / k, y: p.y / k} : p);
  const ents = items.map((it) => ({...it, puntos: it.puntos?.map(M), centro: M(it.centro), radio: it.radio ? it.radio / k : it.radio}));
  const cl = clasificarVista({ejes, tipoPlano, entidades: ents});
  // malla: rejilla de trazos paralelos regulares, en cualquier capa (la del ingeniero suele
  // estar en una capa de acero), no un borde de losa.
  const rejilla = indicesDeRejilla(ents);
  return new Map(items.map((it, i) => [it, {clase: cl[i].clase, malla: rejilla.has(i) || /malla/.test(cl[i].evidencia ?? '')}]));
}
function muestras(items, caja, tr, escala, ejes = caja, clases = null) {
  // Trazos más largos que la grilla de ejes (marcos de lámina, líneas de rótulo) no son la planta.
  const largoMax = 1.15 * Math.max(ejes.x1 - ejes.x0, ejes.y1 - ejes.y0);
  const dentro = (p) => p.x >= caja.x0 && p.x <= caja.x1 && p.y >= caja.y0 && p.y <= caja.y1;
  const P = (p) => ({x: (tr.x.a * p.x + tr.x.b) / escala, y: (tr.y.a * p.y + tr.y.b) / escala});
  const out = [];
  for (const it of items) {
    if ((it.tipo !== 'linea' && it.tipo !== 'poli') || SIN_DIBUJO.test(it.capa ?? '')) continue;
    if (!it.puntos.some(dentro) && !(it.puntos.length >= 2 && cruzaCaja(it.puntos, caja))) continue;
    const segs = it.puntos.slice(1).map((q, i) => [it.puntos[i], q]);
    if (it.cerrada && it.puntos.length > 2) segs.push([it.puntos.at(-1), it.puntos[0]]);
    for (const [a0, b0] of segs) {
      const l = Math.hypot(b0.x - a0.x, b0.y - a0.y) / escala, n = Math.max(1, Math.ceil(l / PASO));
      if (l * escala > largoMax) continue;
      for (let i = 0; i <= n; i++) {
        const q = {x: a0.x + ((b0.x - a0.x) * i) / n, y: a0.y + ((b0.y - a0.y) * i) / n};
        if (dentro(q)) out.push({...P(q), clase: clases?.get(it)?.clase ?? null, malla: Boolean(clases?.get(it)?.malla), capa: it.capa});
      }
    }
  }
  return out;
}
const cruzaCaja = (pts, c) => {
  const xs = pts.map((p) => p.x), ys = pts.map((p) => p.y);
  return Math.min(...xs) <= c.x1 && Math.max(...xs) >= c.x0 && Math.min(...ys) <= c.y1 && Math.max(...ys) >= c.y0;
};
const ampliar = (c, m) => ({x0: c.x0 - m, y0: c.y0 - m, x1: c.x1 + m, y1: c.y1 + m});
const familia = (p) => (p.malla ? 'losa' : 'resto');
const TOL_LOSA = 0.30;
// conClase: además de la posición, el mismo elemento (muro con muro, viga con viga; columna y
// columneta se aceptan entre sí). Así dibujar denso cerca del ingeniero no cuenta como acierto.
const CLASE_PAR = {columneta: 'columna'};
const mismaFamiliaClase = (a, b) => (CLASE_PAR[a] ?? a) === (CLASE_PAR[b] ?? b);
function cubiertos(desde, hacia, conClase = false) {
  if (!desde.length) return 0;
  const g = new Map(), k = (x, y) => `${Math.floor(x / TOL)},${Math.floor(y / TOL)}`;
  for (const p of hacia) { const c = k(p.x, p.y); if (!g.has(c)) g.set(c, []); g.get(c).push(p); }
  let n = 0;
  for (const p of desde) {
    const cx = Math.floor(p.x / TOL), cy = Math.floor(p.y / TOL);
    let ok = false;
    // Una rejilla de losa (malla de maciza o platea, trazos cada 0.20–0.25 m) queda a menos de
    // 10 cm de casi cualquier línea de la zona: solo empareja con losa, y lo demás no con ella.
    // Así una malla de más no "cubre" las viguetas o muros del ingeniero (ni al revés).
    // La rejilla representa un área armada: dos rejillas coinciden si están a ≤ 0.30 m (no se
    // exige el mismo paso ni la misma fase de líneas); el resto de elementos, a 10 cm.
    const fam = familia(p), tol = fam === 'losa' ? TOL_LOSA : TOL, r = Math.ceil(tol / TOL);
    for (let dx = -r; dx <= r && !ok; dx++) for (let dy = -r; dy <= r && !ok; dy++) ok = (g.get(`${cx + dx},${cy + dy}`) ?? []).some((q) => familia(q) === fam && (!conClase || mismaFamiliaClase(p.clase, q.clase)) && Math.hypot(q.x - p.x, q.y - p.y) <= tol);
    if (ok) n++;
  }
  return n / desde.length;
}
const escalaDe = (radio) => (radio >= 40 ? 1000 : radio >= 4 ? 100 : 1);

const filas = [];
const estilos = new Map();
if (planosEstilo) {
  const todos = paresDelManifiesto(BASE, JSON.parse(readFileSync(join(BASE, 'pares.json'), 'utf8')), existsSync).filter((p) => !grupo || p.grupo === grupo);
  for (const p of todos) { const c = leerCache(p.rutaEstructura); if (c) estilos.set(p, medirEstiloDePlano(c.items)); }
}
const estiloPara = (par) => {
  const otros = [...estilos].filter(([p]) => p.grupo === par.grupo && p.id !== par.id).sort(([a], [b]) => a.id.localeCompare(b.id)).slice(0, planosEstilo).map(([, m]) => m);
  return otros.length ? reglasDeEstilo(otros) : null;
};
for (const par of pares) {
  const ce = leerCache(par.rutaEstructura);
  if (!ce) { console.log(`${par.id}: sin caché`); continue; }
  const vistasIng = detectarVistas(ce.items);
  const db = await leer(par.rutaArquitectura, dm.AcDbFileType.DWG);
  const antes = db.tables.blockTable.modelSpace.newIterator().toArray().length;
  const ctx = createDrawingContext({getDatabase: () => db, dm, loadTemplate: async () => plantilla, getProjectData: () => ({}), afterDraw: () => {}});
  if (planosEstilo) ctx.memoria.estiloDespacho = estiloPara(par);
  const r = await SKILLS.find((s) => s.name === 'plano_estructuras').run({}, ctx).catch((e) => ({ok: false, error: e.message}));
  if (!r.ok) { console.log(`${par.id}: el agente falló (${r.error})`); continue; }
  // Sin las cotas del agente (capa 0, color 142): las del ingeniero son DIMENSION y no se cuentan.
  const colorDe = (e) => e.color?.colorIndex ?? e.colorIndex ?? e.color?.index;
  const nuevas = db.tables.blockTable.modelSpace.newIterator().toArray().slice(antes).filter((e) => !(e.layer === '0' && colorDe(e) === 142));
  const {items: itemsAg} = aplanarModelo(nuevas);
  const ubic = ctx.memoria.ubicacionesPlanos ?? [];
  const fila = {id: par.id, grupo: par.grupo, tipos: {}};
  for (const tipo of TIPOS) {
    const ok = (t) => tipo.re.test(t) && !(tipo.no?.test(t));
    // Nivel de una planta para emparejar: el techo cuenta como nivel propio (nivelDeTitulo lo deja
    // en null), así la losa de techo del agente se compara con la de techo del ingeniero.
    const nivelClave = (t) => (/TECHO|AZOTEA|CUBIERTA/i.test(String(t ?? '')) ? 'techo' : nivelDeTitulo(t ?? ''));
    // Ingeniero: entre sus vistas con ese título, la que comparte más ejes con la del agente.
    const candidatas = vistasIng.filter((v) => ok(v.titulo));
    // Agente: la planta en el lugar exacto donde la dibujó (sin adivinar por títulos). Si dibujó
    // varias (losa de entrepiso y de techo), la del mismo nivel que alguna del ingeniero.
    const plantasAg = ubic.filter((x) => ok(x.titulo));
    const u = plantasAg.find((x) => nivelClave(x.titulo) !== null && candidatas.some((v) => nivelClave(v.titulo) === nivelClave(x.titulo))) ?? plantasAg[0];
    if (!candidatas.length || !u?.caja) { fila.tipos[tipo.id] = {estado: !candidatas.length ? 'el ingeniero no lo tiene' : 'el agente no lo dibujó'}; continue; }
    const kAg = ctx.memoria.estructura?.escala ?? 1;
    const cajaAg = ampliar(u.caja, 0.3 * kAg);
    const subAg = itemsAg.filter((it) => (it.puntos ?? [it.centro]).some((p) => p && p.x >= cajaAg.x0 && p.x <= cajaAg.x1 && p.y >= cajaAg.y0 && p.y <= cajaAg.y1));
    const va = detectarVistas(subAg).sort((a, b) => b.ejes.length - a.ejes.length)[0];
    if (!va) { fila.tipos[tipo.id] = {estado: 'sin ejes en la planta del agente'}; continue; }
    // Primero la del mismo nivel (la losa de 1° piso del agente contra la de 1° nivel del
    // ingeniero, no contra la de 2° con su vacío); después, la de más ejes en común.
    const nivelAg = nivelClave(u.titulo);
    const mismoNivel = (v) => (nivelAg !== null && nivelClave(v.titulo) === nivelAg ? 1 : 0);
    const conTr = candidatas.map((v) => ({v, tr: alinear(posEjes(v), posEjes(va))})).filter((x) => x.tr)
      .sort((a, b) => mismoNivel(b.v) - mismoNivel(a.v) || (b.tr.x.n + b.tr.y.n) - (a.tr.x.n + a.tr.y.n));
    if (!conTr.length) { fila.tipos[tipo.id] = {estado: 'sin ejes comunes'}; continue; }
    const {v: vi} = conTr[0];
    let {tr} = conTr[0];
    const ki = escalaDe(vi.radio);
    const ident = {x: {a: 1, b: 0}, y: {a: 1, b: 0}};
    const cajaI = ampliar(vi.caja, 1.5 * ki), cajaA = ampliar(va.caja, 1.5 * kAg);
    const enCaja = (c) => (it) => (it.puntos ?? [it.centro]).some((p) => p && p.x >= c.x0 && p.x <= c.x1 && p.y >= c.y0 && p.y <= c.y1);
    const itemsI = ce.items.filter(enCaja(cajaI)), itemsA = subAg.filter(enCaja(cajaA));
    const mi = muestras(itemsI, cajaI, ident, ki, vi.caja, clasesDe(itemsI, vi, ki, tipo.id));
    // La caja del agente en su marco; las muestras se llevan al del ingeniero.
    // La planta del agente está en la lámina a su escala (1/50 → 1, 1/100 → 0.5): el clasificador
    // mide en metros reales (espesor de muro, paso de malla), así que se deshace esa escala.
    const clasesAg = clasesDe(itemsA, va, kAg * (u.escala || 1), tipo.id);
    const muestrasAg = (t) => muestras(itemsA, cajaA, t, ki, va.caja, clasesAg);
    let ma = muestrasAg(tr);
    // Un plano tiene la misma escala en x y en y. Si el ajuste por ejes da escalas distintas, un
    // rótulo de eje quedó asignado a otra línea al leer el DWG: se toma la escala de la dirección
    // con más ejes y, en la otra, el desplazamiento de eje común que mejor hace coincidir.
    if (Math.abs(tr.x.a - tr.y.a) > 0.1 * Math.max(Math.abs(tr.x.a), Math.abs(tr.y.a))) {
      const [buena, mala] = tr.x.n >= tr.y.n ? ['x', 'y'] : ['y', 'x'];
      const A = posEjes(vi)[mala], B = posEjes(va)[mala], a = tr[buena].a;
      const f1De = (m) => { const p = cubiertos(m, mi), e = cubiertos(mi, m); return p + e ? (2 * p * e) / (p + e) : 0; };
      let mejor = {f1: f1De(ma), ma, tr};
      for (const k of Object.keys(A).filter((k) => k in B)) {
        const t = {...tr, [mala]: {a, b: A[k] - a * B[k], n: tr[mala].n}};
        const m = muestrasAg(t), f = f1De(m);
        if (f > mejor.f1) mejor = {f1: f, ma: m, tr: t};
      }
      if (mejor.tr !== tr) console.log(`${par.id} ${tipo.id}: ejes en ${mala} con escala distinta (${tr[mala].a.toFixed(2)} vs ${a.toFixed(2)}); alineado con la escala de ${buena}.`);
      ({tr, ma} = mejor);
    }
    const prec = cubiertos(ma, mi), exh = cubiertos(mi, ma);
    const f1 = prec + exh ? (2 * prec * exh) / (prec + exh) : 0;
    // Dibujo estructural: solo elementos (sin textos, cuadros, cotas, ejes ni fondo de arquitectura).
    const esDibujo = (p) => CLASES_DIBUJO.includes(p.clase);
    const mie = mi.filter(esDibujo), mae = ma.filter(esDibujo);
    const pe = cubiertos(mae, mie), ee = cubiertos(mie, mae);
    const pc = cubiertos(mae, mie, true), ec = cubiertos(mie, mae, true);
    if (diag) {
      for (const [lista, otra, dest] of [[mae, mie, 'sobra'], [mie, mae, 'falta']]) {
        const porCapa = new Map();
        for (const p of lista) { const k = `${tipo.id} · ${p.clase} · ${p.capa}`; (porCapa.get(k) ?? porCapa.set(k, []).get(k)).push(p); }
        for (const [k, ps] of porCapa) diag[dest][k] = (diag[dest][k] ?? 0) + Math.round(ps.length * (1 - cubiertos(ps, otra)));
      }
    }
    const porClase = {};
    for (const c of CLASES_DIBUJO) {
      const ic = mie.filter((p) => p.clase === c), ac = mae.filter((p) => p.clase === c);
      if (ic.length < 20 && ac.length < 20) continue;
      porClase[c] = {ing: ic.length, agente: ac.length, exh: ic.length ? cubiertos(ic, mae) : null, prec: ac.length ? cubiertos(ac, mie) : null};
    }
    // Por elemento (macro): cada tipo de elemento pesa igual, sin importar cuántas líneas tenga
    // (la malla de una platea no pesa más que sus columnas). F1 de cada clase presente.
    const f1s = Object.values(porClase).filter((v) => v.ing >= 200 || v.agente >= 200)
      .map((v) => { const pr = v.prec ?? 0, ex = v.exh ?? 0; return pr + ex ? (2 * pr * ex) / (pr + ex) : 0; });
    const f1Elementos = f1s.length ? f1s.reduce((a, b) => a + b, 0) / f1s.length : null;
    fila.tipos[tipo.id] = {precision: prec, exhaustividad: exh, f1, f1Estructural: pe + ee ? (2 * pe * ee) / (pe + ee) : 0, precEstr: pe, exhEstr: ee, f1ConClase: pc + ec ? (2 * pc * ec) / (pc + ec) : 0, porClase, f1Elementos,
      ejes: Math.min(tr.x.n, tr.y.n), vistaIngeniero: vi.titulo, vistaAgente: u.titulo};
    if (png) {
      mkdirSync(png, {recursive: true});
      // Sin Math.min(...xs): con cientos de miles de muestras desborda la pila.
      let mnx = Infinity, mxx = -Infinity, mny = Infinity, mxy = -Infinity;
      for (const q of [...mi, ...ma]) { mnx = Math.min(mnx, q.x); mxx = Math.max(mxx, q.x); mny = Math.min(mny, q.y); mxy = Math.max(mxy, q.y); }
      const x0 = mnx - 0.5, y1 = mxy + 0.5, W = 1600, f = W / (mxx + 0.5 - x0), H = Math.ceil((y1 - mny + 0.5) * f);
      const pt = (p, c) => `<circle cx="${((p.x - x0) * f).toFixed(1)}" cy="${((y1 - p.y) * f).toFixed(1)}" r="0.9" fill="${c}"/>`;
      writeFileSync(join(png, `${par.id}-${tipo.id}.svg`), `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}"><rect width="100%" height="100%" fill="#fff"/>${mi.map((p) => pt(p, '#1f6feb')).join('')}${ma.map((p) => pt(p, '#e5534b')).join('')}</svg>`);
    }
  }
  filas.push(fila);
  const p = (v) => `${Math.round(v * 100)} %`;
  console.log(`${par.id}: ${TIPOS.map((t) => { const x = fila.tipos[t.id]; return `${t.id} ${x.f1 !== undefined ? `${p(x.f1Estructural)} estr. (todo ${p(x.f1)})` : `— ${x.estado}`}`; }).join(' · ')}`);
}
const prom = (xs) => (xs.length ? Math.round((xs.reduce((s, x) => s + x, 0) / xs.length) * 100) : null);
console.log('\nPor planta (estructural · todo lo dibujado):');
for (const t of TIPOS) {
  const fs = filas.map((f) => f.tipos[t.id]).filter((x) => x?.f1 !== undefined);
  if (!fs.length) continue;
  console.log(`  ${t.id.padEnd(12)} ${prom(fs.map((x) => x.f1Estructural))} % · ${prom(fs.map((x) => x.f1))} % · por elemento ${prom(fs.map((x) => x.f1Elementos).filter((x) => x !== null))} % · con clase ${prom(fs.map((x) => x.f1ConClase))} %  (${fs.length} módulos; precisión ${prom(fs.map((x) => x.precEstr))} %, exhaustividad ${prom(fs.map((x) => x.exhEstr))} %)`);
  // Por elemento: qué falta (exhaustividad baja) y qué sobra (precisión baja).
  const clases = {};
  for (const x of fs) for (const [c, v] of Object.entries(x.porClase ?? {})) { clases[c] ??= {exh: [], prec: [], ing: 0, ag: 0}; if (v.exh !== null) clases[c].exh.push(v.exh); if (v.prec !== null) clases[c].prec.push(v.prec); clases[c].ing += v.ing; clases[c].ag += v.agente; }
  for (const [c, v] of Object.entries(clases).sort((a, b) => b[1].ing - a[1].ing)) console.log(`      ${c.padEnd(10)} del ingeniero cubierto ${String(prom(v.exh) ?? '—').padStart(3)} % · del agente correcto ${String(prom(v.prec) ?? '—').padStart(3)} %  (muestras ing ${v.ing}, agente ${v.ag})`);
}
const todos = filas.flatMap((f) => Object.values(f.tipos).filter((x) => x.f1 !== undefined));
console.log(`SEMEJANZA DE DIBUJO ESTRUCTURAL GLOBAL: ${prom(todos.map((x) => x.f1Estructural))} %  (todo lo dibujado: ${prom(todos.map((x) => x.f1))} %; por elemento: ${prom(todos.map((x) => x.f1Elementos).filter((x) => x !== null))} %; con clase: ${prom(todos.map((x) => x.f1ConClase))} %; ${todos.length} plantas)`);
if (diag) for (const dest of ['sobra', 'falta']) {
  console.log(`
${dest === 'sobra' ? 'Sobra (del agente, sin ingeniero cerca)' : 'Falta (del ingeniero, sin agente cerca)'}:`);
  for (const [k, n] of Object.entries(diag[dest]).sort((a, b) => b[1] - a[1]).slice(0, 15)) console.log(`  ${String(n).padStart(6)}  ${k}`);
}
if (salidaJson) {
  const porPlanta = Object.fromEntries(TIPOS.map((t) => {
    const fs = filas.map((f) => f.tipos[t.id]).filter((x) => x?.f1 !== undefined);
    const clases = {};
    for (const x of fs) for (const [c, v] of Object.entries(x.porClase ?? {})) { clases[c] ??= {exh: [], prec: [], ing: 0, faltan: 0, sobran: 0}; if (v.exh !== null) clases[c].exh.push(v.exh); if (v.prec !== null) clases[c].prec.push(v.prec); clases[c].ing += v.ing; clases[c].faltan += v.ing * (1 - (v.exh ?? 0)); clases[c].sobran += v.agente * (1 - (v.prec ?? 0)); }
    return [t.id, {estructural: prom(fs.map((x) => x.f1Estructural)), conClase: prom(fs.map((x) => x.f1ConClase)), todo: prom(fs.map((x) => x.f1)), modulos: fs.length,
      porElemento: Object.fromEntries(Object.entries(clases).map(([c, v]) => [c, {cubierto: prom(v.exh), correcto: prom(v.prec), muestras: v.ing, faltan: Math.round(v.faltan), sobran: Math.round(v.sobran)}]))}];
  }));
  // Por proyecto: un estilo nuevo no debe esconder (ni inflar) lo que ya se domina.
  const porProyecto = Object.fromEntries([...new Set(filas.map((f) => f.grupo))].map((g) => {
    const ts = filas.filter((f) => f.grupo === g).flatMap((f) => Object.values(f.tipos).filter((x) => x.f1 !== undefined));
    return [g, {global: prom(ts.map((x) => x.f1Estructural)), conClase: prom(ts.map((x) => x.f1ConClase)), plantas: ts.length,
      porPlanta: Object.fromEntries(TIPOS.map((t) => [t.id, prom(filas.filter((f) => f.grupo === g).map((f) => f.tipos[t.id]).filter((x) => x?.f1 !== undefined).map((x) => x.f1Estructural))]))}];
  }));
  writeFileSync(salidaJson, JSON.stringify({fecha: new Date().toISOString(), global: prom(todos.map((x) => x.f1Estructural)), conClase: prom(todos.map((x) => x.f1ConClase)), todo: prom(todos.map((x) => x.f1)),
    porElemento: prom(todos.map((x) => x.f1Elementos).filter((x) => x !== null)), porPlanta, porProyecto, filas}, null, 1));
}
process.exit(0);
