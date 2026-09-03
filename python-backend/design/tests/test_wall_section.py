# -*- coding: utf-8 -*-
"""Seccion de placa del Section Designer, contra la tabla real de ETABS.

Referencia externa: SDSECTION "PL1" del modelo `01.MODULO 01.e2k` (placa en L,
D=1.5 B=1.0 TF=TW=0.30, f'c=210, fy=4200) y su tabla "Curve Data" del dialogo
Interaction Surface, curva #1 (0 grados) en modo **Exclude Phi** (nominal).

Las shapes de abajo son las lineas del .e2k tal cual, normalizadas a dict. La
tabla es la que exporta ETABS. Ver project-wall-design-module.
"""
import math
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))

from design.column_interaction import ECU, beta1_from_fc, compute_pn_mn_at, es_steel_for_code
from design.wall_section import construir_seccion

KG = 98066.5
T = 9806.65
FC, FY = 210 * KG, 4200 * KG

CATALOGO = {"#4": 0.000129032, "#5": 0.0001999996}

PL1_SHAPES = [
    {"shapeType": 'CONC L', "D": 1.5, "B": 1.0, "TF": 0.3, "TW": 0.3, "XC": 0.0, "YC": 0.0},
    {"shapeType": 'REBAR', "barSize": '#5', "XC": -0.4346, "YC": -0.6846},
    {"shapeType": 'REBAR', "barSize": '#5', "XC": -0.2654, "YC": -0.6846},
    {"shapeType": 'REBAR', "barSize": '#5', "XC": 0.4346, "YC": 0.6846},
    {"shapeType": 'REBAR', "barSize": '#5', "XC": 0.4346, "YC": 0.51540005},
    {"shapeType": 'REBAR', "barSize": '#5', "XC": -0.43459997, "YC": 0.6846},
    {"shapeType": 'REBAR', "barSize": '#5', "XC": -0.43459997, "YC": 0.51540005},
    {"shapeType": 'REBAR', "barSize": '#5', "XC": -0.26574206, "YC": 0.51637167},
    {"shapeType": 'REBAR', "barSize": '#5', "XC": -0.26574206, "YC": 0.6848707},
    {"shapeType": 'REBAR', "barSize": '#5', "XC": -0.14757994, "YC": 0.68201864},
    {"shapeType": 'REBAR', "barSize": '#5', "XC": -0.15158354, "YC": 0.5138669},
    {"shapeType": 'REBAR', "barSize": '#5', "XC": 0.3228445, "YC": 0.68402046},
    {"shapeType": 'REBAR', "barSize": '#5', "XC": 0.20073433, "YC": 0.6860222},
    {"shapeType": 'REBAR', "barSize": '#5', "XC": 0.20073433, "YC": 0.5158687},
    {"shapeType": 'REBAR', "barSize": '#5', "XC": 0.3188409, "YC": 0.5138669},
    {"shapeType": 'LINE REBAR', "barSize": '#4', "spacing": 0.15, "endBar": 'NO', "X1": -0.14757994, "Y1": 0.68201864, "X2": 0.20073433, "Y2": 0.6860222},
    {"shapeType": 'LINE REBAR', "barSize": '#4', "spacing": 0.15, "endBar": 'NO', "X1": -0.15158354, "Y1": 0.5138669, "X2": 0.20073433, "Y2": 0.5158687},
    {"shapeType": 'REBAR', "barSize": '#5', "XC": -0.43204582, "YC": -0.562418},
    {"shapeType": 'REBAR', "barSize": '#5', "XC": -0.26671144, "YC": -0.5566168},
    {"shapeType": 'REBAR', "barSize": '#5', "XC": -0.26091024, "YC": -0.42028844},
    {"shapeType": 'REBAR', "barSize": '#5', "XC": -0.43784702, "YC": -0.42318904},
    {"shapeType": 'REBAR', "barSize": '#5', "XC": -0.26091024, "YC": 0.40348274},
    {"shapeType": 'REBAR', "barSize": '#5', "XC": -0.43494642, "YC": 0.40058213},
    {"shapeType": 'LINE REBAR', "barSize": '#4', "spacing": 0.11768232, "endBar": 'NO', "X1": -0.43784702, "Y1": -0.42318904, "X2": -0.43494642, "Y2": 0.40058213},
    {"shapeType": 'LINE REBAR', "barSize": '#4', "spacing": 0.11768159, "endBar": 'NO', "X1": -0.26091024, "Y1": -0.42028844, "X2": -0.26091024, "Y2": 0.40348274},
]

