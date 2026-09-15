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

/**
 * Momento de diseño Mu (por metro de ancho, mismo Mu=σ·L²/2 que la zapata
 * aislada) para ZAPATA CORRIDA bajo muro de carga -- ver conversación:
 * a diferencia de zapata combinada (columnas puntuales, con el problema
 * de "vano corto" ya investigado a fondo), un muro con carga UNIFORME a
 * lo largo de toda su longitud no tiene ese problema -- cada metro de la
 * zapata es estáticamente igual a cualquier otro (el muro empuja hacia
 * abajo uniforme, el suelo empuja hacia arriba uniforme, ambos alineados
 * en toda la longitud), así que basta la misma fórmula de voladizo de la
 * zapata aislada, tratando el muro como una "columna" de ancho = su
 * espesor, SIN necesitar una viga continua ni un perfil de momento a lo
 * largo (eso solo hace falta si la carga del muro VARÍA a lo largo de su
 * longitud -- fuera de alcance de esta primera versión, ver conversación).
 *
 * `anchoZapataM` = ancho TRANSVERSAL de la zapata (el lado corto, B, no
 * la longitud del muro) -- se asume el muro CENTRADO en ese ancho.
 * `espesorMuroM` = espesor del muro (el "ancho de columna" equivalente).
 * No depende de ninguna conexión muro→CAD -- ambos valores los escribe
 * el ingeniero a mano (no existe todavía una forma de leer la reacción
 * real de un muro dibujado, ver conversación).
 */
export function computeZapataCorridaMoment(anchoZapataM, espesorMuroM, sigmaUlt) {
  const B = Number(anchoZapataM) || 0;
  const t = Number(espesorMuroM) || 0;
  const sigma = Number(sigmaUlt) || 0;
  const L = Math.max(0, (B - t) / 2); // voladizo transversal, muro centrado en el ancho

  return { momentoVoladizo: (sigma * L * L) / 2, voladizo: L };
}

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

// AGREGADO (ver conversación, "zapata circular"): a diferencia de
// triangular/trapezoidal (que SÍ generalizan bien con el criterio de "2
// voladizos independientes en X/Y", ver maxOverhangAlongAxis arriba), una
// zapata circular NO tiene sentido tratarla así -- el momento varía
// continuo con el ángulo, no solo en 2 ejes. Se detecta geométricamente
// (sin necesitar que el usuario marque "esto es un círculo" en ningún
// lado): si TODOS los vértices del polígono están a (casi) la misma
// distancia de su centroide, es un círculo (dibujado como polígono de
// muchos lados, que es como lo dibuja el CAD) -- mismo espíritu que la
// detección de rectángulo ya existente (RECTANGLE_AREA_RATIO arriba).
const CIRCLE_RADIUS_TOLERANCE = 0.03; // 3% de variación entre radios, dibujar un círculo real con muchos lados nunca da variación exacta 0%

export function detectCircularFooting(polygonPoints) {
  const points = (polygonPoints || []).map((point) => ({ x: Number(point.x), y: Number(point.y) }));
  if (points.length < 8) return null; // un polígono de pocos lados no es un intento de círculo

  const cx = points.reduce((sum, point) => sum + point.x, 0) / points.length;
  const cy = points.reduce((sum, point) => sum + point.y, 0) / points.length;
  const radii = points.map((point) => Math.hypot(point.x - cx, point.y - cy));
  const meanRadius = radii.reduce((sum, r) => sum + r, 0) / radii.length;
  if (!(meanRadius > 0)) return null;

  const maxDeviation = Math.max(...radii.map((r) => Math.abs(r - meanRadius) / meanRadius));
  if (maxDeviation > CIRCLE_RADIUS_TOLERANCE) return null;

  return { centerX: cx, centerY: cy, radius: meanRadius };
}

