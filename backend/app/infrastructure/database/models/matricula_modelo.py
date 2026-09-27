from sqlalchemy import Column, Integer, String, Date, Float, DateTime, ForeignKey, UniqueConstraint, func
from sqlalchemy.orm import relationship
from app.infrastructure.database.sesion import Base

class MatriculaModelo(Base):
    __tablename__ = "matriculas"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    estudiante_id = Column(Integer, ForeignKey("estudiantes.id", ondelete="CASCADE"), nullable=False)
    asignatura_id = Column(Integer, ForeignKey("asignaturas.id", ondelete="CASCADE"), nullable=False)
    fecha_matricula = Column(Date, nullable=False)
    estado = Column(String(20), default="Inscrito", nullable=False)
    nota_primer_parcial = Column(Float, nullable=True)
    nota_segundo_parcial = Column(Float, nullable=True)
    nota_examen_final = Column(Float, nullable=True)
    nota_final = Column(Float, nullable=True)
    fecha_creacion = Column(DateTime, server_default=func.now())

    estudiante = relationship("EstudianteModelo", back_populates="matriculas")
    asignatura = relationship("AsignaturaModelo", back_populates="matriculas")

    __table_args__ = (
        UniqueConstraint("estudiante_id", "asignatura_id", name="uq_estudiante_asignatura"),
    )
