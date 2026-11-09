// Arquitectura → estructuras: plano de cimentación generado desde la planta de
// arquitectura leída (ejes con nombre, columnas en sus cruces y muros). Decide
// zapatas aisladas o platea, pone cimiento corrido bajo los muros que corren sobre
// los ejes y vigas de cimentación donde no hay muro. Devuelve el contenido del
// plano en coordenadas de la planta; laminaEstructuras.js lo ubica en la lámina.

import {L, line, pline, circle, text, cota, hatch} from "./primitives.js";
import {predimensionarZapatas, CARGAS_POR_DEFECTO} from "./estructura.js";
import {CRITERIOS} from "./criteriosEstructurales.js";
import {recortar, direccionPrincipal, desplazarPoligono} from "./aligeradoPlano.js";

export const CAPAS_MURO = /muro|tabique|wall|albañ|alban|ladrillo/i;
const CAPAS_MURO_NO = /bajo|elevaci|corte|proyecc|alfeiz|parapet|cerco|tarraj/i;

export const CIMENTACION_POR_DEFECTO = {
  tipo: "auto",          // auto | zapatas | platea
  df: 1.5,               // m, profundidad de desplante de zapatas
  peralteZapata: 0.6,    // m
  espesorPlatea: CRITERIOS.platea.espesor,  // Hz = 0.70 del expediente
  dfPlatea: CRITERIOS.platea.df,            // NFZ = -2.00 del expediente
  vigaB: 0.25, vigaH: 0.5,
  anchoTributario: 1.5,  // m de losa que carga cada muro portante
  pesoMuro: 1.8 * 0.15,  // t/m² de muro (ladrillo 1.8 t/m³ x 0.15 m)
};

const r2 = (v) => Math.round(v * 100) / 100;
const sub = (a, b) => ({x: a.x - b.x, y: a.y - b.y});
const dot = (a, b) => a.x * b.x + a.y * b.y;
const len = (a) => Math.hypot(a.x, a.y);
const pt = (p) => [r2s(p.x), r2s(p.y)];
const r2s = (v) => Math.round(v * 10000) / 10000;

function distSeg(p, a, b) {
  const d = sub(b, a), l2 = dot(d, d) || 1;
  const t = Math.max(0, Math.min(1, dot(sub(p, a), d) / l2));
  return Math.hypot(p.x - a.x - t * d.x, p.y - a.y - t * d.y);
}

// Segmentos de muro (en metros) dentro de la caja de la vista.
export function segmentosMuro(items, caja, k = 1) {
  const pad = 0.5 * k;
  const segs = [];
  for (const it of items) {
    if ((it.tipo !== "poli" && it.tipo !== "linea") || !CAPAS_MURO.test(it.capa) || CAPAS_MURO_NO.test(it.capa)) continue;
    const pts = it.puntos;
    if (!pts.every((p) => p.x >= caja.x0 - pad && p.x <= caja.x1 + pad && p.y >= caja.y0 - pad && p.y <= caja.y1 + pad)) continue;
    const n = pts.length - 1 + (it.cerrada ? 1 : 0);
    for (let i = 0; i < n; i++) segs.push({a: {x: pts[i].x / k, y: pts[i].y / k}, b: {x: pts[(i + 1) % pts.length].x / k, y: pts[(i + 1) % pts.length].y / k}});
  }
  return segs;
}

// Tramos entre columnas consecutivas de un mismo eje, recortados en las caras
// de lo que los limita (columna o zapata).
export function tramosEntreColumnas(columnas, limites = new Map()) {
  const porEje = new Map();
  for (const c of columnas) for (const nombre of c.eje.split("/")) porEje.set(nombre, [...(porEje.get(nombre) ?? []), c]);
  const tramos = [];
  for (const [eje, lista] of porEje) {
    if (lista.length < 2) continue;
    const base = lista[0].nodo, otro = lista.at(-1).nodo;
    const dir0 = sub(otro, base);
    const orden = [...lista].sort((p, q) => dot(sub(p.nodo, base), dir0) - dot(sub(q.nodo, base), dir0));
    for (let i = 0; i < orden.length - 1; i++) {
      const A = orden[i], B = orden[i + 1];
      // El tramo une los centros de las columnas (las columnas suelen ir a un lado del eje).
      const ca = {x: A.x, y: A.y}, cb = {x: B.x, y: B.y};
      const v = sub(cb, ca), largo = len(v);
      if (largo < 0.3) continue;
      const d = {x: v.x / largo, y: v.y / largo};
      // Cara: lo más lejos que llega el contorno del elemento hacia el otro extremo.
      const alcance = (c, origen, sentido) => Math.max(0, ...(limites.get(c) ?? c.contorno).map((p) => dot(sub(p, origen), sentido)));
      const s0 = alcance(A, ca, d), s1 = alcance(B, cb, {x: -d.x, y: -d.y});
      if (s0 + s1 >= largo - 0.1) continue; // los elementos se tocan: no hay tramo libre
      tramos.push({eje, desde: A, hasta: B, a: {x: ca.x + d.x * s0, y: ca.y + d.y * s0}, b: {x: cb.x - d.x * s1, y: cb.y - d.y * s1}, d, largo: largo - s0 - s1});
    }
  }
  return tramos;
}

