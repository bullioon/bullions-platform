import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  updateDoc,
  where,
} from "firebase/firestore";

import { db } from "@/lib/firebase";
import { PerformanceRepository } from "@/core/v2/repositories/PerformanceRepository";


async function roiFromRuntime(strategyId: string): Promise<number | null> {
  const runtimeSnap = await getDoc(doc(db, "strategyRuntimes", strategyId));

  if (!runtimeSnap.exists()) {
    return null;
  }

  const runtime = runtimeSnap.data() as { performance?: { roi?: number } };
  const roi = Number(runtime.performance?.roi);

  return Number.isFinite(roi) ? roi : null;
}
function roiFromSnapshot(snapshot: any) {
  const deposits = Number(snapshot?.deposits || 0);
  const equity = Number(snapshot?.equity || 0);
  const withdrawals = Number(snapshot?.withdrawals || 0);

  if (deposits <= 0) return 0;

  return ((equity - deposits + withdrawals) / deposits) * 100;
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

  let weightedRoi = 0;
  const details = [];

  for (const allocation of allocations) {
    const runtimeRoi = await roiFromRuntime(allocation.strategyId);
    const latest = runtimeRoi === null ? await PerformanceRepository.latest(allocation.strategyId) : null;
    const strategyRoi = runtimeRoi === null ? roiFromSnapshot(latest) : runtimeRoi;
    const allocationPct = Number(allocation.allocationPct || 0);

    weightedRoi += strategyRoi * (allocationPct / 100);

    details.push({
      strategyId: allocation.strategyId,
      traderId: allocation.traderId,
      allocationPct,
      strategyRoi,
    });
  }

  const principal = Number(fund.capitalUsd || 0);
  const fundEquityUsd = Math.max(0, principal * (1 + weightedRoi / 100));
  const fundPnlUsd = fundEquityUsd - principal;

  await updateDoc(doc(db, "users", fund.userId), {
    fundEquityUsd: Number(fundEquityUsd.toFixed(2)),
    fundPnlUsd: Number(fundPnlUsd.toFixed(2)),
    updatedAt: Date.now(),
  });

  await updateDoc(doc(db, "funds", fundId), {
    weightedRoi: Number(weightedRoi.toFixed(4)),
    fundEquityUsd: Number(fundEquityUsd.toFixed(2)),
    fundPnlUsd: Number(fundPnlUsd.toFixed(2)),
    lastPerformanceSyncAt: Date.now(),
  });

  return {
    ok: true,
    userId: fund.userId,
    activeFundId: fundId,
    principal,
    weightedRoi: Number(weightedRoi.toFixed(4)),
    fundEquityUsd: Number(fundEquityUsd.toFixed(2)),
    fundPnlUsd: Number(fundPnlUsd.toFixed(2)),
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
