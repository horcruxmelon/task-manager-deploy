import axios from "axios";

const API = axios.create({
    baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api"
});

API.interceptors.request.use((req) => {
    const token = localStorage.getItem("token");
    if (token) {
        req.headers.Authorization = token;
    }
    return req;
});

export const getActivityLogs = (params) => API.get("/activity", { params });
export const getRecentActivity = (limit) => API.get("/activity/recent", { params: { limit } });
