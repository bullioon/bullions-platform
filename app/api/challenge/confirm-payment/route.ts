import { NextResponse } from "next/server";

import { getAdminDb } from "@/lib/firebaseAdmin";
import { MT5AssignmentService } from "@/core/v2/services/MT5AssignmentService";

function requirePaymentSecret(req: Request) {
  const authHeader = req.headers.get("authorization");

  const expectedSecret =
    process.env.CHALLENGE_PAYMENT_SECRET ||
    process.env.BULLIONS_ADMIN_SECRET ||
    process.env.MT5_CRON_SECRET ||
    process.env.CRON_SECRET;

  return Boolean(
    expectedSecret &&
      authHeader === `Bearer ${expectedSecret}`
  );
}

export async function POST(req: Request) {
  if (!requirePaymentSecret(req)) {
    return NextResponse.json(
      { ok: false, error: "Unauthorized" },
      { status: 401 }
    );
  }

  try {
    const body = await req.json();

    const challengeEntryId = String(
      body.challengeEntryId || ""
    ).trim();

    const paymentReference = String(
      body.paymentReference || ""
    ).trim();

    if (!challengeEntryId) {
      return NextResponse.json(
        {
          ok: false,
          error: "Missing challengeEntryId",
        },
        { status: 400 }
      );
    }

    if (!paymentReference) {
      return NextResponse.json(
        {
          ok: false,
          error: "Missing paymentReference",
        },
        { status: 400 }
      );
    }

    const db = getAdminDb();

    const entryRef = db
      .collection("challengeEntries")
      .doc(challengeEntryId);

    const entrySnap = await entryRef.get();

    if (!entrySnap.exists) {
      return NextResponse.json(
        {
          ok: false,
          error: "Challenge entry not found",
        },
        { status: 404 }
      );
    }

    const entry =
      entrySnap.data() as Record<string, any>;

    const strategyId = String(
      entry.strategyId || ""
    );

    const seasonId = String(
      entry.seasonId || ""
    );

    const managerUid = String(
      entry.managerUid || ""
    );

    const tierId = entry.tierId;

    if (
      !strategyId ||
      !seasonId ||
      !managerUid ||
      (tierId !== "demo_50k" &&
        tierId !== "demo_200k")
    ) {
      return NextResponse.json(
        {
          ok: false,
          error:
            "Challenge entry is missing assignment data",
        },
        { status: 409 }
      );
    }

    const now = Date.now();

    await entryRef.set(
      {
        paid: true,
        paymentStatus: "confirmed",
        paymentReference,
        paymentConfirmedAt: now,
        updatedAt: now,
      },
      { merge: true }
    );

    const assigned =
      await MT5AssignmentService.assignNextAccount({
        managerUid,
        strategyId,
        challengeEntryId,
        seasonId,
        tierId,
      });

    /*
     * Update existing trader document when the manager UID
     * is already used as the trader document ID.
     * It does not create a phantom trader document.
     */
    const traderRef = db
      .collection("traders")
      .doc(managerUid);

    const traderSnap = await traderRef.get();

    if (traderSnap.exists) {
      await traderRef.set(
        {
          status: "ACTIVE",
          verified: true,
          seasonId,

          mt5: {
            connected: false,
            accountId: assigned.accountId,
            accountLogin: assigned.login,
            server: assigned.server,
            broker: assigned.broker,
            assignmentStatus: "ASSIGNED",
            assignedAt: now,
            lastSyncAt: null,
          },

          updatedAt: now,
          challengeActivatedAt: now,
        },
        { merge: true }
      );
    }

    return NextResponse.json({
      ok: true,
      paid: true,
      assigned: true,

      challengeEntryId,
      strategyId,
      seasonId,

      mt5: {
        accountId: assigned.accountId,
        accountLogin: assigned.login,
        server: assigned.server,
        broker: assigned.broker,
        status: assigned.status,
      },
    });
  } catch (error) {
    console.error("[challenge-confirm-payment]", error);

    return NextResponse.json(
      {
        ok: false,
        error:
          error instanceof Error
            ? error.message
            : "Payment confirmation failed",
      },
      { status: 500 }
    );
  }
}
