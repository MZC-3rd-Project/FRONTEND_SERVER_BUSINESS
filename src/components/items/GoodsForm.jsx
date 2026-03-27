import { useState } from "react"

import ItemThumbnailField from "@/components/items/ItemThumbnailField.jsx"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select"

function FieldError({ errors, name }) {
  return errors?.[name] && (
    <span className="text-destructive text-xs font-medium">{errors[name][0]}</span>
  )
}

export default function GoodsForm({
  state, myStore, goodsCategoryId, setGoodsCategoryId, goodsCategories, formAction, isPending,
}) {
  const [thumbnail, setThumbnail] = useState(null)
  const [isThumbnailUploading, setIsThumbnailUploading] = useState(false)

  return (
    <form action={formAction}>
      <input type="hidden" name="itemType" value="goods" />
      <input type="hidden" name="storeId" value={myStore?.id ?? ""} />
      <input type="hidden" name="categoryId" value={goodsCategoryId} />
      <input type="hidden" name="thumbnailMediaId" value={thumbnail?.mediaId ?? ""} />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="sm:col-span-2">
          <ItemThumbnailField
            label="굿즈 대표 이미지"
            hint="상품 목록과 클라이언트 노출 화면에서 사용할 썸네일입니다."
            value={thumbnail}
            onChange={setThumbnail}
            onUploadingChange={setIsThumbnailUploading}
            disabled={isPending}
          />
        </div>

        <div className="flex flex-col gap-1.5 sm:col-span-2">
          <Label htmlFor="goods-name" className="text-sm font-medium">
            굿즈명 <span className="text-destructive">*</span>
          </Label>
          <Input id="goods-name" name="name" placeholder="판매할 굿즈명을 입력하세요" className="border border-border" />
          <FieldError errors={state.errors} name="name" />
        </div>

        <div className="flex flex-col gap-1.5">
          <Label className="text-sm font-medium">
            카테고리 <span className="text-destructive">*</span>
          </Label>
          <Select value={goodsCategoryId} onValueChange={setGoodsCategoryId}>
            <SelectTrigger className="border border-border">
              <SelectValue placeholder="카테고리 선택" />
            </SelectTrigger>
            <SelectContent>
              {goodsCategories.map((c) => (
                <SelectItem key={c.id} value={String(c.id)}>{c.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <FieldError errors={state.errors} name="categoryId" />
        </div>

        <div className="flex flex-col gap-1.5">
          <Label className="text-sm font-medium">
            가격 <span className="text-destructive">*</span>
          </Label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">₩</span>
            <Input name="price" type="number" placeholder="0" className="pl-7 border border-border" />
          </div>
          <FieldError errors={state.errors} name="price" />
        </div>

        <div className="flex flex-col gap-1.5">
          <Label className="text-sm font-medium">
            재고 <span className="text-destructive">*</span>
          </Label>
          <Input name="stock" type="number" placeholder="0" min="0" className="border border-border" />
          <FieldError errors={state.errors} name="stock" />
        </div>

        <div className="flex flex-col gap-1.5 sm:col-span-2">
          <Label className="text-sm font-medium">설명</Label>
          <Textarea name="description" placeholder="굿즈에 대한 간단한 설명을 입력하세요" rows={3} className="border border-border" />
        </div>
      </div>

      {state.errors?._root && (
        <p className="text-destructive text-xs font-medium mt-3">{state.errors._root[0]}</p>
      )}

      <div className="flex justify-end mt-5 pt-4 border-t border-border">
        <Button type="submit" disabled={isPending || !myStore?.id || isThumbnailUploading}>
          {isPending ? "등록 중..." : "굿즈 등록"}
        </Button>
      </div>
    </form>
  )
}
