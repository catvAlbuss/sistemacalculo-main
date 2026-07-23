"""
Prueba controlada para la CALIBRACIÓN DE TORSIÓN (base MZ) vs ETABS.

Idea: en vez de tocar el motor a ciegas, corremos el análisis con el payload
REAL de tu modelo (el que la app le manda al backend) de forma aislada, medimos
las características torsionales, y las comparamos con ETABS. Recién con esos
números se decide si la brecha del MZ viene de la INERCIA ROTACIONAL de la masa
o de la RIGIDEZ torsional — y si vale la pena tocar algo.

────────────────────────────────────────────────────────────────────────────
CÓMO CAPTURAR EL PAYLOAD REAL (una sola vez):
  El volcado está ACTIVO POR DEFECTO — solo hay que REINICIAR Flask para que
  tome el cambio (Python no recarga en caliente).
  1. Reiniciá Flask normalmente (CMD o PowerShell, da igual, sin variables):
       cd python-backend
       venv/Scripts/python.exe app.py
  2. En la app: corré el análisis sísmico del CASO que querés medir (SDX o SDY).
     En la consola de Flask verás "DUMP: payload sismico guardado en ...".
     Se guarda python-backend/_debug_payloads/last_seismic_payload.json
  3. Corré este script (en otra terminal, con el venv activo):
       python experimento_torsion.py
     (o pasale otra ruta:  python experimento_torsion.py mi_payload.json)
  (Para DESACTIVAR el volcado en el futuro: env var DUMP_SEISMIC_PAYLOAD=0)

Compará contra tu ETABS (del modelo analisis_sismico_exportado v1):
  - MZ base: SDX 303.09 tonf·m, SDY 353.58 tonf·m
  - Periodo torsional (modo 3): 0.759 s  (T1 0.907, T2 0.849)
  - Participación RMZ del modo torsional (Show Tables ▸ Modal Participating Mass).
  - Momento de inercia de masa del diafragma (MMI): ETABS lo reporta en la tabla
    de diafragmas / "Centers of Mass and Rigidity" ampliada.
────────────────────────────────────────────────────────────────────────────
"""

import json
import math
import os
import sys

import seismic_analysis as sa

# La consola de Windows (cp1252) revienta al imprimir emojis que usa el
# pipeline (🔁, ⚠️). Forzamos UTF-8 en la salida para que no crashee.
try:
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")
    sys.stderr.reconfigure(encoding="utf-8", errors="replace")
except Exception:
    pass

# 1 tonf-fuerza = 9806.65 N  →  N·m / 9806.65 = tonf·m.
N_M_TO_TONF_M = 9806.65


def _load_payload(path):
    if not os.path.isfile(path):
        print(f"❌ No encuentro el payload: {path}")
        print("   Capturalo primero (ver instrucciones arriba en el docstring).")
        sys.exit(1)
    with open(path, "r", encoding="utf-8") as fh:
        payload = json.load(fh)
    # El volcado guarda el payload TAL CUAL llega (espectros como [{T, Sa}]);
    # el endpoint de Flask los convierte a [(T, Sa)] antes de correr el motor.
    # Acá replicamos esa conversión para que run_full_seismic_analysis no falle.
    for key in ("spectrum_x", "spectrum_y", "spectrum"):
        spec = payload.get(key)
        if isinstance(spec, list) and spec and isinstance(spec[0], dict):
            payload[key] = [
                (
                    float(p.get("T", p.get("period", p.get("t", 0.0)))),
                    float(p.get("Sa", p.get("sa", p.get("value", 0.0)))),
                )
                for p in spec
            ]
    return payload


def _get_tables(result):
    # run_full_seismic_analysis puede exponer las tablas en result["tables"]
    # o dentro de result["etabs_results"]["tables"] según la versión.
    return (
        result.get("tables")
        or (result.get("etabs_results") or {}).get("tables")
        or {}
    )


def _srss(a, b):
    return math.sqrt((a or 0.0) ** 2 + (b or 0.0) ** 2)


def _print_modal(tables):
    print("\n── PERIODOS Y PARTICIPACIÓN MODAL ──────────────────────────────")
    periods = tables.get("modal_periods") or []
    partic = tables.get("participating_mass_ratios") or []
    by_mode = {int(p.get("mode", i + 1)): p for i, p in enumerate(partic)}
    print(f"{'Modo':>4} {'T (s)':>9} {'UX%':>7} {'UY%':>7} {'RZ% (torsión)':>14}")
    for i, row in enumerate(periods):
        mode = int(row.get("mode", i + 1))
        T = row.get("period_s", row.get("period", 0.0))
        pr = by_mode.get(mode, {})
        ux = pr.get("ux", pr.get("mass_participation_x", 0.0)) or 0.0
        uy = pr.get("uy", pr.get("mass_participation_y", 0.0)) or 0.0
        rz = pr.get("rz", pr.get("mass_participation_rz", 0.0)) or 0.0
        # Las participaciones pueden venir en fracción (0-1) o % (0-100).
        scale = 100.0 if max(ux, uy, rz) <= 1.5 else 1.0
        star = "  ← torsional" if (rz * scale) > 30 else ""
        print(f"{mode:>4} {float(T):>9.4f} {ux*scale:>7.2f} {uy*scale:>7.2f} {rz*scale:>14.2f}{star}")


