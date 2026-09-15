# -*- coding: utf-8 -*-
"""python-backend/design/wall_section.py

Sección de PLACA dibujada en el Section Designer de ETABS: convierte la lista de
"shapes" (la misma que el `.e2k` guarda en `$ SECTION DESIGNER SECTIONS`) en lo
que come el motor de fibra — contorno, fibras y varillas con su área.

POR QUÉ UN ARCHIVO APARTE
    `column_interaction.compute_pn_mn_at` es agnóstico a la forma: recibe fibras
    `(x, y, area)` y varillas `(x, y, area)`. Todo lo específico de una placa
    —varias piezas de concreto, armado por objetos, catálogo de varillas— vive
    acá y no engorda el motor.

EJES — SD contra locales
    El `.e2k` da las shapes en las coordenadas de la ventana del Section
    Designer, (X, Y). Los ejes locales de la sección son (u, v) = (eje 2, eje 3),
    que es lo que usan `l_section_vertices` y el motor. El mapeo es:

        u (eje 2, peralte) = +Y_sd        v (eje 3, ancho) = +X_sd

    O sea SD y locales están transpuestos. NO es una suposición: se fijó con el
    punto 1 de la tabla Curve Data de la `PL1` del MODULO 01 probando las ocho
    combinaciones de permutación y signo — solo esta da (M2, M3) =
    (−4.6226, +2.8237); la siguiente mejor erra 2.5 tonf·m. Después las 24 curvas
    completas cerraron con error medio 0.0126 tonf·m sobre 264 puntos.

    OJO: las flechas rojas que dibuja la ventana del Section Designer sugieren
    que el eje 3 apunta hacia −X. Los datos dicen +X. Ganan los datos; si alguien
    va a "corregir" esto, que reproduzca antes la tabla de PL1.

    El `ANGLE` de la cabecera de la SDSECTION (90 en PL1, PL2 y PL3) se IGNORA:
    ignorándolo se reproduce la tabla exacta, así que es el ángulo de colocación
    de la sección en la barra, no de la sección en sí. Con otro valor de ANGLE no
    está probado.

FORMAS SOPORTADAS
    Concreto : POLYGON · CONC RECTANGULAR · CONC L · CONC T · CONC CIRCLE
    Armado   : REBAR (suelta) · LINE REBAR (línea) · RECT REBAR (jaula) ·
               CIRCLE REBAR (varillas repartidas en una circunferencia)

    Cada pieza de concreto lleva su propio `mirror2`, `mirror3` y `rotation`,
    como en el diálogo de ETABS.

Ver project-wall-design-module para el registro completo de la validación.
"""

import math

from .column_polygon import (
    l_section_vertices,
    point_in_polygon,
    polygon_area,
    polygon_centroid,
    tee_section_vertices,
)

__all__ = [
    "construir_seccion",
    "barras_en_circulo",
    "barras_en_linea",
    "barras_en_jaula",
    "vertices_de_pieza",
]

# Cuánto tiene que faltar respecto de la suma de las piezas para declarar que se
# solapan. Holgado a propósito: el estimador es la malla, que trae su propio
# sesgo de muestreo de 1-2%, así que un umbral chico daría falsos positivos.
TOL_SOLAPE = 0.05

# Cuánto tolera ETABS pasarse del espaciamiento MÁXIMO de una LINE REBAR antes
# de meter una varilla más. Medido, no supuesto: ver _cuantas_barras.
TOL_ESPACIAMIENTO = 0.05

# Lados con los que se poligoniza un círculo. El radio se corrige para que el
# área del polígono dé EXACTAMENTE la del círculo (ver _circulo_vertices): sin
# eso un polígono de 72 lados subestima el área un 0.06%, y eso entra derecho
# en Po.
LADOS_CIRCULO = 72


def _sd_a_local(x, y):
    """(X, Y) del Section Designer → (u, v) = (eje 2, eje 3). Ver EJES arriba."""
    return (y, x)


