// Detalles adaptados desde la biblioteca de detalles del despacho (fase 2d): cortes de cimiento
// corrido, escalera y cuadros de columnas y columnetas.
//
// La biblioteca (scripts/agente/extraer-biblioteca.mjs) guarda cada detalle que dibujó el
// ingeniero en coordenadas locales: cortes y escaleras en metros reales (y = 0 en ±0.00 en los
// cortes), cuadros en unidades de su dibujo (× dibujo.factor = unidades de lámina, 1 = 1 m a 1/50).
// Como porticoBiblioteca.js, cada tipo tiene:
//
// - elegir…(destino, piezas): la pieza más parecida (o null: entonces queda el generador);
// - adaptar…(pieza, destino): la pieza llevada a las medidas del destino.
//
// Corte de cimiento: el cuerpo del cimiento (las dos verticales que nacen en el fondo y su tapa)
//   se estira por franjas al ancho y al peralte del destino; lo de los lados y lo de arriba
//   (sobrecimiento, muro, pisos) se traslada rígido. Niveles (N.F.C., N.P.T.) y cotas se reescriben.
// Escalera: la rampa de peldaños se regenera con el número de pasos, el paso y el contrapaso del
//   destino; garganta, acero y apoyos se estiran por franjas con la rampa.
// Cuadros: la rejilla del despacho (columna de rótulos, filas, título) con una columna por tipo
//   del destino; cada celda lleva el contenido que generó el agente (sección, refuerzo,
//   despiece), nunca el del origen. Los valores (f'c, niveles, escala, título) son los del destino.
//
// Todo devuelve primitivas (line/pline/circle/text) con las capas y colores del ingeniero en lo
// que viene de la pieza.

import {CAPAS_DESPACHO} from "../criterios/estiloLaminas.js";
import {porTramos, excluida} from "../planos/porticoBiblioteca.js";
import {CRITERIOS_ESCALERA} from "../planos/escaleraPlano.js";

const r4 = (v) => Math.round(v * 10000) / 10000;
const CAPA_CANONICA = new Map(Object.keys(CAPAS_DESPACHO).map((c) => [c.toLowerCase(), c]));
const capaDe = (e) => { const c = e.capa ?? "0"; return CAPA_CANONICA.get(c.toLowerCase()) ?? c; };
const P = (q) => (Array.isArray(q) ? {x: q[0], y: q[1]} : q);
const SIN_DIBUJO = /texto|text|cota|acot|dim|eje|axis|titul|rotulo|lamina|cuadro|niveles?$/i;
const mediana = (xs) => { const a = xs.filter(Number.isFinite).sort((p, q) => p - q); if (!a.length) return null; const m = a.length >> 1; return a.length % 2 ? a[m] : (a[m - 1] + a[m]) / 2; };
const color = (e) => (Number.isInteger(e.color) ? {color: e.color} : {});
const sinAcentos = (t) => String(t ?? "").normalize("NFD").replace(/[̀-ͯ]/g, "");

export {excluida};

// Segmentos [a, b] de líneas y polilíneas de la pieza (con el cierre).
function segmentos(ents, filtro = () => true) {
  const s = [];
  for (const e of ents ?? []) {
    if ((e.tipo !== "linea" && e.tipo !== "poli") || !filtro(e) || (e.puntos?.length ?? 0) < 2) continue;
    for (let i = 1; i < e.puntos.length; i++) s.push([e.puntos[i - 1], e.puntos[i]]);
    if (e.cerrada && e.puntos.length > 2) s.push([e.puntos.at(-1), e.puntos[0]]);
  }
  return s;
}

// Pieza → primitivas con funciones de x y de y (texto: función opcional que reescribe o quita).
function aPrimitivas(ents, fx, fy, {texto = (e) => e.texto, quitar = () => false, escala = 1} = {}) {
  const Q = (q) => [r4(fx(q.x)), r4(fy(q.y))];
  const prim = [];
  for (const e of ents ?? []) {
    if (quitar(e)) continue;
    if (e.tipo === "texto") {
      const v = texto(e);
      if (v === null || v === undefined || !String(v).trim()) continue;
      prim.push({type: "text", layer: capaDe(e), at: Q(e.centro), value: String(v), h: r4((e.alto ?? 0.1) * escala), rot: 0, ...color(e)});
    } else if (e.tipo === "linea" || e.tipo === "poli") {
      if (!(e.puntos?.length >= 2)) continue;
      const pts = e.puntos.map(Q);
      if (e.tipo === "linea" && pts.length === 2) prim.push({type: "line", layer: capaDe(e), a: pts[0], b: pts[1], ...color(e)});
      else prim.push({type: "pline", layer: capaDe(e), points: pts, closed: Boolean(e.cerrada), ...color(e)});
    } else if (e.tipo === "circulo") {
      prim.push({type: "circle", layer: capaDe(e), c: Q(e.centro), r: r4(e.radio * escala), ...color(e)});
    } else if (e.tipo === "achurado" && e.puntos?.length >= 3) {
      // Concreto, relleno, falso piso… como el ingeniero: el contorno sigue al detalle adaptado.
      prim.push({type: "hatch", layer: capaDe(e), points: e.puntos.map(Q), ...(e.solido ? {solido: true} : {patron: e.patron ?? "ANSI31", escala: r4(((e.escalaMil ?? 1000) / 1000) * escala), angulo: e.angulo ?? 0}), ...color(e)});
    }
  }
  return prim;
}

export function cajaPrimitivas(prims) {
  const c = {x0: Infinity, y0: Infinity, x1: -Infinity, y1: -Infinity};
  const add = (q) => { c.x0 = Math.min(c.x0, q[0]); c.x1 = Math.max(c.x1, q[0]); c.y0 = Math.min(c.y0, q[1]); c.y1 = Math.max(c.y1, q[1]); };
  for (const p of prims) {
    if (p.type === "line") { add(p.a); add(p.b); }
    else if (p.type === "pline" || p.type === "hatch") p.points.forEach(add);
    else if (p.type === "circle") { add([p.c[0] - p.r, p.c[1] - p.r]); add([p.c[0] + p.r, p.c[1] + p.r]); }
    else if (p.type === "text") add(p.at);
  }
  return Number.isFinite(c.x0) ? c : {x0: 0, y0: 0, x1: 1, y1: 1};
}

// Mismo formato que el original: signo, separador decimal y número de decimales.
const NUMERO = /([+\-−±]?)\s*(\d*)[.,](\d+)/;
function conValor(texto, valor) {
  return String(texto).replace(NUMERO, (m, signo, ent, dec) => {
    let v = Math.abs(valor).toFixed(dec.length);
    if (!ent) v = v.replace(/^0(?=\.)/, "");
    const num = m.includes(",") ? v.replace(".", ",") : v;
    const espacio = m.slice(signo.length).match(/^\s*/)[0];
    const s = Number(v) === 0 ? signo : valor < 0 ? (signo === "−" ? "−" : "-") : signo ? "+" : "";
    return `${s}${s ? espacio : ""}${num}`;
  });
}

