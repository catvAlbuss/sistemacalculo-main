// mixins/analysis/seismic/wallMeshNodes.js
//
// Nudos de la malla de MURO que caen sobre el eje de una viga.
//
// POR QUÉ
//   Un muro nuestro se conecta al pórtico SOLO donde hay un nudo coincidente.
//   Con la malla 1x1 de hoy eso son sus 4 esquinas, así que la viga que corre
//   sobre el muro se apoya en él únicamente en los extremos: el panel cuelga de
//   dos puntos en vez de trabajar con la viga.
//
//   Medido en MINI2 (pórtico 6x4 con UN muro, control interno de 2 columnas sin
//   muro en el mismo modelo) contra ETABS, columna con muro:
//     malla 1x1 actual .................. P 0.71   M3 0.32
//     convergida, sin atar .............. P 1.10   M3 2.55
//     convergida + borde superior atado . P 1.04   M3 0.61
//   Las 2 columnas SIN muro se quedan en 0.98-1.04 en todas las variantes.
//   Ver project-column-gravity-moment-gap.
//
// CÓMO
//   El motor (`_build_wall_mesh_plan` en inputs.py) REUSA un nudo existente
//   cuando la coordenada de su grilla coincide con uno del payload. Así que
//   basta con ADELANTARLE los nudos: se agregan al payload, el motor los
//   reconoce como suyos y el muro queda cosido ahí. Partir la viga en esos
//   mismos nudos lo hace `splitBeamsAtInteriorNodes`, que ya existe.
//
//   Solo se devuelven los puntos que caen sobre una VIGA. Los interiores del
//   panel los crea el motor por su cuenta; adelantarlos no aporta nada y
//   además dejaría nudos sin barra en el payload (ver
//   project-orphan-nodes-singular-matrix).
//
// LA GRILLA TIENE QUE CALZAR EXACTO
//   Si un punto cae a 1 mm del que genera el motor, el motor NO lo reusa: crea
//   uno propio al lado y el nudo que agregamos queda colgado. Por eso este
//   archivo replica `_build_wall_mesh_plan` al detalle, incluido el redondeo:
//   Python usa banker's rounding (round(0.5) = 0, round(2.5) = 2) y
//   `Math.round` de JS redondea siempre para arriba. Con un muro de 3 m de alto
//   y objetivo 6.0 eso es la diferencia entre ny = 0→1 y ny = 1.

/** Distancia máxima al eje de la barra para considerar el punto "sobre" ella. */
const TOL_EJE_M = 0.02;

/** Fracción de la luz ignorada en los extremos (ahí ya está el nudo propio). */
const MARGEN_EXTREMO = 0.02;

/** Tolerancia para decir que dos coordenadas son el mismo nudo. */
const TOL_NUDO_M = 1e-3;

/** Objetivo de elemento vertical para muros esbeltos (espejo de inputs.py). */
const OBJETIVO_ESBELTO_M = 0.42;

/** `round` de Python: mitad al PAR, no siempre para arriba. */
function roundHalfEven(x) {
  const piso = Math.floor(x);
  const resto = x - piso;
  if (Math.abs(resto - 0.5) > 1e-9) return Math.round(x);
  return piso % 2 === 0 ? piso : piso + 1;
}

const dist3 = (a, b) => Math.hypot(a.x - b.x, a.y - b.y, a.z - b.z);

/**
 * Divisiones del panel, con el MISMO criterio que `_build_wall_mesh_plan`.
 * `capX`/`capY` acompañan al objetivo: con override el motor los sube.
 */
function divisiones(largo, alto, objetivo, capX, capY) {
  let nx = Math.max(1, Math.min(capX, roundHalfEven(largo / objetivo)));
  let ny = Math.max(1, Math.min(capY, roundHalfEven(alto / objetivo)));

  // Muros angostos y altos: el motor los subdivide más en vertical.
  if (largo > 1e-6 && alto / largo > 2.0) {
    ny = Math.max(ny, Math.min(10, roundHalfEven(alto / OBJETIVO_ESBELTO_M)));
  }
  return { nx, ny };
}

