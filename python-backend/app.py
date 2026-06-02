# python-backend/app.py
from flask import Flask, request, jsonify
from flask_cors import CORS
import traceback

app = Flask(__name__)
CORS(app)

# Intentar importar OpenSeesPy (soporta ambas versiones)
try:
    import openseespywin.opensees as ops
    OPENSEES_AVAILABLE = True
    print("✅ OpenSeesPyWin cargado correctamente")
except ImportError:
    try:
        import openseespy.opensees as ops
        OPENSEES_AVAILABLE = True
        print("✅ OpenSeesPy cargado correctamente")
    except ImportError as e:
        OPENSEES_AVAILABLE = False
        print(f"⚠️ OpenSeesPy no disponible: {e}")
        print("   El servidor funcionará en modo simulación")

@app.route('/health', methods=['GET'])
def health_check():
    return jsonify({
        'status': 'healthy',
        'engine': 'Flask',
        'opensees_available': OPENSEES_AVAILABLE
    })

@app.route('/api/opensees/status', methods=['GET'])
def opensees_status():
    return jsonify({
        'status': 'online' if OPENSEES_AVAILABLE else 'offline',
        'opensees_available': OPENSEES_AVAILABLE,
        'message': 'OpenSeesPy disponible' if OPENSEES_AVAILABLE else 'OpenSeesPy no instalado'
    })

@app.route('/api/analyze', methods=['POST'])
def analyze():
    """Endpoint principal de análisis"""
    
    if not OPENSEES_AVAILABLE:
        return jsonify({
            'success': False,
            'error': 'OpenSeesPy no está disponible',
            'message': 'El servidor está en modo simulación'
        }), 503
    
    try:
        data = request.json
        print(f"\n📥 Análisis recibido:")
        print(f"   Nodos: {len(data.get('nodes', []))}")
        print(f"   Elementos: {len(data.get('elements', []))}")
        
        # Ejecutar análisis con OpenSees
        results = run_opensees_analysis(data)
        
        print(f"✅ Análisis completado exitosamente")
        return jsonify(results)
        
    except Exception as e:
        print(f"❌ Error en análisis: {e}")
        traceback.print_exc()
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/api/analyze-3d', methods=['POST'])
def analyze_3d():
    """Análisis 3D completo con OpenSeesPy"""
    
    if not OPENSEES_AVAILABLE:
        return jsonify({
            'success': False,
            'error': 'OpenSeesPy no está disponible'
        }), 503
    
    try:
        data = request.json
        print(f"\n📥 Análisis 3D recibido:")
        print(f"   Nodos: {len(data.get('nodes', []))}")
        print(f"   Elementos: {len(data.get('elements', []))}")
        
        results = run_opensees_3d_analysis(data)
        
        print(f"✅ Análisis 3D completado")
        return jsonify(results)
        
    except Exception as e:
        print(f"❌ Error en análisis 3D: {e}")
        traceback.print_exc()
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

