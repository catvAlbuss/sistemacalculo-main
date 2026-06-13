# python-backend/app.py
from flask import Flask, request, jsonify
from flask_cors import CORS
import traceback
import seismic_analysis as sa

app = Flask(__name__)
CORS(app)

# Intentar importar OpenSeesPy (soporta ambas versiones)
try:
    import openseespywin.opensees as ops

    OPENSEES_AVAILABLE = True
    print("OK: OpenSeesPyWin cargado correctamente")
except ImportError:
    try:
        import openseespy.opensees as ops

        OPENSEES_AVAILABLE = True
        print("OK: OpenSeesPy cargado correctamente")
    except ImportError as e:
        OPENSEES_AVAILABLE = False
        print(f"AVISO: OpenSeesPy no disponible: {e}")
        print("   El servidor funcionara en modo simulacion")


@app.route("/health", methods=["GET"])
def health_check():
    return jsonify(
        {
            "status": "healthy",
            "engine": "Flask",
            "opensees_available": OPENSEES_AVAILABLE,
        }
    )


@app.route("/api/opensees/status", methods=["GET"])
def opensees_status():
    return jsonify(
        {
            "status": "online" if OPENSEES_AVAILABLE else "offline",
            "opensees_available": OPENSEES_AVAILABLE,
            "message": (
                "OpenSeesPy disponible"
                if OPENSEES_AVAILABLE
                else "OpenSeesPy no instalado"
            ),
        }
    )


@app.route("/api/analyze", methods=["POST"])
def analyze():
    """Endpoint principal de análisis"""

    if not OPENSEES_AVAILABLE:
        return (
            jsonify(
                {
                    "success": False,
                    "error": "OpenSeesPy no está disponible",
                    "message": "El servidor está en modo simulación",
                }
            ),
            503,
        )

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
        return jsonify({"success": False, "error": str(e)}), 500


@app.route("/api/analyze/modal-test", methods=["GET", "POST"])
def modal_test():
    """
    Endpoint de prueba para verificar análisis modal básico con OpenSeesPy.
    No usa todavía el modelo del frontend.
    Crea un sistema simple de 1 grado de libertad: masa + resorte.
    """

    if not OPENSEES_AVAILABLE:
        return (
            jsonify({"success": False, "error": "OpenSeesPy no está disponible"}),
            503,
        )

    try:
        data = request.get_json(silent=True) or {}

        mass = float(data.get("mass", 1000.0))  # kg
        stiffness = float(data.get("stiffness", 2000000.0))  # N/m
        modes = int(data.get("modes", 1))

        results = run_modal_test_analysis(mass=mass, stiffness=stiffness, modes=modes)

        return jsonify(results)

    except Exception as e:
        print(f"❌ Error en modal-test: {e}")
        traceback.print_exc()
        return jsonify({"success": False, "error": str(e)}), 500


@app.route("/api/analyze-3d", methods=["POST"])
def analyze_3d():
    """Análisis 3D completo con OpenSeesPy"""

    if not OPENSEES_AVAILABLE:
        return (
            jsonify({"success": False, "error": "OpenSeesPy no está disponible"}),
            503,
        )

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
        return jsonify({"success": False, "error": str(e)}), 500


def run_modal_test_analysis(mass=1000.0, stiffness=2000000.0, modes=1):
    """
    Análisis modal básico con OpenSeesPy.
    Modelo simple:
    - Nodo 1 fijo.
    - Nodo 2 libre.
    - Elemento zeroLength tipo resorte.
    - Masa en nodo 2.
    """

    print("\n" + "=" * 60)
    print("🔍 ANÁLISIS MODAL DE PRUEBA")
    print("=" * 60)

    ops.wipe()

    # Modelo de 1 dimensión y 1 grado de libertad por nodo
    ops.model("basic", "-ndm", 1, "-ndf", 1)

    # Nodos
    ops.node(1, 0.0)
    ops.node(2, 0.0)

    # Restricciones
    ops.fix(1, 1)  # Nodo fijo
    ops.fix(2, 0)  # Nodo libre

    # Masa
    ops.mass(2, mass)

    # Material elástico para el resorte
    ops.uniaxialMaterial("Elastic", 1, stiffness)

    # Resorte entre nodo 1 y nodo 2
    ops.element("zeroLength", 1, 1, 2, "-mat", 1, "-dir", 1)

    print(f"📌 Masa: {mass} kg")
    print(f"📌 Rigidez: {stiffness} N/m")
    print(f"📌 Modos solicitados: {modes}")

    # Para modelos pequeños, fullGenLapack suele ser más estable
    eigenvalues = ops.eigen("-fullGenLapack", modes)

    if not isinstance(eigenvalues, (list, tuple)):
        eigenvalues = [eigenvalues]

    periods = []
    frequencies = []
    angular_frequencies = []

    import math

    for lamb in eigenvalues:
        lamb = float(lamb)

        if lamb <= 0:
            omega = 0.0
            freq = 0.0
            period = None
        else:
            omega = math.sqrt(lamb)
            freq = omega / (2 * math.pi)
            period = 1 / freq if freq > 0 else None

        angular_frequencies.append(omega)
        frequencies.append(freq)
        periods.append(period)

    theoretical_period = 2 * math.pi * math.sqrt(mass / stiffness)

    ops.wipe()

    print("✅ Análisis modal-test completado")
    print(f"📊 Periodo teórico aproximado: {theoretical_period:.6f} s")
    print(f"📊 Periodos OpenSees: {periods}")

    return {
        "success": True,
        "type": "modal-test",
        "model": "single-degree-of-freedom",
        "input": {"mass": mass, "stiffness": stiffness, "modes": modes},
        "results": {
            "eigenvalues": [float(v) for v in eigenvalues],
            "angular_frequencies_rad_s": angular_frequencies,
            "frequencies_hz": frequencies,
            "periods_s": periods,
            "theoretical_period_s": theoretical_period,
        },
        "message": "Análisis modal de prueba completado correctamente",
    }


def run_opensees_3d_analysis(data):
    """Ejecuta análisis 3D con OpenSeesPy"""

    print("\n" + "=" * 60)
    print("🔍 ANÁLISIS 3D CON OPENSEES")
    print("=" * 60)

    ops.wipe()

    # ============================================================
    # 1. CONFIGURACIÓN DEL MODELO 3D
    # ============================================================
    # ndm = 3 (3 dimensiones), ndf = 6 (UX, UY, UZ, RX, RY, RZ)
    ops.model("basic", "-ndm", 3, "-ndf", 6)
    print("📐 Modelo 3D configurado (6 DOF por nodo)")

    # ============================================================
    # 2. CREAR NODOS 3D
    # ============================================================
    nodes = data.get("nodes", [])
    print("\n📍 NODOS 3D:")
    for node in nodes:
        node_id = node["id"]
        x = node.get("x", 0)
        y = node.get("y", 0)
        z = node.get("z", 0)  # ← Coordenada Z para altura
        ops.node(node_id, x, y, z)
        print(f"   Nodo {node_id}: ({x}, {y}, {z})")

    # ============================================================
    # 3. DEFINIR MATERIAL
    # ============================================================
    E = data.get("material", {}).get("E", 200e9)  # Módulo de elasticidad
    nu = data.get("material", {}).get("nu", 0.3)  # Coeficiente de Poisson
    G = E / (2 * (1 + nu))  # Módulo de corte

    print(f"\n🔧 MATERIAL:")
    print(f"   E = {E} Pa")
    print(f"   G = {G} Pa")

    ops.uniaxialMaterial("Elastic", 1, E)

    # ============================================================
    # 4. CREAR ELEMENTOS (Vigas 3D)
    # ============================================================
    elements = data.get("elements", [])
    print("\n🔗 ELEMENTOS 3D:")

    for elem in elements:
        elem_id = elem["id"]
        node_i = elem["node_i"]
        node_j = elem["node_j"]
        A = elem.get("area", 0.01)  # Área de sección (m²)
        Iz = elem.get("Iz", 0.0001)  # Momento inercia Z
        Iy = elem.get("Iy", 0.0001)  # Momento inercia Y
        J = elem.get("J", 1e-6)  # Constante de torsión

        # Elemento viga 3D elástica
        ops.element("elasticBeamColumn", elem_id, node_i, node_j, A, E, G, Iz, Iy, J)
        print(f"   Elemento {elem_id}: {node_i}→{node_j}, A={A} m²")

    # ============================================================
    # 5. APLICAR RESTRICCIONES (APOYOS 3D)
    # ============================================================
    supports = data.get("supports", [])
    print("\n🔒 APOYOS 3D:")

    for support in supports:
        node_id = support["node"]
        ux = support.get("ux", 0)  # Fijo en X
        uy = support.get("uy", 0)  # Fijo en Y
        uz = support.get("uz", 0)  # Fijo en Z
        rx = support.get("rx", 0)  # Fijo en rotación X
        ry = support.get("ry", 0)  # Fijo en rotación Y
        rz = support.get("rz", 0)  # Fijo en rotación Z

        ops.fix(node_id, ux, uy, uz, rx, ry, rz)
        print(
            f"   Nodo {node_id}: UX={ux}, UY={uy}, UZ={uz}, RX={rx}, RY={ry}, RZ={rz}"
        )

    # ============================================================
    # 6. APLICAR CARGAS 3D
    # ============================================================
    loads = data.get("loads", [])
    print("\n⬇️ CARGAS 3D:")

    ops.timeSeries("Linear", 1)
    ops.pattern("Plain", 1, 1)

    for load in loads:
        node_id = load["node"]
        fx = load.get("fx", 0)
        fy = load.get("fy", 0)
        fz = load.get("fz", 0)
        mx = load.get("mx", 0)
        my = load.get("my", 0)
        mz = load.get("mz", 0)

        if fx != 0 or fy != 0 or fz != 0 or mx != 0 or my != 0 or mz != 0:
            ops.load(node_id, fx, fy, fz, mx, my, mz)
            print(f"   Nodo {node_id}: FX={fx}, FY={fy}, FZ={fz}")

    # ============================================================
    # 7. EJECUTAR ANÁLISIS
    # ============================================================
    print("\n⚙️ EJECUTANDO ANÁLISIS 3D...")

    ops.constraints("Transformation")
    ops.numberer("RCM")
    ops.system("BandGeneral")
    ops.test("NormDispIncr", 1e-6, 6)
    ops.algorithm("Newton")
    ops.integrator("LoadControl", 1.0)
    ops.analysis("Static")

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
        node_id = node["id"]
        disp = ops.nodeDisp(node_id)
        react = ops.nodeReaction(node_id)

        displacements[node_id] = {
            "dx": float(disp[0]),
            "dy": float(disp[1]),
            "dz": float(disp[2]),
            "rx": float(disp[3]),
            "ry": float(disp[4]),
            "rz": float(disp[5]),
        }
        reactions[node_id] = {
            "fx": float(react[0]),
            "fy": float(react[1]),
            "fz": float(react[2]),
            "mx": float(react[3]),
            "my": float(react[4]),
            "mz": float(react[5]),
        }

        print(f"\n   Nodo {node_id}:")
        print(
            f"      Desplazamiento: DX={disp[0]:.6f}, DY={disp[1]:.6f}, DZ={disp[2]:.6f}"
        )
        print(
            f"      Reacción:       FX={react[0]:.2f}, FY={react[1]:.2f}, FZ={react[2]:.2f}"
        )

    # Fuerzas en elementos
    for elem in elements:
        elem_id = elem["id"]
        try:
            force = ops.eleForce(elem_id)
            forces[elem_id] = {
                "axial": float(force[0]),
                "shear_y": float(force[1]),
                "shear_z": float(force[2]),
                "torsion": float(force[3]),
                "moment_y": float(force[4]),
                "moment_z": float(force[5]),
            }
            print(f"\n   Elemento {elem_id}: Axial={force[0]:.2f} N")
        except:
            forces[elem_id] = {
                "axial": 0,
                "shear_y": 0,
                "shear_z": 0,
                "torsion": 0,
                "moment_y": 0,
                "moment_z": 0,
            }

    ops.wipe()

    return {
        "success": True,
        "displacements": displacements,
        "reactions": reactions,
        "forces": forces,
        "message": "Análisis 3D completado",
    }


@app.route("/api/opensees/test-structure", methods=["GET"])
def test_structure():
    """
    Endpoint de prueba con una estructura predefinida
    Esto te permite entender exactamente qué datos necesita OpenSees
    """
    try:
        print("\n" + "=" * 60)
        print("🧪 EJECUTANDO PRUEBA DE ESTRUCTURA PREDEFINIDA")
        print("=" * 60)

        # 1. Limpiar modelo anterior
        ops.wipe()

        # ============================================================
        # ESTRUCTURA DE PRUEBA: Viga simplemente apoyada
        # ============================================================

        print("\n📐 DEFINICIÓN DE LA ESTRUCTURA:")
        print("-" * 40)

        # 2. Definir modelo: 2D con 3 grados de libertad por nodo
        ndm = 2  # Número de dimensiones (2D)
        ndf = 3  # Grados de libertad por nodo (UX, UY, RZ)
        ops.model("basic", "-ndm", ndm, "-ndf", ndf)
        print(f"   Modelo: {ndm}D con {ndf} DOF por nodo")

        # 3. CREAR NODOS
        # Formato: node(tag, x, y)
        print("\n📍 NODOS:")
        ops.node(1, 0.0, 0.0)  # Apoyo izquierdo
        print(f"   Nodo 1: (0.0, 0.0) - Apoyo articulado")

        ops.node(2, 2.0, 0.0)  # Centro de la viga
        print(f"   Nodo 2: (2.0, 0.0) - Punto de carga")

        ops.node(3, 4.0, 0.0)  # Apoyo derecho
        print(f"   Nodo 3: (4.0, 0.0) - Apoyo de rodillo")

        # 4. DEFINIR MATERIAL Y SECCIÓN
        print("\n🔧 MATERIAL Y SECCIÓN:")
        E = 200e9  # Módulo de elasticidad (Pa) - Acero
        A = 0.01  # Área de la sección (m²) - 100 cm²
        I = 8.33e-5  # Momento de inercia (m⁴)

        # section('Elastic', tag, E, A, I)
        ops.section("Elastic", 1, E, A, I)
        print(f"   Material: E = {E} Pa (Acero)")
        print(f"   Sección: A = {A} m², I = {I} m⁴")

        # 5. TRANSFORMACIÓN GEOMÉTRICA
        # geomTransf('Linear', tag)
        ops.geomTransf("Linear", 1)
        print(f"   Transformación: Lineal")

        # 6. CREAR ELEMENTOS
        print("\n🔗 ELEMENTOS:")
        # element('elasticBeamColumn', tag, node_i, node_j, section_tag, transf_tag)
        ops.element("elasticBeamColumn", 1, 1, 2, 1, 1)
        print(f"   Elemento 1: Nodo 1 → Nodo 2 (2.0 m)")

        ops.element("elasticBeamColumn", 2, 2, 3, 1, 1)
        print(f"   Elemento 2: Nodo 2 → Nodo 3 (2.0 m)")

        # 7. RESTRICCIONES (APOYOS)
        print("\n🔒 APOYOS:")
        # fix(node_tag, UX, UY, RZ)
        # 1 = restringido, 0 = libre

        ops.fix(1, 1, 1, 0)  # Nodo 1: UX=1, UY=1, RZ=0 (articulado)
        print(f"   Nodo 1: UX=1 (fijo), UY=1 (fijo), RZ=0 (libre) - Articulado")

        ops.fix(3, 0, 1, 0)  # Nodo 3: UX=0, UY=1, RZ=0 (rodillo)
        print(f"   Nodo 3: UX=0 (libre), UY=1 (fijo), RZ=0 (libre) - Rodillo")

        # 8. CARGAS
        print("\n⬇️ CARGAS:")
        # timeSeries('Linear', tag)
        ops.timeSeries("Linear", 1)

        # pattern('Plain', tag, timeSeries_tag)
        ops.pattern("Plain", 1, 1)

        # load(node_tag, FX, FY, MZ)
        ops.load(2, 0.0, -10000.0, 0.0)  # 10 kN hacia abajo en el centro
        print(f"   Nodo 2: FX=0, FY=-10000 N (↓ 10 kN), MZ=0")

        # 9. ANÁLISIS
        print("\n⚙️ EJECUTANDO ANÁLISIS...")
        print("-" * 40)

        ops.system("BandSPD")
        ops.numberer("RCM")
        ops.constraints("Plain")
        ops.integrator("LoadControl", 1.0)
        ops.algorithm("Linear")
        ops.analysis("Static")

        result = ops.analyze(1)
        if result != 0:
            raise Exception(f"Análisis falló con código {result}")

        # ====== AGREGAR ESTA LÍNEA ======
        ops.reactions()  # ← Calcula las reacciones en los apoyos
        # ================================

        print("✅ Análisis completado exitosamente")

        # 10. EXTRAER RESULTADOS
        print("\n📊 RESULTADOS:")
        print("-" * 40)

        # Desplazamientos
        print("\n📍 DESPLAZAMIENTOS:")
        disp1 = ops.nodeDisp(1)
        disp2 = ops.nodeDisp(2)
        disp3 = ops.nodeDisp(3)

        print(
            f"   Nodo 1: UX={disp1[0]:.6f} m, UY={disp1[1]:.6f} m, RZ={disp1[2]:.6f} rad"
        )
        print(
            f"   Nodo 2: UX={disp2[0]:.6f} m, UY={disp2[1]:.6f} m, RZ={disp2[2]:.6f} rad"
        )
        print(
            f"   Nodo 3: UX={disp3[0]:.6f} m, UY={disp3[1]:.6f} m, RZ={disp3[2]:.6f} rad"
        )

        # Reacciones
        print("\n🔄 REACCIONES EN APOYOS:")
        react1 = ops.nodeReaction(1)
        react3 = ops.nodeReaction(3)

        print(
            f"   Nodo 1: RX={react1[0]:.2f} N, RY={react1[1]:.2f} N, RM={react1[2]:.2f} N·m"
        )
        print(
            f"   Nodo 3: RX={react3[0]:.2f} N, RY={react3[1]:.2f} N, RM={react3[2]:.2f} N·m"
        )

        # Fuerzas en elementos
        print("\n📐 FUERZAS EN ELEMENTOS:")
        force1 = ops.eleForce(1)
        force2 = ops.eleForce(2)

        print(
            f"   Elemento 1: Axial={force1[0]:.2f} N, Cortante={force1[1]:.2f} N, Momento={force1[2]:.2f} N·m"
        )
        print(
            f"   Elemento 2: Axial={force2[0]:.2f} N, Cortante={force2[1]:.2f} N, Momento={force2[2]:.2f} N·m"
        )

        # 11. CÁLCULOS TEÓRICOS PARA COMPARACIÓN
        print("\n📚 COMPARACIÓN TEÓRICA:")
        print("-" * 40)

        P = 10000  # N
        L = 4.0  # m

        # Deflexión máxima teórica: δ = PL³/(48EI)
        delta_teorico = (P * L**3) / (48 * E * I)
        delta_opensees = abs(disp2[1])
        error_def = abs(delta_teorico - delta_opensees) / delta_teorico * 100

        print(
            f"   Deflexión máxima teórica: {delta_teorico:.6f} m ({delta_teorico*1000:.2f} mm)"
        )
        print(
            f"   Deflexión OpenSees:        {delta_opensees:.6f} m ({delta_opensees*1000:.2f} mm)"
        )
        print(f"   Error:                     {error_def:.4f}%")

        # Reacciones teóricas
        R1_teorico = P / 2  # 5000 N
        R3_teorico = P / 2  # 5000 N

        print(f"\n   Reacción Nodo 1 teórica: {R1_teorico:.2f} N")
        print(f"   Reacción OpenSees:       {react1[1]:.2f} N")
        print(f"   Reacción Nodo 3 teórica: {R3_teorico:.2f} N")
        print(f"   Reacción OpenSees:       {react3[1]:.2f} N")

        ops.wipe()

        print("\n" + "=" * 60)
        print("✅ PRUEBA COMPLETADA EXITOSAMENTE")
        print("=" * 60 + "\n")

        return jsonify(
            {
                "success": True,
                "structure": {
                    "nodes": [
                        {"id": 1, "x": 0.0, "y": 0.0},
                        {"id": 2, "x": 2.0, "y": 0.0},
                        {"id": 3, "x": 4.0, "y": 0.0},
                    ],
                    "elements": [
                        {"id": 1, "node_i": 1, "node_j": 2},
                        {"id": 2, "node_i": 2, "node_j": 3},
                    ],
                    "supports": [
                        {"node": 1, "ux": 1, "uy": 1, "rz": 0},
                        {"node": 3, "ux": 0, "uy": 1, "rz": 0},
                    ],
                    "loads": [{"node": 2, "fx": 0, "fy": -10000, "mz": 0}],
                    "material": {"E": E, "A": A, "I": I},
                },
                "results": {
                    "displacements": {
                        "1": {
                            "dx": float(disp1[0]),
                            "dy": float(disp1[1]),
                            "rot": float(disp1[2]),
                        },
                        "2": {
                            "dx": float(disp2[0]),
                            "dy": float(disp2[1]),
                            "rot": float(disp2[2]),
                        },
                        "3": {
                            "dx": float(disp3[0]),
                            "dy": float(disp3[1]),
                            "rot": float(disp3[2]),
                        },
                    },
                    "reactions": {
                        "1": {
                            "rx": float(react1[0]),
                            "ry": float(react1[1]),
                            "rm": float(react1[2]),
                        },
                        "3": {
                            "rx": float(react3[0]),
                            "ry": float(react3[1]),
                            "rm": float(react3[2]),
                        },
                    },
                    "forces": {
                        "1": {
                            "axial": float(force1[0]),
                            "shear": float(force1[1]),
                            "moment": float(force1[2]),
                        },
                        "2": {
                            "axial": float(force2[0]),
                            "shear": float(force2[1]),
                            "moment": float(force2[2]),
                        },
                    },
                },
                "theoretical": {
                    "max_deflection": delta_teorico,
                    "reaction_1": R1_teorico,
                    "reaction_3": R3_teorico,
                    "error_deflection_percent": error_def,
                },
            }
        )

    except Exception as e:
        print(f"\n❌ ERROR: {e}")
        traceback.print_exc()
        return jsonify({"success": False, "error": str(e)}), 500


# endpoint para una prueba simple de viga con carga axial
@app.route("/api/test-3d-simple", methods=["GET"])
def test_3d_simple():
    """Prueba simple de viga horizontal con carga axial"""

    try:
        ops.wipe()

        # Modelo 2D con 2 DOF por nodo (UX, UY) para simplicidad
        ops.model("basic", "-ndm", 2, "-ndf", 2)

        # Nodos
        ops.node(1, 0.0, 0.0)
        ops.node(2, 3.0, 0.0)

        # Material
        E = 200e9
        A = 0.01

        ops.uniaxialMaterial("Elastic", 1, E)

        # Elemento Truss
        ops.element("Truss", 1, 1, 2, A, 1)

        # Restricciones: Nodo 1 fijo en X y Y
        ops.fix(1, 1, 1)

        # Nodo 2 libre en X para que pueda deformarse
        ops.fix(2, 0, 1)  # Y fijo, X libre

        # Carga axial en X
        ops.timeSeries("Linear", 1)
        ops.pattern("Plain", 1, 1)
        ops.load(2, 10000.0, 0.0)  # FX = 10000 N

        # Análisis
        ops.constraints("Plain")
        ops.numberer("RCM")
        ops.system("BandGeneral")
        ops.test("NormDispIncr", 1e-6, 6)
        ops.algorithm("Linear")
        ops.integrator("LoadControl", 1.0)
        ops.analysis("Static")

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

        print("\n" + "=" * 60)
        print("🧪 PRUEBA: VIGA CON CARGA AXIAL")
        print("=" * 60)
        print(f"📐 Longitud: {L} m")
        print(f"🔧 E = {E} Pa, A = {A} m²")
        print(f"⬇️ Carga axial: {P} N")
        print(f"\n📊 RESULTADOS:")
        print(f"   Desplazamiento OpenSees: {disp[0]:.6f} m ({disp[0]*1000:.3f} mm)")
        print(
            f"   Desplazamiento teórico: {delta_teorico:.6f} m ({delta_teorico*1000:.3f} mm)"
        )
        print(f"   Fuerza axial: {force[0]:.2f} N")
        print("=" * 60 + "\n")

        return jsonify(
            {
                "success": True,
                "displacement_mm": disp[0] * 1000,
                "theoretical_displacement_mm": delta_teorico * 1000,
                "axial_force_N": force[0],
                "error_percent": (
                    abs(delta_teorico - disp[0]) / delta_teorico * 100
                    if delta_teorico != 0
                    else 0
                ),
            }
        )

    except Exception as e:
        print(f"❌ ERROR: {e}")
        return jsonify({"success": False, "error": str(e)}), 500


