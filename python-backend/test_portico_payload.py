"""
Prueba: arma el MISMO portico de 3 pisos de estructura.py como un *payload*
y lo pasa por el motor seismic_analysis.py (build_model_3d + run_modal_analysis),
comparando 3 configuraciones de diafragma:

    A) Sin diafragma            -> debe coincidir con estructura.py
    B) equalDOF(UX,UY)          -> default del motor (sin torsion)
    C) rigidDiaphragm(UX,UY,RZ) -> opt-in, captura torsion  <-- lo que se requiere

Ejecutar con el venv:
    ./venv/Scripts/python.exe test_portico_payload.py
"""

import numpy as np
from seismic_analysis import build_model_3d, run_modal_analysis

# ───────────────────────────────────────────────────────────────────────────
#  1. Unidades y propiedades (identicas a estructura.py / al video)
# ───────────────────────────────────────────────────────────────────────────
m = 1; kg = 1; s = 1
cm = 0.01 * m
kgf = 9.80665 * kg * m / s**2

fc = 280 * kgf / cm**2
E = 150 * fc**0.5 * kgf / cm**2          # formula del video (~77 GPa, en Pa)
G = 0.5 * E / (1 + 0.2)

# Viga 30x60  (el video pasa Iyv = eje debil como Iy)
b, h = 30 * cm, 60 * cm
Av = b * h
Iz_v = b * h**3 / 12                     # fuerte
Iy_v = b**3 * h / 12                     # debil  (se manda como Iy, igual que el video)
aa, bb = max(b, h), min(b, h)
Jv = (1/3 - 0.21*(bb/aa)*(1 - (bb/aa)**4/12)) * aa * bb**3

# Columna 45x45
a = 45 * cm
Ac = a * a
Ic = a**4 / 12
Jc = (1/3 - 0.21*(1 - 1/12)) * a**4

# ───────────────────────────────────────────────────────────────────────────
#  2. Geometria (mismos ejes que estructura.py)
# ───────────────────────────────────────────────────────────────────────────
nivel_z = [0.0, 3.0, 6.0, 9.0]
columnas = {
    1: (0.0, 4.0),  2: (0.0, 8.0),  3: (0.0, 12.0), 4: (4.0, 0.0),
    5: (4.0, 4.0),  6: (4.0, 8.0),  7: (4.0, 12.0), 8: (11.0, 0.0),
    9: (11.0, 4.0), 10: (11.0, 8.0), 11: (12.0, 4.0), 12: (13.0, 0.0),
}

# ── Masas tributarias por columna (igual que estructura.py) ────────────────
nodos = np.array([columnas[i + 1] for i in range(12)], dtype="f8")

def xyz2area(xy):
    p = np.asarray(xy, dtype="f8")[:, :2]
    c = p.mean(axis=0)
    p = p[np.argsort(np.arctan2(p[:, 1] - c[1], p[:, 0] - c[0]))]
    x, y = p[:, 0], p[:, 1]
    return 0.5 * abs(np.dot(x, np.roll(y, -1)) - np.dot(y, np.roll(x, -1)))

losas = [[0, 4, 5, 1], [1, 5, 6, 2], [4, 8, 9, 5],
         [3, 7, 8, 4], [7, 11, 10, 8], [8, 10, 9]]
areas = np.zeros(12, "f8")
for losa in losas:
    areas[losa] += xyz2area(nodos[losa]) / len(losa)

wTotal = (300 + 100 + 150) + 0.25 * 250   # kg/m2
m_nodos = areas * wTotal                   # masa por columna (kg)

# ───────────────────────────────────────────────────────────────────────────
#  3. Construccion del PAYLOAD (formato que espera el motor)
# ───────────────────────────────────────────────────────────────────────────
def build_payload(diaphragm=False, rotation=False):
    nodes, supports = [], []
    for niv, z in enumerate(nivel_z):
        for cid, (x, y) in columnas.items():
            nid = niv * 100 + cid
            node = {"id": nid, "x": x, "y": y, "z": z}
            if niv == 0:                       # base empotrada
                supports.append({"node": nid, "ux": 1, "uy": 1, "uz": 1,
                                 "rx": 1, "ry": 1, "rz": 1})
            else:                              # masa de piso en X e Y
                mi = float(m_nodos[cid - 1])
                node["mass_x"] = mi
                node["mass_y"] = mi
            nodes.append(node)

    elements = []
    eid = 1
    # Columnas (E en Pa; Iy=Iz por ser cuadrada)
    for niv in range(3):
        for cid in columnas:
            elements.append({"id": eid, "node_i": niv*100 + cid, "node_j": (niv+1)*100 + cid,
                             "A": Ac, "E": E, "G": G, "J": Jc, "Iy": Ic, "Iz": Ic})
            eid += 1
    # Vigas (Iy = eje debil, igual que el video)
    vigas = [(3,7),(2,6),(6,10),(1,5),(5,9),(9,11),(4,8),(8,12),
             (1,2),(2,3),(4,5),(5,6),(6,7),(8,9),(9,10),(10,11),(11,12)]
    for niv in range(1, 4):
        for ci, cj in vigas:
            elements.append({"id": eid, "node_i": niv*100 + ci, "node_j": niv*100 + cj,
                             "A": Av, "E": E, "G": G, "J": Jv, "Iy": Iy_v, "Iz": Iz_v})
            eid += 1

    data = {"nodes": nodes, "elements": elements, "supports": supports}
    if diaphragm:
        data["rigidDiaphragm"] = True            # agrupa nodos por piso (Z)
        data["rigidDiaphragmRotation"] = rotation  # True -> ops.rigidDiaphragm(UX,UY,RZ)
    return data

# ───────────────────────────────────────────────────────────────────────────
#  4. Correr los 3 casos y comparar
# ───────────────────────────────────────────────────────────────────────────
CASOS = [
    ("A) Sin diafragma",            dict(diaphragm=False)),
    ("B) equalDOF (UX,UY)",         dict(diaphragm=True, rotation=False)),
    ("C) rigidDiaphragm (UX,UY,RZ)", dict(diaphragm=True, rotation=True)),
]
NMODES = 9

for titulo, kw in CASOS:
    data = build_payload(**kw)
    nodes, elements = build_model_3d(data)
    rep = data.get("_rigid_diaphragm_report", {})
    metodos = {a.get("method") for a in rep.get("applied", []) if isinstance(a, dict)}
    res = run_modal_analysis(nodes, NMODES)

    print("\n" + "=" * 64)
    print(titulo, " | metodo:", (metodos or "—"))
    print("=" * 64)
    print(" modo |   T (s)  |  %MX   |  %MY   |  %RZ   | acumMX | acumMY")
    print(" -----+----------+--------+--------+--------+--------+-------")
    for mi in res["modal_info"]:
        print(f"  {mi['mode']:>2}  | {mi['period']:8.4f} |"
              f" {mi['mass_participation_x']:6.1f} | {mi['mass_participation_y']:6.1f} |"
              f" {mi['mass_participation_rz']:6.1f} |"
              f" {mi['cumulative_participation_x']:6.1f} | {mi['cumulative_participation_y']:6.1f}")
