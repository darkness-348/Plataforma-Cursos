import os
from pydantic_settings import BaseSettings

class Configuracion(BaseSettings):
    NOMBRE_PROYECTO: str = "Sistema de Gestión Académica Universitaria"
    PREFIX_API_V1: str = "/api/v1"
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./academico.db")

    class Config:
        case_sensitive = True

configuracion = Configuracion()
