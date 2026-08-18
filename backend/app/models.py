from sqlalchemy import Column, Integer, String
from app.database import Base


class Hogar(Base):
    __tablename__ = "hogares"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    cuidador_principal = Column(String(150), nullable=False)
    psdf = Column(String(150), nullable=False)
    direccion = Column(String(250), nullable=False)
    telefono = Column(String(50))
    unidad_vecinal = Column(String(100))
    estado = Column(String(50), nullable=False, default="Activo")