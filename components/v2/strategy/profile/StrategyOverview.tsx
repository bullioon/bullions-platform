import type { StrategyProfile } from "@/types/v2/strategy";

export function StrategyOverview({ strategy }: { strategy: StrategyProfile }) {
  const rows = [
    ["Style", strategy.style],
    ["Markets", strategy.markets.join(" · ")],
    ["Risk Model", strategy.risk],
    ["Timeframe", "Intraday"],
    ["Primary Session", "London"],
    ["Since", strategy.since],
  ];

  return (
    <section className="rounded-[28px] border border-white/10 bg-[#080909] p-5">
      <p className="text-[10px] font-black uppercase tracking-[0.24em] text-white/30">
        Methodology
      </p>

      <div className="mt-5 space-y-4">
        {rows.map(([label, value]) => (
          <div key={label} className="flex justify-between border-b border-white/8 pb-3 text-sm last:border-b-0">
            <span className="text-white/35">{label}</span>
            <span className="font-black text-white">{value}</span>
          </div>
        ))}
      </div>

      <button className="mt-6 h-12 w-full rounded-2xl border border-[#b6ff00]/30 bg-[#b6ff00]/10 text-sm font-black text-[#b6ff00] hover:bg-[#b6ff00] hover:text-black">
        Add Strategy →
      </button>
    </section>
  );
}
