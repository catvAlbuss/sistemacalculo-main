/**
 * Chequeo del espejo JS de la geometría de secciones de placa.
 *
 *   node resources/js/cad/lib/wallSectionGeometry.check.mjs
 *
 * POR QUÉ EXISTE: `wallSectionGeometry.js` duplica a propósito la geometría de
 * `python-backend/design/wall_section.py`, porque arrastrar con el mouse exige
 * redibujar sin ir al servidor. Si los dos se separan, el canvas muestra una
 * sección distinta de la que se calcula — y eso es invisible hasta que alguien
 * compara números. Estos casos son chicos y verificables a mano.
 */

import {
  barrasDeShape,
  fraccionesDeLinea,
  geometriaDeSeccion,
  verticesDePieza,
} from "./wallSectionGeometry.js";

const CAT = { "#4": 0.000129032, "#5": 0.0001999996 };
let fallos = 0;

function ok(cond, titulo, detalle = "") {
  console.log(`${cond ? "  OK  " : "  FALLA"} ${titulo}${detalle ? "  — " + detalle : ""}`);
  if (!cond) fallos++;
}
const cerca = (a, b, tol = 1e-9) => Math.abs(a - b) < tol;

// ── La regla del espaciamiento, con la tolerancia medida en ETABS ───────────
// Con sp_max 0.15: L/sp = 2.0670 sigue dando UNA varilla (ETABS tolera pasarse
// del maximo hasta ~5%) y recien con 2.1003 aparece la segunda.
ok(fraccionesDeLinea(0.300051, 0.15).length === 1, "L/sp = 2.0003 -> 1 varilla");
ok(fraccionesDeLinea(0.310051, 0.15).length === 1, "L/sp = 2.0670 -> 1 varilla (tolerancia)");
ok(fraccionesDeLinea(0.315051, 0.15).length === 2, "L/sp = 2.1003 -> 2 varillas");
ok(fraccionesDeLinea(0.30, 0.15, true).length === 3, "con extremos -> n+1 varillas");

// ── Rectangulo: 4 vertices y area conocida ─────────────────────────────────
const rect = verticesDePieza({ shapeType: "CONC RECTANGULAR", D: 1.0, B: 0.4, XC: 0, YC: 0 });
ok(rect.length === 4, "rectangulo: 4 vertices");
ok(
  cerca(Math.max(...rect.map((p) => p.X)), 0.2) && cerca(Math.max(...rect.map((p) => p.Y)), 0.5),
  "rectangulo: B sobre X y D sobre Y",
  "SD tiene X = ancho, Y = peralte",
);

// ── Varilla suelta y linea ─────────────────────────────────────────────────
const suelta = barrasDeShape({ shapeType: "REBAR", barSize: "#5", XC: 0.1, YC: -0.2 }, CAT);
ok(suelta.length === 1 && cerca(suelta[0].X, 0.1) && cerca(suelta[0].Y, -0.2), "REBAR: una varilla en su punto");

// Minuscula a proposito: el motor tolera `spacing` y `SPACING`, y el dibujo
// TIENE que tolerar lo mismo. Leer solo `SPACING` hacia desaparecer del canvas
// todas las varillas de linea.
const linea = barrasDeShape(
  { shapeType: "LINE REBAR", barSize: "#4", spacing: 0.15, endBar: "NO", X1: 0, Y1: 0, X2: 0.6, Y2: 0 },
  CAT,
);
ok(linea.length === 3, "LINE REBAR con `spacing` en minuscula", `${linea.length} varillas`);
ok(cerca(linea[0].X, 0.15) && cerca(linea[1].X, 0.30), "LINE REBAR: reparto uniforme");

// ── Jaula: 4 esquinas + los lados ──────────────────────────────────────────
const jaula = barrasDeShape(
  {
    shapeType: "RECT REBAR", D: 0.3, B: 0.2, XC: 0, YC: 0,
    edges: Array.from({ length: 4 }, () => ({ size: "#4", spacing: 0.1 })),
    corners: Array.from({ length: 4 }, () => ({ size: "#5" })),
  },
  CAT,
);
// Lados de 0.30: ceil(0.30/(0.1*1.05)) = 3 intervalos -> 2 interiores cada uno.
// Lados de 0.20: ceil(0.20/0.105) = 2 -> 1 cada uno.  Total 4 + 2 + 2 + 1 + 1 = 10
ok(jaula.length === 10, "RECT REBAR: 4 esquinas + 6 de borde", `${jaula.length}`);
ok(jaula.filter((b) => b.area === CAT["#5"]).length === 4, "RECT REBAR: las esquinas usan su propio tamano");

