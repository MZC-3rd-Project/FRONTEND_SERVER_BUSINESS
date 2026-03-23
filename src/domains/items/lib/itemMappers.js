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

export function formatPrice(value) {
  const number = toNullableNumber(value)

  if (number === null) {
    return value ? String(value) : "-"
  }

  return `${currencyFormatter.format(number)}원`
}

export function mapSellerProductSummary(raw = {}) {
  const itemType = toText(raw?.itemType ?? raw?.type, "GOODS").toUpperCase()
  const status = toText(raw?.status, "DRAFT").toUpperCase()

  return {
    id: toId(raw?.itemId ?? raw?.id),
    sellerId: toId(raw?.sellerId),
    storeId: toId(raw?.storeId),
    title: toText(raw?.title ?? raw?.name, "상품 정보 준비 중"),
    price: toNullableNumber(raw?.price),
    priceText: formatPrice(raw?.price),
    itemType,
    status,
    averageRating: toNullableNumber(raw?.averageRating) ?? 0,
    reviewCount: toNumber(raw?.reviewCount, 0),
    thumbnailMediaId: toId(raw?.thumbnailMediaId),
    thumbnailUrl: toText(raw?.thumbnailUrl),
  }
}

export function mapSellerProductListPayload(payload) {
  const items = Array.isArray(payload?.items) ? payload.items : Array.isArray(payload) ? payload : []

  return {
    items: items.map(mapSellerProductSummary),
    nextCursor: payload?.nextCursor ?? null,
    hasNext: Boolean(payload?.hasNext ?? payload?.nextCursor),
    totalCount: payload?.totalCount ?? items.length,
  }
}

function mapCategoryNode(node = {}) {
  return {
    id: toId(node?.id),
    name: toText(node?.name, "이름 없음"),
    children: Array.isArray(node?.children) ? node.children.map(mapCategoryNode) : [],
  }
}

export function mapCategoryTreePayload(payload) {
  const items = Array.isArray(payload?.items) ? payload.items : Array.isArray(payload) ? payload : []
  return items.map(mapCategoryNode)
}

export function mapMyStorePayload(raw) {
  if (!raw) {
    return null
  }

  const storeName = toText(raw?.storeName ?? raw?.store_name ?? raw?.name, "내 스토어")

  return {
    ...raw,
    id: toId(raw?.storeId ?? raw?.id),
    userId: toId(raw?.userId),
    storeName,
    store_name: storeName,
    name: storeName,
    status: toText(raw?.status, "INACTIVE"),
    description: toText(raw?.description),
    addresses: Array.isArray(raw?.addresses) ? raw.addresses : [],
    contacts: Array.isArray(raw?.contacts) ? raw.contacts : [],
  }
}
