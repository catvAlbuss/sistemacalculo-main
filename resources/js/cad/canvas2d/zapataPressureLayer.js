// resources/js/cad/canvas2d/zapataPressureLayer.js
//
// Pinta σ (presión de contacto suelo-zapata) directamente sobre el
// polígono de cada zapata en el canvas2D — pedido explícito del cliente:
// tomar las presiones que ya calcula "Calcular zapatas" y mostrarlas como
// colores en el 2D, con un estilo visual parecido al diagrama M11 de
// ETABS, pero SIN tocar el backend: reutiliza tal cual el mismo point
// cloud (XX/YY/ZZ) que ya devuelve /zapatas2 y que hoy alimenta el
// gráfico Plotly del modal de resultados (ver
// resources/js/etabs/charts/zapatas2Plot.js) — solo se pinta como puntos
// de color en el 2D en vez de (o además de) la ventana emergente.

import { matlabColorScale } from "../../matlab/color_scale.js";
import { flattenNumeric, getZValuesForCombo } from "../../etabs/charts/zapatas2Plot.js";

// Cuántos "tonos" distintos de la paleta se usan para agrupar los puntos
// (menos que los 256 de la paleta completa, pero de sobra para que el ojo
// no note el escalonado). Se usan TODOS los puntos que trae /zapatas2 (a
// veces >20 000 por polígono) sin recortarlos — en vez de un fill() de
// canvas por punto (que si sería lento a esa cantidad, 60 veces por
// segundo), se agrupan por color y se hace UN solo fill() por grupo con
// un Path2D que junta todos sus círculos — así la densidad no tiene costo
// de rendimiento.
const COLOR_BINS = 48;

/** Valor σ → color de la paleta MATLAB (mismos 256 tonos que usa el gráfico Plotly). */
export function sigmaToColor(value, cmin, cmax) {
  const range = cmax - cmin || 1e-6;
  const t = Math.min(1, Math.max(0, (Number(value) - cmin) / range));
  const index = Math.round(t * (matlabColorScale.length - 1));
  return matlabColorScale[index][1];
}

/**
 * Rango de color fijo (cmin/cmax) para la combinación activa, calculado
 * sobre TODOS los polígonos a la vez — mismo criterio "comparable entre
 * polígonos" que ya usa zapatas2Plot.js, para que un mismo color signifique
 * la misma presión en el modal y en el 2D.
 */
export function computeSigmaColorRange(polygons, comboIndex) {
  const allValues = (polygons || []).flatMap((polygon) => getZValuesForCombo(polygon.ZZ, comboIndex));

  let cmin = allValues.length ? Math.min(...allValues) : 0;
  let cmax = allValues.length ? Math.max(...allValues) : 1;

  if (cmin === cmax) {
    const pad = Math.max(Math.abs(cmin) * 1e-3, 1e-6);
    cmin -= pad;
    cmax += pad;
  }

  return { cmin, cmax };
}

/**
 * Separación real entre valores vecinos de una cuadrícula — el menor salto
 * entre valores distintos consecutivos, una vez ordenados. Sirve para
 * saber el espaciado real de la malla de puntos que devuelve /zapatas2
 * (en vez de asumirlo con un promedio de área).
 */
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
 * Agrupa TODOS los puntos σ de un polígono en `COLOR_BINS` grupos por
 * color — devuelve [{ color, points: [{x,y}, ...] }, ...], coordenadas
 * todavía en el sistema del modelo (sin proyectar a pantalla, eso lo hace
 * el renderer con projectPoint). El renderer dibuja UN Path2D + UN fill()
 * por grupo, no uno por punto — así se puede usar la densidad completa
 * del point cloud sin costo de rendimiento en el loop de 60 fps.
 *
 * En vez de círculos de un radio aproximado (que a cualquier tamaño fijo
 * dejan huecos o se superponen según el zoom, y al superponerse el color
 * dibujado último "tapa" a los demás — se ve como que el gradiente se
 * pierde), se dibujan RECTÁNGULOS del tamaño exacto de la cuadrícula real
 * (dx × dy, detectado con estimateGridStep) — encajan como mosaico, sin
 * huecos ni superposición, a cualquier zoom.
 */
export function buildSigmaColorBins(polygon, comboIndex, cmin, cmax) {
  const xs = flattenNumeric(polygon.XX);
  const ys = flattenNumeric(polygon.YY);
  const zs = getZValuesForCombo(polygon.ZZ, comboIndex);
  const range = cmax - cmin || 1e-6;

  const bins = new Map();
  const validXs = [];
  const validYs = [];

  for (let i = 0; i < xs.length; i++) {
    const x = xs[i];
    const y = ys[i];
    const z = zs[i];
    if (!Number.isFinite(x) || !Number.isFinite(y) || !Number.isFinite(z)) continue;

    validXs.push(x);
    validYs.push(y);

    const t = Math.min(1, Math.max(0, (z - cmin) / range));
    const binIndex = Math.round(t * (COLOR_BINS - 1));

    if (!bins.has(binIndex)) {
      const scaleIndex = Math.round((binIndex / (COLOR_BINS - 1)) * (matlabColorScale.length - 1));
      bins.set(binIndex, { color: matlabColorScale[scaleIndex][1], points: [] });
    }

    bins.get(binIndex).points.push({ x, y });
  }

  // +1% de margen para que las celdas se toquen (o se solapen apenas)
  // en vez de dejar una línea de 1px de hueco por redondeo.
  const cellWidthMeters = estimateGridStep(validXs) * 1.01;
  const cellHeightMeters = estimateGridStep(validYs) * 1.01;

  // Orden de dibujo determinístico (de menor a mayor presión) — con
  // celdas que ya no se superponen esto es menos crítico que con
  // círculos, pero se mantiene por prolijidad (evita que el orden de
  // llegada de los puntos del backend afecte el resultado visual).
  const sortedBins = Array.from(bins.entries())
    .sort(([a], [b]) => a - b)
    .map(([, value]) => value);

  return { bins: sortedBins, cellWidthMeters, cellHeightMeters };
}

const LEGEND_WIDTH = 32;
const LEGEND_HEIGHT = 260;
const LEGEND_MARGIN = 20;

/**
 * Leyenda de color en la esquina inferior-derecha del canvas (coordenadas
 * de PANTALLA, no de modelo — no usa projectPoint, se dibuja fija sobre
 * el viewport igual que haría ETABS). Barra vertical con degradado de la
 * misma paleta MATLAB, más los valores mínimo y máximo en Tn/m².
 */
export function drawSigmaLegend(ctx, canvasWidth, canvasHeight, cmin, cmax) {
  const x = canvasWidth - LEGEND_WIDTH - LEGEND_MARGIN;
  const y = canvasHeight - LEGEND_HEIGHT - LEGEND_MARGIN - 20;

  const gradient = ctx.createLinearGradient(0, y + LEGEND_HEIGHT, 0, y);
  // ~16 paradas alcanzan para un degradado visualmente suave sin recorrer
  // los 256 tonos completos de la paleta en cada frame.
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

  // Marcas intermedias (no solo mín/máx), estilo ETABS — 5 valores
  // repartidos parejo a lo largo de la barra.
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
  ctx.fillText("σ (Tn/m²)", x + LEGEND_WIDTH / 2, y - 12);

  ctx.restore();
}
