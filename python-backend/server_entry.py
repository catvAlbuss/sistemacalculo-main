import sys
import os

# Forzar salida UTF-8 en Windows para evitar errores con emojis o caracteres especiales
# cuando el backend se ejecuta como .exe, tarea programada o con logs redirigidos.
try:
    if hasattr(sys.stdout, "reconfigure"):
        sys.stdout.reconfigure(encoding="utf-8", errors="replace")
    if hasattr(sys.stderr, "reconfigure"):
        sys.stderr.reconfigure(encoding="utf-8", errors="replace")
except Exception:
    pass

os.environ.setdefault("PYTHONIOENCODING", "utf-8")
os.environ.setdefault("PYTHONUTF8", "1")

from waitress import serve
from app import app

HOST = "127.0.0.1"
PORT = 5001

if __name__ == "__main__":
    print("=" * 60)
    print("ETABS 2 Backend API")
    print(f"Servidor iniciado en http://{HOST}:{PORT}")
    print("Endpoints principales:")
    print(f"  GET  http://{HOST}:{PORT}/health")
    print(f"  GET  http://{HOST}:{PORT}/api/opensees/status")
    print(f"  POST http://{HOST}:{PORT}/api/seismic/analyze")
    print(f"  POST http://{HOST}:{PORT}/api/frame-forces")
    print("=" * 60)

    serve(app, host=HOST, port=PORT, threads=4)
