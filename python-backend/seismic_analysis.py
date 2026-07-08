"""
Módulo de análisis sísmico espectral con OpenSeesPy

Flujo:
  1. parse_spectrum_file()   → lee TXT/CSV/XLS → lista [(T, Sa)]
  2. build_model_3d()        → construye el modelo OpenSees 3D
  3. run_modal_analysis()    → eigenvalue → periodos, modos, participación
  4. run_rsa()               → RSA por modo (SRSS o CQC) en X e Y
  5. run_static_with_seismic → análisis estático + envolvente sísmica

Convención de ejes (coherente con el CAD del sistema):
  X, Y = ejes horizontales  (sismos actúan aquí)
  Z    = eje vertical       (altura / gravedad)

  En OpenSees se usa:
    ndm=3, ndf=6 → UX UY UZ RX RY RZ
"""

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

# ─────────────────────────────────────────────────────────
#  1.  PARSEO DE ESPECTROS
# ─────────────────────────────────────────────────────────


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


def interpolate_spectrum(spectrum: list[tuple[float, float]], period: float) -> float:
    """Interpolación lineal del espectro en el periodo dado."""
    if not spectrum:
        return 0.0
    t_vals = [p[0] for p in spectrum]
    sa_vals = [p[1] for p in spectrum]

    if period <= t_vals[0]:
        return sa_vals[0]
    if period >= t_vals[-1]:
        return sa_vals[-1]

    for i in range(len(t_vals) - 1):
        if t_vals[i] <= period <= t_vals[i + 1]:
            frac = (period - t_vals[i]) / (t_vals[i + 1] - t_vals[i])
            return sa_vals[i] + frac * (sa_vals[i + 1] - sa_vals[i])

    return sa_vals[-1]


# ─────────────────────────────────────────────────────────
#  B2 + B3.6 - DIAFRAGMA RÍGIDO Y MASS SOURCE
# ─────────────────────────────────────────────────────────


def _as_bool(value, default=False) -> bool:
    if value is None:
        return default

    if isinstance(value, bool):
        return value

    if isinstance(value, (int, float)):
        return value != 0

    if isinstance(value, str):
        text = value.strip().lower()
        if text in ["true", "1", "yes", "y", "si", "sí", "on"]:
            return True
        if text in ["false", "0", "no", "off"]:
            return False

    return default


def _ms_float(value, fallback=0.0) -> float:
    try:
        number = float(value)
        return number if number == number else fallback
    except Exception:
        return fallback


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


# ============================================================
# B2 — Diafragma rígido estable con equalDOF
# ============================================================


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


# ============================================================
# B3.6 — Mass Source
# ============================================================


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

    if pattern_factors:
        for load in data.get("loads", []) or []:
            if not isinstance(load, dict):
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


# ─────────────────────────────────────────────────────────
#  B10.3 - NORMALIZACIÓN DE UNIDADES FÍSICAS
# ─────────────────────────────────────────────────────────


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


# ─────────────────────────────────────────────────────────
#  2.  CONSTRUCTOR DE MODELO OPENSEES
# ─────────────────────────────────────────────────────────


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


# ─────────────────────────────────────────────────────────
#  3.  ANÁLISIS MODAL
# ─────────────────────────────────────────────────────────


def _safe_eigenvalue(v) -> float:
    """Convierte cualquier eigenvalue (real, complejo, numpy) a float positivo seguro."""
    try:
        # Extraer parte real si es complejo
        real_part = float(v.real) if hasattr(v, "real") else float(v)
        return abs(real_part)  # ω² debe ser positivo; negativo = ruido numérico
    except (TypeError, ValueError):
        return 0.0


# Periodo mínimo para considerar un modo como real. Los modos "basura" que
# salen de las masas rotacionales placeholder (1e-9 en ops.mass) tienen
# T≈1e-8 s; los modos estructurales reales de un edificio están órdenes de
# magnitud por encima (>0.01 s incluso en modelos muy rígidos).
MIN_VALID_MODE_PERIOD = 1e-4  # s


def _max_dynamic_modes(data: dict, nodes: list) -> int:
    """
    Número máximo de modos con masa real que tiene el modelo.

    Con masa sísmica solo horizontal (mz=0 en el Mass Source) y diafragmas
    rígidos, los GDL dinámicos reales son ~3 por diafragma (UX, UY, RZ) — o 2
    si el grupo cayó a equalDOF, que no amarra RZ — más los GDL con masa de
    nodos fuera de diafragmas. Pedir más modos que esto obliga a eigen a
    buscarlos en las masas placeholder y produce modos degenerados (T≈1e-8 s,
    participación 0). Debe llamarse DESPUÉS de build_model_3d (usa los
    reportes _rigid_diaphragm_report y _effective_mass_report del payload).
    """
    try:
        applied = (data.get("_rigid_diaphragm_report") or {}).get("applied") or []
        rows = ((data.get("_effective_mass_report") or {}).get("rows")) or []

        supported = set()
        for s in data.get("supports") or []:
            try:
                nid = s.get("node", s.get("nodeId", s.get("node_id")))
                if nid is not None:
                    supported.add(int(nid))
            except Exception:
                pass

        in_diaphragm = set()
        dofs = 0
        for grp in applied:
            members = {int(x) for x in (grp.get("constrained") or [])}
            if grp.get("retained") is not None:
                members.add(int(grp["retained"]))
            in_diaphragm |= members
            method = str(grp.get("method") or "")
            dofs += 3 if method.startswith("rigidDiaphragm") else 2

        for row in rows:
            nid = int(row.get("node", -1))
            if nid in supported:
                continue
            if nid in in_diaphragm:
                # UX/UY/RZ ya están en los 3 GDL del diafragma, pero UZ no la
                # amarra rigidDiaphragm: si el nodo tuviera masa vertical, su
                # UZ es un GDL dinámico adicional.
                if float(row.get("effective_mz", 0) or 0) > 0:
                    dofs += 1
                continue
            dofs += sum(
                1
                for key in ("effective_mx", "effective_my", "effective_mz")
                if float(row.get(key, 0) or 0) > 0
            )

        return max(1, dofs)
    except Exception:
        return max(1, len(nodes) * 2)


