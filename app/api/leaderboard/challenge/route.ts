import { NextResponse } from "next/server";

import { getAdminDb } from "@/lib/firebaseAdmin";

export async function GET() {
  try {
    const db = getAdminDb();

    const seasonSnap = await db
      .collection("challengeSeasons")
      .where("status", "in", ["registration", "active"])
      .limit(1)
      .get();

    const seasonDoc = seasonSnap.docs[0];

    if (!seasonDoc) {
      return NextResponse.json({
        ok: false,
        error: "No active challenge season",
        season: null,
        rows: [],
        topFive: [],
        pendingPayment: 0,
      });
    }

    const season = {
      id: seasonDoc.id,
      ...seasonDoc.data(),
    };

    const entriesSnap = await db
      .collection("challengeEntries")
      .where("seasonId", "==", seasonDoc.id)
      .get();

    const entries = entriesSnap.docs.map((entryDoc) => ({
      id: entryDoc.id,
      ...entryDoc.data(),
    })) as any[];

    const eligibleEntries = entries
      .filter(
        (entry) =>
          entry.paid === true &&
          entry.disqualified !== true
      )
      .sort(
        (a, b) =>
          Number(b.score || 0) - Number(a.score || 0)
      );

    const rows = await Promise.all(
      eligibleEntries.map(async (entry, index) => {
        const strategyId = String(entry.strategyId || "");

        const [strategySnap, runtimeSnap] = await Promise.all([
          db.collection("managerStrategies").doc(strategyId).get(),
          db.collection("strategyRuntimes").doc(strategyId).get(),
        ]);

        const strategy = strategySnap.exists
          ? (strategySnap.data() as any)
          : {};

        const runtime = runtimeSnap.exists
          ? (runtimeSnap.data() as any)
          : {};

        const performance =
          runtime.performance ||
          strategy.performance ||
          {};

        const scores = runtime.scores || {};
        const universe = runtime.universe || {};

        return {
          id: entry.id,
          position: index + 1,
          rank: index + 1,

          seasonId: entry.seasonId,
          strategyId,
          tierId: entry.tierId,

          paid: entry.paid === true,
          disqualified: entry.disqualified === true,
          eligibleForTopFive: index < 5,
          payoutSharePct: Number(entry.payoutSharePct || 0),

          score: Number(
            scores.challengeScore ??
            entry.score ??
            0
          ),

          strategyName:
            runtime.name ||
            strategy?.identity?.name ||
            strategy?.name ||
            "Unknown Strategy",

          strategySubtitle:
            runtime.subtitle ||
            strategy?.identity?.subtitle ||
            "",

          strategyAvatar:
            runtime.avatarUrl ||
            strategy?.identity?.avatarUrl ||
            "",

          strategyBanner:
            runtime.bannerUrl ||
            strategy?.identity?.bannerUrl ||
            "",

          managerUid:
            runtime.managerUid ||
            strategy?.manager?.uid ||
            null,

          managerName:
            strategy?.manager?.displayName ||
            strategy?.manager?.username ||
            runtime.name ||
            "Unknown Manager",

          roi: Number(performance.roi || 0),
          balance: Number(performance.balance || 0),
          equity: Number(performance.equity || 0),
          initialBalance: Number(
            performance.initialBalance || 0
          ),
          winRate: Number(performance.winRate || 0),
          profitFactor: Number(
            performance.profitFactor || 0
          ),
          maxDrawdown: Number(
            performance.maxDrawdown || 0
          ),
          totalTrades: Number(
            performance.totalTrades || 0
          ),
          openTrades: Number(
            performance.openTrades || 0
          ),

          allocatorScore: Number(
            scores.allocatorScore || 0
          ),
          riskScore: Number(
            scores.riskScore || 0
          ),
          consistencyScore: Number(
            scores.consistencyScore || 0
          ),

          runtimeGrade:
            universe.grade || "pending",

          capitalFollowing: Number(
            strategy?.performance?.capitalFollowing ||
            strategy?.capitalFollowing ||
            0
          ),

          allocators: Number(
            strategy?.performance?.allocators ||
            strategy?.allocators ||
            0
          ),

          verified:
            strategy?.status?.verified === true,

          strategyTier:
            strategy?.status?.tier || null,

          challengeStatus:
            strategy?.challenge?.status ||
            "enrolled",

          lastSyncedAt:
            performance.lastSyncedAt || null,
        };
      })
    );

    return NextResponse.json({
      ok: true,
      season,
      participants: entries.length,
      ranked: rows.length,
      pendingPayment: entries.filter(
        (entry) => entry.paid !== true
      ).length,
      rows,
      topFive: rows.slice(0, 5),
    });
  } catch (error) {
    console.error("[challenge-leaderboard]", error);

    return NextResponse.json(
      {
        ok: false,
        error:
          error instanceof Error
            ? error.message
            : "Challenge leaderboard failed",
        rows: [],
        topFive: [],
      },
      { status: 500 }
    );
  }
}
