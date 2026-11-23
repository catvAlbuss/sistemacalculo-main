// Benchmark de lectura con los 15 pares: ¿el agente ve en la arquitectura las mismas columnas
// que dibujó el ingeniero en su plano de estructuras? Mide, por módulo, F1 de columnas por
// cruce de ejes (posición) y cuántas además tienen la misma sección (±5 cm).
//
//   node scripts/agente/volcar-planos.mjs      # una vez (caché de los DWG)
//   node scripts/agente/evaluar-lectura.mjs [modulo-01 …] [--detalle]
import {readFileSync} from 'node:fs';
import {join} from 'node:path';
import {detectarVistas, leerVista, tiposDeColumna} from '../../resources/js/ingenieria/lectura/lectorPlano.js';
import {nivelDeTitulo, escalaEntrePlanos} from '../../resources/js/ingenieria/aprendizaje/casos.js';
import {PLANOS} from './planos.mjs';
import {leerCache} from './volcar-planos.mjs';
import {paresDelManifiesto} from './pares-entrenamiento.mjs';
import {existsSync} from 'node:fs';

const escalaPorBurbuja = (radio) => (radio >= 40 ? 1000 : radio >= 4 ? 100 : 1);
const args = process.argv.slice(2);
const detalle = args.includes('--detalle');
const filtro = args.filter((a) => !a.startsWith('--'));
const grupoFiltro = args.find((a) => a.startsWith('--grupo='))?.slice(8);
const BASE = join(PLANOS, 'estructuras');
const pares = paresDelManifiesto(BASE, JSON.parse(readFileSync(join(BASE, 'pares.json'), 'utf8')), existsSync)
  .filter((p) => !grupoFiltro || p.grupo === grupoFiltro)
  .filter((p) => !filtro.length || filtro.includes(p.id));