@app.route("/api/test-3d-column-alt", methods=["GET"])
def test_3d_column_alt():
    """Prueba de columna vertical usando elementos frame2D (simplificado)"""

    try:
        ops.wipe()

        # Usar modelo 2D con 3 DOF (UX, UY, RZ) para simular viga en voladizo
        ops.model("basic", "-ndm", 2, "-ndf", 3)

        # Nodos (X, Y) - Y es la altura
        ops.node(1, 0.0, 0.0)
        ops.node(2, 0.0, 3.0)  # Altura 3m en Y

        # Material
        E = 200e9
        A = 0.01
        I = 8.33e-5

        # Sección
        ops.section("Elastic", 1, E, A, I)

        # Transformación geométrica
        ops.geomTransf("Linear", 1)

        # Elemento viga
        ops.element("elasticBeamColumn", 1, 1, 2, 1, 1)

        # Base empotrada
        ops.fix(1, 1, 1, 1)

        # Carga horizontal en X en la punta
        ops.timeSeries("Linear", 1)
        ops.pattern("Plain", 1, 1)
        ops.load(2, 10000.0, 0.0, 0.0)

        # Análisis
        ops.constraints("Plain")
        ops.numberer("RCM")
        ops.system("BandGeneral")
        ops.test("NormDispIncr", 1e-6, 6)
        ops.algorithm("Newton")
        ops.integrator("LoadControl", 1.0)
        ops.analysis("Static")

        result = ops.analyze(1)

        if result != 0:
            raise Exception(f"Análisis falló con código {result}")

        disp = ops.nodeDisp(2)
        react = ops.nodeReaction(1)

        # Cálculo teórico: δ = P*L³/(3*E*I)
        P = 10000
        L = 3
        delta_teorico = (P * L**3) / (3 * E * I)

        print("\n" + "=" * 60)
        print("🧪 PRUEBA: COLUMNA VERTICAL (2D) CON CARGA HORIZONTAL")
        print("=" * 60)
        print(f"📐 Altura: {L} m")
        print(f"🔧 E = {E} Pa, I = {I} m⁴")
        print(f"⬇️ Carga horizontal: {P} N")
        print(f"\n📊 RESULTADOS:")
        print(f"   Desplazamiento X: {disp[0]:.6f} m ({disp[0]*1000:.3f} mm)")
        print(
            f"   Desplazamiento teórico: {delta_teorico:.6f} m ({delta_teorico*1000:.3f} mm)"
        )
        print(f"   Momento en base: {react[2]:.2f} N·m")
        print(f"   Error: {abs(delta_teorico - disp[0]) / delta_teorico * 100:.4f}%")
        print("=" * 60 + "\n")

        return jsonify(
            {
                "success": True,
                "displacement_mm": disp[0] * 1000,
                "theoretical_displacement_mm": delta_teorico * 1000,
                "moment_Nm": react[2],
                "error_percent": abs(delta_teorico - disp[0]) / delta_teorico * 100,
            }
        )

    except Exception as e:
        print(f"❌ ERROR: {e}")
        traceback.print_exc()
        return jsonify({"success": False, "error": str(e)}), 500


@app.route("/api/test-prueba", methods=["GET"])
def test_prueba():
    """
    PRUEBA: Pórtico 3D simple (2 columnas + 1 viga)
    - Altura: 3m
    - Luz: 5m
    - Carga horizontal de 50kN en la esquina superior izquierda
    """

    if not OPENSEES_AVAILABLE:
        return (
            jsonify({"success": False, "error": "OpenSeesPy no está disponible"}),
            503,
        )

    print("\n" + "=" * 60)
    print("🧪 PRUEBA: PÓRTICO 3D SIMPLE")
    print("=" * 60)

    try:
        ops.wipe()

        # ============================================================
        # 1. CONFIGURACIÓN INICIAL
        # ============================================================
        ops.model("basic", "-ndm", 3, "-ndf", 6)
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
        E = 200e9  # Módulo de Young (Pa) - Acero
        G = 77e9  # Módulo de corte (Pa)
        A = 0.01  # Área (m²) - 100 cm²
        J = 0.0001  # Momento polar de inercia (m⁴)
        Iy = 0.0002  # Inercia eje local y (m⁴)
        Iz = 0.0005  # Inercia eje local z (m⁴)

        print(f"🔧 Material: E={E} Pa, G={G} Pa")
        print(f"📐 Sección: A={A} m², Iy={Iy} m⁴, Iz={Iz} m⁴")

        # ============================================================
        # 4. TRANSFORMACIÓN GEOMÉTRICA
        # ============================================================
        # Para columnas (orientación vertical)
        ops.geomTransf("Linear", 1, 0, 1, 0)
        print("🔄 Transformación 1: Columnas (eje Y como referencia)")

        # Para vigas (orientación horizontal)
        ops.geomTransf("Linear", 2, 0, 0, 1)
        print("🔄 Transformación 2: Vigas (eje Z como referencia)")

        # ============================================================
        # 5. DEFINICIÓN DE ELEMENTOS
        # ============================================================
        # Columna izquierda (nodo 1 → 3)
        ops.element("elasticBeamColumn", 1, 1, 3, A, E, G, J, Iy, Iz, 1)
        print("🔗 Elemento 1: Columna izquierda (N1→N3)")

        # Columna derecha (nodo 2 → 4)
        ops.element("elasticBeamColumn", 2, 2, 4, A, E, G, J, Iy, Iz, 1)
        print("🔗 Elemento 2: Columna derecha (N2→N4)")

        # Viga superior (nodo 3 → 4)
        ops.element("elasticBeamColumn", 3, 3, 4, A, E, G, J, Iy, Iz, 2)
        print("🔗 Elemento 3: Viga superior (N3→N4)")

        # ============================================================
        # 6. CARGAS
        # ============================================================
        ops.timeSeries("Linear", 1)
        ops.pattern("Plain", 1, 1)

        # Carga horizontal de 50kN en el nodo 3 (dirección X)
        ops.load(3, 50000.0, 0.0, 0.0, 0.0, 0.0, 0.0)
        print("⬇️ Carga: Nodo 3 - FX = 50,000 N (horizontal)")

        # ============================================================
        # 7. CONFIGURACIÓN DEL ANÁLISIS
        # ============================================================
        print("\n⚙️ EJECUTANDO ANÁLISIS...")
        print("-" * 40)

        ops.system("BandSPD")
        ops.numberer("RCM")
        ops.constraints("Transformation")
        ops.integrator("LoadControl", 1.0)
        ops.algorithm("Linear")
        ops.analysis("Static")

        # ============================================================
        # 8. EJECUCIÓN Y RESULTADOS
        # ============================================================
        ok = ops.analyze(1)

        print("\n📊 RESULTADOS:")
        print("-" * 40)

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
            print(
                f"   Nodo 1: FX={react1[0]:.2f} N, FZ={react1[2]:.2f} N, MY={react1[4]:.2f} N·m"
            )
            print(
                f"   Nodo 2: FX={react2[0]:.2f} N, FZ={react2[2]:.2f} N, MY={react2[4]:.2f} N·m"
            )

            # Fuerzas internas
            force1 = ops.eleForce(1)  # Columna izquierda
            force2 = ops.eleForce(2)  # Columna derecha
            force3 = ops.eleForce(3)  # Viga

            print(f"\n📐 FUERZAS INTERNAS:")
            print(
                f"   Columna izquierda: Axial={force1[0]:.2f} N, Momento Y={force1[4]:.2f} N·m"
            )
            print(
                f"   Columna derecha:  Axial={force2[0]:.2f} N, Momento Y={force2[4]:.2f} N·m"
            )
            print(
                f"   Viga:             Axial={force3[0]:.2f} N, Momento Y={force3[4]:.2f} N·m"
            )

            # Verificación del equilibrio
            print(f"\n📚 VERIFICACIÓN DE EQUILIBRIO:")
            print(f"   Suma FX = {react1[0] + react2[0]:.2f} N (debe ser -50000 N)")
            print(f"   Suma FZ = {react1[2] + react2[2]:.2f} N")

            ops.wipe()

            print("\n" + "=" * 60)
            print("✅ PRUEBA COMPLETADA EXITOSAMENTE")
            print("=" * 60 + "\n")

            return jsonify(
                {
                    "success": True,
                    "test_name": "Pórtico 3D simple",
                    "geometry": {"width": 5.0, "height": 3.0, "load": 50000},
                    "results": {
                        "displacements": {
                            "node3_mm": disp3[0] * 1000,
                            "node4_mm": disp4[0] * 1000,
                        },
                        "reactions": {
                            "node1": {
                                "fx": float(react1[0]),
                                "fz": float(react1[2]),
                                "my": float(react1[4]),
                            },
                            "node2": {
                                "fx": float(react2[0]),
                                "fz": float(react2[2]),
                                "my": float(react2[4]),
                            },
                        },
                        "internal_forces": {
                            "col_left_axial": float(force1[0]),
                            "col_left_moment": float(force1[4]),
                            "col_right_axial": float(force2[0]),
                            "col_right_moment": float(force2[4]),
                            "beam_axial": float(force3[0]),
                            "beam_moment": float(force3[4]),
                        },
                    },
                }
            )
        else:
            raise Exception(f"Análisis falló con código {ok}")

    except Exception as e:
        print(f"\n❌ ERROR: {e}")
        traceback.print_exc()
        return jsonify({"success": False, "error": str(e)}), 500
    finally:
        ops.wipe()


def run_opensees_analysis(data):
    """Ejecuta el análisis real con OpenSeesPy - Versión Truss"""

    print("\n" + "=" * 60)
    print("🔍 DEPURACIÓN - USANDO ELEMENTO TRUSS")
    print("=" * 60)

    ops.wipe()

    nodes = data.get("nodes", [])
    ndm = 2
    ndf = 2  # ← CAMBIADO: Solo 2 DOF para Truss (UX, UY)

    print(f"\n📐 Configurando modelo {ndm}D con {ndf} DOF (Truss)")
    ops.model("basic", "-ndm", ndm, "-ndf", ndf)

    # Nodos
    print("\n📍 NODOS CREADOS:")
    for node in nodes:
        node_id = node["id"]
        x = node["x"]
        y = node["y"]
        ops.node(node_id, x, y)
        print(f"   Nodo {node_id}: ({x}, {y})")

    # Material (uniaxial)
    E = 200e9
    print(f"\n🔧 MATERIAL:")
    print(f"   E = {E} Pa")
    ops.uniaxialMaterial("Elastic", 1, E)

    # Elementos Truss
    print("\n🔗 ELEMENTOS TRUSS CREADOS:")
    elements = data.get("elements", [])
    for element in elements:
        elem_id = element["id"]
        node_i = element["node_i"]
        node_j = element["node_j"]
        A_elem = element.get("area", 0.01)

        # Elemento Truss: ops.element('Truss', tag, node_i, node_j, A, material_tag)
        ops.element("Truss", elem_id, node_i, node_j, A_elem, 1)
        print(f"   Elemento {elem_id}: {node_i}→{node_j}, A={A_elem} m²")

    # Apoyos (solo UX, UY - sin RZ)
    print("\n🔒 APOYOS:")
    supports = data.get("supports", [])
    for support in supports:
        node_id = support["node"]
        ux = support.get("ux", 0)
        uy = support.get("uy", 0)
        ops.fix(node_id, ux, uy)
        print(f"   Nodo {node_id}: UX={ux}, UY={uy}")

    # Cargas
    print("\n⬇️ CARGAS:")
    ops.timeSeries("Linear", 1)
    ops.pattern("Plain", 1, 1)

    loads = data.get("loads", [])
    for load in loads:
        node_id = load["node"]
        fx = load.get("fx", 0)
        fy = load.get("fy", 0)

        if fx != 0 or fy != 0:
            ops.load(node_id, fx, fy)
            print(f"   Nodo {node_id}: FX={fx}, FY={fy}")

    # Análisis
    print("\n⚙️ EJECUTANDO ANÁLISIS...")

    ops.constraints("Plain")
    ops.numberer("RCM")
    ops.system("BandGeneral")
    ops.algorithm("Linear")
    ops.integrator("LoadControl", 1.0)
    ops.analysis("Static")

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
        node_id = node["id"]
        disp = ops.nodeDisp(node_id)
        react = ops.nodeReaction(node_id)

        print(f"\n   Nodo {node_id}:")
        print(f"      Desplazamiento: DX={disp[0]:.6f}, DY={disp[1]:.6f}")
        print(f"      Reacción:       RX={react[0]:.2f}, RY={react[1]:.2f}")

        displacements[node_id] = {
            "dx": float(disp[0]),
            "dy": float(disp[1]),
            "rot": 0.0,
        }
        reactions[node_id] = {"rx": float(react[0]), "ry": float(react[1]), "rm": 0.0}

    # Para Truss, la fuerza axial se obtiene de basicForce
    for element in elements:
        elem_id = element["id"]
        try:
            # Para Truss: basicForce o localForce
            force = ops.eleResponse(elem_id, "axialForce")
            forces[elem_id] = float(force[0])
            print(f"\n   Elemento {elem_id}: Axial={force[0]:.2f} N")
        except:
            # Alternativa
            forces[elem_id] = 0.0
            print(f"\n   Elemento {elem_id}: No se pudo leer fuerza")

    ops.wipe()

    return {
        "success": True,
        "forces": forces,
        "displacements": displacements,
        "reactions": reactions,
        "message": f"Análisis completado (Truss)",
    }


# ─────────────────────────────────────────────────────────────────────────────
#  ANÁLISIS SÍSMICO ESPECTRAL
# ─────────────────────────────────────────────────────────────────────────────

@app.route('/api/seismic/parse-spectrum', methods=['POST'])
def parse_spectrum():
    """
    Parsea un archivo de espectro de respuesta.

    Acepta:
      - multipart/form-data  con campo 'file'   (TXT, CSV, XLS, XLSX)
      - application/json     con campo 'content' (texto plano) y 'filename'

    Retorna:
      { success, spectrum: [{T, Sa}], count, filename }
    """
    try:
        filename = 'spectrum.txt'
        file_bytes = None

        if request.files and 'file' in request.files:
            f = request.files['file']
            filename = f.filename or filename
            file_bytes = f.read()
        elif request.is_json:
            payload = request.get_json()
            content = payload.get('content', '')
            filename = payload.get('filename', filename)
            file_bytes = content.encode('utf-8')
        else:
            return jsonify({'success': False,
                            'error': 'Se requiere un archivo (form-data) o JSON con campo content'}), 400

        data = sa.parse_spectrum_file(file_bytes, filename)

        spectrum = [{'T': float(t), 'Sa': float(s)} for t, s in data]
        return jsonify({
            'success': True,
            'spectrum': spectrum,
            'count': len(spectrum),
            'filename': filename,
        })

    except Exception as e:
        return jsonify({'success': False, 'error': str(e),
                        'traceback': traceback.format_exc()}), 500


@app.route('/api/seismic/analyze', methods=['POST'])
def seismic_analyze():
    """
    Análisis sísmico espectral completo.

    Payload JSON:
    {
      "nodes":    [{ "id":1, "x":0, "y":0, "z":0, "mass_x":500, "mass_y":500 }],
      "elements": [{ "id":1, "node_i":1, "node_j":2, "A":0.01, "E":2e11,
                     "G":7.7e10, "Iz":1e-4, "Iy":1e-4, "J":1e-6 }],
      "supports": [{ "node":1, "ux":1,"uy":1,"uz":1,"rx":0,"ry":0,"rz":0 }],
      "loads":    [{ "node":2, "fz":-10000 }],         // cargas estáticas (opcional)
      "spectrum_x": [{"T":0.0,"Sa":0.4},{"T":0.5,"Sa":1.2},{"T":2.0,"Sa":0.3}],
      "spectrum_y": [...],                              // opcional, usa X si falta
      "num_modes":    6,
      "combination":  "CQC",                           // "SRSS" o "CQC"
      "damping_ratio": 0.05,
      "sa_in_g":  true,                                // true=g, false=m/s²
      "g":        9.81
    }

    Retorna:
    {
      "success": true,
      "modal": { "modes": [...], "num_modes_requested": 6 },
      "seismic": {
        "x": { "displacements": {}, "base_shear": 0, "modal_disps_detail": [] },
        "y": { ... }
      },
      "static": { "displacements": {}, "reactions": {}, "forces": {} },
      "envelope": { "by_node": {} }
    }
    """
    if not OPENSEES_AVAILABLE:
        return jsonify({
            'success': False,
            'error': 'OpenSeesPy no está disponible',
            'message': 'Instala openseespywin o openseespy para habilitar el análisis sísmico',
        }), 503

    try:
        data = request.get_json()
        if not data:
            return jsonify({'success': False, 'error': 'Payload JSON requerido'}), 400

        # Validaciones básicas
        if not data.get('nodes'):
            return jsonify({'success': False, 'error': 'Se requiere al menos un nodo'}), 400
        if not data.get('elements'):
            return jsonify({'success': False, 'error': 'Se requiere al menos un elemento'}), 400
        if not data.get('spectrum_x') and not data.get('spectrum_y'):
            return jsonify({'success': False, 'error': 'Se requiere al menos un espectro (spectrum_x o spectrum_y)'}), 400

        # Convertir espectros de [{T, Sa}] → [(T, Sa)] si vienen como dicts
        for key in ('spectrum_x', 'spectrum_y'):
            spec = data.get(key)
            if spec and isinstance(spec[0], dict):
                data[key] = [(float(p['T']), float(p['Sa'])) for p in spec]

        result = sa.run_full_seismic_analysis(data)
        return jsonify(result)

    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e),
            'traceback': traceback.format_exc(),
        }), 500


@app.route('/api/seismic/modal', methods=['POST'])
def modal_only():
    """
    Solo análisis modal (eigenvalue), sin aplicar espectro.
    Útil para verificar periodos y modos antes del RSA.

    Payload: mismos campos nodes, elements, supports (sin spectrum ni loads).
    Parámetro opcional: num_modes (default 6).
    """
    if not OPENSEES_AVAILABLE:
        return jsonify({'success': False, 'error': 'OpenSeesPy no disponible'}), 503

    try:
        data = request.get_json() or {}
        if not data.get('nodes') or not data.get('elements'):
            return jsonify({'success': False, 'error': 'Se requieren nodes y elements'}), 400

        num_modes = int(data.get('num_modes', 6))
        nodes, elements = sa.build_model_3d(data)
        num_modes = min(num_modes, max(1, len(nodes) * 2))
        modal = sa.run_modal_analysis(nodes, num_modes)

        return jsonify({
            'success': True,
            'modes': modal['modal_info'],
            'num_modes': num_modes,
            'num_nodes': len(nodes),
        })

    except Exception as e:
        return jsonify({'success': False, 'error': str(e),
                        'traceback': traceback.format_exc()}), 500


if __name__ == '__main__':
    print("\n" + "="*60)
    print("Servidor de Análisis Estructural")
    print("="*60)
    print(f"OpenSeesPy disponible: {'SI' if OPENSEES_AVAILABLE else 'NO'}")
    print("Endpoints:")
    print("   GET  /health")
    print("   GET  /api/opensees/status")
    print("   POST /api/analyze              (truss 2D)")
    print("   POST /api/analyze-3d           (marco 3D estático)")
    print("   POST /api/seismic/parse-spectrum  (importar espectro)")
    print("   POST /api/seismic/modal           (análisis modal)")
    print("   POST /api/seismic/analyze         (RSA completo)")
    print("="*60)
    print("Servidor corriendo en http://localhost:5001")
    print("="*60 + "\n")



