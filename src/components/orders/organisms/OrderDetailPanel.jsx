import { MapPin, ShoppingBag, Truck, XCircle, RotateCcw } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import OrderStatusBadge from "@/components/orders/atoms/OrderStatusBadge.jsx"
import OrderItemRow from "@/components/orders/molecules/OrderItemRow.jsx"
import { useCancelOrderMutation, useRefundOrderMutation } from "@/domains/orders/hook/useOrdersQuery.js"

// order-query enum 기준 (order 서비스가 실제 상태 검증)
const CANCELLABLE = new Set(["PENDING"])
const REFUNDABLE  = new Set(["PAID", "PREPARING", "SHIPPING", "DELIVERED"])

function formatPrice(amount) {
  if (amount == null) return "-"
  return Number(amount).toLocaleString("ko-KR") + "원"
}

function formatDateTime(value) {
  if (!value) return "-"
  return new Date(value).toLocaleString("ko-KR", {
    year: "numeric", month: "short", day: "numeric",
    hour: "2-digit", minute: "2-digit",
  })
}

function InfoRow({ label, value }) {
  if (!value) return null
  return (
    <div className="flex items-start justify-between gap-4 py-2">
      <p className="shrink-0 text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
        {label}
      </p>
      <p className="text-right text-sm text-foreground">{value}</p>
    </div>
  )
}

function EmptyState() {
  return (
    <Card className="overflow-hidden">
      <CardContent className="p-6">
        <div className="rounded-[1.8rem] border border-dashed border-border px-6 py-10 text-center">
          <ShoppingBag size={24} className="mx-auto text-primary/70" />
          <p className="mt-3 text-sm text-muted-foreground">주문을 선택하면 상세 내용이 표시됩니다.</p>
        </div>
      </CardContent>
    </Card>
  )
}

function LoadingState() {
  return (
    <Card className="overflow-hidden">
      <CardContent className="p-6 space-y-3">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-16 animate-pulse rounded-[1.2rem] bg-muted" />
        ))}
      </CardContent>
    </Card>
  )
}

export default function OrderDetailPanel({ order, isLoading, selectedOrderId }) {
  const cancelMutation  = useCancelOrderMutation()
  const refundMutation  = useRefundOrderMutation()

  if (!selectedOrderId) return <EmptyState />
  if (isLoading) return <LoadingState />
  if (!order) return <EmptyState />

  const shipment       = order.shipment
  const orderId        = order.orderId
  const canCancel      = CANCELLABLE.has(order.status)
  const canRefund      = REFUNDABLE.has(order.status)
  const isMutating     = cancelMutation.isPending || refundMutation.isPending
  const mutationError  = cancelMutation.error?.message ?? refundMutation.error?.message

  function handleCancel() {
    if (!confirm("주문을 취소하시겠습니까?")) return
    cancelMutation.mutate(orderId)
  }

  function handleRefund() {
    if (!confirm("환불을 요청하시겠습니까?")) return
    refundMutation.mutate(orderId)
  }

  return (
    <Card className="overflow-hidden">
      {/* Header */}
      <div className="border-b border-white/70 px-6 py-5 dark:border-slate-800">
        <p className="section-kicker">Order Detail</p>
        <div className="mt-2 flex items-center justify-between gap-3">
          <h2 className="display-title text-2xl text-foreground">
            주문 #{String(orderId).slice(-6)}
          </h2>
          <OrderStatusBadge status={order.status} />
        </div>
        <p className="mt-1 text-sm text-muted-foreground">
          {formatDateTime(order.createdAt)}
        </p>
      </div>

      <CardContent className="space-y-5 p-6">
        {/* 오류 메시지 */}
        {mutationError && (
          <Alert variant="destructive">
            <AlertDescription>{mutationError}</AlertDescription>
          </Alert>
        )}

        {/* 주문 상품 목록 */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <ShoppingBag size={16} className="text-primary" />
            <p className="text-sm font-semibold text-foreground">주문 상품</p>
          </div>
          <div className="space-y-2">
            {(order.items ?? []).map((item) => (
              <OrderItemRow key={item.orderItemId} item={item} />
            ))}
          </div>
        </div>

        {/* 결제 정보 */}
        <div className="metric-chip rounded-[1.4rem] px-4 py-4">
          <p className="text-[0.72rem] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
            결제 금액
          </p>
          <p className="mt-2 text-2xl font-semibold text-foreground">
            {formatPrice(order.totalAmount)}
          </p>
          {order.sourceType && (
            <p className="mt-1 text-xs text-muted-foreground">
              {order.sourceType === "DIRECT"   ? "일반 구매"
                : order.sourceType === "FUNDING"  ? "펀딩 구매"
                : order.sourceType === "HOT_DEAL" ? "핫딜 구매"
                : order.sourceType}
            </p>
          )}
        </div>

        {/* 배송 정보 */}
        {shipment && (
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Truck size={16} className="text-primary" />
              <p className="text-sm font-semibold text-foreground">배송 정보</p>
            </div>
            <div className="divide-y divide-border/50 rounded-[1.4rem] border border-border/80 bg-white/55 px-4 py-3 dark:bg-slate-950/20">
              <InfoRow label="수령인" value={shipment.recipientName} />
              <InfoRow label="주소"   value={shipment.shippingAddress} />
              <InfoRow label="배송 유형" value={shipment.deliveryType} />
              <InfoRow label="배송 상태" value={shipment.status} />
              {shipment.shippedAt   && <InfoRow label="출고일시" value={formatDateTime(shipment.shippedAt)} />}
              {shipment.deliveredAt && <InfoRow label="배송완료" value={formatDateTime(shipment.deliveredAt)} />}
            </div>
          </div>
        )}

        {/* 수령인 정보 (배송 정보 없을 경우) */}
        {!shipment && (order.recipientName || order.recipientPhone) && (
          <div>
            <div className="flex items-center gap-2 mb-3">
              <MapPin size={16} className="text-primary" />
              <p className="text-sm font-semibold text-foreground">수령인 정보</p>
            </div>
            <div className="divide-y divide-border/50 rounded-[1.4rem] border border-border/80 bg-white/55 px-4 py-3 dark:bg-slate-950/20">
              <InfoRow label="이름"   value={order.recipientName} />
              <InfoRow label="연락처" value={order.recipientPhone} />
              <InfoRow label="메모"   value={order.deliveryMemo} />
            </div>
          </div>
        )}

        {/* 액션 버튼 */}
        {(canCancel || canRefund) && (
          <div className="flex gap-3 pt-1">
            {canCancel && (
              <Button
                variant="outline"
                className="flex-1 border-destructive/30 text-destructive hover:bg-destructive/8"
                disabled={isMutating}
                onClick={handleCancel}
              >
                <XCircle size={14} />
                {cancelMutation.isPending ? "취소 중..." : "주문 취소"}
              </Button>
            )}
            {canRefund && (
              <Button
                variant="outline"
                className="flex-1 border-orange-300 text-orange-600 hover:bg-orange-50 dark:border-orange-700 dark:text-orange-400 dark:hover:bg-orange-950/30"
                disabled={isMutating}
                onClick={handleRefund}
              >
                <RotateCcw size={14} />
                {refundMutation.isPending ? "요청 중..." : "환불 요청"}
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
