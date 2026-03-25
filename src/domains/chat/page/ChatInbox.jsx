import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { MessageSquareMore, SendHorizonal, Wifi, WifiOff } from "lucide-react"
import { useQueryClient } from "@tanstack/react-query"

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
import { useChatWebSocket } from "@/domains/chat/hook/useChatWebSocket.js"
import { demoChatMessagesByRoomId, demoChatRooms } from "@/domains/management/mock/demoData.js"
import { cn } from "@/lib/utils"

function formatDateTime(value) {
  if (!value) return "-"
  return String(value).replace("T", " ").slice(0, 16)
}

function buildDraftClientMessageId() {
  return `seller-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}

function WsStatusDot({ status }) {
  if (status === "connected") {
    return (
      <span className="flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400">
        <Wifi size={12} />
        실시간 연결
      </span>
    )
  }
  if (status === "connecting") {
    return (
      <span className="flex items-center gap-1 text-xs text-amber-500">
        <Wifi size={12} />
        연결 중...
      </span>
    )
  }
  return (
    <span className="flex items-center gap-1 text-xs text-muted-foreground">
      <WifiOff size={12} />
      연결 끊김
    </span>
  )
}

export default function ChatInboxPage() {
  const queryClient = useQueryClient()
  const [selectedRoomId, setSelectedRoomId] = useState("")
  const [draft, setDraft] = useState("")
  const [liveMessages, setLiveMessages] = useState({}) // { [roomId]: message[] }

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

  // ── WebSocket ──────────────────────────────────────────────────────────────
  const handleFrame = useCallback(
    (frame) => {
      if (frame.type === "ROOM_MESSAGE") {
        const { roomId, ...msg } = frame.payload ?? {}
        if (!roomId) return
        setLiveMessages((prev) => ({
          ...prev,
          [String(roomId)]: [msg, ...(prev[String(roomId)] ?? [])],
        }))
        // refresh room list (unread count, last message)
        queryClient.invalidateQueries({ queryKey: ["business-chat", "rooms"] })
      }
    },
    [queryClient],
  )

  const { status: wsStatus, subscribeRoom, sendMessage: wsSendMessage } = useChatWebSocket({
    onFrame: handleFrame,
  })

  // Subscribe to room whenever connection is established or active room changes
  const subscribedRoomRef = useRef(null)
  useEffect(() => {
    if (usingDemoChat || !activeRoomId) return
    if (wsStatus !== "connected") return
    if (subscribedRoomRef.current === activeRoomId) return

    subscribedRoomRef.current = activeRoomId
    // Reset live messages for this room so we don't show stale WS messages
    setLiveMessages((prev) => ({ ...prev, [activeRoomId]: [] }))
    subscribeRoom(activeRoomId)
  }, [wsStatus, activeRoomId, subscribeRoom, usingDemoChat])

  // When room is switched, allow re-subscription
  useEffect(() => {
    subscribedRoomRef.current = null
  }, [activeRoomId])

  // ── Message merge (REST history + WS live) ────────────────────────────────
  const messages = useMemo(() => {
    if (usingDemoChat) return demoChatMessagesByRoomId[activeRoomId] ?? []

    const restItems = messagesQuery.data?.items ?? []
    const live = liveMessages[activeRoomId] ?? []

    // Deduplicate: prefer live messages
    const liveIds = new Set(live.map((m) => m.messageId))
    const dedupedRest = restItems.filter((m) => !liveIds.has(m.messageId))

    // live is newest-first, rest is also newest-first
    return [...live, ...dedupedRest]
  }, [usingDemoChat, messagesQuery.data?.items, liveMessages, activeRoomId])

  // ── Update read pointer ───────────────────────────────────────────────────
  const latestMessageIdRef = useRef(null)
  useEffect(() => {
    if (usingDemoChat || !activeRoomId || !messages.length) return
    const latest = messages[0]?.messageId
    if (!latest || latest === latestMessageIdRef.current) return
    latestMessageIdRef.current = latest
    updateReadMutation.mutate({ roomId: activeRoomId, lastReadMessageId: latest })
  }, [activeRoomId, messages, updateReadMutation, usingDemoChat])

  // ── Send message ──────────────────────────────────────────────────────────
  const handleSend = async () => {
    const content = draft.trim()
    if (!activeRoomId || !content || usingDemoChat) return

    const clientMessageId = buildDraftClientMessageId()

    if (wsStatus === "connected") {
      wsSendMessage({
        roomId: activeRoomId,
        clientMessageId,
        content,
        messageType: "CHAT",
        metadata: { source: "business-console" },
      })
      setDraft("")
      queryClient.invalidateQueries({ queryKey: ["business-chat", "rooms"] })
    } else {
      // REST fallback when WS is not available
      await sendMessageMutation.mutateAsync({
        roomId: activeRoomId,
        payload: {
          clientMessageId,
          messageType: "CHAT",
          content,
          metadata: { source: "business-console" },
        },
      })
      setDraft("")
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
      handleSend()
    }
  }

  const isSending = sendMessageMutation.isPending

  // ── Render ────────────────────────────────────────────────────────────────
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
          <p className="mt-3 text-lg font-semibold text-foreground">실시간 채팅 문의 관리</p>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            WebSocket으로 실시간 메시지를 수신하고 고객 문의에 즉시 답장을 보낼 수 있습니다.
          </p>
        </div>
      </PageIntro>

      <div className="grid gap-6 xl:grid-cols-[21rem_minmax(0,1fr)]">
        {/* ── Room list ── */}
        <Card className="h-fit">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <p className="section-kicker">Rooms</p>
              {usingDemoChat ? (
                <Badge variant="outline">데모 데이터</Badge>
              ) : (
                <WsStatusDot status={wsStatus} />
              )}
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
                        "border-primary/25 ring-2 ring-primary/12",
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

        {/* ── Conversation ── */}
        <Card className="overflow-hidden">
          <div className="border-b border-white/70 px-6 py-5 dark:border-slate-800">
            <p className="section-kicker">Conversation</p>
            <div className="mt-2 flex items-start justify-between gap-3">
              <div>
                <h2 className="display-title text-2xl text-foreground">
                  {selectedRoom?.title || "문의 대화"}
                </h2>
                <p className="mt-2 text-sm text-muted-foreground">
                  {selectedRoom
                    ? `${selectedRoom.buyerDisplayName || "고객"} · ${selectedRoom.storeName || "돈모아"}`
                    : "왼쪽에서 문의방을 선택해주세요."}
                </p>
              </div>
              {!usingDemoChat && selectedRoom && <WsStatusDot status={wsStatus} />}
            </div>
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
                {/* Message thread */}
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
                                    : "border border-border bg-card text-foreground",
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

                {/* Input area */}
                <div className="rounded-[1.6rem] border border-border/80 bg-white/55 p-4 dark:bg-slate-950/20">
                  <Textarea
                    value={draft}
                    onChange={(e) => setDraft(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder={
                      usingDemoChat
                        ? "데모 데이터에서는 답장을 전송할 수 없습니다."
                        : "문의 답장을 입력하세요 (Ctrl+Enter로 전송)"
                    }
                    rows={4}
                    disabled={!selectedRoom || usingDemoChat || isSending}
                  />
                  <div className="mt-3 flex items-center justify-between">
                    <p className="text-[0.75rem] text-muted-foreground">
                      {wsStatus === "connected" ? "실시간 전송" : "연결 끊김 — REST로 전송"}
                    </p>
                    <Button
                      onClick={handleSend}
                      disabled={!draft.trim() || !selectedRoom || usingDemoChat || isSending}
                    >
                      <SendHorizonal size={14} />
                      {isSending ? "전송 중..." : "답장 보내기"}
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
