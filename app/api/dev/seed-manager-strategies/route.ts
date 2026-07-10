import { NextResponse } from "next/server";
import { collection, doc, getDocs, query, setDoc, where } from "firebase/firestore";

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

  const tradersSnap = await getDocs(collection(db, "traders"));
  const created: string[] = [];
  const skipped: string[] = [];

  for (const traderDoc of tradersSnap.docs) {
    const trader = traderDoc.data() as any;

    if (trader.status !== "ACTIVE") continue;

    const existingSnap = await getDocs(
      query(
        collection(db, "managerStrategies"),
        where("manager.uid", "==", traderDoc.id)
      )
    );

    if (!existingSnap.empty) {
      skipped.push(traderDoc.id);
      continue;
    }

    if (traderDoc.id === "ghost_alpha") {
      skipped.push("ghost_alpha_existing_managerdos");
      continue;
    }

    const strategyId = `strategy_${traderDoc.id}`;

    await setDoc(
      doc(db, "managerStrategies", strategyId),
      {
        id: strategyId,
        identity: {
          name: trader.name || traderDoc.id,
          subtitle: trader.tag || trader.style || "Verified Bullions Manager",
          description: trader.style || "Verified Bullions trading strategy.",
          avatarUrl: "",
          bannerUrl: "",
        },
        manager: {
          uid: traderDoc.id,
          username: traderDoc.id,
          displayName: trader.name || traderDoc.id,
        },
        markets: {
          primary: trader.pair || "MULTI",
          secondary: [],
        },
        investment: {
          riskProfile:
            Number(trader.maxDrawdown || 0) <= 3
              ? "Conservative"
              : Number(trader.maxDrawdown || 0) <= 6
                ? "Moderate"
                : "Aggressive",
          holdingTime: "Intraday",
          minimumAllocation: 25,
          capacity: Number(trader.initialBalance || 100000),
        },
        performance: {
          roi: Number(trader.roi || 0),
          winRate: Number(trader.winRate || 0),
          profitFactor: Number(trader.profitFactor || 0),
          maxDrawdown: Number(trader.maxDrawdown || 0),
          capitalFollowing: 0,
          allocators: 0,
        },
        status: {
          state: "published",
          visibility: "discover",
          verified: Boolean(trader.verified),
          tier: trader.challengeTier || "Tier C",
        },
        challenge: {
          status: "not_enrolled",
          challengeId: trader.challengeId || null,
          rank: null,
          eligibleForLeaderboard: false,
          entryFeeUsd: 0,
          prizeUsd: 0,
        },
        createdAt: Date.now(),
        updatedAt: Date.now(),

        name: trader.name || traderDoc.id,
        verified: Boolean(trader.verified),
        capitalFollowing: 0,
        allocators: 0,
        roi: Number(trader.roi || 0),
        maxDrawdown: Number(trader.maxDrawdown || 0),
        profitFactor: Number(trader.profitFactor || 0),
        createdAtMs: Date.now(),
        updatedAtMs: Date.now(),
      },
      { merge: true }
    );

    created.push(strategyId);
  }

  return NextResponse.json({
    ok: true,
    created,
    skipped,
  });
}
