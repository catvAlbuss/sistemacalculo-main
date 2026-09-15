# -*- coding: utf-8 -*-
"""Cruce entre el caso que PIDE un combo y el caso que EXISTE.

EL BUG QUE CUIDA ESTO

El .e2k referencia el caso por NOMBRE:

    COMBO "05 1.25(CM+CV) -SDY"  LOADCASE "SDY ESCALADO"  SF -1

pero el frontend manda el caso con el id NORMALIZADO ("SDY_ESCALADO", ver
responseSpectrumCases en e2k-import.js). Cruzarlos por igualdad exacta fallaba.

Lo grave no era que fallara: era que fallaba EN SILENCIO. El combo se armaba
igual con los terminos que si resolvian (CM y CV), asi que el combo sismico
aparecia en la tabla de diseno con numeros de PURA GRAVEDAD y nada avisaba.
Sintoma real, medido en el modelo "01.MODULO 01 (1) columna L.e2k": el diseno
de la columna C2 gobernaba con "01 1.4CM+1.7CV" (ratio 0.125) cuando ETABS
gobierna con "05 1.25(CM+CV)-SDY" (ratio 0.301).

Dos defensas:
  - el cruce es tolerante (sin espacios ni guiones bajos, sin distinguir
    mayusculas);
  - los terminos que NO cruzan con nada se reportan en `unresolvedComboCases`,
    para que la proxima vez se vea.
"""

import pytest

from seismic.solver import _ff_compute_combo_entries, _ff_norm_caso

COMPONENTES = ["P", "M2", "M3"]


def _caso(frame_id, case_id, p, m2, m3):
    return {
        "frameId": frame_id,
        "caseId": case_id,
        "comboId": None,
        "length": 3.3,
        "localAxes": {"axis1": "i_to_j", "axis2": [0, 0, 1], "axis3": [0, 1, 0]},
        "stations": [
            {"station": 0.0, "relativeStation": 0.0, "P": p, "M2": m2, "M3": m3},
            {"station": 3.3, "relativeStation": 1.0, "P": p, "M2": m2, "M3": m3},
        ],
    }


@pytest.fixture
def entorno():
    gravedad = _caso(1, "CM", -100.0, 1.0, 2.0)
    sismo = _caso(1, "SDY_ESCALADO", 10.0, 8.0, 5.0)
    case_idx = {(1, "CM"): gravedad, (1, "SDY_ESCALADO"): sismo}
    case_meta = [{"id": "CM", "name": "CM"},
                 {"id": "SDY_ESCALADO", "name": "SDY ESCALADO",
                  "type": "Response Spectrum"}]
    alias = {}
    for m in case_meta:
        for etiqueta in (m["id"], m.get("name")):
            k = _ff_norm_caso(etiqueta)
            if k:
                alias.setdefault(k, m["id"])
    return case_idx, alias


def _m2_de(entries, sufijo):
    e = [x for x in entries if x["comboId"].endswith(sufijo)][0]
    return e["stations"][0]["M2"]


def _asegurar_que_el_sismo_entro(entries):
    """Mide el APORTE ESPECTRAL, no una magnitud suelta.

    La gravedad sola daria 1.25 en las DOS variantes. El sismo (magnitud 8.0)
    las separa en 2 x 8.0 = 16.0, una para arriba y otra para abajo. Ese
    intervalo es la firma de que el termino cruzo; el signo de cada variante
    depende del SF del combo (-1 acá) y no dice nada por si solo.
    """
    maximo, minimo = _m2_de(entries, "_Max"), _m2_de(entries, "_Min")
    assert abs(maximo - minimo) == pytest.approx(16.0), (
        f"el aporte espectral no entro: _Max {maximo}, _Min {minimo}"
    )
    assert maximo != pytest.approx(1.25) and minimo != pytest.approx(1.25)


def _combo_sismico(nombre_caso):
    return {
        "id": "05", "name": "05 1.25(CM+CV) -SDY", "type": "ENVELOPE",
        "terms": [
            {"case": "CM", "factor": 1.25},
            {"case": nombre_caso, "factor": -1.0, "signless": True},
        ],
    }


def test_el_nombre_con_espacio_cruza_con_el_id_con_guion_bajo(entorno):
    """El caso del bug: LOADCASE "SDY ESCALADO" contra el caso SDY_ESCALADO."""
    case_idx, alias = entorno
    sin_resolver = set()
    entries = _ff_compute_combo_entries(
        _combo_sismico("SDY ESCALADO"), [{"id": 1}], case_idx, COMPONENTES,
        alias, sin_resolver)

    assert entries, "el combo tenia que producir entradas"
    assert not sin_resolver, f"quedaron terminos sin cruzar: {sin_resolver}"
    _asegurar_que_el_sismo_entro(entries)


def test_el_id_exacto_sigue_funcionando(entorno):
    """Regresion: el camino que ya andaba no se toca."""
    case_idx, alias = entorno
    entries = _ff_compute_combo_entries(
        _combo_sismico("SDY_ESCALADO"), [{"id": 1}], case_idx, COMPONENTES,
        alias, set())
    _asegurar_que_el_sismo_entro(entries)


def test_sin_el_alias_el_sismo_se_perdia_en_silencio(entorno):
    """Deja MEDIDO el bug viejo: el combo salia igual, pero sin sismo."""
    case_idx, _alias = entorno
    entries = _ff_compute_combo_entries(
        _combo_sismico("SDY ESCALADO"), [{"id": 1}], case_idx, COMPONENTES,
        None, None)
    assert entries, "el combo se armaba igual — por eso no se notaba"
    m2 = [e for e in entries if e["comboId"].endswith("_Max")][0]["stations"][0]["M2"]
    assert m2 == pytest.approx(1.25), "solo la gravedad, el sismo desaparecido"


def test_un_caso_que_no_existe_se_reporta(entorno):
    """Lo que faltaba: que se vea. No basta con cruzar mejor."""
    case_idx, alias = entorno
    sin_resolver = set()
    _ff_compute_combo_entries(
        _combo_sismico("SDZ QUE NO EXISTE"), [{"id": 1}], case_idx,
        COMPONENTES, alias, sin_resolver)
    assert "SDZ QUE NO EXISTE" in sin_resolver


@pytest.mark.parametrize("a,b", [
    ("SDX ESCALADO", "SDX_ESCALADO"),
    ("sdx escalado", "SDX  ESCALADO"),
    ("CM", "cm"),
])
def test_la_normalizacion_cruza_lo_que_tiene_que_cruzar(a, b):
    assert _ff_norm_caso(a) == _ff_norm_caso(b)


def test_la_normalizacion_no_cruza_casos_distintos():
    assert _ff_norm_caso("SDX") != _ff_norm_caso("SDY")
    assert _ff_norm_caso("CM") != _ff_norm_caso("CV")
