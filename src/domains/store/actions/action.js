import {StoreSchema} from "@/domains/store/actions/schema/StoreSchema.js";
import {createStore} from "@/domains/store/api/storeApi.js";

export const submitAction = async (prevState, nativeFormData) => {
    const result = StoreSchema.safeParse({
        store_name: nativeFormData.get("store_name"),
        status: nativeFormData.get("status"),
        addresses: JSON.parse(nativeFormData.get("addresses") || "[]"),
        contacts: JSON.parse(nativeFormData.get("contacts") || "[]"),
        description: nativeFormData.get("description") || undefined,
    });

    if (!result.success) {
        return { success: false, errors: result.error.flatten().fieldErrors };
    }

    try {
        await createStore(result.data);
        return { success: true, errors: {} };
    } catch (error) {
        return {
            success: false,
            errors: { _form: [error?.response?.data?.message ?? "서버 오류가 발생했습니다."] },
        };
    }
};