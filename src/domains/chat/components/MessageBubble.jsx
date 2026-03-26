import { cn } from "@/lib/utils"
import { formatDateTime } from "@/domains/chat/utils/chatHelpers.js"

export default function MessageBubble({ message }) {
  const isOwn = Boolean(message.fromSelf)
  return (
    <div className={cn("flex", isOwn ? "justify-end" : "justify-start")}>
      <div className={cn("max-w-[80%] space-y-1", isOwn && "text-right")}>
        <div
          className={cn(
            "rounded-2xl px-3 py-2 text-sm leading-relaxed",
            isOwn
              ? "bg-primary text-primary-foreground"
              : "border border-border bg-card text-foreground",
          )}
        >
          {message.content}
        </div>
        <p className="text-[0.74rem] text-muted-foreground">
          {formatDateTime(message.createdAt)}
          {isOwn && message.deliveryState === "sending" && (
            <span className="ml-1">· 전송 중</span>
          )}
          {isOwn && message.deliveryState === "failed" && (
            <span className="ml-1 text-destructive">· 전송 실패</span>
          )}
        </p>
      </div>
    </div>
  )
}
