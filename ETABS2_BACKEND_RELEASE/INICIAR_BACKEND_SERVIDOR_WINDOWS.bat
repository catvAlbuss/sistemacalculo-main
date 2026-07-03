@echo off
cd /d "%~dp0"

if not exist logs mkdir logs

echo ========================================== >> logs\backend_start.log
echo Inicio del backend: %date% %time% >> logs\backend_start.log
echo Ruta release: %~dp0 >> logs\backend_start.log
echo ========================================== >> logs\backend_start.log

cd /d "%~dp0windows_exe\etabs2_backend"

etabs2_backend.exe >> "%~dp0logs\backend_runtime.log" 2>&1
