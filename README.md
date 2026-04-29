
# SICA

El proyecto ya no usa PHP. El backend es una API REST en Python con FastAPI y el frontend consume esa API con `fetch`.

## Backend

- `backend/python_api/app.py`: API REST completa (auth, empleados, accesos, reportes, validación facial)
- `backend/python_api/requirements.txt`: dependencias Python

Endpoints principales:

- `POST /api/auth/login`
- `POST /api/auth/logout`
- `GET /api/empleados`
- `POST /api/empleados`
- `GET /api/accesos`
- `POST /api/accesos/validar`
- `GET /api/reportes/accesos`

## Frontend

- `frontend/views/*.html`: vistas sin PHP
- `frontend/assets/js/api.js`: cliente base para consumir la API
- `frontend/assets/js/auth.js`: protección de rutas por token
- `frontend/views/acceso_facial.html`: validación facial en vivo
- `frontend/assets/js/reportes.js`: consulta de reportes por rango de fechas

## Ejecutar

1. Crear entorno e instalar dependencias:
   - `pip install -r backend/python_api/requirements.txt`
   - (Opcional para validación facial estricta) `pip install -r backend/python_api/requirements-face.txt`
2. Levantar API:
   - `uvicorn backend.python_api.app:app --reload`
3. Abrir frontend:
   - `frontend/views/iniciar_sesion.html`

## Inicio rápido en Windows

- Doble clic en `start_sica.bat` para abrir API y frontend automáticamente.
- Doble clic en `stop_sica.bat` para cerrar ambas ventanas.

## Variables de entorno opcionales

- `DB_HOST` (default `localhost`)
- `DB_PORT` (default `3306`)
- `DB_USER` (default `root`)
- `DB_PASSWORD` (default vacío)
- `DB_NAME` (default `sica`)
- `FACE_RECOGNITION_REQUIRED` (`true/false`, default `false`)

Puedes copiar `.env.example` a `.env` y ajustar valores según tu entorno.

Con `FACE_RECOGNITION_REQUIRED=false`, si no está instalada la librería de reconocimiento facial, el sistema sigue operando en modo degradado y registra accesos sin comparación biométrica.
