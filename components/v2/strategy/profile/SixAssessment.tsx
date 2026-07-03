import type { StrategyProfile } from "@/types/v2/strategy";

export function SixAssessment({ strategy }: { strategy: StrategyProfile }) {
  return (
    <section className="rounded-[28px] border border-white/10 bg-[#080909] p-5">
      <p className="text-[10px] font-black uppercase tracking-[0.28em] text-[#d8b4ff]">
        SIX Assessment
      </p>

      <div className="mt-4 flex gap-4">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-[#b66dff]/25 bg-[#b66dff]/10 text-sm font-black text-[#d8b4ff]">
          6
        </div>

        <p className="text-sm leading-7 text-white/60">{strategy.sixAssessment}</p>
      </div>
    </section>
  );
}
