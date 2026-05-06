import axios from "axios";
console.log("API URL:", import.meta.env.VITE_API_URL);
export const axiosInstance = axios.create({
  // TODO: removed temporarily
  // baseURL: import.meta.env.VITE_API_URL || "http://localhost:5001/api",
  baseURL: "http://localhost:5001/api",
  withCredentials: true,
});
