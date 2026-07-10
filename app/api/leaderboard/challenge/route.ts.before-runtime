import { NextResponse } from "next/server";
import { doc, getDoc } from "firebase/firestore";

import { buildChallengeLeaderboard } from "@/core/v2/challenge/ChallengeLeaderboardEngine";
import { ChallengeLeaderboardRepository } from "@/core/v2/repositories/ChallengeLeaderboardRepository";
import { ChallengeRepository } from "@/core/v2/repositories/ChallengeRepository";
import { db } from "@/lib/firebase";

export async function GET() {
  const season = await ChallengeRepository.getActiveSeason();

  if (!season) {
    return NextResponse.json({
      ok: false,
      error: "No active challenge season",
      rows: [],
      topFive: [],
    });
  }

  const entries = await ChallengeLeaderboardRepository.bySeason(season.id);
  const ranked = buildChallengeLeaderboard(entries);

  const rows = await Promise.all(
    ranked.map(async (entry) => {
      const strategySnap = await getDoc(
        doc(db, "managerStrategies", entry.strategyId)
      );

      const strategy = strategySnap.exists()
        ? (strategySnap.data() as any)
        : null;

      return {
        id: entry.id,
        position: entry.position,
        seasonId: entry.seasonId,
        strategyId: entry.strategyId,
        tierId: entry.tierId,
        paid: entry.paid,
        disqualified: entry.disqualified,
        eligibleForTopFive: entry.eligibleForTopFive,
        payoutSharePct: entry.payoutSharePct,
        score: entry.score,

        strategyName: strategy?.identity?.name || "Unknown Strategy",
        strategySubtitle: strategy?.identity?.subtitle || "",
        strategyAvatar: strategy?.identity?.avatarUrl || "",
        strategyBanner: strategy?.identity?.bannerUrl || "",

        managerUid: strategy?.manager?.uid || null,
        managerName:
          strategy?.manager?.displayName ||
          strategy?.manager?.username ||
          "Unknown Manager",

        roi: strategy?.performance?.roi ?? 0,
        winRate: strategy?.performance?.winRate ?? 0,
        profitFactor: strategy?.performance?.profitFactor ?? 0,
        maxDrawdown: strategy?.performance?.maxDrawdown ?? 0,
        capitalFollowing: strategy?.performance?.capitalFollowing ?? 0,
        allocators: strategy?.performance?.allocators ?? 0,

        verified: strategy?.status?.verified ?? false,
        strategyTier: strategy?.status?.tier || null,
        challengeStatus: strategy?.challenge?.status || null,
      };
    })
  );

  return NextResponse.json({
    ok: true,
    season,
    rows,
    topFive: rows.slice(0, 5),
  });
}
