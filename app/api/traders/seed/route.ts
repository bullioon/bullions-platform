import { NextResponse } from "next/server";
import { doc, setDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { seedTraders } from "@/lib/traderSeed";

export async function GET(req: Request) {
  const secret = req.headers.get("x-bullions-secret");

  if (secret !== process.env.BULLIONS_ADMIN_SECRET) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  for (const trader of seedTraders) {
    await setDoc(doc(db, "traders", trader.id), trader, { merge: true });
    await setDoc(doc(db, "leaderboardV2", trader.id), trader, { merge: true });
  }

  return NextResponse.json({
    ok: true,
    message: "Bullions V2 traders seeded",
    count: seedTraders.length,
  });
}
