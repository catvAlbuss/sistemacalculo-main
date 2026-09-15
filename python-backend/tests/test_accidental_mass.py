# -*- coding: utf-8 -*-
"""La excentricidad accidental, verificada contra estatica de manual.

Todo lo de aca es aritmetica pura: no necesita OpenSees ni un modelo. Lo que se
comprueba son las dos propiedades que hacen que el aporte sea el correcto y no
"algo que mueve los numeros":

  * la cupla nodal tiene fuerza neta CERO y momento neto EXACTAMENTE M_z;
  * la masa redistribuida corre el centroide EXACTAMENTE e, sin cambiar el total;
  * sin diafragma rigido los grupos caen a NIVELES DE PISO (era el caso que
    devolvia {} en silencio y dejaba el ECCENRATIOTYPICAL del .e2k sin aplicar).
"""
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from seismic.accidental_mass import (  # noqa: E402
    cuplas_nodales,
    grupos_excentricos,
    masa_redistribuida,
)

# Planta de 8 x 6 m con masa despareja, para que el centroide no caiga en el
# centro geometrico y los chequeos no pasen por simetria.
NODOS = [
    {"id": 1, "x": 0.0, "y": 0.0, "z": 3.0, "_effective_mass_x": 1000.0, "_effective_mass_y": 1000.0},
    {"id": 2, "x": 8.0, "y": 0.0, "z": 3.0, "_effective_mass_x": 3000.0, "_effective_mass_y": 3000.0},
    {"id": 3, "x": 8.0, "y": 6.0, "z": 3.0, "_effective_mass_x": 2000.0, "_effective_mass_y": 2000.0},
    {"id": 4, "x": 0.0, "y": 6.0, "z": 3.0, "_effective_mass_x": 4000.0, "_effective_mass_y": 4000.0},
    # Base: restringida, no participa. No debe entrar en ningun grupo.
    {"id": 5, "x": 0.0, "y": 0.0, "z": 0.0, "_effective_mass_x": 9000.0, "_effective_mass_y": 9000.0},
]
DATA = {"nodes": NODOS}


def _centroide(nodos, masas):
    total = sum(masas[int(n["id"])][0] for n in nodos)
    x = sum(masas[int(n["id"])][0] * n["x"] for n in nodos) / total
    y = sum(masas[int(n["id"])][0] * n["y"] for n in nodos) / total
    return x, y, total


def test_sin_diafragma_rigido_los_grupos_caen_a_piso():
    grupos = grupos_excentricos(DATA)
    assert len(grupos) == 1
    assert grupos[0]["fuente"] == "piso"
    # La base (z=0) queda afuera aunque tenga masa: esta restringida.
    assert sorted(grupos[0]["node_ids"]) == [1, 2, 3, 4]


def test_con_diafragma_rigido_manda_el_diafragma():
    data = dict(DATA)
    data["_rigid_diaphragm_report"] = {
        "applied": [{"method": "rigidDiaphragm_z", "retained": 1, "node_ids": [1, 2, 3]}]
    }
    grupos = grupos_excentricos(data)
    assert len(grupos) == 1
    assert grupos[0]["fuente"] == "diafragma"
    assert grupos[0]["node_ids"] == [1, 2, 3]


def test_la_cupla_no_tiene_fuerza_neta():
    grupos = grupos_excentricos(DATA)
    cuplas = cuplas_nodales(DATA, grupos, "x", 0.05)
    assert len(cuplas) == 1
    coef = cuplas[0]["coef"]

    mz = 12345.0
    fx = sum(mz * c[0] for c in coef.values())
    fy = sum(mz * c[1] for c in coef.values())
    assert abs(fx) < 1e-6, f"fuerza neta X = {fx}"
    assert abs(fy) < 1e-6, f"fuerza neta Y = {fy}"


def test_la_cupla_da_el_momento_pedido():
    grupos = grupos_excentricos(DATA)
    coef = cuplas_nodales(DATA, grupos, "x", 0.05)[0]["coef"]
    por_id = {int(n["id"]): n for n in NODOS}

    masas = {1: 1000.0, 2: 3000.0, 3: 2000.0, 4: 4000.0}
    total = sum(masas.values())
    x_cm = sum(m * por_id[i]["x"] for i, m in masas.items()) / total
    y_cm = sum(m * por_id[i]["y"] for i, m in masas.items()) / total

    mz = 5000.0
    neto = 0.0
    for nid, (cx, cy) in coef.items():
        nd = por_id[nid]
        rx, ry = nd["x"] - x_cm, nd["y"] - y_cm
        neto += rx * (mz * cy) - ry * (mz * cx)

    assert abs(neto - mz) / mz < 1e-9, f"momento neto {neto} != {mz}"


def test_b_perp_es_la_dimension_perpendicular():
    """e = 5 % del ancho PERPENDICULAR a la excitacion, no del paralelo."""
    grupos = grupos_excentricos(DATA)
    e_x = cuplas_nodales(DATA, grupos, "x", 0.05)[0]["e"]
    e_y = cuplas_nodales(DATA, grupos, "y", 0.05)[0]["e"]
    assert abs(e_x - 0.05 * 6.0) < 1e-12   # sismo en X -> ancho en Y = 6 m
    assert abs(e_y - 0.05 * 8.0) < 1e-12   # sismo en Y -> ancho en X = 8 m


def test_la_masa_redistribuida_corre_el_centroide_exactamente_e():
    grupos = grupos_excentricos(DATA)
    piso = [n for n in NODOS if n["z"] > 0]
    _, y0, total0 = _centroide(piso, {int(n["id"]): (n["_effective_mass_x"],) * 2 for n in piso})

    for signo in (+1, -1):
        nuevas = masa_redistribuida(DATA, grupos, "x", signo, 0.05)
        assert set(nuevas) == {1, 2, 3, 4}
        _, y1, total1 = _centroide(piso, nuevas)
        assert abs(total1 - total0) / total0 < 1e-12, "la masa total tiene que conservarse"
        # Excitacion en X -> el centroide se corre en Y, 5 % de 6 m = 0.30 m.
        assert abs((y1 - y0) - signo * 0.30) < 1e-9, f"corrimiento {y1 - y0}"


def test_sin_excentricidad_no_hace_nada():
    grupos = grupos_excentricos(DATA)
    assert cuplas_nodales(DATA, grupos, "x", 0.0) == []
    assert masa_redistribuida(DATA, grupos, "x", 1, 0.0) == {}


def test_grupo_alineado_no_produce_cupla():
    """Todos los nodos en un punto: no hay brazo, y no se inventa uno."""
    data = {"nodes": [
        {"id": 1, "x": 2.0, "y": 2.0, "z": 3.0,
         "_effective_mass_x": 500.0, "_effective_mass_y": 500.0},
        {"id": 2, "x": 2.0, "y": 2.0, "z": 3.0,
         "_effective_mass_x": 500.0, "_effective_mass_y": 500.0},
    ]}
    assert cuplas_nodales(data, grupos_excentricos(data), "x", 0.05) == []
