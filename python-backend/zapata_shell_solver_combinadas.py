# python-backend/zapata_shell_solver_combinadas.py
# -----------------------------------------------------------------------
# ARCHIVO PARTIDO (ver conversacion, "particionar zapata_shell_solver.py"):
# antes zapata_shell_solver.py tenia TODO (aisladas + combinadas), 3324
# lineas -- se separo en 2 archivos SIN dependencias cruzadas entre si
# (verificado: ninguna funcion de este archivo llama a nada del archivo
# aisladas, y viceversa). Este archivo: zapatas COMBINADAS (2+ columnas)
# -- rectangular, trapezoidal, en L, y poligonal generica (con sus
# helpers propios de geometria de poligono -- DISTINTOS de los que usa
# la poligonal aislada, no se comparten).
# Ver zapata_shell_solver_aisladas.py para las formas de 1 sola columna.
# Solver de zapata aislada por elementos finitos reales (ShellMITC4, la
# misma tecnologia que ya usa este backend para muros -- ver
# seismic/inputs.py, _build_wall_mesh_plan / _create_wall_shell_elements),
# replicando EXACTO el flujo que el cliente usa en ETABS para validar:
#   1. Define > Load Patterns > "Csuelo" (Dead, Self Weight Multiplier=0)
#   2. Assign > Shell Load > Uniform (Csuelo, -8 tonf/m2, direccion Gravity)
#   3. Display > Shell Forces/Stresses > Component=M11 o M22
#
# Diferencia clave con un piso/losa normal: la zapata NO esta apoyada en
# los bordes (bordes LIBRES) -- el unico apoyo es el nodo donde conecta la
# columna. Carga uniforme repartida en toda la malla (no puntual).
#
# UNIDADES: Tonf y metros en todo el archivo (mismo convenio que el resto
# del proyecto). E en Tonf/m2, q en Tonf/m2, momentos de salida en
# Tonf.m/m (M11, M22, M12 -- igual notacion que ETABS).
# -----------------------------------------------------------------------

import math
import sys

import openseespy.opensees as ops

# AGREGADO (ver conversacion, "implementar solo con hueco" 2026-09-10):
# `triangle` (wrapper del triangulador de Shewchuk, estandar de la
# industria, wheels manylinux/win para py3.9-3.13) se usa SOLO en el
# camino de malla conforme al hueco (ver _resolver_poligono_conforme).
# Import perezoso y tolerante: si no esta instalado (deploy viejo antes de
# que el build lo agregue), el solver cae a la grilla estructurada de
# siempre -- el mismo comportamiento que hasta ahora para zapatas con
# hueco, solo que menos preciso en el anillo cercano al corte.
try:
    import triangle as _triangle_lib
except ImportError:  # pragma: no cover
    _triangle_lib = None


def _ajustar_malla_para_columnas(L, posiciones, n_objetivo, rango=8):
    """
    Igual principio que _ajustar_malla_para_columna(), pero para VARIAS
    columnas a la vez (zapata combinada) -- busca el N (solo hacia malla
    mas fina, nunca mas gruesa) que minimiza el PEOR error de alineacion
    entre todas las columnas, no solo una. Con 2+ columnas es mas dificil
    alinear TODAS exacto (cada una compite por su propio nodo), pero
    igual ayuda a evitar el peor caso (una columna justo a mitad de
    camino entre 2 nodos, el mismo bug ya encontrado y corregido para
    zapatas aisladas descentradas).
    """
    posiciones = [p for p in posiciones if 0 < p < L]
    if not posiciones:
        return n_objetivo

    def _peor_error(n):
        h = L / n
        errores = [abs(p / h - round(p / h)) for p in posiciones]
        return max(errores)

    mejor_n = n_objetivo
    mejor_error = _peor_error(n_objetivo)
    if mejor_error < 1e-9:
        return n_objetivo

    for n in range(n_objetivo + 1, n_objetivo + 2 * rango + 1):
        e = _peor_error(n)
        if e < mejor_error - 1e-9:
            mejor_error = e
            mejor_n = n

    return mejor_n


