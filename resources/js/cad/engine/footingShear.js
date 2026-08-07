// resources/js/cad/engine/footingShear.js
//
// Bloque 6 — Verificación de cortante de la zapata: punzonamiento (cada
// columna, aislada o dentro de una combinada) y cortante por flexión
// ("cortante de viga", aisladas Y combinadas — ver computeOneWayShear /
// computeCombinedOneWayShear). Mismo método clásico E.060/ACI 318 que
// Bloque 5 (footingSteel.js), en kgf/cm² y cm (f'c convertido desde MPa
// con el mismo factor 10.19716 que ya usa material-properties-modal.
// blade.php y footingSteel.js).
//
// Zapatas COMBINADAS ramificadas (tipo L/T): siguen sin calcularse — no es
// un límite de cortante en particular, es el mismo `supported:false` que
// ya devuelve footingMoments.js para el momento (torsión/flexión biaxial
// en la esquina compartida, ver ese archivo).

const MPA_TO_KGF_CM2 = 10.19716;
const PHI_CORTANTE = 0.85; // factor de reducción de resistencia, cortante (E.060 9.3.2.3)
// Constante del término de exclusión lateral (E.060/ACI 318, tabla del
// perímetro crítico): 40 columna interior, 30 de borde, 20 de esquina. No
// se clasifica automáticamente la posición de la columna en el edificio
// (requeriría saber si está en el perímetro de la planta) — se asume
// interior, el caso más favorable; para columnas de borde/esquina revisar
// el resultado a mano (será más exigente que lo que muestra la app).
const ALPHA_S_INTERIOR = 40;

function mpaToKgfCm2(mpa) {
  return (Number(mpa) || 0) * MPA_TO_KGF_CM2;
}

/** Peralte efectivo en cm (mismo criterio que footingSteel.js: espesor − recubrimiento). */
function effectiveDepthCm(thicknessM, recubrimientoM) {
  return Math.max(0, (Number(thicknessM) || 0) * 100 - (Number(recubrimientoM) || 0) * 100);
}

/** φVc[kgf] = φ×0.53×√f'c×b×d — capacidad de cortante por flexión ("de viga"), común a aisladas y combinadas. */
function oneWayShearCapacityKgf(fpcMPa, bCm, dCm) {
  const fc = mpaToKgfCm2(fpcMPa);
  if (dCm <= 0 || fc <= 0 || bCm <= 0) return null;
  return PHI_CORTANTE * 0.53 * Math.sqrt(fc) * bCm * dCm;
}

/**
 * Punzonamiento de UNA columna dentro de la zapata (aislada o combinada):
 * perímetro crítico b0 a d/2 de la cara de columna, Vu = Pu − qu×Ácrit
 * (Pu = carga axial de esa columna, qu = presión neta de diseño, Ácrit =
 * área encerrada por el perímetro crítico) vs φVc del concreto (mínimo de
 * las 3 expresiones de E.060/ACI 318).
 */
export function computePunchingShear({ puTon, quTonM2, columnBcm, columnHcm, fpcMPa, thicknessM, recubrimientoM }) {
  const d = Math.max(0, (Number(thicknessM) || 0) * 100 - (Number(recubrimientoM) || 0) * 100); // cm
  const fc = mpaToKgfCm2(fpcMPa);
  const b = Number(columnBcm) || 0;
  const h = Number(columnHcm) || 0;

  if (d <= 0 || fc <= 0 || b <= 0 || h <= 0) return null;

  const b0 = 2 * (b + h + 2 * d); // cm, perímetro crítico a d/2 de la cara
  const acritM2 = ((b + d) * (h + d)) / 1e4; // cm² → m²

  const puKgf = Math.max(0, Number(puTon) || 0) * 1000;
  const quKgfM2 = Math.max(0, Number(quTonM2) || 0) * 1000;
  const vuKgf = Math.max(0, puKgf - quKgfM2 * acritM2);

  const betaC = Math.max(b, h) / Math.min(b, h);
  const vc1 = 0.53 * (1 + 2 / betaC) * Math.sqrt(fc);
  const vc2 = 0.27 * (2 + (ALPHA_S_INTERIOR * d) / b0) * Math.sqrt(fc);
  const vc3 = 1.06 * Math.sqrt(fc);
  const vcUnit = Math.min(vc1, vc2, vc3); // kgf/cm²

  const phiVcKgf = PHI_CORTANTE * vcUnit * b0 * d;

  return {
    vuTon: vuKgf / 1000,
    phiVcTon: phiVcKgf / 1000,
    ratio: phiVcKgf > 0 ? vuKgf / phiVcKgf : Infinity,
    ok: vuKgf <= phiVcKgf,
    d,
    b0,
  };
}

/**
 * Cortante por flexión ("de viga") en UNA dirección de una zapata AISLADA:
 * sección crítica a distancia d de la cara de columna, Vu = qu×(L−d) por
 * metro de ancho (si d>=L, la sección crítica cae fuera del volado — no
 * hay chequeo, Vu=0). Capacidad φVc = φ×0.53×√f'c×b×d, b=100cm (por metro
 * de ancho, mismo criterio que footingSteel.js).
 */
export function computeOneWayShear({ overhangM, quTonM2, fpcMPa, thicknessM, recubrimientoM }) {
  const b = 100; // cm, por metro de ancho
  const d = effectiveDepthCm(thicknessM, recubrimientoM);
  const phiVcKgf = oneWayShearCapacityKgf(fpcMPa, b, d);

  if (phiVcKgf === null) return null;

  const lCm = (Number(overhangM) || 0) * 100;
  const criticalLengthCm = Math.max(0, lCm - d);
  const quKgfM2 = Math.max(0, Number(quTonM2) || 0) * 1000;

  const vuKgf = quKgfM2 * (criticalLengthCm / 100) * (b / 100); // qu[kgf/m²] × Lcrit[m] × ancho[m]

  return {
    vuTon: vuKgf / 1000,
    phiVcTon: phiVcKgf / 1000,
    ratio: phiVcKgf > 0 ? vuKgf / phiVcKgf : Infinity,
    ok: vuKgf <= phiVcKgf,
    d,
  };
}

/**
 * Cortante por flexión de UNA zapata COMBINADA (viga continua/trapezoidal):
 * a diferencia de la aislada, acá Vu ya viene calculado (envolvente del
 * `cortanteMax` que footingMoments.js integra junto con el momento — ver
 * computeContinuousBeamMoment/computeTrapezoidalBeamMoment), y el ancho b
 * es el ancho REAL del brazo (no 100cm "por metro de ancho": la viga
 * combinada ya es un elemento de ancho propio, igual que su momento se
 * calculó con ese mismo ancho). Capacidad: misma fórmula φVc que la
 * aislada, φ×0.53×√f'c×b×d.
 */
export function computeCombinedOneWayShear({ vuTon, widthCm, fpcMPa, thicknessM, recubrimientoM }) {
  const d = effectiveDepthCm(thicknessM, recubrimientoM);
  const phiVcKgf = oneWayShearCapacityKgf(fpcMPa, widthCm, d);

  if (phiVcKgf === null) return null;

  const vuKgf = Math.max(0, Number(vuTon) || 0) * 1000;

  return {
    vuTon: vuKgf / 1000,
    phiVcTon: phiVcKgf / 1000,
    ratio: phiVcKgf > 0 ? vuKgf / phiVcKgf : Infinity,
    ok: vuKgf <= phiVcKgf,
    d,
  };
}
