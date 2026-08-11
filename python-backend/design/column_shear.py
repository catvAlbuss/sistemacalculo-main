"""python-backend/design/column_shear.py

Corte por diseño de capacidad + confinamiento para columnas RECTANGULARES de
pórticos especiales (Sway Special / dúctiles), ACI 318 cap. 18.7.6 (corte) y
18.7.5 (confinamiento) — ver E.060 art. 21.4.5. Reutiliza el motor de fibra de
column_interaction.py (mismo método, mismas posiciones de varilla) para el
momento probable Mpr, en vez de duplicar la geometría/fibra acá.

Unidades: SI puro (m, Pa, N, N·m), igual que column_interaction.py.
"""

import math

from .column_interaction import capacity_at_demand

__all__ = ["probable_moment_uniaxial", "column_shear_design"]

PHI_SHEAR = 0.75  # ACI 318 §21.2.4.1 (corte en elementos de pórticos especiales)


def probable_moment_uniaxial(b, h, fc, fy, cover, bar_diameter, n3, n2, bar_area,
                              axis, target_p, beta1=None):
    """
    Momento probable Mpr (N·m) en flexión UNIAXIAL pura (axis="3" -> flexión
    sobre el eje 3, la que empareja con el corte V2; axis="2" -> sobre el eje
    2, empareja con V3 — misma convención V2↔M3/V3↔M2 ya validada en vigas,
    ver project_rc_design_v2_v3_convention).

    Mpr usa fy_probable=1.25·fy (ACI 318 §18.7.6.1.1 / E.060 21.4.5.1: el
    acero real rinde más que su valor nominal) y NO se reduce por φ (φ=1,
    resistencia nominal). Reutiliza capacity_at_demand (misma bisección sobre
    c) pasándole fy_probable — el `phi` que ese cálculo devuelve queda mal
    (usa eps_ty de fy_probable, no de fy real) pero no importa: acá solo se
    usa M2n/M3n crudo, nunca phi ni phiMn.
    """
    theta = 0.0 if axis == "3" else math.pi / 2.0
    pt = capacity_at_demand(
        b, h, fc, 1.25 * fy, cover, bar_diameter, n3, n2, bar_area,
        theta, target_p, beta1=beta1,
    )
    if pt is None:
        return 0.0
    return abs(pt["M3n"]) if axis == "3" else abs(pt["M2n"])


def _vc(fc, nu, ag, b, d):
    """Concreto: ACI 318 §22.5.6.1 (SI, con beneficio de compresión axial)."""
    fc_mpa = fc / 1e6
    ag_mm2 = ag * 1e6
    b_mm = b * 1000.0
    d_mm = d * 1000.0
    factor = 1.0 + nu / (14.0 * ag_mm2)
    vc_n = 0.17 * factor * math.sqrt(fc_mpa) * b_mm * d_mm
    return max(vc_n, 0.0)


