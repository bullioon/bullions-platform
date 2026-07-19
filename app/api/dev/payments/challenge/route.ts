import { NextResponse } from "next/server";

import { getAdminAuth } from "@/lib/firebaseAdminAuth";
import { getAdminDb } from "@/lib/firebaseAdmin";
import { MT5AssignmentService } from "@/core/v2/services/MT5AssignmentService";

export async function POST(req: Request) {
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json(
      {
        ok: false,
        error: "Simulated payments are disabled in production",
      },
      { status: 403 }
    );
  }

  try {
    const authHeader = req.headers.get("authorization");

    const idToken = authHeader?.startsWith("Bearer ")
      ? authHeader.slice("Bearer ".length)
      : "";

    if (!idToken) {
      return NextResponse.json(
        {
          ok: false,
          error: "Missing auth token",
        },
        { status: 401 }
      );
    }

    const decoded =
      await getAdminAuth().verifyIdToken(idToken);

    const body = await req.json();

    const challengeEntryId = String(
      body.challengeEntryId || ""
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

    if (String(entry.managerUid || "") !== decoded.uid) {
      return NextResponse.json(
        {
          ok: false,
          error: "You do not own this challenge entry",
        },
        { status: 403 }
      );
    }

    const strategyId = String(
      entry.strategyId || ""
    ).trim();

    const seasonId = String(
      entry.seasonId || ""
    ).trim();

    const tierId = entry.tierId;

    if (
      !strategyId ||
      !seasonId ||
      (tierId !== "demo_50k" &&
        tierId !== "demo_200k")
    ) {
      return NextResponse.json(
        {
          ok: false,
          error: "Challenge entry is incomplete",
        },
        { status: 409 }
      );
    }

    /*
     * Idempotency:
     * If the account was already assigned, return it.
     */
    if (entry.mt5AccountId) {
      const accountSnap = await db
        .collection("mt5Accounts")
        .doc(String(entry.mt5AccountId))
        .get();

      if (!accountSnap.exists) {
        return NextResponse.json(
          {
            ok: false,
            error:
              "Challenge entry references a missing MT5 account",
          },
          { status: 409 }
        );
      }

      const account =
        accountSnap.data() as Record<string, any>;

      return NextResponse.json({
        ok: true,
        alreadyProvisioned: true,
        challengeEntryId,
        strategyId,
        tierId,
        mt5: {
          accountId: accountSnap.id,
          accountLogin: String(account.login || ""),
          server: String(account.server || ""),
          broker: String(account.broker || ""),
          status: String(account.status || "ASSIGNED"),
        },
      });
    }

    const now = Date.now();
    const paymentReference =
      `dev_${challengeEntryId}_${now}`;

    await entryRef.set(
      {
        paid: true,
        paymentStatus: "confirmed",
        paymentProvider: "development",
        paymentReference,
        paymentConfirmedAt: now,
        updatedAt: now,
      },
      { merge: true }
    );

    const assigned =
      await MT5AssignmentService.assignNextAccount({
        managerUid: decoded.uid,
        strategyId,
        challengeEntryId,
        seasonId,
        tierId,
      });

    const batch = db.batch();

    batch.set(
      entryRef,
      {
        paid: true,
        paymentStatus: "confirmed",
        mt5AccountId: assigned.accountId,
        mt5AssignmentStatus: "assigned",
        updatedAt: now,
      },
      { merge: true }
    );

    const traderRef = db
      .collection("traders")
      .doc(decoded.uid);

    const traderSnap = await traderRef.get();

    if (traderSnap.exists) {
      batch.set(
        traderRef,
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
          challengeActivatedAt: now,
          updatedAt: now,
        },
        { merge: true }
      );
    }

    await batch.commit();

    return NextResponse.json({
      ok: true,
      alreadyProvisioned: false,
      challengeEntryId,
      strategyId,
      tierId,
      payment: {
        status: "confirmed",
        provider: "development",
        reference: paymentReference,
      },
      mt5: {
        accountId: assigned.accountId,
        accountLogin: assigned.login,
        server: assigned.server,
        broker: assigned.broker,
        status: assigned.status,
      },
    });
  } catch (error) {
    console.error("[dev-challenge-payment]", error);

    return NextResponse.json(
      {
        ok: false,
        error:
          error instanceof Error
            ? error.message
            : "Simulated payment failed",
      },
      { status: 500 }
    );
  }
}
