"""python-backend/design/column_interaction.py

Diagrama de interacción P-M-M biaxial para columnas RECTANGULARES de concreto
armado (ACI-318), método de fibra: la sección de concreto se discretiza en una
malla fina de celdas (bloque de Whitney aplicado celda por celda, no por
integración geométrica cerrada — más simple y robusto para cualquier ángulo de
flexión), y el acero longitudinal usa las posiciones REALES de varilla
(patrón "R-n2-n3" de ETABS, ver e2k-import.js y el plan de columnas).

Unidades: SI puro (m, Pa, N, N·m) en toda la API pública de este módulo. La
conversión a tonf/tonf-m para mostrar en la app es responsabilidad del
llamador (mismo criterio que seismic/, que también trabaja en SI internamente).

Solo columnas rectangulares — ver decisión de alcance en el plan de columnas.
"""

import math

__all__ = [
    "beta1_from_fc",
    "generate_rect_bar_positions",
    "compute_pn_mn_at",
    "compute_pmm_surface",
    "axial_capacity_pn0",
    "capacity_at_demand",
]

ES_STEEL = 2.0e11  # Pa — módulo de elasticidad del acero (200000 MPa)
ECU = 0.003  # deformación última del concreto (ACI 318)
EPS_TENSION_CONTROLLED = 0.005  # ACI 318 §21.2.2


def beta1_from_fc(fc_pa):
    """β1 según ACI 318 (umbrales en MPa: 27.6 = 280 kg/cm², 55.2 = 560 kg/cm²)."""
    fc_mpa = fc_pa / 1e6
    if fc_mpa <= 27.6:
        return 0.85
    if fc_mpa >= 55.2:
        return 0.65
    return 0.85 - 0.05 * (fc_mpa - 27.6) / 6.9


def generate_rect_bar_positions(b, h, cover, bar_diameter, n3, n2):
    """
    Posiciones de varilla longitudinal para un patrón rectangular ETABS
    "R-n2-n3" (ver e2k-import.js parseRebarPattern — el orden real, confirmado
    contra la UI de ETABS, no contra la doc de CSI): n3 varillas por cada cara
    paralela al eje 3 (caras laterales, x=±b/2, repartidas en y), n2 por cada
    cara paralela al eje 2 (caras sup/inf, y=±h/2, repartidas en x) — esquinas
    compartidas, no duplicadas.

    b: ancho (eje local 2), h: peralte (eje local 3), cover: recubrimiento
    hasta el borde de la varilla longitudinal (ya incluye el estribo, tal
    como lo exporta ETABS vía COVER). Todo en metros. Origen en el centroide.

    Devuelve [(x, y), ...]; lista vacía si la geometría/patrón no da lugar
    a un rectángulo válido (caller debe tratarlo como "no soportado").
    """
    r = bar_diameter / 2.0
    xc = b / 2.0 - cover - r
    yc = h / 2.0 - cover - r
    if xc <= 0 or yc <= 0 or n3 < 2 or n2 < 2:
        return []

    bars = []
    for x in (xc, -xc):
        for i in range(n3):
            y = (-yc + (2 * yc) * i / (n3 - 1)) if n3 > 1 else 0.0
            bars.append((x, y))
    # Caras sup/inf: se excluyen las 2 posiciones extremas (esquinas, ya
    # puestas por las caras laterales) para no duplicar varilla.
    for y in (yc, -yc):
        for i in range(1, n2 - 1):
            x = -xc + (2 * xc) * i / (n2 - 1)
            bars.append((x, y))
    return bars


def _rect_fiber_grid(b, h, nx=60, ny=60):
    """Malla de fibras de concreto: [(x, y, área), ...], centroides de celda."""
    dx = b / nx
    dy = h / ny
    area = dx * dy
    return [
        (-b / 2 + dx * (i + 0.5), -h / 2 + dy * (j + 0.5), area)
        for i in range(nx)
        for j in range(ny)
    ]


def _phi_factor(eps_t_net, eps_ty, tied=True):
    """ACI 318 §21.2.2. eps_t_net = deformación NETA de tracción de la
    varilla más alejada del bloque de compresión (positivo = tracción)."""
    phi_cc = 0.65 if tied else 0.75  # compression-controlled (estribos vs espiral)
    phi_tc = 0.90  # tension-controlled
    if eps_t_net <= eps_ty:
        return phi_cc
    if eps_t_net >= EPS_TENSION_CONTROLLED:
        return phi_tc
    return phi_cc + (eps_t_net - eps_ty) * (phi_tc - phi_cc) / (EPS_TENSION_CONTROLLED - eps_ty)


