from abc import ABC, abstractmethod
from typing import List, Optional
from app.domain.entities.matricula import Matricula

class MatriculaRepositorio(ABC):

    @abstractmethod
    def obtener_todas(self, skip: int = 0, limit: int = 100, estudiante_id: Optional[int] = None, asignatura_id: Optional[int] = None) -> List[Matricula]:
        pass

    @abstractmethod
    def obtener_por_id(self, matricula_id: int) -> Optional[Matricula]:
        pass

    @abstractmethod
    def obtener_por_estudiante_y_asignatura(self, estudiante_id: int, asignatura_id: int) -> Optional[Matricula]:
        pass

    @abstractmethod
    def crear(self, matricula: Matricula) -> Matricula:
        pass

    @abstractmethod
    def actualizar(self, matricula: Matricula) -> Matricula:
        pass

    @abstractmethod
    def eliminar(self, matricula_id: int) -> bool:
        pass

    @abstractmethod
    def contar(self) -> int:
        pass
