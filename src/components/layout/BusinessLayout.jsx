import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router";
import {
  LayoutDashboard,
  Store,
  Package,
  Zap,
  Tag,
  Star,
  MessageSquareMore,
  Globe,
  LogOut,
  ChevronLeft,
  Menu,
  Sun,
  Moon,
  Sparkles,
  ShieldCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  {
    icon: LayoutDashboard,
    label: "대시보드",
    path: "/business/dashboard",
    kicker: "Sales Dashboard",
    description: "매출과 주문 흐름, 주요 지표를 먼저 확인하는 메인 운영 화면입니다.",
    focus: "오늘의 판매 흐름 확인",
  },
  {
    icon: Store,
    label: "가게 관리",
    path: "/business/store",
    kicker: "Store Management",
    description: "가게 기본 정보와 운영 상태를 확인하고 관리하는 스토어 중심 화면입니다.",
    focus: "스토어 정보 점검",
  },
  {
    icon: Package,
    label: "상품 관리",
    path: "/business/items",
    kicker: "Catalog Management",
    description: "굿즈와 공연 상품을 같은 인터페이스 안에서 추가하고 정리합니다.",
    focus: "상품 포트폴리오 운영",
  },
  {
    icon: Zap,
    label: "펀딩 관리",
    path: "/business/funding",
    kicker: "Funding Management",
    description: "런칭 타이밍과 목표치를 설계해 전환을 끌어올리는 펀딩 플로우입니다.",
    focus: "펀딩 캠페인 운영",
  },
  {
    icon: Tag,
    label: "핫딜 관리",
    path: "/business/hotdeal",
    kicker: "Hot Deal Management",
    description: "할인 폭과 한정 수량을 조정해 급격한 수요를 만드는 세일 캡슐입니다.",
    focus: "즉시성 있는 프로모션",
  },
  {
    icon: Star,
    label: "리뷰 관리",
    path: "/business/reviews",
    kicker: "Review Management",
    description: "내 상품에 달린 리뷰를 상품 기준으로 모아보고 평점 흐름을 확인합니다.",
    focus: "고객 피드백 확인",
  },
  {
    icon: MessageSquareMore,
    label: "채팅 문의",
    path: "/business/messages",
    kicker: "Chat Inbox",
    description: "고객 문의 채팅방을 한곳에서 보고 답장하는 seller 문의함입니다.",
    focus: "문의 응답 처리",
  },
  {
    icon: Globe,
    label: "연동 설정",
    path: "/business/gateway",
    kicker: "Integration Settings",
    description: "API 키, 웹훅, 서비스 상태를 운영자 관점으로 안전하게 관리합니다.",
    focus: "연동 안정성 유지",
  },
];

