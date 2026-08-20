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
    # de columna, hacia el borde de la zapata -- NO en la cara misma. Si d
    # cae fuera de la zapata (volado muy corto), se clampea al borde --
    # limitacion conocida, no se ha probado ese caso todavia.
    d = max(0.0, h - recubrimiento)
    x_cara_mas = columna_x + columna_bx / 2 + d
    x_cara_menos = columna_x - columna_bx / 2 - d
    y_cara_mas = columna_y + columna_by / 2 + d
    y_cara_menos = columna_y - columna_by / 2 - d

    V13_mas = _interp_bilineal(Q, 'Qx', x_cara_mas / hx, j_col_f)
    V13_menos = _interp_bilineal(Q, 'Qx', x_cara_menos / hx, j_col_f)
    V23_mas = _interp_bilineal(Q, 'Qy', i_col_f, y_cara_mas / hy)
    V23_menos = _interp_bilineal(Q, 'Qy', i_col_f, y_cara_menos / hy)

    V13_diseno = max(V13_mas, V13_menos, key=abs)
    V23_diseno = max(V23_mas, V23_menos, key=abs)

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


def calcular_zapata_shell_combinada(
    Lx, Ly,              # dimensiones de la zapata en planta (m) -- rectangulo que contiene todas las columnas
    h,                    # espesor (m)
    E,                    # modulo de elasticidad del concreto (Tonf/m2)
    nu,                   # modulo de poisson
    q,                     # presion perpendicular uniforme (Tonf/m2), empuja hacia ARRIBA
    columnas,               # lista de dicts: {'x','y','bx','by'} -- posicion y tamano de CADA columna
    nx=20, ny=20,          # divisiones de malla
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
    """
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
        momentos_por_columna.append({
            'x': c['x'], 'y': c['y'],
            'Mx_diseno': max(cara_mas_x['Mx'], cara_menos_x['Mx'], key=abs),
            'My_diseno': max(cara_mas_y['My'], cara_menos_y['My'], key=abs),
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
