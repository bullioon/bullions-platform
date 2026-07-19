"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { type Trader } from "@/lib/mockTraders";


function strategyProfileHref(traderId: string) {
  const aliases: Record<string, string> = {
    ghost_alpha: "aa07ccd7-bae1-471c-84ab-185d881e9f97",
    "local-manager": "aa07ccd7-bae1-471c-84ab-185d881e9f97",
    managerdos: "aa07ccd7-bae1-471c-84ab-185d881e9f97",
    mia_capital: "strategy_mia_capital",
    ax_prime_KMF63S: "strategy_ax_prime_KMF63S",
    bullions_ai: "strategy_bullions_ai",
    "bullions-bot": "strategy_bullions_ai",
    torion_desk: "strategy_torion_desk",
  };

  return `/s/${aliases[traderId] || `strategy_${traderId}`}`;
}

type Props = {
  traders: Trader[];
  selectedTraderId: string;
  fundTraderIds?: string[];
  currentUserId?: string;
  currentUsername?: string;
  currentEmail?: string;
  onSelectTrader: (id: string) => void;
  onAddToFund?: (id: string) => void;
};

export function TerminalLeaderboard({
  traders,
  selectedTraderId,
  currentUserId,
  currentUsername,
  currentEmail,
  onSelectTrader,
  onAddToFund,
  fundTraderIds = [],
}: Props) {
  const router = useRouter();

  const sorted = useMemo(
    () =>
      [...(traders || [])]
        .filter((trader) => {
          const data = trader as any;

          const mt5Live =
            String(
              data.mt5Status || ""
            ).toLowerCase() === "live";

          const hasActivity =
            Number(data.openTrades || 0) > 0 ||
            Number(data.totalTrades || 0) > 0;

          return mt5Live && hasActivity;
        })
        .sort((a, b) => {
          const roiDifference =
            Number((b as any).roi || 0) -
            Number((a as any).roi || 0);

          if (roiDifference !== 0) {
            return roiDifference;
          }

          return (
            Number((b as any).equity || 0) -
            Number((a as any).equity || 0)
          );
        })
        .slice(0, 6),
    [traders]
  );

  const resolvedSelectedTraderId =
    sorted.some(
      (trader) =>
        trader.id === selectedTraderId
    )
      ? selectedTraderId
      : sorted[0]?.id || "";

  useEffect(() => {
    if (
      sorted.length > 0 &&
      resolvedSelectedTraderId !==
        selectedTraderId
    ) {
      onSelectTrader(
        resolvedSelectedTraderId
      );
    }
  }, [
    sorted,
    selectedTraderId,
    resolvedSelectedTraderId,
    onSelectTrader,
  ]);

  const previewTrader =
    sorted.find(
      (trader) =>
        trader.id ===
        resolvedSelectedTraderId
    ) || null;

  return (
    <section id="leaderboard" className="rounded-[28px] border border-white/8 bg-[#0b0c0d] p-5">
      <div className="mb-5 flex items-center justify-between gap-4">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.34em] text-[#b6ff00]">COPY</p>
          <h2 className="mt-1 text-3xl font-black tracking-tight text-white">Strategy Universe</h2>
          <p className="mt-1 text-sm text-white/35">Allocate capital across verified strategy managers.</p>
        </div>
        <div className="rounded-full border border-white/10 bg-white/[0.035] px-3 py-1 text-xs font-bold text-white/45">Live</div>
      </div>

      <div className="overflow-hidden rounded-[22px] border border-white/8 bg-white/[0.025]">
        <div className="grid grid-cols-[42px_2.4fr_0.75fr_1fr_120px] gap-3 border-b border-white/8 px-4 py-2.5 text-[10px] font-black uppercase tracking-[0.18em] text-white/30">
          <span>#</span>
          <span>Capital Manager</span>
          <span>ROI</span>
          <span>Equity</span>
          <span className="text-right">
            Action
          </span>
        </div>

        {sorted.map((trader, index) => {
          const active =
            resolvedSelectedTraderId ===
            trader.id;
          const anyTrader = trader as any;
          const isBullionsAI =
            trader.id === "bullions_ai" ||
            trader.id === "bullions-bot" ||
            String(trader.name || "").toLowerCase().includes("bullions ai");
          const initialBalance = Number(
            anyTrader.initialBalance || 0
          );

          const accountSize =
            initialBalance >= 150000
              ? "200K"
              : initialBalance > 0
                ? "50K"
                : "MT5";

          const openTrades = Number(
            anyTrader.openTrades || 0
          );

          const totalTrades = Number(
            anyTrader.totalTrades || 0
          );

          const activity =
            openTrades > 0
              ? `${openTrades} open`
              : `${totalTrades} trades`;

          const roi = Number(
            anyTrader.roi || 0
          );

          const equityUsd = Number(
            anyTrader.equity ||
              anyTrader.balance ||
              0
          );
          const inFund = fundTraderIds.includes(trader.id);
          const strategyId = String(anyTrader.strategyId || "");
          const href = strategyId ? `/s/${strategyId}` : strategyProfileHref(trader.id);

          return (
            <div
              key={trader.id}
              onClick={() => onSelectTrader(trader.id)}
              className={
                isBullionsAI
                  ? "relative grid cursor-pointer grid-cols-[42px_2.4fr_0.75fr_1fr_120px] gap-3 overflow-hidden border-b border-[#b6ff00]/25 bg-[radial-gradient(circle_at_20%_30%,rgba(182,255,0,0.18),transparent_18%),radial-gradient(circle_at_80%_60%,rgba(182,255,0,0.10),transparent_22%),rgba(182,255,0,0.055)] px-4 py-2.5 shadow-[inset_0_0_70px_rgba(182,255,0,0.10),0_0_55px_rgba(182,255,0,0.06)] after:pointer-events-none after:absolute after:inset-y-0 after:left-0 after:w-1.5 after:bg-[#b6ff00] last:border-b-0"
                  : active
                    ? "grid grid-cols-[42px_2.4fr_0.75fr_1fr_120px] gap-3 border-b border-white/6 bg-[#b6ff00]/[0.055] px-4 py-2.5 last:border-b-0"
                    : "grid grid-cols-[42px_2.4fr_0.75fr_1fr_120px] gap-3 border-b border-white/6 px-4 py-2.5 transition hover:bg-white/[0.025] last:border-b-0"
              }
            >
              <div className="relative z-10 flex items-center"><span className="text-sm font-semibold text-white/35">{String(index + 1).padStart(2, "0")}</span></div>

              <button
                type="button"
                title={`View ${trader.name} profile`}
                aria-label={`View ${trader.name} profile`}
                onClick={(event) => {
                  event.stopPropagation();
                  onSelectTrader(trader.id);
                  router.push(href);
                }}
                className="group relative z-10 min-w-0 rounded-xl text-left outline-none transition focus-visible:ring-2 focus-visible:ring-[#b6ff00]/40">
                <div className="flex items-center gap-3">
                  <div className="hidden">{trader.avatar || "⚔️"}</div>
                  <div className="min-w-0">
                    <div className="flex min-w-0 items-center gap-2">
                      <p className="min-w-0 truncate text-sm font-black text-white transition group-hover:text-[#b6ff00] group-focus-visible:text-[#b6ff00]">
                        {trader.name}
                      </p>

                      <span className="shrink-0 rounded-full border border-[#b6ff00]/25 bg-[#b6ff00]/10 px-2.5 py-1 text-[7px] font-black uppercase tracking-[0.14em] text-[#b6ff00] transition sm:translate-x-[-4px] sm:opacity-0 sm:group-hover:translate-x-0 sm:group-hover:opacity-100 sm:group-focus-visible:translate-x-0 sm:group-focus-visible:opacity-100">
                        View Profile →
                      </span>
                    </div>

                    <p className="mt-0.5 truncate text-xs text-white/35 transition group-hover:text-white/50">
                      {`${accountSize} · MT5 LIVE · ${activity}`}
                    </p>
                  </div>
                </div>
              </button>

              <div className="relative z-10 flex items-center">
                <p
                  className={
                    roi >= 0
                      ? "text-sm font-black text-[#b6ff00]"
                      : "text-sm font-black text-red-400"
                  }
                >
                  {roi >= 0 ? "+" : ""}
                  {roi.toFixed(1)}%
                </p>
              </div>

              <div className="relative z-10 flex items-center">
                <p className="text-sm font-semibold text-white/75">
                  $
                  {equityUsd.toLocaleString(
                    "en-US",
                    {
                      minimumFractionDigits: 0,
                      maximumFractionDigits: 2,
                    }
                  )}
                </p>
              </div>

              <div className="relative z-10 flex items-center justify-end">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelectTrader(trader.id);

                    if (isBullionsAI) {
                      router.push(href);
                      return;
                    }

                    onAddToFund?.(trader.id);
                  }}
                  className={
                    isBullionsAI
                      ? "rounded-full border border-[#d6ff3f]/25 bg-transparent px-3 py-1 text-[9px] font-black uppercase tracking-[0.12em] text-[#d6ff3f] transition hover:bg-[#d6ff3f] hover:text-black"
                      : inFund
                        ? "rounded-full bg-[#b6ff00] px-3 py-1 text-[9px] font-black uppercase tracking-[0.12em] text-black"
                        : "rounded-full border border-white/10 bg-transparent px-3 py-1 text-[9px] font-black uppercase tracking-[0.12em] text-white/40 transition hover:border-[#b6ff00]/40 hover:text-[#b6ff00]"
                  }
                >
                  {isBullionsAI ? "View Strategy" : inFund ? "Allocated ✓" : "Allocate"}
                </button>
              </div>
            </div>
          );
        })}
      </div>
      
