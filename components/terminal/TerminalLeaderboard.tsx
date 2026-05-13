"use client";

import { useEffect, useMemo, useState } from "react";
import { type Trader } from "@/lib/mockTraders";

type Props = {
  traders: Trader[];
  selectedTraderId: string;
  onSelectTrader: (id: string) => void;
};

export function TerminalLeaderboard({
  traders,
  selectedTraderId,
  onSelectTrader,
}: Props) {
  const [liveTraders, setLiveTraders] = useState<Trader[]>(traders || []);

  useEffect(() => {
    setLiveTraders(traders || []);
  }, [traders]);

  useEffect(() => {
    if (!liveTraders.length) return;

    const interval = setInterval(() => {
      setLiveTraders((prev) =>
        prev
          .map((trader) => {
            const roiMove = Number((Math.random() * 1.2 - 0.25).toFixed(1));
            const balanceMove = Math.floor(Math.random() * 850 - 120);

            return {
              ...trader,
              roi: Number(Math.max(1, trader.roi + roiMove).toFixed(1)),
              balance: Math.max(0, trader.balance + balanceMove),
            };
          })
          .sort((a, b) => b.roi - a.roi)
      );
    }, 4500);

    return () => clearInterval(interval);
  }, [liveTraders.length]);

  useEffect(() => {
    if (!liveTraders.length) return;

    const scan = setInterval(() => {
      const next = liveTraders[Math.floor(Math.random() * Math.min(liveTraders.length, 6))];
      if (next) onSelectTrader(next.id);
    }, 8500);

    return () => clearInterval(scan);
  }, [liveTraders, onSelectTrader]);

  const visibleTraders = useMemo(() => liveTraders.slice(0, 6), [liveTraders]);

  return (
    <section
      id="leaderboard"
      className="rounded-[32px] bg-[#0e0f11]/90 p-6 backdrop-blur-xl ring-1 ring-white/5"
    >
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-[28px] font-semibold tracking-tight text-white">
            Leaderboard
          </h2>
          <p className="mt-1 text-sm text-white/40">
            Top traders by live performance
          </p>
        </div>

        <span className="inline-flex items-center gap-2 rounded-full border border-[#b6ff00]/20 bg-[#b6ff00]/10 px-3 py-1 text-xs text-[#b6ff00]">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#b6ff00]" />
          Live
        </span>
      </div>

      <div className="divide-y divide-white/5">
        {visibleTraders.map((trader, index) => {
          const active = selectedTraderId === trader.id;
          const top = index === 0;

          return (
            <button
              key={trader.id}
              onMouseEnter={() => onSelectTrader(trader.id)}
              onClick={() => onSelectTrader(trader.id)}
              className={
                active
                  ? "group w-full rounded-2xl bg-white/[0.055] px-3 py-4 text-left shadow-[0_0_35px_rgba(182,255,0,0.08)] ring-1 ring-[#b6ff00]/15 transition-all duration-700"
                  : top
                    ? "group w-full rounded-2xl bg-[#b6ff00]/[0.025] px-3 py-4 text-left transition-all duration-700 hover:bg-white/[0.04]"
                    : "group w-full rounded-2xl px-3 py-4 text-left transition-all duration-700 hover:bg-white/[0.035]"
              }
            >
              <div className="grid grid-cols-[40px_1fr_auto] items-center gap-4">
                <span className={active ? "text-sm text-white" : "text-sm text-white/30"}>
                  {String(index + 1).padStart(2, "0")}
                </span>

                <div className="min-w-0">
                  <p className={active ? "truncate text-[15px] font-medium text-white" : "truncate text-[15px] font-medium text-white/75 group-hover:text-white"}>
                    {trader.name}
                  </p>
                  <p className="text-xs text-white/35">{trader.tag}</p>
                </div>

                <div className="text-right">
                  <p className={active || top ? "text-[15px] font-semibold text-[#b6ff00]" : "text-[15px] font-semibold text-white/70 group-hover:text-white"}>
                    +{trader.roi.toFixed(1)}%
                  </p>
                  <p className="text-xs text-white/30">
                    ${Math.round(trader.balance).toLocaleString()}
                  </p>
                </div>
              </div>

              {active && (
                <div className="mt-3 flex flex-wrap items-center gap-2 text-[11px] text-white/35">
                  <span>Selected</span>
                  <span>•</span>
                  <span>AI scanning live</span>
                  <span>•</span>
                  <span>Top trade +{trader.topTrade}%</span>
                  <span>•</span>
                  <span>Max loss -{trader.maxLoss}%</span>
                </div>
              )}
            </button>
          );
        })}
      </div>
    </section>
  );
}
