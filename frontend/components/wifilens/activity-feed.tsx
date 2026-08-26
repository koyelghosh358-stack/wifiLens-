"use client";

import { SlidersHorizontal, CheckCircle2, Wifi, ShieldAlert, ArrowRight } from "lucide-react";
import type { NetworkObservation } from "@/lib/api";

function timeAgo(iso: string) {
  const diffMs = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins} minute${mins === 1 ? "" : "s"} ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} hour${hours === 1 ? "" : "s"} ago`;
  const days = Math.floor(hours / 24);
  return `${days} day${days === 1 ? "" : "s"} ago`;
}

export function ActivityFeed({ networks }: { networks: NetworkObservation[] }) {
  const sorted = [...networks].sort(
    (a, b) => new Date(b.detected_at).getTime() - new Date(a.detected_at).getTime()
  );

  const events = sorted.slice(0, 4).map((n) => {
    if (n.security_type === "Open") {
      return {
        icon: ShieldAlert,
        title: "Open Network Detected",
        desc: `${n.ssid || "(hidden)"} has no encryption`,
        time: timeAgo(n.detected_at),
        accent: "var(--quality-fair)",
      };
    }
    if (n.signal_quality === "Weak" || n.signal_quality === "Very Weak") {
      return {
        icon: ShieldAlert,
        title: "Weak Signal",
        desc: `${n.ssid || "(hidden)"} at ${n.rssi} dBm`,
        time: timeAgo(n.detected_at),
        accent: "var(--quality-weak)",
      };
    }
    return {
      icon: Wifi,
      title: "Network Detected",
      desc: `${n.ssid || "(hidden)"} at ${n.rssi} dBm`,
      time: timeAgo(n.detected_at),
      accent: "var(--teal)",
    };
  });

  return (
    <section className="glass relative flex flex-col rounded-2xl">
      <div className="flex items-center justify-between px-5 py-4">
        <h2 className="text-sm font-semibold tracking-tight">Activity Feed</h2>
        <button
          type="button"
          aria-label="Filter activity"
          className="flex h-8 w-8 items-center justify-center rounded-lg border border-border bg-surface text-muted-foreground transition-colors hover:border-teal/30 hover:text-foreground"
        >
          <SlidersHorizontal className="h-4 w-4" strokeWidth={2} />
        </button>
      </div>

      <ul className="flex flex-col">
        {events.length === 0 && (
          <li className="px-5 py-6 text-sm text-muted-foreground">No activity yet — run a scan to see events here.</li>
        )}
        {events.map((e, i) => (
          <li key={i} className="flex items-start gap-3 border-t border-border/70 px-5 py-3.5 transition-colors hover:bg-surface">
            <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border" style={{ borderColor: `${e.accent}33`, backgroundColor: `${e.accent}14` }}>
              <e.icon className="h-4 w-4" style={{ color: e.accent }} strokeWidth={2} />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium tracking-tight">{e.title}</p>
              <p className="truncate text-xs text-muted-foreground">{e.desc}</p>
            </div>
            <span className="shrink-0 whitespace-nowrap text-[11px] text-muted-foreground/70">{e.time}</span>
          </li>
        ))}
      </ul>

      <div className="mt-auto border-t border-border px-5 py-3.5">
        <button
          type="button"
          onClick={() => (window.location.href = "/dashboard/history")}
          className="group inline-flex items-center gap-1.5 text-xs font-medium text-teal transition-colors hover:text-foreground"
        >
          View full history
          <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" strokeWidth={2} />
        </button>
      </div>
    </section>
  );
}