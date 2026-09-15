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
// sísmica (sismo) se arma como un envelope SRSS sin signo combinando los
// Response Spectrum Cases X/Y guardados por separado (seismicResultsByCase.
// SDX/SDY — ver reactionEnvelopeFromCases más abajo), consistente con cómo
// las combinaciones de /zapatas2 ya lo usan (filas separadas +0.7·PS /
// −0.7·PS). Esta es una simplificación de ingeniería razonable pero debe
// confirmarla un ingeniero estructural antes de usarse en un cálculo de
// producción.

import { Shape } from "../model/shapes.js";

// AGREGADO (ver conversación, "zapata sin columna detectada pese a estar
// ahí" -- caso real: columna de lindero con su nodo cayendo EXACTO sobre
// el borde/vértice de su propia zapata, ej. F19 de un .e2k real). El
// ray-casting de abajo es ambiguo para un punto exactamente sobre una
// arista o vértice del polígono -- puede dar "afuera" aunque el punto sea
// literalmente el vértice del polígono (confirmado con ese caso real:
// columna en (0,4), vértice exacto de una zapata (0,2)-(2,4), daba
// `false`). Se agrega un chequeo previo de "¿está sobre el borde?" (mismo
// patrón ya usado y probado en seismic/payload.js →
// `_pointInPolygonInclusive`, para el mismo tipo de problema con nodos de
// losa) -- si el punto es colineal con una arista Y cae dentro de su
// rango, se considera adentro sin pasar por el ray-casting. No es un caso
// raro: es exactamente el escenario de columna de lindero, ya frecuente
// en este proyecto (ver [[project_zapatas_client_scope]] en memoria).
export function pointInPolygon(point, polygonPoints, eps = 1e-6) {
  const x = Number(point.x);
  const y = Number(point.y);

  let inside = false;

  for (let i = 0, j = polygonPoints.length - 1; i < polygonPoints.length; j = i++) {
    const xi = Number(polygonPoints[i].x);
    const yi = Number(polygonPoints[i].y);
    const xj = Number(polygonPoints[j].x);
    const yj = Number(polygonPoints[j].y);

    // ¿(x,y) cae sobre la arista (xi,yi)-(xj,yj) (borde o vértice)?
    const cross = (xj - xi) * (y - yi) - (yj - yi) * (x - xi);
    const withinBBox =
      Math.min(xi, xj) - eps <= x && x <= Math.max(xi, xj) + eps &&
      Math.min(yi, yj) - eps <= y && y <= Math.max(yi, yj) + eps;
    if (Math.abs(cross) <= eps && withinBBox) return true;

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
 *
 * AGREGADO (ver conversación: zapata detectada como "combinada" con una
 * columna fantasma) — filtra también por altura (Z), no solo X/Y. Un .e2k
 * real puede traer un RESTRAINT de empotramiento total mal puesto en un
 * piso superior (error de modelado del cliente, ej. "Story1" en vez de
 * solo "Base") — sin este filtro, ese nodo comparte X/Y con la columna
 * real de la base y se contaba como una segunda columna dentro del mismo
 * polígono, aunque esté 3m más arriba en el aire. zapataZ=null desactiva
 * el filtro (compatibilidad con llamadas que no conocen la cota).
 */
export function findSupportNodesInPolygon(nodes, polygonPoints, zapataZ = null, zTolerance = 1.0) {
  return (nodes || []).filter((node) => {
    if (!node?.soporte || !pointInPolygon(node.position, polygonPoints)) return false;
    if (zapataZ == null) return true;
    const nodeZ = Number(node.position?.z) || 0;
    return Math.abs(nodeZ - Number(zapataZ)) <= zTolerance;
  });
}

// AGREGADO (ver conversación, "zapatas recortadas", Etapa 3): un `opening`
// (área tipo hueco/abertura que el CAD ya sabe dibujar, ver
// cad_sys.js:openingDrawingState) dibujado ENCIMA de una zapata se trata
// como un hueco de esa zapata para el cálculo (presión de contacto y, si
// la forma lo soporta, el FEM shell) -- ver docstring de
// calcularZapatas2EnPhp/calcular_zapata_shell_poligono_combinada del lado
// backend. Se considera "dentro" de la zapata si TODOS sus vértices caen
// dentro (o justo sobre el borde -- pointInPolygon ya es inclusivo) del
// polígono de la zapata; un opening que solo se solapa parcialmente (mitad
// afuera) no calza con la idea de "recorte interior" y se ignora en vez de
// adivinar qué parte de él sí cuenta.
export function findOpeningsInPolygon(openings, polygonPoints) {
  return (openings || []).filter((opening) => {
    const points = opening?.points || [];
    return points.length >= 3 && points.every((point) => pointInPolygon(point, polygonPoints));
  });
}

// AGREGADO (ver conversación, "notificar un aviso para que no deje pasar
// eso al sistema" 2026-09-14): el método de diferencia de áreas (ver
// calcularPropiedadesNetas más abajo) resta cada corte de forma
// independiente -- si dos cortes se SUPERPONEN entre sí (comparten área
// real, no solo un borde o un vértice), esa zona compartida se resta dos
// veces y el área/inercia netas salen por debajo del valor real, sin
// ningún aviso. Se detecta ANTES de calcular, para poder avisar en vez de
// dejar pasar un resultado silenciosamente incorrecto.
//
// Compartir solo un LADO o un VÉRTICE (sin superficie en común) es válido
// y NO debe marcarse -- por eso se usa "estrictamente adentro" (sin la
// tolerancia de borde de pointInPolygon) para los vértices, y se ignoran
// los cruces de segmentos que son colineales o se tocan en un extremo.
function _distanceToSegment(p, a, b) {
  const dx = b.x - a.x, dy = b.y - a.y;
  const len2 = dx * dx + dy * dy;
  if (len2 < 1e-12) return Math.hypot(p.x - a.x, p.y - a.y);
  const t = Math.max(0, Math.min(1, ((p.x - a.x) * dx + (p.y - a.y) * dy) / len2));
  return Math.hypot(p.x - (a.x + t * dx), p.y - (a.y + t * dy));
}

function _distanceToPolygonBoundary(point, polygon) {
  let min = Infinity;
  for (let i = 0; i < polygon.length; i++) {
    min = Math.min(min, _distanceToSegment(point, polygon[i], polygon[(i + 1) % polygon.length]));
  }
  return min;
}

// eps en metros: un vértice/lado EXACTAMENTE compartido entre dos cortes
// (caso válido, ver más arriba) puede llegar con un pequeño error de
// redondeo al dibujar a mano -- ray-casting puro es ambiguo justo sobre el
// borde, así que un punto a menos de 1 cm del borde del otro polígono se
// trata como "sobre el borde" (ni dentro ni fuera), no como superposición.
function _pointStrictlyInside(point, polygonPoints, eps = 0.01) {
  if (_distanceToPolygonBoundary(point, polygonPoints) < eps) return false;

  const x = Number(point.x);
  const y = Number(point.y);
  let inside = false;
  for (let i = 0, j = polygonPoints.length - 1; i < polygonPoints.length; j = i++) {
    const xi = Number(polygonPoints[i].x), yi = Number(polygonPoints[i].y);
    const xj = Number(polygonPoints[j].x), yj = Number(polygonPoints[j].y);
    const intersects = yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi;
    if (intersects) inside = !inside;
  }
  return inside;
}

function _segmentsProperlyIntersect(p1, p2, p3, p4) {
  const orient = (a, b, c) => (c.y - a.y) * (b.x - a.x) - (b.y - a.y) * (c.x - a.x);
  const d1 = orient(p3, p4, p1);
  const d2 = orient(p3, p4, p2);
  const d3 = orient(p1, p2, p3);
  const d4 = orient(p1, p2, p4);
  return ((d1 > 0 && d2 < 0) || (d1 < 0 && d2 > 0)) && ((d3 > 0 && d4 < 0) || (d3 < 0 && d4 > 0));
}

function _edgeMidpoints(polygon) {
  return polygon.map((p, i) => {
    const q = polygon[(i + 1) % polygon.length];
    return { x: (p.x + q.x) / 2, y: (p.y + q.y) / 2 };
  });
}

/** ¿Dos polígonos comparten área real (no solo un borde/vértice)? */
export function polygonsOverlap(polyA, polyB) {
  if (polyA.some((p) => _pointStrictlyInside(p, polyB))) return true;
  if (polyB.some((p) => _pointStrictlyInside(p, polyA))) return true;
  // Vértices solos no alcanzan: dos rectángulos que se solapan en un eje
  // pero comparten el rango EXACTO en el otro (mismo "alto", por ejemplo)
  // pueden tener TODOS sus vértices justo sobre el borde del otro, sin que
  // ninguno quede estrictamente adentro, aunque sí haya área compartida
  // real por el medio -- el punto medio de cada lado sí cae claramente
  // adentro en ese caso.
  if (_edgeMidpoints(polyA).some((p) => _pointStrictlyInside(p, polyB))) return true;
  if (_edgeMidpoints(polyB).some((p) => _pointStrictlyInside(p, polyA))) return true;
  for (let i = 0; i < polyA.length; i++) {
    const a1 = polyA[i], a2 = polyA[(i + 1) % polyA.length];
    for (let j = 0; j < polyB.length; j++) {
      const b1 = polyB[j], b2 = polyB[(j + 1) % polyB.length];
      if (_segmentsProperlyIntersect(a1, a2, b1, b2)) return true;
    }
  }
  return false;
}

/** Índices (0-based) de cada par de huecos que se superponen entre sí. */
export function findOverlappingHolePairs(holes) {
  const pairs = [];
  for (let i = 0; i < holes.length; i++) {
    for (let j = i + 1; j < holes.length; j++) {
      if (polygonsOverlap(holes[i], holes[j])) pairs.push([i, j]);
    }
  }
  return pairs;
}

// AGREGADO (ver conversación, "¿nuestro método Green sirve para cualquier
// figura geométrica?" 2026-09-15): el shoelace/Green de calcularPropiedadesNetas
// asume un contorno SIMPLE (sin autointersección) -- si el polígono EXTERIOR
// se cruza a sí mismo (un "lazo", típicamente un error al hacer clic mientras
// se dibuja una forma con muchos vértices), las partes que se cruzan se
// CANCELAN matemáticamente en la suma y el área/inercia salen mal sin ningún
// aviso. Ya existía la detección de superposición ENTRE cortes
// (findOverlappingHolePairs) pero nada validaba el contorno exterior mismo.
// Reusa _segmentsProperlyIntersect (mismo test de orientación CCW que ya usa
// polygonsOverlap) sobre cada par de LADOS no adyacentes del propio polígono
// -- dos lados que comparten un vértice (i y i+1) se saltan porque tocarse
// ahí es válido y esperado, no una autointersección real.
export function polygonSelfIntersects(points) {
  const n = points.length;
  if (n < 4) return false;
  for (let i = 0; i < n; i++) {
    const a1 = points[i], a2 = points[(i + 1) % n];
    for (let j = i + 1; j < n; j++) {
      const adyacentes = j === (i + 1) % n || i === (j + 1) % n;
      if (adyacentes) continue;
      const b1 = points[j], b2 = points[(j + 1) % n];
      if (_segmentsProperlyIntersect(a1, a2, b1, b2)) return true;
    }
  }
  return false;
}

// AGREGADO (misma conversación, 2026-09-15): un corte MAL ubicado -- que
// tiene parte de sus vértices dentro de la zapata y parte afuera (a caballo
// del borde) -- hoy `findOpeningsInPolygon` simplemente lo descarta (falla
// seguro: no lo resta, ver su doc), pero eso deja al ingeniero sin ningún
// aviso de que ese corte con seguridad NO se está aplicando por estar mal
// dibujado, en vez de enterarse recién al ver que la propiedad neta no
// cambió. `anyInside && anyOutside` es a propósito más laxo que
// findOpeningsInPolygon (que exige TODOS los vértices adentro): solo con que
// un punto caiga estrictamente afuera y otro adentro ya es geometría inválida
// para el método de resta -- un corte totalmente afuera (0 puntos adentro,
// pertenece a otra zapata o a ninguna) NO dispara este aviso.
export function findStraddlingHoles(openings, polygonPoints) {
  return (openings || []).filter((opening) => {
    const points = opening?.points || [];
    if (points.length < 3) return false;
    const dentro = points.map((point) => pointInPolygon(point, polygonPoints));
    return dentro.some(Boolean) && dentro.some((v) => !v);
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

// CM/CVE (estático muerta/viva) NO dependen de qué caso sísmico esté
// activo — es el mismo análisis sin importar si el usuario está viendo
// SDX o SDY. Por eso no basta con mirar solo `cadSystem.seismicResults`
// (el caso "activo" en ese instante): si el usuario cambió de caso activo
// después de correr el análisis, ese objeto puntual puede no traer
// static_dead/static_live consigo aunque YA se hayan calculado — se
// calculan una sola vez y quedan colgados de alguna entrada de
// seismicResultsByCase, no necesariamente de la que está activa ahora.
// Mismo helper que usa reactionsDisplayContract.js ("Reacciones por
// Caso"), centralizado acá para no duplicarlo.
export function findStaticField(cadSystem, field) {
  if (cadSystem?.seismicResults?.[field]?.reactions) {
    return cadSystem.seismicResults[field];
  }

  const byCase = cadSystem?.seismicResultsByCase || {};
  for (const result of Object.values(byCase)) {
    if (result?.[field]?.reactions) return result[field];
  }

  // TEMPORAL (ver conversación: el backend en este momento solo devuelve
  // "static" combinado -- muerta+viva juntas -- en vez de static_dead/
  // static_live por separado; desajuste de contrato detectado en vivo el
  // día de hoy). Sin esto, Pm quedaría en 0 siempre y ROMPERÍA por completo
  // el cálculo de zapatas (σ, Mu, Acero, Cortante). Mientras se arregla del
  // lado del backend: "static_dead" cae de vuelta al combinado completo, y
  // "static_live" se queda sin dato (no se duplica el total) -- así
  // Pm+Pv en las combinaciones de zapatas sigue sumando exactamente lo
  // mismo que el estático real, aunque la separación puntual Pm vs Pv dead
  // vs live ya no sea exacta hasta que el backend la vuelva a separar.
  if (field === "static_dead") {
    if (cadSystem?.seismicResults?.static?.reactions) return cadSystem.seismicResults.static;
    for (const result of Object.values(byCase)) {
      if (result?.static?.reactions) return result.static;
    }
  }

  return null;
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

// El "sismo" de zapatas debe ser una envolvente SRSS sin signo entre TODAS
// las direcciones sísmicas definidas (SDX + SDY), no las reacciones de un
// solo caso — `cadSystem.seismicResults.joint_reactions` es el caso que
// haya quedado "activo" en ese instante (ver findStaticField arriba: mismo
// problema de fondo que static_dead/static_live), así que usarlo tal cual
// sesga el resultado hacia la dirección que se corrió último. Se combinan
// las direcciones canónicas expuestas por "Reacciones por Caso" (SDX/SDY,
// ver reactionsDisplayContract.js) — no las variantes "_ESCALADO" u otras,
// para no duplicar la misma dirección dos veces en la suma de cuadrados.
const SEISMIC_ENVELOPE_CASE_IDS = ["SDX", "SDY"];

function reactionEnvelopeFromCases(cadSystem, nodeId) {
  const byCase = cadSystem?.seismicResultsByCase || {};
  const sumSquares = { fz: 0, mx: 0, my: 0 };
  let found = false;

  SEISMIC_ENVELOPE_CASE_IDS.forEach((caseId) => {
    const reaction = byCase?.[caseId]?.joint_reactions?.[nodeId];
    if (!Array.isArray(reaction)) return;

    found = true;
    sumSquares.fz += (Number(reaction[2]) || 0) ** 2;
    sumSquares.mx += (Number(reaction[3]) || 0) ** 2;
    sumSquares.my += (Number(reaction[4]) || 0) ** 2;
  });

  if (found) {
    return {
      f2: newtonToTonf(Math.sqrt(sumSquares.fz)),
      mx: newtonToTonf(Math.sqrt(sumSquares.mx)),
      my: newtonToTonf(Math.sqrt(sumSquares.my)),
    };
  }

  // Respaldo: si SDX/SDY todavía no se corrieron como Response Spectrum
  // Cases guardados por separado, se usa el resultado sísmico activo tal
  // cual (mejor una envolvente incompleta de una sola dirección que dejar
  // sismo1..3 en cero sin ningún aviso).
  return reactionFromJointReactions(cadSystem?.seismicResults?.joint_reactions, nodeId);
}

/**
 * Arma las filas {column, x, y, pd1..3, pl1..3, sismo1..3} que espera
 * buildZapatas2FormData (resources/js/safecito/zapatas2Core.js) a partir de
 * los nodos de apoyo encontrados. `cadSystem` es el objeto raíz del CAD
 * (necesita tanto `.seismicResults` como `.seismicResultsByCase` — ver
 * findStaticField más arriba, static_dead/static_live puede no venir
 * colgado del caso activo).
 */
export function buildZapataColumnRows(supportNodes, cadSystem) {
  return supportNodes.map((node) => {
    const nodeId = Number(node.id);

    const dead = reactionFromStaticCase(findStaticField(cadSystem, "static_dead"), nodeId);
    const live = reactionFromStaticCase(findStaticField(cadSystem, "static_live"), nodeId);
    const sismo = reactionEnvelopeFromCases(cadSystem, nodeId);

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
export function computeEdgeLengths(points) {
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
export function computeRectangularDimensions(points, edges) {
  if (points.length !== 4) return null;

  const side1 = edges[0];
  const side2 = edges[1];

  return {
    B: Math.min(side1, side2),
    L: Math.max(side1, side2),
  };
}

/**
 * Términos crudos (sin abs(), sin dividir) del shoelace de Green para UN
 * anillo, normalizados a "área con signo positiva" (equivalente a recorrer
 * el anillo en sentido antihorario) -- invertir el orden de recorrido de un
 * polígono invierte el signo de TODOS estos términos por igual (cada uno es
 * una suma de productos que se intercambian de signo si (x1,y1)/(x2,y2) se
 * intercambian), así que basta con multiplicar por -1 en vez de invertir el
 * array. Ver calcularPropiedadesNetas para el porqué de normalizar.
 */
function _terminosPoligonoNormalizados(points) {
  let A0 = 0, P0 = 0, IX0 = 0, IY0 = 0, IXY0 = 0, MX0 = 0, MY0 = 0, XC0 = 0, YC0 = 0;
  const n = points.length;
  for (let i = 0; i < n; i++) {
    const x1 = points[i].x, y1 = points[i].y;
    const x2 = points[(i + 1) % n].x, y2 = points[(i + 1) % n].y;
    const cross = x1 * y2 - x2 * y1;
    XC0 += cross * (x2 + x1);
    YC0 += cross * (y2 + y1);
    A0 += cross;
    P0 += Math.hypot(x1 - x2, y1 - y2);
    MX0 += (x1 - x2) * (y2 ** 2 + y2 * y1 + y1 ** 2);
    MY0 += (y1 - y2) * (x2 ** 2 + x2 * x1 + x1 ** 2);
    IY0 += cross * (x2 ** 2 + x2 * x1 + x1 ** 2);
    IX0 += cross * (y2 ** 2 + y2 * y1 + y1 ** 2);
    IXY0 += cross * (2 * x2 * y2 + x2 * y1 + x1 * y2 + 2 * x1 * y1);
  }
  const signo = A0 < 0 ? -1 : 1;
  // P0 (perímetro, suma de distancias) ya es siempre positivo -- no se voltea.
  return { P0, A0: A0 * signo, IX0: IX0 * signo, IY0: IY0 * signo, IXY0: IXY0 * signo, MX0: MX0 * signo, MY0: MY0 * signo, XC0: XC0 * signo, YC0: YC0 * signo };
}

/**
 * Propiedades geométricas de la sección NETA (contorno exterior menos las
 * figuras de corte/huecos) -- ver conversación, "el cliente mencionó una
 * diferencia de áreas" 2026-09-12: `Shape.calcularPropiedades()` (usado
 * antes acá, sin cambios) solo conoce `this.points` -- para un polígono con
 * `holes` (huecos/aberturas, ver findOpeningsInPolygon) daba A/IX/IY/XC/YC/
 * MX/MY/IXY del contorno EXTERIOR completo, ignorando que el material ahí
 * no existe. Fix: método de diferencia de áreas -- se suman los términos
 * (sin abs(), sin dividir) del exterior y se RESTAN los de cada hueco,
 * ambos normalizados al mismo signo de área (ver _terminosPoligonoNormalizados)
 * para que la resta sea correcta sin importar en qué sentido se dibujó cada
 * anillo -- recién al final se aplican las divisiones/abs() de las fórmulas
 * de Green. El perímetro NO se resta (dato informativo del contorno de
 * contacto exterior, no de la sección neta). Sin huecos, da EXACTAMENTE lo
 * mismo que calcularPropiedades() (huecos=[] dej a los acumuladores
 * intactos).
 */
function calcularPropiedadesNetas(pointsExterior, huecos) {
  const ext = _terminosPoligonoNormalizados(pointsExterior);
  let { A0, IX0, IY0, IXY0, MX0, MY0, XC0, YC0 } = ext;
  for (const hueco of huecos || []) {
    if (!hueco || hueco.length < 3) continue;
    const h = _terminosPoligonoNormalizados(hueco);
    A0 -= h.A0; IX0 -= h.IX0; IY0 -= h.IY0; IXY0 -= h.IXY0;
    MX0 -= h.MX0; MY0 -= h.MY0; XC0 -= h.XC0; YC0 -= h.YC0;
  }
  const signedArea = A0 / 2;
  const A = Math.abs(signedArea);
  const XC = signedArea !== 0 ? XC0 / (6 * signedArea) : 0;
  const YC = signedArea !== 0 ? YC0 / (6 * signedArea) : 0;

  // Ix/Iy/Ixy de Green (arriba) están respecto al ORIGEN (0,0) del sistema de
  // coordenadas del dibujo, no del centroide -- ver conversación, "el cliente
  // mencionó: 'En inercias no solo es resta es calcular una nueva propiedad,
  // Y con esa nueva propiedad recién le metes al programa'" 2026-09-15. El
  // panel mostraba IX/IY tal cual salen de Green (p.ej. IX=837.95 en el caso
  // de prueba de Jack) en vez de la propiedad NUEVA que pide el cliente: la
  // trasladada al centroide vía Steiner (IX=34.99 en ese mismo caso, que es
  // lo que de hecho ya usa el backend real /zapatas2, zapatas2.m, que
  // traslada el polígono a su centroide ANTES de integrar). Fórmula de Steiner
  // (eje paralelo): I_centroidal = I_origen - A*d². Se aplica DESPUÉS de abs()
  // -- IX/IY de un área real son siempre >= 0 respecto a cualquier eje, así
  // que abs() no pierde información ahí y el resultado de Steiner queda
  // correcto (validado numéricamente contra el caso de Jack: 837.95-21.92*
  // 6.05²=34.99 e igual para IY). MX/MY NO se trasladan: son el momento
  // estático respecto al origen por definición -- el estático respecto al
  // propio centroide es, por definición, cero (A*0), no tiene sentido
  // mostrarlo trasladado.
  const IXorigen = Math.abs(IX0 / 12);
  const IYorigen = Math.abs(IY0 / 12);
  const IXYorigen = Math.abs(IXY0 / 24);

  return {
    // AGREGADO (ver conversación, "los cortes por qué no muestran
    // perímetro" 2026-09-14): faltaba en el retorno -- el polígono
    // exterior no lo notaba porque `properties` (buildZapataPolygonProperties)
    // hace spread de zapata._propiedades (Shape.calcularPropiedades(), que
    // SÍ trae P) ANTES de este objeto, pero holesProperties usa esta
    // función SOLA, sin ese respaldo -- P quedaba `undefined` ahí. Es el
    // perímetro del propio anillo (exterior o del corte), ext.P0 ya viene
    // siempre positivo (suma de distancias), no necesita normalización de
    // signo como el resto de términos.
    P: ext.P0,
    A,
    IX: Math.max(0, IXorigen - A * YC * YC),
    IY: Math.max(0, IYorigen - A * XC * XC),
    XC,
    YC,
    MX: Math.abs(MX0 / 6),
    MY: Math.abs(MY0 / 6),
    IXY: IXYorigen - A * XC * YC,
  };
}

/**
 * Propiedades geométricas de un polígono de zapata (perímetro, área,
 * momentos de inercia, centroide) + sus puntos. El perímetro sigue viniendo
 * de Shape.calcularPropiedades() (contorno exterior, sin cambios); el resto
 * de propiedades (A/IX/IY/XC/YC/MX/MY/IXY) usa calcularPropiedadesNetas
 * arriba -- resta las `zapata.holes` cuando existen. Suma los lados
 * (`edges`) y, si es un rectángulo de 4 vértices, sus dimensiones B x L
 * (`dimensions`).
 */
export function buildZapataPolygonProperties(zapatas) {
  return zapatas.map((zapata, index) => {
    Shape.prototype.calcularPropiedades.call(zapata);

    const points = (zapata.points || []).map((point) => ({ x: point.x, y: point.y }));
    const edges = computeEdgeLengths(points);
    const huecos = (zapata.holes || []).map((hueco) => hueco.map((point) => ({ x: point.x, y: point.y })));
    // AGREGADO (ver conversación, "mostrar en resultados de zapatas para
    // el cliente" 2026-09-14): copia del bruto (solo contorno exterior,
    // ANTES de restar los cortes) para poder mostrar la comparación
    // "sin restar vs. con el método de diferencia de áreas" en el modal
    // -- mismo dato que ya se le mostró al cliente en la demo, ahora
    // dentro del sistema real. Solo tiene sentido cuando hay huecos (sin
    // ellos, bruto y neto son el mismo número).
    const propertiesSinRestar = huecos.length ? { ...zapata._propiedades } : null;
    // AGREGADO (ver conversación, "En inercias no solo es resta es calcular
    // una nueva propiedad" 2026-09-15): antes, SIN cortes, `properties` salía
    // directo de `zapata._propiedades` (Shape.calcularPropiedades(), IX/IY/IXY
    // respecto al ORIGEN, sin Steiner) -- calcularPropiedadesNetas ahora SÍ
    // traslada al centroide, así que llamarla siempre (huecos=[] cuando no
    // hay cortes) es necesario para que el panel muestre inercia centroidal
    // en los DOS casos, no solo cuando hay huecos -- si no, agregar/quitar un
    // corte hacía saltar IX/IY entre "origen" y "centroide" sin razón visible
    // para el usuario. calcularPropiedadesNetas(points, []) da el mismo P/A/
    // XC/YC que zapata._propiedades (mismo shoelace), solo difiere en que
    // ahora SÍ aplica Steiner a IX/IY/IXY.
    const properties = {
      ...zapata._propiedades,
      ...calcularPropiedadesNetas(points, huecos),
    };
    // AGREGADO (ver conversación, "propiedades geométricas de los cortes"
    // 2026-09-14): propiedades de CADA hueco por separado (sin restar
    // nada -- un corte no tiene sub-cortes en el caso real), para poder
    // revisarlas junto a las netas del contorno exterior. Reusa
    // calcularPropiedadesNetas con huecos=[] -- da lo mismo que tratar el
    // hueco como un polígono normal, sin duplicar la fórmula.
    const holesProperties = huecos.map((huecoPoints) => ({
      properties: calcularPropiedadesNetas(huecoPoints, []),
      points: huecoPoints,
      edges: computeEdgeLengths(huecoPoints),
    }));

    return {
      id: zapata.id,
      name: `Polígono ${index + 1}`,
      // AGREGADO (ver conversación): zapata.propiedades() falla para
      // zapatas importadas de .e2k -- son objetos planos, no instancias
      // de Shape, así que no tienen el método (aunque calcularPropiedades
      // SÍ corre bien vía .call() dos líneas arriba, porque solo usa
      // this.points). Se lee el campo directo en vez de llamar al método,
      // funciona igual para zapatas dibujadas a mano y para importadas.
      properties,
      propertiesSinRestar,
      points,
      edges,
      dimensions: computeRectangularDimensions(points, edges),
      hasHoles: huecos.length > 0,
      holesProperties,

    };
  });
}
