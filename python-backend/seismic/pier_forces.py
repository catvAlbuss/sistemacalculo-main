"""
seismic.pier_forces — la tabla **Pier Forces** de ETABS.

QUE PROBLEMA RESUELVE
    Un muro es UN objeto para modelar, pero para analizarlo se malla en muchos
    elementos shell (aca `ShellDKGQ`, ver `_build_wall_mesh_plan`). Eso deja las
    fuerzas repartidas en decenas de cuadritos, que no sirven para disenar: el
    diseno de una placa necesita UN P/V2/V3/T/M2/M3 por piso.

    La etiqueta de PIER es lo que vuelve a juntarlos. Este modulo hace el corte
    de seccion: toma los shells de un pier en un piso, suma sus fuerzas nodales
    en el plano del corte y las lleva al centroide de la seccion, en ejes
    locales del pier. Es exactamente la tabla que el ingeniero copia al Excel
    para disenar.

CONVENCION DE SIGNOS (calibrada contra ETABS)
    - Ejes locales: 1 = vertical (+Z), 2 = direccion dominante del pier en
      planta, 3 = 1x2. Asi V2/M3 son la pareja EN el plano del muro (los
      grandes) y V3/M2 la de fuera del plano.
    - P con COMPRESION NEGATIVA, como la tabla de ETABS (ojo: al reves que
      Element Forces - Columns, ver [[project_element_forces_table]]).
    - En el corte de ABAJO se toma la accion del tramo sobre lo que tiene
      debajo; en el de ARRIBA, la de lo que tiene encima sobre el tramo — o
      sea el mismo vector cambiado de signo. Con eso V2, V3 y T salen IGUALES
      arriba y abajo cuando no hay carga horizontal repartida en la altura, y
      los momentos cumplen `M_abajo = M_arriba + V*h`. Las dos cosas se
      verifican contra la tabla del usuario (P1, CM, Story1: M3 -2.4945 →
      +1.2006 con V2 1.1197 y h 3.30).

POR QUE NO SE APOYA EN `eleResponse`
    `ops.eleForce(eid)` de un shell de 4 nudos devuelve 24 valores (6 GDL x 4
    nudos) en ejes GLOBALES: la fuerza que el elemento aplica a cada nudo. Eso
    es justo lo que hace falta para sumar sobre un corte, y no depende de la
    formulacion del shell.
"""

import math

try:
    import openseespy.opensees as ops
except ImportError:  # el modulo se importa igual para poder testear la geometria
    ops = None

# Un nudo esta EN el corte si su cota cae dentro de esta tolerancia. El mallado
# interpola las esquinas del pano, asi que las cotas son exactas salvo error de
# punto flotante; 1 mm es holgado y no puede alcanzar a la siguiente fila de la
# malla (el elemento mas chato del mallado de muros mide varios centimetros).
TOL_Z = 1e-3

ARRIBA = "Top"
ABAJO = "Bottom"


def sistema_rapido():
    """
    Elige el solver lineal para los estaticos por modo.

    `BandGeneral` es malisimo con muchos shells: el ancho de banda se dispara y
    cada solve del modelo del usuario tardaba 0.86 s. Medido sobre ese mismo
    modelo, con el MISMO desplazamiento hasta el septimo digito (5.894327e-04):

        BandGeneral  0.864 s      UmfPack     0.293 s
        ProfileSPD   0.838 s      SparseSYM   0.212 s

    Con 15 modos x 2 direcciones son 30 solves, asi que son ~17 s por caso.
    Cae a BandGeneral si el build de OpenSees no trae el disperso.
    """
    try:
        ops.system("UmfPack")
    except Exception:
        ops.system("BandGeneral")


def agrupar_segmentos(pier_mesh: dict) -> dict:
    """
    Agrupa los elementos del mallado por TRAMO de pier: `(pier, zbot, ztop)`.

    Cada tramo es el pier dentro de UN piso — que es la unidad con la que
    reporta ETABS (una fila Top y una fila Bottom por piso). Un pier en forma
    de L trae aca los dos panos juntos, que es lo que hay que integrar.
    """
    segmentos: dict = {}
    for eid, info in (pier_mesh or {}).items():
        pier = info.get("pier")
        if not pier:
            continue
        clave = (
            str(pier),
            round(float(info.get("zbot", 0.0)), 4),
            round(float(info.get("ztop", 0.0)), 4),
        )
        seg = segmentos.setdefault(clave, {"eids": [], "story": info.get("story")})
        seg["eids"].append(int(eid))
        if seg["story"] is None:
            seg["story"] = info.get("story")
    return segmentos


