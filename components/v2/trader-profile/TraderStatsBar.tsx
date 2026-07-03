import type { Strategy } from "@/types/v2/domain/strategy";

export function TraderStatsBar({ strategy }: { strategy: Strategy }) {
  const stats = [
    ["ROI", `${strategy.performance.roi?.toFixed?.(2) ?? "0.00"}%`],
    ["Win Rate", `${strategy.performance.winRate?.toFixed?.(1) ?? "0.0"}%`],
    ["Max DD", `${strategy.performance.maxDrawdown?.toFixed?.(1) ?? "0.0"}%`],
    ["Profit Factor", `${strategy.performance.profitFactor?.toFixed?.(2) ?? "0.00"}`],
    ["Capital Assigned", `$${strategy.performance.capitalFollowing.toLocaleString()}`],
  ];

  return (
    <section className="grid gap-3 rounded-[28px] border border-white/10 bg-[#080909] p-4 md:grid-cols-5">
      {stats.map(([label, value]) => (
        <div key={label} className="rounded-2xl bg-black/20 p-4">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/25">
            {label}
          </p>
          <p className="mt-3 text-2xl font-black text-white">{value}</p>
        </div>
      ))}
    </section>
  );
}
