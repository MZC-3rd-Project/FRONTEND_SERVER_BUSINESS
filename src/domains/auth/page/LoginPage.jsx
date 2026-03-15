import { useActionState, useEffect } from "react"
import { Link, useNavigate } from "react-router"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {loginAction} from "@/domains/auth/actions/loginAction.js";


export default function LoginPage() {
    const navigate = useNavigate()
    const [state, formAction, isPending] = useActionState(loginAction, {})

    useEffect(() => {
        if (state.success) {
            navigate("/")
        }
    }, [state.success, navigate])

    return (
        <div className="min-h-screen flex items-center justify-center px-4">
            <div className="w-full max-w-sm">

                {/* 로고 / 타이틀 영역 */}
                <div className="mb-8 text-center">
                    <h1 className="text-2xl font-bold text-foreground tracking-tight">
                        로그인
                    </h1>
                    <p className="mt-2 text-sm text-muted-foreground">
                        계정에 로그인하여 서비스를 이용하세요.
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

                        {/* 이메일 */}
                        <div className="space-y-1.5">
                            <Label htmlFor="email">이메일</Label>
                            <Input
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
                            <div className="flex items-center justify-between">
                                <Label htmlFor="password">비밀번호</Label>
                                <Link
                                    to="/auth/forgot-password"
                                    className="text-xs text-muted-foreground hover:text-primary transition-colors"
                                >
                                    비밀번호 찾기
                                </Link>
                            </div>
                            <Input
                                id="password"
                                name="password"
                                type="password"
                                placeholder="비밀번호를 입력하세요"
                                autoComplete="current-password"
                                aria-describedby={state.errors?.password ? "password-error" : undefined}
                            />
                            {state.errors?.password && (
                                <p id="password-error" className="text-xs text-destructive font-medium">
                                    {state.errors.password[0]}
                                </p>
                            )}
                        </div>

                        {/* 제출 버튼 */}
                        <Button type="submit" className="w-full" disabled={isPending}>
                            {isPending ? "로그인 중..." : "로그인"}
                        </Button>
                    </form>
                </div>

                {/* 회원가입 링크 */}
                <p className="mt-5 text-center text-sm text-muted-foreground">
                    계정이 없으신가요?{" "}
                    <Link
                        to="/auth/register"
                        className="text-primary font-medium hover:underline underline-offset-4 transition-colors"
                    >
                        회원가입
                    </Link>
                </p>

            </div>
        </div>
    )
}