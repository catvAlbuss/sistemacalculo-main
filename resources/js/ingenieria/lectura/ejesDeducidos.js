// Plano de arquitectura SIN ejes rotulados (muchas casas y colegios no dibujan burbujas): los ejes
// se deducen de las columnas detectadas en las capas de estructura (diseno/estructura.js), se
// nombran como en el Perú —letras en una dirección, números en la otra— y las columnas quedan con
// su eje, su tipo (C1, PL1…) y su contorno, igual que si el arquitecto hubiera dibujado los ejes.
// El agente lo avisa: son ejes propuestos que el ingeniero confirma.

import {tiposDeColumna} from "./lectorPlano.js";

const r3 = (v) => Math.round(v * 1000) / 1000;
const letra = (i) => (i < 26 ? String.fromCharCode(65 + i) : `A${String.fromCharCode(65 + i - 26)}`);

// Posiciones de eje: coordenadas de las columnas agrupadas a ±tolerancia. A diferencia de
// deducirEjes (que pide 2 columnas por eje), una columna suelta también da su eje: si no, la
// grilla deja fuera parte del edificio y las láminas no la cubren.
function posiciones(valores, tolerancia) {
  const grupos = [];
  for (const v of [...valores].sort((a, b) => a - b)) {
    const g = grupos.at(-1);
    if (g && v - g.at(-1) <= tolerancia) g.push(v); else grupos.push([v]);
  }
  return grupos.map((g) => r3(g.reduce((a, b) => a + b, 0) / g.length));
}

// columnas: [{x, y, b, h, forma}] en metros. Devuelve {ejes, columnas, tipos, nombres} o null si
// no alcanzan para una grilla (al menos 2 ejes en cada dirección).
export function ejesDesdeColumnas(columnas = [], {tolerancia = 0.3, prolongar = 1.5} = {}) {
  if (columnas.length < 4) return null;
  const px = posiciones(columnas.map((c) => c.x), tolerancia), py = posiciones(columnas.map((c) => c.y), tolerancia);
  if (px.length < 2 || py.length < 2) return null;
  const vx = px.map((x, i) => ({nombre: letra(i), x})), vy = py.map((y, i) => ({nombre: String(i + 1), y}));
  const ys = columnas.map((c) => c.y), xs = columnas.map((c) => c.x);
  const y0 = Math.min(...ys) - prolongar, y1 = Math.max(...ys) + prolongar;
  const x0 = Math.min(...xs) - prolongar, x1 = Math.max(...xs) + prolongar;
  const ejes = [
    ...vx.map((e) => ({nombre: e.nombre, p: {x: e.x, y: y0}, q: {x: e.x, y: y1}, inclinado: false, deducido: true})),
    ...vy.map((e) => ({nombre: e.nombre, p: {x: x0, y: e.y}, q: {x: x1, y: e.y}, inclinado: false, deducido: true})),
  ];
  const cercano = (lista, v, campo) => lista.reduce((m, e) => (Math.abs(e[campo] - v) < Math.abs(m[campo] - v) ? e : m), lista[0]);
  const conEje = columnas.map((c) => {
    const ex = cercano(vx, c.x, "x"), ey = cercano(vy, c.y, "y");
    const hb = c.b / 2, hh = c.h / 2;
    return {
      ...c, area: r3(c.area ?? c.b * c.h), forma: c.forma === "irregular" ? "irregular" : "rectangular",
      eje: `${ex.nombre}/${ey.nombre}`, nodo: {x: ex.x, y: ey.y}, grillaPropuesta: true,
      contorno: c.contorno ?? [{x: c.x - hb, y: c.y - hh}, {x: c.x + hb, y: c.y - hh}, {x: c.x + hb, y: c.y + hh}, {x: c.x - hb, y: c.y + hh}],
    };
  });
  const tipos = tiposDeColumna(conEje);
  return {ejes, columnas: conEje, tipos, nombres: {x: vx.map((e) => e.nombre), y: vy.map((e) => e.nombre)}};
}
