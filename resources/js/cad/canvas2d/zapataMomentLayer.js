// resources/js/cad/canvas2d/zapataMomentLayer.js
//
// Mapa de momento 2D sobre cada zapata en el canvas2D — mismo patrón visual
// que zapataPressureLayer.js (celdas de color + leyenda), pero pintando
// `polygon.momentField` (calculado en foundation.js, ver
// computeIsolatedMomentAtPoint / lookupMomentProfile en footingMoments.js)
// en vez de la σ que trae /zapatas2 directamente del backend.
//
// LIMITACIÓN HONESTA (ver conversación): esto NO es un M11 real de
// elementos finitos — es la misma fórmula de voladizo/viga del método
// rígido (Bloque 3), evaluada en cada punto en vez de solo en el borde.
// Para aisladas da Mx/My por separado (sin el término de torsión M12 que
// solo un análisis de placa real captura); para combinadas es constante a
// lo ancho de la viga (mismo criterio 1D que ya usa el cálculo del
// momento envolvente) — se ve como franjas, no como el patrón concéntrico
// de una placa. Es una aproximación derivada de fórmulas ya validadas, no
// un cálculo nuevo inventado, pero no reemplaza un M11 de verdad.

import { matlabColorScale } from "../../matlab/color_scale.js";
import { flattenNumeric } from "../../etabs/charts/zapatas2Plot.js";
import { buildGridIndex } from "./zapataGridIndex.js";

// Mismo criterio de agrupado por color que zapataPressureLayer.js — ver
// ese archivo para el razonamiento completo (rendimiento con >20 000
// puntos por zapata).
const COLOR_BINS = 48;

// AGREGADO (ver conversación): además de Mx/My (rígido o FEM), el campo
// "isolated-fem" ahora puede traer Mxy, V13 y V23 (Bloque 3b/6b) — todos
// disponibles como opción del selector del botón "Diagrama de Resultantes
// 2D" (nombre tomado de ETABS), compartiendo una sola grilla de
// coordenadas (ver foundation.js). Usado solo para saber qué unidad
// mostrar (Tn/m cortante vs Tn·m/m momento) — ver componentUnit.
const SHEAR_COMPONENTS = new Set(["v13", "v23", "vmax"]);

// AGREGADO (ver conversación): misma nomenclatura que ETABS (M11/M22/M12)
// en vez de Mx/My/Mxy — el ingeniero compara estos valores directo contra
// las lecturas de ETABS, y ahí no existe "Mx", existe "M11". MMax/MMin/
// VMax: resultantes derivadas (Mohr para momentos, √(V13²+V23²) para
// cortante) — igual selector "Component" que ETABS, ver zapata_shell_solver.py.
const COMPONENT_LABELS = { mx: "M11", my: "M22", mxy: "M12", v13: "V13", v23: "V23", mmax: "MMax", mmin: "MMin", vmax: "VMax" };

/** Etiqueta legible de la componente elegida en el selector "Diagrama de Resultantes 2D". */
export function componentLabel(direction) {
  return COMPONENT_LABELS[direction] || direction;
}

/** Unidad de la componente — cortante es Tn/m (fuerza/longitud), momento Tn·m/m. */
export function componentUnit(direction) {
  return SHEAR_COMPONENTS.has(direction) ? "Tn/m" : "Tn·m/m";
}

/**
 * Extrae la serie de valores (momento o cortante) para una combinación (y,
 * en aisladas, una componente Mx/My/Mxy/V13/V23) de `polygon.momentField`.
 * Las combinadas no tienen componente propiamente (es 1D a lo largo de la
 * viga), así que ignoran `direction` y siempre devuelven `value`.
 *
 * AGREGADO (ver conversación): tipo "isolated-fem" (elementos finitos
 * reales, Bloque 3b/6b) — ya es la envolvente de las 11 combinaciones (un
 * solo campo, no uno por combo), así que ignora `comboIndex` a propósito.
 */
export function getMomentValuesForCombo(momentField, comboIndex, direction = "mx") {
  if (!momentField) return [];

  if (momentField.type === "isolated-fem") {
    const byComponent = {
      mx: momentField.mx, my: momentField.my, mxy: momentField.mxy,
      v13: momentField.v13, v23: momentField.v23,
      mmax: momentField.mmax, mmin: momentField.mmin, vmax: momentField.vmax,
    };
    return byComponent[direction] || [];
  }

  if (momentField.type === "combined") {
    return momentField.value?.[comboIndex] || [];
  }

  // Método rígido: solo tiene Mx/My (nunca Mxy/V13/V23) — cualquier otra
  // componente pedida simplemente no tiene datos que pintar.
  const series = direction === "my" ? momentField.my : direction === "mx" ? momentField.mx : null;
  return series?.[comboIndex] || [];
}

/**
 * Rango de color (cmin/cmax) sobre TODOS los polígonos a la vez, para que
 * un mismo color signifique el mismo momento al comparar zapatas
 * distintas — mismo criterio que computeSigmaColorRange.
 */
export function computeMomentColorRange(polygons, comboIndex, direction) {
  const allValues = (polygons || []).flatMap((polygon) =>
    getMomentValuesForCombo(polygon.momentField, comboIndex, direction)
  );

  let cmin = allValues.length ? Math.min(...allValues) : 0;
  let cmax = allValues.length ? Math.max(...allValues) : 1;

  if (cmin === cmax) {
    const pad = Math.max(Math.abs(cmin) * 1e-3, 1e-6);
    cmin -= pad;
    cmax += pad;
  }

  return { cmin, cmax };
}