@app.route("/api/analyze/modal-spectral-test", methods=["GET", "POST"])
def modal_spectral_test():
    """
    Endpoint de prueba para análisis modal espectral básico.

    Permite trabajar de tres formas:

    1. Caso libre:
       /api/analyze/modal-spectral-test

    2. Periodo objetivo:
       /api/analyze/modal-spectral-test?target_period_s=0.219

    3. Casos tipo ETABS:
       /api/analyze/modal-spectral-test?case_name=SDX
       /api/analyze/modal-spectral-test?case_name=SDY
       /api/analyze/modal-spectral-test?case_name=SDX_ESCALADO
       /api/analyze/modal-spectral-test?case_name=SDY_ESCALADO
       /api/analyze/modal-spectral-test?case_name=DER_XX
       /api/analyze/modal-spectral-test?case_name=DER_YY
    """

    try:
        import math
        import openseespy.opensees as ops

        # ==============================
        # 1. Leer datos GET o POST
        # ==============================
        data = request.get_json(silent=True) or {}

        def get_param(name, default=None):
            """
            Prioridad:
            1. Query params del navegador
            2. JSON enviado por POST
            3. Valor por defecto
            """
            if name in request.args:
                return request.args.get(name)
            return data.get(name, default)

        def get_float_param(name, default=None):
            value = get_param(name, default)

            if value is None or value == "":
                return default

            return float(value)

        def normalize_case_name(value):
            if value is None:
                return "CUSTOM"

            text = str(value).strip().upper()
            text = text.replace(" ", "_")
            text = text.replace("-", "_")

            return text

        # ==============================
        # 2. Espectro del Excel ETABS
        # ==============================
        default_spectrum = [
            {"T": 0.00, "Sa": 0.196875},
            {"T": 0.10, "Sa": 0.196875},
            {"T": 0.20, "Sa": 0.196875},
            {"T": 0.50, "Sa": 0.196875},
            {"T": 1.00, "Sa": 0.196875},
            {"T": 1.20, "Sa": 0.164063},
            {"T": 1.50, "Sa": 0.131250},
            {"T": 2.00, "Sa": 0.078750},
            {"T": 3.00, "Sa": 0.035000},
            {"T": 5.00, "Sa": 0.012600},
            {"T": 15.00, "Sa": 0.001400},
        ]

        spectrum = data.get("spectrum", default_spectrum)

        # ==============================
        # 3. Casos de comparación tipo ETABS
        # ==============================
        etabs_cases = {
            "SDX": {
                "label": "SDX",
                "direction": "X",
                "target_period_s": 0.219,
                "scale_factor": 9.81,
                "mass_kg": 7180.0,
                "expected_base_shear_tonf": 1.414,
                "expected_displacement_m": 0.002349,
                "expected_drift": 0.000651,
            },
            "SDY": {
                "label": "SDY",
                "direction": "Y",
                "target_period_s": 0.214,
                "scale_factor": 9.81,
                "mass_kg": 7180.0,
                "expected_base_shear_tonf": 1.414,
                "expected_displacement_m": 0.002242,
                "expected_drift": 0.000621,
            },
            "SDX_ESCALADO": {
                "label": "SDX ESCALADO",
                "direction": "X",
                "target_period_s": 0.219,
                "scale_factor": 10.7415,
                "mass_kg": 7180.0,
                "expected_base_shear_tonf": 1.5484,
                "expected_displacement_m": 0.002572,
                "expected_drift": 0.000712,
            },
            "SDY_ESCALADO": {
                "label": "SDY ESCALADO",
                "direction": "Y",
                "target_period_s": 0.214,
                "scale_factor": 10.36,
                "mass_kg": 7180.0,
                "expected_base_shear_tonf": 1.4932,
                "expected_displacement_m": 0.002367,
                "expected_drift": 0.000656,
            },
            "DER_XX": {
                "label": "DER XX",
                "direction": "X",
                "target_period_s": 0.219,
                "scale_factor": 44.145,
                "mass_kg": 7180.0,
                "expected_base_shear_tonf": 6.3636,
                "expected_displacement_m": 0.010570,
                "expected_drift": 0.002928,
            },
            "DER_YY": {
                "label": "DER YY",
                "direction": "Y",
                "target_period_s": 0.214,
                "scale_factor": 44.145,
                "mass_kg": 7180.0,
                "expected_base_shear_tonf": 6.3636,
                "expected_displacement_m": 0.010088,
                "expected_drift": 0.002794,
            },
        }

        raw_case_name = get_param("case_name", "CUSTOM")
        case_key = normalize_case_name(raw_case_name)

        selected_case = None

        if case_key != "CUSTOM":
            selected_case = etabs_cases.get(case_key)

            if selected_case is None:
                return (
                    jsonify(
                        {
                            "success": False,
                            "type": "modal-spectral-test",
                            "error": f"Caso no reconocido: {raw_case_name}",
                            "available_cases": list(etabs_cases.keys()),
                        }
                    ),
                    400,
                )

        # ==============================
        # 4. Valores por defecto
        # ==============================
        default_mass_kg = 1000.0
        default_height_m = 3.61
        default_scale_factor = 9.81
        default_target_period_s = None

        if selected_case is not None:
            default_mass_kg = selected_case["mass_kg"]
            default_scale_factor = selected_case["scale_factor"]
            default_target_period_s = selected_case["target_period_s"]

        mass_kg = get_float_param("mass_kg", default_mass_kg)
        height_m = get_float_param("height_m", default_height_m)
        scale_factor = get_float_param("scale_factor", default_scale_factor)
        target_period_s = get_float_param("target_period_s", default_target_period_s)

        # Si se envía target_period_s, calculamos rigidez automáticamente:
        # k = m * (2*pi/T)^2
        if target_period_s is not None and target_period_s > 0:
            stiffness_n_m = mass_kg * ((2.0 * math.pi / target_period_s) ** 2)
            stiffness_source = "calculated_from_target_period"
        else:
            stiffness_n_m = get_float_param("stiffness_n_m", 2_000_000.0)
            stiffness_source = "input_or_default"

        # ==============================
        # 5. Interpolación Sa(T)
        # ==============================
        def interpolate_spectrum(period, spectrum_points):
            points = sorted(spectrum_points, key=lambda p: float(p["T"]))

            if period <= float(points[0]["T"]):
                return float(points[0]["Sa"])

            if period >= float(points[-1]["T"]):
                return float(points[-1]["Sa"])

            for i in range(len(points) - 1):
                t1 = float(points[i]["T"])
                t2 = float(points[i + 1]["T"])
                sa1 = float(points[i]["Sa"])
                sa2 = float(points[i + 1]["Sa"])

                if t1 <= period <= t2:
                    if abs(t2 - t1) < 1e-12:
                        return sa1

                    ratio = (period - t1) / (t2 - t1)
                    return sa1 + ratio * (sa2 - sa1)

            return float(points[-1]["Sa"])

        # ==============================
        # 6. Modelo OpenSeesPy 1 GDL
        # ==============================
        ops.wipe()
        ops.model("basic", "-ndm", 1, "-ndf", 1)

        # Nodo fijo y nodo con masa
        ops.node(1, 0.0)
        ops.node(2, 0.0)

        ops.fix(1, 1)
        ops.fix(2, 0)

        ops.mass(2, mass_kg)

        # Resorte elástico entre nodo fijo y nodo con masa
        ops.uniaxialMaterial("Elastic", 1, stiffness_n_m)
        ops.element("zeroLength", 1, 1, 2, "-mat", 1, "-dir", 1)

        number_of_modes = 1
        eigenvalues = ops.eigen("-fullGenLapack", number_of_modes)

        eigenvalue = float(eigenvalues[0])
        angular_frequency = math.sqrt(eigenvalue)
        frequency_hz = angular_frequency / (2.0 * math.pi)
        period_s = 1.0 / frequency_hz

        # ==============================
        # 7. Cálculo espectral básico
        # ==============================
        sa_g = interpolate_spectrum(period_s, spectrum)

        # Sa en m/s²
        spectral_acceleration_m_s2 = sa_g * scale_factor

        # Sd = Sa / w²
        spectral_displacement_m = spectral_acceleration_m_s2 / eigenvalue

        # F = m * Sa
        equivalent_force_n = mass_kg * spectral_acceleration_m_s2

        # Conversión aproximada de N a tonf
        equivalent_force_tonf = equivalent_force_n / 9806.65

        # Deriva estimada
        drift = spectral_displacement_m / height_m if height_m > 0 else None

        theoretical_period_s = 2.0 * math.pi * math.sqrt(mass_kg / stiffness_n_m)

        period_error_percent = None
        if target_period_s is not None and target_period_s > 0:
            period_error_percent = (
                abs(period_s - target_period_s) / target_period_s * 100.0
            )

        # ==============================
        # 8. Comparación con ETABS
        # ==============================
        comparison = None

        def percent_error(calculated, expected):
            if expected is None or abs(expected) < 1e-12:
                return None

            return abs(calculated - expected) / abs(expected) * 100.0

        if selected_case is not None:
            comparison = {
                "case_label": selected_case["label"],
                "direction": selected_case["direction"],
                "etabs_expected": {
                    "period_s": selected_case["target_period_s"],
                    "base_shear_tonf": selected_case["expected_base_shear_tonf"],
                    "max_displacement_m": selected_case["expected_displacement_m"],
                    "drift": selected_case["expected_drift"],
                },
                "calculated": {
                    "period_s": period_s,
                    "base_shear_tonf": equivalent_force_tonf,
                    "max_displacement_m": spectral_displacement_m,
                    "drift": drift,
                },
                "error_percent": {
                    "period": percent_error(period_s, selected_case["target_period_s"]),
                    "base_shear": percent_error(
                        equivalent_force_tonf, selected_case["expected_base_shear_tonf"]
                    ),
                    "max_displacement": percent_error(
                        spectral_displacement_m,
                        selected_case["expected_displacement_m"],
                    ),
                    "drift": percent_error(drift, selected_case["expected_drift"]),
                },
                "important_note": (
                    "La masa usada es una masa efectiva aproximada para comparar con ETABS. "
                    "Todavía no proviene del modelo estructural real."
                ),
            }

        ops.wipe()

        return jsonify(
            {
                "success": True,
                "type": "modal-spectral-test",
                "model": "single-degree-of-freedom",
                "case": {
                    "requested": raw_case_name,
                    "normalized": case_key,
                    "is_etabs_reference_case": selected_case is not None,
                    "available_cases": list(etabs_cases.keys()),
                },
                "input": {
                    "mass_kg": mass_kg,
                    "mass_source": (
                        "etabs_effective_mass_approximation"
                        if selected_case is not None
                        else "input_or_default"
                    ),
                    "stiffness_n_m": stiffness_n_m,
                    "stiffness_source": stiffness_source,
                    "height_m": height_m,
                    "scale_factor": scale_factor,
                    "target_period_s": target_period_s,
                    "spectrum_source": "Excel ETABS - ESPECTRO XX / YY",
                },
                "modal_results": {
                    "eigenvalue": eigenvalue,
                    "angular_frequency_rad_s": angular_frequency,
                    "frequency_hz": frequency_hz,
                    "period_s": period_s,
                    "theoretical_period_s": theoretical_period_s,
                    "period_error_percent": period_error_percent,
                },
                "spectral_results": {
                    "Sa_g": sa_g,
                    "spectral_acceleration_m_s2": spectral_acceleration_m_s2,
                    "spectral_displacement_m": spectral_displacement_m,
                    "equivalent_force_n": equivalent_force_n,
                    "equivalent_force_tonf": equivalent_force_tonf,
                    "estimated_drift": drift,
                },
                "comparison_with_etabs": comparison,
            }
        )

    except Exception as e:
        return (
            jsonify({"success": False, "type": "modal-spectral-test", "error": str(e)}),
            500,
        )


@app.route("/api/analyze/modal-spectral-cases-test", methods=["GET"])
def modal_spectral_cases_test():
    """
    Endpoint de prueba para calcular todos los casos espectrales tipo ETABS.

    Casos incluidos:
    - SDX
    - SDY
    - SDX_ESCALADO
    - SDY_ESCALADO
    - DER_XX
    - DER_YY

    Objetivo:
    Validar en una sola respuesta los resultados espectrales comparados con ETABS.
    """

    try:
        import math
        import openseespy.opensees as ops

        # ==============================
        # 1. Espectro del Excel ETABS
        # ==============================
        spectrum = [
            {"T": 0.00, "Sa": 0.196875},
            {"T": 0.10, "Sa": 0.196875},
            {"T": 0.20, "Sa": 0.196875},
            {"T": 0.50, "Sa": 0.196875},
            {"T": 1.00, "Sa": 0.196875},
            {"T": 1.20, "Sa": 0.164063},
            {"T": 1.50, "Sa": 0.131250},
            {"T": 2.00, "Sa": 0.078750},
            {"T": 3.00, "Sa": 0.035000},
            {"T": 5.00, "Sa": 0.012600},
            {"T": 15.00, "Sa": 0.001400},
        ]

        # ==============================
        # 2. Casos del Excel ETABS
        # ==============================
        cases = {
            "SDX": {
                "label": "SDX",
                "direction": "X",
                "target_period_s": 0.219,
                "scale_factor": 9.81,
                "mass_kg": 7180.0,
                "height_m": 3.61,
                "expected_base_shear_tonf": 1.414,
                "expected_displacement_m": 0.002349,
                "expected_drift": 0.000651,
            },
            "SDY": {
                "label": "SDY",
                "direction": "Y",
                "target_period_s": 0.214,
                "scale_factor": 9.81,
                "mass_kg": 7180.0,
                "height_m": 3.61,
                "expected_base_shear_tonf": 1.414,
                "expected_displacement_m": 0.002242,
                "expected_drift": 0.000621,
            },
            "SDX_ESCALADO": {
                "label": "SDX ESCALADO",
                "direction": "X",
                "target_period_s": 0.219,
                "scale_factor": 10.7415,
                "mass_kg": 7180.0,
                "height_m": 3.61,
                "expected_base_shear_tonf": 1.5484,
                "expected_displacement_m": 0.002572,
                "expected_drift": 0.000712,
            },
            "SDY_ESCALADO": {
                "label": "SDY ESCALADO",
                "direction": "Y",
                "target_period_s": 0.214,
                "scale_factor": 10.36,
                "mass_kg": 7180.0,
                "height_m": 3.61,
                "expected_base_shear_tonf": 1.4932,
                "expected_displacement_m": 0.002367,
                "expected_drift": 0.000656,
            },
            "DER_XX": {
                "label": "DER XX",
                "direction": "X",
                "target_period_s": 0.219,
                "scale_factor": 44.145,
                "mass_kg": 7180.0,
                "height_m": 3.61,
                "expected_base_shear_tonf": 6.3636,
                "expected_displacement_m": 0.010570,
                "expected_drift": 0.002928,
            },
            "DER_YY": {
                "label": "DER YY",
                "direction": "Y",
                "target_period_s": 0.214,
                "scale_factor": 44.145,
                "mass_kg": 7180.0,
                "height_m": 3.61,
                "expected_base_shear_tonf": 6.3636,
                "expected_displacement_m": 0.010088,
                "expected_drift": 0.002794,
            },
        }

        # ==============================
        # 3. Funciones auxiliares
        # ==============================
        def interpolate_spectrum(period, spectrum_points):
            points = sorted(spectrum_points, key=lambda p: float(p["T"]))

            if period <= float(points[0]["T"]):
                return float(points[0]["Sa"])

            if period >= float(points[-1]["T"]):
                return float(points[-1]["Sa"])

            for i in range(len(points) - 1):
                t1 = float(points[i]["T"])
                t2 = float(points[i + 1]["T"])
                sa1 = float(points[i]["Sa"])
                sa2 = float(points[i + 1]["Sa"])

                if t1 <= period <= t2:
                    ratio = (period - t1) / (t2 - t1)
                    return sa1 + ratio * (sa2 - sa1)

            return float(points[-1]["Sa"])

        def percent_error(calculated, expected):
            if expected is None or abs(expected) < 1e-12:
                return None

            return abs(calculated - expected) / abs(expected) * 100.0

        def calculate_case(case_key, case_data):
            mass_kg = case_data["mass_kg"]
            height_m = case_data["height_m"]
            target_period_s = case_data["target_period_s"]
            scale_factor = case_data["scale_factor"]

            # k = m * (2*pi/T)^2
            stiffness_n_m = mass_kg * ((2.0 * math.pi / target_period_s) ** 2)

            # ==============================
            # Modelo OpenSeesPy 1 GDL
            # ==============================
            ops.wipe()
            ops.model("basic", "-ndm", 1, "-ndf", 1)

            ops.node(1, 0.0)
            ops.node(2, 0.0)

            ops.fix(1, 1)
            ops.fix(2, 0)

            ops.mass(2, mass_kg)

            ops.uniaxialMaterial("Elastic", 1, stiffness_n_m)
            ops.element("zeroLength", 1, 1, 2, "-mat", 1, "-dir", 1)

            eigenvalues = ops.eigen("-fullGenLapack", 1)

            eigenvalue = float(eigenvalues[0])
            angular_frequency = math.sqrt(eigenvalue)
            frequency_hz = angular_frequency / (2.0 * math.pi)
            period_s = 1.0 / frequency_hz

            sa_g = interpolate_spectrum(period_s, spectrum)

            spectral_acceleration_m_s2 = sa_g * scale_factor
            spectral_displacement_m = spectral_acceleration_m_s2 / eigenvalue

            equivalent_force_n = mass_kg * spectral_acceleration_m_s2
            equivalent_force_tonf = equivalent_force_n / 9806.65

            drift = spectral_displacement_m / height_m if height_m > 0 else None

            ops.wipe()

            return {
                "case_key": case_key,
                "label": case_data["label"],
                "direction": case_data["direction"],
                "input": {
                    "mass_kg": mass_kg,
                    "height_m": height_m,
                    "target_period_s": target_period_s,
                    "scale_factor": scale_factor,
                    "stiffness_n_m": stiffness_n_m,
                },
                "modal_results": {
                    "eigenvalue": eigenvalue,
                    "angular_frequency_rad_s": angular_frequency,
                    "frequency_hz": frequency_hz,
                    "period_s": period_s,
                },
                "spectral_results": {
                    "Sa_g": sa_g,
                    "spectral_acceleration_m_s2": spectral_acceleration_m_s2,
                    "spectral_displacement_m": spectral_displacement_m,
                    "equivalent_force_n": equivalent_force_n,
                    "equivalent_force_tonf": equivalent_force_tonf,
                    "estimated_drift": drift,
                },
                "etabs_expected": {
                    "base_shear_tonf": case_data["expected_base_shear_tonf"],
                    "max_displacement_m": case_data["expected_displacement_m"],
                    "drift": case_data["expected_drift"],
                    "period_s": case_data["target_period_s"],
                },
                "error_percent": {
                    "base_shear": percent_error(
                        equivalent_force_tonf, case_data["expected_base_shear_tonf"]
                    ),
                    "max_displacement": percent_error(
                        spectral_displacement_m, case_data["expected_displacement_m"]
                    ),
                    "drift": percent_error(drift, case_data["expected_drift"]),
                    "period": percent_error(period_s, case_data["target_period_s"]),
                },
            }

        # ==============================
        # 4. Calcular todos los casos
        # ==============================
        results = []

        for case_key, case_data in cases.items():
            result = calculate_case(case_key, case_data)
            results.append(result)

        # ==============================
        # 5. Resumen general
        # ==============================
        max_base_shear_error = max(
            item["error_percent"]["base_shear"] for item in results
        )

        max_displacement_error = max(
            item["error_percent"]["max_displacement"] for item in results
        )

        max_drift_error = max(item["error_percent"]["drift"] for item in results)

        return jsonify(
            {
                "success": True,
                "type": "modal-spectral-cases-test",
                "model": "single-degree-of-freedom-batch",
                "summary": {
                    "total_cases": len(results),
                    "max_base_shear_error_percent": max_base_shear_error,
                    "max_displacement_error_percent": max_displacement_error,
                    "max_drift_error_percent": max_drift_error,
                    "status": (
                        "OK"
                        if max_base_shear_error < 1.0
                        and max_displacement_error < 1.0
                        and max_drift_error < 1.0
                        else "REVIEW"
                    ),
                    "note": "Validación simplificada usando masa efectiva aproximada. Todavía no representa el modelo estructural completo.",
                },
                "cases": results,
            }
        )

    except Exception as e:
        return (
            jsonify(
                {"success": False, "type": "modal-spectral-cases-test", "error": str(e)}
            ),
            500,
        )


# ============================================================
# BLOQUE 7A - CONSTRUCTOR SEGURO DE MODELO REAL OPENSEESPY
# ============================================================


