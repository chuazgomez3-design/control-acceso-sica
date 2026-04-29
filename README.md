# SICA
Sistema orientado a mejorar la seguridad, trazabilidad y automatización del flujo de personal, integración de tecnologías HTML, JavaScript, Python y MySQL con visión artificial para identificación en tiempo real, registro preciso de accesos y asistencia, reduciendo riesgos y fortaleciendo la gestión administrativa.

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

- `DB_HOST` (default `nombre_host`)
- `DB_PORT` (default `puerto`)
- `DB_USER` (default `usuario_db`)
- `DB_PASSWORD` (default vacío)
- `DB_NAME` (default `nombre_db`)
- `FACE_RECOGNITION_REQUIRED` (`true/false`, default `false`)

Puedes y ajustar valores según tu entorno `.env`.

Con `FACE_RECOGNITION_REQUIRED=false`, si no está instalada la librería de reconocimiento facial, el sistema sigue operando en modo degradado y registra accesos sin comparación biométrica.
<img width="3840" height="1080" alt="login" src="https://github.com/user-attachments/assets/9efabe40-914b-4c09-a36d-663882736689" />
<img width="1900" height="980" alt="funcionalidad_api_rest" src="https://github.com/user-attachments/assets/c42f6b7d-47c7-4f4f-91e6-fb0514514bb2" />
<img width="1820" height="886" alt="api_rest" src="https://github.com/user-attachments/assets/7449bff9-02bc-40a6-96ec-a2dad4bffa5e" />
<img width="3840" height="1080" alt="acceso_sica" src="https://github.com/user-attachments/assets/9f3a2aa0-9958-4ad9-90f3-2a0733e88a8a" />
