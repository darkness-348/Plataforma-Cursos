from typing import List, Optional
from sqlalchemy.orm import Session
from sqlalchemy import or_
from app.domain.entities.estudiante import Estudiante
from app.domain.repositories.estudiante_repositorio import EstudianteRepositorio
from app.infrastructure.database.models.estudiante_modelo import EstudianteModelo

class EstudianteRepositorioImpl(EstudianteRepositorio):
    def __init__(self, bd: Session):
        self.bd = bd

    def _mapear_a_entidad(self, modelo: EstudianteModelo) -> Estudiante:
        return Estudiante(
            id=modelo.id,
            cedula=modelo.cedula,
            nombres=modelo.nombres,
            apellidos=modelo.apellidos,
            correo=modelo.correo,
            telefono=modelo.telefono,
            carrera_id=modelo.carrera_id,
            semestre_actual=modelo.semestre_actual,
            estado=modelo.estado,
            promedio_acumulado=modelo.promedio_acumulado,
            creditos_aprobados=modelo.creditos_aprobados,
            fecha_ingreso=modelo.fecha_ingreso,
            fecha_creacion=modelo.fecha_creacion
        )

    def obtener_todos(self, skip: int = 0, limit: int = 100, busqueda: Optional[str] = None, carrera_id: Optional[int] = None) -> List[Estudiante]:
        consulta = self.bd.query(EstudianteModelo)
        if busqueda:
            patron = f"%{busqueda}%"
            consulta = consulta.filter(
                or_(
                    EstudianteModelo.nombres.ilike(patron),
                    EstudianteModelo.apellidos.ilike(patron),
                    EstudianteModelo.cedula.ilike(patron),
                    EstudianteModelo.correo.ilike(patron)
                )
            )
        if carrera_id:
            consulta = consulta.filter(EstudianteModelo.carrera_id == carrera_id)
        modelos = consulta.order_by(EstudianteModelo.id.desc()).offset(skip).limit(limit).all()
        return [self._mapear_a_entidad(m) for m in modelos]

    def obtener_por_id(self, estudiante_id: int) -> Optional[Estudiante]:
        modelo = self.bd.query(EstudianteModelo).filter(EstudianteModelo.id == estudiante_id).first()
        return self._mapear_a_entidad(modelo) if modelo else None

    def obtener_por_cedula(self, cedula: str) -> Optional[Estudiante]:
        modelo = self.bd.query(EstudianteModelo).filter(EstudianteModelo.cedula == cedula).first()
        return self._mapear_a_entidad(modelo) if modelo else None

    def obtener_por_correo(self, correo: str) -> Optional[Estudiante]:
        modelo = self.bd.query(EstudianteModelo).filter(EstudianteModelo.correo == correo).first()
        return self._mapear_a_entidad(modelo) if modelo else None

    def crear(self, estudiante: Estudiante) -> Estudiante:
        modelo = EstudianteModelo(
            cedula=estudiante.cedula,
            nombres=estudiante.nombres,
            apellidos=estudiante.apellidos,
            correo=estudiante.correo,
            telefono=estudiante.telefono,
            carrera_id=estudiante.carrera_id,
            semestre_actual=estudiante.semestre_actual,
            estado=estudiante.estado,
            promedio_acumulado=estudiante.promedio_acumulado,
            creditos_aprobados=estudiante.creditos_aprobados,
            fecha_ingreso=estudiante.fecha_ingreso
        )
        self.bd.add(modelo)
        self.bd.commit()
        self.bd.refresh(modelo)
        return self._mapear_a_entidad(modelo)

    def actualizar(self, estudiante: Estudiante) -> Estudiante:
        modelo = self.bd.query(EstudianteModelo).filter(EstudianteModelo.id == estudiante.id).first()
        if modelo:
            modelo.cedula = estudiante.cedula
            modelo.nombres = estudiante.nombres
            modelo.apellidos = estudiante.apellidos
            modelo.correo = estudiante.correo
            modelo.telefono = estudiante.telefono
            modelo.carrera_id = estudiante.carrera_id
            modelo.semestre_actual = estudiante.semestre_actual
            modelo.estado = estudiante.estado
            modelo.promedio_acumulado = estudiante.promedio_acumulado
            modelo.creditos_aprobados = estudiante.creditos_aprobados
            self.bd.commit()
            self.bd.refresh(modelo)
            return self._mapear_a_entidad(modelo)
        return estudiante

    def eliminar(self, estudiante_id: int) -> bool:
        modelo = self.bd.query(EstudianteModelo).filter(EstudianteModelo.id == estudiante_id).first()
        if modelo:
            self.bd.delete(modelo)
            self.bd.commit()
            return True
        return False

    def contar(self) -> int:
        return self.bd.query(EstudianteModelo).count()
