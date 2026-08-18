from pydantic import BaseModel


class HogarCreate(BaseModel):
    cuidador_principal: str
    psdf: str
    direccion: str
    telefono: str | None = None
    unidad_vecinal: str | None = None