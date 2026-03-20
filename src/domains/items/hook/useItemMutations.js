import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toggleProductStatus, deleteProduct } from "../api/itemsApi.js"

export function useToggleStatusMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ itemId, status }) => toggleProductStatus(itemId, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["seller-products"] })
    },
  })
}

export function useDeleteItemMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (itemId) => deleteProduct(itemId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["seller-products"] })
    },
  })
}
