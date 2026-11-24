// Detalle de escalera (corte longitudinal de un tramo), como el expediente: "DETALLE ESCALERA
// TRAMO I ESC.: 1/25". Pasos, contrapasos, garganta, descanso, acero y sus llamadas.
//
// Predimensionamiento (criterio usual en Perú; el ingeniero lo confirma):
//  - contrapaso ≤ 0.175 m: n = ceil(altura de entrepiso / 0.175) repartido entre los tramos;
//  - paso: el de la arquitectura (0.25–0.30 m);
//  - garganta t = L/25 (L: proyección horizontal del tramo + descanso), mínimo 0.15 m;
//  - acero longitudinal Ø1/2" @0.20 (inferior) y Ø3/8" @0.20 (negativo en los apoyos),
//    transversal Ø3/8" @0.25.

import {L, line, pline, text, circle} from "../cad/primitives.js";

const r2 = (v) => Math.round(v * 100) / 100;
const ceil05 = (v) => Math.ceil(v / 0.05 - 1e-9) * 0.05;
export const CRITERIOS_ESCALERA = {
  contrapasoMax: 0.175, descanso: 1.2, gargantaMin: 0.15,
  // Como el ingeniero en sus detalles por tramo: el primer tramo nace en un cimiento de 0.40 x 0.60
  // bajo el primer contrapaso; cada descanso termina en una viga de 0.30 x 0.40; acero en dos capas
  // (varillas transversales vistas en corte cada 0.20) con 4 cm de recubrimiento.
  cimiento: {ancho: 0.4, alto: 0.6}, vigaDescanso: {b: 0.3, h: 0.4}, descansoDetalle: 2.0, recubrimiento: 0.04,
  aceroLong: {diametro: '1/2"', separacion: 0.2, kgm: 0.994},
  aceroNeg: {diametro: '3/8"', separacion: 0.2, kgm: 0.56},
  aceroTransv: {diametro: '3/8"', separacion: 0.25, kgm: 0.56},
};

