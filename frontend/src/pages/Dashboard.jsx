import { useEffect, useState } from "react";
import api from "../services/api";
import "./Dashboard.css";

function Dashboard() {

    const [cantidadHogares, setCantidadHogares] = useState(0);
    const [cantidadProfesionales, setCantidadProfesionales] = useState(0);
    const [cantidadIntervenciones, setCantidadIntervenciones] = useState(0);
    const [cantidadListaEspera, setCantidadListaEspera] = useState(0);

    const [hogares, setHogares] = useState([]);
    const [profesionales, setProfesionales] = useState([]);


    // =========================
    // OBTENER DATOS DEL DASHBOARD
    // =========================

    useEffect(() => {

        const obtenerDatos = async () => {

            try {

                const [
                    hogaresResponse,
                    profesionalesResponse,
                    intervencionesResponse,
                    listaEsperaResponse
                ] = await Promise.all([

                    api.get("/hogares"),
                    api.get("/profesionales"),
                    api.get("/intervenciones"),
                    api.get("/lista-espera")

                ]);


                // =========================
                // GUARDAR DATOS
                // =========================

                setHogares(hogaresResponse.data);

                setProfesionales(
                    profesionalesResponse.data
                );


                // =========================
                // ACTUALIZAR CANTIDADES
                // =========================

                setCantidadHogares(
                    hogaresResponse.data.length
                );

                setCantidadProfesionales(
                    profesionalesResponse.data.length
                );

                setCantidadIntervenciones(
                    intervencionesResponse.data.length
                );

                setCantidadListaEspera(
                    listaEsperaResponse.data.length
                );


            } catch (error) {

                console.error(
                    "Error obteniendo datos del dashboard:",
                    error
                );

            }

        };


        obtenerDatos();

    }, []);


    // =========================
    // ACTIVIDADES RECIENTES
    // =========================

    const hogarReciente =
        hogares.length > 0
            ? hogares[hogares.length - 1]
            : null;

    const profesionalReciente =
        profesionales.length > 0
            ? profesionales[profesionales.length - 1]
            : null;


    return (

        <div className="dashboard">


            {/* ========================= */}
            {/* HEADER */}
            {/* ========================= */}

            <div className="dashboard-header">

                <div>

                    <h1>
                        SSEE Sistema de Seguimiento
                    </h1>

                    <p>
                        Resumen general
                    </p>

                </div>

            </div>


            {/* ========================= */}
            {/* ESTADÍSTICAS */}
            {/* ========================= */}

            <div className="stats-grid">


                {/* HOGARES */}

                <div className="stat-card">

                    <div className="stat-icon">
                        🏠
                    </div>

                    <div>

                        <p>
                            Hogares registrados
                        </p>

                        <h2>
                            {cantidadHogares}
                        </h2>

                    </div>

                </div>


                {/* PROFESIONALES */}

                <div className="stat-card">

                    <div className="stat-icon">
                        👨‍⚕️
                    </div>

                    <div>

                        <p>
                            Profesionales
                        </p>

                        <h2>
                            {cantidadProfesionales}
                        </h2>

                    </div>

                </div>


                {/* INTERVENCIONES */}

                <div className="stat-card">

                    <div className="stat-icon">
                        📋
                    </div>

                    <div>

                        <p>
                            Intervenciones
                        </p>

                        <h2>
                            {cantidadIntervenciones}
                        </h2>

                    </div>

                </div>


                {/* LISTA DE ESPERA */}

                <div className="stat-card">

                    <div className="stat-icon">
                        ⏳
                    </div>

                    <div>

                        <p>
                            Lista de espera
                        </p>

                        <h2>
                            {cantidadListaEspera}
                        </h2>

                    </div>

                </div>


            </div>


            {/* ========================= */}
            {/* ACTIVIDAD RECIENTE */}
            {/* ========================= */}

            <div className="dashboard-section">

                <div className="section-header">

                    <h2>
                        Actividad reciente
                    </h2>

                </div>


                <div className="activity-list">


                    {/* ========================= */}
                    {/* HOGAR RECIENTE */}
                    {/* ========================= */}

                    {hogarReciente && (

                        <div className="activity-item">

                            <span>
                                🏠
                            </span>

                            <div>

                                <strong>
                                    Hogar registrado
                                </strong>

                                <p>
                                    Hogar #{hogarReciente.id_hogar}
                                    {" - "}
                                    {hogarReciente.cuidador_principal}
                                </p>

                            </div>

                        </div>

                    )}


                    {/* ========================= */}
                    {/* PROFESIONAL RECIENTE */}
                    {/* ========================= */}

                    {profesionalReciente && (

                        <div className="activity-item">

                            <span>
                                👨‍⚕️
                            </span>

                            <div>

                                <strong>
                                    Profesional registrado
                                </strong>

                                <p>
                                    {profesionalReciente.disciplina}
                                    {" - "}
                                    {profesionalReciente.nombre}
                                </p>

                            </div>

                        </div>

                    )}


                    {/* ========================= */}
                    {/* SIN ACTIVIDADES */}
                    {/* ========================= */}

                    {!hogarReciente &&
                        !profesionalReciente && (

                            <p>
                                No hay actividades recientes.
                            </p>

                        )}

                </div>

            </div>


        </div>

    );

}

export default Dashboard;