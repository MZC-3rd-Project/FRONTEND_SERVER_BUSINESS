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

function resolveApiBaseUrl() {
  return import.meta.env.VITE_API_URL ?? "/api"
}

function resolveGatewayBaseUrl() {
  const apiBaseUrl = resolveApiBaseUrl()
  return apiBaseUrl.replace(/\/api\/?$/, "") || ""
}

const sharedConfig = {
  timeout: 5000,
  withCredentials: true,
  transformResponse: [parseResponseText],
}

const apiInstance = axios.create({
  baseURL: resolveApiBaseUrl(),
  ...sharedConfig,
})

export const bffApiInstance = axios.create({
  baseURL: resolveGatewayBaseUrl(),
  ...sharedConfig,
})

export default apiInstance
