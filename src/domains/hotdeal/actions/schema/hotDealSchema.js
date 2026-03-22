import { z } from "zod"

export const hotDealSchema = z.object({
  itemId: z.coerce
    .number({ invalid_type_error: "아이템을 선택해주세요." })
    .int()
    .min(1, "아이템을 선택해주세요."),
  discountRate: z.coerce
    .number({ invalid_type_error: "할인율을 입력해주세요." })
    .int()
    .min(1, "할인율은 1% 이상이어야 합니다.")
    .max(90, "할인율은 최대 90%입니다."),
  maxQuantity: z.coerce
    .number({ invalid_type_error: "최대 수량을 입력해주세요." })
    .int()
    .min(1, "최대 수량은 1개 이상이어야 합니다."),
  maxPerUser: z.coerce.number().int().min(1).optional().or(z.literal("")),
  startAt: z.string().optional(),
  endAt: z.string().optional(),
})
