import { useEffect, useState } from "react";
import api from "../services/api";

function ListaEspera() {

    const [listaEspera, setListaEspera] = useState([]);
    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {

        const obtenerListaEspera = async () => {

            try {

                const response = await api.get("/lista-espera");

                setListaEspera(response.data);

            } catch (error) {

                console.error(error);
                setError("No se pudo cargar la lista de espera");

            } finally {

                setCargando(false);

            }
        };

        obtenerListaEspera();

    }, []);

    if (cargando) {
        return <h2>Cargando lista de espera...</h2>;
    }

    if (error) {
        return <h2>{error}</h2>;
    }

    return (
        <div>

            <h1>Lista de espera</h1>

            <p>
                Casos registrados en lista de espera
            </p>
        
        <div className="ssee-table-container">
            <table className="ssee-table">

                <thead>

                    <tr>
                        <th>ID</th>
                        <th>Hogar</th>
                        <th>Profesional</th>
                        <th>Disciplina requerida</th>
                        <th>Día preferente</th>
                        <th>Estado</th>
                        <th>Fecha solicitud</th>
                    </tr>

                </thead>

                <tbody>

                    {listaEspera.map((entrada) => (

                        <tr key={entrada.id}>

                            <td>
                                {entrada.id}
                            </td>

                            <td>
                                {entrada.hogar?.cuidador_principal}
                            </td>

                            <td>
                                {entrada.profesional?.nombre ?? "Sin asignar"}
                            </td>

                            <td>
                                {entrada.disciplina_requerida}
                            </td>

                            <td>
                                {entrada.dia_preferente}
                            </td>

                            <td>
                                {entrada.estado}
                            </td>

                            <td>
                                {entrada.fecha_solicitud}
                            </td>

                        </tr>

                    ))}

                </tbody>

            </table>

        </div>
    </div>
    );
}

export default ListaEspera;