import { useMemo, useState } from "react"
import { Link, useLocation, useParams } from "react-router"
import { Save, Store, Ticket } from "lucide-react"

import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  useSellerItemDetailQuery,
  useSellerProductsQuery,
} from "@/domains/items/hook/useItemsQuery.js"
import {
  useUpdateGoodsMutation,
  useUpdatePerformanceMutation,
} from "@/domains/items/hook/useItemDetailMutations.js"
import PageIntro from "@/components/layout/PageIntro.jsx"
import { useCategoriesQuery } from "@/domains/items/hook/useItemsQuery.js"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

function flattenTree(node) {
  return [
    { id: String(node.id), name: node.name },
    ...(node.children ?? []).flatMap((child) => flattenTree(child)),
  ]
}

function getRouteItemType(locationState, itemSummary) {
  if (locationState?.itemType) return String(locationState.itemType).toUpperCase()
  if (itemSummary?.itemType) return String(itemSummary.itemType).toUpperCase()
  return ""
}

function buildItemForm(item) {
  if (item.itemType === "PERFORMANCE") {
    const firstSeatGrade = item.seatGrades?.[0] ?? {}
    return {
      title: item.title ?? "",
      categoryId: String(item.categoryId ?? ""),
      price: String(item.price ?? 0),
      description: item.description ?? "",
      venue: item.venue ?? "",
      performanceDate: item.performanceDate ?? "",
      performanceTime: String(item.performanceTime ?? "").slice(0, 5),
      totalSeats: String(item.totalSeats ?? 0),
      runningTimeMinutes: item.runningTimeMinutes ? String(item.runningTimeMinutes) : "",
      ageLimit: item.ageLimit ?? "",
      venueAddress: item.venueAddress ?? "",
      bookingNotice: item.bookingNotice ?? "",
      organizer: item.organizer ?? "",
      host: item.host ?? "",
      gradeName: firstSeatGrade.gradeName ?? "일반",
      gradePrice: String(firstSeatGrade.price ?? item.price ?? 0),
    }
  }

  const firstOption = item?.options?.[0] ?? {}
  const shippingInfo = item?.shippingInfo ?? {}
  return {
    title: item.title ?? "",
    categoryId: String(item.categoryId ?? ""),
    price: String(item.price ?? 0),
    description: item.description ?? "",
    optionName: firstOption.optionName ?? "기본",
    additionalPrice: String(firstOption.additionalPrice ?? 0),
    stockQuantity: String(firstOption.stockQuantity ?? 0),
    shippingFee: String(shippingInfo.shippingFee ?? 0),
    estimatedDays: String(shippingInfo.estimatedDays ?? 3),
  }
}