# Curva #1 (0 grados), Exclude Phi: (P, M2, M3) en tonf y tonf-m.
ETABS_NOMINAL_0 = [
    (1137.5872, -4.6226, 2.8237), (1137.5872, -26.2688, 108.1657),
    (1137.5872, -41.5453, 174.0460), (1089.6615, -57.4551, 229.0866),
    (981.9259, -74.5815, 275.0107), (862.4993, -93.5566, 313.4697),
    (748.3320, -110.6221, 331.7385), (629.9912, -125.6210, 328.5797),
    (488.8770, -133.6937, 302.0169), (144.0329, -74.0526, 187.4709),
    (-254.7092, 4.8278, -2.9490),
]


def _seccion():
    return construir_seccion(PL1_SHAPES, CATALOGO)


def test_geometria_y_armado():
    """Area del contorno, cantidad de varillas y acero total."""
    s = _seccion()
    assert s["avisos"] == [], s["avisos"]
    # L de 1.5 x 1.0 con alas de 0.30: 1.5*1.0 - 1.2*0.7
    assert math.isclose(s["Ag"], 0.66, abs_tol=1e-6)
    # 20 varillas #5 sueltas + 16 #4 en cuatro lineas (2 + 2 + 6 + 6)
    assert len(s["bars"]) == 36
    assert math.isclose(s["As"] * 1e4, 60.645, abs_tol=0.01)


def test_el_espejo_se_deduce_de_las_varillas():
    """El .e2k no exporta MIRROR2/MIRROR3 de una SDSECTION: se deduce, y la
    orientacion correcta contiene a TODAS las varillas."""
    from design.column_polygon import point_in_polygon
    s = _seccion()
    contorno = s["piezas"][0]
    assert all(point_in_polygon(contorno, u, v) for u, v, _a in s["bars"])


def test_centroide_no_es_el_centro_de_la_caja():
    """En una L estan a 0.19 m: sin trasladar, la compresion pura arrastraria
    un momento espurio y el punto 1 de ETABS no calzaria."""
    cu, cv = _seccion()["centroide"]
    assert math.hypot(cu, cv) > 0.15


def _once_puntos(s):
    """Los 11 puntos de ETABS: dos series de pasos iguales en c que se juntan en
    el balanceado. Ver la regla en project-wall-design-module."""
    beta1 = beta1_from_fc(FC)
    eps_y = FY / es_steel_for_code("ACI318")
    fib, bars = s["fibers"], s["bars"]
    du = s["fiber_du"]

    # theta = 0: flexion sobre el eje 2 (u). El motor mide xi = u en esa direccion.
    xi_max = max(u for u, _v, _a in fib) + du / 2.0
    dt = xi_max - min(u for u, _v, _a in bars)
    h = xi_max - (min(u for u, _v, _a in fib) - du / 2.0)
    cb = ECU / (ECU + eps_y) * dt
    cmax = h / beta1

    kw = dict(code="ACI318", gross_area=s["Ag"], tied=True,
              fiber_dx=s["fiber_du"], fiber_dy=s["fiber_dv"])
    cs = ([1e4]
          + [cb + (cmax - cb) * k / 5 for k in (4, 3, 2, 1, 0)]
          + [cb * k / 5 for k in (4, 3, 2, 1)])
    pts = []
    for c in cs:
        p = compute_pn_mn_at(FC, FY, fib, bars, 0.0, 0.0, c, beta1, **kw)
        pts.append((p["Pn"] / T, p["M2n"] / T, p["M3n"] / T))
    # Punto 11, traccion pura: F = -fy*a  ->  M2 = -F*v,  M3 = F*u
    ast = sum(a for _u, _v, a in bars)
    pts.append((-FY * ast / T,
                FY * sum(a * v for _u, v, a in bars) / T,
                -FY * sum(a * u for u, _v, a in bars) / T))
    return pts


