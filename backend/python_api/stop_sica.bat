@echo off
setlocal

echo [INFO] Cerrando procesos de SICA...
taskkill /FI "WINDOWTITLE eq SICA API*" /T /F >nul 2>nul
taskkill /FI "WINDOWTITLE eq SICA Frontend*" /T /F >nul 2>nul

echo [OK] Si estaban activos, ya fueron cerrados.
pause