/** Interpolación bilineal de las 4 esquinas, en el orden p00-p10-p11-p01. */
function bilineal(p, u, v) {
  const [p00, p10, p11, p01] = p;
  const mez = (k) =>
    (1 - u) * (1 - v) * p00[k] + u * (1 - v) * p10[k] + u * v * p11[k] + (1 - u) * v * p01[k];
  return { x: mez("x"), y: mez("y"), z: mez("z") };
}

/**
 * Puntos de la grilla de todos los muros (incluidos bordes y esquinas).
 *
 * @param {Array} walls   muros del payload ({corners:[{x,y,z} x4]})
 * @param {object} opts   { objetivo, capX, capY } — deben ser los MISMOS que
 *                        recibirá el motor, o los nudos no se reusan.
 * @returns {Array<{x,y,z}>}
 */
export function buildWallGridPoints(walls = [], opts = {}) {
  const objetivo = Number(opts.objetivo) > 0 ? Number(opts.objetivo) : 6.0;
  const capX = Number.isFinite(opts.capX) ? opts.capX : 4;
  const capY = Number.isFinite(opts.capY) ? opts.capY : 2;

  const salida = [];

  (walls || []).forEach((wall) => {
    const esquinas = wall?.corners;
    if (!Array.isArray(esquinas) || esquinas.length !== 4) return;

    const p = esquinas.map((c) => ({
      x: Number(c?.x) || 0,
      y: Number(c?.y) || 0,
      z: Number(c?.z) || 0,
    }));

    const largo = dist3(p[0], p[1]);
    const alto = dist3(p[0], p[3]);
    if (largo < 1e-3 || alto < 1e-3) return;

    const { nx, ny } = divisiones(largo, alto, objetivo, capX, capY);

    for (let fila = 0; fila <= ny; fila += 1) {
      for (let col = 0; col <= nx; col += 1) {
        salida.push(bilineal(p, col / nx, fila / ny));
      }
    }
  });

  return salida;
}

/**
 * De la grilla de muros, los puntos que caen sobre el eje de una VIGA y que
 * todavía no son un nudo del modelo. Son los que hay que agregar al payload
 * para que el muro quede cosido a la viga.
 *
 * Solo vigas: `splitBeamsAtInteriorNodes` no parte columnas (sus nudos
 * interiores son de piso) y atar los bordes verticales del muro a las columnas
 * empeoró la medición en MINI2 (P 1.29 contra 1.04 atando solo arriba).
 *
 * @returns {Array<{x,y,z}>} puntos nuevos, sin id
 */
export function wallGridPointsOnBeams(walls = [], nodes = [], elements = [], opts = {}) {
  const puntos = buildWallGridPoints(walls, opts);
  if (!puntos.length) return [];

  const porId = new Map();
  (nodes || []).forEach((n) => {
    porId.set(Number(n.id), { x: Number(n.x) || 0, y: Number(n.y) || 0, z: Number(n.z) || 0 });
  });

  const yaExiste = (q) => {
    for (const c of porId.values()) if (dist3(c, q) <= TOL_NUDO_M) return true;
    return false;
  };

  const vigas = (elements || []).filter((e) => (e?.elementType || "") === "beam");

  const nuevos = [];
  puntos.forEach((q) => {
    if (yaExiste(q)) return;
    if (nuevos.some((n) => dist3(n, q) <= TOL_NUDO_M)) return; // muros vecinos comparten borde

    const sobreViga = vigas.some((e) => {
      const a = porId.get(Number(e.node_i));
      const b = porId.get(Number(e.node_j));
      if (!a || !b) return false;
      const L = dist3(a, b);
      if (!(L > 1e-6)) return false;

      const t =
        ((q.x - a.x) * (b.x - a.x) + (q.y - a.y) * (b.y - a.y) + (q.z - a.z) * (b.z - a.z)) /
        (L * L);
      if (!(t > MARGEN_EXTREMO && t < 1 - MARGEN_EXTREMO)) return false;

      const proy = {
        x: a.x + t * (b.x - a.x),
        y: a.y + t * (b.y - a.y),
        z: a.z + t * (b.z - a.z),
      };
      return dist3(q, proy) <= TOL_EJE_M;
    });

    if (sobreViga) nuevos.push(q);
  });

  return nuevos;
}
