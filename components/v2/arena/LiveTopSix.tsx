"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

type CompetitionTrader = {
  id: string;
  traderHref: string;
  strategyHref: string;

  name: string;
  handle: string;
  subtitle: string;

  accountSize: "50K" | "200K";
  market: string;

  profitUsd: number;
  roi: number;

  winRate: number;
  drawdown: number;

  allocatorScore: number;
  challengeScore: number;
  riskScore: number;
  consistencyScore: number;

  challengeRank: number | null;
  challengeStatus: string;

  grade: string;
  mt5Status: "live" | "stale" | "offline" | "pending";
};

type MissionControlResponse = {
  leaderboards?: {
    competition?: CompetitionTrader[];
  };
};

const TOP_SIX_SIZE = 6;

export function LiveTopSix() {
  const [traders, setTraders] = useState<CompetitionTrader[]>([]);
  const [loading, setLoading] = useState(true);
  const [usingFallback, setUsingFallback] = useState(false);

  useEffect(() => {
    let alive = true;

    async function loadCompetition() {
      try {
        const response = await fetch("/api/mission-control", {
          cache: "no-store",
        });

        if (!response.ok) {
          throw new Error(`Mission Control returned ${response.status}`);
        }

        const data = (await response.json()) as MissionControlResponse;
        const competition = data.leaderboards?.competition;

        if (!alive) {
          return;
        }

        if (!Array.isArray(competition)) {
          throw new Error("Competition leaderboard is unavailable");
        }

        setTraders(competition.slice(0, TOP_SIX_SIZE));
        setUsingFallback(false);
      } catch (error) {
        console.warn("[LiveTopSix] competition fallback", error);

        if (alive) {
          setTraders([]);
          setUsingFallback(true);
        }
      } finally {
        if (alive) {
          setLoading(false);
        }
      }
    }

    loadCompetition();

    return () => {
      alive = false;
    };
  }, []);

  const positions = useMemo(() => {
    return Array.from({ length: TOP_SIX_SIZE }, (_, index) => ({
      position: index + 1,
      trader: traders[index] ?? null,
    }));
  }, [traders]);

  return (
    <section
      id="live-top-six"
      className="mx-auto w-full max-w-[1180px] scroll-mt-28 px-4 py-8"
    >
      <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <span className="relative flex h-2.5 w-2.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#b6ff00] opacity-50" />
              <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-[#b6ff00]" />
            </span>

            <p className="text-[10px] font-black uppercase tracking-[0.36em] text-[#b6ff00]">
              Season 03 · Live
            </p>
          </div>

          <h2 className="mt-3 max-w-[760px] text-4xl font-black tracking-[-0.065em] text-white md:text-5xl">
            Live Top 6.
          </h2>

          <p className="mt-3 max-w-[650px] text-sm leading-6 text-white/45 md:text-base">
            Verified performance, ranked live. The Top 6 unlock capital,
            distribution and recurring revenue.
          </p>
        </div>

        <div className="flex items-center gap-3 rounded-full border border-violet-400/15 bg-violet-500/[0.04] px-4 py-2.5">
          <span className="text-[9px] font-black uppercase tracking-[0.2em] text-white/30">
            Live ranking
          </span>

          <span className="text-[9px] font-black uppercase tracking-[0.2em] text-violet-300">
            Program Score
          </span>
        </div>
      </div>

      <div className="overflow-hidden rounded-[30px] border border-white/10 bg-[#080909] shadow-[0_35px_120px_rgba(0,0,0,0.32)]">
        <div className="border-b border-white/10 px-5 py-3 sm:px-7">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-[9px] font-black uppercase tracking-[0.3em] text-white/25">
              Season Standings
            </p>

            <div className="flex items-center gap-2">
              <StatusPill label="MT5 Verified" />
              <StatusPill label="Top 6 Qualify" green />
            </div>
          </div>
        </div>

        <div className="divide-y divide-white/10">
          {positions.map(({ position, trader }) => {
            if (!trader) {
              return (
                <OpenPosition
                  key={`open-${position}`}
                  position={position}
                  loading={loading}
                />
              );
            }

            return (
              <RankingRow
                key={trader.id}
                trader={trader}
                position={position}
              />
            );
          })}
        </div>

        {usingFallback && (
          <div className="border-t border-amber-400/15 bg-amber-400/[0.04] px-6 py-4">
            <p className="text-xs font-semibold text-amber-200/60">
              Live rankings are temporarily unavailable. Open qualifying
              positions remain visible.
            </p>
          </div>
        )}
      </div>

      <div className="mt-3 flex flex-col gap-3 rounded-[22px] border border-[#b6ff00]/15 bg-[#b6ff00]/[0.035] p-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-[9px] font-black uppercase tracking-[0.28em] text-[#b6ff00]">
            Your strategy belongs here
          </p>

          <p className="mt-1.5 text-xs font-semibold text-white/45">
            Prove your edge. Earn your position.
          </p>
        </div>

        <a
          href="/manager/strategies/new?source=challenge&returnTo=/challenge"
          className="rounded-full bg-[#b6ff00] px-6 py-2.5 text-center text-[10px] font-black uppercase tracking-[0.16em] text-black transition hover:scale-[1.02]"
        >
          Apply for Season 03
        </a>
      </div>
    </section>
  );
}

function RankingRow({
  trader,
  position,
}: {
  trader: CompetitionTrader;
  position: number;
}) {
  const score =
    trader.challengeScore > 0
      ? clampScore(trader.challengeScore)
      : null;

  const rank = getRankPresentation(position);
  const badge = getTraderBadge(trader, position);

  return (
    <article
      className={[
        "group relative px-5 py-4 transition duration-300 sm:px-7",
        position === 1
          ? "bg-[radial-gradient(circle_at_8%_50%,rgba(182,255,0,0.10),transparent_30%)]"
          : "hover:bg-white/[0.018]",
      ].join(" ")}
    >
      {position === 1 && (
        <div className="absolute inset-y-0 left-0 w-[3px] bg-[#b6ff00]" />
      )}

      <div className="grid gap-5 lg:grid-cols-[74px_minmax(0,1fr)_250px_146px] lg:items-center">
        <div className="flex items-center gap-3 lg:block">
          <p
            className={[
              "text-3xl font-black tracking-[-0.08em]",
              rank.numberClass,
            ].join(" ")}
          >
            {String(position).padStart(2, "0")}
          </p>

          <span
            className={[
              "mt-1.5 inline-flex rounded-full border px-2.5 py-1 text-[8px] font-black uppercase tracking-[0.16em]",
              rank.badgeClass,
            ].join(" ")}
          >
            {rank.label}
          </span>
        </div>

        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="truncate text-xl font-black tracking-[-0.05em] text-white sm:text-2xl">
              {trader.name}
            </h3>

            <span className="rounded-full bg-white/[0.06] px-2.5 py-1 text-[8px] font-black uppercase tracking-[0.14em] text-white/40">
              {trader.accountSize}
            </span>

            <span className="rounded-full border border-[#b6ff00]/15 bg-[#b6ff00]/[0.06] px-2.5 py-1 text-[8px] font-black uppercase tracking-[0.14em] text-[#b6ff00]">
              {badge}
            </span>
          </div>

          <p className="mt-1 truncate text-xs font-semibold text-white/30">
            {trader.handle} · {trader.market}
          </p>

          <div className="mt-3 max-w-[560px]">
            <div className="mb-1.5 flex items-center justify-between">
              <span className="text-[8px] font-black uppercase tracking-[0.18em] text-white/25">
                Program Score
              </span>

              <span
                className={[
                  "text-[10px] font-black",
                  score === null ? "text-white/25" : "text-white/65",
                ].join(" ")}
              >
                {score === null
                  ? "Awaiting score"
                  : `${score.toFixed(0)} / 100`}
              </span>
            </div>

            <div className="h-1 overflow-hidden rounded-full bg-white/[0.07]">
              <div
                className="h-full rounded-full bg-[#b6ff00] transition-all duration-700"
                style={{
                  width:
                    score === null
                      ? "0%"
                      : `${Math.max(score, 2)}%`,
                }}
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-x-5 gap-y-3 rounded-[20px] border border-white/[0.07] bg-black/20 px-4 py-3">
          <TerminalMetric
            label="ROI"
            value={formatPercent(trader.roi)}
            positive={trader.roi >= 0}
          />

          <TerminalMetric
            label="Profit"
            value={formatMoney(trader.profitUsd)}
            positive={trader.profitUsd >= 0}
          />

          <TerminalMetric
            label="Win Rate"
            value={`${trader.winRate.toFixed(0)}%`}
          />

          <TerminalMetric
            label="Max DD"
            value={`${trader.drawdown.toFixed(1)}%`}
            warning={trader.drawdown > 8}
          />
        </div>

        <div className="flex lg:justify-end">
          <Link
            href={trader.strategyHref}
            className="inline-flex min-h-11 w-full items-center justify-center rounded-full bg-white px-5 text-[9px] font-black uppercase tracking-[0.14em] text-black transition hover:bg-[#b6ff00] lg:w-auto"
          >
            View Strategy&nbsp;&nbsp;→
          </Link>
        </div>
      </div>
    </article>
  );
}

function TerminalMetric({
  label,
  value,
  positive = false,
  warning = false,
}: {
  label: string;
  value: string;
  positive?: boolean;
  warning?: boolean;
}) {
  return (
    <div>
      <p className="text-[7px] font-black uppercase tracking-[0.18em] text-white/20">
        {label}
      </p>

      <p
        className={[
          "mt-1 text-xs font-black",
          warning
            ? "text-amber-300"
            : positive
              ? "text-[#b6ff00]"
              : "text-white/70",
        ].join(" ")}
      >
        {value}
      </p>
    </div>
  );
}

function OpenPosition({
  position,
  loading,
}: {
  position: number;
  loading: boolean;
}) {
  return (
    <article className="group px-5 py-4 transition hover:bg-white/[0.015] sm:px-7">
      <div className="grid gap-4 lg:grid-cols-[78px_minmax(0,1fr)_150px_176px] lg:items-center">
        <div>
          <p className="text-3xl font-black tracking-[-0.08em] text-white/25">
            {String(position).padStart(2, "0")}
          </p>

          <span className="mt-1.5 inline-flex rounded-full border border-white/10 bg-white/[0.02] px-2.5 py-1 text-[8px] font-black uppercase tracking-[0.16em] text-white/30">
            Qualifying
          </span>
        </div>

        <div>
          <p className="text-lg font-black tracking-[-0.04em] text-white/40 transition group-hover:text-white/65">
            {loading ? "Loading live competitor…" : "Position open"}
          </p>

          <p className="mt-1 text-xs font-semibold text-white/30">
            This position will update when another verified trader qualifies.
          </p>

          <div className="mt-3 h-1 max-w-[520px] overflow-hidden rounded-full bg-white/[0.05]">
            <div className="h-full w-[4%] rounded-full bg-white/10" />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 lg:block lg:text-right">
          <Metric label="ROI" value="—" small />
          <div className="lg:mt-2">
            <Metric label="Profit" value="—" small />
          </div>
        </div>

        <div className="lg:text-right">
          <a
            href="/manager/strategies/new?source=challenge&returnTo=/challenge"
            className="inline-flex rounded-full border border-[#b6ff00]/20 bg-[#b6ff00]/[0.05] px-4 py-2.5 text-[9px] font-black uppercase tracking-[0.14em] text-[#b6ff00]/75 transition hover:border-[#b6ff00]/40 hover:bg-[#b6ff00]/10 hover:text-[#b6ff00]"
          >
            Compete for this seat
          </a>
        </div>
      </div>
    </article>
  );
}

function Metric({
  label,
  value,
  positive = false,
  small = false,
}: {
  label: string;
  value: string;
  positive?: boolean;
  small?: boolean;
}) {
  return (
    <div>
      <p
        className={[
          "font-black tracking-[-0.055em]",
          small ? "text-sm" : "text-2xl",
          positive ? "text-[#b6ff00]" : "text-white",
        ].join(" ")}
      >
        {value}
      </p>

      <p className="mt-1 text-[8px] font-black uppercase tracking-[0.18em] text-white/25">
        {label}
      </p>
    </div>
  );
}

function StatusPill({
  label,
  green = false,
}: {
  label: string;
  green?: boolean;
}) {
  return (
    <span
      className={[
        "rounded-full border px-3 py-1.5 text-[8px] font-black uppercase tracking-[0.16em]",
        green
          ? "border-[#b6ff00]/15 bg-[#b6ff00]/[0.06] text-[#b6ff00]"
          : "border-white/10 bg-white/[0.025] text-white/30",
      ].join(" ")}
    >
      {label}
    </span>
  );
}

function clampScore(value: number) {
  if (!Number.isFinite(value)) {
    return 0;
  }

  return Math.min(100, Math.max(0, value));
}

function formatPercent(value: number) {
  if (!Number.isFinite(value)) {
    return "—";
  }

  const sign = value > 0 ? "+" : "";
  return `${sign}${value.toFixed(2)}%`;
}

function formatMoney(value: number) {
  if (!Number.isFinite(value)) {
    return "—";
  }

  const normalized = Math.abs(value) < 1 ? 0 : value;
  const absolute = Math.abs(normalized);
  const formatted = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(absolute);

  if (normalized > 0) {
    return `+${formatted}`;
  }

  if (normalized < 0) {
    return `-${formatted}`;
  }

  return formatted;
}

function getTraderBadge(
  trader: CompetitionTrader,
  position: number
) {
  if (position === 1) {
    return "Season Leader";
  }

  if (trader.challengeStatus === "top_5") {
    return "Top 6";
  }

  if (trader.challengeStatus === "qualified") {
    return "Qualified";
  }

  if (trader.challengeStatus === "enrolled") {
    return "Competing";
  }

  if (trader.mt5Status === "live") {
    return "Live";
  }

  return "Verified";
}

function getRankPresentation(position: number) {
  if (position === 1) {
    return {
      label: "Uranium",
      numberClass: "text-[#b6ff00]",
      badgeClass:
        "border-[#b6ff00]/25 bg-[#b6ff00]/10 text-[#b6ff00]",
    };
  }

  if (position === 2) {
    return {
      label: "Thorium",
      numberClass: "text-[#d8b4ff]",
      badgeClass:
        "border-[#8b5cf6]/25 bg-[#8b5cf6]/10 text-[#d8b4ff]",
    };
  }

  if (position === 3) {
    return {
      label: "Orion",
      numberClass: "text-[#7dd3fc]",
      badgeClass:
        "border-[#0ea5e9]/25 bg-[#0ea5e9]/10 text-[#7dd3fc]",
    };
  }

  return {
    label: "Finalist",
    numberClass: "text-white/35",
    badgeClass:
      "border-white/10 bg-white/[0.025] text-white/30",
  };
}
