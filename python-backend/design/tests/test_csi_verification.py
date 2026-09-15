# -*- coding: utf-8 -*-
r"""Capa 2 de la red: ejemplos de VERIFICACION de CSI, con respuesta conocida.

Los otros tests de columnas cruzan contra la salida de ETABS, que arrastra su
propio sesgo (la poligonal de 11 puntos hace que ETABS lea ~1 % de mas — ver
project_etabs_polyline_bias). Estos NO: la respuesta la calcula a mano el propio
manual de verificacion de CSI, asi que el objetivo es CERO, no "cerca de ETABS".

Fuente (viene con la instalacion de ETABS, no se versiona aca):
    C:\Program Files\Computers and Structures\ETABS 22\Manuals\Verification\
    Design\Concrete Frame\ACI 318-14 Example 002.pdf

Los ejemplos 001 de esa carpeta son de VIGA (flexion + corte) y no aplican a
este modulo, que es de columnas. Quedan anotados al final para cuando se arme la
verificacion de vigas.
"""

import math
import sys
from pathlib import Path

import pytest

ROOT = Path(__file__).resolve().parents[2]  # python-backend/
if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))

from design.column_ratio import ratio_pmm  # noqa: E402

IN = 0.0254
KSI = 6.894757e6
KIP = 4448.2216
KFT = 1355.8179


def test_aci_318_14_example_002_dc_ratio_es_uno():
    """P-M de una columna rectangular controlada por COMPRESION.

    Columna 14x22 in, 8 varillas #9 (4 por cara, As total 8.00 in2),
    f'c = 4 ksi, fy = 60 ksi, Pu = 398.4 kips, Mu = 332 k-ft.

    El calculo a mano del manual da phi = 0.65 (compresion controlada:
    eps_t = 0.00135 < 0.002) y **D/C = 1.000 exacto**. ETABS tambien da 1.000.

    Ademas fija la CONVENCION del patron: con el momento sobre M3, las 4
    varillas por cara van en `n2` y las 2 restantes (las esquinas del otro lado)
    en `n3` — o sea R-4-2. Invertirlo da 1.23 y no 1.00, asi que este test
    tambien protege contra que se vuelvan a cruzar los ejes
    (ver project_column_m2_m3_axes_swapped).
    """
    dbar = 1.128 * IN                    # #9
    r = ratio_pmm(
        b=14 * IN, h=22 * IN,
        fc=4 * KSI, fy=60 * KSI,
        # d' = 2.5 in medido al CENTRO de la varilla; el motor ubica el centro
        # en cover + dbar/2 (con estribo 0), asi que se despeja el cover.
        cover=2.5 * IN - dbar / 2,
        bar_diameter=dbar,
        bar_area=1.00 * IN ** 2,
        n2=4, n3=2,
        target_p=398.4 * KIP,
        target_m2=0.0,
        target_m3=332 * KFT,
        nx=40, ny=40,
        confine_bar_diameter=0.0,
        code="ACI318", tied=True, shape="rect",
    )

    assert r is not None, "el rayo de la demanda no corto la superficie"
    # 0.5 % de tolerancia: lo que queda es la discretizacion de la malla de
    # fibras (medido 0.06 % con 40x40), no una diferencia de metodo.
    assert r["ratio"] == pytest.approx(1.000, abs=0.005), (
        f"D/C = {r['ratio']:.4f}, el manual da 1.000 exacto"
    )
    # El phi tambien es dato del manual, y es lo que distingue este ejemplo:
    # cae del lado de compresion controlada, sin transicion.
    assert r["phi"] == pytest.approx(0.65, abs=0.005), (
        f"phi = {r['phi']:.3f}, el manual calcula 0.65 (eps_t = 0.00135 < 0.002)"
    )


def test_el_patron_invertido_NO_da_uno():
    """Deja medido que R-2-4 (el patron dado vuelta) se aleja de la respuesta.

    Sin esto, el test de arriba pasaria igual si alguien cruzara n2 con n3 y
    compensara en otro lado. Medido: 1.2282.
    """
    dbar = 1.128 * IN
    r = ratio_pmm(
        b=14 * IN, h=22 * IN, fc=4 * KSI, fy=60 * KSI,
        cover=2.5 * IN - dbar / 2, bar_diameter=dbar, bar_area=1.00 * IN ** 2,
        n2=2, n3=4,
        target_p=398.4 * KIP, target_m2=0.0, target_m3=332 * KFT,
        nx=40, ny=40, confine_bar_diameter=0.0,
        code="ACI318", tied=True, shape="rect",
    )
    assert r is not None
    assert abs(r["ratio"] - 1.0) > 0.10, (
        f"R-2-4 dio {r['ratio']:.4f}: si esto se acerca a 1.00, el test de "
        f"arriba dejo de distinguir la orientacion del armado"
    )


