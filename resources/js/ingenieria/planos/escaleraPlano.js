// Detalle de escalera (corte longitudinal de un tramo), como el expediente: "DETALLE ESCALERA
// TRAMO I ESC.: 1/25". Pasos, contrapasos, garganta, descanso, acero y sus llamadas.
//
// Predimensionamiento (criterio usual en Perú; el ingeniero lo confirma):
//  - contrapaso ≤ 0.175 m: n = ceil(altura de entrepiso / 0.175) repartido entre los tramos;
//  - paso: el de la arquitectura (0.25–0.30 m);
//  - garganta t = L/25 (L: proyección horizontal del tramo + descanso), mínimo 0.15 m;
//  - acero longitudinal Ø1/2" @0.20 (inferior) y Ø3/8" @0.20 (negativo en los apoyos),
//    transversal Ø3/8" @0.25.

import {L, line, pline, text} from "../cad/primitives.js";

const r2 = (v) => Math.round(v * 100) / 100;
const ceil05 = (v) => Math.ceil(v / 0.05 - 1e-9) * 0.05;
export const CRITERIOS_ESCALERA = {
  contrapasoMax: 0.175, descanso: 1.2, gargantaMin: 0.15,
  aceroLong: {diametro: '1/2"', separacion: 0.2, kgm: 0.994},
  aceroNeg: {diametro: '3/8"', separacion: 0.2, kgm: 0.56},
  aceroTransv: {diametro: '3/8"', separacion: 0.25, kgm: 0.56},
};

// escalera: {tramos: [{peldanos, huella, ancho}]} de escalerasEnPlanta; altura: de piso a piso (m).
export function predimensionarEscalera(escalera, altura) {
  const C = CRITERIOS_ESCALERA;
  const nTramos = Math.max(1, escalera?.tramos?.length ?? 1);
  const contrapasos = Math.max(2 * nTramos, Math.ceil(altura / C.contrapasoMax));
  const cp = altura / contrapasos;
  const huellas = (escalera?.tramos ?? []).map((t) => t.huella).filter((x) => x >= 0.25 && x <= 0.32);
  const paso = huellas.length ? r2(huellas.sort((a, b) => a - b)[Math.floor(huellas.length / 2)]) : 0.3;
  const ancho = Math.max(...(escalera?.tramos ?? [{ancho: 1.2}]).map((t) => t.ancho), 0.9);
  const porTramo = Math.ceil(contrapasos / nTramos);
  const Lh = (porTramo - 1) * paso + C.descanso;
  const t = Math.max(C.gargantaMin, ceil05(Lh / 25));
  return {nTramos, contrapasos, porTramo, cp: r2(cp), cpExacto: cp, paso, ancho: r2(ancho), garganta: r2(t), Lh: r2(Lh)};
}

