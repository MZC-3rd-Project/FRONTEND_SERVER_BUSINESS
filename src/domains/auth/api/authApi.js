import { normalizeApiError, unwrapApiResponseBody } from "@/common/api/responseUtils.js"
import apiInstance from "@/common/api/apiInstance.js"

export async function getMyProfile() {
  try {
    const response = await apiInstance.get("/profile")
    return unwrapApiResponseBody(response, "내 프로필을 불러오지 못했습니다.")
  } catch (error) {
    throw normalizeApiError(error, "인증 세션 확인에 실패했습니다.")
  }
}

export async function logoutFromGateway() {
  const logoutPath = import.meta.env.VITE_AUTH_LOGOUT_PATH ?? "/logout"

  const response = await fetch(logoutPath, {
    method: "POST",
    credentials: "include",
  })

  if (!response.ok && response.status !== 302) {
    const error = new Error("로그아웃 요청에 실패했습니다.")
    error.status = response.status
    throw error
  }

  return true
}
