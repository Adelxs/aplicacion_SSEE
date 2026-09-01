
import { useEffect, useState } from "react";
import api from "../services/api";
import "./Profesionales.css";

function Profesionales() {

    const [profesionales, setProfesionales] = useState([]);
    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState(null);

    const [mostrarFormulario, setMostrarFormulario] = useState(false);
    const [modoFormulario, setModoFormulario] = useState("crear");

    const [formulario, setFormulario] = useState({
        nombre: "",
        disciplina: "",
        activo: true
    });


    useEffect(() => {
        obtenerProfesionales();
    }, []);


    const obtenerProfesionales = async () => {

        try {

            const response = await api.get("/profesionales");

            setProfesionales(response.data);

        } catch (error) {

            console.error(error);

            setError(
                "No se pudieron cargar los profesionales"
            );

        } finally {

            setCargando(false);

        }
    };


    const manejarCambio = (e) => {

        const { name, value } = e.target;

        setFormulario({
            ...formulario,
            [name]: value
        });
    };


    const abrirNuevo = () => {

        setModoFormulario("crear");

        setFormulario({
            nombre: "",
            disciplina: "",
            activo: true
        });

        setMostrarFormulario(true);
    };


    const abrirEditar = (profesional) => {

        setModoFormulario("editar");

        setFormulario({
            id: profesional.id,
            nombre: profesional.nombre,
            disciplina: profesional.disciplina,
            activo: profesional.activo
        });

        setMostrarFormulario(true);
    };


    const guardarProfesional = async (e) => {

        e.preventDefault();

        try {

            if (modoFormulario === "crear") {

                const response = await api.post(
                    "/profesionales",
                    {
                        nombre: formulario.nombre,
                        disciplina: formulario.disciplina,
                        activo: formulario.activo
                    }
                );

                setProfesionales([
                    ...profesionales,
                    response.data
                ]);

            } else {

                const response = await api.put(
                    `/profesionales/${formulario.id}`,
                    {
                        nombre: formulario.nombre,
                        disciplina: formulario.disciplina,
                        activo: formulario.activo
                    }
                );

                setProfesionales(
                    profesionales.map((profesional) =>
                        profesional.id === formulario.id
                            ? response.data
                            : profesional
                    )
                );
            }

            setMostrarFormulario(false);

        } catch (error) {

            console.error(error);

            alert(
                "No se pudo guardar el profesional"
            );
        }
    };


    const cambiarEstado = async (id) => {

        try {

            const response = await api.patch(
                `/profesionales/${id}/estado`
            );

            setProfesionales(
                profesionales.map((profesional) =>
                    profesional.id === id
                        ? response.data
                        : profesional
                )
            );

        } catch (error) {

            console.error(error);

            alert(
                "No se pudo cambiar el estado"
            );
        }
    };


    if (cargando) {

        return <h2>Cargando profesionales...</h2>;

    }


    if (error) {

        return <h2>{error}</h2>;

    }


    return (

        <div className="profesionales-page">

            <div className="profesionales-header">

                <div>

                    <h1>Profesionales</h1>

                    <p>
                        Profesionales registrados en el sistema
                    </p>

                </div>


                <button
                    className="btn-nuevo"
                    onClick={abrirNuevo}
                >
                    + Nuevo profesional
                </button>

            </div>


            {mostrarFormulario && (

                <div className="modal-overlay">

                    <div className="profesional-modal">

                        <div className="modal-header">

                            <div>

                                <h2>
                                    {modoFormulario === "crear"
                                        ? "Nuevo profesional"
                                        : "Editar profesional"
                                    }
                                </h2>

                                <p>
                                    {modoFormulario === "crear"
                                        ? "Ingrese los datos del profesional"
                                        : "Modifique los datos del profesional"
                                    }
                                </p>

                            </div>


                            <button
                                className="modal-close"
                                onClick={() =>
                                    setMostrarFormulario(false)
                                }
                            >
                                ✕
                            </button>

                        </div>


                        <form onSubmit={guardarProfesional}>

                            <div className="form-grid">

                                <div className="form-group">

                                    <label>
                                        Nombre
                                    </label>

                                    <input
                                        type="text"
                                        name="nombre"
                                        value={formulario.nombre}
                                        onChange={manejarCambio}
                                        required
                                    />

                                </div>


                                <div className="form-group">

                                    <label>
                                        Disciplina
                                    </label>

                                    <input
                                        type="text"
                                        name="disciplina"
                                        value={formulario.disciplina}
                                        onChange={manejarCambio}
                                        required
                                    />

                                </div>


                                <div className="form-group">

                                    <label>
                                        Estado
                                    </label>

                                    <select
                                        name="activo"
                                        value={
                                            formulario.activo
                                                ? "true"
                                                : "false"
                                        }
                                        onChange={(e) =>
                                            setFormulario({
                                                ...formulario,
                                                activo:
                                                    e.target.value === "true"
                                            })
                                        }
                                    >

                                        <option value="true">
                                            Activo
                                        </option>

                                        <option value="false">
                                            Inactivo
                                        </option>

                                    </select>

                                </div>

                            </div>


                            <div className="form-actions">

                                <button
                                    type="button"
                                    className="btn-cancelar"
                                    onClick={() =>
                                        setMostrarFormulario(false)
                                    }
                                >
                                    Cancelar
                                </button>


                                <button
                                    type="submit"
                                    className="btn-guardar"
                                >
                                    {modoFormulario === "crear"
                                        ? "Guardar profesional"
                                        : "Guardar cambios"
                                    }
                                </button>

                            </div>

                        </form>

                    </div>

                </div>

            )}


            <div className="ssee-table-container">

                <table className="ssee-table">

                    <thead>

                        <tr>

                            <th>ID</th>

                            <th>Nombre</th>

                            <th>Disciplina</th>

                            <th>Estado</th>

                            <th>Acciones</th>

                        </tr>

                    </thead>


                    <tbody>

                        {profesionales.map((profesional) => (

                            <tr key={profesional.id}>

                                <td>
                                    <strong>
                                        {profesional.id}
                                    </strong>
                                </td>


                                <td>
                                    {profesional.nombre}
                                </td>


                                <td>
                                    {profesional.disciplina}
                                </td>


                                <td>

                                    <span
                                        className={
                                            profesional.activo
                                                ? "estado activo"
                                                : "estado inactivo"
                                        }
                                    >
                                        {profesional.activo
                                            ? "Activo"
                                            : "Inactivo"
                                        }
                                    </span>

                                </td>


                                <td className="acciones">

                                    <button
                                        className="btn-editar"
                                        onClick={() =>
                                            abrirEditar(profesional)
                                        }
                                    >
                                        ✏️
                                    </button>


                                    <button
                                        className={
                                            profesional.activo
                                                ? "btn-desactivar"
                                                : "btn-activar"
                                        }
                                        onClick={() =>
                                            cambiarEstado(
                                                profesional.id
                                            )
                                        }
                                    >
                                        {profesional.activo
                                            ? "Inactivar"
                                            : "Activar"
                                        }
                                    </button>

                                </td>

                            </tr>

                        ))}

                    </tbody>

                </table>

            </div>

        </div>
    );
}

export default Profesionales;

