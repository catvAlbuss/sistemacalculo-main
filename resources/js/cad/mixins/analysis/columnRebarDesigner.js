// resources/js/cad/mixins/analysis/columnRebarDesigner.js
//
// Armado de columna definido A MANO, por NOMBRE DE SECCIÓN (property), igual
// que el Section Designer de ETABS: se define UNA VEZ para la sección
// (ej. "C30X50") y aplica a toda columna que use esa propiedad — no por
// columna individual. Versión simplificada del flujo de ETABS (Propiedad
// nueva > Special > Section Designer > dibujar rectángulo > clic derecho >
// Reinforcing Shape/Rebar Data): acá es un solo formulario (recubrimiento,
// patrón, diámetro de varilla, estribo) con vista previa en vivo.
//
// Por qué hace falta: el diseño de columnas (rcColumnDesign.js) solo
// funciona con armado REAL parseado del .e2k (CONCRETESECTION con
// LONGBARAREA>0). Una sección en modo "Reinforcement to be Designed" en
// ETABS (auto-diseño, DESIGNCHECK "DESIGN") exporta LONGBARAREA=0 — no
// porque falte parsear algo, sino porque ETABS mismo no tiene un armado fijo
// ahí. Esto le da al usuario una forma de definirlo.
//
// Accesible desde DOS lugares (mismo dato, misma clave por sectionName):
//   - Definir > Secciones de Barra... > seleccionar sección > "Definir
//     Armado de Columna..." (frame-sections-modal.blade.php) — como ETABS.
//   - Diseñar > Diseñar Columna(s)... > columna "no soportada" > "Definir
//     armado..." (columna-design-modal.blade.php) — atajo donde se detecta
//     el problema, sin tener que ir a buscarlo a Definir.

const CM_TO_M = 0.01;
const MM_TO_M = 0.001;
const MM2_TO_M2 = 1e-6;

