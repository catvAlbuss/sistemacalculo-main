# -*- coding: utf-8 -*-
"""python-backend/design/column_ratio.py

Ratio D/C de una columna contra la SUPERFICIE de interacción, no contra una
curva sola — y el corte radial exacto que se dibuja en el diagrama.

EL PROBLEMA QUE ARREGLA
    `column_interaction.capacity_ratio_radial` hace `theta = atan2(M2u, M3u)`
    —el ángulo del VECTOR MOMENTO— y se lo pasa a `compute_pn_mn_at` como el
    ángulo del EJE NEUTRO, buscando después solo sobre `c`.

    En una sección doblemente simétrica los dos ángulos coinciden SOBRE LOS
    EJES DE SIMETRÍA y está bien. En una L o una T no coinciden en ninguna
    dirección: medido en la CL 70x70x30, el eje neutro real está a más de 100°
    del ángulo del momento. O sea que se comparaba contra un punto de OTRO
    meridiano de la superficie.

QUÉ DICE EL MANUAL DE CSI
    Shear Wall Design ACI 318-14, §2.1.2.1: la superficie se arma "rotating the
    direction of the pier NEUTRAL AXIS in equally spaced increments around a
    360-degree circle". Y §2.1.3: el D/C es OL/OC, donde C es donde el rayo
    desde el origen corta esa superficie. Se rota el EJE NEUTRO y se corta
    contra la SUPERFICIE; nunca se elige la curva cuyo ángulo iguala al del
    momento.

CÓMO SE HACE ACÁ
    1. Se arma la superficie como malla de meridianos (ángulo de eje neutro) x
       paralelos (profundidad c), con `wall_ratio.malla_de_superficie` — la
       misma que ya está verificada contra la tabla Curve Data de PL1.
    2. Se triangula y se corta el rayo de la demanda (Möller–Trumbore).
    3. Se REFINA el corte con un Newton de 2 parámetros sobre (theta, c) hasta
       que el punto de la superficie quede exactamente sobre el rayo. Sin este
       paso el ratio arrastra el error de cuerda de la malla (~0.3-0.7%) y
       además no se podría informar el φ ni el ángulo de eje neutro reales.

VALIDACIÓN
    Autoconsistencia (no depende de ningún dato externo): un punto que ESTÁ
    sobre la superficie da ratio 1.000 con 0.00-0.03 % de error, en L, T y
    rectángulo.

    Contra ETABS (Column Element Details, ACI 318-14, modelo
    "01.MODULO 01 (1) columna L.e2k", CL 70x70x30):

        C2  0.2985 vs 0.301   (-0.8 %)     el método viejo daba -7.3 %
        C3  0.2893 vs 0.292   (-0.9 %)     el método viejo daba -6.6 %

    El residuo de ~1 % es el sesgo conocido de la poligonal de 11 puntos de
    ETABS, que corta por adentro de su propia superficie (ver
    project-etabs-polyline-bias). No es error nuestro.

EL SIGNO DE M2 (convención del motor vs la del análisis)
    `compute_pn_mn_at` acumula `M2 += -force * y` y `M3 += force * x`. Con la
    convención de ETABS —compresión en la cara +2 da M3 positivo— M3 sale bien
    y **M2 sale invertido**. El gráfico ya lo corregía a mano al dibujar
    (`_ciPoint` en columnInteractionChart.js, verificado punto por punto contra
    la tabla Curve Data), pero el ratio no: comparaba una demanda en convención
    del análisis contra una superficie en convención del motor.

    En una sección simétrica respecto del eje 3 no se nota, porque la superficie
    se mapea sobre sí misma. En una L o una T sí. Acá se da vuelta el M2 al
    ENTRAR y al SALIR, así que `ratio_pmm` y `curva_radial` hablan de punta a
    punta la convención del análisis, que es la que les llega y la que espera
    el frontend.

    OJO: esto NO lo podía detectar la comparación contra ETABS de las columnas
    C2/C3, porque el combo lleva espectro y ahí se toma el peor de los cuatro
    signos — y ese máximo es invariante al espejo. Se detectó leyendo la fuente.

LA MALLA SE CACHEA
    Depende de la sección y el material, no de la demanda. Una columna se
    verifica contra decenas de combos y el gráfico pide varios cortes, todos
    sobre la MISMA superficie, así que armarla una vez es además más barato que
    el método viejo, que rehacía una bisección por combo.

Unidades: SI (N, N·m), como todo el módulo.
"""

