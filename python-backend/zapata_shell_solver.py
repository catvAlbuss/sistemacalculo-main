# python-backend/zapata_shell_solver.py
# -----------------------------------------------------------------------
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
        i = max(0, min(nx, i))
        j = max(0, min(ny, j))
        return ops.nodeDisp(node_map[(i, j)], 3)

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
        i = max(0, min(nx, i))
        j = max(0, min(ny, j))
        return ops.nodeDisp(node_map[(i, j)], 3)

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
        'Mx_cara_mas_x': -mx_cara_mas, 'Mx_cara_menos_x': -mx_cara_menos,
        'My_cara_mas_y': -my_cara_mas, 'My_cara_menos_y': -my_cara_menos,
        'Mx_diseno': max(-mx_cara_mas, -mx_cara_menos, key=abs),
        'My_diseno': max(-my_cara_mas, -my_cara_menos, key=abs),
        'Mxy_diseno': max(-mxy_cara_mas_x, -mxy_cara_menos_x, -mxy_cara_mas_y, -mxy_cara_menos_y, key=abs),
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
):
    """
    Igual principio que calcular_zapata_shell() (ShellDKGQ, carga uniforme
    como fuerzas nodales, apoyo puntual de 6 GDL fijos) pero para zapata
    COMBINADA: acepta una lista de columnas en vez de una sola. Cada columna
    restringe el nodo de malla mas cercano a su posicion (mismo criterio
    round() que la version de una columna).

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

    columnas_info = []
    for col in columnas:
        i_col = round(col['x'] / hx)
        j_col = round(col['y'] / hy)
        columna_node = node_map[(i_col, j_col)]
        ops.fix(columna_node, 1, 1, 1, 1, 1, 1)
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
        i = max(0, min(nx, i))
        j = max(0, min(ny, j))
        return ops.nodeDisp(node_map[(i, j)], 3)

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
            Mxy = -D * (1 - nu) * wxy
            resultados.append({'i': i, 'j': j, 'x': i * hx, 'y': j * hy, 'w': w_en(i, j), 'Mx': Mx, 'My': My, 'Mxy': Mxy})

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


def calcular_zapata_shell_trapezoidal_combinada(
    L,                    # longitud total (m), eje X de 0 a L
    B0, B1,                # ancho en x=0 y en x=L (m) -- varia LINEAL entre ambos
    h, E, nu,
    q,                     # presion uniforme (Tonf/m2), empuja hacia ARRIBA
    columnas,              # lista de dicts: {'x','y','bx','by'} -- 'y' es el
                           # OFFSET respecto al EJE CENTRAL de la viga (no
                           # absoluto), normalmente 0 (columna centrada, caso
                           # real de Bowles Ejemplo 9-2)
    nx=60, ny=20,
    recubrimiento=0.075,
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
    """
    d = max(0.0, h - recubrimiento)
    Bprime = (B1 - B0) / L

    def B_de(x):
        return B0 + Bprime * x

    nx = _ajustar_malla_para_columnas(L, [c['x'] for c in columnas], nx)

    ops.wipe()
    ops.model('basic', '-ndm', 3, '-ndf', 6)
    sec_tag = 1
    ops.section('ElasticMembranePlateSection', sec_tag, E, nu, h, 0.0, 1.0)

    hx = L / nx
    d_eta = 2.0 / ny
    node_tag = 1
    node_map = {}
    for j in range(ny + 1):
        eta_j = -1.0 + j * d_eta
        for i in range(nx + 1):
            x = i * hx
            Bi = B_de(x)
            y = eta_j * Bi / 2.0
            ops.node(node_tag, float(x), float(y), 0.0)
            node_map[(i, j)] = node_tag
            node_tag += 1

    ele_tag = 1
    elementos_ij = []
    for j in range(ny):
        for i in range(nx):
            n1, n2 = node_map[(i, j)], node_map[(i + 1, j)]
            n3, n4 = node_map[(i + 1, j + 1)], node_map[(i, j + 1)]
            ops.element('ShellDKGQ', ele_tag, n1, n2, n3, n4, sec_tag)
            elementos_ij.append((ele_tag, (i, j), (n1, n2, n3, n4)))
            ele_tag += 1

    # Restriccion de columnas: dado x, i_col=round(x/hx); dado el offset y
    # respecto al eje central, j_col se despeja de y=eta*B(x)/2.
    columnas_info = []
    for col in columnas:
        i_col = round(col['x'] / hx)
        Bi = B_de(i_col * hx)
        eta_col = (2.0 * col.get('y', 0.0)) / Bi
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
            yy = eta_jj * B_de(xx) / 2.0
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
        i = max(0, min(nx, i))
        j = max(0, min(ny, j))
        return ops.nodeDisp(node_map[(i, j)], 3)

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
        for i in range(nx + 1):
            x = i * hx
            Bi = B_de(x)
            k = Bprime / Bi

            w_xixi = W_xixi(i, j)
            w_etaeta = W_etaeta(i, j)
            w_xieta = W_xieta(i, j)
            w_eta = W_eta(i, j)

            wyy = (4.0 / Bi ** 2) * w_etaeta
            wxy = (2.0 / Bi) * (w_xieta - k * w_eta - eta * k * w_etaeta)
            wxx = w_xixi - 2 * eta * k * w_xieta + eta ** 2 * k ** 2 * w_etaeta + 2 * eta * k ** 2 * w_eta

            Mx = D * (wxx + nu * wyy)
            My = D * (wyy + nu * wxx)
            Mxy = -D * (1 - nu) * wxy
            y = eta * Bi / 2.0
            resultados.append({'i': i, 'j': j, 'x': x, 'y': y, 'w': w_en(i, j), 'Mx': Mx, 'My': My, 'Mxy': Mxy})

    by_ij = {(e['i'], e['j']): e for e in resultados}

    def _interp_bilineal(ti, tj):
        ti = max(0.0, min(float(nx), ti))
        tj = max(0.0, min(float(ny), tj))
        i0, j0 = int(math.floor(ti)), int(math.floor(tj))
        i1, j1 = min(nx, i0 + 1), min(ny, j0 + 1)
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
    # X (longitudinal) no cambia -- los bordes libres siguen en x=0 y x=L
    # sin importar el ancho. Y (transversal) usa B(x_columna)/2 como "Ly/2"
    # local de esa columna en vez de una constante.
    def hy_de(x):
        return B_de(x) / ny

    momentos_por_columna = []
    for c in columnas_info:
        x_col = c['x']
        Bi_col = B_de(x_col)
        i_off = (c['bx'] / 2) / hx
        j_off = (c['by'] / 2) / hy_de(x_col)

        cara_mas_x = _interp_bilineal(c['i_col'] + i_off, c['j_col'])
        cara_menos_x = _interp_bilineal(c['i_col'] - i_off, c['j_col'])

        REGION_D_FACTOR = 2.0
        volado_mas_x = L - (x_col + c['bx'] / 2)
        volado_menos_x = x_col - c['bx'] / 2
        volado_mas_y = Bi_col / 2 - c['y'] - c['by'] / 2
        volado_menos_y = Bi_col / 2 + c['y'] - c['by'] / 2

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
            i_ini = max(0, int(round(bpr_x_ini / hx)))
            i_fin = min(nx, int(round(bpr_x_fin / hx)))
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
        'd': d, 'nx': nx, 'ny': ny,
    }


