import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import {
  cancelOrder,
  fetchOrderDetail,
  fetchStoreOrders,
  requestRefund,
} from "@/domains/orders/api/ordersApi.js"

export function useStoreOrdersQuery(status) {
  return useQuery({
    queryKey: ["orders", "store", status ?? "ALL"],
    queryFn: () => fetchStoreOrders(status),
    refetchInterval: 30_000,
  })
}

export function useOrderDetailQuery(orderId) {
  return useQuery({
    queryKey: ["orders", "detail", orderId],
    queryFn: () => fetchOrderDetail(orderId),
    enabled: Boolean(orderId),
  })
}

export function useCancelOrderMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (orderId) => cancelOrder(orderId),
    onSuccess: (_, orderId) => {
      queryClient.invalidateQueries({ queryKey: ["orders", "store"] })
      queryClient.invalidateQueries({ queryKey: ["orders", "detail", orderId] })
    },
  })
}

export function useRefundOrderMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (orderId) => requestRefund(orderId),
    onSuccess: (_, orderId) => {
      queryClient.invalidateQueries({ queryKey: ["orders", "store"] })
      queryClient.invalidateQueries({ queryKey: ["orders", "detail", orderId] })
    },
  })
}
