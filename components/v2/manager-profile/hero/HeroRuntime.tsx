import type { ManagerHeroProfile } from "./types";

type Props = {
  profile: ManagerHeroProfile;
};

function gradeLabel(value?: string) {
  return value
    ? value.replaceAll("_", " ").toUpperCase()
    : "PENDING";
}

export function HeroRuntime({ profile }: Props) {
  const runtime = profile.runtime;

  const allocatorScore =
    runtime?.scores.allocatorScore ??
    profile.manager.reputation.allocatorScore ??
    0;

  const liveStrategies =
    runtime?.stats.liveStrategies ?? 0;

  const totalStrategies =
    runtime?.stats.strategies ??
    profile.stats.strategies;

  const mt5Status =
    liveStrategies > 0
      ? "LIVE"
      : totalStrategies > 0
        ? "OFFLINE"
        : "PENDING";

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Badge
        label="MT5"
        value={mt5Status}
        tone={
          mt5Status === "LIVE"
            ? "green"
            : mt5Status === "OFFLINE"
              ? "red"
              : "neutral"
        }
      />

      <Badge
        label="Allocator"
        value={allocatorScore.toFixed(0)}
        tone="green"
      />

      <Badge
        label="Runtime"
        value={gradeLabel(runtime?.universe.grade)}
      />

      <Badge
        label="Universe"
        value={
          runtime?.universe.eligible
            ? "ELIGIBLE"
            : "WATCHLIST"
        }
        tone={
          runtime?.universe.eligible
            ? "green"
            : "amber"
        }
      />
    </div>
  );
}

function Badge({
  label,
  value,
  tone = "neutral",
}: {
  label: string;
  value: string;
  tone?: "neutral" | "green" | "red" | "amber";
}) {
  const toneClass =
    tone === "green"
      ? "border-[#b6ff00]/20 bg-[#b6ff00]/8 text-[#b6ff00]"
      : tone === "red"
        ? "border-red-400/20 bg-red-400/8 text-red-300"
        : tone === "amber"
          ? "border-amber-400/20 bg-amber-400/8 text-amber-300"
          : "border-white/10 bg-white/[0.035] text-white/55";

  return (
    <div
      className={`flex items-center gap-2 rounded-full border px-3 py-2 ${toneClass}`}
    >
      <span className="text-[8px] font-black uppercase tracking-[0.16em] opacity-55">
        {label}
      </span>

      <span className="text-[10px] font-black uppercase tracking-[0.12em]">
        {value}
      </span>
    </div>
  );
}
