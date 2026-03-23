import { useEffect, useState } from "react"
import { useActionState } from "react"
import { useQueryClient } from "@tanstack/react-query"
import { AlertCircle, Check, Music, ShoppingBag, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { createItemAction } from "../actions/createItemAction.js"
import { itemKeys, useCategoriesQuery, useMyStoreQuery, useSellerProductsQuery } from "../hook/useItemsQuery.js"
import { useDeleteItemMutation, useToggleStatusMutation } from "../hook/useItemMutations.js"
import GoodsForm from "@/components/items/GoodsForm.jsx"
import PerformanceForm from "@/components/items/PerformanceForm.jsx"
import PageIntro from "@/components/layout/PageIntro.jsx"
import { demoItems } from "@/domains/management/mock/demoData.js"
import { cn } from "@/lib/utils"

const numberFormatter = new Intl.NumberFormat("ko-KR")

const ITEM_TYPE_META = {
  GOODS: "굿즈",
  PERFORMANCE: "공연",
}

const ITEM_STATUS_META = {
  DRAFT: { label: "초안", variant: "outline" },
  FUNDING: { label: "펀딩 진행", variant: "secondary" },
  FUNDED: { label: "펀딩 성공", variant: "secondary" },
  FUND_FAILED: { label: "펀딩 실패", variant: "destructive" },
  ON_SALE: { label: "판매 중", variant: "default" },
  HOT_DEAL: { label: "핫딜 진행", variant: "default" },
  HIDDEN: { label: "숨김", variant: "outline" },
  SOLD_OUT: { label: "품절", variant: "secondary" },
  CLOSED: { label: "종료", variant: "outline" },
}

function flattenTree(node) {
  return [
    { id: node.id, name: node.name },
    ...(node.children ?? []).flatMap((c) => flattenTree(c)),
  ]
}

function getItemTitle(item) {
  return item?.title ?? item?.name ?? `상품 #${item?.id ?? "-"}`
}

function getItemType(item) {
  return item?.itemType ?? item?.type ?? "GOODS"
}

function getItemStatus(item) {
  return item?.status ?? "DRAFT"
}

function getItemStatusMeta(status) {
  return ITEM_STATUS_META[status] ?? { label: status, variant: "outline" }
}

function getItemTypeLabel(item) {
  const type = getItemType(item)
  return ITEM_TYPE_META[type] ?? type
}

function getNextItemStatus(status) {
  if (status === "ON_SALE") return "HIDDEN"
  if (status === "HIDDEN" || status === "DRAFT") return "ON_SALE"
  return null
}

export default function ItemsPage() {
  const [formKey, setFormKey] = useState(0)
  return <ItemsForm key={formKey} onReset={() => setFormKey((value) => value + 1)} />
}

function ItemsForm({ onReset }) {
  const [itemType, setItemType] = useState("goods")
  const [goodsCategoryId, setGoodsCategoryId] = useState("")
  const [perfCategoryId, setPerfCategoryId] = useState("")
  const queryClient = useQueryClient()

  const [state, formAction, isPending] = useActionState(createItemAction, {});

  const { data: categoryTree = [] } = useCategoriesQuery()
  const { data: myStore } = useMyStoreQuery()
  const { data: productsPayload } = useSellerProductsQuery()
  const items = productsPayload?.items ?? []
  const toggleStatusMutation = useToggleStatusMutation()
  const deleteItemMutation = useDeleteItemMutation()

  const perfNode = categoryTree.find((c) => c.name === "공연/티켓")
  const perfCategories = perfNode ? flattenTree(perfNode) : []
  const goodsCategories = categoryTree
    .filter((c) => c.name !== "공연/티켓")
    .flatMap((c) => flattenTree(c))
  const connectedStoreName = myStore?.store_name ?? myStore?.name ?? "스토어 연결 대기"
  const activeCategoryCount =
    itemType === "goods" ? goodsCategories.length : perfCategories.length
  const usingDemoItems = import.meta.env.DEV && items.length === 0
  const sourceItems = usingDemoItems ? demoItems : items
  const activeItems = sourceItems.filter((item) =>
    itemType === "goods" ? getItemType(item) === "GOODS" : getItemType(item) === "PERFORMANCE"
  )

  useEffect(() => {
    if (state.success) {
      queryClient.invalidateQueries({ queryKey: itemKeys.products() })
    }
  }, [queryClient, state.success])

  const handleToggleStatus = (item) => {
    const currentStatus = getItemStatus(item)
    const nextStatus = getNextItemStatus(currentStatus)
    if (!nextStatus) return

    toggleStatusMutation.mutate({ itemId: item.id, status: nextStatus })
  }

  const handleDelete = (item) => {
    if (!window.confirm(`"${getItemTitle(item)}" 상품을 삭제하시겠습니까?`)) {
      return
    }
    deleteItemMutation.mutate(item.id)
  }

  if (state.success) {
    return (
      <div className="mx-auto flex min-h-[60vh] max-w-xl items-center justify-center">
        <div className="glass-panel surface-hero flex w-full flex-col items-center gap-4 rounded-[2rem] px-8 py-12 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/12">
            <Check size={32} className="text-primary" />
          </div>
          <h2 className="display-title text-3xl font-semibold">아이템 등록 완료!</h2>
          <p className="max-w-md text-sm leading-6 text-muted-foreground">
            아이템이 성공적으로 등록되었습니다. 같은 셸 안에서 다음 상품도 이어서 바로 등록할 수 있습니다.
          </p>
          <Button onClick={onReset}>다시 등록하기</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <PageIntro
        eyebrow="Catalog Management"
        title="상품 관리"
        description="굿즈와 공연 상품을 하나의 인터페이스 안에서 관리하도록 재정렬했습니다. 기존 데이터 바인딩은 유지한 채, 등록과 운영을 한 화면 흐름으로 묶었습니다."
        meta={[
          itemType === "goods" ? "굿즈 모드" : "공연 모드",
          `카테고리 ${activeCategoryCount}개`,
          `${items.length}개 상품 관리 중`,
        ]}
      >
        <div className="metric-chip rounded-[1.75rem] px-5 py-5">
          <p className="text-[0.72rem] font-semibold uppercase tracking-[0.22em] text-slate-500 dark:text-slate-400">
            Store context
          </p>
          <p className="mt-3 text-lg font-semibold text-foreground">
            {connectedStoreName}
          </p>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            {itemType === "goods"
              ? "실물 상품의 가격, 재고, 설명을 중심으로 구성합니다."
              : "공연명, 장소, 일정, 좌석 등급을 한 번에 정리합니다."}
          </p>
        </div>
      </PageIntro>

      <Card className="overflow-hidden">
        <div className="flex flex-col gap-4 border-b border-white/70 px-6 py-5 dark:border-slate-800 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="section-kicker">Current inventory</p>
            <h2 className="display-title mt-2 text-2xl text-foreground">등록된 상품</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              현재 등록된 상품 상태를 먼저 확인하고, 필요한 경우 새 상품을 추가합니다.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {usingDemoItems ? <Badge variant="outline">데모 데이터</Badge> : null}
            <div className="metric-chip flex w-full max-w-md gap-2 rounded-full p-1.5">
              <button
                type="button"
                onClick={() => setItemType("goods")}
                className={cn(
                  "flex-1 rounded-full px-4 py-2.5 text-sm font-semibold transition-all",
                  itemType === "goods"
                    ? "bg-primary text-primary-foreground shadow-[0_12px_24px_rgba(29,161,242,0.18)]"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <span className="flex items-center justify-center gap-2">
                  <ShoppingBag size={15} /> 굿즈
                </span>
              </button>
              <button
                type="button"
                onClick={() => setItemType("performance")}
                className={cn(
                  "flex-1 rounded-full px-4 py-2.5 text-sm font-semibold transition-all",
                  itemType === "performance"
                    ? "bg-primary text-primary-foreground shadow-[0_12px_24px_rgba(29,161,242,0.18)]"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <span className="flex items-center justify-center gap-2">
                  <Music size={15} /> 공연
                </span>
              </button>
            </div>
          </div>
        </div>

        <CardContent className="p-6">
          {activeItems.length > 0 ? (
            <div className="grid gap-4 lg:grid-cols-2">
              {activeItems.map((item) => {
                const status = getItemStatus(item)
                const statusMeta = getItemStatusMeta(status)
                const nextStatus = getNextItemStatus(status)
                const busy =
                  !usingDemoItems &&
                  (toggleStatusMutation.isPending || deleteItemMutation.isPending)

                return (
                  <div key={item.id} className="metric-chip rounded-[1.6rem] px-5 py-5">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="truncate text-base font-semibold text-foreground">
                          {getItemTitle(item)}
                        </p>
                        <div className="mt-2 flex flex-wrap gap-2">
                          <Badge variant="outline">{getItemTypeLabel(item)}</Badge>
                          <Badge variant={statusMeta.variant}>{statusMeta.label}</Badge>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-xs uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
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
                          Reviews
                        </p>
                        <p className="mt-1 text-sm text-muted-foreground">
                          평점 {item?.averageRating ?? 0} / 리뷰 {item?.reviewCount ?? 0}개
                        </p>
                      </div>
                      <div>
                        <p className="text-[0.72rem] uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
                          Item ID
                        </p>
                        <p className="mt-1 text-sm text-muted-foreground">{item.id}</p>
                      </div>
                    </div>

                    <div className="mt-5 flex flex-wrap gap-2">
                      {nextStatus ? (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleToggleStatus(item)}
                          disabled={busy || usingDemoItems}
                        >
                          {status === "ON_SALE" ? "숨김 처리" : "판매 시작"}
                        </Button>
                      ) : null}
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleDelete(item)}
                        disabled={busy || usingDemoItems}
                      >
                        <Trash2 size={14} />
                        삭제
                      </Button>
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="rounded-[1.8rem] border border-dashed border-border px-6 py-10 text-center">
              <AlertCircle size={24} className="mx-auto text-primary/70" />
              <h3 className="mt-4 text-lg font-semibold text-foreground">
                아직 등록된 {itemType === "goods" ? "굿즈" : "공연"}가 없습니다
              </h3>
              <p className="mt-2 text-sm text-muted-foreground">
                아래 신규 등록 폼에서 바로 추가할 수 있습니다.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {!usingDemoItems && (toggleStatusMutation.isError || deleteItemMutation.isError) && (
        <Alert variant="destructive">
          <AlertDescription>
            상품 관리 요청에 실패했습니다. 잠시 후 다시 시도해주세요.
          </AlertDescription>
        </Alert>
      )}

      <Card className="overflow-hidden">
        <div className="flex flex-col gap-4 border-b border-white/70 px-6 py-5 dark:border-slate-800 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="section-kicker">Create inventory</p>
            <h2 className="display-title mt-2 text-2xl text-foreground">새 상품 등록</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              관리 목록에 없는 새 상품을 추가할 때만 이 폼을 사용합니다.
            </p>
          </div>
        </div>

        <div className="px-6 py-6">
          {itemType === "goods" && (
            <GoodsForm
              state={state}
              myStore={myStore}
              goodsCategoryId={goodsCategoryId}
              setGoodsCategoryId={setGoodsCategoryId}
              goodsCategories={goodsCategories}
              formAction={formAction}
              isPending={isPending}
            />
          )}
          {itemType === "performance" && (
            <PerformanceForm
              state={state}
              myStore={myStore}
              perfCategoryId={perfCategoryId}
              setPerfCategoryId={setPerfCategoryId}
              perfCategories={perfCategories}
              formAction={formAction}
              isPending={isPending}
            />
          )}
        </div>
      </Card>
    </div>
  )
}
