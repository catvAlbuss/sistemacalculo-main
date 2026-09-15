"""
seismic.frame_releases — liberaciones de extremo de barra (los "releases" de ETABS).

QUE SON
    Una conexion articulada: la barra llega al nudo pero no le transmite
    momento. En ETABS se asignan con `Assign > Frame > Releases` y en el `.e2k`
    viajan como `LINEASSIGN ... RELEASE "M2I M3I"`. Son comunes en modelos
    reales — tijerales, vigas simplemente apoyadas, arriostres.

    El motor NO las tenia. Una viga articulada se analizaba como empotrada, o
    sea con momento en un extremo donde no puede haberlo, y ese momento salia
    despues en el diseño.

DOS COSAS QUE HAY QUE SABER, LAS DOS MEDIDAS

    1. **Solo funcionan con `elasticBeamColumn`.** `ElasticTimoshenkoBeam`
       ACEPTA el argumento `-releasez` sin protestar y despues lo IGNORA. Medido
       con una viga apuntalada (empotrada + liberada en I, que tiene que dar lo
       mismo que articulada):

           formulacion   con release    M_J teorico -3PL/16 = -1125
           elasticBeam      -1125.00    <- correcto
           Timoshenko        -750.00    <- el release no hizo nada

       Por eso una barra con liberacion cae a Euler y pierde la deformacion por
       corte. Es el intercambio correcto: el corte vale ~3% del periodo, tener
       mal el momento de extremo vale mucho mas.

    2. **OpenSees libera flexion, no torsion ni axial.** `elasticBeamColumn`
       solo tiene `-releasez` (M3) y `-releasey` (M2). Una liberacion de torsion
       o axial se avisa y se ignora, en vez de fingir que se aplico.

CODIGOS DE OPENSEES
    0 = nada · 1 = en el extremo I · 2 = en el J · 3 = en los dos.
"""

# Nombres que se aceptan por componente, en el orden de ETABS. Las claves son
# lo que se busca en el texto ya normalizado (mayusculas, sin espacios).
_M3 = ("M3I", "M3J")
_M2 = ("M2I", "M2J")
_TORSION = ("TI", "TJ")
_AXIAL = ("PI", "PJ")


def _pedidas(elem) -> set:
    """
    Conjunto de liberaciones pedidas, normalizado a `{"M3I", "M2J", ...}`.

    Acepta las tres formas en que puede llegar, porque el dato pasa por el
    importador, el payload y a veces se escribe a mano en un test:
      - `releases: ["M3I", "M2J"]`      (lista plana, la del `.e2k`)
      - `releases: {"i": ["M3"], "j": []}`  (por extremo)
      - `releaseM3I: true`                  (banderas sueltas)
    """
    crudo = elem.get("releases", elem.get("release"))
    salida = set()

    if isinstance(crudo, dict):
        for extremo in ("i", "j", "I", "J"):
            for nombre in crudo.get(extremo, []) or []:
                salida.add(f"{str(nombre).upper().replace(' ', '')}{extremo.upper()}")
    elif isinstance(crudo, (list, tuple, set)):
        for nombre in crudo:
            salida.add(str(nombre).upper().replace(" ", ""))
    elif isinstance(crudo, str):
        for nombre in crudo.replace(",", " ").split():
            salida.add(nombre.upper())

    for clave, valor in (elem or {}).items():
        if str(clave).lower().startswith("release") and valor:
            resto = str(clave)[7:].upper().replace("_", "")
            if resto:
                salida.add(resto)
    return salida


def _codigo(pedidas, par):
    """0/1/2/3 a partir de si estan pedidos el extremo I y/o el J."""
    return (1 if par[0] in pedidas else 0) + (2 if par[1] in pedidas else 0)


def codigos(elem):
    """
    `(releasez, releasey, avisos)` para un elemento.

    `releasez` libera M3 y `releasey` libera M2 — la misma pareja de siempre:
    M3 va con la flexion en el plano 1-2 (Iz) y M2 con la del plano 1-3 (Iy).

    `avisos` trae las liberaciones que se pidieron y NO se pueden aplicar. Se
    devuelven en vez de tragarselas: una torsion liberada que el motor ignora en
    silencio es justo el tipo de cosa que despues cuesta una sesion entera.
    """
    pedidas = _pedidas(elem)
    if not pedidas:
        return 0, 0, []

    avisos = []
    for nombre, par in (("torsión", _TORSION), ("axial", _AXIAL)):
        if any(p in pedidas for p in par):
            avisos.append(
                "liberación de %s pedida en el elemento %s: OpenSees solo libera "
                "flexión (M2/M3), se ignora" % (nombre, elem.get("id"))
            )
    return _codigo(pedidas, _M3), _codigo(pedidas, _M2), avisos


def tiene_liberacion(elem) -> bool:
    """Si hay que caer a `elasticBeamColumn` (ver el punto 1 del encabezado)."""
    rz, ry, _ = codigos(elem)
    return bool(rz or ry)
