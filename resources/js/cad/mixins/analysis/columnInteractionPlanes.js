/**
 * Diagramas de interacción P-M33 y P-M22 al estilo de la plantilla Excel del
 * cliente (y del "Interaction Surface" de ETABS visto de frente).
 *
 * POR QUÉ UN ARCHIVO APARTE DE columnInteractionChart.js
 *   Ese dibuja OTRA cosa: la superficie 3D y un corte a un θ arbitrario, con
 *   |M| = hypot(M2, M3) y una sola curva por vez (φ o nominal, según el
 *   checkbox). Acá hace falta lo contrario y es lo que pide el Excel:
 *
 *     - un PLANO fijo (M33 con M2=0, o M22 con M3=0), no un ángulo libre
 *     - el momento CON SIGNO, para que salga el lazo cerrado de ±M
 *     - las DOS curvas a la vez: "Curve Nominal" (sin φ) y "Curve Reduction"
 *       (con φ), que es como el Excel las superpone
 *
 *   Mezclar ambas cosas en el archivo de al lado habría significado meter
 *   condicionales por todos lados en una función ya validada.
 *
 * DE DÓNDE SALEN LOS DATOS
 *   Los mismos que la tabla "Curve Data": `compute_pmm_surface` devuelve 24
 *   curvas con {angleDeg, points:[{Pn, M2n, M3n, phiPn, phiM2n, phiM3n}]}. No
 *   se recalcula nada acá — si el número del gráfico no coincide con el de la
 *   tabla, es un bug del gráfico.
 *
 * EL LAZO CERRADO
 *   Cada curva del motor cubre UN semiplano (θ da el sentido de flexión), así
 *   que el diagrama completo necesita DOS: θ y θ+180. Se recorre la primera de
 *   arriba hacia abajo y la segunda al revés, y así el trazo cierra.
 *
 * CONVENCIÓN DE SIGNO DE M2
 *   El motor devuelve M2n = −|M|·senθ y ETABS usa +|M|·senθ. Acá se NORMALIZA a
 *   la de ETABS (ver SIGNO_M2_ETABS abajo), porque tanto la tabla como el plano
 *   P-M22 existen para compararse con su salida — y porque la demanda ya llega
 *   en esa convención.
 */

import Plotly from "plotly.js-dist-min";

const N_TO_TONF = 1 / 9806.65;

/**
 * El motor devuelve `M2n = −|M|·sen(θ)` mientras que ETABS usa `+|M|·sen(θ)`
 * (M3 coincide en ambos). Verificado a igual P en la curva de 15°: ETABS da
 * M2 = +4.0257 y M3 = 15.034, y con |M| = 15.564 sale 15.564·sen(15°) = 4.028.
 *
 * Al DISEÑO no lo afecta —el ratio usa hypot(M2, M3) y la sección es simétrica—
 * pero sí a todo lo que se compara contra ETABS columna por columna. Y hay algo
 * menos obvio: la DEMANDA sí llega en la convención de ETABS (comprobado contra
 * Element Forces, C11: nuestro M2 −2.30 vs su −2.3892), así que en el plano
 * P-M22 la curva quedaba espejada respecto del punto de demanda. Por la simetría
 * del lazo no se notaba, pero un punto podía dibujarse del lado equivocado.
 *
 * Se normaliza acá, en la capa de PRESENTACIÓN — el motor no se toca.
 */
const SIGNO_M2_ETABS = -1;

/**
 * Aplasta a CERO lo que redondea a cero.
 *
 * Sin esto la tabla mostraba `-0.0000` en las celdas donde el momento es nulo
 * por simetría (M2 en las curvas de 0/180°, M3 en las de 90/270°) — resultado de
 * un residuo numérico negativo minúsculo, o directamente del cero negativo de
 * IEEE 754. ETABS ahí pone `0` a secas, y un `-0.0000` en una columna que se va
 * a comparar a mano es ruido puro.
 */
function sinCeroNegativo(v) {
  const n = Number(v) || 0;
  return Math.abs(n) < 5e-5 ? 0 : n;
}

