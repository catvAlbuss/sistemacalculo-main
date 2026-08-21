"""Esbeltez / magnificacion de momentos (E.060 10.12) — validado contra una
plantilla de referencia peruana: columna 40x40, f'c=280, Ec=220000 kg/cm2,
lu=2.75 m, 11 combos con sus Cm/Pc/deltaNs ya calculados."""
import math
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))

from design.column_slenderness import (
    cm_factor,
    critical_load,
    magnify_nonsway,
    radius_of_gyration,
    slenderness_limit_nonsway,
)

KG_CM2_TO_PA = 98066.5
TON_TO_N = 9806.65
CM4_TO_M4 = 1e-8
CM2_TO_M2 = 1e-4

# Datos de la plantilla de referencia
EC = 220000 * KG_CM2_TO_PA      # Pa
B = H = 0.40                     # m
IG = B * H ** 3 / 12.0           # m4
AG = B * H                       # m2
LU = 2.75                        # m

# (nombre, M3 abajo, M3 arriba, Cm de la plantilla) — ton*m
COMBOS_CM = [
    ("COMB1", -3.22, 4.59, 0.40), ("COMB2", -2.91, 5.47, 0.40),
    ("COMB3", -2.85, 2.85, 0.40), ("COMB4", 18.83, -2.05, 0.56),
    ("COMB5", -22.53, 8.63, 0.45), ("COMB6", 18.55, -1.83, 0.56),
    ("COMB7", 19.64, -3.08, 0.54), ("COMB8", -22.80, 9.24, 0.44),
    ("COMB9", -21.71, 6.95, 0.47), ("COMB10", 19.73, -3.18, 0.54),
    ("COMB11", -21.62, 6.85, 0.47),
]


def test_cm_calza_con_plantilla_en_los_11_combos():
    for name, m_ab, m_ar, cm_ref in COMBOS_CM:
        cm = cm_factor(m_ab, m_ar)
        assert abs(cm - cm_ref) < 0.006, f"{name}: {cm} vs {cm_ref}"


def test_cm_piso_y_techo():
    # Curvatura simple perfecta (mismo signo, misma magnitud) -> Cm = 1.0
    assert math.isclose(cm_factor(10.0, 10.0), 1.0, abs_tol=1e-9)
    # Curvatura doble perfecta -> 0.6-0.4 = 0.2, topeado en el piso 0.4
    assert math.isclose(cm_factor(10.0, -10.0), 0.4, abs_tol=1e-9)
    # Nunca baja del piso
    assert cm_factor(1.0, -50.0) >= 0.4


def test_pc_calza_con_plantilla_comb1():
    """COMB1: Pu=119.20 t, betaD=1.5*62.76/119.20 -> Pc=1368.90 t."""
    pu_ton = 119.20
    beta_d = 1.5 * 62.76 / pu_ton
    pc, _ei = critical_load(EC, IG, LU, k=1.0, beta_d=beta_d)
    assert abs(pc / TON_TO_N - 1368.90) < 1.0


def test_pc_sin_carga_sostenida():
    """betaD=0 -> EI maximo -> Pc = 2450 t (el doble que betaD=1)."""
    pc0, _ = critical_load(EC, IG, LU, beta_d=0.0)
    pc1, _ = critical_load(EC, IG, LU, beta_d=1.0)
    assert abs(pc0 / TON_TO_N - 2450.05) < 1.0
    assert math.isclose(pc0, 2 * pc1, rel_tol=1e-9)


def test_betad_se_satura_en_0_1():
    pc_neg, _ = critical_load(EC, IG, LU, beta_d=-5.0)
    pc_0, _ = critical_load(EC, IG, LU, beta_d=0.0)
    pc_big, _ = critical_load(EC, IG, LU, beta_d=99.0)
    pc_1, _ = critical_load(EC, IG, LU, beta_d=1.0)
    assert math.isclose(pc_neg, pc_0)
    assert math.isclose(pc_big, pc_1)


def test_radio_giro_rectangular():
    """r = sqrt(Ig/Ag) = h/sqrt(12) = 0.2887h (la norma permite 0.30h)."""
    r = radius_of_gyration(IG, AG)
    assert math.isclose(r, H / math.sqrt(12), rel_tol=1e-9)


def test_columna_de_la_plantilla_no_es_esbelta():
    """k*lu/r = 2.75/0.1155 = 23.8 < limite -> esbeltez despreciable, que es
    por que la plantilla reporta deltaNs=1.00 en los 11 combos."""
    r = radius_of_gyration(IG, AG)
    ratio = 1.0 * LU / r
    for name, m_ab, m_ar, _cm in COMBOS_CM:
        limite = slenderness_limit_nonsway(m_ab, m_ar)
        assert ratio < limite, f"{name}: {ratio} vs {limite}"


def test_deltans_es_1_en_los_11_combos_de_la_plantilla():
    """Reproduce la columna deltaNs de la plantilla (todos 1.00)."""
    axiales = {  # ton, del cuadro de combos
        "COMB1": 119.20, "COMB2": 107.84, "COMB3": 105.50, "COMB4": 75.84,
        "COMB5": 115.86, "COMB6": 67.95, "COMB7": 66.33, "COMB8": 107.98,
        "COMB9": 106.35, "COMB10": 36.47, "COMB11": 76.50,
    }
    for name, m_ab, m_ar, _cm in COMBOS_CM:
        res = magnify_nonsway(
            pu=axiales[name] * TON_TO_N,
            m_end_a=m_ab * TON_TO_N, m_end_b=m_ar * TON_TO_N,
            ec=EC, ig=IG, ag=AG, lu=LU, k=1.0, beta_d=0.8,
        )
        assert math.isclose(res["deltaNs"], 1.0, abs_tol=1e-9), f"{name}: {res['deltaNs']}"
        assert not res["isSlender"]


