"""python-backend/design/column_shear.py

Corte por diseño de capacidad + confinamiento para columnas RECTANGULARES de
pórticos especiales (Sway Special / dúctiles), ACI 318 cap. 18.7.6 (corte) y
18.7.5 (confinamiento) — ver E.060 art. 21.4.5. Reutiliza el motor de fibra de
column_interaction.py (mismo método, mismas posiciones de varilla) para el
momento probable Mpr, en vez de duplicar la geometría/fibra acá.

Unidades: SI puro (m, Pa, N, N·m), igual que column_interaction.py.
"""

import math

from .column_circular import (
    core_area_circular,
    gross_area_circular,
    shear_depth_circular,
    spiral_rho_s_provided,
    spiral_rho_s_required,
    spiral_spacing_for_rho,
)

from .column_interaction import DEFAULT_DESIGN_CODE, capacity_at_demand, phi_shear_for_code

__all__ = ["probable_moment_uniaxial", "column_shear_design"]

# φ de cortante — depende del CÓDIGO: E.060 Art. 10.3.2-4 usa 0.85 (con o sin
# torsión); ACI 318 §21.2.4.1 usa 0.75 en pórticos especiales. Se resuelve por
# `code` (ver column_interaction.phi_shear_for_code), no con una constante fija.
PHI_SHEAR = 0.75  # solo compatibilidad hacia atrás — usar phi_shear_for_code()


def probable_moment_uniaxial(b, h, fc, fy, cover, bar_diameter, n3, n2, bar_area,
                              axis, target_p, beta1=None,
                              shape="rect", diameter=None, num_bars=None,
                              confine_bar_diameter=0.0, code=DEFAULT_DESIGN_CODE):
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
        shape=shape, diameter=diameter, num_bars=num_bars,
        # SIN estos dos el Mpr salia ALTO. `cover` es el recubrimiento LIBRE
        # hasta la superficie del estribo/espiral: si no se resta su diametro,
        # las varillas quedan un diametro mas afuera y el brazo de palanca se
        # infla. Medido en la C60 circular a Nu=67.8 t: 66.03 en vez de 64.02
        # (+3.1%), y el Ve de capacidad se va con el.
        # `code` decide el Es del acero, que mueve otro 0.65%.
        confine_bar_diameter=confine_bar_diameter,
        code=code,
    )
    if pt is None:
        return 0.0
    return abs(pt["M3n"]) if axis == "3" else abs(pt["M2n"])


def _vc(fc, nu, ag, b, d, formula="aci"):
    """
    Aporte del concreto, con beneficio de compresión axial.

      "aci"   ACI 318 §22.5.6.1:  0.17·(1 + Nu/(14·Ag))·√f'c·bw·d   [SI, MPa]
      "e060"  E.060 §11.3.1.2:    0.53·(1 + Nu/(140·Ag))·√f'c·bw·d  [kg/cm²]

    No son el mismo número: con f'c = 210 y Nu = 0, ACI da 7.87 kg/cm² y E.060
    7.68 — un 2.4 % de diferencia, que se suma a la del término axial (14 MPa
    ≈ 142.8 kg/cm², no 140).
    """
    if str(formula).lower() == "e060":
        # Todo en kg/cm², que es como está escrita la norma peruana.
        fc_kg = fc / 98066.5
        ag_cm2 = ag * 1e4
        nu_kg = nu / 9.80665
        b_cm = b * 100.0
        d_cm = d * 100.0
        vc_kg = 0.53 * math.sqrt(fc_kg) * (1.0 + nu_kg / (140.0 * ag_cm2)) * b_cm * d_cm
        return max(vc_kg * 9.80665, 0.0)  # kg -> N

    fc_mpa = fc / 1e6
    ag_mm2 = ag * 1e6
    b_mm = b * 1000.0
    d_mm = d * 1000.0
    factor = 1.0 + nu / (14.0 * ag_mm2)
    vc_n = 0.17 * factor * math.sqrt(fc_mpa) * b_mm * d_mm
    return max(vc_n, 0.0)


# ── CONVENCIONES SELECCIONABLES ──────────────────────────────────────────────
# Tres puntos donde la plantilla Excel de referencia del cliente ("Colum TIPO
# II") usa un criterio distinto al de la norma. Se pueden elegir para poder
# cruzar resultados con ella al digito; el default es SIEMPRE el de norma.
#
# Las formulas del Excel estan IDENTIFICADAS (reconstruidas al 0.045% contra dos
# diametros, 60 y 80 cm), no supuestas. Y se midio hacia que lado va cada una,
# porque no es simetrico:
#
#   core     "aci"   Dc = D - 2*rec   ACI 318 25.7.3 / E.060: al borde EXTERIOR
#                                     del refuerzo transversal.
#            "excel" Dc = D - 1*rec   Exige 19.5% MENOS confinamiento (D=60).
#
#   vc_area  "aci"   bw*d = D*0.80D   ACI 318 22.5.2.2 para secciones circulares.
#            "excel" Ach              Da 15.9% menos Vc -> pide MAS estribo.
#
#   vmax_d   "aci"   d = 0.80*D       idem 22.5.2.2.
#            "excel" d = D - 6 cm     Permite 12.5% MAS cortante antes de exigir
#                                     mas seccion.
#
# Solo tienen efecto en secciones CIRCULARES.
CONVENCIONES_DEFAULT = {"core": "aci", "vc_area": "aci", "vmax_d": "aci",
                        "vc_formula": "aci"}