/**
 * Momento de diseño Mu (por metro de ancho, mismo criterio que
 * `computeIsolatedFootingMoment`) para zapata AISLADA CIRCULAR -- sección
 * crítica en la cara de la columna/pedestal (una cuerda recta a distancia
 * `halfColumnSize` del centro, NO curva), integrando la presión sobre el
 * SEGMENTO circular que queda del lado del borde libre.
 *
 * Geometría (segmento circular, radio R, cuerda a distancia d del
 * centro): área = R²·acos(d/R) − d·√(R²−d²); centroide del segmento
 * medido desde el CENTRO = (2/3)·(R²−d²)^1.5 / área (fórmula estándar de
 * geometría, verificada numéricamente contra integración directa antes
 * de usarla -- error <1e-9 en varios R/d de prueba). El momento total
 * (Tonf·m) es presión×área×brazo (brazo = centroide − d, la distancia
 * del CORTE al centroide del segmento) -- se divide entre el ANCHO de la
 * cuerda (2√(R²−d²), el punto más ancho de la sección crítica) para
 * volver a un valor por metro, mismo formato que el resto del sistema
 * (Mu=σ·L²/2 también es por metro) y compatible tal cual con
 * `computeFootingFlexuralSteel`.
 *
 * Devuelve 0 si la columna es más ancha que el radio (caso degenerado,
 * no debería pasar con una columna real).
 */
