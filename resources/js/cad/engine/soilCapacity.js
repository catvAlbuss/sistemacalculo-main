// resources/js/cad/engine/soilCapacity.js
// Cálculos de mecánica de suelos para zapatas (Categoría D, puntos 1 y 2 —
// ver conversación): coeficiente de balasto a partir de un ensayo K30 y
// capacidad portante última (Vesic/AASHTO LRFD), más el área efectiva de
// Meyerhof que ambos chequeos necesitan cuando la carga cae excéntrica.
//
// Fuente de las fórmulas: Memoria_de_Calculo_Losa_de_Fundacion_FINAL1.pdf
// (Memoria de Cálculo real del cliente, páginas 14-15) para la estructura
// general (excentricidad → área efectiva → qn AASHTO LRFD 10.6.3.1.2a-1;
// K30 → k1/k2 → corrección rectangular) — funciones puras, sin estado, para
// poder validarlas por separado antes de conectarlas a foundation.js.

const DEG2RAD = Math.PI / 180;

/**
 * Área efectiva de Meyerhof — cuando la resultante de carga cae excéntrica
 * dentro de la zapata (ex, ey ≠ 0), la parte de la zapata que de verdad
 * trabaja a compresión "pareja" es más chica que la real, centrada en el
 * punto de aplicación de la resultante: L'=L-2·|ex|, B'=B-2·|ey|. Es
 * EXACTAMENTE el método que usa el cliente en su Memoria de Cálculo
 * (página 14) para el chequeo de capacidad portante.
 *
 * OJO (ver conversación): esto es SOLO para el chequeo de que el SUELO no
 * falle por corte (comparar la presión promedio R/(L'·B') contra qu) — el
 * cliente NO lo usa para recalcular el σmax que alimenta el diseño
 * ESTRUCTURAL de la zapata (Mu/cortante), que sigue con la fórmula lineal
 * P/A±M/S de siempre. No tocar footingMoments.js con esto.
 */
export function computeEffectiveArea({ L, B, ex, ey }) {
  const Lp = Math.max(0, (Number(L) || 0) - 2 * Math.abs(Number(ex) || 0));
  const Bp = Math.max(0, (Number(B) || 0) - 2 * Math.abs(Number(ey) || 0));
  return { Lp, Bp };
}

/**
 * Coeficiente de balasto (K) a partir de un ensayo de placa K30 (placa
 * cuadrada de 30cm de lado) — fórmulas de corrección de tamaño (Terzaghi/
 * Bowles), reproducidas tal cual de la Memoria de Cálculo real del cliente
 * (página 15): K30 → k1 (suelos cohesivos) o k2 (suelos arenosos), según
 * el tamaño real de la losa/zapata (BC = lado de una zapata CUADRADA
 * equivalente en área) → corrección final por forma rectangular.
 *
 * Referencia que cita el propio documento del cliente: Braja M. Das,
 * "Principles of Foundation Engineering", 2011, Secc. 6.8.
 *
 * @param {number} k30 — módulo de balasto del ensayo de placa (kN/m³ o
 *   Tonf/m³, cualquier unidad consistente — el resultado sale en la MISMA).
 * @param {number} L — largo real de la zapata (m).
 * @param {number} B — ancho real de la zapata (m).
 * @param {'cohesivo'|'arenoso'} soilType
 * @returns {{BC:number,kCuadrado:number,kRectangular:number,soilType:string}|null}
 */
export function computeBedModulusK({ k30, L, B, soilType }) {
  const K30 = Number(k30) || 0;
  const largo = Number(L) || 0;
  const ancho = Number(B) || 0;
  if (!(K30 > 0) || !(largo > 0) || !(ancho > 0)) return null;

  const BC = Math.sqrt(largo * ancho); // lado de la zapata cuadrada equivalente en área
  const esArenoso = soilType === "arenoso";
  const kCuadrado = esArenoso ? K30 * Math.pow((BC + 0.3) / (2 * BC), 2) : K30 * (0.3 / BC);

  // La fórmula de corrección rectangular del documento asume B el lado
  // MENOR y L el lado MAYOR — se ordenan acá para no depender de cómo
  // vengan `L`/`B` del llamador.
  const bMenor = Math.min(largo, ancho);
  const lMayor = Math.max(largo, ancho);
  const kRectangular = (2 / 3) * kCuadrado * (1 + bMenor / (2 * lMayor));

  return { BC, kCuadrado, kRectangular, soilType: esArenoso ? "arenoso" : "cohesivo" };
}

/**
 * Factores de capacidad de carga de Vesic (1973/1975) — misma familia que
 * usa AASHTO LRFD 2020 Secc. 10.6.3.1.2 y Bowles "Foundation Analysis and
 * Design". Para φ'=0 usa el límite clásico Nc=5.14 (evita 0/0).
 */
