import { useEffect, useMemo, useState } from "react"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { Link, useParams } from "react-router"
import { Ban, Calendar, RotateCcw, Save, Store, Target } from "lucide-react"

import FundingCampaignItemsEditor from "@/components/funding/FundingCampaignItemsEditor.jsx"
import ItemThumbnailField from "@/components/items/ItemThumbnailField.jsx"
import PageIntro from "@/components/layout/PageIntro.jsx"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { fundingKeys, useCampaignQuery } from "@/domains/funding/hook/useFundingQuery.js"
import {
  cancelCampaign,
  reactivateCampaign,
  updateCampaign,
} from "@/domains/funding/api/fundingApi.js"
import {
  normalizeRewardOptionsForEditor,
  toRewardOptionsPayload,
} from "@/domains/funding/lib/fundingRewardUtils.js"
import { useMyStoreQuery, useSellerProductsQuery } from "@/domains/items/hook/useItemsQuery.js"

function toDatetimeLocal(value) {
  if (!value) return ""
  return String(value).replace("Z", "").slice(0, 16)
}

function buildCampaignForm(campaign, defaultMakerName = "") {
  return {
    title: campaign.title ?? "",
    summary: campaign.summary ?? "",
    makerName: campaign.makerName ?? defaultMakerName,
    category: campaign.category ?? "",
    goalAmount: String(campaign.goalAmount ?? 0),
    goalQuantity: campaign.goalQuantity ? String(campaign.goalQuantity) : "",
    minAmount: campaign.minAmount ? String(campaign.minAmount) : "",
    startAt: toDatetimeLocal(campaign.startAt),
    endAt: toDatetimeLocal(campaign.endAt),
  }
}

function buildThumbnailState(campaign) {
  if (!campaign?.thumbnailMediaId && !campaign?.thumbnailUrl) return null

  return {
    mediaId: campaign.thumbnailMediaId ? String(campaign.thumbnailMediaId) : null,
    previewUrl: campaign.thumbnailUrl ?? null,
    fileName: campaign.title ?? "펀딩 대표 이미지",
  }
}

const RE_REGISTERABLE_STATUSES = ["CANCELLED", "COMPLETED", "SUCCEEDED", "FAILED"]

