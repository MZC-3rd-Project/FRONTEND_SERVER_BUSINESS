import { ShoppingBag } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import OrderFilterBar from "@/components/orders/molecules/OrderFilterBar.jsx"
import OrderCard from "@/components/orders/molecules/OrderCard.jsx"
import { cn } from "@/lib/utils"

export default function OrderList({ orders, isLoading, activeFilter, onFilterChange, activeOrderId, onOrderSelect }) {
  return (
    <Card className="h-fit">
      <CardContent className="p-5">
        <div className="flex items-center justify-between">
          <p className="section-kicker">Orders</p>
          <Badge variant="outline">{orders.length}건</Badge>
        </div>

        <div className="mt-4">
          <OrderFilterBar active={activeFilter} onChange={onFilterChange} />
        </div>

        <div className="mt-4 space-y-3">
          {isLoading ? (
            [1, 2, 3].map((i) => (
              <div key={i} className="h-20 animate-pulse rounded-[1.4rem] bg-muted" />
            ))
          ) : orders.length > 0 ? (
            orders.map((order) => (
              <OrderCard
                key={order.orderId}
                order={order}
                isActive={String(order.orderId) === String(activeOrderId)}
                onClick={() => onOrderSelect(order.orderId)}
              />
            ))
          ) : (
            <div className={cn(
              "rounded-[1.5rem] border border-dashed border-border px-4 py-8 text-center",
            )}>
              <ShoppingBag size={20} className="mx-auto text-primary/70" />
              <p className="mt-3 text-sm text-muted-foreground">
                {activeFilter ? "해당 상태의 주문이 없습니다." : "아직 주문이 없습니다."}
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
