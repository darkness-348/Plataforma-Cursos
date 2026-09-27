from sqlalchemy import Column, Integer, String, DateTime, func
from sqlalchemy.orm import relationship
from app.infrastructure.database.sesion import Base

class DocenteModelo(Base):
    __tablename__ = "docentes"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    dni = Column(String(20), unique=True, index=True, nullable=False)
    nombres = Column(String(100), nullable=False)
    apellidos = Column(String(100), nullable=False)
    correo = Column(String(150), unique=True, index=True, nullable=False)
    telefono = Column(String(20), nullable=True)
    especialidad = Column(String(100), nullable=False)
    grado_academico = Column(String(50), nullable=False)
    tipo_contrato = Column(String(50), default="Tiempo Completo", nullable=False)
    departamento = Column(String(100), default="Ingeniería", nullable=False)
    estado = Column(String(20), default="Activo", nullable=False)
    fecha_creacion = Column(DateTime, server_default=func.now())

    asignaturas = relationship("AsignaturaModelo", back_populates="docente")
