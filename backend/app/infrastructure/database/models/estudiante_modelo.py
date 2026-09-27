from sqlalchemy import Column, Integer, String, Date, Float, DateTime, ForeignKey, func
from sqlalchemy.orm import relationship
from app.infrastructure.database.sesion import Base

class EstudianteModelo(Base):
    __tablename__ = "estudiantes"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    cedula = Column(String(20), unique=True, index=True, nullable=False)
    nombres = Column(String(100), nullable=False)
    apellidos = Column(String(100), nullable=False)
    correo = Column(String(150), unique=True, index=True, nullable=False)
    telefono = Column(String(20), nullable=True)
    carrera_id = Column(Integer, ForeignKey("carreras.id", ondelete="RESTRICT"), nullable=False)
    semestre_actual = Column(Integer, default=1, nullable=False)
    estado = Column(String(20), default="Activo", nullable=False)
    promedio_acumulado = Column(Float, default=0.0, nullable=False)
    creditos_aprobados = Column(Integer, default=0, nullable=False)
    fecha_ingreso = Column(Date, nullable=True)
    fecha_creacion = Column(DateTime, server_default=func.now())

    carrera = relationship("CarreraModelo", back_populates="estudiantes")
    matriculas = relationship("MatriculaModelo", back_populates="estudiante", cascade="all, delete-orphan")