def build_opensees_model_from_payload(payload):
    """
    Construye un modelo OpenSeesPy 3D inicial desde el payload real de JHACK.

    Este bloque NO reemplaza todavía el cálculo V1.
    Solo verifica que el backend pueda leer:
    - nodes
    - frames
    - supports
    - sections
    - materials
    - masses

    y construir un modelo 3D estable en OpenSeesPy.
    """

    print("\n" + "=" * 70)
    print("🏗️ BLOQUE 7A - CONSTRUYENDO MODELO REAL DESDE PAYLOAD JHACK")
    print("=" * 70)

    if not OPENSEES_AVAILABLE:
        return {
            "attempted": False,
            "ok": False,
            "mode": "opensees_not_available",
            "error": "OpenSeesPy no está disponible",
        }

    nodes = payload.get("nodes", []) or []
    frames = payload.get("frames", []) or []
    supports = payload.get("supports", []) or []
    sections = payload.get("sections", []) or []
    materials = payload.get("materials", []) or []
    raw_masses = payload.get("masses", []) or []

    # ============================================================
    # BLOQUE 7S-A - Calibración real controlada del modelo
    # ============================================================

    analysis_data = payload.get("analysis", {}) or {}

    model_calibration = (
        analysis_data.get("modelCalibration")
        or analysis_data.get("model_calibration")
        or analysis_data.get("calibrationSettings")
        or {}
    )

    if not isinstance(model_calibration, dict):
        model_calibration = {}

    def read_calibration_bool(value, fallback=False):
        if value is None:
            return fallback

        if isinstance(value, bool):
            return value

        text = str(value).strip().lower()

        return text in ["true", "1", "yes", "si", "sí", "on", "enabled"]

    def read_calibration_factor(keys, fallback=1.0):
        for key in keys:
            if key in model_calibration:
                try:
                    value = float(model_calibration.get(key))

                    if math.isfinite(value) and value > 0:
                        return value
                except Exception:
                    pass

        return fallback

    calibration_enabled = read_calibration_bool(
        model_calibration.get("enabled"),
        False,
    )

    global_stiffness_scale = read_calibration_factor(
        ["globalStiffnessScale", "global_stiffness_scale", "stiffnessScale", "kScale"],
        1.0,
    )

    global_mass_scale = read_calibration_factor(
        ["globalMassScale", "global_mass_scale", "massScale", "mScale"],
        1.0,
    )

    axial_stiffness_scale = read_calibration_factor(
        ["axialStiffnessScale", "axial_stiffness_scale"],
        1.0,
    )

    bending_stiffness_scale = read_calibration_factor(
        ["bendingStiffnessScale", "bending_stiffness_scale"],
        1.0,
    )

    torsion_stiffness_scale = read_calibration_factor(
        ["torsionStiffnessScale", "torsion_stiffness_scale"],
        1.0,
    )

    if not calibration_enabled:
        global_stiffness_scale = 1.0
        global_mass_scale = 1.0
        axial_stiffness_scale = 1.0
        bending_stiffness_scale = 1.0
        torsion_stiffness_scale = 1.0

    if isinstance(raw_masses, dict):
        masses = (
            raw_masses.get("nodalMasses")
            or raw_masses.get("nodeMasses")
            or raw_masses.get("items")
            or []
        )
        mass_source = raw_masses.get("massSource", {}) or {}
    else:
        masses = raw_masses
        mass_source = {}

    summary = {
        "attempted": True,
        "ok": False,
        "mode": "real_model_build_7A",
        "nodes_input": len(nodes),
        "frames_input": len(frames),
        "supports_input": len(supports),
        "sections_input": len(sections),
        "materials_input": len(materials),
        "masses_input": len(masses),
        "nodes_created": 0,
        "frames_created": 0,
        "supports_created": 0,
        "masses_assigned": 0,
        # BLOQUE 7M
        "frame_property_assignments": [],
        "sections_resolved": 0,
        "materials_resolved": 0,
        # BLOQUE 7N
        "diaphragms_created": 0,
        "diaphragm_groups": [],
        "story_levels": [],
        "story_mass_distribution": [],
        "mass_distribution_mode": None,
        "mass_assignments": [],
        "total_mass_x": 0.0,
        "total_mass_y": 0.0,
        "total_mass_z": 0.0,
        "warnings": [],
        "errors": [],
        # BLOQUE 7S-A
        "model_calibration": {
            "enabled": calibration_enabled,
            "global_stiffness_scale": global_stiffness_scale,
            "global_mass_scale": global_mass_scale,
            "axial_stiffness_scale": axial_stiffness_scale,
            "bending_stiffness_scale": bending_stiffness_scale,
            "torsion_stiffness_scale": torsion_stiffness_scale,
            "source": "payload.analysis.modelCalibration",
        },
    }

    if not nodes:
        summary["mode"] = "skipped_no_nodes"
        summary["warnings"].append("No se recibieron nodos en el payload.")
        print("⚠️ No se recibieron nodos. Se omite construcción real.")
        return summary

    if not frames:
        summary["mode"] = "skipped_no_frames"
        summary["warnings"].append("No se recibieron frames en el payload.")
        print("⚠️ No se recibieron frames. Se omite construcción real.")
        return summary

    # ------------------------------------------------------------
    # Funciones auxiliares internas
    # ------------------------------------------------------------
    def read_value(source, names, default=None):
        if not isinstance(source, dict):
            return default

        for name in names:
            if name in source:
                value = source.get(name)
                if value is not None and value != "":
                    return value

        return default

    def to_float(value, default=0.0):
        if value is None or value == "":
            return default

        try:
            if isinstance(value, str):
                value = value.strip().replace(",", ".")
            return float(value)
        except Exception:
            return default

    def to_restraint(value, default=0):
        if value is None or value == "":
            return default

        if isinstance(value, bool):
            return 1 if value else 0

        if isinstance(value, (int, float)):
            return 1 if int(value) != 0 else 0

        text = str(value).strip().lower()

        fixed_values = {
            "1",
            "true",
            "yes",
            "si",
            "sí",
            "fixed",
            "fijo",
            "restrained",
            "empotrado",
            "bloqueado",
        }

        free_values = {"0", "false", "no", "free", "libre", "released", "desbloqueado"}

        if text in fixed_values:
            return 1

        if text in free_values:
            return 0

        return default

    def normalize_key(value):
        if value is None:
            return None
        return str(value).strip()

    def make_safe_int_tag(raw_id, fallback, used_tags):
        """
        OpenSeesPy trabaja mejor con tags enteros.
        Si el id del frontend es string, se convierte a un entero seguro.
        """
        try:
            tag = int(raw_id)
            if tag <= 0:
                tag = fallback
        except Exception:
            tag = fallback

        while tag in used_tags:
            tag += 1

        used_tags.add(tag)
        return tag

    def get_node_raw_id(node, fallback):
        return read_value(
            node,
            ["id", "nodeId", "node_id", "jointId", "joint_id", "label", "name"],
            fallback,
        )

    def get_frame_raw_id(frame, fallback):
        return read_value(
            frame,
            ["id", "frameId", "frame_id", "elementId", "element_id", "label", "name"],
            fallback,
        )

    def get_frame_i_node(frame):
        return read_value(
            frame,
            [
                "node1Id",
                "node1_id",
                "node1",
                "nodo1",
                "iNode",
                "i_node",
                "nodeI",
                "node_i",
                "startNode",
                "start_node",
                "startNodeId",
                "start_node_id",
                "fromNode",
                "from_node",
                "from",
                "n1",
                "i",
            ],
            None,
        )

    def get_frame_j_node(frame):
        return read_value(
            frame,
            [
                "node2Id",
                "node2_id",
                "node2",
                "nodo2",
                "jNode",
                "j_node",
                "nodeJ",
                "node_j",
                "endNode",
                "end_node",
                "endNodeId",
                "end_node_id",
                "toNode",
                "to_node",
                "to",
                "n2",
                "j",
            ],
            None,
        )

    def get_support_node_id(support):
        return read_value(
            support,
            [
                "node",
                "nodeId",
                "node_id",
                "joint",
                "jointId",
                "joint_id",
                "targetNodeId",
                "target_node_id",
            ],
            None,
        )

    def get_mass_node_id(mass_item):
        return read_value(
            mass_item,
            [
                "node",
                "nodeId",
                "node_id",
                "joint",
                "jointId",
                "joint_id",
                "targetNodeId",
                "target_node_id",
            ],
            None,
        )

    def index_items_by_keys(items):
        indexed = {}

        for item in items:
            if not isinstance(item, dict):
                continue

            for key_name in [
                "id",
                "name",
                "label",
                "sectionId",
                "section_id",
                "materialId",
                "material_id",
            ]:
                value = item.get(key_name)
                if value is not None and value != "":
                    indexed[str(value).strip()] = item

        return indexed

    sections_by_key = index_items_by_keys(sections)
    materials_by_key = index_items_by_keys(materials)

    def get_material_from_section_or_frame(section, frame):
        material_key = None

        if isinstance(frame, dict):
            material_key = read_value(
                frame,
                [
                    "materialId",
                    "material_id",
                    "material",
                    "materialName",
                    "material_name",
                ],
                None,
            )

        if material_key is None and isinstance(section, dict):
            material_key = read_value(
                section,
                [
                    "materialId",
                    "material_id",
                    "material",
                    "materialName",
                    "material_name",
                ],
                None,
            )

        if material_key is not None:
            return materials_by_key.get(str(material_key).strip(), {})

        if materials:
            first_material = materials[0]
            if isinstance(first_material, dict):
                return first_material

        return {}

    def get_section_for_frame(frame):
        section_key = read_value(
            frame,
            [
                "sectionId",
                "section_id",
                "section",
                "sectionName",
                "section_name",
                "property",
                "propertyId",
                "property_id",
                "frameSection",
                "frame_section",
            ],
            None,
        )

        if section_key is not None:
            found = sections_by_key.get(str(section_key).strip())
            if found:
                return found

        if sections:
            first_section = sections[0]
            if isinstance(first_section, dict):
                return first_section

        return {}

    def get_section_properties(frame):
        """
        BLOQUE 7M
        Resuelve propiedades reales de sección/material para elasticBeamColumn 3D.
        """

        section = get_section_for_frame(frame)
        material = get_material_from_section_or_frame(section, frame)

        raw_E = read_value(
            frame,
            [
                "E",
                "e",
                "elasticModulus",
                "elastic_modulus",
                "modulusOfElasticity",
                "youngModulus",
                "young_modulus",
            ],
            None,
        )

        if raw_E is None:
            raw_E = read_value(
                section,
                [
                    "E",
                    "e",
                    "elasticModulus",
                    "elastic_modulus",
                    "modulusOfElasticity",
                    "youngModulus",
                    "young_modulus",
                ],
                None,
            )

        if raw_E is None:
            raw_E = read_value(
                material,
                [
                    "E",
                    "e",
                    "elasticModulus",
                    "elastic_modulus",
                    "modulusOfElasticity",
                    "youngModulus",
                    "young_modulus",
                ],
                None,
            )

        E = to_float(raw_E, 210e9)

        # Si viene 210, 200, 300 => GPa
        if E is not None and 0 < E < 10000:
            E = E * 1e9

        # Si viene 210000 => MPa
        elif E is not None and 10000 <= E < 10000000:
            E = E * 1e6

        nu = to_float(
            read_value(
                material,
                ["nu", "poisson", "poissonRatio", "poisson_ratio"],
                read_value(
                    section, ["nu", "poisson", "poissonRatio", "poisson_ratio"], 0.30
                ),
            ),
            0.30,
        )

        G = to_float(
            read_value(
                frame,
                ["G", "g", "shearModulus", "shear_modulus"],
                read_value(
                    section,
                    ["G", "g", "shearModulus", "shear_modulus"],
                    read_value(
                        material, ["G", "g", "shearModulus", "shear_modulus"], None
                    ),
                ),
            ),
            None,
        )

        if G is None or G <= 0:
            G = E / (2.0 * (1.0 + nu))

        width = to_float(
            read_value(section, ["b", "base", "width", "ancho"], None),
            None,
        )

        height = to_float(
            read_value(section, ["h", "height", "depth", "peralte", "alto"], None),
            None,
        )

        A = to_float(
            read_value(
                frame,
                ["A", "_A", "area", "Area", "crossSectionArea"],
                read_value(
                    section, ["A", "_A", "area", "Area", "crossSectionArea"], None
                ),
            ),
            None,
        )

        if A is None or A <= 0:
            if width and height and width > 0 and height > 0:
                A = width * height
            else:
                A = 0.01

        Iy = to_float(
            read_value(
                frame,
                ["Iy", "iy", "Iyy", "i22", "I22", "inertiaY"],
                read_value(
                    section, ["Iy", "iy", "Iyy", "i22", "I22", "inertiaY"], None
                ),
            ),
            None,
        )

        Iz = to_float(
            read_value(
                frame,
                ["Iz", "iz", "Izz", "i33", "I33", "inertiaZ"],
                read_value(
                    section, ["Iz", "iz", "Izz", "i33", "I33", "inertiaZ"], None
                ),
            ),
            None,
        )

        if (Iy is None or Iy <= 0) and width and height and width > 0 and height > 0:
            Iy = height * (width**3) / 12.0

        if (Iz is None or Iz <= 0) and width and height and width > 0 and height > 0:
            Iz = width * (height**3) / 12.0

        if Iy is None or Iy <= 0:
            Iy = max(A**2 / 12.0, 1.0e-6)

        if Iz is None or Iz <= 0:
            Iz = max(A**2 / 12.0, 1.0e-6)

        J = to_float(
            read_value(
                frame,
                ["J", "j", "torsion", "torsionalConstant"],
                read_value(section, ["J", "j", "torsion", "torsionalConstant"], None),
            ),
            None,
        )

        if J is None or J <= 0:
            J = max(Iy + Iz, 1.0e-6)

        section_name = (
            section.get("name")
            or section.get("id")
            or frame.get("sectionName")
            or frame.get("sectionId")
            or "-"
        )

        material_name = (
            material.get("name")
            or material.get("id")
            or frame.get("materialName")
            or frame.get("materialId")
            or "-"
        )

        # ============================================================
        # BLOQUE 7S-A - Aplicar calibración real de rigidez
        # ============================================================
        if calibration_enabled:
            E = E * global_stiffness_scale
            G = G * global_stiffness_scale

            A = A * axial_stiffness_scale

            Iy = Iy * bending_stiffness_scale
            Iz = Iz * bending_stiffness_scale

            J = J * torsion_stiffness_scale

        return {
            "A": A,
            "E": E,
            "G": G,
            "J": J,
            "Iy": Iy,
            "Iz": Iz,
            "nu": nu,
            "section": section,
            "material": material,
            "section_name": section_name,
            "material_name": material_name,
        }

    def choose_geom_transf_vector(coord_i, coord_j):
        """
        Para elasticBeamColumn 3D se necesita un vector de referencia.
        Si el elemento es casi vertical, usamos Y como referencia.
        Si no, usamos Z como referencia.
        """
        xi, yi, zi = coord_i
        xj, yj, zj = coord_j

        dx = xj - xi
        dy = yj - yi
        dz = zj - zi

        length = (dx**2 + dy**2 + dz**2) ** 0.5

        if length <= 1.0e-12:
            return None

        # Elemento casi vertical en Z
        if abs(dz) / length > 0.85:
            return (0.0, 1.0, 0.0)

        # Elemento horizontal o inclinado
        return (0.0, 0.0, 1.0)

    try:
        ops.wipe()
        ops.model("basic", "-ndm", 3, "-ndf", 6)
        print("📐 Modelo OpenSeesPy creado: 3D, 6 GDL por nodo")

        # ------------------------------------------------------------
        # 1. Crear nodos
        # ------------------------------------------------------------
        used_node_tags = set()
        node_tag_by_key = {}
        node_coords_by_tag = {}

        print("\n📍 NODOS:")

        for index, node in enumerate(nodes, start=1):
            raw_id = get_node_raw_id(node, index)
            node_tag = make_safe_int_tag(raw_id, index, used_node_tags)

            position = node.get("position", {}) or {}

            x = to_float(
                read_value(
                    node,
                    ["x", "X", "coordX", "coordinateX"],
                    read_value(position, ["x", "X", "coordX", "coordinateX"], 0.0),
                ),
                0.0,
            )

            y = to_float(
                read_value(
                    node,
                    ["y", "Y", "coordY", "coordinateY"],
                    read_value(position, ["y", "Y", "coordY", "coordinateY"], 0.0),
                ),
                0.0,
            )

            z = to_float(
                read_value(
                    node,
                    ["z", "Z", "coordZ", "coordinateZ", "elevation"],
                    read_value(
                        position, ["z", "Z", "coordZ", "coordinateZ", "elevation"], 0.0
                    ),
                ),
                0.0,
            )

            ops.node(node_tag, x, y, z)

            node_key = normalize_key(raw_id)
            node_tag_by_key[node_key] = node_tag
            node_tag_by_key[str(node_tag)] = node_tag
            node_coords_by_tag[node_tag] = (x, y, z)

            summary["nodes_created"] += 1
            print(f"   Nodo payload={raw_id} -> tag={node_tag}: ({x}, {y}, {z})")

            # ------------------------------------------------------------
        # 2. Crear apoyos/restricciones
        # ------------------------------------------------------------
        print("\n🔒 APOYOS / RESTRICCIONES:")

        supported_node_tags = set()

        def infer_vertical_axis_and_base_nodes(coords_by_tag):
            """
            Detecta el eje vertical del modelo:
            - Si hay variación en Z, usa Z como altura.
            - Si Z no varía pero Y sí, usa Y como altura.
            - Si no hay variación clara, usa Z por defecto.
            """
            if not coords_by_tag:
                return "z", []

            xs = [coord[0] for coord in coords_by_tag.values()]
            ys = [coord[1] for coord in coords_by_tag.values()]
            zs = [coord[2] for coord in coords_by_tag.values()]

            ranges = {
                "x": max(xs) - min(xs),
                "y": max(ys) - min(ys),
                "z": max(zs) - min(zs),
            }

            eps = 1.0e-9

            if ranges["z"] > eps:
                axis = "z"
                values = {tag: coord[2] for tag, coord in coords_by_tag.items()}
            elif ranges["y"] > eps:
                axis = "y"
                values = {tag: coord[1] for tag, coord in coords_by_tag.items()}
            else:
                axis = "z"
                values = {tag: coord[2] for tag, coord in coords_by_tag.items()}

            min_value = min(values.values())
            base_tags = [
                tag for tag, value in values.items() if abs(value - min_value) <= eps
            ]

            return axis, base_tags

        # ============================================================
        # BLOQUE 7N - Stories, diafragmas y Mass Source estilo ETABS
        # ============================================================

        def get_vertical_axis_index(axis):
            return {"x": 0, "y": 1, "z": 2}.get(axis, 2)

        def group_nodes_by_story_level(coords_by_tag, vertical_axis, tolerance=1.0e-6):
            """
            Agrupa nodos por nivel según el eje vertical detectado.
            Ejemplo:
            - vertical_axis = z => niveles por coordenada Z
            - vertical_axis = y => niveles por coordenada Y
            """
            axis_index = get_vertical_axis_index(vertical_axis)
            raw_levels = {}

            for tag, coord in coords_by_tag.items():
                level_value = float(coord[axis_index])
                rounded_key = round(level_value / tolerance) * tolerance

                if rounded_key not in raw_levels:
                    raw_levels[rounded_key] = {
                        "level": level_value,
                        "nodes": [],
                    }

                raw_levels[rounded_key]["nodes"].append(tag)

            levels = sorted(raw_levels.values(), key=lambda item: item["level"])

            return levels

        def get_node_diaphragm_id_from_payload_node(node):
            """
            Lee diafragma desde el nodo exportado por JHACK.
            Compatible con:
            - node.diaphragmId
            - node.diaphragmName
            - node.diaphragm.id
            - node.assignment.diaphragm.id
            """
            if not isinstance(node, dict):
                return None

            direct = read_value(
                node,
                ["diaphragmId", "diaphragmName", "diaphragm_id", "diaphragm_name"],
                None,
            )

            if direct:
                return str(direct)

            diaphragm = node.get("diaphragm")

            if isinstance(diaphragm, dict):
                value = read_value(diaphragm, ["id", "name"], None)
                if value:
                    return str(value)

            assignment = node.get("assignment") or {}

            if isinstance(assignment, dict):
                assignment_diaphragm = assignment.get("diaphragm")

                if isinstance(assignment_diaphragm, dict):
                    value = read_value(assignment_diaphragm, ["id", "name"], None)
                    if value:
                        return str(value)

            return None

        def should_use_rigid_diaphragms():
            """
            Decide si se deben crear diafragmas rígidos.
            Por defecto:
            - Si hay nodos con diaphragmId/diaphragmName => sí.
            - Si analysis.useRigidDiaphragms viene true => sí.
            """
            analysis_data = payload.get("analysis", {}) or {}

            explicit = read_value(
                analysis_data,
                [
                    "useRigidDiaphragms",
                    "use_rigid_diaphragms",
                    "rigidDiaphragms",
                    "rigid_diaphragms",
                ],
                None,
            )

            if explicit is not None:
                text = str(explicit).strip().lower()
                return text in ["true", "1", "yes", "si", "sí", "on"]

            for node in nodes:
                if get_node_diaphragm_id_from_payload_node(node):
                    return True

            return False

        def apply_rigid_diaphragms_if_available():
            """
            Crea diafragmas rígidos por nivel/story.

            En OpenSees:
            rigidDiaphragm(perpDirn, retainedNode, constrainedNodes...)

            perpDirn:
            - 1 si el plano del diafragma es YZ
            - 2 si el plano del diafragma es XZ
            - 3 si el plano del diafragma es XY
            """
            if not should_use_rigid_diaphragms():
                summary["diaphragm_mode"] = "skipped_disabled_or_not_assigned"
                return

            vertical_axis = summary.get("inferred_vertical_axis", "z")
            perp_dirn = {"x": 1, "y": 2, "z": 3}.get(vertical_axis, 3)

            story_levels = group_nodes_by_story_level(
                node_coords_by_tag,
                vertical_axis,
            )

            summary["story_levels"] = [
                {
                    "level": item["level"],
                    "nodes_count": len(item["nodes"]),
                    "nodes": [int(tag) for tag in item["nodes"]],
                }
                for item in story_levels
            ]

            # Mapa raw node id -> diaphragm id
            diaphragm_by_tag = {}

            for node in nodes:
                raw_id = get_node_raw_id(node, None)
                node_tag = node_tag_by_key.get(normalize_key(raw_id))

                if node_tag is None:
                    continue

                diaphragm_id = get_node_diaphragm_id_from_payload_node(node)

                if diaphragm_id:
                    diaphragm_by_tag[node_tag] = diaphragm_id

            # Si no hay asignación explícita pero se pidió rigid diaphragm,
            # se crea diafragma automático por nivel superior.
            explicit_diaphragms = len(diaphragm_by_tag) > 0

            created = 0

            for story_index, story in enumerate(story_levels, start=1):
                story_nodes = list(story["nodes"])

                # No crear diafragma en la base si todos los nodos del nivel están apoyados.
                non_supported_nodes = [
                    tag for tag in story_nodes if tag not in supported_node_tags
                ]

                if not non_supported_nodes:
                    summary["warnings"].append(
                        f"Diafragma omitido en nivel {story['level']}: todos los nodos están apoyados."
                    )
                    continue

                candidate_nodes = non_supported_nodes

                if len(candidate_nodes) < 2:
                    summary["warnings"].append(
                        f"Diafragma omitido en nivel {story['level']}: solo hay {len(candidate_nodes)} nodo libre."
                    )
                    continue

                if explicit_diaphragms:
                    groups = {}

                    for tag in candidate_nodes:
                        diaphragm_id = diaphragm_by_tag.get(tag)

                        if not diaphragm_id:
                            continue

                        groups.setdefault(diaphragm_id, []).append(tag)
                else:
                    groups = {
                        f"AUTO_D{story_index}": candidate_nodes,
                    }

                for diaphragm_id, group_nodes in groups.items():
                    if len(group_nodes) < 2:
                        continue

                    # Retained node: el primero del grupo.
                    retained = group_nodes[0]
                    constrained = [tag for tag in group_nodes if tag != retained]

                    if not constrained:
                        continue

                    try:
                        ops.rigidDiaphragm(perp_dirn, retained, *constrained)

                        created += 1

                        summary["diaphragm_groups"].append(
                            {
                                "diaphragm_id": str(diaphragm_id),
                                "story_level": float(story["level"]),
                                "vertical_axis": vertical_axis,
                                "perp_dirn": perp_dirn,
                                "retained_node": int(retained),
                                "constrained_nodes": [int(tag) for tag in constrained],
                                "nodes_count": len(group_nodes),
                                "source": (
                                    "node.diaphragm"
                                    if explicit_diaphragms
                                    else "auto_by_story_level"
                                ),
                            }
                        )

                        print(
                            f"   Diafragma {diaphragm_id}: nivel={story['level']} "
                            f"retained={retained}, constrained={constrained}"
                        )

                    except Exception as diaphragm_error:
                        summary["warnings"].append(
                            f"No se pudo crear diafragma {diaphragm_id}: {str(diaphragm_error)}"
                        )

            summary["diaphragms_created"] = created

            if created > 0:
                summary["diaphragm_mode"] = "rigid_diaphragm_created"
            else:
                summary["diaphragm_mode"] = "no_valid_diaphragm_groups"

        def distribute_mass_by_story_levels(total_mass_kg, fallback_mass_source):
            """
            Distribuye masa tipo ETABS:
            - No coloca masa en nodos apoyados/base si existen niveles superiores.
            - Distribuye la masa por niveles superiores.
            - En cada nivel, reparte entre los nodos de ese story.
            """
            vertical_axis = summary.get("inferred_vertical_axis", None)

            if vertical_axis not in ["x", "y", "z"]:
                vertical_axis, _ = infer_vertical_axis_and_base_nodes(
                    node_coords_by_tag
                )
                summary["inferred_vertical_axis"] = vertical_axis

            story_levels = group_nodes_by_story_level(
                node_coords_by_tag,
                vertical_axis,
            )

            summary["story_levels"] = [
                {
                    "level": item["level"],
                    "nodes_count": len(item["nodes"]),
                    "nodes": [int(tag) for tag in item["nodes"]],
                }
                for item in story_levels
            ]

            upper_stories = []

            for story in story_levels:
                nodes_in_story = list(story["nodes"])

                non_supported_nodes = [
                    tag for tag in nodes_in_story if tag not in supported_node_tags
                ]

                if non_supported_nodes:
                    upper_stories.append(
                        {
                            "level": story["level"],
                            "nodes": non_supported_nodes,
                        }
                    )

            if not upper_stories:
                free_tags = [
                    tag
                    for tag in node_coords_by_tag.keys()
                    if tag not in supported_node_tags
                ]

                if free_tags:
                    upper_stories = [
                        {
                            "level": 0.0,
                            "nodes": free_tags,
                        }
                    ]

            if not upper_stories:
                return []

            mass_per_story = total_mass_kg / len(upper_stories)
            assignments = []

            for story in upper_stories:
                story_nodes = story["nodes"]

                if not story_nodes:
                    continue

                mass_per_node = mass_per_story / len(story_nodes)
                rotational_mass = max(mass_per_node * 1.0e-6, 1.0e-9)

                summary["story_mass_distribution"].append(
                    {
                        "story_level": float(story["level"]),
                        "nodes_count": len(story_nodes),
                        "story_mass_kg": float(mass_per_story),
                        "mass_per_node_kg": float(mass_per_node),
                        "nodes": [int(tag) for tag in story_nodes],
                        "source": fallback_mass_source,
                    }
                )

                for node_tag in story_nodes:
                    assignments.append(
                        {
                            "node_tag": node_tag,
                            "raw_node_id": node_tag,
                            "mx": mass_per_node,
                            "my": mass_per_node,
                            "mz": mass_per_node,
                            "mrx": rotational_mass,
                            "mry": rotational_mass,
                            "mrz": rotational_mass,
                            "source": f"fallback.story_mass_from_{fallback_mass_source}",
                        }
                    )

            summary["mass_distribution_mode"] = "story_level_distribution"

            return assignments

        def apply_fixity(node_tag, raw_node_id, ux, uy, uz, rx, ry, rz, source):
            ops.fix(node_tag, ux, uy, uz, rx, ry, rz)
            supported_node_tags.add(node_tag)
            summary["supports_created"] += 1
            summary["supports_source"] = source

            print(
                f"   Nodo {raw_node_id} -> tag={node_tag}: "
                f"UX={ux}, UY={uy}, UZ={uz}, RX={rx}, RY={ry}, RZ={rz} | source={source}"
            )

        explicit_supports_created = 0

        # 2.1 Apoyos enviados en payload.supports
        for support in supports:
            if not isinstance(support, dict):
                continue

            raw_node_id = get_support_node_id(support)

            if raw_node_id is None:
                possible_id = support.get("id")
                if normalize_key(possible_id) in node_tag_by_key:
                    raw_node_id = possible_id

            node_tag = node_tag_by_key.get(normalize_key(raw_node_id))

            if node_tag is None:
                summary["warnings"].append(
                    f"Apoyo omitido: nodo no encontrado ({raw_node_id})"
                )
                continue

            support_type = (
                str(read_value(support, ["type", "supportType", "support_type"], ""))
                .strip()
                .lower()
            )

            restraint_source = (
                support.get("restraints") or support.get("fixity") or support
            )

            if support_type in ["fixed", "fijo", "empotrado", "encastre"]:
                ux = uy = uz = rx = ry = rz = 1
            else:
                ux = to_restraint(
                    read_value(restraint_source, ["ux", "UX", "u1", "U1"], 0), 0
                )
                uy = to_restraint(
                    read_value(restraint_source, ["uy", "UY", "u2", "U2"], 0), 0
                )
                uz = to_restraint(
                    read_value(restraint_source, ["uz", "UZ", "u3", "U3"], 0), 0
                )
                rx = to_restraint(
                    read_value(restraint_source, ["rx", "RX", "r1", "R1"], 0), 0
                )
                ry = to_restraint(
                    read_value(restraint_source, ["ry", "RY", "r2", "R2"], 0), 0
                )
                rz = to_restraint(
                    read_value(restraint_source, ["rz", "RZ", "r3", "R3"], 0), 0
                )

            apply_fixity(
                node_tag, raw_node_id, ux, uy, uz, rx, ry, rz, "payload.supports"
            )
            explicit_supports_created += 1

        # 2.2 Apoyos guardados dentro de cada nodo: node.restraints
        node_restraints_created = 0

        if explicit_supports_created == 0:
            for node in nodes:
                if not isinstance(node, dict):
                    continue

                restraints = node.get("restraints") or node.get("fixity")

                if not isinstance(restraints, dict):
                    continue

                raw_node_id = get_node_raw_id(node, None)
                node_tag = node_tag_by_key.get(normalize_key(raw_node_id))

                if node_tag is None:
                    continue

                ux = to_restraint(
                    read_value(restraints, ["ux", "UX", "u1", "U1"], 0), 0
                )
                uy = to_restraint(
                    read_value(restraints, ["uy", "UY", "u2", "U2"], 0), 0
                )
                uz = to_restraint(
                    read_value(restraints, ["uz", "UZ", "u3", "U3"], 0), 0
                )
                rx = to_restraint(
                    read_value(restraints, ["rx", "RX", "r1", "R1"], 0), 0
                )
                ry = to_restraint(
                    read_value(restraints, ["ry", "RY", "r2", "R2"], 0), 0
                )
                rz = to_restraint(
                    read_value(restraints, ["rz", "RZ", "r3", "R3"], 0), 0
                )

                if ux or uy or uz or rx or ry or rz:
                    apply_fixity(
                        node_tag, raw_node_id, ux, uy, uz, rx, ry, rz, "node.restraints"
                    )
                    node_restraints_created += 1

        # 2.3 Fallback: si no hay apoyos, fijar automáticamente la base
        if summary["supports_created"] == 0:
            vertical_axis, base_tags = infer_vertical_axis_and_base_nodes(
                node_coords_by_tag
            )

            summary["inferred_vertical_axis"] = vertical_axis
            summary["base_nodes_fixed"] = len(base_tags)

            if not base_tags:
                summary["warnings"].append(
                    "No se pudo inferir nodos de base para fallback de apoyos."
                )
                print("   ⚠️ No se pudo inferir base para apoyos fallback.")
            else:
                for node_tag in base_tags:
                    apply_fixity(
                        node_tag, node_tag, 1, 1, 1, 1, 1, 1, "fallback.base_nodes"
                    )

                summary["warnings"].append(
                    f"No se recibieron apoyos. Se fijaron {len(base_tags)} nodo(s) de base usando eje vertical {vertical_axis.upper()}."
                )
        else:
            if "inferred_vertical_axis" not in summary:
                vertical_axis, _ = infer_vertical_axis_and_base_nodes(
                    node_coords_by_tag
                )
                summary["inferred_vertical_axis"] = vertical_axis

            summary["base_nodes_fixed"] = len(supported_node_tags)

        if summary["supports_created"] == 0:
            print("   ⚠️ No se crearon apoyos.")

            # ============================================================
        # BLOQUE 7N - Aplicar diafragmas rígidos después de apoyos
        # ============================================================
        print("\n🏢 DIAFRAGMAS RÍGIDOS:")

        apply_rigid_diaphragms_if_available()

        if summary.get("diaphragms_created", 0) == 0:
            print("   ⚠️ No se crearon diafragmas rígidos.")
        else:
            print(f"   ✅ Diafragmas creados: {summary['diaphragms_created']}")

        # ------------------------------------------------------------
        # 3. Asignar masas si vienen en el payload
        # ------------------------------------------------------------
        print("\n⚖️ MASAS:")

        def apply_mass(node_tag, raw_node_id, mx, my, mz, mrx, mry, mrz, source):
            
            # ============================================================
            # BLOQUE 7S-A - Aplicar calibración real de masa
            # ============================================================
            if calibration_enabled:
                mx = mx * global_mass_scale
                my = my * global_mass_scale
                mz = mz * global_mass_scale

                mrx = mrx * global_mass_scale
                mry = mry * global_mass_scale
                mrz = mrz * global_mass_scale

                source = f"{source}|model_calibration.mass_scale"
            
            ops.mass(node_tag, mx, my, mz, mrx, mry, mrz)
            summary["masses_assigned"] += 1
            summary["masses_source"] = source

            mass_record = {
                "node_tag": int(node_tag),
                "raw_node_id": str(raw_node_id),
                "mx": float(mx),
                "my": float(my),
                "mz": float(mz),
                "mrx": float(mrx),
                "mry": float(mry),
                "mrz": float(mrz),
                "source": source,
            }

            summary.setdefault("mass_assignments", []).append(mass_record)
            summary["total_mass_x"] = float(summary.get("total_mass_x", 0.0)) + float(
                mx
            )
            summary["total_mass_y"] = float(summary.get("total_mass_y", 0.0)) + float(
                my
            )
            summary["total_mass_z"] = float(summary.get("total_mass_z", 0.0)) + float(
                mz
            )

            print(
                f"   Nodo {raw_node_id} -> tag={node_tag}: "
                f"MX={mx}, MY={my}, MZ={mz}, MRX={mrx}, MRY={mry}, MRZ={mrz} | source={source}"
            )

        def read_modal_fallback_mass_kg():
            """
            Intenta obtener masa modal desde:
            1. analysis.cases[0].effectiveMassKg
            2. analysis.cases[0].massKg
            3. masses.massSource.totalMassKg si existiera
            4. fallback 7180 kg, usado en la validación ETABS simplificada
            """
            analysis_data = payload.get("analysis", {}) or {}
            cases_data = analysis_data.get("cases", []) or []

            for case_item in cases_data:
                if not isinstance(case_item, dict):
                    continue

                value = read_value(
                    case_item,
                    [
                        "effectiveMassKg",
                        "effective_mass_kg",
                        "massKg",
                        "mass_kg",
                        "mass",
                    ],
                    None,
                )

                value = to_float(value, None)

                if value is not None and value > 0:
                    return value, "analysis.cases"

            value = read_value(
                mass_source,
                ["totalMassKg", "total_mass_kg", "massKg", "mass_kg", "mass"],
                None,
            )

            value = to_float(value, None)

            if value is not None and value > 0:
                return value, "masses.massSource"

            return 7180.0, "fallback.default_7180kg"

        def find_mass_target_nodes():
            """
            Busca nodos donde colocar masa fallback:
            - Primero intenta nodos libres, no apoyados.
            - Si hay eje vertical, usa los nodos de nivel superior.
            - Si no puede detectar, usa todos los nodos no apoyados.
            """
            if not node_coords_by_tag:
                return []

            vertical_axis = summary.get("inferred_vertical_axis", None)

            if vertical_axis not in ["x", "y", "z"]:
                vertical_axis, _ = infer_vertical_axis_and_base_nodes(
                    node_coords_by_tag
                )
                summary["inferred_vertical_axis"] = vertical_axis

            axis_index = {"x": 0, "y": 1, "z": 2}[vertical_axis]

            free_tags = [
                tag
                for tag in node_coords_by_tag.keys()
                if tag not in supported_node_tags
            ]

            if not free_tags:
                free_tags = list(node_coords_by_tag.keys())

            values = {tag: node_coords_by_tag[tag][axis_index] for tag in free_tags}

            max_value = max(values.values())
            eps = 1.0e-9

            top_tags = [
                tag for tag, value in values.items() if abs(value - max_value) <= eps
            ]

            return top_tags or free_tags

        # 3.1 Masas enviadas como payload.masses.nodalMasses
        for mass_item in masses:
            if not isinstance(mass_item, dict):
                continue

            raw_node_id = get_mass_node_id(mass_item)
            node_tag = node_tag_by_key.get(normalize_key(raw_node_id))

            if node_tag is None:
                summary["warnings"].append(
                    f"Masa omitida: nodo no encontrado ({raw_node_id})"
                )
                continue

            scalar_mass = to_float(
                read_value(mass_item, ["mass", "m", "massKg", "mass_kg"], None),
                None,
            )

            if scalar_mass is not None and scalar_mass > 0:
                mx = my = mz = scalar_mass
            else:
                mx = to_float(
                    read_value(mass_item, ["mx", "mX", "massX", "mass_x"], 0.0), 0.0
                )
                my = to_float(
                    read_value(mass_item, ["my", "mY", "massY", "mass_y"], 0.0), 0.0
                )
                mz = to_float(
                    read_value(mass_item, ["mz", "mZ", "massZ", "mass_z"], 0.0), 0.0
                )

            mrx = to_float(read_value(mass_item, ["mrx", "mrX", "rotMassX"], 0.0), 0.0)
            mry = to_float(read_value(mass_item, ["mry", "mrY", "rotMassY"], 0.0), 0.0)
            mrz = to_float(read_value(mass_item, ["mrz", "mrZ", "rotMassZ"], 0.0), 0.0)

            if mx > 0 or my > 0 or mz > 0 or mrx > 0 or mry > 0 or mrz > 0:
                apply_mass(
                    node_tag, raw_node_id, mx, my, mz, mrx, mry, mrz, "payload.masses"
                )

        # 3.2 Masas guardadas dentro del nodo: node.mass
        if summary["masses_assigned"] == 0:
            for node in nodes:
                if not isinstance(node, dict):
                    continue

                raw_node_id = get_node_raw_id(node, None)
                node_tag = node_tag_by_key.get(normalize_key(raw_node_id))

                if node_tag is None:
                    continue

                node_mass = node.get("mass")

                if node_mass is None:
                    continue

                if isinstance(node_mass, dict):
                    scalar_mass = to_float(
                        read_value(node_mass, ["mass", "m", "massKg", "mass_kg"], None),
                        None,
                    )

                    if scalar_mass is not None and scalar_mass > 0:
                        mx = my = mz = scalar_mass
                    else:
                        mx = to_float(
                            read_value(node_mass, ["mx", "mX", "massX", "mass_x"], 0.0),
                            0.0,
                        )
                        my = to_float(
                            read_value(node_mass, ["my", "mY", "massY", "mass_y"], 0.0),
                            0.0,
                        )
                        mz = to_float(
                            read_value(node_mass, ["mz", "mZ", "massZ", "mass_z"], 0.0),
                            0.0,
                        )

                    mrx = to_float(
                        read_value(node_mass, ["mrx", "mrX", "rotMassX"], 0.0), 0.0
                    )
                    mry = to_float(
                        read_value(node_mass, ["mry", "mrY", "rotMassY"], 0.0), 0.0
                    )
                    mrz = to_float(
                        read_value(node_mass, ["mrz", "mrZ", "rotMassZ"], 0.0), 0.0
                    )
                else:
                    scalar_mass = to_float(node_mass, 0.0)
                    mx = my = mz = scalar_mass
                    mrx = mry = mrz = 0.0

                if mx > 0 or my > 0 or mz > 0 or mrx > 0 or mry > 0 or mrz > 0:
                    apply_mass(
                        node_tag, raw_node_id, mx, my, mz, mrx, mry, mrz, "node.mass"
                    )

        # 3.3 Fallback modal mejorado tipo ETABS:
        # distribuir masa por niveles/story, no solo en el nivel superior.
        if summary["masses_assigned"] == 0:
            total_mass_kg, fallback_mass_source = read_modal_fallback_mass_kg()

            story_mass_assignments = distribute_mass_by_story_levels(
                total_mass_kg,
                fallback_mass_source,
            )

            summary["fallback_modal_mass_kg"] = total_mass_kg
            summary["mass_target_nodes"] = len(story_mass_assignments)

            if not story_mass_assignments:
                summary["warnings"].append(
                    "No se pudo asignar masa fallback por niveles: no hay nodos objetivo."
                )
                print("   ⚠️ No se pudo asignar masa fallback por niveles.")
            else:
                for item in story_mass_assignments:
                    apply_mass(
                        item["node_tag"],
                        item["raw_node_id"],
                        item["mx"],
                        item["my"],
                        item["mz"],
                        item["mrx"],
                        item["mry"],
                        item["mrz"],
                        item["source"],
                    )

                summary["warnings"].append(
                    f"No se recibieron masas nodales. Se distribuyó {total_mass_kg} kg "
                    f"por niveles/story en {len(story_mass_assignments)} nodo(s)."
                )

        if summary["masses_assigned"] == 0:
            print("   ⚠️ No se asignaron masas.")

        # ------------------------------------------------------------
        # 4. Crear elementos frame 3D simplificados
        # ------------------------------------------------------------
        print("\n🔗 ELEMENTOS FRAME 3D:")

        used_element_tags = set()
        transf_tag = 1

        for index, frame in enumerate(frames, start=1):
            if not isinstance(frame, dict):
                continue

            raw_frame_id = get_frame_raw_id(frame, index)
            ele_tag = make_safe_int_tag(raw_frame_id, index, used_element_tags)

            raw_i = get_frame_i_node(frame)
            raw_j = get_frame_j_node(frame)

            node_i = node_tag_by_key.get(normalize_key(raw_i))
            node_j = node_tag_by_key.get(normalize_key(raw_j))

            if node_i is None or node_j is None:
                msg = (
                    f"Frame omitido {raw_frame_id}: nodos no encontrados "
                    f"i={raw_i}, j={raw_j}"
                )
                summary["warnings"].append(msg)
                print(f"   ⚠️ {msg}")
                continue

            coord_i = node_coords_by_tag.get(node_i)
            coord_j = node_coords_by_tag.get(node_j)

            if coord_i is None or coord_j is None:
                msg = f"Frame omitido {raw_frame_id}: coordenadas no encontradas."
                summary["warnings"].append(msg)
                print(f"   ⚠️ {msg}")
                continue

            vector = choose_geom_transf_vector(coord_i, coord_j)

            if vector is None:
                msg = f"Frame omitido {raw_frame_id}: longitud cero o casi cero."
                summary["warnings"].append(msg)
                print(f"   ⚠️ {msg}")
                continue

            props = get_section_properties(frame)

            if props.get("section"):
                summary["sections_resolved"] += 1

            if props.get("material"):
                summary["materials_resolved"] += 1

            summary["frame_property_assignments"].append(
                {
                    "frame_id": str(raw_frame_id),
                    "section_name": props.get("section_name"),
                    "material_name": props.get("material_name"),
                    "E": props.get("E"),
                    "G": props.get("G"),
                    "A": props.get("A"),
                    "Iy": props.get("Iy"),
                    "Iz": props.get("Iz"),
                    "J": props.get("J"),
                }
            )

            vx, vy, vz = vector
            ops.geomTransf("Linear", transf_tag, vx, vy, vz)

            ops.element(
                "elasticBeamColumn",
                ele_tag,
                node_i,
                node_j,
                props["A"],
                props["E"],
                props["G"],
                props["J"],
                props["Iy"],
                props["Iz"],
                transf_tag,
            )

            summary["frames_created"] += 1

            print(
                f"   Frame payload={raw_frame_id} -> ele={ele_tag}: "
                f"{raw_i}->{raw_j} | tags {node_i}->{node_j} | "
                f"A={props['A']:.6g}, E={props['E']:.6g}, "
                f"Iy={props['Iy']:.6g}, Iz={props['Iz']:.6g}, J={props['J']:.6g}"
            )

            transf_tag += 1

        # ------------------------------------------------------------
        # 5. Validación mínima del modelo construido
        # ------------------------------------------------------------
        if summary["nodes_created"] <= 0:
            summary["errors"].append("No se creó ningún nodo.")

        if summary["frames_created"] <= 0:
            summary["errors"].append("No se creó ningún elemento frame.")

        if summary["errors"]:
            summary["ok"] = False
            summary["mode"] = "real_model_build_failed"
            print("❌ Modelo real construido con errores.")
        else:
            summary["ok"] = True
            summary["mode"] = "real_model_build_ok"
            print("✅ Modelo real OpenSeesPy construido correctamente.")

        if summary.get("frames_created", 0) > 0:
            if summary.get("sections_resolved", 0) == 0:
                summary["warnings"].append(
                    "No se resolvieron secciones reales para los frames. Se usaron valores fallback."
                )

            if summary.get("materials_resolved", 0) == 0:
                summary["warnings"].append(
                    "No se resolvieron materiales reales para los frames. Se usaron valores fallback."
                )
                
            if calibration_enabled:
                summary["warnings"].append(
                    "Calibración real del modelo activada: se aplicaron factores de rigidez/masa desde payload.analysis.modelCalibration."
            )

        print("\n📌 RESUMEN BLOQUE 7A:")
        print(f"   Nodos creados:     {summary['nodes_created']}")
        print(f"   Apoyos creados:    {summary['supports_created']}")
        print(f"   Calibración activa:{calibration_enabled}")
        print(f"   K scale global:    {global_stiffness_scale}")
        print(f"   M scale global:    {global_mass_scale}")
        print(f"   Masas asignadas:   {summary['masses_assigned']}")
        print(f"   Diafragmas creados:{summary['diaphragms_created']}")
        print(f"   Frames creados:    {summary['frames_created']}")
        print(f"   Secciones resueltas: {summary['sections_resolved']}")
        print(f"   Materiales resueltos:{summary['materials_resolved']}")
        print(f"   Warnings:          {len(summary['warnings'])}")
        print(f"   Errors:            {len(summary['errors'])}")
        print("=" * 70 + "\n")

        return summary

    except Exception as e:
        summary["ok"] = False
        summary["mode"] = "real_model_build_exception"
        summary["errors"].append(str(e))

        print(f"❌ Error construyendo modelo real OpenSeesPy: {e}")
        traceback.print_exc()

        try:
            ops.wipe()
        except Exception:
            pass

        return summary