def run_modal_analysis(nodes: list, num_modes: int = 6) -> dict:
    """
    Ejecuta análisis eigenvalue y calcula:
      - Periodos  T_n (s)
      - Frecuencias f_n (Hz)
      - Formas modales φ_n (solo DOFs traslacionales X e Y)
      - Factores de participación Γ_n (dir. X e Y)
      - Razón de masa participante acumulada

    Retorna dict con toda la información modal.
    """
    # ── Configurar sistema de análisis (OBLIGATORIO antes de eigen) ────────
    ops.constraints("Transformation")
    ops.numberer("RCM")
    ops.system("FullGeneral")  # FullGeneral tolera matrices no-SPD
    ops.analysis("Transient")  # Transient activa la formulación completa de masa

    # ── Ejecutar eigenvalue — probar solvers de más a menos robusto ─────────
    lam = None
    errors = []
    for solver_args in [
        ("-genBandArpack",),
        ("-symmBandLapack",),
        ("-fullGenLapack",),
        (),
    ]:
        try:
            result = ops.eigen(*solver_args, num_modes)
            # Verificar que devolvió algo útil (no vacío ni todo-ceros)
            if result and any(_safe_eigenvalue(v) > 1e-20 for v in result):
                lam = result
                break
        except Exception as e:
            errors.append(str(e))

    if lam is None:
        detail = "; ".join(errors) if errors else "sin detalle"
        raise RuntimeError(
            f"El análisis modal falló con todos los solvers. "
            f"Verifica que el modelo tiene apoyos asignados y secciones con propiedades válidas. "
            f"Detalle: {detail}"
        )

    # ── Sanitizar eigenvalores → ω real positivo ───────────────────────────
    omega = [
        _safe_eigenvalue(v) ** 0.5 if _safe_eigenvalue(v) > 1e-20 else 0.0 for v in lam
    ]
    periods = [2.0 * np.pi / w if w > 1e-9 else 0.0 for w in omega]
    frequencies = [1.0 / T if T > 1e-9 else 0.0 for T in periods]

    # ── Filtrar modos degenerados (sin masa real) ───────────────────────────
    # Si se pidieron más modos que GDL dinámicos con masa, eigen los encuentra
    # sobre las masas rotacionales placeholder (1e-9) → T≈1e-8 s, participación
    # nula. Se descartan de TODOS los arreglos (periodos, formas, participación)
    # para no ensuciar tablas, combinaciones CQC ni reportes. `keep` guarda el
    # índice original de cada modo retenido para leer eigenvectores y
    # modalProperties con la numeración del solver.
    keep = [i for i, T in enumerate(periods) if T >= MIN_VALID_MODE_PERIOD]
    if not keep:
        keep = list(range(len(periods)))
    degenerate_dropped = len(periods) - len(keep)

    omega = [omega[i] for i in keep]
    periods = [periods[i] for i in keep]
    frequencies = [frequencies[i] for i in keep]

    node_ids = [int(n["id"]) for n in nodes]

    # Formas modales (DOFs: 1=UX, 2=UY, 3=UZ)
    phi_x = []  # shape: [modos retenidos][num_nodes]
    phi_y = []

    for orig_idx in keep:
        mode_idx = orig_idx + 1  # numeración 1-based del solver
        mode_x = []
        mode_y = []
        for nid in node_ids:
            try:
                vx = ops.nodeEigenvector(nid, mode_idx, 1)  # DOF 1 = UX
                vy = ops.nodeEigenvector(nid, mode_idx, 2)  # DOF 2 = UY
                # Sanitizar por si devuelve complejos
                vx = float(vx.real) if hasattr(vx, "real") else float(vx)
                vy = float(vy.real) if hasattr(vy, "real") else float(vy)
            except Exception:
                vx = vy = 0.0
            mode_x.append(vx)
            mode_y.append(vy)
        phi_x.append(mode_x)
        phi_y.append(mode_y)

    # Masas nodales (extraídas del modelo)
    m_x, m_y = _get_nodal_masses(node_ids)
    total_mass_x = sum(m_x)
    total_mass_y = sum(m_y)

    # Masa participativa CORRECTA vía OpenSees (incluye la rotación del
    # diafragma rígido). La calcula con la matriz de masa real condensada por las
    # restricciones, así que cada dirección suma ≤100%. La fórmula manual de abajo
    # (meff=Ln²/Mn, sumando solo masas traslacionales por nodo) solo es válida con
    # traslación pura (equalDOF); con rigidDiaphragm la rotación de los nodos
    # lejanos descuadra la suma y pasa de 100%. Si modalProperties no está
    # disponible, se cae a la fórmula manual.
    mp = None
    try:
        mp = ops.modalProperties("-return")
        if not isinstance(mp, dict):
            mp = None
    except Exception:
        mp = None

    def _mp_pct(key, i):
        try:
            seq = mp.get(key) if mp else None
            if seq is None or i >= len(seq):
                return None
            value = seq[i]
            value = float(value.real) if hasattr(value, "real") else float(value)
            # nan/inf aparecen en modos degenerados (p.ej. torsión con equalDOF);
            # devolver None para caer al cálculo manual limpio.
            if value != value or value in (float("inf"), float("-inf")):
                return None
            return value
        except Exception:
            return None

    # Usar OpenSees solo si entregó datos limpios para TODOS los modos (sin nan/inf
    # en MX/MY). Si no (típico con equalDOF: el modo torsional degenerado da nan),
    # se usa la fórmula manual completa, que con traslación pura es exacta.
    mp_clean = mp is not None and all(
        _mp_pct("partiMassRatiosMX", i) is not None
        and _mp_pct("partiMassRatiosMY", i) is not None
        for i in keep
    )

    modal_info = []
    cum_mpf_x = 0.0
    cum_mpf_y = 0.0

    # pos = índice en los arreglos filtrados; orig_idx = índice del solver
    # (para leer modalProperties, que está indexado por modo original).
    for pos, orig_idx in enumerate(keep):
        idx = pos
        phi_xi = np.array(phi_x[pos])
        phi_yi = np.array(phi_y[pos])
        mx_arr = np.array(m_x)
        my_arr = np.array(m_y)

        # Modal mass por componente (parte X e Y de la masa generalizada).
        Mn_x = float(np.dot(phi_xi, mx_arr * phi_xi))
        Mn_y = float(np.dot(phi_yi, my_arr * phi_yi))

        # Masa generalizada COMPLETA M_n = φ^T M φ (X + Y). Es propiedad del MODO,
        # no de la dirección, así que va en el denominador de AMBOS gamma. Con
        # rigidDiaphragm un modo de traslación X tiene también componente Y (la
        # rotación del diafragma mueve los nodos excéntricos), por lo que la M_n
        # correcta incluye ambas y reduce el sobre-estimado del desplazamiento.
        # Con equalDOF (traslación pura) φ_y≈0 → M_n=Mn_x → esa ruta NO cambia.
        # Esto hace la deriva (que usa gamma_x) consistente con el cortante (que ya
        # usa la participación de modalProperties, torsión-aware). [fix rigidDiaphragm]
        Mn_full = Mn_x + Mn_y

        # Participation factor: Γ_n = φ^T M {1} / M_n
        # {1} = vector de influencia unitaria en la dirección del sismo
        Ln_x = float(np.dot(phi_xi, mx_arr))  # suma de masas * φ (dirección X)
        Ln_y = float(np.dot(phi_yi, my_arr))

        gamma_x = Ln_x / Mn_full if abs(Mn_full) > 1e-12 else 0.0
        gamma_y = Ln_y / Mn_full if abs(Mn_full) > 1e-12 else 0.0

        # Masa modal efectiva manual (fallback): m*_n = (φ^T M {1})² / (φ^T M φ)
        meff_x = Ln_x**2 / Mn_full if abs(Mn_full) > 1e-12 else 0.0
        meff_y = Ln_y**2 / Mn_full if abs(Mn_full) > 1e-12 else 0.0
        manual_mpf_x = meff_x / total_mass_x * 100 if total_mass_x > 1e-12 else 0.0
        manual_mpf_y = meff_y / total_mass_y * 100 if total_mass_y > 1e-12 else 0.0

        if mp_clean:
            # OpenSees (ya en %). RMZ = masa rotacional = torsión.
            # Indexado por modo ORIGINAL del solver (orig_idx), no filtrado.
            mpf_x = _mp_pct("partiMassRatiosMX", orig_idx)
            mpf_y = _mp_pct("partiMassRatiosMY", orig_idx)
            mpf_rz = _mp_pct("partiMassRatiosRMZ", orig_idx) or 0.0
            cum_x = _mp_pct("partiMassRatiosCumuMX", orig_idx)
            cum_y = _mp_pct("partiMassRatiosCumuMY", orig_idx)
            cum_rz = _mp_pct("partiMassRatiosCumuRMZ", orig_idx) or 0.0
            # 6 GDL completos (para la tabla ETABS de masa participante).
            mpf_uz = _mp_pct("partiMassRatiosMZ", orig_idx) or 0.0
            mpf_rx = _mp_pct("partiMassRatiosRMX", orig_idx) or 0.0
            mpf_ry = _mp_pct("partiMassRatiosRMY", orig_idx) or 0.0
            cum_uz = _mp_pct("partiMassRatiosCumuMZ", orig_idx) or 0.0
            cum_rx = _mp_pct("partiMassRatiosCumuRMX", orig_idx) or 0.0
            cum_ry = _mp_pct("partiMassRatiosCumuRMY", orig_idx) or 0.0
            if cum_x is None:
                cum_mpf_x += mpf_x
                cum_x = cum_mpf_x
            if cum_y is None:
                cum_mpf_y += mpf_y
                cum_y = cum_mpf_y
        else:
            mpf_x = manual_mpf_x
            mpf_y = manual_mpf_y
            mpf_rz = 0.0
            cum_mpf_x += mpf_x
            cum_mpf_y += mpf_y
            cum_x = cum_mpf_x
            cum_y = cum_mpf_y
            cum_rz = 0.0
            mpf_uz = mpf_rx = mpf_ry = 0.0
            cum_uz = cum_rx = cum_ry = 0.0

        modal_info.append(
            {
                "mode": idx + 1,
                "omega": float(omega[idx]),
                "period": float(periods[idx]),
                "frequency": float(frequencies[idx]),
                "gamma_x": float(gamma_x),
                "gamma_y": float(gamma_y),
                "modal_mass_x": float(Mn_x),
                "modal_mass_y": float(Mn_y),
                "mass_participation_x": float(mpf_x),
                "mass_participation_y": float(mpf_y),
                "mass_participation_rz": float(mpf_rz) if mpf_rz is not None else 0.0,
                "cumulative_participation_x": float(cum_x),
                "cumulative_participation_y": float(cum_y),
                "cumulative_participation_rz": (
                    float(cum_rz) if cum_rz is not None else 0.0
                ),
                "mass_participation_uz": float(mpf_uz),
                "mass_participation_rx": float(mpf_rx),
                "mass_participation_ry": float(mpf_ry),
                "cumulative_participation_uz": float(cum_uz),
                "cumulative_participation_rx": float(cum_rx),
                "cumulative_participation_ry": float(cum_ry),
            }
        )

    return {
        "modal_info": modal_info,
        "phi_x": phi_x,
        "phi_y": phi_y,
        "m_x": m_x,
        "m_y": m_y,
        "node_ids": node_ids,
        "num_modes": len(keep),
        "num_modes_requested": num_modes,
        "degenerate_modes_dropped": degenerate_dropped,
    }


def _get_nodal_masses(node_ids: list[int]) -> tuple[list[float], list[float]]:
    """Extrae las masas X e Y de cada nodo directamente desde OpenSees."""
    m_x = []
    m_y = []
    for nid in node_ids:
        try:
            # nodeMass(nodeTag, dof)  dof 1=UX, 2=UY
            mx = float(ops.nodeMass(nid, 1))
            my = float(ops.nodeMass(nid, 2))
        except Exception:
            mx = my = 0.0
        m_x.append(mx)
        m_y.append(my)
    return m_x, m_y


# ─────────────────────────────────────────────────────────
#  4.  ANÁLISIS ESPECTRAL DE RESPUESTA (RSA)
# ─────────────────────────────────────────────────────────


