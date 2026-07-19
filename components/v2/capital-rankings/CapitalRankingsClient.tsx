"use client";

import Link from "next/link";
import {
  useEffect,
  useMemo,
  useState,
} from "react";

import type { CapitalRanking } from "@/core/v2/runtime/capital-rankings";

type DiscoverRanking = CapitalRanking & {
  avatarUrl?: string;
  bannerUrl?: string;
  managerUid?: string;
};

type SortMode =
  | "allocator"
  | "roi"
  | "drawdown";

type StatusFilter =
  | "all"
  | "live"
  | "stable";

type UniverseRow = {
  id?: string;
  strategyId?: string;
  managerUid?: string;
  avatarUrl?: string;
  bannerUrl?: string;
  href?: string;
};

function pct(value: number) {
  return `${value >= 0 ? "+" : ""}${value.toFixed(2)}%`;
}

function initials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0])
    .join("")
    .toUpperCase();
}

function gradeLabel(value: string) {
  return String(value || "active")
    .replaceAll("_", " ")
    .trim();
}

export function CapitalRankingsClient() {
  const [rankings, setRankings] = useState<
    DiscoverRanking[]
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
        const [
          rankingsResponse,
          universeResponse,
        ] = await Promise.all([
          fetch("/api/mission-control", {
            cache: "no-store",
          }),
          fetch("/api/universe", {
            cache: "no-store",
          }),
        ]);

        if (!rankingsResponse.ok) {
          throw new Error(
            `Mission Control ${rankingsResponse.status}`
          );
        }

        const rankingsData =
          await rankingsResponse.json();

        const universeData =
          universeResponse.ok
            ? await universeResponse.json()
            : { rows: [] };

        const source: CapitalRanking[] =
          Array.isArray(rankingsData?.leaderboards?.universe)
            ? rankingsData.leaderboards.universe
            : [];

        const universeRows: UniverseRow[] =
          Array.isArray(universeData?.rows)
            ? universeData.rows
            : [];

        const universeByStrategy = new Map(
          universeRows.map((row) => [
            String(
              row.strategyId ||
                row.id ||
                ""
            ),
            row,
          ])
        );

        const merged = source.map(
          (
            ranking
          ): DiscoverRanking => {
            const universe =
              universeByStrategy.get(
                ranking.id
              );

            return {
              ...ranking,
              avatarUrl:
                universe?.avatarUrl || "",
              bannerUrl:
                universe?.bannerUrl || "",
              managerUid:
                universe?.managerUid || "",
              traderHref:
                universe?.href ||
                ranking.traderHref,
            };
          }
        );

        if (alive) {
          setRankings(merged);
        }
      } catch (error) {
        console.error(
          "[Discover] load failed",
          error
        );

        if (alive) {
          setRankings([]);
        }
      } finally {
        if (alive) {
          setLoading(false);
        }
      }
    }

    load();

    const interval =
      window.setInterval(load, 15_000);

    return () => {
      alive = false;
      window.clearInterval(interval);
    };
  }, []);

  const filtered = useMemo(() => {
    const normalizedQuery =
      query.trim().toLowerCase();

    const list = rankings.filter(
      (strategy) => {
        const normalizedName = String(strategy.name || "")
          .trim()
          .toLowerCase();

        const hiddenNames = [
          "managerdos",
          "new strategy",
          "hellion",
          "test",
        ];

        const isLaunchReady =
          normalizedName.length > 2 &&
          !hiddenNames.includes(normalizedName);

        const matchesQuery =
          !normalizedQuery ||
          [
            strategy.name,
            strategy.handle,
            strategy.market,
            strategy.grade,
          ]
            .join(" ")
            .toLowerCase()
            .includes(normalizedQuery);

        const matchesFilter =
          filter === "all" ||
          (filter === "live" &&
            strategy.mt5Status ===
              "live") ||
          (filter === "stable" &&
            [
              "stable",
              "strong",
              "elite",
            ].includes(
              String(
                strategy.grade
              ).toLowerCase()
            ));

        return (
          isLaunchReady &&
          matchesQuery &&
          matchesFilter
        );
      }
    );

    return [...list].sort((a, b) => {
      if (sort === "roi") {
        return b.roi - a.roi;
      }

      if (sort === "drawdown") {
        return (
          a.drawdown -
          b.drawdown
        );
      }

      return (
        b.allocatorScore -
        a.allocatorScore
      );
    });
  }, [rankings, query, filter, sort]);

  const liveCount = rankings.filter(
    (strategy) =>
      strategy.mt5Status === "live"
  ).length;

  return (
    <div className="space-y-6">
      <section className="relative overflow-hidden rounded-[34px] border border-white/10 bg-[#080909] px-6 py-10 sm:px-9 sm:py-12">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_12%_0%,rgba(182,255,0,0.13),transparent_34%),radial-gradient(circle_at_90%_100%,rgba(192,132,252,0.09),transparent_30%)]" />

        <div className="relative flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.34em] text-[#b6ff00]">
              Strategy Universe
            </p>

            <h1 className="mt-4 text-5xl font-black tracking-[-0.065em] sm:text-7xl">
              Discover performance.
            </h1>

            <p className="mt-5 max-w-xl text-sm leading-7 text-white/42">
              Explore verified firms and open any profile for the complete story.
            </p>
          </div>

          <div className="flex gap-3">
            <div className="min-w-[110px] rounded-[20px] border border-white/10 bg-black/20 p-4">
              <p className="text-[8px] font-black uppercase tracking-[0.18em] text-white/25">
                Firms
              </p>

              <p className="mt-2 text-2xl font-black text-white">
                {rankings.length}
              </p>
            </div>

            <div className="min-w-[110px] rounded-[20px] border border-[#b6ff00]/20 bg-[#b6ff00]/[0.05] p-4">
              <p className="text-[8px] font-black uppercase tracking-[0.18em] text-[#b6ff00]/55">
                Live MT5
              </p>

              <p className="mt-2 text-2xl font-black text-[#b6ff00]">
                {liveCount}
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="rounded-[28px] border border-white/10 bg-[#080909] p-4">
        <div className="grid gap-3 lg:grid-cols-[1fr_auto_auto]">
          <input
            value={query}
            onChange={(event) =>
              setQuery(
                event.target.value
              )
            }
            placeholder="Search firms or markets..."
            className="h-12 rounded-2xl border border-white/10 bg-black/25 px-4 text-sm font-semibold text-white outline-none placeholder:text-white/25 focus:border-[#b6ff00]/35"
          />

          <div className="flex gap-2">
            {(
              [
                "all",
                "live",
                "stable",
              ] as StatusFilter[]
            ).map((item) => (
              <button
                key={item}
                type="button"
                onClick={() =>
                  setFilter(item)
                }
                className={`h-12 rounded-2xl px-4 text-[9px] font-black uppercase tracking-[0.16em] transition ${
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
                event.target
                  .value as SortMode
              )
            }
            className="h-12 rounded-2xl border border-white/10 bg-[#0b0c0c] px-4 text-[9px] font-black uppercase tracking-[0.14em] text-white/55 outline-none"
          >
            <option value="allocator">
              Top ranked
            </option>

            <option value="roi">
              Highest ROI
            </option>

            <option value="drawdown">
              Lowest drawdown
            </option>
          </select>
        </div>
      </section>

      {loading ? (
        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {Array.from({
            length: 6,
          }).map((_, index) => (
            <div
              key={index}
              className="min-h-[330px] animate-pulse rounded-[30px] border border-white/10 bg-[#080909] p-6"
            >
              <div className="h-20 w-20 rounded-full bg-white/[0.07]" />
              <div className="mt-8 h-6 w-40 rounded bg-white/[0.07]" />
              <div className="mt-3 h-4 w-24 rounded bg-white/[0.04]" />
            </div>
          ))}
        </section>
      ) : filtered.length ? (
        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filtered.map(
            (strategy, index) => (
              <StrategyCard
                key={strategy.id}
                strategy={strategy}
                position={index + 1}
              />
            )
          )}
        </section>
      ) : (
        <div className="rounded-[30px] border border-white/10 bg-[#080909] p-12 text-center">
          <p className="text-sm text-white/35">
            No firms match these filters.
          </p>
        </div>
      )}
    </div>
  );
}

function StrategyCard({
  strategy,
  position,
}: {
  strategy: DiscoverRanking;
  position: number;
}) {
  const image =
    strategy.avatarUrl ||
    strategy.bannerUrl ||
    "";

  const profileHref =
    strategy.traderHref ||
    strategy.strategyHref;

  const roiPositive =
    strategy.roi >= 0;

  return (
    <Link
      href={profileHref}
      className="group relative flex min-h-[330px] flex-col overflow-hidden rounded-[30px] border border-white/10 bg-[#080909] p-6 transition duration-300 hover:-translate-y-1 hover:border-[#b6ff00]/25"
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(182,255,0,0.08),transparent_38%)] opacity-0 transition group-hover:opacity-100" />

      <div className="relative flex h-full flex-col">
        <div className="flex items-start justify-between gap-4">
          <div className="relative">
            {image ? (
              <img
                src={image}
                alt={strategy.name}
                className="h-20 w-20 rounded-2xl border border-white/10 object-cover"
              />
            ) : (
              <div className="grid h-20 w-20 place-items-center rounded-2xl border border-[#b6ff00]/20 bg-[#b6ff00]/[0.07] text-lg font-black text-[#b6ff00]">
                {initials(
                  strategy.name
                )}
              </div>
            )}
          </div>

          <span className="text-[10px] font-black tracking-[0.18em] text-white/20">
            {String(
              position
            ).padStart(2, "0")}
          </span>
        </div>

        <div className="mt-8">
          <h2 className="truncate text-3xl font-black tracking-[-0.055em] text-white transition group-hover:text-[#b6ff00]">
            {strategy.name}
          </h2>

          <p className="mt-2 truncate text-xs text-white/30">
            {strategy.market}
          </p>
        </div>

        <div className="mt-6 flex flex-wrap gap-2">
          <span
            className={`rounded-full border px-3 py-1.5 text-[7px] font-black uppercase tracking-[0.14em] ${
              strategy.mt5Status === "live"
                ? "border-[#b6ff00]/25 bg-[#b6ff00]/[0.08] text-[#b6ff00]"
                : strategy.mt5Status === "stale"
                  ? "border-amber-300/25 bg-amber-300/[0.08] text-amber-200"
                  : strategy.mt5Status === "offline"
                    ? "border-[#ff7373]/25 bg-[#ff7373]/[0.08] text-[#ff7373]"
                    : "border-white/10 bg-white/[0.04] text-white/35"
            }`}
          >
            <span
              className={`mr-1.5 inline-block h-1.5 w-1.5 rounded-full ${
                strategy.mt5Status === "live"
                  ? "animate-pulse bg-[#b6ff00]"
                  : strategy.mt5Status === "stale"
                    ? "bg-amber-200"
                    : strategy.mt5Status === "offline"
                      ? "bg-[#ff7373]"
                      : "bg-white/30"
              }`}
            />
            MT5 {strategy.mt5Status}
          </span>

          <span className="rounded-full border border-[#c084fc]/20 bg-[#c084fc]/[0.07] px-3 py-1.5 text-[7px] font-black uppercase tracking-[0.14em] text-[#d8b4fe]">
            SIX
          </span>

          <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-[7px] font-black uppercase tracking-[0.14em] text-white/40">
            {gradeLabel(
              strategy.grade
            )}
          </span>
        </div>

        <div className="mt-auto flex items-end justify-between gap-5 pt-8">
          <div>
            <p className="text-[8px] font-black uppercase tracking-[0.17em] text-white/20">
              ROI
            </p>

            <p
              className={`mt-1 text-4xl font-black tracking-[-0.065em] ${
                roiPositive
                  ? "text-[#b6ff00]"
                  : "text-[#ff7373]"
              }`}
            >
              {pct(strategy.roi)}
            </p>
          </div>

          <div className="flex items-center gap-3 text-[9px] font-black uppercase tracking-[0.15em] text-white/35 transition group-hover:text-[#b6ff00]">
            View profile
            <span className="text-xl transition group-hover:translate-x-1">
              →
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
