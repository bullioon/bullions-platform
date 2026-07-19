import React from "react";

type HeroMetricProps = {
  label: string;
  value: string;
};

export default function HeroMetric({
  label,
  value,
}: HeroMetricProps) {
  return (
    <div className="rounded-[22px] border border-white/10 bg-black/20 p-4 backdrop-blur-sm">
      <p className="text-[8px] font-black uppercase tracking-[0.2em] text-white/25">
        {label}
      </p>

      <p className="mt-2 text-lg font-black tracking-[-0.035em]">
        {value}
      </p>
    </div>
  );
}