# python-backend/app.py
from flask import Flask, request, jsonify
from flask_cors import CORS
import traceback
import seismic_analysis as sa
import math
import os
import json
from design.column_interaction import (
    compute_pmm_surface,
    capacity_ratio_radial,
    beta1_from_fc,
    normalize_design_code,
)
from design.column_slenderness import magnify_nonsway, minimum_eccentricity_variants
from design.column_shear import column_shear_design


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


def _dump_seismic_result_if_enabled(data, result):
    """Depuración TEMPORAL (2026-07-31) para el caso MODULO 5: vuelca las
    ramas X/Y crudas del RSA (base_shear_fx/fy, momentos) junto con la
    combinación SRSS final (la MISMA fórmula que el frontend usa en
    _buildEtabsStyleBaseShearRows, results.js — sin factor 0.3 extra: ya
    viene incorporado en spectrum_x/spectrum_y por caso) para comparar
    directo contra las tablas "Base Reactions" que exporta ETABS.
    OPT-IN: misma env var DUMP_SEISMIC_PAYLOAD=1. Escribe
    _debug_payloads/last_seismic_result.json (gitignored) y también
    imprime un resumen en la consola de Flask.
    QUITAR cuando se cierre project_modulo5_period_calibration (ver memoria).
    """
    if os.environ.get("DUMP_SEISMIC_PAYLOAD", "").strip().lower() not in ("1", "true", "on", "yes"):
        return
    try:
        seismic = (result or {}).get("seismic") or {}
        rx = seismic.get("x") or {}
        ry = seismic.get("y") or {}

        def _srss(a, b):
            a = float(a or 0.0)
            b = float(b or 0.0)
            return (a * a + b * b) ** 0.5

        TONF = 9806.65  # 1 tonf = 9806.65 N (mismo factor usado en todo el proyecto)

        fx_N = _srss(rx.get("base_shear_fx"), ry.get("base_shear_fx"))
        fy_N = _srss(rx.get("base_shear_fy"), ry.get("base_shear_fy"))
        mx_Nm = _srss(rx.get("base_moment_mx"), ry.get("base_moment_mx"))
        my_Nm = _srss(rx.get("base_moment_my"), ry.get("base_moment_my"))
        mz_Nm = _srss(rx.get("base_moment_mz"), ry.get("base_moment_mz"))

        spectrum_x = data.get("spectrum_x") or []
        spectrum_y = data.get("spectrum_y") or []
        modal_modes = ((result or {}).get("modal") or {}).get("modes") or []

        summary = {
            "spectrum_x_sample": spectrum_x[:8],
            "spectrum_y_sample": spectrum_y[:8],
            "num_modes": data.get("num_modes"),
            "combination": data.get("combination"),
            "damping_ratio": data.get("damping_ratio"),
            "branch_x": {
                "base_shear_fx_N": rx.get("base_shear_fx"),
                "base_shear_fy_N": rx.get("base_shear_fy"),
                "base_moment_mx_Nm": rx.get("base_moment_mx"),
                "base_moment_my_Nm": rx.get("base_moment_my"),
                "base_moment_mz_Nm": rx.get("base_moment_mz"),
            },
            "branch_y": {
                "base_shear_fx_N": ry.get("base_shear_fx"),
                "base_shear_fy_N": ry.get("base_shear_fy"),
                "base_moment_mx_Nm": ry.get("base_moment_mx"),
                "base_moment_my_Nm": ry.get("base_moment_my"),
                "base_moment_mz_Nm": ry.get("base_moment_mz"),
            },
            "combined_srss_tonf_tonfm": {
                "FX": fx_N / TONF,
                "FY": fy_N / TONF,
                "MX": mx_Nm / TONF,
                "MY": my_Nm / TONF,
                "MZ": mz_Nm / TONF,
            },
            "first_5_periods": [m.get("period") for m in modal_modes[:5]],
        }

        out_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), "_debug_payloads")
        os.makedirs(out_dir, exist_ok=True)
        path = os.path.join(out_dir, "last_seismic_result.json")
        with open(path, "w", encoding="utf-8") as fh:
            json.dump(summary, fh, ensure_ascii=False, indent=2)

        print("DUMP: resultado sismico (resumen) guardado en", path)
        print(
            "DUMP RESULT: Combinado SRSS -> "
            f"FX={summary['combined_srss_tonf_tonfm']['FX']:.4f} tonf  "
            f"FY={summary['combined_srss_tonf_tonfm']['FY']:.4f} tonf  "
            f"MX={summary['combined_srss_tonf_tonfm']['MX']:.4f} tonf-m  "
            f"MY={summary['combined_srss_tonf_tonfm']['MY']:.4f} tonf-m  "
            f"MZ={summary['combined_srss_tonf_tonfm']['MZ']:.4f} tonf-m"
        )
    except Exception as exc:
        print(f"AVISO: no se pudo volcar el resultado sismico: {exc}")


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
        _dump_seismic_result_if_enabled(data, result)
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


