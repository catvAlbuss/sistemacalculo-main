// Arquitectura → estructuras: plano de losa aligerada sobre la misma planta.
// Vigas en los ejes entre columnas, un paño de losa con las viguetas en la
// dirección de la luz corta (cada 0.40 m: vigueta 0.10 + ladrillo 0.30) y su
// símbolo de dirección. Devuelve el contenido en coordenadas de la planta.

import {L, line, pline, text, hatch} from "../cad/primitives.js";
import {primitivasBase, tramosEntreColumnas, envolvente, huellaColumnas, banda, rotularTramos, murosDelEdificio, escalerasEnPlanta} from "./cimentacionPlano.js";
import {CRITERIOS, espesorPorLuz} from "../criterios/criteriosEstructurales.js";
import {ubicarSinEncimar, cajasDeTextos} from "../laminas/colocarTextos.js";
import {receta} from "../aprendizaje/recetas.js";
import {seccionVigaPorLuz, seccionVigaDespacho} from "../diseno/estructura.js";
import {REGLAS_DESPACHO, reglasPara} from "../metrado/reglasDespacho.js";

const SEPARACION_VIGUETAS = 0.4;
const pt = (p) => [Math.round(p.x * 10000) / 10000, Math.round(p.y * 10000) / 10000];
const ceil05 = (v) => Math.ceil(v / 0.05 - 1e-9) * 0.05;

// Espesor de aligerado por la luz entre ejes (criterios: luz libre, mínimo 0.20 m).
export const espesorAligerado = (luz) => espesorPorLuz(luz);
// Sección de viga por su luz libre (diseno/estructura.js con las reglas del despacho; sin
// ellas, 0.25 x L/12 con mínimo 0.40). opciones: {cargaLosa, apoyos, peralteMinimo}.
// opciones.reglas: las de un tipo de cimentación (reglasPara); por defecto, las de todos los módulos.
export const seccionViga = (luz, {reglas = REGLAS_DESPACHO.vigas, ...opciones} = {}) => seccionVigaPorLuz({luz, ...opciones}, reglas, CRITERIOS.vigas);

// Dirección de las viguetas en la planta: salvan la luz corta de la grilla de ejes (la mayor
// separación entre ejes paralelos consecutivos, en cada dirección). null si no hay grilla.
export function direccionViguetas(ejes = [], u = direccionPrincipal(ejes)) {
  const proy = (p, e) => p.x * e.x + p.y * e.y;
  const separaciones = (eje) => {
    const pos = [...new Set(ejes.filter((e) => !e.inclinado).map((e) => {
      const d = {x: e.q.x - e.p.x, y: e.q.y - e.p.y}, l = Math.hypot(d.x, d.y) || 1;
      return Math.abs(proy(d, eje) / l) < 0.26 ? Math.round(proy({x: (e.p.x + e.q.x) / 2, y: (e.p.y + e.q.y) / 2}, eje) * 100) / 100 : null;
    }).filter((x) => x !== null))].sort((a, b) => a - b);
    return pos.slice(1).map((x, i) => x - pos[i]).filter((d) => d > 0.3);
  };
  const v = {x: -u.y, y: u.x};
  const [su, sv] = [separaciones(u), separaciones(v)];
  if (!su.length || !sv.length) return null;
  return Math.max(...su) <= Math.max(...sv) ? u : v;
}

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

// Punto dentro de un polígono convexo (cualquier orientación).
function dentroDe(p, P) {
  let signo = 0;
  for (let i = 0; i < P.length; i++) {
    const a = P[i], b = P[(i + 1) % P.length];
    const c = (b.x - a.x) * (p.y - a.y) - (b.y - a.y) * (p.x - a.x);
    if (Math.abs(c) < 1e-12) continue;
    if (signo === 0) signo = Math.sign(c); else if (Math.sign(c) !== signo) return false;
  }
  return true;
}

// Uso de un ambiente para la losa, por los textos de la arquitectura dentro de la celda.
// "Descanso" solo no basta (módulo 4: seis rótulos sin escalera): texto "escalera" o peldaños dibujados.
const ESCALERA = /escaler/i;
const HUMEDO = /ss\.?\s*hh|s\.s\.h\.h|ba[ñn]o|servicios?\s+higi|ducha|vestidor|lavander|inodoro/i;
// Un pasillo o hall que sirve a los baños ("PASILLO SS.HH") es circulación seca, no ambiente húmedo.
const CIRCULACION = /^\s*(pasillo|hall|circulaci|corredor|vest[ií]bulo)\b/i;
const esHumedo = (t) => HUMEDO.test(t) && !CIRCULACION.test(t);
// Agua almacenada (cisterna, tanque, cuarto de bombas): losa maciza, como el módulo 15.
const AGUA = /cisterna|tanque|reservorio|cuarto de bombas/i;

