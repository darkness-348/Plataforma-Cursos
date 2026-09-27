from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from app.infrastructure.database.configuracion import configuracion

db_url = configuracion.DATABASE_URL
connect_args = {}
if db_url.startswith("sqlite"):
    connect_args = {"check_same_thread": False}

motor_bd = create_engine(
    db_url,
    connect_args=connect_args,
    echo=False
)

SesionLocal = sessionmaker(autocommit=False, autoflush=False, bind=motor_bd)

Base = declarative_base()

def obtener_bd():
    bd = SesionLocal()
    try:
        yield bd
    finally:
        bd.close()
