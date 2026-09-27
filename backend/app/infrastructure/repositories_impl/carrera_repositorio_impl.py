from typing import List, Optional
from sqlalchemy.orm import Session
from app.domain.entities.carrera import Carrera
from app.domain.repositories.carrera_repositorio import CarreraRepositorio
from app.infrastructure.database.models.carrera_modelo import CarreraModelo

class CarreraRepositorioImpl(CarreraRepositorio):
    def __init__(self, bd: Session):
        self.bd = bd

    def _mapear_a_entidad(self, modelo: CarreraModelo) -> Carrera:
        return Carrera(
            id=modelo.id,
            codigo=modelo.codigo,
            nombre=modelo.nombre,
            facultad=modelo.facultad,
            duracion_semestres=modelo.duracion_semestres,
            total_creditos=modelo.total_creditos,
            estado=modelo.estado,
            fecha_creacion=modelo.fecha_creacion
        )

    def obtener_todas(self, skip: int = 0, limit: int = 100) -> List[Carrera]:
        modelos = self.bd.query(CarreraModelo).order_by(CarreraModelo.id.asc()).offset(skip).limit(limit).all()
        return [self._mapear_a_entidad(m) for m in modelos]

    def obtener_por_id(self, carrera_id: int) -> Optional[Carrera]:
        modelo = self.bd.query(CarreraModelo).filter(CarreraModelo.id == carrera_id).first()
        return self._mapear_a_entidad(modelo) if modelo else None

    def obtener_por_codigo(self, codigo: str) -> Optional[Carrera]:
        modelo = self.bd.query(CarreraModelo).filter(CarreraModelo.codigo == codigo).first()
        return self._mapear_a_entidad(modelo) if modelo else None

    def crear(self, carrera: Carrera) -> Carrera:
        modelo = CarreraModelo(
            codigo=carrera.codigo,
            nombre=carrera.nombre,
            facultad=carrera.facultad,
            duracion_semestres=carrera.duracion_semestres,
            total_creditos=carrera.total_creditos,
            estado=carrera.estado
        )
        self.bd.add(modelo)
        self.bd.commit()
        self.bd.refresh(modelo)
        return self._mapear_a_entidad(modelo)

    def actualizar(self, carrera: Carrera) -> Carrera:
        modelo = self.bd.query(CarreraModelo).filter(CarreraModelo.id == carrera.id).first()
        if modelo:
            modelo.codigo = carrera.codigo
            modelo.nombre = carrera.nombre
            modelo.facultad = carrera.facultad
            modelo.duracion_semestres = carrera.duracion_semestres
            modelo.total_creditos = carrera.total_creditos
            modelo.estado = carrera.estado
            self.bd.commit()
            self.bd.refresh(modelo)
            return self._mapear_a_entidad(modelo)
        return carrera

    def eliminar(self, carrera_id: int) -> bool:
        modelo = self.bd.query(CarreraModelo).filter(CarreraModelo.id == carrera_id).first()
        if modelo:
            self.bd.delete(modelo)
            self.bd.commit()
            return True
        return False

    def contar(self) -> int:
        return self.bd.query(CarreraModelo).count()
