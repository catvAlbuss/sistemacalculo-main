# -*- coding: utf-8 -*-
"""
ANÁLISIS MODAL 3D — Edificio de 5 pisos (el que venimos analizando).

  Geometría : planta ejes X=[0,6,12,17] m, Y=[0,6,11,14] m; 5 pisos de 3 m (15 m).
  Material  : concreto f'c=210 (E=2.1318e10 Pa, ν=0.15).
  Columnas  : 30x40 cm.   Vigas : 30x50 cm.
  Diafragma : rígido por piso (las losas hacen que el piso se mueva como placa).

Imprime las 9 categorías de entrada de un modal 3D + masa participativa, y al
final dibuja el modelo y la forma del Modo 1 (requiere opsvis+matplotlib).
"""
import math

try:
    import openseespywin.opensees as ops
except ImportError:
    import openseespy.opensees as ops


def titulo(n, t):
    print("\n" + "=" * 66)
    print(f"  {n}. {t}")
    print("=" * 66)


ops.wipe()

# ── Rejilla de la estructura ─────────────────────────────────────────────────
X = [0.0, 6.0, 12.0, 17.0]            # ejes en X (m)
Y = [0.0, 6.0, 11.0, 14.0]            # ejes en Y (m)
Z = [0.0, 3.0, 6.0, 9.0, 12.0, 15.0]  # cotas: base + 5 pisos (m)
NX, NY, NZ = len(X), len(Y), len(Z)

# ── 1. DIMENSIONES Y GRADOS DE LIBERTAD ──────────────────────────────────────
titulo(1, "DIMENSIONES Y GRADOS DE LIBERTAD")
ops.model("basic", "-ndm", 3, "-ndf", 6)
print("  ndm = 3  (espacio 3D)")
print("  ndf = 6  (UX, UY, UZ, RX, RY, RZ por nodo)")

# ── 2. COORDENADAS DE NODOS ──────────────────────────────────────────────────
titulo(2, "COORDENADAS DE NODOS")
nid_of = {}     # (i,j,k) -> id de nodo
nid = 1
for k in range(NZ):
    for j in range(NY):
        for i in range(NX):
            ops.node(nid, X[i], Y[j], Z[k])
            nid_of[(i, j, k)] = nid
            nid += 1
total_nodos = nid - 1
print(f"  {NX} x {NY} = {NX*NY} nodos por nivel  ·  {NZ} niveles (base + 5 pisos)")
print(f"  Total: {total_nodos} nodos")
print(f"  Ejemplo  nodo {nid_of[(0,0,0)]} = (0, 0, 0)   ·   nodo {nid_of[(NX-1,NY-1,NZ-1)]} = ({X[-1]}, {Y[-1]}, {Z[-1]})")

# ── 3. CONDICIONES DE APOYO ──────────────────────────────────────────────────
titulo(3, "CONDICIONES DE APOYO")
base = [nid_of[(i, j, 0)] for j in range(NY) for i in range(NX)]
for n in base:
    ops.fix(n, 1, 1, 1, 1, 1, 1)   # empotrado
print(f"  {len(base)} nodos de la base (z=0) empotrados: UX UY UZ RX RY RZ = 1 1 1 1 1 1")

# ── 4. MATERIALES ────────────────────────────────────────────────────────────
titulo(4, "MATERIALES  (concreto f'c=210 kg/cm²)")
E = 2.1318e10                 # módulo de elasticidad [Pa]
nu = 0.15                     # Poisson
G = E / (2 * (1 + nu))        # módulo de corte [Pa]
print(f"  E = {E:.4e} Pa   ν = {nu}   G = {G:.4e} Pa")

# ── 5. SECCIONES ─────────────────────────────────────────────────────────────
titulo(5, "SECCIONES")
col = {"A": 0.12, "Iy": 0.0009, "Iz": 0.0016, "J": 0.001944}     # 30x40 cm
viga = {"A": 0.15, "Iy": 0.001125, "Iz": 0.003125, "J": 0.002817}  # 30x50 cm
print(f"  Columna 30x40: A={col['A']}  Iy={col['Iy']}  Iz={col['Iz']}  J={col['J']}")
print(f"  Viga    30x50: A={viga['A']}  Iy={viga['Iy']}  Iz={viga['Iz']}  J={viga['J']}")

# ── 6. TRANSFORMACIÓN GEOMÉTRICA ─────────────────────────────────────────────
titulo(6, "TRANSFORMACIÓN GEOMÉTRICA  (orienta los ejes locales)")
ops.geomTransf("Linear", 1, 0, 1, 0)  # columnas y vigas en X: vecxz=(0,1,0)
ops.geomTransf("Linear", 2, 1, 0, 0)  # vigas en Y:            vecxz=(1,0,0)
print("  Transf 1 (columnas + vigas-X): vecxz=(0,1,0)  → Iz fuerte resiste X / vigas paradas")
print("  Transf 2 (vigas-Y):            vecxz=(1,0,0)  → vigas paradas (Iz vertical)")

# ── 7. ELEMENTOS ─────────────────────────────────────────────────────────────
titulo(7, "ELEMENTOS  (elasticBeamColumn: A,E,G,J,Iy,Iz,transf)")
eid = 1
n_col = n_bx = n_by = 0
# Columnas (verticales): nivel k -> k+1
for k in range(NZ - 1):
    for j in range(NY):
        for i in range(NX):
            ops.element("elasticBeamColumn", eid, nid_of[(i, j, k)], nid_of[(i, j, k + 1)],
                        col["A"], E, G, col["J"], col["Iy"], col["Iz"], 1)
            eid += 1; n_col += 1
