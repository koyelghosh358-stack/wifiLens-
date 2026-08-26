"use client";

import { Wifi, Gauge, ShieldCheck, HeartPulse } from "lucide-react";

function Sparkbars({ data, accent }: { data: number[]; accent: string }) {
  const max = Math.max(...data, 1);
  return (
    <div className="flex h-8 items-end gap-1">
      {data.map((v, i) => (
        <span
          key={i}
          className="flex-1 rounded-sm transition-all"
          style={{
            height: `${Math.max(12, (v / max) * 100)}%`,
            background: `linear-gradient(to top, ${accent}66, ${accent})`,
            opacity: 0.35 + (i / data.length) * 0.65,
          }}
        />
      ))}
    </div>
  );
}

function Progress({ value, accent }: { value: number; accent: string }) {
  return (
    <div className="h-1.5 w-full overflow-hidden rounded-full bg-surface-2">
      <div
        className="h-full rounded-full transition-all duration-700"
        style={{
          width: `${value}%`,
          background: `linear-gradient(90deg, ${accent}, var(--blue))`,
          boxShadow: `0 0 10px ${accent}80`,
        }}
      />
    </div>
  );
}

export function StatCards({
  networksDetected,
  spark,
  strongestSignal,
  securedNetworks,
  totalScans,
}: {
  networksDetected: number;
  spark: number[];
  strongestSignal: number | null;
  securedNetworks: number;
  totalScans: number;
}) {
  const signalLoad = strongestSignal ? Math.max(0, Math.min(100, Math.round(100 + strongestSignal))) : 0;

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <article className="glass glass-hover animate-float rounded-2xl p-5" style={{ animationDelay: "0s" }}>
        <div className="flex items-start justify-between">
          <p className="text-sm text-muted-foreground">Networks Detected</p>
          <span className="flex h-9 w-9 items-center justify-center rounded-full border border-teal/25 bg-teal/10">
            <Wifi className="h-[18px] w-[18px] text-teal" strokeWidth={2} />
          </span>
        </div>
        <p className="mt-3 font-mono text-3xl font-semibold tabular-nums">{networksDetected}</p>
        <div className="mt-3">
          <Sparkbars data={spark} accent="var(--teal)" />
        </div>
      </article>

      <article className="glass glass-hover animate-float rounded-2xl p-5" style={{ animationDelay: "0.6s" }}>
        <div className="flex items-start justify-between">
          <p className="text-sm text-muted-foreground">Strongest Signal</p>
          <span className="flex h-9 w-9 items-center justify-center rounded-full border border-blue/25 bg-blue/10">
            <Gauge className="h-[18px] w-[18px] text-blue" strokeWidth={2} />
          </span>
        </div>
        <p className="mt-3 font-mono text-3xl font-semibold tabular-nums">
          {strongestSignal !== null ? `${strongestSignal} dBm` : "—"}
        </p>
        <div className="mt-4">
          <Progress value={signalLoad} accent="var(--blue)" />
        </div>
      </article>

      <article className="glass glass-hover animate-float rounded-2xl p-5" style={{ animationDelay: "1.2s" }}>
        <div className="flex items-start justify-between">
          <p className="text-sm text-muted-foreground">Secured Networks</p>
          <span className="flex h-9 w-9 items-center justify-center rounded-full border border-magenta/25 bg-magenta/10">
            <ShieldCheck className="h-[18px] w-[18px] text-magenta" strokeWidth={2} />
          </span>
        </div>
        <p className="mt-3 font-mono text-3xl font-semibold tabular-nums">{securedNetworks}</p>
        <p className="mt-3 text-xs text-muted-foreground">Using WPA2/WPA3 encryption</p>
      </article>

      <article className="glass glass-hover animate-float rounded-2xl p-5" style={{ animationDelay: "1.8s" }}>
        <div className="flex items-start justify-between">
          <p className="text-sm text-muted-foreground">Total Scans</p>
          <span className="flex h-9 w-9 items-center justify-center rounded-full border border-teal/25 bg-teal/10">
            <HeartPulse className="h-[18px] w-[18px] text-teal" strokeWidth={2} />
          </span>
        </div>
        <p className="mt-3 flex items-center gap-2 text-3xl font-semibold">
          <span className="relative flex h-2.5 w-2.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-teal opacity-60" />
            <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-teal shadow-[0_0_8px_var(--teal)]" />
          </span>
          {totalScans}
        </p>
        <p className="mt-3 text-xs text-muted-foreground">Scan sessions recorded</p>
      </article>
    </div>
  );
}