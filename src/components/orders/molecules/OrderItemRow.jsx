import { Package } from "lucide-react"
import { Badge } from "@/components/ui/badge"

function formatPrice(amount) {
  if (amount == null) return "-"
  return Number(amount).toLocaleString("ko-KR") + "원"
}

export default function OrderItemRow({ item }) {
  return (
    <div className="flex items-center gap-4 rounded-[1.2rem] border border-border/70 bg-white/55 px-4 py-3 dark:bg-slate-950/20">
      {item.thumbnailUrl ? (
        <img
          src={item.thumbnailUrl}
          alt={item.titleSnap}
          className="h-14 w-14 shrink-0 rounded-xl object-cover"
        />
      ) : (
        <div className="grid h-14 w-14 shrink-0 place-items-center rounded-xl bg-muted">
          <Package size={20} className="text-muted-foreground" />
        </div>
      )}

      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-foreground">
          {item.titleSnap ?? "상품명 없음"}
        </p>
        <div className="mt-1 flex flex-wrap items-center gap-2">
          {item.itemTypeSnap && (
            <Badge variant="outline" className="text-[0.7rem]">
              {item.itemTypeSnap === "GOODS" ? "굿즈" : item.itemTypeSnap === "PERFORMANCE" ? "공연" : item.itemTypeSnap}
            </Badge>
          )}
          <span className="text-xs text-muted-foreground">
            {item.quantity}개 × {formatPrice(item.unitPrice)}
          </span>
        </div>
      </div>

      <p className="shrink-0 text-sm font-semibold text-foreground">
        {formatPrice(item.lineAmount)}
      </p>
    </div>
  )
}
