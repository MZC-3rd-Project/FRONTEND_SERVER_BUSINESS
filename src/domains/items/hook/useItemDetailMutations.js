import { useMutation, useQueryClient } from "@tanstack/react-query"

import { updateGoods, updatePerformance } from "@/domains/items/api/itemsApi.js"
import { itemKeys } from "@/domains/items/hook/useItemsQuery.js"

export function useUpdateGoodsMutation(itemId) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload) => updateGoods(itemId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: itemKeys.products() })
      queryClient.invalidateQueries({ queryKey: itemKeys.detail("GOODS", itemId) })
    },
  })
}

export function useUpdatePerformanceMutation(itemId) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload) => updatePerformance(itemId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: itemKeys.products() })
      queryClient.invalidateQueries({ queryKey: itemKeys.detail("PERFORMANCE", itemId) })
    },
  })
}
