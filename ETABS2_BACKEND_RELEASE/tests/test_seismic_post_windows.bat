@echo off
cd /d "%~dp0"

echo ==========================================
echo Probando POST /api/seismic/analyze
echo ==========================================

if not exist "payload_seismic.json" (
    echo ERROR: No se encontro payload_seismic.json en la carpeta tests.
    echo Ruta actual:
    cd
    echo.
    pause
    exit /b 1
)

curl.exe -X POST http://127.0.0.1:5001/api/seismic/analyze ^
  -H "Content-Type: application/json" ^
  --data-binary "@payload_seismic.json" ^
  -o response_seismic_from_release.json

echo.
echo Respuesta guardada en:
echo %~dp0response_seismic_from_release.json

echo.
echo Buscando success true:
findstr /C:"\"success\": true" response_seismic_from_release.json
findstr /C:"\"success\":true" response_seismic_from_release.json

echo.
echo Prueba POST finalizada.
pause
