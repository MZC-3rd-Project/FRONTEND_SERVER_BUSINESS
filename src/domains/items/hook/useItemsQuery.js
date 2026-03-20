import { useQuery } from "@tanstack/react-query"
import { getSellerProducts, getCategories, getMyStore } from "../api/itemsApi.js"

export function useSellerProductsQuery() {
  return useQuery({
    queryKey: ["seller-products"],
    queryFn: getSellerProducts,
    select: (data) => data?.items ?? [],
  })
}

export function useCategoriesQuery() {
  return useQuery({
    queryKey: ["categories"],
    queryFn: getCategories,
  })
}

export function useMyStoreQuery() {
  return useQuery({
    queryKey: ["store", "me"],
    queryFn: getMyStore,
  })
}
