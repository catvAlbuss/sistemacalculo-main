/**
 * SISTEMA DE UNIDADES DE VISUALIZACIÓN (estilo ETABS "Consistent Units")
 *
 * Selector global de unidades para los diálogos de definición (materiales,
 * frame sections, losas). Soporta por ahora:
 *   Fuerza:   tonf | kgf
 *   Longitud: m   | cm
 *
 * IMPORTANTE — Convención de almacenamiento INTERNO (NO cambiar):
 *   - Materiales: E/G/f'c/fy en MPa, peso en N/mm³, masa en ton/mm³ (ETABS N-mm).
 *   - Frame sections rectangulares: b/h en cm.
 *   - Losas: espesor en mm.
 *   - Propiedades calculadas del modelo: SI (m, m², m⁴, Pa).
 * El motor de cálculo está calibrado con esas unidades. Este módulo SOLO
 * convierte en la frontera de la UI (mostrar/leer inputs); el modelo y los
 * payloads al backend no se tocan.
 *
 * Uso desde los modales Blade/Alpine:
 *   window.cadUnits.labels().stress      → "tonf/m²" | "kgf/cm²" | ...
 *   window.cadUnits.stressMPaToDisp(v)   → convierte MPa a la unidad activa
 *   window.cadUnits.stressDispToMPa(v)   → parsea el input del usuario a MPa
 *   window.addEventListener("cad-units-changed", ...) → refrescar la UI
 */

const STORAGE_KEY = "jh_cad_display_units";

// Factores a SI
const FORCE_TO_N = { tonf: 9806.65, kgf: 9.80665 };
const LENGTH_TO_M = { m: 1, cm: 0.01 };
// Masa asociada a cada unidad de fuerza (tonf→ton, kgf→kg)
const MASS_LABEL = { tonf: "ton", kgf: "kg" };
const MASS_TO_KG = { tonf: 1000, kgf: 1 };

function sanitizeForce(force) {
  return FORCE_TO_N[force] ? force : "tonf";
}

function sanitizeLength(length) {
  return LENGTH_TO_M[length] ? length : "m";
}

// Redondeo a cifras significativas para no ensuciar los inputs con
// colas de coma flotante al convertir ida y vuelta.
function roundSig(value, sig = 8) {
  const n = Number(value);
  if (!Number.isFinite(n) || n === 0) return 0;
  const mag = Math.ceil(Math.log10(Math.abs(n)));
  const factor = Math.pow(10, sig - mag);
  return Math.round(n * factor) / factor;
}

function loadSaved() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return {
      force: sanitizeForce(parsed?.force),
      length: sanitizeLength(parsed?.length),
    };
  } catch (e) {
    return null;
  }
}

const saved = loadSaved();

