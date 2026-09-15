# python-backend/zapata_shell_solver_aisladas.py
# -----------------------------------------------------------------------
# ARCHIVO PARTIDO (ver conversacion, "particionar zapata_shell_solver.py"):
# antes zapata_shell_solver.py tenia TODO (aisladas + combinadas), 3324
# lineas -- se separo en 2 archivos SIN dependencias cruzadas entre si
# (verificado: ninguna funcion de este archivo llama a nada del archivo
# combinadas, y viceversa). Este archivo: zapatas AISLADAS (1 columna) --
# rectangular (calcular_zapata_shell / calcular_zapata_shell_completo) y
# poligonal no rectangular (calcular_zapata_shell_poligono_aislado, malla
# en abanico) con sus helpers propios de geometria de poligono.
# Ver zapata_shell_solver_combinadas.py para las formas de 2+ columnas.
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

import openseespy.opensees as ops


def calcular_zapata_shell(
    Lx, Ly,              # dimensiones de la zapata en planta (m)
    h,                    # espesor (m)
    E,                    # modulo de elasticidad del concreto (Tonf/m2)
    nu,                   # modulo de poisson
    q,                     # presion perpendicular uniforme (Tonf/m2), sentido: empuja la zapata hacia ARRIBA (como el suelo)
    columna_x, columna_y,  # posicion de la columna (m), relativa a la esquina (0,0)
    columna_bx=0.30, columna_by=0.30,  # ancho de columna (m) -- ver nota mas abajo
    nx=20, ny=20,          # divisiones de malla
    columna_altura=None,   # AGREGADO (ver conversacion): si se da (m), modela
                            # la columna real (elasticBeamColumn) subiendo desde
                            # la zapata hasta un nodo fijo a esa altura, en vez
                            # de asumir el punto de apoyo infinitamente rigido.
                            # El cliente confirmo que el primer piso SI importa
                            # para este calculo (columna real conectada al
                            # edificio, no un punto perfecto) -- validado contra
                            # ETABS: con apoyo rigido puro la diferencia era 34.6%,
                            # el edificio real le da flexibilidad adicional a ese
                            # punto que el apoyo rigido no captura. None = mismo
                            # comportamiento de antes (apoyo rigido).
    columna_E=None,         # modulo de elasticidad de la columna (Tonf/m2) --
                            # si None, usa el mismo E que la zapata.
):
    ops.wipe()
    ops.model('basic', '-ndm', 3, '-ndf', 6)

    # ── 1. Material del shell (ElasticMembranePlateSection) ──────────────
    # 6to argumento = modificador de rigidez de flexion fuera del plano;
    # 1.0 = flexion completa (a diferencia de los muros, que usan 0.1 -- acá
    # la flexion ES lo que queremos medir, no algo que minimizar).
    sec_tag = 1
    ops.section('ElasticMembranePlateSection', sec_tag, E, nu, h, 0.0, 1.0)

    # ── 2. Malla de nodos (grilla regular, Lx x Ly) ───────────────────────
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

    # ── 3. Elementos ShellDKGQ (orden antihorario) ─────────────────────────
    # AGREGADO (ver conversación): se cambió de ShellMITC4 a ShellDKGQ
    # (Discrete Kirchhoff) tras encontrar el origen real del desfase con
    # ETABS -- ShellMITC4 es una formulacion "gruesa" (Mindlin, con giros
    # independientes de w) mientras que nuestro post-proceso (Mx=-D(wxx+
    # nu*wyy), heredado de losa_solver.js) asume placa DELGADA (Kirchhoff,
    # giro = pendiente de w). Ese desacople de formulaciones era la causa
    # del error, no la formula en si: verificado contra la solucion exacta
    # de Timoshenko para una placa cuadrada simplemente apoyada (L/h=4,
    # nu=0.3) -- ShellMITC4 daba 38% de mas, ShellDKGQ da razon=1.000
    # exacto. Aplicado a la zapata real (h=0.5, columna 45x45, malla
    # 20x20), el valor en el nodo pasa de -179.88 (18x mal) a -9.86,
    # contra el 9.9104 que reporta ETABS en el mismo punto -- 0.5% de
    # diferencia.
    ele_tag = 1
    for j in range(ny):
        for i in range(nx):
            n1 = node_map[(i, j)]
            n2 = node_map[(i + 1, j)]
            n3 = node_map[(i + 1, j + 1)]
            n4 = node_map[(i, j + 1)]
            ops.element('ShellDKGQ', ele_tag, n1, n2, n3, n4, sec_tag)
            ele_tag += 1

    # ── 4. Apoyo: SOLO el nodo de la columna, bordes libres ───────────────
    i_col = round(columna_x / hx)
    j_col = round(columna_y / hy)
    columna_node = node_map[(i_col, j_col)]

    if columna_altura and columna_altura > 0:
        # Columna REAL (elasticBeamColumn) subiendo desde la zapata hasta un
        # nodo fijo a `columna_altura` -- modela la flexibilidad real de la
        # columna/primer piso en vez de asumir el punto infinitamente rigido.
        # Seccion rectangular columna_bx x columna_by; formula de la
        # constante de torsion J es la aproximacion clasica de Roark/Timoshenko
        # para seccion rectangular (bmin=lado menor, bmax=lado mayor).
        Ecol = columna_E if columna_E else E
        Gcol = Ecol / (2 * (1 + nu))
        A_col = columna_bx * columna_by
        Iz_col = columna_bx * columna_by ** 3 / 12
        Iy_col = columna_by * columna_bx ** 3 / 12
        bmin, bmax = min(columna_bx, columna_by), max(columna_bx, columna_by)
        J_col = bmin ** 3 * bmax * (1 / 3 - 0.21 * (bmin / bmax) * (1 - (bmin / bmax) ** 4 / 12))

        top_node = node_tag
        ops.node(top_node, float(columna_x), float(columna_y), float(columna_altura))
        ops.fix(top_node, 1, 1, 1, 1, 1, 1)

        transf_tag = 1
        ops.geomTransf('Linear', transf_tag, 1.0, 0.0, 0.0)
        ops.element('elasticBeamColumn', ele_tag, columna_node, top_node,
                    A_col, Ecol, Gcol, J_col, Iy_col, Iz_col, transf_tag)
    else:
        # Fijeza completa (los 6 GDL) en ese unico nodo -- equivale a que la
        # columna sea infinitamente mas rigida que la zapata en ese punto
        # (necesario ademas para que el sistema no quede como un mecanismo: una
        # placa libre con un solo punto sin girar en X/Y necesita algo que
        # tome esos 2 modos de cuerpo rigido -- ver memoria del proyecto,
        # project_losa_solver_zapatas_precision).
        ops.fix(columna_node, 1, 1, 1, 1, 1, 1)

    # ── 5. Carga: q uniforme, repartida como cargas nodales equivalentes ──
    # OpenSeesPy no tiene "presion sobre shell" directa (a diferencia de
    # eleLoad para frames) -- se reparte q por el area tributaria de cada
    # nodo (regla del trapecio: interior=hx*hy, borde=mitad, esquina=cuarto).
    ops.timeSeries('Linear', 1)
    ops.pattern('Plain', 1, 1)
    for j in range(ny + 1):
        for i in range(nx + 1):
            wx = 0.5 if (i == 0 or i == nx) else 1.0
            wy = 0.5 if (j == 0 or j == ny) else 1.0
            area_trib = wx * wy * hx * hy
            fz = q * area_trib  # + hacia arriba en Z (mismo eje global que las coordenadas del shell)
            ops.load(node_map[(i, j)], 0.0, 0.0, fz, 0.0, 0.0, 0.0)

    # ── 6. Analisis estatico lineal ────────────────────────────────────────
    ops.system('BandGeneral')
    ops.numberer('RCM')
    ops.constraints('Transformation')
    ops.integrator('LoadControl', 1.0)
    ops.algorithm('Linear')
    ops.analysis('Static')
    ok = ops.analyze(1)
    if ok != 0:
        raise RuntimeError(f'El analisis no convergio (codigo {ok}) -- revisar apoyos/carga.')

    # ── 7. M11/M22/M12 por curvatura, a partir de la deflexion real ────────
    # AGREGADO (ver conversacion): 'stresses' vía eleResponse no esta
    # implementado para ElasticMembranePlateSection (siempre da 0, aunque el
    # modelo si tiene flexion real -- verificado con 'forces' y con la
    # reaccion en la columna, que cierra el equilibrio exacto: -q*Area).
    # En vez de perseguir el nombre exacto del comando, se recalculan los
    # momentos con la MISMA formula de curvatura de Kirchhoff que ya se
    # tenia validada (Mx=-D(wxx+nu*wyy), etc.) pero aplicada sobre la
    # deflexion w YA RESUELTA por el FEM -- no hace falta ningun punto
    # fantasma para esto (a diferencia de resolver la ecuacion), porque ya
    # hay un valor REAL en cada nodo del dominio; en el borde se usan
    # diferencias de un solo lado en vez de centradas.
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
            # AGREGADO (ver conversacion): Mx/My salen con signo invertido
            # respecto al M11/M22 que reporta ETABS -- verificado de forma
            # consistente en TODAS las comparaciones reales de esta sesion
            # (siempre magnitud igual, signo siempre opuesto, nunca al
            # reves). Es una diferencia de convencion (que cara es
            # traccion), no un error de magnitud, asi que se corrige una
            # sola vez aca invirtiendo el signo de la formula. Mxy NO se
            # invierte -- nunca se comparo contra un M12 real de ETABS, asi
            # que no hay base empirica para asumir que necesita el mismo
            # ajuste (una inversion del eje normal no necesariamente afecta
            # igual al termino de torsion que a los de flexion).
            Mx = D * (wxx + nu * wyy)
            My = D * (wyy + nu * wxx)
            Mxy = -D * (1 - nu) * wxy
            resultados.append({'i': i, 'j': j, 'x': i * hx, 'y': j * hy, 'w': w_en(i, j), 'Mx': Mx, 'My': My, 'Mxy': Mxy})

    # ── 8. Momento de diseno en la CARA de columna, no en el nodo ──────────
    # AGREGADO (ver conversacion): el nodo de la columna es una singularidad
    # matematica (apoyo puntual) -- cualquier software da un valor sin
    # sentido justo ahi. La practica estandar (ACI 318 / E.060, y lo que
    # hace ETABS internamente al promediar puntos de Gauss) es evaluar el
    # momento de diseno en la CARA de la columna, no en su centro.
    #
    # Como no tenemos las dimensiones reales de la columna del cliente para
    # este caso de prueba, se asume un tamano tipico (columna_bx x
    # columna_by, por defecto 30x30cm) -- ES UNA SUPOSICION, no un dato
    # confirmado; ajustar columna_bx/columna_by cuando el cliente confirme
    # el tamano real.
    #
    # AGREGADO (ver conversacion): antes se redondeaba al nodo de malla mas
    # cercano a la cara (con nx=20 y columna 45cm, eso caia en 20cm en vez
    # de los 22.5cm reales de la cara -- un error de posicion de varios cm
    # en una zona donde el campo cambia MUY fuerte). Ahora se interpola
    # bilineal dentro del elemento que realmente contiene el punto de la
    # cara, usando las funciones de forma isoparametricas estandar de FEM
    # (N1..N4 sobre los 4 nodos del elemento) -- da el valor en la
    # coordenada EXACTA de la cara, no la del nodo mas cercano.
    by_ij = {(e['i'], e['j']): e for e in resultados}

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

    i_offset_x = (columna_bx / 2) / hx
    j_offset_y = (columna_by / 2) / hy

    cara_mas_x = _interp_bilineal(i_col + i_offset_x, j_col)
    cara_menos_x = _interp_bilineal(i_col - i_offset_x, j_col)
    cara_mas_y = _interp_bilineal(i_col, j_col + j_offset_y)
    cara_menos_y = _interp_bilineal(i_col, j_col - j_offset_y)

    momento_diseno = {
        'columna_bx': columna_bx, 'columna_by': columna_by,
        'Mx_cara_mas_x': cara_mas_x['Mx'], 'Mx_cara_menos_x': cara_menos_x['Mx'],
        'My_cara_mas_y': cara_mas_y['My'], 'My_cara_menos_y': cara_menos_y['My'],
        # valor de diseno = el mayor en magnitud entre las 2 caras de cada direccion
        'Mx_diseno': max(cara_mas_x['Mx'], cara_menos_x['Mx'], key=abs),
        'My_diseno': max(cara_mas_y['My'], cara_menos_y['My'], key=abs),
        # AGREGADO (ver conversacion): Mxy/torsion de diseno -- el mayor en
        # magnitud entre las 4 caras evaluadas (nunca comparado contra un
        # M12 real de ETABS, a diferencia de Mx/My -- mostrar como
        # referencia adicional, no como valor validado).
        'Mxy_diseno': max(
            cara_mas_x['Mxy'], cara_menos_x['Mxy'], cara_mas_y['Mxy'], cara_menos_y['Mxy'], key=abs
        ),
    }

    return {
        'node_map': node_map, 'columna_node': columna_node,
        'i_col': i_col, 'j_col': j_col,
        'hx': hx, 'hy': hy, 'resultados': resultados,
        'momento_diseno': momento_diseno,
    }