def _info(pier_mesh, eid):
    return pier_mesh.get(eid) or pier_mesh.get(str(eid)) or pier_mesh.get(int(eid))


def _coord(tag):
    try:
        c = ops.nodeCoord(int(tag))
        return float(c[0]), float(c[1]), float(c[2])
    except Exception:
        return None


def _nudos_en_corte(info, z_corte, coords):
    """Indices (k, coord) de los nudos del elemento que caen en el plano."""
    salida = []
    for k, tag in enumerate(info.get("nodes", ())):
        c = coords.get(int(tag))
        if c is not None and abs(c[2] - z_corte) <= TOL_Z:
            salida.append((k, c))
    return salida


def trazas_en_planta(eids, pier_mesh, z_corte, coords):
    """
    Traza en planta del pier EN el corte: un tramo `(p, q, largo)` por cada
    elemento que apoya dos nudos sobre el plano del corte.

    Es la seccion transversal del pier a esa cota — de aca salen el centroide y
    la direccion dominante. Se usan solo los elementos del corte (no todos los
    del tramo) para que un pier con panos de distinta altura no sesgue nada.
    """
    trazas = []
    for eid in eids:
        info = _info(pier_mesh, eid)
        if not info:
            continue
        en_corte = [(c[0], c[1]) for _k, c in _nudos_en_corte(info, z_corte, coords)]
        if len(en_corte) < 2:
            continue
        # Los dos nudos mas separados: en un shell de muro vertical son los dos
        # extremos del tramo en planta.
        mejor = None
        for i in range(len(en_corte)):
            for j in range(i + 1, len(en_corte)):
                d = math.dist(en_corte[i], en_corte[j])
                if mejor is None or d > mejor[2]:
                    mejor = (en_corte[i], en_corte[j], d)
        if mejor and mejor[2] > 1e-9:
            trazas.append(mejor)
    return trazas


def ejes_locales(trazas):
    """
    Ejes locales del pier a partir de su traza en planta.

    El eje 2 es la direccion en la que hay MAS muro: el autovector mayor del
    tensor `S = suma L*(d(x)d)` de las direcciones en planta pesadas por su
    largo. En un muro plano da la direccion del muro (lo obvio); en una L da el
    ala larga; y en un muro sesgado da la direccion real, sin depender de los
    ejes X/Y globales.

    Devuelve `(e2, e3)` como pares (x, y). `e1` es siempre +Z, y `e3 = e1 x e2`.
    """
    sxx = sxy = syy = 0.0
    for (p, q, largo) in trazas:
        dx, dy = q[0] - p[0], q[1] - p[1]
        n = math.hypot(dx, dy)
        if n < 1e-12:
            continue
        dx, dy = dx / n, dy / n
        sxx += largo * dx * dx
        sxy += largo * dx * dy
        syy += largo * dy * dy

    if sxx + syy < 1e-12:
        return (1.0, 0.0), (0.0, 1.0)

    # Autovector del mayor autovalor de [[sxx, sxy], [sxy, syy]] (2x2 cerrado).
    tr, det = sxx + syy, sxx * syy - sxy * sxy
    disc = max(tr * tr / 4.0 - det, 0.0)
    lam = tr / 2.0 + math.sqrt(disc)
    if abs(sxy) > 1e-12:
        vx, vy = lam - syy, sxy
    else:
        vx, vy = (1.0, 0.0) if sxx >= syy else (0.0, 1.0)
    n = math.hypot(vx, vy)
    vx, vy = (vx / n, vy / n) if n > 1e-12 else (1.0, 0.0)

    # Signo determinista: hacia +X, y si el eje es casi paralelo a Y, hacia +Y.
    # (Sin esto el autovector puede salir invertido y volteaba V2 y M3.)
    if abs(vx) > 1e-9:
        if vx < 0:
            vx, vy = -vx, -vy
    elif vy < 0:
        vx, vy = -vx, -vy

    return (vx, vy), (-vy, vx)  # e3 = e1 x e2 con e1 = +Z


def centroide(trazas):
    """Centroide de la traza en planta, pesado por largo. Es el punto donde
    ETABS reporta los momentos del pier."""
    lx = ly = lt = 0.0
    for (p, q, largo) in trazas:
        lx += largo * (p[0] + q[0]) / 2.0
        ly += largo * (p[1] + q[1]) / 2.0
        lt += largo
    if lt < 1e-12:
        return 0.0, 0.0
    return lx / lt, ly / lt


