import { cn } from "@/lib/utils"
import OrderStatusBadge from "@/components/orders/atoms/OrderStatusBadge.jsx"

function formatDate(value) {
  if (!value) return "-"
  const d = new Date(value)
  const diff = Date.now() - d.getTime()
  if (diff < 60_000) return "방금"
  if (diff < 3_600_000) return `${Math.floor(diff / 60_000)}분 전`
  if (diff < 86_400_000) return `${Math.floor(diff / 3_600_000)}시간 전`
  return d.toLocaleDateString("ko-KR", { month: "short", day: "numeric" })
}

function formatPrice(amount) {
  if (amount == null) return "-"
  return Number(amount).toLocaleString("ko-KR") + "원"
}

export default function OrderCard({ order, isActive, onClick }) {
  const firstItem = order.items?.[0]
  const extraCount = (order.items?.length ?? 0) - 1

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "metric-chip w-full rounded-[1.4rem] px-4 py-4 text-left transition-all",
        isActive && "border-primary/25 ring-2 ring-primary/12",
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-foreground">
            {firstItem?.titleSnap ?? "주문 상품"}
            {extraCount > 0 && (
              <span className="ml-1 text-muted-foreground"> 외 {extraCount}건</span>
            )}
          </p>
          {firstItem?.itemTypeSnap && (
            <p className="mt-0.5 text-[0.8rem] text-muted-foreground">
              {firstItem.itemTypeSnap === "GOODS" ? "굿즈" : firstItem.itemTypeSnap === "PERFORMANCE" ? "공연" : firstItem.itemTypeSnap}
            </p>
          )}
        </div>
        <OrderStatusBadge status={order.status} />
      </div>

      <div className="mt-3 flex items-center justify-between">
        <p className="text-sm font-semibold text-foreground">
          {formatPrice(order.totalAmount)}
        </p>
        <p className="text-[0.78rem] text-muted-foreground">
          {formatDate(order.createdAt)}
        </p>
      </div>
    </button>
  )
}
