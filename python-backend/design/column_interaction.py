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
    "es_steel_for_code",
    "axial_max_nominal",
    "balanced_pn",
    "capacity_at_demand",
    "capacity_ratio_radial",
    "normalize_design_code",
    "phi_shear_for_code",
    "DEFAULT_DESIGN_CODE",
    "PHI_BY_CODE",
]

# Modulo de elasticidad del acero de refuerzo. NO es el mismo en los dos
# codigos y la diferencia es del 2%:
#   ACI 318 §20.2.2.2 : 200 000 MPa           = 2.0000e11 Pa
#   E.060  Art. 8.5.2  : 2 000 000 kg/cm2      = 1.9613e11 Pa
#
# Entra en dos lados: la tension del acero antes de fluir (fs = Es*eps) y la
# deformacion de fluencia eps_ty = fy/Es, que es la que define la transicion de
# phi por deformacion de ACI. Con fy=4200 kg/cm2 da eps_ty 0.00206 (ACI) vs
# 0.00210 (E.060) — el 0.0021 que usan las planillas peruanas.
ES_STEEL = 2.0e11  # Pa — default ACI 318; usar es_steel_for_code() para respetar el codigo
ES_BY_CODE = {
    "ACI318": 2.0e11,
    "E060": 2.0e6 * 98066.5,  # 2 000 000 kg/cm2
}


def es_steel_for_code(code=None):
    """Es del acero segun el codigo activo (ver ES_BY_CODE)."""
    return ES_BY_CODE[normalize_design_code(code)]
ECU = 0.003  # deformación última del concreto (ACI 318)
EPS_TENSION_CONTROLLED = 0.005  # ACI 318 §21.2.2

# ─── Factores de reducción de resistencia (φ) por CÓDIGO ────────────────────
# La E.060 peruana es una adaptación del ACI 318-05 pero con φ PROPIOS (y una
# ley de transición distinta, ver _phi_factor_e060). No son intercambiables:
# para una columna estribada en compresión, E.060 da 0.70 y ACI 318-19 da
# 0.65 — ~7% de diferencia directa en la capacidad reportada.
#
#   E.060 Art. 10.3.2:  flexión 0.90 | compresión estribos 0.70 / espiral 0.75
#                       | cortante (con o sin torsión) 0.85
#   ACI 318-19 §21.2:   flexión 0.90 | compresión estribos 0.65 / espiral 0.75
#                       | cortante 0.75
DEFAULT_DESIGN_CODE = "E060"

PHI_BY_CODE = {
    "E060": {"cc_tied": 0.70, "cc_spiral": 0.75, "tc": 0.90, "shear": 0.85},
    "ACI318": {"cc_tied": 0.65, "cc_spiral": 0.75, "tc": 0.90, "shear": 0.75},
}


def normalize_design_code(code):
    """'e060'/'E.060'/'E-060' → 'E060'; cualquier variante de ACI → 'ACI318'.
    Desconocido → DEFAULT_DESIGN_CODE (no revienta: el diseño sigue corriendo)."""
    key = str(code or "").upper().replace(".", "").replace("-", "").replace(" ", "")
    if key.startswith("ACI"):
        return "ACI318"
    if key.startswith("E060"):
        return "E060"
    return DEFAULT_DESIGN_CODE


def phi_shear_for_code(code=DEFAULT_DESIGN_CODE):
    """φ de cortante — E.060 0.85 (Art. 10.3.2-4) vs ACI 318 0.75."""
    return PHI_BY_CODE[normalize_design_code(code)]["shear"]


def beta1_from_fc(fc_pa):
    """β1 según ACI 318 (umbrales en MPa: 27.6 = 280 kg/cm², 55.2 = 560 kg/cm²)."""
    fc_mpa = fc_pa / 1e6
    if fc_mpa <= 27.6:
        return 0.85
    if fc_mpa >= 55.2:
        return 0.65
    return 0.85 - 0.05 * (fc_mpa - 27.6) / 6.9


