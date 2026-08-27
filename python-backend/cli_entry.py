# python-backend/cli_entry.py
#
# Punto de entrada CLI: invocado como subproceso corto (proc_open desde
# PythonEngineController), igual que OctavePlotController::runOctave()
# invoca "octave-cli --eval ...". No levanta ningun servidor ni abre
# puertos, por lo que corre sin problema en hosting compartido (Hostinger
# Business): PHP dispara el proceso, este imprime UN solo JSON a stdout y
# termina.
#
# Contrato:
#   argv[1]  = modo (analyze | analyze-3d | seismic-analyze | seismic-modal
#              | frame-forces | seismic-parse-spectrum | zapata-shell-design
#              | zapata-shell-combined-design | zapata-shell-trapezoidal-design
#              | zapata-shell-l-design | zapata-shell-poligono-design
#              | health | opensees-status)
#   stdin    = payload JSON (puede ser vacio para health/opensees-status)
#   stdout   = UNA linea con el JSON de resultado (nada mas: sin prints,
#              sin banners de import)
#   exit code = 0 si se pudo generar una respuesta (incluso si es un error
#              de negocio, ej. success:false); != 0 solo si el proceso no
#              pudo ni siquiera producir JSON.

import sys
import os
import json
import base64
import traceback

os.environ.setdefault("PYTHONIOENCODING", "utf-8")
os.environ.setdefault("PYTHONUTF8", "1")

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")
if hasattr(sys.stdin, "reconfigure"):
    sys.stdin.reconfigure(encoding="utf-8", errors="replace")


def _redirect_stdout_fd_to_stderr():
    """Blinda el fd 1 (stdout) a NIVEL DE SISTEMA OPERATIVO.

    OpenSeesPy es C++ y escribe basura directamente al descriptor de archivo
    (ej. "[hwloc/linux] ...", "Process 0 Terminating"), saltándose sys.stdout
    de Python — por eso un `contextlib.redirect_stdout` NO alcanza. Si eso
    llega al pipe, corrompe el JSON que lee PHP.

    Guardamos una copia del stdout real y apuntamos el fd 1 a stderr, de modo
    que TODO ruido (Python o C++) caiga en stderr. El JSON final se escribe
    directo al fd guardado. Devuelve ese fd (o None si no se pudo, ej. en un
    entorno sin dup2 real).
    """
    try:
        sys.stdout.flush()
        saved_fd = os.dup(1)
        os.dup2(2, 1)  # fd 1 → stderr
        return saved_fd
    except (OSError, AttributeError):
        return None


def _import_app():
    import app as flask_app  # noqa: WPS433 (import diferido a proposito)

    return flask_app


def _read_payload():
    raw = sys.stdin.read()
    if not raw or not raw.strip():
        return {}
    return json.loads(raw)


