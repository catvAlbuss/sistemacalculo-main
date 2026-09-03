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
const ZAPATA_SHELL_TRAPEZOIDAL_DESIGN_API_URL = "/api/backend/zapata/shell-trapezoidal-design";
const ZAPATA_SHELL_L_DESIGN_API_URL = "/api/backend/zapata/shell-l-design";
const ZAPATA_SHELL_POLIGONO_DESIGN_API_URL = "/api/backend/zapata/shell-poligono-design";

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

/**
 * Momento (Mx/My, incluido BPR) de referencia para zapata COMBINADA
 * TRAPEZOIDAL (2+ columnas, ancho variable linealmente entre B0 y B1) --
 * ver python-backend/zapata_shell_solver.py:
 * calcular_zapata_shell_trapezoidal_combinada. Extensión EXPERIMENTAL del
 * mismo método ya validado para rectangulares combinadas (ver
 * documentación del proyecto) -- mismo criterio de región D/vanos
 * cortos/BPR, sin validar todavía contra un caso real de ETABS.
 *
 * `columnas` debe traer 'y' como OFFSET respecto al EJE CENTRAL de la
 * viga (no absoluto) -- ver computeTrapezoidalFootingGeometry
 * (footingMoments.js), que calcula ese offset a partir de la geometría
 * real del polígono antes de llamar a esta función (ver foundation.js).
 */
export async function fetchZapataShellTrapezoidalDesignReference({
  L,
  B0,
  B1,
  columnas, // [{x, y, bx, by}, ...] -- x relativo al origen del eje de la viga, y offset respecto al eje central
  thicknessM,
  recubrimientoM,
  fpcMPa,
  nu,
  nx,
  ny,
  q,
}) {
  try {
    const resp = await fetch(ZAPATA_SHELL_TRAPEZOIDAL_DESIGN_API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        L,
        B0,
        B1,
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
      d: data.d,
      advertencia: data.advertencia,
    };
  } catch (e) {
    return { ok: false, error: e?.message || String(e) };
  }
}

/**
 * Momento (Mx/My) de referencia para zapata combinada EN L -- ver
 * python-backend/zapata_shell_solver.py:calcular_zapata_shell_L_combinada.
 * A diferencia de rectangular/trapezoidal, esto se dispara incluso cuando
 * el método rígido marca la zapata como `supported:false` (razón
 * "branching") -- ver computeLFootingGeometry (footingMoments.js): el FEM
 * puede resolver el bounding box completo con un hueco en el rincón
 * faltante, aunque el método rígido no pueda separarla en brazos
 * independientes de forma confiable. Extensión EXPERIMENTAL, versión BASE
 * sin región D/vanos cortos/BPR todavía -- sin validar contra un caso real
 * de ETABS.
 *
 * `columnas` debe traer x/y ABSOLUTOS dentro del bounding box completo
 * (relativos a geo.originX/originY, no a un brazo individual).
 */
export async function fetchZapataShellLDesignReference({
  Lx,
  Ly,
  notchX,
  notchY,
  notchEsMaxX,
  notchEsMaxY,
  columnas, // [{x, y, bx, by}, ...] -- relativos al origen del bounding box completo
  thicknessM,
  recubrimientoM,
  fpcMPa,
  nu,
  nx,
  ny,
  q,
}) {
  try {
    const resp = await fetch(ZAPATA_SHELL_L_DESIGN_API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        Lx,
        Ly,
        notchX,
        notchY,
        notchEsMaxX,
        notchEsMaxY,
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
      d: data.d,
      advertencia: data.advertencia,
    };
  } catch (e) {
    return { ok: false, error: e?.message || String(e) };
  }
}

/**
 * Momento (Mx/My) de referencia para zapata AISLADA de forma NO
 * rectangular (triangular, trapezoidal, cualquier polígono simple
 * convexo) -- ver python-backend/zapata_shell_solver.py:
 * calcular_zapata_shell_poligono_aislado. Reemplaza al método rígido
 * (computeIsolatedFootingMoment, footingMoments.js) para estas formas --
 * confirmado con datos reales que ese método (2 voladizos independientes
 * de ancho constante) da 49-519% de error cuando el ancho de la zapata
 * varía a lo largo del voladizo (triángulo/trapecio). El FEM (ShellDKGT,
 * malla en abanico) validó 1-16% contra los mismos casos reales.
 *
 * `puntos` = vértices del polígono en orden (se triangula en abanico
 * desde el primero -- válido para formas convexas, que es el caso de
 * triángulos y trapecios reales). `columnaX/Y` son ABSOLUTOS (mismo
 * sistema de coordenadas que `puntos`, no relativos a un bounding box).
 * NO calcula cortante -- Bloque 6 sigue con el método rígido para estas
 * formas (misma decisión ya tomada para la L combinada).
 */
export async function fetchZapataShellPoligonoDesignReference({
  puntos,
  columnaX,
  columnaY,
  columnaBx,
  columnaBy,
  thicknessM,
  recubrimientoM,
  fpcMPa,
  nu,
  n,
  q,
}) {
  try {
    const resp = await fetch(ZAPATA_SHELL_POLIGONO_DESIGN_API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        puntos,
        columnaX,
        columnaY,
        columnaBx: columnaBx || undefined,
        columnaBy: columnaBy || undefined,
        h: thicknessM || undefined,
        recubrimiento: recubrimientoM || undefined,
        fpcMPa: fpcMPa || undefined,
        nu: nu || undefined,
        n: n || undefined,
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
      d: data.d,
      advertencia: data.advertencia,
    };
  } catch (e) {
    return { ok: false, error: e?.message || String(e) };
  }
}
