import type { HTMLAttributes } from "react";

import { cn } from "@/lib/ui";

type SectionProps = HTMLAttributes<HTMLElement>;

export function Section({
  className,
  ...props
}: SectionProps) {
  return (
    <section
      className={cn(
        "relative overflow-hidden rounded-[40px] border border-white/10 bg-[#060707] p-6 sm:p-10 lg:p-14",
        className
      )}
      {...props}
    />
  );
}
