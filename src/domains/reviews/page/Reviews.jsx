import { useState } from "react"
import { ChevronLeft, ChevronRight, MessageSquareQuote, Star } from "lucide-react"

import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import PageIntro from "@/components/layout/PageIntro.jsx"
import { useSellerProductsQuery } from "@/domains/items/hook/useItemsQuery.js"
import { useItemReviewsQuery } from "@/domains/reviews/hook/useReviewQuery.js"
import { cn } from "@/lib/utils"

function formatDate(value) {
  if (!value) return "-"
  return value.replace("T", " ").slice(0, 16)
}

function StarRating({ rating = 0 }) {
  const safe = Math.max(0, Math.min(5, Number(rating) || 0))
  const filled = Math.round(safe)
  return (
    <span className="text-amber-500">
      {"★".repeat(filled)}
      <span className="text-muted-foreground/40">{"★".repeat(5 - filled)}</span>
    </span>
  )
}

function ReviewList({ itemId }) {
  const [page, setPage] = useState(0)
  const pageSize = 10
  const { data, isLoading, isError, error, refetch } = useItemReviewsQuery(itemId, { page, size: pageSize })

  const reviews = data?.content ?? []
  const totalPages = data?.totalPages ?? 0
  const totalElements = data?.totalElements ?? 0

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="animate-pulse rounded-[1.55rem] bg-muted h-28" />
        ))}
      </div>
    )
  }

  if (isError) {
    return (
      <div className="space-y-3">
        <Alert variant="destructive">
          <AlertDescription>{error?.message ?? "리뷰를 불러오는 데 실패했습니다."}</AlertDescription>
        </Alert>
        <Button variant="outline" size="sm" onClick={() => refetch()}>
          다시 불러오기
        </Button>
      </div>
    )
  }

  if (reviews.length === 0) {
    return (
      <div className="rounded-[1.8rem] border border-dashed border-border px-6 py-10 text-center">
        <MessageSquareQuote size={24} className="mx-auto text-primary/70" />
        <p className="mt-3 text-sm text-muted-foreground">선택한 상품의 리뷰가 없습니다.</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <p className="text-xs text-muted-foreground">총 {totalElements}개 리뷰</p>

      {reviews.map((review) => (
        <div key={review.id} className="metric-chip rounded-[1.55rem] px-5 py-5">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-foreground">{review.title || "제목 없음"}</p>
              <p className="mt-1 text-[0.82rem] text-muted-foreground">
                회원 #{review.userId} · {formatDate(review.createdAt)}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <StarRating rating={review.rating} />
              <Badge variant="outline">{review.rating}점</Badge>
            </div>
          </div>
          <p className="mt-4 text-sm leading-6 text-muted-foreground">
            {review.content || "리뷰 내용이 없습니다."}
          </p>
          {review.images?.length > 0 && (
            <p className="mt-2 text-xs text-muted-foreground">이미지 {review.images.length}장 첨부</p>
          )}
        </div>
      ))}

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-2">
          <Button
            variant="outline"
            size="sm"
            disabled={page === 0}
            onClick={() => setPage((p) => p - 1)}
          >
            <ChevronLeft size={14} />
          </Button>
          <span className="text-sm text-muted-foreground">
            {page + 1} / {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={page >= totalPages - 1}
            onClick={() => setPage((p) => p + 1)}
          >
            <ChevronRight size={14} />
          </Button>
        </div>
      )}
    </div>
  )
}

export default function ReviewsPage() {
  const [selectedItemId, setSelectedItemId] = useState("")
  const { data: productsPayload, isLoading: itemsLoading } = useSellerProductsQuery()
  const items = productsPayload?.items ?? []

  const activeItemId = items.some((item) => String(item.id) === String(selectedItemId))
    ? String(selectedItemId)
    : String(items[0]?.id ?? "")

  const selectedItem = items.find((item) => String(item.id) === activeItemId) ?? null

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <PageIntro
        eyebrow="Review Management"
        title="리뷰 관리"
        description="내 상품에 달린 리뷰를 상품별로 확인하는 화면입니다."
        meta={[
          `${items.length}개 상품`,
          selectedItem ? `평점 ${selectedItem.averageRating ?? 0}` : "상품 선택 필요",
          selectedItem ? `리뷰 ${selectedItem.reviewCount ?? 0}개` : "",
        ]}
      >
        <div className="metric-chip rounded-[1.75rem] px-5 py-5">
          <p className="text-[0.72rem] font-semibold uppercase tracking-[0.22em] text-slate-500 dark:text-slate-400">
            Review focus
          </p>
          <p className="mt-3 text-lg font-semibold text-foreground">상품별 리뷰 흐름 확인</p>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            상품 목록에서 선택하면 해당 상품의 리뷰를 페이지별로 조회할 수 있습니다.
          </p>
        </div>
      </PageIntro>

      <div className="grid gap-6 xl:grid-cols-[20rem_minmax(0,1fr)]">
        <Card className="h-fit">
          <CardContent className="p-5">
            <p className="section-kicker">Items</p>
            <div className="mt-4 space-y-3">
              {itemsLoading ? (
                <div className="space-y-2">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="animate-pulse rounded-[1.4rem] bg-muted h-16" />
                  ))}
                </div>
              ) : items.length > 0 ? (
                items.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setSelectedItemId(String(item.id))}
                    className={cn(
                      "metric-chip w-full rounded-[1.4rem] px-4 py-4 text-left transition-all",
                      String(item.id) === activeItemId && "border-primary/25 ring-2 ring-primary/12"
                    )}
                  >
                    <p className="truncate text-sm font-semibold text-foreground">{item.title}</p>
                    <div className="mt-2 flex items-center justify-between text-sm">
                      <StarRating rating={item.averageRating} />
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
                ? `평점 ${selectedItem.averageRating ?? 0} · 리뷰 ${selectedItem.reviewCount ?? 0}개`
                : "왼쪽에서 상품을 선택하면 리뷰를 확인할 수 있습니다."}
            </p>
          </div>

          <CardContent className="p-6">
            {!selectedItem ? (
              <div className="rounded-[1.8rem] border border-dashed border-border px-6 py-10 text-center">
                <Star size={24} className="mx-auto text-primary/70" />
                <p className="mt-3 text-sm text-muted-foreground">상품을 선택해주세요.</p>
              </div>
            ) : (
              <ReviewList key={activeItemId} itemId={activeItemId} />
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
