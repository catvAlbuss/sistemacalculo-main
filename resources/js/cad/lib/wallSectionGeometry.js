/**
 * Geometría de una sección de placa EN EL NAVEGADOR, en coordenadas del Section
 * Designer (X, Y).
 *
 * POR QUÉ EXISTE (y por qué duplica al motor)
 *   `python-backend/design/wall_section.py` es la ÚNICA fuente de verdad del
 *   cálculo. Pero para arrastrar una varilla con el mouse hace falta redibujar
 *   a 60 fps, y no se puede ir al servidor en cada `mousemove`. Entonces:
 *
 *     - mientras se arrastra, se dibuja con ESTA geometría (aproximada, local);
 *     - al soltar, se recalcula en el motor y el dibujo se rehace con lo que
 *       devuelve el motor.
 *
 *   O sea el espejo es solo para la INTERACCIÓN. Si los dos difieren, gana el
 *   motor y se ve al soltar. Es el mismo criterio que la vista previa del
 *   diseñador de armado de columnas.
 *
 * EJES
 *   Acá se trabaja en (X, Y) del Section Designer, que es como vienen las shapes
 *   del `.e2k` y como se editan en el panel. El motor internamente transpone a
 *   (u, v) = (Y, X); eso NO pasa por acá.
 *
 * OJO: la regla del espaciamiento tiene que seguir a `_cuantas_barras` del
 * motor, incluida la tolerancia del 5% (ETABS tolera pasarse del máximo — está
 * medido, ver el docstring de allá). Si se toca una, hay que tocar la otra.
 */

import { lSectionVertices, teeSectionVertices } from "./sectionPolygon.js";

/** Espejo de TOL_ESPACIAMIENTO en design/wall_section.py. */
export const TOL_ESPACIAMIENTO = 0.05;

/**
 * Lee la primera clave que exista, en cualquier capitalización. Espejo de
 * `_clave` en wall_section.py, y NO es un adorno: las shapes llegan del
 * importador (`SPACING`, `XC`) o de fixtures y payloads escritos a mano
 * (`spacing`, `xc`), y el motor tolera las dos. Si el dibujo fuera menos
 * tolerante que el cálculo, mostraría una sección distinta de la que se
 * calcula — que es justo lo que pasó: las varillas de línea desaparecían del
 * canvas porque se leía solo `SPACING`.
 */
function campo(shape, ...nombres) {
  for (const n of nombres) {
    for (const k of [n, n.toLowerCase(), n.toUpperCase()]) {
      if (shape && shape[k] !== undefined && shape[k] !== null) return shape[k];
    }
  }
  return undefined;
}

const num = (v, d = 0) => (Number.isFinite(Number(v)) ? Number(v) : d);
/** Numero de un campo de la shape, tolerante a la capitalizacion. */
const numC = (shape, d, ...nombres) => num(campo(shape, ...nombres), d);
const tipoDe = (s) => String(campo(s, "shapeType", "type") || "").toUpperCase().trim();

export const ES_CONCRETO = (t) =>
  ["POLYGON", "CONC RECTANGULAR", "CONC RECTANGLE", "CONC RECT", "CONC L", "CONC T", "CONC TEE",
   "CONC CIRCLE", "CIRCLE", "CONC CIRCULAR"].includes(t);
export const ES_ARMADO = (t) => t.includes("REBAR") && !ES_CONCRETO(t);

/** Lados con los que se poligoniza un circulo. Espejo de LADOS_CIRCULO. */
export const LADOS_CIRCULO = 72;

/** Gira los vertices alrededor del origen local de la pieza. */
function rotar(pts, grados) {
  if (!grados) return pts;
  const r = (Number(grados) * Math.PI) / 180;
  const c = Math.cos(r), s = Math.sin(r);
  return pts.map(([u, v]) => [u * c - v * s, u * s + v * c]);
}

/**
 * Circulo poligonizado con el radio CORREGIDO para que el area del poligono sea
 * exactamente la del circulo. Sin la correccion, 72 lados subestiman 0.06%.
 */
function circuloVertices(diametro, lados = LADOS_CIRCULO) {
  const d = Number(diametro);
  if (!(d > 0)) return [];
  const n = Math.max(12, lados);
  const r = (d / 2) * Math.sqrt((2 * Math.PI) / n / Math.sin((2 * Math.PI) / n));
  return Array.from({ length: n }, (_, k) => [
    r * Math.cos((2 * Math.PI * k) / n),
    r * Math.sin((2 * Math.PI * k) / n),
  ]);
}

