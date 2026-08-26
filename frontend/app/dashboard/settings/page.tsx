"use client";

import { useEffect, useState } from "react";
import { User, Router, Bell, RadarIcon, LogOut, Wifi } from "lucide-react";
import { apiGet } from "@/lib/api";

interface UserInfo {
  id: string;
  email: string;
  name: string | null;
  created_at: string;
}

interface Device {
  id: string;
  name: string;
  platform: string;
  created_at: string;
  last_seen: string | null;
}

interface Prefs {
  notifyWeakSignal: boolean;
  notifyOpenNetwork: boolean;
  autoRefresh: boolean;
}

const PREFS_KEY = "wifilens_prefs";

function loadPrefs(): Prefs {
  if (typeof window === "undefined") return { notifyWeakSignal: true, notifyOpenNetwork: true, autoRefresh: false };
  try {
    const raw = localStorage.getItem(PREFS_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return { notifyWeakSignal: true, notifyOpenNetwork: true, autoRefresh: false };
}

function Toggle({ checked, onChange }: { checked: boolean; onChange: () => void }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={onChange}
      className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${checked ? "bg-teal" : "bg-surface border border-border"}`}
    >
      <span
        className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition-transform ${checked ? "translate-x-[22px]" : "translate-x-0.5"}`}
      />
    </button>
  );
}

export default function SettingsPage() {
  const [user, setUser] = useState<UserInfo | null>(null);
  const [devices, setDevices] = useState<Device[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [prefs, setPrefs] = useState<Prefs>(loadPrefs);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    localStorage.setItem(PREFS_KEY, JSON.stringify(prefs));
  }, [prefs]);

  async function loadData() {
    setLoading(true);
    setError("");
    try {
      const [u, d] = await Promise.all([apiGet("/api/v1/auth/me"), apiGet("/api/v1/devices")]);
      setUser(u);
      setDevices(d);
    } catch {
      setError("Couldn't load data. Make sure the backend is running.");
    } finally {
      setLoading(false);
    }
  }

  function handleSignOut() {
    localStorage.removeItem("wifilens_token");
    window.location.href = "/login";
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

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-balance text-2xl font-semibold tracking-tight lg:text-[28px]">Settings</h1>
        <p className="mt-1 text-sm text-muted-foreground">Manage your account, devices, and preferences.</p>
      </div>

      {error && <div className="glass mb-6 rounded-2xl p-4 text-sm text-quality-weak">{error}</div>}

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="glass rounded-2xl p-5">
          <div className="mb-4 flex items-center gap-2">
            <User className="h-4 w-4 text-teal" strokeWidth={2} />
            <h2 className="text-sm font-semibold tracking-tight">Account</h2>
          </div>
          {user ? (
            <div className="flex flex-col gap-3">
              <div>
                <p className="text-[11px] uppercase tracking-wider text-muted-foreground">Name</p>
                <p className="text-sm font-medium">{user.name || "—"}</p>
              </div>
              <div>
                <p className="text-[11px] uppercase tracking-wider text-muted-foreground">Email</p>
                <p className="text-sm font-medium">{user.email}</p>
              </div>
              <div>
                <p className="text-[11px] uppercase tracking-wider text-muted-foreground">Member Since</p>
                <p className="text-sm font-medium">{new Date(user.created_at).toLocaleDateString()}</p>
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">{loading ? "Loading…" : "No account data."}</p>
          )}
        </div>

        <div className="glass rounded-2xl p-5">
          <div className="mb-4 flex items-center gap-2">
            <Router className="h-4 w-4 text-teal" strokeWidth={2} />
            <h2 className="text-sm font-semibold tracking-tight">Devices</h2>
          </div>
          {devices.length === 0 && <p className="text-sm text-muted-foreground">No devices registered yet.</p>}
          <ul className="flex flex-col gap-3">
            {devices.map((d) => (
              <li key={d.id} className="flex items-center justify-between gap-3 rounded-xl border border-border bg-surface px-3.5 py-3">
                <div className="flex items-center gap-2.5">
                  <Wifi className="h-4 w-4 text-teal" strokeWidth={2} />
                  <div>
                    <p className="text-sm font-medium tracking-tight">{d.name}</p>
                    <p className="text-xs capitalize text-muted-foreground">{d.platform}</p>
                  </div>
                </div>
                <span className="text-xs text-muted-foreground">{timeAgo(d.last_seen)}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="glass rounded-2xl p-5 lg:col-span-2">
          <div className="mb-4 flex items-center gap-2">
            <Bell className="h-4 w-4 text-teal" strokeWidth={2} />
            <h2 className="text-sm font-semibold tracking-tight">Preferences</h2>
          </div>
          <div className="flex flex-col divide-y divide-border">
            <div className="flex items-center justify-between py-3">
              <div>
                <p className="text-sm font-medium">Notify on weak signal</p>
                <p className="text-xs text-muted-foreground">Flag networks below -80 dBm in Activity Feed</p>
              </div>
              <Toggle
                checked={prefs.notifyWeakSignal}
                onChange={() => setPrefs((p) => ({ ...p, notifyWeakSignal: !p.notifyWeakSignal }))}
              />
            </div>
            <div className="flex items-center justify-between py-3">
              <div>
                <p className="text-sm font-medium">Notify on open networks</p>
                <p className="text-xs text-muted-foreground">Flag unsecured networks in Activity Feed</p>
              </div>
              <Toggle
                checked={prefs.notifyOpenNetwork}
                onChange={() => setPrefs((p) => ({ ...p, notifyOpenNetwork: !p.notifyOpenNetwork }))}
              />
            </div>
            <div className="flex items-center justify-between py-3">
              <div className="flex items-center gap-2">
                <RadarIcon className="h-3.5 w-3.5 text-muted-foreground" strokeWidth={2} />
                <div>
                  <p className="text-sm font-medium">Auto-refresh Dashboard</p>
                  <p className="text-xs text-muted-foreground">Reload data every 30 seconds automatically</p>
                </div>
              </div>
              <Toggle
                checked={prefs.autoRefresh}
                onChange={() => setPrefs((p) => ({ ...p, autoRefresh: !p.autoRefresh }))}
              />
            </div>
          </div>
        </div>

        <div className="glass rounded-2xl p-5 lg:col-span-2">
          <button
            type="button"
            onClick={handleSignOut}
            className="inline-flex items-center gap-2 rounded-xl border border-quality-weak/30 bg-quality-weak/10 px-4 py-2.5 text-sm font-medium text-quality-weak transition-colors hover:bg-quality-weak/15"
          >
            <LogOut className="h-4 w-4" strokeWidth={2} />
            Sign Out
          </button>
        </div>
      </div>
    </div>
  );
}