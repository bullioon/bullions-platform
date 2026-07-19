import { cn } from "@/lib/ui";

type StatProps = {
  label: string;
  value: string;
  className?: string;
  valueClassName?: string;
};

export function Stat({
  label,
  value,
  className,
  valueClassName,
}: StatProps) {
  return (
    <div
      className={cn(
        "rounded-[20px] border border-white/[0.08] bg-black/25 p-4",
        className
      )}
    >
      <p className="text-[8px] font-black uppercase tracking-[0.15em] text-white/25">
        {label}
      </p>

      <p
        className={cn(
          "mt-2 text-xl font-black tracking-[-0.04em] text-white",
          valueClassName
        )}
      >
        {value}
      </p>
    </div>
  );
}