# ── PENDIENTE: ACI 318-14 Example 001 (VIGA) ────────────────────────────────
# Misma carpeta. Viga simplemente apoyada 10x13.5 in (d), luz 10 ft,
# wu = 9.736 k/ft, f'c = 4 ksi, fy = 60 ksi. Respuestas del manual:
#
#     Mu  = 1460.4 k-in       As    = 2.37 in2
#     Vu  =   37.73 k         Av/s  = 0.041 in2/in
#
# No hay test porque el diseño de vigas del CAD vive en el frontend
# (rcBeamDesign.js / flexionCalculator.js), no en este paquete. Cuando haya un
# equivalente en Python, estos cuatro numeros son la referencia.


# ── MUROS ───────────────────────────────────────────────────────────────────
# Misma coleccion, otra carpeta:
#     ...\Manuals\Verification\Design\Shear Wall\ACI 318-14 WALL-001.pdf

IN2 = 0.00064516   # 1 in2 en m2


def test_aci_318_14_wall_001_dc_ratio_es_uno():
    """P-M de un muro con armado DISTRIBUIDO en varias capas.

    Muro 12 x 60 in, 2-#9 en cada extremo y 2-#4 cada 14 in (As total
    5.20 in2), f'c = 4 ksi, fy = 60 ksi, Pu = 735 k, Mu = 1504 k-ft.

    El manual da phi = 0.712 (zona de transicion) y compara:
        a mano 1.00 · ETABS 1.007 · diferencia 0.70 %

    Nuestro motor da 1.0075: reproduce a ETABS a tres decimales y queda con el
    MISMO +0.7 % sobre el calculo a mano. Ese offset es de la propia referencia
    (itera c hasta 30.1 in con precision limitada), no nuestro — por eso la
    tolerancia se centra en 1.007 y no en 1.000.

    Cubre lo que el ejemplo de columna no toca: capas intermedias de armadura,
    que es justo donde el metodo por capas se puede equivocar en silencio.
    """
    from design.wall_section import construir_seccion
    from design.wall_ratio import ratio_de_demanda

    catalogo = {"#9": 1.00 * IN2, "#4": 0.20 * IN2}
    largo, espesor = 60 * IN, 12 * IN
    # 5 capas: 2, 16, 30, 44, 58 in desde un borde -> centradas en el origen.
    posiciones = [-28 * IN, -14 * IN, 0.0, 14 * IN, 28 * IN]
    tamanos = ["#9", "#4", "#4", "#4", "#9"]
    cara = 4 * IN                      # las dos cortinas, una por cara

    # OJO CON LOS EJES: `_sd_a_local(x, y) = (y, x)`, asi que **D corre sobre la
    # Y** del Section Designer. El largo del muro va en D y por lo tanto las
    # capas se reparten en YC, con las cortinas en XC. Cruzarlo da 1.68 o 2.18
    # en vez de 1.00, y no avisa.
    shapes = [{"shapeType": "CONC RECT", "D": largo, "B": espesor, "XC": 0.0, "YC": 0.0}]
    for pos, tam in zip(posiciones, tamanos):
        for x in (-cara, cara):
            shapes.append({"shapeType": "REBAR", "barSize": tam, "XC": x, "YC": pos})

    seccion = construir_seccion(shapes, catalogo, malla=120)
    r = ratio_de_demanda(
        seccion, 4 * KSI, 60 * KSI,
        {"P": 735 * KIP, "M2": 0.0, "M3": 1504 * KFT},
        code="ACI318", tied=True,
    )

    assert r is not None, "el rayo de la demanda no corto la superficie"
    assert r["ratio"] == pytest.approx(1.007, abs=0.01), (
        f"D/C = {r['ratio']:.4f}; ETABS da 1.007 y el calculo a mano 1.00"
    )


# ── PENDIENTE: ACI 318-14 WALL-002 ──────────────────────────────────────────
# Nucleo de muro con ALA (tb = 8 in, h = 98 in, 6 capas, As1 = As6 = 5.96 in2),
# Pu = 2384 k, Mu3 = 9293 k-ft, D/C: ETABS 0.999 / a mano 1.00.
# Sin test porque la geometria del ala solo esta en la FIGURA del PDF y el texto
# no la fija; ponerla a ojo seria inventar la referencia.
