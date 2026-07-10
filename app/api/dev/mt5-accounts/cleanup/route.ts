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

  const db = getAdminDb();

  const ids = [
    "octafx_octafx_demo_replace_50k_login",
    "octafx_octafx_demo_replace_200k_login",
  ];

  const batch = db.batch();

  for (const id of ids) {
    batch.delete(db.collection("mt5Accounts").doc(id));
  }

  await batch.commit();

  return NextResponse.json({
    ok: true,
    deleted: ids,
  });
}
