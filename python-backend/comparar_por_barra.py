#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""
Ranking barra por barra: ratio app/ETABS del PICO de cada componente.

    python comparar_por_barra.py app.csv etabs.csv

POR QUÉ NO ALCANZA `comparar_agrupado.py`
  Ese compara ESTACIÓN por estación, interpolando la app en las estaciones de
  ETABS sobre la estación RELATIVA. Eso es correcto mientras las dos barras
  sean UN elemento. Pero cuando ETABS parte la viga (MESHATINTERSECTIONS), su
  diagrama tiene saltos en los nudos interiores y la estación relativa deja de
  significar lo mismo: la app interpola suave donde ETABS escalona, y aparecen
  errores de +1000 % que NO son error del motor sino de la comparación.

  Medido en MODULO 1: agrupado por estación daba sesgo +225 %; el mismo cruce
  por pico de barra da mediana 0.96 en Story1. El primero era ruido de método.

  Por eso acá se compara UN número por barra y componente: el máximo absoluto
  a lo largo de la barra, que es además lo que gobierna el diseño.

QUÉ MIRAR
  - `nEl` es en cuántos elementos partió ETABS la barra. Sirve para ver si el
    error correlaciona con el partido (en MODULO 1 NO correlaciona: B12–B15 con
    10 elementos calzan a 0.92–1.04).
  - El resumen por piso es el que destapó que el problema de MODULO 1 vive en
    Story3 (techo inclinado), no en el partido de vigas.

Ratio = app / ETABS. 1.00 calza; <1 vamos bajos; >1 vamos altos.
"""

import argparse
import statistics as st
import sys
from collections import defaultdict

from comparar_frame_forces import COMPONENTS, FORCE_TO_KN, _norm, read_table

# Columna "Element" de ETABS: "98-1", "98-2" = viga partida; "131" = un elemento.
# read_table no la trae, así que el conteo se hace acá releyendo el CSV crudo.


def contar_elementos(path):
    """{(story, label) normalizados: nº de sub-elementos que reporta ETABS}"""
    import csv

    with open(path, newline="", encoding="utf-8-sig") as fh:
        text = fh.read()
    head = text.splitlines()[:5] or [""]
    delim = max([",", ";", "\t"], key=lambda d: max(line.count(d) for line in head))
    rows = list(csv.reader(text.splitlines(), delimiter=delim))

    hdr = None
    for i, row in enumerate(rows[:20]):
        low = [_norm(c) for c in row]
        if "element" in low and any(c.startswith("station") for c in low):
            hdr, idx = i, {c: j for j, c in enumerate(low)}
            break
    if hdr is None:
        return {}

    lab = next((idx[k] for k in ("beam", "column", "label", "brace") if k in idx), None)
    sto = next((idx[k] for k in ("story", "level") if k in idx), None)
    if lab is None:
        return {}

    out = defaultdict(set)
    for row in rows[hdr + 1:]:
        if len(row) <= max(lab, idx["element"]):
            continue
        story = _norm(row[sto]) if sto is not None else ""
        out[(story, _norm(row[lab]))].add(row[idx["element"]].strip())
    return {k: len(v) for k, v in out.items()}


def pico(serie, comp):
    vals = [abs(v[comp]) for _, v in serie if comp in v]
    return max(vals) if vals else None


def resumen(ratios):
    return (len(ratios), st.median(ratios), min(ratios), max(ratios),
            sum(1 for r in ratios if r < 0.35))


def main():
    ap = argparse.ArgumentParser(
        description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter
    )
    ap.add_argument("app_csv")
    ap.add_argument("etabs_csv")
    ap.add_argument("--etabs-force-unit", default="tonf")
    ap.add_argument("--app-force-unit", default="tonf")
    ap.add_argument("--comp", default="M3", choices=COMPONENTS,
                    help="componente que ordena el ranking (default M3)")
    ap.add_argument("--min-abs", type=float, default=0.2,
                    help="ignora barras cuyo pico en ETABS sea menor a esto, en "
                         "kN o kN·m (default 0.2). Sin filtro, un 0.0001 vs "
                         "0.0002 entra como 100 %% de error.")
    args = ap.parse_args()

    escalas = []
    for etiqueta, unidad in (("etabs", args.etabs_force_unit), ("app", args.app_force_unit)):
        s = FORCE_TO_KN.get(_norm(unidad))
        if s is None:
            sys.exit(f"Unidad desconocida para {etiqueta}: {unidad}")
        escalas.append(s)
    escala_etabs, escala_app = escalas

    app, _ = read_table(args.app_csv, force_scale=escala_app)
    etabs, nombres = read_table(args.etabs_csv, force_scale=escala_etabs)
    n_elem = contar_elementos(args.etabs_csv)

    # Una barra puede tener varios casos; se agrupa por (story, label) ignorando
    # el caso sólo si hay uno. Si hay varios, cada caso es su propia fila.
    filas = []
    for key in sorted(set(app) & set(etabs)):
        story, label, caso = key
        ref = pico(etabs[key], args.comp)
        got = pico(app[key], args.comp)
        if ref is None or got is None or abs(ref) < args.min_abs:
            continue
        otros = {}
        for c in COMPONENTS:
            r, g = pico(etabs[key], c), pico(app[key], c)
            otros[c] = (g / r) if (r and abs(r) >= args.min_abs) else None
        filas.append((got / ref, key, nombres.get(key, (story, label)),
                      n_elem.get((story, label), 1), ref, got, caso, otros))

    if not filas:
        sys.exit("No hay barras en común (¿el CSV de la app trae Story y Label?)")

    filas.sort()
    print(f"caso(s): {sorted({f[6] for f in filas})}    barras: {len(filas)}\n")
    otras = [c for c in COMPONENTS if c != args.comp]
    print(f"{'ratio ' + args.comp:>9} {'nEl':>4} {args.comp + ' etabs':>10} "
          f"{args.comp + ' app':>9}  " + "".join(f"{c:>7}" for c in otras) + "  barra")
    print("-" * (34 + 7 * len(otras) + 20))
    for ratio, _key, (story, label), nel, ref, got, _caso, otros in filas:
        cols = "".join(
            f"{otros[c]:>7.2f}" if otros[c] is not None else f"{'—':>7}" for c in otras
        )
        print(f"{ratio:>9.2f} {nel:>4} {ref:>10.3f} {got:>9.3f}  {cols}  {story}/{label}")

    print(f"\n{'grupo':<24}{'n':>4}  {'mediana':>8} {'min':>7} {'max':>7} {'<0.35':>6}")
    print("-" * 60)
    grupos = defaultdict(list)
    for ratio, _k, (story, _l), nel, *_ in filas:
        grupos[story].append(ratio)
        grupos[f"{story}  {'partida' if nel > 1 else 'entera '}"].append(ratio)
    grupos["TODAS"] = [f[0] for f in filas]
    for nombre in sorted(grupos, key=lambda s: (s == "TODAS", s)):
        n, med, lo, hi, bajas = resumen(grupos[nombre])
        print(f"{nombre:<24}{n:>4}  {med:>8.2f} {lo:>7.2f} {hi:>7.2f} {bajas:>6}")

    print("\n'partida' = ETABS la mallo en varios elementos (MESHATINTERSECTIONS).")
    print("Si 'entera' y 'partida' dan medianas parecidas, el partido NO es la causa.")


if __name__ == "__main__":
    main()
