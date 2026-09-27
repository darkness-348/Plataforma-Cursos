from dataclasses import dataclass
from datetime import datetime
from typing import Optional

@dataclass
class Docente:
    id: Optional[int]
    dni: str
    nombres: str
    apellidos: str
    correo: str
    telefono: Optional[str]
    especialidad: str
    grado_academico: str # Licenciatura, Maestría, Doctorado, Ph.D.
    tipo_contrato: str = "Tiempo Completo" # Tiempo Completo, Medio Tiempo, Catedrático
    departamento: str = "Ingeniería"
    estado: str = "Activo"
    fecha_creacion: Optional[datetime] = None

    @property
    def nombre_completo(self) -> str:
        return f"{self.nombres} {self.apellidos}"
