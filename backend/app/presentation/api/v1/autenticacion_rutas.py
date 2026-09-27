from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from app.application.dtos.usuario_dto import UsuarioRegistroDTO, UsuarioLoginDTO, TokenRespuestaDTO, UsuarioRespuestaDTO
from app.application.use_cases.autenticacion_casos_uso import AutenticacionCasosUso
from app.presentation.api.dependencias import obtener_autenticacion_casos_uso, obtener_usuario_actual
from app.domain.excepciones import EntidadNoEncontradaExcepcion, EntidadYaExisteExcepcion, ReglaNegocioExcepcion

enrutador = APIRouter(prefix="/auth", tags=["Autenticación & Usuarios"])

@enrutador.post("/registro", response_model=UsuarioRespuestaDTO, status_code=status.HTTP_201_CREATED)
def registrar_usuario(
    dto: UsuarioRegistroDTO,
    casos_uso: AutenticacionCasosUso = Depends(obtener_autenticacion_casos_uso)
):
    """Registrar una nueva cuenta de usuario (Administrador, Docente o Estudiante)."""
    try:
        return casos_uso.registrar_usuario(dto)
    except EntidadYaExisteExcepcion as e:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail=str(e))
    except ReglaNegocioExcepcion as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))

@enrutador.post("/login", response_model=TokenRespuestaDTO)
def iniciar_sesion(
    dto: UsuarioLoginDTO,
    casos_uso: AutenticacionCasosUso = Depends(obtener_autenticacion_casos_uso)
):
    """Autenticar usuario con correo y contraseña, retornando un Token JWT Bearer."""
    try:
        return casos_uso.iniciar_sesion(dto)
    except ReglaNegocioExcepcion as e:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail=str(e))

@enrutador.post("/login-form", response_model=TokenRespuestaDTO)
def iniciar_sesion_form(
    form_data: OAuth2PasswordRequestForm = Depends(),
    casos_uso: AutenticacionCasosUso = Depends(obtener_autenticacion_casos_uso)
):
    """Soporte para OAuth2 Form Login de la documentación Swagger."""
    try:
        dto = UsuarioLoginDTO(correo=form_data.username, clave=form_data.password)
        return casos_uso.iniciar_sesion(dto)
    except ReglaNegocioExcepcion as e:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail=str(e))

@enrutador.get("/perfil", response_model=UsuarioRespuestaDTO)
def obtener_perfil(usuario_actual: UsuarioRespuestaDTO = Depends(obtener_usuario_actual)):
    """Obtener los datos del usuario autenticado actualmente."""
    return usuario_actual
