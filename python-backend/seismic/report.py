"""seismic.report — RESPUESTA: tablas tipo ETABS (_b7_/_b10_), calidad del modelo, animación y empaquetado de resultados."""

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

__all__ = [
    "_b10_14_build_applied_load_tables",
    "_b10_14_direction_from_components",
    "_b10_14_float",
    "_b10_14_load_type",
    "_b10_16_build_load_summary_table",
    "_b10_16_float",
    "_b10_16_source_label",
    "_b10_17_build_animation_payload",
    "_b10_17_collect_opensees_modal_shapes",
    "_b10_17_float",
    "_b10_17_get_modal_periods",
    "_b10_17_get_modal_shape_rows",
    "_b10_17_node_mass",
    "_b10_17_node_xyz",
    "_b10_17_normalize_mode_shape",
    "_b10_17_story_name_for_node",
    "_b10_18_build_backend_contract",
    "_b10_19_build_backend_health",
    "_b10_19_float",
    "_b10_19_node_ids",
    "_b10_19_total_effective_mass",
    "_b10_19_validate_input_payload",
    "_b10_19_validate_output_results",
    "_b10_audit_elements",
    "_b10_build_model_quality_report",
    "_b10_default_load_pattern_from_payload",
    "_b10_detect_load_patterns",
    "_b10_float",
    "_b10_get_element_property",
    "_b10_has_any_key",
    "_b7_build_summary",
    "_b7_float",
    "_b7_get_base_shear_from_seismic",
    "_b7_now_iso",
    "_b7_round",
    "_b7_table_base_shear",
    "_b7_table_diaphragm_summary",
    "_b7_table_effective_mass",
    "_b7_table_joint_reactions",
    "_b7_table_mass_source",
    "_b7_table_modal_periods",
    "_b7_table_participating_mass",
    "_b7_table_story_accelerations",
    "_b7_table_story_drifts",
    "_b7_table_story_shears",
    "_build_etabs_results_package",
]


def _b7_float(value, fallback=0.0):
    try:
        number = float(value)
        return number if number == number else fallback
    except Exception:
        return fallback

def _b7_round(value, decimals=6):
    number = _b7_float(value, 0.0)
    return round(number, decimals)

def _b7_now_iso():
    try:
        from datetime import datetime

        return datetime.utcnow().isoformat() + "Z"
    except Exception:
        return None

def _b7_table_modal_periods(results: dict) -> list[dict]:
    modal = results.get("modal") or {}
    modes = modal.get("modes") or []

    rows = []

    for mode in modes:
        omega = _b7_float(mode.get("omega"), 0.0)
        rows.append(
            {
                "case": "Modal",
                "mode": int(mode.get("mode", len(rows) + 1)),
                "period_s": _b7_round(mode.get("period"), 9),
                "frequency_hz": _b7_round(mode.get("frequency"), 9),
                "omega_rad_s": _b7_round(mode.get("omega"), 9),
                "eigenvalue_rad2_s2": _b7_round(omega * omega, 6),
                "modal_mass_x": _b7_round(mode.get("modal_mass_x"), 9),
                "modal_mass_y": _b7_round(mode.get("modal_mass_y"), 9),
                "mass_participation_x_percent": _b7_round(
                    mode.get("mass_participation_x"), 6
                ),
                "mass_participation_y_percent": _b7_round(
                    mode.get("mass_participation_y"), 6
                ),
                "cumulative_x_percent": _b7_round(
                    mode.get("cumulative_participation_x"), 6
                ),
                "cumulative_y_percent": _b7_round(
                    mode.get("cumulative_participation_y"), 6
                ),
                "mass_participation_rz_percent": _b7_round(
                    mode.get("mass_participation_rz"), 6
                ),
                "cumulative_rz_percent": _b7_round(
                    mode.get("cumulative_participation_rz"), 6
                ),
                "gamma_x": _b7_round(mode.get("gamma_x"), 9),
                "gamma_y": _b7_round(mode.get("gamma_y"), 9),
            }
        )

    return rows

def _b7_table_participating_mass(results: dict) -> list[dict]:
    modal = results.get("modal") or {}
    modes = modal.get("modes") or []

    def ratio(mode, key):
        # La participacion se guarda en % (0-100); ETABS la muestra como ratio (0-1).
        return _b7_round(_b7_float(mode.get(key), 0.0) / 100.0, 6)

    rows = []
    for mode in modes:
        rows.append(
            {
                "case": "Modal",
                "mode": int(mode.get("mode", len(rows) + 1)),
                "period_s": _b7_round(mode.get("period"), 6),
                "ux": ratio(mode, "mass_participation_x"),
                "uy": ratio(mode, "mass_participation_y"),
                "uz": ratio(mode, "mass_participation_uz"),
                "sum_ux": ratio(mode, "cumulative_participation_x"),
                "sum_uy": ratio(mode, "cumulative_participation_y"),
                "sum_uz": ratio(mode, "cumulative_participation_uz"),
                "rx": ratio(mode, "mass_participation_rx"),
                "ry": ratio(mode, "mass_participation_ry"),
                "rz": ratio(mode, "mass_participation_rz"),
                "sum_rx": ratio(mode, "cumulative_participation_rx"),
                "sum_ry": ratio(mode, "cumulative_participation_ry"),
                "sum_rz": ratio(mode, "cumulative_participation_rz"),
                # Claves legacy (compatibilidad con consumidores previos, en %).
                "ux_percent": _b7_round(mode.get("mass_participation_x"), 6),
                "uy_percent": _b7_round(mode.get("mass_participation_y"), 6),
                "sum_ux_percent": _b7_round(mode.get("cumulative_participation_x"), 6),
                "sum_uy_percent": _b7_round(mode.get("cumulative_participation_y"), 6),
            }
        )

    return rows

def _b7_get_base_shear_from_seismic(seismic: dict, direction: str):
    if not isinstance(seismic, dict):
        return 0.0

    direction = direction.lower()
    branch = seismic.get(direction) or seismic.get(direction.upper()) or {}

    if isinstance(branch, dict):
        for key in ["base_shear", "baseShear", "Vb", "V", "shear"]:
            value = branch.get(key)

            if isinstance(value, dict):
                value = value.get("value") or value.get("total") or value.get("abs")

            number = _b7_float(value, None)

            if number is not None:
                return abs(number)

    for key in [
        f"base_shear_{direction}",
        f"baseShear_{direction}",
        f"Vb_{direction}",
        f"V_{direction}",
    ]:
        number = _b7_float(seismic.get(key), None)

        if number is not None:
            return abs(number)

    return 0.0

def _b7_get_base_moment_from_seismic(seismic: dict, direction: str, comp: str):
    """Momento de reacción en la base (comp = 'mx' | 'my' | 'mz') de la rama
    RSA de la dirección dada. Devuelto por run_response_spectrum_analysis."""
    if not isinstance(seismic, dict):
        return 0.0
    branch = seismic.get(direction.lower()) or seismic.get(direction.upper()) or {}
    if isinstance(branch, dict):
        number = _b7_float(branch.get(f"base_moment_{comp}"), None)
        if number is not None:
            return abs(number)
    return 0.0

def _b7_get_base_shear_component_from_seismic(seismic: dict, direction: str, comp: str):
    """Componente de fuerza basal (comp = 'fx' | 'fy') de la rama RSA de la
    dirección de excitación dada. Incluye el acoplamiento cruzado — ver run_rsa."""
    if not isinstance(seismic, dict):
        return 0.0
    branch = seismic.get(direction.lower()) or seismic.get(direction.upper()) or {}
    if isinstance(branch, dict):
        number = _b7_float(branch.get(f"base_shear_{comp}"), None)
        if number is not None:
            return abs(number)
    return 0.0

