# -*- coding: utf-8 -*-
"""Capa 2 contra ETABS: MODULO 01, el modelo de columnas L.

Distinto de `tests/regresion`, que solo caza CAMBIOS: acá los numeros de
referencia salen de las tablas REALES de ETABS 22.7 (Base Reactions y Element
Forces - Columns) para el caso `SDY ESCALADO` del modelo
`01.MODULO 01 (1) columna L.e2k`.

POR QUE EXISTE
    El 2026-09-01 se descubrio que ETABS SI usa el producto de inercia I23 de las
    secciones L y nosotros lo tirabamos, con lo que los modos salian desacoplados
    en X-Y y el cortante basal en X quedaba 21.6 % corto. Se arreglo modelando
    las L en ejes principales (ver seismic/section_principal.py).

    **Los dos fixtures de `tests/regresion` no tienen NI UNA seccion L** (0 de
    224 y 0 de 73 elementos), asi que pasaron en verde sin ejercitar nada de eso.
    Sin este archivo, el cambio quedaba sin cobertura.

TOLERANCIAS
    Son las diferencias MEDIDAS despues del arreglo, con un poco de aire. No son
    un objetivo aspiracional: si algo se sale, algo cambio de verdad.
"""
import json
import sys
from pathlib import Path

import pytest

ROOT = Path(__file__).resolve().parents[1]
if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))

pytest.importorskip("openseespy.opensees", reason="sin OpenSees no hay analisis")

import seismic_analysis as sa                      # noqa: E402
from seismic.section_principal import principal_properties  # noqa: E402

PAYLOAD = ROOT / "tests" / "regresion" / "payloads" / "modulo1_columnas_L.json"
TONF = 9.80665
CASO = "SDY_ESCALADO"

# Element Forces - Columns de ETABS, Story1, estacion 0, caso SDY ESCALADO.
# El "Unique Name" del reporte mapea 1:1 con nuestro id de elemento.
ETABS_COLUMNAS = {
    1: ("C2",  2.4227, 0.7940, 3.1906, 9.0477, 2.6258),
    2: ("C3",  0.4425, 0.7343, 3.0638, 8.9774, 2.6115),
    3: ("C4",  0.7927, 0.7506, 3.1986, 9.2022, 2.7648),
    4: ("C8",  2.0676, 0.8064, 3.1665, 8.9914, 2.6830),
    5: ("C9",  0.5034, 0.7586, 2.9302, 8.6674, 2.5887),
    6: ("C10", 1.0210, 0.7199, 2.9600, 8.6617, 2.6155),
}
# Base Reactions de ETABS para el mismo caso.
ETABS_FX, ETABS_FY = 15.5524, 51.0429

_CACHE = {}


def _datos():
    if "d" not in _CACHE:
        _CACHE["d"] = json.loads(PAYLOAD.read_text(encoding="utf-8"))
    return _CACHE["d"]


def _fuerzas_de_columnas():
    if "f" not in _CACHE:
        d = _datos()
        res = sa.run_frame_force_results(
            d, cases=d.get("cases"), combos=[],
            seismic_cases=d.get("seismicCases"), num_stations=5,
        )
        _CACHE["f"] = {
            e["frameId"]: e["stations"][0]
            for e in (res.get("frameForces") or [])
            if e.get("caseId") == CASO and e.get("frameId") in ETABS_COLUMNAS
        }
    return _CACHE["f"]


def test_las_12_columnas_L_se_detectan_como_asimetricas():
    """Si esto falla, el resto pasa por casualidad.

    Las 12 columnas son `CL 70x70x30`; las 58 vigas son rectangulares y no deben
    girarse. Ya paso una vez que `principal_properties` no encontrara la seccion
    —viene anidada de dos formas distintas en el payload— y devolviera None sin
    ningun error: el motor corria igual, sin ejes principales y sin avisar.
    """
    elems = _datos()["elements"]
    con = [e for e in elems if principal_properties(e)]
    assert len(con) == 12, f"se detectaron {len(con)} de 12 columnas L"
    assert len(elems) == 70


