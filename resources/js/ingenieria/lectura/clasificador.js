// Paso 3 del plan: clasificar cada entidad de un plano de estructuras (o de arquitectura) en el
// elemento que representa. Primero por el nombre de la capa (diccionario configurable); si la
// capa no dice nada (capa "0", nombres propios del dibujante) por la geometría respecto de los
// ejes. Cada clasificación guarda su evidencia (qué regla la decidió) para revisarla.
//
// Coordenadas en metros, en el marco de la vista (las del inventario CAD-JSON).

export const CLASES = ["eje", "columna", "columneta", "muro", "viga", "vigueta", "losa", "zapata", "cimiento",
  "acero", "cota", "texto", "cuadro", "fondo", "otro"];
// Clases que forman el dibujo estructural (las que se comparan con el ingeniero).
export const CLASES_DIBUJO = ["columna", "columneta", "muro", "viga", "vigueta", "losa", "zapata", "cimiento", "acero"];

// Diccionario por nombre de capa (en orden: la primera que coincide manda).
export const DICCIONARIO_CAPAS = [
  ["eje", /eje|axis|grid|nomenclatura/i],
  ["cota", /cota|acot|dim(en)?s?\b|^dim|roman/i],
  ["cuadro", /cuadro|membr|rotulo|r[oó]tulo|marco|lamina|leyenda|tabla/i],
  ["texto", /texto|text|letra|titulo|t[ií]tulo|capa8/i],
  ["fondo", /arqui|mobil|equip|mueble|junta|piso|puntos|aparato|sanit|puerta|ventana|vano|indicador|proyecc|ambiente|vereda|jard/i],
  ["acero", /acero|fierro|estribo|varilla|refuerzo|bast[oó]n|malla/i],
  ["columneta", /columneta|amarre|confin/i],
  ["vigueta", /vigueta|aligerad|ladrillo de techo/i],
  ["viga", /viga|vch|vsa|dintel|solera/i],
  ["zapata", /zapata|dado|pedestal/i],
  ["cimiento", /cimiento|cimentaci|sobrecim|platea|solado/i],
  ["losa", /losa|maciza/i],
  ["columna", /columna|placa|^c-?\d|estructur/i],
  ["muro", /muro|tabique|alba[ñn]il|alfeiz|parapet/i],
];

const largoDe = (pts) => pts.slice(1).reduce((s, p, i) => s + Math.hypot(p.x - pts[i].x, p.y - pts[i].y), 0);
const cajaDe = (pts) => ({x0: Math.min(...pts.map((p) => p.x)), y0: Math.min(...pts.map((p) => p.y)), x1: Math.max(...pts.map((p) => p.x)), y1: Math.max(...pts.map((p) => p.y))});

// Contexto de la vista: posiciones de ejes (x verticales, y horizontales) y caja de la grilla.
export function contextoDeVista(vista) {
  const xs = vista.ejes.filter((e) => e.orientacion === "x").map((e) => e.posicion).sort((a, b) => a - b);
  const ys = vista.ejes.filter((e) => e.orientacion === "y").map((e) => e.posicion).sort((a, b) => a - b);
  return {xs, ys, caja: {x0: xs[0] ?? 0, x1: xs.at(-1) ?? 0, y0: ys[0] ?? 0, y1: ys.at(-1) ?? 0}};
}
const cerca = (v, lista, tol) => lista.some((x) => Math.abs(x - v) <= tol);

