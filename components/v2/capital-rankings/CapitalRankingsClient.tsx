"use client";

import Link from "next/link";
import {
  useEffect,
  useMemo,
  useState,
} from "react";

import type { CapitalRanking } from "@/core/v2/runtime/capital-rankings";

type SortMode =
  | "allocator"
  | "roi"
  | "drawdown"
  | "challenge";

type StatusFilter =
  | "all"
  | "live"
  | "stable"
  | "challenge";

function money(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2,
  }).format(value);
}

function pct(value: number) {
  return `${value >= 0 ? "+" : ""}${value.toFixed(2)}%`;
}

function timeAgo(timestamp: number | null) {
  if (!timestamp) return "Pending";

  const seconds = Math.max(
    0,
    Math.floor((Date.now() - timestamp) / 1000)
  );

  if (seconds < 60) return `${seconds}s ago`;
  if (seconds < 3600) {
    return `${Math.floor(seconds / 60)}m ago`;
  }

  return `${Math.floor(seconds / 3600)}h ago`;
}

function MT5Badge({
  status,
}: {
  status: CapitalRanking["mt5Status"];
}) {
  const styles = {
    live:
      "border-[#b6ff00]/30 bg-[#b6ff00]/10 text-[#b6ff00]",
    stale:
      "border-amber-400/30 bg-amber-400/10 text-amber-300",
    offline:
      "border-red-400/30 bg-red-400/10 text-red-300",
    pending:
      "border-white/10 bg-white/[0.04] text-white/35",
  };

  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-[9px] font-black uppercase tracking-[0.18em] ${styles[status]}`}
    >
      <span
        className={`h-1.5 w-1.5 rounded-full ${
          status === "live"
            ? "animate-pulse bg-[#b6ff00]"
            : status === "stale"
              ? "bg-amber-300"
              : status === "offline"
                ? "bg-red-300"
                : "bg-white/30"
        }`}
      />
      {status}
    </span>
  );
}

export function CapitalRankingsClient() {
  const [rankings, setRankings] = useState<
    CapitalRanking[]
  >([]);

  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [filter, setFilter] =
    useState<StatusFilter>("all");
  const [sort, setSort] =
    useState<SortMode>("allocator");

  useEffect(() => {
    let alive = true;

    async function load() {
      try {
        const response = await fetch(
          "/api/mission-control",
          {
            cache: "no-store",
          }
        );

        if (!response.ok) {
          throw new Error(
            `Mission Control ${response.status}`
          );
        }

        const data = await response.json();

        if (alive) {
          setRankings(
            Array.isArray(data.rankings)
              ? data.rankings
              : []
          );
        }
      } catch (error) {
        console.error(
          "[CapitalRankings] load failed",
          error
        );
      } finally {
        if (alive) setLoading(false);
      }
    }

    load();

    const interval = window.setInterval(
      load,
      15_000
    );

    return () => {
      alive = false;
      window.clearInterval(interval);
    };
  }, []);

  const filtered = useMemo(() => {
    const normalizedQuery =
      query.trim().toLowerCase();

    const list = rankings.filter((row) => {
      const matchesQuery =
        !normalizedQuery ||
        [
          row.name,
          row.handle,
          row.subtitle,
          row.market,
          row.grade,
        ]
          .join(" ")
          .toLowerCase()
          .includes(normalizedQuery);

      const matchesFilter =
        filter === "all" ||
        (filter === "live" &&
          row.mt5Status === "live") ||
        (filter === "stable" &&
          ["stable", "strong", "elite"].includes(
            row.grade
          )) ||
        (filter === "challenge" &&
          row.challengeStatus === "enrolled");

      return matchesQuery && matchesFilter;
    });

    return [...list].sort((a, b) => {
      if (sort === "roi") return b.roi - a.roi;

      if (sort === "drawdown") {
        return a.drawdown - b.drawdown;
      }

      if (sort === "challenge") {
        return (
          (a.challengeRank ?? 999) -
          (b.challengeRank ?? 999)
        );
      }

      return (
        b.allocatorScore -
        a.allocatorScore
      );
    });
  }, [rankings, query, filter, sort]);

  const liveCount = rankings.filter(
    (row) => row.mt5Status === "live"
  ).length;

  const capitalTracked = rankings.reduce(
    (total, row) => total + row.equity,
    0
  );

  return (
    <div className="space-y-6">
      <section className="relative overflow-hidden rounded-[34px] border border-white/10 bg-[#080909] p-6 sm:p-9">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_10%_0%,rgba(182,255,0,0.13),transparent_32%),radial-gradient(circle_at_90%_100%,rgba(109,61,242,0.12),transparent_30%)]" />

        <div className="relative">
          <div className="flex flex-col gap-7 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.34em] text-[#b6ff00]">
                Strategy Universe
              </p>

              <h1 className="mt-4 max-w-4xl text-5xl font-black tracking-[-0.065em] sm:text-7xl">
                Capital Rankings.
              </h1>

              <p className="mt-5 max-w-2xl text-sm leading-7 text-white/45 sm:text-base">
                Real MT5 performance ranked by
                allocator quality, consistency and
                controlled risk.
              </p>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <HeaderMetric
                label="Strategies"
                value={String(rankings.length)}
              />
              <HeaderMetric
                label="Live MT5"
                value={String(liveCount)}
              />
              <HeaderMetric
                label="Tracked Equity"
                value={money(capitalTracked)}
              />
            </div>
          </div>
        </div>
      </section>

      <section className="rounded-[28px] border border-white/10 bg-[#080909] p-4">
        <div className="grid gap-3 lg:grid-cols-[1fr_auto_auto]">
          <input
            value={query}
            onChange={(event) =>
              setQuery(event.target.value)
            }
            placeholder="Search strategy, manager, market or grade..."
            className="h-12 rounded-2xl border border-white/10 bg-black/25 px-4 text-sm font-semibold text-white outline-none placeholder:text-white/25 focus:border-[#b6ff00]/35"
          />

          <div className="flex flex-wrap gap-2">
            {(
              [
                "all",
                "live",
                "stable",
                "challenge",
              ] as StatusFilter[]
            ).map((item) => (
              <button
                key={item}
                onClick={() => setFilter(item)}
                className={`h-12 rounded-2xl px-4 text-[10px] font-black uppercase tracking-[0.16em] transition ${
                  filter === item
                    ? "bg-[#b6ff00] text-black"
                    : "border border-white/10 bg-white/[0.035] text-white/40 hover:text-white"
                }`}
              >
                {item}
              </button>
            ))}
          </div>

          <select
            value={sort}
            onChange={(event) =>
              setSort(
                event.target.value as SortMode
              )
            }
            className="h-12 rounded-2xl border border-white/10 bg-[#0b0c0c] px-4 text-xs font-black uppercase tracking-[0.14em] text-white/55 outline-none"
          >
            <option value="allocator">
              Allocator score
            </option>
            <option value="roi">ROI</option>
            <option value="drawdown">
              Lowest drawdown
            </option>
            <option value="challenge">
              Challenge rank
            </option>
          </select>
        </div>
      </section>

      {loading ? (
        <div className="rounded-[30px] border border-white/10 bg-[#080909] p-12 text-center text-sm text-white/35">
          Loading live capital rankings…
        </div>
      ) : filtered.length ? (
        <section className="grid gap-4 xl:grid-cols-2">
          {filtered.map((strategy) => (
            <CapitalRankingCard
              key={strategy.id}
              position={
                rankings.findIndex(
                  (row) => row.id === strategy.id
                ) + 1
              }
              strategy={strategy}
            />
          ))}
        </section>
      ) : (
        <div className="rounded-[30px] border border-white/10 bg-[#080909] p-12 text-center text-sm text-white/35">
          No strategies match these filters.
        </div>
      )}
    </div>
  );
}

function CapitalRankingCard({
  strategy,
  position,
}: {
  strategy: CapitalRanking;
  position: number;
}) {
  const positive = strategy.profitUsd >= 0;

  return (
    <article className="group relative overflow-hidden rounded-[30px] border border-white/10 bg-[#080909] p-5 transition duration-300 hover:-translate-y-0.5 hover:border-[#b6ff00]/25">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(182,255,0,0.07),transparent_34%)] opacity-0 transition group-hover:opacity-100" />

      <div className="relative">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="grid h-14 w-14 place-items-center rounded-2xl border border-white/10 bg-white/[0.04] text-lg font-black text-white">
              {String(position).padStart(2, "0")}
            </div>

            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-2xl font-black tracking-[-0.045em]">
                  {strategy.name}
                </h2>

                <MT5Badge
                  status={strategy.mt5Status}
                />
              </div>

              <p className="mt-1 text-sm text-white/35">
                {strategy.handle} ·{" "}
                {strategy.accountSize} ·{" "}
                {strategy.engine}
              </p>
            </div>
          </div>

          <div className="text-right">
            <p className="text-[9px] font-black uppercase tracking-[0.2em] text-white/25">
              Allocator
            </p>
            <p className="mt-1 text-3xl font-black text-[#b6ff00]">
              {strategy.allocatorScore.toFixed(0)}
            </p>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <Metric
            label="ROI"
            value={pct(strategy.roi)}
            accent={strategy.roi >= 0}
          />
          <Metric
            label="Equity"
            value={money(strategy.equity)}
          />
          <Metric
            label="Max DD"
            value={`${strategy.drawdown.toFixed(2)}%`}
          />
          <Metric
            label="Win rate"
            value={`${strategy.winRate.toFixed(1)}%`}
          />
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-[1fr_auto]">
          <div className="rounded-[22px] border border-white/8 bg-white/[0.025] p-4">
            <div className="flex items-center justify-between gap-4">
              <p className="text-[9px] font-black uppercase tracking-[0.22em] text-[#d8b4ff]">
                SIX Assessment
              </p>
              <span className="text-[9px] font-black uppercase tracking-[0.16em] text-white/25">
                {strategy.sixConviction}
              </span>
            </div>

            <p className="mt-2 line-clamp-2 text-sm leading-6 text-white/45">
              {strategy.sixAssessment}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-1">
            <Mini
              label="P/L"
              value={`${positive ? "+" : ""}${money(
                strategy.profitUsd
              )}`}
              positive={positive}
            />
            <Mini
              label="Challenge"
              value={
                strategy.challengeRank
                  ? `#${strategy.challengeRank}`
                  : "—"
              }
            />
          </div>
        </div>

        <div className="mt-5 flex items-center justify-between gap-4 border-t border-white/8 pt-5">
          <p className="text-[10px] font-semibold text-white/25">
            Last MT5 sync{" "}
            {timeAgo(strategy.lastSyncedAt)}
          </p>

          <div className="flex gap-2">
            <Link
              href={strategy.strategyHref}
              className="rounded-full border border-white/10 bg-white/[0.04] px-5 py-3 text-[10px] font-black uppercase tracking-[0.16em] text-white/55 transition hover:text-white"
            >
              View profile
            </Link>

            <Link
              href={`${strategy.strategyHref}&allocate=true`}
              className="rounded-full bg-[#b6ff00] px-5 py-3 text-[10px] font-black uppercase tracking-[0.16em] text-black transition hover:scale-[1.02]"
            >
              Allocate
            </Link>
          </div>
        </div>
      </div>
    </article>
  );
}

