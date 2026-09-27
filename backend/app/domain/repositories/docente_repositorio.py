from abc import ABC, abstractmethod
from typing import List, Optional
from app.domain.entities.docente import Docente

class DocenteRepositorio(ABC):

    @abstractmethod
    def obtener_todos(self, skip: int = 0, limit: int = 100, busqueda: Optional[str] = None) -> List[Docente]:
        pass

    @abstractmethod
    def obtener_por_id(self, docente_id: int) -> Optional[Docente]:
        pass

    @abstractmethod
    def obtener_por_dni(self, dni: str) -> Optional[Docente]:
        pass

    @abstractmethod
    def obtener_por_correo(self, correo: str) -> Optional[Docente]:
        pass

    @abstractmethod
    def crear(self, docente: Docente) -> Docente:
        pass

    @abstractmethod
    def actualizar(self, docente: Docente) -> Docente:
        pass

    @abstractmethod
    def eliminar(self, docente_id: int) -> bool:
        pass

    @abstractmethod
    def contar(self) -> int:
        pass