def test_curva_nominal_calza_con_etabs():
    """Los 11 puntos de la curva a 0 grados, sin interpolar nada."""
    nuestros = _once_puntos(_seccion())
    peor = max(math.hypot(o[1] - e[1], o[2] - e[2])
               for o, e in zip(nuestros, ETABS_NOMINAL_0))
    assert peor < 0.05, "peor punto: %.4f tonf-m" % peor


def test_los_extremos_son_exactos():
    """Tope 0.80*Po y traccion pura: dependen solo de Ag, As, f'c y fy, asi que
    si estos dos calzan a 4 decimales, la geometria y el armado estan bien."""
    p = _once_puntos(_seccion())
    assert math.isclose(p[0][0], 1137.5872, abs_tol=0.001)
    assert math.isclose(p[-1][0], -254.7092, abs_tol=0.001)

PL2_SHAPES = [
    {"shapeType": 'CONC L', "D": 1.0, "B": 0.6, "TF": 0.3, "TW": 0.3, "XC": 0.0, "YC": 0.0},
    {"shapeType": 'REBAR', "barSize": '#5', "XC": -0.23459998, "YC": 0.4346},
    {"shapeType": 'REBAR', "barSize": '#5', "XC": 0.23460001, "YC": 0.4346},
    {"shapeType": 'REBAR', "barSize": '#5', "XC": 0.23460001, "YC": 0.2654},
    {"shapeType": 'REBAR', "barSize": '#5', "XC": -0.23459998, "YC": 0.2654},
    {"shapeType": 'REBAR', "barSize": '#5', "XC": -0.23460001, "YC": -0.4346},
    {"shapeType": 'REBAR', "barSize": '#5', "XC": -0.065400004, "YC": -0.4346},
    {"shapeType": 'REBAR', "barSize": '#5', "XC": -0.06544514, "YC": 0.43384048},
    {"shapeType": 'REBAR', "barSize": '#5', "XC": -0.06544514, "YC": 0.26608214},
    {"shapeType": 'LINE REBAR', "barSize": '#5', "spacing": 0.15, "endBar": 'NO', "X1": -0.06544514, "Y1": 0.43384048, "X2": 0.23460001, "Y2": 0.4346},
    {"shapeType": 'LINE REBAR', "barSize": '#5', "spacing": 0.15, "endBar": 'NO', "X1": -0.06544514, "Y1": 0.26608214, "X2": 0.23460001, "Y2": 0.2654},
    {"shapeType": 'REBAR', "barSize": '#5', "XC": -0.23636363, "YC": -0.3181818},
    {"shapeType": 'REBAR', "barSize": '#5', "XC": -0.06545454, "YC": -0.3181818},
    {"shapeType": 'REBAR', "barSize": '#5', "XC": -0.06727273, "YC": -0.20363636},
    {"shapeType": 'REBAR', "barSize": '#5', "XC": -0.23454545, "YC": -0.20727272},
    {"shapeType": 'REBAR', "barSize": '#5', "XC": -0.23272727, "YC": 0.14727272},
    {"shapeType": 'REBAR', "barSize": '#5', "XC": -0.061818182, "YC": 0.14545454},
    {"shapeType": 'LINE REBAR', "barSize": '#4', "spacing": 0.15, "endBar": 'NO', "X1": -0.23272727, "Y1": 0.14727272, "X2": -0.23454545, "Y2": -0.20727272},
    {"shapeType": 'LINE REBAR', "barSize": '#4', "spacing": 0.15, "endBar": 'NO', "X1": -0.061818182, "Y1": 0.14545454, "X2": -0.06727273, "Y2": -0.20363636},
]

