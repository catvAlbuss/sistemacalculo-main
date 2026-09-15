"""
Fuerzas de pier: geometria de la seccion y convencion de signos.

POR QUE ESTOS TESTS Y NO OTROS
    Todo lo que puede salir mal aca es silencioso. Un eje local invertido, un
    centroide corrido o un signo al reves dan una tabla que se ve
    perfectamente razonable y manda a disenar la placa con el momento
    equivocado. Asi que cada test ata un numero a algo comprobable a mano:
    estatica de voladizo, o geometria de la L.
"""

import math

import pytest

from seismic import pier_forces as pf

TONF = 9806.65  # N


# ═════════════════════════════════════════════════════════════════
# Geometria: no necesita OpenSees
# ═════════════════════════════════════════════════════════════════

def test_agrupa_por_pier_y_piso():
    """Dos panos del mismo pier en el mismo piso son UN tramo; el piso de
    arriba es otro. Es la unidad con la que reporta ETABS."""
    malla = {
        1: {"pier": "P1", "zbot": 0.0, "ztop": 3.3, "story": "Story1", "nodes": (1, 2, 3, 4)},
        2: {"pier": "P1", "zbot": 0.0, "ztop": 3.3, "story": "Story1", "nodes": (2, 5, 6, 3)},
        3: {"pier": "P1", "zbot": 3.3, "ztop": 6.5, "story": "Story2", "nodes": (3, 6, 7, 8)},
        4: {"pier": None, "zbot": 0.0, "ztop": 3.3, "story": "Story1", "nodes": (9, 10, 11, 12)},
    }
    seg = pf.agrupar_segmentos(malla)
    assert set(seg) == {("P1", 0.0, 3.3), ("P1", 3.3, 6.5)}
    assert sorted(seg[("P1", 0.0, 3.3)]["eids"]) == [1, 2]
    assert seg[("P1", 3.3, 6.5)]["story"] == "Story2"


def test_muro_sin_pier_no_entra():
    """Un muro sin etiqueta no aparece en la tabla — no es un pier."""
    assert pf.agrupar_segmentos({1: {"pier": "", "nodes": (1, 2, 3, 4)}}) == {}


def test_eje_2_de_un_muro_plano_es_su_direccion():
    trazas = [((0.0, 0.0), (4.0, 0.0), 4.0)]
    e2, e3 = pf.ejes_locales(trazas)
    assert e2 == pytest.approx((1.0, 0.0), abs=1e-9)
    assert e3 == pytest.approx((0.0, 1.0), abs=1e-9)


def test_eje_2_de_un_muro_en_Y():
    """Muro sobre Y: e2 apunta a +Y y e3 = e1 x e2 queda en -X."""
    e2, e3 = pf.ejes_locales([((0.0, 0.0), (0.0, 3.0), 3.0)])
    assert e2 == pytest.approx((0.0, 1.0), abs=1e-9)
    assert e3 == pytest.approx((-1.0, 0.0), abs=1e-9)


def test_eje_2_de_una_L_sigue_al_ala_LARGA():
    """
    P1 del modelo del usuario: 1.35 m sobre X + 0.85 m sobre Y. Es el caso que
    justifica no cablear e2 a los ejes globales — hay que ELEGIR uno de los
    dos, y ETABS elige el ala dominante (con SDX, P1 responde con V2 = 9.88
    tonf y V3 = 2.84: el cortante fuerte va por el ala en X).
    """
    trazas = [((5.78, 20.51), (7.13, 20.51), 1.35),
              ((7.13, 19.66), (7.13, 20.51), 0.85)]
    e2, _e3 = pf.ejes_locales(trazas)
    assert e2 == pytest.approx((1.0, 0.0), abs=1e-9)

    # Si se invierten los largos, el eje se da vuelta: la regla mira el ala
    # larga, no el orden en que llegan los panos.
    trazas_al_reves = [((5.78, 20.51), (6.63, 20.51), 0.85),
                       ((7.13, 19.16), (7.13, 20.51), 1.35)]
    e2b, _ = pf.ejes_locales(trazas_al_reves)
    assert e2b == pytest.approx((0.0, 1.0), abs=1e-9)


def test_eje_2_no_depende_del_sentido_en_que_se_dibujo_el_pano():
    """Dar vuelta el trazo no puede voltear V2 ni M3."""
    a, _ = pf.ejes_locales([((0.0, 0.0), (4.0, 0.0), 4.0)])
    b, _ = pf.ejes_locales([((4.0, 0.0), (0.0, 0.0), 4.0)])
    assert a == pytest.approx(b, abs=1e-9)


