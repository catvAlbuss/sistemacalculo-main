@echo off
cd /d "%~dp0"

echo ==========================================
echo PRUEBA GENERAL - ETABS 2 Backend API
echo ==========================================
echo.

echo [1] Probando GET /health
curl.exe http://127.0.0.1:5001/health

echo.
echo.
echo [2] Probando GET /api/opensees/status
curl.exe http://127.0.0.1:5001/api/opensees/status

echo.
echo.
echo [3] Probando POST /api/seismic/analyze
cd /d "%~dp0tests"

curl.exe -X POST http://127.0.0.1:5001/api/seismic/analyze ^
  -H "Content-Type: application/json" ^
  --data-binary "@payload_seismic.json" ^
  -o response_seismic_from_release.json

echo.
echo Respuesta POST guardada en:
echo tests\response_seismic_from_release.json
echo.

echo Validacion rapida:
python -c "import json; d=json.load(open('response_seismic_from_release.json', encoding='utf-8')); print('success:', d.get('success')); print('keys:', list(d.keys()))"

echo.
echo ==========================================
echo PRUEBA FINALIZADA
echo ==========================================
pause
