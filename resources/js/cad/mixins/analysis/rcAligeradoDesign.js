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
import html2canvas from "html2canvas";
import logo from "../../../../img/rizabalasociados.png";

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
   * Agrupa las losas seleccionadas por EJE de armado y arma cada grupo por
   * separado (ver _rcBuildAligeradoGroup). A diferencia de vigas/columnas,
   * NO depende de un análisis de fuerzas previo (frameForceResults) — la
   * carga de un aligerado sale directo del metrado de área de su propia
   * losa, no de un análisis de barras.
   *
   * loadDistAngle es un eje, no un sentido — 0° y 180° son la misma línea
   * (así lo trata la acción "voltear flecha" en assign-dialogs.js, que
   * normaliza con % 180), por eso se agrupa módulo 180. Losas con la misma
   * flecha son tramos de la misma vigueta continua y se combinan en una
   * tabla; losas con flecha en otra dirección NO se mezclan — cada
   * dirección distinta sale como su propio grupo, con su propia tabla y
   * gráfico independiente (una losa perpendicular a las demás no es
   * continuación de la misma vigueta).
   */
  _rcBuildAligeradoInput(areas) {
    if (!areas.length) throw new Error("No hay losas seleccionadas.");

    const norm180 = (deg) => ((deg % 180) + 180) % 180;
    const axisDiff = (a, b) => {
      const d = Math.abs(norm180(a) - norm180(b));
      return Math.min(d, 180 - d);
    };
    const ANGLE_TOLERANCE_DEG = 2;

    areas.forEach((area) => {
      if (area.oneWayLoadDist !== true) {
        throw new Error(
          'La losa seleccionada no está marcada como "una vía" — asígnale una Sección de Losa de aligerado ' +
            "(Assign ▸ Losa ▸ Sección de Losa) antes de diseñarla.",
        );
      }
    });

    // 1) Agrupa por PISO (elevación de la losa, area.z) — una vigueta es un
    // elemento físico de un solo piso; dos losas en pisos distintos jamás
    // pueden ser el mismo tramo continuo, sin importar que compartan
    // dirección o estén alineadas en planta (están separadas por el resto
    // de la estructura entre niveles). Se agrupa por elevación en vez de un
    // campo "story" porque area.z siempre existe (venga de .e2k o dibujada
    // a mano), y dos pisos reales nunca están a menos de la tolerancia.
    const ELEVATION_TOLERANCE_M = 0.05;
    const elevationBuckets = [];
    areas.forEach((area) => {
      const z = Number(area.z) || 0;
      let bucket = elevationBuckets.find((b) => Math.abs(b.z - z) <= ELEVATION_TOLERANCE_M);
      if (!bucket) {
        bucket = { z, areas: [] };
        elevationBuckets.push(bucket);
      }
      bucket.areas.push(area);
    });

    // 2) Dentro de cada piso, agrupa por EJE de armado (dirección) — losas
    // con flecha en otra dirección nunca son la misma vigueta.
    const PERP_OVERLAP_MIN_FRACTION = 0.3;
    const GAP_TOLERANCE_M = 0.6;

    const chains = [];
    elevationBuckets.forEach(({ areas: areasInStory }) => {
      const angleBuckets = [];
      areasInStory.forEach((area) => {
        const angleDeg = Number(area.loadDistAngle) || 0;
        let bucket = angleBuckets.find((b) => axisDiff(b.angleDeg, angleDeg) <= ANGLE_TOLERANCE_DEG);
        if (!bucket) {
          bucket = { angleDeg, areas: [] };
          angleBuckets.push(bucket);
        }
        bucket.areas.push(area);
      });

      // 3) Dentro de cada piso+dirección, separa en CADENAS físicamente
      // contiguas y alineadas (misma fila/columna) — en la práctica real,
      // una vigueta continua solo existe si los paños están uno a
      // continuación del otro; dos ambientes paralelos pero desalineados NO
      // son la misma vigueta aunque compartan la flecha. _rcSplitByContiguity
      // arma un grafo por paño (conectado si su franja perpendicular al
      // armado se solapa Y no hay un vacío mayor a GAP_TOLERANCE_M entre
      // ellos) y devuelve las componentes conexas.
      angleBuckets.forEach((bucket) => {
        chains.push(
          ...this._rcSplitByContiguity(bucket.areas, bucket.angleDeg, PERP_OVERLAP_MIN_FRACTION, GAP_TOLERANCE_M),
        );
      });
    });

    const groups = chains.map((chainAreas, index) =>
      this._rcBuildAligeradoGroup(chainAreas, Number(chainAreas[0].loadDistAngle) || 0, index),
    );

    // eslint-disable-next-line no-console
    console.log(
      "[aligerado] losas seleccionadas:",
      areas.map((a) => ({ id: a.id, loadDistAngle: a.loadDistAngle })),
      "→ grupos (dirección + contigüidad):",
      groups.map((g) => ({ label: g.label, areaIds: g.tramos.map((t) => t.areaId) })),
    );

    return { groups };
  },

  /**
   * Separa las losas de una misma dirección en cadenas físicamente
   * contiguas y alineadas (misma fila/columna), usando componentes conexas:
   * dos losas quedan en la misma cadena si su franja perpendicular al
   * armado se solapa razonablemente (misma "calle") y no hay un vacío entre
   * ellas en el eje de armado mayor a `gapToleranceM` (una viga/muro
   * divisorio normal entre paños vecinos cabe ahí; un salto mayor no).
   */
  _rcSplitByContiguity(areas, angleDeg, perpOverlapMinFraction, gapToleranceM) {
    if (areas.length <= 1) return [areas];

    const ang = (angleDeg * Math.PI) / 180;
    const dx = Math.cos(ang);
    const dy = Math.sin(ang);
    const px = -dy; // perpendicular unitario al eje de armado
    const py = dx;

    const ranges = areas.map((area) => {
      const pts = Array.isArray(area.points) ? area.points : [];
      const u = pts.map((p) => (Number(p.x) || 0) * dx + (Number(p.y) || 0) * dy);
      const v = pts.map((p) => (Number(p.x) || 0) * px + (Number(p.y) || 0) * py);
      return {
        area,
        umin: Math.min(...u),
        umax: Math.max(...u),
        vmin: Math.min(...v),
        vmax: Math.max(...v),
      };
    });

    const n = ranges.length;
    const parent = Array.from({ length: n }, (_, i) => i);
    const find = (i) => (parent[i] === i ? i : (parent[i] = find(parent[i])));
    const union = (i, j) => {
      const ri = find(i);
      const rj = find(j);
      if (ri !== rj) parent[ri] = rj;
    };

    for (let i = 0; i < n; i++) {
      for (let j = i + 1; j < n; j++) {
        const a = ranges[i];
        const b = ranges[j];

        const vOverlap = Math.min(a.vmax, b.vmax) - Math.max(a.vmin, b.vmin);
        const smallerPerp = Math.min(a.vmax - a.vmin, b.vmax - b.vmin);
        const alignedPerp = smallerPerp > 1e-6 && vOverlap / smallerPerp >= perpOverlapMinFraction;

        const uGap = Math.max(0, Math.max(a.umin, b.umin) - Math.min(a.umax, b.umax));
        const closeEnough = uGap <= gapToleranceM;

        if (alignedPerp && closeEnough) union(i, j);
      }
    }

    const chainsByRoot = new Map();
    ranges.forEach((r, i) => {
      const root = find(i);
      if (!chainsByRoot.has(root)) chainsByRoot.set(root, []);
      chainsByRoot.get(root).push(r.area);
    });

    return Array.from(chainsByRoot.values());
  },

  /**
   * Arma {parametros, tramos, angleDeg, label} para un grupo de losas que
   * comparten el mismo eje de armado (antes era el cuerpo completo de
   * _rcBuildAligeradoInput, cuando solo soportaba un grupo).
   */
  _rcBuildAligeradoGroup(areas, angleDeg, groupIndex) {
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

    const { fc, fy } = this._rcResolveAreaMaterial(areas[0]);
    const z = Number(areas[0].z) || 0;

    return {
      groupIndex,
      label: `Grupo ${groupIndex + 1} — piso z=${z.toFixed(2)}m — eje ${angleDeg.toFixed(0)}°`,
      parametros: { fc, fy },
      tramos,
      angleDeg,
    };
  },

  /**
   * Llamado desde el modal (botón "Diseñar") con B/T/anchoTributario/frm/frv
   * ya confirmados por el usuario — mismo formulario compartido para todos
   * los grupos (una losa aligerada normalmente usa la misma vigueta en todo
   * el piso). Corre el motor Octave una vez POR GRUPO (cada grupo tiene sus
   * propios tramos/Lt/WD/WV) contra el mismo endpoint /aligerados que ya
   * usa resources/js/adm_aligerados_grafico.js.
   */
  async rcAligeradoDesignRun({ fc, fy, b, t, anchoTributario, frm, frv }) {
    const built = this._rcAligeradoDesignInput;
    if (!built?.groups?.length) return null;

    // El form original (adm_aligerados_grafico.js) manda el token vía el
    // <input name="_token"> que agrega @csrf en el <form> de Blade — acá se
    // arma el FormData desde cero (no hay <form> de por medio), así que hay
    // que leer el token del <meta name="csrf-token"> del layout a mano.
    // Sin esto Laravel devuelve 419 (sesión/CSRF inválido) antes de llegar
    // al controller.
    const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute("content");
    const vec = (arr) => "[" + arr.join(",") + "]";

    const runGroup = async (group) => {
      const formData = new FormData();
      if (csrfToken) formData.append("_token", csrfToken);
      formData.append("fc", fc);
      formData.append("Fy", fy);
      formData.append("frm", frm);
      formData.append("frv", frv);
      formData.append("anchoTributario", anchoTributario);
      formData.append("b", vec(group.tramos.map(() => b)));
      formData.append("h", vec(group.tramos.map(() => t)));
      formData.append("Lt", vec(group.tramos.map((tr) => tr.lti)));
      formData.append("WD", vec(group.tramos.map((tr) => tr.wdi)));
      formData.append("WV", vec(group.tramos.map((tr) => tr.wvi)));

      const response = await fetch("/aligerados", {
        method: "POST",
        body: formData,
        headers: csrfToken ? { "X-CSRF-TOKEN": csrfToken } : undefined,
      });
      const contentType = response.headers.get("Content-Type");
      if (!contentType || !contentType.includes("application/octet-stream")) {
        const error = await response.text();
        throw new Error(built.groups.length > 1 ? `${group.label}: ${error}` : error);
      }
      const matData = await response.arrayBuffer();
      const parsed = readmat(matData);
      return this._rcAligeradoParseResults(parsed, group.tramos, Number(fc), Number(t));
    };

    const results = await Promise.all(built.groups.map(runGroup));

    this.rcAligeradoDesign = { results };
    this._rcAligeradoLastForm = { fc, fy, b, t, anchoTributario, frm, frv };

    window.dispatchEvent(new CustomEvent("rc-aligerado-design-updated", { detail: { results } }));

    // Tiras de geometría/cargas/asd/cortante + diagramas Plotly — se
    // escriben directo al DOM (ids sufijados con el índice del grupo), no
    // vía Alpine, porque son visualizaciones fijas, no estado reactivo.
    built.groups.forEach((group, i) => {
      this._rcAligeradoRenderDiagrams(group, { b: Number(b), t: Number(t) }, results[i], i);
    });

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
   * (aligerado-design-modal.blade.php), sufijados con `-${groupIndex}` — uno
   * por cada grupo de losas con distinta dirección de armado (ver
   * _rcBuildAligeradoInput). Deben existir en el DOM (no detrás de x-if)
   * para que esto no falle en silencio.
   */
  _rcAligeradoRenderDiagrams(group, { b, t }, results, groupIndex) {
    const id = (base) => `${base}-${groupIndex}`;
    const tramos = group.tramos;
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

    // Espaciado por estilo INLINE, no clases de Tailwind: esto se renderiza
    // dentro de un iframe aislado al exportar el reporte (ver shot() más
    // abajo) y depender de que el purge de Tailwind haya incluido la clase
    // exacta es frágil — un estilo inline siempre se aplica, sin depender
    // del bundle de CSS.
    const LABEL_GAP = "margin-bottom:10px";
    const LINE_GAP = "padding-top:8px";
    const viguetaComponent = (percent, width, isLast) => `
      <div class="text-center text-sm inline-block" style="width: ${percent}%">
        <div style="${LABEL_GAP}"><p>Vigueta</p><p>${b.toFixed(2)} m x ${t.toFixed(2)} m</p></div>
        <div class="border-t-4 ${!isLast ? "border-l-4" : "border-l-4 border-r-4"}" style="${LINE_GAP}">${width} m</div>
      </div>`;
    const carga = (name, percentX, percentY, width, cm, isLast) => `
      <div class="text-center text-sm inline-block" style="width: ${percentX}%">
        <p style="transform: translateY(calc(128px - 128px * ${percentY} / 100)); ${LABEL_GAP}">${name}=${cm.toFixed(2)} tn/m²</p>
        <div class="mb-2 h-[128px] relative flex items-center justify-center">
          <div class="absolute bottom-0 border-4 w-full border-indigo-500" style="height: ${percentY}%"></div>
        </div>
        <div class="border-t-4 ${!isLast ? "border-l-4" : "border-l-4 border-r-4"}" style="${LINE_GAP}">${width} m</div>
      </div>`;
    const asdComponent = (percentX, asd1, d1, asd2, d2, asd3, d3, isLast, L) => {
      const l_div_3 = (L / 3).toFixed(2);
      const l_dot_7 = (0.7 * L).toFixed(2);
      return `
      <div class="text-center text-xs inline-block" style="width: ${percentX}%">
        <div class="flex justify-between" style="${LABEL_GAP}">
          <div class="border-l-4 px-2">L = ${l_div_3}m<br>${parseFloat(asd1).toFixed(2)} cm²<br>${d1}</div>
          <div class="${!isLast ? "" : "border-r-4"} px-2">L = ${l_div_3}m<br>${parseFloat(asd3).toFixed(2)} cm²<br>${d3}</div>
        </div>
        <div class="border-t-4 ${!isLast ? "border-l-4" : "border-l-4 border-r-4"}" style="${LINE_GAP}">${parseFloat(asd2).toFixed(2)} cm²<br>${d2}<br>L = ${l_dot_7}m</div>
      </div>`;
    };
    const vuComponent = (width, percentX, vu1, x1, vu2, x2, isLast) => `
      <div class="text-center text-xs inline-block" style="width: ${percentX}%">
        <div class="flex justify-between" style="${LABEL_GAP}">
          <div class="border-l-4 px-2">${parseFloat(vu1).toFixed(2)} Tn<br>${x1.toFixed(2)} m</div>
          <div class="${!isLast ? "" : "border-r-4"} px-2">${parseFloat(vu2).toFixed(2)} Tn<br>${x2.toFixed(2)} m</div>
        </div>
        <div class="border-t-4 ${!isLast ? "border-l-4" : "border-l-4 border-r-4"}" style="${LINE_GAP}">${width} m</div>
      </div>`;

    const setHtml = (id, html) => {
      const el = document.getElementById(id);
      if (el) el.innerHTML = html;
    };

    setHtml(
      id("aligerado-viguetas"),
      tramos.reduce((html, tr, i) => html + viguetaComponent(adjustedWidths[i], tr.lti, i === tramos.length - 1), ""),
    );
    setHtml(
      id("aligerado-cargaMuerta"),
      tramos.reduce(
        (html, tr, i) =>
          html + carga("Cm", adjustedWidths[i], (tr.wdi / topHeightWdi) * 100, tr.lti, tr.wdi, i === tramos.length - 1),
        "",
      ),
    );
    setHtml(
      id("aligerado-cargaViva"),
      tramos.reduce(
        (html, tr, i) =>
          html + carga("Cv", adjustedWidths[i], (tr.wvi / topHeightWvi) * 100, tr.lti, tr.wvi, i === tramos.length - 1),
        "",
      ),
    );

    if (results?.T1?.length) {
      setHtml(
        id("aligerado-asd"),
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
        id("aligerado-vu"),
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
    if (document.getElementById(id("aligerado-fuerzasCortantes")) && results?.shear?.SHEART) {
      const tracesFC = results.shear.SHEART.map((sheari) => ({
        x: results.shear.L4, y: sheari, mode: "lines", line: { width: 2 },
      }));
      tracesFC.push({ x: results.shear.L4, y: results.shear.axexx, mode: "lines", line: { width: 2 } });
      Plotly.newPlot(
        id("aligerado-fuerzasCortantes"),
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

    if (document.getElementById(id("aligerado-momentosFlectores")) && results?.moment?.x1n) {
      const tracesMF = results.moment.x1n
        .map((x1, index) => ({ x: x1, y: results.moment.y1n[index], mode: "lines", line: { width: 2 } }))
        .concat(
          results.moment.x2n.map((x2, index) => ({ x: x2, y: results.moment.y2n[index], mode: "lines", line: { width: 2 } })),
        );
      tracesMF.push({ x: results.moment.L5, y: results.moment.L5.map(() => 0), mode: "lines", line: { width: 2 } });
      Plotly.newPlot(
        id("aligerado-momentosFlectores"),
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

  /**
   * Botón "Reporte" del modal — mismo PDF (pdfmake + html2canvas + Plotly.
   * toImage) que ya genera resources/js/adm_aligerados_grafico.js en la
   * página standalone /aligerados-v2, pero armado desde el estado del modal
   * del CAD (built.groups + this.rcAligeradoDesign.results) en vez de la
   * tabla Tabulator. Un grupo = una vigueta continua (ver
   * _rcBuildAligeradoInput); cada grupo sale como su propia sección del PDF,
   * en página aparte si hay más de uno.
   */
  async rcAligeradoGenerarReporte() {
    const built = this._rcAligeradoDesignInput;
    const results = this.rcAligeradoDesign?.results;
    if (!built?.groups?.length || !Array.isArray(results) || results.length !== built.groups.length) {
      this.showMessage?.("Primero corre el diseño (botón DISEÑAR) antes de generar el reporte.", "warning");
      return;
    }

    const fmt2 = (v, suffix = "") => {
      const n = parseFloat(v);
      return Number.isFinite(n) ? n.toFixed(2) + suffix : "-";
    };

    const getBase64Image = (imgPath) =>
      new Promise((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = "Anonymous";
        img.onload = () => {
          const canvas = document.createElement("canvas");
          canvas.width = img.width;
          canvas.height = img.height;
          canvas.getContext("2d").drawImage(img, 0, 0);
          resolve({ dataUrl: canvas.toDataURL("image/png"), width: img.width, height: img.height });
        };
        img.onerror = reject;
        img.src = imgPath;
      });

    // html2canvas clona el DOCUMENTO COMPLETO para calcular estilos, sin
    // importar cuán chico sea el elemento pedido — y el documento acá es la
    // app CAD entera (toolbar, paneles, menús, el canvas WebGL de Babylon),
    // así que cada captura tardaba varios segundos solo en el clonado. Para
    // evitarlo, se copia el html de la tira a un iframe aislado (documento
    // nuevo, casi vacío, con el mismo CSS compilado del layout vía <link>) y
    // se captura ahí — html2canvas clona ese documento diminuto, no la app.
    const shot = async (elementId) => {
      const el = document.getElementById(elementId);
      if (!el || !el.innerHTML.trim()) return null;

      // Los hijos de `el` tienen anchos en % (viguetaComponent, carga, etc.)
      // — deben resolverse contra EL MISMO ancho en px que tenían en vivo
      // (el del modal), si no la proporción alto/ancho sale distinta y la
      // imagen queda "aplastada" (texto pegado a los bordes) al escalarla a
      // los 420pt fijos del PDF. Por eso el iframe usa el ancho real de `el`,
      // no uno arbitrario.
      const width = Math.max(Math.ceil(el.getBoundingClientRect().width), 300);

      const iframe = document.createElement("iframe");
      iframe.style.cssText = `position:fixed; left:-99999px; top:0; width:${width}px; height:800px; border:0;`;
      document.body.appendChild(iframe);
      try {
        const idoc = iframe.contentDocument;
        idoc.open();
        idoc.write("<!doctype html><html><head></head><body style='margin:0;background:#fff;color:#000'></body></html>");
        idoc.close();

        const styleLinks = Array.from(document.querySelectorAll('link[rel="stylesheet"]'));
        styleLinks.forEach((link) => {
          const clone = idoc.createElement("link");
          clone.rel = "stylesheet";
          clone.href = link.href;
          idoc.head.appendChild(clone);
        });
        // Espera a que el CSS clonado cargue en el iframe (si no, html2canvas
        // capturaría antes de que apliquen las clases de Tailwind).
        await Promise.all(
          Array.from(idoc.querySelectorAll('link[rel="stylesheet"]')).map(
            (link) =>
              new Promise((resolve) => {
                if (link.sheet) return resolve();
                link.addEventListener("load", resolve, { once: true });
                link.addEventListener("error", resolve, { once: true });
              }),
          ),
        );

        const wrapper = idoc.createElement("div");
        wrapper.innerHTML = el.innerHTML;
        // white-space:nowrap acá reemplaza la clase whitespace-nowrap que
        // tenía `el` en el modal (solo copiamos su innerHTML, no la clase) —
        // sin esto los tramos pueden partirse en 2 líneas al capturar.
        wrapper.style.cssText = `color:#000; white-space:nowrap; width:${width}px;`;
        idoc.body.appendChild(wrapper);

        // html2canvas resuelve todo (documento, window, tamaño) desde
        // wrapper.ownerDocument — al pertenecer al iframe, clona SU
        // documento (chico), no el de la app.
        const canvas = await html2canvas(wrapper);
        return canvas.toDataURL("image/png");
      } finally {
        iframe.remove();
      }
    };

    const captureGroup = async (group, groupResults, index) => {
      const viguetas = await shot(`aligerado-viguetas-${index}`);
      const cargaMuerta = await shot(`aligerado-cargaMuerta-${index}`);
      const cargaViva = await shot(`aligerado-cargaViva-${index}`);
      const asd = await shot(`aligerado-asd-${index}`);
      const vu = await shot(`aligerado-vu-${index}`);
      const fuerzasCortantes = document.getElementById(`aligerado-fuerzasCortantes-${index}`)
        ? await Plotly.toImage(`aligerado-fuerzasCortantes-${index}`)
        : null;
      const momentosFlectores = document.getElementById(`aligerado-momentosFlectores-${index}`)
        ? await Plotly.toImage(`aligerado-momentosFlectores-${index}`)
        : null;

      const T1Rows = (groupResults?.T1 || []).map((row) => [
        { text: fmt2(row.Mu, " Tn-m"), alignment: "center" },
        { text: fmt2(row.Asd, " cm²"), alignment: "center" },
        { text: fmt2(row.Asmin, " cm²"), alignment: "center" },
        { text: row.diametro || "-", alignment: "center" },
      ]);
      const T2Rows = (groupResults?.T2 || []).map((row) => [
        { text: fmt2(row.Vu, " Tn"), alignment: "center" },
        { text: fmt2(row.Vc, " Tn"), alignment: "center" },
        { text: fmt2(row.Ratio, " %"), alignment: "center" },
        { text: fmt2(row.x, " m"), alignment: "center" },
        { text: fmt2(row.b, " cm"), alignment: "center" },
      ]);

      return { group, viguetas, cargaMuerta, cargaViva, asd, vu, fuerzasCortantes, momentosFlectores, T1Rows, T2Rows };
    };

    this.showMessage?.("Generando reporte...", "info");

    try {
      const { dataUrl: logob64, width, height } = await getBase64Image(logo);

      const captured = [];
      for (let i = 0; i < built.groups.length; i++) {
        captured.push(await captureGroup(built.groups[i], results[i], i));
      }

      const form = this._rcAligeradoLastForm || {};
      const multi = captured.length > 1;

      const content = [
        { text: "DISEÑO DE VIGUETAS DE CONCRETO ARMADO", style: "header", alignment: "left", fontSize: 12 },
        {
          style: "tableExample",
          table: {
            headerRows: 2,
            widths: ["*", "*", "*", "*"],
            body: [
              [{ text: "1.- Datos Generales", style: "tableHeader", colSpan: 4, alignment: "left" }, {}, {}, {}],
              [
                { text: "Nombre", style: "tableHeader", alignment: "center" },
                { text: "Simbolo", style: "tableHeader", alignment: "center" },
                { text: "Valor", style: "tableHeader", colSpan: 2, alignment: "center" },
                {},
              ],
              [
                "Resistencia a compresión del concreto",
                { text: "f'c", alignment: "center" },
                { text: fmt2(form.fc), alignment: "right" },
                { text: "Kg/cm2" },
              ],
              [
                "Esfuerzo de fluencia del acero",
                { text: "fy", alignment: "center" },
                { text: fmt2(form.fy), alignment: "right" },
                { text: "Kg/cm2" },
              ],
              ["Ancho de vigueta", { text: "B", alignment: "center" }, { text: fmt2(form.b), alignment: "right" }, { text: "m" }],
              ["Altura total", { text: "T", alignment: "center" }, { text: fmt2(form.t), alignment: "right" }, { text: "m" }],
              [
                "Factor de amplificación",
                { text: "ØRM", alignment: "center" },
                { text: fmt2(form.frm), alignment: "right" },
                { text: "-" },
              ],
              [
                "Factor de amplificación",
                { text: "ØRV", alignment: "center" },
                { text: fmt2(form.frv), alignment: "right" },
                { text: "-" },
              ],
              [
                "Ancho Tributario",
                { text: "-", alignment: "center" },
                { text: fmt2(form.anchoTributario), alignment: "right" },
                { text: "m" },
              ],
            ],
          },
          layout: "lightHorizontalLines",
        },
      ];

      captured.forEach((c, index) => {
        const first = index === 0;
        if (multi) {
          // El primer grupo sigue justo debajo de la tabla de Datos
          // Generales (sin salto de página) — solo los siguientes grupos
          // arrancan en página nueva.
          content.push({ text: c.group.label, style: "header", fontSize: 12, pageBreak: first ? undefined : "before" });
        }
        content.push({
          text: "2.- Modelo matemático",
          style: "header",
          pageBreak: !multi && !first ? "before" : undefined,
        });
        content.push({
          text: "El modelo matemático usado será una viga simplemente apoyada y una viga empotrada en sus extremos, para calcular las máximas solicitaciones en todos los apoyos.",
          fontSize: 8,
          margin: [50, 0, 50, 10],
        });
        if (c.viguetas) content.push({ image: c.viguetas, width: 420, margin: [50, 8, 50, 14] });

        content.push({ text: "3.- Metrado de cargas", style: "header" });
        content.push({ text: "3.1.- Carga Muerta", fontSize: 8, margin: [60, 0, 50, 10] });
        if (c.cargaMuerta) content.push({ image: c.cargaMuerta, width: 420, margin: [50, 8, 50, 14] });
        content.push({ text: "3.2.- Carga Viva", fontSize: 8, margin: [60, 0, 50, 10] });
        if (c.cargaViva) content.push({ image: c.cargaViva, width: 420, margin: [50, 8, 50, 14] });

        content.push({ text: "4.- Análisis Estructural", style: "header", pageBreak: "before" });
        content.push({ text: "4.1.- Diagrama de fuerzas cortantes", fontSize: 8, margin: [60, 0, 50, 0] });
        if (c.fuerzasCortantes) content.push({ image: c.fuerzasCortantes, width: 420, margin: [50, 8, 50, 8] });
        content.push({ text: "4.2.- Diagrama de momentos flectores", fontSize: 8, margin: [60, 0, 50, 10] });
        if (c.momentosFlectores) content.push({ image: c.momentosFlectores, width: 420, margin: [50, 8, 50, 8] });

        content.push({ text: "5.- DISEÑO EN CONCRETO ARMADO", fontSize: 8, style: "header", pageBreak: "before" });
        content.push({
          style: "tableExample",
          table: {
            headerRows: 2,
            widths: ["*", "*", "*", "*"],
            body: [
              [{ text: "5.1.- Diseño a Flexión", style: "tableHeader", colSpan: 4, alignment: "left" }, {}, {}, {}],
              [
                { text: "Mu Tn-m", style: "tableHeader", alignment: "center" },
                { text: "Asd cm²", style: "tableHeader", alignment: "center" },
                { text: "Asmin cm²", style: "tableHeader", alignment: "center" },
                { text: "Diametro", style: "tableHeader", alignment: "center" },
              ],
              ...c.T1Rows,
            ],
          },
          layout: "lightHorizontalLines",
        });
        if (c.asd) content.push({ image: c.asd, width: 420, margin: [50, 8, 50, 8] });

        content.push({
          style: "tableExample",
          table: {
            headerRows: 2,
            widths: ["*", "*", "*", "*", "*"],
            body: [
              [{ text: "5.2.- Diseño a Cortante", style: "tableHeader", colSpan: 5, alignment: "left" }, {}, {}, {}, {}],
              [
                { text: "Vu Tn", style: "tableHeader", alignment: "center" },
                { text: "Vc Tn", style: "tableHeader", alignment: "center" },
                { text: "Ratio Vu/Vc%", style: "tableHeader", alignment: "center" },
                { text: "Longitud de ensanche", style: "tableHeader", alignment: "center" },
                { text: "Ancho de ensanche", style: "tableHeader", alignment: "center" },
              ],
              ...c.T2Rows,
            ],
          },
          layout: "lightHorizontalLines",
        });
        if (c.vu) content.push({ image: c.vu, width: 420, margin: [50, 8, 50, 8] });
      });

      const docDefinition = {
        background: (currentPage, pageSize) => {
          const scale = pageSize.width / width;
          const scaledHeight = height * scale;
          return {
            image: logob64,
            width: pageSize.width,
            height: scaledHeight,
            opacity: 0.1,
            absolutePosition: { x: 0, y: pageSize.height * 0.5 - scaledHeight * 0.5 },
          };
        },
        header: {
          columns: [
            { image: logob64, width: 210, height: 50, margin: [10, -10, 0, 0] },
            {
              stack: [
                { text: "Correo: rizabalasociados.estructurales@gmail.com", margin: [0, 0, 0, 5] },
                { text: "Telefono: 953992277", margin: [0, 0, 0, 5] },
                { text: "Direccion: jr. bolivar", margin: [0, 0, 0, 5] },
                { text: `Fecha: ${new Date().toLocaleDateString("es-PE")}`, margin: [0, 0, 0, 5] },
              ],
              alignment: "right",
              fontSize: 10,
              margin: [10, 10, 30, 20],
            },
          ],
        },
        footer: (currentPage, pageCount) => ({
          text: `Página ${currentPage} de ${pageCount}`,
          alignment: "center",
          fontSize: 10,
          margin: [0, 0, 0, 10],
        }),
        content,
        styles: {
          header: { fontSize: 8, bold: true, margin: [50, 0, 50, 10] },
          subheader: { fontSize: 8, bold: true, margin: [50, 10, 50, 5] },
          tableExample: { fontSize: 8, margin: [50, 5, 50, 15] },
          tableHeader: { bold: true, fontSize: 8, color: "black" },
        },
      };

      pdfMake.createPdf(docDefinition).download("aligerados.pdf");
    } catch (err) {
      this.showMessage?.("No se pudo generar el reporte: " + (err?.message || err), "warning");
    }
  },
};
