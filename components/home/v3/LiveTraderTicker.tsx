"use client";

import { useEffect, useState } from "react";

type TickerTrader = {
  id: string;
  name: string;
  roi: number;
  status: string;
  managerUid?: string | null;
  strategyId: string;
};

export function LiveTraderTicker() {
  const [rows, setRows] = useState<TickerTrader[]>([]);

  useEffect(() => {
    let alive = true;

    async function load() {
      try {
        const response = await fetch(
          "/api/leaderboard/pulse",
          { cache: "no-store" }
        );

        const data = await response.json();

        const source =
          data?.rows ||
          data?.strategies ||
          data?.leaderboard ||
          [];

        if (!alive || !Array.isArray(source)) return;

        const next = source
          .slice(0, 10)
          .map((item: any) => ({
            id: String(
              item.id ||
                item.strategyId ||
                item.name
            ),
            name: String(
              item.name ||
                item.strategyName ||
                item.identity?.name ||
                "Bullions Trader"
            ),
            roi: Number(
              item.roi ??
                item.performance?.roi ??
                0
            ),
            status: String(
              item.runtimeGrade ||
                item.grade ||
                item.status ||
                "Verified"
            ),
            managerUid:
              item.managerUid ||
              item.manager?.uid ||
              null,
            strategyId: String(
              item.strategyId ||
                item.id ||
                ""
            ),
          }));

        setRows(next);
      } catch {
        setRows([]);
      }
    }

    load();

    const interval = window.setInterval(
      load,
      15000
    );

    return () => {
      alive = false;
      window.clearInterval(interval);
    };
  }, []);

  if (!rows.length) {
    return (
      <div className="overflow-hidden rounded-full border border-white/10 bg-[#090a0b] px-4 py-3">
        <div className="flex min-w-max animate-[ticker_26s_linear_infinite] items-center gap-8 whitespace-nowrap">
          {[
            "AX BULLIONS · MT5 VERIFIED",
            "BULLIONS AI · SIX WATCHING",
            "MIA CAPITAL · RUNTIME ACTIVE",
            "SEASON 01 · LIVE",
          ].map((item) => (
            <span
              key={item}
              className="text-[9px] font-black uppercase tracking-[0.18em] text-white/35"
            >
              <span className="mr-2 text-[#b6ff00]">
                ●
              </span>
              {item}
            </span>
          ))}
        </div>
      </div>
    );
  }

  const tickerRows = [...rows, ...rows];

  return (
    <div className="group overflow-hidden rounded-full border border-white/10 bg-[#090a0b] px-4 py-3">
      <div className="flex min-w-max animate-[ticker_34s_linear_infinite] items-center gap-8 whitespace-nowrap group-hover:[animation-play-state:paused]">
        {tickerRows.map((trader, index) => {
          const href = trader.managerUid
            ? `/m/${encodeURIComponent(
                trader.managerUid
              )}`
            : `/s/${encodeURIComponent(
                trader.strategyId
              )}`;

          return (
            <a
              key={`${trader.id}-${index}`}
              href={href}
              className="flex items-center gap-3 text-[9px] font-black uppercase tracking-[0.16em] text-white/40 transition hover:text-white"
            >
              <span
                className={`h-2 w-2 rounded-full ${
                  trader.roi >= 0
                    ? "bg-[#b6ff00]"
                    : "bg-[#ff5d5d]"
                }`}
              />

              <span>{trader.name}</span>

              <span
                className={
                  trader.roi >= 0
                    ? "text-[#b6ff00]"
                    : "text-[#ff7373]"
                }
              >
                {trader.roi >= 0 ? "+" : ""}
                {trader.roi.toFixed(2)}%
              </span>

              <span className="text-white/20">
                {trader.status}
              </span>
            </a>
          );
        })}
      </div>
    </div>
  );
}
