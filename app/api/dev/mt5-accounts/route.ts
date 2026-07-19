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

    const accounts = Array.isArray(body.accounts)
      ? body.accounts
      : [];

    if (!accounts.length) {
      return NextResponse.json(
        {
          ok: false,
          error: "Missing accounts array",
        },
        { status: 400 }
      );
    }

    const db = getAdminDb();
    const batch = db.batch();
    const now = Date.now();

    const created = [];

    for (const raw of accounts) {
      const login = String(raw.login || "").trim();
      const server = String(raw.server || "").trim();
      const broker = String(raw.broker || "").trim();
      const accountSize = Number(raw.accountSize || 0);

      if (
        !login ||
        !server ||
        !broker ||
        ![50000, 200000].includes(accountSize)
      ) {
        continue;
      }

      const accountId = `${broker}_${server}_${login}`
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "_");

      const accountRef = db
        .collection("mt5Accounts")
        .doc(accountId);

      batch.set(
        accountRef,
        {
          id: accountId,
          login,

          /*
           * These credentials stay server-side.
           * They are never returned by this endpoint.
           */
          password:
            raw.password != null
              ? String(raw.password)
              : null,

          investorPassword:
            raw.investorPassword != null
              ? String(raw.investorPassword)
              : null,

          server,
          broker,
          accountSize,

          status: "FREE",

          managerUid: null,
          strategyId: null,
          challengeEntryId: null,
          seasonId: null,

          assignedAt: null,
          activatedAt: null,
          releasedAt: null,
          lastSyncAt: null,

          createdAt: now,
          updatedAt: now,
        },
        { merge: true }
      );

      created.push({
        accountId,
        login,
        server,
        broker,
        accountSize,
        status: "FREE",
      });
    }

    await batch.commit();

    return NextResponse.json({
      ok: true,
      received: accounts.length,
      created: created.length,
      accounts: created,
    });
  } catch (error) {
    console.error("[dev-mt5-accounts]", error);

    return NextResponse.json(
      {
        ok: false,
        error:
          error instanceof Error
            ? error.message
            : "MT5 account import failed",
      },
      { status: 500 }
    );
  }
}

export async function GET(req: Request) {
  if (!requireDevSecret(req)) {
    return NextResponse.json(
      { ok: false, error: "Unauthorized" },
      { status: 401 }
    );
  }

  try {
    const db = getAdminDb();

    const snap = await db
      .collection("mt5Accounts")
      .get();

    return NextResponse.json({
      ok: true,
      count: snap.size,

      accounts: snap.docs.map((accountDoc) => {
        const account =
          accountDoc.data() as Record<string, any>;

        return {
          id: accountDoc.id,
          login: account.login || null,
          server: account.server || null,
          broker: account.broker || null,
          accountSize: account.accountSize || null,
          status: account.status || null,
          strategyId: account.strategyId || null,
          managerUid: account.managerUid || null,
          seasonId: account.seasonId || null,
          assignedAt: account.assignedAt || null,
        };
      }),
    });
  } catch (error) {
    console.error("[dev-mt5-accounts:get]", error);

    return NextResponse.json(
      {
        ok: false,
        error:
          error instanceof Error
            ? error.message
            : "Could not list MT5 accounts",
      },
      { status: 500 }
    );
  }
}
