"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";

import {
  HeroCopyPreview,
  heroTraders,
  type HeroTrader,
} from "@/components/v2/arena/hero/HeroCopyPreview";

export function Hero() {
  const [traders, setTraders] = useState<HeroTrader[]>(heroTraders);
  const [selected, setSelected] = useState<HeroTrader>(heroTraders[0]);

  useEffect(() => {
    let alive = true;

    async function loadMissionControl() {
      try {
        const res = await fetch("/api/mission-control", { cache: "no-store" });
        const data = await res.json();

        if (!alive || !Array.isArray(data.rankings) || data.rankings.length === 0) return;

        setTraders(data.rankings);
        setSelected(data.rankings[0]);
      } catch (error) {
        console.warn("[MissionControl] fallback rankings", error);
      }
    }

    loadMissionControl();

    return () => {
      alive = false;
    };
  }, []);

  const avgProfit = useMemo(() => {
    const total = traders.reduce((acc, trader) => {
      const raw = trader.profit.replace(/[$,+]/g, "");
      return acc + Number(raw);
    }, 0);

    return Math.round((total / Math.max(traders.length, 1) / 50000) * 100);
  }, []);

  return (
    <section className="relative mx-auto max-w-[1180px] px-4 pb-16 pt-12 text-center">
      <Image
        src="/logo.png"
        alt="Bullions logo"
        width={180}
        height={180}
        className="mx-auto h-[120px] w-[120px] object-contain drop-shadow-[0_0_36px_rgba(182,255,0,0.20)]"
        priority
      />

      <Image
        src="/bullions.png"
        alt="bullions"
        width={280}
        height={90}
        className="mx-auto mt-3 h-auto w-[220px] object-contain"
        priority
      />

      <p className="mx-auto mt-6 max-w-xl text-sm leading-6 text-white/60">
        Performance becomes capital.
      </p>

      <div className="mt-5 flex flex-wrap justify-center gap-2">
        <Tag>Copy Survival</Tag>
        <Tag>AI Risk Layer</Tag>
        <Tag>Traders Get Rewarded</Tag>
      </div>

      <div className="mx-auto mt-10 grid max-w-[1120px] gap-5 lg:grid-cols-[1.18fr_0.82fr]">
        <HeroCopyPreview selected={selected} onSelect={setSelected} traders={traders} />

        <div className="hidden gap-5 lg:grid">
          <MT5SourcePanel selected={selected} />
        </div>
      </div>

      <LiveProof avgProfit={avgProfit} />
    </section>
  );
}

