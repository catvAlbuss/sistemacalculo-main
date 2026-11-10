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

// Estribo dibujado con su gancho a 135° en la primera esquina.
function estriboConGancho(q, S, largo) {
  const out = [pline(L.ESTRIBOS, q.map(S), true)];
  const c = q[0], a = q[1], b = q[q.length - 1];
  const centro = q.reduce((acc, p) => ({x: acc.x + p.x / q.length, y: acc.y + p.y / q.length}), {x: 0, y: 0});
  const hacia = sub(centro, c), l = Math.hypot(hacia.x, hacia.y) || 1;
  const d = {x: hacia.x / l, y: hacia.y / l};
  for (const lado of [a, b]) {
    const u = sub(lado, c), lu = Math.hypot(u.x, u.y) || 1;
    const p0 = {x: c.x + (u.x / lu) * largo * 0.35, y: c.y + (u.y / lu) * largo * 0.35};
    out.push(line(L.ESTRIBOS, S(p0), S({x: p0.x + d.x * largo, y: p0.y + d.y * largo})));
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
    const alas = alasDeSeccion(c.contorno);
    const estribos = alas.map((a) => { try { return desplazarPoligono(a, -C.recubrimiento); } catch { return a; } });
    for (const q of estribos) out.push(...estriboConGancho(q, S, 0.06));
    const varillas = varillasDeSeccion(alas, ref.n, C.recubrimiento + 0.018);
    for (const p of varillas) out.push(circle(L.ESTRIBOS, S(p), r4(0.0095 * fs)));
    // Medidas de la sección (".40", ".25"), como el ingeniero.
    out.push(...cotasDeContorno(c.contorno, S, {separacion: hT * 0.16, alto: hT * 0.15}));
    // Rótulo de varillas con su línea de llamada, como en el expediente.
    const arriba = varillas.reduce((a, p) => (p.y - p.x * 0.2 > a.y - a.x * 0.2 ? p : a), varillas[0] ?? {x: c.x, y: c.y});
    const pA = S(arriba), pR = [r4(x0 + wTipo * 0.93), r4(Math.min(y[2] - hT * 0.25, pA[1] + hT * 0.45))];
    out.push(line(L.COTAS_E, pA, [pR[0] - wTipo * 0.2, pR[1]]), line(L.COTAS_E, [pR[0] - wTipo * 0.2, pR[1]], pR));
    out.push(text(L.COTAS_E, [pR[0] - wTipo * 0.1, pR[1] + hT * 0.1], `${ref.n}Ø5/8"`, hT * 0.14));
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
      out.push(...estriboConGancho(q, SE, 0.05));
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
const ESCALAS_DETALLE = [10, 15, 20, 25];
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
  const c0 = W * 0.075, c1 = W * 0.1, wTipo = (W - c0 - c1) / tipos.length;
  const filas = [0.36, 0.3, 1.5, 0.74].map((f) => (f * H) / 2.9);
  const y = [H]; filas.forEach((f) => y.push(y.at(-1) - f));
  const hT = H / 2.9 * 0.3;
  // Escala común: la sección más grande ocupa a lo más el 45 % del ancho y el 50 % del alto de su celda.
  const medidas = tipos.map((t) => ({b: Math.max(t.muestra.b, t.muestra.h), h: Math.min(t.muestra.b, t.muestra.h)}));
  const cabe = Math.min(...medidas.map((m) => Math.min((wTipo * 0.45) / m.b, ((y[2] - y[3]) * 0.5) / m.h)));
  const den = ESCALAS_DETALLE.find((d) => 50 / d <= cabe) ?? Math.ceil(50 / cabe);
  const fs = 50 / den;
  const out = [];
  out.push(pline(L.LAMINA, [[0, 0], [W, 0], [W, H], [0, H]], true));
  out.push(line(L.LAMINA, [0, y[1]], [W, y[1]]), line(L.LAMINA, [c0 + c1, y[2]], [W, y[2]]), line(L.LAMINA, [c0, y[3]], [W, y[3]]));
  out.push(line(L.LAMINA, [c0, y[0]], [c0, 0]), line(L.LAMINA, [c0 + c1, y[1]], [c0 + c1, 0]));
  for (let i = 1; i < tipos.length; i++) out.push(line(L.LAMINA, [c0 + c1 + i * wTipo, y[1]], [c0 + c1 + i * wTipo, 0]));
  out.push(text(L.LAMINA, [c0 / 2, (y[0] + y[1]) / 2 + hT * 0.2], "ESCALA", hT * 0.42), text(L.LAMINA, [c0 / 2, (y[0] + y[1]) / 2 - hT * 0.38], `1/${den}`, hT * 0.42));
  out.push(text(L.LAMINA, [c0 + (W - c0) / 2, (y[0] + y[1]) / 2], "CUADRO DE COLUMNETAS", hT * 0.85));
  out.push(text(L.LAMINA, [c0 / 2, (y[1] + y[3]) / 2 + hT * 0.4], "NIVEL", hT * 0.55), text(L.LAMINA, [c0 / 2, (y[1] + y[3]) / 2 - hT * 0.4], "1° Piso", hT * 0.55));
  out.push(text(L.LAMINA, [c0 + c1 / 2, y[1] - hT * 0.55], "CONCRETO", hT * 0.45), text(L.LAMINA, [c0 + c1 / 2, y[1] - hT * 1.15], "f'c (kg/cm²)", hT * 0.42));
  out.push(text(L.LAMINA, [c0 + c1 / 2, (y[2] + y[3]) / 2 - hT * 0.6], String(CRITERIOS.concreto.columnetas), hT * 0.7));
  out.push(text(L.LAMINA, [c0 + c1 / 2, (y[3] + y[4]) / 2 + hT * 0.3], "Refuerzo y", hT * 0.48), text(L.LAMINA, [c0 + c1 / 2, (y[3] + y[4]) / 2 - hT * 0.35], "estribaje", hT * 0.48));
  const hc = hT * 0.45; // texto de cotas y llamadas: como el refuerzo (el ingeniero no las achica)
  const resumen = tipos.map((t, i) => {
    const {b, h: hh} = medidas[i];
    const x0 = c0 + c1 + i * wTipo, xm = x0 + wTipo / 2;
    out.push(text(L.LAMINA, [xm, (y[1] + y[2]) / 2], t.codigo, hT * 0.8));
    // Sección centrada un poco a la derecha: a la izquierda van las llamadas de varillas.
    const cx = xm + wTipo * 0.1, cy = (y[2] + y[3]) / 2 - hT * 0.05;
    const X = (u) => r4(cx + u * fs), Y = (v) => r4(cy + v * fs);
    out.push(pline(L.COLUMNAS, [[X(-b / 2), Y(-hh / 2)], [X(b / 2), Y(-hh / 2)], [X(b / 2), Y(hh / 2)], [X(-b / 2), Y(hh / 2)]], true));
    const r = CT.recubrimiento;
    const est = [{x: -b / 2 + r, y: -hh / 2 + r}, {x: b / 2 - r, y: -hh / 2 + r}, {x: b / 2 - r, y: hh / 2 - r}, {x: -b / 2 + r, y: hh / 2 - r}];
    out.push(...estriboConGancho([est[3], est[0], est[1], est[2]], (p) => [X(p.x), Y(p.y)], Math.min(0.04, hh * 0.3)));
    const n = CT.varillasPorCara(b);
    const xb = (j) => -b / 2 + r + 0.012 + (j * (b - 2 * r - 0.024)) / Math.max(1, n - 1);
    const caras = [hh / 2 - r - 0.012, -hh / 2 + r + 0.012];
    for (let j = 0; j < n; j++) for (const yy of caras) out.push(circle(L.ESTRIBOS, [X(xb(j)), Y(yy)], r4(0.0065 * fs)));
    // Medidas de la sección (".20" arriba, ".13" a la derecha), como el ingeniero.
    out.push(...cota(L.COTAS_E, [X(-b / 2), Y(hh / 2)], [X(b / 2), Y(hh / 2)], hT * 0.35, hc, cotaCorta(b)));
    out.push(...cota(L.COTAS_E, [X(b / 2), Y(hh / 2)], [X(b / 2), Y(-hh / 2)], hT * 0.35, hc, cotaCorta(hh)));
    // Llamadas como el ingeniero: una "2Ø3/8\"" por cada par de varillas (las dos caras),
    // escalonadas a la izquierda desde la mitad de la sección hacia abajo, cada una con su
    // línea hasta su par.
    const llamada = `2Ø${CT.barra}`;
    const piso = y[3] + hc * 0.4;
    const paso = n > 1 ? Math.min(hc * 1.3, (cy - piso) / (n - 1)) : 0;
    const xe = r4(X(-b / 2) - wTipo * 0.05);
    const xFin = r4(Math.max(x0 + wTipo * 0.03, xe - anchoTexto(llamada, hc) - hc * 0.3));
    for (let j = 0; j < n; j++) {
      const yTxt = r4(cy - j * paso);
      out.push(line(L.COTAS_E, [X(xb(j)), Y(caras[1])], [xe, yTxt]), line(L.COTAS_E, [xe, yTxt], [xFin, yTxt]));
      out.push(text(L.COTAS_E, [xFin, r4(yTxt + hc * 0.3)], llamada, hc, 0, "izq"));
    }
    const total = 2 * n;
    const refuerzo = `${total}Ø${CT.barra}`;
    const estribaje = textoEstribos(CT.estribo, CT.distribucion);
    const hr = Math.min(hT * 0.36, (wTipo * 0.92) / (anchoAprox(estribaje)));
    out.push(text(L.LAMINA, [xm, (y[3] + y[4]) / 2 + hT * 0.42], refuerzo, hr * 1.1));
    out.push(text(L.LAMINA, [xm, (y[3] + y[4]) / 2 - hT * 0.12], `□ ${CT.estribo}Ø: ${CT.distribucion.split(", Rto")[0]},`, hr));
    out.push(text(L.LAMINA, [xm, (y[3] + y[4]) / 2 - hT * 0.6], `Rto.@${CT.distribucion.split("Rto.@")[1] ?? "0.20 C/E"}`, hr));
    return {codigo: t.codigo, cantidad: t.cantidad, medida: `${hh.toFixed(2)}x${b.toFixed(2)}`, refuerzo, estribos: estribaje, escala: `1/${den}`};
  });
  return {filas: resumen, contenido: {primitivas: out, marco: {x0: 0, y0: 0, x1: W, y1: H}, h: hT, notas: []}};
}

const anchoAprox = (s) => [...String(s)].reduce((a, ch) => a + (/[A-Z0-9@]/.test(ch) ? 0.68 : /[ .,:;'"]/.test(ch) ? 0.3 : 0.55), 0) * 0.55;
