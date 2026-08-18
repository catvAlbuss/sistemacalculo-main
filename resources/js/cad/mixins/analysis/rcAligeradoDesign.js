// resources/js/cad/mixins/analysis/rcAligeradoDesign.js
//
// Diseño de losa aligerada (viguetas) A PARTIR del modelo: el usuario
// selecciona 1+ losas (paños) que forman la vigueta continua, y solo tipea
// B (ancho de vigueta) y T (altura total del aligerado) — todo lo demás sale
// del modelo:
//   - Lti (longitud de cada tramo): proyección de cada losa seleccionada
//     sobre su propio eje de armado (`loadDistAngle`, el mismo dato que ya
//     usa "Area Load to Frame" para saber en qué dirección arma la losa).
//   - CM/CV: de `area.areaLoads` (Assign ▸ Area/Shell Loads), clasificadas
//     por `patternType` con el mismo criterio que el resto del motor
//     (_getLoadPatternTypeForSeismic).
//   - fc/fy: del material de la Sección de Losa asignada.
//
// OJO — T (altura total real, ej. 0.20m) NO sale de `area.section.thickness`:
// ese campo es el espesor EQUIVALENTE que usa ETABS/nuestro motor para
// masa/rigidez de la losa como membrana (p.ej. una losa "Aligerado e=0.20"
// declara SLABTHICKNESS 0.125 en el .e2k real — 12.5cm, no 20cm). Son
// magnitudes distintas con el mismo nombre; usar la de la sección ahí sería
// alimentar el diseño con el número equivocado. Por eso B y T se piden
// siempre a mano, con el mismo criterio que pidió el usuario.
//
// El motor de cálculo sigue siendo el Octave `aligerados.m` (mismo endpoint
// /aligerados que resources/js/vigas — ver OctavePlotController::graficarAligerados).
// Este mixin arma los mismos vectores que antes tipeaba la tabla manual
// (b,h,Lt,WD,WV) y llama al mismo endpoint.

import { read as readmat } from "mat-for-js";
import Plotly from "plotly.js-dist-min";