PL3_SHAPES = [
    {"shapeType": 'CONC L', "D": 1.5, "B": 0.5, "TF": 0.3, "TW": 0.3, "XC": 0.0, "YC": 0.0},
    {"shapeType": 'REBAR', "barSize": '#5', "XC": -0.18459998, "YC": 0.6846},
    {"shapeType": 'REBAR', "barSize": '#5', "XC": 0.18460001, "YC": 0.6846},
    {"shapeType": 'REBAR', "barSize": '#5', "XC": 0.18460001, "YC": 0.51540005},
    {"shapeType": 'REBAR', "barSize": '#5', "XC": -0.18459998, "YC": 0.51540005},
    {"shapeType": 'REBAR', "barSize": '#5', "XC": -0.014603174, "YC": 0.68588287},
    {"shapeType": 'REBAR', "barSize": '#5', "XC": -0.013606637, "YC": 0.51547486},
    {"shapeType": 'REBAR', "barSize": '#5', "XC": -0.18460001, "YC": -0.6846},
    {"shapeType": 'REBAR', "barSize": '#5', "XC": -0.0154, "YC": -0.6846},
    {"shapeType": 'REBAR', "barSize": '#5', "XC": -0.18617697, "YC": -0.5662828},
    {"shapeType": 'REBAR', "barSize": '#5', "XC": -0.014679943, "YC": -0.5662828},
    {"shapeType": 'REBAR', "barSize": '#5', "XC": -0.014679943, "YC": -0.44401178},
    {"shapeType": 'REBAR', "barSize": '#5', "XC": -0.1830011, "YC": -0.44401178},
    {"shapeType": 'REBAR', "barSize": '#5', "XC": -0.18567348, "YC": 0.39476824},
    {"shapeType": 'REBAR', "barSize": '#5', "XC": -0.014655929, "YC": 0.3969608},
    {"shapeType": 'LINE REBAR', "barSize": '#4', "spacing": 0.104848035, "endBar": 'NO', "X1": -0.1830011, "Y1": -0.44401178, "X2": -0.18567348, "Y2": 0.39476824},
    {"shapeType": 'LINE REBAR', "barSize": '#4', "spacing": 0.105121575, "endBar": 'NO', "X1": -0.014655929, "Y1": 0.3969608, "X2": -0.014679943, "Y2": -0.44401178},
]


# ── PL2 y PL3: la segunda y tercera seccion, que destaparon el bug de la
# tolerancia y acotaron lo que todavia no cierra ─────────────────────────────
#
# Las dos tablas Curve Data que paso el ingeniero estan en modo "Include Phi".
# De sus DOS extremos (punto 1 = 0.65*0.80*Po y punto 11 = 0.90*(-fy*As)) se
# despeja el acero total, y los dos coinciden: PL2 37.16 cm2, PL3 46.06 cm2.

def test_pl3_calza_exacto():
    """Tercera seccion, independiente de PL1: area, acero y el punto de traccion
    pura (P, M2 y M3) contra la tabla de ETABS."""
    s = construir_seccion(PL3_SHAPES, CATALOGO, malla=120)
    assert math.isclose(s["Ag"], 0.51, abs_tol=1e-6)
    assert math.isclose(s["As"] * 1e4, 46.06, abs_tol=0.02)
    p, m2, m3 = _traccion_pura(s)
    assert math.isclose(p, -174.1235, abs_tol=0.01)
    assert math.isclose(m2, -0.7560, abs_tol=0.01)
    assert math.isclose(m3, 6.3500, abs_tol=0.01)


def test_pl2_area_y_acero():
    """PL2 es la que destapo el bug: sus dos LINE REBAR #5 dan L/sp = 2.00031 y
    con la tolerancia ABSOLUTA anterior salian 3 intervalos en vez de 2, o sea
    dos varillas #5 de mas (As 41.16 en vez de 37.16 cm2)."""
    s = construir_seccion(PL2_SHAPES, CATALOGO, malla=120)
    assert math.isclose(s["Ag"], 0.39, abs_tol=1e-6)
    assert math.isclose(s["As"] * 1e4, 37.16, abs_tol=0.02)
    p, _m2, m3 = _traccion_pura(s)
    assert math.isclose(p, -140.4694, abs_tol=0.01)
    assert math.isclose(m3, 3.0301, abs_tol=0.01)