export default function BusinessLayout({ children }) {
  const location = useLocation();
  const isAuthRoute = location.pathname.startsWith("/auth");
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [dark, setDark] = useState(
    () =>
      typeof document !== "undefined" &&
      document.documentElement.classList.contains("dark")
  );

  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
  }, [dark]);

  const activeItem =
    NAV_ITEMS.find((item) => item.path === location.pathname) ?? NAV_ITEMS[0];
  const todayLabel = new Intl.DateTimeFormat("ko-KR", {
    month: "long",
    day: "numeric",
    weekday: "short",
  }).format(new Date());

  const renderNavigation = ({ compact = false, onSelect } = {}) => (
    <nav className="flex flex-1 flex-col gap-2 overflow-y-auto">
      {NAV_ITEMS.map(({ icon, label, path }) => {
        const Icon = icon;
        const active = location.pathname === path;
        return (
          <Link
            key={path}
            to={path}
            onClick={onSelect}
            title={compact ? label : undefined}
            aria-current={active ? "page" : undefined}
            className={cn(
              "group flex items-center gap-3 rounded-[1.35rem] px-3 py-3 text-sm font-medium transition-all duration-200",
              compact ? "justify-center px-0" : "justify-between",
              active
                ? "bg-primary text-white shadow-[0_14px_30px_rgba(29,161,242,0.18)]"
                : "text-sidebar-foreground hover:bg-white/64 hover:text-foreground dark:hover:bg-slate-900/54"
            )}
          >
            <span className="flex items-center gap-3">
              <span
                className={cn(
                  "grid h-10 w-10 place-items-center rounded-2xl border transition-colors",
                  active
                    ? "border-white/12 bg-white/10 text-white"
                    : "border-border bg-white/78 text-primary dark:border-slate-700 dark:bg-slate-950/40"
                )}
              >
                <Icon size={18} className="shrink-0" />
              </span>
              {!compact && <span className="truncate">{label}</span>}
            </span>
            {!compact && (
              <span
                className={cn(
                  "h-2.5 w-2.5 rounded-full transition-all",
                  active ? "bg-white/80" : "bg-slate-300 dark:bg-slate-700"
                )}
              />
            )}
          </Link>
        );
      })}
    </nav>
  );

  if (isAuthRoute) {
    return (
      <div className="auth-stage min-h-screen px-4 py-4 sm:px-6 lg:px-8">
        <div className="relative mx-auto grid min-h-[calc(100vh-2rem)] max-w-[1280px] gap-6 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)]">
          <section className="glass-panel surface-hero hidden flex-col justify-between rounded-[2.25rem] px-8 py-8 lg:flex">
            <div>
              <Badge className="w-fit gap-1.5 rounded-full px-3 py-1 text-[0.72rem]">
                <Sparkles size={12} />
                돈모아
              </Badge>
              <h1 className="display-title mt-6 text-[clamp(2.8rem,4vw,4.6rem)] leading-[0.92] text-foreground">
                판매 운영을
                <br />
                더 선명하게.
              </h1>
              <p className="mt-5 max-w-lg text-base leading-7 text-muted-foreground">
                상품, 펀딩, 핫딜, 연동 설정까지 한 곳에서 관리하는 운영 콘솔입니다.
                복잡한 입력 플로우를 더 가볍고 현대적인 시각 언어로 정리했습니다.
              </p>
            </div>

            <div className="grid gap-4">
              {[
                ["Flow", "멀티 스텝 폼과 운영 화면을 같은 톤으로 통합했습니다."],
                ["Signal", "강한 타이포와 유리질 표면으로 정보 계층을 분명하게 만듭니다."],
                ["Control", "데이터 바인딩은 유지한 채, 운영자가 다루는 감각만 재설계합니다."],
              ].map(([label, text]) => (
                <div
                  key={label}
                  className="metric-chip rounded-[1.75rem] px-5 py-4"
                >
                  <p className="section-kicker">{label}</p>
                  <p className="mt-3 text-sm leading-6 text-muted-foreground">
                    {text}
                  </p>
                </div>
              ))}
            </div>
          </section>

          <div className="flex items-center justify-center py-8 lg:py-10">
            <div className="w-full max-w-[34rem]">{children}</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="business-shell min-h-screen">
      <div className="pointer-events-none absolute left-[-10rem] top-[-9rem] h-72 w-72 rounded-full bg-[radial-gradient(circle,rgba(56,189,248,0.18),transparent_66%)] blur-3xl" />
      <div className="pointer-events-none absolute right-[-8rem] top-28 h-80 w-80 rounded-full bg-[radial-gradient(circle,rgba(14,165,233,0.12),transparent_70%)] blur-3xl" />

      <aside
        className="fixed inset-y-4 left-4 z-40 hidden shrink-0 xl:flex"
        style={{ width: collapsed ? 110 : 286 }}
      >
        <div
          className="glass-panel flex h-full w-full flex-col overflow-hidden rounded-[2.25rem] px-4 py-4"
          style={{ width: collapsed ? 110 : 286 }}
        >
          <div className="flex items-center justify-between gap-3 pb-4">
            <Link
              to="/business/store"
              className={cn("flex items-center gap-3", collapsed && "justify-center")}
            >
              <span className="grid h-12 w-12 place-items-center rounded-[1.4rem] bg-[linear-gradient(135deg,#38bdf8_0%,#1d9bf0_100%)] text-white shadow-[0_14px_30px_rgba(29,161,242,0.18)]">
                <Sparkles size={20} />
              </span>
              {!collapsed && (
                <span className="min-w-0">
                  <span className="block truncate text-xs font-semibold uppercase tracking-[0.28em] text-slate-500">
                    Don-Moa
                  </span>
                  <span className="display-title block truncate text-xl font-semibold text-foreground">
                    돈모아
                  </span>
                </span>
              )}
            </Link>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setCollapsed((value) => !value)}
              className="shrink-0"
              aria-label={collapsed ? "사이드바 확장" : "사이드바 축소"}
            >
              {collapsed ? <Menu size={16} /> : <ChevronLeft size={16} />}
            </Button>
          </div>

          {!collapsed && (
            <div className="metric-chip mb-4 rounded-[1.75rem] px-4 py-4">
              <p className="section-kicker">Control Room</p>
              <p className="mt-3 text-sm font-medium text-foreground">
                판매 운영 흐름을 하나의 시각 언어로 통합했습니다.
              </p>
              <p className="mt-2 text-xs leading-5 text-muted-foreground">
                현재 포커스: {activeItem.focus}
              </p>
            </div>
          )}

          {renderNavigation({ compact: collapsed })}

          <Separator className="my-4 bg-white/70 dark:bg-slate-800" />

          <div className="flex flex-col gap-2">
            <button
              type="button"
              onClick={() => setDark((value) => !value)}
              title={collapsed ? (dark ? "라이트 모드" : "다크 모드") : undefined}
              className="flex items-center gap-3 rounded-[1.35rem] px-3 py-3 text-sm font-medium text-muted-foreground transition-colors hover:bg-white/66 hover:text-foreground dark:hover:bg-slate-900/54"
            >
              <span className="grid h-10 w-10 place-items-center rounded-2xl border border-white/70 bg-white/72 text-primary dark:border-slate-700 dark:bg-slate-950/40">
                {dark ? <Sun size={17} /> : <Moon size={17} />}
              </span>
              {!collapsed && <span>{dark ? "라이트 모드" : "다크 모드"}</span>}
            </button>
            <button
              type="button"
              title={collapsed ? "로그아웃" : undefined}
              className="flex items-center gap-3 rounded-[1.35rem] px-3 py-3 text-sm font-medium text-muted-foreground transition-colors hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/30 dark:hover:text-rose-300"
            >
              <span className="grid h-10 w-10 place-items-center rounded-2xl border border-white/70 bg-white/72 text-rose-500 dark:border-slate-700 dark:bg-slate-950/40">
                <LogOut size={17} />
              </span>
              {!collapsed && <span>로그아웃</span>}
            </button>
          </div>
        </div>
      </aside>

      <div
        className={cn(
          "relative mx-auto flex min-h-screen w-full max-w-[1550px] flex-1 flex-col px-4 py-4 sm:px-6 lg:px-8",
          collapsed ? "xl:pl-[9rem]" : "xl:pl-[20rem]"
        )}
      >
        <header className="sticky top-3 z-30 mb-5">
          <div className="glass-panel overflow-hidden rounded-[1.7rem] px-4 py-3 sm:px-5">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="outline">{activeItem.kicker}</Badge>
                  <Badge variant="outline">{todayLabel}</Badge>
                </div>
                <div className="mt-2 flex items-center gap-3">
                  <h1 className="display-title truncate text-[clamp(1.2rem,1.3vw+0.9rem,1.85rem)] font-semibold leading-none text-foreground">
                    {activeItem.label}
                  </h1>
                  <span className="hidden h-1.5 w-1.5 rounded-full bg-primary/70 sm:block" />
                  <p className="hidden truncate text-sm text-muted-foreground xl:block">
                    {activeItem.focus}
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="outline" className="hidden md:inline-flex">
                  {collapsed ? "Compact rail" : "Expanded rail"}
                </Badge>
                <Badge variant="outline" className="hidden xl:inline-flex">
                  Seller workflow
                </Badge>
              </div>
            </div>

            <div className="mt-3 flex flex-wrap items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setDark((value) => !value)}
              >
                {dark ? <Sun size={14} /> : <Moon size={14} />}
                {dark ? "라이트 모드" : "다크 모드"}
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="xl:hidden"
                onClick={() => setMobileOpen((value) => !value)}
              >
                <Menu size={14} />
                메뉴
              </Button>
              <Badge className="gap-1.5 rounded-full px-3 py-1 text-[0.72rem]">
                <ShieldCheck size={12} />
                돈모아 콘솔
              </Badge>
            </div>
          </div>
        </header>

        <main className="relative flex-1 pb-8">{children}</main>
      </div>

      <div
        className={cn(
          "fixed inset-0 z-50 xl:hidden",
          mobileOpen ? "pointer-events-auto" : "pointer-events-none"
        )}
      >
        <div
          className={cn(
            "absolute inset-0 bg-slate-950/28 backdrop-blur-sm transition-opacity",
            mobileOpen ? "opacity-100" : "opacity-0"
          )}
          onClick={() => setMobileOpen(false)}
        />
        <div
          className={cn(
            "glass-panel absolute inset-y-4 left-4 flex w-[min(82vw,22rem)] flex-col rounded-[2rem] px-4 py-4 transition-transform duration-300",
            mobileOpen ? "translate-x-0" : "-translate-x-[115%]"
          )}
        >
          <div className="mb-4 flex items-center justify-between">
            <div>
              <p className="section-kicker">Navigate</p>
              <p className="display-title mt-2 text-xl text-foreground">돈모아</p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setMobileOpen(false)}
            >
              <ChevronLeft size={16} />
            </Button>
          </div>
          {renderNavigation({ onSelect: () => setMobileOpen(false) })}
        </div>
      </div>
    </div>
  );
}
