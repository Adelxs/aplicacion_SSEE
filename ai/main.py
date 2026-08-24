from dotenv import load_dotenv
from fastapi import FastAPI
from pydantic import BaseModel

from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.messages import ToolMessage

from tools.ssee_tools import obtener_hogares, obtener_profesionales
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

load_dotenv()


llm = ChatGoogleGenerativeAI(
    model="gemini-3.6-flash"
)


tools = [obtener_hogares, obtener_profesionales]

llm_with_tools = llm.bind_tools(tools)


class Pregunta(BaseModel):
    pregunta: str


@app.post("/ai/chat")
def chat_ia(datos: Pregunta):

    pregunta = datos.pregunta

    respuesta = llm_with_tools.invoke(pregunta)

    tool_call = respuesta.tool_calls[0]

    resultado = obtener_hogares.invoke(
        tool_call["args"]
    )

    tool_message = ToolMessage(
        content=str(resultado),
        tool_call_id=tool_call["id"]
    )

    respuesta_final = llm_with_tools.invoke([
        pregunta,
        respuesta,
        tool_message
    ])

    return {
        "respuesta": respuesta_final.content[0]["text"]
    }
    
pregunta = "¿Qué profesionales están registrados actualmente en el sistema?"
respuesta = llm_with_tools.invoke(pregunta)

resultado = obtener_profesionales.invoke({})

print("RESPUESTA DE GEMINI:")
print(respuesta)

print("\nTOOL CALLS:")
print(respuesta.tool_calls)