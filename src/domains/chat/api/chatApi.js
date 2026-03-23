import apiInstance from "@/common/api/apiInstance.js"
import {
  demoFetchChatMessages,
  demoFetchMyChatRooms,
  demoSendChatRoomMessage,
  demoUpdateChatReadPointer,
  isDemoModeEnabled,
} from "@/domains/management/mock/demoBackend.js"

export async function fetchMyChatRooms(params = {}) {
  if (isDemoModeEnabled()) {
    return demoFetchMyChatRooms(params)
  }
  const { data } = await apiInstance.get("/v1/chat/rooms", { params })
  return data?.data ?? { items: [], nextCursor: null, hasNext: false }
}

export async function fetchChatMessages(roomId, params = {}) {
  if (isDemoModeEnabled()) {
    return demoFetchChatMessages(roomId, params)
  }
  const { data } = await apiInstance.get(`/v1/chat/rooms/${roomId}/messages`, { params })
  return data?.data ?? { items: [], nextCursor: null, hasNext: false }
}

export async function sendChatRoomMessage(roomId, payload) {
  if (isDemoModeEnabled()) {
    return demoSendChatRoomMessage(roomId, payload)
  }
  const { data } = await apiInstance.post(`/v1/chat/rooms/${roomId}/messages`, payload)
  return data?.data ?? null
}

export async function updateChatReadPointer(roomId, lastReadMessageId) {
  if (isDemoModeEnabled()) {
    return demoUpdateChatReadPointer(roomId, lastReadMessageId)
  }
  const { data } = await apiInstance.post(`/v1/chat/rooms/${roomId}/read`, {
    lastReadMessageId,
  })
  return data?.data ?? null
}
