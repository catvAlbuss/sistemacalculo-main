# -*- coding: utf-8 -*-
"""
VERIFICACIÓN del MODAL del motor (seismic_analysis.py) vs ETABS — edificio 5 pisos.

Arma el payload de la estructura validada (misma que test_modal_3d.py) y lo pasa
DIRECTO a build_model_3d + run_modal_analysis, sin pasar por la app/Flask.
Corre los dos métodos de diafragma (equalDOF y rigidDiaphragm) y compara los
periodos con ETABS: T1/T2/T3 = 0.907 (Y) / 0.849 (X) / 0.759 (torsión).
"""
import seismic_analysis as SA

# ── Rejilla 5 pisos (idéntica a test_modal_3d.py) ────────────────────────────
X = [0.0, 6.0, 12.0, 17.0]
Y = [0.0, 6.0, 11.0, 14.0]
Z = [0.0, 3.0, 6.0, 9.0, 12.0, 15.0]
NX, NY, NZ = len(X), len(Y), len(Z)

E = 2.1318e10          # Pa (concreto f'c=210)
G = 9.2687e9           # Pa
col = {"A": 0.12, "Iy": 0.0009, "Iz": 0.0016, "J": 0.001944}      # 30x40
viga = {"A": 0.15, "Iy": 0.001125, "Iz": 0.003125, "J": 0.002817}  # 30x50
masa_piso = {1: 181938.0, 2: 174892.0, 3: 174892.0, 4: 174892.0, 5: 167846.0}

# ── Anchos tributarios por eje (mitad de cada vano adyacente) ────────────────
def trib_widths(coords):
    w = []
    for idx in range(len(coords)):
        left = (coords[idx] - coords[idx - 1]) / 2 if idx > 0 else 0.0
        right = (coords[idx + 1] - coords[idx]) / 2 if idx < len(coords) - 1 else 0.0
        w.append(left + right)
    return w


tx = trib_widths(X)   # [3.0, 6.0, 5.5, 2.5]   (suma = 17 = luz X)
ty = trib_widths(Y)   # [3.0, 5.5, 4.0, 1.5]   (suma = 14 = luz Y)
plan_area = sum(tx) * sum(ty)   # = 238 m²

# Modo de masa: True = área tributaria, False = uniforme (masa_piso/16)
USE_TRIBUTARY = True

# ── Nodos ────────────────────────────────────────────────────────────────────
nid_of, nodes = {}, []
nid = 1
for k in range(NZ):
    for j in range(NY):
        for i in range(NX):
            m = 0.0
            if k >= 1:
                if USE_TRIBUTARY:
                    m = masa_piso[k] * (tx[i] * ty[j]) / plan_area
                else:
                    m = masa_piso[k] / (NX * NY)
            nodes.append({"id": nid, "x": X[i], "y": Y[j], "z": Z[k],
                          "mass_x": m, "mass_y": m, "mass_z": 0.0})
            nid_of[(i, j, k)] = nid
            nid += 1

# ── Elementos (columnas + vigas X + vigas Y) con vecxz calibrado ─────────────
elements = []
eid = 1


def add(ni, nj, s, vecxz):
    global eid
    elements.append({"id": eid, "node_i": ni, "node_j": nj,
                     "A": s["A"], "E": E, "G": G,
                     "Iz": s["Iz"], "Iy": s["Iy"], "J": s["J"], "vecxz": vecxz})
    eid += 1


for k in range(NZ - 1):                       # columnas
    for j in range(NY):
        for i in range(NX):
            add(nid_of[(i, j, k)], nid_of[(i, j, k + 1)], col, [0.0, 1.0, 0.0])
for k in range(1, NZ):                          # vigas X (paradas)
    for j in range(NY):
        for i in range(NX - 1):
            add(nid_of[(i, j, k)], nid_of[(i + 1, j, k)], viga, [0.0, 1.0, 0.0])
for k in range(1, NZ):                          # vigas Y (paradas)
    for j in range(NY - 1):
        for i in range(NX):
            add(nid_of[(i, j, k)], nid_of[(i, j + 1, k)], viga, [1.0, 0.0, 0.0])

supports = [{"node": nid_of[(i, j, 0)], "ux": 1, "uy": 1, "uz": 1,
             "rx": 1, "ry": 1, "rz": 1} for j in range(NY) for i in range(NX)]

ETABS = {"T1 (Y)": 0.907, "T2 (X)": 0.849, "T3 (torsión)": 0.759}


