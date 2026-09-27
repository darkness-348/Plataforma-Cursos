from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, func
from sqlalchemy.orm import relationship
from app.infrastructure.database.sesion import Base

class AsignaturaModelo(Base):
    __tablename__ = "asignaturas"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    codigo = Column(String(20), unique=True, index=True, nullable=False)
    nombre = Column(String(150), nullable=False)
    creditos = Column(Integer, nullable=False)
    carrera_id = Column(Integer, ForeignKey("carreras.id", ondelete="CASCADE"), nullable=False)
    semestre_nivel = Column(Integer, default=1, nullable=False)
    docente_id = Column(Integer, ForeignKey("docentes.id", ondelete="SET NULL"), nullable=True)
    periodo_academico = Column(String(20), default="2026-1", nullable=False)
    capacidad_maxima = Column(Integer, default=30, nullable=False)
    estudiantes_inscritos = Column(Integer, default=0, nullable=False)
    aula_id = Column(Integer, ForeignKey("aulas.id", ondelete="SET NULL"), nullable=True)
    aula = Column(String(50), nullable=True)
    horario = Column(String(100), nullable=True)
    estado = Column(String(20), default="Abierto", nullable=False)
    fecha_creacion = Column(DateTime, server_default=func.now())

    carrera = relationship("CarreraModelo", back_populates="asignaturas")
    docente = relationship("DocenteModelo", back_populates="asignaturas")
    aula_rel = relationship("AulaModelo")
    matriculas = relationship("MatriculaModelo", back_populates="asignatura", cascade="all, delete-orphan")