def column_shear_design(
    b, h, fc, fy, cover, bar_diameter, n3, n2, bar_area,
    fyt, confine_bar_area, confine_bar_diameter, confine_bar_spacing,
    num_confine_bars2, num_confine_bars3,
    clear_height, axial_min, axial_max,
    vu_analysis2, vu_analysis3, beta1=None,
):
    """
    Chequeo de corte por capacidad + confinamiento para AMBAS direcciones (2 y
    3), contra el estribo REAL ya asignado en el .e2k (no diseña uno nuevo).

    `axial_min`/`axial_max` (N): rango de Pu factorado que le toca a esta
    columna (de todos los combos, ambas estaciones) — ACI 318 §18.7.6.1.1
    pide evaluar Mpr considerando el rango completo de Pu, no un solo punto.
    `vu_analysis2/3` (N): cortante factorado del análisis (piso de Ve, el
    código exige que Ve no sea menor que este valor).

    Simplificación explícita (documentada, no silenciosa): no se aplica el
    tope de "Mpr no debe exceder lo que las vigas del nudo pueden entregar"
    (ACI 18.7.6.1.1 in fine) — eso requeriría modelar el equilibrio del nudo
    completo. Omitirlo es conservador (Ve solo puede quedar igual o más alto
    de lo estrictamente necesario, nunca más bajo).
    """
    ag = b * h
    pu_check = axial_min  # el peor caso para Vc (menos compresión = menos beneficio)

    def side(axis, vu_analysis, num_confine_legs, d):
        mpr_lo = probable_moment_uniaxial(b, h, fc, fy, cover, bar_diameter, n3, n2, bar_area, axis, axial_min, beta1)
        mpr_hi = probable_moment_uniaxial(b, h, fc, fy, cover, bar_diameter, n3, n2, bar_area, axis, axial_max, beta1)
        mpr = max(mpr_lo, mpr_hi)
        ve_capacity = 2.0 * mpr / clear_height if clear_height > 0 else 0.0
        ve = max(ve_capacity, vu_analysis)

        # ACI 318 §18.7.6.2.1: Vc=0 si la columna está poco comprimida Y el
        # sismo (vía Ve por capacidad) domina el corte total.
        vc_zero = (pu_check < ag * fc / 20.0) and (ve_capacity >= 0.5 * ve)
        vc = 0.0 if vc_zero else _vc(fc, pu_check, ag, b if axis == "2" else h, d)

        vs_required = max(0.0, ve / PHI_SHEAR - vc)

        av_provided = confine_bar_area * max(num_confine_legs, 0)
        vs_provided = (av_provided * fyt * d / confine_bar_spacing) if confine_bar_spacing > 0 else 0.0
        vn_provided = vc + vs_provided
        ratio = (ve / PHI_SHEAR) / vn_provided if vn_provided > 0 else float("inf")

        return {
            "mpr": mpr,
            "veCapacity": ve_capacity,
            "veAnalysis": vu_analysis,
            "ve": ve,
            "vcZero": vc_zero,
            "vc": vc,
            "vsRequired": vs_required,
            "avProvided": av_provided,
            "vsProvided": vs_provided,
            "vnProvided": vn_provided,
            "ratio": ratio,
            "status": "OK" if ratio <= 1 else "NG",
        }

    d3 = max(h - cover - confine_bar_diameter - bar_diameter / 2.0, 0.01)  # eje 3 -> V2
    d2 = max(b - cover - confine_bar_diameter - bar_diameter / 2.0, 0.01)  # eje 2 -> V3

    shear_v2 = side("3", vu_analysis2, num_confine_bars3, d3)
    shear_v3 = side("2", vu_analysis3, num_confine_bars2, d2)

    # ── Confinamiento (ductilidad, ACI 318 §18.7.5 / E.060 21.4.4) ──
    # Longitud de confinamiento Lo desde cada nudo.
    lo = max(h, clear_height / 6.0 if clear_height > 0 else 0.0, 0.45)

    # Espaciamiento máximo dentro de Lo.
    hx = min(b, h) - 2.0 * cover  # separación horizontal máx. entre ramas (aprox., sin trazado real de ramas)
    so_eq = 0.10 + (0.35 - hx) / 3.0 if hx > 0 else 0.10
    so_max = min(max(so_eq, 0.10), 0.15, 6.0 * bar_diameter, min(b, h) / 4.0)

    # Núcleo confinado (centro a centro del estribo) y Ash/s requerida —
    # ACI Eq. 18.7.5.4 (SI): mayor entre las dos expresiones, por dirección.
    bc2 = max(b - 2.0 * cover, 0.01)
    bc3 = max(h - 2.0 * cover, 0.01)
    ach = bc2 * bc3
    ag_ach_term = max(ag / ach - 1.0, 0.0)

    def ash_over_s_required(bc):
        eq1 = 0.3 * bc * fc / fyt * ag_ach_term
        eq2 = 0.09 * bc * fc / fyt
        return max(eq1, eq2)

    ash_s_req2 = ash_over_s_required(bc3)  # ramas en dir. 2 -> núcleo bc3
    ash_s_req3 = ash_over_s_required(bc2)  # ramas en dir. 3 -> núcleo bc2

    ash_s_prov2 = (confine_bar_area * num_confine_bars2 / confine_bar_spacing) if confine_bar_spacing > 0 else 0.0
    ash_s_prov3 = (confine_bar_area * num_confine_bars3 / confine_bar_spacing) if confine_bar_spacing > 0 else 0.0

    confinement = {
        "lo": lo,
        "soMax": so_max,
        "spacingProvided": confine_bar_spacing,
        "spacingStatus": "OK" if 0 < confine_bar_spacing <= so_max else "NG",
        "ashOverSReq2": ash_s_req2,
        "ashOverSProv2": ash_s_prov2,
        "ashStatus2": "OK" if ash_s_prov2 >= ash_s_req2 else "NG",
        "ashOverSReq3": ash_s_req3,
        "ashOverSProv3": ash_s_prov3,
        "ashStatus3": "OK" if ash_s_prov3 >= ash_s_req3 else "NG",
    }

    return {"shearV2": shear_v2, "shearV3": shear_v3, "confinement": confinement}