def run_opensees_3d_analysis(data):
    """Ejecuta análisis 3D con OpenSeesPy"""
    
    print("\n" + "="*60)
    print("🔍 ANÁLISIS 3D CON OPENSEES")
    print("="*60)
    
    ops.wipe()
    
    # ============================================================
    # 1. CONFIGURACIÓN DEL MODELO 3D
    # ============================================================
    # ndm = 3 (3 dimensiones), ndf = 6 (UX, UY, UZ, RX, RY, RZ)
    ops.model('basic', '-ndm', 3, '-ndf', 6)
    print("📐 Modelo 3D configurado (6 DOF por nodo)")
    
    # ============================================================
    # 2. CREAR NODOS 3D
    # ============================================================
    nodes = data.get('nodes', [])
    print("\n📍 NODOS 3D:")
    for node in nodes:
        node_id = node['id']
        x = node.get('x', 0)
        y = node.get('y', 0)
        z = node.get('z', 0)  # ← Coordenada Z para altura
        ops.node(node_id, x, y, z)
        print(f"   Nodo {node_id}: ({x}, {y}, {z})")
    
    # ============================================================
    # 3. DEFINIR MATERIAL
    # ============================================================
    E = data.get('material', {}).get('E', 200e9)  # Módulo de elasticidad
    nu = data.get('material', {}).get('nu', 0.3)  # Coeficiente de Poisson
    G = E / (2 * (1 + nu))  # Módulo de corte
    
    print(f"\n🔧 MATERIAL:")
    print(f"   E = {E} Pa")
    print(f"   G = {G} Pa")
    
    ops.uniaxialMaterial('Elastic', 1, E)
    
    # ============================================================
    # 4. CREAR ELEMENTOS (Vigas 3D)
    # ============================================================
    elements = data.get('elements', [])
    print("\n🔗 ELEMENTOS 3D:")
    
    for elem in elements:
        elem_id = elem['id']
        node_i = elem['node_i']
        node_j = elem['node_j']
        A = elem.get('area', 0.01)      # Área de sección (m²)
        Iz = elem.get('Iz', 0.0001)     # Momento inercia Z
        Iy = elem.get('Iy', 0.0001)     # Momento inercia Y
        J = elem.get('J', 1e-6)         # Constante de torsión
        
        # Elemento viga 3D elástica
        ops.element('elasticBeamColumn', elem_id, node_i, node_j, A, E, G, Iz, Iy, J)
        print(f"   Elemento {elem_id}: {node_i}→{node_j}, A={A} m²")
    
    # ============================================================
    # 5. APLICAR RESTRICCIONES (APOYOS 3D)
    # ============================================================
    supports = data.get('supports', [])
    print("\n🔒 APOYOS 3D:")
    
    for support in supports:
        node_id = support['node']
        ux = support.get('ux', 0)  # Fijo en X
        uy = support.get('uy', 0)  # Fijo en Y
        uz = support.get('uz', 0)  # Fijo en Z
        rx = support.get('rx', 0)  # Fijo en rotación X
        ry = support.get('ry', 0)  # Fijo en rotación Y
        rz = support.get('rz', 0)  # Fijo en rotación Z
        
        ops.fix(node_id, ux, uy, uz, rx, ry, rz)
        print(f"   Nodo {node_id}: UX={ux}, UY={uy}, UZ={uz}, RX={rx}, RY={ry}, RZ={rz}")
    
    # ============================================================
    # 6. APLICAR CARGAS 3D
    # ============================================================
    loads = data.get('loads', [])
    print("\n⬇️ CARGAS 3D:")
    
    ops.timeSeries('Linear', 1)
    ops.pattern('Plain', 1, 1)
    
    for load in loads:
        node_id = load['node']
        fx = load.get('fx', 0)
        fy = load.get('fy', 0)
        fz = load.get('fz', 0)
        mx = load.get('mx', 0)
        my = load.get('my', 0)
        mz = load.get('mz', 0)
        
        if fx != 0 or fy != 0 or fz != 0 or mx != 0 or my != 0 or mz != 0:
            ops.load(node_id, fx, fy, fz, mx, my, mz)
            print(f"   Nodo {node_id}: FX={fx}, FY={fy}, FZ={fz}")
    
    # ============================================================
    # 7. EJECUTAR ANÁLISIS
    # ============================================================
    print("\n⚙️ EJECUTANDO ANÁLISIS 3D...")
    
    ops.constraints('Transformation')
    ops.numberer('RCM')
    ops.system('BandGeneral')
    ops.test('NormDispIncr', 1e-6, 6)
    ops.algorithm('Newton')
    ops.integrator('LoadControl', 1.0)
    ops.analysis('Static')
    
    result = ops.analyze(1)
    print(f"   Resultado analyze(): {result}")
    
    if result < 0:
        raise Exception(f"Análisis falló con código {result}")
    
    ops.reactions()
    
    # ============================================================
    # 8. EXTRAER RESULTADOS
    # ============================================================
    print("\n📊 RESULTADOS 3D:")
    
    displacements = {}
    reactions = {}
    forces = {}
    
    # Desplazamientos y reacciones
    for node in nodes:
        node_id = node['id']
        disp = ops.nodeDisp(node_id)
        react = ops.nodeReaction(node_id)
        
        displacements[node_id] = {
            'dx': float(disp[0]), 'dy': float(disp[1]), 'dz': float(disp[2]),
            'rx': float(disp[3]), 'ry': float(disp[4]), 'rz': float(disp[5])
        }
        reactions[node_id] = {
            'fx': float(react[0]), 'fy': float(react[1]), 'fz': float(react[2]),
            'mx': float(react[3]), 'my': float(react[4]), 'mz': float(react[5])
        }
        
        print(f"\n   Nodo {node_id}:")
        print(f"      Desplazamiento: DX={disp[0]:.6f}, DY={disp[1]:.6f}, DZ={disp[2]:.6f}")
        print(f"      Reacción:       FX={react[0]:.2f}, FY={react[1]:.2f}, FZ={react[2]:.2f}")
    
    # Fuerzas en elementos
    for elem in elements:
        elem_id = elem['id']
        try:
            force = ops.eleForce(elem_id)
            forces[elem_id] = {
                'axial': float(force[0]),
                'shear_y': float(force[1]),
                'shear_z': float(force[2]),
                'torsion': float(force[3]),
                'moment_y': float(force[4]),
                'moment_z': float(force[5])
            }
            print(f"\n   Elemento {elem_id}: Axial={force[0]:.2f} N")
        except:
            forces[elem_id] = {'axial': 0, 'shear_y': 0, 'shear_z': 0, 'torsion': 0, 'moment_y': 0, 'moment_z': 0}
    
    ops.wipe()
    
    return {
        'success': True,
        'displacements': displacements,
        'reactions': reactions,
        'forces': forces,
        'message': 'Análisis 3D completado'
    }