const nombreEje = (n) => String(n).replace(/[´'`’]/g, '´').toUpperCase();
const cruce = (c) => c.eje.split('/').map(nombreEje).sort().join('/');

export function lecturasDe(items) {
  return detectarVistas(items).map((v) => {
    try { return {vista: v, lectura: leerVista(items, v, escalaPorBurbuja(v.radio))}; } catch { return null; }
  }).filter(Boolean);
}

// Planta de arquitectura a estructurar: la del 1er nivel (o la de más columnas).
export function plantaArquitectura(lecturas) {
  const piso = lecturas.filter((l) => !/techo|cubierta|azotea/i.test(l.vista.titulo));
  const primer = piso.find((l) => nivelDeTitulo(l.vista.titulo) === 1);
  return primer ?? [...piso].sort((a, b) => b.lectura.columnas.length - a.lectura.columnas.length)[0];
}
// Planta del ingeniero con las columnas: cimentación/platea o la de más columnas.
export function plantaEstructura(lecturas) {
  return [...lecturas].sort((a, b) => b.lectura.columnas.length - a.lectura.columnas.length
    || Number(/cimenta|platea/i.test(b.vista.titulo)) - Number(/cimenta|platea/i.test(a.vista.titulo)))[0];
}

// Rótulo del ingeniero junto a cada columna de su planta (PL1, CT1, CL1, C1…): el texto de tipo
// más cercano a 1.2 m (en las unidades de su dibujo).
const ROTULO_TIPO = /^(PL|P|CT|CL|C)-?\d+[A-Z]?$/i;
export function rotulosDelIngeniero(items, lectura, k) {
  const textos = items.filter((it) => it.tipo === 'texto' && ROTULO_TIPO.test(it.texto.replace(/\s+/g, '')));
  for (const c of lectura?.columnas ?? []) {
    let mejor = null;
    for (const t of textos) {
      const d = Math.hypot(t.centro.x / k - c.x, t.centro.y / k - c.y);
      if (d < Math.max(1.2, Math.max(c.b, c.h)) && (!mejor || d < mejor.d)) mejor = {d, t};
    }
    c.rotulo = mejor ? mejor.t.texto.replace(/\s+/g, '').toUpperCase() : null;
  }
}
const clase = (tipo) => (/^P/i.test(tipo ?? '') ? 'placa' : tipo ? 'columna' : null);

export function compararColumnasF1(arq, est) {
  // El plano del ingeniero puede estar a otra escala (×2, ×2/3): se lleva a la de la arquitectura.
  const s = escalaEntrePlanos(arq?.ejes, est?.ejes) || 1;
  const r2 = (v) => Math.round((v / s) * 100) / 100;
  const A = new Map((arq?.columnas ?? []).map((c) => [cruce(c), c]));
  const E = new Map((est?.columnas ?? []).map((c) => [cruce(c), {...c, b: r2(c.b), h: r2(c.h)}]));
  let tp = 0, misma = 0, conRotulo = 0, nombre = 0;
  const nombresMal = [];
  const faltan = [], sobran = [], distintas = [];
  // Respaldo: el mismo cruce con otra prima (el ingeniero rotula "E" donde la arquitectura dice "E´").
  const sinPrima = (k) => k.replace(/´/g, '');
  const A2 = new Map([...A].map(([k, c]) => [sinPrima(k), c]));
  const usados = new Set();
  for (const [k, e] of E) {
    let a = A.get(k);
    if (!a && !E.has([...A.keys()].find((x) => sinPrima(x) === sinPrima(k)))) a = A2.get(sinPrima(k));
    if (a) usados.add(a);
    if (!a) { faltan.push(`${k} ${e.forma} ${e.b}x${e.h}`); continue; }
    tp++;
    if (e.rotulo) { conRotulo++; if (clase(e.rotulo) === clase(a.tipo)) nombre++; else nombresMal.push(`${k} ${a.forma} ${a.b}x${a.h}: agente ${a.tipo} / ing ${e.rotulo}`); }
    const igual = (Math.abs(a.b - e.b) <= 0.05 && Math.abs(a.h - e.h) <= 0.05) || (Math.abs(a.b - e.h) <= 0.05 && Math.abs(a.h - e.b) <= 0.05);
    if (igual) misma++; else distintas.push(`${k} arq ${a.forma} ${a.b}x${a.h} / est ${e.forma} ${e.b}x${e.h}`);
  }
  for (const [k, a] of A) if (!usados.has(a)) sobran.push(`${k} ${a.forma} ${a.b}x${a.h}`);
  const p = A.size ? tp / A.size : 0, r = E.size ? tp / E.size : 0;
  return {arq: A.size, est: E.size, tp, misma, conRotulo, nombre, nombresMal, f1: p + r ? (2 * p * r) / (p + r) : 0, faltan, sobran, distintas};
}

async function main() {
  const filas = [];
  for (const par of pares) {
    const ca = leerCache(par.rutaArquitectura), ce = leerCache(par.rutaEstructura);
    if (!ca || !ce) { console.log(`${par.id}: sin caché (corre volcar-planos.mjs)`); continue; }
    const la = lecturasDe(ca.items), le = lecturasDe(ce.items);
    const pa = plantaArquitectura(la), pe = plantaEstructura(le);
    if (pe) rotulosDelIngeniero(ce.items, pe.lectura, escalaPorBurbuja(pe.vista.radio));
    const r = compararColumnasF1(pa?.lectura, pe?.lectura);
    filas.push({id: par.id, ...r});
    console.log(`${par.id}: vistas arq ${la.length} (${la.map((l) => l.vista.titulo).join(' | ').slice(0, 90)}) · est ${le.length}`);
    console.log(`   planta arq "${pa?.vista.titulo ?? '—'}" ${pa?.lectura.ejes.length ?? 0} ejes · est "${pe?.vista.titulo ?? '—'}" ${pe?.lectura.ejes.length ?? 0} ejes`);
    console.log(`   columnas arq ${r.arq} / ing ${r.est} · en su cruce ${r.tp} · misma sección ${r.misma} · F1 ${(r.f1 * 100).toFixed(0)} % · placa/columna como el ingeniero ${r.nombre}/${r.conRotulo}`);
    if (detalle) {
      if (r.faltan.length) console.log(`   faltan: ${r.faltan.join('; ')}`);
      if (r.sobran.length) console.log(`   sobran: ${r.sobran.join('; ')}`);
      if (r.nombresMal.length) console.log(`   nombre distinto: ${r.nombresMal.join('; ')}`);
      if (r.distintas.length) console.log(`   distinta sección: ${r.distintas.join('; ')}`);
    }
  }
  const prom = (k) => filas.reduce((s, f) => s + f[k], 0) / (filas.length || 1);
  const seccion = filas.reduce((s, f) => s + f.misma, 0) / (filas.reduce((s, f) => s + f.est, 0) || 1);
  const nom = filas.reduce((s, f) => s + f.nombre, 0), conR = filas.reduce((s, f) => s + f.conRotulo, 0);
  console.log(`\nPlaca o columna como el ingeniero: ${nom}/${conR} (${((nom / (conR || 1)) * 100).toFixed(1)} %)`);
  console.log(`Promedio F1 columnas (posición): ${(prom('f1') * 100).toFixed(1)} % · misma sección: ${(seccion * 100).toFixed(1)} % de las del ingeniero (${filas.length} módulos)`);
}

if (process.argv[1]?.endsWith('evaluar-lectura.mjs')) await main();
