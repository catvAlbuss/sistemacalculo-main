"""seismic.inputs — ENTRADAS: parseo de espectros, soportes, diafragmas, fuente de masa, normalización de unidades y construcción del modelo OpenSees."""

import io
import math
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
    "_build_slab_mesh_plan",
    "_build_wall_mesh_plan",
    "_canonical_load_pattern_name",
    "_choose_diaphragm_retained_node",
    "_create_slab_shell_elements",
    "_create_wall_shell_elements",
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
    "_element_is_steel",
    "_lump_mass_to_story_levels",
    "_lump_steel_roof_mass_to_supports",
    "_node_xyz_for_mass_source",
    "_no_diaphragm_node_ids",
    "_normalize_modulus_to_pa",
    "_normalize_unit_weight_to_n_m3",
    "_slab_is_sloped",
    "_slab_polygon_to_quads",
    "_slab_should_mesh_as_shell",
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

def _no_diaphragm_node_ids(data: dict) -> set:
    """
    Nudos que NUNCA entran a un diafragma rígido, vengan de donde vengan.

    Los llena el frontend (`payload.js _slopedSlabFreeNodeIdsForSeismic`) con
    los nudos de LOSAS INCLINADAS que no pertenecen además a una losa plana.
    Es la mitad "sin constraint" del comportamiento SEMI-RÍGIDO de ETABS: la
    losa inclinada aporta rigidez como shell real (ver _build_slab_mesh_plan),
    no amarrando sus nudos a un plano rígido.

    Por qué importa: amarrar la cumbrera y los faldones de un techo a dos aguas
    con un diafragma rígido los obliga a moverse como un plano horizontal
    rígido — justo la deformación que un techo inclinado NO tiene. Sin esto, el
    shell que acabamos de agregar quedaría cortocircuitado por el constraint.
    """
    raw = (
        data.get("noDiaphragmNodes")
        or data.get("no_diaphragm_nodes")
        or data.get("freeNodes")
        or []
    )
    out = set()
    if not isinstance(raw, (list, tuple, set)):
        return out
    for nid in raw:
        try:
            out.add(int(nid))
        except Exception:
            continue
    return out


