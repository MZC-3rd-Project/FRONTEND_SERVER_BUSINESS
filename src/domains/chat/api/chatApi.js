import apiInstance from "@/common/api/apiInstance.js"
import { normalizeApiError, unwrapApiResponseBody } from "@/common/api/responseUtils.js"
import {
  demoFetchChatMessages,
  demoFetchMyChatRooms,
  demoSendChatRoomMessage,
  demoUpdateChatReadPointer,
  isDemoModeEnabled,
} from "@/domains/management/mock/demoBackend.js"

export async function fetchMyChatRooms(params = {}) {
  if (isDemoModeEnabled()) return demoFetchMyChatRooms(params)
  try {
    const response = await apiInstance.get("/v1/chat/rooms", { params })
    return unwrapApiResponseBody(response, "채팅방 목록을 불러오지 못했습니다.")
  } catch (error) {
    throw normalizeApiError(error, "채팅방 목록 조회에 실패했습니다.")
  }
}

export async function fetchChatMessages(roomId, params = {}) {
  if (isDemoModeEnabled()) return demoFetchChatMessages(roomId, params)
  try {
    const response = await apiInstance.get(`/v1/chat/rooms/${roomId}/messages`, { params })
    return unwrapApiResponseBody(response, "메시지 목록을 불러오지 못했습니다.")
  } catch (error) {
    throw normalizeApiError(error, "메시지 목록 조회에 실패했습니다.")
  }
}

export async function sendChatRoomMessage(roomId, payload) {
  if (isDemoModeEnabled()) return demoSendChatRoomMessage(roomId, payload)
  try {
    const response = await apiInstance.post(`/v1/chat/rooms/${roomId}/messages`, payload)
    return unwrapApiResponseBody(response, "메시지를 전송하지 못했습니다.")
  } catch (error) {
    throw normalizeApiError(error, "메시지 전송에 실패했습니다.")
  }
}

export async function updateChatReadPointer(roomId, lastReadMessageId) {
  if (isDemoModeEnabled()) return demoUpdateChatReadPointer(roomId, lastReadMessageId)
  try {
    const response = await apiInstance.post(`/v1/chat/rooms/${roomId}/read`, { lastReadMessageId })
    return unwrapApiResponseBody(response, "읽음 상태를 갱신하지 못했습니다.")
  } catch (error) {
    throw normalizeApiError(error, "읽음 상태 갱신에 실패했습니다.")
  }
}