// Corte de un tramo: n contrapasos, n-1 pasos y el descanso arriba. Coordenadas en metros.
export function detalleEscalera(dim, {nombre = "TRAMO I"} = {}) {
  const C = CRITERIOS_ESCALERA;
  const n = dim.porTramo, p = dim.paso, cp = dim.cpExacto, t = dim.garganta;
  const H = n * cp, xLanding = (n - 1) * p, xFin = xLanding + C.descanso;
  const cos = p / Math.hypot(p, cp), m = cp / p, dy = t / cos;
  const prim = [];
  // Perfil de concreto: peldaños arriba, garganta y descanso abajo.
  const arriba = [[0, 0]];
  for (let i = 0; i < n; i++) { arriba.push([i * p, (i + 1) * cp]); if (i < n - 1) arriba.push([(i + 1) * p, (i + 1) * cp]); }
  arriba.push([xFin, H]);
  const xb = (H - t + dy) / m;
  const contorno = [...arriba, [xFin, H - t], [xb, H - t], [0, -dy]];
  prim.push(pline(L.ALIGERADO, contorno.map(([x, y]) => [r2(x * 1000) / 1000, r2(y * 1000) / 1000]), true));
  // Apoyo inferior (cimiento de la escalera) y nivel de piso.
  prim.push(pline(L.ALIGERADO, [[-0.25, -dy], [0.35, -dy], [0.35, -dy - 0.5], [-0.25, -dy - 0.5]], true));
  prim.push(line(L.NIVELES, [-1.0, 0], [-0.05, 0]), line(L.NIVELES, [xFin + 0.05, H], [xFin + 0.9, H]));
  const h = 0.12;
  prim.push(text(L.NIVELES, [-0.6, 0.08], "NPT ±0.00", h * 0.8), text(L.NIVELES, [xFin + 0.5, H + 0.08], `NPT +${H.toFixed(2)}`, h * 0.8));
  // Acero inferior a 3 cm: sube por la garganta, sigue por el descanso y ancla abajo con gancho.
  const rec = 0.03, dyr = rec / cos;
  const xbr = (H - t + rec + dy - dyr) / m;
  prim.push(pline(L.ACERO_LONG, [[0.05, -dy + dyr + 0.05 * m - 0.35], [0.05, -dy + dyr + 0.05 * m], [xbr, H - t + rec], [xFin - rec, H - t + rec], [xFin - rec, H - rec]]));
  // Negativos en los apoyos (L/4) bajo la cara superior.
  const lneg = Math.max(0.6, dim.Lh / 4);
  const yTop = (x) => m * x - 0.04 / cos; // bajo los quiebres de los peldaños (dentro del concreto)
  prim.push(pline(L.ACERO_LONG, [[0.05, -dy + 0.15], [0.05, yTop(0.05) - 0.02], [lneg, yTop(lneg) - 0.02]]));
  prim.push(pline(L.ACERO_LONG, [[xLanding - lneg, yTop(xLanding - lneg) - 0.02], [xLanding - 0.02, H - 0.05], [xFin - rec, H - 0.05]]));
  // Transversales: puntos a lo largo de la garganta.
  for (let x = 0.3; x < xb - 0.1; x += C.aceroTransv.separacion) prim.push(pline(L.ACERO_LONG, [[x - 0.012, m * x - dy + dyr + 0.03], [x + 0.012, m * x - dy + dyr + 0.03]]));
  // Llamadas y cotas.
  const xm = xb * 0.5, ym = m * xm - dy;
  prim.push(text(L.TEXTO, [xm + 0.55, ym - 0.35], `Ø${C.aceroLong.diametro} @${C.aceroLong.separacion.toFixed(2)}`, h));
  prim.push(text(L.TEXTO, [xm + 0.55, ym - 0.55], `Ø${C.aceroTransv.diametro} @${C.aceroTransv.separacion.toFixed(2)} (transversal)`, h * 0.85));
  prim.push(text(L.TEXTO, [-0.55, 0.45], `Ø${C.aceroNeg.diametro} @${C.aceroNeg.separacion.toFixed(2)}`, h * 0.85));
  prim.push(text(L.TEXTO, [xLanding * 0.55, m * xLanding * 0.55 + cp + 0.55], `P = ${p.toFixed(2)}   CP = ${dim.cp.toFixed(3)}`, h * 0.85));
  prim.push(text(L.TEXTO, [xb * 0.3 + 0.5, m * (xb * 0.3) - dy - 0.25], `t = ${t.toFixed(2)}`, h * 0.85));
  prim.push(text(L.TEXTO, [xLanding + C.descanso / 2, H - t - 0.2], `DESCANSO e = ${t.toFixed(2)}`, h * 0.8));
  prim.push(text(L.TEXTO, [xFin * 0.4, -dy - 0.8], `${n} CP de ${dim.cp.toFixed(3)} m · ancho ${dim.ancho.toFixed(2)} m · f'c = 210 kg/cm²`, h * 0.8));
  const caja = {x0: -1.1, y0: -dy - 1.0, x1: xFin + 1.0, y1: H + 0.5};
  // Metrado de este tramo (por ancho): área del corte, encofrado (fondo + contrapasos) y acero.
  const area = Math.abs(contorno.reduce((s, [x, y], i) => { const [x2, y2] = contorno[(i + 1) % contorno.length]; return s + x * y2 - x2 * y; }, 0)) / 2;
  const fondo = Math.hypot(xb, H - t + dy) + C.descanso;
  const nLong = Math.floor(dim.ancho / C.aceroLong.separacion) + 1;
  const largoLong = fondo + 0.35 + t;
  const nTransv = Math.floor(fondo / C.aceroTransv.separacion) + 1;
  const nNeg = Math.floor(dim.ancho / C.aceroNeg.separacion) + 1;
  const modelo = {
    concreto: area * dim.ancho, encofrado: fondo * dim.ancho + n * cp * dim.ancho,
    acero: nLong * largoLong * C.aceroLong.kgm + nTransv * dim.ancho * C.aceroTransv.kgm + 2 * nNeg * (lneg + 0.3) * C.aceroNeg.kgm,
  };
  return {
    modelo,
    contenido: {titulo: `DETALLE DE ESCALERA - ${nombre}`, primitivas: prim, marco: caja, ejes: caja, h,
      notas: [`Escalera: ${dim.contrapasos} contrapasos de ${dim.cp.toFixed(3)} m, paso ${dim.paso.toFixed(2)} m, garganta ${t.toFixed(2)} m (predimensionado: confirmar)`]},
  };
}
