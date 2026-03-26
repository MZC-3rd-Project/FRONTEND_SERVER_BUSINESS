import apiInstance from "@/common/api/apiInstance.js"
import { normalizeApiError, unwrapApiResponseBody } from "@/common/api/responseUtils.js"

// GET /api/v1/order-query/my-orders?status=...
export async function fetchStoreOrders(status) {
  try {
    const params = status ? { status } : {}
    const response = await apiInstance.get("/v1/order-query/my-orders", { params })
    return unwrapApiResponseBody(response, "주문 목록을 불러오지 못했습니다.")
  } catch (error) {
    throw normalizeApiError(error, "주문 목록 조회에 실패했습니다.")
  }
}

// GET /api/v1/order-query/:orderId
export async function fetchOrderDetail(orderId) {
  try {
    const response = await apiInstance.get(`/v1/order-query/${orderId}`)
    return unwrapApiResponseBody(response, "주문 상세를 불러오지 못했습니다.")
  } catch (error) {
    throw normalizeApiError(error, "주문 상세 조회에 실패했습니다.")
  }
}

// POST /api/v1/orders/:orderId/cancel
export async function cancelOrder(orderId) {
  try {
    const response = await apiInstance.post(`/v1/orders/${orderId}/cancel`)
    return unwrapApiResponseBody(response, "주문 취소에 실패했습니다.")
  } catch (error) {
    throw normalizeApiError(error, "주문 취소에 실패했습니다.")
  }
}

// POST /api/v1/orders/:orderId/refund
export async function requestRefund(orderId) {
  try {
    const response = await apiInstance.post(`/v1/orders/${orderId}/refund`)
    return unwrapApiResponseBody(response, "환불 요청에 실패했습니다.")
  } catch (error) {
    throw normalizeApiError(error, "환불 요청에 실패했습니다.")
  }
}
