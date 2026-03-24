import { useQuery } from "@tanstack/react-query"

import { getItemReviews } from "@/domains/reviews/api/reviewApi.js"

export function useItemReviewsQuery(itemId, params = {}) {
  return useQuery({
    queryKey: ["reviews", itemId, params],
    queryFn: () => getItemReviews(itemId, params),
    enabled: Boolean(itemId),
  })
}
