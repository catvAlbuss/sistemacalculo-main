"""
Mapea `frameId` del motor -> (Story, Label) de ETABS, por GEOMETRIA.

POR QUE EXISTE
  El payload no lleva las etiquetas de ETABS: `label` y `story` llegan en None.
  Comparar por "Unique Name" NO funciona: ese numero es de ETABS y no coincide
  con nuestro id. Por confiar en esa coincidencia una vez compare la viga
  equivocada (elemento 8 en y=11.90 contra B2, que era el 7 en y=15.98) y estuve
  a un paso de reportar un error que no existia.

  La unica identidad estable entre los dos modelos es la POSICION. Este modulo
  reconstruye del .e2k la coordenada de cada extremo de barra y la cruza contra
  los nodos del payload.

USO
    python tests/mapear_etiquetas_e2k.py <modelo.e2k> <payload.json>
"""
import json
import re
import sys
from collections import OrderedDict

TOL = 0.02   # m


def _leer_e2k(ruta):
    txt = open(ruta, encoding="utf-8", errors="replace").read()

    puntos = {}
    for m in re.finditer(r'POINT\s+"([^"]+)"\s+([-\d.eE+]+)\s+([-\d.eE+]+)', txt):
        puntos[m.group(1)] = (float(m.group(2)), float(m.group(3)))

    # Alturas de piso -> elevacion acumulada (el .e2k las lista de arriba abajo).
    pisos = [(m.group(1), float(m.group(2)))
             for m in re.finditer(r'STORY\s+"([^"]+)"\s+HEIGHT\s+([-\d.eE+]+)', txt)]
    elev, z = {}, 0.0
    for nombre, h in reversed(pisos):
        z += h
        elev[nombre] = z
    elev["Base"] = 0.0

    lineas = {}
    for m in re.finditer(r'LINE\s+"([^"]+)"\s+(\w+)\s+"([^"]+)"\s+"([^"]+)"(?:\s+(\d+))?', txt):
        lineas[m.group(1)] = (m.group(2).upper(), m.group(3), m.group(4))

    asigns = []
    for m in re.finditer(r'LINEASSIGN\s+"([^"]+)"\s+"([^"]+)"\s+SECTION\s+"([^"]+)"', txt):
        asigns.append((m.group(1), m.group(2), m.group(3)))

    return puntos, elev, lineas, asigns


def _extremos(tipo, pi, pj, story, puntos, elev):
    """Coordenadas 3D de los dos extremos, en el sistema del payload."""
    if pi not in puntos or pj not in puntos or story not in elev:
        return None
    (xi, yi), (xj, yj) = puntos[pi], puntos[pj]
    ztop = elev[story]
    if tipo == "COLUMN":
        pisos_ord = sorted(elev.items(), key=lambda kv: kv[1])
        debajo = [z for _, z in pisos_ord if z < ztop - 1e-6]
        zbot = max(debajo) if debajo else 0.0
        return (xi, yi, zbot), (xj, yj, ztop)
    return (xi, yi, ztop), (xj, yj, ztop)


def mapear(ruta_e2k, ruta_payload):
    puntos, elev, lineas, asigns = _leer_e2k(ruta_e2k)
    pl = json.load(open(ruta_payload, encoding="utf-8"))
    nodos = {n["id"]: (n["x"], n["y"], n["z"]) for n in pl.get("nodes") or []}

    def cerca(a, b):
        return all(abs(a[k] - b[k]) <= TOL for k in range(3))

    salida = OrderedDict()
    for el in pl.get("elements") or []:
        ni, nj = nodos.get(el["node_i"]), nodos.get(el["node_j"])
        if not ni or not nj:
            continue
        for linea, story, seccion in asigns:
            if linea not in lineas:
                continue
            tipo, pi, pj = lineas[linea]
            ext = _extremos(tipo, pi, pj, story, puntos, elev)
            if not ext:
                continue
            a, b = ext
            if (cerca(ni, a) and cerca(nj, b)) or (cerca(ni, b) and cerca(nj, a)):
                salida[el["id"]] = {"story": story, "label": linea,
                                    "tipo": tipo, "seccion": seccion}
                break
    return salida


if __name__ == "__main__":
    m = mapear(sys.argv[1], sys.argv[2])
    print(f"{len(m)} elementos identificados\n")
    print(f"{'frameId':>8}  {'Story':<10} {'Label':<8} {'Tipo':<8} Seccion")
    for eid, v in sorted(m.items()):
        print(f"{eid:>8}  {v['story']:<10} {v['label']:<8} {v['tipo']:<8} {v['seccion']}")
