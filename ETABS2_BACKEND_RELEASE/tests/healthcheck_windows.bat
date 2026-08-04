@echo off
echo ==========================================
echo Probando ETABS 2 Backend API
echo ==========================================

echo.
echo [1] Probando /health
curl.exe http://127.0.0.1:5001/health

echo.
echo.
echo [2] Probando /api/opensees/status
curl.exe http://127.0.0.1:5001/api/opensees/status

echo.
echo.
echo Prueba finalizada.
pause
