import { useState } from "react";
import { Link } from "react-router";
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from "recharts";
import {
  Activity,
  AlertTriangle,
  BarChart3,
  DollarSign,
  Package2,
  Search,
  ShoppingBag,
  Star,
  Store,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card.js";
import { Badge } from "@/components/ui/badge.js";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert.tsx";
import PageIntro from "@/components/layout/PageIntro.jsx";
import { cn } from "@/lib/utils";
import { useSellerDashboardOverviewQuery } from "@/domains/analytics/hook/useAnalyticsQuery.js";
import { useMyStoreQuery } from "@/domains/items/hook/useItemsQuery.js";

const COLORS = ["#2563eb", "#38bdf8", "#14b8a6", "#dbeafe"];
const PERIODS = ["7일", "30일", "90일"];

const TOOLTIP_STYLE = {
  backgroundColor: "var(--card)",
  border: "1px solid var(--border)",
  borderRadius: "8px",
  fontSize: "12px",
  color: "var(--foreground)",
};

const currencyFormatter = new Intl.NumberFormat("ko-KR")
const decimalFormatter = new Intl.NumberFormat("ko-KR", {
  minimumFractionDigits: 1,
  maximumFractionDigits: 1,
})

function formatCurrency(value) {
  return `${currencyFormatter.format(Number(value) || 0)}원`
}

function formatCount(value, unit = "건") {
  return `${currencyFormatter.format(Number(value) || 0)}${unit}`
}

function formatPercent(value) {
  return `${decimalFormatter.format(Number(value) || 0)}%`
}

function formatAsOf(value) {
  if (!value) {
    return "집계 시각 없음"
  }

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) {
    return value
  }

  return new Intl.DateTimeFormat("ko-KR", {
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date)
}

function StatCard({ icon, label, value, sub }) {
  const Icon = icon;
  return (
    <Card>
      <CardContent className="p-4 flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">{label}</span>
          <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center">
            <Icon size={16} className="text-accent-foreground" />
          </div>
        </div>
        <p className="text-2xl font-bold">{value}</p>
        <p className="text-xs text-muted-foreground">{sub}</p>
      </CardContent>
    </Card>
  );
}

function LoadingMetricCard() {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="animate-pulse space-y-3">
          <div className="h-4 w-24 rounded-full bg-slate-200/70 dark:bg-slate-800/70" />
          <div className="h-8 w-28 rounded-full bg-slate-200/70 dark:bg-slate-800/70" />
          <div className="h-3 w-36 rounded-full bg-slate-200/70 dark:bg-slate-800/70" />
        </div>
      </CardContent>
    </Card>
  )
}

