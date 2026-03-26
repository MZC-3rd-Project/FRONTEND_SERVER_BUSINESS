import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { Link } from "react-router"
import { MessageSquareMore, SendHorizonal, ShieldAlert } from "lucide-react"
import { useQueryClient } from "@tanstack/react-query"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import PageIntro from "@/components/layout/PageIntro.jsx"
import {
  useChatMessagesQuery,
  useChatRoomsQuery,
  useSendChatMessageMutation,
  useUpdateChatReadPointerMutation,
} from "@/domains/chat/hook/useBusinessChatQuery.js"
import { useChatWebSocket } from "@/domains/chat/hook/useChatWebSocket.js"
import MessageBubble from "@/domains/chat/components/MessageBubble.jsx"
import WsStatusBadge from "@/domains/chat/components/WsStatusBadge.jsx"
import {
  buildClientMessageId,
  mergeCollections,
  readSelfSenderIds,
  saveSelfSenderId,
  upsertMessage,
} from "@/domains/chat/utils/chatHelpers.js"
import { demoChatMessagesByRoomId, demoChatRooms } from "@/domains/management/mock/demoData.js"
import { cn } from "@/lib/utils"

// ── Main page ─────────────────────────────────────────────────────────────────
export default function ChatInboxPage() {
  const queryClient = useQueryClient()

  const [selectedRoomId, setSelectedRoomId] = useState("")
  const [draft, setDraft] = useState("")
  const [liveMessageState, setLiveMessageState] = useState({ roomId: "", messages: [] })
  const [knownSelfSenderIds, setKnownSelfSenderIds] = useState(() => readSelfSenderIds())
  const messagesContainerRef = useRef(null)
  const lastReadIdRef = useRef("")

  const sendMessageMutation = useSendChatMessageMutation()
  const { mutateAsync: updateReadPointer } = useUpdateChatReadPointerMutation()

  const roomsQuery = useChatRoomsQuery({ size: 20 })
  const realRooms = useMemo(() => roomsQuery.data?.items ?? [], [roomsQuery.data?.items])
  const usingDemoChat = import.meta.env.DEV && realRooms.length === 0
  const rooms = usingDemoChat ? demoChatRooms : realRooms

  const activeRoomId = rooms.some((r) => String(r.roomId) === String(selectedRoomId))
    ? String(selectedRoomId)
    : String(rooms[0]?.roomId ?? "")

  const selectedRoom = rooms.find((r) => String(r.roomId) === activeRoomId) ?? null

  const ownSenderIdSet = useMemo(() => new Set(knownSelfSenderIds), [knownSelfSenderIds])

  function rememberSelfSenderId(id) {
    if (!id) return
    const next = saveSelfSenderId(String(id))
    if (next) setKnownSelfSenderIds(next)
  }

  // ── REST history messages ────────────────────────────────────────────────
  const messagesQuery = useChatMessagesQuery(activeRoomId, { size: 50 })
  const historyMessages = useMemo(() => {
    if (usingDemoChat) return demoChatMessagesByRoomId[activeRoomId] ?? []
    return (messagesQuery.data?.items ?? [])
      .map((m) => ({
        ...m,
        messageId: m.messageId ? String(m.messageId) : "",
        senderId: m.senderId ? String(m.senderId) : "",
        fromSelf: ownSenderIdSet.has(String(m.senderId)),
        deliveryState: "sent",
      }))
      .reverse() // REST returns newest first → reverse for chronological display
  }, [usingDemoChat, messagesQuery.data?.items, ownSenderIdSet, activeRoomId])

  // ── Live WS messages ─────────────────────────────────────────────────────
  const liveMessages = useMemo(
    () => (liveMessageState.roomId === activeRoomId ? liveMessageState.messages : []),
    [liveMessageState.messages, liveMessageState.roomId, activeRoomId],
  )

  const mergedMessages = useMemo(
    () => mergeCollections(historyMessages, liveMessages),
    [historyMessages, liveMessages],
  )

  const latestConfirmedMessageId = useMemo(
    () => [...mergedMessages].reverse().find((m) => m.messageId)?.messageId ?? "",
    [mergedMessages],
  )

  function updateLiveMessages(updater) {
    setLiveMessageState((prev) => {
      const base = prev.roomId === activeRoomId ? prev.messages : []
      return {
        roomId: activeRoomId,
        messages: typeof updater === "function" ? updater(base) : updater,
      }
    })
  }

  // Reset live messages & read pointer when room changes
  useEffect(() => {
    lastReadIdRef.current = ""
    setLiveMessageState({ roomId: activeRoomId, messages: [] })
  }, [activeRoomId])

  // Auto-scroll to bottom (컨테이너 직접 제어 — 페이지 스크롤 방지)
  useEffect(() => {
    const el = messagesContainerRef.current
    if (el) el.scrollTop = el.scrollHeight
  }, [mergedMessages.length, activeRoomId])

  // ── WebSocket ────────────────────────────────────────────────────────────
  const handleFrame = useCallback(
    (frame) => {
      if (frame.type !== "ROOM_MESSAGE") return

      const { roomId, ...msg } = frame.payload ?? {}
      if (!roomId) return

      const senderId = msg.senderId ? String(msg.senderId) : ""
      const fromSelf =
        ownSenderIdSet.has(senderId) ||
        liveMessages.some(
          (c) => c.fromSelf && c.messageId && c.messageId === String(msg.messageId),
        )

      if (fromSelf) rememberSelfSenderId(senderId)

      setLiveMessageState((prev) => {
        const base = prev.roomId === String(roomId) ? prev.messages : []
        return {
          roomId: String(roomId),
          messages: upsertMessage(base, {
            ...msg,
            messageId: msg.messageId ? String(msg.messageId) : "",
            senderId,
            fromSelf,
            deliveryState: "sent",
          }),
        }
      })

      queryClient.invalidateQueries({ queryKey: ["business-chat", "rooms"] })
    },
    [ownSenderIdSet, liveMessages, queryClient],
  )

  const { status: wsStatus, subscribeRoom, sendMessage: wsSendMessage } = useChatWebSocket({
    onFrame: handleFrame,
  })

  // Subscribe to active room whenever WS connects or room changes
  const subscribedRoomRef = useRef(null)
  useEffect(() => {
    if (usingDemoChat || !activeRoomId) return
    if (wsStatus !== "connected") return
    if (subscribedRoomRef.current === activeRoomId) return
    subscribedRoomRef.current = activeRoomId
    subscribeRoom(activeRoomId)
  }, [wsStatus, activeRoomId, subscribeRoom, usingDemoChat])

  useEffect(() => {
    subscribedRoomRef.current = null
  }, [activeRoomId])

  // ── Read pointer ─────────────────────────────────────────────────────────
  useEffect(() => {
    if (usingDemoChat || !activeRoomId || !latestConfirmedMessageId) return
    if (lastReadIdRef.current === latestConfirmedMessageId) return
    lastReadIdRef.current = latestConfirmedMessageId
    updateReadPointer({ roomId: activeRoomId, lastReadMessageId: latestConfirmedMessageId })
      .then(() => queryClient.invalidateQueries({ queryKey: ["business-chat", "rooms"] }))
      .catch(() => { lastReadIdRef.current = "" })
  }, [activeRoomId, latestConfirmedMessageId, updateReadPointer, queryClient, usingDemoChat])

  // ── Send message ─────────────────────────────────────────────────────────
  async function handleSend() {
    const content = draft.trim()
    if (!activeRoomId || !content || usingDemoChat) return

    const clientMessageId = buildClientMessageId()
    const optimistic = {
      localKey: clientMessageId,
      roomId: activeRoomId,
      messageId: "",
      clientMessageId,
      senderId: "",
      messageType: "CHAT",
      content,
      createdAt: new Date().toISOString(),
      fromSelf: true,
      deliveryState: "sending",
    }

    updateLiveMessages((prev) => upsertMessage(prev, optimistic))
    setDraft("")

    if (wsStatus === "connected") {
      wsSendMessage({
        roomId: activeRoomId,
        clientMessageId,
        content,
        messageType: "CHAT",
        metadata: { source: "business-console" },
      })
      queryClient.invalidateQueries({ queryKey: ["business-chat", "rooms"] })
    } else {
      try {
        const sent = await sendMessageMutation.mutateAsync({
          roomId: activeRoomId,
          payload: { clientMessageId, messageType: "CHAT", content, metadata: { source: "business-console" } },
        })
        const senderId = sent?.senderId ? String(sent.senderId) : ""
        rememberSelfSenderId(senderId)
        updateLiveMessages((prev) =>
          upsertMessage(prev, {
            ...sent,
            localKey: clientMessageId,
            clientMessageId,
            messageId: sent?.messageId ? String(sent.messageId) : "",
            senderId,
            fromSelf: true,
            deliveryState: "sent",
          }),
        )
      } catch {
        updateLiveMessages((prev) =>
          prev.map((m) =>
            m.clientMessageId === clientMessageId ? { ...m, deliveryState: "failed" } : m,
          ),
        )
      }
    }
  }

  const isAuthFailed = wsStatus === "auth_failed"
  const isSendDisabled = !draft.trim() || !selectedRoom || usingDemoChat || isAuthFailed || sendMessageMutation.isPending

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
            WebSocket으로 고객 메시지를 실시간 수신하고 즉시 답장을 보낼 수 있습니다.
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
                <WsStatusBadge status={wsStatus} />
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
                          {room.buyerDisplayName || "고객"}
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
                      {room.updatedAt ?? room.lastMessage?.createdAt ?? "-"}
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
                    ? `${selectedRoom.buyerDisplayName || "고객"} · ${selectedRoom.storeName || ""}`
                    : "왼쪽에서 문의방을 선택해주세요."}
                </p>
              </div>
              {!usingDemoChat && selectedRoom && <WsStatusBadge status={wsStatus} />}
            </div>
          </div>

          <CardContent className="p-6">
            {!selectedRoom ? (
              <div className="rounded-[1.8rem] border border-dashed border-border px-6 py-10 text-center">
                <MessageSquareMore size={24} className="mx-auto text-primary/70" />
                <p className="mt-3 text-sm text-muted-foreground">문의방을 선택해주세요.</p>
              </div>
            ) : messagesQuery.isLoading && !usingDemoChat ? (
              <div className="space-y-3">
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className={cn(
                      "h-12 animate-pulse rounded-2xl bg-muted",
                      i % 2 === 0 ? "ml-auto w-2/3" : "w-3/4",
                    )}
                  />
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {/* Message thread */}
                <div className="flex h-[420px] flex-col rounded-[1.6rem] border border-border/80 bg-white/55 dark:bg-slate-950/20">
                  <div ref={messagesContainerRef} className="flex-1 space-y-3 overflow-y-auto px-4 py-4">
                    {mergedMessages.length > 0 ? (
                      mergedMessages.map((message) => (
                        <MessageBubble
                          key={message.messageId || message.clientMessageId || message.localKey}
                          message={message}
                        />
                      ))
                    ) : (
                      <div className="grid h-full place-items-center text-center">
                        <p className="text-sm text-muted-foreground">아직 메시지가 없습니다.</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Auth failed banner */}
                {isAuthFailed && (
                  <div className="flex items-center gap-3 rounded-[1.2rem] border border-destructive/30 bg-destructive/8 px-4 py-3">
                    <ShieldAlert size={16} className="shrink-0 text-destructive" />
                    <p className="flex-1 text-sm text-destructive">
                      실시간 채팅 연결에 실패했습니다. 로그인 후 다시 시도해주세요.
                    </p>
                    <Link
                      to="/auth/login"
                      className="shrink-0 text-sm font-semibold text-destructive underline underline-offset-2"
                    >
                      로그인
                    </Link>
                  </div>
                )}

                {/* Input area */}
                <div className="rounded-[1.6rem] border border-border/80 bg-white/55 p-4 dark:bg-slate-950/20">
                  <Textarea
                    value={draft}
                    onChange={(e) => setDraft(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
                        e.preventDefault()
                        void handleSend()
                      }
                    }}
                    placeholder={
                      usingDemoChat
                        ? "데모 데이터에서는 답장을 전송할 수 없습니다."
                        : isAuthFailed
                          ? "로그인이 필요합니다."
                          : "문의 답장을 입력하세요 (Ctrl+Enter로 전송)"
                    }
                    rows={4}
                    disabled={!selectedRoom || usingDemoChat || isAuthFailed || sendMessageMutation.isPending}
                  />
                  <div className="mt-3 flex items-center justify-between">
                    <p className="text-[0.75rem] text-muted-foreground">
                      {wsStatus === "connected"
                        ? "실시간 전송"
                        : isAuthFailed
                          ? "로그인 필요"
                          : "REST 전송 (WS 연결 끊김)"}
                    </p>
                    <Button onClick={() => void handleSend()} disabled={isSendDisabled}>
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
