"""
Compara el modelo CON y SIN `steelRoofMassOnly` sobre el ULTIMO payload volcado.

    venv\\Scripts\\python.exe comparar_steel_roof.py

Requiere DUMP_SEISMIC_PAYLOAD=1 en app.py y haber corrido el analisis sismico
del modelo que se quiere mirar (el volcado se PISA en cada corrida, asi que hay
que correr el modelo justo antes).

Que es `steelRoofMassOnly` (default True, ver _lump_steel_roof_mass_to_supports
en seismic/inputs.py): mueve la masa de los nudos EXCLUSIVOS del acero a los
nudos de INTERFAZ (cabeza de columna/muro). Mata los modos locales del techo
metalico, pero le saca la masa al piso superior.

  - MODULO 5: se activo a proposito para eliminar un modo local de 0.358 s con
    6% de masa que el usuario considero no fisico.
  - MODULO 6: ese mismo flag deja Story2 en 0 (ETABS: 0.1221 tonf-s2/m) y
    reduce el modelo a 3 modos. Con False la masa clava (+0.5% / -1.3%) y
    aparece el modo local del techo con la MISMA participacion que ETABS
    (4.7% vs 4.9%).

O sea: es una DECISION DE MODELADO, no un fix. Este script sirve para tomarla
con numeros de cada modelo.
"""
import json
import sys
from pathlib import Path

BACKEND = Path(__file__).resolve().parent
sys.path.insert(0, str(BACKEND))

from seismic.inputs import build_model_3d  # noqa: E402
from seismic.solver import run_modal_analysis  # noqa: E402

PAYLOAD = BACKEND / "_debug_payloads" / "last_seismic_payload.json"
if not PAYLOAD.exists():
    sys.exit(f"No existe {PAYLOAD}. Activa DUMP_SEISMIC_PAYLOAD=1 y corre el analisis.")

raw = json.load(open(PAYLOAD, encoding="utf-8"))
print(f"payload: {len(raw.get('nodes', []))} nudos, {len(raw.get('elements', []))} elementos, "
      f"{len(raw.get('walls') or [])} muros, {len(raw.get('slabs') or [])} losas")
print("pisos:", [(s["name"], s["elevation"], len(s["nodeIds"])) for s in raw.get("stories", [])])

G = 9810.0  # kg -> tonf-s2/m


def run(tag, flag):
    data = json.loads(json.dumps(raw))
    data["steelRoofMassOnly"] = flag
    nodes, _ = build_model_3d(data)
    modal = run_modal_analysis(nodes, 15)
    info = modal.get("modal_info") or []

    rows = (data.get("_effective_mass_report") or {}).get("rows") or []
    mass_by_node = {int(r["node"]): r["effective_mx"] for r in rows}
    por_piso = {
        s["name"]: sum(mass_by_node.get(i, 0.0) for i in s["nodeIds"]) / G
        for s in data.get("stories", [])
    }
    steel = (data.get("_mass_source_report") or {}).get("steel_roof_mass_only")

    print(f"\n=== {tag}  ({len(info)} modos) ===")
    print("   modo |   T (s)  |   UX   |   UY   |   RZ")
    for x in info[:10]:
        print(f"   {x['mode']:>4} | {x['period']:>8.4f} | {x['mass_participation_x']/100:>6.3f} | "
              f"{x['mass_participation_y']/100:>6.3f} | {x['mass_participation_rz']/100:>6.3f}")
    print("   masa por piso (tonf-s2/m):", {k: round(v, 4) for k, v in por_piso.items()})
    print("   reubicacion de masa de acero:", steel)


run("CON steelRoofMassOnly (opt-in)", True)
run("SIN steelRoofMassOnly (DEFAULT actual, fiel a ETABS)", False)

print("\nRecordatorio de unidades: ETABS reporta la masa por piso en kgf-s2/m;")
print("dividi por 1000 para comparar con los tonf-s2/m de arriba.")
