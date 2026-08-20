# -*- coding: utf-8 -*-
"""Tope de carga axial Pn,max (ACI 318-14 Tabla 22.4.2.1 / E.060 Art. 10.3.6).

Referencia externa: tabla "Curve Data" del dialogo Interaction Surface de
ETABS para la seccion C45x45 del modelo `muros modelo 2.1.e2k` (12 varillas de
3.142e-4 m2, f'c=210, fy=4200, Include Phi). Su punto 1 vale 266.8064 tonf y su
punto 11 vale -142.5211 tonf.
"""
import math
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))

from design.column_interaction import (
    axial_capacity_pn0,
    axial_max_nominal,
    capacity_ratio_radial,
    compute_pmm_surface,
)

KG = 98066.5
T = 9806.65

C45 = dict(
    b=0.45, h=0.45, fc=210 * KG, fy=4200 * KG, cover=0.04,
    bar_diameter=0.020, n3=3, n2=5, bar_area=3.142e-4,
    confine_bar_diameter=0.010, tied=True, code="ACI318",
)
AST = 12 * C45["bar_area"]
AG = 0.45 * 0.45

# Puntos de la curva a 0 grados, tal cual los reporta ETABS.
ETABS_CURVA_0 = [
    (266.8064, 0.0), (266.8064, 9.1834), (240.1440, 13.8178), (201.3472, 17.5002),
    (156.4660, 20.3692), (102.8152, 22.7268), (74.1787, 25.6863), (31.3574, 26.5258),
    (-28.2904, 19.6075), (-93.9041, 9.1684), (-142.5211, 0.0),
]


def test_pn_max_por_tipo_de_estribo():
    po = axial_capacity_pn0(C45["fc"], C45["fy"], AG, AST)
    assert math.isclose(axial_max_nominal(C45["fc"], C45["fy"], AG, AST, tied=True), 0.80 * po)
    assert math.isclose(axial_max_nominal(C45["fc"], C45["fy"], AG, AST, tied=False), 0.85 * po)


def test_compresion_pura_reproduce_el_punto_1_de_etabs():
    """phi * 0.80 * Po = 266.8064 tonf, el primer punto de la tabla de ETABS."""
    pmax = axial_max_nominal(C45["fc"], C45["fy"], AG, AST, tied=True)
    assert math.isclose(0.65 * pmax / T, ETABS_CURVA_0[0][0], abs_tol=0.001)


def test_traccion_pura_reproduce_el_punto_11_de_etabs():
    """phi * fy * Ast = 142.5211 tonf, con phi=0.90 (controlado por traccion)."""
    assert math.isclose(0.90 * C45["fy"] * AST / T, -ETABS_CURVA_0[-1][0], abs_tol=0.001)


def test_la_superficie_no_supera_el_tope():
    """Sin el tope la superficie llegaba a phi*Po = 333.51 tonf: 25% de mas, y
    del lado inseguro."""
    s = compute_pmm_surface(num_angles=24, num_c=41, **C45)
    mx = max(p["phiPn"] for c in s["curves"] for p in c["points"]) / T
    assert math.isclose(mx, ETABS_CURVA_0[0][0], abs_tol=0.001)
    assert mx < 333.0


def test_el_tope_deja_una_meseta_plana():
    """El tope TRUNCA con una horizontal: recorta Pn y deja el momento. Por eso
    hay varios puntos al mismo P con M creciente — la meseta de arriba del
    diagrama. El punto 2 de ETABS (266.8064, 9.1834) cae dentro de ella."""
    s = compute_pmm_surface(num_angles=24, num_c=201, **C45)
    c0 = s["curves"][0]
    p_tope, m_tope = ETABS_CURVA_0[0][0], ETABS_CURVA_0[1][1]

    meseta = [p["phiM3n"] / T for p in c0["points"] if abs(p["phiPn"] / T - p_tope) < 0.01]
    assert len(meseta) > 1, "sin meseta: el tope no se esta aplicando"
    assert min(meseta) <= m_tope <= max(meseta)


def test_curva_a_0_grados_calza_con_etabs():
    """Los puntos intermedios (los que NO estan sobre la meseta ni en los
    extremos) contra la tabla de ETABS. La comparacion se hace a P igual,
    interpolando nuestra curva."""
    s = compute_pmm_surface(num_angles=24, num_c=181, **C45)
    c0 = s["curves"][0]
    assert math.isclose(c0["angleDeg"], 0.0)

    # A 0 grados la flexion es pura sobre el eje 3: M2 debe ser nulo.
    assert max(abs(p["phiM2n"]) for p in c0["points"]) / T < 1e-6

    pts = sorted(((p["phiPn"] / T, p["phiM3n"] / T) for p in c0["points"]), key=lambda r: r[0])

    def m3_en(p_obj):
        mejor = None
        for (p0, m0), (p1, m1) in zip(pts, pts[1:]):
            if p1 != p0 and (p0 - p_obj) * (p1 - p_obj) <= 0:
                v = m0 + (p_obj - p0) / (p1 - p0) * (m1 - m0)
                mejor = v if mejor is None else max(mejor, v)
        return mejor

    difs = []
    for p_e, m_e in ETABS_CURVA_0[2:-1]:  # sin meseta (1,2) ni traccion pura (11)
        ours = m3_en(p_e)
        assert ours is not None, "P=%.2f fuera del rango de nuestra curva" % p_e
        difs.append(abs(ours - m_e) / m_e)

    assert max(difs) < 0.03, "max %.1f%%" % (100 * max(difs))
    assert sum(difs) / len(difs) < 0.01


def test_el_tope_no_mueve_los_ratios_de_axial_bajo():
    """Guardia de regresion: las columnas de este modelo trabajan a Pu de 28-47
    tonf, muy por debajo del tope de 266.8, asi que sus ratios — ya validados
    contra ETABS — no se pueden mover al agregar el tope."""
    for pu, m2, m3, esperado in ((27.58, 0.79, 0.79, 0.104),
                                 (46.63, 1.33, 1.48, 0.178),
                                 (45.37, 1.29, 1.29, 0.171)):
        r = capacity_ratio_radial(target_p=pu * T, target_m2=m2 * T, target_m3=m3 * T, **C45)
        assert math.isclose(r["ratio"], esperado, abs_tol=0.001)