// Muro sobre el tramo: fracción cubierta (muestras cada 5 cm, caras paralelas a
// menos de 30 cm) y desplazamiento del eje del muro respecto del tramo, para
// centrar el cimiento corrido bajo el muro y no bajo el eje.
export function coberturaMuro(tramo, muros) {
  const n = Math.max(2, Math.round(tramo.largo / 0.05));
  const normal = {x: -tramo.d.y, y: tramo.d.x};
  const paralelos = muros.filter((m) => {
    const v = sub(m.b, m.a), l = len(v);
    return l > 0.02 && Math.abs(dot(v, tramo.d)) / l > 0.95;
  });
  let cubiertas = 0, suma = 0;
  const direccion = {x: 0, y: 0};
  for (let i = 0; i <= n; i++) {
    const p = {x: tramo.a.x + ((tramo.b.x - tramo.a.x) * i) / n, y: tramo.a.y + ((tramo.b.y - tramo.a.y) * i) / n};
    const cerca = paralelos.filter((m) => distSeg(p, m.a, m.b) <= 0.3);
    if (!cerca.length) continue;
    const caras = cerca.map((m) => dot(sub(m.a, p), normal));
    cubiertas++;
    suma += (Math.min(...caras) + Math.max(...caras)) / 2;
    for (const m of cerca) {
      const v = sub(m.b, m.a), l = len(v), signo = dot(v, tramo.d) < 0 ? -1 : 1;
      direccion.x += (signo * v.x) / l; direccion.y += (signo * v.y) / l;
    }
  }
  const l = len(direccion);
  return {fraccion: cubiertas / (n + 1), desplazamiento: cubiertas ? suma / cubiertas : 0, direccion: l ? {x: direccion.x / l, y: direccion.y / l} : tramo.d};
}

// Medidas de dibujo del expediente (en metros reales; la lámina las dibuja a 1/25):
// burbuja de eje r = 0.24 con su texto del mismo alto, rótulo de columna 0.15,
// textos de cota 0.06, códigos y rótulos de elementos 0.07.
export const MEDIDAS = {burbuja: 0.24, textoBurbuja: 0.22, columna: 0.15, cota: 0.06, rotulo: 0.07};

// Ejes con burbujas y columnas con su tipo: base común de los planos de estructuras.
// achurado: "AR-CONC" (platea, aligerado) o "solido" (cimiento corrido), como el expediente.
export function primitivasBase(ejesPlanta, columnas, {achurado = "AR-CONC"} = {}) {
  const ejes = recortarEjes(ejesPlanta, columnas);
  const pts = ejes.flatMap((e) => [e.p, e.q]);
  const marco = {x0: Math.min(...pts.map((p) => p.x)), y0: Math.min(...pts.map((p) => p.y)), x1: Math.max(...pts.map((p) => p.x)), y1: Math.max(...pts.map((p) => p.y))};
  const rb = MEDIDAS.burbuja;
  const h = rb * 0.8; // unidad de texto de los planos (los demás textos son fracciones de h)
  const prim = [];
  for (const e of ejes) {
    const v = sub(e.q, e.p), l = len(v) || 1, u = {x: v.x / l, y: v.y / l};
    // Burbujas fuera de la línea: el eje va de borde a borde de los círculos.
    prim.push(line(L.EJES, pt({x: e.p.x + u.x * rb, y: e.p.y + u.y * rb}), pt({x: e.q.x - u.x * rb, y: e.q.y - u.y * rb})));
    for (const c of [e.p, e.q]) prim.push(circle(L.EJES, pt(c), rb), text(L.EJES, pt(c), e.nombre, MEDIDAS.textoBurbuja));
  }
  for (const c of columnas) {
    prim.push(pline(L.COLUMNAS, c.contorno.map(pt), true));
    prim.push(hatch(L.COLUMNAS, c.contorno.map(pt), achurado === "solido" ? {solido: true} : {patron: "AR-CONC", escala: 0.02}));
    // Tipo junto a la esquina superior izquierda de la columna (C1, C2…).
    const xs = c.contorno.map((q) => q.x), ys = c.contorno.map((q) => q.y);
    prim.push(text(L.COLUMNAS_ID, pt({x: Math.min(...xs) + MEDIDAS.columna * 0.8, y: Math.max(...ys) + MEDIDAS.columna * 0.75}), c.tipo, MEDIDAS.columna));
  }
  prim.push(...cotasEntreEjes(ejes, rb, h, columnas));
  const pad = 1.15 * rb;
  return {
    primitivas: prim, rb, h,
    marco: {x0: marco.x0 - pad, y0: marco.y0 - pad, x1: marco.x1 + pad, y1: marco.y1 + pad},
    // Caja de las burbujas: con ella la lámina ubica el plano donde el ingeniero ubicó el suyo.
    ejes: {x0: marco.x0 - rb, y0: marco.y0 - rb, x1: marco.x1 + rb, y1: marco.y1 + rb},
  };
}

// Como en los planos de estructuras, cada eje se dibuja hasta 1.0 m más allá de la
// columna más alejada a lo largo de él (no de burbuja a burbuja de la arquitectura).
export function recortarEjes(ejes, columnas, margen = 1.0) {
  const puntos = columnas.flatMap((c) => c.contorno);
  if (!puntos.length) return ejes;
  return ejes.map((e) => {
    const v = sub(e.q, e.p), l = len(v) || 1, u = {x: v.x / l, y: v.y / l};
    const s = puntos.map((q) => dot(sub(q, e.p), u));
    const s0 = Math.min(...s) - margen, s1 = Math.max(...s) + margen;
    return {...e, p: {x: e.p.x + u.x * s0, y: e.p.y + u.y * s0}, q: {x: e.p.x + u.x * s1, y: e.p.y + u.y * s1}};
  });
}

