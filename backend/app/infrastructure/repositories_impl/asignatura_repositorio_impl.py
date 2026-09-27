from typing import List, Optional
from sqlalchemy.orm import Session
from sqlalchemy import or_
from app.domain.entities.asignatura import Asignatura
from app.domain.repositories.asignatura_repositorio import AsignaturaRepositorio
from app.infrastructure.database.models.asignatura_modelo import AsignaturaModelo

class AsignaturaRepositorioImpl(AsignaturaRepositorio):
    def __init__(self, bd: Session):
        self.bd = bd

    def _mapear_a_entidad(self, modelo: AsignaturaModelo) -> Asignatura:
        return Asignatura(
            id=modelo.id,
            codigo=modelo.codigo,
            nombre=modelo.nombre,
            creditos=modelo.creditos,
            carrera_id=modelo.carrera_id,
            semestre_nivel=modelo.semestre_nivel if modelo.semestre_nivel else 1,
            docente_id=modelo.docente_id,
            periodo_academico=modelo.periodo_academico,
            capacidad_maxima=modelo.capacidad_maxima,
            estudiantes_inscritos=modelo.estudiantes_inscritos,
            aula=modelo.aula,
            horario=modelo.horario,
            estado=modelo.estado,
            fecha_creacion=modelo.fecha_creacion
        )

    def obtener_todas(self, skip: int = 0, limit: int = 100, busqueda: Optional[str] = None, periodo: Optional[str] = None, carrera_id: Optional[int] = None, docente_id: Optional[int] = None) -> List[Asignatura]:
        consulta = self.bd.query(AsignaturaModelo)
        if busqueda:
            patron = f"%{busqueda}%"
            consulta = consulta.filter(
                or_(
                    AsignaturaModelo.nombre.ilike(patron),
                    AsignaturaModelo.codigo.ilike(patron)
                )
            )
        if periodo:
            consulta = consulta.filter(AsignaturaModelo.periodo_academico == periodo)
        if carrera_id:
            consulta = consulta.filter(AsignaturaModelo.carrera_id == carrera_id)
        if docente_id:
            consulta = consulta.filter(AsignaturaModelo.docente_id == docente_id)
        modelos = consulta.order_by(AsignaturaModelo.id.desc()).offset(skip).limit(limit).all()
        return [self._mapear_a_entidad(m) for m in modelos]

    def obtener_por_id(self, asignatura_id: int) -> Optional[Asignatura]:
        modelo = self.bd.query(AsignaturaModelo).filter(AsignaturaModelo.id == asignatura_id).first()
        return self._mapear_a_entidad(modelo) if modelo else None

    def obtener_por_codigo(self, codigo: str) -> Optional[Asignatura]:
        modelo = self.bd.query(AsignaturaModelo).filter(AsignaturaModelo.codigo == codigo).first()
        return self._mapear_a_entidad(modelo) if modelo else None

    def crear(self, asignatura: Asignatura) -> Asignatura:
        modelo = AsignaturaModelo(
            codigo=asignatura.codigo,
            nombre=asignatura.nombre,
            creditos=asignatura.creditos,
            carrera_id=asignatura.carrera_id,
            semestre_nivel=asignatura.semestre_nivel,
            docente_id=asignatura.docente_id,
            periodo_academico=asignatura.periodo_academico,
            capacidad_maxima=asignatura.capacidad_maxima,
            estudiantes_inscritos=asignatura.estudiantes_inscritos,
            aula=asignatura.aula,
            horario=asignatura.horario,
            estado=asignatura.estado
        )
        self.bd.add(modelo)
        self.bd.commit()
        self.bd.refresh(modelo)
        return self._mapear_a_entidad(modelo)

    def actualizar(self, asignatura: Asignatura) -> Asignatura:
        modelo = self.bd.query(AsignaturaModelo).filter(AsignaturaModelo.id == asignatura.id).first()
        if modelo:
            modelo.codigo = asignatura.codigo
            modelo.nombre = asignatura.nombre
            modelo.creditos = asignatura.creditos
            modelo.carrera_id = asignatura.carrera_id
            modelo.semestre_nivel = asignatura.semestre_nivel
            modelo.docente_id = asignatura.docente_id
            modelo.periodo_academico = asignatura.periodo_academico
            modelo.capacidad_maxima = asignatura.capacidad_maxima
            modelo.estudiantes_inscritos = asignatura.estudiantes_inscritos
            modelo.aula = asignatura.aula
            modelo.horario = asignatura.horario
            modelo.estado = asignatura.estado
            self.bd.commit()
            self.bd.refresh(modelo)
            return self._mapear_a_entidad(modelo)
        return asignatura

    def eliminar(self, asignatura_id: int) -> bool:
        modelo = self.bd.query(AsignaturaModelo).filter(AsignaturaModelo.id == asignatura_id).first()
        if modelo:
            self.bd.delete(modelo)
            self.bd.commit()
            return True
        return False

    def contar(self) -> int:
        return self.bd.query(AsignaturaModelo).count()
