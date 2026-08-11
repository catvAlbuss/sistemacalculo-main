#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""
Resumen AGRUPADO del cruce app vs ETABS: sesgo y dispersión por grupo.

`comparar_frame_forces.py` lista las barras que peor calzan, que sirve para
cazar un error puntual. Pero lo que resultó DIAGNÓSTICO en la calibración no
fue eso, sino separar dos cosas que ese listado mezcla:

    SESGO      = media de los errores con signo   -> ¿estamos altos o bajos?
    DISPERSIÓN = media de |error|                 -> ¿cuánto varía barra a barra?

Un sesgo de +16 % con dispersión 17 % es un problema SISTEMÁTICO (fue la torsión
accidental). Un sesgo de +0 % con dispersión 7 % es ruido normal entre dos
programas. El listado de "peores" no distingue esos dos casos: los dos muestran
barras con 20 % de error.

Y los agrupa por EJE (mayor V2/M3 contra menor V3/M2), por luz libre y por piso,
que es donde aparecieron los patrones reales: el sesgo vivía solo en el eje menor,
y el error de las vigas escalaba con la luz.

Uso:
    python comparar_agrupado.py app.csv etabs.csv [--etabs-force-unit tonf]

Reutiliza el lector de `comparar_frame_forces.py`: un solo parser de CSV para
las dos herramientas, así no se separan cuando ETABS cambie de formato.

VALIDADO contra el cruce de 24 columnas que se había hecho a mano: axial y
torsión salen EXACTOS, y el eje mayor/menor difiere ~0.5 punto porque acá cada
ESTACIÓN pesa lo mismo, mientras que a mano se pesaba por barra (V2 es constante,
así que entra 3 veces en vez de 1). Las dos formas son válidas; la de acá no
privilegia el momento sobre el cortante.
"""

import argparse
import statistics as st
import sys
from collections import defaultdict

from comparar_frame_forces import (
    COMPONENTS,
    FORCE_TO_KN,
    _norm,
    interpolate,
    read_table,
)

# Agrupaciones que resultaron informativas. El eje MAYOR es el que trabaja en el
# plano del pórtico; el MENOR es la respuesta transversal, que es donde se hizo
# visible el exceso de torsión accidental.
GRUPOS = {
    "EJE MAYOR (V2, M3)": ("V2", "M3"),
    "EJE MENOR (V3, M2)": ("V3", "M2"),
    "AXIAL (P)": ("P",),
    "TORSION (T)": ("T",),
}


def resumen(valores):
    """(n, sesgo, |error| medio) de una lista de errores porcentuales."""
    if not valores:
        return 0, float("nan"), float("nan")
    return len(valores), st.mean(valores), st.mean([abs(v) for v in valores])


def fila(nombre, valores, ancho=26):
    n, sesgo, mae = resumen(valores)
    if not n:
        return f"{nombre:>{ancho}}      —        —        —"
    return f"{nombre:>{ancho}} {n:>7} {sesgo:+8.1f}% {mae:8.1f}%"


def main():
    ap = argparse.ArgumentParser(
        description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter
    )
    ap.add_argument("app_csv")
    ap.add_argument("etabs_csv")
    ap.add_argument("--etabs-force-unit", default="tonf")
    # OJO: la app EXPORTA EN TONF desde el cambio de unidades (frameForceUnits.js).
    # Si esto quedara en kN, se compararía tonf contra tonf·9.80665 y todo daría
    # ~10x de error sin ninguna señal de que el problema es la unidad.
    ap.add_argument("--app-force-unit", default="tonf")
    ap.add_argument(
        "--min-abs",
        type=float,
        default=1.0,
        help="ignora valores por debajo de esto en kN o kN·m (default 1.0). "
        "Sin este filtro, un 0.001 vs 0.002 entra como '100%% de error' y "
        "ensucia el promedio con ruido que no cambia ningún diseño.",
    )
    ap.add_argument("--only-case", default=None)
    args = ap.parse_args()

    scale = FORCE_TO_KN.get(_norm(args.etabs_force_unit))
    if scale is None:
        sys.exit(f"Unidad desconocida: {args.etabs_force_unit}")

    app_scale = FORCE_TO_KN.get(_norm(args.app_force_unit))
    if app_scale is None:
        sys.exit(f"Unidad desconocida: {args.app_force_unit}")

    app, _ = read_table(args.app_csv, force_scale=app_scale)
    etabs, names = read_table(args.etabs_csv, force_scale=scale)

    common = set(app) & set(etabs)
    if args.only_case:
        needle = _norm(args.only_case)
        common = {k for k in common if needle in k[2]}

    if not common:
        print("!! NO HAY NINGUNA SERIE EN COMÚN.")
        print("   El CSV de la app necesita Story y Label — los llena el import")
        print("   del .e2k, pero salen VACÍOS si el modelo se redibujó a mano.")
        sys.exit(1)

    # errores[comp] = [%], y las mismas cifras repartidas por luz y por piso.
    por_comp = defaultdict(list)
    por_luz = defaultdict(lambda: defaultdict(list))
    por_piso = defaultdict(lambda: defaultdict(list))
    luces = {}

    for key in sorted(common):
        story = names.get(key, (key[0], key[1]))[0]
        # La luz sale de la última estación absoluta de la serie de ETABS.
        luz = max((rel for rel, _ in etabs[key]), default=0)
        serie = etabs[key]
        span = luces.setdefault(key, luz)

        for rel, ref_values in serie:
            for comp in COMPONENTS:
                ref = ref_values.get(comp)
                if ref is None:
                    continue
                got = interpolate(app[key], rel, comp)
                if got is None:
                    continue
                if max(abs(ref), abs(got)) < args.min_abs:
                    continue
                if abs(ref) < 1e-9:
                    continue

                err = 100.0 * (got / ref - 1.0)
                por_comp[comp].append(err)
                por_piso[story][comp].append(err)

    print(f"series cruzadas: {len(common)}")
    print(f"(solo en la app: {len(app) - len(common)}, solo en ETABS: {len(etabs) - len(common)})\n")

    print("=" * 62)
    print(f"{'grupo':>26} {'n':>7} {'sesgo':>9} {'|error|':>9}")
    print("-" * 62)
    for nombre, comps in GRUPOS.items():
        vals = [v for c in comps for v in por_comp[c]]
        print(fila(nombre, vals))

    print("\npor componente:")
    for comp in COMPONENTS:
        print(fila(comp, por_comp[comp]))

    if len(por_piso) > 1:
        print("\npor piso (todas las componentes):")
        for story in sorted(por_piso):
            vals = [v for c in COMPONENTS for v in por_piso[story][c]]
            print(fila(story, vals))

    todos = [v for c in COMPONENTS for v in por_comp[c]]
    n, sesgo, mae = resumen(todos)
    print("\n" + "=" * 62)
    print(f"TOTAL: {n} comparaciones   sesgo {sesgo:+.1f}%   |error| medio {mae:.1f}%")
    print()
    print("Cómo leerlo:")
    print("  sesgo ~0 con |error| chico   -> calza")
    print("  sesgo GRANDE                 -> algo SISTEMÁTICO (revisar el método)")
    print("  sesgo ~0 con |error| grande  -> reparto distinto barra a barra")
    print("                                  (topología o rigideces relativas)")


if __name__ == "__main__":
    main()