function HeaderMetric({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="min-w-[105px] rounded-[20px] border border-white/10 bg-black/20 p-4">
      <p className="text-[8px] font-black uppercase tracking-[0.18em] text-white/25">
        {label}
      </p>
      <p className="mt-2 text-lg font-black">
        {value}
      </p>
    </div>
  );
}

function Metric({
  label,
  value,
  accent = false,
}: {
  label: string;
  value: string;
  accent?: boolean;
}) {
  return (
    <div className="rounded-[20px] border border-white/8 bg-white/[0.025] p-4">
      <p className="text-[8px] font-black uppercase tracking-[0.18em] text-white/25">
        {label}
      </p>
      <p
        className={`mt-2 text-xl font-black ${
          accent
            ? "text-[#b6ff00]"
            : "text-white"
        }`}
      >
        {value}
      </p>
    </div>
  );
}

function Mini({
  label,
  value,
  positive = false,
}: {
  label: string;
  value: string;
  positive?: boolean;
}) {
  return (
    <div className="min-w-[120px] rounded-[20px] border border-white/8 bg-white/[0.025] p-3">
      <p className="text-[8px] font-black uppercase tracking-[0.16em] text-white/25">
        {label}
      </p>
      <p
        className={`mt-1 text-sm font-black ${
          positive
            ? "text-[#b6ff00]"
            : "text-white"
        }`}
      >
        {value}
      </p>
    </div>
  );
}