export function computeVesicBearingFactors(phiPrimeDeg) {
  const phi = (Number(phiPrimeDeg) || 0) * DEG2RAD;
  if (phi <= 1e-9) return { Nq: 1, Nc: 5.14, Ngamma: 0 };

  const Nq = Math.exp(Math.PI * Math.tan(phi)) * Math.pow(Math.tan(Math.PI / 4 + phi / 2), 2);
  const Nc = (Nq - 1) / Math.tan(phi);
  const Ngamma = 2 * (Nq + 1) * Math.tan(phi); // Vesic (1973)

  return { Nq, Nc, Ngamma };
}

/** Factores de forma de Vesic — dependen de B'/L' (ancho/largo EFECTIVOS, con B'≤L'). */
export function computeVesicShapeFactors({ Nq, Nc, phiPrimeDeg, Bp, Lp }) {
  const phi = (Number(phiPrimeDeg) || 0) * DEG2RAD;
  const ratio = Lp > 0 ? Math.min(1, (Number(Bp) || 0) / Lp) : 0;

  const Sq = 1 + ratio * Math.tan(phi);
  const Sc = Nc > 0 ? 1 + (Nq / Nc) * ratio : 1;
  const Sgamma = Math.max(0.6, 1 - 0.4 * ratio);

  return { Sq, Sc, Sgamma };
}

/**
 * Factores de corrección por nivel freático (Cwq, Cwγ) — fórmula estándar
 * (Bowles): si el nivel freático está en o por encima del plano de
 * desplante (Dw≤Df), ambos factores caen a 0.5 (el suelo bajo el nivel
 * freático pierde la mitad de su peso efectivo, γ'≈γ/2); si está a más de
 * un ancho de zapata por debajo del desplante (Dw≥Df+B'), no afecta
 * (Cw=1); interpolación lineal entre esos dos casos.
 *
 * AASHTO LRFD probablemente matiza esto (factores distintos para el
 * término de sobrecarga Cwq y el de fricción Cwγ, según la posición
 * exacta) — el documento del cliente no lo desglosa (ver conversación),
 * así que esta es la versión estándar de Bowles, no una transcripción
 * verificada de AASHTO.
 */
export function computeWaterTableFactors({ Dw, Df, Bp }) {
  const dw = Number(Dw);
  const df = Number(Df) || 0;
  const bp = Number(Bp) || 0;

  if (!Number.isFinite(dw) || dw >= df + bp) return { Cwq: 1, Cwgamma: 1 };
  if (dw <= df) return { Cwq: 0.5, Cwgamma: 0.5 };

  const t = bp > 0 ? (dw - df) / bp : 1;
  const Cw = 0.5 + 0.5 * t;
  return { Cwq: Cw, Cwgamma: Cw };
}

/**
 * Capacidad portante última (Vesic) y de diseño (qu = φb·qn) — fórmula
 * marco IDÉNTICA a la que muestra la Memoria de Cálculo real del cliente
 * (página 14, ref. AASHTO LRFD 10.6.3.1.2a-1):
 *
 *   qn = c'·Nc·Sc + γs·Df·Nq·Sq·Cwq + ½·γs·B'·Nγ·Sγ·Cwγ
 *
 * IMPORTANTE (ver conversación, aprobado por Jack con esta salvedad
 * explícita): el documento del cliente NO desglosa los factores
 * Ncm/Nqm/Nγm/Cwq/Cwγ de su ejemplo (solo los inputs y el resultado
 * final), así que esta es la formulación ESTÁNDAR de Vesic (Bowles/Braja
 * Das — la misma referencia #1 que cita el propio documento), no una
 * transcripción verificada línea por línea de AASHTO LRFD 2020. Al
 * probarla contra el único ejemplo disponible (c'=0, φ'=24°, Df=4.0m,
 * Dw=0m) no reprodujo el resultado exacto del documento (qu=1.063 MPa) —
 * usar con esa salvedad hasta poder calibrarla contra un caso real
 * adicional del cliente.
 */
export function computeVesicBearingCapacity({ cPrime, phiPrimeDeg, gammaS, Df, Dw, Bp, Lp, phiResistance = 0.45 }) {
  const bp = Number(Bp) || 0;
  const lp = Number(Lp) || 0;
  if (!(bp > 0) || !(lp > 0)) return null;

  // La fórmula de Vesic asume B'≤L' (B' es siempre el lado CORTO).
  const bShort = Math.min(bp, lp);
  const lLong = Math.max(bp, lp);

  const { Nq, Nc, Ngamma } = computeVesicBearingFactors(phiPrimeDeg);
  const { Sq, Sc, Sgamma } = computeVesicShapeFactors({ Nq, Nc, phiPrimeDeg, Bp: bShort, Lp: lLong });
  const { Cwq, Cwgamma } = computeWaterTableFactors({ Dw, Df, Bp: bShort });

  const c = Number(cPrime) || 0;
  const gamma = Number(gammaS) || 0;
  const df = Number(Df) || 0;

  const qn = c * Nc * Sc + gamma * df * Nq * Sq * Cwq + 0.5 * gamma * bShort * Ngamma * Sgamma * Cwgamma;
  const qu = phiResistance * qn;

  return { qn, qu, Nq, Nc, Ngamma, Sq, Sc, Sgamma, Cwq, Cwgamma };
}