def _ajustar_malla_para_columna(L, columna_pos, n_objetivo, rango=6):
    """
    Busca, cerca de n_objetivo, el numero de divisiones N tal que la
    columna (columna_pos) caiga lo mas exacto posible sobre un nodo real
    de la malla.

    AGREGADO (ver conversacion) -- bug real encontrado al calibrar
    precision de zapatas DESCENTRADAS: el apoyo de la columna SIEMPRE se
    ata al nodo de malla mas cercano (ops.fix necesita un nodo real, no
    puede ir en un punto arbitrario) -- si columna_pos no cae justo en un
    nodo con la malla pedida, la columna SIMULADA queda desplazada de
    donde en verdad esta, hasta L/(2*n) de error. Para zapatas CENTRADAS
    (columna_pos=L/2, n par) esto siempre alineaba exacto por pura
    casualidad geometrica -- nunca se noto hasta probar una zapata
    descentrada real: columna en x=0.3 con malla 50x50 (paso 0.04m) caia
    JUSTO en el punto medio entre dos nodos (7.5) -- el peor caso posible,
    2cm de error de posicion, que por si solo explicaba gran parte de la
    "menor precision" observada en casos descentrados (dos funciones
    distintas del solver, con la MISMA formula matematica, daban
    resultados hasta 43% distintos entre si solo por este desalineamiento).

    Si n_objetivo ya alinea exacto (o casi), se devuelve tal cual -- no
    perturba ningun caso ya validado (todos los centrados, F2/F8, ya
    alineaban exacto con n par).
    """
    if columna_pos <= 0 or columna_pos >= L:
        return n_objetivo  # columna fuera de la zapata -- no deberia pasar, no hay nada que alinear

    def _error(n):
        h = L / n
        frac = columna_pos / h
        return abs(frac - round(frac))

    mejor_n = n_objetivo
    mejor_error = _error(n_objetivo)
    if mejor_error < 1e-9:
        return n_objetivo

    # AGREGADO (ver conversacion): busca SOLO hacia arriba (n_objetivo en
    # adelante), nunca hacia mallas mas gruesas -- probado primero buscar
    # en ambas direcciones (n_objetivo +/- rango) y encontraba buena
    # alineacion reduciendo la malla (ej. 50->47), lo que mejoraba mucho
    # M12/MMax pero empeoraba V13/VMax (el cortante ya es sensible a la
    # finura de malla, ver mas arriba) -- buscar solo hacia arriba da la
    # misma calidad de alineacion sin sacrificar finura.
    for n in range(n_objetivo + 1, n_objetivo + 2 * rango + 1):
        e = _error(n)
        if e < mejor_error - 1e-9:
            mejor_error = e
            mejor_n = n

    return mejor_n