// Cotas como en el expediente, en las cuatro caras del plano: por cada familia de ejes
// paralelos (±20°) y en cada extremo, afuera el total entre ejes y adentro la cadena
// columna + luz libre + columna medida con las columnas de ese borde (por eso la
// cara inferior de un módulo con eje inclinado da otras medidas que la superior).
export function cotasEntreEjes(ejes, rb, h, columnas = []) {
  const familias = [];
  for (const e of ejes) {
    const v = sub(e.q, e.p), l = len(v) || 1;
    let u = {x: v.x / l, y: v.y / l};
    const fam = familias.find((f) => Math.abs(dot(f.u, u)) > Math.cos((20 * Math.PI) / 180));
    if (fam) { if (dot(fam.u, u) < 0) u = {x: -u.x, y: -u.y}; fam.ejes.push({...e, u}); } else familias.push({u, ejes: [{...e, u}]});
  }
  const hc = MEDIDAS.cota;
  const prim = [];
  for (const f of familias) {
    if (f.ejes.length < 2) continue;
    const n = {x: -f.u.y, y: f.u.x};
    const extremos = (e) => { const a = dot(e.p, f.u), b = dot(e.q, f.u); return a <= b ? {ini: e.p, fin: e.q} : {ini: e.q, fin: e.p}; };
    const enRef = (e, r) => {
      const p0 = extremos(e).ini, d = e.u;
      const t = (r - dot(p0, f.u)) / (dot(d, f.u) || 1);
      return {x: p0.x + d.x * t, y: p0.y + d.y * t};
    };
    // sentido +1: extremo de inicio de los ejes; -1: extremo final.
    for (const sentido of [1, -1]) {
      const borde = sentido > 0 ? Math.max(...f.ejes.map((e) => dot(extremos(e).ini, f.u))) : Math.min(...f.ejes.map((e) => dot(extremos(e).fin, f.u)));
      const ref = borde + sentido * (rb + 0.1);
      const puntos = f.ejes.map((e) => enRef(e, ref)).sort((a, b) => dot(a, n) - dot(b, n));
      if (puntos.length > 2) prim.push(...cota(L.COTAS_E, pt(puntos.at(-1)), pt(puntos[0]), 0, hc));
      // Entre ejes (si hay más de dos ejes) un poco más adentro.
      const refEjes = ref + sentido * (puntos.length > 2 ? 0.2 : 0);
      const pe = f.ejes.map((e) => enRef(e, refEjes)).sort((a, b) => dot(a, n) - dot(b, n));
      for (let i = 0; i < pe.length - 1; i++) prim.push(...cota(L.COTAS_E, pt(pe[i + 1]), pt(pe[i]), 0, hc));
      // Cadena de caras de las columnas de ese borde.
      const refCadena = refEjes + sentido * 0.22;
      const caras = [];
      for (const e of f.ejes) {
        const propias = columnas.filter((c) => c.eje.split("/").includes(e.nombre));
        if (!propias.length) continue;
        const col = propias.reduce((a, c) => (sentido * (dot(c, f.u) - dot(a, f.u)) < 0 ? c : a));
        const sn = col.contorno.map((q) => dot(q, n));
        caras.push(Math.min(...sn), Math.max(...sn));
      }
      caras.sort((a, b) => a - b);
      if (caras.length < 3) continue;
      const base = enRef(f.ejes[0], refCadena), nb = dot(base, n);
      const enCadena = (sN) => ({x: base.x + n.x * (sN - nb), y: base.y + n.y * (sN - nb)});
      for (let i = 0; i < caras.length - 1; i++) {
        if (caras[i + 1] - caras[i] < 0.02) continue;
        prim.push(...cota(L.COTAS_E, pt(enCadena(caras[i + 1])), pt(enCadena(caras[i])), 0, hc * 0.9));
      }
    }
  }
  return prim;
}

// Rótulo de un elemento lineal (viga, cimiento) sobre el tramo más largo de cada eje.
export function rotularTramos(lista, layer, etiqueta, ancho, h) {
  const porEje = new Map();
  for (const t of lista) if (!porEje.has(t.eje) || t.largo > porEje.get(t.eje).largo) porEje.set(t.eje, t);
  return [...porEje.values()].map((t) => {
    const m = {x: (t.a.x + t.b.x) / 2 - t.d.y * (ancho / 2 + h * 0.5), y: (t.a.y + t.b.y) / 2 + t.d.x * (ancho / 2 + h * 0.5)};
    let ang = (Math.atan2(t.d.y, t.d.x) * 180) / Math.PI;
    if (ang > 90) ang -= 180; else if (ang <= -90) ang += 180;
    return text(layer, pt(m), etiqueta, h * 0.45, Math.round(ang * 10) / 10);
  });
}

// Banda rectangular de ancho w centrada en el tramo (cimiento o viga).
export const banda = (layer, a, b, w) => {
  const v = sub(b, a), l = len(v) || 1, n = {x: (-v.y / l) * (w / 2), y: (v.x / l) * (w / 2)};
  return pline(layer, [pt({x: a.x + n.x, y: a.y + n.y}), pt({x: b.x + n.x, y: b.y + n.y}), pt({x: b.x - n.x, y: b.y - n.y}), pt({x: a.x - n.x, y: a.y - n.y})], true);
};

export function envolvente(puntos) {
  const pts = [...puntos].sort((a, b) => a.x - b.x || a.y - b.y);
  const cross = (o, a, b) => (a.x - o.x) * (b.y - o.y) - (a.y - o.y) * (b.x - o.x);
  const lower = [], upper = [];
  for (const p of pts) { while (lower.length >= 2 && cross(lower.at(-2), lower.at(-1), p) <= 0) lower.pop(); lower.push(p); }
  for (const p of [...pts].reverse()) { while (upper.length >= 2 && cross(upper.at(-2), upper.at(-1), p) <= 0) upper.pop(); upper.push(p); }
  return [...lower.slice(0, -1), ...upper.slice(0, -1)];
}
const areaPoligono = (pts) => Math.abs(pts.reduce((s, p, i) => s + p.x * pts[(i + 1) % pts.length].y - pts[(i + 1) % pts.length].x * p.y, 0)) / 2;

