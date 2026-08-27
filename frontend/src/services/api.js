
import axios from "axios";


const api = axios.create({
    baseURL: "https://ssee-backend.onrender.com/"
});


// =========================================
// AGREGAR TOKEN A TODAS LAS PETICIONES
// =========================================

api.interceptors.request.use(

    (config) => {

        const token = localStorage.getItem(
            "access_token"
        );

        console.log(
            "TOKEN ENVIADO:",
            token
        );

        if (token) {

            config.headers.Authorization =
                `Bearer ${token}`;

        }

        return config;
    },

    (error) => {

        return Promise.reject(error);

    }
);


// =========================================
// MANEJAR TOKEN EXPIRADO / INVÁLIDO
// =========================================

api.interceptors.response.use(

    (response) => response,

    (error) => {

        console.log(
            "ERROR API:",
            error.response?.status,
            error.response?.data
        );

     //   if (
        //    error.response?.status === 401
       // ) {

          //  localStorage.removeItem(
             //   "access_token"
           // );

           // window.location.href = "/";

       // }

        return Promise.reject(error);
    }
);


export default api;

