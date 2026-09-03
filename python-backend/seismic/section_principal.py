# -*- coding: utf-8 -*-
"""seismic.section_principal — ejes PRINCIPALES de una sección asimétrica (L).

POR QUÉ EXISTE
    Una sección L tiene producto de inercia I23 ≠ 0. Modelarla con
    `Iz = Iy = I33` —que es lo que hacíamos— tira ese término, y con él el
    ACOPLAMIENTO entre las dos direcciones de flexión.

    Se creía que ETABS también lo ignoraba. **Es falso**, y costó caro. Medido en
    MODULO 01, cuyas 12 columnas son todas `CL 70x70x30` (I23 = 42.7 % de I22),
    cruzando la tabla Modal Participating Mass Ratios:

        modo        ETABS                        nosotros (I23 = 0)
          1   T 0.220  UY 79.29% UX 1.77%   T 0.2166  UY 83.60% UX 0.01%
          2   T 0.171  UX 77.69% UY 1.67%   T 0.1723  UX 82.09% UY 0.01%

    Los modos de ETABS están ACOPLADOS en X–Y; los nuestros salían puros. Y eso
    pesa porque el caso sísmico está dominado por una dirección (factor 11.24
    contra 2.943 del 30 % ortogonal): el modo Y, al llevar algo de masa en X,
    inyecta cortante en X. Con I23 = 0 ese término vale casi cero.

    Cortante basal en X del caso SDY ESCALADO, contra los 15.552 tonf de ETABS:

        con I23 = 0        12.191    −21.6 %
        ejes principales   15.540     −0.08 %

POR QUÉ NO SE DETECTÓ NUNCA CALIBRANDO PERÍODOS
    Porque el cambio CONSERVA LA TRAZA: `Imajor + Iminor = I33 + I22`. Los
    períodos casi no se mueven (T1 pasó de 0.2166 a 0.2191 contra 0.220 de
    ETABS). Solo cambia el acoplamiento, que ninguna tabla de períodos muestra.

EL SIGNO DEL ÁNGULO IMPORTA
    Girar +45° deja el cortante en −5.4 % y −45° en −0.08 %. O sea que NO se
    puede cablear: el ángulo sale de la geometría real, con sus banderas de
    espejo. Por eso acá se integra el polígono en vez de usar una fórmula.
"""

import math

from design.column_polygon import (
    center_on_centroid,
    l_section_vertices,
    polygon_area,
    tee_section_vertices,
)
__all__ = ["principal_properties"]


def _segundos_momentos(pts):
    """(I22, I33, I23) del polígono respecto de su propio centroide.

    NO se reusa `wall_section._inercias_de_poligono` a propósito: aquella toma
    `abs()` en los directos y deja el producto con el signo del SENTIDO DE GIRO
    del polígono, y su propio docstring avisa que el signo "sale al revés" y que
    no se usa. Acá el signo es lo único que importa —decide hacia qué lado giran
    los ejes principales— así que se normaliza por el área con signo.

    Espejar la sección invierte el giro Y niega una coordenada: los dos efectos
    se cancelaban y el I23 salía igual en las cuatro combinaciones de espejo, que
    es justamente lo que NO puede pasar.

    u = eje 2, v = eje 3.  I22 = ∫v² dA,  I33 = ∫u² dA,  I23 = ∫u·v dA.
    """
    n = len(pts)
    a2 = i22 = i33 = i23 = 0.0
    for i in range(n):
        u1, v1 = pts[i]
        u2, v2 = pts[(i + 1) % n]
        cruz = u1 * v2 - u2 * v1
        a2 += cruz
        i22 += (v1 * v1 + v1 * v2 + v2 * v2) * cruz
        i33 += (u1 * u1 + u1 * u2 + u2 * u2) * cruz
        i23 += (u1 * v2 + 2 * u1 * v1 + 2 * u2 * v2 + u2 * v1) * cruz
    if a2 == 0:
        return 0.0, 0.0, 0.0
    signo = 1.0 if a2 > 0 else -1.0        # deja el resultado en giro antihorario
    return signo * i22 / 12.0, signo * i33 / 12.0, signo * i23 / 24.0

# Debajo de esto el acoplamiento es ruido numérico y girar los ejes solo
# complica el reporte sin cambiar nada. Una L real anda por 0.4.
_TOL_ACOPLAMIENTO = 1e-4