def test_centroide_de_la_L_es_el_de_la_linea_media():
    """
    P1: alas de 1.35 y 0.85 m. A mano, pesando por largo:
        x = (1.35*6.455 + 0.85*7.13) / 2.20
        y = (1.35*20.51 + 0.85*20.085) / 2.20
    Es el punto donde ETABS reporta los momentos del pier; correrlo cambia M2
    y M3 sin cambiar P, que es justo el error dificil de ver.
    """
    trazas = [((5.78, 20.51), (7.13, 20.51), 1.35),
              ((7.13, 19.66), (7.13, 20.51), 0.85)]
    cx, cy = pf.centroide(trazas)
    assert cx == pytest.approx((1.35 * 6.455 + 0.85 * 7.13) / 2.20, abs=1e-9)
    assert cy == pytest.approx((1.35 * 20.51 + 0.85 * 20.085) / 2.20, abs=1e-9)


def test_a_ejes_locales_proyecta_sobre_e2_y_e3():
    """Con el pier girado 90 grados, lo que era V2 pasa a ser V3. Y M2 sale
    con el signo cambiado a proposito (ver la docstring de a_ejes_locales)."""
    F, M = [3.0, 4.0, -10.0], [1.0, 2.0, 0.5]
    r = pf.a_ejes_locales(F, M, (0.0, 1.0), (-1.0, 0.0))
    assert r["P"] == pytest.approx(-10.0)
    assert r["V2"] == pytest.approx(4.0)
    assert r["V3"] == pytest.approx(-3.0)
    assert r["T"] == pytest.approx(0.5)
    assert r["M2"] == pytest.approx(-2.0)
    assert r["M3"] == pytest.approx(-1.0)


# ═════════════════════════════════════════════════════════════════
# Estatica: con el motor real
# ═════════════════════════════════════════════════════════════════

ops = pytest.importorskip("openseespy.opensees", reason="sin OpenSees no hay corte")


def _voladizo(paneles, cargas, altura=3.0, espesor=0.30, gamma=24000.0, peso_propio=False):
    """Arma un modelo de muros en voladizo empotrados en la base y lo analiza."""
    from seismic.inputs import build_model_3d
    from seismic.solver import _run_static_with_loads

    nodos, muros, vistos = [], [], {}

    def nodo(x, y, z):
        clave = (round(x, 4), round(y, 4), round(z, 4))
        if clave not in vistos:
            vistos[clave] = len(vistos) + 1
            nodos.append({"id": vistos[clave], "x": x, "y": y, "z": z})
        return vistos[clave]

    for i, (p, q) in enumerate(paneles, start=1):
        for z in (0.0, altura):
            nodo(p[0], p[1], z)
            nodo(q[0], q[1], z)
        muros.append({
            "id": i,
            "corners": [{"x": p[0], "y": p[1], "z": 0.0}, {"x": q[0], "y": q[1], "z": 0.0},
                        {"x": q[0], "y": q[1], "z": altura}, {"x": p[0], "y": p[1], "z": altura}],
            "thickness": espesor,
            "material": {"E": 25e9, "poissonRatio": 0.2, "unitWeightNPerM3": gamma},
            "pier": "PL", "story": "Piso 1",
        })

    apoyos = [{"node": n["id"], "ux": 1, "uy": 1, "uz": 1, "rx": 1, "ry": 1, "rz": 1}
              for n in nodos if abs(n["z"]) < 1e-9]
    loads = [{"node": vistos[(round(x, 4), round(y, 4), round(altura, 4))],
              "fx": fx, "fy": fy, "fz": fz, "type": "Dead"} for (x, y, fx, fy, fz) in cargas]
    # Peso propio como lo manda payload.js: 1/4 del peso del pano a cada
    # esquina, etiquetado para que la integracion lo reconozca.
    if peso_propio:
        for m in muros:
            W = espesor * gamma * math.dist(
                (m["corners"][0]["x"], m["corners"][0]["y"]),
                (m["corners"][1]["x"], m["corners"][1]["y"])) * altura
            for c in m["corners"]:
                loads.append({
                    "node": vistos[(round(c["x"], 4), round(c["y"], 4), round(c["z"], 4))],
                    "fx": 0, "fy": 0, "fz": -W / 4, "type": "Dead",
                    "source": "wall_self_weight", "wallId": m["id"],
                })

    data = {"nodes": nodos, "elements": [], "supports": apoyos, "walls": muros,
            "loads": loads, "useRigidDiaphragms": False,
            "stories": [{"name": "Base", "elevation": 0},
                        {"name": "Piso 1", "elevation": altura}]}
    n, e = build_model_3d(data)
    _run_static_with_loads(n, e, loads)
    filas = {f["location"]: f
             for f in pf.leer_pier_forces(data, pf.peso_por_muro(data))}
    return data, filas


