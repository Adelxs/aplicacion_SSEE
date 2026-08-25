import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";


function ProtectedRoute({
    children,
    roles
}) {

    const {
        usuario,
        cargando
    } = useAuth();


    console.log("PROTECTED ROUTE");
    console.log("USUARIO:", usuario);
    console.log("CARGANDO:", cargando);


    if (cargando) {

        return (
            <div>
                Cargando...
            </div>
        );

    }


    if (!usuario) {

        console.log(
            "NO HAY USUARIO → LOGIN"
        );

        return (
            <Navigate
                to="/"
                replace
            />
        );

    }


    /*
     * Comprobamos si el usuario
     * tiene el rol necesario.
     */

    if (
        roles &&
        !roles.includes(usuario.rol)
    ) {

        console.log(
            "ROL NO AUTORIZADO:",
            usuario.rol
        );


        /*
         * Administrador
         */

        if (
            usuario.rol === "administrador"
        ) {

            return (
                <Navigate
                    to="/dashboard"
                    replace
                />
            );

        }


        /*
         * Profesional
         */

        if (
            usuario.rol === "profesional"
        ) {

            return (
                <Navigate
                    to="/profesional"
                    replace
                />
            );

        }


        return (
            <Navigate
                to="/"
                replace
            />
        );

    }


    console.log(
        "USUARIO AUTENTICADO → PERMITIENDO ACCESO"
    );


    /*
     * Si usamos ProtectedRoute como
     * wrapper de una página:
     *
     * <ProtectedRoute>
     *     <Dashboard />
     * </ProtectedRoute>
     */

    if (children) {

        return children;

    }


    /*
     * Si usamos ProtectedRoute como
     * Route Layout:
     *
     * <Route element={<ProtectedRoute />}>
     */

    return <Outlet />;

}


export default ProtectedRoute;