from fastapi import APIRouter, Depends, HTTPException, status, Query
from typing import List
from app.application.dtos.carrera_dto import CarreraCrearDTO, CarreraActualizarDTO, CarreraRespuestaDTO
from app.application.use_cases.carrera_casos_uso import CarreraCasosUso
from app.presentation.api.dependencias import obtener_carrera_casos_uso
from app.domain.excepciones import EntidadNoEncontradaExcepcion, EntidadYaExisteExcepcion

enrutador = APIRouter(prefix="/carreras", tags=["Carreras Universitarias"])

@enrutador.get("/", response_model=List[CarreraRespuestaDTO])
def listar_carreras(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=500),
    casos_uso: CarreraCasosUso = Depends(obtener_carrera_casos_uso)
):
    """Listar todas las carreras académicas ofertadas por la universidad."""
    return casos_uso.listar_carreras(skip=skip, limit=limit)

@enrutador.get("/{carrera_id}", response_model=CarreraRespuestaDTO)
def obtener_carrera(carrera_id: int, casos_uso: CarreraCasosUso = Depends(obtener_carrera_casos_uso)):
    """Obtener detalle de una carrera por su ID."""
    try:
        return casos_uso.obtener_carrera_por_id(carrera_id)
    except EntidadNoEncontradaExcepcion as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))

@enrutador.post("/", response_model=CarreraRespuestaDTO, status_code=status.HTTP_201_CREATED)
def crear_carrera(dto: CarreraCrearDTO, casos_uso: CarreraCasosUso = Depends(obtener_carrera_casos_uso)):
    """Registrar una nueva carrera universitaria."""
    try:
        return casos_uso.crear_carrera(dto)
    except EntidadYaExisteExcepcion as e:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail=str(e))

@enrutador.put("/{carrera_id}", response_model=CarreraRespuestaDTO)
def actualizar_carrera(carrera_id: int, dto: CarreraActualizarDTO, casos_uso: CarreraCasosUso = Depends(obtener_carrera_casos_uso)):
    """Actualizar información de una carrera existente."""
    try:
        return casos_uso.actualizar_carrera(carrera_id, dto)
    except EntidadNoEncontradaExcepcion as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))
    except EntidadYaExisteExcepcion as e:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail=str(e))

@enrutador.delete("/{carrera_id}", status_code=status.HTTP_204_NO_CONTENT)
def eliminar_carrera(carrera_id: int, casos_uso: CarreraCasosUso = Depends(obtener_carrera_casos_uso)):
    """Eliminar una carrera académica."""
    try:
        casos_uso.eliminar_carrera(carrera_id)
    except EntidadNoEncontradaExcepcion as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))
