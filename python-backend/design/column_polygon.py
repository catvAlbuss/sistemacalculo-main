# -*- coding: utf-8 -*-
"""
Geometría de columnas POLIGONALES (L y T) para el motor de interacción P-M-M.

POR QUÉ UN ARCHIVO APARTE
    `compute_pn_mn_at` es agnóstico a la forma: recibe fibras `(x, y, area)` y
    posiciones de barra `(x, y)`. Lo mismo que se hizo para la circular en
    `column_circular.py` se hace acá para cualquier polígono — L, T, y lo que
    venga después.

    Todo lo demás del motor (bloque de Whitney, tope 0.80/0.85·Po, φ por código,
    ratio radial, superficie de 24 curvas) se reusa tal cual.

EJES
    `u` = eje local 2 (peralte D), `v` = eje local 3 (ancho B). Es la MISMA
    convención que usa el renderer 2D (`getColumnFootprintLocalPolygon`), y los
    vértices se generan con la misma fórmula, así que la sección que se dibuja y
    la que se calcula no pueden diferir.

DÓNDE VAN LAS VARILLAS — lo que se sabe y lo que no
    ETABS describe el armado de una L con `PATTERN "R-n2-n3"`, que en un
    rectángulo es inequívoco pero en un contorno de 6 vértices no lo es. Del
    *Column Element Details* de la `CL 70x70x30` se pudo deducir:

        dc = 42.5 mm  =  recubrimiento + Ø_estribo + Ø_barra/2   (la MISMA
                         regla que en la circular, verificada al 0.06 %)
        Rebar Area = 4713 mm²  ->  15 varillas de 314 mm²

    O sea sabemos CUÁNTAS y a qué distancia del borde, pero no el reparto exacto
    que hace ETABS. Acá se usa reparto UNIFORME sobre el contorno insertado, que
    es lo que hace cualquier armado real y reproduce el conteo. Si el ratio no
    calza contra ETABS, este es el primer lugar a revisar — no el motor.
"""

import math


# ─────────────────────────────────────────────────────────────────────────────
# Contornos
# ─────────────────────────────────────────────────────────────────────────────

def l_section_vertices(depth, width, flange_thick, web_thick,
                       mirror2=False, mirror3=False):
    """
    Vértices de una "Concrete L" en ejes locales (u = eje 2, v = eje 3).

    `flange_thick` (TF) es el espesor de la pata HORIZONTAL, que corre a lo largo
    del eje 3 (todo el ancho B) y se mide sobre u. `web_thick` (TW) es el de la
    pata VERTICAL, que corre sobre el eje 2 (todo el peralte D) y se mide sobre v.

    Espejar SOBRE un eje niega la OTRA coordenada: `mirror2` niega v, `mirror3`
    niega u. Es idéntico al renderer 2D — ver la nota de anclaje allá, que costó
    tres intentos fijar contra ETABS.
    """
    D, B, TF, TW = float(depth), float(width), float(flange_thick), float(web_thick)
    if not (D > 0 and B > 0 and TF > 0 and TW > 0 and TF < D and TW < B):
        return []
    hd, hb = D / 2.0, B / 2.0
    pts = [(hd, hb), (-hd, hb), (-hd, -hb),
           (TF - hd, -hb), (TF - hd, hb - TW), (hd, hb - TW)]
    if mirror2:
        pts = [(u, -v) for u, v in pts]
    if mirror3:
        pts = [(-u, v) for u, v in pts]
    return pts


def tee_section_vertices(depth, width, flange_thick, web_thick):
    """
    Vértices de una "Concrete Tee". Ala de espesor TF en la parte alta del
    peralte (+u), alma de ancho TW centrada bajando. Mismos ejes que la L y la
    misma forma que dibuja el renderer 2D.
    """
    D, B, TF, TW = float(depth), float(width), float(flange_thick), float(web_thick)
    if not (D > 0 and B > 0 and TF > 0 and TW > 0 and TF < D and TW < B):
        return []
    hd, hb, ht = D / 2.0, B / 2.0, TW / 2.0
    uf = hd - TF                      # cara inferior del ala
    return [(hd, -hb), (hd, hb), (uf, hb), (uf, ht),
            (-hd, ht), (-hd, -ht), (uf, -ht), (uf, -hb)]