const APOYO_MIN = 1.2, LUZ_MAX_VIGUETA = 7;
// Celdas de la grilla entre ejes con vigas (paños del ingeniero). null si hay una sola celda.
// Cada celda: {P (polígono con alero en los bordes), tipo: "aligerada" | "maciza" | "abertura", motivo}.
export function celdasDeGrilla({lectura, tramos, losa, u, v, items = [], k = 1, volados = [], muros = [], losaMaciza = true}) {
  const conViga = new Set(tramos.map((t) => t.eje));
  const proy = (p, e) => p.x * e.x + p.y * e.y;
  const cortes = {u: [], v: []};
  for (const e of lectura.ejes) {
    if (e.inclinado || !conViga.has(e.nombre)) continue;
    const d = {x: e.q.x - e.p.x, y: e.q.y - e.p.y}, l = Math.hypot(d.x, d.y) || 1;
    const m = {x: (e.p.x + e.q.x) / 2, y: (e.p.y + e.q.y) / 2};
    // Eje paralelo a v: corta la dirección u en su posición (y al revés).
    if (Math.abs(proy(d, u) / l) < 0.26) cortes.u.push({p: proy(m, u), n: e.nombre}); else if (Math.abs(proy(d, v) / l) < 0.26) cortes.v.push({p: proy(m, v), n: e.nombre});
  }
  const unicos = (xs) => xs.sort((a, b) => a.p - b.p).filter((x, i, a) => i === 0 || x.p - a[i - 1].p > 0.3);
  let nu = unicos(cortes.u), nv = unicos(cortes.v);
  // Paños como los dibuja el ingeniero (VINCHOS 4 y 8, ILO 4): solo los apoyos de las viguetas
  // (vigas perpendiculares a ellas) parten la losa; un eje paralelo a las viguetas no corta el
  // paño, y de dos apoyos a menos de 1.2 m queda el que lleva más viga.
  if (nu.length >= 2 && nv.length >= 2) {
    const brecha = (xs) => Math.max(0, ...xs.slice(1).map((x, i) => x.p - xs[i].p));
    const largoViga = (n) => tramos.filter((t) => t.eje === n).reduce((acc, t) => acc + (t.largo ?? 0), 0);
    const apoyosDe = (lista) => {
      const a = [...lista];
      for (let i = a.length - 1; i > 0; i--) {
        if (a[i].p - a[i - 1].p < APOYO_MIN) a.splice(largoViga(a[i].n) >= largoViga(a[i - 1].n) ? i - 1 : i, 1);
      }
      return a;
    };
    // Dirección válida: al menos 3 apoyos, luz media ≥ 2 m (no paños de pasillo) y ninguna luz que
    // un aligerado no salve (> 7 m: faltan vigas leídas, ILO módulo 1).
    const valida = (a) => a.length >= 3 && (a.at(-1).p - a[0].p) / (a.length - 1) >= 2 && brecha(a) <= LUZ_MAX_VIGUETA;
    // Primero los apoyos más juntos (la luz corta de la grilla). Si quedan demasiado juntos (ejes
    // cada 1.6 m: VINCHOS módulo 4), el ingeniero hace trabajar la losa en la otra dirección
    // —vigas de luz más corta, viguetas de 2 a 4 m— y esos ejes no parten los paños.
    const preferida = brecha(nu) <= brecha(nv);
    const elegida = [preferida, !preferida].find((enU) => valida(apoyosDe(enU ? nu : nv)));
    if (elegida !== undefined) {
      const apoyos = apoyosDe(elegida ? nu : nv), paralelos = elegida ? nv : nu;
      const borde = [paralelos[0], paralelos.at(-1)];
      if (elegida) { nu = apoyos; nv = borde; } else { nv = apoyos; nu = borde; }
    }
  }
  // Volado (pasillo pasado el último eje): una fila más de celdas entre ese eje y el borde.
  for (const vo of volados) {
    const lista = vo.lado[0] === "u" ? nu : nv;
    if (lista.length < 2) continue;
    if (vo.lado[1] === "1") lista.push({p: lista.at(-1).p + vo.ancho, n: "volado", volado: true});
    else lista.unshift({p: lista[0].p - vo.ancho, n: "volado", volado: true});
  }
  const cu = nu.map((x) => x.p), cv = nv.map((x) => x.p);
  if (cu.length < 2 || cv.length < 2 || (cu.length - 1) * (cv.length - 1) < 2) return null;
  // Textos de la planta, en metros.
  const textos = items.filter((it) => it.tipo === "texto" && it.texto && it.centro).map((it) => ({t: it.texto, p: {x: it.centro.x / k, y: it.centro.y / k}}));
  const celdas = [];
  for (let i = 0; i < cu.length - 1; i++) {
    for (let j = 0; j < cv.length - 1; j++) {
      // Las celdas del borde se extienden hasta el borde de la losa (alero).
      const u0 = i === 0 ? -Infinity : cu[i], u1 = i === cu.length - 2 ? Infinity : cu[i + 1];
      const v0 = j === 0 ? -Infinity : cv[j], v1 = j === cv.length - 2 ? Infinity : cv[j + 1];
      let P = losa;
      if (Number.isFinite(u0)) P = cortarSemiplano(P, {x: u.x * u0, y: u.y * u0}, u);
      if (P.length >= 3 && Number.isFinite(u1)) P = cortarSemiplano(P, {x: u.x * u1, y: u.y * u1}, {x: -u.x, y: -u.y});
      if (P.length >= 3 && Number.isFinite(v0)) P = cortarSemiplano(P, {x: v.x * v0, y: v.y * v0}, v);
      if (P.length >= 3 && Number.isFinite(v1)) P = cortarSemiplano(P, {x: v.x * v1, y: v.y * v1}, {x: -v.x, y: -v.y});
      if (P.length < 3 || areaDe(P) < 0.5) continue;
      const dentro = textos.filter((x) => { const a = proy(x.p, u), b = proy(x.p, v); return a > cu[i] && a < cu[i + 1] && b > cv[j] && b < cv[j + 1]; }).map((x) => x.t);
      // Por el texto; si no lo rotulan, la detectan sus peldaños (partirEscaleras).
      const escalera = dentro.some((t) => ESCALERA.test(t));
      // En una grilla de varios paños la cisterna rotulada en la planta está enterrada bajo el
      // piso: el paño de encima sigue aligerado (ILO módulo 3). Solo el agua elevada pide maciza.
      const agua = dentro.some((t) => AGUA.test(t) && !/cisterna|bombas/i.test(t));
      // Sin losa maciza en los baños (decisión del ingeniero), el paño queda entero y aligerado:
      // partirlo al ambiente dejaba franjas de 0.5 m con sus propias viguetas (VINCHOS módulo 8).
      const humedo = agua || (losaMaciza !== false && dentro.some(esHumedo));
      const volado = nu[i].volado || nu[i + 1].volado || nv[j].volado || nv[j + 1].volado;
      if (volado) { celdas.push({P, tipo: "aligerada", motivo: "volado", ejes: [`${nu[i].n}–${nu[i + 1].n}`, `${nv[j].n}–${nv[j + 1].n}`]}); continue; }
      // Solo si el paño no tiene el rótulo de otro ambiente (la franja entre apoyos puede juntar varios).
      const vacio = !escalera && dentro.some((t) => DOBLE_ALTURA.test(t)) && !dentro.some((t) => AMBIENTE.test(t) && !NO_AMBIENTE.test(t) && !DOBLE_ALTURA.test(t));
      celdas.push({P, tipo: escalera || vacio ? "abertura" : humedo ? "maciza" : "aligerada", motivo: escalera ? "escalera" : vacio ? "vacío" : agua ? "cisterna" : humedo ? "baños" : null, ij: [i, j],
        conAmbiente: dentro.some((t) => AMBIENTE.test(t) && !NO_AMBIENTE.test(t)),
        rotulos: textos.filter((x) => { const a = proy(x.p, u), b = proy(x.p, v); return a > cu[i] && a < cu[i + 1] && b > cv[j] && b < cv[j + 1] && AMBIENTE.test(x.t) && !NO_AMBIENTE.test(x.t); }).map((x) => x.p),
        ejes: [`${nu[i].n}–${nu[i + 1].n}`, `${nv[j].n}–${nv[j + 1].n}`]});
    }
  }
  // El vacío de doble altura (SUM, auditorio) ocupa también los paños vecinos sin rótulo propio
  // (solo vanos y proyecciones de viga): ILO módulo 5, SUM de tres paños rotulado en uno.
  for (let cambio = true; cambio;) {
    cambio = false;
    for (const c of celdas) {
      if (c.tipo !== "aligerada" || c.motivo || c.conAmbiente) continue;
      if (celdas.some((o) => o.motivo === "vacío" && Math.abs(o.ij[0] - c.ij[0]) + Math.abs(o.ij[1] - c.ij[1]) === 1)) { c.tipo = "abertura"; c.motivo = "vacío"; cambio = true; }
    }
  }
  // Toda la planta puede ser maciza (módulo 6: vestidores y duchas en sus dos paños).
  if (celdas.length < 2) return null;
  // La losa maciza va en el ambiente húmedo, no en todo el paño entre ejes (el ingeniero la
  // limita al baño): el resto del paño sigue aligerado.
  return muros.length ? celdas.flatMap((c) => (c.tipo === "maciza" && c.motivo === "baños" ? ajustarAlAmbiente(c, textos, muros, u, v) : [c])) : celdas;
}

