import { z } from "zod"

export const goodsSchema = z.object({
  itemType: z.literal("goods"),
  name: z.string().min(1, "아이템명을 입력해주세요."),
  categoryId: z.string().min(1, "카테고리를 선택해주세요."),
  price: z.coerce
    .number({ invalid_type_error: "올바른 가격을 입력해주세요." })
    .int()
    .min(1, "가격은 1원 이상이어야 합니다."),
  stock: z.coerce
    .number({ invalid_type_error: "재고를 입력해주세요." })
    .int()
    .min(0, "재고는 0 이상이어야 합니다."),
  description: z.string().optional(),
})

export const performanceSchema = z.object({
  itemType: z.literal("performance"),
  name: z.string().min(1, "공연명을 입력해주세요."),
  categoryId: z.string().min(1, "카테고리를 선택해주세요."),
  price: z.coerce
    .number({ invalid_type_error: "올바른 가격을 입력해주세요." })
    .int()
    .min(1, "가격은 1원 이상이어야 합니다."),
  venue: z.string().min(1, "공연 장소를 입력해주세요."),
  venueAddress: z.string().optional(),
  performanceDate: z.string().min(1, "공연 날짜를 선택해주세요."),
  performanceTime: z.string().min(1, "공연 시간을 입력해주세요."),
  totalSeats: z.coerce
    .number({ invalid_type_error: "총 좌석 수를 입력해주세요." })
    .int()
    .min(1, "좌석은 1석 이상이어야 합니다."),
  runningTimeMinutes: z.coerce.number().int().min(1).optional().or(z.literal("")),
  ageLimit: z.string().optional(),
  bookingNotice: z.string().optional(),
  organizer: z.string().optional(),
  host: z.string().optional(),
  gradeName: z.string().min(1, "좌석 등급명을 입력해주세요."),
  gradePrice: z.coerce
    .number({ invalid_type_error: "좌석 가격을 입력해주세요." })
    .int()
    .min(0),
  description: z.string().optional(),
})
