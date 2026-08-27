"use client";

import { useEffect, useState } from "react";
import { Router, Wifi, Clock, Terminal, RefreshCw, Radar as RadarPing } from "lucide-react";
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
  const normalized = iso.endsWith("Z") || iso.includes("+") ? iso : iso + "Z";
  const diffMs = Date.now() - new Date(normalized).getTime();
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

  const [scanning, setScanning] = useState(false);
  const [scanResult, setScanResult] = useState("");
  const [scanError, setScanError] = useState("");

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);
    setError("");
    const start = Date.now();
    try {
      const [d, s] = await Promise.all([apiGet("/api/v1/devices"), apiGet("/api/v1/scans")]);
      setDevices(d);
      setScans(s);
    } catch {
      setError("Couldn't load data. Make sure the backend is running.");
    } finally {
      const elapsed = Date.now() - start;
      if (elapsed < 500) await new Promise((r) => setTimeout(r, 500 - elapsed));
      setLoading(false);
    }
  }

  async function handleScan() {
    setScanning(true);
    setScanResult("");
    setScanError("");
    try {
            const token = localStorage.getItem("wifilens_token");
      const res = await fetch("http://127.0.0.1:8765/scan", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.detail || "Scan failed");
      }
      const data = await res.json();
      setScanResult(`Scan complete — ${data.network_count} network(s) found.`);
      await new Promise((r) => setTimeout(r, 500));
      await loadData();
    } catch (err) {
      setScanError(
        err instanceof Error
          ? err.message
          : "Couldn't reach the local scanner agent. Is agent_server.py running?"
      );
    } finally {
      setScanning(false);
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
        <p className="mb-4 text-sm text-muted-foreground">
          Triggers a real scan on your Windows machine via the local scanner agent.
        </p>
        <button
          type="button"
          onClick={handleScan}
          disabled={scanning}
          className="btn-glow inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold disabled:opacity-70"
        >
          <RadarPing className={`h-4 w-4 ${scanning ? "animate-spin" : ""}`} strokeWidth={2.25} />
          {scanning ? "Scanning…" : "Run Scan Now"}
        </button>
        {scanResult && (
          <p className="mt-3 text-xs text-teal">{scanResult}</p>
        )}
        {scanError && (
          <p className="mt-3 text-xs text-quality-weak">{scanError}</p>
        )}

      </div>
    </div>
  );
}