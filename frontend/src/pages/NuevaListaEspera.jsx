import { useEffect, useState } from "react";
import api from "../services/api";
import "./NuevaListaEspera.css";

function NuevaListaEspera() {

    const [profesiones, setProfesiones] = useState([]);
    const [listaEspera, setListaEspera] = useState([]);

    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState("");

    const [mostrarModalAtencion, setMostrarModalAtencion] = useState(false);
    const [hogarSeleccionado, setHogarSeleccionado] = useState(null);

    const [profesionales, setProfesionales] = useState([]);
    const [profesionalSeleccionado, setProfesionalSeleccionado] = useState("");

    const [dia, setDia] = useState("");
    const [observaciones, setObservaciones] = useState("");

    const [cargandoProfesionales, setCargandoProfesionales] = useState(false);
    const [pasandoAtencion, setPasandoAtencion] = useState(false);

    const [mostrarModalProfesiones, setMostrarModalProfesiones] = useState(false);
    const [nuevaProfesion, setNuevaProfesion] = useState("");
    const [agregandoProfesion, setAgregandoProfesion] = useState(false);

    

    const cargarDatos = async () => {

        try {

            setCargando(true);
            setError("");

            const [respuestaProfesiones, respuestaLista] =
                await Promise.all([
                    api.get("/profesiones-lista-espera"),
                    api.get("/lista-espera-profesiones")
                ]);

            setProfesiones(respuestaProfesiones.data);
            setListaEspera(respuestaLista.data);

        } catch (error) {

            console.error(
                "Error cargando lista de espera:",
                error
            );

            setError(
                error.response?.data?.detail ||
                "No se pudo cargar la lista de espera"
            );

        } finally {

            setCargando(false);

        }
    };

    const eliminarDeListaEspera = async (hogar) => {
    const confirmar = window.confirm(
        `¿Está seguro de eliminar el hogar ${hogar.id_hogar} ` +
        `de la lista de espera de ${hogar.profesion}?`
    );

    if (!confirmar) {
        return;
    }

    try {
        await api.delete(
            `/lista-espera-profesiones/${hogar.id}`
        );

        alert(
            "El hogar fue eliminado de la lista de espera correctamente"
        );

        await cargarDatos();

    } catch (error) {
        console.error(
            "Error eliminando hogar de lista de espera:",
            error
        );

        console.error(
            "Respuesta API:",
            error.response?.data
        );

        alert(
            error.response?.data?.detail ||
            "No se pudo eliminar el hogar de la lista de espera"
        );
    }
};

const agregarProfesion = async (e) => {
    e.preventDefault();

    const nombre = nuevaProfesion.trim();

    if (!nombre) {
        alert("Debe ingresar el nombre de la profesión");
        return;
    }

    try {
        setAgregandoProfesion(true);

        await api.post(
            "/profesiones-lista-espera",
            {
                nombre: nombre
            }
        );

        alert("La profesión fue agregada correctamente");

        setNuevaProfesion("");

        await cargarDatos();

    } catch (error) {
        console.error(
            "Error agregando profesión:",
            error
        );

        console.error(
            "Respuesta API:",
            error.response?.data
        );

        alert(
            error.response?.data?.detail ||
            "No se pudo agregar la profesión"
        );

    } finally {
        setAgregandoProfesion(false);
    }
};

const eliminarProfesion = async (profesion) => {
    const confirmar = window.confirm(
        `¿Está seguro de eliminar la profesión "${profesion.nombre}"?`
    );

    if (!confirmar) {
        return;
    }

    try {
        await api.delete(
            `/profesiones-lista-espera/${profesion.id}`
        );

        alert("La profesión fue eliminada correctamente");

        await cargarDatos();

    } catch (error) {
        console.error(
            "Error eliminando profesión:",
            error
        );

        console.error(
            "Respuesta API:",
            error.response?.data
        );

        alert(
            error.response?.data?.detail ||
            "No se pudo eliminar la profesión"
        );
    }
};

    const abrirModalAtencion = async (hogar) => {
    try {
        setHogarSeleccionado(hogar);
        setProfesionalSeleccionado("");
        setDia("");
        setObservaciones("");
        setProfesionales([]);

        setMostrarModalAtencion(true);
        setCargandoProfesionales(true);

        const response = await api.get(
            `/profesiones-lista-espera/${hogar.profesion_id}/profesionales`
        );

        setProfesionales(response.data);
    } catch (error) {
        console.error(
            "Error cargando profesionales:",
            error
        );

        alert(
            error.response?.data?.detail ||
            "No se pudieron cargar los profesionales"
        );

        setMostrarModalAtencion(false);
    } finally {
        setCargandoProfesionales(false);
    }
};

const cerrarModalAtencion = () => {
    setMostrarModalAtencion(false);
    setHogarSeleccionado(null);
    setProfesionales([]);
    setProfesionalSeleccionado("");
    setDia("");
    setObservaciones("");
};

const cerrarModalProfesiones = () => {
    setMostrarModalProfesiones(false);
    setNuevaProfesion("");
};

const pasarAAtencion = async (e) => {
    e.preventDefault();

    if (!hogarSeleccionado) {
        return;
    }

    if (!profesionalSeleccionado) {
        alert("Debe seleccionar un profesional");
        return;
    }

    try {
        setPasandoAtencion(true);

        await api.post(
            `/lista-espera-profesiones/${hogarSeleccionado.id}/pasar-a-atencion`,
            {
                profesional_id: Number(profesionalSeleccionado),
                dia: dia || null,
                observaciones: observaciones || null
            }
        );

        alert(
            "El hogar fue pasado a Atenciones Actuales correctamente"
        );

        cerrarModalAtencion();

        await cargarDatos();

    } catch (error) {
        console.error(
            "Error pasando hogar a atención:",
            error
        );

        console.error(
            "Respuesta API:",
            error.response?.data
        );

        alert(
            error.response?.data?.detail ||
            "No se pudo pasar el hogar a atención"
        );
    } finally {
        setPasandoAtencion(false);
    }
};

    useEffect(() => {
        cargarDatos();
    }, []);

    /*
     * Agrupamos las entradas por profesión.
     *
     * Ejemplo:
     *
     * {
     *   "Kinesiología": [hogar1, hogar2],
     *   "Enfermería": [hogar3]
     * }
     */
    const listaPorProfesion = profesiones.map((profesion) => {

        const hogares = listaEspera.filter(
            (entrada) =>
                entrada.profesion_id === profesion.id
        );

        return {
            ...profesion,
            hogares
        };
    });

    if (cargando) {
        return (
            <div className="lista-espera-container">
                <div className="lista-espera-cargando">
                    Cargando lista de espera...
                </div>
            </div>
        );
    }

    return (
        <div className="lista-espera-container">

           <div className="lista-espera-header">

    <div>
        <h1>Lista de espera</h1>

        <p>
            Hogares pendientes de atención,
            organizados por profesión.
        </p>
    </div>

    <div className="lista-espera-header-acciones">

        <button
            className="btn-administrar-profesiones"
            onClick={() => setMostrarModalProfesiones(true)}
        >
            ⚙ Administrar profesiones
        </button>

        <button
            className="btn-actualizar-lista"
            onClick={cargarDatos}
        >
            ↻ Actualizar
        </button>

    </div>

</div>
            {error && (
                <div className="lista-espera-error">
                    {error}
                </div>
            )}

            <div className="lista-espera-resumen">

                <div className="resumen-card">
                    <span className="resumen-numero">
                        {listaEspera.length}
                    </span>

                    <span className="resumen-label">
                        Hogares en espera
                    </span>
                </div>

                <div className="resumen-card">
                    <span className="resumen-numero">
                        {profesiones.length}
                    </span>

                    <span className="resumen-label">
                        Profesiones
                    </span>
                </div>

            </div>

            <div className="profesiones-lista">

                {listaPorProfesion.map((profesion) => (

                    <section
                        key={profesion.id}
                        className="profesion-seccion"
                    >

                        <div className="profesion-header">

                            <div>
                                <h2>
                                    {profesion.nombre}
                                </h2>

                                <span className="profesion-contador">
                                    {profesion.hogares.length}{" "}
                                    {profesion.hogares.length === 1
                                        ? "hogar"
                                        : "hogares"}
                                </span>
                            </div>

                        </div>

                        {profesion.hogares.length === 0 ? (

                            <div className="profesion-vacia">
                                No hay hogares esperando atención
                                para esta profesión.
                            </div>

                        ) : (

                            <div className="tabla-contenedor">

                                <table className="tabla-lista-espera">

                                    <thead>
                                        <tr>
                                            <th>ID Hogar</th>
                                            <th>Cuidador principal</th>
                                            <th>PSDF</th>
                                            <th>Dirección</th>
                                            <th>Unidad vecinal</th>
                                            <th>Teléfono</th>
                                            <th>Fecha ingreso</th>
                                            <th>Acciones</th>
                                        </tr>
                                    </thead>

                                    <tbody>

                                        {profesion.hogares.map(
                                            (hogar) => (

                                                <tr key={hogar.id}>

                                                    <td>
                                                        {hogar.id_hogar}
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
                                                        {
                                                            hogar.unidad_vecinal ||
                                                            "—"
                                                        }
                                                    </td>

                                                    <td>
                                                        {
                                                            hogar.telefono ||
                                                            "—"
                                                        }
                                                    </td>

                                                    <td>
                                                        {
                                                            hogar.fecha_ingreso
                                                        }
                                                    </td>

                                                    <td>
                                                        <button
                                                            className="btn-accion"
                                                            onClick={() => abrirModalAtencion(hogar)}
                                                        >
                                                            Pasar a atención
                                                        </button>

                                                        <button
                                                            className="btn-eliminar-lista"
                                                            onClick={() => eliminarDeListaEspera(hogar)}
                                                            title="Eliminar de lista de espera"
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

                        )}

                    </section>

                ))}

            </div>

            {mostrarModalAtencion && hogarSeleccionado && (
    <div className="modal-overlay">
        <div className="modal-atencion">

            <div className="modal-header">
                <div>
                    <h2>Pasar a atención</h2>
                    <p>
                        Asigne un profesional a este hogar
                    </p>
                </div>

                <button
                    type="button"
                    className="modal-close"
                    onClick={cerrarModalAtencion}
                >
                    ✕
                </button>
            </div>

            <div className="atencion-hogar-info">

                <div>
                    <strong>ID Hogar</strong>
                    <span>
                        {hogarSeleccionado.id_hogar}
                    </span>
                </div>

                <div>
                    <strong>Cuidador principal</strong>
                    <span>
                        {hogarSeleccionado.cuidador_principal}
                    </span>
                </div>

                <div>
                    <strong>Profesión</strong>
                    <span>
                        {hogarSeleccionado.profesion}
                    </span>
                </div>

            </div>

            <form onSubmit={pasarAAtencion}>

                <div className="form-group">
                    <label>
                        Profesional
                    </label>

                    {cargandoProfesionales ? (
                        <p>
                            Cargando profesionales...
                        </p>
                    ) : profesionales.length === 0 ? (
                        <p className="sin-profesionales">
                            No existen profesionales activos
                            para esta profesión.
                        </p>
                    ) : (
                        <select
                            value={profesionalSeleccionado}
                            onChange={(e) =>
                                setProfesionalSeleccionado(
                                    e.target.value
                                )
                            }
                            required
                        >
                            <option value="">
                                Seleccione un profesional
                            </option>

                            {profesionales.map(
                                (profesional) => (
                                    <option
                                        key={profesional.id}
                                        value={profesional.id}
                                    >
                                        {profesional.nombre}
                                    </option>
                                )
                            )}
                        </select>
                    )}
                </div>

                <div className="form-group">

                    <label>
                        Día
                    </label>

                    <select
                        value={dia}
                        onChange={(e) =>
                            setDia(e.target.value)
                        }
                    >
                        <option value="">
                            Seleccione un día
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

                <div className="form-group">

                    <label>
                        Observaciones
                    </label>

                    <textarea
                        value={observaciones}
                        onChange={(e) =>
                            setObservaciones(
                                e.target.value
                            )
                        }
                        placeholder="Observaciones adicionales..."
                        rows="4"
                    />

                </div>

                <div className="form-actions">

                    <button
                        type="button"
                        className="btn-cancelar"
                        onClick={cerrarModalAtencion}
                    >
                        Cancelar
                    </button>

                    <button
                        type="submit"
                        className="btn-guardar"
                        disabled={
                            cargandoProfesionales ||
                            pasandoAtencion ||
                            profesionales.length === 0 ||
                            !profesionalSeleccionado
                        }
                    >
                        {pasandoAtencion
                            ? "Pasando a atención..."
                            : "Pasar a atención"}
                    </button>

                </div>

            </form>

        </div>
    </div>
)}

{mostrarModalProfesiones && (
    <div className="modal-overlay">

        <div className="modal-profesiones">

            <div className="modal-header">

                <div>
                    <h2>Administrar profesiones</h2>

                    <p>
                        Agregue las profesiones disponibles
                        para la lista de espera.
                    </p>
                </div>

                <button
                    type="button"
                    className="modal-close"
                    onClick={cerrarModalProfesiones}
                >
                    ✕
                </button>

            </div>


            <form onSubmit={agregarProfesion}>

                <div className="form-group">

                    <label>
                        Nueva profesión
                    </label>

                    <input
                        type="text"
                        value={nuevaProfesion}
                        onChange={(e) =>
                            setNuevaProfesion(e.target.value)
                        }
                        placeholder="Ej: Fonoaudiología"
                        maxLength={100}
                    />

                </div>


                <div className="form-actions">

                    <button
                        type="button"
                        className="btn-cancelar"
                        onClick={cerrarModalProfesiones}
                    >
                        Cancelar
                    </button>

                    <button
                        type="submit"
                        className="btn-guardar"
                        disabled={
                            agregandoProfesion ||
                            !nuevaProfesion.trim()
                        }
                    >
                        {agregandoProfesion
                            ? "Agregando..."
                            : "Agregar profesión"}
                    </button>

                </div>

            </form>


            <div className="profesiones-existentes">

                <h3>
                    Profesiones existentes
                </h3>

                <div className="lista-profesiones-modal">

                    {profesiones.map((profesion) => (

                        <div
                            key={profesion.id}
                            className="profesion-modal-item"
                        >
                            <span>
                                {profesion.nombre}
                            </span>

                            <button
                                type="button"
                                className="btn-eliminar-profesion"
                                onClick={() => eliminarProfesion(profesion)}
                                title={`Eliminar ${profesion.nombre}`}
                            >
                                🗑️
                            </button>
                        </div>

                    ))}

                </div>

            </div>

        </div>

    </div>
)}

        </div>
    );
}

export default NuevaListaEspera;