# ============================================================
# BLOQUE 7E - MASA PARTICIPANTE MODAL APROXIMADA
# ============================================================


def calculate_modal_participation_from_current_model(build_summary, modal_results):
    """
    Calcula participación modal aproximada por dirección X/Y/Z.

    Fórmula usada:
    M_eff = (Σ m_i * phi_i)^2 / (Σ m_i * phi_i^2)

    Donde:
    - m_i es la masa translacional del nodo en la dirección evaluada.
    - phi_i es el valor modal del nodo en esa dirección.
    """

    participation = {
        "attempted": True,
        "ok": False,
        "mode": "modal_participation_7E",
        "directions": ["x", "y", "z"],
        "total_mass": {
            "x": float(build_summary.get("total_mass_x", 0.0) or 0.0),
            "y": float(build_summary.get("total_mass_y", 0.0) or 0.0),
            "z": float(build_summary.get("total_mass_z", 0.0) or 0.0),
        },
        "modes": [],
        "warnings": [],
        "errors": [],
    }

    mass_assignments = build_summary.get("mass_assignments", []) or []

    if not mass_assignments:
        participation["mode"] = "skipped_no_mass_assignments"
        participation["errors"].append("No hay mass_assignments en build_summary.")
        return participation

    if not modal_results:
        participation["mode"] = "skipped_no_modal_results"
        participation["errors"].append(
            "No hay modal_results para calcular participación."
        )
        return participation

    direction_config = {
        "x": {"mass_key": "mx", "dof_index": 0},
        "y": {"mass_key": "my", "dof_index": 1},
        "z": {"mass_key": "mz", "dof_index": 2},
    }

    cumulative_effective_mass = {
        "x": 0.0,
        "y": 0.0,
        "z": 0.0,
    }

    try:
        for modal_item in modal_results:
            mode_number = int(modal_item.get("mode"))
            mode_row = {
                "mode": mode_number,
                "period_s": modal_item.get("period_s"),
                "frequency_hz": modal_item.get("frequency_hz"),
                "directions": {},
                "dominant_direction": None,
                "dominant_participation_percent": 0.0,
            }

            for direction, config in direction_config.items():
                mass_key = config["mass_key"]
                dof_index = config["dof_index"]

                total_direction_mass = float(
                    participation["total_mass"].get(direction, 0.0) or 0.0
                )

                numerator = 0.0
                denominator = 0.0
                used_nodes = 0

                for mass_record in mass_assignments:
                    node_tag = int(mass_record.get("node_tag"))
                    node_mass = float(mass_record.get(mass_key, 0.0) or 0.0)

                    if node_mass <= 0:
                        continue

                    try:
                        eigenvector = ops.nodeEigenvector(node_tag, mode_number)
                    except Exception as ev_error:
                        participation["warnings"].append(
                            f"No se pudo leer eigenvector nodo={node_tag}, modo={mode_number}: {str(ev_error)}"
                        )
                        continue

                    if not isinstance(eigenvector, (list, tuple)):
                        eigenvector = [eigenvector]

                    if len(eigenvector) <= dof_index:
                        participation["warnings"].append(
                            f"Eigenvector incompleto nodo={node_tag}, modo={mode_number}, dirección={direction.upper()}."
                        )
                        continue

                    phi = float(eigenvector[dof_index])

                    numerator += node_mass * phi
                    denominator += node_mass * (phi**2)
                    used_nodes += 1

                if denominator > 1.0e-18 and total_direction_mass > 0:
                    effective_mass = (numerator**2) / denominator
                    mass_ratio = effective_mass / total_direction_mass
                else:
                    effective_mass = 0.0
                    mass_ratio = 0.0

                cumulative_effective_mass[direction] += effective_mass

                cumulative_ratio = (
                    cumulative_effective_mass[direction] / total_direction_mass
                    if total_direction_mass > 0
                    else 0.0
                )

                direction_result = {
                    "used_nodes": used_nodes,
                    "total_mass": total_direction_mass,
                    "effective_modal_mass": effective_mass,
                    "effective_mass_ratio": mass_ratio,
                    "effective_mass_ratio_percent": mass_ratio * 100.0,
                    "cumulative_effective_mass": cumulative_effective_mass[direction],
                    "cumulative_mass_ratio": cumulative_ratio,
                    "cumulative_mass_ratio_percent": cumulative_ratio * 100.0,
                    "participation_numerator": numerator,
                    "participation_denominator": denominator,
                }

                mode_row["directions"][direction] = direction_result

            # Dirección dominante del modo
            dominant_direction = None
            dominant_percent = -1.0

            for direction, direction_result in mode_row["directions"].items():
                current_percent = float(
                    direction_result.get("effective_mass_ratio_percent", 0.0) or 0.0
                )

                if current_percent > dominant_percent:
                    dominant_percent = current_percent
                    dominant_direction = direction

            mode_row["dominant_direction"] = dominant_direction
            mode_row["dominant_participation_percent"] = (
                dominant_percent if dominant_percent >= 0 else 0.0
            )

            participation["modes"].append(mode_row)

        participation["ok"] = len(participation["modes"]) > 0
        participation["mode"] = (
            "modal_participation_ok"
            if participation["ok"]
            else "modal_participation_empty"
        )

        return participation

    except Exception as e:
        participation["mode"] = "modal_participation_exception"
        participation["errors"].append(str(e))
        traceback.print_exc()
        return participation


# ============================================================
# BLOQUE 7C - EIGEN REAL DEL MODELO OPENSEESPY
# ============================================================


