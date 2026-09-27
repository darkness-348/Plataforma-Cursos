from dataclasses import dataclass
from datetime import datetime
from typing import Optional

@dataclass
class Asignatura:
    id: Optional[int]
    codigo: str # Ej: SIS-301
    nombre: str # Ej: Arquitectura Limpia & Patrones
    creditos: int
    carrera_id: int
    semestre_nivel: int = 1
    docente_id: Optional[int] = None
    periodo_academico: str = "2026-1"
    capacidad_maxima: int = 30
    estudiantes_inscritos: int = 0
    aula: Optional[str] = "Lab 102"
    horario: Optional[str] = "Lun/Mié 08:00 - 10:00"
    estado: str = "Abierto" # Abierto, Cerrado, Finalizado
    fecha_creacion: Optional[datetime] = None

    @property
    def esta_lleno(self) -> bool:
        return self.estudiantes_inscritos >= self.capacidad_maxima