@app.route('/api/opensees/test-structure', methods=['GET'])
def test_structure():
    """
    Endpoint de prueba con una estructura predefinida
    Esto te permite entender exactamente qué datos necesita OpenSees
    """
    try:
        print("\n" + "="*60)
        print("🧪 EJECUTANDO PRUEBA DE ESTRUCTURA PREDEFINIDA")
        print("="*60)
        
        # 1. Limpiar modelo anterior
        ops.wipe()
        
        # ============================================================
        # ESTRUCTURA DE PRUEBA: Viga simplemente apoyada
        # ============================================================
        
        print("\n📐 DEFINICIÓN DE LA ESTRUCTURA:")
        print("-"*40)
        
        # 2. Definir modelo: 2D con 3 grados de libertad por nodo
        ndm = 2  # Número de dimensiones (2D)
        ndf = 3  # Grados de libertad por nodo (UX, UY, RZ)
        ops.model('basic', '-ndm', ndm, '-ndf', ndf)
        print(f"   Modelo: {ndm}D con {ndf} DOF por nodo")
        
        # 3. CREAR NODOS
        # Formato: node(tag, x, y)
        print("\n📍 NODOS:")
        ops.node(1, 0.0, 0.0)   # Apoyo izquierdo
        print(f"   Nodo 1: (0.0, 0.0) - Apoyo articulado")
        
        ops.node(2, 2.0, 0.0)   # Centro de la viga
        print(f"   Nodo 2: (2.0, 0.0) - Punto de carga")
        
        ops.node(3, 4.0, 0.0)   # Apoyo derecho
        print(f"   Nodo 3: (4.0, 0.0) - Apoyo de rodillo")
        
        # 4. DEFINIR MATERIAL Y SECCIÓN
        print("\n🔧 MATERIAL Y SECCIÓN:")
        E = 200e9      # Módulo de elasticidad (Pa) - Acero
        A = 0.01       # Área de la sección (m²) - 100 cm²
        I = 8.33e-5    # Momento de inercia (m⁴)
        
        # section('Elastic', tag, E, A, I)
        ops.section('Elastic', 1, E, A, I)
        print(f"   Material: E = {E} Pa (Acero)")
        print(f"   Sección: A = {A} m², I = {I} m⁴")
        
        # 5. TRANSFORMACIÓN GEOMÉTRICA
        # geomTransf('Linear', tag)
        ops.geomTransf('Linear', 1)
        print(f"   Transformación: Lineal")
        
        # 6. CREAR ELEMENTOS
        print("\n🔗 ELEMENTOS:")
        # element('elasticBeamColumn', tag, node_i, node_j, section_tag, transf_tag)
        ops.element('elasticBeamColumn', 1, 1, 2, 1, 1)
        print(f"   Elemento 1: Nodo 1 → Nodo 2 (2.0 m)")
        
        ops.element('elasticBeamColumn', 2, 2, 3, 1, 1)
        print(f"   Elemento 2: Nodo 2 → Nodo 3 (2.0 m)")
        
        # 7. RESTRICCIONES (APOYOS)
        print("\n🔒 APOYOS:")
        # fix(node_tag, UX, UY, RZ)
        # 1 = restringido, 0 = libre
        
        ops.fix(1, 1, 1, 0)   # Nodo 1: UX=1, UY=1, RZ=0 (articulado)
        print(f"   Nodo 1: UX=1 (fijo), UY=1 (fijo), RZ=0 (libre) - Articulado")
        
        ops.fix(3, 0, 1, 0)   # Nodo 3: UX=0, UY=1, RZ=0 (rodillo)
        print(f"   Nodo 3: UX=0 (libre), UY=1 (fijo), RZ=0 (libre) - Rodillo")
        
        # 8. CARGAS
        print("\n⬇️ CARGAS:")
        # timeSeries('Linear', tag)
        ops.timeSeries('Linear', 1)
        
        # pattern('Plain', tag, timeSeries_tag)
        ops.pattern('Plain', 1, 1)
        
        # load(node_tag, FX, FY, MZ)
        ops.load(2, 0.0, -10000.0, 0.0)   # 10 kN hacia abajo en el centro
        print(f"   Nodo 2: FX=0, FY=-10000 N (↓ 10 kN), MZ=0")
        
        # 9. ANÁLISIS
        print("\n⚙️ EJECUTANDO ANÁLISIS...")
        print("-"*40)

        ops.system('BandSPD')
        ops.numberer('RCM')
        ops.constraints('Plain')
        ops.integrator('LoadControl', 1.0)
        ops.algorithm('Linear')
        ops.analysis('Static')

        result = ops.analyze(1)
        if result != 0:
            raise Exception(f"Análisis falló con código {result}")

        # ====== AGREGAR ESTA LÍNEA ======
        ops.reactions()  # ← Calcula las reacciones en los apoyos
        # ================================

        print("✅ Análisis completado exitosamente")
        
        # 10. EXTRAER RESULTADOS
        print("\n📊 RESULTADOS:")
        print("-"*40)
        
        # Desplazamientos
        print("\n📍 DESPLAZAMIENTOS:")
        disp1 = ops.nodeDisp(1)
        disp2 = ops.nodeDisp(2)
        disp3 = ops.nodeDisp(3)
        
        print(f"   Nodo 1: UX={disp1[0]:.6f} m, UY={disp1[1]:.6f} m, RZ={disp1[2]:.6f} rad")
        print(f"   Nodo 2: UX={disp2[0]:.6f} m, UY={disp2[1]:.6f} m, RZ={disp2[2]:.6f} rad")
        print(f"   Nodo 3: UX={disp3[0]:.6f} m, UY={disp3[1]:.6f} m, RZ={disp3[2]:.6f} rad")
        
        # Reacciones
        print("\n🔄 REACCIONES EN APOYOS:")
        react1 = ops.nodeReaction(1)
        react3 = ops.nodeReaction(3)
        
        print(f"   Nodo 1: RX={react1[0]:.2f} N, RY={react1[1]:.2f} N, RM={react1[2]:.2f} N·m")
        print(f"   Nodo 3: RX={react3[0]:.2f} N, RY={react3[1]:.2f} N, RM={react3[2]:.2f} N·m")
        
        # Fuerzas en elementos
        print("\n📐 FUERZAS EN ELEMENTOS:")
        force1 = ops.eleForce(1)
        force2 = ops.eleForce(2)
        
        print(f"   Elemento 1: Axial={force1[0]:.2f} N, Cortante={force1[1]:.2f} N, Momento={force1[2]:.2f} N·m")
        print(f"   Elemento 2: Axial={force2[0]:.2f} N, Cortante={force2[1]:.2f} N, Momento={force2[2]:.2f} N·m")
        
        # 11. CÁLCULOS TEÓRICOS PARA COMPARACIÓN
        print("\n📚 COMPARACIÓN TEÓRICA:")
        print("-"*40)
        
        P = 10000  # N
        L = 4.0    # m
        
        # Deflexión máxima teórica: δ = PL³/(48EI)
        delta_teorico = (P * L**3) / (48 * E * I)
        delta_opensees = abs(disp2[1])
        error_def = abs(delta_teorico - delta_opensees) / delta_teorico * 100
        
        print(f"   Deflexión máxima teórica: {delta_teorico:.6f} m ({delta_teorico*1000:.2f} mm)")
        print(f"   Deflexión OpenSees:        {delta_opensees:.6f} m ({delta_opensees*1000:.2f} mm)")
        print(f"   Error:                     {error_def:.4f}%")
        
        # Reacciones teóricas
        R1_teorico = P / 2  # 5000 N
        R3_teorico = P / 2  # 5000 N
        
        print(f"\n   Reacción Nodo 1 teórica: {R1_teorico:.2f} N")
        print(f"   Reacción OpenSees:       {react1[1]:.2f} N")
        print(f"   Reacción Nodo 3 teórica: {R3_teorico:.2f} N")
        print(f"   Reacción OpenSees:       {react3[1]:.2f} N")
        
        ops.wipe()
        
        print("\n" + "="*60)
        print("✅ PRUEBA COMPLETADA EXITOSAMENTE")
        print("="*60 + "\n")
        
        return jsonify({
            'success': True,
            'structure': {
                'nodes': [
                    {'id': 1, 'x': 0.0, 'y': 0.0},
                    {'id': 2, 'x': 2.0, 'y': 0.0},
                    {'id': 3, 'x': 4.0, 'y': 0.0}
                ],
                'elements': [
                    {'id': 1, 'node_i': 1, 'node_j': 2},
                    {'id': 2, 'node_i': 2, 'node_j': 3}
                ],
                'supports': [
                    {'node': 1, 'ux': 1, 'uy': 1, 'rz': 0},
                    {'node': 3, 'ux': 0, 'uy': 1, 'rz': 0}
                ],
                'loads': [
                    {'node': 2, 'fx': 0, 'fy': -10000, 'mz': 0}
                ],
                'material': {'E': E, 'A': A, 'I': I}
            },
            'results': {
                'displacements': {
                    '1': {'dx': float(disp1[0]), 'dy': float(disp1[1]), 'rot': float(disp1[2])},
                    '2': {'dx': float(disp2[0]), 'dy': float(disp2[1]), 'rot': float(disp2[2])},
                    '3': {'dx': float(disp3[0]), 'dy': float(disp3[1]), 'rot': float(disp3[2])}
                },
                'reactions': {
                    '1': {'rx': float(react1[0]), 'ry': float(react1[1]), 'rm': float(react1[2])},
                    '3': {'rx': float(react3[0]), 'ry': float(react3[1]), 'rm': float(react3[2])}
                },
                'forces': {
                    '1': {'axial': float(force1[0]), 'shear': float(force1[1]), 'moment': float(force1[2])},
                    '2': {'axial': float(force2[0]), 'shear': float(force2[1]), 'moment': float(force2[2])}
                }
            },
            'theoretical': {
                'max_deflection': delta_teorico,
                'reaction_1': R1_teorico,
                'reaction_3': R3_teorico,
                'error_deflection_percent': error_def
            }
        })
        
    except Exception as e:
        print(f"\n❌ ERROR: {e}")
        traceback.print_exc()
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500