export const columnRebarDesignerMixin = {
  /**
   * Abre el diseñador para UNA sección (por nombre, ej. "C30X50"). `hint`
   * trae b/h en cm (de la sección real) para prellenar dimensiones
   * informativas la primera vez (no editables — son geometría de la
   * sección, no del armado).
   */
  openColumnRebarDesigner(sectionName, hint = {}) {
    if (!sectionName) return;

    const existing = this.manualColumnRebar?.[sectionName] || null;
    const bars = (this.reinforcementBarSizes || []).filter((b) => b.enabled !== false);

    // Precarga, en orden de prioridad:
    //   1. Un armado manual YA guardado para esta seccion.
    //   2. El armado que trae la seccion IMPORTADA del .e2k — aunque ETABS
    //      la haya dejado en DESIGNCHECK "DESIGN" (auto-diseno) igual escribe
    //      PATTERN/LONGBARAREA/etc. como semilla, y es lo que el motor de
    //      interaccion YA esta usando. Antes se ignoraba y el modal abria con
    //      valores genericos (#4, R-3-3) que NO eran los que se calculaban:
    //      confundia al comparar contra el dialogo de ETABS.
    //   3. Defaults genericos, solo si no hay nada.
    const draft = existing
      ? { ...existing }
      : (this._rcDraftFromImportedSection(sectionName, hint, bars) || {
          b: Number(hint.b) || 30,
          h: Number(hint.h) || 30,
          cover: 4,
          n2: 3,
          n3: 3,
          longBarName: bars.find((b) => b.name === "#4")?.name || bars[0]?.name || "#4",
          confineBarName: bars.find((b) => b.name === "#3")?.name || bars[0]?.name || "#3",
          confineSpacing: 15,
          numConfineBars2: 2,
          numConfineBars3: 2,
          // "" = usa el mismo fy que la varilla longitudinal (el material de
          // la columna, ver _rcResolveFrameMaterial) — igual default que
          // ETABS trae precargado. Solo se pisa si el usuario elige otro.
          confineBarMaterialName: "",
        });

    const materials = (this.materialProperties?.materials || []).filter((m) => Number(m?.fy) > 0);

    this.columnRebarDesignerState = { sectionName, draft, barSizes: bars };

    window.dispatchEvent(
      new CustomEvent("open-column-rebar-designer-modal", {
        detail: { sectionName, draft, barSizes: bars, materials, label: hint.label || sectionName },
      }),
    );
  },

  /**
   * Núcleo geométrico puro (cm, origen en el centroide, diámetros YA en cm
   * — no nombres de catálogo): mismo cálculo que `generate_rect_bar_positions`
   * en python-backend/design/column_interaction.py, portado a JS SOLO para
   * dibujar (el cálculo real de diseño sigue viviendo en el backend).
   * Compartido entre `columnRebarPreviewPoints` (diseñador manual, trabaja
   * con nombres de barra) y frame-sections-modal.blade.php (preview del
   * catálogo, que además necesita mostrar armado REAL importado del .e2k,
   * cuyo diámetro no siempre calza con un nombre exacto del catálogo).
   */
  _columnRebarBarPositions({ b, h, cover, n2, n3, longBarDiameterCm = 0, confineBarDiameterCm = 0 }) {
    const bN = Number(b) || 0;
    const hN = Number(h) || 0;
    // cover = recubrimiento LIBRE hasta la superficie del estribo ("Clear
    // Cover for Confinement Bars" en ETABS) — se resta el diámetro del
    // estribo aparte para llegar al centro de la varilla longitudinal,
    // igual que el motor Python (ver column_interaction.py).
    const coverN = Number(cover) || 0;
    const n2N = Number(n2) || 0;
    const n3N = Number(n3) || 0;
    const r = (Number(longBarDiameterCm) || 0) / 2;
    const confineN = Number(confineBarDiameterCm) || 0;

    const xc = bN / 2 - coverN - confineN - r;
    const yc = hN / 2 - coverN - confineN - r;
    if (!(xc > 0) || !(yc > 0) || n3N < 2 || n2N < 2) return [];

    const points = [];
    [xc, -xc].forEach((x) => {
      for (let i = 0; i < n3N; i += 1) {
        const y = n3N > 1 ? -yc + (2 * yc * i) / (n3N - 1) : 0;
        points.push({ x, y });
      }
    });
    [yc, -yc].forEach((y) => {
      for (let i = 1; i < n2N - 1; i += 1) {
        const x = -xc + (2 * xc * i) / (n2N - 1);
        points.push({ x, y });
      }
    });
    return points;
  },

  /**
   * Arma un draft a partir del armado que YA trae la seccion importada del
   * .e2k (this.frameSections.sections), para que el modal abra mostrando lo
   * mismo que el motor esta calculando. null si no hay armado utilizable.
   *
   * Unidades: el .e2k guarda areas en m2 y el importador ya pasa el
   * espaciamiento a cm (ver e2k-import.js). El catalogo de varillas trabaja
   * en mm/mm2, asi que se elige la varilla del catalogo con el AREA mas
   * cercana a la importada — el area es lo que manda en la capacidad; el
   * diametro solo ubica la varilla dentro de la seccion.
   */
  _rcDraftFromImportedSection(sectionName, hint, bars) {
    const secs = this.frameSections?.sections;
    if (!secs || !bars.length) return null;

    const list = Array.isArray(secs) ? secs : Object.values(secs);
    const sec = list.find((s) => String(s?.name || "").trim() === String(sectionName).trim());
    if (!sec) return null;

    const pat = sec.rebarPattern;
    if (!pat || pat.type !== "rectangular" || !(pat.n2 >= 2) || !(pat.n3 >= 2)) return null;
    if (!(Number(sec.longBarArea) > 0)) return null;

    const porArea = (areaM2, fallbackName) => {
      const areaMm2 = Number(areaM2) * 1e6;
      if (!(areaMm2 > 0)) return fallbackName;
      let mejor = bars[0];
      let dist = Infinity;
      bars.forEach((b) => {
        const d = Math.abs((Number(b.areaMm2) || 0) - areaMm2);
        if (d < dist) { dist = d; mejor = b; }
      });
      return mejor?.name || fallbackName;
    };

    return {
      b: Number(hint.b) || Number(sec.b) || 30,
      h: Number(hint.h) || Number(sec.h) || 30,
      cover: Number(sec.cover) || 4,
      n2: Number(pat.n2),
      n3: Number(pat.n3),
      longBarName: porArea(sec.longBarArea, bars[0]?.name),
      confineBarName: porArea(sec.confineBarArea, bars[0]?.name),
      confineSpacing: Number(sec.confineBarSpacing) || 15,
      numConfineBars2: Number(sec.numConfineBars2) || 2,
      numConfineBars3: Number(sec.numConfineBars3) || 2,
      confineBarMaterialName: "",
    };
  },

  /**
   * Posiciones de varilla longitudinal (cm, origen en el centroide) para la
   * vista previa del DISEÑADOR MANUAL — resuelve diámetros por NOMBRE de
   * catálogo (`reinforcementBarSizes`) y delega en `_columnRebarBarPositions`.
   */
  columnRebarPreviewPoints(draft) {
    const bars = this.reinforcementBarSizes || [];
    const longBar = bars.find((b) => b.name === draft?.longBarName);
    const confineBar = bars.find((b) => b.name === draft?.confineBarName);
    return this._columnRebarBarPositions({
      b: draft?.b,
      h: draft?.h,
      cover: draft?.cover,
      n2: draft?.n2,
      n3: draft?.n3,
      longBarDiameterCm: ((longBar?.diameterMm || 0) * MM_TO_M) / CM_TO_M, // mm -> cm
      confineBarDiameterCm: ((confineBar?.diameterMm || 0) * MM_TO_M) / CM_TO_M, // mm -> cm
    });
  },

  /**
   * Guarda el armado manual de una SECCIÓN y avisa (para que el modal de
   * diseño, si está abierto, se pueda refrescar). Validación mínima: patrón
   * geométricamente posible (mismo chequeo que columnRebarPreviewPoints).
   */
  saveColumnRebarDesign(sectionName, draft) {
    if (!sectionName) return false;

    const points = this.columnRebarPreviewPoints(draft);
    if (!points.length) {
      this.showMessage?.(
        "El recubrimiento/diámetro no deja espacio para el patrón de varillas indicado — revisa las medidas.",
        "warning",
      );
      return false;
    }

    if (!this.manualColumnRebar) this.manualColumnRebar = {};
    this.manualColumnRebar[sectionName] = { ...draft };

    this.showMessage?.("✅ Armado de columna guardado — aplica a toda columna con esta sección.", "success");

    window.dispatchEvent(
      new CustomEvent("column-rebar-design-saved", { detail: { sectionName } }),
    );

    return true;
  },

  /**
   * Convierte un draft del diseñador (cm/mm, catálogo de barras) al mismo
   * shape que rcColumnDesign.js espera de `frame.frameSection` cuando viene
   * del .e2k (m²/m para el motor, cm para cover/spacing) — ver
   * _rcResolveManualRebar en rcColumnDesign.js.
   */
  _columnRebarDraftToSection(draft) {
    const bars = this.reinforcementBarSizes || [];
    const longBar = bars.find((b) => b.name === draft?.longBarName);
    const confineBar = bars.find((b) => b.name === draft?.confineBarName);
    if (!longBar || !confineBar) return null;

    return {
      cover: Number(draft.cover) || 0, // cm
      rebarPattern: { type: "rectangular", n2: Number(draft.n2) || 0, n3: Number(draft.n3) || 0 },
      longBarDiameter: longBar.diameterMm * MM_TO_M, // m
      longBarArea: longBar.areaMm2 * MM2_TO_M2, // m²
      confineBarDiameter: confineBar.diameterMm * MM_TO_M, // m
      confineBarArea: confineBar.areaMm2 * MM2_TO_M2, // m²
      confineBarSpacing: Number(draft.confineSpacing) || 0, // cm
      numConfineBars2: Number(draft.numConfineBars2) || 0,
      numConfineBars3: Number(draft.numConfineBars3) || 0,
      // "" u otro valor falsy -> usa fy longitudinal (ver _rcResolveMaterialFyByName en rcSectionMaterial.js)
      confineBarMaterialName: draft.confineBarMaterialName || null,
    };
  },
};
