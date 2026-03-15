import { useState } from "react";
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from "recharts";
import { TrendingUp, TrendingDown, ShoppingBag, Users, DollarSign, BarChart3 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card.js";
import { Badge } from "@/components/ui/badge.js";

const DAILY = [
  { date: "3/8",  revenue: 320000, orders: 28 },
  { date: "3/9",  revenue: 450000, orders: 35 },
  { date: "3/10", revenue: 280000, orders: 22 },
  { date: "3/11", revenue: 590000, orders: 48 },
  { date: "3/12", revenue: 420000, orders: 34 },
  { date: "3/13", revenue: 680000, orders: 55 },
  { date: "3/14", revenue: 510000, orders: 41 },
];
const WEEKLY = [
  { week: "1주차", thisWeek: 2100000, lastWeek: 1800000 },
  { week: "2주차", thisWeek: 2500000, lastWeek: 2200000 },
  { week: "3주차", thisWeek: 1900000, lastWeek: 2100000 },
  { week: "4주차", thisWeek: 3100000, lastWeek: 2600000 },
];
const CATEGORIES = [
  { name: "식품", value: 45 },
  { name: "음료", value: 20 },
  { name: "디저트", value: 25 },
  { name: "기타", value: 10 },
];
const TOP_ITEMS = [
  { name: "유기농 사과",     sales: 142, revenue: 1704000 },
  { name: "제주 감귤 주스",  sales: 98,  revenue: 637000 },
  { name: "수제 쿠키 세트",  sales: 63,  revenue: 1134000 },
  { name: "제주 한라봉",     sales: 55,  revenue: 715000 },
  { name: "유기농 당근",     sales: 41,  revenue: 369000 },
];
const COLORS = ["rgb(93,171,223)", "rgb(30,157,241)", "rgb(29,161,242)", "rgb(227,236,246)"];
const PERIODS = ["7일", "30일", "90일"];

const TOOLTIP_STYLE = {
  backgroundColor: "var(--card)",
  border: "1px solid var(--border)",
  borderRadius: "8px",
  fontSize: "12px",
  color: "var(--foreground)",
};

function StatCard({ icon: Icon, label, value, sub, trend }) {
  const up = trend >= 0;
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
        <div className="flex items-center gap-1 text-xs">
          {up
            ? <TrendingUp size={12} className="text-green-500" />
            : <TrendingDown size={12} className="text-destructive" />
          }
          <span className={up ? "text-green-600" : "text-destructive"}>
            {up ? "+" : ""}{trend}%
          </span>
          <span className="text-muted-foreground">{sub}</span>
        </div>
      </CardContent>
    </Card>
  );
}

export default function AnalyticsPage() {
  const [period, setPeriod] = useState("7일");
  const totalRevenue = DAILY.reduce((s, d) => s + d.revenue, 0);
  const totalOrders = DAILY.reduce((s, d) => s + d.orders, 0);

  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">판매 분석</h1>
          <p className="text-muted-foreground text-sm mt-1">매출 및 주문 현황을 확인하세요.</p>
        </div>
        <div className="flex gap-1 bg-muted/50 p-1 rounded-lg border border-border">
          {PERIODS.map((p) => (
            <button key={p} onClick={() => setPeriod(p)}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors
                ${period === p ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}>
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* KPI */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard icon={DollarSign} label="총 매출"
          value={`${(totalRevenue / 10000).toFixed(0)}만원`} sub="전주 대비" trend={12.4} />
        <StatCard icon={ShoppingBag} label="총 주문"
          value={`${totalOrders}건`} sub="전주 대비" trend={8.1} />
        <StatCard icon={Users} label="신규 고객"
          value="47명" sub="전주 대비" trend={-3.2} />
        <StatCard icon={BarChart3} label="평균 주문가"
          value={`${Math.round(totalRevenue / totalOrders / 1000)}천원`} sub="전주 대비" trend={5.7} />
      </div>

      {/* Revenue chart */}
      <Card className="mb-4">
        <CardContent className="p-5">
          <h3 className="text-sm font-semibold mb-4">일별 매출 추이</h3>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={DAILY} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
              <defs>
                <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="rgb(93,171,223)" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="rgb(93,171,223)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="date" tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} axisLine={false} tickLine={false} />
              <YAxis tickFormatter={(v) => `${(v / 10000).toFixed(0)}만`}
                tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={TOOLTIP_STYLE} formatter={(v) => [`${v.toLocaleString()}원`, "매출"]} />
              <Area type="monotone" dataKey="revenue" stroke="rgb(93,171,223)" strokeWidth={2} fill="url(#revGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Bottom row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
        <Card className="lg:col-span-2">
          <CardContent className="p-5">
            <h3 className="text-sm font-semibold mb-4">주간 매출 비교</h3>
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={WEEKLY} margin={{ top: 5, right: 10, left: 0, bottom: 5 }} barGap={4}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="week" tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} axisLine={false} tickLine={false} />
                <YAxis tickFormatter={(v) => `${(v / 10000).toFixed(0)}만`}
                  tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={TOOLTIP_STYLE} formatter={(v) => [`${v.toLocaleString()}원`]} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Bar dataKey="thisWeek" name="이번달" fill="rgb(93,171,223)" radius={[4, 4, 0, 0]} />
                <Bar dataKey="lastWeek" name="지난달" fill="rgb(227,236,246)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5">
            <h3 className="text-sm font-semibold mb-4">카테고리 비율</h3>
            <ResponsiveContainer width="100%" height={180}>
              <PieChart>
                <Pie data={CATEGORIES} cx="50%" cy="50%" innerRadius={45} outerRadius={70}
                  dataKey="value" paddingAngle={3}>
                  {CATEGORIES.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip contentStyle={TOOLTIP_STYLE} formatter={(v) => [`${v}%`]} />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex flex-col gap-1.5 mt-1">
              {CATEGORIES.map((c, i) => (
                <div key={i} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ background: COLORS[i] }} />
                    <span className="text-muted-foreground">{c.name}</span>
                  </div>
                  <span className="font-medium">{c.value}%</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top items */}
      <Card>
        <div className="px-5 py-4 border-b border-border">
          <h3 className="text-sm font-semibold">베스트 아이템 TOP 5</h3>
        </div>
        <div className="grid grid-cols-[2fr_1fr_1fr] text-xs font-semibold text-muted-foreground uppercase tracking-wide bg-muted/30 px-5 py-2.5 border-b border-border">
          <span>아이템</span><span>판매량</span><span>매출</span>
        </div>
        {TOP_ITEMS.map((item, idx) => (
          <div key={idx}
            className="grid grid-cols-[2fr_1fr_1fr] items-center px-5 py-3.5 border-b border-border last:border-0 hover:bg-accent/20 transition-colors">
            <div className="flex items-center gap-2">
              <Badge variant={idx === 0 ? "default" : "outline"}
                className="w-5 h-5 rounded-full flex items-center justify-center p-0 text-xs">
                {idx + 1}
              </Badge>
              <span className="text-sm font-medium">{item.name}</span>
            </div>
            <span className="text-sm">{item.sales}개</span>
            <span className="text-sm font-medium text-primary">{item.revenue.toLocaleString()}원</span>
          </div>
        ))}
      </Card>
    </div>
  );
}
