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


def inset_polygon(pts, d):
    """
    Contorno metido `d` hacia adentro, para ubicar el eje de las varillas.

    Cada arista se desplaza `d` hacia el interior y los vértices nuevos salen de
    intersectar las aristas desplazadas consecutivas. Sirve para convexos y
    cóncavos (la L tiene un vértice reentrante), que es justo lo que se necesita.

    Aristas casi paralelas se dejan como estaban en vez de reventar por división
    por cero: con contornos ortogonales no pasa, pero el guard evita un NaN
    silencioso si alguna vez entra un polígono degenerado.
    """
    n = len(pts)
    if n < 3 or d == 0:
        return list(pts)

    # Sentido del polígono: con área con signo positivo (antihorario) la normal
    # interior de (dx,dy) es (-dy,dx).
    s = 0.0
    for i in range(n):
        x1, y1 = pts[i]
        x2, y2 = pts[(i + 1) % n]
        s += x1 * y2 - x2 * y1
    signo = 1.0 if s > 0 else -1.0

    rectas = []
    for i in range(n):
        x1, y1 = pts[i]
        x2, y2 = pts[(i + 1) % n]
        ex, ey = x2 - x1, y2 - y1
        L = math.hypot(ex, ey)
        if L < 1e-12:
            rectas.append(None)
            continue
        nx, ny = -ey / L * signo, ex / L * signo   # normal interior unitaria
        rectas.append((x1 + nx * d, y1 + ny * d, ex / L, ey / L))

    salida = []
    for i in range(n):
        r1 = rectas[i - 1]
        r2 = rectas[i]
        if r1 is None or r2 is None:
            salida.append(pts[i])
            continue
        px, py, dx1, dy1 = r1
        qx, qy, dx2, dy2 = r2
        den = dx1 * dy2 - dy1 * dx2
        if abs(den) < 1e-12:                 # aristas paralelas
            salida.append(pts[i])
            continue
        t = ((qx - px) * dy2 - (qy - py) * dx2) / den
        salida.append((px + dx1 * t, py + dy1 * t))
    return salida


def bars_along_perimeter(pts, num_bars):
    """
    `num_bars` varillas repartidas UNIFORMEMENTE sobre el contorno cerrado.

    Arranca en el primer vértice y avanza a paso constante, así que los vértices
    no quedan garantizados como posiciones de barra. Es el reparto que hace un
    armado real y reproduce el conteo de ETABS; el reparto EXACTO de su
    `PATTERN "R-n2-n3"` sobre una L no está documentado (ver el encabezado).
    """
    n = int(num_bars or 0)
    if len(pts) < 3 or n < 3:
        return []

    largos = []
    total = 0.0
    m = len(pts)
    for i in range(m):
        x1, y1 = pts[i]
        x2, y2 = pts[(i + 1) % m]
        L = math.hypot(x2 - x1, y2 - y1)
        largos.append(L)
        total += L
    if total <= 0:
        return []

    paso = total / n
    salida = []
    for k in range(n):
        s = k * paso
        acum = 0.0
        for i in range(m):
            if acum + largos[i] >= s or i == m - 1:
                t = (s - acum) / largos[i] if largos[i] > 0 else 0.0
                t = min(max(t, 0.0), 1.0)
                x1, y1 = pts[i]
                x2, y2 = pts[(i + 1) % m]
                salida.append((x1 + (x2 - x1) * t, y1 + (y2 - y1) * t))
                break
            acum += largos[i]
    return salida


def polygon_bar_positions(pts, cover, bar_diameter, num_bars,
                          confine_bar_diameter=0.0):
    """
    Varillas de un contorno poligonal.

    `cover` es el recubrimiento LIBRE hasta la superficie del estribo, igual que
    en el resto del motor, así que el eje de la varilla queda a
    `cover + Ø_estribo + Ø_barra/2` del borde. ETABS llama a esa distancia `dc`,
    y para la CL 70x70x30 reporta 42.5 mm contra los 42.53 de esta fórmula.
    """
    dc = float(cover) + float(confine_bar_diameter) + float(bar_diameter) / 2.0
    interior = inset_polygon(pts, dc)
    if polygon_area(interior) <= 0:
        return []
    return bars_along_perimeter(interior, num_bars)
