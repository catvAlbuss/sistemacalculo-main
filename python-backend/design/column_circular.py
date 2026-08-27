# -*- coding: utf-8 -*-
"""
Geometría de columnas CIRCULARES para el motor de interacción P-M-M.

POR QUÉ UN ARCHIVO APARTE
    `compute_pn_mn_at` es agnóstico a la forma: recibe una lista de fibras
    `(x, y, area)` y las posiciones de barra `(x, y)`, y no le importa de dónde
    salieron. Todo lo demás del motor —bloque de Whitney, tope 0.80/0.85·Po, φ
    por código, ratio radial, superficie de 24 curvas— se reusa tal cual.
    Lo único que faltaba para soportar circulares era esto.

    El tope axial y el φ YA distinguen espiral: `axial_max_nominal(..., tied=False)`
    da 0.85·Po y `_phi_factor(..., tied=False)` toma `cc_spiral`.

NÚCLEO CONFINADO
    Acá `core_diameter` se mide hasta el BORDE EXTERIOR de la espiral, que es la
    definición de ACI 318 §25.7.3 / E.060 para `Ach`:

        Dc = D − 2·recubrimiento_libre

    OJO: la plantilla Excel de referencia ("Colum TIPO II") usa `Dc = D − 1·rec`,
    que es el diámetro al EJE de la espiral, no al borde. Para D=60 y rec=4 eso
    da 56 en vez de 52, y no es cosmético: `ρs = 0.45(Ag/Ach−1)f'c/fy` pasa de
    0.007456 a 0.003329, con lo cual deja de gobernar frente al 0.12·f'c/fy y el
    espaciamiento máximo por confinamiento se afloja de 7.19 a 8.31 cm.
    La plantilla no documenta qué convención usó su autor. Acá se toma la de la
    norma; si el proyecto exige replicar la plantilla, es un parámetro a exponer,
    no un valor a cambiar en silencio.
"""

import math


def generate_circular_bar_positions(diameter, cover, bar_diameter, num_bars,
                                    confine_bar_diameter=0.0, start_angle=0.0):
    """
    Barras longitudinales repartidas en un anillo, con el mismo criterio de
    recubrimiento que `generate_rect_bar_positions`: `cover` es el recubrimiento
    LIBRE hasta la superficie de la espiral ("Clear Cover for Confinement Bars"
    de ETABS), así que el diámetro de la espiral se resta aparte para llegar al
    CENTRO de la varilla longitudinal.

    `start_angle` (radianes) gira el anillo. Importa poco en el diagrama —una
    sección circular con n barras tiene simetría de orden n— pero permite
    reproducir un armado dibujado con una barra en una posición concreta.

    Origen en el centroide. Todo en metros. Devuelve [] si la geometría no cierra.
    """
    n = int(num_bars or 0)
    if n < 3:
        return []

    r = diameter / 2.0 - cover - confine_bar_diameter - bar_diameter / 2.0
    if r <= 0:
        return []

    paso = 2.0 * math.pi / n
    return [
        (r * math.cos(start_angle + i * paso), r * math.sin(start_angle + i * paso))
        for i in range(n)
    ]


def circular_fiber_grid(diameter, n=80):
    """
    Fibras de concreto de un disco: grilla cartesiana de n×n sobre el cuadrado
    que lo circunscribe, quedándose con las celdas cuyo CENTRO cae dentro.

    El área de cada celda se ESCALA para que la suma dé exactamente πD²/4. Sin
    ese ajuste el muestreo por centro deja un sesgo de área en el borde (con
    n=80 es ~0.1%, pero entra directo en Po y por lo tanto en todo el diagrama)
    y encima oscila con n, que es la firma que ya nos costó cara en el bloque de
    compresión — ver `project-fiber-partial-weight`.

    El escalado NO corrige el momento de las celdas de borde, solo su área
    total; el residuo es de segundo orden y la convergencia se verifica contra
    Po de forma cerrada.

    Devuelve `(fibras, dx, dy)` con la misma forma que `_rect_fiber_grid`, para
    que `compute_pn_mn_at` no tenga que distinguir.
    """
    r = diameter / 2.0
    dx = dy = diameter / n
    celda = dx * dy

    crudas = []
    for i in range(n):
        x = -r + (i + 0.5) * dx
        for j in range(n):
            y = -r + (j + 0.5) * dy
            if x * x + y * y <= r * r:
                crudas.append((x, y))

    if not crudas:
        return [], dx, dy

    area_exacta = math.pi * r * r
    area_celda = area_exacta / len(crudas)

    return [(x, y, area_celda) for x, y in crudas], dx, dy