def run_rsa(
    modal_data: dict,
    spectrum: list[tuple[float, float]],
    direction: str = "x",
    combination: str = "SRSS",
    damping_ratio: float = 0.05,
    sa_in_g: bool = True,
    g: float = 9.81,
) -> dict:
    """
    Calcula la respuesta sísmica espectral para una dirección.

    Parámetros:
      modal_data   : resultado de run_modal_analysis()
      spectrum     : [(T_s, Sa)]  espectro de diseño
      direction    : 'x' o 'y'
      combination  : 'SRSS' o 'CQC'
      damping_ratio: ζ para CQC (5% recomendado)
      sa_in_g      : True si el espectro está en [g], False si está en [m/s²]
      g            : aceleración gravitacional

    Retorna:
      {node_id: {dx, dy, dz, ...}, ...}  desplazamientos nodales combinados
      {elem_id: axial combinado, ...}    (solo axial por ahora; se puede extender)
    """
    modal_info = modal_data["modal_info"]
    phi_x = modal_data["phi_x"]  # [modo][nodo]
    phi_y = modal_data["phi_y"]
    m_x = np.array(modal_data["m_x"])
    m_y = np.array(modal_data["m_y"])
    node_ids = modal_data["node_ids"]
    num_modes = len(modal_info)
    num_nodes = len(node_ids)

    # Factor de escala Sa: g → m/s²
    scale = g if sa_in_g else 1.0

    # Desplazamientos spectrales modales D_n = Sa_n / ω_n²
    # Respuesta nodal modal: u_n(i) = Γ_n * φ_n(i) * D_n
    modal_disps_x = np.zeros((num_modes, num_nodes))  # desplazamientos X por modo
    modal_disps_y = np.zeros((num_modes, num_nodes))  # desplazamientos Y por modo

    for idx, mi in enumerate(modal_info):
        T_n = mi["period"]
        omega_n = mi["omega"]
        Sa_n = interpolate_spectrum(spectrum, T_n) * scale  # [m/s²]

        # Desplazamiento espectral Sd = Sa/ω²
        omega_n_safe = (
            float(omega_n.real) if hasattr(omega_n, "real") else float(omega_n)
        )
        Sd_n = Sa_n / (omega_n_safe**2) if omega_n_safe > 1e-9 else 0.0

        # Respuesta modal ACOPLADA a la excitación en una dirección:
        # u(nodo) = Σ_n φ_n(nodo) · Γ_dir,n · Sd_n. El MISMO modo mueve el nudo
        # en X y en Y (la torsión del diafragma acopla ambas), así que bajo
        # excitación X hay respuesta Y real (φ_y·Γ_x·Sd) y viceversa. El factor
        # de participación Γ es el de la DIRECCIÓN EXCITADA; la forma modal
        # aporta las dos componentes. Antes se ponía la transversal en cero
        # (hallazgo #3), lo que anulaba el desplazamiento ortogonal que ETABS sí
        # reporta. NO afecta la deriva primaria (usa modal_node_disps = la
        # componente de la dir. excitada) ni el cortante basal (usa participación).
        phi_xi = np.array(phi_x[idx])
        phi_yi = np.array(phi_y[idx])
        if direction == "x":
            gamma = mi["gamma_x"]
            modal_disps_x[idx] = gamma * phi_xi * Sd_n   # primaria
            modal_disps_y[idx] = gamma * phi_yi * Sd_n   # ortogonal acoplada
        else:  # 'y'
            gamma = mi["gamma_y"]
            modal_disps_y[idx] = gamma * phi_yi * Sd_n   # primaria
            modal_disps_x[idx] = gamma * phi_xi * Sd_n   # ortogonal acoplada

    # ── Combinación modal ──────────────────────────────────
    if combination.upper() == "CQC":
        disp_x_comb = _cqc_combine(modal_disps_x, modal_info, damping_ratio)
        disp_y_comb = _cqc_combine(modal_disps_y, modal_info, damping_ratio)
    else:  # SRSS
        disp_x_comb = _srss_combine(modal_disps_x)
        disp_y_comb = _srss_combine(modal_disps_y)

    # ── Fuerzas sísmicas equivalentes en base (cortante basal) ──
    # Respeta la combinación modal del caso (CQC como ETABS, o SRSS).
    base_shear = _compute_base_shear(
        modal_info, spectrum, direction, scale, m_x, m_y,
        combination=combination, damping_ratio=damping_ratio,
    )

    # ── Empaquetar por nodo ──────────────────────────────────
    displacements = {}
    for i, nid in enumerate(node_ids):
        displacements[nid] = {
            "dx": float(disp_x_comb[i]),
            "dy": float(disp_y_comb[i]),
            "dz": 0.0,
        }

    # Desplazamientos modales detallados (para reporte)
    modal_disps_detail = []
    for idx, mi in enumerate(modal_info):
        modal_disps_detail.append(
            {
                "mode": mi["mode"],
                "period": mi["period"],
                "Sa": float(interpolate_spectrum(spectrum, mi["period"])),
                "disp_max": float(
                    max(
                        abs(modal_disps_x[idx].max()),
                        abs(modal_disps_x[idx].min()),
                        abs(modal_disps_y[idx].max()),
                        abs(modal_disps_y[idx].min()),
                    )
                ),
            }
        )

    return {
        "displacements": displacements,
        "base_shear": base_shear,
        "modal_disps_detail": modal_disps_detail,
        # Desplazamientos POR MODO (en la dirección de este RSA) para la deriva
        # CORRECTA = CQC de las derivas modales por línea de nodos (capta la esquina
        # amplificada por torsión con rigidDiaphragm). node_ids da el orden de nodos;
        # omegas + damping permiten la correlación CQC en _compute_story_drifts.
        "node_ids": [int(n) for n in node_ids],
        "modal_node_disps": (
            modal_disps_x if direction == "x" else modal_disps_y
        ).tolist(),
        # Ambas componentes modales POR SEPARADO para la combinación direccional
        # de la deriva: bajo esta excitación el nudo se mueve en X (modal_disps_x)
        # y en Y (modal_disps_y, la ortogonal acoplada por torsión). La deriva de
        # un caso combina la componente primaria con la ortogonal acoplada del
        # otro RSA (ver _compute_story_drifts).
        "modal_node_disps_x": modal_disps_x.tolist(),
        "modal_node_disps_y": modal_disps_y.tolist(),
        "omegas": [
            float(mi["omega"].real)
            if hasattr(mi["omega"], "real")
            else float(mi["omega"])
            for mi in modal_info
        ],
        "damping_ratio": float(damping_ratio),
    }


def _srss_combine(modal_matrix: np.ndarray) -> np.ndarray:
    """SRSS: √(Σ r_i²)  por cada DOF."""
    return np.sqrt(np.sum(modal_matrix**2, axis=0))


def _cqc_combine(modal_matrix: np.ndarray, modal_info: list, zeta: float) -> np.ndarray:
    """
    CQC: √(Σ_i Σ_j ρ_ij * r_i * r_j)
    ρ_ij = coeficiente de correlación modal (Rosenblueth, 1975)
    """
    num_modes = len(modal_info)
    num_dofs = modal_matrix.shape[1]
    result = np.zeros(num_dofs)

    for k in range(num_dofs):
        rsum = 0.0
        for i in range(num_modes):
            for j in range(num_modes):
                rho = _cqc_rho(modal_info[i]["omega"], modal_info[j]["omega"], zeta)
                rsum += rho * modal_matrix[i, k] * modal_matrix[j, k]
        result[k] = np.sqrt(max(rsum, 0.0))

    return result


def _cqc_rho(omega_i: float, omega_j: float, zeta: float) -> float:
    """Coeficiente de correlación CQC (Der Kiureghian, 1981)."""
    if omega_j < 1e-12:
        return 1.0 if abs(omega_i - omega_j) < 1e-9 else 0.0
    r = omega_i / omega_j
    num = 8 * zeta**2 * (1 + r) * r**1.5
    den = (1 - r**2) ** 2 + 4 * zeta**2 * r * (1 + r) ** 2
    return num / den if abs(den) > 1e-15 else 1.0


def _compute_base_shear(
    modal_info: list,
    spectrum: list,
    direction: str,
    scale: float,
    m_x: np.ndarray,
    m_y: np.ndarray,
    combination: str = "SRSS",
    damping_ratio: float = 0.05,
) -> float:
    """Cortante basal por combinación modal de fuerzas (V_n = meff_n · Sa_n).

    combination:
      - "CQC"  → V = √(ΣΣ ρ_ij·V_i·V_j), igual que ETABS. Con modos cercanos
                 (rigidDiaphragm: traslación+torsión casi degeneradas) los
                 términos cruzados suman y V_CQC ≥ V_SRSS — SRSS subestimaba
                 el cortante ~5-10% frente a ETABS.
      - otro   → SRSS (comportamiento histórico).
    Las fuerzas modales V_n son ≥ 0 (masa efectiva positiva), por lo que la
    correlación cruzada siempre suma.
    """
    shears = []
    total_mass = float(np.sum(m_x)) if direction == "x" else float(np.sum(m_y))
    for mi in modal_info:
        T_n = mi["period"]
        Sa_n = interpolate_spectrum(spectrum, T_n) * scale
        mpf = (
            mi["mass_participation_x"]
            if direction == "x"
            else mi["mass_participation_y"]
        )
        V_n = (mpf / 100) * total_mass * Sa_n
        shears.append(V_n)

    if str(combination or "").upper() == "CQC":
        omegas = [
            float(mi["omega"].real) if hasattr(mi["omega"], "real") else float(mi["omega"])
            for mi in modal_info
        ]
        total = 0.0
        for i, vi in enumerate(shears):
            if vi == 0.0:
                continue
            for j, vj in enumerate(shears):
                if vj == 0.0:
                    continue
                total += _cqc_rho(omegas[i], omegas[j], damping_ratio) * vi * vj
        return float(np.sqrt(abs(total)))

    return float(np.sqrt(sum(v**2 for v in shears)))


def _to_float(value, default=0.0) -> float:
    """Convierte valores a float de forma segura."""
    try:
        if value is None:
            return default
        number = float(value)
        if np.isfinite(number):
            return number
        return default
    except Exception:
        return default


def _get_displacement_for_node(displacements: dict, node_id: int) -> dict:
    """
    Obtiene desplazamientos por nodo aceptando llaves int o string.
    Esto ayuda porque en Python las llaves pueden ser int,
    pero al serializar JSON pueden terminar como string.
    """
    return (
        displacements.get(node_id)
        or displacements.get(str(node_id))
        or {"dx": 0.0, "dy": 0.0, "dz": 0.0}
    )


def _group_nodes_by_story(data: dict, nodes: list, z_tolerance: float = 0.05) -> list:
    """
    Construye niveles/pisos para cálculo de derivas.

    Prioridad:
      1. Si el payload trae stories, se usan.
      2. Si no trae stories, se agrupan nodos por coordenada Z.

    Retorna:
      [
        {
          'name': 'BASE',
          'elevation': 0.0,
          'node_ids': [1, 2, 3, 4]
        },
        ...
      ]
    """
    node_by_id = {int(n["id"]): n for n in nodes}
    stories = (
        data.get("stories") or data.get("story_levels") or data.get("levels") or []
    )

    normalized_stories = []

    # ─────────────────────────────────────────────
    # Caso 1: el frontend manda stories explícitos
    # ─────────────────────────────────────────────
    if isinstance(stories, list) and stories:
        for index, story in enumerate(stories):
            if not isinstance(story, dict):
                continue

            elevation = _to_float(
                story.get("z", story.get("elevation", story.get("elevation_m", 0.0))),
                0.0,
            )

            raw_node_ids = (
                story.get("nodeIds")
                or story.get("node_ids")
                or story.get("nodes")
                or []
            )

            node_ids = []
            for raw_id in raw_node_ids:
                try:
                    nid = int(raw_id)
                    if nid in node_by_id:
                        node_ids.append(nid)
                except Exception:
                    continue

            # Si el story no trajo nodos, buscar por cercanía a Z
            if not node_ids:
                for n in nodes:
                    nid = int(n["id"])
                    z = _to_float(n.get("z", 0.0), 0.0)
                    if abs(z - elevation) <= z_tolerance:
                        node_ids.append(nid)

            if not node_ids:
                continue

            normalized_stories.append(
                {
                    "name": str(
                        story.get("name") or story.get("label") or f"Story {index}"
                    ),
                    "elevation": elevation,
                    "node_ids": sorted(set(node_ids)),
                }
            )

    # ─────────────────────────────────────────────
    # Caso 2: agrupar automáticamente por Z
    # ─────────────────────────────────────────────
    if not normalized_stories:
        groups = []

        for n in nodes:
            nid = int(n["id"])
            z = _to_float(n.get("z", 0.0), 0.0)

            matched = None
            for group in groups:
                if abs(group["elevation"] - z) <= z_tolerance:
                    matched = group
                    break

            if matched is None:
                matched = {
                    "name": None,
                    "elevation": z,
                    "node_ids": [],
                }
                groups.append(matched)

            matched["node_ids"].append(nid)

        groups.sort(key=lambda item: item["elevation"])

        for index, group in enumerate(groups):
            elevation = group["elevation"]
            name = "BASE" if index == 0 else f"STORY {index}"
            normalized_stories.append(
                {
                    "name": name,
                    "elevation": elevation,
                    "node_ids": sorted(set(group["node_ids"])),
                }
            )

    # Orden final de abajo hacia arriba
    normalized_stories.sort(key=lambda item: item["elevation"])

    return normalized_stories


