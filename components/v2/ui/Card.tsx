import { ReactNode } from "react";

type Props = {
  children: ReactNode;
  className?: string;
  hover?: boolean;
};

export function Card({
  children,
  className = "",
  hover = false,
}: Props) {
  return (
    <div
      className={`
        rounded-[32px]
        border
        border-white/10
        bg-[#080909]
        p-8
        ${hover ? "transition hover:border-[#b6ff00]/30 hover:bg-white/[0.03]" : ""}
        ${className}
      `}
    >
      {children}
    </div>
  );
}
