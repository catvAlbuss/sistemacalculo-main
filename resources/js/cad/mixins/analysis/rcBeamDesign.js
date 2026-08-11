import { DesignRequirementsCalculator } from "../../../vigas/calculators/designRequirements.js";
import { FlexionCalculator } from "../../../vigas/calculators/flexionCalculator.js";
import { ShearCalculator } from "../../../vigas/calculators/shearCalculator.js";
import { CapacidadCalculator } from "../../../vigas/calculators/capacidadCalculator.js";
import { DeflectionCalculator } from "../../../vigas/calculators/deflectionCalculator.js";
import { StructuralUtils } from "../../../vigas/calculators/SharedCalculatorUtils.js";
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

    this._rcBeamDesignInput = built;
    this.rcBeamDesign = {
      numTramos: chain.length,
      rebarState: null,
      results: null,
    };

    this._rcRunAllCalculations();

    window.dispatchEvent(
      new CustomEvent("open-viga-design-modal", {
        detail: {
          input: built,
          results: this.rcBeamDesign.results,
          rebarState: this.rcBeamDesign.rebarState,
          rebarOptions: RC_REBAR_OPTIONS,
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
  _rcBuildDesignInput(chain) {
    const results = this.frameForceResults;
    if (!results?.frameForces?.length) return null;

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
        CM: { M3: {} },
        CV: { M3: {} },
        "ENV max": { V3: {}, T: {}, M3: {} },
        "ENV min": { V3: {}, T: {}, M3: {} },
      };
    });

    let globalFc = null;
    let globalFy = null;

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
        return {
          a: this._rcStationValue(record, relStationOf(0), component),
          b: this._rcStationValue(record, relStationOf(1), component),
          c: this._rcStationValue(record, relStationOf(2), component),
        };
      };

      ["positivo", "negativo"].forEach((section) => {
        const f = datos.fuerzas[section];

        f.CM.M3[tramoKey] = readCombo("CM", null, "M3");
        f.CV.M3[tramoKey] = readCombo("CV", null, "M3");

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

    return {
      parametros: {
        fc: globalFc || 210,
        fy: globalFy || 4200,
        numTramos,
      },
      datos,
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