def _b7_table_base_shear(results: dict) -> list[dict]:
    seismic = results.get("seismic") or {}

    vb_x = _b7_get_base_shear_from_seismic(seismic, "x")
    vb_y = _b7_get_base_shear_from_seismic(seismic, "y")

    return [
        {
            "case": "SPEC_X",
            "direction": "X",
            "base_shear_N": _b7_round(vb_x, 6),
            "base_shear_kN": _b7_round(vb_x / 1000.0, 6),
            # Componentes de fuerza basal FX/FY de la rama X (incluye acoplamiento
            # cruzado): FX = primaria, FY = reacción Y acoplada bajo excitación X.
            "base_shear_fx_N": _b7_round(_b7_get_base_shear_component_from_seismic(seismic, "x", "fx"), 6),
            "base_shear_fy_N": _b7_round(_b7_get_base_shear_component_from_seismic(seismic, "x", "fy"), 6),
            # Momentos de reacción en la base (volteo MX/MY + torsión MZ), N·m.
            "base_moment_mx_Nm": _b7_round(_b7_get_base_moment_from_seismic(seismic, "x", "mx"), 6),
            "base_moment_my_Nm": _b7_round(_b7_get_base_moment_from_seismic(seismic, "x", "my"), 6),
            "base_moment_mz_Nm": _b7_round(_b7_get_base_moment_from_seismic(seismic, "x", "mz"), 6),
        },
        {
            "case": "SPEC_Y",
            "direction": "Y",
            "base_shear_N": _b7_round(vb_y, 6),
            "base_shear_kN": _b7_round(vb_y / 1000.0, 6),
            "base_shear_fx_N": _b7_round(_b7_get_base_shear_component_from_seismic(seismic, "y", "fx"), 6),
            "base_shear_fy_N": _b7_round(_b7_get_base_shear_component_from_seismic(seismic, "y", "fy"), 6),
            "base_moment_mx_Nm": _b7_round(_b7_get_base_moment_from_seismic(seismic, "y", "mx"), 6),
            "base_moment_my_Nm": _b7_round(_b7_get_base_moment_from_seismic(seismic, "y", "my"), 6),
            "base_moment_mz_Nm": _b7_round(_b7_get_base_moment_from_seismic(seismic, "y", "mz"), 6),
        },
    ]

def _b7_table_story_drifts(results: dict) -> list[dict]:
    drifts = results.get("drifts") or {}
    rows = []

    for direction in ["x", "y"]:
        for item in drifts.get(direction, []) or []:
            rows.append(
                {
                    "story": item.get("story") or item.get("level"),
                    "direction": direction.upper(),
                    "z_m": _b7_round(item.get("z"), 6),
                    "height_m": _b7_round(item.get("height"), 6),
                    "displacement_m": _b7_round(item.get("disp"), 9),
                    "drift_m": _b7_round(item.get("drift"), 9),
                    "drift_ratio": _b7_round(item.get("drift_ratio"), 9),
                    "drift_percent": _b7_round(item.get("drift_percent"), 6),
                    "allowable": _b7_round(item.get("allowable"), 6),
                    "status": item.get("status") or "",
                }
            )

    return rows

def _b7_table_story_shears(results: dict) -> list[dict]:
    story_shears = results.get("story_shears") or {}
    rows = []

    for direction in ["x", "y"]:
        for item in story_shears.get(direction, []) or []:
            shear = _b7_float(item.get("shear", item.get("story_shear")), 0.0)

            rows.append(
                {
                    "story": item.get("story") or item.get("level"),
                    "direction": direction.upper(),
                    "z_m": _b7_round(item.get("z"), 6),
                    "height_m": _b7_round(item.get("height"), 6),
                    "mass_kg": _b7_round(item.get("mass"), 6),
                    "distribution_factor": _b7_round(
                        item.get("distribution_factor"), 9
                    ),
                    "lateral_force_N": _b7_round(item.get("lateral_force"), 6),
                    "story_shear_N": _b7_round(shear, 6),
                    "story_shear_kN": _b7_round(shear / 1000.0, 6),
                }
            )

    return rows

def _b7_table_mass_source(results: dict) -> list[dict]:
    mass_source = results.get("mass_source") or {}
    summary = mass_source.get("summary") or {}

    rows = [
        {
            "item": "Enabled",
            "value": bool(mass_source.get("enabled")),
            "unit": "",
        },
        {
            "item": "Mass Source Name",
            "value": mass_source.get("name") or "",
            "unit": "",
        },
        {
            "item": "Include Self Weight",
            "value": bool(mass_source.get("include_self_weight")),
            "unit": "",
        },
        {
            "item": "Self Weight Multiplier",
            "value": _b7_round(mass_source.get("self_weight_multiplier"), 6),
            "unit": "",
        },
        {
            "item": "Gravity",
            "value": _b7_round(mass_source.get("gravity"), 6),
            "unit": "m/s²",
        },
        {
            "item": "Self Weight",
            "value": _b7_round(summary.get("self_weight_N"), 6),
            "unit": "N",
        },
        {
            "item": "Self Weight Mass",
            "value": _b7_round(summary.get("self_weight_mass_kg"), 6),
            "unit": "kg",
        },
        {
            "item": "Auto Mass X",
            "value": _b7_round(summary.get("auto_mass_x_kg"), 6),
            "unit": "kg",
        },
        {
            "item": "Auto Mass Y",
            "value": _b7_round(summary.get("auto_mass_y_kg"), 6),
            "unit": "kg",
        },
        {
            "item": "Nodes With Auto Mass",
            "value": int(summary.get("nodes_with_auto_mass") or 0),
            "unit": "nodes",
        },
    ]

    for pattern in mass_source.get("load_patterns", []) or []:
        rows.append(
            {
                "item": f"Load Pattern {pattern.get('name')}",
                "value": _b7_round(pattern.get("factor"), 6),
                "unit": "factor",
            }
        )

    return rows

def _b7_table_effective_mass(results: dict) -> list[dict]:
    effective_mass = results.get("effective_mass") or {}
    rows = []

    for item in effective_mass.get("rows", []) or []:
        rows.append(
            {
                "node": int(item.get("node", len(rows) + 1)),
                "manual_mx_kg": _b7_round(item.get("manual_mx"), 6),
                "manual_my_kg": _b7_round(item.get("manual_my"), 6),
                "manual_mz_kg": _b7_round(item.get("manual_mz"), 6),
                "auto_mx_kg": _b7_round(item.get("auto_mx"), 6),
                "auto_my_kg": _b7_round(item.get("auto_my"), 6),
                "auto_mz_kg": _b7_round(item.get("auto_mz"), 6),
                "effective_mx_kg": _b7_round(item.get("effective_mx"), 6),
                "effective_my_kg": _b7_round(item.get("effective_my"), 6),
                "effective_mz_kg": _b7_round(item.get("effective_mz"), 6),
            }
        )

    return rows

def _b7_table_story_accelerations(results: dict) -> list[dict]:
    """Aceleraciones por piso (m/s², rad/s²). El frontend agrega el nombre del
    caso; aquí van piso, Z y las 6 componentes (UZ/RX/RY/RZ = 0)."""
    acc = results.get("story_accelerations") or {}
    rows = []
    for r in acc.get("rows", []) or []:
        rows.append(
            {
                "story": r.get("story", ""),
                "z_m": _b7_round(r.get("z_m"), 6),
                "ux": _b7_round(r.get("ux"), 6),
                "uy": _b7_round(r.get("uy"), 6),
                "uz": _b7_round(r.get("uz"), 6),
                "rx": _b7_round(r.get("rx"), 6),
                "ry": _b7_round(r.get("ry"), 6),
                "rz": _b7_round(r.get("rz"), 6),
            }
        )
    return rows

def _b7_table_joint_reactions(results: dict) -> list[dict]:
    """Reacciones por nudo de apoyo (RSA) en N y N·m. El frontend agrega piso,
    coordenadas y nombre del caso; aquí solo va la magnitud por nudo y GDL."""
    reactions = results.get("joint_reactions") or {}
    rows = []

    for node, vals in reactions.items():
        v = list(vals or [])
        v = (v + [0.0] * 6)[:6]
        try:
            nid = int(node)
        except Exception:
            nid = node
        rows.append(
            {
                "node": nid,
                "fx_N": _b7_round(v[0], 6),
                "fy_N": _b7_round(v[1], 6),
                "fz_N": _b7_round(v[2], 6),
                "mx_Nm": _b7_round(v[3], 6),
                "my_Nm": _b7_round(v[4], 6),
                "mz_Nm": _b7_round(v[5], 6),
            }
        )

    rows.sort(key=lambda r: (r["node"] if isinstance(r["node"], int) else 0))
    return rows