# ─────────────────────────────────────────────────────────────────────────────
# Utilidades de polígono
# ─────────────────────────────────────────────────────────────────────────────

def polygon_area(pts):
    """Área por la fórmula del zapato (valor absoluto: no importa el sentido)."""
    n = len(pts)
    if n < 3:
        return 0.0
    s = 0.0
    for i in range(n):
        x1, y1 = pts[i]
        x2, y2 = pts[(i + 1) % n]
        s += x1 * y2 - x2 * y1
    return abs(s) / 2.0


def polygon_centroid(pts):
    """
    Centroide geométrico del polígono.

    HACE FALTA, no es un adorno: `compute_pn_mn_at` acumula `M2 = −Σ F·y` y
    `M3 = +Σ F·x` respecto del ORIGEN. En un rectángulo o un círculo el origen
    de los vértices ya ES el centroide y no se nota, pero en una L el centro de
    la caja envolvente está a 103 mm del centroide, y entonces la COMPRESIÓN
    PURA genera un momento espurio de 43 t·m que corrompe toda la superficie.

    Los diagramas de interacción se toman respecto del centroide de la sección.
    """
    n = len(pts)
    if n < 3:
        return 0.0, 0.0
    a2 = 0.0
    cx = 0.0
    cy = 0.0
    for i in range(n):
        x1, y1 = pts[i]
        x2, y2 = pts[(i + 1) % n]
        cruz = x1 * y2 - x2 * y1
        a2 += cruz
        cx += (x1 + x2) * cruz
        cy += (y1 + y2) * cruz
    if abs(a2) < 1e-15:
        return 0.0, 0.0
    return cx / (3.0 * a2), cy / (3.0 * a2)


def center_on_centroid(pts):
    """Traslada el polígono para que su centroide quede en el origen."""
    cx, cy = polygon_centroid(pts)
    return [(x - cx, y - cy) for x, y in pts]


def point_in_polygon(pts, x, y):
    """Ray casting. El borde queda indefinido, pero acá solo se evalúan CENTROS
    de celda, que nunca caen exactamente sobre una arista salvo casualidad."""
    dentro = False
    n = len(pts)
    j = n - 1
    for i in range(n):
        xi, yi = pts[i]
        xj, yj = pts[j]
        if (yi > y) != (yj > y) and x < (xj - xi) * (y - yi) / (yj - yi) + xi:
            dentro = not dentro
        j = i
    return dentro


def polygon_fiber_grid(pts, n=80):
    """
    Fibras de concreto de un polígono: grilla n×n sobre su caja envolvente,
    quedándose con las celdas cuyo CENTRO cae adentro.

    El área de celda se ESCALA para que la suma dé exactamente el área real del
    polígono. Sin ese ajuste el muestreo por centro deja un sesgo en el borde que
    entra directo en Po, y encima oscila con `n` — la misma firma que ya costó
    cara en el bloque de compresión y que `circular_fiber_grid` corrige igual.

    Devuelve `(fibras, dx, dy)`, la misma forma que `_rect_fiber_grid`.
    """
    if len(pts) < 3:
        return [], 0.0, 0.0
    xs = [p[0] for p in pts]
    ys = [p[1] for p in pts]
    x0, x1 = min(xs), max(xs)
    y0, y1 = min(ys), max(ys)
    dx = (x1 - x0) / n
    dy = (y1 - y0) / n
    if dx <= 0 or dy <= 0:
        return [], 0.0, 0.0

    crudas = []
    for i in range(n):
        x = x0 + (i + 0.5) * dx
        for j in range(n):
            y = y0 + (j + 0.5) * dy
            if point_in_polygon(pts, x, y):
                crudas.append((x, y))
    if not crudas:
        return [], dx, dy

    area_celda = polygon_area(pts) / len(crudas)
    return [(x, y, area_celda) for x, y in crudas], dx, dy