def peso_por_muro(data: dict) -> dict:
    """
    Peso propio del muro tal como lo manda el frontend: cargas nodales con
    `source == "wall_self_weight"`. Devuelve {(wall_id, node_id): W} en N.

    Se guarda POR NUDO, no por pano, porque lo que hay que corregir depende de
    donde se aplico cada parte — ver `_resultante_de_peso`.
    """
    pesos: dict = {}
    for c in data.get("loads", []) or []:
        if not isinstance(c, dict) or c.get("source") != "wall_self_weight":
            continue
        wid, nid = c.get("wallId"), c.get("node")
        if wid is None or nid is None:
            continue
        k = (wid, int(nid))
        pesos[k] = pesos.get(k, 0.0) + abs(float(c.get("fz", 0.0) or 0.0))
    return pesos


def _resultante_de_peso(eids, pier_mesh, z_corte, coords, pesos, cen, lado):
    """
    Parte del peso propio que se SALTEA el corte, y hay que sumar a mano.

    EL PROBLEMA. El peso propio del muro llega del frontend como cargas
    nodales en las 4 esquinas del pano (1/4 en cada una), no como fuerza de
    volumen del shell como hace ETABS. La mitad que cae en las esquinas de
    ABAJO esta aplicada JUSTO sobre el plano del corte: baja directo a lo que
    haya debajo sin pasar nunca por el muro. Sin corregirlo, el P del pie del
    pano se queda corto — en el modelo del usuario, P1 Story1 CM va de -17.736
    arriba a -22.9632 abajo, y esos 5.2272 tonf son exactamente el peso del
    pano.

    LA CORRECCION ES SIMETRICA. En el corte de ABAJO se SUMA el peso aplicado
    ahi (se saltea el corte y tiene que aparecer); en el de ARRIBA se RESTA (el
    peso propio del pano no es carga que le llegue de arriba — con fuerza de
    volumen, en la cara superior el pano todavia no pesa nada). Con eso la
    diferencia Bottom - Top da el peso del pano EXACTO, y ademas sale bien sola:
    como el pano no tiene carga de volumen, la suma de fuerzas de elemento de
    la fila de abajo es identica a la de arriba, asi que la diferencia queda
    fijada solo por esta correccion, pase lo que pase con el reparto.

    LO QUE QUEDA ABIERTO. La mitad aplicada en las esquinas de ARRIBA si entra
    al modelo y se reparte por rigidez entre el muro y lo que comparta ese nudo
    (columnas, el pano de arriba). Restarla entera supone que se la lleva toda
    el muro. Cuando una columna se lleva parte, queda un desvio de hasta medio
    peso de pano en el valor absoluto del Top — se arregla repartiendo el peso
    como fuerza de volumen, no aca.
    """
    F = [0.0, 0.0, 0.0]
    M = [0.0, 0.0, 0.0]
    if not pesos:
        return F, M

    signo_w = -1.0 if lado == ABAJO else 1.0
    vistos = set()
    for eid in eids:
        info = _info(pier_mesh, eid)
        if not info:
            continue
        wid = info.get("wall")
        for tag in info.get("nodes", ()):
            tag = int(tag)
            c = coords.get(tag)
            if c is None or abs(c[2] - z_corte) > TOL_Z:
                continue
            clave = (wid, tag)
            if clave in vistos:
                continue
            W = float(pesos.get(clave, 0.0))
            if W <= 0:
                continue
            vistos.add(clave)
            F[2] += signo_w * W
            M[0] += (c[1] - cen[1]) * (signo_w * W)
            M[1] += -(c[0] - cen[0]) * (signo_w * W)
    return F, M


