# -*- coding: utf-8 -*-
"""python-backend/design/wall_interaction.py

Superficie de interacción P-M-M de una placa: las 24 curvas × 11 puntos que
ETABS muestra en el diálogo *Interaction Surface* → tabla **Curve Data**.

QUÉ APORTA SOBRE `column_interaction.compute_pmm_surface`
    El motor de columnas barre `c` linealmente y devuelve una curva DENSA, que
    sirve para el ratio pero no es comparable fila por fila con ETABS. Acá los
    puntos se eligen con la regla real de ETABS (abajo), así que la tabla que
    sale se puede cruzar celda por celda con la del ingeniero — que es como se
    validó todo esto.

LA REGLA DE LOS 11 PUNTOS
    Se despejó la profundidad de eje neutro `c` de cada punto de la tabla de la
    `PL1` del MODULO 01 y salieron dos series de PASOS IGUALES EN c que se
    encuentran en el punto balanceado:

        cb   = ECU/(ECU + εy)·dt        dt = a la varilla extrema en tracción
        cmax = h/β1                     h  = canto en la dirección de flexión

        punto 1      compresión pura (c → ∞), recortada a 0.80·Po
        puntos 2-6   c = cb + (cmax − cb)·k/5,  k = 4, 3, 2, 1, 0
        puntos 7-10  c = cb·k/5,                k = 4, 3, 2, 1
        punto 11     tracción pura (todas las varillas a −fy)

    El punto 6 es SIEMPRE el balanceado. `dt`, `h` y por lo tanto `cb` se
    recalculan POR CURVA: dependen de la dirección de flexión.

    Verificado generando la tabla completa —sin interpolar ni buscar nada— y
    cruzándola contra las 24 curvas de ETABS: 264/264 puntos, error medio
    0.0126 tonf·m, máximo 0.0345 (momentos de ~300).

ÁNGULOS
    ETABS numera sus curvas 0°, 15°, ... 345°. El ángulo del motor va al revés:

        θ_motor = −α_ETABS

    Es consecuencia de la transposición SD → ejes locales (ver wall_section).
    Acá las curvas se ROTULAN con el ángulo de ETABS y se CALCULAN con el del
    motor, así que la tabla sale directamente comparable.

SIGNOS
    Compresión POSITIVA, igual que la ventana de ETABS ("Compression is positive
    in this form") y que `compute_pn_mn_at`. No hay que invertir nada. Ojo: las
    fuerzas de barra del análisis sí van con tracción positiva — es otro módulo.

Unidades: SI puro (m, Pa, N, N·m). La conversión a tonf para mostrar es del
llamador, salvo `tabla_curve_data`, que existe justamente para comparar contra
la tabla de ETABS.
"""

import math

from .column_interaction import (
    DEFAULT_DESIGN_CODE,
    ECU,
    _phi_factor,
    _phi_factor_e060,
    axial_capacity_pn0,
    balanced_pn,
    beta1_from_fc,
    compute_pn_mn_at,
    es_steel_for_code,
    normalize_design_code,
)

__all__ = ["superficie_pmm", "tabla_curve_data", "MODOS", "FACTOR_FY_AUMENTADO"]

TONF = 9806.65  # N

# Los tres modos del diálogo "Interaction Surface" de ETABS.
MODOS = ("con_phi", "sin_phi", "sin_phi_fy_aumentado")

# El modo "Exclude Phi and Increase Fy" usa fy amplificado. 1.25 es el factor de
# resistencia probable del ACI 318 (§18.6.5) y es el mismo que ya usa
# `column_shear.probable_moment_uniaxial`. NO está verificado contra ETABS: de
# ese modo no tenemos tabla todavía, solo de "Include Phi" y "Exclude Phi".
FACTOR_FY_AUMENTADO = 1.25


def _extremos_de_la_direccion(seccion, theta):
    """
    Para una dirección de flexión: hasta dónde llega el concreto, hasta dónde la
    varilla más traccionada, y el canto de la sección en esa dirección.

    `hw` (medio ancho de fibra proyectado) es el mismo que usa
    `compute_pn_mn_at` para pesar parcialmente las fibras del borde del bloque;
    hay que usarlo acá también o `xi_max` queda media celda adentro y `h` sale
    corto — y `h` entra derecho en `cmax`.
    """
    ct, st = math.cos(theta), math.sin(theta)
    hw = (abs(seccion["fiber_du"] * ct) + abs(seccion["fiber_dv"] * st)) / 2.0
    xi_fib = [u * ct + v * st for u, v, _a in seccion["fibers"]]
    xi_bar = [u * ct + v * st for u, v, _a in seccion["bars"]]
    xi_max = max(xi_fib) + hw
    return xi_max, xi_max - min(xi_bar), xi_max - (min(xi_fib) - hw)


