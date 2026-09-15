"""
Capa 2 de la red de regresion: contra RESPUESTAS CONOCIDAS.

La diferencia con `tests/regresion` es toda: aquella compara contra lo que dio
ayer (caza cambios, no errores). Esta compara contra los ejemplos del
**CSI Verification Manual**, que traen la respuesta teorica o de referencias
publicadas. Si uno de estos falla, el motor esta MAL, no "distinto".

Fuente: ETABS 22 > Manuals > Verification > Analysis.
"""

import math

import pytest

ops = pytest.importorskip("openseespy.opensees", reason="sin OpenSees no hay eigen")

from seismic.inputs import build_model_3d          # noqa: E402
from seismic.solver import run_modal_analysis      # noqa: E402

# kip-ft-sec -> SI
KIP = 4448.2216152605
FT = 0.3048


# ═════════════════════════════════════════════════════════════════════════
# Example 6 — Portico plano de 9 pisos y 10 vanos, analisis de valores propios
# ═════════════════════════════════════════════════════════════════════════
#
# El manual compara ETABS contra Wilson y Habibullah (1992) y Bathe y Wilson
# (1972). Los autovalores (lambda = omega^2, en 1/s^2) son:
EJ6_LAMBDA = (0.58964, 5.53195, 16.5962)
#
# DOS COSAS QUE HAY QUE HACER BIEN O EL RESULTADO NO SE PARECE EN NADA:
#
# 1. **Masa SOLO en el plano del portico.** Es un portico plano en YZ. Poniendo
#    masa tambien en X aparecen modos fuera del plano —99 columnas en voladizo,
#    sin ninguna viga que las ate— que se comen los primeros lugares del eigen:
#    el "modo 1" salia en 68.85 s contra 8.18 s del de verdad.
#
# 2. **Euler-Bernoulli, no Timoshenko.** El motor usa Timoshenko por defecto
#    (Av = 5/6 A), que es lo correcto para un modelo real: ETABS calcula el area
#    de corte de la geometria de la seccion. Pero acá las secciones son
#    ABSTRACTAS (se dan A e I sueltos, sin dimensiones), y ETABS con area de
#    corte 0 desprecia la deformacion por corte — igual que las referencias.
#    Con Timoshenko el error es -5.5%; con Euler es CERO. Y no es poco corte:
#    la seccion equivalente da h = 2 ft, o sea columnas con L/h = 5.


def _portico_ej6(vanos=10, pisos=9):
    """Arma el payload del Example 6. Devuelve (data, tags_por_piso)."""
    E = 432_000.0 * KIP / FT**2      # 432000 ksf
    A = 3.0 * FT**2                  # 3 ft2
    I = 1.0 * FT**4                  # 1 ft4
    masa_por_ft = 3.0 * KIP / FT     # 3 kip-s2/ft por ft de longitud
    luz, alto = 20.0 * FT, 10.0 * FT

    nodos, elementos, apoyos, diafragmas, tag = [], [], [], [], {}
    n = 0
    for piso in range(pisos + 1):
        fila = []
        for col in range(vanos + 1):
            n += 1
            tag[(col, piso)] = n
            nodos.append({"id": n, "x": 0.0, "y": col * luz, "z": piso * alto})
            fila.append(n)
        if piso == 0:
            apoyos = [{"node": t, "ux": 1, "uy": 1, "uz": 1,
                       "rx": 1, "ry": 1, "rz": 1} for t in fila]
        else:
            diafragmas.append({"id": f"D{piso}", "name": f"D{piso}",
                               "z": piso * alto, "nodeIds": fila})

    def barra(a, b, tipo):
        elementos.append({
            "id": len(elementos) + 1, "node_i": a, "node_j": b,
            "A": A, "E": E, "G": E / 2.4, "Iz": I, "Iy": I, "J": 2 * I,
            "elementType": tipo,
        })

    for piso in range(pisos):
        for col in range(vanos + 1):
            barra(tag[(col, piso)], tag[(col, piso + 1)], "column")
    for piso in range(1, pisos + 1):
        for col in range(vanos):
            barra(tag[(col, piso)], tag[(col + 1, piso)], "beam")

    # Masa de piso por longitudes TRIBUTARIAS: las vigas del nivel mas media
    # columna arriba y media abajo. La mitad inferior de las columnas del primer
    # piso tributa a la BASE, que esta empotrada, y por eso no cuenta.
    por_nudo = {}
    for piso in range(1, pisos + 1):
        arriba = 5.0 if piso < pisos else 0.0
        ft_trib = vanos * 20.0 + (vanos + 1) * (5.0 + arriba)
        por_nudo[piso] = masa_por_ft * ft_trib / (vanos + 1)
    for piso in range(1, pisos + 1):
        for col in range(vanos + 1):
            for nd in nodos:
                if nd["id"] == tag[(col, piso)]:
                    nd["mass_y"] = por_nudo[piso]   # SOLO en el plano

    data = {
        "nodes": nodos, "elements": elementos, "supports": apoyos,
        "diaphragms": diafragmas, "useRigidDiaphragms": True,
        "loads": [], "walls": [], "slabs": [],
        "stories": [{"name": "Base", "elevation": 0.0}]
                   + [{"name": f"Story{i}", "elevation": i * alto}
                      for i in range(1, pisos + 1)],
        "massSource": {"enabled": False},
        "shearDeformations": False,      # ver el punto 2 de arriba
    }
    return data, tag


