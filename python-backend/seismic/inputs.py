"""seismic.inputs — ENTRADAS: parseo de espectros, soportes, diafragmas, fuente de masa, normalización de unidades y construcción del modelo OpenSees."""

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

__all__ = [
    "_add_auto_mass_to_node",
    "_apply_equaldof_diaphragm",
    "_apply_rigid_diaphragms",
    "_auto_vecxz",
    "_b10_14_load_case",
    "_beam_self_weight_length",
    "_build_column_depth_map",
    "_build_diaphragm_groups",
    "_build_mass_source_nodal_masses",
    "_canonical_load_pattern_name",
    "_choose_diaphragm_retained_node",
    "_data_wants_rigid_diaphragm_rotation",
    "_data_wants_rigid_diaphragms",
    "_distribute_element_mass_to_nodes",
    "_element_area_for_mass_source",
    "_element_length_for_mass_source",
    "_element_unit_weight_for_mass_source",
    "_extract_node_ids_from_group",
    "_get_base_shear_value",
    "_get_mass_source_from_payload",
    "_get_node_id_from_support",
    "_node_xyz_for_mass_source",
    "_normalize_modulus_to_pa",
    "_normalize_unit_weight_to_n_m3",
    "_parse_spectrum_excel",
    "_parse_spectrum_text",
    "_support_node_ids_from_payload",
    "_support_node_ids_or_base_nodes",
    "build_model_3d",
    "parse_spectrum_file",
]


def parse_spectrum_file(file_bytes: bytes, filename: str) -> list[tuple[float, float]]:
    """
    Lee un archivo de espectro de respuesta.

    Formatos soportados:
      - TXT / CSV: dos columnas, separador auto-detectado (espacio, coma, punto y coma, tab)
      - XLS / XLSX: primera hoja, columnas A y B (puede tener encabezado)

    Retorna lista ordenada [(T_s, Sa_g_o_m/s2), ...]
    La unidad de Sa se conserva tal como viene; el caller decide si es g o m/s².
    """
    ext = filename.rsplit(".", 1)[-1].lower()

    if ext in ("xls", "xlsx"):
        return _parse_spectrum_excel(file_bytes, ext)
    else:
        return _parse_spectrum_text(file_bytes)

def _parse_spectrum_text(file_bytes: bytes) -> list[tuple[float, float]]:
    """Parsea TXT / CSV con auto-detección de separador y salto de encabezado."""
    try:
        text = file_bytes.decode("utf-8", errors="replace")
    except Exception:
        text = file_bytes.decode("latin-1", errors="replace")

    rows = []
    for line in text.splitlines():
        line = line.strip()
        # Ignorar comentarios y líneas vacías
        if (
            not line
            or line.startswith("#")
            or line.startswith("//")
            or line.startswith("%")
        ):
            continue
        # Auto-detectar separador
        for sep in (",", ";", "\t", " "):
            parts = [p.strip() for p in line.split(sep) if p.strip()]
            if len(parts) >= 2:
                try:
                    t = float(parts[0].replace(",", "."))
                    sa = float(parts[1].replace(",", "."))
                    rows.append((t, sa))
                    break
                except ValueError:
                    continue  # probablemente encabezado → saltar

    if not rows:
        raise ValueError("No se encontraron datos numéricos en el archivo de espectro.")

    rows.sort(key=lambda r: r[0])
    return rows

def _parse_spectrum_excel(file_bytes: bytes, ext: str) -> list[tuple[float, float]]:
    """Parsea XLS/XLSX usando openpyxl (xlsx) o xlrd (xls)."""
    try:
        import openpyxl

        wb = openpyxl.load_workbook(io.BytesIO(file_bytes), data_only=True)
        ws = wb.active
        rows = []
        for row in ws.iter_rows(min_row=1, values_only=True):
            if row[0] is None or row[1] is None:
                continue
            try:
                t = float(row[0])
                sa = float(row[1])
                rows.append((t, sa))
            except (TypeError, ValueError):
                continue  # encabezado u otro texto
        if not rows:
            raise ValueError("Excel vacío o sin datos numéricos en columnas A y B.")
        rows.sort(key=lambda r: r[0])
        return rows
    except ImportError:
        raise ImportError("openpyxl no instalado. Instala con: pip install openpyxl")

def _get_node_id_from_support(support: dict):
    raw_id = (
        support.get("node")
        or support.get("nodeId")
        or support.get("node_id")
        or support.get("id")
    )

    try:
        return int(raw_id)
    except Exception:
        return None

def _support_node_ids_from_payload(supports: list) -> set[int]:
    support_ids = set()

    for support in supports or []:
        if not isinstance(support, dict):
            continue

        node_id = _get_node_id_from_support(support)

        if node_id is not None:
            support_ids.add(node_id)

    return support_ids

def _support_node_ids_or_base_nodes(
    nodes: list, supports: list, z_tolerance: float = 0.05
) -> set[int]:
    """
    Si el payload trae supports, usa esos nodos.
    Si no trae supports, asume que la base es el menor Z.
    """
    support_ids = _support_node_ids_from_payload(supports)

    if support_ids:
        return support_ids

    if not nodes:
        return set()

    min_z = min(_ms_float(node.get("z"), 0.0) for node in nodes)

    base_ids = set()

    for node in nodes:
        try:
            node_id = int(node.get("id"))
            z = _ms_float(node.get("z"), 0.0)

            if abs(z - min_z) <= z_tolerance:
                base_ids.add(node_id)
        except Exception:
            continue

    return base_ids