def fuerzas_de_corte(eids, pier_mesh, z_corte, coords, lado, pesos=None):
    """
    Integra las fuerzas de los shells sobre el plano `z_corte`.

    Devuelve `(F, M, cen, e2, e3, largo)` en ejes GLOBALES (N, N*m), con el
    momento tomado en el centroide de la traza. `lado` es ARRIBA o ABAJO y solo
    decide el signo (ver la convencion en el encabezado del modulo).
    """
    trazas = trazas_en_planta(eids, pier_mesh, z_corte, coords)
    cen = centroide(trazas)
    e2, e3 = ejes_locales(trazas)
    largo = sum(t[2] for t in trazas)

    F = [0.0, 0.0, 0.0]
    M = [0.0, 0.0, 0.0]
    for eid in eids:
        info = _info(pier_mesh, eid)
        if not info:
            continue
        en_corte = _nudos_en_corte(info, z_corte, coords)
        if not en_corte:
            continue
        try:
            f = ops.eleForce(int(eid))
        except Exception:
            continue
        n_nudos = len(info.get("nodes", ()))
        if len(f) < 6 * n_nudos:
            continue
        for k, c in en_corte:
            fx, fy, fz = float(f[6 * k]), float(f[6 * k + 1]), float(f[6 * k + 2])
            mx, my, mz = float(f[6 * k + 3]), float(f[6 * k + 4]), float(f[6 * k + 5])
            rx, ry = c[0] - cen[0], c[1] - cen[1]
            F[0] += fx
            F[1] += fy
            F[2] += fz
            # r x f  con rz = 0 (el momento se toma EN el plano del corte).
            M[0] += ry * fz + mx
            M[1] += -rx * fz + my
            M[2] += rx * fy - ry * fx + mz

    # `ops.eleForce` de un shell devuelve la fuerza con el signo OPUESTO al que
    # uno espera de una "fuerza que el elemento aplica al nudo": bajo peso
    # propio, en los nudos de la base sale +Z. Medido, no deducido — con un
    # voladizo de 4x3 m, FH=10 kN arriba, salia P=+5.0986 tonf donde la
    # estatica pide -5.0986. De ahi el menos.
    signo = -1.0 if lado == ABAJO else 1.0
    F = [signo * v for v in F]
    M = [signo * v for v in M]

    # Va DESPUES del signo: la correccion ya viene con su sentido fisico.
    Fw, Mw = _resultante_de_peso(eids, pier_mesh, z_corte, coords, pesos, cen, lado)
    F = [F[i] + Fw[i] for i in range(3)]
    M = [M[i] + Mw[i] for i in range(3)]
    return F, M, cen, e2, e3, largo


def a_ejes_locales(F, M, e2, e3):
    """
    (P, V2, V3, T, M2, M3) en N y N*m, con P compresion negativa.

    EL MENOS DE M2 NO ES UN ERROR. ETABS reporta los dos momentos de modo que
    los dos cierren SUMANDO al bajar un piso:
        M3_abajo = M3_arriba + V2*h      y      M2_abajo = M2_arriba + V3*h
    (P1, Story1, CM: M2 0.1655 -> -0.3082 con V3 -0.1436 y h 3.30 — da -0.3084).
    El momento fisico alrededor del eje 2 va al reves: una fuerza +e3 aplicada a
    la altura h produce un momento -h*F sobre e2 (regla de la mano derecha).
    Los ejes SI son dextrogiros — se deduce de P: la compresion sale negativa
    solo si e1 = +Z, y con e2 fijado por el ala dominante eso obliga a
    e3 = e1 x e2. Asi que el que lleva el signo cambiado es M2, no V3.
    """
    return {
        "P": F[2],
        "V2": F[0] * e2[0] + F[1] * e2[1],
        "V3": F[0] * e3[0] + F[1] * e3[1],
        "T": M[2],
        "M2": -(M[0] * e2[0] + M[1] * e2[1]),
        "M3": M[0] * e3[0] + M[1] * e3[1],
    }


def leer_pier_forces(data: dict, pesos: dict = None) -> list:
    """
    Lee las fuerzas de pier del modelo YA ANALIZADO (hay que llamarla despues
    de `ops.analyze`, con el mismo modelo en pie).

    Devuelve una fila por (pier, piso, Top/Bottom), en N y N*m:
        {pier, story, location, P, V2, V3, T, M2, M3, length, centroid, axis2}
    """
    if ops is None:
        return []
    pier_mesh = data.get("_pier_mesh") or {}
    if not pier_mesh:
        return []

    coords = {}
    for info in pier_mesh.values():
        for tag in info.get("nodes", ()):
            tag = int(tag)
            if tag not in coords:
                c = _coord(tag)
                if c is not None:
                    coords[tag] = c

    # `pesos` se pasa SOLO en los casos de gravedad, y sacado de las cargas de
    # ESE caso: en un espectral el peso propio no esta aplicado, y sumarlo ahi
    # inventaria un P que ETABS no reporta (su tabla da SDX con P = 1.883 tonf).
    pesos = pesos or {}

    filas = []
    for (pier, zbot, ztop), seg in sorted(agrupar_segmentos(pier_mesh).items()):
        for lado, z in ((ARRIBA, ztop), (ABAJO, zbot)):
            F, M, cen, e2, e3, largo = fuerzas_de_corte(
                seg["eids"], pier_mesh, z, coords, lado, pesos
            )
            if largo <= 0:
                continue
            fila = {
                "pier": pier,
                "story": seg.get("story"),
                "location": lado,
                "z": z,
                "length": largo,
                "centroid": [cen[0], cen[1]],
                "axis2": [e2[0], e2[1]],
            }
            fila.update(a_ejes_locales(F, M, e2, e3))
            filas.append(fila)
    return filas