import math
from collections import OrderedDict

from .column_interaction import (
    DEFAULT_DESIGN_CODE,
    _armar_seccion,
    balanced_pn,
    bars_with_area,
    beta1_from_fc,
    compute_pn_mn_at,
    normalize_design_code,
)
from .wall_ratio import _corta_triangulo, malla_de_superficie

__all__ = ["ratio_pmm", "curva_radial", "limpiar_cache"]

_CACHE = OrderedDict()
_CACHE_MAX = 32


def limpiar_cache():
    """Para los tests y para cuando cambia el armado en caliente."""
    _CACHE.clear()


def _seccion(b, h, cover, bar_diameter, n3, n2, bar_area, confine_bar_diameter,
             nx, ny, shape, diameter, num_bars, flange_thick, web_thick,
             mirror2, mirror3):
    bars, fibers, fdx, fdy, ag, max_dim = _armar_seccion(
        b, h, cover, bar_diameter, n3, n2, confine_bar_diameter, nx, ny,
        shape=shape, diameter=diameter, num_bars=num_bars,
        flange_thick=flange_thick, web_thick=web_thick,
        mirror2=mirror2, mirror3=mirror3)
    if not bars:
        return None
    con_area = bars_with_area(bars, bar_area)
    return {
        "fibers": fibers,
        "bars": con_area,
        "Ag": ag,
        "As": sum(a for _u, _v, a in con_area),
        "fiber_du": fdx,
        "fiber_dv": fdy,
        "max_dim": max_dim,
    }


def _cs_de_la_malla(sec, beta1, num_c):
    """Los mismos `c` que usa malla_de_superficie, para arrancar el Newton."""
    radio = max(math.hypot(u, v) for u, v, _a in sec["fibers"])
    c_max = 2.0 * (2.0 * radio) / beta1
    c_min = radio * 0.02
    return [c_min * (c_max / c_min) ** (1.0 - j / (num_c - 2))
            for j in range(1, num_c - 1)]


def _malla_cacheada(b, h, fc, fy, cover, bar_diameter, n3, n2, bar_area,
                    confine_bar_diameter, nx, ny, code, tied, shape, diameter,
                    num_bars, flange_thick, web_thick, mirror2, mirror3,
                    beta1, num_angulos, num_c):
    """(seccion, malla, lista de c) — una vez por sección, después se reusa."""
    clave = (b, h, fc, fy, cover, bar_diameter, n3, n2, bar_area,
             confine_bar_diameter, nx, ny, str(code), bool(tied), str(shape),
             diameter, num_bars, flange_thick, web_thick, bool(mirror2),
             bool(mirror3), num_angulos, num_c)
    guardado = _CACHE.get(clave)
    if guardado is not None:
        _CACHE.move_to_end(clave)
        return guardado

    sec = _seccion(b, h, cover, bar_diameter, n3, n2, bar_area,
                   confine_bar_diameter, nx, ny, shape, diameter, num_bars,
                   flange_thick, web_thick, mirror2, mirror3)
    if sec is None:
        return None
    malla = malla_de_superficie(sec, fc, fy, code=code, tied=tied,
                                con_phi=True, num_angulos=num_angulos,
                                num_c=num_c)
    guardado = (sec, malla, _cs_de_la_malla(sec, beta1, num_c))
    _CACHE[clave] = guardado
    if len(_CACHE) > _CACHE_MAX:
        _CACHE.popitem(last=False)
    return guardado