def _data_wants_rigid_diaphragms(data: dict) -> bool:
    analysis = (
        data.get("analysis")
        or data.get("options")
        or data.get("analysis_options")
        or {}
    )

    keys = [
        "useRigidDiaphragms",
        "use_rigid_diaphragms",
        "rigidDiaphragm",
        "rigid_diaphragm",
        "rigidDiaphragms",
        "rigid_diaphragms",
    ]

    for key in keys:
        if key in data:
            return _as_bool(data.get(key), False)
        if isinstance(analysis, dict) and key in analysis:
            return _as_bool(analysis.get(key), False)

    diaphragms = data.get("diaphragms") or data.get("diaphragm_groups") or []

    return isinstance(diaphragms, list) and len(diaphragms) > 0

def _extract_node_ids_from_group(group) -> list[int]:
    if not isinstance(group, dict):
        return []

    raw_nodes = (
        group.get("nodeIds")
        or group.get("node_ids")
        or group.get("nodes")
        or group.get("jointIds")
        or group.get("joint_ids")
        or []
    )

    node_ids = []

    for item in raw_nodes:
        try:
            if isinstance(item, dict):
                raw_id = item.get("id") or item.get("node") or item.get("nodeId")
            else:
                raw_id = item

            node_ids.append(int(raw_id))
        except Exception:
            continue

    return sorted(set(node_ids))

def _choose_diaphragm_retained_node(node_ids: list[int], node_by_id: dict):
    if not node_ids:
        return None

    if len(node_ids) == 1:
        return node_ids[0]

    xs = []
    ys = []

    for nid in node_ids:
        node = node_by_id.get(int(nid))

        if not node:
            continue

        xs.append(_ms_float(node.get("x"), 0.0))
        ys.append(_ms_float(node.get("y"), 0.0))

    if not xs or not ys:
        return node_ids[0]

    cx = sum(xs) / len(xs)
    cy = sum(ys) / len(ys)

    def distance_to_centroid(nid):
        node = node_by_id.get(int(nid), {})
        dx = _ms_float(node.get("x"), 0.0) - cx
        dy = _ms_float(node.get("y"), 0.0) - cy
        return dx * dx + dy * dy

    return min(node_ids, key=distance_to_centroid)

def _build_diaphragm_groups(
    data: dict, nodes: list, supports: list, z_tolerance: float = 0.05
) -> list[dict]:
    node_by_id = {int(n["id"]): n for n in nodes}
    valid_node_ids = set(node_by_id.keys())
    support_node_ids = _support_node_ids_or_base_nodes(nodes, supports, z_tolerance)

    explicit_groups = data.get("diaphragms") or data.get("diaphragm_groups") or []
    groups = []

    if isinstance(explicit_groups, list) and explicit_groups:
        for index, group in enumerate(explicit_groups):
            node_ids = _extract_node_ids_from_group(group)

            node_ids = [
                int(nid)
                for nid in node_ids
                if int(nid) in valid_node_ids and int(nid) not in support_node_ids
            ]

            if len(node_ids) < 2:
                continue

            groups.append(
                {
                    "id": str(group.get("id") or group.get("name") or f"D{index + 1}"),
                    "source": "payload",
                    "node_ids": sorted(set(node_ids)),
                }
            )

        return groups

    if not _data_wants_rigid_diaphragms(data):
        return []

    if not nodes:
        return []

    min_z = min(_ms_float(n.get("z"), 0.0) for n in nodes)

    z_groups = []

    for node in nodes:
        try:
            nid = int(node["id"])
            z = _ms_float(node.get("z"), 0.0)
        except Exception:
            continue

        if abs(z - min_z) <= z_tolerance:
            continue

        if nid in support_node_ids:
            continue

        matched = None

        for group in z_groups:
            if abs(group["z"] - z) <= z_tolerance:
                matched = group
                break

        if matched is None:
            matched = {
                "id": f"D_Z_{len(z_groups) + 1}",
                "source": "auto_by_z",
                "z": z,
                "node_ids": [],
            }
            z_groups.append(matched)

        matched["node_ids"].append(nid)

    for group in z_groups:
        node_ids = sorted(set(group["node_ids"]))

        if len(node_ids) >= 2:
            groups.append(
                {
                    "id": group["id"],
                    "source": group["source"],
                    "z": group.get("z"),
                    "node_ids": node_ids,
                }
            )

    return groups

def _data_wants_rigid_diaphragm_rotation(data: dict) -> bool:
    """
    Opt-in al diafragma rígido CON rotación (ops.rigidDiaphragm, amarra UX+UY+RZ).

    DEFAULT = False → se usa equalDOF(UX,UY). Motivo: rigidDiaphragm introduce el
    acoplamiento torsión-traslación real, pero con la masa repartida por nodo la
    torsión queda demasiado flexible y casi degenerada con el modo X, lo que
    amplifica la deriva X y la aleja de ETABS (que tiene la torsión más rígida y
    separada). equalDOF reproduce mejor las derivas/cortantes de diseño de ETABS.
    Se deja como opt-in para estudiar torsión cuando se calibre la rigidez torsional.
    """
    analysis = (
        data.get("analysis")
        or data.get("options")
        or data.get("analysis_options")
        or {}
    )
    for key in (
        "rigidDiaphragmRotation",
        "rigid_diaphragm_rotation",
        "fullRigidDiaphragm",
        "useRigidDiaphragmRZ",
    ):
        if key in data:
            return _as_bool(data.get(key), False)
        if isinstance(analysis, dict) and key in analysis:
            return _as_bool(analysis.get(key), False)
    return False

