import axios from "axios"

// Snowflake ID는 64비트 정수 → JS Number.MAX_SAFE_INTEGER 초과 시 정밀도 손실
// 응답 JSON에서 16자리 이상 정수를 문자열로 변환 후 파싱
function quoteLargeIntegers(raw) {
  return raw
    .replace(/(:\s*)(-?\d{16,})(?=\s*[,}\]])/g, '$1"$2"')
    .replace(/((?:\[|,)\s*)(-?\d{16,})(?=\s*[,}\]])/g, '$1"$2"')
}

function parseResponseText(raw) {
  if (typeof raw !== "string") return raw
  const trimmed = raw.trim()
  if (!trimmed) return raw
  try {
    return JSON.parse(quoteLargeIntegers(trimmed))
  } catch {
    return raw
  }
}

const apiInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? "http://localhost:8080/api",
  timeout: 5000,
  withCredentials: true,
  transformResponse: [parseResponseText],
})

export default apiInstance