# Vigas en X (en cada piso k>=1)
for k in range(1, NZ):
    for j in range(NY):
        for i in range(NX - 1):
            ops.element("elasticBeamColumn", eid, nid_of[(i, j, k)], nid_of[(i + 1, j, k)],
                        viga["A"], E, G, viga["J"], viga["Iy"], viga["Iz"], 1)
            eid += 1; n_bx += 1
# Vigas en Y (en cada piso k>=1)
for k in range(1, NZ):
    for j in range(NY - 1):
        for i in range(NX):
            ops.element("elasticBeamColumn", eid, nid_of[(i, j, k)], nid_of[(i, j + 1, k)],
                        viga["A"], E, G, viga["J"], viga["Iy"], viga["Iz"], 2)
            eid += 1; n_by += 1
print(f"  Columnas: {n_col}   Vigas-X: {n_bx}   Vigas-Y: {n_by}   ·   Total: {eid-1} elementos")

# ── 8. MASAS ─────────────────────────────────────────────────────────────────
titulo(8, "MASAS por piso  [kg]  (masa sísmica E.030)")
# Masa sísmica por piso (≈ del reporte), repartida en los 16 nodos del piso.
masa_piso = {1: 181938.0, 2: 174892.0, 3: 174892.0, 4: 174892.0, 5: 167846.0}
for k in range(1, NZ):
    m_nodo = masa_piso[k] / (NX * NY)
    for j in range(NY):
        for i in range(NX):
            ops.mass(nid_of[(i, j, k)], m_nodo, m_nodo, 0.0, 0.0, 0.0, 0.0)
    print(f"  Piso {k} (z={Z[k]:>4.0f}m): {masa_piso[k]/1000:>6.1f} t  →  {m_nodo:>8.1f} kg/nodo en UX,UY")
print(f"  Total masa sísmica ≈ {sum(masa_piso.values())/1000:.0f} t")

# ── 8b. DIAFRAGMA RÍGIDO por piso ────────────────────────────────────────────
titulo("8b", "DIAFRAGMA RÍGIDO  (la losa hace que el piso gire/traslade como placa)")
for k in range(1, NZ):
    floor = [nid_of[(i, j, k)] for j in range(NY) for i in range(NX)]
    master, slaves = floor[0], floor[1:]
    ops.rigidDiaphragm(3, master, *slaves)   # perpDirn=3 (plano XY)
    print(f"  Piso {k}: maestro={master}, {len(slaves)} nodos atados (UX,UY,RZ)")

# ── 9. PATRONES DE CARGA ─────────────────────────────────────────────────────
titulo(9, "PATRONES DE CARGA")
print("  El modal es vibración libre: NO se aplican cargas. Solo importan las masas.")

# ── ANÁLISIS MODAL ───────────────────────────────────────────────────────────
titulo("★", "ANÁLISIS MODAL — K·φ = ω²·M·φ")
ops.constraints("Transformation")
ops.numberer("RCM")
ops.system("UmfPack")
NUM_MODOS = 6
lam = ops.eigen("-genBandArpack", NUM_MODOS)  # solver modal rápido (Arpack)
print(f"  {'Modo':>4} | {'T [s]':>8} | {'f [Hz]':>8} | {'ω [rad/s]':>10}")
for i, l in enumerate(lam, 1):
    w = math.sqrt(float(l)) if float(l) > 0 else 0.0
    f = w / (2 * math.pi) if w > 0 else 0.0
    T = 1 / f if f > 0 else 0.0
    print(f"  {i:>4} | {T:>8.4f} | {f:>8.4f} | {w:>10.4f}")
print("  (T1 ≈ 0.9-1.0 s es lo esperado para este edificio de 5 pisos)")

# ── MASA PARTICIPATIVA ───────────────────────────────────────────────────────
titulo("★★", "MASA PARTICIPATIVA  (acumulada debe llegar a >= 90%)")
try:
    mp = ops.modalProperties("-return")
    mx, my, rz = mp.get("partiMassRatiosMX", []), mp.get("partiMassRatiosMY", []), mp.get("partiMassRatiosRMZ", [])
    cmx, cmy = mp.get("partiMassRatiosCumuMX", []), mp.get("partiMassRatiosCumuMY", [])
    print(f"  {'Modo':>4} | {'MX %':>7} {'MY %':>7} {'RZ(tors)%':>10} | {'sumaMX%':>8} {'sumaMY%':>8}")
    for i in range(len(mx)):
        print(f"  {i+1:>4} | {mx[i]:>7.2f} {my[i]:>7.2f} {rz[i]:>10.2f} | {cmx[i]:>8.2f} {cmy[i]:>8.2f}")
except Exception as e:
    print(f"  (modalProperties no disponible: {e})")

# ── VISUALIZACIÓN  (pip install opsvis matplotlib) ───────────────────────────
titulo("◆", "VISUALIZACIÓN DE LA ESTRUCTURA  (ventanas 3D)")
try:
    import opsvis as opsv
    import matplotlib.pyplot as plt
    opsv.plot_model(node_labels=0, element_labels=0)
    plt.title("Edificio 5 pisos — modelo 3D")
    opsv.plot_mode_shape(1, endDispFlag=0)
    plt.title("Forma modal — Modo 1 (T1)")
    print("  Abriendo 2 ventanas: el edificio y la forma del Modo 1. Cierra para terminar.")
    plt.show()
except ImportError:
    print("  Para VER la estructura instala:  pip install opsvis matplotlib")
    print("  Luego vuelve a correr el script y se abrirán las ventanas 3D.")

ops.wipe()
print("\n" + "=" * 66)
print("  Listo — modal 3D del edificio de 5 pisos.")
print("=" * 66)
