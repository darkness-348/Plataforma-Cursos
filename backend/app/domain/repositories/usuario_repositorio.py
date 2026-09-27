from abc import ABC, abstractmethod
from typing import List, Optional
from app.domain.entities.usuario import Usuario

class UsuarioRepositorio(ABC):

    @abstractmethod
    def obtener_todos(self, skip: int = 0, limit: int = 100) -> List[Usuario]:
        pass

    @abstractmethod
    def obtener_por_id(self, usuario_id: int) -> Optional[Usuario]:
        pass

    @abstractmethod
    def obtener_por_correo(self, correo: str) -> Optional[Usuario]:
        pass

    @abstractmethod
    def crear(self, usuario: Usuario) -> Usuario:
        pass

    @abstractmethod
    def actualizar(self, usuario: Usuario) -> Usuario:
        pass

    @abstractmethod
    def eliminar(self, usuario_id: int) -> bool:
        pass
