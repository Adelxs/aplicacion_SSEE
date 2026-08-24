import { useEffect, useState } from "react";
import "./Dashboard.css";

function Dashboard() {

    

    const [cantidadHogares, setCantidadHogares] = useState(0);
    const [cantidadProfesionales, setCantidadProfesionales] = useState(0);

    useEffect(() => {

        fetch("http://127.0.0.1:8000/hogares")
            .then(response => response.json())
            .then(data => {
                setCantidadHogares(data.length);
            })
            .catch(error => {
                console.error("Error obteniendo hogares:", error);
            });

        fetch("http://127.0.0.1:8000/profesionales")
        .then(response => response.json())
        .then(data => {
            setCantidadProfesionales(data.length);
        })
        .catch(error => {
            console.error("Error obteniendo profesionales:", error);
        });

    }, []);



    return (
        <div className="dashboard">

            <div className="dashboard-header">
                <div>
                    <h1>SSEE Sistema de Seguimiento</h1>
                    <p>Resumen general</p>
                </div>
            </div>

            <div className="stats-grid">

                <div className="stat-card">
                    <div className="stat-icon">🏠</div>

                    <div>
                        <p>Hogares registrados</p>
                        <h2>{cantidadHogares}</h2>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-icon">👨‍⚕️</div>

                    <div>
                        <p>Profesionales</p>
                        <h2>{cantidadProfesionales}</h2>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-icon">📋</div>

                    <div>
                        <p>Intervenciones</p>
                        <h2>0</h2>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-icon">⏳</div>

                    <div>
                        <p>Lista de espera</p>
                        <h2>0</h2>
                    </div>
                </div>

            </div>

            <div className="dashboard-section">

                <div className="section-header">
                    <h2>Actividad reciente</h2>
                </div>

                <div className="activity-list">

                    <div className="activity-item">
                        <span>🏠</span>

                        <div>
                            <strong>Hogar registrado</strong>
                            <p>Psje Embajador Carlos Basallo #626</p>
                        </div>
                    </div>

                    <div className="activity-item">
                        <span>👨‍⚕️</span>

                        <div>
                            <strong>Profesional registrado</strong>
                            <p>Kinesiología - Karina V.</p>
                        </div>
                    </div>

                </div>

            </div>

        </div>
    );
}

export default Dashboard;