# endpoint para una prueba simple de viga con carga axial
@app.route('/api/test-3d-simple', methods=['GET'])
def test_3d_simple():
    """Prueba simple de viga horizontal con carga axial"""
    
    try:
        ops.wipe()
        
        # Modelo 2D con 2 DOF por nodo (UX, UY) para simplicidad
        ops.model('basic', '-ndm', 2, '-ndf', 2)
        
        # Nodos
        ops.node(1, 0.0, 0.0)
        ops.node(2, 3.0, 0.0)
        
        # Material
        E = 200e9
        A = 0.01
        
        ops.uniaxialMaterial('Elastic', 1, E)
        
        # Elemento Truss
        ops.element('Truss', 1, 1, 2, A, 1)
        
        # Restricciones: Nodo 1 fijo en X y Y
        ops.fix(1, 1, 1)
        
        # Nodo 2 libre en X para que pueda deformarse
        ops.fix(2, 0, 1)  # Y fijo, X libre
        
        # Carga axial en X
        ops.timeSeries('Linear', 1)
        ops.pattern('Plain', 1, 1)
        ops.load(2, 10000.0, 0.0)  # FX = 10000 N
        
        # Análisis
        ops.constraints('Plain')
        ops.numberer('RCM')
        ops.system('BandGeneral')
        ops.test('NormDispIncr', 1e-6, 6)
        ops.algorithm('Linear')
        ops.integrator('LoadControl', 1.0)
        ops.analysis('Static')
        
        result = ops.analyze(1)
        
        if result != 0:
            raise Exception(f"Análisis falló con código {result}")
        
        # Desplazamiento
        disp = ops.nodeDisp(2)
        force = ops.eleForce(1)
        
        # Cálculo teórico: δ = (P*L)/(E*A)
        P = 10000.0
        L = 3.0
        delta_teorico = (P * L) / (E * A)
        
        print("\n" + "="*60)
        print("🧪 PRUEBA: VIGA CON CARGA AXIAL")
        print("="*60)
        print(f"📐 Longitud: {L} m")
        print(f"🔧 E = {E} Pa, A = {A} m²")
        print(f"⬇️ Carga axial: {P} N")
        print(f"\n📊 RESULTADOS:")
        print(f"   Desplazamiento OpenSees: {disp[0]:.6f} m ({disp[0]*1000:.3f} mm)")
        print(f"   Desplazamiento teórico: {delta_teorico:.6f} m ({delta_teorico*1000:.3f} mm)")
        print(f"   Fuerza axial: {force[0]:.2f} N")
        print("="*60 + "\n")
        
        return jsonify({
            'success': True,
            'displacement_mm': disp[0] * 1000,
            'theoretical_displacement_mm': delta_teorico * 1000,
            'axial_force_N': force[0],
            'error_percent': abs(delta_teorico - disp[0]) / delta_teorico * 100 if delta_teorico != 0 else 0
        })
        
    except Exception as e:
        print(f"❌ ERROR: {e}")
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/test-3d-column-alt', methods=['GET'])
def test_3d_column_alt():
    """Prueba de columna vertical usando elementos frame2D (simplificado)"""
    
    try:
        ops.wipe()
        
        # Usar modelo 2D con 3 DOF (UX, UY, RZ) para simular viga en voladizo
        ops.model('basic', '-ndm', 2, '-ndf', 3)
        
        # Nodos (X, Y) - Y es la altura
        ops.node(1, 0.0, 0.0)
        ops.node(2, 0.0, 3.0)  # Altura 3m en Y
        
        # Material
        E = 200e9
        A = 0.01
        I = 8.33e-5
        
        # Sección
        ops.section('Elastic', 1, E, A, I)
        
        # Transformación geométrica
        ops.geomTransf('Linear', 1)
        
        # Elemento viga
        ops.element('elasticBeamColumn', 1, 1, 2, 1, 1)
        
        # Base empotrada
        ops.fix(1, 1, 1, 1)
        
        # Carga horizontal en X en la punta
        ops.timeSeries('Linear', 1)
        ops.pattern('Plain', 1, 1)
        ops.load(2, 10000.0, 0.0, 0.0)
        
        # Análisis
        ops.constraints('Plain')
        ops.numberer('RCM')
        ops.system('BandGeneral')
        ops.test('NormDispIncr', 1e-6, 6)
        ops.algorithm('Newton')
        ops.integrator('LoadControl', 1.0)
        ops.analysis('Static')
        
        result = ops.analyze(1)
        
        if result != 0:
            raise Exception(f"Análisis falló con código {result}")
        
        disp = ops.nodeDisp(2)
        react = ops.nodeReaction(1)
        
        # Cálculo teórico: δ = P*L³/(3*E*I)
        P = 10000
        L = 3
        delta_teorico = (P * L**3) / (3 * E * I)
        
        print("\n" + "="*60)
        print("🧪 PRUEBA: COLUMNA VERTICAL (2D) CON CARGA HORIZONTAL")
        print("="*60)
        print(f"📐 Altura: {L} m")
        print(f"🔧 E = {E} Pa, I = {I} m⁴")
        print(f"⬇️ Carga horizontal: {P} N")
        print(f"\n📊 RESULTADOS:")
        print(f"   Desplazamiento X: {disp[0]:.6f} m ({disp[0]*1000:.3f} mm)")
        print(f"   Desplazamiento teórico: {delta_teorico:.6f} m ({delta_teorico*1000:.3f} mm)")
        print(f"   Momento en base: {react[2]:.2f} N·m")
        print(f"   Error: {abs(delta_teorico - disp[0]) / delta_teorico * 100:.4f}%")
        print("="*60 + "\n")
        
        return jsonify({
            'success': True,
            'displacement_mm': disp[0] * 1000,
            'theoretical_displacement_mm': delta_teorico * 1000,
            'moment_Nm': react[2],
            'error_percent': abs(delta_teorico - disp[0]) / delta_teorico * 100
        })
        
    except Exception as e:
        print(f"❌ ERROR: {e}")
        traceback.print_exc()
        return jsonify({'success': False, 'error': str(e)}), 500    
    
