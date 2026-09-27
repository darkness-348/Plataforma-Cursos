from fastapi import APIRouter, Depends, HTTPException, status, Query
from typing import List, Optional
from app.application.dtos.docente_dto import DocenteCrearDTO, DocenteActualizarDTO, DocenteRespuestaDTO
from app.application.use_cases.docente_casos_uso import DocenteCasosUso
from app.presentation.api.dependencias import obtener_docente_casos_uso
from app.domain.excepciones import EntidadNoEncontradaExcepcion, EntidadYaExisteExcepcion

enrutador = APIRouter(prefix="/docentes", tags=["Docentes"])

@enrutador.get("/", response_model=List[DocenteRespuestaDTO])
def listar_docentes(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=500),
    busqueda: Optional[str] = None,
    casos_uso: DocenteCasosUso = Depends(obtener_docente_casos_uso)
):
    """Listar nómina de docentes universitarios."""
    return casos_uso.listar_docentes(skip=skip, limit=limit, busqueda=busqueda)

@enrutador.get("/{docente_id}", response_model=DocenteRespuestaDTO)
def obtener_docente(docente_id: int, casos_uso: DocenteCasosUso = Depends(obtener_docente_casos_uso)):
    """Obtener detalle de docente por ID."""
    try:
        return casos_uso.obtener_docente_por_id(docente_id)
    except EntidadNoEncontradaExcepcion as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))

@enrutador.post("/", response_model=DocenteRespuestaDTO, status_code=status.HTTP_201_CREATED)
def crear_docente(dto: DocenteCrearDTO, casos_uso: DocenteCasosUso = Depends(obtener_docente_casos_uso)):
    """Registrar un nuevo docente académico."""
    try:
        return casos_uso.crear_docente(dto)
    except EntidadYaExisteExcepcion as e:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail=str(e))

@enrutador.put("/{docente_id}", response_model=DocenteRespuestaDTO)
def actualizar_docente(docente_id: int, dto: DocenteActualizarDTO, casos_uso: DocenteCasosUso = Depends(obtener_docente_casos_uso)):
    """Actualizar datos del docente."""
    try:
        return casos_uso.actualizar_docente(docente_id, dto)
    except EntidadNoEncontradaExcepcion as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))
    except EntidadYaExisteExcepcion as e:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail=str(e))

@enrutador.delete("/{docente_id}", status_code=status.HTTP_204_NO_CONTENT)
def eliminar_docente(docente_id: int, casos_uso: DocenteCasosUso = Depends(obtener_docente_casos_uso)):
    """Eliminar o retirar a un docente del sistema."""
    try:
        casos_uso.eliminar_docente(docente_id)
    except EntidadNoEncontradaExcepcion as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))
