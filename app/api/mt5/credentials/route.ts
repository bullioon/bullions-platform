import { NextResponse } from "next/server";

import { getAdminAuth } from "@/lib/firebaseAdminAuth";
import { getAdminDb } from "@/lib/firebaseAdmin";

export async function POST(req: Request) {
  try {
    const authHeader =
      req.headers.get("authorization");

    const idToken =
      authHeader?.startsWith("Bearer ")
        ? authHeader.slice("Bearer ".length)
        : "";

    if (!idToken) {
      return NextResponse.json(
        { ok: false, error: "Missing auth token" },
        { status: 401 }
      );
    }

    const decoded =
      await getAdminAuth().verifyIdToken(idToken);

    const body = await req.json();

    const strategyId = String(
      body.strategyId || ""
    ).trim();

    if (!strategyId) {
      return NextResponse.json(
        { ok: false, error: "Missing strategyId" },
        { status: 400 }
      );
    }

    const db = getAdminDb();

    const strategySnap = await db
      .collection("managerStrategies")
      .doc(strategyId)
      .get();

    if (!strategySnap.exists) {
      return NextResponse.json(
        { ok: false, error: "Strategy not found" },
        { status: 404 }
      );
    }

    const strategy =
      strategySnap.data() as Record<string, any>;

    const managerUid = String(
      strategy?.manager?.uid || ""
    );

    if (managerUid !== decoded.uid) {
      return NextResponse.json(
        {
          ok: false,
          error: "You do not own this strategy",
        },
        { status: 403 }
      );
    }

    const accountId = String(
      strategy?.mt5?.accountId || ""
    ).trim();

    if (!accountId) {
      return NextResponse.json(
        {
          ok: false,
          error: "No MT5 account assigned",
        },
        { status: 404 }
      );
    }

    const accountSnap = await db
      .collection("mt5Accounts")
      .doc(accountId)
      .get();

    if (!accountSnap.exists) {
      return NextResponse.json(
        {
          ok: false,
          error: "Assigned MT5 account not found",
        },
        { status: 404 }
      );
    }

    const account =
      accountSnap.data() as Record<string, any>;

    if (
      String(account.managerUid || "") !==
        decoded.uid ||
      String(account.strategyId || "") !==
        strategyId
    ) {
      return NextResponse.json(
        {
          ok: false,
          error: "MT5 assignment ownership mismatch",
        },
        { status: 403 }
      );
    }

    return NextResponse.json({
      ok: true,

      mt5: {
        accountId: accountSnap.id,
        login: String(account.login || ""),
        password:
          account.password != null
            ? String(account.password)
            : null,
        investorPassword:
          account.investorPassword != null
            ? String(account.investorPassword)
            : null,
        server: String(account.server || ""),
        broker: String(account.broker || ""),
        accountSize: Number(
          account.accountSize || 0
        ),
        status: String(
          account.status || "ASSIGNED"
        ),
        lastSyncAt:
          account.lastSyncAt || null,
      },
    });
  } catch (error) {
    console.error("[mt5-credentials]", error);

    return NextResponse.json(
      {
        ok: false,
        error:
          error instanceof Error
            ? error.message
            : "Could not load MT5 credentials",
      },
      { status: 500 }
    );
  }
}