def _nucleo_circular(diameter, cover, confine_bar_diameter, convencion):
    """
    (Ach, Dc) del nucleo confinado segun la convencion elegida.

      "aci"    Dc = D - 2*cover          ACI 318 25.7.3: al borde EXTERIOR del
                                         refuerzo transversal. `cover` es el
                                         recubrimiento LIBRE, que es justo lo
                                         que exporta ETABS.
      "excel"  Dc = D - (cover + de/2)   La plantilla usa `D - Y6` con Y6 medido
                                         al EJE de la espiral. Traducido a
                                         nuestras entradas es el recubrimiento
                                         libre mas medio diametro de espiral.
                                         Con D=60, cover=4, de=0.9506 -> 55.525,
                                         que es el numero de la planilla.
    """
    import math as _m
    if str(convencion).lower() == "excel":
        dc = max(diameter - (cover + confine_bar_diameter / 2.0), 0.0)
    else:
        dc = max(diameter - 2.0 * cover, 0.0)
    return _m.pi * dc * dc / 4.0, dc


def _conv(conventions, clave):
    """Lee una convencion, cayendo al default de norma si no viene o es rara."""
    v = str((conventions or {}).get(clave, "") or "").strip().lower()
    if clave == "vc_formula":
        return "e060" if v == "e060" else "aci"
    return "excel" if v == "excel" else CONVENCIONES_DEFAULT[clave]