def _lambdas(data, cuantos=3):
    ops.wipe()
    nodos, _ = build_model_3d(data)
    modos = run_modal_analysis(nodos, cuantos + 2).get("modal_info") or []
    return [(2 * math.pi / m["period"]) ** 2 for m in modos[:cuantos]]


def test_ej6_autovalores_calzan_con_csi():
    """
    Los tres primeros autovalores, contra el CSI Verification Manual.

    La tolerancia es 0.01% porque el acuerdo medido es EXACTO a cinco
    decimales (0.58964 / 5.53195 / 16.59616). No hay por que aflojarla: si
    alguna vez se mueve, es que algo cambio en el camino modal.
    """
    data, _ = _portico_ej6()
    obtenidos = _lambdas(data)
    for k, (nuestro, csi) in enumerate(zip(obtenidos, EJ6_LAMBDA), start=1):
        assert abs(nuestro - csi) / csi < 1e-4, (
            "modo %d: %.5f vs %.5f del manual (%.3f%%)"
            % (k, nuestro, csi, (nuestro - csi) / csi * 100)
        )


def test_ej6_el_periodo_fundamental_es_el_del_manual():
    """T1 = 2*pi/sqrt(0.58964) = 8.1825 s. Es el numero que se lee de un
    vistazo y el que delata si el modo 1 dejo de ser el lateral."""
    data, _ = _portico_ej6()
    T1 = 2 * math.pi / math.sqrt(_lambdas(data, 1)[0])
    assert T1 == pytest.approx(2 * math.pi / math.sqrt(EJ6_LAMBDA[0]), rel=1e-4)


def test_ej6_con_timoshenko_el_error_es_del_corte_y_no_otra_cosa():
    """
    Fija que la unica diferencia con el manual sea la formulacion de la barra.

    Con Timoshenko (el default del motor, correcto para un modelo real donde
    ETABS calcula el area de corte de la seccion) el error es del orden del
    -5.5%: son columnas con L/h = 5, bien chatas. Este test existe para que si
    algun dia el error cambia de tamaño se sepa que NO fue el corte.
    """
    data, _ = _portico_ej6()
    data["shearDeformations"] = True
    obtenidos = _lambdas(data)
    errores = [(a - e) / e * 100 for a, e in zip(obtenidos, EJ6_LAMBDA)]
    assert all(-7.0 < x < -4.0 for x in errores), errores


def test_ej6_la_masa_fuera_del_plano_arruina_el_eigen():
    """
    El error que costo encontrar, clavado como test.

    Con masa tambien en X, los primeros modos son de flexion FUERA del plano
    (99 columnas en voladizo, sin vigas que las aten) y el modo 1 pasa de 8.18 s
    a mas de 60. No es un bug del motor: es que un portico plano solo tiene masa
    en su plano.
    """
    data, _ = _portico_ej6()
    for nd in data["nodes"]:
        if "mass_y" in nd:
            nd["mass_x"] = nd["mass_y"]
    T1 = 2 * math.pi / math.sqrt(_lambdas(data, 1)[0])
    assert T1 > 30.0, "se esperaba un modo fuera del plano, salio T1 = %.2f s" % T1