def calcular_zapata_shell_completo(
    Lx, Ly,              # dimensiones de la zapata en planta (m)
    h,                    # espesor (m)
    E,                    # modulo de elasticidad del concreto (Tonf/m2)
    nu,                   # modulo de poisson
    q,                     # presion perpendicular uniforme (Tonf/m2)
    columna_x, columna_y,  # posicion de la columna (m), relativa a la esquina (0,0)
    fpc_mpa,                # f'c (MPa) -- para la capacidad phiVc del cortante
    columna_bx=0.30, columna_by=0.30,
    recubrimiento=0.075,    # m -- peralte efectivo d = h - recubrimiento (cortante)
    nx=50, ny=50,           # AGREGADO (ver conversacion): UNA sola malla para momento Y
                            # cortante -- antes eran 2 llamadas HTTP separadas
                            # (calcular_zapata_shell a 20x20 + calcular_zapata_shell_cortante
                            # a 50x50), duplicando el solve de OpenSeesPy por zapata. El
                            # cortante YA necesitaba 50x50 para converger (a 20x20 subestima
                            # la fuerza total ~15%, ver commit anterior); una malla mas fina
                            # nunca perjudica al momento (20x20 y 40x40 ya daban igual para
                            # F2), asi que se fusiona en una sola pasada. Con 3-4 zapatas
                            # aisladas en un modelo, esto corta a la mitad las llamadas al
                            # backend -- y en el dev server Windows (single-threaded, ver
                            # conversacion) eso importa el doble, porque las llamadas se
                            # encolan una por una.
    columna_altura=None,
    columna_E=None,
):
    """
    Momento (M11/M22/M12, evaluado en la CARA de columna) Y cortante
    (V13/V23, evaluado en la SECCION CRITICA a distancia d de la cara) de
    una zapata aislada rectangular, por elementos finitos reales, en UN
    SOLO solve de OpenSeesPy -- fusion de calcular_zapata_shell() +
    calcular_zapata_shell_cortante() (ver conversacion: antes eran 2
    funciones/2 llamadas HTTP independientes por zapata).

    El cortante transversal de una placa de Kirchhoff sale de la relacion
    de equilibrio Qx=dMx/dx+dMxy/dy, Qy=dMxy/dx+dMy/dy, derivando
    (diferencias finitas) el MISMO campo de momentos que ya se calcula por
    curvatura -- por eso ambos salen de un solo solve sin perder precision.

    AGREGADO (ver conversacion) -- bug de signo que hay que respetar acá:
    ETABS reporta Mx/My con el signo invertido respecto a la formula cruda
    de Kirchhoff (Mx=-D(wxx+nu*wyy)), pero Mxy NO. Para derivar Qx/Qy hace
    falta un campo AUTOCONSISTENTE (sin flip en ninguno de los 3) -- por
    eso el campo interno `M` de esta funcion queda SIN invertir, y el flip
    de Mx/My se aplica recien al final, solo para el momento de diseno y
    el campo que se muestra en el mapa 2D (nunca para derivar el cortante).
    Validado: (1) equilibrio de fuerzas -- la integral de Qx a lo largo de
    toda la cara de columna cierra casi exacto (~1% de error a malla fina)
    contra la fuerza que exige la estatica; (2) contra ETABS real, caso F8
    (4x2m, centrada, q=3.69 Tonf/m2): Mx 3.00%, My 6.83%, V13 2.44%, V23
    3.15% a malla fina -- validado SOLO para zapatas centradas.
    """
    # Ajuste de malla para que la columna caiga exacta (o lo mas cerca
    # posible) en un nodo real -- ver _ajustar_malla_para_columna(). Debe
    # correr ANTES de calcular hx/hy, para que TODO lo de abajo (nodos,
    # elementos, indices) ya use la malla corregida.
    nx = _ajustar_malla_para_columna(Lx, columna_x, nx)
    ny = _ajustar_malla_para_columna(Ly, columna_y, ny)

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

    i_col = round(columna_x / hx)
    j_col = round(columna_y / hy)
    columna_node = node_map[(i_col, j_col)]

    if columna_altura and columna_altura > 0:
        Ecol = columna_E if columna_E else E
        Gcol = Ecol / (2 * (1 + nu))
        A_col = columna_bx * columna_by
        Iz_col = columna_bx * columna_by ** 3 / 12
        Iy_col = columna_by * columna_bx ** 3 / 12
        bmin, bmax = min(columna_bx, columna_by), max(columna_bx, columna_by)
        J_col = bmin ** 3 * bmax * (1 / 3 - 0.21 * (bmin / bmax) * (1 - (bmin / bmax) ** 4 / 12))

        top_node = node_tag
        ops.node(top_node, float(columna_x), float(columna_y), float(columna_altura))
        ops.fix(top_node, 1, 1, 1, 1, 1, 1)

        transf_tag = 1
        ops.geomTransf('Linear', transf_tag, 1.0, 0.0, 0.0)
        ops.element('elasticBeamColumn', ele_tag, columna_node, top_node,
                    A_col, Ecol, Gcol, J_col, Iy_col, Iz_col, transf_tag)
    else:
        ops.fix(columna_node, 1, 1, 1, 1, 1, 1)

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

    # Momentos SIN el flip de signo (formula cruda de Kirchhoff, autoconsistente
    # entre Mx/My/Mxy) -- ver docstring, hace falta para que Qx/Qy tengan sentido.
    M = {}
    for j in range(ny + 1):
        for i in range(nx + 1):
            wxx = segunda_x(i, j)
            wyy = segunda_y(i, j)
            wxy = cruzada_xy(i, j)
            M[(i, j)] = {
                'Mx': -D * (wxx + nu * wyy),
                'My': -D * (wyy + nu * wxx),
                'Mxy': -D * (1 - nu) * wxy,
            }

    def Mval(nombre, i, j):
        i = max(0, min(nx, i))
        j = max(0, min(ny, j))
        return M[(i, j)][nombre]

    Q = {}
    for j in range(ny + 1):
        for i in range(nx + 1):
            dMx_dx = (Mval('Mx', i + 1, j) - Mval('Mx', i - 1, j)) / (2 * hx)
            dMxy_dy = (Mval('Mxy', i, j + 1) - Mval('Mxy', i, j - 1)) / (2 * hy)
            dMxy_dx = (Mval('Mxy', i + 1, j) - Mval('Mxy', i - 1, j)) / (2 * hx)
            dMy_dy = (Mval('My', i, j + 1) - Mval('My', i, j - 1)) / (2 * hy)
            Q[(i, j)] = {'Qx': dMx_dx + dMxy_dy, 'Qy': dMxy_dx + dMy_dy}

    def _interp_bilineal(field, campo, ti, tj):
        ti = max(0.0, min(float(nx), ti))
        tj = max(0.0, min(float(ny), tj))
        i0 = int(math.floor(ti))
        j0 = int(math.floor(tj))
        i1 = min(nx, i0 + 1)
        j1 = min(ny, j0 + 1)
        fx = ti - i0
        fy = tj - j0
        v00 = field[(i0, j0)][campo]
        v10 = field[(i1, j0)][campo]
        v11 = field[(i1, j1)][campo]
        v01 = field[(i0, j1)][campo]
        return v00 * (1 - fx) * (1 - fy) + v10 * fx * (1 - fy) + v11 * fx * fy + v01 * (1 - fx) * fy

    j_col_f = columna_y / hy
    i_col_f = columna_x / hx

    # ── Momento: evaluado EN la cara de columna (no en la seccion critica,
    # a diferencia del cortante mas abajo) -- ver calcular_zapata_shell()
    # para el porque de evaluar en la cara y no en el nodo de apoyo.
    mx_cara_mas = _interp_bilineal(M, 'Mx', i_col_f + (columna_bx / 2) / hx, j_col_f)
    mx_cara_menos = _interp_bilineal(M, 'Mx', i_col_f - (columna_bx / 2) / hx, j_col_f)
    my_cara_mas = _interp_bilineal(M, 'My', i_col_f, j_col_f + (columna_by / 2) / hy)
    my_cara_menos = _interp_bilineal(M, 'My', i_col_f, j_col_f - (columna_by / 2) / hy)
    mxy_cara_mas_x = _interp_bilineal(M, 'Mxy', i_col_f + (columna_bx / 2) / hx, j_col_f)
    mxy_cara_menos_x = _interp_bilineal(M, 'Mxy', i_col_f - (columna_bx / 2) / hx, j_col_f)
    mxy_cara_mas_y = _interp_bilineal(M, 'Mxy', i_col_f, j_col_f + (columna_by / 2) / hy)
    mxy_cara_menos_y = _interp_bilineal(M, 'Mxy', i_col_f, j_col_f - (columna_by / 2) / hy)

    # AGREGADO (ver conversacion, "Región D también en aisladas" -- caso
    # real F19, columna con su centro EXACTO en la esquina de la zapata,
    # de hecho sobresaliendo de ella en las 2 direcciones a la vez): el
    # momento de diseno de esta funcion NUNCA tuvo proteccion de Region D
    # -- a diferencia de calcular_zapata_shell_combinada(), que si la
    # tiene desde la investigacion de F12/F7 (ver el docstring de esa
    # funcion: el umbral 2*d se valido justamente con datos de F7, una
    # zapata AISLADA -- pero el fix de codigo nunca se replico aca).
    # Confirmado con el caso real: sin este chequeo, Mx_diseno salia en
    # 764 t.m/m (el campo crudo de ETABS ya mostraba M11≈97 justo en el
    # nodo de la columna, contra ~-2 a -4 en el resto de la losa -- la
    # misma singularidad de carga puntual ya documentada, aqui en su
    # forma mas extrema posible).
    #
    # IMPORTANTE -- umbral d, NO 2*d (a diferencia de la combinada): se
    # probo primero con 2*d (el mismo de la combinada) y dio un FALSO
    # POSITIVO real -- oculto el My de F8 (volado 0.775m = 1.82d), una
    # zapata YA VALIDADA con la tabla cruda de ETABS a <1.4% de error (ver
    # documentacion del proyecto) -- habria sido una regresion. Con
    # umbral=d: F8 (0.775m > d) y F7 lado corto (0.675m=1.59d > d, ~21%
    # de error ya conocido/tolerado, sin mascara hoy) NO se ven afectados
    # -- solo se oculta cuando el volado es MENOR que un peralte efectivo
    # (F19: volado NEGATIVO; F3 lado corto: 0.075m<d, que YA se oculta
    # para cortante con este mismo umbral mas abajo -- ahora tambien para
    # momento, por consistencia). No se replica la parte de
    # "vano_corto"/BPR de la combinada porque son especificas de tener
    # mas de una columna en la misma zapata, y una aislada solo tiene una.
    REGION_D_FACTOR = 1.0
    d_region = max(0.0, h - recubrimiento)
    volado_mas_x_rd = Lx - (columna_x + columna_bx / 2)
    volado_menos_x_rd = columna_x - columna_bx / 2
    volado_mas_y_rd = Ly - (columna_y + columna_by / 2)
    volado_menos_y_rd = columna_y - columna_by / 2
    columna_x_en_region_d = min(volado_mas_x_rd, volado_menos_x_rd) < REGION_D_FACTOR * d_region
    columna_y_en_region_d = min(volado_mas_y_rd, volado_menos_y_rd) < REGION_D_FACTOR * d_region

    # Flip de signo (ver docstring) SOLO para Mx/My de diseno -- Mxy queda
    # tal cual sale del campo autoconsistente.
    #
    # AGREGADO (ver conversacion): Mxy/M12 SI necesita el mismo flip que
    # Mx/My -- confirmado con el primer caso real donde M12 no es
    # practicamente cero (zapata aislada DESCENTRADA): sin el flip, la
    # magnitud calzaba bien contra ETABS (~4%) pero el signo salia
    # invertido. En todos los casos centrados anteriores M12=0 en ambos
    # sistemas, asi que nunca hubo signo que comparar -- por eso quedo sin
    # corregir hasta ahora. Este flip es SOLO para lo que se muestra
    # (diseno + campo del mapa 2D); el M dict interno (usado para derivar
    # Qx/Qy via equilibrio) sigue sin flip, autoconsistente, sin cambios.
    momento_diseno = {
        'columna_bx': columna_bx, 'columna_by': columna_by,
        'Mx_cara_mas_x': None if columna_x_en_region_d else -mx_cara_mas,
        'Mx_cara_menos_x': None if columna_x_en_region_d else -mx_cara_menos,
        'My_cara_mas_y': None if columna_y_en_region_d else -my_cara_mas,
        'My_cara_menos_y': None if columna_y_en_region_d else -my_cara_menos,
        'Mx_diseno': None if columna_x_en_region_d else max(-mx_cara_mas, -mx_cara_menos, key=abs),
        'My_diseno': None if columna_y_en_region_d else max(-my_cara_mas, -my_cara_menos, key=abs),
        'Mxy_diseno': None if (columna_x_en_region_d or columna_y_en_region_d) else max(-mxy_cara_mas_x, -mxy_cara_menos_x, -mxy_cara_mas_y, -mxy_cara_menos_y, key=abs),
        # AGREGADO: banderas para que el llamador (app.py) arme una
        # advertencia dinamica y el frontend sepa que debe caer al
        # metodo rigido (mismo patron que "_region_d" en la combinada).
        'Mx_region_d': columna_x_en_region_d,
        'My_region_d': columna_y_en_region_d,
    }

    # ── Cortante: seccion critica (ACI 318/E.060), a distancia d de la cara
    # de columna, hacia el borde de la zapata -- NO en la cara misma.
    #
    # AGREGADO (ver conversacion) -- fix de un bug real: si el volado NETO
    # (cara de columna -> borde de la zapata) es MENOR que d, la seccion
    # critica matematicamente cae FUERA de la zapata. Antes esto se
    # "resolvia" recortando (clamp) la lectura al borde de la malla -- que
    # cae muy cerca de la columna, en la zona de concentracion de
    # cortante, dando un numero sin sentido fisico (se veria del orden de
    # cientos/miles de Tonf/m en vez de los ~5-20 normales). Ahora se
    # detecta el caso y esa cara queda sin valor (None) -- el frontend cae
    # de vuelta al metodo rigido para esa direccion (que ya maneja
    # correctamente volado<d dando Vu=0, mismo criterio que
    # computeOneWayShear en footingShear.js). Fisicamente, cuando el
    # volado es tan corto, el chequeo que gobierna es punzonamiento
    # (computePunchingShear), no cortante de viga -- este metodo de una
    # direccion simplemente no aplica ahi, no es que de cero.
    d = max(0.0, h - recubrimiento)

    volado_mas_x = Lx - (columna_x + columna_bx / 2)
    volado_menos_x = columna_x - columna_bx / 2
    volado_mas_y = Ly - (columna_y + columna_by / 2)
    volado_menos_y = columna_y - columna_by / 2

    def _v_o_none(componente, ti, tj, volado_neto):
        if volado_neto < d:
            return None
        return _interp_bilineal(Q, componente, ti, tj)

    V13_mas = _v_o_none('Qx', (columna_x + columna_bx / 2 + d) / hx, j_col_f, volado_mas_x)
    V13_menos = _v_o_none('Qx', (columna_x - columna_bx / 2 - d) / hx, j_col_f, volado_menos_x)
    V23_mas = _v_o_none('Qy', i_col_f, (columna_y + columna_by / 2 + d) / hy, volado_mas_y)
    V23_menos = _v_o_none('Qy', i_col_f, (columna_y - columna_by / 2 - d) / hy, volado_menos_y)

    def _diseno(v_mas, v_menos):
        candidatos = [v for v in (v_mas, v_menos) if v is not None]
        return max(candidatos, key=abs) if candidatos else None

    V13_diseno = _diseno(V13_mas, V13_menos)
    V23_diseno = _diseno(V23_mas, V23_menos)

    # Capacidad phiVc, MISMA formula que footingShear.js (oneWayShearCapacityKgf):
    # phi x 0.53 x sqrt(f'c) x b x d, b=100cm (por metro de ancho) -- se calcula
    # aca tambien para devolver un {vuTon, phiVcTon, ratio, ok} listo para el
    # mismo componente de UI que ya muestra el metodo rigido.
    PHI_CORTANTE = 0.85
    fc_kgf_cm2 = fpc_mpa * 10.19716
    d_cm = d * 100
    phi_vc_kgf = PHI_CORTANTE * 0.53 * math.sqrt(fc_kgf_cm2) * 100 * d_cm if fc_kgf_cm2 > 0 and d_cm > 0 else 0.0
    phi_vc_ton = phi_vc_kgf / 1000

    cortante_diseno = {
        'd': d,
        'V13_cara_mas_x': V13_mas, 'V13_cara_menos_x': V13_menos,
        'V23_cara_mas_y': V23_mas, 'V23_cara_menos_y': V23_menos,
        'V13_diseno': V13_diseno, 'V23_diseno': V23_diseno,
        'phiVcTonM': phi_vc_ton,
        # AGREGADO (ver conversacion): true cuando ESE lado tuvo volado
        # suficiente (>=d) para una seccion critica valida -- el frontend
        # lo usa para saber si puede confiar en V13_diseno/V23_diseno o
        # si debe caer al metodo rigido para esa direccion especifica.
        'V13_valido': V13_diseno is not None,
        'V23_valido': V23_diseno is not None,
    }

    # ── Campo completo (UNA sola grilla, coordenadas LOCALES) para el mapa
    # 2D del frontend -- Mx/My con el mismo flip de signo que momento_diseno
    # (para que el mapa calce con los valores puntuales), Mxy/V13/V23 sin
    # flip. Antes esto salia de 2 respuestas HTTP con 2 grillas DISTINTAS
    # (20x20 momento, 50x50 cortante) -- ahora es una sola, mas simple para
    # el frontend (ver foundation.js/zapataMomentLayer.js).
    campo_x = [i * hx for j in range(ny + 1) for i in range(nx + 1)]
    campo_y = [j * hy for j in range(ny + 1) for i in range(nx + 1)]
    campo_mx = [-M[(i, j)]['Mx'] for j in range(ny + 1) for i in range(nx + 1)]
    campo_my = [-M[(i, j)]['My'] for j in range(ny + 1) for i in range(nx + 1)]
    campo_mxy = [-M[(i, j)]['Mxy'] for j in range(ny + 1) for i in range(nx + 1)]
    campo_v13 = [Q[(i, j)]['Qx'] for j in range(ny + 1) for i in range(nx + 1)]
    campo_v23 = [Q[(i, j)]['Qy'] for j in range(ny + 1) for i in range(nx + 1)]

    # AGREGADO (ver conversacion): MMax/MMin (momentos principales, formula
    # de Mohr sobre Mx/My/Mxy -- las MISMAS componentes de arriba, ya con
    # el flip de signo) y VMax (resultante del cortante, sqrt(V13^2+V23^2))
    # -- pedido por el cliente, calzan con el selector "Component" de
    # ETABS. Son puro derivado algebraico de los campos que ya se
    # calculaban, sin ningun solve nuevo. F11/F22/F12 (fuerzas de
    # membrana) y sus derivados FMax/FMin/FVM NO se agregan -- ver
    # conversacion: requeririan extraer desplazamientos en el plano (no
    # solo la deflexion vertical w que ya se resuelve), y para esta carga
    # (presion perpendicular pura) saldrian practicamente cero en todos
    # lados -- no aportan nada al diseno de zapatas.
    campo_mmax = []
    campo_mmin = []
    campo_vmax = []
    for j in range(ny + 1):
        for i in range(nx + 1):
            mx_i, my_i, mxy_i = campo_mx[j * (nx + 1) + i], campo_my[j * (nx + 1) + i], campo_mxy[j * (nx + 1) + i]
            m_avg = (mx_i + my_i) / 2
            m_r = math.sqrt(((mx_i - my_i) / 2) ** 2 + mxy_i ** 2)
            campo_mmax.append(m_avg + m_r)
            campo_mmin.append(m_avg - m_r)
            vx_i, vy_i = campo_v13[j * (nx + 1) + i], campo_v23[j * (nx + 1) + i]
            campo_vmax.append(math.sqrt(vx_i ** 2 + vy_i ** 2))

    return {
        'momento_diseno': momento_diseno,
        'cortante_diseno': cortante_diseno,
        'campo_x': campo_x, 'campo_y': campo_y,
        'campo_mx': campo_mx, 'campo_my': campo_my, 'campo_mxy': campo_mxy,
        'campo_v13': campo_v13, 'campo_v23': campo_v23,
        'campo_mmax': campo_mmax, 'campo_mmin': campo_mmin, 'campo_vmax': campo_vmax,
    }