export const cadUnits = {
  force: saved?.force || "tonf",
  length: saved?.length || "m",

  // ─── Cambiar unidades (dispara evento global para refrescar UIs) ───
  set(force, length) {
    this.force = sanitizeForce(force);
    this.length = sanitizeLength(length);

    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ force: this.force, length: this.length }),
      );
    } catch (e) { /* almacenamiento no disponible */ }

    window.dispatchEvent(
      new CustomEvent("cad-units-changed", {
        detail: { force: this.force, length: this.length },
      }),
    );

    window.cadSystem?.showMessage?.(`Unidades: ${this.force}, ${this.length}`);
  },

  // ─── Etiquetas de unidades derivadas ───
  labels() {
    const F = this.force;
    const L = this.length;
    return {
      force: F,
      length: L,
      mass: MASS_LABEL[F],
      area: `${L}²`,
      inertia: `${L}⁴`,
      stress: `${F}/${L}²`,
      unitWeight: `${F}/${L}³`,
      massPerVol: `${MASS_LABEL[F]}/${L}³`,
      moment: `${F}·${L}`,
      distLoad: `${F}/${L}`,
      areaLoad: `${F}/${L}²`,
    };
  },

  // =====================================================
  // CONVERSIONES SIMPLES DESDE SI (para visores de resultados)
  // =====================================================
  forceNToDisp(n) {
    return roundSig((Number(n) || 0) / this._FN());
  },

  massKgToDisp(kg) {
    return roundSig((Number(kg) || 0) / this._MK());
  },

  // Masa en unidades ETABS (F·s²/m): 1 tonf·s²/m = 9806.65 kg,
  // 1 kgf·s²/m = 9.80665 kg. Es la unidad de las tablas de masa de
  // ETABS (Mass Summary by Story, Assembled Joint Masses).
  massKgToEtabsDisp(kg) {
    return roundSig((Number(kg) || 0) / this._FN());
  },

  etabsMassLabel() {
    return `${this.force}-s²/m`;
  },

  lenMToDisp(m) {
    return roundSig((Number(m) || 0) / this._LM());
  },

  momentNmToDisp(nm) {
    return roundSig((Number(nm) || 0) / (this._FN() * this._LM()));
  },

  // ─── Factores base de la unidad activa ───
  _FN() { return FORCE_TO_N[this.force]; },       // 1 unidad de fuerza → N
  _LM() { return LENGTH_TO_M[this.length]; },     // 1 unidad de longitud → m
  _MK() { return MASS_TO_KG[this.force]; },       // 1 unidad de masa → kg

  // =====================================================
  // ESFUERZO (E, G, f'c, fy) — interno: MPa (= 1e6 N/m²)
  // =====================================================
  stressMPaToDisp(mpa) {
    const nPerM2 = (Number(mpa) || 0) * 1e6;
    const dispUnit = this._FN() / Math.pow(this._LM(), 2);   // N/m² por unidad display
    return roundSig(nPerM2 / dispUnit);
  },

  stressDispToMPa(v) {
    const dispUnit = this._FN() / Math.pow(this._LM(), 2);
    return roundSig(((Number(v) || 0) * dispUnit) / 1e6);
  },

  // =====================================================
  // PESO ESPECÍFICO — interno: N/mm³ (= 1e9 N/m³)
  // =====================================================
  wNmm3ToDisp(nmm3) {
    const nPerM3 = (Number(nmm3) || 0) * 1e9;
    const dispUnit = this._FN() / Math.pow(this._LM(), 3);
    return roundSig(nPerM3 / dispUnit);
  },

  wDispToNmm3(v) {
    const dispUnit = this._FN() / Math.pow(this._LM(), 3);
    return roundSig(((Number(v) || 0) * dispUnit) / 1e9);
  },

  // =====================================================
  // MASA POR VOLUMEN — interno: ton/mm³ (= 1e12 kg/m³)
  // Display: ton/L³ (sistema tonf) o kg/L³ (sistema kgf)
  // =====================================================
  massTonMm3ToDisp(tonmm3) {
    const kgPerM3 = (Number(tonmm3) || 0) * 1e12;
    const dispUnit = this._MK() / Math.pow(this._LM(), 3);
    return roundSig(kgPerM3 / dispUnit);
  },

  massDispToTonMm3(v) {
    const dispUnit = this._MK() / Math.pow(this._LM(), 3);
    return roundSig(((Number(v) || 0) * dispUnit) / 1e12);
  },

  // =====================================================
  // LONGITUD — internos: cm (frame sections) y mm (losas)
  // =====================================================
  lenCmToDisp(cm) {
    return roundSig(((Number(cm) || 0) * 0.01) / this._LM());
  },

  lenDispToCm(v) {
    return roundSig(((Number(v) || 0) * this._LM()) / 0.01);
  },

  lenMmToDisp(mm) {
    return roundSig(((Number(mm) || 0) * 0.001) / this._LM());
  },

  lenDispToMm(v) {
    return roundSig(((Number(v) || 0) * this._LM()) / 0.001);
  },

  // =====================================================
  // ÁREA / INERCIA — interno: SI (m², m⁴). Solo lectura en la UI.
  // =====================================================
  areaM2ToDisp(m2) {
    return roundSig((Number(m2) || 0) / Math.pow(this._LM(), 2));
  },

  inertiaM4ToDisp(m4) {
    return roundSig((Number(m4) || 0) / Math.pow(this._LM(), 4));
  },

  // =====================================================
  // CARGA POR ÁREA — interno: kgf/m² (losas/áreas). Solo display.
  // =====================================================
  areaLoadKgfM2ToDisp(kgfm2) {
    const nPerM2 = (Number(kgfm2) || 0) * FORCE_TO_N.kgf;
    const dispUnit = this._FN() / Math.pow(this._LM(), 2);
    return roundSig(nPerM2 / dispUnit);
  },

  // =====================================================
  // CARGA DISTRIBUIDA (fuerza/longitud) — interno del motor: N/m.
  // Display: F/L de la unidad activa (tonf/m, kgf/cm, …). Usado por el
  // modal de cargas distribuidas en frames.
  // =====================================================
  distLoadDispToNPerM(v) {
    // 1 unidad display F/L = _FN() N / _LM() m.
    return (Number(v) || 0) * (this._FN() / this._LM());
  },

  distLoadNPerMToDisp(nPerM) {
    return roundSig((Number(nPerM) || 0) / (this._FN() / this._LM()));
  },
};

// Exponer global para los modales Blade (componentes Alpine fuera del bundle).
window.cadUnits = cadUnits;