// Agrupa medidas iguales en tipos (Z1, Z2…), las más repetidas primero.
function tiposPor(lista, clave, prefijo) {
  const mapa = new Map();
  for (const el of lista) mapa.set(clave(el), [...(mapa.get(clave(el)) ?? []), el]);
  const orden = [...mapa.entries()].sort((a, b) => b[1].length - a[1].length);
  orden.forEach(([, els], i) => els.forEach((el) => { el.tipo = `${prefijo}${i + 1}`; }));
  return orden.map(([key, els], i) => ({tipo: `${prefijo}${i + 1}`, medida: key, cantidad: els.length}));
}

// lectura: resultado de leerVista (en metros) con columnas que ya traen área tributaria (at).
export function planoCimentacion({lectura, items, caja, k = 1, titulo = ""}, opciones = {}) {
  const o = {...CARGAS_POR_DEFECTO, ...CIMENTACION_POR_DEFECTO, ...Object.fromEntries(Object.entries(opciones).filter(([, v]) => v !== undefined && v !== null && v !== ""))};
  const columnas = lectura.columnas;
  const avisos = [];
  const {zapatas, traslapes, opciones: cargas} = predimensionarZapatas(columnas, {pisos: o.pisos, qadm: o.qadm, cargaMuerta: o.cargaMuerta, cargaViva: o.cargaViva});
  const nodos = columnas.flatMap((c) => c.contorno);
  const huella = envolvente(nodos);
  const areaHuella = areaPoligono(huella);
  const areaZapatas = zapatas.reduce((s, z) => s + z.B * z.L, 0);
  let tipo = String(o.tipo).toLowerCase();
  if (tipo !== "zapatas" && tipo !== "platea") {
    // Módulos chicos (casetas, SS.HH., guardianías): platea, como en el expediente de referencia.
    const chico = areaHuella < 30;
    // Con placas (muros de concreto) la cimentación es corrida: platea, como en los módulos 3 y 09.
    const placas = columnas.filter((c) => c.clase === "placa").map((c) => c.tipo);
    // Criterio del despacho (3 de 3 expedientes en suelo S3): platea, salvo que se pidan zapatas.
    const preferida = CRITERIOS.platea.preferida;
    tipo = traslapes.length || areaZapatas > 0.5 * areaHuella || chico || placas.length || preferida ? "platea" : "zapatas";
    if (tipo === "platea") avisos.push(traslapes.length ? `Las zapatas se traslapan (${traslapes.slice(0, 4).join(", ")}): se propone platea.`
      : chico ? `Módulo de ${areaHuella.toFixed(1)} m²: se propone platea (pide "con zapatas" si prefieres zapatas aisladas).`
      : placas.length ? `Hay placas (${[...new Set(placas)].join(", ")}): se propone platea (pide "con zapatas" si prefieres zapatas aisladas).`
      : preferida && areaZapatas <= 0.5 * areaHuella ? `Criterio del despacho: platea (pide "con zapatas" si prefieres zapatas aisladas).`
      : `Las zapatas ocupan ${Math.round((100 * areaZapatas) / areaHuella)} % de la planta: se propone platea.`);
  }

  // Límites de cada tramo: la zapata (si hay) o la columna.
  const limites = new Map();
  if (tipo === "zapatas") zapatas.forEach((z, i) => limites.set(columnas[i], [{x: z.x0, y: z.y0}, {x: z.x1, y: z.y0}, {x: z.x1, y: z.y1}, {x: z.x0, y: z.y1}]));
  const tramos = tramosEntreColumnas(columnas, limites);
  const muros = segmentosMuro(items, caja, k);
  const qLinea = cargas.pisos * ((cargas.cargaMuerta + cargas.cargaViva) * o.anchoTributario + o.pesoMuro * cargas.alturaPiso);
  const anchoCimiento = Math.max(0.4, Math.ceil(((1.1 * qLinea) / cargas.qadm) / 0.05) * 0.05);
  for (const t of tramos) {
    const muro = coberturaMuro(t, muros);
    t.elemento = tipo === "zapatas" && muro.fraccion >= 0.5 ? "cimiento" : "viga";
    if (t.elemento === "cimiento") {
      // Eje del muro: pasa por el centro del tramo desplazado y sigue la dirección del muro.
      const s = Math.max(-0.3, Math.min(0.3, muro.desplazamiento));
      const centro = {x: (t.a.x + t.b.x) / 2 - t.d.y * s, y: (t.a.y + t.b.y) / 2 + t.d.x * s};
      const w = muro.direccion;
      const proyectar = (p) => { const q = dot(sub(p, centro), w); return {x: centro.x + w.x * q, y: centro.y + w.y * q}; };
      t.a = proyectar(t.a); t.b = proyectar(t.b); t.d = w;
    }
  }
  const cimientos = tramos.filter((t) => t.elemento === "cimiento");
  const vigas = tramos.filter((t) => t.elemento === "viga");
  if (!muros.length) avisos.push("No encontré capas de muros (MURO, TABIQUE): entre columnas puse vigas de cimentación.");

  // ---- Contenido del plano (coordenadas de la planta, en metros) ----
  const base = primitivasBase(lectura.ejes, columnas);
  const {h} = base;
  const prim = [];
  if (tipo === "platea") {
    prim.push(pline(L.PLATEA, huella.map(pt), true));
    // Malla de la platea en las dos direcciones de la grilla, como la dibuja el expediente.
    const u = direccionPrincipal(lectura.ejes), v = {x: -u.y, y: u.x};
    for (const [dir, rep] of [[u, v], [v, u]]) {
      const s = huella.map((p) => dot(p, rep));
      for (let t = Math.min(...s) + CRITERIOS.platea.malla; t < Math.max(...s) - 0.02; t += CRITERIOS.platea.malla) {
        const tramo = recortar({x: rep.x * t, y: rep.y * t}, dir, huella);
        if (tramo) prim.push(line(L.MALLA, pt(tramo[0]), pt(tramo[1])));
      }
    }
    // Rótulo como el expediente, en tres renglones al centro: "ZAPATA CORRIDA / Hz / Df".
    const c = huella.reduce((acc, p) => ({x: acc.x + p.x / huella.length, y: acc.y + p.y / huella.length}), {x: 0, y: 0});
    const giro = Math.round((Math.atan2(u.y, u.x) * 1800) / Math.PI) / 10;
    const hr = MEDIDAS.columna; // 0.15, como "ZAPATA CORRIDA" del expediente
    ["ZAPATA CORRIDA", `Hz = ${o.espesorPlatea.toFixed(2)} m`, `Df = -${o.dfPlatea.toFixed(2)} m`].forEach((t, i) => {
      prim.push(text(L.PLATEA, pt({x: c.x - v.x * (i - 1) * hr * 1.5, y: c.y - v.y * (i - 1) * hr * 1.5}), t, hr, giro));
    });
    // Llamadas del acero de la platea con su flecha, como el expediente:
    // Ø3/4"@15cm SUPERIOR (malla de arriba) e INFERIOR (malla de abajo).
    const [v0, v1] = [Math.min(...huella.map((p) => dot(p, v))), Math.max(...huella.map((p) => dot(p, v)))];
    const [u0, u1] = [Math.min(...huella.map((p) => dot(p, u))), Math.max(...huella.map((p) => dot(p, u)))];
    const enPlatea = (fu, fv) => ({x: u.x * (u0 + (u1 - u0) * fu) + v.x * (v0 + (v1 - v0) * fv), y: u.y * (u0 + (u1 - u0) * fu) + v.y * (v0 + (v1 - v0) * fv)});
    const hl = MEDIDAS.rotulo;
    for (const [nombre, fu, fv] of [["SUPERIOR", 0.42, 0.8], ["INFERIOR", 0.3, 0.62]]) {
      const punta = enPlatea(fu, fv), codo = enPlatea(fu + 0.12, fv + 0.08);
      const fin = {x: codo.x + u.x * 0.15, y: codo.y + u.y * 0.15};
      prim.push(pline(L.ESTRIBOS, [pt(punta), pt(codo), pt(fin)]));
      // Flecha rellena en la punta.
      const d = sub(codo, punta), ld = len(d) || 1, a = {x: d.x / ld, y: d.y / ld}, nn = {x: -a.y, y: a.x};
      prim.push(hatch(L.ESTRIBOS, [pt(punta), pt({x: punta.x + a.x * 0.08 + nn.x * 0.02, y: punta.y + a.y * 0.08 + nn.y * 0.02}), pt({x: punta.x + a.x * 0.08 - nn.x * 0.02, y: punta.y + a.y * 0.08 - nn.y * 0.02})], {solido: true}));
      prim.push(text(L.ESTRIBOS, pt({x: fin.x + u.x * 0.04 + v.x * hl * 0.6, y: fin.y + u.y * 0.04 + v.y * hl * 0.6}), CRITERIOS.platea.acero.replace(/\s*@\s*0?\.15/, "@15cm"), hl, giro, "izq"));
      prim.push(text(L.ESTRIBOS, pt({x: fin.x + u.x * 0.04 - v.x * hl * 0.8, y: fin.y + u.y * 0.04 - v.y * hl * 0.8}), nombre, hl * 0.8, giro, "izq"));
    }
  } else {
    zapatas.forEach((z) => { z.medida = `${z.B.toFixed(2)}x${z.L.toFixed(2)}`; });
  }
  const tiposZapata = tipo === "zapatas" ? tiposPor(zapatas, (z) => z.medida, "Z") : [];
  if (tipo === "zapatas") {
    for (const z of zapatas) {
      prim.push(pline(L.ZAPATAS, [{x: z.x0, y: z.y0}, {x: z.x1, y: z.y0}, {x: z.x1, y: z.y1}, {x: z.x0, y: z.y1}].map(pt), true));
      prim.push(text(L.ZAPATAS, pt({x: z.x, y: z.y0 - h * 0.6}), z.tipo, h * 0.55));
    }
  }
  for (const t of cimientos) prim.push(banda(L.CIMIENTO, t.a, t.b, anchoCimiento));
  // Con platea no hay vigas de cimentación (la platea las reemplaza), como en el expediente.
  if (tipo === "platea") vigas.length = 0;
  for (const t of vigas) prim.push(banda(L.VIGAS_CIM, t.a, t.b, o.vigaB));
  prim.push(...rotularTramos(cimientos, L.CIMIENTO, `CC ${anchoCimiento.toFixed(2)}`, anchoCimiento, h));
  prim.push(...rotularTramos(vigas, L.VIGAS_CIM, `VC ${o.vigaB.toFixed(2)}x${o.vigaH.toFixed(2)}`, o.vigaB, h));

  const plural = (n, uno, varios) => `${n} ${n === 1 ? uno : varios}`;
  const notas = [
    ...(tipo === "platea" ? [`PLATEA e=${o.espesorPlatea.toFixed(2)} m bajo ${columnas.length} columnas`] : tiposZapata.map((t) => `${t.tipo}: ${t.medida} m, h=${o.peralteZapata.toFixed(2)} m (${t.cantidad})`)),
    ...(cimientos.length ? [`CC: cimiento corrido ${anchoCimiento.toFixed(2)} m (${plural(cimientos.length, "tramo", "tramos")})`] : []),
    ...(vigas.length ? [`VC: viga de cimentación ${o.vigaB.toFixed(2)}x${o.vigaH.toFixed(2)} m (${plural(vigas.length, "tramo", "tramos")})`] : []),
    `Df = -${(tipo === "platea" ? o.dfPlatea : o.df).toFixed(2)} m · f'c = 210 kg/cm²`,
    "Predimensionamiento: verificar con el estudio de suelos (EMS).",
  ];

  return {
    tipo, avisos, zapatas, tiposZapata, huella, anchoCimiento,
    df: tipo === "platea" ? o.dfPlatea : o.df, peralte: tipo === "platea" ? o.espesorPlatea : o.peralteZapata,
    cimientos: cimientos.length, vigas: vigas.length, muros: muros.length,
    contenido: {titulo: "PLANO DE CIMENTACIÓN", primitivas: [...base.primitivas, ...prim], marco: base.marco, ejes: base.ejes, h, notas},
  };
}