def column_shear_design(
    b, h, fc, fy, cover, bar_diameter, n3, n2, bar_area,
    fyt, confine_bar_area, confine_bar_diameter, confine_bar_spacing,
    num_confine_bars2, num_confine_bars3,
    clear_height, axial_min, axial_max,
    vu_analysis2, vu_analysis3, beta1=None, code=DEFAULT_DESIGN_CODE,
    joint_beam_moment=None,
    shape="rect", diameter=None, num_long_bars=None,
    conventions=None,
):
    """
    Chequeo de corte por capacidad + confinamiento para AMBAS direcciones (2 y
    3), contra el estribo REAL ya asignado en el .e2k (no diseña uno nuevo).

    `axial_min`/`axial_max` (N): rango de Pu factorado que le toca a esta
    columna (de todos los combos, ambas estaciones) — ACI 318 §18.7.6.1.1
    pide evaluar Mpr considerando el rango completo de Pu, no un solo punto.
    `vu_analysis2/3` (N): cortante factorado del análisis (piso de Ve, el
    código exige que Ve no sea menor que este valor).

    `joint_beam_moment` (opcional): tope por resistencia de las VIGAS
    (ACI 318 §18.7.6.1.1 in fine — "the column shears need not exceed those
    calculated from joint strengths based on Mpr of the beams framing into
    the joint"). Forma:

        {"2": {"top": M_Nm, "bot": M_Nm}, "3": {...}}

    donde cada M es el momento (N·m) que las vigas del nudo le pueden
    entregar A ESTA COLUMNA — ya repartido entre la columna de arriba y la
    de abajo por el llamador, que es quien conoce la topología del nudo.
    `None` (o una dirección ausente) = sin dato → NO se aplica el tope y Ve
    queda gobernado por el Mpr de la propia columna, que es el lado
    conservador.

    POR QUE IMPORTA: una columna suele ser mucho más fuerte que las vigas que
    llegan a ella, así que el momento que realmente puede desarrollarse en el
    nudo lo limitan las VIGAS. Sin este tope, Ve sale del orden de 2-3x lo que
    reporta ETABS (medido contra un modelo real, 2026-08-18: Ve nuestro 26.0 t
    contra 9.75 t de ETABS en la misma columna) y obliga a poner mucho más
    estribo del necesario.
    """
    # FORMA. Circular = espiral: cambia Ag, el `d` de corte, las ramas que
    # cruzan la fisura y TODO el bloque de confinamiento (rho_s en vez de Ash).
    es_circular = str(shape or "rect").lower().startswith("circ")
    conv_core = _conv(conventions, "core")
    conv_vc_area = _conv(conventions, "vc_area")
    conv_vmax_d = _conv(conventions, "vmax_d")
    conv_vc_formula = _conv(conventions, "vc_formula")
    dia = float(diameter or 0.0)

    ag = gross_area_circular(dia) if es_circular else b * h
    pu_check = axial_min  # el peor caso para Vc (menos compresión = menos beneficio)
    phi_shear = phi_shear_for_code(code)

    def side(axis, vu_analysis, num_confine_legs, d):
        kw_forma = {"shape": shape, "diameter": diameter, "num_bars": num_long_bars,
                    "confine_bar_diameter": confine_bar_diameter, "code": code}
        mpr_lo = probable_moment_uniaxial(b, h, fc, fy, cover, bar_diameter, n3, n2, bar_area,
                                          axis, axial_min, beta1, **kw_forma)
        mpr_hi = probable_moment_uniaxial(b, h, fc, fy, cover, bar_diameter, n3, n2, bar_area,
                                          axis, axial_max, beta1, **kw_forma)
        mpr = max(mpr_lo, mpr_hi)
        ve_column = 2.0 * mpr / clear_height if clear_height > 0 else 0.0

        # Tope por las vigas del nudo (ACI 318 §18.7.6.1.1 in fine): el nudo
        # no puede transmitir más momento del que sus vigas desarrollan.
        #
        # UN EXTREMO SIN VIGAS APORTA 0, no el Mpr de la columna. El caso es la
        # BASE de la columna del primer piso, empotrada en la cimentación. El
        # texto de ACI, leído al pie de la letra, diría que ahí no hay nada que
        # limite el nudo y la columna desarrolla su Mpr; ETABS pone cero, y eso
        # es lo que se adoptó (decisión del usuario, 2026-08-18).
        #
        # EVIDENCIA de que ETABS pone cero: en el modelo de referencia los Ve
        # salen exactamente cuantizados por número de vigas — 4.873 t con una
        # viga y 9.7461 t con dos, relación 2.0000. Si la base aportara un
        # término constante esa relación no sería exacta.
        #
        # Cada extremo se acota además por `mpr`: las vigas no pueden exigirle
        # a la columna más momento del que la columna puede dar.
        #
        # OJO con la magnitud: ETABS usa el momento NOMINAL de la viga (Mn, con
        # fy) y acá se usa el PROBABLE (Mpr, con 1.25·fy) porque es lo que dice
        # el texto de la norma. Consecuencia esperada y conocida: nuestro Ve
        # sale exactamente 1.25x el de ETABS. No es un error de calibración.
        ve_beams = None
        beams = (joint_beam_moment or {}).get(axis) if joint_beam_moment else None
        if isinstance(beams, dict) and clear_height > 0:
            m_top = beams.get("top")
            m_bot = beams.get("bot")
            if m_top or m_bot:  # al menos un extremo con dato utilizable
                mt = min(float(m_top), mpr) if m_top else 0.0
                mb = min(float(m_bot), mpr) if m_bot else 0.0
                ve_beams = (mt + mb) / clear_height

        ve_capacity = ve_column if ve_beams is None else min(ve_column, ve_beams)

        # El piso del análisis SIEMPRE manda: la norma permite bajar Ve hasta
        # lo que dan las vigas, nunca por debajo del corte factorado real.
        ve = max(ve_capacity, vu_analysis)

        # ACI 318 §18.7.6.2.1: Vc=0 si la columna está poco comprimida Y el
        # sismo (vía Ve por capacidad) domina el corte total.
        vc_zero = (pu_check < ag * fc / 20.0) and (ve_capacity >= 0.5 * ve)
        # `bw` para Vc: el diametro en circular (ACI 318 22.5.2.2), el lado
        # perpendicular a la flexion en rectangular.
        bw = dia if es_circular else (b if axis == "2" else h)
        # Area de corte. Con la convencion del Excel el producto bw*d se
        # reemplaza por el area del NUCLEO, asi que se pasa (Ach, 1.0) para que
        # `_vc` multiplique por el area correcta sin cambiar su formula.
        if es_circular and conv_vc_area == "excel":
            ach_vc, _dc_vc = _nucleo_circular(dia, cover, confine_bar_diameter, conv_core)
            vc = 0.0 if vc_zero else _vc(fc, pu_check, ag, ach_vc, 1.0, conv_vc_formula)
        else:
            vc = 0.0 if vc_zero else _vc(fc, pu_check, ag, bw, d, conv_vc_formula)

        # TOPE DE LA SECCION. ACI 318 22.5.1.2 limita Vs a 0.66*raiz(f'c)*bw*d;
        # E.060 11.5.7.9 pide 2.1*raiz(f'c)*bw*d en kg/cm2, que es el mismo
        # numero (30.5 vs 30.4 kg/cm2 con f'c = 210). Pasado ese tope NO hay
        # estribo que alcance: hay que agrandar la seccion. Es un chequeo
        # distinto del de cuantia, y faltaba.
        # `d` del tope: 0.80 D por norma, D - 6 cm con la convencion del Excel.
        d_tope = (dia - 0.06) if (es_circular and conv_vmax_d == "excel") else d
        vs_max = 0.66 * math.sqrt(fc / 1e6) * 1e6 * bw * d_tope

        vs_required = max(0.0, ve / phi_shear - vc)

        av_provided = confine_bar_area * max(num_confine_legs, 0)
        vs_provided = (av_provided * fyt * d / confine_bar_spacing) if confine_bar_spacing > 0 else 0.0
        vn_provided = vc + vs_provided
        ratio = (ve / phi_shear) / vn_provided if vn_provided > 0 else float("inf")

        return {
            "mpr": mpr,
            "vsMax": vs_max,
            "vuMax": phi_shear * (vc + vs_max),
            "sectionStatus": "OK" if vs_required <= vs_max else "SECCION INSUFICIENTE",
            # Ve solo por Mpr de la COLUMNA (sin tope), para poder auditar.
            "veColumn": ve_column,
            # Ve por Mpr de las VIGAS del nudo; None si no llegó el dato.
            "veBeams": ve_beams,
            "beamCapApplied": ve_beams is not None and ve_beams < ve_column,
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

    if es_circular:
        # Seccion simetrica: mismo `d` en las dos direcciones (ACI 22.5.2.2
        # permite d = 0.80 D) y la espiral corta la fisura con DOS ramas.
        _bw, d_circ = shear_depth_circular(dia)
        d3 = d2 = d_circ
        ramas2 = ramas3 = 2
    else:
        d3 = max(h - cover - confine_bar_diameter - bar_diameter / 2.0, 0.01)  # eje 3 -> V2
        d2 = max(b - cover - confine_bar_diameter - bar_diameter / 2.0, 0.01)  # eje 2 -> V3
        ramas2, ramas3 = num_confine_bars2, num_confine_bars3

    shear_v2 = side("3", vu_analysis2, ramas3, d3)
    shear_v3 = side("2", vu_analysis3, ramas2, d2)

    # ── Confinamiento (ductilidad, ACI 318 §18.7.5 / E.060 21.4.4) ──
    if es_circular:
        # ESPIRAL: la cuantia es VOLUMETRICA (rho_s), no un area por rama.
        # `core_area_circular` usa D - 2*rec (la norma). Para la convencion del
        # Excel (D - 1*rec) se le pasa medio recubrimiento, que da lo mismo sin
        # duplicar la formula.
        ach_c, dc_c = _nucleo_circular(dia, cover, confine_bar_diameter, conv_core)
        rho_req, rho_1, rho_2 = spiral_rho_s_required(fc, fyt, ag, ach_c)
        rho_prov = spiral_rho_s_provided(
            confine_bar_area, confine_bar_diameter, dc_c, confine_bar_spacing)
        s_por_rho = spiral_spacing_for_rho(
            rho_req, dc_c, confine_bar_area, confine_bar_diameter)

        # ACI 318 25.7.3.1: separacion LIBRE entre vueltas de 25 a 75 mm, o sea
        # el paso no puede pasar de 75 mm + el diametro de la espiral.
        s_max_libre = 0.075 + confine_bar_diameter
        s_max = min(x for x in (s_por_rho, s_max_libre) if x > 0)

        confinement = {
            "tipo": "espiral",
            "lo": max(dia, clear_height / 6.0 if clear_height > 0 else 0.0, 0.45),
            "coreDiameter": dc_c,
            "coreArea": ach_c,
            "rhoSRequired": rho_req,
            "rhoSEq1": rho_1,
            "rhoSEq2": rho_2,
            "gobierna": "0.45(Ag/Ach-1)f'c/fyt" if rho_1 >= rho_2 else "0.12 f'c/fyt",
            "rhoSProvided": rho_prov,
            "spacingForRho": s_por_rho,
            "spacingMaxClear": s_max_libre,
            "soMax": s_max,
            "spacingProvided": confine_bar_spacing,
            "spacingStatus": "OK" if 0 < confine_bar_spacing <= s_max else "NG",
            "rhoStatus": "OK" if rho_prov >= rho_req else "NG",
        }
        confinement["convenciones"] = {
            "core": conv_core, "vcArea": conv_vc_area, "vmaxD": conv_vmax_d,
            "vcFormula": conv_vc_formula,
        }
        return {"shearV2": shear_v2, "shearV3": shear_v3, "confinement": confinement,
                "conventions": {"core": conv_core, "vcArea": conv_vc_area,
                                "vmaxD": conv_vmax_d,
                                "vcFormula": conv_vc_formula}}

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
