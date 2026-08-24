import { useEffect, useState } from "react";
import api from "../services/api";
import "./Intervenciones.css";

function Intervenciones() {

    const [intervenciones, setIntervenciones] = useState([]);
    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {

        const obtenerIntervenciones = async () => {

            try {

                const response = await api.get("/intervenciones");

                setIntervenciones(response.data);

            } catch (error) {

                console.error(error);
                setError("No se pudieron cargar las intervenciones");

            } finally {

                setCargando(false);

            }

        };

        obtenerIntervenciones();

    }, []);

    if (cargando) {
        return <h2>Cargando intervenciones...</h2>;
    }

    if (error) {
        return <h2>{error}</h2>;
    }

    return (
        <div>

            <h1>Intervenciones</h1>

            <p>
                Intervenciones registradas en el sistema
            </p>
        <div className="ssee-table-container">
            <table className="ssee-table">

                <thead>

                    <tr>
                        <th>ID</th>
                        <th>Hogar</th>
                        <th>Profesional</th>
                        <th>Tipo</th>
                        <th>Fecha programada</th>
                        <th>Fecha realizada</th>
                        <th>Estado</th>
                    </tr>

                </thead>

                <tbody>

                    {intervenciones.map((intervencion) => (

                        <tr key={intervencion.id}>

                            <td>
                                {intervencion.id}
                            </td>

                            <td>
                                {intervencion.hogar?.cuidador_principal}
                            </td>

                            <td>
                                {intervencion.profesional?.nombre}
                            </td>

                            <td>
                                {intervencion.tipo}
                            </td>

                            <td>
                                {intervencion.fecha_programada}
                            </td>

                            <td>
                                {intervencion.fecha_realizada ?? "Pendiente"}
                            </td>

                            <td>
                                {intervencion.estado}
                            </td>

                        </tr>

                    ))}

                </tbody>

            </table>

        </div>
    </div>
    );
}

export default Intervenciones;