def _poligono_baricentricas(V0, V1, V2, P):
    e1x, e1y = V1[0] - V0[0], V1[1] - V0[1]
    e2x, e2y = V2[0] - V0[0], V2[1] - V0[1]
    px, py = P[0] - V0[0], P[1] - V0[1]
    det = e1x * e2y - e2x * e1y
    a = (px * e2y - e2x * py) / det
    b = (e1x * py - px * e1y) / det
    return a, b


def _poligono_triangulo_que_contiene(triangulos, punto, tol=1e-6):
    for (V0, V1, V2) in triangulos:
        a, b = _poligono_baricentricas(V0, V1, V2, punto)
        if a >= -tol and b >= -tol and a + b <= 1 + tol:
            return a, b
    return None


def _poligono_mejor_n(alpha, beta, n_objetivo, rango=15):
    # Mismo criterio que _ajustar_malla_para_columnas: busca SOLO hacia
    # mallas mas finas que la pedida (nunca mas gruesa), la que alinee mejor
    # la columna a un nodo real de la triangulacion baricentrica.
    candidatos = []
    for n in range(n_objetivo, n_objetivo + rango + 1):
        i, j = alpha * n, beta * n
        err = abs(i - round(i)) + abs(j - round(j))
        candidatos.append((err, n))
    candidatos.sort()
    return candidatos[0][1]


