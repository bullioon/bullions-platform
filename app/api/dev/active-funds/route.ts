import { NextResponse } from "next/server";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "@/lib/firebase";

function requireDevSecret(req: Request) {
  const authHeader = req.headers.get("authorization");
  const expectedSecret = process.env.MT5_CRON_SECRET || process.env.CRON_SECRET;

  return Boolean(expectedSecret && authHeader === `Bearer ${expectedSecret}`);
}

export async function GET(req: Request) {
  if (!requireDevSecret(req)) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  const snap = await getDocs(
    query(collection(db, "funds"), where("status", "==", "ACTIVE"))
  );

  return NextResponse.json({
    ok: true,
    count: snap.size,
    funds: snap.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })),
  });
}
