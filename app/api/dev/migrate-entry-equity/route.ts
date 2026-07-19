import { NextResponse } from "next/server";
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

function requireDevSecret(req: Request) {
  const authorization =
    req.headers.get("authorization");

  const secret =
    process.env.MT5_CRON_SECRET ||
    process.env.CRON_SECRET;

  return Boolean(
    secret &&
      authorization === `Bearer ${secret}`
  );
}

async function getCurrentPerformance(
  strategyId: string
) {
  const runtimeSnap = await getDoc(
    doc(db, "strategyRuntimes", strategyId)
  );

  if (!runtimeSnap.exists()) {
    throw new Error(
      `Runtime not found for ${strategyId}`
    );
  }

  const runtime = runtimeSnap.data() as any;
  const performance =
    runtime.performance || {};

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
    throw new Error(
      `Invalid runtime performance for ${strategyId}`
    );
  }

  const strategyRoiPct =
    (
      (
        equityUsd -
        initialBalanceUsd
      ) /
      initialBalanceUsd
    ) * 100;

  return {
    initialBalanceUsd,
    balanceUsd:
      balanceUsd > 0
        ? balanceUsd
        : equityUsd,
    equityUsd,
    strategyRoiPct,
  };
}

export async function POST(req: Request) {
  if (!requireDevSecret(req)) {
    return NextResponse.json(
      {
        ok: false,
        error: "Unauthorized",
      },
      { status: 401 }
    );
  }

  try {
    const fundsSnap = await getDocs(
      query(
        collection(db, "funds"),
        where("status", "==", "ACTIVE")
      )
    );

    const now = Date.now();

    const migrated: any[] = [];
    const skipped: any[] = [];
    const failed: any[] = [];

    for (const fundDoc of fundsSnap.docs) {
      try {
        const fund = fundDoc.data() as any;

        const principalUsd = Number(
          fund.capitalUsd || 0
        );

        /*
         * Preserve the investor fund PnL that already exists.
         * Never recreate carryover from the strategy's full
         * historical ROI.
         */
        const legacyFundPnlUsd = Number(
          fund.fundPnlUsd || 0
        );

        const allocations = Array.isArray(
          fund.strategyAllocations
        )
          ? fund.strategyAllocations
          : [];

        if (
          principalUsd <= 0 ||
          !allocations.length
        ) {
          skipped.push({
            fundId: fundDoc.id,
            reason:
              principalUsd <= 0
                ? "No principal"
                : "No allocations",
          });

          continue;
        }

        const needsMigration =
          allocations.some(
            (allocation: any) =>
              Number(
                allocation.entryStrategyEquityUsd ||
                  0
              ) <= 0
          );

        if (!needsMigration) {
          skipped.push({
            fundId: fundDoc.id,
            reason:
              "Entry equity already captured",
          });

          continue;
        }

        let totalCarryoverPnlUsd = 0;

        const nextAllocations = [];

        for (const allocation of allocations) {
          const existingEntryEquity = Number(
            allocation.entryStrategyEquityUsd ||
              0
          );

          if (existingEntryEquity > 0) {
            nextAllocations.push(allocation);

            totalCarryoverPnlUsd += Number(
              allocation.carryoverPnlUsd || 0
            );

            continue;
          }

          const strategyId = String(
            allocation.strategyId || ""
          );

          const performance =
            await getCurrentPerformance(
              strategyId
            );

          const allocationPct = Number(
            allocation.allocationPct || 0
          );

          const allocationCapitalUsd =
            Number(
              allocation.capitalUsd ??
                (
                  principalUsd *
                  (allocationPct / 100)
                )
            );

          /*
           * Preserve the PnL produced by the legacy engine
           * at this exact migration moment.
           */
          const carryoverPnlUsd =
            principalUsd > 0
              ? legacyFundPnlUsd *
                (
                  allocationCapitalUsd /
                  principalUsd
                )
              : 0;

          totalCarryoverPnlUsd +=
            carryoverPnlUsd;

          nextAllocations.push({
            ...allocation,

            strategyInitialBalanceUsd:
              performance.initialBalanceUsd,

            entryStrategyBalanceUsd:
              performance.balanceUsd,

            entryStrategyEquityUsd:
              performance.equityUsd,

            entryStrategyRoiPct:
              Number(
                performance.strategyRoiPct.toFixed(
                  4
                )
              ),

            entryCapturedAt: now,

            carryoverPnlUsd:
              Number(
                carryoverPnlUsd.toFixed(2)
              ),

            migrationSource:
              "legacy_strategy_roi",
          });
        }

        const roundedPnlUsd = Number(
          totalCarryoverPnlUsd.toFixed(2)
        );

        const roundedEquityUsd = Number(
          (
            principalUsd +
            roundedPnlUsd
          ).toFixed(2)
        );

        const weightedRoi =
          principalUsd > 0
            ? Number(
                (
                  (
                    roundedPnlUsd /
                    principalUsd
                  ) *
                  100
                ).toFixed(4)
              )
            : 0;

        await updateDoc(
          doc(db, "funds", fundDoc.id),
          {
            strategyAllocations:
              nextAllocations,

            fundEquityUsd:
              roundedEquityUsd,

            fundPnlUsd:
              roundedPnlUsd,

            weightedRoi,

            calculationVersion:
              "entry_equity_v1",

            entryEquityMigratedAt: now,
            updatedAt: now,
          }
        );

        await updateDoc(
          doc(db, "users", fund.userId),
          {
            fundEquityUsd:
              roundedEquityUsd,

            fundPnlUsd:
              roundedPnlUsd,

            updatedAt: now,
          }
        );

        migrated.push({
          fundId: fundDoc.id,
          userId: fund.userId,
          allocations:
            nextAllocations.length,
          principalUsd,
          carryoverPnlUsd:
            roundedPnlUsd,
          fundEquityUsd:
            roundedEquityUsd,
          weightedRoi,
        });
      } catch (error) {
        failed.push({
          fundId: fundDoc.id,
          error:
            error instanceof Error
              ? error.message
              : "Unknown migration error",
        });
      }
    }

    return NextResponse.json({
      ok: failed.length === 0,
      checked: fundsSnap.size,
      migratedCount: migrated.length,
      skippedCount: skipped.length,
      failedCount: failed.length,
      migrated,
      skipped,
      failed,
    });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error:
          error instanceof Error
            ? error.message
            : "Entry equity migration failed",
      },
      { status: 500 }
    );
  }
}
