from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from typing import List
from app.infrastructure.database.sesion import obtener_bd

from app.infrastructure.repositories_impl.carrera_repositorio_impl import CarreraRepositorioImpl
from app.infrastructure.repositories_impl.estudiante_repositorio_impl import EstudianteRepositorioImpl
from app.infrastructure.repositories_impl.docente_repositorio_impl import DocenteRepositorioImpl
from app.infrastructure.repositories_impl.asignatura_repositorio_impl import AsignaturaRepositorioImpl
from app.infrastructure.repositories_impl.matricula_repositorio_impl import MatriculaRepositorioImpl
from app.infrastructure.repositories_impl.usuario_repositorio_impl import UsuarioRepositorioImpl
from app.infrastructure.repositories_impl.aula_repositorio_impl import AulaRepositorioImpl

from app.application.use_cases.carrera_casos_uso import CarreraCasosUso
from app.application.use_cases.estudiante_casos_uso import EstudianteCasosUso
from app.application.use_cases.docente_casos_uso import DocenteCasosUso
from app.application.use_cases.asignatura_casos_uso import AsignaturaCasosUso
from app.application.use_cases.matricula_casos_uso import MatriculaCasosUso
from app.application.use_cases.panel_casos_uso import PanelCasosUso
from app.application.use_cases.autenticacion_casos_uso import AutenticacionCasosUso
from app.application.use_cases.aula_casos_uso import AulaCasosUso

from app.application.seguridad import descodificar_token_jwt
from app.application.dtos.usuario_dto import UsuarioRespuestaDTO

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/login", auto_error=False)

def obtener_autenticacion_casos_uso(bd: Session = Depends(obtener_bd)) -> AutenticacionCasosUso:
    usuario_repo = UsuarioRepositorioImpl(bd)
    estudiante_repo = EstudianteRepositorioImpl(bd)
    docente_repo = DocenteRepositorioImpl(bd)
    return AutenticacionCasosUso(usuario_repo, estudiante_repo, docente_repo)

def obtener_carrera_casos_uso(bd: Session = Depends(obtener_bd)) -> CarreraCasosUso:
    repo = CarreraRepositorioImpl(bd)
    return CarreraCasosUso(repo)

def obtener_aula_casos_uso(bd: Session = Depends(obtener_bd)) -> AulaCasosUso:
    repo = AulaRepositorioImpl(bd)
    return AulaCasosUso(repo)

def obtener_estudiante_casos_uso(bd: Session = Depends(obtener_bd)) -> EstudianteCasosUso:
    estudiante_repo = EstudianteRepositorioImpl(bd)
    carrera_repo = CarreraRepositorioImpl(bd)
    usuario_repo = UsuarioRepositorioImpl(bd)
    return EstudianteCasosUso(estudiante_repo, carrera_repo, usuario_repo)

def obtener_docente_casos_uso(bd: Session = Depends(obtener_bd)) -> DocenteCasosUso:
    docente_repo = DocenteRepositorioImpl(bd)
    usuario_repo = UsuarioRepositorioImpl(bd)
    return DocenteCasosUso(docente_repo, usuario_repo)

def obtener_asignatura_casos_uso(bd: Session = Depends(obtener_bd)) -> AsignaturaCasosUso:
    asignatura_repo = AsignaturaRepositorioImpl(bd)
    docente_repo = DocenteRepositorioImpl(bd)
    carrera_repo = CarreraRepositorioImpl(bd)
    return AsignaturaCasosUso(asignatura_repo, docente_repo, carrera_repo)

def obtener_matricula_casos_uso(bd: Session = Depends(obtener_bd)) -> MatriculaCasosUso:
    matricula_repo = MatriculaRepositorioImpl(bd)
    estudiante_repo = EstudianteRepositorioImpl(bd)
    asignatura_repo = AsignaturaRepositorioImpl(bd)
    return MatriculaCasosUso(matricula_repo, estudiante_repo, asignatura_repo)

def obtener_panel_casos_uso(bd: Session = Depends(obtener_bd)) -> PanelCasosUso:
    return PanelCasosUso(
        estudiante_repo=EstudianteRepositorioImpl(bd),
        docente_repo=DocenteRepositorioImpl(bd),
        carrera_repo=CarreraRepositorioImpl(bd),
        asignatura_repo=AsignaturaRepositorioImpl(bd),
        matricula_repo=MatriculaRepositorioImpl(bd)
    )

def obtener_usuario_actual(
    token: str = Depends(oauth2_scheme),
    auth_casos_uso: AutenticacionCasosUso = Depends(obtener_autenticacion_casos_uso)
) -> UsuarioRespuestaDTO:
    """Extraer y validar el usuario actual desde el Token JWT Bearer."""
    if not token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Se requiere un Token JWT Bearer de autenticación válido.",
            headers={"WWW-Authenticate": "Bearer"},
        )
    try:
        payload = descodificar_token_jwt(token)
        usuario_id = int(payload.get("sub"))
        return auth_casos_uso.obtener_perfil_usuario(usuario_id)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Token inválido o expirado: {str(e)}",
            headers={"WWW-Authenticate": "Bearer"},
        )

def requerir_roles(roles_permitidos: List[str]):
    """Verificador de permisos por Rol (RBAC)."""
    def verificador_rol(usuario: UsuarioRespuestaDTO = Depends(obtener_usuario_actual)):
        if usuario.rol not in roles_permitidos:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Acceso denegado. Su rol ({usuario.rol}) no tiene los permisos suficientes."
            )
        return usuario
    return verificador_rol
