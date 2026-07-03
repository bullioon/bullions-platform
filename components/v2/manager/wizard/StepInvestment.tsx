import type { StrategyDraft } from "@/types/v2/strategyDraft";

type Investment = StrategyDraft["investment"];

type Props = {
  investment: Investment;
  onChange: (investment: Partial<Investment>) => void;
};

export function StepInvestment({ investment, onChange }: Props) {
  const riskProfiles: Investment["riskProfile"][] = [
    "Conservative",
    "Moderate",
    "Aggressive",
  ];

  const holdingTimes: Investment["holdingTime"][] = [
    "Scalping",
    "Intraday",
    "Swing",
  ];

  return (
    <section className="rounded-[32px] border border-white/10 bg-[#080909] p-6">
      <p className="text-[10px] font-black uppercase tracking-[0.28em] text-white/30">
        Investment Profile
      </p>

      <div className="mt-6 space-y-8">
        <div>
          <p className="mb-3 text-sm font-black text-white/60">
            Risk Profile
          </p>

          <div className="grid gap-3 sm:grid-cols-3">
            {riskProfiles.map((risk) => (
              <button
                key={risk}
                type="button"
                onClick={() => onChange({ riskProfile: risk })}
                className={
                  investment.riskProfile === risk
                    ? "rounded-2xl border border-[#b6ff00]/30 bg-[#b6ff00]/10 p-4 font-black text-[#b6ff00]"
                    : "rounded-2xl border border-white/10 bg-black/20 p-4 font-black text-white/50"
                }
              >
                {risk}
              </button>
            ))}
          </div>
        </div>

        <div>
          <p className="mb-3 text-sm font-black text-white/60">
            Holding Time
          </p>

          <div className="grid gap-3 sm:grid-cols-3">
            {holdingTimes.map((time) => (
              <button
                key={time}
                type="button"
                onClick={() => onChange({ holdingTime: time })}
                className={
                  investment.holdingTime === time
                    ? "rounded-2xl border border-[#b66dff]/30 bg-[#b66dff]/10 p-4 font-black text-[#d8b4ff]"
                    : "rounded-2xl border border-white/10 bg-black/20 p-4 font-black text-white/50"
                }
              >
                {time}
              </button>
            ))}
          </div>
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <label className="grid gap-2">
            <span className="text-sm font-black text-white/60">
              Minimum Allocation USD
            </span>

            <input
              type="number"
              value={investment.minimumAllocation}
              onFocus={(e) => e.target.select()}
              onChange={(e) => {
                const clean = e.target.value.replace(/^0+(?=\d)/, "");
                onChange({ minimumAllocation: Number(clean || 0) });
              }}
              className="h-14 rounded-2xl border border-white/10 bg-black/25 px-5 text-sm font-semibold text-white outline-none focus:border-[#b66dff]/40"
            />
          </label>

          <label className="grid gap-2">
            <span className="text-sm font-black text-white/60">
              Maximum Capacity USD
            </span>

            <input
              type="number"
              value={investment.capacity}
              onFocus={(e) => e.target.select()}
              onChange={(e) => {
                const clean = e.target.value.replace(/^0+(?=\d)/, "");
                onChange({ capacity: Number(clean || 0) });
              }}
              className="h-14 rounded-2xl border border-white/10 bg-black/25 px-5 text-sm font-semibold text-white outline-none focus:border-[#b66dff]/40"
            />
          </label>
        </div>
      </div>
    </section>
  );
}
