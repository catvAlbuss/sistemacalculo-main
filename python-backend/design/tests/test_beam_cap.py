"""Tope por resistencia de las VIGAS del nudo en el corte de columna
(ACI 318 §18.7.6.1.1 in fine). Referencia: modelo real comparado contra ETABS
(2026-08-18) — columna C45x45 con 12 varillas, donde ETABS reporta
V Major = 9.75 t y nuestro Ve por Mpr de columna daba 26 t."""
import math
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))

from design.column_shear import column_shear_design

KG = 98066.5
T = 9806.65

BASE = dict(
    b=0.45, h=0.45, fc=210 * KG, fy=4283 * KG, cover=0.04, bar_diameter=0.020,
    n3=3, n2=5, bar_area=314e-6, fyt=4283 * KG, confine_bar_area=78.5e-6,
    confine_bar_diameter=0.010, confine_bar_spacing=0.15,
    num_confine_bars2=3, num_confine_bars3=3,
    clear_height=2.4, axial_min=5 * T, axial_max=46 * T,
    vu_analysis2=1.26 * T, vu_analysis3=0.59 * T, code="ACI318",
)


def test_sin_dato_no_aplica_tope():
    """Sin `joint_beam_moment` el comportamiento no cambia: Ve lo gobierna el
    Mpr de la columna (lado conservador)."""
    r = column_shear_design(**BASE)["shearV2"]
    assert r["veBeams"] is None
    assert r["beamCapApplied"] is False
    assert math.isclose(r["veCapacity"], r["veColumn"], rel_tol=1e-9)


def test_tope_reduce_ve():
    """Dos extremos con vigas (columna de piso intermedio): Ve = (M+M)/Hn."""
    jbm = {"3": {"top": 11.7 * T, "bot": 11.7 * T}, "2": {"top": 11.7 * T, "bot": 11.7 * T}}
    r = column_shear_design(**BASE, joint_beam_moment=jbm)["shearV2"]
    assert r["beamCapApplied"] is True
    assert math.isclose(r["veBeams"] / T, 9.75, abs_tol=0.02)
    assert math.isclose(r["ve"] / T, 9.75, abs_tol=0.02)
    # Y el tope efectivamente baja respecto del Mpr de columna
    assert r["veBeams"] < r["veColumn"]


def test_tope_nunca_baja_del_corte_del_analisis():
    """La norma permite bajar Ve hasta lo que dan las vigas, pero NUNCA por
    debajo del cortante factorado del analisis."""
    vu = 20.0 * T
    jbm = {"3": {"top": 1.0 * T, "bot": 1.0 * T}, "2": {"top": 1.0 * T, "bot": 1.0 * T}}
    args = {**BASE, "vu_analysis2": vu}
    r = column_shear_design(**args, joint_beam_moment=jbm)["shearV2"]
    assert r["veBeams"] < vu          # el tope por vigas es chico
    assert math.isclose(r["ve"], vu)  # pero manda el analisis


def test_tope_mas_alto_que_la_columna_no_hace_nada():
    """Si las vigas son MAS fuertes que la columna, el tope no aplica: Ve lo
    sigue gobernando el Mpr de la columna."""
    jbm = {"3": {"top": 500 * T, "bot": 500 * T}, "2": {"top": 500 * T, "bot": 500 * T}}
    r = column_shear_design(**BASE, joint_beam_moment=jbm)["shearV2"]
    assert r["beamCapApplied"] is False
    assert math.isclose(r["veCapacity"], r["veColumn"], rel_tol=1e-9)


def test_direcciones_independientes():
    """El tope de una direccion no debe afectar la otra."""
    jbm = {"3": {"top": 11.7 * T, "bot": 11.7 * T}}  # solo eje 3 (V2)
    res = column_shear_design(**BASE, joint_beam_moment=jbm)
    assert res["shearV2"]["beamCapApplied"] is True
    assert res["shearV3"]["veBeams"] is None
    assert res["shearV3"]["beamCapApplied"] is False