def _b7_table_diaphragm_summary(results: dict) -> list[dict]:
    constraints = results.get("model_constraints") or {}
    rigid = constraints.get("rigid_diaphragms") or {}
    rows = []

    for item in rigid.get("applied", []) or []:
        rows.append(
            {
                "diaphragm": item.get("id"),
                "source": item.get("source"),
                "method": item.get("method"),
                "retained_node": item.get("retained"),
                "constrained_nodes": item.get("constrained", []),
                "node_count": item.get("count"),
            }
        )

    for item in rigid.get("skipped", []) or []:
        # `skipped` puede traer dicts {id, reason} o strings sueltos
        # (ej. "No hay grupos de diafragma válidos.").
        if isinstance(item, dict):
            rows.append(
                {
                    "diaphragm": item.get("id", "skipped"),
                    "source": item.get("source", ""),
                    "method": "skipped",
                    "retained_node": None,
                    "constrained_nodes": [],
                    "node_count": 0,
                    "reason": item.get("reason", ""),
                }
            )
        else:
            rows.append(
                {
                    "diaphragm": "skipped",
                    "source": "",
                    "method": "skipped",
                    "retained_node": None,
                    "constrained_nodes": [],
                    "node_count": 0,
                    "reason": str(item),
                }
            )

    return rows

def _b7_build_summary(results: dict) -> dict:
    base_shear = _b7_table_base_shear(results)
    story_drifts = _b7_table_story_drifts(results)
    story_shears = _b7_table_story_shears(results)

    mass_source = results.get("mass_source") or {}
    mass_summary = mass_source.get("summary") or {}

    effective_mass = results.get("effective_mass") or {}
    effective_summary = effective_mass.get("summary") or {}

    max_drift_x = max(
        [
            abs(_b7_float(row.get("drift_ratio"), 0.0))
            for row in story_drifts
            if row.get("direction") == "X"
        ],
        default=0.0,
    )

    max_drift_y = max(
        [
            abs(_b7_float(row.get("drift_ratio"), 0.0))
            for row in story_drifts
            if row.get("direction") == "Y"
        ],
        default=0.0,
    )

    max_story_shear_x = max(
        [
            abs(_b7_float(row.get("story_shear_N"), 0.0))
            for row in story_shears
            if row.get("direction") == "X"
        ],
        default=0.0,
    )

    max_story_shear_y = max(
        [
            abs(_b7_float(row.get("story_shear_N"), 0.0))
            for row in story_shears
            if row.get("direction") == "Y"
        ],
        default=0.0,
    )

    model_quality = results.get("model_quality") or {}

    # Método de deriva en uso (señal de qué código está cargado):
    #   "cqc_modal" = fix activo (CQC de derivas modales por línea, capta torsión)
    #   "avg"       = método promedio antiguo (Flask viejo / fallback sin datos por modo)
    drift_method = (
        ((results.get("story_drifts") or {}).get("summary") or {}).get("drift_method")
    )

    return {
        # Marcadores de versión del motor (verifican que el Flask cargó el código nuevo).
        "engine_build": "2026-07-07-clear-length",
        "drift_method": drift_method,
        "base_shear_x_N": base_shear[0]["base_shear_N"] if len(base_shear) > 0 else 0.0,
        "base_shear_y_N": base_shear[1]["base_shear_N"] if len(base_shear) > 1 else 0.0,
        "max_story_shear_x_N": _b7_round(max_story_shear_x, 6),
        "max_story_shear_y_N": _b7_round(max_story_shear_y, 6),
        "max_drift_x_ratio": _b7_round(max_drift_x, 9),
        "max_drift_y_ratio": _b7_round(max_drift_y, 9),
        "auto_mass_x_kg": _b7_round(mass_summary.get("auto_mass_x_kg"), 6),
        "auto_mass_y_kg": _b7_round(mass_summary.get("auto_mass_y_kg"), 6),
        "total_effective_mx_kg": _b7_round(
            effective_summary.get("total_effective_mx"), 6
        ),
        "total_effective_my_kg": _b7_round(
            effective_summary.get("total_effective_my"), 6
        ),
        "nodes_with_effective_mass": int(
            effective_summary.get("nodes_with_effective_mass") or 0
        ),
        "modal_modes": len((results.get("modal") or {}).get("modes") or []),
        "stories": len(results.get("stories") or []),
        "model_quality_status": model_quality.get("status", "UNKNOWN"),
        "model_quality_warnings": len(model_quality.get("warnings", []) or []),
    }

def _b10_14_float(value, default=0.0):
    try:
        number = float(value)
        if number == number:
            return number
    except Exception:
        pass
    return float(default)

def _b10_14_load_type(load: dict) -> str:
    return str(
        load.get("patternType") or load.get("loadType") or load.get("type") or ""
    ).strip()

def _b10_14_direction_from_components(fx, fy, fz, mx=0.0, my=0.0, mz=0.0) -> str:
    values = {
        "FX": abs(fx),
        "FY": abs(fy),
        "FZ": abs(fz),
        "MX": abs(mx),
        "MY": abs(my),
        "MZ": abs(mz),
    }

    direction = max(values, key=values.get)

    return direction if values[direction] > 0 else ""

def _b10_14_build_applied_load_tables(data: dict) -> dict:
    loads = data.get("loads") or []

    joint_loads = []
    frame_loads = []
    equivalent_joint_loads = []
    applied_loads = []

    seen_frame_loads = set()

    for index, load in enumerate(loads, start=1):
        if not isinstance(load, dict):
            continue

        node = load.get("node") or load.get("nodeId") or load.get("node_id")
        frame_id = load.get("frameId") or load.get("frame_id")

        fx = _b10_14_float(load.get("fx", load.get("FX", 0.0)))
        fy = _b10_14_float(load.get("fy", load.get("FY", 0.0)))
        fz = _b10_14_float(load.get("fz", load.get("FZ", 0.0)))
        mx = _b10_14_float(load.get("mx", load.get("MX", 0.0)))
        my = _b10_14_float(load.get("my", load.get("MY", 0.0)))
        mz = _b10_14_float(load.get("mz", load.get("MZ", 0.0)))

        load_case = _b10_14_load_case(load)
        load_type = _b10_14_load_type(load)

        source = str(load.get("source") or "").strip()
        assignment_type = str(
            load.get("assignmentType") or load.get("loadAssignmentType") or ""
        ).strip()

        direction = str(load.get("direction") or "").strip().upper()

        if not direction:
            direction = _b10_14_direction_from_components(fx, fy, fz, mx, my, mz)

        applied_row = {
            "row": index,
            "source": source or "joint_load",
            "assignment_type": assignment_type or "force",
            "load_case": load_case,
            "load_type": load_type,
            "node": node,
            "frame": frame_id,
            "direction": direction,
            "fx_N": fx,
            "fy_N": fy,
            "fz_N": fz,
            "mx_Nm": mx,
            "my_Nm": my,
            "mz_Nm": mz,
            "vertical_weight_N": max(0.0, -fz),
        }

        applied_loads.append(applied_row)

        if source == "frame_load_equivalent":
            equivalent_joint_loads.append(
                {
                    "row": len(equivalent_joint_loads) + 1,
                    "frame": frame_id,
                    "node": node,
                    "load_case": load_case,
                    "load_type": load_type,
                    "frame_load_kind": load.get("frameLoadKind") or assignment_type,
                    "direction": direction,
                    "fx_N": fx,
                    "fy_N": fy,
                    "fz_N": fz,
                    "vertical_weight_N": max(0.0, -fz),
                }
            )

            frame_key = (
                str(frame_id),
                load_case,
                assignment_type,
                str(load.get("frameLoadKind") or ""),
                str(load.get("originalValue") or ""),
                str(load.get("usedValue") or ""),
                str(load.get("relativeDistance") or ""),
                str(load.get("tributaryLength") or ""),
            )

            if frame_key not in seen_frame_loads:
                seen_frame_loads.add(frame_key)

                frame_kind = str(
                    load.get("frameLoadKind") or assignment_type or ""
                ).lower()

                if "point" in frame_kind:
                    frame_loads.append(
                        {
                            "row": len(frame_loads) + 1,
                            "frame": frame_id,
                            "load_case": load_case,
                            "load_type": load_type,
                            "frame_load_type": "Point",
                            "direction": direction,
                            "value_N": _b10_14_float(
                                load.get("originalValue", load.get("usedValue", 0.0))
                            ),
                            "relative_distance": load.get("relativeDistance"),
                            "equivalent_method": "P*(1-a), P*a",
                        }
                    )
                else:
                    frame_loads.append(
                        {
                            "row": len(frame_loads) + 1,
                            "frame": frame_id,
                            "load_case": load_case,
                            "load_type": load_type,
                            "frame_load_type": "Distributed",
                            "direction": direction,
                            "w_N_m": _b10_14_float(
                                load.get("usedValue", load.get("originalValue", 0.0))
                            ),
                            "tributary_length_m": load.get("tributaryLength"),
                            "equivalent_method": "wL/2, wL/2",
                        }
                    )

        else:
            joint_loads.append(
                {
                    "row": len(joint_loads) + 1,
                    "node": node,
                    "load_case": load_case,
                    "load_type": load_type,
                    "direction": direction,
                    "fx_N": fx,
                    "fy_N": fy,
                    "fz_N": fz,
                    "mx_Nm": mx,
                    "my_Nm": my,
                    "mz_Nm": mz,
                    "vertical_weight_N": max(0.0, -fz),
                }
            )

    return {
        "applied_loads": applied_loads,
        "joint_loads": joint_loads,
        "frame_loads": frame_loads,
        "equivalent_joint_loads": equivalent_joint_loads,
    }

