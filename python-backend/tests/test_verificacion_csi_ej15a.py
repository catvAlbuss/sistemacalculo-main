# -*- coding: utf-8 -*-
r"""CSI Verification, Analysis Example 15a — muro plano en voladizo.

    ...\ETABS 22\Manuals\Verification\Analysis\Example 15.pdf

Nueve muros (1, 3 y 6 pisos x 120, 360 y 720 in de largo, 12 in de espesor,
E = 3000 ksi, nu = 0.2, altura de piso 120 in), con carga lateral estatica en el
tope. El manual publica el desplazamiento de tope segun ETABS y segun SAP2000
con MALLA REFINADA.

LA MAGNITUD DE LA CARGA SOLO ESTA EN LA FIGURA, pero el problema es lineal: se
resuelve con carga unitaria y se escala todo con UN factor ajustado por minimos
cuadrados. Nueve datos, un parametro libre — el ajuste no puede "acomodar" nada.

QUE MIDE, Y POR QUE IMPORTA
    Medido asi, nuestro ShellDKGQ calza con **SAP2000** (peor desvio 3.2 %, casi
    todos por debajo de 0.5 %) y NO con ETABS (hasta 26.9 %). No es que estemos
    mal: ETABS modela "un panel por piso" y esa discretizacion gruesa le sale
    MAS RIGIDA que la malla refinada. Su desvio se achica cuando hay mas pisos
    (mas paneles apilados), que es justo lo que se espera de un problema de
    convergencia de malla:

        pisos  largo  H/L    ETABS / refinada
          6     120   6.00       1.00
          6     360   2.00       0.97
          3     120   3.00       0.97
          1     120   1.00       0.79   <- el mas grueso, el peor
          1     360   0.33       0.86

    Consecuencia practica: cuando calibramos muros CONTRA ETABS y nos daba mas
    blando, parte de esa brecha es la malla gruesa de ETABS, no un error
    nuestro. Ojo antes de meter modificadores para "cerrar" contra ETABS.
    Ver project_wall_shell_stiffness y project_modulo1_story1_drift_gap.
"""
import sys
from pathlib import Path

import pytest

ROOT = Path(__file__).resolve().parents[1]
if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))

try:
    import openseespy.opensees as ops
except ImportError:  # pragma: no cover
    ops = None

IN = 0.0254
E = 3000 * 6.894757e6
NU = 0.2
ESPESOR = 12 * IN
ALTURA_PISO = 120 * IN

# (pisos, largo_in) -> (ETABS, SAP2000 malla refinada), en pulgadas
REF = {
    (6, 120): (2.3921, 2.4287), (6, 360): (0.0986, 0.1031), (6, 720): (0.0172, 0.0186),
    (3, 120): (0.3071, 0.3205), (3, 360): (0.0170, 0.0187), (3, 720): (0.0046, 0.0052),
    (1, 120): (0.0145, 0.0185), (1, 360): (0.0025, 0.0029), (1, 720): (0.0011, 0.0013),
}


def _desplazamiento_de_tope(pisos, largo_in, div_l=8, div_h=8):
    """Voladizo mallado en ShellDKGQ, carga UNITARIA en el tope."""
    largo, alto = largo_in * IN, pisos * ALTURA_PISO
    ops.wipe()
    ops.model("basic", "-ndm", 3, "-ndf", 6)
    ops.section("ElasticMembranePlateSection", 1, E, NU, ESPESOR, 0.0)

    nx, nz = div_l, pisos * div_h
    tag = lambda i, k: 1 + i + k * (nx + 1)  # noqa: E731
    for k in range(nz + 1):
        for i in range(nx + 1):
            ops.node(tag(i, k), i * largo / nx, 0.0, k * alto / nz)
            if k == 0:
                ops.fix(tag(i, k), 1, 1, 1, 1, 1, 1)
    e = 1
    for k in range(nz):
        for i in range(nx):
            ops.element("ShellDKGQ", e, tag(i, k), tag(i + 1, k),
                        tag(i + 1, k + 1), tag(i, k + 1), 1)
            e += 1

    # Diafragma de piso: todos los nudos del nivel con el MISMO desplazamiento
    # lateral. Es como lo modelo SAP2000 segun el manual (pag. 15-8); sin esto
    # la comparacion no es contra lo mismo.
    for p in range(1, pisos + 1):
        k = p * div_h
        for i in range(1, nx + 1):
            ops.equalDOF(tag(0, k), tag(i, k), 1)

    ops.timeSeries("Constant", 1)
    ops.pattern("Plain", 1, 1)
    ops.load(tag(0, nz), 1.0, 0, 0, 0, 0, 0)
    ops.system("BandGeneral")
    ops.numberer("RCM")
    ops.constraints("Transformation")
    ops.integrator("LoadControl", 1.0)
    ops.algorithm("Linear")
    ops.analysis("Static")
    ops.analyze(1)
    return ops.nodeDisp(tag(0, nz), 1)


@pytest.mark.skipif(ops is None, reason="openseespy no disponible")
def test_calza_con_la_malla_refinada_de_sap2000():
    nuestro = {k: _desplazamiento_de_tope(*k) for k in REF}
    # Un unico factor de carga para los nueve casos (minimos cuadrados).
    f = (sum(nuestro[k] * REF[k][1] for k in REF)
         / sum(nuestro[k] ** 2 for k in REF))

    peores = []
    for k, (_, sap) in REF.items():
        d = (nuestro[k] * f - sap) / sap
        peores.append((abs(d), k, nuestro[k] * f, sap))
    peores.sort(reverse=True)
    peor, caso, obtenido, esperado = peores[0]

    assert peor < 0.05, (
        f"peor desvio {peor:.1%} en {caso[0]} pisos x {caso[1]} in: "
        f"{obtenido:.4f} contra {esperado:.4f} de SAP2000"
    )


@pytest.mark.skipif(ops is None, reason="openseespy no disponible")
def test_etabs_es_mas_rigido_que_la_malla_refinada_y_no_es_error_nuestro():
    """Deja MEDIDA la distancia a ETABS, para no confundirla con un bug.

    Si algun dia esto empieza a fallar porque nos acercamos a ETABS, hay que
    mirarlo: querria decir que el elemento se endurecio y dejo de dar la
    solucion convergida.
    """
    nuestro = {k: _desplazamiento_de_tope(*k) for k in REF}
    f = (sum(nuestro[k] * REF[k][1] for k in REF)
         / sum(nuestro[k] ** 2 for k in REF))

    # El caso mas grueso de ETABS (1 piso = 1 panel) es el que mas se aparta.
    caso = (1, 120)
    etabs, sap = REF[caso]
    assert etabs / sap < 0.85, "ETABS deberia salir bastante mas rigido en el caso de 1 panel"
    assert abs(nuestro[caso] * f - sap) / sap < 0.05, "nosotros tenemos que quedar del lado de SAP2000"