def test_el_angulo_principal_sale_de_la_geometria_y_es_negativo():
    """−45°, no +45°. El signo lo decide `lMirror3`, y NO puede estar cableado:
    con +45° el cortante basal queda −5.4 % y con −45° queda −0.08 %."""
    import math
    e = next(x for x in _datos()["elements"] if x["id"] == 1)
    p = principal_properties(e)
    assert math.degrees(p["angle"]) == pytest.approx(-45.0, abs=0.01)
    # La traza se conserva: por eso los periodos casi no se mueven y ninguna
    # calibracion de periodos podia detectar que faltaba el I23.
    assert p["I_major"] + p["I_minor"] == pytest.approx(p["I22"] + p["I33"], rel=1e-12)


@pytest.mark.parametrize("fid", sorted(ETABS_COLUMNAS))
def test_fuerzas_de_columna_calzan_con_etabs(fid):
    """P, V2, V3, M2 y M3 contra el Element Forces de ETABS.

    Antes del arreglo M3 estaba entre −36 % y −50 %; ahora entre −2.5 % y −6.6 %.

    LA TORSION T QUEDA FUERA a proposito: sigue −49/−67 % y NO esta explicada.
    Es chica en valor absoluto (0.014 contra 0.038 tonf-m) y no mueve el diseno.
    Ojo: T es INVARIANTE al giro a ejes principales (es el torsor axial), asi que
    este cambio no la toca ni la podria tocar. Candidato: la formula de J de
    pared delgada (ver project_l_section_props_vs_etabs).
    """
    nombre, P, V2, V3, M2, M3 = ETABS_COLUMNAS[fid]
    st = _fuerzas_de_columnas().get(fid)
    assert st is not None, f"{nombre}: sin resultado para el caso {CASO}"

    for comp, ref in (("P", P), ("V2", V2), ("V3", V3), ("M2", M2), ("M3", M3)):
        ours = abs(st[comp]) / TONF
        dif = abs(ours - ref) / ref
        assert dif < 0.10, (
            f"{nombre} {comp}: {ours:.4f} contra {ref:.4f} de ETABS ({dif:+.1%})"
        )


def test_cortante_basal_del_caso_calza_con_etabs():
    """FX era el sintoma de fondo: −21.6 % antes del arreglo, −0.07 % despues.

    FY nunca estuvo mal (−0.4 %), y esa asimetria fue la pista que llevo al I23:
    misma masa, mismo espectro, una direccion bien y la otra no.
    """
    import math
    import openseespy.opensees as ops
    from seismic.inputs import build_model_3d
    from seismic.solver import run_modal_analysis, run_rsa

    d = _datos()
    caso = next(c for c in d["seismicCases"] if c["id"] == CASO)
    sx = [(p["T"], p["Sa"]) for p in caso["spectrumX"]]
    sy = [(p["T"], p["Sa"]) for p in caso["spectrumY"]]

    ops.wipe()
    nodos, _ = build_model_3d(d)
    modal = run_modal_analysis(nodos, 15)
    rx = run_rsa(modal, sx, direction="x", combination="CQC",
                 damping_ratio=0.05, sa_in_g=False, g=9.81)
    ry = run_rsa(modal, sy, direction="y", combination="CQC",
                 damping_ratio=0.05, sa_in_g=False, g=9.81)

    N = 9806.65
    fx = math.hypot(rx.get("base_shear_fx", 0), ry.get("base_shear_fx", 0)) / N
    fy = math.hypot(rx.get("base_shear_fy", 0), ry.get("base_shear_fy", 0)) / N
    assert fx == pytest.approx(ETABS_FX, rel=0.03), f"FX {fx:.3f} vs {ETABS_FX}"
    assert fy == pytest.approx(ETABS_FY, rel=0.05), f"FY {fy:.3f} vs {ETABS_FY}"
