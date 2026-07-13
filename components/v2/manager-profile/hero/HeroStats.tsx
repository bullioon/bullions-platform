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

  const verified =
    runtime?.stats.verifiedStrategies ??
    profile.stats.verifiedStrategies;

  const averageRoi =
    runtime?.stats.averageRoi ?? 0;

  return (
    <section className="mx-6 mt-4 overflow-hidden rounded-[28px] border border-white/10 bg-black/20 sm:mx-10">
      <div className="grid gap-px bg-white/10 sm:grid-cols-2 xl:grid-cols-5">
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
          label="Verified"
          value={String(verified)}
        />

        <Stat
          label="Average ROI"
          value={`${averageRoi >= 0 ? "+" : ""}${averageRoi.toFixed(2)}%`}
          accent={averageRoi >= 0}
        />
      </div>
    </section>
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
    <div className="bg-[#080909] p-5 sm:p-6">
      <p className="text-[9px] font-black uppercase tracking-[0.2em] text-white/25">
        {label}
      </p>

      <p
        className={`mt-3 text-3xl font-black tracking-[-0.06em] ${
          accent ? "text-[#b6ff00]" : "text-white"
        }`}
      >
        {value}
      </p>
    </div>
  );
}
