import axios from "axios";

export const axiosInstance = axios.create({
  baseURL: import.meta.env.MODE === "development" ? "http://localhost:8090/api" : "https://simple-chat-app-on.vercel.app/api",
  withCredentials: true,
})