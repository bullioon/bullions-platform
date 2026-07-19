import type { HTMLAttributes } from "react";

import { cn } from "@/lib/ui";

type BadgeTone = "green" | "blue" | "purple" | "gold" | "neutral";

type BadgeProps = HTMLAttributes<HTMLSpanElement> & {
  tone?: BadgeTone;
};

const tones: Record<BadgeTone, string> = {
  green:
    "border-[#b6ff00]/20 bg-[#b6ff00]/[0.07] text-[#b6ff00]",
  blue:
    "border-[#60a5fa]/20 bg-[#60a5fa]/[0.07] text-[#60a5fa]",
  purple:
    "border-[#c084fc]/20 bg-[#c084fc]/[0.07] text-[#c084fc]",
  gold:
    "border-[#f4c868]/20 bg-[#f4c868]/[0.07] text-[#f4c868]",
  neutral:
    "border-white/10 bg-white/[0.04] text-white/45",
};

export function Badge({
  tone = "neutral",
  className,
  ...props
}: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex rounded-full border px-3 py-2 text-[8px] font-black uppercase tracking-[0.16em]",
        tones[tone],
        className
      )}
      {...props}
    />
  );
}
