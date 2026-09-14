# -*- coding: utf-8 -*-
"""Cortante de placas — ACI 318-14 §18.10.4 y E.060 Art. 21.9."""
import math
import os
import sys

import pytest

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))

from design.wall_shear import (
    CUANTIA_MINIMA,
    alpha_c,
    resistencia_cortante,
    tope_del_conjunto,
    verificar_cortante,
)

MPA = 1e6
FC = 21 * MPA        # 210 kg/cm2
FY = 420 * MPA       # 4200 kg/cm2
PLACA = dict(acv=0.25 * 4.0, fc=FC, fy=FY)   # e=25 cm, L=4.00 m


def test_alpha_c_en_los_dos_anclajes_y_en_el_medio():
    assert alpha_c(1.0, "ACI318") == pytest.approx(0.25)
    assert alpha_c(1.5, "ACI318") == pytest.approx(0.25)
    assert alpha_c(2.0, "ACI318") == pytest.approx(0.17)
    assert alpha_c(5.0, "ACI318") == pytest.approx(0.17)
    # a mitad del tramo lineal
    assert alpha_c(1.75, "ACI318") == pytest.approx(0.21)


def test_e060_y_aci_dicen_practicamente_lo_mismo():
    """La E.060 tabula en kg/cm2 y el ACI en MPa; convertidos, coinciden.

    Es el punto que justifica tener un solo modulo para las dos normas: la
    diferencia real entre ellas esta en phi (0.85 vs 0.75), no en Vn.
    """
    assert alpha_c(1.0, "E060") == pytest.approx(0.25, rel=0.01)
    assert alpha_c(3.0, "E060") == pytest.approx(0.17, rel=0.03)


def test_vn_es_la_formula_del_articulo():
    """Vn = Acv*(alpha_c*sqrt(f'c) + rho_t*fy), a mano."""
    rho = 0.0025
    r = resistencia_cortante(rho_t=rho, hw_lw=3.0, code="ACI318", **PLACA)
    esperado = (0.17 * math.sqrt(21) + rho * 420) * 1e6 * PLACA["acv"]
    assert r["Vn"] == pytest.approx(esperado, rel=1e-9)
    assert r["Vc"] + r["Vs"] == pytest.approx(esperado, rel=1e-9)


def test_phi_sale_del_reglamento_elegido():
    aci = resistencia_cortante(rho_t=0.0025, hw_lw=3.0, code="ACI318", **PLACA)
    e60 = resistencia_cortante(rho_t=0.0025, hw_lw=3.0, code="E060", **PLACA)
    assert aci["phi"] == pytest.approx(0.75)
    assert e60["phi"] == pytest.approx(0.85)
    # Con la MISMA Vn, la E.060 entrega mas capacidad de diseno.
    assert e60["phiVn"] > aci["phiVn"]


def test_el_tope_del_segmento_recorta_una_cuantia_absurda():
    """§18.10.4.4: Vn <= 0.83*sqrt(f'c)*Acw por segmento."""
    r = resistencia_cortante(rho_t=0.05, hw_lw=3.0, code="ACI318", **PLACA)
    assert r["gobierna_el_tope"] is True
    assert r["Vn"] == pytest.approx(0.83 * math.sqrt(21) * 1e6 * PLACA["acv"])


def test_el_tope_del_conjunto_es_mas_exigente_que_el_del_segmento():
    uno = resistencia_cortante(rho_t=0.05, hw_lw=3.0, code="ACI318", **PLACA)
    conjunto = tope_del_conjunto(PLACA["acv"], FC)
    assert conjunto < uno["tope_segmento"]
    assert conjunto == pytest.approx(0.66 * math.sqrt(21) * 1e6 * PLACA["acv"])


def test_ratio_y_veredicto():
    r = verificar_cortante(vu=0, rho_t=0.0025, hw_lw=3.0, code="ACI318", **PLACA)
    phivn = r["phiVn"]
    justo = verificar_cortante(vu=phivn, rho_t=0.0025, hw_lw=3.0, code="ACI318", **PLACA)
    assert justo["ratio"] == pytest.approx(1.0)
    assert justo["cumple"] is True
    pasado = verificar_cortante(vu=phivn * 1.2, rho_t=0.0025, hw_lw=3.0, code="ACI318", **PLACA)
    assert pasado["ratio"] == pytest.approx(1.2)
    assert pasado["cumple"] is False


def test_la_cuantia_minima_solo_se_exige_por_encima_del_umbral():
    """§18.10.2.1: bajo 0.083*sqrt(f'c)*Acv no rige el 0.0025."""
    bajo = verificar_cortante(vu=1.0, rho_t=0.0010, rho_l=0.0010,
                              hw_lw=3.0, code="ACI318", **PLACA)
    assert bajo["exige_cuantia_minima"] is False
    assert bajo["cumple_rho_t"] is True

    alto = verificar_cortante(vu=bajo["umbral_cuantia_minima"] * 1.5,
                              rho_t=0.0010, rho_l=0.0010,
                              hw_lw=3.0, code="ACI318", **PLACA)
    assert alto["exige_cuantia_minima"] is True
    assert alto["cumple_rho_t"] is False
    assert alto["cumple_rho_l"] is False

    ok = verificar_cortante(vu=bajo["umbral_cuantia_minima"] * 1.5,
                            rho_t=CUANTIA_MINIMA, rho_l=CUANTIA_MINIMA,
                            hw_lw=3.0, code="ACI318", **PLACA)
    assert ok["cumple_rho_t"] is True and ok["cumple_rho_l"] is True


def test_una_placa_esbelta_resiste_menos_que_una_robusta():
    robusta = resistencia_cortante(rho_t=0.0025, hw_lw=1.0, code="ACI318", **PLACA)
    esbelta = resistencia_cortante(rho_t=0.0025, hw_lw=3.0, code="ACI318", **PLACA)
    assert robusta["Vn"] > esbelta["Vn"]
