"""seismic.pipeline — orquestador run_full_seismic_analysis."""

import io
import traceback
import numpy as np

try:
    import openseespywin.opensees as ops
except ImportError:
    try:
        import openseespy.opensees as ops
    except ImportError:
        ops = None

from .utils import *  # noqa: F401,F403
from .inputs import *  # noqa: F401,F403
from .solver import *  # noqa: F401,F403
from .report import *  # noqa: F401,F403

__all__ = [
    "run_full_seismic_analysis",
]


def run_full_seismic_analysis(data: dict) -> dict:
    """
    Análisis sísmico completo:
      1. Análisis estático con cargas de gravedad
      2. Análisis modal
      3. RSA en X y en Y (si el espectro lo permite)
      4. Envolvente: máximo entre carga estática y combinación sísmica

    data keys adicionales a build_model_3d:
      spectrum_x      : [(T, Sa)]  espectro dirección X
      spectrum_y      : [(T, Sa)]  espectro dirección Y (opcional, usa X si falta)
      num_modes       : int (default=min(6, nodos*2))
      combination     : 'SRSS' o 'CQC' (default='CQC')
      damping_ratio   : float (default=0.05)
      sa_in_g         : bool (default=True)
      g               : float (default=9.81)
    """
    spectrum_x = data.get("spectrum_x", [])
    spectrum_y = data.get("spectrum_y", spectrum_x)  # si no se da Y, usar X
    num_modes = int(data.get("num_modes", 6))
    combination = data.get("combination", "CQC")
    damping = float(data.get("damping_ratio", 0.05))
    sa_in_g = bool(data.get("sa_in_g", True))
    g = float(data.get("g", 9.81))

    results = {"success": True}

    # ── Paso 1: estático ────────────────────────────────────
    try:
        static_res = run_static_analysis(data)
        results["static"] = static_res
    except Exception as e:
        results["static"] = {"success": False, "error": str(e)}

    # ── Paso 1b: estático separado muerta/viva (para /zapatas2) ──
    # run_static_analysis combina todas las cargas en un solo análisis; el
    # cálculo de zapatas necesita pd (muerta) y pl (viva) como filas
    # independientes en sus combinaciones de diseño.
    try:
        results["static_dead"] = run_static_analysis_by_type(data, {"Dead"})
    except Exception as e:
        results["static_dead"] = {"success": False, "error": str(e)}

    try:
        results["static_live"] = run_static_analysis_by_type(data, {"Live", "RoofLive"})
    except Exception as e:
        results["static_live"] = {"success": False, "error": str(e)}

    # ── Construir modelo para modal (necesita masas) ─────────
    nodes, elements = build_model_3d(data)

    results["model_constraints"] = {
        "rigid_diaphragms": data.get("_rigid_diaphragm_report", {}),
        "mass_source": data.get("_mass_source_report", {}),
        "effective_mass": data.get("_effective_mass_report", {}),
    }

    results["mass_source"] = data.get("_mass_source_report", {})
    results["effective_mass"] = data.get("_effective_mass_report", {})
    # ── B10.1: auditoría física del modelo ─────────────────
    results["model_quality"] = _b10_build_model_quality_report(data, results)

    # ── Paso 2: análisis modal ───────────────────────────────
    n_nodes = len(nodes)
    num_modes = min(num_modes, max(1, n_nodes * 2))
    # No pedir más modos que GDL dinámicos con masa (evita modos degenerados
    # con T≈1e-8 s sobre las masas rotacionales placeholder).
    num_modes = min(num_modes, _max_dynamic_modes(data, nodes))
    modal_data = run_modal_analysis(nodes, num_modes)
    results["modal"] = {
        "modes": modal_data["modal_info"],
        "num_modes_requested": modal_data.get("num_modes_requested", num_modes),
        "num_modes_effective": len(modal_data["modal_info"]),
        "degenerate_modes_dropped": modal_data.get("degenerate_modes_dropped", 0),
    }

    # ── Paso 3 & 4: RSA en X y Y ───────────────────────────
    seismic = {}
    if spectrum_x:
        rsa_x = run_rsa(
            modal_data,
            spectrum_x,
            direction="x",
            combination=combination,
            damping_ratio=damping,
            sa_in_g=sa_in_g,
            g=g,
        )
        seismic["x"] = rsa_x

    if spectrum_y:
        rsa_y = run_rsa(
            modal_data,
            spectrum_y,
            direction="y",
            combination=combination,
            damping_ratio=damping,
            sa_in_g=sa_in_g,
            g=g,
        )
        seismic["y"] = rsa_y

    results["seismic"] = seismic

    # ── Torsión accidental E.030 (opt-in) ────────────────────────────────────
    # Solo si el usuario la habilita (accidentalEccentricity > 0). Aislada: no
    # toca la RSA base. Solo aporta si el modelo tiene diafragmas que rotan
    # (rigidDiaphragm_z). Métodos, seleccionables por payload
    # `accidentalTorsionMethod` ("additive" default | "both" | "cm"):
    #  - "additive" (default): torque estático por modo
    #    (run_accidental_torsion_rsa) — M=e·F_piso sobre los modos SIN
    #    excentricidad; se SUMA a la base. Es el esquema interno de ETABS para
    #    casos RS: validado a ±3% vs ETABS con diafragma+ecc en modelo
    #    simétrico e irregular (2026-07-16). Nunca se cancela.
    #  - "cm": CM±e + re-eigen (run_shifted_cm_torsion_rsa) — redistribuye la
    #    masa del diafragma ±e y re-corre el modal; ENVOLVENTE con la base.
    #    Punto ciego: cancelación CQC cuando el modo traslacional y el torsional
    #    tienen frecuencias cercanas (validado vs ETABS: +0% donde ETABS +22%).
    #  - "both": corre ambos y la deriva final es el MÁXIMO — envolvente
    #    conservadora (+5-10% sobre ETABS en plantas irregulares).
    ecc_ratio = float(
        data.get("accidentalEccentricity", data.get("accidental_eccentricity", 0.0)) or 0.0
    )
    ecc_method = str(
        data.get("accidentalTorsionMethod", data.get("accidental_torsion_method", "additive")) or "additive"
    ).lower()
    accidental = None
    if ecc_ratio > 0:
        want_add = ecc_method.startswith("add") or ecc_method == "both"
        want_cm = (not ecc_method.startswith("add")) or ecc_method == "both"
        try:
            add_part = {}
            if want_add:
                if spectrum_x:
                    add_part["x"] = run_accidental_torsion_rsa(
                        data, modal_data, spectrum_x, direction="x",
                        combination=combination, damping_ratio=damping,
                        sa_in_g=sa_in_g, g=g, ecc_ratio=ecc_ratio,
                    )
                if spectrum_y:
                    add_part["y"] = run_accidental_torsion_rsa(
                        data, modal_data, spectrum_y, direction="y",
                        combination=combination, damping_ratio=damping,
                        sa_in_g=sa_in_g, g=g, ecc_ratio=ecc_ratio,
                    )
            has_add = bool(add_part.get("x") or add_part.get("y"))

            # Sumar el aporte de la torsión accidental a la reacción MZ de base
            # nominal de cada rama (aditivo, como ETABS — NO SRSS). El frontend
            # luego combina direccionalmente (SRSS X/Y) las dos ramas ya con su
            # accidental incluido. Solo el método aditivo produce este término;
            # con "cm" (masa desplazada + re-eigen) la torsión ya está dentro de
            # la respuesta desplazada, no como sumando explícito de base.
            if want_add:
                acc_mz_x = float((add_part.get("x") or {}).get("base_accidental_mz", 0.0) or 0.0)
                acc_mz_y = float((add_part.get("y") or {}).get("base_accidental_mz", 0.0) or 0.0)
                if "x" in seismic and acc_mz_x:
                    seismic["x"]["base_moment_mz"] = (
                        float(seismic["x"].get("base_moment_mz", 0.0) or 0.0) + abs(acc_mz_x)
                    )
                if "y" in seismic and acc_mz_y:
                    seismic["y"]["base_moment_mz"] = (
                        float(seismic["y"].get("base_moment_mz", 0.0) or 0.0) + abs(acc_mz_y)
                    )

            cm_part = {}
            if want_cm:
                if spectrum_x:
                    cm_part["x"] = {
                        "plus": run_shifted_cm_torsion_rsa(
                            data, spectrum_x, direction="x", combination=combination,
                            damping_ratio=damping, sa_in_g=sa_in_g, g=g,
                            ecc_ratio=ecc_ratio, num_modes=num_modes, sign=1,
                        ),
                        "minus": run_shifted_cm_torsion_rsa(
                            data, spectrum_x, direction="x", combination=combination,
                            damping_ratio=damping, sa_in_g=sa_in_g, g=g,
                            ecc_ratio=ecc_ratio, num_modes=num_modes, sign=-1,
                        ),
                    }
                if spectrum_y:
                    cm_part["y"] = {
                        "plus": run_shifted_cm_torsion_rsa(
                            data, spectrum_y, direction="y", combination=combination,
                            damping_ratio=damping, sa_in_g=sa_in_g, g=g,
                            ecc_ratio=ecc_ratio, num_modes=num_modes, sign=1,
                        ),
                        "minus": run_shifted_cm_torsion_rsa(
                            data, spectrum_y, direction="y", combination=combination,
                            damping_ratio=damping, sa_in_g=sa_in_g, g=g,
                            ecc_ratio=ecc_ratio, num_modes=num_modes, sign=-1,
                        ),
                    }
            has_cm = bool(
                cm_part.get("x", {}).get("plus") or cm_part.get("x", {}).get("minus")
                or cm_part.get("y", {}).get("plus") or cm_part.get("y", {}).get("minus")
            )

            if has_cm and has_add:
                accidental = {"mode": "both", "cm": cm_part, "add": add_part}
                print(f"🔁 Torsión accidental COMBINADA (CM±e + aditiva) aplicada (ecc={ecc_ratio}).")
            elif has_cm:
                accidental = {"mode": "envelope", **cm_part}
                print(f"🔁 Torsión accidental CM±e aplicada (ecc={ecc_ratio}).")
            elif has_add:
                accidental = add_part
                print(f"🔁 Torsión accidental ADITIVA aplicada (ecc={ecc_ratio}).")
            else:
                print(
                    f"⚠️ Torsión accidental habilitada (ecc={ecc_ratio}, método={ecc_method}) SIN efecto: "
                    "¿el modelo no tiene diafragmas con rotación (rigidDiaphragm_z) o sin masa?"
                )
        except Exception as _acc_err:
            print("⚠️ No se pudo calcular la torsión accidental:", _acc_err)
            accidental = None

        # Ambos métodos reconstruyen el modelo (ops.wipe), destruyendo el estado
        # EIGEN que un paso posterior (animación,
        # _b10_17_collect_opensees_modal_shapes) lee vivo desde OpenSees. Se
        # restaura re-corriendo el modal sobre el modelo ORIGINAL (mismo
        # num_modes) para dejar el dominio como lo espera el resto del pipeline.
        # Sin esto OpenSees aborta con "eigenvectors have not been set".
        try:
            build_model_3d(data)
            run_modal_analysis(nodes, num_modes)
        except Exception as _restore_err:
            print("⚠️ No se pudo restaurar el estado modal tras torsión accidental:", _restore_err)

    story_drifts = _compute_story_drifts(data, nodes, seismic, accidental=accidental)
    story_drifts["accidental_eccentricity"] = ecc_ratio
    story_drifts["accidental_applied"] = bool(accidental)
    story_drifts["accidental_method"] = ecc_method if accidental else None

    # Diagnóstico: cuánto agregó la excentricidad por piso (base vs total).
    if accidental:
        try:
            for _r in story_drifts.get("rows", []) or []:
                _bx = float(_r.get("drift_x_base_m") or 0.0)
                _ax = float(_r.get("drift_x_accidental_m") or 0.0)
                _by = float(_r.get("drift_y_base_m") or 0.0)
                _ay = float(_r.get("drift_y_accidental_m") or 0.0)
                _px = (100.0 * _ax / _bx) if _bx > 1e-12 else 0.0
                _py = (100.0 * _ay / _by) if _by > 1e-12 else 0.0
                print(
                    f"   ecc {_r.get('story')}: ΔX +{_px:.1f}% "
                    f"({_bx:.6f}→{_bx + _ax:.6f}) | ΔY +{_py:.1f}% "
                    f"({_by:.6f}→{_by + _ay:.6f})"
                )
        except Exception:
            pass

    results["story_drifts"] = story_drifts

    # Aceleraciones por piso (postproceso modal, aislado).
    try:
        results["story_accelerations"] = _compute_story_accelerations(data, nodes, seismic)
    except Exception as _acc_err:
        print("⚠️ No se pudieron calcular aceleraciones por piso:", _acc_err)
        results["story_accelerations"] = {"rows": []}

    # Centers of Mass and Rigidity (estilo ETABS): CM real con masas efectivas
    # por diafragma/piso. También reubica la "araña" del diafragma en el 2D.
    try:
        results["centers_of_mass_rigidity"] = _compute_centers_of_mass_rigidity(data, nodes)
    except Exception as _cm_err:
        print("⚠️ No se pudo calcular Centers of Mass and Rigidity:", _cm_err)
        results["centers_of_mass_rigidity"] = []

    # Contrato visual para el equipo frontend/animación.
    # Mantiene una forma simple: [{ level, z, height }]
    raw_levels = story_drifts.get("levels", [])
    contract_stories = []

    for index, level in enumerate(raw_levels):
        z = float(level.get("elevation", 0.0))
        if index == 0:
            height = 0.0
        else:
            previous_z = float(raw_levels[index - 1].get("elevation", 0.0))
            height = z - previous_z

        contract_stories.append(
            {
                "level": level.get("name", f"STORY {index}"),
                "z": z,
                "height": float(height),
            }
        )

    results["stories"] = contract_stories

    drift_rows = story_drifts.get("rows", [])

    results["drifts"] = {
        "x": [
            {
                "story": row.get("story"),
                "level": row.get("story"),
                "z": row.get("elevation_m"),
                "height": row.get("height_m"),
                "disp": row.get("displacement_x_m"),
                "drift": row.get("drift_x_m"),
                "drift_ratio": row.get("drift_ratio_x"),
                "drift_percent": row.get("drift_percent_x"),
                "allowable": story_drifts.get("drift_limit"),
                "status": row.get("status_x"),
            }
            for row in drift_rows
        ],
        "y": [
            {
                "story": row.get("story"),
                "level": row.get("story"),
                "z": row.get("elevation_m"),
                "height": row.get("height_m"),
                "disp": row.get("displacement_y_m"),
                "drift": row.get("drift_y_m"),
                "drift_ratio": row.get("drift_ratio_y"),
                "drift_percent": row.get("drift_percent_y"),
                "allowable": story_drifts.get("drift_limit"),
                "status": row.get("status_y"),
            }
            for row in drift_rows
        ],
    }

    # ── Paso B6: cortante por piso ───────────────────────────
    story_shears = _compute_story_shears(data, nodes, seismic)
    results["story_shears"] = {
        "x": story_shears.get("x", []),
        "y": story_shears.get("y", []),
    }
    results["story_shear_summary"] = story_shears.get("summary", {})

    # También se adjunta por dirección para facilitar la UI
    if isinstance(seismic, dict):
        if "x" in seismic:
            seismic["x"]["story_drifts"] = story_drifts.get("rows", [])
        if "y" in seismic:
            seismic["y"]["story_drifts"] = story_drifts.get("rows", [])

    # ── Paso 5: envolvente ──────────────────────────────────
    results["envelope"] = _compute_envelope(
        results.get("static", {}), seismic, [int(n["id"]) for n in nodes]
    )

    # B10.14 — Applied Loads tipo ETABS
    results["applied_load_tables"] = _b10_14_build_applied_load_tables(data)

    # B10.16 — Load Summary tipo ETABS
    results["load_summary_table"] = _b10_16_build_load_summary_table(
        (results.get("applied_load_tables") or {}).get("applied_loads", [])
    )

    # B10.17 — Payload para animación sísmica
    # B10.17 — Eigenvectors reales para animación sísmica
    try:
        animation_num_modes = int(
            data.get("num_modes")
            or data.get("numberOfModes")
            or len(results.get("periods", []) or [])
            or 1
        )
        # No pedir formas modales más allá de los modos reales calculados
        # (los degenerados se filtraron en run_modal_analysis).
        effective_modes = len((results.get("modal") or {}).get("modes") or [])
        if effective_modes:
            animation_num_modes = min(animation_num_modes, effective_modes)

        results["modal_shapes"] = _b10_17_collect_opensees_modal_shapes(
            data.get("nodes", []), animation_num_modes
        )

        print(
            "🎬 Modal shapes reales para animación:",
            {
                "modes": len(results.get("modal_shapes", {}) or {}),
                "nodes": len(data.get("nodes", []) or []),
            },
        )

    except Exception as error:
        print("⚠️ No se pudieron extraer modal shapes reales para animación:", error)
        results["modal_shapes"] = {}

    # B10.17 — Payload para animación sísmica
    results["seismic_animation"] = _b10_17_build_animation_payload(data, results)

    # ── Reacciones por nudo de apoyo (RSA) — AISLADO ───────
    # Combina las dos excitaciones del caso (X e Y) por SRSS, igual que ETABS.
    # Reconstruye su propio modelo (no toca los resultados ya calculados) y si
    # algo falla deja las reacciones vacías sin romper el resto del pipeline.
    try:
        rx = (
            run_joint_reactions_rsa(
                data, modal_data, spectrum_x, direction="x",
                combination=combination, damping_ratio=damping,
                sa_in_g=sa_in_g, g=g,
            )
            if spectrum_x else {}
        )
        ry = (
            run_joint_reactions_rsa(
                data, modal_data, spectrum_y, direction="y",
                combination=combination, damping_ratio=damping,
                sa_in_g=sa_in_g, g=g,
            )
            if spectrum_y else {}
        )
        joint_reactions = {}
        for sid in set(rx) | set(ry):
            a = rx.get(sid, [0.0] * 6)
            b = ry.get(sid, [0.0] * 6)
            joint_reactions[sid] = [float(np.hypot(a[d], b[d])) for d in range(6)]
        results["joint_reactions"] = joint_reactions
    except Exception as error:
        print("⚠️ No se pudieron calcular reacciones por nudo:", error)
        results["joint_reactions"] = {}

    # ── B7: paquete final de resultados tipo ETABS ─────────
    results["etabs_results"] = _build_etabs_results_package(results)
    
    # B10.18 — Contrato final backend / animación
    results["api_contract"] = _b10_18_build_backend_contract(results)
    
        # B10.19 — Health final backend / entrega
    results["backend_health"] = _b10_19_build_backend_health(data, results)

    try:
        results["api_contract"]["backend_health"] = results["backend_health"]
    except Exception:
        pass

    ops.wipe()
    return results