@app.route('/api/test-prueba', methods=['GET'])
def test_prueba():
    """
    PRUEBA: Pórtico 3D simple (2 columnas + 1 viga)
    - Altura: 3m
    - Luz: 5m
    - Carga horizontal de 50kN en la esquina superior izquierda
    """
    
    if not OPENSEES_AVAILABLE:
        return jsonify({
            'success': False,
            'error': 'OpenSeesPy no está disponible'
        }), 503
    
    print("\n" + "="*60)
    print("🧪 PRUEBA: PÓRTICO 3D SIMPLE")
    print("="*60)
    
    try:
        ops.wipe()
        
        # ============================================================
        # 1. CONFIGURACIÓN INICIAL
        # ============================================================
        ops.model('basic', '-ndm', 3, '-ndf', 6)
        print("📐 Modelo 3D configurado (6 DOF por nodo)")
        
        # ============================================================
        # 2. DEFINICIÓN DE NODOS (x, y, z)
        # ============================================================
        # Base (Z=0) - Apoyos empotrados
        ops.node(1, 0.0, 0.0, 0.0)
        ops.fix(1, 1, 1, 1, 1, 1, 1)
        print("📍 Nodo 1: (0, 0, 0) - Empotrado")
        
        ops.node(2, 5.0, 0.0, 0.0)
        ops.fix(2, 1, 1, 1, 1, 1, 1)
        print("📍 Nodo 2: (5, 0, 0) - Empotrado")
        
        # Nivel superior (Z=3)
        ops.node(3, 0.0, 0.0, 3.0)
        print("📍 Nodo 3: (0, 0, 3) - Esquina superior izquierda")
        
        ops.node(4, 5.0, 0.0, 3.0)
        print("📍 Nodo 4: (5, 0, 3) - Esquina superior derecha")
        
        # ============================================================
        # 3. PROPIEDADES DE SECCIONES Y MATERIALES
        # ============================================================
        E = 200e9         # Módulo de Young (Pa) - Acero
        G = 77e9          # Módulo de corte (Pa)
        A = 0.01          # Área (m²) - 100 cm²
        J = 0.0001        # Momento polar de inercia (m⁴)
        Iy = 0.0002       # Inercia eje local y (m⁴)
        Iz = 0.0005       # Inercia eje local z (m⁴)
        
        print(f"🔧 Material: E={E} Pa, G={G} Pa")
        print(f"📐 Sección: A={A} m², Iy={Iy} m⁴, Iz={Iz} m⁴")
        
        # ============================================================
        # 4. TRANSFORMACIÓN GEOMÉTRICA
        # ============================================================
        # Para columnas (orientación vertical)
        ops.geomTransf('Linear', 1, 0, 1, 0)
        print("🔄 Transformación 1: Columnas (eje Y como referencia)")
        
        # Para vigas (orientación horizontal)
        ops.geomTransf('Linear', 2, 0, 0, 1)
        print("🔄 Transformación 2: Vigas (eje Z como referencia)")
        
        # ============================================================
        # 5. DEFINICIÓN DE ELEMENTOS
        # ============================================================
        # Columna izquierda (nodo 1 → 3)
        ops.element('elasticBeamColumn', 1, 1, 3, A, E, G, J, Iy, Iz, 1)
        print("🔗 Elemento 1: Columna izquierda (N1→N3)")
        
        # Columna derecha (nodo 2 → 4)
        ops.element('elasticBeamColumn', 2, 2, 4, A, E, G, J, Iy, Iz, 1)
        print("🔗 Elemento 2: Columna derecha (N2→N4)")
        
        # Viga superior (nodo 3 → 4)
        ops.element('elasticBeamColumn', 3, 3, 4, A, E, G, J, Iy, Iz, 2)
        print("🔗 Elemento 3: Viga superior (N3→N4)")
        
        # ============================================================
        # 6. CARGAS
        # ============================================================
        ops.timeSeries('Linear', 1)
        ops.pattern('Plain', 1, 1)
        
        # Carga horizontal de 50kN en el nodo 3 (dirección X)
        ops.load(3, 50000.0, 0.0, 0.0, 0.0, 0.0, 0.0)
        print("⬇️ Carga: Nodo 3 - FX = 50,000 N (horizontal)")
        
        # ============================================================
        # 7. CONFIGURACIÓN DEL ANÁLISIS
        # ============================================================
        print("\n⚙️ EJECUTANDO ANÁLISIS...")
        print("-"*40)
        
        ops.system('BandSPD')
        ops.numberer('RCM')
        ops.constraints('Transformation')
        ops.integrator('LoadControl', 1.0)
        ops.algorithm('Linear')
        ops.analysis('Static')
        
        # ============================================================
        # 8. EJECUCIÓN Y RESULTADOS
        # ============================================================
        ok = ops.analyze(1)
        
        print("\n📊 RESULTADOS:")
        print("-"*40)
        
        if ok == 0:
            ops.reactions()
            # Desplazamientos
            disp1 = ops.nodeDisp(1)
            disp2 = ops.nodeDisp(2)
            disp3 = ops.nodeDisp(3)
            disp4 = ops.nodeDisp(4)
            
            
            print(f"\n📍 DESPLAZAMIENTOS:")
            print(f"   Nodo 3 (esquina superior izquierda):")
            print(f"      UX = {disp3[0]:.6f} m ({disp3[0]*1000:.3f} mm)")
            print(f"      UY = {disp3[1]:.6f} m")
            print(f"      UZ = {disp3[2]:.6f} m")
            
            print(f"\n   Nodo 4 (esquina superior derecha):")
            print(f"      UX = {disp4[0]:.6f} m ({disp4[0]*1000:.3f} mm)")
            print(f"      UY = {disp4[1]:.6f} m")
            print(f"      UZ = {disp4[2]:.6f} m")
            
            # Reacciones
            react1 = ops.nodeReaction(1)
            react2 = ops.nodeReaction(2)
            
            print(f"\n🔄 REACCIONES EN BASES:")
            print(f"   Nodo 1: FX={react1[0]:.2f} N, FZ={react1[2]:.2f} N, MY={react1[4]:.2f} N·m")
            print(f"   Nodo 2: FX={react2[0]:.2f} N, FZ={react2[2]:.2f} N, MY={react2[4]:.2f} N·m")
            
            # Fuerzas internas
            force1 = ops.eleForce(1)  # Columna izquierda
            force2 = ops.eleForce(2)  # Columna derecha
            force3 = ops.eleForce(3)  # Viga
            
            print(f"\n📐 FUERZAS INTERNAS:")
            print(f"   Columna izquierda: Axial={force1[0]:.2f} N, Momento Y={force1[4]:.2f} N·m")
            print(f"   Columna derecha:  Axial={force2[0]:.2f} N, Momento Y={force2[4]:.2f} N·m")
            print(f"   Viga:             Axial={force3[0]:.2f} N, Momento Y={force3[4]:.2f} N·m")
            
            # Verificación del equilibrio
            print(f"\n📚 VERIFICACIÓN DE EQUILIBRIO:")
            print(f"   Suma FX = {react1[0] + react2[0]:.2f} N (debe ser -50000 N)")
            print(f"   Suma FZ = {react1[2] + react2[2]:.2f} N")
            
            ops.wipe()
            
            print("\n" + "="*60)
            print("✅ PRUEBA COMPLETADA EXITOSAMENTE")
            print("="*60 + "\n")
            
            return jsonify({
                'success': True,
                'test_name': 'Pórtico 3D simple',
                'geometry': {
                    'width': 5.0,
                    'height': 3.0,
                    'load': 50000
                },
                'results': {
                    'displacements': {
                        'node3_mm': disp3[0] * 1000,
                        'node4_mm': disp4[0] * 1000
                    },
                    'reactions': {
                        'node1': {'fx': float(react1[0]), 'fz': float(react1[2]), 'my': float(react1[4])},
                        'node2': {'fx': float(react2[0]), 'fz': float(react2[2]), 'my': float(react2[4])}
                    },
                    'internal_forces': {
                        'col_left_axial': float(force1[0]),
                        'col_left_moment': float(force1[4]),
                        'col_right_axial': float(force2[0]),
                        'col_right_moment': float(force2[4]),
                        'beam_axial': float(force3[0]),
                        'beam_moment': float(force3[4])
                    }
                }
            })
        else:
            raise Exception(f"Análisis falló con código {ok}")
        
    except Exception as e:
        print(f"\n❌ ERROR: {e}")
        traceback.print_exc()
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500
    finally:
        ops.wipe()

