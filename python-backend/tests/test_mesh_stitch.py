"""
Costura de la malla de losa a los nudos que ya existen en su borde.

POR QUE ESTE ARCHIVO EXISTE APARTE DE LA RED DE REGRESION
    La red de regresion (tests/regresion) NO cubre esto: medido, la costura es
    un no-op en sus dos fixtures — `c23_muros` queda en 176 shells y `modulo5`
    en 36, exactamente los mismos que antes. O sea que el suite en verde no
    dice NADA sobre este cambio. Estos tests son la unica red que tiene.

QUE SE PRUEBA
    Solo la geometria de las divisiones, que es donde estan los errores
    silenciosos: un parametro mal calculado no rompe nada, deja la losa sin
    coser y el diafragma sin poder entregarle la fuerza a los muros — que es
    justo el bug que esto arregla, y que tardo una investigacion entera en
    aparecer.
"""

import pytest

from seismic import mesh_stitch as ms


CUAD = ((0.0, 0.0, 3.3), (4.0, 0.0, 3.3), (4.0, 3.0, 3.3), (0.0, 3.0, 3.3))


def _divs(puntos, nx=2, ny=2):
    return ms.divisiones(*CUAD, nx, ny, puntos)


def test_sin_puntos_la_grilla_queda_uniforme():
    us, vs = _divs(())
    assert us == pytest.approx([0.0, 0.5, 1.0])
    assert vs == pytest.approx([0.0, 0.5, 1.0])


def test_un_nudo_en_el_borde_parte_ese_borde():
    """Cabeza de muro en x=1.0 sobre el borde y=0: aparece u=0.25."""
    us, vs = _divs([(1.0, 0.0, 3.3)])
    assert us == pytest.approx([0.0, 0.25, 0.5, 1.0])
    assert vs == pytest.approx([0.0, 0.5, 1.0]), "el borde de v no se toca"


def test_el_borde_opuesto_tambien_cuenta():
    """El muro puede estar sobre cualquiera de los dos bordes del mismo eje."""
    us, _ = _divs([(3.0, 3.0, 3.3)])   # borde y=3
    assert us == pytest.approx([0.0, 0.5, 0.75, 1.0])


def test_un_nudo_en_el_otro_eje_va_a_v():
    _us, vs = _divs([(0.0, 1.0, 3.3)])
    assert vs == pytest.approx([0.0, 1.0 / 3.0, 0.5, 1.0])


def test_una_esquina_no_agrega_nada():
    """Las esquinas ya son divisiones; agregarlas daria un elemento de largo 0."""
    us, vs = _divs([(0.0, 0.0, 3.3), (4.0, 0.0, 3.3), (4.0, 3.0, 3.3)])
    assert us == pytest.approx([0.0, 0.5, 1.0])
    assert vs == pytest.approx([0.0, 0.5, 1.0])


def test_un_nudo_pegado_a_una_division_no_la_duplica():
    """
    Un nudo a 2.02 m cae casi encima de la division uniforme (u = 0.505 vs
    0.5). Partir ahi dejaria un elemento de 2 cm — peor que no coser.
    """
    us, _ = _divs([(2.02, 0.0, 3.3)])
    assert us == pytest.approx([0.0, 0.5, 1.0])


def test_un_nudo_que_NO_esta_sobre_el_borde_se_ignora():
    """
    A 30 cm del borde no es una cabeza de muro sobre la viga, es otra cosa.
    Partir el borde ahi ataria la losa a un nudo que no le corresponde.
    """
    us, vs = _divs([(1.0, 0.30, 3.3)])
    assert us == pytest.approx([0.0, 0.5, 1.0])
    assert vs == pytest.approx([0.0, 0.5, 1.0])


def test_la_tolerancia_perdona_el_ruido_de_coordenadas():
    """El payload redondea a mm; 1 cm tiene que seguir cosiendo."""
    us, _ = _divs([(1.0, 0.01, 3.3)])
    assert us == pytest.approx([0.0, 0.25, 0.5, 1.0])


def test_un_nudo_de_otra_cota_no_entra():
    """
    `nudos_a_coser` filtra por z: la losa de un piso no cose con la del otro.
    Pero la tolerancia (1 cm) SI perdona el ruido de coordenadas — un nudo a
    5 mm del plano es el mismo nudo, y descartarlo dejaria la losa sin coser
    por un redondeo.
    """
    lookup = {(1.0, 0.0, 3.3): 10, (1.0, 0.0, 6.5): 11,
              (2.0, 0.0, 3.305): 12, (3.0, 0.0, 3.4): 13}
    en_3_3 = sorted(ms.nudos_a_coser(lookup, 3.3))
    assert en_3_3 == [(1.0, 0.0, 3.3), (2.0, 0.0, 3.305)]
    assert (3.0, 0.0, 3.4) not in en_3_3, "10 cm ya es otro plano"
    assert ms.nudos_a_coser(lookup, 6.5) == [(1.0, 0.0, 6.5)]


def test_hay_tope_de_divisiones():
    """
    Una losa larga con muchos nudos en el borde no puede explotar la malla: el
    eigen se va de tiempo. Al pasarse, se cae a la grilla uniforme — una malla
    regular es preferible a una degenerada.
    """
    muchos = [(4.0 * i / (ms.MAX_DIVISIONES + 5), 0.0, 3.3)
              for i in range(1, ms.MAX_DIVISIONES + 5)]
    us, _ = _divs(muchos)
    assert us == pytest.approx([0.0, 0.5, 1.0])


def test_las_divisiones_quedan_ordenadas_y_cierran_en_1():
    us, vs = _divs([(1.0, 0.0, 3.3), (3.0, 0.0, 3.3), (0.0, 2.0, 3.3)])
    for lista in (us, vs):
        assert lista[0] == 0.0 and lista[-1] == 1.0
        assert lista == sorted(lista)
        assert all(b - a > ms.TOL_PARAMETRO for a, b in zip(lista, lista[1:]))
