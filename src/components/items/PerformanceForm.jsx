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

export default function PerformanceForm({
  state, myStore, perfCategoryId, setPerfCategoryId, perfCategories, formAction, isPending,
}) {
  const [thumbnail, setThumbnail] = useState(null)
  const [isThumbnailUploading, setIsThumbnailUploading] = useState(false)

  return (
    <form action={formAction}>
      <input type="hidden" name="itemType" value="performance" />
      <input type="hidden" name="storeId" value={myStore?.id ?? ""} />
      <input type="hidden" name="categoryId" value={perfCategoryId} />
      <input type="hidden" name="thumbnailMediaId" value={thumbnail?.mediaId ?? ""} />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="sm:col-span-2">
          <ItemThumbnailField
            label="공연 대표 이미지"
            hint="클라이언트 상품 카드와 상세 상단에 사용할 썸네일입니다."
            value={thumbnail}
            onChange={setThumbnail}
            onUploadingChange={setIsThumbnailUploading}
            disabled={isPending}
          />
        </div>

        <div className="flex flex-col gap-1.5 sm:col-span-2">
          <Label htmlFor="perf-name" className="text-sm font-medium">
            공연명 <span className="text-destructive">*</span>
          </Label>
          <Input id="perf-name" name="name" placeholder="공연명을 입력하세요" className="border border-border" />
          <FieldError errors={state.errors} name="name" />
        </div>

        <div className="flex flex-col gap-1.5">
          <Label className="text-sm font-medium">
            카테고리 <span className="text-destructive">*</span>
          </Label>
          <Select value={perfCategoryId} onValueChange={setPerfCategoryId}>
            <SelectTrigger className="border border-border">
              <SelectValue placeholder="카테고리 선택" />
            </SelectTrigger>
            <SelectContent>
              {perfCategories.map((c) => (
                <SelectItem key={c.id} value={String(c.id)}>{c.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <FieldError errors={state.errors} name="categoryId" />
        </div>

        <div className="flex flex-col gap-1.5">
          <Label className="text-sm font-medium">
            기본 가격 <span className="text-destructive">*</span>
          </Label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">₩</span>
            <Input name="price" type="number" placeholder="0" className="pl-7 border border-border" />
          </div>
          <FieldError errors={state.errors} name="price" />
        </div>

        <div className="flex flex-col gap-1.5">
          <Label className="text-sm font-medium">
            공연 장소 <span className="text-destructive">*</span>
          </Label>
          <Input name="venue" placeholder="예) 올림픽공원 체조경기장" className="border border-border" />
          <FieldError errors={state.errors} name="venue" />
        </div>

        <div className="flex flex-col gap-1.5">
          <Label className="text-sm font-medium">공연장 주소</Label>
          <Input name="venueAddress" placeholder="예) 서울특별시 송파구 올림픽로 424" className="border border-border" />
        </div>

        <div className="flex flex-col gap-1.5">
          <Label className="text-sm font-medium">
            공연 날짜 <span className="text-destructive">*</span>
          </Label>
          <Input name="performanceDate" type="date" className="border border-border" />
          <FieldError errors={state.errors} name="performanceDate" />
        </div>

        <div className="flex flex-col gap-1.5">
          <Label className="text-sm font-medium">
            공연 시간 <span className="text-destructive">*</span>
          </Label>
          <Input name="performanceTime" type="time" className="border border-border" />
          <FieldError errors={state.errors} name="performanceTime" />
        </div>

        <div className="flex flex-col gap-1.5">
          <Label className="text-sm font-medium">
            총 좌석 수 <span className="text-destructive">*</span>
          </Label>
          <Input name="totalSeats" type="number" placeholder="0" min="1" className="border border-border" />
          <FieldError errors={state.errors} name="totalSeats" />
        </div>

        <div className="flex flex-col gap-1.5">
          <Label className="text-sm font-medium">러닝타임 (분)</Label>
          <Input name="runningTimeMinutes" type="number" placeholder="예) 120" min="1" className="border border-border" />
        </div>

        <div className="flex flex-col gap-1.5">
          <Label className="text-sm font-medium">관람 등급</Label>
          <Input name="ageLimit" placeholder="예) 15세 이상 관람가" className="border border-border" />
        </div>

        <div className="flex flex-col gap-1.5">
          <Label className="text-sm font-medium">주최</Label>
          <Input name="organizer" placeholder="주최사 입력" className="border border-border" />
        </div>

        <div className="flex flex-col gap-1.5">
          <Label className="text-sm font-medium">주관</Label>
          <Input name="host" placeholder="주관사 입력" className="border border-border" />
        </div>

        <div className="flex flex-col gap-1.5 sm:col-span-2">
          <Label className="text-sm font-medium">예매 유의사항</Label>
          <Textarea name="bookingNotice" placeholder="예매 및 관람 유의사항을 입력하세요" rows={2} className="border border-border" />
        </div>

        <div className="sm:col-span-2 border border-border rounded-lg p-4 bg-muted/20">
          <p className="text-sm font-medium mb-3">좌석 등급 <span className="text-destructive">*</span></p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <Label className="text-xs text-muted-foreground">등급명</Label>
              <Input name="gradeName" placeholder="예) VIP, R석, S석" defaultValue="일반" className="border border-border" />
              <FieldError errors={state.errors} name="gradeName" />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label className="text-xs text-muted-foreground">등급 가격</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">₩</span>
                <Input name="gradePrice" type="number" placeholder="0" min="0" className="pl-7 border border-border" />
              </div>
              <FieldError errors={state.errors} name="gradePrice" />
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-1.5 sm:col-span-2">
          <Label className="text-sm font-medium">설명</Label>
          <Textarea name="description" placeholder="공연에 대한 간단한 설명을 입력하세요" rows={3} className="border border-border" />
        </div>
      </div>

      {state.errors?._root && (
        <p className="text-destructive text-xs font-medium mt-3">{state.errors._root[0]}</p>
      )}

      <div className="flex justify-end mt-5 pt-4 border-t border-border">
        <Button type="submit" disabled={isPending || !myStore?.id || isThumbnailUploading}>
          {isPending ? "등록 중..." : "공연 등록"}
        </Button>
      </div>
    </form>
  )
}