def _rotar(pts, grados):
    """Gira los vértices alrededor del origen local de la pieza."""
    if not grados:
        return pts
    r = math.radians(float(grados))
    c, s_ = math.cos(r), math.sin(r)
    return [(u * c - v * s_, u * s_ + v * c) for u, v in pts]


def _circulo_vertices(diametro, lados=LADOS_CIRCULO):
    """
    Círculo poligonizado, con el radio CORREGIDO para que el área del polígono
    sea exactamente la del círculo:  A_pol = n/2 · r² · sin(2π/n).
    Sin la corrección, 72 lados subestiman el área un 0.06%.
    """
    d = float(diametro)
    if d <= 0:
        return []
    r = d / 2.0
    n = max(12, int(lados))
    r_corr = r * math.sqrt((2.0 * math.pi / n) / math.sin(2.0 * math.pi / n))
    return [(r_corr * math.cos(2 * math.pi * k / n), r_corr * math.sin(2 * math.pi * k / n))
            for k in range(n)]


def _rect_vertices(depth, width):
    """Rectángulo centrado en el origen, en ejes locales (u = peralte D)."""
    hd, hb = float(depth) / 2.0, float(width) / 2.0
    if hd <= 0 or hb <= 0:
        return []
    return [(hd, hb), (-hd, hb), (-hd, -hb), (hd, -hb)]


def _clave(shape, *nombres, defecto=None):
    """Lee la primera clave que exista, en cualquier capitalización.

    El importador JS y el `.e2k` no usan el mismo nombre para todo (`XC` vs
    `xc` vs `x`), y no vale la pena obligar al llamador a normalizar."""
    for n in nombres:
        for k in (n, n.lower(), n.upper()):
            if isinstance(shape, dict) and k in shape and shape[k] is not None:
                return shape[k]
    return defecto


def _num(shape, *nombres, defecto=0.0):
    try:
        return float(_clave(shape, *nombres, defecto=defecto))
    except (TypeError, ValueError):
        return float(defecto)


def _tipo(shape):
    """SHAPETYPE normalizado: 'POLYGON', 'CONC L', 'LINE REBAR', ..."""
    bruto = _clave(shape, "shapeType", "type", "SHAPETYPE", defecto="")
    return " ".join(str(bruto).upper().split())


def vertices_de_pieza(shape, mirror2=None, mirror3=None):
    """
    Vértices de UNA pieza de concreto, en ejes locales y ya trasladada a su
    (XC, YC). Devuelve [] si la forma no se reconoce o no cierra.

    ESPEJO Y ROTACIÓN SON PROPIEDADES DE LA SHAPE, no de la sección: cada figura
    tiene su `mirror2`, `mirror3` y `rotation`, igual que en el diálogo de ETABS.
    Los argumentos son solo el valor por defecto para cuando la shape no los trae
    (el `.e2k` no exporta el espejo de una SDSECTION y hay que deducirlo).

    Que sean por shape NO es un detalle: con una sola bandera para toda la
    sección, agregar una segunda L le daba vuelta la primera.
    """
    t = _tipo(shape)
    m2 = _clave(shape, "mirror2")
    m3 = _clave(shape, "mirror3")
    mirror2 = bool(mirror2) if m2 is None else bool(m2)
    mirror3 = bool(mirror3) if m3 is None else bool(m3)
    rotacion = _num(shape, "rotation", "ROTATION", defecto=0.0)
    xc, yc = _num(shape, "XC", "x"), _num(shape, "YC", "y")
    uc, vc = _sd_a_local(xc, yc)

    if t == "POLYGON":
        esquinas = _clave(shape, "corners", "polyCorners", "POLYCORNER", defecto=[]) or []
        pts = []
        for c in esquinas:
            if isinstance(c, dict):
                pts.append(_sd_a_local(_num(c, "X", "x"), _num(c, "Y", "y")))
            else:
                pts.append(_sd_a_local(float(c[0]), float(c[1])))
        # Un POLYGON ya trae sus vértices en coordenadas absolutas de la sección:
        # el XC/YC de la línea, si viene, no se vuelve a sumar.
        return pts if len(pts) >= 3 else []

    D, B = _num(shape, "D", "depth"), _num(shape, "B", "width")
    TF, TW = _num(shape, "TF", "flangeThick"), _num(shape, "TW", "webThick")

    if t in ("CONC CIRCLE", "CIRCLE", "CONC CIRCULAR"):
        base = _circulo_vertices(_num(shape, "diameter", "DIAMETER", "D", defecto=0.0))
    elif t in ("CONC RECTANGULAR", "CONC RECTANGLE", "CONC RECT", "RECTANGULAR"):
        base = _rect_vertices(D, B)
    elif t == "CONC L":
        base = l_section_vertices(D, B, TF, TW, mirror2, mirror3)
    elif t in ("CONC T", "CONC TEE"):
        base = tee_section_vertices(D, B, TF, TW)
        if mirror2:
            base = [(u, -v) for u, v in base]
        if mirror3:
            base = [(-u, v) for u, v in base]
    else:
        return []

    return [(u + uc, v + vc) for u, v in _rotar(base, rotacion)]


