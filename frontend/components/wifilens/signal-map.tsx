"use client";

import { useMemo, useState } from "react";
import type { NetworkObservation } from "@/lib/api";

const SIZE = 400;
const CENTER = SIZE / 2;
const MAX_R = 168;
const MIN_R = 26;

function signalToRadius(signal: number) {
  const clamped = Math.max(-90, Math.min(-40, signal));
  const t = (clamped - -40) / (-90 - -40);
  return MIN_R + t * (MAX_R - MIN_R);
}

function colorForQuality(quality: string) {
  if (quality === "Excellent") return "var(--teal)";
  if (quality === "Good") return "var(--blue)";
  if (quality === "Fair") return "var(--quality-fair)";
  return "var(--quality-weak)";
}

export function SignalMap({ networks }: { networks: NetworkObservation[] }) {
  const [hovered, setHovered] = useState<{ net: NetworkObservation; x: number; y: number } | null>(null);

  const nodes = useMemo(() => {
    const count = Math.max(networks.length, 1);
    return networks.map((n, i) => {
      const angle = (i / count) * Math.PI * 2 - Math.PI / 2;
      const r = signalToRadius(n.rssi);
      return {
        net: n,
        x: CENTER + Math.cos(angle) * r,
        y: CENTER + Math.sin(angle) * r,
        color: colorForQuality(n.signal_quality),
      };
    });
  }, [networks]);

  const strongest = [...networks].sort((a, b) => b.rssi - a.rssi).slice(0, 5);
  const strongestMax = Math.max(...strongest.map((n) => n.rssi + 100), 1);

  return (
    <section className="glass relative overflow-hidden rounded-2xl">
      <div className="flex items-start justify-between gap-4 px-5 py-4">
        <div>
          <h2 className="text-sm font-semibold tracking-tight">Live Signal Map</h2>
          <p className="mt-0.5 text-xs text-muted-foreground">Real-time RSSI across detected networks</p>
        </div>
        <span className="inline-flex items-center gap-1.5 rounded-full border border-magenta/25 bg-magenta/[0.08] px-2.5 py-1 text-[11px] font-medium text-magenta">
          <span className="relative flex h-1.5 w-1.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-magenta opacity-70" />
            <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-magenta" />
          </span>
          LIVE
        </span>
      </div>

      <div className="relative mx-auto aspect-square w-full max-w-[440px] px-5 pb-5">
        <div className="relative h-full w-full">
          <div
            className="absolute inset-0 animate-radar-sweep rounded-full"
            style={{
              background:
                "conic-gradient(from 0deg, transparent 0deg, rgba(57,242,192,0.14) 38deg, rgba(57,242,192,0.02) 60deg, transparent 72deg)",
              maskImage: "radial-gradient(circle at center, black 66%, transparent 68%)",
              WebkitMaskImage: "radial-gradient(circle at center, black 66%, transparent 68%)",
            }}
          />

          <svg viewBox={`0 0 ${SIZE} ${SIZE}`} className="relative h-full w-full" role="img" aria-label="Radar showing relative signal strength of nearby networks">
            {[0.28, 0.52, 0.76, 1].map((f) => (
              <circle key={f} cx={CENTER} cy={CENTER} r={MAX_R * f} fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth={1} />
            ))}
            <line x1={CENTER} y1={CENTER - MAX_R} x2={CENTER} y2={CENTER + MAX_R} stroke="rgba(255,255,255,0.05)" />
            <line x1={CENTER - MAX_R} y1={CENTER} x2={CENTER + MAX_R} y2={CENTER} stroke="rgba(255,255,255,0.05)" />

            {nodes.map((nd) => (
              <line key={`l-${nd.net.id}`} x1={CENTER} y1={CENTER} x2={nd.x} y2={nd.y} stroke={nd.color} strokeOpacity={0.22} strokeWidth={1} />
            ))}

            <circle cx={CENTER} cy={CENTER} r={5} fill="var(--teal)" />
            <circle cx={CENTER} cy={CENTER} r={11} fill="none" stroke="var(--teal)" strokeOpacity={0.4} />

            {nodes.map((nd) => (
              <g
                key={`n-${nd.net.id}`}
                className="animate-pulse-node cursor-pointer"
                style={{ transformOrigin: `${nd.x}px ${nd.y}px` }}
                onMouseEnter={() => setHovered({ net: nd.net, x: nd.x, y: nd.y })}
                onMouseLeave={() => setHovered(null)}
              >
                <circle cx={nd.x} cy={nd.y} r={14} fill="transparent" />
                <circle cx={nd.x} cy={nd.y} r={9} fill={nd.color} fillOpacity={0.16} />
                <circle cx={nd.x} cy={nd.y} r={3.5} fill={nd.color} />
              </g>
            ))}
          </svg>

          {hovered && (
            <div
              className="pointer-events-none absolute z-20 min-w-[160px] rounded-xl border border-border bg-[#0a0e14]/95 px-3.5 py-3 text-xs shadow-2xl backdrop-blur-md"
              style={{
                left: `${(hovered.x / SIZE) * 100}%`,
                top: `${(hovered.y / SIZE) * 100}%`,
                transform: "translate(-50%, calc(-100% - 14px))",
              }}
            >
              <p className="font-semibold tracking-tight">{hovered.net.ssid || "(hidden)"}</p>
              <div className="mt-1.5 flex items-center justify-between gap-3 text-muted-foreground">
                <span>{hovered.net.band}</span>
                <span>{hovered.net.security_type || "Open"}</span>
              </div>
              <div className="mt-1 flex items-center justify-between gap-3">
                <span className="text-muted-foreground">{hovered.net.signal_quality}</span>
                <span className="font-mono font-semibold" style={{ color: colorForQuality(hovered.net.signal_quality) }}>
                  {hovered.net.rssi} dBm
                </span>
              </div>
            </div>
          )}

          <div className="absolute left-2 top-2 hidden w-32 rounded-lg border border-border bg-[#0a0e14]/70 p-3 backdrop-blur-md sm:block">
            <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">Strongest Signal</p>
            <div className="mt-2 flex h-10 items-end gap-1">
              {strongest.map((n) => (
                <span
                  key={n.id}
                  className="flex-1 rounded-sm bg-gradient-to-t from-teal/40 to-teal"
                  style={{ height: `${((n.rssi + 100) / strongestMax) * 100}%` }}
                  title={`${n.ssid}: ${n.rssi} dBm`}
                />
              ))}
            </div>
            <p className="mt-1.5 font-mono text-xs text-teal">{strongest[0]?.rssi ?? "—"} dBm</p>
          </div>
        </div>
      </div>
    </section>
  );
}