# Malla de fibra para los CHEQUEOS de demanda (el ratio), mas gruesa que la de
# la superficie dibujada. Son ~44 chequeos por columna y cada uno hace ~100
# evaluaciones, asi que aca esta el 80% del tiempo del diseno.
#
# Medido en la C45x45 contra la malla de 60x60: 40x40 da 0.0069% de error,
# 30x30 da 0.0165% y 24x24 da 0.030%. Se toma 30 — un orden de magnitud por
# debajo del 0.03% con que la curva calza contra ETABS, y 3.4x mas rapido
# (0.169 s -> 0.050 s por chequeo).
#
# Esto SOLO es viable desde que las fibras entran con peso PARCIAL: antes el
# bloque de compresion se cuantizaba al tamano de celda y una malla gruesa
# metia varios por ciento de error (ver project-fiber-partial-weight).
_DEMAND_FIBER_GRID = 30

# Cache de superficies P-M-M por geometria. Todas las columnas de un modelo
# suelen compartir seccion (en el de referencia, las 9 son C45x45) y la
# superficie NO depende de la demanda: se recalculaba 9 veces la misma.
#
# Solo sirve en Windows/dev, donde el backend es un proceso largo; en produccion
# cada request es un subproceso nuevo. Igual es donde mas molesta la espera.
_SURFACE_CACHE = {}
_SURFACE_CACHE_MAX = 32


