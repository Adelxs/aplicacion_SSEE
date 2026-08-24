import requests
from langchain_core.tools import tool


@tool
def obtener_hogares():
    """Obtiene todos los hogares registrados en el sistema SSEE."""

    response = requests.get("http://localhost:8000/hogares")

    response.raise_for_status()

    return response.json()

@tool
def obtener_profesionales():
    """
    Obtiene todos los profesionales registrados en el sistema SSEE.
    """
    
    response = requests.get(
        "http://localhost:8000/profesionales"
    )

    response.raise_for_status()

    return response.json()