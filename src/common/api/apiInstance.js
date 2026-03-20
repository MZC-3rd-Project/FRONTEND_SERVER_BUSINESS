import axios from "axios"

const apiInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? "http://localhost:8080/api",
  timeout: 5000,
  headers: {
    "X-User-Id": 504, // TODO: 로그인 구현 후 실제 유저 ID로 교체
  },
})

export default apiInstance
