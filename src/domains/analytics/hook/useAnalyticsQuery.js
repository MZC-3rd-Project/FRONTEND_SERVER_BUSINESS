import { useQuery } from "@tanstack/react-query"
import { shouldRetryRequest } from "@/common/api/queryRetry.js"
import { getSellerDashboardOverview } from "@/domains/analytics/api/analyticsApi.js"
import {
  buildSellerDashboardOverviewParams,
  mapSellerDashboardOverviewPayload,
} from "@/domains/analytics/lib/analyticsMappers.js"

export const analyticsKeys = {
  all: ["analytics"],
  overview: (storeId, period) => [...analyticsKeys.all, "seller-dashboard-overview", storeId ?? "none", period],
}

export function useSellerDashboardOverviewQuery({ storeId, period = "7일", enabled = true } = {}) {
  return useQuery({
    queryKey: analyticsKeys.overview(storeId, period),
    queryFn: async () => {
      const params = {
        storeId,
        ...buildSellerDashboardOverviewParams(period),
      }

      return mapSellerDashboardOverviewPayload(await getSellerDashboardOverview(params))
    },
    enabled: enabled && Boolean(storeId),
    retry: shouldRetryRequest,
    staleTime: 60_000,
    refetchInterval: 60_000,
  })
}
