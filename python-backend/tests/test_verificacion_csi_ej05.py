"""
Capa 2 de la red de regresion — CSI Verification, Analysis Example 5.

Edificio en L de 3 pisos con cuatro porticos arriostrados. Va aparte de
`test_verificacion_csi.py` porque necesita bastante andamiaje propio (el
reparto de masa que calza el MOI) y aquel archivo ya esta grande.

Fuente: ETABS 22 > Manuals > Verification > Analysis > Example 5.


DATOS DEL MANUAL
----------------
Planta: cuadrado de 80x80 ft MENOS el cuadrante superior derecho de 40x40.
Tres pisos de 12 ft. Cuatro porticos identicos de 2 vanos de 20 ft (= 40 ft),
arriostrados en X. Todas las barras: A = 6 in2, E = 29500 ksi, y solo trabajan
a fuerza axial. Masa de piso 1.242 kip-s2/in, MOI de piso 174907.4 kip-s2-in,
centro de masa a 33 ft 4 in de cada eje. Periodos: 0.32686 y 0.32061 s.


COMO SE FIJO LA GEOMETRIA (la figura no da las coordenadas de los porticos)
--------------------------------------------------------------------------
1. La forma esta confirmada por el CM: el centroide de esa L da exactamente
   (33.333, 33.333) ft, que es el 33 ft 4 in que declara el manual.

2. El MOI tambien: el radio de giro polar de la L uniforme sobre su centroide
   da 977.8 ft2, y el MOI/masa del manual da 978.0 ft2. O sea que la masa de
   CSI es la masa uniforme de la L, no un valor aparte.

3. Los porticos salieron de barrer TODOS los arreglos simetricos respecto de
   la diagonal y = x sobre la grilla de 20 ft (33 arreglos). Uno solo calza:

     y=0  de x 20 a 60      x=0  de y 20 a 60      (centrados en los bordes
     y=80 de x  0 a 40      x=80 de y  0 a 40       largos / bordes cortos
                                                    enteros)

   Da 0.32685 y 0.32061 contra 0.32686 y 0.32061 del manual: los DOS periodos
   a cinco cifras. El segundo mejor se va a -3.1% y el resto entre 6% y 25%.

   Tiene sentido fisico y no es solo ajuste: en este arreglo los cuatro
   porticos NO comparten ningun nudo. Con Kxy = 0 las dos traslaciones
   desacopladas caen las dos en 0.32061 y la torsion sube una sola a 0.32686,
   que es exactamente la firma del par que reporta el manual. En los arreglos
   que comparten la columna de una esquina ese acoplamiento mete el modo por
   DEBAJO del desacoplado, y el manual lo tiene por arriba.

   Ademas calza con la figura: el tramo vertical arriostrado de 2 vanos que se
   ve con la cota de 80'-0" al lado es el borde x=80 de y=0 a y=40 (el borde
   derecho entero, la mitad de los 80 ft), y la linea punteada arriba de su
   nudo superior es la esquina entrante en (80, 40).

POR QUE EL MODO PURO ES UNA VERIFICACION FUERTE
-----------------------------------------------
0.32061 s aparece en TODOS los arreglos probados, con rotacion y sin ella: en
una planta simetrica respecto de la diagonal y con el CM sobre ella, la
traslacion en la direccion (1,1) es simetrica y no se puede acoplar con la
torsion, asi que se queda en su periodo desacoplado. Que el manual reporte
exactamente ese valor dice dos cosas: el modelo de CSI tambien es simetrico
respecto de la diagonal, y nuestra rigidez axial de diagonales mas la masa
estan exactas. Lo unico que depende del arreglo es el otro modo.


DOS COSAS QUE HAY QUE HACER BIEN O EL EJEMPLO NO SIRVE
------------------------------------------------------
1. **Diafragma CON rotacion.** El motor usa equalDOF(UX,UY) por defecto, que
   ata las dos traslaciones y deja el piso SIN poder girar. Este ejemplo no
   existe sin rotacion: el manual da un MOI de piso justamente porque el modo
   1 es traslacion acoplada con torsion. Con el default ese modo no aparece y
   T1 sale corto. Hay que pedir `rigidDiaphragmRotation`.

2. **Hay que calzar masa, CM y MOI a la vez.** Con diafragma rigido el piso es
   un cuerpo rigido y esas tres cantidades son lo UNICO que importa, asi que
   cualquier montaje que las calce equivale al modelo de CSI. Y hay que calzar
   las TRES: sin corregir el MOI el modo torsional sale 46% largo (0.244 s
   contra 0.167) y arrastra al modo acoplado.

   El MOI no se puede armar repartiendo masa sobre los nudos: TODOS los nudos
   de los porticos estan mas lejos del CM que el radio de giro de la L (el mas
   cercano da r2 = 1155 ft2 y el manual pide 978 ft2), asi que cualquier
   reparto POSITIVO da un J de mas. Es logico: la masa de ETABS esta repartida
   sobre toda el area de la losa, incluida la zona central, donde este modelo
   no tiene ni un nudo. Entonces se hace en dos partes — masa positiva
   repartida que calza masa y CM, y el J se baja al valor del manual con un
   `mass_rz` NEGATIVO en el diafragma. Lo que queda positivo es el TOTAL
   condensado, que es lo unico que ve un cuerpo rigido. Un nudo suelto en el CM
   no sirve como alternativa: sin elementos, sus grados UZ, RX y RY quedan sin
   rigidez y el eigen sale singular.

   Esto hubo que arreglarlo en el motor (ver seismic/inputs.py): `ops.mass()`
   cableaba la inercia rotacional en 1e-9 — o sea que un momento de inercia de
   masa de piso, que es lo que ETABS produce con Mass Source lumpeada a pisos,
   no se podia representar — y ademas la guarda de aplicacion era `> 0`, que
   DESCARTABA EN SILENCIO cualquier masa negativa. Con eso roto los numeros de
   este ejemplo salian absurdos: bajar J alargaba el periodo torsional, que es
   fisicamente imposible.

"Solo fuerza axial" NO se hace con liberaciones de extremo: soltando las dos
flexiones en los dos extremos de TODAS las barras ningun elemento aporta
rigidez rotacional, los nudos quedan sueltos y el eigen da periodos de 2930 s,
o sea un mecanismo. Se hace con inercia despreciable.
"""



