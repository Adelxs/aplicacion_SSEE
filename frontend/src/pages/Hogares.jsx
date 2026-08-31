
import { useEffect, useState } from "react";
import api from "../services/api";
import "./Hogares.css";

function Hogares() {

    const [hogares, setHogares] = useState([]);

    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState(null);

    const [usuario, setUsuario] = useState(null);

    const [hogaresDisponibles, setHogaresDisponibles] = useState([]);

    const [mostrarFormulario, setMostrarFormulario] = useState(false);
    const [modoFormulario, setModoFormulario] = useState("crear");

    const [formulario, setFormulario] = useState({
        id_hogar: "",
        cuidador_principal: "",
        psdf: "",
        direccion: "",
        telefono: "",
        unidad_vecinal: "",
        estado: "Activo"
    });


    // =========================
    // OBTENER USUARIO
    // =========================

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

            setError(
                "No se pudo obtener la información del usuario"
            );

            return null;
        }
    };


    // =========================
    // OBTENER HOGARES
    // =========================

    const obtenerHogares = async () => {

        try {

            // Profesional
            if (usuario?.rol === "profesional") {

                const response = await api.get(
                    "/profesionales/me/hogares"
                );

                setHogares(response.data);

            }

            // Administrador
            else {

                const response = await api.get(
                    "/hogares"
                );

                setHogares(response.data);

            }

        } catch (error) {

            console.error(
                "Error al cargar hogares:",
                error
            );

            console.error(
                "Respuesta API:",
                error.response?.data
            );

            setError(
                "No se pudieron cargar los hogares"
            );

        }

    };


    // =========================
    // OBTENER HOGARES DISPONIBLES
    // =========================

    const obtenerHogaresDisponibles = async () => {

        try {

            const response = await api.get(
                "/profesionales/me/hogares/disponibles"
            );

            setHogaresDisponibles(
                response.data
            );

        } catch (error) {

            console.error(
                "Error al cargar hogares disponibles:",
                error
            );

            console.error(
                "Respuesta API:",
                error.response?.data
            );

            if (
                error.response?.data?.detail
            ) {

                alert(
                    error.response.data.detail
                );

            } else {

                alert(
                    "No se pudieron cargar los hogares disponibles"
                );

            }

        }

    };


    // =========================
    // CARGA INICIAL
    // =========================

    useEffect(() => {

        const cargarDatos = async () => {

            try {

                setCargando(true);

                // Primero obtenemos el usuario
                const responseUsuario = await api.get(
                    "/usuarios/me"
                );

                const usuarioActual =
                    responseUsuario.data;

                setUsuario(usuarioActual);


                // =========================
                // CARGAR HOGARES SEGÚN ROL
                // =========================

                if (
                    usuarioActual.rol === "profesional"
                ) {

                    const responseHogares =
                        await api.get(
                            "/profesionales/me/hogares"
                        );

                    setHogares(
                        responseHogares.data
                    );

                } else {

                    const responseHogares =
                        await api.get(
                            "/hogares"
                        );

                    setHogares(
                        responseHogares.data
                    );

                }

            } catch (error) {

                console.error(
                    "Error al cargar datos:",
                    error
                );

                console.error(
                    "Respuesta API:",
                    error.response?.data
                );

                setError(
                    "No se pudieron cargar los hogares"
                );

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
    // FORMULARIO VACÍO
    // =========================

    const formularioInicial = () => {

        return {

            id_hogar: "",
            cuidador_principal: "",
            psdf: "",
            direccion: "",
            telefono: "",
            unidad_vecinal: "",
            estado: "Activo"

        };

    };


    // =========================
    // NUEVO / AGREGAR HOGAR
    // =========================

    const abrirNuevo = () => {

        setFormulario(
            formularioInicial()
        );


        // =========================
        // PROFESIONAL
        // =========================

        if (
            usuario?.rol === "profesional"
        ) {

            setModoFormulario(
                "agregar"
            );

            obtenerHogaresDisponibles();

        }

        // =========================
        // ADMINISTRADOR
        // =========================

        else {

            setModoFormulario(
                "crear"
            );

        }


        setMostrarFormulario(
            true
        );

    };


    // =========================
    // EDITAR HOGAR
    // =========================

    const abrirEditar = (hogar) => {

        setModoFormulario(
            "editar"
        );

        setFormulario({

            id_hogar:
                hogar.id_hogar,

            cuidador_principal:
                hogar.cuidador_principal,

            psdf:
                hogar.psdf,

            direccion:
                hogar.direccion,

            telefono:
                hogar.telefono,

            unidad_vecinal:
                hogar.unidad_vecinal,

            estado:
                hogar.estado

        });

        setMostrarFormulario(
            true
        );

    };


    // =========================
    // GUARDAR / AGREGAR HOGAR
    // =========================

    const guardarHogar = async (e) => {

        e.preventDefault();


        // =========================
        // AGREGAR HOGAR EXISTENTE
        // =========================

        if (
            modoFormulario === "agregar"
        ) {

            try {

                const idHogar =
                    Number(
                        formulario.id_hogar
                    );


                await api.post(
                    `/profesionales/me/hogares/${idHogar}`
                );


                alert(
                    "Hogar agregado correctamente"
                );


                // Actualizar tabla
                await obtenerHogares();


                // Actualizar disponibles
                await obtenerHogaresDisponibles();


                setFormulario(
                    formularioInicial()
                );

                setMostrarFormulario(
                    false
                );


                return;

            } catch (error) {

                console.error(
                    "Error al agregar hogar:",
                    error
                );

                console.error(
                    "Respuesta API:",
                    error.response?.data
                );


                if (
                    error.response?.data?.detail
                ) {

                    alert(
                        error.response.data.detail
                    );

                } else {

                    alert(
                        "No se pudo agregar el hogar"
                    );

                }


                return;

            }

        }


        // =========================
        // CREAR / EDITAR
        // =========================

        try {

            const datos = {

                ...formulario,

                id_hogar:
                    Number(
                        formulario.id_hogar
                    )

            };


            // =========================
            // CREAR
            // =========================

            if (
                modoFormulario === "crear"
            ) {

                const response =
                    await api.post(
                        "/hogares",
                        datos
                    );


                setHogares([

                    ...hogares,

                    response.data

                ]);

            }


            // =========================
            // EDITAR
            // =========================

            else {

                const idHogar =
                    Number(
                        formulario.id_hogar
                    );


                const response =
                    await api.put(
                        `/hogares/${idHogar}`,
                        datos
                    );


                setHogares(

                    hogares.map(

                        (hogar) =>

                            hogar.id_hogar === idHogar

                                ? response.data

                                : hogar

                    )

                );

            }


            setFormulario(
                formularioInicial()
            );

            setMostrarFormulario(
                false
            );


        } catch (error) {

            console.error(
                "Error al guardar hogar:",
                error
            );

            console.error(
                "Respuesta API:",
                error.response?.data
            );


            if (
                error.response?.data?.detail
            ) {

                alert(
                    error.response.data.detail
                );

            } else {

                alert(
                    "No se pudo guardar la información"
                );

            }

        }

    };


    // =========================
    // ELIMINAR HOGAR
    // =========================
    // SOLO ADMINISTRADOR
    //
    // Elimina el hogar del sistema.
    // =========================

    const eliminarHogar = async (
        id_hogar
    ) => {

        const confirmar =
            window.confirm(

                `¿Está seguro de eliminar el hogar ${id_hogar}?`

            );


        if (!confirmar) {

            return;

        }


        try {

            await api.delete(
                `/hogares/${id_hogar}`
            );


            setHogares(

                hogares.filter(

                    (hogar) =>
                        hogar.id_hogar !== id_hogar

                )

            );


        } catch (error) {

            console.error(
                "Error al eliminar hogar:",
                error
            );

            console.error(
                "Respuesta API:",
                error.response?.data
            );


            if (
                error.response?.data?.detail
            ) {

                alert(
                    error.response.data.detail
                );

            } else {

                alert(
                    "No se pudo eliminar el hogar"
                );

            }

        }

    };


    // =========================
    // QUITAR HOGAR DE MI LISTA
    // =========================
    // SOLO PROFESIONAL
    //
    // NO elimina el hogar del sistema.
    //
    // Elimina únicamente la relación:
    //
    // profesional_hogar
    //
    // profesional_id + hogar_id
    // =========================

    const quitarHogarDeMiLista = async (
        id_hogar
    ) => {

        const confirmar =
            window.confirm(

                `¿Está seguro de quitar el hogar ${id_hogar} de su lista?`

            );


        if (!confirmar) {

            return;

        }


        try {

            await api.delete(
                `/profesionales/me/hogares/${id_hogar}`
            );


            alert(
                "Hogar eliminado de tu lista correctamente"
            );


            // Actualizamos la tabla
            setHogares(

                hogares.filter(

                    (hogar) =>
                        hogar.id_hogar !== id_hogar

                )

            );


            // Actualizamos hogares disponibles
            await obtenerHogaresDisponibles();


        } catch (error) {

            console.error(
                "Error al quitar hogar de la lista:",
                error
            );

            console.error(
                "Respuesta API:",
                error.response?.data
            );


            if (
                error.response?.data?.detail
            ) {

                alert(
                    error.response.data.detail
                );

            } else {

                alert(
                    "No se pudo quitar el hogar de tu lista"
                );

            }

        }

    };


    // =========================
    // CARGANDO
    // =========================

    if (cargando) {

        return (

            <h2>
                Cargando hogares...
            </h2>

        );

    }


    // =========================
    // ERROR
    // =========================

    if (error) {

        return (

            <h2>
                {error}
            </h2>

        );

    }


    // =========================
    // RENDER
    // =========================

    return (

        <div className="hogares-page">


            {/* ========================= */}
            {/* HEADER */}
            {/* ========================= */}

            <div className="hogares-header">

                <div>

                    <h1>
                        Hogares
                    </h1>

                    <p>
                        {usuario?.rol === "profesional"

                            ? "Hogares asignados a mi lista"

                            : "Hogares registrados en el sistema"

                        }
                    </p>

                </div>


                <button
                    className="btn-nuevo"
                    onClick={abrirNuevo}
                >

                    {usuario?.rol === "profesional"

                        ? "+ Agregar hogar"

                        : "+ Nuevo hogar"

                    }

                </button>

            </div>


            {/* ========================= */}
            {/* MODAL */}
            {/* ========================= */}

            {mostrarFormulario && (

                <div className="modal-overlay">

                    <div className="hogar-modal">


                        {/* ========================= */}
                        {/* HEADER MODAL */}
                        {/* ========================= */}

                        <div className="modal-header">

                            <div>

                                <h2>

                                    {modoFormulario === "crear"

                                        ? "Nuevo hogar"

                                        : modoFormulario === "editar"

                                            ? "Editar hogar"

                                            : "Agregar hogar"

                                    }

                                </h2>


                                <p>

                                    {modoFormulario === "crear"

                                        ? "Ingrese los datos del hogar"

                                        : modoFormulario === "editar"

                                            ? "Modifique los datos del hogar"

                                            : "Seleccione un hogar disponible"

                                    }

                                </p>

                            </div>


                            <button

                                type="button"

                                className="modal-close"

                                onClick={() => {

                                    setMostrarFormulario(
                                        false
                                    );

                                    setFormulario(
                                        formularioInicial()
                                    );

                                }}

                            >

                                ✕

                            </button>

                        </div>


                        {/* ========================= */}
                        {/* FORMULARIO */}
                        {/* ========================= */}

                        <form
                            onSubmit={guardarHogar}
                        >


                            {/* ========================= */}
                            {/* PROFESIONAL: AGREGAR */}
                            {/* ========================= */}

                            {modoFormulario === "agregar" ? (

                                <div className="form-group">

                                    <label>
                                        ID Hogar
                                    </label>


                                    <select

                                        name="id_hogar"

                                        value={
                                            formulario.id_hogar
                                        }

                                        onChange={
                                            manejarCambio
                                        }

                                        required

                                    >

                                        <option value="">
                                            Seleccione un hogar
                                        </option>


                                        {hogaresDisponibles.map(

                                            (hogar) => (

                                                <option

                                                    key={
                                                        hogar.id
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

                                </div>

                            ) : (


                                /* ========================= */
                                /* ADMINISTRADOR */
                                /* ========================= */

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

                                            disabled={
                                                modoFormulario === "editar"
                                            }

                                        />

                                    </div>


                                    {/* CUIDADOR */}

                                    <div className="form-group">

                                        <label>
                                            Cuidador principal
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

                                            <option value="Activo">
                                                Activo
                                            </option>

                                            <option value="Inactivo">
                                                Inactivo
                                            </option>

                                        </select>

                                    </div>

                                </div>

                            )}


                            {/* ========================= */}
                            {/* ACCIONES */}
                            {/* ========================= */}

                            <div className="form-actions">


                                <button

                                    type="button"

                                    className="btn-cancelar"

                                    onClick={() => {

                                        setMostrarFormulario(
                                            false
                                        );

                                        setFormulario(
                                            formularioInicial()
                                        );

                                    }}

                                >

                                    Cancelar

                                </button>


                                <button

                                    type="submit"

                                    className="btn-guardar"

                                >

                                    {modoFormulario === "crear"

                                        ? "Guardar hogar"

                                        : modoFormulario === "editar"

                                            ? "Guardar cambios"

                                            : "Agregar hogar"

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
                                Teléfono
                            </th>

                            <th>
                                Unidad vecinal
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

                        {hogares.map(

                            (hogar) => (

                                <tr
                                    key={
                                        hogar.id
                                    }
                                >


                                    <td>

                                        <strong>
                                            {hogar.id_hogar}
                                        </strong>

                                    </td>


                                    <td>

                                        {
                                            hogar.cuidador_principal
                                        }

                                    </td>


                                    <td>
                                        {hogar.psdf}
                                    </td>


                                    <td>
                                        {hogar.direccion}
                                    </td>


                                    <td>
                                        {hogar.telefono}
                                    </td>


                                    <td>
                                        {hogar.unidad_vecinal}
                                    </td>


                                    <td>

                                        <span

                                            className={

                                                hogar.estado === "Activo"

                                                    ? "estado activo"

                                                    : "estado inactivo"

                                            }

                                        >

                                            {hogar.estado}

                                        </span>

                                    </td>


                                    {/* ========================= */}
                                    {/* ACCIONES */}
                                    {/* ========================= */}

                                    <td className="acciones">


                                        {/* ========================= */}
                                        {/* ADMINISTRADOR */}
                                        {/* ========================= */}

                                        {usuario?.rol === "administrador" && (

                                            <>

                                                <button

                                                    className="btn-editar"

                                                    onClick={() =>
                                                        abrirEditar(
                                                            hogar
                                                        )
                                                    }

                                                >

                                                    ✏️

                                                </button>


                                                <button

                                                    className="btn-eliminar"

                                                    onClick={() =>
                                                        eliminarHogar(
                                                            hogar.id_hogar
                                                        )
                                                    }

                                                >

                                                    🗑️

                                                </button>

                                            </>

                                        )}


                                        {/* ========================= */}
                                        {/* PROFESIONAL */}
                                        {/* ========================= */}

                                        {usuario?.rol === "profesional" && (

                                            <button

                                                className="btn-eliminar"

                                                onClick={() =>
                                                    quitarHogarDeMiLista(
                                                        hogar.id_hogar
                                                    )
                                                }

                                                title="Quitar de mi lista"

                                            >

                                                🗑️

                                            </button>

                                        )}

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

export default Hogares;