def _apply_equaldof_diaphragm(retained: int, constrained: list) -> list:
    """Amarra UX/UY de los esclavos al maestro (sin RZ → no captura torsión)."""
    applied = []
    for slave in constrained:
        ops.equalDOF(int(retained), int(slave), 1, 2)
        applied.append(int(slave))
    return applied

def _apply_rigid_diaphragms(data: dict, nodes: list, supports: list) -> dict:
    """
    Diafragma rígido por piso.

    Método principal: ops.rigidDiaphragm(perpDirn=3, maestro, *esclavos), que
    amarra UX, UY y RZ como cuerpo rígido en el plano XY → reproduce la rigidez
    torsional (modo de torsión), a diferencia de equalDOF(1,2) que solo igualaba
    UX/UY y mataba la rotación.

    DEFAULT = equalDOF(UX,UY). rigidDiaphragm (con rotación RZ) es OPT-IN vía el
    flag `rigidDiaphragmRotation` en el payload, porque introduce acoplamiento
    torsión-traslación que con la masa por nodo deja la torsión casi degenerada
    con el modo X y amplifica la deriva X fuera de ETABS. Si rigidDiaphragm falla
    en un grupo, cae automáticamente a equalDOF para ese grupo.
    """
    report = {
        "requested": _data_wants_rigid_diaphragms(data),
        "applied": [],
        "skipped": [],
        "errors": [],
    }

    if ops is None:
        report["errors"].append("OpenSeesPy no está disponible.")
        return report

    groups = _build_diaphragm_groups(data, nodes, supports)

    if not groups:
        report["skipped"].append("No hay grupos de diafragma válidos.")
        return report

    node_by_id = {int(n["id"]): n for n in nodes}
    use_rigid_rotation = _data_wants_rigid_diaphragm_rotation(data)

    for group in groups:
        node_ids = group.get("node_ids", [])

        if len(node_ids) < 2:
            report["skipped"].append(
                {
                    "id": group.get("id"),
                    "reason": "Menos de 2 nodos válidos.",
                }
            )
            continue

        retained = _choose_diaphragm_retained_node(node_ids, node_by_id)

        if retained is None:
            report["skipped"].append(
                {
                    "id": group.get("id"),
                    "reason": "No se pudo elegir nodo maestro.",
                }
            )
            continue

        constrained = [int(nid) for nid in node_ids if int(nid) != int(retained)]

        if not constrained:
            report["skipped"].append(
                {
                    "id": group.get("id"),
                    "reason": "No hay nodos esclavos.",
                }
            )
            continue

        method = None
        applied_slaves = []
        fallback_reason = None

        if use_rigid_rotation:
            try:
                # perpDirn=3 → plano del diafragma = XY (normal Z).
                # Amarra UX, UY y RZ como cuerpo rígido.
                ops.rigidDiaphragm(3, int(retained), *[int(s) for s in constrained])
                method = "rigidDiaphragm_z"
                applied_slaves = [int(s) for s in constrained]
            except Exception as error:
                fallback_reason = str(error)
                method = None

        if method is None:
            try:
                applied_slaves = _apply_equaldof_diaphragm(retained, constrained)
                method = (
                    "equalDOF_ux_uy_fallback"
                    if use_rigid_rotation
                    else "equalDOF_ux_uy"
                )
                if fallback_reason:
                    report["errors"].append(
                        {
                            "id": group.get("id"),
                            "method": "rigidDiaphragm_z",
                            "message": fallback_reason,
                            "recovered_with": "equalDOF_ux_uy",
                        }
                    )
            except Exception as error:
                report["errors"].append(
                    {
                        "id": group.get("id"),
                        "method": "equalDOF_ux_uy",
                        "message": str(error),
                    }
                )
                continue

        report["applied"].append(
            {
                "id": group.get("id"),
                "source": group.get("source"),
                "method": method,
                "retained": int(retained),
                "constrained": applied_slaves,
                "node_ids": node_ids,
                "count": len(node_ids),
            }
        )

    return report

def _get_mass_source_from_payload(data: dict) -> dict:
    raw = data.get("massSource") or data.get("mass_source") or {}

    if not isinstance(raw, dict):
        raw = {}

    raw_patterns = (
        raw.get("loadPatterns")
        or raw.get("load_patterns")
        or raw.get("loadMultipliers")
        or raw.get("load_multipliers")
        or []
    )

    load_patterns = []

    if isinstance(raw_patterns, list):
        for item in raw_patterns:
            if not isinstance(item, dict):
                continue

            name = (
                item.get("name")
                or item.get("loadCase")
                or item.get("load_case")
                or item.get("case")
                or item.get("pattern")
                or item.get("load")
                or ""
            )

            name = str(name).strip()

            if not name:
                continue

            factor = _ms_float(
                item.get(
                    "factor", item.get("multiplier", item.get("scaleFactor", 0.0))
                ),
                0.0,
            )

            load_patterns.append(
                {
                    "name": name,
                    "type": item.get("type") or item.get("loadType") or "Other",
                    "factor": factor,
                }
            )

    gravity = _ms_float(raw.get("gravity", raw.get("g", data.get("g", 9.81))), 9.81)

    if gravity <= 0:
        gravity = 9.81

    return {
        "enabled": _as_bool(raw.get("enabled"), False),
        "name": raw.get("name") or "MASS_SOURCE_1",
        "include_self_weight": _as_bool(
            raw.get("includeSelfWeight", raw.get("include_self_weight")),
            True,
        ),
        "self_weight_multiplier": _ms_float(
            raw.get("selfWeightMultiplier", raw.get("self_weight_multiplier", 1.0)),
            1.0,
        ),
        "load_patterns": load_patterns,
        "convert_weight_to_mass": _as_bool(
            raw.get("convertWeightToMass", raw.get("convert_weight_to_mass")),
            True,
        ),
        "gravity": gravity,
        "default_unit_weight": _ms_float(
            raw.get("defaultUnitWeight", raw.get("default_unit_weight", 24000.0)),
            24000.0,
        ),
        "distribute_to_story_nodes": _as_bool(
            raw.get("distributeToStoryNodes", raw.get("distribute_to_story_nodes")),
            True,
        ),
    }

