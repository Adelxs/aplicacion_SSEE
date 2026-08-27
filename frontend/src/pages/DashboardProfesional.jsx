import { useEffect, useState } from "react";
import api from "../services/api";
import "./DashboardProfesional.css";

function DashboardProfesional() {

    const [profesional, setProfesional] = useState(null);
    const [intervenciones, setIntervenciones] = useState([]);
    const [hogares, setHogares] = useState([]);

    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState(null);


    useEffect(() => {

        const cargarDashboard = async () => {

            try {

                const [
                    profesionalResponse,
                    intervencionesResponse,
                    hogaresResponse
                ] = await Promise.all([

                    api.get("/profesionales/me"),

                    api.get(
                        "/profesionales/me/intervenciones"
                    ),

                    api.get(
                        "/profesionales/me/hogares"
                    )

                ]);
                

                setProfesional(
                    profesionalResponse.data
                );

                setIntervenciones(
                    intervencionesResponse.data
                );

                setHogares(
                    hogaresResponse.data
                );


            } catch (error) {

                console.error(
                    "Error cargando dashboard profesional:",
                    error
                );

                setError(
                    "No se pudo cargar el dashboard"
                );

            } finally {

                setCargando(false);

            }

        };


        cargarDashboard();

    }, []);


    if (cargando) {

        return (
            <h2>
                Cargando dashboard...
            </h2>
        );

    }


    if (error) {

        return (
            <h2>
                {error}
            </h2>
        );

    }


    // =========================
    // ESTADÍSTICAS
    // =========================

    const totalIntervenciones =
        intervenciones.length;


    const intervencionesPendientes =
        intervenciones.filter(
            (intervencion) =>
                intervencion.estado === "pendiente"
        ).length;


    const intervencionesRealizadas =
        intervenciones.filter(
            (intervencion) =>
                intervencion.estado === "realizada"
        ).length;


    const totalHogares =
        hogares.length;


    return (

        <div className="dashboard-profesional">


            {/* ========================= */}
            {/* HEADER */}
            {/* ========================= */}

            <div className="dashboard-profesional-header">

                <div>

                    <h1>
                        Panel Profesional
                    </h1>

                    <p>
                        Bienvenido,{" "}
                        <strong>
                            {profesional?.nombre}
                        </strong>
                    </p>

                    <p>
                        {profesional?.disciplina}
                    </p>

                </div>

            </div>


            {/* ========================= */}
            {/* TARJETAS */}
            {/* ========================= */}

            <div className="profesional-cards">


                <div className="profesional-card">

                    <h3>
                        Hogares
                    </h3>

                    <span>
                        {totalHogares}
                    </span>

                    <p>
                        Hogares asignados
                    </p>

                </div>


                <div className="profesional-card">

                    <h3>
                        Intervenciones
                    </h3>

                    <span>
                        {totalIntervenciones}
                    </span>

                    <p>
                        Intervenciones registradas
                    </p>

                </div>


                <div className="profesional-card">

                    <h3>
                        Pendientes
                    </h3>

                    <span>
                        {intervencionesPendientes}
                    </span>

                    <p>
                        Intervenciones pendientes
                    </p>

                </div>


                <div className="profesional-card">

                    <h3>
                        Realizadas
                    </h3>

                    <span>
                        {intervencionesRealizadas}
                    </span>

                    <p>
                        Intervenciones realizadas
                    </p>

                </div>


            </div>


            {/* ========================= */}
            {/* MIS HOGARES */}
            {/* ========================= */}

            <div className="profesional-section">

                <h2>
                    Mis hogares
                </h2>


                {hogares.length === 0 ? (

                    <p>
                        No tienes hogares asignados.
                    </p>

                ) : (

                    <div className="ssee-table-container">

                        <table className="ssee-table">

                            <thead>

                                <tr>

                                    <th>
                                        ID Hogar
                                    </th>

                                    <th>
                                        Cuidador principal
                                    </th>

                                    <th>
                                        PSDF
                                    </th>

                                    <th>
                                        Dirección
                                    </th>

                                    <th>
                                        Unidad vecinal
                                    </th>

                                    <th>
                                        Teléfono
                                    </th>

                                </tr>

                            </thead>


                            <tbody>

                                {hogares.map(
                                    (hogar) => (

                                        <tr
                                            key={
                                                hogar.id
                                            }
                                        >

                                            <td>
                                                {
                                                    hogar.id_hogar
                                                }
                                            </td>

                                            <td>
                                                {
                                                    hogar.cuidador_principal
                                                }
                                            </td>

                                            <td>
                                                {
                                                    hogar.psdf
                                                }
                                            </td>

                                            <td>
                                                {
                                                    hogar.direccion
                                                }
                                            </td>

                                            <td>
                                                {
                                                    hogar.unidad_vecinal
                                                    || "No registrada"
                                                }
                                            </td>

                                            <td>
                                                {
                                                    hogar.telefono
                                                    || "No registrado"
                                                }
                                            </td>

                                        </tr>

                                    )
                                )}

                            </tbody>

                        </table>

                    </div>

                )}

            </div>


            {/* ========================= */}
            {/* PRÓXIMAS INTERVENCIONES */}
            {/* ========================= */}

            <div className="profesional-section">

                <h2>
                    Próximas intervenciones
                </h2>


                {intervenciones.length === 0 ? (

                    <p>
                        No hay intervenciones programadas.
                    </p>

                ) : (

                    <div className="ssee-table-container">

                        <table className="ssee-table">

                            <thead>

                                <tr>

                                    <th>
                                        Hogar
                                    </th>

                                    <th>
                                        Tipo
                                    </th>

                                    <th>
                                        Fecha programada
                                    </th>

                                    <th>
                                        Estado
                                    </th>

                                </tr>

                            </thead>


                            <tbody>

                                {intervenciones.map(
                                    (intervencion) => (

                                        <tr
                                            key={
                                                intervencion.id
                                            }
                                        >

                                            <td>
                                                {
                                                    intervencion
                                                        .hogar
                                                        ?.cuidador_principal
                                                }
                                            </td>

                                            <td>
                                                {
                                                    intervencion.tipo
                                                }
                                            </td>

                                            <td>
                                                {
                                                    intervencion
                                                        .fecha_programada
                                                }
                                            </td>

                                            <td>
                                                {
                                                    intervencion.estado
                                                }
                                            </td>

                                        </tr>

                                    )
                                )}

                            </tbody>

                        </table>

                    </div>

                )}

            </div>


        </div>

    );

}

export default DashboardProfesional;