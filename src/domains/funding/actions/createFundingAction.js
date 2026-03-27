import { campaignCreateSchema } from "./schema/fundingSchema.js"
import { createCampaign } from "../api/fundingApi.js"
import {
  dedupeItemIds,
  ensurePrimaryItemId,
  toRewardOptionsPayload,
} from "@/domains/funding/lib/fundingRewardUtils.js"

function parseJsonArray(rawValue) {
  if (!rawValue || typeof rawValue !== "string") return []

  try {
    const parsed = JSON.parse(rawValue)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

export async function createCampaignAction(prevState, formData) {
  const selectedItemIds = dedupeItemIds(parseJsonArray(formData.get("itemIdsJson")))
  const primaryItemId = ensurePrimaryItemId(formData.get("itemId"), selectedItemIds)
  const rewardOptions = parseJsonArray(formData.get("rewardOptionsJson"))
  const normalizedRewardOptions = toRewardOptionsPayload(rewardOptions)

  const result = campaignCreateSchema.safeParse({
    itemId: primaryItemId,
    thumbnailMediaId: formData.get("thumbnailMediaId") || undefined,
    fundingType: formData.get("fundingType"),
    title: formData.get("title") || undefined,
    summary: formData.get("summary") || undefined,
    makerName: formData.get("makerName") || undefined,
    category: formData.get("category") || undefined,
    goalAmount: formData.get("goalAmount"),
    goalQuantity: formData.get("goalQuantity") || undefined,
    minAmount: formData.get("minAmount") || undefined,
    startAt: formData.get("startAt"),
    endAt: formData.get("endAt"),
  })

  if (!result.success) {
    return { success: false, errors: result.error.flatten().fieldErrors }
  }

  if (selectedItemIds.length === 0) {
    return { success: false, errors: { itemId: ["아이템을 1개 이상 선택해주세요."] } }
  }

  if (normalizedRewardOptions.length === 0) {
    return { success: false, errors: { _root: ["리워드 구성을 1개 이상 추가해주세요."] } }
  }

  const { startAt, endAt, goalQuantity, minAmount, thumbnailMediaId, ...rest } = result.data

  try {
    await createCampaign({
      ...rest,
      itemIds: selectedItemIds.map((itemId) => Number(itemId)),
      rewardOptions: normalizedRewardOptions,
      ...(thumbnailMediaId ? { thumbnailMediaId: String(thumbnailMediaId) } : {}),
      ...(goalQuantity ? { goalQuantity } : {}),
      ...(minAmount ? { minAmount } : {}),
      startAt: `${startAt}T00:00:00`,
      endAt: `${endAt}T23:59:59`,
    })
    return { success: true }
  } catch (error) {
    const message = error?.message ?? "펀딩 캠페인 생성에 실패했습니다."
    return { success: false, errors: { _root: [message] } }
  }
}