def calcular_zapata_shell_combinada(
    Lx, Ly,              # dimensiones de la zapata en planta (m) -- rectangulo que contiene todas las columnas
    h,                    # espesor (m)
    E,                    # modulo de elasticidad del concreto (Tonf/m2)
    nu,                   # modulo de poisson
    q,                     # presion perpendicular uniforme (Tonf/m2), empuja hacia ARRIBA
    columnas,               # lista de dicts: {'x','y','bx','by'} -- posicion y tamano de CADA columna
    nx=20, ny=20,          # divisiones de malla
    recubrimiento=0.075,    # recubrimiento (m) -- para el peralte efectivo d, ver deteccion de region D mas abajo
    columna_altura=3.0,      # AGREGADO (ver conversacion, "mejorar precision combinadas"):
                              # altura de piso (m) usada SOLO para las columnas que NO
                              # estan en Region D -- ver bloque de apoyos mas abajo.
                              # Insensible al valor real dentro de un rango normal (2.5-5m
                              # dan practicamente el mismo resultado, verificado) -- no hace
                              # falta el dato exacto del edificio.
    columna_E=None,          # E de la columna (Tonf/m2) si es distinto al de la losa; None = usa E
):
    """
    Igual principio que calcular_zapata_shell() (ShellDKGQ, carga uniforme
    como fuerzas nodales, apoyo puntual de 6 GDL fijos) pero para zapata
    COMBINADA: acepta una lista de columnas en vez de una sola. Cada columna
    restringe el nodo de malla mas cercano a su posicion (mismo criterio
    round() que la version de una columna).

    AGREGADO (ver conversacion, "mejorar precision combinadas", 2026-08-31):
    el apoyo de cada columna YA NO es siempre `ops.fix` (empotramiento total,
    rigidez rotacional infinita) -- se probo contra reacciones reales de
    ETABS (tabla "Joint Reactions") que el reparto de carga entre columnas
    de una viga continua es sensible a esa rigidez, y que modelar la columna
    como un elemento `elasticBeamColumn` real (seccion/E de la columna,
    altura de piso, nodo superior fijo -- representa que el cliente fija
    tanto Base como Story1) acerca mucho el reparto a ETABS real: en F10
    (3 columnas, ninguna cerca de un borde) el tramo antes mas problematico
    ("vano corto", ver `vano_corto_x/y` mas abajo) paso de -41.7% a +2.9% de
    mediana de error contra ETABS real, comparando miles de puntos.

    PERO esto NO se aplica a columnas que ya caen en Region D (cerca de un
    borde libre, ver deteccion mas abajo): probado en F12 (2 columnas, ambas
    en Region D) y el mismo cambio empeoro dramaticamente (+7.2%/-10.2% a
    +79.5%/-78.8%) -- la interaccion entre la deflexion no-cero del nodo de
    columna (ya no fija a la fuerza, como con `ops.fix`) y la proximidad al
    borde libre produce un resultado mucho peor ahi. Por eso el criterio es
    POR COLUMNA: elasticBeamColumn si esa columna no esta en Region D (en
    ningun eje), `ops.fix` (comportamiento de siempre) si lo esta -- deja
    F12 matematicamente IDENTICO a antes (verificado: mismo resultado exacto
    con la misma malla) y mejora F10 sin tocar ningun caso ya conocido como
    fragil.

    AGREGADO (ver conversacion): a diferencia de la aislada, aca interesan
    DOS valores de diseno distintos, como en el metodo rigido de viga
    continua (computeContinuousBeamMoment en footingMoments.js):
      - 'sagging' (momento positivo, tracciona abajo): en la CARA de CADA
        columna -- mismo criterio que la aislada, evaluado por columna.
      - 'hogging' (momento negativo, tracciona arriba): en el TRAMO entre
        columnas consecutivas alineadas (mismo eje X o Y). NUNCA se busca
        el minimo en todo el dominio -- el nodo de CUALQUIER apoyo puntual
        es una singularidad matematica (ver apartado 8 mas abajo) y un
        intento inicial de tomar el minimo global dio -303 Tonf.m/m, un
        valor sin sentido fisico. Se busca solo entre las CARAS de cada
        par de columnas consecutivas, nunca mas cerca.
    Columnas no alineadas (ni misma fila ni misma columna de malla) quedan
    fuera de alcance de esta version -- pensada para zapata combinada tipo
    viga recta (2+ columnas en linea), no para losas con columnas en
    cuadricula 2D (eso requeriria un criterio de "tramo" mas elaborado).

    AGREGADO (ver conversacion, caso real F12): cuando la cara de una
    columna queda cerca de un BORDE LIBRE de la zapata (volado neto,
    cara->borde, menor que 2 veces el peralte efectivo d), el momento leido
    ahi por FEM de placa (delgada o gruesa, se probaron ambas, ver memoria
    del proyecto) subestima el momento real de ETABS hasta en 48-70% -- esa
    zona cae dentro de lo que ACI 318 (R23.2.3, principio de Saint-Venant)
    llama "region D": cerca de un apoyo o borde, la hipotesis de placa/viga
    (deformacion plana, sin corte) deja de ser valida sin importar que tan
    fino o que tan buen elemento se use -- confirmado con 2
    implementaciones FEM independientes fallando igual, y con un elemento
    de mayor orden (ShellMITC9) fallando ya en el caso de control mas
    limpio posible.

    AMPLIADO (ver conversacion, prueba en navegador + barrido de malla en
    X/Y por separado): la version inicial solo ocultaba la cara que mira
    directo al borde, con umbral volado<d (1 peralte). Se encontro que la
    cara OPUESTA de la MISMA columna (la que mira al vano) tambien es
    numericamente inestable -- refinar la malla en X y en Y por separado
    mueve su valor en direcciones OPUESTAS sin converger a un solo numero,
    misma firma que la cara ya marcada -- confirmado en F12 (cara vano a
    1.71d del borde) y en zapata aislada F7 (cara corta a 1.59d, error
    persistente 32-35% nunca explicado hasta ahora). Umbral ampliado a 2d
    (capta ambos casos con margen) y, si CUALQUIER cara de la columna en un
    eje (X o Y) queda dentro de ese umbral, se ocultan las DOS caras de ESE
    eje para esa columna -- decision conservadora a proposito: es mejor
    ocultar de mas que mostrar un numero que parece preciso pero no lo es.

    En vez de devolver esos numeros (que ademas son NO conservadores --
    subestiman), se devuelve None con una bandera '_region_d' para que el
    llamador use el metodo rigido de respaldo (computeContinuousBeamMoment,
    que ya calcula esta misma zapata como viga libre-libre y ya se muestra
    en el frontend) en vez del FEM ahi.
    """
    d = max(0.0, h - recubrimiento)
    # AGREGADO (ver conversacion): mismo fix que zapatas aisladas
    # descentradas -- ajusta la malla (solo hacia mas fina) para que las
    # columnas caigan lo mas exacto posible en un nodo real, en vez de
    # quedar "flotando" entre dos (hasta L/(2*n) de error de posicion,
    # bug real que explico gran parte de la menor precision en aisladas
    # descentradas). Con VARIAS columnas se minimiza el PEOR caso entre
    # todas -- ver _ajustar_malla_para_columnas().
    nx = _ajustar_malla_para_columnas(Lx, [c['x'] for c in columnas], nx)
    ny = _ajustar_malla_para_columnas(Ly, [c['y'] for c in columnas], ny)

    ops.wipe()
    ops.model('basic', '-ndm', 3, '-ndf', 6)

    sec_tag = 1
    ops.section('ElasticMembranePlateSection', sec_tag, E, nu, h, 0.0, 1.0)

    hx = Lx / nx
    hy = Ly / ny
    node_tag = 1
    node_map = {}
    for j in range(ny + 1):
        for i in range(nx + 1):
            x = i * hx
            y = j * hy
            ops.node(node_tag, float(x), float(y), 0.0)
            node_map[(i, j)] = node_tag
            node_tag += 1

    ele_tag = 1
    for j in range(ny):
        for i in range(nx):
            n1 = node_map[(i, j)]
            n2 = node_map[(i + 1, j)]
            n3 = node_map[(i + 1, j + 1)]
            n4 = node_map[(i, j + 1)]
            ops.element('ShellDKGQ', ele_tag, n1, n2, n3, n4, sec_tag)
            ele_tag += 1

    # AGREGADO (ver conversacion, "mejorar precision combinadas"): mismo
    # criterio de Region D que se usa mas abajo para decidir que caras
    # ocultar (REGION_D_FACTOR=2.0*d) -- se calcula ACA, antes del analisis,
    # para decidir el TIPO DE APOYO de cada columna (ver docstring arriba).
    # Se recalcula (no se reusa) en el loop de mas abajo porque ese usa
    # nombres de variable locales a ese scope -- barato, es aritmetica pura
    # sobre la geometria de entrada, no depende del analisis.
    E_col = columna_E if columna_E is not None else E
    G_col = E_col / (2 * (1 + nu))
    top_node_tag = (nx + 1) * (ny + 1) + 1

    columnas_info = []
    for col in columnas:
        i_col = round(col['x'] / hx)
        j_col = round(col['y'] / hy)
        columna_node = node_map[(i_col, j_col)]

        volado_mas_x = Lx - (col['x'] + col['bx'] / 2)
        volado_menos_x = col['x'] - col['bx'] / 2
        volado_mas_y = Ly - (col['y'] + col['by'] / 2)
        volado_menos_y = col['y'] - col['by'] / 2
        columna_x_afectada = min(volado_mas_x, volado_menos_x) < 2.0 * d
        columna_y_afectada = min(volado_mas_y, volado_menos_y) < 2.0 * d

        if columna_x_afectada or columna_y_afectada:
            # Region D: comportamiento de SIEMPRE, sin cambios -- ver
            # docstring (probado que modelar la columna real ACA empeora
            # dramaticamente, F12).
            ops.fix(columna_node, 1, 1, 1, 1, 1, 1)
        else:
            # Fuera de Region D: columna como elemento real (seccion/E de
            # la columna, altura de piso, nodo superior fijo) en vez de
            # empotramiento total -- mejora el reparto de carga entre
            # columnas (ver docstring).
            b_col, h_col = col['bx'], col['by']
            A_col = b_col * h_col
            Iz_col = b_col * h_col ** 3 / 12
            Iy_col = h_col * b_col ** 3 / 12
            J_col = 0.141 * min(b_col, h_col) ** 3 * max(b_col, h_col)  # aprox. torsion rectangular, no critico aca
            top_node = top_node_tag
            top_node_tag += 1
            ops.node(top_node, col['x'], col['y'], columna_altura)
            ops.fix(top_node, 1, 1, 1, 1, 1, 1)
            ops.geomTransf('Linear', top_node, 1.0, 0.0, 0.0)
            ops.element('elasticBeamColumn', top_node + 1000000, columna_node, top_node,
                        A_col, E_col, G_col, J_col, Iy_col, Iz_col, top_node)

        columnas_info.append({
            'i_col': i_col, 'j_col': j_col, 'node': columna_node,
            'bx': col['bx'], 'by': col['by'], 'x': col['x'], 'y': col['y'],
        })

    ops.timeSeries('Linear', 1)
    ops.pattern('Plain', 1, 1)
    for j in range(ny + 1):
        for i in range(nx + 1):
            wx = 0.5 if (i == 0 or i == nx) else 1.0
            wy = 0.5 if (j == 0 or j == ny) else 1.0
            area_trib = wx * wy * hx * hy
            fz = q * area_trib
            ops.load(node_map[(i, j)], 0.0, 0.0, fz, 0.0, 0.0, 0.0)

    ops.system('BandGeneral')
    ops.numberer('RCM')
    ops.constraints('Transformation')
    ops.integrator('LoadControl', 1.0)
    ops.algorithm('Linear')
    ops.analysis('Static')
    ok = ops.analyze(1)
    if ok != 0:
        raise RuntimeError(f'El analisis no convergio (codigo {ok}) -- revisar apoyos/carga.')

    D = E * h ** 3 / (12 * (1 - nu ** 2))

    def w_en(i, j):
        # AGREGADO (ver conversacion, "bug de borde" 2026-09-03): si (i,j)
        # cae fuera del dominio real [0,nx]x[0,ny], se extrapola
        # LINEALMENTE desde el nodo mas cercano y su vecino OPUESTO
        # (equivale a asumir curvatura CERO en el borde -- la
        # aproximacion correcta de un borde libre de Kirchhoff) en vez de
        # sustituir por el valor del propio nodo (clamp silencioso de
        # antes). Esa version anterior, dentro de la formula de segunda
        # derivada, terminaba aproximando dw/dy dividido OTRA VEZ por hy
        # -- crece SIN LIMITE al refinar la malla en vez de converger a
        # un valor chico. Confirmado con un caso real: la ultima fila de
        # la malla daba -227 en vez de un valor chico como el resto de
        # esa zona (ver memoria del proyecto, "bug de borde"). Para
        # cualquier punto YA interior (el caso normal) el resultado es
        # IDENTICO a antes -- este cambio solo afecta la fila/columna
        # exterior de la malla.
        i_c = max(0, min(nx, i))
        j_c = max(0, min(ny, j))
        if i_c == i and j_c == j:
            return ops.nodeDisp(node_map[(i_c, j_c)], 3)
        i_op = max(0, min(nx, 2 * i_c - i))
        j_op = max(0, min(ny, 2 * j_c - j))
        return 2 * ops.nodeDisp(node_map[(i_c, j_c)], 3) - ops.nodeDisp(node_map[(i_op, j_op)], 3)

    def segunda_x(i, j):
        return (w_en(i + 1, j) - 2 * w_en(i, j) + w_en(i - 1, j)) / (hx * hx)

    def segunda_y(i, j):
        return (w_en(i, j + 1) - 2 * w_en(i, j) + w_en(i, j - 1)) / (hy * hy)

    def cruzada_xy(i, j):
        return (w_en(i + 1, j + 1) - w_en(i + 1, j - 1) - w_en(i - 1, j + 1) + w_en(i - 1, j - 1)) / (4 * hx * hy)

    resultados = []
    for j in range(ny + 1):
        for i in range(nx + 1):
            wxx = segunda_x(i, j)
            wyy = segunda_y(i, j)
            wxy = cruzada_xy(i, j)
            Mx = D * (wxx + nu * wyy)
            My = D * (wyy + nu * wxx)
            # AGREGADO (ver conversacion, "revisar con datos" 2026-08-31):
            # Mxy tambien necesita el flip de signo (igual que Mx/My, ver el
            # mismo comentario en calcular_zapata_shell() mas arriba) para
            # calzar con M12 de ETABS -- nunca se habia podido confirmar
            # esto en COMBINADAS por falta de datos reales de M12 (a
            # diferencia de la aislada, donde ya se corrigio hace tiempo).
            # Confirmado hoy con exportacion real de ETABS (F10 y F12,
            # tabla "Element Forces - Area Shells"): sin el flip, el error
            # contra M12 real es de -188% a -207% (la firma exacta de un
            # signo invertido); con el flip, baja a -11.9% de mediana en F10
            # (P10/P90 -30% a +12%) -- mismo orden de magnitud que M11/M22.
            # Este campo Mxy no se expone hoy en ningun lado del frontend
            # (buildShellMomentReferenceFromCombinedResult en foundation.js
            # nunca lo usa para combinadas) -- se corrige igual, sin efecto
            # visible inmediato, para que quede listo si se decide
            # exponerlo mas adelante.
            Mxy = D * (1 - nu) * wxy
            # AGREGADO (ver conversacion, "8 componentes en combinadas"
            # 2026-08-31): MMax/MMin -- mismo derivado algebraico (formula
            # de Mohr) que ya se usa en la aislada, sin ningun solve nuevo.
            m_avg = (Mx + My) / 2
            m_r = math.sqrt(((Mx - My) / 2) ** 2 + Mxy ** 2)
            MMax = m_avg + m_r
            MMin = m_avg - m_r
            resultados.append({
                'i': i, 'j': j, 'x': i * hx, 'y': j * hy, 'w': w_en(i, j),
                'Mx': Mx, 'My': My, 'Mxy': Mxy, 'MMax': MMax, 'MMin': MMin,
            })

    by_ij = {(e['i'], e['j']): e for e in resultados}

    # AGREGADO (ver conversacion, "8 componentes en combinadas" 2026-08-31):
    # V13/V23 -- misma relacion de equilibrio de placas que ya usa
    # calcular_zapata_shell_completo() (Qx=dMx/dx+dMxy/dy, Qy=dMxy/dx+dMy/dy),
    # PERO con un matiz de signo distinto: alla el campo interno M usado
    # para derivar Q tiene los 3 (Mx/My/Mxy) con el signo "crudo" de
    # Kirchhoff (con el menos), y se expone Mx/My/Mxy YA negados pero Q tal
    # cual sale de la derivada (sin negar). Aca, Mx/My/Mxy en `resultados`
    # YA estan en la convencion "expuesta" (equivalente al negativo de ese
    # M crudo) -- aplicando la misma relacion de equilibrio sobre ESTOS
    # valores da el Q crudo con signo invertido, asi que hay que negar el
    # resultado final para volver a la convencion de ETABS (lo opuesto de
    # como se hace en la aislada, consistente con que aca se nego Mx/My/Mxy
    # y alla no). Confirmado con datos reales de ETABS (F10/F12, tabla
    # "Element Forces - Area Shells"): sin este signo, V13 salia a -200% de
    # error (misma firma de signo invertido que tuvo M12 antes de su fix);
    # con el signo correcto, V13 da -1.4% (F10) y -7.3% (F12) de mediana --
    # mismo orden que M11/M22/M12. V23 (direccion transversal, menos critica
    # para el diseno de estas vigas) sale mas ruidoso (-17% a -93% segun el
    # caso, con pocos puntos de magnitud significativa en zapatas angostas
    # como F12) -- documentado como limitacion conocida, no seguir
    # persiguiendo sin mas casos reales para diagnosticar.
    def _q_en(i, j):
        i0 = max(0, min(nx, i))
        j0 = max(0, min(ny, j))
        return by_ij[(i0, j0)]

    for e in resultados:
        i, j = e['i'], e['j']
        dmx_dx = (_q_en(i + 1, j)['Mx'] - _q_en(i - 1, j)['Mx']) / (2 * hx)
        dmxy_dy = (_q_en(i, j + 1)['Mxy'] - _q_en(i, j - 1)['Mxy']) / (2 * hy)
        dmxy_dx = (_q_en(i + 1, j)['Mxy'] - _q_en(i - 1, j)['Mxy']) / (2 * hx)
        dmy_dy = (_q_en(i, j + 1)['My'] - _q_en(i, j - 1)['My']) / (2 * hy)
        e['V13'] = -(dmx_dx + dmxy_dy)
        e['V23'] = -(dmxy_dx + dmy_dy)
        e['VMax'] = math.hypot(e['V13'], e['V23'])

    def _interp_bilineal(ti, tj):
        ti = max(0.0, min(float(nx), ti))
        tj = max(0.0, min(float(ny), tj))
        i0 = int(math.floor(ti))
        j0 = int(math.floor(tj))
        i1 = min(nx, i0 + 1)
        j1 = min(ny, j0 + 1)
        fx = ti - i0
        fy = tj - j0

        def campo(nombre):
            v00 = by_ij[(i0, j0)][nombre]
            v10 = by_ij[(i1, j0)][nombre]
            v11 = by_ij[(i1, j1)][nombre]
            v01 = by_ij[(i0, j1)][nombre]
            return (v00 * (1 - fx) * (1 - fy) + v10 * fx * (1 - fy)
                    + v11 * fx * fy + v01 * (1 - fx) * fy)

        return {'Mx': campo('Mx'), 'My': campo('My'), 'Mxy': campo('Mxy')}

    momentos_por_columna = []
    for c in columnas_info:
        i_off = (c['bx'] / 2) / hx
        j_off = (c['by'] / 2) / hy
        cara_mas_x = _interp_bilineal(c['i_col'] + i_off, c['j_col'])
        cara_menos_x = _interp_bilineal(c['i_col'] - i_off, c['j_col'])
        cara_mas_y = _interp_bilineal(c['i_col'], c['j_col'] + j_off)
        cara_menos_y = _interp_bilineal(c['i_col'], c['j_col'] - j_off)

        # AGREGADO (ver conversacion, region D -- version ampliada tras
        # prueba en navegador con F12): la primera version solo ocultaba la
        # cara que directamente mira al borde libre, con umbral volado<d.
        # Se encontro con evidencia real (barrido de malla en X y en Y por
        # separado, en F12 Y en F7/aislada) que la cara OPUESTA de la MISMA
        # columna (la que mira al vano, lejos del borde) tambien es
        # numericamente inestable cuando esa columna tiene CUALQUIER cara
        # cerca de un borde libre: refinar la malla en X sube su valor,
        # refinar en Y lo baja, sin converger a un solo numero -- la misma
        # firma de "demasiado cerca de la singularidad de la columna" que
        # ya vimos en la cara marcada. Confirmado en 2 casos independientes
        # (F7 aislada: cara larga estable, cara corta con volado=1.59d
        # inestable en ambos ejes; F12 combinada: la cara del vano, a
        # 1.71d de ese mismo borde, con el mismo patron). Umbral ampliado
        # de 1d a 2d (capta ambos casos con margen) y, si CUALQUIER cara de
        # la columna en un eje queda corta, se ocultan las DOS caras de ESE
        # eje para esa columna (no solo la cercana al borde) -- es una
        # decision conservadora (oculta mas de lo estrictamente necesario)
        # a proposito, para no mostrar un numero que parece preciso pero no
        # lo es.
        REGION_D_FACTOR = 2.0
        volado_mas_x = Lx - (c['x'] + c['bx'] / 2)
        volado_menos_x = c['x'] - c['bx'] / 2
        volado_mas_y = Ly - (c['y'] + c['by'] / 2)
        volado_menos_y = c['y'] - c['by'] / 2

        columna_x_afectada = min(volado_mas_x, volado_menos_x) < REGION_D_FACTOR * d
        columna_y_afectada = min(volado_mas_y, volado_menos_y) < REGION_D_FACTOR * d

        # AGREGADO (ver conversacion, "vanos cortos" -- pendiente resuelto
        # con literatura real, Consensus.app, Fernandez/Mari/Oller 2021):
        # la region D original solo mira distancia a un BORDE LIBRE. Con el
        # caso real F10 (3 columnas) se encontro que un tramo corto entre
        # DOS COLUMNAS VECINAS (sin ningun borde libre cerca) tambien da
        # error grande (45-90%), sin bandera. El parametro que gobierna,
        # segun la literatura real, no es la luz libre completa sino la
        # luz de cortante (~mitad de la luz libre, distancia al punto
        # medio del tramo) sobre el peralte -- mismo umbral factor (2-3d)
        # que el borde libre, por consistencia se usa 2.5d (punto medio
        # del rango de la literatura).
        #
        # ACTUALIZADO (ver conversacion, investigacion final): se separo en
        # una bandera PROPIA (vano_corto_x/y), en vez de fundirla con
        # columna_x/y_afectada (region D por borde libre) -- se investigo a
        # fondo (2 rondas de literatura externa + 5 preguntas directas a
        # Consensus.app, todas cerrando la posibilidad de una formula real
        # tipo BPR para esto) y ademas se confirmo con datos reales que EL
        # METODO RIGIDO (el que de verdad alimenta el diseno, no solo el
        # FEM) TAMBIEN falla feo aca (55-80% contra ETABS real en F10,
        # peor que el propio FEM) -- a diferencia de la region D por borde
        # libre, donde el metodo rigido de respaldo SI es confiable. O sea:
        # en vano corto, ningun metodo automatico (ni FEM ni rigido) sirve
        # -- el frontend debe advertir explicitamente revision manual, no
        # solo "cae de vuelta al metodo rigido" como en region D.
        VANO_CORTO_FACTOR = 2.5
        vano_corto_x = False
        vano_corto_y = False
        for otra in columnas_info:
            if otra is c:
                continue
            if otra['j_col'] == c['j_col'] and otra['i_col'] != c['i_col']:
                dist_medio_x = abs(otra['x'] - c['x']) / 2.0
                if dist_medio_x < VANO_CORTO_FACTOR * d:
                    vano_corto_x = True
            if otra['i_col'] == c['i_col'] and otra['j_col'] != c['j_col']:
                dist_medio_y = abs(otra['y'] - c['y']) / 2.0
                if dist_medio_y < VANO_CORTO_FACTOR * d:
                    vano_corto_y = True

        oculto_x = columna_x_afectada or vano_corto_x
        oculto_y = columna_y_afectada or vano_corto_y

        # AGREGADO (ver conversacion, metodo BPR de Bowles "Foundation
        # Analysis and Design" 5ta ed., Cap. 9, Fig. 9-3 -- verificado
        # numericamente contra su Ejemplo 9-1, no es interpretacion propia
        # sin respaldo). Para el momento TRANSVERSAL (My) cerca de una
        # columna, en vez de leer un punto (que ya sabemos que es una
        # singularidad matematica sin solucion), Bowles promedia My sobre
        # una franja de ancho BPR en la direccion LONGITUDINAL (X, donde
        # estan las columnas), centrada en la columna. Cada lado aporta
        # hasta 0.75*d; si ese lado da hacia un borde LIBRE (no hacia otra
        # columna), el aporte se limita a la distancia real "c" hasta el
        # borde si es menor a 0.75*d -- formula: w + min(c_izq,0.75d) +
        # min(c_der,0.75d). Verificado con los 2 valores reales del libro
        # (0.617m y 1.015m), coincide exacto.
        def _tiene_vecino_en_direccion(direccion):
            for otra in columnas_info:
                if otra is c:
                    continue
                if otra['j_col'] == c['j_col']:
                    if (direccion > 0 and otra['i_col'] > c['i_col']) or \
                       (direccion < 0 and otra['i_col'] < c['i_col']):
                        return True
            return False

        aporte_mas_x = (0.75 * d) if _tiene_vecino_en_direccion(1) else min(volado_mas_x, 0.75 * d)
        aporte_menos_x = (0.75 * d) if _tiene_vecino_en_direccion(-1) else min(volado_menos_x, 0.75 * d)
        bpr_ancho = c['bx'] + aporte_mas_x + aporte_menos_x
        bpr_x_ini = c['x'] - c['bx'] / 2 - aporte_menos_x
        bpr_x_fin = c['x'] + c['bx'] / 2 + aporte_mas_x

        def _my_promedio_franja(tj):
            j_idx = max(0, min(ny, int(round(tj))))
            i_ini = max(0, int(round(bpr_x_ini / hx)))
            i_fin = min(nx, int(round(bpr_x_fin / hx)))
            if i_fin <= i_ini:
                i_fin = i_ini + 1
            valores = [by_ij[(i, j_idx)]['My'] for i in range(i_ini, i_fin + 1)]
            return sum(valores) / len(valores)

        my_bpr_mas_y = _my_promedio_franja(c['j_col'] + j_off)
        my_bpr_menos_y = _my_promedio_franja(c['j_col'] - j_off)
        my_bpr_diseno = max(my_bpr_mas_y, my_bpr_menos_y, key=abs)

        def _valor_o_none(valor, eje_afectado):
            return None if eje_afectado else valor

        mx_mas_x = _valor_o_none(cara_mas_x['Mx'], oculto_x)
        mx_menos_x = _valor_o_none(cara_menos_x['Mx'], oculto_x)
        my_mas_y = _valor_o_none(cara_mas_y['My'], oculto_y)
        my_menos_y = _valor_o_none(cara_menos_y['My'], oculto_y)

        def _envolvente(*valores):
            candidatos = [v for v in valores if v is not None]
            return max(candidatos, key=abs) if candidatos else None

        momentos_por_columna.append({
            'x': c['x'], 'y': c['y'],
            'Mx_diseno': _envolvente(mx_mas_x, mx_menos_x),
            'My_diseno': _envolvente(my_mas_y, my_menos_y),
            # AGREGADO (ver conversacion): caras por separado -- antes solo
            # se exponia el envolvente (el mayor de las 2), que mezcla el
            # lado del volado (hacia el borde libre) con el lado del vano
            # (hacia la columna vecina) en un solo numero. Para comparar
            # cada lado por separado contra ETABS (son fisicamente
            # distintos) hace falta esto -- mismo criterio que ya expone
            # calcular_zapata_shell() para zapatas aisladas.
            'Mx_cara_mas_x': mx_mas_x, 'Mx_cara_menos_x': mx_menos_x,
            'My_cara_mas_y': my_mas_y, 'My_cara_menos_y': my_menos_y,
            # Bandera + valor crudo (aunque no sea confiable) por cara, para
            # que el frontend pueda explicar al usuario POR QUE falta ese
            # numero en vez de solo mostrar un vacio. Bandera es por EJE
            # (columna_x_afectada/columna_y_afectada), no por cara individual
            # -- ver comentario arriba. SEPARADA de vano_corto_x/y (ver
            # comentario arriba): son 2 causas distintas con 2 mensajes
            # distintos para el frontend -- region D borde libre SI tiene
            # respaldo confiable en el metodo rigido, vano corto NO tiene
            # respaldo confiable en NINGUN metodo (advertir revision manual).
            'Mx_cara_mas_x_region_d': columna_x_afectada,
            'Mx_cara_menos_x_region_d': columna_x_afectada,
            'My_cara_mas_y_region_d': columna_y_afectada,
            'My_cara_menos_y_region_d': columna_y_afectada,
            'Mx_cara_mas_x_vano_corto': vano_corto_x, 'Mx_cara_menos_x_vano_corto': vano_corto_x,
            'My_cara_mas_y_vano_corto': vano_corto_y, 'My_cara_menos_y_vano_corto': vano_corto_y,
            'Mx_cara_mas_x_crudo': cara_mas_x['Mx'], 'Mx_cara_menos_x_crudo': cara_menos_x['Mx'],
            'My_cara_mas_y_crudo': cara_mas_y['My'], 'My_cara_menos_y_crudo': cara_menos_y['My'],
            # AGREGADO (ver conversacion, metodo BPR de Bowles): momento
            # transversal promediado sobre la franja efectiva -- disponible
            # SIEMPRE (incluso si My_diseno quedo en None por region D),
            # porque es precisamente la alternativa a leer el punto exacto.
            'My_bpr_mas_y': my_bpr_mas_y, 'My_bpr_menos_y': my_bpr_menos_y,
            'My_bpr_diseno': my_bpr_diseno, 'bpr_ancho': bpr_ancho,
        })

    columnas_ordenadas = sorted(columnas_info, key=lambda c: (c['x'], c['y']))
    mx_hogging = None
    my_hogging = None
    tramos = []
    for c1, c2 in zip(columnas_ordenadas, columnas_ordenadas[1:]):
        if c1['j_col'] == c2['j_col']:
            i_ini = c1['i_col'] + (c1['bx'] / 2) / hx
            i_fin = c2['i_col'] - (c2['bx'] / 2) / hx
            j = c1['j_col']
            n_samples = max(2, int(i_fin - i_ini))
            perfil = [_interp_bilineal(i_ini + k * (i_fin - i_ini) / n_samples, j) for k in range(n_samples + 1)]
            tramos.append({'entre': (c1['x'], c2['x']), 'eje': 'x', 'perfil': perfil})
        elif c1['i_col'] == c2['i_col']:
            j_ini = c1['j_col'] + (c1['by'] / 2) / hy
            j_fin = c2['j_col'] - (c2['by'] / 2) / hy
            i = c1['i_col']
            n_samples = max(2, int(j_fin - j_ini))
            perfil = [_interp_bilineal(i, j_ini + k * (j_fin - j_ini) / n_samples) for k in range(n_samples + 1)]
            tramos.append({'entre': (c1['y'], c2['y']), 'eje': 'y', 'perfil': perfil})
        else:
            continue  # columnas no alineadas -- fuera de alcance de esta version
        valores_mx = [p['Mx'] for p in tramos[-1]['perfil']]
        valores_my = [p['My'] for p in tramos[-1]['perfil']]
        mn_mx, mn_my = min(valores_mx), min(valores_my)
        mx_hogging = mn_mx if mx_hogging is None else min(mx_hogging, mn_mx)
        my_hogging = mn_my if my_hogging is None else min(my_hogging, mn_my)

    return {
        'resultados': resultados, 'hx': hx, 'hy': hy,
        'momentos_por_columna': momentos_por_columna,
        'Mx_hogging': mx_hogging, 'My_hogging': my_hogging,
        'tramos': tramos,
        'd': d,
    }
def _ancho_en_corte_generico(poligono, eje, coord):
    """Ancho (B) y centro (offset del punto medio respecto al origen del
    eje transversal) de un poligono en un corte perpendicular a `eje`, en
    la coordenada `coord` -- mismo algoritmo de "cruces de arista" que
    widthAtCut() (footingMoments.js, lado JS), reimplementado en Python
    para poder samplear columna por columna de la malla FEM (ver
    calcular_zapata_shell_trapezoidal_combinada, parametro `poligono`).

    Devuelve (0.0, 0.0) si el corte no cruza el poligono en al menos 2
    aristas (fuera de la figura).
    """
    cruces = []
    n = len(poligono)
    for i in range(n):
        ax, ay = poligono[i]
        bx, by = poligono[(i + 1) % n]
        a_coord = ax if eje == 'x' else ay
        b_coord = bx if eje == 'x' else by
        if a_coord == b_coord:
            continue
        if not (min(a_coord, b_coord) <= coord <= max(a_coord, b_coord)):
            continue
        t = (coord - a_coord) / (b_coord - a_coord)
        cruce = (ay + t * (by - ay)) if eje == 'x' else (ax + t * (bx - ax))
        cruces.append(cruce)
    if len(cruces) < 2:
        return 0.0, 0.0
    return max(cruces) - min(cruces), (max(cruces) + min(cruces)) / 2.0


