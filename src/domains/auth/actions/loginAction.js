import {LoginSchema} from "@/domains/auth/actions/schema/LoginSchema.js";


export async function loginAction(prevState, formData) {
    const result = LoginSchema.safeParse({
        username: formData.get("username"),
        password: formData.get("password"),
    })

    if (!result.success) {
        return {
            success: false,
            errors: result.error.flatten().fieldErrors,
        }
    }

    try {
        const body = new URLSearchParams({
            username: result.data.username,
            password: result.data.password,
        })

        const response = await fetch("/login", {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: body.toString(),
            credentials: "include",
        })

        // Spring Security 로그인 실패 시 /login?error 로 리다이렉트
        if (response.url.includes("error")) {
            return {
                success: false,
                errors: { _form: ["아이디 또는 비밀번호가 올바르지 않습니다."] },
            }
        }

        return { success: true }
    } catch (error) {
        return {
            success: false,
            errors: { _form: ["로그인 중 오류가 발생했습니다."] },
        }
    }
}