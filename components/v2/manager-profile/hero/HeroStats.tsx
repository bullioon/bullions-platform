import type { ManagerHeroProfile } from "./types";

type Props = {
  profile: ManagerHeroProfile;
};

function money(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(Number(value || 0));
}

export function HeroStats({ profile }: Props) {
  const runtime = profile.runtime;

  const totalCapital =
    runtime?.stats.totalCapital ??
    profile.stats.totalCapital;

  const totalAllocators =
    runtime?.stats.totalAllocators ??
    profile.stats.totalAllocators;

  const strategies =
    runtime?.stats.strategies ??
    profile.stats.strategies;

  const averageRoi =
    runtime?.stats.averageRoi ?? 0;

  return (
    <div className="grid gap-5 border-t border-white/10 pt-6 sm:grid-cols-2 xl:grid-cols-4">
      <Stat
        label="Capital Following"
        value={money(totalCapital)}
        accent
      />

      <Stat
        label="Allocators"
        value={totalAllocators.toLocaleString()}
      />

      <Stat
        label="Strategies"
        value={String(strategies)}
      />

      <Stat
        label="Average ROI"
        value={`${averageRoi >= 0 ? "+" : ""}${averageRoi.toFixed(2)}%`}
        accent={averageRoi > 0}
      />
    </div>
  );
}

function Stat({
  label,
  value,
  accent = false,
}: {
  label: string;
  value: string;
  accent?: boolean;
}) {
  return (
    <div>
      <p className="text-[9px] font-black uppercase tracking-[0.2em] text-white/25">
        {label}
      </p>

      <p
        className={`mt-2 text-3xl font-black tracking-[-0.06em] ${
          accent ? "text-[#b6ff00]" : "text-white"
        }`}
      >
        {value}
      </p>
    </div>
  );
}