export const rcAligeradoDesignMixin = {
  /**
   * Punto de entrada (menú Diseñar ▸ Diseñar Losa Aligerada...). Requiere 1+
   * losas seleccionadas, todas con Sección de Losa "una vía" asignada
   * (`oneWayLoadDist === true` — lo decide el modal de Slab Sections según
   * el nombre/flag de la sección, ver assign-dialogs.js).
   */
  openRcAligeradoDesignDialog() {
    const selected = (this.getSelectedAreasForAssign?.() || []).filter(
      (a) => (a?.areaType || a?.type) === "slab",
    );

    if (!selected.length) {
      this.showMessage?.("Selecciona primero la(s) losa(s) del aligerado a diseñar.", "warning");
      return;
    }

    let built;
    try {
      built = this._rcBuildAligeradoInput(selected);
    } catch (err) {
      this.showMessage?.(err.message, "warning");
      return;
    }

    this._rcAligeradoDesignInput = built;
    this.rcAligeradoDesign = { results: null };

    window.dispatchEvent(
      new CustomEvent("open-aligerado-design-modal", {
        detail: { input: built },
      }),
    );
  },

  /**
   * Arma {parametros, tramos, thicknessCm...} desde las losas seleccionadas.
   * A diferencia de vigas/columnas, NO depende de un análisis de fuerzas
   * previo (frameForceResults) — la carga de un aligerado sale directo del
   * metrado de área de su propia losa, no de un análisis de barras.
   */
  _rcBuildAligeradoInput(areas) {
    if (!areas.length) throw new Error("No hay losas seleccionadas.");

    const first = areas[0];
    if (first.oneWayLoadDist !== true) {
      throw new Error(
        'La losa seleccionada no está marcada como "una vía" — asígnale una Sección de Losa de aligerado ' +
          "(Assign ▸ Losa ▸ Sección de Losa) antes de diseñarla.",
      );
    }

    const angleDeg = Number(first.loadDistAngle) || 0;
    const ang = (angleDeg * Math.PI) / 180;
    const dx = Math.cos(ang);
    const dy = Math.sin(ang);

    // Proyección de cada losa sobre el eje de armado: la extensión proyectada
    // es la longitud del tramo. También ordena las losas de punta a punta
    // por si se seleccionó más de un paño (continuidad del aligerado entre
    // paños vecinos en la misma dirección).
    const projected = areas.map((area) => {
      const pts = Array.isArray(area.points) ? area.points : [];
      if (pts.length < 3) {
        throw new Error("Una de las losas seleccionadas no tiene geometría válida.");
      }
      const s = pts.map((p) => (Number(p.x) || 0) * dx + (Number(p.y) || 0) * dy);
      const min = Math.min(...s);
      const max = Math.max(...s);
      return { area, min, max, center: (min + max) / 2, length: max - min };
    });

    projected.sort((a, b) => a.center - b.center);

    const tramos = projected.map(({ area, length }) => {
      const loads = Array.isArray(area.areaLoads) && area.areaLoads.length
        ? area.areaLoads
        : Array.isArray(area.loads)
          ? area.loads
          : [];

      let wd = 0; // kgf/m²
      let wv = 0;
      loads.forEach((l) => {
        if (!l || (l.type && l.type !== "uniform")) return;
        const value = Number(l.value) || 0;
        if (!(value > 0)) return;
        const patternType = this._getLoadPatternTypeForSeismic(l.loadCase || "CM");
        if (patternType === "Dead") wd += value;
        else if (patternType === "Live" || patternType === "RoofLive") wv += value;
      });

      // Peso propio de la losa entra como carga muerta adicional — mismo
      // criterio que _buildSeismicSlabToBeamLoadsForPayload.
      wd += Number(area.slabSelfWeightKgM2) || 0;

      return {
        lti: length,
        wdi: wd / 1000, // kgf/m² -> tonf/m²
        wvi: wv / 1000,
        areaId: area.id ?? null,
      };
    });

    if (tramos.some((t) => !(t.lti > 0.05))) {
      throw new Error(
        "Alguna losa seleccionada tiene una longitud casi nula en la dirección de armado — revisa la geometría.",
      );
    }

    const { fc, fy } = this._rcResolveAreaMaterial(first);

    return {
      parametros: { fc, fy },
      tramos,
      angleDeg,
    };
  },

  /**
   * Llamado desde el modal (botón "Diseñar") con B/T/anchoTributario/frm/frv
   * ya confirmados por el usuario. Arma los mismos vectores Octave que
   * armaba la tabla manual (adm_aligerados_grafico.js) y llama al mismo
   * endpoint /aligerados — el motor (aligerados.m) no cambia.
   */
  async rcAligeradoDesignRun({ fc, fy, b, t, anchoTributario, frm, frv }) {
    const built = this._rcAligeradoDesignInput;
    if (!built) return null;

    const vec = (arr) => "[" + arr.join(",") + "]";
    const n = built.tramos.length;

    // El form original (adm_aligerados_grafico.js) manda el token vía el
    // <input name="_token"> que agrega @csrf en el <form> de Blade — acá se
    // arma el FormData desde cero (no hay <form> de por medio), así que hay
    // que leer el token del <meta name="csrf-token"> del layout a mano.
    // Sin esto Laravel devuelve 419 (sesión/CSRF inválido) antes de llegar
    // al controller.
    const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute("content");

    const formData = new FormData();
    if (csrfToken) formData.append("_token", csrfToken);
    formData.append("fc", fc);
    formData.append("Fy", fy);
    formData.append("frm", frm);
    formData.append("frv", frv);
    formData.append("anchoTributario", anchoTributario);
    formData.append("b", vec(built.tramos.map(() => b)));
    formData.append("h", vec(built.tramos.map(() => t)));
    formData.append("Lt", vec(built.tramos.map((tr) => tr.lti)));
    formData.append("WD", vec(built.tramos.map((tr) => tr.wdi)));
    formData.append("WV", vec(built.tramos.map((tr) => tr.wvi)));

    const response = await fetch("/aligerados", {
      method: "POST",
      body: formData,
      headers: csrfToken ? { "X-CSRF-TOKEN": csrfToken } : undefined,
    });
    const contentType = response.headers.get("Content-Type");

    if (!contentType || !contentType.includes("application/octet-stream")) {
      const error = await response.text();
      throw new Error(error);
    }

    const matData = await response.arrayBuffer();
    const parsed = readmat(matData);
    const results = this._rcAligeradoParseResults(parsed, built.tramos, Number(fc), Number(t));

    this.rcAligeradoDesign = { results };

    window.dispatchEvent(new CustomEvent("rc-aligerado-design-updated", { detail: { results } }));

    // Tiras de geometría/cargas/asd/cortante + diagramas Plotly — se
    // escriben directo al DOM (mismos ids que adm_aligerados_grafico.js),
    // no vía Alpine, porque son visualizaciones fijas, no estado reactivo.
    // A diferencia del original (que esperaba 500ms a que Tabulator
    // terminara de poblar sus tablas), acá no hace falta: todo es síncrono.
    this._rcAligeradoRenderDiagrams(built, { b: Number(b), t: Number(t) }, results);

    return results;
  },

  /**
   * Aplana T1 (flexión, 3 filas/tramo: START/MIDDLE/END) y T2 (cortante, 2
   * filas/tramo: START/END) del .mat a arrays de objetos, y les agrega lo
   * que en el original salía de columnas MUTATOR/calculadas aparte:
   *   - T1.diametro: sugerencia de varilla según Asd (mismos umbrales que
   *     T1Model.mutators.diametro en adm_aligerados_grafico.js).
   *   - T2.x / T2.b: solo si el cortante NO pasa (Ratio>=100%) — x es la
   *     distancia desde el apoyo al punto donde el cortante iguala lo que
   *     el concreto solo cubre (ahí empieza a hacer falta ensanchar), b es
   *     el ancho de ensanche necesario. Misma fórmula que el original.
   */
  _rcAligeradoParseResults(parsed, tramos, fc, t) {
    const data = parsed?.data || {};

    const toRows = (obj) => {
      const rows = [];
      Object.keys(obj || {}).forEach((key) => {
        (obj[key] || []).forEach((value, index) => {
          rows[index] ??= {};
          rows[index][key] = value;
        });
      });
      return rows;
    };

    const T1 = toRows(data.T1).map((row) => ({
      ...row,
      diametro: this._rcAligeradoDiametro(row.Asd),
    }));

    const T2raw = toRows(data.T2);
    let dVu = 0;
    const T2 = T2raw.map((row, index) => {
      if (index % 2 === 0) {
        const next = T2raw[index + 1];
        dVu = -(Number(next?.Vu) || 0) - Number(row.Vu);
      }
      const L = tramos[Math.floor(index / 2)]?.lti || 0;
      const x = dVu !== 0 ? ((row.Vc - row.Vu) * L) / dVu : 0;
      const b = (row.Vu * 1000) / (0.85 * 0.53 * Math.sqrt(fc) * t * 100);
      const needsWiden = row.Ratio >= 100;
      return { ...row, x: needsWiden ? x : 0, b: needsWiden ? b : 0 };
    });

    return {
      T1,
      T2,
      shear: { L4: data.L4, SHEART: data.SHEART, axexx: data.axexx },
      moment: { x1n: data.x1n, y1n: data.y1n, x2n: data.x2n, y2n: data.y2n, L5: data.L5 },
      numTramos: tramos.length,
    };
  },

  /** Sugerencia de varilla según As requerido (cm²) — mismos umbrales que el original. */
  _rcAligeradoDiametro(asd) {
    const v = parseFloat(asd);
    if (!(v > 0)) return "";
    if (v <= 0.71) return '1 Ø 3/8"';
    if (v <= 1.27) return '1 Ø 1/2"';
    if (v <= 2) return '1 Ø 5/8"';
    if (v <= 2.71) return '1 Ø 5/8" + 1 Ø 3/8"';
    if (v <= 3.27) return '1 Ø 5/8" + 1/2"';
    if (v <= 4) return '2 Ø 5/8"';
    if (v <= 4.71) return '2 Ø 5/8" + 1 Ø 3/8"';
    if (v <= 5.27) return '2 Ø 5/8" + 1 Ø 1/2"';
    if (v <= 6) return '3 Ø 5/8"';
    if (v <= 6.54) return '2 Ø 5/8" + 2 Ø 1/2"';
    return "";
  },

  /**
   * Tiras de geometría/carga muerta/carga viva/asd/cortante (HTML) + los 2
   * diagramas Plotly (fuerza cortante, momento flector) — porteado 1:1 de
   * adm_aligerados_grafico.js, adaptado a un solo B/T compartido (antes era
   * bi/hi por fila de la tabla) y a `tramos`/`results` en vez de la tabla
   * Tabulator + T1/T2 de Tabulator. Escribe directo a los div#id del modal
   * (aligerado-design-modal.blade.php) — deben existir en el DOM (no detrás
   * de x-if) para que esto no falle en silencio.
   */
  _rcAligeradoRenderDiagrams(built, { b, t }, results) {
    const tramos = built.tramos;
    const total = tramos.reduce((acc, tr) => acc + (Number(tr.lti) || 0), 0);
    if (!(total > 0)) return;

    const topHeightWdi = Math.max(...tramos.map((tr) => tr.wdi));
    const topHeightWvi = Math.max(...tramos.map((tr) => tr.wvi));

    const percents = tramos.map((tr) => (Number(tr.lti) / total) * 100);
    const minWidth = 10;
    let remainingWidth = 100;
    let remainingSum = total;
    const adjustedWidths = {};
    percents.forEach((pct, index) => {
      if (pct < minWidth) {
        adjustedWidths[index] = minWidth;
        remainingWidth -= minWidth;
        remainingSum -= tramos[index].lti;
      }
    });
    percents.forEach((_, index) => {
      adjustedWidths[index] ??= (tramos[index].lti * remainingWidth) / remainingSum;
    });

    const viguetaComponent = (percent, width, isLast) => `
      <div class="text-center text-sm inline-block" style="width: ${percent}%">
        <div><p>Vigueta</p><p>${b.toFixed(2)} m x ${t.toFixed(2)} m</p></div>
        <div class="border-t-4 ${!isLast ? "border-l-4" : "border-l-4 border-r-4"}">${width} m</div>
      </div>`;
    const carga = (name, percentX, percentY, width, cm, isLast) => `
      <div class="text-center text-sm inline-block" style="width: ${percentX}%">
        <p style="transform: translateY(calc(128px - 128px * ${percentY} / 100))">${name}=${cm.toFixed(2)} tn/m²</p>
        <div class="mb-2 h-[128px] relative flex items-center justify-center">
          <div class="absolute bottom-0 border-4 w-full border-indigo-500" style="height: ${percentY}%"></div>
        </div>
        <div class="border-t-4 ${!isLast ? "border-l-4" : "border-l-4 border-r-4"}">${width} m</div>
      </div>`;
    const asdComponent = (percentX, asd1, d1, asd2, d2, asd3, d3, isLast, L) => {
      const l_div_3 = (L / 3).toFixed(2);
      const l_dot_7 = (0.7 * L).toFixed(2);
      return `
      <div class="text-center text-xs inline-block" style="width: ${percentX}%">
        <div class="flex justify-between">
          <div class="border-l-4 px-2">L = ${l_div_3}m<br>${parseFloat(asd1).toFixed(2)} cm²<br>${d1}</div>
          <div class="${!isLast ? "" : "border-r-4"} px-2">L = ${l_div_3}m<br>${parseFloat(asd3).toFixed(2)} cm²<br>${d3}</div>
        </div>
        <div class="border-t-4 ${!isLast ? "border-l-4" : "border-l-4 border-r-4"}">${parseFloat(asd2).toFixed(2)} cm²<br>${d2}<br>L = ${l_dot_7}m</div>
      </div>`;
    };
    const vuComponent = (width, percentX, vu1, x1, vu2, x2, isLast) => `
      <div class="text-center text-xs inline-block" style="width: ${percentX}%">
        <div class="flex justify-between">
          <div class="border-l-4 px-2">${parseFloat(vu1).toFixed(2)} Tn<br>${x1.toFixed(2)} m</div>
          <div class="${!isLast ? "" : "border-r-4"} px-2">${parseFloat(vu2).toFixed(2)} Tn<br>${x2.toFixed(2)} m</div>
        </div>
        <div class="border-t-4 ${!isLast ? "border-l-4" : "border-l-4 border-r-4"}">${width} m</div>
      </div>`;

    const setHtml = (id, html) => {
      const el = document.getElementById(id);
      if (el) el.innerHTML = html;
    };

    setHtml(
      "aligerado-viguetas",
      tramos.reduce((html, tr, i) => html + viguetaComponent(adjustedWidths[i], tr.lti, i === tramos.length - 1), ""),
    );
    setHtml(
      "aligerado-cargaMuerta",
      tramos.reduce(
        (html, tr, i) =>
          html + carga("Cm", adjustedWidths[i], (tr.wdi / topHeightWdi) * 100, tr.lti, tr.wdi, i === tramos.length - 1),
        "",
      ),
    );
    setHtml(
      "aligerado-cargaViva",
      tramos.reduce(
        (html, tr, i) =>
          html + carga("Cv", adjustedWidths[i], (tr.wvi / topHeightWvi) * 100, tr.lti, tr.wvi, i === tramos.length - 1),
        "",
      ),
    );

    if (results?.T1?.length) {
      setHtml(
        "aligerado-asd",
        tramos.reduce((html, tr, i) => {
          const v = results.T1;
          return (
            html +
            asdComponent(
              adjustedWidths[i],
              v[i * 3].Asd, v[i * 3].diametro,
              v[i * 3 + 1].Asd, v[i * 3 + 1].diametro,
              v[i * 3 + 2].Asd, v[i * 3 + 2].diametro,
              i === tramos.length - 1,
              tr.lti,
            )
          );
        }, ""),
      );
    }

    if (results?.T2?.length) {
      setHtml(
        "aligerado-vu",
        tramos.reduce((html, tr, i) => {
          const v = results.T2;
          return (
            html +
            vuComponent(tr.lti, adjustedWidths[i], v[i * 2].Vu, v[i * 2].x, v[i * 2 + 1].Vu, v[i * 2 + 1].x, i === tramos.length - 1)
          );
        }, ""),
      );
    }

    // Diagramas Plotly — mismas trazas que adm_aligerados_grafico.js.
    if (document.getElementById("aligerado-fuerzasCortantes") && results?.shear?.SHEART) {
      const tracesFC = results.shear.SHEART.map((sheari) => ({
        x: results.shear.L4, y: sheari, mode: "lines", line: { width: 2 },
      }));
      tracesFC.push({ x: results.shear.L4, y: results.shear.axexx, mode: "lines", line: { width: 2 } });
      Plotly.newPlot(
        "aligerado-fuerzasCortantes",
        tracesFC,
        {
          showlegend: false,
          height: 320,
          margin: { t: 40, b: 40, l: 50, r: 20 },
          title: { text: "Diagrama de Fuerzas Cortantes (Tn)" },
          xaxis: { title: { text: "Longitud (m)" } },
          yaxis: { title: { text: "Fuerzas cortantes (Tn)" } },
        },
        { responsive: true },
      );
    }

    if (document.getElementById("aligerado-momentosFlectores") && results?.moment?.x1n) {
      const tracesMF = results.moment.x1n
        .map((x1, index) => ({ x: x1, y: results.moment.y1n[index], mode: "lines", line: { width: 2 } }))
        .concat(
          results.moment.x2n.map((x2, index) => ({ x: x2, y: results.moment.y2n[index], mode: "lines", line: { width: 2 } })),
        );
      tracesMF.push({ x: results.moment.L5, y: results.moment.L5.map(() => 0), mode: "lines", line: { width: 2 } });
      Plotly.newPlot(
        "aligerado-momentosFlectores",
        tracesMF,
        {
          showlegend: false,
          height: 320,
          margin: { t: 40, b: 40, l: 50, r: 20 },
          title: { text: "Diagrama de Momentos Flectores (Tn-m)" },
          xaxis: { title: { text: "Longitud (m)" } },
          yaxis: { title: { text: "Momentos flectores (Tn-m)" } },
        },
        { responsive: true },
      );
    }
  },
};
