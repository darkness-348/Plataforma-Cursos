from typing import List, Optional
from sqlalchemy.orm import Session
from app.domain.entities.matricula import Matricula
from app.domain.repositories.matricula_repositorio import MatriculaRepositorio
from app.infrastructure.database.models.matricula_modelo import MatriculaModelo

class MatriculaRepositorioImpl(MatriculaRepositorio):
    def __init__(self, bd: Session):
        self.bd = bd

    def _mapear_a_entidad(self, modelo: MatriculaModelo) -> Matricula:
        return Matricula(
            id=modelo.id,
            estudiante_id=modelo.estudiante_id,
            asignatura_id=modelo.asignatura_id,
            fecha_matricula=modelo.fecha_matricula,
            estado=modelo.estado,
            nota_primer_parcial=modelo.nota_primer_parcial,
            nota_segundo_parcial=modelo.nota_segundo_parcial,
            nota_examen_final=modelo.nota_examen_final,
            nota_final=modelo.nota_final,
            fecha_creacion=modelo.fecha_creacion
        )

    def obtener_todas(self, skip: int = 0, limit: int = 100, estudiante_id: Optional[int] = None, asignatura_id: Optional[int] = None) -> List[Matricula]:
        consulta = self.bd.query(MatriculaModelo)
        if estudiante_id:
            consulta = consulta.filter(MatriculaModelo.estudiante_id == estudiante_id)
        if asignatura_id:
            consulta = consulta.filter(MatriculaModelo.asignatura_id == asignatura_id)
        modelos = consulta.order_by(MatriculaModelo.id.desc()).offset(skip).limit(limit).all()
        return [self._mapear_a_entidad(m) for m in modelos]

    def obtener_por_id(self, matricula_id: int) -> Optional[Matricula]:
        modelo = self.bd.query(MatriculaModelo).filter(MatriculaModelo.id == matricula_id).first()
        return self._mapear_a_entidad(modelo) if modelo else None

    def obtener_por_estudiante_y_asignatura(self, estudiante_id: int, asignatura_id: int) -> Optional[Matricula]:
        modelo = self.bd.query(MatriculaModelo).filter(
            MatriculaModelo.estudiante_id == estudiante_id,
            MatriculaModelo.asignatura_id == asignatura_id
        ).first()
        return self._mapear_a_entidad(modelo) if modelo else None

    def crear(self, matricula: Matricula) -> Matricula:
        modelo = MatriculaModelo(
            estudiante_id=matricula.estudiante_id,
            asignatura_id=matricula.asignatura_id,
            fecha_matricula=matricula.fecha_matricula,
            estado=matricula.estado,
            nota_primer_parcial=matricula.nota_primer_parcial,
            nota_segundo_parcial=matricula.nota_segundo_parcial,
            nota_examen_final=matricula.nota_examen_final,
            nota_final=matricula.nota_final
        )
        self.bd.add(modelo)
        self.bd.commit()
        self.bd.refresh(modelo)
        return self._mapear_a_entidad(modelo)

    def actualizar(self, matricula: Matricula) -> Matricula:
        modelo = self.bd.query(MatriculaModelo).filter(MatriculaModelo.id == matricula.id).first()
        if modelo:
            modelo.estado = matricula.estado
            modelo.nota_primer_parcial = matricula.nota_primer_parcial
            modelo.nota_segundo_parcial = matricula.nota_segundo_parcial
            modelo.nota_examen_final = matricula.nota_examen_final
            modelo.nota_final = matricula.nota_final
            self.bd.commit()
            self.bd.refresh(modelo)
            return self._mapear_a_entidad(modelo)
        return matricula

    def eliminar(self, matricula_id: int) -> bool:
        modelo = self.bd.query(MatriculaModelo).filter(MatriculaModelo.id == matricula_id).first()
        if modelo:
            self.bd.delete(modelo)
            self.bd.commit()
            return True
        return False

    def contar(self) -> int:
        return self.bd.query(MatriculaModelo).count()
