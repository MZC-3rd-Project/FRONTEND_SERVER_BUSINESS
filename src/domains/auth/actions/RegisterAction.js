import {registerSchema} from "@/domains/auth/actions/schema/RegisterSchema.js";


export async function registerAction(prevState, formData) {
    const result = registerSchema.safeParse({
        name: formData.get("name"),
        email: formData.get("email"),
        password: formData.get("password"),
        passwordConfirm: formData.get("passwordConfirm"),
    })

    if (!result.success) {
        return {
            success: false,
            errors: result.error.flatten().fieldErrors,
        }
    }

    try {
        // TODO: 실제 API 호출로 교체
        // const { passwordConfirm, ...payload } = result.data
        // await api.post("/auth/register", payload)

        return { success: true }
        // eslint-disable-next-line no-unreachable
    } catch (error) {
        const status = error?.response?.status

        if (status === 409) {
            return {
                success: false,
                errors: { email: ["이미 사용 중인 이메일입니다."] },
            }
        }

        return {
            success: false,
            errors: { _form: ["회원가입에 실패했습니다. 잠시 후 다시 시도해주세요."] },
        }
    }
}