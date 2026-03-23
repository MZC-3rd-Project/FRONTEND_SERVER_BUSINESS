import { useState, useEffect, useActionState } from "react"
import { useQueryClient } from "@tanstack/react-query"
import { AlertCircle, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { createHotDealAction } from "../actions/createHotDealAction.js"
import { hotDealKeys } from "../hook/useHotDealQuery.js"
import { useSellerProductsQuery } from "@/domains/items/hook/useItemsQuery.js"
import HotDealFormFields from "@/components/hotdeal/HotDealFormFields.jsx"
import PageIntro from "@/components/layout/PageIntro.jsx"
import { demoHotDealItems, demoItems } from "@/domains/management/mock/demoData.js"

const numberFormatter = new Intl.NumberFormat("ko-KR")

function HotDealForm({ onReset }) {
  const [itemId, setItemId] = useState("")
  const [discountRate, setDiscountRate] = useState("10")
  const queryClient = useQueryClient()

  const [state, formAction, isPending] = useActionState(createHotDealAction, {})
  const { data: productsPayload } = useSellerProductsQuery()
  const products = productsPayload?.items ?? []
  const usingDemoHotDeals = import.meta.env.DEV && products.length === 0
  const sourceProducts = usingDemoHotDeals ? demoItems : products
  const hotDealItems = usingDemoHotDeals
    ? demoHotDealItems
    : sourceProducts.filter((product) => product?.status === "HOT_DEAL")

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
            핫딜이 성공적으로 등록되었습니다. 가격 자극과 수량 제약을 같은 화면에서 즉시 조절할 수 있습니다.
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
        description="한정 수량과 할인율을 중심으로 프로모션을 운영하는 화면입니다. 가격 임팩트가 바로 읽히도록 핵심 지점을 앞으로 끌어왔습니다."
        meta={[
          `할인율 ${discountRate}%`,
          `연결 가능한 아이템 ${products.length}개`,
          `${hotDealItems.length}개 핫딜 운영 중`,
        ]}
      >
        <div className="metric-chip rounded-[1.75rem] px-5 py-5">
          <p className="text-[0.72rem] font-semibold uppercase tracking-[0.22em] text-slate-500 dark:text-slate-400">
            Promotion bias
          </p>
          <p className="mt-3 text-lg font-semibold text-foreground">
            강한 가격 자극과 한정 수량
          </p>
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
              <p className="mt-2 text-sm text-muted-foreground">
                현재 내 상품 중 핫딜 상태인 항목을 먼저 확인하고, 필요할 때만 새 핫딜을 추가합니다.
              </p>
            </div>
            <div className="flex items-center gap-2">
              {usingDemoHotDeals ? <Badge variant="outline">데모 데이터</Badge> : null}
              <Badge variant="outline">{hotDealItems.length}개 진행 중</Badge>
            </div>
          </div>
        </div>

        <CardContent className="p-6">
          {hotDealItems.length > 0 ? (
            <div className="grid gap-4 lg:grid-cols-2">
              {hotDealItems.map((item) => {
                return (
                  <div key={item.id} className="metric-chip rounded-[1.6rem] px-5 py-5">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="truncate text-base font-semibold text-foreground">
                          {item.title ?? `상품 #${item.id}`}
                        </p>
                        <div className="mt-2 flex flex-wrap gap-2">
                          <Badge variant="default">활성</Badge>
                          <Badge variant="outline">HOT_DEAL</Badge>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-[0.72rem] uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
                          Price
                        </p>
                        <p className="mt-1 text-sm font-semibold text-primary">
                          {item?.price ? `${numberFormatter.format(item.price)}원` : "-"}
                        </p>
                      </div>
                    </div>

                    <div className="mt-4 grid gap-3 sm:grid-cols-2">
                      <div>
                        <p className="text-[0.72rem] uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
                          유형
                        </p>
                        <p className="mt-1 text-sm text-muted-foreground">
                          {item?.itemType === "PERFORMANCE" ? "공연" : "굿즈"}
                        </p>
                      </div>
                      <div>
                        <p className="text-[0.72rem] uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
                          리뷰
                        </p>
                        <p className="mt-1 text-sm text-muted-foreground">
                          평점 {item?.averageRating ?? 0} / {item?.reviewCount ?? 0}개
                        </p>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="rounded-[1.8rem] border border-dashed border-border px-6 py-10 text-center">
              <AlertCircle size={24} className="mx-auto text-primary/70" />
              <h3 className="mt-4 text-lg font-semibold text-foreground">
                현재 진행 중인 핫딜이 없습니다
              </h3>
              <p className="mt-2 text-sm text-muted-foreground">
                아래 폼에서 새 핫딜을 추가할 수 있습니다.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="overflow-hidden">
        <div className="border-b border-white/70 px-6 py-5 dark:border-slate-800">
          <p className="section-kicker">Create hot deal</p>
          <h2 className="display-title mt-2 text-2xl text-foreground">새 핫딜 등록</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            현재 목록과 별도로 새로운 한정 특가 이벤트를 추가할 때 사용합니다.
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
            products={sourceProducts}
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
