import { useState, useEffect, useActionState } from "react"
import { useQueryClient } from "@tanstack/react-query"
import { Target, Calendar, DollarSign, Hash, Check, Package } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card } from "@/components/ui/card"
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select"
import { createCampaignAction } from "../actions/createFundingAction.js"
import { useSellerProductsQuery } from "@/domains/items/hook/useItemsQuery.js"

function FieldError({ errors, name }) {
  return errors?.[name] && (
    <span className="text-destructive text-xs font-medium">{errors[name][0]}</span>
  )
}

function FundingForm({ onReset }) {
  const [fundingType, setFundingType] = useState("AMOUNT_BASED")
  const [itemId, setItemId] = useState("")
  const queryClient = useQueryClient()

  const [state, formAction, isPending] = useActionState(createCampaignAction, {})
  const { data: products = [] } = useSellerProductsQuery();
  console.log("products", products);

  useEffect(() => {
    if (state.success) {
      queryClient.invalidateQueries({ queryKey: ["campaigns"] })
    }
  }, [state.success, queryClient])

  if (state.success) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
          <Check size={32} className="text-primary" />
        </div>
        <h2 className="text-xl font-bold">펀딩 캠페인 생성 완료!</h2>
        <p className="text-muted-foreground text-sm">펀딩 캠페인이 성공적으로 등록되었습니다.</p>
        <Button onClick={onReset}>다시 등록하기</Button>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">펀딩 설정</h1>
        <p className="text-muted-foreground text-sm mt-1">가게 펀딩 캠페인을 등록하세요.</p>
      </div>

      <Card className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="flex items-center gap-2 px-6 py-4 border-b border-border">
          <div className="w-1 h-4 bg-primary rounded-full" />
          <h3 className="font-semibold text-sm">펀딩 캠페인 등록</h3>
        </div>

        <div className="px-6 py-6">
          {/* 펀딩 유형 탭 */}
          <div className="flex gap-2 p-1 bg-muted rounded-lg w-full mb-6">
            <button
              type="button"
              onClick={() => setFundingType("AMOUNT_BASED")}
              className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-md text-sm font-medium transition-colors ${
                fundingType === "AMOUNT_BASED"
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <DollarSign size={14} /> 금액 기반
            </button>
            <button
              type="button"
              onClick={() => setFundingType("QUANTITY_BASED")}
              className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-md text-sm font-medium transition-colors ${
                fundingType === "QUANTITY_BASED"
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Hash size={14} /> 수량 기반
            </button>
          </div>

          <form action={formAction}>
            <input type="hidden" name="fundingType" value={fundingType} />
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
                    <SelectValue placeholder="펀딩할 아이템을 선택하세요" />
                  </SelectTrigger>
                  <SelectContent>
                    {products.map((p) => (
                      <SelectItem key={p.id} value={String(p.id)}>
                        {p.title ?? p.name ?? `아이템 #${p.id}`}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FieldError errors={state.errors} name="itemId" />
              </div>

              {/* 캠페인 제목 */}
              <div className="flex flex-col gap-1.5 sm:col-span-2">
                <Label htmlFor="title">캠페인 제목</Label>
                <Input
                  id="title"
                  name="title"
                  placeholder="펀딩 캠페인 제목 (최대 200자)"
                  className="border border-border"
                />
                <FieldError errors={state.errors} name="title" />
              </div>

              {/* 목표 금액 */}
              <div className="flex flex-col gap-1.5">
                <Label className="flex items-center gap-1">
                  <Target size={13} className="text-primary" />
                  목표 금액 (원) <span className="text-destructive">*</span>
                </Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">₩</span>
                  <Input
                    name="goalAmount"
                    type="number"
                    placeholder="1,000,000"
                    className="pl-7 border border-border"
                  />
                </div>
                <FieldError errors={state.errors} name="goalAmount" />
              </div>

              {/* 최소 참여 금액 */}
              <div className="flex flex-col gap-1.5">
                <Label className="flex items-center gap-1">
                  <DollarSign size={13} className="text-primary" />
                  최소 참여 금액 (원)
                </Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">₩</span>
                  <Input
                    name="minAmount"
                    type="number"
                    placeholder="10,000"
                    className="pl-7 border border-border"
                  />
                </div>
                <FieldError errors={state.errors} name="minAmount" />
              </div>

              {/* 목표 수량 (수량 기반일 때만) */}
              {fundingType === "QUANTITY_BASED" && (
                <div className="flex flex-col gap-1.5 sm:col-span-2">
                  <Label className="flex items-center gap-1">
                    <Hash size={13} className="text-primary" />
                    목표 수량 <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    name="goalQuantity"
                    type="number"
                    placeholder="목표 수량 입력"
                    min="1"
                    className="border border-border"
                  />
                  <FieldError errors={state.errors} name="goalQuantity" />
                </div>
              )}

              {/* 기간 */}
              <div className="flex flex-col gap-1.5">
                <Label className="flex items-center gap-1">
                  <Calendar size={13} className="text-primary" />
                  시작일 <span className="text-destructive">*</span>
                </Label>
                <Input name="startAt" type="date" className="border border-border" />
                <FieldError errors={state.errors} name="startAt" />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label className="flex items-center gap-1">
                  <Calendar size={13} className="text-primary" />
                  종료일 <span className="text-destructive">*</span>
                </Label>
                <Input name="endAt" type="date" className="border border-border" />
                <FieldError errors={state.errors} name="endAt" />
              </div>

              {/* 메이커명 */}
              <div className="flex flex-col gap-1.5">
                <Label>메이커명</Label>
                <Input
                  name="makerName"
                  placeholder="메이커 / 브랜드명"
                  className="border border-border"
                />
                <FieldError errors={state.errors} name="makerName" />
              </div>

              {/* 카테고리 */}
              <div className="flex flex-col gap-1.5">
                <Label>카테고리</Label>
                <Input
                  name="category"
                  placeholder="예) 전자기기, 패션, 식품"
                  className="border border-border"
                />
                <FieldError errors={state.errors} name="category" />
              </div>

              {/* 캠페인 소개 */}
              <div className="flex flex-col gap-1.5 sm:col-span-2">
                <Label>캠페인 소개</Label>
                <Textarea
                  name="summary"
                  placeholder="펀딩 목적, 사용 계획 등을 입력하세요... (최대 5000자)"
                  rows={4}
                  className="border border-border"
                />
                <FieldError errors={state.errors} name="summary" />
              </div>
            </div>

            {state.errors?._root && (
              <p className="text-destructive text-xs font-medium mt-4">{state.errors._root[0]}</p>
            )}

            <div className="flex justify-end mt-5 pt-4 border-t border-border">
              <Button type="submit" disabled={isPending || !itemId}>
                {isPending ? "등록 중..." : "캠페인 등록"}
              </Button>
            </div>
          </form>
        </div>
      </Card>
    </div>
  )
}

export default function FundingPage() {
  const [formKey, setFormKey] = useState(0)
  return <FundingForm key={formKey} onReset={() => setFormKey((k) => k + 1)} />
}
