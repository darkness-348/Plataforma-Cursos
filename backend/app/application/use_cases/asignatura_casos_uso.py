from typing import List, Optional
from app.domain.entities.asignatura import Asignatura
from app.domain.repositories.asignatura_repositorio import AsignaturaRepositorio
from app.domain.repositories.docente_repositorio import DocenteRepositorio
from app.domain.repositories.carrera_repositorio import CarreraRepositorio
from app.domain.excepciones import EntidadNoEncontradaExcepcion, EntidadYaExisteExcepcion, ReglaNegocioExcepcion
from app.application.dtos.asignatura_dto import AsignaturaCrearDTO, AsignaturaActualizarDTO

class AsignaturaCasosUso:
    def __init__(self, asignatura_repo: AsignaturaRepositorio, docente_repo: DocenteRepositorio, carrera_repo: CarreraRepositorio):
        self.asignatura_repo = asignatura_repo
        self.docente_repo = docente_repo
        self.carrera_repo = carrera_repo

    def listar_asignaturas(self, skip: int = 0, limit: int = 100, busqueda: Optional[str] = None, periodo: Optional[str] = None, carrera_id: Optional[int] = None, docente_id: Optional[int] = None) -> List[Asignatura]:
        return self.asignatura_repo.obtener_todas(skip=skip, limit=limit, busqueda=busqueda, periodo=periodo, carrera_id=carrera_id, docente_id=docente_id)

    def obtener_asignatura_por_id(self, asignatura_id: int) -> Asignatura:
        asignatura = self.asignatura_repo.obtener_por_id(asignatura_id)
        if not asignatura:
            raise EntidadNoEncontradaExcepcion("Asignatura", asignatura_id)
        return asignatura

    def crear_asignatura(self, dto: AsignaturaCrearDTO) -> Asignatura:
        carrera = self.carrera_repo.obtener_por_id(dto.carrera_id)
        if not carrera:
            raise EntidadNoEncontradaExcepcion("Carrera", dto.carrera_id)

        existente_codigo = self.asignatura_repo.obtener_por_codigo(dto.codigo)
        if existente_codigo:
            raise EntidadYaExisteExcepcion("Asignatura", "Código", dto.codigo)

        if dto.docente_id:
            docente = self.docente_repo.obtener_por_id(dto.docente_id)
            if not docente:
                raise EntidadNoEncontradaExcepcion("Docente", dto.docente_id)

        asignatura = Asignatura(
            id=None,
            codigo=dto.codigo,
            nombre=dto.nombre,
            creditos=dto.creditos,
            carrera_id=dto.carrera_id,
            semestre_nivel=dto.semestre_nivel or 1,
            docente_id=dto.docente_id,
            periodo_academico=dto.periodo_academico,
            capacidad_maxima=dto.capacidad_maxima,
            aula=dto.aula,
            horario=dto.horario,
            estado="Abierto"
        )
        return self.asignatura_repo.crear(asignatura)

    def actualizar_asignatura(self, asignatura_id: int, dto: AsignaturaActualizarDTO) -> Asignatura:
        asignatura = self.obtener_asignatura_por_id(asignatura_id)

        if dto.codigo and dto.codigo != asignatura.codigo:
            existente = self.asignatura_repo.obtener_por_codigo(dto.codigo)
            if existente:
                raise EntidadYaExisteExcepcion("Asignatura", "Código", dto.codigo)
            asignatura.codigo = dto.codigo

        if dto.carrera_id and dto.carrera_id != asignatura.carrera_id:
            carrera = self.carrera_repo.obtener_por_id(dto.carrera_id)
            if not carrera:
                raise EntidadNoEncontradaExcepcion("Carrera", dto.carrera_id)
            asignatura.carrera_id = dto.carrera_id

        if dto.semestre_nivel is not None:
            asignatura.semestre_nivel = dto.semestre_nivel

        if dto.docente_id is not None and dto.docente_id != asignatura.docente_id:
            if dto.docente_id > 0:
                docente = self.docente_repo.obtener_por_id(dto.docente_id)
                if not docente:
                    raise EntidadNoEncontradaExcepcion("Docente", dto.docente_id)
                asignatura.docente_id = dto.docente_id
            else:
                asignatura.docente_id = None

        if dto.nombre is not None:
            asignatura.nombre = dto.nombre
        if dto.creditos is not None:
            asignatura.creditos = dto.creditos
        if dto.periodo_academico is not None:
            asignatura.periodo_academico = dto.periodo_academico
        if dto.capacidad_maxima is not None:
            if dto.capacidad_maxima < asignatura.estudiantes_inscritos:
                raise ReglaNegocioExcepcion(f"La capacidad ({dto.capacidad_maxima}) no puede ser menor a los alumnos inscritos actuales ({asignatura.estudiantes_inscritos}).")
            asignatura.capacidad_maxima = dto.capacidad_maxima
        if dto.aula is not None:
            asignatura.aula = dto.aula
        if dto.horario is not None:
            asignatura.horario = dto.horario
        if dto.estado is not None:
            asignatura.estado = dto.estado

        return self.asignatura_repo.actualizar(asignatura)

    def eliminar_asignatura(self, asignatura_id: int) -> bool:
        self.obtener_asignatura_por_id(asignatura_id)
        return self.asignatura_repo.eliminar(asignatura_id)