def calcular_zapata_shell_trapezoidal_combinada(
    L,                    # longitud total (m), eje X de 0 a L
    B0, B1,                # ancho en x=0 y en x=L (m) -- varia LINEAL entre ambos
                           # (ignorado si se pasa `poligono`)
    h, E, nu,
    q,                     # presion uniforme (Tonf/m2), empuja hacia ARRIBA
    columnas,              # lista de dicts: {'x','y','bx','by'} -- 'y' es el
                           # OFFSET respecto al EJE CENTRAL de la viga (no
                           # absoluto), normalmente 0 (columna centrada, caso
                           # real de Bowles Ejemplo 9-2)
    nx=60, ny=20,
    recubrimiento=0.075,
    poligono=None,         # NUEVO: [(x,y),...] en el MISMO sistema local
                           # (x de 0 a L a lo largo del eje de la viga, y
                           # relativo) que `columnas` -- si se da, el ancho
                           # B(x) se MUESTREA del poligono real en cada
                           # columna de malla en vez de usar la recta
                           # B0+B'*x (ver seccion "ANCHO NO LINEAL" abajo).
):
    """
    Version EXPERIMENTAL para zapata combinada TRAPEZOIDAL (ver conversacion:
    forma #3 en frecuencia real de uso, siguiente paso natural despues de
    rectangular combinada -- misma malla estructurada, solo que el ancho
    varia linealmente en vez de ser constante).

    PROBLEMA DE FONDO que resuelve esta version (ver conversacion): las
    formulas de curvatura de calcular_zapata_shell_combinada (diferencias
    finitas simples, segunda_x/segunda_y/cruzada_xy) asumen una malla
    RECTANGULAR con hx/hy CONSTANTES -- en un trapecio el ancho B(x) varia
    con x, asi que el paso hy(x)=B(x)/ny tambien varia con x, y los nodos
    "mismo j, distinto i" ya NO estan a la misma altura Y fisica. Aplicar la
    formula simple ahi seria incorrecto (no es solo menos preciso, cambia de
    naturaleza: mezclaria curvatura con el efecto geometrico del angulo del
    borde).

    SOLUCION (derivada analiticamente, no una aproximacion ad-hoc): cambio de
    variable a coordenadas normalizadas (xi, eta) = (x, 2y/B(x)) -- en este
    sistema la malla SI es uniforme (xi de 0 a L en pasos hx, eta de -1 a 1
    en pasos 2/ny), y las derivadas fisicas (wxx, wyy, wxy) se recuperan de
    las derivadas en (xi,eta) -- calculadas con diferencias finitas
    estandar sobre la malla uniforme -- via la regla de la cadena:

        k(x) = B'(x)/B(x)  (B'=(B1-B0)/L, constante, B(x) lineal conocida)
        wyy = (4/B(x)^2) * W_etaeta
        wxy = (2/B(x)) * (W_xieta - k*W_eta - eta*k*W_etaeta)
        wxx = W_xixi - 2*eta*k*W_xieta + eta^2*k^2*W_etaeta + 2*eta*k^2*W_eta

    Verificado que el caso degenerado (B0=B1, sin trapecio) da EXACTAMENTE
    los mismos numeros que calcular_zapata_shell_combinada (ver script de
    prueba, no conservado en el repo) -- confirma que la formula general es
    consistente con la ya validada, no una formula nueva sin relacion.

    Alcance de esta primera version (deliberadamente mas simple que
    calcular_zapata_shell_combinada): NO incluye todavia region D, "vanos
    cortos", ni BPR -- esas capas se agregaran despues de validar que el
    campo de curvatura base es correcto (ver Ejemplo 9-2 de Bowles). Columnas
    deben estar alineadas en X (mismo supuesto que la version rectangular).

    ANCHO NO LINEAL (parametro `poligono`, ver conversacion "zapata
    trapezoidal ancho casi constante" 2026-09-05): un caso real de Jack
    (AREA "F2", modelo Modelo_prueba_cimentacion_hola.e2k) mostro que no
    toda zapata de 4 vertices sin vertice reflejo tiene una conicidad
    LINEAL genuina -- ese caso es casi un rectangulo (ancho ~constante en
    el 80% de la longitud) con las 2 esquinas cortadas en diagonal solo
    cerca de las puntas, y forzarlo por el modelo B(x)=B0+B'*x (midiendo
    B0/B1 exactamente en los extremos, donde el ancho real cae a ~0)
    disparaba M11 sin sentido cerca de las puntas.

    Cuando se pasa `poligono`, en vez de la recta cerrada se MUESTREA el
    ancho real B(x) y su centro (offset del punto medio del corte respecto
    al eje y=0) en cada columna de la malla original (0..nx), via
    _ancho_en_corte_generico(). Las columnas de malla cuyo ancho cae por
    debajo de UMBRAL_ANCHO_REL (15%) del ancho maximo se RECORTAN (ni
    siquiera se generan nodos ahi) -- necesario porque un ancho que tiende
    a cero colapsa los nodos de esa columna en un solo punto y arruina la
    malla (decision de Jack: "recortar la malla un poco antes de la punta
    exacta", en vez de modelar la punta exacta como un solo nodo en
    abanico). El resto del calculo (curvatura, apoyos, carga, momento por
    columna) opera sobre la malla YA recortada, con `origen_x` guardando
    el desplazamiento del origen local si el recorte quito columnas del
    lado x=0.

    Con `poligono=None` (uso normal, caso Bowles/F18 ya validado) el
    resultado es IDENTICO al de antes: B(x) sale de la formula cerrada, sin
    recorte (umbral nunca se evalua), y las derivadas k(x)=B'/B(x) y
    B''(x)/B(x) (ver mas abajo) dan exactamente Bprime/B(x) y 0
    respectivamente, igual que el calculo anterior -- verificado, no hay
    cambio de comportamiento para ese caso.

    CORRECCION MATEMATICA DE wxx PARA B(x) GENERICO (no solo lineal): al
    generalizar B(x) via muestreo (ya no necesariamente una recta), se
    re-derivo a mano la formula de wxx por regla de la cadena completa (2
    veces, independiente) y se encontro que la formula anterior
    (`wxx = wxixi - 2*eta*k*wxieta + eta^2*k^2*wetaeta + 2*eta*k^2*weta`)
    es en realidad una ESPECIALIZACION valida solo cuando B(x) es lineal
    (ahi k'(x) = -k(x)^2 identicamente, una identidad algebraica propia de
    B'=constante). La formula general correcta es:

        wxx = wxixi - 2*eta*k*wxieta + eta^2*k^2*wetaeta + eta*(k^2 - k')*weta
        k'(x) = B''(x)/B(x) - k(x)^2   =>   (k^2 - k') = 2*k^2 - B''(x)/B(x)

    Con B(x) genuinamente no lineal, B''(x) (curvatura del propio ANCHO,
    no del desplazamiento) ya no es cero y el termino `-eta*(B''/B)*weta`
    faltaba. Se agrega abajo via `kp_arr` (B''(x)/B(x) por diferencias
    finitas centradas sobre el ancho muestreado) -- para el caso lineal
    cerrado esto da 0 exacto en todo punto (B_arr es una recta exacta), asi
    que no cambia el caso ya validado; para el caso no lineal corrige un
    termino que antes faltaba en la formula.
    """
    d = max(0.0, h - recubrimiento)
    Bprime = (B1 - B0) / L

    def B_de(x):
        return B0 + Bprime * x

    nx = _ajustar_malla_para_columnas(L, [c['x'] for c in columnas], nx)
    hx = L / nx

    # Perfil de ancho/centro por columna de malla ORIGINAL (0..nx), y
    # posible recorte cerca de anchos casi nulos (ver "ANCHO NO LINEAL"
    # arriba). Con poligono=None esto reproduce exactamente B_de(x) sin
    # recorte -- 0 cambio de comportamiento para el caso ya validado.
    anchos_todos = []
    centros_todos = []
    for i in range(nx + 1):
        x = i * hx
        if poligono is not None:
            ancho, centro = _ancho_en_corte_generico(poligono, 'x', x)
        else:
            ancho, centro = B_de(x), 0.0
        anchos_todos.append(ancho)
        centros_todos.append(centro)

    if poligono is not None:
        UMBRAL_ANCHO_REL = 0.15
        ancho_max = max(anchos_todos) if anchos_todos else 0.0
        umbral = UMBRAL_ANCHO_REL * ancho_max
        i_min = 0
        while i_min <= nx and anchos_todos[i_min] < umbral:
            i_min += 1
        i_max = nx
        while i_max >= 0 and anchos_todos[i_max] < umbral:
            i_max -= 1
        if i_max <= i_min:
            raise ValueError('El poligono no tiene un ancho utilizable en ningun punto -- revisar la geometria.')
    else:
        i_min, i_max = 0, nx

    indices = list(range(i_min, i_max + 1))
    nx_real = len(indices) - 1
    origen_x = indices[0] * hx
    B_arr = [anchos_todos[i] for i in indices]
    centro_arr = [centros_todos[i] for i in indices]

    # Pendiente local k(x)=B'(x)/B(x) y curvatura local B''(x)/B(x) --
    # diferencias finitas sobre el ancho ya muestreado/recortado (centradas
    # en el interior, un solo lado en los extremos). Ver docstring, seccion
    # "CORRECCION MATEMATICA DE wxx".
    k_arr = []
    kp_arr = []
    for idx in range(nx_real + 1):
        Bi_idx = B_arr[idx]
        if nx_real < 1:
            dB = 0.0
        elif idx == 0:
            dB = (B_arr[1] - B_arr[0]) / hx
        elif idx == nx_real:
            dB = (B_arr[idx] - B_arr[idx - 1]) / hx
        else:
            dB = (B_arr[idx + 1] - B_arr[idx - 1]) / (2 * hx)
        if idx == 0 or idx == nx_real or nx_real < 2:
            d2B = 0.0
        else:
            d2B = (B_arr[idx + 1] - 2 * Bi_idx + B_arr[idx - 1]) / (hx * hx)
        k_arr.append(dB / Bi_idx if Bi_idx > 1e-9 else 0.0)
        kp_arr.append(d2B / Bi_idx if Bi_idx > 1e-9 else 0.0)

    ops.wipe()
    ops.model('basic', '-ndm', 3, '-ndf', 6)
    sec_tag = 1
    ops.section('ElasticMembranePlateSection', sec_tag, E, nu, h, 0.0, 1.0)

    d_eta = 2.0 / ny
    node_tag = 1
    node_map = {}
    for j in range(ny + 1):
        eta_j = -1.0 + j * d_eta
        for i in range(nx_real + 1):
            x_abs = origen_x + i * hx
            Bi = B_arr[i]
            y = centro_arr[i] + eta_j * Bi / 2.0
            ops.node(node_tag, float(x_abs), float(y), 0.0)
            node_map[(i, j)] = node_tag
            node_tag += 1

    ele_tag = 1
    elementos_ij = []
    for j in range(ny):
        for i in range(nx_real):
            n1, n2 = node_map[(i, j)], node_map[(i + 1, j)]
            n3, n4 = node_map[(i + 1, j + 1)], node_map[(i, j + 1)]
            ops.element('ShellDKGQ', ele_tag, n1, n2, n3, n4, sec_tag)
            elementos_ij.append((ele_tag, (i, j), (n1, n2, n3, n4)))
            ele_tag += 1

    # Restriccion de columnas: dado x ABSOLUTO (mismo sistema que llega en
    # `columnas`), se ubica la columna de malla LOCAL mas cercana (restando
    # el origen si la malla fue recortada) y, con el offset y respecto al
    # eje/centro real de esa columna, se despeja j_col.
    columnas_info = []
    for col in columnas:
        i_col_abs = round(col['x'] / hx)
        i_col = max(0, min(nx_real, i_col_abs - i_min))
        Bi = B_arr[i_col]
        eta_col = (2.0 * (col.get('y', 0.0) - centro_arr[i_col])) / Bi
        j_col = round((eta_col + 1.0) * ny / 2.0)
        j_col = max(0, min(ny, j_col))
        columna_node = node_map[(i_col, j_col)]
        ops.fix(columna_node, 1, 1, 1, 1, 1, 1)
        columnas_info.append({
            'i_col': i_col, 'j_col': j_col, 'node': columna_node,
            'bx': col['bx'], 'by': col['by'], 'x': col['x'], 'y': col.get('y', 0.0),
        })

    # Carga uniforme: tributaria por AREA REAL de cada elemento (no
    # hx*hy constante, que ya no aplica con ancho variable) -- se reparte
    # 1/4 del area de cada elemento a cada uno de sus 4 nodos, acumulando
    # las contribuciones de los elementos vecinos que comparten nodo (misma
    # idea que el reparto por area tributaria de una malla rectangular,
    # generalizada a cuadrilateros de forma arbitraria).
    def area_shoelace(pts):
        s = 0.0
        n = len(pts)
        for a in range(n):
            x1, y1 = pts[a]
            x2, y2 = pts[(a + 1) % n]
            s += x1 * y2 - x2 * y1
        return abs(s) / 2.0

    carga_nodal = {tag: 0.0 for tag in node_map.values()}
    for ele_tag_, (i, j), (n1, n2, n3, n4) in elementos_ij:
        pts = []
        for (ii, jj) in [(i, j), (i + 1, j), (i + 1, j + 1), (i, j + 1)]:
            eta_jj = -1.0 + jj * d_eta
            xx = ii * hx
            yy = centro_arr[ii] + eta_jj * B_arr[ii] / 2.0
            pts.append((xx, yy))
        area = area_shoelace(pts)
        carga_por_nodo = q * area / 4.0
        for tag in (n1, n2, n3, n4):
            carga_nodal[tag] += carga_por_nodo

    ops.timeSeries('Linear', 1)
    ops.pattern('Plain', 1, 1)
    for tag, fz in carga_nodal.items():
        ops.load(tag, 0.0, 0.0, fz, 0.0, 0.0, 0.0)

    ops.system('BandGeneral')
    ops.numberer('RCM')
    ops.constraints('Transformation')
    ops.integrator('LoadControl', 1.0)
    ops.algorithm('Linear')
    ops.analysis('Static')
    ok = ops.analyze(1)
    if ok != 0:
        raise RuntimeError(f'El analisis no convergio (codigo {ok}) -- revisar apoyos/carga.')

    D = E * h ** 3 / (12 * (1 - nu ** 2))

    def w_en(i, j):
        # AGREGADO (ver conversacion, "bug de borde" 2026-09-03): si (i,j)
        # cae fuera del dominio real [0,nx]x[0,ny], se extrapola
        # LINEALMENTE desde el nodo mas cercano y su vecino OPUESTO
        # (equivale a asumir curvatura CERO en el borde -- la
        # aproximacion correcta de un borde libre de Kirchhoff) en vez de
        # sustituir por el valor del propio nodo (clamp silencioso de
        # antes). Esa version anterior, dentro de la formula de segunda
        # derivada, terminaba aproximando dw/dy dividido OTRA VEZ por hy
        # -- crece SIN LIMITE al refinar la malla en vez de converger a
        # un valor chico. Confirmado con un caso real: la ultima fila de
        # la malla daba -227 en vez de un valor chico como el resto de
        # esa zona (ver memoria del proyecto, "bug de borde"). Para
        # cualquier punto YA interior (el caso normal) el resultado es
        # IDENTICO a antes -- este cambio solo afecta la fila/columna
        # exterior de la malla.
        i_c = max(0, min(nx_real, i))
        j_c = max(0, min(ny, j))
        if i_c == i and j_c == j:
            return ops.nodeDisp(node_map[(i_c, j_c)], 3)
        i_op = max(0, min(nx_real, 2 * i_c - i))
        j_op = max(0, min(ny, 2 * j_c - j))
        return 2 * ops.nodeDisp(node_map[(i_c, j_c)], 3) - ops.nodeDisp(node_map[(i_op, j_op)], 3)

    def W_xi(i, j):
        return (w_en(i + 1, j) - w_en(i - 1, j)) / (2 * hx)

    def W_eta(i, j):
        return (w_en(i, j + 1) - w_en(i, j - 1)) / (2 * d_eta)

    def W_xixi(i, j):
        return (w_en(i + 1, j) - 2 * w_en(i, j) + w_en(i - 1, j)) / (hx * hx)

    def W_etaeta(i, j):
        return (w_en(i, j + 1) - 2 * w_en(i, j) + w_en(i, j - 1)) / (d_eta * d_eta)

    def W_xieta(i, j):
        return (w_en(i + 1, j + 1) - w_en(i + 1, j - 1) - w_en(i - 1, j + 1) + w_en(i - 1, j - 1)) / (4 * hx * d_eta)

    resultados = []
    for j in range(ny + 1):
        eta = -1.0 + j * d_eta
        for i in range(nx_real + 1):
            x_abs = origen_x + i * hx
            Bi = B_arr[i]
            k = k_arr[i]
            kp = kp_arr[i]

            w_xixi = W_xixi(i, j)
            w_etaeta = W_etaeta(i, j)
            w_xieta = W_xieta(i, j)
            w_eta = W_eta(i, j)

            wyy = (4.0 / Bi ** 2) * w_etaeta
            wxy = (2.0 / Bi) * (w_xieta - k * w_eta - eta * k * w_etaeta)
            wxx = (w_xixi - 2 * eta * k * w_xieta + eta ** 2 * k ** 2 * w_etaeta
                   + eta * (k ** 2 - kp) * w_eta)

            # AGREGADO (ver conversacion, "orientacion/signo trapezoidal"
            # 2026-08-31) -- PARCHE EMPIRICO, causa raiz NO identificada del
            # todo (ver intento de derivacion completa mas abajo, INTENTADO
            # Y DESCARTADO con evidencia real 2026-09-06): sin el flip de
            # abajo, Mx/My/Mxy salen con el signo EXACTAMENTE invertido
            # respecto a M11/M22/M12 reales de ETABS (F18, confirmado punto
            # por punto en un perfil completo a lo largo de la viga, no un
            # caso aislado: -204.6%/-193.6% de mediana). Se investigo a
            # fondo antes de aplicar esto a ciegas: formula matematica
            # re-derivada 2 veces a mano (coincide exacta con el codigo);
            # caso degenerado (B0=B1) da resultados IDENTICOS a
            # calcular_zapata_shell_combinada SOLO sin flip (verificado
            # exacto, diferencia 0.0, tras corregir un bug de convencion de
            # ejes Y en el script de prueba); barrido gradual de (B1-B0)
            # descarta un bug de umbral/malla.
            #
            # INTENTO DE CAUSA RAIZ (2026-09-06, DESCARTADO con datos
            # reales -- ver conversacion "afina la precision"): el eje
            # local "1" de un shell (el que define M11) por defecto es la
            # direccion del lado nodo1->nodo2 del elemento, no el eje
            # global X (fuente: CSI Analysis Reference Manual, "Shell Local
            # Coordinate System"; documentacion de OpenSees para elementos
            # shell equivalentes) -- en esta malla ese lado se inclina un
            # angulo real cuando el ancho/centro cambia entre columnas
            # vecinas. Se implemento una transformacion COMPLETA de
            # momentos (circulo de Mohr) usando ese angulo real en vez de
            # un flip binario. Con datos de ETABS en un punto de conicidad
            # REAL de F2 (cerca de una punta, ancho cayendo de 2.10 a 1.83
            # en poco espacio, angulo calculado ahi: -55.8 GRADOS -- una
            # distorsion extrema, no una inclinacion suave) la rotacion dio
            # signo CONTRARIO a ETABS (-0.334 vs +0.728 real), mientras que
            # el flip binario simple (sin rotacion) SI acertaba el signo
            # (+0.224 vs +0.728, mismo signo, aunque con magnitud menor).
            # Conclusion: la formula de rotacion, aunque matematicamente
            # bien fundamentada para una distorsion suave, se vuelve
            # POCO CONFIABLE (empeora en vez de mejorar) en la zona de
            # conicidad extrema cerca de una punta casi degenerada --
            # descartada, se vuelve al flip binario simple de abajo.
            #
            # Aplicado como flip GLOBAL (Mx, My Y Mxy, los 3 negados) --
            # validado con el UNICO caso real disponible al momento del
            # parche original (F18: M11 -204.6% -> +4.6%, M22 -193.6% ->
            # -4.3%, M12 -179.4% -> -20.6%).
            #
            # RE-VALIDADO (ver conversacion, caso real F2, 2026-09-05/06) --
            # SOLO para poligono=None: F2 (via `poligono`, ancho no lineal
            # sube-baja) mostro que el flip NO generaliza -- comparado
            # contra ETABS real en 4 puntos distintos (zona de ancho casi
            # constante Y zona de conicidad real cerca de una punta), el
            # camino `poligono` da signo correcto SIN el flip; el flip
            # (aplicado sin condicion) da signo contrario. La variable que
            # separa ambos casos no es B0 vs B1 (monotonico) sino si
            # `poligono` viene o no: el flip queda restringido al camino
            # cerrado B0/B1 (poligono=None, el UNICO validado con el flip),
            # y el camino de `poligono` usa el signo SIN flip, igual que
            # calcular_zapata_shell_poligono_combinada. Sigue siendo un
            # parche empirico -- la causa raiz exacta del porque `poligono`
            # necesita el signo opuesto al camino cerrado sigue sin
            # identificarse del todo (el intento de explicarlo via rotacion
            # de eje local, arriba, no se sostuvo con datos reales) -- pero
            # la regla practica (poligono => sin flip) SI esta confirmada
            # con 4 puntos reales de ETABS, cubriendo tanto zona de ancho
            # constante como de conicidad real.
            signo_flip = -1.0 if poligono is None else 1.0
            Mx = signo_flip * D * (wxx + nu * wyy)
            My = signo_flip * D * (wyy + nu * wxx)
            # Mxy NO lleva signo_flip -- ya coincidia entre esta funcion y
            # calcular_zapata_shell_poligono_combinada (ambas +D*(1-nu)*wxy)
            # incluso ANTES de este cambio, a diferencia de Mx/My.
            Mxy = D * (1 - nu) * wxy
            # AGREGADO (ver conversacion, "8 componentes"): MMax/MMin, mismo
            # derivado algebraico (Mohr) que las demas formas -- sin V13/V23
            # a proposito (cortante no resuelto todavia para esta malla, ver
            # conversacion).
            m_avg = (Mx + My) / 2
            m_r = math.sqrt(((Mx - My) / 2) ** 2 + Mxy ** 2)
            y_abs = centro_arr[i] + eta * Bi / 2.0
            resultados.append({
                'i': i, 'j': j, 'x': x_abs, 'y': y_abs, 'w': w_en(i, j),
                'Mx': Mx, 'My': My, 'Mxy': Mxy, 'MMax': m_avg + m_r, 'MMin': m_avg - m_r,
            })

    by_ij = {(e['i'], e['j']): e for e in resultados}

    # AGREGADO (ver conversacion, "completar cortante trapezoidal"
    # 2026-09-06): V13/V23/VMax -- NUNCA implementados antes para esta
    # forma (docstring historico: "coordenadas normalizadas no uniformes
    # en Y, requeriria una transformacion de mayor orden que no se
    # completo"). Se resuelve con la MISMA relacion de equilibrio de
    # placas ya validada en calcular_zapata_shell_combinada/calcular_
    # zapata_shell_poligono_combinada (Qx=dMx/dx+dMxy/dy, Qy=dMxy/dx+dMy/
    # dy sobre el campo de MOMENTOS ya resuelto, no una derivada nueva de
    # w), pasando esas derivadas por la MISMA regla de la cadena (xi,eta)
    # que ya usa wxx/wyy/wxy arriba -- aca aplicada a Mx/My/Mxy en vez de
    # a w:
    #     dF/dx = F_xi - eta*k*F_eta
    #     dF/dy = (2/B) * F_eta
    # con F_xi/F_eta por diferencias finitas centradas sobre la malla
    # (i,j) ya resuelta. Boundary: clamp simple al indice valido (no la
    # extrapolacion de curvatura-cero de w_en) -- igual criterio que ya
    # usan las demas formas para este mismo calculo, valido porque aca se
    # deriva un campo YA suave (M), no w directamente.
    #
    # SIGNO -- CONFIRMADO invertido contra ETABS real (ver conversacion,
    # caso F2, 2026-09-06): Jack encontro que el perfil de V13 salia en
    # espejo respecto a ETABS (de la columna izquierda hacia el medio
    # negativo en nuestro sistema / positivo en ETABS, y viceversa del
    # lado derecho) -- la firma clasica de un signo global invertido en
    # TODO el campo, no un error de forma/magnitud puntual. Mismo patron
    # que ya se dio 2 veces en este archivo (V13 en combinada/poligono-
    # combinada: "sin el signo, V13 salia a -200%... con el signo
    # correcto, -1.4%/-7.3%"). Se niega V13 y V23 para igualar la
    # convencion de ETABS.
    def _campo_en(i, j, nombre):
        i_c = max(0, min(nx_real, i))
        j_c = max(0, min(ny, j))
        return by_ij[(i_c, j_c)][nombre]

    for e in resultados:
        i, j = e['i'], e['j']
        eta_pt = -1.0 + j * d_eta
        Bi_pt = B_arr[i]
        k_pt = k_arr[i]

        dmx_dxi = (_campo_en(i + 1, j, 'Mx') - _campo_en(i - 1, j, 'Mx')) / (2 * hx)
        dmx_deta = (_campo_en(i, j + 1, 'Mx') - _campo_en(i, j - 1, 'Mx')) / (2 * d_eta)
        dmxy_dxi = (_campo_en(i + 1, j, 'Mxy') - _campo_en(i - 1, j, 'Mxy')) / (2 * hx)
        dmxy_deta = (_campo_en(i, j + 1, 'Mxy') - _campo_en(i, j - 1, 'Mxy')) / (2 * d_eta)
        dmy_deta = (_campo_en(i, j + 1, 'My') - _campo_en(i, j - 1, 'My')) / (2 * d_eta)

        dmx_dx = dmx_dxi - eta_pt * k_pt * dmx_deta
        dmxy_dy = (2.0 / Bi_pt) * dmxy_deta
        dmxy_dx = dmxy_dxi - eta_pt * k_pt * dmxy_deta
        dmy_dy = (2.0 / Bi_pt) * dmy_deta

        e['V13'] = -(dmx_dx + dmxy_dy)
        e['V23'] = -(dmxy_dx + dmy_dy)
        e['VMax'] = math.hypot(e['V13'], e['V23'])

    def _interp_bilineal(ti, tj):
        ti = max(0.0, min(float(nx_real), ti))
        tj = max(0.0, min(float(ny), tj))
        i0, j0 = int(math.floor(ti)), int(math.floor(tj))
        i1, j1 = min(nx_real, i0 + 1), min(ny, j0 + 1)
        fx, fy = ti - i0, tj - j0

        def campo(nombre):
            v00, v10 = by_ij[(i0, j0)][nombre], by_ij[(i1, j0)][nombre]
            v11, v01 = by_ij[(i1, j1)][nombre], by_ij[(i0, j1)][nombre]
            return (v00 * (1 - fx) * (1 - fy) + v10 * fx * (1 - fy)
                    + v11 * fx * fy + v01 * (1 - fx) * fy)

        return {'Mx': campo('Mx'), 'My': campo('My'), 'Mxy': campo('Mxy')}

    # AGREGADO (ver conversacion, integracion completa trapezoidal): region
    # D, "vanos cortos" y BPR -- mismo criterio y umbrales que
    # calcular_zapata_shell_combinada (ver esa funcion para el detalle y
    # las referencias), adaptados a que el ancho B(x) ya no es constante.
    # X (longitudinal): los bordes libres estan en el extremo UTIL de la
    # malla (origen_x / origen_x+nx_real*hx) -- con poligono=None esto
    # coincide con 0/L exactamente (sin recorte). Y (transversal) usa
    # B(x_columna)/2 alrededor del CENTRO real de esa columna (centro_arr,
    # 0 si no hay poligono) como "Ly/2" local, en vez de una constante
    # alrededor de y=0.
    def hy_de(i_local):
        return B_arr[i_local] / ny

    x_ini_malla = origen_x
    x_fin_malla = origen_x + nx_real * hx

    momentos_por_columna = []
    for c in columnas_info:
        x_col = c['x']
        i_col = c['i_col']
        Bi_col = B_arr[i_col]
        centro_col = centro_arr[i_col]
        i_off = (c['bx'] / 2) / hx
        j_off = (c['by'] / 2) / hy_de(i_col)

        cara_mas_x = _interp_bilineal(c['i_col'] + i_off, c['j_col'])
        cara_menos_x = _interp_bilineal(c['i_col'] - i_off, c['j_col'])

        REGION_D_FACTOR = 2.0
        volado_mas_x = x_fin_malla - (x_col + c['bx'] / 2)
        volado_menos_x = (x_col - c['bx'] / 2) - x_ini_malla
        volado_mas_y = Bi_col / 2 - (c['y'] - centro_col) - c['by'] / 2
        volado_menos_y = Bi_col / 2 + (c['y'] - centro_col) - c['by'] / 2

        columna_x_afectada = min(volado_mas_x, volado_menos_x) < REGION_D_FACTOR * d
        columna_y_afectada = min(volado_mas_y, volado_menos_y) < REGION_D_FACTOR * d

        # Bandera SEPARADA de vano corto (ver misma justificacion y misma
        # conclusion final -- ni FEM ni metodo rigido son confiables ahi --
        # en calcular_zapata_shell_combinada() arriba).
        VANO_CORTO_FACTOR = 2.5
        vano_corto_x = False
        for otra in columnas_info:
            if otra is c:
                continue
            dist_medio_x = abs(otra['x'] - c['x']) / 2.0
            if dist_medio_x < VANO_CORTO_FACTOR * d:
                vano_corto_x = True

        oculto_x = columna_x_afectada or vano_corto_x

        def _tiene_vecino_en_direccion(direccion):
            for otra in columnas_info:
                if otra is c:
                    continue
                if (direccion > 0 and otra['x'] > c['x']) or (direccion < 0 and otra['x'] < c['x']):
                    return True
            return False

        aporte_mas_x = (0.75 * d) if _tiene_vecino_en_direccion(1) else min(volado_mas_x, 0.75 * d)
        aporte_menos_x = (0.75 * d) if _tiene_vecino_en_direccion(-1) else min(volado_menos_x, 0.75 * d)
        bpr_ancho = c['bx'] + aporte_mas_x + aporte_menos_x
        bpr_x_ini = x_col - c['bx'] / 2 - aporte_menos_x
        bpr_x_fin = x_col + c['bx'] / 2 + aporte_mas_x

        def _my_promedio_franja(tj):
            j_idx = max(0, min(ny, int(round(tj))))
            i_ini = max(0, int(round((bpr_x_ini - origen_x) / hx)))
            i_fin = min(nx_real, int(round((bpr_x_fin - origen_x) / hx)))
            if i_fin <= i_ini:
                i_fin = i_ini + 1
            valores = [by_ij[(i, j_idx)]['My'] for i in range(i_ini, i_fin + 1)]
            return sum(valores) / len(valores)

        my_bpr_mas_y = _my_promedio_franja(c['j_col'] + j_off)
        my_bpr_menos_y = _my_promedio_franja(c['j_col'] - j_off)
        my_bpr_diseno = max(my_bpr_mas_y, my_bpr_menos_y, key=abs)

        mx_mas_x = None if oculto_x else cara_mas_x['Mx']
        mx_menos_x = None if oculto_x else cara_menos_x['Mx']

        def _envolvente(*valores):
            candidatos = [v for v in valores if v is not None]
            return max(candidatos, key=abs) if candidatos else None

        momentos_por_columna.append({
            'x': c['x'], 'y': c['y'],
            'Mx_diseno': _envolvente(mx_mas_x, mx_menos_x),
            'Mx_cara_mas_x': mx_mas_x, 'Mx_cara_menos_x': mx_menos_x,
            'Mx_cara_mas_x_region_d': columna_x_afectada,
            'Mx_cara_menos_x_region_d': columna_x_afectada,
            'My_cara_mas_y_region_d': columna_y_afectada,
            'My_cara_menos_y_region_d': columna_y_afectada,
            'Mx_cara_mas_x_vano_corto': vano_corto_x, 'Mx_cara_menos_x_vano_corto': vano_corto_x,
            'Mx_cara_mas_x_crudo': cara_mas_x['Mx'], 'Mx_cara_menos_x_crudo': cara_menos_x['Mx'],
            'My_bpr_mas_y': my_bpr_mas_y, 'My_bpr_menos_y': my_bpr_menos_y,
            'My_bpr_diseno': my_bpr_diseno, 'bpr_ancho': bpr_ancho,
        })

    return {
        'resultados': resultados, 'hx': hx, 'd_eta': d_eta,
        'momentos_por_columna': momentos_por_columna,
        'd': d, 'nx': nx_real, 'ny': ny,
        'origen_x': origen_x,
    }