def _node_xyz_for_mass_source(node: dict) -> tuple[float, float, float]:
    return (
        _ms_float(node.get("x"), 0.0),
        _ms_float(node.get("y"), 0.0),
        _ms_float(node.get("z"), 0.0),
    )

def _element_length_for_mass_source(elem: dict, node_by_id: dict) -> float:
    try:
        ni = int(elem.get("node_i"))
        nj = int(elem.get("node_j"))

        node_i = node_by_id.get(ni)
        node_j = node_by_id.get(nj)

        if not node_i or not node_j:
            return 0.0

        xi, yi, zi = _node_xyz_for_mass_source(node_i)
        xj, yj, zj = _node_xyz_for_mass_source(node_j)

        dx = xj - xi
        dy = yj - yi
        dz = zj - zi

        return float((dx * dx + dy * dy + dz * dz) ** 0.5)
    except Exception:
        return 0.0

def _element_area_for_mass_source(elem: dict) -> float:
    return max(
        _ms_float(
            elem.get("A", elem.get("area", elem.get("_A", 0.01))),
            0.01,
        ),
        0.0,
    )

def _build_column_depth_map(elements: list, node_by_id: dict) -> dict:
    """Mapa nodo → peralte equivalente de columna (m) para la longitud libre.

    Recorre los elementos VERTICALES (columnas) y, en cada nudo extremo,
    registra su dimensión equivalente en planta = √A (lado del cuadrado de
    igual área; exacto para columnas cuadradas, buena aprox. para rectangulares
    y agnóstico a b/h). Un nudo con varias columnas conserva la mayor.
    """
    depth = {}
    for elem in elements or []:
        try:
            ni = int(elem.get("node_i"))
            nj = int(elem.get("node_j"))
            node_i = node_by_id.get(ni)
            node_j = node_by_id.get(nj)
            if not node_i or not node_j:
                continue
            xi, yi, zi = _node_xyz_for_mass_source(node_i)
            xj, yj, zj = _node_xyz_for_mass_source(node_j)
            dz = abs(zj - zi)
            horiz = ((xj - xi) ** 2 + (yj - yi) ** 2) ** 0.5
            # Columna = predominantemente vertical.
            if dz <= 1e-6 or dz < horiz:
                continue
            side = _element_area_for_mass_source(elem) ** 0.5
            for nid in (ni, nj):
                if side > depth.get(nid, 0.0):
                    depth[nid] = side
        except Exception:
            continue
    return depth

def _beam_self_weight_length(elem: dict, node_by_id: dict, col_depth: dict) -> float:
    """Longitud para el PESO PROPIO de una viga = longitud libre (centerline
    menos medio peralte de columna en cada extremo apoyado en columna), como
    ETABS. En columnas devuelve la longitud centerline (sin descuento).
    Solo afecta la MASA; la rigidez sigue centerline (ETABS Rigid-zone=0).
    """
    length = _element_length_for_mass_source(elem, node_by_id)
    if length <= 0:
        return length

    try:
        ni = int(elem.get("node_i"))
        nj = int(elem.get("node_j"))
        node_i = node_by_id.get(ni)
        node_j = node_by_id.get(nj)
        xi, yi, zi = _node_xyz_for_mass_source(node_i)
        xj, yj, zj = _node_xyz_for_mass_source(node_j)
        if abs(zj - zi) > ((xj - xi) ** 2 + (yj - yi) ** 2) ** 0.5:
            return length  # columna: sin descuento
        deduction = 0.5 * col_depth.get(ni, 0.0) + 0.5 * col_depth.get(nj, 0.0)
        return max(length - deduction, 0.1 * length)
    except Exception:
        return length

