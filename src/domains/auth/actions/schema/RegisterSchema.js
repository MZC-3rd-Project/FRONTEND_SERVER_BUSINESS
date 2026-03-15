import { z } from "zod"

export const registerSchema = z
    .object({
        name: z.string().min(1, "이름을 입력해주세요.").max(20, "이름은 20자 이하로 입력해주세요."),
        email: z
            .string()
            .min(1, "이메일을 입력해주세요.")
            .email("올바른 이메일 형식을 입력해주세요."),
        password: z
            .string()
            .min(1, "비밀번호를 입력해주세요.")
            .min(8, "비밀번호는 8자 이상이어야 합니다.")
            .regex(/[A-Z]/, "비밀번호에 대문자를 하나 이상 포함해주세요.")
            .regex(/[0-9]/, "비밀번호에 숫자를 하나 이상 포함해주세요."),
        passwordConfirm: z.string().min(1, "비밀번호 확인을 입력해주세요."),
    })
    .refine((data) => data.password === data.passwordConfirm, {
        message: "비밀번호가 일치하지 않습니다.",
        path: ["passwordConfirm"],
    })