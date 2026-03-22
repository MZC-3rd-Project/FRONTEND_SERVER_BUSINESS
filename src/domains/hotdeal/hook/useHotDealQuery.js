import { useQuery } from "@tanstack/react-query"
import { getHotDeals, getHotDealById } from "../api/hotDealApi.js"

export function useHotDealsQuery(params = {}) {
  return useQuery({
    queryKey: ["hot-deals", params],
    queryFn: () => getHotDeals(params),
  })
}

export function useHotDealQuery(hotDealId) {
  return useQuery({
    queryKey: ["hot-deals", hotDealId],
    queryFn: () => getHotDealById(hotDealId),
    enabled: !!hotDealId,
  })
}