def run_opensees_analysis(data):
    """Ejecuta el análisis real con OpenSeesPy - Versión Truss"""
    
    print("\n" + "="*60)
    print("🔍 DEPURACIÓN - USANDO ELEMENTO TRUSS")
    print("="*60)
    
    ops.wipe()
    
    nodes = data.get('nodes', [])
    ndm = 2
    ndf = 2  # ← CAMBIADO: Solo 2 DOF para Truss (UX, UY)
    
    print(f"\n📐 Configurando modelo {ndm}D con {ndf} DOF (Truss)")
    ops.model('basic', '-ndm', ndm, '-ndf', ndf)
    
    # Nodos
    print("\n📍 NODOS CREADOS:")
    for node in nodes:
        node_id = node['id']
        x = node['x']
        y = node['y']
        ops.node(node_id, x, y)
        print(f"   Nodo {node_id}: ({x}, {y})")
    
    # Material (uniaxial)
    E = 200e9
    print(f"\n🔧 MATERIAL:")
    print(f"   E = {E} Pa")
    ops.uniaxialMaterial('Elastic', 1, E)
    
    # Elementos Truss
    print("\n🔗 ELEMENTOS TRUSS CREADOS:")
    elements = data.get('elements', [])
    for element in elements:
        elem_id = element['id']
        node_i = element['node_i']
        node_j = element['node_j']
        A_elem = element.get('area', 0.01)
        
        # Elemento Truss: ops.element('Truss', tag, node_i, node_j, A, material_tag)
        ops.element('Truss', elem_id, node_i, node_j, A_elem, 1)
        print(f"   Elemento {elem_id}: {node_i}→{node_j}, A={A_elem} m²")
    
    # Apoyos (solo UX, UY - sin RZ)
    print("\n🔒 APOYOS:")
    supports = data.get('supports', [])
    for support in supports:
        node_id = support['node']
        ux = support.get('ux', 0)
        uy = support.get('uy', 0)
        ops.fix(node_id, ux, uy)
        print(f"   Nodo {node_id}: UX={ux}, UY={uy}")
    
    # Cargas
    print("\n⬇️ CARGAS:")
    ops.timeSeries('Linear', 1)
    ops.pattern('Plain', 1, 1)
    
    loads = data.get('loads', [])
    for load in loads:
        node_id = load['node']
        fx = load.get('fx', 0)
        fy = load.get('fy', 0)
        
        if fx != 0 or fy != 0:
            ops.load(node_id, fx, fy)
            print(f"   Nodo {node_id}: FX={fx}, FY={fy}")
    
    # Análisis
    print("\n⚙️ EJECUTANDO ANÁLISIS...")
    
    ops.constraints('Plain')
    ops.numberer('RCM')
    ops.system('BandGeneral')
    ops.algorithm('Linear')
    ops.integrator('LoadControl', 1.0)
    ops.analysis('Static')
    
    result = ops.analyze(1)
    print(f"   Resultado analyze(): {result}")
    
    if result < 0:
        raise Exception(f"Análisis falló con código {result}")
    
    ops.reactions()
    
    # Extraer resultados
    print("\n📊 RESULTADOS:")
    displacements = {}
    reactions = {}
    forces = {}
    
    for node in nodes:
        node_id = node['id']
        disp = ops.nodeDisp(node_id)
        react = ops.nodeReaction(node_id)
        
        print(f"\n   Nodo {node_id}:")
        print(f"      Desplazamiento: DX={disp[0]:.6f}, DY={disp[1]:.6f}")
        print(f"      Reacción:       RX={react[0]:.2f}, RY={react[1]:.2f}")
        
        displacements[node_id] = {'dx': float(disp[0]), 'dy': float(disp[1]), 'rot': 0.0}
        reactions[node_id] = {'rx': float(react[0]), 'ry': float(react[1]), 'rm': 0.0}
    
    # Para Truss, la fuerza axial se obtiene de basicForce
    for element in elements:
        elem_id = element['id']
        try:
            # Para Truss: basicForce o localForce
            force = ops.eleResponse(elem_id, 'axialForce')
            forces[elem_id] = float(force[0])
            print(f"\n   Elemento {elem_id}: Axial={force[0]:.2f} N")
        except:
            # Alternativa
            forces[elem_id] = 0.0
            print(f"\n   Elemento {elem_id}: No se pudo leer fuerza")
    
    ops.wipe()
    
    return {
        'success': True,
        'forces': forces,
        'displacements': displacements,
        'reactions': reactions,
        'message': f'Análisis completado (Truss)'
    }
if __name__ == '__main__':
    print("\n" + "="*60)
    print("🚀 Servidor de Análisis Estructural")
    print("="*60)
    print(f"📡 OpenSeesPy disponible: {'✅ SI' if OPENSEES_AVAILABLE else '❌ NO'}")
    print("📍 Endpoints:")
    print("   - GET  /health")
    print("   - GET  /api/opensees/status")
    print("   - POST /api/analyze")
    print("="*60)
    print("🌐 Servidor corriendo en http://localhost:5001")
    print("="*60 + "\n")
    
    app.run(debug=True, port=5001, host='0.0.0.0')