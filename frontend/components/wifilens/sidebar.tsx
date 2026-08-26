"use client";

import { usePathname } from "next/navigation";
import {
  LayoutGrid,
  Radar,
  ChartLine,
  History,
  Settings,
  Wifi,
  LifeBuoy,
  LogOut,
} from "lucide-react";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutGrid },
  { href: "/dashboard/scanner", label: "Scanner", icon: Radar },
  { href: "/dashboard/analytics", label: "Analytics", icon: ChartLine },
  { href: "/dashboard/history", label: "History", icon: History },
  { href: "/dashboard/settings", label: "Settings", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();

  function goTo(href: string) {
    window.location.href = href;
  }

  function handleSignOut() {
    localStorage.removeItem("wifilens_token");
    window.location.href = "/login";
  }

  return (
    <aside className="sticky top-0 z-20 flex h-dvh w-16 shrink-0 flex-col items-center gap-1 border-r border-border bg-[#080b11]/80 py-5 backdrop-blur-xl lg:w-[220px] lg:items-stretch lg:px-4">
      <div className="mb-7 flex items-center gap-3 px-1 lg:px-2">
        <div className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-teal/30 bg-teal/10">
          <Wifi className="h-5 w-5 text-teal" strokeWidth={2.25} />
          <span className="absolute inset-0 rounded-xl bg-teal/20 blur-md animate-glow-pulse" />
        </div>
        <div className="hidden flex-col leading-tight lg:flex">
          <span className="font-semibold tracking-tight">WiFiLens</span>
          <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">v1.0</span>
        </div>
      </div>

      <nav className="flex flex-1 flex-col gap-1">
        {NAV.map((navItem) => {
          const isActive = pathname === navItem.href;
          const Icon = navItem.icon;
          return (
            <div
              key={navItem.href}
              role="button"
              tabIndex={0}
              onClick={() => goTo(navItem.href)}
              className={cn(
                "group relative flex cursor-pointer items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-colors",
                "justify-center lg:justify-start",
                isActive ? "text-foreground" : "text-muted-foreground hover:text-foreground"
              )}
            >
              {isActive && (
                <span className="absolute inset-0 rounded-xl border border-teal/25 bg-gradient-to-r from-teal/[0.16] to-blue/[0.08] shadow-[0_0_20px_-6px_var(--teal)]" />
              )}
              <Icon
                className={cn(
                  "relative h-[18px] w-[18px] shrink-0 transition-colors",
                  isActive ? "text-teal" : "text-muted-foreground group-hover:text-foreground"
                )}
                strokeWidth={2}
              />
              <span className="relative hidden lg:inline">{navItem.label}</span>
            </div>
          );
        })}
      </nav>

      <div className="mt-2 flex flex-col gap-1 border-t border-border pt-3">
        <button
          type="button"
          className="group flex items-center justify-center gap-3 rounded-xl px-3 py-2.5 text-sm text-muted-foreground transition-colors hover:text-foreground lg:justify-start"
        >
          <LifeBuoy className="h-[18px] w-[18px] shrink-0 transition-colors group-hover:text-foreground" strokeWidth={2} />
          <span className="hidden lg:inline">Support</span>
        </button>
        <button
          type="button"
          onClick={handleSignOut}
          className="group flex items-center justify-center gap-3 rounded-xl px-3 py-2.5 text-sm text-muted-foreground transition-colors hover:text-foreground lg:justify-start"
        >
          <LogOut className="h-[18px] w-[18px] shrink-0 transition-colors group-hover:text-foreground" strokeWidth={2} />
          <span className="hidden lg:inline">Sign Out</span>
        </button>
      </div>
    </aside>
  );
}