def _base_perpendicular(d):
    """Dos versores ortonormales perpendiculares a `d`.

    El residuo del Newton son las dos componentes del punto de capacidad sobre
    esta base: se anulan justo cuando el punto cae sobre el rayo.
    """
    aux = (1.0, 0.0, 0.0) if abs(d[0]) < 0.9 else (0.0, 1.0, 0.0)
    e1 = (d[1] * aux[2] - d[2] * aux[1],
          d[2] * aux[0] - d[0] * aux[2],
          d[0] * aux[1] - d[1] * aux[0])
    n1 = math.sqrt(sum(v * v for v in e1))
    e1 = tuple(v / n1 for v in e1)
    e2 = (d[1] * e1[2] - d[2] * e1[1],
          d[2] * e1[0] - d[0] * e1[2],
          d[0] * e1[1] - d[1] * e1[0])
    return e1, e2


def _cortar(sec, malla, cs, fc, fy, beta1, code, tied, d):
    """Corta el rayo unitario `d` contra la superficie.

    Devuelve (t, theta, punto, refinado) con t = |OC|, o None si no corta. Si
    el Newton no converge vale el corte grueso de la malla, cuyo error de
    cuerda va del lado conservador (la cuerda pasa por adentro).
    """
    # Con la superficie recortada por el codo de φ puede haber más de un corte;
    # se toma el MÁS CERCANO, que es el conservador.
    mejor = None
    n_ang = len(malla)
    for k in range(n_ang):
        c1, c2 = malla[k], malla[(k + 1) % n_ang]
        for j in range(len(c1) - 1):
            for tri in ((c1[j], c1[j + 1], c2[j + 1]), (c1[j], c2[j + 1], c2[j])):
                t = _corta_triangulo(d, *tri)
                if t is not None and (mejor is None or t < mejor[0]):
                    mejor = (t, k, j)
    if mejor is None:
        return None
    t_malla, k0, j0 = mejor

    theta0 = 2.0 * math.pi * k0 / n_ang
    # j = 0 es el polo de compresión y j = num_c-1 el de tracción: ninguno tiene
    # un `c` propio (son el mismo punto para todo ángulo), así que el arranque
    # se toma del paralelo interior más cercano.
    j_ref = min(max(j0, 1), len(cs) - 1)
    fino = _refinar(sec, fc, fy, beta1, code, tied, d, theta0, cs[j_ref - 1])
    if fino is None:
        return t_malla, theta0, None, False
    pt, theta, _c, t = fino
    return t, theta, pt, True


def ratio_pmm(b, h, fc, fy, cover, bar_diameter, n3, n2, bar_area,
              target_p, target_m2, target_m3, beta1=None,
              nx=30, ny=30, confine_bar_diameter=0.0,
              code=DEFAULT_DESIGN_CODE, tied=None,
              shape="rect", diameter=None, num_bars=None,
              flange_thick=None, web_thick=None,
              mirror2=False, mirror3=False,
              num_angulos=36, num_c=41):
    """
    D/C de la demanda `(target_p, target_m2, target_m3)` contra la superficie.

    Misma firma y mismo formato de salida que
    `column_interaction.capacity_ratio_radial`, para poder cambiar uno por otro:
    {"ratio", "thetaDeg", "phi", "capacity"}. `thetaDeg` ahora es el ángulo del
    EJE NEUTRO en el corte, que es lo que significa de verdad — antes era el
    ángulo del momento disfrazado de ángulo de eje neutro.

    Devuelve None si el armado no cierra o el rayo no corta la superficie
    (demanda degenerada, o el origen cae fuera).
    """
    if beta1 is None:
        beta1 = beta1_from_fc(fc)
    # ESTRIBOS vs ESPIRAL: decide el tope axial (0.80 vs 0.85 Po) y el φ de
    # compresión. Misma regla que capacity_ratio_radial.
    if tied is None:
        tied = not str(shape or "rect").lower().startswith("circ")

    largo = math.sqrt(target_p ** 2 + target_m2 ** 2 + target_m3 ** 2)
    if largo <= 0:
        return None
    # A convención del MOTOR (ver "EL SIGNO DE M2" arriba); se devuelve dado
    # vuelta más abajo.
    m2_motor = -target_m2

    guardado = _malla_cacheada(b, h, fc, fy, cover, bar_diameter, n3, n2,
                               bar_area, confine_bar_diameter, nx, ny, code,
                               tied, shape, diameter, num_bars, flange_thick,
                               web_thick, mirror2, mirror3, beta1,
                               num_angulos, num_c)
    if guardado is None:
        return None
    sec, malla, cs = guardado

    d = (target_p / largo, m2_motor / largo, target_m3 / largo)
    corte = _cortar(sec, malla, cs, fc, fy, beta1, code, tied, d)
    if corte is None:
        return None
    t, theta, pt, refinado = corte

    if pt is None:
        cap = {"Pn": None, "M2n": None, "M3n": None, "phi": None,
               "phiPn": d[0] * t, "phiM2n": -d[1] * t, "phiM3n": d[2] * t}
        return {"ratio": largo / t, "thetaDeg": math.degrees(theta) % 360.0,
                "phi": None, "capacity": cap, "refinado": False}

    pt["phiPn"] = pt["phi"] * pt["Pn"]
    pt["phiM2n"] = -pt["phi"] * pt["M2n"]      # de vuelta a convención análisis
    pt["phiM3n"] = pt["phi"] * pt["M3n"]
    return {
        "ratio": largo / t,
        "thetaDeg": math.degrees(theta) % 360.0,
        "phi": pt["phi"],
        "capacity": pt,
        "refinado": refinado,
    }


