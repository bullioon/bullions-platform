import type { StrategyProfile } from "@/types/v2/strategy";

function usd(n: number) {
  return `$${Math.round(n).toLocaleString()}`;
}

export function StrategyMetrics({ strategy }: { strategy: StrategyProfile }) {
  const metrics = [
    ["ROI", `+${strategy.roi.toFixed(1)}%`, "text-[#b6ff00]"],
    ["Capital", usd(strategy.capitalFollowing), "text-white"],
    ["Allocators", strategy.allocators.toLocaleString(), "text-white"],
    ["Win Rate", `${strategy.winRate}%`, "text-white"],
    ["Max DD", `${strategy.maxDrawdown}%`, "text-white"],
    ["PF", strategy.profitFactor.toFixed(2), "text-[#d8b4ff]"],
  ];

  return (
    <section className="rounded-[28px] border border-white/10 bg-[#080909] p-6">
      <p className="text-[10px] font-black uppercase tracking-[0.28em] text-white/30">
        Performance
      </p>

      <div className="mt-6 grid gap-4 sm:grid-cols-6">
        {metrics.map(([label, value, color]) => (
          <div key={label} className="border-r border-white/8 last:border-r-0">
            <p className="text-[10px] font-black uppercase tracking-[0.18em] text-white/25">
              {label}
            </p>
            <p className={`mt-2 text-2xl font-black ${color}`}>{value}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
