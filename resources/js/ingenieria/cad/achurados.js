// Contornos de achurado que se cruzan a sí mismos (texturas de piedra del concreto
// ciclópeo, achurados de estribos en los detalles del expediente). El visor los
// "repara" con PolyBool cada vez que los dibuja, con un épsilon tan chico que falla
// ("PolyBool: Zero-length segment detected") y llena la consola. Aquí se reparan una
// vez, al copiarlos al dibujo, con la misma librería y un épsilon proporcional al
// contorno: cada región queda como una polilínea cerrada simple.

import {PolyBool, GeometryEpsilon} from "@velipso/polybool";

const largo = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);
const signo = (o, e, t) => Math.sign((e.x - o.x) * (t.y - o.y) - (e.y - o.y) * (t.x - o.x));

const sinRepetidos = (pts) => {
  const out = [];
  for (const p of pts) if (Number.isFinite(p.x) && Number.isFinite(p.y) && !(out.length && largo(out.at(-1), p) < 1e-9)) out.push(p);
  while (out.length > 1 && largo(out[0], out.at(-1)) < 1e-9) out.pop();
  return out;
};

// La misma prueba que hace el visor antes de intentar reparar un contorno.
export function seCruza(pts) {
  const e = sinRepetidos(pts), t = e.length;
  if (t < 4) return false;
  for (let i = 0; i < t; i++) {
    for (let s = i + 1; s < t; s++) {
      if ((s + 1) % t === i || s === (i + 1) % t) continue;
      const a = e[i], b = e[(i + 1) % t], c = e[s], d = e[(s + 1) % t];
      if (signo(a, b, c) !== signo(a, b, d) && signo(c, d, a) !== signo(c, d, b)) return true;
    }
  }
  return false;
}

// Regiones simples de un contorno que se cruza; null si no se pudo.
export function regionesSimples(pts) {
  const limpio = sinRepetidos(pts);
  if (limpio.length < 3) return null;
  const xs = limpio.map((p) => p.x), ys = limpio.map((p) => p.y);
  const tam = Math.max(Math.max(...xs) - Math.min(...xs), Math.max(...ys) - Math.min(...ys));
  if (!(tam > 0)) return null;
  for (const factor of [1e-6, 1e-5, 1e-4]) {
    const eps = tam * factor;
    // Puntos más cerca que el épsilon dan segmentos "de largo cero" para PolyBool: se funden,
    // y se quitan los vértices alineados (dentro del épsilon) con sus vecinos.
    let base = [];
    for (const p of limpio) if (!(base.length && largo(base.at(-1), p) < eps * 10)) base.push(p);
    while (base.length > 1 && largo(base[0], base.at(-1)) < eps * 10) base.pop();
    for (let cambio = true; cambio && base.length > 3;) {
      cambio = false;
      for (let i = 0; i < base.length; i++) {
        const a = base[(i - 1 + base.length) % base.length], b = base[i], c = base[(i + 1) % base.length];
        const d = Math.abs((b.x - a.x) * (c.y - a.y) - (b.y - a.y) * (c.x - a.x)) / (largo(a, c) || 1);
        if (d < eps * 10) { base.splice(i, 1); cambio = true; break; }
      }
    }
    if (base.length < 3) continue;
    try {
      const pb = new PolyBool(new GeometryEpsilon(eps));
      const regiones = pb.polygon(pb.segments({regions: [base.map((p) => [p.x, p.y])], inverted: false})).regions
        .map((r) => sinRepetidos(r.map(([x, y]) => ({x, y}))))
        .filter((r) => r.length >= 3);
      if (regiones.length && regiones.every((r) => !seCruza(r))) return regiones;
    } catch { /* se prueba con un épsilon mayor */ }
  }
  return null;
}

// Envolvente convexa (cadena monótona). Para las texturas chicas que PolyBool no logra
// separar (piedras del ciclópeo de ~10 cm, casi convexas): a la vista queda igual.
export function envolvente(pts) {
  const p = [...sinRepetidos(pts)].sort((a, b) => a.x - b.x || a.y - b.y);
  if (p.length < 3) return null;
  const giro = (o, a, b) => (a.x - o.x) * (b.y - o.y) - (a.y - o.y) * (b.x - o.x);
  const abajo = [], arriba = [];
  for (const q of p) { while (abajo.length >= 2 && giro(abajo.at(-2), abajo.at(-1), q) <= 0) abajo.pop(); abajo.push(q); }
  for (const q of [...p].reverse()) { while (arriba.length >= 2 && giro(arriba.at(-2), arriba.at(-1), q) <= 0) arriba.pop(); arriba.push(q); }
  const h = [...abajo.slice(0, -1), ...arriba.slice(0, -1)];
  return h.length >= 3 ? h : null;
}

// Tamaño hasta el que un contorno se considera textura (unidades del bloque, metros).
const TEXTURA = 0.3;

// Repara en su lugar los contornos de un achurado que se cruzan. Devuelve cuántos.
export function repararAchurado(hatch, dm) {
  const lazos = hatch?._geo?._loops;
  if (!Array.isArray(lazos)) return 0;
  let reparados = 0;
  for (let i = lazos.length - 1; i >= 0; i--) {
    let pts;
    try { pts = lazos[i].tessellate ? lazos[i].tessellate() : lazos[i].getPoints(64); } catch { continue; }
    if (!seCruza(pts)) continue;
    let regiones = regionesSimples(pts);
    if (!regiones) {
      const xs = pts.map((p) => p.x), ys = pts.map((p) => p.y);
      const tam = Math.max(Math.max(...xs) - Math.min(...xs), Math.max(...ys) - Math.min(...ys));
      const h = tam <= TEXTURA ? envolvente(pts) : null;
      if (!h) continue; // contorno grande sin reparar: el visor lo dibuja igual (solo avisa)
      regiones = [h];
    }
    lazos.splice(i, 1, ...regiones.map((r) => new dm.AcGePolyline2d(r.map((p) => new dm.AcGePoint2d(p.x, p.y)), true)));
    reparados++;
  }
  if (reparados) { hatch._areasFromLoopsCache = undefined; hatch._geo._boundingBoxNeedsUpdate = true; }
  return reparados;
}
