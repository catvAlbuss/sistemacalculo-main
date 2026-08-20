// resources/js/cad/mixins/analysis/columnInteractionChart.js
//
// Superficie de interacción P-M2-M3 de una columna, en 3D — el equivalente al
// botón "Interaction" de ETABS (diálogo "Interaction Surface for Section ...").
//
// NO calcula nada: la superficie ya viene del motor. `/api/backend/column-interaction`
// devuelve `curves: [{angleDeg, points:[{Pn,M2n,M3n, phiPn,phiM2n,phiM3n, ...}]}]`
// (24 curvas × 21 puntos por defecto, mismo formato conceptual que los
// NUMINTERCURVES/NUMINTERPOINTS de ETABS) y rcColumnDesign.js ya lo guarda en
// `col.surface`. Acá solo se arma el gráfico.
//
// Se dibuja con Plotly (ya es dependencia del proyecto y ya se usa en el CAD,
// ver rcAligeradoDesign.js). Se descartó renderizar en el backend: en
// producción el motor Python corre como subproceso por request sobre hosting
// compartido, y una imagen renderizada allá no se podría rotar — que es
// justamente la gracia del diagrama.
//
// El trazado 3D (superficie + curva de corte interpolada entre las 24 curvas +
// ejes rojos etiquetados) sigue el mismo planteo que
// resources/js/columnav2/charts.js, la herramienta vieja de columnas, donde
// esas 24 curvas se pegan A MANO desde ETABS. Acá salen calculadas.

import Plotly from "plotly.js-dist-min";

// El motor trabaja en SI (N, N·m); el modal muestra tonf y tonf·m.
const N_TO_TONF = 1 / 9806.65;

const COLOR_SUP = "rgba(37,99,235,0.85)";
const COLOR_CORTE = "rgba(168,85,247,0.95)";
const COLOR_EJE = "rgba(248,113,113,0.9)";
const COLOR_DEMANDA_OK = "#4ade80";
const COLOR_DEMANDA_NG = "#f87171";