function MT5SourcePanel({ selected }: { selected: HeroTrader }) {
  const executions = [
    { time: "09:42", side: "BUY", pair: selected.market, pnl: "+$842.18" },
    { time: "09:28", side: "SELL", pair: selected.market, pnl: "+$291.44" },
    { time: "09:10", side: "BUY", pair: selected.market, pnl: "-$43.10", loss: true },
  ];

  return (
    <div className="rounded-[30px] border border-[#1d4ed8]/20 bg-[#07090d] p-6 text-left shadow-[0_30px_90px_rgba(0,0,0,0.22)]">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.32em] text-[#60a5fa]">
            Verified by MT5
          </p>

          <h3 className="mt-4 text-3xl font-black tracking-[-0.055em] text-white">
            {selected.name}
          </h3>

          <p className="mt-2 text-sm text-white/40">
            {selected.market} · account ••••8421 · 30m delay
          </p>
        </div>

        <span className="rounded-full border border-[#1d4ed8]/30 bg-[#1d4ed8]/10 px-3 py-1 text-[9px] font-black uppercase tracking-[0.16em] text-[#60a5fa]">
          MT5
        </span>
      </div>

      <div className="mt-6 rounded-[24px] border border-[#1d4ed8]/20 bg-[#1d4ed8]/10 p-4">
        <p className="text-[10px] font-black uppercase tracking-[0.24em] text-[#60a5fa]">
          Source
        </p>

        <p className="mt-2 text-sm leading-6 text-white/55">
          Every execution shown here is streamed from the connected MT5 account and delayed 30 minutes for participant protection.
        </p>
      </div>

      <div className="mt-6">
        <p className="text-[10px] font-black uppercase tracking-[0.24em] text-white/25">
          Latest executions
        </p>

        <div className="mt-4 divide-y divide-white/10">
          {executions.map((trade) => (
            <div
              key={`${trade.time}-${trade.side}`}
              className="flex items-center justify-between py-3"
            >
              <div>
                <p className="text-sm font-black text-white">
                  {trade.side} {trade.pair}
                </p>
                <p className="mt-1 text-xs text-white/35">{trade.time}</p>
              </div>

              <p
                className={`text-lg font-black ${
                  trade.loss ? "text-red-400" : "text-[#b6ff00]"
                }`}
              >
                {trade.pnl}
              </p>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-6 grid grid-cols-3 gap-3">
        <Mini label="Trades" value={String(selected.openTrades)} />
        <Mini label="Win" value={selected.winRate} />
        <Mini label="DD" value={selected.drawdown} />
      </div>

      <div className="mt-6 rounded-[24px] border border-white/10 bg-white/[0.025] p-4">
        <p className="text-[10px] font-black uppercase tracking-[0.24em] text-white/25">
          Why it matters
        </p>
        <p className="mt-2 text-sm leading-6 text-white/55">
          This preview proves the strategy is not just a profile. It is connected to a trading account with delayed execution history.
        </p>
      </div>

      <div className="mt-6 rounded-[24px] border border-white/10 bg-white/[0.025] p-4">
        <p className="text-[10px] font-black uppercase tracking-[0.24em] text-white/25">
          Account Preview
        </p>

        <div className="mt-4 grid grid-cols-2 gap-3">
          <Mini label="Balance" value={selected.profit} />
          <Mini label="Source" value="MT5" />
          <Mini label="Server" value="Demo 03" />
          <Mini label="Sync" value={selected.synced} />
        </div>
      </div>

      <div className="mt-5 grid grid-cols-2 gap-3">
        <a
          href={selected.strategyHref}
          className="rounded-full border border-[#1d4ed8]/30 bg-[#1d4ed8]/10 py-3 text-center text-xs font-black uppercase tracking-[0.16em] text-[#60a5fa] transition hover:bg-[#1d4ed8]/20"
        >
          Open Strategy
        </a>

        <a
          href="https://discord.com"
          target="_blank"
          rel="noreferrer"
          className="rounded-full border border-white/10 bg-white/[0.035] py-3 text-center text-xs font-black uppercase tracking-[0.16em] text-white/55 transition hover:text-white"
        >
          Discord Feed
        </a>
      </div>
    </div>
  );
}

function LiveProof({ avgProfit }: { avgProfit: number }) {
  return (
    <div className="mx-auto mt-10 grid max-w-[760px] gap-8 md:grid-cols-2 md:items-center">
      <div className="text-left">
        <div className="flex items-center gap-3">
          <span className="h-4 w-4 animate-pulse rounded-full border border-[#b6ff00] bg-[#b6ff00]/60" />
          <p className="text-5xl font-black tracking-[-0.07em] text-white">
            {avgProfit}%
          </p>
        </div>
        <p className="ml-7 mt-1 text-xs text-white/60">
          Average leaderboard profit
        </p>
      </div>

      <div className="flex items-center justify-center gap-4 md:justify-end">
        <div className="flex -space-x-3">
          <Avatar label="A" className="bg-[#b6ff00] text-black" />
          <Avatar label="G" className="bg-[#8b5cf6] text-white" />
          <Avatar label="N" className="bg-white text-black" />
        </div>

        <div className="text-left">
          <p className="text-xl font-black tracking-[-0.04em]">Online now</p>
          <p className="text-sm font-semibold text-white/45">
            traders + investors
          </p>
        </div>
      </div>
    </div>
  );
}

function Tag({ children }: { children: React.ReactNode }) {
  return (
    <span className="rounded-full border border-[#8b5cf6]/70 bg-[#6d3df2]/70 px-4 py-1 text-[10px] font-bold text-white">
      {children}
    </span>
  );
}

function Avatar({
  label,
  className,
}: {
  label: string;
  className: string;
}) {
  return (
    <div
      className={`grid h-14 w-14 place-items-center rounded-full text-xl font-black ${className}`}
    >
      {label}
    </div>
  );
}


function Mini({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.025] p-3">
      <p className="text-[9px] font-black uppercase tracking-[0.16em] text-white/25">
        {label}
      </p>
      <p className="mt-1 text-sm font-black text-white">{value}</p>
    </div>
  );
}
