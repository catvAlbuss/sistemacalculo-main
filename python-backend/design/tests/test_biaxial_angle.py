# -*- coding: utf-8 -*-
"""Convencion del angulo de flexion biaxial theta.

theta se mide DESDE el eje M3 HACIA el M2: theta=0 es flexion pura sobre el
eje 3 (M3 != 0, M2 = 0) y theta=90 grados es M2 puro. Por lo tanto el angulo de
una demanda (M2, M3) es atan2(M2, M3), NO atan2(M3, M2).

Estaba invertido en capacity_ratio_radial: una demanda de M3 puro se verificaba
contra la capacidad del plano M2. Con armado asimetrico los dos planos difieren
(~17% en la C45x45 R-5-3 de este modelo), asi que el ratio salia mal en
demandas cerca de uniaxiales. En las biaxiales a ~45 grados casi no se notaba,
que es por que no lo detecto la validacion contra ETABS.

Referencia externa: el dialogo Interaction Surface de ETABS reporta
"Curve is at 253.922 deg" para una curva cuyos momentos son M2=-24.4382 y
M3=-7.0434 -> atan2(M2, M3) da exactamente 253.922.
"""
import math
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))

from design.column_interaction import capacity_ratio_radial, compute_pmm_surface

KG = 98066.5
T = 9806.65

# C45x45 con armado ASIMETRICO (n2=5 / n3=3): los planos 2 y 3 dan capacidades
# distintas, que es lo que le da filo a estos tests.
C45 = dict(
    b=0.45, h=0.45, fc=210 * KG, fy=4200 * KG, cover=0.04,
    bar_diameter=0.020, n3=3, n2=5, bar_area=3.142e-4,
    confine_bar_diameter=0.010, tied=True, code="ACI318",
)


def _curva(surface, ang):
    return next(c for c in surface["curves"] if math.isclose(c["angleDeg"], ang, abs_tol=1e-6))


def test_la_superficie_define_la_convencion():
    """theta=0 -> M3 puro; theta=90 -> M2 puro."""
    s = compute_pmm_surface(num_angles=24, num_c=41, **C45)

    c0 = _curva(s, 0.0)
    assert max(abs(p["M2n"]) for p in c0["points"]) / T < 1e-6
    assert max(abs(p["M3n"]) for p in c0["points"]) / T > 1.0

    c90 = _curva(s, 90.0)
    assert max(abs(p["M3n"]) for p in c90["points"]) / T < 1e-6
    assert max(abs(p["M2n"]) for p in c90["points"]) / T > 1.0


def test_los_dos_planos_dan_capacidades_distintas():
    """Sin esto los tests de abajo no probarian nada: con armado simetrico
    cruzar los planos seria inofensivo."""
    s = compute_pmm_surface(num_angles=24, num_c=41, **C45)
    m3 = max(abs(p["phiM3n"]) for p in _curva(s, 0.0)["points"]) / T
    m2 = max(abs(p["phiM2n"]) for p in _curva(s, 90.0)["points"]) / T
    assert abs(m2 - m3) / m3 > 0.10, "planos demasiado parecidos (%.2f vs %.2f)" % (m2, m3)


def test_demanda_de_m3_puro_se_verifica_en_el_plano_m3():
    r = capacity_ratio_radial(target_p=44.59 * T, target_m2=0.0, target_m3=10.0 * T, **C45)
    assert math.isclose(r["thetaDeg"], 0.0, abs_tol=1e-6)
    cap = r["capacity"]
    assert abs(cap["M2n"]) / T < 1e-6
    assert abs(cap["M3n"]) / T > 1.0


def test_demanda_de_m2_puro_se_verifica_en_el_plano_m2():
    r = capacity_ratio_radial(target_p=44.59 * T, target_m2=10.0 * T, target_m3=0.0, **C45)
    assert math.isclose(r["thetaDeg"], 90.0, abs_tol=1e-6)
    cap = r["capacity"]
    assert abs(cap["M3n"]) / T < 1e-6
    assert abs(cap["M2n"]) / T > 1.0


def test_angulo_reproduce_el_de_etabs():
    """La curva que ETABS reporta "at 253.922 deg" tiene M2=-24.4382,
    M3=-7.0434."""
    ang = math.degrees(math.atan2(-24.4382, -7.0434)) % 360
    assert math.isclose(ang, 253.922, abs_tol=0.001)


def test_cuadrantes():
    """El signo importa: perderlo rota la demanda a otro cuadrante de la
    superficie (por eso app.py conserva el signo del momento gobernante)."""
    casos = ((1.0, 1.0, 45.0), (1.0, -1.0, 135.0), (-1.0, -1.0, 225.0), (-1.0, 1.0, 315.0))
    for m2, m3, esperado in casos:
        r = capacity_ratio_radial(target_p=30.0 * T, target_m2=m2 * T, target_m3=m3 * T, **C45)
        assert math.isclose(r["thetaDeg"], esperado, abs_tol=1e-6), \
            "M2=%+.0f M3=%+.0f -> %.2f, esperado %.1f" % (m2, m3, r["thetaDeg"], esperado)