def _poligono_area_triangulo(a, b, c):
    return abs((b[0] - a[0]) * (c[1] - a[1]) - (c[0] - a[0]) * (b[1] - a[1])) / 2


def _poligono_area_con_signo(vertices):
    """Area con signo (formula del poligono/shoelace) -- positiva si los
    vertices estan en sentido ANTIHORARIO, negativa si estan en sentido
    HORARIO. No confundir con _poligono_area_triangulo (siempre positiva,
    para un solo triangulo)."""
    s = 0.0
    n = len(vertices)
    for i in range(n):
        x1, y1 = vertices[i]
        x2, y2 = vertices[(i + 1) % n]
        s += x1 * y2 - x2 * y1
    return s / 2.0


def _poligono_normalizar_antihorario(vertices):
    """AGREGADO (ver conversacion, "orientacion del poligono" 2026-08-31):
    la convencion de signo de M11/M22/M12 que reporta ETABS para un
    elemento de area depende de su eje normal local (3), que a su vez
    depende del orden en que se dibujaron sus vertices (regla de la mano
    derecha) -- confirmado con datos reales (F18, dibujado en sentido
    HORARIO en el modelo real del cliente/e2k, dio M11/M22 con el signo
    exactamente invertido respecto a F10/F12/F16, que estan en sentido
    ANTIHORARIO). En vez de "adivinar" la orientacion de cada caso o pedir
    que el usuario dibuje siempre igual, se NORMALIZA siempre a
    antihorario aca, ANTES de construir la malla -- asi el calculo interno
    (y su convencion de signo M11/M22, ya validada extensamente en sentido
    antihorario) es SIEMPRE consistente sin importar el orden real con que
    el usuario dibujo el poligono en el CAD.
    Devuelve (vertices_normalizados, se_invirtio).
    """
    if _poligono_area_con_signo(vertices) < 0:
        return list(reversed(vertices)), True
    return list(vertices), False


