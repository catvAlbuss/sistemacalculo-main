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
    ext = filename.rsplit('.', 1)[-1].lower()

    if ext in ('xls', 'xlsx'):
        return _parse_spectrum_excel(file_bytes, ext)
    else:
        return _parse_spectrum_text(file_bytes)


def _parse_spectrum_text(file_bytes: bytes) -> list[tuple[float, float]]:
    """Parsea TXT / CSV con auto-detección de separador y salto de encabezado."""
    try:
        text = file_bytes.decode('utf-8', errors='replace')
    except Exception:
        text = file_bytes.decode('latin-1', errors='replace')

    rows = []
    for line in text.splitlines():
        line = line.strip()
        # Ignorar comentarios y líneas vacías
        if not line or line.startswith('#') or line.startswith('//') or line.startswith('%'):
            continue
        # Auto-detectar separador
        for sep in (',', ';', '\t', ' '):
            parts = [p.strip() for p in line.split(sep) if p.strip()]
            if len(parts) >= 2:
                try:
                    t = float(parts[0].replace(',', '.'))
                    sa = float(parts[1].replace(',', '.'))
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
#  2.  CONSTRUCTOR DE MODELO OPENSEES
# ─────────────────────────────────────────────────────────

def build_model_3d(data: dict):
    """
    Construye el modelo OpenSees 3D (6 DOF/nodo) a partir del payload del CAD.

    data keys:
      nodes    : [{id, x, y, z, mass_x?, mass_y?, mass_z?}]
      elements : [{id, node_i, node_j, A, E, G, Iz, Iy, J, vecxz?}]
      supports : [{node, ux, uy, uz, rx, ry, rz}]
      loads    : [{node, fx, fy, fz, mx, my, mz}]   (carga estática)
    """
    ops.wipe()
    ops.model('basic', '-ndm', 3, '-ndf', 6)

    # ── Nodos ──────────────────────────────────────────────
    nodes = data.get('nodes', [])
    for n in nodes:
        ops.node(int(n['id']), float(n.get('x', 0)),
                               float(n.get('y', 0)),
                               float(n.get('z', 0)))

    # ── Masas nodales ──────────────────────────────────────
    for n in nodes:
        mx = float(n.get('mass_x', n.get('mass', 0)))
        my = float(n.get('mass_y', n.get('mass', 0)))
        mz = float(n.get('mass_z', 0))  # masa vertical (normalmente 0 para sismo)
        if mx > 0 or my > 0 or mz > 0:
            # mass(nodeTag, mX, mY, mZ, mRX, mRY, mRZ)
            # Rotational inertia ≈ 0 para masa de punto
            ops.mass(int(n['id']), mx, my, mz, 1e-9, 1e-9, 1e-9)

    # ── Elementos ─────────────────────────────────────────
    elements = data.get('elements', [])
    transf_cache = {}

    for i, elem in enumerate(elements):
        eid   = int(elem['id'])
        ni    = int(elem['node_i'])
        nj    = int(elem['node_j'])
        A     = float(elem.get('A',  elem.get('area',   0.01)))
        E     = float(elem.get('E',  elem.get('young', 200e9)))
        G     = float(elem.get('G',  elem.get('shear', 77e9)))
        Iz    = float(elem.get('Iz', 1e-4))
        Iy    = float(elem.get('Iy', 1e-4))
        J     = float(elem.get('J',  1e-6))

        # Vector auxiliar de orientación del eje local y
        vecxz = elem.get('vecxz', None)
        if vecxz is None:
            vecxz = _auto_vecxz(ni, nj, nodes)

        transf_key = tuple(vecxz)
        if transf_key not in transf_cache:
            tid = len(transf_cache) + 1
            ops.geomTransf('Linear', tid, *vecxz)
            transf_cache[transf_key] = tid
        tid = transf_cache[transf_key]

        ops.element('elasticBeamColumn', eid, ni, nj, A, E, G, J, Iy, Iz, tid)

    # ── Apoyos ────────────────────────────────────────────
    supports = data.get('supports', [])
    if supports:
        for s in supports:
            ops.fix(int(s['node']),
                    int(s.get('ux', 0)), int(s.get('uy', 0)), int(s.get('uz', 0)),
                    int(s.get('rx', 0)), int(s.get('ry', 0)), int(s.get('rz', 0)))
    else:
        # Si no hay apoyos definidos, fijar automáticamente los nodos de menor Z
        if nodes:
            min_z = min(float(n.get('z', 0)) for n in nodes)
            base_nodes = [n for n in nodes if abs(float(n.get('z', 0)) - min_z) < 0.01]
            for n in base_nodes:
                ops.fix(int(n['id']), 1, 1, 1, 1, 1, 1)

    return nodes, elements


