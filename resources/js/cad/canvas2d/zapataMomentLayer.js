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
export const SHEAR_COMPONENTS = new Set(["v13", "v23", "vmax"]);

// AGREGADO (ver conversación, "revisa por completo los signos de las
// magnitudes" 2026-09-12): diagnóstico de signo contra ETABS real en 2
// casos (F13 corte_L, F13 6cortes) mostró que M11/M22/MMax/VMax aciertan
// el signo 98-100% de las veces (sin bug sistemático de convención), pero
// M12 y MMin fallan puntualmente (94-99%) EXCLUSIVAMENTE a <0.35m de una
// columna -- mismo fenómeno de "corner forces" que ya justifica el aviso
// de V13/V23/VMax (isPointNearColumnForShear): cerca de una carga puntual,
// M12 y el cortante cambian de signo muy rápido en un radio chico, y un
// desfase de malla entre nuestro solver y ETABS basta para que el punto
// de comparación más cercano caiga del lado equivocado del cruce por
// cero. MMin (Mohr, mezcla M11/M22/M12) hereda el mismo problema por
// depender de M12. Set aparte de SHEAR_COMPONENTS porque unidad/escala de
// color de M12/MMin siguen siendo las de momento, no de cortante -- esto
// solo alimenta el aviso de "cerca de columna" en el hover (renderer.js).
export const COLUMN_SIGN_SENSITIVE_COMPONENTS = new Set(["m12", "mmin", "v13", "v23", "vmax"]);

