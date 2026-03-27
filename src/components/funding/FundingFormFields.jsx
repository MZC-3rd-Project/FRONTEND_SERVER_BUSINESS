import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Calendar, DollarSign, Hash, Store, Target } from "lucide-react"

import FundingCampaignItemsEditor from "@/components/funding/FundingCampaignItemsEditor.jsx"
import ItemThumbnailField from "@/components/items/ItemThumbnailField.jsx"
import {
  ensurePrimaryItemId,
  serializeRewardOptions,
} from "@/domains/funding/lib/fundingRewardUtils.js"

function FieldError({ errors, name }) {
  return errors?.[name] ? (
    <span className="text-xs font-medium text-destructive">{errors[name][0]}</span>
  ) : null
}

export default function FundingFormFields({
  state,
  formAction,
  isPending,
  fundingType,
  selectedItemIds,
  setSelectedItemIds,
  primaryItemId,
  setPrimaryItemId,
  rewardOptions,
  setRewardOptions,
  products,
  thumbnail,
  setThumbnail,
  onThumbnailUploadingChange,
  defaultMakerName = "",
}) {
  const resolvedPrimaryItemId = ensurePrimaryItemId(primaryItemId, selectedItemIds)

  return (
    <form action={formAction} className="space-y-5">
      <input type="hidden" name="fundingType" value={fundingType} />
      <input type="hidden" name="itemId" value={resolvedPrimaryItemId} />
      <input type="hidden" name="itemIdsJson" value={JSON.stringify(selectedItemIds)} />
      <input type="hidden" name="rewardOptionsJson" value={serializeRewardOptions(rewardOptions)} />
      <input type="hidden" name="thumbnailMediaId" value={thumbnail?.mediaId ?? ""} />

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,1.15fr)_22rem]">
        <div className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="title">캠페인 제목</Label>
            <Input
              id="title"
              name="title"
              placeholder="예) 봄 시즌 한정 굿즈 컬렉션 펀딩"
              className="border border-border"
            />
            <FieldError errors={state.errors} name="title" />
          </div>

          <FundingCampaignItemsEditor
            products={products}
            selectedItemIds={selectedItemIds}
            setSelectedItemIds={setSelectedItemIds}
            primaryItemId={primaryItemId}
            setPrimaryItemId={setPrimaryItemId}
            rewardOptions={rewardOptions}
            setRewardOptions={setRewardOptions}
            errors={state.errors}
            disabled={isPending}
          />

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-1.5">
              <Label className="flex items-center gap-1">
                <Store size={13} className="text-primary" />
                메이커명
              </Label>
              <Input
                key={defaultMakerName || "maker-default"}
                name="makerName"
                defaultValue={defaultMakerName}
                placeholder="스토어명과 동일하게 자동 입력됩니다."
                className="border border-border"
              />
              <p className="text-xs text-muted-foreground">
                판매자 페이지에서는 스토어명을 기본값으로 사용하고, 필요할 때만 별칭으로 수정합니다.
              </p>
              <FieldError errors={state.errors} name="makerName" />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label>카테고리</Label>
              <Input
                name="category"
                placeholder="예) 의류, 시즌 컬렉션, 공연"
                className="border border-border"
              />
              <FieldError errors={state.errors} name="category" />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label>캠페인 소개</Label>
            <Textarea
              name="summary"
              placeholder="펀딩 목적, 구성 이유, 발송/제공 계획을 적어주세요."
              rows={5}
              className="border border-border"
            />
            <FieldError errors={state.errors} name="summary" />
          </div>
        </div>

        <div className="space-y-5">
          <ItemThumbnailField
            label="펀딩 대표 이미지"
            hint="목록 카드와 상세 상단에 노출할 이미지를 등록합니다."
            value={thumbnail}
            onChange={setThumbnail}
            onUploadingChange={onThumbnailUploadingChange}
            disabled={isPending}
          />

          <div className="rounded-[1.6rem] border border-border/70 bg-white/70 px-4 py-4 dark:bg-slate-950/24">
            <p className="text-sm font-semibold text-foreground">목표 설정</p>
            <div className="mt-4 space-y-4">
              <div className="flex flex-col gap-1.5">
                <Label className="flex items-center gap-1">
                  <Target size={13} className="text-primary" />
                  목표 금액 (원)
                  <span className="text-destructive">*</span>
                </Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                    ₩
                  </span>
                  <Input
                    name="goalAmount"
                    type="number"
                    placeholder="예) 5000000"
                    className="border border-border pl-7"
                  />
                </div>
                <FieldError errors={state.errors} name="goalAmount" />
              </div>

              <div className="flex flex-col gap-1.5">
                <Label className="flex items-center gap-1">
                  <DollarSign size={13} className="text-primary" />
                  최소 참여 금액
                </Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                    ₩
                  </span>
                  <Input
                    name="minAmount"
                    type="number"
                    placeholder="예) 10000"
                    className="border border-border pl-7"
                  />
                </div>
                <FieldError errors={state.errors} name="minAmount" />
              </div>

              {fundingType === "QUANTITY_BASED" ? (
                <div className="flex flex-col gap-1.5">
                  <Label className="flex items-center gap-1">
                    <Hash size={13} className="text-primary" />
                    목표 수량
                    <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    name="goalQuantity"
                    type="number"
                    min="1"
                    placeholder="예) 300"
                    className="border border-border"
                  />
                  <FieldError errors={state.errors} name="goalQuantity" />
                </div>
              ) : null}
            </div>
          </div>

          <div className="rounded-[1.6rem] border border-border/70 bg-white/70 px-4 py-4 dark:bg-slate-950/24">
            <p className="text-sm font-semibold text-foreground">일정</p>
            <div className="mt-4 space-y-4">
              <div className="flex flex-col gap-1.5">
                <Label className="flex items-center gap-1">
                  <Calendar size={13} className="text-primary" />
                  시작일
                  <span className="text-destructive">*</span>
                </Label>
                <Input name="startAt" type="date" className="border border-border" />
                <FieldError errors={state.errors} name="startAt" />
              </div>

              <div className="flex flex-col gap-1.5">
                <Label className="flex items-center gap-1">
                  <Calendar size={13} className="text-primary" />
                  종료일
                  <span className="text-destructive">*</span>
                </Label>
                <Input name="endAt" type="date" className="border border-border" />
                <FieldError errors={state.errors} name="endAt" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {state.errors?._root ? (
        <p className="text-xs font-medium text-destructive">{state.errors._root[0]}</p>
      ) : null}

      <div className="flex justify-end border-t border-border pt-4">
        <Button type="submit" disabled={isPending || selectedItemIds.length === 0 || rewardOptions.length === 0}>
          {isPending ? "등록 중..." : "캠페인 등록"}
        </Button>
      </div>
    </form>
  )
}
