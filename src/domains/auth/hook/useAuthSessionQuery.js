import { useQuery } from "@tanstack/react-query"
import { shouldRetryRequest } from "@/common/api/queryRetry.js"
import { getMyProfile } from "@/domains/auth/api/authApi.js"

export const authKeys = {
  all: ["auth"],
  session: () => [...authKeys.all, "session"],
}

export function useAuthSessionQuery(options = {}) {
  return useQuery({
    queryKey: authKeys.session(),
    queryFn: getMyProfile,
    retry: shouldRetryRequest,
    staleTime: 300_000,
    ...options,
  })
}
