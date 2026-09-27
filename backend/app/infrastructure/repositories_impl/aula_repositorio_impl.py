from typing import List, Optional
from sqlalchemy.orm import Session
from app.domain.entities.aula import Aula
from app.domain.repositories.aula_repositorio import AulaRepositorio
from app.infrastructure.database.models.aula_modelo import AulaModelo

class AulaRepositorioImpl(AulaRepositorio):

    def __init__(self, db: Session):
        self.db = db

    def _mapear_a_entidad(self, modelo: AulaModelo) -> Aula:
        return Aula(
            id=modelo.id,
            codigo=modelo.codigo,
            nombre=modelo.nombre,
            edificio=modelo.edificio,
            capacidad_maxima=modelo.capacidad_maxima,
            tipo=modelo.tipo,
            estado=modelo.estado,
            fecha_creacion=modelo.fecha_creacion
        )

    def obtener_todas(self, skip: int = 0, limit: int = 100) -> List[Aula]:
        modelos = self.db.query(AulaModelo).offset(skip).limit(limit).all()
        return [self._mapear_a_entidad(m) for m in modelos]

    def obtener_por_id(self, id: int) -> Optional[Aula]:
        modelo = self.db.query(AulaModelo).filter(AulaModelo.id == id).first()
        return self._mapear_a_entidad(modelo) if modelo else None

    def obtener_por_codigo(self, codigo: str) -> Optional[Aula]:
        modelo = self.db.query(AulaModelo).filter(AulaModelo.codigo == codigo).first()
        return self._mapear_a_entidad(modelo) if modelo else None

    def crear(self, aula: Aula) -> Aula:
        modelo = AulaModelo(
            codigo=aula.codigo,
            nombre=aula.nombre,
            edificio=aula.edificio,
            capacidad_maxima=aula.capacidad_maxima,
            tipo=aula.tipo,
            estado=aula.estado
        )
        self.db.add(modelo)
        self.db.commit()
        self.db.refresh(modelo)
        return self._mapear_a_entidad(modelo)

    def actualizar(self, aula: Aula) -> Aula:
        modelo = self.db.query(AulaModelo).filter(AulaModelo.id == aula.id).first()
        if modelo:
            modelo.codigo = aula.codigo
            modelo.nombre = aula.nombre
            modelo.edificio = aula.edificio
            modelo.capacidad_maxima = aula.capacidad_maxima
            modelo.tipo = aula.tipo
            modelo.estado = aula.estado
            self.db.commit()
            self.db.refresh(modelo)
            return self._mapear_a_entidad(modelo)
        return aula

    def eliminar(self, id: int) -> bool:
        modelo = self.db.query(AulaModelo).filter(AulaModelo.id == id).first()
        if modelo:
            self.db.delete(modelo)
            self.db.commit()
            return True
        return False