def gross_area_circular(diameter):
    """Ag de la sección llena."""
    return math.pi * diameter * diameter / 4.0


def core_area_circular(diameter, cover):
    """
    Ach — área del núcleo confinado, medido al BORDE EXTERIOR de la espiral
    (ACI 318 §25.7.3 / E.060). Ver la nota del encabezado sobre la diferencia
    con la plantilla Excel.
    """
    dc = max(diameter - 2.0 * cover, 0.0)
    return math.pi * dc * dc / 4.0, dc


def spiral_rho_s_required(fc, fyt, gross_area, core_area):
    """
    Cuantía volumétrica mínima de espiral, la MAYOR de las dos condiciones:

        ρs = 0.45·(Ag/Ach − 1)·f'c/fyt      ACI 318 §25.7.3.3(a)
        ρs = 0.12·f'c/fyt                    ACI 318 §25.7.3.3(b)

    Devuelve `(rho_s, rho_1, rho_2)` para poder mostrar cuál gobierna.
    """
    if core_area <= 0 or fyt <= 0:
        return 0.0, 0.0, 0.0
    rho_1 = 0.45 * (gross_area / core_area - 1.0) * fc / fyt
    rho_2 = 0.12 * fc / fyt
    return max(rho_1, rho_2), rho_1, rho_2


def spiral_spacing_for_rho(rho_s, core_diameter, spiral_area, spiral_diameter):
    """
    Paso de espiral que produce una cuantía volumétrica `rho_s`.

    ρs = volumen de espiral / volumen de núcleo por unidad de longitud
       = (π·dc·Asp) / (π·Dc²/4 · s)   →   s = 4·Asp·dc / (Dc²·ρs)

    con `dc = Dc − Ø_espiral` el diámetro al EJE de la espiral. Es la misma
    expresión que usa la plantilla Excel en Y138/Y139.
    """
    if rho_s <= 0 or core_diameter <= 0:
        return 0.0
    dc = max(core_diameter - spiral_diameter, 0.0)
    return 4.0 * spiral_area * dc / (core_diameter * core_diameter * rho_s)


def spiral_rho_s_provided(spiral_area, spiral_diameter, core_diameter, spacing):
    """
    Cuantía volumétrica que REALMENTE aporta la espiral colocada.

    Volumen de espiral por unidad de longitud = Asp·π·dc / s
    Volumen de núcleo    por unidad de longitud = π·Dc²/4

        ρs = 4·Asp·dc / (Dc²·s)        con dc = Dc − Ø_espiral

    Es la inversa de `spiral_spacing_for_rho`. Devuelve 0 si no hay paso.
    """
    if spacing <= 0 or core_diameter <= 0:
        return 0.0
    dc = max(core_diameter - spiral_diameter, 0.0)
    return 4.0 * spiral_area * dc / (core_diameter * core_diameter * spacing)


def shear_depth_circular(diameter):
    """
    `bw` y `d` para el corte de una sección circular.

    ACI 318 §22.5.2.2: para secciones circulares se toma `bw` = diámetro y se
    permite `d = 0.80·D`. Así que el área de corte efectiva es 0.8·D².

    OJO — la plantilla Excel de referencia usa `D·(D − 6 cm)` en Y124/Y129 y
    `Ach` en el Vc de Y127, que son criterios distintos. Para D=60 cm:

        ACI     bw·d = 60 × 48   = 2880 cm²
        Excel   Ach            = 2463 cm²   (Vc un 17% menor)
        Excel   D·(D−6)        = 3240 cm²   (para el tope Vu,max)

    Acá se usa el de ACI. La diferencia es de criterio, no de aritmética.
    """
    return diameter, 0.80 * diameter