# ═══════════════════════════════════════════════════════════════════════
# CORRIDAS: un caso de carga a la vez
# ═══════════════════════════════════════════════════════════════════════
# Los dos runners de abajo son AISLADOS: se arman su propio modelo y no tocan
# los resultados del pipeline (mismo idiom que `run_frame_force_results` y
# `run_joint_reactions_rsa`). Los imports son perezosos para que este modulo
# se pueda importar y testear sin arrastrar el solver entero.

def _clave(fila):
    return (fila["pier"], fila.get("story"), fila["location"])


def run_pier_forces_static(data: dict, tipos=None) -> list:
    """
    Fuerzas de pier de un caso ESTATICO (CM, CV...).

    `tipos` es el conjunto de `type`/`loadType` de las cargas a incluir; None
    las toma todas. Devuelve las filas de `leer_pier_forces` (N, N*m).
    """
    from .inputs import build_model_3d
    from .solver import _run_static_with_loads

    if ops is None or not (data.get("walls") or []):
        return []

    cargas = data.get("loads", []) or []
    if tipos is not None:
        cargas = [
            c for c in cargas
            if isinstance(c, dict)
            and str(c.get("type") or c.get("loadType") or "").strip() in tipos
        ]

    nodes, elements = build_model_3d(data)
    try:
        _run_static_with_loads(nodes, elements, cargas)
    except Exception:
        return []
    return leer_pier_forces(data, peso_por_muro({"loads": cargas}))


def run_pier_forces_rsa(
    data: dict,
    modal_data: dict,
    spectrum: list,
    direction: str = "x",
    combination: str = "CQC",
    damping_ratio: float = 0.05,
    sa_in_g: bool = True,
    g: float = 9.81,
) -> list:
    """
    Fuerzas de pier de un caso ESPECTRAL (SDX, SDY).

    OJO — ESTO NO SE PUEDE HACER COMBINANDO DESPUES. Hay que combinar entre
    modos la FUERZA DE PIER, no los desplazamientos ni las fuerzas nodales: la
    CQC es una raiz de cuadrados, no una suma, asi que integrar el corte sobre
    resultados ya combinados da cualquier cosa. Por eso se resuelve un estatico
    por MODO (fuerza modal equivalente F_n = Gamma_n * Sa_n * M * phi_n), se
    integra el pier en cada uno, y recien ahi se combinan las seis componentes.
    Es el mismo metodo que ya usa `run_joint_reactions_rsa` para las reacciones.

    Devuelve filas con las seis componentes en MAGNITUD (>= 0), como la tabla
    de ETABS con Step Type = Max.
    """
    import numpy as np

    from .inputs import build_model_3d
    from .solver import _cqc_combine, _srss_combine, interpolate_spectrum

    if ops is None or not (data.get("walls") or []):
        return []

    modal_info = modal_data.get("modal_info") or []
    phi_x = modal_data.get("phi_x") or []
    phi_y = modal_data.get("phi_y") or []
    m_x = modal_data.get("m_x") or []
    m_y = modal_data.get("m_y") or []
    node_ids = modal_data.get("node_ids") or []
    if not modal_info or not node_ids:
        return []

    escala = g if sa_in_g else 1.0
    componentes = ("P", "V2", "V3", "T", "M2", "M3")
    modal: dict = {}
    fijas: dict = {}

    # EL MODELO SE ARMA UNA SOLA VEZ. Antes se reconstruia dentro del loop, o
    # sea 15 modos x 2 direcciones = 30 `build_model_3d` completos, cada uno
    # mallando los cientos de shells de losas y muros. Eso solo se llevaba
    # varios minutos del analisis. Entre modos alcanza con soltar el patron de
    # carga y el analisis anteriores y devolver el dominio a cero.
    build_model_3d(data)

    for n, mi in enumerate(modal_info):
        Sa = interpolate_spectrum(spectrum, mi["period"]) * escala
        gamma = mi["gamma_x"] if direction == "x" else mi["gamma_y"]

        # Un tag POR MODO: `remove("loadPattern", t)` saca el patron pero NO su
        # timeSeries, asi que reusar el tag 1 falla con "one with similar tag
        # exists" en el segundo modo. Y hay que sacar el patron anterior o los
        # modos se suman entre si.
        tag = n + 1
        ops.wipeAnalysis()
        if n > 0:
            try:
                ops.remove("loadPattern", n)
            except Exception:
                pass
        ops.setTime(0.0)
        ops.reset()
        ops.timeSeries("Linear", tag)
        ops.pattern("Plain", tag, tag)

        aplicada = False
        for i, nid in enumerate(node_ids):
            fx = gamma * Sa * float(m_x[i]) * float(phi_x[n][i])
            fy = gamma * Sa * float(m_y[i]) * float(phi_y[n][i])
            if fx or fy:
                ops.load(int(nid), fx, fy, 0.0, 0.0, 0.0, 0.0)
                aplicada = True
        if not aplicada:
            continue

        ops.constraints("Transformation")
        ops.numberer("RCM")
        sistema_rapido()
        ops.test("NormDispIncr", 1e-8, 50)
        ops.algorithm("Linear")
        ops.integrator("LoadControl", 1.0)
        ops.analysis("Static")
        if ops.analyze(1) != 0:
            continue

        for fila in leer_pier_forces(data):
            k = _clave(fila)
            if k not in modal:
                modal[k] = np.zeros((len(modal_info), len(componentes)))
                fijas[k] = fila
            modal[k][n] = [fila[c] for c in componentes]

    combo = str(combination or "SRSS").upper()
    salida = []
    for k, mat in modal.items():
        comb = _cqc_combine(mat, modal_info, damping_ratio) if combo == "CQC" else _srss_combine(mat)
        fila = dict(fijas[k])
        fila.update({c: float(abs(comb[i])) for i, c in enumerate(componentes)})
        salida.append(fila)
    return salida


