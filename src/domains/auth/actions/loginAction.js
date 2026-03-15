import {LoginSchema} from "@/domains/auth/actions/schema/LoginSchema.js";


export async function loginAction(prevState, formData) {
    const result = LoginSchema.safeParse({
        email: formData.get("email"),
        password: formData.get("password"),
    })

    if (!result.success) {
        return {
            success: false,
            errors: result.error.flatten().fieldErrors,
        }
    }

    try {
        // TODO: 실제 API 호출로 교체
        // const response = await api.post("/auth/login", result.data)
        // useAuthStore.getState().setUser(response.data.user)

        return { success: true }
    } catch (error) {
        return {
            success: false,
            errors: {
                _form: ["이메일 또는 비밀번호가 올바르지 않습니다."],
            },
        }
    }
}