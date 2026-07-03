import type { Strategy } from "@/types/v2/domain/strategy";

export function TraderHero({ strategy }: { strategy: Strategy }) {
  return (
    <section className="relative overflow-hidden rounded-[40px] border border-white/10 bg-[#080909] p-8">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(182,255,0,0.14),transparent_36%),radial-gradient(circle_at_bottom_left,rgba(216,180,255,0.12),transparent_34%)]" />

      <div className="relative z-10 min-h-[420px] flex flex-col justify-end">
        <div className="mb-8 h-24 w-24 rounded-full border border-white/15 bg-white/10" />

        <p className="text-[10px] font-black uppercase tracking-[0.28em] text-[#b6ff00]">
          Verified Trader
        </p>

        <h1 className="mt-4 max-w-5xl text-7xl font-black tracking-[-0.08em] text-white">
          {strategy.identity.name}
        </h1>

        <p className="mt-5 max-w-2xl text-lg font-semibold leading-8 text-white/50">
          {strategy.identity.description || strategy.identity.subtitle}
        </p>

        <div className="mt-8 flex flex-wrap gap-3">
          <span className="rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-xs font-black text-white/50">
            Institutional Macro
          </span>
          <span className="rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-xs font-black text-white/50">
            Gold
          </span>
          <span className="rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-xs font-black text-white/50">
            Crypto Momentum
          </span>
        </div>
      </div>
    </section>
  );
}
