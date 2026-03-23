import apiInstance from "@/common/api/apiInstance.js"
import { normalizeApiError, unwrapApiResponseBody } from "@/common/api/responseUtils.js"
import {
  demoCreateHotDeal,
  demoGetHotDealById,
  demoGetHotDeals,
  isDemoModeEnabled,
} from "@/domains/management/mock/demoBackend.js"

export async function createHotDeal(payload) {
  if (isDemoModeEnabled()) {
    return demoCreateHotDeal(payload)
  }

  try {
    const response = await apiInstance.post("/v1/hot-deals", payload)
    return unwrapApiResponseBody(response, "핫딜 등록에 실패했습니다.")
  } catch (error) {
    throw normalizeApiError(error, "핫딜 등록에 실패했습니다.")
  }
}

export async function getHotDeals(params = {}) {
  if (isDemoModeEnabled()) {
    return demoGetHotDeals(params)
  }

  try {
    const response = await apiInstance.get("/v1/hot-deals", { params })
    return unwrapApiResponseBody(response, "핫딜 목록을 불러오지 못했습니다.")
  } catch (error) {
    throw normalizeApiError(error, "핫딜 목록 조회에 실패했습니다.")
  }
}

export async function getHotDealById(hotDealId) {
  if (isDemoModeEnabled()) {
    return demoGetHotDealById(hotDealId)
  }

  try {
    const response = await apiInstance.get(`/v1/hot-deals/${hotDealId}`)
    return unwrapApiResponseBody(response, "핫딜 정보를 불러오지 못했습니다.")
  } catch (error) {
    throw normalizeApiError(error, "핫딜 조회에 실패했습니다.")
  }
}
