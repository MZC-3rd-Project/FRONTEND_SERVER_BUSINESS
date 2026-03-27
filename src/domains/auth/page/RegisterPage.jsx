import { Link } from "react-router"

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

export default function RegisterPage() {
  return (
    <div className="reveal-up">
      <Card className="surface-hero overflow-hidden">
        <CardContent className="p-6 sm:p-8">
          <Badge variant="outline">돈모아 회원가입</Badge>

          <div className="mb-8 mt-5">
            <h1 className="display-title text-4xl font-semibold tracking-tight text-foreground">
              회원가입 안내
            </h1>
            <p className="mt-3 text-sm leading-6 text-muted-foreground">
              판매 콘솔 계정 생성은 프런트 폼이 아니라 게이트웨이와 Keycloak 인증 흐름을 통해
              처리되어야 합니다.
            </p>
          </div>

          <Alert>
            <AlertTitle>현재 변경 사항</AlertTitle>
            <AlertDescription>
              목업 회원가입 폼을 제거했습니다. 실제 계정 생성은 Keycloak 로그인 화면의 등록
              흐름 또는 운영자 계정 발급 절차에 맞춰 진행해주세요.
            </AlertDescription>
          </Alert>

          <div className="mt-5 space-y-3">
            <Button asChild className="w-full">
              <Link to="/auth/login">로그인 화면으로 이동</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