// Cota de la pieza: la línea horizontal o vertical cerca del texto con su mismo largo.
function lineaDeCota(e, valor, segs) {
  let mejor = null;
  const t = e.centro, alcance = Math.max(0.15, (e.alto ?? 0.1) * 3);
  for (const [a, b] of segs) {
    const l = Math.hypot(b.x - a.x, b.y - a.y);
    if (Math.abs(l - valor) > Math.max(0.015, valor * 0.02)) continue;
    const hz = Math.abs(b.y - a.y) < 0.01, vt = Math.abs(b.x - a.x) < 0.01;
    if (!hz && !vt) continue;
    const d = hz ? (t.x >= Math.min(a.x, b.x) && t.x <= Math.max(a.x, b.x) ? Math.abs(t.y - a.y) : Infinity)
      : (t.y >= Math.min(a.y, b.y) && t.y <= Math.max(a.y, b.y) ? Math.abs(t.x - a.x) : Infinity);
    if (d <= alcance && (!mejor || d < mejor.d)) mejor = {a, b, d};
  }
  return mejor;
}
const COTA = /^\s*\d{0,2}[.,]\d{2}\s*m?\s*$/;
const cotaRecalculada = (e, segs, fx, fy) => {
  const v = Number(String(e.texto).trim().replace(/m$/, "").replace(",", "."));
  const l = lineaDeCota(e, v, segs);
  if (!l) return null;
  const nuevo = Math.hypot(fx(l.b.x) - fx(l.a.x), fy(l.b.y) - fy(l.a.y));
  return Math.abs(nuevo - v) > 0.005 ? conValor(e.texto, nuevo) : e.texto;
};

// Elección genérica: la pieza no excluida de mayor puntaje sobre el mínimo.
function elegir(destino, piezas, parecido, {excluir = null, minimo = 0.4} = {}) {
  let mejor = null;
  for (const pieza of piezas ?? []) {
    if (excluida(pieza, excluir)) continue;
    let p = null;
    try { p = parecido(destino, pieza); } catch { p = null; }
    if (p && p.puntaje >= minimo && (!mejor || p.puntaje > mejor.puntaje)) mejor = {pieza, ...p};
  }
  return mejor;
}
const nombrePieza = (p) => p.archivo ?? p.huella ?? p.titulo;

// =======================================================================================
// Corte de cimiento corrido.
// =======================================================================================

const cacheCorte = new WeakMap();
const NIVEL_TXT = /\bN\s*\.?\s*([PFT])\s*\.?\s*([A-Z])\s*\.?(?![A-Z])/;

// Cuerpo del cimiento: verticales que nacen en el fondo, su tapa y el muro que cargan.
export function analizarCorte(pieza) {
  if (cacheCorte.has(pieza)) return cacheCorte.get(pieza);
  let r = null;
  const fondo = (pieza.niveles ?? []).find((n) => /^NF[CZ]$/.test(n.sigla) && Number.isFinite(n.y));
  if (pieza.tipo === "corte_cimiento" && fondo) {
    const segs = segmentos(pieza.entidades, (e) => !SIN_DIBUJO.test(e.capa ?? ""));
    const hor = [], vert = [];
    for (const [a, b] of segs) {
      if (Math.abs(a.y - b.y) < 0.004 && Math.abs(a.x - b.x) > 0.1) hor.push({y: (a.y + b.y) / 2, x0: Math.min(a.x, b.x), x1: Math.max(a.x, b.x)});
      else if (Math.abs(a.x - b.x) < 0.004 && Math.abs(a.y - b.y) > 0.03) vert.push({x: (a.x + b.x) / 2, y0: Math.min(a.y, b.y), y1: Math.max(a.y, b.y)});
    }
    // Fondo: la horizontal larga más cercana a la marca N.F.C. (la marca no siempre cae en la línea).
    const largas = hor.filter((h) => h.x1 - h.x0 > 0.3 && Math.abs(h.y - fondo.y) < 0.2).sort((a, b) => Math.abs(a.y - fondo.y) - Math.abs(b.y - fondo.y));
    const yF = largas[0]?.y ?? fondo.y;
    const base = vert.filter((v) => Math.abs(v.y0 - yF) < 0.04 && v.y1 - yF > 0.25);
    const xs = [...new Set(base.map((v) => Math.round(v.x / 0.005) * 0.005))].sort((a, b) => a - b);
    // Muro: lo más alto del corte (ladrillos sobre el piso).
    const techo = vert.length ? Math.max(...vert.map((v) => v.y1)) : null;
    const sobre = techo != null ? vert.filter((v) => v.y1 > techo - 0.5 && v.y1 > yF + 1.0) : [];
    const muro = sobre.length >= 2 ? {x0: Math.min(...sobre.map((v) => v.x)), x1: Math.max(...sobre.map((v) => v.x))} : null;
    const xMuro = muro ? (muro.x0 + muro.x1) / 2 : null;
    let mejor = null;
    for (let i = 0; i < xs.length; i++) for (let j = i + 1; j < xs.length; j++) {
      const w = xs[j] - xs[i];
      if (w < 0.2 || w > 2.5) continue;
      if (xMuro != null && !(xs[i] - 0.01 <= xMuro && xMuro <= xs[j] + 0.01)) continue;
      const cima = Math.min(...base.filter((v) => Math.abs(v.x - xs[i]) < 0.006 || Math.abs(v.x - xs[j]) < 0.006).map((v) => v.y1));
      const tapa = hor.filter((h) => h.y > yF + 0.2 && h.y <= cima + 0.01 && Math.min(h.x1, xs[j]) - Math.max(h.x0, xs[i]) >= 0.5 * w).sort((a, b) => a.y - b.y)[0];
      if (!tapa || tapa.y - yF > 2) continue;
      if (!mejor || w < mejor.ancho) mejor = {xa: xs[i], xb: xs[j], ancho: w, yTapa: tapa.y};
    }
    if (mejor) {
      const textos = (pieza.entidades ?? []).filter((e) => e.tipo === "texto").map((e) => sinAcentos(e.texto).toUpperCase());
      r = {
        // Muro y sobrecimiento sobre el cuerpo (no se deforman al ensanchar el cimiento).
        muro: muro && muro.x1 - muro.x0 < mejor.ancho + 0.01 ? {x0: Math.max(muro.x0, mejor.xa), x1: Math.min(muro.x1, mejor.xb)} : null,
        yFondo: yF, cotaFondo: fondo.cota, ...mejor, peralte: mejor.yTapa - yF, cotaTapa: fondo.cota + (mejor.yTapa - yF),
        // Interior: piso a los dos lados del muro (el ingeniero rotula INTERIOR dos veces).
        interior: textos.filter((t) => /\bINTERIOR\b/.test(t)).length >= 2,
        npt: (pieza.niveles ?? []).filter((n) => n.sigla === "NPT").map((n) => n.cota).sort((a, b) => b - a)[0] ?? null,
      };
    }
  }
  cacheCorte.set(pieza, r);
  return r;
}

const desvio = (a, b) => Math.abs(Math.log(b / a));

// destino: {numero, interior, ancho, peralte, cotaFondo, npt}
export function parecidoCorte(destino, pieza) {
  if (pieza.tipo && pieza.tipo !== "corte_cimiento") return null;
  const a = analizarCorte(pieza);
  if (!a) return null;
  if (destino.interior != null && a.interior !== Boolean(destino.interior)) return null;
  const sAncho = Math.exp(-2 * desvio(a.ancho, destino.ancho ?? a.ancho));
  const sPeralte = Math.exp(-2 * desvio(a.peralte, destino.peralte ?? a.peralte));
  const sFondo = Math.exp(-2 * Math.abs((destino.cotaFondo ?? a.cotaFondo) - a.cotaFondo));
  const dudas = (pieza.dudas ?? []).length;
  const puntaje = 0.45 * sAncho + 0.35 * sPeralte + 0.2 * sFondo - 0.1 * Math.min(2, dudas);
  return {puntaje: r4(puntaje), porque: [
    `corte ${a.interior ? "interior" : "exterior"}, como el destino`,
    `cimiento ${a.ancho.toFixed(2)}x${a.peralte.toFixed(2)} → ${(destino.ancho ?? a.ancho).toFixed(2)}x${(destino.peralte ?? a.peralte).toFixed(2)}`,
    `N.F.C. ${a.cotaFondo.toFixed(2)} → ${(destino.cotaFondo ?? a.cotaFondo).toFixed(2)}`,
  ]};
}

