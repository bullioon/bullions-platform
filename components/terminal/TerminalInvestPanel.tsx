"use client";

import { useEffect, useMemo, useState } from "react";
import { type Trader } from "@/lib/mockTraders";

type Props = {
  trader?: Trader;
  totalInvested: number;
  estimatedProfit: number;
  allocatedUsd?: number;
  isActive?: boolean;
  onInvest: (amount: number, traderOverride?: Trader) => void;
};

const PRESETS = [100, 250, 500];

export function TerminalInvestPanel({
  trader,
  totalInvested,
  estimatedProfit,
  allocatedUsd = 0,
  isActive = false,
  onInvest,
}: Props) {
  const available = Math.max(0, totalInvested);
  const hasAllocation = allocatedUsd > 0;
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
    return Math.min(
      96,
      Math.max(60, Math.round(trader.roi + trader.topTrade - trader.maxLoss))
    );
  }, [trader]);

  const canDeploy = Boolean(trader) && amount > 0 && amount <= available && !isActive;

  function updateAmount(value: number) {
    const clean = Math.max(0, Math.min(value || 0, available));
    setAmount(clean);
  }

  const statusMessage =
    isActive && hasAllocation
      ? "Your fund is already active in the Fund Engine."
      : available <= 0
        ? "Deposit with Phantom first to deploy your fund."
        : "Choose an amount to deploy your fund.";

  const buttonLabel = !trader
    ? "Build fund"
    : isActive && hasAllocation
      ? `Fund Engine active with $${allocatedUsd.toLocaleString()}`
      : available <= 0
        ? "Deposit required"
        : `Deploy ${trader.name} with $${amount.toLocaleString()}`;

  return (
    <section
      id="copy"
      className="w-full max-w-full min-w-0 overflow-hidden rounded-[24px] bg-[#111214] p-5 shadow-[0_0_0_1px_rgba(255,255,255,0.04)] sm:p-8"
    >
      <div className="flex items-start justify-between gap-5">
        <div>
          <p className="text-sm text-[#8f96a3]">Bullions Terminal</p>
          <h2 className="mt-1 text-3xl font-semibold tracking-tight text-white">
            Fund setup
          </h2>
          <p className="mt-2 text-sm text-[#8f96a3]">
            Deploy capital through your tier-based fund protocol.
          </p>
        </div>

        <span className="rounded-full bg-white/[0.06] px-3 py-1 text-xs font-medium text-white/50">
          {score}% score
        </span>
      </div>

      <div className="mt-8 grid min-w-0 grid-cols-1 gap-6 lg:grid-cols-[0.9fr_1.1fr]">
        <div>
          <p className="text-xs text-[#8f96a3]">Selected fund</p>
          <h3 className="mt-1 text-2xl font-semibold text-white">
            {trader?.name || "None"}
          </h3>

          <div className="mt-6 space-y-3">
            {[
              ["Pair", trader?.pair || "TRADITIONAL"],
              ["Allocation room", `$${available.toLocaleString()}`],
              ["Allocated", `$${allocatedUsd.toLocaleString()}`],
              ["Profit", `+$${Math.max(0, estimatedProfit).toLocaleString()}`],
            ].map(([label, value]) => (
              <div
                key={label}
                className="grid min-w-0 grid-cols-[1fr_auto] items-center gap-4 border-b border-white/5 pb-3 last:border-0"
              >
                <span className="text-sm text-[#8f96a3]">{label}</span>
                <span className="max-w-[150px] truncate text-right text-sm font-medium text-white sm:max-w-none">
                  {value}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between">
            <p className="text-xs text-[#8f96a3]">Allocation</p>
            <button
              onClick={() => updateAmount(available)}
              disabled={available <= 0 || isActive}
              className="rounded-full bg-white/[0.06] px-3 py-1 text-xs font-semibold text-[#b6ff00] transition hover:bg-white/[0.1] disabled:cursor-not-allowed disabled:opacity-30"
            >
              Max
            </button>
          </div>

          <div className="mt-3 w-full min-w-0 rounded-[22px] bg-black/25 px-5 py-4 ring-1 ring-white/10">
            <div className="flex items-center gap-2">
              <span className="text-3xl font-semibold text-white/40">$</span>
              <input
                type="number"
                value={amount || ""}
                onChange={(e) => updateAmount(Number(e.target.value))}
                placeholder="0"
                disabled={isActive}
                className="min-w-0 flex-1 bg-transparent text-3xl font-semibold text-white outline-none placeholder:text-white/20 disabled:text-white/25"
              />
            </div>
            <p className="mt-2 text-xs text-white/35">
              Protected capital: ${available.toLocaleString()}
            </p>
          </div>

          <div className="mt-3 grid w-full min-w-0 grid-cols-3 gap-2">
            {PRESETS.map((value) => {
              const disabled = value > available || isActive;

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

          <p className="mt-3 text-xs text-white/35">{statusMessage}</p>

          <button
            onClick={() => trader && canDeploy && onInvest(amount, trader)}
            disabled={!canDeploy}
            className="mt-5 h-[56px] w-full max-w-full overflow-hidden truncate rounded-full bg-[#b6ff00] px-4 text-sm font-semibold text-black transition hover:opacity-90 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40"
          >
            {buttonLabel}
          </button>

          <p className="mt-4 text-center text-xs text-[#8f96a3]">
            Capital becomes locked only after the Deploy Engine is activated.
          </p>
        </div>
      </div>
    </section>
  );
}
