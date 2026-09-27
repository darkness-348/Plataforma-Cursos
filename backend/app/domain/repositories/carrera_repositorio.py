from abc import ABC, abstractmethod
from typing import List, Optional
from app.domain.entities.carrera import Carrera

class CarreraRepositorio(ABC):

    @abstractmethod
    def obtener_todas(self, skip: int = 0, limit: int = 100) -> List[Carrera]:
        pass

    @abstractmethod
    def obtener_por_id(self, carrera_id: int) -> Optional[Carrera]:
        pass

    @abstractmethod
    def obtener_por_codigo(self, codigo: str) -> Optional[Carrera]:
        pass

    @abstractmethod
    def crear(self, carrera: Carrera) -> Carrera:
        pass

    @abstractmethod
    def actualizar(self, carrera: Carrera) -> Carrera:
        pass

    @abstractmethod
    def eliminar(self, carrera_id: int) -> bool:
        pass

    @abstractmethod
    def contar(self) -> int:
        pass
