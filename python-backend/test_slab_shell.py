"""
Prueba controlada del SHELL DE LOSA (ShellMITC4) — ver _build_slab_mesh_plan
en seismic/inputs.py.

    venv\\Scripts\\python.exe test_slab_shell.py

Modelo: galpon de 6x4 m, columnas de 3 m, y TECHO A DOS AGUAS (cumbrera a 4.5 m
sobre la linea y=2). Los dos faldones son losas inclinadas.

Que verifica (resultados obtenidos el 2026-08-03, sirven de referencia):
  1. El modelo construye y resuelve sin matriz singular con las losas malladas.
  2. La losa inclinada RIGIDIZA: T1 0.19534 -> 0.14823 s (-24%).
  3. Los nudos de la cumbrera quedan FUERA del diafragma rigido (el grupo
     espurio D_Z_2 = [9, 10] desaparece) = comportamiento semi-rigido.
     (ops.rigidDiaphragm IGNORA nudos no coplanares, asi que el semi-rigido en
     un techo inclinado no es una opcion sino la unica via posible.)
  4. slabShellMode="sloped" (modo opcional) saltea la losa plana -> periodos
     identicos al modelo sin losas. El DEFAULT ya NO es ese: es "all", igual
     que ETABS, que malla cada area. Se cambio el 2026-08-03 con el payload
     real de MODULO 1, donde una fila de vigas sin columnas quedaba flotando
     (dos modos de cuerpo rigido + estatico con matriz singular) porque las
     losas PLANAS eran lo unico que la conectaba al portico.
  5. Un poligono inclinado de 6 vertices se subdivide en cuadrilateros y malla.
  6. Una cumbrera SIN barras, sostenida solo por el shell, tambien resuelve.
  7. El mecanismo de MODELINGTYPE sigue vivo: bajando a proposito el
     modificador de Membrane a 0.1, esa losa sale mas flexible que la Shell.
     OJO: hoy AMBOS valen 1.0 (ver _SLAB_MEMBRANE_BENDING_MODIFIER). El 0.1
     original se habia calibrado con el import de MODULO 1 roto; con el import
     arreglado, 1.0 da T1/T2 a -1.1%/-1.3% de ETABS y 100% de masa
     participante en 15 modos, contra 62% en Y con 0.1.
"""
import json
import sys
from pathlib import Path

BACKEND = Path(__file__).resolve().parent
sys.path.insert(0, str(BACKEND))

from seismic.inputs import build_model_3d  # noqa: E402
from seismic.solver import run_modal_analysis  # noqa: E402

E = 25e9
G = 10.4e9

NODES = [
    # base
    {"id": 1, "x": 0, "y": 0, "z": 0},
    {"id": 2, "x": 6, "y": 0, "z": 0},
    {"id": 3, "x": 6, "y": 4, "z": 0},
    {"id": 4, "x": 0, "y": 4, "z": 0},
    # nivel 1 (aleros)
    {"id": 5, "x": 0, "y": 0, "z": 3},
    {"id": 6, "x": 6, "y": 0, "z": 3},
    {"id": 7, "x": 6, "y": 4, "z": 3},
    {"id": 8, "x": 0, "y": 4, "z": 3},
    # cumbrera
    {"id": 9, "x": 0, "y": 2, "z": 4.5},
    {"id": 10, "x": 6, "y": 2, "z": 4.5},
]

for n in NODES:
    n["mass_x"] = 2000.0
    n["mass_y"] = 2000.0
    n["mass_z"] = 0.0

# columnas 30x30, vigas 25x40
COL = dict(A=0.09, Iz=6.75e-4, Iy=6.75e-4, J=1.0e-3, E=E, G=G)
BEA = dict(A=0.10, Iz=1.33e-3, Iy=5.2e-4, J=8.0e-4, E=E, G=G)

ELEMENTS = []


def _add(eid, i, j, props, etype):
    ELEMENTS.append({"id": eid, "node_i": i, "node_j": j, "elementType": etype, **props})


