import { useEffect, useState } from "react";
import api from "../services/api";
import "./Intervenciones.css";

function Intervenciones() {

    const [intervenciones, setIntervenciones] = useState([]);
    const [hogares, setHogares] = useState([]);
    const [profesionales, setProfesionales] = useState([]);

    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState(null);

    const [mostrarFormulario, setMostrarFormulario] = useState(false);
    const [intervencionEditar, setIntervencionEditar] = useState(null);
    const [guardando, setGuardando] = useState(false);

    const [formulario, setFormulario] = useState({
        hogar_id: "",
        profesional_id: "",
        tipo: "",
        numero_intervencion: "",
        fecha_programada: "",
        fecha_realizada: "",
        estado: "pendiente",
        observaciones: ""
    });


    // =========================
    // OBTENER INTERVENCIONES
    // =========================

    const obtenerIntervenciones = async () => {

        try {

            const response = await api.get("/intervenciones");
            

            setIntervenciones(response.data);

        } catch (error) {

            console.error(error);
            setError("No se pudieron cargar las intervenciones");

        }

    };


    // =========================
    // OBTENER HOGARES
    // =========================

    const obtenerHogares = async () => {

        try {

            const response = await api.get("/hogares");

            setHogares(response.data);

        } catch (error) {

            console.error("Error al cargar hogares:", error);

        }

    };


    // =========================
    // OBTENER PROFESIONALES
    // =========================

    const obtenerProfesionales = async () => {

        try {

            const response = await api.get("/profesionales");

            setProfesionales(response.data);

        } catch (error) {

            console.error("Error al cargar profesionales:", error);

        }

    };


    // =========================
    // CARGA INICIAL
    // =========================

    useEffect(() => {

        const cargarDatos = async () => {

            setCargando(true);

            try {

                await Promise.all([
                    obtenerIntervenciones(),
                    obtenerHogares(),
                    obtenerProfesionales()
                ]);

            } catch (error) {

                console.error(error);

            } finally {

                setCargando(false);

            }

        };

        cargarDatos();

    }, []);


    // =========================
    // CAMBIAR CAMPOS
    // =========================

    const manejarCambio = (e) => {

        const { name, value } = e.target;

        setFormulario({
            ...formulario,
            [name]: value
        });

    };


    // =========================
    // NUEVA INTERVENCIÓN
    // =========================

    const nuevaIntervencion = () => {

        setIntervencionEditar(null);

        setFormulario({
            hogar_id: "",
            profesional_id: "",
            tipo: "",
            numero_intervencion: "",
            fecha_programada: "",
            fecha_realizada: "",
            estado: "pendiente",
            observaciones: ""
        });

        setMostrarFormulario(true);

    };


    // =========================
    // EDITAR
    // =========================

    const editarIntervencion = (intervencion) => {

        setIntervencionEditar(intervencion);

        setFormulario({
            hogar_id: intervencion.hogar?.id || "",
            profesional_id: intervencion.profesional?.id || "",
            tipo: intervencion.tipo || "",
            numero_intervencion: intervencion.numero_intervencion || "",
            fecha_programada: intervencion.fecha_programada || "",
            fecha_realizada: intervencion.fecha_realizada || "",
            estado: intervencion.estado || "pendiente",
            observaciones: intervencion.observaciones || ""
        });

        setMostrarFormulario(true);

    };


    // =========================
    // GUARDAR
    // =========================

    const guardarIntervencion = async (e) => {


        e.preventDefault();

        setGuardando(true);

        try {

            const datos = {
                hogar_id: Number(formulario.hogar_id),
                profesional_id: Number(formulario.profesional_id),
                tipo: formulario.tipo,
                numero_intervencion:
                    formulario.numero_intervencion
                        ? Number(formulario.numero_intervencion)
                        : null,
                fecha_programada:
                    formulario.fecha_programada || null,
                fecha_realizada:
                    formulario.fecha_realizada || null,
                estado: formulario.estado,
                observaciones:
                    formulario.observaciones || null
            };


            if (intervencionEditar) {

                await api.put(
                    `/intervenciones/${intervencionEditar.id}`,
                    datos
                );

                console.log("DATOS ENVIADOS:", datos);

            } else {

                await api.post(
                    "/intervenciones",
                    datos
                );

            }


            await obtenerIntervenciones();

            console.log("INTERVENCIONES ACTUALIZADAS:", intervenciones);

            setMostrarFormulario(false);
            setIntervencionEditar(null);

        } catch (error) {

            console.error("Error al guardar intervención:", error);

            alert("No se pudo guardar la intervención");

        } finally {

            setGuardando(false);

        }

    };


    // =========================
    // ELIMINAR
    // =========================

    const eliminarIntervencion = async (id) => {

        const confirmar = window.confirm(
            "¿Estás seguro de que deseas eliminar esta intervención?"
        );

        if (!confirmar) {
            return;
        }

        try {

            await api.delete(`/intervenciones/${id}`);

            await obtenerIntervenciones();

        } catch (error) {

            console.error("Error al eliminar intervención:", error);

            alert("No se pudo eliminar la intervención");

        }

    };


    // =========================
    // CARGANDO
    // =========================

    if (cargando) {
        return <h2>Cargando intervenciones...</h2>;
    }


    if (error) {
        return <h2>{error}</h2>;
    }


    // =========================
    // RENDER
    // =========================

    return (

       <div className="intervenciones">

    <div className="intervenciones-header">

        <div>

            <h1>Intervenciones</h1>

            <p>
                Intervenciones registradas en el sistema
            </p>

        </div>

        <button
            className="btn-nueva-intervencion"
            onClick={nuevaIntervencion}
        >
            + Nueva intervención
        </button>

    </div>


            {/* ========================= */}
            {/* MODAL */}
            {/* ========================= */}

            {mostrarFormulario && (

                <div className="modal-overlay">

                    <div className="modal-intervencion">

                        <div className="modal-header">

                            <div>

                                <h2>
                                    {intervencionEditar
                                        ? "Editar intervención"
                                        : "Nueva intervención"
                                    }
                                </h2>

                                <p>
                                    {intervencionEditar
                                        ? "Modifica los datos de la intervención"
                                        : "Registra una nueva intervención"
                                    }
                                </p>

                            </div>


                            <button
                                type="button"
                                className="modal-close"
                                onClick={() => {
                                    setMostrarFormulario(false);
                                    setIntervencionEditar(null);
                                }}
                            >
                                ×
                            </button>

                        </div>


                        <form onSubmit={guardarIntervencion}>

                            <label>
                                Hogar

                                <select
                                    name="hogar_id"
                                    value={formulario.hogar_id}
                                    onChange={manejarCambio}
                                    required
                                >

                                    <option value="">
                                        Seleccionar hogar
                                    </option>

                                    {hogares.map((hogar) => (

                                        <option
                                            key={hogar.id}
                                            value={hogar.id}
                                        >
                                            {hogar.cuidador_principal}
                                        </option>

                                    ))}

                                </select>

                            </label>


                            <label>
                                Profesional

                                <select
                                    name="profesional_id"
                                    value={formulario.profesional_id}
                                    onChange={manejarCambio}
                                    required
                                >

                                    <option value="">
                                        Seleccionar profesional
                                    </option>

                                    {profesionales.map((profesional) => (

                                        <option
                                            key={profesional.id}
                                            value={profesional.id}
                                        >
                                            {profesional.nombre}
                                        </option>

                                    ))}

                                </select>

                            </label>


                            <label>
                                Tipo de intervención

                                <input
                                    type="text"
                                    name="tipo"
                                    value={formulario.tipo}
                                    onChange={manejarCambio}
                                    placeholder="Ej: Visita domiciliaria"
                                    required
                                />

                            </label>


                            <label>
                                Número de intervención

                                <input
                                    type="number"
                                    name="numero_intervencion"
                                    value={formulario.numero_intervencion}
                                    onChange={manejarCambio}
                                    min="1"
                                    placeholder="Ej: 1"
                                />

                            </label>


                            <label>
                                Fecha programada

                                <input
                                    type="date"
                                    name="fecha_programada"
                                    value={formulario.fecha_programada}
                                    onChange={manejarCambio}
                                    required
                                />

                            </label>


                            <label>
                                Fecha realizada

                                <input
                                    type="date"
                                    name="fecha_realizada"
                                    value={formulario.fecha_realizada}
                                    onChange={manejarCambio}
                                />

                            </label>


                            <label>
                                Estado

                                <select
                                    name="estado"
                                    value={formulario.estado}
                                    onChange={manejarCambio}
                                    required
                                >

                                    <option value="pendiente">
                                        Pendiente
                                    </option>

                                    <option value="realizada">
                                        Realizada
                                    </option>

                                    <option value="cancelada">
                                        Cancelada
                                    </option>

                                </select>

                            </label>


                            <label className="campo-completo">
                                Observaciones

                                <textarea
                                    name="observaciones"
                                    value={formulario.observaciones}
                                    onChange={manejarCambio}
                                    placeholder="Observaciones de la intervención..."
                                />

                            </label>


                            <div className="form-actions">

                                <button
                                    type="button"
                                    onClick={() => {
                                        setMostrarFormulario(false);
                                        setIntervencionEditar(null);
                                    }}
                                >
                                    Cancelar
                                </button>


                                <button
                                    type="submit"
                                    disabled={guardando}
                                >
                                    {guardando
                                        ? "Guardando..."
                                        : intervencionEditar
                                            ? "Guardar cambios"
                                            : "Registrar intervención"
                                    }
                                </button>

                            </div>

                        </form>

                    </div>

                </div>

            )}


            {/* ========================= */}
            {/* TABLA */}
            {/* ========================= */}

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
                            <th>Acciones</th>

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

                                <td>
                                    <div className="acciones-intervencion">

                                        <button
                                            className="btn-editar"
                                            onClick={() => editarIntervencion(intervencion)}
                                        >
                                            ✏️
                                        </button>

                                        <button
                                            className="btn-eliminar"
                                            onClick={() =>
                                                eliminarIntervencion(intervencion.id)
                                            }
                                        >
                                            🗑️
                                        </button>

                                    </div>
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