def calcular_zapata_shell_L_combinada(
    Lx, Ly,                          # bounding box COMPLETO (incluye el rincon faltante)
    notch_x, notch_y,                 # corte del rincon faltante, coordenadas LOCALES (0..Lx, 0..Ly)
    notch_es_max_x, notch_es_max_y,    # que esquina del bounding box falta (ver splitFootingIntoLegs, footingMoments.js)
    h, E, nu, q,
    columnas,                          # lista de dicts: {'x','y','bx','by'} -- posicion ABSOLUTA en el bounding box
    nx=60, ny=60,
    recubrimiento=0.075,
    columna_altura=3.0,      # AGREGADO (ver conversacion, "pendientes tecnicos" 2026-08-31):
                              # mismo criterio hibrido de columna real que ya se aplico a
                              # calcular_zapata_shell_combinada() -- ver esa funcion para el
                              # porque (mejora el reparto de carga entre columnas fuera de
                              # Region D, sin tocar las que si estan en Region D).
    columna_E=None,
):
    """
    Version EXPERIMENTAL para zapata combinada en L (ver conversacion: forma
    #4 en prioridad, mas relevante en Peru por columnas de esquina/lindero
    que Bowles para su contexto). Enfoque de malla mas simple que uno
    "multi-bloque": UNA sola malla rectangular uniforme sobre TODO el
    bounding box (misma tecnica ya validada de calcular_zapata_shell_
    combinada), pero SIN crear elementos en el rincon faltante -- en vez de
    generar 2 mallas separadas y coserlas en la union (que requeriria hacer
    coincidir espaciados de malla en la interfaz), se reutiliza la MISMA
    malla/formula de curvatura de siempre, y el borde del hueco se trata
    exactamente igual que ya se trata un borde libre exterior: un vecino
    que cae fuera del dominio real (sea porque esta fuera del bounding box,
    sea porque esta dentro del rincon faltante) se sustituye por el valor
    del propio nodo (pendiente cero), mismo criterio que w_en() ya usa en
    todos los demas solvers de este archivo.

    Nodos que quedan COMPLETAMENTE dentro del rincon faltante (sin ningun
    elemento real que los toque) NO se crean en OpenSees -- si se dejaran
    con 6 GDL libres y sin ningun elemento, la matriz de rigidez queda
    singular ahi (mismo problema, por otra razon, que el que se investigo
    esta sesion en el motor sismico propio del sistema con "nodos sin
    rigidez").

    ACTUALIZADO (ver conversacion: caracterizacion numerica del rincon con
    y sin columna cerca): se investigo con una L sintetica de control si el
    vertice reflejo produce una singularidad geometrica NUEVA (distinta a
    la de un apoyo puntual). Con la columna LEJOS del rincon, un barrido de
    malla en 3 direcciones (diagonal + los 2 bordes rectos del hueco) no
    mostro nada anormal -- valores acotados, sin crecimiento sistematico al
    refinar. Con la columna CERCA del rincon (caso real de columna de
    esquina) SI aparecio inestabilidad -- pero con la MISMA firma ya
    conocida de un apoyo puntual pegado a un borde libre (no convergencia,
    cambios de signo al refinar malla), simplemente presente en 2 bordes a
    la vez. Conclusion: no hace falta teoria de singularidades nueva (tipo
    Williams 1952) -- el mismo criterio de region D que ya usamos en las
    demas formas, extendido para revisar TAMBIEN la distancia directa al
    VERTICE del rincon (ademas de los volados rectos hacia cada borde),
    cubre el caso real. Ver bloque de region D mas abajo, en el armado de
    `momentos_por_columna` -- validado exacto contra el caso degenerado
    (notch de area cero) del solver rectangular.

    Sigue SIN BPR para la columna de esquina (repartir su momento sobre un
    ancho efectivo, como Bowles hace para columnas normales) -- eso seguiria
    siendo una formula sin respaldo de libro si se inventara sin mas
    investigacion; por ahora esa columna simplemente pierde el dato (None)
    cuando cae en region D, sin alternativa, igual que las demas formas
    cuando no hay FEM confiable.
    """
    d = max(0.0, h - recubrimiento)

    # AGREGADO (ver conversacion, bug real encontrado al validar el caso
    # degenerado): faltaba esto -- mismo fix ya usado en
    # calcular_zapata_shell_combinada/_trapezoidal_combinada, sin el cual
    # una columna puede quedar "flotando" hasta hy/2 lejos del nodo mas
    # cercano, dando un modelo distinto (no comparable) segun donde caiga
    # por casualidad.
    nx = _ajustar_malla_para_columnas(Lx, [c['x'] for c in columnas], nx)
    ny = _ajustar_malla_para_columnas(Ly, [c['y'] for c in columnas], ny)

    ops.wipe()
    ops.model('basic', '-ndm', 3, '-ndf', 6)
    sec_tag = 1
    ops.section('ElasticMembranePlateSection', sec_tag, E, nu, h, 0.0, 1.0)

    hx = Lx / nx
    hy = Ly / ny

    i_notch = round(notch_x / hx)
    j_notch = round(notch_y / hy)
    i_notch_ini, i_notch_fin = (i_notch, nx) if notch_es_max_x else (0, i_notch)
    j_notch_ini, j_notch_fin = (j_notch, ny) if notch_es_max_y else (0, j_notch)

    def en_notch(i, j):
        """(i,j) = indice de ELEMENTO (0..nx-1, 0..ny-1)."""
        return i_notch_ini <= i < i_notch_fin and j_notch_ini <= j < j_notch_fin

    # Primero se decide que elementos existen, y de ahi que nodos son
    # "reales" (tocados por al menos un elemento) -- nunca al reves, para
    # no crear nodos huerfanos sin rigidez.
    elementos_ij = [(i, j) for j in range(ny) for i in range(nx) if not en_notch(i, j)]
    nodos_reales = set()
    for (i, j) in elementos_ij:
        nodos_reales.update([(i, j), (i + 1, j), (i + 1, j + 1), (i, j + 1)])

    node_tag = 1
    node_map = {}
    for (i, j) in sorted(nodos_reales):
        ops.node(node_tag, float(i * hx), float(j * hy), 0.0)
        node_map[(i, j)] = node_tag
        node_tag += 1

    ele_tag = 1
    for (i, j) in elementos_ij:
        n1, n2 = node_map[(i, j)], node_map[(i + 1, j)]
        n3, n4 = node_map[(i + 1, j + 1)], node_map[(i, j + 1)]
        ops.element('ShellDKGQ', ele_tag, n1, n2, n3, n4, sec_tag)
        ele_tag += 1

    # AGREGADO (ver conversacion, "pendientes tecnicos" 2026-08-31): mismo
    # criterio de Region D que se usa mas abajo para decidir que caras
    # ocultar, replicado ACA (antes del analisis) para decidir el TIPO DE
    # APOYO de cada columna -- ver docstring de calcular_zapata_shell_
    # combinada para el porque completo (columna real fuera de Region D
    # mejora el reparto de carga; dentro de Region D, sin cambios).
    def _en_rango_notch_y_pre(y):
        return y >= notch_y if notch_es_max_y else y <= notch_y

    def _en_rango_notch_x_pre(x):
        return x >= notch_x if notch_es_max_x else x <= notch_x

    E_col = columna_E if columna_E is not None else E
    G_col = E_col / (2 * (1 + nu))
    top_node_tag = max(node_map.values()) + 1

    columnas_info = []
    for col in columnas:
        i_col = round(col['x'] / hx)
        j_col = round(col['y'] / hy)
        if (i_col, j_col) not in node_map:
            raise ValueError(
                f"Columna en ({col['x']}, {col['y']}) cae dentro (o pegada) del rincon "
                "faltante de la L -- no hay material real ahi."
            )
        columna_node = node_map[(i_col, j_col)]

        if _en_rango_notch_y_pre(col['y']):
            frontera_x_max, frontera_x_min = (notch_x, 0.0) if notch_es_max_x else (Lx, notch_x)
        else:
            frontera_x_max, frontera_x_min = Lx, 0.0
        if _en_rango_notch_x_pre(col['x']):
            frontera_y_max, frontera_y_min = (notch_y, 0.0) if notch_es_max_y else (Ly, notch_y)
        else:
            frontera_y_max, frontera_y_min = Ly, 0.0

        volado_mas_x = frontera_x_max - (col['x'] + col['bx'] / 2)
        volado_menos_x = (col['x'] - col['bx'] / 2) - frontera_x_min
        volado_mas_y = frontera_y_max - (col['y'] + col['by'] / 2)
        volado_menos_y = (col['y'] - col['by'] / 2) - frontera_y_min
        columna_x_afectada_pre = min(volado_mas_x, volado_menos_x) < 2.0 * d
        columna_y_afectada_pre = min(volado_mas_y, volado_menos_y) < 2.0 * d
        dist_rincon_pre = math.sqrt((col['x'] - notch_x) ** 2 + (col['y'] - notch_y) ** 2)
        if dist_rincon_pre < 2.0 * d:
            columna_x_afectada_pre = True
            columna_y_afectada_pre = True

        if columna_x_afectada_pre or columna_y_afectada_pre:
            ops.fix(columna_node, 1, 1, 1, 1, 1, 1)
        else:
            b_col, h_col = col['bx'], col['by']
            A_col = b_col * h_col
            Iz_col = b_col * h_col ** 3 / 12
            Iy_col = h_col * b_col ** 3 / 12
            J_col = 0.141 * min(b_col, h_col) ** 3 * max(b_col, h_col)
            top_node = top_node_tag
            top_node_tag += 1
            ops.node(top_node, col['x'], col['y'], columna_altura)
            ops.fix(top_node, 1, 1, 1, 1, 1, 1)
            ops.geomTransf('Linear', top_node, 1.0, 0.0, 0.0)
            ops.element('elasticBeamColumn', top_node + 1000000, columna_node, top_node,
                        A_col, E_col, G_col, J_col, Iy_col, Iz_col, top_node)

        columnas_info.append({
            'i_col': i_col, 'j_col': j_col, 'node': columna_node,
            'bx': col['bx'], 'by': col['by'], 'x': col['x'], 'y': col['y'],
        })

    # Carga tributaria por AREA REAL de cada elemento (igual que la
    # trapezoidal) -- mas robusto que el truco wx*wy=0.5 en el borde, que
    # asume un vecindario rectangular completo (ya no es cierto junto al
    # rincon faltante).
    ops.timeSeries('Linear', 1)
    ops.pattern('Plain', 1, 1)
    carga_nodal = {tag: 0.0 for tag in node_map.values()}
    carga_por_elemento = q * hx * hy / 4.0
    for (i, j) in elementos_ij:
        for esquina in [(i, j), (i + 1, j), (i + 1, j + 1), (i, j + 1)]:
            carga_nodal[node_map[esquina]] += carga_por_elemento
    for tag, fz in carga_nodal.items():
        ops.load(tag, 0.0, 0.0, fz, 0.0, 0.0, 0.0)

    ops.system('BandGeneral')
    ops.numberer('RCM')
    ops.constraints('Transformation')
    ops.integrator('LoadControl', 1.0)
    ops.algorithm('Linear')
    ops.analysis('Static')
    ok = ops.analyze(1)
    if ok != 0:
        raise RuntimeError(f'El analisis no convergio (codigo {ok}) -- revisar apoyos/carga.')

    D = E * h ** 3 / (12 * (1 - nu ** 2))

    def w_en_real(i, j):
        """Desplazamiento en (i,j) si es un nodo REAL (existe en node_map),
        o None si no (fuera del dominio global O dentro del rincon
        faltante) -- SIN CLAMPEAR los indices primero (ver "bug de borde"
        2026-09-03, mismo caso corregido en calcular_zapata_shell_completo)."""
        return None if (i, j) not in node_map else ops.nodeDisp(node_map[(i, j)], 3)

    def w_en(i0, j0, di, dj):
        """Valor en (i0+di, j0+dj) respecto al nodo central (i0,j0) -- si
        ese vecino no existe (fuera del dominio global O dentro del rincon
        faltante), se EXTRAPOLA LINEALMENTE usando el vecino OPUESTO
        (equivale a curvatura cero en el borde libre) en vez de sustituir
        por el propio nodo central (ese clamp anterior crecia sin limite
        al refinar la malla -- ver comentario completo en
        calcular_zapata_shell_completo)."""
        v = w_en_real(i0 + di, j0 + dj)
        if v is not None:
            return v
        v_centro = w_en_real(i0, j0)
        v_opuesto = w_en_real(i0 - di, j0 - dj)
        if v_opuesto is None:
            return v_centro
        return 2 * v_centro - v_opuesto

    def segunda_x(i, j):
        return (w_en(i, j, 1, 0) - 2 * w_en(i, j, 0, 0) + w_en(i, j, -1, 0)) / (hx * hx)

    def segunda_y(i, j):
        return (w_en(i, j, 0, 1) - 2 * w_en(i, j, 0, 0) + w_en(i, j, 0, -1)) / (hy * hy)

    def cruzada_xy(i, j):
        return (w_en(i, j, 1, 1) - w_en(i, j, 1, -1) - w_en(i, j, -1, 1) + w_en(i, j, -1, -1)) / (4 * hx * hy)

    resultados = []
    for (i, j) in sorted(nodos_reales):
        wxx = segunda_x(i, j)
        wyy = segunda_y(i, j)
        wxy = cruzada_xy(i, j)
        Mx = D * (wxx + nu * wyy)
        My = D * (wyy + nu * wxx)
        # AGREGADO (ver conversacion, "pendientes tecnicos" 2026-08-31):
        # mismo fix de signo ya confirmado con datos reales en
        # calcular_zapata_shell_combinada() -- misma malla/formula
        # (rectangular uniforme, sin transformacion de coordenadas), asi
        # que se aplica con la misma confianza (a diferencia de la
        # trapezoidal, que SI tiene una transformacion distinta y un
        # comportamiento no explicado del todo).
        Mxy = D * (1 - nu) * wxy
        m_avg = (Mx + My) / 2
        m_r = math.sqrt(((Mx - My) / 2) ** 2 + Mxy ** 2)
        resultados.append({
            'i': i, 'j': j, 'x': i * hx, 'y': j * hy, 'w': w_en_real(i, j),
            'Mx': Mx, 'My': My, 'Mxy': Mxy, 'MMax': m_avg + m_r, 'MMin': m_avg - m_r,
        })

    by_ij = {(e['i'], e['j']): e for e in resultados}

    # AGREGADO (ver conversacion, "pendientes tecnicos" 2026-08-31): V13/V23
    # -- misma relacion de equilibrio y mismo signo final (negado) ya
    # confirmados en calcular_zapata_shell_combinada(). El vecino que cae
    # fuera del dominio real (fuera del bounding box O dentro del rincon
    # faltante) se sustituye por el valor del propio nodo -- mismo criterio
    # que w_en() ya usa arriba para la curvatura.
    def _m_en(i0, j0, di, dj, campo):
        key = (i0 + di, j0 + dj)
        if key in by_ij:
            return by_ij[key][campo]
        return by_ij[(i0, j0)][campo]

    for (i, j) in nodos_reales:
        dmx_dx = (_m_en(i, j, 1, 0, 'Mx') - _m_en(i, j, -1, 0, 'Mx')) / (2 * hx)
        dmxy_dy = (_m_en(i, j, 0, 1, 'Mxy') - _m_en(i, j, 0, -1, 'Mxy')) / (2 * hy)
        dmxy_dx = (_m_en(i, j, 1, 0, 'Mxy') - _m_en(i, j, -1, 0, 'Mxy')) / (2 * hx)
        dmy_dy = (_m_en(i, j, 0, 1, 'My') - _m_en(i, j, 0, -1, 'My')) / (2 * hy)
        v13 = -(dmx_dx + dmxy_dy)
        v23 = -(dmxy_dx + dmy_dy)
        by_ij[(i, j)]['V13'] = v13
        by_ij[(i, j)]['V23'] = v23
        by_ij[(i, j)]['VMax'] = math.hypot(v13, v23)

    def _valor_o_vecino(i, j, nombre):
        """Para la interpolacion bilineal de la cara de columna: si una de
        las 4 esquinas cae en el rincon faltante (columna pegada al
        rincon), se usa el valor del nodo (i,j) mas cercano dentro de
        node_map en su lugar -- caso limite no esperado en uso normal."""
        if (i, j) in by_ij:
            return by_ij[(i, j)][nombre]
        # busqueda simple del nodo real mas cercano (radio creciente)
        for r in range(1, max(nx, ny) + 1):
            for di in range(-r, r + 1):
                for dj in range(-r, r + 1):
                    if (i + di, j + dj) in by_ij:
                        return by_ij[(i + di, j + dj)][nombre]
        return 0.0

    def _interp_bilineal(ti, tj):
        ti = max(0.0, min(float(nx), ti))
        tj = max(0.0, min(float(ny), tj))
        i0, j0 = int(math.floor(ti)), int(math.floor(tj))
        i1, j1 = min(nx, i0 + 1), min(ny, j0 + 1)
        fx, fy = ti - i0, tj - j0

        def campo(nombre):
            v00, v10 = _valor_o_vecino(i0, j0, nombre), _valor_o_vecino(i1, j0, nombre)
            v11, v01 = _valor_o_vecino(i1, j1, nombre), _valor_o_vecino(i0, j1, nombre)
            return (v00 * (1 - fx) * (1 - fy) + v10 * fx * (1 - fy)
                    + v11 * fx * fy + v01 * (1 - fx) * fy)

        return {'Mx': campo('Mx'), 'My': campo('My'), 'Mxy': campo('Mxy')}

    # AGREGADO (ver conversacion: caracterizacion numerica del rincon, con
    # y sin columna cerca -- reemplaza la guia anterior de 5 pasos). Con la
    # columna LEJOS del rincon, un barrido de malla en 3 direcciones no
    # mostro nada parecido a una singularidad (valores acotados, sin
    # crecimiento sistematico al refinar). Con la columna CERCA del rincon
    # (a ~0.7m del vertice, caso real de columna de esquina), SI aparecio
    # el mismo patron de inestabilidad ya conocido de columnas pegadas a un
    # borde libre (valores que no convergen, cambian de signo al refinar
    # malla en vez de estabilizarse) -- osea que el problema real no es una
    # singularidad geometrica NUEVA del angulo del rincon en si, sino la
    # MISMA singularidad de apoyo puntual cerca de borde libre que ya
    # conocemos (region D), simplemente presente en 2 bordes a la vez.
    #
    # Por eso la extension es reusar el mismo criterio de region D ya
    # validado en las demas formas (volado neto < 2xd), en vez de inventar
    # teoria de singularidades nueva -- con 2 diferencias necesarias por
    # tratarse de una L:
    #   1. El volado hacia el borde EXTERIOR debe medirse contra la
    #      frontera REAL de esa fila/columna (que puede ser el borde del
    #      rincon faltante, no el bounding box completo, si esa fila/
    #      columna cae dentro del rango que el rincon recorta).
    #   2. Ademas del volado recto (horizontal/vertical), se mide la
    #      distancia EUCLIDIANA directa al VERTICE del rincon -- un chequeo
    #      que ningun volado recto detecta (una columna puede estar lejos
    #      del borde en X Y lejos del borde en Y medidos por separado, y
    #      aun asi estar pegada al vertice en diagonal -- exactamente el
    #      caso que goliath a la inestabilidad numerica en la prueba real).
    REGION_D_FACTOR = 2.0

    def _en_rango_notch_y(y):
        return y >= notch_y if notch_es_max_y else y <= notch_y

    def _en_rango_notch_x(x):
        return x >= notch_x if notch_es_max_x else x <= notch_x

    momentos_por_columna = []
    for c in columnas_info:
        i_off = (c['bx'] / 2) / hx
        j_off = (c['by'] / 2) / hy
        cara_mas_x = _interp_bilineal(c['i_col'] + i_off, c['j_col'])
        cara_menos_x = _interp_bilineal(c['i_col'] - i_off, c['j_col'])
        cara_mas_y = _interp_bilineal(c['i_col'], c['j_col'] + j_off)
        cara_menos_y = _interp_bilineal(c['i_col'], c['j_col'] - j_off)

        # Frontera real de la fila/columna de esta columna (recortada por
        # el rincon faltante si corresponde -- ver comentario arriba).
        if _en_rango_notch_y(c['y']):
            frontera_x_max, frontera_x_min = (notch_x, 0.0) if notch_es_max_x else (Lx, notch_x)
        else:
            frontera_x_max, frontera_x_min = Lx, 0.0
        if _en_rango_notch_x(c['x']):
            frontera_y_max, frontera_y_min = (notch_y, 0.0) if notch_es_max_y else (Ly, notch_y)
        else:
            frontera_y_max, frontera_y_min = Ly, 0.0

        volado_mas_x = frontera_x_max - (c['x'] + c['bx'] / 2)
        volado_menos_x = (c['x'] - c['bx'] / 2) - frontera_x_min
        volado_mas_y = frontera_y_max - (c['y'] + c['by'] / 2)
        volado_menos_y = (c['y'] - c['by'] / 2) - frontera_y_min

        columna_x_afectada = min(volado_mas_x, volado_menos_x) < REGION_D_FACTOR * d
        columna_y_afectada = min(volado_mas_y, volado_menos_y) < REGION_D_FACTOR * d

        dist_rincon = math.sqrt((c['x'] - notch_x) ** 2 + (c['y'] - notch_y) ** 2)
        if dist_rincon < REGION_D_FACTOR * d:
            columna_x_afectada = True
            columna_y_afectada = True

        def _valor_o_none(valor, afectada):
            return None if afectada else valor

        mx_mas_x = _valor_o_none(cara_mas_x['Mx'], columna_x_afectada)
        mx_menos_x = _valor_o_none(cara_menos_x['Mx'], columna_x_afectada)
        my_mas_y = _valor_o_none(cara_mas_y['My'], columna_y_afectada)
        my_menos_y = _valor_o_none(cara_menos_y['My'], columna_y_afectada)

        def _envolvente(*valores):
            candidatos = [v for v in valores if v is not None]
            return max(candidatos, key=abs) if candidatos else None

        momentos_por_columna.append({
            'x': c['x'], 'y': c['y'],
            'Mx_cara_mas_x': mx_mas_x, 'Mx_cara_menos_x': mx_menos_x,
            'My_cara_mas_y': my_mas_y, 'My_cara_menos_y': my_menos_y,
            'Mx_cara_mas_x_crudo': cara_mas_x['Mx'], 'Mx_cara_menos_x_crudo': cara_menos_x['Mx'],
            'My_cara_mas_y_crudo': cara_mas_y['My'], 'My_cara_menos_y_crudo': cara_menos_y['My'],
            'Mx_diseno': _envolvente(mx_mas_x, mx_menos_x),
            'My_diseno': _envolvente(my_mas_y, my_menos_y),
            'Mx_cara_mas_x_region_d': columna_x_afectada, 'Mx_cara_menos_x_region_d': columna_x_afectada,
            'My_cara_mas_y_region_d': columna_y_afectada, 'My_cara_menos_y_region_d': columna_y_afectada,
            'dist_rincon': dist_rincon,
        })

    return {
        'resultados': resultados, 'hx': hx, 'hy': hy,
        'momentos_por_columna': momentos_por_columna,
        'd': d, 'nx': nx, 'ny': ny,
    }