// Clasificación por geometría (cuando la capa no la dice).
function porGeometria(e, ctx) {
  if (e.tipo === "texto") return ["texto", "es un texto"];
  if (e.tipo === "circulo") return e.radio >= 0.15 && e.radio <= 0.6 ? ["eje", "círculo del tamaño de una burbuja"] : ["otro", "círculo"];
  const pts = e.puntos ?? [];
  if (pts.length < 2) return ["otro", "sin geometría"];
  const c = cajaDe(pts), w = c.x1 - c.x0, h = c.y1 - c.y0, L = largoDe(pts);
  const gw = ctx.caja.x1 - ctx.caja.x0, gh = ctx.caja.y1 - ctx.caja.y0;
  const cerrado = e.cerrada || (pts.length > 3 && Math.hypot(pts[0].x - pts.at(-1).x, pts[0].y - pts.at(-1).y) < 0.01);
  // Contorno que envuelve casi toda la grilla: losa o platea.
  if (cerrado && w >= 0.8 * gw && h >= 0.8 * gh) return ["losa", "contorno que envuelve la grilla"];
  // Polígono chico en un cruce de ejes: columna (≤ 1.6 m) o zapata (más grande, sin lados de muro).
  const cx = (c.x0 + c.x1) / 2, cy = (c.y0 + c.y1) / 2;
  const enCruce = (cerca(cx, ctx.xs, Math.max(0.8, w / 2)) && cerca(cy, ctx.ys, Math.max(0.8, h / 2)));
  if (cerrado && enCruce && Math.max(w, h) <= 1.6 && Math.min(w, h) >= 0.12) return ["columna", "polígono cerrado en un cruce de ejes"];
  if (cerrado && enCruce && Math.max(w, h) <= 4 && Math.min(w, h) >= 0.8) return ["zapata", "polígono grande centrado en un cruce de ejes"];
  if (cerrado && Math.max(w, h) <= 0.45 && Math.min(w, h) >= 0.1) return ["columneta", "polígono chico fuera de los cruces"];
  // Rectángulo angosto y largo a lo largo de un eje: viga (dibujada con sus dos caras).
  const angosto = Math.min(w, h), largo2 = Math.max(w, h);
  if (cerrado && pts.length <= 5 && angosto >= 0.12 && angosto <= 0.7 && largo2 >= 1.2
    && ((w >= h && cerca(cy, ctx.ys, 0.6)) || (h > w && cerca(cx, ctx.xs, 0.6)))) return ["viga", "rectángulo angosto a lo largo de un eje"];
  // Franja muy angosta y larga con más de 4 vértices (puntas redondeadas): símbolo de acero (bastón).
  if (pts.length > 4 && angosto <= 0.3 && largo2 >= 1.0) return ["acero", "franja angosta de puntas redondeadas (bastón)"];
  // Trazo recto largo pegado a un eje (≤ 0.5 m): viga o borde de cimiento.
  const horizontal = h <= 0.02 && w > 0.5, vertical = w <= 0.02 && h > 0.5;
  if ((horizontal && cerca(cy, ctx.ys, 0.5)) || (vertical && cerca(cx, ctx.xs, 0.5))) return ["viga", "trazo recto a lo largo de un eje"];
  // Trazos cortos (0.15–0.6 m) rectos: marcas de vigueta del aligerado.
  if ((horizontal || vertical || pts.length === 2) && L >= 0.12 && L <= 0.6) return ["vigueta", "trazo corto (marca de vigueta)"];
  // Trazos rectos largos dentro de la grilla, lejos de los ejes: muros o tabiques.
  if ((horizontal || vertical) && L >= 0.5) return ["muro", "trazo recto dentro de la planta"];
  return ["otro", "geometría sin regla"];
}

// Arquitectura de fondo dentro de un plano de estructuras (el ingeniero calca la arquitectura):
// capas con prefijo de disciplina del estándar CAD (A- arquitectura, I- interiores, P- sanitarias,
// M- mecánicas, G- general…; no E_, que en el despacho es "estructuras"), mobiliario y proyecciones.
// Así no se cuentan como vigas o muros del ingeniero ni entran a las recetas.
export const CAPAS_ARQ_DE_FONDO = /^(?:[AIPMGQLF][-_]|x-)|mobil|masa|arqui|\bproy(?:\.|ecc|\b)|a-glaz|wall\b|sanr|fixt|furn|eqpm|^\.0\.ar/i;
const PLANOS_DE_ESTRUCTURA = /cimentacion|cimiento|losa|tabiqueria|portico|estructura/i;

// Clase de una entidad: {clase, por: "capa" | "geometria", evidencia}.
export function clasificar(e, ctx) {
  // Ejes, cotas y cuadros se reconocen antes (A-NOMENCLATURA DE EJES es eje, no fondo).
  if (ctx?.estructural && CAPAS_ARQ_DE_FONDO.test(e.capa ?? "") && !/eje|axis|grid|cota|cuadro|rotulo|r[oó]tulo/i.test(e.capa ?? "")) {
    return {clase: "fondo", por: "capa", evidencia: `arquitectura de fondo (capa "${e.capa}")`};
  }
  // Las capas "0" y genéricas no dicen nada: decide la geometría.
  if (!/^(0|defpoints|\.|0\.\d+|default)$/i.test(String(e.capa ?? "").trim())) {
    for (const [clase, re] of DICCIONARIO_CAPAS) if (re.test(e.capa ?? "")) return {clase, por: "capa", evidencia: `capa "${e.capa}"`};
  }
  const [clase, evidencia] = porGeometria(e, ctx);
  return {clase, por: "geometria", evidencia};
}

// Clasifica todas las entidades de una vista del inventario (no la modifica: devuelve las clases).
export function clasificarVista(vista) {
  const ctx = {...contextoDeVista(vista), estructural: PLANOS_DE_ESTRUCTURA.test(vista.tipoPlano ?? "")};
  const out = vista.entidades.map((e) => clasificar(e, ctx));
  // Rejilla de trazos paralelos del mismo largo a 0.15–0.45 m (malla de losa maciza o de platea):
  // es losa, no muros. (En las plantas de arquitectura esa rejilla es una escalera.)
  marcarMallas(vista.entidades, out, vista.tipoPlano === "planta" ? "fondo" : "losa");
  return out;
}

