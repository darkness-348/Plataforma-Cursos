from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.infrastructure.database.sesion import motor_bd, Base
from app.infrastructure.database.configuracion import configuracion


Base.metadata.create_all(bind=motor_bd)

aplicacion = FastAPI(
    title=configuracion.NOMBRE_PROYECTO,
    description="Sistema de Información Académica Universitaria construida con Arquitectura Limpia y Seguridad JWT Bearer.",
    version="2.1.0",
    openapi_url=f"{configuracion.PREFIX_API_V1}/openapi.json",
    docs_url="/docs",
    redoc_url="/redoc"
)


aplicacion.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


from app.presentation.api.v1.autenticacion_rutas import enrutador as auth_enrutador
from app.presentation.api.v1.panel_rutas import enrutador as panel_enrutador
from app.presentation.api.v1.carrera_rutas import enrutador as carrera_enrutador
from app.presentation.api.v1.estudiante_rutas import enrutador as estudiante_enrutador
from app.presentation.api.v1.docente_rutas import enrutador as docente_enrutador
from app.presentation.api.v1.asignatura_rutas import enrutador as asignatura_enrutador
from app.presentation.api.v1.matricula_rutas import enrutador as matricula_enrutador
from app.presentation.api.v1.aula_rutas import enrutador as aula_enrutador

aplicacion.include_router(auth_enrutador, prefix=configuracion.PREFIX_API_V1)
aplicacion.include_router(panel_enrutador, prefix=configuracion.PREFIX_API_V1)
aplicacion.include_router(carrera_enrutador, prefix=configuracion.PREFIX_API_V1)
aplicacion.include_router(estudiante_enrutador, prefix=configuracion.PREFIX_API_V1)
aplicacion.include_router(docente_enrutador, prefix=configuracion.PREFIX_API_V1)
aplicacion.include_router(asignatura_enrutador, prefix=configuracion.PREFIX_API_V1)
aplicacion.include_router(matricula_enrutador, prefix=configuracion.PREFIX_API_V1)
aplicacion.include_router(aula_enrutador, prefix=configuracion.PREFIX_API_V1)

@aplicacion.get("/")
def inicio():
    return {
        "sistema": "Sistema Académico Universitario - Backend",
        "arquitectura": "Clean Architecture (Arquitectura Limpia)",
        "seguridad": "JWT Bearer & Bcrypt Hashing",
        "estado": "En línea",
        "documentacion": "/docs"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("principal:aplicacion", host="0.0.0.0", port=8000, reload=True)
