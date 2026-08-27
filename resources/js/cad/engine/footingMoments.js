// resources/js/cad/engine/footingMoments.js
//
// "Diseño de zapata" (momento de diseño Mu, ver conversación sobre M11/σ
// con el cliente): clasifica cada zapata como AISLADA o COMBINADA según
// cuántas columnas caen dentro del polígono, y calcula su momento de
// diseño según la geometría:
//
// - AISLADA (1 columna): método clásico de voladizo (E.060): Mu = σu×L²/2,
//   donde L es la distancia desde la cara de la columna hasta el borde de
//   la zapata (computeIsolatedFootingMoment).
// - COMBINADA rectangular o en línea recta (2+ columnas, un solo brazo):
//   viga libre-libre autoequilibrada — carga uniforme hacia arriba (σu ×
//   ancho) menos las cargas puntuales reales de cada columna hacia abajo
//   (computeContinuousBeamMoment).
// - COMBINADA trapezoidal (4 vértices, ancho variable de un extremo al
//   otro): mismo principio, pero integrado numéricamente porque la carga
//   por metro lineal ya no es constante (computeTrapezoidalBeamMoment).
// - COMBINADA ramificada (tipo L o T, con vértice reflejo): NO se calcula
//   — se comprobó con datos reales que separar en brazos independientes
//   no equilibra bien la carga (la esquina compartida sufre flexión
//   biaxial y torsión que ni el propio ETABS/SAFE resuelve sin malla de
//   elementos finitos refinada). Se devuelve `{supported:false}` para que
//   la UI avise en vez de mostrar un número incorrecto.
//
// No depende de OpenSeesPy/backend: usa σ ya calculado por /zapatas2 (los
// mismos min/max por combinación que ya arma normalizeZapatas2Resultados en
// foundationContract.js), las cargas por columna que ya arma
// buildZapataColumnRows, y la geometría que el CAD ya tiene guardada.

import { pointInPolygon } from "./foundationContract.js";

export function classifyFooting(supportNodesInPolygon) {
  const count = (supportNodesInPolygon || []).length;
  if (count === 0) return null;
  return count === 1 ? "isolated" : "combined";
}

/** Frame tipo columna (this.shapes) que llega a un nudo dado. */
export function findColumnShapeAtNode(shapes, nodeId) {
  return (
    (shapes || []).find((shape) => {
      const isColumn = shape?.elementType === "column" || shape?.type === "column";
      if (!isColumn) return false;
      return String(shape?.node1?.id) === String(nodeId) || String(shape?.node2?.id) === String(nodeId);
    }) || null
  );
}

// `section.b`/`section.h` NO tienen una unidad consistente en todo el
// proyecto: las secciones importadas por E2K los guardan en CENTÍMETROS
// a propósito, solo para mostrar "45x45" en pantalla (ver e2k-import.js:
// "b: B * 100", donde B llega en metros del archivo — la sección real para
// el motor de análisis usa `section.A`/`Iz`/`Iy`, ya en metros, calculados
// ANTES de esa conversión), mientras que las secciones de ejemplo
// hardcodeadas en assign-dialogs.js están directamente en metros (ej.
// "COLUMNA 30x30" → b:0.3). Ninguna columna real mide >3 m ni <3 cm, así
// que un valor >3 solo puede ser centímetros — se normaliza con eso.
function toMeters(value) {
  const number = Number(value) || 0;
  return number > 3 ? number / 100 : number;
}

/**
 * Dimensiones b×h de la columna en un nudo, normalizadas a metros. Si no
 * tiene sección asignada devuelve {b:0, h:0} — el voladizo se mide
 * entonces desde el centro de la columna en vez de su cara (conservador:
 * sobreestima L).
 */
export function getColumnSectionSize(shapes, nodeId) {
  const shape = findColumnShapeAtNode(shapes, nodeId);
  const section = shape?.frameSection || shape?.section || null;

  return {
    b: toMeters(section?.b),
    h: toMeters(section?.h),
  };
}

/**
 * AGREGADO (ver conversación: investigación sobre zapatas triangulares/
 * trapezoidales) — "ray casting": busca dónde el borde REAL del polígono
 * cruza una línea horizontal (axis="x", para medir en X) o vertical
 * (axis="y", para medir en Y) a la altura/columna `fixedCoord`, empezando
 * en `rayOrigin` y viajando hacia `direction` (+1/-1) — el mismo principio
 * que una linterna: la luz viaja en línea recta hasta chocar con la
 * primera pared (el cruce MÁS CERCANO al origen), no una pared más lejana
 * detrás de otra. Devuelve la coordenada del cruce, o `null` si el rayo no
 * choca con ningún lado (no debería pasar con un polígono cerrado que
 * contiene el origen, pero se cubre por seguridad).
 *
 * Mismo patrón que ya usa widthAtCut() más abajo (zapatas trapezoidales
 * combinadas) — no es una técnica nueva en este archivo, solo aplicada acá
 * para una sola dirección en vez del ancho completo de un corte.
 */
function rayCrossing(points, axis, fixedCoord, rayOrigin, direction) {
  const n = points.length;
  let nearest = null;

  for (let i = 0; i < n; i++) {
    const a = { x: Number(points[i]?.x) || 0, y: Number(points[i]?.y) || 0 };
    const b = { x: Number(points[(i + 1) % n]?.x) || 0, y: Number(points[(i + 1) % n]?.y) || 0 };
    const aFixed = axis === "x" ? a.y : a.x;
    const bFixed = axis === "x" ? b.y : b.x;
    if (aFixed === bFixed) continue; // lado paralelo al rayo, no lo cruza en un punto

    const within = (aFixed <= fixedCoord && fixedCoord <= bFixed) || (bFixed <= fixedCoord && fixedCoord <= aFixed);
    if (!within) continue;

    const t = (fixedCoord - aFixed) / (bFixed - aFixed);
    const crossCoord = axis === "x" ? a.x + t * (b.x - a.x) : a.y + t * (b.y - a.y);

    const isForward = direction > 0 ? crossCoord > rayOrigin : crossCoord < rayOrigin;
    if (!isForward) continue;

    if (nearest === null || Math.abs(crossCoord - rayOrigin) < Math.abs(nearest - rayOrigin)) {
      nearest = crossCoord;
    }
  }

  return nearest;
}

