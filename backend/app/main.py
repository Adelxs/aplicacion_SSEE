from fastapi import FastAPI, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import Base, engine, get_db
from app import models, schemas
from fastapi.middleware.cors import CORSMiddleware
from app import security
from app.security import SECRET_KEY, ALGORITHM
from fastapi.security import OAuth2PasswordBearer
from fastapi.security import OAuth2PasswordRequestForm
from jose import jwt, JWTError

oauth2_scheme = OAuth2PasswordBearer(
    tokenUrl="login"
)

def obtener_usuario_actual(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db)
):
    try:
        payload = jwt.decode(
            token,
            SECRET_KEY,
            algorithms=[ALGORITHM]
        )

        usuario_id = payload.get("sub")

        if usuario_id is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Token inválido"
            )

    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token inválido o expirado"
        )

    usuario = db.query(models.Usuario).filter(
        models.Usuario.id == int(usuario_id)
    ).first()

    if usuario is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Usuario no encontrado"
        )

    if not usuario.activo:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Usuario inactivo"
        )

    return usuario

def requiere_admin(
    usuario = Depends(obtener_usuario_actual)
):
    if usuario.rol != "administrador":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="No tienes permisos de administrador"
        )

    return usuario

def requiere_profesional(
    usuario = Depends(obtener_usuario_actual)
):
    if usuario.rol != "profesional":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="No tienes permisos de profesional"
        )

    return usuario

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


####################################################################### Hogares #############################################################

@app.post("/hogares")
def crear_hogar(
    hogar: schemas.HogarCreate,
    db: Session = Depends(get_db)
):
    nuevo_hogar = models.Hogar(
        id_hogar=hogar.id_hogar,
        cuidador_principal=hogar.cuidador_principal,
        psdf=hogar.psdf,
        direccion=hogar.direccion,
        telefono=hogar.telefono,
        unidad_vecinal=hogar.unidad_vecinal,
        estado=hogar.estado
    )

    db.add(nuevo_hogar)
    db.commit()
    db.refresh(nuevo_hogar)

    return nuevo_hogar  


@app.get("/hogares")
def obtener_hogares(db: Session = Depends(get_db)):
    hogares = db.query(models.Hogar).all()

    return hogares

@app.get("/hogares/{id_hogar}")
def obtener_hogar(
    id_hogar: int,
    db: Session = Depends(get_db)
):

    hogar = db.query(models.Hogar).filter(
        models.Hogar.id_hogar == id_hogar
    ).first()

    if hogar is None:
        raise HTTPException(
            status_code=404,
            detail="Hogar no encontrado"
        )

    return hogar