def _poligono_generar_malla(triangulos, n):
    """Malla conforme de una triangulacion en abanico: cada triangulo se
    subdivide en n^2 sub-triangulos via coordenadas baricentricas, y los
    nodos que caen sobre una arista COMPARTIDA entre 2 triangulos del
    abanico (diagonales internas) se reusan (registro por coordenada
    redondeada) en vez de duplicarse -- asi la malla queda conectada."""
    registro = {}
    coords = {}
    elementos = []
    contador = [1]

    def obtener_tag(x, y):
        key = (round(x, 9), round(y, 9))
        if key not in registro:
            registro[key] = contador[0]
            coords[contador[0]] = (x, y)
            contador[0] += 1
        return registro[key]

    for (V0, V1, V2) in triangulos:
        malla_local = {}
        for i in range(n + 1):
            for j in range(n + 1 - i):
                x = V0[0] + (i / n) * (V1[0] - V0[0]) + (j / n) * (V2[0] - V0[0])
                y = V0[1] + (i / n) * (V1[1] - V0[1]) + (j / n) * (V2[1] - V0[1])
                malla_local[(i, j)] = obtener_tag(x, y)
        for i in range(n):
            for j in range(n - i):
                elementos.append((malla_local[(i, j)], malla_local[(i + 1, j)], malla_local[(i, j + 1)]))
                if j < n - i - 1:
                    elementos.append((malla_local[(i + 1, j)], malla_local[(i + 1, j + 1)], malla_local[(i, j + 1)]))

    return coords, elementos