{previewTrader ? (
  <TraderDnaPreview
    trader={previewTrader}
    currentUserId={currentUserId}
    currentUsername={currentUsername}
    currentEmail={currentEmail}
  />
) : (
  <div className="mt-10 rounded-[34px] border border-white/8 bg-[#070807] p-12 text-center">
    <p className="text-xs font-black uppercase tracking-[0.35em] text-[#b6ff00]">
      BULLIONS SEAL
    </p>

    <h2 className="mt-6 text-3xl font-black text-white">
      Select a Strategy
    </h2>

    <p className="mx-auto mt-5 max-w-xl text-white/45">
      Select any trader from the leaderboard to reveal institutional DNA analysis,
      behavioral metrics, risk profile and Bullions verification.
    </p>

    <div className="mt-10 text-sm font-black uppercase tracking-[0.25em] text-[#b6ff00]">
      CLICK A MANAGER ABOVE
    </div>
  </div>
)}

    </section>
  );
}

function TraderDnaPreview({
  trader,
  currentUserId,
  currentUsername,
  currentEmail,
}: {
  trader: Trader;
  currentUserId?: string;
  currentUsername?: string;
  currentEmail?: string;
}) {
  const [bullionsAiRequestStatus, setBullionsAiRequestStatus] = useState<"none" | "pending" | "approved">("none");

  useEffect(() => {
    if (!currentUserId) return;

    const licenseId = `${currentUserId}_bullions_ai`;

    return onSnapshot(doc(db, "bullionsAiAccessRequests", licenseId), (snap) => {
      if (!snap.exists()) {
        setBullionsAiRequestStatus("none");
        return;
      }

      const status = String(snap.data()?.status || "none").trim().toLowerCase();

      setBullionsAiRequestStatus(
        status === "approved" ? "approved" : status === "pending" ? "pending" : "none"
      );
    });
  }, [currentUserId]);

  const anyTrader = trader as any;
  const isBullionsAI =
    trader.id === "bullions_ai" ||
    trader.id === "bullions-bot" ||
    String(trader.name || "").toLowerCase().includes("bullions ai");

  if (isBullionsAI) {
    const weeks = anyTrader.weeklyTrackRecord || [
      ["W28", "+8.41%"],
      ["W27", "+6.02%"],
      ["W26", "+9.14%"],
      ["W25", "+4.83%"],
    ];

    const roi = Number(trader.roi || 0);
    const maxDrawdown = Number(anyTrader.maxDrawdown || 0);
    const winRate = Number(anyTrader.winRate || 0);
    const profitFactor = Number(anyTrader.profitFactor || 0);

    const proofMetrics = [
      ["ROI", `${roi.toFixed(1)}%`],
      ["Max DD", `${maxDrawdown.toFixed(1)}%`],
      ["Win Rate", `${winRate.toFixed(0)}%`],
      ["Profit Factor", profitFactor ? profitFactor.toFixed(2) : "--"],
    ] as const;

    return (
      <div className="mt-5 rounded-[28px] border border-white/10 bg-[#090a09] p-6">
        <div className="flex flex-wrap items-start justify-between gap-5">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.34em] text-[#b6ff00]">
              Institutional Strategy
            </p>

            <h3 className="mt-3 text-4xl font-black tracking-[-0.04em] text-white">
              Bullions AI
            </h3>

            <p className="mt-3 text-sm text-white/40">
              Institutional Gold Strategy · Verified MT5 · Current week hidden
            </p>
          </div>

          <div className="rounded-2xl border border-[#b6ff00]/20 bg-[#b6ff00]/10 px-5 py-4 text-right">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#b6ff00]">
              Access
            </p>
            <p className="mt-1 text-2xl font-black text-white">$3,000</p>
          </div>
        </div>

        <div className="mt-6 rounded-full border border-white/10 bg-white/[0.035] px-4 py-2.5">
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-[#b6ff00]" />
              <span className="font-black uppercase tracking-[0.18em] text-[#b6ff00]">MT5 Verified</span>
            </div>

            {proofMetrics.map(([label, value]) => (
              <div key={label} className="flex items-center gap-2">
                <span className="text-white/35">{label}</span>
                <span className={label === "ROI" ? "font-black text-[#b6ff00]" : "font-black text-white"}>
                  {value}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-6 border-t border-white/8 pt-5">
          <div className="flex items-center justify-between gap-4">
            <p className="text-[10px] font-black uppercase tracking-[0.25em] text-white/30">
              Last closed weeks
            </p>
            <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#b6ff00]">
              MT5 Verified
            </p>
          </div>

          <div className="mt-4 grid gap-3 sm:grid-cols-4">
            {weeks.map(([week, roi]: any) => (
              <div key={week} className="rounded-2xl border border-white/8 bg-black/20 p-4">
                <p className="text-[10px] font-black uppercase tracking-[0.18em] text-white/30">
                  {week}
                </p>
                <p className="mt-2 text-2xl font-black text-[#b6ff00]">{roi}</p>
                <p className="mt-1 text-xs font-semibold text-white/35">Closed ✓</p>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-5 rounded-[22px] border border-white/8 bg-white/[0.025] p-5">
          <div className="flex flex-wrap items-center justify-between gap-5">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.24em] text-white/30">
                Institutional License
              </p>
              <h4 className="mt-2 text-xl font-black text-white">
                {bullionsAiRequestStatus === "approved"
                  ? "License active"
                  : bullionsAiRequestStatus === "pending"
                    ? "Request under review"
                    : "Copy the verified strategy"}
              </h4>
              <p className="mt-1 max-w-xl text-sm leading-6 text-white/40">
                {bullionsAiRequestStatus === "approved"
                  ? "Your Institutional License is active. Copy execution and live strategy access are now enabled."
                  : bullionsAiRequestStatus === "pending"
                    ? "Your access request is pending review. We will validate your account before activating the license."
                    : "Unlock live copy execution, live MT5 performance, strategy updates and institutional allocation."}
              </p>
            </div>

            <button
              onClick={async () => {
                if (bullionsAiRequestStatus === "approved") {
                  alert("Bullions AI Copy Engine unlocked. Next step: allocation setup.");
                  return;
                }

                const res = await fetch("/api/bullions-ai/access-request", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({
                    userId: currentUserId,
                    username: currentUsername,
                    email: currentEmail,
                  }),
                });

                const json = await res.json();

                if (json.ok) {
                  setBullionsAiRequestStatus("pending");
                  alert("Bullions AI access request submitted.");
                } else {
                  alert(json.error || "Access request failed.");
                }
              }}
              disabled={bullionsAiRequestStatus === "pending"}
              className={
                bullionsAiRequestStatus === "approved"
                  ? "h-12 rounded-2xl border border-[#b6ff00]/25 bg-[#b6ff00]/10 px-6 text-xs font-black uppercase tracking-[0.18em] text-[#b6ff00] transition hover:bg-[#b6ff00] hover:text-black"
                  : bullionsAiRequestStatus === "pending"
                    ? "h-12 cursor-not-allowed rounded-2xl border border-[#ffd23f]/25 bg-[#ffd23f]/10 px-6 text-xs font-black uppercase tracking-[0.18em] text-[#ffd23f]"
                    : "h-12 rounded-2xl border border-[#b6ff00]/25 bg-[#b6ff00]/10 px-6 text-xs font-black uppercase tracking-[0.18em] text-[#b6ff00] transition hover:bg-[#b6ff00] hover:text-black"
              }
            >
              {bullionsAiRequestStatus === "approved"
                ? "Start Copy →"
                : bullionsAiRequestStatus === "pending"
                  ? "Request Pending"
                  : "Unlock →"}
            </button>
          </div>
        </div>
      </div>
    );
  }

  const mt5 = anyTrader.mt5 || {};

  const roi = Number(
    trader.roi || 0
  );

  const equity = Number(
    anyTrader.equity ||
      mt5.equity ||
      0
  );

  const balance = Number(
    anyTrader.balance ||
      mt5.balance ||
      0
  );

  const floatingPnlUsd =
    equity - balance;

  const openTrades = Number(
    anyTrader.openTrades ||
      mt5.openTrades ||
      0
  );

  const totalTrades = Number(
    anyTrader.totalTrades ||
      mt5.totalTrades ||
      0
  );

  const maxDrawdown = Number(
    anyTrader.maxDrawdown ||
      mt5.maxDrawdown ||
      0
  );

  const winRate = Number(
    anyTrader.winRate ||
      mt5.winRate ||
      0
  );

  const profitFactor = Number(
    anyTrader.profitFactor ||
      mt5.profitFactor ||
      0
  );

  const score = Number(
    anyTrader.bullionsScore ||
      trader.topTrade ||
      0
  );

  const lastSyncedAt = Number(
    anyTrader.lastSyncedAt ||
      mt5.lastSyncAt ||
      mt5.lastSyncedAt ||
      0
  );

  const lastSyncLabel = (() => {
    if (!lastSyncedAt) {
      return "Pending";
    }

    const ageSeconds = Math.max(
      0,
      Math.floor(
        (Date.now() - lastSyncedAt) /
          1000
      )
    );

    if (ageSeconds < 10) {
      return "Now";
    }

    if (ageSeconds < 60) {
      return `${ageSeconds}s ago`;
    }

    const minutes = Math.floor(
      ageSeconds / 60
    );

    if (minutes < 60) {
      return `${minutes}m ago`;
    }

    return `${Math.floor(
      minutes / 60
    )}h ago`;
  })();

  const money = (value: number) =>
    `$${Math.abs(value).toLocaleString(
      "en-US",
      {
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
      }
    )}`;

  const signedMoney = (
    value: number
  ) =>
    `${value >= 0 ? "+" : "-"}${money(
      value
    )}`;

  const metrics = [
    [
      "ROI",
      `${roi >= 0 ? "+" : ""}${roi.toFixed(
        1
      )}%`,
      "Live strategy return",
    ],
    [
      "Equity",
      money(equity),
      "Live MT5 account value",
    ],
    [
      "Floating PnL",
      signedMoney(floatingPnlUsd),
      "Profit from open positions",
    ],
    [
      "Balance",
      money(balance),
      "Closed MT5 account balance",
    ],
    [
      "Open Positions",
      String(openTrades),
      "Current live exposure",
    ],
    [
      "Last Sync",
      lastSyncLabel,
      "MT5 bridge freshness",
    ],
  ] as const;

  return (
    <div className="mt-5 rounded-[28px] border border-white/10 bg-[#090a09] p-6">
      <div className="flex flex-wrap items-start justify-between gap-5">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.34em] text-[#b6ff00]">
            Verified MT5 Metrics
          </p>

          <h3 className="mt-3 text-3xl font-black tracking-[-0.04em] text-white">
            {trader.name}
          </h3>

          <p className="mt-2 text-sm text-white/40">
            {anyTrader.specialty || trader.tag || "Verified Manager"} · {anyTrader.pair || "Multi-asset"}
          </p>
        </div>

        <div className="rounded-2xl border border-[#b6ff00]/15 bg-[#b6ff00]/10 px-5 py-4 text-right">
          <p className="text-[10px] font-black uppercase tracking-[0.22em] text-[#b6ff00]">
            Live Equity
          </p>

          <p className="mt-1 text-3xl font-black text-white">
            {money(equity)}
          </p>

          <p className="mt-1 text-[10px] font-bold uppercase tracking-[0.14em] text-white/35">
            MT5 Live
          </p>
        </div>
      </div>

      <div className="mt-6 flex flex-wrap gap-2 rounded-[26px] border border-white/10 bg-white/[0.025] p-3">
        {metrics.map(([label, value, hint]) => {
          const pill =
            label === "ROI" ||
            label === "Equity"
              ? "border-[#b6ff00]/20 bg-[#b6ff00]/10 text-[#b6ff00]"
              : label === "Floating PnL"
                ? floatingPnlUsd >= 0
                  ? "border-[#b6ff00]/20 bg-[#b6ff00]/10 text-[#b6ff00]"
                  : "border-red-400/20 bg-red-400/10 text-red-400"
                : "border-white/8 bg-white/[0.035] text-white";

          return (
            <div
              key={label}
              className={`rounded-full border px-4 py-2 ${pill}`}
              title={hint}
            >
              <span className="text-[10px] font-black uppercase tracking-[0.16em] opacity-55">
                {label}
              </span>
              <span className="ml-2 text-sm font-black">{value}</span>
            </div>
          );
        })}
      </div>

      <div className="mt-5 rounded-[22px] border border-white/8 bg-white/[0.025] p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-[10px] font-black uppercase tracking-[0.24em] text-white/30">
            Data maturity
          </p>

          <span className="rounded-full border border-[#ffd23f]/20 bg-[#ffd23f]/10 px-3 py-1 text-[9px] font-black uppercase tracking-[0.14em] text-[#ffd23f]">
            {totalTrades >= 10
              ? `Score ${score.toFixed(0)}`
              : "Bullions Score Provisional"}
          </span>
        </div>

        <div className="mt-4 grid gap-4 sm:grid-cols-4">
          <div>
            <p className="text-sm font-black text-white">
              Closed Trades
            </p>
            <p className="mt-1 text-sm text-white/40">
              {totalTrades}
            </p>
          </div>

          <div>
            <p className="text-sm font-black text-white">
              Win Rate
            </p>
            <p className="mt-1 text-sm text-white/40">
              {totalTrades > 0
                ? `${winRate.toFixed(0)}%`
                : "Collecting data"}
            </p>
          </div>

          <div>
            <p className="text-sm font-black text-white">
              Profit Factor
            </p>
            <p className="mt-1 text-sm text-white/40">
              {totalTrades > 1 &&
              profitFactor > 0
                ? profitFactor.toFixed(2)
                : "Collecting data"}
            </p>
          </div>

          <div>
            <p className="text-sm font-black text-white">
              Max Drawdown
            </p>
            <p className="mt-1 text-sm text-white/40">
              {maxDrawdown > 0
                ? `${maxDrawdown.toFixed(1)}%`
                : "Collecting data"}
            </p>
          </div>
        </div>

        <p className="mt-4 text-xs leading-5 text-white/25">
          Win rate, profit factor, drawdown and Bullions Score become reliable after sufficient closed-trade history.
        </p>
      </div>
    </div>
  );
}

function Skill({ icon, label, value }: { icon: string; label: string; value: number }) {
  const safe = Math.max(0, Math.min(100, value));
  return (
    <div>
      <div className="mb-1 flex items-center justify-between">
        <p className="text-xs font-bold text-white/65"><span className="mr-2">{icon}</span>{label}</p>
        <p className="text-xs font-black text-[#b6ff00]">{safe}/100</p>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-white/10"><div className="h-full rounded-full bg-[#b6ff00]" style={{ width: `${safe}%` }} /></div>
    </div>
  );
}

function Seal({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-black/20 p-3 ring-1 ring-white/8">
      <p className="text-[9px] font-black uppercase tracking-[0.18em] text-white/35">{label}</p>
      <p className="mt-1 text-sm font-black text-white">{value}</p>
    </div>
  );
}