def _cuantas_barras(largo, espaciamiento, con_extremos):
    """
    Cuántas varillas entran en un segmento y en qué fracciones del recorrido.

    ETABS guarda el espaciamiento MÁXIMO, no la cantidad: el diálogo muestra
    `Number of Bars` ya derivado. La cantidad de intervalos sale de
    `ceil(largo/espaciamiento)` y las varillas van en las divisiones interiores
    cuando ENDBAR = "NO".

    EL MÁXIMO NO ES ESTRICTO — medido en ETABS, con la LINE REBAR #5 de la PL2
    (sp_max = 0.15), moviendo su extremo:

        L = 0.300051   L/sp = 2.0003   ETABS: 1 varilla
        L = 0.310051   L/sp = 2.0670   ETABS: 1 varilla   <- espaciamiento real
                                       0.15503, un 3.35% POR ENCIMA del máximo
        L = 0.315051   L/sp = 2.1003   ETABS: 2 varillas  <- recién acá parte

    O sea tolera pasarse del máximo hasta algo entre 3.35% y 5.02%. Se usa 5%,
    que deja el salto exactamente en L/sp = 2.1. Sin esa tolerancia, alargar una
    línea un milímetro ya metía una varilla de más y el editor parecía inventar
    armado.

    PENDIENTE: el umbral exacto está acotado entre 3.35% y 5.02%; para fijarlo
    hay que bisecar en ETABS entre X2 = 0.2446 y 0.2496 de esa misma línea.
    Cualquier valor del intervalo reproduce todo lo medido hasta hoy.
    """
    if largo <= 0 or espaciamiento <= 0:
        return []
    n = max(1, math.ceil(largo / (espaciamiento * (1.0 + TOL_ESPACIAMIENTO))))
    if con_extremos:
        return [i / n for i in range(n + 1)]
    return [i / n for i in range(1, n)]


def barras_en_linea(x1, y1, x2, y2, espaciamiento, area, con_extremos=False):
    """LINE REBAR → varillas `(u, v, area)`. Extremos en coordenadas SD."""
    u1, v1 = _sd_a_local(x1, y1)
    u2, v2 = _sd_a_local(x2, y2)
    largo = math.hypot(u2 - u1, v2 - v1)
    return [(u1 + (u2 - u1) * t, v1 + (v2 - v1) * t, area)
            for t in _cuantas_barras(largo, espaciamiento, con_extremos)]


