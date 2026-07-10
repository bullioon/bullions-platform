import { NextResponse } from "next/server";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

function requireDevSecret(req: Request) {
  const authHeader = req.headers.get("authorization");
  const expectedSecret = process.env.MT5_CRON_SECRET || process.env.CRON_SECRET;

  return Boolean(expectedSecret && authHeader === `Bearer ${expectedSecret}`);
}

export async function POST(req: Request) {
  if (!requireDevSecret(req)) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const strategyId = String(body.strategyId || "").trim();
  const managerUid = String(body.managerUid || "").trim();

  if (!strategyId || !managerUid) {
    return NextResponse.json(
      { ok: false, error: "Missing strategyId or managerUid" },
      { status: 400 }
    );
  }

  await updateDoc(doc(db, "managerStrategies", strategyId), {
    "manager.uid": managerUid,
    updatedAt: Date.now(),
    updatedAtMs: Date.now(),
  });

  return NextResponse.json({
    ok: true,
    strategyId,
    managerUid,
  });
}