def _b10_16_float(value, default=0.0):
    try:
        number = float(value)
        if number == number:
            return number
    except Exception:
        pass
    return float(default)

def _b10_16_source_label(row: dict) -> str:
    source = str(row.get("source") or "").strip().lower()
    assignment = str(row.get("assignment_type") or "").strip().lower()

    if source == "node_load":
        return "Joint"

    if source == "frame_load_equivalent" or assignment.startswith("frame_"):
        return "Frame"

    return source or "Unknown"

def _b10_16_build_load_summary_table(applied_loads=None):
    applied_loads = applied_loads or []

    groups = {}

    total_count = 0
    total_fx = 0.0
    total_fy = 0.0
    total_fz = 0.0
    total_weight = 0.0

    for row in applied_loads:
        if not isinstance(row, dict):
            continue

        load_case = str(row.get("load_case") or "DEAD").strip()
        source = _b10_16_source_label(row)
        assignment = str(row.get("assignment_type") or "").strip() or "force"

        key = (load_case, source, assignment)

        if key not in groups:
            groups[key] = {
                "load_case": load_case,
                "source": source,
                "assignment": assignment,
                "count": 0,
                "total_fx_N": 0.0,
                "total_fy_N": 0.0,
                "total_fz_N": 0.0,
                "total_weight_N": 0.0,
            }

        fx = _b10_16_float(row.get("fx_N"), 0.0)
        fy = _b10_16_float(row.get("fy_N"), 0.0)
        fz = _b10_16_float(row.get("fz_N"), 0.0)
        weight = _b10_16_float(row.get("vertical_weight_N"), max(0.0, -fz))

        groups[key]["count"] += 1
        groups[key]["total_fx_N"] += fx
        groups[key]["total_fy_N"] += fy
        groups[key]["total_fz_N"] += fz
        groups[key]["total_weight_N"] += weight

        total_count += 1
        total_fx += fx
        total_fy += fy
        total_fz += fz
        total_weight += weight

    rows = []

    for index, item in enumerate(groups.values(), start=1):
        rows.append(
            {
                "row": index,
                "load_case": item["load_case"],
                "source": item["source"],
                "assignment": item["assignment"],
                "count": item["count"],
                "total_fx_N": item["total_fx_N"],
                "total_fy_N": item["total_fy_N"],
                "total_fz_N": item["total_fz_N"],
                "total_weight_N": item["total_weight_N"],
            }
        )

    rows.append(
        {
            "row": len(rows) + 1,
            "load_case": "TOTAL",
            "source": "All",
            "assignment": "All",
            "count": total_count,
            "total_fx_N": total_fx,
            "total_fy_N": total_fy,
            "total_fz_N": total_fz,
            "total_weight_N": total_weight,
        }
    )

    return rows

def _b10_17_float(value, default=0.0):
    try:
        number = float(value)
        if number == number:
            return number
    except Exception:
        pass
    return float(default)

def _b10_17_node_xyz(node: dict) -> tuple[float, float, float]:
    return (
        _b10_17_float(node.get("x", node.get("X", 0.0)), 0.0),
        _b10_17_float(node.get("y", node.get("Y", 0.0)), 0.0),
        _b10_17_float(node.get("z", node.get("Z", 0.0)), 0.0),
    )

def _b10_17_node_mass(node: dict, direction: str = "x") -> float:
    direction = str(direction or "x").lower()

    keys = [
        f"_effective_mass_{direction}",
        f"effective_mass_{direction}",
        f"mass_{direction}",
        f"m{direction}",
        "mass",
    ]

    for key in keys:
        value = node.get(key)

        if isinstance(value, dict):
            continue

        number = _b10_17_float(value, None)

        if number is not None:
            return max(number, 0.0)

    mass_obj = node.get("effective_mass") or node.get("mass")

    if isinstance(mass_obj, dict):
        for key in [direction, direction.upper(), f"m{direction}", f"mass_{direction}"]:
            number = _b10_17_float(mass_obj.get(key), None)

            if number is not None:
                return max(number, 0.0)

    return 0.0

def _b10_17_story_name_for_node(node: dict, stories=None) -> str:
    z = _b10_17_float(node.get("z", node.get("Z", 0.0)), 0.0)

    if isinstance(stories, list) and stories:
        best_story = None
        best_delta = None

        for story in stories:
            if not isinstance(story, dict):
                continue

            elevation = _b10_17_float(story.get("elevation"), 0.0)
            delta = abs(z - elevation)

            if best_delta is None or delta < best_delta:
                best_delta = delta
                best_story = story

        if best_story:
            return str(best_story.get("name") or best_story.get("id") or f"Z={z}")

    if abs(z) < 1e-9:
        return "Base"

    return f"Z={z:g}"

def _b10_17_get_modal_periods(results: dict) -> list[dict]:
    rows = []

    # Intentar usar la tabla real generada por B7
    try:
        b7_rows = _b7_table_modal_periods(results)

        if isinstance(b7_rows, list) and b7_rows:
            for index, item in enumerate(b7_rows, start=1):
                if not isinstance(item, dict):
                    continue

                mode = int(
                    _b10_17_float(item.get("mode", item.get("Mode", index)), index)
                )

                period = _b10_17_float(
                    item.get(
                        "period_s",
                        item.get("Period (s)", item.get("period", item.get("T", 0.0))),
                    ),
                    0.0,
                )

                rows.append(
                    {
                        "mode": mode,
                        "period_s": period,
                        "frequency_hz": (1.0 / period) if period > 0 else 0.0,
                    }
                )

            if rows:
                return rows

    except Exception as error:
        print("⚠️ No se pudo leer modal_periods desde B7 para animación:", error)

    modal_rows = (
        results.get("modal_periods")
        or results.get("periods")
        or (results.get("etabs_results") or {}).get("tables", {}).get("modal_periods")
        or []
    )

    if isinstance(modal_rows, dict):
        modal_rows = list(modal_rows.values())

    if isinstance(modal_rows, list):
        for index, item in enumerate(modal_rows, start=1):
            if isinstance(item, dict):
                mode = int(
                    _b10_17_float(item.get("mode", item.get("Mode", index)), index)
                )
                period = _b10_17_float(
                    item.get(
                        "period_s",
                        item.get("period", item.get("T", item.get("Period", 0.0))),
                    ),
                    0.0,
                )
            else:
                mode = index
                period = _b10_17_float(item, 0.0)

            rows.append(
                {
                    "mode": mode,
                    "period_s": period,
                    "frequency_hz": (1.0 / period) if period > 0 else 0.0,
                }
            )

    return rows

def _b10_17_get_modal_shape_rows(results: dict, mode: int) -> list[dict]:
    modal_shapes = (
        results.get("modal_shapes")
        or results.get("mode_shapes")
        or results.get("eigenvectors")
        or {}
    )

    if isinstance(modal_shapes, dict):
        raw = (
            modal_shapes.get(str(mode))
            or modal_shapes.get(mode)
            or modal_shapes.get(f"mode_{mode}")
            or modal_shapes.get(f"Mode {mode}")
            or []
        )

        if isinstance(raw, dict):
            raw = list(raw.values())

        return raw if isinstance(raw, list) else []

    if isinstance(modal_shapes, list):
        # Caso 1: lista de modos [{mode: 1, shape: [...]}]
        for item in modal_shapes:
            if not isinstance(item, dict):
                continue

            item_mode = int(_b10_17_float(item.get("mode", item.get("Mode", 0)), 0))

            if item_mode == mode:
                shape = (
                    item.get("shape")
                    or item.get("nodes")
                    or item.get("eigenvector")
                    or []
                )
                return shape if isinstance(shape, list) else []

        # Caso 2: lista indexada por modo [[...], [...]]
        if len(modal_shapes) >= mode and isinstance(modal_shapes[mode - 1], list):
            return modal_shapes[mode - 1]

    return []

