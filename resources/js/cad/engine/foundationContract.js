// resources/js/cad/engine/foundationContract.js
//
// Lógica pura (sin `this`) para "Calcular zapatas": encuentra qué nodos de
// apoyo caen dentro de un polígono de zapata dibujado en el CAD, y arma las
// filas de carga por columna que espera el backend /zapatas2 (ver
// resources/js/safecito/zapatas2Core.js → validateZapatas2Columns).
//
// IMPORTANTE (ver resources/js/cad/ARCHITECTURE.md y el PR que introduce este
// archivo): las cargas muerta/viva (pd/pl) salen de dos análisis estáticos
// separados por tipo de patrón (results.static_dead / results.static_live,
// python-backend/seismic/solver.py::run_static_analysis_by_type). La carga
// sísmica (sismo) reusa results.joint_reactions tal cual: es un envelope
// SRSS sin signo entre modos y direcciones X/Y, consistente con cómo las
// combinaciones de /zapatas2 ya lo usan (filas separadas +0.7·PS / −0.7·PS).
// Esta es una simplificación de ingeniería razonable pero debe confirmarla
// un ingeniero estructural antes de usarse en un cálculo de producción.

import { Shape } from "../model/shapes.js";

export function pointInPolygon(point, polygonPoints) {
  const x = Number(point.x);
  const y = Number(point.y);

  let inside = false;

  for (let i = 0, j = polygonPoints.length - 1; i < polygonPoints.length; j = i++) {
    const xi = Number(polygonPoints[i].x);
    const yi = Number(polygonPoints[i].y);
    const xj = Number(polygonPoints[j].x);
    const yj = Number(polygonPoints[j].y);

    const intersects =
      yi > y !== yj > y &&
      x < ((xj - xi) * (y - yi)) / ((yj - yi) || 1e-12) + xi;

    if (intersects) inside = !inside;
  }

  return inside;
}

/**
 * Nodos de apoyo (con `.soporte` asignado) cuya posición en planta cae
 * dentro del polígono de la zapata.
 */
export function findSupportNodesInPolygon(nodes, polygonPoints) {
  return (nodes || []).filter((node) => {
    return node?.soporte && pointInPolygon(node.position, polygonPoints);
  });
}

// El motor Python (python-backend/seismic/solver.py) devuelve reacciones en
// N y N·m (SI). Pero /zapatas2 (Safecito, predim2 — ver DatosGeneralesPanel.vue
// df/gammaE=1.8, y que las cargas ahí vienen de exports de ETABS en Tonf)
// asume implícitamente toneladas-fuerza y metros en todo el pipeline. Sin
// esta conversión, las presiones resultantes quedan mal por un factor de
// ~9807x (1 Tonf = 1000 kgf = 9806.65 N).
export const N_PER_TONF = 9806.65;

export function newtonToTonf(value) {
  return (Number(value) || 0) / N_PER_TONF;
}

function reactionFromStaticCase(staticCase, nodeId) {
  const reaction = staticCase?.reactions?.[nodeId];
  if (!reaction) return { f2: 0, mx: 0, my: 0 };

  return {
    f2: newtonToTonf(reaction.fz),
    mx: newtonToTonf(reaction.mx),
    my: newtonToTonf(reaction.my),
  };
}

function reactionFromJointReactions(jointReactions, nodeId) {
  const reaction = jointReactions?.[nodeId];
  if (!Array.isArray(reaction)) return { f2: 0, mx: 0, my: 0 };

  // [FX, FY, FZ, MX, MY, MZ]
  return {
    f2: newtonToTonf(reaction[2]),
    mx: newtonToTonf(reaction[3]),
    my: newtonToTonf(reaction[4]),
  };
}

/**
 * Arma las filas {column, x, y, pd1..3, pl1..3, sismo1..3} que espera
 * buildZapatas2FormData (resources/js/safecito/zapatas2Core.js) a partir de
 * los nodos de apoyo encontrados y el resultado crudo del análisis
 * (this.seismicResults en cad_sys.js).
 */