/** Separación real entre puntos vecinos de la cuadrícula — idéntico a zapataPressureLayer.js. */
function estimateGridStep(values) {
  const unique = Array.from(new Set(values.map((v) => Math.round(v * 1e6) / 1e6))).sort((a, b) => a - b);
  if (unique.length < 2) return 0.1;

  let minGap = Infinity;
  for (let i = 1; i < unique.length; i++) {
    const gap = unique[i] - unique[i - 1];
    if (gap > 1e-6 && gap < minGap) minGap = gap;
  }

  return Number.isFinite(minGap) ? minGap : 0.1;
}

/**
 * Agrupa los puntos de UN polígono en `COLOR_BINS` grupos por color, según
 * su valor de momento — mismo algoritmo que buildSigmaColorBins (celdas
 * del tamaño real de la cuadrícula, un solo fill() por grupo).
 */
export function buildMomentColorBins(polygon, comboIndex, direction, cmin, cmax) {
  // AGREGADO (ver conversación): el campo "isolated-fem" trae sus PROPIAS
  // coordenadas (la malla del solver de elementos finitos, distinta a la
  // nube de puntos XX/YY que trae /zapatas2 para la presión) — no se puede
  // reusar XX/YY ahí, el tamaño y posición de los puntos no coincide.
  // Mx/My/Mxy/V13/V23 comparten UNA sola grilla (momento y cortante salen
  // del mismo solve desde la fusión — ver foundation.js/zapataShellDesign.js).
  const isFem = polygon.momentField?.type === "isolated-fem";
  const xs = isFem ? (polygon.momentField.x || []) : flattenNumeric(polygon.XX);
  const ys = isFem ? (polygon.momentField.y || []) : flattenNumeric(polygon.YY);
  const values = getMomentValuesForCombo(polygon.momentField, comboIndex, direction);
  const range = cmax - cmin || 1e-6;

  const bins = new Map();
  const validXs = [];
  const validYs = [];
  // Paralelo a validXs/validYs — para el índice de hover (no se puede usar
  // `values` directo, tiene el largo original sin filtrar).
  const validMs = [];

  for (let i = 0; i < xs.length; i++) {
    const x = xs[i];
    const y = ys[i];
    const m = values[i];
    if (!Number.isFinite(x) || !Number.isFinite(y) || !Number.isFinite(m)) continue;

    validXs.push(x);
    validYs.push(y);
    validMs.push(m);

    const t = Math.min(1, Math.max(0, (m - cmin) / range));
    const binIndex = Math.round(t * (COLOR_BINS - 1));

    if (!bins.has(binIndex)) {
      const scaleIndex = Math.round((binIndex / (COLOR_BINS - 1)) * (matlabColorScale.length - 1));
      bins.set(binIndex, { color: matlabColorScale[scaleIndex][1], points: [] });
    }

    bins.get(binIndex).points.push({ x, y });
  }

  const cellWidthMeters = estimateGridStep(validXs) * 1.01;
  const cellHeightMeters = estimateGridStep(validYs) * 1.01;

  const sortedBins = Array.from(bins.entries())
    .sort(([a], [b]) => a - b)
    .map(([, value]) => value);

  const hover = { index: buildGridIndex(validXs, validYs), xs: validXs, ys: validYs, values: validMs };

  return { bins: sortedBins, cellWidthMeters, cellHeightMeters, hover };
}

const LEGEND_WIDTH = 32;
const LEGEND_HEIGHT = 260;
const LEGEND_MARGIN = 20;

/**
 * Leyenda de color en pantalla — idéntica en estilo a drawSigmaLegend,
 * pero con la etiqueta de momento (y la dirección, para aisladas).
 */
export function drawMomentLegend(ctx, canvasWidth, canvasHeight, cmin, cmax, direction, isCombined) {
  const x = canvasWidth - LEGEND_WIDTH - LEGEND_MARGIN;
  const y = canvasHeight - LEGEND_HEIGHT - LEGEND_MARGIN - 20;

  const gradient = ctx.createLinearGradient(0, y + LEGEND_HEIGHT, 0, y);
  for (let i = 0; i <= 16; i++) {
    const stopIndex = Math.round((i / 16) * (matlabColorScale.length - 1));
    gradient.addColorStop(i / 16, matlabColorScale[stopIndex][1]);
  }

  ctx.save();

  ctx.fillStyle = gradient;
  ctx.fillRect(x, y, LEGEND_WIDTH, LEGEND_HEIGHT);
  ctx.strokeStyle = "rgba(226, 232, 240, 0.6)";
  ctx.lineWidth = 1;
  ctx.strokeRect(x, y, LEGEND_WIDTH, LEGEND_HEIGHT);

  ctx.font = "10px Arial";
  ctx.fillStyle = "#e2e8f0";
  ctx.textBaseline = "middle";
  ctx.textAlign = "right";

  const TICKS = 5;
  for (let i = 0; i <= TICKS; i++) {
    const t = i / TICKS;
    const value = cmax - t * (cmax - cmin);
    const tickY = y + t * LEGEND_HEIGHT;

    ctx.fillText(value.toFixed(2), x - 4, tickY);
    ctx.strokeStyle = "rgba(226, 232, 240, 0.6)";
    ctx.beginPath();
    ctx.moveTo(x, tickY);
    ctx.lineTo(x - 3, tickY);
    ctx.stroke();
  }

  ctx.textAlign = "center";
  const label = isCombined ? "M (Tn·m/m)" : `${componentLabel(direction)} (${componentUnit(direction)})`;
  ctx.fillText(label, x + LEGEND_WIDTH / 2, y - 12);

  ctx.restore();
}
