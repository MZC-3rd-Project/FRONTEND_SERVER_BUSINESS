import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select"
import { Target, Calendar, DollarSign, Hash, Package } from "lucide-react"
import ItemThumbnailField from "@/components/items/ItemThumbnailField.jsx"

function FieldError({ errors, name }) {
  return errors?.[name] && (
    <span className="text-destructive text-xs font-medium">{errors[name][0]}</span>
  )
}

export default function FundingFormFields({
  state,
  formAction,
  isPending,
  fundingType,
  itemId,
  setItemId,
  products,
  thumbnail,
  setThumbnail,
  onThumbnailUploadingChange,
}) {
  return (
    <form action={formAction}>
      <input type="hidden" name="fundingType" value={fundingType} />
      <input type="hidden" name="itemId" value={itemId} />
      <input type="hidden" name="thumbnailMediaId" value={thumbnail?.mediaId ?? ""} />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="sm:col-span-2">
          <ItemThumbnailField
            label="펀딩 대표 이미지"
            hint="펀딩 카드와 상세 화면에서 사용할 대표 이미지를 등록합니다."
            value={thumbnail}
            onChange={setThumbnail}
            onUploadingChange={onThumbnailUploadingChange}
            disabled={isPending}
          />
        </div>

        <div className="flex flex-col gap-1.5 sm:col-span-2">
          <Label className="flex items-center gap-1">
            <Package size={13} className="text-primary" />
            아이템 <span className="text-destructive">*</span>
          </Label>
          <Select value={itemId} onValueChange={setItemId}>
            <SelectTrigger className="border border-border">
              <SelectValue placeholder="펀딩할 아이템을 선택하세요" />
            </SelectTrigger>
            <SelectContent>
              {products.map((p) => (
                <SelectItem key={p.id} value={String(p.id)}>
                  {p.title ?? p.name ?? `아이템 #${p.id}`}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <FieldError errors={state.errors} name="itemId" />
        </div>

        <div className="flex flex-col gap-1.5 sm:col-span-2">
          <Label htmlFor="title">캠페인 제목</Label>
          <Input
            id="title"
            name="title"
            placeholder="펀딩 캠페인 제목 (최대 200자)"
            className="border border-border"
          />
          <FieldError errors={state.errors} name="title" />
        </div>

        <div className="flex flex-col gap-1.5">
          <Label className="flex items-center gap-1">
            <Target size={13} className="text-primary" />
            목표 금액 (원) <span className="text-destructive">*</span>
          </Label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">₩</span>
            <Input
              name="goalAmount"
              type="number"
              placeholder="1,000,000"
              className="pl-7 border border-border"
            />
          </div>
          <FieldError errors={state.errors} name="goalAmount" />
        </div>

        <div className="flex flex-col gap-1.5">
          <Label className="flex items-center gap-1">
            <DollarSign size={13} className="text-primary" />
            최소 참여 금액 (원)
          </Label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">₩</span>
            <Input
              name="minAmount"
              type="number"
              placeholder="10,000"
              className="pl-7 border border-border"
            />
          </div>
          <FieldError errors={state.errors} name="minAmount" />
        </div>

        {fundingType === "QUANTITY_BASED" && (
          <div className="flex flex-col gap-1.5 sm:col-span-2">
            <Label className="flex items-center gap-1">
              <Hash size={13} className="text-primary" />
              목표 수량 <span className="text-destructive">*</span>
            </Label>
            <Input
              name="goalQuantity"
              type="number"
              placeholder="목표 수량 입력"
              min="1"
              className="border border-border"
            />
            <FieldError errors={state.errors} name="goalQuantity" />
          </div>
        )}

        <div className="flex flex-col gap-1.5">
          <Label className="flex items-center gap-1">
            <Calendar size={13} className="text-primary" />
            시작일 <span className="text-destructive">*</span>
          </Label>
          <Input name="startAt" type="date" className="border border-border" />
          <FieldError errors={state.errors} name="startAt" />
        </div>

        <div className="flex flex-col gap-1.5">
          <Label className="flex items-center gap-1">
            <Calendar size={13} className="text-primary" />
            종료일 <span className="text-destructive">*</span>
          </Label>
          <Input name="endAt" type="date" className="border border-border" />
          <FieldError errors={state.errors} name="endAt" />
        </div>

        <div className="flex flex-col gap-1.5">
          <Label>메이커명</Label>
          <Input
            name="makerName"
            placeholder="메이커 / 브랜드명"
            className="border border-border"
          />
          <FieldError errors={state.errors} name="makerName" />
        </div>

        <div className="flex flex-col gap-1.5">
          <Label>카테고리</Label>
          <Input
            name="category"
            placeholder="예) 전자기기, 패션, 식품"
            className="border border-border"
          />
          <FieldError errors={state.errors} name="category" />
        </div>

        <div className="flex flex-col gap-1.5 sm:col-span-2">
          <Label>캠페인 소개</Label>
          <Textarea
            name="summary"
            placeholder="펀딩 목적, 사용 계획 등을 입력하세요... (최대 5000자)"
            rows={4}
            className="border border-border"
          />
          <FieldError errors={state.errors} name="summary" />
        </div>
      </div>

      {state.errors?._root && (
        <p className="text-destructive text-xs font-medium mt-4">{state.errors._root[0]}</p>
      )}

      <div className="flex justify-end mt-5 pt-4 border-t border-border">
        <Button type="submit" disabled={isPending || !itemId}>
          {isPending ? "등록 중..." : "캠페인 등록"}
        </Button>
      </div>
    </form>
  )
}
