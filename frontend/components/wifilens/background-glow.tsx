export function BackgroundGlow() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 overflow-hidden">
      <div
        className="absolute -left-40 -top-32 h-[38rem] w-[38rem] rounded-full blur-[120px] animate-drift"
        style={{
          background: "radial-gradient(circle at center, rgba(57,242,192,0.16), transparent 65%)",
        }}
      />
      <div
        className="absolute -right-52 top-1/3 h-[42rem] w-[42rem] rounded-full blur-[130px] animate-drift"
        style={{
          animationDelay: "-8s",
          background: "radial-gradient(circle at center, rgba(91,140,255,0.14), transparent 65%)",
        }}
      />
      <div
        className="absolute bottom-0 left-1/3 h-[30rem] w-[30rem] rounded-full blur-[120px]"
        style={{
          background: "radial-gradient(circle at center, rgba(57,242,192,0.06), transparent 70%)",
        }}
      />
      <div
        className="absolute inset-0 opacity-[0.35]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
          maskImage: "radial-gradient(ellipse at 50% 0%, black 30%, transparent 80%)",
        }}
      />
    </div>
  );
}