/**
 * Voladizo (L) desde la cara de la columna hasta el borde de la zapata, en
 * cada dirección — mide contra el borde REAL del polígono (ray casting,
 * ver rayCrossing arriba), no contra su bounding box. Antes usaba el
 * bounding box (minX/maxX/minY/maxY de TODO el dibujo): para un
 * rectángulo/cuadrado alineado con los ejes da exactamente lo mismo (el
 * bounding box ES la forma), pero para un triángulo o un trapecio no
 * simétrico el bounding box mide hasta una esquina que a veces ni existe
 * en la forma real — verificado con un caso de prueba: sobreestimaba L en
 * 1.5 m sobre un total de 3.5 m (un 43% de más).
 *
 * AGREGADO (ver conversación: zapatas aisladas triangulares/trapezoidales
 * de 1 columna, para completar antes de pruebas). La primera versión medía
 * el voladizo SOLO en la fila/columna exacta de la columna (rayCrossing con
 * fixedCoord=columnY/columnX) — en un rectángulo el ancho es constante, así
 * que esa única fila ya representa a todas; en un triángulo o trapecio el
 * borde real se aleja o se acerca en otras filas/columnas (el ancho de la
 * franja varía a lo largo del voladizo), y el criterio de diseño (sección
 * crítica) exige usar el PEOR CASO en toda la cara de la columna, no solo
 * en su propia fila — mismo principio de "usar el mayor voladizo" que ya
 * existía (antes solo entre +X/-X), ahora extendido a TODAS las filas/
 * columnas del polígono vía un muestreo (`maxOverhangAlongAxis`). Para un
 * rectángulo el resultado es idéntico al de antes (ancho constante, ningún
 * muestreo cambia el máximo) — verificado. Es una generalización, no una
 * fórmula distinta por forma: aplica igual a triangular, trapezoidal o
 * cualquier polígono, sin necesidad de detectar la forma.
 */
const OVERHANG_SAMPLE_COUNT = 40;

function maxOverhangAlongAxis(points, axis, sampleMin, sampleMax, originCoord, halfSize) {
  let maxOverhang = 0;
  const span = sampleMax - sampleMin;
  for (let k = 0; k <= OVERHANG_SAMPLE_COUNT; k++) {
    const t = span === 0 ? sampleMin : sampleMin + (k / OVERHANG_SAMPLE_COUNT) * span;
    const farPos = rayCrossing(points, axis, t, originCoord, 1);
    const farNeg = rayCrossing(points, axis, t, originCoord, -1);
    if (farPos != null) maxOverhang = Math.max(maxOverhang, farPos - originCoord - halfSize);
    if (farNeg != null) maxOverhang = Math.max(maxOverhang, originCoord - farNeg - halfSize);
  }
  return Math.max(maxOverhang, 0);
}

export function computeIsolatedOverhangs(polygonPoints, column, columnSize) {
  const points = (polygonPoints || []).map((point) => ({ x: Number(point.x), y: Number(point.y) }));
  const xs = points.map((point) => point.x);
  const ys = points.map((point) => point.y);

  const minX = Math.min(...xs);
  const maxX = Math.max(...xs);
  const minY = Math.min(...ys);
  const maxY = Math.max(...ys);

  const halfB = (Number(columnSize?.b) || 0) / 2;
  const halfH = (Number(columnSize?.h) || 0) / 2;

  const columnX = Number(column?.x) || 0;
  const columnY = Number(column?.y) || 0;

  // Lx: voladizo en X, muestreando distintas filas Y (para un rectángulo
  // el borde en X no cambia con Y, así que el muestreo da lo mismo que
  // medir en una sola fila). Ly: analogo, muestreando distintas columnas X.
  const Lx = maxOverhangAlongAxis(points, "x", minY, maxY, columnX, halfB);
  const Ly = maxOverhangAlongAxis(points, "y", minX, maxX, columnY, halfH);

  return {
    Lx,
    Ly,
    // Bounding box del polígono — lo reusa computeIsolatedMomentAtPoint
    // para el mapa de momento 2D, para no recalcularlo por cada punto de
    // la nube (puede haber miles).
    bounds: { minX, maxX, minY, maxY },
  };
}

/**
 * Momento de diseño por voladizo (E.060), por metro de ancho: Mu = σu×L²/2.
 * `momentoVoladizoX`/`Y` nombran la DIRECCIÓN del voladizo que lo genera
 * (no la convención Mx/My de reacciones de columna, que es una magnitud
 * distinta) — un voladizo largo en X exige más momento en esa dirección.
 */
export function computeIsolatedFootingMoment(overhangs, sigmaUlt) {
  const sigma = Number(sigmaUlt) || 0;

  return {
    momentoVoladizoX: (sigma * (overhangs?.Lx || 0) ** 2) / 2,
    momentoVoladizoY: (sigma * (overhangs?.Ly || 0) ** 2) / 2,
  };
}