def casos_estaticos(data: dict) -> list:
    """
    Nombres de los casos estaticos presentes en las cargas, en el orden en que
    aparecen. Se agrupa por `loadCase` (CM, CV...) porque es asi como los
    reporta ETABS, no por `type` — un modelo puede traer CVT y CVE, los dos de
    tipo Live, y son dos filas distintas de la tabla.
    """
    vistos = []
    for c in data.get("loads", []) or []:
        if not isinstance(c, dict):
            continue
        nombre = str(c.get("loadCase") or c.get("type") or c.get("loadType") or "").strip()
        if nombre and nombre not in vistos:
            vistos.append(nombre)
    return vistos


def _cargas_del_caso(data: dict, nombre: str) -> list:
    return [
        c for c in (data.get("loads", []) or [])
        if isinstance(c, dict)
        and str(c.get("loadCase") or c.get("type") or c.get("loadType") or "").strip() == nombre
    ]


def recolectar_pier_forces(
    data: dict,
    modal_data: dict = None,
    spectrum_x: list = None,
    spectrum_y: list = None,
    combination: str = "CQC",
    damping_ratio: float = 0.05,
    sa_in_g: bool = True,
    g: float = 9.81,
    nombre_caso: str = None,
) -> list:
    """
    La tabla Pier Forces de ESTE payload: una fila por (pier, piso, Top/Bottom,
    caso).

    UN PAYLOAD ES UN SOLO CASO ESPECTRAL, NO DOS. Es el error que costo caro:
    `spectrum_x` y `spectrum_y` NO son "el caso X" y "el caso Y" — son las dos
    componentes de UN caso, con sus factores de direccion YA aplicados. En el
    payload del caso SDY del usuario, el Sa maximo de Y es 1.839 y el de X es
    0.552: exactamente 1/3.333, o sea el 30% de la direccion secundaria.

    Emitiendo dos filas y llamandolas "SDX" y "SDY" se reportaba la componente
    secundaria como si fuera el caso principal: el "SDX" salia 3.33 veces bajo
    (medido contra ETABS: V2 2.29 contra 10.02; corregido por el factor da 7.63,
    el mismo -24% que tiene el SDY, o sea el resto es otra cosa).

    Ahora las dos componentes se combinan por SRSS en UNA fila por corte, que es
    la demanda de ese caso. El nombre sale de `nombre_caso` (lo pone el
    frontend, que es quien sabe como se llama cada Response Spectrum Case).

    Nunca levanta: si un caso falla, esa parte de la tabla queda vacia.
    Unidades N y N*m.
    """
    from .inputs import build_model_3d
    from .solver import _run_static_with_loads

    filas = []
    if ops is None or not (data.get("walls") or []):
        return filas

    for nombre in casos_estaticos(data):
        cargas = _cargas_del_caso(data, nombre)
        if not cargas:
            continue
        try:
            nodes, elements = build_model_3d(data)
            _run_static_with_loads(nodes, elements, cargas)
            for f in leer_pier_forces(data, peso_por_muro({"loads": cargas})):
                f["case"] = nombre
                f["caseType"] = "LinStatic"
                filas.append(f)
        except Exception as error:
            print(f"[pier_forces] caso estatico {nombre}: {error}")

    if modal_data and (spectrum_x or spectrum_y):
        try:
            filas += _caso_espectral(
                data, modal_data, spectrum_x, spectrum_y, combination,
                damping_ratio, sa_in_g, g,
                nombre_caso or str(data.get("seismicCaseName") or "RS"),
            )
        except Exception as error:
            print(f"[pier_forces] caso espectral: {error}")

    try:
        from .solver import _ff_default_design_combos

        metas = _metadatos_de_casos(
            data, nombre_caso or str(data.get("seismicCaseName") or "RS"),
        )
        filas += combinar_pier_forces(filas, _ff_default_design_combos(metas))
    except Exception as error:
        print(f"[pier_forces] combinaciones: {error}")

    return filas


