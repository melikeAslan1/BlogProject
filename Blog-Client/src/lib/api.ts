import axios from "axios";

// Development: http://localhost:5107 (BlogApi "http" launch profile). Override with VITE_API_URL if needed (e.g. https://localhost:7098).
const baseURL = import.meta.env.VITE_API_URL ?? "http://localhost:5107";

const api = axios.create({
    baseURL,
    withCredentials: true,
});

api.interceptors.response.use(
    (r) => r,
    (err) => {
        if(err.response?.status === 401){
            if(window.location.pathname !== "/login"){
                window.location.href = "/login";
            }
        }
        return Promise.reject(err);
    }
);

export default api;