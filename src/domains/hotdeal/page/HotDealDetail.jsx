import { Link, useLocation, useParams } from "react-router"
import { Clock3, Percent, TicketPercent } from "lucide-react"

import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import PageIntro from "@/components/layout/PageIntro.jsx"
import { useHotDealQuery } from "@/domains/hotdeal/hook/useHotDealQuery.js"

function formatDateTime(value) {
  if (!value) return "-"
  return String(value).replace("T", " ").slice(0, 16)
}

export default function HotDealDetailPage() {
  const { hotDealId } = useParams()
  const location = useLocation()
  const hotDealFromState = location.state?.hotDeal ?? null
  const detailQuery = useHotDealQuery(location.state?.hotDealId ?? hotDealId)
  const hotDeal = detailQuery.data ?? hotDealFromState

  if (detailQuery.isLoading && !hotDeal) {
    return (
      <div className="mx-auto flex min-h-[40vh] max-w-3xl items-center justify-center">
        <div className="glass-panel rounded-[1.8rem] px-6 py-8 text-center text-sm text-muted-foreground">
          핫딜 상세를 불러오는 중입니다.
        </div>
      </div>
    )
  }

  if (!hotDeal) {
    return (
      <div className="mx-auto max-w-3xl">
        <Alert variant="destructive">
          <AlertDescription>
            핫딜 상세를 찾을 수 없습니다. 현재 백엔드에는 seller 전용 핫딜 수정 API가 없어, 목록에서 전달된 정보 기준으로만 상세를 보여줄 수 있습니다.
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <PageIntro
        eyebrow="Hot Deal Detail"
        title={hotDeal.title ?? "핫딜 상세"}
        description="핫딜 상세 확인 화면입니다. 현재 백엔드에는 seller 전용 수정/삭제 API가 확인되지 않아 읽기 중심으로 구성했습니다."
        meta={[
          hotDeal.status ?? "상태 미정",
          hotDeal.discountRate != null ? `${hotDeal.discountRate}% 할인` : "할인율 없음",
          hotDeal.discountedPriceText ?? "-",
        ]}
      >
        <div className="metric-chip rounded-[1.75rem] px-5 py-5">
          <p className="text-[0.72rem] font-semibold uppercase tracking-[0.22em] text-slate-500 dark:text-slate-400">
            Quick actions
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <Button asChild size="sm" variant="outline">
              <Link to="/business/hotdeal">목록으로</Link>
            </Button>
          </div>
        </div>
      </PageIntro>

      <Card>
        <CardContent className="p-6">
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <div className="metric-chip rounded-[1.5rem] px-4 py-4">
              <div className="flex items-center gap-2">
                <Percent size={16} className="text-primary" />
                <p className="text-sm font-semibold text-foreground">할인율</p>
              </div>
              <p className="mt-3 text-lg font-semibold text-foreground">
                {hotDeal.discountRate != null ? `${hotDeal.discountRate}%` : "-"}
              </p>
            </div>
            <div className="metric-chip rounded-[1.5rem] px-4 py-4">
              <div className="flex items-center gap-2">
                <TicketPercent size={16} className="text-primary" />
                <p className="text-sm font-semibold text-foreground">할인가</p>
              </div>
              <p className="mt-3 text-lg font-semibold text-foreground">
                {hotDeal.discountedPriceText ?? hotDeal.price ? `${hotDeal.price}원` : "-"}
              </p>
            </div>
            <div className="metric-chip rounded-[1.5rem] px-4 py-4">
              <div className="flex items-center gap-2">
                <Clock3 size={16} className="text-primary" />
                <p className="text-sm font-semibold text-foreground">종료 시각</p>
              </div>
              <p className="mt-3 text-sm font-semibold text-foreground">
                {formatDateTime(hotDeal.endAt)}
              </p>
            </div>
            <div className="metric-chip rounded-[1.5rem] px-4 py-4">
              <div className="flex items-center gap-2">
                <Badge variant="outline">{hotDeal.status ?? "상태 미정"}</Badge>
              </div>
              <p className="mt-3 text-sm font-semibold text-foreground">
                진행률 {hotDeal.progressRate ?? 0}%
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                판매 {hotDeal.soldQuantity ?? 0} / {hotDeal.maxQuantity ?? 0}
              </p>
            </div>
          </div>

          <Alert className="mt-6">
            <AlertDescription>
              seller 전용 핫딜 수정/삭제 API가 확인되지 않아 현재는 상세 확인만 제공합니다. 생성은 목록 화면에서 계속 할 수 있습니다.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    </div>
  )
}
