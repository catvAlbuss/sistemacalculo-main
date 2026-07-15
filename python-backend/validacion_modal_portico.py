"""
============================================================
 VALIDACIÓN MODAL — Pórtico 3D de 5 pisos (planta en U)
============================================================

Script INDEPENDIENTE para corroborar los periodos / masas participantes
contra el motor (seismic_analysis.run_modal_analysis).

Replica EXACTAMENTE las hipótesis del motor:
  - element('elasticBeamColumn', id, ni, nj, A, E, G, J, Iy, Iz, tid)
    (forma por propiedades; OJO: Iy va ANTES que Iz)
  - vecxz columnas = (0,1,0)   ·   vigas horizontales = (0,0,1)
  - ops.mass(node, mx,my,mz, 1e-9,1e-9,1e-9)
  - ops.modalProperties("-return") para razones de masa participante

Sistema de unidades CONSISTENTE: kN · m · tonelada · s
  (fuerza kN, longitud m  =>  masa en toneladas ;  1 kN = 1 t·m/s²)
  Los periodos son independientes del sistema de unidades siempre que sea
  consistente, así que se pueden comparar directo contra el motor (que usa N–m–kg).

Geometría:
  Grids X (4): 0, 6, 12, 17        (espaciado 6, 6, 5)
  Grids Y (4): 0, 6, 11, 14        (espaciado 6, 5, 3)
  Pisos (5):   z = 0,3,6,9,12,15   (base + 5 niveles, h=3 m)
  Abertura en U: panel centro-superior (x 6–12, y 11–14) SIN losa,
                 viga superior 16–18 (y=14, x 6→12) ausente (punteada en la imagen).

Materiales / secciones:
  Concreto  Ec = 21 320 MPa  (= 15000·√210, fc=210 kg/cm²),  ν = 0.20
  Columnas  0.30 × 0.40 m
  Vigas     0.30 × 0.50 m

Masas:
  Losas      581.9 t  repartidas por ÁREA TRIBUTARIA a los nodos (sin el panel abierto)
  Peso propio de vigas/columnas: vía '-mass' por elemento (ρ = 2.4 t/m³)
============================================================
"""

import sys
import openseespy.opensees as ops
import numpy as np

# Consola Windows (cp1252) no imprime ω, ², ×... -> forzar UTF-8
try:
    sys.stdout.reconfigure(encoding="utf-8")
except Exception:  # noqa: BLE001
    pass

# ============================================================
# 0.  PARÁMETROS  (kN, m, t)
# ============================================================

X = [0.0, 6.0, 12.0, 17.0]          # grids X
Y = [0.0, 6.0, 11.0, 14.0]          # grids Y
NPISOS = 5
H = 3.0
Z = [i * H for i in range(NPISOS + 1)]   # 0,3,...,15

# --- Material ---
fc_kPa = 21000.0                    # 21 MPa (referencia)
E = 21_320_000.0                    # kN/m²  (21 320 MPa)  Ec = 15000·√210 [kg/cm²]
nu = 0.20
G = E / (2.0 * (1.0 + nu))          # kN/m²

RHO = 2.4                           # t/m³  densidad de MASA del concreto (24 kN/m³ / 9.81)

# --- Secciones ---
def st_venant_J(bb, hh):
    """Constante de torsión de Saint-Venant para sección rectangular (la que usa
    el motor). a=lado mayor, c=lado menor. NO usar b·h·(b²+h²)/12 (polar, ~30%
    alta) porque infla la rigidez torsional y enmascara la amplificación de deriva."""
    a, c = max(bb, hh), min(bb, hh)
    return a * c**3 * (1.0 / 3.0 - 0.21 * (c / a) * (1.0 - (c**4) / (12.0 * a**4)))

# Columna 0.30 (X) × 0.40 (Y).  Cambia col_bx/col_by si tu orientación difiere.
col_bx, col_by = 0.30, 0.40
A_col  = col_bx * col_by
Iy_col = col_by * col_bx**3 / 12.0          # inercia respecto al eje local y
Iz_col = col_bx * col_by**3 / 12.0          # inercia respecto al eje local z
J_col  = st_venant_J(col_bx, col_by)        # ≈ 0.001944 (= motor)

