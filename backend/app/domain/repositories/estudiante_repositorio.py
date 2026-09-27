from abc import ABC, abstractmethod
from typing import List, Optional
from app.domain.entities.estudiante import Estudiante

class EstudianteRepositorio(ABC):

    @abstractmethod
    def obtener_todos(self, skip: int = 0, limit: int = 100, busqueda: Optional[str] = None, carrera_id: Optional[int] = None) -> List[Estudiante]:
        pass

    @abstractmethod
    def obtener_por_id(self, estudiante_id: int) -> Optional[Estudiante]:
        pass

    @abstractmethod
    def obtener_por_cedula(self, cedula: str) -> Optional[Estudiante]:
        pass

    @abstractmethod
    def obtener_por_correo(self, correo: str) -> Optional[Estudiante]:
        pass

    @abstractmethod
    def crear(self, estudiante: Estudiante) -> Estudiante:
        pass

    @abstractmethod
    def actualizar(self, estudiante: Estudiante) -> Estudiante:
        pass

    @abstractmethod
    def eliminar(self, estudiante_id: int) -> bool:
        pass

    @abstractmethod
    def contar(self) -> int:
        pass