import pytest

ops = pytest.importorskip("openseespy.opensees", reason="sin OpenSees no hay eigen")

from seismic.inputs import build_model_3d          # noqa: E402
from seismic.solver import run_modal_analysis      # noqa: E402

KIP = 4448.2216152605
IN = 0.0254
FT = 0.3048

E = 29_500.0 * KIP / IN**2
A = 6.0 * IN**2
MASA = 1.242 * KIP / IN                 # kg por piso
MOI = 174_907.4 * KIP * IN              # kg*m2 por piso
ALTO = 12.0 * FT
CM = (33.3333 * FT, 33.3333 * FT)
R2 = MOI / MASA                         # radio de giro al cuadrado, m2
CSI = (0.32686, 0.32061)
I_NULA = 1e-7

# (origen en ft, direccion). Cada portico mide 2 vanos de 20 ft.
PORTICOS = [((20, 0), (1, 0)),    # borde de abajo, centrado
            ((0, 80), (1, 0)),    # borde de arriba, entero
            ((0, 20), (0, 1)),    # borde izquierdo, centrado
            ((80, 0), (0, 1))]    # borde derecho, entero
# Arreglo alternativo, con dos porticos compartiendo la columna de (0,0).
CON_ESQUINA_COMPARTIDA = [((0, 0), (1, 0)), ((0, 80), (1, 0)),
                          ((0, 0), (0, 1)), ((80, 0), (0, 1))]


def _resolver(A2, b2):
    """Gauss con pivoteo, para no traer numpy al test."""
    n = len(b2)
    M = [row[:] + [b2[i]] for i, row in enumerate(A2)]
    for c in range(n):
        p = max(range(c, n), key=lambda r: abs(M[r][c]))
        M[c], M[p] = M[p], M[c]
        for r in range(n):
            if r != c:
                f = M[r][c] / M[c][c]
                for k in range(c, n + 1):
                    M[r][k] -= f * M[c][k]
    return [M[r][n] / M[r][r] for r in range(n)]


def _pesos(xs, ys):
    """Pesos de masa POSITIVOS que calzan masa total y centro de masa.

    Solo esas dos: el MOI no se puede pedir acá porque TODOS los nudos de los
    porticos estan mas lejos del CM que el radio de giro de la L (ver nota 2
    del encabezado). Se corrige aparte, con `mass_rz` en el diafragma.
    """
    n = len(xs)
    fil = [[1.0] * n, list(xs), list(ys)]
    b = [1.0, CM[0], CM[1]]
    w0 = [1.0 / n] * n
    resto = [b[r] - sum(fil[r][i] * w0[i] for i in range(n)) for r in range(3)]
    gram = [[sum(fil[r][i] * fil[c][i] for i in range(n)) for c in range(3)]
            for r in range(3)]
    mult = _resolver(gram, resto)
    return [w0[i] + sum(mult[r] * fil[r][i] for r in range(3)) for i in range(n)]


