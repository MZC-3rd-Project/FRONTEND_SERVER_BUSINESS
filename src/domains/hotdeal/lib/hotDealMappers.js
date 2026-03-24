const currencyFormatter = new Intl.NumberFormat("ko-KR")

function toNumber(value, fallback = 0) {
  const number = Number(value)
  return Number.isFinite(number) ? number : fallback
}

function toNullableNumber(value) {
  const number = Number(value)
  return Number.isFinite(number) ? number : null
}

function toText(value, fallback = "") {
  if (typeof value === "string" && value.trim()) {
    return value.trim()
  }

  return fallback
}

function toId(value, fallback = null) {
  if (value === null || value === undefined) {
    return fallback
  }

  const normalized = String(value).trim()
  return normalized || fallback
}

function formatPrice(value) {
  const number = toNullableNumber(value)

  if (number === null) {
    return value ? String(value) : "-"
  }

  return `${currencyFormatter.format(number)}원`
}

function mapHotDealStatus(status) {
  switch (String(status || "").toUpperCase()) {
    case "SCHEDULED":
      return "오픈 예정"
    case "ACTIVE":
      return "진행 중"
    case "ENDED":
      return "종료"
    case "CANCELLED":
      return "취소됨"
    default:
      return status ? String(status) : "상태 미정"
  }
}

function mapHotDeal(raw = {}) {
  const soldQuantity = toNumber(raw?.soldQuantity, 0)
  const maxQuantity = toNumber(raw?.maxQuantity, 0)
  const progressRate = maxQuantity > 0 ? Math.min(100, Math.round((soldQuantity / maxQuantity) * 100)) : 0

  return {
    id: toId(raw?.hotDealId ?? raw?.id),
    itemId: toId(raw?.itemId),
    title: toText(raw?.title, "이름 없는 핫딜"),
    statusCode: toText(raw?.status, "ACTIVE").toUpperCase(),
    status: mapHotDealStatus(raw?.status),
    discountRate: toNumber(raw?.discountRate, 0),
    discountedPrice: toNullableNumber(raw?.discountedPrice),
    discountedPriceText: formatPrice(raw?.discountedPrice),
    originalPrice: toNullableNumber(raw?.originalPrice),
    originalPriceText: formatPrice(raw?.originalPrice),
    soldQuantity,
    maxQuantity,
    remainingQuantity: Math.max(maxQuantity - soldQuantity, 0),
    progressRate,
    endAt: raw?.endAt ?? null,
    startAt: raw?.startAt ?? null,
    maxPerUser: toNullableNumber(raw?.maxPerUser),
  }
}

export function mapHotDealListPayload(payload) {
  const items = Array.isArray(payload?.items) ? payload.items : Array.isArray(payload) ? payload : []

  return {
    items: items.map(mapHotDeal),
    nextCursor: payload?.nextCursor ?? null,
    hasNext: Boolean(payload?.hasNext ?? payload?.nextCursor),
    totalCount: payload?.totalCount ?? items.length,
  }
}

export function mapHotDealPayload(payload) {
  if (!payload) {
    return null
  }

  return mapHotDeal(payload)
}
