"use client";

import { useEffect, useState } from "react";
import { RefreshCw, ChartLine } from "lucide-react";
import { apiGet, Analytics } from "@/lib/api";
import {
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
} from "recharts";

const QUALITY_COLORS: Record<string, string> = {
  Excellent: "#39f2c0",
  Good: "#4da3ff",
  Fair: "#f2c14e",
  Weak: "#ff8a4d",
  "Very Weak": "#ff5d6c",
};

export default function AnalyticsPage() {
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);
    setError("");
    try {
      const a = await apiGet("/api/v1/analytics");
      setAnalytics(a);
    } catch {
      setError("Couldn't load data. Make sure the backend is running.");
    } finally {
      setLoading(false);
    }
  }

  const qualityData = analytics
    ? [
        { name: "Excellent", value: analytics.excellent_count },
        { name: "Good", value: analytics.good_count },
        { name: "Fair", value: analytics.fair_count },
        { name: "Weak", value: analytics.weak_count },
        { name: "Very Weak", value: analytics.very_weak_count },
      ].filter((d) => d.value > 0)
    : [];

  const bandData = analytics
    ? Object.entries(analytics.band_distribution).map(([band, count]) => ({ band, count }))
    : [];

  const strongestData = analytics
    ? Object.values(
        analytics.strongest_networks.reduce((acc, n) => {
          const key = n.ssid || n.bssid;
          if (!acc[key] || n.rssi > acc[key].rssi) acc[key] = n;
          return acc;
        }, {} as Record<string, typeof analytics.strongest_networks[number]>)
      )
        .sort((a, b) => b.rssi - a.rssi)
        .slice(0, 8)
        .map((n) => ({ name: n.ssid || "(hidden)", rssi: n.rssi + 100 }))
    : [];

  const securityData = analytics
    ? [
        { name: "Secured", value: analytics.secured_networks },
        { name: "Open", value: analytics.open_networks },
      ].filter((d) => d.value > 0)
    : [];

  return (
    <div>
      <div className="mb-6 flex items-start justify-between">
        <div>
          <h1 className="text-balance text-2xl font-semibold tracking-tight lg:text-[28px]">Analytics</h1>
          <p className="mt-1 text-sm text-muted-foreground">Breakdown of every network your scans have detected.</p>
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

      {!error && analytics && analytics.total_observations === 0 && (
        <div className="glass rounded-2xl p-8 text-center text-sm text-muted-foreground">
          No data yet — run a scan first, then come back here.
        </div>
      )}

      {analytics && analytics.total_observations > 0 && (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <div className="glass rounded-2xl p-5">
            <h2 className="mb-1 text-sm font-semibold tracking-tight">Signal Quality Distribution</h2>
            <p className="mb-4 text-xs text-muted-foreground">How strong are the networks around you</p>
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie
                  data={qualityData}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={60}
                  outerRadius={95}
                  paddingAngle={3}
                >
                  {qualityData.map((entry) => (
                    <Cell key={entry.name} fill={QUALITY_COLORS[entry.name] || "#39f2c0"} stroke="none" />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ background: "#0a0e14", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 12, fontSize: 12 }}
                />
                <Legend wrapperStyle={{ fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="glass rounded-2xl p-5">
            <h2 className="mb-1 text-sm font-semibold tracking-tight">Security</h2>
            <p className="mb-4 text-xs text-muted-foreground">Open vs. encrypted networks</p>
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie data={securityData} dataKey="value" nameKey="name" innerRadius={60} outerRadius={95} paddingAngle={3}>
                  <Cell fill="#39f2c0" stroke="none" />
                  <Cell fill="#ff5d6c" stroke="none" />
                </Pie>
                <Tooltip
                  contentStyle={{ background: "#0a0e14", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 12, fontSize: 12 }}
                />
                <Legend wrapperStyle={{ fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="glass rounded-2xl p-5">
            <h2 className="mb-1 text-sm font-semibold tracking-tight">Band Distribution</h2>
            <p className="mb-4 text-xs text-muted-foreground">2.4GHz vs 5GHz vs 6GHz networks</p>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={bandData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" vertical={false} />
                <XAxis dataKey="band" stroke="rgba(255,255,255,0.4)" fontSize={12} />
                <YAxis stroke="rgba(255,255,255,0.4)" fontSize={12} allowDecimals={false} />
                <Tooltip
                  contentStyle={{ background: "#0a0e14", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 12, fontSize: 12 }}
                  cursor={{ fill: "rgba(57,242,192,0.06)" }}
                />
                <Bar dataKey="count" fill="#39f2c0" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="glass rounded-2xl p-5">
            <h2 className="mb-1 text-sm font-semibold tracking-tight">Strongest Networks</h2>
            <p className="mb-4 text-xs text-muted-foreground">Top signal strength (higher = stronger)</p>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={strongestData} layout="vertical" margin={{ left: 24 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" horizontal={false} />
                <XAxis type="number" stroke="rgba(255,255,255,0.4)" fontSize={12} />
                <YAxis dataKey="name" type="category" stroke="rgba(255,255,255,0.4)" fontSize={11} width={110} />
                <Tooltip
                  contentStyle={{ background: "#0a0e14", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 12, fontSize: 12 }}
                  cursor={{ fill: "rgba(77,163,255,0.06)" }}
                                   formatter={(value: any) => [`${Number(value) - 100} dBm`, "Signal"]}
                />
                <Bar dataKey="rssi" fill="#4da3ff" radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
}