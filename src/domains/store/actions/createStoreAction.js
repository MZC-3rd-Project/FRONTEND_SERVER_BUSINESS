import {createStore} from "@/domains/store/api/storeApi.js";
import {StoreSchema} from "@/domains/store/actions/schema/StoreSchema.js";

export async function createStoreAction(prevState, formData) {
  const mainAddress = JSON.parse(formData.get("addresses") || "[]")[0]
  const mainContact = JSON.parse(formData.get("contacts") || "[]")[0]

  const result = StoreSchema.safeParse({
    storeName: formData.get("store_name"),
    address: mainAddress?.address,
    addressType: mainAddress?.address_type,
    contactValue: mainContact?.contact_value,
    contactType: mainContact?.contact_type,
    description: formData.get("description") || null,
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
      errors: { _form: [error?.response?.data?.message ?? "서버 오류가 발생했습니다."] },
    }
  }
}