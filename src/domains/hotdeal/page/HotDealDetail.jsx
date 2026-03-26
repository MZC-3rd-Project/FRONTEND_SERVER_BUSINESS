import { useEffect, useState } from "react"
import { Link, useNavigate, useParams } from "react-router"
import { Clock3, Percent, Save, ShoppingBag, Trash2, TicketPercent, Undo2 } from "lucide-react"
import { useMutation, useQueryClient } from "@tanstack/react-query"

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import PageIntro from "@/components/layout/PageIntro.jsx"
import { hotDealKeys, useHotDealQuery } from "@/domains/hotdeal/hook/useHotDealQuery.js"
import { deleteHotDeal, restoreHotDeal, updateHotDeal } from "@/domains/hotdeal/api/hotDealApi.js"

function formatDateTime(value) {
  if (!value) return ""
  return String(value).replace("T", " ").slice(0, 16)
}

function toDatetimeLocal(value) {
  if (!value) return ""
  return String(value).slice(0, 16).replace(" ", "T")
}

function HotDealEditor({ hotDeal, hotDealId }) {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [saveSuccess, setSaveSuccess] = useState(false)

  const [form, setForm] = useState({
    discountRate: String(hotDeal.discountRate ?? ""),
    maxQuantity: String(hotDeal.maxQuantity ?? ""),
    maxPerUser: hotDeal.maxPerUser != null ? String(hotDeal.maxPerUser) : "",
    startAt: toDatetimeLocal(hotDeal.startAt),
    endAt: toDatetimeLocal(hotDeal.endAt),
  })

  useEffect(() => {
    if (!saveSuccess) return
    const timer = setTimeout(() => setSaveSuccess(false), 3000)
    return () => clearTimeout(timer)
  }, [saveSuccess])

  const updateMutation = useMutation({
    mutationFn: () =>
      updateHotDeal(hotDealId, {
        discountRate: form.discountRate ? Number(form.discountRate) : undefined,
        maxQuantity: form.maxQuantity ? Number(form.maxQuantity) : undefined,
        maxPerUser: form.maxPerUser ? Number(form.maxPerUser) : undefined,
        startAt: form.startAt ? `${form.startAt}:00` : undefined,
        endAt: form.endAt ? `${form.endAt}:00` : undefined,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: hotDealKeys.lists() })
      queryClient.invalidateQueries({ queryKey: hotDealKeys.detail(hotDealId) })
      setSaveSuccess(true)
    },
  })

  const deleteMutation = useMutation({
    mutationFn: () => deleteHotDeal(hotDealId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: hotDealKeys.lists() })
      queryClient.invalidateQueries({ queryKey: hotDealKeys.detail(hotDealId) })
    },
  })

  const restoreMutation = useMutation({
    mutationFn: () => restoreHotDeal(hotDealId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: hotDealKeys.lists() })
      queryClient.invalidateQueries({ queryKey: hotDealKeys.detail(hotDealId) })
    },
  })

  const handleChange = (name, value) => setForm((prev) => ({ ...prev, [name]: value }))

  const handleDelete = async () => {
    if (!window.confirm("이 핫딜을 삭제하시겠습니까?")) return
    await deleteMutation.mutateAsync()
  }

  const handleRestore = async () => {
    if (!window.confirm("삭제된 핫딜을 복구하시겠습니까?")) return
    await restoreMutation.mutateAsync()
  }

  const errorMessage =
    updateMutation.error?.message ?? deleteMutation.error?.message ?? restoreMutation.error?.message

  const isDeleted = hotDeal.statusCode === "DELETED" || deleteMutation.isSuccess

  return (
    <Card>
      <CardContent className="p-6 space-y-6">
        {saveSuccess && (
          <Alert>
            <AlertTitle>저장 완료</AlertTitle>
            <AlertDescription>변경 사항이 성공적으로 저장되었습니다.</AlertDescription>
          </Alert>
        )}
        {errorMessage && (
          <Alert variant="destructive">
            <AlertDescription>{errorMessage}</AlertDescription>
          </Alert>
        )}
        {deleteMutation.isSuccess && (
          <Alert>
            <AlertTitle>삭제 완료</AlertTitle>
            <AlertDescription>핫딜이 삭제되었습니다. 아래 복구 버튼으로 되돌릴 수 있습니다.</AlertDescription>
          </Alert>
        )}

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label>할인율 (%)</Label>
            <Input
              type="number"
              min={1}
              max={90}
              value={form.discountRate}
              onChange={(e) => handleChange("discountRate", e.target.value)}
            />
          </div>
          <div>
            <Label>최대 수량</Label>
            <Input
              type="number"
              min={1}
              value={form.maxQuantity}
              onChange={(e) => handleChange("maxQuantity", e.target.value)}
            />
          </div>
          <div>
            <Label>1인 최대 구매</Label>
            <Input
              type="number"
              min={1}
              value={form.maxPerUser}
              onChange={(e) => handleChange("maxPerUser", e.target.value)}
            />
          </div>
          <div />
          <div>
            <Label>시작 일시</Label>
            <Input
              type="datetime-local"
              value={form.startAt}
              onChange={(e) => handleChange("startAt", e.target.value)}
            />
          </div>
          <div>
            <Label>종료 일시</Label>
            <Input
              type="datetime-local"
              value={form.endAt}
              onChange={(e) => handleChange("endAt", e.target.value)}
            />
          </div>
        </div>

        <div className="flex justify-end gap-2">
          {deleteMutation.isSuccess ? (
            <Button variant="outline" onClick={handleRestore} disabled={restoreMutation.isPending}>
              <Undo2 size={14} />
              {restoreMutation.isPending ? "복구 중..." : "삭제 취소"}
            </Button>
          ) : (
            <Button variant="destructive" size="sm" onClick={handleDelete} disabled={deleteMutation.isPending}>
              <Trash2 size={14} />
              {deleteMutation.isPending ? "삭제 중..." : "핫딜 삭제"}
            </Button>
          )}
          <Button onClick={() => updateMutation.mutate()} disabled={updateMutation.isPending || deleteMutation.isSuccess}>
            <Save size={14} />
            {updateMutation.isPending ? "저장 중..." : "변경 저장"}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

export default function HotDealDetailPage() {
  const { hotDealId } = useParams()
  const detailQuery = useHotDealQuery(hotDealId)
  const hotDeal = detailQuery.data

  if (detailQuery.isLoading) {
    return (
      <div className="mx-auto flex min-h-[40vh] max-w-3xl items-center justify-center">
        <div className="glass-panel rounded-[1.8rem] px-6 py-8 text-center text-sm text-muted-foreground">
          핫딜 상세를 불러오는 중입니다.
        </div>
      </div>
    )
  }

  if (detailQuery.isError || !hotDeal) {
    return (
      <div className="mx-auto max-w-3xl">
        <Alert variant="destructive">
          <AlertDescription>핫딜 정보를 불러올 수 없습니다.</AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <PageIntro
        eyebrow="Hot Deal Detail"
        title={hotDeal.title}
        description="핫딜 상세 및 수정 화면입니다."
        meta={[hotDeal.status, `${hotDeal.discountRate}% 할인`, hotDeal.discountedPriceText]}
      >
        <div className="metric-chip rounded-[1.75rem] px-5 py-5">
          <p className="text-[0.72rem] font-semibold uppercase tracking-[0.22em] text-slate-500 dark:text-slate-400">
            Quick actions
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <Button asChild size="sm" variant="outline">
              <Link to="/business/hotdeal">목록으로</Link>
            </Button>
          </div>
        </div>
      </PageIntro>

      <Card>
        <CardContent className="p-6">
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <div className="metric-chip rounded-[1.5rem] px-4 py-4">
              <div className="flex items-center gap-2">
                <Percent size={16} className="text-primary" />
                <p className="text-sm font-semibold text-foreground">할인율</p>
              </div>
              <p className="mt-3 text-2xl font-semibold text-foreground">{hotDeal.discountRate}%</p>
            </div>
            <div className="metric-chip rounded-[1.5rem] px-4 py-4">
              <div className="flex items-center gap-2">
                <TicketPercent size={16} className="text-primary" />
                <p className="text-sm font-semibold text-foreground">가격</p>
              </div>
              <p className="mt-3 text-lg font-semibold text-foreground">{hotDeal.discountedPriceText}</p>
              {hotDeal.originalPrice && (
                <p className="mt-1 text-xs text-muted-foreground line-through">{hotDeal.originalPriceText}</p>
              )}
            </div>
            <div className="metric-chip rounded-[1.5rem] px-4 py-4">
              <div className="flex items-center gap-2">
                <ShoppingBag size={16} className="text-primary" />
                <p className="text-sm font-semibold text-foreground">판매 현황</p>
              </div>
              <p className="mt-3 text-lg font-semibold text-foreground">
                {hotDeal.soldQuantity} / {hotDeal.maxQuantity}개
              </p>
              <p className="mt-1 text-xs text-muted-foreground">진행률 {hotDeal.progressRate}%</p>
            </div>
            <div className="metric-chip rounded-[1.5rem] px-4 py-4">
              <div className="flex items-center gap-2">
                <Clock3 size={16} className="text-primary" />
                <p className="text-sm font-semibold text-foreground">기간</p>
              </div>
              <p className="mt-3 text-sm font-semibold text-foreground">{formatDateTime(hotDeal.endAt)}</p>
              <p className="mt-1 text-xs text-muted-foreground">시작 {formatDateTime(hotDeal.startAt)}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <HotDealEditor
        key={`${hotDeal.id}-${hotDeal.updatedAt ?? ""}`}
        hotDeal={hotDeal}
        hotDealId={hotDealId}
      />
    </div>
  )
}
