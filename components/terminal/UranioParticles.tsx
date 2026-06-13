"use client";

export function UranioParticles({ active = false }: { active?: boolean }) {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(182,255,0,0.14),transparent_55%)]" />

      {Array.from({ length: 42 }).map((_, i) => (
        <span
          key={i}
          className={`absolute h-1 w-1 rounded-full bg-[#b6ff00] opacity-60 shadow-[0_0_18px_rgba(182,255,0,0.85)] ${
            active ? "animate-ping" : "animate-pulse"
          }`}
          style={{
            left: `${(i * 37) % 100}%`,
            top: `${(i * 53) % 100}%`,
            animationDelay: `${(i % 9) * 0.22}s`,
            animationDuration: `${active ? 1.2 + (i % 5) * 0.2 : 2.5 + (i % 6) * 0.35}s`,
          }}
        />
      ))}

      <div className="absolute left-1/2 top-1/2 h-[260px] w-[260px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-[#b6ff00]/10 shadow-[0_0_90px_rgba(182,255,0,0.12)]" />
    </div>
  );
}
