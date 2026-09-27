from sqlalchemy import Column, Integer, String, DateTime
from datetime import datetime
from app.infrastructure.database.sesion import Base

class AulaModelo(Base):
    __tablename__ = "aulas"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    codigo = Column(String(20), unique=True, index=True, nullable=False)
    nombre = Column(String(100), nullable=False)
    edificio = Column(String(100), nullable=False)
    capacidad_maxima = Column(Integer, nullable=False, default=30)
    tipo = Column(String(50), nullable=False, default="Aula Teórica")
    estado = Column(String(30), nullable=False, default="Disponible")
    fecha_creacion = Column(DateTime, default=datetime.utcnow)
