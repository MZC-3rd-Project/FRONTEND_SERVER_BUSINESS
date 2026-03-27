// ── Sender ID persistence (sessionStorage) ────────────────────────────────────
export const SELF_IDS_KEY = "biz-chat:self-sender-ids"

export function readSelfSenderIds() {
  try {
    const raw = sessionStorage.getItem(SELF_IDS_KEY)
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed.map(String).filter(Boolean) : []
  } catch {
    return []
  }
}

export function saveSelfSenderId(id) {
  if (!id) return
  const prev = readSelfSenderIds()
  const next = [...new Set([...prev, String(id)])]
  try {
    sessionStorage.setItem(SELF_IDS_KEY, JSON.stringify(next))
  } catch {
    // ignore
  }
  return next
}

const CURRENT_USER_ID_PATHS = [
  ["id"],
  ["userId"],
  ["sellerId"],
  ["memberId"],
  ["accountId"],
  ["principalId"],
  ["user", "id"],
  ["user", "userId"],
  ["user", "sellerId"],
  ["seller", "id"],
  ["seller", "sellerId"],
  ["member", "id"],
  ["member", "memberId"],
  ["profile", "id"],
  ["profile", "userId"],
  ["profile", "sellerId"],
  ["principal", "id"],
  ["principal", "userId"],
  ["principal", "sellerId"],
]

function readValueAtPath(source, path) {
  return path.reduce(
    (current, segment) =>
      current != null && typeof current === "object" ? current[segment] : undefined,
    source,
  )
}

export function extractCurrentUserIds(session) {
  return [...new Set(
    CURRENT_USER_ID_PATHS
      .map((path) => readValueAtPath(session, path))
      .flatMap((value) => (Array.isArray(value) ? value : [value]))
      .map((value) => (value == null ? "" : String(value).trim()))
      .filter(Boolean),
  )]
}

// ── Message identity / merge helpers ─────────────────────────────────────────
function getMessageKeys(msg) {
  const keys = []
  if (msg?.messageId) keys.push(`msg:${msg.messageId}`)
  if (msg?.clientMessageId) keys.push(`client:${msg.clientMessageId}`)
  if (msg?.localKey) keys.push(`local:${msg.localKey}`)
  return keys
}

function hasSharedIdentity(a, b) {
  const leftKeys = new Set(getMessageKeys(a))
  return getMessageKeys(b).some((k) => leftKeys.has(k))
}

export function upsertMessage(messages, next) {
  let matched = false
  const updated = messages.map((m) => {
    if (!hasSharedIdentity(m, next)) return m
    matched = true
    return {
      ...m,
      ...next,
      localKey: next.localKey ?? m.localKey ?? null,
      clientMessageId: next.clientMessageId ?? m.clientMessageId ?? "",
      messageId: next.messageId ?? m.messageId ?? "",
      fromSelf: Boolean(next.fromSelf ?? m.fromSelf),
      deliveryState: next.deliveryState ?? m.deliveryState ?? "sent",
    }
  })
  if (!matched) updated.push(next)
  return updated
}

export function mergeCollections(history, live) {
  return live.reduce((acc, msg) => upsertMessage(acc, msg), [...history])
}

// ── Utilities ─────────────────────────────────────────────────────────────────
export function formatDateTime(value) {
  if (!value) return "-"
  const s = String(value).replace("T", " ")
  const diff = Date.now() - new Date(value).getTime()
  if (diff < 60_000) return "방금"
  if (diff < 3_600_000) return `${Math.floor(diff / 60_000)}분 전`
  return s.slice(0, 16)
}

export function buildClientMessageId() {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID()
  }
  return `seller-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}