// Plano de cimiento corrido: cimiento bajo cada tramo de muro sobre los ejes, con su
// rótulo, además de ejes, columnas y cotas.
export function planoCimientoCorrido({lectura, items, caja, k = 1}, opciones = {}) {
  const o = {...CARGAS_POR_DEFECTO, ...CIMENTACION_POR_DEFECTO, ...opciones};
  const base = primitivasBase(lectura.ejes, lectura.columnas, {achurado: "solido"}); // columnas rellenas, como el expediente
  const {h} = base;
  const qLinea = o.pisos * ((o.cargaMuerta + o.cargaViva) * o.anchoTributario + o.pesoMuro * o.alturaPiso);
  // El expediente usa 0.60 x 0.80 como mínimo constructivo; si la carga pide más, más.
  const ancho = Math.max(CRITERIOS.cimientoCorrido.ancho, Math.ceil(((1.1 * qLinea) / o.qadm) / 0.05) * 0.05);
  const prim = [];
  const columnas = lectura.columnas;

  // 1-2. Muros de la arquitectura dentro del edificio (el expediente dibuja el cimiento
  //      corrido siguiendo los muros tal como están en la planta) y sus tramos.
  const {geometria, tramos, huella, centroide} = murosDelEdificio({columnas, items, k});
  for (const g of geometria) {
    prim.push(pline(L.MUROS_E, g.pts.map(pt), g.cerrada === true));
    // Muros bajos (bajo ventanas: tabiques, alféizares) achurados, como el expediente.
    if (g.cerrada && /tabique|bajo|alfeiz|parapet/i.test(g.capa ?? "") && g.pts.length >= 3) prim.push(hatch(L.MUROS_E, g.pts.map(pt), {patron: "ANSI31", escala: 0.2, angulo: 0}));
  }
  // 3. Rótulo "Cimiento corrido" dentro de cada ambiente, junto a su muro, y marcas de corte.
  const hr = MEDIDAS.rotulo;
  for (const t of tramos) {
    let ang = (Math.atan2(t.d.y, t.d.x) * 180) / Math.PI;
    if (ang > 90) ang -= 180; else if (ang <= -90) ang += 180;
    const m = {x: (t.a.x + t.b.x) / 2, y: (t.a.y + t.b.y) / 2};
    if (t.largo >= 0.9) {
      const sep = t.espesor / 2 + hr * 1.1;
      prim.push(text(L.CIMIENTO, pt({x: m.x + t.adentro.x * sep, y: m.y + t.adentro.y * sep}), "Cimiento corrido", hr, Math.round(ang * 10) / 10));
    }
    // Marca a un tercio del tramo (el rótulo va al centro): trazo y número a cada lado.
    const p = {x: t.a.x + (t.b.x - t.a.x) * 0.3, y: t.a.y + (t.b.y - t.a.y) * 0.3};
    for (const signo of [-1, 1]) {
      const s0 = signo * (t.espesor / 2 + 0.06), s1 = signo * (t.espesor / 2 + 0.3);
      const q = (s) => pt({x: p.x + t.adentro.x * s, y: p.y + t.adentro.y * s});
      prim.push(line(L.CORTE, q(s0), q(s1)));
      // Flecha rellena de la marca de corte (sentido de la vista), como el expediente.
      const f0 = {x: p.x + t.adentro.x * s1, y: p.y + t.adentro.y * s1}, f1 = {x: p.x + t.adentro.x * (s1 - signo * 0.1), y: p.y + t.adentro.y * (s1 - signo * 0.1)};
      prim.push(hatch(L.CORTE, [pt(f0), pt(f1), pt({x: (f0.x + f1.x) / 2 + t.d.x * 0.08, y: (f0.y + f1.y) / 2 + t.d.y * 0.08})], {solido: true}));
      const qt = {x: p.x + t.adentro.x * (s1 - signo * 0.05) - t.d.x * hr * 0.9, y: p.y + t.adentro.y * (s1 - signo * 0.05) - t.d.y * hr * 0.9};
      prim.push(text(L.CODIGOS, pt(qt), String(t.corte), hr * 1.1));
    }
  }

  // 4. Columnetas de confinamiento: contorno con aspa y su código (pa, pb…) por tamaño.
  const columnetas = opciones.columnetas ?? [];
  const codigos = new Map();
  // Medidas que difieren 3 cm o menos (dibujo a mano alzada) son la misma columneta.
  const medidas = [];
  const medidaDe = (c) => {
    const [m0, m1] = [c.b, c.h].sort((x, y) => x - y);
    const igual = medidas.find((m) => Math.abs(m.m0 - m0) <= 0.03 && Math.abs(m.m1 - m1) <= 0.03);
    if (igual) return igual.clave;
    const clave = `${m0.toFixed(2)}x${m1.toFixed(2)}`;
    medidas.push({m0, m1, clave});
    return clave;
  };
  for (const c of columnetas) {
    const clave = medidaDe(c);
    if (!codigos.has(clave)) codigos.set(clave, `p${String.fromCharCode(97 + codigos.size)}`);
    c.codigo = codigos.get(clave); // los pórticos lo rotulan igual
    prim.push(pline(L.COLUMNETAS, c.contorno.map(pt), true));
    const xs = c.contorno.map((q) => q.x), ys = c.contorno.map((q) => q.y);
    const x0 = Math.min(...xs), x1 = Math.max(...xs), y0 = Math.min(...ys), y1 = Math.max(...ys);
    prim.push(line(L.COLUMNETAS, pt({x: x0, y: y0}), pt({x: x1, y: y1})), line(L.COLUMNETAS, pt({x: x0, y: y1}), pt({x: x1, y: y0})));
    const haciaAdentro = sub(centroide, {x: c.x, y: c.y}), lh = len(haciaAdentro) || 1;
    const sep = Math.max(c.b, c.h) / 2 + hr * 0.9;
    prim.push(text(L.CODIGOS, pt({x: c.x + (haciaAdentro.x / lh) * sep, y: c.y + (haciaAdentro.y / lh) * sep}), codigos.get(clave), hr));
  }
  const avisos = [];
  if (!geometria.length) avisos.push("No encontré muros dentro del edificio: el plano de cimiento corrido quedó solo con columnas.");
  return {
    columnetas: [...codigos].map(([medida, codigo]) => ({codigo, medida})),
    tramos: tramos.length, ancho, avisos,
    cortes: [...new Set(tramos.map((t) => t.corte))].sort(),
    contenido: {
      titulo: "PLANO DE CIMIENTO CORRIDO", primitivas: [...base.primitivas, ...prim], marco: base.marco, ejes: base.ejes, h,
      notas: [`Cimiento corrido ${ancho.toFixed(2)} x ${CRITERIOS.cimientoCorrido.alto.toFixed(2)} m bajo todos los muros · ${CRITERIOS.concreto.cimientoCorrido}`],
    },
  };
}