def test_columna_esbelta_si_magnifica():
    """Misma seccion pero mucho mas alta (lu=8 m) -> k*lu/r = 69 > limite."""
    res = magnify_nonsway(
        pu=60 * TON_TO_N, m_end_a=10 * TON_TO_N, m_end_b=10 * TON_TO_N,
        ec=EC, ig=IG, ag=AG, lu=8.0, k=1.0, beta_d=0.6,
    )
    assert res["isSlender"]
    assert res["applied"]
    assert res["deltaNs"] > 1.0
    assert res["mc"] > res["m2"]
    # Curvatura simple -> Cm = 1.0
    assert math.isclose(res["cm"], 1.0, abs_tol=1e-9)


def test_traccion_no_magnifica():
    res = magnify_nonsway(
        pu=-30 * TON_TO_N, m_end_a=10 * TON_TO_N, m_end_b=5 * TON_TO_N,
        ec=EC, ig=IG, ag=AG, lu=8.0,
    )
    assert math.isclose(res["deltaNs"], 1.0, abs_tol=1e-9)


def test_inestable_si_pu_supera_075pc():
    """Pu >= 0.75Pc -> no hay magnificador finito: se marca `unstable`, no se
    devuelve un numero grande arbitrario."""
    pc, _ = critical_load(EC, IG, LU, beta_d=1.0)
    res = magnify_nonsway(
        pu=pc, m_end_a=10 * TON_TO_N, m_end_b=10 * TON_TO_N,
        ec=EC, ig=IG, ag=AG, lu=LU, beta_d=1.0,
    )
    assert res["unstable"]
    assert not math.isfinite(res["deltaNs"])


def test_excentricidad_minima():
    """M2min = Pu*(0.015 + 0.03h) manda cuando el momento del analisis es
    menor (E.060 10.12.3.2)."""
    pu = 100 * TON_TO_N
    res = magnify_nonsway(
        pu=pu, m_end_a=0.05 * TON_TO_N, m_end_b=0.02 * TON_TO_N,
        ec=EC, ig=IG, ag=AG, lu=LU, h_dim=H,
    )
    esperado = pu * (0.015 + 0.03 * H)
    assert math.isclose(res["m2Min"], esperado, rel_tol=1e-9)
    assert math.isclose(res["m2Design"], esperado, rel_tol=1e-9)


def test_carga_transversal_fuerza_cm_1():
    res = magnify_nonsway(
        pu=60 * TON_TO_N, m_end_a=10 * TON_TO_N, m_end_b=-10 * TON_TO_N,
        ec=EC, ig=IG, ag=AG, lu=8.0, has_transverse_load=True,
    )
    assert math.isclose(res["cm"], 1.0, abs_tol=1e-9)


def test_excentricidad_minima_un_eje_por_vez():
    """La excentricidad accidental actua en UNA direccion, no en las dos a la
    vez. Aplicar el piso a los dos ejes inventa una demanda biaxial que no
    existe.

    Referencia: Column Element Details de ETABS (C7 Story1) — con
    Minimum M2 = Minimum M3 = 1.3294 t-m su diseno usa Mu2 = -1.3294 (el
    minimo) junto con Mu3 = -0.3831 (el factorado).
    """
    from design.column_slenderness import minimum_eccentricity_variants

    # Los dos ejes por debajo del minimo -> dos variantes distintas.
    v = minimum_eccentricity_variants(-1.3294, -0.1243, -1.3294, -0.3831)
    assert len(v) == 2
    assert (-1.3294, -0.3831) in v, "falta la variante que usa ETABS"
    assert (-0.1243, -1.3294) in v

    # Nunca el minimo en AMBOS a la vez.
    assert (-1.3294, -1.3294) not in v


def test_si_el_minimo_no_levanta_nada_hay_una_sola_variante():
    """Con los dos momentos por encima del minimo, con_min == sin_min en los
    dos ejes: no hay nada que decidir y se evalua una sola vez."""
    from design.column_slenderness import minimum_eccentricity_variants

    v = minimum_eccentricity_variants(-5.0, -5.0, -8.0, -8.0)
    assert v == [(-5.0, -8.0)]


def test_columna_no_esbelta_usa_el_momento_DE_SU_ESTACION():
    """Con delta_ns = 1 no hay magnificacion, asi que cada seccion se disena con
    SU PROPIO momento. `res["m2"]` es el MAYOR de los dos extremos — eso lo pide
    ACI 318 §6.6.4.5.2 solo para el caso ESBELTO, donde Mc = delta_ns*M2 aplica
    a todo el elemento.

    Referencia: Column Element Details de ETABS (C7 Story1, base). Su
    `NonSway Mns` vale -0.3831 (el momento DE LA BASE) con delta_ns = 1, aunque
    el tope de esa misma columna lleva 1.42.
    """
    T = 9806.65
    res = magnify_nonsway(
        pu=46.2555 * T, m_end_a=-0.3831 * T, m_end_b=1.42 * T,
        ec=217371 * 98066.5, ig=0.45 ** 4 / 12, ag=0.45 ** 2, lu=2.4,
        k=1.0, beta_d=0.0, h_dim=0.45,
    )
    assert not res["applied"], "esta columna no deberia dar esbelta"
    assert math.isclose(res["deltaNs"], 1.0)

    # m2 es el MAYOR de los extremos: correcto como dato, pero NO es lo que se
    # debe disenar en la base cuando la columna no es esbelta.
    assert math.isclose(res["m2"] / T, 1.42, abs_tol=1e-6)
