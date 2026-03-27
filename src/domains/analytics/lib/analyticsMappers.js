const PERIOD_DAY_COUNT = {
  "7일": 7,
  "30일": 30,
  "90일": 90,
}

const STEP_LABELS = {
  SEARCH_EXECUTED: "검색 실행",
  SEARCH_ITEM_CLICKED: "상품 클릭",
  ORDER_CREATED_EVENT: "주문 생성",
  ORDER_PAID_EVENT: "결제 완료",
  ORDER_CANCELLED_EVENT: "주문 취소",
  ORDER_REFUNDED_EVENT: "환불 완료",
  FUNDING_CREATED: "펀딩 생성",
  FUNDING_PARTICIPATED: "펀딩 참여",
  FUNDING_SUCCEEDED: "펀딩 성공",
  FUNDING_FAILED: "펀딩 실패",
  HOT_DEAL_STARTED: "핫딜 시작",
  HOT_DEAL_PURCHASED: "핫딜 구매",
  HOT_DEAL_ENDED: "핫딜 종료",
}

const DOMAIN_LABELS = {
  NORMAL: "일반 판매",
  FUNDING: "펀딩",
  HOT_DEAL: "핫딜",
}

function toNumber(value, fallback = 0) {
  const number = Number(value)
  return Number.isFinite(number) ? number : fallback
}

function toText(value, fallback = "") {
  if (typeof value === "string" && value.trim()) {
    return value.trim()
  }

  return fallback
}

function toArray(value) {
  return Array.isArray(value) ? value : []
}

function formatDatePart(date) {
  const year = date.getFullYear()
  const month = `${date.getMonth() + 1}`.padStart(2, "0")
  const day = `${date.getDate()}`.padStart(2, "0")
  return `${year}-${month}-${day}`
}

function shiftDate(date, amount) {
  const next = new Date(date)
  next.setDate(next.getDate() + amount)
  return next
}

function translateLagStatus(status) {
  const normalized = toText(status, "HEALTHY").toUpperCase()
  return normalized === "DEGRADED" ? "지연 감지" : "정상"
}

function mapFunnelStep(raw = {}) {
  const step = toText(raw?.step)
  const label = STEP_LABELS[step] ?? step ?? "알 수 없음"
  return {
    step,
    label,
    count: toNumber(raw?.count),
  }
}

function mapFunnelDomain(raw = {}) {
  const domainType = toText(raw?.domainType)
  const label = DOMAIN_LABELS[domainType] ?? domainType ?? "미분류"
  return {
    domainType,
    label,
    entryCount: toNumber(raw?.entryCount),
    conversionCount: toNumber(raw?.conversionCount),
    conversionRate: toNumber(raw?.conversionRate),
    steps: toArray(raw?.steps).map(mapFunnelStep),
  }
}

export function getDashboardTimezone() {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || "Asia/Seoul"
  } catch {
    return "Asia/Seoul"
  }
}

export function buildSellerDashboardOverviewParams(period = "7일", now = new Date()) {
  const dayCount = PERIOD_DAY_COUNT[period] ?? PERIOD_DAY_COUNT["7일"]
  const to = formatDatePart(now)
  const from = formatDatePart(shiftDate(now, -(dayCount - 1)))

  return {
    mode: "RANGE",
    from,
    to,
    bucket: "DAY",
    timezone: getDashboardTimezone(),
  }
}

export function formatSeriesLabel(bucketStart) {
  const normalized = toText(bucketStart)
  if (/^\d{4}-\d{2}$/.test(normalized)) {
    const [, month] = normalized.split("-")
    return `${Number(month)}월`
  }

  if (/^\d{4}-\d{2}-\d{2}$/.test(normalized)) {
    const [, month, day] = normalized.split("-")
    return `${Number(month)}/${Number(day)}`
  }

  return normalized || "-"
}

export function mapSellerDashboardOverviewPayload(raw = {}) {
  const queryRange = raw?.queryRange ?? {}
  const sales = raw?.sales ?? {}
  const item = raw?.item ?? {}
  const search = raw?.search ?? {}
  const extensions = raw?.extensions ?? {}
  const review = extensions?.review ?? {}
  const funnel = extensions?.funnel ?? {}

  const grossSales = toNumber(sales?.grossSales)
  const netSales = toNumber(sales?.netSales)
  const orderCount = toNumber(sales?.orderCount)
  const onSaleCount = toNumber(item?.onSaleCount)
  const soldOutCount = toNumber(item?.soldOutCount)
  const hiddenCount = toNumber(item?.hiddenCount)
  const totalItemCount = onSaleCount + soldOutCount + hiddenCount

  const series = toArray(raw?.series).map((point) => ({
    bucketStart: toText(point?.bucketStart),
    label: formatSeriesLabel(point?.bucketStart),
    grossSales: toNumber(point?.grossSales),
    netSales: toNumber(point?.netSales),
    orderCount: toNumber(point?.orderCount),
  }))

  const salesFunnel = mapFunnelDomain(funnel?.sales)
  const fundingFunnel = mapFunnelDomain(funnel?.funding)
  const hotDealFunnel = mapFunnelDomain(funnel?.hotDeal)

  return {
    mode: toText(raw?.mode, "RANGE"),
    queryRange: {
      from: toText(queryRange?.from),
      to: toText(queryRange?.to),
      bucket: toText(queryRange?.bucket, "DAY"),
      timezone: toText(queryRange?.timezone, getDashboardTimezone()),
    },
    asOf: toText(raw?.asOf),
    lagStatus: toText(raw?.lagStatus, "HEALTHY"),
    lagStatusLabel: translateLagStatus(raw?.lagStatus),
    partial: Boolean(raw?.partial),
    apiVersion: toText(raw?.apiVersion, "v1"),
    sales: {
      grossSales,
      netSales,
      orderCount,
      cancelCount: toNumber(sales?.cancelCount),
      refundCount: toNumber(sales?.refundCount),
      averageOrderValue: orderCount > 0 ? Math.round(netSales / orderCount) : 0,
    },
    search: {
      searchCount: toNumber(search?.searchCount),
      clickCount: toNumber(search?.clickCount),
      ctr: toNumber(search?.ctr),
      ctrPercent: Number((toNumber(search?.ctr) * 100).toFixed(1)),
    },
    item: {
      onSaleCount,
      soldOutCount,
      hiddenCount,
      totalItemCount,
    },
    review: {
      reviewCount: toNumber(review?.reviewCount),
      reviewedItemCount: toNumber(review?.reviewedItemCount),
      averageRating: Number(toNumber(review?.averageRating).toFixed(2)),
    },
    series,
    itemMix: [
      { name: "판매중", value: onSaleCount },
      { name: "품절", value: soldOutCount },
      { name: "숨김", value: hiddenCount },
    ],
    salesFunnel,
    promotionFunnels: [fundingFunnel, hotDealFunnel],
  }
}
