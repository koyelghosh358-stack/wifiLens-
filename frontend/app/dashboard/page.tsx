"use client";

import { useEffect, useState } from "react";
import { Radar } from "lucide-react";
import { apiGet, Analytics, NetworkObservation } from "@/lib/api";
import { StatCards } from "@/components/wifilens/stat-cards";
import { SignalMap } from "@/components/wifilens/signal-map";
import { ActivityFeed } from "@/components/wifilens/activity-feed";
import { MetricRings } from "@/components/wifilens/metric-rings";

export default function DashboardPage() {
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [networks, setNetworks] = useState<NetworkObservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);
    setError("");
    try {
      const [a, n] = await Promise.all([apiGet("/api/v1/analytics"), apiGet("/api/v1/networks")]);
      setAnalytics(a);
      setNetworks(n);
    } catch {
      setError("Couldn't load data. Make sure the backend is running.");
    } finally {
      setLoading(false);
    }
  }

  const strongest = networks.length > 0 ? [...networks].sort((a, b) => b.rssi - a.rssi)[0] : null;
  const spark = [7, 9, 8, 11, 10, 12, 11, networks.length || 1];

  const excellentPercent = analytics && analytics.total_observations > 0
    ? Math.round(((analytics.excellent_count + analytics.good_count) / analytics.total_observations) * 100)
    : 0;

  const openPercent = analytics && analytics.total_observations > 0
    ? Math.round((analytics.open_networks / analytics.total_observations) * 100)
    : 0;

  const band24 = analytics?.band_distribution?.["2.4GHz"] ?? 0;
  const band5 = analytics?.band_distribution?.["5GHz"] ?? 0;
  const bandSplit = `${band24}/${band5}`;

  return (
    <div>
      <div className="mb-6 flex items-start justify-between">
        <div>
          <h1 className="text-balance text-2xl font-semibold tracking-tight lg:text-[28px]">Dashboard</h1>
          <p className="mt-1 text-sm text-muted-foreground">Real-time diagnostics of the wireless environment around you.</p>
        </div>
        <button
          type="button"
          onClick={loadData}
          disabled={loading}
          className="btn-glow inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold disabled:opacity-80"
        >
          <Radar className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} strokeWidth={2.25} />
          {loading ? "Loading…" : "Refresh"}
        </button>
      </div>

      {error && (
        <div className="glass mb-6 rounded-2xl p-4 text-sm text-quality-weak">{error}</div>
      )}

      <StatCards
        networksDetected={analytics?.unique_networks ?? 0}
        spark={spark}
        strongestSignal={strongest?.rssi ?? null}
        securedNetworks={analytics?.secured_networks ?? 0}
        totalScans={analytics?.total_scans ?? 0}
      />

      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <SignalMap networks={networks} />
        </div>
        <div className="lg:col-span-1">
          <ActivityFeed networks={networks} />
        </div>
      </div>

      <div className="mt-8">
        <MetricRings openPercent={openPercent} excellentPercent={excellentPercent} bandSplit={bandSplit} />
      </div>
    </div>
  );
}