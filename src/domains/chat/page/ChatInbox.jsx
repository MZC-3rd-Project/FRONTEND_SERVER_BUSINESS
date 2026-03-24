import { useEffect, useMemo, useState } from "react"
import { MessageSquareMore, SendHorizonal } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import PageIntro from "@/components/layout/PageIntro.jsx"
import apiInstance from "@/common/api/apiInstance.js"
import {
  useChatMessagesQuery,
  useChatRoomsQuery,
  useSendChatMessageMutation,
  useUpdateChatReadPointerMutation,
} from "@/domains/chat/hook/useBusinessChatQuery.js"
import { demoChatMessagesByRoomId, demoChatRooms } from "@/domains/management/mock/demoData.js"
import { cn } from "@/lib/utils"

function formatDateTime(value) {
  if (!value) return "-"
  return String(value).replace("T", " ").slice(0, 16)
}

function buildDraftClientMessageId() {
  return `seller-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}

export default function ChatInboxPage() {
  const [selectedRoomId, setSelectedRoomId] = useState("")
  const [draft, setDraft] = useState("")
  const currentUserId = String(apiInstance.defaults.headers?.["X-User-Id"] ?? "")
  const roomsQuery = useChatRoomsQuery({ size: 20 })
  const sendMessageMutation = useSendChatMessageMutation()
  const updateReadMutation = useUpdateChatReadPointerMutation()

  const realRooms = useMemo(() => roomsQuery.data?.items ?? [], [roomsQuery.data?.items])
  const usingDemoChat = import.meta.env.DEV && realRooms.length === 0
  const rooms = usingDemoChat ? demoChatRooms : realRooms
  const activeRoomId = rooms.some((room) => String(room.roomId) === String(selectedRoomId))
    ? String(selectedRoomId)
    : String(rooms[0]?.roomId ?? "")
  const selectedRoom = rooms.find((room) => String(room.roomId) === activeRoomId) ?? null
  const messagesQuery = useChatMessagesQuery(activeRoomId, { size: 50 })
  const messages = useMemo(() => {
    if (usingDemoChat) {
      return demoChatMessagesByRoomId[activeRoomId] ?? []
    }
    return messagesQuery.data?.items ?? []
  }, [activeRoomId, messagesQuery.data?.items, usingDemoChat])

  useEffect(() => {
    if (usingDemoChat || !activeRoomId || !messages.length) return

    const latestMessage = messages[0]
    const latestMessageId = latestMessage?.messageId
    if (!latestMessageId) return

    updateReadMutation.mutate({
      roomId: activeRoomId,
      lastReadMessageId: latestMessageId,
    })
  }, [activeRoomId, messages, updateReadMutation, usingDemoChat])

  const handleSend = async () => {
    const content = draft.trim()
    if (!activeRoomId || !content || usingDemoChat) return

    await sendMessageMutation.mutateAsync({
      roomId: activeRoomId,
      payload: {
        clientMessageId: buildDraftClientMessageId(),
        messageType: "CHAT",
        content,
        metadata: {
          source: "business-console",
        },
      },
    })
    setDraft("")
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <PageIntro
        eyebrow="Chat Inbox"
        title="채팅 문의"
        description="고객 문의 채팅방을 seller 콘솔 안에서 확인하는 화면입니다. 새 메시지가 온 방을 먼저 보고, 선택한 문의방에서 바로 답장을 보낼 수 있습니다."
        meta={[
          `${rooms.length}개 문의방`,
          selectedRoom ? `${selectedRoom.unreadCount ?? 0}개 미확인` : "문의방 선택 필요",
          usingDemoChat ? "데모 데이터" : "실데이터",
        ]}
      >
        <div className="metric-chip rounded-[1.75rem] px-5 py-5">
          <p className="text-[0.72rem] font-semibold uppercase tracking-[0.22em] text-slate-500 dark:text-slate-400">
            Inquiry flow
          </p>
          <p className="mt-3 text-lg font-semibold text-foreground">
            문의방 목록 확인 후 답장
          </p>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            실시간 소켓 없이도 현재 문의 이력과 답장 흐름을 운영 화면에서 확인할 수 있습니다.
          </p>
        </div>
      </PageIntro>

      <div className="grid gap-6 xl:grid-cols-[21rem_minmax(0,1fr)]">
        <Card className="h-fit">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <p className="section-kicker">Rooms</p>
              {usingDemoChat ? <Badge variant="outline">데모 데이터</Badge> : null}
            </div>

            <div className="mt-4 space-y-3">
              {rooms.length > 0 ? (
                rooms.map((room) => (
                  <button
                    key={room.roomId}
                    type="button"
                    onClick={() => setSelectedRoomId(String(room.roomId))}
                    className={cn(
                      "metric-chip w-full rounded-[1.4rem] px-4 py-4 text-left transition-all",
                      String(room.roomId) === activeRoomId &&
                        "border-primary/25 ring-2 ring-primary/12"
                    )}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-foreground">
                          {room.title || room.storeName || "문의 채팅"}
                        </p>
                        <p className="mt-1 truncate text-[0.82rem] text-muted-foreground">
                          {room.buyerDisplayName || room.storeName || "고객"}
                        </p>
                      </div>
                      <Badge variant={room.unreadCount ? "default" : "outline"}>
                        {room.unreadCount ?? 0}
                      </Badge>
                    </div>
                    <p className="mt-3 line-clamp-2 text-sm text-muted-foreground">
                      {room.lastMessage?.content ?? "대화 내역이 없습니다."}
                    </p>
                    <p className="mt-2 text-[0.78rem] text-slate-500 dark:text-slate-400">
                      {formatDateTime(room.updatedAt ?? room.lastMessage?.createdAt)}
                    </p>
                  </button>
                ))
              ) : (
                <div className="rounded-[1.5rem] border border-dashed border-border px-4 py-8 text-center">
                  <MessageSquareMore size={20} className="mx-auto text-primary/70" />
                  <p className="mt-3 text-sm text-muted-foreground">문의 채팅방이 없습니다.</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="overflow-hidden">
          <div className="border-b border-white/70 px-6 py-5 dark:border-slate-800">
            <p className="section-kicker">Conversation</p>
            <h2 className="display-title mt-2 text-2xl text-foreground">
              {selectedRoom?.title || "문의 대화"}
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              {selectedRoom
                ? `${selectedRoom.buyerDisplayName || "고객"} · ${selectedRoom.storeName || "돈모아"}`
                : "왼쪽에서 문의방을 선택해주세요."}
            </p>
          </div>

          <CardContent className="p-6">
            {!selectedRoom ? (
              <div className="rounded-[1.8rem] border border-dashed border-border px-6 py-10 text-center">
                <MessageSquareMore size={24} className="mx-auto text-primary/70" />
                <p className="mt-3 text-sm text-muted-foreground">문의방을 선택해주세요.</p>
              </div>
            ) : messagesQuery.isLoading && !usingDemoChat ? (
              <div className="rounded-[1.8rem] border border-dashed border-border px-6 py-10 text-center text-sm text-muted-foreground">
                메시지를 불러오는 중입니다.
              </div>
            ) : (
              <div className="space-y-4">
                <div className="space-y-3 rounded-[1.6rem] border border-border/80 bg-white/55 p-4 dark:bg-slate-950/20">
                  {messages.length > 0 ? (
                    messages
                      .slice()
                      .reverse()
                      .map((message) => {
                        const isMine =
                          currentUserId && String(message.senderId) === currentUserId

                        return (
                          <div
                            key={message.messageId}
                            className={cn("flex", isMine ? "justify-end" : "justify-start")}
                          >
                            <div className={cn("max-w-[80%] space-y-1", isMine && "text-right")}>
                              <div
                                className={cn(
                                  "rounded-2xl px-3 py-2 text-sm leading-relaxed",
                                  isMine
                                    ? "bg-primary text-primary-foreground"
                                    : "border border-border bg-card text-foreground"
                                )}
                              >
                                {message.content}
                              </div>
                              <p className="text-[0.74rem] text-muted-foreground">
                                {formatDateTime(message.createdAt)}
                              </p>
                            </div>
                          </div>
                        )
                      })
                  ) : (
                    <div className="py-10 text-center text-sm text-muted-foreground">
                      아직 메시지가 없습니다.
                    </div>
                  )}
                </div>

                <div className="rounded-[1.6rem] border border-border/80 bg-white/55 p-4 dark:bg-slate-950/20">
                  <Textarea
                    value={draft}
                    onChange={(event) => setDraft(event.target.value)}
                    placeholder={
                      usingDemoChat
                        ? "데모 데이터에서는 답장을 전송할 수 없습니다."
                        : "문의 답장을 입력하세요"
                    }
                    rows={4}
                    disabled={!selectedRoom || usingDemoChat || sendMessageMutation.isPending}
                  />
                  <div className="mt-3 flex justify-end">
                    <Button
                      onClick={handleSend}
                      disabled={!draft.trim() || !selectedRoom || usingDemoChat || sendMessageMutation.isPending}
                    >
                      <SendHorizonal size={14} />
                      {sendMessageMutation.isPending ? "전송 중..." : "답장 보내기"}
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
