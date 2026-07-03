import type { ReactNode } from "react";

export function SectionTitle({ children, tone = "neutral" }: { children: ReactNode; tone?: "neutral" | "purple" }) {
  return (
    <p
      className={
        tone === "purple"
          ? "text-[10px] font-black uppercase tracking-[0.28em] text-[#d8b4ff]"
          : "text-[10px] font-black uppercase tracking-[0.28em] text-white/30"
      }
    >
      {children}
    </p>
  );
}
