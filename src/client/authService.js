import axios from "axios";

const baseURL = import.meta.env.VITE_AUTH_URL || "http://localhost:3000";

console.log("baseURL:", baseURL)

const auth = axios.create({
  baseURL,
});

auth.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("jwtToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default auth;
