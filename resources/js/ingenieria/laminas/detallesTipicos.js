// Detalles típicos que dependen solo de datos de ESTE proyecto (espesor de losa leído o
// decidido, recubrimientos del despacho). No copian piezas de otro proyecto. Unidades: metros.

import {L, line, rect, text, hatch, circle} from "../cad/primitives.js";
import {CRITERIOS} from "../criterios/criteriosEstructurales.js";

// Corte típico de losa aligerada en una dirección: losa de 0.05, viguetas de 0.10 a 0.40 entre
// ejes y ladrillo de techo de 0.30 con el alto que falta (h - 0.05), como E.060 y el despacho.
export function detalleTipicoAligerado(espesor = 0.2) {
  const h = 0.045, e = Number(espesor) || 0.2, losa = 0.05, bv = 0.1, paso = 0.4, n = 3;
  const largo = n * paso + bv;
  const prim = [];
  // Contorno: losa superior continua y viguetas.
  prim.push(line(L.ALIGERADO, [0, e], [largo, e]), line(L.ALIGERADO, [0, e - losa], [0, e]), line(L.ALIGERADO, [largo, e - losa], [largo, e]));
  for (let i = 0; i <= n; i++) {
    const x = i * paso;
    prim.push(rect(L.VIGUETAS, x, 0, x + bv, e - losa));
    prim.push(hatch(L.ACHURADO, [[x, 0], [x + bv, 0], [x + bv, e - losa], [x, e - losa]], {patron: "AR-CONC", escala: 0.005}));
    // Acero inferior de la vigueta (una barra) y el de temperatura en la losa.
    prim.push(circle(L.ESTRIBOS, [x + bv / 2, 0.025 + 0.006], 0.006));
    if (i < n) {
      // Ladrillo de techo (hueco) entre viguetas.
      const x0 = x + bv, x1 = x + paso;
      prim.push(rect(L.MUROS_E, x0, 0, x1, e - losa));
      for (let k = 1; k <= 2; k++) prim.push(rect(L.MUROS_E, x0 + 0.02 + (k - 1) * ((x1 - x0) / 2), 0.03, x0 + k * ((x1 - x0) / 2) - 0.02, e - losa - 0.03));
    }
  }
  prim.push(hatch(L.ACHURADO, [[0, e - losa], [largo, e - losa], [largo, e], [0, e]], {patron: "AR-CONC", escala: 0.005}));
  prim.push(line(L.ESTRIBOS, [0.02, e - 0.025], [largo - 0.02, e - 0.025]));
  // Cotas y leyendas.
  const cot = (a, b, t, rot = 0, d = [0, -0.08]) => [line(L.COTAS_E, [a[0] + d[0], a[1] + d[1]], [b[0] + d[0], b[1] + d[1]]),
    text(L.COTAS_E, [(a[0] + b[0]) / 2 + d[0] * 1.9, (a[1] + b[1]) / 2 + d[1] * 1.9], t, h, rot)];
  prim.push(...cot([0, 0], [bv, 0], ".10"), ...cot([bv, 0], [paso, 0], ".30"), ...cot([0, -0.14], [paso, -0.14], ".40"));
  prim.push(...cot([largo, 0], [largo, e - losa], (e - losa).toFixed(2).replace(/^0/, ""), 90, [0.08, 0]), ...cot([largo, e - losa], [largo, e], ".05", 90, [0.08, 0]));
  prim.push(...cot([largo + 0.2, 0], [largo + 0.2, e], e.toFixed(2).replace(/^0/, ""), 90, [0.08, 0]));
  const xl = largo + 0.45;
  prim.push(text(L.TEXTO, [xl, e - 0.01], `LOSA e=0.05 m, f'c=${CRITERIOS.concreto.vigas} kg/cm²`, h * 0.9, 0, "izq"));
  prim.push(text(L.TEXTO, [xl, e - 0.07], "ACERO DE TEMPERATURA Ø1/4\" @0.25", h * 0.9, 0, "izq"));
  prim.push(text(L.TEXTO, [xl, e / 2 - 0.04], `LADRILLO DE TECHO 0.30x0.30x${(e - losa).toFixed(2)}`, h * 0.9, 0, "izq"));
  prim.push(text(L.TEXTO, [xl, 0.03], `VIGUETA 0.10 m @0.40 · recubrimiento ${Math.round((CRITERIOS.aligerado?.recubrimiento ?? 0.02) * 100) || 2} cm`, h * 0.9, 0, "izq"));
  return {titulo: `DETALLE TÍPICO DE ALIGERADO h=${e.toFixed(2)} m`, primitivas: prim, marco: {x0: -0.1, y0: -0.4, x1: xl + 1.9, y1: e + 0.1}};
}

// Empalmes traslapados y ganchos estándar (E.060 7.1, 7.2 y 12.15) con los valores del despacho
// (los mismos en sus dos proyectos estudiados: no dependen del proyecto, solo de la barra).
// db: diámetro nominal (m); traslape inferior y superior (m); longitud del gancho (cm).
export const EMPALMES_DESPACHO = [
  {barra: '3/8"', db: 0.00952, inf: 0.30, sup: 0.40, gancho: 20, anclaje: 0.20},
  {barra: '1/2"', db: 0.0127, inf: 0.40, sup: 0.60, gancho: 25, anclaje: 0.25},
  {barra: '5/8"', db: 0.01588, inf: 0.50, sup: 0.75, gancho: 30, anclaje: null},
  {barra: '3/4"', db: 0.01905, inf: 0.65, sup: 0.90, gancho: 35, anclaje: null},
  {barra: '1"', db: 0.0254, inf: 0.85, sup: 1.15, gancho: 45, anclaje: 0.55},
];