export default function AnalyticsPage() {
  const [period, setPeriod] = useState("7일");
  const myStoreQuery = useMyStoreQuery()
  const analyticsQuery = useSellerDashboardOverviewQuery({
    storeId: myStoreQuery.data?.id,
    period,
    enabled: Boolean(myStoreQuery.data?.id),
  })

  const dashboard = analyticsQuery.data
  const isLoading = myStoreQuery.isLoading || analyticsQuery.isLoading
  const hasStore = Boolean(myStoreQuery.data?.id)
  const series = dashboard?.series ?? []
  const itemMix = dashboard?.itemMix ?? []
  const salesFunnelSteps = dashboard?.salesFunnel?.steps ?? []
  const hasAnalyticsError = analyticsQuery.isError
  const analyticsErrorMessage = analyticsQuery.error?.message ?? "판매 분석을 불러오지 못했습니다."

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <PageIntro
        eyebrow="Sales Dashboard"
        title="판매 대시보드"
        description="백엔드 analytics overview 응답을 기준으로 매출, 주문, 검색 유입, 상품 상태를 한 화면에서 점검하는 운영 화면입니다. 하드코딩 지표 대신 실제 집계값을 기준으로 읽도록 정리했습니다."
        meta={[
          dashboard ? `실매출 ${formatCurrency(dashboard.sales.netSales)}` : "실매출 집계 준비 중",
          dashboard ? `${formatCount(dashboard.sales.orderCount)} 주문` : "주문 집계 준비 중",
          dashboard?.queryRange?.from && dashboard?.queryRange?.to
            ? `${dashboard.queryRange.from} ~ ${dashboard.queryRange.to}`
            : `${period} 기준`,
        ]}
      >
        <div className="metric-chip rounded-[1.75rem] px-4 py-4">
          <p className="text-[0.72rem] font-semibold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">
            Period
          </p>
          <div className="mt-3 flex gap-2">
            {PERIODS.map((p) => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={cn(
                "flex-1 rounded-full px-3 py-2 text-xs font-semibold transition-all",
                period === p
                    ? "bg-primary text-primary-foreground shadow-[0_12px_24px_rgba(29,161,242,0.18)]"
                    : "bg-white/72 text-muted-foreground hover:bg-accent hover:text-foreground dark:bg-slate-950/38"
                )}
              >
                {p}
              </button>
            ))}
          </div>
          <div className="mt-4 flex items-center justify-between gap-3">
            <div>
              <p className="text-[0.72rem] font-semibold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">
                Freshness
              </p>
              <p className="mt-2 text-sm font-medium text-foreground">
                {dashboard ? formatAsOf(dashboard.asOf) : "집계 시각 확인 중"}
              </p>
            </div>
            <Badge variant={dashboard?.lagStatus === "DEGRADED" ? "destructive" : "outline"}>
              {dashboard?.lagStatusLabel ?? "로딩 중"}
            </Badge>
          </div>
        </div>
      </PageIntro>

      {!hasStore && !myStoreQuery.isLoading ? (
        <Card>
          <CardHeader>
            <CardTitle>스토어가 아직 연결되지 않았습니다.</CardTitle>
            <CardDescription>
              현재 BFF overview API는 `storeId`를 기준으로 분석 데이터를 조회합니다. 스토어를 먼저 생성해야 대시보드 집계가 정상 동작합니다.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link
              to="/business/store"
              className="inline-flex rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-[0_12px_24px_rgba(29,161,242,0.18)]"
            >
              스토어 설정으로 이동
            </Link>
          </CardContent>
        </Card>
      ) : null}

      {hasAnalyticsError ? (
        <Alert variant="destructive">
          <AlertTriangle />
          <AlertTitle>판매 분석 조회 실패</AlertTitle>
          <AlertDescription>
            {analyticsErrorMessage}
          </AlertDescription>
        </Alert>
      ) : null}

      {dashboard?.partial || dashboard?.lagStatus === "DEGRADED" ? (
        <Alert>
          <AlertTriangle />
          <AlertTitle>부분 집계 상태</AlertTitle>
          <AlertDescription>
            분석 서비스가 최신 이벤트를 모두 반영하지 못했을 수 있습니다. 취소, 환불, 퍼널 단계는 잠시 뒤 다시 확인하는 편이 안전합니다.
          </AlertDescription>
        </Alert>
      ) : null}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {isLoading ? (
          <>
            <LoadingMetricCard />
            <LoadingMetricCard />
            <LoadingMetricCard />
            <LoadingMetricCard />
          </>
        ) : (
          <>
            <StatCard
              icon={DollarSign}
              label="총매출"
              value={formatCurrency(dashboard?.sales.grossSales)}
              sub={`실매출 ${formatCurrency(dashboard?.sales.netSales)}`}
            />
            <StatCard
              icon={ShoppingBag}
              label="주문건수"
              value={formatCount(dashboard?.sales.orderCount)}
              sub={`취소 ${formatCount(dashboard?.sales.cancelCount)} / 환불 ${formatCount(dashboard?.sales.refundCount)}`}
            />
            <StatCard
              icon={BarChart3}
              label="객단가"
              value={formatCurrency(dashboard?.sales.averageOrderValue)}
              sub={`${period} 동안의 실매출 기준`}
            />
            <StatCard
              icon={Search}
              label="검색 전환율"
              value={formatPercent(dashboard?.search.ctrPercent)}
              sub={`검색 ${formatCount(dashboard?.search.searchCount, "회")} / 클릭 ${formatCount(dashboard?.search.clickCount, "회")}`}
            />
          </>
        )}
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
        <Card>
          <CardHeader>
            <CardTitle>일별 매출 흐름</CardTitle>
            <CardDescription>
              BFF overview 응답의 `series`를 그대로 사용해 총매출과 실매출을 함께 표시합니다.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={260}>
              <AreaChart data={series} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                <defs>
                  <linearGradient id="grossSalesGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="rgb(37,99,235)" stopOpacity={0.22} />
                    <stop offset="95%" stopColor="rgb(37,99,235)" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="netSalesGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="rgb(20,184,166)" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="rgb(20,184,166)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis
                  dataKey="label"
                  tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tickFormatter={(value) => `${Math.round((Number(value) || 0) / 10000)}만`}
                  tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  contentStyle={TOOLTIP_STYLE}
                  formatter={(value, name) => [formatCurrency(value), name === "grossSales" ? "총매출" : "실매출"]}
                  labelFormatter={(label) => `${label}`}
                />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Area
                  type="monotone"
                  dataKey="grossSales"
                  name="총매출"
                  stroke="rgb(37,99,235)"
                  strokeWidth={2}
                  fill="url(#grossSalesGradient)"
                />
                <Area
                  type="monotone"
                  dataKey="netSales"
                  name="실매출"
                  stroke="rgb(20,184,166)"
                  strokeWidth={2}
                  fill="url(#netSalesGradient)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>운영 상태</CardTitle>
            <CardDescription>
              검색, 리뷰, 상품 공개 상태를 요약해서 보여줍니다.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="rounded-[1.4rem] border border-border/70 bg-white/55 px-4 py-4 dark:bg-slate-950/28">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">상품 상태</span>
                <Package2 size={16} className="text-primary" />
              </div>
              <div className="mt-3 grid grid-cols-3 gap-3 text-center">
                <div>
                  <p className="text-lg font-semibold">{currencyFormatter.format(dashboard?.item.onSaleCount ?? 0)}</p>
                  <p className="text-xs text-muted-foreground">판매중</p>
                </div>
                <div>
                  <p className="text-lg font-semibold">{currencyFormatter.format(dashboard?.item.soldOutCount ?? 0)}</p>
                  <p className="text-xs text-muted-foreground">품절</p>
                </div>
                <div>
                  <p className="text-lg font-semibold">{currencyFormatter.format(dashboard?.item.hiddenCount ?? 0)}</p>
                  <p className="text-xs text-muted-foreground">숨김</p>
                </div>
              </div>
            </div>

            <div className="rounded-[1.4rem] border border-border/70 bg-white/55 px-4 py-4 dark:bg-slate-950/28">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">리뷰 지표</span>
                <Star size={16} className="text-primary" />
              </div>
              <div className="mt-3 grid grid-cols-2 gap-3">
                <div>
                  <p className="text-lg font-semibold">{formatCount(dashboard?.review.reviewCount)}</p>
                  <p className="text-xs text-muted-foreground">누적 리뷰</p>
                </div>
                <div>
                  <p className="text-lg font-semibold">{decimalFormatter.format(dashboard?.review.averageRating ?? 0)}</p>
                  <p className="text-xs text-muted-foreground">평균 평점</p>
                </div>
              </div>
            </div>

            <div className="rounded-[1.4rem] border border-border/70 bg-white/55 px-4 py-4 dark:bg-slate-950/28">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">집계 상태</span>
                <Activity size={16} className="text-primary" />
              </div>
              <div className="mt-3 flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold">{dashboard?.lagStatusLabel ?? "로딩 중"}</p>
                  <p className="text-xs text-muted-foreground">{formatAsOf(dashboard?.asOf)}</p>
                </div>
                <Badge variant={dashboard?.lagStatus === "DEGRADED" ? "destructive" : "outline"}>
                  {dashboard?.apiVersion ?? "v1"}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>일반 판매 퍼널</CardTitle>
            <CardDescription>
              검색에서 결제까지 실제 journey 이벤트를 기준으로 전환 단계를 확인합니다.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={salesFunnelSteps} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis
                  dataKey="label"
                  tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  contentStyle={TOOLTIP_STYLE}
                  formatter={(value) => [formatCount(value), "건수"]}
                />
                <Bar dataKey="count" name="건수" fill="rgb(93,171,223)" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>상품 상태 비중</CardTitle>
            <CardDescription>
              `item` KPI에서 내려온 공개 상태 분포입니다.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={itemMix}
                  cx="50%"
                  cy="50%"
                  innerRadius={48}
                  outerRadius={76}
                  dataKey="value"
                  paddingAngle={3}
                >
                  {itemMix.map((entry, index) => (
                    <Cell key={entry.name} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={TOOLTIP_STYLE} formatter={(value) => [formatCount(value, "개")]} />
              </PieChart>
            </ResponsiveContainer>
            <div className="mt-1 flex flex-col gap-2">
              {itemMix.map((entry, index) => (
                <div key={entry.name} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="h-2.5 w-2.5 rounded-full" style={{ background: COLORS[index % COLORS.length] }} />
                    <span className="text-muted-foreground">{entry.name}</span>
                  </div>
                  <span className="font-medium">{formatCount(entry.value, "개")}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {dashboard?.promotionFunnels?.map((domain) => (
          <Card key={domain.domainType}>
            <CardHeader>
              <CardTitle>{domain.label} 전환</CardTitle>
              <CardDescription>
                {domain.label} 도메인 이벤트를 기준으로 계산한 전환 현황입니다.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="rounded-[1.4rem] border border-border/70 bg-white/55 px-4 py-4 dark:bg-slate-950/28">
                <p className="text-sm text-muted-foreground">전환율</p>
                <p className="mt-2 text-2xl font-semibold">{formatPercent(domain.conversionRate * 100)}</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  진입 {formatCount(domain.entryCount, "건")} / 전환 {formatCount(domain.conversionCount, "건")}
                </p>
              </div>
              <div className="space-y-2">
                {domain.steps.map((step) => (
                  <div
                    key={`${domain.domainType}-${step.step}`}
                    className="flex items-center justify-between rounded-[1.1rem] border border-border/60 px-3 py-2"
                  >
                    <span className="text-sm text-muted-foreground">{step.label}</span>
                    <span className="text-sm font-semibold">{formatCount(step.count)}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}

        <Card>
          <CardHeader>
            <CardTitle>연동 메모</CardTitle>
            <CardDescription>
              현재 대시보드 연동에서 주의해야 할 지점을 운영 관점으로 묶었습니다.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm leading-6 text-muted-foreground">
            <div className="rounded-[1.4rem] border border-border/70 bg-white/55 px-4 py-4 dark:bg-slate-950/28">
              <p className="font-semibold text-foreground">스토어 ID 필수</p>
              <p className="mt-2">
                overview BFF는 `storeId`가 없으면 안전하지 않은 fallback을 탈 수 있어서, 프론트에서 스토어 조회 후 명시적으로 넘기도록 수정했습니다.
              </p>
            </div>
            <div className="rounded-[1.4rem] border border-border/70 bg-white/55 px-4 py-4 dark:bg-slate-950/28">
              <p className="font-semibold text-foreground">현재 백엔드 제공 범위</p>
              <p className="mt-2">
                카테고리별 매출, 상품별 TOP 매출은 overview 응답에 없어서 제거했습니다. 대신 실제 제공되는 매출 시계열, 퍼널, 리뷰, 상품 상태 지표로 구성했습니다.
              </p>
            </div>
            <div className="rounded-[1.4rem] border border-border/70 bg-white/55 px-4 py-4 dark:bg-slate-950/28">
              <p className="font-semibold text-foreground">남은 데모 의존</p>
              <p className="mt-2">
                펀딩, 핫딜, 리뷰, 채팅 일부 경로는 아직 demo fallback이 남아 있습니다. 대시보드는 실제 API 기준으로 붙였지만 전체 PO 화면은 아직 완전한 실데이터 전환 전 단계입니다.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
