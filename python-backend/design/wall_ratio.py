# -*- coding: utf-8 -*-
"""python-backend/design/wall_ratio.py

Ratio demanda/capacidad de una placa: el "D/C Ratio" que reporta ETABS.

QUÉ ES
    Se pone el punto de demanda L = (Pu, M2u, M3u) en el espacio P-M2-M3 y se
    traza el rayo desde el origen O. Donde ese rayo corta la superficie de
    interacción está el punto C, y

        D/C = |OL| / |OC|

    Es la definición del manual de CSI (Shear Wall Design, §2.1.3) y NO es lo
    mismo que comparar M_demanda contra M_capacidad al mismo P — eso es mucho
    más conservador (ver project-pmm-ratio-gap: esa confusión costó una brecha
    de 5-6x en columnas hasta que se entendió).

POR QUÉ NO SE REUSA `column_interaction.capacity_ratio_radial`
    Esa función fija el ángulo con `theta = atan2(M2u, M3u)` y evalúa UNA curva.
    Eso vale mientras la dirección del momento coincida con la del eje neutro,
    que es cierto en secciones simétricas y FALSO en una L o una T: ahí los dos
    ángulos difieren decenas de grados (ver project-pmm-ratio-asymmetric-na, que
    midió −24% contra ETABS por exactamente esto).

    Acá se hace lo que dice la definición: se arma la superficie completa, se la
    triangula y se corta el rayo contra ella. No hay que suponer nada sobre la
    dirección del eje neutro.

    OJO: eso hace este ratio MÁS correcto en teoría, pero todavía no está
    verificado contra un D/C real de ETABS para una placa asimétrica — falta el
    dato. Lo que sí está verificado es la superficie que se corta (264 puntos
    contra la tabla Curve Data de PL1).

Unidades: SI (N, N·m), como todo el módulo.
"""

import math

from .column_interaction import (
    DEFAULT_DESIGN_CODE,
    ECU,
    _phi_factor,
    _phi_factor_e060,
    axial_capacity_pn0,
    balanced_pn,
    beta1_from_fc,
    compute_pn_mn_at,
    es_steel_for_code,
    normalize_design_code,
)

__all__ = ["ratio_de_demanda", "malla_de_superficie"]

# Resolución de la superficie que se corta. Medido sobre seis puntos de la tabla
# de PL1 (que están EXACTAMENTE sobre la superficie, así que el ratio tiene que
# dar 1.0000):
#
#     36 x 25  ->  peor 2.17%   medio 0.72%   2.2 s
#     36 x 41  ->  peor 0.77%   medio 0.31%   3.6 s
#     48 x 41  ->  peor 0.70%   medio 0.30%   4.9 s
#     72 x 61  ->  peor 1.09%   medio 0.22%  11.0 s
#
# El residuo casi todo es error de cuerda —la malla corta por adentro de la
# superficie— y va del lado conservador. La excepción es la zona de TRANSICIÓN DE
# φ: ahí la superficie de diseño es NO CONVEXA (φ sube de 0.65 a 0.90 mientras Pn
# baja, y el producto deja de ser monótono), y una cuerda entre dos puntos de una
# curva no convexa puede pasar por AFUERA. Por eso el punto de P = 560.62 da 0.99
# en vez de 1.00 y empeora al refinar: no es falta de resolución, es la forma.
#
# Un 1% ahí es ruido comparado con lo que hace ETABS, que directamente RELLENA
# ese tramo con una recta (verificado: sus puntos 7 y 8 son el tercio y los dos
# tercios de la cuerda 6-9).
ANGULOS_MALLA = 36
PUNTOS_POR_CURVA = 41


def _punto_traccion_pura(seccion, fy):
    bars = seccion["bars"]
    return (
        -fy * sum(a for _u, _v, a in bars),
        fy * sum(a * v for _u, v, a in bars),
        -fy * sum(a * u for u, _v, a in bars),
    )


