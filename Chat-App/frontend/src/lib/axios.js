import axios from "axios";

export const axiosInstance = axios.create({
  baseURL: import.meta.env.MODE === "development" ? "http://localhost:8090/api" : "https://projects-1-hhp3.onrender.com/api",
  withCredentials: true,
})