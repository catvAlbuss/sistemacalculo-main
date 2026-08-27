"""python-backend/design/column_slenderness.py

Esbeltez de columnas: magnificacion de momentos de 2do orden para porticos
ARRIOSTRADOS (sin desplazamiento lateral), E.060 Art. 10.12 / ACI 318 cap. 6.

Por que existe: `column_interaction.py` verifica la seccion contra P/M2/M3 tal
como salen del analisis (1er orden). En una columna esbelta el desplazamiento
propio del elemento agrega momento (efecto P-delta local) que el analisis
lineal no ve, y la norma obliga a amplificarlo antes de verificar la seccion.
Sin esto el momento de diseno queda SUBESTIMADO — del lado inseguro.

Formulas (E.060 10.12, validadas numericamente contra una plantilla de
referencia peruana con 11 combos reales — ver design/tests/test_slenderness.py):

    r      = sqrt(Ig/Ag)                     (0.30h para rectangular)
    limite = 34 - 12*(M1/M2)  <= 40          (10.12.2)
    esbelta si  k*lu/r > limite
    EI     = 0.4*Ec*Ig / (1 + Bd)            (10.12.3, forma simplificada)
    Pc     = pi^2 * EI / (k*lu)^2            (carga critica de Euler)
    Cm     = 0.6 + 0.4*(M1/M2)  >= 0.4       (10.12.3.1)
    dns    = Cm / (1 - Pu/(0.75*Pc))  >= 1   (10.12.3)
    Mc     = dns * M2                        (momento magnificado de diseno)

Convencion de M1/M2: M1 es el momento de MENOR magnitud y M2 el de MAYOR, con
su SIGNO del analisis. Extremos de signo opuesto (curvatura doble) dan una
relacion negativa -> Cm baja hasta el piso de 0.4; extremos del mismo signo
(curvatura simple, el caso mas desfavorable) la suben hasta 1.0.

ALCANCE: solo porticos ARRIOSTRADOS (delta_ns). El caso NO arriostrado
(delta_s, E.060 10.13) NO esta implementado — necesita el indice de
estabilidad Q por piso, no un dato de elemento. `k` se recibe como dato (1.0
por defecto, valor de arriostrado); no se calcula desde las rigideces de los
nudos.

Unidades: SI puro (m, Pa, N, N*m), igual que column_interaction.py.
"""

import math

__all__ = [
    "minimum_eccentricity_variants",
    "radius_of_gyration",
    "slenderness_limit_nonsway",
    "cm_factor",
    "critical_load",
    "magnify_nonsway",
]

# Fraccion de Ec*Ig que se toma como rigidez efectiva a flexion (E.060
# 10.12.3, expresion simplificada — la alternativa 0.2EcIg + EsIse necesita
# el momento de inercia del acero respecto del centroide, que aca no se pide).
EI_FACTOR = 0.4

# Piso de Cm (E.060 10.12.3.1).
CM_MIN = 0.4

# Tope del limite de esbeltez de 10.12.2.
SLENDERNESS_LIMIT_CAP = 40.0


def radius_of_gyration(ig, ag):
    """r = sqrt(Ig/Ag) (m). Para rectangular equivale a ~0.2887h (la norma
    permite 0.30h como aproximacion; aca se usa el valor exacto)."""
    if ag <= 0 or ig <= 0:
        return 0.0
    return math.sqrt(ig / ag)


def _m1_over_m2(m_end_a, m_end_b):
    """Relacion M1/M2 con signo: M1 = extremo de menor magnitud, M2 = mayor.
    Devuelve (ratio, m2_abs). ratio en [-1, 1]; 0 si ambos extremos son nulos."""
    if abs(m_end_a) <= abs(m_end_b):
        m1, m2 = m_end_a, m_end_b
    else:
        m1, m2 = m_end_b, m_end_a
    if m2 == 0:
        return 0.0, 0.0
    return m1 / m2, abs(m2)


def slenderness_limit_nonsway(m_end_a, m_end_b):
    """Limite de 10.12.2: 34 - 12*(M1/M2), topeado en 40. Por debajo de este
    valor de k*lu/r los efectos de esbeltez se pueden despreciar."""
    ratio, _ = _m1_over_m2(m_end_a, m_end_b)
    return min(SLENDERNESS_LIMIT_CAP, 34.0 - 12.0 * ratio)


def cm_factor(m_end_a, m_end_b):
    """Cm = 0.6 + 0.4*(M1/M2) >= 0.4 (E.060 10.12.3.1). Solo valido para
    elementos SIN cargas transversales entre apoyos; con ellas la norma pide
    Cm = 1.0 (el llamador debe forzarlo en ese caso)."""
    ratio, _ = _m1_over_m2(m_end_a, m_end_b)
    return max(CM_MIN, 0.6 + 0.4 * ratio)


def critical_load(ec, ig, lu, k=1.0, beta_d=0.0):
    """Pc = pi^2*EI/(k*lu)^2 con EI = 0.4*Ec*Ig/(1+Bd). Devuelve (Pc, EI) en
    (N, N*m^2). Bd se satura en [0, 1]."""
    if ec <= 0 or ig <= 0 or lu <= 0 or k <= 0:
        return 0.0, 0.0
    bd = min(1.0, max(0.0, beta_d))
    ei = EI_FACTOR * ec * ig / (1.0 + bd)
    pc = math.pi ** 2 * ei / (k * lu) ** 2
    return pc, ei