def calcular_zapata_shell_poligono_aislado(
    puntos,             # [{'x':.., 'y':..}, ...] vertices del poligono en orden (convexo o "en abanico" desde el vertice 0)
    columna_x, columna_y,
    columna_bx, columna_by,
    h, E, nu, q,
    n=40,               # divisiones por lado de cada triangulo del abanico (resolucion base)
    recubrimiento=0.075,
):
    """
    Zapata AISLADA de forma NO rectangular (triangular, trapezoidal, o
    cualquier poligono simple razonablemente convexo) -- ver conversacion:
    el metodo rigido (Bloque 3, computeIsolatedOverhangs/
    computeIsolatedFootingMoment en footingMoments.js) asume 2 voladizos
    independientes de ANCHO CONSTANTE, lo cual da resultados no confiables
    contra ETABS real (519% de mas en un caso, 49% de MENOS -- del lado
    inseguro -- en otro) cuando el ancho de la zapata varia a lo largo del
    voladizo (justo el caso de un triangulo o un trapecio). Esta funcion
    resuelve un FEM real en vez de asumir la formula de viga.

    Malla: la forma se triangula "en abanico" desde su primer vertice
    (valido para poligonos convexos, que es el caso de triangulos y
    trapecios reales) y cada triangulo del abanico se subdivide con el
    elemento `ShellDKGT` (hermano triangular de ShellDKGQ, que ya usamos y
    validamos en el resto de este archivo -- misma familia "Discrete
    Kirchhoff", mismo tipo de precision, confirmado en caso de control
    propio: 0.19% contra la solucion exacta de Timoshenko para placa
    cuadrada simplemente apoyada, L/h=4). Validado ademas contra 2 casos
    reales de ETABS (zapata triangular y trapezoidal aisladas reales,
    ver memoria del proyecto): 1-16% de error, muy por debajo del 49-519%
    del metodo rigido.

    Igual que en el resto de solvers de este archivo, la columna se alinea
    a un nodo REAL de la malla (mismo criterio que _ajustar_malla_para_
    columnas) para evitar el error de "columna flotando entre nodos" ya
    encontrado y corregido en las demas formas.

    Extraccion de momento: a diferencia de la malla rectangular (donde la
    curvatura sale de diferencias finitas centradas sobre 4 vecinos en
    cruz), una malla triangular no tiene un stencil regular -- se usa un
    AJUSTE LOCAL por minimos cuadrados de un polinomio cuadratico
    w=a+bX+cY+dX^2+eXY+fY^2 (coordenadas locales relativas al nodo),
    usando el nodo y sus vecinos directos (mismo principio general que la
    tecnica de recuperacion de curvatura "Superconvergent Patch Recovery",
    ya identificada en la investigacion de este proyecto como alternativa
    real a diferencias finitas).

    NO calcula cortante (Bloque 6 sigue con el metodo rigido para esta
    forma, igual decision que ya se tomo para la L combinada) -- alcance
    deliberadamente acotado a Bloque 3b (momento de referencia).

    Lanza ValueError si la columna no cae dentro de ningun triangulo del
    abanico (poligono no convexo desde el vertice 0, o columna fuera de la
    forma) -- el llamador (endpoint HTTP) debe capturarlo y devolver un
    error legible en vez de romper el pipeline.
    """
    vertices = [(float(p['x']), float(p['y'])) for p in puntos]
    if len(vertices) < 3:
        raise ValueError('un poligono necesita al menos 3 vertices')

    # AGREGADO (ver conversacion, "M11/M22 invertido en zapata aislada
    # triangular" -- caso real F2): esta funcion NUNCA llamaba a
    # _poligono_normalizar_antihorario (definida mas abajo pero sin usar en
    # todo el archivo) -- por eso el flip fijo (-Mx,-My) de mas abajo, que
    # SI fue validado contra F16 (dibujado antihorario), da el signo
    # invertido en F2 (dibujado horario, area con signo negativa,
    # confirmado). Se normaliza aca, ANTES de la triangulacion en abanico,
    # exactamente como ya se penso hacer (ver docstring de la funcion) --
    # asi el flip fijo de abajo queda valido sin importar el orden real con
    # que se dibujo el poligono.
    vertices, _ = _poligono_normalizar_antihorario(vertices)

    v0 = vertices[0]
    triangulos = [(v0, vertices[i], vertices[i + 1]) for i in range(1, len(vertices) - 1)]

    columna = (columna_x, columna_y)
    bary = _poligono_triangulo_que_contiene(triangulos, columna)
    if bary is None:
        raise ValueError('la columna no cae dentro de la triangulacion del poligono (forma no convexa o columna fuera de la zapata)')
    alpha, beta = bary
    n_ajustado = _poligono_mejor_n(alpha, beta, n)

    coords, elementos = _poligono_generar_malla(triangulos, n_ajustado)

    d = max(0.0, h - recubrimiento)

    ops.wipe()
    ops.model('basic', '-ndm', 3, '-ndf', 6)
    sec_tag = 1
    ops.section('ElasticMembranePlateSection', sec_tag, E, nu, h, 0.0, 1.0)

    for tag, (x, y) in coords.items():
        ops.node(tag, float(x), float(y), 0.0)

    adyacencia = {tag: set() for tag in coords}
    area_nodo = {tag: 0.0 for tag in coords}
    ele_tag = 1
    for (n1, n2, n3) in elementos:
        ops.element('ShellDKGT', ele_tag, n1, n2, n3, sec_tag)
        ele_tag += 1
        area_el = _poligono_area_triangulo(coords[n1], coords[n2], coords[n3])
        for k in (n1, n2, n3):
            area_nodo[k] += area_el / 3
        for x1, x2 in [(n1, n2), (n2, n3), (n3, n1)]:
            adyacencia[x1].add(x2)
            adyacencia[x2].add(x1)

    def _dist2(p, q_):
        return (p[0] - q_[0]) ** 2 + (p[1] - q_[1]) ** 2

    col_tag = min(coords, key=lambda t: _dist2(coords[t], columna))
    ops.fix(col_tag, 1, 1, 1, 1, 1, 1)

    ops.timeSeries('Linear', 1)
    ops.pattern('Plain', 1, 1)
    for tag in coords:
        ops.load(tag, 0.0, 0.0, q * area_nodo[tag], 0.0, 0.0, 0.0)

    ops.system('BandGeneral')
    ops.numberer('RCM')
    ops.constraints('Transformation')
    ops.integrator('LoadControl', 1.0)
    ops.algorithm('Linear')
    ops.analysis('Static')
    ok = ops.analyze(1)
    if ok != 0:
        raise RuntimeError(f'El analisis no convergio (codigo {ok}).')

    D = E * h ** 3 / (12 * (1 - nu ** 2))

    def _w_en(tag):
        return ops.nodeDisp(tag, 3)

    def _ajuste_curvatura(k0):
        vecinos = set(adyacencia[k0])
        anillo2 = set()
        for v in vecinos:
            anillo2 |= adyacencia[v]
        candidatos = {k0} | vecinos
        if len(candidatos) < 6:
            candidatos |= anillo2
        x0, y0 = coords[k0]
        filas, valores = [], []
        for k in candidatos:
            x, y = coords[k]
            X, Y = x - x0, y - y0
            filas.append([1.0, X, Y, X * X, X * Y, Y * Y])
            valores.append(_w_en(k))
        AtA = [[0.0] * 6 for _ in range(6)]
        Atb = [0.0] * 6
        for row, val in zip(filas, valores):
            for a in range(6):
                Atb[a] += row[a] * val
                for b in range(6):
                    AtA[a][b] += row[a] * row[b]
        M = [AtA[a][:] + [Atb[a]] for a in range(6)]
        for col in range(6):
            piv = max(range(col, 6), key=lambda r: abs(M[r][col]))
            M[col], M[piv] = M[piv], M[col]
            for r in range(6):
                if r != col and abs(M[col][col]) > 1e-14:
                    factor = M[r][col] / M[col][col]
                    for cc in range(7):
                        M[r][cc] -= factor * M[col][cc]
        coef = [M[a][6] / M[a][a] if abs(M[a][a]) > 1e-14 else 0.0 for a in range(6)]
        _, _, _, dd, ee, ff = coef
        wxx, wyy, wxy = 2 * dd, 2 * ff, ee
        Mx = D * (wxx + nu * wyy)
        My = D * (wyy + nu * wxx)
        Mxy = D * (1 - nu) * wxy
        return Mx, My, Mxy

    def _nodo_mas_cercano(punto):
        return min(coords, key=lambda t: _dist2(coords[t], punto))

    half_b, half_h = columna_bx / 2, columna_by / 2
    k_mas_x = _nodo_mas_cercano((columna_x + half_b, columna_y))
    k_menos_x = _nodo_mas_cercano((columna_x - half_b, columna_y))
    k_mas_y = _nodo_mas_cercano((columna_x, columna_y + half_h))
    k_menos_y = _nodo_mas_cercano((columna_x, columna_y - half_h))

    Mx_mas, _, _ = _ajuste_curvatura(k_mas_x)
    Mx_menos, _, _ = _ajuste_curvatura(k_menos_x)
    _, My_mas, _ = _ajuste_curvatura(k_mas_y)
    _, My_menos, _ = _ajuste_curvatura(k_menos_y)

    # QUITADO (ver conversacion, "M11/M22 invertido en zapata aislada
    # triangular" -- caso real F2): este flip (-Mx,-My) se habia copiado
    # "por analogia" de calcular_zapata_shell_completo (metodo de
    # DIFERENCIAS FINITAS sobre malla rectangular), pero calcular_zapata_
    # shell_poligono_aislado usa un metodo distinto (ajuste por minimos
    # cuadrados de un polinomio cuadratico, ver _ajuste_curvatura) -- NUNCA
    # se revalido de forma independiente para este metodo. Confirmado con
    # datos reales de ETABS (F2, tabla cruda "Element Forces - Area
    # Shells", 224 puntos comparables): CON este flip, Mx/My daban 0/87 y
    # 0/160 aciertos de signo (100% invertido); SIN el flip (usando Mx_mas/
    # Mx_menos/My_mas/My_menos tal cual salen de _ajuste_curvatura, tal
    # como ya se hacia con Mxy, que nunca tuvo flip y siempre dio bien),
    # 87/87 y 160/160 aciertos de signo, con -2.3%/-0.1% de mediana de
    # error -- excelente. La "validacion contra F16" que justificaba este
    # flip no volvio a probarse con la tabla cruda (a diferencia de este
    # caso); dado el resultado tan limpio aca, se quita el flip.
    Mx_cara_mas_x, Mx_cara_menos_x = Mx_mas, Mx_menos
    My_cara_mas_y, My_cara_menos_y = My_mas, My_menos

    momento_diseno = {
        'columna_bx': columna_bx, 'columna_by': columna_by,
        'Mx_cara_mas_x': Mx_cara_mas_x, 'Mx_cara_menos_x': Mx_cara_menos_x,
        'My_cara_mas_y': My_cara_mas_y, 'My_cara_menos_y': My_cara_menos_y,
        'Mx_diseno': max(Mx_cara_mas_x, Mx_cara_menos_x, key=abs),
        'My_diseno': max(My_cara_mas_y, My_cara_menos_y, key=abs),
    }

    # AGREGADO (ver conversacion, "8 componentes en zapatas aisladas
    # poligonales" 2026-08-31): campo completo (M11/M22/M12/MMax/MMin) en
    # TODOS los nodos.
    # QUITADO el flip (-Mx,-My) que tenia esto antes -- ver comentario
    # grande junto a Mx_cara_mas_x/My_cara_mas_y mas arriba (misma
    # correccion, mismo caso real F2 que la desmintio).
    campo_por_nodo = {}
    for tag in coords:
        mx, my, mxy = _ajuste_curvatura(tag)
        m_avg = (mx + my) / 2
        m_r = math.sqrt(((mx - my) / 2) ** 2 + mxy ** 2)
        campo_por_nodo[tag] = {'Mx': mx, 'My': my, 'Mxy': mxy, 'MMax': m_avg + m_r, 'MMin': m_avg - m_r}

    # AGREGADO (ver conversacion, "8 componentes" 2026-08-31), CORREGIDO
    # (ver conversacion, "profundizar V13/V23", caso real F2, tras arreglar
    # el flip de signo de Mx/My arriba): V13/V23 via la misma relacion de
    # equilibrio de placas (Qx=dMx/dx+dMxy/dy, Qy=dMxy/dx+dMy/dy) que ya usa
    # calcular_zapata_shell_combinada(), pero la malla triangular no tiene
    # un stencil regular para diferencias finitas -- se deriva el campo M
    # YA CALCULADO (arriba) con un ajuste local por minimos cuadrados
    # (_gradiente_cuadratico, mismo orden que _ajuste_curvatura).
    # La nota anterior aca ("NINGUN signo da un resultado consistente",
    # -44% a -156%) resulto ser sintoma del bug de Mx/My (ver flip quitado
    # mas arriba) -- con Mx/My ya con el signo correcto, probado de nuevo
    # contra ETABS real (F2, 224 puntos de la tabla cruda): V23 con buen
    # acuerdo (-5.6% de mediana, subiendo el ajuste de lineal a cuadratico
    # mejoro esto de -12.1%); V13 sigue subestimando ~40% de forma
    # consistente (no mejoro ni con vecindario mas amplio ni con ajuste de
    # mayor orden -- descarta falta de precision numerica generica, apunta
    # a algo mas especifico de la asimetria X/Y de esta geometria, sin
    # explicacion confirmada todavia). SE EXPONE al frontend (a diferencia
    # de antes) con advertencia de "en calibracion" -- ver run_zapata_
    # shell_poligono_design en app.py.
    # ACTUALIZADO (ver conversacion, "profundizar V13/V23" -- caso real F2):
    # antes este ajuste era LINEAL (3 coeficientes: 1,X,Y) -- se subio a
    # CUADRATICO (6 coeficientes, mismo orden que _ajuste_curvatura de
    # arriba) porque, probado contra la tabla cruda de ETABS, mejoro V23
    # de forma medible (-12.1% -> -5.6% de mediana) sin empeorar nada. V13
    # NO cambio (-40.3% de mediana en ambos casos, identico) -- confirma
    # que su sesgo restante NO es por falta de orden/precision del ajuste
    # (se probo tambien vecindario mas amplio, sin efecto) sino algo mas
    # especifico de esta geometria (asimetria X/Y), pendiente de investigar
    # mas a fondo -- se deja documentado, no se sigue ajustando a ciegas.
    def _gradiente_cuadratico(k0, campo):
        vecinos = set(adyacencia[k0])
        anillo2 = set()
        for v in vecinos:
            anillo2 |= adyacencia[v]
        candidatos = {k0} | vecinos
        if len(candidatos) < 6:
            candidatos |= anillo2
        x0, y0 = coords[k0]
        filas, valores = [], []
        for k in candidatos:
            x, y = coords[k]
            X, Y = x - x0, y - y0
            filas.append([1.0, X, Y, X * X, X * Y, Y * Y])
            valores.append(campo_por_nodo[k][campo])
        AtA = [[0.0] * 6 for _ in range(6)]
        Atb = [0.0] * 6
        for row, val in zip(filas, valores):
            for a in range(6):
                Atb[a] += row[a] * val
                for b in range(6):
                    AtA[a][b] += row[a] * row[b]
        M = [AtA[a][:] + [Atb[a]] for a in range(6)]
        for col in range(6):
            piv = max(range(col, 6), key=lambda r: abs(M[r][col]))
            M[col], M[piv] = M[piv], M[col]
            for r in range(6):
                if r != col and abs(M[col][col]) > 1e-14:
                    factor = M[r][col] / M[col][col]
                    for cc in range(7):
                        M[r][cc] -= factor * M[col][cc]
        coef = [M[a][6] / M[a][a] if abs(M[a][a]) > 1e-14 else 0.0 for a in range(6)]
        return coef[1], coef[2]  # d(campo)/dx, d(campo)/dy, en (X,Y)=(0,0)

    for tag in coords:
        dmx_dx, _ = _gradiente_cuadratico(tag, 'Mx')
        _, dmxy_dy = _gradiente_cuadratico(tag, 'Mxy')
        dmxy_dx, _ = _gradiente_cuadratico(tag, 'Mxy')
        _, dmy_dy = _gradiente_cuadratico(tag, 'My')
        v13 = -(dmx_dx + dmxy_dy)
        v23 = -(dmxy_dx + dmy_dy)
        campo_por_nodo[tag]['V13'] = v13
        campo_por_nodo[tag]['V23'] = v23
        campo_por_nodo[tag]['VMax'] = math.hypot(v13, v23)

    campo_x = [coords[tag][0] for tag in coords]
    campo_y = [coords[tag][1] for tag in coords]
    campo_mx = [campo_por_nodo[tag]['Mx'] for tag in coords]
    campo_my = [campo_por_nodo[tag]['My'] for tag in coords]
    campo_mxy = [campo_por_nodo[tag]['Mxy'] for tag in coords]
    campo_mmax = [campo_por_nodo[tag]['MMax'] for tag in coords]
    campo_mmin = [campo_por_nodo[tag]['MMin'] for tag in coords]
    campo_v13 = [campo_por_nodo[tag]['V13'] for tag in coords]
    campo_v23 = [campo_por_nodo[tag]['V23'] for tag in coords]
    campo_vmax = [campo_por_nodo[tag]['VMax'] for tag in coords]

    return {
        'momento_diseno': momento_diseno,
        'd': d, 'n': n_ajustado, 'num_nodos': len(coords), 'num_elementos': len(elementos),
        'campo_x': campo_x, 'campo_y': campo_y,
        'campo_mx': campo_mx, 'campo_my': campo_my, 'campo_mxy': campo_mxy,
        'campo_mmax': campo_mmax, 'campo_mmin': campo_mmin,
        'campo_v13': campo_v13, 'campo_v23': campo_v23, 'campo_vmax': campo_vmax,
    }


