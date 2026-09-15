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
const ZAPATA_SHELL_POLIGONO_COMBINADA_DESIGN_API_URL = "/api/backend/zapata/shell-poligono-combinada-design";

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
      // AGREGADO (ver conversación, "8 componentes en combinadas"
      // 2026-08-31): campo completo (x/y/Mx/My/Mxy/V13/V23/MMax/MMin/VMax
      // en toda la malla) para el Diagrama de Resultantes -- mismo campo
      // que ya devuelve fetchZapataShellDesignReference() para aisladas.
      campo: data.campo,
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
 * `columnas` debe traer 'y' en el MISMO sistema local que `poligono`
 * (coordenada perpendicular CRUDA, sin restar ninguna línea central) --
 * ver computeTrapezoidalFootingGeometry (footingMoments.js), que arma ese
 * sistema local (localPoints) a partir de la geometría real del polígono
 * antes de llamar a esta función (ver foundation.js).
 *
 * `poligono` (AGREGADO, ver conversación "zapata trapezoidal ancho casi
 * constante" 2026-09-05): [{x,y},...] en ese mismo sistema local -- si se
 * envía, el backend MUESTREA el ancho real ahí en vez de asumir B0+B'x
 * (necesario para footings cuyo ancho no varía linealmente en toda la
 * longitud, ver documentación del proyecto). B0/B1 igual se envían
 * (quedan ignorados por el backend en ese caso, pero no está de más
 * conservarlos por si se necesitan para otro uso/depuración).
 */
export async function fetchZapataShellTrapezoidalDesignReference({
  L,
  B0,
  B1,
  columnas, // [{x, y, bx, by}, ...] -- x relativo al origen del eje de la viga, y en el sistema local del polígono
  poligono,
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
        poligono: poligono || undefined,
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
      // AGREGADO (ver conversación, "8 componentes"/"orientación
      // trapezoidal" 2026-08-31, cortante agregado 2026-09-06): campo
      // completo M11/M22/M12/MMax/MMin/V13/V23/VMax -- se reenvía tal
      // cual, foundation.js arma momentField desde acá.
      campo: data.campo,
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
      // AGREGADO (ver conversación, "8 componentes" 2026-08-31): campo
      // M11/M22/M12/MMax/MMin/V13/V23/VMax completo -- a diferencia de
      // la trapezoidal, esta forma SÍ tiene cortante (misma malla
      // rectangular uniforme que la combinada recta, sin transformación
      // de coordenadas) -- pero nunca se comparó contra un caso real de
      // ETABS, solo contra un caso de control interno (ver documentación).
      campo: data.campo,
      advertencia: data.advertencia,
    };
  } catch (e) {
    return { ok: false, error: e?.message || String(e) };
  }
}

/**
 * Momento (M11/M22) de referencia para una LOSA DE CIMENTACIÓN (zapata
 * combinada con columnas en CUALQUIER posición 2D, contorno poligonal
 * arbitrario, no solo un rincón en L) -- ver python-backend/
 * zapata_shell_solver.py:calcular_zapata_shell_poligono_combinada
 * (FASE 1). Se dispara cuando `computeLFootingGeometry` NO reconoce la
 * forma como un rincón L simple (`splitFootingIntoLegs` encontró más de
 * 1 tramo, pero la forma no es la L de 1 solo rincón faltante que sabe
 * resolver `fetchZapataShellLDesignReference`) -- ver foundation.js.
 *
 * A diferencia de combinada/L (Lx/Ly + columnas relativas a un bounding
 * box), `puntos` y `columnas` van en coordenadas GLOBALES tal cual están
 * en el modelo -- el backend hace su propia localización interna y
 * devuelve `minX`/`minY` para que el llamador pueda volver a globalizar
 * el campo (mismo propósito que `originX`/`originY` en la L, pero
 * calculado en el backend porque un polígono arbitrario no tiene un
 * "origen de bounding box" evidente del lado del llamador).
 *
 * Carga no uniforme -- 2 fuentes opcionales, en orden de prioridad (ver
 * conversación "investiga" 2026-09-05, tras confirmar en el navegador
 * real que la presión rígida automática sola no basta):
 *   1. `qZonas` (la más precisa): [{puntos, q}, ...] -- UNA zona por cada
 *      pieza REAL del grupo, con la carga de área REALMENTE asignada a
 *      esa pieza (`area.areaLoads`, ya poblado por el import del .e2k --
 *      `AREALOAD ... LC "csuelo" ...` -- no hace falta pedirle nada nuevo
 *      al usuario). Ver `sumarAreaLoadsKgfM2ATonfM2` en foundation.js.
 *   2. `qNube` (respaldo): nube de presión {x, y, q} -- envolvente
 *      puntual de la presión ya calculada por el método rígido
 *      (/zapatas2), para las piezas sin carga de área asignada.
 * Con SOLO `qNube` (sin `qZonas`) el error contra ETABS bajó de 33-53% a
 * <8% usando los valores REALES extraídos a mano del .e2k para validar
 * -- pero en el navegador real, sin esa extracción manual, la presión
 * rígida automática (casi uniforme, la excentricidad real es chica) dio
 * de vuelta 15-25% de error. La carga real del cliente varía harto por
 * zona (4.33 a 6.52 Tn/m²) porque el método rígido no captura esa
 * variación en un mat grande e irregular -- por eso ahora se prioriza
 * `qZonas` (la carga que el cliente YA asignó a cada pieza), no la nube
 * derivada. Si no se pasa ninguna, usa `q` parejo en toda la zapata
 * (mismo comportamiento que las demás formas).
 */
