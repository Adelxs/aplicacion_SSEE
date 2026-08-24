import { NavLink } from "react-router-dom";
import logo from "../assets/logo.png";
import "./Sidebar.css";
import { useAuth } from "../auth/AuthContext";
import { useNavigate } from "react-router-dom";

function Sidebar() {
    const { usuario, logout } = useAuth();
     const navigate = useNavigate();

    const manejarLogout = () => {

        logout();

        navigate("/");
    };
    return (
        <aside className="sidebar">

            <div className="sidebar-logo">
                <img className="logo" src={logo} alt="Logo SSEE" />
            </div>

            <nav className="sidebar-menu">

                <NavLink to="/dashboard" className="sidebar-link">
                    
                    Inicio
                </NavLink>

                <NavLink to="/hogares" className="sidebar-link">
                   
                    Hogares
                </NavLink>

                <NavLink to="/profesionales" className="sidebar-link">
                    
                    Profesionales
                </NavLink>

                <NavLink to="/intervenciones" className="sidebar-link">
                    
                    Intervenciones
                </NavLink>

                <NavLink to="/lista-espera" className="sidebar-link">
                    
                    Lista de espera
                </NavLink>

                <NavLink to="/asistente" className="sidebar-link">
                    
                    Asistente IA
                </NavLink>

            </nav>

            <div className="sidebar-footer">

    <div className="usuario-sidebar">

        <div className="usuario-avatar">
            {usuario?.username?.charAt(0).toUpperCase()}
        </div>

        <div className="usuario-datos">

            <strong>
                {usuario?.username}
            </strong>

            <span>
                {usuario?.rol}
            </span>

        </div>

    </div>

    <button
        className="btn-logout"
        onClick={manejarLogout}
    >
        <span>🚪</span>
        Cerrar sesión
    </button>

</div>
        </aside>
    );
}

export default Sidebar;