def etabs_polygon_bar_positions(forma, depth, width, flange_thick, web_thick,
                                n2, n3, cover, bar_diameter,
                                confine_bar_diameter=0.0,
                                mirror2=False, mirror3=False):
    """Reparto de varillas de una L o una T tal como lo hace ETABS.

    ETABS usa en L y T el MISMO patron "R-n2-n3" que en una rectangular (su
    dialogo de Reinforcement Data es identico para las tres formas) y lo
    interpreta pata por pata, segun su dibujo de la seccion:

      - la pata que corre sobre el EJE 3 lleva `n3` varillas a lo largo, en 2
        hileras (una por cara de su espesor);
      - la pata que corre sobre el EJE 2 lleva `n2` a lo largo, en 2 hileras;
      - las patas se SOLAPAN y solo se descarta la varilla que cae EXACTAMENTE
        en la misma posicion en las dos.

    Confirmado con el `Rebar %` del Column Element Details de ETABS:
      CL 70x70x30, R-4-4  -> 15 varillas (rho 1.43 %). El solape de la L cae en
        un vertice EXACTO: 2*4 + 2*4 - 1 = 15.
      CT 100x60x30, R-4-6 -> 20 varillas (rho 1.03 %). En la T las patas nunca
        coinciden exacto (lo mas cerca, 1.12 mm), asi que no se descarta ninguna.

    LA TOLERANCIA IMPORTA: con `dc` salen 12 y 16; con patas disjuntas, 16 y 20.
    Solo la coincidencia EXACTA da 15 y 20.

    Espejo exacto de `etabsPolygonBarPositions` en
    resources/js/cad/lib/sectionPolygon.js. Si se toca una, tocar la otra.
    """
    D, B = float(depth or 0), float(width or 0)
    TF, TW = float(flange_thick or 0), float(web_thick or 0)
    N2, N3 = max(2, int(round(n2 or 0))), max(2, int(round(n3 or 0)))
    if not (D > 0 and B > 0 and TF > 0 and TW > 0 and TF < D and TW < B):
        return []

    dc = float(cover or 0) + float(confine_bar_diameter or 0) + float(bar_diameter or 0) / 2.0
    hd, hb = D / 2.0, B / 2.0

    es_tee = str(forma).lower() == "tee"
    # Rectangulos que SE SOLAPAN: cada pata recorre la seccion de punta a punta.
    pata3 = ((hd - TF, hd, -hb, hb) if es_tee else (-hd, TF - hd, -hb, hb))
    pata2 = ((-hd, hd, -TW / 2.0, TW / 2.0) if es_tee else (-hd, hd, hb - TW, hb))

    def reparto(a, b, n):
        i, f = a + dc, b - dc
        if f <= i:
            return [(a + b) / 2.0]
        if n < 2:
            return [(i + f) / 2.0]
        return [i + (f - i) * k / (n - 1) for k in range(n)]

    out = []
    # Tolerancia RELATIVA y muy chica: solo fusiona la varilla que las dos patas
    # ponen en el MISMO punto. En la T hay un par a 1.12 mm que NO se fusiona.
    tol = 1e-6 * max(D, B)

    def agregar(u, v):
        for a, b in out:
            if abs(a - u) < tol and abs(b - v) < tol:
                return
        out.append((u, v))

    u0, u1, v0, v1 = pata3
    for u in (u0 + dc, u1 - dc):
        for v in reparto(v0, v1, N3):
            agregar(u, v)

    u0, u1, v0, v1 = pata2
    for v in (v0 + dc, v1 - dc):
        for u in reparto(u0, u1, N2):
            agregar(u, v)

    if mirror2:
        out = [(u, -v) for u, v in out]
    if mirror3:
        out = [(-u, v) for u, v in out]
    return out
