"""seismic.solver — CÁLCULO: modal, RSA (CQC/SRSS), cortante basal, derivas, cortantes por piso, estático y fuerzas internas de frame."""

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
    "MIN_VALID_MODE_PERIOD",
    "_average_story_displacement",
    "_build_story_levels_for_shear",
    "_compute_base_shear",
    "_compute_envelope",
    "_compute_story_drifts",
    "_compute_story_shear_direction",
    "_compute_story_shears",
    "_cqc_combine",
    "_cqc_modal_story_drift",
    "_cqc_rho",
    "_extract_results",
    "_ff_compute_combo_entries",
    "_ff_compute_seismic_cases",
    "_ff_cqc1d",
    "_ff_default_design_combos",
    "_ff_element_length",
    "_ff_extract_local_force",
    "_ff_kN",
    "_ff_local_axes",
    "_ff_norm_spectrum",
    "_ff_seismic_modal_base",
    "_ff_srss1d",
    "_ff_stations_from_end_forces",
    "_get_displacement_for_node",
    "_get_nodal_masses",
    "_group_nodes_by_story",
    "_max_abs_story_displacement",
    "_max_dynamic_modes",
    "_node_mass_for_direction",
    "_safe_eigenvalue",
    "_srss_combine",
    "_story_shear_support_node_ids",
    "_zero_forces",
    "_compute_story_accelerations",
    "run_frame_force_results",
    "run_joint_reactions_rsa",
    "run_accidental_torsion_rsa",
    "run_modal_analysis",
    "run_rsa",
    "run_static_analysis",
]


def _safe_eigenvalue(v) -> float:
    """Convierte cualquier eigenvalue (real, complejo, numpy) a float positivo seguro."""
    try:
        # Extraer parte real si es complejo
        real_part = float(v.real) if hasattr(v, "real") else float(v)
        return abs(real_part)  # ω² debe ser positivo; negativo = ruido numérico
    except (TypeError, ValueError):
        return 0.0

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

def run_joint_reactions_rsa(
    data: dict,
    modal_data: dict,
    spectrum: list,
    direction: str = "x",
    combination: str = "CQC",
    damping_ratio: float = 0.05,
    sa_in_g: bool = True,
    g: float = 9.81,
) -> dict:
    """
    Reacciones por nudo de APOYO para una dirección de excitación (RSA).

    Método (igual que ETABS): por cada modo n se aplica la fuerza estática modal
    equivalente F_n = Γ_n · Sa_n · M · φ_n a los nudos libres, se resuelve un
    estático lineal y se leen las reacciones en los apoyos; luego se combinan
    entre modos (CQC/SRSS) por nudo y GDL.

    AISLADO: reconstruye su propio modelo por modo (mismo idiom que
    run_frame_force_results, que ya convive con el pipeline sin interferir) y no
    modifica los resultados existentes. Ante cualquier problema devuelve {}.

    Devuelve {node_id: [FX, FY, FZ, MX, MY, MZ]} en N y N·m (magnitudes ≥ 0).
    """
    if ops is None:
        return {}

    modal_info = modal_data.get("modal_info") or []
    phi_x = modal_data.get("phi_x") or []
    phi_y = modal_data.get("phi_y") or []
    m_x = modal_data.get("m_x") or []
    m_y = modal_data.get("m_y") or []
    node_ids = modal_data.get("node_ids") or []
    num_modes = len(modal_info)

    if num_modes == 0 or not node_ids:
        return {}

    support_ids = []
    for s in data.get("supports", []) or []:
        try:
            support_ids.append(int(s["node"]))
        except Exception:
            continue
    if not support_ids:
        return {}

    scale = g if sa_in_g else 1.0
    ndof = 6
    modal_R = {sid: np.zeros((num_modes, ndof)) for sid in support_ids}

    for n, mi in enumerate(modal_info):
        Sa_n = interpolate_spectrum(spectrum, mi["period"]) * scale
        gamma = mi["gamma_x"] if direction == "x" else mi["gamma_y"]

        # Modelo propio y limpio por modo (aislado, como run_frame_force_results).
        build_model_3d(data)

        ops.timeSeries("Linear", 1)
        ops.pattern("Plain", 1, 1)

        applied = False
        for i, nid in enumerate(node_ids):
            fx = gamma * Sa_n * float(m_x[i]) * float(phi_x[n][i])
            fy = gamma * Sa_n * float(m_y[i]) * float(phi_y[n][i])
            if fx != 0.0 or fy != 0.0:
                ops.load(int(nid), fx, fy, 0.0, 0.0, 0.0, 0.0)
                applied = True

        if not applied:
            continue

        ops.constraints("Transformation")
        ops.numberer("RCM")
        ops.system("BandGeneral")
        ops.test("NormDispIncr", 1e-8, 50)
        ops.algorithm("Linear")
        ops.integrator("LoadControl", 1.0)
        ops.analysis("Static")
        ops.analyze(1)
        ops.reactions()

        for sid in support_ids:
            try:
                r = ops.nodeReaction(sid)
            except Exception:
                r = []
            modal_R[sid][n] = [float(r[k]) if k < len(r) else 0.0 for k in range(ndof)]

    combo = str(combination or "SRSS").upper()
    out = {}
    for sid in support_ids:
        mat = modal_R[sid]  # (modos × 6)
        combined = (
            _cqc_combine(mat, modal_info, damping_ratio)
            if combo == "CQC"
            else _srss_combine(mat)
        )
        out[sid] = [float(v) for v in combined]

    return out

