import jwt
import bcrypt
from datetime import datetime, timedelta, timezone
from typing import Optional, Dict, Any
from app.domain.excepciones import ReglaNegocioExcepcion

CLAVE_SECRETA_JWT = "ACADEMISYS_UNIVERSIDAD_SECRET_KEY_JWT_2026_SEGURA"
ALGORITMO_JWT = "HS256"
TIEMPO_EXPIRACION_HORAS = 24

def obtener_hash_clave(clave: str) -> str:
    clave_bytes = clave.encode('utf-8')
    sal = bcrypt.gensalt()
    hash_bytes = bcrypt.hashpw(clave_bytes, sal)
    return hash_bytes.decode('utf-8')

def verificar_clave(clave_plana: str, clave_hash: str) -> bool:
    clave_bytes = clave_plana.encode('utf-8')
    hash_bytes = clave_hash.encode('utf-8')
    return bcrypt.checkpw(clave_bytes, hash_bytes)

def crear_token_jwt(datos: Dict[str, Any], tiempo_expiracion: Optional[timedelta] = None) -> str:
    para_codificar = datos.copy()
    expiracion = datetime.now(timezone.utc) + (tiempo_expiracion or timedelta(hours=TIEMPO_EXPIRACION_HORAS))
    para_codificar.update({"exp": expiracion})
    return jwt.encode(para_codificar, CLAVE_SECRETA_JWT, algorithm=ALGORITMO_JWT)

def descodificar_token_jwt(token: str) -> Dict[str, Any]:
    try:
        payload = jwt.decode(token, CLAVE_SECRETA_JWT, algorithms=[ALGORITMO_JWT])
        return payload
    except jwt.ExpiredSignatureError:
        raise ReglaNegocioExcepcion("El token de sesión ha expirado. Por favor inicie sesión nuevamente.")
    except jwt.InvalidTokenError:
        raise ReglaNegocioExcepcion("Token de autenticación no válido.")