// Rectángulo del ambiente húmedo dentro de la celda: desde cada rótulo de baño, el muro más
// cercano en las cuatro direcciones (cara interior). Lo que queda del paño y tiene ancho útil
// (≥ 0.60 m) sigue aligerado; las franjas más angostas se suman a la maciza.
export function ajustarAlAmbiente(celda, textos, muros, u, v) {
  const pr = (p, e) => p.x * e.x + p.y * e.y;
  const ext = (e) => [Math.min(...celda.P.map((q) => pr(q, e))), Math.max(...celda.P.map((q) => pr(q, e)))];
  const [cu0, cu1] = ext(u), [cv0, cv1] = ext(v);
  const rotulos = textos.filter((x) => esHumedo(x.t)).map((x) => ({a: pr(x.p, u), b: pr(x.p, v)}))
    .filter((r) => r.a > cu0 && r.a < cu1 && r.b > cv0 && r.b < cv1);
  if (!rotulos.length) return [celda];
  // Muros como segmentos en coordenadas (a, b); solo los paralelos a un eje.
  const segs = muros.map(([p, q]) => ({a0: pr(p, u), b0: pr(p, v), a1: pr(q, u), b1: pr(q, v)}))
    .map((m) => ({...m, enA: Math.abs(m.a1 - m.a0) < 0.05, enB: Math.abs(m.b1 - m.b0) < 0.05}))
    .filter((m) => (m.enA || m.enB) && Math.hypot(m.a1 - m.a0, m.b1 - m.b0) >= 0.3);
  let ra0 = Infinity, ra1 = -Infinity, rb0 = Infinity, rb1 = -Infinity;
  for (const r of rotulos) {
    const cruza = (lo, hi, x) => x >= Math.min(lo, hi) - 0.05 && x <= Math.max(lo, hi) + 0.05;
    const enU = segs.filter((m) => m.enA && cruza(m.b0, m.b1, r.b)).map((m) => m.a0);
    const enV = segs.filter((m) => m.enB && cruza(m.a0, m.a1, r.a)).map((m) => m.b0);
    const menor = (xs, x, lim) => Math.max(lim, ...xs.filter((y) => y < x - 0.15));
    const mayor = (xs, x, lim) => Math.min(lim, ...xs.filter((y) => y > x + 0.15));
    ra0 = Math.min(ra0, menor(enU, r.a, cu0)); ra1 = Math.max(ra1, mayor(enU, r.a, cu1));
    rb0 = Math.min(rb0, menor(enV, r.b, cv0)); rb1 = Math.max(rb1, mayor(enV, r.b, cv1));
  }
  const MIN = 1.2; // franja de paño más angosta: se suma a la maciza (no hay vigueta de 1 m)
  if (ra0 - cu0 < MIN) ra0 = cu0; if (cu1 - ra1 < MIN) ra1 = cu1;
  if (rb0 - cv0 < MIN) rb0 = cv0; if (cv1 - rb1 < MIN) rb1 = cv1;
  if (ra0 <= cu0 && ra1 >= cu1 && rb0 <= cv0 && rb1 >= cv1) return [celda];
  const corte = (P, a0, a1, b0, b1) => {
    let Q = P;
    if (a0 > cu0) Q = cortarSemiplano(Q, {x: u.x * a0, y: u.y * a0}, u);
    if (Q.length >= 3 && a1 < cu1) Q = cortarSemiplano(Q, {x: u.x * a1, y: u.y * a1}, {x: -u.x, y: -u.y});
    if (Q.length >= 3 && b0 > cv0) Q = cortarSemiplano(Q, {x: v.x * b0, y: v.y * b0}, v);
    if (Q.length >= 3 && b1 < cv1) Q = cortarSemiplano(Q, {x: v.x * b1, y: v.y * b1}, {x: -v.x, y: -v.y});
    return Q.length >= 3 && areaDe(Q) >= 0.3 ? Q : null;
  };
  const aligerada = (P) => (P ? [{...celda, P, tipo: "aligerada", motivo: null, resto: true}] : []);
  return [
    {...celda, P: corte(celda.P, ra0, ra1, rb0, rb1) ?? celda.P},
    // Franjas que quedan del paño: a lo largo de u completas; al medio, arriba y abajo.
    ...aligerada(ra0 > cu0 ? corte(celda.P, cu0, ra0, cv0, cv1) : null),
    ...aligerada(ra1 < cu1 ? corte(celda.P, ra1, cu1, cv0, cv1) : null),
    ...aligerada(rb0 > cv0 ? corte(celda.P, ra0, ra1, cv0, rb0) : null),
    ...aligerada(rb1 < cv1 ? corte(celda.P, ra0, ra1, rb1, cv1) : null),
  ];
}

