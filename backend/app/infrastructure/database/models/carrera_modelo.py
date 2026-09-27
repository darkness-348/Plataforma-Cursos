from sqlalchemy import Column, Integer, String, DateTime, func
from sqlalchemy.orm import relationship
from app.infrastructure.database.sesion import Base

class CarreraModelo(Base):
    __tablename__ = "carreras"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    codigo = Column(String(20), unique=True, index=True, nullable=False)
    nombre = Column(String(150), nullable=False)
    facultad = Column(String(150), nullable=False)
    duracion_semestres = Column(Integer, default=10, nullable=False)
    total_creditos = Column(Integer, default=220, nullable=False)
    estado = Column(String(20), default="Activa", nullable=False)
    fecha_creacion = Column(DateTime, server_default=func.now())

    estudiantes = relationship("EstudianteModelo", back_populates="carrera")
    asignaturas = relationship("AsignaturaModelo", back_populates="carrera")