export async function fetchZapataShellPoligonoCombinadaDesignReference({
  puntos, // [{x, y}, ...] -- vértices GLOBALES del contorno real
  columnas, // [{x, y, bx, by}, ...] -- GLOBALES
  thicknessM,
  recubrimientoM,
  fpcMPa,
  nu,
  nx,
  ny,
  q,
  qNube, // {x:[...], y:[...], q:[...]} -- nube de presión real (respaldo), opcional
  qZonas, // [{puntos:[...], q:...}, ...] -- carga REAL por pieza (prioridad), opcional
  // AGREGADO (ver conversación, "zapatas recortadas", Etapa 2/3): huecos
  // opcionales -- [{points|nodes:[{x,y},...]}, ...] o directamente
  // [[{x,y},...], ...], en las MISMAS coordenadas GLOBALES que `puntos`.
  // Ver calcular_zapata_shell_poligono_combinada (backend): un elemento de
  // malla se descarta si su centro cae dentro de cualquier hueco.
  huecos,
}) {
  try {
    const resp = await fetch(ZAPATA_SHELL_POLIGONO_COMBINADA_DESIGN_API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        puntos,
        columnas,
        h: thicknessM || undefined,
        recubrimiento: recubrimientoM || undefined,
        fpcMPa: fpcMPa || undefined,
        nu: nu || undefined,
        nx: nx || undefined,
        ny: ny || undefined,
        q,
        qNube: qNube || undefined,
        qZonas: qZonas || undefined,
        huecos: huecos?.length
          ? huecos.map((hueco) => (Array.isArray(hueco) ? hueco : hueco.points || hueco.nodes || []))
          : undefined,
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
      minX: data.minX,
      minY: data.minY,
      // Campo M11/M22/M12/MMax/MMin/V13/V23/VMax completo (coordenadas
      // LOCALES respecto a minX/minY -- ver arriba) para el Diagrama de
      // Resultantes.
      campo: data.campo,
      advertencia: data.advertencia,
      // AGREGADO (ver conversación, "implementar solo con hueco"
      // 2026-09-10): "conforme" cuando el solver usó malla conforme al
      // hueco (triangulación restringida, puntos DISPERSOS sin paso de
      // grilla) en vez de la grilla estructurada -- foundation.js lo
      // pasa a momentField.meshType para que el índice de hover
      // (buildGridIndex) no asuma un paso de grilla que ahí no existe.
      metodo: data.metodo,
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
      // AGREGADO (ver conversación, "8 componentes" 2026-08-31): campo
      // M11/M22/M12/MMax/MMin para el Diagrama de Resultantes -- sin V13/
      // V23/VMax a propósito (probados contra datos reales de F16, no
      // dieron un resultado confiable en esta malla triangular).
      campo: data.campo,
      advertencia: data.advertencia,
    };
  } catch (e) {
    return { ok: false, error: e?.message || String(e) };
  }
}
