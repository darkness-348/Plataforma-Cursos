from typing import List, Optional
from datetime import date
from app.domain.entities.estudiante import Estudiante
from app.domain.entities.usuario import Usuario
from app.domain.repositories.estudiante_repositorio import EstudianteRepositorio
from app.domain.repositories.carrera_repositorio import CarreraRepositorio
from app.domain.repositories.usuario_repositorio import UsuarioRepositorio
from app.domain.excepciones import EntidadNoEncontradaExcepcion, EntidadYaExisteExcepcion
from app.application.dtos.estudiante_dto import EstudianteCrearDTO, EstudianteActualizarDTO
from app.application.seguridad import obtener_hash_clave

class EstudianteCasosUso:
    def __init__(
        self, 
        estudiante_repo: EstudianteRepositorio, 
        carrera_repo: CarreraRepositorio,
        usuario_repo: Optional[UsuarioRepositorio] = None
    ):
        self.estudiante_repo = estudiante_repo
        self.carrera_repo = carrera_repo
        self.usuario_repo = usuario_repo

    def listar_estudiantes(self, skip: int = 0, limit: int = 100, busqueda: Optional[str] = None, carrera_id: Optional[int] = None) -> List[Estudiante]:
        return self.estudiante_repo.obtener_todos(skip=skip, limit=limit, busqueda=busqueda, carrera_id=carrera_id)

    def obtener_estudiante_por_id(self, estudiante_id: int) -> Estudiante:
        estudiante = self.estudiante_repo.obtener_por_id(estudiante_id)
        if not estudiante:
            raise EntidadNoEncontradaExcepcion("Estudiante", estudiante_id)
        return estudiante

    def crear_estudiante(self, dto: EstudianteCrearDTO) -> Estudiante:
        carrera = self.carrera_repo.obtener_por_id(dto.carrera_id)
        if not carrera:
            raise EntidadNoEncontradaExcepcion("Carrera", dto.carrera_id)

        cedula_existente = self.estudiante_repo.obtener_por_cedula(dto.cedula)
        if cedula_existente:
            raise EntidadYaExisteExcepcion("Estudiante", "Cédula", dto.cedula)

        correo_existente = self.estudiante_repo.obtener_por_correo(dto.correo)
        if correo_existente:
            raise EntidadYaExisteExcepcion("Estudiante", "Correo", dto.correo)

        estudiante = Estudiante(
            id=None,
            cedula=dto.cedula,
            nombres=dto.nombres,
            apellidos=dto.apellidos,
            correo=dto.correo,
            telefono=dto.telefono,
            carrera_id=dto.carrera_id,
            semestre_actual=dto.semestre_actual,
            estado="Activo",
            promedio_acumulado=0.0,
            creditos_aprobados=0,
            fecha_ingreso=dto.fecha_ingreso or date.today()
        )
        nuevo_estudiante = self.estudiante_repo.crear(estudiante)

        # Crear automáticamente la cuenta de usuario vinculada para inicio de sesión
        if self.usuario_repo:
            usr_existente = self.usuario_repo.obtener_por_correo(dto.correo)
            if not usr_existente:
                nuevo_usuario = Usuario(
                    id=None,
                    nombre_completo=f"{nuevo_estudiante.nombres} {nuevo_estudiante.apellidos}",
                    correo=nuevo_estudiante.correo,
                    clave_hash=obtener_hash_clave("estudiante123"), # Clave por defecto inicial
                    rol="Estudiante",
                    estudiante_id=nuevo_estudiante.id,
                    estado="Activo"
                )
                self.usuario_repo.crear(nuevo_usuario)

        return nuevo_estudiante

    def actualizar_estudiante(self, estudiante_id: int, dto: EstudianteActualizarDTO) -> Estudiante:
        estudiante = self.obtener_estudiante_por_id(estudiante_id)

        if dto.carrera_id and dto.carrera_id != estudiante.carrera_id:
            carrera = self.carrera_repo.obtener_por_id(dto.carrera_id)
            if not carrera:
                raise EntidadNoEncontradaExcepcion("Carrera", dto.carrera_id)
            estudiante.carrera_id = dto.carrera_id

        if dto.cedula and dto.cedula != estudiante.cedula:
            existente = self.estudiante_repo.obtener_por_cedula(dto.cedula)
            if existente:
                raise EntidadYaExisteExcepcion("Estudiante", "Cédula", dto.cedula)
            estudiante.cedula = dto.cedula

        if dto.correo and dto.correo != estudiante.correo:
            existente = self.estudiante_repo.obtener_por_correo(dto.correo)
            if existente:
                raise EntidadYaExisteExcepcion("Estudiante", "Correo", dto.correo)
            estudiante.correo = dto.correo

        if dto.nombres is not None:
            estudiante.nombres = dto.nombres
        if dto.apellidos is not None:
            estudiante.apellidos = dto.apellidos
        if dto.telefono is not None:
            estudiante.telefono = dto.telefono
        if dto.semestre_actual is not None:
            estudiante.semestre_actual = dto.semestre_actual
        if dto.estado is not None:
            estudiante.estado = dto.estado

        return self.estudiante_repo.actualizar(estudiante)

    def eliminar_estudiante(self, estudiante_id: int) -> bool:
        self.obtener_estudiante_por_id(estudiante_id)
        return self.estudiante_repo.eliminar(estudiante_id)