// Muros del edificio leídos de la arquitectura: la geometría de muros dentro de la
// huella de las columnas (sin puertas, muebles, textos ni ejes), los vanos de puerta
// cerrados como en el expediente, y los tramos de muro clasificados en exteriores
// (corte 2-2, o 1-1 si tienen puerta) e interiores (corte 3-3).
export function murosDelEdificio({columnas, items, k = 1}) {
  const huella = envolvente(columnas.flatMap((c) => c.contorno));
  const zona = huella.length >= 3 ? desplazarPoligono(huella, 0.15) : huella;
  const enMetros = (p) => ({x: p.x / k, y: p.y / k});
  const geometria = [];
  for (const it of items) {
    if (it.tipo !== "linea" && it.tipo !== "poli") continue;
    if (CAPAS_NO_MURO_PLANTA.test(it.capa) || BLOQUES_NO_MURO.test(it.bloque ?? "")) continue;
    const pts = it.puntos.map(enMetros);
    if (!pts.every((p) => dentroConvexo(p, zona))) continue;
    geometria.push({pts, cerrada: it.cerrada, capa: it.capa});
  }
  const puertas = items.filter((it) => it.tipo !== "texto" && /puerta|door/i.test(it.bloque ?? "")).flatMap((it) => (it.puntos ?? [it.centro]).map(enMetros)).filter((p) => dentroConvexo(p, zona));
  geometria.push(...cerrarVanos(geometria, puertas));
  const tramos = tramosDeMuro(geometria);
  const centroide = huella.reduce((acc, p) => ({x: acc.x + p.x / huella.length, y: acc.y + p.y / huella.length}), {x: 0, y: 0});
  for (const t of tramos) {
    const m = {x: (t.a.x + t.b.x) / 2, y: (t.a.y + t.b.y) / 2};
    t.exterior = distanciaAlBorde(m, huella) < 0.5;
    t.conPuerta = puertas.some((p) => distSeg(p, t.a, t.b) < t.espesor / 2 + 0.25);
    t.corte = t.exterior ? (t.conPuerta ? 1 : 2) : 3;
    const n = {x: -t.d.y, y: t.d.x};
    t.adentro = dot(sub(centroide, m), n) >= 0 ? n : {x: -n.x, y: -n.y};
  }
  return {geometria, tramos, huella, centroide, puertas};
}

