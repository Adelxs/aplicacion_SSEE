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

    const [mostrarModalBaja, setMostrarModalBaja] = useState(false);
    const [entradaBaja, setEntradaBaja] = useState(null);
    const [tieneIntervenciones, setTieneIntervenciones] = useState(false);
    const [historialDescargado, setHistorialDescargado] = useState(false);
    const [cargandoBaja, setCargandoBaja] = useState(false);

    const [mostrarFormulario, setMostrarFormulario] = useState(false);
    const [modoFormulario, setModoFormulario] = useState("crear");

    const [filtroProfesional, setFiltroProfesional] = useState("");
    const [filtroUnidadVecinal, setFiltroUnidadVecinal] = useState("");

    const [idEditando, setIdEditando] = useState(null);

    const [mostrarModalFrecuencia, setMostrarModalFrecuencia] = useState(false);

    const [entradaFrecuencia, setEntradaFrecuencia] = useState(null);

    const [frecuenciaSeleccionada, setFrecuenciaSeleccionada] = useState("");

    const [filtroIdHogar, setFiltroIdHogar] = useState("");
    const [filtroEstado, setFiltroEstado] = useState("");
    const [paginaActual, setPaginaActual] = useState(1);
    const [busquedaHogar, setBusquedaHogar] = useState("");

    const elementosPorPagina = 10;

    // =========================================
    // Frecuencia profesional
    // =========================================
    const frecuencias = [
    "Semanal",
    "Quincenal",
    "Mensual"
    ];

    const abrirModalFrecuencia = (entrada) => {
    setEntradaFrecuencia(entrada);

    setFrecuenciaSeleccionada(
        entrada.frecuencia || ""
    );

    setMostrarModalFrecuencia(true);
};


const cerrarModalFrecuencia = () => {
    setMostrarModalFrecuencia(false);

    setEntradaFrecuencia(null);

    setFrecuenciaSeleccionada("");
};

const guardarFrecuencia = async () => {
    if (!entradaFrecuencia) {
        return;
    }

    if (!frecuenciaSeleccionada) {
        alert("Seleccione una frecuencia");
        return;
    }

    try {

        const response = await api.put(
            `/lista-espera/${entradaFrecuencia.id}/frecuencia`,
            {
                frecuencia: frecuenciaSeleccionada
            }
        );

        setListaEspera((listaActual) =>
            listaActual.map((entrada) =>
                entrada.id === entradaFrecuencia.id
                    ? {
                        ...entrada,
                        frecuencia:
                            response.data.frecuencia
                    }
                    : entrada
            )
        );

        alert(
            "Frecuencia actualizada correctamente"
        );

        cerrarModalFrecuencia();

    } catch (error) {

        console.error(
            "Error actualizando frecuencia:",
            error
        );

        alert(
            error.response?.data?.detail ||
            "No se pudo actualizar la frecuencia"
        );
    }
};

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
    // Descargar historial PDF
    // =========================================


    const descargarHistorialPDF = async (
    idHogar,
    esBaja = false
) => {

    try {

        const respuesta = await api.get(
            `/hogares/${idHogar}/intervenciones/pdf`,
            {
                responseType: "blob"
            }
        );

        const url = window.URL.createObjectURL(
            new Blob(
                [respuesta.data],
                {
                    type: "application/pdf"
                }
            )
        );

        const enlace = document.createElement("a");

        enlace.href = url;

        enlace.download =
            `Historial_Hogar_${idHogar}.pdf`;

        document.body.appendChild(enlace);

        enlace.click();

        enlace.remove();

        window.URL.revokeObjectURL(url);


        // =====================================
        // SI ES PARTE DEL PROCESO DE BAJA
        // =====================================

        if (esBaja) {

            setHistorialDescargado(true);

        }

    } catch (error) {

        console.error(
            "Error al descargar historial:",
            error
        );

        alert(
            error.response?.data?.detail ||
            "No se pudo descargar el historial"
        );

    }
};


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


    const entrada = listaEspera.find(
        (item) => item.id === id
    );


    if (!entrada) {

        alert(
            "No se encontró la entrada"
        );

        return;

    }


    try {

        setCargandoBaja(true);


        // =====================================
        // BUSCAR INTERVENCIONES DEL HOGAR
        // =====================================

        const respuesta =
            await api.get(
                `/hogares/${entrada.id_hogar}/intervenciones`
            );


        const intervenciones =
            respuesta.data;


        // =====================================
        // SI NO TIENE INTERVENCIONES
        // =====================================

        if (
            !intervenciones ||
            intervenciones.length === 0
        ) {

            const confirmar =
                window.confirm(
                    "¿Está seguro de eliminar esta entrada de Atenciones Actuales?"
                );


            if (!confirmar) {

                return;

            }


            await api.delete(
                `/lista-espera/${id}`
            );


            setListaEspera(
                (listaActual) =>
                    listaActual.filter(
                        (item) =>
                            item.id !== id
                    )
            );


            alert(
                "Entrada eliminada correctamente"
            );


            return;

        }


        // =====================================
        // TIENE INTERVENCIONES
        // =====================================

        setEntradaBaja(entrada);

        setTieneIntervenciones(true);

        setHistorialDescargado(false);

        setMostrarModalBaja(true);

    } catch (error) {

        console.error(
            "ERROR AL PREPARAR BAJA:",
            error
        );


        alert(
            error.response?.data?.detail ||
            "No se pudo comprobar el historial del hogar"
        );

    } finally {

        setCargandoBaja(false);

    }

};
    const unidadesVecinales = [
    ...new Set(
        listaEspera
            .map((entrada) => entrada.unidad_vecinal)
            .filter(Boolean)
    )
].sort();

