from app.domain.entities.usuario import Usuario
from app.domain.entities.estudiante import Estudiante
from app.domain.entities.docente import Docente
from app.domain.repositories.usuario_repositorio import UsuarioRepositorio
from app.domain.repositories.estudiante_repositorio import EstudianteRepositorio
from app.domain.repositories.docente_repositorio import DocenteRepositorio
from app.domain.excepciones import EntidadNoEncontradaExcepcion, EntidadYaExisteExcepcion, ReglaNegocioExcepcion
from app.application.dtos.usuario_dto import UsuarioRegistroDTO, UsuarioLoginDTO, TokenRespuestaDTO, UsuarioRespuestaDTO
from app.application.seguridad import obtener_hash_clave, verificar_clave, crear_token_jwt

class AutenticacionCasosUso:
    def __init__(
        self,
        usuario_repo: UsuarioRepositorio,
        estudiante_repo: EstudianteRepositorio,
        docente_repo: DocenteRepositorio
    ):
        self.usuario_repo = usuario_repo
        self.estudiante_repo = estudiante_repo
        self.docente_repo = docente_repo

    def registrar_usuario(self, dto: UsuarioRegistroDTO) -> UsuarioRespuestaDTO:
        usuario_existente = self.usuario_repo.obtener_por_correo(dto.correo)
        if usuario_existente:
            raise EntidadYaExisteExcepcion("Usuario", "Correo", dto.correo)

        estudiante_id = None
        docente_id = None

        # Si viene Cédula o DNI, intentar vincular expediente
        if dto.cedula_o_dni:
            if dto.rol == "Estudiante":
                est = self.estudiante_repo.obtener_por_cedula(dto.cedula_o_dni)
                if est:
                    estudiante_id = est.id
            elif dto.rol == "Docente":
                doc = self.docente_repo.obtener_por_dni(dto.cedula_o_dni)
                if doc:
                    docente_id = doc.id

        clave_encriptada = obtener_hash_clave(dto.clave)

        usuario = Usuario(
            id=None,
            nombre_completo=dto.nombre_completo,
            correo=dto.correo,
            clave_hash=clave_encriptada,
            rol=dto.rol,
            estudiante_id=estudiante_id,
            docente_id=docente_id,
            estado="Activo"
        )

        usuario_creado = self.usuario_repo.crear(usuario)
        return UsuarioRespuestaDTO.model_validate(usuario_creado)

    def iniciar_sesion(self, dto: UsuarioLoginDTO) -> TokenRespuestaDTO:
        usuario = self.usuario_repo.obtener_por_correo(dto.correo)
        if not usuario:
            raise ReglaNegocioExcepcion("Credenciales inválidas. Verifique su correo o contraseña.")

        if usuario.estado != "Activo":
            raise ReglaNegocioExcepcion("La cuenta de usuario se encuentra inactiva o suspendida.")

        if not verificar_clave(dto.clave, usuario.clave_hash):
            raise ReglaNegocioExcepcion("Credenciales inválidas. Verifique su correo o contraseña.")

        token_jwt = crear_token_jwt({
            "sub": str(usuario.id),
            "correo": usuario.correo,
            "rol": usuario.rol,
            "estudiante_id": usuario.estudiante_id,
            "docente_id": usuario.docente_id
        })

        dto_usuario = UsuarioRespuestaDTO.model_validate(usuario)

        return TokenRespuestaDTO(
            access_token=token_jwt,
            token_type="bearer",
            usuario=dto_usuario
        )

    def obtener_perfil_usuario(self, usuario_id: int) -> UsuarioRespuestaDTO:
        usuario = self.usuario_repo.obtener_por_id(usuario_id)
        if not usuario:
            raise EntidadNoEncontradaExcepcion("Usuario", usuario_id)
        return UsuarioRespuestaDTO.model_validate(usuario)