def test_pl2_tiene_una_brecha_conocida_en_m2():
    """ABIERTO. En PL2 el M2 de traccion pura sale -0.33 y ETABS reporta +1.94.
    La diferencia equivale a 16 mm en la coordenada v del centroide del
    contorno: el `u` calza exacto, el area calza, el acero calza y el M3 calza.
    Ninguna combinacion (TF, TW) con el area confirmada reproduce ese centroide,
    asi que NO es una mala lectura de los parametros de la L.

    Este test FIJA la brecha para que se note si cambia. Falta el dato que la
    cierra: contar en la ventana del Section Designer cuantas varillas pone
    ETABS sobre esas dos lineas de #5 de 0.30 m."""
    s = construir_seccion(PL2_SHAPES, CATALOGO, malla=120)
    _p, m2, _m3 = _traccion_pura(s)
    assert abs(m2 - 1.9363) < 2.5


def test_la_tolerancia_de_la_linea_es_relativa():
    """El cociente cae apenas encima del entero porque el .e2k redondea las
    coordenadas. 2.00031 tiene que dar 2 intervalos, y 2.32 tiene que dar 3."""
    from design.wall_section import _cuantas_barras
    assert len(_cuantas_barras(0.30005, 0.15, False)) == 1      # 2.00031 -> 2 intervalos
    assert len(_cuantas_barras(0.34834, 0.15, False)) == 2      # 2.32    -> 3 intervalos
    assert len(_cuantas_barras(0.82378, 0.117682, False)) == 6  # 7.00000 -> 7 intervalos


def _traccion_pura(s):
    """Punto 11 en tonf: P = 0.90*(-fy*As), M2 = 0.90*fy*sum(a*v), M3 = -idem*u."""
    T = 9806.65
    ast = sum(a for _u, _v, a in s["bars"])
    return (-0.9 * FY * ast / T,
            0.9 * FY * sum(a * v for _u, v, a in s["bars"]) / T,
            -0.9 * FY * sum(a * u for u, _v, a in s["bars"]) / T)


# ── POLYGON y RECT REBAR: los caminos de las secciones tipo PIER ─────────────
# Las tres secciones "PIER" del MODULO 01 (PLACA L, Placa 1, Placa 2) usan un
# POLYGON libre en vez de una L parametrica, y jaulas RECT REBAR en vez de
# varillas sueltas. Este fixture es a mano para poder verificarlo a mano.

RECTANGULO_CON_JAULA = [
    # Contorno: rectangulo 1.00 (en Y) x 0.40 (en X), centrado en el origen.
    {"shapeType": "POLYGON", "corners": [
        {"X": -0.20, "Y": -0.50}, {"X": 0.20, "Y": -0.50},
        {"X": 0.20, "Y": 0.50}, {"X": -0.20, "Y": 0.50}]},
    # Jaula de elemento de borde: 0.30 (D, sobre Y) x 0.20 (B, sobre X).
    {"shapeType": "RECT REBAR", "D": 0.30, "B": 0.20, "XC": 0.0, "YC": 0.35,
     "edges": [{"size": "#4", "spacing": 0.10}] * 4,
     "corners": [{"size": "#5"}] * 4,
     "tieBarArea": 7.1e-05},
]


def test_poligono_libre_y_jaula_rectangular():
    """Un POLYGON de area conocida y una RECT REBAR que se puede contar a mano:
    4 esquinas + los lados repartidos por espaciamiento maximo.

    Lados de la jaula: los de 0.30 dan ceil(0.30/0.10) = 3 intervalos -> 2
    varillas interiores cada uno; los de 0.20 dan 2 intervalos -> 1 cada uno.
    Total 4 + 2 + 2 + 1 + 1 = 10 varillas."""
    s = construir_seccion(RECTANGULO_CON_JAULA, CATALOGO, malla=120)
    assert s["avisos"] == [], s["avisos"]
    assert len(s["bars"]) == 10
    assert math.isclose(s["As"], 4 * CATALOGO["#5"] + 6 * CATALOGO["#4"], rel_tol=1e-9)


def test_una_sola_pieza_usa_el_area_exacta():
    """Con UNA pieza no puede haber solape, asi que Ag es el area del poligono y
    no la estimacion de la malla — que trae 1-2% de sesgo de muestreo. Medido en
    `Placa 1` del MODULO 01: 0.7814 (malla) contra 0.7950 (exacta), y ese 1.7%
    entraba derecho en Po."""
    s = construir_seccion(RECTANGULO_CON_JAULA, CATALOGO, malla=37)  # malla fea a proposito
    assert math.isclose(s["Ag"], 0.40, abs_tol=1e-9)


