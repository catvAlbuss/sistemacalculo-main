# -*- coding: utf-8 -*-
"""El motor de FIBRAS contra el metodo de CAPAS (layer_method_reference.py).

Dos caminos de codigo independientes para el mismo problema: el motor integra
el concreto sobre una malla de 3600 fibras; la referencia usa la formula cerrada
del bloque de Whitney y agrupa el acero en capas. Mismas hipotesis de ACI,
implementaciones que no comparten una linea.

Este cruce es el que encontro la cuantizacion del bloque de compresion (el motor
metia hasta 5.9% de mas en el concreto porque cada fibra entraba entera o nada).
Ni ETABS ni los demas tests lo mostraban: en la zona de trabajo de las columnas
del modelo de referencia el error caia cerca de cero.

OJO con los ejes: en compute_pn_mn_at el gradiente es
xi = x*cos(theta) + y*sin(theta), asi que theta=0 barre sobre X y theta=90 sobre
Y. Agrupar las capas por el eje equivocado da una comparacion sin sentido.
"""
import math
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))

from design.column_interaction import (
    ECU,
    ES_STEEL,
    _rect_fiber_grid,
    axial_capacity_pn0,
    beta1_from_fc,
    compute_pn_mn_at,
    generate_rect_bar_positions,
)
from design.tests.layer_method_reference import layer_point, layers_from_rect_pattern

KG = 98066.5
T = 9806.65

# C45x45 del modelo de referencia: 12 varillas de 3.142e-4 m2, patron R-5-3,
# recubrimiento 4 cm, estribo Ø10, varilla Ø20 (diametros exactos del area).
B = H = 0.45
FC, FY = 210 * KG, 4200 * KG
BAR_AREA = 3.142e-4
BARS = generate_rect_bar_positions(B, H, 0.04, 0.0200013, 3, 5, 0.0099975)
FIBERS, FDX, FDY = _rect_fiber_grid(B, H, 60, 60)
BETA1 = beta1_from_fc(FC)

C_VALUES = (0.10, 0.15, 0.20, 0.25, 0.30, 0.40)


def _motor(theta, c):
    pt = compute_pn_mn_at(FC, FY, FIBERS, BARS, BAR_AREA, theta, c, BETA1,
                          code="ACI318", gross_area=B * H, tied=True,
                          fiber_dx=FDX, fiber_dy=FDY)
    return pt


def _comparar(theta_deg, axis, comp_momento):
    theta = math.radians(theta_deg)
    capas = layers_from_rect_pattern(BARS, BAR_AREA, H / 2.0, axis)

    peor_p = peor_m = 0.0
    for c in C_VALUES:
        pn_ref, mn_ref = layer_point(B, H, FC, FY, ES_STEEL, ECU, BETA1, capas, c)
        pt = _motor(theta, c)
        pn, mn = pt["Pn"], abs(pt[comp_momento])

        if abs(pn_ref) > 1000:
            peor_p = max(peor_p, abs(pn - pn_ref) / abs(pn_ref))
        if abs(mn_ref) > 1000:
            peor_m = max(peor_m, abs(mn - mn_ref) / abs(mn_ref))

    return capas, peor_p, peor_m


def test_theta_0_barre_sobre_x():
    """theta=0 -> gradiente sobre X -> 5 capas (3-2-2-2-3) y momento M3."""
    capas, dp, dm = _comparar(0.0, axis=0, comp_momento="M3n")
    assert len(capas) == 5
    assert dp < 0.001, "Pn difiere %.2f%%" % (100 * dp)
    assert dm < 0.002, "Mn difiere %.2f%%" % (100 * dm)


def test_theta_90_barre_sobre_y():
    """theta=90 -> gradiente sobre Y -> 3 capas (5-2-5) y momento M2."""
    capas, dp, dm = _comparar(90.0, axis=1, comp_momento="M2n")
    assert len(capas) == 3
    assert dp < 0.001, "Pn difiere %.2f%%" % (100 * dp)
    assert dm < 0.002, "Mn difiere %.2f%%" % (100 * dm)


def test_las_dos_direcciones_dan_distinto():
    """Sin esto los tests de arriba podrian pasar por casualidad: si los dos
    ejes dieran lo mismo, cruzarlos seria inofensivo. El armado R-5-3 es
    asimetrico justamente para que no lo sea."""
    m3 = abs(_motor(0.0, 0.20)["M3n"])
    m2 = abs(_motor(math.radians(90), 0.20)["M2n"])
    assert abs(m2 - m3) / m3 > 0.10, "%.2f vs %.2f" % (m2 / T, m3 / T)


def test_el_bloque_de_concreto_no_se_cuantiza():
    """Solo concreto (varilla de area despreciable) contra 0.85*f'c*b*a exacto.

    Antes del peso parcial de fibra esto daba +5.9% a c=10 cm, +1.5% a 20 y
    -5.9% a 45: el error OSCILABA con c, que es la firma de la cuantizacion.
    """
    sin_acero = [(0.0, 0.0)]
    for c in (0.10, 0.15, 0.20, 0.25, 0.30):
        a = min(BETA1 * c, H)
        whitney = 0.85 * FC * B * a
        pt = compute_pn_mn_at(FC, FY, FIBERS, sin_acero, 1e-12, 0.0, c, BETA1,
                              code="ACI318", gross_area=B * H, tied=True,
                              fiber_dx=FDX, fiber_dy=FDY)
        assert abs(pt["Pn"] - whitney) / whitney < 1e-4, \
            "c=%.2f: %.2f vs %.2f t" % (c, pt["Pn"] / T, whitney / T)


def test_la_referencia_reproduce_la_plantilla_excel():
    """Ancla externa de la referencia: la plantilla peruana de diagrama de
    interaccion (columna 40x40, f'c=280, fy=4200, Ast=60.80 cm2) reporta
    Po=621.69 t. Con c muy grande el metodo de capas tiene que converger ahi.

    Sirve para que la referencia no sea "otro codigo mio" sin respaldo: si
    reproduce un numero publicado, cruzarla contra el motor tiene valor.
    """
    b = h = 0.40
    fc, fy = 280 * KG, 4200 * KG
    ast = 60.80e-4
    capas = [(0.06, ast / 2.0), (0.34, ast / 2.0)]

    pn, _ = layer_point(b, h, fc, fy, ES_STEEL, ECU, 0.85, capas, 100.0)
    po = axial_capacity_pn0(fc, fy, b * h, ast)

    assert math.isclose(po / T, 621.69, abs_tol=0.01)
    assert abs(pn - po) / po < 1e-6
