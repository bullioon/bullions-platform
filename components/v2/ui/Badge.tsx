import { ReactNode } from "react";

type Tone = "green" | "success" | "purple" | "neutral" | "warning" | "danger";

type Props = {
  children: ReactNode;
  tone?: Tone;
  className?: string;
};

export function Badge({
  children,
  tone = "neutral",
  className = "",
}: Props) {
  const tones = {
    green: "border-[#b6ff00]/25 bg-[#b6ff00]/10 text-[#b6ff00]",
    success: "border-[#b6ff00]/25 bg-[#b6ff00]/10 text-[#b6ff00]",
    purple: "border-[#b66dff]/25 bg-[#b66dff]/10 text-[#d8b4ff]",
    neutral: "border-white/10 bg-white/[0.04] text-white/55",
    warning: "border-yellow-400/25 bg-yellow-400/10 text-yellow-300",
    danger: "border-red-400/25 bg-red-400/10 text-red-300",
  };

  return (
    <span
      className={`inline-flex items-center rounded-full border px-4 py-2 text-xs font-black uppercase tracking-[0.16em] ${tones[tone]} ${className}`}
    >
      {children}
    </span>
  );
}
