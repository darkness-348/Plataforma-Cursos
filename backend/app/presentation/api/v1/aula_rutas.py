from fastapi import APIRouter, Depends, HTTPException, status, Query
from typing import List
from app.application.dtos.aula_dto import AulaCrearDTO, AulaActualizarDTO, AulaRespuestaDTO
from app.application.use_cases.aula_casos_uso import AulaCasosUso
from app.presentation.api.dependencias import obtener_aula_casos_uso
from app.domain.excepciones import EntidadNoEncontradaExcepcion, EntidadYaExisteExcepcion

enrutador = APIRouter(prefix="/aulas", tags=["Aulas & Espacios Académicos"])

@enrutador.get("/", response_model=List[AulaRespuestaDTO])
def listar_aulas(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=500),
    casos_uso: AulaCasosUso = Depends(obtener_aula_casos_uso)
):
    """Listar todas las aulas universitarias con su capacidad y disponibilidad."""
    return casos_uso.listar_aulas(skip=skip, limit=limit)

@enrutador.get("/{aula_id}", response_model=AulaRespuestaDTO)
def obtener_aula(aula_id: int, casos_uso: AulaCasosUso = Depends(obtener_aula_casos_uso)):
    """Obtener detalle de un aula por su ID."""
    try:
        return casos_uso.obtener_aula_por_id(aula_id)
    except EntidadNoEncontradaExcepcion as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))

@enrutador.post("/", response_model=AulaRespuestaDTO, status_code=status.HTTP_201_CREATED)
def crear_aula(dto: AulaCrearDTO, casos_uso: AulaCasosUso = Depends(obtener_aula_casos_uso)):
    """Registrar una nueva aula física con capacidad."""
    try:
        return casos_uso.crear_aula(dto)
    except EntidadYaExisteExcepcion as e:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail=str(e))

@enrutador.put("/{aula_id}", response_model=AulaRespuestaDTO)
def actualizar_aula(aula_id: int, dto: AulaActualizarDTO, casos_uso: AulaCasosUso = Depends(obtener_aula_casos_uso)):
    """Actualizar información de un aula existente."""
    try:
        return casos_uso.actualizar_aula(aula_id, dto)
    except EntidadNoEncontradaExcepcion as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))
    except EntidadYaExisteExcepcion as e:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail=str(e))

@enrutador.delete("/{aula_id}", status_code=status.HTTP_204_NO_CONTENT)
def eliminar_aula(aula_id: int, casos_uso: AulaCasosUso = Depends(obtener_aula_casos_uso)):
    """Eliminar un aula."""
    try:
        casos_uso.eliminar_aula(aula_id)
    except EntidadNoEncontradaExcepcion as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))
