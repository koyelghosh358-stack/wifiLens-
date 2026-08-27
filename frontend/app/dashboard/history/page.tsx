"use client";

import { useEffect, useState } from "react";
import { History as HistoryIcon, RefreshCw, ChevronDown, Wifi } from "lucide-react";
import { apiGet, NetworkObservation } from "@/lib/api";

interface ScanSummary {
  id: string;
  created_at: string;
  network_count: number;
}

interface ScanDetail extends ScanSummary {
  observations: NetworkObservation[];
}

function formatDate(iso: string) {
  const normalized = iso.endsWith("Z") || iso.includes("+") ? iso : iso + "Z";
  const d = new Date(normalized);
  return d.toLocaleString(undefined, {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function colorForQuality(quality: string) {
  if (quality === "Excellent") return "var(--teal)";
  if (quality === "Good") return "var(--blue)";
  if (quality === "Fair") return "var(--quality-fair)";
  return "var(--quality-weak)";
}

export default function HistoryPage() {
  const [scans, setScans] = useState<ScanSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [details, setDetails] = useState<Record<string, ScanDetail>>({});
  const [detailLoading, setDetailLoading] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);
    setError("");
    try {
      const s = await apiGet("/api/v1/scans");
      setScans(s);
    } catch {
      setError("Couldn't load data. Make sure the backend is running.");
    } finally {
      setLoading(false);
    }
  }

  async function toggleExpand(id: string) {
    if (expandedId === id) {
      setExpandedId(null);
      return;
    }
    setExpandedId(id);
    if (!details[id]) {
      setDetailLoading(id);
      try {
        const d = await apiGet(`/api/v1/scans/${id}`);
        setDetails((prev) => ({ ...prev, [id]: d }));
      } catch {
        // silently ignore; row will just show an error state
      } finally {
        setDetailLoading(null);
      }
    }
  }

  return (
    <div>
      <div className="mb-6 flex items-start justify-between">
        <div>
          <h1 className="text-balance text-2xl font-semibold tracking-tight lg:text-[28px]">History</h1>
          <p className="mt-1 text-sm text-muted-foreground">Every scan session, most recent first.</p>
        </div>
        <button
          type="button"
          onClick={loadData}
          disabled={loading}
          className="btn-glow inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold disabled:opacity-80"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} strokeWidth={2.25} />
          {loading ? "Loading…" : "Refresh"}
        </button>
      </div>

      {error && <div className="glass mb-6 rounded-2xl p-4 text-sm text-quality-weak">{error}</div>}

      {!error && !loading && scans.length === 0 && (
        <div className="glass rounded-2xl p-8 text-center text-sm text-muted-foreground">
          No scans yet — run <code className="rounded bg-surface px-1.5 py-0.5 font-mono text-xs">python agent.py</code> from the scanner-agent folder to record your first one.
        </div>
      )}

      <div className="flex flex-col gap-3">
        {scans.map((scan) => {
          const isOpen = expandedId === scan.id;
          const detail = details[scan.id];
          return (
            <div key={scan.id} className="glass overflow-hidden rounded-2xl">
              <div
                role="button"
                tabIndex={0}
                onClick={() => toggleExpand(scan.id)}
                className="flex cursor-pointer items-center justify-between gap-4 px-5 py-4 transition-colors hover:bg-surface"
              >
                <div className="flex items-center gap-3">
                  <span className="flex h-9 w-9 items-center justify-center rounded-full border border-teal/25 bg-teal/10">
                    <HistoryIcon className="h-4 w-4 text-teal" strokeWidth={2} />
                  </span>
                  <div>
                    <p className="text-sm font-medium tracking-tight">{formatDate(scan.created_at)}</p>
                    <p className="text-xs text-muted-foreground">{scan.network_count} network{scan.network_count === 1 ? "" : "s"} detected</p>
                  </div>
                </div>
                <ChevronDown
                  className={`h-4 w-4 text-muted-foreground transition-transform ${isOpen ? "rotate-180" : ""}`}
                  strokeWidth={2}
                />
              </div>

              {isOpen && (
                <div className="border-t border-border px-5 py-4">
                  {detailLoading === scan.id && (
                    <p className="text-sm text-muted-foreground">Loading networks…</p>
                  )}
                  {detail && (
                    <ul className="flex flex-col gap-2">
                      {detail.observations.map((obs) => (
                        <li key={obs.id} className="flex items-center justify-between gap-3 rounded-xl border border-border bg-surface px-3.5 py-2.5">
                          <div className="flex items-center gap-2.5 min-w-0">
                            <Wifi className="h-3.5 w-3.5 shrink-0" style={{ color: colorForQuality(obs.signal_quality) }} strokeWidth={2} />
                            <span className="truncate text-sm font-medium tracking-tight">{obs.ssid || "(hidden)"}</span>
                          </div>
                          <div className="flex shrink-0 items-center gap-3 text-xs text-muted-foreground">
                            <span>{obs.band}</span>
                            <span>{obs.security_type || "—"}</span>
                            <span className="font-mono" style={{ color: colorForQuality(obs.signal_quality) }}>
                              {obs.rssi} dBm
                            </span>
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}