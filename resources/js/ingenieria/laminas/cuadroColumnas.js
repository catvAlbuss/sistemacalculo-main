// Cuadro de columnas con el formato del expediente de referencia (módulo XIV):
//
//   ESCALA 1/25 |            CUADRO DE COLUMNAS
//   NIVEL       | CONCRETO   |  C1   |  C2   |  C3
//   1° Piso     | f'c 210    | sección con estribos y varillas
//               | Refuerzo y estribaje | medidas · nØ5/8" · estribaje
//   DESPIECE DE ESTRIBOS     | cada estribo suelto con su gancho
//
// Las columnas en L llevan dos estribos, uno por ala, que se cruzan en la esquina
// (así los dibuja el ingeniero). Todo en unidades de lámina (1 = 1 m a 1/50).

import {L, line, pline, circle, text, cota} from "../cad/primitives.js";
import {CRITERIOS, textoEstribos} from "../criterios/criteriosEstructurales.js";
import {desplazarPoligono} from "../planos/aligeradoPlano.js";
import {refuerzoMinimo} from "./laminaEstructuras.js";
import {anchoTexto} from "./rotulo.js";
import {diametro, ejeDelEstribo, estriboDetallado, llamadaAbanico, varilla} from "./aceroDetalle.js";

const r4 = (v) => Math.round(v * 10000) / 10000;
const sub = (a, b) => ({x: a.x - b.x, y: a.y - b.y});
const add = (a, b) => ({x: a.x + b.x, y: a.y + b.y});
const cruz = (a, b) => a.x * b.y - a.y * b.x;
const area2 = (pts) => pts.reduce((s, p, i) => s + cruz(p, pts[(i + 1) % pts.length]), 0);

// Contorno sin vértices repetidos ni alineados.
function limpiar(pts) {
  let out = pts.filter((p, i) => Math.hypot(p.x - pts[(i + 1) % pts.length].x, p.y - pts[(i + 1) % pts.length].y) > 1e-4);
  out = out.filter((b, i) => {
    const a = out[(i - 1 + out.length) % out.length], c = out[(i + 1) % out.length];
    const u = sub(b, a), v = sub(c, b);
    return Math.abs(cruz(u, v)) / ((Math.hypot(u.x, u.y) * Math.hypot(v.x, v.y)) || 1) > 0.03;
  });
  return out.length >= 3 ? out : pts;
}

// Estribos de una sección: uno por ala en las L (rectángulos que comparten la
// esquina exterior), uno solo en las demás. Devuelve los contornos de concreto de
// cada estribo; el recubrimiento se descuenta después.
export function alasDeSeccion(contorno) {
  const pts = limpiar(contorno);
  if (pts.length !== 6) return [pts];
  const s = Math.sign(area2(pts)) || 1;
  const i = pts.findIndex((b, j) => s * cruz(sub(b, pts[(j + 5) % 6]), sub(pts[(j + 1) % 6], b)) < 0); // vértice entrante
  if (i < 0) return [pts];
  const v = (j) => pts[(i + j) % 6];
  const o = v(3); // esquina exterior opuesta
  const ala1 = [o, v(4), v(5), add(v(5), sub(o, v(4)))];
  const ala2 = [o, v(2), v(1), add(v(1), sub(o, v(2)))];
  return [ala1, ala2];
}

// Varillas: esquinas de cada estribo (sin repetir) y, si faltan, al centro de los
// lados más largos.
export function varillasDeSeccion(alas, n, rec) {
  const puntos = [];
  const lados = [];
  for (const ala of alas) {
    let q = ala;
    try { q = desplazarPoligono(ala, -rec); } catch { /* contorno raro */ }
    for (const p of q) if (!puntos.some((o) => Math.hypot(o.x - p.x, o.y - p.y) < 0.04)) puntos.push(p);
    q.forEach((a, j) => lados.push({a, b: q[(j + 1) % q.length]}));
  }
  lados.sort((p, q) => Math.hypot(q.b.x - q.a.x, q.b.y - q.a.y) - Math.hypot(p.b.x - p.a.x, p.b.y - p.a.y));
  for (let j = 0; puntos.length < n && j < lados.length; j++) {
    const m = {x: (lados[j].a.x + lados[j].b.x) / 2, y: (lados[j].a.y + lados[j].b.y) / 2};
    if (!puntos.some((o) => Math.hypot(o.x - m.x, o.y - m.y) < 0.06)) puntos.push(m);
  }
  return puntos;
}

