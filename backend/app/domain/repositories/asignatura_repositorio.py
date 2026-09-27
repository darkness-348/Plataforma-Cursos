from abc import ABC, abstractmethod
from typing import List, Optional
from app.domain.entities.asignatura import Asignatura

class AsignaturaRepositorio(ABC):

    @abstractmethod
    def obtener_todas(self, skip: int = 0, limit: int = 100, busqueda: Optional[str] = None, periodo: Optional[str] = None, carrera_id: Optional[int] = None, docente_id: Optional[int] = None) -> List[Asignatura]:
        pass

    @abstractmethod
    def obtener_por_id(self, asignatura_id: int) -> Optional[Asignatura]:
        pass

    @abstractmethod
    def obtener_por_codigo(self, codigo: str) -> Optional[Asignatura]:
        pass

    @abstractmethod
    def crear(self, asignatura: Asignatura) -> Asignatura:
        pass

    @abstractmethod
    def actualizar(self, asignatura: Asignatura) -> Asignatura:
        pass

    @abstractmethod
    def eliminar(self, asignatura_id: int) -> bool:
        pass

    @abstractmethod
    def contar(self) -> int:
        pass
