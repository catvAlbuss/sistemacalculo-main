# -*- coding: utf-8 -*-
"""Combinaciones que crea el usuario en la app (Define > Combinaciones de carga).

EL BUG: llegaban al motor sin `terms` (el modal guardaba `loadCases`) y, como cualquier combo
enviado reemplazaba a los de la E.060, el diseño quedaba sin combinaciones; el usuario solo
"podía usar las predeterminadas". Ahora se suman a las de la norma (o a las del .e2k).
"""

from seismic.solver import _ff_combos_a_usar

CASOS = [
    {"id": "CM", "name": "CM", "patternType": "Dead"},
    {"id": "CV", "name": "CV", "patternType": "Live"},
    {"id": "SDX", "name": "SDX", "type": "Response Spectrum"},
]
PROPIA = {"id": "1.2CM+1.6CV", "name": "1.2CM+1.6CV", "type": "ADD",
          "terms": [{"case": "CM", "factor": 1.2}, {"case": "CV", "factor": 1.6}]}


def test_sin_e2k_suma_las_del_usuario_a_las_de_la_norma():
    norma = _ff_combos_a_usar(None, CASOS)
    con_propia = _ff_combos_a_usar(None, CASOS, [PROPIA])
    assert len(norma) >= 3
    assert con_propia[: len(norma)] == norma
    assert con_propia[-1]["id"] == "1.2CM+1.6CV"


def test_con_e2k_suma_a_las_importadas_sin_duplicar():
    importada = {"id": "01", "name": "01 1.4CM+1.7CV", "terms": [{"case": "CM", "factor": 1.4}]}
    usadas = _ff_combos_a_usar([importada], CASOS, [PROPIA, dict(PROPIA)])
    assert [c["id"] for c in usadas] == ["01", "1.2CM+1.6CV"]


def test_una_combinacion_sin_terminos_no_entra():
    vacia = {"id": "COMB1", "name": "COMB1", "loadCases": [{"name": "DEAD Static Load", "scale": 1}]}
    assert _ff_combos_a_usar(None, CASOS, [vacia]) == _ff_combos_a_usar(None, CASOS)