def _element_unit_weight_for_mass_source(elem: dict, mass_source: dict) -> float:
    candidates = [
        elem.get("unitWeight"),
        elem.get("unit_weight"),
        elem.get("unitWeightNPerM3"),
        elem.get("gamma"),
        elem.get("specificWeight"),
        elem.get("pesoEspecifico"),
        elem.get("materialUnitWeight"),
    ]

    material = elem.get("material") or elem.get("frameMaterial") or {}
    section = elem.get("section") or elem.get("frameSection") or {}

    if isinstance(material, dict):
        candidates.extend(
            [
                material.get("unitWeight"),
                material.get("unit_weight"),
                material.get("unitWeightNPerM3"),
                material.get("gamma"),
                material.get("specificWeight"),
                material.get("pesoEspecifico"),
                material.get("materialUnitWeight"),
            ]
        )

    if isinstance(section, dict):
        candidates.extend(
            [
                section.get("unitWeight"),
                section.get("unit_weight"),
                section.get("unitWeightNPerM3"),
                section.get("gamma"),
                section.get("specificWeight"),
                section.get("pesoEspecifico"),
                section.get("materialUnitWeight"),
            ]
        )

    for value in candidates:
        number = _ms_float(value, None)

        if number is not None and number > 0:
            normalized, unit_source = _normalize_unit_weight_to_n_m3(
                number,
                mass_source.get("default_unit_weight", 24000.0),
            )

            elem["_unit_weight_raw"] = number
            elem["_unit_weight_used_n_m3"] = normalized
            elem["_unit_weight_unit_source"] = unit_source

            return normalized

    fallback = mass_source.get("default_unit_weight", 24000.0)

    normalized, unit_source = _normalize_unit_weight_to_n_m3(fallback, 24000.0)

    elem["_unit_weight_raw"] = fallback
    elem["_unit_weight_used_n_m3"] = normalized
    elem["_unit_weight_unit_source"] = unit_source

    return normalized

def _add_auto_mass_to_node(node_masses: dict, node_id: int, mass_kg: float):
    if mass_kg <= 0:
        return

    node_id = int(node_id)

    if node_id not in node_masses:
        node_masses[node_id] = {
            "mx": 0.0,
            "my": 0.0,
            "mz": 0.0,
            "source": "mass_source",
        }

    node_masses[node_id]["mx"] += float(mass_kg)
    node_masses[node_id]["my"] += float(mass_kg)
    node_masses[node_id]["mz"] += 0.0

def _distribute_element_mass_to_nodes(
    node_masses: dict,
    elem: dict,
    mass_kg: float,
    support_node_ids: set[int],
):
    if mass_kg <= 0:
        return

    try:
        ni = int(elem.get("node_i"))
        nj = int(elem.get("node_j"))
    except Exception:
        return

    ni_supported = ni in support_node_ids
    nj_supported = nj in support_node_ids

    if not ni_supported and not nj_supported:
        _add_auto_mass_to_node(node_masses, ni, mass_kg * 0.5)
        _add_auto_mass_to_node(node_masses, nj, mass_kg * 0.5)
        return

    # Elemento con un extremo apoyado (p.ej. columna del 1er piso): solo la
    # MITAD tributaria del extremo libre participa en la masa modal. La otra
    # mitad corresponde al nodo apoyado (base/fundación) y no vibra — igual
    # que ETABS, que la reporta en "Base" del Mass Summary sin participar.
    # (Antes se lumpeaba el 100% al nodo libre → sobreestimaba la masa
    # sísmica en ~medio piso de columnas.)
    if ni_supported and not nj_supported:
        _add_auto_mass_to_node(node_masses, nj, mass_kg * 0.5)
        return

    if nj_supported and not ni_supported:
        _add_auto_mass_to_node(node_masses, ni, mass_kg * 0.5)
        return

    # Si ambos son apoyados, no aporta a masa modal libre.
    # Lo reportamos como omitido implícitamente.
    return

def _canonical_load_pattern_name(name) -> str:
    """
    Normaliza nombres equivalentes de patrones de carga.

    CM  = Carga Muerta = DEAD
    CV  = Carga Viva   = LIVE
    """
    text = str(name or "").strip()
    upper = text.upper()

    if not upper:
        return ""

    if (
        upper == "CM"
        or upper == "D"
        or upper == "DEAD"
        or "DEAD" in upper
        or "MUERTA" in upper
        or "PESO PROPIO" in upper
    ):
        return "DEAD"

    if (
        upper == "CV"
        or upper == "L"
        or upper == "LIVE"
        or "LIVE" in upper
        or "VIVA" in upper
    ):
        return "LIVE"

    return upper

