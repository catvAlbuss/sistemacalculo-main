@echo off
cd /d "%~dp0windows_exe\etabs2_backend"

echo ==========================================
echo ETABS 2 Backend API - Windows
echo ==========================================
echo.
echo Iniciando backend en:
echo http://127.0.0.1:5001
echo.
echo IMPORTANTE:
echo No cierres esta ventana mientras uses el sistema.
echo Para detener el backend, presiona Ctrl + C.
echo.
echo ==========================================
echo.

etabs2_backend.exe

echo.
echo Backend detenido.
pause
