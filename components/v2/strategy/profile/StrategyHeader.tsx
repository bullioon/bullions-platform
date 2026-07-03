import type { StrategyProfile } from "@/types/v2/strategy";

export function StrategyHeader({ strategy }: { strategy: StrategyProfile }) {
  return (
    <header className="rounded-[34px] border border-white/10 bg-[#080909] p-6">
      <div className="flex flex-wrap items-center justify-between gap-8">
        <div className="flex items-center gap-7">
          <div className="flex h-36 w-36 items-center justify-center rounded-full border-2 border-[#b66dff] bg-[radial-gradient(circle,rgba(182,109,255,0.20),transparent_65%)] text-5xl font-black text-[#d8b4ff]">
            {strategy.name.slice(0, 1)}
          </div>

          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-4xl font-black tracking-[-0.05em]">{strategy.name}</h1>
              <span className="rounded-full bg-[#b66dff] px-2 py-1 text-xs font-black text-black">✓</span>
            </div>

            <p className="mt-1 text-sm text-white/40">
              @{strategy.name.toLowerCase().replaceAll(" ", "")}
            </p>

            <div className="mt-4 flex flex-wrap gap-2">
              <span className="rounded-full border border-[#b66dff]/25 bg-[#b66dff]/10 px-3 py-1 text-xs font-black uppercase text-[#d8b4ff]">
                {strategy.tier}
              </span>
              <span className="rounded-full border border-white/10 bg-white/[0.035] px-3 py-1 text-xs text-white/50">
                Managed by {strategy.managerName}
              </span>
            </div>

            <p className="mt-4 max-w-xl text-sm leading-6 text-white/55">
              Institutional execution. Momentum driven. Risk-first strategy manager.
            </p>
          </div>
        </div>

        <button className="h-14 rounded-2xl bg-[#b6ff00] px-8 text-sm font-black text-black shadow-[0_0_40px_rgba(182,255,0,0.25)]">
          Add Strategy
        </button>
      </div>
    </header>
  );
}
