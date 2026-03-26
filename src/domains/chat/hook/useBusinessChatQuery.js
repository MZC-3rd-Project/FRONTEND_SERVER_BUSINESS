import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import {
  fetchChatMessages,
  fetchMyChatRooms,
  sendChatRoomMessage,
  updateChatReadPointer,
} from "@/domains/chat/api/chatApi.js"

export function useChatRoomsQuery(params = { size: 20 }) {
  return useQuery({
    queryKey: ["business-chat", "rooms", params],
    queryFn: () => fetchMyChatRooms(params),
    refetchInterval: 15_000, // 15초마다 새 문의방 자동 감지
  })
}

export function useChatMessagesQuery(roomId, params = { size: 50 }) {
  return useQuery({
    queryKey: ["business-chat", "messages", roomId, params],
    queryFn: () => fetchChatMessages(roomId, params),
    enabled: Boolean(roomId),
  })
}

export function useSendChatMessageMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ roomId, payload }) => sendChatRoomMessage(roomId, payload),
    onSuccess: () => {
      // 메시지는 liveMessages 로컬 상태로 관리 — 리페치 금지 (스크롤 리셋 방지)
      queryClient.invalidateQueries({ queryKey: ["business-chat", "rooms"] })
    },
  })
}

export function useUpdateChatReadPointerMutation() {
  return useMutation({
    mutationFn: ({ roomId, lastReadMessageId }) =>
      updateChatReadPointer(roomId, lastReadMessageId),
    // 읽음 처리는 rooms 목록(unreadCount)만 갱신 — messages 리페치 금지
  })
}
