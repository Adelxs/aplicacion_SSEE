
import { useEffect, useState } from "react";
import api from "../services/api";
import "./Hogares.css";

function Hogares() {

    const [hogares, setHogares] = useState([]);

    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState(null);

    const [usuario, setUsuario] = useState(null);

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
    // FORMULARIO INICIAL
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
    // OBTENER TODOS LOS HOGARES
    // =========================
    //
    // IMPORTANTE:
    //
    // Tanto administrador como profesional
    // utilizan /hogares.
    //
    // El profesional solamente tendrá
    // permisos de lectura desde el frontend.
    //
    // Los permisos reales deben estar
    // protegidos también en el backend.
    // =========================

    const obtenerHogares = async () => {

        try {

            const response = await api.get(
                "/hogares"
            );

            setHogares(
                response.data
            );

            setError(null);

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
                error.response?.data?.detail ||
                "No se pudieron cargar los hogares"
            );

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
                await obtenerUsuario();

                // Después cargamos TODOS los hogares
                await obtenerHogares();

            } catch (error) {

                console.error(
                    "Error al cargar datos:",
                    error
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

        const {
            name,
            value
        } = e.target;

        setFormulario({

            ...formulario,

            [name]: value

        });

    };


    // =========================
    // NUEVO HOGAR
    // =========================
    //
    // SOLO ADMINISTRADOR
    // =========================

    const abrirNuevo = () => {

        // Seguridad adicional en frontend
        if (
            usuario?.rol !== "administrador"
        ) {

            return;

        }


        setModoFormulario(
            "crear"
        );

        setFormulario(
            formularioInicial()
        );

        setMostrarFormulario(
            true
        );

    };


    // =========================
    // EDITAR HOGAR
    // =========================
    //
    // SOLO ADMINISTRADOR
    // =========================

    const abrirEditar = (hogar) => {

        // Seguridad adicional en frontend
        if (
            usuario?.rol !== "administrador"
        ) {

            return;

        }


        setModoFormulario(
            "editar"
        );

        setFormulario({

            id_hogar:
                hogar.id_hogar,

            cuidador_principal:
                hogar.cuidador_principal ?? "",

            psdf:
                hogar.psdf ?? "",

            direccion:
                hogar.direccion ?? "",

            telefono:
                hogar.telefono ?? "",

            unidad_vecinal:
                hogar.unidad_vecinal ?? "",

            estado:
                hogar.estado ?? "Activo"

        });

        setMostrarFormulario(
            true
        );

    };


    // =========================
    // CERRAR FORMULARIO
    // =========================

    const cerrarFormulario = () => {

        setMostrarFormulario(
            false
        );

        setModoFormulario(
            "crear"
        );

        setFormulario(
            formularioInicial()
        );

    };


    // =========================
    // GUARDAR HOGAR
    // =========================
    //
    // SOLO ADMINISTRADOR
    // =========================

    const guardarHogar = async (e) => {

        e.preventDefault();


        if (
            usuario?.rol !== "administrador"
        ) {

            return;

        }


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


                alert(
                    "Hogar creado correctamente"
                );

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


                alert(
                    "Hogar actualizado correctamente"
                );

            }


            cerrarFormulario();

        } catch (error) {

            console.error(
                "Error al guardar hogar:",
                error
            );

            console.error(
                "Respuesta API:",
                error.response?.data
            );


            alert(

                error.response?.data?.detail ||

                "No se pudo guardar la información"

            );

        }

    };


    // =========================
    // ELIMINAR HOGAR
    // =========================
    //
    // SOLO ADMINISTRADOR
    // =========================

    const eliminarHogar = async (
        id_hogar
    ) => {

        if (
            usuario?.rol !== "administrador"
        ) {

            return;

        }


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


            alert(
                "Hogar eliminado correctamente"
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


            alert(

                error.response?.data?.detail ||

                "No se pudo eliminar el hogar"

            );

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

                            ? "Todos los hogares registrados en el sistema"

                            : "Hogares registrados en el sistema"

                        }

                    </p>

                </div>


                {/* ========================= */}
                {/* BOTÓN NUEVO */}
                {/* ========================= */}
                

                {usuario?.rol === "administrador" && (

                    <button
                        className="btn-nuevo"
                        onClick={abrirNuevo}
                    >

                        + Nuevo hogar

                    </button>

                )}

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

                                        : "Editar hogar"

                                    }

                                </h2>


                                <p>

                                    {modoFormulario === "crear"

                                        ? "Ingrese los datos del hogar"

                                        : "Modifique los datos del hogar"

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
                            onSubmit={guardarHogar}
                        >

                            <div className="form-grid">


                                {/* ========================= */}
                                {/* ID HOGAR */}
                                {/* ========================= */}

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


                                {/* ========================= */}
                                {/* CUIDADOR */}
                                {/* ========================= */}

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


                                {/* ========================= */}
                                {/* PSDF */}
                                {/* ========================= */}

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


                                {/* ========================= */}
                                {/* DIRECCIÓN */}
                                {/* ========================= */}

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


                                {/* ========================= */}
                                {/* TELÉFONO */}
                                {/* ========================= */}

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


                                {/* ========================= */}
                                {/* UNIDAD VECINAL */}
                                {/* ========================= */}

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


                                {/* ========================= */}
                                {/* ESTADO */}
                                {/* ========================= */}

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


                            {/* ========================= */}
                            {/* ACCIONES */}
                            {/* ========================= */}

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

                                        ? "Guardar hogar"

                                        : "Guardar cambios"

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


                            {/* ========================= */}
                            {/* ACCIONES */}
                            {/* ========================= */}

                            {usuario?.rol === "administrador" && (

                                <th>
                                    Acciones
                                </th>

                            )}

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
                                            hogar.telefono
                                            ?? "-"
                                        }

                                    </td>


                                    <td>

                                        {
                                            hogar.unidad_vecinal
                                            ?? "-"
                                        }

                                    </td>


                                    <td>

                                        <span

                                            className={

                                                hogar.estado === "Activo"

                                                    ? "estado activo"

                                                    : "estado inactivo"

                                            }

                                        >

                                            {
                                                hogar.estado
                                            }

                                        </span>

                                    </td>


                                    {/* ========================= */}
                                    {/* ACCIONES ADMINISTRADOR */}
                                    {/* ========================= */}

                                    {usuario?.rol === "administrador" && (

                                        <td className="acciones">


                                            <button

                                                className="btn-editar"

                                                onClick={() =>
                                                    abrirEditar(
                                                        hogar
                                                    )
                                                }

                                                title="Editar hogar"

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

                                                title="Eliminar hogar"

                                            >

                                                🗑️

                                            </button>


                                        </td>

                                    )}

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