def compute_pn_mn_at(fc, fy, fibers, bars, bar_area, theta, c, beta1):
    """
    Un punto (Pn, M2n, M3n, φ) de la superficie, para un ángulo de flexión
    theta (rad, medido en el plano x=eje2/y=eje3) y una profundidad de eje
    neutro c (m, > 0) medida desde la fibra extrema comprimida en la
    dirección theta. Convención: Pn > 0 = compresión.

    c NO se trunca en un tope "c=infinito" especial: barrer c hasta varias
    veces la dimensión de la sección ya satura Pn a Pn0 de forma natural
    (todas las fibras entran al bloque, todas las varillas llegan a ECU y
    plastifican en compresión) — validado contra la fórmula cerrada de Pn0
    en design/tests (ver plan de columnas, paso 2).
    """
    cos_t, sin_t = math.cos(theta), math.sin(theta)
    xi_max = max(x * cos_t + y * sin_t for x, y, _a in fibers)
    a = beta1 * c
    block_lo = xi_max - a

    Pn = 0.0
    M2 = 0.0
    M3 = 0.0

    def add_force(x, y, force):
        nonlocal Pn, M2, M3
        Pn += force
        M2 += -force * y
        M3 += force * x

    for x, y, area in fibers:
        xi = x * cos_t + y * sin_t
        if xi >= block_lo:
            add_force(x, y, 0.85 * fc * area)

    eps_min = None  # deformación más chica (más traccionada) entre las varillas
    for x, y in bars:
        xi = x * cos_t + y * sin_t
        eps = ECU * (xi - xi_max + c) / c
        fs = max(-fy, min(fy, ES_STEEL * eps))
        force = fs * bar_area
        if xi >= block_lo:
            force -= 0.85 * fc * bar_area  # concreto desplazado por la varilla
        add_force(x, y, force)
        if eps_min is None or eps < eps_min:
            eps_min = eps

    eps_t_net = -eps_min if eps_min is not None else -ECU
    eps_ty = fy / ES_STEEL
    phi = _phi_factor(eps_t_net, eps_ty)

    return {"Pn": Pn, "M2n": M2, "M3n": M3, "phi": phi}


def axial_capacity_pn0(fc, fy, gross_area, total_bar_area):
    """Fórmula cerrada de compresión pura — checkpoint de validación (NO se
    usa en el cálculo real, que ya converge a esto por c grande)."""
    return 0.85 * fc * (gross_area - total_bar_area) + fy * total_bar_area


def capacity_at_demand(b, h, fc, fy, cover, bar_diameter, n3, n2, bar_area,
                        theta, target_p, beta1=None, nx=60, ny=60, iters=40):
    """
    Capacidad EXACTA (sin interpolar entre ángulos ni entre puntos de una
    curva) en el ángulo real de la demanda (theta, rad) y su Pu exacto
    (target_p, N): busca por bisección la profundidad de eje neutro c tal
    que Pn(theta, c) == target_p — Pn es monótono creciente en c para un
    theta fijo (más profundidad = más fibras/varillas entran en compresión),
    así que la bisección es válida — y devuelve el punto ahí. Reemplaza la
    interpolación entre las 24 curvas de `compute_pmm_surface` para el
    CHEQUEO puntual (la superficie completa sigue sirviendo de referencia
    visual). Devuelve None si el patrón de armado es inválido.
    """
    if beta1 is None:
        beta1 = beta1_from_fc(fc)
    bars = generate_rect_bar_positions(b, h, cover, bar_diameter, n3, n2)
    if not bars:
        return None

    fibers = _rect_fiber_grid(b, h, nx, ny)
    max_dim = math.hypot(b, h)
    c_lo, c_hi = max_dim * 0.001, max_dim * 6.0

    pt_lo = compute_pn_mn_at(fc, fy, fibers, bars, bar_area, theta, c_lo, beta1)
    pt_hi = compute_pn_mn_at(fc, fy, fibers, bars, bar_area, theta, c_hi, beta1)

    if target_p <= pt_lo["Pn"]:
        pt = pt_lo
    elif target_p >= pt_hi["Pn"]:
        pt = pt_hi
    else:
        pt = pt_hi
        for _ in range(iters):
            c_mid = (c_lo + c_hi) / 2.0
            pt = compute_pn_mn_at(fc, fy, fibers, bars, bar_area, theta, c_mid, beta1)
            if pt["Pn"] < target_p:
                c_lo = c_mid
            else:
                c_hi = c_mid

    pt["phiPn"] = pt["phi"] * pt["Pn"]
    pt["phiM2n"] = pt["phi"] * pt["M2n"]
    pt["phiM3n"] = pt["phi"] * pt["M3n"]
    return pt


def compute_pmm_surface(b, h, fc, fy, cover, bar_diameter, n3, n2, bar_area,
                         tied=True, num_angles=24, num_c=21, nx=60, ny=60):
    """
    Superficie de interacción completa: `num_angles` curvas (una por ángulo,
    0°..360°), cada una con `num_c` puntos (de casi-tracción-pura a
    compresión-pura). Mismo formato conceptual que las "24 curvas" que hoy se
    pegan a mano en columnav2.

    Devuelve {beta1, bars:[(x,y),...], curves:[{angleDeg, points:[...]}]}.
    """
    beta1 = beta1_from_fc(fc)
    bars = generate_rect_bar_positions(b, h, cover, bar_diameter, n3, n2)
    if not bars:
        return None

    fibers = _rect_fiber_grid(b, h, nx, ny)
    max_dim = math.hypot(b, h)
    c_min = max_dim * 0.01
    c_max = max_dim * 6.0
    c_values = [c_min + (c_max - c_min) * i / (num_c - 1) for i in range(num_c)]

    curves = []
    for k in range(num_angles):
        theta = 2 * math.pi * k / num_angles
        points = []
        for c in c_values:
            pt = compute_pn_mn_at(fc, fy, fibers, bars, bar_area, theta, c, beta1)
            pt["phiPn"] = pt["phi"] * pt["Pn"]
            pt["phiM2n"] = pt["phi"] * pt["M2n"]
            pt["phiM3n"] = pt["phi"] * pt["M3n"]
            points.append(pt)
        curves.append({"angleDeg": math.degrees(theta), "points": points})

    return {"beta1": beta1, "bars": bars, "curves": curves}
