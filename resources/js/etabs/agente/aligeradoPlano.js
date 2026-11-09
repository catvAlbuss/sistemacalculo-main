// Arquitectura → estructuras: plano de losa aligerada sobre la misma planta.
// Vigas en los ejes entre columnas, un paño de losa con las viguetas en la
// dirección de la luz corta (cada 0.40 m: vigueta 0.10 + ladrillo 0.30) y su
// símbolo de dirección. Devuelve el contenido en coordenadas de la planta.

import {L, line, pline, text, hatch} from "./primitives.js";
import {primitivasBase, tramosEntreColumnas, envolvente, banda, rotularTramos, murosDelEdificio} from "./cimentacionPlano.js";
import {CRITERIOS} from "./criteriosEstructurales.js";

const SEPARACION_VIGUETAS = 0.4;
const pt = (p) => [Math.round(p.x * 10000) / 10000, Math.round(p.y * 10000) / 10000];
const ceil05 = (v) => Math.ceil(v / 0.05 - 1e-9) * 0.05;

// Espesor de aligerado por luz libre (práctica peruana: h ≈ L/25, mínimo 0.20 m).
export const espesorAligerado = (luz) => (luz <= 5 ? 0.2 : luz <= 6.5 ? 0.25 : 0.3);
// Peralte de viga: L/12 redondeado a 5 cm, mínimo 0.40 m; ancho 0.25 m.
export const seccionViga = (luz) => ({b: 0.25, h: Math.max(0.4, ceil05(luz / 12))});

// Recorta la recta p + t·d con un polígono convexo; devuelve el tramo interior o null.
export function recortar(p, d, poligono) {
  let t0 = -Infinity, t1 = Infinity;
  const n = poligono.length;
  // Orientación del polígono para saber hacia dónde queda el interior.
  const area2 = poligono.reduce((s, a, i) => s + a.x * poligono[(i + 1) % n].y - poligono[(i + 1) % n].x * a.y, 0);
  const signo = area2 >= 0 ? 1 : -1;
  for (let i = 0; i < n; i++) {
    const a = poligono[i], b = poligono[(i + 1) % n];
    const normal = {x: -(b.y - a.y) * signo, y: (b.x - a.x) * signo}; // apunta hacia adentro
    const num = normal.x * (p.x - a.x) + normal.y * (p.y - a.y);
    const den = normal.x * d.x + normal.y * d.y;
    if (Math.abs(den) < 1e-12) { if (num < 0) return null; continue; }
    const t = -num / den;
    if (den > 0) t0 = Math.max(t0, t); else t1 = Math.min(t1, t);
  }
  return t1 > t0 ? [{x: p.x + d.x * t0, y: p.y + d.y * t0}, {x: p.x + d.x * t1, y: p.y + d.y * t1}] : null;
}

// Polígono convexo desplazado hacia afuera una distancia d (aleros).
export function desplazarPoligono(original, d) {
  // Sin vértices casi alineados (< 4°): sus bordes desplazados se cortan muy lejos.
  const poligono = original.filter((b, i) => {
    const a = original[(i - 1 + original.length) % original.length], c = original[(i + 1) % original.length];
    const u = {x: b.x - a.x, y: b.y - a.y}, v = {x: c.x - b.x, y: c.y - b.y};
    const lu = Math.hypot(u.x, u.y), lv = Math.hypot(v.x, v.y);
    if (lu < 1e-6 || lv < 1e-6) return false;
    return Math.abs((u.x * v.y - u.y * v.x) / (lu * lv)) > Math.sin((4 * Math.PI) / 180);
  });
  if (poligono.length < 3) return original;
  const n = poligono.length;
  const area2 = poligono.reduce((acc, a, i) => acc + a.x * poligono[(i + 1) % n].y - poligono[(i + 1) % n].x * a.y, 0);
  const signo = area2 >= 0 ? 1 : -1;
  const lineas = poligono.map((a, i) => {
    const b = poligono[(i + 1) % n], l = Math.hypot(b.x - a.x, b.y - a.y) || 1;
    const nrm = {x: ((b.y - a.y) / l) * signo, y: (-(b.x - a.x) / l) * signo}; // hacia afuera
    return {p: {x: a.x + nrm.x * d, y: a.y + nrm.y * d}, d: {x: (b.x - a.x) / l, y: (b.y - a.y) / l}};
  });
  return lineas.map((l1, i) => {
    const l0 = lineas[(i - 1 + n) % n];
    const den = l0.d.x * l1.d.y - l0.d.y * l1.d.x;
    if (Math.abs(den) < 1e-9) return l1.p;
    const t = ((l1.p.x - l0.p.x) * l1.d.y - (l1.p.y - l0.p.y) * l1.d.x) / den;
    const q = {x: l0.p.x + l0.d.x * t, y: l0.p.y + l0.d.y * t};
    // Esquinas muy agudas: se limita la punta a 3 veces la distancia.
    return Math.hypot(q.x - poligono[i].x, q.y - poligono[i].y) > 3 * Math.abs(d) ? l1.p : q;
  });
}

