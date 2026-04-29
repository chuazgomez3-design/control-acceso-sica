@echo off
setlocal
cd /d "%~dp0"

if not exist ".venv\Scripts\python.exe" (
  echo [ERROR] No existe el entorno virtual en .venv
  echo Crea el entorno y ejecuta:
  echo   py -3 -m venv .venv
  echo   .venv\Scripts\python -m pip install -r backend\python_api\requirements.txt
  pause
  exit /b 1
)

echo [INFO] Iniciando API REST en nueva ventana...
start "SICA API" cmd /k ".venv\Scripts\python -m uvicorn backend.python_api.app:app --reload"

echo [INFO] Iniciando servidor frontend en nueva ventana...
start "SICA Frontend" cmd /k ".venv\Scripts\python -m http.server 5500"

echo.
echo [OK] SICA iniciado.
echo API:      http://127.0.0.1:8000/docs
echo Frontend: http://127.0.0.1:5500/frontend/views/iniciar_sesion.html
echo.
echo Usa stop_sica.bat para cerrar procesos.
pause