def _punto_en_poligono(x, y, poligono):
    """Ray-casting clasico -- mismo algoritmo que pointInPolygon() en
    resources/js/cad/engine/foundationContract.js (JS), reimplementado
    aca para el mismo proposito: decidir si un punto (el centro de un
    elemento de malla) cae dentro del contorno real de una zapata de
    forma arbitraria. `poligono` es una lista de (x,y)."""
    inside = False
    n = len(poligono)
    j = n - 1
    for i in range(n):
        xi, yi = poligono[i]
        xj, yj = poligono[j]
        if (yi > y) != (yj > y):
            x_cruce = (xj - xi) * (y - yi) / ((yj - yi) or 1e-12) + xi
            if x < x_cruce:
                inside = not inside
        j = i
    return inside


def _poligono_distancia_a_borde(poligono, x, y, direccion):
    """Distancia MINIMA desde (x,y) hasta el borde REAL del poligono,
    caminando en linea recta en una de las 4 direcciones cardinales
    ('mas_x','menos_x','mas_y','menos_y') -- generaliza a un poligono
    CUALQUIERA el mismo principio que ya usa maxOverhangAlongAxis/
    rayCrossing en footingMoments.js (JS) para zapatas AISLADAS
    triangulares/trapezoidales: medir el volado contra el contorno real,
    no contra un simple bounding box o un unico rincon rectangular (como
    hace calcular_zapata_shell_L_combinada). Devuelve 0.0 si no encuentra
    ningun cruce en esa direccion (no deberia pasar para un punto
    realmente interior del poligono; se trata como "ya en el borde" por
    seguridad, nunca como "sin limite").
    """
    mejor = None
    n = len(poligono)
    for i in range(n):
        x1, y1 = poligono[i]
        x2, y2 = poligono[(i + 1) % n]
        if direccion in ('mas_x', 'menos_x'):
            if y1 == y2 or (y1 - y) * (y2 - y) > 0:
                continue
            t = (y - y1) / (y2 - y1)
            if t < 0 or t > 1:
                continue
            ix = x1 + t * (x2 - x1)
            dist = (ix - x) if direccion == 'mas_x' else (x - ix)
        else:
            if x1 == x2 or (x1 - x) * (x2 - x) > 0:
                continue
            t = (x - x1) / (x2 - x1)
            if t < 0 or t > 1:
                continue
            iy = y1 + t * (y2 - y1)
            dist = (iy - y) if direccion == 'mas_y' else (y - iy)
        if dist > 1e-9 and (mejor is None or dist < mejor):
            mejor = dist
    return mejor if mejor is not None else 0.0


