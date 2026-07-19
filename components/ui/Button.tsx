import Link from "next/link";
import type { ReactNode } from "react";

import { cn } from "@/lib/ui";

type ButtonVariant = "primary" | "secondary" | "ghost";

type ButtonProps = {
  href: string;
  children: ReactNode;
  className?: string;
  variant?: ButtonVariant;
};

const variants: Record<ButtonVariant, string> = {
  primary:
    "bg-[#b6ff00] text-black hover:scale-[1.02] hover:bg-[#c3ff2e]",
  secondary:
    "border border-white/10 bg-white/[0.03] text-white hover:border-white/20 hover:bg-white/[0.06]",
  ghost:
    "text-white/40 hover:text-[#b6ff00]",
};

export function Button({
  href,
  children,
  className,
  variant = "primary",
}: ButtonProps) {
  return (
    <Link
      href={href}
      className={cn(
        "inline-flex h-14 items-center justify-center rounded-full px-8 text-[10px] font-black uppercase tracking-[0.18em] transition duration-300",
        variants[variant],
        className
      )}
    >
      {children}
    </Link>
  );
}
