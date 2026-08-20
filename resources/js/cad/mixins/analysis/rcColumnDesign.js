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
  /**
   * Código de diseño activo — decide los factores φ (y su ley de transición)
   * del motor: "E060" (Art. 10.3.2: compresión 0.70 estribos / 0.75 espiral,
   * cortante 0.85, transición por CARGA AXIAL) o "ACI318" (§21.2: 0.65/0.75,
   * cortante 0.75, transición por DEFORMACIÓN del acero). Default E.060 —
   * la norma vigente en Perú. ACI 318 queda para comparar contra un ETABS
   * configurado con código americano.
   * Cambiar desde el modal o por consola:
   *   cadSystem.rcDesignCode = "ACI318"; cadSystem.openRcColumnDesignDialog()
   */
  rcDesignCode: "E060",

  /**
   * `framesOverride` (opcional): re-diseña ESOS frames en vez de leer la
   * selección actual — lo usa `rcSetDesignCode` para recalcular con otro
   * código sin exigirle al usuario que vuelva a seleccionar (el modal está
   * abierto encima del viewport, la selección puede haberse perdido).
   */
  async openRcColumnDesignDialog(framesOverride = null) {
    const selected = framesOverride?.length
      ? framesOverride
      : this.getSelectedFramesForDesign?.() || [];

    if (!selected.length) {
      this.showMessage?.("Selecciona primero una o más columnas a diseñar.", "warning");
      return;
    }

    // Se recuerda la selección para poder RE-diseñar al vuelo cuando el
    // usuario cambia de código en el modal.
    this._rcLastColumnSelection = selected;

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
        detail: { columns, code: this.rcDesignCode },
      }),
    );
  },

  /**
   * Cambia el código de diseño (E.060 ↔ ACI 318) y RE-CORRE el diseño sobre
   * la misma selección — lo llama el selector del modal. Los φ viven en el
   * motor Python, así que no alcanza con recalcular en el front: hay que
   * volver a pedirle la superficie/los ratios.
   */
  async rcSetDesignCode(code) {
    const next = String(code || "").toUpperCase().includes("ACI") ? "ACI318" : "E060";
    if (next === this.rcDesignCode) return;

    this.rcDesignCode = next;

    // Se re-diseña sobre los MISMOS frames con los que se abrió el modal
    // (framesOverride), no sobre la selección viva: con el modal encima del
    // viewport la selección puede haberse perdido.
    const frames = this._rcLastColumnSelection || [];
    if (!frames.length) return;

    await this.openRcColumnDesignDialog(frames);
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

    if (!sec || sec.type !== "rect") {
      return {
        label,
        frameId: frame?.id,
        unsupported: true,
        unsupportedReason: "Sección no rectangular (o sin datos de sección) — no soportado en esta fase.",
      };
    }

    const { b, h } = this._rcResolveFrameSection(frame);
    const { fc, fy, ec } = this._rcResolveFrameMaterial(frame);

    if (!(b > 0) || !(h > 0)) {
      return { label, frameId: frame?.id, unsupported: true, unsupportedReason: "Geometría de sección inválida (b/h = 0)." };
    }

    // Armado real del .e2k (CONCRETESECTION con DESIGNCHECK "CHECK") — si
    // falta (p. ej. la sección está en modo auto-diseño de ETABS,
    // DESIGNCHECK "DESIGN", LONGBARAREA=0), se cae al armado definido a mano
    // por NOMBRE DE SECCIÓN (ver columnRebarDesigner.js — igual que el
    // Section Designer de ETABS, una propiedad de sección, no por columna),
    // si existe. Si tampoco hay armado manual, no soportado — con suficiente
    // contexto (sectionName/b/h) para que el modal ofrezca "Definir armado...".
    const hasRealRebar =
      sec.rebarPattern?.type === "rectangular" && sec.longBarArea > 0 && sec.longBarDiameter > 0 && sec.numConfineBars2 >= 0;

    const sectionName = sec.name || frame.sectionName || null;
    let sec2 = sec;
    let manualRebar = false;

    if (!hasRealRebar) {
      const manualDraft = sectionName ? this.manualColumnRebar?.[sectionName] : null;
      const manualSec = manualDraft ? this._columnRebarDraftToSection?.(manualDraft) : null;
      if (!manualSec) {
        return {
          label,
          frameId: frame?.id,
          unsupported: true,
          unsupportedReason: "Datos de armado incompletos en la sección.",
          sectionName,
          b,
          h,
        };
      }
      sec2 = manualSec;
      manualRebar = true;
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
    const comboMetasTodos = Array.isArray(results?.combinations) ? results.combinations : [];

    // ETABS solo diseña concreto con los combos marcados
    // `DESIGN "Concrete" COMBOTYPE "Strength"` en el .e2k; los de servicio
    // (PDPL, CV, SISAD, "PDPL ALB"...) NO entran al diseño. Antes se
    // evaluaban TODOS y un combo de servicio podía salir gobernante — por eso
    // aparecían combos que no figuran en la tabla de ETABS (ej. SISAD
    // gobernando C25 con tracción, cuando ETABS reporta el combo 02).
    //
    // Si NINGÚN combo trae la marca (modelo dibujado a mano, o combos
    // generados por el propio motor con E.060) se usan todos: el filtro solo
    // aplica cuando el .e2k trae la información.
    const marcadosParaDiseno = comboMetasTodos.filter(
      (m) => /concrete/i.test(String(m.design || "")) && /strength/i.test(String(m.comboType || "")),
    );
    const comboMetas = marcadosParaDiseno.length ? marcadosParaDiseno : comboMetasTodos;

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

    // Esbeltez (E.060 10.12): δns depende de los DOS extremos del MISMO
    // combo, no de una estación suelta. Se cruza base↔top por comboId para
    // que cada punto lleve el momento del otro extremo (M2Top/M3Top).
    const otroExtremo = (lista, comboId) => lista.find((c) => c.comboId === comboId) || null;
    demandCandidates.base.forEach((c) => {
      const o = otroExtremo(demandCandidates.top, c.comboId);
      c.M2Top = o ? o.M2 : c.M2;
      c.M3Top = o ? o.M3 : c.M3;
    });
    demandCandidates.top.forEach((c) => {
      const o = otroExtremo(demandCandidates.base, c.comboId);
      c.M2Top = o ? o.M2 : c.M2;
      c.M3Top = o ? o.M3 : c.M3;
    });

    const geometry = {
      b: b / 100,
      h: h / 100,
      fc: fc * KGCM2_TO_PA,
      fy: fy * KGCM2_TO_PA,
      // cover = recubrimiento LIBRE hasta la superficie del estribo ("Clear
      // Cover for Confinement Bars" en ETABS, exportado vía COVER) — el
      // motor resta confineBarDiameter aparte para ubicar el centro de la
      // varilla longitudinal (antes no se restaba: las varillas quedaban
      // ~1 diámetro de estribo más afuera de lo real).
      cover: sec2.cover / 100,
      barDiameter: sec2.longBarDiameter,
      n3: sec2.rebarPattern.n3,
      n2: sec2.rebarPattern.n2,
      barArea: sec2.longBarArea,
      confineBarDiameter: sec2.confineBarDiameter || 0,
      // Código de diseño: decide los factores φ y su ley de transición
      // (E.060 Art. 10.3.2 vs ACI 318 §21.2 — ver PHI_BY_CODE en
      // python-backend/design/column_interaction.py). Default E.060, que es
      // la norma vigente en Perú; ACI 318 queda disponible para comparar
      // contra ETABS cuando ese esté configurado con código americano.
      code: this.rcDesignCode || "E060",
      // Esbeltez: magnificación de momentos de 2do orden (E.060 Art. 10.12,
      // ver python-backend/design/column_slenderness.py). Se manda solo si
      // hay Ec y altura libre; sin eso el motor la omite (no magnifica).
      slenderness: this.rcSlendernessEnabled === false ? null : {
        ec: (ec || 0) * KGCM2_TO_PA,
        lu: this._rcEstimateClearHeight(frame, frameLength),
        // k = 1.0 (pórtico ARRIOSTRADO). El caso no arriostrado (δs, Art.
        // 10.13) no está implementado — necesita el índice de estabilidad Q
        // por piso, que es un dato de piso, no de elemento.
        k: Number(this.rcSlendernessK) || 1.0,
        betaD: this._rcBetaD(demandCandidates, frameId),
      },
    };

    // Corte/confinamiento usa el rango de Pu y el piso de Vu SOLO de combos
    // factorados reales — un caso sísmico suelto (sin gravedad) no es una
    // demanda de diseño válida y distorsionaría el rango.
    const comboOnlyCandidates = allCandidates.filter((c) => c.kind === "combo");
    const shearInput = this._rcBuildShearInput(frame, sec2, fy, geometry, comboOnlyCandidates, frameLength);

    return {
      label,
      frameId,
      sectionName,
      unsupported: false,
      manualRebar,
      geometryDisplay: { b, h, fc, fy, cover: sec2.cover, pattern: sec2.rebarPattern, longBarDiameter: sec2.longBarDiameter },
      geometry,
      demandCandidates,
      shearInput,
    };
  },

  /**
   * βd para la esbeltez (E.060 10.12.3): relación entre la máxima carga
   * axial SOSTENIDA amplificada y la máxima carga axial amplificada. Entra
   * en EI = 0.4·Ec·Ig/(1+βd): más carga sostenida → menos rigidez efectiva
   * (fluencia del concreto) → menor Pc → mayor magnificación.
   *
   * Se calcula con los `terms` reales de cada combo ({case, factor}, los
   * mismos que arma `_ff_default_design_combos` en solver.py): la parte
   * sostenida es la suma de los términos cuyo caso es de tipo Dead. Si no
   * se puede determinar (sin combos con términos, o sin registro del caso
   * muerto), se devuelve 1.0 — el valor MÁS CONSERVADOR (mitad de Pc, más
   * magnificación), para no subestimar el efecto por falta de dato.
   */
  _rcBetaD(demandCandidates, frameId) {
    const results = this.frameForceResults;
    const combos = Array.isArray(results?.combinations) ? results.combinations : [];
    const puntos = [...(demandCandidates?.base || []), ...(demandCandidates?.top || [])];
    if (!combos.length || !puntos.length) return 1.0;

    const deadIds = new Set(
      (Array.isArray(results?.cases) ? results.cases : [])
        .filter((c) => String(c.patternType || "").toLowerCase() === "dead")
        .map((c) => String(c.id)),
    );
    if (!deadIds.size) return 1.0;

    // Axial de cada caso muerto, sin factorar, en la estación más cargada.
    const axialCaso = new Map();
    deadIds.forEach((id) => {
      const rec = getFrameForceRecord(results, frameId, id, null);
      if (!rec) return;
      const p0 = Math.abs(this._rcFrameForceStationRaw(rec, 0, "P"));
      const p1 = Math.abs(this._rcFrameForceStationRaw(rec, 1, "P"));
      axialCaso.set(id, Math.max(p0, p1) * KN_TO_N);
    });
    if (!axialCaso.size) return 1.0;

    // El id de un combo ENVELOPE viaja con sufijo _Max/_Min en los puntos.
    const baseId = (id) => String(id || "").replace(/_(Max|Min)$/i, "");
    const metaPorId = new Map(combos.map((c) => [String(c.id), c]));

    let maxTotal = 0;
    let maxSostenida = 0;
    puntos.forEach((pt) => {
      if (pt.kind !== "combo") return;
      const total = Math.abs(pt.P);
      if (total > maxTotal) maxTotal = total;

      const meta = metaPorId.get(baseId(pt.comboId));
      const terms = Array.isArray(meta?.terms) ? meta.terms : [];
      let sostenida = 0;
      terms.forEach((t) => {
        const axial = axialCaso.get(String(t.case));
        if (axial) sostenida += Math.abs(Number(t.factor) || 0) * axial;
      });
      if (sostenida > maxSostenida) maxSostenida = sostenida;
    });

    if (!(maxTotal > 0)) return 1.0;
    return Math.min(1, Math.max(0, maxSostenida / maxTotal));
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
        // Tope por resistencia de las vigas del nudo (ACI 318 §18.7.6.1.1 in
        // fine). null = sin armado de viga -> el motor no aplica el tope.
        jointBeamMoment: this._rcJointBeamMoment(frame, geometry),
      },
    };
  },

  /**
   * Momento que las VIGAS del nudo le pueden entregar a ESTA columna, por eje
   * y por extremo — el tope de ACI 318 §18.7.6.1.1 in fine ("the column
   * shears need not exceed those calculated from joint strengths based on
   * Mpr of the beams framing into the joint").
   *
   * Devuelve { "2": {top, bot}, "3": {top, bot} } en N·m, o `null` si NINGUNA
   * viga del nudo tiene armado real (caso típico: ETABS dejó las vigas en
   * "Reinforcement to be Designed" y el .e2k trae ATI/ABI/ATJ/ABJ en 0). Sin
   * dato NO se aplica el tope — Ve queda gobernado por el Mpr de la columna,
   * que es el lado conservador.
   *
   * CONVENCIÓN DE EJES (importante, es donde se puede meter la pata):
   *   V2 ↔ M3  y  V3 ↔ M2  (la misma ya validada, ver
   *   project_rc_design_v2_v3_convention). Una viga aplica su momento sobre
   *   el eje horizontal PERPENDICULAR a su propia dirección; con el eje local
   *   2 de la columna a lo largo de X y el 3 a lo largo de Y (default de
   *   ETABS para elementos verticales, rotado por `localAxisAngle` si lo hay):
   *     - viga en la dirección del eje 2 → momento sobre el eje 3 → tope de V2
   *     - viga en la dirección del eje 3 → momento sobre el eje 2 → tope de V3
   *
   * REPARTO EN EL NUDO: el ΣMpr de las vigas se reparte entre la columna de
   * arriba y la de abajo. Se usa 50/50 cuando hay columna a ambos lados y
   * 100% cuando esta es la única (último piso o base) — la simplificación
   * estándar; repartir por rigidez relativa exigiría resolver el nudo.
   */
  _rcJointBeamMoment(frame, geometry) {
    const idOf = (n) => (n && typeof n === "object" ? n.id : n);
    const nodeTop = idOf(frame.node2Id ?? frame.node2);
    const nodeBot = idOf(frame.node1Id ?? frame.node1);
    const allFrames = this.getAllFramesForDesign?.() || [];

    const posOf = (nodeId) => {
      const n = (this.nodes || []).find((x) => Number(x.id) === Number(nodeId));
      if (!n) return null;
      return { x: Number(n.position?.x ?? n.x) || 0, y: Number(n.position?.y ?? n.y) || 0, z: Number(n.position?.z ?? n.z) || 0 };
    };

    // Ejes locales 2 y 3 de la columna en el plano horizontal.
    const angRad = ((Number(frame.localAxisAngle) || 0) * Math.PI) / 180;
    const eje2 = { x: Math.cos(angRad), y: Math.sin(angRad) };
    const eje3 = { x: -Math.sin(angRad), y: Math.cos(angRad) };

    /** Mpr (N·m) de una viga en el extremo que llega a `nodeId`. 0 si no hay armado. */
    const mprViga = (f, nodeId) => {
      const sec = f?.frameSection || null;
      const sectionName = sec?.name || f?.sectionName || null;

      // Armado REAL del .e2k (ATI/ABI/ATJ/ABJ) si la sección lo trae; si no,
      // el definido A MANO por sección (ver beamRebarDesigner.js). Este
      // segundo camino es el normal: ETABS no ofrece "Reinforcement to be
      // Checked" para vigas — las diseña siempre — así que un modelo
      // común exporta esos cuatro campos en 0 y sin armado manual el tope
      // por resistencia de vigas nunca podría aplicarse.
      const rebar = this.resolveBeamRebarForSection?.(sectionName, sec);
      if (!rebar) return 0;

      const esExtremoI = Number(idOf(f.node1Id ?? f.node1)) === Number(nodeId);
      // Se toma el MAYOR entre acero superior e inferior de ese extremo: el
      // sismo invierte el signo, así que la viga puede desarrollar su Mpr
      // con cualquiera de las dos capas.
      const asTop = Number(esExtremoI ? rebar.beamAreaTopI : rebar.beamAreaTopJ) || 0;
      const asBot = Number(esExtremoI ? rebar.beamAreaBotI : rebar.beamAreaBotJ) || 0;
      const as = Math.max(asTop, asBot); // m²
      if (!(as > 0)) return 0;

      const { b, h } = this._rcResolveFrameSection(f); // cm
      const { fc, fy } = this._rcResolveFrameMaterial(f); // kg/cm²

      return this._beamMprNm({
        asM2: as,
        bCm: b,
        hCm: h,
        coverCm: Number(rebar.coverTop) || 6, // ETABS COVERTOP, ya en cm
        fc,
        fy,
      });
    };

    const acumular = (nodeId) => {
      const acc = { "2": 0, "3": 0 };
      const pc = posOf(nodeId);
      if (!pc) return acc;

      allFrames.forEach((f) => {
        if (f === frame) return;
        const type = String(f.elementType || f.type || f.objectType || "").toLowerCase();
        if (!type.includes("beam")) return;
        const a = idOf(f.node1Id ?? f.node1);
        const bId = idOf(f.node2Id ?? f.node2);
        if (Number(a) !== Number(nodeId) && Number(bId) !== Number(nodeId)) return;

        const otro = posOf(Number(a) === Number(nodeId) ? bId : a);
        if (!otro) return;
        const dx = otro.x - pc.x;
        const dy = otro.y - pc.y;
        const len = Math.hypot(dx, dy);
        if (!(len > 1e-6)) return;
        const ux = dx / len;
        const uy = dy / len;

        const mpr = mprViga(f, nodeId);
        if (!(mpr > 0)) return;

        // DESCOMPOSICION POR COSENOS DIRECTORES: una viga oblicua aporta a los
        // DOS ejes locales de la columna, en proporcion a su alineacion con
        // cada uno. Antes se le daba el Mpr ENTERO al eje mas alineado ("el
        // ganador se lleva todo"), lo que en un nudo con viga diagonal sobraba
        // en un eje y faltaba en el otro. Con vigas ortogonales las dos formas
        // dan lo mismo (coseno 1 y 0), por eso el error solo aparecia en los
        // nudos oblicuos.
        //
        // VALIDADO contra ETABS (muros modelo 2.1.e2k, 2026-08-18): la viga B25
        // va de (12,4) a (11,8), cosenos 0.2425 y 0.9701. En "vigas
        // equivalentes" ETABS reporta 1.2426 / 0.9701 en C25 y 1.2426 / 1.9702
        // en C20; la descomposicion da 1.2425 / 0.9701 y 1.2425 / 1.9701.
        const proy2 = Math.abs(ux * eje2.x + uy * eje2.y);
        const proy3 = Math.abs(ux * eje3.x + uy * eje3.y);
        acc["3"] += mpr * proy2; // componente ‖ eje 2 → momento sobre eje 3 → V2
        acc["2"] += mpr * proy3; // componente ‖ eje 3 → momento sobre eje 2 → V3
      });

      return acc;
    };

    // REPARTO EN EL NUDO: el ΣMpr de las vigas se le asigna ÍNTEGRO a esta
    // columna, sin repartirlo con la columna del otro lado del nudo. Es lo que
    // hace ETABS — medido en el modelo de referencia (2026-08-18): sus Ve
    // salen exactamente 4.873 t con una viga y 9.7461 t con dos, que es
    // ΣM_vigas/Hn sin ningún factor de reparto.
    //
    // Antes se repartía 50/50 cuando había columna arriba y abajo. Esa
    // simplificación no tiene respaldo en el texto de la norma (ACI no fija
    // un reparto) y dejaba Ve por DEBAJO del de ETABS, que es el lado
    // inseguro.
    const top = acumular(nodeTop);
    const bot = acumular(nodeBot);

    const total = top["2"] + top["3"] + bot["2"] + bot["3"];
    if (!(total > 0)) return null; // ninguna viga con armado real

    return {
      "2": { top: top["2"], bot: bot["2"] },
      "3": { top: top["3"], bot: bot["3"] },
    };
  },

  /**
   * Altura libre Hn (m) de una columna, para Ve = ΣMpr/Hn (ACI 318 §18.7.6.1.1).
   *
   * Se descuenta el peralte COMPLETO de la viga más peraltada que llega al
   * nudo SUPERIOR, y nada en el inferior. El motivo es geométrico: la viga de
   * arriba cuelga hacia abajo dentro del tramo de esta columna, mientras que
   * la viga del nudo de abajo cuelga por debajo de él (pertenece al tramo de
   * la columna del piso anterior). Es la misma regla que usa ETABS: en el
   * modelo de referencia, entrepiso 3.0 m con vigas de 60 cm, ETABS reporta
   * clear length 2.4 = 3.0 − 0.6, exactamente.
   *
   * Antes se restaba MEDIO peralte en cada extremo (3.0 − 0.3 − 0 = 2.7), lo
   * que daba un Ve ~11% bajo respecto de ETABS.
   */
  _rcEstimateClearHeight(frame, length) {
    if (!(length > 0)) return 0;

    const idOf = (n) => (n && typeof n === "object" ? n.id : n);
    const allFrames = this.getAllFramesForDesign?.() || [];

    const zOf = (nodeId) => {
      const n = (this.nodes || []).find((x) => Number(x.id) === Number(nodeId));
      return n ? Number(n.position?.z ?? n.z) || 0 : 0;
    };

    const n1 = idOf(frame.node1Id ?? frame.node1);
    const n2 = idOf(frame.node2Id ?? frame.node2);
    const nodeTop = zOf(n2) >= zOf(n1) ? n2 : n1;

    const beamDepthAt = (nodeId) => {
      let maxH = 0;
      for (const f of allFrames) {
        if (f === frame) continue;
        const type = String(f.elementType || f.type || f.objectType || "").toLowerCase();
        if (!type.includes("beam")) continue;
        const fn1 = idOf(f.node1Id ?? f.node1);
        const fn2 = idOf(f.node2Id ?? f.node2);
        if (Number(fn1) !== Number(nodeId) && Number(fn2) !== Number(nodeId)) continue;
        const { h } = this._rcResolveFrameSection(f);
        if (h > maxH) maxH = h;
      }
      return maxH / 100; // cm -> m
    };

    const hn = length - beamDepthAt(nodeTop);
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
