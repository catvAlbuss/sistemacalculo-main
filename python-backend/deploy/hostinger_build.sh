#!/bin/sh
# Se ejecuta una vez por deploy (pegar como "Build command" en hPanel → Git,
# o correr por SSH: `sh python-backend/deploy/hostinger_build.sh`).
# Idempotente: si el venv ya existe, no lo recrea; `pip install` es un no-op
# rápido cuando ya está satisfecho.
#
# Deja el motor listo en python-backend/venv/ (no se versiona, ver
# .gitignore) para que PythonEngineController::run() lo invoque vía
# proc_open() en cada request, igual que ya se hace con Octave.

set -e

cd "$(dirname "$0")/.."   # → python-backend/

# ── Localizar un intérprete Python 3 usable ──────────────────────────────
# En CloudLinux/Hostinger (hosting compartido) `python3` no está en el PATH;
# los intérpretes viven en /opt/alt/pythonXX/bin/python3. OpenSeesPy necesita
# 3.9–3.12 (wheels manylinux), así que se prefiere 3.11/3.12/3.10 y se
# descartan 3.7/3.8. PYTHON_BIN permite forzar una ruta si hiciera falta.
find_python() {
    if [ -n "$PYTHON_BIN" ] && [ -x "$PYTHON_BIN" ]; then
        echo "$PYTHON_BIN"; return 0
    fi
    for c in \
        /opt/alt/python312/bin/python3 \
        /opt/alt/python311/bin/python3 \
        /opt/alt/python310/bin/python3 \
        /opt/alt/python39/bin/python3 \
        "$(command -v python3 2>/dev/null || true)" \
        "$(command -v python 2>/dev/null || true)"
    do
        [ -n "$c" ] && [ -x "$c" ] && { echo "$c"; return 0; }
    done
    return 1
}

PYTHON="$(find_python)" || {
    echo "[hostinger_build] ERROR: no se encontró Python 3.9+ usable." >&2
    echo "[hostinger_build] Define PYTHON_BIN con la ruta correcta y reintenta." >&2
    exit 1
}
echo "[hostinger_build] Usando: $PYTHON ($("$PYTHON" --version 2>&1))"

if [ ! -x "venv/bin/python3" ]; then
    echo "[hostinger_build] Creando virtualenv..."
    "$PYTHON" -m venv venv
fi

echo "[hostinger_build] Instalando dependencias..."
venv/bin/pip install --upgrade pip -q
venv/bin/pip install -q -r requirements.txt

# OpenSeesPy necesita libblas.so.3, que viene DENTRO del propio paquete pip
# (openseespylinux/lib/) pero no está en el LD_LIBRARY_PATH del sistema. Se
# añade esa carpeta para que la verificación —y luego PythonEngineController—
# puedan cargar la extensión C++.
OPS_LIB="$(dirname "$(find venv -name 'libblas.so.3' -path '*openseespylinux*' 2>/dev/null | head -1)")"
if [ -n "$OPS_LIB" ]; then
    export LD_LIBRARY_PATH="$OPS_LIB${LD_LIBRARY_PATH:+:$LD_LIBRARY_PATH}"
    echo "[hostinger_build] LD_LIBRARY_PATH → $OPS_LIB"
fi

echo "[hostinger_build] Verificando OpenSeesPy..."
venv/bin/python3 -c "import openseespy.opensees; print('[hostinger_build] OpenSeesPy OK')"

echo "[hostinger_build] Verificando cli_entry.py..."
echo '{}' | venv/bin/python3 cli_entry.py health
echo
echo "[hostinger_build] Listo. Prueba: https://ryaie.com/api/backend/health"