def magnify_nonsway(pu, m_end_a, m_end_b, ec, ig, ag, lu, k=1.0, beta_d=0.0,
                    has_transverse_load=False, h_dim=None):
    """
    Magnificacion de momentos en portico arriostrado.

    pu (N, COMPRESION POSITIVA — misma convencion que column_interaction),
    m_end_a/m_end_b (N*m): momentos del MISMO combo en los dos extremos del
    elemento, con signo del analisis. ec (Pa), ig (m^4), ag (m^2), lu (m,
    longitud NO arriostrada), k (factor de longitud efectiva), beta_d
    (fraccion sostenida de la carga axial factorada, 0..1).

    `h_dim` (m, opcional): peralte en la direccion de flexion, para la
    excentricidad minima de 10.12.3.2 (M2min = Pu*(0.015 + 0.03h)).

    Devuelve dict con cm, pc, ei, deltaNs, mc, m2, m2Min, slendernessRatio,
    slendernessLimit, isSlender, y `applied` (si se magnifico o no).

    Si la columna NO es esbelta segun 10.12.2, la norma permite despreciar el
    efecto: se devuelve deltaNs=1 y mc=M2 (`applied` False), pero igual se
    reporta el deltaNs que habria salido (`deltaNsRaw`) para poder auditarlo.
    """
    _, m2_abs = _m1_over_m2(m_end_a, m_end_b)

    # Excentricidad minima (10.12.3.2): el momento de diseno no baja de
    # Pu*(15mm + 0.03h). Solo aplica con Pu en compresion.
    m2_min = 0.0
    if h_dim and pu > 0:
        # 0.015 m = 15 mm, el valor que imprimen TANTO ACI 318 §6.6.4.5.4 en su
        # texto metrico COMO la E.060 Art. 10.12.3.2.
        #
        # NO cambiar a 0.01524 para "calzar con ETABS": ETABS reporta e_min =
        # 28.74 mm en una columna de h=450 (medido en su Column Element Details)
        # porque internamente trabaja en pulgadas y usa 0.6" = 15.24 mm. Es un
        # artefacto de conversion de unidades, no una regla de norma. La
        # diferencia contra nosotros es del 0.85% en el momento minimo.
        m2_min = pu * (0.015 + 0.03 * h_dim)
    m2_design = max(m2_abs, m2_min)

    r = radius_of_gyration(ig, ag)
    ratio_slender = (k * lu / r) if r > 0 else float("inf")
    limit = slenderness_limit_nonsway(m_end_a, m_end_b)
    is_slender = ratio_slender > limit

    cm = 1.0 if has_transverse_load else cm_factor(m_end_a, m_end_b)
    pc, ei = critical_load(ec, ig, lu, k=k, beta_d=beta_d)

    # dns = Cm/(1 - Pu/(0.75Pc)). Si Pu alcanza 0.75Pc la seccion es
    # inestable: no hay magnificador finito -> se marca con inf para que el
    # llamador lo reporte como "no verifica por esbeltez", en vez de devolver
    # un numero grande y arbitrario.
    denom = 1.0 - (pu / (0.75 * pc)) if pc > 0 else 0.0
    if pu <= 0:
        delta_raw = 1.0  # traccion: no hay efecto de 2do orden por pandeo
    elif denom <= 0:
        delta_raw = float("inf")
    else:
        delta_raw = max(1.0, cm / denom)

    applied = is_slender and math.isfinite(delta_raw)
    delta = delta_raw if applied else (delta_raw if not math.isfinite(delta_raw) else 1.0)
    mc = m2_design * delta if math.isfinite(delta) else float("inf")

    return {
        "cm": cm,
        "pc": pc,
        "ei": ei,
        "betaD": min(1.0, max(0.0, beta_d)),
        "k": k,
        "lu": lu,
        "r": r,
        "slendernessRatio": ratio_slender,
        "slendernessLimit": limit,
        "isSlender": is_slender,
        "deltaNsRaw": delta_raw,
        "deltaNs": delta,
        "m2": m2_abs,
        "m2Min": m2_min,
        "m2Design": m2_design,
        "mc": mc,
        "applied": applied,
        "unstable": not math.isfinite(delta_raw),
    }


def minimum_eccentricity_variants(m2_con_min, m2_sin_min, m3_con_min, m3_sin_min):
    """Variantes de demanda para el chequeo de EXCENTRICIDAD MINIMA.

    La excentricidad accidental que cubre el minimo de ACI 318 §6.6.4.5.4 /
    E.060 Art. 10.12.3.2 actua en UNA direccion, no simultaneamente en las dos.
    Aplicar el piso a los dos ejes a la vez inventa una demanda biaxial que no
    existe y sobrestima el momento resultante.

    Devuelve la lista de pares (M2, M3) a verificar; el llamador se queda con
    la de mayor ratio. Si el minimo no levanto ningun eje, las dos variantes
    coinciden y se devuelve una sola.

    Verificado contra el Column Element Details de ETABS (C7 Story1): con
    Minimum M2 = Minimum M3 = 1.3294 t-m, su diseno usa Mu2 = -1.3294 (el
    minimo) junto con Mu3 = -0.3831 (el factorado) — exactamente una de estas
    dos variantes, no el minimo en ambos.
    """
    variantes = [(m2_con_min, m3_sin_min), (m2_sin_min, m3_con_min)]
    if variantes[0] == variantes[1]:
        return variantes[:1]
    return variantes
