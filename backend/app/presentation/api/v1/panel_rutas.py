from fastapi import APIRouter, Depends
from typing import Dict, Any
from app.application.use_cases.panel_casos_uso import PanelCasosUso
from app.presentation.api.dependencias import obtener_panel_casos_uso

enrutador = APIRouter(prefix="/panel", tags=["Panel Principal & Métricas"])

@enrutador.get("/resumen")
def obtener_resumen_panel(casos_uso: PanelCasosUso = Depends(obtener_panel_casos_uso)) -> Dict[str, Any]:
    """Obtener resumen general y métricas institucionales para el panel académico."""
    return casos_uso.obtener_resumen_panel()

@enrutador.get("/reporte-decanato")
def obtener_reporte_decano(casos_uso: PanelCasosUso = Depends(obtener_panel_casos_uso)) -> Dict[str, Any]:
    """Obtener reporte ejecutivo institucional para Decanos y Rectores con desglose por carreras."""
    return casos_uso.obtener_reporte_decano()

