// resources/js/cad/mixins/analysis/beamRebarDesigner.js
//
// Armado longitudinal de VIGA definido A MANO, por NOMBRE DE SECCIÓN — mismo
// criterio que columnRebarDesigner.js (una propiedad de sección, no por viga
// individual, igual que ETABS).
//
// PARA QUÉ SIRVE: el corte por capacidad de COLUMNAS (design/column_shear.py)
// aplica el tope de ACI 318 §18.7.6.1.1 in fine — "el corte de la columna no
// necesita exceder el que resulta de la resistencia del nudo basada en el Mpr
// de las VIGAS que llegan a él". Ese tope necesita el acero real de las vigas
// (ATI/ABI/ATJ/ABJ del .e2k). ETABS diseña las vigas solas y NO ofrece
// "Reinforcement to be Checked" para ellas, así que un .e2k con vigas en
// auto-diseño exporta ATI/ABI/ATJ/ABJ = 0 y el tope nunca entra: el Ve queda
// gobernado por el Mpr de la propia columna y sale 2-3x el de ETABS.
//
// Esto le da al usuario la vía para cargar ese acero. La fuente natural es la
// tabla de ETABS "Concrete Beam Design Summary" (columnas AsTop / AsBot, en
// mm²) — de ahí salen los cuatro valores de cada extremo.
//
// Accesible desde Definir > Secciones de Barra... > seleccionar sección >
// "Definir Armado de Viga..." (frame-sections-modal.blade.php).

const CM2_TO_M2 = 1e-4;
const M2_TO_CM2 = 1e4;