def _average_story_displacement(
    story: dict, displacements: dict, direction: str
) -> float:
    """
    Calcula el desplazamiento promedio de un nivel.
    Para diafragma rígido, todos deberían ser muy parecidos.
    Para modelo sin diafragma, el promedio da una respuesta representativa.
    """
    node_ids = story.get("node_ids", [])
    if not node_ids:
        return 0.0

    values = []

    for nid in node_ids:
        d = _get_displacement_for_node(displacements, int(nid))
        if direction == "x":
            values.append(_to_float(d.get("dx", 0.0), 0.0))
        elif direction == "y":
            values.append(_to_float(d.get("dy", 0.0), 0.0))
        else:
            values.append(0.0)

    if not values:
        return 0.0

    return float(sum(values) / len(values))


def _max_abs_story_displacement(
    story: dict, displacements: dict, direction: str
) -> float:
    """
    Desplazamiento máximo absoluto por nivel.
    Sirve para reporte conservador tipo tabla.
    """
    node_ids = story.get("node_ids", [])
    if not node_ids:
        return 0.0

    values = []

    for nid in node_ids:
        d = _get_displacement_for_node(displacements, int(nid))
        if direction == "x":
            values.append(abs(_to_float(d.get("dx", 0.0), 0.0)))
        elif direction == "y":
            values.append(abs(_to_float(d.get("dy", 0.0), 0.0)))

    if not values:
        return 0.0

    return float(max(values))


def _cqc_modal_story_drift(
    rsa: dict, node_coord: dict, lower: dict, upper: dict, height: float,
    component: str = None,
):
    """Deriva de entrepiso CORRECTA para un RSA de una dirección.

    Para cada línea de nodos (x,y) calcula la deriva MODO POR MODO
    (u_arriba_n − u_abajo_n), las combina con CQC, y toma el MÁXIMO entre líneas.
    Esto capta la amplificación en esquinas por torsión (rigidDiaphragm).

    `component` selecciona qué componente del desplazamiento modal usar:
      - None (default): la componente primaria de la dir. excitada
        (`modal_node_disps`) — comportamiento histórico.
      - "x"/"y": la componente X o Y (`modal_node_disps_x/_y`) para la
        combinación direccional (deriva ortogonal acoplada por torsión).

    El método antiguo (`_average_story_displacement` → restar desplazamientos ya
    combinados con CQC) subestima cuando el piso ROTA y la respuesta se reparte
    entre modos (traslación + torsión): restar dos magnitudes CQC no equivale a
    combinar las derivas modales. Solo coincide con piso uniforme y un modo
    dominante (caso equalDOF), por eso ese método calza con equalDOF pero falla con
    rigidDiaphragm.

    Devuelve la deriva (m) o None si no hay datos por modo (se cae al promedio).
    """
    key = "modal_node_disps" if component is None else f"modal_node_disps_{component}"
    md = rsa.get(key)
    nids = rsa.get("node_ids")
    omegas = rsa.get("omegas")
    if not md or not nids or not omegas or height <= 1e-9:
        return None

    zeta = float(rsa.get("damping_ratio", 0.05))
    idx_of = {int(n): i for i, n in enumerate(nids)}
    num_modes = len(omegas)

    def _xy_map(story):
        m = {}
        for nid in story.get("node_ids", []):
            c = node_coord.get(int(nid))
            if c is not None:
                m[c] = int(nid)
        return m

    up_map = _xy_map(upper)
    lo_map = _xy_map(lower)
    if not up_map:
        return None

    drift_max = 0.0
    for xy, n_up in up_map.items():
        i_up = idx_of.get(n_up)
        if i_up is None:
            continue
        n_lo = lo_map.get(xy)
        i_lo = idx_of.get(n_lo) if n_lo is not None else None

        # Deriva modal por línea: u_arriba_n − u_abajo_n (base fija => u_abajo=0).
        dn = [
            md[mo][i_up] - (md[mo][i_lo] if i_lo is not None else 0.0)
            for mo in range(num_modes)
        ]

        tot = 0.0
        for i in range(num_modes):
            di = dn[i]
            if di == 0.0:
                continue
            for j in range(num_modes):
                tot += _cqc_rho(omegas[i], omegas[j], zeta) * di * dn[j]

        d = float(np.sqrt(abs(tot)))
        if d > drift_max:
            drift_max = d

    return drift_max


def _compute_story_drifts(data: dict, nodes: list, seismic: dict) -> dict:
    """
    Calcula derivas de piso a partir de los desplazamientos RSA.

    Deriva por dirección = CQC de las derivas modales por línea de nodos, máximo
    entre líneas (ver _cqc_modal_story_drift). Si no hay datos por modo, cae al
    método promedio antiguo.

    Retorna una tabla lista para UI:
      Piso | Elevación | Altura | Ux | Uy | Δx/h | Δy/h | Estado
    """
    drift_limit = _to_float(
        data.get(
            "drift_limit", data.get("driftLimit", data.get("story_drift_limit", 0.01))
        ),
        0.01,
    )

    stories = _group_nodes_by_story(data, nodes)

    if len(stories) < 2:
        return {
            "success": False,
            "reason": "No hay suficientes niveles para calcular derivas.",
            "drift_limit": drift_limit,
            "levels": stories,
            "rows": [],
            "summary": {
                "max_drift_ratio_x": 0.0,
                "max_drift_ratio_y": 0.0,
                "governing_direction": None,
                "governing_story": None,
                "status": "NO_STORIES",
            },
        }

    displacements_x = (
        seismic.get("x", {}).get("displacements", {})
        if isinstance(seismic, dict)
        else {}
    )
    displacements_y = (
        seismic.get("y", {}).get("displacements", {})
        if isinstance(seismic, dict)
        else {}
    )

    # RSA por dirección (incluye desplazamientos por modo para la deriva correcta).
    rsa_x = seismic.get("x", {}) if isinstance(seismic, dict) else {}
    rsa_y = seismic.get("y", {}) if isinstance(seismic, dict) else {}

    # Coordenadas por nodo para emparejar líneas (x,y) entre pisos adyacentes.
    node_coord = {}
    for n in nodes or []:
        try:
            node_coord[int(n["id"])] = (
                round(float(n.get("x", 0.0)), 3),
                round(float(n.get("y", 0.0)), 3),
            )
        except Exception:
            pass

    rows = []

    max_ratio_x = 0.0
    max_ratio_y = 0.0
    governing_story = None
    governing_direction = None
    drift_method = "avg"      # se vuelve "cqc_modal" si hay datos por modo
    cum_x = 0.0               # desplazamiento acumulado = suma de derivas (estilo ETABS)
    cum_y = 0.0

    for index in range(1, len(stories)):
        lower = stories[index - 1]
        upper = stories[index]

        lower_z = _to_float(lower.get("elevation", 0.0), 0.0)
        upper_z = _to_float(upper.get("elevation", 0.0), 0.0)
        height = upper_z - lower_z

        if abs(height) < 1e-9:
            height = 0.0

        ux_lower = _average_story_displacement(lower, displacements_x, "x")
        ux_upper = _average_story_displacement(upper, displacements_x, "x")

        uy_lower = _average_story_displacement(lower, displacements_y, "y")
        uy_upper = _average_story_displacement(upper, displacements_y, "y")

        # ── Deriva CORRECTA con COMBINACIÓN DIRECCIONAL (estilo ETABS) ──────────
        # La deriva de un caso en la dirección d combina la respuesta d de AMBAS
        # excitaciones (SRSS, no correlacionadas):
        #   Δx = SRSS( Δx|exc.X (primaria) , Δx|exc.Y (ortogonal acoplada) )
        #   Δy = SRSS( Δy|exc.Y (primaria) , Δy|exc.X (ortogonal acoplada) )
        # rsa_x usa el espectro X del caso (100%) y rsa_y el Y (30% en SDX), así
        # que los factores direccionales del caso ya están en el Sd de cada RSA.
        # La componente ortogonal viene de modal_node_disps_x/_y (respuesta que el
        # mismo modo genera en la dirección transversal por la torsión).
        dx_from_x = _cqc_modal_story_drift(rsa_x, node_coord, lower, upper, height, "x")
        dx_from_y = _cqc_modal_story_drift(rsa_y, node_coord, lower, upper, height, "x")
        dy_from_y = _cqc_modal_story_drift(rsa_y, node_coord, lower, upper, height, "y")
        dy_from_x = _cqc_modal_story_drift(rsa_x, node_coord, lower, upper, height, "y")

        def _srss(*vals):
            present = [v for v in vals if v is not None]
            if not present:
                return None
            return float(np.sqrt(sum(v * v for v in present)))

        drift_x_modal = _srss(dx_from_x, dx_from_y)
        drift_y_modal = _srss(dy_from_y, dy_from_x)

        if drift_x_modal is not None:
            drift_method = "cqc_modal"
            drift_x = drift_x_modal
            drift_x_signed = drift_x_modal  # CQC entrega magnitud (+)
        else:
            drift_x_signed = ux_upper - ux_lower
            drift_x = abs(drift_x_signed)

        if drift_y_modal is not None:
            drift_y = drift_y_modal
            drift_y_signed = drift_y_modal
        else:
            drift_y_signed = uy_upper - uy_lower
            drift_y = abs(drift_y_signed)

        ratio_x = drift_x / height if height > 1e-9 else 0.0
        ratio_y = drift_y / height if height > 1e-9 else 0.0

        # Desplazamiento acumulado = suma de derivas (consistente con tabla ETABS).
        cum_x += drift_x
        cum_y += drift_y
        disp_x_report = cum_x if drift_x_modal is not None else ux_upper
        disp_y_report = cum_y if drift_y_modal is not None else uy_upper

        if ratio_x > max_ratio_x:
            max_ratio_x = ratio_x
            governing_story = upper.get("name")
            governing_direction = "X"

        if ratio_y > max_ratio_y:
            max_ratio_y = ratio_y
            governing_story = upper.get("name")
            governing_direction = "Y"

        row = {
            "story": upper.get("name"),
            "lower_story": lower.get("name"),
            "elevation_m": float(upper_z),
            "lower_elevation_m": float(lower_z),
            "height_m": float(height),
            "node_ids": upper.get("node_ids", []),
            "displacement_x_m": float(disp_x_report),
            "displacement_y_m": float(disp_y_report),
            "max_abs_displacement_x_m": float(
                _max_abs_story_displacement(upper, displacements_x, "x")
            ),
            "max_abs_displacement_y_m": float(
                _max_abs_story_displacement(upper, displacements_y, "y")
            ),
            "drift_x_m": float(drift_x),
            "drift_y_m": float(drift_y),
            "drift_x_signed_m": float(drift_x_signed),
            "drift_y_signed_m": float(drift_y_signed),
            "drift_ratio_x": float(ratio_x),
            "drift_ratio_y": float(ratio_y),
            "drift_percent_x": float(ratio_x * 100.0),
            "drift_percent_y": float(ratio_y * 100.0),
            "status_x": "OK" if ratio_x <= drift_limit else "EXCEEDS",
            "status_y": "OK" if ratio_y <= drift_limit else "EXCEEDS",
        }

        rows.append(row)

    governing_ratio = max(max_ratio_x, max_ratio_y)

    return {
        "success": True,
        "drift_limit": float(drift_limit),
        "levels": stories,
        "rows": rows,
        "summary": {
            "max_drift_ratio_x": float(max_ratio_x),
            "max_drift_ratio_y": float(max_ratio_y),
            "max_drift_percent_x": float(max_ratio_x * 100.0),
            "max_drift_percent_y": float(max_ratio_y * 100.0),
            "governing_ratio": float(governing_ratio),
            "governing_percent": float(governing_ratio * 100.0),
            "governing_direction": governing_direction,
            "governing_story": governing_story,
            "status": "OK" if governing_ratio <= drift_limit else "EXCEEDS",
            "drift_method": drift_method,
        },
    }


