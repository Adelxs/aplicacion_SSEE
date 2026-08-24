from sqlalchemy import Column, Integer, String, Date, Text, ForeignKey, Boolean
from app.database import Base
from sqlalchemy.orm import relationship

class Hogar(Base):
    __tablename__ = "hogares"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    id_hogar = Column(Integer, unique=True, nullable=False)
    cuidador_principal = Column(String(150), nullable=False)
    psdf = Column(String(150), nullable=False)
    direccion = Column(String(250), nullable=False)
    telefono = Column(String(50))
    unidad_vecinal = Column(String(100))
    estado = Column(String(50), nullable=False, default="Activo")
    
    ##Relacion con la tabla intervencion
    intervenciones = relationship("Intervencion", back_populates="hogar")
    
    ##Relacion con la tabla lista_espera
    lista_espera = relationship(
    "ListaEspera",
    back_populates="hogar"
)
    
class Profesional(Base):
    __tablename__ = "profesionales"

    id = Column(Integer, primary_key=True)
    nombre = Column(String(150), nullable=False)
    disciplina = Column(String(100), nullable=False)
    activo = Column(Boolean, nullable=False, default=True)
    
    ##Relacion con la tabla intervencion
    intervenciones = relationship("Intervencion", back_populates="profesional")
    
    ##Relacion con la tabla lista_espera
    lista_espera = relationship(
    "ListaEspera",
    back_populates="profesional"
    )
    
    ##Relacion con la tabla usuarios
    usuario = relationship(
    "Usuario",
    back_populates="profesional",
    uselist=False
)
    
class Intervencion(Base):
    __tablename__ = "intervenciones"

    id = Column(Integer, primary_key=True)
    hogar_id = Column(Integer, ForeignKey("hogares.id"), nullable=False)
    profesional_id = Column(Integer, ForeignKey("profesionales.id"), nullable=False)

    tipo = Column(String(50), nullable=False)
    numero_intervencion = Column(Integer, nullable=True)

    fecha_programada = Column(Date, nullable=True)
    fecha_realizada = Column(Date, nullable=True)

    estado = Column(String(50), nullable=False)
    observaciones = Column(Text, nullable=True)
    
    ##Relaciones tablas hogar y profesional
    hogar = relationship("Hogar", back_populates="intervenciones")
    profesional = relationship("Profesional", back_populates="intervenciones")
    
class ListaEspera(Base):
    __tablename__ = "lista_espera"

    id = Column(Integer, primary_key=True)

    hogar_id = Column(
        Integer,
        ForeignKey("hogares.id"),
        nullable=False
    )

    profesional_id = Column(
        Integer,
        ForeignKey("profesionales.id"),
        nullable=True
    )

    disciplina_requerida = Column(
        String(100),
        nullable=False
    )

    dia_preferente = Column(
        String(20),
        nullable=True
    )

    estado = Column(
        String(50),
        nullable=False,
        default="Pendiente"
    )

    fecha_solicitud = Column(
        Date,
        nullable=False
    )

    observaciones = Column(
        String(500),
        nullable=True
    )

    hogar = relationship(
        "Hogar",
        back_populates="lista_espera"
    )

    profesional = relationship(
        "Profesional",
        back_populates="lista_espera"
    )
    
class Usuario(Base):
        __tablename__ = "usuarios"

        id = Column(Integer, primary_key=True)

        username = Column(
            String(100),
            unique=True,
            nullable=False
        )

        password_hash = Column(
            String(255),
            nullable=False
        )

        rol = Column(
            String(50),
            nullable=False
        )

        activo = Column(
            Boolean,
            nullable=False,
            default=True
        )

        profesional_id = Column(
            Integer,
            ForeignKey("profesionales.id"),
            nullable=True
        )

        profesional = relationship(
            "Profesional",
            back_populates="usuario"
        )