# =======================================================================
# MALLA CONFORME AL HUECO (ver conversacion, "implementar solo con hueco"
# 2026-09-10). Cuando la zapata tiene al menos un hueco, la grilla
# estructurada de calcular_zapata_shell_poligono_combinada lo aproxima con
# una "escalera" que desalinea el borde real del corte. Validado contra 3
# casos reales de ETABS (trapecio y rectangulo, con corte triangular,
# comparacion estadistica sobre >1000 puntos): esa escalera mete un error
# grande y consistente en M11 (mediana 2-4x peor que con malla conforme)
# y dispara picos absurdos de V23 (hasta ~95 Tn/m) en el anillo <=0.7 m
# del borde del hueco. Una triangulacion RESTRINGIDA (respeta el contorno
# exterior Y el del hueco como aristas reales) + ShellDKGT + extraccion
# por minimos cuadrados (el MISMO metodo ya validado en
# zapata_shell_solver_aisladas.py:_ajuste_curvatura, contra 224 puntos
# reales de ETABS) baja M11 a <8% de error y elimina esos picos. NO
# mejora V13 (sesgo propio, aparte, ya documentado). Para zapata SIN
# hueco este camino NO se usa -- la grilla estructurada anda igual de bien
# y es mas rapida.
# =======================================================================

def _resolver_lstsq(filas, valores, m):
    """Ajuste por minimos cuadrados de una base polinomica de `m` terminos
    via ecuaciones normales + eliminacion gaussiana con pivoteo. Devuelve
    los `m` coeficientes (0.0 en las columnas degeneradas, sin romper)."""
    AtA = [[0.0] * m for _ in range(m)]
    Atb = [0.0] * m
    for row, val in zip(filas, valores):
        for a in range(m):
            Atb[a] += row[a] * val
            for b in range(m):
                AtA[a][b] += row[a] * row[b]
    M = [AtA[a][:] + [Atb[a]] for a in range(m)]
    for col in range(m):
        piv = max(range(col, m), key=lambda r: abs(M[r][col]))
        M[col], M[piv] = M[piv], M[col]
        for r in range(m):
            if r != col and abs(M[col][col]) > 1e-14:
                factor = M[r][col] / M[col][col]
                for cc in range(m + 1):
                    M[r][cc] -= factor * M[col][cc]
    return [M[a][m] / M[a][a] if abs(M[a][a]) > 1e-14 else 0.0 for a in range(m)]


def _resolver_lstsq_6(filas, valores):
    """Ajuste cuadratico 2D (base [1, X, Y, X^2, XY, Y^2]). Se mantiene
    como envoltorio del generico para los usos que solo necesitan los
    momentos (evaluacion en un punto, sin cortante)."""
    return _resolver_lstsq(filas, valores, 6)


# Base CUBICA 2D: [1, X, Y, X^2, XY, Y^2, X^3, X^2Y, XY^2, Y^3]. Un SOLO
# ajuste de esta base a la flecha w da momento (2da derivada) Y cortante
# (3ra derivada) del mismo polinomio -- ver conversacion, "un solo ajuste
# de orden alto": probado contra 2 casos reales de ETABS (rectangulo y
# trapecio con corte), baja el error de V13 ~10-15% y de V23 ~10-25% en
# las zonas suaves vs. encadenar dos ajustes cuadraticos (w->M, luego
# M->V). Amplifica ~20-40% los picos en los nodos singulares (mitigado:
# el mapa de color recorta por percentil 10-90 y esos nodos ya tienen
# aviso).
def _terminos_cubicos(X, Y):
    X2, Y2 = X * X, Y * Y
    return (1.0, X, Y, X2, X * Y, Y2, X2 * X, X2 * Y, X * Y2, Y2 * Y)


def _M_y_V_de_coefs_cubicos(c, Dflex, nu):
    """Momento (Mx,My,Mxy) y cortante (V13,V23) en el origen local del
    ajuste, a partir de los 10 coeficientes cubicos de w.
      w_xx = 2*c3 ; w_xy = c4 ; w_yy = 2*c5
      w_xxx = 6*c6 ; w_xxy = 2*c7 ; w_xyy = 2*c8 ; w_yyy = 6*c9
    V13 = -D(w_xxx + w_xyy) ; V23 = -D(w_yyy + w_xxy)  (Kirchhoff)."""
    wxx, wxy, wyy = 2 * c[3], c[4], 2 * c[5]
    wxxx, wxxy, wxyy, wyyy = 6 * c[6], 2 * c[7], 2 * c[8], 6 * c[9]
    Mx = Dflex * (wxx + nu * wyy)
    My = Dflex * (wyy + nu * wxx)
    Mxy = Dflex * (1 - nu) * wxy
    V13 = -Dflex * (wxxx + wxyy)
    V23 = -Dflex * (wyyy + wxxy)
    return Mx, My, Mxy, V13, V23


def _cortante_asdshell(hx, hy, elementos_ij, columnas_ij, h, E, nu, q, q_por_elemento):
    """SEGUNDO solve, misma malla estructurada de cuadrilateros pero con
    `ASDShellQ4`, SOLO para V13/V23 (ver conversacion, "el V de ETABS no es
    div(M)" 2026-09-10).

    Hallazgo que lo motiva: se tomo el M11/M22/M12 DE ETABS y se derivo
    (Qx=dMx/dx+dMxy/dy) -- NO da el V13/V23 de ETABS (66-79% de error). O
    sea, ETABS NO reporta el cortante de equilibrio ∇·M sino el cortante
    CONSTITUTIVO de su elemento MITC4 (deformacion por corte asumida x
    rigidez). `ASDShellQ4` (Petracca/ASDEA) es el UNICO shell de este
    build de OpenSeesPy cuyo `eleResponse(e,'stresses')` expone el
    cortante transversal nativo -- indices 6,7 del bloque de 8 por punto
    de Gauss [N11,N22,N12,M11,M22,M12,Q1,Q2] (validado exacto contra un
    voladizo: Q1 = -carga/ancho). Es del MISMO tipo que el de ETABS.
    Probado contra 2 casos reales: V23 mejora 30-48%, V13 14-34%, y el
    signo acierta 90%/76% SIN flip (Q1->V13, Q2->V23 directo).

    Los MOMENTOS de ASDShellQ4 salen mal (flip de signo, picos espurios)
    -- por eso es un solve APARTE, solo para el cortante; el momento sigue
    saliendo de ShellDKGQ/DKGT como siempre.

    Devuelve {(i,j) del elemento -> (v13, v23)} en el centroide.
    """
    nodos = set()
    for (i, j) in elementos_ij:
        nodos.update([(i, j), (i + 1, j), (i + 1, j + 1), (i, j + 1)])
    nid = {ij: k + 1 for k, ij in enumerate(sorted(nodos))}

    ops.wipe()
    ops.model('basic', '-ndm', 3, '-ndf', 6)
    ops.section('ElasticMembranePlateSection', 1, E, nu, h, 0.0, 1.0)
    for ij, k in nid.items():
        ops.node(k, float(ij[0] * hx), float(ij[1] * hy), 0.0)

    emap = {}
    et = 1
    for (i, j) in elementos_ij:
        ops.element('ASDShellQ4', et,
                    nid[(i, j)], nid[(i + 1, j)], nid[(i + 1, j + 1)], nid[(i, j + 1)], 1)
        emap[et] = (i, j)
        et += 1

    for (ic, jc) in columnas_ij:
        if (ic, jc) in nid:
            ops.fix(nid[(ic, jc)], 1, 1, 1, 1, 1, 1)

    ops.timeSeries('Linear', 1)
    ops.pattern('Plain', 1, 1)
    carga = {k: 0.0 for k in nid.values()}
    for (i, j) in elementos_ij:
        q_el = q_por_elemento((i + 0.5) * hx, (j + 0.5) * hy) if q_por_elemento is not None else q
        cp = q_el * hx * hy / 4.0
        for esquina in [(i, j), (i + 1, j), (i + 1, j + 1), (i, j + 1)]:
            carga[nid[esquina]] += cp
    for k, fz in carga.items():
        ops.load(k, 0.0, 0.0, fz, 0.0, 0.0, 0.0)

    ops.system('BandGeneral')
    ops.numberer('RCM')
    ops.constraints('Transformation')
    ops.integrator('LoadControl', 1.0)
    ops.algorithm('Linear')
    ops.analysis('Static')
    if ops.analyze(1) != 0:
        raise RuntimeError('El analisis de cortante (ASDShellQ4) no convergio.')

    out = {}
    for et, (i, j) in emap.items():
        s = ops.eleResponse(et, 'stresses')
        if not s or len(s) % 8 != 0:
            out[(i, j)] = (0.0, 0.0)
            continue
        ng = len(s) // 8
        v13 = sum(s[g * 8 + 6] for g in range(ng)) / ng
        v23 = sum(s[g * 8 + 7] for g in range(ng)) / ng
        out[(i, j)] = (v13, v23)
    return out


def _malla_estructurada_para_cortante(poligono_local, columnas_local, huecos_local, nx, ny):
    """Genera la malla estructurada de cuadrilateros (misma tecnica que la
    ruta SIN hueco: bounding box + omitir elementos cuyo centro cae fuera
    del contorno o dentro de un hueco) para el segundo solve de cortante
    de `_resolver_poligono_conforme` -- ahi la malla PRINCIPAL es
    triangular conforme, pero ASDShellQ4 es cuadrilatero, asi que el
    cortante se calcula sobre esta malla estructurada aparte y se
    interpola a los nodos triangulares.

    Devuelve (hx, hy, elementos_ij, columnas_ij).
    """
    xs = [p[0] for p in poligono_local]
    ys = [p[1] for p in poligono_local]
    Lx = max(xs) - min(xs)
    Ly = max(ys) - min(ys)
    paso = min(Lx / nx, Ly / ny)
    if paso > 1e-9:
        nx = min(400, max(nx, round(Lx / paso)))
        ny = min(400, max(ny, round(Ly / paso)))
    # Tope de ~4500 celdas del bounding box: sin esto, una zapata con un
    # bounding box grande (ej. la L: 11x8 m) inflaba la malla a >11000
    # celdas y el solve de ASDShellQ4 se iba a ~8s. El cortante es un campo
    # suave, no necesita la resolucion fina del momento.
    if nx * ny > 4500:
        f = (4500.0 / (nx * ny)) ** 0.5
        nx = max(8, int(nx * f))
        ny = max(8, int(ny * f))
    nx = _ajustar_malla_para_columnas(Lx, [c['x'] for c in columnas_local], nx)
    ny = _ajustar_malla_para_columnas(Ly, [c['y'] for c in columnas_local], ny)
    hx, hy = Lx / nx, Ly / ny

    def dentro(i, j):
        cx, cy = (i + 0.5) * hx, (j + 0.5) * hy
        if not _punto_en_poligono(cx, cy, poligono_local):
            return False
        for hueco in huecos_local:
            if _punto_en_poligono(cx, cy, hueco):
                return False
        return True

    elementos_ij = [(i, j) for j in range(ny) for i in range(nx) if dentro(i, j)]
    columnas_ij = [(round(c['x'] / hx), round(c['y'] / hy)) for c in columnas_local]
    return hx, hy, elementos_ij, columnas_ij


def _punto_interior_anillo(anillo):
    """Un punto GARANTIZADO dentro del poligono simple `anillo` -- lo pide
    `triangle` como semilla de "region a NO rellenar" para cada hueco.
    Prueba el centroide; si el hueco es concavo y el centroide cae fuera,
    prueba puntos medios centroide-vertice y por ultimo un barrido fino
    del bounding box."""
    n = len(anillo)
    cx = sum(p[0] for p in anillo) / n
    cy = sum(p[1] for p in anillo) / n
    if _punto_en_poligono(cx, cy, anillo):
        return (cx, cy)
    for (vx, vy) in anillo:
        px, py = (cx + vx) / 2.0, (cy + vy) / 2.0
        if _punto_en_poligono(px, py, anillo):
            return (px, py)
    xs = [p[0] for p in anillo]
    ys = [p[1] for p in anillo]
    for fx in range(1, 20):
        for fy in range(1, 20):
            px = min(xs) + (max(xs) - min(xs)) * fx / 20.0
            py = min(ys) + (max(ys) - min(ys)) * fy / 20.0
            if _punto_en_poligono(px, py, anillo):
                return (px, py)
    raise ValueError("No se pudo ubicar un punto interior al hueco -- revisar la geometria del corte.")


