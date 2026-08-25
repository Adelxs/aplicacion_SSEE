import { useState } from "react";
import { useAuth } from "../auth/AuthContext";
import { useNavigate } from "react-router-dom";
import "./Login.css";

function Login() {

    const { login, cargando } = useAuth();
    const navigate = useNavigate();

    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");

    const [error, setError] = useState("");

    const manejarLogin = async (e) => {

        e.preventDefault();

        setError("");

        try {

            const usuario = await login(
                username,
                password
            );

            if (usuario.rol === "administrador") {

                navigate("/dashboard");

            } else if (usuario.rol === "profesional") {

                navigate("/profesional");

            }

            console.log(
                "Usuario autenticado:",
                usuario
            );

        } catch (error) {

            console.error(
                "Error de login:",
                error
            );

            if (error.response?.status === 401) {

                setError(
                    "Usuario o contraseña incorrectos"
                );

            } else if (error.response?.status === 403) {

                setError(
                    "El usuario se encuentra inactivo"
                );

            } else {

                setError(
                    "No se pudo iniciar sesión"
                );
            }
        }
    };

    return (

        <div className="login-page">

            <div className="login-card">

                <div className="login-header">

                    <h1>SSEE</h1>

                    <h2>
                        Iniciar sesión
                    </h2>

                    <p className="login-description">
                        Sistema de Seguimiento
                    </p>

                </div>


                <form onSubmit={manejarLogin}>

                    <div className="login-field">

                        <label>
                            Usuario
                        </label>

                        <input
                            type="text"
                            value={username}
                            onChange={(e) =>
                                setUsername(
                                    e.target.value
                                )
                            }
                            placeholder="Ingrese su usuario"
                            required
                        />

                    </div>


                    <div className="login-field">

                        <label>
                            Contraseña
                        </label>

                        <input
                            type="password"
                            value={password}
                            onChange={(e) =>
                                setPassword(
                                    e.target.value
                                )
                            }
                            placeholder="Ingrese su contraseña"
                            required
                        />

                    </div>


                    {error && (

                        <div className="login-error">
                            {error}
                        </div>

                    )}


                    <button
                        type="submit"
                        className="btn-login"
                        disabled={cargando}
                    >

                        {cargando
                            ? "Iniciando sesión..."
                            : "Iniciar sesión"
                        }

                    </button>

                </form>

                <p className="login-security">
                    🔒 Acceso protegido
                </p>

            </div>

        </div>
    );
}

export default Login;