// Renglones centrados en (x, yc), cada uno un texto propio, con la letra ajustada para
// que el más largo quepa en `ancho` (sin MTEXT: no se encima con la columna vecina).
function renglones(lineas, x, yc, ancho, hMax) {
  const lista = lineas.filter((l) => String(l).trim());
  const h = Math.min(hMax, ...lista.map((l) => ancho / Math.max(0.1, anchoTexto(l, 1))));
  const paso = h * 1.45;
  return lista.map((l, i) => text(L.LAMINA, [r4(x), r4(yc + ((lista.length - 1) / 2 - i) * paso)], l, r4(h)));
}

// Esquinas dobladas del estribo: cada vértice se reemplaza por un arco de radio `radio` (m)
// tangente a los dos lados, como se dobla la varilla en obra. Devuelve la polilínea (puntos) y,
// por vértice, los puntos de tangencia y el centro del doblez.
export function contornoDoblado(q, radio, segmentos = 6) {
  const pts = [], dobleces = [];
  const n = q.length;
  for (let i = 0; i < n; i++) {
    const c = q[i], a = q[(i + n - 1) % n], b = q[(i + 1) % n];
    const ua = sub(a, c), ub = sub(b, c);
    const la = Math.hypot(ua.x, ua.y) || 1, lb = Math.hypot(ub.x, ub.y) || 1;
    const va = {x: ua.x / la, y: ua.y / la}, vb = {x: ub.x / lb, y: ub.y / lb};
    const phi = Math.acos(Math.max(-1, Math.min(1, va.x * vb.x + va.y * vb.y))); // ángulo interior
    if (phi < 0.1 || phi > Math.PI - 0.05) { pts.push(c); dobleces.push({t0: c, t1: c, centro: c}); continue; }
    const r = Math.min(radio, 0.3 * Math.min(la, lb) * Math.tan(phi / 2)); // no más que el lado permite
    const dt = r / Math.tan(phi / 2);
    const t0 = {x: c.x + va.x * dt, y: c.y + va.y * dt}, t1 = {x: c.x + vb.x * dt, y: c.y + vb.y * dt};
    const bis = {x: va.x + vb.x, y: va.y + vb.y}, lbis = Math.hypot(bis.x, bis.y) || 1;
    const centro = {x: c.x + (bis.x / lbis) * (r / Math.sin(phi / 2)), y: c.y + (bis.y / lbis) * (r / Math.sin(phi / 2))};
    let a0 = Math.atan2(t0.y - centro.y, t0.x - centro.x), a1 = Math.atan2(t1.y - centro.y, t1.x - centro.x);
    let da = a1 - a0;
    while (da > Math.PI) da -= 2 * Math.PI;
    while (da < -Math.PI) da += 2 * Math.PI;
    for (let k = 0; k <= segmentos; k++) {
      const ang = a0 + (da * k) / segmentos;
      pts.push({x: centro.x + r * Math.cos(ang), y: centro.y + r * Math.sin(ang)});
    }
    dobleces.push({t0, t1, centro});
  }
  return {pts, dobleces};
}