export const columnInteractionChartMixin = {
  /**
   * Componentes (M2, M3, P) de un punto de curva, ya en tonf/tonf·m.
   * `usePhi` decide entre la superficie de DISEÑO (φMn, la que se compara
   * contra la demanda y equivale al "Include Phi" de ETABS) y la NOMINAL
   * ("Exclude Phi").
   */
  _ciPoint(pt, usePhi) {
    const m2 = Number((usePhi ? pt.phiM2n : pt.M2n) || 0) * N_TO_TONF;
    const m3 = Number((usePhi ? pt.phiM3n : pt.M3n) || 0) * N_TO_TONF;
    const p = Number((usePhi ? pt.phiPn : pt.Pn) || 0) * N_TO_TONF;
    // SIGNO DE M2: el motor devuelve M2n = −|M|·senθ (M3n sí es +|M|·cosθ),
    // o sea con el signo cambiado respecto de la convención estándar y de la
    // de ETABS. Verificado sobre la superficie: a θ=90° el motor da M2n=−40.54
    // donde debería dar +40.54.
    //
    // Al DISEÑO no lo afecta — el ratio usa hypot(M2n, M3n) y la sección es
    // doblemente simétrica, así que la superficie se mapea sobre sí misma —,
    // pero al DIBUJO sí: el punto de demanda viene del análisis (convención
    // ETABS) y sin esta corrección la curva de corte caería en el cuadrante
    // espejado. Con el signo normalizado, nuestras curvas calzan una a una con
    // la tabla Curve Data de ETABS, signo incluido.
    return [-m2, m3, p];
  },

  /**
   * Malla para el trace `surface` de Plotly: filas = puntos de la curva (de
   * tracción a compresión), columnas = ángulos. Se repite la curva 0 al final
   * para CERRAR la superficie — sin eso queda una ranura entre 345° y 0°.
   */
  _ciSurfaceGrid(curves, usePhi) {
    const nCur = curves.length;
    const nPts = curves[0]?.points?.length || 0;
    const x = [], y = [], z = [];

    for (let i = 0; i < nPts; i += 1) {
      const fx = [], fy = [], fz = [];
      for (let c = 0; c <= nCur; c += 1) {
        const pt = curves[c % nCur]?.points?.[i];
        if (!pt) continue;
        const [m2, m3, p] = this._ciPoint(pt, usePhi);
        fx.push(m2); fy.push(m3); fz.push(p);
      }
      if (fx.length) { x.push(fx); y.push(fy); z.push(fz); }
    }
    return { x, y, z };
  },

  /**
   * Curva de corte RADIAL en el ángulo de momento `thetaDeg` — la línea que
   * ETABS resalta sobre la superficie.
   *
   * OJO con la parametrización: `curves[k].angleDeg` del motor es la dirección
   * del EJE NEUTRO, y en una sección no circular el vector momento resultante
   * NO queda paralelo a ella. Medido en la C45x45 R-5-3: la curva nominal de
   * 30° tiene su momento a 31.2°, y la desviación crece con la asimetría.
   *
   * ETABS corta por ÁNGULO DE MOMENTO: en su tabla Curve Data, los 11 puntos de
   * la curva "at 253.922 deg" tienen todos exactamente ese atan2(M2, M3).
   *
   * Por eso acá NO se interpolan las coordenadas de las dos curvas vecinas
   * (interpolación cartesiana): eso mueve el punto fuera del plano pedido — se
   * medían hasta 15° de desvío. En su lugar, para cada índice de punto se arma
   * el ANILLO de los N puntos de ese índice, se ordena por su ángulo de momento
   * REAL, se interpola la MAGNITUD en `thetaDeg` y se coloca el punto
   * exactamente en ese plano. Así el corte es radial de verdad.
   */
  _ciCutCurve(curves, thetaDeg, usePhi) {
    const n = curves.length;
    if (!n) return null;

    const norm = (a) => (((Number(a) || 0) % 360) + 360) % 360;
    const t = norm(thetaDeg);
    const tr = (t * Math.PI) / 180;
    const nPts = curves[0]?.points?.length || 0;

    const x = [], y = [], z = [];

    for (let i = 0; i < nPts; i += 1) {
      const anillo = [];
      let pSum = 0, pN = 0;

      for (let k = 0; k < n; k += 1) {
        const pt = curves[k]?.points?.[i];
        if (!pt) continue;
        const [m2, m3, pp] = this._ciPoint(pt, usePhi);
        pSum += pp; pN += 1;
        const mag = Math.hypot(m2, m3);
        // Un punto de momento nulo (compresión o tracción pura) no tiene ángulo
        // definido: entra al promedio de P pero no al anillo angular.
        if (mag > 1e-9) anillo.push({ a: norm((Math.atan2(m2, m3) * 180) / Math.PI), mag, p: pp });
      }

      if (!pN) continue;
      if (anillo.length < 2) { x.push(0); y.push(0); z.push(pSum / pN); continue; }

      anillo.sort((u, v) => u.a - v.a);
      let i0 = anillo.length - 1;
      for (let k = 0; k < anillo.length; k += 1) if (anillo[k].a <= t) i0 = k;
      const i1 = (i0 + 1) % anillo.length;

      let span = anillo[i1].a - anillo[i0].a;
      if (span <= 0) span += 360;
      let d = t - anillo[i0].a;
      if (d < 0) d += 360;
      const f = span > 0 ? d / span : 0;

      const mag = anillo[i0].mag * (1 - f) + anillo[i1].mag * f;
      x.push(mag * Math.sin(tr));
      y.push(mag * Math.cos(tr));
      z.push(anillo[i0].p * (1 - f) + anillo[i1].p * f);
    }

    return x.length ? { x, y, z } : null;
  },

  /**
   * Dibuja el diagrama en `container` (elemento DOM o id).
   *
   * `demand`: el check YA seleccionado en la tabla del modal
   * ({P, M2, M3, thetaDeg, ratio, status}, en SI) — así el punto dibujado es
   * exactamente el de la fila que el usuario está mirando, combo incluido.
   * Puede ser null (dibuja solo la superficie).
   *
   * OJO: el contenedor tiene que estar VISIBLE al llamar. Plotly mide el div
   * para dimensionar la escena y sobre un `display:none` sale de 0×0.
   */
  renderColumnInteractionSurface(container, curves, demand = null, opts = {}) {
    const el = typeof container === "string" ? document.getElementById(container) : container;
    if (!el || !Array.isArray(curves) || !curves.length) return false;

    const usePhi = opts.usePhi !== false;
    const grid = this._ciSurfaceGrid(curves, usePhi);
    if (!grid.z.length) return false;

    const traces = [{
      type: "surface",
      x: grid.x, y: grid.y, z: grid.z,
      opacity: 0.62,
      showscale: false,
      colorscale: [[0, COLOR_SUP], [1, COLOR_SUP]],
      contours: {
        x: { show: true, color: "rgba(200,200,220,0.30)", width: 1, highlight: false },
        y: { show: true, color: "rgba(200,200,220,0.30)", width: 1, highlight: false },
      },
      lighting: { ambient: 0.9, diffuse: 0.3, specular: 0.1, roughness: 0.8 },
      hovertemplate: "M2 %{x:.2f}<br>M3 %{y:.2f}<br>P %{z:.2f}<extra></extra>",
      name: "Superficie",
    }];

    // Rangos (con los de la demanda incluidos, para que el punto nunca quede
    // fuera de cuadro cuando la columna está sobrecargada).
    let mx = 0, mz0 = Infinity, mz1 = -Infinity;
    grid.x.forEach((row, i) => row.forEach((v, j) => {
      mx = Math.max(mx, Math.abs(v), Math.abs(grid.y[i][j]));
      mz0 = Math.min(mz0, grid.z[i][j]);
      mz1 = Math.max(mz1, grid.z[i][j]);
    }));

    const dem = demand
      ? {
          m2: Number(demand.M2 || 0) * N_TO_TONF,
          m3: Number(demand.M3 || 0) * N_TO_TONF,
          p: Number(demand.P || 0) * N_TO_TONF,
        }
      : null;
    if (dem) {
      mx = Math.max(mx, Math.abs(dem.m2), Math.abs(dem.m3));
      mz0 = Math.min(mz0, dem.p);
      mz1 = Math.max(mz1, dem.p);
    }
    if (!(mx > 0)) mx = 1;
    if (!Number.isFinite(mz0)) { mz0 = -1; mz1 = 1; }

    const padM = mx * 0.15;
    const padZ = (mz1 - mz0) * 0.1 || 1;

    // Curva de corte. Por defecto en el ángulo de la demanda; `opts.cutAngleDeg`
    // deja recorrer la superficie a mano (el panel 2D usa el mismo ángulo, así
    // que las dos vistas se mueven juntas).
    const cutAngle = this._ciCutAngle(demand, opts);
    if (cutAngle !== null) {
      const cut = this._ciCutCurve(curves, cutAngle, usePhi);
      if (cut) {
        traces.push({
          type: "scatter3d", mode: "lines",
          x: cut.x, y: cut.y, z: cut.z,
          line: { color: COLOR_CORTE, width: 6 },
          name: `Corte θ=${cutAngle.toFixed(1)}°`,
          hovertemplate: "M2 %{x:.2f}<br>M3 %{y:.2f}<br>P %{z:.2f}<extra>corte</extra>",
        });
      }
    }

    // Ejes P / M2 / M3 en rojo, como los dibuja ETABS.
    const eje = (x, y, z) => ({
      type: "scatter3d", mode: "lines", x, y, z,
      line: { color: COLOR_EJE, width: 2 },
      showlegend: false, hoverinfo: "skip",
    });
    traces.push(eje([-mx - padM, mx + padM], [0, 0], [0, 0]));
    traces.push(eje([0, 0], [-mx - padM, mx + padM], [0, 0]));
    traces.push(eje([0, 0], [0, 0], [mz0 - padZ, mz1 + padZ]));
    traces.push({
      type: "scatter3d", mode: "text",
      x: [mx + padM * 1.6, 0, 0],
      y: [0, mx + padM * 1.6, 0],
      z: [0, 0, mz1 + padZ * 1.6],
      text: ["M2", "M3", "P"],
      textfont: { color: COLOR_EJE, size: 13 },
      showlegend: false, hoverinfo: "skip",
    });

    // Punto de demanda + su vertical al plano M2-M3, para poder leer dónde cae.
    if (dem) {
      const ok = demand.status === "OK";
      traces.push({
        type: "scatter3d", mode: "markers",
        x: [dem.m2], y: [dem.m3], z: [dem.p],
        marker: { size: 7, color: ok ? COLOR_DEMANDA_OK : COLOR_DEMANDA_NG, symbol: "diamond",
                  line: { color: "#fff", width: 1 } },
        name: `Demanda (ratio ${Number(demand.ratio ?? 0).toFixed(3)})`,
        hovertemplate: "M2 %{x:.2f}<br>M3 %{y:.2f}<br>P %{z:.2f}<extra>demanda</extra>",
      });
      traces.push({
        type: "scatter3d", mode: "lines",
        x: [dem.m2, dem.m2], y: [dem.m3, dem.m3], z: [0, dem.p],
        line: { color: ok ? COLOR_DEMANDA_OK : COLOR_DEMANDA_NG, width: 2, dash: "dot" },
        showlegend: false, hoverinfo: "skip",
      });
    }

    const layout = {
      margin: { l: 0, r: 0, t: 0, b: 0 },
      paper_bgcolor: "rgba(0,0,0,0)",
      showlegend: true,
      legend: { x: 0, y: 1, font: { color: "#9ca3af", size: 10 }, bgcolor: "rgba(0,0,0,0)" },
      scene: {
        // Cubo fijo: sin esto Plotly estira cada eje a su propio rango y la
        // superficie se ve deformada según la columna.
        aspectmode: "cube",
        camera: { eye: { x: 1.5, y: 1.5, z: 0.9 } },
        xaxis: { title: { text: "M2 (tonf·m)", font: { color: "#9ca3af", size: 10 } },
                 range: [-mx - padM, mx + padM], color: "#6b7280",
                 gridcolor: "rgba(107,114,128,0.25)", zerolinecolor: "rgba(107,114,128,0.5)" },
        yaxis: { title: { text: "M3 (tonf·m)", font: { color: "#9ca3af", size: 10 } },
                 range: [-mx - padM, mx + padM], color: "#6b7280",
                 gridcolor: "rgba(107,114,128,0.25)", zerolinecolor: "rgba(107,114,128,0.5)" },
        zaxis: { title: { text: "P (tonf)", font: { color: "#9ca3af", size: 10 } },
                 range: [mz0 - padZ, mz1 + padZ], color: "#6b7280",
                 gridcolor: "rgba(107,114,128,0.25)", zerolinecolor: "rgba(107,114,128,0.5)" },
      },
    };

    Plotly.newPlot(el, traces, layout, {
      responsive: true,
      displaylogo: false,
      // Se deja `toImage`: el diagrama va a informes, conviene poder bajarlo PNG.
      modeBarButtonsToRemove: ["resetCameraLastSave3d"],
      toImageButtonOptions: { filename: "diagrama-interaccion", scale: 2 },
    });

    return true;
  },

  /**
   * Ángulo del corte: el que pidan explícitamente, si no el de la demanda.
   * `null` si no hay ninguno (no se dibuja corte).
   */
  _ciCutAngle(demand, opts = {}) {
    const forzado = Number(opts.cutAngleDeg);
    if (Number.isFinite(forzado)) return ((forzado % 360) + 360) % 360;
    const t = Number(demand?.thetaDeg);
    return Number.isFinite(t) ? ((t % 360) + 360) % 360 : null;
  },

  /**
   * Panel 2D P-M de UN corte — el "Current Interaction Curve" del diálogo de
   * ETABS. Es la misma curva magenta del 3D, vista de perfil.
   *
   * El momento del eje horizontal es la PROYECCIÓN sobre el plano de flexión:
   * M = M2·senθ + M3·cosθ. Con θ=0 queda M3 y con θ=90° queda M2, que es la
   * convención del motor (ver compute_pn_mn_at).
   *
   * El punto de demanda se dibuja en su momento RESULTANTE |M| — exacto cuando
   * el corte está en el ángulo de la demanda, que es el caso por defecto.
   */
  renderColumnInteraction2D(container, curves, demand = null, opts = {}) {
    const el = typeof container === "string" ? document.getElementById(container) : container;
    if (!el || !Array.isArray(curves) || !curves.length) return false;

    const usePhi = opts.usePhi !== false;
    const ang = this._ciCutAngle(demand, opts);
    if (ang === null) return false;

    const cut = this._ciCutCurve(curves, ang, usePhi);
    if (!cut) return false;

    // Momento RESULTANTE |M| = hypot(M2, M3). Es lo mismo que proyectar sobre
    // el plano de flexión (todos los puntos del corte están en ese plano), pero
    // no depende de ninguna convención de signo — y así queda consistente con
    // el punto de demanda, que también se dibuja por su resultante.
    //
    // Antes se usaba M2·senθ + M3·cosθ, que con el signo de M2 del motor se
    // degradaba a |M|·cos(2θ): a θ=40.6° eso da 0.15·|M| y la curva salía
    // aplastada contra el eje.
    const m = cut.x.map((m2, i) => Math.hypot(m2, cut.y[i]));
    const pp = cut.z;

    const traces = [{
      type: "scatter", mode: "lines",
      x: m, y: pp,
      line: { color: COLOR_CORTE, width: 2.5 },
      name: `ΦMn (θ=${ang.toFixed(1)}°)`,
      hovertemplate: "M %{x:.2f} tonf·m<br>P %{y:.2f} tonf<extra></extra>",
    }];

    let mMax = Math.max(...m.map(Math.abs), 1);
    let pLo = Math.min(...pp), pHi = Math.max(...pp);

    if (demand) {
      const md = Math.hypot(Number(demand.M2 || 0), Number(demand.M3 || 0)) * N_TO_TONF;
      const pd = Number(demand.P || 0) * N_TO_TONF;
      mMax = Math.max(mMax, md);
      pLo = Math.min(pLo, pd);
      pHi = Math.max(pHi, pd);

      const ok = demand.status === "OK";
      const col = ok ? COLOR_DEMANDA_OK : COLOR_DEMANDA_NG;
      traces.push({
        type: "scatter", mode: "markers",
        x: [md], y: [pd],
        marker: { size: 10, color: col, symbol: "diamond", line: { color: "#fff", width: 1 } },
        name: `Demanda (ratio ${Number(demand.ratio ?? 0).toFixed(3)})`,
        hovertemplate: "M %{x:.2f} tonf·m<br>P %{y:.2f} tonf<extra>demanda</extra>",
      });
      // Rayo desde el origen: el ratio es cuánto de él se recorre hasta la curva.
      traces.push({
        type: "scatter", mode: "lines",
        x: [0, md], y: [0, pd],
        line: { color: col, width: 1, dash: "dot" },
        showlegend: false, hoverinfo: "skip",
      });
    }

    const padM = mMax * 0.12;
    const padP = (pHi - pLo) * 0.08 || 1;
    const ejeCfg = (titulo) => ({
      title: { text: titulo, font: { color: "#9ca3af", size: 10 } },
      color: "#6b7280", tickfont: { size: 9 },
      gridcolor: "rgba(107,114,128,0.20)",
      zerolinecolor: COLOR_EJE, zerolinewidth: 1.5,
    });

    Plotly.newPlot(el, traces, {
      margin: { l: 46, r: 10, t: 8, b: 36 },
      paper_bgcolor: "rgba(0,0,0,0)",
      plot_bgcolor: "rgba(0,0,0,0)",
      showlegend: true,
      legend: { x: 0, y: 1, font: { color: "#9ca3af", size: 9 }, bgcolor: "rgba(0,0,0,0)" },
      xaxis: { ...ejeCfg("M (tonf·m)"), range: [Math.min(0, -padM), mMax + padM] },
      yaxis: { ...ejeCfg("P (tonf)"), range: [pLo - padP, pHi + padP] },
    }, {
      responsive: true,
      displaylogo: false,
      modeBarButtonsToRemove: ["lasso2d", "select2d"],
      toImageButtonOptions: { filename: "curva-interaccion", scale: 2 },
    });

    return true;
  },

  /**
   * Filas de la tabla "Curve Data" — los NÚMEROS detrás del corte que se dibuja,
   * mismo formato que la tabla del diálogo de ETABS (Punto / P / M2 / M3).
   *
   * Orden: de compresión pura hacia tracción, igual que ETABS. Es el orden
   * natural del barrido invertido (c grande = más comprimido), y dentro de la
   * meseta del tope axial deja el momento creciendo, que es como ETABS numera
   * sus puntos 1 y 2.
   *
   * Se colapsan filas consecutivas idénticas: el barrido de c satura en
   * compresión pura y si no, la tabla saldría con media docena de filas
   * repetidas al principio.
   */
  columnInteractionCurveRows(curves, thetaDeg, usePhi = true) {
    const cut = this._ciCutCurve(curves, thetaDeg, usePhi);
    if (!cut) return [];

    const filas = cut.z.map((p, i) => ({ P: p, M2: cut.x[i], M3: cut.y[i] })).reverse();

    const out = [];
    for (const f of filas) {
      const ant = out[out.length - 1];
      if (ant && Math.abs(ant.P - f.P) < 0.005
              && Math.abs(ant.M2 - f.M2) < 0.005
              && Math.abs(ant.M3 - f.M3) < 0.005) continue;
      out.push(f);
    }

    return out.map((f, i) => ({ n: i + 1, P: f.P, M2: f.M2, M3: f.M3, M: Math.hypot(f.M2, f.M3) }));
  },

  /** La tabla como TSV, para pegar en Excel al lado de la de ETABS. */
  columnInteractionCurveTsv(rows, thetaDeg) {
    const num = (v) => (Math.round(v * 10000) / 10000).toString();
    return [
      `Curva a ${Number(thetaDeg).toFixed(3)} deg`,
      "Punto\tP tonf\tM2 tonf-m\tM3 tonf-m",
      ...rows.map((r) => [r.n, num(r.P), num(r.M2), num(r.M3)].join("\t")),
    ].join("\n");
  },

  /** Libera el gráfico (Plotly deja listeners y una escena WebGL viva). */
  destroyColumnInteractionSurface(container) {
    const el = typeof container === "string" ? document.getElementById(container) : container;
    if (el) Plotly.purge(el);
  },
};
