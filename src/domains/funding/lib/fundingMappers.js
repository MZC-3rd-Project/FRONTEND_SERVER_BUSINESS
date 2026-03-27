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

function resolveThumbnailMediaId(raw = {}) {
  return toId(
    raw?.thumbnailMediaId
    ?? raw?.image?.thumbnail?.mediaId
    ?? raw?.images?.thumbnail?.mediaId
    ?? raw?.image?.thumbnail?.id
    ?? raw?.thumbnail?.mediaId
    ?? raw?.thumbnail?.id
  )
}

function resolveThumbnailUrl(raw = {}) {
  return toText(
    raw?.thumbnailUrl
    ?? raw?.image?.thumbnail?.mediaUrl
    ?? raw?.image?.thumbnail?.url
    ?? raw?.images?.thumbnail?.mediaUrl
    ?? raw?.images?.thumbnail?.url
    ?? raw?.thumbnail?.mediaUrl
    ?? raw?.thumbnail?.url
  )
}

function mapFundingStatus(status) {
  switch (String(status || "").toUpperCase()) {
    case "ACTIVE":
      return "진행 중"
    case "SUCCEEDED":
      return "달성 완료"
    case "FAILED":
      return "실패"
    case "CANCELLED":
      return "취소됨"
    default:
      return status ? String(status) : "상태 미정"
  }
}

function computeProgress(raw = {}) {
  const fundingType = toText(raw?.fundingType, "AMOUNT_BASED").toUpperCase()

  if (fundingType === "QUANTITY_BASED") {
    const current = toNumber(raw?.currentQuantity, 0)
    const goal = toNumber(raw?.goalQuantity, 0)
    const progressRate = goal > 0 ? Math.min(100, Math.round((current / goal) * 100)) : 0

    return {
      currentQuantity: current,
      goalQuantity: goal,
      progressRate,
      progressLabel: `${current.toLocaleString()} / ${goal.toLocaleString()}개`,
    }
  }

  const current = toNumber(raw?.currentAmount, 0)
  const goal = toNumber(raw?.goalAmount, 0)
  const progressRate = goal > 0 ? Math.min(100, Math.round((current / goal) * 100)) : 0

  return {
    currentAmount: current,
    goalAmount: goal,
    progressRate,
    progressLabel: `${formatPrice(current)} / ${formatPrice(goal)}`,
  }
}

function mapCampaign(raw = {}) {
  const fundingType = toText(raw?.fundingType, "AMOUNT_BASED").toUpperCase()
  const progress = computeProgress({ ...raw, fundingType })

  return {
    id: toId(raw?.campaignId ?? raw?.id),
    itemId: toId(raw?.itemId),
    sellerId: toId(raw?.sellerId),
    thumbnailMediaId: resolveThumbnailMediaId(raw),
    thumbnailUrl: resolveThumbnailUrl(raw),
    title: toText(raw?.title, "제목 없는 펀딩"),
    summary: toText(raw?.summary),
    makerName: toText(raw?.makerName, "메이커 정보 준비 중"),
    category: toText(raw?.category, "기타"),
    fundingType,
    statusCode: toText(raw?.status, "").toUpperCase(),
    status: mapFundingStatus(raw?.status),
    startAt: raw?.startAt ?? null,
    endAt: raw?.endAt ?? null,
    currentAmount: progress.currentAmount ?? toNullableNumber(raw?.currentAmount),
    currentAmountText: formatPrice(raw?.currentAmount),
    goalAmount: progress.goalAmount ?? toNullableNumber(raw?.goalAmount),
    goalAmountText: formatPrice(raw?.goalAmount),
    currentQuantity: progress.currentQuantity ?? toNullableNumber(raw?.currentQuantity),
    goalQuantity: progress.goalQuantity ?? toNullableNumber(raw?.goalQuantity),
    minAmount: toNullableNumber(raw?.minAmount),
    progressRate: progress.progressRate,
    progressLabel: progress.progressLabel,
    createdAt: raw?.createdAt ?? null,
    updatedAt: raw?.updatedAt ?? null,
    rewardOptions: Array.isArray(raw?.rewardOptions) ? raw.rewardOptions : [],
  }
}

export function mapFundingCampaignListPayload(payload) {
  const items = Array.isArray(payload?.items)
    ? payload.items
    : Array.isArray(payload?.content)
      ? payload.content
      : Array.isArray(payload)
        ? payload
        : []

  return {
    items: items.map(mapCampaign),
    nextCursor: payload?.nextCursor ?? null,
    hasNext: Boolean(payload?.hasNext ?? payload?.nextCursor),
    totalCount: payload?.totalCount ?? items.length,
  }
}

export function mapFundingCampaignPayload(payload) {
  if (!payload) {
    return null
  }

  return mapCampaign(payload)
}

export function mapFundingProgressPayload(payload = {}) {
  const progressRate = toNullableNumber(payload?.progressRate)

  return {
    currentAmount: toNullableNumber(payload?.currentAmount),
    goalAmount: toNullableNumber(payload?.goalAmount),
    currentQuantity: toNullableNumber(payload?.currentQuantity),
    goalQuantity: toNullableNumber(payload?.goalQuantity),
    progressRate: progressRate ?? 0,
  }
}
