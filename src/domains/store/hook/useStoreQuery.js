import { useMutation,  useQueryClient } from "@tanstack/react-query"
import { createStore } from "@/domains/store/api/storeApi"


export function useCreateStoreQuery() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: createStore,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["store", "me"] })
    },
  })
}
