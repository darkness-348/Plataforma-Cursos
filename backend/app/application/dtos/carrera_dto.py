from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional

class CarreraCrearDTO(BaseModel):
    codigo: str = Field(..., min_length=2, max_length=20, description="Código de carrera (Ej: ING-SIS)")
    nombre: str = Field(..., min_length=3, max_length=150)
    facultad: str = Field(..., min_length=3, max_length=150)
    duracion_semestres: int = Field(10, ge=1, le=14)
    total_creditos: int = Field(220, ge=50, le=400)

class CarreraActualizarDTO(BaseModel):
    codigo: Optional[str] = Field(None, min_length=2, max_length=20)
    nombre: Optional[str] = Field(None, min_length=3, max_length=150)
    facultad: Optional[str] = Field(None, min_length=3, max_length=150)
    duracion_semestres: Optional[int] = Field(None, ge=1, le=14)
    total_creditos: Optional[int] = Field(None, ge=50, le=400)
    estado: Optional[str] = None

class CarreraRespuestaDTO(BaseModel):
    id: int
    codigo: str
    nombre: str
    facultad: str
    duracion_semestres: int
    total_creditos: int
    estado: str
    fecha_creacion: Optional[datetime] = None

    class Config:
        from_attributes = True
