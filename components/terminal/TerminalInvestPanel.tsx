"use client";

import { useEffect, useMemo, useState } from "react";
import { type Trader } from "@/lib/mockTraders";

type Props = {
  trader?: Trader;
  fundManagers?: Trader[];
  allocationMix?: number[];
  totalInvested: number;
  estimatedProfit: number;
  allocatedUsd?: number;
  isActive?: boolean;
  onInvest: (amount: number, traderOverride?: Trader) => void;
};

const PRESETS = [100, 250, 500];

export function TerminalInvestPanel({
  trader,
  fundManagers = [],
  allocationMix = [],
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

  const managers = useMemo(() => {
    if (fundManagers.length) return fundManagers;
    if (trader) return [trader];
    return [];
  }, [fundManagers, trader]);

  const score = useMemo(() => {
    if (!managers.length) return 0;

    const rawScore =
      managers.reduce((sum, manager) => {
        return (
          sum +
          Number(manager.roi || 0) +
          Number(manager.topTrade || 0) -
          Number(manager.maxLoss || 0)
        );
      }, 0) / managers.length;

    return Math.min(96, Math.max(60, Math.round(rawScore)));
  }, [managers]);

  const averageRoi = useMemo(() => {
    if (!managers.length) return 0;

    return (
      managers.reduce(
        (sum, manager) => sum + Number(manager.roi || 0),
        0
      ) / managers.length
    );
  }, [managers]);

  const averageDrawdown = useMemo(() => {
    if (!managers.length) return 0;

    return (
      managers.reduce(
        (sum, manager) => sum + Number(manager.maxLoss || 0),
        0
      ) / managers.length
    );
  }, [managers]);

  const isMultiManager = managers.length > 1;

  const selectedName = isMultiManager
    ? `${managers.length}-Manager Fund`
    : trader?.name || managers[0]?.name || "No fund selected";

  const selectedPair = isMultiManager
    ? "Multi-Asset"
    : trader?.pair || managers[0]?.pair || "—";

  const selectedMix = managers
    .map((_, index) => `${allocationMix[index] ?? (managers.length === 1 ? 100 : 0)}%`)
    .join(" / ");

  const riskLabel =
    managers.length === 0
      ? "—"
      : averageDrawdown <= 3
        ? "Controlled"
        : averageDrawdown <= 6
          ? "Balanced"
          : "Aggressive";

  const canDeploy =
    managers.length > 0 &&
    amount > 0 &&
    amount <= available &&
    !isActive;

  function updateAmount(value: number) {
    const clean = Math.max(0, Math.min(value || 0, available));
    setAmount(clean);
  }

  const buttonLabel =
    managers.length === 0
      ? "Select a Manager"
      : isActive && hasAllocation
        ? "Fund Active"
        : available <= 0
          ? "Deposit Required"
          : `Deploy $${amount.toLocaleString()}`;

  return (
    <section
      id="copy"
      className="relative min-w-0 overflow-hidden rounded-[30px] border border-white/10 bg-[#080909] shadow-[0_35px_120px_rgba(0,0,0,0.35)]"
    >
      <div className="pointer-events-none absolute right-0 top-0 h-72 w-72 rounded-full bg-[#b6ff00]/[0.035] blur-[90px]" />

      <div className="relative border-b border-white/10 px-5 py-5 sm:px-7">
        <div className="flex flex-wrap items-start justify-between gap-5">
          <div>
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-[#b6ff00]" />

              <p className="text-[9px] font-black uppercase tracking-[0.3em] text-[#b6ff00]">
                BullPad Deployment
              </p>
            </div>

            <h2 className="mt-3 text-3xl font-black tracking-[-0.055em] text-white">
              Deploy capital.
            </h2>

            <p className="mt-2 max-w-[540px] text-sm leading-6 text-white/40">
              Review your fund composition, choose capital and activate the
              Bullions Fund Engine.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <StatusPill
              label={isActive && hasAllocation ? "Fund Active" : "Ready"}
              active={isActive && hasAllocation}
            />

            <div className="rounded-full border border-white/10 bg-white/[0.03] px-4 py-2">
              <span className="text-[9px] font-black uppercase tracking-[0.18em] text-white/30">
                Score{" "}
              </span>

              <span className="text-[10px] font-black text-white">
                {score || "--"}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="relative grid gap-5 p-5 sm:p-7 xl:grid-cols-[0.9fr_1.1fr]">
        <div className="min-w-0">
          <div className="rounded-[24px] border border-white/[0.08] bg-white/[0.025] p-5">
            <p className="text-[8px] font-black uppercase tracking-[0.24em] text-white/25">
              Selected Fund
            </p>

            <div className="mt-3 flex flex-wrap items-end justify-between gap-4">
              <div className="min-w-0">
                <h3 className="truncate text-2xl font-black tracking-[-0.045em] text-white">
                  {selectedName}
                </h3>

                <p className="mt-1 text-xs font-semibold text-white/30">
                  {selectedPair}
                </p>
              </div>

              <span
                className={[
                  "rounded-full border px-3 py-1.5 text-[8px] font-black uppercase tracking-[0.15em]",
                  managers.length
                    ? "border-[#b6ff00]/20 bg-[#b6ff00]/10 text-[#b6ff00]"
                    : "border-white/10 bg-white/[0.03] text-white/30",
                ].join(" ")}
              >
                {managers.length
                  ? `${managers.length} Manager${managers.length === 1 ? "" : "s"}`
                  : "Not Built"}
              </span>
            </div>

            <div className="mt-6 space-y-3">
              {managers.length ? (
                managers.map((manager, index) => {
                  const allocation =
                    allocationMix[index] ??
                    (managers.length === 1 ? 100 : 0);

                  return (
                    <ManagerAllocation
                      key={manager.id}
                      manager={manager}
                      allocation={allocation}
                    />
                  );
                })
              ) : (
                <div className="rounded-[20px] border border-dashed border-white/10 bg-black/20 p-5 text-center">
                  <p className="text-sm font-black text-white/55">
                    No managers selected
                  </p>

                  <p className="mt-1 text-xs leading-5 text-white/25">
                    Add a manager from the rankings to build your fund.
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className="mt-3 grid grid-cols-2 gap-3">
            <MiniMetric
              label="Expected ROI"
              value={
                managers.length
                  ? `${averageRoi >= 0 ? "+" : ""}${averageRoi.toFixed(1)}%`
                  : "--"
              }
              positive={averageRoi >= 0 && managers.length > 0}
            />

            <MiniMetric
              label="Risk Profile"
              value={riskLabel}
            />

            <MiniMetric
              label="Available"
              value={`$${available.toLocaleString()}`}
            />

            <MiniMetric
              label="Fund PnL"
              value={`${estimatedProfit >= 0 ? "+" : "−"}$${Math.abs(
                estimatedProfit
              ).toLocaleString()}`}
              positive={estimatedProfit >= 0 && estimatedProfit !== 0}
            />
          </div>
        </div>

        <div className="min-w-0">
          {isActive && hasAllocation ? (
            <ActiveFundPanel
              managers={managers}
              allocationMix={allocationMix}
              allocatedUsd={allocatedUsd}
              estimatedProfit={estimatedProfit}
              selectedMix={selectedMix}
            />
          ) : (
            <div className="h-full rounded-[26px] border border-white/[0.08] bg-black/25 p-5 sm:p-6">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-[8px] font-black uppercase tracking-[0.24em] text-white/25">
                    Capital Allocation
                  </p>

                  <p className="mt-2 text-sm font-semibold text-white/50">
                    Choose how much capital to deploy.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => updateAmount(available)}
                  disabled={available <= 0}
                  className="rounded-full border border-[#b6ff00]/20 bg-[#b6ff00]/10 px-4 py-2 text-[9px] font-black uppercase tracking-[0.15em] text-[#b6ff00] transition hover:bg-[#b6ff00]/20 disabled:cursor-not-allowed disabled:opacity-30"
                >
                  Use Max
                </button>
              </div>

              <div className="mt-6 rounded-[22px] border border-white/10 bg-[#050606] px-5 py-5">
                <p className="text-[8px] font-black uppercase tracking-[0.22em] text-white/25">
                  Deploy Amount
                </p>

                <div className="mt-3 flex min-w-0 items-center gap-2">
                  <span className="text-4xl font-black text-white/25">$</span>

                  <input
                    type="number"
                    value={amount || ""}
                    onChange={(event) =>
                      updateAmount(Number(event.target.value))
                    }
                    placeholder="0"
                    className="min-w-0 flex-1 bg-transparent text-4xl font-black tracking-[-0.055em] text-white outline-none placeholder:text-white/15"
                  />
                </div>

                <div className="mt-4 flex items-center justify-between gap-4 border-t border-white/[0.07] pt-4">
                  <span className="text-xs text-white/30">
                    Available capital
                  </span>

                  <span className="text-sm font-black text-white">
                    ${available.toLocaleString()}
                  </span>
                </div>
              </div>

              <div className="mt-3 grid grid-cols-3 gap-2">
                {PRESETS.map((value) => {
                  const disabled = value > available;
                  const selected = amount === value;

                  return (
                    <button
                      key={value}
                      type="button"
                      onClick={() => updateAmount(value)}
                      disabled={disabled}
                      className={[
                        "h-12 rounded-full text-xs font-black transition",
                        disabled
                          ? "cursor-not-allowed border border-white/[0.05] bg-white/[0.02] text-white/15"
                          : selected
                            ? "bg-white text-black"
                            : "border border-white/10 bg-white/[0.04] text-white/55 hover:bg-white/[0.08] hover:text-white",
                      ].join(" ")}
                    >
                      ${value}
                    </button>
                  );
                })}
              </div>

              <div className="mt-5 rounded-[18px] border border-white/[0.07] bg-white/[0.025] p-4">
                <div className="flex items-center justify-between gap-4">
                  <span className="text-xs text-white/30">
                    Allocation mix
                  </span>

                  <span className="text-xs font-black text-white/65">
                    {managers.length ? selectedMix : "—"}
                  </span>
                </div>

                <div className="mt-3 flex h-2 overflow-hidden rounded-full bg-white/[0.06]">
                  {managers.map((manager, index) => {
                    const allocation =
                      allocationMix[index] ??
                      (managers.length === 1 ? 100 : 0);

                    return (
                      <div
                        key={manager.id}
                        className="h-full border-r border-black/30 bg-[#b6ff00] last:border-r-0"
                        style={{ width: `${allocation}%` }}
                      />
                    );
                  })}
                </div>
              </div>

              <button
                type="button"
                onClick={() => canDeploy && onInvest(amount, trader)}
                disabled={!canDeploy}
                className="mt-5 flex min-h-14 w-full items-center justify-center rounded-full bg-[#b6ff00] px-5 text-[11px] font-black uppercase tracking-[0.16em] text-black transition hover:scale-[1.01] hover:bg-white disabled:cursor-not-allowed disabled:opacity-35 disabled:hover:scale-100"
              >
                {buttonLabel}
              </button>

              <p className="mt-4 text-center text-[10px] leading-5 text-white/25">
                Capital follows verified strategy performance. Fund value can
                rise or fall.
              </p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

function ManagerAllocation({
  manager,
  allocation,
}: {
  manager: Trader;
  allocation: number;
}) {
  return (
    <div className="rounded-[18px] border border-white/[0.07] bg-black/20 p-4">
      <div className="flex items-center justify-between gap-4">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/[0.05] text-[10px] font-black text-white">
            {manager.avatar || manager.name.slice(0, 2).toUpperCase()}
          </div>

          <div className="min-w-0">
            <p className="truncate text-sm font-black text-white">
              {manager.name}
            </p>

            <p className="mt-0.5 truncate text-[10px] font-semibold text-white/25">
              {manager.pair || manager.tag || "Verified Strategy"}
            </p>
          </div>
        </div>

        <span className="shrink-0 text-lg font-black text-[#b6ff00]">
          {allocation}%
        </span>
      </div>

      <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/[0.06]">
        <div
          className="h-full rounded-full bg-[#b6ff00]"
          style={{ width: `${allocation}%` }}
        />
      </div>
    </div>
  );
}

function ActiveFundPanel({
  managers,
  allocationMix,
  allocatedUsd,
  estimatedProfit,
  selectedMix,
}: {
  managers: Trader[];
  allocationMix: number[];
  allocatedUsd: number;
  estimatedProfit: number;
  selectedMix: string;
}) {
  return (
    <div className="relative h-full overflow-hidden rounded-[26px] border border-[#b6ff00]/15 bg-[#b6ff00]/[0.035] p-5 sm:p-6">
      <div className="pointer-events-none absolute right-0 top-0 h-44 w-44 rounded-full bg-[#b6ff00]/10 blur-[70px]" />

      <div className="relative">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-[8px] font-black uppercase tracking-[0.26em] text-[#b6ff00]">
              Live Fund
            </p>

            <h3 className="mt-2 text-2xl font-black tracking-[-0.045em] text-white">
              Capital deployed.
            </h3>
          </div>

          <span className="inline-flex items-center gap-2 rounded-full border border-[#b6ff00]/20 bg-[#b6ff00]/10 px-3 py-2 text-[8px] font-black uppercase tracking-[0.16em] text-[#b6ff00]">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#b6ff00]" />
            Active
          </span>
        </div>

        <div className="mt-8">
          <p className="text-[9px] font-black uppercase tracking-[0.2em] text-white/25">
            Current Equity
          </p>

          <p className="mt-2 text-5xl font-black tracking-[-0.065em] text-white">
            ${allocatedUsd.toLocaleString()}
          </p>

          <p
            className={[
              "mt-2 text-sm font-black",
              estimatedProfit >= 0 ? "text-[#b6ff00]" : "text-red-300",
            ].join(" ")}
          >
            {estimatedProfit >= 0 ? "+" : "−"}$
            {Math.abs(estimatedProfit).toLocaleString()} Fund PnL
          </p>
        </div>

        <div className="mt-7 grid grid-cols-2 gap-3">
          <MiniMetric
            label="Managers"
            value={String(managers.length || 1)}
          />

          <MiniMetric
            label="Allocation"
            value={selectedMix || "100%"}
          />
        </div>

        <div className="mt-6 border-t border-white/10 pt-5">
          <p className="text-[8px] font-black uppercase tracking-[0.22em] text-white/25">
            Active Composition
          </p>

          <div className="mt-4 space-y-3">
            {managers.map((manager, index) => (
              <div
                key={manager.id}
                className="flex items-center justify-between gap-4"
              >
                <span className="min-w-0 truncate text-sm font-semibold text-white/55">
                  {manager.name}
                </span>

                <span className="shrink-0 text-sm font-black text-white">
                  {allocationMix[index] ??
                    (managers.length === 1 ? 100 : 0)}
                  %
                </span>
              </div>
            ))}
          </div>
        </div>

        <p className="mt-6 text-xs leading-5 text-white/30">
          Changes to your selected managers automatically rebalance active
          capital through the Bullions Fund Engine.
        </p>
      </div>
    </div>
  );
}

function MiniMetric({
  label,
  value,
  positive = false,
}: {
  label: string;
  value: string;
  positive?: boolean;
}) {
  return (
    <div className="rounded-[18px] border border-white/[0.07] bg-black/20 p-4">
      <p className="text-[8px] font-black uppercase tracking-[0.2em] text-white/25">
        {label}
      </p>

      <p
        className={[
          "mt-2 truncate text-base font-black",
          positive ? "text-[#b6ff00]" : "text-white",
        ].join(" ")}
      >
        {value}
      </p>
    </div>
  );
}

function StatusPill({
  label,
  active,
}: {
  label: string;
  active: boolean;
}) {
  return (
    <span
      className={[
        "inline-flex items-center gap-2 rounded-full border px-4 py-2 text-[9px] font-black uppercase tracking-[0.16em]",
        active
          ? "border-[#b6ff00]/20 bg-[#b6ff00]/10 text-[#b6ff00]"
          : "border-white/10 bg-white/[0.03] text-white/40",
      ].join(" ")}
    >
      <span
        className={[
          "h-1.5 w-1.5 rounded-full",
          active ? "animate-pulse bg-[#b6ff00]" : "bg-white/25",
        ].join(" ")}
      />

      {label}
    </span>
  );
}