def _auto_vecxz(ni: int, nj: int, nodes: list) -> list[float]:
    """Elige vector xz automáticamente para geomTransf según orientación del elemento."""
    ni_data = next((n for n in nodes if int(n['id']) == ni), None)
    nj_data = next((n for n in nodes if int(n['id']) == nj), None)
    if ni_data is None or nj_data is None:
        return [0.0, 0.0, 1.0]

    dx = float(nj_data.get('x', 0)) - float(ni_data.get('x', 0))
    dy = float(nj_data.get('y', 0)) - float(ni_data.get('y', 0))
    dz = float(nj_data.get('z', 0)) - float(ni_data.get('z', 0))
    length = (dx**2 + dy**2 + dz**2) ** 0.5

    if length < 1e-9:
        return [0.0, 0.0, 1.0]

    dx /= length; dy /= length; dz /= length

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
        real_part = float(v.real) if hasattr(v, 'real') else float(v)
        return abs(real_part)   # ω² debe ser positivo; negativo = ruido numérico
    except (TypeError, ValueError):
        return 0.0


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
    ops.constraints('Transformation')
    ops.numberer('RCM')
    ops.system('FullGeneral')   # FullGeneral tolera matrices no-SPD
    ops.analysis('Transient')   # Transient activa la formulación completa de masa

    # ── Ejecutar eigenvalue — probar solvers de más a menos robusto ─────────
    lam = None
    errors = []
    for solver_args in [('-genBandArpack',), ('-symmBandLapack',), ('-fullGenLapack',), ()]:
        try:
            result = ops.eigen(*solver_args, num_modes)
            # Verificar que devolvió algo útil (no vacío ni todo-ceros)
            if result and any(_safe_eigenvalue(v) > 1e-20 for v in result):
                lam = result
                break
        except Exception as e:
            errors.append(str(e))

    if lam is None:
        detail = '; '.join(errors) if errors else 'sin detalle'
        raise RuntimeError(
            f"El análisis modal falló con todos los solvers. "
            f"Verifica que el modelo tiene apoyos asignados y secciones con propiedades válidas. "
            f"Detalle: {detail}"
        )

    # ── Sanitizar eigenvalores → ω real positivo ───────────────────────────
    omega = [_safe_eigenvalue(v) ** 0.5 if _safe_eigenvalue(v) > 1e-20 else 0.0
             for v in lam]
    periods = [2.0 * np.pi / w if w > 1e-9 else 0.0 for w in omega]
    frequencies = [1.0 / T if T > 1e-9 else 0.0 for T in periods]

    node_ids = [int(n['id']) for n in nodes]

    # Formas modales (DOFs: 1=UX, 2=UY, 3=UZ)
    phi_x = []  # shape: [num_modes][num_nodes]
    phi_y = []

    for mode_idx in range(1, num_modes + 1):
        mode_x = []
        mode_y = []
        for nid in node_ids:
            try:
                vx = ops.nodeEigenvector(nid, mode_idx, 1)  # DOF 1 = UX
                vy = ops.nodeEigenvector(nid, mode_idx, 2)  # DOF 2 = UY
                # Sanitizar por si devuelve complejos
                vx = float(vx.real) if hasattr(vx, 'real') else float(vx)
                vy = float(vy.real) if hasattr(vy, 'real') else float(vy)
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

    modal_info = []
    cum_mpf_x = 0.0
    cum_mpf_y = 0.0

    for idx in range(num_modes):
        phi_xi = np.array(phi_x[idx])
        phi_yi = np.array(phi_y[idx])
        mx_arr = np.array(m_x)
        my_arr = np.array(m_y)

        # Modal mass: M_n = φ^T M φ
        Mn_x = float(np.dot(phi_xi, mx_arr * phi_xi))
        Mn_y = float(np.dot(phi_yi, my_arr * phi_yi))

        # Participation factor: Γ_n = φ^T M {1} / M_n
        # {1} = vector de influencia unitaria en la dirección del sismo
        Ln_x = float(np.dot(phi_xi, mx_arr))  # suma de masas * φ (dirección X)
        Ln_y = float(np.dot(phi_yi, my_arr))

        gamma_x = Ln_x / Mn_x if abs(Mn_x) > 1e-12 else 0.0
        gamma_y = Ln_y / Mn_y if abs(Mn_y) > 1e-12 else 0.0

        # Masa modal efectiva: m*_n = (φ^T M {1})² / (φ^T M φ)
        meff_x = Ln_x ** 2 / Mn_x if abs(Mn_x) > 1e-12 else 0.0
        meff_y = Ln_y ** 2 / Mn_y if abs(Mn_y) > 1e-12 else 0.0

        mpf_x = meff_x / total_mass_x * 100 if total_mass_x > 1e-12 else 0.0
        mpf_y = meff_y / total_mass_y * 100 if total_mass_y > 1e-12 else 0.0

        cum_mpf_x += mpf_x
        cum_mpf_y += mpf_y

        modal_info.append({
            'mode': idx + 1,
            'omega': float(omega[idx]),
            'period': float(periods[idx]),
            'frequency': float(frequencies[idx]),
            'gamma_x': float(gamma_x),
            'gamma_y': float(gamma_y),
            'modal_mass_x': float(Mn_x),
            'modal_mass_y': float(Mn_y),
            'mass_participation_x': float(mpf_x),
            'mass_participation_y': float(mpf_y),
            'cumulative_participation_x': float(cum_mpf_x),
            'cumulative_participation_y': float(cum_mpf_y),
        })

    return {
        'modal_info': modal_info,
        'phi_x': phi_x,
        'phi_y': phi_y,
        'm_x': m_x,
        'm_y': m_y,
        'node_ids': node_ids,
        'num_modes': num_modes,
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

def run_rsa(modal_data: dict,
            spectrum: list[tuple[float, float]],
            direction: str = 'x',
            combination: str = 'SRSS',
            damping_ratio: float = 0.05,
            sa_in_g: bool = True,
            g: float = 9.81) -> dict:
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
    modal_info = modal_data['modal_info']
    phi_x = modal_data['phi_x']  # [modo][nodo]
    phi_y = modal_data['phi_y']
    m_x   = np.array(modal_data['m_x'])
    m_y   = np.array(modal_data['m_y'])
    node_ids = modal_data['node_ids']
    num_modes = len(modal_info)
    num_nodes = len(node_ids)

    # Factor de escala Sa: g → m/s²
    scale = g if sa_in_g else 1.0

    # Desplazamientos spectrales modales D_n = Sa_n / ω_n²
    # Respuesta nodal modal: u_n(i) = Γ_n * φ_n(i) * D_n
    modal_disps_x = np.zeros((num_modes, num_nodes))  # desplazamientos X por modo
    modal_disps_y = np.zeros((num_modes, num_nodes))  # desplazamientos Y por modo

    for idx, mi in enumerate(modal_info):
        T_n = mi['period']
        omega_n = mi['omega']
        Sa_n = interpolate_spectrum(spectrum, T_n) * scale  # [m/s²]

        # Desplazamiento espectral Sd = Sa/ω²
        omega_n_safe = float(omega_n.real) if hasattr(omega_n, 'real') else float(omega_n)
        Sd_n = Sa_n / (omega_n_safe ** 2) if omega_n_safe > 1e-9 else 0.0

        if direction == 'x':
            gamma = mi['gamma_x']
            phi   = np.array(phi_x[idx])
            modal_disps_x[idx] = gamma * phi * Sd_n
            # En dirección transversal (Y) el sismo en X también genera respuesta Y
            # para simplificar, solo se calcula en la dirección principal
            modal_disps_y[idx] = np.zeros(num_nodes)
        else:  # 'y'
            gamma = mi['gamma_y']
            phi   = np.array(phi_y[idx])
            modal_disps_y[idx] = gamma * phi * Sd_n
            modal_disps_x[idx] = np.zeros(num_nodes)

    # ── Combinación modal ──────────────────────────────────
    if combination.upper() == 'CQC':
        disp_x_comb = _cqc_combine(modal_disps_x, modal_info, damping_ratio)
        disp_y_comb = _cqc_combine(modal_disps_y, modal_info, damping_ratio)
    else:  # SRSS
        disp_x_comb = _srss_combine(modal_disps_x)
        disp_y_comb = _srss_combine(modal_disps_y)

    # ── Fuerzas sísmicas equivalentes en base (cortante basal) ──
    base_shear = _compute_base_shear(modal_info, spectrum, direction,
                                     scale, m_x, m_y)

    # ── Empaquetar por nodo ──────────────────────────────────
    displacements = {}
    for i, nid in enumerate(node_ids):
        displacements[nid] = {
            'dx': float(disp_x_comb[i]),
            'dy': float(disp_y_comb[i]),
            'dz': 0.0,
        }

    # Desplazamientos modales detallados (para reporte)
    modal_disps_detail = []
    for idx, mi in enumerate(modal_info):
        modal_disps_detail.append({
            'mode': mi['mode'],
            'period': mi['period'],
            'Sa': float(interpolate_spectrum(spectrum, mi['period'])),
            'disp_max': float(max(abs(modal_disps_x[idx].max()),
                                  abs(modal_disps_x[idx].min()),
                                  abs(modal_disps_y[idx].max()),
                                  abs(modal_disps_y[idx].min()))),
        })

    return {
        'displacements': displacements,
        'base_shear': base_shear,
        'modal_disps_detail': modal_disps_detail,
    }


def _srss_combine(modal_matrix: np.ndarray) -> np.ndarray:
    """SRSS: √(Σ r_i²)  por cada DOF."""
    return np.sqrt(np.sum(modal_matrix ** 2, axis=0))


def _cqc_combine(modal_matrix: np.ndarray,
                 modal_info: list, zeta: float) -> np.ndarray:
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
                rho = _cqc_rho(modal_info[i]['omega'],
                                modal_info[j]['omega'], zeta)
                rsum += rho * modal_matrix[i, k] * modal_matrix[j, k]
        result[k] = np.sqrt(max(rsum, 0.0))

    return result


def _cqc_rho(omega_i: float, omega_j: float, zeta: float) -> float:
    """Coeficiente de correlación CQC (Der Kiureghian, 1981)."""
    if omega_j < 1e-12:
        return 1.0 if abs(omega_i - omega_j) < 1e-9 else 0.0
    r = omega_i / omega_j
    num = 8 * zeta**2 * (1 + r) * r**1.5
    den = (1 - r**2)**2 + 4 * zeta**2 * r * (1 + r)**2
    return num / den if abs(den) > 1e-15 else 1.0


def _compute_base_shear(modal_info: list,
                        spectrum: list,
                        direction: str,
                        scale: float,
                        m_x: np.ndarray,
                        m_y: np.ndarray) -> float:
    """Cortante basal por combinación SRSS de fuerzas modales."""
    shears = []
    total_mass = float(np.sum(m_x)) if direction == 'x' else float(np.sum(m_y))
    for mi in modal_info:
        T_n = mi['period']
        Sa_n = interpolate_spectrum(spectrum, T_n) * scale
        mpf = mi['mass_participation_x'] if direction == 'x' else mi['mass_participation_y']
        V_n = (mpf / 100) * total_mass * Sa_n
        shears.append(V_n)
    return float(np.sqrt(sum(v**2 for v in shears)))


# ─────────────────────────────────────────────────────────
#  5.  ANÁLISIS ESTÁTICO + ENVOLVENTE CON SISMO
# ─────────────────────────────────────────────────────────

def run_static_analysis(data: dict) -> dict:
    """Análisis estático lineal. Retorna desplazamientos, reacciones y fuerzas."""
    nodes, elements = build_model_3d(data)

    ops.timeSeries('Linear', 1)
    ops.pattern('Plain', 1, 1)

    loads = data.get('loads', [])
    has_load = False
    for load in loads:
        nid = int(load['node'])
        fx = float(load.get('fx', 0)); fy = float(load.get('fy', 0))
        fz = float(load.get('fz', 0)); mx = float(load.get('mx', 0))
        my = float(load.get('my', 0)); mz = float(load.get('mz', 0))
        if any(v != 0 for v in [fx, fy, fz, mx, my, mz]):
            ops.load(nid, fx, fy, fz, mx, my, mz)
            has_load = True

    if not has_load:
        # Análisis vacío → devolver ceros
        nids = [int(n['id']) for n in nodes]
        displacements = {nid: {'dx': 0, 'dy': 0, 'dz': 0, 'rx': 0, 'ry': 0, 'rz': 0}
                         for nid in nids}
        reactions     = {nid: {'fx': 0, 'fy': 0, 'fz': 0, 'mx': 0, 'my': 0, 'mz': 0}
                         for nid in nids}
        forces        = {int(e['id']): _zero_forces() for e in elements}
        return {'success': True, 'displacements': displacements,
                'reactions': reactions, 'forces': forces}

    ops.constraints('Transformation')
    ops.numberer('RCM')
    ops.system('BandGeneral')
    ops.test('NormDispIncr', 1e-6, 10)
    ops.algorithm('Newton')
    ops.integrator('LoadControl', 1.0)
    ops.analysis('Static')

    ok = ops.analyze(1)
    if ok < 0:
        raise RuntimeError(f"Análisis estático falló con código {ok}")

    ops.reactions()
    return _extract_results(nodes, elements)


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
    spectrum_x = data.get('spectrum_x', [])
    spectrum_y = data.get('spectrum_y', spectrum_x)  # si no se da Y, usar X
    num_modes  = int(data.get('num_modes', 6))
    combination = data.get('combination', 'CQC')
    damping    = float(data.get('damping_ratio', 0.05))
    sa_in_g    = bool(data.get('sa_in_g', True))
    g          = float(data.get('g', 9.81))

    results = {'success': True}

    # ── Paso 1: estático ────────────────────────────────────
    try:
        static_res = run_static_analysis(data)
        results['static'] = static_res
    except Exception as e:
        results['static'] = {'success': False, 'error': str(e)}

    # ── Construir modelo para modal (necesita masas) ─────────
    nodes, elements = build_model_3d(data)

    # ── Paso 2: análisis modal ───────────────────────────────
    n_nodes = len(nodes)
    num_modes = min(num_modes, max(1, n_nodes * 2))
    modal_data = run_modal_analysis(nodes, num_modes)
    results['modal'] = {
        'modes': modal_data['modal_info'],
        'num_modes_requested': num_modes,
    }

    # ── Paso 3 & 4: RSA en X y Y ───────────────────────────
    seismic = {}
    if spectrum_x:
        rsa_x = run_rsa(modal_data, spectrum_x, direction='x',
                        combination=combination, damping_ratio=damping,
                        sa_in_g=sa_in_g, g=g)
        seismic['x'] = rsa_x

    if spectrum_y:
        rsa_y = run_rsa(modal_data, spectrum_y, direction='y',
                        combination=combination, damping_ratio=damping,
                        sa_in_g=sa_in_g, g=g)
        seismic['y'] = rsa_y

    results['seismic'] = seismic

    # ── Paso 5: envolvente ──────────────────────────────────
    results['envelope'] = _compute_envelope(
        results.get('static', {}),
        seismic,
        [int(n['id']) for n in nodes]
    )

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
        nid = int(n['id'])
        d = ops.nodeDisp(nid)
        r = ops.nodeReaction(nid)
        displacements[nid] = {
            'dx': float(d[0]), 'dy': float(d[1]), 'dz': float(d[2]),
            'rx': float(d[3]), 'ry': float(d[4]), 'rz': float(d[5]),
        }
        reactions[nid] = {
            'fx': float(r[0]), 'fy': float(r[1]), 'fz': float(r[2]),
            'mx': float(r[3]), 'my': float(r[4]), 'mz': float(r[5]),
        }

    for e in elements:
        eid = int(e['id'])
        try:
            f = ops.eleForce(eid)
            forces[eid] = {
                'axial':    float(f[0]),
                'shear_y':  float(f[1]),
                'shear_z':  float(f[2]),
                'torsion':  float(f[3]),
                'moment_y': float(f[4]),
                'moment_z': float(f[5]),
            }
        except Exception:
            forces[eid] = _zero_forces()

    return {'success': True, 'displacements': displacements,
            'reactions': reactions, 'forces': forces}


def _zero_forces() -> dict:
    return {'axial': 0, 'shear_y': 0, 'shear_z': 0,
            'torsion': 0, 'moment_y': 0, 'moment_z': 0}


def _compute_envelope(static: dict, seismic: dict, node_ids: list) -> dict:
    """
    Envolvente: max absoluto entre estático y sísmico (SRSS en X-Y para el sismo).
    Retorna desplazamientos de envolvente por nodo.
    """
    static_d = static.get('displacements', {})
    envelope = {}

    for nid in node_ids:
        sd = static_d.get(nid, {'dx': 0, 'dy': 0, 'dz': 0})
        dx_static = abs(sd.get('dx', 0))
        dy_static = abs(sd.get('dy', 0))
        dz_static = abs(sd.get('dz', 0))

        # Sismo: SRSS de X e Y
        dx_seis = 0.0
        dy_seis = 0.0
        if 'x' in seismic:
            node_d = seismic['x']['displacements'].get(nid, {})
            dx_seis = abs(node_d.get('dx', 0))
        if 'y' in seismic:
            node_d = seismic['y']['displacements'].get(nid, {})
            dy_seis = abs(node_d.get('dy', 0))

        # Combinación sísmica bidireccional (100%X + 30%Y, o SRSS)
        dx_comb = (dx_seis**2 + (0.3 * dy_seis)**2) ** 0.5
        dy_comb = ((0.3 * dx_seis)**2 + dy_seis**2) ** 0.5

        envelope[nid] = {
            'dx': float(max(dx_static, dx_comb)),
            'dy': float(max(dy_static, dy_comb)),
            'dz': float(dz_static),
        }

    return {'by_node': envelope}