# ═════════════════════════════════════════════════════════════════════════
# Example 1 — Portico plano con cargas de tramo, gravedad estatica
# ═════════════════════════════════════════════════════════════════════════
#
# Es el ejemplo que NO se podia correr hasta que el motor tuvo liberaciones de
# extremo: la figura del manual marca "Pinned Connection" en los topes de las
# columnas exteriores. Sin eso, la viga B1 se analizaba empotrada en los dos
# extremos y daba 750 kip-in donde el manual pide 0.
#
# SIGNOS: se comparan MAGNITUDES. `ops.eleForce` usa la convencion de fuerzas
# nodales de OpenSees y ETABS la de diagramas; el manual da M_J = -4050 y
# V_I = -31.25 donde nosotros damos +4050 y +31.25. Es la misma discrepancia de
# convencion que ya esta documentada en pier_forces.py, no un error.

IN = 0.0254
EJ1_KIPIN = KIP * IN


def _portico_ej1(con_liberacion=True):
    """Example 1, Caso 1 (cargas concentradas de 50/100/100/100/50 kip)."""
    E = 3000.0 * KIP / IN**2                       # 3000 ksi
    a_col, i_col = 288.0 * IN**2, 13824.0 * IN**4  # 12"x24"
    a_vig, i_vig = 360.0 * IN**2, 27000.0 * IN**4  # 12"x30"
    luz, alto = 216.0 * IN, 120.0 * IN             # 18 ft, 10 ft
    grande = 1e6                                   # "se desprecia la deformación axial"

    coord = {1: (0, 0), 2: (luz, 0), 3: (2 * luz, 0),
             4: (0, alto), 5: (luz / 2, alto), 6: (luz, alto),
             7: (1.5 * luz, alto), 8: (2 * luz, alto)}
    nodos = [{"id": k, "x": x, "y": 0.0, "z": z} for k, (x, z) in coord.items()]
    apoyos = [{"node": k, "ux": 1, "uy": 1, "uz": 1, "rx": 1, "ry": 1, "rz": 1}
              for k in (1, 2, 3)]

    def barra(eid, i, j, A, I, tipo, rel=None):
        e = {"id": eid, "node_i": i, "node_j": j, "A": A * grande, "E": E,
             "G": E / 2.4, "Iz": I, "Iy": I, "J": 2 * I, "elementType": tipo}
        if rel and con_liberacion:
            e["releases"] = rel
        return e

    # Topes de C1 y C3 articulados. A esos nudos llega UNA sola viga, así que el
    # equilibrio del nudo obliga a M = 0 en el extremo I de B1 y en el J de B2.
    elementos = [
        barra(1, 1, 4, a_col, i_col, "column", ["M2J", "M3J"]),
        barra(2, 2, 6, a_col, i_col, "column"),
        barra(3, 3, 8, a_col, i_col, "column", ["M2J", "M3J"]),
        barra(4, 4, 5, a_vig, i_vig, "beam"),
        barra(5, 5, 6, a_vig, i_vig, "beam"),
        barra(6, 6, 7, a_vig, i_vig, "beam"),
        barra(7, 7, 8, a_vig, i_vig, "beam"),
    ]
    cargas = [{"node": k, "fx": 0.0, "fy": 0.0, "fz": -p * KIP, "type": "Dead"}
              for k, p in ((4, 50), (5, 100), (6, 100), (7, 100), (8, 50))]

    return {"nodes": nodos, "elements": elementos, "supports": apoyos,
            "loads": cargas, "walls": [], "slabs": [], "diaphragms": [],
            "useRigidDiaphragms": False, "shearDeformations": False,
            "stories": [{"name": "Base", "elevation": 0.0},
                        {"name": "Story1", "elevation": alto}],
            "massSource": {"enabled": False}}


