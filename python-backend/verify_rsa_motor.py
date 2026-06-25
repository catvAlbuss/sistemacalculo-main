# -*- coding: utf-8 -*-
"""
VERIFICACIÓN del RSA del motor vs ETABS — edificio 5 pisos.

Espectro E.030: Z=0.25, U=1.0, S=1.20 (S2/Zona2), Tp=0.6, Tl=2.0, R=8 (reducido).
Corre RSA puro en X y en Y (CQC) y compara la deriva por piso contra las
columnas SDX/SDY ESCALADO de ETABS.
"""
import math
import numpy as np
import seismic_analysis as SA

# ── Modelo 5 pisos (idéntico al modal verificado) ────────────────────────────
X = [0.0, 6.0, 12.0, 17.0]
Y = [0.0, 6.0, 11.0, 14.0]
Z = [0.0, 3.0, 6.0, 9.0, 12.0, 15.0]
NX, NY, NZ = len(X), len(Y), len(Z)
E, Gm = 2.1318e10, 9.2687e9
col = {"A": 0.12, "Iy": 0.0009, "Iz": 0.0016, "J": 0.001944}
viga = {"A": 0.15, "Iy": 0.001125, "Iz": 0.003125, "J": 0.002817}
masa_piso = {1: 181938.0, 2: 174892.0, 3: 174892.0, 4: 174892.0, 5: 167846.0}


def trib(c):
    w = []
    for i in range(len(c)):
        left = (c[i] - c[i - 1]) / 2 if i > 0 else 0.0
        right = (c[i + 1] - c[i]) / 2 if i < len(c) - 1 else 0.0
        w.append(left + right)
    return w


tx, ty = trib(X), trib(Y)
plan = sum(tx) * sum(ty)

nid_of, nodes = {}, []
nid = 1
for k in range(NZ):
    for j in range(NY):
        for i in range(NX):
            m = masa_piso[k] * (tx[i] * ty[j]) / plan if k >= 1 else 0.0
            nodes.append({"id": nid, "x": X[i], "y": Y[j], "z": Z[k],
                          "mass_x": m, "mass_y": m, "mass_z": 0.0})
            nid_of[(i, j, k)] = nid
            nid += 1

elements = []
eid = 1


def add(ni, nj, s, vecxz):
    global eid
    elements.append({"id": eid, "node_i": ni, "node_j": nj, "A": s["A"], "E": E, "G": Gm,
                     "Iz": s["Iz"], "Iy": s["Iy"], "J": s["J"], "vecxz": vecxz})
    eid += 1


for k in range(NZ - 1):
    for j in range(NY):
        for i in range(NX):
            add(nid_of[(i, j, k)], nid_of[(i, j, k + 1)], col, [0.0, 1.0, 0.0])
for k in range(1, NZ):
    for j in range(NY):
        for i in range(NX - 1):
            add(nid_of[(i, j, k)], nid_of[(i + 1, j, k)], viga, [0.0, 1.0, 0.0])
for k in range(1, NZ):
    for j in range(NY - 1):
        for i in range(NX):
            add(nid_of[(i, j, k)], nid_of[(i, j + 1, k)], viga, [1.0, 0.0, 0.0])

supports = [{"node": nid_of[(i, j, 0)], "ux": 1, "uy": 1, "uz": 1, "rx": 1, "ry": 1, "rz": 1}
            for j in range(NY) for i in range(NX)]


# ── Espectro E.030 reducido (Sa en g) ────────────────────────────────────────
def e030(Zf=0.25, U=1.0, S=1.20, Tp=0.6, Tl=2.0, R=8.0):
    pts = []
    T = 0.0
    while T <= 4.0001:
        if T < Tp:
            C = 2.5
        elif T < Tl:
            C = 2.5 * Tp / T
        else:
            C = 2.5 * Tp * Tl / (T * T)
        pts.append((T, Zf * U * C * S / R))
        T += 0.02
    return pts


SPEC = e030()
print(f"Espectro E.030: meseta Sa = {max(s for _, s in SPEC):.4f} g  (R=8, reducido)")

# ── Análisis ─────────────────────────────────────────────────────────────────
data = {"nodes": [dict(n) for n in nodes], "elements": [dict(e) for e in elements],
        "supports": supports, "useRigidDiaphragms": True, "rigidDiaphragmRotation": False}
model_nodes, _ = SA.build_model_3d(data)
modal = SA.run_modal_analysis(model_nodes, num_modes=6)
rsa_x = SA.run_rsa(modal, SPEC, direction="x", combination="CQC")
rsa_y = SA.run_rsa(modal, SPEC, direction="y", combination="CQC")
dx = rsa_x["displacements"]
dy = rsa_y["displacements"]


def story_drifts(disp, comp):
    # max deriva por piso sobre las líneas de columna
    cols = {}
    for n in nodes:
        key = (round(n["x"], 2), round(n["y"], 2))
        d = disp.get(n["id"]) or disp.get(str(n["id"])) or {}
        cols.setdefault(key, []).append((n["z"], abs(d.get(comp, 0.0))))
    drifts = [0.0] * (NZ - 1)
    for col_nodes in cols.values():
        col_nodes.sort()
        for s in range(1, NZ):
            h = col_nodes[s][0] - col_nodes[s - 1][0]
            if h > 0:
                drifts[s - 1] = max(drifts[s - 1], (col_nodes[s][1] - col_nodes[s - 1][1]) / h)
    return drifts


drX = story_drifts(dx, "dx")
drY = story_drifts(dy, "dy")

# ETABS SDX/SDY ESCALADO (deriva por piso, Story1..5)
etabs_x = [0.001157, 0.001495, 0.001302, 0.000976, 0.000563]
etabs_y = [0.001364, 0.001589, 0.001367, 0.001035, 0.000603]

print("\n  DERIVA X (RSA puro X, reducida) vs ETABS SDX ESCALADO")
print(f"  {'Piso':>5} | {'Motor':>10} | {'ETABS':>10} | {'Motor/ETABS':>11}")
for s in range(NZ - 1):
    r = drX[s] / etabs_x[s] if etabs_x[s] else 0
    print(f"  {s+1:>5} | {drX[s]:>10.6f} | {etabs_x[s]:>10.6f} | {r:>10.2f}x")

print("\n  DERIVA Y (RSA puro Y, reducida) vs ETABS SDY ESCALADO")
print(f"  {'Piso':>5} | {'Motor':>10} | {'ETABS':>10} | {'Motor/ETABS':>11}")
for s in range(NZ - 1):
    r = drY[s] / etabs_y[s] if etabs_y[s] else 0
    print(f"  {s+1:>5} | {drY[s]:>10.6f} | {etabs_y[s]:>10.6f} | {r:>10.2f}x")

print(f"\n  Base shear X = {rsa_x['base_shear']/1000:.0f} kN   Y = {rsa_y['base_shear']/1000:.0f} kN")