def _resolver_seccion(origen):
    """Encuentra el dict con la GEOMETRÍA de la sección dentro de un elemento.

    El payload la trae anidada de dos formas a la vez: `sectionName` la lleva
    plana y `section` la lleva envuelta bajo su propia clave `name` (con el
    `section` de afuera dejando `type`/`b`/`h` en None). Mirar solo `section`
    devolvía Nones y esta función no se disparaba nunca — sin error, sin aviso.
    """
    if not isinstance(origen, dict):
        return None
    candidatos = [origen, origen.get("section"), origen.get("sectionName")]
    for c in candidatos:
        if not isinstance(c, dict):
            continue
        if c.get("type") and c.get("b") and c.get("h"):
            return c
        anidado = c.get("name")
        if isinstance(anidado, dict) and anidado.get("type") and anidado.get("b"):
            return anidado
    return None


def _vertices(section: dict):
    """Vértices en ejes locales (u = eje 2, v = eje 3), en METROS.

    Las dimensiones del payload vienen en CENTÍMETROS (b, h, lFlangeThick,
    lWebThick), igual que las consume el módulo de diseño.
    """
    forma = str(section.get("type") or section.get("shape") or "").strip().lower()
    b = float(section.get("b", 0) or 0) / 100.0
    h = float(section.get("h", 0) or 0) / 100.0
    tf = float(section.get("lFlangeThick", 0) or 0) / 100.0
    tw = float(section.get("lWebThick", 0) or 0) / 100.0
    if not (b > 0 and h > 0 and tf > 0 and tw > 0):
        return []

    if forma == "l":
        return l_section_vertices(
            h, b, tf, tw,
            mirror2=bool(section.get("lMirror2")),
            mirror3=bool(section.get("lMirror3")),
        )
    if forma in ("t", "tee"):
        # Simétrica respecto de un eje → I23 = 0. Se calcula igual y el filtro
        # de abajo la descarta sola, sin caso especial.
        return tee_section_vertices(h, b, tf, tw)
    return []


def principal_properties(section):
    """`{"I_major", "I_minor", "angle"}` en ejes principales, o None.

    Acepta el ELEMENTO entero o el dict de sección: resuelve solo dónde está la
    geometría (ver `_resolver_seccion`).

    Devuelve None cuando la sección no es poligonal asimétrica, cuando la
    geometría no cierra, o cuando el acoplamiento es despreciable — en todos
    esos casos el llamador se queda con Iz/Iy tal como venían.

    `angle` es el giro (radianes) del eje local 2 hacia los ejes principales,
    medido de modo que `I_major` corresponda al eje 2 girado.
    """
    section = _resolver_seccion(section)
    if section is None:
        return None
    pts = _vertices(section)
    if len(pts) < 3:
        return None

    area = polygon_area(pts)
    if area <= 0:
        return None
    centrados = center_on_centroid(pts)

    # I22 = ∫v² dA, I33 = ∫u² dA, I23 = ∫u·v dA, con el signo bien.
    i22, i33, i23 = _segundos_momentos(centrados)

    escala = max(abs(i22), abs(i33))
    if escala <= 0 or abs(i23) / escala < _TOL_ACOPLAMIENTO:
        return None

    # Rotación de ejes de segundo orden, la de siempre:
    #   tan(2θ) = 2·I23 / (I22 − I33)
    # Con I22 = I33 (la L de patas iguales) el denominador es cero y θ = 45°,
    # que es justo el caso de `CL 70x70x30`. atan2 lo resuelve sin caso especial.
    theta = 0.5 * math.atan2(2.0 * i23, i22 - i33)
    media, radio = (i22 + i33) / 2.0, math.hypot((i22 - i33) / 2.0, i23)
    return {
        "I_major": media + radio,
        "I_minor": media - radio,
        "angle": theta,
        "I22": i22,
        "I33": i33,
        "I23": i23,
    }


def girar_fuerzas_a_seccion(f12, angulo):
    """Devuelve las fuerzas locales a los EJES DE LA SECCIÓN.

    El elemento se resuelve girado a sus ejes principales, así que `localForce`
    sale en esos ejes. ETABS reporta M2/M3 y V2/V3 en los ejes de la SECCIÓN, y
    hay que deshacer el giro para poder comparar (y para que el diseño reciba la
    demanda en los ejes donde está definido el armado).

    OJO — **esto tiene que aplicarse POR MODO, antes de la combinación modal.**
    Girar una envolvente CQC no es válido: son magnitudes sin signo y la rotación
    mezcla componentes. Por eso vive acá, en la extracción, y no sobre el
    resultado.

    Layout de los 12: [P, V2, V3, T, M2, M3] por extremo.
    Si los ejes principales son los de la sección girados θ, entonces
    `v_seccion = R(θ)·v_principal`.
    """
    if not angulo or not f12:
        return f12
    c, s = math.cos(angulo), math.sin(angulo)
    out = list(f12)
    for a, b in ((1, 2), (4, 5), (7, 8), (10, 11)):
        if b < len(out):
            p, q = out[a], out[b]
            out[a] = p * c - q * s
            out[b] = p * s + q * c
    return out