def _run_column_interaction(data):
    """
    Diagrama de interacción P-M-M biaxial (ACI-318) para una columna
    rectangular con armado real (ver python-backend/design/column_interaction.py
    y el plan de columnas — Paso 2). Sin dependencia de OpenSeesPy, no
    requiere análisis previo: es geometría + materiales puros. Compartida
    entre el endpoint Flask (Windows) y cli_entry.py (Linux, subproceso).

    Payload (SI): { b, h, fc, fy, cover, barDiameter, n3, n2, barArea,
                     confineBarDiameter?, tied?, numAngles?, numC?,
                     demandPoints?: [{P, M2, M3}, ...] } — todo en metros/Pa.

    `cover` es el recubrimiento LIBRE hasta la superficie del estribo
    ("Clear Cover for Confinement Bars" en el diálogo de ETABS, exportado vía
    COVER) — `confineBarDiameter` (opcional, 0 si no hay armado transversal
    real) se resta aparte para ubicar el centro de la varilla longitudinal,
    ver generate_rect_bar_positions.

    `demandPoints` (opcional): además de la superficie de 24 curvas (útil
    como referencia visual), calcula el ratio P-M-M RADIAL en el ángulo real
    de cada punto de demanda (ver capacity_ratio_radial) — el mismo D/C
    Ratio que reporta ETABS: distancia origen→demanda sobre origen→superficie
    en el espacio P-M2-M3, NO M_demanda/M_capacidad al mismo Pn (eso subestimaba
    la capacidad real por 5-6x en columnas livianas, ver project_pmm_ratio_gap
    en memoria — brecha cerrada, no era un error de capacidad ni de armado).
    Se devuelve en `demandChecks`, en el mismo orden que `demandPoints`.

    `slenderness` (opcional): { ec, lu, k?, betaD?, hasTransverseLoad? } —
    activa la magnificacion de momentos de 2do orden (E.060 10.12, ver
    design/column_slenderness.py). Cada punto de `demandPoints` debe traer
    entonces `M2Top`/`M3Top` (el momento del MISMO combo en el otro extremo
    del elemento), porque delta_ns depende de los DOS extremos, no de una
    estacion suelta. Los momentos ya magnificados son los que se verifican
    contra la superficie, y el detalle viaja en `demandChecks[i].slenderness`.
    """
    # FORMA de la seccion. Por defecto rectangular, que es lo unico que existia
    # antes: un payload viejo sigue funcionando igual. La circular necesita
    # `diameter` y `numBars` en vez de b/h/n2/n3 (ver design/column_circular.py).
    _forma = str(data.get("shape") or "").lower()
    if _forma.startswith("circ"):
        shape = "circular"
    elif _forma in ("l", "lconc"):
        shape = "L"
    elif _forma in ("tee", "t"):
        shape = "tee"
    else:
        shape = "rect"

    # Geometria de las formas POLIGONALES (L y T). `b`/`h` siguen siendo el ancho
    # y el peralte totales; lo que se agrega son los espesores de las patas y los
    # espejos, que en una L cambian DONDE queda el material respecto del nudo.
    flange_thick = data.get("flangeThick")
    web_thick = data.get("webThick")
    mirror2 = bool(data.get("mirror2"))
    mirror3 = bool(data.get("mirror3"))

    comunes = ["fc", "fy", "cover", "barDiameter", "barArea"]
    if shape == "circular":
        required = comunes + ["diameter", "numBars"]
    elif shape in ("L", "tee"):
        required = comunes + ["b", "h", "flangeThick", "webThick", "numBars"]
    else:
        required = comunes + ["b", "h", "n3", "n2"]
    missing = [k for k in required if data.get(k) is None]
    if missing:
        return {"success": False, "error": f"Faltan campos: {', '.join(missing)}"}

    diameter = float(data.get("diameter") or 0.0)
    num_bars = int(data.get("numBars") or 0)
    # En circular b/h no describen la geometria; se igualan al diametro para que
    # el resto (clave de cache, mensajes) tenga algo coherente.
    b = float(data.get("b") or diameter)
    h = float(data.get("h") or diameter)
    fc = float(data["fc"])
    fy = float(data["fy"])
    cover = float(data["cover"])
    bar_diameter = float(data["barDiameter"])
    n3 = int(data.get("n3") or 0)
    n2 = int(data.get("n2") or 0)
    bar_area = float(data["barArea"])
    # ESTRIBOS vs ESPIRAL: define el tope axial (0.80 vs 0.85 Po) y el phi de
    # compresion (0.65/0.70 vs 0.75). Por defecto lo decide la FORMA — una
    # circular va con espiral — pero el payload puede forzarlo, que es el caso
    # legitimo de una circular zunchada con estribos circulares.
    tied = bool(data["tied"]) if data.get("tied") is not None else (shape != "circular")
    confine_bar_diameter = float(data.get("confineBarDiameter") or 0.0)
    # Código de diseño: decide los φ (E.060 Art. 10.3.2 vs ACI 318 §21.2) y la
    # ley de transición. Default E.060 — ver DEFAULT_DESIGN_CODE.
    code = normalize_design_code(data.get("code"))
    beta1 = beta1_from_fc(fc)

    surf_key = (
        b, h, fc, fy, cover, bar_diameter, n3, n2, bar_area, tied,
        int(data.get("numAngles", 24)), int(data.get("numC", 21)),
        confine_bar_diameter, code,
        shape, diameter, num_bars,
    )
    surface = _SURFACE_CACHE.get(surf_key)
    if surface is None:
        surface = compute_pmm_surface(
            b=b, h=h, fc=fc, fy=fy, cover=cover, bar_diameter=bar_diameter,
            n3=n3, n2=n2, bar_area=bar_area, tied=tied,
            num_angles=surf_key[10],
            num_c=surf_key[11],
            confine_bar_diameter=confine_bar_diameter,
            code=code,
            shape=shape, diameter=diameter, num_bars=num_bars,
            flange_thick=flange_thick, web_thick=web_thick,
            mirror2=mirror2, mirror3=mirror3,
        )
        if surface is not None:
            if len(_SURFACE_CACHE) >= _SURFACE_CACHE_MAX:
                _SURFACE_CACHE.clear()
            _SURFACE_CACHE[surf_key] = surface

    if surface is None:
        return {"success": False, "error": "Geometría/patrón de armado inválido (no se pudo ubicar varilla)."}

    # Esbeltez (E.060 10.12): si llega la config, cada momento de demanda se
    # MAGNIFICA antes de verificar la seccion. Es un efecto de ELEMENTO (usa
    # los dos extremos del mismo combo), por eso el punto trae M2Top/M3Top.
    slender_cfg = data.get("slenderness") or None
    ec_slender = float(slender_cfg.get("ec", 0.0)) if slender_cfg else 0.0
    lu_slender = float(slender_cfg.get("lu", 0.0)) if slender_cfg else 0.0
    slender_on = bool(slender_cfg) and ec_slender > 0 and lu_slender > 0
    if shape in ("L", "tee"):
        # Ag e Ig REALES del poligono. Con las formulas rectangulares el radio de
        # giro saldria del rectangulo ENVOLVENTE, que en una L sobreestima
        # bastante el area y SUBESTIMA la esbeltez.
        from design.column_polygon import (l_section_vertices, polygon_area,
                                           tee_section_vertices)
        _v = (l_section_vertices(h, b, flange_thick, web_thick, mirror2, mirror3)
              if shape == "L" else tee_section_vertices(h, b, flange_thick, web_thick))
        ag_sec = polygon_area(_v) if _v else b * h
        ig_axis = {"M2": ag_sec * h * h / 12.0, "M3": ag_sec * b * b / 12.0}
        h_axis = {"M2": h, "M3": b}
    elif shape == "circular":
        # Ag e Ig REALES del disco. Con las formulas rectangulares y b=h=D el
        # radio de giro salia sqrt(D^2/12)=0.2887D en vez de D/4: un 15% de mas,
        # que SUBESTIMA la esbeltez (menos magnificacion de la que corresponde).
        ag_sec = math.pi * diameter ** 2 / 4.0
        ig_circ = math.pi * diameter ** 4 / 64.0
        ig_axis = {"M2": ig_circ, "M3": ig_circ}
        h_axis = {"M2": diameter, "M3": diameter}
    else:
        ag_sec = b * h
        # Ig por eje: flexion alrededor del eje 2 usa el peralte en 3 y viceversa.
        ig_axis = {"M2": b * h ** 3 / 12.0, "M3": h * b ** 3 / 12.0}
        h_axis = {"M2": h, "M3": b}

    def _magnify(component, m_bottom, m_top, p_u):
        """delta_ns para UN eje. Devuelve (momento_magnificado, detalle)."""
        if not slender_on:
            return m_bottom, None
        res = magnify_nonsway(
            pu=p_u, m_end_a=m_bottom, m_end_b=m_top,
            ec=ec_slender, ig=ig_axis[component], ag=ag_sec, lu=lu_slender,
            k=float(slender_cfg.get("k", 1.0) or 1.0),
            beta_d=float(slender_cfg.get("betaD", 0.0) or 0.0),
            has_transverse_load=bool(slender_cfg.get("hasTransverseLoad", False)),
            h_dim=h_axis[component],
        )
        if res["unstable"]:
            return m_bottom, m_bottom, res

        # QUE MOMENTO SE DISENA EN ESTA ESTACION.
        #
        # `res["m2"]` es el MAYOR de los dos extremos: eso es lo que pide ACI
        # 318 §6.6.4.5.2 para el caso ESBELTO, donde Mc = delta_ns * M2 aplica a
        # todo el elemento. Pero si la columna NO es esbelta no hay
        # magnificacion y cada seccion se disena con SU PROPIO momento; usar el
        # del otro extremo infla la estacion menos cargada.
        #
        # Medido contra el Column Element Details de ETABS (C7 Story1, base):
        # su `NonSway Mns` vale -0.3831, el momento de LA BASE, con delta_ns=1.
        # Nosotros llevabamos 1.42, que es el del TOPE — y eso rotaba el angulo
        # de la demanda de 254 a 42 grados.
        if res["applied"]:
            base_mom = res["m2"]                       # esbelta: el mayor extremo
            gobernante = m_bottom if abs(m_bottom) >= abs(m_top) else m_top
        else:
            base_mom = abs(m_bottom)                   # no esbelta: el propio
            gobernante = m_bottom if m_bottom else (m_top if m_top else 1.0)

        # El signo se conserva porque capacity_ratio_radial toma el angulo
        # atan2(M2, M3): perderlo rotaria la demanda a otro cuadrante.
        signo = -1.0 if gobernante < 0 else 1.0

        # Las DOS versiones: con el piso de excentricidad minima y sin el. Las
        # necesita el chequeo de e_min por eje, mas abajo.
        con_min = signo * max(base_mom, res["m2Min"]) * res["deltaNs"]
        sin_min = signo * base_mom * res["deltaNs"]
        return con_min, sin_min, res

    demand_checks = None
    demand_points = data.get("demandPoints")
    if isinstance(demand_points, list) and demand_points:
        demand_checks = []
        for pt in demand_points:
            p_u = float(pt.get("P", 0.0))
            m2_u = float(pt.get("M2", 0.0))
            m3_u = float(pt.get("M3", 0.0))

            slender_detail = None
            variantes = [(m2_u, m3_u)]

            if slender_on:
                m2_top = float(pt.get("M2Top", m2_u))
                m3_top = float(pt.get("M3Top", m3_u))
                m2_con, m2_sin, det2 = _magnify("M2", m2_u, m2_top, p_u)
                m3_con, m3_sin, det3 = _magnify("M3", m3_u, m3_top, p_u)
                slender_detail = {"M2": det2, "M3": det3}

                # EXCENTRICIDAD MINIMA: UN EJE POR VEZ, no los dos a la vez.
                #
                # La excentricidad accidental que cubre el minimo de
                # ACI 318 §6.6.4.5.4 / E.060 10.12.3.2 actua en UNA direccion,
                # no simultaneamente en las dos. Aplicarla a los dos ejes
                # inventa una demanda biaxial que no existe: en la C45x45 del
                # modelo de referencia daba |M|=1.88 t-m donde ETABS usa 1.38.
                #
                # Verificado en el Column Element Details de ETABS (C7 Story1):
                # con Minimum M2 = Minimum M3 = 1.3294, su diseno usa
                # Mu2 = -1.3294 (el minimo) y Mu3 = -0.3831 (el factorado).
                #
                # Se arman las dos variantes y gana la de mayor ratio; si el
                # minimo no levanto ningun eje, las dos coinciden y se evalua
                # una sola vez.
                variantes = minimum_eccentricity_variants(m2_con, m2_sin, m3_con, m3_sin)

            result = None
            for v2, v3 in variantes:
                r = capacity_ratio_radial(
                    b=b, h=h, fc=fc, fy=fy, cover=cover, bar_diameter=bar_diameter,
                    n3=n3, n2=n2, bar_area=bar_area, beta1=beta1,
                    target_p=p_u, target_m2=v2, target_m3=v3,
                    confine_bar_diameter=confine_bar_diameter,
                    code=code, tied=tied,
                    nx=_DEMAND_FIBER_GRID, ny=_DEMAND_FIBER_GRID,
                    shape=shape, diameter=diameter, num_bars=num_bars,
            flange_thick=flange_thick, web_thick=web_thick,
            mirror2=mirror2, mirror3=mirror3,
                )
                if r is None:
                    continue
                if result is None or r["ratio"] > result["ratio"]:
                    result = r
                    m2_u, m3_u = v2, v3

            if result is None:
                demand_checks.append({"error": "sin capacidad calculable"})
                continue
            cap = result["capacity"]
            phi_mn_cap = math.hypot(cap["phiM2n"], cap["phiM3n"])
            ratio = result["ratio"]
            check = {
                "thetaDeg": result["thetaDeg"],
                "phi": result["phi"],
                "phiMnCap": phi_mn_cap,
                "muResultant": math.hypot(m2_u, m3_u),
                "ratio": ratio,
                "status": "OK" if ratio <= 1 else "NG",
            }
            if slender_detail is not None:
                # Momentos YA magnificados que se verificaron (para poder
                # auditar contra los del analisis, que quedan en el front).
                check["M2Design"] = m2_u
                check["M3Design"] = m3_u
                check["slenderness"] = slender_detail
            demand_checks.append(check)

    response = {"success": True, "code": code, **surface}
    if demand_checks is not None:
        response["demandChecks"] = demand_checks

    return response


