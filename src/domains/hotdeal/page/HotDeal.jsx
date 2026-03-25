import { useState, useEffect, useActionState } from "react"
import { useQueryClient } from "@tanstack/react-query"
import { AlertCircle, Check } from "lucide-react"
import { Link } from "react-router"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { createHotDealAction } from "../actions/createHotDealAction.js"
import { hotDealKeys, useHotDealsQuery } from "../hook/useHotDealQuery.js"
import { useSellerProductsQuery } from "@/domains/items/hook/useItemsQuery.js"
import HotDealFormFields from "@/components/hotdeal/HotDealFormFields.jsx"
import PageIntro from "@/components/layout/PageIntro.jsx"

const numberFormatter = new Intl.NumberFormat("ko-KR")

function HotDealList() {
  const { data, isLoading } = useHotDealsQuery()
  const hotDeals = data?.items ?? []

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2].map((i) => (
          <div key={i} className="animate-pulse rounded-[1.6rem] bg-muted h-28" />
        ))}
      </div>
    )
  }

  if (hotDeals.length === 0) {
    return (
      <div className="rounded-[1.8rem] border border-dashed border-border px-6 py-10 text-center">
        <AlertCircle size={24} className="mx-auto text-primary/70" />
        <h3 className="mt-4 text-lg font-semibold text-foreground">현재 진행 중인 핫딜이 없습니다</h3>
        <p className="mt-2 text-sm text-muted-foreground">아래 폼에서 새 핫딜을 추가할 수 있습니다.</p>
      </div>
    )
  }

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      {hotDeals.map((hotDeal) => (
        <div key={hotDeal.id} className="metric-chip rounded-[1.6rem] px-5 py-5">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="truncate text-base font-semibold text-foreground">{hotDeal.title}</p>
              <div className="mt-2 flex flex-wrap gap-2">
                <Badge variant="default">{hotDeal.status}</Badge>
                <Badge variant="outline">{hotDeal.discountRate}% 할인</Badge>
              </div>
            </div>
            <div className="text-right">
              <p className="text-[0.72rem] uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
                할인가
              </p>
              <p className="mt-1 text-sm font-semibold text-primary">{hotDeal.discountedPriceText}</p>
            </div>
          </div>

          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            <div>
              <p className="text-[0.72rem] uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
                판매 수량
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                {hotDeal.soldQuantity} / {hotDeal.maxQuantity}개
              </p>
            </div>
            <div>
              <p className="text-[0.72rem] uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
                진행률
              </p>
              <p className="mt-1 text-sm text-muted-foreground">{hotDeal.progressRate}%</p>
            </div>
            <div>
              <p className="text-[0.72rem] uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
                종료
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                {hotDeal.endAt ? String(hotDeal.endAt).replace("T", " ").slice(0, 16) : "-"}
              </p>
            </div>
          </div>

          <div className="mt-5 flex flex-wrap gap-2">
            <Button asChild size="sm" variant="outline">
              <Link to={`/business/hotdeal/${hotDeal.id}`}>상세 보기</Link>
            </Button>
          </div>
        </div>
      ))}
    </div>
  )
}

function HotDealForm({ onReset }) {
  const [itemId, setItemId] = useState("")
  const [discountRate, setDiscountRate] = useState("10")
  const queryClient = useQueryClient()

  const [state, formAction, isPending] = useActionState(createHotDealAction, {})
  const { data: productsPayload } = useSellerProductsQuery()
  const products = productsPayload?.items ?? []

  useEffect(() => {
    if (state.success) {
      queryClient.invalidateQueries({ queryKey: hotDealKeys.all })
    }
  }, [state.success, queryClient])

  if (state.success) {
    return (
      <div className="mx-auto flex min-h-[60vh] max-w-xl items-center justify-center">
        <div className="glass-panel surface-hero flex w-full flex-col items-center gap-4 rounded-[2rem] px-8 py-12 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/12">
            <Check size={32} className="text-primary" />
          </div>
          <h2 className="display-title text-3xl font-semibold">핫딜 등록 완료!</h2>
          <p className="max-w-md text-sm leading-6 text-muted-foreground">
            핫딜이 성공적으로 등록되었습니다.
          </p>
          <Button onClick={onReset}>다시 등록하기</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <PageIntro
        eyebrow="Hot Deal Management"
        title="핫딜 관리"
        description="한정 수량과 할인율을 중심으로 프로모션을 운영하는 화면입니다."
        meta={[`할인율 ${discountRate}%`, `연결 가능한 상품 ${products.length}개`]}
      >
        <div className="metric-chip rounded-[1.75rem] px-5 py-5">
          <p className="text-[0.72rem] font-semibold uppercase tracking-[0.22em] text-slate-500 dark:text-slate-400">
            Promotion bias
          </p>
          <p className="mt-3 text-lg font-semibold text-foreground">강한 가격 자극과 한정 수량</p>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            즉시성 있는 판매 이벤트에 맞춰 핵심 필드만 전면에 배치했습니다.
          </p>
        </div>
      </PageIntro>

      <Card className="overflow-hidden">
        <div className="border-b border-white/70 px-6 py-5 dark:border-slate-800">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="section-kicker">Current hot deals</p>
              <h2 className="display-title mt-2 text-2xl text-foreground">진행 중인 핫딜</h2>
              <p className="mt-2 text-sm text-muted-foreground">현재 ACTIVE 상태인 핫딜 목록입니다.</p>
            </div>
          </div>
        </div>
        <CardContent className="p-6">
          <HotDealList />
        </CardContent>
      </Card>

      <Card className="overflow-hidden">
        <div className="border-b border-white/70 px-6 py-5 dark:border-slate-800">
          <p className="section-kicker">Create hot deal</p>
          <h2 className="display-title mt-2 text-2xl text-foreground">새 핫딜 등록</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            새로운 한정 특가 이벤트를 추가합니다.
          </p>
        </div>
        <div className="px-6 py-6">
          <HotDealFormFields
            state={state}
            formAction={formAction}
            isPending={isPending}
            itemId={itemId}
            setItemId={setItemId}
            discountRate={discountRate}
            setDiscountRate={setDiscountRate}
            products={products}
          />
        </div>
      </Card>
    </div>
  )
}

export default function HotDealPage() {
  const [formKey, setFormKey] = useState(0)
  return <HotDealForm key={formKey} onReset={() => setFormKey((k) => k + 1)} />
}