/** Vértices de una pieza de concreto, en (X, Y) del Section Designer. */
export function verticesDePieza(shape, mirror2 = false, mirror3 = false) {
  const t = tipoDe(shape);
  // Espejo y rotacion son propiedades de LA SHAPE, como en el dialogo de ETABS.
  // Los argumentos son solo el default para cuando no las trae. Con una sola
  // bandera para toda la seccion, agregar una segunda L daba vuelta la primera.
  const m2 = campo(shape, "mirror2"), m3 = campo(shape, "mirror3");
  if (m2 !== undefined) mirror2 = !!m2;
  if (m3 !== undefined) mirror3 = !!m3;
  const rotacion = numC(shape, 0, "rotation");
  const XC = numC(shape, 0, "XC", "x"), YC = numC(shape, 0, "YC", "y");

  if (t === "POLYGON") {
    return (campo(shape, "corners", "polyCorners") || [])
      .map((c) => ({ X: num(c.X ?? c.x), Y: num(c.Y ?? c.y) }))
      .filter((p) => Number.isFinite(p.X) && Number.isFinite(p.Y));
  }

  const D = numC(shape, 0, "D", "depth"), B = numC(shape, 0, "B", "width");
  const TF = numC(shape, 0, "TF", "flangeThick"), TW = numC(shape, 0, "TW", "webThick");
  let base = [];
  if (t === "CONC CIRCLE" || t === "CIRCLE" || t === "CONC CIRCULAR") {
    base = circuloVertices(numC(shape, 0, "diameter", "D"));
  } else if (t === "CONC RECTANGULAR" || t === "CONC RECTANGLE" || t === "CONC RECT") {
    const hd = D / 2, hb = B / 2;
    if (hd <= 0 || hb <= 0) return [];
    base = [[hd, hb], [-hd, hb], [-hd, -hb], [hd, -hb]];
  } else if (t === "CONC L") {
    base = lSectionVertices(D, B, TF, TW, mirror2, mirror3);
  } else if (t === "CONC T" || t === "CONC TEE") {
    base = teeSectionVertices(D, B, TF, TW);
    if (mirror2) base = base.map(([u, v]) => [u, -v]);
    if (mirror3) base = base.map(([u, v]) => [-u, v]);
  } else {
    return [];
  }
  // `sectionPolygon` devuelve (u, v) = (eje 2, eje 3); en SD eso es (X, Y) = (v, u).
  return rotar(base, rotacion).map(([u, v]) => ({ X: v + XC, Y: u + YC }));
}

/**
 * Cuántas varillas entran en un segmento y en qué fracciones del recorrido.
 * Espejo de `_cuantas_barras` — ver la nota del encabezado.
 */
export function fraccionesDeLinea(largo, espaciamiento, conExtremos = false) {
  if (!(largo > 0) || !(espaciamiento > 0)) return [];
  const n = Math.max(1, Math.ceil(largo / (espaciamiento * (1 + TOL_ESPACIAMIENTO))));
  const salida = [];
  if (conExtremos) for (let i = 0; i <= n; i++) salida.push(i / n);
  else for (let i = 1; i < n; i++) salida.push(i / n);
  return salida;
}

const areaDeBarra = (nombre, catalogo) => num(catalogo?.[nombre], 0);

/** Varillas que aporta una shape de armado, en (X, Y). */
export function barrasDeShape(shape, catalogo) {
  const t = tipoDe(shape);
  const area = areaDeBarra(campo(shape, "barSize", "BARSIZE", "size"), catalogo);

  if (t === "REBAR") {
    return area > 0 ? [{ X: numC(shape, 0, "XC", "x"), Y: numC(shape, 0, "YC", "y"), area }] : [];
  }

  if (t === "LINE REBAR") {
    if (!(area > 0)) return [];
    const x1 = numC(shape, 0, "X1"), y1 = numC(shape, 0, "Y1");
    const x2 = numC(shape, 0, "X2"), y2 = numC(shape, 0, "Y2");
    const largo = Math.hypot(x2 - x1, y2 - y1);
    const conExtremos = String(campo(shape, "endBar", "ENDBAR") || "NO").toUpperCase() === "YES";
    return fraccionesDeLinea(largo, numC(shape, 0, "spacing", "SPACING"), conExtremos)
      .map((f) => ({ X: x1 + (x2 - x1) * f, Y: y1 + (y2 - y1) * f, area }));
  }

  if (t === "CIRCLE REBAR" || t === "CIRCLEBAR") {
    if (!(area > 0)) return [];
    const d = numC(shape, 0, "diameter", "D");
    const n = Math.round(numC(shape, 0, "numBars"));
    if (!(d > 0) || !(n > 0)) return [];
    const XC = numC(shape, 0, "XC", "x"), YC = numC(shape, 0, "YC", "y");
    const fase = (numC(shape, 0, "rotation") * Math.PI) / 180;
    return Array.from({ length: n }, (_, k) => {
      const ang = fase + (2 * Math.PI * k) / n;
      return { X: XC + (d / 2) * Math.cos(ang), Y: YC + (d / 2) * Math.sin(ang), area };
    });
  }

  if (t === "RECT REBAR") {
    const bordes = campo(shape, "edges", "EDGE") || [];
    const esquinasDef = campo(shape, "corners", "CORNER") || [];
    const aLado = areaDeBarra(campo(bordes[0] || {}, "size", "EDGEBARSIZE"), catalogo);
    const aEsq = areaDeBarra(campo(esquinasDef[0] || {}, "size", "CORNERBARSIZE"), catalogo) || aLado;
    if (!(aLado > 0) && !(aEsq > 0)) return [];

    const XC = numC(shape, 0, "XC", "x"), YC = numC(shape, 0, "YC", "y");
    const hd = numC(shape, 0, "D") / 2, hb = numC(shape, 0, "B") / 2;
    if (hd <= 0 || hb <= 0) return [];
    // Mismo orden que `barras_en_jaula`: esquinas y después cada lado.
    const esq = [
      { X: XC + hb, Y: YC + hd }, { X: XC + hb, Y: YC - hd },
      { X: XC - hb, Y: YC - hd }, { X: XC - hb, Y: YC + hd },
    ];
    const salida = esq.map((p) => ({ ...p, area: aEsq }));
    for (let i = 0; i < 4; i++) {
      const a = esq[i], b = esq[(i + 1) % 4];
      const sep = num(campo(bordes[i] || {}, "spacing", "EDGEBARSPACING"));
      const largo = Math.hypot(b.X - a.X, b.Y - a.Y);
      for (const f of fraccionesDeLinea(largo, sep, false)) {
        salida.push({ X: a.X + (b.X - a.X) * f, Y: a.Y + (b.Y - a.Y) * f, area: aLado || aEsq });
      }
    }
    return salida;
  }
  return [];
}