def barras_en_jaula(depth, width, xc, yc, lados, area_esquina, area_lado):
    """
    RECT REBAR → la jaula rectangular de un elemento de borde: una varilla en
    cada esquina más las de cada lado, repartidas por espaciamiento máximo.

    `lados` son los cuatro EDGEBARSPACING, en el orden en que vienen en el
    archivo. En el MODULO 01 los cuatro valen lo mismo (0.12 en la PLACA L), así
    que cuál lado es cuál NO está verificado — acá se toman como
    (abajo, derecha, arriba, izquierda) sobre el rectángulo en ejes locales.
    """
    uc, vc = _sd_a_local(xc, yc)
    hd, hb = float(depth) / 2.0, float(width) / 2.0
    if hd <= 0 or hb <= 0:
        return []

    esquinas = [(uc + hd, vc + hb), (uc - hd, vc + hb),
                (uc - hd, vc - hb), (uc + hd, vc - hb)]
    barras = [(u, v, area_esquina) for u, v in esquinas]

    # Cada lado va entre dos esquinas; las esquinas ya están puestas, así que
    # solo entran las divisiones interiores.
    tramos = [(esquinas[0], esquinas[1]), (esquinas[1], esquinas[2]),
              (esquinas[2], esquinas[3]), (esquinas[3], esquinas[0])]
    for i, ((ua, va), (ub, vb)) in enumerate(tramos):
        sep = lados[i] if i < len(lados) else 0.0
        largo = math.hypot(ub - ua, vb - va)
        for t in _cuantas_barras(largo, sep, con_extremos=False):
            barras.append((ua + (ub - ua) * t, va + (vb - va) * t, area_lado))
    return barras


def barras_en_circulo(diametro, xc, yc, cantidad, area, rotacion=0.0):
    """
    CIRCLE REBAR → varillas repartidas parejo sobre una circunferencia.

    Es el "CircleBar" del Section Designer: se elige el círculo, la cantidad y el
    tamaño, y ETABS las reparte alrededor. `rotation` gira el conjunto, para
    poder alinear una varilla con un eje.
    """
    d = float(diametro)
    n = int(cantidad or 0)
    if d <= 0 or n <= 0 or area <= 0:
        return []
    r = d / 2.0
    fase = math.radians(float(rotacion or 0.0))
    uc, vc = _sd_a_local(xc, yc)
    salida = []
    for k in range(n):
        ang = fase + 2.0 * math.pi * k / n
        # (X, Y) del Section Designer y después al marco local, como todo acá.
        u, v = _sd_a_local(r * math.cos(ang), r * math.sin(ang))
        salida.append((u + uc, v + vc, area))
    return salida


def _area_de_barra(shape, catalogo, clave_tamano="barSize"):
    """Área de una varilla: del catálogo por nombre (#4, #5...), o explícita."""
    nombre = _clave(shape, clave_tamano, "BARSIZE", "size")
    if nombre is not None and catalogo:
        area = catalogo.get(str(nombre)) or catalogo.get(str(nombre).upper())
        if area:
            return float(area)
    return _num(shape, "barArea", "area", defecto=0.0)


def _barras_de_pieza(shape, catalogo):
    """Varillas `(u, v, area)` que aporta una shape de armado."""
    t = _tipo(shape)
    if t == "REBAR":
        area = _area_de_barra(shape, catalogo)
        if area <= 0:
            return []
        u, v = _sd_a_local(_num(shape, "XC", "x"), _num(shape, "YC", "y"))
        return [(u, v, area)]

    if t == "LINE REBAR":
        area = _area_de_barra(shape, catalogo)
        if area <= 0:
            return []
        con_extremos = str(_clave(shape, "endBar", "ENDBAR", defecto="NO")).upper() in ("YES", "TRUE", "1")
        return barras_en_linea(
            _num(shape, "X1"), _num(shape, "Y1"), _num(shape, "X2"), _num(shape, "Y2"),
            _num(shape, "spacing", "SPACING"), area, con_extremos)

    if t in ("CIRCLE REBAR", "CIRCLEBAR"):
        area = _area_de_barra(shape, catalogo)
        if area <= 0:
            return []
        return barras_en_circulo(
            _num(shape, "diameter", "DIAMETER", "D"),
            _num(shape, "XC", "x"), _num(shape, "YC", "y"),
            _num(shape, "numBars", "NUMBARS", defecto=0),
            area, _num(shape, "rotation", "ROTATION", defecto=0.0))

    if t == "RECT REBAR":
        bordes = _clave(shape, "edges", "EDGE", defecto=[]) or []
        esquinas = _clave(shape, "corners", "CORNER", defecto=[]) or []
        seps = [_num(b, "spacing", "EDGEBARSPACING") for b in bordes]
        a_lado = _area_de_barra(bordes[0], catalogo, "size") if bordes else 0.0
        a_esq = _area_de_barra(esquinas[0], catalogo, "size") if esquinas else a_lado
        if a_lado <= 0 and a_esq <= 0:
            return []
        return barras_en_jaula(_num(shape, "D"), _num(shape, "B"),
                               _num(shape, "XC"), _num(shape, "YC"),
                               seps, a_esq, a_lado or a_esq)

    return []


