import { useEffect, useState } from "react";
import api from "../services/api";
import "./ListaEspera.css";

function ListaEspera() {

    const [listaEspera, setListaEspera] = useState([]);
    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState(null);

    const [mostrarFormulario, setMostrarFormulario] = useState(false);
    const [modoFormulario, setModoFormulario] = useState("crear");

    // ID de la entrada que estamos editando
    const [idEditando, setIdEditando] = useState(null);


    // =========================================
    // FORMULARIO INICIAL
    // =========================================

    const formularioInicial = {
        id_hogar: "",
        cuidador_principal: "",
        psdf: "",
        direccion: "",
        unidad_vecinal: "",
        telefono: "",
        profesional_nombre: "",
        dia: "",
        estado: "pendiente",
        fecha_solicitud: "",
        observaciones: ""
    };


    const [formulario, setFormulario] = useState(
        formularioInicial
    );


    // =========================================
    // OBTENER LISTA DE ESPERA
    // =========================================

    const obtenerListaEspera = async () => {

        try {

            const response = await api.get(
                "/lista-espera"
            );

            setListaEspera(response.data);
            setError(null);

        } catch (error) {

            console.error(error);

            setError(
                "No se pudo cargar la lista de espera"
            );

        } finally {

            setCargando(false);

        }

    };


    useEffect(() => {

        obtenerListaEspera();

    }, []);


    // =========================================
    // CAMBIOS DEL FORMULARIO
    // =========================================

    const manejarCambio = (e) => {

        const { name, value } = e.target;

        setFormulario({
            ...formulario,
            [name]: value
        });

    };


    // =========================================
    // NUEVA ENTRADA
    // =========================================

    const abrirNuevo = () => {

        setModoFormulario("crear");

        setIdEditando(null);

        setFormulario(formularioInicial);

        setMostrarFormulario(true);

    };


    // =========================================
    // EDITAR ENTRADA
    // =========================================

    const abrirEditar = (entrada) => {

        setModoFormulario("editar");

        // Guardamos el ID de la entrada
        setIdEditando(entrada.id);

        setFormulario({

            id_hogar: entrada.id_hogar ?? "",

            cuidador_principal:
                entrada.cuidador_principal ?? "",

            psdf:
                entrada.psdf ?? "",

            direccion:
                entrada.direccion ?? "",

            unidad_vecinal:
                entrada.unidad_vecinal ?? "",

            telefono:
                entrada.telefono ?? "",

            profesional_nombre:
                entrada.profesional_nombre ?? "",

            dia:
                entrada.dia ?? "",

            estado:
                entrada.estado ?? "pendiente",

            fecha_solicitud:
                entrada.fecha_solicitud ?? "",

            observaciones:
                entrada.observaciones ?? ""

        });

        setMostrarFormulario(true);

    };


    // =========================================
    // CERRAR FORMULARIO
    // =========================================

    const cerrarFormulario = () => {

        setMostrarFormulario(false);

        setModoFormulario("crear");

        setIdEditando(null);

        setFormulario(formularioInicial);

    };


    // =========================================
    // GUARDAR ENTRADA
    // =========================================

    const guardarEntrada = async (e) => {

        e.preventDefault();

        console.log(
            "DATOS QUE SE ENVIAN:",
            formulario
        );

        try {

            // =================================
            // CREAR
            // =================================

            if (modoFormulario === "crear") {

                const response = await api.post(
                    "/lista-espera",
                    {
                        ...formulario,

                        id_hogar:
                            Number(formulario.id_hogar)
                    }
                );

                console.log(
                    "RESPUESTA POST:",
                    response.data
                );

                alert(
                    "Entrada agregada correctamente"
                );

            }

            // =================================
            // ACTUALIZAR
            // =================================

            else {

                const response = await api.put(

                    `/lista-espera/${idEditando}`,

                    {
                        ...formulario,

                        id_hogar:
                            Number(formulario.id_hogar)
                    }

                );

                console.log(
                    "RESPUESTA PUT:",
                    response.data
                );

                alert(
                    "Entrada actualizada correctamente"
                );

            }


            // Cerramos el modal
            cerrarFormulario();


            // Volvemos a cargar la tabla
            await obtenerListaEspera();


        } catch (error) {

            console.error(
                "ERROR COMPLETO:",
                error
            );

            console.error(
                "STATUS:",
                error.response?.status
            );

            console.error(
                "RESPUESTA DEL BACKEND:",
                error.response?.data
            );

            alert(
                error.response?.data?.detail ||
                "No se pudo guardar la entrada"
            );

        }

    };


    // =========================================
    // ELIMINAR ENTRADA
    // =========================================

    const eliminarEntrada = async (id) => {

        const confirmar = window.confirm(
            "¿Está seguro de eliminar esta entrada de la lista de espera?"
        );

        if (!confirmar) {

            return;

        }


        try {

            await api.delete(
                `/lista-espera/${id}`
            );


            // Actualizamos la tabla
            setListaEspera(

                listaEspera.filter(
                    entrada => entrada.id !== id
                )

            );


            alert(
                "Entrada eliminada correctamente"
            );


        } catch (error) {

            console.error(
                "ERROR AL ELIMINAR:",
                error
            );

            console.error(
                "RESPUESTA:",
                error.response?.data
            );

            alert(
                error.response?.data?.detail ||
                "No se pudo eliminar la entrada"
            );

        }

    };


    // =========================================
    // CARGANDO
    // =========================================

    if (cargando) {

        return (

            <h2>
                Cargando lista de espera...
            </h2>

        );

    }


    // =========================================
    // ERROR
    // =========================================

    if (error) {

        return (

            <h2>
                {error}
            </h2>

        );

    }


    // =========================================
    // RENDER
    // =========================================

    return (

        <div className="lista-espera-page">


            {/* ================================= */}
            {/* HEADER */}
            {/* ================================= */}

            <div className="lista-espera-header">

                <div>

                    <h1>
                        Lista de espera
                    </h1>

                    <p>
                        Casos registrados en lista de espera
                    </p>

                </div>


                <button
                    className="btn-nuevo"
                    onClick={abrirNuevo}
                >
                    + Nueva entrada
                </button>

            </div>


            {/* ================================= */}
            {/* MODAL */}
            {/* ================================= */}

            {mostrarFormulario && (

                <div className="modal-overlay">

                    <div className="lista-espera-modal">


                        {/* ========================= */}
                        {/* HEADER DEL MODAL */}
                        {/* ========================= */}

                        <div className="modal-header">

                            <div>

                                <h2>

                                    {modoFormulario === "crear"
                                        ? "Nueva entrada"
                                        : "Editar entrada"
                                    }

                                </h2>

                                <p>

                                    {modoFormulario === "crear"
                                        ? "Ingrese los datos de la lista de espera"
                                        : "Modifique los datos de la entrada"
                                    }

                                </p>

                            </div>


                            <button
                                type="button"
                                className="modal-close"
                                onClick={
                                    cerrarFormulario
                                }
                            >
                                ✕
                            </button>

                        </div>


                        {/* ========================= */}
                        {/* FORMULARIO */}
                        {/* ========================= */}

                        <form
                            onSubmit={guardarEntrada}
                        >


                            <div className="form-grid">


                                {/* ID HOGAR */}

                                <div className="form-group">

                                    <label>
                                        ID Hogar
                                    </label>

                                    <input
                                        type="number"
                                        name="id_hogar"
                                        value={
                                            formulario.id_hogar
                                        }
                                        onChange={
                                            manejarCambio
                                        }
                                        required
                                    />

                                </div>


                                {/* CUIDADOR */}

                                <div className="form-group">

                                    <label>
                                        Cuidador/a
                                    </label>

                                    <input
                                        type="text"
                                        name="cuidador_principal"
                                        value={
                                            formulario.cuidador_principal
                                        }
                                        onChange={
                                            manejarCambio
                                        }
                                        required
                                    />

                                </div>


                                {/* PSDF */}

                                <div className="form-group">

                                    <label>
                                        PSDF
                                    </label>

                                    <input
                                        type="text"
                                        name="psdf"
                                        value={
                                            formulario.psdf
                                        }
                                        onChange={
                                            manejarCambio
                                        }
                                        required
                                    />

                                </div>


                                {/* DIRECCIÓN */}

                                <div className="form-group">

                                    <label>
                                        Dirección
                                    </label>

                                    <input
                                        type="text"
                                        name="direccion"
                                        value={
                                            formulario.direccion
                                        }
                                        onChange={
                                            manejarCambio
                                        }
                                        required
                                    />

                                </div>


                                {/* TELÉFONO */}

                                <div className="form-group">

                                    <label>
                                        Teléfono
                                    </label>

                                    <input
                                        type="text"
                                        name="telefono"
                                        value={
                                            formulario.telefono
                                        }
                                        onChange={
                                            manejarCambio
                                        }
                                    />

                                </div>


                                {/* UNIDAD VECINAL */}

                                <div className="form-group">

                                    <label>
                                        Unidad vecinal
                                    </label>

                                    <input
                                        type="text"
                                        name="unidad_vecinal"
                                        value={
                                            formulario.unidad_vecinal
                                        }
                                        onChange={
                                            manejarCambio
                                        }
                                    />

                                </div>


                                {/* PROFESIONAL */}

                                <div className="form-group">

                                    <label>
                                        Profesional
                                    </label>

                                    <input
                                        type="text"
                                        name="profesional_nombre"
                                        value={
                                            formulario.profesional_nombre
                                        }
                                        onChange={
                                            manejarCambio
                                        }
                                    />

                                </div>


                                {/* DÍA */}

                                <div className="form-group">

                                    <label>
                                        Día
                                    </label>

                                    <select
                                        name="dia"
                                        value={
                                            formulario.dia
                                        }
                                        onChange={
                                            manejarCambio
                                        }
                                    >

                                        <option value="">
                                            Seleccionar
                                        </option>

                                        <option value="Lunes">
                                            Lunes
                                        </option>

                                        <option value="Martes">
                                            Martes
                                        </option>

                                        <option value="Miércoles">
                                            Miércoles
                                        </option>

                                        <option value="Jueves">
                                            Jueves
                                        </option>

                                        <option value="Viernes">
                                            Viernes
                                        </option>

                                    </select>

                                </div>


                                {/* ESTADO */}

                                <div className="form-group">

                                    <label>
                                        Estado
                                    </label>

                                    <select
                                        name="estado"
                                        value={
                                            formulario.estado
                                        }
                                        onChange={
                                            manejarCambio
                                        }
                                    >

                                        <option value="pendiente">
                                            Pendiente
                                        </option>

                                        <option value="en espera">
                                            En espera
                                        </option>

                                        <option value="atendido">
                                            Atendido
                                        </option>

                                        <option value="cancelado">
                                            Cancelado
                                        </option>

                                    </select>

                                </div>


                                {/* FECHA */}

                                <div className="form-group">

                                    <label>
                                        Fecha solicitud
                                    </label>

                                    <input
                                        type="date"
                                        name="fecha_solicitud"
                                        value={
                                            formulario.fecha_solicitud
                                        }
                                        onChange={
                                            manejarCambio
                                        }
                                    />

                                </div>


                                {/* OBSERVACIONES */}

                                <div className="form-group form-group-full">

                                    <label>
                                        Observaciones
                                    </label>

                                    <textarea
                                        name="observaciones"
                                        value={
                                            formulario.observaciones
                                        }
                                        onChange={
                                            manejarCambio
                                        }
                                    />

                                </div>


                            </div>


                            {/* ================================= */}
                            {/* BOTONES DEL FORMULARIO */}
                            {/* ================================= */}

                            <div className="form-actions">

                                <button
                                    type="button"
                                    className="btn-cancelar"
                                    onClick={
                                        cerrarFormulario
                                    }
                                >
                                    Cancelar
                                </button>


                                <button
                                    type="submit"
                                    className="btn-guardar"
                                >

                                    {modoFormulario === "crear"
                                        ? "Guardar entrada"
                                        : "Guardar cambios"
                                    }

                                </button>

                            </div>


                        </form>

                    </div>

                </div>

            )}


            {/* ================================= */}
            {/* TABLA */}
            {/* ================================= */}

            <div className="ssee-table-container">

                <table className="ssee-table">

                    <thead>

                        <tr>

                            <th>
                                ID Hogar
                            </th>

                            <th>
                                Cuidador/a
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

                            <th>
                                Profesional
                            </th>

                            <th>
                                Día
                            </th>

                            <th>
                                Estado
                            </th>

                            <th>
                                Acciones
                            </th>

                        </tr>

                    </thead>


                    <tbody>

                        {listaEspera.map(
                            (entrada) => (

                                <tr
                                    key={entrada.id}
                                >

                                    <td>

                                        <strong>
                                            {entrada.id_hogar}
                                        </strong>

                                    </td>


                                    <td>
                                        {
                                            entrada.cuidador_principal
                                        }
                                    </td>


                                    <td>
                                        {entrada.psdf}
                                    </td>


                                    <td>
                                        {entrada.direccion}
                                    </td>


                                    <td>
                                        {
                                            entrada.unidad_vecinal
                                        }
                                    </td>


                                    <td>
                                        {
                                            entrada.telefono
                                            ?? "-"
                                        }
                                    </td>


                                    <td>
                                        {
                                            entrada.profesional_nombre
                                            ?? "Sin asignar"
                                        }
                                    </td>


                                    <td>
                                        {
                                            entrada.dia
                                            ?? "-"
                                        }
                                    </td>


                                    <td>
                                        {
                                            entrada.estado
                                        }
                                    </td>


                                    <td className="acciones">


                                        {/* EDITAR */}

                                        <button
                                            type="button"
                                            className="btn-editar"
                                            onClick={() =>
                                                abrirEditar(
                                                    entrada
                                                )
                                            }
                                        >
                                            ✏️
                                        </button>


                                        {/* ELIMINAR */}

                                        <button
                                            type="button"
                                            className="btn-eliminar"
                                            onClick={() =>
                                                eliminarEntrada(
                                                    entrada.id
                                                )
                                            }
                                        >
                                            🗑️
                                        </button>


                                    </td>

                                </tr>

                            )
                        )}

                    </tbody>

                </table>

            </div>


        </div>

    );

}

export default ListaEspera;