// Volados (pasillo en voladizo) leídos de la planta del nivel de arriba: sus barandas o muros
// pasan más allá de las columnas (VINCHOS módulos 1, 2 y 3: ~2.40 m por un lado). Devuelve
// [{lado: "u0"|"u1"|"v0"|"v1", ancho}] respecto de la caja de las columnas, en metros.
export function voladosDesdePlanta({lectura, items, k = 1, caja = null}) {
  const pts = (lectura.columnas ?? []).flatMap((c) => c.contorno);
  if (pts.length < 3) return [];
  const u = direccionPrincipal(lectura.ejes), v = {x: -u.y, y: u.x};
  const pr = (p, e) => p.x * e.x + p.y * e.y;
  const ext = {u0: Math.min(...pts.map((p) => pr(p, u))), u1: Math.max(...pts.map((p) => pr(p, u))), v0: Math.min(...pts.map((p) => pr(p, v))), v1: Math.max(...pts.map((p) => pr(p, v)))};
  const lejos = {u0: 0, u1: 0, v0: 0, v1: 0};
  for (const it of items) {
    if ((it.tipo !== "linea" && it.tipo !== "poli") || !/barand|parapet/i.test(it.capa ?? "")) continue;
    if (caja && !it.puntos.every((p) => p.x >= caja.x0 && p.x <= caja.x1 && p.y >= caja.y0 && p.y <= caja.y1)) continue;
    for (const q of it.puntos) {
      const p = {x: q.x / k, y: q.y / k}, a = pr(p, u), b = pr(p, v);
      const enV = b > ext.v0 - 1 && b < ext.v1 + 1, enU = a > ext.u0 - 1 && a < ext.u1 + 1;
      if (enV) { lejos.u1 = Math.max(lejos.u1, a - ext.u1); lejos.u0 = Math.max(lejos.u0, ext.u0 - a); }
      if (enU) { lejos.v1 = Math.max(lejos.v1, b - ext.v1); lejos.v0 = Math.max(lejos.v0, ext.v0 - b); }
    }
  }
  return Object.entries(lejos).filter(([, d]) => d >= 0.8 && d <= 3.5).map(([lado, d]) => ({lado, ancho: Math.round(d * 20) / 20}));
}

// La losa (envolvente con alero) llega hasta el borde del volado en ese lado.
function extenderLosa(losa, pano, volados, u, v) {
  const pr = (p, e) => p.x * e.x + p.y * e.y;
  let out = losa;
  for (const vo of volados) {
    const e = vo.lado[0] === "u" ? u : v, s = vo.lado[1] === "1" ? 1 : -1;
    const lim = s > 0 ? Math.max(...pano.map((p) => pr(p, e))) : Math.min(...pano.map((p) => pr(p, e)));
    out = out.map((p) => { const d = (pr(p, e) - lim) * s; return d > 0 ? {x: p.x + e.x * s * (vo.ancho - d), y: p.y + e.y * s * (vo.ancho - d)} : p; });
  }
  return out;
}

