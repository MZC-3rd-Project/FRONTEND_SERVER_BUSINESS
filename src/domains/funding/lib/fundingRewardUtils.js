function normalizeId(value) {
  if (value === null || value === undefined) return ""
  const normalized = String(value).trim()
  return normalized
}

function toNumberish(value) {
  const normalized = normalizeId(value)
  if (!normalized) return undefined
  const parsed = Number(normalized)
  return Number.isFinite(parsed) ? parsed : normalized
}

function toTrimmedText(value, fallback = "") {
  if (typeof value !== "string") return fallback
  const trimmed = value.trim()
  return trimmed || fallback
}

export function buildDraftRewardOptionId() {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return `draft-${crypto.randomUUID()}`
  }

  return `draft-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}

export function dedupeItemIds(itemIds = []) {
  return [...new Set(itemIds.map(normalizeId).filter(Boolean))]
}

export function ensurePrimaryItemId(primaryItemId, itemIds = []) {
  const normalizedPrimary = normalizeId(primaryItemId)
  const normalizedItemIds = dedupeItemIds(itemIds)
  if (normalizedPrimary && normalizedItemIds.includes(normalizedPrimary)) {
    return normalizedPrimary
  }

  return normalizedItemIds[0] ?? ""
}

export function createDraftRewardOption(product, overrides = {}) {
  const itemId = normalizeId(overrides.itemId ?? product?.id)
  const defaultTitle =
    toTrimmedText(overrides.title)
    || toTrimmedText(product?.title)
    || toTrimmedText(product?.name)
    || "새 리워드"

  return {
    id: normalizeId(overrides.id) || buildDraftRewardOptionId(),
    itemId,
    title: defaultTitle,
    description: toTrimmedText(overrides.description),
    amount:
      overrides.amount != null
        ? String(overrides.amount)
        : product?.price != null
          ? String(product.price)
          : "",
    quantityLimit:
      overrides.quantityLimit != null
        ? String(overrides.quantityLimit)
        : overrides.maxQuantity != null
          ? String(overrides.maxQuantity)
          : "",
    sortOrder: Number.isFinite(Number(overrides.sortOrder)) ? Number(overrides.sortOrder) : 0,
  }
}

export function normalizeRewardOptionsForEditor(
  rewardOptions = [],
  selectedItemIds = [],
  productsById = {},
) {
  const normalizedSelected = dedupeItemIds(selectedItemIds)
  const baseOptions = Array.isArray(rewardOptions) && rewardOptions.length > 0
    ? rewardOptions.map((option, index) => {
        const fallbackItemId =
          normalizeId(option?.itemId)
          || normalizeId(option?.itemIds?.[0])
          || normalizedSelected[0]
        const product = productsById[fallbackItemId]

        return createDraftRewardOption(product, {
          id: option?.rewardOptionId ?? option?.id,
          itemId: fallbackItemId,
          title: option?.title ?? option?.label ?? option?.name,
          description: option?.description ?? option?.summary,
          amount: option?.amount ?? option?.price ?? option?.pledgeAmount,
          quantityLimit: option?.quantityLimit ?? option?.maxQuantity ?? option?.stockQuantity,
          sortOrder: option?.sortOrder ?? index,
        })
      })
    : normalizedSelected.map((itemId, index) =>
        createDraftRewardOption(productsById[itemId], {
          itemId,
          sortOrder: index,
        }),
      )

  return syncRewardOptionsWithSelectedItems(normalizedSelected, baseOptions, productsById)
}

export function syncRewardOptionsWithSelectedItems(
  selectedItemIds = [],
  rewardOptions = [],
  productsById = {},
) {
  const normalizedSelected = dedupeItemIds(selectedItemIds)
  const selectedSet = new Set(normalizedSelected)

  const preserved = rewardOptions
    .map((option) => createDraftRewardOption(productsById[normalizeId(option?.itemId)], option))
    .filter((option) => option.itemId && selectedSet.has(option.itemId))

  const representedItemIds = new Set(preserved.map((option) => option.itemId))

  normalizedSelected.forEach((itemId) => {
    if (!representedItemIds.has(itemId)) {
      preserved.push(
        createDraftRewardOption(productsById[itemId], {
          itemId,
          sortOrder: preserved.length,
        }),
      )
    }
  })

  return preserved.map((option, index) => ({
    ...option,
    sortOrder: index,
  }))
}

export function serializeRewardOptions(rewardOptions = []) {
  return JSON.stringify(
    rewardOptions.map((option, index) => ({
      id: normalizeId(option?.id),
      itemId: normalizeId(option?.itemId),
      title: toTrimmedText(option?.title),
      description: toTrimmedText(option?.description),
      amount: normalizeId(option?.amount),
      quantityLimit: normalizeId(option?.quantityLimit),
      sortOrder: index,
    })),
  )
}

export function toRewardOptionsPayload(rewardOptions = []) {
  return rewardOptions
    .map((option, index) => {
      const itemId = normalizeId(option?.itemId)
      if (!itemId) return null

      const title = toTrimmedText(option?.title)
      const description = toTrimmedText(option?.description)
      const amount = toNumberish(option?.amount)
      const quantityLimit = toNumberish(option?.quantityLimit)
      const rewardOptionId = normalizeId(option?.id)

      return {
        ...(rewardOptionId && !rewardOptionId.startsWith("draft-")
          ? { rewardOptionId: toNumberish(rewardOptionId) }
          : {}),
        itemId: toNumberish(itemId),
        itemIds: [toNumberish(itemId)],
        title: title || `리워드 ${index + 1}`,
        ...(description ? { description } : {}),
        ...(amount !== undefined ? { amount } : {}),
        ...(quantityLimit !== undefined ? { quantityLimit } : {}),
        sortOrder: index,
      }
    })
    .filter(Boolean)
}