def run(label, rotation):
    data = {
        "nodes": [dict(n) for n in nodes],
        "elements": [dict(e) for e in elements],
        "supports": supports,
        "useRigidDiaphragms": True,
        "rigidDiaphragmRotation": rotation,
    }
    model_nodes, _ = SA.build_model_3d(data)
    res = SA.run_modal_analysis(model_nodes, num_modes=6)
    rep = (data.get("_rigid_diaphragm_report", {}) or {}).get("applied", [])
    method = rep[0].get("method") if rep else "?"
    info = res.get("modal_info", [])
    periods = [m["period"] for m in info]
    cumx = info[-1].get("cumulative_participation_x", 0) if info else 0
    cumy = info[-1].get("cumulative_participation_y", 0) if info else 0

    print("\n" + "=" * 70)
    print(f"  {label}   (diaphragm method = {method})")
    print("=" * 70)
    print(f"  Total masa sísmica: {sum(masa_piso.values())/1000:.0f} t   "
          f"({len(nodes)} nodos, {len(elements)} elementos)")
    print(f"  {'Modo':>4} | {'T motor [s]':>11} | {'MX %':>7} {'MY %':>7} {'RZ %':>7}")
    for idx, m in enumerate(info):
        print(f"  {idx+1:>4} | {m['period']:>11.4f} | "
              f"{m['mass_participation_x']:>7.2f} {m['mass_participation_y']:>7.2f} "
              f"{m['mass_participation_rz']:>7.2f}")
    print(f"  ΣMX={cumx:.1f}%  ΣMY={cumy:.1f}%")

    # Clasificar cada modo por participación dominante y comparar por TIPO
    def first(kind):
        for m in info:
            mx, my, rz = (m["mass_participation_x"], m["mass_participation_y"],
                          m["mass_participation_rz"])
            dom = max(mx, my, rz)
            if dom < 1:
                continue
            if kind == "X" and mx == dom:
                return m["period"]
            if kind == "Y" and my == dom:
                return m["period"]
            if kind == "T" and rz == dom:
                return m["period"]
        return None

    print("\n  Comparación por TIPO de modo (no por orden):")
    for kind, et in (("Y", 0.907), ("X", 0.849), ("T", 0.759)):
        tp = first(kind)
        name = {"Y": "Y (traslación)", "X": "X (traslación)", "T": "Torsión"}[kind]
        if tp is None:
            print(f"     {name:<16} motor: (no aparece)   ETABS {et:.3f}")
        else:
            print(f"     {name:<16} motor T={tp:.4f}  vs ETABS {et:.3f}  "
                  f"→  {(tp-et)/et*100:+.1f}%")


run("A) equalDOF (UX,UY)  — DEFAULT del motor", rotation=False)
run("B) rigidDiaphragm(3) — UX,UY,RZ (opt-in)", rotation=True)


# ─────────────────────────────────────────────────────────────────────────────
#  VERIFICACIÓN DE DERIVA X — ¿rigidDiaphragm amplifica la deriva X?
# ─────────────────────────────────────────────────────────────────────────────
def etabs_e030_spectrum():
    """Espectro E.030 (Z=0.45,U=1,S=1,Tp=0.6,Tl=2.0,R=1) en g, para T=0..3 s.
    Solo se usa para COMPARAR métodos; el valor absoluto no importa aquí."""
    Z, U, S, Tp, Tl = 0.45, 1.0, 1.0, 0.6, 2.0
    pts = []
    T = 0.0
    while T <= 3.0001:
        if T < Tp:
            C = 2.5
        elif T < Tl:
            C = 2.5 * Tp / T
        else:
            C = 2.5 * Tp * Tl / (T * T)
        pts.append((T, Z * U * S * C))
        T += 0.05
    return pts


def max_x_story_drift(rotation):
    data = {
        "nodes": [dict(n) for n in nodes],
        "elements": [dict(e) for e in elements],
        "supports": supports,
        "useRigidDiaphragms": True,
        "rigidDiaphragmRotation": rotation,
    }
    model_nodes, _ = SA.build_model_3d(data)
    modal = SA.run_modal_analysis(model_nodes, num_modes=6)
    rsa = SA.run_rsa(modal, etabs_e030_spectrum(), direction="x", combination="CQC")
    disp = rsa["displacements"] if "displacements" in rsa else rsa
    # Agrupar por línea de columna (x,y) y medir deriva entre pisos consecutivos
    by_col = {}
    for n in nodes:
        key = (round(n["x"], 2), round(n["y"], 2))
        d = disp.get(n["id"]) or disp.get(str(n["id"])) or {}
        by_col.setdefault(key, []).append((n["z"], abs(d.get("dx", 0.0))))
    line_max = {}  # deriva máx por línea de columna
    for key, col in by_col.items():
        col.sort()
        dmax = 0.0
        for a, b in zip(col, col[1:]):
            h = b[0] - a[0]
            if h > 0:
                dmax = max(dmax, (b[1] - a[1]) / h)
        line_max[key] = dmax
    vals = list(line_max.values())
    return min(vals), max(vals)   # (línea menos vs más solicitada)


print("\n" + "#" * 70)
print("  DERIVA X (RSA, espectro E.030, CQC) — masa tributaria")
print("#" * 70)
eq_min, eq_max = max_x_story_drift(False)
rd_min, rd_max = max_x_story_drift(True)
print(f"  equalDOF       : deriva X  min={eq_min:.6f}  max={eq_max:.6f}")
print(f"  rigidDiaphragm : deriva X  min={rd_min:.6f}  max={rd_max:.6f}")
print(f"  Línea MENOS solicitada (≈centro): rigid vs eq = {(rd_min-eq_min)/eq_min*100:+.1f}%")
print(f"  Línea MÁS solicitada (esquina)  : rigid vs eq = {(rd_max-eq_max)/eq_max*100:+.1f}%")