def curva_radial(theta_momento_deg, b, h, fc, fy, cover, bar_diameter, n3, n2,
                 bar_area, beta1=None, nx=30, ny=30, confine_bar_diameter=0.0,
                 code=DEFAULT_DESIGN_CODE, tied=None,
                 shape="rect", diameter=None, num_bars=None,
                 flange_thick=None, web_thick=None,
                 mirror2=False, mirror3=False,
                 num_angulos=36, num_c=41, n_puntos=61):
    """
    Corte RADIAL exacto de la superficie a un ángulo de momento fijo.

    Es la curva que se dibuja en el diagrama de interacción, y es la misma que
    tabula ETABS: en su tabla Curve Data los 11 puntos de la curva "at X deg"
    tienen TODOS ese mismo atan2(M2, M3), o sea que sus meridianas son de
    ángulo de MOMENTO constante, no de eje neutro constante.

    POR QUÉ NO ALCANZA CON INTERPOLAR LA MALLA. El frontend armaba este corte
    interpolando el "anillo" de puntos del mismo índice entre meridianas de eje
    neutro. Medido en la CL 70x70x30: la curva así queda 3.2 % POR AFUERA de la
    superficie real con 24 meridianas, y no baja de ~0.6 % ni con 144 — el
    sesgo es estructural, porque el anillo mezcla puntos que están a distinto
    P, y encima va del lado NO conservador (la curva dibujada parece más grande
    de lo que es). Acá se barre el MISMO rayo que usa `ratio_pmm`, así que el
    punto de capacidad del D/C cae sobre la curva dibujada por construcción.

    Devuelve [{"P", "M2", "M3", "phi"}] en SI, de tracción hacia compresión.
    Los rayos que no cortan se saltean.
    """
    if beta1 is None:
        beta1 = beta1_from_fc(fc)
    if tied is None:
        tied = not str(shape or "rect").lower().startswith("circ")

    guardado = _malla_cacheada(b, h, fc, fy, cover, bar_diameter, n3, n2,
                               bar_area, confine_bar_diameter, nx, ny, code,
                               tied, shape, diameter, num_bars, flange_thick,
                               web_thick, mirror2, mirror3, beta1,
                               num_angulos, num_c)
    if guardado is None:
        return []
    sec, malla, cs = guardado

    # El ángulo llega en convención del ANÁLISIS; el signo de M2 se da vuelta
    # para barrer el plano correcto de la superficie del motor.
    t_rad = math.radians(float(theta_momento_deg))
    s_t, c_t = -math.sin(t_rad), math.cos(t_rad)

    puntos = []
    for i in range(n_puntos):
        # α barre el plano del corte: -90° = tracción pura, 0° = momento puro,
        # +90° = compresión pura. Los extremos quedan medio paso adentro porque
        # ahí el rayo es tangente a los polos y el corte se vuelve mal
        # condicionado.
        alfa = math.radians(-90.0 + 180.0 * (i + 0.5) / n_puntos)
        d = (math.sin(alfa), math.cos(alfa) * s_t, math.cos(alfa) * c_t)
        corte = _cortar(sec, malla, cs, fc, fy, beta1, code, tied, d)
        if corte is None:
            continue
        t, _theta, pt, _ref = corte
        puntos.append({
            "P": d[0] * t, "M2": -d[1] * t, "M3": d[2] * t,
            "phi": (pt or {}).get("phi"),
        })
    return puntos


