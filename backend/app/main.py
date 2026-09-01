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
from sqlalchemy.orm import Session, joinedload

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
    allow_origins=["http://localhost:5173", "https://aplicacion-ssee.onrender.com"],
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
    db: Session = Depends(get_db),
    usuario = Depends(requiere_admin)
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
def obtener_hogares(
    db: Session = Depends(get_db),
    usuario = Depends(obtener_usuario_actual)
):

    if usuario.rol in ["administrador", "profesional"]:

        hogares = db.query(
            models.Hogar
        ).all()

        return hogares

    else:

        raise HTTPException(
            status_code=403,
            detail="No tienes permisos para consultar hogares"
        )

@app.put("/hogares/{id_hogar}")
def actualizar_hogar(
    id_hogar: int,
    hogar: schemas.HogarCreate,
    db: Session = Depends(get_db),
    usuario = Depends(requiere_admin)
):

    hogar_db = db.query(
        models.Hogar
    ).filter(
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
    db: Session = Depends(get_db),
    usuario = Depends(requiere_admin)
):

    hogar_db = db.query(
        models.Hogar
    ).filter(
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
    
@app.get("/hogares/{id_hogar}")
def obtener_hogar(
    id_hogar: int,
    db: Session = Depends(get_db),
    usuario = Depends(obtener_usuario_actual)
):

    hogar = db.query(
        models.Hogar
    ).filter(
        models.Hogar.id_hogar == id_hogar
    ).first()

    if hogar is None:
        raise HTTPException(
            status_code=404,
            detail="Hogar no encontrado"
        )

    if usuario.rol == "administrador":
        return hogar

    if usuario.rol == "profesional":

        if usuario.profesional_id is None:
            raise HTTPException(
                status_code=403,
                detail="El usuario no está asociado a un profesional"
            )

        asociado = any(
            profesional.id == usuario.profesional_id
            for profesional in hogar.profesionales
        )

        if not asociado:
            raise HTTPException(
                status_code=403,
                detail="No tienes permisos para acceder a este hogar"
            )

        return hogar

    raise HTTPException(
        status_code=403,
        detail="No tienes permisos para acceder a este hogar"
    )
    
#@app.get(
   # "/profesionales/me/hogares/disponibles",
   # response_model=list[schemas.HogarResumen]
#)
#def obtener_hogares_disponibles(
  #  usuario=Depends(obtener_usuario_actual),
   # db: Session = Depends(get_db)
#):

    #if usuario.rol != "profesional":
     #   raise HTTPException(
      #      status_code=403,
      #      detail="Solo los profesionales pueden acceder a los hogares disponibles"
      #  )

    #if usuario.profesional_id is None:
       # raise HTTPException(
          #  status_code=403,
          #  detail="El usuario no está asociado a un profesional"
       # )

    #profesional = db.query(
      #  models.Profesional
    #).filter(
     #   models.Profesional.id == usuario.profesional_id
    #).first()

    #if profesional is None:
        #raise HTTPException(
          #  status_code=404,
           # detail="Profesional no encontrado"
       # )

    #hogares_asignados = {
    #    hogar.id
      #  for hogar in profesional.hogares
    #}

   # hogares_disponibles = db.query(
     #   models.Hogar
    #).filter(
     #   ~models.Hogar.id.in_(hogares_asignados)
    #).all()

    #return hogares_disponibles

################################################################ Dashboard intervenciones ##################################################
    
@app.get("/profesionales/me/intervenciones")
def obtener_mis_intervenciones(
    usuario = Depends(obtener_usuario_actual),
    db: Session = Depends(get_db)
):

    if usuario.profesional_id is None:
        raise HTTPException(
            status_code=403,
            detail="El usuario no está asociado a un profesional"
        )

    intervenciones = db.query(
        models.Intervencion
    ).filter(
        models.Intervencion.profesional_id == usuario.profesional_id
    ).all()

    return intervenciones

@app.get("/profesionales/me")
def obtener_mi_profesional(
    usuario = Depends(obtener_usuario_actual),
    db: Session = Depends(get_db)
):

    if usuario.profesional_id is None:
        raise HTTPException(
            status_code=403,
            detail="El usuario no está asociado a un profesional"
        )

    profesional = db.query(
        models.Profesional
    ).filter(
        models.Profesional.id == usuario.profesional_id
    ).first()

    if profesional is None:
        raise HTTPException(
            status_code=404,
            detail="Profesional no encontrado"
        )

    return profesional
    
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

@app.get(
    "/profesionales/me/hogares",
    response_model=list[schemas.HogarResumen]
)
def obtener_mis_hogares(
    usuario=Depends(obtener_usuario_actual),
    db: Session = Depends(get_db)
):

    if usuario.rol != "profesional":
        raise HTTPException(
            status_code=403,
            detail="Solo los profesionales pueden acceder a sus hogares"
        )

    return db.query(
        models.Hogar
    ).all()

@app.post("/profesionales/me/hogares/{id_hogar}")
def agregar_hogar_a_mis_hogares(
    id_hogar: int,
    usuario = Depends(obtener_usuario_actual),
    db: Session = Depends(get_db)
):

    if usuario.rol != "profesional":
        raise HTTPException(
            status_code=403,
            detail="Solo los profesionales pueden agregar hogares a su lista"
        )

    if usuario.profesional_id is None:
        raise HTTPException(
            status_code=403,
            detail="El usuario no está asociado a un profesional"
        )

    hogar = db.query(
        models.Hogar
    ).filter(
        models.Hogar.id_hogar == id_hogar
    ).first()

    if hogar is None:
        raise HTTPException(
            status_code=404,
            detail="El hogar no existe"
        )

    profesional = db.query(
        models.Profesional
    ).filter(
        models.Profesional.id == usuario.profesional_id
    ).first()

    if profesional is None:
        raise HTTPException(
            status_code=404,
            detail="Profesional no encontrado"
        )

    if hogar in profesional.hogares:
        raise HTTPException(
            status_code=400,
            detail="Este hogar ya está agregado a tu lista"
        )

    profesional.hogares.append(hogar)

    db.commit()

    return {
        "mensaje": "Hogar agregado correctamente",
        "id_hogar": hogar.id_hogar
    }

@app.delete("/profesionales/{profesional_id}")
def eliminar_profesional(
    profesional_id: int,
    db: Session = Depends(get_db)
):

    # =========================================
    # BUSCAR PROFESIONAL
    # =========================================

    profesional = db.query(models.Profesional).filter(
        models.Profesional.id == profesional_id
    ).first()

    if profesional is None:
        raise HTTPException(
            status_code=404,
            detail="El profesional no existe"
        )


    # =========================================
    # VERIFICAR INTERVENCIONES
    # =========================================

    tiene_intervenciones = db.query(
        models.Intervencion
    ).filter(
        models.Intervencion.profesional_id == profesional_id
    ).first()

    if tiene_intervenciones:
        raise HTTPException(
            status_code=400,
            detail="No se puede eliminar el profesional porque tiene intervenciones asociadas"
        )


    # =========================================
    # VERIFICAR HOGARES
    # =========================================

    if profesional.hogares:

        raise HTTPException(
            status_code=400,
            detail="No se puede eliminar el profesional porque tiene hogares asociados"
        )


    # =========================================
    # VERIFICAR USUARIO
    # =========================================

    if profesional.usuario:

        raise HTTPException(
            status_code=400,
            detail="No se puede eliminar el profesional porque tiene un usuario asociado"
        )


    # =========================================
    # ELIMINAR PROFESIONAL
    # =========================================

    db.delete(profesional)
    db.commit()


    return {
        "mensaje": "Profesional eliminado correctamente",
        "id": profesional_id
    }


@app.get(
    "/profesionales/me/hogares/disponibles",
    response_model=list[schemas.HogarResumen]
)
def obtener_hogares_disponibles(
    usuario=Depends(obtener_usuario_actual),
    db: Session = Depends(get_db)
):

    if usuario.rol != "profesional":
        raise HTTPException(
            status_code=403,
            detail="Solo los profesionales pueden consultar hogares disponibles"
        )

    if usuario.profesional_id is None:
        raise HTTPException(
            status_code=403,
            detail="El usuario no está asociado a un profesional"
        )

    hogares = (
        db.query(models.Hogar)
        .filter(
            ~models.Hogar.profesionales.any(
                models.Profesional.id == usuario.profesional_id
            )
        )
        .all()
    )

    return hogares

@app.delete("/profesionales/me/hogares/{id_hogar}")
def eliminar_hogar_de_mis_hogares(
    id_hogar: int,
    usuario=Depends(obtener_usuario_actual),
    db: Session = Depends(get_db)
):

    if usuario.rol != "profesional":
        raise HTTPException(
            status_code=403,
            detail="Solo los profesionales pueden eliminar hogares de su lista"
        )

    if usuario.profesional_id is None:
        raise HTTPException(
            status_code=403,
            detail="El usuario no está asociado a un profesional"
        )

    profesional = db.query(
        models.Profesional
    ).filter(
        models.Profesional.id == usuario.profesional_id
    ).first()

    if profesional is None:
        raise HTTPException(
            status_code=404,
            detail="Profesional no encontrado"
        )

    hogar = db.query(
        models.Hogar
    ).filter(
        models.Hogar.id_hogar == id_hogar
    ).first()

    if hogar is None:
        raise HTTPException(
            status_code=404,
            detail="El hogar no existe"
        )

    if hogar not in profesional.hogares:
        raise HTTPException(
            status_code=404,
            detail="Este hogar no está agregado a tu lista"
        )

    profesional.hogares.remove(hogar)

    db.commit()

    return {
        "mensaje": "Hogar eliminado de tu lista correctamente",
        "id_hogar": hogar.id_hogar
    }


######################################################################## Intervenciones ############################################################

@app.post(
    "/intervenciones",
    response_model=schemas.IntervencionResponse
)
def crear_intervencion(
    intervencion: schemas.IntervencionCreate,
    db: Session = Depends(get_db),
    usuario = Depends(obtener_usuario_actual)
):

    # ==========================================
    # VERIFICAR HOGAR
    # ==========================================

    hogar = db.query(
        models.Hogar
    ).filter(
        models.Hogar.id_hogar == intervencion.hogar_id
    ).first()

    if hogar is None:

        raise HTTPException(
            status_code=404,
            detail="El hogar no existe"
        )

    # ==========================================
    # ADMINISTRADOR
    # ==========================================

    if usuario.rol == "administrador":

        profesional_id = intervencion.profesional_id

    # ==========================================
    # PROFESIONAL
    # ==========================================

    elif usuario.rol == "profesional":

        if usuario.profesional_id is None:

            raise HTTPException(
                status_code=403,
                detail="El usuario no tiene un profesional asociado"
            )

        profesional_id = usuario.profesional_id

        # ======================================
        # VERIFICAR LISTA DE ESPERA
        # ======================================

        asignacion = db.query(
            models.ListaEspera
        ).filter(
            models.ListaEspera.id_hogar == intervencion.hogar_id,
            models.ListaEspera.profesional_id == profesional_id
        ).first()

        if asignacion is None:

            raise HTTPException(
                status_code=403,
                detail="Este hogar no está asignado a tu lista de espera"
            )

    # ==========================================
    # OTRO ROL
    # ==========================================

    else:

        raise HTTPException(
            status_code=403,
            detail="No tienes permisos para crear intervenciones"
        )

    # ==========================================
    # VERIFICAR PROFESIONAL
    # ==========================================

    profesional = db.query(
        models.Profesional
    ).filter(
        models.Profesional.id == profesional_id
    ).first()

    if profesional is None:

        raise HTTPException(
            status_code=404,
            detail="El profesional no existe"
        )

    # ==========================================
    # CREAR INTERVENCIÓN
    # ==========================================

    nueva_intervencion = models.Intervencion(

        hogar_id=hogar.id,

        profesional_id=profesional_id,

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

@app.get(
    "/intervenciones",
    response_model=list[schemas.IntervencionDetalle]
)
def obtener_intervenciones(
    db: Session = Depends(get_db),
    usuario = Depends(obtener_usuario_actual)
):

    if usuario.rol == "administrador":

        intervenciones = db.query(
            models.Intervencion
        ).all()

    else:

        intervenciones = db.query(
            models.Intervencion
        ).filter(
            models.Intervencion.profesional_id
            == usuario.profesional_id
        ).all()

    return intervenciones

@app.get(
    "/intervenciones/{id}",
    response_model=schemas.IntervencionDetalle
)
def obtener_intervencion(
    id: int,
    db: Session = Depends(get_db),
    usuario = Depends(obtener_usuario_actual)
):

    intervencion = db.query(
        models.Intervencion
    ).filter(
        models.Intervencion.id == id
    ).first()

    if intervencion is None:

        raise HTTPException(
            status_code=404,
            detail="Intervención no encontrada"
        )

    if usuario.rol != "administrador":

        if intervencion.profesional_id != usuario.profesional_id:

            raise HTTPException(
                status_code=403,
                detail="No tienes permisos para acceder a esta intervención"
            )

    return intervencion

@app.put(
    "/intervenciones/{id}",
    response_model=schemas.IntervencionDetalle
)
def actualizar_intervencion(
    id: int,
    datos: schemas.IntervencionUpdate,
    db: Session = Depends(get_db),
    usuario = Depends(obtener_usuario_actual)
):

    # ==========================================
    # BUSCAR INTERVENCIÓN
    # ==========================================

    intervencion = db.query(
        models.Intervencion
    ).filter(
        models.Intervencion.id == id
    ).first()

    if intervencion is None:

        raise HTTPException(
            status_code=404,
            detail="Intervención no encontrada"
        )


    # ==========================================
    # VERIFICAR PERMISOS
    # ==========================================

    if usuario.rol == "administrador":

        pass


    elif usuario.rol == "profesional":

        if usuario.profesional_id is None:

            raise HTTPException(
                status_code=403,
                detail="El usuario no tiene un profesional asociado"
            )


        # La intervención debe pertenecer
        # al profesional autenticado

        if (
            intervencion.profesional_id
            != usuario.profesional_id
        ):

            raise HTTPException(
                status_code=403,
                detail="No puedes modificar una intervención que no te pertenece"
            )


    else:

        raise HTTPException(
            status_code=403,
            detail="No tienes permisos para modificar esta intervención"
        )


    # ==========================================
    # OBTENER DATOS A ACTUALIZAR
    # ==========================================

    datos_actualizados = datos.model_dump(
        exclude_unset=True
    )


    # ==========================================
    # PROFESIONAL
    # ==========================================

    if usuario.rol == "profesional":

        # Un profesional NO puede cambiar
        # el profesional asociado

        datos_actualizados.pop(
            "profesional_id",
            None
        )


    # ==========================================
    # EVITAR MODIFICAR ID
    # ==========================================

    datos_actualizados.pop(
        "id",
        None
    )


    # ==========================================
    # PROCESAR HOGAR
    # ==========================================

    if "hogar_id" in datos_actualizados:

        hogar_id_hogar = datos_actualizados["hogar_id"]


        # Buscar por el identificador visible
        # del hogar

        hogar = db.query(
            models.Hogar
        ).filter(
            models.Hogar.id_hogar
            == hogar_id_hogar
        ).first()


        if hogar is None:

            raise HTTPException(
                status_code=404,
                detail="El hogar no existe"
            )


        # ======================================
        # PROFESIONAL
        # ======================================

        if usuario.rol == "profesional":

            asignacion = db.query(
                models.ListaEspera
            ).filter(
                models.ListaEspera.id_hogar
                == hogar.id_hogar,

                models.ListaEspera.profesional_id
                == usuario.profesional_id
            ).first()


            if asignacion is None:

                raise HTTPException(
                    status_code=403,
                    detail="Este hogar no está asignado a tu lista de espera"
                )


        # ======================================
        # CONVERTIR
        # ======================================

        datos_actualizados["hogar_id"] = hogar.id


    # ==========================================
    # APLICAR CAMBIOS
    # ==========================================

    for campo, valor in datos_actualizados.items():

        setattr(
            intervencion,
            campo,
            valor
        )


    # ==========================================
    # GUARDAR
    # ==========================================

    db.commit()

    db.refresh(
        intervencion
    )


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
    
@app.post(
    "/lista-espera",
    response_model=schemas.ListaEsperaResponse
)
def crear_lista_espera(
    datos: schemas.ListaEsperaCreate,
    db: Session = Depends(get_db),
    usuario = Depends(requiere_admin)
):

    # =========================================
    # VERIFICAR QUE EL HOGAR EXISTA
    # =========================================

    hogar = db.query(
        models.Hogar
    ).filter(
        models.Hogar.id_hogar == datos.id_hogar
    ).first()

    if hogar is None:
        raise HTTPException(
            status_code=404,
            detail="El hogar no existe"
        )


    # =========================================
    # VERIFICAR PROFESIONAL
    # =========================================

    profesional = db.query(
        models.Profesional
    ).filter(
        models.Profesional.id == datos.profesional_id
    ).first()

    if profesional is None:
        raise HTTPException(
            status_code=404,
            detail="El profesional no existe"
        )


    # =========================================
    # VERIFICAR PROFESIONAL ACTIVO
    # =========================================

    if not profesional.activo:
        raise HTTPException(
            status_code=400,
            detail="No se puede asignar un profesional inactivo"
        )


    # =========================================
    # CREAR ENTRADA
    # =========================================

    nueva_entrada = models.ListaEspera(

        id_hogar=datos.id_hogar,

        cuidador_principal=datos.cuidador_principal,

        psdf=datos.psdf,

        direccion=datos.direccion,

        unidad_vecinal=datos.unidad_vecinal,

        telefono=datos.telefono,

        profesional_id=datos.profesional_id,

        dia=datos.dia,

        estado=datos.estado,

        fecha_solicitud=datos.fecha_solicitud,

        observaciones=datos.observaciones
    )


    db.add(nueva_entrada)

    db.commit()

    db.refresh(nueva_entrada)

    return nueva_entrada

@app.get(
    "/lista-espera",
    response_model=list[schemas.ListaEsperaResponse]
)
def obtener_lista_espera(
    db: Session = Depends(get_db),
    usuario = Depends(obtener_usuario_actual)
):

    # ==========================================
    # ADMINISTRADOR
    # ==========================================

    if usuario.rol == "administrador":

        lista = db.query(
            models.ListaEspera
        ).all()

        return lista

    # ==========================================
    # PROFESIONAL
    # ==========================================

    elif usuario.rol == "profesional":

        if usuario.profesional_id is None:

            raise HTTPException(
                status_code=403,
                detail="El usuario no tiene un profesional asociado"
            )

        lista = db.query(
            models.ListaEspera
        ).filter(
            models.ListaEspera.profesional_id
            == usuario.profesional_id
        ).all()

        return lista

    # ==========================================
    # OTRO ROL
    # ==========================================

    else:

        raise HTTPException(
            status_code=403,
            detail="No tienes permisos para consultar la lista de espera"
        )

@app.get(
    "/lista-espera/{id}",
    response_model=schemas.ListaEsperaResponse
)
def obtener_lista_espera_por_id(
    id: int,
    db: Session = Depends(get_db)
):

    entrada = db.query(
        models.ListaEspera
    ).filter(
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
    db: Session = Depends(get_db),
    usuario = Depends(requiere_admin)
):

    entrada = db.query(
        models.ListaEspera
    ).filter(
        models.ListaEspera.id == id
    ).first()

    if entrada is None:

        raise HTTPException(
            status_code=404,
            detail="Entrada de lista de espera no encontrada"
        )


    # =========================================
    # VALIDAR HOGAR
    # =========================================

    if datos.id_hogar is not None:

        hogar = db.query(
            models.Hogar
        ).filter(
            models.Hogar.id_hogar == datos.id_hogar
        ).first()

        if hogar is None:

            raise HTTPException(
                status_code=404,
                detail="El hogar no existe"
            )


    # =========================================
    # VALIDAR PROFESIONAL
    # =========================================

    if datos.profesional_id is not None:

        profesional = db.query(
            models.Profesional
        ).filter(
            models.Profesional.id == datos.profesional_id
        ).first()

        if profesional is None:

            raise HTTPException(
                status_code=404,
                detail="El profesional no existe"
            )


        if not profesional.activo:

            raise HTTPException(
                status_code=400,
                detail="No se puede asignar un profesional inactivo"
            )


    # =========================================
    # ACTUALIZAR
    # =========================================

    datos_actualizados = datos.model_dump(
        exclude_unset=True
    )


    for campo, valor in datos_actualizados.items():

        setattr(
            entrada,
            campo,
            valor
        )


    db.commit()

    db.refresh(entrada)


    return entrada

@app.delete("/lista-espera/{id}")
def eliminar_lista_espera(
    id: int,
    db: Session = Depends(get_db),
    usuario = Depends(requiere_admin)
):

    entrada = db.query(
        models.ListaEspera
    ).filter(
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

    if usuario.profesional_id is not None:

        profesional = db.query(models.Profesional).filter(
            models.Profesional.id == usuario.profesional_id
        ).first()

        if profesional is None:
            raise HTTPException(
                status_code=404,
                detail="El profesional no existe"
            )

        usuario_existente = db.query(models.Usuario).filter(
            models.Usuario.profesional_id == usuario.profesional_id
        ).first()

        if usuario_existente:
            raise HTTPException(
                status_code=400,
                detail="Este profesional ya tiene un usuario"
            )

    usuario_existente = db.query(models.Usuario).filter(
        models.Usuario.username == usuario.username
    ).first()

    if usuario_existente:
        raise HTTPException(
            status_code=400,
            detail="El nombre de usuario ya existe"
        )

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

@app.put("/usuarios/{usuario_id}", response_model=schemas.UsuarioResponse)
def actualizar_usuario(
    usuario_id: int,
    usuario: schemas.UsuarioUpdate,
    db: Session = Depends(get_db)
):

    # =========================================
    # BUSCAR USUARIO
    # =========================================

    usuario_existente = db.query(models.Usuario).filter(
        models.Usuario.id == usuario_id
    ).first()

    if usuario_existente is None:
        raise HTTPException(
            status_code=404,
            detail="El usuario no existe"
        )


    # =========================================
    # VALIDAR USERNAME
    # =========================================

    otro_usuario = db.query(models.Usuario).filter(
        models.Usuario.username == usuario.username,
        models.Usuario.id != usuario_id
    ).first()

    if otro_usuario:
        raise HTTPException(
            status_code=400,
            detail="El nombre de usuario ya existe"
        )


    # =========================================
    # VALIDAR PROFESIONAL
    # =========================================

    if usuario.profesional_id is not None:

        profesional = db.query(models.Profesional).filter(
            models.Profesional.id == usuario.profesional_id
        ).first()

        if profesional is None:
            raise HTTPException(
                status_code=404,
                detail="El profesional no existe"
            )


        # Verificar que otro usuario no tenga ese profesional

        otro_usuario_profesional = db.query(
            models.Usuario
        ).filter(
            models.Usuario.profesional_id == usuario.profesional_id,
            models.Usuario.id != usuario_id
        ).first()

        if otro_usuario_profesional:

            raise HTTPException(
                status_code=400,
                detail="Este profesional ya tiene un usuario"
            )


    # =========================================
    # ACTUALIZAR DATOS
    # =========================================

    usuario_existente.username = usuario.username
    usuario_existente.rol = usuario.rol
    usuario_existente.profesional_id = usuario.profesional_id
    usuario_existente.activo = usuario.activo


    # =========================================
    # ACTUALIZAR CONTRASEÑA
    # SOLO SI SE ENVÍA
    # =========================================

    if usuario.password:

        usuario_existente.password_hash = (
            security.crear_password_hash(
                usuario.password
            )
        )


    # =========================================
    # GUARDAR
    # =========================================

    db.commit()
    db.refresh(usuario_existente)

    return usuario_existente
    

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
    
################################################################## Profesional/Hogar ################################################################
    
