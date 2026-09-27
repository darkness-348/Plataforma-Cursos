from fastapi import APIRouter, Depends, HTTPException, status, Query
from typing import List, Optional
from app.application.dtos.estudiante_dto import EstudianteCrearDTO, EstudianteActualizarDTO, EstudianteRespuestaDTO
from app.application.use_cases.estudiante_casos_uso import EstudianteCasosUso
from app.application.use_cases.carrera_casos_uso import CarreraCasosUso
from app.presentation.api.dependencias import obtener_estudiante_casos_uso, obtener_carrera_casos_uso
from app.domain.excepciones import EntidadNoEncontradaExcepcion, EntidadYaExisteExcepcion

enrutador = APIRouter(prefix="/estudiantes", tags=["Estudiantes"])

@enrutador.get("/", response_model=List[EstudianteRespuestaDTO])
def listar_estudiantes(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=500),
    busqueda: Optional[str] = None,
    carrera_id: Optional[int] = None,
    estudiante_casos_uso: EstudianteCasosUso = Depends(obtener_estudiante_casos_uso),
    carrera_casos_uso: CarreraCasosUso = Depends(obtener_carrera_casos_uso)
):
    """Listar todos los estudiantes matriculados con datos de carrera asociadas."""
    estudiantes = estudiante_casos_uso.listar_estudiantes(skip=skip, limit=limit, busqueda=busqueda, carrera_id=carrera_id)
    
    resultado = []
    for est in estudiantes:
        dto = EstudianteRespuestaDTO.model_validate(est)
        try:
            carrera = carrera_casos_uso.obtener_carrera_por_id(est.carrera_id)
            dto.carrera = carrera
        except Exception:
            pass
        resultado.append(dto)
    return resultado

@enrutador.get("/{estudiante_id}", response_model=EstudianteRespuestaDTO)
def obtener_estudiante(
    estudiante_id: int,
    estudiante_casos_uso: EstudianteCasosUso = Depends(obtener_estudiante_casos_uso),
    carrera_casos_uso: CarreraCasosUso = Depends(obtener_carrera_casos_uso)
):
    """Obtener información detallada de un estudiante."""
    try:
        est = estudiante_casos_uso.obtener_estudiante_por_id(estudiante_id)
        dto = EstudianteRespuestaDTO.model_validate(est)
        try:
            dto.carrera = carrera_casos_uso.obtener_carrera_por_id(est.carrera_id)
        except Exception:
            pass
        return dto
    except EntidadNoEncontradaExcepcion as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))

@enrutador.post("/", response_model=EstudianteRespuestaDTO, status_code=status.HTTP_201_CREATED)
def crear_estudiante(dto: EstudianteCrearDTO, estudiante_casos_uso: EstudianteCasosUso = Depends(obtener_estudiante_casos_uso)):
    """Inscribir un nuevo estudiante en la universidad."""
    try:
        return estudiante_casos_uso.crear_estudiante(dto)
    except EntidadYaExisteExcepcion as e:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail=str(e))
    except EntidadNoEncontradaExcepcion as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))

@enrutador.put("/{estudiante_id}", response_model=EstudianteRespuestaDTO)
def actualizar_estudiante(estudiante_id: int, dto: EstudianteActualizarDTO, estudiante_casos_uso: EstudianteCasosUso = Depends(obtener_estudiante_casos_uso)):
    """Actualizar expediente académico del estudiante."""
    try:
        return estudiante_casos_uso.actualizar_estudiante(estudiante_id, dto)
    except EntidadNoEncontradaExcepcion as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))
    except EntidadYaExisteExcepcion as e:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail=str(e))

@enrutador.delete("/{estudiante_id}", status_code=status.HTTP_204_NO_CONTENT)
def eliminar_estudiante(estudiante_id: int, estudiante_casos_uso: EstudianteCasosUso = Depends(obtener_estudiante_casos_uso)):
    """Dar de baja a un estudiante."""
    try:
        estudiante_casos_uso.eliminar_estudiante(estudiante_id)
    except EntidadNoEncontradaExcepcion as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))