def _build_mass_source_nodal_masses(
    data: dict,
    nodes: list,
    elements: list,
    supports: list,
) -> dict:
    mass_source = _get_mass_source_from_payload(data)
    node_masses = {}

    report = {
        "requested": bool(data.get("massSource") or data.get("mass_source")),
        "enabled": mass_source.get("enabled", False),
        "name": mass_source.get("name", "MASS_SOURCE_1"),
        "include_self_weight": mass_source.get("include_self_weight", True),
        "self_weight_multiplier": mass_source.get("self_weight_multiplier", 1.0),
        "gravity": mass_source.get("gravity", 9.81),
        "default_unit_weight": mass_source.get("default_unit_weight", 24000.0),
        "load_patterns": mass_source.get("load_patterns", []),
        "node_masses": node_masses,
        "summary": {
            "self_weight_N": 0.0,
            "self_weight_mass_kg": 0.0,
            "load_weight_N": 0.0,
            "load_mass_kg": 0.0,
            "auto_mass_x_kg": 0.0,
            "auto_mass_y_kg": 0.0,
            "nodes_with_auto_mass": 0,
        },
        "warnings": [],
    }

    if not mass_source.get("enabled", False):
        report["warnings"].append("Mass Source desactivado.")
        return report

    gravity = mass_source.get("gravity", 9.81)

    if gravity <= 0:
        gravity = 9.81

    node_by_id = {}

    for node in nodes or []:
        try:
            node_by_id[int(node.get("id"))] = node
        except Exception:
            pass

    support_node_ids = _support_node_ids_or_base_nodes(nodes, supports)

    # 1. Peso propio de elementos
    if mass_source.get("include_self_weight", True):
        self_weight_multiplier = mass_source.get("self_weight_multiplier", 1.0)

        # Longitud libre de vigas (peso propio sobre la luz libre, descontando
        # medio peralte de columna en cada extremo) como ETABS. Solo MASA, no
        # rigidez. Opt-out con `beamClearLength: false` en el payload.
        use_clear_length = bool(
            data.get("beamClearLength", data.get("beam_clear_length", True))
        )
        col_depth = (
            _build_column_depth_map(elements, node_by_id) if use_clear_length else {}
        )

        for elem in elements or []:
            length = (
                _beam_self_weight_length(elem, node_by_id, col_depth)
                if use_clear_length
                else _element_length_for_mass_source(elem, node_by_id)
            )
            area = _element_area_for_mass_source(elem)
            unit_weight = _element_unit_weight_for_mass_source(elem, mass_source)

            if length <= 0 or area <= 0 or unit_weight <= 0:
                continue

            weight_N = length * area * unit_weight * self_weight_multiplier
            mass_kg = weight_N / gravity

            report["summary"]["self_weight_N"] += weight_N
            report["summary"]["self_weight_mass_kg"] += mass_kg

            _distribute_element_mass_to_nodes(
                node_masses,
                elem,
                mass_kg,
                support_node_ids,
            )

    # 2. Cargas verticales incluidas en Mass Source
    pattern_factors = {}

    for item in mass_source.get("load_patterns", []) or []:
        if not isinstance(item, dict):
            continue

        raw_name = str(item.get("name", "")).strip()
        if not raw_name:
            continue

        factor = _ms_float(item.get("factor"), 0.0)
        if factor <= 0:
            continue

        canonical_name = _canonical_load_pattern_name(raw_name)

        # Guardar nombre original
        pattern_factors[raw_name] = factor
        pattern_factors[raw_name.upper()] = factor

        # Guardar nombre canónico
        if canonical_name:
            pattern_factors[canonical_name] = factor

        # Alias típicos Perú / ETABS local
        if canonical_name == "DEAD":
            pattern_factors["CM"] = factor
            pattern_factors["CARGA MUERTA"] = factor

        if canonical_name == "LIVE":
            pattern_factors["CV"] = factor
            pattern_factors["CARGA VIVA"] = factor

    # El frontend manda el peso propio de columnas/vigas TAMBIÉN como cargas
    # nodales bajo el patrón CM (source="frame_self_weight"), para que aparezca
    # en las reacciones estáticas (zapatas). Pero si el Mass Source ya cuenta el
    # peso propio de elementos (include_self_weight, bloque 1 arriba), sumar
    # además esas cargas lo DUPLICA en la masa sísmica → periodos largos y masa
    # ~30% alta vs ETABS. El peso propio de LOSA (source="area_load") NO se
    # duplica: las losas no son "elements", así que su masa solo entra por acá.
    include_self_weight_active = bool(mass_source.get("include_self_weight", True))

    if pattern_factors:
        for load in data.get("loads", []) or []:
            if not isinstance(load, dict):
                continue

            if (
                include_self_weight_active
                and str(load.get("source", "")).strip().lower() == "frame_self_weight"
            ):
                continue

            load_case = (
                load.get("loadCase")
                or load.get("load_case")
                or load.get("case")
                or load.get("pattern")
                or load.get("loadPattern")
                or load.get("load_pattern")
                or load.get("name")
                or ""
            )

            load_case = str(load_case).strip()

            if not load_case or load_case.upper() in [
                "UNKNOWN",
                "UNDEFINED",
                "NULL",
                "NONE",
            ]:
                if len(pattern_factors) == 1:
                    load_case = next(iter(pattern_factors.keys()))
                elif "DEAD" in pattern_factors:
                    load_case = "DEAD"

            load_case_upper = load_case.upper()
            load_case_canonical = _canonical_load_pattern_name(load_case)

            factor = (
                pattern_factors.get(load_case)
                or pattern_factors.get(load_case_upper)
                or pattern_factors.get(load_case_canonical)
                or 0.0
            )

            if factor <= 0:
                continue

            try:
                node_id = int(
                    load.get("node") or load.get("nodeId") or load.get("node_id")
                )
            except Exception:
                continue

            fz = _ms_float(load.get("fz", load.get("FZ", load.get("p", 0.0))), 0.0)

            weight_N = abs(fz) * factor
            mass_kg = weight_N / gravity

            if mass_kg <= 0:
                continue

            report["summary"]["load_weight_N"] += weight_N
            report["summary"]["load_mass_kg"] += mass_kg

            _add_auto_mass_to_node(node_masses, node_id, mass_kg)

    report["summary"]["auto_mass_x_kg"] = sum(
        item.get("mx", 0.0) for item in node_masses.values()
    )

    report["summary"]["auto_mass_y_kg"] = sum(
        item.get("my", 0.0) for item in node_masses.values()
    )

    report["summary"]["nodes_with_auto_mass"] = len(node_masses)

    if len(node_masses) == 0:
        report["warnings"].append(
            "Mass Source activo, pero no se generó masa automática. Revisa áreas, peso específico o cargas."
        )

    return report

