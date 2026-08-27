"""
Compara las fuerzas internas por barra de la app contra las de ETABS.

    venv\\Scripts\\python.exe comparar_frame_forces.py app.csv etabs.csv

  app.csv    "Export CSV" del panel Mostrar ▸ Tablas de fuerzas de barra.
             Columnas: Frame, Story, Label, Case/Combo, Station,
                       Relative Station, P, V2, V3, T, M2, M3
             Story/Label salen del .e2k importado; sin ellas no hay con qué
             cruzar (el id de la app es un correlativo, no el nombre de ETABS).

  etabs.csv  Tabla "Element Forces - Frames" exportada de ETABS a CSV.
             Columnas mínimas: Story, Label (o Beam/Column), Output Case,
                               Station, P, V2, V3, T, M2, M3

CÓMO CRUZA
  Por (Story, Label, Caso). Las ESTACIONES casi nunca coinciden —la app usa 11
  uniformes y ETABS las suyas— así que la app se interpola linealmente en las
  estaciones de ETABS, sobre la estación RELATIVA. Con 11 estaciones el error
  de interpolar una parábola es < 0.3 % del valor de vano; es ruido frente a
  las diferencias que se están buscando.

SIGNOS
  Se reporta el sesgo de signo por componente: si la correlación entre app y
  ETABS es fuertemente NEGATIVA, el criterio está invertido y se avisa. Sirve
  para cerrar el signo de V2/V3/M2/M3, que todavía no está confirmado contra
  ETABS (P y T ya se corrigieron el 2026-08-05).

OJO — LA BRECHA CONOCIDA
  Las cargas de losa todavía van 1/4 a cada esquina del panel en vez de
  repartirse a las vigas. Las vigas que reciben carga de losa NO van a calzar
  en gravedad, y no es un error del motor sino ese camino de carga sin cerrar.
  Comparables hoy: axial de columnas, todo lo sísmico, y las vigas con carga
  distribuida asignada a mano.
"""
import argparse
import csv
import math
import sys
from collections import defaultdict

# La consola de Windows viene en cp1252 y revienta con acentos o flechas.
if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")

COMPONENTS = ["P", "V2", "V3", "T", "M2", "M3"]

# ETABS nombra la columna del elemento de varias formas según la versión y si
# la tabla es de vigas o de columnas.
LABEL_KEYS = ["label", "beam", "column", "brace", "frame", "uniquename", "unique name"]
CASE_KEYS = ["output case", "outputcase", "case/combo", "case", "combo", "load case"]
STORY_KEYS = ["story", "story name", "level"]

# Factores a kN / kN·m (la app siempre exporta en kN).
FORCE_TO_KN = {"kn": 1.0, "tonf": 9.80665, "tf": 9.80665, "ton": 9.80665,
               "kgf": 0.00980665, "kg": 0.00980665, "n": 0.001, "lb": 0.00444822,
               "kip": 4.44822}


def _norm(text):
    return str(text or "").strip().lower()


def _pick(header, candidates):
    """Índice de la primera columna cuyo nombre normalizado esté en candidates."""
    lowered = [_norm(h) for h in header]
    for cand in candidates:
        if cand in lowered:
            return lowered.index(cand)
    return None


def _to_float(value):
    try:
        return float(str(value).replace(",", "").strip())
    except Exception:
        return None