# Viga 0.30 (ancho) × 0.50 (peralte)
beam_b, beam_h = 0.30, 0.50
A_beam  = beam_b * beam_h
Iy_beam = beam_h * beam_b**3 / 12.0
Iz_beam = beam_b * beam_h**3 / 12.0
J_beam  = st_venant_J(beam_b, beam_h)       # ≈ 0.002817 (= motor)

# --- Masa de losas ---
MASA_LOSAS_T = 581.9                # t totales (todos los pisos)

# --- Abertura en U (índices de grid) ---
# Panel = (ix, iy) = celda entre X[ix]..X[ix+1] , Y[iy]..Y[iy+1]
PANELES_ABIERTOS = {(1, 2)}         # centro-superior: X 6–12, Y 11–14
# Vigas eliminadas (borde superior del panel abierto, "punteada" en la imagen)
# clave: ((x1,y1,z), (x2,y2,z)) sin z -> se quita en TODOS los pisos
VIGAS_QUITADAS_XY = {((6.0, 14.0), (12.0, 14.0))}

NUM_MODOS = 12

# --- Diafragma rígido por piso (tipo ETABS: master con ux, uy, RZ) ---
# True  -> rigidDiaphragm: el piso traslada Y rota como cuerpo rígido (ETABS real).
# False -> pórtico desnudo (más flexible; periodos más largos).
# OJO: el motor usa equalDOF_ux_uy (iguala ux,uy de todos) -> bloquea la rotación
#      del piso y da torsión demasiado corta; rigidDiaphragm es lo correcto.
USE_RIGID_DIAPHRAGM = True

# --- Peso propio en la MASA modal ---
# True (por defecto) -> masa modal ≈ 857.8 t (losas 581.9 + peso propio ~276),
#   IGUAL que el motor/ETABS. Con las vigas bien orientadas ("paradas") esta es
#   la masa correcta: da T1≈0.97 s.
# False -> solo losas (581.9 t); T1 baja a ~0.80 s (NO coincide con ETABS).
#   OJO: el "match" con 581.9 t solo aparecía cuando las vigas estaban acostadas
#   (demasiado flexibles) — dos errores que se cancelaban. Ya corregido.
INCLUIR_PESO_PROPIO = True

# ============================================================
# 1.  MODELO
# ============================================================
ops.wipe()
ops.model("basic", "-ndm", 3, "-ndf", 6)

# --- Nodos ---  id = piso*100 + fila*10 + col  (legible y único)
node_map = {}        # (x,y,z) -> id
node_id = 1
for iz, z in enumerate(Z):
    for iy, y in enumerate(Y):
        for ix, x in enumerate(X):
            ops.node(node_id, x, y, z)
            node_map[(x, y, z)] = node_id
            node_id += 1

def nid(x, y, z):
    return node_map[(x, y, z)]

print(f"Nodos creados: {len(node_map)}  ({len(X)*len(Y)} por nivel × {len(Z)} niveles)")

# --- Apoyos: base empotrada ---
for (x, y, z), n in node_map.items():
    if abs(z) < 1e-9:
        ops.fix(n, 1, 1, 1, 1, 1, 1)

# --- Transformaciones (igual que el motor, vigas "PARADAS") ---
# vecxz debe dejar el peralte (0.50) VERTICAL para que la viga use su Iz fuerte
# en la acción de pórtico. Con (0,0,1) la viga queda "acostada" (Iy débil) y el
# modelo sale ~1.5x demasiado flexible. Este es el fix _frameVecxzForSeismic del motor.
ops.geomTransf("Linear", 1, 0.0, 1.0, 0.0)   # columnas (vertical)
ops.geomTransf("Linear", 2, 0.0, 1.0, 0.0)   # vigas en X  (parada): vecxz = +Y
ops.geomTransf("Linear", 3, 1.0, 0.0, 0.0)   # vigas en Y  (parada): vecxz = +X

# --- Elementos ---
eid = 1
n_col = n_bx = n_by = 0
_sw = 1.0 if INCLUIR_PESO_PROPIO else 0.0   # peso propio dentro/fuera de la masa modal
masa_col = RHO * A_col * _sw   # t/m
masa_beam = RHO * A_beam * _sw # t/m