function FundingDetailEditor({
  campaign,
  campaignId,
  products,
  defaultMakerName,
}) {
  const queryClient = useQueryClient()
  const productsById = useMemo(
    () => Object.fromEntries((products ?? []).map((product) => [String(product.id), product])),
    [products],
  )
  const [form, setForm] = useState(() => buildCampaignForm(campaign, defaultMakerName))
  const [thumbnail, setThumbnail] = useState(() => buildThumbnailState(campaign))
  const [isThumbnailUploading, setIsThumbnailUploading] = useState(false)
  const [selectedItemIds, setSelectedItemIds] = useState(
    () => campaign.itemIds ?? [campaign.itemId].filter(Boolean),
  )
  const [primaryItemId, setPrimaryItemId] = useState(() => campaign.itemId ?? "")
  const [rewardOptions, setRewardOptions] = useState(() =>
    normalizeRewardOptionsForEditor(
      campaign.rewardOptions,
      campaign.itemIds ?? [campaign.itemId].filter(Boolean),
      productsById,
    ),
  )
  const [saveSuccess, setSaveSuccess] = useState(false)

  useEffect(() => {
    if (!saveSuccess) return
    const timer = setTimeout(() => setSaveSuccess(false), 3000)
    return () => clearTimeout(timer)
  }, [saveSuccess])

  const updateMutation = useMutation({
    mutationFn: (payload) => updateCampaign(campaignId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: fundingKeys.lists() })
      queryClient.invalidateQueries({ queryKey: fundingKeys.detail(campaignId) })
      setSaveSuccess(true)
    },
  })

  const cancelMutation = useMutation({
    mutationFn: (reason) => cancelCampaign(campaignId, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: fundingKeys.lists() })
      queryClient.invalidateQueries({ queryKey: fundingKeys.detail(campaignId) })
    },
  })

  const reRegisterMutation = useMutation({
    mutationFn: (payload) => reactivateCampaign(campaignId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: fundingKeys.lists() })
      queryClient.invalidateQueries({ queryKey: fundingKeys.detail(campaignId) })
    },
  })

  const handleChange = (name, value) => {
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const buildSubmitPayload = () => ({
    itemId: Number(primaryItemId || selectedItemIds[0] || 0),
    itemIds: selectedItemIds.map((itemId) => Number(itemId)),
    rewardOptions: toRewardOptionsPayload(rewardOptions),
    title: form.title || undefined,
    summary: form.summary || undefined,
    makerName: form.makerName || defaultMakerName || undefined,
    category: form.category || undefined,
    goalAmount: Number(form.goalAmount || 0),
    goalQuantity: form.goalQuantity ? Number(form.goalQuantity) : undefined,
    minAmount: form.minAmount ? Number(form.minAmount) : undefined,
    startAt: form.startAt ? `${form.startAt}:00` : undefined,
    endAt: form.endAt ? `${form.endAt}:00` : undefined,
    thumbnailMediaId: thumbnail?.mediaId ? String(thumbnail.mediaId) : undefined,
  })

  const handleSubmit = async () => {
    await updateMutation.mutateAsync(buildSubmitPayload())
  }

  const handleCancel = async () => {
    if (!window.confirm("이 펀딩 캠페인을 취소하시겠습니까?")) return
    await cancelMutation.mutateAsync("seller-console")
  }

  const handleReRegister = async () => {
    if (!window.confirm("현재 설정으로 새 펀딩 캠페인을 재등록하시겠습니까?")) return
    await reRegisterMutation.mutateAsync(buildSubmitPayload())
  }

  const mutationError =
    updateMutation.error?.message
    ?? cancelMutation.error?.message
    ?? reRegisterMutation.error?.message

  return (
    <>
      {saveSuccess ? (
        <Alert>
          <AlertTitle>저장 완료</AlertTitle>
          <AlertDescription>다중 리워드 구성을 포함한 변경 사항이 저장되었습니다.</AlertDescription>
        </Alert>
      ) : null}

      {mutationError ? (
        <Alert variant="destructive">
          <AlertDescription>{mutationError}</AlertDescription>
        </Alert>
      ) : null}

      <Card>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,1.15fr)_22rem]">
            <div className="space-y-5">
              <div className="space-y-2">
                <Label>캠페인 제목</Label>
                <Input value={form.title} onChange={(event) => handleChange("title", event.target.value)} />
              </div>

              <FundingCampaignItemsEditor
                products={products}
                selectedItemIds={selectedItemIds}
                setSelectedItemIds={setSelectedItemIds}
                primaryItemId={primaryItemId}
                setPrimaryItemId={setPrimaryItemId}
                rewardOptions={rewardOptions}
                setRewardOptions={setRewardOptions}
                disabled={updateMutation.isPending || reRegisterMutation.isPending || isThumbnailUploading}
              />

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="flex flex-col gap-1.5">
                  <Label className="flex items-center gap-1">
                    <Store size={13} className="text-primary" />
                    메이커명
                  </Label>
                  <Input value={form.makerName} onChange={(event) => handleChange("makerName", event.target.value)} />
                  <div className="flex justify-end">
                    <Button
                      type="button"
                      size="xs"
                      variant="ghost"
                      onClick={() => handleChange("makerName", defaultMakerName)}
                    >
                      스토어명으로 되돌리기
                    </Button>
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <Label>카테고리</Label>
                  <Input value={form.category} onChange={(event) => handleChange("category", event.target.value)} />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <Label>캠페인 소개</Label>
                <Textarea rows={5} value={form.summary} onChange={(event) => handleChange("summary", event.target.value)} />
              </div>
            </div>

            <div className="space-y-5">
              <ItemThumbnailField
                label="펀딩 대표 이미지"
                hint="캠페인 카드와 상세 요약에 노출할 이미지를 수정합니다."
                value={thumbnail}
                onChange={setThumbnail}
                onUploadingChange={setIsThumbnailUploading}
                disabled={updateMutation.isPending || reRegisterMutation.isPending}
              />

              <div className="rounded-[1.6rem] border border-border/70 bg-white/70 px-4 py-4 dark:bg-slate-950/24">
                <p className="text-sm font-semibold text-foreground">목표 설정</p>
                <div className="mt-4 space-y-4">
                  <div className="flex flex-col gap-1.5">
                    <Label className="flex items-center gap-1">
                      <Target size={13} className="text-primary" />
                      목표 금액
                    </Label>
                    <Input type="number" value={form.goalAmount} onChange={(event) => handleChange("goalAmount", event.target.value)} />
                  </div>
                  {campaign.fundingType === "QUANTITY_BASED" ? (
                    <div className="flex flex-col gap-1.5">
                      <Label>목표 수량</Label>
                      <Input type="number" value={form.goalQuantity} onChange={(event) => handleChange("goalQuantity", event.target.value)} />
                    </div>
                  ) : null}
                  <div className="flex flex-col gap-1.5">
                    <Label>최소 참여 금액</Label>
                    <Input type="number" value={form.minAmount} onChange={(event) => handleChange("minAmount", event.target.value)} />
                  </div>
                </div>
              </div>

              <div className="rounded-[1.6rem] border border-border/70 bg-white/70 px-4 py-4 dark:bg-slate-950/24">
                <p className="text-sm font-semibold text-foreground">일정</p>
                <div className="mt-4 space-y-4">
                  <div className="flex flex-col gap-1.5">
                    <Label className="flex items-center gap-1">
                      <Calendar size={13} className="text-primary" />
                      시작 일시
                    </Label>
                    <Input type="datetime-local" value={form.startAt} onChange={(event) => handleChange("startAt", event.target.value)} />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <Label className="flex items-center gap-1">
                      <Calendar size={13} className="text-primary" />
                      종료 일시
                    </Label>
                    <Input type="datetime-local" value={form.endAt} onChange={(event) => handleChange("endAt", event.target.value)} />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 flex justify-end gap-2">
            {campaign.statusCode === "ACTIVE" ? (
              <Button size="sm" variant="destructive" onClick={handleCancel} disabled={cancelMutation.isPending}>
                <Ban size={14} />
                캠페인 취소
              </Button>
            ) : null}
            {RE_REGISTERABLE_STATUSES.includes(campaign.statusCode) ? (
              <Button size="sm" variant="outline" onClick={handleReRegister} disabled={reRegisterMutation.isPending}>
                <RotateCcw size={14} />
                {reRegisterMutation.isPending ? "재등록 중..." : "펀딩 재등록"}
              </Button>
            ) : null}
            <Button onClick={handleSubmit} disabled={updateMutation.isPending || selectedItemIds.length === 0 || rewardOptions.length === 0 || isThumbnailUploading}>
              <Save size={14} />
              {updateMutation.isPending ? "저장 중..." : "변경 저장"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </>
  )
}

