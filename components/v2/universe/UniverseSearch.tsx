"use client";

import { useMemo, useState } from "react";
import type { StrategyCardData } from "@/types/v2/strategyCard";
import { StrategyCard } from "@/components/v2/universe/StrategyCard";

type UniverseSearchProps = {
  strategies: StrategyCardData[];
};

export function UniverseSearch({ strategies }: UniverseSearchProps) {
  const [query, setQuery] = useState("");

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();

    if (!q) return [];

    return strategies
      .filter((strategy) => {
        const searchable = [
          strategy.name,
          strategy.subtitle,
          strategy.managerName,
          strategy.variant,
          strategy.sixTitle,
          strategy.sixBody,
        ]
          .join(" ")
          .toLowerCase();

        return searchable.includes(q);
      })
      .slice(0, 12);
  }, [query, strategies]);

  return (
    <section className="rounded-[30px] border border-white/10 bg-[#080909] p-5">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.28em] text-[#d8b4ff]">
            Strategy Finder
          </p>
          <h2 className="mt-2 text-2xl font-black tracking-[-0.04em] text-white">
            Find a strategy
          </h2>
        </div>

        <p className="text-xs font-semibold text-white/30">
          {query ? `${results.length} result${results.length === 1 ? "" : "s"}` : "Search by strategy, manager or style"}
        </p>
      </div>

      <input
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder="Search Ghost Alpha, Bullions AI, momentum, official..."
        className="mt-5 h-14 w-full rounded-2xl border border-white/10 bg-black/25 px-5 text-sm font-semibold text-white outline-none placeholder:text-white/25 focus:border-[#b66dff]/40"
      />

      {query ? (
        <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {results.length ? (
            results.map((strategy) => (
              <StrategyCard key={strategy.id} strategy={strategy} />
            ))
          ) : (
            <div className="rounded-[24px] border border-white/10 bg-white/[0.025] p-8 text-center text-sm text-white/35 md:col-span-2 xl:col-span-3">
              No strategy found. Try another manager, market or style.
            </div>
          )}
        </div>
      ) : null}
    </section>
  );
}
