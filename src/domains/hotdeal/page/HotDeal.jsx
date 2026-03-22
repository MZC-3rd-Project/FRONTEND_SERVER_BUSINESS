import { useState, useEffect, useActionState } from "react"
import { useQueryClient } from "@tanstack/react-query"
import { Tag, Clock, Percent, Package, Hash, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select"
import { createHotDealAction } from "../actions/createHotDealAction.js"
import { useSellerProductsQuery } from "@/domains/items/hook/useItemsQuery.js"

function FieldError({ errors, name }) {
  return errors?.[name] && (
    <span className="text-destructive text-xs font-medium">{errors[name][0]}</span>
  )
}

function HotDealForm({ onReset }) {
  const [itemId, setItemId] = useState("")
  const [discountRate, setDiscountRate] = useState("10")
  const queryClient = useQueryClient()

  const [state, formAction, isPending] = useActionState(createHotDealAction, {})
  const { data: products = [] } = useSellerProductsQuery()
  console.log("products", products);
  const selectedProduct = products.find((p) => String(p.id) === itemId)
  const originalPrice = selectedProduct?.price ?? 0
  const discountedPrice =
    discountRate && originalPrice
      ? Math.floor((originalPrice * (100 - Number(discountRate))) / 100)
      : null

  useEffect(() => {
    if (state.success) {
      queryClient.invalidateQueries({ queryKey: ["hot-deals"] })
    }
  }, [state.success, queryClient])

  if (state.success) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
          <Check size={32} className="text-primary" />
        </div>
        <h2 className="text-xl font-bold">핫딜 등록 완료!</h2>
        <p className="text-muted-foreground text-sm">핫딜이 성공적으로 등록되었습니다.</p>
        <Button onClick={onReset}>다시 등록하기</Button>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">핫딜 설정</h1>
        <p className="text-muted-foreground text-sm mt-1">한정 수량 특가 핫딜을 등록하세요.</p>
      </div>

      <Card className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="flex items-center gap-2 px-6 py-4 border-b border-border">
          <div className="w-1 h-4 bg-primary rounded-full" />
          <h3 className="font-semibold text-sm">핫딜 등록</h3>
        </div>

        <div className="px-6 py-6">
          <form action={formAction}>
            <input type="hidden" name="itemId" value={itemId} />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

              {/* 아이템 선택 */}
              <div className="flex flex-col gap-1.5 sm:col-span-2">
                <Label className="flex items-center gap-1">
                  <Package size={13} className="text-primary" />
                  아이템 <span className="text-destructive">*</span>
                </Label>
                <Select value={itemId} onValueChange={setItemId}>
                  <SelectTrigger className="border border-border">
                    <SelectValue placeholder="핫딜 적용할 아이템을 선택하세요" />
                  </SelectTrigger>
                  <SelectContent>
                    {products.map((p) => (
                      <SelectItem key={p.id} value={String(p.id)}>
                        {p.title ?? p.name ?? `아이템 #${p.id}`}
                        {p.price ? ` (${p.price.toLocaleString()}원)` : ""}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FieldError errors={state.errors} name="itemId" />
              </div>

              {/* 할인율 */}
              <div className="flex flex-col gap-2 sm:col-span-2">
                <Label className="flex items-center justify-between">
                  <span className="flex items-center gap-1">
                    <Percent size={13} className="text-primary" />
                    할인율 <span className="text-destructive">*</span>
                  </span>
                  <span className="text-lg font-bold text-primary">
                    {discountRate ? `-${discountRate}%` : "-"}
                  </span>
                </Label>
                <input type="hidden" name="discountRate" value={discountRate} />
                <input
                  type="range"
                  min="10"
                  max="90"
                  step="10"
                  value={discountRate || 10}
                  onChange={(e) => setDiscountRate(e.target.value)}
                  className="w-full accent-primary"
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>10%</span>
                  <span>50%</span>
                  <span>90%</span>
                </div>
                <FieldError errors={state.errors} name="discountRate" />
              </div>

              {/* 할인가 미리보기 */}
              <div className="flex flex-col gap-1.5">
                <Label>할인가 미리보기</Label>
                <div className="flex items-center h-10 px-3 rounded-lg border border-border bg-muted/40 gap-2">
                  {discountedPrice !== null ? (
                    <>
                      <span className="text-xs text-muted-foreground line-through">
                        {originalPrice.toLocaleString()}원
                      </span>
                      <span className="text-sm font-semibold text-primary">
                        {discountedPrice.toLocaleString()}원
                      </span>
                      <Badge className="ml-auto text-xs">-{discountRate}%</Badge>
                    </>
                  ) : (
                    <span className="text-xs text-muted-foreground">
                      아이템과 할인율 입력 시 표시
                    </span>
                  )}
                </div>
              </div>

              {/* 총 판매 수량 */}
              <div className="flex flex-col gap-1.5">
                <Label className="flex items-center gap-1">
                  <Tag size={13} className="text-primary" />
                  총 판매 수량 <span className="text-destructive">*</span>
                </Label>
                <Input
                  name="maxQuantity"
                  type="number"
                  min="1"
                  placeholder="최대 판매 수량"
                  className="border border-border"
                />
                <FieldError errors={state.errors} name="maxQuantity" />
              </div>

              {/* 인당 최대 구매 수량 */}
              <div className="flex flex-col gap-1.5 sm:col-span-2">
                <Label className="flex items-center gap-1">
                  <Hash size={13} className="text-primary" />
                  인당 최대 구매 수량
                  <span className="text-xs text-muted-foreground">(미입력 시 1개)</span>
                </Label>
                <Input
                  name="maxPerUser"
                  type="number"
                  min="1"
                  placeholder="1"
                  className="border border-border"
                />
                <FieldError errors={state.errors} name="maxPerUser" />
              </div>

              {/* 시작/종료 일시 */}
              <div className="sm:col-span-2 grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <Label className="flex items-center gap-1">
                    <Clock size={13} className="text-primary" />
                    시작 일시
                    <span className="text-xs text-muted-foreground">(미입력 시 즉시)</span>
                  </Label>
                  <Input
                    name="startAt"
                    type="datetime-local"
                    className="border border-border"
                  />
                  <FieldError errors={state.errors} name="startAt" />
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label className="flex items-center gap-1">
                    <Clock size={13} className="text-primary" />
                    종료 일시
                  </Label>
                  <Input
                    name="endAt"
                    type="datetime-local"
                    className="border border-border"
                  />
                  <FieldError errors={state.errors} name="endAt" />
                </div>
              </div>

            </div>

            {state.errors?._root && (
              <p className="text-destructive text-xs font-medium mt-4">{state.errors._root[0]}</p>
            )}

            <div className="flex justify-end mt-5 pt-4 border-t border-border">
              <Button type="submit" disabled={isPending || !itemId}>
                {isPending ? "등록 중..." : "핫딜 등록"}
              </Button>
            </div>
          </form>
        </div>
      </Card>
    </div>
  )
}

export default function HotDealPage() {
  const [formKey, setFormKey] = useState(0)
  return <HotDealForm key={formKey} onReset={() => setFormKey((k) => k + 1)} />
}
