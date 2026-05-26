"use client";

import Image from "next/image";

type Tier = "BULLION" | "HELLION" | "TORION";

type Props = {
  tier: Tier;
  depositedUsd: number;
  profitUsd: number;
  allocatedUsd: number;
  availableUsd: number;
  maxAllocationPct: number;
  systemActive: boolean;
  enginePhase: "STABLE" | "EUPHORIA" | "RECOVERY" | "LOSS_DAY" | "BREAKER";
};

const tierIdentity = {
  BULLION: {
    image: "/assets/bullion-chip.png",
    color: "#b6ff00",
    title: "Retail survival mode",
    desc: "Lower exposure. More capital protected outside the engine.",
  },
  HELLION: {
    image: "/assets/hellion-chip.png",
    color: "#ff4d4d",
    title: "Aggressive recovery protocol",
    desc: "Higher engine exposure with stronger drawdown tolerance.",
  },
  TORION: {
    image: "/assets/torion-chip.png",
    color: "#a855f7",
    title: "Institutional predator mode",
    desc: "Maximum allocation access and full protocol control.",
  },
};

function getNextSundayCountdown() {
  const now = new Date();
  const next = new Date(now);
  const days = (7 - now.getDay()) % 7 || 7;

  next.setDate(now.getDate() + days);
  next.setHours(0, 0, 0, 0);

  const diff = next.getTime() - now.getTime();

  return {
    days: Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((diff / (1000 * 60)) % 60),
  };
}

export function SurvivalPanel({
  tier,
  depositedUsd,
  profitUsd,
  allocatedUsd,
  availableUsd,
  maxAllocationPct,
  systemActive,
  enginePhase,
}: Props) {
  const identity = tierIdentity[tier];

  const portfolioUsd = depositedUsd + profitUsd;
  const maxPct = Math.round(maxAllocationPct * 100);
  const usedPct = depositedUsd > 0 ? (allocatedUsd / depositedUsd) * 100 : 0;
  const roiPct = allocatedUsd > 0 ? (profitUsd / allocatedUsd) * 100 : 0;

  const riskPressure = Math.min(45, usedPct * 0.45);
  const drawdownPenalty = roiPct < 0 ? Math.min(35, Math.abs(roiPct) * 0.65) : 0;
  const inactivePenalty = systemActive ? 0 : 8;

  const survivalScore = Math.max(
    1,
    Math.min(99, Math.round(100 - riskPressure - drawdownPenalty - inactivePenalty))
  );

  const phaseLabel = {
    STABLE: "Normal execution",
    EUPHORIA: "Momentum expansion",
    LOSS_DAY: "Loss day pressure",
    BREAKER: "Breaker protection active",
    RECOVERY: "Recovery protocol engaged",
  }[enginePhase];

  const status = !systemActive
    ? "Paused protection state"
    : phaseLabel;

  const countdown = getNextSundayCountdown();

  return (
    <section className="w-full max-w-full min-w-0 overflow-hidden rounded-[24px] bg-[#111214] p-5 ring-1 ring-white/5 sm:p-6">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-4">
          <div
            className="grid h-[88px] w-[88px] shrink-0 place-items-center rounded-full border border-white/10 bg-black/30"
            style={{ boxShadow: `0 0 45px ${identity.color}45` }}
          >
            <Image
              src={identity.image}
              alt={tier}
              width={76}
              height={76}
              className="h-[76px] w-[76px] object-contain"
            />
          </div>

          <div>
            <p className="text-sm text-[#8f96a3]">Survival Protocol</p>
            <h2 className="mt-1 text-3xl font-semibold text-white">{tier}</h2>
            <p className="mt-1 text-sm font-semibold" style={{ color: identity.color }}>
              {identity.title}
            </p>
            <p className="mt-1 max-w-[420px] text-xs leading-5 text-white/45">
              {identity.desc}
            </p>
          </div>
        </div>

        <span
          className="rounded-full px-3 py-1 text-xs font-semibold ring-1"
          style={{
            color: identity.color,
            backgroundColor: `${identity.color}18`,
            borderColor: `${identity.color}40`,
          }}
        >
          Max {maxPct}%
        </span>
      </div>

      <div className="mt-5 grid grid-cols-3 gap-3 text-sm">
        <div>
          <p className="text-xs text-white/35">Portfolio</p>
          <p className="mt-1 font-semibold text-white">${portfolioUsd.toFixed(2)}</p>
        </div>

        <div>
          <p className="text-xs text-white/35">Active Engine</p>
          <p className="mt-1 font-semibold text-white">${allocatedUsd.toFixed(2)}</p>
        </div>

        <div>
          <p className="text-xs text-white/35">Protected</p>
          <p className="mt-1 font-semibold" style={{ color: identity.color }}>
            ${availableUsd.toFixed(2)}
          </p>
        </div>
      </div>

      <div className="mt-5">
        <div className="h-2 overflow-hidden rounded-full bg-white/[0.06]">
          <div
            className="h-full rounded-full"
            style={{
              width: `${Math.min(100, usedPct)}%`,
              backgroundColor: identity.color,
            }}
          />
        </div>

        <div className="mt-2 flex justify-between text-[11px] text-white/35">
          <span>{status}</span>
          <span>{usedPct.toFixed(0)}% allocated</span>
        </div>
      </div>

      <div className="mt-5 grid grid-cols-2 gap-3">
        <div className="rounded-[18px] bg-black/25 p-3 ring-1 ring-white/5">
          <p className="text-[11px] text-white/35">Withdrawal Window</p>
          <p className="mt-1 text-sm font-semibold text-white">
            {countdown.days}D {countdown.hours}H {countdown.minutes}M
          </p>
          <p className="mt-1 text-[11px]" style={{ color: identity.color }}>
            Sunday unlock
          </p>
        </div>

        <div className="rounded-[18px] bg-black/25 p-3 ring-1 ring-white/5">
          <p className="text-[11px] text-white/35">Engine State</p>
          <p className="mt-1 text-sm font-semibold text-white">{status}</p>
          <p className="mt-1 text-[11px]" style={{ color: identity.color }}>
            Survival Score {survivalScore}%
          </p>
        </div>
      </div>

      <p className="mt-4 text-xs leading-5 text-white/45">
        Survival Protocol limits active engine exposure by tier, keeps part of capital protected,
        and changes status when risk, drawdown or allocation pressure increases.
      </p>
    </section>
  );
}
