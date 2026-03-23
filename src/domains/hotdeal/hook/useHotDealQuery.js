import { useQuery } from "@tanstack/react-query"
import { shouldRetryRequest } from "@/common/api/queryRetry.js"
import { getHotDeals, getHotDealById } from "../api/hotDealApi.js"
import { mapHotDealListPayload, mapHotDealPayload } from "../lib/hotDealMappers.js"

export const hotDealKeys = {
  all: ["hot-deals"],
  lists: () => [...hotDealKeys.all, "list"],
  list: (params) => [...hotDealKeys.lists(), params],
  details: () => [...hotDealKeys.all, "detail"],
  detail: (hotDealId) => [...hotDealKeys.details(), hotDealId],
}

export function useHotDealsQuery(params = {}) {
  return useQuery({
    queryKey: hotDealKeys.list(params),
    queryFn: async () => mapHotDealListPayload(await getHotDeals(params)),
    retry: shouldRetryRequest,
    staleTime: 30_000,
  })
}

export function useHotDealQuery(hotDealId) {
  return useQuery({
    queryKey: hotDealKeys.detail(hotDealId),
    queryFn: async () => mapHotDealPayload(await getHotDealById(hotDealId)),
    enabled: !!hotDealId,
    retry: shouldRetryRequest,
    staleTime: 30_000,
  })
}