/** ¿El punto cae adentro del polígono? (ray casting) */
export function puntoEnPoligono(pts, X, Y) {
  let dentro = false;
  for (let i = 0, j = pts.length - 1; i < pts.length; j = i++) {
    const xi = pts[i].X, yi = pts[i].Y, xj = pts[j].X, yj = pts[j].Y;
    if ((yi > Y) !== (yj > Y) && X < ((xj - xi) * (Y - yi)) / (yj - yi) + xi) dentro = !dentro;
  }
  return dentro;
}

/**
 * Geometría completa para dibujar: piezas y varillas, cada una con el índice de
 * la shape que la generó.
 *
 * El espejo de una L/T no viaja en el `.e2k`, así que se deduce igual que en el
 * motor: la orientación correcta es la que contiene a TODAS las varillas.
 */
export function geometriaDeSeccion(shapes = [], catalogo = {}) {
  const lista = (shapes || []).filter(Boolean);
  const barras = [];
  lista.forEach((s, i) => {
    if (!ES_ARMADO(tipoDe(s))) return;
    for (const b of barrasDeShape(s, catalogo)) barras.push({ ...b, shape: i });
  });

  const parametricas = lista
    .map((s, i) => ({ s, i }))
    .filter(({ s }) => ["CONC L", "CONC T", "CONC TEE"].includes(tipoDe(s)));

  // El espejo se deduce SOLO para la pieza que no lo trae. Es por shape, no de
  // la seccion: dos L pueden tener orientaciones distintas.
  let mirror2 = false, mirror3 = false;
  // Si la shape ya trae el espejo, manda. Deducirlo en CADA redibujo hacia que
  // la L cambiara de orientacion al arrastrarla: al alejarse del armado, otra
  // orientacion pasaba a contener mas varillas y ganaba. En ETABS la forma no
  // se da vuelta nunca. Ver deducirEspejoDePlaca en el mixin.
  const dado = parametricas.length === 1
    ? campo(parametricas[0].s, "mirror2")
    : undefined;
  if (dado !== undefined) {
    mirror2 = !!campo(parametricas[0].s, "mirror2");
    mirror3 = !!campo(parametricas[0].s, "mirror3");
  } else if (parametricas.length === 1 && barras.length) {
    let mejor = -1;
    for (const m2 of [false, true]) {
      for (const m3 of [false, true]) {
        const pts = verticesDePieza(parametricas[0].s, m2, m3);
        if (pts.length < 3) continue;
        const dentro = barras.filter((b) => puntoEnPoligono(pts, b.X, b.Y)).length;
        if (dentro > mejor) { mejor = dentro; mirror2 = m2; mirror3 = m3; }
      }
    }
  }

  const piezas = [];
  lista.forEach((s, i) => {
    if (!ES_CONCRETO(tipoDe(s))) return;
    const pts = verticesDePieza(s, mirror2, mirror3);
    if (pts.length >= 3) piezas.push({ shape: i, pts });
  });

  return { piezas, barras, mirror2, mirror3 };
}