def _b10_17_normalize_mode_shape(shape_rows, nodes, direction="x") -> list[dict]:
    node_ids = [
        int(_b10_17_float(node.get("id"), 0))
        for node in nodes
        if isinstance(node, dict)
    ]

    raw_by_node = {}

    for index, row in enumerate(shape_rows or []):
        if not isinstance(row, dict):
            continue

        node_id = int(
            _b10_17_float(
                row.get(
                    "node",
                    row.get(
                        "nodeId",
                        row.get(
                            "node_id",
                            row.get(
                                "id", node_ids[index] if index < len(node_ids) else 0
                            ),
                        ),
                    ),
                ),
                0,
            )
        )

        if node_id <= 0:
            continue

        dx = _b10_17_float(
            row.get("dx", row.get("ux", row.get("Ux", row.get("UX", 0.0)))), 0.0
        )
        dy = _b10_17_float(
            row.get("dy", row.get("uy", row.get("Uy", row.get("UY", 0.0)))), 0.0
        )
        dz = _b10_17_float(
            row.get("dz", row.get("uz", row.get("Uz", row.get("UZ", 0.0)))), 0.0
        )

        raw_by_node[node_id] = {
            "node": node_id,
            "dx": dx,
            "dy": dy,
            "dz": dz,
        }

    # Si no hay formas modales reales, se genera una forma sintética simple.
    # Esto NO reemplaza al modo real, pero permite conectar la animación sin romper.
    if not raw_by_node:
        max_z = max(
            [
                _b10_17_float(node.get("z"), 0.0)
                for node in nodes
                if isinstance(node, dict)
            ]
            or [1.0]
        )
        max_z = max(max_z, 1.0)

        for node in nodes:
            if not isinstance(node, dict):
                continue

            node_id = int(_b10_17_float(node.get("id"), 0))
            z = _b10_17_float(node.get("z"), 0.0)
            ratio = z / max_z

            dx = ratio if direction.lower() == "x" else 0.0
            dy = ratio if direction.lower() == "y" else 0.0

            raw_by_node[node_id] = {
                "node": node_id,
                "dx": dx,
                "dy": dy,
                "dz": 0.0,
                "synthetic": True,
            }

    max_abs = 0.0

    for item in raw_by_node.values():
        max_abs = max(
            max_abs,
            abs(item.get("dx", 0.0)),
            abs(item.get("dy", 0.0)),
            abs(item.get("dz", 0.0)),
        )

    if max_abs <= 0:
        max_abs = 1.0

    normalized = []

    for node_id in node_ids:
        item = raw_by_node.get(
            node_id, {"node": node_id, "dx": 0.0, "dy": 0.0, "dz": 0.0}
        )

        normalized.append(
            {
                "node": node_id,
                "dx": item.get("dx", 0.0) / max_abs,
                "dy": item.get("dy", 0.0) / max_abs,
                "dz": item.get("dz", 0.0) / max_abs,
                "synthetic": item.get("synthetic", False) is True,
            }
        )

    return normalized

def _b10_17_collect_opensees_modal_shapes(nodes, num_modes=1) -> dict:
    """
    Extrae eigenvectors reales desde OpenSeesPy para animación sísmica.
    Debe llamarse después de ejecutar ops.eigen(...) y antes de ops.wipe().
    """
    shapes = {}

    try:
        mode_count = max(1, int(num_modes or 1))
    except Exception:
        mode_count = 1

    for mode in range(1, mode_count + 1):
        rows = []

        for node in nodes or []:
            if not isinstance(node, dict):
                continue

            try:
                node_id = int(float(node.get("id", 0)))
            except Exception:
                continue

            if node_id <= 0:
                continue

            try:
                dx = float(ops.nodeEigenvector(node_id, mode, 1))
            except Exception:
                dx = 0.0

            try:
                dy = float(ops.nodeEigenvector(node_id, mode, 2))
            except Exception:
                dy = 0.0

            try:
                dz = float(ops.nodeEigenvector(node_id, mode, 3))
            except Exception:
                dz = 0.0

            rows.append(
                {
                    "node": node_id,
                    "dx": dx,
                    "dy": dy,
                    "dz": dz,
                    "source": "opensees_nodeEigenvector",
                }
            )

        if rows:
            shapes[str(mode)] = rows

    return shapes

def _b10_17_build_animation_payload(data: dict, results: dict) -> dict:
    nodes = data.get("nodes") or []
    elements = data.get("elements") or data.get("frames") or []
    stories = data.get("stories") or data.get("levels") or []

    animation_nodes = []

    for node in nodes:
        if not isinstance(node, dict):
            continue

        node_id = int(_b10_17_float(node.get("id"), 0))
        x, y, z = _b10_17_node_xyz(node)

        animation_nodes.append(
            {
                "id": node_id,
                "x": x,
                "y": y,
                "z": z,
                "story": _b10_17_story_name_for_node(node, stories),
                "mass_x": _b10_17_node_mass(node, "x"),
                "mass_y": _b10_17_node_mass(node, "y"),
            }
        )

    animation_elements = []

    for elem in elements:
        if not isinstance(elem, dict):
            continue

        animation_elements.append(
            {
                "id": int(_b10_17_float(elem.get("id"), len(animation_elements) + 1)),
                "node_i": int(
                    _b10_17_float(
                        elem.get("node_i", elem.get("node1", elem.get("i", 0))), 0
                    )
                ),
                "node_j": int(
                    _b10_17_float(
                        elem.get("node_j", elem.get("node2", elem.get("j", 0))), 0
                    )
                ),
                "type": elem.get("type") or elem.get("elementType") or "frame",
            }
        )

    modal_periods = _b10_17_get_modal_periods(results)

    if not modal_periods:
        modal_periods = [
            {
                "mode": 1,
                "period_s": 0.5,
                "frequency_hz": 2.0,
            }
        ]

    modes = []
    skipped_modes = []

    min_animation_period_s = 0.01
    max_animation_frequency_hz = 100.0

    for item in modal_periods[:12]:
        mode = int(item.get("mode", len(modes) + 1))
        period = _b10_17_float(item.get("period_s"), 0.0)
        frequency = (1.0 / period) if period > 0 else 0.0

        if period <= 0:
            skipped_modes.append({
                "mode": mode,
                "period_s": period,
                "frequency_hz": frequency,
                "reason": "invalid_period",
            })
            continue

        if period < min_animation_period_s or frequency > max_animation_frequency_hz:
            skipped_modes.append({
                "mode": mode,
                "period_s": period,
                "frequency_hz": frequency,
                "reason": "too_high_frequency_for_visual_animation",
            })
            continue

        direction = "X" if mode % 2 == 1 else "Y"

        shape_rows = _b10_17_get_modal_shape_rows(results, mode)

        normalized_shape = _b10_17_normalize_mode_shape(
            shape_rows,
            animation_nodes,
            direction.lower()
        )

        has_synthetic_shape = any(
            item.get("synthetic") is True
            for item in normalized_shape
            if isinstance(item, dict)
        )

        modes.append({
            "mode": mode,
            "period_s": period,
            "frequency_hz": frequency,
            "direction": direction,
            "shape": normalized_shape,
            "usable_for_animation": True,
            "synthetic": has_synthetic_shape,
        })

    if not modes:
        period = modal_periods[0].get("period_s", 0.5) if modal_periods else 0.5
        frequency = (1.0 / period) if period > 0 else 2.0

        modes.append({
            "mode": 1,
            "period_s": period,
            "frequency_hz": frequency,
            "direction": "X",
            "shape": _b10_17_normalize_mode_shape([], animation_nodes, "x"),
            "usable_for_animation": False,
            "synthetic": True,
            "fallback": True,
        })

    return {
        "type": "seismic_animation_payload",
        "version": "B10.17",
        "status": "ok",
        "generated_at": results.get("generated_at") or results.get("ranAt") or None,
        "coordinate_system": {
            "x": "global_x",
            "y": "global_y",
            "z": "height",
        },
        "time": {
            "duration_s": 6.0,
            "fps": 30,
            "steps": 180,
            "wave": "sin",
        },
        "scale": {
            "suggested": 80,
            "min": 1,
            "max": 500,
            "units": "visual_scale_factor",
        },
        "nodes": animation_nodes,
        "elements": animation_elements,
        "frames": animation_elements,
        "modes": modes,

        "animation_quality": {
            "ready_for_animation": bool(modes) and not any(
                mode.get("synthetic") is True
                for mode in modes
                if isinstance(mode, dict)
            ),
            "usable_modes": len(modes),
            "skipped_modes": skipped_modes,
            "min_animation_period_s": min_animation_period_s,
            "max_animation_frequency_hz": max_animation_frequency_hz,
        },
        "notes": [
            "Las formas modales se normalizan entre -1 y 1.",
            "Si synthetic=true, la forma fue generada como respaldo visual porque no se encontró eigenvector real.",
        ],
    }