/**
 * Igual que computeIsolatedFootingMoment, pero evaluado en UN punto
 * cualquiera de la zapata (no solo el peor caso) — mismo Mu=σu·d²/2, pero
 * `d` es la distancia de ESE punto al BORDE LIBRE de su lado, no a la
 * columna. Sirve para pintar el mapa de momento 2D (estilo M11 de ETABS).
 *
 * CORREGIDO (ver conversación, confirmado con captura real de ETABS: el
 * pico de momento está pegado a la columna, no en el borde): la primera
 * versión de esto usaba `d` = distancia AL COLUMNA, dando 0 en la columna
 * y máximo en el borde — resultado invertido respecto a la física real.
 * Un voladizo (viga en cara de columna) tiene su momento MÁXIMO en el
 * apoyo (la cara de la columna, la sección crítica de diseño de E.060/
 * ACI — de ahí sale Mu=σu·L²/2) y CERO en el extremo libre (el borde) —
 * es la misma estática de una viga en voladizo: M(x)=w·(L−x)²/2, medido
 * desde el apoyo, no desde la punta. Bloque 3 (computeIsolatedFootingMoment)
 * siempre estuvo bien — ese usa L completo, no un punto intermedio, así
 * que el bug no afectaba ni Acero (Bloque 5) ni Cortante (Bloque 6),
 * solo este mapa 2D.
 *
 * `points` = vértices del polígono, para el ray casting (ver rayCrossing/
 * computeIsolatedOverhangs) — se usa para encontrar el borde real EN LA
 * FILA/COLUMNA de este punto específico, no el bounding box global (mismo
 * arreglo que Bloque 3, aplicado acá punto por punto: dos puntos a la
 * misma X pero distinta Y pueden tener un borde real distinto en un
 * triángulo/trapecio, cosa que el bounding box no distinguía). `bounds`
 * sigue como respaldo (por si el rayo no cruza nada en algún punto raro).
 */
export function computeIsolatedMomentAtPoint(pointX, pointY, column, columnSize, sigmaUlt, points, bounds) {
  const halfB = (Number(columnSize?.b) || 0) / 2;
  const halfH = (Number(columnSize?.h) || 0) / 2;
  const columnX = Number(column?.x) || 0;
  const columnY = Number(column?.y) || 0;
  const sigma = Number(sigmaUlt) || 0;
  const x = Number(pointX) || 0;
  const y = Number(pointY) || 0;

  // Borde real del polígono en la fila (y=y) o columna (x=x) de ESTE
  // punto, del lado que le toca según si está antes o después de la
  // columna — reemplaza bounds.maxX/minX/maxY/minY (el bounding box de
  // TODO el dibujo) por el cruce real en su propia fila/columna.
  const farX = x >= columnX
    ? rayCrossing(points, "x", y, columnX, 1) ?? bounds?.maxX ?? x
    : rayCrossing(points, "x", y, columnX, -1) ?? bounds?.minX ?? x;
  const farY = y >= columnY
    ? rayCrossing(points, "y", x, columnY, 1) ?? bounds?.maxY ?? y
    : rayCrossing(points, "y", x, columnY, -1) ?? bounds?.minY ?? y;

  // Distancia de este punto al borde libre de SU lado — se "recorta" en
  // la cara de la columna (Math.max/min contra columnX±halfB) para que el
  // momento quede PLANO (en su máximo) sobre toda la huella de la
  // columna, en vez de seguir creciendo más allá de la cara — el mismo
  // criterio de "sección crítica en la cara" que usa el Mu escalar.
  const edgeDistX = x >= columnX
    ? Math.max(0, farX - Math.max(x, columnX + halfB))
    : Math.max(0, Math.min(x, columnX - halfB) - farX);
  const edgeDistY = y >= columnY
    ? Math.max(0, farY - Math.max(y, columnY + halfH))
    : Math.max(0, Math.min(y, columnY - halfH) - farY);

  return {
    mx: (sigma * edgeDistX * edgeDistX) / 2,
    my: (sigma * edgeDistY * edgeDistY) / 2,
  };
}

// ===========================================================================
// Bloque 3 — zapata combinada (viga continua)
// ===========================================================================

function shoelaceArea(points) {
  let sum = 0;
  const n = points.length;

  for (let i = 0; i < n; i++) {
    const a = points[i];
    const b = points[(i + 1) % n];
    sum += Number(a.x) * Number(b.y) - Number(b.x) * Number(a.y);
  }

  return Math.abs(sum) / 2;
}

// Qué tan "llena" tiene que estar el bounding box para tratar el polígono
// como un solo rectángulo (viga única) en vez de buscarle una L.
const RECTANGLE_AREA_RATIO = 0.98;

function crossProduct(o, a, b) {
  return (a.x - o.x) * (b.y - o.y) - (a.y - o.y) * (b.x - o.x);
}

/**
 * Encuentra un vértice reflejo (cóncavo) real de un polígono simple —
 * usando el producto cruzado de los dos bordes que se juntan en cada
 * vértice, no dónde cae ese vértice respecto al bounding box. Esto
 * funciona sin importar la rotación del polígono; la prueba anterior
 * ("¿el punto NO toca ninguna de las 4 esquinas del bounding box?") daba
 * falsos positivos en cualquier cuadrilátero simplemente girado — en un
 * polígono rotado, casi ningún vértice cae justo en una esquina del
 * bounding box, así que esa prueba los confundía a todos con "reflejos"
 * aunque el polígono fuera perfectamente convexo.
 */
function findReflexVertex(points) {
  const n = points.length;
  if (n < 4) return null; // un triángulo no puede tener vértice reflejo

  const crosses = points.map((point, i) => {
    const prev = points[(i - 1 + n) % n];
    const next = points[(i + 1) % n];
    return crossProduct(prev, point, next);
  });

  const positive = crosses.filter((c) => c > 1e-9).length;
  const negative = crosses.filter((c) => c < -1e-9).length;
  if (positive === 0 || negative === 0) return null; // convexo, sin reflejo

  const majoritySign = positive >= negative ? 1 : -1;
  const index = crosses.findIndex((c) => Math.sign(c) !== 0 && Math.sign(c) !== majoritySign);

  return index === -1 ? null : points[index];
}

