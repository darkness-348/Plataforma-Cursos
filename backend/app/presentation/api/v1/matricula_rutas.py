from fastapi import APIRouter, Depends, HTTPException, status, Query
from typing import List, Optional
from app.application.dtos.matricula_dto import MatriculaCrearDTO, MatriculaActualizarDTO, MatriculaRespuestaDTO
from app.application.use_cases.matricula_casos_uso import MatriculaCasosUso
from app.application.use_cases.estudiante_casos_uso import EstudianteCasosUso
from app.application.use_cases.asignatura_casos_uso import AsignaturaCasosUso
from app.presentation.api.dependencias import obtener_matricula_casos_uso, obtener_estudiante_casos_uso, obtener_asignatura_casos_uso
from app.domain.excepciones import EntidadNoEncontradaExcepcion, EntidadYaExisteExcepcion, ReglaNegocioExcepcion

enrutador = APIRouter(prefix="/matriculas", tags=["Matrículas & Calificaciones"])

@enrutador.get("/", response_model=List[MatriculaRespuestaDTO])
def listar_matriculas(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=500),
    estudiante_id: Optional[int] = None,
    asignatura_id: Optional[int] = None,
    matricula_casos_uso: MatriculaCasosUso = Depends(obtener_matricula_casos_uso),
    estudiante_casos_uso: EstudianteCasosUso = Depends(obtener_estudiante_casos_uso),
    asignatura_casos_uso: AsignaturaCasosUso = Depends(obtener_asignatura_casos_uso)
):
    """Listar matrículas de la universidad."""
    matriculas = matricula_casos_uso.listar_matriculas(skip=skip, limit=limit, estudiante_id=estudiante_id, asignatura_id=asignatura_id)
    
    resultado = []
    for mat in matriculas:
        dto = MatriculaRespuestaDTO.model_validate(mat)
        try:
            dto.estudiante = estudiante_casos_uso.obtener_estudiante_por_id(mat.estudiante_id)
        except Exception:
            pass
        try:
            dto.asignatura = asignatura_casos_uso.obtener_asignatura_por_id(mat.asignatura_id)
        except Exception:
            pass
        resultado.append(dto)
    return resultado

@enrutador.get("/{matricula_id}", response_model=MatriculaRespuestaDTO)
def obtener_matricula(
    matricula_id: int,
    matricula_casos_uso: MatriculaCasosUso = Depends(obtener_matricula_casos_uso),
    estudiante_casos_uso: EstudianteCasosUso = Depends(obtener_estudiante_casos_uso),
    asignatura_casos_uso: AsignaturaCasosUso = Depends(obtener_asignatura_casos_uso)
):
    """Obtener detalle de matrícula por ID."""
    try:
        mat = matricula_casos_uso.obtener_matricula_por_id(matricula_id)
        dto = MatriculaRespuestaDTO.model_validate(mat)
        try:
            dto.estudiante = estudiante_casos_uso.obtener_estudiante_por_id(mat.estudiante_id)
            dto.asignatura = asignatura_casos_uso.obtener_asignatura_por_id(mat.asignatura_id)
        except Exception:
            pass
        return dto
    except EntidadNoEncontradaExcepcion as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))

@enrutador.post("/", response_model=MatriculaRespuestaDTO, status_code=status.HTTP_201_CREATED)
def matricular_estudiante(
    dto: MatriculaCrearDTO,
    matricula_casos_uso: MatriculaCasosUso = Depends(obtener_matricula_casos_uso)
):
    """Efectuar matrícula académica de un estudiante."""
    try:
        return matricula_casos_uso.matricular_estudiante(dto)
    except EntidadNoEncontradaExcepcion as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))
    except EntidadYaExisteExcepcion as e:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail=str(e))
    except ReglaNegocioExcepcion as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))

@enrutador.put("/{matricula_id}", response_model=MatriculaRespuestaDTO)
def actualizar_matricula(
    matricula_id: int,
    dto: MatriculaActualizarDTO,
    matricula_casos_uso: MatriculaCasosUso = Depends(obtener_matricula_casos_uso)
):
    """Ingresar calificaciones parciales, examen final o actualizar estado."""
    try:
        return matricula_casos_uso.actualizar_matricula(matricula_id, dto)
    except EntidadNoEncontradaExcepcion as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))

@enrutador.delete("/{matricula_id}", status_code=status.HTTP_204_NO_CONTENT)
def cancelar_matricula(
    matricula_id: int,
    matricula_casos_uso: MatriculaCasosUso = Depends(obtener_matricula_casos_uso)
):
    """Cancelar o retirar la matrícula de la asignatura."""
    try:
        matricula_casos_uso.cancelar_matricula(matricula_id)
    except EntidadNoEncontradaExcepcion as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))
