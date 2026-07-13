import type { ManagerHeroProfile } from "./types";

type Props = {
  profile: ManagerHeroProfile;
};

function gradeLabel(value?: string) {
  if (!value) return "Pending";

  return value
    .replaceAll("_", " ")
    .toUpperCase();
}

function riskLabel(score: number) {
  if (score >= 80) return "Controlled";
  if (score >= 55) return "Moderate";
  return "Elevated";
}

export function HeroRuntime({ profile }: Props) {
  const runtime = profile.runtime;

  const allocatorScore =
    runtime?.scores.allocatorScore ??
    profile.manager.reputation.allocatorScore ??
    0;

  const riskScore =
    runtime?.scores.riskScore ?? 0;

  const liveStrategies =
    runtime?.stats.liveStrategies ?? 0;

  const totalStrategies =
    runtime?.stats.strategies ??
    profile.stats.strategies;

  const grade = gradeLabel(
    runtime?.universe.grade
  );

  const mt5Status =
    liveStrategies > 0
      ? "LIVE"
      : totalStrategies > 0
        ? "OFFLINE"
        : "PENDING";

  const mt5Tone =
    mt5Status === "LIVE"
      ? "text-[#b6ff00]"
      : mt5Status === "OFFLINE"
        ? "text-red-300"
        : "text-white/35";

  return (
    <section className="mx-6 mt-8 overflow-hidden rounded-[28px] border border-white/10 bg-black/25 sm:mx-10">
      <div className="grid gap-px bg-white/10 sm:grid-cols-2 xl:grid-cols-5">
        <RuntimeMetric
          label="MT5 Network"
          value={mt5Status}
          valueClassName={mt5Tone}
          sub={`${liveStrategies}/${totalStrategies} live strategies`}
        />

        <RuntimeMetric
          label="Allocator Score"
          value={allocatorScore.toFixed(0)}
          valueClassName="text-[#b6ff00]"
          sub="Manager aggregation"
        />

        <RuntimeMetric
          label="Runtime Grade"
          value={grade}
          sub="Across active strategies"
        />

        <RuntimeMetric
          label="Risk"
          value={riskLabel(riskScore)}
          sub={`Risk score ${riskScore.toFixed(0)}`}
        />

        <RuntimeMetric
          label="Universe"
          value={
            runtime?.universe.eligible
              ? "ELIGIBLE"
              : "WATCHLIST"
          }
          valueClassName={
            runtime?.universe.eligible
              ? "text-[#b6ff00]"
              : "text-amber-300"
          }
          sub={
            runtime?.universe.visible
              ? "Public profile"
              : "Private profile"
          }
        />
      </div>
    </section>
  );
}

function RuntimeMetric({
  label,
  value,
  sub,
  valueClassName = "text-white",
}: {
  label: string;
  value: string;
  sub?: string;
  valueClassName?: string;
}) {
  return (
    <div className="bg-[#080909] p-5">
      <p className="text-[9px] font-black uppercase tracking-[0.2em] text-white/25">
        {label}
      </p>

      <p
        className={`mt-3 text-2xl font-black tracking-[-0.05em] ${valueClassName}`}
      >
        {value}
      </p>

      {sub ? (
        <p className="mt-2 text-xs leading-5 text-white/30">
          {sub}
        </p>
      ) : null}
    </div>
  );
}
