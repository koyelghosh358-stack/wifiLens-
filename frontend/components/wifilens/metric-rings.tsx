function Ring({ value, accent, center }: { value: number; accent: string; center: string }) {
  const r = 26;
  const c = 2 * Math.PI * r;
  const offset = c - (value / 100) * c;
  return (
    <div className="relative h-16 w-16 shrink-0">
      <svg viewBox="0 0 64 64" className="h-full w-full -rotate-90">
        <circle cx="32" cy="32" r={r} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth={5} />
        <circle
          cx="32"
          cy="32"
          r={r}
          fill="none"
          stroke={accent}
          strokeWidth={5}
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={offset}
          style={{
            transition: "stroke-dashoffset 0.8s cubic-bezier(0.16,1,0.3,1)",
            filter: `drop-shadow(0 0 4px ${accent}99)`,
          }}
        />
      </svg>
      <span className="absolute inset-0 flex items-center justify-center font-mono text-xs font-semibold" style={{ color: accent }}>
        {center}
      </span>
    </div>
  );
}

export function MetricRings({
  openPercent,
  excellentPercent,
  bandSplit,
}: {
  openPercent: number;
  excellentPercent: number;
  bandSplit: string;
}) {
  const cards = [
    {
      label: "Open Networks",
      desc: "Share of unsecured networks detected",
      value: openPercent,
      center: `${openPercent}%`,
      accent: "var(--teal)",
    },
    {
      label: "Signal Quality",
      desc: "Networks rated Excellent or Good",
      value: excellentPercent,
      center: `${excellentPercent}%`,
      accent: "var(--blue)",
    },
    {
      label: "Band Split",
      desc: "2.4GHz vs 5GHz networks",
      value: 50,
      center: bandSplit,
      accent: "var(--magenta)",
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
      {cards.map((c) => (
        <article key={c.label} className="glass glass-hover flex items-center gap-4 rounded-2xl p-5">
          <Ring value={c.value} accent={c.accent} center={c.center} />
          <div className="min-w-0">
            <p className="font-medium tracking-tight">{c.label}</p>
            <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">{c.desc}</p>
          </div>
        </article>
      ))}
    </div>
  );
}