// Rango de un polígono proyectado sobre una dirección.
const rango = (P, eje) => { const s = P.map((p) => p.x * eje.x + p.y * eje.y); return [Math.min(...s), Math.max(...s)]; };
const areaDe = (P) => Math.abs(P.reduce((acc, a, i) => acc + a.x * P[(i + 1) % P.length].y - P[(i + 1) % P.length].x * a.y, 0)) / 2;
// Parte de un polígono convexo del lado dot(q - p, n) >= 0.
function cortarSemiplano(P, p, n) {
  const f = (q) => (q.x - p.x) * n.x + (q.y - p.y) * n.y;
  const out = [];
  P.forEach((a, i) => {
    const b = P[(i + 1) % P.length], fa = f(a), fb = f(b);
    if (fa >= 0) out.push(a);
    if ((fa >= 0) !== (fb >= 0)) { const t = fa / (fa - fb); out.push({x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t}); }
  });
  return out;
}

// Intersección de dos polígonos convexos (P recortado por cada lado de Q).
function interseccionConvexa(P, Q) {
  const s = Math.sign(Q.reduce((acc, a, i) => acc + a.x * Q[(i + 1) % Q.length].y - Q[(i + 1) % Q.length].x * a.y, 0)) || 1;
  let out = P;
  Q.forEach((a, i) => {
    const b = Q[(i + 1) % Q.length];
    if (out.length >= 3) out = cortarSemiplano(out, a, {x: -(b.y - a.y) * s, y: (b.x - a.x) * s});
  });
  return out.length >= 3 ? out : P;
}

// Dirección principal de la grilla: la del eje recto más largo (módulo 90°);
// los ejes inclinados (Z´ del módulo 14) no mandan sobre la orientación.
export function direccionPrincipal(ejes) {
  const largo = (e) => Math.hypot(e.q.x - e.p.x, e.q.y - e.p.y);
  const rectos = ejes.filter((e) => !e.inclinado);
  const e = [...(rectos.length ? rectos : ejes)].sort((a, b) => largo(b) - largo(a))[0];
  let ang = Math.atan2(e.q.y - e.p.y, e.q.x - e.p.x);
  ang = ((ang % (Math.PI / 2)) + Math.PI / 2) % (Math.PI / 2);
  return {x: Math.cos(ang), y: Math.sin(ang)};
}

// Luz de la losa entre vigas de ejes: en cada dirección, la mayor separación entre ejes
// paralelos consecutivos; la losa trabaja en la menor de las dos (su luz corta).
export function luzEntreEjes(ejes, u = direccionPrincipal(ejes)) {
  const v = {x: -u.y, y: u.x};
  const separaciones = (normal) => {
    const pos = ejes.filter((e) => {
      const d = {x: e.q.x - e.p.x, y: e.q.y - e.p.y}, l = Math.hypot(d.x, d.y) || 1;
      return Math.abs((d.x * normal.x + d.y * normal.y) / l) < 0.26; // eje perpendicular a la normal (±15°)
    }).map((e) => ((e.p.x + e.q.x) / 2) * normal.x + ((e.p.y + e.q.y) / 2) * normal.y).sort((a, b) => a - b);
    return pos.slice(1).reduce((m, p, i) => Math.max(m, p - pos[i]), 0);
  };
  const su = separaciones(u), sv = separaciones(v);
  return su && sv ? Math.min(su, sv) : Math.max(su, sv);
}

