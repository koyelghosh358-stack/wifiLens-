"use client";

import { useEffect, useState } from "react";
import { Radar } from "lucide-react";
import { apiGet, NetworkObservation } from "@/lib/api";
import { StatCards } from "@/components/wifilens/stat-cards";
import { SignalMap } from "@/components/wifilens/signal-map";
import { ActivityFeed } from "@/components/wifilens/activity-feed";
import { MetricRings } from "@/components/wifilens/metric-rings";

interface ScanSummary {
  id: string;
  created_at: string;
  network_count: number;
}

export default function DashboardPage() {
  const [networks, setNetworks] = useState<NetworkObservation[]>([]);
  const [totalScans, setTotalScans] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);
    setError("");
    try {
      const scans: ScanSummary[] = await apiGet("/api/v1/scans");
      setTotalScans(scans.length);

      if (scans.length > 0) {
        const latest = await apiGet(`/api/v1/scans/${scans[0].id}`);
        setNetworks(latest.observations || []);
      } else {
        setNetworks([]);
      }
    } catch {
      setError("Couldn't load data. Make sure the backend is running.");
    } finally {
      setLoading(false);
    }
  }

  const strongest = networks.length > 0 ? [...networks].sort((a, b) => b.rssi - a.rssi)[0] : null;
  const spark = [7, 9, 8, 11, 10, 12, 11, networks.length || 1];

  const excellentCount = networks.filter((n) => n.signal_quality === "Excellent" || n.signal_quality === "Good").length;
  const excellentPercent = networks.length > 0 ? Math.round((excellentCount / networks.length) * 100) : 0;

  const openCount = networks.filter((n) => n.security_type === "Open").length;
  const openPercent = networks.length > 0 ? Math.round((openCount / networks.length) * 100) : 0;
  const securedCount = networks.length - openCount;

  const band24 = networks.filter((n) => n.band === "2.4GHz").length;
  const band5 = networks.filter((n) => n.band === "5GHz").length;
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
        networksDetected={networks.length}
        spark={spark}
        strongestSignal={strongest?.rssi ?? null}
        securedNetworks={securedCount}
        totalScans={totalScans}
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