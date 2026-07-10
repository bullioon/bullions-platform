import { NextResponse } from "next/server";

function requireDevSecret(req: Request) {
  const authHeader = req.headers.get("authorization");
  const expectedSecret = process.env.MT5_CRON_SECRET || process.env.CRON_SECRET;

  return Boolean(expectedSecret && authHeader === `Bearer ${expectedSecret}`);
}

import { collection, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";

export async function GET(req: Request) {
  if (!requireDevSecret(req)) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  const snap = await getDocs(collection(db, "managerStrategies"));

  return NextResponse.json({
    strategies: snap.docs.map((d) => {
      const data = d.data() as any;

      return {
        id: d.id,
        name: data.identity?.name,
        managerUid: data.manager?.uid,
        roi: data.performance?.roi,
        winRate: data.performance?.winRate,
      };
    }),
  });
}