def read_table(path, force_scale=1.0):
    """
    Lee un CSV de fuerzas de barra, tolerante al formato de ETABS (que suele
    meter una línea "TABLE: ..." y una fila de unidades antes de los datos).

    Devuelve (series, nombres):
      series  {(story, label, case): [(rel_station, {comp: valor}), ...]}
              con las claves NORMALIZADAS (minúsculas) para poder cruzar.
      nombres {clave normalizada: (story, label) tal como venían en el CSV},
              para que el reporte muestre el nombre como se ve en ETABS.
    """
    # ETABS en locale español exporta con PUNTO Y COMA. Si se lee con coma, cada
    # línea entra como un solo campo y la detección de cabecera falla sin decir
    # por qué. Se elige el separador que más columnas produce en la cabecera.
    with open(path, newline="", encoding="utf-8-sig") as fh:
        text = fh.read()

    head = text.splitlines()[:5] or [""]
    delim = max([",", ";", "\t"], key=lambda d: max(line.count(d) for line in head))
    rows = list(csv.reader(text.splitlines(), delimiter=delim))

    if not rows:
        sys.exit(f"{path}: vacío")

    # La cabecera es la primera fila que tenga 'station' y al menos un componente.
    header_idx = None
    for i, row in enumerate(rows[:20]):
        lowered = [_norm(c) for c in row]
        if any("station" == c or c.startswith("station") for c in lowered) and "p" in lowered:
            header_idx = i
            break

    if header_idx is None:
        sys.exit(f"{path}: no encontré la fila de cabecera (con 'Station' y 'P')")

    header = rows[header_idx]
    body = rows[header_idx + 1:]

    i_story = _pick(header, STORY_KEYS)
    i_label = _pick(header, LABEL_KEYS)
    i_case = _pick(header, CASE_KEYS)
    i_station = _pick(header, ["station", "relative station", "stationloc"])
    i_rel = _pick(header, ["relative station"])
    comp_idx = {c: _pick(header, [c.lower()]) for c in COMPONENTS}

    faltan = [k for k, v in
              {"Label": i_label, "Caso": i_case, "Station": i_station}.items() if v is None]
    if faltan:
        sys.exit(f"{path}: faltan columnas {faltan}. Cabecera leída: {header}")

    # ETABS a veces pone una fila de unidades justo debajo de la cabecera.
    if body and _to_float(body[0][i_station] if i_station < len(body[0]) else "") is None:
        body = body[1:]

    by_key = defaultdict(list)
    max_station = defaultdict(float)
    names = {}

    for row in body:
        if not row or len(row) <= max(filter(None, [i_label, i_case, i_station])):
            continue

        station = _to_float(row[i_station])
        if station is None:
            continue

        story_raw = (
            str(row[i_story]).strip()
            if i_story is not None and i_story < len(row)
            else ""
        )
        label_raw = str(row[i_label]).strip()

        key = (_norm(story_raw), _norm(label_raw), _norm(row[i_case]))
        names.setdefault(key, (story_raw, label_raw))

        values = {}
        for comp, idx in comp_idx.items():
            if idx is not None and idx < len(row):
                v = _to_float(row[idx])
                if v is not None:
                    values[comp] = v * force_scale

        rel = None
        if i_rel is not None and i_rel < len(row):
            rel = _to_float(row[i_rel])

        by_key[key].append([station, rel, values])
        max_station[key] = max(max_station[key], station)

    # Estación relativa: si no vino, se deduce del largo de la barra.
    out = {}
    for key, entries in by_key.items():
        length = max_station[key] or 1.0
        pts = []
        for station, rel, values in entries:
            r = rel if rel is not None else station / length
            pts.append((min(max(r, 0.0), 1.0), values))
        pts.sort(key=lambda p: p[0])
        out[key] = pts

    return out, names


def interpolate(points, rel, comp):
    """Valor de `comp` en la estación relativa `rel`, interpolando linealmente."""
    usable = [(r, v[comp]) for r, v in points if comp in v]
    if not usable:
        return None
    if rel <= usable[0][0]:
        return usable[0][1]
    if rel >= usable[-1][0]:
        return usable[-1][1]

    for i in range(len(usable) - 1):
        r0, v0 = usable[i]
        r1, v1 = usable[i + 1]
        if r0 <= rel <= r1:
            if r1 - r0 < 1e-12:
                return v0
            t = (rel - r0) / (r1 - r0)
            return v0 + t * (v1 - v0)

    return usable[-1][1]


