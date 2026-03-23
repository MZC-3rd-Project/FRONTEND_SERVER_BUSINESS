import { useActionState, useEffect } from "react"
import { Link, useNavigate } from "react-router"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {registerAction} from "@/domains/auth/actions/RegisterAction.js";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";


export default function RegisterPage() {
    const navigate = useNavigate()
    const [state, formAction, isPending] = useActionState(registerAction, {})

    useEffect(() => {
        if (state.success) {
            navigate("/auth/login")
        }
    }, [state.success, navigate])

    return (
        <div className="reveal-up">
            <Card className="surface-hero overflow-hidden">
                <CardContent className="p-6 sm:p-8">
                    <Badge variant="outline">돈모아 회원가입</Badge>

                    <div className="mt-5 mb-8">
                        <h1 className="display-title text-4xl font-semibold text-foreground tracking-tight">
                            회원가입
                        </h1>
                        <p className="mt-3 text-sm leading-6 text-muted-foreground">
                            운영 계정을 만들고 판매 콘솔을 시작하세요.
                        </p>
                    </div>

                    {state.errors?._form && (
                        <Alert variant="destructive">
                            <AlertDescription>{state.errors._form[0]}</AlertDescription>
                        </Alert>
                    )}

                    <form action={formAction} className="mt-5 space-y-4">
                        <div className="space-y-1.5">
                            <Label htmlFor="name">이름</Label>
                            <Input
                                className="placeholder:opacity-40"
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

                        <div className="space-y-1.5">
                            <Label htmlFor="email">이메일</Label>
                            <Input
                                className="placeholder:opacity-40"
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

                        <div className="space-y-1.5">
                            <Label htmlFor="password">비밀번호</Label>
                            <Input
                                className="placeholder:opacity-40"
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

                        <div className="space-y-1.5">
                            <Label htmlFor="passwordConfirm">비밀번호 확인</Label>
                            <Input
                                className="placeholder:opacity-40"
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

                        <Button type="submit" className="w-full" disabled={isPending}>
                            {isPending ? "가입 중..." : "회원가입"}
                        </Button>
                    </form>

                    <p className="mt-6 text-center text-sm text-muted-foreground">
                        이미 계정이 있으신가요?{" "}
                        <Link
                            to="/auth/login"
                            className="text-primary font-medium hover:underline underline-offset-4 transition-colors"
                        >
                            로그인
                        </Link>
                    </p>
                </CardContent>
            </Card>
        </div>
    )
}