def _refinar(sec, fc, fy, beta1, code, tied, d, theta0, c0, iters=40):
    """Newton de 2 parámetros hasta que el punto caiga sobre el rayo.

    Devuelve (punto, theta, c, |OC|) o None si no converge — en ese caso el
    llamador se queda con el corte de la malla, que es conservador.
    """
    e1, e2 = _base_perpendicular(d)
    fibers, bars = sec["fibers"], sec["bars"]
    es_e060 = normalize_design_code(code) == "E060"
    kw = dict(code=code, gross_area=sec["Ag"], tied=tied,
              fiber_dx=sec["fiber_du"], fiber_dy=sec["fiber_dv"])
    c_min, c_max = sec["max_dim"] * 1e-4, sec["max_dim"] * 8.0

    def punto(theta, c):
        # pb (transición de φ de la E.060) depende del ángulo, así que se
        # recalcula: es justamente el parámetro que acá SÍ se mueve.
        pb = balanced_pn(fc, fy, fibers, bars, 0.0, theta, beta1, code) if es_e060 else None
        pt = compute_pn_mn_at(fc, fy, fibers, bars, 0.0, theta, c, beta1, pb=pb, **kw)
        f = pt["phi"]
        return pt, (f * pt["Pn"], f * pt["M2n"], f * pt["M3n"])

    def residuo(p):
        return (p[0] * e1[0] + p[1] * e1[1] + p[2] * e1[2],
                p[0] * e2[0] + p[1] * e2[1] + p[2] * e2[2])

    theta, c = theta0, c0
    pt, p = punto(theta, c)
    escala = max(math.sqrt(sum(v * v for v in p)), 1.0)
    for _ in range(iters):
        r = residuo(p)
        if math.hypot(*r) / escala < 1e-12:
            break
        dt, dc = 1e-5, max(c * 1e-5, c_min * 1e-3)
        _pt_t, p_t = punto(theta + dt, c)
        _pt_c, p_c = punto(theta, c + dc)
        r_t, r_c = residuo(p_t), residuo(p_c)
        j11, j21 = (r_t[0] - r[0]) / dt, (r_t[1] - r[1]) / dt
        j12, j22 = (r_c[0] - r[0]) / dc, (r_c[1] - r[1]) / dc
        det = j11 * j22 - j12 * j21
        if abs(det) < 1e-30:
            return None
        paso_t = (r[0] * j22 - r[1] * j12) / det
        paso_c = (j11 * r[1] - j21 * r[0]) / det
        # Amortiguado: el codo de φ y el tope axial hacen que la superficie
        # tenga quiebres, y un paso completo se puede ir de largo.
        for amort in (1.0, 0.5, 0.25, 0.1):
            th_n = theta - amort * paso_t
            c_n = min(max(c - amort * paso_c, c_min), c_max)
            pt_n, p_n = punto(th_n, c_n)
            if math.hypot(*residuo(p_n)) < math.hypot(*r):
                theta, c, pt, p = th_n, c_n, pt_n, p_n
                break
        else:
            break
    else:
        return None

    if math.hypot(*residuo(p)) / escala > 1e-6:
        return None
    t = p[0] * d[0] + p[1] * d[1] + p[2] * d[2]
    if t <= 0:
        return None
    return pt, theta, c, t
