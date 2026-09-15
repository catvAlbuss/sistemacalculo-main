# -*- coding: utf-8 -*-
"""Las ocho combinaciones de signo del aporte espectral (app._variantes_de_signo).

La salida de un espectro es toda POSITIVA: es una magnitud (CQC/SRSS) y no tiene
signo fisico. ETABS chequea todas las combinaciones de signo de esa parte y
disena para la peor — ocho para P, M2 y M3 en 3D (Shear Wall Design ACI 318-14,
seccion 1.3.7). Antes se evaluaban 2 de las 8 (las de signo uniforme, que son las
variantes _Max y _Min del combo).

DOS COSAS QUE SON FACILES DE HACER MAL Y ESTAN CUIDADAS ACA:

1. Cada componente lleva su PROPIO signo. Las ocho combinaciones del aporte
   espectral son independientes, no dos.

2. El signo de P NO se barre. Ahi el signo es FISICO (compresion/traccion) y
   voltearlo mueve el punto a la otra mitad del diagrama. Con P firme 40 y
   espectral 4, los unicos P posibles son 44 y 36 — nunca −44 ni −36. ETABS
   tampoco lo barre, y `_peor_signo` en design/tests/test_column_ratio.py —el
   test que reproduce su 0.301— tampoco.

Y ADEMAS EL CUADRANTE DE (M2, M3): 8 combinaciones espectrales x 4 cuadrantes
= 32 puntos.

    ESTE ARCHIVO AFIRMABA LO CONTRARIO HASTA 2026-09-01, con este argumento:
    "dar vuelta el total mueve tambien la gravedad, que si tiene signo fisico, y
    genera puntos que no existen". **El argumento sigue siendo cierto.** Hay dos
    convenciones y las dos se defienden:

      (a) FISICA: si la gravedad da M3 = +2.47 y lo espectral es ±2.56, los
          unicos M3 posibles son +5.03 y −0.09. Nunca negativo.
      (b) ETABS: barre los signos de las MAGNITUDES (Shear Wall Design
          ACI 318-14 §1.3.7) y evalua tambien cuadrantes que el combo no puede
          producir. Mas CONSERVADOR.

    Se eligio (b) porque el criterio de aceptacion del cliente es coincidir con
    ETABS dentro del 5-10 %. Medido en C2 de MODULO 01:

        convencion fisica    0.2636 vs 0.301 de ETABS   −12.4 %   FUERA
        convencion ETABS     0.2919 vs 0.301            − 3.1 %   dentro

    NO se cambio porque la fisica sea otra. Si algun dia el criterio deja de ser
    "calzar con ETABS", esta decision hay que revisarla — no es una verdad, es
    una eleccion de paridad, y solo se nota en secciones ASIMETRICAS (L, T).
"""

import math

import pytest

app = pytest.importorskip("app", reason="app.py necesita OpenSeesPy")

TONF = 9806.65


def _pt(p, m2, m3, spec_p=0.0, spec_m2=0.0, spec_m3=0.0):
    """Punto de demanda con su reparto firme/espectral, como lo manda el front."""
    return {
        "P": p + spec_p, "M2": m2 + spec_m2, "M3": m3 + spec_m3,
        "PFirm": p, "M2Firm": m2, "M3Firm": m3,
        "PSpec": spec_p, "M2Spec": spec_m2, "M3Spec": spec_m3,
    }


def test_sin_parte_espectral_devuelve_el_punto_tal_cual():
    """Un combo de pura gravedad no tiene nada que barrer."""
    v = app._variantes_de_signo(_pt(40.0, 5.0, 3.0))
    assert len(v) == 1
    p, m2, m3, _t2, _t3, etq = v[0]
    assert (p, m2, m3) == (40.0, 5.0, 3.0)
    assert etq is None, "sin barrido no se informa combinacion de signo"


def test_sin_el_reparto_no_cambia_nada():
    """Un payload viejo, o un caso suelto, siguen funcionando igual que antes."""
    v = app._variantes_de_signo({"P": 40.0, "M2": 5.0, "M3": 3.0})
    assert len(v) == 1
    assert v[0][:3] == (40.0, 5.0, 3.0)


def test_son_32_y_todas_distintas():
    """8 combinaciones espectrales x 4 cuadrantes de (M2, M3)."""
    v = app._variantes_de_signo(_pt(40.0, 1.0, 2.0, 4.0, 8.0, 6.0))
    assert len(v) == 32
    puntos = {(round(p, 9), round(m2, 9), round(m3, 9)) for p, m2, m3, _, _, _ in v}
    assert len(puntos) == 32, "cada componente lleva su propio signo, no dos"


def test_el_axial_NUNCA_se_da_vuelta():
    """La regla que SI sigue valiendo entera: la gravedad axial no se voltea.

    Con P firme 40 y espectral 4, los unicos P posibles son 44 y 36. Nunca -44
    ni -36: dar vuelta el axial inventaria una traccion que el combo no tiene y
    mandaria el punto a la otra mitad del diagrama de interaccion.
    """
    v = app._variantes_de_signo(_pt(40.0, 1.0, 2.0, 4.0, 8.0, 6.0))
    ps = sorted({round(p, 9) for p, _m2, _m3, _t2, _t3, _e in v})
    assert ps == [36.0, 44.0]


