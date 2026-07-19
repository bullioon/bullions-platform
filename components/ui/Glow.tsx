import { cn } from "@/lib/ui";

type GlowTone = "green" | "blue" | "purple" | "gold" | "white";

type GlowProps = {
  tone?: GlowTone;
  className?: string;
};

const tones: Record<GlowTone, string> = {
  green: "bg-[#b6ff00]/[0.07]",
  blue: "bg-[#60a5fa]/[0.07]",
  purple: "bg-[#c084fc]/[0.08]",
  gold: "bg-[#f4c868]/[0.08]",
  white: "bg-white/[0.04]",
};

export function Glow({
  tone = "green",
  className,
}: GlowProps) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        "pointer-events-none absolute h-96 w-96 rounded-full blur-[140px]",
        tones[tone],
        className
      )}
    />
  );
}
