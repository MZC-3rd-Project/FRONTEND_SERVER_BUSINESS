import {createStore} from "@/domains/store/api/storeApi.js";
import {StoreSchema} from "@/domains/store/actions/schema/StoreSchema.js";

export async function createStoreAction(prevState, formData) {
  const mainAddress = JSON.parse(formData.get("addresses") || "[]")[0]
  const mainContact = JSON.parse(formData.get("contacts") || "[]")[0]
  const thumbnail = JSON.parse(formData.get("thumbnail") || "null")
  const gallery = JSON.parse(formData.get("gallery") || "[]")
  const images = [
    thumbnail?.mediaId
      ? {
          imageType: "THUMBNAIL",
          mediaId: String(thumbnail.mediaId),
          sortOrder: 0,
        }
      : null,
    ...gallery
      .filter((image) => image?.mediaId)
      .map((image, index) => ({
        imageType: "GALLERY",
        mediaId: String(image.mediaId),
        sortOrder: index + 1,
      })),
  ].filter(Boolean)

  const result = StoreSchema.safeParse({
    storeName: formData.get("store_name"),
    address: mainAddress?.address,
    addressType: mainAddress?.address_type,
    contactValue: mainContact?.contact_value,
    contactType: mainContact?.contact_type,
    description: formData.get("description") || null,
    images: images.length > 0 ? images : undefined,
  })

  if (!result.success) {
    return { success: false, errors: result.error.flatten().fieldErrors }
  }

  try {
    await createStore(result.data)
    return { success: true, errors: {} }
  } catch (error) {
    return {
      success: false,
      errors: { _form: [error?.response?.data?.error?.message ?? "서버 오류가 발생했습니다."] },
    }
  }
}