# ─────────────────────────────────────────────────────────
#  5.  ANÁLISIS ESTÁTICO + ENVOLVENTE CON SISMO
# ─────────────────────────────────────────────────────────


def run_static_analysis(data: dict) -> dict:
    """Análisis estático lineal. Retorna desplazamientos, reacciones y fuerzas."""
    nodes, elements = build_model_3d(data)

    ops.timeSeries("Linear", 1)
    ops.pattern("Plain", 1, 1)

    loads = data.get("loads", [])
    has_load = False

    for load in loads:
        if not isinstance(load, dict):
            continue

        try:
            nid = int(load.get("node") or load.get("nodeId") or load.get("node_id"))
        except Exception:
            continue

        fx = _to_float(load.get("fx", load.get("FX", 0)), 0.0)
        fy = _to_float(load.get("fy", load.get("FY", 0)), 0.0)
        fz = _to_float(load.get("fz", load.get("FZ", load.get("p", 0))), 0.0)

        mx = _to_float(load.get("mx", load.get("MX", 0)), 0.0)
        my = _to_float(load.get("my", load.get("MY", 0)), 0.0)
        mz = _to_float(load.get("mz", load.get("MZ", 0)), 0.0)

        if any(v != 0 for v in [fx, fy, fz, mx, my, mz]):
            ops.load(nid, fx, fy, fz, mx, my, mz)
            has_load = True

    if not has_load:
        # Análisis vacío → devolver ceros
        nids = [int(n["id"]) for n in nodes]
        displacements = {
            nid: {"dx": 0, "dy": 0, "dz": 0, "rx": 0, "ry": 0, "rz": 0} for nid in nids
        }
        reactions = {
            nid: {"fx": 0, "fy": 0, "fz": 0, "mx": 0, "my": 0, "mz": 0} for nid in nids
        }
        forces = {int(e["id"]): _zero_forces() for e in elements}
        return {
            "success": True,
            "displacements": displacements,
            "reactions": reactions,
            "forces": forces,
        }

    ops.constraints("Transformation")
    ops.numberer("RCM")
    ops.system("BandGeneral")
    ops.test("NormDispIncr", 1e-6, 10)
    ops.algorithm("Newton")
    ops.integrator("LoadControl", 1.0)
    ops.analysis("Static")

    ok = ops.analyze(1)
    if ok < 0:
        raise RuntimeError(f"Análisis estático falló con código {ok}")

    ops.reactions()
    return _extract_results(nodes, elements)


# ============================================================
# FASE 1 — Fuerzas internas por barra (contrato jhack_frame_force_results)
# ADITIVO y AISLADO: corre su propio análisis estático lineal por caso de
# gravedad y arma el JSON del contrato. NO toca ni usa el pipeline sísmico
# (run_full_seismic_analysis / run_rsa / run_modal_analysis).
# ============================================================


def _ff_kN(value) -> float:
    """N → kN."""
    try:
        return float(value) / 1000.0
    except Exception:
        return 0.0


def _ff_element_length(elem: dict, node_by_id: dict) -> float:
    ni = node_by_id.get(int(elem["node_i"]))
    nj = node_by_id.get(int(elem["node_j"]))
    if not ni or not nj:
        return 0.0
    dx = float(nj.get("x", 0)) - float(ni.get("x", 0))
    dy = float(nj.get("y", 0)) - float(ni.get("y", 0))
    dz = float(nj.get("z", 0)) - float(ni.get("z", 0))
    return (dx * dx + dy * dy + dz * dz) ** 0.5


def _ff_local_axes(elem: dict, node_by_id: dict, nodes: list):
    """
    Vectores unitarios de los ejes locales 2 y 3 (estilo ETABS) para que el
    frontend oriente el diagrama en 3D. local x = (j-i)/L; vecxz define el plano
    x-z; local y = vecxz × x; local z = x × y.
    """
    ni = node_by_id.get(int(elem["node_i"]))
    nj = node_by_id.get(int(elem["node_j"]))
    if not ni or not nj:
        return [0.0, 1.0, 0.0], [0.0, 0.0, 1.0]
    x = np.array(
        [
            float(nj.get("x", 0)) - float(ni.get("x", 0)),
            float(nj.get("y", 0)) - float(ni.get("y", 0)),
            float(nj.get("z", 0)) - float(ni.get("z", 0)),
        ],
        dtype=float,
    )
    nx = float(np.linalg.norm(x))
    if nx < 1e-12:
        return [0.0, 1.0, 0.0], [0.0, 0.0, 1.0]
    x /= nx

    vecxz = elem.get("vecxz")
    if not vecxz:
        vecxz = _auto_vecxz(int(elem["node_i"]), int(elem["node_j"]), nodes)
    vecxz = np.array(vecxz, dtype=float)

    y = np.cross(vecxz, x)
    ny = float(np.linalg.norm(y))
    if ny < 1e-12:
        # vecxz casi paralelo a x: elegir un eje auxiliar estable.
        aux = np.array([0.0, 0.0, 1.0]) if abs(x[2]) < 0.9 else np.array([0.0, 1.0, 0.0])
        y = np.cross(aux, x)
        ny = float(np.linalg.norm(y)) or 1.0
    y /= ny
    z = np.cross(x, y)
    nz = float(np.linalg.norm(z)) or 1.0
    z /= nz

    return [round(float(c), 6) for c in y], [round(float(c), 6) for c in z]


def _ff_stations_from_end_forces(f_local, length: float, num_stations: int):
    """
    Diagrama de fuerzas internas a lo largo de la barra desde las fuerzas de
    extremo en ejes locales (elasticBeamColumn SIN carga de tramo):
      - P, V2, V3, T constantes.
      - M2, M3 lineales (cortante integrado por la luz).
    Mapa OpenSees localForce[0..5] (extremo i) → ETABS:
      [0]=P (axial), [1]=V2 (cortante local 2), [2]=V3 (cortante local 3),
      [3]=T (torsión), [4]=M2 (momento eje 2), [5]=M3 (momento eje 3).
    NOTA: el criterio de signo (ETABS: tracción +) se reconcilia en la
    integración visual; aquí se entrega la magnitud y un diagrama consistente.
    """
    n = max(2, int(num_stations or 5))
    P_i = float(f_local[0])
    V2_i = float(f_local[1])
    V3_i = float(f_local[2])
    T_i = float(f_local[3])
    M2_i = float(f_local[4])
    M3_i = float(f_local[5])
    L = float(length or 0.0)

    stations = []
    for k in range(n):
        rel = k / (n - 1)
        s = rel * L
        stations.append(
            {
                "station": round(s, 6),
                "relativeStation": round(rel, 6),
                "P": _ff_kN(P_i),
                "V2": _ff_kN(V2_i),
                "V3": _ff_kN(V3_i),
                "T": _ff_kN(T_i),
                "M2": _ff_kN(M2_i + V3_i * s),
                "M3": _ff_kN(M3_i - V2_i * s),
            }
        )
    return stations


def _ff_extract_local_force(eid: int):
    """localForce (12) en ejes locales; cae a eleForce global si no existe."""
    for resp in ("localForce", "localForces"):
        try:
            v = ops.eleResponse(eid, resp)
            if v and len(v) >= 6:
                return list(v)
        except Exception:
            pass
    try:
        v = ops.eleForce(eid)
        if v and len(v) >= 6:
            return list(v)
    except Exception:
        pass
    return [0.0] * 12


