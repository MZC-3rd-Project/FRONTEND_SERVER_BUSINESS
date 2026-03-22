import { z } from "zod"


export const StoreSchema = z.object({
  storeName: z.string().min(1, "가게명을 입력해주세요.")
      .max(10,"최대 10자 이상은 입력할 수 없습니다."),
  address: z.string().min(1, "주소는 필수입니다."),
  addressType: z.enum(["MAIN", "PICKUP", "RETURN", "WAREHOUSE"]),
  contactValue: z.string().min(1, "연락처는 필수입니다."),
  contactType: z.enum(["PHONE", "EMAIL", "KAKAO", "SNS"]),
  description: z.string()
      .max(200,"200자 이내로 작성해주세요")
      .optional()
      .nullable(),
  images: z.array(z.object({
    imageType: z.string(),
    mediaId: z.number(),
    sortOrder: z.number(),
  })).optional(),
})
