from typing import List, Optional
from app.domain.entities.carrera import Carrera
from app.domain.repositories.carrera_repositorio import CarreraRepositorio
from app.domain.excepciones import EntidadNoEncontradaExcepcion, EntidadYaExisteExcepcion
from app.application.dtos.carrera_dto import CarreraCrearDTO, CarreraActualizarDTO

class CarreraCasosUso:
    def __init__(self, carrera_repo: CarreraRepositorio):
        self.carrera_repo = carrera_repo

    def listar_carreras(self, skip: int = 0, limit: int = 100) -> List[Carrera]:
        return self.carrera_repo.obtener_todas(skip=skip, limit=limit)

    def obtener_carrera_por_id(self, carrera_id: int) -> Carrera:
        carrera = self.carrera_repo.obtener_por_id(carrera_id)
        if not carrera:
            raise EntidadNoEncontradaExcepcion("Carrera", carrera_id)
        return carrera

    def crear_carrera(self, dto: CarreraCrearDTO) -> Carrera:
        existente = self.carrera_repo.obtener_por_codigo(dto.codigo)
        if existente:
            raise EntidadYaExisteExcepcion("Carrera", "Código", dto.codigo)

        carrera = Carrera(
            id=None,
            codigo=dto.codigo,
            nombre=dto.nombre,
            facultad=dto.facultad,
            duracion_semestres=dto.duracion_semestres,
            total_creditos=dto.total_creditos,
            estado="Activa"
        )
        return self.carrera_repo.crear(carrera)

    def actualizar_carrera(self, carrera_id: int, dto: CarreraActualizarDTO) -> Carrera:
        carrera = self.obtener_carrera_por_id(carrera_id)

        if dto.codigo and dto.codigo != carrera.codigo:
            existente = self.carrera_repo.obtener_por_codigo(dto.codigo)
            if existente:
                raise EntidadYaExisteExcepcion("Carrera", "Código", dto.codigo)
            carrera.codigo = dto.codigo

        if dto.nombre is not None:
            carrera.nombre = dto.nombre
        if dto.facultad is not None:
            carrera.facultad = dto.facultad
        if dto.duracion_semestres is not None:
            carrera.duracion_semestres = dto.duracion_semestres
        if dto.total_creditos is not None:
            carrera.total_creditos = dto.total_creditos
        if dto.estado is not None:
            carrera.estado = dto.estado

        return self.carrera_repo.actualizar(carrera)

    def eliminar_carrera(self, carrera_id: int) -> bool:
        self.obtener_carrera_por_id(carrera_id)
        return self.carrera_repo.eliminar(carrera_id)
