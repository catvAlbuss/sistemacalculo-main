"""
seismic.mesh_stitch — cose la malla de losa a los nudos que ya existen en su borde.

EL PROBLEMA QUE RESUELVE
    La malla de losa se generaba por interpolacion bilineal de las esquinas de
    CADA losa, con divisiones uniformes. La malla de muro se genera por su
    lado. Resultado medido en el MODULO 01: de los 18 nudos de cabeza de muro
    que hay por piso, la losa compartia **5**. Los otros 13 quedaban a una
    mediana de 0.85 m del nudo de losa mas cercano — ninguno a menos de 5 cm.

    O sea que el diafragma recolectaba la fuerza lateral y **no tenia por donde
    entregarsela a los muros**. Se notaba solo cuando se apagaba el diafragma
    rigido: la rigidez en X se caia 23% (y en Y menos de 1%, porque la planta es
    7.13 x 20.86 y en Y el piso casi no trabaja como viga).

LA IDEA
    Un nudo de cabeza de muro cae SOBRE el borde de la losa (el muro corre por
    debajo de una viga, entre dos esquinas de la losa). Alcanza con **partir el
    borde ahi**: se agrega su posicion normalizada a la lista de divisiones.

    Como el punto esta sobre el borde, su parametro es exacto (la interpolacion
    es lineal a lo largo del borde), asi que el nudo de la grilla cae JUSTO
    encima y `node_lookup` lo reusa. No se mueve ningun nudo ni se deforma nada:
    la grilla solo se refina donde hace falta.

POR QUE NO SE SNAPEA EL NUDO MAS CERCANO
    Mover un nudo de la grilla hasta el del muro distorsiona los elementos
    vecinos y, con 85 cm de distancia mediana, bastante. Partir el borde no
    mueve nada.
"""

import math

# Un nudo esta SOBRE el borde si su distancia al segmento es menor que esto.
# 2 cm: muy por encima del ruido de coordenadas (el payload redondea a mm) y
# muy por debajo de cualquier separacion real entre un muro y una viga.
TOL_BORDE = 0.02

# Dos divisiones mas cerca que esto se consideran la misma: partir un borde en
# dos pedazos de 1 cm crearia elementos degenerados.
TOL_PARAMETRO = 0.01

# Tope de divisiones por lado. Sin esto, una losa larga con muchos nudos en el
# borde podria explotar la malla (y con ella el tiempo del eigen).
MAX_DIVISIONES = 24


def _parametro_en_borde(p, a, b):
    """Posicion normalizada de `p` sobre el segmento a→b, o None si no cae ahi."""
    dx, dy, dz = b[0] - a[0], b[1] - a[1], b[2] - a[2]
    L2 = dx * dx + dy * dy + dz * dz
    if L2 < 1e-12:
        return None
    s = ((p[0] - a[0]) * dx + (p[1] - a[1]) * dy + (p[2] - a[2]) * dz) / L2
    if not (TOL_PARAMETRO < s < 1.0 - TOL_PARAMETRO):
        return None
    q = (a[0] + s * dx, a[1] + s * dy, a[2] + s * dz)
    return s if math.dist(p, q) <= TOL_BORDE else None


def _fusionar(valores):
    """Ordena y colapsa los que quedan mas cerca que TOL_PARAMETRO."""
    salida = []
    for v in sorted(valores):
        if not salida or v - salida[-1] > TOL_PARAMETRO:
            salida.append(v)
    if salida and 1.0 - salida[-1] <= TOL_PARAMETRO:
        salida.pop()
    return salida


def _fuera_de_caja(p, caja):
    """Descarte barato antes del calculo del parametro."""
    return not (caja[0] <= p[0] <= caja[1] and caja[2] <= p[1] <= caja[3])


def divisiones(p00, p10, p11, p01, nx, ny, puntos):
    """
    Listas de parametros u y v de la grilla, con las divisiones uniformes MAS
    las posiciones de `puntos` que caen sobre los bordes del cuadrilatero.

    `puntos` son coordenadas (x, y, z) de nudos que ya existen. Se miran los
    cuatro bordes: los de u (p00→p10 y p01→p11) alimentan la lista u, los de v
    (p00→p01 y p10→p11) alimentan la v.

    Devuelve `(us, vs)`, cada una empezando en 0.0 y terminando en 1.0.
    """
    us = {i / nx for i in range(nx + 1)}
    vs = {i / ny for i in range(ny + 1)}

    # Caja del cuadrilatero, con la tolerancia de borde de margen. Un nudo que
    # cae afuera no puede estar sobre ningun borde, y descartarlo asi cuesta
    # cuatro comparaciones en vez de cuatro proyecciones. Importa: esto corre
    # por CADA losa y CADA nudo del piso — en el modelo del usuario eran 2.2
    # millones de llamadas a `_parametro_en_borde`, 6 s del analisis.
    xs = (p00[0], p10[0], p11[0], p01[0])
    ys = (p00[1], p10[1], p11[1], p01[1])
    caja = (min(xs) - TOL_BORDE, max(xs) + TOL_BORDE,
            min(ys) - TOL_BORDE, max(ys) + TOL_BORDE)

    for p in puntos or ():
        if _fuera_de_caja(p, caja):
            continue
        for a, b in ((p00, p10), (p01, p11)):
            s = _parametro_en_borde(p, a, b)
            if s is not None:
                us.add(s)
        for a, b in ((p00, p01), (p10, p11)):
            s = _parametro_en_borde(p, a, b)
            if s is not None:
                vs.add(s)

    us = _fusionar(us) + [1.0]
    vs = _fusionar(vs) + [1.0]

    # El tope se aplica quedandose con las divisiones UNIFORMES si la cosa se
    # fue de las manos: es preferible una malla regular a una degenerada.
    if len(us) - 1 > MAX_DIVISIONES:
        us = [i / nx for i in range(nx + 1)]
    if len(vs) - 1 > MAX_DIVISIONES:
        vs = [i / ny for i in range(ny + 1)]
    return us, vs


def nudos_a_coser(node_lookup, z, tolerancia_z=0.01):
    """
    Coordenadas de los nudos ya existentes que estan en el plano `z`.

    `node_lookup` es el mapa coordenada→tag que comparten el mallado de muros y
    el de losas (lo puebla `_build_wall_mesh_plan`), asi que trae los nudos del
    payload (columnas, vigas) Y los de la malla de muro. Los dos sirven: coser
    la losa a una viga partida es tan util como coserla a un muro.
    """
    return [k for k in node_lookup if abs(k[2] - z) <= tolerancia_z]
