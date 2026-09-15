// mixins/analysis/seismic/slabEdgeOverlap.js
//
// Cuánto de una VIGA corre sobre el PERÍMETRO de un panel de losa.
//
// POR QUÉ EXISTE
//   El reparto de carga de losa a vigas pedía que la viga tuviera sus dos
//   extremos Y su punto medio sobre el perímetro del panel. Eso funciona con
//   una losa dibujada a mano, donde el panel y la viga coinciden — y falla
//   entero con las losas SUBDIVIDIDAS que trae un .e2k.
//
//   Medido en MODULO 01: 34 paneles bordean UNA viga de 7.13 m. Ninguno tiene
//   una viga con sus dos extremos en su perímetro, así que ningún panel
//   encontraba contorno y su carga se perdía EN SILENCIO. La viga quedaba con
//   0.4320 tonf/m — exactamente su peso propio (0.30×0.60×2.4)— contra los
//   5.45 tonf/m de ETABS: V2 −90 %, M3 −94 %. Diseño de vigas del lado
//   INSEGURO.
//
//   Dando vuelta la pregunta —"¿cuánto de esta viga toca este panel?" en vez de
//   "¿esta viga cubre este panel?"— los dos casos se resuelven con la misma
//   regla: una viga que bordea un panel entero da solape = su largo, y una viga
//   larga sobre paneles chicos recibe de cada uno lo que le toca.

/** Holgura para decir que la viga y el lado del panel son la misma recta. */
const TOL_M = 0.02;

/** Solape mínimo para que valga la pena: por debajo es ruido de coordenadas. */
const MIN_SOLAPE_M = 0.05;

/**
 * Longitud de `viga` que corre sobre el perímetro de `poly`.
 *
 * `viga` = {a:{x,y}, b:{x,y}, len, ux, uy} (el mismo objeto que ya arma
 * `_buildSeismicSlabToBeamLoadsForPayload`). `poly` = [{x,y}, ...].
 *
 * Se recorre lado por lado: si el lado es paralelo a la viga y está sobre su
 * misma recta, se intersecan los dos intervalos en el parámetro de la viga.
 * Los tramos se acumulan sin unir: un panel convexo no puede tocar la misma
 * parte de la viga dos veces, y de todos modos el total se normaliza después.
 */
export function solapeConPerimetro(poly, viga) {
  if (!poly || poly.length < 3 || !(viga.len > 0)) return 0;

  let total = 0;

  for (let i = 0; i < poly.length; i += 1) {
    const q1 = poly[i];
    const q2 = poly[(i + 1) % poly.length];
    const ex = q2.x - q1.x;
    const ey = q2.y - q1.y;
    const eLen = Math.hypot(ex, ey);
    if (eLen < 1e-9) continue;

    // ¿Paralelos? El seno del ángulo entre los dos versores.
    const cruz = Math.abs(viga.ux * (ey / eLen) - viga.uy * (ex / eLen));
    if (cruz > 0.02) continue;                 // ~1.1° de tolerancia

    // ¿Sobre la MISMA recta? Distancia perpendicular de un extremo del lado
    // a la recta de la viga. Sin esto, dos vigas paralelas de ejes distintos
    // se tomarían como la misma.
    const rx = q1.x - viga.a.x;
    const ry = q1.y - viga.a.y;
    if (Math.abs(rx * viga.uy - ry * viga.ux) > TOL_M) continue;

    // Intervalo del lado en el parámetro de la viga (0 = extremo a, len = b).
    const t1 = rx * viga.ux + ry * viga.uy;
    const t2 = (q2.x - viga.a.x) * viga.ux + (q2.y - viga.a.y) * viga.uy;
    const lo = Math.max(0, Math.min(t1, t2));
    const hi = Math.min(viga.len, Math.max(t1, t2));
    if (hi - lo > 0) total += hi - lo;
  }

  return total >= MIN_SOLAPE_M ? Math.min(total, viga.len) : 0;
}