export function buildZapataColumnRows(supportNodes, seismicResults) {
  return supportNodes.map((node) => {
    const nodeId = Number(node.id);

    const dead = reactionFromStaticCase(seismicResults?.static_dead, nodeId);
    const live = reactionFromStaticCase(seismicResults?.static_live, nodeId);
    const sismo = reactionFromJointReactions(seismicResults?.joint_reactions, nodeId);

    return {
      column: nodeId,
      x: node.position.x,
      y: node.position.y,

      pd1: dead.f2,
      pd2: dead.mx,
      pd3: dead.my,

      pl1: live.f2,
      pl2: live.mx,
      pl3: live.my,

      sismo1: sismo.f2,
      sismo2: sismo.mx,
      sismo3: sismo.my,
    };
  });
}

function flattenNumeric(value) {
  if (value === null || value === undefined) return [];

  const flat = Array.isArray(value?.[0]) ? value.flat(Infinity) : Array.isArray(value) ? value.flat(Infinity) : [value];

  return flat.map(Number).filter((number) => Number.isFinite(number));
}

function normalizeCenter(value) {
  const numbers = flattenNumeric(value);
  return numbers.length ? numbers[0] : null;
}

/**
 * Normaliza la respuesta cruda de /zapatas2 (dict {poligono1: {...}, ...})
 * a la forma que espera resources/js/etabs/charts/zapatas2Plot.js
 * (buildZapatas2PlotData): un arreglo con `name` + XX/YY/ZZ/min/max/XC/YC.
 * Mismo criterio que useZapatas2.js (resources/js/etabs/composables), para
 * no duplicar el contrato del gráfico en dos formas distintas.
 */
export function normalizeZapatas2Resultados(resultados) {
  if (!resultados || typeof resultados !== "object") return [];

  return Object.entries(resultados).map(([key, value], index) => {
    const match = String(key).match(/\d+/);
    const number = match ? Number(match[0]) : index + 1;

    return {
      key,
      index: index + 1,
      name: `Polígono ${number}`,

      XX: value.XX,
      YY: value.YY,
      ZZ: value.ZZ,

      min: flattenNumeric(value.min),
      max: flattenNumeric(value.max),

      XC: normalizeCenter(value.XC),
      YC: normalizeCenter(value.YC),
    };
  });
}

/** Longitud de cada lado del polígono (points[i] → points[i+1], cerrando al final). */
function computeEdgeLengths(points) {
  const n = points.length;
  const edges = [];

  for (let i = 0; i < n; i++) {
    const a = points[i];
    const b = points[(i + 1) % n];
    edges.push(Math.hypot(Number(b.x) - Number(a.x), Number(b.y) - Number(a.y)));
  }

  return edges;
}

/**
 * Si el polígono tiene 4 vértices, lo trata como un rectángulo (posiblemente
 * rotado) y devuelve sus dos dimensiones B (menor) / L (mayor) a partir de
 * dos lados consecutivos — válido aunque el rectángulo no esté alineado a
 * los ejes X/Y (a diferencia de usar el bounding box). Para cualquier otro
 * número de vértices no hay una "B x L" única, así que se deja `null` y el
 * llamador debe mostrar los lados individuales (`edges`).
 */
function computeRectangularDimensions(points, edges) {
  if (points.length !== 4) return null;

  const side1 = edges[0];
  const side2 = edges[1];

  return {
    B: Math.min(side1, side2),
    L: Math.max(side1, side2),
  };
}

/**
 * Propiedades geométricas de un polígono de zapata (perímetro, área,
 * momentos de inercia, centroide) + sus puntos. Reusa Shape.calcularPropiedades()
 * / .propiedades() ya definido en resources/js/cad/model/shapes.js — no
 * duplica la matemática. Suma los lados (`edges`) y, si es un rectángulo de
 * 4 vértices, sus dimensiones B x L (`dimensions`).

 */
export function buildZapataPolygonProperties(zapatas) {
  return zapatas.map((zapata, index) => {
    Shape.prototype.calcularPropiedades.call(zapata);

    const points = (zapata.points || []).map((point) => ({ x: point.x, y: point.y }));
    const edges = computeEdgeLengths(points);

    return {
      name: `Polígono ${index + 1}`,
      properties: zapata.propiedades(),
      points,
      edges,
      dimensions: computeRectangularDimensions(points, edges),

    };
  });
}