def _caso_espectral(data, modal_data, spectrum_x, spectrum_y, combination,
                    damping_ratio, sa_in_g, g, nombre):
    """
    Las dos componentes del caso, combinadas por SRSS en una sola fila.

    SRSS y no suma: son respuestas espectrales, sin signo ni simultaneidad. Es
    la misma regla que ya usa el pipeline para juntar las reacciones de las dos
    excitaciones de un caso.
    """
    import math

    componentes = ("P", "V2", "V3", "T", "M2", "M3")
    partes = []
    for espectro, direccion in ((spectrum_x, "x"), (spectrum_y, "y")):
        if not espectro:
            continue
        partes.append({
            _clave(f): f
            for f in run_pier_forces_rsa(
                data, modal_data, espectro, direction=direccion,
                combination=combination, damping_ratio=damping_ratio,
                sa_in_g=sa_in_g, g=g,
            )
        })
    if not partes:
        return []

    claves = set()
    for p in partes:
        claves |= set(p)

    salida = []
    for k in claves:
        base = next((p[k] for p in partes if k in p), None)
        if base is None:
            continue
        fila = dict(base)
        for c in componentes:
            fila[c] = math.sqrt(sum(float(p[k][c]) ** 2 for p in partes if k in p))
        fila["case"] = nombre
        fila["caseType"] = "LinRespSpec"
        fila["stepType"] = "Max"
        salida.append(fila)
    return salida


def _metadatos_de_casos(data: dict, nombre_sismico: str):
    """
    Ficha de cada caso para el armador de combos: {id, name, type, patternType}.

    El tipo de patron se saca de las cargas del propio caso, no del nombre —
    `_ff_default_design_combos` clasifica por TIPO justamente para que un modelo
    que llame distinto a sus patrones no se quede sin combos en silencio.
    """
    metas = []
    for nombre in casos_estaticos(data):
        tipos = {
            str(c.get("type") or c.get("loadType") or "").strip()
            for c in _cargas_del_caso(data, nombre)
        }
        tipos.discard("")
        metas.append({
            "id": nombre,
            "name": nombre,
            "type": "Linear Static",
            "patternType": sorted(tipos)[0] if tipos else "",
        })
    metas.append({"id": nombre_sismico, "name": nombre_sismico,
                  "type": "Response Spectrum", "signless": True})
    return metas