@app.route("/api/column-interaction", methods=["POST"])
def column_interaction():
    try:
        data = request.get_json(force=True) or {}
        response = _run_column_interaction(data)
        status = 200 if response.get("success") else 400
        return jsonify(response), status

    except Exception as e:
        return (
            jsonify({"success": False, "error": str(e), "traceback": traceback.format_exc()}),
            500,
        )


def _run_column_shear(data):
    """
    Corte por diseño de capacidad + confinamiento de una columna rectangular
    (estribos) o CIRCULAR (espiral, `shape: "circular"` + `diameter`/`numBars`)
    (ver python-backend/design/column_shear.py). Compartida entre el
    endpoint Flask (Windows) y cli_entry.py (Linux, subproceso) — mismo
    patrón que _run_column_interaction.

    Payload (SI): { b, h, fc, fy, cover, barDiameter, n3, n2, barArea,
                     confineFy, confineBarArea, confineBarDiameter,
                     confineBarSpacing, numConfineBars2, numConfineBars3,
                     clearHeight, axialMin, axialMax, vuAnalysis2, vuAnalysis3 }
    """
    # FORMA: circular = espiral (cambia Ag, el `d` de corte, las ramas y todo el
    # bloque de confinamiento a rho_s volumetrica). Default rectangular, o sea
    # un payload viejo entra por el mismo camino de antes.
    shape_shear = "circular" if str(data.get("shape") or "").lower().startswith("circ") else "rect"

    comunes = [
        "fc", "fy", "cover", "barDiameter", "barArea",
        "confineFy", "confineBarArea", "confineBarDiameter", "confineBarSpacing",
        "clearHeight", "axialMin", "axialMax", "vuAnalysis2", "vuAnalysis3",
    ]
    required = (comunes + ["diameter", "numBars"]) if shape_shear == "circular"         else (comunes + ["b", "h", "n3", "n2", "numConfineBars2", "numConfineBars3"])
    missing = [k for k in required if data.get(k) is None]
    if missing:
        return {"success": False, "error": f"Faltan campos: {', '.join(missing)}"}

    diameter_shear = float(data.get("diameter") or 0.0)

    result = column_shear_design(
        b=float(data.get("b") or diameter_shear), h=float(data.get("h") or diameter_shear), fc=float(data["fc"]), fy=float(data["fy"]),
        cover=float(data["cover"]), bar_diameter=float(data["barDiameter"]),
        n3=int(data.get("n3") or 0), n2=int(data.get("n2") or 0), bar_area=float(data["barArea"]),
        fyt=float(data["confineFy"]), confine_bar_area=float(data["confineBarArea"]),
        confine_bar_diameter=float(data["confineBarDiameter"]),
        confine_bar_spacing=float(data["confineBarSpacing"]),
        num_confine_bars2=int(data.get("numConfineBars2") or 0),
        num_confine_bars3=int(data.get("numConfineBars3") or 0),
        clear_height=float(data["clearHeight"]), axial_min=float(data["axialMin"]),
        axial_max=float(data["axialMax"]), vu_analysis2=float(data["vuAnalysis2"]),
        vu_analysis3=float(data["vuAnalysis3"]),
        code=normalize_design_code(data.get("code")),
        # Tope por resistencia de las vigas del nudo (ACI 318 18.7.6.1.1 in
        # fine) — opcional; sin el dato Ve queda gobernado por el Mpr de la
        # columna, que es lo conservador. Ver design/column_shear.py.
        joint_beam_moment=data.get("jointBeamMoment") or None,
        shape=shape_shear, diameter=diameter_shear,
        num_long_bars=int(data.get("numBars") or 0),
        # Convenciones de calculo seleccionables (nucleo confinado, area de Vc,
        # `d` del tope). Sin este campo van las de norma. Ver el bloque
        # CONVENCIONES en design/column_shear.py.
        conventions=data.get("conventions") or None,
    )
    return {"success": True, **result}


@app.route("/api/column-shear", methods=["POST"])
def column_shear():
    try:
        data = request.get_json(force=True) or {}
        response = _run_column_shear(data)
        status = 200 if response.get("success") else 400
        return jsonify(response), status

    except Exception as e:
        return (
            jsonify({"success": False, "error": str(e), "traceback": traceback.format_exc()}),
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