# ── El maximo de espaciamiento de ETABS no es estricto ───────────────────────
# Medido moviendo el extremo de la LINE REBAR #5 de la PL2 dentro de ETABS
# (sp_max = 0.15). Sin tolerancia, alargar la linea un milimetro ya metia una
# varilla de mas y el editor parecia inventar armado.

LINEA_PL2 = dict(x1=-0.06545, y1=0.43384, y2=0.4346, espaciamiento=0.15)


def _varillas_con_x2(x2):
    from design.wall_section import barras_en_linea
    return len(barras_en_linea(LINEA_PL2["x1"], LINEA_PL2["y1"], x2, LINEA_PL2["y2"],
                               LINEA_PL2["espaciamiento"], 2.0e-4))


def test_el_maximo_de_espaciamiento_tolera_pasarse():
    """L/sp = 2.0670 sigue dando UNA varilla (espaciamiento real 0.15503, un
    3.35% por encima del maximo) y recien con 2.1003 aparece la segunda."""
    assert _varillas_con_x2(0.2346) == 1   # L/sp = 2.0003, el original
    assert _varillas_con_x2(0.2446) == 1   # L/sp = 2.0670
    assert _varillas_con_x2(0.2496) == 2   # L/sp = 2.1003


def test_la_tolerancia_no_mueve_el_armado_de_pl1():
    """La tolerancia es un cambio de criterio en un borde: tiene que dejar
    intacto el armado de las secciones ya validadas contra ETABS."""
    s = construir_seccion(PL1_SHAPES, CATALOGO, malla=60)
    assert len(s["bars"]) == 36
    assert math.isclose(s["As"] * 1e4, 60.645, abs_tol=0.01)


def test_piezas_que_se_solapan_usan_el_area_y_el_centroide_de_la_union():
    """Dibujar una L con dos rectangulos que comparten la esquina es normal. Ahi
    la suma de areas cuenta la esquina dos veces, y el centroide pesado tambien:
    los dos tienen que salir de la malla, que es la unica que ve la union."""
    L_CON_DOS_RECTANGULOS = [
        # Alma: 0.30 (X) x 1.00 (Y), pegada a la izquierda.
        {"shapeType": "CONC RECTANGULAR", "D": 1.00, "B": 0.30, "XC": -0.15, "YC": 0.0},
        # Ala: 1.00 (X) x 0.30 (Y) arriba; comparte 0.30 x 0.30 con el alma.
        {"shapeType": "CONC RECTANGULAR", "D": 0.30, "B": 1.00, "XC": 0.20, "YC": 0.35},
        {"shapeType": "REBAR", "barSize": "#5", "XC": -0.15, "YC": 0.0},
    ]
    s = construir_seccion(L_CON_DOS_RECTANGULOS, CATALOGO, malla=200)
    # Union real = 0.30*1.00 + 1.00*0.30 - 0.30*0.30(compartido) = 0.51
    assert abs(s["Ag"] - 0.51) < 0.01, s["Ag"]
    assert any("solapan" in a for a in s["avisos"]), s["avisos"]
    # Y el centroide sale de la union. Valor ANALITICO: partiendo la union en
    # alma-sin-solape (0.21 m2, cg SD (-0.15, -0.15)) y ala entera (0.30 m2,
    # cg (0.20, 0.35)), da SD (0.05588, 0.14412) -> local (u, v) = (Y, X).
    # El promedio pesado de las dos piezas SIN descontar el solape daria
    # (0.175, 0.025): 3 cm de diferencia, y de ahi sale derecho al momento.
    cu, cv = s["centroide"]
    assert abs(cu - 0.14412) < 1e-4, cu
    assert abs(cv - 0.05588) < 1e-4, cv


# ── Formas nuevas: circulo, varillas en circulo, rotacion y espejo por shape ─