def _dispatch(mode, data, flask_app, sa):
    if mode == "health":
        return {
            "status": "healthy",
            "engine": "cli",
            "opensees_available": flask_app.OPENSEES_AVAILABLE,
        }

    if mode == "opensees-status":
        return {
            "status": "online" if flask_app.OPENSEES_AVAILABLE else "offline",
            "opensees_available": flask_app.OPENSEES_AVAILABLE,
            "message": (
                "OpenSeesPy disponible"
                if flask_app.OPENSEES_AVAILABLE
                else "OpenSeesPy no instalado"
            ),
        }

    if mode == "analyze":
        if not flask_app.OPENSEES_AVAILABLE:
            return {"success": False, "error": "OpenSeesPy no está disponible"}
        return flask_app.run_opensees_analysis(data)

    if mode == "analyze-3d":
        if not flask_app.OPENSEES_AVAILABLE:
            return {"success": False, "error": "OpenSeesPy no está disponible"}
        return flask_app.run_opensees_3d_analysis(data)

    if mode == "seismic-analyze":
        if not flask_app.OPENSEES_AVAILABLE:
            return {"success": False, "error": "OpenSeesPy no está disponible"}
        if not data.get("nodes"):
            return {"success": False, "error": "Se requiere al menos un nodo"}
        if not data.get("elements"):
            return {"success": False, "error": "Se requiere al menos un elemento"}
        if not data.get("spectrum_x") and not data.get("spectrum_y"):
            return {
                "success": False,
                "error": "Se requiere al menos un espectro (spectrum_x o spectrum_y)",
            }
        for key in ("spectrum_x", "spectrum_y"):
            spec = data.get(key)
            if spec and isinstance(spec[0], dict):
                data[key] = [(float(p["T"]), float(p["Sa"])) for p in spec]
        return sa.run_full_seismic_analysis(data)

    if mode == "seismic-modal":
        if not flask_app.OPENSEES_AVAILABLE:
            return {"success": False, "error": "OpenSeesPy no disponible"}
        if not data.get("nodes") or not data.get("elements"):
            return {"success": False, "error": "Se requieren nodes y elements"}
        num_modes = int(data.get("num_modes", 6))
        nodes, _elements = sa.build_model_3d(data)
        num_modes = min(num_modes, max(1, len(nodes) * 2))
        modal = sa.run_modal_analysis(nodes, num_modes)
        return {
            "success": True,
            "modes": modal["modal_info"],
            "num_modes": num_modes,
            "num_nodes": len(nodes),
        }

    if mode == "frame-forces":
        cases = data.get("cases") or None
        combos = data.get("combos") if "combos" in data else None
        seismic_cases = data.get("seismicCases") or data.get("seismic_cases") or None
        num_stations = data.get("numStations") or data.get("stations") or 5
        return sa.run_frame_force_results(
            data,
            cases=cases,
            combos=combos,
            seismic_cases=seismic_cases,
            num_stations=num_stations,
        )

    if mode == "zapata-shell-design":
        if not flask_app.OPENSEES_AVAILABLE:
            return {"success": False, "error": "OpenSeesPy no está disponible"}
        return flask_app.run_zapata_shell_design(data)

    if mode == "zapata-shell-combined-design":
        if not flask_app.OPENSEES_AVAILABLE:
            return {"success": False, "error": "OpenSeesPy no está disponible"}
        return flask_app.run_zapata_shell_combined_design(data)

    if mode == "zapata-shell-trapezoidal-design":
        if not flask_app.OPENSEES_AVAILABLE:
            return {"success": False, "error": "OpenSeesPy no está disponible"}
        return flask_app.run_zapata_shell_trapezoidal_design(data)

    if mode == "zapata-shell-l-design":
        if not flask_app.OPENSEES_AVAILABLE:
            return {"success": False, "error": "OpenSeesPy no está disponible"}
        return flask_app.run_zapata_shell_l_design(data)

    if mode == "zapata-shell-poligono-design":
        if not flask_app.OPENSEES_AVAILABLE:
            return {"success": False, "error": "OpenSeesPy no está disponible"}
        return flask_app.run_zapata_shell_poligono_design(data)

    if mode == "seismic-parse-spectrum":
        filename = data.get("filename", "spectrum.txt")
        if data.get("content_base64"):
            file_bytes = base64.b64decode(data["content_base64"])
        else:
            file_bytes = str(data.get("content", "")).encode("utf-8")
        parsed = sa.parse_spectrum_file(file_bytes, filename)
        spectrum = [{"T": float(t), "Sa": float(s)} for t, s in parsed]
        return {
            "success": True,
            "spectrum": spectrum,
            "count": len(spectrum),
            "filename": filename,
        }

    return {"success": False, "error": f"Modo desconocido: {mode}"}


def _emit(result, out_fd):
    """Escribe el JSON final. Si tenemos el fd real guardado, va directo ahí
    (evitando el fd 1 ya redirigido a stderr); si no, cae a stdout normal."""
    line = json.dumps(result, ensure_ascii=False) + "\n"
    if out_fd is not None:
        os.write(out_fd, line.encode("utf-8"))
    else:
        sys.stdout.write(line)
        sys.stdout.flush()


def main():
    if len(sys.argv) < 2:
        _emit({"success": False, "error": "Falta el modo (argv[1])"}, None)
        return 0

    mode = sys.argv[1]

    try:
        data = _read_payload()
    except json.JSONDecodeError as e:
        _emit({"success": False, "error": f"JSON invalido en stdin: {e}"}, None)
        return 0

    # A partir de aquí importamos OpenSeesPy (ruido C++): blindar stdout.
    out_fd = _redirect_stdout_fd_to_stderr()

    try:
        flask_app = _import_app()
        import seismic_analysis as sa  # noqa: WPS433

        result = _dispatch(mode, data, flask_app, sa)
    except Exception as e:  # noqa: BLE001 - queremos capturar TODO y devolver JSON
        result = {
            "success": False,
            "error": str(e),
            "traceback": traceback.format_exc(),
        }

    _emit(result, out_fd)
    return 0


if __name__ == "__main__":
    sys.exit(main())
