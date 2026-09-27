from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class AulaCrearDTO(BaseModel):
    codigo: str
    nombre: str
    edificio: str
    capacidad_maxima: int
    tipo: str = "Aula Teórica"
    estado: str = "Disponible"

class AulaActualizarDTO(BaseModel):
    codigo: Optional[str] = None
    nombre: Optional[str] = None
    edificio: Optional[str] = None
    capacidad_maxima: Optional[int] = None
    tipo: Optional[str] = None
    estado: Optional[str] = None

class AulaRespuestaDTO(BaseModel):
    id: int
    codigo: str
    nombre: str
    edificio: str
    capacidad_maxima: int
    tipo: str
    estado: str
    fecha_creacion: Optional[datetime] = None

    class Config:
        from_attributes = True