export const elegirCorte = (destino, piezas, opciones) => elegir(destino, piezas, parecidoCorte, opciones);

export function adaptarCorte(pieza, destino) {
  const a = analizarCorte(pieza);
  if (!a) throw new Error("corte sin cimiento medible");
  const ancho = destino.ancho ?? a.ancho, peralte = destino.peralte ?? a.peralte;
  const cotaFondo = destino.cotaFondo ?? a.cotaFondo, cotaTapa = cotaFondo + peralte;
  // x: el cuerpo se ensancha por igual a los dos lados (el muro sigue al centro).
  // El muro queda donde está y el ancho que falta (o sobra) se reparte entre los dos lados libres
  // del cuerpo, en proporción a lo que ya tenían (un muro al borde crece hacia un solo lado).
  const extra = ancho - a.ancho;
  const m = a.muro ?? {x0: (a.xa + a.xb) / 2, x1: (a.xa + a.xb) / 2};
  const libreI = Math.max(0, m.x0 - a.xa), libreD = Math.max(0, a.xb - m.x1), libre = libreI + libreD || 1;
  const anclas = [];
  if (libreI > 0.01) anclas.push({p: a.xa, d: a.xa - (extra * libreI) / libre});
  anclas.push({p: m.x0, d: m.x0, r: m.x1 - m.x0});
  if (libreD > 0.01) anclas.push({p: a.xb, d: a.xb + (extra * libreD) / libre});
  anclas.forEach((u, i) => { u.l = i === 0 ? Infinity : 0; u.r = i === anclas.length - 1 ? Infinity : u.r ?? 0; });
  const fx = porTramos(anclas);
  // y: bajo el fondo y sobre la tapa, traslación; entre ambos, el peralte del destino.
  const dF = cotaFondo - a.cotaFondo, dT = cotaTapa - a.cotaTapa;
  const fy = porTramos([{p: a.yFondo, d: a.yFondo + dF, l: Infinity, r: 0}, {p: a.yTapa, d: a.yTapa + dT, l: 0, r: Infinity}]);
  const segs = segmentos(pieza.entidades);
  const reemplazos = {niveles: 0, cotas: 0, titulo: 0, quitadas: 0};
  const texto = (e) => {
    const t = String(e.texto ?? "");
    const u = sinAcentos(t).toUpperCase();
    if (/^\s*CORTE\s+\S+\s*[-–]\s*\S+\s*$/.test(u) && destino.numero != null) { reemplazos.titulo++; return `CORTE ${destino.numero}-${destino.numero}`; }
    const m = NIVEL_TXT.exec(u);
    if (m && NUMERO.test(t)) {
      const sigla = `N${m[1]}${m[2]}`;
      if (/^NF[CZ]$/.test(sigla)) { reemplazos.niveles++; return conValor(t, cotaFondo); }
      if (sigla === "NPT" && destino.npt != null) { reemplazos.niveles++; return conValor(t, destino.npt); }
      return t;
    }
    if (COTA.test(t)) {
      const nuevo = cotaRecalculada(e, segs, fx, fy);
      if (nuevo === null) return t;
      if (nuevo !== t) reemplazos.cotas++;
      return nuevo;
    }
    return t;
  };
  const primitivas = aPrimitivas(pieza.entidades, fx, fy, {texto});
  return {
    contenido: {titulo: destino.numero != null ? `CORTE ${destino.numero}-${destino.numero}` : pieza.titulo, primitivas, marco: cajaPrimitivas(primitivas), h: 0.1, notas: []},
    reemplazos,
  };
}

// =======================================================================================
// Escalera.
// =======================================================================================

const cacheEscalera = new WeakMap();

// Rampas de peldaños: tramos alternados de contrapaso (vertical 0.12–0.22) y paso
// (horizontal 0.20–0.40) en una misma polilínea o en líneas encadenadas.
function rampas(ents) {
  const segs = [];
  for (const e of ents ?? []) {
    if ((e.tipo !== "linea" && e.tipo !== "poli") || SIN_DIBUJO.test(e.capa ?? "")) continue;
    const pts = e.puntos ?? [];
    for (let i = 1; i < pts.length; i++) segs.push({a: pts[i - 1], b: pts[i]});
  }
  const clase = (s) => {
    const dx = Math.abs(s.b.x - s.a.x), dy = Math.abs(s.b.y - s.a.y);
    if (dx < 0.003 && dy >= 0.12 && dy <= 0.23) return "cp";
    if (dy < 0.003 && dx >= 0.18 && dx <= 0.42) return "p";
    return null;
  };
  const utiles = segs.map((s) => ({...s, c: clase(s)})).filter((s) => s.c);
  // Encadena por extremos comunes (±5 mm): grafo de segmentos útiles.
  const clave = (q) => `${Math.round(q.x / 0.005)},${Math.round(q.y / 0.005)}`;
  const porPunto = new Map();
  utiles.forEach((s, i) => { for (const q of [s.a, s.b]) { const k = clave(q); if (!porPunto.has(k)) porPunto.set(k, []); porPunto.get(k).push(i); } });
  const usado = new Set();
  const salida = [];
  for (let i = 0; i < utiles.length; i++) {
    if (usado.has(i) || utiles[i].c !== "cp") continue;
    // Cadena alternada que contiene i (crece por ambos extremos).
    const cadena = [i];
    usado.add(i);
    for (const lado of [0, 1]) {
      let actual = i, extremo = lado ? utiles[i].b : utiles[i].a;
      for (;;) {
        const vecinos = (porPunto.get(clave(extremo)) ?? []).filter((j) => !usado.has(j) && utiles[j].c !== utiles[actual].c);
        if (vecinos.length !== 1) break;
        const j = vecinos[0];
        usado.add(j);
        if (lado) cadena.push(j); else cadena.unshift(j);
        const s = utiles[j];
        extremo = clave(s.a) === clave(extremo) ? s.b : s.a;
        actual = j;
      }
    }
    const cps = cadena.filter((j) => utiles[j].c === "cp");
    if (cps.length < 3) continue;
    const pts = cadena.flatMap((j) => [utiles[j].a, utiles[j].b]);
    const xs = pts.map((q) => q.x), ys = pts.map((q) => q.y);
    const caja = {x0: Math.min(...xs), x1: Math.max(...xs), y0: Math.min(...ys), y1: Math.max(...ys)};
    // Sentido de subida: x del punto más bajo vs. del más alto.
    const bajo = pts.reduce((m, q) => (q.y < m.y ? q : m)), alto = pts.reduce((m, q) => (q.y > m.y ? q : m));
    const sx = Math.sign(alto.x - bajo.x) || 1;
    const riser = cps.map((j) => utiles[j]), tread = cadena.filter((j) => utiles[j].c === "p").map((j) => utiles[j]);
    const xr = riser.map((s) => s.a.x).sort((p, q) => sx * (p - q));
    salida.push({
      n: cps.length, cp: mediana(riser.map((s) => Math.abs(s.b.y - s.a.y))), paso: mediana(tread.map((s) => Math.abs(s.b.x - s.a.x))) ?? 0.3,
      sx, caja, xIni: xr[0], xFin: xr.at(-1), yIni: caja.y0, yFin: caja.y1,
      claves: new Set(cadena.flatMap((j) => [`${clave(utiles[j].a)}|${clave(utiles[j].b)}`, `${clave(utiles[j].b)}|${clave(utiles[j].a)}`])),
    });
  }
  return salida.sort((p, q) => q.n - p.n);
}