// AGREGADO (ver conversación): misma nomenclatura que ETABS (M11/M22/M12)
// en vez de Mx/My/Mxy — el ingeniero compara estos valores directo contra
// las lecturas de ETABS, y ahí no existe "Mx", existe "M11". MMax/MMin/
// VMax: resultantes derivadas (Mohr para momentos, √(V13²+V23²) para
// cortante) — igual selector "Component" que ETABS, ver zapata_shell_solver.py.
// REVERTIDO (ver conversación, "por el momento no pongas V13/V23/VMax
// como referencia" 2026-09-11): el sufijo "(ref.)" que llevaban estos 3
// (agregado el 2026-09-10 porque el cortante transversal de una placa
// Kirchhoff no reproduce el de la Mindlin de ETABS cerca de una columna o
// un vértice de corte -- singularidad real, ~2-10x, ~12 enfoques
// probados sin cerrarla) se saca a pedido de Jack. El hallazgo sigue
// documentado en project_zapata_hueco_malla_conforme.md y los avisos de
// hover cerca de columnas/cortes SIGUEN activos -- solo se quita el
// rótulo permanente en selector/hover/leyenda.
const COMPONENT_LABELS = {
  mx: "M11", my: "M22", mxy: "M12", mmax: "MMax", mmin: "MMin",
  v13: "V13", v23: "V23", vmax: "VMax",
  // AGREGADO (ver conversación, "comparar el método rígido completo contra
  // ETABS"): opciones separadas para pintar el CAMPO COMPLETO del método
  // rígido (Bloque 3) en toda la zapata, no solo el respaldo puntual que
  // ya se muestra en los huecos del FEM (borde de malla/columna) -- sirve
  // para validar qué tan preciso es fuera de la cara de columna, el único
  // punto donde el valor escalar de diseño sí fue validado extensamente.
  "mx-rigido": "M11 (rígido)", "my-rigido": "M22 (rígido)",
};

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

  // AGREGADO (ver conversación, "8 componentes en combinadas" 2026-08-31):
  // mismo campo FEM real (elementos finitos) que "isolated-fem", ahora
  // también para zapatas combinadas de un solo brazo recto (ver
  // calcular_zapata_shell_combinada) -- ya es la envolvente FEM, ignora
  // comboIndex igual que la aislada.
  if (momentField.type === "isolated-fem" || momentField.type === "combined-fem") {
    // QUITADO (ver conversación): "mx-rigido"/"my-rigido" (campo COMPLETO
    // del método rígido como modo seleccionable aparte) -- ya no existe
    // ninguna opción en el selector que pida esta clave, ver toolbar.blade.php.
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

// AGREGADO (ver conversación): percentil simple sobre un array YA
// ordenado — interpolación lineal entre los 2 valores más cercanos (mismo
// criterio "tipo numpy.percentile" de los scripts de scratchpad que ya
// probamos contra F10/F12 antes de tocar este archivo).
function percentile(sortedValues, p) {
  const n = sortedValues.length;
  if (n === 0) return 0;
  if (n === 1) return sortedValues[0];
  const idx = (p / 100) * (n - 1);
  const lo = Math.floor(idx);
  const hi = Math.ceil(idx);
  if (lo === hi) return sortedValues[lo];
  const frac = idx - lo;
  return sortedValues[lo] * (1 - frac) + sortedValues[hi] * frac;
}

/**
 * Rango de color (cmin/cmax) sobre TODOS los polígonos a la vez, para que
 * un mismo color signifique el mismo momento al comparar zapatas
 * distintas — mismo criterio que computeSigmaColorRange.
 *
 * AGREGADO (ver conversación): recorte por percentil en vez de min/max
 * crudo — el mismo problema que ya resolvimos en los scripts de
 * comparación visual (graficar.py/prueba.py): un pico puntual cerca de
 * una columna o de un borde libre (Región D, la misma singularidad ya
 * documentada en todo el proyecto) estira la escala y aplasta el resto de
 * la losa en un solo color. El VALOR real de cada celda no cambia en
 * absoluto (esto es solo el rango de colores con el que se pinta) — el
 * hover y los números siguen mostrando el dato crudo sin recortar.
 * Percentil más angosto para cortante (10-90) que para momento (3-97)
 * porque el pico de cortante ocupa una FRANJA completa de borde, no un
 * punto aislado como el de momento (ver memoria del proyecto, sección de
 * cortante de zapatas combinadas) — un percentil angosto para momento
 * recortaría demasiado el detalle útil del resto de la losa.
 */
export function computeMomentColorRange(polygons, comboIndex, direction) {
  const allValues = (polygons || []).flatMap((polygon) =>
    getMomentValuesForCombo(polygon.momentField, comboIndex, direction)
  );

  if (!allValues.length) return { cmin: 0, cmax: 1 };

  const sorted = [...allValues].sort((a, b) => a - b);
  const [pLow, pHigh] = SHEAR_COMPONENTS.has(direction) ? [10, 90] : [3, 97];
  let cmin = percentile(sorted, pLow);
  let cmax = percentile(sorted, pHigh);

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
  const isFem = polygon.momentField?.type === "isolated-fem" || polygon.momentField?.type === "combined-fem";
  const xs = isFem ? (polygon.momentField.x || []) : flattenNumeric(polygon.XX);
  const ys = isFem ? (polygon.momentField.y || []) : flattenNumeric(polygon.YY);
  const values = getMomentValuesForCombo(polygon.momentField, comboIndex, direction);
  const range = cmax - cmin || 1e-6;

  // AGREGADO (ver conversación, "rellenar huecos del FEM con rígido"): el
  // respaldo rígido SOLO existe para mx/my (el método rígido no tiene
  // torsión ni cortante) -- `null` para cualquier otra componente, y el
  // hover simplemente no tendrá nada que ofrecer ahí (se mantiene el
  // aviso sin relleno).
  const rigidSeries =
    direction === "my" ? polygon.momentField?.rigidMy : direction === "mx" ? polygon.momentField?.rigidMx : null;

  const bins = new Map();
  const validXs = [];
  const validYs = [];
  // Paralelo a validXs/validYs — para el índice de hover (no se puede usar
  // `values` directo, tiene el largo original sin filtrar).
  const validMs = [];
  const validRigid = [];

  for (let i = 0; i < xs.length; i++) {
    const x = xs[i];
    const y = ys[i];
    const m = values[i];
    if (!Number.isFinite(x) || !Number.isFinite(y) || !Number.isFinite(m)) continue;

    validXs.push(x);
    validYs.push(y);
    validMs.push(m);
    validRigid.push(Number.isFinite(rigidSeries?.[i]) ? rigidSeries[i] : null);

    const t = Math.min(1, Math.max(0, (m - cmin) / range));
    const binIndex = Math.round(t * (COLOR_BINS - 1));

    if (!bins.has(binIndex)) {
      const scaleIndex = Math.round((binIndex / (COLOR_BINS - 1)) * (matlabColorScale.length - 1));
      bins.set(binIndex, { color: matlabColorScale[scaleIndex][1], points: [] });
    }

    bins.get(binIndex).points.push({ x, y });
  }

  // AGREGADO (ver conversación, "rayas + hover roto en zapata trapezoidal
  // con conicidad marcada" 2026-09-05): el tamaño de celda se deriva del
  // MISMO índice de hover (buildGridIndex, ver zapataGridIndex.js -- ahí
  // stepY ya usa el paso REAL por columna, no el paso global contaminado
  // por el intercalado entre columnas de ancho distinto) en vez de
  // recalcularlo por separado con estimateGridStep(validYs) -- antes,
  // ambos números podían salir distintos y los dos mal para una zapata
  // trapezoidal con conicidad marcada (el de pintado daba las "rayas"
  // horizontales, el del hover el punto sin acertar nunca).
  // AGREGADO (ver conversación, "hover roto en zapata aislada poligonal"):
  // solo `calcular_zapata_shell_poligono_aislado` usa malla en abanico
  // (triangulada, sin paso de grilla constante) -- se distingue por
  // `meshType: "fan"` (ver foundation.js, se marca solo para esa rama;
  // la aislada RECTANGULAR y las combinadas siguen con grilla normal).
  // AGREGADO (ver conversación, "no vota magnitudes al pasar el cursor" --
  // zapata trapezoidal con 2 cortes, 2026-09-10): "conforme" (malla
  // conforme al hueco, triangulación restringida) es igual de irregular
  // que "fan" (abanico) para efectos del índice -- ninguna tiene un paso
  // de grilla constante, así que ambas necesitan el índice de vecino más
  // cercano en vez del lookup exacto por celda.
  const esMallaIrregular = ["fan", "conforme"].includes(polygon.momentField?.meshType);
  const gridIndex = buildGridIndex(validXs, validYs, { fan: esMallaIrregular });
  const cellWidthMeters = (gridIndex?.stepX ?? estimateGridStep(validXs)) * 1.01;
  const cellHeightMeters = (gridIndex?.stepY ?? estimateGridStep(validYs)) * 1.01;

  const sortedBins = Array.from(bins.entries())
    .sort(([a], [b]) => a - b)
    .map(([, value]) => value);

  const hover = { index: gridIndex, xs: validXs, ys: validYs, values: validMs, rigidValues: validRigid };

  return { bins: sortedBins, cellWidthMeters, cellHeightMeters, hover };
}

/**
 * Distancia mínima de un punto (x,y) a cualquier LADO del polígono de la
 * zapata (distancia punto-segmento, sobre todos los lados, cerrando el
 * último con el primero) — no asume rectángulo alineado a los ejes, sirve
 * para cualquier forma dibujada.
 */
function distanciaAlBordeMasCercano(x, y, points) {
  if (!Array.isArray(points) || points.length < 2) return Infinity;

  let minDist = Infinity;
  for (let i = 0; i < points.length; i++) {
    const a = points[i];
    const b = points[(i + 1) % points.length];
    const dx = b.x - a.x;
    const dy = b.y - a.y;
    const lenSq = dx * dx + dy * dy;
    let t = lenSq > 1e-12 ? ((x - a.x) * dx + (y - a.y) * dy) / lenSq : 0;
    t = Math.max(0, Math.min(1, t));
    const px = a.x + t * dx;
    const py = a.y + t * dy;
    const dist = Math.hypot(x - px, y - py);
    if (dist < minDist) minDist = dist;
  }
  return minDist;
}

// AGREGADO (ver conversación, "zapatas recortadas" -- Camino 2, avisar en
// vez de perseguir el número): un hueco es, para la malla de elementos
// finitos, exactamente el mismo tipo de "borde libre" que el contorno
// exterior de la zapata -- misma causa (el nodo fantasma de w_en/segunda_x/
// segunda_y en zapata_shell_solver_combinadas.py, ver el bug ya corregido
// de curvatura en el borde) y por tanto el mismo tipo de artefacto
// numérico cerca de él. `holes` es un array de arrays de {x,y} (uno por
// hueco, ver foundation.js: polygon.holes) -- opcional, así los llamadores
// que no conocen huecos (o zapatas sin ninguno) se comportan exactamente
// igual que antes.
function distanciaAlBordeMasCercanoConHuecos(x, y, points, holes) {
  let minDist = distanciaAlBordeMasCercano(x, y, points);
  for (const hueco of holes || []) {
    const d = distanciaAlBordeMasCercano(x, y, hueco);
    if (d < minDist) minDist = d;
  }
  return minDist;
}

/**
 * Igual que isPointOnMeshEdge, pero SOLO contra huecos -- para poder
 * distinguir el mensaje ("cerca de un hueco" vs. "borde de la malla"
 * genérico) sin duplicar el cálculo del margen en cada llamador.
 */
export function isPointNearAnyHole(x, y, holes, cellWidth, cellHeight) {
  const margin = 1.5 * Math.max(Number(cellWidth) || 0, Number(cellHeight) || 0);
  if (!(margin > 0) || !Array.isArray(holes) || !holes.length) return false;
  return holes.some((hueco) => distanciaAlBordeMasCercano(x, y, hueco) < margin);
}

/**
 * AGREGADO (ver conversación, caso real F2 comparado contra ETABS: M11 en
 * ETABS ≈0 en el borde -condición física de borde libre-, mientras nuestro
 * "Diagrama de Resultantes" mostraba -14.004 Tn·m/m en el mismo punto): el
 * mapa de colores pinta el valor CRUDO del campo (ver computeMomentColorRange
 * más arriba, "el hover y los números siguen mostrando el dato crudo sin
 * recortar") -- eso es intencional para no ocultar información real, pero
 * cerca de CUALQUIER borde libre del dominio de la malla, la curvatura (y
 * por tanto el momento) calculada por diferencias finitas deja de ser
 * confiable, el mismo fenómeno de "Región D" (principio de Saint-Venant)
 * ya documentado en zapata_shell_solver.py -- ahí se oculta el momento de
 * DISEÑO cerca de columnas, pero el mapa de colores nunca aplicó ese
 * criterio cerca de un borde libre en general.
 *
 * `d` es el peralte efectivo (thicknessM - recubrimientoM, mismo criterio
 * que el backend); sin datos de sección (designInputs) no hay forma de
 * calcular `d` con confianza, así que se deja el comportamiento de siempre
 * (sin advertencia) en vez de inventar un umbral.
 */
export function isPointNearFreeEdge(x, y, polygonPoints, d, holes) {
  if (!(d > 0)) return false;
  return distanciaAlBordeMasCercanoConHuecos(x, y, polygonPoints || [], holes) < 2.0 * d;
}

/**
 * AGREGADO (ver conversación: el umbral "2×peralte" de isPointNearFreeEdge
 * de arriba resultó demasiado ancho -- en zapatas chicas/gruesas puede
 * cubrir casi toda la superficie, ver caso real F2 2x2m). Este es un
 * criterio DISTINTO y mucho más acotado: el artefacto numérico real no
 * viene del peralte de la losa, viene de CÓMO se calcula la curvatura por
 * diferencias finitas -- en los nodos que caen exactamente en el borde
 * del dominio, la derivada segunda se aproxima con un "nodo fantasma"
 * igual al del propio borde (ver w_en/segunda_x/segunda_y en
 * zapata_shell_solver.py, que hacen exactamente ese clamp), en vez de un
 * dato real más allá del límite -- eso degrada la precisión SOLO ahí, a
 * una distancia del orden de 1 celda de malla, sin importar qué tan
 * gruesa sea la losa. `cellWidth`/`cellHeight` son el tamaño REAL de una
 * celda (ver estimateGridStep) -- 1.5 celdas de margen alcanza para
 * capturar el nodo de borde y su vecino inmediato sin extenderse a una
 * franja grande.
 */
export function isPointOnMeshEdge(x, y, polygonPoints, cellWidth, cellHeight, holes) {
  const margin = 1.5 * Math.max(Number(cellWidth) || 0, Number(cellHeight) || 0);
  if (!(margin > 0)) return false;
  return distanciaAlBordeMasCercanoConHuecos(x, y, polygonPoints || [], holes) < margin;
}

/**
 * AGREGADO (ver conversación, caso real de zapata con columna CENTRADA:
 * el punto de hover cerca del nodo de columna mostraba un valor sin
 * advertencia, a pesar de no estar cerca de ningún borde libre): dentro
 * del rectángulo real que ocupa una columna en planta no hay losa
 * flexionándose -- es concreto de columna -- así que cualquier valor de
 * momento ahí no tiene sentido físico. Esto es DISTINTO de "Región D"
 * (que es sobre bordes libres, ver isPointNearFreeEdge arriba): la causa
 * acá es la singularidad matemática de una carga puntual en la teoría de
 * placas de Kirchhoff (documentada en zapata_shell_solver.py), no un
 * problema de borde del dominio de la malla.
 *
 * A propósito NO agrega ningún margen alrededor de la columna (solo el
 * rectángulo exacto de su sección) -- fuera de ese rectángulo no hay un
 * umbral validado con el mismo rigor que "2d" para bordes, así que no se
 * inventa uno.
 */
export function isPointInsideAnyColumn(x, y, columnsList) {
  return (columnsList || []).some((col) => {
    if (!(col.bx > 0) || !(col.by > 0)) return false;
    return Math.abs(x - col.x) <= col.bx / 2 && Math.abs(y - col.y) <= col.by / 2;
  });
}

/**
 * AGREGADO (ver conversación, "V13/V23 disparado cerca de columna" --
 * zapata trapezoidal F2, 2026-09-06): V13/V23 se calculan DERIVANDO el
 * campo de momentos ya resuelto (Qx=dMx/dx+dMxy/dy, Qy=dMxy/dx+dMy/dy --
 * ver zapata_shell_solver.py) -- distinto de M11/M22, que se leen
 * directo de la curvatura. Cerca de CUALQUIER apoyo puntual (columna), en
 * la teoría de placa delgada (Kirchhoff) el cortante es matemáticamente
 * NO ACOTADO -- diverge al acercarse al punto, con signo opuesto a cada
 * lado (confirmado con un caso real: de -0.25 a -651 en menos de 1m,
 * cambiando de signo justo al cruzar el nodo de la columna). Cuanto más
 * fina la malla, MÁS grande se ve el pico -- nunca converge ahí, a
 * diferencia del momento (que sí converge, solo con un pico alto). Causa
 * matemática exacta (no solo "se sabe que pasa"): bajo carga puntual, la
 * deflexión de una placa de Kirchhoff sigue la ecuación biarmónica, cuya
 * funcion de Green cerca del punto tiene la forma clasica w~r²·ln(r) --
 * el momento (2da derivada) diverge LENTO (~ln(r)), el cortante (3ra
 * derivada) diverge MUCHO mas rapido (~1/r, un polo real) -- ver
 * ScienceDirect "Kirchhoff Plate Theory"/"Kirchhoff Plate". ETABS (placa
 * gruesa/Mindlin, `ShellThick`, calcula el cortante directo de la
 * deformación por corte, no derivando momentos) no tiene esta
 * singularidad -- el giro de torsión adicional de Mindlin la "remueve"
 * (ver arXiv 1810.08900) -- y se mantiene acotado en la misma zona,
 * confirmado con datos reales.
 *
 * Es un fenómeno DISTINTO del de isPointInsideAnyColumn (esa es la
 * singularidad de carga puntual clásica) -- se aplica a V13/V23/VMax y
 * también a M12/MMin (ver COLUMN_SIGN_SENSITIVE_COMPONENTS más arriba,
 * mismo cambio de signo abrupto tipo "corner forces"), no toca el aviso
 * de M11/M22/MMax (esos sí acertaron el signo 98-100% en la validación).
 *
 * ACTUALIZADO (ver conversación, "muchos avisos, poco espacio para ver
 * las magnitudes de cortante" 2026-09-10): el radio pasó por 4*d ->
 * demasiado invasivo -> 2*d -> TODAVÍA demasiado (en una zapata angosta
 * con varias columnas + huecos, 2*d≈0.85m tapa casi toda la superficie y
 * no queda dónde leer V13/V23/VMax). Bajado a **1.5 celdas de malla**, el
 * MISMO margen que ya usan los avisos de borde (isPointOnMeshEdge) y de
 * hueco (isPointNearAnyHole) -- un anillo fino alrededor de la columna,
 * suficiente para marcar el pico inmediato. El usuario acepta a propósito
 * que un poco más lejos de la columna V13/V23 puede seguir disparado sin
 * aviso puntual: la advertencia del modal ya dice que el cortante está en
 * calibración, y prioriza ver el campo antes que taparlo.
 */
export function isPointNearColumnForShear(x, y, columnsList, cellWidth, cellHeight) {
  const margin = 1.5 * Math.max(Number(cellWidth) || 0, Number(cellHeight) || 0);
  if (!(margin > 0)) return false;
  return (columnsList || []).some((col) => {
    const dx = Math.max(0, Math.abs(x - col.x) - (Number(col.bx) || 0) / 2);
    const dy = Math.max(0, Math.abs(y - col.y) - (Number(col.by) || 0) / 2);
    return Math.hypot(dx, dy) < margin;
  });
}

/**
 * AGREGADO (ver conversación, "hueco de aviso en volado corto de
 * cortante" -- zapata F3): cuando el volado NETO de una cara (borde libre
 * de la zapata hasta la cara de columna) es menor que el peralte efectivo
 * d, la sección crítica de cortante (a distancia d de la cara) cae
 * matemáticamente FUERA de la zapata -- el backend ya lo detecta y
 * devuelve null para ESE lado (`V13_cara_.../V23_cara_...`, ver
 * calcular_zapata_shell_completo en zapata_shell_solver.py), pero el
 * campo CRUDO (el que pinta este mapa/hover) sigue teniendo un valor en
 * cada nodo de esa franja -- nunca validado, porque ahí gobierna
 * punzonamiento, no cortante de viga. El aviso genérico de "borde de
 * malla" (isPointOnMeshEdge, margen de 1.5 celdas) no siempre alcanza a
 * cubrir toda esa franja si el volado es más angosto que ese margen
 * (confirmado con un caso real: volado 0.075m, margen de malla 0.0505m --
 * quedaba un hueco de ~2.4cm sin ningún aviso). Esta función cubre ESE
 * hueco específicamente, reusando la MISMA decisión que ya tomó el
 * backend (`volados`, armado en foundation.js a partir de
 * `cortanteDiseno`) -- no inventa un umbral nuevo acá.
 *
 * `direction` es el componente elegido en el selector ("v13"/"v23"/
 * "vmax", ver SHEAR_COMPONENTS arriba) -- v13 solo mira las caras en X,
 * v23 solo las de Y, vmax (al depender de los dos) mira ambas.
 */
export function isPointInShortOverhangShear(x, y, direction, volados) {
  if (!volados) return false;
  const checkX = direction === "v13" || direction === "vmax";
  const checkY = direction === "v23" || direction === "vmax";
  if (checkX) {
    if (volados.xMenosCorto && x < volados.faceMenosX) return true;
    if (volados.xMasCorto && x > volados.faceMasX) return true;
  }
  if (checkY) {
    if (volados.yMenosCorto && y < volados.faceMenosY) return true;
    if (volados.yMasCorto && y > volados.faceMasY) return true;
  }
  return false;
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

    // AGREGADO (ver conversación): cmin/cmax ya vienen recortados por
    // percentil (computeMomentColorRange), no son el mínimo/máximo real —
    // "≥"/"≤" en los extremos deja claro que el valor real puede ser más
    // extremo que lo que muestra la barra (saturado al color tope, no
    // perdido: el hover sigue mostrando el dato crudo sin recortar).
    const prefix = i === 0 ? "≥" : i === TICKS ? "≤" : "";
    ctx.fillText(prefix + value.toFixed(2), x - 4, tickY);
    ctx.strokeStyle = "rgba(226, 232, 240, 0.6)";
    ctx.beginPath();
    ctx.moveTo(x, tickY);
    ctx.lineTo(x - 3, tickY);
    ctx.stroke();
  }

  ctx.textAlign = "center";
  const label = isCombined ? "M (Tn·m/m)" : `${componentLabel(direction)} (${componentUnit(direction)})`;
  ctx.fillText(label, x + LEGEND_WIDTH / 2, y - 12);

  // REVERTIDO (ver conversación, "por el momento no pongas V13/V23/VMax
  // como referencia" 2026-09-11): la nota fija bajo la leyenda (agregada
  // el 2026-09-10 junto con el sufijo "(ref.)" de COMPONENT_LABELS) se
  // saca a pedido de Jack. Los avisos de hover puntuales cerca de
  // columnas/cortes (isPointNearColumnForShear, isPointNearAnyHole) siguen
  // activos -- solo se quita este recordatorio permanente en la leyenda.

  ctx.restore();
}