// Vanos de puerta: dos caras de muro alineadas con un hueco de 0.5–1.6 m donde hay
// una puerta se unen con una línea (el cimiento corrido pasa por debajo de la puerta).
function cerrarVanos(geometria, puertas) {
  if (!puertas.length) return [];
  const segs = [];
  for (const g of geometria) {
    const n = g.pts.length - 1 + (g.cerrada ? 1 : 0);
    for (let i = 0; i < n; i++) {
      const a = g.pts[i], b = g.pts[(i + 1) % g.pts.length], l = len(sub(b, a));
      if (l >= 0.1) segs.push({a, b, l, d: {x: (b.x - a.x) / l, y: (b.y - a.y) / l}});
    }
  }
  const nuevas = [];
  for (let i = 0; i < segs.length; i++) {
    for (let j = i + 1; j < segs.length; j++) {
      const s = segs[i], o = segs[j];
      if (Math.abs(dot(s.d, o.d)) < 0.9995) continue;
      const nrm = {x: -s.d.y, y: s.d.x};
      if (Math.abs(dot(sub(o.a, s.a), nrm)) > 0.01) continue;
      // Extremos enfrentados a lo largo de la recta.
      const ts = [dot(sub(s.a, s.a), s.d), s.l].sort((x, y) => x - y);
      const to = [dot(sub(o.a, s.a), s.d), dot(sub(o.b, s.a), s.d)].sort((x, y) => x - y);
      const [g0, g1] = ts[1] <= to[0] ? [ts[1], to[0]] : to[1] <= ts[0] ? [to[1], ts[0]] : [null, null];
      if (g0 === null || g1 - g0 < 0.5 || g1 - g0 > 1.6) continue;
      const P = (t) => ({x: s.a.x + s.d.x * t, y: s.a.y + s.d.y * t});
      const hayPuerta = puertas.some((p) => { const t = dot(sub(p, s.a), s.d); return t > g0 && t < g1 && Math.abs(dot(sub(p, s.a), nrm)) < 0.35; });
      if (!hayPuerta) continue;
      // Que el hueco no esté ya cerrado por otra cara.
      if (segs.some((x) => Math.abs(dot(x.d, s.d)) > 0.9995 && distSeg(P((g0 + g1) / 2), x.a, x.b) < 0.01)) continue;
      if (nuevas.some((x) => distSeg(P((g0 + g1) / 2), x.pts[0], x.pts[1]) < 0.01)) continue;
      nuevas.push({pts: [P(g0), P(g1)], cerrada: false});
    }
  }
  return nuevas;
}