export function analizarEscalera(pieza) {
  if (cacheEscalera.has(pieza)) return cacheEscalera.get(pieza);
  let r = null;
  if (pieza.tipo === "escalera") {
    const rs = rampas(pieza.entidades);
    const principal = rs[0];
    if (principal) {
      // La misma rampa dibujada dos veces (contorno y acabado, a 1 cm) es un solo tramo.
      const solape = (p, q) => {
        const w = Math.min(p.x1, q.x1) - Math.max(p.x0, q.x0), h = Math.min(p.y1, q.y1) - Math.max(p.y0, q.y0);
        return w > 0 && h > 0 ? (w * h) / Math.min((p.x1 - p.x0) * (p.y1 - p.y0), (q.x1 - q.x0) * (q.y1 - q.y0)) : 0;
      };
      const grupo = rs.filter((x) => solape(x.caja, principal.caja) > 0.6 && x.sx === principal.sx);
      // Otro tramo largo dibujado aparte (detalle de dos tramos): no se sabe cuál adaptar.
      const otros = rs.filter((x) => !grupo.includes(x) && x.n >= Math.max(3, 0.6 * principal.n));
      // Zona del detalle: la rampa con su descanso y apoyos. La caja de la biblioteca a veces trae
      // detalles vecinos (cisterna, nudos): lo que cae fuera no se copia.
      // Descanso: la horizontal que sale del último contrapaso, en el sentido de subida.
      let descanso = null;
      for (const [p, q] of segmentos(pieza.entidades, (e) => !SIN_DIBUJO.test(e.capa ?? ""))) {
        if (Math.abs(p.y - q.y) > 0.005 || Math.abs(p.y - principal.yFin) > 0.02) continue;
        const [cerca, lejos] = Math.abs(p.x - principal.xFin) < Math.abs(q.x - principal.xFin) ? [p, q] : [q, p];
        const largo = principal.sx * (lejos.x - principal.xFin);
        if (Math.abs(cerca.x - principal.xFin) < 0.05 && largo >= 0.5 && largo <= 4 && (!descanso || largo > descanso)) descanso = largo;
      }
      // Hacia donde sube, el descanso y 0.6 m más; hacia el pie, 1 m (apoyo); 0.8 m arriba y abajo.
      const sube = (descanso ?? 0.6) + 0.6, pie = 1.0, c = principal.caja;
      const zona = principal.sx > 0 ? {x0: c.x0 - pie, x1: c.x1 + sube, y0: c.y0 - 0.8, y1: c.y1 + 0.8} : {x0: c.x0 - sube, x1: c.x1 + pie, y0: c.y0 - 0.8, y1: c.y1 + 0.8};
      if (!otros.length) r = {...principal, grupo, rampas: rs.length, zona, descanso};
    }
  }
  cacheEscalera.set(pieza, r);
  return r;
}

// destino: {porTramo, paso, cp (o cpExacto), ancho, nombre}
export function parecidoEscalera(destino, pieza) {
  if (pieza.tipo && pieza.tipo !== "escalera") return null;
  const a = analizarEscalera(pieza);
  if (!a) return null;
  const n = destino.porTramo, cp = destino.cpExacto ?? destino.cp, p = destino.paso;
  if (!(n > 1 && cp > 0 && p > 0)) return null;
  if (!(n / a.n > 0.35 && n / a.n < 2.8)) return null;
  const sN = Math.exp(-desvio(a.n, n)), sP = Math.exp(-4 * desvio(a.paso, p)), sCp = Math.exp(-4 * desvio(a.cp, cp));
  const sD = a.descanso ? Math.exp(-desvio(a.descanso, destino.descanso ?? CRITERIOS_ESCALERA.descanso)) : 0.5;
  const dudas = (pieza.dudas ?? []).length;
  const puntaje = 0.4 * sN + 0.2 * sP + 0.2 * sCp + 0.2 * sD - 0.05 * Math.min(2, dudas);
  return {puntaje: r4(puntaje), porque: [`${a.n} contrapasos → ${n}`, `paso ${a.paso.toFixed(2)} → ${p.toFixed(2)}`, `contrapaso ${a.cp.toFixed(3)} → ${cp.toFixed(3)}`]};
}

export const elegirEscalera = (destino, piezas, opciones) => elegir(destino, piezas, parecidoEscalera, opciones);

