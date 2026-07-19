import type { HTMLAttributes } from "react";

import { cn } from "@/lib/ui";

type CardProps = HTMLAttributes<HTMLDivElement>;

export function Card({
  className,
  ...props
}: CardProps) {
  return (
    <div
      className={cn(
        "rounded-[28px] border border-white/10 bg-black/20 transition duration-300",
        className
      )}
      {...props}
    />
  );
}