// Capas y bloques que no son muro en una planta de arquitectura.
const CAPAS_NO_MURO_PLANTA = /mobil|equip|mueble|texto|text|cota|acot|dim|eje|axis|grid|corte|proyecc|piso|area|achur|hatch|textur|tablero|indicador|cuadro|fachada|puerta|door|aparato|sanit|vano|col|estruc|nivel|^E-/i;
const BLOQUES_NO_MURO = /puerta|door|ventana|window|mueble|mobil|equip|sanit|aparato|inodoro|lavat/i;

function dentroConvexo(p, poligono) {
  if (poligono.length < 3) return true;
  let signo = 0;
  for (let i = 0; i < poligono.length; i++) {
    const a = poligono[i], b = poligono[(i + 1) % poligono.length];
    const c = (b.x - a.x) * (p.y - a.y) - (b.y - a.y) * (p.x - a.x);
    if (Math.abs(c) < 1e-9) continue;
    if (!signo) signo = Math.sign(c); else if (Math.sign(c) !== signo) return false;
  }
  return true;
}

const distanciaAlBorde = (p, poligono) => Math.min(...poligono.map((a, i) => distSeg(p, a, poligono[(i + 1) % poligono.length])));

// Tramos de muro a partir de la geometría: dos caras paralelas (±3°) separadas 8–45 cm
// que comparten al menos 40 cm. Devuelve el eje del muro (a, b), su dirección y espesor.
export function tramosDeMuro(geometria) {
  const segs = [];
  for (const g of geometria) {
    const n = g.pts.length - 1 + (g.cerrada ? 1 : 0);
    for (let i = 0; i < n; i++) {
      const a = g.pts[i], b = g.pts[(i + 1) % g.pts.length], l = len(sub(b, a));
      if (l >= 0.4) segs.push({a, b, l, d: {x: (b.x - a.x) / l, y: (b.y - a.y) / l}});
    }
  }
  const tramos = [];
  for (let i = 0; i < segs.length; i++) {
    for (let j = i + 1; j < segs.length; j++) {
      const s = segs[i], o = segs[j];
      if (Math.abs(dot(s.d, o.d)) < Math.cos((3 * Math.PI) / 180)) continue;
      const nrm = {x: -s.d.y, y: s.d.x};
      const e = dot(sub(o.a, s.a), nrm);
      if (Math.abs(e) < 0.08 || Math.abs(e) > 0.45) continue;
      const t0 = Math.max(0, Math.min(dot(sub(o.a, s.a), s.d), dot(sub(o.b, s.a), s.d)));
      const t1 = Math.min(s.l, Math.max(dot(sub(o.a, s.a), s.d), dot(sub(o.b, s.a), s.d)));
      if (t1 - t0 < 0.4) continue;
      const base = {x: s.a.x + nrm.x * e / 2, y: s.a.y + nrm.y * e / 2};
      tramos.push({a: {x: base.x + s.d.x * t0, y: base.y + s.d.y * t0}, b: {x: base.x + s.d.x * t1, y: base.y + s.d.y * t1}, d: s.d, largo: t1 - t0, espesor: Math.abs(e)});
    }
  }
  // Un muro se ve varias veces (tarrajeo, caras repetidas): se queda el tramo más largo de cada grupo.
  tramos.sort((a, b) => b.largo - a.largo);
  const unicos = [];
  for (const t of tramos) {
    const m = {x: (t.a.x + t.b.x) / 2, y: (t.a.y + t.b.y) / 2};
    const repetido = unicos.some((u) => Math.abs(dot(u.d, t.d)) > 0.99 && distSeg(m, u.a, u.b) < Math.max(u.espesor, t.espesor) * 0.9 + 0.05);
    if (!repetido) unicos.push(t);
  }
  return unicos;
}
