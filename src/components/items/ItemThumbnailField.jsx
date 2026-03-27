import { useId, useState } from "react"
import { ImagePlus, LoaderCircle, Trash2, Upload } from "lucide-react"

import { uploadImageToMedia } from "@/common/api/mediaApi.js"
import ItemThumbnail from "@/components/items/ItemThumbnail.jsx"
import { Button, buttonVariants } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"

export default function ItemThumbnailField({
  label = "대표 이미지",
  hint = "클라이언트 목록과 상세에서 보일 대표 이미지를 등록합니다.",
  value,
  onChange,
  onUploadingChange,
  disabled = false,
}) {
  const inputId = useId()
  const [isUploading, setIsUploading] = useState(false)
  const [uploadError, setUploadError] = useState("")

  const hasValue = Boolean(value?.mediaId || value?.previewUrl)

  const handleFileChange = async (event) => {
    const file = event.target.files?.[0]
    event.target.value = ""

    if (!file) {
      return
    }

    setUploadError("")
    setIsUploading(true)
    onUploadingChange?.(true)

    try {
      const uploaded = await uploadImageToMedia(file)
      if (!uploaded?.mediaId) {
        throw new Error("업로드 결과에 mediaId가 없습니다.")
      }

      onChange({
        mediaId: String(uploaded.mediaId),
        previewUrl: uploaded.mediaUrl ?? null,
        fileName: file.name,
      })
    } catch (error) {
      setUploadError(error?.message ?? "이미지 업로드에 실패했습니다.")
    } finally {
      setIsUploading(false)
      onUploadingChange?.(false)
    }
  }

  return (
    <div className="space-y-3 rounded-[1.4rem] border border-border/70 bg-white/70 p-4 dark:bg-slate-950/24">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <Label htmlFor={inputId}>{label}</Label>
          <p className="mt-1 text-xs leading-5 text-muted-foreground">{hint}</p>
        </div>
        {hasValue ? (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => {
              setUploadError("")
              onChange(null)
            }}
            disabled={disabled || isUploading}
          >
            <Trash2 size={14} />
            제거
          </Button>
        ) : null}
      </div>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <ItemThumbnail
          mediaId={value?.mediaId}
          previewUrl={value?.previewUrl}
          alt={value?.fileName ?? label}
          className="h-28 w-28 shrink-0"
          fallbackLabel="대표 이미지 없음"
        />

        <div className="flex flex-wrap gap-2">
          <label
            htmlFor={inputId}
            className={cn(
              buttonVariants({ variant: "outline", size: "sm" }),
              "cursor-pointer",
              (disabled || isUploading) && "pointer-events-none opacity-50"
            )}
          >
            {isUploading ? <LoaderCircle size={14} className="animate-spin" /> : <Upload size={14} />}
            {hasValue ? "이미지 변경" : "이미지 업로드"}
          </label>
          <input
            id={inputId}
            type="file"
            accept="image/*"
            className="hidden"
            disabled={disabled || isUploading}
            onChange={handleFileChange}
          />

          {!hasValue ? (
            <div className="inline-flex items-center gap-2 rounded-full bg-muted px-3 py-2 text-xs text-muted-foreground">
              <ImagePlus size={14} />
              JPG, PNG, WEBP
            </div>
          ) : null}
        </div>
      </div>

      {uploadError ? (
        <p className="text-xs font-medium text-destructive">{uploadError}</p>
      ) : null}
    </div>
  )
}
