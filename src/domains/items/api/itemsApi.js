import apiInstance from "@/common/api/apiInstance.js"
import { normalizeApiError, unwrapApiResponseBody } from "@/common/api/responseUtils.js"
import {
  demoCreateGoods,
  demoCreatePerformance,
  demoDeleteProduct,
  demoGetCategories,
  demoGetMyStore,
  demoGetSellerGoodsDetail,
  demoGetSellerPerformanceDetail,
  demoGetSellerProducts,
  demoToggleProductStatus,
  demoUpdateGoods,
  demoUpdatePerformance,
  isDemoModeEnabled,
} from "@/domains/management/mock/demoBackend.js"

export async function getSellerProducts() {
  if (isDemoModeEnabled()) {
    return demoGetSellerProducts()
  }

  try {
    const response = await apiInstance.get("/products")
    return unwrapApiResponseBody(response, "상품 목록을 불러오지 못했습니다.")
  } catch (error) {
    throw normalizeApiError(error, "상품 목록 조회에 실패했습니다.")
  }
}

export async function getCategories() {
  if (isDemoModeEnabled()) {
    return demoGetCategories()
  }

  try {
    const response = await apiInstance.get("/categories/tree")
    return unwrapApiResponseBody(response, "카테고리 목록을 불러오지 못했습니다.")
  } catch (error) {
    throw normalizeApiError(error, "카테고리 조회에 실패했습니다.")
  }
}


export async function getMyStore() {
  if (isDemoModeEnabled()) {
    return demoGetMyStore()
  }

  try {
    const response = await apiInstance.get("/store")
    const payload = unwrapApiResponseBody(response, "내 스토어 정보를 불러오지 못했습니다.")
    return Array.isArray(payload) ? payload[0] ?? null : payload ?? null
  } catch (error) {
    throw normalizeApiError(error, "내 스토어 조회에 실패했습니다.")
  }
}

export async function createGoods(payload) {
  if (isDemoModeEnabled()) {
    return demoCreateGoods(payload)
  }

  try {
    const response = await apiInstance.post("/goods", payload)
    return unwrapApiResponseBody(response, "굿즈 등록에 실패했습니다.")
  } catch (error) {
    throw normalizeApiError(error, "굿즈 등록에 실패했습니다.")
  }
}

export async function createPerformance(payload) {
  if (isDemoModeEnabled()) {
    return demoCreatePerformance(payload)
  }

  try {
    const response = await apiInstance.post("/performances", payload)
    return unwrapApiResponseBody(response, "공연 등록에 실패했습니다.")
  } catch (error) {
    throw normalizeApiError(error, "공연 등록에 실패했습니다.")
  }
}

export async function toggleProductStatus(itemId, status) {
  if (isDemoModeEnabled()) {
    return demoToggleProductStatus(itemId, status)
  }

  try {
    const response = await apiInstance.patch(`/items/${itemId}/status`, { status })
    return unwrapApiResponseBody(response, "상품 상태 변경에 실패했습니다.")
  } catch (error) {
    throw normalizeApiError(error, "상품 상태 변경에 실패했습니다.")
  }
}

export async function deleteProduct(itemId) {
  if (isDemoModeEnabled()) {
    return demoDeleteProduct(itemId)
  }

  try {
    const response = await apiInstance.delete(`/products/${itemId}`)
    return unwrapApiResponseBody(response, "상품 삭제에 실패했습니다.")
  } catch (error) {
    throw normalizeApiError(error, "상품 삭제에 실패했습니다.")
  }
}

export async function getSellerGoodsDetail(itemId) {
  if (isDemoModeEnabled()) {
    return demoGetSellerGoodsDetail(itemId)
  }

  try {
    const response = await apiInstance.get(`/seller/goods/${itemId}`)
    return unwrapApiResponseBody(response, "굿즈 상세를 불러오지 못했습니다.")
  } catch (error) {
    throw normalizeApiError(error, "굿즈 상세 조회에 실패했습니다.")
  }
}

export async function getSellerPerformanceDetail(itemId) {
  if (isDemoModeEnabled()) {
    return demoGetSellerPerformanceDetail(itemId)
  }

  try {
    const response = await apiInstance.get(`/seller/performances/${itemId}`)
    return unwrapApiResponseBody(response, "공연 상세를 불러오지 못했습니다.")
  } catch (error) {
    throw normalizeApiError(error, "공연 상세 조회에 실패했습니다.")
  }
}

export async function updateGoods(itemId, payload) {
  if (isDemoModeEnabled()) {
    return demoUpdateGoods(itemId, payload)
  }

  try {
    const response = await apiInstance.put(`/goods/${itemId}`, payload)
    return unwrapApiResponseBody(response, "굿즈 수정에 실패했습니다.")
  } catch (error) {
    throw normalizeApiError(error, "굿즈 수정에 실패했습니다.")
  }
}

export async function updatePerformance(itemId, payload) {
  if (isDemoModeEnabled()) {
    return demoUpdatePerformance(itemId, payload)
  }

  try {
    const response = await apiInstance.put(`/performances/${itemId}`, payload)
    return unwrapApiResponseBody(response, "공연 수정에 실패했습니다.")
  } catch (error) {
    throw normalizeApiError(error, "공연 수정에 실패했습니다.")
  }
}
