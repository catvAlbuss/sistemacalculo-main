/**
 * Tabla "Element Forces - Columns", con el mismo formato y las mismas columnas
 * que la de ETABS, para poder cruzarlas fila por fila.
 *
 * DE DÓNDE SALEN LOS DATOS
 *   De `this.frameForceResults`, lo mismo que alimenta los diagramas y el
 *   diseño de columnas. No se recalcula nada: si un número de acá no coincide
 *   con el del diagrama, el bug está en uno de los dos lectores, no en dos
 *   cálculos distintos.
 *
 * SIGNO DE P — NO se toca, y esa es la parte contraintuitiva
 *   El motor ya exporta P con la convención de ANÁLISIS de ETABS: **tracción
 *   positiva**, compresión negativa (ver solver.py y la nota de
 *   rcColumnDesign.js:370). Es la capa de DISEÑO la que lo invierte, porque el
 *   diagrama P-M-M y la tabla PMM usan compresión positiva.
 *
 *   Esta tabla es de ANÁLISIS, así que los valores van tal cual salen del
 *   motor. Contraste para C1 Story1, combo `02 1.25(CM+CV)+SDX` rama Min,
 *   estación 0:
 *       Element Forces (ETABS y esta tabla) ..... P = −28.4404
 *       PMM / modal de diseño ................... P = +28.4404
 *   Las dos son correctas; son convenciones distintas de dos tablas distintas.
 *   Un caso de espectro suelto sale ≥0 en ambas (la CQC da magnitudes).
 *
 * STEP TYPE
 *   El motor genera las ramas `_Max` / `_Min` para los combos que contienen
 *   términos de espectro (sin signo). Esas ramas son exactamente el "Step Type"
 *   Max/Min de ETABS. Un caso de espectro suelto no tiene ramas: la CQC ya
 *   devuelve magnitudes, y ETABS lo reporta como "Max".
 */

import { loadRealFrameForceResults } from "../../engine/frameForceBackend.js";

// Las estaciones del motor vienen en kN (lo confirma `KN_TO_N = 1000` en
// rcColumnDesign.js, que las multiplica antes de mandarlas al diseno).
// Dividir por 9806.65 como si fueran newtons daba todo 1000 veces chico:
// P = -0.0363 donde ETABS reporta -36.17.
const KN_TO_TONF = 1 / 9.80665;

/** Columnas de la tabla, en el orden exacto de la de ETABS. */
export const ELEMENT_FORCE_COLUMNS = [
  "Story", "Column", "Unique Name", "Output Case", "Case Type", "Step Type",
  "Step Number", "Station", "P", "V2", "V3", "T", "M2", "M3",
  "Element", "Elem Station", "Location",
];

/** Las que llevan unidades en el encabezado (segunda línea, como ETABS). */
export const ELEMENT_FORCE_UNITS = {
  Station: "m", P: "tonf", V2: "tonf", V3: "tonf",
  T: "tonf-m", M2: "tonf-m", M3: "tonf-m", "Elem Station": "m",
};

