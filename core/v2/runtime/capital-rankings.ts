import { getAdminDb } from "@/lib/firebaseAdmin";
import { RuntimeRepository } from "@/core/v2/runtime/RuntimeRepository";
import type { StrategyRuntime } from "@/core/v2/runtime/types";

export type CapitalRanking = {
  id: string;
  traderHref: string;
  strategyHref: string;
  name: string;
  handle: string;
  profit: string;
  accountSize: "50K" | "200K";
  market: string;
  engine: "MT5" | "AI";
  openTrades: number;
  winRate: string;
  drawdown: string;
  profitFactor: string;
  synced: string;
  mt5Status: "live" | "stale" | "offline" | "pending";
};

function money(n: number) {
  return `${n >= 0 ? "+" : "-"}$${Math.abs(n).toLocaleString("en-US", {
    maximumFractionDigits: 0,
  })}`;
}

function accountSize(balance: number): "50K" | "200K" {
  return balance >= 150000 ? "200K" : "50K";
}

function toRanking(runtime: StrategyRuntime): CapitalRanking {
  const profit = runtime.performance.equity - runtime.performance.initialBalance;

  return {
    id: runtime.strategyId,
    traderHref: `/trader-profile?id=${runtime.managerUid ?? runtime.strategyId}`,
    strategyHref: `/strategy-profile?id=${runtime.strategyId}`,
    name: runtime.name,
    handle: `@${runtime.name.toLowerCase().replace(/[^a-z0-9]+/g, "")}`,
    profit: money(profit),
    accountSize: accountSize(runtime.performance.initialBalance),
    market: runtime.subtitle || "XAU/USD",
    engine: "MT5",
    openTrades: runtime.performance.openTrades,
    winRate: `${runtime.performance.winRate.toFixed(0)}%`,
    drawdown: `${runtime.performance.maxDrawdown.toFixed(1)}%`,
    profitFactor: runtime.performance.profitFactor.toFixed(2),
    synced:
      runtime.mt5.status === "live"
        ? "live"
        : runtime.mt5.status === "stale"
          ? "stale"
          : runtime.mt5.status === "offline"
            ? "offline"
            : "pending",
    mt5Status: runtime.mt5.status,
  };
}

export async function getCapitalRankings(): Promise<CapitalRanking[]> {
  const db = getAdminDb();

  const snap = await db
    .collection("managerStrategies")
    .limit(24)
    .get();

  const runtimes = (
    await Promise.all(
      snap.docs.map((doc) => RuntimeRepository.getStrategyRuntime(doc.id))
    )
  ).filter(Boolean) as StrategyRuntime[];

  return runtimes
    .filter((runtime) => {
      const hasSync = Boolean(runtime.performance.lastSyncedAt);
      const hasTrades = runtime.performance.totalTrades > 0 || runtime.performance.openTrades > 0;
      const hasMovement = Math.abs(runtime.performance.equity - runtime.performance.initialBalance) > 1;

      return hasSync || hasTrades || hasMovement;
    })
    .sort((a, b) => b.performance.roi - a.performance.roi)
    .slice(0, 6)
    .map(toRanking);
}