def _lista_estilo_etabs(combos):
    """
    Reordena y renombra los combos al formato de la tabla de ETABS.

    DOS DIFERENCIAS con lo que devuelve `_ff_default_design_combos`, y las dos
    las pidio el usuario mirando su tabla:

    1. **Los combos de gravedad SUELTOS no van.** E.060 art. 9.2 define
       `1.4CM+1.7CV`, `1.25(CM+CV) ± CS` y `0.9CM ± CS`. `1.25(CM+CV)` y
       `0.9CM` a secas NO son combinaciones de diseno: son la parte
       gravitatoria de las otras dos. El armador compartido las emite porque le
       sirven cuando el modelo no tiene sismo, pero en una tabla de piers de un
       modelo CON sismo sobran. Se descartan las que son sub-conjunto de un
       combo sismico — asi `1.4CM+1.7CV`, que no lo es, se queda.

    2. **El `±` se abre en DOS combos con nombre propio**, `+SDX` y `-SDX`,
       como los numera ETABS (02 y 03). Dan exactamente lo mismo —el espectro
       no tiene signo— pero el ingeniero espera ver las nueve filas de su
       tabla, y una que falta se lee como un combo que no se evaluo.

    NO SE NUMERA ACA. Cada payload es UN caso espectral, asi que este modulo
    solo ve los combos de SU caso: numerar aca daba dos "02" y ningun "06" al
    juntar los casos en el frontend. Se emiten en cambio los campos con los que
    ordenar (`comboRank`, `comboCase`, `comboSign`) y numera quien ve la lista
    completa — ver `numerarEstiloEtabs` en lib/pierForcesTable.js.
    """
    sismicos, gravedad = [], []
    for c in combos or []:
        (sismicos if any(t.get("signless") for t in (c.get("terms") or []))
         else gravedad).append(c)

    # Un combo de gravedad cuyos terminos ya estan dentro de uno sismico es la
    # parte gravitatoria de aquel, no un combo aparte.
    def _huella(c):
        return frozenset(
            (str(t.get("case")), round(float(t.get("factor", 1.0)), 6))
            for t in (c.get("terms") or []) if not t.get("signless")
        )

    huellas_sismicas = {_huella(c) for c in sismicos}
    gravedad = [c for c in gravedad if _huella(c) not in huellas_sismicas]

    # Los `0.9CM` van despues de los `1.25(CM+CV)`, como en ETABS. Se reconocen
    # por tener un solo termino de gravedad (sin viva).
    def _es_solo_muerta(c):
        return len([t for t in (c.get("terms") or []) if not t.get("signless")]) <= 1

    sismicos.sort(key=lambda c: (1 if _es_solo_muerta(c) else 0))

    def _sin_numero(combo):
        """Saca el `NN ` que ya trae el armador: acá se renumera de cero, y sin
        esto el combo de gravedad salía como `01 01 1.4CM+1.7CV`."""
        base = str(combo.get("id") or "")
        cabeza, _, resto = base.partition(" ")
        return resto if (cabeza.isdigit() and resto) else base

    def _caso_sismico(combo):
        for t in (combo.get("terms") or []):
            if t.get("signless"):
                return str(t.get("case") or "")
        return ""

    salida = []
    for c in gravedad:
        salida.append({**c, "etiqueta": _sin_numero(c), "signo": None,
                       "rank": 0, "sismo": "", "simbolo": ""})
    for c in sismicos:
        cuerpo = _sin_numero(c)
        # 1 = los `1.25(CM+CV)`, 2 = los `0.9CM`. Es el orden de ETABS.
        rank = 2 if _es_solo_muerta(c) else 1
        for signo, simbolo in ((1.0, "+"), (-1.0, "-")):
            salida.append({**c, "signo": signo, "rank": rank,
                           "sismo": _caso_sismico(c), "simbolo": simbolo,
                           "etiqueta": cuerpo.replace("±", simbolo)})
    return salida


def combinar_pier_forces(filas: list, combos: list) -> list:
    """
    Arma las filas de COMBINACION a partir de las de caso, con el formato de la
    tabla de ETABS: una fila **Max** y una **Min** por combo sismico.

    Max y Min dan el mismo par en `+SDX` y en `-SDX` porque el termino sismico
    viene de una CQC y no tiene signo — igual que en ETABS, donde sus combos 02
    y 03 son identicos. Se emiten los dos igual: la tabla tiene que poder
    cruzarse fila por fila con la de ETABS.

    Un combo al que le falte algun caso se saltea entero: media combinacion es
    peor que ninguna.
    """
    componentes = ("P", "V2", "V3", "T", "M2", "M3")
    por_caso: dict = {}
    plantilla: dict = {}
    for f in filas:
        k = (f["pier"], f.get("story"), f["location"])
        por_caso.setdefault(k, {})[f.get("case")] = f
        plantilla.setdefault(k, f)

    lista = _lista_estilo_etabs(combos)
    salida = []
    for k, casos in por_caso.items():
        for combo in lista:
            terminos = combo.get("terms") or []
            if not terminos or any(str(t.get("case")) not in casos for t in terminos):
                continue
            hay_sismo = any(t.get("signless") for t in terminos)
            pasos = (("Max", 1.0), ("Min", -1.0)) if hay_sismo else ((None, 1.0),)
            for paso, rama in pasos:
                fila = {kk: vv for kk, vv in plantilla[k].items()
                        if kk not in componentes and kk not in ("case", "caseType", "stepType")}
                for c in componentes:
                    fila[c] = sum(
                        float(t.get("factor", 1.0)) * (rama if t.get("signless") else 1.0)
                        * float(casos[str(t["case"])][c])
                        for t in terminos
                    )
                fila["case"] = combo["etiqueta"]
                fila["caseType"] = "Combination"
                # Con que ordenar y numerar una vez juntos todos los casos.
                fila["comboRank"] = combo.get("rank", 0)
                fila["comboCase"] = combo.get("sismo", "")
                fila["comboSign"] = combo.get("simbolo", "")
                if paso:
                    fila["stepType"] = paso
                salida.append(fila)
    return salida
