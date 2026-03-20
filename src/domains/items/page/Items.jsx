import { useEffect, useState } from "react"
import { useActionState } from "react"
import { useQueryClient } from "@tanstack/react-query"
import { ShoppingBag, Music, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select"
import { Card } from "@/components/ui/card"
import { createItemAction } from "../actions/createItemAction.js"
import { useCategoriesQuery, useMyStoreQuery } from "../hook/useItemsQuery.js"

function flattenTree(node) {
  return [
    { id: node.id, name: node.name },
    ...(node.children ?? []).flatMap((c) => flattenTree(c)),
  ]
}

function FieldError({ errors, name }) {
  return errors?.[name] && (
    <span className="text-destructive text-xs font-medium">{errors[name][0]}</span>
  )
}

export default function ItemsPage() {
  const [itemType, setItemType] = useState("goods")
  const [goodsCategoryId, setGoodsCategoryId] = useState("")
  const [perfCategoryId, setPerfCategoryId] = useState("")
  const [isSuccess, setIsSuccess] = useState(false)
  const queryClient = useQueryClient()

  const [state, formAction, isPending] = useActionState(createItemAction, {});

  const { data: categoryTree = [] } = useCategoriesQuery()
  const { data: myStore } = useMyStoreQuery()

  const perfNode = categoryTree.find((c) => c.name === "공연/티켓")
  const perfCategories = perfNode ? flattenTree(perfNode) : []
  const goodsCategories = categoryTree
    .filter((c) => c.name !== "공연/티켓")
    .flatMap((c) => flattenTree(c))

  useEffect(() => {
    if (state.success) {
      queryClient.invalidateQueries({ queryKey: ["seller-products"] })
      setGoodsCategoryId("")
      setPerfCategoryId("")
      setIsSuccess(true)
    }
  }, [state.success, queryClient])

  if (isSuccess) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
          <Check size={32} className="text-primary" />
        </div>
        <h2 className="text-xl font-bold">아이템 등록 완료!</h2>
        <p className="text-muted-foreground text-sm">아이템이 성공적으로 등록되었습니다.</p>
        <Button onClick={() => setIsSuccess(false)}>다시 등록하기</Button>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">아이템 등록</h1>
        <p className="text-muted-foreground text-sm mt-1">가게에서 판매할 아이템을 등록하세요.</p>
      </div>

      <Card className="bg-card border border-border rounded-xl overflow-hidden">
          <div className="flex items-center gap-2 px-6 py-4 border-b border-border">
            <div className="w-1 h-4 bg-primary rounded-full" />
            <h3 className="font-semibold text-sm">새 아이템 등록</h3>
          </div>

          <div className="px-6 pt-5">
            <div className="flex gap-2 p-1 bg-muted rounded-lg w-full">
              <button
                type="button"
                onClick={() => setItemType("goods")}
                className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-md text-sm font-medium transition-colors ${
                  itemType === "goods"
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <ShoppingBag size={14} /> 굿즈
              </button>
              <button
                type="button"
                onClick={() => setItemType("performance")}
                className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-md text-sm font-medium transition-colors ${
                  itemType === "performance"
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Music size={14} /> 공연
              </button>
            </div>
          </div>

          {/* 굿즈 폼 */}
          {itemType === "goods" && (
            <div className="px-6 pb-6 pt-4">
              <form action={formAction}>
                <input type="hidden" name="itemType" value="goods" />
                <input type="hidden" name="storeId" value={myStore?.id ?? ""} />
                <input type="hidden" name="categoryId" value={goodsCategoryId} />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

                  <div className="flex flex-col gap-1.5 sm:col-span-2">
                    <Label htmlFor="goods-name" className="text-sm font-medium">
                      굿즈명 <span className="text-destructive">*</span>
                    </Label>
                    <Input id="goods-name" name="name" placeholder="판매할 굿즈명을 입력하세요" className="border border-border" />
                    <FieldError errors={state.errors} name="name" />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <Label className="text-sm font-medium">
                      카테고리 <span className="text-destructive">*</span>
                    </Label>
                    <Select value={goodsCategoryId} onValueChange={setGoodsCategoryId}>
                      <SelectTrigger className="border border-border">
                        <SelectValue placeholder="카테고리 선택" />
                      </SelectTrigger>
                      <SelectContent>
                        {goodsCategories.map((c) => (
                          <SelectItem key={c.id} value={String(c.id)}>{c.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FieldError errors={state.errors} name="categoryId" />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <Label className="text-sm font-medium">
                      가격 <span className="text-destructive">*</span>
                    </Label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">₩</span>
                      <Input name="price" type="number" placeholder="0" className="pl-7 border border-border" />
                    </div>
                    <FieldError errors={state.errors} name="price" />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <Label className="text-sm font-medium">
                      재고 <span className="text-destructive">*</span>
                    </Label>
                    <Input name="stock" type="number" placeholder="0" min="0" className="border border-border" />
                    <FieldError errors={state.errors} name="stock" />
                  </div>

                  <div className="flex flex-col gap-1.5 sm:col-span-2">
                    <Label className="text-sm font-medium">설명</Label>
                    <Textarea name="description" placeholder="굿즈에 대한 간단한 설명을 입력하세요" rows={3} className="border border-border" />
                  </div>
                </div>

                {state.errors?._root && (
                  <p className="text-destructive text-xs font-medium mt-3">{state.errors._root[0]}</p>
                )}

                <div className="flex justify-end mt-5 pt-4 border-t border-border">
                  <Button type="submit" disabled={isPending || !myStore?.id}>
                    {isPending ? "등록 중..." : "굿즈 등록"}
                  </Button>
                </div>
              </form>
            </div>
          )}

          {/* 공연 폼 */}
          {itemType === "performance" && (
            <div className="px-6 pb-6 pt-4">
              <form action={formAction}>
                <input type="hidden" name="itemType" value="performance" />
                <input type="hidden" name="storeId" value={myStore?.id ?? ""} />
                <input type="hidden" name="categoryId" value={perfCategoryId} />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

                  {/* 기본 정보 */}
                  <div className="flex flex-col gap-1.5 sm:col-span-2">
                    <Label htmlFor="perf-name" className="text-sm font-medium">
                      공연명 <span className="text-destructive">*</span>
                    </Label>
                    <Input id="perf-name" name="name" placeholder="공연명을 입력하세요" className="border border-border" />
                    <FieldError errors={state.errors} name="name" />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <Label className="text-sm font-medium">
                      카테고리 <span className="text-destructive">*</span>
                    </Label>
                    <Select value={perfCategoryId} onValueChange={setPerfCategoryId}>
                      <SelectTrigger className="border border-border">
                        <SelectValue placeholder="카테고리 선택" />
                      </SelectTrigger>
                      <SelectContent>
                        {perfCategories.map((c) => (
                          <SelectItem key={c.id} value={String(c.id)}>{c.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FieldError errors={state.errors} name="categoryId" />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <Label className="text-sm font-medium">
                      기본 가격 <span className="text-destructive">*</span>
                    </Label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">₩</span>
                      <Input name="price" type="number" placeholder="0" className="pl-7 border border-border" />
                    </div>
                    <FieldError errors={state.errors} name="price" />
                  </div>

                  {/* 공연 장소 */}
                  <div className="flex flex-col gap-1.5">
                    <Label className="text-sm font-medium">
                      공연 장소 <span className="text-destructive">*</span>
                    </Label>
                    <Input name="venue" placeholder="예) 올림픽공원 체조경기장" className="border border-border" />
                    <FieldError errors={state.errors} name="venue" />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <Label className="text-sm font-medium">공연장 주소</Label>
                    <Input name="venueAddress" placeholder="예) 서울특별시 송파구 올림픽로 424" className="border border-border" />
                  </div>

                  {/* 일시 */}
                  <div className="flex flex-col gap-1.5">
                    <Label className="text-sm font-medium">
                      공연 날짜 <span className="text-destructive">*</span>
                    </Label>
                    <Input name="performanceDate" type="date" className="border border-border" />
                    <FieldError errors={state.errors} name="performanceDate" />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <Label className="text-sm font-medium">
                      공연 시간 <span className="text-destructive">*</span>
                    </Label>
                    <Input name="performanceTime" type="time" className="border border-border" />
                    <FieldError errors={state.errors} name="performanceTime" />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <Label className="text-sm font-medium">
                      총 좌석 수 <span className="text-destructive">*</span>
                    </Label>
                    <Input name="totalSeats" type="number" placeholder="0" min="1" className="border border-border" />
                    <FieldError errors={state.errors} name="totalSeats" />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <Label className="text-sm font-medium">러닝타임 (분)</Label>
                    <Input name="runningTimeMinutes" type="number" placeholder="예) 120" min="1" className="border border-border" />
                  </div>

                  {/* 관람 정보 */}
                  <div className="flex flex-col gap-1.5">
                    <Label className="text-sm font-medium">관람 등급</Label>
                    <Input name="ageLimit" placeholder="예) 15세 이상 관람가" className="border border-border" />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <Label className="text-sm font-medium">주최</Label>
                    <Input name="organizer" placeholder="주최사 입력" className="border border-border" />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <Label className="text-sm font-medium">주관</Label>
                    <Input name="host" placeholder="주관사 입력" className="border border-border" />
                  </div>

                  <div className="flex flex-col gap-1.5 sm:col-span-2">
                    <Label className="text-sm font-medium">예매 유의사항</Label>
                    <Textarea name="bookingNotice" placeholder="예매 및 관람 유의사항을 입력하세요" rows={2} className="border border-border" />
                  </div>

                  {/* 좌석 등급 */}
                  <div className="sm:col-span-2 border border-border rounded-lg p-4 bg-muted/20">
                    <p className="text-sm font-medium mb-3">좌석 등급 <span className="text-destructive">*</span></p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="flex flex-col gap-1.5">
                        <Label className="text-xs text-muted-foreground">등급명</Label>
                        <Input name="gradeName" placeholder="예) VIP, R석, S석" defaultValue="일반" className="border border-border" />
                        <FieldError errors={state.errors} name="gradeName" />
                      </div>
                      <div className="flex flex-col gap-1.5">
                        <Label className="text-xs text-muted-foreground">등급 가격</Label>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">₩</span>
                          <Input name="gradePrice" type="number" placeholder="0" min="0" className="pl-7 border border-border" />
                        </div>
                        <FieldError errors={state.errors} name="gradePrice" />
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col gap-1.5 sm:col-span-2">
                    <Label className="text-sm font-medium">설명</Label>
                    <Textarea name="description" placeholder="공연에 대한 간단한 설명을 입력하세요" rows={3} className="border border-border" />
                  </div>
                </div>

                {state.errors?._root && (
                  <p className="text-destructive text-xs font-medium mt-3">{state.errors._root[0]}</p>
                )}

                <div className="flex justify-end mt-5 pt-4 border-t border-border">
                  <Button type="submit" disabled={isPending || !myStore?.id}>
                    {isPending ? "등록 중..." : "공연 등록"}
                  </Button>
                </div>
              </form>
            </div>
          )}
        </Card>
    </div>
  )
}
