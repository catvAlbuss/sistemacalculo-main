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
