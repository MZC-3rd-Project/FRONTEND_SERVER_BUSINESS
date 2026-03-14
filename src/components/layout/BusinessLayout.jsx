import { useState } from "react";
import { Link, useLocation } from "react-router";
import {
  Store, Package, Zap, Tag, BarChart3, Globe,
  LogOut, ChevronLeft, Menu, Sun, Moon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { icon: Store,     label: "가게 생성",  path: "/business/store" },
  { icon: Package,   label: "아이템 등록", path: "/business/items" },
  { icon: Zap,       label: "펀딩 설정",  path: "/business/funding" },
  { icon: Tag,       label: "핫딜 설정",  path: "/business/hotdeal" },
  { icon: BarChart3, label: "판매 분석",  path: "/business/analytics" },
  { icon: Globe,     label: "게이트웨이", path: "/business/gateway" },
];

export default function BusinessLayout({ children }) {
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const [dark, setDark] = useState(false);

  const toggleDark = () => {
    setDark((d) => {
      document.documentElement.classList.toggle("dark", !d);
      return !d;
    });
  };

  return (
    <div className="flex min-h-screen bg-background">
      <aside
        className="flex flex-col bg-sidebar border-r border-sidebar-border transition-all duration-300 shrink-0"
        style={{ width: collapsed ? 64 : 240 }}
      >
        {/* Logo */}
        <div className="flex items-center justify-between h-16 px-3 border-b border-sidebar-border">
          {!collapsed && (
            <span className="font-bold text-foreground text-sm tracking-tight pl-1 truncate">
              Business
            </span>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setCollapsed(!collapsed)}
            className="h-8 w-8 shrink-0 text-muted-foreground"
          >
            {collapsed ? <Menu size={16} /> : <ChevronLeft size={16} />}
          </Button>
        </div>

        {/* Nav */}
        <nav className="flex-1 py-3 px-2 flex flex-col gap-0.5 overflow-y-auto">
          {NAV_ITEMS.map(({ icon: Icon, label, path }) => {
            const active = location.pathname === path;
            return (
              <Link
                key={path}
                to={path}
                title={collapsed ? label : undefined}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-150 text-sm font-medium",
                  active
                    ? "bg-accent text-accent-foreground"
                    : "text-sidebar-foreground hover:bg-accent/60 hover:text-accent-foreground"
                )}
              >
                <Icon size={17} className="shrink-0" />
                {!collapsed && <span className="truncate">{label}</span>}
              </Link>
            );
          })}
        </nav>

        <Separator />

        {/* Footer */}
        <div className="p-2 flex flex-col gap-0.5">
          <button
            onClick={toggleDark}
            title={collapsed ? (dark ? "라이트 모드" : "다크 모드") : undefined}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg w-full text-sm text-muted-foreground hover:bg-accent/60 hover:text-foreground transition-colors"
          >
            {dark ? <Sun size={17} className="shrink-0" /> : <Moon size={17} className="shrink-0" />}
            {!collapsed && <span>{dark ? "라이트 모드" : "다크 모드"}</span>}
          </button>
          <button
            title={collapsed ? "로그아웃" : undefined}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg w-full text-sm text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
          >
            <LogOut size={17} className="shrink-0" />
            {!collapsed && <span>로그아웃</span>}
          </button>
        </div>
      </aside>

      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <div className="flex-1 overflow-y-auto p-6 sm:p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
