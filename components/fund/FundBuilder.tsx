"use client";

import {
  type Trader,
} from "@/lib/mockTraders";

type Tier =
  | "BULLION"
  | "HELLION"
  | "TORION"
  | "URANIO";

type Props = {
  traders: Trader[];
  selectedIds: string[];
  tier?: Tier;
  onAdd: (
    traderId: string
  ) => void;
  onRemove: (
    traderId: string
  ) => void;
  onActivate?: (
    managers: {
      traderId: string;
      allocationPct: number;
    }[]
  ) => void;
};

const tierIdentity = {
  BULLION: {
    color: "#b6ff00",
    label: "Bullion Fund",
  },

  HELLION: {
    color: "#ff4d4d",
    label: "Hellion Fund",
  },

  TORION: {
    color: "#a855f7",
    label: "Torion Fund",
  },

  URANIO: {
    color: "#ffd23f",
    label: "Uranio Fund",
  },
} as const;

export function FundBuilder({
  traders,
  selectedIds,
  tier = "BULLION",
  onRemove,
}: Props) {
  const identity =
    tierIdentity[tier];

  const selected = selectedIds
    .map((id) =>
      traders.find(
        (trader) =>
          trader.id === id
      )
    )
    .filter(Boolean) as Trader[];

  const maxManagers =
    tier === "URANIO"
      ? 5
      : tier === "TORION"
        ? 3
        : tier === "HELLION"
          ? 2
          : 1;

  const scoreValues = selected
    .map((trader) => {
      const anyTrader =
        trader as any;

      return Number(
        anyTrader.bullionsScore ??
          anyTrader.allocatorScore ??
          0
      );
    })
    .filter(
      (score) =>
        Number.isFinite(score) &&
        score > 0
    );

  const avgScore =
    scoreValues.length > 0
      ? Math.max(
          0,
          Math.min(
            100,
            scoreValues.reduce(
              (sum, score) =>
                sum + score,
              0
            ) /
              scoreValues.length
          )
        )
      : null;

  const avgLiveRoi =
    selected.length > 0
      ? selected.reduce(
          (sum, trader) =>
            sum +
            Number(
              trader.roi || 0
            ),
          0
        ) / selected.length
      : 0;

  const riskSamples = selected
    .map((trader) => {
      const anyTrader =
        trader as any;

      return Number(
        anyTrader.maxLoss ??
          anyTrader.maxDrawdown ??
          0
      );
    })
    .filter(
      (value) =>
        Number.isFinite(value) &&
        value > 0
    );

  const avgRisk =
    riskSamples.length > 0
      ? riskSamples.reduce(
          (sum, value) =>
            sum + value,
          0
        ) / riskSamples.length
      : null;

  const risk =
    selected.length === 0
      ? "--"
      : avgRisk === null
        ? "Collecting"
        : avgRisk <= 3
          ? "Low"
          : avgRisk <= 6
            ? "Medium"
            : "High";

  const diversification =
    selected.length >= 3
      ? "High"
      : selected.length === 2
        ? "Medium"
        : selected.length === 1
          ? "Single Manager"
          : "--";

  function allocationFor(
    index: number
  ) {
    if (selected.length === 1) {
      return 100;
    }

    if (selected.length === 2) {
      return tier === "BULLION"
        ? 100
        : [70, 30][index];
    }

    if (selected.length === 3) {
      return [40, 35, 25][index];
    }

    if (selected.length === 4) {
      return [
        35,
        25,
        20,
        20,
      ][index];
    }

    if (selected.length === 5) {
      return [
        30,
        25,
        20,
        15,
        10,
      ][index];
    }

    return 0;
  }

  return (
    <section
      className="relative min-w-0 overflow-hidden rounded-[32px] bg-[#090a09]"
      style={{
        border:
          `1px solid ${identity.color}2b`,
        boxShadow:
          `0 24px 80px ${identity.color}0d`,
      }}
    >
      <div
        className="pointer-events-none absolute -right-24 -top-32 h-80 w-80 rounded-full blur-3xl"
        style={{
          backgroundColor:
            `${identity.color}10`,
        }}
      />

      <div className="relative p-6 sm:p-8">
        <div className="flex flex-wrap items-start justify-between gap-5">
          <div>
            <p
              className="text-[9px] font-black uppercase tracking-[0.26em]"
              style={{
                color:
                  identity.color,
              }}
            >
              Fund Allocation
            </p>

            <h3 className="mt-3 text-4xl font-black tracking-[-0.06em] text-white">
              Your Fund
            </h3>

            <p className="mt-2 text-sm text-white/35">
              Build and control your
              {" "}
              {identity.label}.
            </p>
          </div>

          <div
            className="rounded-[20px] border px-5 py-4 text-right"
            style={{
              borderColor:
                `${identity.color}28`,
              backgroundColor:
                `${identity.color}0d`,
            }}
          >
            <p className="text-[8px] font-black uppercase tracking-[0.2em] text-white/25">
              Selected
            </p>

            <p
              className="mt-1 text-2xl font-black"
              style={{
                color:
                  identity.color,
              }}
            >
              {selected.length}/
              {maxManagers}
            </p>
          </div>
        </div>

        {selected.length === 0 ? (
          <div
            className="mt-8 rounded-[26px] border border-dashed p-10 text-center"
            style={{
              borderColor:
                `${identity.color}25`,
              backgroundColor:
                `${identity.color}07`,
            }}
          >
            <p className="text-xl font-black text-white">
              No managers selected
            </p>

            <p className="mt-2 text-sm text-white/35">
              Select verified managers
              from Strategy Universe.
            </p>
          </div>
        ) : (
          <div className="mt-8 grid gap-4">
            {selected.map(
              (
                trader,
                index
              ) => {
                const allocation =
                  allocationFor(
                    index
                  );

                const anyTrader =
                  trader as any;

                const specialty =
                  anyTrader.specialty ||
                  trader.tag ||
                  "Verified MT5";

                const equity =
                  Number(
                    anyTrader.equity ||
                      anyTrader.balance ||
                      0
                  );

                return (
                  <article
                    key={trader.id}
                    className="relative overflow-hidden rounded-[26px] border border-white/[0.08] bg-white/[0.025] p-5"
                  >
                    <div
                      className="pointer-events-none absolute -right-12 -top-16 h-40 w-40 rounded-full blur-3xl"
                      style={{
                        backgroundColor:
                          `${identity.color}0b`,
                      }}
                    />

                    <div className="relative flex flex-col gap-6 sm:flex-row sm:items-center">
                      <div
                        className="grid h-14 w-14 shrink-0 place-items-center rounded-[18px] border text-sm font-black uppercase"
                        style={{
                          color:
                            identity.color,
                          borderColor:
                            `${identity.color}30`,
                          backgroundColor:
                            `${identity.color}10`,
                        }}
                      >
                        {String(
                          trader.avatar ||
                            trader.name
                        )
                          .replace(
                            /[^a-zA-Z0-9]/g,
                            ""
                          )
                          .slice(0, 2) ||
                          "ST"}
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-start justify-between gap-4">
                          <div className="min-w-0">
                            <p className="truncate text-xl font-black tracking-[-0.04em] text-white">
                              {trader.name}
                            </p>

                            <p className="mt-1 text-xs text-white/35">
                              {specialty}
                            </p>
                          </div>

                          <button
                            type="button"
                            onClick={() =>
                              onRemove(
                                trader.id
                              )
                            }
                            className="rounded-full border border-white/10 bg-white/[0.035] px-4 py-2 text-[8px] font-black uppercase tracking-[0.16em] text-white/35 transition hover:border-red-400/25 hover:bg-red-400/10 hover:text-red-300"
                          >
                            Remove
                          </button>
                        </div>

                        <div className="mt-5">
                          <div className="mb-2 flex items-end justify-between gap-4">
                            <div>
                              <p className="text-[8px] font-black uppercase tracking-[0.18em] text-white/20">
                                Allocation
                              </p>

                              <p
                                className="mt-1 text-2xl font-black"
                                style={{
                                  color:
                                    identity.color,
                                }}
                              >
                                {allocation}%
                              </p>
                            </div>

                            {equity > 0 ? (
                              <div className="text-right">
                                <p className="text-[8px] font-black uppercase tracking-[0.18em] text-white/20">
                                  Strategy Equity
                                </p>

                                <p className="mt-1 text-sm font-black text-white/65">
                                  {money(
                                    equity
                                  )}
                                </p>
                              </div>
                            ) : null}
                          </div>

                          <div className="h-2 overflow-hidden rounded-full bg-white/[0.07]">
                            <div
                              className="h-full rounded-full"
                              style={{
                                width:
                                  `${allocation}%`,
                                backgroundColor:
                                  identity.color,
                                boxShadow:
                                  `0 0 18px ${identity.color}55`,
                              }}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </article>
                );
              }
            )}
          </div>
        )}
      </div>

      <div className="relative grid gap-px border-t border-white/[0.07] bg-white/[0.07] sm:grid-cols-2 xl:grid-cols-4">
        <FundSummary
          label="Fund Score"
          value={
            selected.length === 0
              ? "--"
              : avgScore === null
                ? "Collecting"
                : avgScore.toFixed(0)
          }
          color={
            avgScore !== null
              ? identity.color
              : undefined
          }
        />

        <FundSummary
          label="Risk"
          value={risk}
        />

        <FundSummary
          label="Diversification"
          value={diversification}
        />

        <FundSummary
          label="Avg Live ROI"
          value={
            selected.length
              ? signedPercent(
                  avgLiveRoi
                )
              : "--"
          }
          color={
            avgLiveRoi >= 0
              ? "#b6ff00"
              : "#fb7185"
          }
        />
      </div>
    </section>
  );
}

function FundSummary({
  label,
  value,
  color,
}: {
  label: string;
  value: string;
  color?: string;
}) {
  return (
    <div className="min-w-0 bg-[#090a09] px-6 py-5">
      <p className="text-[8px] font-black uppercase tracking-[0.2em] text-white/20">
        {label}
      </p>

      <p
        className="mt-2 truncate text-base font-black text-white/75"
        style={{
          color:
            color || undefined,
        }}
      >
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
      maximumFractionDigits: 0,
    }
  ).format(value);
}

function signedPercent(
  value: number
) {
  return `${value >= 0 ? "+" : ""}${value.toFixed(
    2
  )}%`;
}