def test_circulo_tiene_area_exacta():
    """El circulo se poligoniza, asi que el area del poligono subestimaria la
    real (72 lados -> -0.06%). El radio se corrige para que de exacta, porque
    ese error entra derecho en Po."""
    s = construir_seccion(
        [{"shapeType": "CONC CIRCLE", "diameter": 0.6, "XC": 0, "YC": 0},
         {"shapeType": "REBAR", "barSize": "#5", "XC": 0, "YC": 0.2}],
        CATALOGO, malla=200)
    assert math.isclose(s["Ag"], math.pi * 0.6 ** 2 / 4, rel_tol=1e-6), s["Ag"]


def test_varillas_en_circulo():
    """CIRCLE REBAR: la cantidad se reparte pareja sobre la circunferencia, y
    `rotation` gira el conjunto (sirve para alinear una varilla con un eje)."""
    base = {"shapeType": "CIRCLE REBAR", "diameter": 0.5, "XC": 0, "YC": 0,
            "numBars": 8, "barSize": "#5"}
    s = construir_seccion(
        [{"shapeType": "CONC CIRCLE", "diameter": 0.6, "XC": 0, "YC": 0}, base],
        CATALOGO, malla=80)
    assert len(s["bars"]) == 8
    # Todas a la misma distancia del centro (que acá es el centroide).
    radios = [math.hypot(u, v) for u, v, _a in s["bars"]]
    assert all(math.isclose(r, 0.25, abs_tol=1e-9) for r in radios), radios

    girado = construir_seccion(
        [{"shapeType": "CONC CIRCLE", "diameter": 0.6, "XC": 0, "YC": 0},
         dict(base, rotation=45)], CATALOGO, malla=80)
    assert len(girado["bars"]) == 8
    # Girar 360/8/2 = 22.5 deja el conjunto a mitad de camino; con 45 vuelve a
    # caer sobre si mismo, porque 45 es multiplo del paso angular.
    a = sorted((round(u, 6), round(v, 6)) for u, v, _ in s["bars"])
    b = sorted((round(u, 6), round(v, 6)) for u, v, _ in girado["bars"])
    assert a == b, "45 grados con 8 varillas tiene que caer sobre si mismo"


def test_el_espejo_es_POR_SHAPE():
    """Agregar una segunda L no puede dar vuelta la primera. Con una sola
    bandera para toda la seccion eso era exactamente lo que pasaba."""
    L1 = {"shapeType": "CONC L", "D": 1.0, "B": 0.6, "TF": 0.3, "TW": 0.3,
          "XC": 0, "YC": 0, "mirror2": True, "mirror3": True}
    barra = {"shapeType": "REBAR", "barSize": "#5", "XC": -0.2, "YC": 0.4}
    sola = construir_seccion([L1, barra], CATALOGO, malla=60)
    L2 = {"shapeType": "CONC L", "D": 0.8, "B": 0.5, "TF": 0.2, "TW": 0.2,
          "XC": 3, "YC": 0, "mirror2": False, "mirror3": False}
    dos = construir_seccion([L1, L2, barra], CATALOGO, malla=60)

    def huella(sec, k=0):
        p = sec["piezas"][k]
        return [(round(u - p[0][0], 6), round(v - p[0][1], 6)) for u, v in p]

    assert huella(sola) == huella(dos), "la primera L cambio de forma"


def test_rotacion_de_una_pieza():
    """`rotation` gira la figura sobre su propio centro, sin mover el centro."""
    L = {"shapeType": "CONC L", "D": 1.0, "B": 0.6, "TF": 0.3, "TW": 0.3,
         "XC": 0, "YC": 0, "mirror2": False, "mirror3": False}
    a = construir_seccion([L, {"shapeType": "REBAR", "barSize": "#5", "XC": 0, "YC": 0}],
                          CATALOGO, malla=60)
    b = construir_seccion([dict(L, rotation=90), {"shapeType": "REBAR", "barSize": "#5", "XC": 0, "YC": 0}],
                          CATALOGO, malla=60)
    # Girar no cambia el area ni la cantidad de vertices, pero si la forma.
    assert math.isclose(a["Ag"], b["Ag"], rel_tol=1e-9)
    assert len(a["piezas"][0]) == len(b["piezas"][0])
    assert a["piezas"][0] != b["piezas"][0]
