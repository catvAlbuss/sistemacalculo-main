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
 * AGREGADO (ver conversación, "rayas + hover roto en zapata trapezoidal
 * con conicidad marcada" 2026-09-05): estimateGridStep() de arriba asume
 * un paso ÚNICO y GLOBAL en todo el eje -- funciona perfecto para una
 * malla rectangular (paso constante en toda la zapata: aisladas,
 * combinada recta, L, polígono combinado -- todas usan una malla de
 * bounding box con hx/hy CONSTANTES), pero se rompe para la TRAPEZOIDAL:
 * ahí el ancho B(x) varía con x, así que el paso real en Y (B(x)/ny)
 * también varía COLUMNA A COLUMNA. Al juntar los valores de Y de TODAS
 * las columnas en una sola lista (lo que hace estimateGridStep de
 * arriba), la mayoría de los "gaps" detectados no son el paso real
 * dentro de una columna, sino el intercalado casi continuo entre los
 * valores de columnas VECINAS (cuyos rangos de Y son ligeramente
 * distintos) -- confirmado con un caso real: el mínimo salía ~20 veces
 * más chico que el paso real más angosto de la malla (0.00075 vs 0.015).
 * Con un paso así de chico, ni el índice de hover (nunca acierta el
 * punto bajo el cursor, la tolerancia de acierto se vuelve microscópica)
 * ni el tamaño de celda de pintado (deja huecos entre filas -- el patrón
 * de "rayas" horizontales que se ve en el mapa) funcionan.
 *
 * Fix: en vez de un paso global en Y, se agrupan los puntos por COLUMNA
 * real (bucket en X usando `stepX`, que sí es confiable siempre -- el
 * paso en X nunca varía con la forma, ni siquiera en la trapezoidal) y
 * se estima el paso de Y DENTRO de cada columna por separado -- la
 * mediana de esas estimaciones por columna da un valor representativo
 * del paso real, sin la contaminación del intercalado entre columnas.
 * Para una malla YA rectangular (el caso común, mismo paso en todas las
 * columnas) esto da EXACTAMENTE el mismo resultado que antes -- no
 * cambia nada ahí, solo corrige el caso trapezoidal.
 */
function estimateGridStepPerColumn(xs, ys, stepX, minX) {
  if (!(stepX > 0)) return estimateGridStep(ys);

  const buckets = new Map();
  for (let i = 0; i < xs.length; i++) {
    const col = Math.round((xs[i] - minX) / stepX);
    if (!buckets.has(col)) buckets.set(col, []);
    buckets.get(col).push(ys[i]);
  }

  const perBucketSteps = [];
  for (const bucketYs of buckets.values()) {
    if (bucketYs.length < 2) continue;
    perBucketSteps.push(estimateGridStep(bucketYs));
  }

  if (!perBucketSteps.length) return estimateGridStep(ys);

  perBucketSteps.sort((a, b) => a - b);
  const mid = Math.floor(perBucketSteps.length / 2);
  return perBucketSteps.length % 2 === 0
    ? (perBucketSteps[mid - 1] + perBucketSteps[mid]) / 2
    : perBucketSteps[mid];
}

/**
 * Arma el índice {col,row} → índice del punto en xs/ys, para buscar el
 * punto más cercano a una coordenada del modelo en O(1). Se calcula UNA
 * vez por polígono/combo, junto con los bins de color (no en cada
 * mousemove).
 *
 * AGREGADO (ver conversación, "hover roto en zapata aislada poligonal" —
 * caso real F2): todo lo de arriba asume que la nube de puntos viene de
 * una cuadrícula rectangular (hx/hy constantes) — cierto para aislada
 * rectangular, combinada recta, trapezoidal, L y polígono combinado, pero
 * FALSO para `calcular_zapata_shell_poligono_aislado` (malla en abanico,
 * triangulada desde el primer vértice: los puntos se distribuyen en cuñas
 * radiales, sin ningún paso constante en X ni en Y). Con esa malla,
 * estimateGridStep(xs) mide el gap MÍNIMO real entre valores de X —
 * casi siempre microscópico en un abanico — y el lookup por (col,row)
 * exacto nunca vuelve a coincidir con la posición real del cursor: el
 * hover queda permanentemente vacío (el mapa de colores sí se pinta bien,
 * porque ESE código solo necesita iterar los puntos, no indexarlos).
 * Con `fan:true` se arma en cambio un índice de "vecino más cercano" sin
 * ninguna suposición de grilla (ver buscarVecinoMasCercano), usando como
 * tolerancia de acierto la separación TÍPICA entre puntos (estimada por
 * densidad: sqrt(área/n° de puntos)) en vez de un paso de grilla que acá
 * no existe.
 */
export function buildGridIndex(xs, ys, { fan = false } = {}) {
  if (!xs?.length) return null;

  const minX = Math.min(...xs);
  const minY = Math.min(...ys);

  if (fan) {
    const maxX = Math.max(...xs);
    const maxY = Math.max(...ys);
    const area = Math.max((maxX - minX) * (maxY - minY), 1e-6);
    // Separación típica esperada entre puntos vecinos de la malla en
    // abanico, a partir de su densidad -- no hay hx/hy constantes que leer
    // directo, así que se estima. x1.5 de margen para no ser demasiado
    // estricto (la densidad de un abanico no es perfectamente uniforme).
    const pasoTipico = Math.sqrt(area / xs.length) * 1.5;
    return { type: "fan", xs, ys, minX, minY, stepX: pasoTipico, stepY: pasoTipico, maxDist: pasoTipico };
  }

  const stepX = estimateGridStep(xs);
  const stepY = estimateGridStepPerColumn(xs, ys, stepX, minX);

  const cells = new Map();
  for (let i = 0; i < xs.length; i++) {
    const col = Math.round((xs[i] - minX) / stepX);
    const row = Math.round((ys[i] - minY) / stepY);
    cells.set(`${col},${row}`, i);
  }

  return { type: "grid", cells, minX, minY, stepX, stepY };
}

function buscarVecinoMasCercano(index, worldX, worldY) {
  const { xs, ys, maxDist } = index;
  let mejorIdx = -1;
  let mejorD2 = Infinity;
  for (let i = 0; i < xs.length; i++) {
    const dx = xs[i] - worldX;
    const dy = ys[i] - worldY;
    const d2 = dx * dx + dy * dy;
    if (d2 < mejorD2) {
      mejorD2 = d2;
      mejorIdx = i;
    }
  }
  if (mejorIdx === -1 || Math.sqrt(mejorD2) > maxDist) return null;
  return mejorIdx;
}

/** Índice del punto más cercano a (worldX, worldY) — null si el cursor no está sobre ningún punto de la nube. */
export function lookupGridIndex(gridIndex, worldX, worldY) {
  if (!gridIndex) return null;

  if (gridIndex.type === "fan") {
    return buscarVecinoMasCercano(gridIndex, worldX, worldY);
  }

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

/**
 * AGREGADO (ver conversación, caso real F2 vs. ETABS): mismo cuadro visual
 * que drawHoverTooltip, pero con texto libre y borde ámbar -- para el caso
 * en que el punto bajo el cursor cae cerca de un borde libre (ver
 * isPointNearFreeEdge en zapataMomentLayer.js) y el valor crudo del campo
 * no es confiable ahí (ruido numérico de diferencias finitas cerca del
 * borde del dominio, el mismo fenómeno de "Región D" ya documentado). Se
 * avisa en vez de mostrar un número que parece preciso pero no lo es.
 */
export function drawHoverWarningTooltip(ctx, screenX, screenY, text) {
  ctx.save();
  ctx.font = "11px Arial";
  const padding = 5;
  const textWidth = ctx.measureText(text).width;
  const boxWidth = textWidth + padding * 2;
  const boxHeight = 20;
  const x = screenX + 12;
  const y = screenY - boxHeight - 8;

  ctx.fillStyle = "rgba(15, 23, 42, 0.92)";
  ctx.strokeStyle = "rgba(251, 191, 36, 0.9)"; // ámbar -- distingue "aviso" de un valor normal
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.roundRect ? ctx.roundRect(x, y, boxWidth, boxHeight, 4) : ctx.rect(x, y, boxWidth, boxHeight);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = "#fbbf24";
  ctx.textAlign = "left";
  ctx.textBaseline = "middle";
  ctx.fillText(text, x + padding, y + boxHeight / 2);

  ctx.fillStyle = "#fbbf24";
  ctx.beginPath();
  ctx.arc(screenX, screenY, 2.5, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}
