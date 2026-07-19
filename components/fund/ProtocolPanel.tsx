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
    title: "Retail Fund Protocol",
    desc: "Focused single-manager allocation with enhanced capital protection.",
    maxManagers: 1,
    activePct: 40,
    protectedPct: 60,
    rebalance: "Manual",
    engine: "Core",
  },

  HELLION: {
    image: "/assets/hellion-chip.png",
    color: "#ff4d4d",
    title: "Growth Fund Protocol",
    desc: "Two-manager structure with daily intelligent rebalancing.",
    maxManagers: 2,
    activePct: 70,
    protectedPct: 30,
    rebalance: "Daily",
    engine: "Balanced AI",
  },

  TORION: {
    image: "/assets/torion-chip.png",
    color: "#a855f7",
    title: "Institutional Predator Fund",
    desc: "Three-manager allocation with real-time protocol control.",
    maxManagers: 3,
    activePct: 80,
    protectedPct: 20,
    rebalance: "Realtime",
    engine: "Dynamic AI",
  },
} as const;

export function ProtocolPanel({
  tier,
  selectedCount,
  portfolioUsd = 0,
}: Props) {
  const identity = tierIdentity[tier];

  const activeCapital =
    portfolioUsd *
    (identity.activePct / 100);

  const protectedCapital =
    portfolioUsd *
    (identity.protectedPct / 100);

  return (
    <section
      className="relative min-w-0 overflow-hidden rounded-[32px] bg-[#090a0a]"
      style={{
        border: `1px solid ${identity.color}2e`,
        boxShadow:
          `0 24px 80px ${identity.color}10`,
      }}
    >
      <div
        className="pointer-events-none absolute -left-24 -top-32 h-80 w-80 rounded-full blur-3xl"
        style={{
          backgroundColor:
            `${identity.color}14`,
        }}
      />

      <div
        className="pointer-events-none absolute -right-24 -top-32 h-72 w-72 rounded-full border"
        style={{
          borderColor:
            `${identity.color}18`,
        }}
      />

      <div className="relative p-6 sm:p-8">
        <div className="flex flex-wrap items-start justify-between gap-5">
          <div className="flex min-w-0 items-center gap-4">
            <div
              className="grid h-[78px] w-[78px] shrink-0 place-items-center rounded-[24px] border bg-black/30"
              style={{
                borderColor:
                  `${identity.color}30`,
                boxShadow:
                  `0 0 48px ${identity.color}22`,
              }}
            >
              <Image
                src={identity.image}
                alt={tier}
                width={68}
                height={68}
                className="h-[68px] w-[68px] object-contain"
              />
            </div>

            <div className="min-w-0">
              <p className="text-[9px] font-black uppercase tracking-[0.24em] text-white/30">
                Fund Protocol
              </p>

              <h2 className="mt-2 text-4xl font-black tracking-[-0.06em] text-white">
                {tier}
              </h2>

              <p
                className="mt-2 text-sm font-black"
                style={{
                  color: identity.color,
                }}
              >
                {identity.title}
              </p>
            </div>
          </div>

          <span
            className="rounded-full border px-4 py-2 text-[9px] font-black uppercase tracking-[0.16em]"
            style={{
              color: identity.color,
              backgroundColor:
                `${identity.color}12`,
              borderColor:
                `${identity.color}35`,
            }}
          >
            {selectedCount}/
            {identity.maxManagers} Managers
          </span>
        </div>

        <div className="mt-10">
          <p className="text-[9px] font-black uppercase tracking-[0.22em] text-white/25">
            Total Capital
          </p>

          <p className="mt-2 text-5xl font-black tracking-[-0.075em] text-white sm:text-6xl">
            {money(portfolioUsd)}
          </p>

          <p className="mt-3 max-w-xl text-sm leading-6 text-white/35">
            {identity.desc}
          </p>
        </div>

        <div className="mt-9 grid gap-6 border-t border-white/[0.07] pt-7 sm:grid-cols-2">
          <ProtocolValue
            label="Active Capital"
            value={money(activeCapital)}
            color={identity.color}
          />

          <ProtocolValue
            label="Protected Reserve"
            value={money(
              protectedCapital
            )}
          />
        </div>

        <div className="mt-8">
          <div className="h-2 overflow-hidden rounded-full bg-white/[0.06]">
            <div
              className="h-full rounded-full"
              style={{
                width:
                  `${identity.activePct}%`,
                backgroundColor:
                  identity.color,
                boxShadow:
                  `0 0 18px ${identity.color}65`,
              }}
            />
          </div>

          <div className="mt-3 flex flex-wrap justify-between gap-3 text-[9px] font-black uppercase tracking-[0.14em] text-white/25">
            <span>
              {identity.activePct}% Active
            </span>

            <span>
              {identity.protectedPct}% Protected
            </span>
          </div>
        </div>
      </div>

      <div className="relative grid gap-px border-t border-white/[0.07] bg-white/[0.07] sm:grid-cols-3">
        <ProtocolDetail
          label="Rebalance"
          value={identity.rebalance}
        />

        <ProtocolDetail
          label="Engine"
          value={identity.engine}
        />

        <ProtocolDetail
          label="Manager Limit"
          value={`${identity.maxManagers}`}
        />
      </div>
    </section>
  );
}

function ProtocolValue({
  label,
  value,
  color,
}: {
  label: string;
  value: string;
  color?: string;
}) {
  return (
    <div>
      <p className="text-[9px] font-black uppercase tracking-[0.2em] text-white/25">
        {label}
      </p>

      <p
        className="mt-2 text-2xl font-black tracking-[-0.04em]"
        style={{
          color: color || "white",
        }}
      >
        {value}
      </p>
    </div>
  );
}

function ProtocolDetail({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="bg-[#090a0a] px-6 py-5">
      <p className="text-[8px] font-black uppercase tracking-[0.2em] text-white/20">
        {label}
      </p>

      <p className="mt-2 text-sm font-black text-white/70">
        {value}
      </p>
    </div>
  );
}

function money(value: number) {
  return new Intl.NumberFormat(
    "en-US",
    {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 2,
    }
  ).format(value);
}
