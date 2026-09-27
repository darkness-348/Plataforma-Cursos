from typing import List, Optional
from sqlalchemy.orm import Session
from sqlalchemy import or_
from app.domain.entities.docente import Docente
from app.domain.repositories.docente_repositorio import DocenteRepositorio
from app.infrastructure.database.models.docente_modelo import DocenteModelo

class DocenteRepositorioImpl(DocenteRepositorio):
    def __init__(self, bd: Session):
        self.bd = bd

    def _mapear_a_entidad(self, modelo: DocenteModelo) -> Docente:
        return Docente(
            id=modelo.id,
            dni=modelo.dni,
            nombres=modelo.nombres,
            apellidos=modelo.apellidos,
            correo=modelo.correo,
            telefono=modelo.telefono,
            especialidad=modelo.especialidad,
            grado_academico=modelo.grado_academico,
            tipo_contrato=modelo.tipo_contrato,
            departamento=modelo.departamento,
            estado=modelo.estado,
            fecha_creacion=modelo.fecha_creacion
        )

    def obtener_todos(self, skip: int = 0, limit: int = 100, busqueda: Optional[str] = None) -> List[Docente]:
        consulta = self.bd.query(DocenteModelo)
        if busqueda:
            patron = f"%{busqueda}%"
            consulta = consulta.filter(
                or_(
                    DocenteModelo.nombres.ilike(patron),
                    DocenteModelo.apellidos.ilike(patron),
                    DocenteModelo.dni.ilike(patron),
                    DocenteModelo.especialidad.ilike(patron)
                )
            )
        modelos = consulta.order_by(DocenteModelo.id.desc()).offset(skip).limit(limit).all()
        return [self._mapear_a_entidad(m) for m in modelos]

    def obtener_por_id(self, docente_id: int) -> Optional[Docente]:
        modelo = self.bd.query(DocenteModelo).filter(DocenteModelo.id == docente_id).first()
        return self._mapear_a_entidad(modelo) if modelo else None

    def obtener_por_dni(self, dni: str) -> Optional[Docente]:
        modelo = self.bd.query(DocenteModelo).filter(DocenteModelo.dni == dni).first()
        return self._mapear_a_entidad(modelo) if modelo else None

    def obtener_por_correo(self, correo: str) -> Optional[Docente]:
        modelo = self.bd.query(DocenteModelo).filter(DocenteModelo.correo == correo).first()
        return self._mapear_a_entidad(modelo) if modelo else None

    def crear(self, docente: Docente) -> Docente:
        modelo = DocenteModelo(
            dni=docente.dni,
            nombres=docente.nombres,
            apellidos=docente.apellidos,
            correo=docente.correo,
            telefono=docente.telefono,
            especialidad=docente.especialidad,
            grado_academico=docente.grado_academico,
            tipo_contrato=docente.tipo_contrato,
            departamento=docente.departamento,
            estado=docente.estado
        )
        self.bd.add(modelo)
        self.bd.commit()
        self.bd.refresh(modelo)
        return self._mapear_a_entidad(modelo)

    def actualizar(self, docente: Docente) -> Docente:
        modelo = self.bd.query(DocenteModelo).filter(DocenteModelo.id == docente.id).first()
        if modelo:
            modelo.dni = docente.dni
            modelo.nombres = docente.nombres
            modelo.apellidos = docente.apellidos
            modelo.correo = docente.correo
            modelo.telefono = docente.telefono
            modelo.especialidad = docente.especialidad
            modelo.grado_academico = docente.grado_academico
            modelo.tipo_contrato = docente.tipo_contrato
            modelo.departamento = docente.departamento
            modelo.estado = docente.estado
            self.bd.commit()
            self.bd.refresh(modelo)
            return self._mapear_a_entidad(modelo)
        return docente

    def eliminar(self, docente_id: int) -> bool:
        modelo = self.bd.query(DocenteModelo).filter(DocenteModelo.id == docente_id).first()
        if modelo:
            self.bd.delete(modelo)
            self.bd.commit()
            return True
        return False

    def contar(self) -> int:
        return self.bd.query(DocenteModelo).count()
