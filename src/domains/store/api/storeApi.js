import apiInstance from "@/common/api/apiInstance.js";
import { normalizeApiError, unwrapApiResponseBody } from "@/common/api/responseUtils.js";
import { demoCreateStore, isDemoModeEnabled } from "@/domains/management/mock/demoBackend.js";



//"http://localhost:8072/api/store"
export async function createStore(data) {
  if (isDemoModeEnabled()) {
    return demoCreateStore(data)
  }
  try {
    const response = await apiInstance.post(`/store`, data)
    return response.data
  } catch (error) {
    const message =
      error?.response?.data?.error?.message ||
      error?.response?.data?.message ||
      error?.message ||
      "가게 생성에 실패했습니다."
    throw Object.assign(new Error(message), { response: error?.response })
  }
}

export async function updateStore(storeId, data) {
  try {
    const response = await apiInstance.patch(`/store/${storeId}`, data)
    return unwrapApiResponseBody(response, "가게 수정에 실패했습니다.")
  } catch (error) {
    throw normalizeApiError(error, "가게 수정에 실패했습니다.")
  }
}

export async function updateStoreStatus(storeId, status) {
  try {
    const response = await apiInstance.patch(`/store/${storeId}`, { status })
    return unwrapApiResponseBody(response, "가게 상태 변경에 실패했습니다.")
  } catch (error) {
    throw normalizeApiError(error, "가게 상태 변경에 실패했습니다.")
  }
}

export async function getStoreDetail(storeId) {
  try {
    const response = await apiInstance.get(`/store/${storeId}`)
    return unwrapApiResponseBody(response, "가게 상세 정보를 불러오지 못했습니다.")
  } catch (error) {
    throw normalizeApiError(error, "가게 상세 조회에 실패했습니다.")
  }
}

export async function deleteStore(storeId) {
  try {
    const response = await apiInstance.delete(`/store/${storeId}`)
    return unwrapApiResponseBody(response, "가게 삭제에 실패했습니다.")
  } catch (error) {
    throw normalizeApiError(error, "가게 삭제에 실패했습니다.")
  }
}
