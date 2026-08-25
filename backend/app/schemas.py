from pydantic import BaseModel
from datetime import date


class HogarCreate(BaseModel):
    id_hogar: int
    cuidador_principal: str
    psdf: str
    direccion: str
    telefono: str | None = None
    unidad_vecinal: str | None = None
    estado: str = "Activo"
    
class ProfesionalCreate(BaseModel):
    nombre: str
    disciplina: str
    activo: bool = True

class ProfesionalResponse(BaseModel):
    id: int
    nombre: str
    disciplina: str
    activo: bool

    class Config:
        from_attributes = True
        
class ProfesionalUpdate(BaseModel):
    nombre: str
    disciplina: str
    activo: bool
    
    
class IntervencionCreate(BaseModel):
    hogar_id: int
    profesional_id: int
    tipo: str
    numero_intervencion: int | None = None
    fecha_programada: date | None = None
    fecha_realizada: date | None = None
    estado: str
    observaciones: str | None = None
    
class IntervencionResponse(BaseModel):
    id: int
    hogar_id: int
    profesional_id: int
    tipo: str
    numero_intervencion: int | None
    fecha_programada: date | None
    fecha_realizada: date | None
    estado: str
    observaciones: str | None

    class Config:
        from_attributes = True
        
class HogarResumen(BaseModel):
    id: int
    id_hogar: int
    cuidador_principal: str
    psdf: str
    direccion: str
    unidad_vecinal: str | None = None
    telefono: str | None = None

    class Config:
        from_attributes = True
        
class ProfesionalResumen(BaseModel):
    id: int
    nombre: str
    disciplina: str

    class Config:
        from_attributes = True
        
class IntervencionDetalle(BaseModel):
    id: int
    hogar: HogarResumen
    profesional: ProfesionalResumen
    tipo: str
    numero_intervencion: int | None
    fecha_programada: date | None
    fecha_realizada: date | None
    estado: str
    observaciones: str | None

    class Config:
        from_attributes = True
        
class IntervencionUpdate(BaseModel):
    tipo: str | None = None
    numero_intervencion: int | None = None
    fecha_programada: date | None = None
    fecha_realizada: date | None = None
    estado: str | None = None
    observaciones: str | None = None
    
class ListaEsperaCreate(BaseModel):

    id_hogar: int

    cuidador_principal: str

    psdf: str

    direccion: str

    unidad_vecinal: str | None = None

    telefono: str | None = None

    profesional_nombre: str | None = None

    dia: str | None = None

    estado: str = "Pendiente"

    fecha_solicitud: date

    observaciones: str | None = None


class ListaEsperaResponse(BaseModel):

    id: int

    id_hogar: int

    cuidador_principal: str

    psdf: str

    direccion: str

    unidad_vecinal: str | None

    telefono: str | None

    profesional_nombre: str | None

    dia: str | None

    estado: str

    fecha_solicitud: date

    observaciones: str | None

    class Config:
        from_attributes = True


class ListaEsperaUpdate(BaseModel):

    cuidador_principal: str | None = None

    psdf: str | None = None

    direccion: str | None = None

    unidad_vecinal: str | None = None

    telefono: str | None = None

    profesional_nombre: str | None = None

    dia: str | None = None

    estado: str | None = None

    fecha_solicitud: date | None = None

    observaciones: str | None = None
    
class ListaEsperaDetalle(ListaEsperaResponse):
    pass
    
class UsuarioCreate(BaseModel):
    username: str
    password: str
    rol: str
    profesional_id: int | None = None
    activo: bool = True
    
class UsuarioResponse(BaseModel):
    id: int
    username: str
    rol: str
    profesional_id: int | None
    activo: bool

    class Config:
        from_attributes = True
        
class LoginRequest(BaseModel):
    username: str
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str