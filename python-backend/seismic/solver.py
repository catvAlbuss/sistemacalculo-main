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
    "_compute_centers_of_mass_rigidity",
    "_compute_story_drifts",
    "_compute_story_shear_direction",
    "_compute_story_shears",
    "_cqc_combine",
    "_cqc_modal_story_drift",
    "_cqc_modal_story_drift_per_line",
    "_combined_max_story_drift",
    "_cqc_rho",
    "_extract_results",
    "_ff_apply_member_loads",
    "_ff_compute_combo_entries",
    "_ff_compute_seismic_cases",
    "_ff_cqc1d",
    "_ff_default_design_combos",
    "_ff_element_length",
    "_ff_envelope_over_combos",
    "_ff_extract_local_force",
    "_ff_fixed_end_forces",
    "_ff_kN",
    "_ff_local_axes",
    "_ff_local_basis",
    "_ff_local_span_load",
    "_ff_member_loads_by_case",
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
    "run_shifted_cm_torsion_rsa",
    "run_modal_analysis",
    "run_rsa",
    "run_static_analysis",
    "run_static_analysis_by_type",
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

    # Coordenadas [x, y, z] alineadas con node_ids — para los momentos de base
    # (brazo de palanca de cada fuerza inercial modal respecto al origen).
    node_coords = [
        [float(n.get("x", 0.0)), float(n.get("y", 0.0)), float(n.get("z", 0.0))]
        for n in nodes
    ]

    return {
        "modal_info": modal_info,
        "phi_x": phi_x,
        "phi_y": phi_y,
        "m_x": m_x,
        "m_y": m_y,
        "node_ids": node_ids,
        "node_coords": node_coords,
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

    # ── Momentos de reacción en la base (volteo MX/MY + torsión MZ) ──
    # ETABS los reporta junto al cortante. Se calculan modo a modo con las
    # fuerzas inerciales modales F = m·Γ·φ·Sa por nudo (misma Γ de la dirección
    # excitada que usan los desplazamientos acoplados arriba), su brazo de
    # palanca respecto al origen (0,0,0), y se combinan entre modos con la MISMA
    # regla (CQC/SRSS) que el cortante:
    #   MY = Σ Fx·z   (volteo alrededor del eje Y, por las fuerzas en X)
    #   MX = Σ Fy·z   (volteo alrededor del eje X, por las fuerzas en Y acopladas)
    #   MZ = Σ (Fy·x − Fx·y)   (torsión en planta)
    coords = modal_data.get("node_coords") or [[0.0, 0.0, 0.0]] * num_nodes
    xc = np.array([c[0] for c in coords])
    yc = np.array([c[1] for c in coords])
    zc = np.array([c[2] for c in coords])

    # Además de los momentos, se acumulan las COMPONENTES DE FUERZA basal en X e
    # Y a partir de las MISMAS fuerzas inerciales modales. Esto captura el
    # cortante ACOPLADO (p.ej. la reacción FX bajo excitación Y, que en modelos
    # con muros —modos muy acoplados UX/UY— es grande): Σ fx_n bajo excitación Y
    # = γ_y·Sa·Σ(m_x·φ_x) = componente X acoplada. El cortante basal "clásico"
    # (_compute_base_shear, vía participación) solo daba la componente PRIMARIA
    # (la de la dirección excitada) y omitía esta — por eso la reacción cruzada
    # salía ~2.5× baja vs ETABS. Se combinan entre modos con la MISMA regla
    # (CQC/SRSS) que momentos y cortante.
    mx_modal, my_modal, mz_modal = [], [], []
    fx_base_modal, fy_base_modal = [], []
    for idx, mi in enumerate(modal_info):
        Sa_n = interpolate_spectrum(spectrum, mi["period"]) * scale
        gamma_dir = mi["gamma_x"] if direction == "x" else mi["gamma_y"]
        fx_n = m_x * gamma_dir * np.array(phi_x[idx]) * Sa_n
        fy_n = m_y * gamma_dir * np.array(phi_y[idx]) * Sa_n
        my_modal.append(float(np.sum(fx_n * zc)))
        mx_modal.append(float(np.sum(fy_n * zc)))
        mz_modal.append(float(np.sum(fy_n * xc - fx_n * yc)))
        fx_base_modal.append(float(np.sum(fx_n)))
        fy_base_modal.append(float(np.sum(fy_n)))

    def _combine_modal_scalar(vals):
        if str(combination or "").upper() == "CQC":
            total = 0.0
            for i, vi in enumerate(vals):
                for j, vj in enumerate(vals):
                    total += _cqc_rho(
                        modal_info[i]["omega"], modal_info[j]["omega"], damping_ratio
                    ) * vi * vj
            return float(np.sqrt(abs(total)))
        return float(np.sqrt(sum(v * v for v in vals)))

    base_moment_mx = _combine_modal_scalar(mx_modal)
    base_moment_my = _combine_modal_scalar(my_modal)
    base_moment_mz = _combine_modal_scalar(mz_modal)
    base_shear_fx = _combine_modal_scalar(fx_base_modal)
    base_shear_fy = _combine_modal_scalar(fy_base_modal)

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
        "base_moment_mx": base_moment_mx,
        "base_moment_my": base_moment_my,
        "base_moment_mz": base_moment_mz,
        # Componentes de fuerza basal (X e Y) de ESTA rama de excitación,
        # incluye el acoplamiento cruzado — ver comentario en el loop de arriba.
        "base_shear_fx": base_shear_fx,
        "base_shear_fy": base_shear_fy,
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

    # Momento torsor accidental TOTAL en la base por modo = Σ_piso (e·F_piso,n).
    # Los torques de piso se suman directo a la base (torsión sobre el eje
    # vertical, sin brazo). Se combinan entre modos abajo (CQC/SRSS) para dar el
    # aporte accidental a la reacción MZ de base — el mismo que ETABS suma al MZ.
    base_torsion_modal = [0.0] * num_modes

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
            base_torsion_modal[n] += m_acc
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

    # Combinación modal (CQC/SRSS) del momento torsor accidental de base.
    if str(combination or "").upper() == "CQC":
        _tot = 0.0
        for i, vi in enumerate(base_torsion_modal):
            for j, vj in enumerate(base_torsion_modal):
                _tot += _cqc_rho(omegas[i], omegas[j], damping_ratio) * vi * vj
        base_accidental_mz = float(np.sqrt(abs(_tot)))
    else:
        base_accidental_mz = float(np.sqrt(sum(v * v for v in base_torsion_modal)))

    return {
        "modal_node_disps_x": md_x,
        "modal_node_disps_y": md_y,
        "modal_node_disps": md_x if direction == "x" else md_y,
        "node_ids": node_ids,
        "omegas": omegas,
        "damping_ratio": damping_ratio,
        # Aporte de la torsión accidental a la reacción MZ de base (N·m). El
        # pipeline lo SUMA al base_moment_mz nominal de la rama correspondiente
        # (torsión accidental es aditiva, no SRSS) para igualar a ETABS.
        "base_accidental_mz": base_accidental_mz,
    }

def run_shifted_cm_torsion_rsa(
    data: dict,
    spectrum: list,
    direction: str = "x",
    combination: str = "CQC",
    damping_ratio: float = 0.05,
    sa_in_g: bool = True,
    g: float = 9.81,
    ecc_ratio: float = 0.05,
    num_modes: int = 12,
    sign: int = 1,
) -> dict:
    """
    Torsión accidental E.030/ETABS por DESPLAZAMIENTO DEL CENTRO DE MASA: en vez
    de sumar un momento estático sobre los modos SIN excentricidad (como
    `run_accidental_torsion_rsa`), se REDISTRIBUYE la masa nodal del diafragma
    (sin tocar posiciones ni elementos) para que el centroide de masa quede
    desplazado ±e = ecc_ratio·B_perp, perpendicular a `direction`, y se vuelve a
    correr el MODAL COMPLETO con esa masa. Así los periodos y formas modales
    capturan el acoplamiento torsión-traslación real de la excentricidad, no una
    respuesta estática montada sobre los modos base.

    Intento previo descartado (documentado por si se reintenta): mover el punto
    de referencia (nodo maestro) del `rigidDiaphragm` en vez de la masa. Se
    comprobó EMPÍRICAMENTE que es un NO-OP: los periodos salían IDÉNTICOS sin
    importar ecc_ratio (0.05 vs 0.25 daban los mismos 15+ dígitos). Motivo: para
    un cuerpo rígido ya perfectamente amarrado, el punto que se declara como
    "maestro" es solo un cambio de coordenadas para describir las MISMAS 3 DOF
    físicas (Ux, Uy, Rz) — un cambio de base no puede alterar los autovalores de
    un sistema físico. La masa real (en los nodos esclavos) nunca se movía. Para
    que el acoplamiento traslación-rotación cambie de verdad hay que cambiar la
    distribución FÍSICA de masa, no la referencia cinemática.

    Redistribución (por grupo de diafragma, en la coordenada perpendicular a
    `direction`, p = y si direction="x", p = x si direction="y"):
        Δm_i = m_i · sign·e·(p_i − p_cm) / I_mass,   I_mass = Σ m_i·(p_i−p_cm)²
        m_i' = m_i + Δm_i
    Por construcción Σm_i' = Σm_i (masa total preservada, Σm_i·(p_i−p_cm)=0 por
    definición de centroide) y el nuevo centroide pesado da exactamente p_cm+e.
    Es la forma estándar de "excentricidad de masa" sin mover nodos ni masa
    total. Solo se REDISTRIBUYE mx/my (mismo factor en ambos ejes, es la misma
    masa física); mz no se toca.

    `sign` = +1 o -1: hay que llamar dos veces (una por signo) y envolver
    (máximo) con la base en `_compute_story_drifts` (mode="envelope") — así lo
    hace ETABS con la excentricidad, no se suma a un caso sin excentricidad.

    AISLADO: usa un `data` COPIADO (nodes con masa ajustada), no modifica el
    original. Requiere un modal fresco (`run_modal_analysis`) → destruye el
    estado eigen del modelo base, igual que `run_accidental_torsion_rsa`: el
    pipeline debe restaurarlo después (build_model_3d + run_modal_analysis sobre
    el modelo original) por la misma razón ya documentada ahí.

    Devuelve un dict con la forma de `run_rsa()` (modal_node_disps_x/_y,
    node_ids, omegas, damping_ratio) YA sobre el modelo CON excentricidad — se
    usa DIRECTO para esa variante (no es un delta a sumar). {} si no aplica
    (sin OpenSees, sin excentricidad, o sin diafragmas rotantes).
    """
    if ops is None or ecc_ratio <= 0:
        return {}

    # 1) Construir una vez el modelo BASE (sin copiar) solo para leer los grupos
    # de diafragma que rotan y la masa nodal efectiva (Mass Source ya resuelto).
    build_model_3d(data)
    applied = (data.get("_rigid_diaphragm_report") or {}).get("applied") or []
    rotating = [grp for grp in applied if grp.get("method") == "rigidDiaphragm_z"]
    if not rotating:
        return {}

    node_by_id = {}
    for nd in data.get("nodes", []) or []:
        try:
            node_by_id[int(nd["id"])] = nd
        except Exception:
            continue

    # Copia SUPERFICIAL de la lista + copia de los dicts de los nodos que se
    # van a tocar (no mutar los nodos del `data` original).
    scaled_by_id = {}

    for grp in rotating:
        nids = [int(x) for x in grp.get("node_ids", []) or []]
        members = [node_by_id[i] for i in nids if i in node_by_id]
        if not members:
            continue

        def node_mass(nd):
            mx = float(nd.get("_effective_mass_x", 0.0) or 0.0)
            my = float(nd.get("_effective_mass_y", 0.0) or 0.0)
            return max(mx, my, 0.0)

        masses = [node_mass(m) for m in members]
        xs = [float(m.get("x", 0.0)) for m in members]
        ys = [float(m.get("y", 0.0)) for m in members]
        wsum = sum(masses)
        if wsum <= 1e-9:
            continue  # sin masa resuelta en el grupo: no hay centroide que desplazar

        x_cm = sum(w * x for w, x in zip(masses, xs)) / wsum
        y_cm = sum(w * y for w, y in zip(masses, ys)) / wsum

        b_perp = (max(ys) - min(ys)) if direction == "x" else (max(xs) - min(xs))
        if b_perp <= 1e-9:
            continue
        e = ecc_ratio * b_perp

        positions = ys if direction == "x" else xs
        p_cm = y_cm if direction == "x" else x_cm
        i_mass = sum(w * (p - p_cm) ** 2 for w, p in zip(masses, positions))
        if i_mass <= 1e-9:
            continue  # todos los nodos en la misma línea perpendicular: no hay brazo

        # Δmᵢ = mᵢ·sign·e·M·(pᵢ−p_cm)/I_mass. El factor M (masa total del grupo)
        # es OBLIGATORIO: el momento de masa que desplaza el centroide e metros
        # es M·e, no e. Sin él, Σ Δmᵢ·(pᵢ−p_cm)=e → desplazamiento real e/M
        # (micras con pisos de ~80 t) → efecto 0.0% (bug detectado en el modelo
        # L real: las 4 variantes corrían pero aportaban exactamente nada).
        for nd, w, p in zip(members, masses, positions):
            factor = 1.0 + sign * e * wsum * (p - p_cm) / i_mass
            factor = max(factor, 0.0)  # no permitir masa negativa
            nid = int(nd["id"])
            new_mx = float(nd.get("_effective_mass_x", 0.0) or 0.0) * factor
            new_my = float(nd.get("_effective_mass_y", 0.0) or 0.0) * factor
            scaled_by_id[nid] = (new_mx, new_my)

    if not scaled_by_id:
        return {}

    # TODOS los nodos pasan su masa efectiva YA RESUELTA (self-weight + Mass
    # Source + manual, del build base del paso 1) como masa manual, y se
    # desactiva el Mass Source para esta corrida aislada — si no, build_model_3d
    # recalcularía el auto y lo SUMARÍA de nuevo encima (masa duplicada). Los
    # nodos del grupo excéntrico llevan la versión REDISTRIBUIDA (scaled_by_id);
    # el resto del edificio (otros pisos, etc.) conserva su masa tal cual, no
    # solo el grupo tocado (si no, el resto del edificio quedaría sin masa).
    variant_nodes = []
    for nd in data.get("nodes", []) or []:
        nid = int(nd.get("id"))
        nd2 = dict(nd)
        if nid in scaled_by_id:
            nd2["mass_x"], nd2["mass_y"] = scaled_by_id[nid]
        else:
            nd2["mass_x"] = float(nd.get("_effective_mass_x", 0.0) or 0.0)
            nd2["mass_y"] = float(nd.get("_effective_mass_y", 0.0) or 0.0)
        nd2["mass_z"] = float(nd.get("_effective_mass_z", 0.0) or 0.0)
        variant_nodes.append(nd2)

    data_variant = dict(data)
    data_variant["nodes"] = variant_nodes
    mass_source_variant = dict(data.get("massSource") or data.get("mass_source") or {})
    mass_source_variant["enabled"] = False
    mass_source_variant["include_self_weight"] = False
    data_variant["massSource"] = mass_source_variant
    data_variant["mass_source"] = mass_source_variant

    build_model_3d(data_variant)
    modal_variant = run_modal_analysis(data_variant["nodes"], num_modes)
    if not modal_variant or not modal_variant.get("modal_info"):
        return {}

    return run_rsa(
        modal_variant, spectrum, direction=direction, combination=combination,
        damping_ratio=damping_ratio, sa_in_g=sa_in_g, g=g,
    )

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

def _cqc_modal_story_drift_per_line(
    rsa: dict, node_coord: dict, lower: dict, upper: dict, height: float,
    component: str = None,
):
    """Deriva de entrepiso CQC de CADA línea de nodos (x,y), sin colapsar al
    máximo — eso lo hace el caller, DESPUÉS de combinar direccionalmente (ver
    _cqc_modal_story_drift más abajo, que sí colapsa, y el porqué de separar
    esto en su propia función).

    `component` selecciona qué componente del desplazamiento modal usar:
      - None (default): la componente primaria de la dir. excitada
        (`modal_node_disps`).
      - "x"/"y": la componente X o Y (`modal_node_disps_x/_y`) para la
        combinación direccional (deriva ortogonal acoplada por torsión).

    El método antiguo (`_average_story_displacement` → restar desplazamientos ya
    combinados con CQC) subestima cuando el piso ROTA y la respuesta se reparte
    entre modos (traslación + torsión): restar dos magnitudes CQC no equivale a
    combinar las derivas modales. Solo coincide con piso uniforme y un modo
    dominante (caso equalDOF), por eso ese método calza con equalDOF pero falla con
    rigidDiaphragm.

    Devuelve {(x,y): deriva_m} o {} si no hay datos por modo (se cae al promedio).
    """
    key = "modal_node_disps" if component is None else f"modal_node_disps_{component}"
    md = rsa.get(key)
    nids = rsa.get("node_ids")
    omegas = rsa.get("omegas")
    if not md or not nids or not omegas or height <= 1e-9:
        return {}

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
        return {}

    # Solo líneas con nudo en AMBOS pisos (continuidad vertical), como ETABS.
    # Un nudo del piso superior SIN nada verticalmente debajo no define una
    # deriva de ENTREPISO: abajo se toma 0.0 y el cociente pasa a ser el
    # desplazamiento ABSOLUTO dividido por la altura del piso, que es otra cosa
    # y siempre sale mayor. Como el caller toma el MÁXIMO entre líneas, basta
    # un nudo colgado para gobernar toda la fila.
    #
    # Medido en MODULO 6 (2026-08-03), Story1 tiene 72 líneas pero solo 20 con
    # nudo en Base:
    #     con par abajo (columnas) -> 0.000037     ETABS 0.000048
    #     sin par abajo            -> 0.000172  ← era la que ganaba (+258%)
    # Y ETABS reporta su máximo en (14.27, 5.655), que SÍ es línea de columna,
    # mientras el nuestro salía en (4.47, 6.83), que no tiene nada debajo.
    # Story2 no se ve afectado: sus 52 líneas tienen par en Story1.
    #
    # Fallback al comportamiento anterior si NINGUNA línea tiene par abajo
    # (p.ej. un techo cuyos nudos no se alinean con el piso de abajo): ahí es
    # preferible una deriva aproximada que ninguna.
    paired = [(xy, n_up) for xy, n_up in up_map.items() if xy in lo_map]
    lines = paired if paired else list(up_map.items())

    result: dict = {}
    for xy, n_up in lines:
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

        result[xy] = float(np.sqrt(abs(tot)))

    return result


def _cqc_modal_story_drift(
    rsa: dict, node_coord: dict, lower: dict, upper: dict, height: float,
    component: str = None,
):
    """Deriva de entrepiso: máximo entre líneas de UNA sola componente/RSA.

    Wrapper de compatibilidad sobre `_cqc_modal_story_drift_per_line` para el
    caso de una sola dirección sin combinar — NO usar para armar la deriva
    direccional de un caso (SDX/SDY), que necesita combinar la primaria y la
    ortogonal ANTES de tomar el máximo (ver `_combined_max_story_drift`,
    y por qué separarlo importa en su docstring).

    Devuelve la deriva (m) o None si no hay datos por modo.
    """
    per_line = _cqc_modal_story_drift_per_line(
        rsa, node_coord, lower, upper, height, component,
    )
    if not per_line:
        return None
    return max(per_line.values())


def _combined_max_story_drift(rsa_a, rsa_b, node_coord, lower, upper, height, component):
    """Deriva direccional de un caso (SDX/SDY): SRSS de la respuesta primaria
    (`rsa_a`) y la ortogonal acoplada (`rsa_b`) EN CADA LÍNEA, y RECIÉN
    DESPUÉS el máximo entre líneas.

    Por qué no alcanza con combinar los dos máximos por separado (el bug que
    reemplaza esta función, 2026-08-03): `max(SRSS(a,b))` para cada línea NO
    es lo mismo que `SRSS(max(a), max(b))` si el máximo de `a` y el de `b`
    caen en líneas DISTINTAS — la segunda forma sobreestima, porque suma dos
    picos que nunca ocurren juntos en el mismo punto del edificio. ETABS
    combina las componentes en el punto, no las magnitudes máximas.

    Medido en MODULO 1 (payload real, 2026-08-03): la sobreestimación fue
    chica en este modelo (0.5%-7.3%, el resto de la brecha con ETABS era
    otra cosa), pero el error crece con cuánto se separen los picos de la
    primaria y la ortogonal — no hay garantía de que sea siempre chico.

    Devuelve la deriva (m), o None si ninguna de las dos RSA tiene datos por
    modo (se cae al promedio, igual que antes).
    """
    a = _cqc_modal_story_drift_per_line(rsa_a, node_coord, lower, upper, height, component)
    b = _cqc_modal_story_drift_per_line(rsa_b, node_coord, lower, upper, height, component)

    if not a and not b:
        return None

    keys = set(a) | set(b)
    best = 0.0
    for xy in keys:
        va = a.get(xy, 0.0)
        vb = b.get(xy, 0.0)
        d = float(np.sqrt(va * va + vb * vb))
        if d > best:
            best = d
    return best


def _compute_centers_of_mass_rigidity(data: dict, nodes: list) -> list:
    """
    Tabla "Centers of Mass and Rigidity" estilo ETABS, por diafragma y piso.

    XCM/YCM = centroide de la masa sísmica EFECTIVA de los nudos del diafragma
    (los mismos `_effective_mass_x/_y` que usa el modal: self-weight + Mass
    Source + masas manuales, resueltos por build_model_3d). Cum/XCCM/YCCM
    acumulan de arriba hacia abajo, como ETABS. XCR/YCR (centro de rigidez)
    requieren 3 soluciones estáticas por piso y aún NO se calculan → quedan
    vacíos, igual que la tabla de ETABS cuando no se piden.

    Cada fila lleva además `z_m` para que el frontend reubique la "araña" del
    diafragma en planta al CM real tras el análisis.
    """
    groups = data.get("diaphragms") or data.get("diaphragm_groups") or []
    if not isinstance(groups, list) or not groups:
        return []

    node_by_id = {}
    for n in nodes or []:
        try:
            node_by_id[int(n["id"])] = n
        except Exception:
            pass

    # Nombre de piso por elevación (reusa la misma agrupación que las derivas).
    stories = _group_nodes_by_story(data, nodes)
    def story_name_of(z):
        for s in stories:
            if abs(_to_float(s.get("elevation", 0.0), 0.0) - z) <= 0.05:
                return s.get("name")
        return f"z={round(z, 2)} m"

    entries = []
    for g in groups:
        if not isinstance(g, dict):
            continue
        node_ids = g.get("nodeIds") or g.get("node_ids") or []
        mx = my = sx = sy = 0.0
        for raw in node_ids:
            nd = node_by_id.get(int(raw)) if str(raw).lstrip("-").isdigit() else None
            if nd is None:
                continue
            m_x = _to_float(nd.get("_effective_mass_x", 0.0), 0.0)
            m_y = _to_float(nd.get("_effective_mass_y", 0.0), 0.0)
            x = _to_float(nd.get("x", 0.0), 0.0)
            y = _to_float(nd.get("y", 0.0), 0.0)
            mx += m_x
            my += m_y
            sx += m_x * x
            sy += m_y * y
        if mx <= 1e-9 and my <= 1e-9:
            continue
        z = _to_float(g.get("z", 0.0), 0.0)
        entries.append({
            "name": str(g.get("name") or g.get("id") or "D1"),
            "z": z,
            "mass_x": mx,
            "mass_y": my,
            "xcm": sx / mx if mx > 1e-9 else 0.0,
            "ycm": sy / my if my > 1e-9 else 0.0,
        })

    # De arriba hacia abajo + acumulado desde el techo (convención ETABS).
    entries.sort(key=lambda e: -e["z"])
    rows = []
    cum_mx = cum_my = cum_sx = cum_sy = 0.0
    for e in entries:
        cum_mx += e["mass_x"]
        cum_my += e["mass_y"]
        cum_sx += e["mass_x"] * e["xcm"]
        cum_sy += e["mass_y"] * e["ycm"]
        rows.append({
            "story": story_name_of(e["z"]),
            "diaphragm": e["name"],
            "mass_x_kg": round(e["mass_x"], 3),
            "mass_y_kg": round(e["mass_y"], 3),
            "xcm_m": round(e["xcm"], 4),
            "ycm_m": round(e["ycm"], 4),
            "cum_mass_x_kg": round(cum_mx, 3),
            "cum_mass_y_kg": round(cum_my, 3),
            "xccm_m": round(cum_sx / cum_mx, 4) if cum_mx > 1e-9 else 0.0,
            "yccm_m": round(cum_sy / cum_my, 4) if cum_my > 1e-9 else 0.0,
            "xcr_m": "",
            "ycr_m": "",
            "z_m": round(e["z"], 3),
        })

    return rows


def _compute_story_drifts(data: dict, nodes: list, seismic: dict, accidental: dict = None) -> dict:
    """
    Calcula derivas de piso a partir de los desplazamientos RSA.

    `accidental` (opt-in): TORSIÓN ACCIDENTAL. Si es None (default) el cálculo es
    idéntico al histórico. Tres formas según `accidental.get("mode")`:
      - "both" (default del pipeline): {"mode":"both", "cm": {...como envelope},
        "add": {...como aditiva}} → deriva final = MÁXIMO(base, envolvente CM±e,
        base + aditiva). Cubre la cancelación CQC del CM±e (modos acoplados de
        frecuencia cercana) con el torque estático, y viceversa.
      - "envelope" (CM±e solo — de run_shifted_cm_torsion_rsa): dict
        {"mode":"envelope", "x":{"plus":rsa,"minus":rsa}, "y":{...}} con el
        modelo re-corrido con la masa del diafragma redistribuida ±e. La
        deriva final es el ENVOLVENTE (máximo) entre la base y ambas variantes.
      - aditiva (de run_accidental_torsion_rsa): dict {"x": rsa_acc,
        "y": rsa_acc} con la contribución por modo SOBRE los modos base; se
        SUMA a la deriva base.
    En ambos casos se reportan `drift_*_base_m` / `drift_*_accidental_m` (esta
    última = el incremento sobre la base, sea por suma o por envolvente).

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
        #
        # `_combined_max_story_drift` combina AMBAS excitaciones EN CADA LÍNEA y
        # recién ahí toma el máximo — no al revés (2026-08-03, ver su docstring:
        # combinar los máximos por separado sobreestima cuando los picos de la
        # primaria y la ortogonal caen en nudos distintos).
        drift_x_modal = _combined_max_story_drift(
            rsa_x, rsa_y, node_coord, lower, upper, height, "x",
        )
        drift_y_modal = _combined_max_story_drift(
            rsa_y, rsa_x, node_coord, lower, upper, height, "y",
        )

        def _srss(*vals):
            present = [v for v in vals if v is not None]
            if not present:
                return None
            return float(np.sqrt(sum(v * v for v in present)))

        # Solo para el envolvente CM±e de abajo (`_envelope_total`), que
        # necesita la contribución ortogonal de la BASE como un escalar ya
        # combinado con la del CM desplazado — no dos líneas independientes
        # que combinar entre sí. Mismo cálculo de siempre (máximo por línea,
        # sin el fix de combinación-antes-de-maximizar); es una aproximación
        # ya documentada en el docstring del bloque de torsión accidental.
        dx_from_y = _cqc_modal_story_drift(rsa_y, node_coord, lower, upper, height, "x")
        dy_from_x = _cqc_modal_story_drift(rsa_x, node_coord, lower, upper, height, "y")

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

        # ── Torsión accidental (opt-in) ───────────────────────────────────────
        # Dos métodos, seleccionados por accidental.get("mode"):
        #  - "additive" (histórico): la deriva accidental (SRSS de ambas
        #    excitaciones, de run_accidental_torsion_rsa) se SUMA a la base.
        #  - "envelope" (CM±e, método ETABS): accidental["x"/"y"] traen variantes
        #    {"plus":rsa,"minus":rsa} sobre un modelo con el nodo maestro del
        #    diafragma desplazado ±e = eccRatio·B_perp (de
        #    run_shifted_cm_torsion_rsa). La deriva final es el ENVOLVENTE
        #    (máximo) entre la base y ambas variantes — reemplaza la base, no se
        #    suma (así lo hace ETABS: la excentricidad IES la condición de
        #    análisis, no un extra sobre el caso sin excentricidad).
        #    Simplificación documentada: el acoplamiento ortogonal (p.ej. la
        #    componente Y de la deriva X) se toma de la base SIN excentricidad
        #    cruzada (no se desplaza el CM en la dirección ortogonal a la vez) —
        #    evita 4 variantes cruzadas adicionales por dirección.
        # Sin `accidental` → deriva idéntica a la histórica.
        drift_x_base = drift_x
        drift_y_base = drift_y
        dax = 0.0
        day = 0.0
        if accidental:
            # "both" (default actual): máximo entre base, CM±e y base+aditivo.
            # Motivo (validado vs ETABS, modelo simétrico 2026-07-15): el CM±e
            # sufre CANCELACIÓN CQC cuando el modo traslacional queda con
            # frecuencia muy cercana al torsional (los modos acoplados se
            # correlacionan y la torsión se anula → +0% donde ETABS da +22%);
            # el aditivo (torque estático, como ETABS) no se cancela nunca pero
            # subestima el acoplamiento real en plantas irregulares. La
            # envolvente de ambos cubre los dos regímenes.
            _mode = accidental.get("mode") or "additive"
            cm_part = (
                accidental.get("cm") if _mode == "both"
                else (accidental if _mode == "envelope" else None)
            )
            add_part = (
                accidental.get("add") if _mode == "both"
                else (accidental if _mode not in ("envelope", "both") else None)
            )

            cand_x = [drift_x_base]
            cand_y = [drift_y_base]

            if cm_part:
                acc_x = cm_part.get("x") or {}
                acc_y = cm_part.get("y") or {}

                def _envelope_total(acc_dir, component, orthogonal_base):
                    best = None
                    for variant_key in ("plus", "minus"):
                        variant = acc_dir.get(variant_key)
                        if not variant:
                            continue
                        primary = _cqc_modal_story_drift(variant, node_coord, lower, upper, height, component)
                        total = _srss(primary, orthogonal_base)
                        if total is not None and (best is None or total > best):
                            best = total
                    return best

                env_x = _envelope_total(acc_x, "x", dx_from_y)
                env_y = _envelope_total(acc_y, "y", dy_from_x)
                if env_x is not None:
                    cand_x.append(env_x)
                if env_y is not None:
                    cand_y.append(env_y)

            if add_part:
                acc_x = add_part.get("x") or {}
                acc_y = add_part.get("y") or {}
                # Mismo fix que la deriva base: combinar en cada línea antes
                # de maximizar (ver _combined_max_story_drift).
                add_x = _combined_max_story_drift(
                    acc_x, acc_y, node_coord, lower, upper, height, "x",
                ) or 0.0
                add_y = _combined_max_story_drift(
                    acc_y, acc_x, node_coord, lower, upper, height, "y",
                ) or 0.0
                cand_x.append(drift_x_base + add_x)
                cand_y.append(drift_y_base + add_y)

            drift_x = max(cand_x)
            drift_y = max(cand_y)
            dax = drift_x - drift_x_base
            day = drift_y - drift_y_base

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

def _run_static_with_loads(nodes: list, elements: list, loads: list) -> dict:
    """Aplica `loads` sobre un modelo ya construido (nodes/elements de
    build_model_3d) y resuelve un estático lineal. Cuerpo compartido por
    run_static_analysis (todas las cargas) y run_static_analysis_by_type
    (solo un subconjunto, p. ej. muerta o viva por separado para /zapatas2)."""
    ops.timeSeries("Linear", 1)
    ops.pattern("Plain", 1, 1)

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

def run_static_analysis(data: dict) -> dict:
    """Análisis estático lineal con todas las cargas. Retorna desplazamientos,
    reacciones y fuerzas."""
    nodes, elements = build_model_3d(data)
    return _run_static_with_loads(nodes, elements, data.get("loads", []))

def run_static_analysis_by_type(data: dict, types: set) -> dict:
    """Igual que run_static_analysis pero solo con las cargas cuyo
    type/loadType esté en `types` (p. ej. {"Dead"} o {"Live", "RoofLive"}).
    Usado para separar reacciones muerta/viva para el cálculo de zapatas
    (/zapatas2), que las necesita como filas independientes en las
    combinaciones de diseño."""
    nodes, elements = build_model_3d(data)
    loads = [
        load
        for load in data.get("loads", [])
        if isinstance(load, dict)
        and str(load.get("type") or load.get("loadType") or "").strip() in types
    ]
    return _run_static_with_loads(nodes, elements, loads)

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

def _ff_local_basis(elem: dict, node_by_id: dict, nodes: list):
    """
    Base local (x, y, z) del elemento como arrays unitarios. Reproduce la misma
    convención que usa `geomTransf Linear` con el `vecxz` del payload:
    local x = (j-i)/L; local y = vecxz × x; local z = x × y.
    """
    fallback = (
        np.array([1.0, 0.0, 0.0]),
        np.array([0.0, 1.0, 0.0]),
        np.array([0.0, 0.0, 1.0]),
    )

    ni = node_by_id.get(int(elem["node_i"]))
    nj = node_by_id.get(int(elem["node_j"]))
    if not ni or not nj:
        return fallback

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
        return fallback
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

    return x, y, z

def _ff_local_axes(elem: dict, node_by_id: dict, nodes: list):
    """
    Vectores unitarios de los ejes locales 2 y 3 (estilo ETABS) para que el
    frontend oriente el diagrama en 3D.
    """
    _x, y, z = _ff_local_basis(elem, node_by_id, nodes)
    return [round(float(c), 6) for c in y], [round(float(c), 6) for c in z]

def _ff_member_loads_by_case(data: dict) -> dict:
    """
    Agrupa `memberLoads[]` del payload por caso de carga y por elemento, en
    coordenadas GLOBALES (la proyección a ejes locales se hace por elemento en
    _ff_local_span_load).

    Devuelve {case_id: {element_id: {"w": [wx, wy, wz],
                                     "points": [(px, py, pz, relDist), ...]}}}
    """
    raw = data.get("memberLoads") or data.get("member_loads") or []
    out: dict = {}

    for ml in raw:
        if not isinstance(ml, dict):
            continue

        eid = ml.get("element", ml.get("elementId", ml.get("frameId")))
        if eid is None:
            continue
        try:
            eid = int(eid)
        except Exception:
            continue

        case_id = _b10_14_load_case(ml)
        if not case_id:
            continue

        slot = out.setdefault(case_id, {}).setdefault(
            eid, {"w": [0.0, 0.0, 0.0], "points": []}
        )

        kind = str(ml.get("kind", ml.get("loadKind", "uniform"))).lower()

        if "point" in kind:
            px = _to_float(ml.get("px", ml.get("PX", 0)), 0.0)
            py = _to_float(ml.get("py", ml.get("PY", 0)), 0.0)
            pz = _to_float(ml.get("pz", ml.get("PZ", 0)), 0.0)
            if px or py or pz:
                rel = _to_float(ml.get("relDist", ml.get("relativeDistance", 0.5)), 0.5)
                rel = min(max(rel, 0.0), 1.0)
                slot["points"].append((px, py, pz, rel))
            continue

        slot["w"][0] += _to_float(ml.get("wx", ml.get("WX", 0)), 0.0)
        slot["w"][1] += _to_float(ml.get("wy", ml.get("WY", 0)), 0.0)
        slot["w"][2] += _to_float(ml.get("wz", ml.get("WZ", 0)), 0.0)

    return out

def _ff_local_span_load(entry: dict, elem: dict, node_by_id: dict, nodes: list, length: float):
    """
    Carga de tramo GLOBAL → ejes locales del elemento, en el formato que
    consumen _ff_apply_member_loads (eleLoad) y _ff_stations_from_end_forces:
      {"w": (wx, wy, wz), "points": [(px, py, pz, a_en_metros), ...]}
    Devuelve None si la barra no tiene carga de tramo.
    """
    if not entry:
        return None

    x, y, z = _ff_local_basis(elem, node_by_id, nodes)

    wg = np.array(entry.get("w", [0.0, 0.0, 0.0]), dtype=float)
    w_local = (
        float(np.dot(wg, x)),
        float(np.dot(wg, y)),
        float(np.dot(wg, z)),
    )

    points = []
    for px, py, pz, rel in entry.get("points", []) or []:
        pg = np.array([px, py, pz], dtype=float)
        points.append(
            (
                float(np.dot(pg, x)),
                float(np.dot(pg, y)),
                float(np.dot(pg, z)),
                float(rel) * float(length or 0.0),
            )
        )

    if not any(abs(c) > 0 for c in w_local) and not points:
        return None

    # ElasticTimoshenkoBeam NO implementa addLoad: `eleLoad` imprime
    # "load type unknown" y sigue de largo, sin lanzar excepción. Como es el
    # elemento por DEFECTO del motor (shearDeformations=True), hay que ir por
    # el camino de cargas nodales equivalentes + corrección de empotramiento.
    formulation = str(elem.get("_formulation", "elasticBeamColumn"))

    return {
        "w": w_local,
        "points": points,
        "_length": float(length or 0.0),
        "_basis": (x, y, z),
        "_nodes": (int(elem["node_i"]), int(elem["node_j"])),
        "_eleload": formulation == "elasticBeamColumn",
    }

def _ff_fixed_end_forces(span: dict):
    """
    Fuerzas de empotramiento perfecto del tramo, en la MISMA convención que el
    vector `p` de OpenSees (localForce), para los 12 gdl: (i0..i5, j0..j5).

    Los signos se midieron contra OpenSees con un elemento biempotrado (ver
    scratchpad ff_fem.py): carga uniforme y puntual en los tres ejes locales.
    Son las expresiones clásicas de Euler-Bernoulli; para una carga UNIFORME
    coinciden con las de Timoshenko (la corrección por cortante se cancela por
    simetría). Para una carga PUNTUAL sobre un elemento Timoshenko quedan
    aproximadas en el orden de Ω = 12EI/(G·Av·L²) — típicamente 2-4 % en vigas
    de pórtico.
    """
    L = float(span.get("_length", 0.0) or 0.0)
    if L <= 0:
        return [0.0] * 12

    wx, wy, wz = span["w"]

    fi = [0.0] * 6
    fj = [0.0] * 6

    # ── Uniforme ──
    fi[0] += -wx * L / 2.0
    fj[0] += -wx * L / 2.0
    fi[1] += -wy * L / 2.0
    fj[1] += -wy * L / 2.0
    fi[2] += -wz * L / 2.0
    fj[2] += -wz * L / 2.0
    fi[4] += wz * L * L / 12.0
    fj[4] += -wz * L * L / 12.0
    fi[5] += -wy * L * L / 12.0
    fj[5] += wy * L * L / 12.0

    # ── Puntual ──
    for px, py, pz, a in span.get("points", ()) or ():
        b = L - a
        fi[0] += -px * b / L
        fj[0] += -px * a / L
        fi[1] += -py * b * b * (3.0 * a + b) / L**3
        fj[1] += -py * a * a * (a + 3.0 * b) / L**3
        fi[2] += -pz * b * b * (3.0 * a + b) / L**3
        fj[2] += -pz * a * a * (a + 3.0 * b) / L**3
        fi[4] += pz * a * b * b / L**2
        fj[4] += -pz * a * a * b / L**2
        fi[5] += -py * a * b * b / L**2
        fj[5] += py * a * a * b / L**2

    return fi + fj

def _ff_apply_member_loads(spans: dict) -> bool:
    """
    Aplica las cargas de tramo. Dos caminos según la formulación del elemento:

      - elasticBeamColumn → `eleLoad` directo (ejes LOCALES, que es lo que
        esperan `-beamUniform` / `-beamPoint`). `localForce` ya devuelve las
        fuerzas de extremo CON el empotramiento incluido.

      - ElasticTimoshenkoBeam → no acepta eleLoad. Se aplica el vector de
        cargas nodales equivalentes (−f_FEM, pasado a ejes globales) en los dos
        extremos, que da EXACTAMENTE los mismos desplazamientos, y se guarda
        `span["fem"]` para sumárselo después a las fuerzas de extremo — porque
        por este camino `localForce` solo trae k·v.

    Devuelve True si aplicó al menos una carga.
    """
    applied = False

    for eid, span in (spans or {}).items():
        if not span:
            continue

        wx, wy, wz = span["w"]
        length = span.get("_length", 0.0)

        if span.get("_eleload", True):
            try:
                if any(abs(c) > 0 for c in (wx, wy, wz)):
                    ops.eleLoad("-ele", int(eid), "-type", "-beamUniform", wy, wz, wx)
                    applied = True

                for px, py, pz, a in span["points"]:
                    rel = (a / length) if length else 0.0
                    ops.eleLoad("-ele", int(eid), "-type", "-beamPoint", py, pz, rel, px)
                    applied = True
            except Exception as exc:  # elemento no creado / tipo inesperado
                print(f"[frame-forces] eleLoad falló en el elemento {eid}: {exc}")

            continue

        fem = _ff_fixed_end_forces(span)
        span["fem"] = fem[:6]

        x, y, z = span["_basis"]
        ni, nj = span["_nodes"]

        for node_id, f in ((ni, fem[:6]), (nj, fem[6:])):
            # Carga nodal equivalente = −f_FEM, de ejes locales a globales.
            force = -(f[0] * x + f[1] * y + f[2] * z)
            moment = -(f[3] * x + f[4] * y + f[5] * z)

            if any(abs(c) > 1e-12 for c in (*force, *moment)):
                ops.load(
                    int(node_id),
                    float(force[0]), float(force[1]), float(force[2]),
                    float(moment[0]), float(moment[1]), float(moment[2]),
                )
                applied = True

    return applied

# Factor de conversión del criterio de signo de OpenSees al de ETABS, por
# componente. CERRADO el 2026-08-06 contra ETABS 22.7.0 con el pórtico de
# validacion-etabs/ (mismo modelo en los dos programas):
#
#              ETABS (tonf, tonf-m)      motor sin corregir      veredicto
#   P  viga        -3.0401                   -3.017              coincide
#   V2 viga x=0.2  -9.6096                   +9.53               INVERTIDO
#   M3 viga x=3.0  +9.2533                   -9.180              INVERTIDO
#   V3 viga (SY)   -0.2663                   +0.266              INVERTIDO
#   T  viga (SY)   -1.408                    -1.407              coincide
#   M2 viga (SY)   -0.7458                   -0.746              coincide
#
# Las magnitudes calzaron dentro del 1% (el resto es que ETABS aplica brazos
# rígidos de nudo automáticos y reporta en la luz libre 0.2–5.8; el motor no
# los modela y reporta 0–6.0). Verificado también con el caso SX, donde no hay
# peso propio de por medio y el calce es del 0.01%.
#
# OJO: M3 y V2 se invierten JUNTOS, y M2 con V3 queda como está. Es
# consistente: la estática de barra exige dM3/ds = −V2 y dM2/ds = +V3, y
# ETABS usa dM2/dx = −V3 — o sea que su par 2 y su par 3 tienen signos
# relativos opuestos entre sí, igual que acá después de la corrección.
_FF_SIGN_TO_ETABS = {"P": -1.0, "V2": -1.0, "V3": -1.0, "T": -1.0, "M2": 1.0, "M3": -1.0}

def _ff_element_end_offsets(elem: dict) -> tuple:
    """
    Brazos rígidos de nudo (i, j) en metros, del payload. Los emite el frontend
    (_buildBeamEndOffsetsForSeismic) como medio ancho de la columna proyectado
    sobre la viga — lo mismo que deduce ETABS solo.
    """
    try:
        oi = float(elem.get("endOffsetI", 0) or 0.0)
        oj = float(elem.get("endOffsetJ", 0) or 0.0)
    except Exception:
        return 0.0, 0.0

    return max(oi, 0.0), max(oj, 0.0)

def _ff_stations_from_end_forces(
    f_local, length: float, num_stations: int, span=None, offsets=(0.0, 0.0)
):
    """
    Diagrama de fuerzas internas a lo largo de la barra, por estática, desde las
    fuerzas de extremo en ejes locales MÁS la carga de tramo aplicada al
    elemento (eleLoad).

    Mapa OpenSees localForce[0..5] (extremo i) → ETABS:
      [0]=P (axial), [1]=V2 (cortante local 2), [2]=V3 (cortante local 3),
      [3]=T (torsión), [4]=M2 (momento eje 2), [5]=M3 (momento eje 3).

    `span` es el resultado de _ff_local_span_load: la carga de tramo YA en ejes
    locales, {"w": (wx, wy, wz), "points": [(px, py, pz, a_metros), ...]}.
    Sin carga de tramo (span=None) queda el caso viejo: P/V/T constantes y M
    lineal.

    Fórmulas (s desde el nudo i, H = Heaviside):
      P(s)  = P_i  + wx·s + Σ Px·H(s−a)
      V2(s) = V2_i + wy·s + Σ Py·H(s−a)
      V3(s) = V3_i + wz·s + Σ Pz·H(s−a)
      T(s)  = T_i
      M2(s) = M2_i + V3_i·s + wz·s²/2 + Σ Pz·(s−a)·H(s−a)
      M3(s) = M3_i − V2_i·s − wy·s²/2 − Σ Py·(s−a)·H(s−a)

    Verificadas contra OpenSees (uniforme en x/y/z, puntual en x/y/z y caso
    hiperestático combinado): el valor en s=L iguala el negativo de la fuerza
    de extremo j, que es la condición de consistencia del diagrama continuo.

    SIGNO DE P Y T — se invierten al publicar (ver _FF_SIGN_TO_ETABS). En
    elasticBeamColumn el vector p de OpenSees vale p(0) = −N y p(3) = −T, así
    que tal cual salían con el signo cambiado respecto de ETABS: una columna con
    100 kN de COMPRESIÓN se reportaba como P = +100 kN (y el visor la pintaba
    verde de "tracción"). ETABS usa tracción positiva. Medido: 100 kN de
    compresión → localForce[0] = +100 kN; torsor aplicado de +50 kN·m →
    localForce[3] = −50 kN·m.

    La inversión es inocua para los casos Response Spectrum: se aplica antes de
    combinar, y tanto CQC como SRSS son invariantes a un cambio de signo global
    de la componente.

    V2/V3/M2/M3 NO se tocan — su criterio contra ETABS sigue sin confirmar.
    """
    n = max(2, int(num_stations or 5))
    L = float(length or 0.0)

    wx = wy = wz = 0.0
    points = ()
    # Elementos sin soporte de eleLoad: la carga entró como nodal equivalente,
    # así que localForce trae solo k·v y hay que devolverle el empotramiento.
    fem = (span or {}).get("fem") or (0.0,) * 6

    end = [float(f_local[k]) + float(fem[k]) for k in range(6)]
    P_i, V2_i, V3_i, T_i, M2_i, M3_i = end

    if span:
        wx, wy, wz = span.get("w", (0.0, 0.0, 0.0))
        points = span.get("points", ()) or ()

    sg = _FF_SIGN_TO_ETABS

    # Rango de reporte: la LUZ LIBRE, entre las caras de los apoyos, igual que
    # ETABS. `station` sigue siendo la distancia absoluta desde el nudo i (así
    # arranca en 0.225 y no en 0), y `relativeStation` va 0..1 sobre esa luz
    # libre — con lo cual los combos del frontend, que cruzan por
    # relativeStation, y el adaptador de diseño RC, que lee 0 / 0.5 / 1, siguen
    # funcionando y ahora se refieren a la cara del apoyo.
    #
    # Las fórmulas de abajo NO cambian: `s` es la misma distancia desde i, solo
    # se muestrea en otro rango. Las fuerzas son las mismas evaluadas en otra
    # estación, no fuerzas distintas.
    off_i, off_j = offsets if offsets else (0.0, 0.0)
    s_start = min(max(off_i, 0.0), L)
    s_end = max(min(L - off_j, L), s_start)

    stations = []
    for k in range(n):
        rel = k / (n - 1)
        s = s_start + rel * (s_end - s_start)

        # Aporte de las cargas puntuales de tramo ya pasadas (s >= a).
        hx = hy = hz = 0.0
        m2p = m3p = 0.0
        for px, py, pz, a in points:
            if s < a - 1e-9:
                continue
            hx += px
            hy += py
            hz += pz
            m2p += pz * (s - a)
            m3p -= py * (s - a)

        stations.append(
            {
                "station": round(s, 6),
                "relativeStation": round(rel, 6),
                # El diagrama se calcula en la convención de OpenSees y recién
                # acá se pasa a la de ETABS, componente por componente
                # (_FF_SIGN_TO_ETABS). Así la estática de arriba queda intacta
                # y el criterio de signo vive en UN solo lugar.
                "P": _ff_kN(sg["P"] * (P_i + wx * s + hx)),
                "V2": _ff_kN(sg["V2"] * (V2_i + wy * s + hy)),
                "V3": _ff_kN(sg["V3"] * (V3_i + wz * s + hz)),
                "T": _ff_kN(sg["T"] * T_i),
                "M2": _ff_kN(sg["M2"] * (M2_i + V3_i * s + wz * s * s / 2.0 + m2p)),
                "M3": _ff_kN(sg["M3"] * (M3_i - V2_i * s - wy * s * s / 2.0 + m3p)),
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
    Combos de diseño por defecto según **E.060 art. 9.2** (norma peruana).

    OJO: NO son las de ETABS "por defecto". ETABS genera sus combos a partir del
    código de diseño elegido, y no trae E.060 en la lista de códigos de concreto
    (solo ACI, Eurocódigo, CSA, NZS, IS, GB...). La práctica peruana es elegir
    ACI 318 y definir las combinaciones de E.060 a mano — que es lo que hace
    esta función. Los factores NO coinciden con ACI:
        E.060: 1.4CM+1.7CV, 1.25(CM+CV)±CS, 0.9CM±CS
        ACI:   1.4D, 1.2D+1.6L, 1.2D+1.0E+1.0L, 0.9D±1.0E

    Acepta la lista de METADATOS de casos ([{id, name, type, patternType}, ...])
    o, por compatibilidad, una lista plana de ids.

    Los casos se clasifican por su TIPO, no por su nombre:
      - sísmicos: `type` == "Response Spectrum" (vienen del diálogo de Response
        Spectrum con el id que le haya puesto el usuario);
      - muerta / viva: `patternType` "Dead" / "Live"-"RoofLive".
    Antes se buscaban los literales "CM", "CV", "SDX" y "SDY", así que un modelo
    que nombrara distinto sus patrones se quedaba SIN NINGÚN combo, en silencio.
    Como fallback, si no llega `patternType` se usan los nombres CM/CV.

    La carga viva de TECHO entra con el mismo factor que la viva: E.060 no la
    separa como el Lr de ACI.
    """
    metas = []
    for c in available or []:
        if isinstance(c, dict):
            metas.append(c)
        else:
            metas.append({"id": str(c), "type": "Linear Static"})

    def _pt(meta):
        return str(meta.get("patternType", "")).strip().lower()

    seismic = [
        m
        for m in metas
        if str(m.get("type", "")).strip().lower() == "response spectrum"
        or m.get("signless")
    ]
    seismic_ids = {str(m.get("id")) for m in seismic}

    dead = [str(m["id"]) for m in metas if _pt(m) == "dead"]
    live = [str(m["id"]) for m in metas if _pt(m) in ("live", "rooflive")]

    # Fallback POR ROL (no todo-o-nada): un payload viejo puede traer el tipo de
    # unos casos y de otros no, y ahí el rol que falta se resuelve por nombre.
    gravity_ids = [
        str(m.get("id")) for m in metas if str(m.get("id")) not in seismic_ids
    ]
    if not dead:
        dead = [c for c in gravity_ids if c.upper() in ("CM", "DEAD", "D")]
    if not live:
        live = [c for c in gravity_ids if c.upper() in ("CV", "CVE", "LIVE", "L")]

    def terms(f_dead, f_live=None, seismic_id=None):
        out = [{"case": c, "factor": f_dead} for c in dead]
        if f_live is not None:
            out += [{"case": c, "factor": f_live} for c in live]
        if seismic_id is not None:
            out.append({"case": seismic_id, "factor": 1.0, "signless": True})
        return out

    label_d = " + ".join(dead) or "CM"
    label_l = " + ".join(live) or "CV"

    combos = []

    if dead and live:
        combos.append(
            {
                "id": "01 1.4CM+1.7CV",
                "name": f"1.4 ({label_d}) + 1.7 ({label_l})",
                "type": "ADD",
                "terms": terms(1.4, 1.7),
            }
        )
        combos.append(
            {
                "id": "1.25(CM+CV)",
                "name": f"1.25 ({label_d} + {label_l})",
                "type": "ADD",
                "terms": terms(1.25, 1.25),
            }
        )

    if dead:
        combos.append(
            {
                "id": "0.9CM",
                "name": f"0.9 ({label_d})",
                "type": "ADD",
                "terms": terms(0.9),
            }
        )

    # Combos sísmicos, uno por cada caso Response Spectrum del modelo. Son de
    # tipo ENVELOPE porque el caso RS viene SIN signo (CQC/SRSS da magnitudes),
    # así que hay que evaluar las dos ramas ±, igual que ETABS.
    n = len(combos)
    for sm in seismic:
        sd = str(sm.get("id"))
        n += 1
        id_grav = f"{n:02d} 1.25(CM+CV)±{sd}"
        n += 1
        id_dead = f"{n:02d} 0.9CM±{sd}"
        if dead and live:
            combos.append(
                {
                    "id": id_grav,
                    "name": f"1.25({label_d} + {label_l}) ± {sd}",
                    "type": "ENVELOPE",
                    "terms": terms(1.25, 1.25, sd),
                }
            )
        if dead:
            combos.append(
                {
                    "id": id_dead,
                    "name": f"0.9({label_d}) ± {sd}",
                    "type": "ENVELOPE",
                    "terms": terms(0.9, None, sd),
                }
            )

    return combos

def _ff_envelope_over_combos(combo_entries: list, components: list) -> tuple:
    """
    Envolvente de DISEÑO: máximo y mínimo, estación por estación, sobre todas
    las combinaciones ya factorizadas.

    Envolver los casos base SIN factorar (que es lo que hacía el frontend) no
    corresponde a nada: la envolvente de diseño se toma sobre los combos.
    Se devuelven Max y Min por separado —no un "max absoluto"— porque en una
    viga el momento positivo de vano y el negativo de apoyo gobiernan armaduras
    distintas, igual que en ETABS.

    Devuelve (entries, meta).
    """
    by_frame: dict = {}
    for e in combo_entries:
        by_frame.setdefault(e["frameId"], []).append(e)

    entries = []
    for fid, group in by_frame.items():
        base = group[0]
        nst = len(base["stations"])
        # Un combo con otra malla de estaciones no se puede envolver por índice.
        group = [g for g in group if len(g["stations"]) == nst]

        for label, pick in (("Max", max), ("Min", min)):
            stations = []
            for k in range(nst):
                row = {
                    "station": base["stations"][k]["station"],
                    "relativeStation": base["stations"][k]["relativeStation"],
                }
                for comp in components:
                    row[comp] = round(
                        pick(float(g["stations"][k][comp]) for g in group), 6
                    )
                stations.append(row)

            max_obj = {}
            for comp in components:
                best = max(stations, key=lambda st: abs(st[comp]))
                max_obj[comp] = {"value": best[comp], "station": best["station"]}

            entries.append(
                {
                    "frameId": fid,
                    "caseId": None,
                    "comboId": f"ENV {label}",
                    "length": base["length"],
                    "localAxes": base["localAxes"],
                    "stations": stations,
                    "max": max_obj,
                }
            )

    meta = []
    if entries:
        meta = [
            {"id": "ENV Max", "name": "Envolvente (máx)", "type": "ENVELOPE_ALL"},
            {"id": "ENV Min", "name": "Envolvente (mín)", "type": "ENVELOPE_ALL"},
        ]

    return entries, meta

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

def _ff_seismic_modal_accidental(
    data: dict, modal_data: dict, directions, elements: list, ecc_ratio: float
) -> dict:
    """
    Igual que `_ff_seismic_modal_base` pero para la TORSIÓN ACCIDENTAL
    (E.030 art. 4.6 / ETABS `ECCENRATIOTYPICAL`): por cada (dirección, modo)
    aplica en el NODO MAESTRO de cada diafragma que ROTA el momento torsor
    accidental `M_z = e · F_piso,n`, con `e = ecc_ratio · B_perp`, y devuelve las
    fuerzas locales de elemento. Con **Sa = 1**, igual que la base, para que el
    espectro de cada caso solo escale después sin re-resolver.

    Método ADITIVO: el mismo que `run_accidental_torsion_rsa` usa para derivas y
    para el MZ de base, y el que se validó contra ETABS (ver esa función). Acá se
    repite el armado en vez de reusarla porque aquella devuelve DESPLAZAMIENTOS
    nodales y esto necesita fuerzas locales de elemento.

    Sin esto las fuerzas sísmicas de barra salían SIN torsión accidental — del
    lado inseguro — mientras el cortante basal sí la incluía.

    Devuelve {} si `ecc_ratio <= 0` o si ningún diafragma rota (con `equalDOF`,
    sin RZ amarrado, el piso no puede rotar y la torsión accidental es nula).
    """
    if ops is None or ecc_ratio <= 0:
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

    node_by_id = {}
    for nd in data.get("nodes", []) or []:
        try:
            node_by_id[int(nd["id"])] = nd
        except Exception:
            continue

    # Un build para leer los maestros de los diafragmas que rotan.
    build_model_3d(data)
    applied_diaph = (data.get("_rigid_diaphragm_report") or {}).get("applied") or []

    # {dirn: [(retained, [nids], e)]} — e depende de la dirección (B_perp).
    masters_by_dir = {}
    for dirn in directions:
        story_masters = []
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
            b_perp = (max(ys) - min(ys)) if dirn == "x" else (max(xs) - min(xs))
            if b_perp <= 1e-9:
                continue
            story_masters.append((retained, nids, ecc_ratio * b_perp))
        if story_masters:
            masters_by_dir[dirn] = story_masters

    if not masters_by_dir:
        return {}

    idx_of = {int(n): i for i, n in enumerate(node_ids)}
    acc = {}

    for dirn, story_masters in masters_by_dir.items():
        acc[dirn] = []
        gkey = "gamma_x" if dirn == "x" else "gamma_y"
        for idx in range(num_modes):
            gamma = float(modal_info[idx].get(gkey, 0.0) or 0.0)
            build_model_3d(data)  # modelo limpio para el estático de este modo
            ops.timeSeries("Linear", 1)
            ops.pattern("Plain", 1, 1)
            applied = False
            for retained, nids, ecc in story_masters:
                f_story = 0.0
                for nid in nids:
                    i = idx_of.get(nid)
                    if i is None:
                        continue
                    if dirn == "x":
                        f_story += gamma * float(m_x[i]) * float(phi_x[idx][i])
                    else:
                        f_story += gamma * float(m_y[i]) * float(phi_y[idx][i])
                m_acc = ecc * f_story
                if abs(m_acc) > 1e-12:
                    ops.load(int(retained), 0.0, 0.0, 0.0, 0.0, 0.0, m_acc)
                    applied = True
            if applied:
                ops.constraints("Transformation")
                ops.numberer("RCM")
                ops.system("BandGeneral")
                ops.test("NormDispIncr", 1e-8, 50)
                ops.algorithm("Linear")
                ops.integrator("LoadControl", 1.0)
                ops.analysis("Static")
                ops.analyze(1)
            forces = {int(e["id"]): _ff_extract_local_force(int(e["id"])) for e in elements}
            acc[dirn].append(forces)

    return acc

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
                # Excentricidad accidental del caso (ETABS ECCENRATIOTYPICAL).
                # Se caía acá: las fuerzas de barra sísmicas salían SIN torsión
                # accidental aunque el cortante basal sí la incluyera.
                "eccRatio": max(float(sc.get("eccRatio", 0.0) or 0.0), 0.0),
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

    # Ídem para la torsión accidental, una corrida por valor distinto de
    # eccRatio (normalmente uno solo: 0.05 en todos los casos).
    acc_by_ecc = {}
    for case in norm_cases:
        ecc = float(case.get("eccRatio") or 0.0)
        if ecc <= 0 or ecc in acc_by_ecc:
            continue
        acc_by_ecc[ecc] = _ff_seismic_modal_accidental(
            data, modal_data, needed_dirs, elements, ecc
        )

    lengths = {int(e["id"]): _ff_element_length(e, node_by_id) for e in elements}
    axes = {int(e["id"]): _ff_local_axes(e, node_by_id, nodes) for e in elements}
    offsets = {int(e["id"]): _ff_element_end_offsets(e) for e in elements}

    entries = []
    meta = []
    for case in norm_cases:
        zeta = case["damping"]
        comb = case["combination"]

        # Torsión accidental del caso, si la tiene y si hay diafragmas que roten.
        acc = acc_by_ecc.get(float(case.get("eccRatio") or 0.0)) or {}

        # R por dirección: {eid: [ {comp:val} por estación ]} (envolvente modal).
        dir_results = {}
        for dirn, spec in (("x", case["spectrumX"]), ("y", case["spectrumY"])):
            if not spec or dirn not in base:
                continue
            scale = g if case["saInG"] else 1.0
            sa_per_mode = [interpolate_spectrum(spec, T) * scale for T in periods]
            acc_dir = acc.get(dirn)
            res = {}
            for e in elements:
                eid = int(e["id"])
                length = lengths[eid]
                per_mode_stations = []
                per_mode_acc = [] if acc_dir else None
                for idx in range(len(modal_info)):
                    f_scaled = [c * sa_per_mode[idx] for c in base[dirn][idx][eid]]
                    per_mode_stations.append(
                        _ff_stations_from_end_forces(
                            f_scaled, length, num_stations, None, offsets[eid]
                        )
                    )
                    if acc_dir:
                        f_acc = [c * sa_per_mode[idx] for c in acc_dir[idx][eid]]
                        per_mode_acc.append(
                            _ff_stations_from_end_forces(
                                f_acc, length, num_stations, None, offsets[eid]
                            )
                        )
                nst = len(per_mode_stations[0]) if per_mode_stations else 0
                nmodes = len(per_mode_stations)
                combined = []
                for k in range(nst):
                    row = {}
                    for comp in components:
                        vals = [per_mode_stations[m][k][comp] for m in range(nmodes)]
                        val = (
                            _ff_srss1d(vals) if comb == "SRSS" else _ff_cqc1d(vals, omegas, zeta)
                        )
                        if per_mode_acc:
                            avals = [per_mode_acc[m][k][comp] for m in range(nmodes)]
                            acc_val = (
                                _ff_srss1d(avals)
                                if comb == "SRSS"
                                else _ff_cqc1d(avals, omegas, zeta)
                            )
                            # SRSS entre la respuesta base y la accidental, NO
                            # suma directa. CALIBRADO contra ETABS con las 36
                            # columnas del MODELO (2)1 (SDX), comparando los tres
                            # esquemas contra la misma tabla de ETABS:
                            #
                            #                    aditivo      base      SRSS
                            #   eje mayor     +6.4%/9.5%  +0.0/6.9  +1.3/7.0
                            #   eje menor    +16.3%/16.8% +0.0/6.4  +1.6/6.5
                            #   axial         +4.2%/9.2%  -0.9/7.7  -0.6/7.7
                            #   torsión T    +47.3%/47.3% -53.6/53.6 +11.2/19.6
                            #
                            # Lo decisivo es la TORSIÓN: estaba rota en los dos
                            # extremos (+47% sumando, −54% sin accidental) y solo
                            # el SRSS la deja en +11%. Un esquema que arregla la
                            # componente que ninguno de los dos límites podía no
                            # es un ajuste de conveniencia.
                            #
                            # Físicamente: ETABS mete la excentricidad DENTRO de
                            # la combinación modal, así que el aporte accidental
                            # no está perfectamente correlacionado con la base.
                            # Sumar asume correlación total (cota superior);
                            # SRSS asume independencia, y los datos dicen que la
                            # independencia está mucho más cerca.
                            #
                            # OJO: esto REDUCE las fuerzas de diseño ~14% frente
                            # a sumar. Se justifica porque calza con ETABS, que
                            # es la referencia — no por ser menos conservador.
                            val = (val * val + acc_val * acc_val) ** 0.5
                        row[comp] = val
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
            # Mismo rango que el camino estático: la luz libre entre caras de
            # apoyo. Sin esto la envolvente sísmica quedaba con las estaciones
            # de eje a eje y no cruzaba contra las de gravedad.
            off_i, off_j = offsets[eid]
            s_start = min(max(off_i, 0.0), length)
            s_end = max(min(length - off_j, length), s_start)

            stations = []
            for k in range(nst):
                rel = k / (nst - 1) if nst > 1 else 0.0
                row = {
                    "station": round(s_start + rel * (s_end - s_start), 6),
                    "relativeStation": round(rel, 6),
                }
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
            {
                "id": case["id"],
                "name": case["name"],
                "type": "Response Spectrum",
                "signless": True,
                # Para poder verificar desde el frontend si la torsión accidental
                # entró de verdad (eccRatio>0 pero sin diafragmas que roten → 0).
                "eccRatio": case.get("eccRatio", 0.0),
                "accidentalTorsion": bool(
                    acc_by_ecc.get(float(case.get("eccRatio") or 0.0))
                ),
            }
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

    # ── Cargas de TRAMO ──────────────────────────────────────────────────────
    # Si el payload trae `memberLoads`, la carga de vano se aplica al ELEMENTO
    # (eleLoad), como hace ETABS, y se DESCARTA su equivalente nodal wL/2 de
    # `loads` para no contarla dos veces. Sin esa carga sobre el miembro toda
    # viga salía con M3 = 0 y V2 constante: el wL/2 en los nudos se va directo
    # a los apoyos sin flectar la barra.
    #
    # `loads` no se toca en ningún otro análisis (masa, modal, reacciones), así
    # que este cambio queda confinado al módulo de diagramas. Un payload viejo
    # sin `memberLoads` se comporta exactamente como antes.
    member_loads_by_case = _ff_member_loads_by_case(data)
    has_member_loads = bool(member_loads_by_case)
    superseded_sources = {"frame_load_equivalent", "frame_self_weight"}

    # Losas cuya carga YA viaja repartida sobre sus vigas ("Area Load to
    # Frame"). Su equivalente nodal de esquina se descarta SOLO para estos
    # paneles: un panel sin vigas de contorno detectadas no genera carga de
    # tramo y tiene que seguir entrando por los nudos, o su carga desaparece.
    superseded_slab_ids = {
        ml.get("slabId")
        for ml in (data.get("memberLoads") or data.get("member_loads") or [])
        if isinstance(ml, dict)
        and str(ml.get("source", "")) == "slab_to_beam"
        and ml.get("slabId") is not None
    }

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
        # Un caso puede existir solo como carga de tramo (p.ej. una viga con
        # carga distribuida y ningún nudo cargado en ese patrón).
        for cid in member_loads_by_case:
            if cid not in seen:
                seen.append(cid)
        cases = seen or ["DEAD"]

    # `patternType` (Dead/Live/RoofLive) sale del `type`/`loadType` que ya trae
    # cada carga; lo usan los combos por defecto para clasificar los casos por
    # tipo en vez de por nombre (ver _ff_default_design_combos).
    def _pattern_type_of(case_id):
        raw_member = data.get("memberLoads") or data.get("member_loads") or []
        for ld in list(all_loads) + list(raw_member):
            if not isinstance(ld, dict) or _b10_14_load_case(ld) != case_id:
                continue
            pt = str(ld.get("type") or ld.get("loadType") or "").strip()
            if pt:
                return pt
        return ""

    case_meta = [
        {
            "id": c,
            "name": c,
            "type": "Linear Static",
            "patternType": _pattern_type_of(c),
        }
        for c in cases
    ]

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
            # Equivalente nodal reemplazado por su carga de tramo real.
            source = str(ld.get("source", ""))
            if has_member_loads and source in superseded_sources:
                continue
            if (
                source == "area_load"
                and ld.get("slabId") is not None
                and ld.get("slabId") in superseded_slab_ids
            ):
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

        # Carga de tramo del caso: global → ejes locales → eleLoad. `spans` se
        # reusa abajo para integrar el diagrama entre estaciones.
        spans = {}
        for elem in elements:
            eid = int(elem["id"])
            span = _ff_local_span_load(
                member_loads_by_case.get(case_id, {}).get(eid),
                elem,
                node_by_id,
                nodes,
                _ff_element_length(elem, node_by_id),
            )
            if span:
                spans[eid] = span

        if _ff_apply_member_loads(spans):
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
            stations = _ff_stations_from_end_forces(
                f_local, length, num_stations, spans.get(eid),
                _ff_element_end_offsets(elem),
            )
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
    # Se le pasa el METADATO completo (no solo los ids) para que los casos
    # Response Spectrum se reconozcan por su `type` y no por llamarse "SDX".
    if combos is None:
        combo_defs = _ff_default_design_combos(case_meta)
    else:
        combo_defs = combos or []

    case_idx = {}
    for entry in frame_forces:
        if entry.get("caseId") is not None:
            case_idx[(entry["frameId"], entry["caseId"])] = entry

    combo_meta = []
    all_combo_entries = []
    for combo in combo_defs:
        combo_entries = _ff_compute_combo_entries(combo, elements, case_idx, components)
        if not combo_entries:
            continue
        frame_forces.extend(combo_entries)
        all_combo_entries.extend(combo_entries)
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

    # La envolvente va DESPUÉS del resumen: su valor coincide con el del combo
    # que gobierna, y si entrara antes el `summary` diría "ENV Max" en vez del
    # combo real que produjo el máximo.
    envelope_entries, envelope_meta = _ff_envelope_over_combos(
        all_combo_entries, components
    )
    frame_forces.extend(envelope_entries)

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
        "envelopes": envelope_meta,
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
    Agrupa nodos por nivel para calcular cortante por piso.
    Excluye base y nodos apoyados.

    Prioridad (igual que _group_nodes_by_story, ver ahí el porqué): si el
    payload trae `stories` reales, se usan (evita reconstruir un "piso" por
    cada Z distinto — bug de las 11 filas en un modelo de 2 pisos con techo
    de armadura, ver project_modulo5_period_calibration). Sin stories, cae al
    agrupado automático por Z de siempre.
    """
    if not nodes:
        return []

    support_ids = _story_shear_support_node_ids(data)
    node_by_id = {}
    for node in nodes:
        try:
            node_by_id[int(node.get("id"))] = node
        except Exception:
            continue

    z_values = [float(node.get("z", 0.0)) for node in nodes if _to_float(node.get("z"), None) is not None]
    if not z_values:
        return []

    base_z = min(z_values)

    raw_stories = (
        data.get("stories") or data.get("story_levels") or data.get("levels") or []
    )

    levels = []

    if isinstance(raw_stories, list) and raw_stories:
        sorted_stories = sorted(
            (s for s in raw_stories if isinstance(s, dict)),
            key=lambda s: _to_float(s.get("z", s.get("elevation", 0.0)), 0.0),
        )

        previous_z = base_z

        for story in sorted_stories:
            z = _to_float(story.get("z", story.get("elevation", 0.0)), 0.0)

            # No calcular piso en la base.
            if abs(z - base_z) <= z_tolerance:
                previous_z = z
                continue

            raw_node_ids = (
                story.get("nodeIds") or story.get("node_ids") or story.get("nodes") or []
            )

            node_ids = []
            story_nodes = []

            for raw_id in raw_node_ids:
                try:
                    nid = int(raw_id)
                except Exception:
                    continue
                if nid in support_ids or nid not in node_by_id:
                    continue
                node_ids.append(nid)
                story_nodes.append(node_by_id[nid])

            if node_ids:
                levels.append(
                    {
                        "story": str(story.get("name") or story.get("label") or f"STORY {len(levels) + 1}"),
                        "level": str(story.get("name") or story.get("label") or f"STORY {len(levels) + 1}"),
                        "z": z,
                        "height": z - previous_z,
                        "node_ids": sorted(set(node_ids)),
                        "nodes": story_nodes,
                    }
                )

            previous_z = z

    if not levels:
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
