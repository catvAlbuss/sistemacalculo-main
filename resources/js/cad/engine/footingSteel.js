// resources/js/cad/engine/footingSteel.js
//
// Bloque 5 — Diseño de acero por flexión de la zapata, a partir del momento
// último Mu (Bloque 3, footingMoments.js) y de f'c/fy/espesor/recubrimiento
// de la sección de losa asignada (Bloque 4, foundation.js). Método clásico
// de diseño a rotura (E.060 / ACI 318, sección rectangular simplemente
// reforzada), diseñado por metro de ancho (b=100cm) — igual que cualquier
// losa maciza, es el mismo enfoque que footingMoments.js ya usa para Mu
// ("por metro de ancho").
//
// f'c/fy llegan del material en MPa (convención interna del motor, ver
// lib/units.js). Se convierten a kgf/cm² con el mismo factor (10.19716)
// que ya usa material-properties-modal.blade.php (fpcKgCm2), porque la
// fórmula de diseño y las tablas de acero de la práctica peruana son en
// kgf/cm². Mu llega en Tn·m/m (mismo sistema que usa todo el pipeline de
// zapatas — σ en Tn/m², ver zapatas2.m / zapataPressureLayer.js).

const MPA_TO_KGF_CM2 = 10.19716;
const PHI_FLEXION = 0.9; // factor de reducción de resistencia, flexión (E.060 9.3.2.1)
const RHO_MIN_TEMP = 0.0018; // cuantía mínima por temperatura/contracción, fy=4200 (E.060 9.7.2)

// Varillas corrugadas comunes en el mercado peruano (NTP 350.001 / ASTM
// A615), de menor a mayor — se recorren en este orden al buscar un
// espaciamiento práctico.
const REBAR_TABLE = [
  { label: `3/8"`, areaCm2: 0.71 },
  { label: `1/2"`, areaCm2: 1.29 },
  { label: `5/8"`, areaCm2: 1.99 },
  { label: `3/4"`, areaCm2: 2.84 },
  { label: `1"`, areaCm2: 5.1 },
];

const MIN_SPACING_CM = 10; // espaciamiento práctico mínimo (constructibilidad)

export function mpaToKgfCm2(mpa) {
  return (Number(mpa) || 0) * MPA_TO_KGF_CM2;
}

/**
 * As requerido por metro de ancho (cm²/m) para un momento último Mu (en
 * Tn·m por metro de ancho, SIEMPRE como magnitud positiva — el llamador
 * decide si es acero superior o inferior según el signo de Mu en
 * footingMoments.js) — fórmula cerrada de diseño a rotura, sección
 * rectangular simplemente reforzada, b=100cm, φ=0.9.
 *
 * Si el discriminante de la fórmula se vuelve negativo, el momento excede
 * lo que esa sección puede resistir con CUALQUIER cantidad de acero (b×d
 * insuficiente) — se devuelve `overReinforced:true` en vez de un As
 * inventado; la solución real es aumentar el espesor, no agregar más
 * fierro.
 */
export function computeFootingFlexuralSteel({ muTonM, fpcMPa, fyMPa, thicknessM, recubrimientoM }) {
  const b = 100; // cm, diseño por metro de ancho
  const thicknessCm = (Number(thicknessM) || 0) * 100;
  const d = Math.max(0, thicknessCm - (Number(recubrimientoM) || 0) * 100);
  const fc = mpaToKgfCm2(fpcMPa);
  const fy = mpaToKgfCm2(fyMPa);
  const muKgCm = Math.max(0, Number(muTonM) || 0) * 1e5; // Tn·m → kgf·cm (1000 kgf/Tn × 100 cm/m)

  const asMin = RHO_MIN_TEMP * b * thicknessCm; // cm²/m — sobre el espesor bruto, no sobre "d"

  if (d <= 0 || fc <= 0 || fy <= 0) {
    return { as: null, asMin, asRequired: null, d, overReinforced: false, governedBy: null };
  }

  if (muKgCm === 0) {
    return { as: asMin, asMin, asRequired: 0, d, overReinforced: false, governedBy: "min" };
  }

  const ru = muKgCm / (PHI_FLEXION * b * d * d); // kgf/cm²
  const discriminant = 1 - (2 * ru) / (0.85 * fc);

  if (discriminant < 0) {
    return { as: null, asMin, asRequired: null, d, overReinforced: true, governedBy: null };
  }

  const rho = ((0.85 * fc) / fy) * (1 - Math.sqrt(discriminant));
  const asRequired = rho * b * d;
  const as = Math.max(asRequired, asMin);

  return {
    as,
    asMin,
    asRequired,
    d,
    overReinforced: false,
    governedBy: asRequired >= asMin ? "flexion" : "min",
  };
}

/**
 * Sugiere Ø de varilla + espaciamiento para cubrir `asPerMeterCm2` (cm²/m):
 * recorre REBAR_TABLE de menor a mayor y se queda con la primera que dé un
 * espaciamiento dentro de un rango constructivo (>=10cm y <= el máximo de
 * E.060 9.7.3 para acero de temperatura: menor entre 3×espesor y 40cm).
 * Si ni la varilla más grande cumple el mínimo de 10cm, se devuelve igual
 * (con spacing < 10cm) para que la UI avise de una sección muy exigida.
 */
export function suggestRebarSpacing(asPerMeterCm2, thicknessM) {
  if (!(asPerMeterCm2 > 0)) return null;

  const thicknessCm = (Number(thicknessM) || 0) * 100;
  const maxSpacingCm = Math.min(3 * thicknessCm, 40);

  let choice = null;
  for (const bar of REBAR_TABLE) {
    const spacingCm = (bar.areaCm2 * 100) / asPerMeterCm2;
    choice = { ...bar, spacingCm };
    if (spacingCm <= maxSpacingCm && spacingCm >= MIN_SPACING_CM) break;
  }

  if (!choice) return null;

  // Redondeo hacia abajo al múltiplo de 5cm más cercano — nunca hacia
  // arriba, porque espaciar más de lo calculado deja MENOS acero del
  // requerido. BUG YA CORREGIDO: antes esto se recortaba con un piso de
  // MIN_SPACING_CM (10cm) "por constructibilidad", pero si ni la barra
  // más grande de la tabla alcanza ese mínimo (As muy alto), forzar el
  // espaciamiento a 10cm da MENOS acero del que exige el cálculo — es
  // decir, una sugerencia insegura (se detectó con As=57.95 cm²/m: Ø1"
  // a 10cm da solo 51 cm²/m, ~12% por debajo de lo requerido). Ahora, si
  // el espaciamiento seguro cae por debajo del mínimo constructivo, se
  // devuelve tal cual (sin inventar un número más cómodo) y se marca
  // `tooTight` para que la UI avise que la sección está muy exigida —
  // hay que aumentar espesor, usar 2 capas de acero, o una barra mayor.
  const flooredSpacingCm = Math.floor(choice.spacingCm / 5) * 5;
  const tooTight = flooredSpacingCm < MIN_SPACING_CM;
  const spacingCm = tooTight ? Math.floor(choice.spacingCm * 2) / 2 : flooredSpacingCm;

  return { label: choice.label, spacingCm, maxSpacingCm, tooTight };
}
