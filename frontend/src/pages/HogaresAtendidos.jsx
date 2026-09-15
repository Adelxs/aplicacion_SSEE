import { useEffect, useState } from "react";
import api from "../services/api";
import "./HogaresAtendidos.css";


const meses = [
    { valor: 1, nombre: "Enero" },
    { valor: 2, nombre: "Febrero" },
    { valor: 3, nombre: "Marzo" },
    { valor: 4, nombre: "Abril" },
    { valor: 5, nombre: "Mayo" },
    { valor: 6, nombre: "Junio" },
    { valor: 7, nombre: "Julio" },
    { valor: 8, nombre: "Agosto" },
    { valor: 9, nombre: "Septiembre" },
    { valor: 10, nombre: "Octubre" },
    { valor: 11, nombre: "Noviembre" },
    { valor: 12, nombre: "Diciembre" }
];


function HogaresAtendidos() {

    const fechaActual = new Date();

    const [mes, setMes] = useState(
        fechaActual.getMonth() + 1
    );

    const [anio, setAnio] = useState(
        fechaActual.getFullYear()
    );

    const [estadisticas, setEstadisticas] =
        useState([]);

    const [cargando, setCargando] =
        useState(false);

    const [error, setError] =
        useState("");


    const obtenerEstadisticas = async () => {

        try {

            setCargando(true);
            setError("");

            const response = await api.get(
                "/estadisticas/hogares-atendidos",
                {
                    params: {
                        mes: mes,
                        anio: anio
                    }
                }
            );

            setEstadisticas(
                response.data
            );

        } catch (error) {

            console.error(
                "Error obteniendo estadísticas:",
                error
            );

            setError(
                error.response?.data?.detail ||
                "No se pudieron obtener las estadísticas"
            );

        } finally {

            setCargando(false);

        }
    };


    useEffect(() => {

        obtenerEstadisticas();

    }, [mes, anio]);


    return (

        <div className="hogares-atendidos-container">

            <h1>
                Hogares atendidos por profesional
            </h1>


            {/* ========================= */}
            {/* FILTROS */}
            {/* ========================= */}

            <div className="estadisticas-filtros">

                <div>

                    <label>
                        Mes
                    </label>

                    <select
                        value={mes}
                        onChange={(e) =>
                            setMes(
                                Number(e.target.value)
                            )
                        }
                    >

                        {meses.map((mesItem) => (

                            <option
                                key={mesItem.valor}
                                value={mesItem.valor}
                            >
                                {mesItem.nombre}
                            </option>

                        ))}

                    </select>

                </div>


                <div>

                    <label>
                        Año
                    </label>

                    <select
                        value={anio}
                        onChange={(e) =>
                            setAnio(
                                Number(e.target.value)
                            )
                        }
                    >

                        {Array.from(
                            {
                                length: 5
                            },
                            (_, index) =>
                                new Date().getFullYear()
                                - index
                        ).map((anioItem) => (

                            <option
                                key={anioItem}
                                value={anioItem}
                            >
                                {anioItem}
                            </option>

                        ))}

                    </select>

                </div>

            </div>


            {/* ========================= */}
            {/* ERROR */}
            {/* ========================= */}

            {error && (

                <div className="estadisticas-error">
                    {error}
                </div>

            )}


            {/* ========================= */}
            {/* CARGANDO */}
            {/* ========================= */}

            {cargando ? (

                <p className="estadisticas-cargando">
                    Cargando estadísticas...
                </p>

            ) : (

                <div className="tabla-estadisticas">

                    <table>

                        <thead>

                            <tr>

                                <th>
                                    Profesional
                                </th>

                                <th>
                                    Disciplina
                                </th>

                                <th>
                                    Hogares atendidos
                                </th>

                            </tr>

                        </thead>


                        <tbody>

                            {estadisticas.length === 0 ? (

                                <tr>

                                    <td
                                        colSpan="3"
                                        className="sin-datos"
                                    >
                                        No hay profesionales
                                        registrados.
                                    </td>

                                </tr>

                            ) : (

                                estadisticas.map(
                                    (profesional) => (

                                        <tr
                                            key={
                                                profesional.profesional_id
                                            }
                                        >

                                            <td>
                                                {
                                                    profesional.profesional
                                                }
                                            </td>

                                            <td>
                                                {
                                                    profesional.disciplina
                                                }
                                            </td>

                                            <td className="cantidad-hogares">

                                                {
                                                    profesional.hogares_atendidos
                                                }

                                            </td>

                                        </tr>

                                    )
                                )

                            )}

                        </tbody>

                    </table>

                </div>

            )}

        </div>

    );
}


export default HogaresAtendidos;