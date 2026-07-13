import type { Strategy } from "@/types/v2/domain/strategy";
import type { Manager } from "@/types/v2/domain/manager";
import type {
  MT5HealthStatus,
  StrategyRuntime,
} from "@/core/v2/runtime";

function money(n: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2,
  }).format(Number(n || 0));
}

function gradeLabel(value?: string) {
  if (!value) return "Pending";

  return value
    .replaceAll("_", " ")
    .toUpperCase();
}

function timeAgo(ms: number | null | undefined) {
  if (!ms) return "Pending";

  const diff = Math.max(
    0,
    Date.now() - Number(ms)
  );

  const sec = Math.floor(diff / 1000);
  const min = Math.floor(sec / 60);
  const hr = Math.floor(min / 60);

  if (sec < 60) return `${sec}s ago`;
  if (min < 60) return `${min}m ago`;
  if (hr < 24) return `${hr}h ago`;

  return new Date(Number(ms)).toLocaleDateString();
}

function mt5Label(status: MT5HealthStatus) {
  if (status === "live") return "Live MT5";
  if (status === "stale") return "MT5 Stale";
  if (status === "offline") return "MT5 Offline";
  return "MT5 Pending";
}

function mt5Style(status: MT5HealthStatus) {
  if (status === "live") {
    return "border-[#b6ff00]/30 bg-[#b6ff00]/10 text-[#b6ff00]";
  }

  if (status === "stale") {
    return "border-amber-400/30 bg-amber-400/10 text-amber-300";
  }

  if (status === "offline") {
    return "border-red-400/30 bg-red-400/10 text-red-300";
  }

  return "border-white/10 bg-white/[0.06] text-white/40";
}

type Props = {
  strategy: Strategy;
  manager: Manager | null;
  runtime: StrategyRuntime | null;
  challengeRank: string | number;
  challengeScore: number;
  onAllocate: () => void;
};

