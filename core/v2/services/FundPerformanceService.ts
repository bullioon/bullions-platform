import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  setDoc,
  updateDoc,
  where,
} from "firebase/firestore";

import { db } from "@/lib/firebase";
import { PerformanceRepository } from "@/core/v2/repositories/PerformanceRepository";


type StrategyPerformance = {
  initialBalanceUsd: number;
  balanceUsd: number;
  equityUsd: number;
  strategyRoiPct: number;
};

async function performanceFromRuntime(
  strategyId: string
): Promise<StrategyPerformance | null> {
  const runtimeSnap = await getDoc(
    doc(db, "strategyRuntimes", strategyId)
  );

  if (!runtimeSnap.exists()) {
    return null;
  }

  const runtime = runtimeSnap.data() as any;
  const performance = runtime.performance || {};

  const initialBalanceUsd = Number(
    performance.initialBalance || 0
  );

  const balanceUsd = Number(
    performance.balance || 0
  );

  const equityUsd = Number(
    performance.equity || balanceUsd
  );

  if (
    initialBalanceUsd <= 0 ||
    equityUsd <= 0
  ) {
    return null;
  }

  return {
    initialBalanceUsd,
    balanceUsd:
      balanceUsd > 0
        ? balanceUsd
        : equityUsd,
    equityUsd,
    strategyRoiPct:
      ((equityUsd - initialBalanceUsd) /
        initialBalanceUsd) *
      100,
  };
}

function performanceFromSnapshot(
  snapshot: any
): StrategyPerformance | null {
  if (!snapshot) {
    return null;
  }

  const initialBalanceUsd = Number(
    snapshot.initialBalance ??
      snapshot.deposits ??
      0
  );

  const balanceUsd = Number(
    snapshot.balance ??
      snapshot.equity ??
      0
  );

  const equityUsd = Number(
    snapshot.equity ??
      snapshot.balance ??
      0
  );

  if (
    initialBalanceUsd <= 0 ||
    equityUsd <= 0
  ) {
    return null;
  }

  return {
    initialBalanceUsd,
    balanceUsd,
    equityUsd,
    strategyRoiPct:
      ((equityUsd - initialBalanceUsd) /
        initialBalanceUsd) *
      100,
  };
}

async function currentStrategyPerformance(
  strategyId: string
): Promise<StrategyPerformance | null> {
  const runtime =
    await performanceFromRuntime(strategyId);

  if (runtime) {
    return runtime;
  }

  const latest =
    await PerformanceRepository.latest(
      strategyId
    );

  return performanceFromSnapshot(latest);
}