def run_accidental_torsion_rsa(
    data: dict,
    modal_data: dict,
    spectrum: list,
    direction: str = "x",
    combination: str = "CQC",
    damping_ratio: float = 0.05,
    sa_in_g: bool = True,
    g: float = 9.81,
    ecc_ratio: float = 0.05,
) -> dict:
    """
    Contribución de la TORSIÓN ACCIDENTAL (E.030 art. 4.6 / ETABS ECC 0.05) a los
    desplazamientos de piso, para una dirección de excitación, como caso ESTÁTICO
    ADITIVO (el usuario eligió este método sobre el desplazamiento de CM+envolvente).

    Por cada modo n se aplica en el NODO MAESTRO de cada diafragma un momento torsor
    accidental M_z = e · F_piso,n, donde e = ecc_ratio · B_perp (B_perp = dimensión
    del piso perpendicular a la dirección) y F_piso,n = Σ fuerza inercial modal del
    piso en la dirección excitada (Γ_n·Sa_n·mᵢ·φᵢ). Se resuelve un estático lineal
    y se leen los desplazamientos nodales; se combinan entre modos (CQC/SRSS).

    AISLADO: reconstruye su propio modelo por modo (mismo idiom que
    run_joint_reactions_rsa) → NO altera el flujo base. Solo tiene efecto cuando el
    piso puede ROTAR (diafragma `rigidDiaphragm_z`); con `equalDOF` (sin RZ) la
    contribución es 0 y devuelve {} (torsión imposible, físicamente correcto).

    Devuelve un dict tipo-RSA reutilizable por `_cqc_modal_story_drift`:
      { modal_node_disps_x/_y/[primaria], node_ids, omegas, damping_ratio }
    con los desplazamientos accidentales POR MODO (m). {} si no aplica.
    """
    if ops is None:
        return {}

    modal_info = modal_data.get("modal_info") or []
    phi_x = modal_data.get("phi_x") or []
    phi_y = modal_data.get("phi_y") or []
    m_x = modal_data.get("m_x") or []
    m_y = modal_data.get("m_y") or []
    node_ids = modal_data.get("node_ids") or []
    num_modes = len(modal_info)
    if num_modes == 0 or not node_ids or ecc_ratio <= 0:
        return {}

    node_by_id = {}
    for nd in data.get("nodes", []) or []:
        try:
            node_by_id[int(nd["id"])] = nd
        except Exception:
            continue

    # Construir el modelo una vez para leer los nodos maestros de los diafragmas
    # que realmente ROTAN (rigidDiaphragm_z). Sin rotación → sin torsión accidental.
    build_model_3d(data)
    applied_diaph = (data.get("_rigid_diaphragm_report") or {}).get("applied") or []
    story_masters = []  # [(retained, [node_ids], e)]
    for grp in applied_diaph:
        if grp.get("method") != "rigidDiaphragm_z":
            continue
        nids = [int(x) for x in grp.get("node_ids", []) or []]
        try:
            retained = int(grp.get("retained"))
        except Exception:
            continue
        xs = [float(node_by_id[i].get("x", 0.0)) for i in nids if i in node_by_id]
        ys = [float(node_by_id[i].get("y", 0.0)) for i in nids if i in node_by_id]
        if not xs or not ys:
            continue
        b_perp = (max(ys) - min(ys)) if direction == "x" else (max(xs) - min(xs))
        if b_perp <= 1e-9:
            continue
        story_masters.append((retained, nids, ecc_ratio * b_perp))

    if not story_masters:
        return {}  # ningún diafragma con rotación → torsión accidental nula

    scale = g if sa_in_g else 1.0
    idx_of = {int(n): i for i, n in enumerate(node_ids)}
    nnodes = len(node_ids)
    md_x = [[0.0] * nnodes for _ in range(num_modes)]
    md_y = [[0.0] * nnodes for _ in range(num_modes)]
    omegas = [float(mi["omega"]) for mi in modal_info]

    for n, mi in enumerate(modal_info):
        Sa_n = interpolate_spectrum(spectrum, mi["period"]) * scale
        gamma = mi["gamma_x"] if direction == "x" else mi["gamma_y"]

        build_model_3d(data)  # modelo fresco por modo (diafragmas ya aplicados)
        ops.timeSeries("Linear", 1)
        ops.pattern("Plain", 1, 1)

        applied = False
        for retained, nids, e in story_masters:
            f_story = 0.0
            for nid in nids:
                i = idx_of.get(nid)
                if i is None:
                    continue
                if direction == "x":
                    f_story += gamma * Sa_n * float(m_x[i]) * float(phi_x[n][i])
                else:
                    f_story += gamma * Sa_n * float(m_y[i]) * float(phi_y[n][i])
            m_acc = e * f_story  # momento torsor accidental del piso (modo n)
            if abs(m_acc) > 1e-12:
                ops.load(int(retained), 0.0, 0.0, 0.0, 0.0, 0.0, m_acc)
                applied = True

        if not applied:
            continue

        ops.constraints("Transformation")
        ops.numberer("RCM")
        ops.system("BandGeneral")
        ops.test("NormDispIncr", 1e-8, 50)
        ops.algorithm("Linear")
        ops.integrator("LoadControl", 1.0)
        ops.analysis("Static")
        ops.analyze(1)

        for k, nid in enumerate(node_ids):
            try:
                d = ops.nodeDisp(int(nid))
            except Exception:
                d = []
            md_x[n][k] = float(d[0]) if len(d) > 0 else 0.0
            md_y[n][k] = float(d[1]) if len(d) > 1 else 0.0

    return {
        "modal_node_disps_x": md_x,
        "modal_node_disps_y": md_y,
        "modal_node_disps": md_x if direction == "x" else md_y,
        "node_ids": node_ids,
        "omegas": omegas,
        "damping_ratio": damping_ratio,
    }

