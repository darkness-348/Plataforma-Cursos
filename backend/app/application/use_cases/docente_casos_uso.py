from typing import List, Optional
from app.domain.entities.docente import Docente
from app.domain.entities.usuario import Usuario
from app.domain.repositories.docente_repositorio import DocenteRepositorio
from app.domain.repositories.usuario_repositorio import UsuarioRepositorio
from app.domain.excepciones import EntidadNoEncontradaExcepcion, EntidadYaExisteExcepcion
from app.application.dtos.docente_dto import DocenteCrearDTO, DocenteActualizarDTO
from app.application.seguridad import obtener_hash_clave

class DocenteCasosUso:
    def __init__(self, docente_repo: DocenteRepositorio, usuario_repo: Optional[UsuarioRepositorio] = None):
        self.docente_repo = docente_repo
        self.usuario_repo = usuario_repo

    def listar_docentes(self, skip: int = 0, limit: int = 100, busqueda: Optional[str] = None) -> List[Docente]:
        return self.docente_repo.obtener_todos(skip=skip, limit=limit, busqueda=busqueda)

    def obtener_docente_por_id(self, docente_id: int) -> Docente:
        docente = self.docente_repo.obtener_por_id(docente_id)
        if not docente:
            raise EntidadNoEncontradaExcepcion("Docente", docente_id)
        return docente

    def crear_docente(self, dto: DocenteCrearDTO) -> Docente:
        existente_dni = self.docente_repo.obtener_por_dni(dto.dni)
        if existente_dni:
            raise EntidadYaExisteExcepcion("Docente", "DNI", dto.dni)

        existente_correo = self.docente_repo.obtener_por_correo(dto.correo)
        if existente_correo:
            raise EntidadYaExisteExcepcion("Docente", "Correo", dto.correo)

        docente = Docente(
            id=None,
            dni=dto.dni,
            nombres=dto.nombres,
            apellidos=dto.apellidos,
            correo=dto.correo,
            telefono=dto.telefono,
            especialidad=dto.especialidad,
            grado_academico=dto.grado_academico,
            tipo_contrato=dto.tipo_contrato,
            departamento=dto.departamento,
            estado="Activo"
        )
        nuevo_docente = self.docente_repo.crear(docente)

        # Crear automáticamente la cuenta de usuario vinculada para inicio de sesión
        if self.usuario_repo:
            usr_existente = self.usuario_repo.obtener_por_correo(dto.correo)
            if not usr_existente:
                nuevo_usuario = Usuario(
                    id=None,
                    nombre_completo=f"{nuevo_docente.nombres} {nuevo_docente.apellidos}",
                    correo=nuevo_docente.correo,
                    clave_hash=obtener_hash_clave("docente123"), # Clave por defecto inicial
                    rol="Docente",
                    docente_id=nuevo_docente.id,
                    estado="Activo"
                )
                self.usuario_repo.crear(nuevo_usuario)

        return nuevo_docente

    def actualizar_docente(self, docente_id: int, dto: DocenteActualizarDTO) -> Docente:
        docente = self.obtener_docente_por_id(docente_id)

        if dto.dni and dto.dni != docente.dni:
            existente = self.docente_repo.obtener_por_dni(dto.dni)
            if existente:
                raise EntidadYaExisteExcepcion("Docente", "DNI", dto.dni)
            docente.dni = dto.dni

        if dto.correo and dto.correo != docente.correo:
            existente = self.docente_repo.obtener_por_correo(dto.correo)
            if existente:
                raise EntidadYaExisteExcepcion("Docente", "Correo", dto.correo)
            docente.correo = dto.correo

        if dto.nombres is not None:
            docente.nombres = dto.nombres
        if dto.apellidos is not None:
            docente.apellidos = dto.apellidos
        if dto.telefono is not None:
            docente.telefono = dto.telefono
        if dto.especialidad is not None:
            docente.especialidad = dto.especialidad
        if dto.grado_academico is not None:
            docente.grado_academico = dto.grado_academico
        if dto.tipo_contrato is not None:
            docente.tipo_contrato = dto.tipo_contrato
        if dto.departamento is not None:
            docente.departamento = dto.departamento
        if dto.estado is not None:
            docente.estado = dto.estado

        return self.docente_repo.actualizar(docente)

    def eliminar_docente(self, docente_id: int) -> bool:
        self.obtener_docente_por_id(docente_id)
        return self.docente_repo.eliminar(docente_id)
