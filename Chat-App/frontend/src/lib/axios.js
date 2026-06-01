import axios from "axios";

export const axiosInstance = axios.create({
  baseURL: "https://projects-1-hhp3.onrender.com/api",
  withCredentials: true,
})