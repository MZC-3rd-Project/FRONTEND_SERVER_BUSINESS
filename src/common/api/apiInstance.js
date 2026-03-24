import axios from "axios"

const apiInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? "http://localhost:8080/api",
  timeout: 5000,
  withCredentials: true,
})

export default apiInstance
