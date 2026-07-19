import type { HTMLAttributes } from "react";

import { cn } from "@/lib/ui";

type HeadingProps = HTMLAttributes<HTMLHeadingElement> & {
  as?: "h1" | "h2" | "h3";
  size?: "hero" | "section" | "card";
};

const sizes = {
  hero:
    "text-6xl leading-[0.9] tracking-[-0.08em] sm:text-8xl lg:text-[110px]",
  section:
    "text-5xl leading-[0.92] tracking-[-0.07em] sm:text-7xl",
  card:
    "text-3xl leading-[0.96] tracking-[-0.055em] sm:text-4xl",
};

export function Heading({
  as: Component = "h2",
  size = "section",
  className,
  ...props
}: HeadingProps) {
  return (
    <Component
      className={cn(
        "font-black text-white",
        sizes[size],
        className
      )}
      {...props}
    />
  );
}
