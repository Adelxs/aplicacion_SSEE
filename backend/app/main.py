from fastapi import FastAPI, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import Base, engine, get_db
from app import models, schemas
from fastapi.middleware.cors import CORSMiddleware

from app.database import Base, engine
from app import models


app = FastAPI(
    title="Aplicación SSEE",
    description="Sistema de gestión de Servicios de Apoyo",
    version="0.1.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


Base.metadata.create_all(bind=engine)


@app.get("/")
def inicio():
    return {
        "mensaje": "API SSEE funcionando"
    }
    
@app.post("/hogares")
def crear_hogar(
    hogar: schemas.HogarCreate,
    db: Session = Depends(get_db)
):
    nuevo_hogar = models.Hogar(
        cuidador_principal=hogar.cuidador_principal,
        psdf=hogar.psdf,
        direccion=hogar.direccion,
        telefono=hogar.telefono,
        unidad_vecinal=hogar.unidad_vecinal
    )

    db.add(nuevo_hogar)
    db.commit()
    db.refresh(nuevo_hogar)

    return nuevo_hogar    


@app.get("/hogares")
def obtener_hogares(db: Session = Depends(get_db)):
    hogares = db.query(models.Hogar).all()

    return hogares

@app.get("/hogares/{id}")
def obtener_hogar(id: int, db: Session = Depends(get_db)):
    hogar = db.query(models.Hogar).filter(models.Hogar.id == id).first()

    return hogar

@app.get("/hogares/{id}")
def obtener_hogar(id: int, db: Session = Depends(get_db)):

    hogar = db.query(models.Hogar).filter(models.Hogar.id == id).first()

    if hogar is None:
        raise HTTPException(
            status_code=404,
            detail="Hogar no encontrado"
        )

    return hogar

@app.put("/hogares/{hogar_id}")
def actualizar_hogar(
    hogar_id: int,
    hogar: schemas.HogarCreate,
    db: Session = Depends(get_db)
):
    hogar_db = db.query(models.Hogar).filter(
        models.Hogar.id == hogar_id
    ).first()

    if hogar_db is None:
        raise HTTPException(
            status_code=404,
            detail="Hogar no encontrado"
        )

    hogar_db.cuidador_principal = hogar.cuidador_principal
    hogar_db.psdf = hogar.psdf
    hogar_db.direccion = hogar.direccion
    hogar_db.telefono = hogar.telefono
    hogar_db.unidad_vecinal = hogar.unidad_vecinal
    hogar_db.estado = hogar.estado

    db.commit()
    db.refresh(hogar_db)

    return hogar_db

@app.delete("/hogares/{hogar_id}")
def eliminar_hogar(
    hogar_id: int,
    db: Session = Depends(get_db)
):
    hogar_db = db.query(models.Hogar).filter(
        models.Hogar.id == hogar_id
    ).first()

    if hogar_db is None:
        raise HTTPException(
            status_code=404,
            detail="Hogar no encontrado"
        )

    db.delete(hogar_db)
    db.commit()

    return {
        "mensaje": "Hogar eliminado correctamente"
    }