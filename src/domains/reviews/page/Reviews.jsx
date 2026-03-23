import { useMemo, useState } from "react"
import { MessageSquareQuote, Star } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import PageIntro from "@/components/layout/PageIntro.jsx"
import { useSellerProductsQuery } from "@/domains/items/hook/useItemsQuery.js"
import { useItemReviewsQuery } from "@/domains/reviews/hook/useReviewQuery.js"
import { demoItems, demoReviewsByItemId } from "@/domains/management/mock/demoData.js"
import { cn } from "@/lib/utils"

function formatDate(value) {
  if (!value) return "-"
  return value.replace("T", " ").slice(0, 16)
}

function renderStars(rating = 0) {
  const safe = Math.max(0, Math.min(5, Number(rating) || 0))
  return "★".repeat(Math.round(safe)) + "☆".repeat(5 - Math.round(safe))
}

export default function ReviewsPage() {
  const [selectedItemId, setSelectedItemId] = useState("")
  const { data: productsPayload } = useSellerProductsQuery()
  const items = productsPayload?.items ?? []
  const usingDemoReviews = import.meta.env.DEV && items.length === 0
  const sourceItems = usingDemoReviews ? demoItems : items
  const reviewEnabledItems = sourceItems.filter((item) => (item?.reviewCount ?? 0) > 0)
  const activeItemId = reviewEnabledItems.some((item) => String(item.id) === String(selectedItemId))
    ? String(selectedItemId)
    : String(reviewEnabledItems[0]?.id ?? "")
  const selectedItem = reviewEnabledItems.find((item) => String(item.id) === activeItemId) ?? null
  const reviewsQuery = useItemReviewsQuery(activeItemId, { page: 0, size: 20 })
  const reviews = useMemo(() => {
    if (usingDemoReviews) {
      return demoReviewsByItemId[activeItemId] ?? []
    }
    return reviewsQuery.data?.content ?? []
  }, [activeItemId, reviewsQuery.data?.content, usingDemoReviews])

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <PageIntro
        eyebrow="Review Management"
        title="리뷰 관리"
        description="내 상품에 달린 리뷰를 한곳에서 확인하는 화면입니다. 상품별 평점과 리뷰 수를 먼저 보고, 선택한 상품의 상세 리뷰를 오른쪽에서 확인할 수 있습니다."
        meta={[
          `${reviewEnabledItems.length}개 리뷰 대상 상품`,
          selectedItem ? `${selectedItem.reviewCount ?? 0}개 리뷰` : "상품 선택 필요",
          usingDemoReviews ? "데모 데이터" : "실데이터",
        ]}
      >
        <div className="metric-chip rounded-[1.75rem] px-5 py-5">
          <p className="text-[0.72rem] font-semibold uppercase tracking-[0.22em] text-slate-500 dark:text-slate-400">
            Review focus
          </p>
          <p className="mt-3 text-lg font-semibold text-foreground">
            상품별 리뷰 흐름 확인
          </p>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            seller 전용 리뷰 API가 없어도, 내 상품 기준으로 리뷰를 모아볼 수 있게 구성했습니다.
          </p>
        </div>
      </PageIntro>

      <div className="grid gap-6 xl:grid-cols-[20rem_minmax(0,1fr)]">
        <Card className="h-fit">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <p className="section-kicker">Items</p>
              {usingDemoReviews ? <Badge variant="outline">데모 데이터</Badge> : null}
            </div>
            <div className="mt-4 space-y-3">
              {reviewEnabledItems.length > 0 ? (
                reviewEnabledItems.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setSelectedItemId(String(item.id))}
                    className={cn(
                      "metric-chip w-full rounded-[1.4rem] px-4 py-4 text-left transition-all",
                      String(item.id) === activeItemId &&
                        "border-primary/25 ring-2 ring-primary/12"
                    )}
                  >
                    <p className="truncate text-sm font-semibold text-foreground">
                      {item.title}
                    </p>
                    <div className="mt-2 flex items-center justify-between text-sm">
                      <span className="text-amber-500">{renderStars(item.averageRating)}</span>
                      <span className="text-muted-foreground">{item.reviewCount ?? 0}개</span>
                    </div>
                  </button>
                ))
              ) : (
                <div className="rounded-[1.5rem] border border-dashed border-border px-4 py-8 text-center">
                  <MessageSquareQuote size={20} className="mx-auto text-primary/70" />
                  <p className="mt-3 text-sm text-muted-foreground">리뷰가 달린 상품이 없습니다.</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="overflow-hidden">
          <div className="border-b border-white/70 px-6 py-5 dark:border-slate-800">
            <p className="section-kicker">Collected reviews</p>
            <h2 className="display-title mt-2 text-2xl text-foreground">
              {selectedItem ? selectedItem.title : "리뷰 상세"}
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              {selectedItem
                ? `평점 ${selectedItem.averageRating ?? 0} / 리뷰 ${selectedItem.reviewCount ?? 0}개`
                : "왼쪽에서 상품을 선택하면 리뷰를 확인할 수 있습니다."}
            </p>
          </div>

          <CardContent className="p-6">
            {!selectedItem ? (
              <div className="rounded-[1.8rem] border border-dashed border-border px-6 py-10 text-center">
                <Star size={24} className="mx-auto text-primary/70" />
                <p className="mt-3 text-sm text-muted-foreground">상품을 선택해주세요.</p>
              </div>
            ) : reviewsQuery.isLoading && !usingDemoReviews ? (
              <div className="rounded-[1.8rem] border border-dashed border-border px-6 py-10 text-center text-sm text-muted-foreground">
                리뷰를 불러오는 중입니다.
              </div>
            ) : reviews.length > 0 ? (
              <div className="space-y-4">
                {reviews.map((review) => (
                  <div key={review.id} className="metric-chip rounded-[1.55rem] px-5 py-5">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <p className="text-sm font-semibold text-foreground">
                          {review.title || "제목 없음"}
                        </p>
                        <p className="mt-1 text-[0.82rem] text-muted-foreground">
                          회원 #{review.userId} · {formatDate(review.createdAt)}
                        </p>
                      </div>
                      <Badge variant="outline">{renderStars(review.rating)}</Badge>
                    </div>

                    <p className="mt-4 text-sm leading-6 text-muted-foreground">
                      {review.content || "리뷰 내용이 없습니다."}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-[1.8rem] border border-dashed border-border px-6 py-10 text-center">
                <MessageSquareQuote size={24} className="mx-auto text-primary/70" />
                <p className="mt-3 text-sm text-muted-foreground">
                  선택한 상품의 리뷰가 없습니다.
                </p>
              </div>
            )}

            {reviewsQuery.isError && !usingDemoReviews ? (
              <div className="mt-4">
                <Button variant="outline" size="sm" onClick={() => reviewsQuery.refetch()}>
                  다시 불러오기
                </Button>
              </div>
            ) : null}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
