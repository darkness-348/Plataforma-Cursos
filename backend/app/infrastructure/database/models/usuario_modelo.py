from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, func
from app.infrastructure.database.sesion import Base

class UsuarioModelo(Base):
    __tablename__ = "usuarios"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    nombre_completo = Column(String(150), nullable=False)
    correo = Column(String(150), unique=True, index=True, nullable=False)
    clave_hash = Column(String(255), nullable=False)
    rol = Column(String(50), default="Estudiante", nullable=False) # Administrador, Docente, Estudiante
    estudiante_id = Column(Integer, ForeignKey("estudiantes.id", ondelete="SET NULL"), nullable=True)
    docente_id = Column(Integer, ForeignKey("docentes.id", ondelete="SET NULL"), nullable=True)
    estado = Column(String(20), default="Activo", nullable=False)
    fecha_creacion = Column(DateTime, server_default=func.now())