def _print_base_moments(result):
    print("\n── MOMENTOS DE BASE (rama X e Y del payload; MZ = torsión) ──────")
    seis = result.get("seismic") or {}
    bx = seis.get("x") or {}
    by = seis.get("y") or {}
    for comp in ("mx", "my", "mz"):
        vx = float(bx.get(f"base_moment_{comp}", 0.0) or 0.0) / N_M_TO_TONF_M  # N·m → tonf·m
        vy = float(by.get(f"base_moment_{comp}", 0.0) or 0.0) / N_M_TO_TONF_M
        comb = _srss(vx, vy)
        print(f"  {comp.upper():>3}: ramaX={vx:>10.3f}  ramaY={vy:>10.3f}  SRSS={comb:>10.3f} tonf·m")
    print("  (El caso del payload capturado define cuál rama es 100% y cuál 30%.)")
    print("  ETABS ref: SDX MZ=303.09 / SDY MZ=353.58 tonf·m")


def _print_diaphragm_polar_inertia(payload, result):
    """Momento de inercia de masa del diafragma (MMI) por piso, tal como lo
    've' el motor: Σ m_i · r_i² con la masa concentrada en los nudos y r_i la
    distancia al CM del piso. Es el número clave para comparar con ETABS: si la
    app lo SOBRE/SUB-estima, la respuesta torsional se corre."""
    print("\n── INERCIA POLAR DE MASA DEL DIAFRAGMA (MMI) POR PISO ───────────")
    # Coords por nudo desde el payload.
    coords = {}
    for n in payload.get("nodes", []) or []:
        try:
            coords[int(n["id"])] = (
                float(n.get("x", 0.0)), float(n.get("y", 0.0)), float(n.get("z", 0.0))
            )
        except Exception:
            pass

    # Masa efectiva por nudo desde el resultado (kg).
    eff = (result.get("effective_mass") or {}).get("rows", []) or []
    if not eff:
        print("  (El resultado no trae 'effective_mass'; no se puede computar la MMI.)")
        return

    # Agrupar por piso (Z).
    by_z = {}
    for r in eff:
        nid = int(r.get("node", 0))
        c = coords.get(nid)
        if not c:
            continue
        m = float(r.get("effective_mx", 0.0) or 0.0)  # kg (mx≈my en RSA horizontal)
        if m <= 0:
            continue
        z = round(c[2], 3)
        by_z.setdefault(z, []).append((c[0], c[1], m))

    # Masa en kg (misma unidad que la tabla Centers of Mass, que ya calza
    # ETABS a 4 decimales) y MMI en kg·m² (momento de inercia de masa, SI).
    print(f"{'Z (m)':>7} {'Masa (kg)':>13} {'XCM':>8} {'YCM':>8} {'MMI (kg·m²)':>15}")
    for z in sorted(by_z.keys()):
        pts = by_z[z]
        M = sum(p[2] for p in pts)
        if M <= 0:
            continue
        xcm = sum(p[0] * p[2] for p in pts) / M
        ycm = sum(p[1] * p[2] for p in pts) / M
        mmi = sum(p[2] * ((p[0] - xcm) ** 2 + (p[1] - ycm) ** 2) for p in pts)
        print(f"{z:>7.2f} {M:>13.1f} {xcm:>8.4f} {ycm:>8.4f} {mmi:>15.1f}")
    print("  NOTA: con la masa concentrada en las 4 esquinas de cada panel, la")
    print("  MMI ≈ Σ M·(a²+b²)/4 por panel; ETABS (masa distribuida) da /12. Si")
    print("  esta MMI es mayor que la de ETABS → la app sobre-estima la inercia")
    print("  torsional (mode torsional más lento). Compará con la MMI de ETABS.")


def main():
    default_path = os.path.join(
        os.path.dirname(os.path.abspath(__file__)),
        "_debug_payloads", "last_seismic_payload.json",
    )
    path = sys.argv[1] if len(sys.argv) > 1 else default_path
    payload = _load_payload(path)

    print("=" * 66)
    print("EXPERIMENTO DE TORSIÓN — análisis aislado del payload real")
    print(f"payload: {path}")
    print(f"nodos: {len(payload.get('nodes', []))}  elementos: {len(payload.get('elements', []))}")
    print("=" * 66)

    result = sa.run_full_seismic_analysis(payload)
    if not result or result.get("success") is False:
        print("❌ El análisis falló:", (result or {}).get("error"))
        sys.exit(1)

    tables = _get_tables(result)
    _print_modal(tables)
    _print_base_moments(result)
    _print_diaphragm_polar_inertia(payload, result)

    print("\n" + "=" * 66)
    print("QUÉ MIRAR:")
    print("  • Si el PERIODO torsional calza ETABS (0.759) pero MZ sale bajo →")
    print("    la brecha es de combinación/formula, no de inercia.")
    print("  • Si el periodo torsional NO calza y la MMI difiere de ETABS →")
    print("    es INERCIA ROTACIONAL (candidato a refinar el reparto de masa).")
    print("  • Si la MMI calza pero el periodo torsional no → es RIGIDEZ")
    print("    torsional (centerline vs offsets / distribución de columnas).")
    print("=" * 66)


if __name__ == "__main__":
    main()
