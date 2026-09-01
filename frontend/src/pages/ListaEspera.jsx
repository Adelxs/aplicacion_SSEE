import { useEffect, useState } from "react";
import api from "../services/api";
import "./ListaEspera.css";

function ListaEspera() {

    const [listaEspera, setListaEspera] = useState([]);

    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState(null);

    const [usuario, setUsuario] = useState(null);

    // =========================================
    // HOGARES Y PROFESIONALES
    // =========================================

    const [hogares, setHogares] = useState([]);
    const [profesionales, setProfesionales] = useState([]);

    // Hogares del profesional
    const [hogaresProfesional, setHogaresProfesional] = useState([]);

    const [mostrarFormulario, setMostrarFormulario] = useState(false);
    const [modoFormulario, setModoFormulario] = useState("crear");

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

        profesional_id: "",

        dia: "",

        estado: "Pendiente",

        fecha_solicitud: "",

        observaciones: ""

    };


    const [formulario, setFormulario] = useState(
        formularioInicial
    );


    // =========================================
    // OBTENER USUARIO
    // =========================================

    const obtenerUsuario = async () => {

        try {

            const response = await api.get(
                "/usuarios/me"
            );

            setUsuario(response.data);

            return response.data;

        } catch (error) {

            console.error(
                "Error al obtener usuario:",
                error
            );

            throw error;

        }

    };


    // =========================================
    // OBTENER HOGARES
    // =========================================

    const obtenerHogares = async () => {

        try {

            const response = await api.get(
                "/hogares"
            );

            setHogares(
                response.data
            );

        } catch (error) {

            console.error(
                "Error al obtener hogares:",
                error
            );

            console.error(
                "Respuesta API:",
                error.response?.data
            );

            alert(
                error.response?.data?.detail ||
                "No se pudieron cargar los hogares"
            );

        }

    };


    // =========================================
    // OBTENER PROFESIONALES
    // =========================================

    const obtenerProfesionales = async () => {

        try {

            const response = await api.get(
                "/profesionales"
            );

            const profesionalesActivos =
                response.data.filter(
                    profesional =>
                        profesional.activo === true
                );

            setProfesionales(
                profesionalesActivos
            );

        } catch (error) {

            console.error(
                "Error al obtener profesionales:",
                error
            );

            console.error(
                "Respuesta API:",
                error.response?.data
            );

            alert(
                error.response?.data?.detail ||
                "No se pudieron cargar los profesionales"
            );

        }

    };


    // =========================================
    // OBTENER HOGARES DEL PROFESIONAL
    // =========================================

    const obtenerHogaresProfesional = async () => {

        try {

            const response = await api.get(
                "/profesionales/me/hogares"
            );

            setHogaresProfesional(
                response.data
            );

        } catch (error) {

            console.error(
                "Error al obtener hogares del profesional:",
                error
            );

            console.error(
                "Respuesta API:",
                error.response?.data
            );

            alert(
                error.response?.data?.detail ||
                "No se pudieron cargar los hogares del profesional"
            );

        }

    };


    // =========================================
    // OBTENER LISTA DE ESPERA
    // =========================================

    const obtenerListaEspera = async () => {

        try {

            const response = await api.get(
                "/lista-espera"
            );

            setListaEspera(
                response.data
            );

            setError(null);

        } catch (error) {

            console.error(
                "Error al cargar lista de espera:",
                error
            );

            console.error(
                "Respuesta API:",
                error.response?.data
            );

            setError(
                error.response?.data?.detail ||
                "No se pudo cargar la lista de espera"
            );

        } finally {

            setCargando(false);

        }

    };


    // =========================================
    // CARGA INICIAL
    // =========================================

    useEffect(() => {

        const cargarDatos = async () => {

            try {

                setCargando(true);

                const usuarioActual =
                    await obtenerUsuario();


                await obtenerListaEspera();


                // ==============================
                // ADMINISTRADOR
                // ==============================

                if (
                    usuarioActual.rol === "administrador"
                ) {

                    await obtenerHogares();

                    await obtenerProfesionales();

                }


                // ==============================
                // PROFESIONAL
                // ==============================

                if (
                    usuarioActual.rol === "profesional"
                ) {

                    await obtenerHogaresProfesional();

                }

            } catch (error) {

                console.error(
                    "Error al cargar datos:",
                    error
                );

                setError(
                    "No se pudieron cargar los datos"
                );

                setCargando(false);

            }

        };


        cargarDatos();

    }, []);


    // =========================================
    // CAMBIOS DEL FORMULARIO
    // =========================================

    const manejarCambio = (e) => {

        const {
            name,
            value
        } = e.target;

        setFormulario({

            ...formulario,

            [name]: value

        });

    };


    // =========================================
    // CAMBIAR HOGAR
    // =========================================

    const manejarCambioHogar = (e) => {

        const idHogar = e.target.value;


        if (!idHogar) {

            setFormulario({

                ...formulario,

                id_hogar: "",

                cuidador_principal: "",

                psdf: "",

                direccion: "",

                unidad_vecinal: "",

                telefono: ""

            });

            return;

        }


        const listaHogares =
            usuario?.rol === "administrador"
                ? hogares
                : hogaresProfesional;


        const hogarSeleccionado =
            listaHogares.find(

                hogar =>
                    String(hogar.id_hogar) ===
                    String(idHogar)

            );


        if (!hogarSeleccionado) {

            return;

        }


        setFormulario({

            ...formulario,

            id_hogar:
                hogarSeleccionado.id_hogar,

            cuidador_principal:
                hogarSeleccionado.cuidador_principal ?? "",

            psdf:
                hogarSeleccionado.psdf ?? "",

            direccion:
                hogarSeleccionado.direccion ?? "",

            unidad_vecinal:
                hogarSeleccionado.unidad_vecinal ?? "",

            telefono:
                hogarSeleccionado.telefono ?? ""

        });

    };


    // =========================================
    // CAMBIAR PROFESIONAL
    // =========================================

    const manejarCambioProfesional = (e) => {

        setFormulario({

            ...formulario,

            profesional_id:
                e.target.value

        });

    };


    // =========================================
    // LIMPIAR FORMULARIO
    // =========================================

    const limpiarFormulario = () => {

        setFormulario({

            ...formularioInicial

        });

    };


    // =========================================
    // NUEVA ENTRADA
    // =========================================

    const abrirNuevo = async () => {

        if (
            usuario?.rol !== "administrador"
        ) {

            return;

        }


        // Recargamos hogares y profesionales
        await obtenerHogares();

        await obtenerProfesionales();


        setModoFormulario(
            "crear"
        );

        setIdEditando(
            null
        );


        const hoy =
            new Date()
                .toISOString()
                .split("T")[0];


        setFormulario({

            ...formularioInicial,

            fecha_solicitud:
                hoy

        });


        setMostrarFormulario(
            true
        );

    };


    // =========================================
    // EDITAR ENTRADA
    // =========================================

    const abrirEditar = async (entrada) => {

        if (
            usuario?.rol !== "administrador"
        ) {

            return;

        }


        // Nos aseguramos de tener
        // los datos actualizados
        await obtenerHogares();

        await obtenerProfesionales();


        setModoFormulario(
            "editar"
        );


        setIdEditando(
            entrada.id
        );


        setFormulario({

            id_hogar:
                entrada.id_hogar ?? "",

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

            profesional_id:
                entrada.profesional_id ?? "",

            dia:
                entrada.dia ?? "",

            estado:
                entrada.estado ?? "Pendiente",

            fecha_solicitud:
                entrada.fecha_solicitud ?? "",

            observaciones:
                entrada.observaciones ?? ""

        });


        setMostrarFormulario(
            true
        );

    };


    // =========================================
    // CERRAR FORMULARIO
    // =========================================

    const cerrarFormulario = () => {

        setMostrarFormulario(
            false
        );

        setModoFormulario(
            "crear"
        );

        setIdEditando(
            null
        );

        limpiarFormulario();

    };


    // =========================================
    // GUARDAR ENTRADA
    // =========================================

    const guardarEntrada = async (e) => {

        e.preventDefault();


        if (
            usuario?.rol !== "administrador"
        ) {

            alert(
                "No tienes permisos para realizar esta acción"
            );

            return;

        }


        // =================================
        // VALIDACIONES
        // =================================

        if (!formulario.id_hogar) {

            alert(
                "Debe seleccionar un hogar"
            );

            return;

        }


        if (!formulario.profesional_id) {

            alert(
                "Debe seleccionar un profesional"
            );

            return;

        }


        if (!formulario.fecha_solicitud) {

            alert(
                "Debe seleccionar la fecha de solicitud"
            );

            return;

        }


        // =================================
        // DATOS PARA CREAR
        // =================================

        const datosEnviar = {

            id_hogar:
                Number(
                    formulario.id_hogar
                ),

            cuidador_principal:
                formulario.cuidador_principal,

            psdf:
                formulario.psdf,

            direccion:
                formulario.direccion,

            unidad_vecinal:
                formulario.unidad_vecinal ||
                null,

            telefono:
                formulario.telefono ||
                null,

            profesional_id:
                Number(
                    formulario.profesional_id
                ),

            dia:
                formulario.dia ||
                null,

            estado:
                formulario.estado,

            fecha_solicitud:
                formulario.fecha_solicitud,

            observaciones:
                formulario.observaciones ||
                null

        };


        console.log(
            "DATOS QUE SE ENVIAN:",
            datosEnviar
        );


        try {

            // =================================
            // CREAR
            // =================================

            if (
                modoFormulario === "crear"
            ) {

                const response =
                    await api.post(

                        "/lista-espera",

                        datosEnviar

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
            // EDITAR
            // =================================

            else {

                const datosActualizar = {

                    id_hogar:
                        Number(
                            formulario.id_hogar
                        ),

                    cuidador_principal:
                        formulario.cuidador_principal,

                    psdf:
                        formulario.psdf,

                    direccion:
                        formulario.direccion,

                    unidad_vecinal:
                        formulario.unidad_vecinal ||
                        null,

                    telefono:
                        formulario.telefono ||
                        null,

                    profesional_id:
                        Number(
                            formulario.profesional_id
                        ),

                    dia:
                        formulario.dia ||
                        null,

                    estado:
                        formulario.estado,

                    fecha_solicitud:
                        formulario.fecha_solicitud,

                    observaciones:
                        formulario.observaciones ||
                        null

                };


                console.log(
                    "DATOS PUT:",
                    datosActualizar
                );


                const response =
                    await api.put(

                        `/lista-espera/${idEditando}`,

                        datosActualizar

                    );


                console.log(
                    "RESPUESTA PUT:",
                    response.data
                );


                alert(
                    "Entrada actualizada correctamente"
                );

            }


            // =================================
            // CERRAR
            // =================================

            cerrarFormulario();


            // =================================
            // RECARGAR
            // =================================

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
                "RESPUESTA BACKEND:",
                error.response?.data
            );


            const detalle =
                error.response?.data?.detail;


            if (
                Array.isArray(detalle)
            ) {

                const mensajes =
                    detalle
                        .map(
                            item =>
                                item.msg ||
                                JSON.stringify(item)
                        )
                        .join("\n");


                alert(
                    mensajes
                );

            } else {

                alert(

                    detalle ||

                    "No se pudo guardar la entrada"

                );

            }

        }

    };


    // =========================================
    // ELIMINAR
    // =========================================

    const eliminarEntrada = async (id) => {

        if (
            usuario?.rol !== "administrador"
        ) {

            alert(
                "No tienes permisos para realizar esta acción"
            );

            return;

        }


        const confirmar =
            window.confirm(

                "¿Está seguro de eliminar esta entrada de la lista de espera?"

            );


        if (!confirmar) {

            return;

        }


        try {

            await api.delete(
                `/lista-espera/${id}`
            );


            setListaEspera(

                listaEspera.filter(

                    entrada =>
                        entrada.id !== id

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

        <div className="intervenciones">


            {/* ================================= */}
            {/* HEADER */}
            {/* ================================= */}

            
{/* ================================= */}
{/* HEADER */}
{/* ================================= */}

<div className="intervenciones-header">

    <div>

        <h1>
            Lista de espera
        </h1>

        <p>
            Casos registrados en lista de espera
        </p>

    </div>


    {usuario?.rol === "administrador" && (

        <button
            className="btn-nueva-intervencion"
            onClick={abrirNuevo}
        >

            + Nueva entrada

        </button>

    )}



</div>




            {/* ================================= */}
            {/* MODAL */}
            {/* ================================= */}

            {mostrarFormulario &&
                usuario?.rol === "administrador" && (

                <div className="modal-overlay">

                    <div className="modal-intervencion">


                        {/* ========================= */}
                        {/* HEADER */}
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
                                onClick={cerrarFormulario}
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


                            {/* ========================= */}
                            {/* HOGAR */}
                            {/* ========================= */}

                            <label>

                                Hogar

                                <select
                                    name="id_hogar"
                                    value={
                                        formulario.id_hogar
                                    }
                                    onChange={
                                        manejarCambioHogar
                                    }
                                    required
                                >

                                    <option value="">
                                        Seleccione un hogar
                                    </option>


                                    {hogares.map(
                                        hogar => (

                                            <option
                                                key={
                                                    hogar.id_hogar
                                                }
                                                value={
                                                    hogar.id_hogar
                                                }
                                            >

                                                {hogar.id_hogar}
                                                {" - "}
                                                {
                                                    hogar.cuidador_principal
                                                }

                                            </option>

                                        )
                                    )}

                                </select>

                            </label>


                            {/* ========================= */}
                            {/* CUIDADOR */}
                            {/* ========================= */}

                            <label>

                                Cuidador/a

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

                            </label>


                            {/* ========================= */}
                            {/* PSDF */}
                            {/* ========================= */}

                            <label>

                                PSDF

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

                            </label>


                            {/* ========================= */}
                            {/* DIRECCIÓN */}
                            {/* ========================= */}

                            <label>

                                Dirección

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

                            </label>


                            {/* ========================= */}
                            {/* TELÉFONO */}
                            {/* ========================= */}

                            <label>

                                Teléfono

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

                            </label>


                            {/* ========================= */}
                            {/* UNIDAD VECINAL */}
                            {/* ========================= */}

                            <label>

                                Unidad vecinal

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

                            </label>


                            {/* ========================= */}
                            {/* PROFESIONAL */}
                            {/* ========================= */}

                            <label>

                                Profesional

                                <select
                                    name="profesional_id"
                                    value={
                                        formulario.profesional_id
                                    }
                                    onChange={
                                        manejarCambioProfesional
                                    }
                                    required
                                >

                                    <option value="">
                                        Seleccione un profesional
                                    </option>


                                    {profesionales.map(
                                        profesional => (

                                            <option
                                                key={
                                                    profesional.id
                                                }
                                                value={
                                                    profesional.id
                                                }
                                            >

                                                {
                                                    profesional.nombre
                                                }

                                                {" - "}

                                                {
                                                    profesional.disciplina
                                                }

                                            </option>

                                        )
                                    )}

                                </select>

                            </label>


                            {/* ========================= */}
                            {/* DÍA */}
                            {/* ========================= */}

                            <label>

                                Día

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

                            </label>


                            {/* ========================= */}
                            {/* ESTADO */}
                            {/* ========================= */}

                            <label>

                                Estado

                                <select
                                    name="estado"
                                    value={
                                        formulario.estado
                                    }
                                    onChange={
                                        manejarCambio
                                    }
                                >

                                    <option value="Pendiente">
                                        Pendiente
                                    </option>

                                    <option value="En espera">
                                        En espera
                                    </option>

                                    <option value="Atendido">
                                        Atendido
                                    </option>

                                    <option value="Cancelado">
                                        Cancelado
                                    </option>

                                </select>

                            </label>


                            {/* ========================= */}
                            {/* FECHA */}
                            {/* ========================= */}

                            <label>

                                Fecha solicitud

                                <input
                                    type="date"
                                    name="fecha_solicitud"
                                    value={
                                        formulario.fecha_solicitud
                                    }
                                    onChange={
                                        manejarCambio
                                    }
                                    required
                                />

                            </label>


                            {/* ========================= */}
                            {/* OBSERVACIONES */}
                            {/* ========================= */}

                            <label className="campo-completo">

                                Observaciones

                                <textarea
                                    name="observaciones"
                                    value={
                                        formulario.observaciones
                                    }
                                    onChange={
                                        manejarCambio
                                    }
                                />

                            </label>


                            {/* ========================= */}
                            {/* BOTONES */}
                            {/* ========================= */}

                            <div className="form-actions">

                                <button
                                    type="button"
                                    onClick={cerrarFormulario}
                                >

                                    Cancelar

                                </button>


                                <button
                                    type="submit"
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
                                Fecha solicitud
                            </th>

                            <th>
                                Observaciones
                            </th>

                            {usuario?.rol === "administrador" && (

                                <th>
                                    Acciones
                                </th>

                            )}

                        </tr>

                    </thead>


                    <tbody>

                        {listaEspera.map(

                            (entrada) => {

                                const profesional =
                                    profesionales.find(

                                        profesional =>
                                            Number(
                                                profesional.id
                                            ) ===
                                            Number(
                                                entrada.profesional_id
                                            )

                                    );


                                return (

                                    <tr
                                        key={
                                            entrada.id
                                        }
                                    >

                                        <td>

                                            <strong>
                                                {
                                                    entrada.id_hogar
                                                }
                                            </strong>

                                        </td>


                                        <td>

                                            {
                                                entrada.cuidador_principal
                                            }

                                        </td>


                                        <td>

                                            {
                                                entrada.psdf
                                            }

                                        </td>


                                        <td>

                                            {
                                                entrada.direccion
                                            }

                                        </td>


                                        <td>

                                            {
                                                entrada.unidad_vecinal
                                                ?? "-"
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

                                                profesional

                                                    ? profesional.nombre

                                                    : "Sin asignar"

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


                                        {/* ========================= */}
                                        {/* FECHA */}
                                        {/* ========================= */}

                                        <td>

                                            {
                                                entrada.fecha_solicitud
                                                    ? new Date(
                                                        `${entrada.fecha_solicitud}T00:00:00`
                                                    ).toLocaleDateString(
                                                        "es-CL"
                                                    )
                                                    : "-"
                                            }

                                        </td>


                                        {/* ========================= */}
                                        {/* OBSERVACIONES */}
                                        {/* ========================= */}

                                        <td>

                                            {
                                                entrada.observaciones
                                                ?? "-"
                                            }

                                        </td>


                                        {/* ========================= */}
                                        {/* ACCIONES */}
                                        {/* ========================= */}

                                        {usuario?.rol === "administrador" && (

                                            <td className="acciones-intervencion">


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

                                        )}

                                    </tr>

                                );

                            }

                        )}

                    </tbody>

                </table>

            </div>


        </div>

    );

}

export default ListaEspera;