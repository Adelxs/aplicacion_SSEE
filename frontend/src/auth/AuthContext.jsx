import {
    createContext,
    useContext,
    useEffect,
    useState
} from "react";

import api from "../services/api";


const AuthContext = createContext();


export function AuthProvider({ children }) {

    const [usuario, setUsuario] = useState(null);

    const [cargando, setCargando] = useState(true);


    // =========================================
    // RECUPERAR SESIÓN
    // =========================================

    useEffect(() => {

        const token = localStorage.getItem("access_token");

        if (!token) {

            setCargando(false);
            return;

        }


        const obtenerUsuario = async () => {

            try {

                const response = await api.get(
                    "/usuarios/me",
                    {
                        headers: {
                            Authorization: `Bearer ${token}`
                        }
                    }
                );

                setUsuario(response.data);

            } catch (error) {

                console.error(
                    "Sesión inválida:",
                    error
                );

                localStorage.removeItem(
                    "access_token"
                );

                setUsuario(null);

            } finally {

                setCargando(false);

            }

        };


        obtenerUsuario();

    }, []);


    // =========================================
    // LOGIN
    // =========================================

    

    const login = async (
        username,
        password
    ) => {


        setCargando(true);

        try {

            const formData = new URLSearchParams();

                formData.append("username", username);
                formData.append("password", password);

                const response = await api.post(
                    "/login",
                    formData,
                    {
                        headers: {
                            "Content-Type": "application/x-www-form-urlencoded"
                        }
                    }
                );


            const token =
                response.data.access_token;


            localStorage.setItem(
                "access_token",
                token
            );


            // Obtener usuario autenticado

            const usuarioResponse =
                await api.get(
                    "/usuarios/me",
                    {
                        headers: {
                            Authorization:
                                `Bearer ${token}`
                        }
                    }
                );


            setUsuario(
                usuarioResponse.data
            );


            return usuarioResponse.data;

        }  catch (error) {


            localStorage.removeItem("access_token");

            setUsuario(null);

            throw error;
        } finally {

                    setCargando(false);

                }

            };


    // =========================================
    // LOGOUT
    // =========================================

    const logout = () => {

        localStorage.removeItem(
            "access_token"
        );

        setUsuario(null);

    };


    return (

        <AuthContext.Provider
            value={{
                usuario,
                cargando,
                login,
                logout
            }}
        >

            {children}

        </AuthContext.Provider>

    );

}


export function useAuth() {

    return useContext(
        AuthContext
    );

}