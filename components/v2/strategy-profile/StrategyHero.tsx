import type { Strategy } from "@/types/v2/domain/strategy";
import type { StrategyRuntime } from "@/core/v2/runtime";

function money(n: number) {
  return `$${Math.round(n || 0).toLocaleString()}`;
}

function pct(n: number | null | undefined) {
  return `${Number(n || 0).toFixed(1)}%`;
}

function gradeLabel(value: string | undefined) {
  if (!value) return "Pending";
  return value.replace("_", " ").toUpperCase();
}

function timeAgo(ms: number | null | undefined) {
  if (!ms) return "Pending";

  const diff = Math.max(0, Date.now() - Number(ms));
  const sec = Math.floor(diff / 1000);
  const min = Math.floor(sec / 60);
  const hr = Math.floor(min / 60);

  if (sec < 60) return `${sec}s ago`;
  if (min < 60) return `${min}m ago`;
  if (hr < 24) return `${hr}h ago`;

  return new Date(Number(ms)).toLocaleDateString();
}

type Props = {
  strategy: Strategy;
  runtime: StrategyRuntime | null;
  challengeRank: string | number;
  challengeScore: number;
  onAllocate: () => void;
};

export function StrategyHero({
  strategy,
  runtime,
  challengeRank,
  challengeScore,
  onAllocate,
}: Props) {
  const performance = runtime?.performance ?? strategy.performance;
  const roi = Number(performance.roi || 0);
  const equity = Number(runtime?.performance.equity || 0);
  const profitFactor = Number(performance.profitFactor || 0);
  const allocators = Number(strategy.performance.allocators || 0);
  const runtimeGrade = gradeLabel(runtime?.universe.grade);
  const allocatorScore = Number(runtime?.scores.allocatorScore || 0);
  const mt5Live = Boolean(runtime?.performance.lastSyncedAt);
  const lastSyncLabel = timeAgo(runtime?.performance.lastSyncedAt);

  return (
    <section className="relative min-h-[68vh] overflow-hidden border-b border-white/10 bg-[#050606]">
      <div
        className="absolute inset-0 bg-cover bg-center opacity-35 grayscale"
        style={{
          backgroundImage: strategy.identity.bannerUrl
            ? `url(${strategy.identity.bannerUrl})`
            : "url(https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?q=80&w=2400&auto=format&fit=crop)",
        }}
      />

      <div className="absolute inset-0 bg-[radial-gradient(circle_at_72%_18%,rgba(182,255,0,0.10),transparent_22%),linear-gradient(to_bottom,rgba(5,6,6,0.55),#050606_88%)]" />

      <nav className="relative z-10 mx-auto flex max-w-[1600px] items-center justify-between px-6 py-6">
        <div className="text-xl font-black italic">
          bullions<span className="ml-1 text-xs text-[#b6ff00]">6X</span>
        </div>

        <div className="hidden gap-8 text-sm font-semibold text-white/60 md:flex">
          <span className="text-[#b6ff00]">Overview</span>
          <span>Performance</span>
          <span>SIX</span>
          <span>Gallery</span>
          <span>Research</span>
        </div>

        <button className="rounded-full border border-white/15 bg-white/[0.035] px-5 py-2 text-sm font-bold text-white/75">
          Share
        </button>
      </nav>

      <div className="relative z-10 mx-auto flex max-w-[1600px] flex-col justify-end px-6 pb-8 pt-14">
        <div className="max-w-5xl">
          <div className="flex flex-wrap gap-3">
            <span className="rounded-full border border-[#b6ff00]/25 bg-[#b6ff00]/10 px-4 py-2 text-xs font-black uppercase tracking-[0.16em] text-[#b6ff00]">
              ● {mt5Live ? "Live MT5" : "Pending MT5"}
            </span>

            <span className="rounded-full border border-white/10 bg-white/[0.06] px-4 py-2 text-xs font-black uppercase tracking-[0.16em] text-white/65">
              {strategy.status.verified ? "Verified" : "Unverified"}
            </span>

            <span className="rounded-full border border-white/10 bg-white/[0.06] px-4 py-2 text-xs font-black uppercase tracking-[0.16em] text-white/65">
              Runtime {runtimeGrade}
            </span>

            <span className="rounded-full border border-white/10 bg-white/[0.06] px-4 py-2 text-xs font-black uppercase tracking-[0.16em] text-white/65">
              Score {allocatorScore.toFixed(0)}
            </span>

            <span className="rounded-full border border-white/10 bg-white/[0.06] px-4 py-2 text-xs font-black uppercase tracking-[0.16em] text-white/65">
              Sync {lastSyncLabel}
            </span>
          </div>

          <h1 className="mt-5 max-w-5xl text-5xl font-black tracking-[-0.075em] text-white md:text-7xl">
            {strategy.identity.name}
          </h1>

          <p className="mt-5 max-w-2xl text-xl leading-8 text-white/72">
            {strategy.identity.subtitle || strategy.identity.description || "Verified strategy manager on Bullions."}
          </p>

          <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
            <HeroMetric
              label="ROI"
              value={`${roi >= 0 ? "+" : ""}${roi.toFixed(1)}%`}
              highlight
            />
            <HeroMetric label="Equity" value={equity ? money(equity) : "Pending"} />
            <HeroMetric label="Profit Factor" value={profitFactor.toFixed(2)} />
            <HeroMetric label="Allocators" value={allocators.toLocaleString()} />
            <HeroMetric
              label="Challenge"
              value={challengeRank === "-" ? "OPEN" : `#${challengeRank}`}
              sub={challengeRank === "-" ? "Not enrolled" : `Score ${challengeScore.toFixed(1)}`}
            />
          </div>
        </div>

        <div className="mt-6 rounded-[30px] border border-white/10 bg-black/30 p-5 backdrop-blur-xl">
          <div className="grid gap-6 lg:grid-cols-[auto_1fr_auto] lg:items-center">
            <div className="h-24 w-24 overflow-hidden rounded-[28px] border border-[#b6ff00]/70 bg-white/10">
              {strategy.identity.avatarUrl ? (
                <img
                  src={strategy.identity.avatarUrl}
                  className="h-full w-full object-cover"
                  alt=""
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-5xl">
                  {strategy.identity.name.slice(0, 1)}
                </div>
              )}
            </div>

            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.26em] text-white/35">
                Strategy Manager
              </p>
              <h2 className="mt-2 text-3xl font-black">
                {strategy.manager.displayName || strategy.manager.username || strategy.identity.name}
              </h2>
              <p className="mt-2 max-w-3xl text-white/55">
                {strategy.identity.description || "Institutional execution with a risk-first trading process."}
              </p>
              <p className="mt-3 text-sm text-white/35">
                Markets: {[strategy.markets.primary, ...(strategy.markets.secondary || [])]
                  .filter(Boolean)
                  .join(" · ")}
              </p>
            </div>

            <div className="grid gap-3">
              <button
                onClick={onAllocate}
                className="h-14 rounded-2xl bg-[#b6ff00] px-14 text-sm font-black uppercase tracking-[0.18em] text-black transition hover:scale-[1.01]"
              >
                Allocate →
              </button>

              <div className="grid grid-cols-3 gap-3">
                {["Follow", "Message", "Share"].map((x) => (
                  <button
                    key={x}
                    className="rounded-2xl border border-white/10 px-4 py-3 text-xs font-black uppercase tracking-[0.14em] text-white/55 transition hover:border-white/20 hover:text-white"
                  >
                    {x}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function HeroMetric({
  label,
  value,
  sub,
  highlight = false,
}: {
  label: string;
  value: string;
  sub?: string;
  highlight?: boolean;
}) {
  return (
    <div className="rounded-[24px] border border-white/10 bg-black/25 p-5 backdrop-blur-xl">
      <p className="text-[10px] font-black uppercase tracking-[0.22em] text-white/35">
        {label}
      </p>
      <p className={highlight ? "mt-3 text-4xl font-black tracking-[-0.06em] text-[#b6ff00]" : "mt-3 text-3xl font-black tracking-[-0.05em] text-white"}>
        {value}
      </p>
      {sub ? <p className="mt-2 text-xs text-white/40">{sub}</p> : null}
    </div>
  );
}
