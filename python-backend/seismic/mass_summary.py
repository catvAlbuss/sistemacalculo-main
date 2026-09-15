"""
seismic.mass_summary — masa por piso, leida del MODELO, no de las cargas.

POR QUE NO ALCANZA CON LA TABLA QUE YA HABIA
    La "Mass Summary by Story" del frontend se armaba a partir de la tabla de
    cortantes por piso, que por definicion solo tiene pisos CON cortante. La
    Base nunca aparecia — y ETABS si la reporta (MODULO 01: 1.0889 tonf-s2/m).
    Sin esa fila no se puede cruzar la tabla completa: los totales no cierran y
    no se ve donde esta la diferencia.

    Peor: esa tabla salia de sumar las CARGAS, y el motor no aplica como masa
    todas las cargas que recibe (el peso propio de barras y muros se excluye
    para no duplicarlo con el que calcula el propio motor). O sea que la tabla
    podia no coincidir con la masa que el analisis usa de verdad.

QUE HACE ESTA
    Lee `ops.nodeMass` del dominio YA CONSTRUIDO y agrupa por piso. Es la masa
    real que ve el eigen-solve, no una reconstruccion.

LA COLUMNA QUE ETABS NO TIENE
    Ademas separa cuanta de esa masa esta en nudos RESTRINGIDOS. Esa masa no
    participa en NINGUN modo — esta agarrada al suelo. En la Base es normal que
    sea toda; en cualquier otro piso, masa restringida es masa que el analisis
    no ve, y conviene que salte a la vista en vez de quedar escondida en un
    total que cierra.
"""

try:
    import openseespy.opensees as ops
except ImportError:
    ops = None

# Un nudo pertenece al piso cuya elevacion tenga mas cerca, si cae dentro de
# esta tolerancia. Es holgada a proposito: las cotas de piso vienen del
# frontend redondeadas y un nudo puede quedar a milimetros.
TOL_PISO = 0.05

# Por debajo de esto la masa es el placeholder que el mallado pone para que el
# eigen-solve no quede singular (1e-9 kg), no masa real.
MIN_MASA_KG = 1e-6


def _pisos(data: dict):
    """[(nombre, z)] ordenados de arriba a abajo, como los lista ETABS."""
    salida = []
    for s in data.get("stories", []) or []:
        z = s.get("elevation", s.get("z"))
        if z is None:
            continue
        salida.append((str(s.get("name") or f"z={z}"), float(z)))
    return sorted(salida, key=lambda t: -t[1])


def _piso_de(z: float, pisos):
    mejor, dmin = None, None
    for nombre, ze in pisos:
        d = abs(z - ze)
        if dmin is None or d < dmin:
            mejor, dmin = nombre, d
    return mejor if (dmin is not None and dmin <= TOL_PISO) else None


def masa_por_piso(data: dict) -> list:
    """
    Masa aplicada por piso, del dominio en pie. Hay que llamarla DESPUES de
    `build_model_3d` y antes de `ops.wipe()`.

    Devuelve, de arriba a abajo:
        {story, z, ux_kg, uy_kg, uz_kg, restrained_kg, nodes}

    `restrained_kg` es la parte que cuelga de nudos restringidos y por lo tanto
    NO participa en los modos.
    """
    if ops is None:
        return []

    pisos = _pisos(data)
    if not pisos:
        return []

    apoyos = set()
    for s in data.get("supports", []) or []:
        try:
            apoyos.add(int(s["node"]))
        except Exception:
            continue

    acum = {nombre: {"story": nombre, "z": z, "ux_kg": 0.0, "uy_kg": 0.0,
                     "uz_kg": 0.0, "restrained_kg": 0.0, "nodes": 0}
            for nombre, z in pisos}

    try:
        tags = ops.getNodeTags()
    except Exception:
        return []

    for tag in tags:
        tag = int(tag)
        try:
            m = ops.nodeMass(tag)
            c = ops.nodeCoord(tag)
        except Exception:
            continue
        mx = float(m[0]) if m and len(m) > 0 else 0.0
        my = float(m[1]) if m and len(m) > 1 else 0.0
        mz = float(m[2]) if m and len(m) > 2 else 0.0
        if max(mx, my, mz) <= MIN_MASA_KG:
            continue
        nombre = _piso_de(float(c[2]), pisos)
        if nombre is None:
            continue
        fila = acum[nombre]
        fila["ux_kg"] += mx
        fila["uy_kg"] += my
        fila["uz_kg"] += mz
        fila["nodes"] += 1
        if tag in apoyos:
            fila["restrained_kg"] += mx

    return [acum[nombre] for nombre, _z in pisos]
