import { useState, useEffect, useActionState } from "react"
import { useQueryClient } from "@tanstack/react-query"
import { DollarSign, Hash, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { createCampaignAction } from "../actions/createFundingAction.js"
import { useSellerProductsQuery } from "@/domains/items/hook/useItemsQuery.js"
import FundingFormFields from "@/components/funding/FundingFormFields.jsx"

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

          <FundingFormFields
            state={state}
            formAction={formAction}
            isPending={isPending}
            fundingType={fundingType}
            itemId={itemId}
            setItemId={setItemId}
            products={products}
          />
        </div>
      </Card>
    </div>
  )
}

export default function FundingPage() {
  const [formKey, setFormKey] = useState(0)
  return <FundingForm key={formKey} onReset={() => setFormKey((k) => k + 1)} />
}