def _ff_default_design_combos(available) -> list:
    """
    Combos de diseño por defecto (E.060 / como las que muestra ETABS).
    Solo se incluye una combinación si TODOS sus casos referidos están presentes.
    Con gravedad sola (CM, CV) salen 1.4CM+1.7CV, 1.25(CM+CV) y 0.9CM; las que
    llevan ±SDX/±SDY aparecen cuando existan esos casos sísmicos.
    """
    av = set(str(c) for c in (available or []))
    combos = []

    if "CM" in av and "CV" in av:
        combos.append(
            {
                "id": "01 1.4CM+1.7CV",
                "name": "1.4 CM + 1.7 CV",
                "type": "ADD",
                "terms": [
                    {"case": "CM", "factor": 1.4},
                    {"case": "CV", "factor": 1.7},
                ],
            }
        )
        combos.append(
            {
                "id": "1.25(CM+CV)",
                "name": "1.25 (CM + CV)",
                "type": "ADD",
                "terms": [
                    {"case": "CM", "factor": 1.25},
                    {"case": "CV", "factor": 1.25},
                ],
            }
        )

    if "CM" in av:
        combos.append(
            {
                "id": "0.9CM",
                "name": "0.9 CM",
                "type": "ADD",
                "terms": [{"case": "CM", "factor": 0.9}],
            }
        )

    # Combos sísmicos (envolvente ±): solo si existe el caso sísmico correspondiente.
    seismic_specs = [
        ("SDX", "02 1.25(CM+CV)+SDX", "06 0.9CM+SDX"),
        ("SDY", "04 1.25(CM+CV)+SDY", "08 0.9CM+SDY"),
    ]
    for sd, id_grav, id_dead in seismic_specs:
        if sd not in av:
            continue
        if "CM" in av and "CV" in av:
            combos.append(
                {
                    "id": id_grav,
                    "name": f"1.25(CM+CV) ± {sd}",
                    "type": "ENVELOPE",
                    "terms": [
                        {"case": "CM", "factor": 1.25},
                        {"case": "CV", "factor": 1.25},
                        {"case": sd, "factor": 1.0, "signless": True},
                    ],
                }
            )
        if "CM" in av:
            combos.append(
                {
                    "id": id_dead,
                    "name": f"0.9CM ± {sd}",
                    "type": "ENVELOPE",
                    "terms": [
                        {"case": "CM", "factor": 0.9},
                        {"case": sd, "factor": 1.0, "signless": True},
                    ],
                }
            )

    return combos


def _ff_compute_combo_entries(combo: dict, elements: list, case_idx: dict, components: list) -> list:
    """
    Calcula las entradas frameForce de una combinación, estación por estación:
      - ADD: valor = Σ factor·caso.
      - ENVELOPE: genera _Max y _Min; los términos `signless` (sísmicos, sin
        signo por CQC/SRSS) se suman como ±|valor| según la variante.
    Reutiliza length / localAxes / posiciones de estación de los casos base.
    """
    ctype = str(combo.get("type", "ADD")).upper()
    terms = combo.get("terms", []) or []
    variants = [("_Max", 1), ("_Min", -1)] if ctype == "ENVELOPE" else [("", 1)]

    entries = []
    for elem in elements:
        fid = elem.get("id")
        base = None
        for t in terms:
            base = case_idx.get((fid, t["case"]))
            if base:
                break
        if base is None:
            continue

        nst = len(base["stations"])
        for suffix, sgn in variants:
            stations = []
            for k in range(nst):
                row = {
                    "station": base["stations"][k]["station"],
                    "relativeStation": base["stations"][k]["relativeStation"],
                }
                for comp in components:
                    total = 0.0
                    for t in terms:
                        ce = case_idx.get((fid, t["case"]))
                        if not ce:
                            continue
                        val = ce["stations"][k][comp]
                        if t.get("signless"):
                            val = abs(val) * sgn
                        total += float(t.get("factor", 1.0)) * val
                    row[comp] = round(total, 6)
                stations.append(row)

            max_obj = {}
            for comp in components:
                best = max(stations, key=lambda st: abs(st[comp]))
                max_obj[comp] = {"value": best[comp], "station": best["station"]}

            entries.append(
                {
                    "frameId": fid,
                    "caseId": None,
                    "comboId": str(combo.get("id")) + suffix,
                    "length": base["length"],
                    "localAxes": base["localAxes"],
                    "stations": stations,
                    "max": max_obj,
                }
            )
    return entries


def _ff_norm_spectrum(spec):
    """Normaliza espectro [{T,Sa}] o [[T,Sa]] → [(T, Sa)] para interpolate_spectrum."""
    out = []
    for p in spec or []:
        if isinstance(p, dict):
            t = p.get("T", p.get("t"))
            s = p.get("Sa", p.get("sa"))
            if t is not None and s is not None:
                out.append((float(t), float(s)))
        elif isinstance(p, (list, tuple)) and len(p) >= 2:
            out.append((float(p[0]), float(p[1])))
    return out


def _ff_srss1d(values):
    return float(np.sqrt(sum(float(v) * float(v) for v in values)))


def _ff_cqc1d(values, omegas, zeta):
    """Combinación CQC de una lista de respuestas modales (1 valor por modo)."""
    total = 0.0
    n = len(values)
    for i in range(n):
        for j in range(n):
            rho = _cqc_rho(omegas[i], omegas[j], zeta)
            total += rho * float(values[i]) * float(values[j])
    return float(np.sqrt(abs(total)))


def _ff_seismic_modal_base(data: dict, modal_data: dict, directions, elements: list) -> dict:
    """
    Para cada dirección (x/y) y modo, calcula las fuerzas locales de elemento bajo
    la carga modal con Sa=1:  f = Γ_dir,n · M · φ_n  (solo masa traslacional).
    Un análisis estático por (dir, modo). Por linealidad, la fuerza modal real es
    este resultado × Sa_n(espectro, T_n) — así los espectros de cada caso solo
    escalan, sin re-resolver. Rebuild por modo (modelo limpio) = robusto.
    """
    modal_info = modal_data["modal_info"]
    phi_x = modal_data["phi_x"]
    phi_y = modal_data["phi_y"]
    m_x = modal_data["m_x"]
    m_y = modal_data["m_y"]
    node_ids = modal_data["node_ids"]
    num_modes = len(modal_info)

    base = {}
    for dirn in directions:
        base[dirn] = []
        gkey = "gamma_x" if dirn == "x" else "gamma_y"
        for idx in range(num_modes):
            gamma = float(modal_info[idx].get(gkey, 0.0) or 0.0)
            build_model_3d(data)  # modelo limpio para el estático de este modo
            ops.timeSeries("Linear", 1)
            ops.pattern("Plain", 1, 1)
            loaded = False
            for j, nid in enumerate(node_ids):
                fx = gamma * float(m_x[j]) * float(phi_x[idx][j])
                fy = gamma * float(m_y[j]) * float(phi_y[idx][j])
                if fx != 0.0 or fy != 0.0:
                    ops.load(int(nid), fx, fy, 0.0, 0.0, 0.0, 0.0)
                    loaded = True
            if loaded:
                ops.constraints("Transformation")
                ops.numberer("RCM")
                ops.system("BandGeneral")
                ops.test("NormDispIncr", 1e-8, 50)
                ops.algorithm("Linear")
                ops.integrator("LoadControl", 1.0)
                ops.analysis("Static")
                ops.analyze(1)
            forces = {int(e["id"]): _ff_extract_local_force(int(e["id"])) for e in elements}
            base[dirn].append(forces)
    return base


def _ff_compute_seismic_cases(data: dict, seismic_cases, elements: list, components, num_stations: int):
    """
    Fuerzas internas por barra para casos Response Spectrum (SDX/SDY), como
    ENVOLVENTE sin signo: combinación modal (CQC/SRSS) y direccional (SRSS de X,Y).
    Devuelve (entries, meta).
    """
    g = float(data.get("g", 9.81) or 9.81)

    norm_cases = []
    needed_dirs = set()
    for sc in seismic_cases or []:
        if not isinstance(sc, dict):
            continue
        sx = _ff_norm_spectrum(sc.get("spectrumX"))
        sy = _ff_norm_spectrum(sc.get("spectrumY"))
        if not sx and not sy:
            continue
        norm_cases.append(
            {
                "id": str(sc.get("id") or sc.get("name") or "SPEC"),
                "name": str(sc.get("name") or sc.get("id") or "SPEC"),
                "spectrumX": sx,
                "spectrumY": sy,
                "combination": str(sc.get("combination") or sc.get("modalCombination") or "CQC").upper(),
                "damping": float(sc.get("damping", sc.get("dampingRatio", 0.05)) or 0.05),
                "saInG": bool(sc.get("saInG", False)),
            }
        )
        if sx:
            needed_dirs.add("x")
        if sy:
            needed_dirs.add("y")

    if not norm_cases:
        return [], []

    # Build + eigen UNA vez (los modos no dependen del espectro ni del caso).
    nodes, _ = build_model_3d(data)
    node_by_id = {int(n["id"]): n for n in nodes}
    num_modes = int(data.get("num_modes", data.get("numModes", 6)) or 6)
    num_modes = min(num_modes, max(1, len(nodes) * 2))
    # No pedir más modos que GDL dinámicos con masa (evita modos degenerados).
    num_modes = min(num_modes, _max_dynamic_modes(data, nodes))
    modal_data = run_modal_analysis(nodes, num_modes)
    modal_info = modal_data["modal_info"]
    omegas = [mi["omega"] for mi in modal_info]
    periods = [mi["period"] for mi in modal_info]

    # Fuerzas modales base (Sa=1) por dirección/modo — estáticos hechos una vez.
    base = _ff_seismic_modal_base(data, modal_data, needed_dirs, elements)

    lengths = {int(e["id"]): _ff_element_length(e, node_by_id) for e in elements}
    axes = {int(e["id"]): _ff_local_axes(e, node_by_id, nodes) for e in elements}

    entries = []
    meta = []
    for case in norm_cases:
        zeta = case["damping"]
        comb = case["combination"]

        # R por dirección: {eid: [ {comp:val} por estación ]} (envolvente modal).
        dir_results = {}
        for dirn, spec in (("x", case["spectrumX"]), ("y", case["spectrumY"])):
            if not spec or dirn not in base:
                continue
            scale = g if case["saInG"] else 1.0
            sa_per_mode = [interpolate_spectrum(spec, T) * scale for T in periods]
            res = {}
            for e in elements:
                eid = int(e["id"])
                length = lengths[eid]
                per_mode_stations = []
                for idx in range(len(modal_info)):
                    f_scaled = [c * sa_per_mode[idx] for c in base[dirn][idx][eid]]
                    per_mode_stations.append(
                        _ff_stations_from_end_forces(f_scaled, length, num_stations)
                    )
                nst = len(per_mode_stations[0]) if per_mode_stations else 0
                combined = []
                for k in range(nst):
                    row = {}
                    for comp in components:
                        vals = [per_mode_stations[m][k][comp] for m in range(len(per_mode_stations))]
                        row[comp] = (
                            _ff_srss1d(vals) if comb == "SRSS" else _ff_cqc1d(vals, omegas, zeta)
                        )
                    combined.append(row)
                res[eid] = combined
            dir_results[dirn] = res

        # Combinación direccional SRSS(R_x, R_y) → caso (sin signo).
        for e in elements:
            eid = int(e["id"])
            length = lengths[eid]
            axis2, axis3 = axes[eid]
            rx = dir_results.get("x", {}).get(eid)
            ry = dir_results.get("y", {}).get(eid)
            ref = rx if rx is not None else ry
            if ref is None:
                continue
            nst = len(ref)
            stations = []
            for k in range(nst):
                rel = k / (nst - 1) if nst > 1 else 0.0
                row = {"station": round(rel * length, 6), "relativeStation": round(rel, 6)}
                for comp in components:
                    vx = rx[k][comp] if rx is not None else 0.0
                    vy = ry[k][comp] if ry is not None else 0.0
                    row[comp] = round((vx * vx + vy * vy) ** 0.5, 6)
                stations.append(row)
            max_obj = {}
            for comp in components:
                best = max(stations, key=lambda st: abs(st[comp]))
                max_obj[comp] = {"value": best[comp], "station": best["station"]}
            entries.append(
                {
                    "frameId": e.get("id"),
                    "caseId": case["id"],
                    "comboId": None,
                    "length": round(length, 6),
                    "localAxes": {"axis1": "i_to_j", "axis2": axis2, "axis3": axis3},
                    "stations": stations,
                    "max": max_obj,
                    "signless": True,
                }
            )
        meta.append(
            {"id": case["id"], "name": case["name"], "type": "Response Spectrum", "signless": True}
        )

    return entries, meta


