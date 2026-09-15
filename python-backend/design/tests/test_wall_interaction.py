# -*- coding: utf-8 -*-
"""Superficie P-M-M de una placa, contra la tabla Curve Data real de ETABS.

Misma seccion de referencia que test_wall_section (la SDSECTION "PL1" del
modelo `01.MODULO 01.e2k`), ahora emitida por wall_interaction en el formato de
las 24 curvas x 11 puntos. Tablas de los dos modos: "Exclude Phi" (nominal) e
"Include Phi", curva #1 (0 grados). Ver project-wall-design-module.
"""
import math
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))

from design.wall_interaction import superficie_pmm, tabla_curve_data
from design.wall_section import construir_seccion
from design.tests.test_wall_section import CATALOGO, FC, FY, PL1_SHAPES

# Curva #1 (0 grados) en modo "Exclude Phi": (P, M2, M3) en tonf y tonf-m.
NOMINAL_0 = [
    (1137.5872, -4.6226, 2.8237), (1137.5872, -26.2688, 108.1657),
    (1137.5872, -41.5453, 174.0460), (1089.6615, -57.4551, 229.0866),
    (981.9259, -74.5815, 275.0107), (862.4993, -93.5566, 313.4697),
    (748.3320, -110.6221, 331.7385), (629.9912, -125.6210, 328.5797),
    (488.8770, -133.6937, 302.0169), (144.0329, -74.0526, 187.4709),
    (-254.7092, 4.8278, -2.9490),
]

# La misma curva en modo "Include Phi" (los 10 primeros puntos).
CON_PHI_0 = [
    (739.4317, -3.0047, 1.8354), (739.4317, -17.0747, 70.3077),
    (739.4317, -27.0044, 113.1299), (708.2800, -37.3458, 148.9063),
    (638.2518, -48.4780, 178.7569), (560.6245, -60.8118, 203.7553),
    (520.4128, -80.6493, 226.4419), (480.2011, -100.4868, 249.1286),
    (439.9893, -120.3244, 271.8152), (129.6296, -66.6474, 168.7238),
]


# La seccion y cada superficie se arman UNA vez: los siete tests piden las
# mismas tres combinaciones y cada superficie son 24 curvas x 11 puntos sobre
# toda la malla.
#
# Malla 160. Medido sobre los 264 puntos contra la tabla de ETABS:
#     120 -> peor 0.0479 tonf-m (1.6 s)   <- roza la tolerancia de 0.05
#     160 -> peor 0.0401        (2.4 s)
#     200 -> peor 0.0345        (3.7 s)
# 120 pasa, pero deja el test a 0.002 de fallar por refinamiento de malla, que
# no es lo que este test tiene que vigilar.
_CACHE = {}


def _seccion():
    if "sec" not in _CACHE:
        _CACHE["sec"] = construir_seccion(PL1_SHAPES, CATALOGO, malla=160)
    return _CACHE["sec"]


def _superficie(modo="sin_phi", num_puntos=11):
    clave = (modo, num_puntos)
    if clave not in _CACHE:
        _CACHE[clave] = superficie_pmm(_seccion(), FC, FY, code="ACI318",
                                       tied=True, modo=modo, num_puntos=num_puntos)
    return _CACHE[clave]


def _dist(fila, etabs):
    _i, _p, m2, m3 = fila
    return math.hypot(m2 - etabs[1], m3 - etabs[2])


def test_las_curvas_se_rotulan_con_el_angulo_de_etabs():
    """0, 15, ... 345. El motor las calcula con theta = -angulo (la
    transposicion SD -> ejes locales invierte el sentido de giro)."""
    s = _superficie()
    assert [c["angleDeg"] for c in s["curves"]] == [15.0 * k for k in range(24)]
    assert s["numPuntos"] == 11


def test_curva_nominal_calza_con_etabs():
    """Los 11 puntos de la curva a 0 grados, sin interpolar nada."""
    filas = tabla_curve_data(_superficie("sin_phi"), 0)
    peor = max(_dist(f, e) for f, e in zip(filas, NOMINAL_0))
    assert peor < 0.05, "peor punto: %.4f tonf-m" % peor