def test_voladizo_plano_calza_con_la_estatica():
    """
    Muro de 4 x 3 m, fuerza horizontal H = 10 kN y vertical V = -50 kN en el
    tope. La estatica no deja lugar a interpretacion:
        P = -50 kN arriba y abajo   (compresion NEGATIVA, como ETABS)
        V2 = +10 kN en los dos      (no hay carga repartida en la altura)
        M3 = 0 arriba, +H*h abajo   (la relacion M_abajo = M_arriba + V*h)
    Este es el test que fija el SIGNO: con el signo al reves los tres salian
    cambiados a la vez, que es lo que lo hace dificil de notar a ojo.
    """
    H, V, h, L = 10000.0, -50000.0, 3.0, 4.0
    _data, filas = _voladizo([((0.0, 0.0), (L, 0.0))],
                             [(0.0, 0.0, H / 2, 0.0, V / 2),
                              (L, 0.0, H / 2, 0.0, V / 2)], altura=h)

    assert set(filas) == {"Top", "Bottom"}
    for lado in ("Top", "Bottom"):
        assert filas[lado]["P"] == pytest.approx(V, rel=1e-6)
        assert filas[lado]["V2"] == pytest.approx(H, rel=1e-6)
        assert filas[lado]["V3"] == pytest.approx(0.0, abs=1.0)
        assert filas[lado]["length"] == pytest.approx(L, rel=1e-9)

    assert filas["Top"]["M3"] == pytest.approx(0.0, abs=1.0)
    assert filas["Bottom"]["M3"] == pytest.approx(H * h, rel=1e-6)
    assert filas["Bottom"]["M3"] == pytest.approx(
        filas["Top"]["M3"] + filas["Top"]["V2"] * h, rel=1e-6)


def test_el_peso_propio_aparece_como_diferencia_entre_Top_y_Bottom():
    """
    P abajo - P arriba tiene que ser exactamente el peso del pano. Es el
    chequeo que da la tabla del usuario: P1 Story1 CM pasa de -17.736 a
    -22.9632, y 5.2272 tonf es justo el peso de ese pano.

    Y es el test que justifica `_resultante_de_peso`: con el peso llegando como
    cargas de esquina, el pano NO acumula nada (P sale igual arriba y abajo,
    por equilibrio del elemento), asi que sin la correccion este test da
    diferencia CERO.
    """
    h, L, t, gamma = 3.0, 4.0, 0.30, 24000.0
    peso = L * h * t * gamma
    _data, filas = _voladizo([((0.0, 0.0), (L, 0.0))], [], altura=h,
                             espesor=t, gamma=gamma, peso_propio=True)
    assert filas["Bottom"]["P"] - filas["Top"]["P"] == pytest.approx(-peso, rel=1e-6)
    assert filas["Top"]["P"] == pytest.approx(0.0, abs=1.0)


def test_sin_peso_propio_el_pano_no_acumula_nada():
    """El otro lado del test anterior: sin las cargas etiquetadas, P es el
    mismo arriba y abajo. No es un bug del corte — es equilibrio del pano."""
    h, L = 3.0, 4.0
    V = -50000.0
    _data, filas = _voladizo([((0.0, 0.0), (L, 0.0))],
                             [(0.0, 0.0, 0.0, 0.0, V / 2),
                              (L, 0.0, 0.0, 0.0, V / 2)], altura=h)
    assert filas["Bottom"]["P"] == pytest.approx(filas["Top"]["P"], rel=1e-9)


def test_en_una_L_el_peso_propio_no_deja_momento():
    """
    En una L de espesor constante, el peso por metro es el mismo en las dos
    alas, asi que su resultante cae JUSTO en el centroide pesado por largo —
    que es el mismo punto donde se toman los momentos. O sea: el peso propio
    aporta P y nada de M2/M3.

    No es una obviedad, es un candado: si el peso se sumara en un punto y los
    momentos se tomaran en otro (por ejemplo el centro del bounding box, o el
    centroide de un ala sola), aca apareceria un momento de la nada. Y seria
    invisible en un muro plano, donde los dos puntos coinciden igual.
    """
    h, t, gamma = 3.0, 0.30, 24000.0
    a = ((0.0, 0.0), (2.0, 0.0))    # ala larga sobre X
    b = ((2.0, 0.0), (2.0, 1.0))    # ala corta sobre Y
    _data, filas = _voladizo([a, b], [], altura=h, espesor=t, gamma=gamma,
                             peso_propio=True)
    Wa, Wb = t * gamma * 2.0 * h, t * gamma * 1.0 * h
    abajo = filas["Bottom"]
    assert abajo["P"] - filas["Top"]["P"] == pytest.approx(-(Wa + Wb), rel=1e-6)
    assert abajo["M2"] == pytest.approx(0.0, abs=1.0)
    assert abajo["M3"] == pytest.approx(0.0, abs=1.0)