export function adaptarEscalera(pieza, destino) {
  const a = analizarEscalera(pieza);
  if (!a) throw new Error("escalera sin rampa de peldaños");
  const n = destino.porTramo, cp = destino.cpExacto ?? destino.cp, p = destino.paso;
  // La rampa: del primer contrapaso al último (x) y del pie al último peldaño (y).
  const W = Math.abs(a.xFin - a.xIni), Wd = (n - 1) * p, H = a.yFin - a.yIni, Hd = n * cp;
  const xFinD = a.xIni + a.sx * Wd;
  // x: el pie de la rampa queda, la rampa toma (n − 1) pasos del destino y el descanso su largo.
  const descanso = destino.descanso ?? CRITERIOS_ESCALERA.descanso;
  const anclasX = [{p: a.xIni, d: a.xIni}, {p: a.xFin, d: xFinD}];
  if (a.descanso) anclasX.push({p: a.xFin + a.sx * a.descanso, d: xFinD + a.sx * descanso});
  anclasX.sort((u, v) => u.p - v.p).forEach((u, i, xs) => { u.l = i === 0 ? Infinity : 0; u.r = i === xs.length - 1 ? Infinity : 0; });
  const fx = W > 1e-6 ? porTramos(anclasX) : (x) => x;
  const fy = porTramos([{p: a.yIni, d: a.yIni, l: Infinity, r: 0}, {p: a.yFin, d: a.yIni + Hd, l: 0, r: Infinity}]);
  const segs = segmentos(pieza.entidades);
  const reemplazos = {peldanos: 0, textos: 0, cotas: 0};
  // La polilínea de la rampa se rehace: lo de antes y después de la rampa se transforma; la rampa,
  // n contrapasos y n − 1 pasos del destino desde el pie.
  const clave = (q) => `${Math.round(q.x / 0.005)},${Math.round(q.y / 0.005)}`;
  const rampaDe = (q, r) => a.grupo.find((x) => x.claves.has(`${clave(q)}|${clave(r)}`)) ?? null;
  const esDeRampa = (q, r) => rampaDe(q, r) !== null;
  const prim = [];
  const Q = (q) => [r4(fx(q.x)), r4(fy(q.y))];
  // Cada rampa del grupo (la misma, dibujada dos veces) se rehace desde su pie transformado.
  const escalones = (rr) => {
    const out = [], nr = Math.max(2, n + rr.n - a.n);
    let x = fx(rr.xIni), y = fy(rr.yIni);
    out.push([r4(x), r4(y)]);
    for (let i = 0; i < nr; i++) {
      y += cp; out.push([r4(x), r4(y)]);
      if (i < nr - 1) { x += a.sx * p; out.push([r4(x), r4(y)]); }
    }
    return out;
  };
  const hechas = new Set();
  // Fuera de la zona: el centro de su caja cae fuera (el contorno de la rampa con su apoyo puede
  // salir un poco de la zona y sigue siendo de la escalera).
  const fuera = (e) => {
    if (e.tipo === "texto" && /ESCALERA/i.test(e.texto ?? "") && String(e.texto).length < 60) return false;
    const ps = e.puntos ?? [e.centro];
    const cx = (Math.min(...ps.map((q) => q.x)) + Math.max(...ps.map((q) => q.x))) / 2, cy = (Math.min(...ps.map((q) => q.y)) + Math.max(...ps.map((q) => q.y))) / 2;
    return cx < a.zona.x0 || cx > a.zona.x1 || cy < a.zona.y0 || cy > a.zona.y1;
  };
  const quitar = (e) => {
    if (fuera(e)) return true;
    if (e.tipo !== "linea" && e.tipo !== "poli") return false;
    const ps = e.puntos ?? [];
    const tocadas = new Set();
    for (let i = 1; i < ps.length; i++) { const rr = rampaDe(ps[i - 1], ps[i]); if (rr) tocadas.add(rr); }
    if (!tocadas.size) return false;
    // Partes de la polilínea fuera de la rampa (descanso, arranque) se conservan transformadas.
    const tramos = [];
    let actual = [];
    for (let i = 1; i < ps.length; i++) {
      if (esDeRampa(ps[i - 1], ps[i])) { if (actual.length >= 2) tramos.push(actual); actual = []; continue; }
      if (!actual.length) actual.push(ps[i - 1]);
      actual.push(ps[i]);
    }
    if (actual.length >= 2) tramos.push(actual);
    for (const t of tramos) prim.push({type: "pline", layer: capaDe(e), points: t.map(Q), closed: false, ...color(e)});
    for (const rr of tocadas) {
      if (hechas.has(rr)) continue;
      hechas.add(rr);
      prim.push({type: "pline", layer: capaDe(e), points: escalones(rr), closed: false, ...color(e)});
      reemplazos.peldanos = n;
    }
    return true;
  };
  const texto = (e) => {
    const t = String(e.texto ?? "");
    const u = sinAcentos(t).toUpperCase();
    if (/ESCALERA/.test(u) && destino.nombre && t.length < 60) { reemplazos.textos++; return u.includes("DETALLE") ? `DETALLE DE ESCALERA ${destino.nombre}` : t; }
    // Paso y contrapaso escritos ("P = 0.30  C.P. = 0.175"): los del destino.
    const v = t.replace(/(\bC\.?\s*P(?:ASO)?\.?\s*=\s*)(\d*[.,]\d+)/i, (m, pre, x) => `${pre}${conValor(x, cp)}`)
      .replace(/(\bP(?:ASO)?\s*=\s*)(\d*[.,]\d+)/i, (m, pre, x) => `${pre}${conValor(x, p)}`);
    if (v !== t) { reemplazos.textos++; return v; }
    if (COTA.test(t)) { const nuevo = cotaRecalculada(e, segs, fx, fy); if (nuevo && nuevo !== t) reemplazos.cotas++; return nuevo ?? t; }
    return t;
  };
  prim.push(...aPrimitivas(pieza.entidades, fx, fy, {texto, quitar}));
  return {
    contenido: {titulo: `DETALLE DE ESCALERA - ${destino.nombre ?? "TRAMO I"}`, primitivas: prim, marco: cajaPrimitivas(prim), ejes: cajaPrimitivas(prim), h: 0.12, notas: []},
    reemplazos, alturaRampa: {antes: H, despues: Hd},
  };
}

// =======================================================================================
// Cuadros de columnas y columnetas.
// =======================================================================================

const CODIGO = /^[A-Za-z]{1,3}-?\d{0,2}[A-Za-z]?$/;
const NO_CODIGO = /^(NIVEL|PISO|TECHO|ESC|DE|Y)$/i;

// Entidades en un formato común (las primitivas del generador también se leen así).
export function entidadesDe(prims) {
  return prims.map((p) => {
    if (p.type === "line") return {tipo: "linea", capa: p.layer, puntos: [P(p.a), P(p.b)], ...color(p)};
    if (p.type === "pline" || p.type === "hatch") return {tipo: "poli", capa: p.layer, puntos: p.points.map(P), cerrada: Boolean(p.closed), ...color(p), ...(p.type === "hatch" ? {achurado: p} : {})};
    if (p.type === "circle") return {tipo: "circulo", capa: p.layer, centro: P(p.c), radio: p.r, ...color(p)};
    if (p.type === "text") return {tipo: "texto", capa: p.layer, centro: P(p.at), texto: p.value, alto: p.h, ...color(p), ...(p.align ? {align: p.align} : {}), ...(p.rot ? {rot: p.rot} : {})};
    return null;
  }).filter(Boolean);
}

const puntosDe = (e) => (e.puntos ?? (e.tipo === "circulo" ? [{x: e.centro.x - e.radio, y: e.centro.y - e.radio}, {x: e.centro.x + e.radio, y: e.centro.y + e.radio}] : [e.centro]));