def _b10_18_build_backend_contract(results: dict) -> dict:
    animation = results.get("seismic_animation") or {}
    quality = animation.get("animation_quality") or {}

    etabs_results = results.get("etabs_results") or {}
    tables = etabs_results.get("tables") or {}

    return {
        "type": "jhack_seismic_backend_contract",
        "version": "B10.18",
        "status": "stable",

        "endpoint": "/api/seismic/analyze",

        "root_keys": {
            "seismic_animation": "Payload oficial para animación sísmica.",
            "etabs_results": "Paquete de resultados y tablas tipo ETABS.",
            "mass_source": "Resumen de fuente de masa.",
            "effective_mass": "Masa efectiva por nodo.",
            "model_constraints": "Restricciones, diafragmas y reportes del modelo.",
        },

        "animation_contract": {
            "official_path": "response.seismic_animation",
            "browser_global": "window.jhackSeismicAnimationPayload",
            "ready_flag": "response.seismic_animation.animation_quality.ready_for_animation",

            "required_keys": [
                "type",
                "version",
                "nodes",
                "elements",
                "modes",
                "animation_quality",
            ],

            "node_schema": {
                "id": "number",
                "x": "number",
                "y": "number",
                "z": "number",
                "story": "string",
                "mass_x": "number",
                "mass_y": "number",
            },

            "element_schema": {
                "id": "number",
                "node_i": "number",
                "node_j": "number",
                "type": "string",
            },

            "mode_schema": {
                "mode": "number",
                "period_s": "number",
                "frequency_hz": "number",
                "direction": "X/Y",
                "usable_for_animation": "boolean",
                "synthetic": "boolean",
                "shape": [
                    {
                        "node": "number",
                        "dx": "number",
                        "dy": "number",
                        "dz": "number",
                        "synthetic": "boolean",
                    }
                ],
            },

            "animation_formula": {
                "factor": "sin(2*pi*frequency_hz*t)",
                "x": "node.x + shape.dx * visual_scale * factor",
                "y": "node.y + shape.dy * visual_scale * factor",
                "z": "node.z + shape.dz * visual_scale * factor",
            },
        },

        "current_animation_status": {
            "ready_for_animation": quality.get("ready_for_animation", False),
            "usable_modes": quality.get("usable_modes", 0),
            "skipped_modes": len(quality.get("skipped_modes", []) or []),
            "nodes": len(animation.get("nodes", []) or []),
            "elements": len(animation.get("elements", []) or []),
            "modes": len(animation.get("modes", []) or []),
        },

        "etabs_tables_contract": {
            "official_path": "response.etabs_results.tables",
            "available_tables": sorted(list(tables.keys())),
            "important_tables": [
                "modal_periods",
                "participating_mass_ratios",
                "base_shear",
                "load_summary",
                "applied_loads",
                "joint_loads",
                "frame_loads",
                "equivalent_joint_loads",
                "story_drifts",
                "story_shears",
                "mass_source",
                "effective_mass",
                "diaphragm_summary",
                "model_quality",
                "element_properties",
            ],
        },

        "handoff_to_animation_developer": {
            "use_this_global": "window.jhackSeismicAnimationPayload",
            "recommended_first_mode": "window.jhackSeismicAnimationPayload.modes[0]",
            "do_not_use_modes_where": "usable_for_animation !== true or synthetic === true",
            "safe_to_animate_when": "animation_quality.ready_for_animation === true",
        },
    }

def _b10_19_float(value, default=0.0):
    try:
        number = float(value)
        if number == number:
            return number
    except Exception:
        pass
    return float(default)

def _b10_19_node_ids(data: dict) -> set:
    ids = set()

    for node in data.get("nodes", []) or []:
        if not isinstance(node, dict):
            continue

        try:
            node_id = int(float(node.get("id")))
            ids.add(node_id)
        except Exception:
            pass

    return ids

def _b10_19_total_effective_mass(results: dict) -> float:
    effective_mass = results.get("effective_mass") or {}
    summary = effective_mass.get("summary") if isinstance(effective_mass, dict) else {}

    total = (
        _b10_19_float(summary.get("total_effective_mx"), 0.0)
        or _b10_19_float(summary.get("total_effective_my"), 0.0)
        or 0.0
    )

    if total > 0:
        return total

    model_constraints = results.get("model_constraints") or {}
    eff = model_constraints.get("effective_mass") or {}
    eff_summary = eff.get("summary") or {}

    return (
        _b10_19_float(eff_summary.get("total_effective_mx"), 0.0)
        or _b10_19_float(eff_summary.get("total_effective_my"), 0.0)
        or 0.0
    )

def _b10_19_validate_input_payload(data: dict) -> dict:
    errors = []
    warnings = []

    nodes = data.get("nodes") or []
    elements = data.get("elements") or data.get("frames") or []
    supports = data.get("supports") or []
    loads = data.get("loads") or []
    load_patterns = data.get("loadPatterns") or data.get("load_patterns") or []

    if not isinstance(nodes, list) or len(nodes) == 0:
        errors.append("El modelo no tiene nodos.")

    if not isinstance(elements, list) or len(elements) == 0:
        errors.append("El modelo no tiene elementos/frame objects.")

    if not isinstance(supports, list) or len(supports) == 0:
        errors.append("El modelo no tiene apoyos/restraints.")

    if not isinstance(loads, list):
        warnings.append("El campo loads no es una lista. Se tratará como vacío.")

    if not isinstance(load_patterns, list) or len(load_patterns) == 0:
        warnings.append("No se recibieron Load Patterns explícitos. Se usará fallback DEAD si aplica.")

    node_ids = _b10_19_node_ids(data)

    bad_elements = []

    for elem in elements:
        if not isinstance(elem, dict):
            continue

        elem_id = elem.get("id")

        node_i = elem.get("node_i") or elem.get("node1") or elem.get("i")
        node_j = elem.get("node_j") or elem.get("node2") or elem.get("j")

        try:
            node_i = int(float(node_i))
            node_j = int(float(node_j))
        except Exception:
            bad_elements.append(elem_id)
            continue

        if node_i not in node_ids or node_j not in node_ids:
            bad_elements.append(elem_id)

    if bad_elements:
        errors.append(f"Hay elementos con nodos inexistentes o inválidos: {bad_elements}")

    return {
        "status": "ERROR" if errors else ("WARNING" if warnings else "OK"),
        "errors": errors,
        "warnings": warnings,
        "counts": {
            "nodes": len(nodes) if isinstance(nodes, list) else 0,
            "elements": len(elements) if isinstance(elements, list) else 0,
            "supports": len(supports) if isinstance(supports, list) else 0,
            "loads": len(loads) if isinstance(loads, list) else 0,
            "load_patterns": len(load_patterns) if isinstance(load_patterns, list) else 0,
        },
    }

def _b10_19_validate_output_results(results: dict) -> dict:
    errors = []
    warnings = []

    etabs_results = results.get("etabs_results") or {}
    tables = etabs_results.get("tables") or {}

    animation = results.get("seismic_animation") or {}
    animation_quality = animation.get("animation_quality") or {}

    required_tables = [
        "modal_periods",
        "base_shear",
        "load_summary",
        "applied_loads",
        "story_drifts",
        "story_shears",
        "mass_source",
        "effective_mass",
        "model_quality",
        "element_properties",
    ]

    missing_tables = [
        table for table in required_tables
        if table not in tables
    ]

    if missing_tables:
        warnings.append(f"Faltan tablas tipo ETABS: {missing_tables}")

    if not animation:
        errors.append("No se generó seismic_animation.")

    if animation and animation_quality.get("ready_for_animation") is not True:
        warnings.append("El payload de animación existe, pero no está marcado como ready_for_animation.")

    if len(animation.get("nodes", []) or []) == 0:
        errors.append("El payload de animación no tiene nodos.")

    if len(animation.get("elements", []) or []) == 0:
        errors.append("El payload de animación no tiene elementos.")

    if len(animation.get("modes", []) or []) == 0:
        errors.append("El payload de animación no tiene modos útiles.")

    total_mass = _b10_19_total_effective_mass(results)

    if total_mass <= 0:
        errors.append("La masa efectiva total es cero o inválida.")

    return {
        "status": "ERROR" if errors else ("WARNING" if warnings else "OK"),
        "errors": errors,
        "warnings": warnings,
        "checks": {
            "has_etabs_results": bool(etabs_results),
            "has_animation_payload": bool(animation),
            "ready_for_animation": animation_quality.get("ready_for_animation") is True,
            "usable_modes": animation_quality.get("usable_modes", 0),
            "total_effective_mass": total_mass,
            "tables_count": len(tables),
        },
    }