def _inercias_de_poligono(pts, cu, cv):
    """
    Segundos momentos de un polígono respecto del punto (cu, cv), por la fórmula
    del polígono. Devuelve (Iuu, Ivv, Iuv) con u = eje 2 y v = eje 3.

    Correspondencia con lo que reporta ETABS, verificada contra las *Section
    Properties* de la `PL2` del MODULO 01 a SEIS dígitos:

        I22 = ∫(v − cv)² dA      I33 = ∫(u − cu)² dA

    (El signo de I23 sale al revés que el de ETABS. No se usa en el cálculo —
    la superficie no lo mira — pero está anotado para que no sorprenda.)
    """
    q = [(u - cu, v - cv) for u, v in pts]
    iuu = ivv = iuv = 0.0
    n = len(q)
    for i in range(n):
        u1, v1 = q[i]
        u2, v2 = q[(i + 1) % n]
        cruz = u1 * v2 - u2 * v1
        iuu += (v1 * v1 + v1 * v2 + v2 * v2) * cruz
        ivv += (u1 * u1 + u1 * u2 + u2 * u2) * cruz
        iuv += (u1 * v2 + 2 * u1 * v1 + 2 * u2 * v2 + u2 * v1) * cruz
    return abs(iuu) / 12.0, abs(ivv) / 12.0, iuv / 24.0


def _malla_union(piezas, n):
    """
    Fibras de la UNIÓN de las piezas: una grilla n×n sobre la caja de todas,
    quedándose con las celdas cuyo centro cae dentro de ALGUNA. Así el solape
    entre piezas no se cuenta dos veces (es el único motivo para no llamar
    `polygon_fiber_grid` una vez por pieza).

    Devuelve `(fibras, du, dv, area_de_la_malla)`; el área de celda se escala
    afuera, contra el área exacta.
    """
    if not piezas:
        return [], 0.0, 0.0, 0.0
    us = [u for p in piezas for u, _v in p]
    vs = [v for p in piezas for _u, v in p]
    u0, u1, v0, v1 = min(us), max(us), min(vs), max(vs)
    du, dv = (u1 - u0) / n, (v1 - v0) / n
    if du <= 0 or dv <= 0:
        return [], 0.0, 0.0, 0.0

    dentro = []
    for i in range(n):
        u = u0 + (i + 0.5) * du
        for j in range(n):
            v = v0 + (j + 0.5) * dv
            if any(point_in_polygon(p, u, v) for p in piezas):
                dentro.append((u, v))
    return dentro, du, dv, len(dentro) * du * dv


