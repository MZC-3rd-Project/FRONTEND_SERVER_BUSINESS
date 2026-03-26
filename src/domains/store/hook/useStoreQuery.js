import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { createStore, getStoreDetail, updateStore, updateStoreStatus, deleteStore } from "@/domains/store/api/storeApi"
import { getSellerProducts } from "@/domains/items/api/itemsApi"
import { deleteProduct } from "@/domains/items/api/itemsApi"

export function useStoreDetailQuery(storeId) {
  return useQuery({
    queryKey: ["store", "detail", storeId],
    queryFn: () => getStoreDetail(storeId),
    enabled: !!storeId,
    staleTime: 30_000,
  })
}

export function useCreateStoreQuery() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: createStore,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["store", "me"] })
    },
  })
}

export function useUpdateStoreMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ storeId, data }) => updateStore(storeId, data),
    onSuccess: (_, { storeId }) => {
      queryClient.invalidateQueries({ queryKey: ["store", "me"] })
      queryClient.invalidateQueries({ queryKey: ["store", "detail", storeId] })
    },
  })
}

export function useUpdateStoreStatusMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ storeId, status }) => updateStoreStatus(storeId, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["store", "me"] })
    },
  })
}

export function useDeleteStoreMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ storeId }) => {
      // 연쇄 삭제: 가게에 속한 상품 먼저 삭제
      const productsPayload = await getSellerProducts()
      const items = Array.isArray(productsPayload?.items)
        ? productsPayload.items
        : Array.isArray(productsPayload)
          ? productsPayload
          : []

      const storeItems = items.filter(
        (item) => String(item.storeId) === String(storeId)
      )

      await Promise.all(
        storeItems.map((item) => deleteProduct(item.id ?? item.itemId))
      )

      return deleteStore(storeId)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["store", "me"] })
      queryClient.invalidateQueries({ queryKey: ["items"] })
    },
  })
}
