import { useCallback, useEffect, useRef, useState } from "react"

function buildWsUrl() {
  const protocol = window.location.protocol === "https:" ? "wss:" : "ws:"
  return `${protocol}//${window.location.host}/ws/chat`
}

/**
 * 채팅 WebSocket 연결 훅
 *
 * 반환값:
 *  - status: "connecting" | "connected" | "disconnected"
 *  - subscribeRoom(roomId, lastReceivedMessageId?)
 *  - sendMessage({ roomId, clientMessageId, content, messageType?, metadata? })
 */
export function useChatWebSocket({ onFrame }) {
  const wsRef = useRef(null)
  const heartbeatRef = useRef(null)
  const onFrameRef = useRef(onFrame)
  onFrameRef.current = onFrame

  const [status, setStatus] = useState("disconnected")

  const send = useCallback((frame) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(frame))
    }
  }, [])

  const subscribeRoom = useCallback(
    (roomId, lastReceivedMessageId) => {
      send({
        type: "SUBSCRIBE_ROOM",
        roomId: Number(roomId),
        ...(lastReceivedMessageId != null && {
          lastReceivedMessageId: Number(lastReceivedMessageId),
        }),
      })
    },
    [send],
  )

  const sendMessage = useCallback(
    ({ roomId, clientMessageId, content, messageType = "CHAT", metadata }) => {
      send({
        type: "SEND_MESSAGE",
        roomId: Number(roomId),
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

      ws.onclose = () => {
        clearInterval(heartbeatRef.current)
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
