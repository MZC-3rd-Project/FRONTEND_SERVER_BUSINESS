import { LoaderCircle, ShieldAlert, Wifi, WifiOff } from "lucide-react"

export default function WsStatusBadge({ status }) {
  if (status === "connected") {
    return (
      <span className="flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400">
        <Wifi size={12} />
        실시간 연결
      </span>
    )
  }
  if (status === "connecting") {
    return (
      <span className="flex items-center gap-1 text-xs text-amber-500">
        <LoaderCircle size={12} className="animate-spin" />
        연결 중...
      </span>
    )
  }
  if (status === "auth_failed") {
    return (
      <span className="flex items-center gap-1 text-xs text-destructive">
        <ShieldAlert size={12} />
        인증 실패
      </span>
    )
  }
  return (
    <span className="flex items-center gap-1 text-xs text-muted-foreground">
      <WifiOff size={12} />
      연결 끊김
    </span>
  )
}