def run_real_modal_eigen_from_payload(payload):
    """
    Ejecuta análisis modal real usando el modelo 3D construido desde JHACK.

    Este bloque:
    - Construye el modelo real con build_opensees_model_from_payload()
    - Ejecuta eigen()
    - Calcula periodos y frecuencias reales
    - Devuelve diagnóstico modal

    Todavía NO reemplaza el cálculo espectral V1.
    """

    print("\n" + "=" * 70)
    print("📊 BLOQUE 7C - EIGEN REAL DEL MODELO JHACK / OPENSEESPY")
    print("=" * 70)

    modal_summary = {
        "attempted": True,
        "ok": False,
        "mode": "real_modal_eigen_7C",
        "build_summary": None,
        "requested_modes": None,
        "calculated_modes": 0,
        "modal_results": [],
        "modal_participation": None,
        "warnings": [],
        "errors": [],
    }

    if not OPENSEES_AVAILABLE:
        modal_summary["mode"] = "opensees_not_available"
        modal_summary["errors"].append("OpenSeesPy no está disponible.")
        return modal_summary

    try:
        analysis_data = payload.get("analysis", {}) or {}

        requested_modes = analysis_data.get("numberOfModes", None)

        try:
            requested_modes = int(requested_modes)
        except Exception:
            requested_modes = 3

        if requested_modes <= 0:
            requested_modes = 3

        # Para esta etapa usamos un límite seguro.
        # Más adelante calcularemos modos en función de DOF libres reales.
        requested_modes = min(requested_modes, 12)

        modal_summary["requested_modes"] = requested_modes

        # 1. Construir modelo real
        build_summary = build_opensees_model_from_payload(payload)
        modal_summary["build_summary"] = build_summary

        if not build_summary.get("ok"):
            modal_summary["mode"] = "real_modal_eigen_skipped_build_failed"
            modal_summary["errors"].append(
                "No se pudo ejecutar eigen porque la construcción del modelo falló."
            )
            print("⚠️ Eigen omitido: build_summary.ok = false")
            return modal_summary

        if build_summary.get("masses_assigned", 0) <= 0:
            modal_summary["mode"] = "real_modal_eigen_skipped_no_mass"
            modal_summary["errors"].append(
                "No se pudo ejecutar eigen porque el modelo no tiene masas."
            )
            print("⚠️ Eigen omitido: no hay masas asignadas.")
            return modal_summary

        if build_summary.get("supports_created", 0) <= 0:
            modal_summary["warnings"].append(
                "El modelo no reporta apoyos. Eigen puede ser inestable si hay cuerpo rígido."
            )

        # 2. Ejecutar eigen real
        print(f"⚙️ Ejecutando eigen real con {requested_modes} modo(s) solicitados...")

        import math

        eigenvalues = None

        try:
            eigenvalues = ops.eigen("-fullGenLapack", requested_modes)
            eigen_solver = "fullGenLapack"
        except Exception as eigen_error_1:
            print(f"⚠️ eigen -fullGenLapack falló: {eigen_error_1}")
            modal_summary["warnings"].append(
                f"eigen -fullGenLapack falló: {str(eigen_error_1)}"
            )

            try:
                eigenvalues = ops.eigen(requested_modes)
                eigen_solver = "default"
            except Exception as eigen_error_2:
                modal_summary["mode"] = "real_modal_eigen_failed"
                modal_summary["errors"].append(
                    f"eigen default también falló: {str(eigen_error_2)}"
                )
                print(f"❌ eigen default también falló: {eigen_error_2}")
                return modal_summary

        if not isinstance(eigenvalues, (list, tuple)):
            eigenvalues = [eigenvalues]

        modal_results = []

        for index, lamb in enumerate(eigenvalues, start=1):
            try:
                eigenvalue = float(lamb)
            except Exception:
                continue

            if eigenvalue <= 0:
                omega = 0.0
                frequency_hz = 0.0
                period_s = None
                warning = "Eigenvalue no positivo. Puede indicar modo rígido o modelo inestable."
            else:
                omega = math.sqrt(eigenvalue)
                frequency_hz = omega / (2.0 * math.pi)
                period_s = 1.0 / frequency_hz if frequency_hz > 0 else None
                warning = None

            item = {
                "mode": index,
                "eigenvalue": eigenvalue,
                "angular_frequency_rad_s": omega,
                "frequency_hz": frequency_hz,
                "period_s": period_s,
            }

            if warning:
                item["warning"] = warning
                modal_summary["warnings"].append(f"Modo {index}: {warning}")

            modal_results.append(item)

            if period_s is not None:
                print(
                    f"   Modo {index}: "
                    f"lambda={eigenvalue:.6g}, "
                    f"omega={omega:.6g} rad/s, "
                    f"f={frequency_hz:.6g} Hz, "
                    f"T={period_s:.6g} s"
                )
            else:
                print(f"   Modo {index}: " f"lambda={eigenvalue:.6g}, modo no positivo")

        modal_summary["ok"] = len(modal_results) > 0
        modal_summary["mode"] = (
            "real_modal_eigen_ok" if modal_summary["ok"] else "real_modal_eigen_empty"
        )
        modal_summary["calculated_modes"] = len(modal_results)
        modal_summary["eigen_solver"] = eigen_solver
        modal_summary["modal_results"] = modal_results

        # ============================================================
        # BLOQUE 7E - Calcular masa participante modal aproximada
        # ============================================================
        modal_participation = calculate_modal_participation_from_current_model(
            build_summary,
            modal_results,
        )

        modal_summary["modal_participation"] = modal_participation

        if modal_participation.get("ok") is not True:
            modal_summary["warnings"].append(
                "No se pudo calcular participación modal aproximada."
            )

        print("\n📌 RESUMEN BLOQUE 7C / 7E:")
        print(f"   Solver eigen:       {eigen_solver}")
        print(f"   Modos solicitados:  {requested_modes}")
        print(f"   Modos calculados:   {len(modal_results)}")
        print(f"   Estado:             {modal_summary['mode']}")
        print("=" * 70 + "\n")

        return modal_summary

    except Exception as e:
        modal_summary["mode"] = "real_modal_eigen_exception"
        modal_summary["errors"].append(str(e))

        print(f"❌ Error en eigen real: {e}")
        traceback.print_exc()

        return modal_summary

    finally:
        try:
            ops.wipe()
        except Exception:
            pass