export const beamRebarDesignerMixin = {
  /**
   * Momento probable Mpr (N·m) de una sección de viga con `asM2` de acero en
   * tracción. ACI 318 §18.7.6.1.1 / E.060 21.4.5.1: fy probable = 1.25·fy,
   * sin φ (resistencia nominal). Bloque rectangular equivalente simple — la
   * viga trabaja a flexión pura, no hay carga axial que resolver.
   *
   * Vive acá (y no inline en rcColumnDesign.js) porque lo usan DOS lugares con
   * la misma fórmula: el tope del corte de columnas y la vista previa de este
   * mismo diseñador, para que el usuario vea qué Mpr va a producir el acero
   * que está tecleando.
   */
  _beamMprNm({ asM2, bCm, hCm, coverCm, fc, fy }) {
    const as = Number(asM2) || 0;
    const b = (Number(bCm) || 0) / 100; // m
    const h = (Number(hCm) || 0) / 100; // m
    const cover = (Number(coverCm) || 0) / 100; // m
    const fcPa = (Number(fc) || 0) * 98066.5; // kg/cm² -> Pa
    const fyPa = (Number(fy) || 0) * 98066.5;

    const d = h - cover;
    if (!(as > 0) || !(b > 0) || !(d > 0) || !(fcPa > 0) || !(fyPa > 0)) return 0;

    const fyPr = 1.25 * fyPa;
    const a = (as * fyPr) / (0.85 * fcPa * b);
    return as * fyPr * (d - a / 2);
  },

  /**
   * As mínimo de flexión (cm²) para una viga rectangular, por código:
   *   ACI 318 §9.6.1.2 : As_min = max(0.8·√f'c/fy , 14/fy) · bw·d   (kg/cm²)
   *   E.060 Art. 10.5.2: As_min = 0.7·√f'c/fy · bw·d
   * El término 14/fy suele gobernar en concretos normales — es el que produce
   * los 542 mm² que ETABS reporta en una 30x60 con f'c=210, fy=4200.
   */
  beamRebarAsMinCm2({ b, h, cover, fc, fy, code }) {
    const bw = Number(b) || 0;
    const d = (Number(h) || 0) - (Number(cover) || 0);
    const fcN = Number(fc) || 0;
    const fyN = Number(fy) || 0;
    if (!(bw > 0) || !(d > 0) || !(fcN > 0) || !(fyN > 0)) return 0;

    const esAci = String(code || "").toUpperCase().includes("ACI");
    const coef = esAci
      ? Math.max((0.8 * Math.sqrt(fcN)) / fyN, 14 / fyN)
      : (0.7 * Math.sqrt(fcN)) / fyN;

    return coef * bw * d;
  },

  /**
   * Abre el diseñador para UNA sección de viga (por nombre). `hint` trae b/h
   * en cm de la sección real.
   */
  openBeamRebarDesigner(sectionName, hint = {}) {
    if (!sectionName) return;

    const b = Number(hint.b) || 30;
    const h = Number(hint.h) || 60;

    // Precarga, mismo orden de prioridad que el diseñador de columnas:
    //   1. Armado manual ya guardado para esta sección.
    //   2. ATI/ABI/ATJ/ABJ importados del .e2k (>0 solo si en ETABS la viga
    //      tenía armado fijo, cosa poco común — normalmente va en auto-diseño).
    //   3. As mínimo de la sección, que es donde caen la mayoría de las vigas
    //      poco cargadas (y lo que ETABS reporta en ese caso).
    const existing = this.manualBeamRebar?.[sectionName] || null;
    const importado = this._rcBeamDraftFromImportedSection(sectionName, b, h);
    const mat = this._rcBeamMaterialForSection(sectionName);

    let draft;
    if (existing) {
      draft = { ...existing };
    } else if (importado) {
      draft = importado;
    } else {
      const cover = 6;
      const asMin = this.beamRebarAsMinCm2({
        b, h, cover, fc: mat.fc, fy: mat.fy, code: this.rcDesignCode,
      });
      const redondeado = Math.round(asMin * 100) / 100;
      draft = {
        cover,
        asTopI: redondeado,
        asBotI: redondeado,
        asTopJ: redondeado,
        asBotJ: redondeado,
      };
    }

    this.beamRebarDesignerState = { sectionName, draft };

    window.dispatchEvent(
      new CustomEvent("open-beam-rebar-designer-modal", {
        detail: {
          sectionName,
          draft,
          b,
          h,
          fc: mat.fc,
          fy: mat.fy,
          code: this.rcDesignCode || "E060",
          label: hint.label || sectionName,
        },
      }),
    );
  },

  /**
   * fc/fy (kg/cm²) de la sección por nombre. Busca una viga real que use esa
   * sección para reutilizar _rcResolveFrameMaterial (que ya sabe resolver el
   * material asignado); si no hay ninguna, cae al material declarado en la
   * propia definición de sección.
   */
  _rcBeamMaterialForSection(sectionName) {
    const frames = this.getAllFramesForDesign?.() || [];
    const frame = frames.find(
      (f) => String(f?.frameSection?.name || f?.sectionName || "").trim() === String(sectionName).trim(),
    );
    if (frame) return this._rcResolveFrameMaterial(frame);

    const secs = this.frameSections?.sections;
    const list = Array.isArray(secs) ? secs : Object.values(secs || {});
    const sec = list.find((s) => String(s?.name || "").trim() === String(sectionName).trim());
    return this._rcResolveFrameMaterial({ frameSection: sec || null });
  },

  /** Draft a partir de ATI/ABI/ATJ/ABJ (m²) del .e2k. null si vienen en 0. */
  _rcBeamDraftFromImportedSection(sectionName, b, h) {
    const secs = this.frameSections?.sections;
    const list = Array.isArray(secs) ? secs : Object.values(secs || {});
    const sec = list.find((s) => String(s?.name || "").trim() === String(sectionName).trim());
    if (!sec) return null;

    const areas = [sec.beamAreaTopI, sec.beamAreaBotI, sec.beamAreaTopJ, sec.beamAreaBotJ].map(
      (v) => Number(v) || 0,
    );
    if (!areas.some((v) => v > 0)) return null;

    const round2 = (m2) => Math.round(m2 * M2_TO_CM2 * 100) / 100;
    return {
      cover: Number(sec.coverTop) || 6, // el importador ya lo pasa a cm
      asTopI: round2(areas[0]),
      asBotI: round2(areas[1]),
      asTopJ: round2(areas[2]),
      asBotJ: round2(areas[3]),
    };
  },

  /**
   * Convierte el draft (cm²/cm) al mismo shape que rcColumnDesign.js espera de
   * `frame.frameSection` cuando el armado vino del .e2k (m² para las áreas, cm
   * para el recubrimiento).
   */
  _beamRebarDraftToSection(draft) {
    if (!draft) return null;
    const num = (v) => Math.max(Number(v) || 0, 0);
    return {
      coverTop: num(draft.cover),
      beamAreaTopI: num(draft.asTopI) * CM2_TO_M2,
      beamAreaBotI: num(draft.asBotI) * CM2_TO_M2,
      beamAreaTopJ: num(draft.asTopJ) * CM2_TO_M2,
      beamAreaBotJ: num(draft.asBotJ) * CM2_TO_M2,
    };
  },

  /**
   * Armado de viga EFECTIVO de una sección: el real del .e2k si lo trae, si no
   * el definido a mano. Devuelve áreas en m² (SI, como el motor). null si no
   * hay ninguno de los dos.
   */
  resolveBeamRebarForSection(sectionName, importedSec = null) {
    const sec = importedSec || null;
    const importadas = sec
      ? [sec.beamAreaTopI, sec.beamAreaBotI, sec.beamAreaTopJ, sec.beamAreaBotJ].map((v) => Number(v) || 0)
      : [0, 0, 0, 0];

    if (importadas.some((v) => v > 0)) {
      return {
        coverTop: Number(sec.coverTop) || 6,
        beamAreaTopI: importadas[0],
        beamAreaBotI: importadas[1],
        beamAreaTopJ: importadas[2],
        beamAreaBotJ: importadas[3],
        manual: false,
      };
    }

    const draft = sectionName ? this.manualBeamRebar?.[sectionName] : null;
    if (!draft) return null;

    const conv = this._beamRebarDraftToSection(draft);
    return conv ? { ...conv, manual: true } : null;
  },

  /** Guarda el armado manual de una sección de viga. */
  saveBeamRebarDesign(sectionName, draft) {
    if (!sectionName || !draft) return false;

    const areas = [draft.asTopI, draft.asBotI, draft.asTopJ, draft.asBotJ].map((v) => Number(v) || 0);
    if (!areas.some((v) => v > 0)) {
      this.showMessage?.("Define al menos un área de acero mayor que cero.", "warning");
      return false;
    }
    if (!(Number(draft.cover) > 0)) {
      this.showMessage?.("El recubrimiento debe ser mayor que cero.", "warning");
      return false;
    }

    if (!this.manualBeamRebar) this.manualBeamRebar = {};
    this.manualBeamRebar[sectionName] = { ...draft };

    this.showMessage?.(
      "✅ Armado de viga guardado — lo usa el tope por resistencia de vigas del corte de columnas.",
      "success",
    );

    window.dispatchEvent(new CustomEvent("beam-rebar-design-saved", { detail: { sectionName } }));

    return true;
  },
};
