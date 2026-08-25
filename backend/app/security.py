from pwdlib import PasswordHash
from jose import jwt
from datetime import datetime, timedelta
from fastapi.security import OAuth2PasswordBearer
import os
from pathlib import Path
from dotenv import load_dotenv


BASE_DIR = Path(__file__).resolve().parent.parent

load_dotenv(BASE_DIR / ".env")


password_hash = PasswordHash.recommended()


def crear_password_hash(password: str):
    return password_hash.hash(password)


def verificar_password(password: str, password_hash_guardado: str):
    return password_hash.verify(
        password,
        password_hash_guardado
    )
    
# =========================
# JWT
# =========================

SECRET_KEY = os.getenv("SECRET_KEY")

ALGORITHM = "HS256"


oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/login")

def crear_token_acceso(
    usuario_id: int,
    username: str,
    rol: str,
    profesional_id: int | None = None
):

    datos = {
        "sub": str(usuario_id),
        "username": username,
        "rol": rol,
        "profesional_id": profesional_id,
        "exp": datetime.utcnow() + timedelta(hours=8)
    }

    token = jwt.encode(
        datos,
        SECRET_KEY,
        algorithm=ALGORITHM
    )

    return token