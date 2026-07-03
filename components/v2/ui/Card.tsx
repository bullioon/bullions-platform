import type { ReactNode } from "react";

type CardProps = {
  children: ReactNode;
  className?: string;
  variant?: "default" | "soft" | "glass";
};

export function Card({ children, className = "", variant = "default" }: CardProps) {
  const variants = {
    default: "border border-white/10 bg-[#080909]",
    soft: "border border-white/8 bg-white/[0.025]",
    glass: "border border-white/10 bg-white/[0.035] backdrop-blur-xl",
  };

  return (
    <section className={`rounded-[28px] p-5 ${variants[variant]} ${className}`}>
      {children}
    </section>
  );
}
