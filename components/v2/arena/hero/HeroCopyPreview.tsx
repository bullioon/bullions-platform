"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

import {
  missionTraders,
  type MissionTrader,
} from "@/core/v2/runtime/mission-control";

export type HeroTrader = MissionTrader;
export const heroTraders = missionTraders;

export function HeroCopyPreview({
  selected,
  onSelect,
  traders = heroTraders,
}: {
  selected: HeroTrader;
  onSelect: (trader: HeroTrader) => void;
  traders?: HeroTrader[];
}) {
  const [proofTrader, setProofTrader] = useState<HeroTrader | null>(null);

  return (
    <>
      <section className="rounded-[36px] border border-white/10 bg-[#080909] p-7 text-left shadow-[0_30px_90px_rgba(0,0,0,0.26)]">
        <div className="grid gap-6 lg:grid-cols-[1fr_240px] lg:items-start">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.36em] text-[#b6ff00]">
              Capital Rankings
            </p>

            <h2 className="mt-3 text-4xl font-black tracking-[-0.065em]">
              Capital Rankings
            </h2>

            <p className="mt-3 text-sm font-semibold text-white/35">
              Season leaders ranked by verified execution.
            </p>
          </div>

          <SeasonPanel />
        </div>

        <div className="mt-6 divide-y divide-white/10">
          {traders.map((trader, index) => {
            const active = selected.id === trader.id;
            const rank = getRank(index);

            return (
              <div
                key={trader.id}
                onMouseEnter={() => onSelect(trader)}
                className={`group grid w-full grid-cols-1 gap-4 py-5 transition duration-300 sm:grid-cols-[96px_1fr_auto] sm:items-center ${
                  active ? "opacity-100" : "opacity-40 hover:opacity-100"
                }`}
              >
                <div className={`w-fit rounded-full border px-2.5 py-1 text-center text-[8px] font-black uppercase tracking-[0.14em] ${rank.className}`}>
                  {rank.label}
                </div>

                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="truncate text-base font-black tracking-[-0.045em] text-white">
                      {trader.name}
                    </p>

                    <Pill>{trader.accountSize}</Pill>
                    <Pill>{trader.market}</Pill>

                    <button
                      onClick={() => setProofTrader(trader)}
                      className="rounded-full border border-[#1d4ed8]/30 bg-[#1d4ed8]/15 px-2.5 py-0.5 text-[8px] font-black uppercase tracking-[0.14em] text-[#60a5fa] transition hover:bg-[#1d4ed8]/25"
                    >
                      Execution Proof
                    </button>
                  </div>

                  <p className="mt-2 text-xs text-white/35">
                    {trader.handle}
                  </p>

                  <div className="mt-2 flex gap-4 text-[10px] font-black uppercase tracking-[0.16em]">
                    <Link href={trader.traderHref} className="text-white/25 hover:text-white">
                      Trader
                    </Link>

                    <Link href={trader.strategyHref} className="text-white/25 hover:text-[#b6ff00]">
                      Strategy
                    </Link>

                    <button
                      onClick={() => setProofTrader(trader)}
                      className="text-[#60a5fa]/70 hover:text-[#60a5fa]"
                    >
                      Execution Proof →
                    </button>
                  </div>
                </div>

                <div className="text-left sm:text-right">
                  <p className="text-4xl font-black tracking-[-0.085em] text-white sm:text-[42px]">
                    {trader.profit}
                  </p>
                  <p className="mt-1 text-[10px] font-black uppercase tracking-[0.2em] text-[#b6ff00]">
                    Profit
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {proofTrader && (
        <ExecutionProofDrawer trader={proofTrader} onClose={() => setProofTrader(null)} />
      )}
    </>
  );
}

function SeasonPanel() {
  const [left, setLeft] = useState({ d: 19, h: 23, m: 59, s: 59 });

  useEffect(() => {
    const endsAt = Date.now() + 20 * 24 * 60 * 60 * 1000;

    const id = setInterval(() => {
      const diff = Math.max(0, endsAt - Date.now());
      setLeft({
        d: Math.floor(diff / (24 * 60 * 60 * 1000)),
        h: Math.floor((diff / (60 * 60 * 1000)) % 24),
        m: Math.floor((diff / (60 * 1000)) % 60),
        s: Math.floor((diff / 1000) % 60),
      });
    }, 1000);

    return () => clearInterval(id);
  }, []);

  return (
    <div className="rounded-[28px] border border-white/10 bg-white/[0.025] p-4">
      <p className="text-[10px] font-black uppercase tracking-[0.26em] text-white/30">
        Season 03
      </p>

      <div className="mt-4 grid grid-cols-4 gap-2">
        <TimeBox value={left.d} label="D" />
        <TimeBox value={left.h} label="H" />
        <TimeBox value={left.m} label="M" />
        <TimeBox value={left.s} label="S" />
      </div>

      <div className="mt-4 grid grid-cols-2 gap-2">
        <SmallStat label="Seats" value="12 / 20" green />
        <SmallStat label="Managers" value="127" />
      </div>

      <a
        href="#challenge"
        className="mt-4 block rounded-full bg-[#b6ff00] py-3 text-center text-xs font-black uppercase tracking-[0.16em] text-black"
      >
        Join Season
      </a>
    </div>
  );
}

function TimeBox({ value, label }: { value: number; label: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-black/20 px-2 py-2 text-center">
      <p className="text-base font-black tracking-[-0.04em]">
        {String(value).padStart(2, "0")}
      </p>
      <p className="mt-0.5 text-[8px] font-black uppercase tracking-[0.16em] text-[#b6ff00]">
        {label}
      </p>
    </div>
  );
}

function SmallStat({
  label,
  value,
  green = false,
}: {
  label: string;
  value: string;
  green?: boolean;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-black/20 p-3">
      <p className="text-[8px] font-black uppercase tracking-[0.16em] text-white/25">
        {label}
      </p>
      <p className={`mt-1 text-sm font-black ${green ? "text-[#b6ff00]" : "text-white"}`}>
        {value}
      </p>
    </div>
  );
}

function Pill({ children }: { children: React.ReactNode }) {
  return (
    <span className="rounded-full bg-white/10 px-2.5 py-0.5 text-[8px] font-black uppercase tracking-[0.12em] text-white/40">
      {children}
    </span>
  );
}

function getRank(index: number) {
  if (index === 0) {
    return {
      label: "☢ Uranium",
      className: "border-[#b6ff00]/25 bg-[#b6ff00]/10 text-[#b6ff00]",
    };
  }

  if (index === 1) {
    return {
      label: "⚛ Thorium",
      className: "border-[#8b5cf6]/25 bg-[#8b5cf6]/10 text-[#d8b4ff]",
    };
  }

  if (index === 2) {
    return {
      label: "✦ Orion",
      className: "border-[#0ea5e9]/25 bg-[#0ea5e9]/10 text-[#7dd3fc]",
    };
  }

  return {
    label: `0${index + 1}`,
    className: "border-transparent bg-transparent text-white/25",
  };
}

function ExecutionProofDrawer({
  trader,
  onClose,
}: {
  trader: HeroTrader;
  onClose: () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center bg-black/70 p-4 backdrop-blur-md"
      onClick={onClose}
    >
      <aside
        className="max-h-[86vh] w-full max-w-[460px] overflow-y-auto rounded-[34px] border border-[#1d4ed8]/20 bg-[#080909] p-5 text-white shadow-[0_30px_120px_rgba(0,0,0,0.65)]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.32em] text-[#60a5fa]">
              Execution Proof
            </p>

            <h3 className="mt-3 text-2xl font-black tracking-[-0.055em]">
              Verified MetaTrader 5
            </h3>

            <p className="mt-3 text-sm text-white/45">
              Streamed from MT5 account <span className="text-white">••••8421</span>.
            </p>

            <p className="mt-1 text-sm text-white/35">
              IC Markets · 30 minute delay.
            </p>
          </div>

          <button
            onClick={onClose}
            className="rounded-full border border-white/10 px-3 py-2 text-xs font-black text-white/50 hover:text-white"
          >
            Close
          </button>
        </div>

        <div className="mt-5 rounded-[22px] border border-[#1d4ed8]/25 bg-[#1d4ed8]/10 p-4">
          <p className="text-[10px] font-black uppercase tracking-[0.28em] text-[#60a5fa]">
            Source
          </p>
          <p className="mt-2 text-xs leading-5 text-white/55">
            Streamed from the connected MT5 account. Delayed 30 minutes for participant protection.
          </p>
        </div>

        <div className="mt-5">
          <p className="text-[10px] font-black uppercase tracking-[0.28em] text-white/30">
            Latest Executions
          </p>

          <div className="mt-3 space-y-2">
            <Execution pair={trader.market} side="BUY" pnl="+$842.18" time="09:42" />
            <Execution pair={trader.market} side="SELL" pnl="+$291.44" time="09:28" />
            <Execution pair={trader.market} side="BUY" pnl="-$43.10" time="09:10" loss />
            <Execution pair={trader.market} side="BUY" pnl="+$1,102.03" time="08:57" />
          </div>
        </div>

        <div className="mt-8 grid grid-cols-2 gap-3">
          <Link
            href={trader.strategyHref}
            className="rounded-full bg-[#b6ff00] py-4 text-center text-xs font-black uppercase tracking-[0.14em] text-black"
          >
            Strategy
          </Link>

          <a
            href="https://discord.com"
            target="_blank"
            rel="noreferrer"
            className="rounded-full border border-white/10 bg-white/[0.035] py-4 text-center text-xs font-black uppercase tracking-[0.14em] text-white/60 hover:text-white"
          >
            Discord Feed
          </a>
        </div>
      </aside>
    </div>
  );
}

function Execution({
  pair,
  side,
  pnl,
  time,
  loss = false,
}: {
  pair: string;
  side: string;
  pnl: string;
  time: string;
  loss?: boolean;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.025] p-3">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-black">
            {side} {pair}
          </p>
          <p className="mt-1 text-xs text-white/35">{time}</p>
        </div>

        <p className={`text-base font-black ${loss ? "text-red-400" : "text-[#b6ff00]"}`}>
          {pnl}
        </p>
      </div>
    </div>
  );
}