// Índices de las entidades que forman una rejilla (malla de platea o de losa maciza), en
// cualquier capa: ≥ 7 trazos paralelos que se solapan a lo largo, a paso regular de 0.15–0.45 m.
// El largo puede variar (la malla se recorta contra un contorno irregular).
// Paso de una malla dibujada: 0.15 a 0.45 m, con tolerancia porque las posiciones se restan ya
// redondeadas (1.35 - 1.20 = 0.1499...) y la malla @0.15 (Ø3/4"@0.15, VINCHOS 04) quedaba fuera.
const PASO_MALLA_MIN = 0.145, PASO_MALLA_MAX = 0.455;

export function indicesDeRejilla(entidades) {
  const segs = entidades.map((e, i) => ({e, i})).filter(({e}) => e.puntos?.length === 2)
    .map(({e, i}) => { const [a, b] = e.puntos, l = Math.hypot(b.x - a.x, b.y - a.y); return {i, a, b, l}; })
    .filter((s) => s.l >= 0.5);
  const dentro = new Set();
  for (const horizontal of [true, false]) {
    // Solo trazos casi paralelos a los ejes del dibujo (±3°): (largo, posición, desde, hasta).
    const lista = segs.filter((s) => (horizontal ? Math.abs(s.b.y - s.a.y) : Math.abs(s.b.x - s.a.x)) <= s.l * 0.05)
      .map((s) => ({i: s.i, pos: horizontal ? (s.a.y + s.b.y) / 2 : (s.a.x + s.b.x) / 2,
        d0: Math.min(horizontal ? s.a.x : s.a.y, horizontal ? s.b.x : s.b.y), d1: Math.max(horizontal ? s.a.x : s.a.y, horizontal ? s.b.x : s.b.y)}))
      .sort((x, y) => x.pos - y.pos);
    for (const s of lista) {
      if (dentro.has(s.i)) continue;
      const vecinos = lista.filter((o) => Math.min(o.d1, s.d1) - Math.max(o.d0, s.d0) >= 0.5 * Math.min(o.d1 - o.d0, s.d1 - s.d0) && Math.abs(o.pos - s.pos) <= 3);
      if (vecinos.length < 7) continue;
      const pos = [...new Set(vecinos.map((o) => Math.round(o.pos * 100) / 100))].sort((x, y) => x - y);
      const pasos = pos.slice(1).map((q, j) => q - pos[j]);
      if (pasos.length >= 6 && pasos.filter((x) => x >= PASO_MALLA_MIN && x <= PASO_MALLA_MAX).length >= pasos.length * 0.7) for (const o of vecinos) dentro.add(o.i);
    }
  }
  return dentro;
}

function marcarMallas(entidades, clases, clase) {
  const segs = entidades.map((e, i) => ({e, i})).filter(({e, i}) => clases[i].por === "geometria" && e.puntos?.length === 2)
    .map(({e, i}) => { const [a, b] = e.puntos, l = Math.hypot(b.x - a.x, b.y - a.y); return {i, a, l, d: l ? {x: (b.x - a.x) / l, y: (b.y - a.y) / l} : null}; })
    .filter((s) => s.d && s.l >= 0.5);
  const porDir = new Map();
  for (const s of segs) { const k = Math.abs(s.d.x) > Math.abs(s.d.y) ? "h" : "v"; porDir.set(k, [...(porDir.get(k) ?? []), s]); }
  for (const lista of porDir.values()) {
    for (const s of lista) {
      if (clases[s.i].clase === clase) continue;
      const n = {x: -s.d.y, y: s.d.x};
      const vecinos = lista.filter((o) => Math.abs(o.l - s.l) < 0.1 && Math.abs((o.a.x - s.a.x) * s.d.x + (o.a.y - s.a.y) * s.d.y) < 0.2);
      if (vecinos.length < 6) continue;
      const pos = [...new Set(vecinos.map((o) => Math.round(((o.a.x - s.a.x) * n.x + (o.a.y - s.a.y) * n.y) * 100) / 100))].sort((a, b) => a - b);
      const pasos = pos.slice(1).map((p, j) => p - pos[j]);
      if (pasos.filter((x) => x >= PASO_MALLA_MIN && x <= PASO_MALLA_MAX).length >= pasos.length * 0.7) for (const o of vecinos) clases[o.i] = {clase, por: "geometria", evidencia: "rejilla de trazos paralelos regulares (malla)"};
    }
  }
}
