import type { Strategy } from "@/types/v2/domain/strategy";

export type TraderProfileMode = "owner" | "allocator";

export function TraderProfileShell({
  strategy,
  mode,
}: {
  strategy: Strategy;
  mode: TraderProfileMode;
}) {
  const isOwner = mode === "owner";

  return (
    <main className="min-h-screen bg-[#050606] px-5 py-6 text-white">
      <div className="mx-auto max-w-[1600px] space-y-5">
        <section className="rounded-[34px] border border-white/10 bg-[#080909] p-6">
          <p className="text-[10px] font-black uppercase tracking-[0.28em] text-[#b6ff00]">
            {isOwner ? "Trader Profile · Owner Mode" : "Trader Profile"}
          </p>

          <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_auto]">
            <div>
              <h1 className="text-6xl font-black tracking-[-0.07em]">
                {strategy.identity.name}
              </h1>

              <p className="mt-4 max-w-2xl text-sm leading-7 text-white/45">
                {strategy.identity.description || strategy.identity.subtitle}
              </p>
            </div>

            <div className="flex items-start gap-3">
              {isOwner ? (
                <>
                  <button className="rounded-2xl border border-white/10 px-5 py-3 text-sm font-black text-white/60">
                    Edit Profile
                  </button>
                  <button className="rounded-2xl bg-[#b6ff00] px-5 py-3 text-sm font-black text-black">
                    Manage
                  </button>
                </>
              ) : (
                <button className="rounded-2xl bg-[#b6ff00] px-6 py-3 text-sm font-black text-black">
                  Copy Strategy
                </button>
              )}
            </div>
          </div>

          <div className="mt-8 grid gap-4 md:grid-cols-4">
            <Metric label="ROI" value={`${strategy.performance.roi?.toFixed?.(2) ?? 0}%`} />
            <Metric label="Win Rate" value={`${strategy.performance.winRate?.toFixed?.(1) ?? 0}%`} />
            <Metric label="Max DD" value={`${strategy.performance.maxDrawdown?.toFixed?.(1) ?? 0}%`} />
            <Metric label="Capital Assigned" value={`$${strategy.performance.capitalFollowing.toLocaleString()}`} />
          </div>
        </section>

        <section className="grid gap-5 xl:grid-cols-[1fr_360px]">
          <div className="rounded-[28px] border border-white/10 bg-[#080909] p-5">
            <p className="text-[10px] font-black uppercase tracking-[0.24em] text-white/30">
              Profile Sections
            </p>

            <div className="mt-5 flex flex-wrap gap-3">
              {[
                "Overview",
                "Performance",
                "Research",
                "Challenge",
                "Gallery",
                ...(isOwner ? ["Revenue", "Settings"] : ["Products"]),
              ].map((item) => (
                <span
                  key={item}
                  className="rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-xs font-black text-white/50"
                >
                  {item}
                </span>
              ))}
            </div>
          </div>

          <aside className="rounded-[28px] border border-white/10 bg-[#080909] p-5">
            <p className="text-[10px] font-black uppercase tracking-[0.24em] text-[#d8b4ff]">
              Trust Signal
            </p>

            <p className="mt-4 text-sm leading-7 text-white/50">
              Challenge history, research, risk discipline and live performance will appear here.
            </p>
          </aside>
        </section>
      </div>
    </main>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/25">
        {label}
      </p>
      <p className="mt-3 text-2xl font-black text-white">{value}</p>
    </div>
  );
}
