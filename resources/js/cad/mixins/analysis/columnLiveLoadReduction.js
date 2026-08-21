// resources/js/cad/mixins/analysis/columnLiveLoadReduction.js
//
// REDUCCIÓN DE SOBRECARGA (live load reduction) para el diseño de columnas.
// Es el "LLRF" que ETABS reporta en su Column Element Details.
//
// POR QUÉ EXISTE: las normas permiten reducir la carga viva de diseño en
// elementos que soportan áreas grandes, porque es improbable que la sobrecarga
// máxima actúe simultáneamente en toda esa superficie. ETABS lo aplica y
// nosotros no lo hacíamos, así que nuestro P de carga viva salía más alto —
// medido en el modelo de referencia: LLRF 0.961 en Story1, 1.0 en Story2.
//
// NO viene en el .e2k (ETABS lo calcula internamente y no lo exporta), así que
// hay que calcularlo desde la geometría.
//
//   E.020 Art. 10 (Perú):  Lr/Lo = 0.25 + 4.6/√Ai,  si Ai ≥ 40 m²
//   ASCE 7-16 §4.7.2:      L/Lo  = 0.25 + 4.57/√(KLL·AT),  si KLL·AT ≥ 37.16 m²
//
// Son la misma fórmula con constantes y umbrales apenas distintos; se elige por
// el código de diseño activo (E.060 → E.020, ACI 318 → ASCE 7).
//
// Ai = área tributaria × factor de elemento. Para COLUMNAS ese factor vale 4
// (ASCE 7 Tabla 4.7-1: tanto interiores como exteriores sin losa en voladizo;
// solo baja a 3 o 2 con voladizos, caso que no detectamos y que además es el
// lado conservador porque da MENOS reducción).

/** Factor de elemento KLL para columnas (ASCE 7 Tabla 4.7-1 / E.020 Art. 10.2). */
const K_LL_COLUMNA = 4;

const REGLAS = {
  // norma: [constante, umbral de Ai en m², piso 1 piso, piso varios pisos]
  E060: { c: 4.6, umbral: 40.0, pisoUno: 0.5, pisoVarios: 0.25, ref: "E.020 Art. 10" },
  ACI318: { c: 4.57, umbral: 37.16, pisoUno: 0.5, pisoVarios: 0.4, ref: "ASCE 7-16 §4.7.2" },
};

export const columnLiveLoadReductionMixin = {
  /**
   * Área tributaria de un nudo (m²) sumando las losas que lo tocan en ESE
   * nivel. Cada losa reparte su área entre sus vértices.
   *
   * Es una aproximación: el reparto exacto dependería de la luz y la dirección
   * de armado. Para una losa rectangular sobre cuatro columnas, área/4 por
   * esquina es el valor clásico y es lo que da el reparto por vértices.
   */
  _llrfAreaEnNivel(x, y, z, tol = 0.05) {
    let total = 0;

    for (const area of this.areas || []) {
      const tipo = String(area?.areaType || area?.type || "").toLowerCase();
      if (tipo === "wall") continue; // un muro no aporta área tributaria de piso
      const pts = Array.isArray(area?.points) ? area.points : [];
      if (pts.length < 3) continue;

      // ¿Alguno de sus vértices es este nudo, en este nivel?
      const toca = pts.some(
        (p) => Math.abs((Number(p.x) || 0) - x) < tol
            && Math.abs((Number(p.y) || 0) - y) < tol
            && Math.abs((Number(p.z) || 0) - z) < tol,
      );
      if (!toca) continue;

      total += this._llrfAreaPoligono(pts) / pts.length;
    }

    return total;
  },

  /** Área en planta de un polígono (m²), por la fórmula del cordón. */
  _llrfAreaPoligono(pts) {
    let s = 0;
    for (let i = 0; i < pts.length; i += 1) {
      const a = pts[i];
      const b = pts[(i + 1) % pts.length];
      s += (Number(a.x) || 0) * (Number(b.y) || 0) - (Number(b.x) || 0) * (Number(a.y) || 0);
    }
    return Math.abs(s) / 2;
  },

  /**
   * Área tributaria ACUMULADA (m²) que carga una columna: la suma de todos los
   * niveles de losa que tiene ENCIMA, incluido el de su propio nudo superior.
   *
   * Una columna del piso 1 en un edificio de 3 pisos carga las tres losas, y
   * por eso su reducción es mayor que la de una del piso 3 — que es justo lo
   * que muestra ETABS (0.961 en Story1, 1.0 en Story2).
   *
   * Devuelve { area, pisos }.
   */
  columnTributaryArea(frame) {
    const idOf = (n) => (n && typeof n === "object" ? n.id : n);
    const nodo = (id) => (this.nodes || []).find((n) => Number(n.id) === Number(id)) || null;
    const coord = (n) => ({
      x: Number(n?.position?.x ?? n?.x) || 0,
      y: Number(n?.position?.y ?? n?.y) || 0,
      z: Number(n?.position?.z ?? n?.z) || 0,
    });

    const n1 = nodo(idOf(frame.node1Id ?? frame.node1));
    const n2 = nodo(idOf(frame.node2Id ?? frame.node2));
    if (!n1 || !n2) return { area: 0, pisos: 0 };

    const c1 = coord(n1);
    const c2 = coord(n2);
    const arriba = c2.z >= c1.z ? c2 : c1;

    // Niveles de losa a la altura del nudo superior o por encima.
    const niveles = new Set();
    for (const a of this.areas || []) {
      const tipo = String(a?.areaType || a?.type || "").toLowerCase();
      if (tipo === "wall") continue;
      const pts = Array.isArray(a?.points) ? a.points : [];
      if (pts.length < 3) continue;
      const z = Number(pts[0]?.z) || 0;
      if (z >= arriba.z - 0.05) niveles.add(Math.round(z * 1000) / 1000);
    }

    let area = 0;
    let pisos = 0;
    for (const z of niveles) {
      const a = this._llrfAreaEnNivel(arriba.x, arriba.y, z);
      if (a > 0) { area += a; pisos += 1; }
    }

    return { area, pisos };
  },

  /**
   * Factor de reducción de sobrecarga de una columna (1.0 = sin reducción).
   * Devuelve el detalle completo para poder auditarlo en el modal, no solo el
   * número — es un dato que el revisor tiene que poder rastrear.
   */
  columnLiveLoadReductionFactor(frame, code = null) {
    const norma = String(code || this.rcDesignCode || "E060").toUpperCase().includes("ACI")
      ? "ACI318"
      : "E060";
    const r = REGLAS[norma];

    const { area, pisos } = this.columnTributaryArea(frame);
    const ai = K_LL_COLUMNA * area;

    const base = {
      factor: 1.0, areaTributaria: area, pisos, kll: K_LL_COLUMNA, ai,
      umbral: r.umbral, referencia: r.ref, aplica: false,
    };

    // Por debajo del umbral la norma no permite reducir.
    if (!(ai >= r.umbral) || pisos < 1) return base;

    const crudo = 0.25 + r.c / Math.sqrt(ai);
    const piso = pisos > 1 ? r.pisoVarios : r.pisoUno;
    const factor = Math.min(1.0, Math.max(piso, crudo));

    return { ...base, factor, crudo, piso, aplica: factor < 1.0 };
  },
};