_add(1, 1, 5, COL, "column")
_add(2, 2, 6, COL, "column")
_add(3, 3, 7, COL, "column")
_add(4, 4, 8, COL, "column")
_add(5, 5, 6, BEA, "beam")
_add(6, 6, 7, BEA, "beam")
_add(7, 7, 8, BEA, "beam")
_add(8, 8, 5, BEA, "beam")
# hastiales + cumbrera (pares de la armadura)
_add(9, 5, 9, BEA, "beam")
_add(10, 8, 9, BEA, "beam")
_add(11, 6, 10, BEA, "beam")
_add(12, 7, 10, BEA, "beam")
_add(13, 9, 10, BEA, "beam")

SUPPORTS = [{"node": i, "ux": 1, "uy": 1, "uz": 1, "rx": 1, "ry": 1, "rz": 1} for i in (1, 2, 3, 4)]

MATERIAL = {"E": E, "G": G, "poissonRatio": 0.2, "unitWeightNPerM3": 24000}

FALDON_A = [
    {"x": 0, "y": 0, "z": 3},
    {"x": 6, "y": 0, "z": 3},
    {"x": 6, "y": 2, "z": 4.5},
    {"x": 0, "y": 2, "z": 4.5},
]
FALDON_B = [
    {"x": 0, "y": 2, "z": 4.5},
    {"x": 6, "y": 2, "z": 4.5},
    {"x": 6, "y": 4, "z": 3},
    {"x": 0, "y": 4, "z": 3},
]
LOSA_PLANA = [
    {"x": 0, "y": 0, "z": 3},
    {"x": 6, "y": 0, "z": 3},
    {"x": 6, "y": 4, "z": 3},
    {"x": 0, "y": 4, "z": 3},
]


def base_payload(**extra):
    data = {
        "nodes": [dict(n) for n in NODES],
        "elements": [dict(e) for e in ELEMENTS],
        "supports": [dict(s) for s in SUPPORTS],
        "useRigidDiaphragms": True,
        "massSource": {"enabled": False},
    }
    data.update(extra)
    return data


def periods(data, num_modes=6):
    nodes, _ = build_model_3d(data)
    modal = run_modal_analysis(nodes, num_modes)
    return modal, data


def show(title, modal, data):
    ok = modal.get("success", True)
    info = modal.get("modal_info") or []
    per = [round(float(m.get("T", m.get("period", 0))), 5) for m in info][:4]
    rep = data.get("_slab_shell_report", {}) or {}
    dia = data.get("_rigid_diaphragm_report", {}) or {}
    applied = dia.get("applied") or []
    print(f"\n=== {title} ===")
    print(f"  ok={ok}  T = {per}")
    print(f"  slab_shells: malladas={len(rep.get('meshed', []))} "
          f"elementos={rep.get('element_count', 0)} nodos_nuevos={rep.get('new_node_count', 0)} "
          f"modo={rep.get('mode')}")
    for s in rep.get("skipped", []):
        print(f"     - saltada: {s}")
    for g in applied:
        print(f"  diafragma {g.get('id')}: {g.get('count')} nudos -> {g.get('node_ids')}")
    return per


slab_a = {"id": 1, "points": FALDON_A, "thickness": 0.10, "material": MATERIAL, "sloped": True, "meshAsShell": True}
slab_b = {"id": 2, "points": FALDON_B, "thickness": 0.10, "material": MATERIAL, "sloped": True, "meshAsShell": True}

# 1) SIN losas (referencia)
m0, d0 = periods(base_payload())
t0 = show("1. Sin losas (referencia)", m0, d0)

# 2) CON faldones inclinados como shell + nudos de cumbrera fuera del diafragma
m1, d1 = periods(base_payload(slabs=[slab_a, slab_b], noDiaphragmNodes=[9, 10]))
t1 = show("2. Techo a dos aguas como shell (semi-rigido)", m1, d1)

