import apiInstance from "@/common/api/apiInstance.js"
import { normalizeApiError, unwrapApiResponseBody } from "@/common/api/responseUtils.js"
import { demoGetItemReviews, isDemoModeEnabled } from "@/domains/management/mock/demoBackend.js"

export async function getItemReviews(itemId, params = {}) {
  if (isDemoModeEnabled()) {
    return demoGetItemReviews(itemId, params)
  }
  try {
    const response = await apiInstance.get(`/v1/reviews/items/${itemId}`, { params })
    return unwrapApiResponseBody(response, "리뷰 목록을 불러오지 못했습니다.")
  } catch (error) {
    throw normalizeApiError(error, "리뷰 목록 조회에 실패했습니다.")
  }
}