// =========================================
// HOGARES FILTRADOS PARA EL MODAL
// =========================================

const hogaresFiltrados = hogares.filter((hogar) => {

    const texto = busquedaHogar
        .toLowerCase()
        .trim();

    if (!texto) {
        return true;
    }

    return (
        String(hogar.id_hogar)
            .toLowerCase()
            .includes(texto) ||

        String(hogar.cuidador_principal ?? "")
            .toLowerCase()
            .includes(texto)
    );

});

    // =========================================
// FILTRADO
// =========================================

const listaEsperaFiltrada = listaEspera.filter((entrada) => {

    const coincideIdHogar = String(
        entrada.id_hogar ?? ""
    )
        .toLowerCase()
        .includes(
            filtroIdHogar.toLowerCase()
        );

    const coincideEstado = filtroEstado
        ? entrada.estado === filtroEstado
        : true;

    const coincideProfesional = filtroProfesional
        ? String(entrada.profesional_id) ===
          String(filtroProfesional)
        : true;

    const coincideUnidadVecinal = filtroUnidadVecinal
        ? entrada.unidad_vecinal ===
          filtroUnidadVecinal
        : true;

    return (
        coincideIdHogar &&
        coincideEstado &&
        coincideProfesional &&
        coincideUnidadVecinal
    );

});

// =========================================
// PAGINACIÓN
// =========================================

const totalPaginas = Math.max(
    1,
    Math.ceil(listaEsperaFiltrada.length / elementosPorPagina)
);

const indiceInicio = (paginaActual - 1) * elementosPorPagina;
const indiceFin = indiceInicio + elementosPorPagina;