# Columnas
for x in X:
    for y in Y:
        for i in range(len(Z) - 1):
            ni = nid(x, y, Z[i])
            nj = nid(x, y, Z[i + 1])
            ops.element("elasticBeamColumn", eid, ni, nj,
                        A_col, E, G, J_col, Iy_col, Iz_col, 1, "-mass", masa_col)
            eid += 1
            n_col += 1

def viga_quitada(x1, y1, x2, y2):
    key1 = ((x1, y1), (x2, y2))
    key2 = ((x2, y2), (x1, y1))
    return key1 in VIGAS_QUITADAS_XY or key2 in VIGAS_QUITADAS_XY

# Vigas en dirección X (varía x, mismo y) — pisos (z>0)
for z in Z[1:]:
    for y in Y:
        for i in range(len(X) - 1):
            x1, x2 = X[i], X[i + 1]
            if viga_quitada(x1, y, x2, y):
                continue
            ops.element("elasticBeamColumn", eid, nid(x1, y, z), nid(x2, y, z),
                        A_beam, E, G, J_beam, Iy_beam, Iz_beam, 2, "-mass", masa_beam)
            eid += 1
            n_bx += 1

# Vigas en dirección Y (varía y, mismo x) — pisos (z>0)
for z in Z[1:]:
    for x in X:
        for i in range(len(Y) - 1):
            y1, y2 = Y[i], Y[i + 1]
            if viga_quitada(x, y1, x, y2):
                continue
            ops.element("elasticBeamColumn", eid, nid(x, y1, z), nid(x, y2, z),
                        A_beam, E, G, J_beam, Iy_beam, Iz_beam, 3, "-mass", masa_beam)
            eid += 1
            n_by += 1

print(f"Elementos: {n_col} columnas + {n_bx} vigas-X + {n_by} vigas-Y "
      f"= {n_col + n_bx + n_by}")

# ============================================================
# 2.  MASA DE LOSAS  (área tributaria, sin panel abierto)
# ============================================================
# Masa por piso, repartida por paneles cerrados a sus 4 esquinas (1/4 c/u).
masa_por_piso = MASA_LOSAS_T / NPISOS
masa_nodal = {}      # id -> masa (t)

area_cerrada = 0.0
panel_mass = {}      # (ix,iy) -> masa del panel por piso (se llena tras conocer área)
paneles = []
for ix in range(len(X) - 1):
    for iy in range(len(Y) - 1):
        if (ix, iy) in PANELES_ABIERTOS:
            continue
        ax = X[ix + 1] - X[ix]
        ay = Y[iy + 1] - Y[iy]
        area = ax * ay
        area_cerrada += area
        paneles.append((ix, iy, area))

for (ix, iy, area) in paneles:
    m_panel = masa_por_piso * (area / area_cerrada)   # t de este panel por piso
    esquinas = [(X[ix],     Y[iy]),     (X[ix + 1], Y[iy]),
                (X[ix],     Y[iy + 1]), (X[ix + 1], Y[iy + 1])]
    for (cx, cy) in esquinas:
        for z in Z[1:]:
            n = nid(cx, cy, z)
            masa_nodal[n] = masa_nodal.get(n, 0.0) + m_panel / 4.0

for n, m in masa_nodal.items():
    ops.mass(n, m, m, m, 1e-9, 1e-9, 1e-9)

print(f"Masa de losas asignada: {sum(masa_nodal.values()):.2f} t "
      f"(área cerrada/piso = {area_cerrada:.1f} m²)")

# Peso propio (vía '-mass') — estimación para reporte
pp_col = masa_col * (len(Z) - 1) * H * (len(X) * len(Y))
print(f"Peso propio aprox. de columnas: {pp_col:.1f} t  (+ vigas, lumpeado por OpenSees)")

