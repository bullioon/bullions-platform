"use client";

import Link from "next/link";

const executions = [
  { time: "09:42", side: "BUY", pair: "XAU/USD", pnl: "+$842.18" },
  { time: "09:28", side: "SELL", pair: "NAS100", pnl: "+$291.44" },
  { time: "09:10", side: "BUY", pair: "XAU/USD", pnl: "-$43.10", loss: true },
  { time: "08:57", side: "BUY", pair: "XAU/USD", pnl: "+$1,102.03" },
];

export function LiveMT5() {
  return (
    <section className="mx-auto max-w-[1180px] px-4">
      <div className="rounded-[36px] border border-[#1d4ed8]/20 bg-[#07090d] p-7 shadow-[0_30px_90px_rgba(0,0,0,0.24)]">
        <div className="grid gap-7 lg:grid-cols-[0.85fr_1.15fr] lg:items-start">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.36em] text-[#60a5fa]">
              Live Execution
            </p>

            <h2 className="mt-3 text-4xl font-black tracking-[-0.065em] md:text-5xl">
              Verified by MT5.
            </h2>

            <p className="mt-4 max-w-md text-sm leading-6 text-white/45">
              Every execution is streamed from a connected MetaTrader 5 account
              and delayed 30 minutes for participant protection.
            </p>

            <div className="mt-6 grid grid-cols-2 gap-3">
              <Proof label="Account" value="••••8421" />
              <Proof label="Broker" value="IC Markets" />
              <Proof label="Delay" value="30 min" blue />
              <Proof label="Source" value="MT5" />
            </div>
          </div>

          <div className="rounded-[30px] border border-white/10 bg-black/20 p-5">
            <div className="flex items-center justify-between">
              <p className="text-[10px] font-black uppercase tracking-[0.28em] text-white/30">
                Latest Executions
              </p>

              <span className="rounded-full border border-[#1d4ed8]/30 bg-[#1d4ed8]/15 px-3 py-1 text-[9px] font-black uppercase tracking-[0.16em] text-[#60a5fa]">
                streamed
              </span>
            </div>

            <div className="mt-5 divide-y divide-white/10">
              {executions.map((trade) => (
                <div key={`${trade.time}-${trade.side}`} className="flex items-center justify-between py-4">
                  <div>
                    <p className="text-sm font-black text-white">
                      {trade.side} {trade.pair}
                    </p>
                    <p className="mt-1 text-xs text-white/35">{trade.time}</p>
                  </div>

                  <p className={`text-xl font-black tracking-[-0.04em] ${
                    trade.loss ? "text-red-400" : "text-[#b6ff00]"
                  }`}>
                    {trade.pnl}
                  </p>
                </div>
              ))}
            </div>

            <div className="mt-5 grid grid-cols-2 gap-3">
              <Link
                href="/strategy-profile?id=ghost-alpha"
                className="rounded-full bg-[#b6ff00] py-4 text-center text-xs font-black uppercase tracking-[0.14em] text-black"
              >
                Open Strategy
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
          </div>
        </div>
      </div>
    </section>
  );
}

function Proof({
  label,
  value,
  blue = false,
}: {
  label: string;
  value: string;
  blue?: boolean;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.025] p-4">
      <p className="text-[9px] font-black uppercase tracking-[0.18em] text-white/25">
        {label}
      </p>
      <p className={`mt-2 text-sm font-black ${blue ? "text-[#60a5fa]" : "text-white"}`}>
        {value}
      </p>
    </div>
  );
}
