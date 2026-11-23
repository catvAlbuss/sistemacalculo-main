// Corte típico de cimiento corrido (1-1, 2-2, 3-3) dibujado con los datos de ESTE proyecto:
// ancho y alto del cimiento, muro que lleva encima, N.P.T., N.T.N. y materiales del despacho
// (criteriosEstructurales.js). No copia ningún corte de otro proyecto; si hay biblioteca de
// detalles del despacho, laminasPlantilla usa la pieza adaptada en su lugar.
// Unidades: metros (la lámina lo pone a 1/25, como el ingeniero).

import {L, line, pline, rect, text, hatch} from "../cad/primitives.js";
import {CRITERIOS} from "../criterios/criteriosEstructurales.js";

const f2 = (v) => v.toFixed(2);

// Cota horizontal o vertical con su texto.
function cota(a, b, valor, h, lado = 1) {
  const horizontal = Math.abs(b[1] - a[1]) < 1e-9;
  const off = 0.12 * lado;
  const p = horizontal ? [[a[0], a[1] + off], [b[0], b[1] + off]] : [[a[0] + off, a[1]], [b[0] + off, b[1]]];
  const t = horizontal ? [(a[0] + b[0]) / 2, a[1] + off + h * 0.9 * lado] : [a[0] + off + h * 0.9 * lado, (a[1] + b[1]) / 2];
  return [line(L.COTAS_E, p[0], p[1]), line(L.COTAS_E, a, p[0]), line(L.COTAS_E, b, p[1]),
    line(L.COTAS_E, [p[0][0] - 0.03, p[0][1] - 0.03], [p[0][0] + 0.03, p[0][1] + 0.03]), line(L.COTAS_E, [p[1][0] - 0.03, p[1][1] - 0.03], [p[1][0] + 0.03, p[1][1] + 0.03]),
    text(L.COTAS_E, t, valor, h, horizontal ? 0 : 90)];
}

// Nivel (triángulo y texto) a la izquierda del corte.
function nivel(x, y, etiqueta, h) {
  return [pline(L.NIVELES, [[x - 0.06, y + 0.08], [x + 0.06, y + 0.08], [x, y]], true), line(L.NIVELES, [x - 0.3, y], [x + 0.3, y]),
    text(L.NIVELES, [x - 0.32, y + 0.13], etiqueta, h, 0, "izq")];
}

export function corteCimientoCorrido({numero, ancho = CRITERIOS.cimientoCorrido.ancho, alto = CRITERIOS.cimientoCorrido.alto, espesorMuro = null, exterior = true, conPuerta = false, npt = CRITERIOS.terreno.npt}) {
  const h = 0.045;
  const e = espesorMuro > 0.05 ? Math.min(espesorMuro, ancho) : Math.min(0.15, ancho);
  const hs = CRITERIOS.cimientoCorrido.sobrecimientoAlto;
  const yFondo = -alto, ySc = 0, yTop = Math.max(npt, 0) + (conPuerta ? 0 : 0.0);
  const scTop = ySc + hs;
  const prim = [];
  // Cimiento (concreto ciclópeo) y sobrecimiento.
  prim.push(rect(L.CIMIENTO, -ancho / 2, yFondo, ancho / 2, ySc), hatch(L.ACHURADO, [[-ancho / 2, yFondo], [ancho / 2, yFondo], [ancho / 2, ySc], [-ancho / 2, ySc]], {patron: "AR-CONC", escala: 0.01}));
  prim.push(rect(L.CIMIENTO, -e / 2, ySc, e / 2, conPuerta ? Math.min(scTop, npt) : scTop));
  // Muro encima (salvo en el vano de puerta: solo el sobrecimiento hasta el piso).
  if (!conPuerta) {
    prim.push(line(L.MUROS_E, [-e / 2, scTop], [-e / 2, scTop + 0.45]), line(L.MUROS_E, [e / 2, scTop], [e / 2, scTop + 0.45]));
    prim.push(hatch(L.MUROS_E, [[-e / 2, scTop], [e / 2, scTop], [e / 2, scTop + 0.45], [-e / 2, scTop + 0.45]], {patron: "ANSI31", escala: 0.01}));
    // Corte del muro (línea quebrada arriba).
    prim.push(pline(L.MUROS_E, [[-e / 2 - 0.05, scTop + 0.45], [-0.02, scTop + 0.45], [0, scTop + 0.5], [0.02, scTop + 0.4], [e / 2 + 0.05, scTop + 0.45]]));
  }
  // Terreno natural a ambos lados y falso piso del lado interior (exterior: vereda o terreno).
  const xt = ancho / 2 + 0.35;
  prim.push(line(L.ACHURADO, [-xt, 0], [-ancho / 2, 0]), line(L.ACHURADO, [ancho / 2, 0], [xt, 0]));
  prim.push(line(L.TEXTO, [e / 2, npt], [xt, npt]), line(L.TEXTO, [e / 2, npt - 0.1], [xt, npt - 0.1]));
  // Cotas: ancho, alto del cimiento, sobrecimiento y espesor del muro.
  prim.push(...cota([-ancho / 2, yFondo], [ancho / 2, yFondo], `.${Math.round(ancho * 100)}`, h, -1));
  prim.push(...cota([ancho / 2, yFondo], [ancho / 2, ySc], f2(alto), h, 1));
  prim.push(...cota([-e / 2, ySc], [-e / 2, scTop], f2(hs), h, -1));
  if (!conPuerta) prim.push(...cota([-e / 2, scTop + 0.3], [e / 2, scTop + 0.3], `.${Math.round(e * 100)}`, h, 1));
  // Niveles.
  // N.P.T. a la derecha (lado del piso) y N.T.N./N.F.C. a la izquierda: los niveles cercanos
  // (+0.15 y ±0.00) no se pisan.
  const xn = -ancho / 2 - 0.5;
  prim.push(...nivel(xt + 0.05, npt, `N.P.T. +${f2(npt)}`, h), ...nivel(xn, 0, "N.T.N. ±0.00", h), ...nivel(xn, yFondo, `N.F.C. -${f2(alto)}`, h));
  // Leyendas de materiales, una por renglón con separación fija (sin encimarse).
  const xl = xt + 0.4;
  const leyendas = [
    !conPuerta && [scTop + 0.35, exterior ? "MURO PORTANTE / PERIMÉTRICO" : "MURO INTERIOR (TABIQUE)"],
    [npt + 0.2, "FALSO PISO e=0.10 m"],
    [ySc + 0.08, `SOBRECIMIENTO: ${CRITERIOS.concreto.sobrecimiento}`],
    [-0.15, CRITERIOS.terreno.relleno.toUpperCase().replace(/Ó/g, "O")],
    [yFondo + alto / 2 - 0.1, `CIMIENTO: ${CRITERIOS.concreto.cimientoCorrido}`],
  ].filter(Boolean);
  for (const [y, t] of leyendas) prim.push(text(L.TEXTO, [xl, y], t, h * 0.85, 0, "izq"));
  const titulo = `CORTE ${numero}-${numero}${conPuerta ? " (VANO DE PUERTA)" : exterior ? "" : " (MURO INTERIOR)"}`;
  return {titulo, primitivas: prim, marco: {x0: xn - 0.4, y0: yFondo - 0.3, x1: xl + 2.6, y1: scTop + 0.6}};
}
