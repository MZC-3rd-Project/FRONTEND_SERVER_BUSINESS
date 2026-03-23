import { useQuery } from "@tanstack/react-query"
import { shouldRetryRequest } from "@/common/api/queryRetry.js"
import {
  getSellerGoodsDetail,
  getSellerPerformanceDetail,
  getSellerProducts,
  getCategories,
  getMyStore,
} from "../api/itemsApi.js"
import {
  mapCategoryTreePayload,
  mapMyStorePayload,
  mapSellerGoodsDetailPayload,
  mapSellerPerformanceDetailPayload,
  mapSellerProductListPayload,
} from "../lib/itemMappers.js"

export const itemKeys = {
  all: ["items"],
  products: () => [...itemKeys.all, "seller-products"],
  categories: () => [...itemKeys.all, "categories"],
  store: () => ["store", "me"],
  detail: (itemType, itemId) => [...itemKeys.all, "detail", itemType, itemId],
}

export function useSellerProductsQuery() {
  return useQuery({
    queryKey: itemKeys.products(),
    queryFn: async () => mapSellerProductListPayload(await getSellerProducts()),
    retry: shouldRetryRequest,
    staleTime: 30_000,
  })
}

export function useCategoriesQuery() {
  return useQuery({
    queryKey: itemKeys.categories(),
    queryFn: async () => mapCategoryTreePayload(await getCategories()),
    retry: shouldRetryRequest,
    staleTime: 30_000,
  })
}

export function useMyStoreQuery() {
  return useQuery({
    queryKey: itemKeys.store(),
    queryFn: async () => mapMyStorePayload(await getMyStore()),
    retry: shouldRetryRequest,
    staleTime: 30_000,
  })
}

export function useSellerItemDetailQuery(itemId, itemType) {
  return useQuery({
    queryKey: itemKeys.detail(itemType, itemId),
    queryFn: async () => {
      if (String(itemType).toUpperCase() === "PERFORMANCE") {
        return mapSellerPerformanceDetailPayload(await getSellerPerformanceDetail(itemId))
      }
      return mapSellerGoodsDetailPayload(await getSellerGoodsDetail(itemId))
    },
    enabled: Boolean(itemId && itemType),
    retry: shouldRetryRequest,
    staleTime: 30_000,
  })
}