// Cuadro de empalmes y ganchos con los ganchos dibujados (90°, 135° de estribo y 180°).
// Unidades de lámina (1 = 1 m a 1/50), como las especificaciones técnicas.
export function detalleEmpalmesGanchos() {
  const h = 0.1, fila = 0.26, prim = [];
  const cols = [["Ø", 0.55], ["D = 6db (cm)", 1.0], ["GANCHO (cm)", 1.0], ["TRASLAPE INF. (m)", 1.35], ["TRASLAPE SUP. (m)", 1.35], ["ANCLAJE CON GANCHO (m)", 1.6]];
  const W = cols.reduce((s, [, w]) => s + w, 0), filas = EMPALMES_DESPACHO.length + 1, H = filas * fila;
  prim.push(line(L.LAMINA, [0, 0], [W, 0]), line(L.LAMINA, [W, 0], [W, H]), line(L.LAMINA, [W, H], [0, H]), line(L.LAMINA, [0, H], [0, 0]));
  for (let i = 1; i < filas; i++) prim.push(line(L.LAMINA, [0, H - i * fila], [W, H - i * fila]));
  let x = 0;
  const xs = cols.map(([t, w]) => { const c = x + w / 2; x += w; return c; });
  x = 0;
  for (const [, w] of cols.slice(0, -1)) { x += w; prim.push(line(L.LAMINA, [x, 0], [x, H])); }
  cols.forEach(([t, w], j) => prim.push(text(L.TEXTO, [xs[j], H - fila / 2], t, Math.min(h * 0.8, (w * 0.9) / (t.length * 0.62)))));
  EMPALMES_DESPACHO.forEach((e, i) => {
    const y = H - (i + 1.5) * fila;
    const vals = [e.barra, (6 * e.db * 100).toFixed(2), String(e.gancho), e.inf.toFixed(2), e.sup.toFixed(2), e.anclaje ? e.anclaje.toFixed(2) : "—"];
    vals.forEach((v, j) => prim.push(text(L.TEXTO, [xs[j], y], v, h * 0.9)));
  });
  // Notas de la norma bajo el cuadro.
  const notas = [
    "Empalmes en tracción tipo B (E.060 12.15), nunca menos de 30 cm; fuera de los nudos",
    "y de las zonas de confinamiento; no más del 50 % de las barras en una misma sección.",
    "Diámetro mínimo de doblado de barras y estribos: 6db (E.060 7.2 pide 4db en estribos).",
  ];
  notas.forEach((t, i) => prim.push(text(L.TEXTO, [0, -0.22 - i * 0.17], t, h * 0.85, 0, "izq")));
  // Ganchos estándar, esquemáticos (E.060 7.1): 90° con 12db, 135° de estribo con 6db ≥ 7.5 cm y
  // 180° con 4db ≥ 6.5 cm.
  const yG = -0.22 - notas.length * 0.17 - 0.55, s = 0.5, r = 0.08;
  const arco = (cx, cy, a0, a1, n = 8) => Array.from({length: n + 1}, (_, k) => { const a = a0 + ((a1 - a0) * k) / n; return [cx + r * Math.cos(a), cy + r * Math.sin(a)]; });
  const poli = (pts) => ({type: "pline", layer: L.ESTRIBOS, points: pts.map(([px, py]) => [Math.round(px * 1e4) / 1e4, Math.round(py * 1e4) / 1e4]), closed: false});
  // 90°
  prim.push(poli([[0.1, yG], [0.1 + s, yG], ...arco(0.1 + s, yG - r, Math.PI / 2, 0), [0.1 + s + r, yG - r - 0.35]]));
  prim.push(text(L.TEXTO, [0.1 + s + r + 0.32, yG - r - 0.2], "12db", h * 0.85), text(L.TEXTO, [0.45, yG - 0.62], "GANCHO 90°", h * 0.9));
  // 135° (estribo)
  const x1 = 1.9;
  prim.push(poli([[x1, yG], [x1 + s, yG], ...arco(x1 + s, yG - r, Math.PI / 2, -Math.PI / 4), [x1 + s + r * Math.cos(-Math.PI / 4) - 0.25, yG - r + r * Math.sin(-Math.PI / 4) - 0.25]]));
  prim.push(text(L.TEXTO, [x1 + s + 0.15, yG - 0.42], "6db ≥ 7.5 cm", h * 0.85), text(L.TEXTO, [x1 + 0.35, yG - 0.62], "GANCHO 135° (ESTRIBO)", h * 0.9));
  // 180°
  const x2 = 4.1;
  prim.push(poli([[x2, yG], [x2 + s, yG], ...arco(x2 + s, yG - r, Math.PI / 2, -Math.PI / 2), [x2 + s - 0.2, yG - 2 * r]]));
  prim.push(text(L.TEXTO, [x2 + s + 0.45, yG - r], "4db ≥ 6.5 cm", h * 0.85), text(L.TEXTO, [x2 + 0.35, yG - 0.62], "GANCHO 180°", h * 0.9));
  return {titulo: "EMPALMES Y GANCHOS ESTÁNDAR (E.060)", sinEscala: true, primitivas: prim, marco: {x0: 0, y0: yG - 0.75, x1: W, y1: H}};
}
