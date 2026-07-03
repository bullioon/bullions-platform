import type { ReactNode } from "react";

type ButtonProps = {
  children: ReactNode;
  className?: string;
  variant?: "primary" | "outline" | "ghost";
  onClick?: () => void;
  disabled?: boolean;
};

export function Button({
  children,
  className = "",
  variant = "primary",
  onClick,
  disabled = false,
}: ButtonProps) {
  const variants = {
    primary:
      "bg-[#b6ff00] text-black hover:scale-[1.01] shadow-[0_0_40px_rgba(182,255,0,0.18)]",
    outline:
      "border border-[#b6ff00]/30 bg-[#b6ff00]/10 text-[#b6ff00] hover:bg-[#b6ff00] hover:text-black",
    ghost:
      "border border-white/10 bg-white/[0.035] text-white/55 hover:bg-white/[0.06] hover:text-white",
  };

  return (
    <button
      type="button"
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
      className={`h-12 rounded-2xl px-5 text-sm font-black transition ${
        disabled ? "cursor-not-allowed opacity-40" : variants[variant]
      } ${className}`}
    >
      {children}
    </button>
  );
}