async function syncFundDocument(fundId: string) {
  const fundSnap = await getDoc(doc(db, "funds", fundId));

  if (!fundSnap.exists()) {
    return { ok: false, error: "Fund not found" };
  }

  const fund = fundSnap.data() as any;
  const allocations = Array.isArray(fund.strategyAllocations)
    ? fund.strategyAllocations
    : [];

  if (!allocations.length) {
    return { ok: false, error: "Fund has no strategy allocations" };
  }

  const principal = Number(
    fund.capitalUsd || 0
  );

  let calculatedFundPnlUsd = 0;
  const details: any[] = [];

  for (const allocation of allocations) {
    const performance =
      await currentStrategyPerformance(
        allocation.strategyId
      );

    const allocationPct = Number(
      allocation.allocationPct || 0
    );

    const allocationCapitalUsd = Number(
      allocation.capitalUsd ??
        (
          principal *
          (allocationPct / 100)
        )
    );

    if (!performance) {
      details.push({
        strategyId: allocation.strategyId,
        traderId: allocation.traderId,
        allocationPct,
        capitalUsd: allocationCapitalUsd,
        status: "performance_unavailable",
      });

      continue;
    }

    const entryStrategyEquityUsd = Number(
      allocation.entryStrategyEquityUsd || 0
    );

    const hasEntryBaseline =
      entryStrategyEquityUsd > 0;

    /*
     * New funds: return begins at the exact strategy
     * equity captured when the investor entered.
     *
     * Legacy funds temporarily retain historical ROI
     * until their entry baselines are migrated.
     */
    const liveReturnPct =
      hasEntryBaseline
        ? (
            (
              performance.equityUsd -
              entryStrategyEquityUsd
            ) /
            entryStrategyEquityUsd
          ) * 100
        : performance.strategyRoiPct;

    /*
     * Migrated funds retain all investor PnL earned before
     * the entry-equity engine was installed. Future PnL is
     * calculated exclusively from the captured entry equity.
     */
    const carryoverPnlUsd = Number(
      allocation.carryoverPnlUsd || 0
    );

    const livePnlUsd =
      allocationCapitalUsd *
      (liveReturnPct / 100);

    const allocationPnlUsd =
      carryoverPnlUsd +
      livePnlUsd;

    const investorReturnPct =
      allocationCapitalUsd > 0
        ? (
            allocationPnlUsd /
            allocationCapitalUsd
          ) * 100
        : 0;

    calculatedFundPnlUsd +=
      allocationPnlUsd;

    details.push({
      strategyId: allocation.strategyId,
      traderId: allocation.traderId,

      allocationPct,
      capitalUsd:
        Number(
          allocationCapitalUsd.toFixed(2)
        ),

      strategyInitialBalanceUsd:
        performance.initialBalanceUsd,

      entryStrategyEquityUsd:
        hasEntryBaseline
          ? entryStrategyEquityUsd
          : null,

      currentStrategyBalanceUsd:
        performance.balanceUsd,

      currentStrategyEquityUsd:
        performance.equityUsd,

      strategyRoiPct:
        Number(
          performance.strategyRoiPct.toFixed(4)
        ),

      liveReturnPct:
        Number(
          liveReturnPct.toFixed(4)
        ),

      carryoverPnlUsd:
        Number(
          carryoverPnlUsd.toFixed(2)
        ),

      livePnlUsd:
        Number(
          livePnlUsd.toFixed(2)
        ),

      investorReturnPct:
        Number(
          investorReturnPct.toFixed(4)
        ),

      allocationPnlUsd:
        Number(
          allocationPnlUsd.toFixed(2)
        ),

      calculationMode:
        hasEntryBaseline
          ? carryoverPnlUsd !== 0
            ? "entry_equity_with_carryover"
            : "since_entry_equity"
          : "legacy_strategy_roi",
    });
  }

  const fundEquityUsd = Math.max(
    0,
    principal + calculatedFundPnlUsd
  );

  const fundPnlUsd =
    fundEquityUsd - principal;

  const weightedRoi =
    principal > 0
      ? (fundPnlUsd / principal) * 100
      : 0;

  const roundedWeightedRoi = Number(
    weightedRoi.toFixed(4)
  );

  const roundedEquityUsd = Number(
    fundEquityUsd.toFixed(2)
  );

  const roundedPnlUsd = Number(
    fundPnlUsd.toFixed(2)
  );

  const now = Date.now();

  const performanceStartedAt = Number(
    fund.performanceStartedAt || now
  );

  const lastSnapshotAt = Number(
    fund.lastPerformanceSnapshotAt || 0
  );

  const lastSnapshotEquityUsd = Number(
    fund.lastPerformanceSnapshotEquityUsd ??
      principal
  );

  const equityChanged =
    Math.abs(
      roundedEquityUsd -
        lastSnapshotEquityUsd
    ) >= 0.01;

  /*
   * Keep the chart useful without producing thousands
   * of duplicate points: at most one changed snapshot
   * per minute.
   */
  const shouldWriteSnapshot =
    equityChanged &&
    (
      !lastSnapshotAt ||
      now - lastSnapshotAt >= 60_000
    );

  await updateDoc(
    doc(db, "users", fund.userId),
    {
      fundEquityUsd: roundedEquityUsd,
      fundPnlUsd: roundedPnlUsd,
      updatedAt: now,
    }
  );

  const fundUpdate: Record<string, any> = {
    weightedRoi: roundedWeightedRoi,
    fundEquityUsd: roundedEquityUsd,
    fundPnlUsd: roundedPnlUsd,
    lastPerformanceSyncAt: now,
    calculationVersion:
      "entry_equity_v1",
  };

  if (shouldWriteSnapshot) {
    fundUpdate.lastPerformanceSnapshotAt =
      now;

    fundUpdate.lastPerformanceSnapshotEquityUsd =
      roundedEquityUsd;
  }

  await updateDoc(
    doc(db, "funds", fundId),
    fundUpdate
  );

  if (shouldWriteSnapshot) {
    const snapshotRef = doc(
      db,
      "funds",
      fundId,
      "performanceSnapshots",
      String(now)
    );

    await setDoc(snapshotRef, {
      fundId,
      userId: fund.userId,

      timestamp: now,
      performanceStartedAt,

      principalUsd: principal,
      equityUsd: roundedEquityUsd,
      pnlUsd: roundedPnlUsd,
      weightedRoi:
        roundedWeightedRoi,

      details,
      source: "strategy_runtime",
      createdAt: now,
    });
  }

  return {
    ok: true,
    userId: fund.userId,
    activeFundId: fundId,
    principal,
    weightedRoi: roundedWeightedRoi,
    fundEquityUsd: roundedEquityUsd,
    fundPnlUsd: roundedPnlUsd,
    snapshotWritten: shouldWriteSnapshot,
    details,
  };
}

export const FundPerformanceService = {
  async syncAllActiveFunds() {
    const snap = await getDocs(
      query(
        collection(db, "funds"),
        where("status", "==", "ACTIVE")
      )
    );

    const results = [];

    for (const fundDoc of snap.docs) {
      try {
        results.push(await syncFundDocument(fundDoc.id));
      } catch (error) {
        results.push({
          ok: false,
          fundId: fundDoc.id,
          error:
            error instanceof Error
              ? error.message
              : "Unknown fund sync error",
        });
      }
    }

    return {
      ok: true,
      checked: snap.size,
      synced: results.filter((result: any) => result.ok).length,
      failed: results.filter((result: any) => !result.ok).length,
      results,
    };
  },

  async syncUserFund(userId: string) {
    const userSnap = await getDoc(doc(db, "users", userId));

    if (!userSnap.exists()) {
      return { ok: false, error: "User not found" };
    }

    const user = userSnap.data() as any;

    if (!user.activeFundId) {
      return { ok: false, error: "No active fund" };
    }

    return syncFundDocument(user.activeFundId);
  },

  async syncFundsByStrategy(strategyId: string) {
    const snap = await getDocs(
      query(
        collection(db, "funds"),
        where("status", "==", "ACTIVE")
      )
    );

    const affected = snap.docs.filter((fundDoc) => {
      const fund = fundDoc.data() as any;
      const allocations = Array.isArray(fund.strategyAllocations)
        ? fund.strategyAllocations
        : [];

      return allocations.some((allocation: any) => allocation.strategyId === strategyId);
    });

    const results = [];

    for (const fundDoc of affected) {
      results.push(await syncFundDocument(fundDoc.id));
    }

    return {
      ok: true,
      strategyId,
      synced: results.filter((r: any) => r.ok).length,
      checked: snap.size,
      affected: affected.length,
      results,
    };
  },
};
