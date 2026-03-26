// order-query 서비스의 OrderStatus enum 기준
export const ORDER_STATUS_META = {
  PENDING:          { label: "결제 대기", className: "border-amber-300 bg-amber-50 text-amber-700 dark:border-amber-700 dark:bg-amber-950/40 dark:text-amber-300" },
  PAID:             { label: "결제 완료", className: "border-blue-300 bg-blue-50 text-blue-700 dark:border-blue-700 dark:bg-blue-950/40 dark:text-blue-300" },
  PREPARING:        { label: "배송 준비", className: "border-violet-300 bg-violet-50 text-violet-700 dark:border-violet-700 dark:bg-violet-950/40 dark:text-violet-300" },
  SHIPPING:         { label: "배송 중",   className: "border-indigo-300 bg-indigo-50 text-indigo-700 dark:border-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-300" },
  DELIVERED:        { label: "배송 완료", className: "border-teal-300 bg-teal-50 text-teal-700 dark:border-teal-700 dark:bg-teal-950/40 dark:text-teal-300" },
  CANCELLED:        { label: "취소됨",   className: "border-border bg-muted text-muted-foreground" },
  REFUND_REQUESTED: { label: "환불 요청", className: "border-orange-300 bg-orange-50 text-orange-700 dark:border-orange-700 dark:bg-orange-950/40 dark:text-orange-300" },
  REFUNDED:         { label: "환불 완료", className: "border-rose-300 bg-rose-50 text-rose-700 dark:border-rose-700 dark:bg-rose-950/40 dark:text-rose-300" },
}