// Rejilla de un cuadro: marco, columna de rótulos, columnas por tipo y filas con su papel.
export function rejillaCuadro(ents) {
  const geo = ents.filter((e) => e.tipo !== "texto");
  if (!geo.length) return null;
  const marco = {x0: Infinity, y0: Infinity, x1: -Infinity, y1: -Infinity};
  for (const e of geo) for (const q of puntosDe(e)) { marco.x0 = Math.min(marco.x0, q.x); marco.x1 = Math.max(marco.x1, q.x); marco.y0 = Math.min(marco.y0, q.y); marco.y1 = Math.max(marco.y1, q.y); }
  const W = marco.x1 - marco.x0, H = marco.y1 - marco.y0;
  if (!(W > 0.5 && H > 0.5)) return null;
  const segs = segmentos(ents);
  const hor = [], vert = [];
  for (const [a, b] of segs) {
    if (Math.abs(a.y - b.y) < 0.005 * H && Math.abs(a.x - b.x) > 0.1 * W) hor.push({y: (a.y + b.y) / 2, x0: Math.min(a.x, b.x), x1: Math.max(a.x, b.x)});
    else if (Math.abs(a.x - b.x) < 0.005 * W && Math.abs(a.y - b.y) > 0.25 * H) vert.push({x: (a.x + b.x) / 2, y0: Math.min(a.y, b.y), y1: Math.max(a.y, b.y)});
  }
  const unicos = (vals, tol) => { const out = []; for (const v of [...vals].sort((p, q) => p - q)) if (!out.length || v - out.at(-1) > tol) out.push(v); return out; };
  const textos = ents.filter((e) => e.tipo === "texto" && e.centro);
  // Códigos: la fila con más etiquetas cortas (C1, PL1, pa…).
  const cand = textos.filter((t) => { const s = String(t.texto).trim(); return CODIGO.test(s) && !NO_CODIGO.test(s); });
  const filasCod = [];
  for (const t of cand) {
    const f = filasCod.find((x) => Math.abs(x.y - t.centro.y) < Math.max(0.15, (t.alto ?? 0.2) * 0.6));
    if (f) f.t.push(t); else filasCod.push({y: t.centro.y, t: [t]});
  }
  const fila = filasCod.sort((a, b) => b.t.length - a.t.length || b.y - a.y)[0];
  if (!fila) return null;
  const codigos = fila.t.sort((a, b) => a.centro.x - b.centro.x);
  const xsV = unicos(vert.map((v) => v.x), 0.02 * W);
  const xCod0 = codigos[0].centro.x;
  const izquierda = xsV.filter((x) => x < xCod0 - 0.05);
  if (!izquierda.length) return null;
  const borde = izquierda.at(-1);
  const derecha = marco.x1;
  // Columnas por tipo: entre separadores; si faltan separadores, a medio camino entre códigos.
  const separadores = [borde, ...xsV.filter((x) => x > borde + 0.05 && x < derecha - 0.05), derecha];
  let columnas = [];
  for (let i = 0; i + 1 < separadores.length; i++) {
    const cs = codigos.filter((c) => c.centro.x > separadores[i] && c.centro.x < separadores[i + 1]);
    if (cs.length === 1) columnas.push({x0: separadores[i], x1: separadores[i + 1], codigo: String(cs[0].texto).trim(), texto: cs[0]});
    else if (cs.length > 1) {
      const lim = [separadores[i], ...cs.slice(1).map((c, k) => (cs[k].centro.x + c.centro.x) / 2), separadores[i + 1]];
      cs.forEach((c, k) => columnas.push({x0: lim[k], x1: lim[k + 1], codigo: String(c.texto).trim(), texto: c}));
    }
  }
  if (!columnas.length) return null;
  // Filas: horizontales que cruzan la mayor parte de la zona de tipos.
  const zona = derecha - borde;
  const ysH = unicos(hor.filter((h) => Math.min(h.x1, derecha) - Math.max(h.x0, borde) > 0.6 * zona).map((h) => h.y), 0.02 * H);
  const ys = unicos([marco.y0, ...ysH, marco.y1], 0.02 * H).sort((a, b) => b - a);
  const bandas = ys.slice(1).map((y0, i) => ({y0, y1: ys[i]}));
  const enZona = (e) => puntosDe(e).every((q) => q.x > borde + 1e-6);
  const dentroBanda = (b, q) => q.y >= b.y0 - 1e-6 && q.y <= b.y1 + 1e-6;
  const yCod = mediana(codigos.map((c) => c.centro.y));
  for (const b of bandas) {
    const cont = ents.filter((e) => enZona(e) && puntosDe(e).every((q) => dentroBanda(b, q)));
    b.geo = cont.filter((e) => e.tipo === "circulo" || (e.tipo === "poli" && e.cerrada)).length + 0.2 * cont.filter((e) => e.tipo !== "texto").length;
    b.arroba = textos.filter((t) => enZona(t) && dentroBanda(b, t.centro) && /@/.test(t.texto)).length;
    b.codigo = yCod >= b.y0 && yCod <= b.y1;
    b.titulo = textos.some((t) => /CUADRO\s+DE/i.test(t.texto) && dentroBanda(b, t.centro));
  }
  const iCod = bandas.findIndex((b) => b.codigo);
  if (iCod < 0) return null;
  bandas.forEach((b) => { b.papel = null; });
  bandas[iCod].papel = "codigo";
  bandas.slice(0, iCod).forEach((b) => { b.papel = "titulo"; });
  const debajo = bandas.slice(iCod + 1);
  const ref = debajo.filter((b) => b.arroba > 0).sort((a, b) => b.arroba - a.arroba)[0] ?? null;
  const iRef = ref ? bandas.indexOf(ref) : bandas.length;
  if (ref) ref.papel = "refuerzo";
  const sec = bandas.slice(iCod + 1, iRef).sort((a, b) => b.geo - a.geo)[0];
  if (sec && sec.geo > 0) sec.papel = "seccion";
  else if (bandas[iCod].geo >= 3) bandas[iCod].papel = "codigo+seccion";
  const desp = bandas.slice(iRef + 1).sort((a, b) => b.geo - a.geo)[0];
  if (desp && desp.geo > 0) desp.papel = "despiece";
  return {marco, borde, derecha, columnas, bandas, codigos, ys, alturaCodigo: mediana(codigos.map((c) => c.alto ?? 0.3))};
}

// Contenido de una celda (tipo i, banda b) de un cuadro ya leído.
function contenidoCelda(ents, rej, i, b) {
  const c = rej.columnas[i];
  return ents.filter((e) => puntosDe(e).every((q) => q.x >= c.x0 - 1e-6 && q.x <= c.x1 + 1e-6 && q.y >= b.y0 - 1e-6 && q.y <= b.y1 + 1e-6)
    && !(e.tipo === "texto" && e === c.texto) && !(e.tipo === "linea" && puntosDe(e).every((q) => Math.abs(q.y - b.y0) < 1e-4 || Math.abs(q.y - b.y1) < 1e-4)));
}

// destino: {tipo: "cuadro_columnas"|"cuadro_columnetas", generado: primitivas del generador, niveles}
export function parecidoCuadro(destino, pieza) {
  if (pieza.tipo !== destino.tipo) return null;
  const k = pieza.dibujo?.factor ?? 1;
  const rej = rejillaCuadro(pieza.entidades.map((e) => escalarEnt(e, k)));
  if (!rej) return null;
  if (!rej.bandas.some((b) => /seccion/.test(b.papel ?? ""))) return null;
  const gen = destino._rejilla ?? (destino._rejilla = rejillaCuadro(entidadesDe(destino.generado ?? [])));
  if (!gen) return null;
  const n = gen.columnas.length, m = rej.columnas.length;
  const papeles = new Set(rej.bandas.map((b) => b.papel)), papelesGen = new Set(gen.bandas.map((b) => b.papel));
  const comunes = ["refuerzo", "despiece"].filter((x) => papelesGen.has(x));
  const sPapeles = comunes.length ? comunes.filter((x) => papeles.has(x)).length / comunes.length : 1;
  const sN = Math.exp(-0.5 * Math.abs(Math.log(n / m)));
  // Que la sección generada entre en la celda del despacho sin achicarse demasiado.
  const bSec = rej.bandas.find((b) => /seccion/.test(b.papel ?? "")), gSec = gen.bandas.find((b) => /seccion/.test(b.papel ?? ""));
  const wCol = mediana(rej.columnas.map((c) => c.x1 - c.x0)), gCol = mediana(gen.columnas.map((c) => c.x1 - c.x0));
  const sTam = gSec ? Math.min(1, Math.min(wCol / gCol, (bSec.y1 - bSec.y0) / (gSec.y1 - gSec.y0)) * 1.2) : 0.5;
  // Proporciones de la rejilla (alto de la fila de secciones y ancho de columna) parecidas a las
  // del cuadro que el agente sabe llenar.
  const sForma = gSec ? Math.exp(-0.5 * (Math.abs(Math.log((bSec.y1 - bSec.y0) / (gSec.y1 - gSec.y0))) + Math.abs(Math.log(wCol / gCol)))) : 0.5;
  const puntaje = 0.3 * sPapeles + 0.3 * sN + 0.2 * sTam + 0.2 * sForma;
  return {puntaje: r4(puntaje), porque: [`${m} tipo(s) en el cuadro del despacho → ${n} del destino`, `filas: ${[...papeles].filter(Boolean).join(", ")}`]};
}

export const elegirCuadro = (destino, piezas, opciones) => elegir(destino, piezas, parecidoCuadro, {minimo: 0.3, ...opciones});

