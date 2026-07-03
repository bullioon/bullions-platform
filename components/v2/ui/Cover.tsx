import type { ReactNode } from "react";

export function Cover({ children }: { children?: ReactNode }) {
  return (
    <div className="relative min-h-[220px] overflow-hidden rounded-[34px] border border-white/10 bg-[#080909]">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(182,255,0,0.16),transparent_28%),radial-gradient(circle_at_80%_30%,rgba(182,109,255,0.22),transparent_32%),linear-gradient(135deg,rgba(255,255,255,0.06),transparent_45%)]" />
      <div className="absolute inset-0 bg-[linear-gradient(to_bottom,transparent,rgba(5,6,6,0.88))]" />
      <div className="relative z-10 flex h-full min-h-[220px] items-end p-6">
        {children}
      </div>
    </div>
  );
}
