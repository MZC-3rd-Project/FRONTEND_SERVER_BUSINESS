import { hotDealSchema } from "./schema/hotDealSchema.js"
import { createHotDeal } from "../api/hotDealApi.js"

export async function createHotDealAction(prevState, formData) {
  const result = hotDealSchema.safeParse({
    itemId: formData.get("itemId"),
    discountRate: formData.get("discountRate"),
    maxQuantity: formData.get("maxQuantity"),
    maxPerUser: formData.get("maxPerUser") || undefined,
    startAt: formData.get("startAt") || undefined,
    endAt: formData.get("endAt") || undefined,
  })

  if (!result.success) {
    return { success: false, errors: result.error.flatten().fieldErrors }
  }

  const { startAt, endAt, maxPerUser, ...rest } = result.data

  try {
    await createHotDeal({
      ...rest,
      ...(maxPerUser ? { maxPerUser } : {}),
      // datetime-local 값 "YYYY-MM-DDTHH:MM" → LocalDateTime "YYYY-MM-DDTHH:MM:SS"
      ...(startAt ? { startAt: `${startAt}:00` } : {}),
      ...(endAt ? { endAt: `${endAt}:00` } : {}),
    })
    return { success: true }
  } catch (error) {
    const message = error?.response?.data?.error?.message ?? "핫딜 등록에 실패했습니다."
    return { success: false, errors: { _root: [message] } }
  }
}