export function StrategyHero({
  strategy,
  manager,
  runtime,
  challengeRank,
  challengeScore,
  onAllocate,
}: Props) {
  const performance =
    runtime?.performance ?? strategy.performance;

  const roi = Number(performance.roi || 0);
  const equity = Number(
    runtime?.performance.equity || 0
  );

  const profitFactor = Number(
    performance.profitFactor || 0
  );

  const allocators = Number(
    strategy.performance.allocators || 0
  );

  const runtimeGrade = gradeLabel(
    runtime?.universe.grade
  );

  const allocatorScore = Number(
    runtime?.scores.allocatorScore || 0
  );

  const status =
    runtime?.mt5.status || "pending";

  const lastSyncLabel = timeAgo(
    runtime?.performance.lastSyncedAt
  );

  return (
    <section className="relative overflow-hidden border-b border-white/10 bg-[#050606]">
      <div
        className="absolute inset-0 bg-cover bg-center opacity-25 grayscale"
        style={{
          backgroundImage:
            strategy.identity.bannerUrl
              ? `url(${strategy.identity.bannerUrl})`
              : "none",
        }}
      />

      <div className="absolute inset-0 bg-[radial-gradient(circle_at_72%_18%,rgba(182,255,0,0.11),transparent_25%),linear-gradient(to_bottom,rgba(5,6,6,0.58),#050606_90%)]" />

      <div className="relative z-10 mx-auto max-w-[1600px] px-6 pb-9 pt-10">
        <div className="flex flex-col gap-8 xl:flex-row xl:items-end xl:justify-between">
          <div className="max-w-5xl">
            <div className="flex flex-wrap gap-2">
              <span
                className={`rounded-full border px-4 py-2 text-[10px] font-black uppercase tracking-[0.16em] ${mt5Style(status)}`}
              >
                ● {mt5Label(status)}
              </span>

              <span className="rounded-full border border-white/10 bg-white/[0.05] px-4 py-2 text-[10px] font-black uppercase tracking-[0.16em] text-white/55">
                {strategy.status.verified
                  ? "Verified"
                  : "Unverified"}
              </span>

              <span className="rounded-full border border-white/10 bg-white/[0.05] px-4 py-2 text-[10px] font-black uppercase tracking-[0.16em] text-white/55">
                Runtime {runtimeGrade}
              </span>

              <span className="rounded-full border border-white/10 bg-white/[0.05] px-4 py-2 text-[10px] font-black uppercase tracking-[0.16em] text-white/55">
                Sync {lastSyncLabel}
              </span>
            </div>

            <h1 className="mt-6 text-5xl font-black tracking-[-0.075em] sm:text-7xl">
              {strategy.identity.name}
            </h1>

            <p className="mt-5 max-w-2xl text-lg leading-8 text-white/55">
              {strategy.identity.subtitle ||
                strategy.identity.description ||
                "Verified strategy on Bullions."}
            </p>

            <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
              <HeroMetric
                label="ROI"
                value={`${roi >= 0 ? "+" : ""}${roi.toFixed(2)}%`}
                highlight={roi >= 0}
              />

              <HeroMetric
                label="Equity"
                value={
                  equity
                    ? money(equity)
                    : "Pending"
                }
              />

              <HeroMetric
                label="Allocator"
                value={allocatorScore.toFixed(0)}
                highlight={
                  allocatorScore >= 60
                }
              />

              <HeroMetric
                label="Profit Factor"
                value={profitFactor.toFixed(2)}
              />

              <HeroMetric
                label="Challenge"
                value={
                  challengeRank === "-"
                    ? "OPEN"
                    : `#${challengeRank}`
                }
                sub={
                  challengeRank === "-"
                    ? "Not enrolled"
                    : `Score ${challengeScore.toFixed(1)}`
                }
              />
            </div>
          </div>

          <div className="w-full max-w-[410px] rounded-[30px] border border-white/10 bg-black/35 p-5 backdrop-blur-xl">
            <div className="flex items-center gap-4">
              <div className="grid h-20 w-20 shrink-0 place-items-center overflow-hidden rounded-[24px] border border-[#b6ff00]/35 bg-[#b6ff00]/10 text-3xl font-black text-[#b6ff00]">
                {strategy.identity.avatarUrl ? (
                  <img
                    src={strategy.identity.avatarUrl}
                    className="h-full w-full object-cover"
                    alt=""
                  />
                ) : (
                  strategy.identity.name.slice(0, 1)
                )}
              </div>

              <div className="min-w-0">
                <p className="text-[9px] font-black uppercase tracking-[0.22em] text-white/30">
                  Strategy Manager
                </p>

                <h2 className="mt-2 truncate text-2xl font-black">
                  {manager?.identity.displayName ||
                    strategy.manager.displayName ||
                    strategy.manager.username ||
                    strategy.identity.name}
                </h2>

                <p className="mt-1 text-sm text-white/35">
                  {manager?.brand.location || `${allocators.toLocaleString()} allocators`}
                </p>
              </div>
            </div>

            <button
              onClick={onAllocate}
              className="mt-5 h-14 w-full rounded-2xl bg-[#b6ff00] text-xs font-black uppercase tracking-[0.18em] text-black transition hover:scale-[1.01]"
            >
              Allocate Capital →
            </button>
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
    <div className="rounded-[22px] border border-white/10 bg-black/25 p-4 backdrop-blur-xl">
      <p className="text-[9px] font-black uppercase tracking-[0.2em] text-white/30">
        {label}
      </p>

      <p
        className={`mt-3 text-2xl font-black tracking-[-0.05em] ${
          highlight
            ? "text-[#b6ff00]"
            : "text-white"
        }`}
      >
        {value}
      </p>

      {sub ? (
        <p className="mt-2 text-[10px] text-white/35">
          {sub}
        </p>
      ) : null}
    </div>
  );
}