def _correccion_moi(xs, ys, w):
    """Cuanto hay que sumarle al J del piso para llegar al MOI del manual.

    Sale NEGATIVO, y tiene que salir negativo: la masa repartida sobre los
    nudos de los porticos da mas inercia rotacional que el piso real. Lo que
    queda positivo es el total condensado (J_repartido + correccion = MOI).
    """
    j = MASA * sum(wi * ((x - CM[0]) ** 2 + (y - CM[1]) ** 2)
                   for wi, x, y in zip(w, xs, ys))
    return MOI - j


def _modelo(porticos, con_rotacion):
    nodos, elementos, apoyos, diaf, tag = [], [], [], [], {}

    def nodo(x, y, z):
        k = (round(x, 4), round(y, 4), round(z, 4))
        if k not in tag:
            tag[k] = len(nodos) + 1
            nodos.append({"id": tag[k], "x": x, "y": y, "z": z})
        return tag[k]

    def barra(a, b, tipo):
        elementos.append({"id": len(elementos) + 1, "node_i": a, "node_j": b,
                          "A": A, "E": E, "G": E / 2.4, "Iy": I_NULA,
                          "Iz": I_NULA, "J": I_NULA, "elementType": tipo})

    for (ox, oy), (dx, dy) in porticos:
        def p(i, k, ox=ox, oy=oy, dx=dx, dy=dy):
            return nodo((ox + dx * 20.0 * i) * FT, (oy + dy * 20.0 * i) * FT,
                        k * ALTO)

        for k in range(4):
            for i in range(3):
                p(i, k)
        for i in range(3):
            for k in range(3):
                barra(p(i, k), p(i, k + 1), "column")
        for i in range(2):
            for k in range(1, 4):
                barra(p(i, k), p(i + 1, k), "beam")
                barra(p(i, k - 1), p(i + 1, k), "brace")
                barra(p(i + 1, k - 1), p(i, k), "brace")

    for nd in nodos:
        if abs(nd["z"]) < 1e-9:
            apoyos.append({"node": nd["id"], "ux": 1, "uy": 1, "uz": 1,
                           "rx": 1, "ry": 1, "rz": 1})

    for k in range(1, 4):
        z = k * ALTO
        piso = [nd for nd in nodos if abs(nd["z"] - z) < 1e-9]
        xs = [nd["x"] for nd in piso]
        ys = [nd["y"] for nd in piso]
        w = _pesos(xs, ys)
        for nd, wi in zip(piso, w):
            nd["mass_x"] = nd["mass_y"] = MASA * wi
        # El MOI del piso, en un solo nudo: con diafragma rigido el RZ de todos
        # es el mismo grado, asi que da igual en cual se ponga. Sin rotacion no
        # se pone: ahi cada RZ es un grado LIBRE y la correccion negativa, que
        # solo tiene sentido sobre el total condensado, lo dejaria sin masa.
        if con_rotacion:
            piso[0]["mass_rz"] = _correccion_moi(xs, ys, w)
        diaf.append({"id": f"D{k}", "name": f"D{k}", "z": z,
                     "nodeIds": [nd["id"] for nd in piso]})

    return {"nodes": nodos, "elements": elementos, "supports": apoyos,
            "diaphragms": diaf, "useRigidDiaphragms": True,
            "rigidDiaphragmRotation": con_rotacion,
            "loads": [], "walls": [], "slabs": [],
            "stories": [{"name": "Base", "elevation": 0.0}]
                       + [{"name": f"Story{i}", "elevation": i * ALTO}
                          for i in (1, 2, 3)],
            "massSource": {"enabled": False}, "shearDeformations": False}


def _periodos(porticos, con_rotacion=True):
    ops.wipe()
    nodes, _ = build_model_3d(_modelo(porticos, con_rotacion))
    info = run_modal_analysis(nodes, 6).get("modal_info") or []
    return [m["period"] for m in info[:3]]


