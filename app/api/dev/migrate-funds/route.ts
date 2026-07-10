import { NextResponse } from "next/server";
import {
  collection,
  doc,
  getDocs,
  query,
  updateDoc,
  where,
} from "firebase/firestore";

import { db } from "@/lib/firebase";

function requireDevSecret(req: Request) {
  const authHeader = req.headers.get("authorization");
  const expectedSecret =
    process.env.MT5_CRON_SECRET || process.env.CRON_SECRET;

  return Boolean(
    expectedSecret &&
      authHeader === `Bearer ${expectedSecret}`
  );
}

const strategyAliases: Record<string, string> = {
  ax_prime_KMF63S: "strategy_ax_prime_KMF63S",
  mia_capital: "strategy_mia_capital",
  bullions_ai: "strategy_bullions_ai",
  "bullions-bot": "strategy_bullions_ai",
  torion_desk: "strategy_torion_desk",
  managerdos: "aa07ccd7-bae1-471c-84ab-185d881e9f97",
  ghost_alpha: "aa07ccd7-bae1-471c-84ab-185d881e9f97",
};

export async function POST(req: Request) {
  if (!requireDevSecret(req)) {
    return NextResponse.json(
      { ok: false, error: "Unauthorized" },
      { status: 401 }
    );
  }

  const snap = await getDocs(
    query(
      collection(db, "funds"),
      where("status", "==", "ACTIVE")
    )
  );

  const results = [];

  for (const fundDoc of snap.docs) {
    const fund = fundDoc.data() as any;

    if (
      Array.isArray(fund.strategyAllocations) &&
      fund.strategyAllocations.length > 0
    ) {
      results.push({
        fundId: fundDoc.id,
        migrated: false,
        reason: "Already migrated",
      });
      continue;
    }

    const managers = Array.isArray(fund.managers)
      ? fund.managers
      : [];

    if (!managers.length) {
      results.push({
        fundId: fundDoc.id,
        migrated: false,
        reason: "No managers",
      });
      continue;
    }

    const principal = Number(
      fund.capitalUsd ??
      fund.allocatedUsd ??
      0
    );

    const strategyAllocations = managers
      .map((manager: any) => {
        const traderId = String(manager.traderId || "");
        const strategyId = strategyAliases[traderId];

        if (!strategyId) return null;

        const allocationPct = Number(
          manager.allocationPct || 0
        );

        return {
          traderId,
          strategyId,
          allocationPct,
          capitalUsd: Number(
            (principal * (allocationPct / 100)).toFixed(2)
          ),
        };
      })
      .filter(Boolean);

    if (!strategyAllocations.length) {
      results.push({
        fundId: fundDoc.id,
        migrated: false,
        reason: "No strategy alias found",
      });
      continue;
    }

    await updateDoc(doc(db, "funds", fundDoc.id), {
      capitalUsd: principal,
      strategyAllocations,
      fundEquityUsd: principal,
      fundPnlUsd: 0,
      weightedRoi: 0,
      updatedAt: Date.now(),
    });

    results.push({
      fundId: fundDoc.id,
      migrated: true,
      strategyAllocations,
    });
  }

  return NextResponse.json({
    ok: true,
    checked: snap.size,
    migrated: results.filter(
      (result) => result.migrated
    ).length,
    results,
  });
}
