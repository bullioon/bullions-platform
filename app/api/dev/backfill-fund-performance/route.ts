import { NextResponse } from "next/server";
import {
  collection,
  doc,
  getDocs,
  query,
  setDoc,
  updateDoc,
  where,
} from "firebase/firestore";

import { db } from "@/lib/firebase";

function requireDevSecret(req: Request) {
  const authHeader =
    req.headers.get("authorization");

  const expectedSecret =
    process.env.MT5_CRON_SECRET ||
    process.env.CRON_SECRET;

  return Boolean(
    expectedSecret &&
      authHeader ===
        `Bearer ${expectedSecret}`
  );
}

function timestampToMillis(
  value: any
): number {
  if (
    value &&
    typeof value.toMillis === "function"
  ) {
    return value.toMillis();
  }

  if (
    value &&
    typeof value.seconds === "number"
  ) {
    return (
      value.seconds * 1000 +
      Math.floor(
        Number(value.nanoseconds || 0) /
          1_000_000
      )
    );
  }

  const numeric = Number(value || 0);

  return Number.isFinite(numeric)
    ? numeric
    : 0;
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
    const snap = await getDocs(
      query(
        collection(db, "funds"),
        where("status", "==", "ACTIVE")
      )
    );

    const now = Date.now();
    const migrated: any[] = [];
    const skipped: any[] = [];

    for (const fundDoc of snap.docs) {
      const fund = fundDoc.data() as any;
      const fundId = fundDoc.id;

      const principalUsd = Number(
        fund.capitalUsd || 0
      );

      if (principalUsd <= 0) {
        skipped.push({
          fundId,
          reason: "No principal",
        });

        continue;
      }

      if (
        Number(fund.performanceStartedAt || 0) >
        0
      ) {
        skipped.push({
          fundId,
          reason:
            "Performance session already exists",
        });

        continue;
      }

      const createdAtMs =
        timestampToMillis(fund.createdAt) ||
        Number(fund.updatedAt || 0);

      const performanceStartedAt = Math.min(
        createdAtMs || now - 1,
        now - 1
      );

      const currentTimestamp = Math.max(
        now,
        performanceStartedAt + 1
      );

      const equityUsd = Number(
        fund.fundEquityUsd ?? principalUsd
      );

      const pnlUsd = Number(
        fund.fundPnlUsd ??
          equityUsd - principalUsd
      );

      const weightedRoi = Number(
        fund.weightedRoi ??
          (
            (pnlUsd / principalUsd) *
            100
          )
      );

      await setDoc(
        doc(
          db,
          "funds",
          fundId,
          "performanceSnapshots",
          String(performanceStartedAt)
        ),
        {
          fundId,
          userId: fund.userId,

          timestamp:
            performanceStartedAt,
          performanceStartedAt,

          principalUsd,
          equityUsd: principalUsd,
          pnlUsd: 0,
          weightedRoi: 0,

          source: "migration_initial",
          createdAt:
            performanceStartedAt,
        }
      );

      await setDoc(
        doc(
          db,
          "funds",
          fundId,
          "performanceSnapshots",
          String(currentTimestamp)
        ),
        {
          fundId,
          userId: fund.userId,

          timestamp: currentTimestamp,
          performanceStartedAt,

          principalUsd,
          equityUsd: Number(
            equityUsd.toFixed(2)
          ),
          pnlUsd: Number(
            pnlUsd.toFixed(2)
          ),
          weightedRoi: Number(
            weightedRoi.toFixed(4)
          ),

          source: "migration_current",
          createdAt: currentTimestamp,
        }
      );

      await updateDoc(
        doc(db, "funds", fundId),
        {
          performanceStartedAt,

          lastPerformanceSnapshotAt:
            currentTimestamp,

          lastPerformanceSnapshotEquityUsd:
            Number(equityUsd.toFixed(2)),

          updatedAt: now,
        }
      );

      migrated.push({
        fundId,
        principalUsd,
        equityUsd: Number(
          equityUsd.toFixed(2)
        ),
        pnlUsd: Number(
          pnlUsd.toFixed(2)
        ),
        weightedRoi: Number(
          weightedRoi.toFixed(4)
        ),
        snapshotsCreated: 2,
      });
    }

    return NextResponse.json({
      ok: true,
      checked: snap.size,
      migratedCount: migrated.length,
      skippedCount: skipped.length,
      migrated,
      skipped,
    });
  } catch (error) {
    console.error(
      "[backfill-fund-performance]",
      error
    );

    return NextResponse.json(
      {
        ok: false,
        error:
          error instanceof Error
            ? error.message
            : "Backfill failed",
      },
      { status: 500 }
    );
  }
}