def _correr_ej1(data):
    from seismic.solver import _run_static_with_loads
    ops.wipe()
    nodos, elems = build_model_3d(data)
    _run_static_with_loads(nodos, elems, data["loads"])
    # B1 son los elementos 4 (nudos 4-5) y 5 (5-6): "End I" es el I del 4 y
    # "End J" el J del 5. eleForce de un frame 3D: [0..5] extremo I, [6..11] J.
    f4, f5 = ops.eleForce(4), ops.eleForce(5)
    return {
        "M_I": f4[4] / EJ1_KIPIN, "M_J": f5[10] / EJ1_KIPIN,
        "V_I": f4[2] / KIP, "V_J": f5[8] / KIP,
    }


def test_ej1_viga_B1_calza_con_el_manual():
    """Tabla 1-1 del manual, Caso 1: M 0 / -4050 kip-in, V -31.25 / 68.75 kip."""
    r = _correr_ej1(_portico_ej1())
    assert abs(r["M_I"]) < 1e-6, "el extremo articulado tiene momento: %.4f" % r["M_I"]
    assert abs(r["M_J"]) == pytest.approx(4050.0, rel=1e-6)
    assert abs(r["V_I"]) == pytest.approx(31.25, rel=1e-6)
    assert abs(r["V_J"]) == pytest.approx(68.75, rel=1e-6)


def test_ej1_sin_liberacion_da_OTRA_cosa():
    """
    Que el test de arriba EJERCITE la liberación y no pase por casualidad.

    Sin liberar, el nudo del tope de C1 es rígido y B1 queda biempotrada: el
    momento del extremo I deja de ser cero y el del J baja de 4050 a ~2400.
    """
    r = _correr_ej1(_portico_ej1(con_liberacion=False))
    assert abs(r["M_I"]) > 100.0, "sin liberación M_I debería ser grande: %.2f" % r["M_I"]
    assert abs(r["M_J"]) < 4000.0


# ═════════════════════════════════════════════════════════════════════════
# Example 8 — Portico 3D de dos pisos, response spectrum
# ═════════════════════════════════════════════════════════════════════════
#
# Es el primero que ejercita el camino 3D completo: nueve lineas de columna,
# diafragma rigido por piso y masa EXCENTRICA (el manual pone el centro de masa
# en (38, 27) y el centro geometrico esta en (35, 25)).
#
# LO QUE FIJA, Y ES LO IMPORTANTE: la convencion de ejes locales. Con
# `Iz = I33` (el mayor), que es lo que manda `payload.js`, los cuatro periodos
# calzan a menos del 0.4%. Con la asignacion al reves el error es del 8.9%. O
# sea que la convencion de produccion queda verificada contra un benchmark
# independiente, no contra nuestra propia interpretacion.
#
# OJO CON EL `vecxz`: la convencion depende de EL. `payload.js` manda un vecxz
# horizontal perpendicular a la viga, y con ese `Iz` resulta ser el eje fuerte.
# Si no se manda ninguno, `_auto_vecxz` usa [0,0,1] y entonces el eje fuerte es
# `Iy` — al reves. Por eso este test manda el vecxz explicito: prueba el camino
# de produccion y no otro.
EJ8_T = (0.22708, 0.21565, 0.07335, 0.07201)