// Dónde cierra cada estribo (sus ganchos), como el detalle del ingeniero: el primero arriba a la
// derecha y, en las L, el segundo en su esquina más alejada del primero (ganchos alternados,
// no apilados en la misma esquina). Devuelve los polígonos con ese vértice primero.
export function cierresAlternados(ejes) {
  const desde = (q, i) => [...q.slice(i), ...q.slice(0, i)];
  const out = [];
  let previo = null;
  for (const q of ejes) {
    const i = previo
      ? q.reduce((m, p, k) => (Math.hypot(p.x - previo.x, p.y - previo.y) > Math.hypot(q[m].x - previo.x, q[m].y - previo.y) ? k : m), 0)
      : q.reduce((m, p, k) => (p.x + p.y > q[m].x + q[m].y ? k : m), 0);
    out.push(desde(q, i));
    previo = previo ?? q[i];
  }
  return out;
}

// Título como lo pone el ingeniero: "CUADRO DE COLUMNAS", "CUADRO DE PLACA" o
// "CUADRO DE PLACA Y COLUMNA" según lo que haya en la planta.
export function tituloDelCuadro(secciones) {
  const placas = secciones.some((c) => c.clase === "placa"), columnas = secciones.some((c) => c.clase !== "placa");
  return placas && columnas ? "CUADRO DE PLACA Y COLUMNA" : placas ? "CUADRO DE PLACA" : "CUADRO DE COLUMNAS";
}

// Medidas como en el cuadro del ingeniero: L y T con su espesor (1.00x0.60x0.30m),
// el resto lado x lado (0.90x0.90m).
export function medidasDeSeccion(c) {
  const b = Math.max(c.b, c.h), h = Math.min(c.b, c.h);
  return (c.forma === "L" || c.forma === "T") && c.espesor ? `${b.toFixed(2)}x${h.toFixed(2)}x${c.espesor.toFixed(2)}m` : `${b.toFixed(2)}x${h.toFixed(2)}m`;
}

const cotaCortaCol = (v) => v.toFixed(2).replace(/^0(?=\.)/, "");

// Cotas de una sección como las pone el ingeniero (".40", ".25"): en un rectángulo, el
// lado de arriba y el de la derecha; en L, T o irregulares, cada lado exterior (no los
// que llegan a una esquina entrante). Por fuera del contorno, alineadas con su lado.
export function cotasDeContorno(contorno, S, {separacion, alto, capa = L.COTAS_E}) {
  const pts = limpiar(contorno);
  const s = Math.sign(area2(pts)) || 1;
  const n = pts.length;
  const entrante = pts.map((b, j) => s * cruz(sub(b, pts[(j - 1 + n) % n]), sub(pts[(j + 1) % n], b)) < 0);
  let lados = pts.map((a, j) => ({a, b: pts[(j + 1) % n], j})).filter(({a, b, j}) => Math.hypot(b.x - a.x, b.y - a.y) > 0.05 && !entrante[j] && !entrante[(j + 1) % n]);
  const rectangulo = n === 4 && pts.every((b, j) => {
    const u = sub(b, pts[(j - 1 + n) % n]), v = sub(pts[(j + 1) % n], b);
    return Math.abs(u.x * v.x + u.y * v.y) < 1e-3 * Math.hypot(u.x, u.y) * Math.hypot(v.x, v.y) + 1e-9;
  });
  if (rectangulo) {
    const medio = (l) => ({x: (l.a.x + l.b.x) / 2, y: (l.a.y + l.b.y) / 2});
    const arriba = [...lados].sort((p, q) => medio(q).y - medio(p).y)[0];
    const derecha = [...lados].sort((p, q) => medio(q).x - medio(p).x)[0];
    lados = [arriba, derecha];
  }
  // cota() desplaza hacia la izquierda de a→b: hacia afuera es a la derecha si el contorno gira antihorario.
  return lados.flatMap(({a, b}) => cota(capa, S(a), S(b), -s * separacion, alto, cotaCortaCol(Math.hypot(b.x - a.x, b.y - a.y))));
}

