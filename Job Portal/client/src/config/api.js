
import axios from "axios"

export const API = axios.create({
  baseURL: "http://localhost:8090/api/v1",
})