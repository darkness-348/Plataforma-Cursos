from typing import List, Optional
from sqlalchemy.orm import Session
from app.domain.entities.usuario import Usuario
from app.domain.repositories.usuario_repositorio import UsuarioRepositorio
from app.infrastructure.database.models.usuario_modelo import UsuarioModelo

class UsuarioRepositorioImpl(UsuarioRepositorio):
    def __init__(self, bd: Session):
        self.bd = bd

    def _mapear_a_entidad(self, modelo: UsuarioModelo) -> Usuario:
        return Usuario(
            id=modelo.id,
            nombre_completo=modelo.nombre_completo,
            correo=modelo.correo,
            clave_hash=modelo.clave_hash,
            rol=modelo.rol,
            estudiante_id=modelo.estudiante_id,
            docente_id=modelo.docente_id,
            estado=modelo.estado,
            fecha_creacion=modelo.fecha_creacion
        )

    def obtener_todos(self, skip: int = 0, limit: int = 100) -> List[Usuario]:
        modelos = self.bd.query(UsuarioModelo).order_by(UsuarioModelo.id.desc()).offset(skip).limit(limit).all()
        return [self._mapear_a_entidad(m) for m in modelos]

    def obtener_por_id(self, usuario_id: int) -> Optional[Usuario]:
        modelo = self.bd.query(UsuarioModelo).filter(UsuarioModelo.id == usuario_id).first()
        return self._mapear_a_entidad(modelo) if modelo else None

    def obtener_por_correo(self, correo: str) -> Optional[Usuario]:
        modelo = self.bd.query(UsuarioModelo).filter(UsuarioModelo.correo == correo).first()
        return self._mapear_a_entidad(modelo) if modelo else None

    def crear(self, usuario: Usuario) -> Usuario:
        modelo = UsuarioModelo(
            nombre_completo=usuario.nombre_completo,
            correo=usuario.correo,
            clave_hash=usuario.clave_hash,
            rol=usuario.rol,
            estudiante_id=usuario.estudiante_id,
            docente_id=usuario.docente_id,
            estado=usuario.estado
        )
        self.bd.add(modelo)
        self.bd.commit()
        self.bd.refresh(modelo)
        return self._mapear_a_entidad(modelo)

    def actualizar(self, usuario: Usuario) -> Usuario:
        modelo = self.bd.query(UsuarioModelo).filter(UsuarioModelo.id == usuario.id).first()
        if modelo:
            modelo.nombre_completo = usuario.nombre_completo
            modelo.correo = usuario.correo
            modelo.clave_hash = usuario.clave_hash
            modelo.rol = usuario.rol
            modelo.estudiante_id = usuario.estudiante_id
            modelo.docente_id = usuario.docente_id
            modelo.estado = usuario.estado
            self.bd.commit()
            self.bd.refresh(modelo)
            return self._mapear_a_entidad(modelo)
        return usuario

    def eliminar(self, usuario_id: int) -> bool:
        modelo = self.bd.query(UsuarioModelo).filter(UsuarioModelo.id == usuario_id).first()
        if modelo:
            self.bd.delete(modelo)
            self.bd.commit()
            return True
        return False