def _resolver_poligono_conforme(
    poligono_local, columnas_local, huecos_local,
    h, E, nu, q, q_por_elemento, d, minX, minY, nx, ny,
):
    """Camino de MALLA CONFORME (ver bloque de comentarios arriba).
    Devuelve el MISMO diccionario que calcular_zapata_shell_poligono_
    combinada por la grilla estructurada (claves: resultados,
    momentos_por_columna, d, minX, minY, ...), mas 'metodo': 'conforme'.
    """
    xs = [p[0] for p in poligono_local]
    ys = [p[1] for p in poligono_local]
    Lx = max(xs) - min(xs)
    Ly = max(ys) - min(ys)

    # Area objetivo por triangulo ~ el area promedio de la celda que
    # implican nx/ny (lo que el ingeniero declaro en el modal de malla).
    # Tope de 7000 "celdas" -> ~14000 triangulos, para acotar el costo por
    # request (ShellDKGT + 4 ajustes LSQ por nodo es mas caro que la
    # grilla + diferencias finitas). Con nx=ny=100 (default de la UI) el
    # producto nx*ny=10000 siempre supera el tope, asi que en la practica
    # el tope ES la resolucion real en todo caso con hueco. Se subio de
    # 3000 -> 7000 tras validar zapata_6_cortes (F13, 56 m^2, 6 huecos):
    # con 3000 la malla quedaba gruesa para el area y M11/MMin en zona sin
    # singularidad salian 2-3x peor que en casos mas chicos ya validados
    # (0.57/0.65 vs 0.2/0.25 tipico); con 7000 vuelven a ese rango, sin
    # tocar el cortante (V13/V23/VMax usan su propia malla estructurada,
    # con su propio tope de 4500 en _malla_estructurada_para_cortante).
    # 10000 celdas se probo y da mejora marginal (M11 0.203->0.188) a
    # cambio de 43% mas de tiempo (9.7s->13.9s) -> rendimientos
    # decrecientes, no vale la pena.
    n_celdas = min(max(int(nx) * int(ny), 400), 7000)
    area_obj = max(1e-4, (Lx * Ly) / n_celdas)

    # --- Entrada para `triangle`: vertices + segmentos (aristas reales del
    # contorno exterior Y de cada hueco) + columnas como vertices forzados.
    vertices = list(poligono_local)
    segmentos = []
    off = 0
    for anillo in [poligono_local] + list(huecos_local):
        n = len(anillo)
        if off > 0:
            vertices.extend(anillo)
        for k in range(n):
            segmentos.append((off + k, off + (k + 1) % n))
        off += n
    # Tolerancia de "sobre el borde": una columna de lindero (muy comun en
    # este proyecto -- ver zapatas en L de edificio, columnas justo en la
    # arista) cae EXACTAMENTE sobre un lado del poligono, y _punto_en_
    # poligono devuelve False ahi. Se acepta si esta a menos de ~2% del
    # tamano de la zapata del contorno -- triangle la toma igual como
    # vertice del PSLG (parte el segmento en ese punto). Mismo criterio
    # tolerante que ya tiene el camino sin hueco (que ubica la columna por
    # round(x/hx) sin exigir estrictamente "adentro").
    _tol_borde = 0.02 * max(Lx, Ly)

    def _dist_a_contorno(px, py, anillo):
        dm = float('inf')
        m = len(anillo)
        for i in range(m):
            ax, ay = anillo[i]
            bx, by = anillo[(i + 1) % m]
            dx, dy = bx - ax, by - ay
            L2 = dx * dx + dy * dy
            t = max(0.0, min(1.0, ((px - ax) * dx + (py - ay) * dy) / L2)) if L2 > 1e-18 else 0.0
            dm = min(dm, math.hypot(px - (ax + t * dx), py - (ay + t * dy)))
        return dm

    _tol_dup = 1e-6 * max(Lx, Ly, 1.0)
    for c in columnas_local:
        if (not _punto_en_poligono(c['x'], c['y'], poligono_local)
                and _dist_a_contorno(c['x'], c['y'], poligono_local) > _tol_borde):
            raise ValueError(
                f"Columna en ({c['x'] + minX:.2f}, {c['y'] + minY:.2f}) cae fuera del contorno del poligono."
            )
        for hueco in huecos_local:
            if _punto_en_poligono(c['x'], c['y'], hueco) and _dist_a_contorno(c['x'], c['y'], hueco) > _tol_borde:
                raise ValueError(
                    f"Columna en ({c['x'] + minX:.2f}, {c['y'] + minY:.2f}) cae dentro de un hueco."
                )
        # Muchas columnas de este proyecto caen EXACTAMENTE sobre un vertice
        # del contorno (o del hueco) -- la zapata en L se dibujo pasando por
        # los ejes del edificio. Pasarle a `triangle` un vertice duplicado
        # genera un sliver de area cero y la matriz sale singular. Si la
        # columna ya coincide con un vertice existente, NO se agrega otra
        # vez (ese vertice ES el nodo de la columna, se ubica igual por
        # _nodo_mas_cercano).
        if not any(math.hypot(vx - c['x'], vy - c['y']) < _tol_dup for (vx, vy) in vertices):
            vertices.append((c['x'], c['y']))

    data = {
        'vertices': [[float(x), float(y)] for x, y in vertices],
        'segments': [[int(a), int(b)] for a, b in segmentos],
    }
    semillas = [_punto_interior_anillo(hueco) for hueco in huecos_local]
    if semillas:
        data['holes'] = [[float(x), float(y)] for x, y in semillas]

    # 'p' restringida, 'q30' calidad (angulo minimo 30 grados), 'a<area>'
    # area maxima por triangulo.
    malla = _triangle_lib.triangulate(data, "pq30a{:.8f}".format(area_obj))
    nodos = [(float(x), float(y)) for x, y in malla['vertices']]
    tris = [tuple(int(v) for v in t) for t in malla['triangles']]
    if not tris:
        raise ValueError("La triangulacion conforme no genero ningun elemento -- revisar la geometria.")

    # --- Modelo OpenSees (ShellDKGT) ---
    ops.wipe()
    ops.model('basic', '-ndm', 3, '-ndf', 6)
    sec_tag = 1
    ops.section('ElasticMembranePlateSection', sec_tag, E, nu, h, 0.0, 1.0)
    for k, (x, y) in enumerate(nodos, start=1):
        ops.node(k, x, y, 0.0)

    adyacencia = {k: set() for k in range(1, len(nodos) + 1)}
    ele_tag = 1
    for (a, b, c) in tris:
        na, nb, nc = a + 1, b + 1, c + 1
        ops.element('ShellDKGT', ele_tag, na, nb, nc, sec_tag)
        ele_tag += 1
        for u, v in ((na, nb), (nb, nc), (nc, na)):
            adyacencia[u].add(v)
            adyacencia[v].add(u)

    coords = {k: nodos[k - 1] for k in range(1, len(nodos) + 1)}

    def _nodo_mas_cercano(px, py):
        return min(coords, key=lambda k: (coords[k][0] - px) ** 2 + (coords[k][1] - py) ** 2)

    columna_nodes = []
    for c in columnas_local:
        cn = _nodo_mas_cercano(c['x'], c['y'])
        dx = coords[cn][0] - c['x']
        dy = coords[cn][1] - c['y']
        if math.hypot(dx, dy) > 0.05:
            raise ValueError(
                f"Columna en ({c['x'] + minX:.2f}, {c['y'] + minY:.2f}) no cayo sobre un nodo de la malla conforme "
                f"(mas cercano a {math.hypot(dx, dy) * 1000:.0f} mm)."
            )
        ops.fix(cn, 1, 1, 1, 1, 1, 1)
        columna_nodes.append(cn)

    # Carga tributaria por AREA REAL de cada triangulo (1/3 a cada
    # vertice), respetando q_por_elemento igual que la grilla estructurada.
    ops.timeSeries('Linear', 1)
    ops.pattern('Plain', 1, 1)
    carga_nodal = {k: 0.0 for k in range(1, len(nodos) + 1)}
    for (a, b, c) in tris:
        pa, pb, pc = nodos[a], nodos[b], nodos[c]
        area = abs((pb[0] - pa[0]) * (pc[1] - pa[1]) - (pc[0] - pa[0]) * (pb[1] - pa[1])) / 2.0
        cx = (pa[0] + pb[0] + pc[0]) / 3.0
        cy = (pa[1] + pb[1] + pc[1]) / 3.0
        q_el = q_por_elemento(cx, cy) if q_por_elemento is not None else q
        cp = q_el * area / 3.0
        for n in (a + 1, b + 1, c + 1):
            carga_nodal[n] += cp
    for n, fz in carga_nodal.items():
        ops.load(n, 0.0, 0.0, fz, 0.0, 0.0, 0.0)

    ops.system('BandGeneral')
    ops.numberer('RCM')
    ops.constraints('Transformation')
    ops.integrator('LoadControl', 1.0)
    ops.algorithm('Linear')
    ops.analysis('Static')
    ok = ops.analyze(1)
    if ok != 0:
        raise RuntimeError(f'El analisis (malla conforme) no convergio (codigo {ok}).')

    Dflex = E * h ** 3 / (12 * (1 - nu ** 2))

    # Vecindario para el ajuste cubico (10 terminos): se expande por
    # anillos de adyacencia hasta juntar al menos `min_pts` nodos -- ~22
    # da suficiente sobredeterminacion para que el ajuste sea estable sin
    # seguir el ruido de la singularidad (ver conversacion, "cubico con
    # vecindario mas grande": +3 puntos disparaba los picos, +12 los
    # acota).
    def _vecindario(k0, min_pts=22):
        cand = {k0} | set(adyacencia[k0])
        frontera = set(cand)
        while len(cand) < min_pts:
            nuevo = set()
            for v in frontera:
                nuevo |= adyacencia[v]
            nuevo -= cand
            if not nuevo:
                break
            cand |= nuevo
            frontera = nuevo
        return cand

    def _ajuste_cubico_w(k0):
        x0, y0 = coords[k0]
        filas, vals = [], []
        for k in _vecindario(k0):
            x, y = coords[k]
            filas.append(_terminos_cubicos(x - x0, y - y0))
            vals.append(ops.nodeDisp(k, 3))
        return _resolver_lstsq(filas, vals, 10)

    # M11/M22/M12 desde un ajuste cubico local de la flecha w (2da
    # derivada) -- un solo fit por nodo (ver bloque de comentarios sobre
    # _terminos_cubicos mas arriba). El cubico tambien da V13/V23 (3ra
    # derivada) pero NO se usan: el cortante sale de un solve aparte con
    # ASDShellQ4 (ver mas abajo), que da el cortante CONSTITUTIVO del
    # elemento -- el mismo tipo que reporta ETABS, no el de equilibrio.
    w_por_nodo = {}
    campo_por_nodo = {}
    for k in coords:
        c = _ajuste_cubico_w(k)
        Mx, My, Mxy, _, _ = _M_y_V_de_coefs_cubicos(c, Dflex, nu)
        m_avg = (Mx + My) / 2.0
        m_r = math.sqrt(((Mx - My) / 2.0) ** 2 + Mxy ** 2)
        campo_por_nodo[k] = {
            'Mx': Mx, 'My': My, 'Mxy': Mxy, 'MMax': m_avg + m_r, 'MMin': m_avg - m_r,
        }
        w_por_nodo[k] = ops.nodeDisp(k, 3)

    # V13/V23: SEGUNDO solve con ASDShellQ4 sobre una malla estructurada de
    # cuadrilateros aparte (ASDShellQ4 no es triangular) -- ver
    # _cortante_asdshell. El cortante se interpola de vuelta a los nodos
    # triangulares por la celda estructurada que los contiene (o el
    # centroide mas cercano si esa celda quedo fuera/en el hueco).
    hxs, hys, elems_ij, cols_ij = _malla_estructurada_para_cortante(
        poligono_local, columnas_local, huecos_local, nx, ny,
    )
    cort_elem = _cortante_asdshell(hxs, hys, elems_ij, cols_ij, h, E, nu, q, q_por_elemento)
    _centros_cort = [((i + 0.5) * hxs, (j + 0.5) * hys, v13, v23)
                     for (i, j), (v13, v23) in cort_elem.items()]

    def _cortante_en(px, py):
        # Promedio del parche 3x3 de celdas estructuradas alrededor del
        # punto -- amortigua los picos de nodos sueltos que daba el lookup
        # de una sola celda (ver conversacion, punto (4.61,7.97) daba V13
        # 16.8 vs ETABS ~1.6). El sesgo suave que queda cerca de columnas
        # (~x2 de ETABS hasta ~1m) es del propio elemento, no se arregla
        # promediando -- ver la advertencia y el aviso de hover.
        i0, j0 = int(px / hxs), int(py / hys)
        vs = [cort_elem[(i, j)]
              for i in (i0 - 1, i0, i0 + 1)
              for j in (j0 - 1, j0, j0 + 1)
              if (i, j) in cort_elem]
        if vs:
            return (sum(v[0] for v in vs) / len(vs), sum(v[1] for v in vs) / len(vs))
        if not _centros_cort:
            return (0.0, 0.0)
        _, _, v13, v23 = min(_centros_cort, key=lambda e: (e[0] - px) ** 2 + (e[1] - py) ** 2)
        return (v13, v23)

    resultados = []
    for k in coords:
        x, y = coords[k]
        cpn = campo_por_nodo[k]
        v13, v23 = _cortante_en(x, y)
        cpn['V13'], cpn['V23'], cpn['VMax'] = v13, v23, math.hypot(v13, v23)
        resultados.append({
            'x': x, 'y': y, 'w': w_por_nodo[k],
            'Mx': cpn['Mx'], 'My': cpn['My'], 'Mxy': cpn['Mxy'],
            'MMax': cpn['MMax'], 'MMin': cpn['MMin'],
            'V13': v13, 'V23': v23, 'VMax': cpn['VMax'],
        })

    # --- Momento de diseno por columna (Region D identica a la grilla
    # estructurada: volado real contra el contorno EXTERIOR, 2*d). ---
    def _M_en_punto(px, py, campo):
        k0 = _nodo_mas_cercano(px, py)
        x0, y0 = coords[k0]
        filas, vals = [], []
        for k in _vecindario(k0):
            x, y = coords[k]
            X, Y = x - x0, y - y0
            filas.append((1.0, X, Y, X * X, X * Y, Y * Y))
            vals.append(campo_por_nodo[k][campo])
        c = _resolver_lstsq_6(filas, vals)
        dx, dy = px - x0, py - y0
        return c[0] + c[1] * dx + c[2] * dy + c[3] * dx * dx + c[4] * dx * dy + c[5] * dy * dy

    REGION_D_FACTOR = 2.0
    momentos_por_columna = []
    for c in columnas_local:
        vmx = _poligono_distancia_a_borde(poligono_local, c['x'] + c['bx'] / 2, c['y'], 'mas_x')
        vnx = _poligono_distancia_a_borde(poligono_local, c['x'] - c['bx'] / 2, c['y'], 'menos_x')
        vmy = _poligono_distancia_a_borde(poligono_local, c['x'], c['y'] + c['by'] / 2, 'mas_y')
        vny = _poligono_distancia_a_borde(poligono_local, c['x'], c['y'] - c['by'] / 2, 'menos_y')
        rd_x = min(vmx, vnx) < REGION_D_FACTOR * d
        rd_y = min(vmy, vny) < REGION_D_FACTOR * d

        mx_mas_crudo = _M_en_punto(c['x'] + c['bx'] / 2, c['y'], 'Mx')
        mx_men_crudo = _M_en_punto(c['x'] - c['bx'] / 2, c['y'], 'Mx')
        my_mas_crudo = _M_en_punto(c['x'], c['y'] + c['by'] / 2, 'My')
        my_men_crudo = _M_en_punto(c['x'], c['y'] - c['by'] / 2, 'My')

        mx_mas = None if rd_x else mx_mas_crudo
        mx_men = None if rd_x else mx_men_crudo
        my_mas = None if rd_y else my_mas_crudo
        my_men = None if rd_y else my_men_crudo

        def _envolvente(*valores):
            cand = [v for v in valores if v is not None]
            return max(cand, key=abs) if cand else None

        momentos_por_columna.append({
            'x': c['x'] + minX, 'y': c['y'] + minY,
            'Mx_cara_mas_x': mx_mas, 'Mx_cara_menos_x': mx_men,
            'My_cara_mas_y': my_mas, 'My_cara_menos_y': my_men,
            'Mx_cara_mas_x_crudo': mx_mas_crudo, 'Mx_cara_menos_x_crudo': mx_men_crudo,
            'My_cara_mas_y_crudo': my_mas_crudo, 'My_cara_menos_y_crudo': my_men_crudo,
            'Mx_diseno': _envolvente(mx_mas, mx_men),
            'My_diseno': _envolvente(my_mas, my_men),
            'Mx_region_d': rd_x, 'My_region_d': rd_y,
            'volado_mas_x': vmx, 'volado_menos_x': vnx,
            'volado_mas_y': vmy, 'volado_menos_y': vny,
        })

    return {
        'resultados': resultados,
        'hx': None, 'hy': None, 'minX': minX, 'minY': minY,
        'momentos_por_columna': momentos_por_columna,
        'd': d, 'nx': None, 'ny': None,
        'metodo': 'conforme', 'num_nodos': len(nodos), 'num_elementos': len(tris),
    }


