"use client";

import { useEffect, useState } from "react";
import { Router, Wifi, Clock, Terminal, RefreshCw } from "lucide-react";
import { apiGet } from "@/lib/api";

interface Device {
  id: string;
  name: string;
  platform: string;
  api_key: string;
  created_at: string;
  last_seen: string | null;
}

interface ScanSummary {
  id: string;
  created_at: string;
  network_count: number;
}

function timeAgo(iso: string | null) {
  if (!iso) return "Never";
  const diffMs = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins} minute${mins === 1 ? "" : "s"} ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} hour${hours === 1 ? "" : "s"} ago`;
  const days = Math.floor(hours / 24);
  return `${days} day${days === 1 ? "" : "s"} ago`;
}

export default function ScannerPage() {
  const [devices, setDevices] = useState<Device[]>([]);
  const [scans, setScans] = useState<ScanSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);
    setError("");
    try {
      const [d, s] = await Promise.all([apiGet("/api/v1/devices"), apiGet("/api/v1/scans")]);
      setDevices(d);
      setScans(s);
    } catch {
      setError("Couldn't load data. Make sure the backend is running.");
    } finally {
      setLoading(false);
    }
  }

  const lastScan = scans[0];

  return (
    <div>
      <div className="mb-6 flex items-start justify-between">
        <div>
          <h1 className="text-balance text-2xl font-semibold tracking-tight lg:text-[28px]">Scanner</h1>
          <p className="mt-1 text-sm text-muted-foreground">Manage scanning devices and trigger new scans.</p>
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

      {error && (
        <div className="glass mb-6 rounded-2xl p-4 text-sm text-quality-weak">{error}</div>
      )}

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="glass rounded-2xl p-5 lg:col-span-2">
          <h2 className="mb-4 text-sm font-semibold tracking-tight">Registered Devices</h2>
          {devices.length === 0 && (
            <p className="text-sm text-muted-foreground">No devices registered yet. Run <code className="rounded bg-surface px-1.5 py-0.5 font-mono text-xs">register_device.py</code> from the scanner-agent folder to add one.</p>
          )}
          <ul className="flex flex-col gap-3">
            {devices.map((d) => (
              <li key={d.id} className="flex items-center justify-between gap-4 rounded-xl border border-border bg-surface px-4 py-3.5">
                <div className="flex items-center gap-3">
                  <span className="flex h-9 w-9 items-center justify-center rounded-full border border-teal/25 bg-teal/10">
                    <Router className="h-4 w-4 text-teal" strokeWidth={2} />
                  </span>
                  <div>
                    <p className="text-sm font-medium tracking-tight">{d.name}</p>
                    <p className="text-xs capitalize text-muted-foreground">{d.platform}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Clock className="h-3.5 w-3.5" strokeWidth={2} />
                  {timeAgo(d.last_seen)}
                </div>
              </li>
            ))}
          </ul>
        </div>

        <div className="glass rounded-2xl p-5">
          <h2 className="mb-4 text-sm font-semibold tracking-tight">Last Scan</h2>
          {lastScan ? (
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2">
                <Wifi className="h-4 w-4 text-teal" strokeWidth={2} />
                <span className="text-2xl font-semibold tracking-tight">{lastScan.network_count}</span>
                <span className="text-sm text-muted-foreground">networks</span>
              </div>
              <p className="text-xs text-muted-foreground">{timeAgo(lastScan.created_at)}</p>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No scans recorded yet.</p>
          )}
        </div>
      </div>

      <div className="mt-4 glass rounded-2xl p-5">
        <div className="mb-3 flex items-center gap-2">
          <Terminal className="h-4 w-4 text-teal" strokeWidth={2} />
          <h2 className="text-sm font-semibold tracking-tight">Run a New Scan</h2>
        </div>
        <p className="mb-3 text-sm text-muted-foreground">
          Scanning happens locally on your Windows machine. Open a terminal in the <code className="rounded bg-surface px-1.5 py-0.5 font-mono text-xs">scanner-agent</code> folder and run:
        </p>
        <div className="rounded-xl border border-border bg-[#080b11] px-4 py-3 font-mono text-sm text-teal">
          python agent.py
        </div>
        <p className="mt-3 text-xs text-muted-foreground">Then refresh this page or the Dashboard to see the new results.</p>
      </div>
    </div>
  );
}