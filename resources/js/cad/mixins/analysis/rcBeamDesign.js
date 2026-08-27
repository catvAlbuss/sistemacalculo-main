import { DesignRequirementsCalculator } from "../../../vigas/calculators/designRequirements.js";
import { FlexionCalculator } from "../../../vigas/calculators/flexionCalculator.js";
import { ShearCalculator } from "../../../vigas/calculators/shearCalculator.js";
import { CapacidadCalculator } from "../../../vigas/calculators/capacidadCalculator.js";
import { DeflectionCalculator } from "../../../vigas/calculators/deflectionCalculator.js";
import { StructuralUtils } from "../../../vigas/calculators/SharedCalculatorUtils.js";
import { TABLE_CONFIG } from "../../../vigas/config/constants.js";
import { loadRealFrameForceResults } from "../../engine/frameForceBackend.js";
import { getFrameForceRecord } from "../../diagrams/frameForceDiagramUtils.js";

// Mismos combos de varilla que resources/js/vigas/renderers/flexionResultRenderer.js
// (STEEL_OPTIONS, no exportado ahí) — es solo data de referencia, no lógica,
// así que se duplica en vez de tocar el módulo standalone de vigas.
export const RC_REBAR_OPTIONS = [
  { value: "0", text: 'Ø 0"' },
  { value: "0.283", text: "6mm" },
  { value: "0.503", text: "8mm cm²" },
  { value: "0.713", text: 'Ø 3/8" cm²' },
  { value: "1.131", text: "12mm cm²" },
  { value: "1.267", text: 'Ø 1/2" cm²' },
  { value: "1.979", text: 'Ø 5/8" cm²' },
  { value: "2.850", text: 'Ø 3/4" cm²' },
  { value: "5.067", text: 'Ø 1" cm²' },
  { value: "2.58", text: '2Ø1/2"' },
  { value: "3.87", text: '3Ø1/2"' },
  { value: "3.98", text: '2Ø5/8"' },
  { value: "5.16", text: '4Ø1/2"' },
  { value: "5.27", text: '2Ø5/8"+1Ø1/2"' },
  { value: "5.68", text: '2Ø3/4"' },
  { value: "5.97", text: '3Ø5/8"' },
  { value: "6.45", text: '5Ø1/2"' },
  { value: "6.56", text: '2Ø5/8"+2Ø1/2"' },
  { value: "6.97", text: '2Ø3/4"+1Ø1/2"' },
  { value: "7.67", text: '2Ø3/4"+1Ø5/8"' },
  { value: "7.74", text: '6Ø1/2"' },
  { value: "7.85", text: '2Ø5/8"+3Ø1/2"' },
  { value: "7.916", text: '4Ø5/8"' },
  { value: "8.26", text: '2Ø3/4"+2Ø1/2"' },
  { value: "8.52", text: '3Ø3/4"' },
  { value: "8.55", text: '3Ø5/8"+2Ø1/2"' },
  { value: "9.55", text: '2Ø3/4"+3Ø1/2"' },
  { value: "9.95", text: '5Ø5/8"' },
  { value: "9.66", text: '2Ø3/4"+2Ø5/8"' },
  { value: "10.2", text: '2Ø1"' },
  { value: "10.54", text: '4Ø5/8"+2Ø1/2"' },
  { value: "10.84", text: '2Ø3/4"+4Ø1/2"' },
  { value: "11.1", text: '3Ø3/4"+2Ø1/2"' },
  { value: "11.40", text: '4Ø3/4"' },
  { value: "11.65", text: '2Ø3/4"+3Ø5/8"' },
  { value: "11.94", text: '6Ø5/8"' },
  { value: "15.92", text: '8Ø5/8"' },
  { value: "12.19", text: '2Ø1"+1Ø5/8"' },
  { value: "12.5", text: '3Ø3/4"+2Ø5/8"' },
  { value: "13.04", text: '2Ø1"+1Ø3/4"' },
  { value: "13.64", text: '2Ø3/4"+4Ø5/8"' },
  { value: "13.94", text: '4Ø3/4"+2Ø1/2"' },
  { value: "14.18", text: '2Ø1"+2Ø5/8"' },
  { value: "14.2", text: '5Ø3/4"' },
  { value: "15.3", text: '3Ø1"' },
  { value: "15.34", text: '4Ø3/4"+2Ø5/8"' },
  { value: "15.88", text: '2Ø1"+2Ø3/4"' },
  { value: "16.17", text: '2Ø1"+3Ø5/8"' },
  { value: "17.04", text: '6Ø3/4"' },
  { value: "18.16", text: '2Ø1"+4Ø5/8"' },
  { value: "18.72", text: '2Ø1"+3Ø3/4"' },
  { value: "19.28", text: '3Ø1"+2Ø5/8"' },
  { value: "20.4", text: '4Ø1"' },
  { value: "20.98", text: '3Ø1"+2Ø3/4"' },
  { value: "21.56", text: '2Ø1"+4Ø3/4"' },
  { value: "24.38", text: '4Ø1"+2Ø5/8"' },
  { value: "25.5", text: '5Ø1"' },
  { value: "26.08", text: '4Ø1"+2Ø3/4"' },
  { value: "30.6", text: '6Ø1"' },
];