def _b10_19_build_backend_health(data: dict, results: dict) -> dict:
    input_validation = _b10_19_validate_input_payload(data)
    output_validation = _b10_19_validate_output_results(results)

    errors = []
    warnings = []

    errors.extend(input_validation.get("errors", []) or [])
    errors.extend(output_validation.get("errors", []) or [])

    warnings.extend(input_validation.get("warnings", []) or [])
    warnings.extend(output_validation.get("warnings", []) or [])

    status = "OK"

    if errors:
        status = "ERROR"
    elif warnings:
        status = "WARNING"

    animation = results.get("seismic_animation") or {}
    quality = animation.get("animation_quality") or {}

    ready_for_delivery = (
        status != "ERROR"
        and quality.get("ready_for_animation") is True
        and len(animation.get("nodes", []) or []) > 0
        and len(animation.get("elements", []) or []) > 0
        and len(animation.get("modes", []) or []) > 0
    )

    return {
        "type": "jhack_backend_health",
        "version": "B10.19",
        "status": status,
        "ready_for_delivery": ready_for_delivery,
        "errors": errors,
        "warnings": warnings,
        "input": input_validation,
        "output": output_validation,
    }

def _build_etabs_results_package(results: dict) -> dict:
    """
    Paquete final de resultados tipo ETABS.
    No calcula de nuevo: solo ordena resultados reales del Motor A.
    """
    tables = {
        "modal_periods": _b7_table_modal_periods(results),
        "participating_mass_ratios": _b7_table_participating_mass(results),
        "base_shear": _b7_table_base_shear(results),
        "story_drifts": _b7_table_story_drifts(results),
        "story_shears": _b7_table_story_shears(results),
        "mass_source": _b7_table_mass_source(results),
        "effective_mass": _b7_table_effective_mass(results),
        "joint_reactions": _b7_table_joint_reactions(results),
        "story_accelerations": _b7_table_story_accelerations(results),
        "diaphragm_summary": _b7_table_diaphragm_summary(results),
        # Centers of Mass and Rigidity (ETABS: Analysis Results > Structure
        # Output > Other Output Items). XCR/YCR aún no se calculan (vacíos).
        "centers_of_mass_rigidity": results.get("centers_of_mass_rigidity", []),
        # B10.14 — Applied Loads
        "load_summary": results.get("load_summary_table", []),
        "applied_loads": (results.get("applied_load_tables") or {}).get(
            "applied_loads", []
        ),
        "joint_loads": (results.get("applied_load_tables") or {}).get(
            "joint_loads", []
        ),
        "frame_loads": (results.get("applied_load_tables") or {}).get(
            "frame_loads", []
        ),
        "equivalent_joint_loads": (results.get("applied_load_tables") or {}).get(
            "equivalent_joint_loads", []
        ),
        "model_quality": (results.get("model_quality") or {}).get("quality_rows", []),
        "element_properties": (results.get("model_quality") or {}).get(
            "element_property_rows", []
        ),
    }

    return {
        "type": "etabs_results_package",
        "version": "B7",
        "status": "ok" if results.get("success", True) else "error",
        "generated_at": _b7_now_iso(),
        "summary": _b7_build_summary(results),
        "tables": tables,
    }

def _b10_float(value, fallback=None):
    try:
        number = float(value)
        return number if number == number else fallback
    except Exception:
        return fallback

def _b10_has_any_key(obj: dict, keys: list[str]) -> bool:
    if not isinstance(obj, dict):
        return False

    return any(key in obj and obj.get(key) not in [None, ""] for key in keys)

def _b10_get_element_property(elem: dict, keys: list[str], default_value=None):
    if not isinstance(elem, dict):
        return default_value, False

    for key in keys:
        if key in elem and elem.get(key) not in [None, ""]:
            return elem.get(key), True

    section = (
        elem.get("section") or elem.get("frameSection") or elem.get("sectionData") or {}
    )

    if isinstance(section, dict):
        for key in keys:
            if key in section and section.get(key) not in [None, ""]:
                return section.get(key), True

    material = (
        elem.get("material")
        or elem.get("frameMaterial")
        or elem.get("materialData")
        or {}
    )

    if isinstance(material, dict):
        for key in keys:
            if key in material and material.get(key) not in [None, ""]:
                return material.get(key), True

    return default_value, False

def _b10_default_load_pattern_from_payload(data: dict) -> str:
    """
    Devuelve patrón gravitacional por defecto.
    Prioriza Mass Source y Load Patterns explícitos.
    """
    mass_source = data.get("massSource") or data.get("mass_source") or {}
    raw_patterns = []

    if isinstance(mass_source, dict):
        raw_patterns.extend(
            mass_source.get("loadPatterns")
            or mass_source.get("load_patterns")
            or mass_source.get("loadMultipliers")
            or []
        )

    raw_patterns.extend(data.get("loadPatterns") or data.get("load_patterns") or [])

    for item in raw_patterns:
        if not isinstance(item, dict):
            continue

        name = str(
            item.get("name") or item.get("loadCase") or item.get("pattern") or ""
        ).strip()

        if not name:
            continue

        upper = name.upper()

        if "DEAD" in upper or upper in ["D", "CM", "CARGA MUERTA"]:
            return name

    for item in raw_patterns:
        if not isinstance(item, dict):
            continue

        name = str(
            item.get("name") or item.get("loadCase") or item.get("pattern") or ""
        ).strip()

        if name:
            return name

    return "DEAD"

def _b10_detect_load_patterns(data: dict) -> list[dict]:
    loads = data.get("loads") or []
    detected = {}

    fallback_pattern = _b10_default_load_pattern_from_payload(data)

    for load in loads:
        if not isinstance(load, dict):
            continue

        name = (
            load.get("loadCase")
            or load.get("load_case")
            or load.get("case")
            or load.get("pattern")
            or load.get("loadPattern")
            or load.get("load_pattern")
            or load.get("name")
            or ""
        )

        name = str(name).strip()

        if not name or name.upper() in ["UNKNOWN", "UNDEFINED", "NULL", "NONE"]:
            name = fallback_pattern

        if name not in detected:
            detected[name] = {
                "name": name,
                "type": (
                    load.get("type")
                    or load.get("loadType")
                    or load.get("load_type")
                    or ""
                ),
                "count": 0,
                "sum_abs_fz_N": 0.0,
            }

        detected[name]["count"] += 1

        fz = _b10_float(load.get("fz", load.get("FZ", load.get("p", 0.0))), 0.0)
        detected[name]["sum_abs_fz_N"] += abs(fz or 0.0)

    # Si no hay cargas, igual reportamos patrones definidos para no dejar UNKNOWN.
    if not detected:
        for item in data.get("loadPatterns") or data.get("load_patterns") or []:
            if not isinstance(item, dict):
                continue

            name = str(
                item.get("name") or item.get("loadCase") or item.get("pattern") or ""
            ).strip()

            if not name:
                continue

            detected[name] = {
                "name": name,
                "type": item.get("type") or "",
                "count": 0,
                "sum_abs_fz_N": 0.0,
            }

    return list(detected.values())

