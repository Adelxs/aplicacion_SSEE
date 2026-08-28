import { NavLink, useNavigate } from "react-router-dom";
import { useState } from "react";

import logo from "../assets/logo.png";
import "./Sidebar.css";

import { useAuth } from "../auth/AuthContext";

function Sidebar() {

    const { usuario, logout } = useAuth();
    const navigate = useNavigate();

    const [menuAbierto, setMenuAbierto] = useState(false);


    const manejarLogout = () => {

        logout();

        navigate("/");

    };


    const cerrarMenu = () => {

        setMenuAbierto(false);

    };


    return (

        <>

            {/* =========================
                BOTÓN MENÚ MÓVIL
            ========================= */}

            
            <button
                className="mobile-menu-button"
                onClick={() => setMenuAbierto(!menuAbierto)}
                aria-label={
                    menuAbierto
                        ? "Cerrar menú"
                        : "Abrir menú"
                }
            >
                {menuAbierto ? "✕" : "☰"}
            </button>




            {/* =========================
                OVERLAY MÓVIL
            ========================= */}

            {menuAbierto && (

                <div
                    className="sidebar-overlay"
                    onClick={cerrarMenu}
                />

            )}


            {/* =========================
                SIDEBAR
            ========================= */}

            <aside
                className={`sidebar ${
                    menuAbierto ? "sidebar-open" : ""
                }`}
            >

                {/* LOGO */}

                <div className="sidebar-logo">

                    <img
                        className="logo"
                        src={logo}
                        alt="Logo SSEE"
                    />

                </div>


                {/* MENU */}

                <nav className="sidebar-menu">

                    {/* ADMINISTRADOR */}

                    {usuario?.rol === "administrador" && (
                        <>

                            <NavLink
                                to="/dashboard"
                                className="sidebar-link"
                                onClick={cerrarMenu}
                            >
                                Dashboard
                            </NavLink>


                            <NavLink
                                to="/hogares"
                                className="sidebar-link"
                                onClick={cerrarMenu}
                            >
                                Hogares
                            </NavLink>


                            <NavLink
                                to="/profesionales"
                                className="sidebar-link"
                                onClick={cerrarMenu}
                            >
                                Profesionales
                            </NavLink>


                            <NavLink
                                to="/intervenciones"
                                className="sidebar-link"
                                onClick={cerrarMenu}
                            >
                                Intervenciones
                            </NavLink>


                            <NavLink
                                to="/lista-espera"
                                className="sidebar-link"
                                onClick={cerrarMenu}
                            >
                                Lista de espera
                            </NavLink>

                        </>
                    )}


                    {/* PROFESIONAL */}

                    {usuario?.rol === "profesional" && (
                        <>

                            <NavLink
                                to="/profesional"
                                className="sidebar-link"
                                onClick={cerrarMenu}
                            >
                                Dashboard
                            </NavLink>


                            <NavLink
                                to="/hogares"
                                className="sidebar-link"
                                onClick={cerrarMenu}
                            >
                                Hogares
                            </NavLink>


                            <NavLink
                                to="/lista-espera"
                                className="sidebar-link"
                                onClick={cerrarMenu}
                            >
                                Lista de espera
                            </NavLink>


                            <NavLink
                                to="/intervenciones"
                                className="sidebar-link"
                                onClick={cerrarMenu}
                            >
                                Intervenciones
                            </NavLink>

                        </>
                    )}

                </nav>


                {/* FOOTER */}

                <div className="sidebar-footer">

                    <div className="usuario-sidebar">

                        <div className="usuario-avatar">

                            {usuario?.username
                                ?.charAt(0)
                                .toUpperCase()
                            }

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
                        Cerrar sesión
                    </button>

                </div>

            </aside>

        </>

    );

}

export default Sidebar;