def _normalize_modulus_to_pa(value, fallback_pa=200e9) -> tuple[float, str]:
    """
    Normaliza módulo elástico o cortante a Pa.

    Casos comunes:
      210          -> 210 GPa -> 210e9 Pa
      210000       -> 210000 MPa -> 210e9 Pa
      210000000000 -> Pa directo
    """
    try:
        number = float(value)
    except Exception:
        return float(fallback_pa), "default_pa"

    if number <= 0:
        return float(fallback_pa), "default_pa"

    # Valores tipo 210, 200, 77: asumimos GPa.
    if 1 <= number <= 1000:
        return number * 1e9, "converted_from_gpa"

    # Valores tipo 210000 o 77000: asumimos MPa.
    if 1000 < number <= 1000000:
        return number * 1e6, "converted_from_mpa"

    # Valores grandes: asumimos Pa.
    return number, "pa"

def _normalize_unit_weight_to_n_m3(value, fallback=24000.0) -> tuple[float, str]:
    """
    Normaliza peso específico a N/m³.

    Casos comunes:
      24    -> 24 kN/m³ -> 24000 N/m³
      2400  -> kgf/m³ aproximado -> 2400 * 9.81 N/m³
      24000 -> N/m³ directo
    """
    try:
        number = float(value)
    except Exception:
        return float(fallback), "default_n_m3"

    if number <= 0:
        return float(fallback), "default_n_m3"

    # 24, 25, 18: normalmente kN/m³.
    if 1 <= number <= 100:
        return number * 1000.0, "converted_from_kN_m3"

    # 2400: usualmente kgf/m³ aproximado.
    if 1000 <= number <= 4000:
        return number * 9.81, "converted_from_kgf_m3"

    return number, "n_m3"

def build_model_3d(data: dict):
    """
    Construye el modelo OpenSees 3D (6 DOF/nodo) a partir del payload del CAD.

    Incluye:
      - nodos
      - masas manuales
      - masas automáticas desde Mass Source
      - elementos elasticBeamColumn
      - apoyos
      - diafragma rígido estable equalDOF UX/UY
    """
    if ops is None:
        raise RuntimeError("OpenSeesPy no está disponible.")

    ops.wipe()
    ops.model("basic", "-ndm", 3, "-ndf", 6)

    # ── Datos base ─────────────────────────────────────────
    nodes = data.get("nodes", []) or []
    elements = data.get("elements", []) or []
    supports = data.get("supports", []) or []

    # ── Nodos ──────────────────────────────────────────────
    for n in nodes:
        ops.node(
            int(n["id"]),
            float(n.get("x", 0)),
            float(n.get("y", 0)),
            float(n.get("z", 0)),
        )

    # ── Mass Source tipo ETABS ─────────────────────────────
    mass_source_report = _build_mass_source_nodal_masses(
        data,
        nodes,
        elements,
        supports,
    )

    data["_mass_source_report"] = mass_source_report

    auto_node_masses = mass_source_report.get("node_masses", {}) or {}

    # ── Masas nodales manuales + automáticas ───────────────
    effective_mass_rows = []

    for n in nodes:
        node_id = int(n["id"])

        manual_mx = float(n.get("mass_x", n.get("mass", 0)) or 0)
        manual_my = float(n.get("mass_y", n.get("mass", 0)) or 0)
        manual_mz = float(n.get("mass_z", 0) or 0)

        auto_mass = (
            auto_node_masses.get(node_id) or auto_node_masses.get(str(node_id)) or {}
        )

        auto_mx = float(auto_mass.get("mx", 0.0) or 0.0)
        auto_my = float(auto_mass.get("my", 0.0) or 0.0)
        auto_mz = float(auto_mass.get("mz", 0.0) or 0.0)

        mx = manual_mx + auto_mx
        my = manual_my + auto_my
        mz = manual_mz + auto_mz

        n["_effective_mass_x"] = mx
        n["_effective_mass_y"] = my
        n["_effective_mass_z"] = mz

        effective_mass_rows.append(
            {
                "node": node_id,
                "manual_mx": manual_mx,
                "manual_my": manual_my,
                "manual_mz": manual_mz,
                "auto_mx": auto_mx,
                "auto_my": auto_my,
                "auto_mz": auto_mz,
                "effective_mx": mx,
                "effective_my": my,
                "effective_mz": mz,
            }
        )

        if mx > 0 or my > 0 or mz > 0:
            ops.mass(node_id, mx, my, mz, 1e-9, 1e-9, 1e-9)

    data["_effective_mass_report"] = {
        "rows": effective_mass_rows,
        "summary": {
            "total_effective_mx": sum(
                row["effective_mx"] for row in effective_mass_rows
            ),
            "total_effective_my": sum(
                row["effective_my"] for row in effective_mass_rows
            ),
            "total_effective_mz": sum(
                row["effective_mz"] for row in effective_mass_rows
            ),
            "nodes_with_effective_mass": len(
                [
                    row
                    for row in effective_mass_rows
                    if row["effective_mx"] > 0
                    or row["effective_my"] > 0
                    or row["effective_mz"] > 0
                ]
            ),
        },
    }

    # ── Elementos ─────────────────────────────────────────
    # Deformación por corte (Timoshenko): ETABS la incluye por defecto y en
    # pórticos de barras chatas (L/h < ~8) vale ~3% de periodo. Opt-out vía
    # payload `shearDeformations: false` → vuelve a elasticBeamColumn (Euler).
    use_shear_def = bool(
        data.get("shearDeformations", data.get("shear_deformations", True))
    )
    transf_cache = {}

    for i, elem in enumerate(elements):
        eid = int(elem["id"])
        ni = int(elem["node_i"])
        nj = int(elem["node_j"])

        A = float(elem.get("A", elem.get("area", 0.01)) or 0.01)

        raw_E = elem.get("E", elem.get("young", 200e9))
        raw_G = elem.get("G", elem.get("shear", 77e9))

        E, E_unit_source = _normalize_modulus_to_pa(raw_E, 200e9)
        G, G_unit_source = _normalize_modulus_to_pa(raw_G, 77e9)

        Iz = float(elem.get("Iz", 1e-4) or 1e-4)
        Iy = float(elem.get("Iy", 1e-4) or 1e-4)
        J = float(elem.get("J", 1e-6) or 1e-6)

        elem["_E_raw"] = raw_E
        elem["_G_raw"] = raw_G
        elem["_E_used_pa"] = E
        elem["_G_used_pa"] = G
        elem["_E_unit_source"] = E_unit_source
        elem["_G_unit_source"] = G_unit_source

        vecxz = elem.get("vecxz", None)

        if vecxz is None:
            vecxz = _auto_vecxz(ni, nj, nodes)

        transf_key = tuple(vecxz)

        if transf_key not in transf_cache:
            tid = len(transf_cache) + 1
            ops.geomTransf("Linear", tid, *vecxz)
            transf_cache[transf_key] = tid

        tid = transf_cache[transf_key]

        # Área de corte 5/6·A (secciones rectangulares). Los elementos dummy
        # (A≈0) se quedan en Euler: Timoshenko con Av→0 degenera numéricamente.
        if use_shear_def and A > 1e-4:
            Av = (5.0 / 6.0) * A
            ops.element(
                "ElasticTimoshenkoBeam",
                eid, ni, nj, E, G, A, J, Iy, Iz, Av, Av, tid,
            )
            elem["_formulation"] = "ElasticTimoshenkoBeam"
        else:
            ops.element("elasticBeamColumn", eid, ni, nj, A, E, G, J, Iy, Iz, tid)
            elem["_formulation"] = "elasticBeamColumn"

    # ── Apoyos ────────────────────────────────────────────
    if supports:
        for s in supports:
            ops.fix(
                int(s["node"]),
                int(s.get("ux", 0)),
                int(s.get("uy", 0)),
                int(s.get("uz", 0)),
                int(s.get("rx", 0)),
                int(s.get("ry", 0)),
                int(s.get("rz", 0)),
            )
    else:
        if nodes:
            min_z = min(float(n.get("z", 0)) for n in nodes)
            base_nodes = [n for n in nodes if abs(float(n.get("z", 0)) - min_z) < 0.01]

            for n in base_nodes:
                ops.fix(int(n["id"]), 1, 1, 1, 1, 1, 1)

    # ── Diafragmas rígidos ─────────────────────────────────
    diaphragm_report = _apply_rigid_diaphragms(data, nodes, supports)
    data["_rigid_diaphragm_report"] = diaphragm_report

    return nodes, elements