const COLOR_NOMINAL = "#84cc16"; // verde — "Curve Nominal" del Excel
const COLOR_PHI = "#3b82f6"; // azul  — "Curve Reduction"
const COLOR_DEMANDA_OK = "#4ade80";
const COLOR_OTROS = "#94a3b8";      // combos no gobernantes, en gris
const COLOR_DEMANDA_NG = "#f87171";

/** La curva del motor más cercana a `objetivo` grados (las hay cada 15°). */
function curvaEnAngulo(curves, objetivo) {
  const dist = (a) => {
    const d = Math.abs(((a - objetivo) % 360) + 360) % 360;
    return Math.min(d, 360 - d);
  };
  return curves.reduce((mejor, c) => (dist(c.angleDeg) < dist(mejor.angleDeg) ? c : mejor), curves[0]);
}

export const columnInteractionPlanesMixin = {
  /**
   * Dibuja el diagrama del plano pedido con las dos curvas y la demanda.
   *
   * @param {string|HTMLElement} container  div destino
   * @param {Array}  curves   las 24 curvas del motor (col.surface.curves)
   * @param {Object} demand   {P, M2, M3, ratio, status} en N y N·m, o null
   * @param {Object} opts     { plane: "M33" | "M22", allDemands: [...] }
   *
   * `opts.allDemands` dibuja TODAS las combinaciones de la estacion en gris y
   * deja el gobernante resaltado. Es lo que hace la hoja del cliente a mano:
   * graficar las 9 combinaciones contra la curva y mirar cual queda mas cerca
   * del borde. Aca ademas se sabe cual gana, porque el ratio esta calculado.
   * @returns {boolean} false si no había con qué dibujar
   */
  /**
   * Las 24 curvas en el layout ANCHO de ETABS: una fila por punto, y por cada
   * curva tres columnas (P, M2, M3).
   *
   * Es el formato de la tabla que exporta ETABS y el que pega la plantilla del
   * cliente en `INPUT DI REDUCIDO` / `INPUT DI NOMINAL`, así que se puede
   * comparar columna contra columna sin reordenar nada.
   *
   * @param {Array}   curves  las 24 curvas del motor
   * @param {boolean} usePhi  true = reducida (con Φ); false = nominal
   * @returns {{angles:number[], rows:Array<{point:number, cells:Array}>}}
   */
  columnCurvesTable(curves, usePhi = true) {
    if (!Array.isArray(curves) || !curves.length) return { angles: [], rows: [] };
    const cp = usePhi ? "phiPn" : "Pn";
    const c2 = usePhi ? "phiM2n" : "M2n";
    const c3 = usePhi ? "phiM3n" : "M3n";

    // Redondeo del ángulo: el motor los genera con 360/24 y salen cosas como
    // 14.999999999999998. Es cosmético, pero ensucia el CSV que se pega en Excel.
    const angles = curves.map((c) => Math.round((Number(c.angleDeg) || 0) * 1e6) / 1e6);
    const nPuntos = Math.max(...curves.map((c) => (c.points || []).length));
    const rows = [];
    for (let i = 0; i < nPuntos; i += 1) {
      const cells = curves.map((c) => {
        const pt = (c.points || [])[i];
        if (!pt) return { P: null, M2: null, M3: null };
        return {
          P: sinCeroNegativo(Number(pt[cp] || 0) * N_TO_TONF),
          M2: sinCeroNegativo(Number(pt[c2] || 0) * N_TO_TONF * SIGNO_M2_ETABS),
          M3: sinCeroNegativo(Number(pt[c3] || 0) * N_TO_TONF),
        };
      });
      rows.push({ point: i + 1, cells });
    }
    // ETABS ordena de COMPRESIÓN a tracción; el motor al revés. Se invierte para
    // poder leer las dos tablas en paralelo (aunque las filas no alineen 1 a 1:
    // ETABS trae 11 puntos por curva y el motor 23).
    rows.reverse();
    rows.forEach((r, i) => { r.point = i + 1; });

    // Version PLANA para el render: encabezado y cuerpo salen de la misma
    // enumeracion, asi que es imposible que se desalineen. El anidado de
    // `<template x-for>` dentro de un `<tr>` mostraba la curva #2 bajo el
    // rotulo de la #1.
    const flatHeaders = [];
    angles.forEach((a, i) => {
      ["P", "M2", "M3"].forEach((k) => {
        flatHeaders.push({
          curva: i + 1,
          angulo: a,
          campo: k,
          unidad: k === "P" ? "tonf" : "tonf-m",
          primera: k === "P",
        });
      });
    });
    rows.forEach((r) => {
      r.values = [];
      r.cells.forEach((c) => { r.values.push(c.P, c.M2, c.M3); });
    });

    return { angles, rows, flatHeaders };
  },

  /** La misma tabla como CSV, para pegar en la hoja del Excel. */
  columnCurvesCsv(curves, usePhi = true) {
    const { angles, rows } = this.columnCurvesTable(curves, usePhi);
    if (!rows.length) return "";
    const cab1 = ["Point"];
    const cab2 = [""];
    angles.forEach((a, i) => {
      cab1.push(`Curve #${i + 1}`, `${a} deg`, "");
      cab2.push("P  tonf", "M2  tonf-m", "M3  tonf-m");
    });
    const cuerpo = rows.map((r) => [
      r.point,
      ...r.cells.flatMap((c) => (c.P === null ? ["", "", ""]
        : [c.P.toFixed(4), c.M2.toFixed(4), c.M3.toFixed(4)])),
    ].join(","));
    return [cab1.join(","), cab2.join(","), ...cuerpo].join("\n");
  },

  renderColumnInteractionPlane(container, curves, demand = null, opts = {}) {
    const el = typeof container === "string" ? document.getElementById(container) : container;
    if (!el || !Array.isArray(curves) || !curves.length) return false;

    const esM33 = String(opts.plane || "M33").toUpperCase() !== "M22";
    // M33 vive en el plano de θ=0/180; M22 en el de θ=90/270.
    const [angA, angB] = esM33 ? [0, 180] : [90, 270];
    const campoM = esM33 ? "M3n" : "M2n";
    const campoMPhi = esM33 ? "phiM3n" : "phiM2n";
    // En el plano M22 hay que llevar la curva a la convención de ETABS, que es
    // la que trae la demanda. Ver SIGNO_M2_ETABS.
    const signoM = esM33 ? 1 : SIGNO_M2_ETABS;

    /** Lazo cerrado (±M) de una de las dos curvas, en tonf y tonf·m. */
    const lazo = (usePhi) => {
      const cm = usePhi ? campoMPhi : campoM;
      const cp = usePhi ? "phiPn" : "Pn";
      const rama = (ang, invertir) => {
        const pts = (curvaEnAngulo(curves, ang).points || []).slice();
        if (invertir) pts.reverse();
        return pts.map((pt) => [Number(pt[cm] || 0) * N_TO_TONF * signoM, Number(pt[cp] || 0) * N_TO_TONF]);
      };
      const p = [...rama(angA, false), ...rama(angB, true)];
      if (p.length) p.push(p[0]); // cerrar el trazo
      return { x: p.map((q) => q[0]), y: p.map((q) => q[1]) };
    };

    const nom = lazo(false);
    const phi = lazo(true);

    const traces = [
      {
        type: "scatter", mode: "lines+markers",
        x: nom.x, y: nom.y,
        line: { color: COLOR_NOMINAL, width: 2 },
        marker: { size: 4, color: COLOR_NOMINAL },
        name: "Curva Nominal (sin Φ)",
        hovertemplate: `M %{x:.2f} tonf·m<br>P %{y:.2f} tonf<extra>Nominal</extra>`,
      },
      {
        type: "scatter", mode: "lines+markers",
        x: phi.x, y: phi.y,
        line: { color: COLOR_PHI, width: 2 },
        marker: { size: 4, color: COLOR_PHI },
        name: "Curva Reducida (con Φ)",
        hovertemplate: `ΦM %{x:.2f} tonf·m<br>ΦP %{y:.2f} tonf<extra>Reducida</extra>`,
      },
    ];

    // TODAS las combinaciones, en gris y por detras del gobernante.
    //
    // OJO con lo que muestra este grafico: el punto se proyecta sobre el eje
    // del plano (M33 o M22), asi que una demanda BIAXIAL aparece mas cerca del
    // origen de lo que realmente esta. El ratio de la tabla es el biaxial real
    // — el mismo criterio del "Interaction Surface" de ETABS, que tambien
    // dibuja planos. Por eso el gobernante puede no ser el punto que se ve mas
    // afuera en ESTE plano.
    const otros = Array.isArray(opts.allDemands) ? opts.allDemands : [];
    if (otros.length) {
        const idGob = demand ? String(demand.comboId ?? "") : null;
        const resto = otros.filter((d) => String(d.comboId ?? "") !== idGob);
        if (resto.length) {
            traces.push({
                type: "scatter", mode: "markers",
                x: resto.map((d) => Number((esM33 ? d.M3 : d.M2) || 0) * N_TO_TONF),
                y: resto.map((d) => Number(d.P || 0) * N_TO_TONF),
                marker: { size: 7, color: COLOR_OTROS, symbol: "circle",
                          line: { color: "#1e293b", width: 1 } },
                name: `Otras combinaciones (${resto.length})`,
                text: resto.map((d) => `${d.comboName || d.comboId || ""} · ratio ${Number(d.ratio ?? 0).toFixed(3)}`),
                hovertemplate: "%{text}<br>M %{x:.2f} tonf·m<br>P %{y:.2f} tonf<extra></extra>",
            });
        }
    }

    if (demand) {
      // La demanda se proyecta sobre el MISMO campo que el eje, así que un
      // punto fuera del lazo significa realmente fuera de la curva de ese plano
      // — no un artefacto de haber mezclado convenciones.
      const md = Number((esM33 ? demand.M3 : demand.M2) || 0) * N_TO_TONF;
      const pd = Number(demand.P || 0) * N_TO_TONF;
      const ok = String(demand.status || "").toUpperCase() !== "NG";
      traces.push({
        type: "scatter", mode: "markers",
        x: [md], y: [pd],
        marker: { size: 11, color: ok ? COLOR_DEMANDA_OK : COLOR_DEMANDA_NG, symbol: "square",
                  line: { color: "#111827", width: 1 } },
        name: `GOBERNANTE · ${demand.comboName || ""} (ratio ${Number(demand.ratio ?? 0).toFixed(3)})`,
        hovertemplate: "M %{x:.2f} tonf·m<br>P %{y:.2f} tonf<extra>Gobernante</extra>",
      });
    }

    const ejes = { color: "rgba(148,163,184,0.35)", width: 1 };
    // Los ejes tienen que abarcar tambien los puntos de demanda: si un combo
    // cae fuera de la curva hay que VERLO, no recortarlo.
    const mDem = otros.map((d) => Math.abs(Number((esM33 ? d.M3 : d.M2) || 0)) * N_TO_TONF);
    const pDem = otros.map((d) => Number(d.P || 0) * N_TO_TONF);
    const mx = Math.max(...nom.x.map(Math.abs), ...mDem, 1) * 1.15;
    const py = [Math.min(...nom.y, ...pDem), Math.max(...nom.y, ...pDem)];
    traces.push(
      { type: "scatter", mode: "lines", x: [-mx, mx], y: [0, 0], line: ejes, showlegend: false, hoverinfo: "skip" },
      { type: "scatter", mode: "lines", x: [0, 0], y: [py[0] * 1.1, py[1] * 1.1], line: ejes, showlegend: false, hoverinfo: "skip" },
    );

    Plotly.newPlot(el, traces, {
      title: { text: `Diagrama de interacción: P − ${esM33 ? "M33" : "M22"}`,
               font: { color: "#e5e7eb", size: 13 } },
      margin: { l: 55, r: 12, t: 36, b: 44 },
      paper_bgcolor: "rgba(0,0,0,0)",
      plot_bgcolor: "rgba(0,0,0,0)",
      font: { color: "#9ca3af", size: 10 },
      xaxis: { title: { text: `${esM33 ? "M33" : "M22"} (tonf·m)` }, zeroline: false,
               gridcolor: "rgba(148,163,184,0.12)" },
      yaxis: { title: { text: "Pu (tonf)" }, zeroline: false,
               gridcolor: "rgba(148,163,184,0.12)" },
      legend: { orientation: "h", y: -0.18, font: { size: 9 } },
      showlegend: true,
    }, {
      displaylogo: false,
      responsive: true,
      toImageButtonOptions: { filename: `interaccion-P-${esM33 ? "M33" : "M22"}`, scale: 2 },
    });
    return true;
  },
};
