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
    const body = await req.json();

    const login = String(body.login || "").trim();
    const server = String(body.server || "").trim();

    if (!login || !server) {
      return NextResponse.json(
        { ok: false, error: "Missing login or server" },
        { status: 400 }
      );
    }

    const db = getAdminDb();

    const strategyId =
      "aa07ccd7-bae1-471c-84ab-185d881e9f97";

    const managerUid =
      "TnTD45ieLoUfGojvBd1qAsko3563";

    const challengeEntryId =
      "season-01_aa07ccd7-bae1-471c-84ab-185d881e9f97";

    const seasonId = "season-01";

    const oldAccountId =
      "bullions_bullions_sandbox_sandbox_200000_01";

    const newAccountId =
      `octafx_${server}_${login}`
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "_");

    const oldAccountRef = db
      .collection("mt5Accounts")
      .doc(oldAccountId);

    const newAccountRef = db
      .collection("mt5Accounts")
      .doc(newAccountId);

    const strategyRef = db
      .collection("managerStrategies")
      .doc(strategyId);

    const entryRef = db
      .collection("challengeEntries")
      .doc(challengeEntryId);

    const batch = db.batch();
    const now = Date.now();

    batch.set(
      newAccountRef,
      {
        id: newAccountId,
        login,
        server,
        broker: "OctaFX",
        accountSize: 200000,

        status: "ASSIGNED",

        strategyId,
        managerUid,
        challengeEntryId,
        seasonId,

        assignedAt: now,
        activatedAt: null,
        lastSyncAt: null,

        createdAt: now,
        updatedAt: now,
      },
      { merge: true }
    );

    batch.set(
      strategyRef,
      {
        mt5: {
          accountId: newAccountId,
          accountLogin: login,
          server,
          broker: "OctaFX",
          connected: false,
          enabled: true,
          accountStatus: "ASSIGNED",
          assignedAt: now,
          lastSyncAt: null,
          lastSyncedAt: null,
        },
        updatedAt: now,
        updatedAtMs: now,
      },
      { merge: true }
    );

    batch.set(
      entryRef,
      {
        mt5AccountId: newAccountId,
        mt5AssignmentStatus: "assigned",
        eligibleForLeaderboard: true,
        updatedAt: now,
      },
      { merge: true }
    );

    batch.delete(oldAccountRef);

    await batch.commit();

    return NextResponse.json({
      ok: true,
      account: {
        id: newAccountId,
        login,
        server,
        status: "ASSIGNED",
      },
      strategyId,
      challengeEntryId,
    });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error:
          error instanceof Error
            ? error.message
            : "MT5 account replacement failed",
      },
      { status: 500 }
    );
  }
}
