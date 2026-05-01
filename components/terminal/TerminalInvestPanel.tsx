"use client";

import { useMemo, useState } from "react";
import { type Trader } from "@/lib/mockTraders";

type Props = {
  trader?: Trader;
  totalInvested: number;
  estimatedProfit: number;
  onInvest: (amount: number, traderOverride?: Trader) => void;
};

export function TerminalInvestPanel({
  trader,
  totalInvested,
  estimatedProfit,
  onInvest,
}: Props) {
  const [amount, setAmount] = useState(250);

  const score = useMemo(() => {
    if (!trader) return 0;
    return Math.min(96, Math.max(60, Math.round(trader.roi + trader.topTrade - trader.maxLoss)));
  }, [trader]);

  return (
    <section
      id="copy"
      className="rounded-[24px] bg-[#111214] p-8 shadow-[0_0_0_1px_rgba(255,255,255,0.04)]"
    >
      <div className="flex items-start justify-between gap-5">
        <div>
          <p className="text-sm text-[#8f96a3]">Bullions Terminal</p>
          <h2 className="mt-1 text-3xl font-semibold tracking-tight text-white">
            Copy setup
          </h2>
          <p className="mt-2 text-sm text-[#8f96a3]">
            Select amount and activate the copy engine.
          </p>
        </div>

        <span className="rounded-full bg-white/[0.06] px-3 py-1 text-xs font-medium text-white/50">
          {score}% score
        </span>
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
        <div>
          <p className="text-xs text-[#8f96a3]">Selected trader</p>
          <h3 className="mt-1 text-2xl font-semibold text-white">
            {trader?.name || "None"}
          </h3>

          <div className="mt-6 space-y-3">
            {[
              ["Pair", "XAU/USD"],
              ["Available", `$${totalInvested.toLocaleString()}`],
              ["Current P/L", `${estimatedProfit >= 0 ? "+" : ""}$${estimatedProfit.toFixed(2)}`],
            ].map(([label, value]) => (
              <div key={label} className="flex items-center justify-between border-b border-white/5 pb-3 last:border-0">
                <span className="text-sm text-[#8f96a3]">{label}</span>
                <span className="text-sm font-medium text-white">{value}</span>
              </div>
            ))}
          </div>
        </div>

        <div>
          <p className="text-xs text-[#8f96a3]">Allocation</p>

          <div className="mt-3 grid grid-cols-3 gap-2">
            {[100, 250, 500].map((value) => (
              <button
                key={value}
                onClick={() => setAmount(value)}
                className={
                  amount === value
                    ? "h-12 rounded-full bg-white text-sm font-semibold text-black transition active:scale-[0.98]"
                    : "h-12 rounded-full bg-white/[0.06] text-sm font-medium text-white/70 transition hover:bg-white/[0.1] active:scale-[0.98]"
                }
              >
                ${value}
              </button>
            ))}
          </div>

          <button
            onClick={() => trader && onInvest(amount, trader)}
            disabled={!trader}
            className="mt-5 h-[56px] w-full rounded-full bg-[#b6ff00] text-sm font-semibold text-black transition hover:opacity-90 active:scale-[0.98] disabled:opacity-40"
          >
            {trader ? `Copy ${trader.name}` : "Select trader"}
          </button>

          <p className="mt-4 text-center text-xs text-[#8f96a3]">
            Copy engine starts after confirming this setup.
          </p>
        </div>
      </div>
    </section>
  );
}