def _compute_story_accelerations(data: dict, nodes: list, seismic: dict) -> dict:
    """
    Aceleraciones absolutas por piso (RSA), estilo ETABS.

    A_d(piso) = SRSS( CQC_n[ā_d,n | exc.X] , CQC_n[ā_d,n | exc.Y] ), donde la
    aceleración modal del piso ā_d,n = (desplazamiento modal promedio del piso) ·
    ω_n²  (pseudo-aceleración = ω²·desp). Combinación direccional del caso igual
    que la deriva. Solo UX/UY: el motor no rastrea modos verticales/rotacionales,
    así que UZ = RX = RY = RZ = 0. Es puro postproceso de los datos modales ya
    calculados (no corre nada nuevo, no toca el resto).

    Devuelve {"rows": [{story, z_m, ux, uy, uz, rx, ry, rz}]} en m/s² y rad/s².
    """
    stories = _group_nodes_by_story(data, nodes)
    if not stories:
        return {"rows": []}

    rsa_x = seismic.get("x", {}) if isinstance(seismic, dict) else {}
    rsa_y = seismic.get("y", {}) if isinstance(seismic, dict) else {}
    node_ids = rsa_x.get("node_ids") or rsa_y.get("node_ids") or []
    idx_of = {int(n): i for i, n in enumerate(node_ids)}
    zeta = float(rsa_x.get("damping_ratio") or rsa_y.get("damping_ratio") or 0.05)

    def story_modal_accel(rsa, comp, story):
        disps = rsa.get(f"modal_node_disps_{comp}")
        omegas = rsa.get("omegas") or []
        if not disps or not omegas:
            return None, None
        arr = np.array(disps)  # (modos, nodos)
        cols = [idx_of[int(s)] for s in story.get("node_ids", []) if int(s) in idx_of]
        if not cols:
            return None, None
        story_disp = arr[:, cols].mean(axis=1)               # (modos,)
        w2 = np.array([float(o) for o in omegas]) ** 2
        return story_disp * w2, [float(o) for o in omegas]   # aceleración modal

    def cqc_scalar(values, omegas):
        total = 0.0
        for i in range(len(values)):
            for j in range(len(values)):
                total += _cqc_rho(omegas[i], omegas[j], zeta) * values[i] * values[j]
        return float(np.sqrt(max(total, 0.0)))

    def dir_accel(story, out_comp):
        parts = []
        for rsa in (rsa_x, rsa_y):
            a, om = story_modal_accel(rsa, out_comp, story)
            if a is not None:
                parts.append(cqc_scalar(a, om))
        if not parts:
            return 0.0
        return float(np.sqrt(sum(p * p for p in parts)))

    rows = []
    for st in stories:
        rows.append(
            {
                "story": st.get("name", ""),
                "z_m": float(st.get("elevation", 0.0)),
                "ux": dir_accel(st, "x"),
                "uy": dir_accel(st, "y"),
                "uz": 0.0,
                "rx": 0.0,
                "ry": 0.0,
                "rz": 0.0,
            }
        )

    rows.sort(key=lambda r: -r["z_m"])  # piso más alto arriba
    return {"rows": rows}

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

