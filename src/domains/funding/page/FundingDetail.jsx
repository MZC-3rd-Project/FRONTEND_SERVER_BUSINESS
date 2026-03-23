import { useState } from "react"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { Link, useParams } from "react-router"
import { Ban, Save } from "lucide-react"

import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { fundingKeys, useCampaignQuery } from "@/domains/funding/hook/useFundingQuery.js"
import { cancelCampaign, updateCampaign } from "@/domains/funding/api/fundingApi.js"
import PageIntro from "@/components/layout/PageIntro.jsx"

function buildCampaignForm(campaign) {
  return {
    title: campaign.title ?? "",
    summary: campaign.summary ?? "",
    makerName: campaign.makerName ?? "",
    category: campaign.category ?? "",
    goalAmount: String(campaign.goalAmount ?? 0),
    goalQuantity: campaign.goalQuantity ? String(campaign.goalQuantity) : "",
    minAmount: campaign.minAmount ? String(campaign.minAmount) : "",
    startAt: campaign.startAt?.slice?.(0, 16) ?? "",
    endAt: campaign.endAt?.slice?.(0, 16) ?? "",
  }
}

function FundingDetailEditor({ campaign, campaignId }) {
  const queryClient = useQueryClient()
  const [form, setForm] = useState(() => buildCampaignForm(campaign))

  const updateMutation = useMutation({
    mutationFn: (payload) => updateCampaign(campaignId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: fundingKeys.lists() })
      queryClient.invalidateQueries({ queryKey: fundingKeys.detail(campaignId) })
    },
  })

  const cancelMutation = useMutation({
    mutationFn: (reason) => cancelCampaign(campaignId, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: fundingKeys.lists() })
      queryClient.invalidateQueries({ queryKey: fundingKeys.detail(campaignId) })
    },
  })

  const handleChange = (name, value) => {
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async () => {
    await updateMutation.mutateAsync({
      title: form.title || undefined,
      summary: form.summary || undefined,
      makerName: form.makerName || undefined,
      category: form.category || undefined,
      goalAmount: Number(form.goalAmount || 0),
      goalQuantity: form.goalQuantity ? Number(form.goalQuantity) : undefined,
      minAmount: form.minAmount ? Number(form.minAmount) : undefined,
      startAt: form.startAt ? `${form.startAt}:00` : undefined,
      endAt: form.endAt ? `${form.endAt}:00` : undefined,
    })
  }

  const handleCancel = async () => {
    if (!window.confirm("이 펀딩 캠페인을 취소하시겠습니까?")) return
    await cancelMutation.mutateAsync("seller-console")
  }

  return (
    <>
      {(updateMutation.error || cancelMutation.error) ? (
        <Alert variant="destructive">
          <AlertDescription>
            {updateMutation.error?.message ?? cancelMutation.error?.message ?? "펀딩 처리에 실패했습니다."}
          </AlertDescription>
        </Alert>
      ) : null}

      <Card>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <Label>캠페인 제목</Label>
              <Input value={form.title} onChange={(event) => handleChange("title", event.target.value)} />
            </div>
            <div>
              <Label>메이커명</Label>
              <Input value={form.makerName} onChange={(event) => handleChange("makerName", event.target.value)} />
            </div>
            <div>
              <Label>카테고리</Label>
              <Input value={form.category} onChange={(event) => handleChange("category", event.target.value)} />
            </div>
            <div>
              <Label>목표 금액</Label>
              <Input type="number" value={form.goalAmount} onChange={(event) => handleChange("goalAmount", event.target.value)} />
            </div>
            {campaign.fundingType === "QUANTITY_BASED" ? (
              <div>
                <Label>목표 수량</Label>
                <Input type="number" value={form.goalQuantity} onChange={(event) => handleChange("goalQuantity", event.target.value)} />
              </div>
            ) : null}
            <div>
              <Label>최소 참여 금액</Label>
              <Input type="number" value={form.minAmount} onChange={(event) => handleChange("minAmount", event.target.value)} />
            </div>
            <div>
              <Label>시작 일시</Label>
              <Input type="datetime-local" value={form.startAt} onChange={(event) => handleChange("startAt", event.target.value)} />
            </div>
            <div>
              <Label>종료 일시</Label>
              <Input type="datetime-local" value={form.endAt} onChange={(event) => handleChange("endAt", event.target.value)} />
            </div>
            <div className="sm:col-span-2">
              <Label>요약</Label>
              <Textarea rows={5} value={form.summary} onChange={(event) => handleChange("summary", event.target.value)} />
            </div>
          </div>

          <div className="mt-6 flex justify-end gap-2">
            {campaign.statusCode === "ACTIVE" ? (
              <Button size="sm" variant="destructive" onClick={handleCancel} disabled={cancelMutation.isPending}>
                <Ban size={14} />
                캠페인 취소
              </Button>
            ) : null}
            <Button onClick={handleSubmit} disabled={updateMutation.isPending}>
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
  const campaign = detailQuery.data
  if (detailQuery.isLoading || !campaign) {
    return (
      <div className="mx-auto flex min-h-[40vh] max-w-3xl items-center justify-center">
        <div className="glass-panel rounded-[1.8rem] px-6 py-8 text-center text-sm text-muted-foreground">
          펀딩 상세를 불러오는 중입니다.
        </div>
      </div>
    )
  }

  if (!campaign) {
    return (
      <div className="mx-auto max-w-3xl">
        <Alert variant="destructive">
          <AlertDescription>펀딩 상세를 찾을 수 없습니다.</AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <PageIntro
        eyebrow="Funding Detail"
        title={campaign.title}
        description="펀딩 상세와 수정 화면입니다. 기본 설정을 조정하고 진행 중인 캠페인은 여기서 취소할 수 있습니다."
        meta={[campaign.status, campaign.fundingType, campaign.progressLabel]}
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
      <FundingDetailEditor key={`${campaign.id}-${campaign.updatedAt ?? ""}`} campaign={campaign} campaignId={campaignId} />
    </div>
  )
}
