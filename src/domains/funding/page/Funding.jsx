import { useState, useEffect, useActionState } from "react"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { AlertCircle, DollarSign, Hash, Check, Ban } from "lucide-react"
import { Link } from "react-router"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { createCampaignAction } from "../actions/createFundingAction.js"
import { useSellerProductsQuery } from "@/domains/items/hook/useItemsQuery.js"
import { fundingKeys, useCampaignsQuery } from "../hook/useFundingQuery.js"
import { cancelCampaign } from "../api/fundingApi.js"
import FundingFormFields from "@/components/funding/FundingFormFields.jsx"
import PageIntro from "@/components/layout/PageIntro.jsx"
import { demoCampaigns, demoItems } from "@/domains/management/mock/demoData.js"
import { cn } from "@/lib/utils"

const FUNDING_STATUS_META = {
  ACTIVE: { label: "진행 중", variant: "default" },
  SUCCEEDED: { label: "달성 완료", variant: "secondary" },
  FAILED: { label: "실패", variant: "destructive" },
  CANCELLED: { label: "취소됨", variant: "outline" },
}

function getCampaignStatusMeta(status) {
  return FUNDING_STATUS_META[status] ?? { label: status, variant: "outline" }
}

function FundingForm({ onReset }) {
  const [fundingType, setFundingType] = useState("AMOUNT_BASED")
  const [itemId, setItemId] = useState("")
  const queryClient = useQueryClient()

  const [state, formAction, isPending] = useActionState(createCampaignAction, {})
  const { data: productsPayload } = useSellerProductsQuery();
  const products = productsPayload?.items ?? []
  const { data: campaignPage } = useCampaignsQuery()
  const campaignItems = campaignPage?.items ?? []
  const usingDemoFunding = import.meta.env.DEV && products.length === 0 && campaignItems.length === 0
  const sourceProducts = usingDemoFunding ? demoItems : products
  const sellerItemIds = new Set(sourceProducts.map((product) => String(product.id)))
  const campaigns = (usingDemoFunding ? demoCampaigns : campaignItems).filter((campaign) =>
    sellerItemIds.has(String(campaign.itemId))
  )
  const cancelMutation = useMutation({
    mutationFn: ({ campaignId, reason }) => cancelCampaign(campaignId, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: fundingKeys.lists() })
    },
  })

  useEffect(() => {
    if (state.success) {
      queryClient.invalidateQueries({ queryKey: fundingKeys.lists() })
    }
  }, [state.success, queryClient])

  const handleCancelCampaign = (campaign) => {
    if (!window.confirm(`"${campaign.title}" 캠페인을 취소하시겠습니까?`)) {
      return
    }
    cancelMutation.mutate({ campaignId: campaign.id, reason: "seller-console" })
  }

  if (state.success) {
    return (
      <div className="mx-auto flex min-h-[60vh] max-w-xl items-center justify-center">
        <div className="glass-panel surface-hero flex w-full flex-col items-center gap-4 rounded-[2rem] px-8 py-12 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/12">
            <Check size={32} className="text-primary" />
          </div>
          <h2 className="display-title text-3xl font-semibold">펀딩 캠페인 생성 완료!</h2>
          <p className="max-w-md text-sm leading-6 text-muted-foreground">
            펀딩 캠페인이 성공적으로 등록되었습니다. 같은 톤의 운영 플로우에서 다른 아이템도 연이어 설정할 수 있습니다.
          </p>
          <Button onClick={onReset}>다시 등록하기</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <PageIntro
        eyebrow="Funding Management"
        title="펀딩 관리"
        description="금액 기반과 수량 기반 방식을 한 인터페이스에서 전환하며 운영할 수 있도록 정리했습니다. 목표와 기간, 메이커 정보까지 같은 흐름으로 묶었습니다."
        meta={[
          fundingType === "AMOUNT_BASED" ? "금액 기반" : "수량 기반",
          `연결 가능한 아이템 ${products.length}개`,
          `${campaigns.length}개 캠페인 관리`,
        ]}
      >
        <div className="metric-chip rounded-[1.75rem] px-5 py-5">
          <p className="text-[0.72rem] font-semibold uppercase tracking-[0.22em] text-slate-500 dark:text-slate-400">
            Campaign mode
          </p>
          <p className="mt-3 text-lg font-semibold text-foreground">
            {fundingType === "AMOUNT_BASED" ? "목표 금액 중심" : "목표 수량 중심"}
          </p>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            선택한 타입에 따라 핵심 KPI만 강조해 보여줍니다.
          </p>
        </div>
      </PageIntro>

      <Card className="overflow-hidden">
        <div className="flex flex-col gap-4 border-b border-white/70 px-6 py-5 dark:border-slate-800 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="section-kicker">Current campaigns</p>
            <h2 className="display-title mt-2 text-2xl text-foreground">설정된 펀딩</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              진행 중이거나 종료된 펀딩 현황을 먼저 확인한 뒤, 새 캠페인을 추가합니다.
            </p>
          </div>

          <div className="flex items-center gap-2">
            {usingDemoFunding ? <Badge variant="outline">데모 데이터</Badge> : null}
            <Badge variant="outline">{campaigns.length}개 캠페인</Badge>
          </div>
        </div>

        <CardContent className="p-6">
          {campaigns.length > 0 ? (
            <div className="grid gap-4 lg:grid-cols-2">
              {campaigns.map((campaign) => {
                const statusMeta = getCampaignStatusMeta(campaign.statusCode)
                const linkedItem =
                  products.find((product) => String(product.id) === String(campaign.itemId))
                const isActive = campaign.statusCode === "ACTIVE"

                return (
                  <div key={campaign.id} className="metric-chip rounded-[1.6rem] px-5 py-5">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="truncate text-base font-semibold text-foreground">
                          {campaign.title}
                        </p>
                        <div className="mt-2 flex flex-wrap gap-2">
                          <Badge variant={statusMeta.variant}>{statusMeta.label}</Badge>
                          <Badge variant="outline">
                            {campaign.fundingType === "QUANTITY_BASED" ? "수량 기반" : "금액 기반"}
                          </Badge>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-[0.72rem] uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
                          Item
                        </p>
                        <p className="mt-1 text-sm text-muted-foreground">
                          {linkedItem?.title ?? `#${campaign.itemId}`}
                        </p>
                      </div>
                    </div>

                      <div className="mt-4">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">진행률</span>
                        <span className="font-semibold text-foreground">{campaign.progressLabel}</span>
                      </div>
                      <div className="mt-2 h-2 rounded-full bg-muted/70">
                        <div
                          className="h-full rounded-full bg-primary"
                          style={{ width: `${campaign.progressRate}%` }}
                        />
                      </div>
                    </div>

                    <div className="mt-4 grid gap-3 sm:grid-cols-2">
                      <div>
                        <p className="text-[0.72rem] uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
                          기간
                        </p>
                        <p className="mt-1 text-sm text-muted-foreground">
                          {campaign.startAt?.slice?.(0, 10) ?? "-"} ~ {campaign.endAt?.slice?.(0, 10) ?? "-"}
                        </p>
                      </div>
                      <div>
                        <p className="text-[0.72rem] uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
                          메이커
                        </p>
                        <p className="mt-1 text-sm text-muted-foreground">
                          {campaign.makerName ?? "-"}
                        </p>
                      </div>
                    </div>

                    {campaign.summary ? (
                      <p className="mt-4 line-clamp-2 text-sm leading-6 text-muted-foreground">
                        {campaign.summary}
                      </p>
                    ) : null}

                    <div className="mt-5 flex flex-wrap gap-2">
                      <Button asChild size="sm" variant="outline">
                        <Link to={`/business/funding/${campaign.id}`}>상세/수정</Link>
                      </Button>
                      {isActive ? (
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleCancelCampaign(campaign)}
                          disabled={cancelMutation.isPending || usingDemoFunding}
                        >
                          <Ban size={14} />
                          캠페인 취소
                        </Button>
                      ) : null}
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="rounded-[1.8rem] border border-dashed border-border px-6 py-10 text-center">
              <AlertCircle size={24} className="mx-auto text-primary/70" />
              <h3 className="mt-4 text-lg font-semibold text-foreground">
                아직 등록된 펀딩 캠페인이 없습니다
              </h3>
              <p className="mt-2 text-sm text-muted-foreground">
                아래 폼에서 첫 캠페인을 바로 추가할 수 있습니다.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {!usingDemoFunding && cancelMutation.isError && (
        <Alert variant="destructive">
          <AlertDescription>펀딩 캠페인 취소에 실패했습니다.</AlertDescription>
        </Alert>
      )}

      <Card className="overflow-hidden">
        <div className="flex flex-col gap-4 border-b border-white/70 px-6 py-5 dark:border-slate-800 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="section-kicker">Create campaign</p>
            <h2 className="display-title mt-2 text-2xl text-foreground">새 펀딩 등록</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              기존 캠페인과 별도로 새로운 펀딩을 추가할 때만 이 폼을 사용합니다.
            </p>
          </div>

          <div className="metric-chip flex w-full max-w-md gap-2 rounded-full p-1.5">
            <button
              type="button"
              onClick={() => setFundingType("AMOUNT_BASED")}
              className={cn(
                "flex-1 rounded-full px-4 py-2.5 text-sm font-semibold transition-all",
                fundingType === "AMOUNT_BASED"
                  ? "bg-primary text-primary-foreground shadow-[0_12px_24px_rgba(29,161,242,0.18)]"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <span className="flex items-center justify-center gap-2">
                <DollarSign size={15} /> 금액 기반
              </span>
            </button>
            <button
              type="button"
              onClick={() => setFundingType("QUANTITY_BASED")}
              className={cn(
                "flex-1 rounded-full px-4 py-2.5 text-sm font-semibold transition-all",
                fundingType === "QUANTITY_BASED"
                  ? "bg-primary text-primary-foreground shadow-[0_12px_24px_rgba(29,161,242,0.18)]"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <span className="flex items-center justify-center gap-2">
                <Hash size={15} /> 수량 기반
              </span>
            </button>
          </div>
        </div>

        <div className="px-6 py-6">
          <FundingFormFields
            state={state}
            formAction={formAction}
            isPending={isPending}
            fundingType={fundingType}
            itemId={itemId}
            setItemId={setItemId}
            products={sourceProducts}
          />
        </div>
      </Card>
    </div>
  )
}

export default function FundingPage() {
  const [formKey, setFormKey] = useState(0)
  return <FundingForm key={formKey} onReset={() => setFormKey((k) => k + 1)} />
}