export function computeCircularFootingMoment(radius, halfColumnSize, sigmaUlt) {
  const R = Number(radius) || 0;
  const d = Math.max(0, Math.min(Number(halfColumnSize) || 0, R));
  const sigma = Number(sigmaUlt) || 0;
  if (!(R > 0) || d >= R) return 0;

  const raiz = Math.sqrt(R * R - d * d);
  const area = R * R * Math.acos(d / R) - d * raiz;
  if (!(area > 0)) return 0;

  const centroideDesdeCentro = (2 / 3) * Math.pow(R * R - d * d, 1.5) / area;
  const brazo = centroideDesdeCentro - d;
  const momentoTotal = sigma * area * brazo; // Tonf·m, resultante de todo el segmento
  const anchoCritico = 2 * raiz; // ancho de la cuerda (cara crítica), en metros

  return anchoCritico > 0 ? momentoTotal / anchoCritico : 0;
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
 * Cuenta cuántos vértices reflejos (cóncavos) tiene el polígono — 0 =
 * convexo, 1 = un solo rincón faltante (la L simple que sabe resolver
 * `splitFootingIntoLegs`), 2+ = varios rincones (ej. un mat armado de
 * varias piezas de Divide Shells fusionadas, con un vértice reflejo por
 * cada "escalón"). AGREGADO (ver conversación, "por qué se sigue
 * tratando como una L" — caso real, mat de 21 piezas con 3 vértices
 * reflejos): antes `findReflexVertex` devolvía el PRIMER reflejo que
 * encontraba sin fijarse si había más, así que un polígono con 3
 * escalones se armaba como si tuviera solo 1 — geometría de L
 * completamente incorrecta (el "brazo" resultante incluía área que en
 * realidad está fuera del polígono real, en los otros 2 rincones
 * ignorados). Mismo cálculo de producto cruzado que `findReflexVertex`,
 * solo que cuenta en vez de devolver el primero.
 */
function countReflexVertices(points) {
  const n = points.length;
  if (n < 4) return 0;

  const crosses = points.map((point, i) => {
    const prev = points[(i - 1 + n) % n];
    const next = points[(i + 1) % n];
    return crossProduct(prev, point, next);
  });

  const positive = crosses.filter((c) => c > 1e-9).length;
  const negative = crosses.filter((c) => c < -1e-9).length;
  if (positive === 0 || negative === 0) return 0; // convexo

  const majoritySign = positive >= negative ? 1 : -1;
  return crosses.filter((c) => Math.sign(c) !== 0 && Math.sign(c) !== majoritySign).length;
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
 * Con 2+ vértices reflejos (no es una L simple — ver countReflexVertices)
 * devuelve un arreglo de longitud 3 a propósito: ni `computeCombinedFooting
 * Moments` (mira `.length > 1` para declarar "ramificada") ni
 * `computeLFootingGeometry` (mira `.length !== 2` para declarar "no es una
 * L válida") usan el CONTENIDO del arreglo en ese caso, solo su longitud —
 * cualquier valor que no sea 1 ni 2 los hace caer correctamente al camino
 * de "no soportado por el método rígido, pero el FEM de polígono general
 * sí puede resolverlo" (ver zapataShellDesign.js/foundation.js).
 */
// AGREGADO (ver conversación, "bug M11=164 en triángulo" -- caso real de
// Jack, 3 columnas en arreglo de L: (0,4),(0,8),(4,8)): splitFootingIntoLegs
// solo reconoce "1 vértice reflejo -> L de 2 brazos" o, si no hay ninguno,
// "1 solo brazo = todo el bounding box" -- un polígono CONVEXO (triángulo,
// pentágono, etc.) NUNCA tiene vértice reflejo, así que siempre cae en el
// segundo caso sin importar si las columnas de verdad están alineadas en
// una recta. Con columnas NO colineales (como este triángulo: 2 columnas
// comparten la misma X, luz CERO entre "apoyos" de una viga 1D en ese eje),
// computeContinuousBeamMoment recibe una configuración degenerada y devuelve
// momentos absurdos (164/1580 Tn·m/m vistos en vivo) -- y como el cálculo
// "tiene éxito" (no marca supported:false), el sistema NUNCA intenta el
// respaldo de elementos finitos (poligono_combinada), que sí maneja
// cualquier arreglo 2D de columnas correctamente.
// Chequea si las columnas están razonablemente alineadas en UN eje (mismo
// criterio ALIGN_TOL_M=0.5m que ya usa foundation.js para "misma fila/
// columna" en el cortante por volado) -- si no, no es un caso de viga 1D
// válido sin importar la forma del contorno.
const COLUMNAS_COLINEALES_TOL_M = 0.5;

export function columnasSonColineales(columns) {
  if (!Array.isArray(columns) || columns.length < 2) return true;
  const xs = columns.map((c) => Number(c.x));
  const ys = columns.map((c) => Number(c.y));
  const spreadX = Math.max(...xs) - Math.min(...xs);
  const spreadY = Math.max(...ys) - Math.min(...ys);
  // Colineales en X (variación real en X, casi nada en Y) o en Y (viceversa).
  return spreadX <= COLUMNAS_COLINEALES_TOL_M || spreadY <= COLUMNAS_COLINEALES_TOL_M;
}

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

  if (countReflexVertices(points) > 1) {
    return [{ minX, maxX, minY, maxY }, { minX, maxX, minY, maxY }, { minX, maxX, minY, maxY }];
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

function flattenNumbersLocal(value) {
  if (value === null || value === undefined) return [];
  const flat = Array.isArray(value) ? value.flat(Infinity) : [value];
  return flat.map(Number).filter((n) => Number.isFinite(n));
}

/**
 * AGREGADO (ver conversación, "mejorar cortante zapata combinada"): a
 * partir de la nube de presión REAL que ya trae /zapatas2 (XX/YY/ZZ, ver
 * foundationContract.js normalizeZapatas2Resultados — la misma que pinta
 * zapataPressureLayer.js), construye una función `pressureAt(x)` que da
 * la presión PROMEDIO a lo ancho en la posición `x` a lo largo del eje
 * de la viga — reemplaza la presión ÚNICA (sigmaUlt, el máximo de TODA
 * la zapata aplicado parejo en todo el brazo) que se usaba antes.
 *
 * Proyecta cada punto de la nube sobre `axis`, lo agrupa en `binCount`
 * bandas a lo largo de [0,length] y promedia el σ de los puntos que caen
 * en cada banda. Bandas sin ningún punto (nube más dispersa que el
 * binning) heredan el valor de la banda no vacía más cercana — nunca se
 * deja un hueco sin dato. `pressureCloud.ZZByCombo[comboIndex]` debe ser
 * un array paralelo a XX/YY con la presión ya "neta" (mismo netSigma que
 * aplica foundation.js al escalar sigmaMaxByCombo, para que ambos sean
 * comparables). Si la nube no es utilizable (vacía, tamaño inconsistente,
 * o el combo no trae datos), devuelve `null` y el llamador cae de vuelta
 * a la presión uniforme de siempre — nunca se inventa una distribución.
 */
function buildAxialPressureLookup(pressureCloud, comboIndex, axis, origin, length, binCount = 40) {
  if (!pressureCloud || !(length > 0)) return null;

  const xs = flattenNumbersLocal(pressureCloud.XX);
  const ys = flattenNumbersLocal(pressureCloud.YY);
  const zs = flattenNumbersLocal(pressureCloud.ZZByCombo?.[comboIndex]);

  if (!xs.length || xs.length !== ys.length || xs.length !== zs.length) return null;

  const step = length / binCount;
  const sums = new Array(binCount + 1).fill(0);
  const counts = new Array(binCount + 1).fill(0);

  for (let i = 0; i < xs.length; i++) {
    const pos = (axis === "x" ? xs[i] : ys[i]) - origin;
    if (pos < -step || pos > length + step) continue; // fuera del brazo (con margen de una banda)
    const bin = Math.min(binCount, Math.max(0, Math.round(pos / step)));
    sums[bin] += zs[i];
    counts[bin] += 1;
  }

  const avg = sums.map((sum, i) => (counts[i] > 0 ? sum / counts[i] : null));

  for (let i = 0; i <= binCount; i++) {
    if (avg[i] !== null) continue;
    let left = i - 1;
    while (left >= 0 && avg[left] === null) left--;
    let right = i + 1;
    while (right <= binCount && avg[right] === null) right++;
    if (left >= 0 && right <= binCount) avg[i] = i - left <= right - i ? avg[left] : avg[right];
    else if (left >= 0) avg[i] = avg[left];
    else if (right <= binCount) avg[i] = avg[right];
  }

  if (avg.some((v) => v === null)) return null; // nube vacía por completo para este combo

  return (x) => {
    const t = Math.min(binCount, Math.max(0, x / step));
    const i0 = Math.floor(t);
    const i1 = Math.min(binCount, i0 + 1);
    const frac = t - i0;
    return avg[i0] * (1 - frac) + avg[i1] * frac;
  };
}

/** Interpolación lineal (con clamp a los extremos) sobre una tabla ordenada — usada para leer momentAt/shearAt en un punto exacto cuando la carga es la tabla numérica de buildDistributedLoadTable. */
function interpTable(xs, ys, x) {
  if (!xs.length) return 0;
  if (x <= xs[0]) return ys[0];
  if (x >= xs[xs.length - 1]) return ys[ys.length - 1];

  let lo = 0;
  let hi = xs.length - 1;
  while (lo < hi - 1) {
    const mid = (lo + hi) >> 1;
    if (xs[mid] <= x) lo = mid;
    else hi = mid;
  }

  const frac = (x - xs[lo]) / (xs[hi] - xs[lo]);
  return ys[lo] * (1 - frac) + ys[hi] * frac;
}

/**
 * Tabula q(x)=pressureAt(x)×width (carga distribuida real, Tn/m) en
 * `sampleCount+1` estaciones entre 0 y `length`, e integra vía trapecios
 * ACUMULADOS para obtener Q(x)=∫₀ˣq(s)ds (cortante de la carga
 * distribuida) y W(x)=∫₀ˣQ(s)ds (aporte de esa carga al momento, ya que
 * ∫₀ˣ(x−s)q(s)ds ≡ ∫₀ˣQ(s)ds por partes). Con q constante esto reproduce
 * exactamente la fórmula cerrada q·x²/2 (dentro del error de
 * discretización) — es la generalización de esa fórmula a una carga que
 * varía a lo largo de x en vez de ser uniforme.
 */
function buildDistributedLoadTable(pressureAt, width, length, sampleCount) {
  const xs = [];
  const Q = [];
  const W = [];
  let qPrev = 0;
  let Qacc = 0;
  let Wacc = 0;

  for (let i = 0; i <= sampleCount; i++) {
    const x = (length * i) / sampleCount;
    const q = pressureAt(x) * width;

    if (i > 0) {
      const dx = x - xs[i - 1];
      Qacc += ((q + qPrev) / 2) * dx;
      Wacc += ((Qacc + Q[i - 1]) / 2) * dx;
    }

    xs.push(x);
    Q.push(Qacc);
    W.push(Wacc);
    qPrev = q;
  }

  return { xs, Q, W };
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
 * AGREGADO (ver conversación, "mejorar cortante zapata combinada"): si se
 * pasa `pressureCloud` (la nube real de /zapatas2) y es utilizable,
 * `shearAt`/`cortanteMax` dejan de usar la carga uniforme (sigmaUlt en
 * TODO el brazo) y pasan a leer una tabla numérica (buildDistributedLoadTable)
 * con la presión real. `momentAt` (y por tanto `momentoPositivoMax`/
 * `momentoNegativoMax`/el Strip Based Design que lo reusa) NO se toca —
 * sigue con la fórmula cerrada de siempre, ya validada contra el Ejemplo
 * 9-1 de Bowles y contra ETABS real vía Strip Based — para no reabrir esa
 * validación sin necesidad. Si la nube no es utilizable, el cortante
 * también cae a la fórmula cerrada (comportamiento 100% igual al de antes
 * de este cambio).
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
  sampleCount = 200,
  pressureCloud = null,
  comboIndex = 0
) {
  const spanX = leg.maxX - leg.minX;
  const spanY = leg.maxY - leg.minY;
  const beamAxis = spanX >= spanY ? "x" : "y";
  const length = Math.max(spanX, spanY);
  const width = Math.min(spanX, spanY) || 0;
  const origin = beamAxis === "x" ? leg.minX : leg.minY;
  const momentExpression = beamAxis === "x" ? momentExpressionY : momentExpressionX;

  const q = (Number(sigmaUlt) || 0) * width; // Tn/m, uniforme -- fallback si no hay nube de presión utilizable

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

  // IMPORTANTE: `momentAt` (fórmula cerrada, q uniforme) NO se toca acá a
  // propósito -- lo usa `computeColumnStripMoment()` para el Strip Based
  // Design (My), ya consolidado como método OFICIAL y validado contra
  // ETABS real (0.26-5.2%, ver conversación) usando exactamente esta
  // fórmula. Cambiarlo también reabriría esa validación sin necesidad --
  // lo único que Jack pidió mejorar es el CORTANTE, así que la presión
  // real (cuando esté disponible) se aplica SOLO a `shearAt`/`cortanteMax`.
  const momentAt = (x) =>
    (q * x * x) / 2 -
    pointLoads.reduce((sum, load) => (load.position <= x ? sum + load.p * (x - load.position) : sum), 0) +
    pointLoads.reduce((sum, load) => (load.position <= x ? sum + load.m : sum), 0);

  const pressureAt = buildAxialPressureLookup(pressureCloud, comboIndex, beamAxis, origin, length);

  let shearAt;
  const usedRealPressure = Boolean(pressureAt);

  if (pressureAt) {
    // V(x) = dM/dx: acá la parte de la carga distribuida sale de la tabla
    // numérica (Q(x)=∫q, con q(x)=presión REAL×ancho) en vez de q·x
    // constante — usado por Bloque 6 (footingShear.js) para el chequeo de
    // cortante por flexión de zapatas combinadas.
    const table = buildDistributedLoadTable(pressureAt, width, length, sampleCount);
    shearAt = (x) =>
      interpTable(table.xs, table.Q, x) -
      pointLoads.reduce((sum, load) => (load.position <= x ? sum + load.p : sum), 0);
  } else {
    // V(x) = dM/dx = q·x − Σ Pᵢ (para cada columna ya pasada) — comportamiento
    // de siempre, cuando no hay nube de presión utilizable para este combo.
    shearAt = (x) =>
      q * x - pointLoads.reduce((sum, load) => (load.position <= x ? sum + load.p : sum), 0);
  }

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

  // AGREGADO (ver conversación, "Strip Based Design" ACI/SAFE): se expone
  // `momentAt` (la misma función interna, con `q`/`pointLoads` de ESTE
  // combo ya cerrados en el closure) para que el llamador pueda evaluar
  // el momento total en cualquier punto exacto (ej. la cara de columna)
  // sin recalcular ni duplicar la fórmula -- usado por
  // `computeColumnStripMoment()` más abajo, una sola fuente de verdad.
  return {
    momentoPositivoMax,
    momentoNegativoMax,
    cortanteMax,
    beamAxis,
    length,
    width,
    origin,
    momentProfile,
    momentAt,
    usedRealPressure, // true si se usó la nube real de /zapatas2 en vez de sigmaUlt uniforme -- ver conversación
  };
}

/**
 * Ancho de franja de columna, regla clásica ACI para losas de 2 vías
 * (medio-ancho de franja = min(l1/4, l2/4) por lado, l1=luz adyacente en
 * la dirección de la viga, l2=ancho perpendicular de la zapata) -- misma
 * regla que documentación oficial de CSI confirma que usa "Strip Based
 * Design" de SAFE/ETABS (Integrated Strip Forces: momento TOTAL de la
 * franja, integral tipo trapecio de M11/M22, dividido entre este ancho —
 * NO el ancho completo de la zapata). Ver conversación para las fuentes.
 */
function columnStripWidthTotal(spanAdyacente, footingWidth) {
  if (!(spanAdyacente > 0) || !(footingWidth > 0)) return null;
  return 2 * Math.min(spanAdyacente / 4, footingWidth / 4);
}

/**
 * Momento Mx por CARA de columna vía "Strip Based Design" (franja de
 * columna) -- alternativa a `Mx_diseno` (FEM puntual) y al método rígido
 * de ancho completo, para el caso específico donde ambos fallan: columna
 * de un vano corto (ver `columna_x_afectada`/`vano_corto` en
 * `zapata_shell_solver.py`).
 *
 * VALIDADO (2026-08-28) contra F10 real (`.e2k` real + la MISMA
 * `computeContinuousBeamMoment` ya en producción, no una reimplementación
 * aparte): columna interior con un lado de tramo largo/normal (columna
 * 20, span corto=2m hacia un lado / span largo=7m hacia el otro) mejoró
 * de 55-61% de error contra ETABS real a solo 3-11% -- la mejor
 * corrección de Mx longitudinal de todo el proyecto hasta ahora.
 *
 * NO VALIDADO / NO USAR todavía para columnas que ADEMÁS estén cerca de
 * un borde libre (región D) -- probado contra F12 (2 columnas, ambas a
 * 0.55×peralte de un borde libre): ni siquiera el SIGNO sale correcto,
 * en ninguna de las 4 caras. Por eso `foundation.js` solo debe llamar
 * esto para caras marcadas `vano_corto` y EXPLÍCITAMENTE NO `region_d`.
 *
 * `columnsInLeg` debe venir ORDENADO por posición a lo largo de la viga
 * (mismo orden que se le pasa a `computeContinuousBeamMoment`) para poder
 * determinar el span adyacente de cada lado. `columnSizeAlongBeam` es el
 * ancho de la columna medido en la dirección de la viga (bx si
 * beamAxis==='x', by si beamAxis==='y' -- ver `getColumnSectionSize`).
 */
export function computeColumnStripMoment(momentByCombo, columnsInLeg, columnIndex, columnSizeAlongBeam) {
  const col = columnsInLeg[columnIndex];
  if (!col || !momentByCombo?.momentAt) return null;

  const half = (Number(columnSizeAlongBeam) || 0) / 2;
  const prev = columnsInLeg[columnIndex - 1];
  const next = columnsInLeg[columnIndex + 1];
  // Span adyacente = distancia CENTRO a CENTRO con el vecino -- si no hay
  // vecino de ese lado (columna en el extremo, mirando hacia el volado/
  // borde libre), no se calcula franja: ya sabemos que ahí no funciona
  // (ver docstring), y ese lado normalmente ya cae en región D de todos
  // modos.
  const spanMenos = prev ? col.position - prev.position : null;
  const spanMas = next ? next.position - col.position : null;

  const evalCara = (xCara, spanAdyacente) => {
    if (spanAdyacente == null) return null;
    const totalEnCara = momentByCombo.momentAt(xCara);
    const anchoFranja = columnStripWidthTotal(spanAdyacente, momentByCombo.width);
    if (!anchoFranja) return null;
    return {
      perMetro: totalEnCara / anchoFranja,
      anchoFranja,
      span: spanAdyacente,
    };
  };

  return {
    menosX: evalCara(col.position - half, spanMenos),
    masX: evalCara(col.position + half, spanMas),
  };
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

  // AGREGADO (ver conversación, "zapata trapezoidal combinada" 2026-09-05
  // -- M11 disparado en un extremo, caso real): si el vértice de un
  // extremo del polígono cae JUSTO en minX (o maxX) -- un trapecio real
  // no tiene por qué tener sus 2 lados "cortos" perfectamente alineados
  // en x, basta con que UNO de sus 4 vértices sea el más extremo -- las 2
  // aristas que tocan ese vértice se cuentan como "cruce" ahí mismo, dos
  // veces, dando el MISMO valor de Y las dos veces => B0 (o B1) sale 0 en
  // vez del ancho real. Con B0=0, `calcular_zapata_shell_trapezoidal_
  // combinada` divide por un ancho que arranca en cero (k=B'/B(x) se va a
  // infinito cerca de x=0) -- de ahí el momento disparado justo en ESE
  // extremo. Fix: samplear un poco ADENTRO del extremo (nunca exacto
  // sobre minX/maxX) para que el corte SIEMPRE cruce las 2 aristas reales
  // del contorno, no un solo vértice degenerado -- para un trapecio bien
  // formado (extremo con 2 vértices alineados) el resultado es
  // prácticamente idéntico (el ancho cambia una fracción despreciable en
  // ese épsilon), así que no afecta ningún caso ya validado.
  const EPS = Math.max(length * 1e-4, 1e-4);
  const c0 = crossingsAt(origin + EPS);
  const c1 = crossingsAt(origin + length - EPS);
  const B0 = c0.length >= 2 ? Math.max(...c0) - Math.min(...c0) : 0;
  const B1 = c1.length >= 2 ? Math.max(...c1) - Math.min(...c1) : 0;
  const center0 = c0.length >= 2 ? (Math.max(...c0) + Math.min(...c0)) / 2 : 0;
  const center1 = c1.length >= 2 ? (Math.max(...c1) + Math.min(...c1)) / 2 : 0;

  // AGREGADO (ver conversación, "zapata trapezoidal ancho casi constante"
  // 2026-09-05): el polígono real en el MISMO sistema local (x a lo largo
  // del eje de la viga, desde 0; y = coordenada perpendicular CRUDA, sin
  // restar ninguna línea central) que espera el parámetro `poligono` de
  // calcular_zapata_shell_trapezoidal_combinada — ese solver ya no asume
  // una conicidad lineal B0+B'x, sino que MUESTREA el ancho real (y su
  // propio centro) directamente de este polígono en cada columna de malla,
  // necesario para casos reales donde el ancho no varía linealmente en
  // toda la longitud (ver esa función para el detalle).
  const localPoints = points.map((point) => {
    const along = (beamAxis === "x" ? point.x : point.y) - origin;
    const perp = beamAxis === "x" ? point.y : point.x;
    return { x: along, y: perp };
  });

  return { beamAxis, length, origin, B0, B1, center0, center1, localPoints };
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
 *
 * AGREGADO (ver conversación, "mejorar cortante zapata combinada"): si se
 * pasa `pressureCloud` (la nube real de /zapatas2) y es utilizable, cada
 * estación usa la presión REAL en ese punto (`pressureAt(x)`) en vez de
 * `sigma` uniforme — el ancho `widthAt(x)` sigue siendo el real, variable,
 * de siempre. Si la nube no es utilizable, cae a `sigma` uniforme
 * (comportamiento idéntico al de antes de este cambio).
 */
export function computeTrapezoidalBeamMoment(
  polygonPoints,
  columnsInPolygon,
  sigmaUlt,
  axialExpression,
  momentExpressionX,
  momentExpressionY,
  sampleCount = 400,
  pressureCloud = null,
  comboIndex = 0
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

  const pressureAt = buildAxialPressureLookup(pressureCloud, comboIndex, beamAxis, origin, length);
  const usedRealPressure = Boolean(pressureAt);
  const sigmaAt = pressureAt || (() => sigma); // fallback: presión uniforme de siempre si la nube no es utilizable

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
  let shear = 0; // acumulado con sigma UNIFORME -- alimenta el momento, sin tocar (ver nota abajo)
  let shearReal = 0; // acumulado con la presión REAL cuando está disponible -- alimenta SOLO cortanteMax
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

    // Carga para el MOMENTO: siempre sigma uniforme, a propósito NO se
    // toca acá -- ver el mismo motivo documentado en
    // computeContinuousBeamMoment (no reabrir la validación del Strip
    // Based Design, que reusa momentProfile/este momento de respaldo).
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
    momentProfile.push({ x: x1, moment });

    // Carga para el CORTANTE de diseño (Bloque 6): presión REAL cuando
    // `sigmaAt` viene de la nube (ver conversación, "mejorar cortante
    // zapata combinada"); si no hay nube utilizable, sigmaAt===()=>sigma
    // y esto queda idéntico al comportamiento de siempre.
    const qr0 = sigmaAt(x0) * widthAt(x0);
    const qr1 = sigmaAt(x1) * widthAt(x1);
    shearReal += ((qr0 + qr1) / 2) * step;
    pointLoads.forEach((load) => {
      if (load.position > x0 && load.position <= x1) shearReal -= load.p;
    });
    cortanteMax = Math.max(cortanteMax, Math.abs(shearReal));
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
    usedRealPressure, // true si se usó la nube real de /zapatas2 en vez de sigma uniforme -- ver conversación
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
 *
 * AGREGADO (ver conversación, "mejorar cortante zapata combinada"):
 * `pressureCloud` (opcional) es la nube real de presión de /zapatas2
 * (`{XX, YY, ZZByCombo}`, ver buildAxialPressureLookup más arriba) — se
 * pasa tal cual a cada llamada de computeTrapezoidalBeamMoment/
 * computeContinuousBeamMoment junto con el índice del combo, para que la
 * carga distribuida deje de ser sigmaMax uniforme en todo el brazo y pase
 * a ser la distribución real. Si no se pasa (o no es utilizable), el
 * comportamiento es IDÉNTICO al de antes de este cambio.
 */
export function computeCombinedFootingMoments(
  polygonPoints,
  columnsInPolygon,
  loadCombinations,
  sigmaMaxByCombo,
  pressureCloud = null
) {
  // AGREGADO (ver conversación, "cada figura agrega un caso" -- caso real:
  // trapecio con 4 columnas en cuadrícula 2x2, MISMO problema de fondo que
  // el triángulo F3, pero entrando por la puerta de isTrapezoidalFooting
  // en vez de la de "1 solo brazo" -- ver columnasSonColineales más abajo,
  // que antes solo se chequeaba DESPUÉS de descartar trapezoidal). Se
  // sube el chequeo al PRINCIPIO de la función, antes de CUALQUIER
  // clasificación de forma (trapezoidal, rectangular, etc.) -- así
  // ninguna figura, sin importar cuántos lados tenga, puede colarse al
  // método rígido de viga 1D con columnas que no están realmente
  // alineadas en una recta. Esto reemplaza el chequeo puntual que antes
  // solo vivía en la rama "legs.length === 1" (ver abajo).
  if (!columnasSonColineales(columnsInPolygon)) {
    return { supported: false, reason: "branching", legs: null };
  }

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
              combo.column3,
              400,
              pressureCloud,
              comboIndex
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

  // NOTA: el chequeo de columnas no colineales que vivía aquí (solo para
  // el caso "1 solo brazo") se subió al principio de la función -- ver
  // comentario grande ahí, cubre esta rama Y la de isTrapezoidalFooting
  // por igual, así que llegar aquí ya garantiza columnas colineales.

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
          combo.column3,
          200,
          pressureCloud,
          comboIndex
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
