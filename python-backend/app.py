# python-backend/app.py
from flask import Flask, request, jsonify
from flask_cors import CORS
import traceback
import seismic_analysis as sa
import math
import os
import json


def _dump_seismic_payload_if_enabled(data):
    """Vuelca el payload sísmico recibido a disco para pruebas controladas
    (calibración vs ETABS, etc.). OPT-IN: se activa con la env var
    DUMP_SEISMIC_PAYLOAD=1 al arrancar Flask; en uso normal NO hace nada.
    Escribe _debug_payloads/last_seismic_payload.json (gitignored).
    (Es código de servidor: NO afecta el navegador ni recarga la página.)
    """
    if os.environ.get("DUMP_SEISMIC_PAYLOAD", "").strip().lower() not in ("1", "true", "on", "yes"):
        return
    try:
        out_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), "_debug_payloads")
        os.makedirs(out_dir, exist_ok=True)
        path = os.path.join(out_dir, "last_seismic_payload.json")
        with open(path, "w", encoding="utf-8") as fh:
            json.dump(data, fh, ensure_ascii=False)
        print(f"DUMP: payload sismico guardado en {path}")
    except Exception as exc:
        print(f"AVISO: no se pudo volcar el payload sismico: {exc}")

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


@app.route("/api/seismic/parse-spectrum", methods=["POST"])
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
        filename = "spectrum.txt"
        file_bytes = None

        if request.files and "file" in request.files:
            f = request.files["file"]
            filename = f.filename or filename
            file_bytes = f.read()
        elif request.is_json:
            payload = request.get_json()
            filename = payload.get("filename", filename)
            if payload.get("content_base64"):
                import base64

                file_bytes = base64.b64decode(payload["content_base64"])
            else:
                file_bytes = payload.get("content", "").encode("utf-8")
        else:
            return (
                jsonify(
                    {
                        "success": False,
                        "error": "Se requiere un archivo (form-data) o JSON con campo content",
                    }
                ),
                400,
            )

        data = sa.parse_spectrum_file(file_bytes, filename)

        spectrum = [{"T": float(t), "Sa": float(s)} for t, s in data]
        return jsonify(
            {
                "success": True,
                "spectrum": spectrum,
                "count": len(spectrum),
                "filename": filename,
            }
        )

    except Exception as e:
        return (
            jsonify(
                {"success": False, "error": str(e), "traceback": traceback.format_exc()}
            ),
            500,
        )


@app.route("/api/seismic/analyze", methods=["POST"])
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
        return (
            jsonify(
                {
                    "success": False,
                    "error": "OpenSeesPy no está disponible",
                    "message": "Instala openseespywin o openseespy para habilitar el análisis sísmico",
                }
            ),
            503,
        )

    try:
        data = request.get_json()
        if not data:
            return jsonify({"success": False, "error": "Payload JSON requerido"}), 400

        _dump_seismic_payload_if_enabled(data)

        # Validaciones básicas
        if not data.get("nodes"):
            return (
                jsonify({"success": False, "error": "Se requiere al menos un nodo"}),
                400,
            )
        if not data.get("elements"):
            return (
                jsonify(
                    {"success": False, "error": "Se requiere al menos un elemento"}
                ),
                400,
            )
        if not data.get("spectrum_x") and not data.get("spectrum_y"):
            return (
                jsonify(
                    {
                        "success": False,
                        "error": "Se requiere al menos un espectro (spectrum_x o spectrum_y)",
                    }
                ),
                400,
            )

        # Convertir espectros de [{T, Sa}] → [(T, Sa)] si vienen como dicts
        for key in ("spectrum_x", "spectrum_y"):
            spec = data.get(key)
            if spec and isinstance(spec[0], dict):
                data[key] = [(float(p["T"]), float(p["Sa"])) for p in spec]

        result = sa.run_full_seismic_analysis(data)
        return jsonify(result)

    except Exception as e:
        return (
            jsonify(
                {
                    "success": False,
                    "error": str(e),
                    "traceback": traceback.format_exc(),
                }
            ),
            500,
        )


@app.route("/api/frame-forces", methods=["POST"])
def frame_forces():
    """
    FASE 1 — Diagramas de fuerzas internas por barra (P, V2, V3, T, M2, M3).
    Corre análisis estático lineal por caso de gravedad y devuelve el contrato
    `jhack_frame_force_results`. Aislado del pipeline sísmico.

    Payload: { nodes, elements, supports, loads, cases?, numStations? }
    """
    try:
        data = request.get_json(force=True) or {}
        cases = data.get("cases") or None
        combos = data.get("combos") if "combos" in data else None
        seismic_cases = data.get("seismicCases") or data.get("seismic_cases") or None
        num_stations = data.get("numStations") or data.get("stations") or 5
        result = sa.run_frame_force_results(
            data,
            cases=cases,
            combos=combos,
            seismic_cases=seismic_cases,
            num_stations=num_stations,
        )
        return jsonify(result)
    except Exception as e:
        return (
            jsonify(
                {
                    "success": False,
                    "error": str(e),
                    "traceback": traceback.format_exc(),
                }
            ),
            500,
        )


@app.route("/api/seismic/modal", methods=["POST"])
def modal_only():
    """
    Solo análisis modal (eigenvalue), sin aplicar espectro.
    Útil para verificar periodos y modos antes del RSA.

    Payload: mismos campos nodes, elements, supports (sin spectrum ni loads).
    Parámetro opcional: num_modes (default 6).
    """
    if not OPENSEES_AVAILABLE:
        return jsonify({"success": False, "error": "OpenSeesPy no disponible"}), 503

    try:
        data = request.get_json() or {}
        if not data.get("nodes") or not data.get("elements"):
            return (
                jsonify({"success": False, "error": "Se requieren nodes y elements"}),
                400,
            )

        num_modes = int(data.get("num_modes", 6))
        nodes, elements = sa.build_model_3d(data)
        num_modes = min(num_modes, max(1, len(nodes) * 2))
        modal = sa.run_modal_analysis(nodes, num_modes)

        return jsonify(
            {
                "success": True,
                "modes": modal["modal_info"],
                "num_modes": num_modes,
                "num_nodes": len(nodes),
            }
        )

    except Exception as e:
        return (
            jsonify(
                {"success": False, "error": str(e), "traceback": traceback.format_exc()}
            ),
            500,
        )


@app.route("/api/seismic/health", methods=["GET"])
def seismic_health_check():
    return jsonify(
        {
            "status": "ok",
            "service": "jhack-seismic-backend",
            "endpoint": "/api/seismic/analyze",
            "message": "Backend sísmico Flask disponible",
        }
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