def generate_rect_bar_positions(b, h, cover, bar_diameter, n3, n2, confine_bar_diameter=0.0):
    """
    Posiciones de varilla longitudinal para un patrón rectangular ETABS
    "R-n2-n3" (ver e2k-import.js parseRebarPattern — el orden real, confirmado
    contra la UI de ETABS, no contra la doc de CSI): n3 varillas por cada cara
    paralela al eje 3 (caras laterales, x=±b/2, repartidas en y), n2 por cada
    cara paralela al eje 2 (caras sup/inf, y=±h/2, repartidas en x) — esquinas
    compartidas, no duplicadas.

    b: ancho (eje local 2), h: peralte (eje local 3). cover: recubrimiento
    LIBRE hasta la superficie del estribo — "Clear Cover for Confinement
    Bars" tal como lo etiqueta el diálogo de ETABS (Reinforcement Data) y
    exporta vía COVER; NO es el cover hasta la varilla longitudinal. El
    diámetro del estribo (confine_bar_diameter, 0 si no se conoce — ej.
    columna sin armado transversal real) se resta aparte para llegar al
    centro de la varilla longitudinal, igual que ya hace column_shear.py
    para el peralte efectivo (d3/d2). Todo en metros. Origen en el centroide.

    Devuelve [(x, y), ...]; lista vacía si la geometría/patrón no da lugar
    a un rectángulo válido (caller debe tratarlo como "no soportado").
    """
    r = bar_diameter / 2.0
    xc = b / 2.0 - cover - confine_bar_diameter - r
    yc = h / 2.0 - cover - confine_bar_diameter - r
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
    """Malla de fibras de concreto.

    Devuelve (fibras, dx, dy) donde fibras = [(x, y, area), ...] con los
    centroides de celda. dx/dy hacen falta para pesar PARCIALMENTE las fibras
    que quedan a caballo del borde del bloque de compresion (ver
    compute_pn_mn_at); sin ellos el bloque se cuantiza al tamano de celda.
    """
    dx = b / nx
    dy = h / ny
    area = dx * dy
    fibers = [
        (-b / 2 + dx * (i + 0.5), -h / 2 + dy * (j + 0.5), area)
        for i in range(nx)
        for j in range(ny)
    ]
    return fibers, dx, dy


def _phi_factor(eps_t_net, eps_ty, tied=True, code="ACI318"):
    """ACI 318 §21.2.2 — transición por DEFORMACIÓN NETA de tracción.
    eps_t_net = deformación de la varilla más alejada del bloque de
    compresión (positivo = tracción)."""
    phis = PHI_BY_CODE[normalize_design_code(code)]
    phi_cc = phis["cc_tied"] if tied else phis["cc_spiral"]
    phi_tc = phis["tc"]
    if eps_t_net <= eps_ty:
        return phi_cc
    if eps_t_net >= EPS_TENSION_CONTROLLED:
        return phi_tc
    return phi_cc + (eps_t_net - eps_ty) * (phi_tc - phi_cc) / (EPS_TENSION_CONTROLLED - eps_ty)


def _phi_factor_e060(pn, fc, gross_area, pb=None, tied=True):
    """
    E.060 Art. 10.3.2 inciso 3 — transición por CARGA AXIAL, no por
    deformación del acero (ahí difiere de fondo con ACI 318, no solo en el
    valor de arranque):

      "…para valores reducidos de carga axial, φ puede incrementarse
       linealmente hasta φ = 0,90, conforme el valor de φPn disminuye desde
       0,10 f'c Ag a cero. Cuando el valor de 0,70 Pb (estribos) o 0,75 Pb
       (espiral) sea menor que 0,10 f'c Ag, ese valor lo reemplaza."

    O sea: φ = φcc + (0,90 − φcc)·(1 − φPn/limite), con
    limite = min(0,10 f'c Ag, φcc·Pb). Como φ aparece a ambos lados, se
    despeja en cerrada (equivalente exacto, sin iterar):

        φ = 0,90 / (1 + (0,90 − φcc)·Pn/limite)

    (comprobación: con φPn = limite da φ = φcc; con Pn = 0 da 0,90).
    """
    phis = PHI_BY_CODE["E060"]
    phi_cc = phis["cc_tied"] if tied else phis["cc_spiral"]
    phi_tc = phis["tc"]

    if pn <= 0:
        return phi_tc  # tracción o flexión pura → 0.90 (Art. 10.3.2 incisos 1-2)

    limit = 0.10 * fc * gross_area
    if pb is not None and pb > 0 and phi_cc * pb < limit:
        limit = phi_cc * pb
    if limit <= 0:
        return phi_cc

    phi = phi_tc / (1.0 + (phi_tc - phi_cc) * pn / limit)
    return max(phi_cc, min(phi_tc, phi))


