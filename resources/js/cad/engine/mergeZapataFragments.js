// resources/js/cad/engine/mergeZapataFragments.js
//
// AGREGADO (ver conversación, "zapata dividida con Divide Shells" — caso
// real de Jack/cliente, probando el import contra ETABS): ETABS permite
// dividir un objeto AREA en varios más chicos (Edit → Edit Areas → Divide
// Shells, ej. "Divide Quadrilaterals into 1 by 2 Areas") — para ETABS
// sigue siendo la MISMA losa (comparten nodos exactos en los cortes, se
// analiza como una pieza continua), pero nuestro importador (e2k-import.js)
// trae cada AREA como su propio objeto independiente. Si son zapatas,
// cada pedazo se importaba como su PROPIA zapata aislada con los 4 bordes
// libres — donde en realidad hay continuidad estructural real con el
// pedazo vecino. Confirmado con datos reales: una zapata combinada de 3
// columnas dividida en 5 rectángulos (F19-F23) daba, justo en un borde
// interno, 0.287 Tonf·m/m en vez de los 7.5298 reales de la tabla cruda
// de ETABS — no era un problema de precisión FEM, era estar resolviendo
// la geometría equivocada (5 zapatas sueltas en vez de 1 combinada).
//
// Esta función reconstruye la zapata original: agrupa piezas del MISMO
// story+sección de losa que comparten al menos una ARISTA completa (2
// vértices consecutivos idénticos, ya redondeados a 3 decimales por el
// import — comparación exacta, no aproximada) y las fusiona en un solo
// polígono. El principio es el mismo que "extraer el contorno de una
// malla": una arista que aparece en 2 piezas del grupo es INTERNA (se
// cancela); una que aparece en 1 sola es del CONTORNO exterior.

function edgeKey(p1, p2) {
  const a = `${p1.x},${p1.y},${p1.z}`;
  const b = `${p2.x},${p2.y},${p2.z}`;
  return a < b ? `${a}|${b}` : `${b}|${a}`;
}

function pointKey(p) {
  return `${p.x},${p.y},${p.z}`;
}

/**
 * Reconstruye el polígono (vértices en orden) a partir de un conjunto de
 * aristas de borde SIN ordenar. Exige que sea un lazo simple: cada
 * vértice del contorno debe tener EXACTAMENTE 2 aristas de borde
 * conectadas. Si no (nodo colgante, "T", más de un lazo separado — una
 * subdivisión rara, no la reja regular esperada), devuelve `null` —
 * mejor no fusionar que fusionar mal (mismo principio que el resto del
 * proyecto: ocultar/omitir antes que mostrar geometría incorrecta).
 */
function traceBoundary(edges) {
  if (!edges.length) return null;

  const adjacency = new Map(); // pointKey -> [{point, key}]
  edges.forEach((e) => {
    const k1 = pointKey(e.p1);
    const k2 = pointKey(e.p2);
    if (!adjacency.has(k1)) adjacency.set(k1, []);
    if (!adjacency.has(k2)) adjacency.set(k2, []);
    adjacency.get(k1).push({ point: e.p2, key: k2 });
    adjacency.get(k2).push({ point: e.p1, key: k1 });
  });

  for (const list of adjacency.values()) {
    if (list.length !== 2) return null;
  }

  const startKey = adjacency.keys().next().value;
  const start = edges.find((e) => pointKey(e.p1) === startKey || pointKey(e.p2) === startKey);
  const startPoint = pointKey(start.p1) === startKey ? start.p1 : start.p2;

  const polygon = [startPoint];
  let prevKey = null;
  let currentKey = startKey;

  while (true) {
    const neighbors = adjacency.get(currentKey);
    const next = neighbors.find((n) => n.key !== prevKey) || neighbors[0];
    if (next.key === startKey) break;
    polygon.push(next.point);
    prevKey = currentKey;
    currentKey = next.key;
    if (polygon.length > adjacency.size + 1) return null; // salvaguarda anti-loop infinito
  }

  if (polygon.length !== adjacency.size) return null; // más de un lazo separado

  return polygon;
}

/**
 * Elimina vértices redundantes (colineales con sus 2 vecinos) — el
 * trazado de arriba deja, por ejemplo, un lado recto largo dividido en
 * varios segmentos cortos (uno por cada corte interno cancelado); esto
 * los junta en un solo lado, sin cambiar la forma. Puramente cosmético
 * (no afecta área ni pointInPolygon), pero deja un polígono más limpio
 * para editar en el CAD.
 */