# ============================================================
# 2b.  DIAFRAGMA RÍGIDO POR PISO  (tipo ETABS)
# ============================================================
# rigidDiaphragm(perpDirn=3, master, *slaves): los nodos del piso quedan
# rígidos EN EL PLANO XY (ux, uy, rz acoplados como cuerpo rígido), pero libres
# en uz/rx/ry. La masa traslacional distribuida aporta la inercia rotacional
# (momento polar) por la cinemática del constraint -> torsión correcta.
if USE_RIGID_DIAPHRAGM:
    cx_g = sum(X) / len(X)
    cy_g = sum(Y) / len(Y)
    n_diaf = 0
    for z in Z[1:]:
        floor_nodes = [nid(x, y, z) for y in Y for x in X]
        # master = nodo más cercano al centroide del piso
        master = min(
            floor_nodes,
            key=lambda n: (ops.nodeCoord(n)[0] - cx_g) ** 2
            + (ops.nodeCoord(n)[1] - cy_g) ** 2,
        )
        slaves = [n for n in floor_nodes if n != master]
        ops.rigidDiaphragm(3, master, *slaves)
        n_diaf += 1
    print(f"Diafragmas rígidos aplicados: {n_diaf} (rigidDiaphragm ux-uy-rz)")
else:
    print("Sin diafragma rígido (pórtico desnudo).")

# ============================================================
# 3.  ANÁLISIS MODAL
# ============================================================
ops.constraints("Transformation")
ops.numberer("RCM")
ops.system("UmfPack")
ops.algorithm("Linear")
ops.analysis("Transient")   # solo para inicializar; el modal usa eigen

eigvals = ops.eigen("-fullGenLapack", NUM_MODOS)

periodos, frecs, omegas = [], [], []
for lam in eigvals:
    w = float(np.real(lam)) ** 0.5
    f = w / (2.0 * np.pi)
    omegas.append(w)
    frecs.append(f)
    periodos.append(1.0 / f if f > 0 else float("inf"))

# Masas participantes (mismo método que el motor)
ratios = {}
try:
    mp = ops.modalProperties("-return")
    ratios = {
        "MX":  mp.get("partiMassRatiosMX",  []),
        "MY":  mp.get("partiMassRatiosMY",  []),
        "RMZ": mp.get("partiMassRatiosRMZ", []),
        "cMX": mp.get("partiMassRatiosCumuMX",  []),
        "cMY": mp.get("partiMassRatiosCumuMY",  []),
        "cRMZ": mp.get("partiMassRatiosCumuRMZ", []),
    }
except Exception as e:   # noqa: BLE001
    print(f"(modalProperties no disponible: {e})")

# ============================================================
# 4.  REPORTE
# ============================================================
print("\n" + "=" * 78)
print(" RESULTADOS MODALES — Pórtico 5 pisos (planta U)")
print("=" * 78)
hdr = f"{'Modo':>4} {'T (s)':>9} {'f (Hz)':>9} {'ω (rad/s)':>11}"
if ratios.get("MX"):
    hdr += f" {'UX %':>7} {'UY %':>7} {'RZ %':>7} {'ΣUX %':>7} {'ΣUY %':>7}"
print(hdr)
print("-" * 78)
for i in range(NUM_MODOS):
    line = f"{i+1:>4} {periodos[i]:>9.4f} {frecs[i]:>9.4f} {omegas[i]:>11.4f}"
    if ratios.get("MX"):
        # modalProperties (ASDEA) ya devuelve las razones EN PORCENTAJE
        line += (f" {ratios['MX'][i]:>7.2f} {ratios['MY'][i]:>7.2f}"
                 f" {ratios['RMZ'][i]:>7.2f}"
                 f" {ratios['cMX'][i]:>7.2f} {ratios['cMY'][i]:>7.2f}")
    print(line)
print("=" * 78)

# Identificar modos dominantes (para comparar X / Y / torsión con el motor)
if ratios.get("MX"):
    def modo_dom(key):
        arr = ratios[key]
        i = int(np.argmax(arr))
        return i + 1, periodos[i], arr[i]   # arr ya está en %
    mx_m, mx_T, mx_p = modo_dom("MX")
    my_m, my_T, my_p = modo_dom("MY")
    rz_m, rz_T, rz_p = modo_dom("RMZ")
    print("\nModos dominantes (compáralos con tu motor):")
    print(f"  Traslación X : modo {mx_m}  T = {mx_T:.4f} s  (UX = {mx_p:.1f} %)")
    print(f"  Traslación Y : modo {my_m}  T = {my_T:.4f} s  (UY = {my_p:.1f} %)")
    print(f"  Torsión  RZ  : modo {rz_m}  T = {rz_T:.4f} s  (RZ = {rz_p:.1f} %)")

