"use client";

import Image from "next/image";

type Tier = "BULLION" | "HELLION" | "TORION";

type Props = {
  tier: Tier;
  selectedCount: number;
  portfolioUsd?: number;
};

const tierIdentity = {
  BULLION: {
    image: "/assets/bullion-chip.png",
    color: "#b6ff00",
    title: "Retail fund protocol",
    desc: "Single-manager allocation with basic protection rules.",
    maxManagers: 1,
    activePct: 40,
    protectedPct: 60,
    rebalance: "Manual",
    engine: "Basic",
  },
  HELLION: {
    image: "/assets/hellion-chip.png",
    color: "#ff4d4d",
    title: "Growth fund protocol",
    desc: "Two-manager structure with daily AI balancing.",
    maxManagers: 2,
    activePct: 70,
    protectedPct: 30,
    rebalance: "Daily AI",
    engine: "Balanced",
  },
  TORION: {
    image: "/assets/torion-chip.png",
    color: "#a855f7",
    title: "Institutional predator fund",
    desc: "Three-manager allocation with realtime protocol control.",
    maxManagers: 3,
    activePct: 80,
    protectedPct: 20,
    rebalance: "Realtime",
    engine: "Dynamic AI",
  },
};

export function ProtocolPanel({ tier, selectedCount, portfolioUsd = 0 }: Props) {
  const identity = tierIdentity[tier];
  const activeCapital = portfolioUsd * (identity.activePct / 100);
  const protectedCapital = portfolioUsd * (identity.protectedPct / 100);

  return (
    <section
      className="w-full max-w-full min-w-0 overflow-hidden rounded-[24px] bg-[#111214] p-5 sm:p-6"
      style={{
        border: `1px solid ${identity.color}25`,
        boxShadow: `0 0 60px ${identity.color}12`,
      }}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-4">
          <div
            className="grid h-[74px] w-[74px] shrink-0 place-items-center rounded-full border border-white/10 bg-black/30"
            style={{ boxShadow: `0 0 45px ${identity.color}45` }}
          >
            <Image
              src={identity.image}
              alt={tier}
              width={64}
              height={64}
              className="h-[64px] w-[64px] object-contain"
            />
          </div>

          <div>
            <p className="text-sm text-[#8f96a3]">Fund Protocol</p>
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
          {selectedCount}/{identity.maxManagers} managers
        </span>
      </div>

      <div className="mt-5 grid grid-cols-2 gap-3 text-sm">
        <Metric label="Active Capital" value={`$${activeCapital.toFixed(2)}`} color={identity.color} />
        <Metric label="Protected" value={`$${protectedCapital.toFixed(2)}`} color={identity.color} />
        <Metric label="Rebalance" value={identity.rebalance} color={identity.color} />
        <Metric label="AI Engine" value={identity.engine} color={identity.color} />
      </div>

      <div className="mt-5">
        <div className="h-2 overflow-hidden rounded-full bg-white/[0.05]">
          <div
            className="h-full rounded-full"
            style={{
              width: `${identity.activePct}%`,
              backgroundColor: identity.color,
            }}
          />
        </div>

        <div className="mt-2 flex justify-between text-[11px] text-white/35">
          <span>{identity.activePct}% fund engine access</span>
          <span>{identity.protectedPct}% protected reserve</span>
        </div>
      </div>

      <p className="mt-4 text-xs leading-5 text-white/45">
        Fund Protocol uses your current tier rules to control manager limits,
        capital exposure, reserve protection and rebalance behavior.
      </p>
    </section>
  );
}

function Metric({
  label,
  value,
  color,
}: {
  label: string;
  value: string;
  color: string;
}) {
  return (
    <div className="rounded-[18px] bg-black/25 p-3 ring-1 ring-white/5">
      <p className="text-[11px] text-white/35">{label}</p>
      <p className="mt-1 text-sm font-semibold text-white">{value}</p>
    </div>
  );
}
