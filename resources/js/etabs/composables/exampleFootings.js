// Zapatas aisladas de ejemplo para el modo rápido de Safecito: una zapata
// cuadrada centrada en cada columna. El lado se limita para que dos zapatas
// vecinas nunca se traslapen y quede una franja libre entre ellas
// (cada semilado <= 40 % de la separación entre columnas).

export const EXAMPLE_FOOTING_SOURCE = "safecito-ejemplo";

export function buildExampleFootings(columns, {maxSide = 1.8, minSide = 0.6} = {}) {
  const toNumber = (value) => (value === "" || value === null || value === undefined ? NaN : Number(value));
  const points = (Array.isArray(columns) ? columns : [])
    .map((column) => ({column: column.column, x: toNumber(column.x), y: toNumber(column.y)}))
    .filter((point) => Number.isFinite(point.x) && Number.isFinite(point.y));

  return points.map((point, index) => {
    // Distancia de Chebyshev: dos cuadrados alineados a los ejes no se tocan
    // si la suma de sus semilados es menor que la mayor separación en X o Y.
    const nearest = points.reduce((best, other) => {
      if (other === point) return best;
      const gap = Math.max(Math.abs(other.x - point.x), Math.abs(other.y - point.y));
      return gap > 1e-9 ? Math.min(best, gap) : best;
    }, Infinity);
    const half = Math.max(minSide / 2, Math.min(maxSide / 2, 0.4 * nearest));
    const round = (value) => Math.round(value * 1000) / 1000;

    return {
      index: index + 1,
      closed: true,
      source: EXAMPLE_FOOTING_SOURCE,
      label: `Z-${point.column}`,
      nodes: [
        {id: 1, x: round(point.x - half), y: round(point.y - half)},
        {id: 2, x: round(point.x + half), y: round(point.y - half)},
        {id: 3, x: round(point.x + half), y: round(point.y + half)},
        {id: 4, x: round(point.x - half), y: round(point.y + half)},
      ],
    };
  });
}

export function polygonArea(nodes = []) {
  let sum = 0;
  for (let i = 0; i < nodes.length; i++) {
    const a = nodes[i];
    const b = nodes[(i + 1) % nodes.length];
    sum += Number(a.x) * Number(b.y) - Number(b.x) * Number(a.y);
  }
  return Math.abs(sum) / 2;
}

export function pointInPolygon(point, nodes = []) {
  const x = Number(point.x);
  const y = Number(point.y);
  let inside = false;
  for (let i = 0, j = nodes.length - 1; i < nodes.length; j = i++) {
    const xi = Number(nodes[i].x), yi = Number(nodes[i].y);
    const xj = Number(nodes[j].x), yj = Number(nodes[j].y);
    if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / ((yj - yi) || 1e-12) + xi) inside = !inside;
  }
  return inside;
}

// Columnas contenidas en cada zapata, para mostrar el resumen antes de calcular.
export function describeFootings(polygons, columns) {
  return (polygons || []).map((polygon, index) => {
    const inside = (columns || []).filter((column) => pointInPolygon(column, polygon.nodes));
    return {
      index: index + 1,
      name: polygon.label || `Z${index + 1}`,
      source: polygon.source,
      vertices: polygon.nodes?.length ?? 0,
      area: polygonArea(polygon.nodes),
      columns: inside.map((column) => String(column.column)),
    };
  });
}
