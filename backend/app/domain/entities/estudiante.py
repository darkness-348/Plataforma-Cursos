from dataclasses import dataclass
from datetime import date, datetime
from typing import Optional

@dataclass
class Estudiante:
    id: Optional[int]
    cedula: str
    nombres: str
    apellidos: str
    correo: str
    telefono: Optional[str]
    carrera_id: int
    semestre_actual: int = 1
    estado: str = "Activo" # Activo, Inactivo, Suspendido, Graduado
    promedio_acumulado: float = 0.0
    creditos_aprobados: int = 0
    fecha_ingreso: Optional[date] = None
    fecha_creacion: Optional[datetime] = None

    @property
    def nombre_completo(self) -> str:
        return f"{self.nombres} {self.apellidos}"
