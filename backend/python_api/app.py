import base64
import hashlib
import io
import os
import secrets
from datetime import datetime
from typing import Any

import pymysql
from fastapi import Depends, FastAPI, Header, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, EmailStr, Field
import face_recognition


DB_HOST = os.getenv("DB_HOST", "localhost")
DB_PORT = int(os.getenv("DB_PORT", "3306"))
DB_USER = os.getenv("DB_USER", "root")
DB_PASSWORD = os.getenv("DB_PASSWORD", "")
DB_NAME = os.getenv("DB_NAME", "sica")

app = FastAPI(title="SICA REST API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

TOKENS: dict[str, dict[str, Any]] = {}


def get_conn():
    return pymysql.connect(
        host=DB_HOST,
        port=DB_PORT,
        user=DB_USER,
        password=DB_PASSWORD,
        database=DB_NAME,
        cursorclass=pymysql.cursors.DictCursor,
        autocommit=True,
        charset="utf8mb4",
    )


def decode_data_url(value: str) -> bytes:
    encoded = value.split(",", 1)[1] if "," in value else value
    return base64.b64decode(encoded)


class LoginPayload(BaseModel):
    correo: EmailStr
    password: str = Field(min_length=1)


class RegisterEmployeePayload(BaseModel):
    nombre: str
    apellido: str
    direccion: str
    correo: EmailStr
    id_administrador: int
    fotos: list[str] = Field(default_factory=list, max_length=5)


class ValidateAccessPayload(BaseModel):
    id_empleado: int
    imagen: str
    tipo_acceso: str = "Entrada"


def auth_guard(authorization: str | None = Header(default=None)):
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Token inválido o ausente.")
    token = authorization.replace("Bearer ", "", 1).strip()
    if token not in TOKENS:
        raise HTTPException(status_code=401, detail="Sesión expirada.")
    return TOKENS[token]


def get_face_encoding(image_bytes: bytes):
    if face_recognition is None:
        raise HTTPException(
            status_code=500,
            detail="Falta dependencia 'face_recognition'. Instálala para habilitar validación facial.",
        )
    image = face_recognition.load_image_file(io.BytesIO(image_bytes))
    encodings = face_recognition.face_encodings(image)
    if not encodings:
        return None
    return encodings[0]


@app.get("/api/health")
def health():
    return {"status": "ok"}


@app.post("/api/auth/login")
def login(payload: LoginPayload):
    password_hash = hashlib.sha512(payload.password.encode("utf-8")).hexdigest()
    with get_conn() as conn:
        with conn.cursor() as cur:
            cur.execute(
                """
                SELECT id_administrador, correo
                FROM administrador
                WHERE correo = %s AND contrasena = %s
                LIMIT 1
                """,
                (payload.correo, password_hash),
            )
            user = cur.fetchone()
    if not user:
        raise HTTPException(status_code=401, detail="Credenciales inválidas.")
    token = secrets.token_urlsafe(32)
    TOKENS[token] = {"id_administrador": user["id_administrador"], "correo": user["correo"]}
    return {"status": "success", "token": token, "admin": TOKENS[token]}


@app.post("/api/auth/logout")
def logout(session=Depends(auth_guard), authorization: str | None = Header(default=None)):
    if authorization is None:
        raise HTTPException(status_code=401, detail="Token inválido o ausente.")
    token = authorization.replace("Bearer ", "", 1).strip()
    TOKENS.pop(token, None)
    return {"status": "success", "message": "Sesión cerrada."}


@app.get("/api/accesos")
def get_accesos(session=Depends(auth_guard)):
    with get_conn() as conn:
        with conn.cursor() as cur:
            cur.execute(
                """
                SELECT
                    a.id_acceso,
                    CONCAT(e.nombre, ' ', e.apellido) AS empleado,
                    a.tipo_acceso,
                    DATE_FORMAT(a.fecha_hora, '%%d/%%m/%%Y %%H:%%i:%%s') AS fecha_hora
                FROM accesos a
                INNER JOIN empleados e ON a.id_empleado = e.id_empleado
                ORDER BY a.fecha_hora DESC
                """
            )
            rows = cur.fetchall()
    return rows


@app.get("/api/empleados")
def get_empleados(session=Depends(auth_guard)):
    with get_conn() as conn:
        with conn.cursor() as cur:
            cur.execute(
                """
                SELECT id_empleado, nombre, apellido, correo, direccion, fecha_registro
                FROM empleados
                ORDER BY id_empleado DESC
                """
            )
            rows = cur.fetchall()
    return rows


@app.post("/api/empleados")
def register_employee(payload: RegisterEmployeePayload, session=Depends(auth_guard)):
    fotos_bin: list[bytes | None] = [None, None, None, None, None]
    for idx, photo in enumerate(payload.fotos[:5]):
        fotos_bin[idx] = decode_data_url(photo)

    with get_conn() as conn:
        with conn.cursor() as cur:
            cur.execute(
                """
                INSERT INTO empleados
                (id_administrador, nombre, apellido, direccion, correo, foto1, foto2, foto3, foto4, foto5, fecha_registro)
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                """,
                (
                    payload.id_administrador,
                    payload.nombre,
                    payload.apellido,
                    payload.direccion,
                    payload.correo,
                    fotos_bin[0],
                    fotos_bin[1],
                    fotos_bin[2],
                    fotos_bin[3],
                    fotos_bin[4],
                    datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
                ),
            )
    return {"status": "success", "message": "Empleado registrado correctamente."}


@app.post("/api/accesos/validar")
def validate_access(payload: ValidateAccessPayload, session=Depends(auth_guard)):
    if payload.tipo_acceso not in ("Entrada", "Salida"):
        raise HTTPException(status_code=400, detail="tipo_acceso debe ser Entrada o Salida.")
    try:
        probe_encoding = get_face_encoding(decode_data_url(payload.imagen))
    except HTTPException:
        raise
    except Exception:
        raise HTTPException(status_code=400, detail="No se pudo procesar la imagen enviada.")
    if probe_encoding is None:
        return {"status": "fail", "message": "No se detectó rostro en la imagen capturada."}

    with get_conn() as conn:
        with conn.cursor() as cur:
            cur.execute(
                """
                SELECT id_empleado, foto1, foto2, foto3, foto4, foto5
                FROM empleados
                WHERE id_empleado = %s
                LIMIT 1
                """,
                (payload.id_empleado,),
            )
            empleado = cur.fetchone()
            if not empleado:
                return {"status": "fail", "message": "Empleado no encontrado"}

            match_found = False
            for key in ("foto1", "foto2", "foto3", "foto4", "foto5"):
                foto_db = empleado.get(key)
                if not foto_db:
                    continue
                reference_encoding = get_face_encoding(foto_db)
                if reference_encoding is None:
                    continue
                distance = face_recognition.face_distance([reference_encoding], probe_encoding)[0]
                if distance <= 0.5:
                    match_found = True
                    break

            if not match_found:
                return {"status": "fail", "message": "Acceso denegado: rostro no coincide."}

            cur.execute(
                "INSERT INTO accesos (id_empleado, tipo_acceso) VALUES (%s, %s)",
                (payload.id_empleado, payload.tipo_acceso),
            )
    return {"status": "success", "message": "Acceso permitido"}


@app.get("/api/reportes/accesos")
def report_accesos(
    fecha_inicio: str = Query(..., description="Formato YYYY-MM-DD"),
    fecha_fin: str = Query(..., description="Formato YYYY-MM-DD"),
    id_empleado: int | None = Query(default=None),
    session=Depends(auth_guard),
):
    filters = ["DATE(a.fecha_hora) BETWEEN %s AND %s"]
    params: list[Any] = [fecha_inicio, fecha_fin]

    if id_empleado:
        filters.append("a.id_empleado = %s")
        params.append(id_empleado)

    where_clause = " AND ".join(filters)
    with get_conn() as conn:
        with conn.cursor() as cur:
            cur.execute(
                f"""
                SELECT
                    a.id_acceso,
                    a.id_empleado,
                    CONCAT(e.nombre, ' ', e.apellido) AS empleado,
                    a.tipo_acceso,
                    DATE_FORMAT(a.fecha_hora, '%%d/%%m/%%Y %%H:%%i:%%s') AS fecha_hora
                FROM accesos a
                INNER JOIN empleados e ON a.id_empleado = e.id_empleado
                WHERE {where_clause}
                ORDER BY a.fecha_hora DESC
                """,
                tuple(params),
            )
            rows = cur.fetchall()
    return {"status": "success", "total": len(rows), "rows": rows}
