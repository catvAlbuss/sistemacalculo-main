# -*- coding: utf-8 -*-
"""
Diseño por CORTANTE de placas (muros estructurales).

ACI 318-14 §18.10.4 y su equivalente E.060 Art. 21.9. Era el hueco grande del
módulo: la sección, la superficie P-M-M y el ratio D/C ya estaban (y validados
contra las tablas reales de ETABS), pero el corte no se calculaba.

    Vn = Acv · (αc · λ · √f'c + ρt · fy)

UNIDADES: SI en todo el paquete — fuerzas en N, longitudes en m, tensiones en
Pa. Es la convención del resto de `design/` (ver `beta1_from_fc`, que divide
entre 1e6 para trabajar en MPa).

LOS DOS REGLAMENTOS DICEN LO MISMO. La E.060 tabula αc en kg/cm² (0.80 y 0.53)
y el ACI en MPa (0.25 y 0.17). El factor de conversión es
√(1/0.0980665)·9.80665/100 = 0.31316, de modo que:

    E.060 0.80  →  0.2505  (ACI 0.25,  +0.2 %)
    E.060 0.53  →  0.1660  (ACI 0.17,  −2.4 %)

O sea la diferencia entre normas NO está en la resistencia sino en φ: 0.85 en
la E.060 contra 0.75 en el ACI (ver `phi_shear_for_code`). Se dejan los
coeficientes de cada norma tal como los tabula, en vez de unificarlos, para que
el resultado sea trazable al artículo que el proyectista va a citar.
"""
import math

from .column_interaction import (
    DEFAULT_DESIGN_CODE,
    normalize_design_code,
    phi_shear_for_code,
)

__all__ = [
    "alpha_c",
    "resistencia_cortante",
    "verificar_cortante",
    "CUANTIA_MINIMA",
]

# ACI 318-14 §18.10.2.1 / E.060 21.9.3: cuantía mínima horizontal y vertical
# cuando el cortante supera el umbral de `_UMBRAL_CUANTIA`.
CUANTIA_MINIMA = 0.0025

# Coeficientes de cada norma, en SUS propias unidades, y el factor que las une.
_KGF_A_SI = math.sqrt(1 / 0.0980665) * 9.80665 / 100  # 0.31316
_ALPHA = {
    "ACI318": (0.25, 0.17),                              # MPa, §18.10.4.1
    "E060": (0.80 * _KGF_A_SI, 0.53 * _KGF_A_SI),        # kg/cm² → MPa, 21.9.5
}

# §18.10.4.4: topes sobre Vn. El primero aplica a un segmento vertical aislado;
# el segundo al conjunto de placas que resisten una misma fuerza lateral.
_TOPE_SEGMENTO = 0.83
_TOPE_CONJUNTO = 0.66

# §18.10.2.1: por debajo de este cortante no se exige la cuantía mínima de 0.0025.
_UMBRAL_CUANTIA = 0.083


def alpha_c(hw_lw, code=DEFAULT_DESIGN_CODE):
    """
    Coeficiente αc en función de la esbeltez hw/lw.

    Vale el máximo para hw/lw ≤ 1.5, el mínimo para hw/lw ≥ 2.0, y varía
    linealmente entre ambos. `hw_lw` debe ser el MAYOR entre la relación del
    muro completo y la del segmento considerado (§18.10.4.1) — quien llama es
    responsable de esa elección, porque acá no se conoce el muro entero.
    """
    alto, bajo = _ALPHA[normalize_design_code(code)]
    r = float(hw_lw or 0.0)
    if r <= 1.5:
        return alto
    if r >= 2.0:
        return bajo
    return alto + (bajo - alto) * (r - 1.5) / 0.5


def resistencia_cortante(*, acv, fc, rho_t, fy, hw_lw,
                         code=DEFAULT_DESIGN_CODE, lam=1.0):
    """
    Vn y φVn de un segmento de placa.

    `acv` es el área de corte en m² (espesor del alma × longitud en la
    dirección del cortante); `fc` y `fy` en Pa; `rho_t` es la cuantía de
    refuerzo TRANSVERSAL a la dirección del cortante (horizontal para el
    cortante en el plano); `lam` es λ por concreto liviano.

    Devuelve el detalle completo para poder rastrear qué gobernó.
    """
    acv = max(float(acv or 0.0), 0.0)
    fc_mpa = max(float(fc or 0.0), 0.0) / 1e6
    fy_mpa = max(float(fy or 0.0), 0.0) / 1e6
    rho_t = max(float(rho_t or 0.0), 0.0)
    raiz = math.sqrt(fc_mpa)

    a = alpha_c(hw_lw, code)
    aporte_concreto = a * float(lam) * raiz          # MPa
    aporte_acero = rho_t * fy_mpa                     # MPa
    vn = (aporte_concreto + aporte_acero) * 1e6 * acv  # N

    tope = _TOPE_SEGMENTO * raiz * 1e6 * acv
    limitado = vn > tope
    if limitado:
        vn = tope

    phi = phi_shear_for_code(code)
    return {
        "code": normalize_design_code(code),
        "alpha_c": a,
        "acv": acv,
        "Vc": aporte_concreto * 1e6 * acv,
        "Vs": aporte_acero * 1e6 * acv,
        "Vn": vn,
        "phi": phi,
        "phiVn": phi * vn,
        "tope_segmento": tope,
        "gobierna_el_tope": limitado,
    }


def verificar_cortante(*, vu, acv, fc, rho_t, fy, hw_lw,
                       rho_l=None, code=DEFAULT_DESIGN_CODE, lam=1.0):
    """
    Verificación completa: resistencia, ratio de demanda y cuantías mínimas.

    `vu` es el cortante último en N. `rho_l` (cuantía longitudinal) es opcional
    y solo se usa para reportar si cumple el mínimo; no entra en Vn.
    """
    r = resistencia_cortante(acv=acv, fc=fc, rho_t=rho_t, fy=fy,
                             hw_lw=hw_lw, code=code, lam=lam)
    vu = abs(float(vu or 0.0))
    phivn = r["phiVn"]

    # §18.10.2.1: la cuantía mínima de 0.0025 solo se exige por encima de este
    # cortante; por debajo rige el mínimo de muros no sísmicos.
    umbral = _UMBRAL_CUANTIA * float(lam) * math.sqrt(max(float(fc or 0), 0) / 1e6) * 1e6 * r["acv"]
    exige_minima = vu > umbral

    r.update({
        "Vu": vu,
        "ratio": (vu / phivn) if phivn > 0 else float("inf"),
        "cumple": phivn >= vu,
        "umbral_cuantia_minima": umbral,
        "exige_cuantia_minima": exige_minima,
        "rho_t": max(float(rho_t or 0.0), 0.0),
        "rho_l": None if rho_l is None else max(float(rho_l), 0.0),
        "cumple_rho_t": (not exige_minima) or max(float(rho_t or 0.0), 0.0) >= CUANTIA_MINIMA,
        "cumple_rho_l": (rho_l is None) or (not exige_minima) or float(rho_l) >= CUANTIA_MINIMA,
    })
    return r


def tope_del_conjunto(acv_total, fc):
    """
    §18.10.4.4: ΣVn de todas las placas que comparten una misma fuerza lateral
    no puede pasar de 0.66·√f'c·ΣAcv. Se expone aparte porque es una
    verificación de CONJUNTO: no se puede resolver mirando un muro solo.
    """
    raiz = math.sqrt(max(float(fc or 0.0), 0.0) / 1e6)
    return _TOPE_CONJUNTO * raiz * 1e6 * max(float(acv_total or 0.0), 0.0)