def main():
    ap = argparse.ArgumentParser(description=__doc__,
                                 formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("app_csv")
    ap.add_argument("etabs_csv")
    ap.add_argument("--etabs-force-unit", default="tonf",
                    help="unidad de fuerza del CSV de ETABS (default tonf). "
                         f"Opciones: {', '.join(sorted(FORCE_TO_KN))}")
    ap.add_argument("--top", type=int, default=15,
                    help="cuántas barras peores listar por componente (default 15)")
    ap.add_argument("--min-abs", type=float, default=1.0,
                    help="ignora valores por debajo de esto en kN o kN·m (default 1.0); "
                         "evita que un 0.001 vs 0.002 salga como '100%% de error'")
    ap.add_argument("--only-case", default=None,
                    help="comparar solo este caso/combo (subcadena, insensible a mayúsculas)")
    args = ap.parse_args()

    scale = FORCE_TO_KN.get(_norm(args.etabs_force_unit))
    if scale is None:
        sys.exit(f"Unidad desconocida: {args.etabs_force_unit}")

    app, _ = read_table(args.app_csv)
    etabs, names = read_table(args.etabs_csv, force_scale=scale)

    print(f"app   : {len(app)} series (barra x caso)")
    print(f"etabs : {len(etabs)} series (barra x caso), fuerza en {args.etabs_force_unit} -> kN\n")

    # ── Cruce ────────────────────────────────────────────────────────────────
    common = set(app) & set(etabs)

    if args.only_case:
        needle = _norm(args.only_case)
        common = {k for k in common if needle in k[2]}

    if not common:
        print("!! NO HAY NINGUNA SERIE EN COMÚN.")
        print("   Revisá que el CSV de la app traiga Story y Label (los llena el")
        print("   import del .e2k) y que los nombres de caso coincidan.")
        print(f"   ejemplo app  : {sorted(app)[:3]}")
        print(f"   ejemplo etabs: {sorted(etabs)[:3]}")
        sys.exit(1)

    solo_app = len(app) - len(common)
    solo_etabs = len(etabs) - len(common)
    print(f"cruzadas: {len(common)}   (solo en la app: {solo_app}, solo en ETABS: {solo_etabs})\n")

    # ── Diferencias, estación por estación ───────────────────────────────────
    stats = {c: {"n": 0, "sum_ae": 0.0, "peor": [], "dot": 0.0,
                 "na": 0.0, "nb": 0.0} for c in COMPONENTS}

    for key in sorted(common):
        # Nombres como se ven en ETABS (la clave va normalizada para cruzar).
        story, label = names.get(key, (key[0], key[1]))
        case = key[2]
        for rel, ref_values in etabs[key]:
            for comp in COMPONENTS:
                ref = ref_values.get(comp)
                if ref is None:
                    continue
                got = interpolate(app[key], rel, comp)
                if got is None:
                    continue

                s = stats[comp]
                s["dot"] += got * ref
                s["na"] += got * got
                s["nb"] += ref * ref

                if max(abs(ref), abs(got)) < args.min_abs:
                    continue

                diff = got - ref
                rel_err = abs(diff) / max(abs(ref), args.min_abs) * 100.0

                s["n"] += 1
                s["sum_ae"] += rel_err
                s["peor"].append((rel_err, story, label, case, rel, got, ref))

    # ── Reporte ──────────────────────────────────────────────────────────────
    print("=" * 78)
    print("RESUMEN POR COMPONENTE")
    print("=" * 78)
    print(f"{'comp':<5} {'puntos':>7} {'error medio':>12} {'signo':>28}")

    sign_flip = []
    for comp in COMPONENTS:
        s = stats[comp]
        if not s["n"]:
            print(f"{comp:<5} {'—':>7} {'(sin datos sobre el umbral)':>24}")
            continue

        # Coseno entre las dos series: ~+1 mismo criterio, ~−1 invertido.
        denom = math.sqrt(s["na"] * s["nb"])
        cos = (s["dot"] / denom) if denom > 1e-12 else 0.0

        if cos < -0.5:
            veredicto = f"INVERTIDO (cos {cos:+.2f})"
            sign_flip.append(comp)
        elif cos > 0.5:
            veredicto = f"coincide (cos {cos:+.2f})"
        else:
            veredicto = f"sin correlación (cos {cos:+.2f})"

        print(f"{comp:<5} {s['n']:>7} {s['sum_ae'] / s['n']:>11.1f}% {veredicto:>28}")

    if sign_flip:
        print(f"\n  >> Criterio de signo INVERTIDO en: {', '.join(sign_flip)}")
        print("     Se corrige en _FF_SIGN_TO_ETABS (python-backend/seismic/solver.py),")
        print("     que ya está preparado con un factor por componente.")

    # ── Peores barras ────────────────────────────────────────────────────────
    for comp in COMPONENTS:
        peor = sorted(stats[comp]["peor"], reverse=True)[:args.top]
        if not peor:
            continue

        print(f"\n{'-' * 78}\nPEORES {comp}\n{'-' * 78}")
        print(f"{'story':<12} {'label':<12} {'caso':<22} {'x/L':>5} "
              f"{'app':>10} {'etabs':>10} {'error':>8}")
        for rel_err, story, label, case, rel, got, ref in peor:
            print(f"{story[:12]:<12} {label[:12]:<12} {case[:22]:<22} {rel:>5.2f} "
                  f"{got:>10.2f} {ref:>10.2f} {rel_err:>7.1f}%")

    print(f"\n{'=' * 78}")
    print("RECORDATORIO: las cargas de losa todavía van 1/4 a cada esquina del panel")
    print("en vez de repartirse a las vigas. Las vigas que reciben carga de losa NO")
    print("van a calzar en gravedad — eso es camino de carga sin cerrar, no un error")
    print("del motor. Mirá primero el axial de columnas y los casos sísmicos.")


if __name__ == "__main__":
    main()
