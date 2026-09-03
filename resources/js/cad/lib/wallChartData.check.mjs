/**
 * Chequeo de qué va en cada diagrama de interacción de placa.
 *
 *   node resources/js/cad/lib/wallChartData.check.mjs
 *
 * POR QUÉ EXISTE: confundir M2 con M3, o la curva de 0° con la de 90°, da un
 * diagrama que se ve perfectamente razonable y está mal. Estas cuatro
 * comprobaciones son las que atan el mapeo al del Excel del estudio
 * (sus fórmulas `N = K` -> Mu X = M3, y `Q = J` -> Mu Y = M2).
 */

import { EJES, datosDeDiagrama } from "./wallChartData.js";

const TONF = 9806.65;
let fallos = 0;
const ok = (cond, titulo, detalle = "") => {
  console.log(`${cond ? "  OK  " : "  FALLA"} ${titulo}${detalle ? "  — " + detalle : ""}`);
  if (!cond) fallos++;
};

// Superficie de mentira: cada curva lleva su ángulo en el momento, para poder
// reconocer de cuál salieron los datos.
const superficie = {
  curves: [0, 90, 180, 270].map((a) => ({
    angleDeg: a,
    points: [{ P: 100 * TONF, M2: a * TONF, M3: -a * TONF }],
  })),
};
const demandas = [
  { nombre: "combo A", P: 92.53, M2: -8.51, M3: 25.09, ratio: 0.151 },
  { nombre: "combo B", P: 61.25, M2: 27.33, M3: 123.27, ratio: 1.061 },
];

const xx = datosDeDiagrama(superficie, demandas, "XX");
const yy = datosDeDiagrama(superficie, demandas, "YY");

ok(xx.curvas.map((c) => c.nombre).join(",") === "0°,180°", "X-X usa las curvas de 0° y 180°");
ok(yy.curvas.map((c) => c.nombre).join(",") === "90°,270°", "Y-Y usa las curvas de 90° y 270°");

// La superficie de prueba tiene M3 = −ángulo, asi que la curva de 180° tiene
// que traer −180 en X-X. Si tomara M2 traeria +180.
ok(xx.curvas[1].M[0] === -180, "X-X dibuja M3", `M = ${xx.curvas[1].M[0]}`);
ok(yy.curvas[1].M[0] === 270, "Y-Y dibuja M2", `M = ${yy.curvas[1].M[0]}`);

ok(xx.puntos[1].M === 123.27, "los combos entran a X-X con su M3");
ok(yy.puntos[1].M === 27.33, "los combos entran a Y-Y con su M2");
ok(xx.puntos[1].P === 61.25 && yy.puntos[1].P === 61.25, "P es el mismo en los dos diagramas");

// El D/C es BIAXIAL: un solo numero por combo, igual en las dos vistas. Que un
// punto se vea comodo en las dos y este marcado fuera NO es un error.
ok(xx.puntos[1].ratio === yy.puntos[1].ratio, "el D/C es uno solo por combo, no por vista");

ok(datosDeDiagrama(null, demandas, "XX") === null, "sin superficie devuelve null");
ok(Object.keys(EJES).join(",") === "XX,YY", "solo hay dos ejes");

console.log(fallos ? `\n${fallos} chequeo(s) fallaron` : "\nTodo OK");
process.exit(fallos ? 1 : 0);
