import { useEffect, useState } from "react"
import { useActionState } from "react"
import { useQueryClient } from "@tanstack/react-query"
import { ShoppingBag, Music, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { createItemAction } from "../actions/createItemAction.js"
import { useCategoriesQuery, useMyStoreQuery } from "../hook/useItemsQuery.js"
import GoodsForm from "@/components/items/GoodsForm.jsx"
import PerformanceForm from "@/components/items/PerformanceForm.jsx"

function flattenTree(node) {
  return [
    { id: node.id, name: node.name },
    ...(node.children ?? []).flatMap((c) => flattenTree(c)),
  ]
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

        <div className="px-6 pb-6 pt-4">
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
