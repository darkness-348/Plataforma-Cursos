from dataclasses import dataclass
from datetime import datetime
from typing import Optional

@dataclass
class Carrera:
    id: Optional[int]
    codigo: str # Ej: ING-SIS
    nombre: str # Ej: Ingeniería de Sistemas
    facultad: str # Ej: Facultad de Ingeniería y Tecnología
    duracion_semestres: int = 10
    total_creditos: int = 220
    estado: str = "Activa"
    fecha_creacion: Optional[datetime] = None
