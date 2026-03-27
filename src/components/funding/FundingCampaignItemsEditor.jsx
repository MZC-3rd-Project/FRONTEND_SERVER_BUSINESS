import { useMemo } from "react"
import { Layers3, Plus, Sparkles, Star, Trash2 } from "lucide-react"

import ItemThumbnail from "@/components/items/ItemThumbnail.jsx"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  createDraftRewardOption,
  ensurePrimaryItemId,
  syncRewardOptionsWithSelectedItems,
} from "@/domains/funding/lib/fundingRewardUtils.js"
import { cn } from "@/lib/utils"

function formatPrice(value) {
  const number = Number(value)
  if (!Number.isFinite(number)) return "-"
  return `${new Intl.NumberFormat("ko-KR").format(number)}원`
}

function FieldError({ errors, name }) {
  return errors?.[name] ? (
    <span className="text-xs font-medium text-destructive">{errors[name][0]}</span>
  ) : null
}

export default function FundingCampaignItemsEditor({
  products,
  selectedItemIds,
  setSelectedItemIds,
  primaryItemId,
  setPrimaryItemId,
  rewardOptions,
  setRewardOptions,
  errors,
  disabled = false,
}) {
  const productsById = useMemo(
    () =>
      Object.fromEntries(
        (products ?? []).map((product) => [String(product.id), product]),
      ),
    [products],
  )

  const selectedProducts = useMemo(
    () => selectedItemIds.map((itemId) => productsById[String(itemId)]).filter(Boolean),
    [productsById, selectedItemIds],
  )

  const primaryResolvedItemId = ensurePrimaryItemId(primaryItemId, selectedItemIds)

  const updateSelection = (nextSelectedItemIds, nextPrimaryItemId = primaryResolvedItemId) => {
    setSelectedItemIds(nextSelectedItemIds)
    setPrimaryItemId(ensurePrimaryItemId(nextPrimaryItemId, nextSelectedItemIds))
    setRewardOptions((prev) =>
      syncRewardOptionsWithSelectedItems(nextSelectedItemIds, prev, productsById),
    )
  }

  const toggleItem = (itemId) => {
    const normalizedItemId = String(itemId)
    const isSelected = selectedItemIds.includes(normalizedItemId)
    const nextSelectedItemIds = isSelected
      ? selectedItemIds.filter((currentItemId) => currentItemId !== normalizedItemId)
      : [...selectedItemIds, normalizedItemId]

    updateSelection(
      nextSelectedItemIds,
      isSelected && primaryResolvedItemId === normalizedItemId
        ? nextSelectedItemIds[0] ?? ""
        : primaryResolvedItemId || normalizedItemId,
    )
  }

  const addRewardOption = () => {
    const baseItemId = primaryResolvedItemId || selectedItemIds[0] || ""
    const product = productsById[baseItemId]

    setRewardOptions((prev) => [
      ...prev,
      createDraftRewardOption(product, {
        itemId: baseItemId,
        title: product?.title ? `${product.title} 리워드` : "",
        sortOrder: prev.length,
      }),
    ])
  }

  const updateRewardOption = (optionId, patch) => {
    setRewardOptions((prev) =>
      prev.map((option) =>
        option.id === optionId
          ? {
              ...option,
              ...patch,
            }
          : option,
      ),
    )
  }

  const removeRewardOption = (optionId) => {
    setRewardOptions((prev) =>
      prev
        .filter((option) => option.id !== optionId)
        .map((option, index) => ({
          ...option,
          sortOrder: index,
        })),
    )
  }

  return (
    <div className="space-y-5">
      <div className="space-y-2">
        <Label className="flex items-center gap-2">
          <Layers3 size={14} className="text-primary" />
          구성 아이템
          <span className="text-destructive">*</span>
        </Label>
        <p className="text-xs leading-5 text-muted-foreground">
          하나의 펀딩 안에 여러 상품을 묶을 수 있습니다. 선택한 상품 중 하나를 대표 아이템으로 지정하고,
          아래에서 리워드 구성을 세부적으로 정리하세요.
        </p>
        <FieldError errors={errors} name="itemId" />
      </div>

      <div className="grid gap-3 lg:grid-cols-2">
        {products.map((product) => {
          const itemId = String(product.id)
          const isSelected = selectedItemIds.includes(itemId)
          const isPrimary = primaryResolvedItemId === itemId

          return (
            <div
              key={itemId}
              role="button"
              tabIndex={disabled ? -1 : 0}
              aria-pressed={isSelected}
              onClick={() => {
                if (!disabled) toggleItem(itemId)
              }}
              onKeyDown={(event) => {
                if (disabled) return
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault()
                  toggleItem(itemId)
                }
              }}
              className={cn(
                "group cursor-pointer rounded-[1.5rem] border px-4 py-4 transition-all outline-none",
                isSelected
                  ? "border-primary/30 bg-primary/[0.05] shadow-[0_16px_34px_rgba(29,161,242,0.12)]"
                  : "border-border/70 bg-white/70 hover:border-primary/20 hover:bg-white/90 dark:bg-slate-950/24",
                disabled && "pointer-events-none opacity-60",
              )}
            >
              <div className="flex items-start gap-4">
                <ItemThumbnail
                  mediaId={product.thumbnailMediaId}
                  previewUrl={product.thumbnailUrl}
                  alt={product.title ?? product.name ?? `아이템 ${itemId}`}
                  className="h-20 w-20 shrink-0"
                  fallbackLabel="이미지 없음"
                />

                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-foreground">
                        {product.title ?? product.name ?? `아이템 #${itemId}`}
                      </p>
                      <div className="mt-2 flex flex-wrap gap-2">
                        <Badge variant="outline">{product.itemType === "PERFORMANCE" ? "공연" : "굿즈"}</Badge>
                        <Badge variant={isSelected ? "default" : "outline"}>
                          {isSelected ? "선택됨" : "선택 가능"}
                        </Badge>
                        {isPrimary ? <Badge variant="secondary">대표 아이템</Badge> : null}
                      </div>
                    </div>
                    <p className="text-xs font-semibold text-primary">{formatPrice(product.price)}</p>
                  </div>

                  <div className="mt-4 flex items-center justify-between gap-3">
                    <p className="text-xs text-muted-foreground">
                      리뷰 {product.reviewCount ?? 0}개 · 평점 {product.averageRating ?? 0}
                    </p>
                    {isSelected ? (
                      <Button
                        type="button"
                        size="xs"
                        variant={isPrimary ? "secondary" : "outline"}
                        onClick={(event) => {
                          event.stopPropagation()
                          setPrimaryItemId(itemId)
                        }}
                        disabled={disabled}
                      >
                        <Star size={12} />
                        {isPrimary ? "대표 아이템" : "대표 지정"}
                      </Button>
                    ) : null}
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {selectedProducts.length > 0 ? (
        <div className="rounded-[1.5rem] border border-border/70 bg-white/70 px-4 py-4 dark:bg-slate-950/24">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-foreground">
                선택된 구성 아이템 {selectedProducts.length}개
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                대표 아이템은 목록 카드와 기존 단건 API 호환용 `itemId`로 사용됩니다.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              {selectedProducts.map((product) => (
                <Badge
                  key={product.id}
                  variant={String(product.id) === primaryResolvedItemId ? "default" : "outline"}
                >
                  {product.title}
                </Badge>
              ))}
            </div>
          </div>
        </div>
      ) : null}

      <div className="space-y-3 rounded-[1.6rem] border border-border/70 bg-white/70 px-4 py-4 dark:bg-slate-950/24">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <Label className="flex items-center gap-2">
              <Sparkles size={14} className="text-primary" />
              리워드 구성
            </Label>
            <p className="mt-1 text-xs leading-5 text-muted-foreground">
              선택한 상품별로 리워드 타이틀과 금액, 수량 제한을 설정합니다.
            </p>
          </div>
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={addRewardOption}
            disabled={disabled || selectedItemIds.length === 0}
          >
            <Plus size={14} />
            리워드 추가
          </Button>
        </div>

        {rewardOptions.length > 0 ? (
          <div className="space-y-3">
            {rewardOptions.map((option, index) => (
              <div
                key={option.id}
                className="rounded-[1.35rem] border border-border/70 bg-background/80 px-4 py-4"
              >
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-semibold text-foreground">리워드 {index + 1}</p>
                  <Button
                    type="button"
                    size="icon-xs"
                    variant="ghost"
                    onClick={() => removeRewardOption(option.id)}
                    disabled={disabled || rewardOptions.length === 1}
                  >
                    <Trash2 size={12} />
                  </Button>
                </div>

                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  <div className="flex flex-col gap-1.5">
                    <Label>연결 아이템</Label>
                    <Select
                      value={option.itemId}
                      onValueChange={(value) => updateRewardOption(option.id, { itemId: value })}
                      disabled={disabled}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="리워드에 연결할 아이템" />
                      </SelectTrigger>
                      <SelectContent>
                        {selectedProducts.map((product) => (
                          <SelectItem key={product.id} value={String(product.id)}>
                            {product.title}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <Label>리워드 이름</Label>
                    <Input
                      value={option.title}
                      onChange={(event) => updateRewardOption(option.id, { title: event.target.value })}
                      placeholder="예) 얼리버드 티셔츠 세트"
                      disabled={disabled}
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <Label>참여 금액</Label>
                    <Input
                      type="number"
                      value={option.amount}
                      onChange={(event) => updateRewardOption(option.id, { amount: event.target.value })}
                      placeholder="예) 39000"
                      disabled={disabled}
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <Label>수량 제한</Label>
                    <Input
                      type="number"
                      value={option.quantityLimit}
                      onChange={(event) =>
                        updateRewardOption(option.id, { quantityLimit: event.target.value })
                      }
                      placeholder="예) 200"
                      disabled={disabled}
                    />
                  </div>

                  <div className="sm:col-span-2 flex flex-col gap-1.5">
                    <Label>리워드 설명</Label>
                    <Textarea
                      rows={3}
                      value={option.description}
                      onChange={(event) =>
                        updateRewardOption(option.id, { description: event.target.value })
                      }
                      placeholder="구성품, 제공 시점, 유의사항 등을 적어주세요."
                      disabled={disabled}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-[1.35rem] border border-dashed border-border px-4 py-8 text-center text-sm text-muted-foreground">
            아이템을 먼저 선택하면 기본 리워드가 자동으로 생성됩니다.
          </div>
        )}
      </div>
    </div>
  )
}