// frameForceResults guarda fuerzas/momentos en kN / kN-m (ver
// DEFAULT_FRAME_FORCE_UNITS en engine/frameForceResultsContract.js); las
// calculadoras de vigas asumen tonf/tonf-m (StructuralUtils.tonf_m_to_kg_cm
// multiplica por 100000 = tonf-m -> kg-cm). Sin esta conversión, un M3 de
// -91 kN-m se leía como si fueran -91 tonf-m (9.8x más grande de lo real),
// disparando la rama "sección no resiste con ningún As" del cálculo.
const KN_TO_TONF = 1 / 9.80665;

/**
 * @mixin rcBeamDesignMixin
 *
 * Diseño de vigas de concreto armado (ACI-318 / E.060) dentro del CAD,
 * reusando tal cual las 5 clases de resources/js/vigas/calculators/*.js.
 * El único trabajo acá es el ADAPTADOR: de la selección de frames en el
 * viewport a la misma forma de entrada {parametros, datos} que hoy arma
 * dataCollector.js pegando la tabla de ETABS a mano.
 */
export const rcBeamDesignMixin = {
  async openRcBeamDesignDialog() {
    const selected = this.getSelectedFramesForDesign?.() || [];

    if (!selected.length) {
      this.showMessage?.("Selecciona primero los tramos de la viga a diseñar.", "warning");
      return;
    }

    let chain;
    try {
      chain = this._rcOrderBeamChain(selected);
    } catch (err) {
      this.showMessage?.(err.message, "warning");
      return;
    }

    try {
      await loadRealFrameForceResults(this);
    } catch (err) {
      this.showMessage?.(`No se pudieron obtener las fuerzas del modelo: ${err.message}`, "error");
      return;
    }

    const built = this._rcBuildDesignInput(chain);

    if (!built) {
      this.showMessage?.(
        "No hay resultados de fuerzas (CM/CV/ENV) disponibles para los tramos seleccionados.",
        "error",
      );
      return;
    }

    if (built.missingForceRecords?.length) {
      const tramos = [...new Set(built.missingForceRecords.map((m) => m.tramo))];
      const combos = [...new Set(built.missingForceRecords.map((m) => m.combo))];
      console.warn(
        `⚠️ Diseño de viga: sin registro de fuerzas para ${built.missingForceRecords.length} combo(s) — ` +
          `los tramos ${tramos.join(", ")} van a salir con Mu=0 (falso "CUMPLE") para ${combos.join(", ")}. ` +
          "Causas típicas: el caso de carga usa un nombre no reconocido (ya se resuelve por patternType Dead/" +
          "Live, pero revisa igual), o la barra se agregó/editó después del último análisis cacheado.",
        built.missingForceRecords,
      );
      this.showMessage?.(
        `⚠️ El tramo ${tramos.join(", ")} no tiene fuerzas calculadas para ${combos.join(", ")} — ` +
          "el diseño de esa parte va a salir en 0. Revisa la consola para el detalle antes de confiar en el resultado.",
        "warning",
      );
    }

    this._rcBeamDesignInput = built;
    this.rcBeamDesign = {
      numTramos: chain.length,
      rebarState: null,
      results: null,
    };

    // Abre mostrando SOLO la entrada (geometría + fuerzas CM/CV/ENV por
    // tramo/estación, misma forma que arma dataCollector.js al pegar la
    // tabla de ETABS a mano en vigas-general) — el cálculo recién corre
    // cuando el usuario confirma con el botón "Diseñar" del modal
    // (rcBeamDesignRun), para que pueda revisar/comparar la entrada antes.
    window.dispatchEvent(
      new CustomEvent("open-viga-design-modal", {
        detail: {
          input: built,
          results: null,
          rebarState: null,
          rebarOptions: RC_REBAR_OPTIONS,
          // Mismo TABLE_CONFIG.GROUPS que usa vigas-general para armar sus
          // filas — se pasa tal cual (no se duplica a mano en el modal) para
          // que la tabla de entrada del CAD quede SIEMPRE igual a la de
          // vigas-general, incluso si esa configuración cambia más adelante.
          groupsConfig: TABLE_CONFIG.GROUPS,
        },
      }),
    );
  },

  /**
   * Corre el diseño (5 calculadoras) sobre la entrada ya construida y
   * confirmada por el usuario en el modal (botón "Diseñar") — separado de
   * openRcBeamDesignDialog para que la tabla de entrada se pueda revisar
   * ANTES de calcular, no junto con el resultado.
   */
  rcBeamDesignRun() {
    if (!this._rcBeamDesignInput) return;

    this._rcRunAllCalculations();
    this._rcAutoSelectRebar();

    window.dispatchEvent(
      new CustomEvent("rc-beam-design-updated", {
        detail: {
          results: this.rcBeamDesign.results,
          rebarState: this.rcBeamDesign.rebarState,
        },
      }),
    );
  },

  /**
   * Ordena los frames seleccionados en una cadena única de tramos (de un
   * extremo al otro), y marca por tramo si su node1→node2 va en el mismo
   * sentido de la cadena ("forward") o al revés — necesario para saber, por
   * tramo, cuál de sus dos extremos es el "inicio" (a) y cuál el "fin" (c) de
   * la viga completa, ya que cada frame trae sus propias estaciones 0..1 en
   * el sentido de SU node1→node2, no necesariamente el de la viga.
   */
  _rcOrderBeamChain(frames) {
    if (!Array.isArray(frames) || !frames.length) return [];

    if (frames.length === 1) {
      return [{ frame: frames[0], forward: true }];
    }

    const groups = this.buildJoinLineGroups(frames, 0.01);
    const matching = groups.find(
      (g) => g.length === frames.length && frames.every((f) => g.includes(f)),
    );

    if (!matching) {
      throw new Error(
        "La selección no forma una sola viga continua y alineada. Selecciona solo tramos conectados en línea recta.",
      );
    }

    const nodeCount = new Map();
    matching.forEach((f) => {
      nodeCount.set(f.node1, (nodeCount.get(f.node1) || 0) + 1);
      nodeCount.set(f.node2, (nodeCount.get(f.node2) || 0) + 1);
    });

    const ends = [...nodeCount.entries()].filter(([, c]) => c === 1).map(([n]) => n);

    if (ends.length !== 2) {
      throw new Error(
        "No se pudo determinar un único extremo de la viga (¿hay una ramificación en la selección?).",
      );
    }

    let currentNode = ends[0];
    const remaining = new Set(matching);
    const ordered = [];

    while (remaining.size) {
      const next = [...remaining].find((f) => f.node1 === currentNode || f.node2 === currentNode);

      if (!next) {
        throw new Error("La cadena de tramos seleccionados está rota (revisa que compartan nudos).");
      }

      const forward = next.node1 === currentNode;
      ordered.push({ frame: next, forward });
      currentNode = forward ? next.node2 : next.node1;
      remaining.delete(next);
    }

    return ordered;
  },

  // _rcResolveFrameSection / _rcResolveFrameMaterial / _rcFrameForceStationRaw
  // ahora viven en rcSectionMaterial.js (compartidas con rcColumnDesign.js) —
  // ver ese archivo. Se registran como mixin aparte en cad_sys.js, así que
  // están disponibles en `this` igual que antes.

  /** kN/kN-m (motor) -> tonf/tonf-m (calculadoras de vigas). */
  _rcStationValue(record, relativeStation, component) {
    return this._rcFrameForceStationRaw(record, relativeStation, component) * KN_TO_TONF;
  },

  /**
   * Arma {parametros, datos} — el mismo contrato de entrada que
   * resources/js/vigas/data/dataCollector.js — a partir de la cadena de
   * tramos y de cadSystem.frameForceResults (ya calculado por el motor).
   *
   * Los combos "CM"/"CV" son los casos base SIN factorar del motor
   * (getFrameForceRecord con caseId, comboId=null); "ENV Max"/"ENV Min" son
   * la envolvente de diseño YA factorada (E.060, incluye ± sismo) que arma
   * `_ff_envelope_over_combos` en python-backend/seismic/solver.py — mapeo
   * 1:1 con lo que vigas llama "ENV max"/"ENV min".
   *
   * OJO — quirk de FlexionCalculator.js (NO se toca, se trabaja alrededor):
   * para el momento de diseño usa el M3 del PRIMER grupo que encuentre con
   * esa clave en `fuerzas.positivo/negativo` (Object.entries en orden de
   * inserción), sin mirar el nombre del grupo. Si insertáramos "CM" primero
   * (como hace la tabla original), tomaría la carga muerta SIN FACTORAR como
   * momento de diseño — subdiseño peligroso. Por eso se inserta primero un
   * grupo sintético "__DESIGN__" con el M3 ya resuelto correctamente
   * (negativo → ENV Min, el más negativo; positivo → ENV Max, el más
   * positivo), y recién después CM/CV/ENV max/ENV min completos (con sus
   * V3/T reales) para que ShearCalculator/CapacidadCalculator/
   * DeflectionCalculator —que sí buscan por nombre explícito— los encuentren
   * donde corresponde.
   */
  /**
   * Resuelve los IDs de caso REALES de carga muerta/viva del modelo — antes
   * venían hardcodeados como literal "CM"/"CV", que rompía en cualquier .e2k
   * que nombrara distinto su patrón vivo (ej. "CVE", como en un modelo real
   * del usuario: `LOADPATTERN "CVE" TYPE "Live"`) — la viga quedaba con
   * Mu=0 (falso "CUMPLE") y deflexión por CV en 0, sin avisar. Mismo criterio
   * de clasificación que ya usa el motor (`_ff_default_design_combos` en
   * solver.py): por `patternType` primero, nombre literal como respaldo.
   *
   * Devuelve TODOS los casos de cada tipo (no solo el primero): un modelo con
   * más de un patrón muerto (autopeso + acabados, p.ej.) o más de un patrón
   * vivo (CV + CVT en techo) tiene la carga de servicio repartida entre
   * varios `LOADPATTERN`, igual que arma el motor su combo factorado
   * (`_ff_default_design_combos` SUMA todos los "dead"/todos los "live", no
   * se queda con uno). Con `.find()` (un solo caso) la viga podía leer un
   * patrón sin carga en ese tramo y salir con Δzm/Δz30% en 0 aunque
   * Flexión/Capacidad (que sí usan el combo ya sumado del motor) dieran bien
   * — la asimetría era la causa real del bug.
   */
  _rcResolveGravityCaseIds(results) {
    const cases = Array.isArray(results?.cases) ? results.cases : [];
    const byType = (type) =>
      cases.filter((c) => String(c.patternType || "").toLowerCase() === type).map((c) => c.id);
    const byName = (names) =>
      cases.filter((c) => names.includes(String(c.id || "").toUpperCase())).map((c) => c.id);

    const dead = byType("dead");
    const live = [...byType("live"), ...byType("rooflive")];

    return {
      dead: dead.length ? dead : byName(["CM", "DEAD", "D"]).length ? byName(["CM", "DEAD", "D"]) : ["CM"],
      live: live.length ? live : byName(["CV", "CVE", "LIVE", "L"]).length ? byName(["CV", "CVE", "LIVE", "L"]) : ["CV"],
    };
  },

  _rcBuildDesignInput(chain) {
    const results = this.frameForceResults;
    if (!results?.frameForces?.length) return null;

    const { dead: deadCaseIds, live: liveCaseIds } = this._rcResolveGravityCaseIds(results);
    const numTramos = chain.length;

    const datos = {
      luz: {},
      base: {},
      altura: {},
      capas: { positivo: {}, negativo: {} },
      fuerzas: { positivo: {}, negativo: {} },
    };

    ["positivo", "negativo"].forEach((section) => {
      datos.fuerzas[section] = {
        __DESIGN__: { M3: {} },
        // V3 en CM/CV: cortante de gravedad SIN factorar por patrón (autopeso,
        // vivo) — lo usa CapacidadCalculator para el término 1.25×(Vcm+Vcv) de
        // Vu(cap). Antes no se llenaba (solo M3), así que ese término salía
        // siempre en 0 — ver readComboSum(..., "V2") más abajo.
        CM: { M3: {}, V3: {} },
        CV: { M3: {}, V3: {} },
        "ENV max": { V3: {}, T: {}, M3: {} },
        "ENV min": { V3: {}, T: {}, M3: {} },
      };
    });

    let globalFc = null;
    let globalFy = null;
    // Combos SIN registro para algún tramo — el motor/caché no tenía datos
    // para esa barra (típicamente: la barra se agregó/editó DESPUÉS del
    // último análisis cacheado, ver frameForceBackend.js "el modelo no
    // cambió"). Sin esto, un record null cae en el fallback silencioso de
    // _rcFrameForceStationRaw (devuelve 0) y el diseño sale con Mu=0 en
    // TODAS las estaciones — se ve como "CUMPLE" válido cuando en realidad
    // no hay dato. Se junta acá y se avisa en openRcBeamDesignDialog.
    const missingRecords = [];

    chain.forEach(({ frame, forward }, idx) => {
      const i = idx + 1;
      const tramoKey = `tramo${i}`;

      const { b, h } = this._rcResolveFrameSection(frame);
      const { fc, fy } = this._rcResolveFrameMaterial(frame);

      if (globalFc === null && fc > 0) {
        globalFc = fc;
        globalFy = fy;
      }

      datos.luz[tramoKey] = this.getFrameLengthForDesign?.(frame) || 0;
      datos.base[tramoKey] = b;
      datos.altura[tramoKey] = h;
      datos.capas.positivo[tramoKey] = 1;
      datos.capas.negativo[tramoKey] = 1;

      const frameId = frame.id;

      // pos: 0=start(a) 1=mid(b) 2=end(c) DE LA VIGA (no del frame crudo).
      const relStationOf = (pos) => {
        if (pos === 1) return 0.5;
        if (pos === 0) return forward ? 0 : 1;
        return forward ? 1 : 0;
      };

      const readCombo = (caseId, comboId, component) => {
        const record = getFrameForceRecord(results, frameId, caseId, comboId);
        if (!record) {
          missingRecords.push({ tramo: i, frameId, label: frame?.e2kName || frameId, combo: comboId || caseId });
        }
        return {
          a: this._rcStationValue(record, relStationOf(0), component),
          b: this._rcStationValue(record, relStationOf(1), component),
          c: this._rcStationValue(record, relStationOf(2), component),
        };
      };

      // Suma el M3 de servicio (sin factorar) de TODOS los casos de un tipo
      // (p.ej. autopeso + acabados en "dead") — un solo `readCombo` se
      // quedaba con lo que trajera ESE caso puntual en esta barra, y si el
      // patrón "elegido" no tenía carga acá (típico con más de un patrón
      // muerto/vivo en el modelo), CM/CV salían en 0 aunque Flexión/Capacidad
      // (que usan el combo YA sumado por el motor, "ENV max"/"ENV min")
      // dieran bien — de ahí Δzm/ΔzL/Δz30% en 0 sin avisar.
      const readComboSum = (caseIds, component) => {
        const total = { a: 0, b: 0, c: 0 };
        (caseIds.length ? caseIds : [null]).forEach((caseId) => {
          const part = readCombo(caseId, null, component);
          total.a += part.a;
          total.b += part.b;
          total.c += part.c;
        });
        return total;
      };

      ["positivo", "negativo"].forEach((section) => {
        const f = datos.fuerzas[section];

        f.CM.M3[tramoKey] = readComboSum(deadCaseIds, "M3");
        f.CV.M3[tramoKey] = readComboSum(liveCaseIds, "M3");

        // OJO: la columna "V3" de las tablas de vigas (heredada de como el
        // usuario pegaba la tabla de ETABS) es el cortante que ACOMPAÑA a M3,
        // no el componente que el motor llama "V3". Por estática de barra
        // (python-backend/seismic/solver.py, _ff_stations_from_end_forces):
        //   M3(s) = M3_i - V2_i*s - ...   -> M3 lo genera V2
        //   M2(s) = M2_i + V3_i*s + ...   -> M2 lo genera V3
        // O sea el cortante mayor (el que importa para el diseño a corte de
        // una viga con carga de gravedad) es V2 del motor, no V3 — V3 del
        // motor es el cortante del eje menor, ~0 sin carga lateral. Por eso
        // se lee "V2" acá pero se guarda bajo la clave "V3" que esperan
        // ShearCalculator/CapacidadCalculator.
        f.CM.V3[tramoKey] = readComboSum(deadCaseIds, "V2");
        f.CV.V3[tramoKey] = readComboSum(liveCaseIds, "V2");

        f["ENV max"].V3[tramoKey] = readCombo(null, "ENV Max", "V2");
        f["ENV max"].T[tramoKey] = readCombo(null, "ENV Max", "T");
        f["ENV max"].M3[tramoKey] = readCombo(null, "ENV Max", "M3");

        f["ENV min"].V3[tramoKey] = readCombo(null, "ENV Min", "V2");
        f["ENV min"].T[tramoKey] = readCombo(null, "ENV Min", "T");
        f["ENV min"].M3[tramoKey] = readCombo(null, "ENV Min", "M3");
      });

      datos.fuerzas.negativo.__DESIGN__.M3[tramoKey] = datos.fuerzas.negativo["ENV min"].M3[tramoKey];
      datos.fuerzas.positivo.__DESIGN__.M3[tramoKey] = datos.fuerzas.positivo["ENV max"].M3[tramoKey];
    });

    // Dedupe (CM/CV se leen una vez por sección positivo/negativo -> 2x el
    // mismo faltante) — un aviso por tramo+combo alcanza.
    const seen = new Set();
    const dedupedMissing = missingRecords.filter(({ tramo, combo }) => {
      const key = `${tramo}|${combo}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });

    return {
      parametros: {
        fc: globalFc || 210,
        fy: globalFy || 4200,
        numTramos,
      },
      datos,
      missingForceRecords: dedupedMissing,
    };
  },

  _rcRunAllCalculations() {
    const built = this._rcBeamDesignInput;
    if (!built) return;

    const requirements = new DesignRequirementsCalculator(built).calculate();
    const flexion = new FlexionCalculator(built).calculate();

    const numCells = built.parametros.numTramos * 3;

    if (!this.rcBeamDesign.rebarState) {
      this.rcBeamDesign.rebarState = {
        negativo: {
          phiMn: new Array(numCells).fill(0),
          asReal: new Array(numCells).fill(0),
          dReal: new Array(numCells).fill(0),
        },
        positivo: {
          phiMn: new Array(numCells).fill(0),
          asReal: new Array(numCells).fill(0),
          dReal: new Array(numCells).fill(0),
        },
      };
    }

    const capacidad = new CapacidadCalculator(built, this.rcBeamDesign.rebarState).calculate();
    const shear = new ShearCalculator(built).calculate();
    const deflection = new DeflectionCalculator(built, this.rcBeamDesign.rebarState).calculate();

    this.rcBeamDesign.results = { requirements, flexion, shear, capacidad, deflection };
  },

  /**
   * Elige sola, para cada celda (Flexión positiva y negativa, cada tramo ×
   * estación), la opción MÁS CHICA de RC_REBAR_OPTIONS cuya área cubra el
   * As_usar calculado — el usuario ya no arranca en "Ø 0" (NO CUMPLE por
   * falta de acero asignado, no por diseño insuficiente). Corre una sola vez
   * al abrir el diálogo (después del primer cálculo, que es el que produce
   * As_usar); el usuario puede sobreescribir cualquier celda a mano después
   * con el mismo selector de siempre (rcBeamDesignSetRebar).
   *
   * Misma fórmula de ФMn que rcBeamDesignSetRebar (no se factoriza a una
   * función compartida para no tocar esa ruta ya validada) — acá se aplica a
   * TODAS las celdas de una vez y se recalcula el resto UNA sola vez al
   * final, no por celda (evitar 12 recálculos completos en cascada).
   */
  _rcAutoSelectRebar() {
    const flex = this.rcBeamDesign?.results?.flexion;
    if (!flex) return;

    // RC_REBAR_OPTIONS NO está ordenado por área (los combos de varias
    // barras vienen después de los diámetros sueltos, fuera de orden) — hay
    // que ordenar antes de buscar "la más chica que alcanza".
    const sortedOptions = RC_REBAR_OPTIONS.map((o) => Number(o.value))
      .filter((v) => v > 0)
      .sort((a, b) => a - b);

    const pickArea = (asUsar) => {
      const need = Number(asUsar) || 0;
      if (need <= 0) return 0;
      return sortedOptions.find((v) => v >= need) ?? sortedOptions[sortedOptions.length - 1] ?? 0;
    };

    ["positivo", "negativo"].forEach((sectionType) => {
      const data = flex[sectionType]?.data;
      const state = this.rcBeamDesign.rebarState?.[sectionType];
      if (!data || !state) return;

      (data.As_usar || []).forEach((asUsar, flatIdx) => {
        const meta = data.meta?.[flatIdx];
        if (!meta) return;

        const asReal = pickArea(asUsar);
        const dReal = StructuralUtils.calculateEffectiveDepth(meta.h, 1);

        let phiMn = 0;
        if (asReal > 0 && meta.b > 0 && meta.fc > 0) {
          const a = (asReal * meta.fy) / (0.85 * meta.fc * meta.b);
          const MnKgcm = asReal * meta.fy * (dReal - a / 2);
          phiMn = (0.9 * MnKgcm) / 100000; // tonf-m
        }

        state.asReal[flatIdx] = asReal;
        state.dReal[flatIdx] = dReal;
        state.phiMn[flatIdx] = phiMn;
      });
    });

    this._rcRunAllCalculations();
  },

  /**
   * Llamado desde el modal cuando el usuario elige el acero real de una
   * celda de Flexión (espejo de handleSteelChange en
   * flexionResultRenderer.js, sin tocar ese archivo). Recalcula ФMn de esa
   * celda y dispara el recálculo en cascada de Cortante/Capacidad/Deflexión.
   */
  rcBeamDesignSetRebar(sectionType, tramoIdx, posIdx, areaValue) {
    const flex = this.rcBeamDesign?.results?.flexion;
    if (!flex) return;

    const flatIdx = (tramoIdx - 1) * 3 + posIdx;
    const meta = flex[sectionType]?.data?.meta?.[flatIdx];
    if (!meta) return;

    const asReal = Number(areaValue) || 0;
    const dReal = StructuralUtils.calculateEffectiveDepth(meta.h, 1);

    let phiMn = 0;
    if (asReal > 0 && meta.b > 0 && meta.fc > 0) {
      const a = (asReal * meta.fy) / (0.85 * meta.fc * meta.b);
      const MnKgcm = asReal * meta.fy * (dReal - a / 2);
      phiMn = (0.9 * MnKgcm) / 100000; // tonf-m
    }

    const state = this.rcBeamDesign.rebarState[sectionType];
    state.asReal[flatIdx] = asReal;
    state.dReal[flatIdx] = dReal;
    state.phiMn[flatIdx] = phiMn;

    this._rcRunAllCalculations();

    window.dispatchEvent(
      new CustomEvent("rc-beam-design-updated", {
        detail: {
          results: this.rcBeamDesign.results,
          rebarState: this.rcBeamDesign.rebarState,
        },
      }),
    );
  },
};
