import { BrowserRouter, Routes, Route } from "react-router-dom";

import Layout from "./components/Layout";
import { AuthProvider } from "./auth/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";

import Dashboard from "./pages/Dashboard";
import Hogares from "./pages/Hogares";
import Profesionales from "./pages/Profesionales";
import Intervenciones from "./pages/Intervenciones";
import ListaEspera from "./pages/ListaEspera";
import Asistente from "./pages/Asistente";
import Login from "./pages/Login";

import "./App.css";


function App() {

    return (

        <BrowserRouter>

            <AuthProvider>

                <Routes>

                    {/* LOGIN */}

                    <Route
                        path="/"
                        element={<Login />}
                    />


                    {/* RUTAS PROTEGIDAS */}

                    <Route element={<ProtectedRoute />}>

                        {/* LAYOUT ADMINISTRATIVO */}

                        <Route element={<Layout />}>

                            <Route
                                path="/dashboard"
                                element={<Dashboard />}
                            />

                            <Route
                                path="/hogares"
                                element={<Hogares />}
                            />

                            <Route
                                path="/profesionales"
                                element={<Profesionales />}
                            />

                            <Route
                                path="/intervenciones"
                                element={<Intervenciones />}
                            />

                            <Route
                                path="/lista-espera"
                                element={<ListaEspera />}
                            />

                            <Route
                                path="/asistente"
                                element={<Asistente />}
                            />

                        </Route>

                    </Route>

                </Routes>

            </AuthProvider>

        </BrowserRouter>
    );
}

export default App;