/**
 * Separa el polígono de una zapata combinada en 1 o 2 "brazos"
 * rectangulares SIN superposición (ver conversación: contar dos veces la
 * esquina compartida infla el resultado). Si el polígono ya es
 * prácticamente un rectángulo, devuelve un solo brazo. Si es una L (el
 * caso real que tenemos), encuentra el vértice "reflejo" (el único punto
 * que no cae sobre ningún borde del bounding box) y la esquina faltante
 * del bounding box, y con eso arma dos rectángulos que juntos arman
 * exactamente la L, tocándose solo en una línea — nunca en área.
 *
 * Para formas más irregulares que una L simple (no cubiertas todavía),
 * devuelve un solo brazo con el bounding box completo — una aproximación
 * conservadora, no una respuesta exacta.
 */
export function splitFootingIntoLegs(polygonPoints) {
  const points = (polygonPoints || []).map((point) => ({ x: Number(point.x), y: Number(point.y) }));
  if (points.length < 3) return [];

  const xs = points.map((point) => point.x);
  const ys = points.map((point) => point.y);
  const minX = Math.min(...xs);
  const maxX = Math.max(...xs);
  const minY = Math.min(...ys);
  const maxY = Math.max(...ys);

  const bboxArea = (maxX - minX) * (maxY - minY);
  const isRectangle = !bboxArea || shoelaceArea(points) / bboxArea > RECTANGLE_AREA_RATIO;

  if (isRectangle) {
    return [{ minX, maxX, minY, maxY }];
  }

  const notch = findReflexVertex(points);

  if (!notch) {
    return [{ minX, maxX, minY, maxY }];
  }

  // El punto "notch" divide el bounding box en 4 cuadrantes; se prueba el
  // CENTRO de cada uno (nunca las esquinas exactas del bounding box, que
  // caen sobre vértices reales del polígono — el algoritmo de trazar un
  // rayo para "punto dentro de polígono" es poco confiable justo ahí,
  // sobre el borde) para encontrar cuál cuadrante está vacío.
  const quadrants = [
    { cx: (minX + notch.x) / 2, cy: (minY + notch.y) / 2, isMaxX: false, isMaxY: false },
    { cx: (maxX + notch.x) / 2, cy: (minY + notch.y) / 2, isMaxX: true, isMaxY: false },
    { cx: (maxX + notch.x) / 2, cy: (maxY + notch.y) / 2, isMaxX: true, isMaxY: true },
    { cx: (minX + notch.x) / 2, cy: (maxY + notch.y) / 2, isMaxX: false, isMaxY: true },
  ];
  const missingQuadrant = quadrants.find((quadrant) => !pointInPolygon({ x: quadrant.cx, y: quadrant.cy }, points));

  if (!missingQuadrant) {
    return [{ minX, maxX, minY, maxY }];
  }

  const missingIsMaxX = missingQuadrant.isMaxX;
  const missingIsMaxY = missingQuadrant.isMaxY;

  // Brazo A: la columna completa en Y (minY→maxY), en el lado de X que sí
  // pertenece al polígono junto a la esquina faltante.
  const legA = {
    minX: missingIsMaxX ? minX : notch.x,
    maxX: missingIsMaxX ? notch.x : maxX,
    minY,
    maxY,
  };

  // Brazo B: el resto de la L — el rango de X complementario a A (nunca se
  // superponen), recortado en Y hasta donde llega el notch.
  const legB = {
    minX: missingIsMaxX ? notch.x : minX,
    maxX: missingIsMaxX ? maxX : notch.x,
    minY: missingIsMaxY ? minY : notch.y,
    maxY: missingIsMaxY ? notch.y : maxY,
  };

  return [legA, legB];
}

/**
 * Geometría de una zapata en L para el FEM (Bloque 3b) -- bounding box
 * completo, y qué rincón falta (el notch), a partir de los 2 brazos que ya
 * calcula splitFootingIntoLegs (mismo cálculo que usa el método rígido
 * para saber que el polígono está ramificado). AGREGADO (ver conversación):
 * a diferencia del método rígido (que declara `supported:false` para este
 * caso -- separar en brazos independientes no equilibra bien la carga con
 * datos reales, ver computeCombinedFootingMoments), el FEM SÍ puede
 * calcular esto con una sola malla sobre el bounding box completo, sin
 * crear elementos en el rincón faltante (ver calcular_zapata_shell_L_
 * combinada en zapata_shell_solver.py) -- por eso este helper es
 * independiente de `supported`.
 *
 * Devuelve null si el polígono no es una L simple (2 brazos).
 */
export function computeLFootingGeometry(polygonPoints) {
  const legs = splitFootingIntoLegs(polygonPoints);
  if (legs.length !== 2) return null;

  const [legA, legB] = legs;
  const minX = Math.min(legA.minX, legB.minX);
  const maxX = Math.max(legA.maxX, legB.maxX);
  // legA siempre abarca el rango Y completo (ver splitFootingIntoLegs).
  const minY = legA.minY;
  const maxY = legA.maxY;
  const tolerance = 1e-6;

  const notchEsMaxX = Math.abs(legB.maxX - maxX) < tolerance;
  const notchEsMaxY = Math.abs(legB.minY - minY) < tolerance;

  const notchXAbs = notchEsMaxX ? legB.minX : legB.maxX;
  const notchYAbs = notchEsMaxY ? legB.maxY : legB.minY;

  return {
    Lx: maxX - minX,
    Ly: maxY - minY,
    originX: minX,
    originY: minY,
    notchX: notchXAbs - minX,
    notchY: notchYAbs - minY,
    notchEsMaxX,
    notchEsMaxY,
  };
}