def _compute_story_drifts(data: dict, nodes: list, seismic: dict, accidental: dict = None) -> dict:
    """
    Calcula derivas de piso a partir de los desplazamientos RSA.

    `accidental` (opt-in): dict {"x": rsa_acc, "y": rsa_acc} con la contribución de
    TORSIÓN ACCIDENTAL por modo (de run_accidental_torsion_rsa). Si es None (default)
    el cálculo es idéntico al histórico. Si viene, su deriva se SUMA a la base
    (método estático aditivo) y se reportan `drift_*_base_m` / `drift_*_accidental_m`.

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

        # ── Torsión accidental (opt-in, aditiva) ──────────────────────────────
        # Deriva accidental por dirección = SRSS de la respuesta accidental de
        # ambas excitaciones (igual criterio direccional que la base). Se SUMA a
        # la deriva base. Sin `accidental` → dax=day=0 (comportamiento histórico).
        drift_x_base = drift_x
        drift_y_base = drift_y
        dax = 0.0
        day = 0.0
        if accidental:
            acc_x = accidental.get("x") or {}
            acc_y = accidental.get("y") or {}
            ax_from_x = _cqc_modal_story_drift(acc_x, node_coord, lower, upper, height, "x")
            ax_from_y = _cqc_modal_story_drift(acc_y, node_coord, lower, upper, height, "x")
            ay_from_y = _cqc_modal_story_drift(acc_y, node_coord, lower, upper, height, "y")
            ay_from_x = _cqc_modal_story_drift(acc_x, node_coord, lower, upper, height, "y")
            dax = _srss(ax_from_x, ax_from_y) or 0.0
            day = _srss(ay_from_y, ay_from_x) or 0.0
            drift_x = drift_x_base + dax
            drift_y = drift_y_base + day

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
            "drift_x_base_m": float(drift_x_base),
            "drift_y_base_m": float(drift_y_base),
            "drift_x_accidental_m": float(dax),
            "drift_y_accidental_m": float(day),
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
