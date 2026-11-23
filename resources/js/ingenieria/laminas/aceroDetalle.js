// Detallado del acero como en los cuadros del ingeniero (módulos 3, 4 y 14):
//  - varillas al diámetro real;
//  - estribo a doble línea (se ve el grosor de la varilla), con las esquinas dobladas: el
//    radio del doblez abraza la varilla de esquina, que queda tangente al estribo;
//  - cierre con dos ganchos a 135° (E.060: 6 db, mínimo 7.5 cm) que siguen el doblez y
//    entran al núcleo, con la punta redondeada;
//  - llamadas en abanico: una etiqueta ("6Ø5/8\"") con una línea a cada varilla del grupo.
// Todo en metros de la sección; S(p) lleva cada punto a la lámina.

import {L, line, pline, circle, text} from "../cad/primitives.js";
import {desplazarPoligono} from "../planos/aligeradoPlano.js";

// Diámetros nominales (m) de las varillas corrugadas (NTP 341.031).
export const DIAMETRO = {'1/4"': 0.00635, '3/8"': 0.009525, '1/2"': 0.0127, '5/8"': 0.015875, '3/4"': 0.01905, '1"': 0.0254};
export const diametro = (d) => DIAMETRO[String(d).replace(/[Øø\s]/g, "")] ?? 0.0127;

const r4 = (v) => Math.round(v * 10000) / 10000;
const sub = (a, b) => ({x: a.x - b.x, y: a.y - b.y});
const unit = (v) => { const l = Math.hypot(v.x, v.y) || 1; return {x: v.x / l, y: v.y / l}; };
const cruz = (a, b) => a.x * b.y - a.y * b.x;
const area2 = (pts) => pts.reduce((s, p, i) => s + cruz(p, pts[(i + 1) % pts.length]), 0);
const normalizar = (a) => { let d = a; while (d > Math.PI) d -= 2 * Math.PI; while (d < -Math.PI) d += 2 * Math.PI; return d; };
const arco = (c, r, a0, a1, n) => Array.from({length: n + 1}, (_, k) => {
  const a = a0 + ((a1 - a0) * k) / n;
  return {x: c.x + r * Math.cos(a), y: c.y + r * Math.sin(a)};
});

// Polígono con las esquinas redondeadas (radio r) como polilínea de puntos; por vértice, el
// centro del doblez y los ángulos de sus puntos de tangencia.
export function redondear(q, r, segmentos = 8) {
  const pts = [], dobleces = [];
  const n = q.length;
  for (let i = 0; i < n; i++) {
    const c = q[i], va = unit(sub(q[(i + n - 1) % n], c)), vb = unit(sub(q[(i + 1) % n], c));
    const la = Math.hypot(q[(i + n - 1) % n].x - c.x, q[(i + n - 1) % n].y - c.y), lb = Math.hypot(q[(i + 1) % n].x - c.x, q[(i + 1) % n].y - c.y);
    const phi = Math.acos(Math.max(-1, Math.min(1, va.x * vb.x + va.y * vb.y)));
    if (phi < 0.1 || phi > Math.PI - 0.05 || r <= 0) { pts.push(c); dobleces.push(null); continue; }
    const rr = Math.min(r, 0.45 * Math.min(la, lb) * Math.tan(phi / 2));
    const dt = rr / Math.tan(phi / 2);
    const t0 = {x: c.x + va.x * dt, y: c.y + va.y * dt}, t1 = {x: c.x + vb.x * dt, y: c.y + vb.y * dt};
    const bis = unit({x: va.x + vb.x, y: va.y + vb.y});
    const o = {x: c.x + bis.x * (rr / Math.sin(phi / 2)), y: c.y + bis.y * (rr / Math.sin(phi / 2))};
    const a0 = Math.atan2(t0.y - o.y, t0.x - o.x), a1 = a0 + normalizar(Math.atan2(t1.y - o.y, t1.x - o.x) - a0);
    pts.push(...arco(o, rr, a0, a1, segmentos));
    dobleces.push({o, r: rr, a0, a1, adentro: bis});
  }
  return {pts, dobleces};
}