export const elementForcesTableMixin = {
  /**
   * ¿Es una columna? Se decide por GEOMETRÍA (los dos nudos comparten planta),
   * el mismo criterio que ya usa el exportador .e2k para clasificar
   * columna/viga — no por el nombre, que puede venir de cualquier lado.
   */
  _efIsColumn(frame) {
    const n1 = this._efNode(frame?.node1 ?? frame?.node1Id ?? frame?.nodeI ?? frame?.i);
    const n2 = this._efNode(frame?.node2 ?? frame?.node2Id ?? frame?.nodeJ ?? frame?.j);
    if (!n1 || !n2) return false;
    const dx = n2.x - n1.x;
    const dy = n2.y - n1.y;
    const dz = n2.z - n1.z;
    return Math.abs(dz) > 1e-6 && Math.hypot(dx, dy) < Math.abs(dz) * 0.2;
  },

  /**
   * Coordenadas de un nudo, venga como objeto o como id.
   *
   * OJO: las coordenadas viven en `node.position.{x,y,z}` en unos modelos y
   * planas en `node.{x,y,z}` en otros (ver `_showTablesFrameTopZ` y el `posOf`
   * de rcColumnDesign.js, que ya hacen este mismo doble acceso). Leer solo
   * `node.x` devolvía 0 en todo, así que dz salía 0 y NINGUNA barra pasaba el
   * test de columna: la tabla quedaba vacía sin decir por qué.
   */
  _efNode(ref) {
    const n = this._showTablesResolveNode?.(ref)
      ?? (typeof ref === "object" ? ref : (this.nodes || []).find((x) => String(x?.id) === String(ref)));
    if (!n) return null;
    return {
      x: Number(n.position?.x ?? n.x) || 0,
      y: Number(n.position?.y ?? n.y) || 0,
      z: Number(n.position?.z ?? n.z) || 0,
    };
  },

  /**
   * Todas las filas de Element Forces de las columnas del modelo, con la misma
   * presentacion que ETABS.
   *
   * LAS RAMAS Max/Min — la parte que costo entender
   *   El espectro sale de una CQC: MAGNITUDES sin signo. ETABS presenta cada
   *   combo que lo contiene en DOS filas por estacion,
   *       Max = (terminos firmes) + |terminos de espectro|
   *       Min = (terminos firmes) - |terminos de espectro|
   *   y por eso sus combos `+SDX` y `-SDX` salen IDENTICOS entre si.
   *
   *   Nuestro motor hace algo distinto y igual de valido: emite UNA entrada por
   *   combo, ya en el sentido ADVERSO por componente, y el signo del SF del
   *   combo decide si suma o resta. O sea nuestro `02 +SDX` es la fila Min de
   *   ETABS y nuestro `03 -SDX` es su Max: la misma informacion, repartida en
   *   dos combos en vez de dos ramas. Verificado en C11 Story1 estacion 0,
   *   componente por componente contra la tabla de ETABS (P, V2, V3, T, M2, M3
   *   dentro del 0.4%).
   *
   *   Para esta tabla —que existe para cruzarse contra ETABS— se reconstruyen
   *   las dos ramas desde los CASOS base y los `terms` del combo. El DISENO
   *   sigue usando la entrada del motor, que es la adversa.
   */
  buildElementForcesColumns() {
    const res = this.frameForceResults;
    if (!res) return [];

    const columnas = (this.getAllFramesForDesign?.() || []).filter((f) => this._efIsColumn(f));
    if (!columnas.length) return [];

    const meta = new Map();
    columnas.forEach((f) => {
      const z = this._showTablesFrameTopZ?.(f);
      meta.set(String(f.id), {
        story: f.e2kStory || this._showTablesStoryNameByZ?.(z) || "",
        label: f.e2kName || f.name || String(f.id),
        unique: f.e2kUniqueName ?? f.id,
      });
    });

    const COMPS = ["P", "V2", "V3", "T", "M2", "M3"];
    const casos = res.cases || [];
    // Casos SIN SIGNO: la CQC devuelve magnitudes. Mismo criterio que usa
    // rcColumnDesign.js para marcar la demanda sismica.
    const sinSigno = new Set(
      casos.filter((c) => c.signless || /spec/i.test(String(c.type || "")))
        .map((c) => String(c.id)),
    );

    // Registros de CASO por (frame, caso), que es la materia prima de todo.
    const porCaso = new Map();
    for (const ent of res.frameForces || []) {
      if (ent.comboId != null && ent.comboId !== "") continue;
      porCaso.set(`${ent.frameId}|${ent.caseId}`, ent);
    }

    const filas = [];
    const push = (m, nombre, tipo, step, st) => {
      const x = Number(st.station ?? 0);
      filas.push({
        Story: m.story, Column: m.label, "Unique Name": m.unique,
        "Output Case": nombre, "Case Type": tipo, "Step Type": step, "Step Number": "",
        Station: x,
        // P va SIN invertir: el motor ya usa la convencion de analisis de ETABS
        // (traccion positiva). Ver el encabezado del archivo.
        P: Number(st.P ?? 0) * KN_TO_TONF,
        V2: Number(st.V2 ?? 0) * KN_TO_TONF,
        V3: Number(st.V3 ?? 0) * KN_TO_TONF,
        T: Number(st.T ?? 0) * KN_TO_TONF,
        M2: Number(st.M2 ?? 0) * KN_TO_TONF,
        M3: Number(st.M3 ?? 0) * KN_TO_TONF,
        Element: 1, "Elem Station": x, Location: "",
      });
    };

    // ── CASOS base: van tal cual salen del motor ──
    for (const c of casos) {
      const tipo = /spec/i.test(String(c.type || "")) ? "LinRespSpec" : "LinStatic";
      for (const [fid, m] of meta) {
        const ent = porCaso.get(`${fid}|${c.id}`);
        for (const st of ent?.stations || []) push(m, c.name || String(c.id), tipo, "Max", st);
      }
    }

    // ── COMBOS: dos ramas si hay espectro, una si no ──
    for (const combo of res.combinations || []) {
      const terms = Array.isArray(combo.terms) ? combo.terms : [];
      if (!terms.length) continue;
      const hayEspectro = terms.some((t) => sinSigno.has(String(t.case)));

      for (const [fid, m] of meta) {
        const recs = terms.map((t) => ({
          rec: porCaso.get(`${fid}|${t.case}`),
          factor: Number(t.factor) || 0,
          libre: sinSigno.has(String(t.case)),
        })).filter((r) => r.rec);
        if (!recs.length) continue;

        const nEst = Math.max(...recs.map((r) => r.rec.stations?.length || 0));
        for (let k = 0; k < nEst; k += 1) {
          const firmes = {};
          const magn = {};
          let station = 0;
          for (const comp of COMPS) { firmes[comp] = 0; magn[comp] = 0; }
          for (const r of recs) {
            const st = r.rec.stations?.[k];
            if (!st) continue;
            station = Number(st.station ?? 0);
            for (const comp of COMPS) {
              const v = r.factor * Number(st[comp] ?? 0);
              if (r.libre) magn[comp] += Math.abs(v);
              else firmes[comp] += v;
            }
          }
          const rama = (signo) => {
            const o = { station };
            for (const comp of COMPS) o[comp] = firmes[comp] + signo * magn[comp];
            return o;
          };
          const nombre = combo.name || String(combo.id);
          if (hayEspectro) {
            push(m, nombre, "Combination", "Max", rama(+1));
            push(m, nombre, "Combination", "Min", rama(-1));
          } else {
            push(m, nombre, "Combination", "Max", rama(+1));
          }
        }
      }
    }

    // ── ENVOLVENTES: el motor ya publica las dos, con el sentido en el NOMBRE.
    // Se les saca el sufijo y se pasa a Step Type, que es como lo rotula ETABS.
    for (const ent of res.frameForces || []) {
      const m = meta.get(String(ent.frameId));
      if (!m || ent.comboId == null || ent.comboId === "") continue;
      const info = (res.envelopes || []).find((e) => String(e.id) === String(ent.comboId));
      if (!info) continue;
      const crudo = String(info.name || ent.comboId);
      const esMin = /\(\s*m[ií]n/i.test(crudo) || /_Min$/i.test(String(ent.comboId));
      const nombre = crudo.replace(/\s*\((m[aá]x|m[ií]n)\.?\)\s*$/i, "").trim();
      for (const st of ent.stations || []) {
        push(m, nombre, "Combination", esMin ? "Min" : "Max", st);
      }
    }

    return filas;
  },

  /**
   * Submuestreo a las estaciones que reporta ETABS: los dos extremos y el
   * centro. Nuestro analisis usa 21 estaciones (mejor resolucion del maximo,
   * ver la nota de numStations en frameForceBackend.js), asi que la tabla
   * cruda tiene 7x mas filas que la de ETABS y no se puede cruzar de a una.
   * Esto NO cambia el calculo: solo elige que filas mostrar.
   */
  elementForcesOnlyEtabsStations(filas) {
    const porSerie = new Map();
    for (const r of filas) {
      const k = `${r.Story}|${r.Column}|${r["Output Case"]}|${r["Step Type"]}`;
      if (!porSerie.has(k)) porSerie.set(k, []);
      porSerie.get(k).push(r);
    }
    const salida = [];
    for (const serie of porSerie.values()) {
      const xs = serie.map((r) => r.Station);
      const x0 = Math.min(...xs);
      const x1 = Math.max(...xs);
      const xm = (x0 + x1) / 2;
      // El mas cercano a cada objetivo: con 21 estaciones el centro cae exacto,
      // pero con un numero par de tramos no tiene por que.
      const cerca = (obj) => serie.reduce(
        (a, b) => (Math.abs(b.Station - obj) < Math.abs(a.Station - obj) ? b : a), serie[0]);
      const elegidos = [cerca(x0), cerca(xm), cerca(x1)];
      const vistos = new Set();
      for (const r of elegidos) {
        if (vistos.has(r.Station)) continue;
        vistos.add(r.Station);
        salida.push(r);
      }
    }
    return salida;
  },

  /**
   * Abre la tabla. Corre el análisis si hace falta (mismo camino que el diseño
   * de columnas) y le pasa las filas ya armadas al modal.
   */
  async openElementForcesColumnsDialog() {
    try {
      await loadRealFrameForceResults(this);
    } catch (err) {
      this.showMessage?.(`No se pudieron obtener las fuerzas del modelo: ${err.message}`, "error");
      return;
    }

    const filas = this.buildElementForcesColumns();
    if (!filas.length) {
      // Diagnóstico separado: no es lo mismo "el modelo no tiene columnas" que
      // "las tiene pero el análisis no devolvió nada para ellas".
      const nCol = (this.getAllFramesForDesign?.() || []).filter((f) => this._efIsColumn(f)).length;
      this.showMessage?.(
        nCol
          ? `Se detectaron ${nCol} columna(s), pero el análisis no devolvió fuerzas para ellas.`
          : "No se detectó ninguna columna en el modelo (barras con los dos nudos en la misma vertical).",
        "warning",
      );
      return;
    }

    window.dispatchEvent(new CustomEvent("open-element-forces-columns", {
      detail: { rows: filas, options: this.elementForcesFilterOptions(filas) },
    }));
  },

  /** Valores únicos de cada campo filtrable, para poblar los multi-select. */
  elementForcesFilterOptions(filas) {
    const uniq = (k) => [...new Set(filas.map((r) => r[k]).filter((v) => v !== ""))]
      .sort((a, b) => String(a).localeCompare(String(b), "es", { numeric: true }));
    return {
      story: uniq("Story"),
      column: uniq("Column"),
      outputCase: uniq("Output Case"),
      stepType: uniq("Step Type"),
    };
  },

  /**
   * Filtra por los cuatro campos. Cada filtro es un ARRAY: vacío = "todos",
   * que es lo que hace el diálogo de ETABS cuando no marcás nada.
   */
  filterElementForces(filas, f = {}) {
    const activo = (arr) => Array.isArray(arr) && arr.length;
    return filas.filter((r) =>
      (!activo(f.story) || f.story.includes(r.Story))
      && (!activo(f.column) || f.column.includes(r.Column))
      && (!activo(f.outputCase) || f.outputCase.includes(r["Output Case"]))
      && (!activo(f.stepType) || f.stepType.includes(r["Step Type"])));
  },

  /**
   * CSV en el layout que espera la hoja `INPUT FORCE` de la plantilla Excel
   * "Colum TIPO II": columnas B..M, SIN Story / Case Type / Step Type /
   * Location. Como esa hoja no tiene columna de Step Type, la rama Max/Min se
   * pega al nombre del caso ("02 ... +SDX Max"), que es como ETABS la exporta
   * cuando no hay columna aparte.
   *
   * Es un layout DISTINTO del `elementForcesToCsv`, que reproduce la tabla de
   * ETABS completa. Pegar el otro en INPUT FORCE correría las columnas.
   */
  elementForcesToExcelCsv(filas) {
    const COLS = ["Column", "Unique Name", "Output Case", "Station",
                  "P", "V2", "V3", "T", "M2", "M3", "Element", "Elem Station"];
    const dec = new Set(["Station", "P", "V2", "V3", "T", "M2", "M3", "Elem Station"]);
    const esc = (v) => {
      const t = String(v ?? "");
      return /[",;\n]/.test(t) ? `"${t.replace(/"/g, '""')}"` : t;
    };
    // Solo se agrega el sufijo cuando el caso REALMENTE tiene dos ramas; si no,
    // ensuciaría el nombre de los combos de gravedad.
    const conDosRamas = new Set();
    const vistos = new Map();
    for (const r of filas) {
      const k = r["Output Case"];
      const prev = vistos.get(k);
      if (prev && prev !== r["Step Type"]) conDosRamas.add(k);
      else if (!prev) vistos.set(k, r["Step Type"]);
    }

    const cuerpo = filas.map((r) => COLS.map((c) => {
      if (c === "Output Case") {
        return esc(conDosRamas.has(r[c]) ? `${r[c]} ${r["Step Type"]}` : r[c]);
      }
      return esc(dec.has(c) ? Number(r[c] ?? 0).toFixed(4) : r[c]);
    }).join(","));
    return [COLS.join(","), ...cuerpo].join("\n");
  },

  /** CSV con las columnas de ETABS, para pegar en Excel y cruzar. */
  elementForcesToCsv(filas) {
    const esc = (v) => {
      const s = String(v ?? "");
      return /[",;\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
    };
    const dec = new Set(["Station", "P", "V2", "V3", "T", "M2", "M3", "Elem Station"]);
    const cab = ELEMENT_FORCE_COLUMNS.join(",");
    const uni = ELEMENT_FORCE_COLUMNS.map((c) => ELEMENT_FORCE_UNITS[c] || "").join(",");
    const cuerpo = filas.map((r) => ELEMENT_FORCE_COLUMNS
      .map((c) => esc(dec.has(c) ? Number(r[c] ?? 0).toFixed(4) : r[c]))
      .join(","));
    return [cab, uni, ...cuerpo].join("\n");
  },
};