def _valores_de_c(seccion, theta, fy, num_puntos, code):
    """Los `c` de los puntos intermedios, según la regla. Ver el encabezado."""
    _xi_max, dt, h = _extremos_de_la_direccion(seccion, theta)
    if dt <= 0 or h <= 0:
        return []
    eps_y = fy / es_steel_for_code(code)
    cb = ECU / (ECU + eps_y) * dt
    cmax = h / beta1_from_fc(seccion["fc"])

    # Los intermedios se reparten con la mitad de arriba incluyendo el
    # balanceado: para los 11 de ETABS son 5 del lado de compresión (k = 4..0,
    # el 0 es el balanceado) y 4 del lado de tracción.
    intermedios = max(2, int(num_puntos) - 2)
    n_comp = (intermedios + 1) // 2
    n_trac = intermedios - n_comp
    lado_compresion = [cb + (cmax - cb) * k / n_comp for k in range(n_comp - 1, -1, -1)]
    lado_traccion = [cb * k / (n_trac + 1) for k in range(n_trac, 0, -1)]
    return lado_compresion + lado_traccion


def _punto_traccion_pura(seccion, fy):
    """
    Todas las varillas a −fy, sin aporte del concreto. Los momentos salen del
    reparto asimétrico del acero: con F = −fy·a, M2 = −F·v y M3 = F·u (la misma
    convención de `compute_pn_mn_at`, que acumula M2 = −ΣF·y y M3 = ΣF·x).
    """
    bars = seccion["bars"]
    return {
        "Pn": -fy * sum(a for _u, _v, a in bars),
        "M2n": fy * sum(a * v for _u, v, a in bars),
        "M3n": -fy * sum(a * u for u, _v, a in bars),
    }


def _forzar_monotonia(puntos):
    """
    Reemplaza por una RECTA el tramo donde φP deja de bajar.

    De arriba (compresión pura) hacia abajo (tracción pura), P tiene que ir
    bajando. Pero la curva de DISEÑO puede no ser monótona: en la transición, φ
    sube de 0.65 a 0.90 más rápido de lo que baja Pₙ, y el producto φPₙ vuelve a
    subir. Queda un gancho, y ETABS no lo reporta: rellena el tramo con una recta
    entre los dos puntos que lo encierran.

    MEDIDO, no supuesto. En la `PL1` del MODULO 01, tabla con φ:

        curva   0°: nuestros P en los puntos 6-9 son 560.66 · 566.93 · 567.04 ·
                    440.05 — sube en 7 y 8. ETABS pone 560.62 · 520.41 · 480.20 ·
                    439.99, que es exactamente el tercio y los dos tercios de la
                    recta 6→9.
        curva  90°: igual (659.25 · 702.40 · 718.49 · 440.28 → 659.21 · 586.22 ·
                    513.22 · 440.23, otra vez tercios exactos).
        curvas 180° y 270°: ahí P baja siempre y ETABS NO interpola — y nuestros
                    once puntos calzan tal cual.

    O sea la regla no es "interpolar los puntos 7 y 8" sino "arreglar donde la
    curva se dobla hacia atrás", que es lo que explica que solo pase en dos de
    las cuatro direcciones.

    OJO con la meseta: los primeros puntos comparten P (el tope 0.80·Po) y eso NO
    es un gancho. Por eso la comparación es ESTRICTA (`>`), no `>=`.
    """
    n = len(puntos)
    i = 1
    while i < n:
        if puntos[i]["P"] <= puntos[i - 1]["P"]:
            i += 1
            continue
        # Primer punto que vuelve a estar por debajo del que abrió el gancho.
        j = i + 1
        while j < n and puntos[j]["P"] >= puntos[i - 1]["P"]:
            j += 1
        if j >= n:
            break                      # el gancho llega hasta el final: se deja
        a, b = puntos[i - 1], puntos[j]
        for k in range(i, j):
            t = (k - (i - 1)) / (j - (i - 1))
            for eje in ("P", "M2", "M3"):
                puntos[k][eje] = a[eje] + (b[eje] - a[eje]) * t
            puntos[k]["interpolado"] = True
        i = j + 1
    return puntos


def _phi_de(pt, fc, ag, fy, code, tied, pb):
    """φ del punto, por el camino normal del código activo."""
    if normalize_design_code(code) == "E060":
        return _phi_factor_e060(pt["Pn"], fc, ag, pb=pb, tied=tied)
    eps_ty = fy / es_steel_for_code(code)
    # Sin la deformación neta a mano (tracción/compresión pura), se usa el
    # extremo que corresponda: φ de tracción arriba, φ de compresión abajo.
    return _phi_factor(pt.get("epsT", -ECU), eps_ty, tied=tied, code=code)