if __name__ == '__main__':
    # Caso de prueba: Zapata "29" del cliente -- σ=8 tonf/m2 uniforme
    # (Csuelo), replicando exacto los pasos de sus capturas de ETABS.
    # Dimensiones/espesor son un supuesto razonable (2x2m, h=0.4m,
    # f'c=210kg/cm2) mientras se confirma el caso exacto -- lo importante
    # por ahora es verificar que el METODO reproduce el patron de ETABS
    # (pico concentrado en el nodo de la columna).
    fpc_kg_cm2 = 210
    E_kg_cm2 = 15000 * (fpc_kg_cm2 ** 0.5)   # Ec = 15000*sqrt(f'c), formula E.060
    E_tonf_m2 = E_kg_cm2 * 10                 # 1 kgf/cm2 = 10 Tonf/m2

    r = calcular_zapata_shell(
        Lx=2.0, Ly=2.0, h=0.4,
        E=E_tonf_m2, nu=0.2,
        q=8.0,
        columna_x=1.0, columna_y=1.0,
        columna_bx=0.30, columna_by=0.30,  # SUPUESTO -- confirmar con el cliente
        nx=40, ny=40,
    )

    ic, jc = r['i_col'], r['j_col']
    nx = 40
    by_ij = {(e['i'], e['j']): e for e in r['resultados']}
    md = r['momento_diseno']

    print('=== Zapata shell, 2x2m centrada, q=8 Tonf/m2 (E.060 f\'c=210) ===')
    print(f'Columna asumida: {md["columna_bx"]*100:.0f}x{md["columna_by"]*100:.0f}cm (SUPUESTO, confirmar con cliente)')
    print(f'Nodo de la columna: i={ic}, j={jc}')
    col = by_ij[(ic, jc)]
    print(f'  EN el nodo (singular, no usar):  Mx={col["Mx"]:.4f}  My={col["My"]:.4f}')
    print(f'  Mx en cara +X: {md["Mx_cara_mas_x"]:.4f}   Mx en cara -X: {md["Mx_cara_menos_x"]:.4f}')
    print(f'  My en cara +Y: {md["My_cara_mas_y"]:.4f}   My en cara -Y: {md["My_cara_menos_y"]:.4f}')
    print(f'  >>> Mx de diseno (cara de columna): {md["Mx_diseno"]:.4f}')
    print(f'  >>> My de diseno (cara de columna): {md["My_diseno"]:.4f}   (referencia ETABS de otro caso real: 4.4934)')
    esquina = by_ij[(0, 0)]
    print(f'  Esquina (0,0):      w={esquina["w"]:.6f}  Mx={esquina["Mx"]:.4f}  My={esquina["My"]:.4f}')
