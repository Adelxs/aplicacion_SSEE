import { useState } from "react";

function Asistente() {

    const [pregunta, setPregunta] = useState("");
    const [respuesta, setRespuesta] = useState("");

    const preguntarIA = async () => {

        const response = await fetch("http://localhost:8001/ai/chat", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                pregunta: pregunta
            })
        });

        const data = await response.json();

        setRespuesta(data.respuesta);
    };

    return (
        <div>

            <h1>🤖 Asistente SSEE</h1>

            <input
                type="text"
                value={pregunta}
                onChange={(e) => setPregunta(e.target.value)}
                placeholder="Escribe tu pregunta..."
            />

            <button onClick={preguntarIA}>
                Enviar
            </button>

            <p>
                {respuesta}
            </p>

        </div>
    );
}

export default Asistente;