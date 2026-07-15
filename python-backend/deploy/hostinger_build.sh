#!/bin/sh
# Se ejecuta automáticamente en cada deploy (pegar como "Build command" en
# hPanel → Git → configuración del repositorio). Idempotente: si el venv ya
# existe, no lo vuelve a crear; `pip install` es rápido cuando ya está
# satisfecho. No requiere SSH manual ni pasos fuera del repo.
#
# Deja el motor listo en python-backend/venv/ (no se versiona, ver
# .gitignore) para que PythonEngineController::run() lo invoque vía
# proc_open() en cada request, igual que ya se hace con Octave.

set -e

cd "$(dirname "$0")/.."   # → python-backend/

if [ ! -x "venv/bin/python3" ]; then
    echo "[hostinger_build] Creando virtualenv..."
    python3 -m venv venv
fi

echo "[hostinger_build] Instalando dependencias..."
venv/bin/pip install --upgrade pip -q
venv/bin/pip install -q -r requirements.txt

echo "[hostinger_build] Verificando OpenSeesPy..."
venv/bin/python3 -c "import openseespy.opensees; print('[hostinger_build] OpenSeesPy OK')"

echo "[hostinger_build] Verificando cli_entry.py..."
echo '{}' | venv/bin/python3 cli_entry.py health