def test_ej5_el_piso_reproduce_masa_cm_y_moi_del_manual():
    """Si la terna no calza, el resto del ejemplo no significa nada.

    Se verifica la inercia CONDENSADA del piso, que con diafragma rigido es lo
    unico que existe: la masa repartida sobre los nudos mas la correccion
    `mass_rz`. La masa repartida sola da un J casi el doble del real.
    """
    data = _modelo(PORTICOS, True)
    piso = [nd for nd in data["nodes"] if abs(nd["z"] - ALTO) < 1e-9]
    m = [nd["mass_x"] for nd in piso]
    total = sum(m)
    cx = sum(mi * nd["x"] for mi, nd in zip(m, piso)) / total
    cy = sum(mi * nd["y"] for mi, nd in zip(m, piso)) / total
    j_repartido = sum(mi * ((nd["x"] - CM[0]) ** 2 + (nd["y"] - CM[1]) ** 2)
                      for mi, nd in zip(m, piso))
    correccion = sum(nd.get("mass_rz", 0.0) for nd in piso)

    assert min(m) > 0, "la masa repartida tiene que ser toda positiva"
    assert total == pytest.approx(MASA, rel=1e-9)
    assert (cx, cy) == pytest.approx(CM, rel=1e-9)
    assert j_repartido + correccion == pytest.approx(MOI, rel=1e-9)
    assert correccion < 0, "la correccion tiene que BAJAR el J, no subirlo"


def test_ej5_ningun_reparto_positivo_puede_dar_el_moi():
    """El porque de la correccion negativa, medido y no asumido."""
    data = _modelo(PORTICOS, True)
    piso = [nd for nd in data["nodes"] if abs(nd["z"] - ALTO) < 1e-9]
    r2_min = min((nd["x"] - CM[0]) ** 2 + (nd["y"] - CM[1]) ** 2 for nd in piso)
    assert r2_min > R2, (
        f"el nudo mas cercano al CM esta a r2 = {r2_min / FT**2:.0f} ft2 y el "
        f"manual pide {R2 / FT**2:.0f} ft2: con pesos positivos no se llega"
    )


def test_ej5_el_modo_desacoplado_calza_exacto_con_csi():
    """T2 es la traslacion pura: no depende del arreglo, solo de barras y masa."""
    t2 = _periodos(PORTICOS)[1]
    assert t2 == pytest.approx(CSI[1], rel=1e-4), \
        f"T2 = {t2:.5f} s, el manual da {CSI[1]:.5f} s"


def test_ej5_el_modo_acoplado_calza_con_csi():
    """T1 es traslacion + torsion; el unico sensible a donde van los porticos."""
    t1 = _periodos(PORTICOS)[0]
    assert t1 == pytest.approx(CSI[0], rel=0.01), \
        f"T1 = {t1:.5f} s, el manual da {CSI[0]:.5f} s"


def test_ej5_los_dos_periodos_quedan_casi_pegados_como_en_el_manual():
    """El manual los separa 1.95%. Un arreglo mal puesto los abre mucho mas."""
    t1, t2, _ = _periodos(PORTICOS)
    assert (t1 - t2) / t2 < 0.04, \
        f"separacion {(t1 - t2) / t2:.2%}, el manual da 1.95%"


def test_ej5_sin_rotacion_de_diafragma_el_modo_acoplado_desaparece():
    """Con el equalDOF(UX,UY) por defecto el piso no gira y no hay que acoplar.

    Los dos modos se quedan pegados en el desacoplado y el T1 del manual no
    aparece por ningun lado.
    """
    t1 = _periodos(PORTICOS, con_rotacion=False)[0]
    assert t1 == pytest.approx(CSI[1], rel=1e-4), (
        f"sin rotacion los dos modos deberian quedarse en {CSI[1]:.5f}; "
        f"dio {t1:.5f}"
    )
    assert t1 < CSI[0] * 0.995, "el T1 del manual no se puede reproducir sin rotacion"


def test_ej5_si_dos_porticos_comparten_una_esquina_el_modo_se_va_para_abajo():
    """Guarda de la lectura de la planta.

    Compartir la columna de (0,0) mete un termino Kxy que separa las dos
    traslaciones desacopladas, y el modo acoplado termina POR DEBAJO del puro.
    El manual lo tiene por ARRIBA (0.32686 > 0.32061), asi que ese arreglo
    queda descartado por la forma del resultado, no por un ajuste fino.
    """
    Ts = _periodos(CON_ESQUINA_COMPARTIDA)
    assert max(Ts) == pytest.approx(CSI[1], rel=1e-4), (
        f"el modo mas largo deberia ser el puro {CSI[1]:.5f}; dio {max(Ts):.5f}"
    )
