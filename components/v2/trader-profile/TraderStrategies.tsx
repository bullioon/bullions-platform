import type { Strategy } from "@/types/v2/domain/strategy";

export function TraderStrategies({ strategy }: { strategy: Strategy }) {
  const strategies = [
    {
      name: strategy.identity.name || "AURUM",
      subtitle: strategy.identity.subtitle || "Institutional Gold",
      status: "LIVE",
      roi: strategy.performance.roi || 0,
      challenge: "#2",
    },
    {
      name: "NOVA",
      subtitle: "Crypto Momentum",
      status: "LIVE",
      roi: 91.4,
      challenge: "#5",
    },
    {
      name: "ATLAS",
      subtitle: "Private Multi Asset",
      status: "COMING SOON",
      roi: 0,
      challenge: "—",
    },
  ].slice(0, 3);

  return (
    <section className="rounded-[32px] border border-white/10 bg-[#080909] p-6">
      <div className="flex items-end justify-between gap-4">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.28em] text-[#b6ff00]">
            Strategies
          </p>
          <h2 className="mt-3 text-4xl font-black tracking-[-0.06em] text-white">
            Premium strategy shelf
          </h2>
        </div>

        <p className="text-xs font-black uppercase tracking-[0.2em] text-white/25">
          Max 3 active
        </p>
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        {strategies.map((item) => (
          <article
            key={item.name}
            className="group rounded-[28px] border border-white/10 bg-black/25 p-5 transition hover:border-[#b6ff00]/30 hover:bg-[#b6ff00]/[0.04]"
          >
            <div className="flex items-center justify-between">
              <span className="rounded-full border border-white/10 px-3 py-1 text-[10px] font-black text-white/35">
                {item.status}
              </span>
              <span className="text-xl text-white/30 transition group-hover:text-[#b6ff00]">
                →
              </span>
            </div>

            <h3 className="mt-8 text-3xl font-black tracking-[-0.06em] text-white">
              {item.name}
            </h3>

            <p className="mt-2 text-sm font-semibold text-white/40">
              {item.subtitle}
            </p>

            <div className="mt-8 grid grid-cols-2 gap-3">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.18em] text-white/25">
                  ROI
                </p>
                <p className="mt-2 text-2xl font-black text-white">
                  {item.roi.toFixed(2)}%
                </p>
              </div>

              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.18em] text-white/25">
                  Challenge
                </p>
                <p className="mt-2 text-2xl font-black text-white">
                  {item.challenge}
                </p>
              </div>
            </div>

            <button className="mt-8 w-full rounded-2xl border border-white/10 px-4 py-3 text-sm font-black text-white/50 transition group-hover:border-[#b6ff00]/30 group-hover:text-[#b6ff00]">
              Open Strategy
            </button>
          </article>
        ))}
      </div>
    </section>
  );
}
