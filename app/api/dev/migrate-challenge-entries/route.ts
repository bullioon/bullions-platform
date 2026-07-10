import { NextResponse } from "next/server";
import { getAdminDb } from "@/lib/firebaseAdmin";

function requireDevSecret(req: Request) {
  const authHeader = req.headers.get("authorization");

  const expectedSecret =
    process.env.BULLIONS_ADMIN_SECRET ||
    process.env.MT5_CRON_SECRET ||
    process.env.CRON_SECRET;

  return Boolean(
    expectedSecret &&
      authHeader === `Bearer ${expectedSecret}`
  );
}

export async function POST(req: Request) {
  if (!requireDevSecret(req)) {
    return NextResponse.json(
      { ok: false, error: "Unauthorized" },
      { status: 401 }
    );
  }

  try {
    const db = getAdminDb();
    const entriesSnap = await db.collection("challengeEntries").get();

    const batch = db.batch();
    const results = [];
    const now = Date.now();

    for (const entryDoc of entriesSnap.docs) {
      const entry = entryDoc.data() as Record<string, any>;
      const strategyId = String(entry.strategyId || "");

      if (!strategyId) {
        results.push({
          entryId: entryDoc.id,
          migrated: false,
          reason: "Missing strategyId",
        });
        continue;
      }

      const strategySnap = await db
        .collection("managerStrategies")
        .doc(strategyId)
        .get();

      if (!strategySnap.exists) {
        results.push({
          entryId: entryDoc.id,
          strategyId,
          migrated: false,
          reason: "Strategy not found",
        });
        continue;
      }

      const strategy = strategySnap.data() as Record<string, any>;
      const managerUid = String(strategy?.manager?.uid || "");

      if (!managerUid) {
        results.push({
          entryId: entryDoc.id,
          strategyId,
          migrated: false,
          reason: "Strategy has no manager UID",
        });
        continue;
      }

      const initialBalance = Number(
        strategy?.performance?.initialBalance ??
        strategy?.initialBalance ??
        50000
      );

      const tierId =
        entry.tierId === "demo_50k" ||
        entry.tierId === "demo_200k"
          ? entry.tierId
          : initialBalance >= 150000
            ? "demo_200k"
            : "demo_50k";

      const paid = entry.paid === true;

      batch.set(
        entryDoc.ref,
        {
          managerUid,
          tierId,
          entryFeeUsd: tierId === "demo_200k" ? 1080 : 350,
          paymentStatus: paid ? "confirmed" : "pending",
          mt5AssignmentStatus: entry.mt5AccountId
            ? "assigned"
            : paid
              ? "pending_assignment"
              : "pending_payment",
          updatedAt: now,
        },
        { merge: true }
      );

      results.push({
        entryId: entryDoc.id,
        strategyId,
        managerUid,
        tierId,
        paid,
        migrated: true,
      });
    }

    await batch.commit();

    return NextResponse.json({
      ok: true,
      checked: entriesSnap.size,
      migrated: results.filter((item) => item.migrated).length,
      failed: results.filter((item) => !item.migrated).length,
      results,
    });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error:
          error instanceof Error
            ? error.message
            : "Challenge entry migration failed",
      },
      { status: 500 }
    );
  }
}