function escalarEnt(e, k) {
  if (k === 1) return e;
  const S = (q) => ({x: q.x * k, y: q.y * k});
  return {...e, ...(e.puntos ? {puntos: e.puntos.map(S)} : {}), ...(e.centro ? {centro: S(e.centro)} : {}), ...(e.radio ? {radio: e.radio * k} : {}), ...(e.alto ? {alto: e.alto * k} : {})};
}

const ES_FC = (t) => /^\s*(100|140|175|210|245|280|315|350|420)\s*$/.test(String(t));
const ES_NIVEL = (t) => /^\s*\d+\s*[°º]?\s*(PISO|NIVEL)\b/i.test(String(t)) || /^\s*[°º]\s*PISO/i.test(String(t));
const ESCALA = /1\s*\/\s*\d+/;

// Cuadro del despacho con las filas del destino. Unidades de lámina; origen en la esquina
// inferior izquierda del marco.
export function adaptarCuadro(pieza, destino) {
  const k = pieza.dibujo?.factor ?? 1;
  const ents = pieza.entidades.map((e) => escalarEnt(e, k));
  const rej = rejillaCuadro(ents);
  const genEnts = entidadesDe(destino.generado ?? []);
  const gen = rejillaCuadro(genEnts);
  if (!rej || !gen) throw new Error("cuadro sin rejilla legible");
  const n = gen.columnas.length;
  const wCol = mediana(rej.columnas.map((c) => c.x1 - c.x0));
  const zonaVieja = rej.derecha - rej.borde, zonaNueva = n * wCol;
  const fx = (x) => (x <= rej.borde + 1e-6 ? x : rej.borde + ((x - rej.borde) * zonaNueva) / zonaVieja);
  const fy = (y) => y;
  const ox = rej.marco.x0, oy = rej.marco.y0;
  const O = (x, y) => [r4(x - ox), r4(y - oy)];
  const out = [];
  const reemplazos = {celdas: 0, valores: 0};
  // Valores del destino tomados del cuadro generado.
  const gTextos = genEnts.filter((e) => e.tipo === "texto");
  const fcDestino = gTextos.find((t) => ES_FC(t.texto))?.texto?.trim() ?? null;
  const tituloDestino = gTextos.find((t) => /CUADRO\s+DE/i.test(t.texto))?.texto ?? null;
  const escalaGen = Number((gTextos.find((t) => ESCALA.test(t.texto) && /^\s*1\s*\/\s*\d+\s*$/.test(t.texto))?.texto ?? "1/25").split("/")[1]);
  // Escala de las secciones: la del generador, o menor si la celda del despacho es más chica.
  const celdasSec = rej.bandas.filter((b) => /seccion/.test(b.papel ?? ""));
  const gSec = gen.bandas.find((b) => /seccion/.test(b.papel ?? ""));
  let sSec = 1;
  if (gSec) for (let i = 0; i < n; i++) {
    const cont = contenidoCelda(genEnts, gen, i, gSec).filter((e) => e.tipo !== "texto");
    if (!cont.length) continue;
    const c = cajaEnts(cont);
    for (const b of celdasSec) sSec = Math.min(sSec, (0.85 * wCol) / Math.max(1e-6, c.x1 - c.x0), (0.8 * (b.y1 - b.y0)) / Math.max(1e-6, c.y1 - c.y0));
  }
  // 1. De la pieza: rótulos (columna izquierda), título, líneas de la rejilla estiradas; nada
  //    del contenido de las celdas de tipos.
  const niveles = Math.max(1, Number(destino.niveles) || 1);
  const textosNivel = ents.filter((e) => e.tipo === "texto" && ES_NIVEL(e.texto)).sort((a, b) => b.centro.y - a.centro.y);
  const pasoNivel = textosNivel.length > 1 ? textosNivel[0].centro.y - textosNivel[1].centro.y : (textosNivel[0]?.alto ?? 0.3) * 1.8;
  const separadoresTipos = rej.columnas.slice(1).map((c) => c.x0);
  let ySep = null;
  for (const e of ents) {
    const pts = puntosDe(e);
    const enRotulos = pts.every((q) => q.x <= rej.borde + 1e-3);
    if (e.tipo === "texto") {
      if (/CUADRO\s+DE/i.test(e.texto)) {
        out.push({type: "text", layer: capaDe(e), at: O(fx(e.centro.x), e.centro.y), value: tituloDestino ?? e.texto, h: e.alto, rot: 0, ...color(e)});
        reemplazos.valores++;
        continue;
      }
      // En la columna de rótulos solo rótulos: ni refuerzo, ni cotas, ni códigos de una celda de
      // tipos que cayó a la izquierda (su centro antes del borde).
      if (!enRotulos || /[Ø@]|%%c/i.test(e.texto) || COTA.test(e.texto) || (CODIGO.test(String(e.texto).trim()) && !NO_CODIGO.test(String(e.texto).trim()))) continue;
      if (ES_NIVEL(e.texto)) {
        if (e !== textosNivel[0]) continue;
        for (let j = 0; j < niveles; j++) out.push({type: "text", layer: capaDe(e), at: O(e.centro.x, e.centro.y - j * pasoNivel), value: `${j + 1}° Piso`, h: e.alto, rot: 0, ...color(e)});
        reemplazos.valores++;
        continue;
      }
      let v = e.texto;
      if (ES_FC(v) && fcDestino) { v = fcDestino; reemplazos.valores++; }
      else if (ESCALA.test(v)) {
        const den = [10, 15, 20, 25, 30, 40, 50, 75, 100].find((d) => d >= escalaGen / sSec - 0.5) ?? Math.round(escalaGen / sSec);
        v = v.replace(/1\s*\/\s*\d+/, `1/${den}`); reemplazos.valores++;
      }
      out.push({type: "text", layer: capaDe(e), at: O(e.centro.x, e.centro.y), value: v, h: e.alto, rot: 0, ...color(e)});
      continue;
    }
    // Círculos (varillas) y dibujos de una celda que cayeron a la izquierda: no se copian.
    if (e.tipo === "circulo") continue;
    if (!(e.puntos?.length >= 2)) continue;
    // Rejilla: segmentos horizontales y verticales largos (marco, filas, separadores).
    for (let i = 1; i < e.puntos.length + (e.cerrada ? 1 : 0); i++) {
      const a = e.puntos[i - 1], b = e.puntos[i % e.puntos.length];
      const W = rej.marco.x1 - rej.marco.x0, H = rej.marco.y1 - rej.marco.y0;
      // Solo las líneas de la rejilla: horizontales sobre una fila y verticales sobre un separador.
      // En la columna de rótulos: sus divisiones (horizontales y verticales largas).
      const wR = rej.borde - rej.marco.x0;
      if (Math.max(a.x, b.x) <= rej.borde + 1e-3) {
        // Una vertical de la rejilla va de una fila a otra (las cotas sueltas no).
        const enFila = (q) => rej.ys.some((y) => Math.abs(y - q.y) < 0.02 * H) || rej.bandas.some((bb) => Math.abs(bb.y1 - q.y) < 0.02 * H || Math.abs(bb.y0 - q.y) < 0.02 * H);
        const h = Math.abs(a.y - b.y) < 0.005 * H && Math.abs(a.x - b.x) > 0.25 * wR, v = Math.abs(a.x - b.x) < 0.005 * W && Math.abs(a.y - b.y) > 0.1 * H && enFila(a) && enFila(b);
        if (h || v) out.push({type: "line", layer: capaDe(e), a: O(a.x, a.y), b: O(b.x, b.y), ...color(e)});
        continue;
      }
      const hz = Math.abs(a.y - b.y) < 0.005 * H && Math.abs(a.x - b.x) > 0.1 * W && rej.ys.some((y) => Math.abs(y - a.y) < 0.01 * H);
      const vt = Math.abs(a.x - b.x) < 0.005 * W && Math.abs(a.y - b.y) > 0.15 * H && (Math.abs(a.x - rej.derecha) < 0.02 || rej.columnas.some((c) => Math.abs(c.x0 - a.x) < 0.05))
        && [a, b].every((q) => rej.ys.some((y) => Math.abs(y - q.y) < 0.02 * H) || rej.bandas.some((bb) => Math.abs(bb.y1 - q.y) < 0.02 * H));
      if (!hz && !vt) continue;
      if (vt && a.x > rej.borde + 0.02 && a.x < rej.derecha - 0.02) {
        if (separadoresTipos.some((x) => Math.abs(x - a.x) < 0.05) || rej.columnas.length === 1) ySep = ySep ?? {y0: Math.min(a.y, b.y), y1: Math.max(a.y, b.y), capa: capaDe(e), color: e.color};
        continue;
      }
      out.push({type: "line", layer: capaDe(e), a: O(fx(a.x), fy(a.y)), b: O(fx(b.x), fy(b.y)), ...color(e)});
    }
  }
  // 2. Separadores de los tipos del destino.
  const bandaCod = rej.bandas.find((b) => /codigo/.test(b.papel));
  // Separadores de largo completo (de la fila de códigos al pie del cuadro), aunque el del
  // despacho fuera más corto (a veces solo cruza la fila de secciones).
  const sep = {y0: rej.marco.y0, y1: bandaCod?.y1 ?? rej.marco.y1, capa: ySep?.capa ?? "0", ...(Number.isInteger(ySep?.color) ? {color: ySep.color} : {})};
  for (let i = 1; i < n; i++) {
    const x = rej.borde + i * wCol;
    out.push({type: "line", layer: sep.capa, a: O(x, sep.y0), b: O(x, sep.y1), ...(Number.isInteger(sep.color) ? {color: sep.color} : {})});
  }
  // 3. Celdas: el contenido generado de cada tipo, centrado en la celda del despacho.
  const muestraCod = rej.columnas[0].texto;
  for (let i = 0; i < n; i++) {
    const x0 = rej.borde + i * wCol, x1 = x0 + wCol;
    // Código del tipo, con la letra y la altura del despacho.
    out.push({type: "text", layer: capaDe(muestraCod), at: O((x0 + x1) / 2, muestraCod.centro.y), value: gen.columnas[i].codigo, h: muestraCod.alto, rot: 0, ...color(muestraCod)});
    for (const b of rej.bandas) {
      const papel = b.papel === "codigo+seccion" ? "seccion" : b.papel;
      if (!["seccion", "refuerzo", "despiece"].includes(papel)) continue;
      const gb = gen.bandas.find((g) => g.papel === papel || (papel === "seccion" && g.papel === "codigo+seccion"));
      if (!gb) continue;
      const cont = contenidoCelda(genEnts, gen, i, gb);
      if (!cont.length) continue;
      const c = cajaEnts(cont);
      const cw = c.x1 - c.x0, ch = c.y1 - c.y0;
      const yTope = b.papel === "codigo+seccion" ? muestraCod.centro.y - muestraCod.alto : b.y1;
      const s = papel === "seccion" ? sSec : Math.min(1, (0.92 * wCol) / Math.max(1e-6, cw), (0.85 * (yTope - b.y0)) / Math.max(1e-6, ch));
      const cx = (x0 + x1) / 2, cy = (b.y0 + yTope) / 2, mx = (c.x0 + c.x1) / 2, my = (c.y0 + c.y1) / 2;
      const T = (q) => O(cx + (q.x - mx) * s, cy + (q.y - my) * s);
      for (const e of cont) out.push(primitivaDe(e, T, s));
      reemplazos.celdas++;
    }
  }
  const marco = {x0: 0, y0: 0, x1: r4(rej.borde - ox + zonaNueva), y1: r4(rej.marco.y1 - oy)};
  return {contenido: {primitivas: out, marco, h: rej.alturaCodigo ?? 0.3, notas: []}, reemplazos, escalaSecciones: sSec, tipos: n};
}

