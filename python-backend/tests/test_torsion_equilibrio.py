"""
Torsión de EQUILIBRIO: la que exige la estática y no se puede redistribuir.

POR QUÉ EXISTE
  La torsión que medimos en las columnas de los modelos sale 50-67 % por debajo
  de ETABS. Eso es torsión de COMPATIBILIDAD (ACI 318-14 22.7.3.2 hasta permite
  reducirla a phi*Tcr, porque al fisurar se redistribuye), y en esos modelos cae
  20-34x por debajo del umbral de desprecio 22.7.4.1, así que no cambia el
  diseño.

  Pero hay casos donde la torsión es de EQUILIBRIO —voladizos, vigas de borde
  con losa excéntrica, vigas curvas, vigas de acople—: ahí no hay redistribución
  posible y un error del 60 % sería un problema de seguridad. Este test separa
  las dos cosas: comprueba que el elemento y la extracción de fuerzas locales
  reproducen EXACTO un caso con respuesta cerrada, de modo que cualquier
  desviación futura se pueda atribuir a la distribución de rigideces y no a la
  formulación.

CASO
  Voladizo de luz L sobre X, con un brazo rígido de longitud e sobre Y en la
  punta y una carga P vertical en el extremo del brazo. En el voladizo:
      T  = P*e     (constante)      M  = P*L        V  = P
"""
import pytest

ops = pytest.importorskip("openseespy.opensees")

L, E_BRAZO, P = 5.0, 2.0, 10_000.0     # m, m, N
E, G = 2.1e10, 8.75e9                  # Pa
A, J, IY, IZ = 0.18, 0.00370786, 0.00135, 0.0054   # V 30x60


def _resolver():
    ops.wipe()
    ops.model("basic", "-ndm", 3, "-ndf", 6)
    ops.node(1, 0.0, 0.0, 0.0)
    ops.node(2, L, 0.0, 0.0)
    ops.node(3, L, E_BRAZO, 0.0)
    ops.fix(1, 1, 1, 1, 1, 1, 1)
    ops.geomTransf("Linear", 1, 0, 0, 1)
    ops.geomTransf("Linear", 2, 0, 0, 1)
    ops.element("elasticBeamColumn", 1, 1, 2, A, E, G, J, IY, IZ, 1)
    # Brazo 1000x más rígido: transmite la excentricidad sin deformarse.
    ops.element("elasticBeamColumn", 2, 2, 3, A, E, G, J * 1e3, IY * 1e3, IZ * 1e3, 2)
    ops.timeSeries("Linear", 1)
    ops.pattern("Plain", 1, 1)
    ops.load(3, 0.0, 0.0, -P, 0.0, 0.0, 0.0)
    ops.system("BandGeneral")
    ops.numberer("RCM")
    ops.constraints("Transformation")
    ops.integrator("LoadControl", 1.0)
    ops.algorithm("Linear")
    ops.analysis("Static")
    assert ops.analyze(1) == 0
    return ops.eleResponse(1, "localForce")


def test_torsion_de_equilibrio_es_P_por_e():
    assert abs(_resolver()[3]) == pytest.approx(P * E_BRAZO, rel=1e-6)


def test_flexion_y_cortante_del_mismo_caso():
    f = _resolver()
    assert abs(f[4]) == pytest.approx(P * L, rel=1e-6)
    assert abs(f[2]) == pytest.approx(P, rel=1e-6)
