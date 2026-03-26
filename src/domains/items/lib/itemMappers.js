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

  // 백엔드 StoreListResponse는 flat 필드(address, contactValue)를 반환하므로 배열로 변환
  let addresses = Array.isArray(raw?.addresses) ? raw.addresses : []
  if (addresses.length === 0 && raw?.address) {
    addresses = [{ address: raw.address, addressType: raw.addressType ?? "MAIN", isDefault: true }]
  }

  let contacts = Array.isArray(raw?.contacts) ? raw.contacts : []
  if (contacts.length === 0 && raw?.contactValue) {
    contacts = [{ contactValue: raw.contactValue, contactType: raw.contactType ?? "PHONE", isPrimary: true }]
  }

  return {
    ...raw,
    id: toId(raw?.storeId ?? raw?.id),
    userId: toId(raw?.userId),
    storeName,
    store_name: storeName,
    name: storeName,
    status: toText(raw?.status, "INACTIVE"),
    description: toText(raw?.description),
    addresses,
    contacts,
  }
}

function mapItemOption(option = {}) {
  return {
    id: toId(option?.id),
    optionName: toText(option?.optionName, "기본"),
    additionalPrice: toNullableNumber(option?.additionalPrice) ?? 0,
    stockQuantity: toNumber(option?.stockQuantity, 0),
  }
}

function mapShippingInfo(info = {}) {
  return {
    shippingFee: toNullableNumber(info?.shippingFee) ?? 0,
    estimatedDays: toNumber(info?.estimatedDays, 3),
    freeShippingThreshold: toNullableNumber(info?.freeShippingThreshold),
    returnPolicy: toText(info?.returnPolicy),
    carrier: toText(info?.carrier),
    shipFrom: toText(info?.shipFrom),
    returnAddress: toText(info?.returnAddress),
    returnShippingFee: toNullableNumber(info?.returnShippingFee),
    exchangeShippingFee: toNullableNumber(info?.exchangeShippingFee),
    shippingNotice: toText(info?.shippingNotice),
  }
}

function mapSeatGrade(grade = {}) {
  return {
    id: toId(grade?.id),
    gradeName: toText(grade?.gradeName, "일반"),
    price: toNullableNumber(grade?.price) ?? 0,
    totalQuantity: toNumber(grade?.totalQuantity, 0),
    fundingQuantity: toNumber(grade?.fundingQuantity, 0),
  }
}

export function mapSellerGoodsDetailPayload(raw) {
  if (!raw) return null

  return {
    ...mapSellerProductSummary(raw),
    description: toText(raw?.description),
    categoryId: toId(raw?.categoryId),
    categoryName: toText(raw?.categoryName),
    options: Array.isArray(raw?.options) ? raw.options.map(mapItemOption) : [],
    shippingInfo: mapShippingInfo(raw?.shippingInfo ?? {}),
  }
}

export function mapSellerPerformanceDetailPayload(raw) {
  if (!raw) return null

  return {
    ...mapSellerProductSummary(raw),
    description: toText(raw?.description),
    categoryId: toId(raw?.categoryId),
    categoryName: toText(raw?.categoryName),
    venue: toText(raw?.venue),
    performanceDate: raw?.performanceDate ?? "",
    performanceTime: raw?.performanceTime ?? "",
    totalSeats: toNumber(raw?.totalSeats, 0),
    runningTimeMinutes: toNullableNumber(raw?.runningTimeMinutes),
    ageLimit: toText(raw?.ageLimit),
    venueAddress: toText(raw?.venueAddress),
    bookingNotice: toText(raw?.bookingNotice),
    organizer: toText(raw?.organizer),
    host: toText(raw?.host),
    seatGrades: Array.isArray(raw?.seatGrades) ? raw.seatGrades.map(mapSeatGrade) : [],
  }
}
