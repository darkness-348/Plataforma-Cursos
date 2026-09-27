from dataclasses import dataclass
from datetime import datetime
from typing import Optional

@dataclass
class Usuario:
    id: Optional[int]
    nombre_completo: str
    correo: str
    clave_hash: str
    rol: str # Administrador, Docente, Estudiante
    estudiante_id: Optional[int] = None
    docente_id: Optional[int] = None
    estado: str = "Activo"
    fecha_creacion: Optional[datetime] = None