def test_los_momentos_SI_recorren_los_cuatro_cuadrantes():
    """Paridad con ETABS (ver la nota de arriba). M2 firme 1 y espectral 8 da
    {9, -7} por el aporte espectral, y sus negados {-9, 7} por el cuadrante."""
    v = app._variantes_de_signo(_pt(40.0, 1.0, 2.0, 4.0, 8.0, 6.0))
    m2s = sorted({round(m2, 9) for _p, m2, _m3, _t2, _t3, _e in v})
    assert m2s == [-9.0, -7.0, 7.0, 9.0]


def test_las_dos_de_signo_uniforme_son_las_que_ya_se_evaluaban():
    """_Max y _Min del combo estan entre las ocho: el barrido AGREGA, no cambia."""
    v = app._variantes_de_signo(_pt(40.0, 1.0, 2.0, 4.0, 8.0, 6.0))
    puntos = {(round(p, 9), round(m2, 9), round(m3, 9)) for p, m2, m3, _, _, _ in v}
    assert (44.0, 9.0, 8.0) in puntos       # todo sumado  (_Max)
    assert (36.0, -7.0, -4.0) in puntos     # todo restado (_Min)


def test_el_momento_del_otro_extremo_sigue_el_mismo_signo():
    """La esbeltez necesita el otro extremo del MISMO combo y del mismo signo.

    Es el mismo aporte espectral visto en la otra estacion: si M2 se toma con
    signo negativo, el M2 del tope tambien.
    """
    pt = _pt(40.0, 1.0, 2.0, 0.0, 8.0, 6.0)
    pt.update({"M2Top": 3.0, "M2TopFirm": 1.0, "M2TopSpec": 2.0,
               "M3Top": 5.0, "M3TopFirm": 2.0, "M3TopSpec": 3.0})
    for _p, m2, _m3, t2, _t3, _e in app._variantes_de_signo(pt):
        # m2 = q2*(1 + s2*8) y t2 = q2*(1 + s2*2): el mismo s2 Y el mismo
        # cuadrante q2 en los dos extremos. Se despejan de los dos valores
        # posibles de |m2| (9 o 7).
        esperados = {q2 * (1.0 + s2 * 2.0)
                     for s2 in (1, -1) for q2 in (1, -1)
                     if q2 * (1.0 + s2 * 8.0) == pytest.approx(m2)}
        assert any(t2 == pytest.approx(e) for e in esperados), (
            f"m2={m2} deberia venir con t2 en {esperados}, vino {t2}")


def test_la_etiqueta_dice_que_signo_es():
    v = dict((e, (p, m2, m3)) for p, m2, m3, _t2, _t3, e in
             app._variantes_de_signo(_pt(40.0, 0.0, 0.0, 4.0, 8.0, 6.0)))
    assert v["+P+M2+M3"] == (44.0, 8.0, 6.0)
    assert v["-P-M2-M3"] == (36.0, -8.0, -6.0)
    assert v["+P-M2+M3"] == (44.0, -8.0, 6.0)


def test_en_una_L_el_barrido_puede_cambiar_el_gobernante():
    """Para eso se hizo: en una seccion asimetrica la DIRECCION importa.

    No se afirma cuanto sube el ratio —depende del reparto real de cada combo—
    sino que el barrido corre y elige una combinacion de signo, y que la que
    gana no tiene por que ser la de magnitudes maximas.
    """
    geo = {"shape": "L", "b": 0.70, "h": 0.70, "flangeThick": 0.30,
           "webThick": 0.30, "fc": 2100 * TONF, "fy": 42000 * TONF,
           "cover": 0.0425 - 0.010, "barDiameter": 0.020, "n3": 4, "n2": 4,
           "barArea": math.pi * 0.020 ** 2 / 4, "confineBarDiameter": 0.0,
           "code": "ACI318", "tied": True}
    pt = _pt(40.0 * TONF, 0.9 * TONF, 0.54 * TONF,
             0.0, 8.15 * TONF, 4.87 * TONF)
    r = app._run_column_interaction({**geo, "demandPoints": [pt]})
    ch = r["demandChecks"][0]

    assert ch.get("signCombo"), "tenia que informar que signo gobierna"
    assert ch["ratio"] > 0
    # El P no tiene parte espectral, asi que no se puede mover.
    assert ch["PDesign"] == pytest.approx(40.0 * TONF)
    # Y el M2/M3 de diseno son firme +- espectral, no el total sin tocar.
    assert abs(ch["M2Design"]) == pytest.approx(9.05 * TONF, rel=1e-6) or \
           abs(ch["M2Design"]) == pytest.approx(7.25 * TONF, rel=1e-6)
