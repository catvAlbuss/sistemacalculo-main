// resources/js/cad/engine/zapataShellDesign.js
//
// Puente al endpoint /api/backend/zapata/shell-design (ver
// python-backend/zapata_shell_solver.py:calcular_zapata_shell_completo):
// momento (M11/M22/M12) Y cortante (V13/V23) de referencia, vía elementos
// finitos reales, en UNA sola llamada — mismo flujo que usa el cliente en
// ETABS para validar (ver conversación).
//
// AGREGADO (ver conversación): antes eran 2 archivos/2 llamadas separadas
// (zapataShellMoment.js a malla 20x20, zapataShellShear.js a malla 50x50)
// — se fusionaron porque el cortante ya necesitaba la malla fina y una
// malla fina nunca perjudica al momento. Con el dev server de Windows
// corriendo single-threaded, esto corta a la mitad la cola de peticiones
// por zapata aislada (ver mixins/analysis/foundation.js).
//
// SOLO aplica a zapatas AISLADAS RECTANGULARES alineadas a los ejes X/Y: el
// solver arma una malla rectangular en el sistema de coordenadas global, así
// que un polígono rotado, triangular o trapezoidal daría una malla
// incorrecta si se le pasara igual.
//
// Es un VALOR DE REFERENCIA adicional junto al Mu/cortante del método
// rígido (footingMoments.js/footingShear.js) — Bloque 6 (cortante) lo
// prefiere cuando está disponible; Bloque 5 (acero) sigue usando el
// método rígido. fetchZapataShellDesignReference() nunca lanza: si el
// backend falla o no está disponible, devuelve { ok:false, error } y el
// resto del flujo de "Calcular Zapatas" sigue sin verse afectado.

const ZAPATA_SHELL_DESIGN_API_URL = "/api/backend/zapata/shell-design";
const ZAPATA_SHELL_COMBINED_DESIGN_API_URL = "/api/backend/zapata/shell-combined-design";

/**
 * @param {object[]} points - vértices del polígono de la zapata
 * @param {{minX:number,maxX:number,minY:number,maxY:number}} bounds
 * @param {number} polygonArea - área real del polígono (shoelace, `properties.A`)
 */
export function isAxisAlignedRectangularFooting(points, bounds, polygonArea) {
  if (!points || points.length !== 4 || !bounds) return false;

  const bboxLx = bounds.maxX - bounds.minX;
  const bboxLy = bounds.maxY - bounds.minY;
  const bboxArea = bboxLx * bboxLy;
  const area = Number(polygonArea) || 0;

  if (bboxArea <= 0 || area <= 0) return false;

  // Si el polígono no está alineado a los ejes (rotado) o no es realmente
  // rectangular, el área real se aleja de la del bounding box.
  return Math.abs(bboxArea - area) / bboxArea < 0.01;
}

export async function fetchZapataShellDesignReference({
  Lx,
  Ly,
  columnaX,
  columnaY,
  columnaBx,
  columnaBy,
  thicknessM,
  recubrimientoM,
  fpcMPa,
  nu,
  nx,
  ny,
  q,
}) {
  try {
    const resp = await fetch(ZAPATA_SHELL_DESIGN_API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        Lx,
        Ly,
        columna_x: columnaX,
        columna_y: columnaY,
        columna_bx: columnaBx || undefined,
        columna_by: columnaBy || undefined,
        h: thicknessM || undefined,
        recubrimiento: recubrimientoM || undefined,
        fpcMPa: fpcMPa || undefined,
        nu: nu || undefined,
        nx: nx || undefined,
        ny: ny || undefined,
        q,
      }),
    });

    const data = await resp.json().catch(() => null);

    if (!resp.ok || !data || data.success === false) {
      return { ok: false, error: data?.error || `Motor respondió ${resp.status}` };
    }

    return {
      ok: true,
      momentoDiseno: data.momentoDiseno,
      cortanteDiseno: data.cortanteDiseno,
      campo: data.campo,
      advertencia: data.advertencia,
    };
  } catch (e) {
    return { ok: false, error: e?.message || String(e) };
  }
}

/**
 * Momento (M11/M22) de referencia para zapata COMBINADA (viga recta, 2+
 * columnas alineadas) -- ver python-backend/zapata_shell_solver.py:
 * calcular_zapata_shell_combinada. SOLO aplica cuando
 * computeCombinedFootingMoments (footingMoments.js) marca `supported` con
 * UN solo brazo recto (no trapezoidal, no ramificada) -- mismo alcance que
 * ya tiene esa función del lado del método rígido.
 *
 * AGREGADO (ver conversación, caso F12): las caras de columna cerca de un
 * borde libre vienen marcadas 'Mx_cara_*_region_d'/'My_cara_*_region_d' y
 * su momento en null -- ver docstring de calcular_zapata_shell_combinada
 * para el porqué (ninguna formulación de placa es confiable ahí, no es un
 * bug). El llamador debe usar el método rígido para esas caras puntuales.
 *
 * Reutiliza isAxisAlignedRectangularFooting (mismo chequeo bbox-vs-área)
 * para decidir si aplica -- ver foundation.js.
 */
export async function fetchZapataShellCombinedDesignReference({
  Lx,
  Ly,
  columnas, // [{x, y, bx, by}, ...] -- posición relativa a bounds.minX/minY
  thicknessM,
  recubrimientoM,
  fpcMPa,
  nu,
  nx,
  ny,
  q,
}) {
  try {
    const resp = await fetch(ZAPATA_SHELL_COMBINED_DESIGN_API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        Lx,
        Ly,
        columnas,
        h: thicknessM || undefined,
        recubrimiento: recubrimientoM || undefined,
        fpcMPa: fpcMPa || undefined,
        nu: nu || undefined,
        nx: nx || undefined,
        ny: ny || undefined,
        q,
      }),
    });

    const data = await resp.json().catch(() => null);

    if (!resp.ok || !data || data.success === false) {
      return { ok: false, error: data?.error || `Motor respondió ${resp.status}` };
    }

    return {
      ok: true,
      momentosPorColumna: data.momentosPorColumna,
      mxHogging: data.mxHogging,
      myHogging: data.myHogging,
      d: data.d,
      advertencia: data.advertencia,
    };
  } catch (e) {
    return { ok: false, error: e?.message || String(e) };
  }
}
