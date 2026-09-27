from pydantic import BaseModel, EmailStr, Field, computed_field
from datetime import date, datetime
from typing import Optional
from app.application.dtos.carrera_dto import CarreraRespuestaDTO

class EstudianteCrearDTO(BaseModel):
    cedula: str = Field(..., min_length=5, max_length=20, description="Cédula o Código Estudiantil")
    nombres: str = Field(..., min_length=2, max_length=100)
    apellidos: str = Field(..., min_length=2, max_length=100)
    correo: EmailStr
    telefono: Optional[str] = Field(None, max_length=20)
    carrera_id: int = Field(..., description="ID de la carrera universitaria")
    semestre_actual: int = Field(1, ge=1, le=14)
    fecha_ingreso: Optional[date] = None

class EstudianteActualizarDTO(BaseModel):
    cedula: Optional[str] = Field(None, min_length=5, max_length=20)
    nombres: Optional[str] = Field(None, min_length=2, max_length=100)
    apellidos: Optional[str] = Field(None, min_length=2, max_length=100)
    correo: Optional[EmailStr] = None
    telefono: Optional[str] = None
    carrera_id: Optional[int] = None
    semestre_actual: Optional[int] = Field(None, ge=1, le=14)
    estado: Optional[str] = None

class EstudianteRespuestaDTO(BaseModel):
    id: int
    cedula: str
    nombres: str
    apellidos: str
    correo: str
    telefono: Optional[str] = None
    carrera_id: int
    carrera: Optional[CarreraRespuestaDTO] = None
    semestre_actual: int
    estado: str
    promedio_acumulado: float
    creditos_aprobados: int
    fecha_ingreso: Optional[date] = None
    fecha_creacion: Optional[datetime] = None

    @computed_field
    @property
    def nombre_completo(self) -> str:
        return f"{self.nombres} {self.apellidos}".strip()

    class Config:
        from_attributes = True
