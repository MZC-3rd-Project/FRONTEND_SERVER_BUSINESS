import { z } from "zod"

export const campaignCreateSchema = z.object({
  itemId: z.string().min(1, "아이템을 선택해주세요."),
  thumbnailMediaId: z.string().optional(),
  fundingType: z.enum(["QUANTITY_BASED", "AMOUNT_BASED"], {
    required_error: "펀딩 유형을 선택해주세요.",
  }),
  title: z.string().max(200).optional(),
  summary: z.string().max(5000).optional(),
  makerName: z.string().max(120).optional(),
  category: z.string().max(100).optional(),
  goalAmount: z.coerce
    .number({ invalid_type_error: "올바른 목표 금액을 입력해주세요." })
    .int()
    .min(4, "목표 금액은 1000원 이상이어야 합니다."),
  goalQuantity: z.coerce.number().int().min(1).optional().or(z.literal("")),
  minAmount: z.coerce.number().int().min(1).optional().or(z.literal("")),
  startAt: z.string().min(1, "시작일을 선택해주세요."),
  endAt: z.string().min(1, "종료일을 선택해주세요."),
}).refine(
    data => new Date(data.startAt) < new Date(data.endAt),
    {
      message: "종료일은 시작일보다 늦어야 합니다.",
      path: ["endAt"],  // 에러를 endAt 필드에 표시
    }
)