def construir_seccion(shapes, catalogo_barras=None, malla=160):
    """
    Arma la sección completa. `shapes` es la lista de la SDSECTION (en cualquier
    orden: se separan solas las piezas de concreto de las de armado) y
    `catalogo_barras` el `{"#4": area, ...}` de las REBARDEFINITION.

    Devuelve un dict con todo ya **trasladado al centroide** —el motor toma
    momentos respecto del origen, y ETABS los reporta respecto del centroide, así
    que sin trasladar la compresión pura arrastra un momento espurio (en la PL1,
    el centroide está a 0.19 m del centro de la caja)— y en ejes locales:

        piezas    polígonos de concreto, para dibujar
        bars      [(u, v, area)]  varillas
        fibers    [(u, v, area)]  fibras de concreto, ya escaladas a Ag
        fiber_du, fiber_dv        tamaño de celda, para el peso parcial del bloque
        Ag, As, centroide, mirror2, mirror3, avisos
    """
    shapes = list(shapes or [])
    catalogo = dict(catalogo_barras or {})
    avisos = []

    concreto = [s for s in shapes if _tipo(s) in
                ("POLYGON", "CONC RECTANGULAR", "CONC RECTANGLE", "CONC RECT",
                 "RECTANGULAR", "CONC L", "CONC T", "CONC TEE",
                 "CONC CIRCLE", "CIRCLE", "CONC CIRCULAR")]
    armado = [s for s in shapes if "REBAR" in _tipo(s)]

    # `origen_barras[i]` = indice de la shape que genero la varilla i. Lo usa el
    # editor para saber que objeto seleccionaste al hacer clic en el dibujo.
    bars, origen_barras = [], []
    for s in armado:
        nuevas = _barras_de_pieza(s, catalogo)
        bars.extend(nuevas)
        origen_barras.extend([shapes.index(s)] * len(nuevas))

    # Un armado que no resuelve a ninguna varilla casi siempre es el CATALOGO:
    # las shapes traen el NOMBRE de la varilla (BARSIZE "#5"), no su area, y si
    # el llamador no manda `rebarCatalog` todas quedan en area 0 y se caen. Sin
    # este aviso el sintoma era un ValueError de min() sobre una lista vacia,
    # varias capas mas arriba.
    if armado and not bars:
        pedidos = sorted({str(_clave(s, "barSize", "BARSIZE", "size", defecto="?"))
                          for s in armado})
        avisos.append(
            "El armado no resolvió ninguna varilla: falta el catálogo para %s. "
            "Mandá `rebarCatalog` con el área de cada una, o `barArea` en la shape."
            % ", ".join(pedidos))

    # ── Espejo de las formas paramétricas ───────────────────────────────────
    # El `.e2k` no exporta MIRROR2/MIRROR3 de una SDSECTION. Se deduce con las
    # varillas: la orientación correcta es la que las contiene a todas. Solo se
    # prueba si hay UNA pieza paramétrica y el llamador no dijo nada; con dos o
    # más el espacio de combinaciones crece y no hay caso real todavía.
    parametricas = [s for s in concreto if _tipo(s) in ("CONC L", "CONC T", "CONC TEE")]
    mirror2 = mirror3 = False  # solo el DEFAULT para las que no traen el suyo
    # Si la shape YA trae el espejo, manda. La deducción es solo para cuando no
    # se sabe (el `.e2k` no lo exporta): una vez deducido, el llamador lo escribe
    # en la shape y deja de depender de dónde caigan las varillas — si no, mover
    # la pieza de concreto lejos del armado le da vuelta la forma sola.
    dado2 = _clave(parametricas[0], "mirror2") if parametricas else None
    if len(parametricas) == 1 and bars and dado2 is None:
        mejor = None
        for m2 in (False, True):
            for m3 in (False, True):
                pts = vertices_de_pieza(parametricas[0], m2, m3)
                if not pts:
                    continue
                dentro = sum(1 for u, v, _a in bars if point_in_polygon(pts, u, v))
                if mejor is None or dentro > mejor[0]:
                    mejor = (dentro, m2, m3)
        if mejor:
            _dentro, mirror2, mirror3 = mejor
            if _dentro < len(bars):
                avisos.append(
                    "El espejo deducido deja %d de %d varillas fuera del contorno."
                    % (len(bars) - _dentro, len(bars)))
    elif parametricas:
        mirror2 = bool(_clave(parametricas[0], "mirror2", defecto=False))
        mirror3 = bool(_clave(parametricas[0], "mirror3", defecto=False))

    piezas, origen_piezas = [], []
    for s in concreto:
        pts = vertices_de_pieza(s, mirror2, mirror3)
        if len(pts) >= 3:
            piezas.append(pts)
            origen_piezas.append(shapes.index(s))
        else:
            avisos.append("Forma de concreto no reconocida o inválida: %s" % _tipo(s))

    if not piezas:
        return {"piezas": [], "bars": [], "fibers": [], "Ag": 0.0, "As": 0.0,
                "avisos": avisos + ["La sección no tiene ninguna pieza de concreto."]}

    # ── Área y centroide exactos (suma de piezas; el solape se avisa) ───────
    areas = [polygon_area(p) for p in piezas]
    ag = sum(areas)
    cu = sum(polygon_centroid(p)[0] * a for p, a in zip(piezas, areas)) / ag if ag else 0.0
    cv = sum(polygon_centroid(p)[1] * a for p, a in zip(piezas, areas)) / ag if ag else 0.0

    fibras_xy, du, dv, area_malla = _malla_union(piezas, int(malla))
    if not fibras_xy:
        return {"piezas": piezas, "bars": bars, "fibers": [], "Ag": ag, "As": 0.0,
                "avisos": avisos + ["La malla de fibras salió vacía."]}
    # Solape entre piezas: solo puede pasar si hay MÁS DE UNA, y siempre hace
    # que la unión sea MENOR que la suma. La malla, en cambio, tiene un sesgo de
    # muestreo simétrico de 1-2% en un polígono cuyos bordes no caen sobre la
    # grilla, así que no sirve de detector fino — con una sola pieza el área
    # exacta es la del polígono y no hay nada que comparar.
    #
    # (Medido: `Placa 1` del MODULO 01, una sola pieza, malla 120 → 0.7814 m²
    # contra 0.7950 exactos. Tomar la de la malla metía 1.7% de error en Ag, y
    # de ahí derecho a Po.)
    solapan = len(piezas) > 1 and ag > 0 and (ag - area_malla) / ag > TOL_SOLAPE
    if solapan:
        avisos.append(
            "El área de la unión (%.4f m²) es menor que la suma de las piezas "
            "(%.4f m²): se solapan. Se usa la de la unión." % (area_malla, ag))
        ag = area_malla
        # Con solape el centroide tampoco es el promedio pesado de las piezas
        # (la zona compartida contaría dos veces), así que sale de la MALLA, que
        # es la única que representa la unión real. Dibujar una L con dos
        # rectángulos que comparten la esquina es un caso perfectamente normal.
        cu = sum(u for u, _v in fibras_xy) / len(fibras_xy)
        cv = sum(v for _u, v in fibras_xy) / len(fibras_xy)

    # Se escala el área de celda para que la suma dé EXACTAMENTE Ag: muestrear
    # por el centro deja un sesgo de borde que entraría derecho en Po. Es el
    # mismo criterio de polygon_fiber_grid.
    area_celda = ag / len(fibras_xy)

    # Propiedades de sección, en el mismo marco que reporta ETABS. Con piezas
    # que se solapan la suma contaría dos veces la zona compartida, así que ahí
    # salen de la malla — mismo criterio que el área y el centroide.
    if solapan:
        i22 = sum(area_celda * (v - cv) ** 2 for _u, v in fibras_xy)
        i33 = sum(area_celda * (u - cu) ** 2 for u, _v in fibras_xy)
        i23 = sum(area_celda * (u - cu) * (v - cv) for u, v in fibras_xy)
    else:
        i22 = i33 = i23 = 0.0
        for p in piezas:
            a_, b_, c_ = _inercias_de_poligono(p, cu, cv)
            i22 += a_
            i33 += b_
            i23 += c_

    piezas = [[(u - cu, v - cv) for u, v in p] for p in piezas]
    return {
        "props": {"A": ag, "I22": i22, "I33": i33, "I23": i23},
        "piezas": piezas,
        "bars": [(u - cu, v - cv, a) for u, v, a in bars],
        "fibers": [(u - cu, v - cv, area_celda) for u, v in fibras_xy],
        "fiber_du": du,
        "fiber_dv": dv,
        "Ag": ag,
        "As": sum(a for _u, _v, a in bars),
        "centroide": (cu, cv),
        "mirror2": mirror2,
        "mirror3": mirror3,
        "origen_barras": origen_barras,
        "origen_piezas": origen_piezas,
        "avisos": avisos,
    }
