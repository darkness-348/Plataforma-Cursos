from pydantic import BaseModel, EmailStr, Field
from datetime import datetime
from typing import Optional

class UsuarioRegistroDTO(BaseModel):
    nombre_completo: str = Field(..., min_length=2, max_length=150)
    correo: EmailStr
    clave: str = Field(..., min_length=6, max_length=100)
    rol: str = Field("Estudiante", description="Administrador, Docente, Estudiante")
    cedula_o_dni: Optional[str] = Field(None, description="Cédula o DNI para vincular expediente")
    carrera_id: Optional[int] = Field(None, description="ID de la carrera si es estudiante")

class UsuarioLoginDTO(BaseModel):
    correo: EmailStr
    clave: str

class UsuarioRespuestaDTO(BaseModel):
    id: int
    nombre_completo: str
    correo: str
    rol: str
    estudiante_id: Optional[int] = None
    docente_id: Optional[int] = None
    estado: str
    fecha_creacion: Optional[datetime] = None

    class Config:
        from_attributes = True

class TokenRespuestaDTO(BaseModel):
    access_token: str
    token_type: str = "bearer"
    usuario: UsuarioRespuestaDTO
