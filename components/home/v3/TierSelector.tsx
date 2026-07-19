"use client";

import { useState } from "react";

type TierId = "bullion" | "hellion" | "torion";

const tiers = {
  bullion: {
    name: "Bullion",
    tagline: "Focused conviction",
    traders: 1,
    color: "#b6ff00",
    description:
      "One verified trader. One clear thesis. Maximum simplicity.",
    benefits: [
      "One verified strategy",
      "Simple portfolio control",
      "Concentrated exposure",
      "SIX continuous monitoring",
    ],
  },

  hellion: {
    name: "Hellion",
    tagline: "Balanced exposure",
    traders: 2,
    color: "#ff4d4d",
    description:
      "Two traders with different styles to reduce concentration.",
    benefits: [
      "Two verified strategies",
      "Balanced allocation",
      "Different trading styles",
      "Lower single-trader dependence",
    ],
  },

  torion: {
    name: "Torion",
    tagline: "Intelligent diversification",
    traders: 3,
    color: "#c084fc",
    description:
      "Up to three traders, markets and behaviors inside one fund.",
    benefits: [
      "Up to three strategies",
      "Maximum diversification",
      "Flexible allocation",
      "SIX portfolio intelligence",
    ],
  },
} satisfies Record<
  TierId,
  {
    name: string;
    tagline: string;
    traders: number;
    color: string;
    description: string;
    benefits: string[];
  }
>;

export function TierSelector() {
  const [selected, setSelected] =
    useState<TierId>("bullion");

  const tier = tiers[selected];

  return (
    <section
      id="investor"
      className="rounded-[38px] border border-white/10 bg-[#080909] p-7 sm:p-10"
    >
      <div className="flex flex-col gap-6 border-b border-white/10 pb-8 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-[#b6ff00]">
            For investors
          </p>

          <h2 className="mt-4 max-w-4xl text-4xl font-black leading-[0.98] tracking-[-0.065em] sm:text-6xl">
            Build a fund.
            <span className="block text-white/25">
              Choose who manages it.
            </span>
          </h2>
        </div>

        <p className="max-w-md text-sm leading-7 text-white/40">
          Bullions finds, verifies and monitors high-performance traders.
          You choose your level of diversification.
        </p>
      </div>

      <div className="mt-8 grid gap-3 md:grid-cols-3">
        {(Object.keys(tiers) as TierId[]).map(
          (tierId) => {
            const option = tiers[tierId];
            const active = selected === tierId;

            return (
              <button
                key={tierId}
                type="button"
                onClick={() => setSelected(tierId)}
                className="rounded-[26px] border p-6 text-left transition"
                style={{
                  borderColor: active
                    ? `${option.color}88`
                    : "rgba(255,255,255,.10)",
                  background: active
                    ? `${option.color}12`
                    : "rgba(0,0,0,.20)",
                }}
              >
                <div className="flex items-center justify-between gap-4">
                  <span
                    className="grid h-8 w-8 place-items-center rounded-full border text-[10px] font-black"
                    style={{
                      borderColor: active
                        ? option.color
                        : "rgba(255,255,255,.15)",
                      color: active
                        ? option.color
                        : "rgba(255,255,255,.35)",
                    }}
                  >
                    {active ? "✓" : option.traders}
                  </span>

                  <span className="text-[9px] font-black uppercase tracking-[0.15em] text-white/25">
                    {option.traders}{" "}
                    {option.traders === 1
                      ? "Trader"
                      : "Traders"}
                  </span>
                </div>

                <h3
                  className="mt-8 text-4xl font-black tracking-[-0.06em]"
                  style={{
                    color: active
                      ? option.color
                      : "white",
                  }}
                >
                  {option.name}
                </h3>

                <p className="mt-2 text-sm text-white/35">
                  {option.tagline}
                </p>
              </button>
            );
          }
        )}
      </div>

      <div
        className="mt-5 grid gap-6 rounded-[30px] border p-7 lg:grid-cols-[0.9fr_1.1fr]"
        style={{
          borderColor: `${tier.color}55`,
          background: `${tier.color}0d`,
        }}
      >
        <div>
          <p
            className="text-[9px] font-black uppercase tracking-[0.24em]"
            style={{ color: tier.color }}
          >
            Selected Fund
          </p>

          <h3 className="mt-4 text-5xl font-black tracking-[-0.07em]">
            {tier.name}
          </h3>

          <p className="mt-3 text-xl font-black text-white/45">
            {tier.tagline}
          </p>

          <p className="mt-6 max-w-xl text-sm leading-7 text-white/40">
            {tier.description}
          </p>

          <a
            href={`/discover?tier=${selected}`}
            className="mt-8 inline-flex h-14 items-center justify-center rounded-full px-9 text-[10px] font-black uppercase tracking-[0.17em] text-black"
            style={{ background: tier.color }}
          >
            Build My {tier.name} Fund →
          </a>
        </div>

        <div className="grid place-items-center rounded-[26px] border border-white/10 bg-black/25 p-7">
          <div className="flex items-end justify-center gap-4">
            {Array.from({
              length: tier.traders,
            }).map((_, index) => (
              <div
                key={index}
                className="grid h-24 w-24 place-items-center rounded-[28px] border text-2xl font-black sm:h-28 sm:w-28"
                style={{
                  borderColor: `${tier.color}77`,
                  background: `${tier.color}12`,
                  color: tier.color,
                  transform:
                    index % 2 === 0
                      ? "translateY(-12px)"
                      : "translateY(12px)",
                }}
              >
                T{index + 1}
              </div>
            ))}
          </div>

          <div className="mt-10 grid w-full gap-2 sm:grid-cols-2">
            {tier.benefits.map((benefit) => (
              <div
                key={benefit}
                className="rounded-[16px] border border-white/10 bg-black/20 px-4 py-3 text-xs font-semibold text-white/45"
              >
                {benefit}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