def balanced_pn(fc, fy, fibers, bars, bar_area, theta, beta1, code=None):
    """
    Pb — carga axial nominal del punto BALANCEADO en la dirección theta: la
    varilla más traccionada llega a εy justo cuando el concreto llega a ECU,
    o sea c_b = ECU·d_t/(ECU + εy) con d_t = distancia de la fibra extrema
    comprimida a esa varilla, medida sobre el eje theta.

    Solo lo necesita la transición de φ de la E.060 (ver _phi_factor_e060);
    ACI 318 no lo usa (su transición es por deformación). Devuelve None si
    no hay varillas.
    """
    if not bars:
        return None
    cos_t, sin_t = math.cos(theta), math.sin(theta)
    xi_max = max(x * cos_t + y * sin_t for x, y, _a in fibers)
    xi_min_bar = min(x * cos_t + y * sin_t for x, y in bars)
    d_t = xi_max - xi_min_bar
    if d_t <= 0:
        return None
    eps_ty = fy / es_steel_for_code(code)
    c_b = ECU * d_t / (ECU + eps_ty)
    if c_b <= 0:
        return None
    pt = compute_pn_mn_at(fc, fy, fibers, bars, bar_area, theta, c_b, beta1)
    return pt["Pn"]


def compute_pn_mn_at(fc, fy, fibers, bars, bar_area, theta, c, beta1,
                     code=DEFAULT_DESIGN_CODE, gross_area=None, pb=None,
                     tied=True, fiber_dx=0.0, fiber_dy=0.0):
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

    `code` decide SOLO cómo sale φ (E.060 por carga axial vs ACI 318 por
    deformación) — Pn/M2n/M3n nominales son idénticos en ambos códigos.
    `gross_area`/`pb` los usa la transición de la E.060; si no llegan, se
    derivan de las fibras (Ag) y se omite el tope por Pb.
    """
    cos_t, sin_t = math.cos(theta), math.sin(theta)

    # Semi-ancho de una fibra PROYECTADO sobre la direccion de flexion. Con el
    # se corrigen dos cuantizaciones que introducia la malla:
    #
    #  a) xi_max se tomaba del centro de la fibra mas externa, no del BORDE de
    #     la seccion: el bloque arrancaba media fibra adentro.
    #  b) una fibra entraba ENTERA o NADA segun su centro, asi que la
    #     profundidad efectiva del bloque saltaba de a una celda. Medido con
    #     malla 60x60 sobre 45 cm (celda 0.75 cm): hasta 5.9% de error en la
    #     compresion del concreto, oscilando con c.
    #
    # Ahora cada fibra aporta la FRACCION de su proyeccion que cae dentro del
    # bloque. Es exacto cuando theta es multiplo de 90 grados y muy bueno en el
    # resto (el perfil real de una celda rotada no es lineal, pero el error
    # residual es de segundo orden y se promedia entre celdas vecinas).
    es_steel = es_steel_for_code(code)
    half_w = (abs(fiber_dx * cos_t) + abs(fiber_dy * sin_t)) / 2.0

    xi_max = max(x * cos_t + y * sin_t for x, y, _a in fibers) + half_w
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

    # Salidas tempranas: la mayoria de las fibras cae CLARAMENTE dentro o
    # CLARAMENTE fuera del bloque, y solo la franja del borde necesita la
    # fraccion. Sin esto se hacia la division para las 3600 fibras.
    borde_lo = block_lo - half_w
    borde_hi = block_lo + half_w
    for x, y, area in fibers:
        xi = x * cos_t + y * sin_t
        if xi <= borde_lo:
            continue                      # fuera del bloque
        if xi >= borde_hi:
            add_force(x, y, 0.85 * fc * area)   # dentro, entera
            continue
        frac = (xi - borde_lo) / (2.0 * half_w)
        add_force(x, y, 0.85 * fc * area * frac)

    eps_min = None  # deformación más chica (más traccionada) entre las varillas
    for x, y in bars:
        xi = x * cos_t + y * sin_t
        eps = ECU * (xi - xi_max + c) / c
        fs = max(-fy, min(fy, es_steel * eps))
        force = fs * bar_area
        if xi >= block_lo:
            force -= 0.85 * fc * bar_area  # concreto desplazado por la varilla
        add_force(x, y, force)
        if eps_min is None or eps < eps_min:
            eps_min = eps

    eps_t_net = -eps_min if eps_min is not None else -ECU
    eps_ty = fy / es_steel

    pn_sin_tope = Pn

    # ── Tope de carga axial ──
    # ACI 318-14 §22.4.2.1 (Tabla 22.4.2.1) y E.060 Art. 10.3.6: Pn no puede
    # exceder 0.80·Po en columnas ESTRIBADAS (0.85·Po con espiral). Cubre la
    # excentricidad accidental que siempre existe, aunque el cálculo diga
    # compresión pura.
    #
    # El tope TRUNCA la curva con una horizontal: se recorta Pn y se DEJA el
    # momento como está. Por eso la curva de diseño tiene la meseta plana que
    # se ve arriba del diagrama de interacción de ETABS.
    #
    # VALIDADO contra la tabla "Curve Data" de ETABS (C45x45, 12 varillas de
    # 3.142e-4 m², f'c=210, fy=4200): su punto 1 vale 266.8064 tonf, que es
    # exactamente 0.65 · 0.80 · Po. Sin este tope la superficie subía hasta
    # φPo = 333.51 tonf — 25% de más, y del lado inseguro.
    if gross_area is not None and Pn > 0:
        ast = len(bars) * bar_area
        po = 0.85 * fc * (gross_area - ast) + fy * ast
        p_max = (0.80 if tied else 0.85) * po
        if Pn > p_max:
            Pn = p_max

    if normalize_design_code(code) == "E060":
        ag = gross_area if gross_area is not None else sum(a for _x, _y, a in fibers)
        phi = _phi_factor_e060(Pn, fc, ag, pb=pb, tied=tied)
    else:
        phi = _phi_factor(eps_t_net, eps_ty, tied=tied, code=code)

    # `PnUncapped` = Pn ANTES del tope. Lo usa compute_pmm_surface para ubicar
    # por interpolacion la ESQUINA de la meseta (donde la curva real cruza
    # 0.80*Po); sobre `Pn` no se puede, porque ahi ya esta aplanado.
    return {"Pn": Pn, "M2n": M2, "M3n": M3, "phi": phi, "PnUncapped": pn_sin_tope}


def axial_capacity_pn0(fc, fy, gross_area, total_bar_area):
    """Po — compresión pura, fórmula cerrada. El cálculo por fibra converge a
    esto por c grande; la misma expresión es la base del tope Pn,max =
    0.80·Po / 0.85·Po que aplica compute_pn_mn_at."""
    return 0.85 * fc * (gross_area - total_bar_area) + fy * total_bar_area


def axial_max_nominal(fc, fy, gross_area, total_bar_area, tied=True):
    """Pn,max = 0.80·Po (estribos) o 0.85·Po (espiral) — ACI 318-14 Tabla
    22.4.2.1 / E.060 Art. 10.3.6. Es el techo plano del diagrama."""
    po = axial_capacity_pn0(fc, fy, gross_area, total_bar_area)
    return (0.80 if tied else 0.85) * po


def capacity_at_demand(b, h, fc, fy, cover, bar_diameter, n3, n2, bar_area,
                        theta, target_p, beta1=None, nx=60, ny=60, iters=40,
                        confine_bar_diameter=0.0, code=DEFAULT_DESIGN_CODE,
                        tied=True):
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
    bars = generate_rect_bar_positions(b, h, cover, bar_diameter, n3, n2, confine_bar_diameter)
    if not bars:
        return None

    fibers, fdx, fdy = _rect_fiber_grid(b, h, nx, ny)
    max_dim = math.hypot(b, h)
    c_lo, c_hi = max_dim * 0.001, max_dim * 6.0

    # Ag/Pb: solo los consume la transición de φ de la E.060 (ver
    # _phi_factor_e060). Se calculan UNA vez y viajan a cada evaluación.
    ag = b * h
    pb = balanced_pn(fc, fy, fibers, bars, bar_area, theta, beta1, code) \
        if normalize_design_code(code) == "E060" else None
    kw = {"code": code, "gross_area": ag, "pb": pb, "tied": tied,
          "fiber_dx": fdx, "fiber_dy": fdy}

    pt_lo = compute_pn_mn_at(fc, fy, fibers, bars, bar_area, theta, c_lo, beta1, **kw)
    pt_hi = compute_pn_mn_at(fc, fy, fibers, bars, bar_area, theta, c_hi, beta1, **kw)

    if target_p <= pt_lo["Pn"]:
        pt = pt_lo
    elif target_p >= pt_hi["Pn"]:
        pt = pt_hi
    else:
        pt = pt_hi
        for _ in range(iters):
            c_mid = (c_lo + c_hi) / 2.0
            pt = compute_pn_mn_at(fc, fy, fibers, bars, bar_area, theta, c_mid, beta1, **kw)
            if pt["Pn"] < target_p:
                c_lo = c_mid
            else:
                c_hi = c_mid

    pt["phiPn"] = pt["phi"] * pt["Pn"]
    pt["phiM2n"] = pt["phi"] * pt["M2n"]
    pt["phiM3n"] = pt["phi"] * pt["M3n"]
    return pt


def capacity_ratio_radial(b, h, fc, fy, cover, bar_diameter, n3, n2, bar_area,
                           target_p, target_m2, target_m3, beta1=None,
                           nx=60, ny=60, num_c=60, iters=40,
                           confine_bar_diameter=0.0, code=DEFAULT_DESIGN_CODE,
                           tied=True):
    """
    Ratio P-M-M "radial", el mismo que reporta ETABS (D/C Ratio del diálogo
    "Interaction Surface", ACI 318-19) — NO compara M_demanda contra
    M_capacidad al MISMO Pn (eso es `capacity_at_demand`, mucho más
    conservador para columnas livianas: ver project_pmm_ratio_gap). Compara
    la distancia desde el origen (P=0, M=0) hasta el punto de demanda contra
    la distancia desde el origen hasta donde el MISMO rayo — ángulo fijo en
    el plano P-M2-M3 — corta la superficie de capacidad.

    Validado contra el diálogo real de ETABS en 5 puntos (columnas C1/C2/C22
    de un modelo de referencia): diff 0.1%-0.3% en 4 de 5 (el quinto, con
    armado aún aproximado en esa comparación, dio -12%) — la brecha de 5-6x
    que se arrastraba antes era enteramente esta diferencia de definición,
    no un error de capacidad/geometría/armado.

    Devuelve {"ratio", "thetaDeg", "phi", "capacity": {Pn, M2n, M3n, phiPn,
    phiM2n, phiM3n}} o None si el patrón de armado es inválido o el rayo no
    corta la superficie en el rango de c barrido (demanda degenerada).
    """
    if beta1 is None:
        beta1 = beta1_from_fc(fc)
    bars = generate_rect_bar_positions(b, h, cover, bar_diameter, n3, n2, confine_bar_diameter)
    if not bars:
        return None

    m_res_demand = math.hypot(target_m2, target_m3)
    if m_res_demand <= 0 and target_p == 0:
        return None

    fibers, fdx, fdy = _rect_fiber_grid(b, h, nx, ny)
    # theta se mide DESDE el eje M3 HACIA el M2 — es la convencion de la
    # superficie: compute_pn_mn_at con theta=0 da flexion pura sobre el eje 3
    # (M3 != 0, M2 = 0) y con theta=90 grados da M2 puro. Por eso va
    # atan2(M2, M3) y NO atan2(M3, M2).
    #
    # Estaba al reves: una demanda de M3 puro se verificaba contra la
    # capacidad del plano M2. Con armado asimetrico (R-5-3) los dos planos
    # difieren ~17%, asi que el ratio salia mal en demandas cerca de
    # uniaxiales; en las biaxiales a ~45 grados casi no se notaba, que es
    # por que paso desapercibido en la validacion contra ETABS.
    #
    # ETABS usa la misma convencion: su curva 'at 253.922 deg' corresponde a
    # M2=-24.4382 / M3=-7.0434, y atan2(M2, M3) da exactamente 253.922.
    theta = math.atan2(target_m2, target_m3)
    max_dim = math.hypot(b, h)
    c_lo_bound, c_hi_bound = max_dim * 0.001, max_dim * 6.0

    # Ag/Pb para la transición de φ de la E.060 — una sola vez (ver
    # _phi_factor_e060); en ACI 318 no se usan.
    ag = b * h
    pb = balanced_pn(fc, fy, fibers, bars, bar_area, theta, beta1, code) \
        if normalize_design_code(code) == "E060" else None
    kw = {"code": code, "gross_area": ag, "pb": pb, "tied": tied,
          "fiber_dx": fdx, "fiber_dy": fdy}

    def eval_c(c):
        pt = compute_pn_mn_at(fc, fy, fibers, bars, bar_area, theta, c, beta1, **kw)
        Pn = pt["phi"] * pt["Pn"]
        Mn = pt["phi"] * math.hypot(pt["M2n"], pt["M3n"])
        f = Pn * m_res_demand - Mn * target_p
        return pt, Pn, Mn, f

    # Recorrido grueso para acotar el cruce de signo (Mn no es monótono en c
    # — sube hasta el punto balanceado y luego baja — así que no alcanza con
    # bisección directa de punta a punta como en `capacity_at_demand`).
    c_values = [c_lo_bound + (c_hi_bound - c_lo_bound) * i / (num_c - 1) for i in range(num_c)]
    bracket = None
    prev_c, prev_f = None, None
    for c in c_values:
        _, _, _, f = eval_c(c)
        if prev_f is not None and prev_f * f <= 0 and f != prev_f:
            bracket = (prev_c, c)
            break
        prev_c, prev_f = c, f

    if bracket is None:
        return None

    c_lo, c_hi = bracket
    _, _, _, f_lo = eval_c(c_lo)
    pt = Pn = Mn = None
    for _ in range(iters):
        c_mid = (c_lo + c_hi) / 2.0
        pt, Pn, Mn, f_mid = eval_c(c_mid)
        if f_lo * f_mid <= 0:
            c_hi = c_mid
        else:
            c_lo, f_lo = c_mid, f_mid

    denom, demand_component = (Pn, target_p) if abs(target_p) > abs(m_res_demand) else (Mn, m_res_demand)
    if not denom:
        return None

    pt["phiPn"] = Pn
    pt["phiM2n"] = pt["phi"] * pt["M2n"]
    pt["phiM3n"] = pt["phi"] * pt["M3n"]
    return {
        "ratio": demand_component / denom,
        "thetaDeg": math.degrees(theta) % 360,
        "phi": pt["phi"],
        "capacity": pt,
    }


def compute_pmm_surface(b, h, fc, fy, cover, bar_diameter, n3, n2, bar_area,
                         tied=True, num_angles=24, num_c=21, nx=60, ny=60,
                         confine_bar_diameter=0.0, code=DEFAULT_DESIGN_CODE):
    """
    Superficie de interacción completa: `num_angles` curvas (una por ángulo,
    0°..360°), cada una con `num_c` puntos (de casi-tracción-pura a
    compresión-pura). Mismo formato conceptual que las "24 curvas" que hoy se
    pegan a mano en columnav2.

    Devuelve {beta1, bars:[(x,y),...], curves:[{angleDeg, points:[...]}]}.
    """
    beta1 = beta1_from_fc(fc)
    bars = generate_rect_bar_positions(b, h, cover, bar_diameter, n3, n2, confine_bar_diameter)
    if not bars:
        return None

    fibers, fdx, fdy = _rect_fiber_grid(b, h, nx, ny)
    max_dim = math.hypot(b, h)
    c_min = max_dim * 0.01
    # Barrido LINEAL de c, pero con c_max acotado a la DIAGONAL de la seccion.
    #
    # El problema no era la forma del barrido sino su alcance: con c_max = 6
    # diagonales, casi todos los puntos caian en la meseta del tope 0.80*Po
    # (Pn(c) se satura apenas la seccion queda toda comprimida) y la rama util
    # se quedaba sin resolucion. Medido en la C45x45 con 21 puntos: el barrido
    # lineal original dejaba huecos de 78 t en P a 0 grados y 99 t a 45; el
    # geometrico que lo reemplazo repartia mejor la cuenta pero amontonaba los
    # puntos en el extremo de TRACCION, dejando el mismo hueco en el medio.
    #
    # Con c_max = 1.0 * diagonal el hueco maximo baja a 57 t (0 grados) y 34 t
    # (45 grados), y la meseta queda representada hasta M~8-10 t-m, que es donde
    # esta la esquina real (9.36) y el punto 2 de ETABS (9.18).
    #
    # OJO con el 1.0: tiene que ser >= 1/beta1 veces la extension de la seccion
    # en la direccion de flexion para que el ULTIMO punto llegue a compresion
    # pura en CUALQUIER angulo. Con 0.85*diagonal la curva a 45 grados ya no
    # alcanzaba el tope.
    c_max = max_dim
    c_values = [c_min + (c_max - c_min) * i / (num_c - 1) for i in range(num_c)]

    ag = b * h
    is_e060 = normalize_design_code(code) == "E060"

    # Traccion pura: todas las varillas a -fy, sin aporte del concreto.
    # phi sale del mismo camino que el resto de la curva para no inventar un
    # criterio aparte (con Pn negativo ambos codigos dan el 0.90 de flexion).
    pure_tension = -fy * len(bars) * bar_area
    if is_e060:
        phi_tension = _phi_factor_e060(pure_tension, fc, ag, pb=None, tied=tied)
    else:
        phi_tension = _phi_factor(ECU * 10, fy / es_steel_for_code(code), tied=tied, code=code)

    # Compresion pura: el tope Pn,max = 0.80*Po (0.85*Po con espiral), con el
    # phi de compresion. Mismo criterio que arriba: el phi sale del camino
    # normal, no de un valor inventado aparte.
    p_max_axial = axial_max_nominal(fc, fy, ag, len(bars) * bar_area, tied=tied)
    if is_e060:
        phi_compresion = _phi_factor_e060(p_max_axial, fc, ag, pb=None, tied=tied)
    else:
        phi_compresion = _phi_factor(-ECU, fy / es_steel_for_code(code), tied=tied, code=code)

    curves = []
    for k in range(num_angles):
        theta = 2 * math.pi * k / num_angles
        # Pb depende del ángulo (la varilla más traccionada cambia con theta),
        # así que se recalcula por curva — solo si el código lo necesita.
        pb = balanced_pn(fc, fy, fibers, bars, bar_area, theta, beta1, code) if is_e060 else None
        kw = {"code": code, "gross_area": ag, "pb": pb, "tied": tied,
          "fiber_dx": fdx, "fiber_dy": fdy}
        points = []
        for c in c_values:
            pt = compute_pn_mn_at(fc, fy, fibers, bars, bar_area, theta, c, beta1, **kw)
            pt["phiPn"] = pt["phi"] * pt["Pn"]
            pt["phiM2n"] = pt["phi"] * pt["M2n"]
            pt["phiM3n"] = pt["phi"] * pt["M3n"]
            points.append(pt)
        # ESQUINA DE LA MESETA: el punto exacto donde la curva real cruza el
        # tope 0.80*Po. Sin el, el barrido deja la esquina redondeada (llegaba a
        # M~8.3 cuando la real es 9.36 y el punto 2 de ETABS vale 9.18).
        #
        # No hace falta bisectar a ciegas: `PnUncapped` da el Pn SIN recortar,
        # asi que el bracket sale de dos puntos ya calculados y se refina con
        # SECANTE en 3 evaluaciones extra por curva.
        #
        # Va ACA, antes de meter el punto de traccion: en este momento `points`
        # todavia calza indice a indice con `c_values`.
        esquina = None
        for i in range(len(points) - 1):
            pa = points[i]["PnUncapped"]
            pb = points[i + 1]["PnUncapped"]
            if not (pa < p_max_axial <= pb) or pb == pa:
                continue
            ca, cb = c_values[i], c_values[i + 1]
            for _ in range(3):
                cm = ca + (p_max_axial - pa) / (pb - pa) * (cb - ca)
                pt = compute_pn_mn_at(fc, fy, fibers, bars, bar_area, theta, cm, beta1, **kw)
                if pt["PnUncapped"] < p_max_axial:
                    ca, pa = cm, pt["PnUncapped"]
                else:
                    cb, pb = cm, pt["PnUncapped"]
                esquina = pt
            break

        if esquina is not None:
            esquina["phiPn"] = esquina["phi"] * esquina["Pn"]
            esquina["phiM2n"] = esquina["phi"] * esquina["M2n"]
            esquina["phiM3n"] = esquina["phi"] * esquina["M3n"]
            # En orden de c (= orden de P). Mantenerlo importa: la malla de la
            # superficie y el corte del grafico recorren las 24 curvas por
            # INDICE, y si P dejara de ser monotono dentro de una curva el
            # mallado se doblaria.
            idx = next((k for k, q in enumerate(points) if q["PnUncapped"] >= p_max_axial),
                       len(points))
            points.insert(idx, esquina)

        # Cierre por TRACCION PURA, en forma cerrada. El barrido de c nunca llega:
        # por chico que sea c_min queda una punta de concreto comprimido, y la
        # curva se corta en ~-137 tonf en vez de los -142.52 reales (medido en la
        # C45x45; ETABS reporta el valor exacto como su ultimo punto).
        #
        # Con todas las varillas fluyendo en traccion el momento resultante es
        # cero en CUALQUIER angulo (patron simetrico), asi que el mismo punto
        # cierra las N curvas.
        points.insert(0, {
            "Pn": pure_tension,
            "PnUncapped": pure_tension,
            "M2n": 0.0,
            "M3n": 0.0,
            "phi": phi_tension,
            "phiPn": phi_tension * pure_tension,
            "phiM2n": 0.0,
            "phiM3n": 0.0,
        })

        # Cierre por COMPRESION PURA, en forma cerrada. Con c finito la seccion
        # queda toda comprimida pero las varillas siguen a deformaciones
        # DISTINTAS (la del borde a ECU, la opuesta a ECU*(c-d)/c), asi que el
        # momento neto nunca llega exactamente a cero: tiende a 0 recien con
        # c -> infinito. Antes el barrido lo forzaba con c_max = 6 diagonales,
        # a costa de tirar casi todos los puntos en la meseta.
        #
        # Es el punto 1 de la tabla de ETABS: P = phi*0.80*Po, M = 0.
        points.append({
            "Pn": p_max_axial,
            "PnUncapped": p_max_axial,
            "M2n": 0.0,
            "M3n": 0.0,
            "phi": phi_compresion,
            "phiPn": phi_compresion * p_max_axial,
            "phiM2n": 0.0,
            "phiM3n": 0.0,
        })

        curves.append({"angleDeg": math.degrees(theta), "points": points})

    return {"beta1": beta1, "bars": bars, "curves": curves}
