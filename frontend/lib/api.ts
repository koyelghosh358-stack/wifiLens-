const API_BASE = "http://127.0.0.1:8000";

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("wifilens_token");
}

export async function apiGet(path: string) {
  const token = getToken();
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });
  if (res.status === 401) {
    localStorage.removeItem("wifilens_token");
    window.location.href = "/login";
    throw new Error("Session expired");
  }
  if (!res.ok) throw new Error(`Request failed: ${res.status}`);
  return res.json();
}

export interface NetworkObservation {
  id: string;
  ssid: string | null;
  bssid: string;
  rssi: number;
  frequency: number;
  band: string;
  channel: number | null;
  security_type: string | null;
  signal_quality: string;
  detected_at: string;
}

export interface Analytics {
  total_scans: number;
  total_observations: number;
  unique_networks: number;
  band_distribution: Record<string, number>;
  excellent_count: number;
  good_count: number;
  fair_count: number;
  weak_count: number;
  very_weak_count: number;
  open_networks: number;
  secured_networks: number;
  strongest_networks: NetworkObservation[];
}

export interface ScanSummary {
  id: string;
  created_at: string;
  network_count: number;
}