def superficie_pmm(seccion, fc=None, fy=None, *, num_curvas=24, num_puntos=11,
                   code=DEFAULT_DESIGN_CODE, tied=True, modo="con_phi", monotona=True):
    """
    Superficie completa, en el formato de la tabla Curve Data.

    `seccion` es lo que devuelve `wall_section.construir_seccion`, más `fc` y
    `fy` (en Pa) — se pueden pasar acá o dejarlos adentro de la sección.

    `monotona` (solo afecta al modo con φ): rellena con una recta el tramo donde
    φP deja de bajar, que es lo que hace ETABS. Ver `_forzar_monotonia`. Apagarlo
    devuelve la curva real, con su gancho.

    `modo`:
        "con_phi"              como "Include Phi" de ETABS.
        "sin_phi"              como "Exclude Phi": nominal, pero CONSERVANDO el
                               tope 0.80·Po (verificado: el punto 1 de la tabla
                               nominal de PL1 vale 1137.5872 = 0.80·Po, no Po).
        "sin_phi_fy_aumentado" como "Exclude Phi and Increase Fy", con
                               fy × FACTOR_FY_AUMENTADO (ver la nota de arriba).

    Devuelve {"curves": [{"angleDeg", "points": [{"P","M2","M3","phi","c"}]}],
              "Ag", "As", "Po", "PnMax", "code", "modo"} en SI.
    """
    fc = float(fc if fc is not None else seccion.get("fc"))
    fy_base = float(fy if fy is not None else seccion.get("fy"))
    if modo not in MODOS:
        raise ValueError("modo desconocido: %r (esperaba uno de %r)" % (modo, MODOS))
    fy_efectivo = fy_base * (FACTOR_FY_AUMENTADO if modo == "sin_phi_fy_aumentado" else 1.0)

    seccion = dict(seccion, fc=fc)
    fibers, bars = seccion["fibers"], seccion["bars"]
    ag = seccion["Ag"]
    ast = seccion["As"]
    beta1 = beta1_from_fc(fc)
    aplica_phi = (modo == "con_phi")

    po = axial_capacity_pn0(fc, fy_efectivo, ag, ast)
    pn_max = (0.80 if tied else 0.85) * po

    kw = dict(code=code, gross_area=ag, tied=tied,
              fiber_dx=seccion["fiber_du"], fiber_dy=seccion["fiber_dv"])

    curvas = []
    for k in range(int(num_curvas)):
        angulo_etabs = 360.0 * k / int(num_curvas)
        theta = math.radians(-angulo_etabs)          # θ_motor = −α_ETABS
        pb = (balanced_pn(fc, fy_efectivo, fibers, bars, 0.0, theta, beta1, code)
              if normalize_design_code(code) == "E060" else None)

        puntos = []
        # Punto 1 — compresión pura. Se pide con un c enorme en vez de una
        # fórmula aparte para que el momento salga del MISMO camino que el resto
        # (con todas las varillas plastificadas en compresión, que es el estado
        # real): en una sección asimétrica ese momento no es cero.
        c_infinito = 1e4
        for c in [c_infinito] + _valores_de_c(seccion, theta, fy_efectivo, num_puntos, code):
            pt = compute_pn_mn_at(fc, fy_efectivo, fibers, bars, 0.0, theta, c, beta1, **kw)
            phi = pt["phi"] if aplica_phi else 1.0
            puntos.append({
                "P": phi * pt["Pn"], "M2": phi * pt["M2n"], "M3": phi * pt["M3n"],
                "phi": pt["phi"], "c": None if c >= c_infinito else c,
            })

        tp = _punto_traccion_pura(seccion, fy_efectivo)
        phi_t = _phi_de(dict(tp, epsT=ECU * 10), fc, ag, fy_efectivo, code, tied, pb) if aplica_phi else 1.0
        puntos.append({"P": phi_t * tp["Pn"], "M2": phi_t * tp["M2n"],
                       "M3": phi_t * tp["M3n"], "phi": phi_t, "c": 0.0})

        # Solo la curva de DISEÑO puede tener el gancho: la nominal no lleva φ.
        if aplica_phi and monotona:
            _forzar_monotonia(puntos)
        curvas.append({"angleDeg": angulo_etabs, "points": puntos})

    return {"curves": curvas, "Ag": ag, "As": ast, "Po": po, "PnMax": pn_max,
            "code": normalize_design_code(code), "modo": modo,
            "numCurvas": int(num_curvas), "numPuntos": len(curvas[0]["points"]) if curvas else 0}


def tabla_curve_data(superficie, curva=0):
    """
    Una curva en el formato de la tabla de ETABS: filas
    `(punto, P, M2, M3)` en **tonf y tonf·m**, compresión positiva.

    Existe para poder pegar la salida al lado de la del ingeniero y compararla
    celda por celda; el resto de la API va en SI.
    """
    pts = superficie["curves"][curva]["points"]
    return [(i, p["P"] / TONF, p["M2"] / TONF, p["M3"] / TONF)
            for i, p in enumerate(pts, 1)]