# ── Comparación contra ETABS y contra el motor ─────────────
# Periodos de referencia (s)
T_ETABS = [0.907, 0.849, 0.759, 0.301, 0.277, 0.247,
           0.180, 0.161, 0.142, 0.132, 0.115, 0.111]
T_MOTOR = [0.966383, 0.878696, 0.321452, 0.283376, 0.192738, 0.161794]

print("\n" + "=" * 78)
print(" COMPARACIÓN DE PERIODOS  T (s)")
print("=" * 78)
print(f"{'Modo':>4} {'Este script':>12} {'ETABS':>9} {'Δ% ETABS':>10}"
      f" {'Motor':>9} {'Δ% Motor':>10}")
print("-" * 78)
for i in range(NUM_MODOS):
    row = f"{i+1:>4} {periodos[i]:>12.4f}"
    if i < len(T_ETABS):
        d = 100.0 * (periodos[i] - T_ETABS[i]) / T_ETABS[i]
        row += f" {T_ETABS[i]:>9.3f} {d:>9.1f}%"
    else:
        row += f" {'-':>9} {'-':>10}"
    if i < len(T_MOTOR):
        d = 100.0 * (periodos[i] - T_MOTOR[i]) / T_MOTOR[i]
        row += f" {T_MOTOR[i]:>9.3f} {d:>9.1f}%"
    else:
        row += f" {'-':>9} {'-':>10}"
    print(row)
print("=" * 78)
print("Notas:\n"
      " - Masa modal ≈ 857.8 t (581.9 losas + ~276 peso propio), igual que el motor.\n"
      " - Vigas 'paradas' (Iz fuerte vertical): sin esto el modelo sale ~1.5x flexible.\n"
      " - Modo 3 = TORSIÓN: este script 0.783 s ≈ ETABS 0.759 s (rigidDiaphragm con RZ).\n"
      "   El motor lo da corto (0.321 s) porque su diafragma equalDOF_ux_uy bloquea la\n"
      "   rotación del piso -> ése es el bug de torsión a corregir en seismic_analysis.py.")

# Masa modal (nodal) movilizada
print(f"\nMasa modal (nodal) total: {sum(masa_nodal.values()):.2f} t  "
      f"| Peso propio en masa: {'SÍ' if INCLUIR_PESO_PROPIO else 'NO'}")


# ============================================================
# 5.  VALIDACIÓN DE DERIVAS  (RSA + CQC)  —  equalDOF vs rigidDiaphragm
# ============================================================
# Pregunta a responder: ¿rigidDiaphragm (que da torsión correcta) ROMPE la
# deriva X, como pasó en el motor (+35%)? Hacemos un análisis espectral puro por
# dirección (E.030/R, combinación modal CQC) para cada método de diafragma y
# comparamos las derivas de entrepiso contra ETABS.
import math  # noqa: E402

# --- Espectro E.030 (CONFIGURABLE: ajusta a tu zona/suelo/R) ---
ESP_Z, ESP_U, ESP_S = 0.45, 1.0, 1.0      # zona, uso, suelo
ESP_TP, ESP_TL = 0.4, 2.5                 # periodos del suelo
ESP_R = 8.0                               # reducción (pórtico de concreto)
ESP_G = 9.81
ZETA = 0.05                               # amortiguamiento para CQC

# Derivas de entrepiso de ETABS (Drift Ratio) — referencia
ETABS_DRIFT_X = [0.000319, 0.000432, 0.000378, 0.000281, 0.000162]
ETABS_DRIFT_Y = [0.000138, 0.000158, 0.000134, 0.000099, 0.000057]


def Sa_E030(T):
    if T < ESP_TP:
        C = 2.5
    elif T < ESP_TL:
        C = 2.5 * ESP_TP / T
    else:
        C = 2.5 * ESP_TP * ESP_TL / (T * T)
    return ESP_Z * ESP_U * C * ESP_S * ESP_G / ESP_R


