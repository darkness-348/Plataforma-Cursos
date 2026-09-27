from typing import List
from app.domain.entities.aula import Aula
from app.domain.repositories.aula_repositorio import AulaRepositorio
from app.domain.excepciones import EntidadNoEncontradaExcepcion, EntidadYaExisteExcepcion
from app.application.dtos.aula_dto import AulaCrearDTO, AulaActualizarDTO

class AulaCasosUso:

    def __init__(self, aula_repo: AulaRepositorio):
        self.aula_repo = aula_repo

    def listar_aulas(self, skip: int = 0, limit: int = 100) -> List[Aula]:
        return self.aula_repo.obtener_todas(skip=skip, limit=limit)

    def obtener_aula_por_id(self, id: int) -> Aula:
        aula = self.aula_repo.obtener_por_id(id)
        if not aula:
            raise EntidadNoEncontradaExcepcion("Aula", id)
        return aula

    def crear_aula(self, dto: AulaCrearDTO) -> Aula:
        existente = self.aula_repo.obtener_por_codigo(dto.codigo)
        if existente:
            raise EntidadYaExisteExcepcion("Aula", "Código", dto.codigo)

        aula = Aula(
            id=None,
            codigo=dto.codigo,
            nombre=dto.nombre,
            edificio=dto.edificio,
            capacidad_maxima=dto.capacidad_maxima,
            tipo=dto.tipo,
            estado=dto.estado
        )
        return self.aula_repo.crear(aula)

    def actualizar_aula(self, id: int, dto: AulaActualizarDTO) -> Aula:
        aula = self.obtener_aula_por_id(id)

        if dto.codigo and dto.codigo != aula.codigo:
            existente = self.aula_repo.obtener_por_codigo(dto.codigo)
            if existente:
                raise EntidadYaExisteExcepcion("Aula", "Código", dto.codigo)
            aula.codigo = dto.codigo

        if dto.nombre is not None:
            aula.nombre = dto.nombre
        if dto.edificio is not None:
            aula.edificio = dto.edificio
        if dto.capacidad_maxima is not None:
            aula.capacidad_maxima = dto.capacidad_maxima
        if dto.tipo is not None:
            aula.tipo = dto.tipo
        if dto.estado is not None:
            aula.estado = dto.estado

        return self.aula_repo.actualizar(aula)

    def eliminar_aula(self, id: int) -> bool:
        self.obtener_aula_por_id(id)
        return self.aula_repo.eliminar(id)