def run_frame_force_results(
    data: dict, cases=None, combos=None, seismic_cases=None, num_stations: int = 5
) -> dict:
    """
    FASE 1 del módulo de diagramas: fuerzas internas por barra (P, V2, V3, T,
    M2, M3) por estaciones, para casos estáticos de gravedad, en el contrato
    `jhack_frame_force_results`. Corre un análisis estático lineal propio por
    caso; NO interfiere con el pipeline sísmico.
    """
    if ops is None:
        return {"success": False, "error": "OpenSeesPy no está disponible."}

    all_loads = data.get("loads", []) or []
    elements = data.get("elements", []) or []

    # Normalizar `cases` (acepta lista de ids o de objetos {id,...}).
    if cases:
        cases = [c.get("id") if isinstance(c, dict) else c for c in cases]
        cases = [str(c) for c in cases if c]
    if not cases:
        seen = []
        for ld in all_loads:
            if isinstance(ld, dict):
                cid = _b10_14_load_case(ld)
                if cid and cid not in seen:
                    seen.append(cid)
        cases = seen or ["DEAD"]

    case_meta = [{"id": c, "name": c, "type": "Linear Static"} for c in cases]

    components = ["P", "V2", "V3", "T", "M2", "M3"]
    frame_forces = []
    joint_displacements = []
    summary_acc = {
        k: {"frameId": None, "caseId": None, "value": 0.0} for k in components
    }

    for case_id in cases:
        # 1) Modelo limpio + cargas del caso + estático lineal.
        nodes, _elements_built = build_model_3d(data)
        node_by_id = {int(n["id"]): n for n in nodes}

        ops.timeSeries("Linear", 1)
        ops.pattern("Plain", 1, 1)
        has_load = False

        for ld in all_loads:
            if not isinstance(ld, dict):
                continue
            if _b10_14_load_case(ld) != case_id:
                continue
            node = ld.get("node") or ld.get("nodeId") or ld.get("node_id")
            if node is None:
                continue
            try:
                nid = int(node)
            except Exception:
                continue
            fx = _to_float(ld.get("fx", ld.get("FX", 0)), 0.0)
            fy = _to_float(ld.get("fy", ld.get("FY", 0)), 0.0)
            fz = _to_float(ld.get("fz", ld.get("FZ", ld.get("p", 0))), 0.0)
            mx = _to_float(ld.get("mx", ld.get("MX", 0)), 0.0)
            my = _to_float(ld.get("my", ld.get("MY", 0)), 0.0)
            mz = _to_float(ld.get("mz", ld.get("MZ", 0)), 0.0)
            if any(v != 0 for v in (fx, fy, fz, mx, my, mz)):
                ops.load(nid, fx, fy, fz, mx, my, mz)
                has_load = True

        if has_load:
            ops.constraints("Transformation")
            ops.numberer("RCM")
            ops.system("BandGeneral")
            ops.test("NormDispIncr", 1e-8, 50)
            ops.algorithm("Newton")
            ops.integrator("LoadControl", 1.0)
            ops.analysis("Static")
            ops.analyze(1)
            ops.reactions()

        # 2) Desplazamientos nodales del caso (para la deformada).
        for n in nodes:
            nid = int(n["id"])
            try:
                d = ops.nodeDisp(nid)
            except Exception:
                d = [0, 0, 0, 0, 0, 0]
            joint_displacements.append(
                {
                    "jointId": n.get("id"),
                    "caseId": case_id,
                    "ux": float(d[0]),
                    "uy": float(d[1]),
                    "uz": float(d[2]),
                    "rx": float(d[3]),
                    "ry": float(d[4]),
                    "rz": float(d[5]),
                }
            )

        # 3) Fuerzas internas por barra (ejes locales) y estaciones.
        for elem in elements:
            eid = int(elem["id"])
            length = _ff_element_length(elem, node_by_id)
            f_local = _ff_extract_local_force(eid)
            stations = _ff_stations_from_end_forces(f_local, length, num_stations)
            axis2, axis3 = _ff_local_axes(elem, node_by_id, nodes)

            max_obj = {}
            for comp in components:
                best = max(stations, key=lambda st: abs(st[comp]))
                max_obj[comp] = {"value": best[comp], "station": best["station"]}
                if abs(best[comp]) > abs(summary_acc[comp]["value"]):
                    summary_acc[comp] = {
                        "frameId": elem.get("id"),
                        "caseId": case_id,
                        "value": best[comp],
                    }

            frame_forces.append(
                {
                    "frameId": elem.get("id"),
                    "caseId": case_id,
                    "comboId": None,
                    "length": round(length, 6),
                    "localAxes": {
                        "axis1": "i_to_j",
                        "axis2": axis2,
                        "axis3": axis3,
                    },
                    "stations": stations,
                    "max": max_obj,
                }
            )

    # ── Casos sísmicos (Response Spectrum → fuerzas de elemento, envolvente) ──
    if seismic_cases:
        seismic_entries, seismic_meta = _ff_compute_seismic_cases(
            data, seismic_cases, elements, components, num_stations
        )
        frame_forces.extend(seismic_entries)
        case_meta.extend(seismic_meta)

    # ── Combinaciones de carga (ADD / ENVELOPE) ──────────────────────────────
    available_case_ids = [c["id"] for c in case_meta]
    if combos is None:
        combo_defs = _ff_default_design_combos(available_case_ids)
    else:
        combo_defs = combos or []

    case_idx = {}
    for entry in frame_forces:
        if entry.get("caseId") is not None:
            case_idx[(entry["frameId"], entry["caseId"])] = entry

    combo_meta = []
    for combo in combo_defs:
        combo_entries = _ff_compute_combo_entries(combo, elements, case_idx, components)
        if not combo_entries:
            continue
        frame_forces.extend(combo_entries)
        combo_meta.append(
            {
                "id": str(combo.get("id")),
                "name": combo.get("name") or str(combo.get("id")),
                "type": str(combo.get("type", "ADD")).upper(),
            }
        )

    # ── Resumen global (máx |·| sobre casos Y combos) ────────────────────────
    summary_acc = {
        k: {"frameId": None, "caseId": None, "comboId": None, "value": 0.0}
        for k in components
    }
    for entry in frame_forces:
        for comp in components:
            v = entry["max"][comp]["value"]
            if abs(v) > abs(summary_acc[comp]["value"]):
                summary_acc[comp] = {
                    "frameId": entry.get("frameId"),
                    "caseId": entry.get("caseId"),
                    "comboId": entry.get("comboId"),
                    "value": v,
                }
    summary = {f"maxAbs{k}": summary_acc[k] for k in components}

    return {
        "success": True,
        "type": "jhack_frame_force_results",
        "version": "B-FORCES-01",
        "source": "backend_real",
        "units": {
            "force": "kN",
            "moment": "kN-m",
            "length": "m",
            "displacement": "m",
        },
        "cases": case_meta,
        "combos": combo_meta,
        "components": components,
        "frameForces": frame_forces,
        "jointDisplacements": joint_displacements,
        "summary": summary,
    }


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


def _node_mass_for_direction(node: dict, direction: str) -> float:
    """
    Obtiene masa nodal para X/Y.
    """
    direction = direction.lower()

    keys = [
        f"_effective_mass_{direction}",
        f"effective_mass_{direction}",
        f"effectiveMass{direction.upper()}",
        f"mass_{direction}",
        f"m{direction}",
        f"M{direction.upper()}",
    ]

    for key in keys:
        try:
            value = node.get(key)
            number = float(value)
            if number == number:
                return max(number, 0.0)
        except Exception:
            pass

    mass_obj = node.get("mass")

    if isinstance(mass_obj, dict):
        for key in [direction, direction.upper(), f"m{direction}", f"mass_{direction}"]:
            try:
                number = float(mass_obj.get(key))
                if number == number:
                    return max(number, 0.0)
            except Exception:
                pass

    try:
        number = float(mass_obj)
        if number == number:
            return max(number, 0.0)
    except Exception:
        pass

    return 0.0


