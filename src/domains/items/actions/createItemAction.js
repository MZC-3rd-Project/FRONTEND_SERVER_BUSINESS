import { goodsSchema, performanceSchema } from "./schema/itemSchema.js"
import { createGoods, createPerformance } from "../api/itemsApi.js"

export async function createItemAction(prevState, formData) {
  const itemType = formData.get("itemType")
  const rawThumbnailMediaId = formData.get("thumbnailMediaId")
  const thumbnailMediaId = rawThumbnailMediaId ? Number(rawThumbnailMediaId) : undefined

  console.log(formData);

  if (itemType === "goods") {
    const storeId = formData.get("storeId")
    const result = goodsSchema.safeParse({
      itemType,
      name: formData.get("name"),
      categoryId: formData.get("categoryId"),
      price: formData.get("price"),
      stock: formData.get("stock"),
      description: formData.get("description"),
    })

    if (!result.success) {
      console.log("validation errors:", result.error.flatten().fieldErrors)
      return { success: false, errors: result.error.flatten().fieldErrors }
    }

    const { name, categoryId, price, stock, description } = result.data

    try {
      await createGoods({
        title: name,
        description,
        price,
        storeId,
        categoryId,
        thumbnailMediaId,
        options: [{ optionName: "기본", additionalPrice: 0, stockQuantity: stock }],
        shippingInfo: { shippingFee: 0, estimatedDays: 3 },
      })
      return { success: true }
    } catch (error) {
      const message = error?.response?.data?.error?.message ?? "굿즈 등록에 실패했습니다."
      return { success: false, errors: { _root: [message] } }
    }
  }

  if (itemType === "performance") {
    const storeId = formData.get("storeId")
    const result = performanceSchema.safeParse({
      itemType,
      name: formData.get("name"),
      categoryId: formData.get("categoryId"),
      price: formData.get("price"),
      venue: formData.get("venue"),
      venueAddress: formData.get("venueAddress"),
      performanceDate: formData.get("performanceDate"),
      performanceTime: formData.get("performanceTime"),
      totalSeats: formData.get("totalSeats"),
      runningTimeMinutes: formData.get("runningTimeMinutes") || undefined,
      ageLimit: formData.get("ageLimit"),
      bookingNotice: formData.get("bookingNotice"),
      organizer: formData.get("organizer"),
      host: formData.get("host"),
      gradeName: formData.get("gradeName"),
      gradePrice: formData.get("gradePrice"),
      description: formData.get("description"),
    })

    if (!result.success) {
      console.log("validation errors:", result.error.flatten().fieldErrors)
      return { success: false, errors: result.error.flatten().fieldErrors }
    }

    const {
      name, categoryId, price, venue, venueAddress, performanceDate, performanceTime,
      totalSeats, runningTimeMinutes, ageLimit, bookingNotice, organizer, host,
      gradeName, gradePrice, description,
    } = result.data
    console.log()
    try {
      await createPerformance({
        title: name,
        description,
        price,
        storeId,
        categoryId,
        thumbnailMediaId,
        venue,
        venueAddress,
        performanceDate,
        performanceTime,
        totalSeats,
        runningTimeMinutes: runningTimeMinutes || undefined,
        ageLimit,
        bookingNotice,
        organizer,
        host,
        seatGrades: [{ gradeName, price: gradePrice, totalQuantity: totalSeats, fundingQuantity: 0 }],
      })
      return { success: true }
    } catch (error) {
      const message = error?.response?.data?.message ?? "공연 등록에 실패했습니다."
      return { success: false, errors: { _root: [message] } }
    }
  }

  return { success: false, errors: { _root: ["아이템 유형을 선택해주세요."] } }
}
