"""Factores de reduccion phi por codigo (E.060 vs ACI 318).

Referencia externa: plantilla Excel peruana de diagrama de interaccion
(columna 40x40, f'c=280 kg/cm2, fy=4200 kg/cm2, Ast=60.80 cm2) que reporta
Po=621.69 t, Pn=497.35 t, Pu=348.15 t con phi=0.70 (E.060 Art. 10.3.2).
"""
import math
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))

from design.column_interaction import (
    PHI_BY_CODE,
    _phi_factor_e060,
    axial_capacity_pn0,
    normalize_design_code,
    phi_shear_for_code,
)

KGCM2_TO_PA = 98066.5
CM2_TO_M2 = 1e-4
N_TO_TON = 1.0 / 9806.65


def test_phi_values_por_codigo():
    """E.060 Art. 10.3.2 vs ACI 318 §21.2 — los valores de arranque."""
    e060 = PHI_BY_CODE["E060"]
    aci = PHI_BY_CODE["ACI318"]

    assert e060["cc_tied"] == 0.70  # estribos, compresion
    assert e060["cc_spiral"] == 0.75  # espiral (coincide con ACI)
    assert e060["tc"] == 0.90  # flexion sin carga axial
    assert e060["shear"] == 0.85  # cortante con o sin torsion

    assert aci["cc_tied"] == 0.65
    assert aci["shear"] == 0.75

    assert phi_shear_for_code("E060") == 0.85
    assert phi_shear_for_code("ACI318") == 0.75


def test_normalize_design_code():
    for variante in ("E060", "e060", "E.060", "E-060", "e 060"):
        assert normalize_design_code(variante) == "E060"
    for variante in ("ACI318", "aci", "ACI 318-19", "aci318"):
        assert normalize_design_code(variante) == "ACI318"
    assert normalize_design_code(None) == "E060"  # default
    assert normalize_design_code("xyz") == "E060"


def test_compresion_pura_calza_con_plantilla():
    """Po/Pn/Pu del 1er punto (compresion pura) de la plantilla de referencia."""
    fc = 280 * KGCM2_TO_PA
    fy = 4200 * KGCM2_TO_PA
    ag = 1600 * CM2_TO_M2
    ast = 60.80 * CM2_TO_M2

    po = axial_capacity_pn0(fc, fy, ag, ast) * N_TO_TON
    assert math.isclose(po, 621.69, abs_tol=0.01)

    pn = 0.80 * po  # tope de columna estribada
    assert math.isclose(pn, 497.35, abs_tol=0.01)

    # phi=0.70 (E.060) sobre el tope -> el Pu de la plantilla.
    assert math.isclose(0.70 * pn, 348.15, abs_tol=0.01)


def test_transicion_e060_por_carga_axial():
    """La transicion de la E.060 va por CARGA AXIAL (no por deformacion):
    phi sube de 0.70 a 0.90 conforme phi*Pn baja de min(0.10 f'c Ag, 0.70 Pb)
    hasta cero."""
    fc = 280 * KGCM2_TO_PA
    ag = 1600 * CM2_TO_M2
    limite = 0.10 * fc * ag  # sin tope por Pb

    # Pn = 0 -> flexion pura -> 0.90
    assert _phi_factor_e060(0.0, fc, ag) == 0.90

    # phi*Pn == limite -> exactamente phi_cc (0.70). Pn = limite/0.70.
    phi = _phi_factor_e060(limite / 0.70, fc, ag)
    assert math.isclose(phi, 0.70, abs_tol=1e-9)

    # Por encima del limite se mantiene en 0.70 (no baja mas).
    assert _phi_factor_e060(10 * limite, fc, ag) == 0.70

    # En el medio queda estrictamente entre 0.70 y 0.90, y es monotono
    # decreciente con Pn.
    p1 = _phi_factor_e060(limite * 0.3, fc, ag)
    p2 = _phi_factor_e060(limite * 0.6, fc, ag)
    assert 0.70 < p2 < p1 < 0.90


def test_transicion_e060_topea_por_pb():
    """Cuando 0.70*Pb < 0.10 f'c Ag, manda Pb (E.060 Art. 10.3.2, ultimo
    parrafo del inciso 3)."""
    fc = 280 * KGCM2_TO_PA
    ag = 1600 * CM2_TO_M2
    limite_ag = 0.10 * fc * ag
    pb_chico = (limite_ag / 0.70) * 0.5  # 0.70*pb = mitad del limite por Ag

    phi_con_pb = _phi_factor_e060(limite_ag * 0.4, fc, ag, pb=pb_chico)
    phi_sin_pb = _phi_factor_e060(limite_ag * 0.4, fc, ag, pb=None)
    # Con el limite mas chico, el mismo Pn queda relativamente "mas alto"
    # respecto del limite -> phi mas bajo (mas cerca de 0.70).
    assert phi_con_pb < phi_sin_pb


def test_espiral_arranca_en_075():
    fc = 280 * KGCM2_TO_PA
    ag = 1600 * CM2_TO_M2
    limite = 0.10 * fc * ag
    phi = _phi_factor_e060(10 * limite, fc, ag, tied=False)
    assert math.isclose(phi, 0.75, abs_tol=1e-9)