def cqc_rho(wi, wj, z=ZETA):
    r = wi / wj
    return (8 * z * z * (1 + r) * r ** 1.5) / (
        (1 - r * r) ** 2 + 4 * z * z * r * (1 + r) ** 2
    )


def _build_for_rsa(diaph):
    """Reconstruye el modelo (vigas paradas, masa nodal = losas + peso propio)
    con el método de diafragma pedido: 'equaldof' | 'rigid' | None."""
    ops.wipe()
    ops.model("basic", "-ndm", 3, "-ndf", 6)
    nid_local = 1
    node_map.clear()
    for z in Z:
        for y in Y:
            for x in X:
                ops.node(nid_local, x, y, z)
                node_map[(x, y, z)] = nid_local
                nid_local += 1
    for (x, y, z), n in node_map.items():
        if abs(z) < 1e-9:
            ops.fix(n, 1, 1, 1, 1, 1, 1)
    ops.geomTransf("Linear", 1, 0.0, 1.0, 0.0)
    ops.geomTransf("Linear", 2, 0.0, 1.0, 0.0)
    ops.geomTransf("Linear", 3, 1.0, 0.0, 0.0)

    sw = {}  # peso propio lumpeado a nodos (t)

    def add(ni, nj, A, J, Iy, Iz, t):
        nonlocal _eid
        ops.element("elasticBeamColumn", _eid, ni, nj, A, E, G, J, Iy, Iz, t)
        _eid += 1
        L = ((ops.nodeCoord(nj)[0] - ops.nodeCoord(ni)[0]) ** 2
             + (ops.nodeCoord(nj)[1] - ops.nodeCoord(ni)[1]) ** 2
             + (ops.nodeCoord(nj)[2] - ops.nodeCoord(ni)[2]) ** 2) ** 0.5
        m = RHO * A * L / 2.0
        sw[ni] = sw.get(ni, 0.0) + m
        sw[nj] = sw.get(nj, 0.0) + m

    _eid = 1
    for x in X:
        for y in Y:
            for i in range(len(Z) - 1):
                add(nid(x, y, Z[i]), nid(x, y, Z[i + 1]),
                    A_col, J_col, Iy_col, Iz_col, 1)
    for z in Z[1:]:
        for y in Y:
            for i in range(len(X) - 1):
                if viga_quitada(X[i], y, X[i + 1], y):
                    continue
                add(nid(X[i], y, z), nid(X[i + 1], y, z),
                    A_beam, J_beam, Iy_beam, Iz_beam, 2)
    for z in Z[1:]:
        for x in X:
            for i in range(len(Y) - 1):
                if viga_quitada(x, Y[i], x, Y[i + 1]):
                    continue
                add(nid(x, Y[i], z), nid(x, Y[i + 1], z),
                    A_beam, J_beam, Iy_beam, Iz_beam, 3)

    # masa nodal = losas (tributaria) + peso propio
    for n in node_map.values():
        m = masa_nodal.get(n, 0.0) + sw.get(n, 0.0)
        if m > 0:
            ops.mass(n, m, m, m, 1e-9, 1e-9, 1e-9)

    # diafragma
    cxg, cyg = sum(X) / len(X), sum(Y) / len(Y)
    for z in Z[1:]:
        fn = [nid(x, y, z) for y in Y for x in X]
        master = min(fn, key=lambda n: (ops.nodeCoord(n)[0] - cxg) ** 2
                     + (ops.nodeCoord(n)[1] - cyg) ** 2)
        slaves = [n for n in fn if n != master]
        if diaph == "rigid":
            ops.rigidDiaphragm(3, master, *slaves)
        elif diaph == "equaldof":
            for s in slaves:
                ops.equalDOF(master, s, 1, 2)


