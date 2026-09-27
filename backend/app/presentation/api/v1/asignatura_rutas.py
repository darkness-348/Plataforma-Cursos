from fastapi import APIRouter, Depends, HTTPException, status, Query
from typing import List, Optional
from app.application.dtos.asignatura_dto import AsignaturaCrearDTO, AsignaturaActualizarDTO, AsignaturaRespuestaDTO
from app.application.use_cases.asignatura_casos_uso import AsignaturaCasosUso
from app.application.use_cases.docente_casos_uso import DocenteCasosUso
from app.application.use_cases.carrera_casos_uso import CarreraCasosUso
from app.presentation.api.dependencias import obtener_asignatura_casos_uso, obtener_docente_casos_uso, obtener_carrera_casos_uso
from app.domain.excepciones import EntidadNoEncontradaExcepcion, EntidadYaExisteExcepcion, ReglaNegocioExcepcion

enrutador = APIRouter(prefix="/asignaturas", tags=["Asignaturas & Cursos"])

@enrutador.get("/", response_model=List[AsignaturaRespuestaDTO])
def listar_asignaturas(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=500),
    busqueda: Optional[str] = None,
    periodo: Optional[str] = None,
    carrera_id: Optional[int] = None,
    docente_id: Optional[int] = None,
    asignatura_casos_uso: AsignaturaCasosUso = Depends(obtener_asignatura_casos_uso),
    docente_casos_uso: DocenteCasosUso = Depends(obtener_docente_casos_uso),
    carrera_casos_uso: CarreraCasosUso = Depends(obtener_carrera_casos_uso)
):
    """Listar todas las asignaturas universitarias."""
    asignaturas = asignatura_casos_uso.listar_asignaturas(skip=skip, limit=limit, busqueda=busqueda, periodo=periodo, carrera_id=carrera_id, docente_id=docente_id)
    
    resultado = []
    for asig in asignaturas:
        dto = AsignaturaRespuestaDTO.model_validate(asig)
        if asig.docente_id:
            try:
                dto.docente = docente_casos_uso.obtener_docente_por_id(asig.docente_id)
            except Exception:
                pass
        if asig.carrera_id:
            try:
                dto.carrera = carrera_casos_uso.obtener_carrera_por_id(asig.carrera_id)
            except Exception:
                pass
        resultado.append(dto)
    return resultado

@enrutador.get("/{asignatura_id}", response_model=AsignaturaRespuestaDTO)
def obtener_asignatura(
    asignatura_id: int,
    asignatura_casos_uso: AsignaturaCasosUso = Depends(obtener_asignatura_casos_uso),
    docente_casos_uso: DocenteCasosUso = Depends(obtener_docente_casos_uso),
    carrera_casos_uso: CarreraCasosUso = Depends(obtener_carrera_casos_uso)
):
    """Obtener detalle de una asignatura por su ID."""
    try:
        asig = asignatura_casos_uso.obtener_asignatura_por_id(asignatura_id)
        dto = AsignaturaRespuestaDTO.model_validate(asig)
        if asig.docente_id:
            try:
                dto.docente = docente_casos_uso.obtener_docente_por_id(asig.docente_id)
            except Exception:
                pass
        if asig.carrera_id:
            try:
                dto.carrera = carrera_casos_uso.obtener_carrera_por_id(asig.carrera_id)
            except Exception:
                pass
        return dto
    except EntidadNoEncontradaExcepcion as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))

@enrutador.post("/", response_model=AsignaturaRespuestaDTO, status_code=status.HTTP_201_CREATED)
def crear_asignatura(dto: AsignaturaCrearDTO, asignatura_casos_uso: AsignaturaCasosUso = Depends(obtener_asignatura_casos_uso)):
    """Crear una nueva asignatura académica."""
    try:
        return asignatura_casos_uso.crear_asignatura(dto)
    except EntidadYaExisteExcepcion as e:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail=str(e))
    except EntidadNoEncontradaExcepcion as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))

@enrutador.put("/{asignatura_id}", response_model=AsignaturaRespuestaDTO)
def actualizar_asignatura(asignatura_id: int, dto: AsignaturaActualizarDTO, asignatura_casos_uso: AsignaturaCasosUso = Depends(obtener_asignatura_casos_uso)):
    """Modificar asignatura o asignar docente titular."""
    try:
        return asignatura_casos_uso.actualizar_asignatura(asignatura_id, dto)
    except EntidadNoEncontradaExcepcion as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))
    except EntidadYaExisteExcepcion as e:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail=str(e))
    except ReglaNegocioExcepcion as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))

@enrutador.delete("/{asignatura_id}", status_code=status.HTTP_204_NO_CONTENT)
def eliminar_asignatura(asignatura_id: int, asignatura_casos_uso: AsignaturaCasosUso = Depends(obtener_asignatura_casos_uso)):
    """Eliminar asignatura del programa."""
    try:
        asignatura_casos_uso.eliminar_asignatura(asignatura_id)
    except EntidadNoEncontradaExcepcion as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))
