import { NextResponse } from "next/server";
import { doc, getDoc, serverTimestamp, setDoc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .slice(0, 32);
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const userId = String(body.userId || "").trim();
    const displayName = String(body.displayName || "").trim();
    const challengeTier = String(body.challengeTier || "BULLION").toUpperCase();

    if (!userId) {
      return NextResponse.json({ ok: false, error: "Missing userId" }, { status: 400 });
    }

    if (!displayName) {
      return NextResponse.json({ ok: false, error: "Missing displayName" }, { status: 400 });
    }

    if (!["BULLION", "HELLION", "TORION", "URANIO"].includes(challengeTier)) {
      return NextResponse.json({ ok: false, error: "Invalid challengeTier" }, { status: 400 });
    }

    const userRef = doc(db, "users", userId);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) {
      return NextResponse.json({ ok: false, error: "User not found" }, { status: 404 });
    }

    const traderIdBase = slugify(displayName) || `trader_${userId.slice(0, 6)}`;
    const traderId = `${traderIdBase}_${userId.slice(0, 6)}`;

    const initialBalance =
      challengeTier === "URANIO"
        ? 200000
        : challengeTier === "TORION"
        ? 100000
        : challengeTier === "HELLION"
        ? 50000
        : 10000;

    const traderRef = doc(db, "traders", traderId);
    const now = Date.now();

    const traderProfile = {
      id: traderId,
      userId,
      name: displayName,
      tag: "Pending challenge activation",
      avatar: "⚔️",
      type: "REAL",
      status: "PENDING_CHALLENGE",
      verified: false,
      challengeTier,
      challengeId: `${challengeTier.toLowerCase()}_${initialBalance}_pending`,
      seasonId: "season_pending",
      initialBalance,
      balance: initialBalance,
      equity: initialBalance,
      roi: 0,
      maxDrawdown: 0,
      winRate: 0,
      profitFactor: 0,
      consistency: 0,
      activity: 0,
      bullionsScore: 0,
      followers: 0,
      capitalFollowing: 0,
      pair: "PENDING",
      style: "Not defined",
      mt5: {
        connected: false,
        accountLogin: null,
        server: null,
        lastSyncAt: null,
      },
      createdAt: now,
      updatedAt: now,
    };

    await setDoc(traderRef, traderProfile, { merge: true });

    await updateDoc(userRef, {
      roles: {
        investor: true,
        trader: true,
        admin: Boolean(userSnap.data()?.roles?.admin || false),
      },
      activeTraderId: traderId,
      traderAppliedAt: now,
      updatedAt: now,
    });

    await setDoc(doc(db, "traderApplications", traderId), {
      traderId,
      userId,
      displayName,
      challengeTier,
      status: "PENDING_CHALLENGE",
      createdAt: serverTimestamp(),
    });

    return NextResponse.json({
      ok: true,
      message: "Trader profile created",
      traderId,
      trader: traderProfile,
    });
  } catch (error: any) {
    return NextResponse.json(
      { ok: false, error: error?.message || "Trader application failed" },
      { status: 500 }
    );
  }
}
