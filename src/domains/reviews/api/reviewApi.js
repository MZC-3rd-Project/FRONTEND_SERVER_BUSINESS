import apiInstance from "@/common/api/apiInstance.js"
import { demoGetItemReviews, isDemoModeEnabled } from "@/domains/management/mock/demoBackend.js"

export async function getItemReviews(itemId, params = {}) {
  if (isDemoModeEnabled()) {
    return demoGetItemReviews(itemId, params)
  }
  const { data } = await apiInstance.get(`/v1/reviews/items/${itemId}`, { params })
  return data?.data ?? { content: [], totalElements: 0, totalPages: 0, size: 20, number: 0 }
}