def _build_diaphragm_groups(
    data: dict, nodes: list, supports: list, z_tolerance: float = 0.05
) -> list[dict]:
    node_by_id = {int(n["id"]): n for n in nodes}
    valid_node_ids = set(node_by_id.keys())
    support_node_ids = _support_node_ids_or_base_nodes(nodes, supports, z_tolerance)
    excluded_node_ids = _no_diaphragm_node_ids(data)

    explicit_groups = data.get("diaphragms") or data.get("diaphragm_groups") or []
    groups = []

    if isinstance(explicit_groups, list) and explicit_groups:
        for index, group in enumerate(explicit_groups):
            node_ids = _extract_node_ids_from_group(group)

            node_ids = [
                int(nid)
                for nid in node_ids
                if int(nid) in valid_node_ids
                and int(nid) not in support_node_ids
                and int(nid) not in excluded_node_ids
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

        # Losa inclinada → sin diafragma (semi-rígido, ver _no_diaphragm_node_ids).
        if nid in excluded_node_ids:
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
        # Prioridad: elección explícita > flag LUMPATSTORIES del .e2k
        # (lumpLateralMassAtStoryLevels) > default False. Ver comentario en
        # payload.js _normalizeSeismicMassSource: honrar el flag de ETABS es
        # clave para que la estructura modal de techos de armadura calce
        # (la conclusión previa de que el lumping "sobre-corregía" era un
        # artefacto de medirlo con las diagonales todavía rígidas SIN los
        # otros fixes — con el modelo corregido, lump + rígido = ETABS).
        "distribute_to_story_nodes": _as_bool(
            raw.get(
                "distributeToStoryNodes",
                raw.get(
                    "distribute_to_story_nodes",
                    raw.get("lumpLateralMassAtStoryLevels"),
                ),
            ),
            False,
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

def _element_is_steel(elem: dict) -> bool:
    """Elemento de ACERO: por designType del material (lo manda el frontend,
    ver _buildFramePhysicalMetadataForSeismic) o, como respaldo para payloads
    viejos, por peso específico (acero ~77-79 kN/m³ vs concreto ~24)."""
    for src in (elem, elem.get("material") or {}, elem.get("section") or {}):
        if not isinstance(src, dict):
            continue
        dt = str(src.get("designType") or src.get("design_type") or "").strip().lower()
        if dt:
            return dt.startswith("steel") or dt.startswith("acero")

    uw = _ms_float(
        elem.get("unitWeight", elem.get("unit_weight", elem.get("unitWeightNPerM3"))),
        0.0,
    )
    return uw >= 60000.0


def _lump_steel_roof_mass_to_supports(node_masses: dict, nodes: list, elements: list) -> tuple[dict, dict]:
    """
    TECHO METÁLICO COMO SOLO MASA (opt-out: `steelRoofMassOnly: false`).

    Un techo de acero (tijeral/armadura) es MUY liviano comparado con la
    estructura de concreto que lo sostiene. Si su masa se deja repartida en los
    nudos de la propia armadura, el eigen encuentra MODOS LOCALES del techo con
    períodos largos y casi sin masa participante, que se cuelan como "modo 1" y
    tapan los modos reales de la estructura.

    Medido con el modelo real MODULO 5 (2026-08-03), variando SOLO dónde vive la
    masa del techo (1049 kg de cobertura + 1425 kg de peso propio del acero):
        masa en la cumbrera (lumping por piso) -> T1=0.3583  (modo de balanceo,
                                                  6% de masa; ETABS da 0.360
                                                  porque lumpea igual)
        masa en cabeza de columnas, tijeral con
        su masa propia                         -> T1=0.1693
        SIN masa propia del tijeral (esta func) -> T1=0.0967  <- período real
        tijeral ELIMINADO (solo masa, sin rigidez) -> T1=5172 s = MECANISMO
    Por eso acá NO se toca la rigidez: los elementos de acero siguen armándose
    completos (si se quitan, nada amarra las cabezas de columna y el modelo
    degenera). Solo se REUBICA su masa.

    Destino: los nudos de INTERFAZ, donde el acero se apoya sobre el resto de la
    estructura (un nudo tocado por un elemento de acero Y por uno que no lo es —
    típicamente la cabeza de columna). La masa de los nudos EXCLUSIVOS del techo
    metálico se reparte en partes iguales entre ellos.

    Si no hay interfaz (estructura 100% de acero) NO se hace nada: no habría
    dónde apoyar la masa y moverla sería inventar. Devuelve (node_masses, info).
    """
    info = {"applied": False, "moved_kg": 0.0, "from_nodes": 0, "to_nodes": 0}

    steel_nodes: set[int] = set()
    other_nodes: set[int] = set()

    for elem in elements or []:
        try:
            ni = int(elem["node_i"])
            nj = int(elem["node_j"])
        except Exception:
            continue
        target = steel_nodes if _element_is_steel(elem) else other_nodes
        target.add(ni)
        target.add(nj)

    if not steel_nodes:
        return node_masses, info

    # Interfaz = tocado por acero y por no-acero (cabeza de columna/muro).
    support_ids = sorted(steel_nodes & other_nodes)
    roof_only_ids = steel_nodes - other_nodes

    if not support_ids or not roof_only_ids:
        return node_masses, info

    moved = {"mx": 0.0, "my": 0.0, "mz": 0.0}
    kept: dict = {}

    for raw_id, mass in node_masses.items():
        try:
            nid = int(raw_id)
        except Exception:
            kept[raw_id] = mass
            continue

        if nid in roof_only_ids:
            for comp in ("mx", "my", "mz"):
                moved[comp] += float(mass.get(comp, 0.0) or 0.0)
            info["from_nodes"] += 1
        else:
            kept[nid] = mass

    if moved["mx"] <= 0 and moved["my"] <= 0 and moved["mz"] <= 0:
        return node_masses, info

    share = {comp: moved[comp] / len(support_ids) for comp in moved}

    for nid in support_ids:
        entry = kept.setdefault(
            nid, {"mx": 0.0, "my": 0.0, "mz": 0.0, "source": "mass_source"}
        )
        for comp in ("mx", "my", "mz"):
            entry[comp] = float(entry.get(comp, 0.0) or 0.0) + share[comp]

    info.update(
        applied=True,
        moved_kg=round(moved["mx"], 3),
        to_nodes=len(support_ids),
    )
    return kept, info


def _lump_mass_to_story_levels(node_masses: dict, nodes: list, stories: list, tolerance: float = 0.05) -> dict:
    """
    Estilo ETABS `LUMPATSTORIES "Yes"`: la masa de un nodo que NO está
    exactamente en la elevación de su piso tributario (p.ej. nudos
    intermedios de una armadura de techo, entre el piso N-1 y el nivel de
    techo N) se traslada a los nodos que SÍ están en esa elevación (nudos del
    diafragma / nivel de piso), repartida en partes iguales entre ellos.

    Sin esto la masa del techo queda distribuida en las alturas REALES de
    cada nudo de la armadura -> menor inercia de balanceo (masa×altura²) que
    ETABS, que consolida toda la masa del piso en su nivel. Validado con el
    payload real de MODULO 5: sin lumping T1=0.243 (armadura completa,
    3.86-6.29m); lumpeando al nivel de techo (6.29m, 2 nudos de cumbrera)
    T1=0.389 vs ETABS 0.358 — mucho más cerca que sin lumping.

    Regla de reparto: TRIBUTARIO LINEAL entre los dos niveles adyacentes
    (como ETABS): un nodo a fracción f de la altura entre el piso inferior y
    el superior aporta f de su masa al nivel de arriba y (1-f) al de abajo.
    VALIDADO contra ETABS (2026-07-31, MODULO 5, distribución real de masa
    por Z del payload): tributario da Story2=1046 kg vs 1051 kg reales de
    ETABS (0.5%); la regla anterior ("todo al piso de arriba") daba 1838 kg
    (+75%) — con la masa por Z de MODULO 6 el patrón era idéntico (+69%).
    Nodos bajo el primer nivel o sobre el último van completos al nivel
    extremo correspondiente.

    Si un nivel no tiene NINGÚN nodo exactamente en su elevación (sin
    referencia donde lumpear), esa porción de masa se queda en el nodo
    original — degradación segura, no se pierde masa.
    """
    if not isinstance(stories, list) or len(stories) < 2:
        return node_masses

    levels = sorted(
        (
            {"z": _ms_float(s.get("elevation", s.get("z")), 0.0)}
            for s in stories
            if isinstance(s, dict)
        ),
        key=lambda s: s["z"],
    )
    if len(levels) < 2:
        return node_masses

    node_z = {}
    for n in nodes or []:
        try:
            node_z[int(n["id"])] = _ms_float(n.get("z", 0.0), 0.0)
        except Exception:
            continue

    # Nodos EXACTAMENTE en cada nivel — candidatos a recibir la masa lumpeada.
    level_target_nodes = [[] for _ in levels]
    for nid, z in node_z.items():
        for i, lvl in enumerate(levels):
            if abs(z - lvl["z"]) <= tolerance:
                level_target_nodes[i].append(nid)
                break

    lumped: dict = {}

    def _merge(nid, mx, my, mz):
        entry = lumped.setdefault(nid, {"mx": 0.0, "my": 0.0, "mz": 0.0, "source": "mass_source"})
        entry["mx"] += mx
        entry["my"] += my
        entry["mz"] += mz

    for raw_id, mass in node_masses.items():
        try:
            nid = int(raw_id)
        except Exception:
            _merge(raw_id, mass.get("mx", 0.0), mass.get("my", 0.0), mass.get("mz", 0.0))
            continue

        z = node_z.get(nid)

        # Sin coordenada conocida, o ya en un nivel -> se queda donde está.
        if z is None or any(abs(z - lvl["z"]) <= tolerance for lvl in levels):
            _merge(nid, mass.get("mx", 0.0), mass.get("my", 0.0), mass.get("mz", 0.0))
            continue

        # Nivel superior tributario (primer nivel con z_lvl >= z) y su inferior.
        upper_idx = next(
            (i for i, lvl in enumerate(levels) if lvl["z"] >= z - tolerance),
            len(levels) - 1,
        )
        lower_idx = max(0, upper_idx - 1)

        z_up = levels[upper_idx]["z"]
        z_lo = levels[lower_idx]["z"]
        span = z_up - z_lo

        # Fracción tributaria al nivel SUPERIOR (1.0 si el nodo está fuera de
        # rango o los niveles coinciden).
        if upper_idx == lower_idx or span <= tolerance:
            frac_up = 1.0
        else:
            frac_up = min(1.0, max(0.0, (z - z_lo) / span))

        for idx, frac in ((upper_idx, frac_up), (lower_idx, 1.0 - frac_up)):
            if frac <= 0.0:
                continue
            targets = level_target_nodes[idx]
            if not targets:
                # Sin nodos de referencia en ese nivel: esa porción se queda
                # en el nodo original (no se pierde masa).
                _merge(nid, mass.get("mx", 0.0) * frac, mass.get("my", 0.0) * frac, mass.get("mz", 0.0) * frac)
                continue
            share_mx = mass.get("mx", 0.0) * frac / len(targets)
            share_my = mass.get("my", 0.0) * frac / len(targets)
            share_mz = mass.get("mz", 0.0) * frac / len(targets)
            for t in targets:
                _merge(t, share_mx, share_my, share_mz)

    return lumped


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

    # 2b. Techo METÁLICO como solo masa: se reubica la masa de los nudos
    # exclusivos del acero a los nudos donde el techo se apoya (ver
    # _lump_steel_roof_mass_to_supports). Va ANTES del lumping por piso porque
    # los nudos de interfaz ya están a nivel de piso, así que el lumping
    # posterior los deja donde están. Opt-out: steelRoofMassOnly: false.
    if _as_bool(
        data.get("steelRoofMassOnly", data.get("steel_roof_mass_only")),
        True,
    ):
        node_masses, steel_info = _lump_steel_roof_mass_to_supports(
            node_masses, nodes, elements
        )
        report["steel_roof_mass_only"] = steel_info
        if steel_info.get("applied"):
            report["node_masses"] = node_masses

    # 3. Lumping a nivel de piso (ETABS LUMPATSTORIES "Yes") — opt-out con
    # distributeToStoryNodes: false en el Mass Source del payload.
    if mass_source.get("distribute_to_story_nodes", False):
        stories = data.get("stories") or data.get("story_levels") or data.get("levels") or []
        if isinstance(stories, list) and stories:
            node_masses = _lump_mass_to_story_levels(node_masses, nodes, stories)
            report["node_masses"] = node_masses

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


# ── Muros (elementos shell) ────────────────────────────────────────────────
# Rango de tags dedicado para nodos/elementos SOLO de la malla de muros, para
# no chocar nunca con los ids que manda el frontend (nodes[]/elements[] usan
# ids chicos y secuenciales — ver getOrCreateStructuralNode en el frontend).
WALL_NODE_TAG_BASE = 9_000_000
WALL_ELEMENT_TAG_BASE = 9_000_000
# Tamaño de elemento objetivo para el mallado automático (m). Deliberadamente
# GRANDE — mantiene la mayoría de los muros (1 piso, ~3-5m de ancho x story
# height ~3m) en malla 1x1 (sin subdividir).
#
# Calibración (2026-07-23) CON EL MODELO REAL del usuario (11 muros, edificio
# de 3 pisos, MODELO (2)2.e2k volcado vía DUMP_SEISMIC_PAYLOAD): probé 6.0m,
# 3.0m, 1.5m y 1.0m contra los períodos reales de ETABS (T1=0.235, T2=0.219,
# T3=0.198). Resultado, T1 por tamaño de malla:
#   6.0m (1x1, sin nodos nuevos) -> 0.2345  (¡a -0.2% de ETABS!)
#   3.0m ->                         0.2410  (+2.6%)
#   1.5m ->                         0.2500  (+6.4%)
#   1.0m ->                         0.2509  (+6.8%)
# Mallar MÁS FINO ablanda el muro monótonamente (más nodos con solo masa
# placeholder entre los de columna, más flexibilidad "parásita" del panel) —
# lo OPUESTO a lo que un comentario anterior de este mismo archivo asumía
# (que decía que 1x1 salía "demasiado rígida"; esa conclusión salió de un
# modelo sintético de 2 muros, no de datos reales — quedó refutada acá con el
# modelo real). 6.0m (1x1 para el caso normal) es el que mejor calza.
_WALL_TARGET_ELEMENT_SIZE_M = 6.0

# Tamaño de elemento vertical objetivo SOLO para muros esbeltos (alto/largo >
# 2, ver uso más abajo en _build_wall_mesh_plan) — evita el "membrane
# locking" de un pilar angosto mallado 1x1. Calibrado (2026-07-31, MODULO 5)
# por convergencia de malla real, no por tanteo — ver comentario junto a su
# uso para el barrido completo.
_WALL_SLENDER_TARGET_ELEMENT_SIZE_M = 0.42

# NOTA (2026-07-24): hubo un refinamiento de malla EXTRA para muros en anillo
# cerrado (_WALL_RING_TARGET_ELEMENT_SIZE_M = 4.0 + detección por puentes de
# grafo). SE QUITÓ. Estaba sobreajustado a UN solo modelo (33 muros, anillo en
# los 3 pisos, T1 -4.7% con 6.0m → -1.8% con 4.0m). Al probar un SEGUNDO modelo
# de anillo real (22 muros, pisos 1 y 3 con hueco en el 2) el refinamiento 4.0m
# lo dejaba +5.3% (demasiado flexible) mientras 6.0m lo clavaba (+0.0%/+0.2%/
# +0.5% en T1-3). Los dos anillos preferían mallas OPUESTAS → el refinamiento
# no era un fix general sino overfit. El modificador de flexión fuera-de-plano
# (abajo) es la palanca robusta: ablanda la flexión parásita de las esquinas
# del anillo (que era parte de la sobre-rigidez original) sin sobreajustar.
# Con malla uniforme 6.0m + modificador 0.1, el modelo de 22 muros queda
# casi perfecto. Ver [[project_wall_shell_stiffness]] rondas 4-6.

# Modificador de rigidez de flexión FUERA-DEL-PLANO del muro (6º arg de
# ElasticMembranePlateSection). 1.0 = shell completo (flexión out-of-plane
# real, sin reducir). <1.0 = acerca el muro a comportamiento MEMBRANA (solo
# rigidez en el plano), que es como ETABS modela sus muros para sismo.
#
# Por qué NO 1.0: validado (2026-07-24) con el payload real de un modelo con
# muros en UNA sola dirección (3 muros coplanares apilados, plano YZ):
#   - En-plano (modo Y, la acción de muro de corte): calza casi perfecto con
#     ETABS con o sin modificador (el modificador NO toca la membrana —
#     verificado: k_in idéntico para mod=1.0/0.1/0.01).
#   - Fuera-de-plano (modo X, dirección perpendicular al muro): con shell
#     completo (1.0) el muro aporta ~3% de rigidez de flexión que ETABS NO
#     considera → modo 1 salía -3.8%. ETABS trata el muro como membrana ahí.
# Un modificador <1.0 baja esa rigidez parásita para calzar ETABS sin tocar
# la acción en-plano (que ya es exacta). No se pone 0.0 exacto para no volver
# el panel un mecanismo fuera-de-plano (fila de nodos sin restricción → matriz
# singular); un valor pequeño pero finito da masa/estabilidad sin rigidez
# apreciable.
#
# Barrido con el modelo real (3 muros coplanares, modo 1 = fuera-de-plano):
#   mod=1.0  -> modo1 -3.8%   (shell completo, demasiado rígido fuera de plano)
#   mod=0.1  -> modo1 -0.9%   (VALOR ELEGIDO — gran mejora, conservador)
#   mod=0.05 -> modo1 -0.4%
#   mod=0.02 -> modo1 -0.1%   (clava este modelo, pero sobreajustado a él)
# En TODOS los casos el modo en-plano se mantiene ~perfecto (el modificador NO
# toca la membrana). Se eligió 0.1 y NO 0.02 a propósito: 0.02 clava ESTE
# modelo pero es sobreajuste a un solo caso (mismo error que casi se comete con
# el tamaño de malla); 0.1 es una reducción fuerte y defendible (convención
# usada en la práctica para modificadores de flexión de muros) que retiene algo
# de rigidez fuera-de-plano por robustez.
#
# Validado además con un modelo real de ANILLO CERRADO (22 muros, pisos 1 y 3):
# con malla uniforme 6.0m + este modificador, T1-3 quedan +0.0%/+0.2%/+0.5% y
# los 9 modos dentro de ~4% — sin necesidad de refinar la malla del anillo (ese
# refinamiento se probó y resultó overfit, ver NOTA en _WALL_TARGET_ELEMENT_SIZE_M).
_WALL_OUT_OF_PLANE_BENDING_MODIFIER = 0.1


def _build_wall_mesh_plan(data: dict, nodes: list, node_lookup_out: dict = None):
    """
    Malla cada muro de `data["walls"]` (4 esquinas + espesor + material) en
    una grilla de elementos ShellMITC4, interpolando bilinealmente entre las
    esquinas. Reusa nodos EXISTENTES del frontend cuando una esquina/punto de
    la malla coincide con uno (así el muro queda conectado al pórtico de
    barras ahí); crea nodos OpenSees nuevos, con tags en WALL_NODE_TAG_BASE+,
    para el resto.

    Se ejecuta ANTES de aplicar masas nodales (ver build_model_3d) porque
    ops.mass(tag, ...) en OpenSees REEMPLAZA la masa del nodo, no la suma: si
    una esquina de muro coincide con un nodo de columna que ya tiene masa de
    Mass Source, hay que sumar ambas en Python antes de un único ops.mass().

    Devuelve (wall_node_mass, wall_element_specs, wall_node_ids):
      - wall_node_mass: dict tag -> [mx, my, mz] en kg, a fusionar con la masa
        de Mass Source/manual antes de aplicar ops.mass().
      - wall_element_specs: lista de (eid, n1, n2, n3, n4, sec_tag) lista
        para crear después de los elementos frame (ver _create_wall_shell_elements).
      - wall_node_ids: set de tags NUEVOS (no existían en data["nodes"]) — el
        loop de masas de build_model_3d itera sobre `nodes`, así que estos se
        aplican aparte.

    `node_lookup_out` (opcional): si se pasa un dict, queda con el mapa
    coordenada→tag ya poblado (nodos del payload + los nuevos de la malla de
    muro). Lo usa el mallado de LOSAS para coser su malla a la de los muros en
    vez de duplicar nodos en el mismo punto.
    """
    walls = data.get("walls", []) or []
    wall_node_mass: dict = {}
    wall_element_specs: list = []
    wall_node_ids: set = set()

    def _round_key(x, y, z):
        return (round(float(x), 3), round(float(y), 3), round(float(z), 3))

    # Se puebla SIEMPRE (aunque no haya muros): el mallado de losas lo reusa.
    node_lookup = node_lookup_out if node_lookup_out is not None else {}
    for n in nodes:
        node_lookup[_round_key(n.get("x", 0), n.get("y", 0), n.get("z", 0))] = int(n["id"])

    if not walls or ops is None:
        return wall_node_mass, wall_element_specs, wall_node_ids

    mat_cache: dict = {}
    sec_cache: dict = {}
    next_mat_tag = 1
    next_sec_tag = 1
    next_new_node_tag = WALL_NODE_TAG_BASE
    next_eid = WALL_ELEMENT_TAG_BASE

    for wall in walls:
        corners = wall.get("corners") or []
        if len(corners) != 4:
            continue

        thickness = float(wall.get("thickness", 0) or 0)
        if thickness <= 0:
            continue

        material = wall.get("material") or {}
        E, _ = _normalize_modulus_to_pa(material.get("E", 25e9), 25e9)
        poisson = float(material.get("poissonRatio", 0.2) or 0.2)
        if not (0 < poisson < 0.5):
            poisson = 0.2
        unit_weight_n_m3 = float(material.get("unitWeightNPerM3", 24000) or 24000)

        def _pt(c):
            return (float(c.get("x", 0)), float(c.get("y", 0)), float(c.get("z", 0)))

        # Orden esperado del frontend (WallDrawingState.createWallPanel):
        # p1-abajo, p2-abajo, p2-arriba, p1-arriba — perímetro sin cruces.
        p00, p10, p11, p01 = (_pt(c) for c in corners)

        length = math.dist(p00, p10)
        height = math.dist(p00, p01)
        if length < 1e-3 or height < 1e-3:
            continue

        nx = max(1, min(4, round(length / _WALL_TARGET_ELEMENT_SIZE_M)))
        ny = max(1, min(2, round(height / _WALL_TARGET_ELEMENT_SIZE_M)))

        # Muros ANGOSTOS Y ALTOS (pilares esbeltos, largo << alto) necesitan
        # más subdivisión VERTICAL sin importar el tamaño objetivo de 6.0m —
        # si no, quedan en malla 1x1 (un solo elemento membrana bilineal) y
        # ese único elemento NO puede representar curvatura de flexión
        # (membrane locking, problema clásico de FEM): sale artificialmente
        # rígido para un pilar que en realidad flexiona como una ménsula.
        #
        # Descubierto (2026-07-31, MODULO 5, payload real): 4 muros angostos
        # (0.6-0.85m de largo × 3.36m de alto, relación ~4-5.6:1) resultaban
        # ~2x más rígidos de lo debido en el cortante basal — FX salía en 49%
        # de ETABS y NO respondía a ningún otro parámetro probado (columnas
        # reales ×100, rigidez de la armadura del techo). Barrido de
        # convergencia de malla (mismo payload real, ny forzado, sin el cap
        # de "esbeltez" de abajo):
        #   ny=1 (original)  -> FX=0.4469  FY=1.3863
        #   ny=6              -> FX=0.5362  FY=1.6441
        #   ny=8              -> FX=0.5644  FY=1.7254
        #   ny=12             -> FX=0.5644  FY=1.7254  (idéntico a ny=8)
        #   ny=20             -> FX=0.5644  FY=1.7254  (idéntico — CONVERGIÓ)
        # Converge en ny≈8 (tamaño de elemento ≈3.36/8=0.42m) — más allá no
        # cambia nada, es la respuesta FEM correcta para esta rigidez de
        # muro, no un artefacto de malla. Cierra ~ la mitad de la brecha
        # (FX 49%→62%, FY 75%→94% de ETABS) — el resto de la brecha (sobre
        # todo en FX) queda como pendiente, ya no es cosa de malla.
        # Objetivo de tamaño de elemento vertical más fino (0.42m) SOLO para
        # muros esbeltos, en vez de reusar el objetivo general (6.0m) que
        # dejaba estos pilares en malla 1x1.
        if length > 1e-6 and (height / length) > 2.0:
            ny = max(ny, min(10, round(height / _WALL_SLENDER_TARGET_ELEMENT_SIZE_M)))


        # Sección elástica de shell con modificador de flexión fuera-de-plano
        # (6º arg de ElasticMembranePlateSection): reduce SOLO la rigidez de
        # flexión (out-of-plane) dejando la membrana (in-plane) intacta —
        # equivalente al "bending stiffness modifier" de un muro en ETABS.
        # Ver _WALL_OUT_OF_PLANE_BENDING_MODIFIER para el porqué del valor.
        sec_key = (round(E, -3), round(poisson, 3), round(thickness, 4))
        sec_tag = sec_cache.get(sec_key)
        if sec_tag is None:
            sec_tag = next_sec_tag
            next_sec_tag += 1
            ops.section(
                "ElasticMembranePlateSection",
                sec_tag,
                E,
                poisson,
                thickness,
                0.0,
                _WALL_OUT_OF_PLANE_BENDING_MODIFIER,
            )
            sec_cache[sec_key] = sec_tag

        # Grilla (ny+1) x (nx+1) por interpolación bilineal de las 4 esquinas.
        grid_tags = []
        for row in range(ny + 1):
            v = row / ny
            row_tags = []
            for col in range(nx + 1):
                u = col / nx
                x = ((1 - u) * (1 - v) * p00[0] + u * (1 - v) * p10[0]
                     + u * v * p11[0] + (1 - u) * v * p01[0])
                y = ((1 - u) * (1 - v) * p00[1] + u * (1 - v) * p10[1]
                     + u * v * p11[1] + (1 - u) * v * p01[1])
                z = ((1 - u) * (1 - v) * p00[2] + u * (1 - v) * p10[2]
                     + u * v * p11[2] + (1 - u) * v * p01[2])

                key = _round_key(x, y, z)
                tag = node_lookup.get(key)
                if tag is None:
                    tag = next_new_node_tag
                    next_new_node_tag += 1
                    ops.node(tag, x, y, z)
                    node_lookup[key] = tag
                    wall_node_ids.add(tag)

                row_tags.append(tag)
            grid_tags.append(row_tags)

        # Masa: peso total del panel repartido en partes iguales entre los
        # nodos de la malla (lumped simple) — mismo espíritu de reparto que
        # _distribute_element_mass_to_nodes usa para frames. SOLO horizontal
        # (mx, my) — sin mz. Mismo criterio que ya documenta
        # _max_dynamic_modes en solver.py ("masa sísmica solo horizontal,
        # mz=0 en el Mass Source"): darle mz a los nodos de la malla no aporta
        # nada al RSA (horizontal por definición) y cada nodo con mz>0 cuenta
        # como un GDL dinámico más para _max_dynamic_modes, disparando la
        # cantidad de modos pedidos sin necesidad.
        area = length * height
        total_mass_kg = area * thickness * (unit_weight_n_m3 / 9.81)

        # Masa del muro SOLO a los nodos de la malla que coinciden con nodos
        # EXISTENTES del frontend (columnas) — que están en el diafragma del
        # piso, restringidos en el plano. Todos los nodos EXCLUSIVOS de la
        # malla (mid-anchura, media altura, interiores) reciben solo masa
        # placeholder (1e-9).
        #
        # Por qué: un nodo de la malla LIBRE (no en diafragma) CON masa
        # horizontal produce un modo local de baja frecuencia (flexión fuera
        # del plano del panel, o vibración in-plane del borde) que ETABS no
        # muestra — ETABS constriñe los nodos de la malla del muro al
        # diafragma del piso. Con muchos muros esos modos espurios contaminan
        # los modos globales (validado: modelo del usuario con muros en todo
        # un piso → 4-5 modos espurios entre 0.17-0.22s, ETABS solo 3 modos
        # ahí). Al poner la masa solo en los nodos de columna/diafragma, esos
        # nodos se mueven con la estructura global (no local) y los nodos
        # libres, casi sin masa, quedan en alta frecuencia (fuera de los modos
        # pedidos). La RIGIDEZ del panel NO depende de dónde esté la masa, así
        # que el mallado fino (más flexible, calibrado vs ETABS) se conserva.
        # Es además lo físicamente correcto: la masa del muro tributa a los
        # diafragmas, como en ETABS.
        shared_tags = [t for row in grid_tags for t in row if t not in wall_node_ids]
        if shared_tags:
            per_shared = total_mass_kg / len(shared_tags)
            for tag in shared_tags:
                acc = wall_node_mass.setdefault(tag, [0.0, 0.0, 0.0])
                acc[0] += per_shared
                acc[1] += per_shared
        # Placeholder mínimo para los nodos exclusivos de la malla (evita
        # singularidad del eigen-solve; despreciable, no genera modos bajos).
        for row_tags in grid_tags:
            for tag in row_tags:
                if tag in wall_node_ids:
                    acc = wall_node_mass.setdefault(tag, [0.0, 0.0, 0.0])
                    acc[0] += 1e-9
                    acc[1] += 1e-9

        # Elementos: orden antihorario n1(abajo-izq) → n2(abajo-der) →
        # n3(arriba-der) → n4(arriba-izq) por celda de la grilla.
        for row in range(ny):
            for col in range(nx):
                n1 = grid_tags[row][col]
                n2 = grid_tags[row][col + 1]
                n3 = grid_tags[row + 1][col + 1]
                n4 = grid_tags[row + 1][col]
                wall_element_specs.append((next_eid, n1, n2, n3, n4, sec_tag))
                next_eid += 1

    return wall_node_mass, wall_element_specs, wall_node_ids


def _create_wall_shell_elements(wall_element_specs: list):
    """Crea los elementos ShellMITC4 planeados por _build_wall_mesh_plan — se
    llama DESPUÉS del loop de elementos frame en build_model_3d (los nodos ya
    existen para ambos casos en ese punto)."""
    if ops is None:
        return
    for eid, n1, n2, n3, n4, sec_tag in wall_element_specs:
        ops.element("ShellMITC4", eid, n1, n2, n3, n4, sec_tag)


# ═══════════════════════════════════════════════════════════════════════
# LOSAS COMO SHELL (ShellMITC4) — espejo del mallado de muros
# ═══════════════════════════════════════════════════════════════════════
# Tags separados de los de muro (WALL_*_TAG_BASE = 9_000_000) con medio millón
# de margen: los muros nunca generan tantos nodos de malla.
SLAB_NODE_TAG_BASE = 9_500_000
SLAB_ELEMENT_TAG_BASE = 9_500_000
# Los tags de sección son GLOBALES en OpenSees y los muros arrancan en 1 →
# las secciones de losa arrancan lejos para no pisarlas.
SLAB_SECTION_TAG_BASE = 5_000

# Tamaño de elemento objetivo (m) del mallado de losa. MUCHO más fino que el de
# muro (6.0 m, que deja casi todos los muros en malla 1x1) porque acá la acción
# estructural es la FLEXIÓN de placa: un solo MITC4 por faldón no puede
# representar la curvatura y sale artificialmente rígido (el mismo membrane
# locking que obligó a refinar los muros esbeltos, ver
# _WALL_SLENDER_TARGET_ELEMENT_SIZE_M). El tope de divisiones acota el costo:
# un panel grande queda en 6x6 = 36 elementos, no en cientos.
_SLAB_TARGET_ELEMENT_SIZE_M = 2.0
_SLAB_MAX_DIVISIONS = 6

# Una losa cuyos vértices difieren en Z más que esto se considera INCLINADA
# (techo) — 1 cm, muy por encima del ruido de coordenadas y muy por debajo de
# cualquier pendiente real.
_SLAB_SLOPE_TOLERANCE_M = 0.01

# Modificador de flexión fuera-del-plano de la losa, según el MODELINGTYPE que
# trae el .e2k (lo manda el frontend en cada slab):
#
#  - "Shell" (Thin/Thick) -> 1.0, shell COMPLETO. A diferencia del muro
#    (_WALL_OUT_OF_PLANE_BENDING_MODIFIER = 0.1, casi membrana porque así
#    modela ETABS un muro de corte para sismo), en una losa —sobre todo en un
#    techo inclinado sin diafragma— la flexión de placa ES la acción
#    estructural que la sostiene: reducirla la volvería un mecanismo.
#
#  - "Membrane" -> TAMBIÉN 1.0 desde 2026-08-03. En ETABS una losa Membrane no
#    tiene rigidez fuera del plano, así que este valor arrancó en 0.1 (mismo
#    criterio que el muro). Los datos lo desmintieron: ese 0.1 se eligió con un
#    barrido sobre MODULO 1 cuando el IMPORT todavía estaba roto (las columnas
#    C30X60 arrancaban en 6.4 en vez de 3.2, ver el story span en
#    e2k-import.js). Con el import arreglado el óptimo se dio vuelta.
#
#    Barrido con el payload real de MODULO 1 ya corregido
#    (ETABS T1-T3 = 0.441/0.363/0.288):
#      0.1 -> 0.4549 / 0.3747 / 0.3321   SumUX 99.6%  SumUY  62.2%
#      1.0 -> 0.4363 / 0.3583 / 0.3167   SumUX  100%  SumUY   100%   ← ELEGIDO
#
#    Lo decisivo NO es el período (aunque 1.0 también gana: −1.1%/−1.3% vs
#    +3.2%/+3.2%) sino la MASA PARTICIPANTE: con 0.1 las losas desarrollan
#    modos locales blandos (0.134, 0.128 s) que se llevan la masa en Y a modos
#    fuera de los 15 pedidos y dejan SumUY en 62% — por debajo del 90% que
#    exige la E.030, o sea cortante subestimado.
#
# El parámetro se conserva (no se colapsa en uno solo) para poder volver a
# probar comportamiento membrana sin reescribir el mallador.
_SLAB_OUT_OF_PLANE_BENDING_MODIFIER = 1.0
_SLAB_MEMBRANE_BENDING_MODIFIER = 1.0


def _slab_bending_modifier(slab: dict) -> float:
    """Modificador de flexión según el MODELINGTYPE de la sección de la losa.
    Sin dato -> shell completo (una losa dibujada a mano, sin sección de .e2k,
    se comporta como hasta ahora; importa para los techos inclinados)."""
    raw = str(slab.get("modelingType", slab.get("modeling_type", "")) or "").strip()
    if raw and "membrane" in raw.lower():
        return _SLAB_MEMBRANE_BENDING_MODIFIER
    return _SLAB_OUT_OF_PLANE_BENDING_MODIFIER


def _slab_is_sloped(points: list) -> bool:
    """True si los vértices no están todos a la misma cota (techo inclinado)."""
    zs = [float(p.get("z", 0) or 0) for p in points]
    if not zs:
        return False
    return (max(zs) - min(zs)) > _SLAB_SLOPE_TOLERANCE_M


def _slab_plan_area(points: list) -> float:
    """Área de la proyección en planta (fórmula del zapatero). Sirve para
    descartar paneles VERTICALES que llegaron marcados como losa (esos son
    muros: su proyección en planta es ~0 y el mallado bilineal degeneraría)."""
    n = len(points)
    if n < 3:
        return 0.0
    total = 0.0
    for i in range(n):
        x1 = float(points[i].get("x", 0) or 0)
        y1 = float(points[i].get("y", 0) or 0)
        x2 = float(points[(i + 1) % n].get("x", 0) or 0)
        y2 = float(points[(i + 1) % n].get("y", 0) or 0)
        total += x1 * y2 - x2 * y1
    return abs(total) * 0.5


def _point_in_polygon_2d(x: float, y: float, poly: list) -> bool:
    """Ray casting sobre la proyección en planta."""
    inside = False
    n = len(poly)
    j = n - 1
    for i in range(n):
        xi = float(poly[i].get("x", 0) or 0)
        yi = float(poly[i].get("y", 0) or 0)
        xj = float(poly[j].get("x", 0) or 0)
        yj = float(poly[j].get("y", 0) or 0)
        if ((yi > y) != (yj > y)) and (x < (xj - xi) * (y - yi) / (yj - yi + 1e-30) + xi):
            inside = not inside
        j = i
    return inside


def _slab_polygon_to_quads(points: list) -> list:
    """
    Convierte un polígono de N vértices (N != 4) en N cuadriláteros:
    centroide + punto medio de cada lado. Es la subdivisión estándar de una
    cara en cuadriláteros (misma idea que Catmull-Clark) y da cuads válidos
    para cualquier polígono CONVEXO, incluido el triángulo (→ 3 cuads).

    Cada cuad va (medio del lado anterior → vértice → medio del lado siguiente
    → centroide), que recorre el perímetro sin cruces.

    Devuelve [] si el centroide cae FUERA de la planta del polígono (cóncavo
    marcado): ahí esta subdivisión produciría cuads invertidos y es mejor
    saltar la losa que meter elementos degenerados en el modelo.
    """
    n = len(points)
    if n < 3:
        return []

    cx = sum(float(p.get("x", 0) or 0) for p in points) / n
    cy = sum(float(p.get("y", 0) or 0) for p in points) / n
    cz = sum(float(p.get("z", 0) or 0) for p in points) / n

    if not _point_in_polygon_2d(cx, cy, points):
        return []

    centroid = {"x": cx, "y": cy, "z": cz}

    def _mid(a, b):
        return {
            "x": (float(a.get("x", 0) or 0) + float(b.get("x", 0) or 0)) * 0.5,
            "y": (float(a.get("y", 0) or 0) + float(b.get("y", 0) or 0)) * 0.5,
            "z": (float(a.get("z", 0) or 0) + float(b.get("z", 0) or 0)) * 0.5,
        }

    mids = [_mid(points[i], points[(i + 1) % n]) for i in range(n)]

    quads = []
    for i in range(n):
        quads.append((mids[i - 1], points[i], mids[i], centroid))
    return quads


def _slab_should_mesh_as_shell(slab: dict, mode: str) -> bool:
    """
    Decide si una losa se malla como shell.

    El frontend ya manda `meshAsShell` calculado (fuente de verdad única, ver
    payload.js `_buildSeismicSlabsForPayload`); esto es el respaldo para
    payloads viejos o armados a mano.

    DEFAULT `mode = "all"` — TODAS las losas, igual que ETABS, que malla cada
    área del modelo. La flexión fuera del plano que eso agrega se controla por
    MODELINGTYPE (ver _slab_bending_modifier), no salteando el mallado.

    Antes el default era "sloped" (solo las inclinadas). Se cambió con el
    payload real de MODULO 1 (2026-08-03): las losas PLANAS son las que
    conectan al pórtico partes de la estructura que las vigas no conectan —
    ahí una fila de 5 vigas sin ninguna columna ni apoyo quedaba flotando,
    dando dos modos de cuerpo rígido (18.4 s y 2.63 s, masa 0) y reventando el
    análisis estático con matriz singular. Mallándolas, los dos modos
    desaparecen y el estático converge.
    `"sloped"` y `"off"` siguen disponibles para experimentar.
    """
    explicit = slab.get("meshAsShell", slab.get("mesh_as_shell"))
    if explicit is not None:
        return _as_bool(explicit, False)

    if mode == "off":
        return False
    if mode == "sloped":
        return _slab_is_sloped(slab.get("points") or [])

    return True


def _build_slab_mesh_plan(
    data: dict,
    nodes: list,
    node_lookup: dict = None,
    start_node_tag: int = SLAB_NODE_TAG_BASE,
    start_element_tag: int = SLAB_ELEMENT_TAG_BASE,
):
    """
    Malla las losas de `data["slabs"]` en elementos ShellMITC4.

    Espejo de _build_wall_mesh_plan, con TRES diferencias que importan:

    1. NO APORTA MASA. El peso propio de la losa (y sus cargas de área) YA
       llega al motor como fuerzas nodales fz desde el frontend
       (`_buildSeismicAreaLoadsForPayload`), que el Mass Source convierte en
       masa. Si además la sumáramos acá, la masa de losa se contaría DOS
       VECES. Los nodos NUEVOS de la malla solo reciben masa placeholder
       (1e-9) para no dejar GDL sin masa en el eigen — misma técnica que los
       nodos exclusivos de la malla de muro.

    2. Malla más FINA (ver _SLAB_TARGET_ELEMENT_SIZE_M): acá la acción es la
       flexión de placa, y un solo elemento por panel no la representa.

    3. Acepta polígonos de CUALQUIER número de vértices. Con 4 se usa la malla
       bilineal nx×ny (igual que el muro); con 3 o >4 se subdivide primero en
       cuadriláteros (_slab_polygon_to_quads) y cada uno se malla bilineal.

    El caso INCLINADO no necesita nada especial: la interpolación bilineal es
    en 3D y las divisiones se calculan con distancias 3D (largo real del
    faldón, no su proyección en planta), así que la malla sigue la pendiente.

    Devuelve (slab_node_mass, slab_element_specs, slab_node_ids, report).
    """
    slabs = data.get("slabs") or data.get("slab_shells") or []
    slab_node_mass: dict = {}
    slab_element_specs: list = []
    slab_node_ids: set = set()
    report = {
        "requested": len(slabs) if isinstance(slabs, list) else 0,
        "meshed": [],
        "skipped": [],
        "element_count": 0,
        "new_node_count": 0,
    }

    if not slabs or ops is None:
        return slab_node_mass, slab_element_specs, slab_node_ids, report

    mode = str(
        data.get("slabShellMode", data.get("slab_shell_mode", "all")) or "all"
    ).strip().lower()
    report["mode"] = mode

    def _round_key(x, y, z):
        return (round(float(x), 3), round(float(y), 3), round(float(z), 3))

    # Reusa el lookup que dejó el mallado de muros (así una losa que apoya
    # sobre un muro comparte los nodos de su malla en vez de duplicarlos); si
    # no vino, se arma desde los nodos del payload.
    if node_lookup is None:
        node_lookup = {}
        for n in nodes:
            node_lookup[_round_key(n.get("x", 0), n.get("y", 0), n.get("z", 0))] = int(n["id"])

    sec_cache: dict = {}
    next_sec_tag = SLAB_SECTION_TAG_BASE
    next_new_node_tag = start_node_tag
    next_eid = start_element_tag

    def _mesh_quad(corners, sec_tag):
        """Malla bilineal nx×ny de un cuadrilátero (p00, p10, p11, p01)."""
        nonlocal next_new_node_tag, next_eid

        p00, p10, p11, p01 = [
            (float(c.get("x", 0) or 0), float(c.get("y", 0) or 0), float(c.get("z", 0) or 0))
            for c in corners
        ]

        # Longitudes REALES en 3D (en un faldón inclinado el largo del plano
        # es mayor que su proyección en planta — usar la proyección dejaría la
        # malla más gruesa de lo pedido justo en el caso que nos interesa).
        len_u = max(math.dist(p00, p10), math.dist(p01, p11))
        len_v = max(math.dist(p00, p01), math.dist(p10, p11))

        if len_u < 1e-4 or len_v < 1e-4:
            return 0

        nx = max(1, min(_SLAB_MAX_DIVISIONS, round(len_u / _SLAB_TARGET_ELEMENT_SIZE_M)))
        ny = max(1, min(_SLAB_MAX_DIVISIONS, round(len_v / _SLAB_TARGET_ELEMENT_SIZE_M)))

        grid_tags = []
        for row in range(ny + 1):
            v = row / ny
            row_tags = []
            for col in range(nx + 1):
                u = col / nx
                x = ((1 - u) * (1 - v) * p00[0] + u * (1 - v) * p10[0]
                     + u * v * p11[0] + (1 - u) * v * p01[0])
                y = ((1 - u) * (1 - v) * p00[1] + u * (1 - v) * p10[1]
                     + u * v * p11[1] + (1 - u) * v * p01[1])
                z = ((1 - u) * (1 - v) * p00[2] + u * (1 - v) * p10[2]
                     + u * v * p11[2] + (1 - u) * v * p01[2])

                key = _round_key(x, y, z)
                tag = node_lookup.get(key)
                if tag is None:
                    tag = next_new_node_tag
                    next_new_node_tag += 1
                    ops.node(tag, x, y, z)
                    node_lookup[key] = tag
                    slab_node_ids.add(tag)
                    # Masa placeholder: sin esto el nodo queda con GDL sin masa
                    # en el eigen. NO es masa de losa (esa ya viene por cargas
                    # de área → Mass Source; ver docstring).
                    acc = slab_node_mass.setdefault(tag, [0.0, 0.0, 0.0])
                    acc[0] += 1e-9
                    acc[1] += 1e-9

                row_tags.append(tag)
            grid_tags.append(row_tags)

        created = 0
        for row in range(ny):
            for col in range(nx):
                n1 = grid_tags[row][col]
                n2 = grid_tags[row][col + 1]
                n3 = grid_tags[row + 1][col + 1]
                n4 = grid_tags[row + 1][col]
                # Un cuad degenerado (dos esquinas colapsadas en el mismo nodo)
                # hace fallar a ShellMITC4 — se descarta la celda, no la losa.
                if len({n1, n2, n3, n4}) < 4:
                    continue
                slab_element_specs.append((next_eid, n1, n2, n3, n4, sec_tag))
                next_eid += 1
                created += 1
        return created

    for slab in slabs:
        slab_id = slab.get("id")
        points = slab.get("points") or slab.get("corners") or []

        if len(points) < 3:
            report["skipped"].append({"id": slab_id, "reason": "menos de 3 vértices"})
            continue

        if not _slab_should_mesh_as_shell(slab, mode):
            report["skipped"].append(
                {"id": slab_id, "reason": f"fuera del modo de mallado ({mode})"}
            )
            continue

        thickness = float(slab.get("thickness", 0) or 0)
        if thickness <= 0:
            report["skipped"].append({"id": slab_id, "reason": "sin espesor (sección no asignada)"})
            continue

        if _slab_plan_area(points) < 1e-6:
            report["skipped"].append(
                {"id": slab_id, "reason": "proyección en planta nula (¿panel vertical?)"}
            )
            continue

        material = slab.get("material") or {}
        E, _ = _normalize_modulus_to_pa(material.get("E", 25e9), 25e9)
        poisson = float(material.get("poissonRatio", 0.2) or 0.2)
        if not (0 < poisson < 0.5):
            poisson = 0.2

        bending = _slab_bending_modifier(slab)

        sec_key = (round(E, -3), round(poisson, 3), round(thickness, 4), round(bending, 4))
        sec_tag = sec_cache.get(sec_key)
        if sec_tag is None:
            sec_tag = next_sec_tag
            next_sec_tag += 1
            # rho = 0.0 a propósito: la masa de la losa NO sale del shell.
            ops.section(
                "ElasticMembranePlateSection",
                sec_tag,
                E,
                poisson,
                thickness,
                0.0,
                bending,
            )
            sec_cache[sec_key] = sec_tag

        if len(points) == 4:
            quads = [tuple(points)]
        else:
            quads = _slab_polygon_to_quads(points)
            if not quads:
                report["skipped"].append(
                    {
                        "id": slab_id,
                        "reason": "polígono no convexo (el centroide cae fuera): "
                                  "divídelo en paneles de 4 vértices",
                    }
                )
                continue

        created = 0
        for quad in quads:
            created += _mesh_quad(quad, sec_tag)

        if created == 0:
            report["skipped"].append({"id": slab_id, "reason": "no se generó ningún elemento"})
            continue

        report["meshed"].append(
            {
                "id": slab_id,
                "vertices": len(points),
                "sloped": _slab_is_sloped(points),
                "thickness_m": thickness,
                "modeling_type": slab.get("modelingType", slab.get("modeling_type")),
                "bending_modifier": bending,
                "elements": created,
            }
        )
        report["element_count"] += created

    report["new_node_count"] = len(slab_node_ids)

    return slab_node_mass, slab_element_specs, slab_node_ids, report


def _create_slab_shell_elements(slab_element_specs: list):
    """Crea los ShellMITC4 planeados por _build_slab_mesh_plan — igual que los
    de muro, se llama DESPUÉS del loop de elementos frame (ahí ya existen todos
    los nodos)."""
    if ops is None:
        return
    for eid, n1, n2, n3, n4, sec_tag in slab_element_specs:
        ops.element("ShellMITC4", eid, n1, n2, n3, n4, sec_tag)


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

    # ── Muros (malla shell) ─────────────────────────────────
    # ANTES de aplicar masas: si una esquina de muro coincide con un nodo de
    # columna, su masa debe sumarse a la de Mass Source en el mismo ops.mass()
    # (ver docstring de _build_wall_mesh_plan — ops.mass() reemplaza, no suma).
    shell_node_lookup: dict = {}
    wall_node_mass, wall_element_specs, wall_node_ids = _build_wall_mesh_plan(
        data, nodes, node_lookup_out=shell_node_lookup
    )
    data["_wall_node_ids"] = sorted(wall_node_ids)

    # ── Losas (malla shell) ─────────────────────────────────
    # Mismo momento del build que los muros (antes de las masas) y mismo
    # lookup de nodos, para que una losa que apoya sobre un muro comparta los
    # nodos de su malla. OJO: la losa NO aporta masa acá — su peso propio ya
    # viaja como cargas de área (ver docstring de _build_slab_mesh_plan).
    slab_node_mass, slab_element_specs, slab_node_ids, slab_report = _build_slab_mesh_plan(
        data, nodes, node_lookup=shell_node_lookup
    )
    data["_slab_node_ids"] = sorted(slab_node_ids)
    data["_slab_shell_report"] = slab_report

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

        # Esquina de muro coincidente con este nodo (columna) → sumar acá, un
        # solo ops.mass() por tag (ver _build_wall_mesh_plan).
        wall_extra = wall_node_mass.get(node_id)
        if wall_extra:
            mx += wall_extra[0]
            my += wall_extra[1]
            mz += wall_extra[2]

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

    # Nodos NUEVOS creados solo para la malla de muros (no vienen en
    # data["nodes"], así que el loop de arriba no los toca).
    for tag in wall_node_ids:
        wmass = wall_node_mass.get(tag)
        if not wmass:
            continue
        wmx, wmy, wmz = wmass
        if wmx > 0 or wmy > 0 or wmz > 0:
            ops.mass(tag, wmx, wmy, wmz, 1e-9, 1e-9, 1e-9)

    # Ídem para los nodos nuevos de la malla de losas — solo el placeholder
    # 1e-9 (la masa real de la losa ya entró arriba vía cargas de área).
    for tag in slab_node_ids:
        smass = slab_node_mass.get(tag)
        if not smass:
            continue
        smx, smy, smz = smass
        if smx > 0 or smy > 0 or smz > 0:
            ops.mass(tag, smx, smy, smz, 1e-9, 1e-9, 1e-9)

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

    # Elementos "Brace" (ETABS: LINE CONNECTIVITIES ... BRACE, sin RELEASE
    # explícito) se modelan con rigidez a flexión/torsión REDUCIDA (no full
    # frame rígido) en vez de mantener el 100% de Iz/Iy/J. La axial (A) NO se
    # toca — sigue siendo la que da la acción de cercha.
    #
    # HISTORIA (2026-07-31, MODULO 5 — ver [[project_modulo5_period_calibration]]):
    # este modificador se calibró primero en 0.01 y luego en 0.08 para calzar
    # T1 con ETABS... pero resultó ser una COMPENSACIÓN del verdadero
    # faltante: el lumping de masa a nivel de piso (ETABS LUMPATSTORIES
    # "Yes", ahora honrado vía massSource.lumpLateralMassAtStoryLevels →
    # ver _get_mass_source_from_payload). Con la masa lumpeada como ETABS y
    # las diagonales RÍGIDAS (1.0 — físicamente consistente con un .e2k sin
    # RELEASE), el modelo reproduce SOLO la estructura modal completa de
    # ETABS: T1=0.3514 (vs 0.36 ETABS), UN modo Y dominante (89.5%@0.057),
    # UN modo X dominante (99.6%@0.054) y el resto de modos locales SIN masa
    # — igual que ETABS. Ablandar las diagonales con la masa ya lumpeada
    # ROMPE eso (T1 se alarga de más). Default 1.0 = sin efecto; el
    # mecanismo queda disponible vía payload `braceBendingModifier` para
    # experimentos/modelos sin lumping.
    _BRACE_BENDING_MODIFIER = 1.0
    brace_bending_modifier = _ms_float(
        data.get("braceBendingModifier", data.get("brace_bending_modifier")),
        _BRACE_BENDING_MODIFIER,
    )
    apply_brace_modifier = bool(
        data.get("braceAsTruss", data.get("brace_as_truss", True))
    )

    # "Columnas" que en realidad son PARANTES VERTICALES de una armadura de
    # techo (ETABS les pone LINE ... COLUMN solo por ser verticales — el tipo
    # de línea es geometría, no rol estructural). Descubierto (2026-07-31,
    # MODULO 5, payload real) al ver que el cortante basal FX no se movía NADA
    # con el modifier de los BRACE (0.4469 tonf fijo entre modifier=0.01 y
    # modifier=1.0, vs ETABS 0.9051): de las 26 "columnas" del modelo, solo 4
    # son columnas reales de concreto (Base->Story1, sección T 70x50x30cm);
    # las otras 22 son postes de tubo de acero (75x75x3mm) que van de Story1
    # HACIA ARRIBA, dentro de la armadura — quedaban 100% rígidas (sin el
    # modifier, que solo tocaba "brace") actuando como una "pata" extra rígida
    # que ataba el techo al diafragma de Story1, sobre-rigidizando el modo de
    # traslación X (mode 11, T=0.027 vs el T≈0.048 de ETABS).
    #
    # Distinción robusta (verificada 100% limpia en el payload real): un
    # parante de armadura SIEMPRE toca al menos un nodo que también es
    # endpoint de un elemento BRACE (mismo nudo de la armadura); una columna
    # real de edificio no. Se tratan igual que los BRACE (mismo modifier).
    brace_touched_node_ids = set()
    for elem in elements:
        if str(elem.get("elementType") or elem.get("element_type") or "").lower() == "brace":
            try:
                brace_touched_node_ids.add(int(elem["node_i"]))
                brace_touched_node_ids.add(int(elem["node_j"]))
            except Exception:
                continue

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

        element_type = str(elem.get("elementType") or elem.get("element_type") or "").lower()
        is_truss_vertical_column = (
            element_type == "column"
            and (ni in brace_touched_node_ids or nj in brace_touched_node_ids)
        )

        if apply_brace_modifier and (element_type == "brace" or is_truss_vertical_column):
            Iz *= brace_bending_modifier
            Iy *= brace_bending_modifier
            J *= brace_bending_modifier
            elem["_brace_bending_modifier_applied"] = brace_bending_modifier

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

    # ── Muros (elementos shell) ─────────────────────────────
    # Los nodos de la malla ya existen (creados en _build_wall_mesh_plan,
    # arriba); acá solo se instancian los ShellMITC4.
    _create_wall_shell_elements(wall_element_specs)

    # ── Losas (elementos shell) ─────────────────────────────
    _create_slab_shell_elements(slab_element_specs)

    # ── Barras SIN sección estructural ────────────────────
    # El frontend marca las barras cuya sección no aporta A/I: viajan con los
    # fallbacks de arriba (A=0.01, I=1e-4) y el análisis corre igual, pero son
    # barras de papel que ablandan todo el modelo sin que nada lo diga. Ver
    # payload.js (`framesWithoutSection`). MODULO 1, 2026-08-03: 8 columnas así
    # dejaban T1 en 1.74 s; con sección real, 0.38 s (ETABS 0.44).
    missing_section = [
        int(e.get("id", -1))
        for e in elements
        if _as_bool(e.get("sectionMissing", e.get("section_missing")), False)
    ]
    if missing_section:
        preview = ", ".join(str(i) for i in missing_section[:10])
        extra = "…" if len(missing_section) > 10 else ""
        print(
            f"⚠️ {len(missing_section)} barra(s) SIN sección estructural asignada "
            f"(ids {preview}{extra}) — se analizan con propiedades por defecto "
            f"(A=0.01 m², I=1e-4 m⁴). El modelo saldrá más flexible de lo real."
        )
    data["_frames_without_section"] = missing_section

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