function isPointInRect(point, rect, tolerance = 1e-6) {
  const x = Number(point.x);
  const y = Number(point.y);
  return x >= rect.minX - tolerance && x <= rect.maxX + tolerance && y >= rect.minY - tolerance && y <= rect.maxY + tolerance;
}

/**
 * Reparte las columnas entre los brazos — cada columna va a UN solo brazo
 * (el primero que la contenga, por orden del arreglo `legs`), para no
 * contar dos veces la carga de una columna que caiga justo en el borde
 * compartido entre brazos.
 */
export function assignColumnsToLegs(legs, columns) {
  const assignedIds = new Set();

  return (legs || []).map((leg) => {
    return (columns || []).filter((column) => {
      // buildZapataColumnRows (foundationContract.js) identifica cada fila
      // con el campo `column` (el ID del nudo), no `id`.
      const id = String(column.column ?? column.id);
      if (assignedIds.has(id) || !isPointInRect(column, leg)) return false;
      assignedIds.add(id);
      return true;
    });
  });
}

/**
 * Evalúa expresiones simples tipo "Pm + 0.7 * PS" o "0.6 * Pm + 0.7 * PS"
 * — el mismo texto que usa `column1` en DEFAULT_LOAD_COMBINATIONS (ver
 * zapatas2Core.js, ej. "Pm + 0.7 * PS") para la carga AXIAL de columna, o
 * `column2`/`column3` (ej. "MXm + 0.7 * MXS", "MYm") para su MOMENTO propio
 * respecto a X/Y — AGREGADO (ver conversación, momento propio de columna
 * verificado contra Bowles Ejemplo 9-1, `computeContinuousBeamMoment` más
 * abajo). Los 3 textos usan nombres de variable distintos (pm/pv/ps,
 * mxm/mxv/mxs, mym/myv/mys) pero TODOS terminan en "m" (muerta), "v" (viva)
 * o "s" (sismo) — se reconoce por esa ÚLTIMA letra, no por el nombre
 * completo, para que la misma función sirva para los 3 sin repetir código.
 * Ignora cualquier término que no termine en m/v/s. Suficiente para las 11
 * combinaciones ya definidas (no es un evaluador de expresiones genérico).
 */
export function evaluateAxialExpression(expression, { pm = 0, pv = 0, ps = 0 } = {}) {
  const normalized = String(expression || "")
    .toLowerCase()
    .replaceAll(",", ".")
    .replace(/\s+/g, "");

  const withSign = /^[+-]/.test(normalized) ? normalized : `+${normalized}`;
  const terms = withSign.match(/[+-][^+-]+/g) || [];
  const values = { m: pm, v: pv, s: ps };

  return terms.reduce((total, rawTerm) => {
    const sign = rawTerm.startsWith("-") ? -1 : 1;
    const parts = rawTerm.slice(1).split("*");
    const varName = parts[parts.length - 1];
    const key = varName.slice(-1); // última letra: m/v/s -- funciona igual para "pm" que para "mxm"/"mym"

    if (!(key in values)) return total; // ignora términos que no terminen en m/v/s

    const coefficient = parts.length > 1 ? parts.slice(0, -1).reduce((product, factor) => product * Number(factor), 1) : 1;

    return total + sign * coefficient * values[key];
  }, 0);
}

/**
 * Momento de diseño de UN brazo de zapata combinada, tratado como viga
 * libre-libre autoequilibrada: carga uniforme hacia arriba (σu del
 * polígono × ancho del brazo — misma simplificación de presión uniforme
 * que ya usamos en zapata aislada) menos las cargas puntuales reales de
 * cada columna hacia abajo. El eje de la viga es el lado más largo del
 * brazo; el ancho (para pasar de σ a carga por metro lineal) es el lado
 * corto.
 *
 * M(x) = q·x²/2 − Σ Pᵢ·(x−xᵢ) + Σ Mᵢ, ambas sumas para cada columna ya
 * pasada (xᵢ≤x) — forma cerrada de integrar el cortante de un tramo
 * autoequilibrado (mismo principio que la fórmula del voladizo de la
 * zapata aislada, extendido a varias columnas en vez de una sola).
 *
 * AGREGADO (ver conversación): el término "+ Σ Mᵢ" (momento propio que
 * cada columna transmite a la zapata, no solo su carga axial) faltaba —
 * verificado contra el printout REAL del Ejemplo 9-1 de Bowles ("Foundation
 * Analysis and Design" 5ta ed., Fig. E9-1b): sin este término, M(x) no
 * coincidía con el libro; agregándolo (M salta exactamente +Mᵢ al cruzar
 * cada columna, ADEMÁS del salto de -Pᵢ en el cortante) reproduce las 18
 * filas de su tabla real (x, V, M) a la precisión del redondeo del libro
 * (columna 1: P=837kN M=86.8kN·m en x=0.15; columna 2: P=1366kN M=124kN·m
 * en x=4.75; q=355.554kN/m; L=6.196m — mismos números del libro).
 *
 * Qué momento de columna usar: el que causa flexión en el MISMO plano que
 * esta viga (que corre a lo largo de `beamAxis`) — es el momento de
 * reacción respecto al eje PERPENDICULAR a `beamAxis` (`my`/pd3-pl3-sismo3
 * si la viga corre en X, `mx`/pd2-pl2-sismo2 si corre en Y — ver
 * `buildZapataColumnRows` en foundationContract.js, reaction[3]=mx,
 * reaction[4]=my), combinado con `momentExpressionX`/`momentExpressionY`
 * (`combo.column2`/`combo.column3` de DEFAULT_LOAD_COMBINATIONS —
 * zapatas2Core.js — NO el mismo `axialExpression`/`column1`: los factores
 * de combinación de MX/MY son distintos a los de P para varias de las 11
 * combinaciones, ej. combo 2 usa "Pm+0.7*PS" para P pero solo "MYm" — sin
 * el 0.7*PS — para MY). Esta parte (qué campo mapea a qué eje, y el signo)
 * NO quedó verificada contra un caso real con momento de columna distinto
 * de cero -- el Ejemplo 9-1 del libro es genérico, sin ejes globales X/Y,
 * así que solo confirma la FÓRMULA, no el mapeo de campos. Revisar contra
 * un caso real antes de confiar ciegamente en el signo.
 */