// Estribo detallado. eje: polígono del eje del estribo (su primer vértice es la esquina donde
// cierra con los ganchos). de: diámetro del estribo; db: de las varillas de esquina.
export function estriboDetallado(eje, S, {de = DIAMETRO['3/8"'], db = DIAMETRO['5/8"'], ganchos = true, capa = L.ESTRIBOS, largoGancho = null} = {}) {
  const ccw = Math.sign(area2(eje)) || 1;
  const q = ccw > 0 ? eje : [eje[0], ...eje.slice(1).reverse()]; // antihorario, mismo primer vértice
  const R = (db + de) / 2; // radio del eje del doblez: la varilla de esquina queda tangente adentro
  const out = [];
  for (const lado of [-1, 1]) {
    let p = q;
    try { p = desplazarPoligono(q, (lado * de) / 2); } catch { /* sección muy chica */ }
    out.push(pline(capa, redondear(p, R + (lado * de) / 2).pts.map(S), true));
  }
  if (!ganchos) return out;
  // Ganchos a 135°: cada extremo sigue el doblez de la esquina 45° más allá de la tangencia y
  // entra recto al núcleo (paralelo a la bisectriz), con la punta redondeada.
  const d0 = redondear(q, R).dobleces[0];
  if (!d0) return out;
  const nucleo = Math.min(...[1, 2].map((k) => Math.hypot(q[k].x - q[k - 1].x, q[k].y - q[k - 1].y))) - 2 * R;
  const largo = largoGancho ?? Math.max(0.02, Math.min(Math.max(6 * de, 0.075), 0.75 * nucleo));
  const barrido = d0.a1 - d0.a0; // ±90°
  for (const [desde, sentido] of [[d0.a1, Math.sign(barrido)], [d0.a0, -Math.sign(barrido)]]) {
    const hasta = desde + sentido * Math.PI / 4;
    const fin = {x: d0.o.x + d0.r * Math.cos(hasta), y: d0.o.y + d0.r * Math.sin(hasta)};
    const tangente = {x: -sentido * Math.sin(hasta), y: sentido * Math.cos(hasta)};
    const radial = {x: Math.cos(hasta), y: Math.sin(hasta)};
    const punta = {x: fin.x + tangente.x * largo, y: fin.y + tangente.y * largo};
    for (const lado of [-1, 1]) {
      const rr = d0.r + (lado * de) / 2;
      const curva = arco(d0.o, rr, desde, hasta, 4);
      const a = {x: fin.x + radial.x * (lado * de) / 2, y: fin.y + radial.y * (lado * de) / 2};
      const b = {x: punta.x + radial.x * (lado * de) / 2, y: punta.y + radial.y * (lado * de) / 2};
      out.push(pline(capa, [...curva, a, b].map(S), false));
    }
    // Punta redondeada (media circunferencia del diámetro del estribo).
    const ang = Math.atan2(radial.y, radial.x);
    out.push(pline(capa, arco(punta, de / 2, ang, ang + sentido * Math.PI, 6).map(S), false));
  }
  return out;
}

// Eje del estribo de un contorno de concreto: a recubrimiento + medio estribo de las caras.
export function ejeDelEstribo(contorno, recubrimiento, de) {
  try { return desplazarPoligono(contorno, -(recubrimiento + de / 2)); } catch { return contorno; }
}

// Varillas dibujadas a su diámetro real.
export const varilla = (p, db, S, fs, capa = L.ESTRIBOS) => circle(capa, S(p), r4((db / 2) * fs));

// Llamada en abanico: una línea desde el borde de cada varilla hasta el quiebre, la línea de
// apoyo y la etiqueta encima. quiebre y fin en coordenadas de lámina; barras en metros (S).
export function llamadaAbanico(barras, etiqueta, {S, fs, db, quiebre, fin, h, capa = L.COTAS_E}) {
  const out = [];
  for (const p of barras) {
    const c = S(p);
    const v = unit({x: quiebre[0] - c[0], y: quiebre[1] - c[1]});
    const borde = [r4(c[0] + v.x * (db / 2) * fs), r4(c[1] + v.y * (db / 2) * fs)];
    out.push(line(capa, borde, quiebre));
  }
  out.push(line(capa, quiebre, fin));
  const izq = Math.min(quiebre[0], fin[0]);
  out.push(text(capa, [r4(izq + h * 0.2), r4(quiebre[1] + h * 0.35)], etiqueta, h, 0, "izq"));
  return out;
}
