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

export const getAllUsers = () => API.get("/users");
export const createUser = (data) => API.post("/users", data);
export const updateUserRole = (userId, role) => API.put(`/users/${userId}/role`, { role });
export const deleteUser = (userId) => API.delete(`/users/${userId}`);