// escalera: {tramos: [{peldanos, huella, ancho}]} de escalerasEnPlanta; altura: de piso a piso (m).
export function predimensionarEscalera(escalera, altura) {
  const C = CRITERIOS_ESCALERA;
  const contrapasos0 = Math.ceil(altura / C.contrapasoMax);
  // Tramos por nivel: los que se ven en la planta o, si la planta muestra menos, los que salen de
  // sus peldaños (un tramo de k peldaños dibujados sube k + 1 contrapasos: ilo 3 tramos de 7) y
  // nunca más de 17 contrapasos seguidos (RNE A.010).
  const pelda = (escalera?.tramos ?? []).map((t) => t.peldanos).filter((x) => x > 0).sort((a, b) => a - b);
  const porPlanta = pelda.length ? Math.round(contrapasos0 / (pelda[Math.floor(pelda.length / 2)] + 1)) : 1;
  const nTramos = Math.max(1, escalera?.tramos?.length ?? 1, porPlanta, Math.ceil(contrapasos0 / 17));
  const contrapasos = Math.max(2 * nTramos, contrapasos0);
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

// Contrapasos de cada tramo: los del nivel repartidos según los peldaños que la planta dibuja en
// cada tramo (o por igual: el resto va primero al primer tramo y luego al último).
export function contrapasosPorTramo(dim, escalera = null) {
  const n = Math.max(1, dim.nTramos ?? 1), total = dim.contrapasos;
  const pesos = (escalera?.tramos ?? []).map((t) => t.peldanos).filter((x) => x > 0);
  let base, orden;
  if (pesos.length === n) {
    // Mayor resto: cada tramo lleva la parte entera de su cuota y los que faltan van a los de
    // mayor resto (6, 5 y 6 peldaños en planta con 20 contrapasos: 7, 6 y 7).
    const suma = pesos.reduce((a, b) => a + b, 0), cuota = pesos.map((w) => (total * w) / suma);
    base = cuota.map((c) => Math.max(2, Math.floor(c)));
    orden = cuota.map((c, i) => [c - Math.floor(c), i]).sort((x, y) => y[0] - x[0]).map(([, i]) => i);
  } else {
    base = Array.from({length: n}, () => Math.floor(total / n));
    orden = [0, n - 1, ...Array.from({length: n}, (_, i) => i).slice(1, -1)];
  }
  for (let k = 0; base.reduce((a, b) => a + b, 0) < total; k++) base[orden[k % orden.length]]++;
  for (let k = n - 1; base.reduce((a, b) => a + b, 0) > total && k >= 0; k--) if (base[k] > 2) base[k]--;
  return base;
}

const ROMANOS = ["I", "II", "III", "IV", "V", "VI"];

// Detalle de UN tramo, como el ingeniero ("DETALLE DE ESCALERA TRAMO II"): el tramo de n
// contrapasos con su garganta, el descanso de abajo (los tramos que no nacen en el piso) o el
// cimiento (el primero), el descanso de arriba con su viga, el acero en dos capas y las llamadas.
// Coordenadas en metros: x = 0 en el primer contrapaso, y = 0 en el piso del que sube el tramo.
export function detalleTramoEscalera(dim, {indice = 0, contrapasos, total = 1, desde = 0} = {}) {
  const C = CRITERIOS_ESCALERA;
  const n = contrapasos ?? dim.porTramo, p = dim.paso, cp = dim.cpExacto, t = dim.garganta;
  const H = n * cp, xL = (n - 1) * p, D = Math.max(C.descanso, C.descansoDetalle), xFin = xL + D;
  const m = cp / p, cos = p / Math.hypot(p, cp), dy = t / cos;
  const primero = indice === 0;
  const R = (v) => Math.round(v * 1000) / 1000;
  const P = (x, y) => [R(x), R(y)];
  const prim = [];
  // Concreto: peldaños arriba; abajo la garganta (paralela a la línea de las narices) que llega al
  // fondo del descanso de arriba y, abajo, al fondo del descanso inferior o al cimiento.
  const narices = [];
  for (let i = 0; i < n; i++) { narices.push(P(i * p, (i + 1) * cp)); if (i < n - 1) narices.push(P((i + 1) * p, (i + 1) * cp)); }
  const yGar = (x) => m * x + cp - dy; // fondo de la losa inclinada
  const xArriba = (H - t - cp + dy) / m; // donde la garganta toca el fondo del descanso de arriba
  const xAbajo = (-t - cp + dy) / m;     // donde toca el fondo del descanso de abajo
  const vb = C.vigaDescanso;
  const contorno = primero
    ? [P(0, 0), ...narices, P(xFin, H), P(xFin, H - t), P(xArriba, H - t), P(0, yGar(0))]
    : [P(-D, 0), P(0, 0), ...narices, P(xFin, H), P(xFin, H - t), P(xArriba, H - t), P(xAbajo, -t), P(-D, -t)];
  prim.push(pline(L.ALIGERADO, contorno, true));
  // Viga al final de cada descanso (0.30 x 0.40) y cimiento bajo el primer tramo (0.40 x 0.60).
  const rect = (x0, y0, x1, y1) => pline(L.ALIGERADO, [P(x0, y0), P(x1, y0), P(x1, y1), P(x0, y1)], true);
  prim.push(rect(xFin - vb.b, H - vb.h, xFin, H));
  if (!primero) prim.push(rect(-D, -vb.h, -D + vb.b, 0));
  const {ancho: wc, alto: hc} = C.cimiento;
  if (primero) prim.push(rect(0, -hc, wc, 0));
  // Acero: varillas transversales en corte (círculos) en dos capas, cada 0.20 a lo largo de la
  // losa y de los descansos; las longitudinales (inferior corrida, superior en los apoyos).
  const r = C.recubrimiento, rv = 0.013, sep = C.aceroLong.separacion;
  const fila = (a, b) => {
    const l = Math.hypot(b[0] - a[0], b[1] - a[1]), k = Math.max(1, Math.round(l / sep));
    for (let i = 0; i <= k; i++) prim.push(circle(L.ACERO_LONG, P(a[0] + ((b[0] - a[0]) * i) / k, a[1] + ((b[1] - a[1]) * i) / k), rv));
  };
  const x0r = primero ? 0.05 : 0;
  fila([x0r, yGar(x0r) + r / cos], [xArriba, yGar(xArriba) + r / cos]);
  fila([x0r + 0.02, yGar(x0r) + (t - r) / cos], [xArriba, yGar(xArriba) + (t - r) / cos]);
  fila([xArriba + sep / 2, H - t + r], [xFin - r, H - t + r]);
  fila([xArriba + sep / 2, H - r], [xFin - r, H - r]);
  if (!primero) { fila([-D + r, -t + r], [xAbajo - sep / 2, -t + r]); fila([-D + r, -r], [-sep / 2, -r]); }
  else for (const xx of [r + 0.04, wc - r - 0.04]) for (const yy of [-hc + r + 0.04, -hc / 2, -r - 0.04]) prim.push(circle(L.ACERO_LONG, P(xx, yy), rv));
  const inf = primero ? [P(0.05, -hc + r), P(0.05, yGar(0.05) + r / cos)] : [P(-D + r, -t + r), P(xAbajo, -t + r)];
  prim.push(pline(L.ACERO_LONG, [...inf, P(xArriba, H - t + r), P(xFin - r, H - t + r), P(xFin - r, H - r)]));
  const lneg = Math.max(0.6, (xL + D) / 4);
  prim.push(pline(L.ACERO_LONG, [P(xL - lneg, yGar(xL - lneg) + (t - r) / cos), P(xL + 0.02, H - r), P(xFin - r, H - r)]));
  if (!primero) prim.push(pline(L.ACERO_LONG, [P(-D + r, -r), P(-0.02, -r), P(lneg, yGar(lneg) + (t - r) / cos)]));
  // Niveles, llamadas (capas de texto y niveles: no son dibujo).
  const h = 0.12;
  const xIzq = primero ? -0.05 : -D - 0.05;
  prim.push(line(L.NIVELES, P(xIzq - 0.9, 0), P(xIzq, 0)), line(L.NIVELES, P(xFin + 0.05, H), P(xFin + 0.95, H)));
  prim.push(text(L.NIVELES, P(xIzq - 0.45, 0.08), primero ? "NPT ±0.00" : `DESCANSO +${desde.toFixed(2)}`, h * 0.8), text(L.NIVELES, P(xFin + 0.5, H + 0.08), `+${(desde + H).toFixed(2)}`, h * 0.8));
  const xm = xArriba * 0.5;
  prim.push(text(L.TEXTO, P(xm + 0.7, yGar(xm) - 0.35), `Ø${C.aceroLong.diametro} @${C.aceroLong.separacion.toFixed(2)}`, h));
  prim.push(text(L.TEXTO, P(xm + 0.7, yGar(xm) - 0.55), `Ø${C.aceroTransv.diametro} @${C.aceroTransv.separacion.toFixed(2)}`, h * 0.85));
  prim.push(text(L.TEXTO, P(xL * 0.45 - 0.3, m * xL * 0.45 + cp + 0.45), `P = ${p.toFixed(2)}   CP = ${dim.cp.toFixed(3)}`, h * 0.85));
  prim.push(text(L.TEXTO, P(xL + D / 2, H - Math.max(t, vb.h) - 0.25), `DESCANSO e = ${t.toFixed(2)}`, h * 0.8));
  const yPie = (primero ? -hc : -vb.h) - 0.3;
  prim.push(text(L.TEXTO, P((xIzq + xFin) / 2, yPie), `${n} CP de ${dim.cp.toFixed(3)} m · ancho ${dim.ancho.toFixed(2)} m · f'c = 210 kg/cm²`, h * 0.8));
  const caja = {x0: xIzq - 1.0, y0: yPie - 0.25, x1: xFin + 1.0, y1: H + 0.6};
  const nombre = `TRAMO ${ROMANOS[indice] ?? indice + 1}`;
  return {
    contenido: {titulo: `DETALLE DE ESCALERA ${nombre}`, primitivas: prim, marco: caja, ejes: caja, h,
      notas: indice === 0 ? [`Escalera: ${dim.contrapasos} contrapasos de ${dim.cp.toFixed(3)} m en ${total} tramo(s), paso ${dim.paso.toFixed(2)} m, garganta ${t.toFixed(2)} m (predimensionado: confirmar)`] : []},
  };
}

// Un detalle por tramo (TRAMO I, TRAMO II…), como los dibuja el ingeniero.
export function detallesEscaleraPorTramo(dim, escalera = null) {
  const cps = contrapasosPorTramo(dim, escalera);
  // Niveles de cada tramo sobre el piso: el descanso de llegada de uno es la salida del siguiente.
  return cps.map((n, i) => detalleTramoEscalera(dim, {indice: i, contrapasos: n, total: cps.length, desde: cps.slice(0, i).reduce((s, k) => s + k, 0) * dim.cpExacto}));
}
