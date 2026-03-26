import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { ORDER_STATUS_META } from "@/components/orders/atoms/orderStatusMeta.js"

export default function OrderStatusBadge({ status, className }) {
  const meta = ORDER_STATUS_META[status]
  if (!meta) return <Badge variant="outline" className={className}>{status}</Badge>

  return (
    <Badge variant="outline" className={cn(meta.className, className)}>
      {meta.label}
    </Badge>
  )
}
