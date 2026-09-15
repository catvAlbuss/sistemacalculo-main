// resources/js/cad/mixins/analysis/wallInteractionChart.js
//
// Los dos diagramas de interacción de una placa, X-X e Y-Y, con los puntos de
// las combinaciones encima. Es la vista que el ingeniero ya mira hoy en su
// Excel, y la decisión que toma con ella es a ojo: si un punto queda FUERA de
// la curva, hay que poner más acero.
//
// CÓMO SE ARMA CADA DIAGRAMA (así lo hace el Excel, confirmado con sus fórmulas)
//   X-X : curvas de 0° y 180°, y los combos como (M3u, Pu)   -> N = K, o sea M3
//   Y-Y : curvas de 90° y 270°, y los combos como (M2u, Pu)  -> Q = J, o sea M2
//   En los dos, Pu = −P de la tabla de ETABS (compresión positiva).
//
// LA DIFERENCIA CON EL D/C, que conviene tener presente
//   Estos diagramas son PLANOS: miran un momento por vez. El D/C corta el rayo
//   contra la superficie 3D, con M2 y M3 actuando a la vez. En una L los ejes
//   principales están girados (ETABS reporta 74.91° en la PL2), así que un punto
//   puede verse cómodo en las dos vistas planas y estar afuera en el biaxial.
//   Por eso los dos números se muestran juntos y no uno en lugar del otro.
//
// POR QUÉ NO SE REUSA `columnInteractionChart.js`
//   Ese dibuja la SUPERFICIE 3D de una columna (trace `surface`, escena WebGL).
//   Acá hacen falta dos cortes planos con puntos encima: otro tipo de gráfico,
//   otro layout y otro ciclo de vida. Comparten la dependencia, nada más.

import Plotly from "plotly.js-dist-min";

import { datosDeDiagrama } from "../../lib/wallChartData.js";

const COLOR = {
  curva: "#38bdf8",
  nominal: "#86efac",   // la Exclude Phi, por fuera
  curvaOpuesta: "#0ea5e9",
  dentro: "#4ade80",
  fuera: "#f87171",
  ejes: "#94a3b8",
  grilla: "#1e293b",
  fondo: "#0f172a",
};

export const wallInteractionChartMixin = {
  /**
   * Datos de un diagrama plano, en tonf. `eje` es "XX" o "YY".
   * La lógica vive en lib/wallChartData.js, sin Plotly, para poder probarla.
   */
  getWallChartData(eje = "XX") {
    const st = this.wallDesignState;
    return datosDeDiagrama(st?.resultado?.surfaces?.[st?.modo],
                           this.getWallDemandRows?.() || [], eje);
  },

  /**
   * La curva NOMINAL (Exclude Phi) del mismo eje, o null.
   *
   * El motor ya calcula las dos superficies —el payload pide
   * `modes: ["con_phi", "sin_phi"]`— así que esto no cuesta un cálculo extra:
   * solo faltaba dibujarla. El Excel del estudio muestra las dos, y tiene
   * sentido: la de diseño (con φ) es contra la que se verifica, y la nominal
   * dice cuánto margen real queda.
   */
  getWallNominalChartData(eje = "XX") {
    const st = this.wallDesignState;
    const otra = st?.modo === "sin_phi" ? "con_phi" : "sin_phi";
    return datosDeDiagrama(st?.resultado?.surfaces?.[otra], [], eje);
  },

  /**
   * Dibuja el diagrama en `container`.
   *
   * OJO: el contenedor tiene que estar VISIBLE. Plotly mide el div para
   * dimensionarse y sobre un `display:none` sale de 0×0 — la misma trampa que
   * ya está anotada en columnInteractionChart.
   */
  renderWallInteractionChart(container, eje = "XX") {
    const el = typeof container === "string" ? document.getElementById(container) : container;
    const datos = this.getWallChartData(eje);
    if (!el || !datos || !datos.curvas.length) return false;

    // Las dos curvas se cierran entre sí: la de 0° da los momentos de un signo y
    // la de 180° los del otro, y juntas forman la figura cerrada del diagrama.
    const traces = datos.curvas.map((c, i) => ({
      type: "scatter",
      mode: "lines",
      name: `Curva ${c.nombre}`,
      x: c.M,
      y: c.P,
      line: { color: i === 0 ? COLOR.curva : COLOR.curvaOpuesta, width: 2 },
      hovertemplate: "M %{x:.2f}<br>P %{y:.2f}<extra></extra>",
    }));

    // La nominal (Exclude Phi) por fuera, como en el Excel del estudio: es la
    // misma sección sin los factores de reducción, así que envuelve a la de
    // diseño y deja ver de un vistazo cuánto margen hay.
    const nominal = this.getWallNominalChartData?.(eje);
    for (const [i, c] of (nominal?.curvas || []).entries()) {
      traces.push({
        type: "scatter",
        mode: "lines",
        name: `Nominal ${c.nombre}`,
        x: c.M,
        y: c.P,
        line: { color: COLOR.nominal, width: 1.5, dash: "dot" },
        showlegend: i === 0,
        hovertemplate: "nominal<br>M %{x:.2f}<br>P %{y:.2f}<extra></extra>",
      });
    }

    // Un punto por combinación, verde adentro y rojo afuera. El color sale del
    // D/C cuando está calculado; si no, quedan neutros.
    const dentro = datos.puntos.filter((p) => p.ratio === null || p.ratio <= 1);
    const fuera = datos.puntos.filter((p) => p.ratio !== null && p.ratio > 1);
    for (const [grupo, color, nombre] of [[dentro, COLOR.dentro, "Combos dentro"],
                                          [fuera, COLOR.fuera, "Combos FUERA"]]) {
      if (!grupo.length) continue;
      traces.push({
        type: "scatter",
        mode: "markers",
        name: nombre,
        x: grupo.map((p) => p.M),
        y: grupo.map((p) => p.P),
        text: grupo.map((p) => p.nombre + (p.ratio !== null ? `  ·  D/C ${p.ratio.toFixed(3)}` : "")),
        marker: { color, size: 9, symbol: "x", line: { width: 1.5, color } },
        hovertemplate: "%{text}<br>M %{x:.2f}<br>P %{y:.2f}<extra></extra>",
      });
    }

    Plotly.newPlot(el, traces, {
      title: { text: `Diagrama de Interacción ${datos.eje}`, font: { size: 13, color: "#e2e8f0" } },
      paper_bgcolor: COLOR.fondo,
      plot_bgcolor: COLOR.fondo,
      font: { color: COLOR.ejes, size: 11 },
      xaxis: {
        title: datos.etiquetaM, zeroline: true, zerolinecolor: COLOR.ejes,
        gridcolor: COLOR.grilla,
      },
      yaxis: {
        title: "Carga axial P (tonf)", zeroline: true, zerolinecolor: COLOR.ejes,
        gridcolor: COLOR.grilla,
      },
      // El margen inferior tiene que dar para el rótulo del eje Y ADEMÁS de la
      // leyenda: con 44 px la leyenda se le montaba encima a "M3 (tonf·m)".
      margin: { l: 62, r: 16, t: 34, b: 74 },
      legend: { orientation: "h", y: -0.30, yanchor: "top", x: 0.5, xanchor: "center",
                font: { size: 10 } },
      showlegend: true,
    }, { displayModeBar: false, responsive: true });
    return true;
  },

  /** Libera el gráfico (Plotly deja listeners vivos). */
  destroyWallInteractionChart(container) {
    const el = typeof container === "string" ? document.getElementById(container) : container;
    if (el) Plotly.purge(el);
  },
};