def calcular_zapata_shell_poligono_combinada(
    poligono,           # [(x,y), ...] vertices del contorno REAL, en orden, coordenadas LOCALES
    h, E, nu, q,
    columnas,           # [{'x','y','bx','by'}, ...] -- 2+ columnas, en CUALQUIER posicion 2D
    nx=80, ny=80,
    recubrimiento=0.075,
    # AGREGADO (ver conversacion, "zapatas recortadas", Etapa 2): huecos
    # opcionales -- [[(x,y),...], ...], coordenadas LOCALES (mismo sistema
    # que `poligono`). Cada hueco es un contorno simple aparte (no hace
    # falta que sea convexo). Un elemento de malla se descarta si su centro
    # cae dentro del contorno exterior Y ADEMAS dentro de CUALQUIER hueco --
    # ver `elemento_dentro` mas abajo. Con huecos=None (o lista vacia) el
    # comportamiento es IDENTICO a antes.
    huecos=None,
    # AGREGADO (ver conversacion, "solucionar M11" 2026-09-04): callable
    # opcional (x_local, y_local) -> q que reemplaza el `q` escalar SOLO en
    # la carga aplicada, elemento por elemento -- ver docstring, seccion
    # "CARGA NO UNIFORME" mas abajo, para por que hace falta. `q` (el
    # escalar) sigue siendo obligatorio: Region D/d no lo necesitan para
    # nada relacionado a la carga, pero varias validaciones/mensajes lo
    # asumen disponible: si se pasa `q_por_elemento`, `q` puede ser
    # cualquier valor representativo (ej. el promedio) solo para esos usos.
    q_por_elemento=None,
):
    """
    FASE 1 (ver conversacion, "losa de cimentacion con columnas en
    cuadricula 2D" -- caso real: cliente uso Divide Shells de ETABS solo
    para refinar el mallado, no para crear varias zapatas -- nuestro
    importador reconstruye correctamente la forma completa en una sola
    zapata (mergeZapataFragments.js), pero esa zapata resulto tener
    columnas en cuadricula 2D, no en una sola linea recta como
    calcular_zapata_shell_combinada() asume). Generaliza esa funcion (y
    calcular_zapata_shell_L_combinada(), su antecesora directa para forma
    NO rectangular) a un POLIGONO ARBITRARIO con CUALQUIER cantidad de
    columnas en cualquier posicion -- no solo un rincon rectangular
    recortado, cualquier contorno simple.

    Reutiliza 2 patrones YA VALIDADOS en este archivo, generalizados:
    1. Malla: UNA sola malla rectangular uniforme sobre el bounding box
       COMPLETO del poligono (misma tecnica de calcular_zapata_shell_
       combinada), omitiendo los elementos cuyo CENTRO cae fuera del
       poligono real (test de punto-en-poligono, en vez del simple
       "esta en el rincon" de la version L) -- solo se crean nodos
       tocados por al menos un elemento real (evita nodos huerfanos sin
       rigidez, que dejarian la matriz singular).
    2. Carga: tributaria POR AREA REAL de cada elemento (q*hx*hy/4 a cada
       esquina), no el truco wx*wy=0.5 de borde (que asume un vecindario
       rectangular completo, ya no cierto en un contorno irregular) --
       identico a como ya lo resuelve calcular_zapata_shell_L_combinada.

    FASE 1 = MOMENTO (M11/M22/M12/MMax/MMin), el campo completo para el
    Diagrama de Resultantes 2D, y el momento de diseno por columna (con
    Region D). El cortante (V13/V23/VMax) SI se calcula para el campo
    completo (mismo algoritmo de equilibrio ya validado, es practicamente
    gratis reusar el patron). Tampoco hay respaldo rigido tipo "viga
    continua" -- no tiene sentido para una cuadricula 2D, igual que ya no
    lo tiene para la L.

    FASE 2 (ver conversacion, "empieza la fase 2" 2026-09-04) = cortante
    de DISENO por columna (Bloque 6). Se decidio NO portar tal cual la
    logica BPR/vano_corto de calcular_zapata_shell_combinada (esa fue
    pensada y validada para columnas con 1-2 vecinos EN LINEA, F10 --
    en una cuadricula 2D real cada columna puede tener hasta 4 vecinos, y
    no hay evidencia de que la formula siga siendo valida ahi). En vez de
    eso, el cortante de diseno de esta funcion combina 2 chequeos, cada
    uno reusando una formula YA VALIDADA en otro contexto, sin inventar
    ninguna nueva:
      - PUNZONAMIENTO por columna (computePunchingShear, footingShear.js)
        -- SIEMPRE se calcula, para toda columna: es un chequeo LOCAL
        (perimetro critico a d/2 de la cara, Pu de esa columna, qu de
        diseno) que no depende de si hay vecinos ni de la forma del
        contorno -- exactamente la misma formula que ya usan aisladas y
        combinadas rectas. Limitacion YA CONOCIDA y documentada aparte
        (ver memoria del proyecto, "punzonamiento borde gap"): columnas
        de BORDE sobreestiman b0 (no recorta el perimetro que cae fuera
        del contorno) e ignoran Munb (momento no balanceado) -- en un
        mat con muchas columnas de borde/esquina (9 de 11 en el unico
        caso real) esto aplica a la MAYORIA de las columnas, no es un
        caso raro aca.
      - CORTANTE UNIDIRECCIONAL solo en los VOLADOS REALES (computeOneWay
        Shear, la misma formula de aisladas/corridas: seccion critica a
        distancia d de la cara, Vu=qu×(volado-d) por metro de ancho) --
        el volado en cada una de las 4 direcciones (`volado_mas_x/menos_x
        /mas_y/menos_y`, expuesto en momentos_por_columna) es SIEMPRE la
        distancia real de esa cara al borde REAL del poligono (nunca se
        detiene en otra columna intermedia -- ver _poligono_distancia_a_
        borde, hace ray-casting contra el contorno, no contra columnas).
        El llamador (foundation.js) debe aplicar este chequeo SOLO en
        direcciones donde NO existe otra columna alineada mas alla (osea,
        donde el volado es un VERDADERO voladizo libre) -- si hay una
        columna vecina en esa direccion, el tramo entre ambas es un panel
        de losa en 2 direcciones (accion bidireccional), no un voladizo,
        y el chequeo que gobierna ahi es punzonamiento, no cortante de
        viga en 1 direccion (mismo principio de diseno de losas macizas
        de 2 vias, ACI 318 8.4.1) -- no hay formula validada todavia para
        "cortante de viga ancha ENTRE 2 columnas vecinas en una cuadricula
        2D" (eso seria el equivalente 2D del vano_corto/BPR descartado
        arriba), asi que esa direccion simplemente no se chequea.

    APOYO DE COLUMNA -- SIEMPRE fijeza completa (los 6 GDL), a diferencia
    de calcular_zapata_shell_combinada()/_L_combinada() (ver conversacion,
    "afinar precision Fase 1" 2026-09-04): esas 2 funciones usan un
    modelo HIBRIDO (elasticBeamColumn si la columna no cae en Region D,
    ops.fix si cae) validado con 2 casos reales de zapata combinada tipo
    VIGA (columnas en UNA sola linea, F10 y F12) -- ahi la columna real
    SIGUE FLEXIBLE hacia la superestructura, y esa flexibilidad mejora
    mucho el reparto de carga entre columnas vecinas (F10: -41.7% ->
    +2.9% de mediana de error). Se probo el mismo criterio aca (heredado
    sin verificar, ver docstring de una version anterior) y con el primer
    caso real de cuadricula 2D (11 columnas, .e2k de Jack) empeoro el
    campo de momento en puntos alejados de cualquier columna: M11/M22 en
    (6,6) pasaron de 50.1%/38.5% de error a 10.9%/5.9% al usar SIEMPRE
    ops.fix; en (2,6) M22 paso de +53.3% a -9.8%; en (8,2) M22 paso de
    +12.5% a +0.2%. La razon, confirmada leyendo el .e2k de referencia:
    el cliente restringio los 6 GDL de CADA columna tanto en "Base" como
    en "Story1" (POINTASSIGN ... RESTRAINT "UX UY UZ RX RY RZ") -- en ese
    modelo real NINGUNA columna tiene flexibilidad hacia arriba, son
    apoyos puntuales rigidos por diseno del propio modelo de prueba, asi
    que el modelo hibrido (pensado para una columna que SI sigue como
    elemento flexible) no aplicaba aca. Ademas, con columnas en cuadricula
    2D (no en una sola fila), Region D se activa en una proporcion mucho
    mayor de columnas que en F10/F12 (9 de 11 en este caso, contra 1-2 de
    2-3 alla) -- el modelo hibrido asume que la mayoria de columnas SI
    esta lejos de un borde libre, supuesto que ya no se cumple en un
    poligono con varios rincones. Si en el futuro aparece un caso real de
    cuadricula 2D con columnas genuinamente flexibles hacia una
    superestructura (no restringidas como aca), este criterio deberia
    revisarse con ESE caso como evidencia -- no reintroducir el modelo
    hibrido sin dato real que lo respalde otra vez.

    Region D: el volado hacia cada uno de los 4 lados (+X/-X/+Y/-Y) se
    mide contra el borde REAL del poligono en esa fila/columna exacta
    (ver _poligono_distancia_a_borde) -- generaliza el mismo criterio ya
    usado en las demas formas (volado neto < d, ver calcular_zapata_
    shell_completo para el porque de d y no 2d en aisladas -- aca se
    mantiene 2*d, el mismo que ya usan combinada/L, porque este caso SI
    tiene columnas con posible vecino en la misma fila/columna, como
    esas 2 formas, a diferencia de la aislada de 1 sola columna). Sigue
    usandose SOLO para decidir si el momento de diseno de ESA columna es
    confiable (se oculta si no) -- ya NO decide el tipo de apoyo (ver
    parrafo de arriba). NO se replica el chequeo de "distancia al
    vertice del rincon" de la L (esa forma tiene exactamente 1 vertice
    reflejo conocido; un poligono arbitrario puede tener varios o
    ninguno) -- si un caso real muestra que hace falta, se agrega
    despues con evidencia, no por adelantado.

    CARGA NO UNIFORME (ver conversacion, "solucionar M11" 2026-09-04):
    tras corregir el apoyo (ver arriba), quedaba un residual de M11 de
    ~33-45% de error en puntos lejos de cualquier columna (ej. 2,6) que
    NINGUN ajuste de malla, apoyo, ni siquiera cambiar a un elemento de
    placa GRUESA (ShellMITC4, con extraccion de momento desde las
    rotaciones -- probado y calibrado, pero termino EMPEORANDO el
    resultado, asi que se descarto) lograba mover. La causa real,
    encontrada leyendo el .e2k linea por linea: el cliente NO le asigno
    una presion de suelo UNIFORME a todo el mat -- cada grupo de piezas
    de Divide Shells tiene su PROPIO valor de "csuelo" (AREALOAD ... LC
    "csuelo" FVAL ...), de 4.33 a 6.52 Tonf/m2 segun la zona, muy
    distinto del promedio uniforme (4.77) que se habia asumido para
    validar. Con la presion real por zona (parametro `q_por_elemento`
    de abajo) en vez de un unico `q` promediado, el error en TODOS los
    puntos de control bajo a menos de 8% (antes: 33-45% en el peor
    caso) -- confirma que el solver (malla, apoyo, formula de momento)
    siempre estuvo bien calibrado; el problema era el dato de entrada
    de la VALIDACION, no la funcion. Production (`calculateZapatas()`
    en foundation.js) debe usar `q_por_elemento` leyendo el valor de
    carga asignado a CADA pieza real del grupo (ver groupConnectedZapatas
    en mergeZapataFragments.js) en vez de un unico promedio para todo el
    grupo, una vez que se conecte esta funcion a la UI (Fase 2).
    """
    xs = [p[0] for p in poligono]
    ys = [p[1] for p in poligono]
    minX, maxX = min(xs), max(xs)
    minY, maxY = min(ys), max(ys)
    Lx = maxX - minX
    Ly = maxY - minY

    # Todo LOCAL respecto a (minX, minY) de aca en adelante -- mismo
    # criterio que el resto de funciones de este archivo.
    poligono_local = [(x - minX, y - minY) for x, y in poligono]
    columnas_local = [dict(c, x=c['x'] - minX, y=c['y'] - minY) for c in columnas]
    huecos_local = [[(x - minX, y - minY) for x, y in hueco] for hueco in (huecos or [])]

    d = max(0.0, h - recubrimiento)

    # AGREGADO (ver conversacion, "implementar solo con hueco" 2026-09-10):
    # con al menos un hueco, la grilla estructurada de abajo aproxima el
    # borde del corte con una "escalera" que mete error grande en M11 y
    # picos absurdos de V23 cerca del hueco (validado contra 3 casos reales
    # de ETABS). Se usa una malla CONFORME al hueco -- ver el bloque de
    # comentarios sobre _resolver_poligono_conforme mas arriba. Sin hueco
    # NO se toca nada (grilla estructurada de siempre). Si `triangle` no
    # esta disponible (deploy viejo), tambien cae a la grilla estructurada.
    if huecos_local and _triangle_lib is not None:
        return _resolver_poligono_conforme(
            poligono_local, columnas_local, huecos_local,
            h, E, nu, q, q_por_elemento, d, minX, minY, nx, ny,
        )
    if huecos_local and _triangle_lib is None:
        print(
            "[zapata_shell] AVISO: hay hueco pero `triangle` no esta instalado -- "
            "se usa la grilla estructurada (menos precisa cerca del corte).",
            file=sys.stderr,
        )

    # AGREGADO (ver conversacion, "simetria Mx vs My" -- caso real F3):
    # antes nx/ny se usaban tal cual llegaban del llamador (mallaProporcional
    # en foundation.js les da N al lado largo y M al corto, pero N y M son
    # valores independientes elegidos por el ingeniero -- si son iguales,
    # como el default, el resultado son elementos MUY alargados quando
    # Lx difiere mucho de Ly, ej. este triangulo: 11.9m x 6m con nx=ny=80
    # da hx~2*hy). El error de una derivada por diferencias finitas crece
    # con el CUADRADO del paso -- confirmado con datos reales de ETABS: Mx
    # (que depende mas de wxx, en el eje largo/grueso) salia con el doble
    # de sesgo que My (wyy, eje corto/fino) -- 27% vs 13% de mediana.
    # Se ajusta aca, ANTES de alinear a columnas: se toma el paso mas FINO
    # que ya implican nx/ny (nunca se vuelve mas grueso de lo que el
    # llamador pidio en cualquiera de los 2 ejes) y se aplica a AMBOS, para
    # que los elementos queden lo mas cuadrados posible -- verificado que
    # mejora Mx/Mxy/MMax de forma real (sin empeorar My) contra el mismo
    # caso F3. Tope de seguridad (400 por eje) para no disparar el costo
    # de computo en un poligono extremadamente alargado/degenerado.
    paso_objetivo = min(Lx / nx, Ly / ny)
    if paso_objetivo > 1e-9:
        nx = min(400, max(nx, round(Lx / paso_objetivo)))
        ny = min(400, max(ny, round(Ly / paso_objetivo)))

    nx = _ajustar_malla_para_columnas(Lx, [c['x'] for c in columnas_local], nx)
    ny = _ajustar_malla_para_columnas(Ly, [c['y'] for c in columnas_local], ny)
    hx = Lx / nx
    hy = Ly / ny

    def elemento_dentro(i, j):
        cx = (i + 0.5) * hx
        cy = (j + 0.5) * hy
        if not _punto_en_poligono(cx, cy, poligono_local):
            return False
        # AGREGADO (ver conversacion, "zapatas recortadas", Etapa 2): un
        # elemento cuyo centro cae dentro de CUALQUIER hueco no es material
        # real -- mismo criterio de "hueco/notch interior" que ya maneja
        # w_en() mas abajo (el nodo simplemente no entra a node_map, y la
        # curvatura en el borde del hueco se extrapola igual que en el
        # borde exterior, sin cambios adicionales).
        for hueco in huecos_local:
            if _punto_en_poligono(cx, cy, hueco):
                return False
        return True

    elementos_ij = [(i, j) for j in range(ny) for i in range(nx) if elemento_dentro(i, j)]
    if not elementos_ij:
        raise ValueError("El poligono no contiene ningun elemento de malla real -- revisar la geometria (orden de vertices, escala).")

    nodos_reales = set()
    for (i, j) in elementos_ij:
        nodos_reales.update([(i, j), (i + 1, j), (i + 1, j + 1), (i, j + 1)])

    ops.wipe()
    ops.model('basic', '-ndm', 3, '-ndf', 6)
    sec_tag = 1
    ops.section('ElasticMembranePlateSection', sec_tag, E, nu, h, 0.0, 1.0)

    node_tag = 1
    node_map = {}
    for (i, j) in sorted(nodos_reales):
        ops.node(node_tag, float(i * hx), float(j * hy), 0.0)
        node_map[(i, j)] = node_tag
        node_tag += 1

    ele_tag = 1
    for (i, j) in elementos_ij:
        n1, n2 = node_map[(i, j)], node_map[(i + 1, j)]
        n3, n4 = node_map[(i + 1, j + 1)], node_map[(i, j + 1)]
        ops.element('ShellDKGQ', ele_tag, n1, n2, n3, n4, sec_tag)
        ele_tag += 1

    REGION_D_FACTOR = 2.0

    columnas_info = []
    for col in columnas_local:
        i_col = round(col['x'] / hx)
        j_col = round(col['y'] / hy)
        if (i_col, j_col) not in node_map:
            raise ValueError(
                f"Columna en ({col['x']}, {col['y']}) cae fuera del contorno real del poligono -- no hay material ahi."
            )
        columna_node = node_map[(i_col, j_col)]

        volado_mas_x = _poligono_distancia_a_borde(poligono_local, col['x'] + col['bx'] / 2, col['y'], 'mas_x')
        volado_menos_x = _poligono_distancia_a_borde(poligono_local, col['x'] - col['bx'] / 2, col['y'], 'menos_x')
        volado_mas_y = _poligono_distancia_a_borde(poligono_local, col['x'], col['y'] + col['by'] / 2, 'mas_y')
        volado_menos_y = _poligono_distancia_a_borde(poligono_local, col['x'], col['y'] - col['by'] / 2, 'menos_y')
        columna_x_en_region_d = min(volado_mas_x, volado_menos_x) < REGION_D_FACTOR * d
        columna_y_en_region_d = min(volado_mas_y, volado_menos_y) < REGION_D_FACTOR * d

        # SIEMPRE fijeza completa -- ver docstring ("APOYO DE COLUMNA") para
        # la evidencia real de por que NO se usa el modelo hibrido
        # (elasticBeamColumn) que si usan combinada/L_combinada.
        ops.fix(columna_node, 1, 1, 1, 1, 1, 1)

        columnas_info.append({
            'i_col': i_col, 'j_col': j_col, 'node': columna_node,
            'bx': col['bx'], 'by': col['by'], 'x': col['x'], 'y': col['y'],
            'x_global': col['x'] + minX, 'y_global': col['y'] + minY,
            'region_d_x': columna_x_en_region_d, 'region_d_y': columna_y_en_region_d,
            # AGREGADO (ver conversacion, "Fase 2 -- cortante de diseno"
            # 2026-09-04): se exponen en momentos_por_columna para que el
            # llamador pueda calcular cortante unidireccional en los
            # volados REALES (columna sin vecino alineado mas alla, ver
            # foundation.js) -- misma distancia ya usada arriba para
            # Region D, no es un calculo nuevo, solo se devuelve.
            'volado_mas_x': volado_mas_x, 'volado_menos_x': volado_menos_x,
            'volado_mas_y': volado_mas_y, 'volado_menos_y': volado_menos_y,
        })

    # Carga tributaria por AREA REAL de cada elemento -- identico a
    # calcular_zapata_shell_L_combinada, ver comentario ahi. Si se paso
    # `q_por_elemento`, cada elemento usa SU PROPIO q (ver docstring,
    # "CARGA NO UNIFORME") en vez del escalar `q` parejo para todos.
    ops.timeSeries('Linear', 1)
    ops.pattern('Plain', 1, 1)
    carga_nodal = {tag: 0.0 for tag in node_map.values()}
    for (i, j) in elementos_ij:
        q_elem = q_por_elemento((i + 0.5) * hx, (j + 0.5) * hy) if q_por_elemento is not None else q
        carga_por_elemento = q_elem * hx * hy / 4.0
        for esquina in [(i, j), (i + 1, j), (i + 1, j + 1), (i, j + 1)]:
            carga_nodal[node_map[esquina]] += carga_por_elemento
    for tag, fz in carga_nodal.items():
        ops.load(tag, 0.0, 0.0, fz, 0.0, 0.0, 0.0)

    ops.system('BandGeneral')
    ops.numberer('RCM')
    ops.constraints('Transformation')
    ops.integrator('LoadControl', 1.0)
    ops.algorithm('Linear')
    ops.analysis('Static')
    ok = ops.analyze(1)
    if ok != 0:
        raise RuntimeError(f'El analisis no convergio (codigo {ok}) -- revisar apoyos/carga.')

    D = E * h ** 3 / (12 * (1 - nu ** 2))

    def w_en_real(i, j):
        """Desplazamiento en (i,j) si es un nodo REAL (existe en node_map),
        o None si no (fuera del dominio global O dentro de un hueco/notch
        interior) -- SIN CLAMPEAR los indices primero (ver "bug de borde"
        2026-09-03, mismo caso corregido en calcular_zapata_shell_completo)."""
        return None if (i, j) not in node_map else ops.nodeDisp(node_map[(i, j)], 3)

    def w_en(i0, j0, di, dj):
        v = w_en_real(i0 + di, j0 + dj)
        if v is not None:
            return v
        v_centro = w_en_real(i0, j0)
        v_opuesto = w_en_real(i0 - di, j0 - dj)
        if v_opuesto is None:
            return v_centro
        return 2 * v_centro - v_opuesto

    def segunda_x(i, j):
        return (w_en(i, j, 1, 0) - 2 * w_en(i, j, 0, 0) + w_en(i, j, -1, 0)) / (hx * hx)

    def segunda_y(i, j):
        return (w_en(i, j, 0, 1) - 2 * w_en(i, j, 0, 0) + w_en(i, j, 0, -1)) / (hy * hy)

    def cruzada_xy(i, j):
        return (w_en(i, j, 1, 1) - w_en(i, j, 1, -1) - w_en(i, j, -1, 1) + w_en(i, j, -1, -1)) / (4 * hx * hy)

    resultados = []
    for (i, j) in sorted(nodos_reales):
        wxx = segunda_x(i, j)
        wyy = segunda_y(i, j)
        wxy = cruzada_xy(i, j)
        Mx = D * (wxx + nu * wyy)
        My = D * (wyy + nu * wxx)
        Mxy = D * (1 - nu) * wxy
        m_avg = (Mx + My) / 2
        m_r = math.sqrt(((Mx - My) / 2) ** 2 + Mxy ** 2)
        resultados.append({
            'i': i, 'j': j, 'x': i * hx, 'y': j * hy, 'w': w_en_real(i, j),
            'Mx': Mx, 'My': My, 'Mxy': Mxy, 'MMax': m_avg + m_r, 'MMin': m_avg - m_r,
        })

    by_ij = {(e['i'], e['j']): e for e in resultados}

    def _m_en(i0, j0, di, dj, campo):
        key = (i0 + di, j0 + dj)
        if key in by_ij:
            return by_ij[key][campo]
        return by_ij[(i0, j0)][campo]

    # V13/V23: SEGUNDO solve con ASDShellQ4 sobre la MISMA malla (ver
    # _cortante_asdshell) -- reemplaza Qx=dMx/dx+dMxy/dy, que resulto ser
    # OTRA cantidad fisica: se tomo el M de ETABS, se derivo, y NO da el V
    # de ETABS (ETABS reporta el cortante constitutivo de su MITC4, no el
    # de equilibrio). El momento sigue saliendo de ShellDKGQ (arriba, ya
    # validado). Cada nodo toma el promedio de los elementos que lo tocan.
    cort_elem = _cortante_asdshell(
        hx, hy, elementos_ij,
        [(c['i_col'], c['j_col']) for c in columnas_info],
        h, E, nu, q, q_por_elemento,
    )
    for (i, j) in nodos_reales:
        vs = [cort_elem[e] for e in ((i - 1, j - 1), (i, j - 1), (i - 1, j), (i, j)) if e in cort_elem]
        if vs:
            v13 = sum(v[0] for v in vs) / len(vs)
            v23 = sum(v[1] for v in vs) / len(vs)
        else:
            v13 = v23 = 0.0
        by_ij[(i, j)]['V13'] = v13
        by_ij[(i, j)]['V23'] = v23
        by_ij[(i, j)]['VMax'] = math.hypot(v13, v23)

    def _valor_o_vecino(i, j, nombre):
        if (i, j) in by_ij:
            return by_ij[(i, j)][nombre]
        for r in range(1, max(nx, ny) + 1):
            for di in range(-r, r + 1):
                for dj in range(-r, r + 1):
                    if (i + di, j + dj) in by_ij:
                        return by_ij[(i + di, j + dj)][nombre]
        return 0.0

    def _interp_bilineal(ti, tj):
        ti = max(0.0, min(float(nx), ti))
        tj = max(0.0, min(float(ny), tj))
        i0, j0 = int(math.floor(ti)), int(math.floor(tj))
        i1, j1 = min(nx, i0 + 1), min(ny, j0 + 1)
        fx, fy = ti - i0, tj - j0

        def campo(nombre):
            v00, v10 = _valor_o_vecino(i0, j0, nombre), _valor_o_vecino(i1, j0, nombre)
            v11, v01 = _valor_o_vecino(i1, j1, nombre), _valor_o_vecino(i0, j1, nombre)
            return (v00 * (1 - fx) * (1 - fy) + v10 * fx * (1 - fy)
                    + v11 * fx * fy + v01 * (1 - fx) * fy)

        return {'Mx': campo('Mx'), 'My': campo('My'), 'Mxy': campo('Mxy')}

    momentos_por_columna = []
    for c in columnas_info:
        i_off = (c['bx'] / 2) / hx
        j_off = (c['by'] / 2) / hy
        cara_mas_x = _interp_bilineal(c['i_col'] + i_off, c['j_col'])
        cara_menos_x = _interp_bilineal(c['i_col'] - i_off, c['j_col'])
        cara_mas_y = _interp_bilineal(c['i_col'], c['j_col'] + j_off)
        cara_menos_y = _interp_bilineal(c['i_col'], c['j_col'] - j_off)

        def _valor_o_none(valor, afectada):
            return None if afectada else valor

        mx_mas_x = _valor_o_none(cara_mas_x['Mx'], c['region_d_x'])
        mx_menos_x = _valor_o_none(cara_menos_x['Mx'], c['region_d_x'])
        my_mas_y = _valor_o_none(cara_mas_y['My'], c['region_d_y'])
        my_menos_y = _valor_o_none(cara_menos_y['My'], c['region_d_y'])

        def _envolvente(*valores):
            candidatos = [v for v in valores if v is not None]
            return max(candidatos, key=abs) if candidatos else None

        momentos_por_columna.append({
            'x': c['x_global'], 'y': c['y_global'],
            'Mx_cara_mas_x': mx_mas_x, 'Mx_cara_menos_x': mx_menos_x,
            'My_cara_mas_y': my_mas_y, 'My_cara_menos_y': my_menos_y,
            'Mx_cara_mas_x_crudo': cara_mas_x['Mx'], 'Mx_cara_menos_x_crudo': cara_menos_x['Mx'],
            'My_cara_mas_y_crudo': cara_mas_y['My'], 'My_cara_menos_y_crudo': cara_menos_y['My'],
            'Mx_diseno': _envolvente(mx_mas_x, mx_menos_x),
            'My_diseno': _envolvente(my_mas_y, my_menos_y),
            'Mx_region_d': c['region_d_x'], 'My_region_d': c['region_d_y'],
            # AGREGADO (ver conversacion, "Fase 2 -- cortante de diseno"):
            # volados REALES (distancia cara->borde real del poligono en
            # cada direccion) -- el llamador (foundation.js) los usa para
            # el cortante unidireccional SOLO en las direcciones sin
            # vecino alineado mas alla (ver docstring de calcular_zapata_
            # shell_poligono_combinada, seccion "CORTANTE DE DISENO").
            'volado_mas_x': c['volado_mas_x'], 'volado_menos_x': c['volado_menos_x'],
            'volado_mas_y': c['volado_mas_y'], 'volado_menos_y': c['volado_menos_y'],
        })

    return {
        'resultados': resultados, 'hx': hx, 'hy': hy, 'minX': minX, 'minY': minY,
        'momentos_por_columna': momentos_por_columna,
        'd': d, 'nx': nx, 'ny': ny,
    }
