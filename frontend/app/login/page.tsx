"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Eye, EyeOff } from "lucide-react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch("http://127.0.0.1:8000/api/v1/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.detail || "Login failed");
      }

      const data = await response.json();
      localStorage.setItem("wifilens_token", data.access_token);
      window.location.href = "/dashboard";
    } catch (err) {
      setError(
        err instanceof Error && err.message !== "Failed to fetch"
          ? err.message
          : "Can't reach the WiFiLens server. Is it running?"
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen grid lg:grid-cols-[1.1fr_1fr]">
      {/* Left: signal visualization panel */}
      <div className="relative hidden lg:flex items-center justify-center overflow-hidden border-r" style={{ borderColor: "var(--color-panel-border)" }}>
        <SignalRings />
        <div className="relative z-10 max-w-sm px-10">
          <p className="text-xs tracking-[0.2em] uppercase mb-3" style={{ color: "var(--color-accent)" }}>
            Network Intelligence
          </p>
          <h2 className="text-3xl font-semibold leading-tight mb-4">
            See your Wi-Fi<br />environment clearly.
          </h2>
          <p className="text-sm leading-relaxed" style={{ color: "var(--color-text-dim)" }}>
            Real signal strength, real channels, real analysis —
            pulled straight from your own hardware.
          </p>
        </div>
      </div>

      {/* Right: form */}
      <div className="flex items-center justify-center px-6 py-16">
        <motion.div
          initial={{ opacity: 0, x: 12 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.45, ease: "easeOut" }}
          className="w-full max-w-[340px]"
        >
          <div className="mb-9">
            <div className="flex items-center gap-2 mb-1">
              <span className="w-2 h-2 rounded-full" style={{ background: "var(--color-accent)", boxShadow: "0 0 8px var(--color-accent)" }} />
              <span className="text-xs font-mono-data" style={{ color: "var(--color-text-dim)" }}>WIFILENS</span>
            </div>
            <h1 className="text-2xl font-semibold tracking-tight">Welcome back</h1>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <div>
              <label className="text-xs mb-1.5 block" style={{ color: "var(--color-text-dim)" }}>
                Email
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full px-0 py-2.5 text-sm outline-none bg-transparent border-b transition-colors"
                style={{ borderColor: "var(--color-panel-border)", color: "var(--color-text)" }}
                onFocus={(e) => (e.target.style.borderColor = "var(--color-accent)")}
                onBlur={(e) => (e.target.style.borderColor = "var(--color-panel-border)")}
              />
            </div>

            <div>
              <label className="text-xs mb-1.5 block" style={{ color: "var(--color-text-dim)" }}>
                Password
              </label>
              <div className="relative flex items-center">
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-0 py-2.5 pr-8 text-sm outline-none bg-transparent border-b transition-colors"
                  style={{ borderColor: "var(--color-panel-border)", color: "var(--color-text)" }}
                  onFocus={(e) => (e.target.style.borderColor = "var(--color-accent)")}
                  onBlur={(e) => (e.target.style.borderColor = "var(--color-panel-border)")}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-0 p-1"
                  style={{ color: "var(--color-text-dim)" }}
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {error && (
              <p className="text-xs" style={{ color: "var(--color-danger)" }}>
                {error}
              </p>
            )}

            <motion.button
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-lg text-sm font-medium mt-2 disabled:opacity-60"
              style={{ background: "var(--color-accent)", color: "#03150f" }}
            >
              {loading ? "Signing in…" : "Sign in"}
            </motion.button>
          </form>
        </motion.div>
      </div>
    </div>
  );
}

function SignalRings() {
  return (
    <div className="absolute inset-0 flex items-center justify-center">
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          className="absolute rounded-full border"
          style={{ borderColor: "var(--color-accent)" }}
          initial={{ width: 40, height: 40, opacity: 0.5 }}
          animate={{ width: 520, height: 520, opacity: 0 }}
          transition={{
            duration: 3.5,
            repeat: Infinity,
            delay: i * 1.15,
            ease: "easeOut",
          }}
        />
      ))}
      <div
        className="w-3 h-3 rounded-full relative z-10"
        style={{ background: "var(--color-accent)", boxShadow: "0 0 20px var(--color-accent)" }}
      />
    </div>
  );
}