def malla_de_superficie(seccion, fc, fy, code=DEFAULT_DESIGN_CODE, tied=True,
                        con_phi=True, num_angulos=ANGULOS_MALLA, num_c=PUNTOS_POR_CURVA):
    """
    La superficie como malla de puntos `[angulo][j]`, cerrada en los dos polos.

    `j = 0` es compresión pura y `j = m-1` tracción pura: los dos son el MISMO
    punto para todas las direcciones (con todas las fibras comprimidas, o todas
    las varillas en fluencia por tracción, el ángulo deja de importar). Por eso
    la superficie queda cerrada y un rayo desde adentro siempre la corta.
    """
    fibers, bars = seccion["fibers"], seccion["bars"]
    ag, ast = seccion["Ag"], seccion["As"]
    beta1 = beta1_from_fc(fc)
    es_e060 = normalize_design_code(code) == "E060"
    eps_ty = fy / es_steel_for_code(code)

    kw = dict(code=code, gross_area=ag, tied=tied,
              fiber_dx=seccion["fiber_du"], fiber_dy=seccion["fiber_dv"])

    # Extensión de la sección: hasta dónde hay que barrer c para llegar a
    # compresión pura en cualquier dirección.
    radio = max(math.hypot(u, v) for u, v, _a in fibers)
    c_max = 2.0 * (2.0 * radio) / beta1
    c_min = radio * 0.02

    tp = _punto_traccion_pura(seccion, fy)
    if con_phi:
        phi_t = (_phi_factor_e060(tp[0], fc, ag, pb=None, tied=tied) if es_e060
                 else _phi_factor(ECU * 10, eps_ty, tied=tied, code=code))
    else:
        phi_t = 1.0
    polo_traccion = (phi_t * tp[0], phi_t * tp[1], phi_t * tp[2])

    malla = []
    polo_compresion = None
    for k in range(num_angulos):
        theta = 2.0 * math.pi * k / num_angulos
        pb = balanced_pn(fc, fy, fibers, bars, 0.0, theta, beta1, code) if es_e060 else None
        kwt = dict(kw, pb=pb)

        curva = []
        # Polo de compresión: c enorme. Sale igual para todos los ángulos, pero
        # se calcula una vez y se reusa.
        if polo_compresion is None:
            pt = compute_pn_mn_at(fc, fy, fibers, bars, 0.0, theta, 1e4, beta1, **kwt)
            f = pt["phi"] if con_phi else 1.0
            polo_compresion = (f * pt["Pn"], f * pt["M2n"], f * pt["M3n"])
        curva.append(polo_compresion)

        for j in range(1, num_c - 1):
            # Barrido geométrico: concentra puntos donde la curva tiene curvatura
            # (c chico, lado de tracción), que es donde más importa acertarle.
            t = j / (num_c - 2)
            c = c_min * (c_max / c_min) ** (1.0 - t)
            pt = compute_pn_mn_at(fc, fy, fibers, bars, 0.0, theta, c, beta1, **kwt)
            f = pt["phi"] if con_phi else 1.0
            curva.append((f * pt["Pn"], f * pt["M2n"], f * pt["M3n"]))

        curva.append(polo_traccion)
        malla.append(curva)
    return malla


def _corta_triangulo(dir_, a, b, c):
    """
    Möller–Trumbore desde el origen. Devuelve `t` (cuánto hay que estirar el
    rayo unitario para tocar el triángulo) o None.
    """
    e1 = (b[0] - a[0], b[1] - a[1], b[2] - a[2])
    e2 = (c[0] - a[0], c[1] - a[1], c[2] - a[2])
    p = (dir_[1] * e2[2] - dir_[2] * e2[1],
         dir_[2] * e2[0] - dir_[0] * e2[2],
         dir_[0] * e2[1] - dir_[1] * e2[0])
    det = e1[0] * p[0] + e1[1] * p[1] + e1[2] * p[2]
    if abs(det) < 1e-12:
        return None
    inv = 1.0 / det
    t_ = (-a[0], -a[1], -a[2])
    u = (t_[0] * p[0] + t_[1] * p[1] + t_[2] * p[2]) * inv
    if u < -1e-9 or u > 1 + 1e-9:
        return None
    q = (t_[1] * e1[2] - t_[2] * e1[1],
         t_[2] * e1[0] - t_[0] * e1[2],
         t_[0] * e1[1] - t_[1] * e1[0])
    v = (dir_[0] * q[0] + dir_[1] * q[1] + dir_[2] * q[2]) * inv
    if v < -1e-9 or u + v > 1 + 1e-9:
        return None
    t = (e2[0] * q[0] + e2[1] * q[1] + e2[2] * q[2]) * inv
    return t if t > 1e-12 else None


def ratio_de_demanda(seccion, fc, fy, demanda, code=DEFAULT_DESIGN_CODE, tied=True,
                     malla=None, con_phi=True):
    """
    D/C de UNA demanda `(P, M2, M3)` en N y N·m, contra la superficie.

    Devuelve {ratio, capacidad: {P, M2, M3}, demanda: {...}} o None si el rayo
    no corta (demanda degenerada, o el origen fuera de la superficie).

    Con la superficie recortada por el codo de φ puede haber más de un corte;
    se toma el MÁS CERCANO, que es el conservador.
    """
    P, M2, M3 = (float(demanda.get("P", 0.0)),
                 float(demanda.get("M2", 0.0)),
                 float(demanda.get("M3", 0.0)))
    largo = math.sqrt(P * P + M2 * M2 + M3 * M3)
    if largo <= 0:
        return None
    dir_ = (P / largo, M2 / largo, M3 / largo)

    if malla is None:
        malla = malla_de_superficie(seccion, fc, fy, code=code, tied=tied, con_phi=con_phi)

    n_ang = len(malla)
    mejor = None
    for k in range(n_ang):
        c1, c2 = malla[k], malla[(k + 1) % n_ang]
        for j in range(len(c1) - 1):
            for tri in ((c1[j], c1[j + 1], c2[j + 1]), (c1[j], c2[j + 1], c2[j])):
                t = _corta_triangulo(dir_, *tri)
                if t is not None and (mejor is None or t < mejor):
                    mejor = t
    if mejor is None:
        return None

    return {
        "ratio": largo / mejor,
        "capacity": {"P": dir_[0] * mejor, "M2": dir_[1] * mejor, "M3": dir_[2] * mejor},
        "demand": {"P": P, "M2": M2, "M3": M3},
    }
