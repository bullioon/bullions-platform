import type { ReactNode } from "react";

type BadgeProps = {
  children: ReactNode;
  tone?: "success" | "purple" | "warning" | "neutral";
  className?: string;
};

export function Badge({ children, tone = "neutral", className = "" }: BadgeProps) {
  const tones = {
    success: "border-[#b6ff00]/20 bg-[#b6ff00]/10 text-[#b6ff00]",
    purple: "border-[#b66dff]/25 bg-[#b66dff]/10 text-[#d8b4ff]",
    warning: "border-[#ffd23f]/20 bg-[#ffd23f]/10 text-[#ffd23f]",
    neutral: "border-white/10 bg-white/[0.035] text-white/45",
  };

  return (
    <span className={`rounded-full border px-3 py-1 text-xs font-black uppercase tracking-[0.14em] ${tones[tone]} ${className}`}>
      {children}
    </span>
  );
}
