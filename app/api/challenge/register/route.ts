import { NextResponse } from "next/server";

import { getAdminAuth, getAdminDb } from "@/lib/firebaseAdmin";

type TierId = "demo_50k" | "demo_200k";

function isTierId(value: unknown): value is TierId {
  return value === "demo_50k" || value === "demo_200k";
}

export async function POST(req: Request) {
  try {
    const authHeader = req.headers.get("authorization");
    const idToken = authHeader?.startsWith("Bearer ")
      ? authHeader.slice("Bearer ".length)
      : "";

    if (!idToken) {
      return NextResponse.json(
        { ok: false, error: "Missing auth token" },
        { status: 401 }
      );
    }

    const decoded = await getAdminAuth().verifyIdToken(idToken);
    const body = await req.json();

    const strategyId = String(body.strategyId || "").trim();
    const tierId = body.tierId;

    if (!strategyId) {
      return NextResponse.json(
        { ok: false, error: "Missing strategyId" },
        { status: 400 }
      );
    }

    if (!isTierId(tierId)) {
      return NextResponse.json(
        { ok: false, error: "Invalid challenge tier" },
        { status: 400 }
      );
    }

    const db = getAdminDb();

    const seasonSnap = await db
      .collection("challengeSeasons")
      .where("status", "in", ["registration", "active"])
      .limit(1)
      .get();

    const seasonDoc = seasonSnap.docs[0];

    if (!seasonDoc) {
      return NextResponse.json(
        { ok: false, error: "No active challenge season" },
        { status: 404 }
      );
    }

    const season = seasonDoc.data() as Record<string, any>;

    if (season.status !== "registration") {
      return NextResponse.json(
        { ok: false, error: "Challenge registration is closed" },
        { status: 409 }
      );
    }

    const strategyRef = db
      .collection("managerStrategies")
      .doc(strategyId);

    const strategySnap = await strategyRef.get();

    if (!strategySnap.exists) {
      return NextResponse.json(
        { ok: false, error: "Strategy not found" },
        { status: 404 }
      );
    }

    const strategy = strategySnap.data() as Record<string, any>;
    const managerUid = String(strategy?.manager?.uid || "");

    if (!managerUid || managerUid !== decoded.uid) {
      return NextResponse.json(
        { ok: false, error: "You do not own this strategy" },
        { status: 403 }
      );
    }

    const entryId = `${seasonDoc.id}_${strategyId}`;
    const entryRef = db
      .collection("challengeEntries")
      .doc(entryId);

    const existingEntry = await entryRef.get();

    if (existingEntry.exists) {
      const existing = existingEntry.data() as Record<string, any>;

      return NextResponse.json(
        {
          ok: true,
          alreadyRegistered: true,
          entry: {
            id: entryId,
            ...existing,
          },
        },
        { status: 200 }
      );
    }

    const entriesSnap = await db
      .collection("challengeEntries")
      .where("seasonId", "==", seasonDoc.id)
      .get();

    const maxParticipants = Number(season.maxParticipants || 20);

    if (entriesSnap.size >= maxParticipants) {
      return NextResponse.json(
        { ok: false, error: "Challenge is full" },
        { status: 409 }
      );
    }

    const entryFeeUsd =
      tierId === "demo_200k" ? 1080 : 350;

    const now = Date.now();

    const entry = {
      id: entryId,
      seasonId: seasonDoc.id,
      strategyId,
      managerUid: decoded.uid,
      tierId,
      entryFeeUsd,

      paymentStatus: "pending",
      paid: false,

      mt5AssignmentStatus: "pending_payment",
      mt5AccountId: null,

      disqualified: false,
      disqualificationReason: null,

      rank: null,
      score: 0,
      eligibleForTopFive: false,
      payoutSharePct: 0,

      createdAt: now,
      updatedAt: now,
    };

    const batch = db.batch();

    batch.set(entryRef, entry);

    batch.set(
      strategyRef,
      {
        challenge: {
          status: "pending_payment",
          challengeId: seasonDoc.id,
          tierId,
          entryFeeUsd,
          eligibleForLeaderboard: false,
          eligibleForTopFive: false,
          rank: null,
          score: 0,
        },
        updatedAt: now,
        updatedAtMs: now,
      },
      { merge: true }
    );

    await batch.commit();

    return NextResponse.json({
      ok: true,
      alreadyRegistered: false,
      entry,
      checkout: {
        required: true,
        amountUsd: entryFeeUsd,
      },
    });
  } catch (error) {
    console.error("[challenge-register]", error);

    return NextResponse.json(
      {
        ok: false,
        error:
          error instanceof Error
            ? error.message
            : "Challenge registration failed",
      },
      { status: 500 }
    );
  }
}
