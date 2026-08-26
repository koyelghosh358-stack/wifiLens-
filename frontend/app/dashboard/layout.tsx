"use client";

import { useEffect, useState } from "react";
import { getToken } from "@/lib/api";
import { BackgroundGlow } from "@/components/wifilens/background-glow";
import { Sidebar } from "@/components/wifilens/sidebar";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!getToken()) {
      window.location.href = "/login";
      return;
    }
    setReady(true);
  }, []);

  if (!ready) return null;

  return (
    <div className="relative min-h-dvh">
      <BackgroundGlow />
      <div className="relative flex">
        <Sidebar />
        <main className="flex-1 px-5 py-6 lg:px-8 lg:py-7">{children}</main>
      </div>
    </div>
  );
}