@app.put("/hogares/{id_hogar}")
def actualizar_hogar(
    id_hogar: int,
    hogar: schemas.HogarCreate,
    db: Session = Depends(get_db)
):

    hogar_db = db.query(models.Hogar).filter(
        models.Hogar.id_hogar == id_hogar
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

@app.delete("/hogares/{id_hogar}")
def eliminar_hogar(
    id_hogar: int,
    db: Session = Depends(get_db)
):

    hogar_db = db.query(models.Hogar).filter(
        models.Hogar.id_hogar == id_hogar
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
    
    
################################################################ Profesionales ################################################################    
    
@app.get(
    "/profesionales",
    response_model=list[schemas.ProfesionalResponse]
)
def obtener_profesionales(
    db: Session = Depends(get_db)
):
    profesionales = db.query(models.Profesional).all()

    return profesionales


@app.post(
    "/profesionales",
    response_model=schemas.ProfesionalResponse
)
def crear_profesional(
    profesional: schemas.ProfesionalCreate,
    db: Session = Depends(get_db),
    usuario = Depends(requiere_admin)
):

    nuevo_profesional = models.Profesional(
        nombre=profesional.nombre,
        disciplina=profesional.disciplina,
        activo=profesional.activo
    )

    db.add(nuevo_profesional)
    db.commit()
    db.refresh(nuevo_profesional)

    return nuevo_profesional


@app.get(
    "/profesionales/{profesional_id}",
    response_model=schemas.ProfesionalResponse
)
def obtener_profesional(
    profesional_id: int,
    db: Session = Depends(get_db)
):

    profesional = db.query(models.Profesional).filter(
        models.Profesional.id == profesional_id
    ).first()

    if profesional is None:
        raise HTTPException(
            status_code=404,
            detail="Profesional no encontrado"
        )

    return profesional


@app.put(
    "/profesionales/{profesional_id}",
    response_model=schemas.ProfesionalResponse
)
def actualizar_profesional(
    profesional_id: int,
    profesional: schemas.ProfesionalUpdate,
    db: Session = Depends(get_db),
    usuario = Depends(requiere_admin)
):

    profesional_db = db.query(models.Profesional).filter(
        models.Profesional.id == profesional_id
    ).first()

    if profesional_db is None:
        raise HTTPException(
            status_code=404,
            detail="Profesional no encontrado"
        )

    profesional_db.nombre = profesional.nombre
    profesional_db.disciplina = profesional.disciplina
    profesional_db.activo = profesional.activo

    db.commit()
    db.refresh(profesional_db)

    return profesional_db

@app.patch("/profesionales/{profesional_id}/estado")
def cambiar_estado_profesional(
    profesional_id: int,
    db: Session = Depends(get_db)
):

    profesional = db.query(models.Profesional).filter(
        models.Profesional.id == profesional_id
    ).first()

    if profesional is None:
        raise HTTPException(
            status_code=404,
            detail="Profesional no encontrado"
        )

    profesional.activo = not profesional.activo

    db.commit()
    db.refresh(profesional)

    return profesional

######################################################################## Intervenciones ############################################################

@app.post("/intervenciones", response_model=schemas.IntervencionResponse)
def crear_intervencion(
    intervencion: schemas.IntervencionCreate,
    db: Session = Depends(get_db)
):
    nueva_intervencion = models.Intervencion(
        hogar_id=intervencion.hogar_id,
        profesional_id=intervencion.profesional_id,
        tipo=intervencion.tipo,
        numero_intervencion=intervencion.numero_intervencion,
        fecha_programada=intervencion.fecha_programada,
        fecha_realizada=intervencion.fecha_realizada,
        estado=intervencion.estado,
        observaciones=intervencion.observaciones
    )

    db.add(nueva_intervencion)
    db.commit()
    db.refresh(nueva_intervencion)

    return nueva_intervencion

@app.get("/intervenciones",response_model=list[schemas.IntervencionDetalle])
def obtener_intervenciones(db: Session = Depends(get_db)):

    intervenciones = db.query(models.Intervencion).all()

    return intervenciones

@app.get("/intervenciones/{id}", response_model=schemas.IntervencionDetalle)
def obtener_intervencion(id: int, db: Session = Depends(get_db)):

    intervencion = db.query(models.Intervencion).filter(
        models.Intervencion.id == id
    ).first()

    if intervencion is None:
        raise HTTPException(
            status_code=404,
            detail="Intervención no encontrada"
        )

    return intervencion

@app.put("/intervenciones/{id}", response_model=schemas.IntervencionDetalle)
def actualizar_intervencion(
    id: int,
    datos: schemas.IntervencionUpdate,
    db: Session = Depends(get_db)
):

    intervencion = db.query(models.Intervencion).filter(
        models.Intervencion.id == id
    ).first()

    if intervencion is None:
        raise HTTPException(
            status_code=404,
            detail="Intervención no encontrada"
        )

    datos_actualizados = datos.model_dump(exclude_unset=True)

    for campo, valor in datos_actualizados.items():
        setattr(intervencion, campo, valor)

    db.commit()
    db.refresh(intervencion)

    return intervencion

@app.delete("/intervenciones/{id}")
def eliminar_intervencion(
    id: int,
    db: Session = Depends(get_db)
):

    intervencion = db.query(models.Intervencion).filter(
        models.Intervencion.id == id
    ).first()

    if intervencion is None:
        raise HTTPException(
            status_code=404,
            detail="Intervención no encontrada"
        )

    db.delete(intervencion)
    db.commit()

    return {
        "mensaje": "Intervención eliminada correctamente"
    }
    
################################################################# Lista de espera ############################################################
    
@app.post("/lista-espera", response_model=list[schemas.ListaEsperaDetalle])
def crear_lista_espera(
    datos: schemas.ListaEsperaCreate,
    db: Session = Depends(get_db)
):
    nueva_entrada = models.ListaEspera(**datos.model_dump())

    db.add(nueva_entrada)
    db.commit()
    db.refresh(nueva_entrada)

    return nueva_entrada

@app.get("/lista-espera", response_model=list[schemas.ListaEsperaResponse])
def obtener_lista_espera(db: Session = Depends(get_db)):

    lista = db.query(models.ListaEspera).all()

    return lista

@app.get("/lista-espera/{id}",response_model=schemas.ListaEsperaDetalle)
def obtener_lista_espera_por_id(
    id: int,
    db: Session = Depends(get_db)
):

    entrada = db.query(models.ListaEspera).filter(
        models.ListaEspera.id == id
    ).first()

    if entrada is None:
        raise HTTPException(
            status_code=404,
            detail="Entrada de lista de espera no encontrada"
        )

    return entrada

@app.put(
    "/lista-espera/{id}",
    response_model=schemas.ListaEsperaDetalle
)
def actualizar_lista_espera(
    id: int,
    datos: schemas.ListaEsperaUpdate,
    db: Session = Depends(get_db)
):

    entrada = db.query(models.ListaEspera).filter(
        models.ListaEspera.id == id
    ).first()

    if entrada is None:
        raise HTTPException(
            status_code=404,
            detail="Entrada de lista de espera no encontrada"
        )

    datos_actualizados = datos.model_dump(
        exclude_unset=True
    )

    for campo, valor in datos_actualizados.items():
        setattr(entrada, campo, valor)

    db.commit()
    db.refresh(entrada)

    return entrada

@app.delete("/lista-espera/{id}")
def eliminar_lista_espera(
    id: int,
    db: Session = Depends(get_db)
):

    entrada = db.query(models.ListaEspera).filter(
        models.ListaEspera.id == id
    ).first()

    if entrada is None:
        raise HTTPException(
            status_code=404,
            detail="Entrada de lista de espera no encontrada"
        )

    db.delete(entrada)
    db.commit()

    return {
        "mensaje": "Entrada de lista de espera eliminada correctamente"
    }
    

################################################################ Dashboard ##################################################
    
@app.get("/dashboard/resumen")
def obtener_resumen_dashboard(db: Session = Depends(get_db)):

    total_hogares = db.query(models.Hogar).count()

    total_profesionales = db.query(models.Profesional).count()

    profesionales_activos = db.query(models.Profesional).filter(
        models.Profesional.activo == True
    ).count()

    intervenciones_programadas = db.query(
        models.Intervencion
    ).filter(
        models.Intervencion.estado == "Programada"
    ).count()

    intervenciones_realizadas = db.query(
        models.Intervencion
    ).filter(
        models.Intervencion.estado == "Realizada"
    ).count()

    casos_lista_espera = db.query(
        models.ListaEspera
    ).filter(
        models.ListaEspera.estado == "Pendiente"
    ).count()

    return {
        "total_hogares": total_hogares,
        "total_profesionales": total_profesionales,
        "profesionales_activos": profesionales_activos,
        "intervenciones_programadas": intervenciones_programadas,
        "intervenciones_realizadas": intervenciones_realizadas,
        "casos_lista_espera": casos_lista_espera
    }
    
################################################################ Usuarios ##################################################
    
@app.post("/usuarios", response_model=schemas.UsuarioResponse)
def crear_usuario(
    usuario: schemas.UsuarioCreate,
    db: Session = Depends(get_db)
):

    password_hash = security.crear_password_hash(
                usuario.password
            )

    nuevo_usuario = models.Usuario(
                username=usuario.username,
                password_hash=password_hash,
                rol=usuario.rol,
                profesional_id=usuario.profesional_id,
                activo=usuario.activo
            )

    db.add(nuevo_usuario)
    db.commit()
    db.refresh(nuevo_usuario)

    return nuevo_usuario        

@app.get("/usuarios/me")
def obtener_mi_usuario(
    usuario = Depends(obtener_usuario_actual)
):
    return usuario


################################################################ Login ##################################################

@app.post("/login", response_model=schemas.TokenResponse)
def login(
    datos: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db)
):

    usuario = db.query(models.Usuario).filter(
        models.Usuario.username == datos.username
    ).first()

    if not usuario:
        raise HTTPException(
            status_code=401,
            detail="Usuario o contraseña incorrectos"
        )

    if not usuario.activo:
        raise HTTPException(
            status_code=403,
            detail="Usuario inactivo"
        )

    password_correcta = security.verificar_password(
        datos.password,
        usuario.password_hash
    )

    if not password_correcta:
        raise HTTPException(
            status_code=401,
            detail="Usuario o contraseña incorrectos"
        )

    token = security.crear_token_acceso(
        usuario_id=usuario.id,
        username=usuario.username,
        rol=usuario.rol,
        profesional_id=usuario.profesional_id
    )

    return {
        "access_token": token,
        "token_type": "bearer"
    }