from typing import Optional
from datetime import datetime

class Aula:
    def __init__(
        self,
        id: Optional[int],
        codigo: str,
        nombre: str,
        edificio: str,
        capacidad_maxima: int,
        tipo: str = "Aula Teórica",
        estado: str = "Disponible",
        fecha_creacion: Optional[datetime] = None
    ):
        self.id = id
        self.codigo = codigo
        self.nombre = nombre
        self.edificio = edificio
        self.capacidad_maxima = capacidad_maxima
        self.tipo = tipo
        self.estado = estado
        self.fecha_creacion = fecha_creacion
