// resources/js/cad/mixins/analysis/rcColumnDesign.js
//
// Diseño de columnas de concreto armado: geometría + armado real (parseado
// del .e2k, ver e2k-import.js REBARDEFINITION/CONCRETESECTION), fuerzas
// P/M2/M3 del motor de fuerzas de barra, y verificación biaxial contra la
// superficie de interacción P-M-M real (python-backend/design/
// column_interaction.py, endpoint /api/backend/column-interaction).
//
// Alcance de esta fase (ver plan): SOLO columnas rectangulares con patrón de
// armado "R-n2-n3" ya resuelto por el importador. Circular, formas exóticas
// (T, L) o columnas sin CONCRETESECTION quedan fuera — se avisa, no se
// calcula mal.

import { loadRealFrameForceResults } from "../../engine/frameForceBackend.js";
import { getFrameForceRecord } from "../../diagrams/frameForceDiagramUtils.js";

const KGCM2_TO_PA = 98066.5; // 1 kg/cm² = 98066.5 Pa
const KN_TO_N = 1000;

export const rcColumnDesignMixin = {
  async openRcColumnDesignDialog() {
    const selected = this.getSelectedFramesForDesign?.() || [];

    if (!selected.length) {
      this.showMessage?.("Selecciona primero una o más columnas a diseñar.", "warning");
      return;
    }

    try {
      await loadRealFrameForceResults(this);
    } catch (err) {
      this.showMessage?.(`No se pudieron obtener las fuerzas del modelo: ${err.message}`, "error");
      return;
    }

    const columns = [];

    for (const frame of selected) {
      const built = this._rcBuildColumnInput(frame);
      columns.push(built);
    }

    // Llama al motor SOLO para las columnas soportadas (rectangular +
    // armado reconocido); las demás quedan con `unsupported` y se muestran
    // igual en el modal, con el motivo, sin intentar calcular.
    await Promise.all(
      columns
        .filter((c) => !c.unsupported)
        .map(async (c) => {
          try {
            const baseN = c.demandCandidates.base.length;
            const points = [...c.demandCandidates.base, ...c.demandCandidates.top];
            const result = await this._rcFetchColumnInteraction(c.geometry, points);
            c.surface = result;
            const checks = result.demandChecks || [];
            // Todos los checks (uno por combo real), no solo el gobernante —
            // así el modal puede ofrecer un selector para comparar cualquier
            // combo contra ETABS, no solo el que gana acá (pedido explícito
            // del usuario: ETABS deja filtrar por combo, nosotros también).
            c.checksAll = {
              base: this._rcTagChecks(c.demandCandidates.base, checks.slice(0, baseN)),
              top: this._rcTagChecks(c.demandCandidates.top, checks.slice(baseN)),
            };
            c.check = {
              base: this._rcMaxRatio(c.checksAll.base),
              top: this._rcMaxRatio(c.checksAll.top),
            };
            c.selectedComboId = {
              base: c.check.base?.comboId ?? null,
              top: c.check.top?.comboId ?? null,
            };
          } catch (err) {
            c.unsupported = true;
            c.unsupportedReason = `Error del motor de interacción: ${err.message}`;
          }
        }),
    );

    // Corte/confinamiento es un chequeo APARTE de la flexo-compresión — si
    // falla, no invalida el P-M-M ya calculado arriba, solo esa sección.
    await Promise.all(
      columns
        .filter((c) => !c.unsupported && c.shearInput && !c.shearInput.unsupported)
        .map(async (c) => {
          try {
            c.shear = await this._rcFetchColumnShear(c.shearInput.payload);
          } catch (err) {
            c.shear = { unsupported: true, unsupportedReason: `Error del motor de corte: ${err.message}` };
          }
        }),
    );

    this.rcColumnDesignResults = columns;

    window.dispatchEvent(
      new CustomEvent("open-columna-design-modal", {
        detail: { columns },
      }),
    );
  },

  /**
   * Arma la geometría+armado+demanda de UNA columna. No agrupa en tramos
   * (a diferencia de vigas): en este modelo las columnas ya son un segmento
   * por piso (ColumnDrawingState las crea así), así que cada frame
   * seleccionado se diseña independiente.
   */
  _rcBuildColumnInput(frame) {
    const sec = frame?.frameSection || null;
    // e2kName/e2kStory = etiqueta ORIGINAL de ETABS ("C2", "Story1"...), la
    // única forma de cruzar este resultado contra la tabla de diseño que
    // exporta ETABS (que va por Story+Label, no por el id interno de la app).
    const label = frame?.e2kName
      ? `${frame.e2kName}${frame.e2kStory ? ` (${frame.e2kStory})` : ""}`
      : frame?.name || frame?.id || "columna";

    if (!sec || sec.type !== "rect" || sec.rebarPattern?.type !== "rectangular") {
      return {
        label,
        frameId: frame?.id,
        unsupported: true,
        unsupportedReason:
          !sec || sec.type !== "rect"
            ? "Sección no rectangular (o sin datos de sección) — no soportado en esta fase."
            : "Sin patrón de armado rectangular reconocido en el .e2k (falta CONCRETESECTION o PATTERN distinto de \"R-n2-n3\").",
      };
    }

    const { b, h } = this._rcResolveFrameSection(frame);
    const { fc, fy } = this._rcResolveFrameMaterial(frame);

    if (!(b > 0) || !(h > 0)) {
      return { label, frameId: frame?.id, unsupported: true, unsupportedReason: "Geometría de sección inválida (b/h = 0)." };
    }

    if (!(sec.longBarArea > 0) || !(sec.longBarDiameter > 0) || !(sec.numConfineBars2 >= 0)) {
      return { label, frameId: frame?.id, unsupported: true, unsupportedReason: "Datos de armado incompletos en la sección." };
    }

    const frameId = frame.id;
    const results = this.frameForceResults;

    // Combos REALES del motor (E.060, ver _ff_default_design_combos en
    // solver.py) — no ENV Max/ENV Min. Un combo ENVELOPE (los sísmicos, sin
    // signo por CQC/SRSS) se guarda en frameForces como DOS entradas
    // (`${id}_Max`/`${id}_Min`, una por rama ±); uno ADD (solo gravedad) se
    // guarda con el id tal cual. Cada entrada trae P/M2/M3 del MISMO combo
    // (a diferencia del criterio anterior, que mezclaba el peor P con el
    // peor M2 y el peor M3 de combos distintos — más conservador de lo real,
    // ver comparación contra ETABS "Reinforcement to be Checked").
    const comboMetas = Array.isArray(results?.combinations) ? results.combinations : [];
    const realComboIds = [];
    comboMetas.forEach((meta) => {
      if (String(meta.type).toUpperCase() === "ENVELOPE") {
        realComboIds.push({ id: `${meta.id}_Max`, name: String(meta.name || meta.id).replace("±", "+"), kind: "combo" });
        realComboIds.push({ id: `${meta.id}_Min`, name: String(meta.name || meta.id).replace("±", "-"), kind: "combo" });
      } else {
        realComboIds.push({ id: meta.id, name: meta.name || meta.id, kind: "combo" });
      }
    });

    // Casos sísmicos (Response Spectrum) sueltos — ETABS también deja
    // filtrar por caso, no solo por combo, para comparar fuerza contra
    // fuerza. Van en la MISMA lista/selector que los combos, con prefijo
    // "Sismo:" para distinguirlos. Sin gravedad de por medio, no son un
    // chequeo de diseño válido por sí solos — son para comparar/depurar.
    const seismicCases = (Array.isArray(results?.cases) ? results.cases : []).filter(
      (c) => c.signless || String(c.type).toLowerCase() === "response spectrum",
    );
    seismicCases.forEach((c) => {
      realComboIds.push({ id: c.id, name: `Sismo: ${c.name || c.id}`, kind: "case" });
    });

    let frameLength = 0;

    const candidatesAt = (relStation) =>
      realComboIds
        .map(({ id, name, kind }) => {
          const record =
            kind === "case"
              ? getFrameForceRecord(results, frameId, id, null)
              : getFrameForceRecord(results, frameId, null, id);
          if (!record) return null;
          if (!frameLength) frameLength = Number(record.length) || 0;
          const at = (component) => this._rcFrameForceStationRaw(record, relStation, component);
          // El motor exporta P con la convención de ANÁLISIS de ETABS
          // (tracción positiva — ver solver.py "ETABS usa tracción
          // positiva"), pero column_interaction.py asume la convención de
          // DISEÑO (compresión positiva, la del diagrama P-M-M / la tabla
          // PMM de ETABS) — hay que invertir el signo acá, si no se evalúa
          // la capacidad en el lado de tracción de la curva por error. Un
          // CASO sísmico puro (CQC/SRSS) ya sale ≥0 (magnitud, sin signo
          // físico de compresión/tracción) — no se invierte, para que
          // coincida con cómo ETABS lo muestra al filtrar por caso.
          const pRaw = at("P") * KN_TO_N;
          return {
            comboId: id,
            comboName: name,
            kind,
            P: kind === "case" ? pRaw : -pRaw,
            M2: at("M2") * KN_TO_N,
            // "M3" acá se lee directo del motor (sin el intercambio V2↔V3 de
            // vigas, que era solo para su tabla "V3" — ver
            // project_rc_design_v2_v3_convention): el motor ya entrega M2/M3
            // consistentes entre sí.
            M3: at("M3") * KN_TO_N,
            // V2/V3 crudos (sin invertir signo — para el piso de Ve del
            // corte solo importa la magnitud |V|, no el signo).
            V2: at("V2") * KN_TO_N,
            V3: at("V3") * KN_TO_N,
          };
        })
        .filter(Boolean);

    const demandCandidates = { base: candidatesAt(0), top: candidatesAt(1) };
    const allCandidates = [...demandCandidates.base, ...demandCandidates.top];

    const geometry = {
      b: b / 100,
      h: h / 100,
      fc: fc * KGCM2_TO_PA,
      fy: fy * KGCM2_TO_PA,
      cover: sec.cover / 100,
      barDiameter: sec.longBarDiameter,
      n3: sec.rebarPattern.n3,
      n2: sec.rebarPattern.n2,
      barArea: sec.longBarArea,
    };

    // Corte/confinamiento usa el rango de Pu y el piso de Vu SOLO de combos
    // factorados reales — un caso sísmico suelto (sin gravedad) no es una
    // demanda de diseño válida y distorsionaría el rango.
    const comboOnlyCandidates = allCandidates.filter((c) => c.kind === "combo");
    const shearInput = this._rcBuildShearInput(frame, sec, fy, geometry, comboOnlyCandidates, frameLength);

    return {
      label,
      frameId,
      unsupported: false,
      geometryDisplay: { b, h, fc, fy, cover: sec.cover, pattern: sec.rebarPattern, longBarDiameter: sec.longBarDiameter },
      geometry,
      demandCandidates,
      shearInput,
    };
  },

  /**
   * Arma el payload de corte/confinamiento — null (con motivo) si falta
   * armado transversal real en el .e2k. `fy` (kg/cm²) es el del acero
   * LONGITUDINAL, usado como fallback si no se resuelve el material del
   * estribo por nombre.
   */
  _rcBuildShearInput(frame, sec, fy, geometry, allCandidates, frameLength) {
    if (!(sec.confineBarArea > 0) || !(sec.confineBarSpacing > 0)) {
      return { unsupported: true, unsupportedReason: "Sin armado transversal (estribo) real en el .e2k." };
    }

    const fytKgCm2 = this._rcResolveMaterialFyByName(sec.confineBarMaterialName) ?? fy;

    if (!allCandidates.length) {
      return { unsupported: true, unsupportedReason: "Sin fuerzas de combos reales para esta columna." };
    }

    const axialMin = Math.min(...allCandidates.map((c) => c.P));
    const axialMax = Math.max(...allCandidates.map((c) => c.P));
    const vuAnalysis2 = Math.max(...allCandidates.map((c) => Math.abs(c.V2)));
    const vuAnalysis3 = Math.max(...allCandidates.map((c) => Math.abs(c.V3)));

    return {
      unsupported: false,
      payload: {
        ...geometry,
        confineFy: fytKgCm2 * KGCM2_TO_PA,
        confineBarArea: sec.confineBarArea,
        confineBarDiameter: sec.confineBarDiameter,
        confineBarSpacing: sec.confineBarSpacing / 100,
        numConfineBars2: sec.numConfineBars2,
        numConfineBars3: sec.numConfineBars3,
        clearHeight: this._rcEstimateClearHeight(frame, frameLength),
        axialMin,
        axialMax,
        vuAnalysis2,
        vuAnalysis3,
      },
    };
  },

  /**
   * Altura libre Hn (m): longitud eje-a-eje del frame menos medio peralte de
   * cualquier viga que llegue a cada nudo (aproximación — no modela el nudo
   * completo; si no hay viga conectada en un extremo, no se descuenta nada
   * ahí). Usado para Ve = ΣMpr/Hn (ACI 318 §18.7.6.1.1).
   */
  _rcEstimateClearHeight(frame, length) {
    if (!(length > 0)) return 0;

    const idOf = (n) => (n && typeof n === "object" ? n.id : n);
    const n1 = idOf(frame.node1Id ?? frame.node1);
    const n2 = idOf(frame.node2Id ?? frame.node2);
    const allFrames = this.getAllFramesForDesign?.() || [];

    const beamDepthAt = (nodeId) => {
      let maxH = 0;
      for (const f of allFrames) {
        if (f === frame) continue;
        const type = String(f.elementType || f.type || f.objectType || "").toLowerCase();
        if (!type.includes("beam")) continue;
        const fn1 = idOf(f.node1Id ?? f.node1);
        const fn2 = idOf(f.node2Id ?? f.node2);
        if (fn1 !== nodeId && fn2 !== nodeId) continue;
        const { h } = this._rcResolveFrameSection(f);
        if (h > maxH) maxH = h;
      }
      return maxH / 100; // cm -> m
    };

    const hn = length - beamDepthAt(n1) / 2 - beamDepthAt(n2) / 2;
    return Math.max(hn, length * 0.5);
  },

  /** Adjunta comboId/comboName/P/M2/M3 a cada check — un elemento por combo real, para el selector del modal. */
  _rcTagChecks(candidates, checks) {
    const tagged = [];
    for (let i = 0; i < checks.length; i += 1) {
      const chk = checks[i];
      if (!chk || chk.error) continue;
      const cand = candidates[i];
      tagged.push({ ...chk, comboId: cand.comboId, comboName: cand.comboName, P: cand.P, M2: cand.M2, M3: cand.M3 });
    }
    return tagged;
  },

  /** El de mayor ratio entre los checks ya etiquetados — mismo criterio que "PMM Combo" de ETABS. */
  _rcMaxRatio(tagged) {
    let best = null;
    for (const chk of tagged) {
      if (!best || chk.ratio > best.ratio) best = chk;
    }
    return best;
  },

  /**
   * `points` (array plano de {P,M2,M3}, un candidato por combo real y
   * estación) se envía como `demandPoints` para que el backend calcule la
   * capacidad EXACTA en el ángulo real de CADA candidato (bisección sobre la
   * profundidad del eje neutro — ver capacity_at_demand en python-backend/
   * design/column_interaction.py) en vez de interpolar entre las 24 curvas
   * de la superficie. El caller (`_rcTagChecks`/`_rcMaxRatio`) etiqueta cada
   * uno por combo/caso y elige, por estación, el de mayor ratio como
   * gobernante — igual criterio que la columna "PMM Combo" de ETABS, aunque
   * el modal deja elegir cualquier otro. La superficie sigue viniendo en la
   * respuesta como referencia visual (`curves`).
   */
  async _rcFetchColumnInteraction(geometry, points) {
    const res = await fetch("/api/backend/column-interaction", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      cache: "no-store",
      body: JSON.stringify({ ...geometry, demandPoints: points }),
    });

    const body = await res.json().catch(() => null);

    if (!res.ok || !body?.success) {
      throw new Error(body?.error || `HTTP ${res.status}`);
    }

    return body; // { beta1, bars, curves, demandChecks: [...un check por cada punto de `points`, mismo orden] }
  },

  /** Ver python-backend/design/column_shear.py — corte por capacidad (Ve=ΣMpr/Hn) + confinamiento, contra el estribo real del .e2k. */
  async _rcFetchColumnShear(payload) {
    const res = await fetch("/api/backend/column-shear", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      cache: "no-store",
      body: JSON.stringify(payload),
    });

    const body = await res.json().catch(() => null);

    if (!res.ok || !body?.success) {
      throw new Error(body?.error || `HTTP ${res.status}`);
    }

    return body; // { shearV2, shearV3, confinement }
  },
};
