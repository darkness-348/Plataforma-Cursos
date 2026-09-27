from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional
from app.application.dtos.docente_dto import DocenteRespuestaDTO
from app.application.dtos.carrera_dto import CarreraRespuestaDTO

class AsignaturaCrearDTO(BaseModel):
    codigo: str = Field(..., min_length=2, max_length=20, description="Código de asignatura ex: SIS-301")
    nombre: str = Field(..., min_length=2, max_length=150)
    creditos: int = Field(..., ge=1, le=15)
    carrera_id: int = Field(..., description="ID de la carrera")
    semestre_nivel: int = Field(1, ge=1, le=14, description="Semestre académico perteneciente")
    docente_id: Optional[int] = None
    periodo_academico: str = Field("2026-1", max_length=20)
    capacidad_maxima: int = Field(30, ge=1, le=500)
    aula: Optional[str] = Field("Lab 102", max_length=50)
    horario: Optional[str] = Field("Lun/Mié 08:00 - 10:00", max_length=100)

class AsignaturaActualizarDTO(BaseModel):
    codigo: Optional[str] = Field(None, min_length=2, max_length=20)
    nombre: Optional[str] = Field(None, min_length=2, max_length=150)
    creditos: Optional[int] = Field(None, ge=1, le=15)
    carrera_id: Optional[int] = None
    semestre_nivel: Optional[int] = Field(None, ge=1, le=14)
    docente_id: Optional[int] = None
    periodo_academico: Optional[str] = None
    capacidad_maxima: Optional[int] = Field(None, ge=1, le=500)
    aula: Optional[str] = None
    horario: Optional[str] = None
    estado: Optional[str] = None

class AsignaturaRespuestaDTO(BaseModel):
    id: int
    codigo: str
    nombre: str
    creditos: int
    carrera_id: int
    semestre_nivel: int = 1
    carrera: Optional[CarreraRespuestaDTO] = None
    docente_id: Optional[int] = None
    docente: Optional[DocenteRespuestaDTO] = None
    periodo_academico: str
    capacidad_maxima: int
    estudiantes_inscritos: int
    aula: Optional[str] = None
    horario: Optional[str] = None
    estado: str
    fecha_creacion: Optional[datetime] = None

    class Config:
        from_attributes = True
