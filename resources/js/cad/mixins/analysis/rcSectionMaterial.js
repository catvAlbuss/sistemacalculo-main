// resources/js/cad/mixins/analysis/rcSectionMaterial.js
//
// Resolución de sección/material/fuerzas compartida entre el diseño de vigas
// (rcBeamDesign.js) y columnas (rcColumnDesign.js) de concreto armado.
// Extraído de rcBeamDesign.js sin cambiar su comportamiento — ver
// project_rc_design_v2_v3_convention (memoria) para el porqué de cada
// conversión.

export const MPA_TO_KGCM2 = 10.19716;

// frameForceResults guarda fuerzas/momentos en kN / kN-m (ver
// DEFAULT_FRAME_FORCE_UNITS en engine/frameForceResultsContract.js).
export const KN_TO_TONF = 1 / 9.80665;
export const KN_TO_N = 1000;

export const rcSectionMaterialMixin = {
  /**
   * b/h en cm. Fuente canónica: frame.frameSection (import E2K, ya en cm).
   * Fallback a sectionProperties/section — algunos presets viejos
   * (assign-dialogs.js VIGA_25X50 etc.) guardan b/h en METROS, así que un
   * valor chico (<3) se asume metros y se convierte.
   */
  _rcResolveFrameSection(frame) {
    const sec = frame?.frameSection || frame?.sectionProperties || frame?.section || null;

    let b = Number(sec?.b ?? sec?.width ?? sec?.base ?? 0);
    let h = Number(sec?.h ?? sec?.height ?? sec?.peralte ?? 0);

    if (b > 0 && b < 3) b *= 100;
    if (h > 0 && h < 3) h *= 100;

    return { b, h };
  },

  /**
   * fc/fy en kg/cm². Prioriza el material YA asignado al frame
   * (frame.materialProperties); si no, resuelve por nombre contra
   * materialProperties.materials (mismo patrón que
   * _getMaterialDefinitionForSeismic en mixins/analysis/seismic/payload.js).
   * Los materiales de este catálogo guardan fc/fy en MPa (ver e2k-import.js
   * FC×TONFM2_TO_MPA) — se convierte a kg/cm², salvo que el valor ya luzca
   * como kg/cm² (>100 para fc, >1000 para fy).
   */
  _rcResolveFrameMaterial(frame) {
    let matObj = frame?.materialProperties || null;

    if (!matObj) {
      const name = frame?.frameSection?.material || frame?.material || frame?.materialName || null;
      const source = this.materialProperties?.materials;

      if (name && source) {
        const list = Array.isArray(source) ? source : Object.values(source);
        matObj = list.find((m) => String(m?.name || m?.id || "").trim() === String(name).trim()) || null;
      }
    }

    const fcRaw = Number(matObj?.fc ?? matObj?.fpc ?? 21);
    const fyRaw = Number(matObj?.fy ?? 420);

    const fc = fcRaw > 100 ? fcRaw : fcRaw * MPA_TO_KGCM2;
    let fy = fyRaw > 1000 ? fyRaw : fyRaw * MPA_TO_KGCM2;

    // fy DEL ACERO DE REFUERZO: manda el material declarado en la sección
    // (LONGBARMATERIAL del .e2k), no el del concreto.
    //
    // El material de concreto NO trae fy, así que el importador le pone un
    // default de 420 MPa (ver e2k-import.js) que equivale a 4283 kg/cm². Ese
    // no es el acero real: en el .e2k el material de refuerzo declara
    // FY 42000 tonf/m² = 4200 kg/cm² exactos, que es lo que usa ETABS (visto
    // en su Column Element Details: fy = 42 kgf/mm²). Tomar el default dejaba
    // la capacidad 2% alta y el ratio PMM 2% bajo contra ETABS.
    const secForBar = frame?.frameSection || frame?.sectionProperties || frame?.section || null;
    const fyLongBar = this._rcResolveMaterialFyByName?.(secForBar?.longBarMaterialName);
    if (fyLongBar > 0) fy = fyLongBar;

    // Ec (kg/cm²) — lo pide la esbeltez para Pc = π²EI/(kLu)² (ver
    // design/column_slenderness.py). Se toma el del material si está
    // definido; si no, la fórmula de E.060 Art. 8.5.1: Ec = 15000·√f'c
    // (f'c en kg/cm²). El catálogo guarda E en MPa igual que fc/fy.
    const ecRaw = Number(matObj?.modulusElasticity ?? matObj?.E ?? 0);
    const ecKgCm2 = ecRaw > 0
      ? (ecRaw > 100000 ? ecRaw : ecRaw * MPA_TO_KGCM2)
      : 15000 * Math.sqrt(fc);

    return { fc: Math.round(fc), fy: Math.round(fy), ec: Math.round(ecKgCm2) };
  },

  /**
   * fc/fy en kg/cm² para una ÁREA (losa) — espejo de _rcResolveFrameMaterial
   * pero leyendo `area.section.material` (nombre de material, tal como lo
   * guarda el modal de Slab Sections), no `frame.frameSection.material`.
   * Usado por el diseño de losa aligerada (rcAligeradoDesign.js).
   */
  _rcResolveAreaMaterial(area) {
    const name = area?.section?.material || null;
    const source = this.materialProperties?.materials;
    let matObj = null;

    if (name && source) {
      const list = Array.isArray(source) ? source : Object.values(source);
      matObj = list.find((m) => String(m?.name || m?.id || "").trim() === String(name).trim()) || null;
    }

    const fcRaw = Number(matObj?.fc ?? matObj?.fpc ?? 21);
    const fyRaw = Number(matObj?.fy ?? 420);

    const fc = fcRaw > 100 ? fcRaw : fcRaw * MPA_TO_KGCM2;
    const fy = fyRaw > 1000 ? fyRaw : fyRaw * MPA_TO_KGCM2;

    return { fc: Math.round(fc), fy: Math.round(fy) };
  },

  /**
   * fy (kg/cm²) del material de un catálogo por NOMBRE explícito (ej. el
   * acero de estribo/confinamiento, que puede ser distinto del longitudinal
   * — `CONFINEBARMATERIAL` del .e2k). `null` si no se encuentra.
   */
  _rcResolveMaterialFyByName(name) {
    const source = this.materialProperties?.materials;
    if (!name || !source) return null;

    const list = Array.isArray(source) ? source : Object.values(source);
    const mat = list.find((m) => String(m?.name || m?.id || "").trim() === String(name).trim());
    if (!mat) return null;

    const fyRaw = Number(mat?.fy);
    if (!(fyRaw > 0)) return null;

    return Math.round(fyRaw > 1000 ? fyRaw : fyRaw * MPA_TO_KGCM2);
  },

  /**
   * Valor CRUDO (kN o kN-m, sin convertir) de un componente en la estación
   * más cercana a `relativeStation` (0..1) dentro de un record de
   * frameForceResults. Cada caller convierte a la unidad que necesite
   * (vigas → tonf vía _rcStationValue; columnas → N/N·m para el motor de
   * interacción, que trabaja en SI).
   */
  _rcFrameForceStationRaw(record, relativeStation, component) {
    const stations = Array.isArray(record?.stations) ? record.stations : [];
    if (!stations.length) return 0;

    let best = stations[0];
    let bestDist = Math.abs(Number(best.relativeStation ?? 0) - relativeStation);

    for (const st of stations) {
      const d = Math.abs(Number(st.relativeStation ?? 0) - relativeStation);
      if (d < bestDist) {
        best = st;
        bestDist = d;
      }
    }

    return Number(best[component] ?? 0);
  },
};
