import { NextResponse } from "next/server";
import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

export async function POST(req: Request) {
  try {
    const secret = req.headers.get("x-bullions-secret");

    if (secret !== process.env.BULLIONS_ADMIN_SECRET) {
      return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const traderId = String(body.traderId || "").trim();
    const seasonId = String(body.seasonId || "season_01").trim();

    if (!traderId) {
      return NextResponse.json({ ok: false, error: "Missing traderId" }, { status: 400 });
    }

    const traderRef = doc(db, "traders", traderId);
    const traderSnap = await getDoc(traderRef);

    if (!traderSnap.exists()) {
      return NextResponse.json({ ok: false, error: "Trader not found" }, { status: 404 });
    }

    const trader = traderSnap.data();
    const now = Date.now();

    const activeTrader = {
      ...trader,
      status: "ACTIVE",
      verified: true,
      seasonId,
      tag: trader.tag === "Pending challenge activation" ? "Verified challenger" : trader.tag,
      updatedAt: now,
      challengeActivatedAt: now,
    };

    await setDoc(traderRef, activeTrader, { merge: true });
    await setDoc(doc(db, "leaderboardV2", traderId), activeTrader, { merge: true });

    return NextResponse.json({
      ok: true,
      message: "Trader activated",
      traderId,
      trader: activeTrader,
    });
  } catch (error: any) {
    return NextResponse.json(
      { ok: false, error: error?.message || "Trader activation failed" },
      { status: 500 }
    );
  }
}