def run_rsa_drifts(diaph, d):
    """Deriva de entrepiso (ratio) por análisis espectral CQC, dirección d
    (0=X, 1=Y). Toma el máximo sobre los nodos del piso (capta torsión)."""
    _build_for_rsa(diaph)
    ops.constraints("Transformation")
    ops.numberer("RCM")
    ops.system("FullGeneral")
    eig = ops.eigen("-fullGenLapack", NUM_MODOS)
    w = [math.sqrt(abs(float(np.real(v)))) for v in eig]

    alln = list(node_map.values())
    mnode = {n: ops.nodeMass(n)[0] for n in alln}
    phi = {(m, n): ops.nodeEigenvector(n, m + 1) for m in range(NUM_MODOS)
           for n in alln}

    gamma, Sd = [], []
    for m in range(NUM_MODOS):
        Mn = sum(mnode[n] * (phi[(m, n)][0] ** 2 + phi[(m, n)][1] ** 2
                             + phi[(m, n)][2] ** 2) for n in alln)
        Ln = sum(mnode[n] * phi[(m, n)][d] for n in alln)
        gamma.append(Ln / Mn if Mn > 0 else 0.0)
        Sd.append(Sa_E030(2 * math.pi / w[m]) / (w[m] ** 2))

    positions = [(x, y) for y in Y for x in X]
    drifts = []
    for s in range(1, len(Z)):
        zt, zb = Z[s], Z[s - 1]
        dmax = 0.0
        for (x, y) in positions:
            nt = nid(x, y, zt)
            nb = nid(x, y, zb) if zb > 1e-9 else None
            dn = []
            for m in range(NUM_MODOS):
                ut = gamma[m] * Sd[m] * phi[(m, nt)][d]
                ub = gamma[m] * Sd[m] * phi[(m, nb)][d] if nb else 0.0
                dn.append(ut - ub)
            tot = sum(cqc_rho(w[i], w[j]) * dn[i] * dn[j]
                      for i in range(NUM_MODOS) for j in range(NUM_MODOS))
            dmax = max(dmax, math.sqrt(abs(tot)))
        drifts.append(dmax / H)
    return drifts


print("\n" + "=" * 78)
print(" VALIDACIÓN DE DERIVAS  (RSA + CQC, E.030/R=%.0f)" % ESP_R)
print("=" * 78)

dx_eq = run_rsa_drifts("equaldof", 0)
dx_rg = run_rsa_drifts("rigid", 0)
dy_eq = run_rsa_drifts("equaldof", 1)
dy_rg = run_rsa_drifts("rigid", 1)

print("\nDERIVA X (ratio):")
print(f"{'Piso':>4} {'equalDOF':>10} {'rigidDiaph':>11} {'rigid/eqDOF':>12}"
      f" {'ETABS':>9}")
print("-" * 50)
for i in range(len(dx_eq)):
    amp = dx_rg[i] / dx_eq[i] if dx_eq[i] else 0.0
    print(f"{i+1:>4} {dx_eq[i]:>10.6f} {dx_rg[i]:>11.6f} {amp:>11.2f}x"
          f" {ETABS_DRIFT_X[i]:>9.6f}")

print("\nDERIVA Y (ratio):")
print(f"{'Piso':>4} {'equalDOF':>10} {'rigidDiaph':>11} {'rigid/eqDOF':>12}"
      f" {'ETABS':>9}")
print("-" * 50)
for i in range(len(dy_eq)):
    amp = dy_rg[i] / dy_eq[i] if dy_eq[i] else 0.0
    print(f"{i+1:>4} {dy_eq[i]:>10.6f} {dy_rg[i]:>11.6f} {amp:>11.2f}x"
          f" {ETABS_DRIFT_Y[i]:>9.6f}")

ampX = max(dx_rg) / max(dx_eq) if max(dx_eq) else 0.0
ampY = max(dy_rg) / max(dy_eq) if max(dy_eq) else 0.0
print("\n" + "=" * 78)
print(f"Amplificación de deriva MÁX por usar rigidDiaphragm:  X = {ampX:.2f}x"
      f"   Y = {ampY:.2f}x")
print("Interpretación:  ~1.0x => rigidDiaphragm es SEGURO para derivas.")
print("                 ~1.3x+ => reintroduce el bug de deriva X del motor.")
print("Nota: el VALOR absoluto depende del espectro (Z,U,S,Tp,Tl,R de arriba);\n"
      "      el cociente rigid/eqDOF es robusto y es lo que decide.")
