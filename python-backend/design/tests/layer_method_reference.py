# -*- coding: utf-8 -*-
"""Metodo de CAPAS — implementacion de referencia, independiente del motor.

Es el metodo con el que se calcula un diagrama de interaccion a mano o en una
planilla: el acero se agrupa en CAPAS a profundidades conocidas y el concreto
comprimido es un rectangulo con formula cerrada (bloque de Whitney).

POR QUE EXISTE: el motor de produccion (column_interaction.compute_pn_mn_at)
integra el concreto por FIBRAS sobre una malla. Los dos parten de las mismas
hipotesis de ACI pero por caminos de codigo distintos, asi que compararlos caza
errores que ninguno de los dos delata solo. De hecho asi se encontro la
cuantizacion del bloque de compresion (ver project-fiber-partial-weight): el
motor daba hasta 5.9% de mas en la compresion del concreto y ni ETABS ni los
tests existentes lo mostraban.

LIMITACION: solo sirve para flexion UNIAXIAL (el eje neutro paralelo a un lado).
Con el eje neutro inclinado el bloque comprimido deja de ser un rectangulo y no
hay formula cerrada — que es exactamente por lo que el motor usa fibras.

Unidades: SI (m, Pa, N, N-m), igual que el motor. Compresion positiva.
"""

__all__ = ["layer_point", "layer_curve", "layers_from_rect_pattern"]


def layer_point(b, h, fc, fy, es, ecu, beta1, layers, c):
    """(Pn, Mn) para una profundidad de eje neutro `c`.

    `b`    ancho de la cara comprimida (perpendicular al gradiente).
    `h`    dimension de la seccion EN la direccion del gradiente.
    `layers` [(d, As), ...] con d = profundidad desde la fibra mas comprimida.
    """
    a = min(beta1 * c, h)

    cc = 0.85 * fc * b * a
    pn = cc
    mn = cc * (h / 2.0 - a / 2.0)

    for d, area in layers:
        eps = ecu * (c - d) / c          # + = compresion
        fs = max(-fy, min(fy, es * eps))
        force = fs * area
        if d < a:
            force -= 0.85 * fc * area    # concreto desplazado por la varilla
        pn += force
        mn += force * (h / 2.0 - d)

    return pn, mn


def layer_curve(b, h, fc, fy, es, ecu, beta1, layers, c_values):
    return [layer_point(b, h, fc, fy, es, ecu, beta1, layers, c) for c in c_values]


def layers_from_rect_pattern(bars, bar_area, half_depth, axis):
    """Agrupa las varillas de `generate_rect_bar_positions` en capas.

    `axis` = 0 agrupa por X (es el gradiente que usa el motor con theta=0),
    `axis` = 1 agrupa por Y (theta = 90 grados). `half_depth` es la mitad de la
    dimension en esa direccion.

    OJO con la correspondencia: en compute_pn_mn_at el gradiente es
    xi = x*cos(theta) + y*sin(theta), asi que theta=0 barre sobre X. Confundirlo
    da capas cruzadas y una comparacion sin sentido.
    """
    grupos = {}
    for pos in bars:
        clave = round(pos[axis], 9)
        grupos[clave] = grupos.get(clave, 0) + 1

    # De la fibra mas comprimida (coordenada mayor) hacia la traccionada.
    return [
        (half_depth - coord, n * bar_area)
        for coord, n in sorted(grupos.items(), key=lambda kv: -kv[0])
    ]
