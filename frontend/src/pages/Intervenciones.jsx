
import { useEffect, useState } from "react";
import api from "../services/api";
import "./Intervenciones.css";

function Intervenciones() {

    const [intervenciones, setIntervenciones] = useState([]);

    // Hogares disponibles para el formulario
    const [hogares, setHogares] = useState([]);

    // Profesionales disponibles para el administrador
    const [profesionales, setProfesionales] = useState([]);

    // Usuario actualmente autenticado
    const [usuario, setUsuario] = useState(null);

    // Hogares asignados al profesional mediante ListaEspera
    const [hogaresAsignados, setHogaresAsignados] = useState([]);

    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState(null);

    const [mostrarFormulario, setMostrarFormulario] = useState(false);

    const [intervencionEditar, setIntervencionEditar] = useState(null);

    const [guardando, setGuardando] = useState(false);

    const [filtroIdHogar, setFiltroIdHogar] = useState("");
    const [filtroEstado, setFiltroEstado] = useState("");
    const [filtroObservaciones, setFiltroObservaciones] = useState("");
    const [paginaActual, setPaginaActual] = useState(1);
    const elementosPorPagina = 10;


    // =========================================================
    // FORMULARIO
    // =========================================================

    const formularioInicial = {
        hogar_id: "",
        profesional_id: "",
        tipo: "",
        numero_intervencion: "",
        fecha_programada: "",
        fecha_realizada: "",
        estado: "pendiente",
        observaciones: ""
    };

    const [formulario, setFormulario] = useState(
        formularioInicial
    );


    // =========================================================
    // OBTENER USUARIO ACTUAL
    // =========================================================

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


    // =========================================================
    // OBTENER INTERVENCIONES
    // =========================================================

    const obtenerIntervenciones = async () => {

        try {

            const response = await api.get(
                "/intervenciones"
            );

            setIntervenciones(
                response.data
            );

            setError(null);

        } catch (error) {

            console.error(
                "Error al cargar intervenciones:",
                error
            );

            console.error(
                "Respuesta API:",
                error.response?.data
            );

            setError(
                error.response?.data?.detail ||
                "No se pudieron cargar las intervenciones"
            );
        }
    };


    // =========================================================
    // OBTENER TODOS LOS HOGARES
    // =========================================================
    //
    // SOLO ADMINISTRADOR
    //
    // El profesional NO necesita este endpoint.
    // El profesional trabajará con ListaEspera.
    // =========================================================

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
                "Error al cargar hogares:",
                error
            );

            console.error(
                "Respuesta API:",
                error.response?.data
            );
        }
    };


    // =========================================================
    // OBTENER PROFESIONALES
    // =========================================================
    //
    // SOLO ADMINISTRADOR
    // =========================================================

    const obtenerProfesionales = async () => {

        try {

            const response = await api.get(
                "/profesionales"
            );

            setProfesionales(
                response.data
            );

        } catch (error) {

            console.error(
                "Error al cargar profesionales:",
                error
            );

            console.error(
                "Respuesta API:",
                error.response?.data
            );
        }
    };


    // =========================================================
    // OBTENER HOGARES ASIGNADOS
    // =========================================================
    //
    // PROFESIONAL
    //
    // La fuente de verdad será ListaEspera.
    //
    // El backend ya filtra:
    //
    // profesional_id == usuario.profesional_id
    //
    // Por lo tanto aquí solamente recibimos los casos
    // asignados al profesional autenticado.
    // =========================================================

    const obtenerHogaresAsignados = async () => {

        try {

            const response = await api.get(
                "/lista-espera"
            );

            setHogaresAsignados(
                response.data
            );

        } catch (error) {

            console.error(
                "Error al cargar lista de espera:",
                error
            );

            console.error(
                "Respuesta API:",
                error.response?.data
            );

            alert(
                error.response?.data?.detail ||
                "No se pudieron cargar los hogares asignados"
            );
        }
    };


    // =========================================================
    // CARGA INICIAL
    // =========================================================

    useEffect(() => {

        const cargarDatos = async () => {

            try {

                setCargando(true);

                // Primero obtenemos el usuario
                const usuarioActual =
                    await obtenerUsuario();


                // Obtenemos las intervenciones
                await obtenerIntervenciones();


                // =================================================
                // ADMINISTRADOR
                // =================================================

                if (
                    usuarioActual.rol === "administrador"
                ) {

                    await Promise.all([
                        obtenerHogares(),
                        obtenerProfesionales()
                    ]);

                }


                // =================================================
                // PROFESIONAL
                // =================================================

                if (
                    usuarioActual.rol === "profesional"
                ) {

                    await obtenerHogaresAsignados();

                }

            } catch (error) {

                console.error(
                    "Error al cargar datos:",
                    error
                );

                setError(
                    "No se pudieron cargar los datos"
                );

            } finally {

                setCargando(false);

            }

        };

        cargarDatos();

    }, []);


    // =========================================================
    // CAMBIAR CAMPOS
    // =========================================================

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


    // =========================================================
    // NUEVA INTERVENCIÓN
    // =========================================================

    const nuevaIntervencion = () => {

        setIntervencionEditar(null);

        setFormulario(
            formularioInicial
        );

        setMostrarFormulario(true);

    };


    // =========================================================
    // EDITAR INTERVENCIÓN
    // =========================================================

    const editarIntervencion = (intervencion) => {

        setIntervencionEditar(
            intervencion
        );


        /*
         * El backend devuelve:
         *
         * intervencion.hogar.id_hogar
         *
         * pero también necesitamos recordar que el
         * formulario utiliza hogar_id.
         */

        setFormulario({

            hogar_id:
                intervencion.hogar?.id_hogar ||
                intervencion.hogar_id ||
                "",

            profesional_id:
                intervencion.profesional?.id ||
                intervencion.profesional_id ||
                "",

            tipo:
                intervencion.tipo ||
                "",

            numero_intervencion:
                intervencion.numero_intervencion ||
                "",

            fecha_programada:
                intervencion.fecha_programada ||
                "",

            fecha_realizada:
                intervencion.fecha_realizada ||
                "",

            estado:
                intervencion.estado ||
                "pendiente",

            observaciones:
                intervencion.observaciones ||
                ""

        });


        setMostrarFormulario(true);

    };


    // =========================================================
    // CERRAR FORMULARIO
    // =========================================================

    const cerrarFormulario = () => {

        setMostrarFormulario(false);

        setIntervencionEditar(null);

        setFormulario(
            formularioInicial
        );

    };


    // =========================================================
    // GUARDAR INTERVENCIÓN
    // =========================================================

    const guardarIntervencion = async (e) => {

        e.preventDefault();

        setGuardando(true);


        try {

            /*
             * =====================================================
             * DATOS BASE
             * =====================================================
             */

            const datos = {

                hogar_id:
                    Number(
                        formulario.hogar_id
                    ),

                tipo:
                    formulario.tipo,

                numero_intervencion:
                    formulario.numero_intervencion
                        ? Number(
                            formulario.numero_intervencion
                        )
                        : null,

                fecha_programada:
                    formulario.fecha_programada ||
                    null,

                fecha_realizada:
                    formulario.fecha_realizada ||
                    null,

                estado:
                    formulario.estado,

                observaciones:
                    formulario.observaciones ||
                    null

            };


            /*
             * =====================================================
             * ADMINISTRADOR
             * =====================================================
             *
             * El administrador sí puede seleccionar
             * el profesional.
             */

            if (
                usuario?.rol === "administrador"
            ) {

                datos.profesional_id =
                    Number(
                        formulario.profesional_id
                    );

            }


            console.log(
                "DATOS QUE SE ENVIAN:",
                datos
            );


            // =====================================================
            // CREAR
            // =====================================================

            if (!intervencionEditar) {

                const response =
                    await api.post(
                        "/intervenciones",
                        datos
                    );


                console.log(
                    "RESPUESTA POST:",
                    response.data
                );


                alert(
                    "Intervención registrada correctamente"
                );

            }


            // =====================================================
            // ACTUALIZAR
            // =====================================================

            else {

                const response =
                    await api.put(

                        `/intervenciones/${intervencionEditar.id}`,

                        datos

                    );


                console.log(
                    "RESPUESTA PUT:",
                    response.data
                );


                alert(
                    "Intervención actualizada correctamente"
                );

            }


            // =====================================================
            // ACTUALIZAR TABLA
            // =====================================================

            await obtenerIntervenciones();


            // =====================================================
            // CERRAR MODAL
            // =====================================================

            cerrarFormulario();


        } catch (error) {

            console.error(
                "ERROR AL GUARDAR INTERVENCIÓN:",
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


            alert(

                error.response?.data?.detail ||

                "No se pudo guardar la intervención"

            );

        } finally {

            setGuardando(false);

        }

    };


    // =========================================================
    // ELIMINAR
    // =========================================================

    const eliminarIntervencion = async (id) => {

        const confirmar =
            window.confirm(
                "¿Estás seguro de que deseas eliminar esta intervención?"
            );


        if (!confirmar) {

            return;

        }


        try {

            await api.delete(
                `/intervenciones/${id}`
            );


            await obtenerIntervenciones();


            alert(
                "Intervención eliminada correctamente"
            );


        } catch (error) {

            console.error(
                "ERROR AL ELIMINAR:",
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


            alert(

                error.response?.data?.detail ||

                "No se pudo eliminar la intervención"

            );

        }

    };

    // =========================================================
// FILTRADO
// =========================================================

const intervencionesFiltradas = intervenciones.filter((intervencion) => {

    const coincideIdHogar = String(
        intervencion.hogar?.id_hogar ?? ""
    )
        .toLowerCase()
        .includes(filtroIdHogar.toLowerCase());

    const coincideEstado = filtroEstado
        ? intervencion.estado === filtroEstado
        : true;

    const coincideObservaciones = String(
        intervencion.observaciones ?? ""
    )
        .toLowerCase()
        .includes(filtroObservaciones.toLowerCase());

    return (
        coincideIdHogar &&
        coincideEstado &&
        coincideObservaciones
    );

});

// =========================================================
// PAGINACIÓN
// =========================================================

const totalPaginas = Math.max(
    1,
    Math.ceil(intervencionesFiltradas.length / elementosPorPagina)
);

const indiceInicio = (paginaActual - 1) * elementosPorPagina;
const indiceFin = indiceInicio + elementosPorPagina;

const intervencionesPagina = intervencionesFiltradas.slice(
    indiceInicio,
    indiceFin
);

const manejarFiltroIdHogar = (e) => {
    setFiltroIdHogar(e.target.value);
    setPaginaActual(1);
};

const manejarFiltroEstado = (e) => {
    setFiltroEstado(e.target.value);
    setPaginaActual(1);
};

const manejarFiltroObservaciones = (e) => {
    setFiltroObservaciones(e.target.value);
    setPaginaActual(1);
};

const irAPagina = (numero) => {
    if (numero < 1 || numero > totalPaginas) return;
    setPaginaActual(numero);
};


    // =========================================================
    // CARGANDO
    // =========================================================

    if (cargando) {

        return (

            <h2>
                Cargando intervenciones...
            </h2>

        );

    }


    // =========================================================
    // ERROR
    // =========================================================

    if (error) {

        return (

            <h2>
                {error}
            </h2>

        );

    }


    // =========================================================
    // RENDER
    // =========================================================

    return (

        <div className="intervenciones">


            {/* ================================================= */}
            {/* HEADER */}
            {/* ================================================= */}

            <div className="intervenciones-header">

    <div>
        <h1>Intervenciones</h1>
        <p>Intervenciones registradas en el sistema</p>
    </div>

    {/* ================================================= */}
    {/* FILTROS */}
    {/* ================================================= */}

    <div className="intervenciones-filtros">

        <input
            type="text"
            placeholder="Buscar por ID Hogar..."
            value={filtroIdHogar}
            onChange={manejarFiltroIdHogar}
        />

        <select
            value={filtroEstado}
            onChange={manejarFiltroEstado}
        >
            <option value="">Todos los estados</option>
            <option value="pendiente">Pendiente</option>
            <option value="realizada">Realizada</option>
            <option value="cancelada">Cancelada</option>
        </select>

        <input
            type="text"
            placeholder="Buscar en observaciones..."
            value={filtroObservaciones}
            onChange={manejarFiltroObservaciones}
        />

    </div>

    <button
        className="btn-nueva-intervencion"
        onClick={nuevaIntervencion}
    >
        + Nueva intervención
    </button>

</div>


            {/* ================================================= */}
            {/* MODAL */}
            {/* ================================================= */}

            {mostrarFormulario && (

                <div className="modal-overlay">

                    <div className="modal-intervencion">


                        {/* ===================================== */}
                        {/* HEADER MODAL */}
                        {/* ===================================== */}

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
                                onClick={
                                    cerrarFormulario
                                }
                            >

                                ×

                            </button>

                        </div>


                        {/* ===================================== */}
                        {/* FORMULARIO */}
                        {/* ===================================== */}

                        <form
                            onSubmit={
                                guardarIntervencion
                            }
                        >


                            {/* ================================= */}
                            {/* HOGAR */}
                            {/* ================================= */}

                            <label>

                                Hogar


                                {usuario?.rol === "profesional" ? (

                                    /*
                                     * =================================
                                     * PROFESIONAL
                                     * =================================
                                     *
                                     * Solamente hogares que aparecen
                                     * en su ListaEspera.
                                     */

                                    <select

                                        name="hogar_id"

                                        value={
                                            formulario.hogar_id
                                        }

                                        onChange={
                                            manejarCambio
                                        }

                                        required

                                    >

                                        <option value="">

                                            Seleccionar hogar asignado

                                        </option>


                                        {hogaresAsignados.map(

                                            (entrada) => (

                                                <option

                                                    key={
                                                        entrada.id
                                                    }

                                                    value={
                                                        entrada.id_hogar
                                                    }

                                                >

                                                    {entrada.id_hogar}

                                                    {" - "}

                                                    {
                                                        entrada.cuidador_principal
                                                    }

                                                </option>

                                            )

                                        )}

                                    </select>

                                ) : (

                                    /*
                                     * =================================
                                     * ADMINISTRADOR
                                     * =================================
                                     *
                                     * Puede seleccionar cualquier hogar.
                                     */

                                    <select

                                        name="hogar_id"

                                        value={
                                            formulario.hogar_id
                                        }

                                        onChange={
                                            manejarCambio
                                        }

                                        required

                                    >

                                        <option value="">

                                            Seleccionar hogar

                                        </option>


                                        {hogares.map(

                                            (hogar) => (

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

                                )}

                            </label>


                            {/* ================================= */}
                            {/* PROFESIONAL */}
                            {/* ================================= */}

                            {usuario?.rol === "administrador" && (

                                <label>

                                    Profesional


                                    <select

                                        name="profesional_id"

                                        value={
                                            formulario.profesional_id
                                        }

                                        onChange={
                                            manejarCambio
                                        }

                                        required

                                    >

                                        <option value="">

                                            Seleccionar profesional

                                        </option>


                                        {profesionales.map(

                                            (profesional) => (

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

                                                </option>

                                            )

                                        )}

                                    </select>

                                </label>

                            )}


                            {/* ================================= */}
                            {/* PROFESIONAL INFORMACIÓN */}
                            {/* ================================= */}

                            {usuario?.rol === "profesional" && (

                                <div className="campo-profesional-info">

                                    <label>

                                        Profesional

                                        <input

                                            type="text"

                                            value={
                                                "Usuario actual"
                                            }

                                            disabled

                                        />

                                    </label>

                                </div>

                            )}


                            {/* ================================= */}
                            {/* TIPO */}
                            {/* ================================= */}

                            <label>

                                Tipo de intervención

                                <input

                                    type="text"

                                    name="tipo"

                                    value={
                                        formulario.tipo
                                    }

                                    onChange={
                                        manejarCambio
                                    }

                                    placeholder="Ej: Visita domiciliaria"

                                    required

                                />

                            </label>


                            {/* ================================= */}
                            {/* NÚMERO */}
                            {/* ================================= */}

                            <label>

                                Número de intervención

                                <input

                                    type="number"

                                    name="numero_intervencion"

                                    value={
                                        formulario.numero_intervencion
                                    }

                                    onChange={
                                        manejarCambio
                                    }

                                    min="1"

                                    placeholder="Ej: 1"

                                />

                            </label>


                            {/* ================================= */}
                            {/* FECHA PROGRAMADA */}
                            {/* ================================= */}

                            <label>

                                Fecha programada

                                <input

                                    type="date"

                                    name="fecha_programada"

                                    value={
                                        formulario.fecha_programada
                                    }

                                    onChange={
                                        manejarCambio
                                    }

                                    required

                                />

                            </label>


                            {/* ================================= */}
                            {/* FECHA REALIZADA */}
                            {/* ================================= */}

                            <label>

                                Fecha realizada

                                <input

                                    type="date"

                                    name="fecha_realizada"

                                    value={
                                        formulario.fecha_realizada
                                    }

                                    onChange={
                                        manejarCambio
                                    }

                                />

                            </label>


                            {/* ================================= */}
                            {/* ESTADO */}
                            {/* ================================= */}

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


                            {/* ================================= */}
                            {/* OBSERVACIONES */}
                            {/* ================================= */}

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

                                    placeholder="Observaciones de la intervención..."

                                />

                            </label>


                            {/* ================================= */}
                            {/* ACCIONES */}
                            {/* ================================= */}

                            <div className="form-actions">

                                <button

                                    type="button"

                                    onClick={
                                        cerrarFormulario
                                    }

                                >

                                    Cancelar

                                </button>


                                <button

                                    type="submit"

                                    disabled={
                                        guardando
                                    }

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


            {/* ================================================= */}
            {/* TABLA */}
            {/* ================================================= */}

            <div className="ssee-table-container">

                <table className="ssee-table">


                    <thead>

                        <tr>

                            <th>
                                ID Hogar
                            </th>

                            <th>
                                Profesional
                            </th>

                            <th>
                                Tipo
                            </th>

                            <th>
                                Fecha programada
                            </th>

                            <th>
                                Fecha realizada
                            </th>

                            <th>
                                Estado
                            </th>

                            <th>
                                Observaciones
                            </th>

                            <th>
                                Acciones
                            </th>

                        </tr>

                    </thead>


                    <tbody>

                        {intervencionesPagina.map(

                              (intervencion) => (

                               <tr key={intervencion.id}>

                                    <td>

                                        {
                                            intervencion
                                                .hogar
                                                ?.id_hogar
                                        }

                                    </td>


                                    <td>

                                        {
                                            intervencion
                                                .profesional
                                                ?.nombre
                                        }

                                    </td>


                                    <td>

                                        {
                                            intervencion.tipo
                                        }

                                    </td>


                                    <td>

                                        {
                                            intervencion.fecha_programada
                                        }

                                    </td>


                                    <td>

                                        {
                                            intervencion
                                                .fecha_realizada
                                                ?? "Pendiente"
                                        }

                                    </td>


                                    <td>

                                        {
                                            intervencion.estado
                                        }

                                    </td>


                                    <td>

                                        {
                                            intervencion.observaciones
                                            ?? "-"
                                        }

                                    </td>


                                    <td>

                                        <div className="acciones-intervencion">


                                            <button

                                                type="button"

                                                className="btn-editar"

                                                onClick={() =>
                                                    editarIntervencion(
                                                        intervencion
                                                    )
                                                }

                                            >

                                                ✏️

                                            </button>


                                            <button

                                                type="button"

                                                className="btn-eliminar"

                                                onClick={() =>
                                                    eliminarIntervencion(
                                                        intervencion.id
                                                    )
                                                }

                                            >

                                                🗑️

                                            </button>


                                        </div>

                                    </td>

                                </tr>

                            )

                        )}

                    </tbody>

                </table>

            </div>

{/* ================================================= */}
{/* PAGINACIÓN */}
{/* ================================================= */}

{intervencionesFiltradas.length === 0 ? (
    <p className="sin-resultados">
        No se encontraron intervenciones con los filtros aplicados
    </p>
) : (
    <div className="paginacion">

        <button
            onClick={() => irAPagina(paginaActual - 1)}
            disabled={paginaActual === 1}
        >
            ‹ Anterior
        </button>

        <span className="paginacion-info">
            Página {paginaActual} de {totalPaginas}
            {" "}({intervencionesFiltradas.length} resultado{intervencionesFiltradas.length !== 1 ? "s" : ""})
        </span>

        <button
            onClick={() => irAPagina(paginaActual + 1)}
            disabled={paginaActual === totalPaginas}
        >
            Siguiente ›
        </button>

    </div>
)}



        </div>

    );

}

export default Intervenciones;