# 3) Losa PLANA con modo "sloped" (opcional) -> NO se malla
plana = {"id": 3, "points": LOSA_PLANA, "thickness": 0.20, "material": MATERIAL, "sloped": False}
m2, d2 = periods(base_payload(slabs=[plana], slabShellMode="sloped"))
t2 = show("3. Losa plana, modo 'sloped' (no debe mallarse)", m2, d2)

# 4) Misma losa plana con el DEFAULT actual ("all")
m3, d3 = periods(base_payload(slabs=[dict(plana)]))
t3 = show("4. Losa plana con el default 'all'", m3, d3)

# 5) Poligono de 6 vertices (subdivision centroide+medios)
HEXA = [
    {"x": 0, "y": 0, "z": 3},
    {"x": 3, "y": 0, "z": 3},
    {"x": 6, "y": 0, "z": 3},
    {"x": 6, "y": 2, "z": 4.5},
    {"x": 3, "y": 2, "z": 4.5},
    {"x": 0, "y": 2, "z": 4.5},
]
hexa = {"id": 4, "points": HEXA, "thickness": 0.10, "material": MATERIAL, "meshAsShell": True}
m4, d4 = periods(base_payload(slabs=[hexa], noDiaphragmNodes=[9, 10]))
t4 = show("5. Losa inclinada de 6 vertices (subdivision en cuads)", m4, d4)

# 6) Cumbrera SIN barras: la sostiene solo el shell (nudos 9 y 10 sin ningun
#    elemento frame). Antes esto era matriz singular garantizada.
solo_shell = base_payload(slabs=[slab_a, slab_b], noDiaphragmNodes=[9, 10])
solo_shell["elements"] = [e for e in solo_shell["elements"] if e["id"] <= 8]
try:
    m5, d5 = periods(solo_shell)
    t5 = show("6. Cumbrera sostenida SOLO por el shell (sin barras)", m5, d5)
except Exception as exc:
    t5 = []
    print(f"\n=== 6. Cumbrera solo shell ===\n  FALLO: {exc}")

# 7) El mecanismo de MODELINGTYPE sigue vivo. HOY Membrane y Shell usan el
#    MISMO modificador (1.0, ver _SLAB_MEMBRANE_BENDING_MODIFIER), asi que para
#    comprobar que la distincion funciona hay que bajarlo a proposito.
import seismic.inputs as _I  # noqa: E402

memb = [dict(s, modelingType="Membrane") for s in (slab_a, slab_b)]
shell = [dict(s, modelingType="Shell-Thin") for s in (slab_a, slab_b)]

_prev = _I._SLAB_MEMBRANE_BENDING_MODIFIER
_I._SLAB_MEMBRANE_BENDING_MODIFIER = 0.1
try:
    m6, d6 = periods(base_payload(slabs=memb, noDiaphragmNodes=[9, 10]))
    t6 = show("7a. MEMBRANE con el modificador forzado a 0.1", m6, d6)
finally:
    _I._SLAB_MEMBRANE_BENDING_MODIFIER = _prev

m7, d7 = periods(base_payload(slabs=shell, noDiaphragmNodes=[9, 10]))
t7 = show("7b. Mismo techo declarado SHELL (flexion 1.0)", m7, d7)

print("\n--- RESUMEN ---")
print(f"T1 sin losa            : {t0[0] if t0 else 'n/a'}")
print(f"T1 con techo shell     : {t1[0] if t1 else 'n/a'}")
if t0 and t1:
    print(f"  variacion            : {100 * (t1[0] - t0[0]) / t0[0]:+.2f}%  (debe BAJAR: la losa rigidiza)")
print(f"T1 losa plana 'sloped' : {t2[0] if t2 else 'n/a'}  (debe ser IGUAL a 'sin losa')")
print(f"T1 losa plana default  : {t3[0] if t3 else 'n/a'}")
print(f"T1 hexagono inclinado  : {t4[0] if t4 else 'n/a'}")
print(f"T1 MEMBRANE forzado 0.1: {t6[0] if t6 else 'n/a'}  (debe ser > que SHELL: menos flexion)")
print(f"T1 techo SHELL (1.0)   : {t7[0] if t7 else 'n/a'}")
