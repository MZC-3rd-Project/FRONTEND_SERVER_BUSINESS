import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { ImagePlus } from "lucide-react"

import { getMediaUrl } from "@/common/api/mediaApi.js"
import { cn } from "@/lib/utils"

export default function ItemThumbnail({
  mediaId,
  previewUrl,
  alt,
  className,
  fallbackLabel = "이미지 없음",
}) {
  const [failedPreviewUrl, setFailedPreviewUrl] = useState("")
  const hasPreviewError = Boolean(previewUrl) && failedPreviewUrl === previewUrl

  const { data: fetchedUrl, isPending } = useQuery({
    queryKey: ["media", "url", String(mediaId ?? "")],
    queryFn: () => getMediaUrl(String(mediaId)),
    enabled: Boolean(mediaId) && (!previewUrl || hasPreviewError),
    staleTime: 5 * 60_000,
    retry: 1,
  })

  const imageUrl = (hasPreviewError ? "" : previewUrl) || fetchedUrl || ""

  if (!imageUrl) {
    return (
      <div
        className={cn(
          "flex items-center justify-center rounded-[1.25rem] border border-dashed border-border bg-muted/30 text-center text-xs text-muted-foreground",
          isPending && "animate-pulse",
          className
        )}
      >
        <div className="flex flex-col items-center gap-2 px-3">
          <ImagePlus size={18} className="text-muted-foreground/60" />
          {!isPending ? <span>{fallbackLabel}</span> : null}
        </div>
      </div>
    )
  }

  return (
    <img
      src={imageUrl}
      alt={alt}
      onError={() => {
        if (previewUrl && !hasPreviewError) {
          setFailedPreviewUrl(previewUrl)
        }
      }}
      className={cn("rounded-[1.25rem] object-cover", className)}
    />
  )
}
