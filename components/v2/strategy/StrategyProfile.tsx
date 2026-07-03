import type { ReactNode } from "react";
import type { StrategyProfile as StrategyProfileType } from "@/types/v2/strategy";
import { StrategyHero } from "@/components/v2/strategy/profile/StrategyHero";
import { SixAssessmentCard } from "@/components/v2/six/SixAssessmentCard";
import { StrategyTabs } from "@/components/v2/strategy/profile/StrategyTabs";

function usd(n: number) {
  return `$${Math.round(n).toLocaleString()}`;
}

export function StrategyProfile({ strategy, editable = false, editorControls }: { strategy: StrategyProfileType; editable?: boolean; editorControls?: ReactNode }) {

  return (
    <main className="min-h-screen bg-[#050606] px-4 py-6 text-white">
      <div className="mx-auto max-w-[1600px] space-y-5">
        <nav className="flex items-center justify-between rounded-[32px] border border-white/10 bg-[#080909] px-6 py-4">
          <p className="text-2xl font-black italic">
            bullions<span className="ml-1 text-xs text-[#b6ff00]">6X</span>
          </p>

          <div className="hidden items-center gap-8 text-sm font-semibold text-white/45 md:flex">
            {["Home", "BullPad", "Strategy Universe", "Terminal"].map((item) => (
              <span key={item} className="transition hover:text-white">
                {item}
              </span>
            ))}
          </div>

          <button className="rounded-full border border-white/10 bg-white/[0.05] px-5 py-2 text-sm font-black text-white/70">
            Portfolio
          </button>
        </nav>

        {editable ? (
          <section className="rounded-[24px] border border-white/10 bg-[#080909] px-5 py-4">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.26em] text-[#b6ff00]">
                  Manager Edit Mode
                </p>
                <p className="mt-1 text-xs text-white/35">
                  Editing public strategy profile.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <a
                  href="/strategy-profile"
                  className="rounded-xl border border-white/10 bg-white/[0.035] px-4 py-2 text-xs font-black text-white/55 transition hover:text-white"
                >
                  Preview
                </a>
              </div>
            </div>

            <div className="mt-4">
              {editorControls}
            </div>
          </section>
        ) : null}

                <section className="space-y-5">
          <StrategyHero strategy={strategy} editable={editable} />

          <div className="grid gap-4 xl:grid-cols-[0.95fr_1.4fr]">
            <section className="rounded-[28px] border border-white/10 bg-[#080909] p-5">
              <p className="text-[10px] font-black uppercase tracking-[0.28em] text-[#d8b4ff]">SIX Insight</p>
              <div className="mt-4 flex gap-4">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-[#b66dff]/25 bg-[#b66dff]/10 text-sm font-black text-[#d8b4ff]">
                  6
                </div>
                <p className="text-sm leading-7 text-white/60">{strategy.sixAssessment}</p>
              </div>
            </section>

          </div>

          <div className="grid gap-5 xl:grid-cols-[1fr_360px]">
            <section className="space-y-4">
              <StrategyTabs strategy={strategy} />

            </section>

            <aside className="space-y-4">
              <section className="rounded-[28px] border border-white/10 bg-[#080909] p-5">
                <p className="text-[10px] font-black uppercase tracking-[0.24em] text-white/30">Capital Following</p>
                <p className="mt-5 text-3xl font-black">{usd(strategy.capitalFollowing)}</p>
                <div className="mt-5 grid grid-cols-2 gap-4 border-t border-white/8 pt-5">
                  <div>
                    <p className="text-xl font-black">{strategy.allocators}</p>
                    <p className="text-xs text-white/35">Allocators</p>
                  </div>
                  <div>
                    <p className="text-xl font-black">{usd(strategy.capitalFollowing / strategy.allocators)}</p>
                    <p className="text-xs text-white/35">Avg allocation</p>
                  </div>
                </div>
              </section>

              <section className="rounded-[28px] border border-white/10 bg-[#080909] p-5">
                <p className="text-[10px] font-black uppercase tracking-[0.24em] text-white/30">Strategy Overview</p>
                <div className="mt-5 space-y-4">
                  {[
                    ["Style", strategy.style],
                    ["Markets", strategy.markets.join(" · ")],
                    ["Risk Model", strategy.risk],
                    ["Timeframe", "Intraday"],
                    ["Primary Session", "London"],
                    ["Since", strategy.since],
                  ].map(([label, value]) => (
                    <div key={label} className="flex justify-between border-b border-white/8 pb-3 text-sm last:border-b-0">
                      <span className="text-white/35">{label}</span>
                      <span className="font-black text-white">{value}</span>
                    </div>
                  ))}
                </div>

                <button className="mt-6 h-12 w-full rounded-2xl border border-[#b6ff00]/30 bg-[#b6ff00]/10 text-sm font-black text-[#b6ff00] hover:bg-[#b6ff00] hover:text-black">
                  Allocate Capital →
                </button>
              </section>
            </aside>
          </div>
        </section>
      </div>
    </main>
  );
}