function cajaEnts(ents) {
  const c = {x0: Infinity, y0: Infinity, x1: -Infinity, y1: -Infinity};
  for (const e of ents) for (const q of puntosDe(e)) { c.x0 = Math.min(c.x0, q.x); c.x1 = Math.max(c.x1, q.x); c.y0 = Math.min(c.y0, q.y); c.y1 = Math.max(c.y1, q.y); }
  return c;
}

function primitivaDe(e, T, s) {
  const base = {layer: e.capa, ...color(e)};
  if (e.tipo === "texto") return {type: "text", ...base, at: T(e.centro), value: e.texto, h: r4(e.alto * s), rot: e.rot ?? 0, ...(e.align ? {align: e.align} : {})};
  if (e.tipo === "circulo") return {type: "circle", ...base, c: T(e.centro), r: r4(e.radio * s)};
  if (e.achurado) return {...e.achurado, points: e.puntos.map(T)};
  if (e.tipo === "linea" && e.puntos.length === 2) return {type: "line", ...base, a: T(e.puntos[0]), b: T(e.puntos[1])};
  return {type: "pline", ...base, points: e.puntos.map(T), closed: Boolean(e.cerrada)};
}

// =======================================================================================
// Entrada única para laminasPlantilla.js.
// =======================================================================================

// biblioteca: arreglo de piezas o {piezas, excluir, minimo}. tipo: corte_cimiento | escalera |
// cuadro_columnas | cuadro_columnetas. Devuelve {contenido, biblioteca: {pieza, puntaje, porque,
// reemplazos}} o null (sin pieza parecida: queda el generador).
export function detalleDesdeBiblioteca(tipo, destino, biblioteca) {
  const piezas = (Array.isArray(biblioteca) ? biblioteca : biblioteca?.piezas ?? []).filter((p) => p.tipo === tipo);
  if (!piezas.length) return null;
  const opciones = Array.isArray(biblioteca) ? {} : {excluir: biblioteca.excluir ?? null, ...(biblioteca.minimo != null ? {minimo: biblioteca.minimo} : {})};
  const [elegirT, adaptarT] = {
    corte_cimiento: [elegirCorte, adaptarCorte], escalera: [elegirEscalera, adaptarEscalera],
    cuadro_columnas: [elegirCuadro, adaptarCuadro], cuadro_columnetas: [elegirCuadro, adaptarCuadro],
  }[tipo] ?? [];
  if (!elegirT) return null;
  const d = /^cuadro/.test(tipo) ? {...destino, tipo} : destino;
  const elegida = elegirT(d, piezas, opciones);
  if (!elegida) return null;
  let adaptado;
  try { adaptado = adaptarT(elegida.pieza, d); } catch { return null; }
  if (!adaptado?.contenido?.primitivas?.length) return null;
  return {contenido: adaptado.contenido, biblioteca: {pieza: nombrePieza(elegida.pieza), puntaje: elegida.puntaje, porque: elegida.porque, reemplazos: adaptado.reemplazos}};
}