export default function FundingDetailPage() {
  const { campaignId } = useParams()
  const detailQuery = useCampaignQuery(campaignId)
  const { data: productsPayload, isLoading: isProductsLoading } = useSellerProductsQuery()
  const myStoreQuery = useMyStoreQuery()
  const campaign = detailQuery.data
  const products = productsPayload?.items ?? []
  const defaultMakerName =
    myStoreQuery.data?.storeName ?? myStoreQuery.data?.store_name ?? myStoreQuery.data?.name ?? ""

  if (detailQuery.isLoading || isProductsLoading || myStoreQuery.isLoading || !campaign) {
    return (
      <div className="mx-auto flex min-h-[40vh] max-w-3xl items-center justify-center">
        <div className="glass-panel rounded-[1.8rem] px-6 py-8 text-center text-sm text-muted-foreground">
          펀딩 상세를 불러오는 중입니다.
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <PageIntro
        eyebrow="Funding Detail"
        title={campaign.title}
        description="캠페인 메타 정보, 대표 아이템, 다중 리워드 구성을 한 화면에서 수정합니다."
        meta={[
          campaign.status,
          campaign.fundingType === "QUANTITY_BASED" ? "수량 기반" : "금액 기반",
          `아이템 ${campaign.itemIds?.length ?? 1}개`,
          `리워드 ${campaign.rewardOptionCount ?? 0}개`,
        ]}
      >
        <div className="metric-chip rounded-[1.75rem] px-5 py-5">
          <p className="text-[0.72rem] font-semibold uppercase tracking-[0.22em] text-slate-500 dark:text-slate-400">
            Quick actions
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <Button asChild size="sm" variant="outline">
              <Link to="/business/funding">목록으로</Link>
            </Button>
          </div>
        </div>
      </PageIntro>

      <FundingDetailEditor
        key={`${campaign.id}-${campaign.updatedAt ?? ""}`}
        campaign={campaign}
        campaignId={campaignId}
        products={products}
        defaultMakerName={defaultMakerName}
      />
    </div>
  )
}
