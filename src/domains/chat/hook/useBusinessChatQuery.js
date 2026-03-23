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
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["business-chat", "rooms"] })
      queryClient.invalidateQueries({
        queryKey: ["business-chat", "messages", variables.roomId],
      })
    },
  })
}

export function useUpdateChatReadPointerMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ roomId, lastReadMessageId }) =>
      updateChatReadPointer(roomId, lastReadMessageId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["business-chat", "rooms"] })
      queryClient.invalidateQueries({
        queryKey: ["business-chat", "messages", variables.roomId],
      })
    },
  })
}
