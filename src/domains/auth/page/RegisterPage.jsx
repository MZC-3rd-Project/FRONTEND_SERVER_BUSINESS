import { useActionState, useEffect } from "react"
import { Link, useNavigate } from "react-router"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {registerAction} from "@/domains/auth/actions/RegisterAction.js";


export default function RegisterPage() {
    const navigate = useNavigate()
    const [state, formAction, isPending] = useActionState(registerAction, {})

    useEffect(() => {
        if (state.success) {
            navigate("/auth/login")
        }
    }, [state.success, navigate])

    return (
        <div className="min-h-screen flex items-center justify-center px-4 py-12">
            <div className="w-full max-w-sm">

                {/* 타이틀 영역 */}
                <div className="mb-8 text-center">
                    <h1 className="text-2xl font-bold text-foreground tracking-tight">
                        회원가입
                    </h1>
                    <p className="mt-2 text-sm text-muted-foreground">
                        계정을 만들고 서비스를 시작하세요.
                    </p>
                </div>

                {/* 폼 카드 */}
                <div className="bg-card border border-border rounded-xl p-6 space-y-5">

                    {/* 서버 에러 알림 */}
                    {state.errors?._form && (
                        <Alert variant="destructive">
                            <AlertDescription>{state.errors._form[0]}</AlertDescription>
                        </Alert>
                    )}

                    <form action={formAction} className="space-y-4">

                        {/* 이름 */}
                        <div className="space-y-1.5">
                            <Label htmlFor="name">이름</Label>
                            <Input
                                className="placeholder:opacity-20"
                                id="name"
                                name="name"
                                type="text"
                                placeholder="홍길동"
                                autoComplete="name"
                                aria-describedby={state.errors?.name ? "name-error" : undefined}
                            />
                            {state.errors?.name && (
                                <p id="name-error" className="text-xs text-destructive font-medium">
                                    {state.errors.name[0]}
                                </p>
                            )}
                        </div>

                        {/* 이메일 */}
                        <div className="space-y-1.5">
                            <Label htmlFor="email">이메일</Label>
                            <Input
                                className="placeholder:opacity-20"
                                id="email"
                                name="email"
                                type="email"
                                placeholder="name@example.com"
                                autoComplete="email"
                                aria-describedby={state.errors?.email ? "email-error" : undefined}
                            />
                            {state.errors?.email && (
                                <p id="email-error" className="text-xs text-destructive font-medium">
                                    {state.errors.email[0]}
                                </p>
                            )}
                        </div>

                        {/* 비밀번호 */}
                        <div className="space-y-1.5">
                            <Label htmlFor="password">비밀번호</Label>
                            <Input
                                className="placeholder:opacity-20"
                                id="password"
                                name="password"
                                type="password"
                                placeholder="8자 이상, 대문자·숫자 포함"
                                autoComplete="new-password"
                                aria-describedby={state.errors?.password ? "password-error" : undefined}
                            />
                            {state.errors?.password && (
                                <p id="password-error" className="text-xs text-destructive font-medium">
                                    {state.errors.password[0]}
                                </p>
                            )}
                        </div>

                        {/* 비밀번호 확인 */}
                        <div className="space-y-1.5">
                            <Label htmlFor="passwordConfirm">비밀번호 확인</Label>
                            <Input
                                className="placeholder:opacity-20"
                                id="passwordConfirm"
                                name="passwordConfirm"
                                type="password"
                                placeholder="비밀번호를 한 번 더 입력하세요"
                                autoComplete="new-password"
                                aria-describedby={state.errors?.passwordConfirm ? "passwordConfirm-error" : undefined}
                            />
                            {state.errors?.passwordConfirm && (
                                <p id="passwordConfirm-error" className="text-xs text-destructive font-medium">
                                    {state.errors.passwordConfirm[0]}
                                </p>
                            )}
                        </div>

                        {/* 제출 버튼 */}
                        <Button type="submit" className="w-full" disabled={isPending}>
                            {isPending ? "가입 중..." : "회원가입"}
                        </Button>
                    </form>
                </div>

                {/* 로그인 링크 */}
                <p className="mt-5 text-center text-sm text-muted-foreground">
                    이미 계정이 있으신가요?{" "}
                    <Link
                        to="/auth/login"
                        className="text-primary font-medium hover:underline underline-offset-4 transition-colors"
                    >
                        로그인
                    </Link>
                </p>

            </div>
        </div>
    )
}