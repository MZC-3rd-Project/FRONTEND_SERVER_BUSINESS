import { useQuery } from "@tanstack/react-query"
import { shouldRetryRequest } from "@/common/api/queryRetry.js"
import { getItemReviews } from "@/domains/reviews/api/reviewApi.js"

export const reviewKeys = {
  all: ["reviews"],
  byItem: (itemId, params) => [...reviewKeys.all, "item", itemId, params],
}

export function useItemReviewsQuery(itemId, params = {}) {
  return useQuery({
    queryKey: reviewKeys.byItem(itemId, params),
    queryFn: () => getItemReviews(itemId, params),
    enabled: Boolean(itemId),
    retry: shouldRetryRequest,
    staleTime: 30_000,
  })
}
