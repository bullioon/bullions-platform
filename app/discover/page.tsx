import { StrategyRow } from "@/components/v2/universe/StrategyRow";
import { UniverseSearch } from "@/components/v2/universe/UniverseSearch";
import { strategyUniverse } from "@/mock/v2/strategyUniverse";

export default function DiscoverPage() {
  const official = strategyUniverse.filter((s) => s.variant === "official");
  const community = strategyUniverse.filter((s) => s.variant === "community");

  return (
    <main className="min-h-screen bg-[#050606] px-4 py-6 text-white">
      <div className="mx-auto max-w-[1600px] space-y-8">
        <nav className="flex items-center justify-between rounded-[32px] border border-white/10 bg-[#080909] px-6 py-4">
          <p className="text-2xl font-black italic">
            bullions<span className="ml-1 text-xs text-[#b6ff00]">6X</span>
          </p>

          <div className="hidden items-center gap-8 text-sm font-semibold text-white/45 md:flex">
            {["BullPad", "Discover", "Portfolio", "Terminal"].map((item) => (
              <span
                key={item}
                className={item === "Discover" ? "text-white" : "transition hover:text-white"}
              >
                {item}
              </span>
            ))}
          </div>

          <button className="rounded-full border border-white/10 bg-white/[0.05] px-5 py-2 text-sm font-black text-white/70">
            Portfolio
          </button>
        </nav>

        <section className="rounded-[34px] border border-white/10 bg-[#080909] p-7">
          <p className="text-[10px] font-black uppercase tracking-[0.32em] text-[#d8b4ff]">
            SIX
          </p>

          <h1 className="mt-4 max-w-4xl text-5xl font-black tracking-[-0.06em] text-white sm:text-6xl">
            Discover institutional strategies.
          </h1>

          <p className="mt-5 max-w-2xl text-base leading-7 text-white/45">
            SIX detected strategies aligned with controlled growth, verified execution and capital preservation.
          </p>

          <div className="mt-7 flex flex-wrap gap-3">
            <button className="rounded-2xl bg-[#b6ff00] px-6 py-3 text-sm font-black text-black">
              View Recommendations
            </button>
            <button className="rounded-2xl border border-white/10 bg-white/[0.035] px-6 py-3 text-sm font-black text-white/55">
              Search Universe
            </button>
          </div>
        </section>

        <UniverseSearch strategies={strategyUniverse} />

        <StrategyRow
          title="Recommended by SIX"
          subtitle="Current focus based on allocation quality and strategy stability."
          strategies={strategyUniverse}
        />

        <StrategyRow
          title="Bullions Official"
          subtitle="Strategies operated or licensed by Bullions."
          strategies={official}
        />

        <StrategyRow
          title="Community Strategies"
          subtitle="Verified managers competing for capital allocation."
          strategies={community}
        />
      </div>
    </main>
  );
}
