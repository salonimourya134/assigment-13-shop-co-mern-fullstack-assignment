import axios from "axios";

const API = axios.create({
    // baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000",

   baseURL: "https://shop-co-backend-service.onrender.com",
    withCredentials: true,
});

API.interceptors.request.use((config) => {
    try {
        const authData = JSON.parse(localStorage.getItem("auth"));
        if (authData?.token) {
            config.headers.Authorization = `Bearer ${authData.token}`;
        }
    } catch {
        localStorage.removeItem("auth");
    }
    return config;
});

export const getImageUrl = (image) => {
    if (!image) return "";
    if (image.startsWith("http://") || image.startsWith("https://")) return image;
    return `${API.defaults.baseURL}${image.startsWith("/") ? image : `/${image}`}`;
};

export default API;

API.interceptors.response.use((response) => response, (error) => {
    if (error.response?.status === 401) {
        localStorage.removeItem("auth");
        window.dispatchEvent(new Event("authExpired"));
    }
    return Promise.reject(error);
});