// ── El espejo de la L se deduce con las varillas ───────────────────────────
const geo = geometriaDeSeccion(
  [
    { shapeType: "CONC L", D: 1.5, B: 1.0, TF: 0.3, TW: 0.3, XC: 0, YC: 0 },
    { shapeType: "REBAR", barSize: "#5", XC: -0.4346, YC: -0.6846 },
    { shapeType: "REBAR", barSize: "#5", XC: -0.4346, YC: 0.6846 },
    { shapeType: "REBAR", barSize: "#5", XC: 0.4346, YC: 0.6846 },
  ],
  CAT,
);
ok(geo.piezas.length === 1 && geo.barras.length === 3, "geometria: 1 pieza y 3 varillas");
ok(geo.piezas[0].shape === 0 && geo.barras.every((b) => b.shape > 0), "cada cosa sabe de que shape salio");
const dentro = geo.barras.filter((b) => {
  const pts = geo.piezas[0].pts;
  let d = false;
  for (let i = 0, j = pts.length - 1; i < pts.length; j = i++) {
    const xi = pts[i].X, yi = pts[i].Y, xj = pts[j].X, yj = pts[j].Y;
    if ((yi > b.Y) !== (yj > b.Y) && b.X < ((xj - xi) * (b.Y - yi)) / (yj - yi) + xi) d = !d;
  }
  return d;
}).length;
ok(dentro === 3, "el espejo deducido contiene todas las varillas", `${dentro}/3`);


// ── Formas nuevas: circulo, varillas en circulo, espejo por shape, rotacion ─
const circ = verticesDePieza({ shapeType: "CONC CIRCLE", diameter: 0.6, XC: 0, YC: 0 });
const areaPol = (p) => {
  let a = 0;
  for (let i = 0, j = p.length - 1; i < p.length; j = i++) a += p[j].X * p[i].Y - p[i].X * p[j].Y;
  return Math.abs(a) / 2;
};
ok(cerca(areaPol(circ), (Math.PI * 0.36) / 4, 1e-9),
   "circulo: area exacta pese a poligonizar", circ.length + " lados");

const enCirculo = barrasDeShape(
  { shapeType: "CIRCLE REBAR", diameter: 0.5, XC: 0, YC: 0, numBars: 8, barSize: "#5" }, CAT);
ok(enCirculo.length === 8, "CIRCLE REBAR: la cantidad pedida");
ok(enCirculo.every((b) => cerca(Math.hypot(b.X, b.Y), 0.25, 1e-9)), "CIRCLE REBAR: todas al mismo radio");

// El espejo es POR SHAPE: una segunda L no puede dar vuelta la primera.
const L1 = { shapeType: "CONC L", D: 1.0, B: 0.6, TF: 0.3, TW: 0.3, XC: 0, YC: 0, mirror2: true, mirror3: true };
const barraSuelta = { shapeType: "REBAR", barSize: "#5", XC: -0.2, YC: 0.4 };
const huella = (g) => g.piezas[0].pts
  .map((p) => (p.X - g.piezas[0].pts[0].X).toFixed(4) + "," + (p.Y - g.piezas[0].pts[0].Y).toFixed(4))
  .join(" ");
const sola = geometriaDeSeccion([L1, barraSuelta], CAT);
const dos = geometriaDeSeccion(
  [L1, { shapeType: "CONC L", D: 0.8, B: 0.5, TF: 0.2, TW: 0.2, XC: 3, YC: 0, mirror2: false, mirror3: false },
   barraSuelta], CAT);
ok(huella(sola) === huella(dos), "espejo por shape: la segunda L no da vuelta la primera");

const sinGirar = verticesDePieza(L1);
const girada = verticesDePieza({ ...L1, rotation: 90 });
ok(girada.length === sinGirar.length && !cerca(girada[0].X, sinGirar[0].X, 1e-6), "rotation gira la figura");

console.log(fallos ? `\n${fallos} chequeo(s) fallaron` : "\nTodo OK");
process.exit(fallos ? 1 : 0);
