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

export async function GET(req: Request) {
  if (!requireDevSecret(req)) {
    return NextResponse.json(
      { ok: false, error: "Unauthorized" },
      { status: 401 }
    );
  }

  const db = getAdminDb();

  const snap = await db
    .collection("challengeEntries")
    .get();

  const entries = snap.docs.map((doc) => {
    const data = doc.data() as Record<string, any>;

    return {
      id: doc.id,
      seasonId: data.seasonId || null,
      strategyId: data.strategyId || null,
      managerUid: data.managerUid || null,
      tierId: data.tierId || null,
      paid: data.paid === true,
      paymentStatus: data.paymentStatus || null,
      mt5AccountId: data.mt5AccountId || null,
      mt5AssignmentStatus:
        data.mt5AssignmentStatus || null,
      disqualified: data.disqualified === true,
      score: Number(data.score || 0),
      rank: data.rank ?? null,
    };
  });

  return NextResponse.json({
    ok: true,
    count: entries.length,
    pending: entries.filter(
      (entry) =>
        entry.paid !== true &&
        entry.disqualified !== true
    ).length,
    entries,
  });
}