function ItemDetailEditor({ item, categories, itemId }) {
  const [form, setForm] = useState(() => buildItemForm(item))
  const updateGoodsMutation = useUpdateGoodsMutation(itemId)
  const updatePerformanceMutation = useUpdatePerformanceMutation(itemId)

  const handleChange = (name, value) => {
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async () => {
    if (!item || !form) return

    if (item.itemType === "PERFORMANCE") {
      await updatePerformanceMutation.mutateAsync({
        title: form.title,
        categoryId: form.categoryId ? Number(form.categoryId) : undefined,
        price: form.price ? Number(form.price) : undefined,
        description: form.description || undefined,
        venue: form.venue || undefined,
        performanceDate: form.performanceDate || undefined,
        performanceTime: form.performanceTime ? `${form.performanceTime}:00` : undefined,
        totalSeats: form.totalSeats ? Number(form.totalSeats) : undefined,
        runningTimeMinutes: form.runningTimeMinutes ? Number(form.runningTimeMinutes) : undefined,
        ageLimit: form.ageLimit || undefined,
        venueAddress: form.venueAddress || undefined,
        bookingNotice: form.bookingNotice || undefined,
        organizer: form.organizer || undefined,
        host: form.host || undefined,
        seatGrades: [
          {
            gradeName: form.gradeName || "일반",
            price: Number(form.gradePrice || form.price || 0),
            totalQuantity: Number(form.totalSeats || 0),
            fundingQuantity: 0,
          },
        ],
      })
      return
    }

    await updateGoodsMutation.mutateAsync({
      title: form.title,
      categoryId: form.categoryId ? Number(form.categoryId) : undefined,
      price: form.price ? Number(form.price) : undefined,
      description: form.description || undefined,
      options: [
        {
          optionName: form.optionName || "기본",
          additionalPrice: Number(form.additionalPrice || 0),
          stockQuantity: Number(form.stockQuantity || 0),
        },
      ],
      shippingInfo: {
        shippingFee: Number(form.shippingFee || 0),
        estimatedDays: Number(form.estimatedDays || 3),
      },
    })
  }

  const saveBusy = updateGoodsMutation.isPending || updatePerformanceMutation.isPending
  const saveError = updateGoodsMutation.error || updatePerformanceMutation.error

  return (
    <>
      {saveError ? (
        <Alert variant="destructive">
          <AlertDescription>
            {saveError?.message ?? "상품 수정에 실패했습니다."}
          </AlertDescription>
        </Alert>
      ) : null}

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-2">
            {item.itemType === "PERFORMANCE" ? (
              <Ticket size={18} className="text-primary" />
            ) : (
              <Store size={18} className="text-primary" />
            )}
            <h2 className="display-title text-2xl text-foreground">상세 / 수정</h2>
            <Badge variant="outline" className="ml-auto">
              {item.itemType}
            </Badge>
          </div>

          <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <Label>이름</Label>
              <Input value={form.title} onChange={(event) => handleChange("title", event.target.value)} />
            </div>

            <div>
              <Label>카테고리</Label>
              <Select value={form.categoryId} onValueChange={(value) => handleChange("categoryId", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="카테고리 선택" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={String(category.id)}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>가격</Label>
              <Input type="number" value={form.price} onChange={(event) => handleChange("price", event.target.value)} />
            </div>

            {item.itemType === "PERFORMANCE" ? (
              <>
                <div>
                  <Label>공연 장소</Label>
                  <Input value={form.venue} onChange={(event) => handleChange("venue", event.target.value)} />
                </div>
                <div>
                  <Label>공연장 주소</Label>
                  <Input value={form.venueAddress} onChange={(event) => handleChange("venueAddress", event.target.value)} />
                </div>
                <div>
                  <Label>공연 날짜</Label>
                  <Input type="date" value={form.performanceDate} onChange={(event) => handleChange("performanceDate", event.target.value)} />
                </div>
                <div>
                  <Label>공연 시간</Label>
                  <Input type="time" value={form.performanceTime} onChange={(event) => handleChange("performanceTime", event.target.value)} />
                </div>
                <div>
                  <Label>총 좌석 수</Label>
                  <Input type="number" value={form.totalSeats} onChange={(event) => handleChange("totalSeats", event.target.value)} />
                </div>
                <div>
                  <Label>러닝타임</Label>
                  <Input type="number" value={form.runningTimeMinutes} onChange={(event) => handleChange("runningTimeMinutes", event.target.value)} />
                </div>
                <div>
                  <Label>관람 등급</Label>
                  <Input value={form.ageLimit} onChange={(event) => handleChange("ageLimit", event.target.value)} />
                </div>
                <div>
                  <Label>주최</Label>
                  <Input value={form.organizer} onChange={(event) => handleChange("organizer", event.target.value)} />
                </div>
                <div>
                  <Label>주관</Label>
                  <Input value={form.host} onChange={(event) => handleChange("host", event.target.value)} />
                </div>
                <div>
                  <Label>좌석 등급명</Label>
                  <Input value={form.gradeName} onChange={(event) => handleChange("gradeName", event.target.value)} />
                </div>
                <div>
                  <Label>좌석 가격</Label>
                  <Input type="number" value={form.gradePrice} onChange={(event) => handleChange("gradePrice", event.target.value)} />
                </div>
                <div className="sm:col-span-2">
                  <Label>예매 안내</Label>
                  <Textarea rows={3} value={form.bookingNotice} onChange={(event) => handleChange("bookingNotice", event.target.value)} />
                </div>
              </>
            ) : (
              <>
                <div>
                  <Label>옵션명</Label>
                  <Input value={form.optionName} onChange={(event) => handleChange("optionName", event.target.value)} />
                </div>
                <div>
                  <Label>추가 금액</Label>
                  <Input type="number" value={form.additionalPrice} onChange={(event) => handleChange("additionalPrice", event.target.value)} />
                </div>
                <div>
                  <Label>재고</Label>
                  <Input type="number" value={form.stockQuantity} onChange={(event) => handleChange("stockQuantity", event.target.value)} />
                </div>
                <div>
                  <Label>배송비</Label>
                  <Input type="number" value={form.shippingFee} onChange={(event) => handleChange("shippingFee", event.target.value)} />
                </div>
                <div>
                  <Label>예상 배송일</Label>
                  <Input type="number" value={form.estimatedDays} onChange={(event) => handleChange("estimatedDays", event.target.value)} />
                </div>
              </>
            )}

            <div className="sm:col-span-2">
              <Label>설명</Label>
              <Textarea rows={5} value={form.description} onChange={(event) => handleChange("description", event.target.value)} />
            </div>
          </div>

          <div className="mt-6 flex justify-end">
            <Button onClick={handleSubmit} disabled={saveBusy}>
              <Save size={14} />
              {saveBusy ? "저장 중..." : "변경 저장"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </>
  )
}

export default function ItemDetailPage() {
  const { itemId } = useParams()
  const location = useLocation()
  const { data: productsPayload } = useSellerProductsQuery()
  const { data: categoryTree = [] } = useCategoriesQuery()
  const products = productsPayload?.items ?? []
  const itemSummary = products.find((item) => String(item.id) === String(itemId)) ?? null
  const itemType = getRouteItemType(location.state, itemSummary)
  const detailQuery = useSellerItemDetailQuery(itemId, itemType)
  const item = detailQuery.data

  const goodsCategories = useMemo(
    () =>
      categoryTree
        .filter((category) => category.name !== "공연/티켓")
        .flatMap((category) => flattenTree(category)),
    [categoryTree]
  )
  const performanceCategories = useMemo(() => {
    const perfNode = categoryTree.find((category) => category.name === "공연/티켓")
    return perfNode ? flattenTree(perfNode) : []
  }, [categoryTree])

  if (detailQuery.isLoading) {
    return (
      <div className="mx-auto flex min-h-[40vh] max-w-3xl items-center justify-center">
        <div className="glass-panel rounded-[1.8rem] px-6 py-8 text-center text-sm text-muted-foreground">
          상품 상세를 불러오는 중입니다.
        </div>
      </div>
    )
  }

  if (!item) {
    return (
      <div className="mx-auto max-w-3xl">
        <Alert variant="destructive">
          <AlertDescription>상품 상세를 찾을 수 없습니다.</AlertDescription>
        </Alert>
      </div>
    )
  }

  const categories = item.itemType === "PERFORMANCE" ? performanceCategories : goodsCategories

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <PageIntro
        eyebrow="Item Detail"
        title={item.title}
        description="상품 상세와 수정 화면입니다. 관리 목록에서 들어온 뒤 필요한 필드만 바로 수정할 수 있습니다."
        meta={[
          item.itemType === "PERFORMANCE" ? "공연" : "굿즈",
          item.status ?? "상태 미정",
          item.priceText ?? "-",
        ]}
      >
        <div className="metric-chip rounded-[1.75rem] px-5 py-5">
          <p className="text-[0.72rem] font-semibold uppercase tracking-[0.22em] text-slate-500 dark:text-slate-400">
            Quick actions
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <Button asChild size="sm" variant="outline">
              <Link to="/business/items">목록으로</Link>
            </Button>
          </div>
        </div>
      </PageIntro>
      <ItemDetailEditor
        key={`${item.id}-${item.updatedAt ?? ""}`}
        item={item}
        categories={categories}
        itemId={itemId}
      />
    </div>
  )
}