export function computeContinuousBeamMoment(
  leg,
  columnsInLeg,
  sigmaUlt,
  axialExpression,
  momentExpressionX,
  momentExpressionY,
  sampleCount = 200
) {
  const spanX = leg.maxX - leg.minX;
  const spanY = leg.maxY - leg.minY;
  const beamAxis = spanX >= spanY ? "x" : "y";
  const length = Math.max(spanX, spanY);
  const width = Math.min(spanX, spanY) || 0;
  const origin = beamAxis === "x" ? leg.minX : leg.minY;
  const momentExpression = beamAxis === "x" ? momentExpressionY : momentExpressionX;

  const q = (Number(sigmaUlt) || 0) * width; // Tn/m, uniforme a lo largo del brazo

  const pointLoads = (columnsInLeg || []).map((column) => ({
    position: (beamAxis === "x" ? Number(column.x) : Number(column.y)) - origin,
    p: evaluateAxialExpression(axialExpression, {
      pm: Number(column.pd1) || 0,
      pv: Number(column.pl1) || 0,
      ps: Number(column.sismo1) || 0,
    }),
    m: evaluateAxialExpression(momentExpression, {
      pm: Number(beamAxis === "x" ? column.pd3 : column.pd2) || 0,
      pv: Number(beamAxis === "x" ? column.pl3 : column.pl2) || 0,
      ps: Number(beamAxis === "x" ? column.sismo3 : column.sismo2) || 0,
    }),
  }));

  const momentAt = (x) =>
    (q * x * x) / 2 -
    pointLoads.reduce((sum, load) => (load.position <= x ? sum + load.p * (x - load.position) : sum), 0) +
    pointLoads.reduce((sum, load) => (load.position <= x ? sum + load.m : sum), 0);

  // V(x) = dM/dx = q·x − Σ Pᵢ (para cada columna ya pasada) — el cortante
  // del mismo tramo autoequilibrado, usado por Bloque 6 (footingShear.js)
  // para el chequeo de cortante por flexión de zapatas combinadas.
  const shearAt = (x) =>
    q * x - pointLoads.reduce((sum, load) => (load.position <= x ? sum + load.p : sum), 0);

  // Una zapata combinada es una viga "al revés" respecto a una viga de piso
  // normal: el suelo empuja hacia arriba (no la gravedad hacia abajo) y las
  // columnas empujan hacia abajo solo en puntos — por eso el patrón de
  // tracción queda invertido respecto a la intuición de una viga normal:
  // momentoPositivoMax (sagging, M>0) tracciona el lado de ABAJO — ocurre
  // típicamente cerca de las columnas → pide acero INFERIOR ahí.
  // momentoNegativoMax (hogging, M<0) tracciona el lado de ARRIBA — ocurre
  // típicamente en el vano (tramo entre columnas) → pide acero SUPERIOR ahí.
  let momentoPositivoMax = 0;
  let momentoNegativoMax = 0;
  let cortanteMax = 0;
  // Perfil de momento a lo largo de la viga — mismos puntos que ya se
  // samplean para el envolvente, solo que acá se GUARDAN en vez de
  // descartarse. Lo usa el mapa de momento 2D (canvas2d/zapataMomentLayer.js)
  // para pintar cada punto de la nube de σ con su momento correspondiente,
  // sin volver a resolver la viga por cada punto.
  const momentProfile = [];

  for (let i = 0; i <= sampleCount; i++) {
    const x = (length * i) / sampleCount;
    const moment = momentAt(x);
    momentoPositivoMax = Math.max(momentoPositivoMax, moment);
    momentoNegativoMax = Math.min(momentoNegativoMax, moment);
    cortanteMax = Math.max(cortanteMax, Math.abs(shearAt(x)));
    momentProfile.push({ x, moment });
  }

  return { momentoPositivoMax, momentoNegativoMax, cortanteMax, beamAxis, length, width, origin, momentProfile };
}

// ===========================================================================
// Zapata trapezoidal — mismo principio (viga libre-libre autoequilibrada),
// pero con ancho variable a lo largo de la viga (más ancha en el extremo
// de la columna con más carga, para uniformar la presión sobre el suelo).
// A diferencia de la L/T, un trapecio NO tiene esquina reentrante ni
// torsión — es una sola pieza conectada, así que sí se puede resolver sin
// elementos finitos.
// ===========================================================================

/**
 * ¿Es un polígono de 4 vértices, no rectangular, y sin vértice reflejo
 * (convexo)? Esa combinación identifica un trapecio — a diferencia de una
 * L (que si tiene un vértice reflejo, el "notch").
 */
function isTrapezoidalFooting(polygonPoints) {
  const points = (polygonPoints || []).map((point) => ({ x: Number(point.x), y: Number(point.y) }));
  if (points.length !== 4) return false;

  const xs = points.map((point) => point.x);
  const ys = points.map((point) => point.y);
  const minX = Math.min(...xs);
  const maxX = Math.max(...xs);
  const minY = Math.min(...ys);
  const maxY = Math.max(...ys);

  const bboxArea = (maxX - minX) * (maxY - minY);
  const isRectangle = !bboxArea || shoelaceArea(points) / bboxArea > RECTANGLE_AREA_RATIO;
  if (isRectangle) return false;

  return !findReflexVertex(points);
}

/**
 * Ancho real del polígono al cortarlo con una línea perpendicular al eje
 * de la viga, en la coordenada global `coord` — se recorre cada lado del
 * polígono y se buscan los puntos donde cruza esa línea.
 */