function simplifyCollinear(polygon, eps = 1e-6) {
  if (polygon.length <= 3) return polygon;
  const out = [];
  const n = polygon.length;
  for (let i = 0; i < n; i++) {
    const prev = polygon[(i - 1 + n) % n];
    const curr = polygon[i];
    const next = polygon[(i + 1) % n];
    const cross = (curr.x - prev.x) * (next.y - prev.y) - (curr.y - prev.y) * (next.x - prev.x);
    if (Math.abs(cross) > eps) out.push(curr);
  }
  return out.length >= 3 ? out : polygon;
}

/**
 * AGREGADO (ver conversación, "arréglalo antes de decidir con las fases" --
 * Jack comparó el import contra ETABS: en ETABS las piezas de Divide Shells
 * se SIGUEN viendo y editando como AREA separadas, mientras que fusionarlas
 * en una sola AREA al importar (lo que hacía `mergeZapataFragments` de
 * abajo cuando se llamaba desde e2k-import.js) le hacía perder esa
 * correspondencia visual 1 a 1 con el modelo de ETABS -- además de que una
 * zapata resultante muy irregular (ej. el mat de 21 piezas F19-F39) no
 * siempre entra en las ramas de FEM combinada/en L ya existentes
 * (`computeLFootingGeometry` solo resuelve UN rincón faltante, no una
 * "escalera" de varios), así que fusionar en el modelo geométrico de forma
 * permanente arriesgaba computar Bloques 3b/5/6 sobre una forma que esas
 * funciones nunca fueron pensadas para recibir.
 *
 * La solución: separar el AGRUPAMIENTO (qué piezas son estructuralmente
 * la misma zapata) de la FUSIÓN GEOMÉTRICA (reemplazar N piezas por 1 sola
 * AREA). `groupConnectedZapatas()` de abajo hace solo lo primero y es lo
 * que debe usar cualquier cálculo (ver mixins/analysis/foundation.js) --
 * el modelo (`model.areas`) se queda con las piezas tal cual las trajo el
 * import, igual que las ve ETABS. `mergeZapataFragments()` (la fusión
 * geométrica completa) se conserva para quien la necesite, pero ya NO se
 * llama desde el import.
 */

/**
 * Encuentra los clusters de zapatas conectadas por arista completa, del
 * MISMO nivel (z) y la MISMA sección de losa asignada (si difieren, no son
 * "la misma zapata dividida", son zapatas distintas que casualmente son
 * vecinas). Cada zapata de entrada queda en EXACTAMENTE un cluster --
 * incluidas las que no comparten arista con nadie (cluster de 1 sola
 * pieza, el caso normal).
 *
 * @param {Array} zapatas - áreas ya filtradas por `areaType === "zapata"`.
 * @returns {Array<Array>} - lista de clusters (cada uno, un arreglo de
 *   1 o más áreas).
 */
function findConnectedClusters(zapatas) {
  const groupKey = (a) => `${a.z}|${a.slabSection || ""}`;
  const byGroup = new Map();
  zapatas.forEach((a) => {
    const key = groupKey(a);
    if (!byGroup.has(key)) byGroup.set(key, []);
    byGroup.get(key).push(a);
  });

  const allClusters = [];

  for (const group of byGroup.values()) {
    if (group.length < 2) {
      allClusters.push(group);
      continue;
    }

    // Union-Find sobre las piezas del grupo: dos piezas quedan en el
    // mismo cluster si comparten al menos 1 arista completa. Una zapata
    // dividida en 5 pedazos en fila no comparte arista entre TODOS los
    // pares (solo con el vecino inmediato) — hay que propagar la
    // conexión transitivamente, no solo mirar pares directos.
    const parent = new Map(group.map((a) => [a, a]));
    const find = (a) => {
      while (parent.get(a) !== a) a = parent.get(a);
      return a;
    };
    const union = (a, b) => {
      const ra = find(a);
      const rb = find(b);
      if (ra !== rb) parent.set(ra, rb);
    };

    const edgeAreas = new Map(); // edgeKey -> [area, ...]
    group.forEach((area) => {
      const pts = area.points;
      for (let i = 0; i < pts.length; i++) {
        const p1 = pts[i];
        const p2 = pts[(i + 1) % pts.length];
        const key = edgeKey(p1, p2);
        if (!edgeAreas.has(key)) edgeAreas.set(key, []);
        edgeAreas.get(key).push(area);
      }
    });
    edgeAreas.forEach((list) => {
      if (list.length === 2) union(list[0], list[1]);
    });

    const clusters = new Map(); // root -> [areas]
    group.forEach((a) => {
      const root = find(a);
      if (!clusters.has(root)) clusters.set(root, []);
      clusters.get(root).push(a);
    });

    allClusters.push(...clusters.values());
  }

  return allClusters;
}

