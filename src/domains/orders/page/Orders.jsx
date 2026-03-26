import { useState } from "react"
import { ShoppingBag } from "lucide-react"
import PageIntro from "@/components/layout/PageIntro.jsx"
import OrderList from "@/components/orders/organisms/OrderList.jsx"
import OrderDetailPanel from "@/components/orders/organisms/OrderDetailPanel.jsx"
import { useOrderDetailQuery, useStoreOrdersQuery } from "@/domains/orders/hook/useOrdersQuery.js"

export default function OrdersPage() {
  const [activeFilter, setActiveFilter] = useState(null)
  const [selectedOrderId, setSelectedOrderId] = useState(null)

  const { data: ordersData, isLoading: isOrdersLoading } = useStoreOrdersQuery(activeFilter)
  const { data: orderDetail, isLoading: isDetailLoading } = useOrderDetailQuery(selectedOrderId)

  const orders = Array.isArray(ordersData) ? ordersData : (ordersData?.items ?? ordersData?.content ?? [])

  function handleFilterChange(status) {
    setActiveFilter(status)
    setSelectedOrderId(null)
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <PageIntro
        eyebrow="Order Management"
        title="주문 관리"
        description="내 가게에 들어온 주문을 상태별로 확인하고 상세 정보를 조회하는 화면입니다."
        meta={[
          `총 ${orders.length}건`,
          activeFilter ? `${activeFilter} 필터 적용` : "전체 주문",
          selectedOrderId ? "상세 보기 중" : "주문 선택 전",
        ]}
      >
        <div className="metric-chip rounded-[1.75rem] px-5 py-5">
          <p className="text-[0.72rem] font-semibold uppercase tracking-[0.22em] text-slate-500 dark:text-slate-400">
            Order flow
          </p>
          <p className="mt-3 text-lg font-semibold text-foreground">주문 현황 모니터링</p>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            결제 대기부터 구매 확정까지 주문 상태를 실시간으로 확인할 수 있습니다.
          </p>
        </div>
      </PageIntro>

      <div className="grid gap-6 xl:grid-cols-[21rem_minmax(0,1fr)]">
        <OrderList
          orders={orders}
          isLoading={isOrdersLoading}
          activeFilter={activeFilter}
          onFilterChange={handleFilterChange}
          activeOrderId={selectedOrderId}
          onOrderSelect={setSelectedOrderId}
        />

        <OrderDetailPanel
          order={orderDetail}
          isLoading={isDetailLoading}
          selectedOrderId={selectedOrderId}
        />
      </div>
    </div>
  )
}
