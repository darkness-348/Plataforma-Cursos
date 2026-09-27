from typing import List, Optional
from datetime import date
from app.domain.entities.matricula import Matricula
from app.domain.repositories.matricula_repositorio import MatriculaRepositorio
from app.domain.repositories.estudiante_repositorio import EstudianteRepositorio
from app.domain.repositories.asignatura_repositorio import AsignaturaRepositorio
from app.domain.excepciones import EntidadNoEncontradaExcepcion, EntidadYaExisteExcepcion, ReglaNegocioExcepcion
from app.application.dtos.matricula_dto import MatriculaCrearDTO, MatriculaActualizarDTO

class MatriculaCasosUso:
    def __init__(self, matricula_repo: MatriculaRepositorio, estudiante_repo: EstudianteRepositorio, asignatura_repo: AsignaturaRepositorio):
        self.matricula_repo = matricula_repo
        self.estudiante_repo = estudiante_repo
        self.asignatura_repo = asignatura_repo

    def listar_matriculas(self, skip: int = 0, limit: int = 100, estudiante_id: Optional[int] = None, asignatura_id: Optional[int] = None) -> List[Matricula]:
        return self.matricula_repo.obtener_todas(skip=skip, limit=limit, estudiante_id=estudiante_id, asignatura_id=asignatura_id)

    def obtener_matricula_por_id(self, matricula_id: int) -> Matricula:
        matricula = self.matricula_repo.obtener_por_id(matricula_id)
        if not matricula:
            raise EntidadNoEncontradaExcepcion("Matrícula", matricula_id)
        return matricula

    def matricular_estudiante(self, dto: MatriculaCrearDTO) -> Matricula:
        estudiante = self.estudiante_repo.obtener_por_id(dto.estudiante_id)
        if not estudiante:
            raise EntidadNoEncontradaExcepcion("Estudiante", dto.estudiante_id)

        if estudiante.estado != "Activo":
            raise ReglaNegocioExcepcion(f"El estudiante '{estudiante.nombre_completo}' no se encuentra en estado Activo.")

        asignatura = self.asignatura_repo.obtener_por_id(dto.asignatura_id)
        if not asignatura:
            raise EntidadNoEncontradaExcepcion("Asignatura", dto.asignatura_id)

        if asignatura.estado != "Abierto":
            raise ReglaNegocioExcepcion(f"La asignatura '{asignatura.nombre}' no está abierta para inscripción.")

        # Validar que la asignatura pertenezca a la carrera del estudiante (malla curricular)
        if asignatura.carrera_id != estudiante.carrera_id:
            raise ReglaNegocioExcepcion(
                f"Acceso denegado: La asignatura '{asignatura.nombre}' ({asignatura.codigo}) no pertenece al plan de estudios de tu carrera universitaria."
            )

        # Validar correspondencia del semestre académico del estudiante
        if asignatura.semestre_nivel != estudiante.semestre_actual:
            raise ReglaNegocioExcepcion(
                f"Acceso Denegado: La asignatura '{asignatura.nombre}' ({asignatura.codigo}) corresponde al Semestre {asignatura.semestre_nivel}. Solo estás habilitado para registrar materias de tu semestre actual (Semestre {estudiante.semestre_actual}). Si necesitas cursar esta materia, debes comunicarte con tu Jefe de Carrera para solicitar una autorización especial."
            )

        # Validar el límite máximo de 6 materias por semestre por estudiante
        matriculas_actuales = self.matricula_repo.obtener_todas(estudiante_id=dto.estudiante_id)
        materias_inscritas = [m for m in matriculas_actuales if m.estado in ["Inscrito", "Aprobado"]]
        if len(materias_inscritas) >= 6:
            raise ReglaNegocioExcepcion(
                f"Límite académico alcanzado: El estudiante '{estudiante.nombre_completo}' ya cuenta con {len(materias_inscritas)} materias inscritas. El límite máximo permitido es de 6 asignaturas por semestre."
            )

        if asignatura.esta_lleno:
            raise ReglaNegocioExcepcion(f"La asignatura '{asignatura.nombre}' ha alcanzado el cupo máximo de {asignatura.capacidad_maxima} alumnos.")

        existente = self.matricula_repo.obtener_por_estudiante_y_asignatura(dto.estudiante_id, dto.asignatura_id)
        if existente:
            raise EntidadYaExisteExcepcion("Matrícula", "Estudiante/Asignatura", f"{estudiante.nombre_completo} en {asignatura.nombre}")

        matricula = Matricula(
            id=None,
            estudiante_id=dto.estudiante_id,
            asignatura_id=dto.asignatura_id,
            fecha_matricula=dto.fecha_matricula or date.today(),
            estado="Inscrito"
        )

        matricula_creada = self.matricula_repo.crear(matricula)

        # Incrementar contador de inscritos en la asignatura
        asignatura.estudiantes_inscritos += 1
        self.asignatura_repo.actualizar(asignatura)

        return matricula_creada

    def actualizar_matricula(self, matricula_id: int, dto: MatriculaActualizarDTO) -> Matricula:
        matricula = self.obtener_matricula_por_id(matricula_id)

        if dto.estado is not None:
            matricula.estado = dto.estado

        if dto.nota_primer_parcial is not None:
            matricula.nota_primer_parcial = dto.nota_primer_parcial
        if dto.nota_segundo_parcial is not None:
            matricula.nota_segundo_parcial = dto.nota_segundo_parcial
        if dto.nota_examen_final is not None:
            matricula.nota_examen_final = dto.nota_examen_final

        matricula.calcular_nota_final()

        return self.matricula_repo.actualizar(matricula)

    def cancelar_matricula(self, matricula_id: int) -> bool:
        matricula = self.obtener_matricula_por_id(matricula_id)
        asignatura = self.asignatura_repo.obtener_por_id(matricula.asignatura_id)

        exito = self.matricula_repo.eliminar(matricula_id)
        if exito and asignatura and asignatura.estudiantes_inscritos > 0:
            asignatura.estudiantes_inscritos -= 1
            self.asignatura_repo.actualizar(asignatura)

        return exito
