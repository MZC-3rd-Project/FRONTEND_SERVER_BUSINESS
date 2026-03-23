import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toggleProductStatus, deleteProduct } from "../api/itemsApi.js"
import { itemKeys } from "./useItemsQuery.js"

export function useToggleStatusMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ itemId, status }) => toggleProductStatus(itemId, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: itemKeys.products() })
    },
  })
}

export function useDeleteItemMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (itemId) => deleteProduct(itemId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: itemKeys.products() })
    },
  })
}
