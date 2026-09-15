/**
 * Datos de los diagramas de interacción planos de una placa (X-X e Y-Y).
 *
 * POR QUÉ ESTÁ SEPARADO DEL DIBUJO
 *   `wallInteractionChart.js` importa Plotly, que no se puede cargar fuera del
 *   navegador (necesita `document`). Acá no hay dependencias, así que esto se
 *   puede probar con node — y lo que hay que verificar es justamente esto: qué
 *   curva va en cada diagrama y qué componente del momento se dibuja.
 *
 * CÓMO SE ARMA CADA DIAGRAMA
 *   Es lo que hace el Excel del estudio, confirmado con sus propias fórmulas
 *   (`N = K` y `Q = J` sobre las columnas P, V2, V3, T, M2, M3):
 *
 *     X-X : curvas de 0° y 180°, combos como (M3u, Pu)
 *     Y-Y : curvas de 90° y 270°, combos como (M2u, Pu)
 *
 *   Las dos curvas de cada par se cierran entre sí: una da los momentos de un
 *   signo y la otra los del otro, y juntas forman la figura cerrada.
 */

const TONF = 9806.65; // N

/** Ángulos de las dos curvas y componente de momento de cada diagrama. */
export const EJES = {
  XX: { angulos: [0, 180], componente: "M3", etiqueta: "M3 (tonf·m)", nombre: "X-X" },
  YY: { angulos: [90, 270], componente: "M2", etiqueta: "M2 (tonf·m)", nombre: "Y-Y" },
};

/**
 * Arma los datos de un diagrama, en tonf y tonf·m.
 *
 * `superficie` es la que devuelve el motor ({curves: [{angleDeg, points}]}), en
 * SI. `demandas` son las filas ya parseadas ({nombre, P, M2, M3, ratio}), que ya
 * vienen en tonf.
 *
 * Devuelve null si falta la superficie o si no están las dos curvas del par.
 */
export function datosDeDiagrama(superficie, demandas = [], eje = "XX") {
  const cfg = EJES[String(eje).toUpperCase()] || EJES.XX;
  const curvasSup = superficie?.curves;
  if (!Array.isArray(curvasSup) || !curvasSup.length) return null;

  const curvas = [];
  for (const grados of cfg.angulos) {
    const c = curvasSup.find((x) => Math.abs((x.angleDeg ?? -1) - grados) < 1e-6);
    if (!c) continue;
    curvas.push({
      nombre: `${grados}°`,
      M: c.points.map((p) => p[cfg.componente] / TONF),
      P: c.points.map((p) => p.P / TONF),
    });
  }
  if (!curvas.length) return null;

  const puntos = (demandas || []).map((d) => ({
    nombre: d.nombre,
    M: cfg.componente === "M3" ? d.M3 : d.M2,
    P: d.P,
    ratio: d.ratio ?? null,
  }));

  return { curvas, puntos, etiquetaM: cfg.etiqueta, eje: cfg.nombre };
}