function widthAtCut(points, beamAxis, coord) {
  const crossings = [];

  for (let i = 0; i < points.length; i++) {
    const a = points[i];
    const b = points[(i + 1) % points.length];
    const aCoord = beamAxis === "x" ? a.x : a.y;
    const bCoord = beamAxis === "x" ? b.x : b.y;

    if (aCoord === bCoord) continue; // lado paralelo al corte, no cruza en un punto

    const within = (aCoord <= coord && coord <= bCoord) || (bCoord <= coord && coord <= aCoord);
    if (!within) continue;

    const t = (coord - aCoord) / (bCoord - aCoord);
    crossings.push(beamAxis === "x" ? a.y + t * (b.y - a.y) : a.x + t * (b.x - a.x));
  }

  return crossings.length < 2 ? 0 : Math.max(...crossings) - Math.min(...crossings);
}

/**
 * Geometría de una zapata trapezoidal para el FEM (Bloque 3b) — eje de la
 * viga, longitud, ancho en cada extremo (B0 en el origen, B1 en el extremo
 * opuesto), y la LÍNEA CENTRAL (recta y exacta para un trapecio real de 4
 * vértices con 2 lados paralelos — no una aproximación) para poder pasarle
 * al solver de placa (calcular_zapata_shell_trapezoidal_combinada, que
 * espera columnas centradas en y=0 por convención) la posición de cada
 * columna como OFFSET respecto a esa línea, no su coordenada absoluta.
 * AGREGADO (ver conversación): reutiliza el mismo cálculo de cruces que
 * widthAtCut, pero conserva el punto medio de cada corte en vez de solo la
 * diferencia.
 */
export function computeTrapezoidalFootingGeometry(polygonPoints) {
  const points = (polygonPoints || []).map((point) => ({ x: Number(point.x), y: Number(point.y) }));
  const xs = points.map((point) => point.x);
  const ys = points.map((point) => point.y);
  const minX = Math.min(...xs);
  const maxX = Math.max(...xs);
  const minY = Math.min(...ys);
  const maxY = Math.max(...ys);

  const beamAxis = maxX - minX >= maxY - minY ? "x" : "y";
  const length = beamAxis === "x" ? maxX - minX : maxY - minY;
  const origin = beamAxis === "x" ? minX : minY;

  const crossingsAt = (coord) => {
    const crossings = [];
    for (let i = 0; i < points.length; i++) {
      const a = points[i];
      const b = points[(i + 1) % points.length];
      const aCoord = beamAxis === "x" ? a.x : a.y;
      const bCoord = beamAxis === "x" ? b.x : b.y;
      if (aCoord === bCoord) continue;
      const within = (aCoord <= coord && coord <= bCoord) || (bCoord <= coord && coord <= aCoord);
      if (!within) continue;
      const t = (coord - aCoord) / (bCoord - aCoord);
      crossings.push(beamAxis === "x" ? a.y + t * (b.y - a.y) : a.x + t * (b.x - a.x));
    }
    return crossings;
  };

  const c0 = crossingsAt(origin);
  const c1 = crossingsAt(origin + length);
  const B0 = c0.length >= 2 ? Math.max(...c0) - Math.min(...c0) : 0;
  const B1 = c1.length >= 2 ? Math.max(...c1) - Math.min(...c1) : 0;
  const center0 = c0.length >= 2 ? (Math.max(...c0) + Math.min(...c0)) / 2 : 0;
  const center1 = c1.length >= 2 ? (Math.max(...c1) + Math.min(...c1)) / 2 : 0;

  return { beamAxis, length, origin, B0, B1, center0, center1 };
}

/**
 * Momento de diseño para zapata trapezoidal — mismo principio que
 * computeContinuousBeamMoment (viga libre-libre autoequilibrada: carga de
 * suelo hacia arriba menos cargas puntuales de columnas hacia abajo, MÁS el
 * momento propio de cada columna — ver comentario de esa función sobre la
 * verificación contra Bowles Ejemplo 9-1), pero con integración numérica
 * (regla del trapecio) en vez de fórmula cerrada, porque el ancho — y por
 * tanto la carga por metro lineal — varía a lo largo de la viga en vez de
 * ser constante.
 */
