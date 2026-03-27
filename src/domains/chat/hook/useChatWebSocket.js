import { useCallback, useEffect, useRef, useState } from "react"

function buildWsUrl() {
  const protocol = window.location.protocol === "https:" ? "wss:" : "ws:"
  return `${protocol}//${window.location.host}/ws/chat`
}

// WS close code 1008 = Policy Violation (인증 실패)
const WS_CLOSE_POLICY_VIOLATION = 1008

/**
 * 채팅 WebSocket 연결 훅
 *
 * 반환값:
 *  - status: "connecting" | "connected" | "disconnected" | "auth_failed"
 *  - subscribeRoom(roomId, lastReceivedMessageId?)
 *  - sendMessage({ roomId, clientMessageId, content, messageType?, metadata? })
 */
export function useChatWebSocket({ onFrame }) {
  const wsRef = useRef(null)
  const heartbeatRef = useRef(null)
  const onFrameRef = useRef(onFrame)

  const [status, setStatus] = useState("disconnected")

  useEffect(() => {
    onFrameRef.current = onFrame
  }, [onFrame])

  const send = useCallback((frame) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(frame))
    }
  }, [])

  const subscribeRoom = useCallback(
    (roomId, lastReceivedMessageId) => {
      send({
        type: "SUBSCRIBE_ROOM",
        roomId: String(roomId),
        ...(lastReceivedMessageId != null && {
          lastReceivedMessageId: String(lastReceivedMessageId),
        }),
      })
    },
    [send],
  )

  const sendMessage = useCallback(
    ({ roomId, clientMessageId, content, messageType = "CHAT", metadata }) => {
      send({
        type: "SEND_MESSAGE",
        roomId: String(roomId),
        clientMessageId,
        messageType,
        content,
        ...(metadata && { metadata }),
      })
    },
    [send],
  )

  useEffect(() => {
    let ws
    let reconnectTimeout
    let destroyed = false

    function connect() {
      if (destroyed) return
      setStatus("connecting")

      try {
        ws = new WebSocket(buildWsUrl())
      } catch {
        setStatus("disconnected")
        if (!destroyed) reconnectTimeout = setTimeout(connect, 5_000)
        return
      }

      wsRef.current = ws

      ws.onopen = () => {
        setStatus("connected")
        heartbeatRef.current = setInterval(() => {
          if (ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({ type: "PING" }))
          }
        }, 25_000)
      }

      ws.onmessage = (event) => {
        try {
          const frame = JSON.parse(event.data)
          onFrameRef.current?.(frame)
        } catch {
          // ignore
        }
      }

      ws.onerror = () => {
        // handled in onclose
      }

      ws.onclose = (event) => {
        clearInterval(heartbeatRef.current)

        // 1008 = Policy Violation: 인증 실패 — 재연결해도 계속 거부됨
        if (event.code === WS_CLOSE_POLICY_VIOLATION) {
          setStatus("auth_failed")
          return
        }

        setStatus("disconnected")
        if (!destroyed) {
          reconnectTimeout = setTimeout(connect, 3_000)
        }
      }
    }

    connect()

    return () => {
      destroyed = true
      clearTimeout(reconnectTimeout)
      clearInterval(heartbeatRef.current)
      ws?.close()
    }
  }, [])

  return { status, subscribeRoom, sendMessage }
}
