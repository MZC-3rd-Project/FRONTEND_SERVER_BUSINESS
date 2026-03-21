import { campaignCreateSchema } from "./schema/fundingSchema.js"
import { createCampaign } from "../api/fundingApi.js"

export async function createCampaignAction(prevState, formData) {
  const result = campaignCreateSchema.safeParse({
    itemId: formData.get("itemId"),
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

  const { startAt, endAt, goalQuantity, minAmount, ...rest } = result.data

  try {
    await createCampaign({
      ...rest,
      ...(goalQuantity ? { goalQuantity } : {}),
      ...(minAmount ? { minAmount } : {}),
      startAt: `${startAt}T00:00:00`,
      endAt: `${endAt}T23:59:59`,
    })
    return { success: true }
  } catch (error) {
    const message = error?.response?.data?.message ?? "펀딩 캠페인 생성에 실패했습니다."
    return { success: false, errors: { _root: [message] } }
  }
}