export function planoAligerado({lectura, items = [], k = 1}) {
  const columnas = lectura.columnas;
  const base = primitivasBase(lectura.ejes, columnas);
  const {h} = base;
  const prim = [];

  // Vigas en los ejes, entre caras de columnas; peralte por la luz entre ejes.
  const tramos = tramosEntreColumnas(columnas);
  for (const t of tramos) {
    const luzViga = Math.hypot(t.hasta.nodo.x - t.desde.nodo.x, t.hasta.nodo.y - t.desde.nodo.y);
    t.seccion = seccionViga(luzViga);
    t.medida = `${t.seccion.b.toFixed(2)}x${t.seccion.h.toFixed(2)}`;
  }
  const medidas = [...new Set(tramos.map((t) => t.medida))].sort((a, b) => Number(b.split("x")[1]) - Number(a.split("x")[1]));
  for (const t of tramos) {
    t.tipo = `V-${101 + medidas.indexOf(t.medida)}`;
    prim.push(banda(L.VIGAS, t.a, t.b, t.seccion.b));
  }
  for (const medida of medidas) {
    const lista = tramos.filter((t) => t.medida === medida);
    // Como el expediente: "V(0.25x0.40)".
    prim.push(...rotularTramos(lista, L.VIGAS, `V(${medida})`, lista[0].seccion.b, h));
  }

  // Losa: la envolvente de las columnas, con alero alrededor.
  const pano = envolvente(columnas.flatMap((c) => c.contorno));
  const alero = CRITERIOS.aligerado.alero;
  const losa = alero > 0 ? desplazarPoligono(pano, alero) : pano;
  prim.push(pline(L.ALIGERADO, losa.map(pt), true));
  const u = direccionPrincipal(lectura.ejes), v = {x: -u.y, y: u.x};
  const proy = (p, eje) => p.x * eje.x + p.y * eje.y;
  const centroPano = pano.reduce((acc, p) => ({x: acc.x + p.x / pano.length, y: acc.y + p.y / pano.length}), {x: 0, y: 0});

  // Muros interiores largos: la losa se divide en paños con una viga sobre cada uno.
  // La viga central es la de cumbrera (módulo XIV: "VCUMBRERA" sobre el muro central).
  const interiores = items.length ? murosDelEdificio({columnas, items, k}).tramos.filter((t) => !t.exterior && t.largo >= 1.0) : [];
  // Los paños se miden sobre la losa con aleros (el expediente cuenta 6 + 6 viguetas).
  let panos = [losa];
  const vigasInternas = [];
  for (const t of interiores) {
    const tramo = recortar(t.a, t.d, pano);
    if (!tramo) continue;
    const n = {x: -t.d.y, y: t.d.x};
    const nuevos = [];
    for (const P of panos) {
      const lados = [cortarSemiplano(P, t.a, n), cortarSemiplano(P, t.a, {x: -n.x, y: -n.y})].filter((q) => q.length >= 3 && areaDe(q) > 0.5);
      nuevos.push(...(lados.length === 2 ? lados : [P]));
    }
    if (nuevos.length === panos.length) continue;
    panos = nuevos;
    const sec = seccionViga(Math.hypot(tramo[1].x - tramo[0].x, tramo[1].y - tramo[0].y));
    const m = {x: (tramo[0].x + tramo[1].x) / 2, y: (tramo[0].y + tramo[1].y) / 2};
    const [n0, n1] = rango(pano, n);
    const central = Math.abs(proy(m, n) - proy(centroPano, n)) < 0.2 * (n1 - n0);
    vigasInternas.push({tramo, d: t.d, sec, nombre: central ? "VCUMBRERA" : "V"});
    prim.push(banda(L.VIGAS, tramo[0], tramo[1], sec.b));
    let ang = (Math.atan2(t.d.y, t.d.x) * 180) / Math.PI;
    if (ang > 90) ang -= 180; else if (ang <= -90) ang += 180;
    prim.push(text(L.VIGAS, pt({x: m.x + n.x * (sec.b / 2 + h * 0.4), y: m.y + n.y * (sec.b / 2 + h * 0.4)}), `${central ? "VCUMBRERA" : "V"} (${sec.b.toFixed(2)}x${sec.h.toFixed(2)})`, h * 0.36, Math.round(ang * 10) / 10));
  }

  // Cada paño: viguetas @0.40 en su luz corta, con el símbolo del expediente
  // (bastón 1Ø3/8" a lo largo de la luz, trazos de viguetas junto a los apoyos,
  // flecha de dirección) y su rótulo.
  let viguetas = 0, luz = 0;
  const hp = h * 0.36;
  // El espesor lo manda la luz entre ejes (vigas), no la de los paños entre muros:
  // módulo 09, ejes a 5.8 y 6.1 m → e=0.25 en toda la losa, como el ingeniero.
  const luzEjes = luzEntreEjes(lectura.ejes, u);
  // Paños numerados de izquierda a derecha (y de arriba hacia abajo), como en el expediente.
  const centroDe = (P) => P.reduce((acc, p) => ({x: acc.x + p.x / P.length, y: acc.y + p.y / P.length}), {x: 0, y: 0});
  panos.sort((a, b) => { const ca = centroDe(a), cb = centroDe(b); return Math.abs(proy(ca, u) - proy(cb, u)) > 0.3 ? proy(ca, u) - proy(cb, u) : proy(cb, v) - proy(ca, v); });
  const datosPanos = panos.map((P, i) => {
    // Interior del paño entre vigas (sin aleros): ahí van el bastón y los trazos.
    const Pin = interseccionConvexa(P, pano);
    const [u0, u1] = rango(P, u), [v0, v1] = rango(P, v);
    // Con viga de cumbrera las viguetas corren paralelas a ella y se apoyan en las vigas
    // de los ejes que la cruzan (módulo XIV); si no, van en la luz corta del paño.
    const cumbrera = vigasInternas.find((x) => x.nombre === "VCUMBRERA");
    const corta = cumbrera ? (Math.abs(proy(cumbrera.d, u)) >= Math.abs(proy(cumbrera.d, v)) ? "u" : "v") : u1 - u0 <= v1 - v0 ? "u" : "v";
    const dir = corta === "u" ? u : v, reparto = corta === "u" ? v : u;
    const luzPano = Math.max(0.5, (corta === "u" ? u1 - u0 : v1 - v0) - 2 * alero); // luz entre apoyos, sin aleros
    const [r0, r1] = corta === "u" ? [v0, v1] : [u0, u1];
    const n = Math.max(1, Math.floor((r1 - r0) / SEPARACION_VIGUETAS));
    viguetas += n; luz = Math.max(luz, luzPano);
    const centro = P.reduce((acc, p) => ({x: acc.x + p.x / P.length, y: acc.y + p.y / P.length}), {x: 0, y: 0});
    const cr = proy(centro, reparto);
    // Bastón a lo largo de la luz, con su rótulo en cada extremo.
    const eje = recortar({x: reparto.x * cr, y: reparto.y * cr}, dir, Pin);
    if (eje) {
      const [a, b] = eje;
      prim.push(banda(L.VIGUETAS, {x: a.x + dir.x * 0.08, y: a.y + dir.y * 0.08}, {x: b.x - dir.x * 0.08, y: b.y - dir.y * 0.08}, 0.03));
      for (const [p, s] of [[a, 1], [b, -1]]) prim.push(text(L.VIGUETAS, pt({x: p.x + dir.x * s * 0.55 + reparto.x * hp * 1.8, y: p.y + dir.y * s * 0.55 + reparto.y * hp * 1.8}), "1Ø3/8\"", hp * 0.8));
    }
    // Trazos de viguetas (pares) junto a cada apoyo, @0.40 a lo ancho del paño.
    for (let s = r0 + SEPARACION_VIGUETAS / 2; s < r1 - 0.1; s += SEPARACION_VIGUETAS) {
      const tramo = recortar({x: reparto.x * s, y: reparto.y * s}, dir, Pin);
      if (!tramo) continue;
      for (const [p, sg] of [[tramo[0], 1], [tramo[1], -1]]) {
        for (const off of [-0.025, 0.025]) {
          const q0 = {x: p.x + dir.x * sg * 0.1 + reparto.x * off, y: p.y + dir.y * sg * 0.1 + reparto.y * off};
          prim.push(line(L.VIGUETAS, pt(q0), pt({x: q0.x + dir.x * sg * 0.32, y: q0.y + dir.y * sg * 0.32})));
        }
      }
    }
    // Flecha de dirección de las viguetas y rótulo del paño.
    const medio = Math.min(0.6, luzPano * 0.25), desp = Math.min((r1 - r0) * 0.25, 0.5);
    const c2 = {x: centro.x + reparto.x * desp, y: centro.y + reparto.y * desp};
    const A = {x: c2.x - dir.x * medio, y: c2.y - dir.y * medio}, B = {x: c2.x + dir.x * medio, y: c2.y + dir.y * medio};
    const punta = (p, sentido) => {
      const kk = h * 0.45, atras = {x: p.x - dir.x * kk * sentido, y: p.y - dir.y * kk * sentido};
      return [line(L.LAMINA, pt(p), pt({x: atras.x + reparto.x * kk * 0.5, y: atras.y + reparto.y * kk * 0.5})), line(L.LAMINA, pt(p), pt({x: atras.x - reparto.x * kk * 0.5, y: atras.y - reparto.y * kk * 0.5}))];
    };
    prim.push(line(L.LAMINA, pt(A), pt(B)), ...punta(B, 1), ...punta(A, -1));
    const espesorPano = espesorAligerado(Math.max(luzPano, luzEjes));
    const r = {x: centro.x - reparto.x * desp, y: centro.y - reparto.y * desp};
    const etiqueta = `LOSA ALIGERADA E=${Math.round(espesorPano * 100)}CM\\P(${n} VIGUETAS)`;
    prim.push(text(L.TEXTO_LOSA, pt(r), panos.length > 1 ? `Paño ${String(i + 1).padStart(2, "0")}\\P${etiqueta}` : etiqueta, hp));
    return {pano: i + 1, viguetas: n, luz: luzPano, espesor: espesorPano};
  });
  const espesor = espesorAligerado(Math.max(luz, luzEjes));

  // Alero y canaletas: con viga de cumbrera, el agua cae a los aleros paralelos a ella.
  if (alero > 0) {
    const centroLosa = losa.reduce((acc, p) => ({x: acc.x + p.x / losa.length, y: acc.y + p.y / losa.length}), {x: 0, y: 0});
    const bordes = pano.map((a, i) => ({a, b: pano[(i + 1) % pano.length]})).map((e) => ({...e, l: Math.hypot(e.b.x - e.a.x, e.b.y - e.a.y)}));
    const fuera = (e, d) => {
      const m = {x: (e.a.x + e.b.x) / 2, y: (e.a.y + e.b.y) / 2}, f = {x: m.x - centroLosa.x, y: m.y - centroLosa.y}, lf = Math.hypot(f.x, f.y) || 1;
      return pt({x: m.x + (f.x / lf) * d, y: m.y + (f.y / lf) * d});
    };
    const cumbrera = vigasInternas.find((x) => x.nombre === "VCUMBRERA");
    const paralelos = cumbrera ? bordes.filter((e) => e.l > 1 && Math.abs(((e.b.x - e.a.x) * cumbrera.d.x + (e.b.y - e.a.y) * cumbrera.d.y) / e.l) > 0.9) : [];
    for (const e of paralelos) {
      // Canaleta como el expediente: franja del alero achurada y "CANALETA" a lo largo de ella.
      const m = {x: (e.a.x + e.b.x) / 2, y: (e.a.y + e.b.y) / 2}, f = {x: m.x - centroLosa.x, y: m.y - centroLosa.y}, lf = Math.hypot(f.x, f.y) || 1;
      const o = {x: (f.x / lf) * alero, y: (f.y / lf) * alero};
      prim.push(hatch(L.ACHURADO, [pt(e.a), pt(e.b), pt({x: e.b.x + o.x, y: e.b.y + o.y}), pt({x: e.a.x + o.x, y: e.a.y + o.y})], {patron: "ANSI31", escala: 0.35, angulo: 0}));
      let ang = (Math.atan2(e.b.y - e.a.y, e.b.x - e.a.x) * 180) / Math.PI;
      if (ang > 90) ang -= 180; else if (ang <= -90) ang += 180;
      prim.push(text(L.LETRAS, fuera(e, alero * 0.5), "CANALETA", 0.124, Math.round(ang * 10) / 10));
    }
    const largo = bordes.filter((e) => !paralelos.includes(e)).sort((p, q) => q.l - p.l)[0];
    if (largo) prim.push(text(L.TEXTO, fuera(largo, alero * 0.55), `ALERO ${alero.toFixed(2)}`, h * 0.34));
  }

  const notas = [
    `Losa aligerada e=${espesor.toFixed(2)} m en ${datosPanos.length} ${datosPanos.length === 1 ? "paño" : "paños"}, luz corta ${luz.toFixed(2)} m, viguetas @0.40 m, aleros ${alero.toFixed(2)} m`,
    `Acero de temperatura ${CRITERIOS.aligerado.aceroTemperatura}`,
    ...medidas.map((m) => {
      const lista = tramos.filter((t) => t.medida === m);
      return `${lista[0].tipo}: viga ${m} m (${lista.length} ${lista.length === 1 ? "tramo" : "tramos"})`;
    }),
    `${CRITERIOS.aligerado.ladrillo} · f'c = ${CRITERIOS.concreto.vigas} kg/cm²`,
  ];
  return {
    espesor, luz, viguetas, panos: datosPanos, vigas: tramos.length + vigasInternas.length,
    cumbrera: (({tramo, d} = {}) => (tramo ? {a: tramo[0], b: tramo[1], d} : null))(vigasInternas.find((x) => x.nombre === "VCUMBRERA")), tiposViga: medidas.map((m) => ({tipo: tramos.find((t) => t.medida === m).tipo, medida: m})),
    contenido: {titulo: "PLANO DE ALIGERADO", primitivas: [...base.primitivas, ...prim], marco: base.marco, ejes: base.ejes, h, notas},
  };
}
