import { useState, useEffect, useActionState } from "react"
import { useQueryClient } from "@tanstack/react-query"
import { Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { createHotDealAction } from "../actions/createHotDealAction.js"
import { useSellerProductsQuery } from "@/domains/items/hook/useItemsQuery.js"
import HotDealFormFields from "@/components/hotdeal/HotDealFormFields.jsx"

function HotDealForm({ onReset }) {
  const [itemId, setItemId] = useState("")
  const [discountRate, setDiscountRate] = useState("10")
  const queryClient = useQueryClient()

  const [state, formAction, isPending] = useActionState(createHotDealAction, {})
  const { data: products = [] } = useSellerProductsQuery()
  console.log("products", products);

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
