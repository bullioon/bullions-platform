"use client";

import { useEffect, useMemo, useState } from "react";
import { type Trader } from "@/lib/mockTraders";

type Props = {
  trader?: Trader;
  totalInvested: number;
  estimatedProfit: number;
  onInvest: (amount: number, traderOverride?: Trader) => void;
};

const PRESETS = [100, 250, 500];

export function TerminalInvestPanel({
  trader,
  totalInvested,
  estimatedProfit,
  onInvest,
}: Props) {
  const available = Math.max(0, totalInvested);
  const [amount, setAmount] = useState(0);

  useEffect(() => {
    if (available <= 0) {
      setAmount(0);
      return;
    }

    setAmount((current) => {
      if (current > available) return available;
      if (current <= 0) return Math.min(100, available);
      return current;
    });
  }, [available]);

  const score = useMemo(() => {
    if (!trader) return 0;
    return Math.min(96, Math.max(60, Math.round(trader.roi + trader.topTrade - trader.maxLoss)));
  }, [trader]);

  const canCopy = Boolean(trader) && amount > 0 && amount <= available;

  function updateAmount(value: number) {
    const clean = Math.max(0, Math.min(value || 0, available));
    setAmount(clean);
  }

  return (
    <section
      id="copy"
      className="w-full max-w-full min-w-0 overflow-hidden rounded-[24px] bg-[#111214] p-5 shadow-[0_0_0_1px_rgba(255,255,255,0.04)] sm:p-8"
    >
      <div className="flex items-start justify-between gap-5">
        <div>
          <p className="text-sm text-[#8f96a3]">Bullions Terminal</p>
          <h2 className="mt-1 text-3xl font-semibold tracking-tight text-white">
            Copy setup
          </h2>
          <p className="mt-2 text-sm text-[#8f96a3]">
            Choose how much of your available balance to allocate.
          </p>
        </div>

        <span className="rounded-full bg-white/[0.06] px-3 py-1 text-xs font-medium text-white/50">
          {score}% score
        </span>
      </div>

      <div className="mt-8 grid min-w-0 gap-6 lg:grid-cols-[0.9fr_1.1fr]">
        <div>
          <p className="text-xs text-[#8f96a3]">Selected trader</p>
          <h3 className="mt-1 text-2xl font-semibold text-white">
            {trader?.name || "None"}
          </h3>

          <div className="mt-6 space-y-3">
            {[
              ["Pair", "XAU/USD"],
              ["Available cash", `$${available.toLocaleString()}`],
            ].map(([label, value]) => (
              <div key={label} className="flex min-w-0 items-center justify-between gap-4 border-b border-white/5 pb-3 last:border-0">
                <span className="text-sm text-[#8f96a3]">{label}</span>
                <span className="min-w-0 truncate text-right text-sm font-medium text-white">{value}</span>
              </div>
            ))}
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between">
            <p className="text-xs text-[#8f96a3]">Allocation</p>
            <button
              onClick={() => updateAmount(available)}
              disabled={available <= 0}
              className="rounded-full bg-white/[0.06] px-3 py-1 text-xs font-semibold text-[#b6ff00] transition hover:bg-white/[0.1] disabled:cursor-not-allowed disabled:opacity-30"
            >
              Max
            </button>
          </div>

          <div className="mt-3 rounded-[22px] bg-black/25 px-5 py-4 ring-1 ring-white/10">
            <div className="flex items-center gap-2">
              <span className="text-3xl font-semibold text-white/40">$</span>
              <input
                type="number"
                value={amount || ""}
                onChange={(e) => updateAmount(Number(e.target.value))}
                placeholder="0"
                className="min-w-0 flex-1 bg-transparent text-3xl font-semibold text-white outline-none placeholder:text-white/20"
              />
            </div>
            <p className="mt-2 text-xs text-white/35">
              Available: ${available.toLocaleString()}
            </p>
          </div>

          <div className="mt-3 grid grid-cols-3 gap-2">
            {PRESETS.map((value) => {
              const disabled = value > available;

              return (
                <button
                  key={value}
                  onClick={() => updateAmount(value)}
                  disabled={disabled}
                  className={
                    disabled
                      ? "h-12 cursor-not-allowed rounded-full bg-white/[0.03] text-sm font-medium text-white/20"
                      : amount === value
                        ? "h-12 rounded-full bg-white text-sm font-semibold text-black transition active:scale-[0.98]"
                        : "h-12 rounded-full bg-white/[0.06] text-sm font-medium text-white/70 transition hover:bg-white/[0.1] active:scale-[0.98]"
                  }
                >
                  ${value}
                </button>
              );
            })}
          </div>

          {amount > available && (
            <p className="mt-3 text-xs text-red-400">
              Allocation cannot exceed available balance.
            </p>
          )}

          {available <= 0 && (
            <p className="mt-3 text-xs text-white/35">
              Deposit with Phantom first to activate copy setup.
            </p>
          )}

          <button
            onClick={() => trader && canCopy && onInvest(amount, trader)}
            disabled={!canCopy}
            className="mt-5 h-[56px] w-full max-w-full truncate rounded-full bg-[#b6ff00] px-4 text-sm font-semibold text-black transition hover:opacity-90 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40"
          >
            {!trader
              ? "Select trader"
              : available <= 0
                ? "Deposit required"
                : `Copy ${trader.name} with $${amount.toLocaleString()}`}
          </button>

          <p className="mt-4 text-center text-xs text-[#8f96a3]">
            Allocated funds are locked while the copy engine is active.
          </p>
        </div>
      </div>
    </section>
  );
}
