# -*- coding: utf-8 -*-
"""Ratio D/C de una placa, contra puntos que estan EXACTAMENTE sobre la superficie.

La prueba de fondo es simple: si la demanda cae justo sobre la superficie de
interaccion, el ratio tiene que dar 1.0000. Los puntos se toman de la tabla
"Curve Data" real de ETABS para la PL1 del MODULO 01 (curva #1, Include Phi),
que ya esta verificada punto por punto en test_wall_interaction.

Ver project-wall-design-module.
"""
import math
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))

from design.wall_ratio import malla_de_superficie, ratio_de_demanda
from design.wall_section import construir_seccion
from design.tests.test_wall_section import CATALOGO, FC, FY, PL1_SHAPES

T = 9806.65  # tonf -> N

# (P, M2, M3) en tonf y tonf-m, de la tabla con phi de ETABS.
SOBRE_LA_SUPERFICIE = [
    (739.4317, -3.0047, 1.8354),      # tope axial
    (708.2800, -37.3458, 148.9063),
    (638.2518, -48.4780, 178.7569),
    (439.9893, -120.3244, 271.8152),
    (129.6296, -66.6474, 168.7238),
]

_CACHE = {}


def _seccion():
    if "sec" not in _CACHE:
        _CACHE["sec"] = construir_seccion(PL1_SHAPES, CATALOGO, malla=120)
    return _CACHE["sec"]


def _malla():
    if "malla" not in _CACHE:
        _CACHE["malla"] = malla_de_superficie(_seccion(), FC, FY, code="ACI318", tied=True)
    return _CACHE["malla"]


def _ratio(P, M2, M3):
    r = ratio_de_demanda(_seccion(), FC, FY,
                         {"P": P * T, "M2": M2 * T, "M3": M3 * T},
                         code="ACI318", tied=True, malla=_malla())
    assert r is not None, "el rayo no corto la superficie"
    return r["ratio"]


def test_una_demanda_sobre_la_superficie_da_uno():
    """Tolerancia 1%: el residuo es error de CUERDA (la malla triangulada corta
    por adentro de la superficie curva) mas la no convexidad del codo de phi.
    Ver la nota de resolucion en wall_ratio.py."""
    peor = max(abs(_ratio(*d) - 1.0) for d in SOBRE_LA_SUPERFICIE)
    assert peor < 0.01, "peor desvio: %.4f" % peor


def test_el_ratio_es_lineal_en_la_demanda():
    """Duplicar la demanda duplica el D/C: el ratio es |OL|/|OC| y solo |OL|
    cambia. Si esto falla, el corte no esta pasando por el mismo punto."""
    P, M2, M3 = SOBRE_LA_SUPERFICIE[2]
    entero = _ratio(P, M2, M3)
    mitad = _ratio(P / 2, M2 / 2, M3 / 2)
    doble = _ratio(P * 2, M2 * 2, M3 * 2)
    assert math.isclose(mitad, entero / 2, rel_tol=1e-6), (mitad, entero)
    assert math.isclose(doble, entero * 2, rel_tol=1e-6), (doble, entero)


def test_una_demanda_de_mas_pasa_de_uno():
    """Lo minimo que tiene que hacer un verificador: avisar cuando no da."""
    assert _ratio(800.0, -60.0, 240.0) > 1.0


def test_la_capacidad_devuelta_esta_sobre_el_rayo():
    """El punto C tiene que ser la demanda escalada por 1/ratio: si no, no es
    la interseccion del rayo sino otra cosa."""
    P, M2, M3 = SOBRE_LA_SUPERFICIE[3]
    r = ratio_de_demanda(_seccion(), FC, FY,
                         {"P": P * T, "M2": M2 * T, "M3": M3 * T},
                         code="ACI318", tied=True, malla=_malla())
    for eje, valor in (("P", P), ("M2", M2), ("M3", M3)):
        assert math.isclose(r["capacity"][eje] / T, valor / r["ratio"], rel_tol=1e-6), eje


def test_demanda_nula_no_devuelve_nada():
    """Sin direccion no hay rayo que cortar."""
    assert ratio_de_demanda(_seccion(), FC, FY, {"P": 0, "M2": 0, "M3": 0},
                            code="ACI318", malla=_malla()) is None
