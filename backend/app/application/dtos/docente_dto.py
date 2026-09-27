from pydantic import BaseModel, EmailStr, Field, computed_field
from datetime import datetime
from typing import Optional

class DocenteCrearDTO(BaseModel):
    dni: str = Field(..., min_length=5, max_length=20, description="DNI o Identificación del docente")
    nombres: str = Field(..., min_length=2, max_length=100)
    apellidos: str = Field(..., min_length=2, max_length=100)
    correo: EmailStr
    telefono: Optional[str] = Field(None, max_length=20)
    especialidad: str = Field(..., min_length=2, max_length=100)
    grado_academico: str = Field(..., min_length=2, max_length=50) # Licenciatura, Maestría, Doctorado, Ph.D.
    tipo_contrato: str = Field("Tiempo Completo", max_length=50)
    departamento: str = Field("Ingeniería", max_length=100)

class DocenteActualizarDTO(BaseModel):
    dni: Optional[str] = Field(None, min_length=5, max_length=20)
    nombres: Optional[str] = Field(None, min_length=2, max_length=100)
    apellidos: Optional[str] = Field(None, min_length=2, max_length=100)
    correo: Optional[EmailStr] = None
    telefono: Optional[str] = None
    especialidad: Optional[str] = None
    grado_academico: Optional[str] = None
    tipo_contrato: Optional[str] = None
    departamento: Optional[str] = None
    estado: Optional[str] = None

class DocenteRespuestaDTO(BaseModel):
    id: int
    dni: str
    nombres: str
    apellidos: str
    correo: str
    telefono: Optional[str] = None
    especialidad: str
    grado_academico: str
    tipo_contrato: str
    departamento: str
    estado: str
    fecha_creacion: Optional[datetime] = None

    @computed_field
    @property
    def nombre_completo(self) -> str:
        return f"{self.nombres} {self.apellidos}".strip()

    class Config:
        from_attributes = True
