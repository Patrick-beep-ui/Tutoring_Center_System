import axios from "axios";

const baseURL = import.meta.env.VITE_AUTH_URL || "http://localhost:3000";

const auth = axios.create({
  baseURL,
});

export default auth;