const DESCANSO_MAX = 2.2, AMBIENTE_MIN = 3.5;
// Ambiente de doble altura: la losa de entrepiso no lo cubre (queda vacío con su aspa).
const DOBLE_ALTURA = /^\s*S\.?\s?U\.?\s?M\.?\s*$|usos\s+m[uú]ltiples|auditorio|coliseo|gimnasio|doble\s+altura|^\s*vac[ií]o\s*$/i;
// Rótulo de un ambiente (palabra de 4+ letras) que no es de la escalera ni un dato de acabado.
const AMBIENTE = /[A-ZÁÉÍÓÚÑ]{4,}/;
const NO_AMBIENTE = /escaler|descanso|hall|piso|cota|npt|proy|inicio|vac[ií]o|porcelanato|cer[aá]mic|\d/i;
// La celda de la escalera se abre solo en la huella de la escalera (tramos + descanso); el resto
// de la celda es losa maciza (hall o descanso), como el ingeniero en los módulos 1 y 3.
function partirEscaleras(celdas, escaleras, u, v) {
  if (!celdas || !escaleras.length) return celdas;
  const pr = (p, e) => p.x * e.x + p.y * e.y;
  const corte = (P, val, eje, signo) => (P.length >= 3 ? cortarSemiplano(P, {x: eje.x * val, y: eje.y * val}, {x: eje.x * signo, y: eje.y * signo}) : []);
  return celdas.flatMap((c) => {
    if (c.motivo === "volado") return [c];
    const [cu0, cu1] = rango(c.P, u), [cv0, cv1] = rango(c.P, v);
    // La celda que tiene la escalera (por texto o por la mitad de sus peldaños dentro).
    const b = escaleras.find((e) => (c.tipo === "abertura" ? Math.min(e.u1, cu1) - Math.max(e.u0, cu0) > 0.5 && Math.min(e.v1, cv1) - Math.max(e.v0, cv0) > 0.5
      : (e.u0 + e.u1) / 2 > cu0 && (e.u0 + e.u1) / 2 < cu1 && (e.v0 + e.v1) / 2 > cv0 && (e.v0 + e.v1) / 2 < cv1));
    if (!b) return [c];
    c = {...c, tipo: "abertura", motivo: "escalera"};
    const fuera = [];
    let resto = c.P;
    fuera.push(corte(resto, b.u0, u, -1)); resto = corte(resto, b.u0, u, 1);
    fuera.push(corte(resto, b.u1, u, 1)); resto = corte(resto, b.u1, u, -1);
    fuera.push(corte(resto, b.v0, v, -1)); resto = corte(resto, b.v0, v, 1);
    fuera.push(corte(resto, b.v1, v, 1)); resto = corte(resto, b.v1, v, -1);
    // El resto de la celda es descanso o hall (maciza), salvo una pieza ancha (> 2.2 m con el
    // rótulo de otro ambiente, o > 3.5 m aunque no lo tenga): es un aula, oficina o depósito
    // junto a la escalera y sigue aligerado (ILO módulos 1, 3 y 7 en el plano del ingeniero;
    // VINCHOS módulo 3 conserva su franja de 3 m maciza junto a la escalera de emergencia).
    const ancho = (P) => Math.min(...[u, v].map((e) => { const [a, b] = rango(P, e); return b - a; }));
    const conAmbiente = (P) => (c.rotulos ?? []).some((p) => dentroDe(p, P));
    const piezas = fuera.filter((P) => P.length >= 3 && areaDe(P) > 0.3)
      .map((P) => ((ancho(P) > DESCANSO_MAX && conAmbiente(P)) || ancho(P) > AMBIENTE_MIN ? {...c, P, tipo: "aligerada", motivo: null, resto: true} : {...c, P, tipo: "maciza", motivo: "descanso"}));
    return resto.length >= 3 && areaDe(resto) > 0.3 ? [{...c, P: resto}, ...piezas] : [c];
  });
}

// Ambientes que cambian la losa (escalera, baños), sin dibujar nada: para que el agente le
// pregunte al ingeniero antes de generar las láminas.
export function ambientesDeLosa({lectura, items = [], k = 1}) {
  if ((lectura.columnas?.length ?? 0) < 3) return [];
  const tramos = tramosEntreColumnas(lectura.columnas);
  const pano = huellaColumnas(lectura.columnas);
  const alero = CRITERIOS.aligerado.alero;
  const losa = alero > 0 ? desplazarPoligono(pano, alero) : pano;
  const u = direccionPrincipal(lectura.ejes), v = {x: -u.y, y: u.x};
  return (celdasDeGrilla({lectura, tramos, losa, u, v, items, k}) ?? []).filter((c) => c.tipo !== "aligerada")
    .map((c) => ({tipo: c.tipo, motivo: c.motivo, ejes: c.ejes, area: Math.round(areaDe(c.P) * 100) / 100}));
}

