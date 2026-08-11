// resources/js/cad/canvas2d/zapataGridIndex.js
//
// Índice espacial O(1) sobre la nube de puntos de una zapata (viene de una
// cuadrícula regular por dentro, aunque se entregue como arreglos planos
// XX/YY/ZZ) + el dibujo del tooltip flotante que muestra el valor exacto
// donde está el cursor — pedido del cliente para comparar punto a punto
// contra el "Shell Forces/Stresses" de ETABS (ver conversación).
//
// Sin este índice, buscar "el punto más cercano al cursor" recorriendo la
// nube completa (puede pasar de 20 000 puntos por zapata) en CADA
// mousemove sería lento — con el índice es una sola búsqueda en un Map.

/** Separación real entre valores vecinos de la cuadrícula — mismo criterio que ya usan zapataPressureLayer.js/zapataMomentLayer.js. */
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
 * Arma el índice {col,row} → índice del punto en xs/ys, para buscar el
 * punto más cercano a una coordenada del modelo en O(1). Se calcula UNA
 * vez por polígono/combo, junto con los bins de color (no en cada
 * mousemove).
 */
export function buildGridIndex(xs, ys) {
  if (!xs?.length) return null;

  const minX = Math.min(...xs);
  const minY = Math.min(...ys);
  const stepX = estimateGridStep(xs);
  const stepY = estimateGridStep(ys);

  const cells = new Map();
  for (let i = 0; i < xs.length; i++) {
    const col = Math.round((xs[i] - minX) / stepX);
    const row = Math.round((ys[i] - minY) / stepY);
    cells.set(`${col},${row}`, i);
  }

  return { cells, minX, minY, stepX, stepY };
}

/** Índice del punto más cercano a (worldX, worldY) — null si el cursor no está sobre ningún punto de la nube. */
export function lookupGridIndex(gridIndex, worldX, worldY) {
  if (!gridIndex) return null;

  const { cells, minX, minY, stepX, stepY } = gridIndex;
  const col = Math.round((worldX - minX) / stepX);
  const row = Math.round((worldY - minY) / stepY);
  const idx = cells.get(`${col},${row}`);

  return idx === undefined ? null : idx;
}

/**
 * Tooltip flotante en coordenadas de PANTALLA, chico, cerca del cursor
 * pero desplazado (para no taparlo). `label` va arriba del valor (ej.
 * "σ" o "My"), `unit` al lado del número.
 */
export function drawHoverTooltip(ctx, screenX, screenY, value, label, unit) {
  const text = `${label} = ${Number(value).toFixed(3)} ${unit}`;
  ctx.save();
  ctx.font = "11px Arial";
  const padding = 5;
  const textWidth = ctx.measureText(text).width;
  const boxWidth = textWidth + padding * 2;
  const boxHeight = 20;
  // Desplazado arriba-derecha del cursor, para no taparlo con el propio tooltip.
  const x = screenX + 12;
  const y = screenY - boxHeight - 8;

  ctx.fillStyle = "rgba(15, 23, 42, 0.92)";
  ctx.strokeStyle = "rgba(226, 232, 240, 0.8)";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.roundRect ? ctx.roundRect(x, y, boxWidth, boxHeight, 4) : ctx.rect(x, y, boxWidth, boxHeight);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = "#f1f5f9";
  ctx.textAlign = "left";
  ctx.textBaseline = "middle";
  ctx.fillText(text, x + padding, y + boxHeight / 2);

  // Puntito marcando exactamente el dato que se está leyendo.
  ctx.fillStyle = "#f1f5f9";
  ctx.beginPath();
  ctx.arc(screenX, screenY, 2.5, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}