def calcular_zapata_shell_L_combinada(
    Lx, Ly,                          # bounding box COMPLETO (incluye el rincon faltante)
    notch_x, notch_y,                 # corte del rincon faltante, coordenadas LOCALES (0..Lx, 0..Ly)
    notch_es_max_x, notch_es_max_y,    # que esquina del bounding box falta (ver splitFootingIntoLegs, footingMoments.js)
    h, E, nu, q,
    columnas,                          # lista de dicts: {'x','y','bx','by'} -- posicion ABSOLUTA en el bounding box
    nx=60, ny=60,
    recubrimiento=0.075,
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
        ops.fix(columna_node, 1, 1, 1, 1, 1, 1)
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
        i = max(0, min(nx, i))
        j = max(0, min(ny, j))
        if (i, j) in node_map:
            return ops.nodeDisp(node_map[(i, j)], 3)
        return None

    def w_en(i0, j0, di, dj):
        """Valor en (i0+di, j0+dj) respecto al nodo central (i0,j0) -- si
        ese vecino no existe (fuera del dominio global O dentro del rincon
        faltante), se sustituye por el valor del propio nodo central
        (pendiente cero) -- mismo criterio que ya usan TODOS los bordes
        libres de este archivo, extendido aca al borde del hueco."""
        v = w_en_real(i0 + di, j0 + dj)
        if v is not None:
            return v
        return w_en_real(i0, j0)

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
        Mxy = -D * (1 - nu) * wxy
        resultados.append({'i': i, 'j': j, 'x': i * hx, 'y': j * hy, 'w': w_en_real(i, j), 'Mx': Mx, 'My': My, 'Mxy': Mxy})

    by_ij = {(e['i'], e['j']): e for e in resultados}

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
        _, _, _, dd, _, ff = coef
        wxx, wyy = 2 * dd, 2 * ff
        Mx = D * (wxx + nu * wyy)
        My = D * (wyy + nu * wxx)
        return Mx, My

    def _nodo_mas_cercano(punto):
        return min(coords, key=lambda t: _dist2(coords[t], punto))

    half_b, half_h = columna_bx / 2, columna_by / 2
    k_mas_x = _nodo_mas_cercano((columna_x + half_b, columna_y))
    k_menos_x = _nodo_mas_cercano((columna_x - half_b, columna_y))
    k_mas_y = _nodo_mas_cercano((columna_x, columna_y + half_h))
    k_menos_y = _nodo_mas_cercano((columna_x, columna_y - half_h))

    Mx_mas, _ = _ajuste_curvatura(k_mas_x)
    Mx_menos, _ = _ajuste_curvatura(k_menos_x)
    _, My_mas = _ajuste_curvatura(k_mas_y)
    _, My_menos = _ajuste_curvatura(k_menos_y)

    # Mismo flip de signo que calcular_zapata_shell_completo (para calzar
    # con la convencion M11/M22 de ETABS) -- ver momento_diseno ahi mismo.
    Mx_cara_mas_x, Mx_cara_menos_x = -Mx_mas, -Mx_menos
    My_cara_mas_y, My_cara_menos_y = -My_mas, -My_menos

    momento_diseno = {
        'columna_bx': columna_bx, 'columna_by': columna_by,
        'Mx_cara_mas_x': Mx_cara_mas_x, 'Mx_cara_menos_x': Mx_cara_menos_x,
        'My_cara_mas_y': My_cara_mas_y, 'My_cara_menos_y': My_cara_menos_y,
        'Mx_diseno': max(Mx_cara_mas_x, Mx_cara_menos_x, key=abs),
        'My_diseno': max(My_cara_mas_y, My_cara_menos_y, key=abs),
    }

    return {
        'momento_diseno': momento_diseno,
        'd': d, 'n': n_ajustado, 'num_nodos': len(coords), 'num_elementos': len(elementos),
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