// espesorFijo: el que indicó el ingeniero (corrección en el chat); si no, por la luz.
// losaMaciza: false si el ingeniero decidió aligerado también en los baños (por defecto, maciza).
// conVacios: false en la losa de techo (la escalera no sube: la losa es continua).
// volados: los de voladosDesdePlanta (pasillo en voladizo), en el marco de esta planta.
// alero: m de losa fuera de las columnas; null = el del criterio (techo). Una losa de entrepiso
// termina en la cara de la viga (alero 0), como la dibuja el ingeniero.
export function planoAligerado({lectura, items = [], k = 1, espesorFijo = null, losaMaciza = true, conVacios = true, volados = [], alero: aleroPedido = null, tipoCimentacion = null, pisos = 1, vigaSecundaria = null}) {
  const columnas = lectura.columnas;
  // Con volado los ejes pasan su borde (las burbujas quedan fuera de la losa).
  const bordeVolado = (() => {
    if (!volados.length) return [];
    const pn = huellaColumnas(columnas), ud = direccionPrincipal(lectura.ejes);
    return extenderLosa(desplazarPoligono(pn, CRITERIOS.aligerado.alero), pn, volados, ud, {x: -ud.y, y: ud.x});
  })();
  const base = primitivasBase(lectura.ejes, columnas, {extra: bordeVolado});
  const {h} = base;
  const prim = [];

  // Vigas en los ejes, entre caras de columnas. Con las reglas del despacho: las que reciben las
  // viguetas (perpendiculares a ellas) con el peralte de la mayor luz libre de esas vigas (el
  // despacho usa una sola sección: módulo 1, luces 4.43 y 6.23 → V(0.30x0.60)); las paralelas a
  // las viguetas, el peralte de las que no cargan losa (0.40); ancho = espesor de la columna o
  // placa donde llegan, hasta 0.30 (módulo 14: columnas de 0.25 → V(0.25x0.40)).
  // Sin reglas: peralte por la luz entre ejes de cada tramo.
  const tramos = tramosEntreColumnas(columnas);
  // Reglas del tipo de cimentación del proyecto (platea / zapatas): las de su sistema estructural.
  const reglasVigas = (tipoCimentacion ? reglasPara(tipoCimentacion)?.vigas : REGLAS_DESPACHO.vigas) ?? null;
  const conReglas = Boolean(reglasVigas?.luzSobrePeralte);
  const dirViguetas = direccionViguetas(lectura.ejes, direccionPrincipal(lectura.ejes));
  const cargaLosa = (t) => !dirViguetas || Math.abs(t.d.x * dirViguetas.x + t.d.y * dirViguetas.y) < 0.5;
  // Con las reglas del despacho, la sección principal sale de la mayor luz ENTRE EJES que carga
  // losa; una línea que carga pero salva menos de 0.8 de esa luz va con la secundaria (ilo 4:
  // 10.49 m → 0.85, 5.61 m → 0.50), y el peralte crece con los pisos (seccionVigaDespacho).
  const luzEjesDe = (t) => Math.hypot(t.hasta.nodo.x - t.desde.nodo.x, t.hasta.nodo.y - t.desde.nodo.y);
  const cargan = tramos.filter(cargaLosa);
  const luzMayor = Math.max(0, ...cargan.map(luzEjesDe));
  const lineaMayor = new Map();
  for (const t of cargan) lineaMayor.set(t.eje, Math.max(lineaMayor.get(t.eje) ?? 0, luzEjesDe(t)));
  for (const t of tramos) {
    t.cargaLosa = cargaLosa(t);
    const principal = t.cargaLosa && (lineaMayor.get(t.eje) ?? 0) >= 0.8 * luzMayor;
    // La regla del despacho vale con platea y con zapatas (se midió en vinchos y en ilo, que es de zapatas).
    t.seccion = seccionVigaDespacho({luzMayor, principal, pisos, secundaria: vigaSecundaria, apoyos: [t.desde, t.hasta]}, reglasVigas, CRITERIOS.vigas);
    t.medida = `${t.seccion.b.toFixed(2)}x${t.seccion.h.toFixed(2)}`;
  }
  // Ancho de las vigas interiores (sobre muros, cumbrera): el más usado en los ejes.
  const anchoEjes = (() => { const c = new Map(); for (const t of tramos) c.set(t.seccion.b, (c.get(t.seccion.b) ?? 0) + 1); return [...c].sort((a, b) => b[1] - a[1])[0]?.[0]; })();
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
  const pano = huellaColumnas(columnas);
  const alero = aleroPedido ?? CRITERIOS.aligerado.alero;
  const u = direccionPrincipal(lectura.ejes), v = {x: -u.y, y: u.x};
  const losa = extenderLosa(alero > 0 ? desplazarPoligono(pano, alero) : pano, pano, volados, u, v);
  prim.push(pline(L.ALIGERADO, losa.map(pt), true));
  const proy = (p, eje) => p.x * eje.x + p.y * eje.y;
  // Vigas del volado, como el expediente: las vigas de los ejes que cruzan el volado siguen en
  // voladizo ("V VARIABLE") y una viga chata de borde ("VCH(20x20cm)") cierra la losa.
  const vigasVolado = [];
  for (const vo of volados) {
    const e = vo.lado[0] === "u" ? u : v, otra = vo.lado[0] === "u" ? v : u, s = vo.lado[1] === "1" ? 1 : -1;
    const lim = s > 0 ? Math.max(...pano.map((p) => proy(p, e))) : Math.min(...pano.map((p) => proy(p, e)));
    const borde = lim + s * vo.ancho;
    const [o0, o1] = rango(losa, otra);
    const P = (a, b) => ({x: e.x * a + otra.x * b, y: e.y * a + otra.y * b});
    // Ejes perpendiculares al borde (los que cruzan el volado) con viga.
    const cruzan = tramos.filter((t) => Math.abs(proy(t.d, e)) > 0.9).map((t) => proy(t.a, otra));
    const posiciones = [...new Set(cruzan.map((x) => Math.round(x * 100) / 100))];
    for (const b of posiciones) {
      prim.push(banda(L.VIGAS, P(lim, b), P(borde - s * 0.1, b), 0.25));
      prim.push(text(L.VIGAS, pt(P(lim + s * vo.ancho * 0.5, b + h * 0.45)), "V VARIABLE", h * 0.32, vo.lado[0] === "u" ? 0 : 90));
      vigasVolado.push({tipo: "V VARIABLE", eje: "", b: 0.25, h: 0.4, largo: vo.ancho});
    }
    prim.push(banda(L.VIGAS, P(borde - s * 0.1, o0), P(borde - s * 0.1, o1), 0.2));
    prim.push(text(L.VIGAS, pt(P(borde + s * h * 0.6, (o0 + o1) / 2)), "VCH(20x20cm)", h * 0.32, vo.lado[0] === "u" ? 90 : 0));
    vigasVolado.push({tipo: "VCH", eje: "", b: 0.2, h: 0.2, largo: o1 - o0});
  }
  const centroPano = pano.reduce((acc, p) => ({x: acc.x + p.x / pano.length, y: acc.y + p.y / pano.length}), {x: 0, y: 0});

  // Edificio con grilla de varias celdas (módulos 1–13 de VINCHOS): como el ingeniero, un paño
  // por celda entre vigas de ejes; la escalera deja la celda abierta y los baños llevan losa
  // maciza. Con una sola celda (casetas como el módulo 14) se sigue el criterio de muros
  // interiores y viga de cumbrera.
  // Caras de los muros (metros), para limitar la losa maciza al ambiente húmedo.
  const murosLosa = items.length ? murosDelEdificio({columnas, items, k}).geometria.flatMap((g) => g.pts.slice(1).map((q, i) => [g.pts[i], q]).concat(g.cerrada && g.pts.length > 2 ? [[g.pts.at(-1), g.pts[0]]] : [])) : [];
  const celdas = partirEscaleras(celdasDeGrilla({lectura, tramos, losa, u, v, items, k, volados, muros: murosLosa, losaMaciza}), conVacios ? escalerasEnPlanta({columnas, items, k}, u) : [], u, v)
    ?.map((c) => ((c.tipo === "maciza" && losaMaciza === false && c.motivo === "baños") || (c.tipo === "abertura" && conVacios === false) ? {...c, tipo: "aligerada", motivo: c.motivo === "vacío" ? null : c.motivo} : c)) ?? null;
  // Muros interiores largos: la losa se divide en paños con una viga sobre cada uno.
  // La viga central es la de cumbrera (módulo XIV: "VCUMBRERA" sobre el muro central).
  const interiores = !celdas && items.length ? murosDelEdificio({columnas, items, k}).tramos.filter((t) => !t.exterior && t.largo >= 1.0) : [];
  // Los paños se miden sobre la losa con aleros (el expediente cuenta 6 + 6 viguetas).
  // Un solo paño con cisterna o tanque (módulo 15): toda la losa es maciza.
  const textosLosa = !celdas ? items.filter((it) => it.tipo === "texto" && it.texto && it.centro && dentroDe({x: it.centro.x / k, y: it.centro.y / k}, losa)).map((it) => it.texto) : [];
  const cisternaUnica = !celdas && textosLosa.some((t) => AGUA.test(t));
  let panos = celdas ? celdas.filter((c) => c.tipo === "aligerada").map((c) => c.P) : cisternaUnica ? [] : [losa];
  const especiales = celdas ? celdas.filter((c) => c.tipo !== "aligerada") : cisternaUnica ? [{P: losa, tipo: "maciza", motivo: "cisterna"}] : [];
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
    const largoInterior = Math.hypot(tramo[1].x - tramo[0].x, tramo[1].y - tramo[0].y);
    // Sobre un muro no carga como viga de pórtico: peralte de las que no cargan losa.
    // No carga losa: la sección secundaria del proyecto, con el ancho de las vigas de los ejes.
    const sec = {...seccionVigaDespacho({luzMayor: largoInterior, principal: false, secundaria: vigaSecundaria}, reglasVigas, CRITERIOS.vigas), ...(anchoEjes ? {b: anchoEjes} : {})};
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
  // Dirección de la planta: las viguetas salvan la luz corta de la grilla de ejes (la mayor
  // separación entre ejes en cada dirección; medido en los planos del ingeniero). Los paños de
  // volado la siguen: medidos con el volado incluido darían la dirección cruzada.
  const separaciones = (eje) => {
    const pos = [...new Set((lectura.ejes ?? []).filter((e) => !e.inclinado).map((e) => {
      const d = {x: e.q.x - e.p.x, y: e.q.y - e.p.y}, l = Math.hypot(d.x, d.y) || 1;
      return Math.abs(proy(d, eje) / l) < 0.26 ? Math.round(proy({x: (e.p.x + e.q.x) / 2, y: (e.p.y + e.q.y) / 2}, eje) * 100) / 100 : null;
    }).filter((x) => x !== null))].sort((a, b) => a - b);
    return pos.slice(1).map((x, i) => x - pos[i]).filter((d) => d > 0.3);
  };
  const [su, sv] = [separaciones(u), separaciones(v)];
  const direccionPlanta = su.length && sv.length ? (Math.max(...su) <= Math.max(...sv) ? "u" : "v") : null;
  const panosVolado = new Set((celdas ?? []).filter((c) => c.motivo === "volado").map((c) => c.P));
  const datosPanos = panos.map((P, i) => {
    // Interior del paño entre vigas (sin aleros): ahí van el bastón y los trazos.
    const Pin = interseccionConvexa(P, pano);
    const [u0, u1] = rango(P, u), [v0, v1] = rango(P, v);
    // Con viga de cumbrera las viguetas corren paralelas a ella y se apoyan en las vigas
    // de los ejes que la cruzan (módulo XIV); si no, van en la luz corta del paño.
    const cumbrera = vigasInternas.find((x) => x.nombre === "VCUMBRERA");
    const corta = cumbrera ? (Math.abs(proy(cumbrera.d, u)) >= Math.abs(proy(cumbrera.d, v)) ? "u" : "v")
      : panosVolado.has(P) && direccionPlanta ? direccionPlanta : u1 - u0 <= v1 - v0 ? "u" : "v";
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
        // Marca de vigueta como el ingeniero (receta medida en sus planos): par de trazos a la
        // separación de la vigueta y del largo que él usa.
        const par = receta("vigueta.separacionPar", 0.05, [0.03, 0.15]) / 2, largoMarca = receta("vigueta.largo", 0.32, [0.2, 0.8]);
        for (const off of [-par, par]) {
          const q0 = {x: p.x + dir.x * sg * 0.1 + reparto.x * off, y: p.y + dir.y * sg * 0.1 + reparto.y * off};
          prim.push(line(L.VIGUETAS, pt(q0), pt({x: q0.x + dir.x * sg * largoMarca, y: q0.y + dir.y * sg * largoMarca})));
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
    const espesorPano = espesorFijo ?? espesorAligerado(Math.max(luzPano, luzEjes));
    const r = {x: centro.x - reparto.x * desp, y: centro.y - reparto.y * desp};
    const etiqueta = `LOSA ALIGERADA E=${Math.round(espesorPano * 100)}CM\\P(${n} VIGUETAS)`;
    const valor = panos.length > 1 ? `Paño ${String(i + 1).padStart(2, "0")}\\P${etiqueta}` : etiqueta;
    // El rótulo busca lugar libre dentro de su paño (en paños chicos chocaba con las llamadas
    // 1Ø3/8" del bastón y con los rótulos de columnas: módulo 09).
    const flecha = {x0: Math.min(A.x, B.x) - h * 0.3, y0: Math.min(A.y, B.y) - h * 0.3, x1: Math.max(A.x, B.x) + h * 0.3, y1: Math.max(A.y, B.y) + h * 0.3, h: hp};
    const corto = `E=${Math.round(espesorPano * 100)}CM (${n} VIG.)`;
    const variantes = panos.length > 1 ? [`Paño ${String(i + 1).padStart(2, "0")}\\P${corto}`, `P-${String(i + 1).padStart(2, "0")} ${corto}`] : [corto];
    const sitio = ubicarSinEncimar({valor, variantes, h: hp, preferido: r, zona: Pin?.length >= 3 ? Pin : P, ocupadas: [...cajasDeTextos([...base.primitivas, ...prim]), flecha]});
    prim.push(text(L.TEXTO_LOSA, pt(sitio), sitio.valor, sitio.h));
    return {pano: i + 1, viguetas: n, luz: luzPano, espesor: espesorPano, area: areaDe(Pin?.length >= 3 ? Pin : P), ancho: r1 - r0};
  });
  const espesor = espesorFijo ?? espesorAligerado(Math.max(luz, luzEjes));

  // Losa maciza (baños, SS.HH.) con su malla, y vacío de escalera con aspa, como el expediente.
  const especialesModelo = [];
  for (const c of especiales) {
    const Pin = interseccionConvexa(c.P, pano);
    const centro = Pin.reduce((acc, p) => ({x: acc.x + p.x / Pin.length, y: acc.y + p.y / Pin.length}), {x: 0, y: 0});
    prim.push(pline(L.ALIGERADO, Pin.map(pt), true));
    if (c.tipo === "maciza") {
      // Malla de la losa maciza con trazos cada 0.25 m en las dos direcciones, como el ingeniero
      // (módulos 1, 3, 6: rejilla dibujada, no un achurado).
      for (const [dir, rep] of [[u, v], [v, u]]) {
        const [r0, r1] = rango(Pin, rep);
        const pasoMalla = receta("maciza.pasoMalla", 0.25, [0.1, 0.5]);
        for (let t = r0 + pasoMalla; t < r1 - 0.05; t += pasoMalla) {
          const tramo = recortar({x: rep.x * t, y: rep.y * t}, dir, Pin);
          if (tramo) prim.push(line(L.MALLA, pt(tramo[0]), pt(tramo[1])));
        }
      }
      const valor = `LOSA MACIZA E=${Math.round(espesor * 100)}CM`;
      const sitio = ubicarSinEncimar({valor, variantes: [`MACIZA E=${Math.round(espesor * 100)}`], h: hp, preferido: centro, zona: Pin, ocupadas: cajasDeTextos([...base.primitivas, ...prim])});
      prim.push(text(L.TEXTO_LOSA, pt(sitio), sitio.valor, sitio.h));
    } else {
      const [a, b, c2, d] = Pin.length === 4 ? Pin : [Pin[0], Pin[1], Pin[Math.floor(Pin.length / 2)], Pin.at(-1)];
      prim.push(line(L.ALIGERADO, pt(a), pt(c2)), line(L.ALIGERADO, pt(b), pt(d)));
      prim.push(text(L.TEXTO_LOSA, pt({x: centro.x, y: centro.y + hp * 1.5}), c.motivo === "escalera" ? "ESCALERA" : "VACÍO", hp));
    }
    especialesModelo.push({tipo: c.tipo, area: areaDe(Pin), motivo: c.motivo});
  }

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
    // Para el metrado: vigas por eje (largo libre entre caras) e internas, y el área de losa.
    modelo: {
      // Las vigas paralelas a la cumbrera llegan al alero en los dos extremos (módulo 14:
      // eje Y´ 2.93 + 2 x 0.60 = 4.13 en el metrado del ingeniero).
      vigas: [...tramos.map((t) => {
        const cumbrera = vigasInternas.find((x) => x.nombre === "VCUMBRERA");
        const paralela = cumbrera && Math.abs(t.d.x * cumbrera.d.x + t.d.y * cumbrera.d.y) > 0.9;
        return {tipo: t.tipo, eje: t.eje, b: t.seccion.b, h: t.seccion.h, largo: t.largo, alero: paralela ? 2 * alero : 0};
      }),
        ...vigasInternas.map((v) => ({tipo: v.nombre, eje: "", b: v.sec.b, h: v.sec.h, largo: Math.hypot(v.tramo[1].x - v.tramo[0].x, v.tramo[1].y - v.tramo[0].y)})),
        ...vigasVolado],
      losa: {espesor, areaBruta: areaDe(losa), areaPanos: datosPanos.reduce((s, p) => s + (p.area ?? 0), 0), panos: datosPanos.map((p) => ({luz: p.luz, viguetas: p.viguetas, area: p.area, ancho: p.ancho})),
        maciza: especialesModelo.filter((x) => x.tipo === "maciza").reduce((s, x) => s + x.area, 0),
        vacios: especialesModelo.filter((x) => x.tipo === "abertura").reduce((s, x) => s + x.area, 0)},
    },
    cumbrera: (({tramo, d} = {}) => (tramo ? {a: tramo[0], b: tramo[1], d} : null))(vigasInternas.find((x) => x.nombre === "VCUMBRERA")), tiposViga: medidas.map((m) => ({tipo: tramos.find((t) => t.medida === m).tipo, medida: m})),
    contenido: {titulo: "PLANO DE ALIGERADO", primitivas: [...base.primitivas, ...prim], marco: base.marco, ejes: base.ejes, h, notas},
  };
}
