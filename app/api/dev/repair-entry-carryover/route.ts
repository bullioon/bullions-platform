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

    const repaired: any[] = [];
    const skipped: any[] = [];
    const failed: any[] = [];

    for (const fundDoc of fundsSnap.docs) {
      try {
        const fund = fundDoc.data() as any;

        const migratedAt = Number(
          fund.entryEquityMigratedAt || 0
        );

        const principalUsd = Number(
          fund.capitalUsd || 0
        );

        const allocations = Array.isArray(
          fund.strategyAllocations
        )
          ? fund.strategyAllocations
          : [];

        if (
          migratedAt <= 0 ||
          principalUsd <= 0 ||
          !allocations.length
        ) {
          skipped.push({
            fundId: fundDoc.id,
            reason:
              migratedAt <= 0
                ? "Not entry-equity migrated"
                : principalUsd <= 0
                  ? "No principal"
                  : "No allocations",
          });

          continue;
        }

        const snapshotsSnap = await getDocs(
          collection(
            db,
            "funds",
            fundDoc.id,
            "performanceSnapshots"
          )
        );

        const previousSnapshots =
          snapshotsSnap.docs
            .map((snapshotDoc) => {
              const data =
                snapshotDoc.data() as any;

              return {
                timestamp: Number(
                  data.timestamp || 0
                ),
                pnlUsd: Number(
                  data.pnlUsd || 0
                ),
                equityUsd: Number(
                  data.equityUsd || 0
                ),
                source: String(
                  data.source || "unknown"
                ),
              };
            })
            .filter(
              (snapshot) =>
                snapshot.timestamp > 0 &&
                snapshot.timestamp <
                  migratedAt &&
                Number.isFinite(
                  snapshot.pnlUsd
                )
            )
            .sort(
              (a, b) =>
                b.timestamp -
                a.timestamp
            );

        const latestBeforeMigration =
          previousSnapshots[0];

        if (!latestBeforeMigration) {
          skipped.push({
            fundId: fundDoc.id,
            reason:
              "No snapshot before migration",
          });

          continue;
        }

        const correctCarryoverPnlUsd =
          Number(
            latestBeforeMigration.pnlUsd.toFixed(
              2
            )
          );

        const allocationCapitals =
          allocations.map(
            (allocation: any) =>
              Number(
                allocation.capitalUsd ??
                  (
                    principalUsd *
                    (
                      Number(
                        allocation.allocationPct ||
                          0
                      ) / 100
                    )
                  )
              )
          );

        const totalAllocationCapital =
          allocationCapitals.reduce(
            (sum: number, value: number) =>
              sum + value,
            0
          );

        let distributedPnlUsd = 0;

        const nextAllocations =
          allocations.map(
            (
              allocation: any,
              index: number
            ) => {
              const allocationCapitalUsd =
                allocationCapitals[index];

              const isLast =
                index ===
                allocations.length - 1;

              const allocationCarryover =
                isLast
                  ? Number(
                      (
                        correctCarryoverPnlUsd -
                        distributedPnlUsd
                      ).toFixed(2)
                    )
                  : Number(
                      (
                        totalAllocationCapital >
                        0
                          ? correctCarryoverPnlUsd *
                            (
                              allocationCapitalUsd /
                              totalAllocationCapital
                            )
                          : 0
                      ).toFixed(2)
                    );

              distributedPnlUsd +=
                allocationCarryover;

              return {
                ...allocation,

                carryoverPnlUsd:
                  allocationCarryover,

                migrationSource:
                  "preserved_fund_snapshot",

                carryoverRepairedAt:
                  Date.now(),
              };
            }
          );

        const correctedFundEquityUsd =
          Number(
            (
              principalUsd +
              correctCarryoverPnlUsd
            ).toFixed(2)
          );

        const correctedWeightedRoi =
          principalUsd > 0
            ? Number(
                (
                  (
                    correctCarryoverPnlUsd /
                    principalUsd
                  ) *
                  100
                ).toFixed(4)
              )
            : 0;

        const now = Date.now();

        await updateDoc(
          doc(db, "funds", fundDoc.id),
          {
            strategyAllocations:
              nextAllocations,

            fundPnlUsd:
              correctCarryoverPnlUsd,

            fundEquityUsd:
              correctedFundEquityUsd,

            weightedRoi:
              correctedWeightedRoi,

            carryoverRepairedAt: now,
            calculationVersion:
              "entry_equity_v1",

            updatedAt: now,
          }
        );

        await updateDoc(
          doc(db, "users", fund.userId),
          {
            fundPnlUsd:
              correctCarryoverPnlUsd,

            fundEquityUsd:
              correctedFundEquityUsd,

            updatedAt: now,
          }
        );

        repaired.push({
          fundId: fundDoc.id,
          userId: fund.userId,

          incorrectCarryoverPnlUsd:
            Number(fund.fundPnlUsd || 0),

          correctedCarryoverPnlUsd:
            correctCarryoverPnlUsd,

          correctedFundEquityUsd,
          correctedWeightedRoi,

          snapshotTimestamp:
            latestBeforeMigration.timestamp,

          snapshotSource:
            latestBeforeMigration.source,
        });
      } catch (error) {
        failed.push({
          fundId: fundDoc.id,
          error:
            error instanceof Error
              ? error.message
              : "Unknown repair error",
        });
      }
    }

    return NextResponse.json({
      ok: failed.length === 0,
      checked: fundsSnap.size,
      repairedCount: repaired.length,
      skippedCount: skipped.length,
      failedCount: failed.length,
      repaired,
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
            : "Carryover repair failed",
      },
      { status: 500 }
    );
  }
}