def _auto_vecxz(ni: int, nj: int, nodes: list) -> list[float]:
    """Elige vector xz automáticamente para geomTransf según orientación del elemento."""
    ni_data = next((n for n in nodes if int(n["id"]) == ni), None)
    nj_data = next((n for n in nodes if int(n["id"]) == nj), None)
    if ni_data is None or nj_data is None:
        return [0.0, 0.0, 1.0]

    dx = float(nj_data.get("x", 0)) - float(ni_data.get("x", 0))
    dy = float(nj_data.get("y", 0)) - float(ni_data.get("y", 0))
    dz = float(nj_data.get("z", 0)) - float(ni_data.get("z", 0))
    length = (dx**2 + dy**2 + dz**2) ** 0.5

    if length < 1e-9:
        return [0.0, 0.0, 1.0]

    dx /= length
    dy /= length
    dz /= length

    # Si el elemento es casi vertical (columna), usar Y como ref
    if abs(dz) > 0.9:
        return [0.0, 1.0, 0.0]
    # Si es casi horizontal en X
    return [0.0, 0.0, 1.0]

def _get_base_shear_value(seismic: dict, direction: str) -> float:
    """
    Obtiene el cortante basal desde result['seismic'].
    Compatible con varias estructuras posibles.
    """
    if not isinstance(seismic, dict):
        return 0.0

    direction = direction.lower()

    branch = seismic.get(direction) or seismic.get(direction.upper()) or {}

    if isinstance(branch, dict):
        for key in [
            "base_shear",
            "baseShear",
            "base_shear_N",
            "Vb",
            "V",
            "shear",
        ]:
            value = branch.get(key)
            if isinstance(value, dict):
                value = value.get("value") or value.get("abs") or value.get("total")
            try:
                number = float(value)
                if number == number:
                    return abs(number)
            except Exception:
                pass

    for key in [
        f"base_shear_{direction}",
        f"baseShear_{direction}",
        f"Vb_{direction}",
        f"V_{direction}",
    ]:
        try:
            value = seismic.get(key)
            number = float(value)
            if number == number:
                return abs(number)
        except Exception:
            pass

    return 0.0

def _b10_14_load_case(load: dict) -> str:
    return str(
        load.get("loadCase")
        or load.get("load_case")
        or load.get("pattern")
        or load.get("loadPattern")
        or load.get("name")
        or "DEAD"
    ).strip()
