import { NextResponse } from "next/server";

import { getAdminAuth } from "@/lib/firebaseAdminAuth";
import { getAdminDb } from "@/lib/firebaseAdmin";

export async function GET(req: Request) {
  try {
    const authHeader =
      req.headers.get("authorization");

    const idToken =
      authHeader?.startsWith("Bearer ")
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
      await getAdminAuth().verifyIdToken(
        idToken
      );

    const db = getAdminDb();

    const userSnap = await db
      .collection("users")
      .doc(decoded.uid)
      .get();

    if (!userSnap.exists) {
      return NextResponse.json(
        {
          ok: false,
          error: "User not found",
        },
        { status: 404 }
      );
    }

    const user =
      userSnap.data() as Record<string, any>;

    const fundId = String(
      user.activeFundId || ""
    ).trim();

    if (!fundId) {
      return NextResponse.json({
        ok: true,
        active: false,
        fundId: null,
        rows: [],
      });
    }

    const fundSnap = await db
      .collection("funds")
      .doc(fundId)
      .get();

    if (!fundSnap.exists) {
      return NextResponse.json(
        {
          ok: false,
          error: "Active fund not found",
        },
        { status: 404 }
      );
    }

    const fund =
      fundSnap.data() as Record<string, any>;

    if (
      String(fund.userId || "") !==
      decoded.uid
    ) {
      return NextResponse.json(
        {
          ok: false,
          error: "Forbidden",
        },
        { status: 403 }
      );
    }

    const performanceStartedAt = Number(
      fund.performanceStartedAt || 0
    );

    const snapshots = await db
      .collection("funds")
      .doc(fundId)
      .collection("performanceSnapshots")
      .orderBy("timestamp", "asc")
      .limit(500)
      .get();

    const rows = snapshots.docs
      .map((snapshot) => {
        const data =
          snapshot.data() as Record<
            string,
            any
          >;

        return {
          id: snapshot.id,
          timestamp: Number(
            data.timestamp || 0
          ),
          performanceStartedAt: Number(
            data.performanceStartedAt || 0
          ),
          principalUsd: Number(
            data.principalUsd || 0
          ),
          equityUsd: Number(
            data.equityUsd || 0
          ),
          pnlUsd: Number(
            data.pnlUsd || 0
          ),
          weightedRoi: Number(
            data.weightedRoi || 0
          ),
          source: String(
            data.source || "unknown"
          ),
        };
      })
      .filter(
        (row) =>
          row.timestamp > 0 &&
          row.equityUsd >= 0 &&
          (
            !performanceStartedAt ||
            row.performanceStartedAt ===
              performanceStartedAt
          )
      );

    return NextResponse.json({
      ok: true,
      active: fund.status === "ACTIVE",

      fundId,
      performanceStartedAt,

      fund: {
        principalUsd: Number(
          fund.capitalUsd || 0
        ),
        equityUsd: Number(
          fund.fundEquityUsd ||
            user.fundEquityUsd ||
            fund.capitalUsd ||
            0
        ),
        pnlUsd: Number(
          fund.fundPnlUsd ||
            user.fundPnlUsd ||
            0
        ),
        weightedRoi: Number(
          fund.weightedRoi || 0
        ),
        lastSyncedAt: Number(
          fund.lastPerformanceSyncAt || 0
        ) || null,
      },

      rows,
    });
  } catch (error) {
    console.error(
      "[fund-performance]",
      error
    );

    return NextResponse.json(
      {
        ok: false,
        error:
          error instanceof Error
            ? error.message
            : "Could not load fund performance",
      },
      { status: 500 }
    );
  }
}