def _b10_audit_elements(elements: list) -> dict:
    rows = []

    counters = {
        "total": len(elements or []),
        "area_real": 0,
        "area_default": 0,
        "E_real": 0,
        "E_default": 0,
        "G_real": 0,
        "G_default": 0,
        "Iy_real": 0,
        "Iy_default": 0,
        "Iz_real": 0,
        "Iz_default": 0,
        "J_real": 0,
        "J_default": 0,
        "unit_weight_real": 0,
        "unit_weight_default": 0,
    }

    for elem in elements or []:
        eid = elem.get("id")

        area, has_area = _b10_get_element_property(
            elem,
            ["A", "area", "_A", "sectionArea"],
            0.01,
        )

        E, has_E = _b10_get_element_property(
            elem,
            ["E", "young", "elasticModulus", "modulusElasticity"],
            200e9,
        )

        G, has_G = _b10_get_element_property(
            elem,
            ["G", "shear", "shearModulus"],
            77e9,
        )

        Iy, has_Iy = _b10_get_element_property(
            elem,
            ["Iy", "I22", "inertiaY"],
            1e-4,
        )

        Iz, has_Iz = _b10_get_element_property(
            elem,
            ["Iz", "I33", "inertiaZ"],
            1e-4,
        )

        J, has_J = _b10_get_element_property(
            elem,
            ["J", "torsion", "torsionalConstant"],
            1e-6,
        )

        unit_weight, has_unit_weight = _b10_get_element_property(
            elem,
            [
                "unitWeight",
                "unit_weight",
                "unitWeightNPerM3",
                "gamma",
                "specificWeight",
                "pesoEspecifico",
                "materialUnitWeight",
            ],
            24000.0,
        )

        counters["area_real" if has_area else "area_default"] += 1
        counters["E_real" if has_E else "E_default"] += 1
        counters["G_real" if has_G else "G_default"] += 1
        counters["Iy_real" if has_Iy else "Iy_default"] += 1
        counters["Iz_real" if has_Iz else "Iz_default"] += 1
        counters["J_real" if has_J else "J_default"] += 1
        counters["unit_weight_real" if has_unit_weight else "unit_weight_default"] += 1

        rows.append(
            {
                "element": eid,
                "node_i": elem.get("node_i"),
                "node_j": elem.get("node_j"),
                "area": _b10_float(area, 0.0),
                "area_source": "real" if has_area else "default",
                "E": _b10_float(E, 0.0),
                "E_source": "real" if has_E else "default",
                "G": _b10_float(G, 0.0),
                "G_source": "real" if has_G else "default",
                "Iy": _b10_float(Iy, 0.0),
                "Iy_source": "real" if has_Iy else "default",
                "Iz": _b10_float(Iz, 0.0),
                "Iz_source": "real" if has_Iz else "default",
                "J": _b10_float(J, 0.0),
                "J_source": "real" if has_J else "default",
                "unit_weight_N_m3": _b10_float(unit_weight, 0.0),
                "unit_weight_source": "real" if has_unit_weight else "default",
                "E_raw": elem.get("_E_raw", E),
                "E_used_pa": _b10_float(elem.get("_E_used_pa", E), 0.0),
                "E_unit_source": elem.get("_E_unit_source", "pa"),
                "G_raw": elem.get("_G_raw", G),
                "G_used_pa": _b10_float(elem.get("_G_used_pa", G), 0.0),
                "G_unit_source": elem.get("_G_unit_source", "pa"),
                "unit_weight_raw": elem.get("_unit_weight_raw", unit_weight),
                "unit_weight_used_N_m3": _b10_float(
                    elem.get("_unit_weight_used_n_m3", unit_weight), 0.0
                ),
                "unit_weight_unit_source": elem.get("_unit_weight_unit_source", "n_m3"),
            }
        )

    return {
        "rows": rows,
        "counters": counters,
    }

def _b10_build_model_quality_report(data: dict, results: dict) -> dict:
    nodes = data.get("nodes") or []
    elements = data.get("elements") or []
    supports = data.get("supports") or []

    mass_source = results.get("mass_source") or {}
    effective_mass = results.get("effective_mass") or {}
    model_constraints = results.get("model_constraints") or {}

    element_audit = _b10_audit_elements(elements)
    load_patterns = _b10_detect_load_patterns(data)

    counters = element_audit["counters"]

    warnings = []

    if counters["area_default"] > 0:
        warnings.append(f"{counters['area_default']} elementos usan área por defecto.")

    if counters["E_default"] > 0:
        warnings.append(f"{counters['E_default']} elementos usan E por defecto.")

    if counters["Iy_default"] > 0 or counters["Iz_default"] > 0:
        warnings.append("Hay elementos usando inercias por defecto.")

    if counters["unit_weight_default"] > 0:
        warnings.append(
            f"{counters['unit_weight_default']} elementos usan peso específico por defecto."
        )

    if not supports:
        warnings.append(
            "El payload no trae apoyos explícitos. Se puede estar usando base automática."
        )

    if not mass_source.get("enabled"):
        warnings.append("Mass Source no está activo.")

    if not load_patterns:
        warnings.append("No se detectaron cargas nodales DEAD/LIVE en el payload.")

    effective_summary = effective_mass.get("summary") or {}

    if _b10_float(effective_summary.get("total_effective_mx"), 0.0) <= 0:
        warnings.append("La masa efectiva X total es cero o no fue detectada.")

    if _b10_float(effective_summary.get("total_effective_my"), 0.0) <= 0:
        warnings.append("La masa efectiva Y total es cero o no fue detectada.")

    diaphragm_report = model_constraints.get("rigid_diaphragms") or {}
    diaphragm_count = len(diaphragm_report.get("applied", []) or [])

    if diaphragm_count == 0:
        warnings.append("No se aplicó ningún diafragma rígido.")

    quality_rows = [
        {
            "item": "Nodes",
            "value": len(nodes),
            "status": "OK" if len(nodes) > 0 else "WARNING",
            "detail": "Nodos del modelo.",
        },
        {
            "item": "Elements",
            "value": len(elements),
            "status": "OK" if len(elements) > 0 else "WARNING",
            "detail": "Elementos frame del modelo.",
        },
        {
            "item": "Supports",
            "value": len(supports),
            "status": "OK" if len(supports) > 0 else "WARNING",
            "detail": "Apoyos explícitos del payload.",
        },
        {
            "item": "Rigid Diaphragms Applied",
            "value": diaphragm_count,
            "status": "OK" if diaphragm_count > 0 else "WARNING",
            "detail": "Diafragmas rígidos aplicados por piso.",
        },
        {
            "item": "Mass Source Enabled",
            "value": bool(mass_source.get("enabled")),
            "status": "OK" if mass_source.get("enabled") else "WARNING",
            "detail": "Fuente de masa sísmica.",
        },
        {
            "item": "Total Effective Mass X",
            "value": _b10_float(effective_summary.get("total_effective_mx"), 0.0),
            "status": (
                "OK"
                if _b10_float(effective_summary.get("total_effective_mx"), 0.0) > 0
                else "WARNING"
            ),
            "detail": "Masa efectiva total en X.",
        },
        {
            "item": "Total Effective Mass Y",
            "value": _b10_float(effective_summary.get("total_effective_my"), 0.0),
            "status": (
                "OK"
                if _b10_float(effective_summary.get("total_effective_my"), 0.0) > 0
                else "WARNING"
            ),
            "detail": "Masa efectiva total en Y.",
        },
        {
            "item": "Elements With Real Area",
            "value": counters["area_real"],
            "status": "OK" if counters["area_default"] == 0 else "WARNING",
            "detail": f"{counters['area_default']} elementos usan área por defecto.",
        },
        {
            "item": "Elements With Real E",
            "value": counters["E_real"],
            "status": "OK" if counters["E_default"] == 0 else "WARNING",
            "detail": f"{counters['E_default']} elementos usan E por defecto.",
        },
        {
            "item": "Elements With Real Inertia",
            "value": min(counters["Iy_real"], counters["Iz_real"]),
            "status": (
                "OK"
                if counters["Iy_default"] == 0 and counters["Iz_default"] == 0
                else "WARNING"
            ),
            "detail": f"Iy default: {counters['Iy_default']}, Iz default: {counters['Iz_default']}.",
        },
        {
            "item": "Elements With Real Unit Weight",
            "value": counters["unit_weight_real"],
            "status": "OK" if counters["unit_weight_default"] == 0 else "WARNING",
            "detail": f"{counters['unit_weight_default']} elementos usan peso específico por defecto.",
        },
        {
            "item": "Load Patterns Detected",
            "value": len(load_patterns),
            "status": "OK" if len(load_patterns) > 0 else "WARNING",
            "detail": (
                ", ".join([item["name"] for item in load_patterns])
                if load_patterns
                else "No hay cargas detectadas."
            ),
        },
    ]

    overall_status = "OK" if not warnings else "WARNING"

    return {
        "status": overall_status,
        "warnings": warnings,
        "quality_rows": quality_rows,
        "element_property_rows": element_audit["rows"],
        "load_patterns": load_patterns,
        "counters": counters,
    }