export function cuadroColumnas(columnas, {ancho = 12, alto = 6, escala = 2} = {}) {
  const tipos = [];
  for (const c of columnas) {
    const t = tipos.find((x) => x.tipo === c.tipo);
    if (t) t.cantidad++; else tipos.push({tipo: c.tipo, muestra: c, cantidad: 1});
  }
  tipos.sort((a, b) => a.tipo.localeCompare(b.tipo, "es", {numeric: true}));
  const C = CRITERIOS.columnas;
  const W = ancho, H = alto;
  const c0 = W * 0.105, c1 = W * 0.175, wTipo = (W - c0 - c1) / Math.max(1, tipos.length);
  const filas = [0.8, 0.65, 2.15, 0.85, 1.55].map((f) => (f * H) / 6);
  const y = [H]; filas.forEach((f) => y.push(y.at(-1) - f)); // y[0]=H … y[5]=0
  const hT = H / 6; // altura de referencia de textos
  const out = [];
  // Marco y líneas.
  out.push(pline(L.LAMINA, [[0, 0], [W, 0], [W, H], [0, H]], true));
  out.push(line(L.LAMINA, [0, y[1]], [W, y[1]]));
  out.push(line(L.LAMINA, [c0 + c1, y[2]], [W, y[2]]));
  out.push(line(L.LAMINA, [0, y[3]], [W, y[3]]));
  out.push(line(L.LAMINA, [0, y[4]], [W, y[4]]));
  out.push(line(L.LAMINA, [c0, y[0]], [c0, y[4]]));
  out.push(line(L.LAMINA, [c0 + c1, y[1]], [c0 + c1, 0]));
  for (let i = 1; i < tipos.length; i++) out.push(line(L.LAMINA, [c0 + c1 + i * wTipo, y[1]], [c0 + c1 + i * wTipo, 0]));
  // Rótulos fijos.
  out.push(...renglones(["ESCALA", `1/${Math.round(50 / escala)}`], c0 / 2, (y[0] + y[1]) / 2, c0 * 0.85, hT * 0.2));
  out.push(text(L.LAMINA, [c0 + (W - c0) / 2, (y[0] + y[1]) / 2], tituloDelCuadro(tipos.map((t) => t.muestra)), hT * 0.38));
  out.push(...renglones(["NIVEL", "1° Piso"], c0 / 2, y[1] - (y[1] - y[3]) * 0.3, c0 * 0.85, hT * 0.28));
  out.push(...renglones(["CONCRETO", "f'c (kg/cm²)"], c0 + c1 / 2, y[1] - (y[1] - y[3]) * 0.22, c1 * 0.88, hT * 0.24));
  out.push(text(L.LAMINA, [c0 + c1 / 2, y[3] + (y[1] - y[3]) * 0.3], String(CRITERIOS.concreto.columnas), hT * 0.32));
  out.push(...renglones(["Refuerzo", "y estribaje"], c0 + c1 / 2, (y[3] + y[4]) / 2, c1 * 0.88, hT * 0.24));
  out.push(...renglones(["DESPIECE DE", "ESTRIBOS"], (c0 + c1) / 2, (y[4] + y[5]) / 2, (c0 + c1) * 0.85, hT * 0.3));

  const resumen = tipos.map((t, i) => {
    const c = t.muestra, ref = refuerzoMinimo(c.area);
    const x0 = c0 + c1 + i * wTipo, xm = x0 + wTipo / 2;
    out.push(text(L.LAMINA, [xm, (y[1] + y[2]) / 2], t.tipo, hT * 0.42));
    // Sección a escala, centrada en su celda (un poco a la izquierda para el rótulo de varillas).
    // Algo menor que antes: alrededor van las cotas de la sección.
    const fs = Math.min(escala, (wTipo * 0.5) / Math.max(c.b, c.h, 0.2), ((y[2] - y[3]) * 0.6) / Math.max(c.b, c.h, 0.2));
    const cx = xm - wTipo * 0.08, cy = (y[2] + y[3]) / 2;
    const S = (p) => [r4(cx + (p.x - c.x) * fs), r4(cy + (p.y - c.y) * fs)];
    out.push(pline(L.COLUMNAS, c.contorno.map(S), true));
    // Acero como el detalle del ingeniero: estribo a doble línea con dobleces y ganchos a 135°,
    // varillas al diámetro real tangentes al estribo (dentro de los dobleces).
    const de = diametro(C.estribo), db = diametro(C.barra);
    const alas = alasDeSeccion(c.contorno);
    const estribos = alas.map((a) => { try { return desplazarPoligono(a, -C.recubrimiento); } catch { return a; } }); // cara exterior
    const ejes = cierresAlternados(alas.map((a) => ejeDelEstribo(a, C.recubrimiento, de)));
    for (const q of ejes) out.push(...estriboDetallado(q, S, {de, db}));
    const varillas = varillasDeSeccion(alas, ref.n, C.recubrimiento + de + db / 2);
    for (const p of varillas) out.push(varilla(p, db, S, fs));
    // Medidas de la sección (".40", ".25"), como el ingeniero.
    out.push(...cotasDeContorno(c.contorno, S, {separacion: hT * 0.16, alto: hT * 0.15}));
    // Llamadas en abanico, como el expediente: las varillas de la mitad de arriba a una etiqueta
    // arriba a la derecha y las de abajo a otra abajo ("6Ø5/8"" y "2Ø5/8""); si todas quedan
    // de un lado, una sola. El texto termina dentro de su celda.
    const hL = hT * 0.14, xFinL = r4(x0 + wTipo * 0.97);
    const grupos = [varillas.filter((p) => p.y >= c.y), varillas.filter((p) => p.y < c.y)].filter((g) => g.length);
    const yMin = Math.min(...c.contorno.map((p) => S(p)[1])), yMax = Math.max(...c.contorno.map((p) => S(p)[1]));
    grupos.forEach((g, k) => {
      const etiqueta = `${g.length}Ø${C.barra}`, wL = anchoTexto(etiqueta, hL) * HOLGURA_VISOR;
      const yG = k === 0 ? r4(Math.min(y[2] - hT * 0.25, yMax + hT * 0.3)) : r4(Math.max(y[3] + hL * 0.6, yMin - hT * 0.42));
      const xIni = r4(xFinL - wL);
      out.push(...llamadaAbanico(g, etiqueta, {S, fs, db, quiebre: [xIni, yG], fin: [xFinL, yG], h: hL}));
    });
    // Refuerzo y estribaje.
    const n = alas.length;
    const dims = medidasDeSeccion(c);
    const estribaje = textoEstribos(C.estribo, C.distribucionPorSeccion ? C.distribucionPorSeccion(c) : C.distribucion, n);
    // Cuatro renglones que caben en la columna: medidas, varillas y estribaje partido.
    const [e1, e2] = estribaje.split(/,\s*(?=Rto)/);
    out.push(...renglones([dims, ref.texto, e2 ? `${e1},` : e1, e2 ?? ""], xm, (y[3] + y[4]) / 2, wTipo * 0.9, hT * 0.15));
    // Despiece: cada estribo suelto, uno al lado del otro.
    const ancho1 = wTipo / n;
    estribos.forEach((q, j) => {
      const xs = q.map((p) => p.x), ys = q.map((p) => p.y);
      const m = {x: (Math.min(...xs) + Math.max(...xs)) / 2, y: (Math.min(...ys) + Math.max(...ys)) / 2};
      const f = Math.min(escala * 1.2, (ancho1 * 0.5) / Math.max(0.1, Math.max(...xs) - Math.min(...xs)), ((y[4] - y[5]) * 0.5) / Math.max(0.1, Math.max(...ys) - Math.min(...ys)));
      const ex = x0 + ancho1 * (j + 0.5), ey = (y[4] + y[5]) / 2;
      const SE = (p) => [r4(ex + (p.x - m.x) * f), r4(ey + (p.y - m.y) * f)];
      out.push(...estriboDetallado(ejes[j], SE, {de, db}));
      // Medidas del estribo (".18" x ".32"), como el despiece del ingeniero.
      out.push(...cotasDeContorno(q, SE, {separacion: hT * 0.14, alto: hT * 0.14}));
    });
    return {tipo: t.tipo, cantidad: t.cantidad, dimensiones: dims, refuerzo: ref.texto, estribos: estribaje, varillas: varillas.length};
  });
  return {filas: resumen, contenido: {primitivas: out, marco: {x0: 0, y0: 0, x1: W, y1: H}, h: hT, notas: []}};
}

