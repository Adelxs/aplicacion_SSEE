import "./DashboardProfesional.css";

function DashboardProfesional() {
    return (
        <div className="dashboard-profesional">

            <div className="dashboard-profesional-header">
                <h1>Panel Profesional</h1>

                <p>
                    Bienvenido al sistema de seguimiento
                </p>
            </div>


            <div className="profesional-cards">

                <div className="profesional-card">
                    <h3>Intervenciones</h3>

                    <span>
                        0
                    </span>

                    <p>
                        Intervenciones registradas
                    </p>
                </div>


                <div className="profesional-card">
                    <h3>Lista de espera</h3>

                    <span>
                        0
                    </span>

                    <p>
                        Hogares pendientes
                    </p>
                </div>

            </div>


            <div className="profesional-section">

                <h2>Próximas intervenciones</h2>

                <p>
                    No hay intervenciones programadas.
                </p>

            </div>

        </div>
    );
}

export default DashboardProfesional;