const listaEsperaPagina = listaEsperaFiltrada.slice(
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

const manejarFiltroProfesional = (e) => {
    setFiltroProfesional(e.target.value);
    setPaginaActual(1);
};

const manejarFiltroUnidadVecinal = (e) => {
    setFiltroUnidadVecinal(e.target.value);
    setPaginaActual(1);
};

const irAPagina = (numero) => {
    if (numero < 1 || numero > totalPaginas) return;
    setPaginaActual(numero);
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
        <h1>Atenciones Actuales</h1>
        <p>Casos registrados en Atenciones Actuales</p>
    </div>

    {/* ================================= */}
    {/* FILTROS */}
    {/* ================================= */}

    <div className="intervenciones-filtros">

    {/* ID HOGAR */}

    <input
        type="text"
        placeholder="Buscar por ID Hogar..."
        value={filtroIdHogar}
        onChange={manejarFiltroIdHogar}
    />


    {/* PROFESIONAL */}

{usuario?.rol === "administrador" && (
    <select
        value={filtroProfesional}
        onChange={manejarFiltroProfesional}
    >

        <option value="">
            Todos los profesionales
        </option>

        {profesionales.map((profesional) => (

            <option
                key={profesional.id}
                value={profesional.id}
            >
                {profesional.nombre}
            </option>

        ))}

    </select>)}


    {/* UNIDAD VECINAL */}

    <select
        value={filtroUnidadVecinal}
        onChange={manejarFiltroUnidadVecinal}
    >

        <option value="">
            Todas las unidades vecinales
        </option>

        {unidadesVecinales.map((unidad) => (

            <option
                key={unidad}
                value={unidad}
            >
                {unidad}
            </option>

        ))}

    </select>


    {/* ESTADO */}

    <select
        value={filtroEstado}
        onChange={manejarFiltroEstado}
    >

        <option value="">
            Todos los estados
        </option>

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

    {/* BUSCADOR */}
    <input
        type="text"
        placeholder="Buscar por ID o cuidador..."
        value={busquedaHogar}
        onChange={(e) =>
            setBusquedaHogar(e.target.value)
        }
    />

    {/* RESULTADOS */}
    <select
        name="id_hogar"
        value={formulario.id_hogar}
        onChange={manejarCambioHogar}
        required
    >
        <option value="">
            Seleccione un hogar
        </option>

        {hogaresFiltrados.map(
            (hogar) => (
                <option
                    key={hogar.id_hogar}
                    value={hogar.id_hogar}
                >
                    {hogar.id_hogar}
                    {" - "}
                    {hogar.cuidador_principal}
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

                            {/*<label>

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

                            </label> */}


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

                            {/*<label>

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

                            </label>*/}


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

                            {usuario?.rol === "administrador" && (

                            <th>
                                Profesional
                            </th> )}

                           {/* <th>
                                Día
                            </th> */}

                            {usuario?.rol === "profesional" && (
                            <th>
                                Frecuencia
                            </th> )}

                            <th>
                                Estado
                            </th>

                            {/*<th>
                                Fecha solicitud
                            </th>*/}

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

                        {listaEsperaPagina.map(

        (entrada) => {

            const profesional =
                profesionales.find(
                    profesional =>
                        Number(profesional.id) ===
                        Number(entrada.profesional_id)
                );

            return (

                <tr key={entrada.id}>
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

                                       {usuario?.rol === "administrador" && (
                                        <td>

                                            {

                                                profesional

                                                    ? profesional.nombre

                                                    : "Sin asignar"

                                            }

                                        </td>)}


                                       {/* <td>

                                            {
                                                entrada.dia
                                                ?? "-"
                                            }

                                        </td>*/}

                                        {usuario?.rol === "profesional" && (
                                            <td>

                                                <button
                                                    type="button"
                                                    className="btn-frecuencia"
                                                    onClick={() =>
                                                        abrirModalFrecuencia(entrada)
                                                    }
                                                >
                                                    {entrada.frecuencia || "Definir"}
                                                </button>

                                            </td>
                                        )}


                                        <td>

                                            {
                                                entrada.estado
                                            }

                                        </td>


                                        {/* ========================= */}
                                        {/* FECHA */}
                                        {/* ========================= */}

                                       {/* <td>

                                            {
                                                entrada.fecha_solicitud
                                                    ? new Date(
                                                        `${entrada.fecha_solicitud}T00:00:00`
                                                    ).toLocaleDateString(
                                                        "es-CL"
                                                    )
                                                    : "-"
                                            }

                                        </td>*/}


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

                                                <button
                                                    class="btn-historial"
                                                    onClick={() =>
                                                        descargarHistorialPDF(entrada.id_hogar)
                                                    }
                                                >
                                                    📄 Historial
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


{/* ================================= */}
{/* PAGINACIÓN */}
{/* ================================= */}

{listaEsperaFiltrada.length === 0 ? (
    <p className="sin-resultados">
        No se encontraron entradas con los filtros aplicados
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
            {" "}({listaEsperaFiltrada.length} resultado{listaEsperaFiltrada.length !== 1 ? "s" : ""})
        </span>

        <button
            onClick={() => irAPagina(paginaActual + 1)}
            disabled={paginaActual === totalPaginas}
        >
            Siguiente ›
        </button>

    </div>
)}

{mostrarModalBaja && entradaBaja && (
    <div className="modal-overlay">

        <div className="modal-frecuencia">

            <h2>
                ⚠️ Dar de baja hogar
            </h2>


            <p>
                El hogar{" "}
                <strong>
                    {entradaBaja.id_hogar}
                </strong>{" "}
                tiene intervenciones registradas.
            </p>


            <p>
                Antes de darlo de baja debes
                descargar su historial de
                intervenciones.
            </p>


            <div
                style={{
                    marginTop: "20px",
                    marginBottom: "20px"
                }}
            >

                <button
                    class="historial-btn"
                    type="button"
                    onClick={() =>
                        descargarHistorialPDF(
                            entradaBaja.id_hogar,
                            true
                        )
                    }
                >
                    📄 Descargar historial
                </button>

            </div>


            {historialDescargado && (
                <p
                    style={{
                        color: "green",
                        fontWeight: "bold"
                    }}
                >
                    ✓ Historial descargado correctamente
                </p>
            )}


            <div className="modal-acciones">

                <button
                    type="button"
                    onClick={() => {

                        setMostrarModalBaja(false);
                        setEntradaBaja(null);
                        setTieneIntervenciones(false);
                        setHistorialDescargado(false);

                    }}
                >
                    Cancelar
                </button>


                <button
                    type="button"
                    disabled={!historialDescargado}
                    onClick={async () => {

                        if (!historialDescargado) {
                            return;
                        }


                        const confirmar =
                            window.confirm(
                                `¿Está seguro de dar de baja el hogar ${entradaBaja.id_hogar}? Se eliminarán sus intervenciones del sistema.`
                            );


                        if (!confirmar) {
                            return;
                        }


                        try {

                            await api.delete( 
                              `/lista-espera/${entradaBaja.id}/dar-de-baja` 
                            ); 


                            setListaEspera(
                                (listaActual) =>
                                    listaActual.filter(
                                        (entrada) =>
                                            entrada.id !==
                                            entradaBaja.id
                                    )
                            );


                            setMostrarModalBaja(false);

                            setEntradaBaja(null);

                            setTieneIntervenciones(false);

                            setHistorialDescargado(false);


                            alert(
                                "Hogar dado de baja correctamente"
                            );


                        } catch (error) {

                            console.error(
                                "ERROR AL DAR DE BAJA:",
                                error
                            );


                            alert(
                                error.response?.data?.detail ||
                                "No se pudo dar de baja el hogar"
                            );

                        }

                    }}
                >
                    🗑️ Dar de baja
                </button>

            </div>

        </div>

    </div>
)}

{mostrarModalFrecuencia && (
    <div className="modal-overlay">

        <div className="modal-frecuencia">

            <h2>
                Frecuencia de atención
            </h2>

            <p>
                Hogar:{" "}
                <strong>
                    {entradaFrecuencia?.id_hogar}
                </strong>
            </p>

            <div className="form-group">

                <label>
                    Frecuencia
                </label>

                <select
                    value={frecuenciaSeleccionada}
                    onChange={(e) =>
                        setFrecuenciaSeleccionada(
                            e.target.value
                        )
                    }
                >

                    <option value="">
                        Seleccionar frecuencia
                    </option>

                    {frecuencias.map(
                        (frecuencia) => (

                            <option
                                key={frecuencia}
                                value={frecuencia}
                            >
                                {frecuencia}
                            </option>

                        )
                    )}

                </select>

            </div>

            <div className="modal-acciones">

                <button
                    type="button"
                    onClick={cerrarModalFrecuencia}
                >
                    Cancelar
                </button>

                <button
                    type="button"
                    onClick={guardarFrecuencia}
                >
                    Guardar
                </button>

            </div>

        </div>

    </div>
)}

</div>

        

    );

}

export default ListaEspera;