// Cuadro de columnetas con el formato del expediente: una columna por código (pa, pb…)
// con la sección, sus medidas (".20", ".13"), varillas de 3/8" con su llamada en cada
// cara ("2Ø3/8\""), estribo de 1/4" con gancho, y el refuerzo y estribaje.
// Las secciones van a la mayor escala estándar que entra en las celdas (1/10, 1/15,
// 1/20 o 1/25), la misma para todas, y el encabezado dice cuál. Unidades de lámina
// (1 = 1 m a 1/50).
const ESCALAS_DETALLE = [10, 15, 20, 25, 30, 40, 50];
// El visor dibuja algo más ancho que la estimación de anchoTexto: margen para no encimar.
const HOLGURA_VISOR = 1.15;
const cotaCorta = (v) => v.toFixed(2).replace(/^0(?=\.)/, "");

export function cuadroColumnetas(columnetas, {ancho = 11.9, alto = 2.9} = {}) {
  const tipos = [];
  for (const c of columnetas) {
    if (!c.codigo) continue;
    const t = tipos.find((x) => x.codigo === c.codigo);
    if (t) t.cantidad++; else tipos.push({codigo: c.codigo, muestra: c, cantidad: 1});
  }
  if (!tipos.length) return null;
  tipos.sort((a, b) => a.codigo.localeCompare(b.codigo));
  const CT = CRITERIOS.columnetas;
  const W = ancho, H = alto;
  const c0 = W * 0.075, c1 = W * 0.1, disponible = W - c0 - c1;
  const filas = [0.36, 0.3, 1.5, 0.74].map((f) => (f * H) / 2.9);
  const y = [H]; filas.forEach((f) => y.push(y.at(-1) - f));
  const hT = H / 2.9 * 0.3;
  const CT0 = CRITERIOS.columnetas;
  const medidas = tipos.map((t) => ({b: Math.max(t.muestra.b, t.muestra.h), h: Math.min(t.muestra.b, t.muestra.h)}));
  // Cada celda se reparte sin encimar nada: margen | llamadas "2Ø3/8\"" | sección | cota | margen.
  // Como en el cuadro del ingeniero, las celdas no son iguales: la de una columneta larga
  // (pb .65) es más ancha. La letra de cotas y llamadas es la del refuerzo; baja solo si
  // las llamadas apiladas (una por par de varillas) no entran en el alto de la fila o si
  // hay tantos tipos que las partes fijas no dejan lugar a las secciones.
  const filaSeccion = y[2] - y[3];
  const maxPares = Math.max(...medidas.map((m) => CT0.varillasPorCara(m.b)));
  const fijoDe = (h) => h * 0.8 + anchoTexto(`2Ø${CT0.barra}`, h) * HOLGURA_VISOR + h * 1.2 + h * 2.6;
  let hc = Math.min(hT * 0.45, (filaSeccion * 0.86) / (maxPares * 1.7));
  hc = Math.min(hc, (hc * 0.6 * disponible) / (tipos.length * fijoDe(hc)));
  const margen = hc * 0.4;
  const anchoLlamada = anchoTexto(`2Ø${CT0.barra}`, hc) * HOLGURA_VISOR;
  const anchoCota = hc * 2.6;
  const fijo = fijoDe(hc);
  const libreY = filaSeccion - hc * 3.4;
  // Escala común: la mayor estándar con la que entran todas las secciones a lo ancho y a lo alto.
  const entra = (f) => medidas.reduce((s, m) => s + fijo + m.b * f, 0) <= disponible && medidas.every((m) => m.h * f <= libreY);
  const den = ESCALAS_DETALLE.find((d) => entra(50 / d)) ?? ESCALAS_DETALLE.at(-1);
  const fs = 50 / den;
  // Ancho de cada celda: su parte fija + su sección; lo que sobra se reparte por igual.
  const sobra = Math.max(0, disponible - medidas.reduce((s, m) => s + fijo + m.b * fs, 0));
  const anchos = medidas.map((m) => fijo + m.b * fs + sobra / medidas.length);
  const inicios = anchos.map((_, i) => c0 + c1 + anchos.slice(0, i).reduce((s, w) => s + w, 0));
  const out = [];
  out.push(pline(L.LAMINA, [[0, 0], [W, 0], [W, H], [0, H]], true));
  out.push(line(L.LAMINA, [0, y[1]], [W, y[1]]), line(L.LAMINA, [c0 + c1, y[2]], [W, y[2]]), line(L.LAMINA, [c0, y[3]], [W, y[3]]));
  out.push(line(L.LAMINA, [c0, y[0]], [c0, 0]), line(L.LAMINA, [c0 + c1, y[1]], [c0 + c1, 0]));
  for (let i = 1; i < tipos.length; i++) out.push(line(L.LAMINA, [r4(inicios[i]), y[1]], [r4(inicios[i]), 0]));
  // Encabezados ajustados al ancho de su columna (en el visor la letra es más ancha).
  const ajusta = (lineas, x, yc, ancho, hMax) => renglones(lineas, x, yc, ancho / HOLGURA_VISOR, hMax);
  out.push(...ajusta(["ESCALA", `1/${den}`], c0 / 2, (y[0] + y[1]) / 2, c0 * 0.8, hT * 0.42));
  out.push(text(L.LAMINA, [c0 + (W - c0) / 2, (y[0] + y[1]) / 2], "CUADRO DE COLUMNETAS", Math.min(hT * 0.85, (W - c0) * 0.8 / (anchoTexto("CUADRO DE COLUMNETAS", 1) * HOLGURA_VISOR))));
  out.push(...ajusta(["NIVEL", "1° Piso"], c0 / 2, (y[1] + y[3]) / 2, c0 * 0.8, hT * 0.55));
  out.push(...ajusta(["CONCRETO", "f'c (kg/cm²)"], c0 + c1 / 2, y[1] - (y[1] - y[2]) * 0.5 - hT * 0.55, c1 * 0.84, hT * 0.45));
  out.push(text(L.LAMINA, [c0 + c1 / 2, (y[2] + y[3]) / 2 - hT * 0.6], String(CRITERIOS.concreto.columnetas), hT * 0.7));
  out.push(...ajusta(["Refuerzo y", "estribaje"], c0 + c1 / 2, (y[3] + y[4]) / 2, c1 * 0.84, hT * 0.48));
  const resumen = tipos.map((t, i) => {
    const {b, h: hh} = medidas[i];
    const x0 = inicios[i], wTipo = anchos[i], xm = x0 + wTipo / 2;
    out.push(text(L.LAMINA, [xm, (y[1] + y[2]) / 2], t.codigo, Math.min(hT * 0.8, wTipo * 0.5)));
    // Sección a continuación de las llamadas (a su izquierda), centrada en lo que queda.
    const izq = x0 + margen + anchoLlamada + hc * 1.2;
    const cx = izq + (wTipo - margen - anchoCota - (izq - x0) - b * fs) / 2 + (b * fs) / 2;
    const cy = (y[2] + y[3]) / 2 - hc * 0.6;
    const X = (u) => r4(cx + u * fs), Y = (v) => r4(cy + v * fs);
    out.push(pline(L.COLUMNAS, [[X(-b / 2), Y(-hh / 2)], [X(b / 2), Y(-hh / 2)], [X(b / 2), Y(hh / 2)], [X(-b / 2), Y(hh / 2)]], true));
    // Estribo de 1/4" a doble línea con ganchos y varillas de 3/8" al diámetro real, tangentes.
    const r = CT.recubrimiento, de = diametro(CT.estribo), db = diametro(CT.barra);
    const e = r + de / 2; // eje del estribo
    const est = [{x: -b / 2 + e, y: -hh / 2 + e}, {x: b / 2 - e, y: -hh / 2 + e}, {x: b / 2 - e, y: hh / 2 - e}, {x: -b / 2 + e, y: hh / 2 - e}];
    const SX = (p) => [X(p.x), Y(p.y)];
    out.push(...estriboDetallado([est[2], est[3], est[0], est[1]], SX, {de, db})); // cierra arriba a la derecha
    const n = CT.varillasPorCara(b);
    const v = r + de + db / 2; // centro de las varillas a la cara
    const xb = (j) => -b / 2 + v + (j * (b - 2 * v)) / Math.max(1, n - 1);
    const caras = [hh / 2 - v, -hh / 2 + v];
    for (let j = 0; j < n; j++) for (const yy of caras) out.push(varilla({x: xb(j), y: yy}, db, SX, fs));
    // Medidas de la sección (".20" arriba, ".13" a la derecha), como el ingeniero.
    out.push(...cota(L.COTAS_E, [X(-b / 2), Y(hh / 2)], [X(b / 2), Y(hh / 2)], hc * 1.1, hc, cotaCorta(b)));
    out.push(...cota(L.COTAS_E, [X(b / 2), Y(hh / 2)], [X(b / 2), Y(-hh / 2)], hc * 1.1, hc, cotaCorta(hh)));
    // Llamadas como el ingeniero: una "2Ø3/8\"" por cada par de varillas (las dos caras),
    // apiladas a la izquierda con 1.7 alturas de letra entre renglones (no se tocan),
    // centradas en la sección y sin salir de la fila; cada una con su línea hasta su par.
    const llamada = `2Ø${CT.barra}`;
    const paso = hc * 1.7;
    const techo = y[2] - hc * 1.6, piso = y[3] + hc * 0.5;
    const arriba = Math.min(techo, Math.max(piso + (n - 1) * paso, cy + ((n - 1) * paso) / 2));
    const xFin = r4(x0 + margen);
    const xe = r4(xFin + anchoLlamada + hc * 0.4);
    for (let j = 0; j < n; j++) {
      const yTxt = r4(arriba - j * paso);
      out.push(line(L.COTAS_E, [X(xb(j)), Y(caras[1])], [xe, yTxt]), line(L.COTAS_E, [xe, yTxt], [xFin, yTxt]));
      out.push(text(L.COTAS_E, [xFin, r4(yTxt + hc * 0.3)], llamada, hc, 0, "izq"));
    }
    const total = 2 * n;
    const refuerzo = `${total}Ø${CT.barra}`;
    const estribaje = textoEstribos(CT.estribo, CT.distribucion);
    // Refuerzo y estribaje: tres renglones que caben en el ancho de la celda.
    const renglon2 = `□ ${CT.estribo}Ø: ${CT.distribucion.split(", Rto")[0]},`;
    const renglon3 = `Rto.@${CT.distribucion.split("Rto.@")[1] ?? "0.20 C/E"}`;
    out.push(...renglones([refuerzo, renglon2, renglon3], xm, (y[3] + y[4]) / 2, (wTipo * 0.9) / HOLGURA_VISOR, hT * 0.36));
    return {codigo: t.codigo, cantidad: t.cantidad, medida: `${hh.toFixed(2)}x${b.toFixed(2)}`, refuerzo, estribos: estribaje, escala: `1/${den}`};
  });
  return {filas: resumen, contenido: {primitivas: out, marco: {x0: 0, y0: 0, x1: W, y1: H}, h: hT, notas: []}};
}

const anchoAprox = (s) => [...String(s)].reduce((a, ch) => a + (/[A-Z0-9@]/.test(ch) ? 0.68 : /[ .,:;'"]/.test(ch) ? 0.3 : 0.55), 0) * 0.55;
