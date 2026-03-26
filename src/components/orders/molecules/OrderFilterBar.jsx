import { cn } from "@/lib/utils"
import { ORDER_STATUS_META } from "@/components/orders/atoms/orderStatusMeta.js"

const FILTERS = [
  { value: null,               label: "전체" },
  { value: "PENDING",          label: ORDER_STATUS_META.PENDING.label },
  { value: "PAID",             label: ORDER_STATUS_META.PAID.label },
  { value: "PREPARING",        label: ORDER_STATUS_META.PREPARING.label },
  { value: "SHIPPING",         label: ORDER_STATUS_META.SHIPPING.label },
  { value: "DELIVERED",        label: ORDER_STATUS_META.DELIVERED.label },
  { value: "CANCELLED",        label: ORDER_STATUS_META.CANCELLED.label },
  { value: "REFUND_REQUESTED", label: ORDER_STATUS_META.REFUND_REQUESTED.label },
  { value: "REFUNDED",         label: ORDER_STATUS_META.REFUNDED.label },
]

export default function OrderFilterBar({ active, onChange }) {
  return (
    <div className="flex flex-wrap gap-2">
      {FILTERS.map(({ value, label }) => {
        const isActive = active === value
        return (
          <button
            key={value ?? "ALL"}
            type="button"
            onClick={() => onChange(value)}
            className={cn(
              "rounded-[1.1rem] border px-3 py-1.5 text-xs font-semibold transition-all",
              isActive
                ? "border-primary/20 bg-primary text-primary-foreground shadow-[0_8px_20px_rgba(29,161,242,0.18)]"
                : "border-border bg-card text-muted-foreground hover:border-primary/20 hover:text-foreground",
            )}
          >
            {label}
          </button>
        )
      })}
    </div>
  )
}