@app.route("/api/analyze/modal-spectral", methods=["GET", "POST"])
def modal_spectral_analysis():
    """
    Endpoint principal inicial para análisis modal espectral.

    Versión V1:
    - Recibe un espectro.
    - Recibe uno o varios casos de análisis.
    - Calcula periodo, frecuencia, Sa(T), desplazamiento, deriva y cortante.
    - Compara contra valores esperados si se envían.

    Nota:
    En esta versión todavía NO se arma el modelo completo con frames 3D.
    Esta etapa sirve para conectar correctamente el frontend con el backend
    y validar el flujo de análisis modal espectral.
    """

    try:
        import math
        import openseespy.opensees as ops

        # ==============================
        # 1. Leer JSON recibido
        # ==============================
        data = request.get_json(silent=True) or {}

        # Si se entra por navegador con GET, usamos una data demo.
        if request.method == "GET" and not data:
            data = {
                "model": {
                    "name": "Demo Modal Spectral V1",
                    "description": "Modelo simplificado para validación inicial",
                },
                "nodes": [],
                "frames": [],
                "supports": [],
                "masses": [],
                "sections": [],
                "materials": [],
                "responseSpectrum": {
                    "name": "ESPECTRO XX / YY - ETABS Excel",
                    "units": "Sa en g",
                    "points": [
                        {"T": 0.00, "Sa": 0.196875},
                        {"T": 0.10, "Sa": 0.196875},
                        {"T": 0.20, "Sa": 0.196875},
                        {"T": 0.50, "Sa": 0.196875},
                        {"T": 1.00, "Sa": 0.196875},
                        {"T": 1.20, "Sa": 0.164063},
                        {"T": 1.50, "Sa": 0.131250},
                        {"T": 2.00, "Sa": 0.078750},
                        {"T": 3.00, "Sa": 0.035000},
                        {"T": 5.00, "Sa": 0.012600},
                        {"T": 15.00, "Sa": 0.001400},
                    ],
                },
                "analysis": {
                    "numberOfModes": 3,
                    "modalCombination": "CQC",
                    "cases": [
                        {
                            "name": "SDX",
                            "direction": "X",
                            "targetPeriodS": 0.219,
                            "effectiveMassKg": 7180.0,
                            "heightM": 3.61,
                            "scaleFactor": 9.81,
                            "expected": {
                                "baseShearTonf": 1.414,
                                "maxDisplacementM": 0.002349,
                                "drift": 0.000651,
                            },
                        },
                        {
                            "name": "SDY",
                            "direction": "Y",
                            "targetPeriodS": 0.214,
                            "effectiveMassKg": 7180.0,
                            "heightM": 3.61,
                            "scaleFactor": 9.81,
                            "expected": {
                                "baseShearTonf": 1.414,
                                "maxDisplacementM": 0.002242,
                                "drift": 0.000621,
                            },
                        },
                        {
                            "name": "DER XX",
                            "direction": "X",
                            "targetPeriodS": 0.219,
                            "effectiveMassKg": 7180.0,
                            "heightM": 3.61,
                            "scaleFactor": 44.145,
                            "expected": {
                                "baseShearTonf": 6.3636,
                                "maxDisplacementM": 0.010570,
                                "drift": 0.002928,
                            },
                        },
                        {
                            "name": "DER YY",
                            "direction": "Y",
                            "targetPeriodS": 0.214,
                            "effectiveMassKg": 7180.0,
                            "heightM": 3.61,
                            "scaleFactor": 44.145,
                            "expected": {
                                "baseShearTonf": 6.3636,
                                "maxDisplacementM": 0.010088,
                                "drift": 0.002794,
                            },
                        },
                    ],
                },
            }

        # ==============================
        # 2. Extraer partes principales
        # ==============================
        model_data = data.get("model", {})
        nodes = data.get("nodes", [])
        frames = data.get("frames", [])
        supports = data.get("supports", [])
        masses = data.get("masses", [])
        sections = data.get("sections", [])
        materials = data.get("materials", [])

        response_spectrum = data.get("responseSpectrum", {})
        analysis = data.get("analysis", {})

        # ============================================================
        # BLOQUE 7C - Construir modelo real y ejecutar eigen real
        # ============================================================
        real_model_build = {
            "attempted": False,
            "ok": False,
            "mode": "not_attempted",
            "reason": "No se intentó construir modelo real.",
        }

        real_modal_eigen = {
            "attempted": False,
            "ok": False,
            "mode": "not_attempted",
            "reason": "No se intentó ejecutar eigen real.",
        }

        if len(nodes) > 0 and len(frames) > 0:
            real_modal_eigen = run_real_modal_eigen_from_payload(data)
            real_model_build = real_modal_eigen.get("build_summary") or real_model_build
        else:
            real_model_build = {
                "attempted": False,
                "ok": False,
                "mode": "skipped_missing_real_model",
                "reason": "No hay nodes/frames suficientes para construir modelo real.",
                "nodes_count": len(nodes),
                "frames_count": len(frames),
            }

            real_modal_eigen = {
                "attempted": False,
                "ok": False,
                "mode": "skipped_missing_real_model",
                "reason": "No hay nodes/frames suficientes para ejecutar eigen real.",
                "nodes_count": len(nodes),
                "frames_count": len(frames),
            }

        spectrum_points = response_spectrum.get("points", [])

        if not spectrum_points:
            return (
                jsonify(
                    {
                        "success": False,
                        "type": "modal-spectral-analysis",
                        "error": "No se recibió responseSpectrum.points",
                    }
                ),
                400,
            )

        cases = analysis.get("cases", [])

        if not cases:
            return (
                jsonify(
                    {
                        "success": False,
                        "type": "modal-spectral-analysis",
                        "error": "No se recibió analysis.cases",
                    }
                ),
                400,
            )

        # ==============================
        # 3. Funciones auxiliares
        # ==============================
        def read_value(source, names, default=None):
            """
            Permite leer nombres tipo:
            targetPeriodS, target_period_s, targetPeriod, etc.
            """
            for name in names:
                if name in source:
                    return source.get(name)
            return default

        def to_float(value, default=None):
            if value is None or value == "":
                return default
            return float(value)

        def interpolate_spectrum(period, spectrum):
            points = sorted(spectrum, key=lambda p: float(p["T"]))

            if period <= float(points[0]["T"]):
                return float(points[0]["Sa"])

            if period >= float(points[-1]["T"]):
                return float(points[-1]["Sa"])

            for i in range(len(points) - 1):
                t1 = float(points[i]["T"])
                t2 = float(points[i + 1]["T"])
                sa1 = float(points[i]["Sa"])
                sa2 = float(points[i + 1]["Sa"])

                if t1 <= period <= t2:
                    if abs(t2 - t1) < 1e-12:
                        return sa1

                    ratio = (period - t1) / (t2 - t1)
                    return sa1 + ratio * (sa2 - sa1)

            return float(points[-1]["Sa"])

        def percent_error(calculated, expected):
            if calculated is None or expected is None:
                return None

            if abs(expected) < 1e-12:
                return None

            return abs(calculated - expected) / abs(expected) * 100.0

        # ============================================================
        # BLOQUE 7D - Selección de periodo modal real para cada caso
        # ============================================================

        def to_bool(value, default=True):
            if value is None:
                return default

            if isinstance(value, bool):
                return value

            if isinstance(value, (int, float)):
                return value != 0

            text = str(value).strip().lower()

            if text in ["true", "1", "yes", "si", "sí", "y", "on"]:
                return True

            if text in ["false", "0", "no", "n", "off"]:
                return False

            return default

        def normalize_text(value):
            if value is None:
                return ""

            text = str(value).strip().upper()
            text = text.replace("-", "_")
            text = text.replace(" ", "_")

            return text

        use_real_modal_periods = to_bool(
            read_value(
                analysis,
                [
                    "useRealModalPeriods",
                    "use_real_modal_periods",
                    "useEigenPeriods",
                    "use_eigen_periods",
                ],
                True,
            ),
            True,
        )

        def get_positive_real_modes():
            """
            Devuelve solo modos reales positivos calculados por OpenSeesPy.
            """
            if not isinstance(real_modal_eigen, dict):
                return []

            if real_modal_eigen.get("ok") is not True:
                return []

            modal_items = real_modal_eigen.get("modal_results", []) or []
            positive_modes = []

            for item in modal_items:
                if not isinstance(item, dict):
                    continue

                period = item.get("period_s")
                eigenvalue = item.get("eigenvalue")

                try:
                    period = float(period)
                    eigenvalue = float(eigenvalue)
                except Exception:
                    continue

                if period > 0 and eigenvalue > 0:
                    positive_modes.append(item)

            return positive_modes

        def select_real_modal_period_for_case(case_data, direction, target_period_s):
            """
            Selecciona el periodo que usará el caso espectral.

            Regla temporal 7D:
            - X usa preferentemente modo 1.
            - Y usa preferentemente modo 2.
            - Z usa preferentemente modo 3.
            - Si el caso indica mode/modeNumber/modalMode, se respeta.
            - Si no hay modo disponible, usa el periodo más cercano al targetPeriodS.
            - Si no hay eigen real, vuelve a targetPeriodS.
            """

            case_name = read_value(case_data, ["name", "caseName", "case_name"], "CASE")
            normalized_case_name = normalize_text(case_name)
            normalized_direction = normalize_text(direction)

            fallback_period = target_period_s

            selection = {
                "use_real_modal_periods": use_real_modal_periods,
                "case_name": case_name,
                "direction": direction,
                "source": "targetPeriodS",
                "selected_mode": None,
                "period_s": fallback_period,
                "target_period_s": target_period_s,
                "reason": "Usando targetPeriodS como periodo de respaldo.",
            }

            if not use_real_modal_periods:
                selection["source"] = "targetPeriodS"
                selection["reason"] = "useRealModalPeriods está desactivado."
                return selection

            positive_modes = get_positive_real_modes()

            if not positive_modes:
                selection["source"] = "targetPeriodS"
                selection["reason"] = "No hay modos reales positivos disponibles."
                return selection

            explicit_mode = read_value(
                case_data,
                [
                    "mode",
                    "modeNumber",
                    "mode_number",
                    "modalMode",
                    "modal_mode",
                    "eigenMode",
                    "eigen_mode",
                ],
                None,
            )

            try:
                explicit_mode = int(explicit_mode)
            except Exception:
                explicit_mode = None

            preferred_mode = None

            if explicit_mode is not None and explicit_mode > 0:
                preferred_mode = explicit_mode
            else:
                # Mapeo temporal tipo ETABS para el modelo simple actual.
                if (
                    normalized_direction.startswith("X")
                    or "_XX" in normalized_case_name
                    or normalized_case_name.endswith("X")
                ):
                    preferred_mode = 1
                elif (
                    normalized_direction.startswith("Y")
                    or "_YY" in normalized_case_name
                    or normalized_case_name.endswith("Y")
                ):
                    preferred_mode = 2
                elif normalized_direction.startswith("Z"):
                    preferred_mode = 3
                else:
                    preferred_mode = 1

            # Buscar modo preferido
            for item in positive_modes:
                try:
                    item_mode = int(item.get("mode"))
                except Exception:
                    continue

                if item_mode == preferred_mode:
                    selection["source"] = "real_modal_eigen"
                    selection["selected_mode"] = item_mode
                    selection["period_s"] = float(item.get("period_s"))
                    selection["reason"] = f"Periodo tomado del modo real {item_mode}."
                    return selection

            # Si no existe el modo preferido, usar el más cercano al targetPeriodS
            if target_period_s is not None and target_period_s > 0:
                closest = min(
                    positive_modes,
                    key=lambda item: abs(float(item.get("period_s")) - target_period_s),
                )

                selection["source"] = "real_modal_eigen_closest_to_target"
                selection["selected_mode"] = int(closest.get("mode"))
                selection["period_s"] = float(closest.get("period_s"))
                selection["reason"] = (
                    f"No se encontró modo preferido {preferred_mode}. "
                    f"Se tomó el modo más cercano al targetPeriodS."
                )
                return selection

            # Si no hay target, usar el primer modo positivo
            first_mode = positive_modes[0]

            selection["source"] = "real_modal_eigen_first_positive"
            selection["selected_mode"] = int(first_mode.get("mode"))
            selection["period_s"] = float(first_mode.get("period_s"))
            selection["reason"] = (
                "No hubo targetPeriodS. Se tomó el primer modo positivo."
            )

            return selection

        # ============================================================
        # BLOQUE 7F - Selección de masa participante modal por caso
        # ============================================================

        use_modal_participating_mass = to_bool(
            read_value(
                analysis,
                [
                    "useModalParticipatingMass",
                    "use_modal_participating_mass",
                    "useParticipatingMass",
                    "use_participating_mass",
                ],
                True,
            ),
            True,
        )

        def normalize_direction_key(direction):
            text = normalize_text(direction)

            if text.startswith("X") or "XX" in text:
                return "x"

            if text.startswith("Y") or "YY" in text:
                return "y"

            if text.startswith("Z") or "ZZ" in text:
                return "z"

            return "x"

        def select_effective_mass_for_case(
            case_data, direction, period_selection, fallback_mass_kg
        ):
            """
            Selecciona la masa que usará el caso espectral.

            Prioridad:
            1. Masa efectiva modal participante del modo real seleccionado.
            2. effectiveMassKg del caso, como respaldo.

            Esto acerca el cálculo al flujo de ETABS:
            modo + dirección + masa participante.
            """

            case_name = read_value(case_data, ["name", "caseName", "case_name"], "CASE")
            direction_key = normalize_direction_key(direction)

            mass_selection = {
                "use_modal_participating_mass": use_modal_participating_mass,
                "case_name": case_name,
                "direction": direction,
                "direction_key": direction_key,
                "source": "case.effectiveMassKg",
                "selected_mode": (
                    period_selection.get("selected_mode")
                    if isinstance(period_selection, dict)
                    else None
                ),
                "mass_for_calculation_kg": fallback_mass_kg,
                "fallback_mass_kg": fallback_mass_kg,
                "effective_modal_mass_kg": None,
                "effective_mass_ratio_percent": None,
                "cumulative_mass_ratio_percent": None,
                "reason": "Usando effectiveMassKg del caso como masa de respaldo.",
            }

            if not use_modal_participating_mass:
                mass_selection["reason"] = "useModalParticipatingMass está desactivado."
                return mass_selection

            if (
                not isinstance(real_modal_eigen, dict)
                or real_modal_eigen.get("ok") is not True
            ):
                mass_selection["reason"] = (
                    "No hay eigen real válido. Se usa masa del caso."
                )
                return mass_selection

            modal_participation = real_modal_eigen.get("modal_participation") or {}

            if modal_participation.get("ok") is not True:
                mass_selection["reason"] = (
                    "No hay participación modal válida. Se usa masa del caso."
                )
                return mass_selection

            selected_mode = mass_selection.get("selected_mode")

            if selected_mode is None:
                mass_selection["reason"] = (
                    "No hay modo real seleccionado. Se usa masa del caso."
                )
                return mass_selection

            try:
                selected_mode = int(selected_mode)
            except Exception:
                mass_selection["reason"] = (
                    "El modo seleccionado no es válido. Se usa masa del caso."
                )
                return mass_selection

            modes = modal_participation.get("modes", []) or []

            selected_mode_row = None

            for mode_row in modes:
                if not isinstance(mode_row, dict):
                    continue

                try:
                    mode_number = int(mode_row.get("mode"))
                except Exception:
                    continue

                if mode_number == selected_mode:
                    selected_mode_row = mode_row
                    break

            if selected_mode_row is None:
                mass_selection["reason"] = (
                    f"No se encontró participación para el modo {selected_mode}. Se usa masa del caso."
                )
                return mass_selection

            direction_data = (selected_mode_row.get("directions") or {}).get(
                direction_key
            )

            if not isinstance(direction_data, dict):
                mass_selection["reason"] = (
                    f"No se encontró participación en dirección {direction_key.upper()}. Se usa masa del caso."
                )
                return mass_selection

            effective_modal_mass = to_float(
                direction_data.get("effective_modal_mass"),
                None,
            )

            if effective_modal_mass is None or effective_modal_mass <= 0:
                mass_selection["reason"] = (
                    f"La masa efectiva modal del modo {selected_mode} en dirección "
                    f"{direction_key.upper()} no es positiva. Se usa masa del caso."
                )
                return mass_selection

            mass_selection["source"] = "modal_participation.effective_modal_mass"
            mass_selection["mass_for_calculation_kg"] = effective_modal_mass
            mass_selection["effective_modal_mass_kg"] = effective_modal_mass
            mass_selection["effective_mass_ratio_percent"] = direction_data.get(
                "effective_mass_ratio_percent"
            )
            mass_selection["cumulative_mass_ratio_percent"] = direction_data.get(
                "cumulative_mass_ratio_percent"
            )
            mass_selection["reason"] = (
                f"Masa tomada de participación modal: modo {selected_mode}, "
                f"dirección {direction_key.upper()}."
            )

            return mass_selection

        # ============================================================
        # BLOQUE 7G - Combinación modal SRSS / CQC inicial
        # ============================================================

        modal_response_combination_method = (
            str(
                read_value(
                    analysis,
                    [
                        "modalResponseCombination",
                        "modal_response_combination",
                        "modalCombination",
                        "modal_combination",
                    ],
                    "CQC",
                )
            )
            .strip()
            .upper()
        )

        if modal_response_combination_method not in ["SRSS", "CQC", "ABS"]:
            modal_response_combination_method = "CQC"

        modal_damping_ratio = to_float(
            read_value(
                analysis,
                [
                    "dampingRatio",
                    "damping_ratio",
                    "modalDampingRatio",
                    "modal_damping_ratio",
                ],
                0.05,
            ),
            0.05,
        )

        if modal_damping_ratio is None or modal_damping_ratio <= 0:
            modal_damping_ratio = 0.05

        def get_modal_participation_direction_data(mode_number, direction_key):
            """
            Obtiene la masa efectiva modal de un modo y dirección.
            """
            if not isinstance(real_modal_eigen, dict):
                return None

            modal_participation = real_modal_eigen.get("modal_participation") or {}

            if modal_participation.get("ok") is not True:
                return None

            modes = modal_participation.get("modes", []) or []

            for mode_row in modes:
                if not isinstance(mode_row, dict):
                    continue

                try:
                    row_mode = int(mode_row.get("mode"))
                except Exception:
                    continue

                if row_mode != int(mode_number):
                    continue

                directions = mode_row.get("directions") or {}
                direction_data = directions.get(direction_key)

                if isinstance(direction_data, dict):
                    return direction_data

            return None

        def cqc_correlation_coefficient(omega_i, omega_j, damping_ratio):
            """
            Coeficiente CQC aproximado para combinación modal.

            Nota:
            Para i == j, rho = 1.
            Para modos separados, rho tiende a valores pequeños.
            """
            import math

            omega_i = abs(float(omega_i or 0.0))
            omega_j = abs(float(omega_j or 0.0))
            xi = float(damping_ratio or 0.05)

            if omega_i <= 0 or omega_j <= 0:
                return 0.0

            if abs(omega_i - omega_j) <= 1.0e-12:
                return 1.0

            beta = omega_j / omega_i

            numerator = 8.0 * (xi**2) * (1.0 + beta) * (beta**1.5)
            denominator = ((1.0 - beta**2) ** 2) + (
                4.0 * (xi**2) * beta * ((1.0 + beta) ** 2)
            )

            if abs(denominator) <= 1.0e-18:
                return 0.0

            rho = numerator / denominator

            if rho < 0:
                rho = 0.0

            if rho > 1:
                rho = 1.0

            return rho

        def combine_modal_values(values, angular_frequencies, method, damping_ratio):
            """
            Combina respuestas modales.

            values: lista de respuestas por modo.
            angular_frequencies: omegas por modo.
            method: SRSS, CQC o ABS.
            """
            import math

            clean_values = []

            for value in values:
                try:
                    clean_values.append(float(value))
                except Exception:
                    clean_values.append(0.0)

            if not clean_values:
                return 0.0

            method = str(method or "CQC").strip().upper()

            if method == "ABS":
                return sum(abs(v) for v in clean_values)

            if method == "SRSS":
                return math.sqrt(sum((v**2) for v in clean_values))

            # CQC
            total = 0.0

            for i in range(len(clean_values)):
                for j in range(len(clean_values)):
                    rho = cqc_correlation_coefficient(
                        angular_frequencies[i],
                        angular_frequencies[j],
                        damping_ratio,
                    )

                    total += rho * clean_values[i] * clean_values[j]

            if total < 0 and abs(total) < 1.0e-12:
                total = 0.0

            return math.sqrt(abs(total))

        def build_modal_combination_response_for_case(
            case_data,
            direction,
            height_m,
            scale_factor,
            fallback_mass_kg,
        ):
            """
            Calcula respuestas espectrales por modo y las combina.

            Devuelve:
            - respuestas por modo
            - resultado combinado por SRSS/CQC/ABS
            """

            direction_key = normalize_direction_key(direction)

            combination_result = {
                "attempted": True,
                "ok": False,
                "method": modal_response_combination_method,
                "damping_ratio": modal_damping_ratio,
                "direction": direction,
                "direction_key": direction_key,
                "modal_responses": [],
                "combined": None,
                "warnings": [],
                "errors": [],
            }

            if (
                not isinstance(real_modal_eigen, dict)
                or real_modal_eigen.get("ok") is not True
            ):
                combination_result["errors"].append(
                    "No hay eigen real válido para combinación modal."
                )
                return combination_result

            modal_items = real_modal_eigen.get("modal_results", []) or []

            if not modal_items:
                combination_result["errors"].append("No hay modal_results disponibles.")
                return combination_result

            force_values_n = []
            displacement_values_m = []
            drift_values = []
            angular_frequencies = []

            for modal_item in modal_items:
                if not isinstance(modal_item, dict):
                    continue

                try:
                    mode_number = int(modal_item.get("mode"))
                    period_s = float(modal_item.get("period_s"))
                    eigenvalue = float(modal_item.get("eigenvalue"))
                    omega = float(modal_item.get("angular_frequency_rad_s"))
                    frequency_hz = float(modal_item.get("frequency_hz"))
                except Exception:
                    continue

                if period_s <= 0 or eigenvalue <= 0 or omega <= 0:
                    continue

                direction_data = get_modal_participation_direction_data(
                    mode_number,
                    direction_key,
                )

                mass_source = "case.effectiveMassKg"
                effective_modal_mass = fallback_mass_kg
                effective_mass_ratio_percent = None
                cumulative_mass_ratio_percent = None

                if isinstance(direction_data, dict):
                    candidate_mass = to_float(
                        direction_data.get("effective_modal_mass"),
                        None,
                    )

                    if candidate_mass is not None and candidate_mass > 0:
                        effective_modal_mass = candidate_mass
                        mass_source = "modal_participation.effective_modal_mass"
                        effective_mass_ratio_percent = direction_data.get(
                            "effective_mass_ratio_percent"
                        )
                        cumulative_mass_ratio_percent = direction_data.get(
                            "cumulative_mass_ratio_percent"
                        )

                sa_g = interpolate_spectrum(period_s, spectrum_points)
                spectral_acceleration_m_s2 = sa_g * scale_factor

                spectral_displacement_m = spectral_acceleration_m_s2 / eigenvalue
                equivalent_force_n = effective_modal_mass * spectral_acceleration_m_s2
                equivalent_force_tonf = equivalent_force_n / 9806.65
                drift = (
                    spectral_displacement_m / height_m
                    if height_m and height_m > 0
                    else None
                )

                modal_response = {
                    "mode": mode_number,
                    "period_s": period_s,
                    "frequency_hz": frequency_hz,
                    "angular_frequency_rad_s": omega,
                    "eigenvalue": eigenvalue,
                    "Sa_g": sa_g,
                    "spectral_acceleration_m_s2": spectral_acceleration_m_s2,
                    "mass_for_calculation_kg": effective_modal_mass,
                    "mass_source": mass_source,
                    "effective_mass_ratio_percent": effective_mass_ratio_percent,
                    "cumulative_mass_ratio_percent": cumulative_mass_ratio_percent,
                    "spectral_displacement_m": spectral_displacement_m,
                    "equivalent_force_n": equivalent_force_n,
                    "equivalent_force_tonf": equivalent_force_tonf,
                    "estimated_drift": drift,
                }

                combination_result["modal_responses"].append(modal_response)

                force_values_n.append(equivalent_force_n)
                displacement_values_m.append(spectral_displacement_m)
                drift_values.append(drift if drift is not None else 0.0)
                angular_frequencies.append(omega)

            if not combination_result["modal_responses"]:
                combination_result["errors"].append(
                    "No se generaron respuestas modales válidas."
                )
                return combination_result

            combined_force_n = combine_modal_values(
                force_values_n,
                angular_frequencies,
                modal_response_combination_method,
                modal_damping_ratio,
            )

            combined_displacement_m = combine_modal_values(
                displacement_values_m,
                angular_frequencies,
                modal_response_combination_method,
                modal_damping_ratio,
            )

            combined_drift = combine_modal_values(
                drift_values,
                angular_frequencies,
                modal_response_combination_method,
                modal_damping_ratio,
            )

            combination_result["combined"] = {
                "equivalent_force_n": combined_force_n,
                "equivalent_force_tonf": combined_force_n / 9806.65,
                "spectral_displacement_m": combined_displacement_m,
                "estimated_drift": combined_drift,
                "modes_combined": len(combination_result["modal_responses"]),
            }

            combination_result["ok"] = True

            return combination_result

        # ============================================================
        # BLOQUE 7H - Selección del resultado final del caso
        # ============================================================

        use_combined_modal_results = to_bool(
            read_value(
                analysis,
                [
                    "useCombinedModalResults",
                    "use_combined_modal_results",
                    "useModalCombinationAsFinal",
                    "use_modal_combination_as_final",
                ],
                True,
            ),
            True,
        )

        def build_final_spectral_results(
            single_mode_results,
            modal_combination_results,
        ):
            """
            Decide qué resultado será considerado como resultado final del caso.

            Prioridad:
            1. Si useCombinedModalResults = True y la combinación modal está OK,
               usar resultado combinado.
            2. Si no, usar resultado de 1 modo seleccionado.
            """

            final_result = {
                "source": "single_mode",
                "use_combined_modal_results": use_combined_modal_results,
                "modal_combination_available": False,
                "modal_combination_method": None,
                "reason": "Usando resultado de 1 modo seleccionado.",
                "Sa_g": single_mode_results.get("Sa_g"),
                "spectral_acceleration_m_s2": single_mode_results.get(
                    "spectral_acceleration_m_s2"
                ),
                "spectral_displacement_m": single_mode_results.get(
                    "spectral_displacement_m"
                ),
                "equivalent_force_n": single_mode_results.get("equivalent_force_n"),
                "equivalent_force_tonf": single_mode_results.get(
                    "equivalent_force_tonf"
                ),
                "estimated_drift": single_mode_results.get("estimated_drift"),
                "single_mode": single_mode_results,
                "combined": None,
            }

            if isinstance(modal_combination_results, dict):
                final_result["modal_combination_available"] = (
                    modal_combination_results.get("ok") is True
                )
                final_result["modal_combination_method"] = (
                    modal_combination_results.get("method")
                )

            if (
                use_combined_modal_results
                and isinstance(modal_combination_results, dict)
                and modal_combination_results.get("ok") is True
                and isinstance(modal_combination_results.get("combined"), dict)
            ):
                combined = modal_combination_results.get("combined")

                final_result["source"] = "modal_combination"
                final_result["reason"] = (
                    f"Usando resultado combinado modal "
                    f"{modal_combination_results.get('method', 'CQC')}."
                )

                final_result["spectral_displacement_m"] = combined.get(
                    "spectral_displacement_m"
                )
                final_result["equivalent_force_n"] = combined.get("equivalent_force_n")
                final_result["equivalent_force_tonf"] = combined.get(
                    "equivalent_force_tonf"
                )
                final_result["estimated_drift"] = combined.get("estimated_drift")
                final_result["combined"] = combined

                # Sa_g y spectral_acceleration_m_s2 no son únicos en combinación modal,
                # porque cada modo puede tener su propio periodo y Sa(T).
                final_result["Sa_g"] = None
                final_result["spectral_acceleration_m_s2"] = None

            return final_result

        # ============================================================
        # BLOQUE 7O - Story Response / Story Drift tipo ETABS
        # ============================================================

        def build_story_response_for_case(case_name, direction, final_spectral_results):
            """
            Calcula una respuesta aproximada por piso/story.

            Nota técnica:
            - En esta etapa 7O-A se calcula una distribución aproximada.
            - Usa los niveles detectados en real_model_build.story_levels.
            - Usa el desplazamiento final del caso como desplazamiento máximo superior.
            - Distribuye desplazamientos de forma lineal por altura.
            - Calcula deriva = delta entre niveles / altura de entrepiso.
            - Calcula cortante de piso según masa acumulada superior.
            """

            story_response = {
                "attempted": True,
                "ok": False,
                "mode": "story_response_7O",
                "case_name": case_name,
                "direction": direction,
                "vertical_axis": None,
                "total_height_m": None,
                "max_displacement_m": None,
                "base_shear_tonf": None,
                "stories": [],
                "warnings": [],
                "errors": [],
            }

            if (
                not isinstance(real_model_build, dict)
                or real_model_build.get("ok") is not True
            ):
                story_response["mode"] = "skipped_no_real_model_build"
                story_response["errors"].append(
                    "No hay real_model_build válido para calcular Story Response."
                )
                return story_response

            story_levels = real_model_build.get("story_levels", []) or []

            if not story_levels or len(story_levels) < 2:
                story_response["mode"] = "skipped_not_enough_story_levels"
                story_response["errors"].append(
                    "Se necesitan al menos 2 niveles/story para calcular deriva."
                )
                return story_response

            if not isinstance(final_spectral_results, dict):
                story_response["mode"] = "skipped_no_final_spectral_results"
                story_response["errors"].append("No hay final_spectral_results válido.")
                return story_response

            max_displacement_m = to_float(
                final_spectral_results.get("spectral_displacement_m"),
                None,
            )

            base_shear_tonf = to_float(
                final_spectral_results.get("equivalent_force_tonf"),
                None,
            )

            base_shear_n = to_float(
                final_spectral_results.get("equivalent_force_n"),
                None,
            )

            if max_displacement_m is None:
                story_response["mode"] = "skipped_no_displacement"
                story_response["errors"].append(
                    "No existe spectral_displacement_m para calcular Story Drift."
                )
                return story_response

            vertical_axis = real_model_build.get("inferred_vertical_axis", "z")
            story_response["vertical_axis"] = vertical_axis
            story_response["max_displacement_m"] = max_displacement_m
            story_response["base_shear_tonf"] = base_shear_tonf

            sorted_levels = sorted(
                story_levels,
                key=lambda item: float(item.get("level", 0.0) or 0.0),
            )

            base_level = float(sorted_levels[0].get("level", 0.0) or 0.0)
            top_level = float(sorted_levels[-1].get("level", 0.0) or 0.0)
            total_height_m = abs(top_level - base_level)

            if total_height_m <= 1.0e-12:
                story_response["mode"] = "skipped_zero_total_height"
                story_response["errors"].append(
                    "La altura total del modelo es cero o casi cero."
                )
                return story_response

            story_response["total_height_m"] = total_height_m

            # Masa por nivel desde el bloque 7N
            story_mass_distribution = (
                real_model_build.get("story_mass_distribution", []) or {}
            )
            mass_by_level = {}

            for item in story_mass_distribution:
                try:
                    level = float(item.get("story_level", 0.0) or 0.0)
                    mass = float(item.get("story_mass_kg", 0.0) or 0.0)
                    mass_by_level[level] = mass_by_level.get(level, 0.0) + mass
                except Exception:
                    continue

            upper_mass_total = sum(
                value for value in mass_by_level.values() if value > 0
            )

            previous_level = base_level
            previous_displacement = 0.0
            story_index = 0

            for level_item in sorted_levels[1:]:
                story_index += 1

                current_level = float(level_item.get("level", 0.0) or 0.0)
                elevation_m = abs(current_level - base_level)
                story_height_m = abs(current_level - previous_level)

                if story_height_m <= 1.0e-12:
                    story_response["warnings"].append(
                        f"Story omitido en nivel {current_level}: altura de entrepiso inválida."
                    )
                    continue

                height_ratio = elevation_m / total_height_m
                current_displacement = max_displacement_m * height_ratio

                story_displacement_delta = current_displacement - previous_displacement
                story_drift = story_displacement_delta / story_height_m

                story_mass_kg = mass_by_level.get(current_level, 0.0)

                # Cortante por piso aproximado:
                # Se usa la masa acumulada desde el nivel actual hacia arriba.
                mass_above = 0.0

                for level, mass in mass_by_level.items():
                    if level >= current_level - 1.0e-9:
                        mass_above += mass

                if upper_mass_total > 0 and base_shear_tonf is not None:
                    story_shear_tonf = base_shear_tonf * (mass_above / upper_mass_total)
                else:
                    story_shear_tonf = base_shear_tonf

                if upper_mass_total > 0 and base_shear_n is not None:
                    story_shear_n = base_shear_n * (mass_above / upper_mass_total)
                else:
                    story_shear_n = base_shear_n

                story_row = {
                    "story": f"Story {story_index}",
                    "story_index": story_index,
                    "case_name": case_name,
                    "direction": direction,
                    "level": current_level,
                    "elevation_m": elevation_m,
                    "story_height_m": story_height_m,
                    "nodes_count": level_item.get("nodes_count"),
                    "nodes": level_item.get("nodes", []),
                    "story_mass_kg": story_mass_kg,
                    "mass_above_kg": mass_above,
                    "displacement_m": current_displacement,
                    "previous_displacement_m": previous_displacement,
                    "story_displacement_delta_m": story_displacement_delta,
                    "story_drift": story_drift,
                    "story_drift_percent": story_drift * 100.0,
                    "story_shear_tonf": story_shear_tonf,
                    "story_shear_n": story_shear_n,
                    "source": "7O.linear_height_distribution_from_final_spectral_results",
                }

                story_response["stories"].append(story_row)

                previous_level = current_level
                previous_displacement = current_displacement

            story_response["ok"] = len(story_response["stories"]) > 0
            story_response["mode"] = (
                "story_response_ok" if story_response["ok"] else "story_response_empty"
            )

            return story_response

        # ============================================================
        # BLOQUE 7P-C - Diagnóstico de calibración JHACK vs ETABS
        # ============================================================

        def build_etabs_calibration_diagnostics(
            case_name,
            direction,
            target_period_s,
            modal_results,
            final_spectral_results,
            comparison,
        ):
            """
            Diagnóstico de calibración contra ETABS.

            No modifica resultados.
            Solo calcula factores aproximados para saber si el modelo está:
            - demasiado rígido,
            - demasiado flexible,
            - con masa no equivalente,
            - con cortante/desplazamiento/deriva alejados de ETABS.
            """

            diagnostics = {
                "attempted": True,
                "ok": False,
                "case_name": case_name,
                "direction": direction,
                "status": "REVIEW",
                "max_error_percent": None,
                "period": {},
                "base_shear": {},
                "displacement": {},
                "drift": {},
                "recommended_adjustments": [],
                "note": (
                    "Estos factores son diagnósticos. No se aplican automáticamente al análisis."
                ),
            }

            if not isinstance(comparison, dict):
                diagnostics["status"] = "REVIEW"
                diagnostics["recommended_adjustments"].append(
                    "No hay comparison disponible para diagnosticar."
                )
                return diagnostics

            expected = comparison.get("expected", {}) or {}
            errors = comparison.get("error_percent", {}) or {}

            current_period_s = to_float(
                (modal_results or {}).get("period_s"),
                None,
            )

            if current_period_s is None:
                current_period_s = to_float(
                    (modal_results or {}).get("period_for_calculation_s"),
                    None,
                )

            target_period_s = to_float(target_period_s, None)

            expected_base_shear = to_float(expected.get("base_shear_tonf"), None)
            expected_displacement = to_float(expected.get("max_displacement_m"), None)
            expected_drift = to_float(expected.get("drift"), None)

            jhack_base_shear = to_float(
                (final_spectral_results or {}).get("equivalent_force_tonf"),
                None,
            )

            jhack_displacement = to_float(
                (final_spectral_results or {}).get("spectral_displacement_m"),
                None,
            )

            jhack_drift = to_float(
                (final_spectral_results or {}).get("estimated_drift"),
                None,
            )

            def safe_factor(expected_value, current_value):
                if expected_value is None or current_value is None:
                    return None

                if abs(current_value) <= 1.0e-18:
                    return None

                return expected_value / current_value

            def classify_status(max_error):
                if max_error is None:
                    return "REVIEW"

                if max_error <= 5:
                    return "OK"

                if max_error <= 15:
                    return "REVIEW"

                return "CRITICAL"

            numeric_errors = []

            for key in ["period", "base_shear", "max_displacement", "drift"]:
                value = to_float(errors.get(key), None)

                if value is not None:
                    numeric_errors.append(value)

            max_error = max(numeric_errors) if numeric_errors else None

            diagnostics["max_error_percent"] = max_error
            diagnostics["status"] = classify_status(max_error)

            # ----------------------------
            # Diagnóstico de periodo
            # ----------------------------
            diagnostics["period"] = {
                "target_period_s": target_period_s,
                "jhack_period_s": current_period_s,
                "error_percent": errors.get("period"),
                "period_ratio_jhack_to_etabs": None,
                "period_ratio_etabs_to_jhack": None,
                "stiffness_multiplier_to_match_etabs_period": None,
                "mass_multiplier_to_match_etabs_period": None,
            }

            if (
                target_period_s is not None
                and target_period_s > 0
                and current_period_s is not None
                and current_period_s > 0
            ):
                ratio_jhack_to_etabs = current_period_s / target_period_s
                ratio_etabs_to_jhack = target_period_s / current_period_s

                # Como T = 2π sqrt(m/k):
                # Si la masa se mantiene, k_nuevo = k_actual * (T_actual / T_objetivo)^2
                stiffness_multiplier = ratio_jhack_to_etabs**2

                # Si la rigidez se mantiene, m_nueva = m_actual * (T_objetivo / T_actual)^2
                mass_multiplier = ratio_etabs_to_jhack**2

                diagnostics["period"][
                    "period_ratio_jhack_to_etabs"
                ] = ratio_jhack_to_etabs
                diagnostics["period"][
                    "period_ratio_etabs_to_jhack"
                ] = ratio_etabs_to_jhack
                diagnostics["period"][
                    "stiffness_multiplier_to_match_etabs_period"
                ] = stiffness_multiplier
                diagnostics["period"][
                    "mass_multiplier_to_match_etabs_period"
                ] = mass_multiplier

                if current_period_s < target_period_s * 0.50:
                    diagnostics["recommended_adjustments"].append(
                        "El periodo JHACK es mucho menor que ETABS. El modelo está demasiado rígido o la masa efectiva es muy baja."
                    )
                    diagnostics["recommended_adjustments"].append(
                        f"Para igualar periodo manteniendo masa, la rigidez global aproximada debería multiplicarse por {stiffness_multiplier:.6g}."
                    )

                elif current_period_s > target_period_s * 1.50:
                    diagnostics["recommended_adjustments"].append(
                        "El periodo JHACK es mucho mayor que ETABS. El modelo está demasiado flexible o la masa efectiva es muy alta."
                    )
                    diagnostics["recommended_adjustments"].append(
                        f"Para igualar periodo manteniendo masa, la rigidez global aproximada debería multiplicarse por {stiffness_multiplier:.6g}."
                    )

                else:
                    diagnostics["recommended_adjustments"].append(
                        "El periodo JHACK está relativamente cerca del periodo ETABS."
                    )

            # ----------------------------
            # Cortante
            # ----------------------------
            shear_factor = safe_factor(expected_base_shear, jhack_base_shear)

            diagnostics["base_shear"] = {
                "etabs_tonf": expected_base_shear,
                "jhack_tonf": jhack_base_shear,
                "error_percent": errors.get("base_shear"),
                "scale_factor_to_match_etabs": shear_factor,
            }

            # ----------------------------
            # Desplazamiento
            # ----------------------------
            displacement_factor = safe_factor(expected_displacement, jhack_displacement)

            diagnostics["displacement"] = {
                "etabs_m": expected_displacement,
                "jhack_m": jhack_displacement,
                "error_percent": errors.get("max_displacement"),
                "scale_factor_to_match_etabs": displacement_factor,
            }

            # ----------------------------
            # Deriva
            # ----------------------------
            drift_factor = safe_factor(expected_drift, jhack_drift)

            diagnostics["drift"] = {
                "etabs": expected_drift,
                "jhack": jhack_drift,
                "error_percent": errors.get("drift"),
                "scale_factor_to_match_etabs": drift_factor,
            }

            if shear_factor is not None and abs(shear_factor - 1.0) > 0.15:
                diagnostics["recommended_adjustments"].append(
                    f"El cortante requiere factor aproximado {shear_factor:.6g} para coincidir con ETABS."
                )

            if (
                displacement_factor is not None
                and abs(displacement_factor - 1.0) > 0.15
            ):
                diagnostics["recommended_adjustments"].append(
                    f"El desplazamiento requiere factor aproximado {displacement_factor:.6g} para coincidir con ETABS."
                )

            if drift_factor is not None and abs(drift_factor - 1.0) > 0.15:
                diagnostics["recommended_adjustments"].append(
                    f"La deriva requiere factor aproximado {drift_factor:.6g} para coincidir con ETABS."
                )

            diagnostics["ok"] = True

            return diagnostics

        # ============================================================
        # BLOQUE 7R-A - Resultados calibrados estimados
        # ============================================================

        def build_calibrated_estimate_results(
            case_name,
            direction,
            final_spectral_results,
            calibration_diagnostics,
            comparison,
        ):
            """
            Construye una vista calibrada estimada.

            IMPORTANTE:
            - No modifica los resultados originales.
            - No reemplaza el análisis OpenSeesPy.
            - Solo aplica factores diagnósticos para estimar cuánto tendría
              que ajustarse JHACK para acercarse a ETABS.
            """

            calibrated = {
                "attempted": True,
                "ok": False,
                "mode": "calibrated_estimate_7R",
                "case_name": case_name,
                "direction": direction,
                "status": "REVIEW",
                "source": "diagnostic_factors_from_7P_C",
                "note": (
                    "Resultado calibrado estimado. No reemplaza el resultado original del análisis."
                ),
                "period": {},
                "base_shear": {},
                "displacement": {},
                "drift": {},
                "warnings": [],
                "errors": [],
            }

            if not isinstance(final_spectral_results, dict):
                calibrated["errors"].append("No hay final_spectral_results válido.")
                return calibrated

            if not isinstance(calibration_diagnostics, dict):
                calibrated["errors"].append("No hay calibration_diagnostics válido.")
                return calibrated

            expected = (comparison or {}).get("expected", {}) or {}

            def read_factor(container, key="scale_factor_to_match_etabs"):
                value = to_float((container or {}).get(key), None)

                if value is None:
                    return None

                if not math.isfinite(value):
                    return None

                return value

            def apply_factor(value, factor):
                value = to_float(value, None)

                if value is None or factor is None:
                    return None

                return value * factor

            # ----------------------------
            # Periodo
            # ----------------------------
            period_diag = calibration_diagnostics.get("period", {}) or {}

            period_original = to_float(period_diag.get("jhack_period_s"), None)
            period_etabs = to_float(period_diag.get("target_period_s"), None)

            period_factor = None

            if (
                period_original is not None
                and abs(period_original) > 1.0e-18
                and period_etabs is not None
            ):
                period_factor = period_etabs / period_original

            calibrated["period"] = {
                "etabs_target_s": period_etabs,
                "jhack_original_s": period_original,
                "factor": period_factor,
                "calibrated_estimate_s": apply_factor(period_original, period_factor),
                "error_after_calibration_percent": percent_error(
                    apply_factor(period_original, period_factor),
                    period_etabs,
                ),
                "stiffness_factor_k": period_diag.get(
                    "stiffness_multiplier_to_match_etabs_period"
                ),
                "mass_factor_m": period_diag.get(
                    "mass_multiplier_to_match_etabs_period"
                ),
            }

            # ----------------------------
            # Cortante basal
            # ----------------------------
            shear_diag = calibration_diagnostics.get("base_shear", {}) or {}

            shear_original = to_float(
                final_spectral_results.get("equivalent_force_tonf"),
                None,
            )
            shear_etabs = to_float(expected.get("base_shear_tonf"), None)
            shear_factor = read_factor(shear_diag)

            calibrated["base_shear"] = {
                "etabs_target_tonf": shear_etabs,
                "jhack_original_tonf": shear_original,
                "factor": shear_factor,
                "calibrated_estimate_tonf": apply_factor(shear_original, shear_factor),
                "error_after_calibration_percent": percent_error(
                    apply_factor(shear_original, shear_factor),
                    shear_etabs,
                ),
            }

            # ----------------------------
            # Desplazamiento
            # ----------------------------
            displacement_diag = calibration_diagnostics.get("displacement", {}) or {}

            displacement_original = to_float(
                final_spectral_results.get("spectral_displacement_m"),
                None,
            )
            displacement_etabs = to_float(expected.get("max_displacement_m"), None)
            displacement_factor = read_factor(displacement_diag)

            calibrated["displacement"] = {
                "etabs_target_m": displacement_etabs,
                "jhack_original_m": displacement_original,
                "factor": displacement_factor,
                "calibrated_estimate_m": apply_factor(
                    displacement_original,
                    displacement_factor,
                ),
                "error_after_calibration_percent": percent_error(
                    apply_factor(displacement_original, displacement_factor),
                    displacement_etabs,
                ),
            }

            # ----------------------------
            # Deriva
            # ----------------------------
            drift_diag = calibration_diagnostics.get("drift", {}) or {}

            drift_original = to_float(
                final_spectral_results.get("estimated_drift"),
                None,
            )
            drift_etabs = to_float(expected.get("drift"), None)
            drift_factor = read_factor(drift_diag)

            calibrated["drift"] = {
                "etabs_target": drift_etabs,
                "jhack_original": drift_original,
                "factor": drift_factor,
                "calibrated_estimate": apply_factor(drift_original, drift_factor),
                "error_after_calibration_percent": percent_error(
                    apply_factor(drift_original, drift_factor),
                    drift_etabs,
                ),
            }

            after_errors = [
                calibrated["period"].get("error_after_calibration_percent"),
                calibrated["base_shear"].get("error_after_calibration_percent"),
                calibrated["displacement"].get("error_after_calibration_percent"),
                calibrated["drift"].get("error_after_calibration_percent"),
            ]

            numeric_after_errors = [
                value
                for value in after_errors
                if value is not None and math.isfinite(value)
            ]

            max_after_error = (
                max(numeric_after_errors) if numeric_after_errors else None
            )

            calibrated["max_error_after_calibration_percent"] = max_after_error

            if max_after_error is None:
                calibrated["status"] = "REVIEW"
            elif max_after_error <= 5:
                calibrated["status"] = "OK"
            elif max_after_error <= 15:
                calibrated["status"] = "REVIEW"
            else:
                calibrated["status"] = "CRITICAL"

            calibrated["ok"] = True

            calibrated["warnings"].append(
                "La calibración estimada usa factores calculados desde la comparación con ETABS."
            )

            return calibrated

        # ============================================================
        # BLOQUE 7L - SISTEMA DE UNIDADES MODAL SPECTRAL
        # ============================================================

        def normalize_unit_text(value, fallback=""):
            text = str(value or fallback).strip().lower()
            text = text.replace(" ", "")
            text = text.replace("_", "")
            text = text.replace("-", "")
            return text

        def get_modal_spectral_units():
            units_data = (
                data.get("units")
                or analysis.get("units")
                or data.get("unitSystem")
                or {}
            )

            if not isinstance(units_data, dict):
                units_data = {}

            length_unit = normalize_unit_text(
                units_data.get("length")
                or units_data.get("lengthUnit")
                or analysis.get("lengthUnit")
                or "m"
            )

            mass_unit = normalize_unit_text(
                units_data.get("mass")
                or units_data.get("massUnit")
                or analysis.get("massUnit")
                or "kg"
            )

            force_unit = normalize_unit_text(
                units_data.get("force")
                or units_data.get("forceUnit")
                or analysis.get("forceUnit")
                or "tonf"
            )

            acceleration_unit = normalize_unit_text(
                units_data.get("acceleration")
                or units_data.get("accelerationUnit")
                or analysis.get("accelerationUnit")
                or "g"
            )

            return {
                "length_unit": length_unit,
                "mass_unit": mass_unit,
                "force_output_unit": force_unit,
                "spectrum_acceleration_unit": acceleration_unit,
                # Unidades internas del backend
                "internal_length_unit": "m",
                "internal_mass_unit": "kg",
                "internal_force_unit": "N",
                "internal_acceleration_unit": "m/s2",
            }

        unit_settings = get_modal_spectral_units()

        def convert_length_to_m(value, unit=None):
            number = to_float(value, None)

            if number is None:
                return None

            unit = normalize_unit_text(unit or unit_settings["length_unit"], "m")

            if unit in ["m", "meter", "meters", "metro", "metros"]:
                return number

            if unit in ["cm", "centimeter", "centimeters", "centimetro", "centimetros"]:
                return number / 100.0

            if unit in ["mm", "millimeter", "millimeters", "milimetro", "milimetros"]:
                return number / 1000.0

            if unit in ["in", "inch", "inches", "pulgada", "pulgadas"]:
                return number * 0.0254

            if unit in ["ft", "feet", "foot", "pie", "pies"]:
                return number * 0.3048

            return number

        def convert_mass_to_kg(value, unit=None):
            number = to_float(value, None)

            if number is None:
                return None

            unit = normalize_unit_text(unit or unit_settings["mass_unit"], "kg")

            if unit in ["kg", "kilogram", "kilograms", "kilogramo", "kilogramos"]:
                return number

            if unit in ["ton", "t", "tonelada", "toneladas", "metricton"]:
                return number * 1000.0

            # Masa equivalente usada a veces en análisis estructural:
            # tonf*s²/m = 1000 kg aproximadamente.
            if unit in ["tonfs2m", "tonfs^2/m", "tfsm", "tf*s2/m", "tonfseg2m"]:
                return number * 1000.0

            return number

        def convert_spectral_acceleration_to_m_s2(sa_value, scale_factor):
            """
            Convierte la aceleración espectral a m/s².

            Caso actual:
            - Sa viene en g.
            - scaleFactor normalmente es 9.81, 10.7415, 44.145, etc.
            - Entonces Sa_m_s2 = Sa * scaleFactor.
            """

            sa = to_float(sa_value, 0.0)
            factor = to_float(scale_factor, 9.81)

            unit = unit_settings["spectrum_acceleration_unit"]

            if unit in ["g", "gravity"]:
                return sa * factor

            if unit in ["ms2", "m/s2", "m/s²"]:
                return sa * factor

            if unit in ["cm/s2", "cms2", "gal"]:
                return (sa / 100.0) * factor

            return sa * factor

        def convert_force_from_n(value_n, output_unit=None):
            number = to_float(value_n, None)

            if number is None:
                return None

            unit = normalize_unit_text(
                output_unit or unit_settings["force_output_unit"], "tonf"
            )

            if unit in ["n", "newton", "newtons"]:
                return number

            if unit in ["kn", "kilonewton", "kilonewtons"]:
                return number / 1000.0

            if unit in ["tonf", "tf", "toneladafuerza", "toneladasfuerza"]:
                return number / 9806.65

            return number / 9806.65

        def get_force_output_label():
            unit = unit_settings["force_output_unit"]

            if unit in ["n", "newton", "newtons"]:
                return "N"

            if unit in ["kn", "kilonewton", "kilonewtons"]:
                return "kN"

            return "tonf"

        def calculate_spectral_case(case_data):
            case_name = read_value(case_data, ["name", "caseName", "case_name"], "CASE")
            direction = read_value(case_data, ["direction", "dir"], "X")

            target_period_s = to_float(
                read_value(
                    case_data,
                    ["targetPeriodS", "target_period_s", "targetPeriod", "period"],
                    None,
                ),
                None,
            )

            effective_mass_kg = to_float(
                read_value(
                    case_data,
                    ["effectiveMassKg", "effective_mass_kg", "massKg", "mass_kg"],
                    1000.0,
                ),
                1000.0,
            )

            height_m = to_float(
                read_value(
                    case_data,
                    ["heightM", "height_m", "storyHeightM", "story_height_m"],
                    3.61,
                ),
                3.61,
            )

            mass_unit_for_case = read_value(
                case_data,
                ["massUnit", "mass_unit"],
                unit_settings["mass_unit"],
            )

            length_unit_for_case = read_value(
                case_data,
                ["lengthUnit", "length_unit"],
                unit_settings["length_unit"],
            )

            effective_mass_kg = convert_mass_to_kg(
                effective_mass_kg,
                mass_unit_for_case,
            )

            height_m = convert_length_to_m(
                height_m,
                length_unit_for_case,
            )

            scale_factor = to_float(
                read_value(case_data, ["scaleFactor", "scale_factor"], 9.81), 9.81
            )

            # ============================================================
            # BLOQUE 7D - Seleccionar periodo de cálculo
            # ============================================================
            period_selection = select_real_modal_period_for_case(
                case_data,
                direction,
                target_period_s,
            )

            period_for_calculation_s = to_float(
                period_selection.get("period_s"),
                None,
            )

            period_for_calculation_s = to_float(
                period_selection.get("period_s"),
                None,
            )

            if period_for_calculation_s is None or period_for_calculation_s <= 0:
                return {
                    "success": False,
                    "case_name": case_name,
                    "error": "El caso no tiene periodo válido ni periodo modal real disponible.",
                    "modal_period_selection": period_selection,
                }

            # ============================================================
            # BLOQUE 7F - Seleccionar masa de cálculo
            # ============================================================
            mass_selection = select_effective_mass_for_case(
                case_data,
                direction,
                period_selection,
                effective_mass_kg,
            )

            mass_for_calculation_kg = to_float(
                mass_selection.get("mass_for_calculation_kg"),
                effective_mass_kg,
            )

            if mass_for_calculation_kg is None or mass_for_calculation_kg <= 0:
                mass_for_calculation_kg = effective_mass_kg
                mass_selection["source"] = (
                    "case.effectiveMassKg.fallback_after_invalid_modal_mass"
                )
                mass_selection["mass_for_calculation_kg"] = mass_for_calculation_kg
                mass_selection["reason"] = (
                    "La masa modal seleccionada no fue válida. Se volvió a effectiveMassKg."
                )

            # ==============================
            # 4. Calcular rigidez equivalente
            # ==============================
            # Fórmula:
            # T = 2*pi*sqrt(m/k)
            # k = m*(2*pi/T)^2
            #
            # En 7D, T ya puede venir del eigen real de OpenSeesPy.
            stiffness_n_m = mass_for_calculation_kg * (
                (2.0 * math.pi / period_for_calculation_s) ** 2
            )

            # ==============================
            # 5. Modelo OpenSeesPy 1 GDL
            # ==============================
            ops.wipe()
            ops.model("basic", "-ndm", 1, "-ndf", 1)

            ops.node(1, 0.0)
            ops.node(2, 0.0)

            ops.fix(1, 1)
            ops.fix(2, 0)

            ops.mass(2, mass_for_calculation_kg)

            ops.uniaxialMaterial("Elastic", 1, stiffness_n_m)
            ops.element("zeroLength", 1, 1, 2, "-mat", 1, "-dir", 1)

            eigenvalues = ops.eigen("-fullGenLapack", 1)

            eigenvalue = float(eigenvalues[0])
            angular_frequency = math.sqrt(eigenvalue)
            frequency_hz = angular_frequency / (2.0 * math.pi)
            period_s = 1.0 / frequency_hz

            # ==============================
            # 6. Cálculo espectral
            # ==============================
            sa_g = interpolate_spectrum(period_s, spectrum_points)

            spectral_acceleration_m_s2 = convert_spectral_acceleration_to_m_s2(
                sa_g,
                scale_factor,
            )
            spectral_displacement_m = spectral_acceleration_m_s2 / eigenvalue

            equivalent_force_n = mass_for_calculation_kg * spectral_acceleration_m_s2
            equivalent_force_tonf = equivalent_force_n / 9806.65

            equivalent_force_output = convert_force_from_n(equivalent_force_n)
            equivalent_force_output_unit = get_force_output_label()

            drift = spectral_displacement_m / height_m if height_m > 0 else None

            single_mode_spectral_results = {
                "Sa_g": sa_g,
                "spectral_acceleration_m_s2": spectral_acceleration_m_s2,
                "spectral_displacement_m": spectral_displacement_m,
                "equivalent_force_n": equivalent_force_n,
                "equivalent_force_tonf": equivalent_force_tonf,
                "equivalent_force_output": equivalent_force_output,
                "equivalent_force_output_unit": equivalent_force_output_unit,
                "estimated_drift": drift,
            }

            # ============================================================
            # BLOQUE 7G - Respuesta modal combinada SRSS / CQC / ABS
            # ============================================================
            modal_combination_results = build_modal_combination_response_for_case(
                case_data,
                direction,
                height_m,
                scale_factor,
                effective_mass_kg,
            )

            # ============================================================
            # BLOQUE 7H - Resultado final del caso
            # ============================================================
            final_spectral_results = build_final_spectral_results(
                single_mode_spectral_results,
                modal_combination_results,
            )

            # ============================================================
            # BLOQUE 7O - Story Response / Story Drift
            # ============================================================
            story_response_results = build_story_response_for_case(
                case_name,
                direction,
                final_spectral_results,
            )

            ops.wipe()

            # ==============================
            # 7. Comparación opcional
            # ==============================
            expected = case_data.get("expected", {}) or {}

            expected_base_shear_tonf = to_float(
                read_value(expected, ["baseShearTonf", "base_shear_tonf"], None), None
            )

            expected_displacement_m = to_float(
                read_value(expected, ["maxDisplacementM", "max_displacement_m"], None),
                None,
            )

            expected_drift = to_float(read_value(expected, ["drift"], None), None)

            comparison = {
                "expected": {
                    "base_shear_tonf": expected_base_shear_tonf,
                    "max_displacement_m": expected_displacement_m,
                    "drift": expected_drift,
                    "period_s": target_period_s,
                },
                "calculated_source": final_spectral_results.get("source"),
                "error_percent": {
                    "base_shear": percent_error(
                        final_spectral_results.get("equivalent_force_tonf"),
                        expected_base_shear_tonf,
                    ),
                    "max_displacement": percent_error(
                        final_spectral_results.get("spectral_displacement_m"),
                        expected_displacement_m,
                    ),
                    "drift": percent_error(
                        final_spectral_results.get("estimated_drift"),
                        expected_drift,
                    ),
                    "period": percent_error(period_s, target_period_s),
                },
            }

            # ============================================================
            # BLOQUE 7P-C - Diagnóstico de calibración contra ETABS
            # ============================================================
            calibration_diagnostics = build_etabs_calibration_diagnostics(
                case_name,
                direction,
                target_period_s,
                {
                    "period_s": period_s,
                    "period_for_calculation_s": period_for_calculation_s,
                    "selected_real_mode": period_selection.get("selected_mode"),
                },
                final_spectral_results,
                comparison,
            )

            # ============================================================
            # BLOQUE 7R-A - Resultado calibrado estimado
            # ============================================================
            calibrated_estimate_results = build_calibrated_estimate_results(
                case_name,
                direction,
                final_spectral_results,
                calibration_diagnostics,
                comparison,
            )

            return {
                "success": True,
                "case_name": case_name,
                "direction": direction,
                "input": {
                    "target_period_s": target_period_s,
                    "period_for_calculation_s": period_for_calculation_s,
                    "period_source": period_selection.get("source"),
                    "selected_real_mode": period_selection.get("selected_mode"),
                    "effective_mass_kg": effective_mass_kg,
                    "mass_for_calculation_kg": mass_for_calculation_kg,
                    "mass_source": mass_selection.get("source"),
                    "modal_effective_mass_ratio_percent": mass_selection.get(
                        "effective_mass_ratio_percent"
                    ),
                    "modal_cumulative_mass_ratio_percent": mass_selection.get(
                        "cumulative_mass_ratio_percent"
                    ),
                    "height_m": height_m,
                    "scale_factor": scale_factor,
                    "stiffness_n_m": stiffness_n_m,
                    "units": unit_settings,
                    "mass_unit_for_case": mass_unit_for_case,
                    "length_unit_for_case": length_unit_for_case,
                    "force_output_unit": get_force_output_label(),
                },
                "modal_results": {
                    "eigenvalue": eigenvalue,
                    "angular_frequency_rad_s": angular_frequency,
                    "frequency_hz": frequency_hz,
                    "period_s": period_s,
                    "period_source": period_selection.get("source"),
                    "selected_real_mode": period_selection.get("selected_mode"),
                    "period_selection_reason": period_selection.get("reason"),
                },
                "spectral_results": single_mode_spectral_results,
                "modal_combination_results": modal_combination_results,
                "final_spectral_results": final_spectral_results,
                # BLOQUE 7O
                "story_response_results": story_response_results,
                "comparison": comparison,
                # BLOQUE 7P-C
                "calibration_diagnostics": calibration_diagnostics,
                # BLOQUE 7R-A
                "calibrated_estimate_results": calibrated_estimate_results,
                "modal_period_selection": period_selection,
                "modal_mass_selection": mass_selection,
            }

        # ==============================
        # 8. Ejecutar todos los casos
        # ==============================
        results = []

        for case_data in cases:
            result = calculate_spectral_case(case_data)
            results.append(result)

        successful_results = [item for item in results if item.get("success") is True]

        # ==============================
        # 9. Resumen
        # ==============================
        def collect_error(error_name):
            values = []

            for item in successful_results:
                comparison = item.get("comparison", {})
                error_percent = comparison.get("error_percent", {})
                value = error_percent.get(error_name)

                if value is not None:
                    values.append(value)

            return values

        base_shear_errors = collect_error("base_shear")
        displacement_errors = collect_error("max_displacement")
        drift_errors = collect_error("drift")

        max_base_shear_error = max(base_shear_errors) if base_shear_errors else None
        max_displacement_error = (
            max(displacement_errors) if displacement_errors else None
        )
        max_drift_error = max(drift_errors) if drift_errors else None

        status = "OK"

        if max_base_shear_error is not None and max_base_shear_error > 1.0:
            status = "REVIEW"

        if max_displacement_error is not None and max_displacement_error > 1.0:
            status = "REVIEW"

        if max_drift_error is not None and max_drift_error > 1.0:
            status = "REVIEW"

        return jsonify(
            {
                "success": True,
                "type": "modal-spectral-analysis",
                "engine": "OpenSeesPy",
                "version": "V1 simplified spectral endpoint",
                "important_note": (
                    "Esta versión calcula respuesta espectral usando periodos y masas efectivas. "
                    "Todavía no arma el modelo estructural completo con nodes/frames."
                ),
                "model_summary": {
                    "name": model_data.get("name", "Unnamed model"),
                    "nodes_count": len(nodes),
                    "frames_count": len(frames),
                    "supports_count": len(supports),
                    "masses_count": len(masses),
                    "sections_count": len(sections),
                    "materials_count": len(materials),
                },
                "opensees_real_model_build": real_model_build,
                "opensees_real_modal_eigen": real_modal_eigen,
                "analysis_summary": {
                    "number_of_modes": analysis.get("numberOfModes", None),
                    "modal_combination": analysis.get("modalCombination", "CQC"),
                    "use_real_modal_periods": use_real_modal_periods,
                    "use_modal_participating_mass": use_modal_participating_mass,
                    "modal_response_combination": modal_response_combination_method,
                    "modal_damping_ratio": modal_damping_ratio,
                    "use_combined_modal_results": use_combined_modal_results,
                    "real_modal_eigen_ok": real_modal_eigen.get("ok", False),
                    "story_response_available": any(
                        (item.get("story_response_results") or {}).get("ok") is True
                        for item in successful_results
                    ),
                    "story_response_cases": sum(
                        1
                        for item in successful_results
                        if (item.get("story_response_results") or {}).get("ok") is True
                    ),
                    "real_modal_participation_ok": (
                        (real_modal_eigen.get("modal_participation") or {}).get(
                            "ok", False
                        )
                    ),
                    "calibration_diagnostics_available": any(
                        (item.get("calibration_diagnostics") or {}).get("ok") is True
                        for item in successful_results
                    ),
                    "calibration_critical_cases": sum(
                        1
                        for item in successful_results
                        if (item.get("calibration_diagnostics") or {}).get("status")
                        == "CRITICAL"
                    ),
                    "calibration_review_cases": sum(
                        1
                        for item in successful_results
                        if (item.get("calibration_diagnostics") or {}).get("status")
                        == "REVIEW"
                    ),
                    "calibration_ok_cases": sum(
                        1
                        for item in successful_results
                        if (item.get("calibration_diagnostics") or {}).get("status")
                        == "OK"
                    ),
                    "calibrated_estimate_available": any(
                        (item.get("calibrated_estimate_results") or {}).get("ok")
                        is True
                        for item in successful_results
                    ),
                    "calibrated_estimate_ok_cases": sum(
                        1
                        for item in successful_results
                        if (item.get("calibrated_estimate_results") or {}).get("status")
                        == "OK"
                    ),
                    "calibrated_estimate_review_cases": sum(
                        1
                        for item in successful_results
                        if (item.get("calibrated_estimate_results") or {}).get("status")
                        == "REVIEW"
                    ),
                    "calibrated_estimate_critical_cases": sum(
                        1
                        for item in successful_results
                        if (item.get("calibrated_estimate_results") or {}).get("status")
                        == "CRITICAL"
                    ),
                    "total_cases": len(results),
                    "successful_cases": len(successful_results),
                    "failed_cases": len(results) - len(successful_results),
                    "max_base_shear_error_percent": max_base_shear_error,
                    "max_displacement_error_percent": max_displacement_error,
                    "max_drift_error_percent": max_drift_error,
                    "status": status,
                    "units": unit_settings,
                    "force_output_unit": get_force_output_label(),
                },
                "response_spectrum": {
                    "name": response_spectrum.get("name", "Unnamed spectrum"),
                    "units": response_spectrum.get("units", "Sa in g"),
                    "points_count": len(spectrum_points),
                },
                "results": results,
            }
        )

    except Exception as e:
        try:
            ops.wipe()
        except Exception:
            pass

        return (
            jsonify(
                {"success": False, "type": "modal-spectral-analysis", "error": str(e)}
            ),
            500,
        )


if __name__ == "__main__":
    print("\n" + "=" * 60)
    print("🚀 Servidor de Análisis Estructural")
    print("=" * 60)
    print(f"📡 OpenSeesPy disponible: {'✅ SI' if OPENSEES_AVAILABLE else '❌ NO'}")
    print("📍 Endpoints:")
    print("   - GET  /health")
    print("   - GET  /api/opensees/status")
    print("   - POST /api/analyze")
    print("   - GET/POST /api/analyze/modal-test")
    print("=" * 60)
    print("🌐 Servidor corriendo en http://localhost:5001")
    print("=" * 60 + "\n")

    app.run(debug=True, port=5001, host="0.0.0.0")