def _portico_ej8(iz_mayor=True):
    e_col = 350_000.0 * KIP / FT**2
    e_vig = 500_000.0 * KIP / FT**2
    a_col, a_vig = 4.0 * FT**2, 5.0 * FT**2
    i_col = 1.25 * FT**4
    i_men, i_may = 1.67 * FT**4, 2.61 * FT**4
    iy_v, iz_v = (i_men, i_may) if iz_mayor else (i_may, i_men)
    xs = [0.0, 35.0 * FT, 70.0 * FT]
    ys = [0.0, 25.0 * FT, 50.0 * FT]
    zs = [0.0, 13.0 * FT, 26.0 * FT]
    masa = 6.212 * KIP / FT

    nodos, elementos, diaf, tag = [], [], [], {}
    n = 0
    for k, z in enumerate(zs):
        for j, y in enumerate(ys):
            for i, x in enumerate(xs):
                n += 1
                tag[(i, j, k)] = n
                nodos.append({"id": n, "x": x, "y": y, "z": z})

    # Masa repartida con pesos que ponen el centroide EXACTO en el centro de
    # masa del manual, (38, 27). Un nudo suelto ahi no sirve: sin elementos, sus
    # grados vertical y de rotacion quedan sin rigidez y el eigen sale singular
    # ("ArpackSolver info = -9999"). El precio es una inercia rotacional que el
    # manual dice NO tener — es la diferencia conocida, y explica el 0.2-0.4%
    # que queda.
    px = (38.0 - 70.0) / (35.0 - 70.0)
    py = (27.0 - 50.0) / (25.0 - 50.0)
    pesos = {(1, 1): px * py, (1, 2): px * (1 - py),
             (2, 1): (1 - px) * py, (2, 2): (1 - px) * (1 - py)}
    for k in (1, 2):
        for (i, j), w in pesos.items():
            for nd in nodos:
                if nd["id"] == tag[(i, j, k)]:
                    nd["mass_x"] = nd.get("mass_x", 0.0) + masa * w
                    nd["mass_y"] = nd.get("mass_y", 0.0) + masa * w

    apoyos = [{"node": tag[(i, j, 0)], "ux": 1, "uy": 1, "uz": 1,
               "rx": 1, "ry": 1, "rz": 1} for j in range(3) for i in range(3)]
    for k in (1, 2):
        diaf.append({"id": f"D{k}", "name": f"D{k}", "z": zs[k],
                     "nodeIds": [tag[(i, j, k)] for j in range(3) for i in range(3)]})

    def barra(a, b, A, E, Iy, Iz, tipo, vecxz):
        elementos.append({"id": len(elementos) + 1, "node_i": a, "node_j": b,
                          "A": A, "E": E, "G": E / 2.4, "Iy": Iy, "Iz": Iz,
                          "J": Iy + Iz, "elementType": tipo, "vecxz": vecxz})

    for k in range(2):
        for j in range(3):
            for i in range(3):
                barra(tag[(i, j, k)], tag[(i, j, k + 1)], a_col, e_col,
                      i_col, i_col, "column", [0.0, 1.0, 0.0])
    for k in (1, 2):
        for j in range(3):
            for i in range(2):
                barra(tag[(i, j, k)], tag[(i + 1, j, k)], a_vig, e_vig,
                      iy_v, iz_v, "beam", [0.0, -1.0, 0.0])
        for i in range(3):
            for j in range(2):
                barra(tag[(i, j, k)], tag[(i, j + 1, k)], a_vig, e_vig,
                      iy_v, iz_v, "beam", [1.0, 0.0, 0.0])

    return {"nodes": nodos, "elements": elementos, "supports": apoyos,
            "diaphragms": diaf, "useRigidDiaphragms": True,
            "loads": [], "walls": [], "slabs": [],
            "stories": [{"name": "Base", "elevation": 0.0},
                        {"name": "Story1", "elevation": zs[1]},
                        {"name": "Story2", "elevation": zs[2]}],
            "massSource": {"enabled": False}, "shearDeformations": False}


def _periodos(data, cuantos):
    ops.wipe()
    nodos, _ = build_model_3d(data)
    modos = run_modal_analysis(nodos, cuantos + 2).get("modal_info") or []
    return [m["period"] for m in modos[:cuantos]]


def test_ej8_periodos_3d_calzan_con_csi():
    """Los cuatro periodos del manual, a menos del 0.5%."""
    obtenidos = _periodos(_portico_ej8(), 4)
    for k, (nuestro, csi) in enumerate(zip(obtenidos, EJ8_T), start=1):
        assert abs(nuestro - csi) / csi < 5e-3, (
            "modo %d: %.5f vs %.5f (%.2f%%)"
            % (k, nuestro, csi, (nuestro - csi) / csi * 100)
        )


def test_ej8_la_convencion_de_ejes_es_Iz_mayor():
    """
    El test que fija la convención, y el que más vale de este archivo.

    Con el `vecxz` que manda `payload.js` para vigas (horizontal, perpendicular
    a la barra), el eje FUERTE tiene que ir en `Iz` — que es justo lo que hace
    `Iz = I33`. Poniéndolo al revés el error salta de 0.4% a casi 9%, así que
    el benchmark distingue las dos sin ambigüedad.
    """
    al_reves = _periodos(_portico_ej8(iz_mayor=False), 4)
    errores = [abs(a - e) / e for a, e in zip(al_reves, EJ8_T)]
    assert max(errores) > 0.02, "la convención al revés debería fallar feo: %s" % errores
