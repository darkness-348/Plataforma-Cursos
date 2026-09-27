from abc import ABC, abstractmethod
from typing import List, Optional
from app.domain.entities.aula import Aula

class AulaRepositorio(ABC):

    @abstractmethod
    def obtener_todas(self, skip: int = 0, limit: int = 100) -> List[Aula]:
        pass

    @abstractmethod
    def obtener_por_id(self, id: int) -> Optional[Aula]:
        pass

    @abstractmethod
    def obtener_por_codigo(self, codigo: str) -> Optional[Aula]:
        pass

    @abstractmethod
    def crear(self, aula: Aula) -> Aula:
        pass

    @abstractmethod
    def actualizar(self, aula: Aula) -> Aula:
        pass

    @abstractmethod
    def eliminar(self, id: int) -> bool:
        pass