def test_ceros_equivalen_a_sin_dato():
    jbm = {"3": {"top": 0.0, "bot": 0.0}, "2": {"top": 0.0, "bot": 0.0}}
    r = column_shear_design(**BASE, joint_beam_moment=jbm)["shearV2"]
    assert r["veBeams"] is None
    assert r["beamCapApplied"] is False


def test_extremo_sin_vigas_aporta_cero():
    """La BASE de una columna del primer piso no tiene vigas: aporta 0, no el
    Mpr de la columna.

    Es la convencion de ETABS (adoptada 2026-08-18 por decision del usuario).
    El texto de ACI, leido al pie de la letra, diria que ese extremo no esta
    limitado por ningun nudo y desarrolla el Mpr de la columna; ETABS pone
    cero y es lo que se sigue."""
    solo_arriba = {"3": {"top": 14.61 * T, "bot": 0.0}, "2": {"top": 14.61 * T, "bot": 0.0}}
    r = column_shear_design(**BASE, joint_beam_moment=solo_arriba)["shearV2"]
    assert math.isclose(r["veBeams"], 14.61 * T / BASE["clear_height"], rel_tol=1e-9)
    assert math.isclose(r["veBeams"] / T, 6.09, abs_tol=0.01)


def test_cuantizacion_por_numero_de_vigas_como_etabs():
    """La firma que confirmo la formula: en el modelo de referencia los Ve de
    ETABS salen EXACTAMENTE cuantizados por numero de vigas (4.873 t con una,
    9.7461 t con dos, relacion 2.0000). Eso solo pasa si la base aporta cero y
    no hay reparto de nudo."""
    una = {"3": {"top": 14.61 * T, "bot": 0.0}}
    dos = {"3": {"top": 2 * 14.61 * T, "bot": 0.0}}
    v1 = column_shear_design(**BASE, joint_beam_moment=una)["shearV2"]["veBeams"]
    v2 = column_shear_design(**BASE, joint_beam_moment=dos)["shearV2"]["veBeams"]
    assert math.isclose(v2 / v1, 2.0, rel_tol=1e-12)


def test_relacion_125_con_etabs_es_esperada():
    """Usamos Mpr (1.25*fy, lo que dice ACI 318 §18.7.6.1.1); ETABS usa Mn
    (fy). Consecuencia conocida y aceptada: nuestro Ve es 1.25x el suyo.

    Viga V30x60 al acero minimo (As=542 mm2, f'c=210, fy=4200, d=54):
    Mn = 11.81 t-m -> ETABS reporta 11.81/2.4 = 4.873 t
    Mpr = 14.61 t-m -> nosotros 14.61/2.4 = 6.09 t

    El factor real es 1.237, no 1.250 exacto: el 1.25 va sobre fy, pero al
    subir la fuerza del acero el bloque de compresion crece y el brazo interno
    (d - a/2) se acorta, asi que el momento sube algo menos que 1.25."""
    ve_etabs = 11.81 * T / BASE["clear_height"]
    jbm = {"3": {"top": 14.61 * T, "bot": 0.0}}
    ve_nuestro = column_shear_design(**BASE, joint_beam_moment=jbm)["shearV2"]["veBeams"]
    assert math.isclose(ve_nuestro / ve_etabs, 1.237, rel_tol=0.01)
    # Y contra el valor medido en ETABS (4.873 t), no solo contra el teorico.
    assert math.isclose(ve_nuestro / T / 4.873, 1.25, rel_tol=0.02)


def test_ambos_extremos_se_acotan_por_el_mpr_de_la_columna():
    """Una viga mas fuerte que la columna no puede EXIGIRLE mas momento del que
    la columna es capaz de dar: cada extremo se acota por Mpr de columna."""
    r_ref = column_shear_design(**BASE)["shearV2"]
    mpr = r_ref["mpr"]
    jbm = {"3": {"top": 10 * mpr, "bot": 0.5 * mpr}, "2": {"top": 10 * mpr, "bot": 0.5 * mpr}}
    r = column_shear_design(**BASE, joint_beam_moment=jbm)["shearV2"]
    assert math.isclose(r["veBeams"], (mpr + 0.5 * mpr) / BASE["clear_height"], rel_tol=1e-9)
