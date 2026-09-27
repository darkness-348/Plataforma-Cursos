from pydantic import BaseModel, Field
from datetime import date, datetime
from typing import Optional
from app.application.dtos.estudiante_dto import EstudianteRespuestaDTO
from app.application.dtos.asignatura_dto import AsignaturaRespuestaDTO

class MatriculaCrearDTO(BaseModel):
    estudiante_id: int = Field(..., description="ID del estudiante")
    asignatura_id: int = Field(..., description="ID de la asignatura")
    fecha_matricula: Optional[date] = None

class MatriculaActualizarDTO(BaseModel):
    estado: Optional[str] = Field(None, description="Inscrito, Aprobado, Reprobado, Retirado")
    nota_primer_parcial: Optional[float] = Field(None, ge=0.0, le=100.0)
    nota_segundo_parcial: Optional[float] = Field(None, ge=0.0, le=100.0)
    nota_examen_final: Optional[float] = Field(None, ge=0.0, le=100.0)

class MatriculaRespuestaDTO(BaseModel):
    id: int
    estudiante_id: int
    asignatura_id: int
    fecha_matricula: date
    estado: str
    nota_primer_parcial: Optional[float] = None
    nota_segundo_parcial: Optional[float] = None
    nota_examen_final: Optional[float] = None
    nota_final: Optional[float] = None
    estudiante: Optional[EstudianteRespuestaDTO] = None
    asignatura: Optional[AsignaturaRespuestaDTO] = None
    fecha_creacion: Optional[datetime] = None

    class Config:
        from_attributes = True
