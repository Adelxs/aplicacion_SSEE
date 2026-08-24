import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";

function ProtectedRoute() {

    const { usuario, cargando } = useAuth();

    console.log("PROTECTED ROUTE");
    console.log("USUARIO:", usuario);
    console.log("CARGANDO:", cargando);

    if (cargando) {
        return <h2>Verificando sesión...</h2>;
    }

    if (!usuario) {
        console.log("NO HAY USUARIO → REDIRIGIENDO AL LOGIN");
        return <Navigate to="/" replace />;
    }

    console.log("USUARIO AUTENTICADO → PERMITIENDO ACCESO");

    return <Outlet />;
}

export default ProtectedRoute;