export function computeTrapezoidalBeamMoment(
  polygonPoints,
  columnsInPolygon,
  sigmaUlt,
  axialExpression,
  momentExpressionX,
  momentExpressionY,
  sampleCount = 400
) {
  const points = (polygonPoints || []).map((point) => ({ x: Number(point.x), y: Number(point.y) }));
  const xs = points.map((point) => point.x);
  const ys = points.map((point) => point.y);
  const minX = Math.min(...xs);
  const maxX = Math.max(...xs);
  const minY = Math.min(...ys);
  const maxY = Math.max(...ys);

  const beamAxis = maxX - minX >= maxY - minY ? "x" : "y";
  const length = beamAxis === "x" ? maxX - minX : maxY - minY;
  const origin = beamAxis === "x" ? minX : minY;
  const sigma = Number(sigmaUlt) || 0;
  const widthAt = (localX) => widthAtCut(points, beamAxis, origin + localX);
  const momentExpression = beamAxis === "x" ? momentExpressionY : momentExpressionX;

  const pointLoads = (columnsInPolygon || []).map((column) => ({
    position: (beamAxis === "x" ? Number(column.x) : Number(column.y)) - origin,
    p: evaluateAxialExpression(axialExpression, {
      pm: Number(column.pd1) || 0,
      pv: Number(column.pl1) || 0,
      ps: Number(column.sismo1) || 0,
    }),
    m: evaluateAxialExpression(momentExpression, {
      pm: Number(beamAxis === "x" ? column.pd3 : column.pd2) || 0,
      pv: Number(beamAxis === "x" ? column.pl3 : column.pl2) || 0,
      ps: Number(beamAxis === "x" ? column.sismo3 : column.sismo2) || 0,
    }),
  }));

  const step = length / sampleCount;
  let shear = 0;
  let moment = 0;
  let momentoPositivoMax = 0;
  let momentoNegativoMax = 0;
  let cortanteMax = 0;
  // Perfil de momento a lo largo de la viga — ver mismo comentario en
  // computeContinuousBeamMoment. Acá el momento es acumulado (no forma
  // cerrada), así que este es el ÚNICO lugar donde se puede capturar sin
  // recalcular todo desde cero por cada punto que se quiera consultar.
  const momentProfile = [];

  for (let i = 1; i <= sampleCount; i++) {
    const x0 = (i - 1) * step;
    const x1 = i * step;
    const q0 = sigma * widthAt(x0);
    const q1 = sigma * widthAt(x1);

    const shearBefore = shear;
    shear += ((q0 + q1) / 2) * step; // regla del trapecio para la carga distribuida de suelo

    pointLoads.forEach((load) => {
      if (load.position > x0 && load.position <= x1) shear -= load.p;
    });

    moment += ((shearBefore + shear) / 2) * step;

    // AGREGADO (ver conversación, mismo hallazgo que en
    // computeContinuousBeamMoment): salto directo de +Mᵢ al cruzar cada
    // columna, además del salto de -Pᵢ ya aplicado en el cortante arriba.
    pointLoads.forEach((load) => {
      if (load.position > x0 && load.position <= x1) moment += load.m;
    });

    momentoPositivoMax = Math.max(momentoPositivoMax, moment);
    momentoNegativoMax = Math.min(momentoNegativoMax, moment);
    // Bloque 6: cortante máximo a lo largo del tramo (ya se calculaba
    // para integrar el momento — antes se descartaba, ahora se guarda).
    cortanteMax = Math.max(cortanteMax, Math.abs(shear));
    momentProfile.push({ x: x1, moment });
  }

  return {
    momentoPositivoMax,
    momentoNegativoMax,
    cortanteMax,
    beamAxis,
    length,
    width: widthAt(length / 2),
    origin,
    momentProfile,
  };
}

/**
 * Orquesta el Bloque 3 para una zapata combinada: separa en brazos,
 * reparte columnas, y calcula el momento de cada brazo — o, si el
 * polígono es un trapecio, usa la viga de ancho variable.
 *
 * IMPORTANTE — el método de "brazos independientes" solo se calcula si el
 * polígono es UN SOLO brazo (columnas en línea recta, sin ramificación):
 * se comprobó con datos reales que, para una zapata ramificada (tipo L o
 * T), cada brazo por separado queda muy lejos de su propio equilibrio (la
 * esquina compartida sufre flexión biaxial y torsión que este método no
 * captura — ni el propio ETABS/SAFE lo resuelve sin malla de elementos
 * finitos refinada). Para el caso ramificado se devuelve sin calcular en
 * vez de un número incorrecto — requeriría un análisis 2D conectado
 * (fuera de alcance, ver conversación con el cliente).
 */
export function computeCombinedFootingMoments(polygonPoints, columnsInPolygon, loadCombinations, sigmaMaxByCombo) {
  if (isTrapezoidalFooting(polygonPoints)) {
    return {
      supported: true,
      reason: null,
      legs: [
        {
          leg: null,
          columnIds: columnsInPolygon.map((column) => column.column ?? column.id),
          momentsByCombo: (loadCombinations || []).map((combo, comboIndex) =>
            computeTrapezoidalBeamMoment(
              polygonPoints,
              columnsInPolygon,
              sigmaMaxByCombo?.[comboIndex] ?? 0,
              combo.column1,
              combo.column2,
              combo.column3
            )
          ),
        },
      ],
    };
  }

  const legs = splitFootingIntoLegs(polygonPoints);

  if (legs.length > 1) {
    return { supported: false, reason: "branching", legs: null };
  }

  const columnsPerLeg = assignColumnsToLegs(legs, columnsInPolygon);

  return {
    supported: true,
    reason: null,
    legs: legs.map((leg, legIndex) => ({
      leg,
      columnIds: columnsPerLeg[legIndex].map((column) => column.column ?? column.id),
      momentsByCombo: (loadCombinations || []).map((combo, comboIndex) =>
        computeContinuousBeamMoment(
          leg,
          columnsPerLeg[legIndex],
          sigmaMaxByCombo?.[comboIndex] ?? 0,
          combo.column1,
          combo.column2,
          combo.column3
        )
      ),
    })),
  };
}

/**
 * Busca el momento más cercano dentro de un `momentProfile` (el arreglo
 * {x, moment}, ORDENADO por x, que devuelven computeContinuousBeamMoment/
 * computeTrapezoidalBeamMoment) para una posición local `x` cualquiera —
 * vecino más cercano, no interpolación: con 200-400 muestras a lo largo
 * de la viga el error es despreciable para un mapa de color. Búsqueda
 * binaria (no lineal) porque esto se llama una vez por cada punto de la
 * nube de σ, que puede pasar de 20 000 puntos por zapata.
 */
export function lookupMomentProfile(momentProfile, x) {
  if (!Array.isArray(momentProfile) || !momentProfile.length) return 0;

  let lo = 0;
  let hi = momentProfile.length - 1;

  while (lo < hi) {
    const mid = (lo + hi) >> 1;
    if (momentProfile[mid].x < x) lo = mid + 1;
    else hi = mid;
  }

  if (lo > 0 && Math.abs(momentProfile[lo - 1].x - x) < Math.abs(momentProfile[lo].x - x)) {
    return momentProfile[lo - 1].moment;
  }

  return momentProfile[lo].moment;
}