def _story_shear_support_node_ids(data: dict) -> set[int]:
    """
    Obtiene nodos con apoyo desde el payload.
    """
    supports = data.get("supports") or []
    support_ids = set()

    for support in supports:
        if not isinstance(support, dict):
            continue

        raw_id = (
            support.get("node")
            or support.get("nodeId")
            or support.get("node_id")
            or support.get("id")
        )

        try:
            support_ids.add(int(raw_id))
        except Exception:
            pass

    return support_ids


def _build_story_levels_for_shear(
    data: dict, nodes: list, z_tolerance: float = 0.05
) -> list[dict]:
    """
    Agrupa nodos por nivel Z para calcular cortante por piso.
    Excluye base y nodos apoyados.
    """
    if not nodes:
        return []

    support_ids = _story_shear_support_node_ids(data)

    z_values = []
    for node in nodes:
        try:
            z_values.append(float(node.get("z", 0.0)))
        except Exception:
            pass

    if not z_values:
        return []

    base_z = min(z_values)

    groups = []

    for node in nodes:
        try:
            node_id = int(node.get("id"))
            z = float(node.get("z", 0.0))
        except Exception:
            continue

        # No calcular piso en la base.
        if abs(z - base_z) <= z_tolerance:
            continue

        # No usar nodos apoyados.
        if node_id in support_ids:
            continue

        found = None
        for group in groups:
            if abs(group["z"] - z) <= z_tolerance:
                found = group
                break

        if found is None:
            found = {
                "z": z,
                "node_ids": [],
                "nodes": [],
            }
            groups.append(found)

        found["node_ids"].append(node_id)
        found["nodes"].append(node)

    groups = sorted(groups, key=lambda item: item["z"])

    levels = []
    previous_z = base_z

    for index, group in enumerate(groups, start=1):
        z = float(group["z"])
        height = z - previous_z

        levels.append(
            {
                "story": f"STORY {index}",
                "level": f"STORY {index}",
                "z": z,
                "height": height,
                "node_ids": sorted(set(group["node_ids"])),
                "nodes": group["nodes"],
            }
        )

        previous_z = z

    return levels


def _compute_story_shear_direction(
    levels: list, base_shear: float, direction: str
) -> list[dict]:
    """
    Distribuye el cortante basal por altura y masa:
      F_i = V * (m_i * h_i) / sum(m_j * h_j)

    Luego:
      V_story_i = suma de fuerzas desde ese piso hacia arriba.
    """
    if not levels:
        return []

    direction = direction.lower()

    weighted_levels = []
    total_weight = 0.0

    for level in levels:
        mass = sum(
            _node_mass_for_direction(node, direction) for node in level.get("nodes", [])
        )
        z = float(level.get("z", 0.0))
        weight = mass * max(z, 0.0)

        weighted_levels.append(
            {
                **level,
                "mass": mass,
                "distribution_weight": weight,
            }
        )

        total_weight += weight

    # Fallback si no hay masa efectiva.
    if total_weight <= 0:
        count = len(weighted_levels)
        for level in weighted_levels:
            level["lateral_force"] = base_shear / count if count else 0.0
            level["distribution_factor"] = 1.0 / count if count else 0.0
    else:
        for level in weighted_levels:
            factor = level["distribution_weight"] / total_weight
            level["distribution_factor"] = factor
            level["lateral_force"] = base_shear * factor

    rows = []

    for index, level in enumerate(weighted_levels):
        story_shear = sum(
            upper.get("lateral_force", 0.0) for upper in weighted_levels[index:]
        )

        rows.append(
            {
                "story": level.get("story"),
                "level": level.get("level"),
                "z": level.get("z"),
                "height": level.get("height"),
                "node_ids": level.get("node_ids", []),
                "mass": level.get("mass", 0.0),
                "base_shear": base_shear,
                "lateral_force": level.get("lateral_force", 0.0),
                "distribution_factor": level.get("distribution_factor", 0.0),
                "shear": story_shear,
                "story_shear": story_shear,
                "direction": direction.upper(),
                "unit": "N",
            }
        )

    return rows


def _compute_story_shears(data: dict, nodes: list, seismic: dict) -> dict:
    """
    Calcula cortante por piso X/Y para reportes y diagramas.
    """
    levels = _build_story_levels_for_shear(data, nodes)

    base_shear_x = _get_base_shear_value(seismic, "x")
    base_shear_y = _get_base_shear_value(seismic, "y")

    shear_x = _compute_story_shear_direction(levels, base_shear_x, "x")
    shear_y = _compute_story_shear_direction(levels, base_shear_y, "y")

    return {
        "success": True,
        "method": "base_shear_mass_height_distribution",
        "x": shear_x,
        "y": shear_y,
        "summary": {
            "stories": len(levels),
            "base_shear_x": base_shear_x,
            "base_shear_y": base_shear_y,
            "max_story_shear_x": max([row["shear"] for row in shear_x], default=0.0),
            "max_story_shear_y": max([row["shear"] for row in shear_y], default=0.0),
        },
    }


# ─────────────────────────────────────────────────────────
#  B7 - PAQUETE FINAL DE RESULTADOS TIPO ETABS
# ─────────────────────────────────────────────────────────


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
        },
        {
            "case": "SPEC_Y",
            "direction": "Y",
            "base_shear_N": _b7_round(vb_y, 6),
            "base_shear_kN": _b7_round(vb_y / 1000.0, 6),
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
        rows.append(
            {
                "diaphragm": item.get("id", "skipped"),
                "source": item.get("source", ""),
                "method": "skipped",
                "retained_node": None,
                "constrained_nodes": [],
                "node_count": 0,
                "reason": item.get("reason", item),
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


# ============================================================
# B10.14 — Applied Loads tipo ETABS
# ============================================================


def _b10_14_float(value, default=0.0):
    try:
        number = float(value)
        if number == number:
            return number
    except Exception:
        pass
    return float(default)


def _b10_14_load_case(load: dict) -> str:
    return str(
        load.get("loadCase")
        or load.get("load_case")
        or load.get("pattern")
        or load.get("loadPattern")
        or load.get("name")
        or "DEAD"
    ).strip()


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


# ============================================================
# B10.16 — Load Summary tipo ETABS
# ============================================================


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


# ============================================================
# B10.17 — Payload para animación sísmica
# ============================================================


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

# ============================================================
# B10.18 — Contrato final backend / animación sísmica
# ============================================================

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

# ============================================================
# B10.19 — Validación final backend / entrega
# ============================================================

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
        "diaphragm_summary": _b7_table_diaphragm_summary(results),
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


# ─────────────────────────────────────────────────────────
#  B10.1 - AUDITORÍA FÍSICA DEL MODELO
# ─────────────────────────────────────────────────────────


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

    story_drifts = _compute_story_drifts(data, nodes, seismic)

    results["story_drifts"] = story_drifts

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


# ─────────────────────────────────────────────────────────
#  6.  UTILIDADES INTERNAS
# ─────────────────────────────────────────────────────────


def _extract_results(nodes: list, elements: list) -> dict:
    """Lee desplazamientos, reacciones y fuerzas del modelo cargado."""
    displacements = {}
    reactions = {}
    forces = {}

    for n in nodes:
        nid = int(n["id"])
        d = ops.nodeDisp(nid)
        r = ops.nodeReaction(nid)
        displacements[nid] = {
            "dx": float(d[0]),
            "dy": float(d[1]),
            "dz": float(d[2]),
            "rx": float(d[3]),
            "ry": float(d[4]),
            "rz": float(d[5]),
        }
        reactions[nid] = {
            "fx": float(r[0]),
            "fy": float(r[1]),
            "fz": float(r[2]),
            "mx": float(r[3]),
            "my": float(r[4]),
            "mz": float(r[5]),
        }

    for e in elements:
        eid = int(e["id"])
        try:
            f = ops.eleForce(eid)
            forces[eid] = {
                "axial": float(f[0]),
                "shear_y": float(f[1]),
                "shear_z": float(f[2]),
                "torsion": float(f[3]),
                "moment_y": float(f[4]),
                "moment_z": float(f[5]),
            }
        except Exception:
            forces[eid] = _zero_forces()

    return {
        "success": True,
        "displacements": displacements,
        "reactions": reactions,
        "forces": forces,
    }


def _zero_forces() -> dict:
    return {
        "axial": 0,
        "shear_y": 0,
        "shear_z": 0,
        "torsion": 0,
        "moment_y": 0,
        "moment_z": 0,
    }


def _compute_envelope(static: dict, seismic: dict, node_ids: list) -> dict:
    """
    Envolvente: max absoluto entre estático y sísmico (SRSS en X-Y para el sismo).
    Retorna desplazamientos de envolvente por nodo.
    """
    static_d = static.get("displacements", {})
    envelope = {}

    for nid in node_ids:
        sd = static_d.get(nid, {"dx": 0, "dy": 0, "dz": 0})
        dx_static = abs(sd.get("dx", 0))
        dy_static = abs(sd.get("dy", 0))
        dz_static = abs(sd.get("dz", 0))

        # Sismo: SRSS de X e Y
        dx_seis = 0.0
        dy_seis = 0.0
        if "x" in seismic:
            node_d = seismic["x"]["displacements"].get(nid, {})
            dx_seis = abs(node_d.get("dx", 0))
        if "y" in seismic:
            node_d = seismic["y"]["displacements"].get(nid, {})
            dy_seis = abs(node_d.get("dy", 0))

        # Combinación sísmica bidireccional (100%X + 30%Y, o SRSS)
        dx_comb = (dx_seis**2 + (0.3 * dy_seis) ** 2) ** 0.5
        dy_comb = ((0.3 * dx_seis) ** 2 + dy_seis**2) ** 0.5

        envelope[nid] = {
            "dx": float(max(dx_static, dx_comb)),
            "dy": float(max(dy_static, dy_comb)),
            "dz": float(dz_static),
        }

    return {"by_node": envelope}