/**
 * Agrupa zapatas conectadas (mismo criterio que `mergeZapataFragments`,
 * ver arriba) SIN tocar el modelo -- para cada cluster de 2+ piezas,
 * calcula el polígono fusionado (trazando el contorno) pero NO reemplaza
 * las áreas originales. Pensado para el CÁLCULO (mixins/analysis/
 * foundation.js), donde hace falta la geometría/columnas del conjunto
 * completo aunque el modelo siga mostrando cada AREA por separado.
 *
 * @param {Array} areas - todas las áreas ya parseadas por el import.
 * @returns {Array<{areas: Array, polygon: Array}>} - un grupo por cada
 *   zapata de entrada: `polygon` es el contorno fusionado (mismos puntos
 *   que `areas[0].points` si el grupo es de 1 sola pieza, o si el trazado
 *   del contorno falló -- ver abajo).
 */
export function groupConnectedZapatas(areas) {
  const zapatas = (areas || []).filter((a) => a?.areaType === "zapata" && (a.points || []).length >= 3);
  const clusters = findConnectedClusters(zapatas);
  const grupos = [];

  for (const cluster of clusters) {
    if (cluster.length < 2) {
      grupos.push({ areas: cluster, polygon: cluster[0].points });
      continue;
    }

    // Aristas de borde del cluster: las que aparecen UNA sola vez entre
    // TODAS sus piezas (las que aparecen 2 veces son internas, ya
    // canceladas por definición al ser compartidas dentro del cluster).
    const clusterEdgeCount = new Map();
    cluster.forEach((area) => {
      const pts = area.points;
      for (let i = 0; i < pts.length; i++) {
        const p1 = pts[i];
        const p2 = pts[(i + 1) % pts.length];
        const key = edgeKey(p1, p2);
        const entry = clusterEdgeCount.get(key);
        if (entry) entry.count += 1;
        else clusterEdgeCount.set(key, { count: 1, p1, p2 });
      }
    });

    const boundaryEdges = [...clusterEdgeCount.values()].filter((e) => e.count === 1);
    const rawPolygon = traceBoundary(boundaryEdges);

    if (!rawPolygon) {
      console.warn(
        "⚠️ No se pudo agrupar un conjunto de zapatas divididas (Divide Shells) para el cálculo -- el borde no forma un solo lazo simple. Se calculan como piezas separadas:",
        cluster.map((a) => a.id)
      );
      cluster.forEach((a) => grupos.push({ areas: [a], polygon: a.points }));
      continue;
    }

    grupos.push({ areas: cluster, polygon: simplifyCollinear(rawPolygon) });
  }

  return grupos;
}

/**
 * @param {Array} areas - todas las áreas ya parseadas por el import (con
 *   `.areaType`, `.points` [{x,y,z,...}], `.z`, `.slabSection`).
 * @returns {Array} - mismo arreglo, con los grupos de zapatas fragmentadas
 *   reemplazados por una sola área fusionada cada uno. Áreas no-zapata, o
 *   zapatas que no comparten arista con ninguna otra, quedan intactas
 *   (mismo objeto, sin copiar) — el caso normal (una zapata = un AREA)
 *   no se toca en absoluto. Ya NO se usa desde el import (ver comentario
 *   arriba) -- se conserva por si algún flujo futuro necesita la fusión
 *   geométrica real, no solo el agrupamiento.
 */
export function mergeZapataFragments(areas) {
  const grupos = groupConnectedZapatas(areas);
  const toRemove = new Set();
  const toAdd = [];

  grupos.forEach((grupo) => {
    if (grupo.areas.length < 2) return; // ya es una sola pieza, nada que fusionar
    toAdd.push({ ...grupo.areas[0], points: grupo.polygon });
    grupo.areas.forEach((a) => toRemove.add(a));
  });

  if (!toAdd.length) return areas;

  console.log(
    `📐 ${toAdd.length} zapata(s) reconstruida(s) a partir de piezas divididas (Divide Shells de ETABS) -- ${toRemove.size} piezas fusionadas.`
  );

  return areas.filter((a) => !toRemove.has(a)).concat(toAdd);
}