def test_exclude_phi_conserva_el_tope_axial():
    """"Exclude Phi" saca phi pero NO el recorte 0.80*Po: el punto 1 de la tabla
    nominal de ETABS vale 1137.5872, que es 0.80*Po, no Po (1421.98)."""
    s = _superficie("sin_phi")
    p1 = s["curves"][0]["points"][0]["P"]
    assert math.isclose(p1, s["PnMax"], rel_tol=1e-9)
    assert not math.isclose(p1, s["Po"], rel_tol=1e-3)


def test_con_phi_calza_entero():
    """Los DIEZ puntos, incluidos el 7 y el 8, que son los que ETABS rellena con
    una recta (ver test_forzar_monotonia_es_lo_que_hace_etabs)."""
    filas = tabla_curve_data(_superficie("con_phi"), 0)
    peor = max(_dist(f, e) for f, e in zip(filas, CON_PHI_0))
    assert peor < 0.05, "peor punto: %.4f tonf-m" % peor


def test_forzar_monotonia_es_lo_que_hace_etabs():
    """SIN forzar la monotonia, los puntos 7 y 8 de la curva a 0 grados se van
    decenas de tonf-m: ahi la curva de diseño se dobla hacia atras (phi sube de
    0.65 a 0.90 mas rapido de lo que baja Pn) y ETABS rellena el tramo con una
    recta. Este test fija que la diferencia sea ESA y no otra cosa."""
    sin_arreglar = superficie_pmm(_seccion(), FC, FY, code="ACI318", tied=True,
                                  modo="con_phi", monotona=False)
    filas = tabla_curve_data(sin_arreglar, 0)
    difs = [_dist(f, e) for f, e in zip(filas, CON_PHI_0)]
    calzan = [i + 1 for i, d in enumerate(difs) if d < 0.05]
    assert calzan == [1, 2, 3, 4, 5, 6, 9, 10], calzan
    # Y los de ETABS son el tercio y los dos tercios exactos de la recta 6->9.
    p6, p9 = CON_PHI_0[5], CON_PHI_0[8]
    for k, esperado in ((1, CON_PHI_0[6]), (2, CON_PHI_0[7])):
        for eje in range(3):
            cuerda = p6[eje] + (p9[eje] - p6[eje]) * k / 3.0
            assert math.isclose(cuerda, esperado[eje], abs_tol=0.001)


def test_la_monotonia_no_toca_las_curvas_que_no_se_doblan():
    """En 180 y 270 grados P baja siempre, y ahi ETABS NO interpola: la curva
    tiene que salir igual con el arreglo prendido o apagado. Si el arreglo se
    comiera puntos buenos, esto lo agarra."""
    con = _superficie("con_phi")
    sin = superficie_pmm(_seccion(), FC, FY, code="ACI318", tied=True,
                         modo="con_phi", monotona=False)
    for curva in (12, 18):   # 180 y 270 grados
        for a, b in zip(con["curves"][curva]["points"], sin["curves"][curva]["points"]):
            assert math.isclose(a["P"], b["P"], rel_tol=1e-12)
            assert math.isclose(a["M3"], b["M3"], rel_tol=1e-12)


def test_el_numero_de_puntos_es_configurable():
    """La preferencia de ETABS admite cualquier impar >= 11; la regla reparte
    los intermedios con la mitad de arriba incluyendo el balanceado."""
    s = _superficie(num_puntos=15)
    assert s["numPuntos"] == 15
    assert len(s["curves"][0]["points"]) == 15


def test_fy_aumentado_sube_la_capacidad():
    """"Exclude Phi and Increase Fy" usa 1.25*fy (factor de resistencia
    probable). No hay tabla de ETABS de ese modo: solo se comprueba el sentido."""
    base = _superficie("sin_phi")
    subida = _superficie("sin_phi_fy_aumentado")
    assert subida["PnMax"] > base["PnMax"]
    m_base = max(abs(p["M3"]) for p in base["curves"][0]["points"])
    m_sub = max(abs(p["M3"]) for p in subida["curves"][0]["points"])
    assert m_sub > m_base
